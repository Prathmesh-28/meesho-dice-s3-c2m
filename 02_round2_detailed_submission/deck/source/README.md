# Deck generator

`build.mjs` rebuilds `../meesho_dice_round2.pptx`. It imports the prototype's model from `../../prototype/src`, so every prototype number on the slides matches the live app.

```bash
cd source
npm init -y && npm install pptxgenjs sharp react react-dom react-icons qrcode
node icons.cjs                                   # icons and QR code into assets/
node build.mjs ../meesho_dice_round2.pptx       # rebuild the deck
```

Export the final PDF from PowerPoint (File → Export → PDF) so Calibri is embedded; the PDF in this folder was rendered with LibreOffice for layout checks. Template artwork in `assets/` comes from the official DICE S3 submission template and the Round 1 deck.

## Version history

Before the current deck changes, save it: `./snapshot.sh "what is about to change"`. It copies the pptx and pdf into `../old/` as the next version (`vNN_date_time`) and logs it in `../old/VERSIONS.md`. Rebuilding with `node build.mjs ../meesho_dice_round2.pptx` runs this automatically. If you edit the deck by hand in PowerPoint, run the script first.
