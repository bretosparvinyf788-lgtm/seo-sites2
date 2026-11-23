# Design rules for future list sites

0. Mandatory sequence for every new domain: verify the real official website, official palette, authentic logo, and exact product/link parameters; define a unique full-site layout; only then begin local configuration and implementation.
1. Use the supplied reference sites for information architecture and usability, not as a template to copy.
2. Every domain needs a distinct full-site system covering the header, first viewport, homepage, categories, listing/search, product detail, image search, mobile navigation, footer, typography, spacing, and card composition.
3. The header identity must match the actual site. Pair the agent wordmark with the site's own label, such as `FINDS DESK`, `LISTS`, or `SHEETZ`.
4. Avoid generic three-card “how it works” sections unless they are explicitly requested.
5. Before publishing, compare the new homepage against the previous completed site and change any repeated hero composition or visual motif.
6. Keep the first viewport compact. The hero must not become a large decorative block that pushes categories and products below the fold.
7. Show only one category navigator on the homepage, and keep category controls compact instead of using oversized cards.
8. Never reuse an image asset until its visible wordmark has been verified. If the correct brand asset is unavailable, use a site-specific text wordmark instead of displaying another agent's logo.
9. Inspect computed styles in the deployed page: old background-image rules can keep a previous logo visible even when the HTML asset has been replaced.
10. Never require horizontal scrolling to reach categories. Keep all categories visible: one compact row where space allows, and a small wrapping grid on narrower screens.
11. Before handoff, test the deployed URL at desktop and mobile widths. Verify the visible brand, search, category navigation, sort, image-search controls, product gallery, copy action, language and currency menus, mobile menu, signup URL, and product purchase URL.
12. Treat a source-code check as incomplete until the deployed page's DOM and computed styles show the intended result.
13. On phones, keep all ten categories visible in a compact 5-by-2 grid. Do not remove categories or use a dropdown, tall 2-column grid, or horizontal scroller.
14. Reserved layout: `lolobuyfindsdesk.com` uses the LoloBuy Data Desk signature—official LoloBuy SVG, compact utility hero, ten-category directory and flat table-like product index. Do not reuse this composition for another domain.
