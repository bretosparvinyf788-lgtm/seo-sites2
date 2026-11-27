# usfanssheetdesk.com

Complete USFans Sheet Desk release: 4,771 products, all original carousels, 4,740 products with SKU style photos, 119,110 style-image records and 15 purchasing platforms with personal referral parameters.

The complete editable website and its data are versioned in checksum-verified release parts. `node build.mjs` restores the source and static assets into this directory. Cloudflare Pages serves `dist` after this command succeeds. The original authoring scripts are restored alongside the site for subsequent editing.

Cloudflare Pages configuration: repository `seo-sites2`, production branch `main`, root directory `usfanssheetdesk.com`, build command `node build.mjs`, output directory `dist`. Only changes inside this directory trigger this project.

Google Analytics G-4K90H51CBJ runs only on the production apex and www hostnames. Local development, Sites previews and pages.dev previews do not send analytics. Site-verification files may be added under `verification` and are copied into the output by the build.

31 source products do not supply independent SKU photos. Three source records have no QC reference photos. Full translated guide/FAQ content outside English and Chinese, three later mobile parcel screenshots, image-based product search and a complete source-image contact/QR audit remain separate work; this release does not claim these are finished.

Production deployment: GitHub main feeds Cloudflare Pages project `usfanssheetdesk-git`. Both apex and www have active HTTPS. A zone redirect rule sends www to the apex with status301, preserving path and query. Google Search Console domain verification passed and the sitemap has Success with4,785 URLs. Bing verification passed and the submitted sitemap is processing.
