#!/bin/bash
# Renders a deck into the slide folders (NN_name/render.png + text.txt) and flags any inline citation
# ([S#] / [A#]) or page pointer ("p9", "(page 11)") left in a slide body. Footers are allowed to cite.
# usage: ./refresh_slides.sh [deck.pptx]   default: the main deck, ../../meesho_dice_round2.pptx
# Needs LibreOffice; installs pymupdf into _tools/.venv on first run if python3 lacks it.
set -e
TOOLS="$(cd "$(dirname "$0")" && pwd)"
WORK="$(dirname "$TOOLS")"
DECK="$(cd "$(dirname "${1:-$WORK/../meesho_dice_round2.pptx}")" && pwd)/$(basename "${1:-meesho_dice_round2.pptx}")"
SOFFICE=/Applications/LibreOffice.app/Contents/MacOS/soffice
PY=python3
if ! $PY -c 'import pymupdf' 2>/dev/null; then
  [ -x "$TOOLS/.venv/bin/python" ] || { python3 -m venv "$TOOLS/.venv" && "$TOOLS/.venv/bin/pip" -q install pymupdf; }
  PY="$TOOLS/.venv/bin/python"
fi
OUT="$TOOLS/.render"; mkdir -p "$OUT"
"$SOFFICE" -env:UserInstallation="file://$TOOLS/.lo_profile" --headless --convert-to pdf --outdir "$OUT" "$DECK" >/dev/null 2>&1
"$PY" - "$OUT/$(basename "${DECK%.*}").pdf" "$WORK" <<'PY'
import pathlib, re, sys
import pymupdf
pdf, work = sys.argv[1], pathlib.Path(sys.argv[2])
folders = {int(p.name[:2]): p for p in work.iterdir() if p.is_dir() and p.name[:2].isdigit()}
bad = re.compile(r'\[[SA][0-9#][^\]]*\]|·\s*p\d+\b|\(pages?\s+\d|→\s*p\d+|\bpp?\.\s*\d')
doc = pymupdf.open(pdf)
for i, page in enumerate(doc, start=1):
    folder = folders.get(i)
    if not folder:
        continue
    page.get_pixmap(dpi=110).save(folder / 'render.png')
    text = page.get_text()
    (folder / 'text.txt').write_text(text)
    body = [l for l in text.splitlines() if not re.match(r'\s*(Sources:|Screens:|Master model)', l)]
    hits = sorted({m.group(0) for l in body for m in bad.finditer(l)})
    print(f'{i:2d} {folder.name:32s} {len(text.split()):4d} words  {"CHECK: " + ", ".join(hits) if hits else "clean"}')
PY
