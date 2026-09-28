# Deck generator

`build.mjs` rebuilds `../meesho_dice_round2.pptx`. It imports the prototype's model from `../../prototype/src`, so every prototype number on the slides matches the live app.

```bash
cd source
npm init -y && npm install pptxgenjs sharp react react-dom react-icons qrcode
node icons.cjs                                   # icons and QR code into assets/
node build.mjs ../meesho_dice_round2.pptx       # rebuild the deck
```

Export the final PDF from PowerPoint (File → Export → PDF) so Calibri is embedded; the PDF in this folder was rendered with LibreOffice for layout checks. Template artwork in `assets/` comes from the official DICE S3 submission template and the Round 1 deck.
