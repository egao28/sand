#!/usr/bin/env bash
#
# Encode a raw screen recording into the demo assets a project detail page wants:
# a web-sized H.264 mp4 and a matching poster frame, both dropped into public/.
#
#   scripts/encode-demo.sh <source-video> <slug> [poster-seconds] [kbps]
#   scripts/encode-demo.sh almabot-demo.mov almabot 8
#
# Writes public/<slug>-demo.mp4 and public/<slug>-demo-poster.jpg.
#
# Why not ffmpeg: it isn't installed on this machine, and `swift` here fails to
# build AVFoundation against the Command Line Tools SDK. So this leans on the
# built-in avconvert for the downscale, then a small Objective-C AVFoundation
# tool (scripts/tools/) for the bitrate control avconvert's presets don't offer.
# If you ever do install ffmpeg, it can replace both stages.
#
# The encode is deterministic apart from the creation/modification timestamps
# baked into the mp4 header, so re-running on an unchanged source produces a
# file git reports as modified even though only ~13 bytes actually differ.
# `git checkout -- public/<slug>-demo.mp4` if that is all that changed.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD="$ROOT/scripts/.build"

die() {
  echo "error: $*" >&2
  exit 1
}

if [ $# -lt 2 ]; then
  sed -n '3,10p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' >&2
  exit 1
fi

SOURCE="$1"
SLUG="$2"
POSTER_AT="${3:-8}"
KBPS="${4:-800}"

[ -f "$SOURCE" ] || die "no such file: $SOURCE"
case "$SLUG" in
  *[!a-z0-9-]* | '') die "slug must be lowercase letters, digits and dashes: $SLUG" ;;
esac

MP4="$ROOT/public/$SLUG-demo.mp4"
POSTER="$ROOT/public/$SLUG-demo-poster.jpg"

# Rebuild the helpers whenever their source is newer than the binary.
mkdir -p "$BUILD"
for tool in reenc frame; do
  src="$ROOT/scripts/tools/$tool.m"
  bin="$BUILD/$tool"
  if [ ! -x "$bin" ] || [ "$src" -nt "$bin" ]; then
    echo "building $tool..."
    clang -fobjc-arc -O2 -Wno-deprecated-declarations \
      -framework AVFoundation -framework CoreMedia -framework CoreVideo \
      -framework AppKit -framework Foundation \
      -o "$bin" "$src" || die "failed to build $tool"
  fi
done

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Stage 1: avconvert caps the long edge at 1280 and normalises the container.
echo "downscaling..."
avconvert --source "$SOURCE" --preset Preset1280x720 \
  --output "$TMP/scaled.mp4" --replace >/dev/null 2>&1 ||
  die "avconvert failed on $SOURCE"

# Stage 2: re-encode at a bitrate a web page can afford. 800 kbps keeps
# screen-recorded UI text legible; raise it if fine detail smears.
echo "encoding at ${KBPS}kbps..."
"$BUILD/reenc" "$TMP/scaled.mp4" "$TMP/out.mp4" "$KBPS" || die "encode failed"

# Poster comes from the encoded file, so its dimensions match the video track
# exactly — that is what keeps the reserved box right and avoids layout shift.
echo "grabbing poster at ${POSTER_AT}s..."
if ! FRAME_OUT="$("$BUILD/frame" "$TMP/out.mp4" "$TMP/poster.jpg" "$POSTER_AT" 2>&1)"; then
  echo "$FRAME_OUT" >&2
  die "could not grab a frame at ${POSTER_AT}s — is that past the end of the clip?"
fi
DIMS="$(printf '%s\n' "$FRAME_OUT" | sed -n 's/^wrote //p')"
[ -n "$DIMS" ] || die "unexpected output from frame tool: $FRAME_OUT"

mv "$TMP/out.mp4" "$MP4"
mv "$TMP/poster.jpg" "$POSTER"

size() { du -h "$1" | cut -f1 | tr -d ' '; }

cat <<EOF

done.
  public/$SLUG-demo.mp4         $(size "$MP4")
  public/$SLUG-demo-poster.jpg  $(size "$POSTER")  ($DIMS)

next:
  - set width/height on the <video> to $DIMS, or the reserved box will be wrong
  - check the lead sentence and aria-label still describe what the clip shows
  - npm run build   (dist/ is tracked in this repo)
EOF
