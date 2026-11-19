# OOTDBuy Sheetdesk

Product directory for **ootdbuysheetdesk.com**.

- English default with 24 complete text locales and an independent currency selector.
- 4,282 listings across ten categories, with sorting, pagination, local product details, seller images and separate QC references.
- FAQ retained on the homepage; no standalone buying guide.
- Registration: `https://ootdbuy.com/register?inviteCode=PY4OUQ9A1`.
- Product links use each original Weidian ID in the OOTDBuy format with invite code `endoren`.
- Google Analytics: `G-SN1WS560YB`.
- Supplied sample product ID: `7896594713`.

## Build and verify

```sh
python3 tools/build.py
node tools/check.mjs
node scripts/validate-artifact.mjs
```

The catalogue is a dated snapshot. Current product availability, variants, prices, checkout and fulfilment are handled by OOTDBuy and the original seller.
