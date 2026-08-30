#import <AVFoundation/AVFoundation.h>

int main(int argc, const char **argv) {
  @autoreleasepool {
    if (argc < 4) { fprintf(stderr, "usage: reenc <in> <out> <kbps>\n"); return 1; }
    NSURL *inURL = [NSURL fileURLWithPath:@(argv[1])];
    NSURL *outURL = [NSURL fileURLWithPath:@(argv[2])];
    int kbps = atoi(argv[3]);
    [[NSFileManager defaultManager] removeItemAtURL:outURL error:nil];

    AVURLAsset *asset = [AVURLAsset URLAssetWithURL:inURL options:nil];
    AVAssetTrack *vt = [asset tracksWithMediaType:AVMediaTypeVideo].firstObject;
    AVAssetTrack *at = [asset tracksWithMediaType:AVMediaTypeAudio].firstObject;
    if (!vt) { fprintf(stderr, "no video track\n"); return 1; }
    CGSize size = vt.naturalSize;
    fprintf(stderr, "in: %.0fx%.0f %.2f fps %.0f kbps dur %.1fs audio:%s\n",
            size.width, size.height, vt.nominalFrameRate,
            vt.estimatedDataRate / 1000.0, CMTimeGetSeconds(asset.duration),
            at ? "yes" : "no");

    NSError *err = nil;
    AVAssetReader *reader = [AVAssetReader assetReaderWithAsset:asset error:&err];
    if (err) { fprintf(stderr, "reader: %s\n", err.description.UTF8String); return 1; }
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
    if (err) { fprintf(stderr, "writer: %s\n", err.description.UTF8String); return 1; }
    writer.shouldOptimizeForNetworkUse = YES;  // faststart: moov atom first

    AVAssetWriterInput *vIn = [AVAssetWriterInput
        assetWriterInputWithMediaType:AVMediaTypeVideo
                       outputSettings:@{
                         AVVideoCodecKey: AVVideoCodecTypeH264,
                         AVVideoWidthKey: @((int)size.width),
                         AVVideoHeightKey: @((int)size.height),
                         AVVideoCompressionPropertiesKey: @{
                           AVVideoAverageBitRateKey: @(kbps * 1000),
                           AVVideoMaxKeyFrameIntervalKey: @(120),
                           AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
                           AVVideoAllowFrameReorderingKey: @YES,
                         }}];
    vIn.expectsMediaDataInRealTime = NO;
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
    dispatch_group_enter(group);
    [vIn requestMediaDataWhenReadyOnQueue:vq usingBlock:^{
      while (vIn.isReadyForMoreMediaData) {
        CMSampleBufferRef sb = [vOut copyNextSampleBuffer];
        if (!sb) { [vIn markAsFinished]; dispatch_group_leave(group); return; }
        [vIn appendSampleBuffer:sb];
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

    dispatch_semaphore_t sem = dispatch_semaphore_create(0);
    [writer finishWritingWithCompletionHandler:^{ dispatch_semaphore_signal(sem); }];
    dispatch_semaphore_wait(sem, DISPATCH_TIME_FOREVER);
    if (writer.status != AVAssetWriterStatusCompleted) {
      fprintf(stderr, "write failed: %s\n", writer.error.description.UTF8String);
      return 1;
    }
    fprintf(stderr, "done\n");
  }
  return 0;
}
