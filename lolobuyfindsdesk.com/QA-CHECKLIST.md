# Deployment QA checklist

- Header displays `LoloBuy / FINDS DESK`; no inherited image or background logo is visible.
- First viewport stays compact on desktop and mobile.
- Homepage uses a compact full category row on desktop and all ten categories in a 5-by-2 phone grid—no missing categories, dropdown, horizontal scrolling, or tall mobile grid.
- Search routes to `/finds?q=...` and returns product cards.
- Category links open the matching category page.
- Sort changes the URL and ordering mode.
- Image-search page exposes the supported image input and visual index.
- Product `7896594713` opens, advances its gallery, copies its link, and uses the supplied LoloBuy purchase URL.
- Language and currency menus open; mobile navigation opens.
- Signup button uses invite code `199df`.
- Google Analytics measurement ID is `G-G15SH577PC`.
- Recheck the deployed page, including computed header styles, after every publish.
