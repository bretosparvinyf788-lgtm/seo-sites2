# usfanssheetdesk.com

Complete USFans Sheet Desk release: 4,771 products, all original carousels, 4,740 products with SKU style photos, 119,110 style-image records and 15 purchasing platforms with personal referral parameters.

The complete editable website and its data are versioned in checksum-verified release parts. `node build.mjs` restores the source and static assets into this directory. Cloudflare Pages serves `dist` after this command succeeds. The original authoring scripts are restored alongside the site for subsequent editing.

Cloudflare Pages configuration: repository `seo-sites2`, production branch `main`, root directory `usfanssheetdesk.com`, build command `node build.mjs`, output directory `dist`. Only changes inside this directory trigger this project.

Google Analytics G-4K90H51CBJ runs only on the production apex and www hostnames. Local development, Sites previews and pages.dev previews do not send analytics. Site-verification files may be added under `verification` and are copied into the output by the build.

The detailed15-step device-specific guide and12FAQ answers support24languages. Additional translations use offlineMetaM2M100 with editorial corrections to key controls and titles; they have not all been proofread by native speakers. Photo search uses local-browser CLIPViT-B/32 matching against all4771product images; uploaded photographs are not transmitted. The first search downloads about90MB, then attempts to cache the model.

31source products do not supply independent SKU photos and3source products have no QC reference photos. Three later phone address/route/shipping-payment forms still lack verifiable mobile screenshots; official historical phone examples and concrete instructions are labelled accurately. The complete148712unique-original-photo contact/QR audit remains unfinished. No order or payment was made for the tutorial.

For rebuilding the visual index, use the pinned officialonnxruntime==1.23.2, with optional telemetry disabled. Version1.32 caused an unrelated telemetry connection and is not used by this pipeline. Modelrevision and source-image provenance are recorded in the index and visual recovery checkpoints.

Production deployment: GitHub main feeds Cloudflare Pages project `usfanssheetdesk-git`. Both apex and www have active HTTPS. A zone redirect rule sends www to the apex with status301, preserving path and query. Google Search Console domain verification passed and the sitemap has Success with4,785 URLs. Bing verification and sitemap processing both succeeded, with zero reported errors or warnings.

Photo search and the localized guide use the complete catalogue snapshot dated26Nov2026. Rebuilds of the image index must use the pinned CLIPvision model SHA256583fd1110a514667812fee7d684952aaf82a99b959760c8d7dca7e0ab9839299. Optional authoring model/cache locations are configurable withUSFANS_CLIP_MODEL, USFANS_COVER_CACHE andUSFANS_TRANSLATION_MODEL_DIR. After regenerating translations, runpython finalize_completion.py to retain editorial corrections and verify coverage.

For production QA, append?analytics=off; it suppresses collection before the tracking script is loaded. Preview branches also returnX-Robots-Tag:noindex,nofollow and disallow crawling.
