#!/bin/bash
# Saves the current deck (pptx + pdf) into ../old as the next version, before it is changed.
# usage: ./snapshot.sh "what is about to change"
set -e
DECK="$(cd "$(dirname "$0")/.." && pwd)"
OLD="$DECK/old"; BASE=meesho_dice_round2
mkdir -p "$OLD"
[ -f "$DECK/$BASE.pptx" ] || { echo "No current deck to save."; exit 0; }
NEWEST=$(ls "$OLD"/${BASE}_v*.pptx 2>/dev/null | sort | tail -1)
if [ -n "$NEWEST" ] && cmp -s "$NEWEST" "$DECK/$BASE.pptx"; then
  echo "Current deck is already saved as $(basename "$NEWEST")."; exit 0
fi
LAST=$(ls "$OLD" | sed -n "s/^${BASE}_v\([0-9][0-9]*\)_.*\.pptx$/\1/p" | sort -n | tail -1)
N=$(printf "%02d" $((10#${LAST:-0} + 1)))
STAMP=$(date +%Y-%m-%d_%H%M)
cp "$DECK/$BASE.pptx" "$OLD/${BASE}_v${N}_${STAMP}.pptx"
[ -f "$DECK/$BASE.pdf" ] && cp "$DECK/$BASE.pdf" "$OLD/${BASE}_v${N}_${STAMP}.pdf"
printf -- "- **v%s** · %s · Saved before: %s\n" "$N" "$STAMP" "${1:-unspecified change}" >> "$OLD/VERSIONS.md"
echo "Saved v${N} to old/."
