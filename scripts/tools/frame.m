// Extract a single frame as a JPEG. Used for the <video> poster, so the frame
// must come from the encoded file — its dimensions are what the page reserves.
//
//   frame <in> <out.jpg> <seconds>

#import <AVFoundation/AVFoundation.h>
#import <AppKit/AppKit.h>

int main(int argc, const char **argv) {
  @autoreleasepool {
    if (argc < 4) { fprintf(stderr, "usage: frame <in> <out.jpg> <seconds>\n"); return 1; }
    NSURL *inURL = [NSURL fileURLWithPath:@(argv[1])];
    NSURL *outURL = [NSURL fileURLWithPath:@(argv[2])];

    char *end = NULL;
    double at = strtod(argv[3], &end);
    if (*argv[3] == '\0' || (end && *end != '\0') || !isfinite(at) || at < 0) {
      fprintf(stderr, "frame: seconds must be a non-negative number, got \"%s\"\n", argv[3]);
      return 1;
    }

    AVURLAsset *asset = [AVURLAsset URLAssetWithURL:inURL options:nil];
    AVAssetImageGenerator *gen = [AVAssetImageGenerator assetImageGeneratorWithAsset:asset];
    gen.appliesPreferredTrackTransform = YES;
    gen.requestedTimeToleranceBefore = kCMTimeZero;
    gen.requestedTimeToleranceAfter = kCMTimeZero;
    NSError *err = nil;
    CGImageRef img = [gen copyCGImageAtTime:CMTimeMakeWithSeconds(at, 600) actualTime:NULL error:&err];
    if (!img) {
      fprintf(stderr, "frame: %s\n", err.description.UTF8String);
      return 1;
    }
    size_t w = CGImageGetWidth(img), h = CGImageGetHeight(img);

    NSBitmapImageRep *rep = [[NSBitmapImageRep alloc] initWithCGImage:img];
    NSData *data = [rep representationUsingType:NSBitmapImageFileTypeJPEG
                                     properties:@{NSImageCompressionFactor: @(0.82)}];
    CGImageRelease(img);
    if (!data) { fprintf(stderr, "frame: could not encode JPEG\n"); return 1; }

    // Report success only once the bytes are actually on disk. The caller moves
    // the video into place based on this, so a swallowed write error here would
    // pair a new video with a stale poster.
    if (![data writeToURL:outURL options:NSDataWritingAtomic error:&err]) {
      fprintf(stderr, "frame: could not write %s: %s\n",
              argv[2], err.localizedDescription.UTF8String);
      return 1;
    }
    fprintf(stderr, "wrote %zux%zu\n", w, h);
  }
  return 0;
}
