import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import app from "../worker/index.js";

const get = (path) => app.fetch(new Request(`https://lolobuyfindsdesk.com${path}`), {}, {});
const html = async (path) => (await get(path)).text();

const home = await html("/");
assert(home.includes("LoloBuy Finds Desk"));
assert(home.includes("G-G15SH577PC"));
const previewHome = await (await app.fetch(new Request("https://lolobuyfindsdesk.bretosparvinyf788.chatgpt.site/"), {}, {})).text();
assert(!previewHome.includes("G-G15SH577PC"));
assert(!previewHome.includes("googletagmanager.com"));
assert(home.includes("https://www.lolobuy.com/index?inviteCode=199df"));
assert(home.includes("Join LoloBuy"));
assert(home.includes('class="brand-official-logo" src="/lolobuy-logo.svg"'));
assert(!home.includes('class="brand-wordmark-text"'));
assert(home.includes("LoloBuy V14: independent data-workbench layout"));
assert(home.includes('aria-current="page">Home</a>'));
assert(home.includes('href="/image-search"'));
assert(home.includes('>Image search</a>'));
assert(!home.includes('href="/#faq">'));
assert(home.includes("data:image/png;base64,iVBOR"));
assert(home.includes('class="home-desk-v14"'));
assert(home.includes("LoloBuy Finds<span"));
assert(!home.includes('class="hero-badges"'));
assert(home.includes('property="og:image" content="https://lolobuyfindsdesk.com/og.png"'));
assert(home.includes('id="categories"'));
assert(home.includes('id="search"'));
assert(home.includes('class="image-search-trigger"'));
assert(home.includes("LoloBuy V16: strong, unmistakable text and image search controls"));
assert(home.includes(".desk-hero-search .image-search-trigger{display:flex!important"));
assert(home.includes("LoloBuy V17: camera action lives inside the search field"));
assert(home.includes("LoloBuy V18: wider desktop search workspace"));
assert(home.includes("LoloBuy V28: compact reference-style navigation in the page footer"));
assert(home.includes("footerNav.className='footer-nav'"));
for (const footerLink of ["['LoloBuy Finds','/finds']", "['Categories','/categories']", "['Image search','/image-search']"]) assert(home.includes(footerLink));
assert(home.includes("LoloBuy V29: registration action is available in the footer too"));
assert(home.includes("footerRegister.className='footer-register'"));
assert(home.includes("footerRegister.href='https://www.lolobuy.com/index?inviteCode=199df'"));
assert(home.includes("footerRegister.textContent='Join LoloBuy'"));
assert(home.includes(".desk-hero-search .home-search{width:100%!important;max-width:none!important}"));
assert(home.includes(".desk-hero-search .home-search-tools,.home-desk-v14 .desk-hero-search .home-search>div{width:100%!important;max-width:none!important}"));
assert(home.includes('<a class="image-search-trigger" href="/image-search" aria-label="Search by photo"'));
assert(home.includes('href="/image-search"'));
assert(!home.includes('id="image-search-panel"'));
assert(!home.includes('class="home-how wrap"'));
assert(home.includes('class="brand-site-label">FINDS DESK</span>'));
assert(!home.includes('class="lolo-launch-preview"'));
assert.equal((home.match(/class="lolo-preview-index"/g) || []).length, 0);
assert(home.includes("grid-template-columns:repeat(4,minmax(0,1fr))"));
assert(!home.includes('class="home-spotlights wrap"'));
assert.equal((home.match(/class="category-guide-card"/g) || []).length, 10);
assert(home.includes('id="home-category-guide-title"'));
assert(home.includes('class="home-category-guide wrap"'));
assert(home.includes('class="atlas-faq wrap"'));
assert(home.indexOf('id="desk-results"') < home.indexOf('class="home-category-guide wrap"'));
assert(home.indexOf('class="home-category-guide wrap"') < home.indexOf('class="atlas-faq wrap"'));
assert(home.includes('--soft:#f6f7f9'));
assert(home.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
assert(!home.includes('class="sheet-toolbar"'));
assert(!home.includes('class="sheet-column-head"'));
assert(home.includes('-webkit-line-clamp:3'));
assert(home.includes('border-radius:0;background:transparent'));
assert(home.includes('id="desk-results"'));
assert(home.includes('class="product-grid desk-product-grid"'));
for (const slug of ["shoes", "t-shirts", "clothing", "hoodies", "pants", "belts", "bags", "perfume", "electronics", "other"]) {
  assert(home.includes(`/category/${slug}`));
}
for (const slug of ["shoes", "t-shirts", "clothing", "hoodies", "pants", "belts", "bags", "perfume", "electronics", "other"]) {
  const categoryPage = await html(`/category/${slug}`);
  assert(categoryPage.includes('class="category-page-description"'));
}
assert((await html("/category/shoes")).includes("Browse sneakers, slides and everyday footwear."));
assert(!home.includes("/guide"));
assert(!home.includes(">Kakobuy<"));

const categoryGuide = await html("/categories");
assert(categoryGuide.includes('>Home</a>'));
assert(categoryGuide.includes("Pick a lane. Find your thing"));
assert.equal((categoryGuide.match(/class="category-guide-card"/g) || []).length, 10);
assert.equal((categoryGuide.match(/<a class="category-guide-card" href="\/category\//g) || []).length, 10);
assert.equal((categoryGuide.match(/class="category-guide-tags"/g) || []).length, 0);
assert.equal((categoryGuide.match(/class="category-guide-link"/g) || []).length, 0);
assert(categoryGuide.includes("Browse sneakers, slides and everyday footwear."));

const imageSearchPage = await html("/image-search");
const imageSearchResponse = await get("/image-search");
assert.equal(imageSearchResponse.headers.get("cache-control"), "no-store");
assert(imageSearchPage.includes('class="image-search-page wrap"'));
assert(imageSearchPage.includes('class="image-search-panel image-search-page-panel"'));
assert(imageSearchPage.includes('id="image-search-input"'));
assert(!imageSearchPage.includes('id="image-search-submit"'));
assert(!/id="image-search-panel"[^>]* hidden/.test(imageSearchPage));

assert(imageSearchPage.includes('id="image-search-index" data-src="/visual-index.json">[]</script>'));
const imageIndex = JSON.parse(await readFile(new URL("../dist/visual-index.json", import.meta.url), "utf8"));
assert.equal(imageIndex.length, 4344);
assert(imageIndex.every((item) => item.aid && item.image && item.title && item.categoryKey && item.features.length));
assert.equal(imageIndex.reduce((total, item) => total + item.features.length, 0), 4344);
assert(imageIndex.every((item) => item.features.every((feature) => Buffer.from(feature, 'base64').length === 332)));
const imageIndexResponse = await get("/visual-index.json");
assert.equal(imageIndexResponse.status, 200);
assert.equal(imageIndexResponse.headers.get("content-type"), "application/json;charset=utf-8");
assert.equal((await imageIndexResponse.json()).length, 4344);
const imageCategoryCounts = imageIndex.reduce((counts, item) => counts.set(item.categoryKey, (counts.get(item.categoryKey) || 0) + 1), new Map());
assert.equal(imageCategoryCounts.size, 10);
assert([...imageCategoryCounts.values()].every((count) => count >= 8));
assert(imageSearchPage.includes('visualRanking=[...scored].sort'));
assert(imageSearchPage.includes("pipeline('zero-shot-image-classification','Xenova/clip-vit-base-patch32')"));
assert(imageSearchPage.includes('semanticPrompts'));
assert(imageSearchPage.includes('semanticCategoryKey'));
assert(imageSearchPage.includes('publishMatches(visualMatches)'));
assert(imageSearchPage.indexOf('publishMatches(visualMatches)') < imageSearchPage.indexOf('await classifyCategory(file)'));
assert(imageSearchPage.includes('visualMatches.some(item=>item.exact)'));
assert(imageSearchPage.includes('semanticClassifierPromise=loadSemanticClassifier()'));
assert(imageSearchPage.includes('semanticCategoryKey?scoreAll(target,semanticCategoryKey):visualMatches'));
assert(!imageSearchPage.includes('a.slice(0,188).reduce'));
assert(imageSearchPage.includes('categoryGroups'));
assert(imageSearchPage.includes('categoryDistance(target,item.features[0])'));
assert(imageSearchPage.includes('exactWinner?.categoryKey||semanticCategoryKey||balancedCategory.categoryKey'));
assert(imageSearchPage.includes('categoryScore'));
assert(imageSearchPage.includes('data-exact="Exact match"'));
assert(imageSearchPage.includes('visualRunnerUp.score&gt;=visualWinner.score*1.6') || imageSearchPage.includes('visualRunnerUp.score>=visualWinner.score*1.6'));
assert(imageSearchPage.includes("visualWinner.score&lt;=300000") || imageSearchPage.includes("visualWinner.score<=300000"));
assert(imageSearchPage.includes('results.dataset.category=matches.categoryKey'));
assert(imageSearchPage.includes("slice(0,24)"));
assert(imageSearchPage.includes("link.href='/product/'"));
assert(!imageSearchPage.includes("fetch('/api/image-search'"));
assert(!imageSearchPage.includes('href="https://www.ootdbuy.com/goods/details'));
assert(imageSearchPage.includes('compared only with products already listed on LoloBuy Finds Desk'));
assert.equal((imageSearchPage.match(/data-image-page=/g) || []).length, 3);
assert(imageSearchPage.includes("status.textContent=imagePanel.dataset.ready;void runSearch()"));
assert(home.includes("location.href='/product/'+encodeURIComponent(id)"));

for (const lang of ["en", "zh-CN", "de", "fr", "es", "ja", "ko", "ar"]) {
  const page = await html(`/?lang=${lang}`);
  assert(page.includes(`lang="${lang}"`));
  assert(page.includes("LoloBuy"));
  assert(page.includes("Join LoloBuy"));
}

const favicon = Buffer.from(await (await get("/favicon.ico")).arrayBuffer());
assert.equal(createHash("sha256").update(favicon).digest("hex").toUpperCase(), "8A985781A139E1FEB36A84002652D1B4F34A0D46F454B727B8AA8A01D7682FD1");

const socialImage = await get("/og.png");
assert.equal(socialImage.headers.get("content-type"), "image/png");
assert((await socialImage.arrayBuffer()).byteLength > 100000);

const wordmark = Buffer.from(await (await get("/lolobuy-logo.svg")).arrayBuffer());
assert(["1B346E9F513674D79B1D7F4F783007503C1DC9A880134521BAEA4FC9D3355E8C", "74D9FDC6FDA9EA3207B20C1905E12AF37684362EFB597B8ED3A60400581D12DF"].includes(createHash("sha256").update(wordmark).digest("hex").toUpperCase()));

const detail = await html("/product/7896594713");
assert(detail.includes("https://www.lolobuy.com/productDetail/1787575225494951?url=https://weidian.com/item.html?itemID=7896594713&amp;inviteCode=5mz7f") || detail.includes("https://www.lolobuy.com/productDetail/1787575225494951?url=https://weidian.com/item.html?itemID=7896594713&inviteCode=5mz7f"));
assert(detail.includes("LoloBuy V24: reference-style agent dropdown row and searchable modal list"));
assert(detail.includes("LoloBuy V25: self-host the verified agent brand icons instead of guessing from favicons"));
assert(detail.includes("LoloBuy V26: every agent URL is generated from the current Weidian product ID"));
assert(detail.includes("picker.className='shopping-agent-picker'"));
assert(detail.includes("trigger.className='shopping-agent-trigger'"));
assert(detail.includes("dialog.className='shopping-agent-dialog'"));
assert(detail.includes("dialog.showModal()"));
assert(detail.includes("search.placeholder='Search buying agents'"));
assert(detail.includes("list.className='shopping-agent-list'"));
assert(detail.includes("copyButton.textContent='Copy link'"));
assert(detail.includes("sourceLink.classList.add('source-copy-row')"));
assert(detail.includes("'https://www.lolobuy.com/productDetail/'+item+'?url='+encoded+'&inviteCode=5mz7f'"));
for (const urlPattern of [
  "loongbuy.com/product-details?url='+encoded+'&invitecode=",
  "cssbuy.com/shop/goodsDetail?type=micro&id='+item",
  "sugargoo.com/products?productLink='+encoded",
  "oopbuy.com/goods/details?id='+item+'&channel=weidian",
  "kakobuy.com/item/details?url='+encoded+'&affcode=",
  "superbuy.com/en/page/buy/?url='+encoded",
]) assert(detail.includes(urlPattern), `missing current buying-agent URL format: ${urlPattern}`);
for (const oldPattern of ["&register?code=", "cssbuy.com/item-micro-", "sugargoo.com/#/home/productDetail", "oopbuy.com/product/weidian/"]) {
  assert(!detail.includes(oldPattern), `obsolete buying-agent URL remains: ${oldPattern}`);
}
for (const [id, filename] of Object.entries({lolobuy:"lolobuy.png",loongbuy:"loongbuy.ico",hipobuy:"hipobuy.png",usfans:"usfans.png",litbuy:"litbuy.ico",cssbuy:"cssbuy.png",joyagoo:"joyagoo.ico",sugargoo:"sugargoo.ico",orientdig:"orientdig.ico",oopbuy:"oopbuy.png",ootdbuy:"ootdbuy.ico",kakobuy:"kakobuy.ico",lovegobuy:"lovegobuy.ico",superbuy:"superbuy.svg"})) {
  const icon = Buffer.from(await readFile(new URL(`../tools/agent-icons/${filename}`, import.meta.url))).toString("base64");
  assert(detail.includes(icon), `${id} icon is not bundled`);
}
for (const platform of ["LoongBuy", "Hipobuy", "UsFans", "LitBuy", "CSSBuy", "Joyagoo", "Sugargoo", "OrientDig", "Oopbuy", "OOTDBuy", "Kakobuy", "LoveGoBuy", "Superbuy"]) {
  assert(detail.includes(`['${platform}'`));
}
assert(detail.includes("product/weidian/"));
const styledDetail = await html("/product/7894400057");
assert(styledDetail.includes('class="product-styles"'));
assert(styledDetail.includes('class="product-style-grid"'));
assert(styledDetail.includes("STYLE 01"));
assert(styledDetail.includes("STYLE 02"));

const searchResults = await html("/finds?q=hoodie");
assert(searchResults.includes('class="product"'));
assert(!searchResults.includes("No listings are available on this page."));

const homepage = await html("/");
assert(homepage.includes("LANGUAGE_NAMES={en:'English','zh-CN':'简体中文'"));
assert(homepage.includes("languageButton.replaceChildren"));
assert(homepage.includes("show every language's complete native name"));
assert(homepage.includes("compact language and currency menus with internal scrolling"));
assert(homepage.includes("max-height:min(360px,calc(100vh - 110px))"));
assert(homepage.includes("max-height:min(280px,calc(100vh - 90px))"));
assert(homepage.includes("LoloBuy V35: left-aligned FAQ heading, horizontal topics and a two-column question grid"));
assert(homepage.includes(".atlas-faq-heading{display:block;margin:0 0 24px;padding:0;text-align:left}"));
assert(homepage.includes("grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:18px"));
assert(homepage.includes("grid-template-columns:repeat(2,minmax(0,1fr))"));
assert(!homepage.includes('<details open><summary>'));
assert(homepage.includes('class="home-category-mobile"'));
assert(homepage.includes('href="/category/shoes"'));
assert(homepage.includes('href="/category/other"'));
assert(!homepage.includes('id="home-category-select"'));

assert.equal((await get("/guide")).status, 404);
const sitemap = await html("/sitemap.xml");
assert(sitemap.includes("https://lolobuyfindsdesk.com/product/7896594713"));
assert(sitemap.includes("https://lolobuyfindsdesk.com/categories"));
assert(sitemap.includes("https://lolobuyfindsdesk.com/image-search"));
assert(!sitemap.includes("/guide"));

console.log("Passed: site-specific LoloBuy Finds Desk header, compact no-scroll categories, no duplicate preview or generic explainer cards, image search, category directory, 24-locale source, GA, referral links, sample product and sitemap.");
