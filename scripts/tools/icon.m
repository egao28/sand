// Draw the logo centred on a flat background at an exact pixel size. Used for
// the favicons and the social preview card, which all need the mark composited
// onto opaque paper — a bare transparent PNG turns into a black smear in a dark
// tab strip and an unpredictable slab in a LinkedIn card.
//
//   icon <in.png> <out.png|out.jpg> <width> <height> <bg-hex> <crop-pct> <fill> [thicken]
//
// crop-pct trims that percentage off each edge of the source before drawing
// (the logo export carries a faint frame), and fill is the fraction of the
// canvas the mark is allowed to occupy.
//
// thicken is the number of output pixels to fatten the strokes by before the
// final downscale, and only matters for the 32px favicon: the logo is a thin
// pen line, and scaling it straight down leaves antialiasing to average each
// stroke into a pale smudge. Leave it at 0 for anything 180px or larger.

#import <AppKit/AppKit.h>
#import <CoreImage/CoreImage.h>

// Supersampling factor used when thickening, so the morphology filter has
// enough resolution to grow a stroke by a fraction of an output pixel.
static const CGFloat kThickenScale = 8.0;

static BOOL parseHex(const char *hex, CGFloat *r, CGFloat *g, CGFloat *b) {
  if (*hex == '#') hex++;
  if (strlen(hex) != 6) return NO;
  char *end = NULL;
  long v = strtol(hex, &end, 16);
  if (end && *end != '\0') return NO;
  *r = ((v >> 16) & 0xff) / 255.0;
  *g = ((v >> 8) & 0xff) / 255.0;
  *b = (v & 0xff) / 255.0;
  return YES;
}

static BOOL parseNumber(const char *s, double min, double max, double *out) {
  char *end = NULL;
  double v = strtod(s, &end);
  if (*s == '\0' || (end && *end != '\0') || !isfinite(v) || v < min || v > max) return NO;
  *out = v;
  return YES;
}

int main(int argc, const char **argv) {
  @autoreleasepool {
    if (argc < 8) {
      fprintf(stderr,
              "usage: icon <in> <out> <width> <height> <bg-hex> <crop-pct> <fill> [thicken]\n");
      return 1;
    }
    NSString *outPath = @(argv[2]);

    double width, height, cropPct, fill, thicken = 0;
    CGFloat bgR, bgG, bgB;
    if (!parseNumber(argv[3], 1, 8192, &width) || !parseNumber(argv[4], 1, 8192, &height)) {
      fprintf(stderr, "icon: width and height must be 1-8192 pixels\n");
      return 1;
    }
    if (!parseHex(argv[5], &bgR, &bgG, &bgB)) {
      fprintf(stderr, "icon: bg must be a six-digit hex colour, got \"%s\"\n", argv[5]);
      return 1;
    }
    if (!parseNumber(argv[6], 0, 45, &cropPct)) {
      fprintf(stderr, "icon: crop-pct must be 0-45, got \"%s\"\n", argv[6]);
      return 1;
    }
    if (!parseNumber(argv[7], 0.05, 1, &fill)) {
      fprintf(stderr, "icon: fill must be 0.05-1, got \"%s\"\n", argv[7]);
      return 1;
    }
    if (argc > 8 && !parseNumber(argv[8], 0, 4, &thicken)) {
      fprintf(stderr, "icon: thicken must be 0-4 output pixels, got \"%s\"\n", argv[8]);
      return 1;
    }
    CGFloat ss = thicken > 0 ? kThickenScale : 1.0;

    NSImage *src = [[NSImage alloc] initWithContentsOfFile:@(argv[1])];
    NSImageRep *rep = src.representations.firstObject;
    if (!src || !rep) {
      fprintf(stderr, "icon: could not read %s as an image\n", argv[1]);
      return 1;
    }
    // NSImage.size is DPI-scaled; pin it to the pixel grid so the fromRect
    // below is expressed in the same units the file actually stores.
    NSSize pixels = NSMakeSize(rep.pixelsWide, rep.pixelsHigh);
    src.size = pixels;

    CGFloat crop = cropPct / 100.0;
    NSRect from = NSMakeRect(pixels.width * crop, pixels.height * crop,
                             pixels.width * (1 - 2 * crop), pixels.height * (1 - 2 * crop));

    // Everything below is laid out on the supersampled stage; it collapses to
    // the requested size when thickening is off, because then ss is 1.
    CGFloat stageW = round(width * ss), stageH = round(height * ss);

    // Contain-fit, so a wide mark on a square canvas keeps its proportions.
    CGFloat scale = MIN(stageW * fill / from.size.width, stageH * fill / from.size.height);
    CGFloat drawW = round(from.size.width * scale), drawH = round(from.size.height * scale);
    NSRect to =
        NSMakeRect(round((stageW - drawW) / 2), round((stageH - drawH) / 2), drawW, drawH);

    NSBitmapImageRep *canvas =
        [[NSBitmapImageRep alloc] initWithBitmapDataPlanes:NULL
                                                pixelsWide:(NSInteger)stageW
                                                pixelsHigh:(NSInteger)stageH
                                             bitsPerSample:8
                                           samplesPerPixel:4
                                                  hasAlpha:YES
                                                  isPlanar:NO
                                            colorSpaceName:NSDeviceRGBColorSpace
                                               bytesPerRow:0
                                              bitsPerPixel:0];
    canvas.size = NSMakeSize(stageW, stageH);

    [NSGraphicsContext saveGraphicsState];
    NSGraphicsContext *ctx = [NSGraphicsContext graphicsContextWithBitmapImageRep:canvas];
    [NSGraphicsContext setCurrentContext:ctx];
    ctx.imageInterpolation = NSImageInterpolationHigh;
    [[NSColor colorWithDeviceRed:bgR green:bgG blue:bgB alpha:1.0] setFill];
    NSRectFill(NSMakeRect(0, 0, stageW, stageH));
    [src drawInRect:to fromRect:from operation:NSCompositingOperationSourceOver fraction:1.0];
    [ctx flushGraphics];
    [NSGraphicsContext restoreGraphicsState];

    if (thicken > 0) {
      // A minimum filter spreads the darkest neighbour outward, which on dark
      // ink over pale paper is exactly "make the pen wider". Doing it here,
      // before the downscale, is what leaves a stroke to average.
      CIImage *image = [[CIImage alloc] initWithBitmapImageRep:canvas];
      image = [image imageByApplyingFilter:@"CIMorphologyMinimum"
                       withInputParameters:@{@"inputRadius" : @(thicken * ss / 2)}];
      image = [image imageByApplyingFilter:@"CILanczosScaleTransform"
                       withInputParameters:@{@"inputScale" : @(1.0 / ss)}];
      CGImageRef scaled = [[CIContext contextWithOptions:nil]
          createCGImage:image
               fromRect:CGRectMake(0, 0, width, height)];
      if (!scaled) {
        fprintf(stderr, "icon: could not downscale the thickened mark\n");
        return 1;
      }
      canvas = [[NSBitmapImageRep alloc] initWithCGImage:scaled];
      CGImageRelease(scaled);
    }

    BOOL jpeg = [outPath.pathExtension.lowercaseString hasPrefix:@"jp"];
    NSData *data = [canvas representationUsingType:(jpeg ? NSBitmapImageFileTypeJPEG
                                                         : NSBitmapImageFileTypePNG)
                                        properties:(jpeg ? @{NSImageCompressionFactor : @(0.9)}
                                                         : @{})];
    if (!data) {
      fprintf(stderr, "icon: could not encode %s\n", argv[2]);
      return 1;
    }

    NSError *err = nil;
    if (![data writeToFile:outPath options:NSDataWritingAtomic error:&err]) {
      fprintf(stderr, "icon: could not write %s: %s\n", argv[2],
              err.localizedDescription.UTF8String);
      return 1;
    }
    fprintf(stderr, "wrote %.0fx%.0f\n", width, height);
  }
  return 0;
}
