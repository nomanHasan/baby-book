#!/usr/bin/env bash
set -euo pipefail

# === CONFIG ===
NUM_IMAGES="${1:-10}"                  # how many images to capture (default 10)
TARGET_DIR="${2:-/mnt/Working_Directory/Workspaces/React_Workspace/baby-book/books/Raindrop Baton & Reed Stage}"  # where to save files
FILE_PREFIX="${3:-storybook}"          # filename prefix
RIGHT_CLICK_X=1375                     # X coordinate for right click (image area)
RIGHT_CLICK_Y=800                      # Y coordinate for right click (image area)
NEXT_IMAGE_X=1622                      # X coordinate for next image button
NEXT_IMAGE_Y=260                       # Y coordinate for next image button
PAUSE=250                              # ms between steps

# Helper: sleep in ms
msleep() { perl -e "select(undef,undef,undef,$1/1000)"; }

# Helper: decide which mime/extension is available in clipboard and write file
save_clipboard_image() {
  local outbase="$1"
  local targets; targets="$(xclip -selection clipboard -o -t TARGETS 2>/dev/null || true)"

  # Pick mime by preference order
  local mime ext
  if   echo "$targets" | grep -qi '^image/png$'; then  mime='image/png';  ext='png'
  elif echo "$targets" | grep -qi '^image/jpeg$'; then mime='image/jpeg'; ext='jpg'
  elif echo "$targets" | grep -qi '^image/webp$'; then mime='image/webp'; ext='webp'
  elif echo "$targets" | grep -qi '^image/gif$'; then  mime='image/gif';  ext='gif'
  else
    echo "Clipboard doesn't contain a known image type; targets were:
$targets" >&2
    return 1
  fi

  # Compute size without writing to disk (read from clipboard and count bytes)
  local size_bytes
  size_bytes="$(xclip -selection clipboard -t "$mime" -o 2>/dev/null | wc -c | tr -d ' ')"
  if [[ -z "$size_bytes" || "$size_bytes" -eq 0 ]]; then
    echo "Clipboard reports $mime but no data bytes; skipping." >&2
    return 1
  fi

  local outfile="${outbase}.${ext}"
  # Write clipboard image to disk
  xclip -selection clipboard -t "$mime" -o > "$outfile"
  echo "Saved: $outfile ($mime, ${size_bytes} bytes)"
}

# Create output directory
mkdir -p "$TARGET_DIR"
echo "Saving images to: $TARGET_DIR"

# === MAIN AUTOMATION LOOP ===
echo "Starting automated image capture..."
echo "Right-click coordinates: ($RIGHT_CLICK_X, $RIGHT_CLICK_Y)"
echo "Next image coordinates: ($NEXT_IMAGE_X, $NEXT_IMAGE_Y)"

for i in $(seq 1 "$NUM_IMAGES"); do
  echo "=== Image $i/$NUM_IMAGES ==="
  
  # Step 1: Right click on image coordinates (1375, 800)
  msleep 300
  echo "Right-clicking at ($RIGHT_CLICK_X, $RIGHT_CLICK_Y) to open context menu..."
  xdotool mousemove "$RIGHT_CLICK_X" "$RIGHT_CLICK_Y"
  msleep 120
  xdotool click 3
  msleep 300

  # Step 2: Navigate context menu - 3 arrow downs, then click (Copy Image)
  echo "Navigating context menu: 3 down arrows + Enter..."
  xdotool key Down
  msleep 100
  xdotool key Down
  msleep 100
  xdotool key Down
  msleep 150
  xdotool key Return
  msleep 400

  # Step 3: Save the image from clipboard
  echo "Saving image from clipboard..."
  if ! save_clipboard_image "$TARGET_DIR/$FILE_PREFIX-$i"; then
    echo "No image on clipboard for capture $i; skipping." >&2
  fi

  # Step 4: Click next image button (except for the last iteration)
  if [[ "$i" -lt "$NUM_IMAGES" ]]; then
    echo "Clicking next image button at ($NEXT_IMAGE_X, $NEXT_IMAGE_Y)..."
    xdotool mousemove "$NEXT_IMAGE_X" "$NEXT_IMAGE_Y"
    msleep 120
    xdotool click 1
    msleep "$PAUSE"
  fi
done

echo "Done. Files saved in: $TARGET_DIR"
echo "Captured $NUM_IMAGES images with prefix: $FILE_PREFIX"
