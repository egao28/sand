#import <AVFoundation/AVFoundation.h>
#import <AppKit/AppKit.h>

int main(int argc, const char **argv) {
  @autoreleasepool {
    NSURL *inURL = [NSURL fileURLWithPath:@(argv[1])];
    NSURL *outURL = [NSURL fileURLWithPath:@(argv[2])];
    double at = atof(argv[3]);
    AVURLAsset *asset = [AVURLAsset URLAssetWithURL:inURL options:nil];
    AVAssetImageGenerator *gen = [AVAssetImageGenerator assetImageGeneratorWithAsset:asset];
    gen.appliesPreferredTrackTransform = YES;
    gen.requestedTimeToleranceBefore = kCMTimeZero;
    gen.requestedTimeToleranceAfter = kCMTimeZero;
    NSError *err = nil;
    CGImageRef img = [gen copyCGImageAtTime:CMTimeMakeWithSeconds(at, 600) actualTime:NULL error:&err];
    if (!img) { fprintf(stderr, "fail: %s\n", err.description.UTF8String); return 1; }
    NSBitmapImageRep *rep = [[NSBitmapImageRep alloc] initWithCGImage:img];
    NSData *data = [rep representationUsingType:NSBitmapImageFileTypeJPEG
                                     properties:@{NSImageCompressionFactor: @(0.82)}];
    [data writeToURL:outURL atomically:YES];
    fprintf(stderr, "wrote %zux%zu\n", CGImageGetWidth(img), CGImageGetHeight(img));
    CGImageRelease(img);
  }
  return 0;
}
