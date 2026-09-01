// Re-encode a video at an explicit bitrate. AVFoundation's export presets do
// not expose one, which is the whole reason this exists.
//
//   reenc <in> <out> <kbps> [fps]
//
// fps thins the frames down to at most that rate before encoding. Screen
// recordings arrive at whatever the display runs at — 33, 47, 60 — which is a
// lot of near-identical frames of a mostly static UI. Halving the rate frees
// the same bitrate to make each remaining frame sharper, or buys a much
// smaller file at the quality you already had. Omit it to keep every frame.

#import <AVFoundation/AVFoundation.h>

int main(int argc, const char **argv) {
  @autoreleasepool {
    if (argc < 4) { fprintf(stderr, "usage: reenc <in> <out> <kbps> [fps]\n"); return 1; }
    NSURL *inURL = [NSURL fileURLWithPath:@(argv[1])];
    NSURL *outURL = [NSURL fileURLWithPath:@(argv[2])];

    char *end = NULL;
    long kbps = strtol(argv[3], &end, 10);
    if (*argv[3] == '\0' || (end && *end != '\0') || kbps <= 0 || kbps > 100000) {
      fprintf(stderr, "reenc: kbps must be a positive integer, got \"%s\"\n", argv[3]);
      return 1;
    }
    double fps = 0;
    if (argc > 4) {
      end = NULL;
      fps = strtod(argv[4], &end);
      if (*argv[4] == '\0' || (end && *end != '\0') || !isfinite(fps) || fps <= 0 || fps > 240) {
        fprintf(stderr, "reenc: fps must be a positive number up to 240, got \"%s\"\n", argv[4]);
        return 1;
      }
    }
    [[NSFileManager defaultManager] removeItemAtURL:outURL error:nil];

    AVURLAsset *asset = [AVURLAsset URLAssetWithURL:inURL options:nil];
    AVAssetTrack *vt = [asset tracksWithMediaType:AVMediaTypeVideo].firstObject;
    AVAssetTrack *at = [asset tracksWithMediaType:AVMediaTypeAudio].firstObject;
    if (!vt) { fprintf(stderr, "reenc: no video track in %s\n", argv[1]); return 1; }
    CGSize size = vt.naturalSize;
    fprintf(stderr, "in: %.0fx%.0f %.2f fps %.0f kbps dur %.1fs audio:%s\n",
            size.width, size.height, vt.nominalFrameRate,
            vt.estimatedDataRate / 1000.0, CMTimeGetSeconds(asset.duration),
            at ? "yes" : "no");

    NSError *err = nil;
    AVAssetReader *reader = [AVAssetReader assetReaderWithAsset:asset error:&err];
    if (err) { fprintf(stderr, "reenc: reader: %s\n", err.description.UTF8String); return 1; }
    AVAssetReaderTrackOutput *vOut = [AVAssetReaderTrackOutput
        assetReaderTrackOutputWithTrack:vt
                         outputSettings:@{(id)kCVPixelBufferPixelFormatTypeKey:
                                            @(kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange)}];
    vOut.alwaysCopiesSampleData = NO;
    [reader addOutput:vOut];
    AVAssetReaderTrackOutput *aOut = nil;
    if (at) {
      aOut = [AVAssetReaderTrackOutput
          assetReaderTrackOutputWithTrack:at
                           outputSettings:@{AVFormatIDKey: @(kAudioFormatLinearPCM)}];
      aOut.alwaysCopiesSampleData = NO;
      [reader addOutput:aOut];
    }

    AVAssetWriter *writer = [AVAssetWriter assetWriterWithURL:outURL
                                                     fileType:AVFileTypeMPEG4
                                                        error:&err];
    if (err) { fprintf(stderr, "reenc: writer: %s\n", err.description.UTF8String); return 1; }
    writer.shouldOptimizeForNetworkUse = YES;  // faststart: moov atom first

    NSMutableDictionary *compression = [@{
      AVVideoAverageBitRateKey: @(kbps * 1000),
      // Also cap it in seconds: the frame count alone would stretch to an
      // 8-second gap once the rate is thinned, making seeking coarse.
      AVVideoMaxKeyFrameIntervalKey: @(120),
      AVVideoMaxKeyFrameIntervalDurationKey: @(4.0),
      AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
      AVVideoAllowFrameReorderingKey: @YES,
    } mutableCopy];
    // Tell rate control what it is actually being fed, or it budgets bits for
    // the source's frame rate and undershoots the target.
    if (fps > 0) compression[AVVideoExpectedSourceFrameRateKey] = @((int)round(fps));

    AVAssetWriterInput *vIn = [AVAssetWriterInput
        assetWriterInputWithMediaType:AVMediaTypeVideo
                       outputSettings:@{
                         AVVideoCodecKey: AVVideoCodecTypeH264,
                         AVVideoWidthKey: @((int)size.width),
                         AVVideoHeightKey: @((int)size.height),
                         AVVideoCompressionPropertiesKey: compression,
                       }];
    vIn.expectsMediaDataInRealTime = NO;
    // Identity for macOS screen recordings, but a phone-captured source carries
    // its orientation here — without it the output comes out sideways.
    vIn.transform = vt.preferredTransform;
    [writer addInput:vIn];
    AVAssetWriterInput *aIn = nil;
    if (at) {
      aIn = [AVAssetWriterInput assetWriterInputWithMediaType:AVMediaTypeAudio
                                              outputSettings:@{
                                                AVFormatIDKey: @(kAudioFormatMPEG4AAC),
                                                AVNumberOfChannelsKey: @(1),
                                                AVSampleRateKey: @(44100.0),
                                                AVEncoderBitRateKey: @(64000),
                                              }];
      aIn.expectsMediaDataInRealTime = NO;
      [writer addInput:aIn];
    }

    [writer startWriting];
    [writer startSessionAtSourceTime:kCMTimeZero];
    [reader startReading];

    dispatch_group_t group = dispatch_group_create();
    dispatch_queue_t vq = dispatch_queue_create("v", NULL);
    // Written only on vq, read only after the group wait below.
    __block CMTime lastPTS = kCMTimeZero;
    __block long long readFrames = 0, keptFrames = 0;
    // Keep the first frame at or after each slot on a fixed 1/fps schedule, and
    // advance the schedule rather than measuring from the frame we just kept.
    // Measuring from the kept frame compounds the rounding: a 32.93fps source
    // has no frame exactly 1/15s after the last one, so every slot lands a
    // little late, and the gate then rejects the next candidate too — 15fps
    // asked for, 9.4fps delivered. Against the schedule the error cannot
    // accumulate, and the rate comes out right on average.
    double slot = fps > 0 ? 1.0 / fps : 0;
    __block double nextWanted = 0;
    dispatch_group_enter(group);
    [vIn requestMediaDataWhenReadyOnQueue:vq usingBlock:^{
      while (vIn.isReadyForMoreMediaData) {
        CMSampleBufferRef sb = [vOut copyNextSampleBuffer];
        if (!sb) { [vIn markAsFinished]; dispatch_group_leave(group); return; }
        CMTime pts = CMSampleBufferGetPresentationTimeStamp(sb);
        readFrames++;
        lastPTS = pts;
        if (slot > 0) {
          if (CMTimeGetSeconds(pts) < nextWanted) {
            CFRelease(sb);
            continue;
          }
          nextWanted += slot;
          // A long gap in the source (a paused recording) would otherwise leave
          // the schedule behind and wave through a burst of frames to catch up.
          if (nextWanted < CMTimeGetSeconds(pts)) nextWanted = CMTimeGetSeconds(pts) + slot;
        }
        [vIn appendSampleBuffer:sb];
        keptFrames++;
        CFRelease(sb);
      }
    }];
    if (aIn) {
      dispatch_queue_t aq = dispatch_queue_create("a", NULL);
      dispatch_group_enter(group);
      [aIn requestMediaDataWhenReadyOnQueue:aq usingBlock:^{
        while (aIn.isReadyForMoreMediaData) {
          CMSampleBufferRef sb = [aOut copyNextSampleBuffer];
          if (!sb) { [aIn markAsFinished]; dispatch_group_leave(group); return; }
          [aIn appendSampleBuffer:sb];
          CFRelease(sb);
        }
      }];
    }
    dispatch_group_wait(group, DISPATCH_TIME_FOREVER);

    // copyNextSampleBuffer returning nil means end-of-stream OR a read failure,
    // and the two are indistinguishable from the append loop. Without this
    // check a corrupt or truncated source yields a silently short video that
    // still finishes writing cleanly and exits 0.
    if (reader.status != AVAssetReaderStatusCompleted) {
      fprintf(stderr, "reenc: read failed %.1fs into a %.1fs source: %s\n",
              CMTimeGetSeconds(lastPTS), CMTimeGetSeconds(asset.duration),
              reader.error ? reader.error.description.UTF8String : "unknown error");
      [writer cancelWriting];
      [[NSFileManager defaultManager] removeItemAtURL:outURL error:nil];
      return 1;
    }

    dispatch_semaphore_t sem = dispatch_semaphore_create(0);
    [writer finishWritingWithCompletionHandler:^{ dispatch_semaphore_signal(sem); }];
    dispatch_semaphore_wait(sem, DISPATCH_TIME_FOREVER);
    if (writer.status != AVAssetWriterStatusCompleted) {
      fprintf(stderr, "reenc: write failed: %s\n", writer.error.description.UTF8String);
      [[NSFileManager defaultManager] removeItemAtURL:outURL error:nil];
      return 1;
    }
    if (slot > 0) {
      fprintf(stderr, "kept %lld of %lld frames (%.1f fps)\n", keptFrames, readFrames,
              keptFrames / CMTimeGetSeconds(asset.duration));
    }
    fprintf(stderr, "done\n");
  }
  return 0;
}
