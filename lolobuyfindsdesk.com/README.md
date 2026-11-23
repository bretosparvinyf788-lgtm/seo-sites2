# LoloBuy Finds Desk

Independent product directory for **lolobuyfindsdesk.com**.

- English default with 24 complete text locales and an independent currency selector.
- 4,282 listings across ten categories, with sorting, pagination, local product details, seller images and separate QC references.
- Official LoloBuy wordmark and favicon are embedded locally.
- Registration: `https://www.lolobuy.com/index?inviteCode=199df`.
- Supplied product: `https://www.lolobuy.com/productDetail/1787575225494951?url=https://weidian.com/item.html?itemID=7896594713&inviteCode=5mz7f`.
- Google Analytics: `G-G15SH577PC`, restricted to the custom production hostname.
- Supplied sample product ID: `7896594713`.

## Build and verify

```sh
python3 tools/build.py
node tools/check.mjs
node scripts/validate-artifact.mjs
```

The catalogue is a dated snapshot. Current product availability, variants, prices, checkout and fulfilment are handled by LoloBuy and the original seller.
