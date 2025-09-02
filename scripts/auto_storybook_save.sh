#!/usr/bin/env bash
set -euo pipefail

# === CONFIG ===
NUM_TABS="${1:-9}"                     # how many tabs to iterate
TARGET_DIR="${2:-/mnt/Working_Directory/Workspaces/React_Workspace/baby-book/books/Rooftop Story Cloud}"  # where to save files
FILE_PREFIX="${3:-grab}"                # filename prefix
CLICK_TO_FOCUS=true                      # click center before copying
PAUSE=250                                # ms between steps

# Helper: detect if a window is a Chrome/Chromium window
is_chrome_window() {
  local wid="$1"
  local wm_class
  wm_class="$(xprop -id "$wid" WM_CLASS 2>/dev/null | tr -d '\n' || true)"
  grep -qi 'google-chrome\|chromium' <<<"$wm_class"
}

# Helper: detect if a window is viewable (mapped)
is_visible_window() {
  local wid="$1"
  xwininfo -id "$wid" 2>/dev/null | grep -q "IsViewable"
}

# Helper: pick the last-interacted Chrome window. Prefer active if Chrome, else scan stacking top-down
get_last_interacted_chrome_window() {
  local active
  active="$(xdotool getactivewindow 2>/dev/null || true)"
  if [[ -n "$active" ]] && is_chrome_window "$active"; then
    echo "$active"
    return 0
  fi

  # Scan stacking from top (last item is topmost)
  local ids arr=()
  ids="$(xprop -root _NET_CLIENT_LIST_STACKING 2>/dev/null | grep -o '0x[0-9a-fA-F]\+' || true)"
  for id in $ids; do arr+=("$id"); done
  for (( idx=${#arr[@]}-1; idx>=0; idx-- )); do
    local wid="${arr[$idx]}"
    if is_chrome_window "$wid" && is_visible_window "$wid"; then
      echo "$wid"
      return 0
    fi
  done

  # Fallback: first visible Chrome by class
  local fallback
  fallback="$(xdotool search --onlyvisible --class 'google-chrome' | head -n1 || true)"
  if [[ -z "$fallback" ]]; then
    fallback="$(xdotool search --onlyvisible --class 'chromium' | head -n1 || true)"
  fi
  [[ -n "$fallback" ]] && echo "$fallback"
}

# === LOCATE WINDOWS ===
CHROME_WIN="$(get_last_interacted_chrome_window || true)"
if [[ -z "$CHROME_WIN" ]]; then
  echo "Could not find a visible Chrome/Chromium window (and none matched by title)." >&2
  exit 1
fi

# Create output directory
mkdir -p "$TARGET_DIR"
echo "Saving images to: $TARGET_DIR"

# Helper: sleep in ms
msleep() { perl -e "select(undef,undef,undef,$1/1000)"; }

# Helper: get window center
get_center() {
  local wid="$1"
  eval "$(xdotool getwindowgeometry --shell "$wid")"   # sets X,Y,WIDTH,HEIGHT
  # Use window-relative coordinates so title bar is ignored
  local cx=$((WIDTH/2))
  local cy=$((HEIGHT/2))
  echo "$cx $cy"
}

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

echo "Chrome window: $CHROME_WIN"
read cx cy < <(get_center "$CHROME_WIN")

for i in $(seq 1 "$NUM_TABS"); do
  echo "=== Tab $i/$NUM_TABS ==="
  xdotool windowactivate --sync "$CHROME_WIN"
  msleep "$PAUSE"

  if $CLICK_TO_FOCUS; then
    # Move & click at the center of the Chrome content area
    xdotool mousemove --window "$CHROME_WIN" "$cx" "$cy"
    msleep 120
    xdotool click 1
    msleep 120
  fi

  # Copy (Ctrl+C)
  xdotool key ctrl+c
  msleep 250

  # Inspect clipboard image (read-only) and show metadata instead of saving
  if ! save_clipboard_image "$TARGET_DIR/$FILE_PREFIX-$i"; then
    echo "No image on clipboard for tab $i; skipping." >&2
  fi

  # Next tab
  xdotool key ctrl+Tab
  msleep "$PAUSE"
done

echo "Done. Files in: $TARGET_DIR"
