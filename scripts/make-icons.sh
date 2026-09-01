#!/usr/bin/env bash
#
# Regenerate the favicons and the social preview card from logo.png.
#
#   scripts/make-icons.sh
#
# Writes public/favicon-32.png, public/favicon-192.png,
# public/apple-touch-icon.png and public/og-image.jpg.
#
# Run this after replacing logo.png, then commit what it produces — the outputs
# are tracked so a deploy never has to run a Mac-only toolchain. Like
# encode-demo.sh this leans on a small Objective-C AppKit helper rather than
# ImageMagick, which isn't installed on this machine.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD="$ROOT/scripts/.build"

die() {
  echo "error: $*" >&2
  exit 1
}

SOURCE="$ROOT/logo.png"

# --paper from assets/styles.css. The mark is composited onto it rather than
# left transparent so the tab icon and the LinkedIn card both sit on the same
# ground the site does.
BG="FFFDF8"
# Matches the clip-path: inset(5.5%) the nav applies to the same file, which
# trims the faint frame the export carries.
CROP="5.5"

[ -f "$SOURCE" ] || die "no such file: $SOURCE"
command -v clang >/dev/null || die "clang not found — install the Xcode Command Line Tools"

mkdir -p "$BUILD"
src="$ROOT/scripts/tools/icon.m"
bin="$BUILD/icon"
if [ ! -x "$bin" ] || [ "$src" -nt "$bin" ]; then
  echo "building icon..."
  clang -fobjc-arc -O2 -Wno-deprecated-declarations \
    -framework AppKit -framework CoreImage -framework Foundation \
    -o "$bin" "$src" || die "failed to build icon"
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# name  width height fill
#
# The favicons run tighter than the card: at 32px the mark needs every pixel it
# can get, while the 1200x630 card wants the logo floating in paper the way the
# site's own layouts do.
render() {
  local out="$1" w="$2" h="$3" fill="$4" thicken="${5:-0}"
  "$BUILD/icon" "$SOURCE" "$TMP/$out" "$w" "$h" "$BG" "$CROP" "$fill" "$thicken" >/dev/null ||
    die "could not render $out"
  mv "$TMP/$out" "$ROOT/public/$out"
  echo "  public/$out"
}

echo "rendering..."
render favicon-32.png 32 32 0.94 0.75
render favicon-192.png 192 192 0.88
render apple-touch-icon.png 180 180 0.76
render og-image.jpg 1200 630 0.46

cat <<'EOF'

done. index.html already points at these paths; nothing to wire up.

next:
  - if you changed og-image.jpg, re-scrape the card so the caches update:
    https://www.linkedin.com/post-inspector/ and https://cards-dev.twitter.com/validator
EOF
