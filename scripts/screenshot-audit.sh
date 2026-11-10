#!/usr/bin/env bash
set -e

# Default platforms to audit
PLATFORMS=("emery" "basalt" "chalk" "diorite" "gabbro")
if [ "$#" -gt 0 ]; then
  PLATFORMS=("$@")
fi

OUT_DIR="screenshots/audit"
mkdir -p "$OUT_DIR"

echo "=================================================="
echo " Starting Status Bar Icon Screenshot Audit"
echo " Platforms: ${PLATFORMS[*]}"
echo " Output dir: $OUT_DIR"
echo "=================================================="

echo "==> Building project with latest assets..."
pebble build

for platform in "${PLATFORMS[@]}"; do
  echo ""
  echo "==> Auditing platform: $platform"

  # Install & launch in emulator
  pebble install --emulator "$platform"
  sleep 2

  # 1. State 0: Connected
  echo "   [1/3] Capturing connected..."
  pebble screenshot "$OUT_DIR/${platform}_connected.png" --emulator "$platform"

  # 2. State 1: Quiet Time (DND) via emu-tap
  echo "   [2/3] Tapping emulator for Quiet Time (DND)..."
  pebble emu-tap --emulator "$platform"
  sleep 0.8
  pebble screenshot "$OUT_DIR/${platform}_dnd.png" --emulator "$platform"

  # 3. State 2: Disconnected via emu-tap
  echo "   [3/3] Tapping emulator for Disconnected..."
  pebble emu-tap --emulator "$platform"
  sleep 0.8
  pebble screenshot "$OUT_DIR/${platform}_disconnected.png" --emulator "$platform"

  # Optional: close emulator
  pebble kill --emulator "$platform" 2>/dev/null || true
done

echo ""
echo "=================================================="
echo " All screenshots captured in $OUT_DIR"
echo "=================================================="

# Check if magick is available to create a comparison montage
if command -v magick &>/dev/null; then
  echo "==> Generating comparisons at true pixel size (1:1)..."

  # Gather platform screenshots in order (connected, dnd, disconnected per platform row)
  IMAGE_FILES=()
  for p in "${PLATFORMS[@]}"; do
    IMAGE_FILES+=(
      "$OUT_DIR/${p}_connected.png"
      "$OUT_DIR/${p}_dnd.png"
      "$OUT_DIR/${p}_disconnected.png"
    )
  done

  # 1. Full watchface comparison grid at true 1:1 pixel size
  magick montage "${IMAGE_FILES[@]}" \
    -tile 3x -geometry +4+4 \
    -label '%t' "$OUT_DIR/comparison_grid.png"

  # 2. Cropped top-band comparison at true 1:1 pixel size
  magick montage "${IMAGE_FILES[@]}" \
    -tile 3x -gravity North -crop 100%x24+0+0 +repage \
    -geometry +4+4 \
    -label '%t' "$OUT_DIR/comparison_top_band.png"

  echo "==> Saved full comparison grid to: $OUT_DIR/comparison_grid.png"
  echo "==> Saved cropped top band comparison to: $OUT_DIR/comparison_top_band.png"
fi
