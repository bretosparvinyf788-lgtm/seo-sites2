import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import app from "../worker/index.js";

const get = (path) => app.fetch(new Request(`https://ootdbuysheetdesk.com${path}`), {}, {});
const html = async (path) => (await get(path)).text();

const home = await html("/");
assert(home.includes("OOTDBuy Sheetdesk"));
assert(home.includes("G-SN1WS560YB"));
const previewHome = await (await app.fetch(new Request("https://ootdbuysheetdesk.bretosparvinyf788.chatgpt.site/"), {}, {})).text();
assert(!previewHome.includes("G-SN1WS560YB"));
assert(!previewHome.includes("googletagmanager.com"));
assert(home.includes("https://ootdbuy.com/register?inviteCode=PY4OUQ9A1"));
assert(home.includes("Join OOTDBuy"));
assert(home.includes('aria-current="page">Home</a>'));
assert(home.includes('href="/image-search"'));
assert(home.includes('>Image search</a>'));
assert(!home.includes('href="/#faq">'));
assert(home.includes("data:image/png;base64,iVBOR"));
assert(home.includes("--brand-orange:#f87008"));
assert(home.includes('id="categories"'));
assert(home.includes('id="search"'));
assert(home.includes('class="image-search-trigger"'));
assert(home.includes('href="/image-search"'));
assert(!home.includes('id="image-search-panel"'));
assert(home.includes('class="home-how wrap"'));
assert(!home.includes('class="home-spotlights wrap"'));
assert.equal((home.match(/class="category-guide-card"/g) || []).length, 10);
assert.equal((home.match(/<a class="category-guide-card" href="\/category\//g) || []).length, 10);
assert(!home.includes('<article class="category-guide-card"'));
assert(!home.includes('class="category-guide-link"'));
assert(!home.includes('class="category-guide-tags"'));
assert(home.includes('id="home-category-guide-title"'));
assert(home.indexOf('class="home-how wrap"') < home.indexOf('class="home-category-guide wrap"'));
assert(home.indexOf('class="home-category-guide wrap"') < home.indexOf('class="atlas-faq wrap"'));
assert(home.includes('Flat editorial category list: no boxed card treatment.'));
assert(home.includes('Short homepage version: two flat rows with concise tags and copy.'));
assert(home.includes('-webkit-line-clamp:3'));
assert(home.includes('border-radius:0;background:transparent'));
assert(home.indexOf('id="home-category-guide-title"') > home.indexOf('class="home-how wrap"'));
assert(home.indexOf('id="home-category-guide-title"') < home.indexOf('class="atlas-faq wrap"'));
for (const slug of ["shoes", "t-shirts", "clothing", "hoodies", "pants", "belts", "bags", "perfume", "electronics", "other"]) {
  assert(home.includes(`/category/${slug}`));
}
for (const slug of ["shoes", "t-shirts", "clothing", "hoodies", "pants", "belts", "bags", "perfume", "electronics", "other"]) {
  const categoryPage = await html(`/category/${slug}`);
  assert(categoryPage.includes('class="category-page-description"'));
}
assert((await html("/category/shoes")).includes("Browse sneakers, slides and everyday footwear."));
assert(!home.includes("/guide"));
assert(!home.includes("Kakobuy"));

const categoryGuide = await html("/categories");
assert(categoryGuide.includes('>Home</a>'));
assert(categoryGuide.includes("Find your kind of find"));
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

const imageIndex = JSON.parse(imageSearchPage.match(/<script type="application\/json" id="image-search-index">([^<]+)<\/script>/)[1]);
assert.equal(imageIndex.length, 4355);
assert(imageIndex.every((item) => item.aid && item.image && item.title && item.category && item.categoryKey && item.features.length));
assert.equal(imageIndex.reduce((total, item) => total + item.features.length, 0), 31829);
assert(imageIndex.every((item) => item.features.every((feature) => Buffer.from(feature, 'base64').length === 332)));
const imageCategoryCounts = imageIndex.reduce((counts, item) => counts.set(item.categoryKey, (counts.get(item.categoryKey) || 0) + 1), new Map());
assert.equal(imageCategoryCounts.size, 10);
assert([...imageCategoryCounts.values()].every((count) => count >= 8));
assert(imageSearchPage.includes('visualRanking=[...scored].sort'));
assert(imageSearchPage.includes("pipeline('zero-shot-image-classification','Xenova/clip-vit-base-patch32')"));
assert(imageSearchPage.includes('semanticPrompts'));
assert(imageSearchPage.includes('semanticCategoryKey'));
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
assert(!imageSearchPage.includes('ootdbuy.com/goods/details'));
assert(imageSearchPage.includes('compared only with products already listed on OOTDBuy Sheetdesk'));
assert.equal((imageSearchPage.match(/data-image-page=/g) || []).length, 3);
assert(imageSearchPage.includes("status.textContent=imagePanel.dataset.ready;void runSearch()"));

for (const lang of ["en", "zh-CN", "de", "fr", "es", "ja", "ko", "ar"]) {
  const page = await html(`/?lang=${lang}`);
  assert(page.includes(`lang="${lang}"`));
  assert(page.includes("OOTDBuy"));
  assert(page.includes("Join OOTDBuy"));
}

const favicon = Buffer.from(await (await get("/favicon.ico")).arrayBuffer());
assert.equal(createHash("sha256").update(favicon).digest("hex").toUpperCase(), "7391929469F46F196F9A59BC24DAB1BCE1ECA15726C81343652C2A11BD74A1C4");

const detail = await html("/product/7896594713");
assert(detail.includes("https://ootdbuy.com/goods/details?id=7896594713&amp;channel=weidian&amp;inviteCode=endoren") || detail.includes("https://ootdbuy.com/goods/details?id=7896594713&channel=weidian&inviteCode=endoren"));

const searchResults = await html("/finds?q=hoodie");
assert(searchResults.includes('class="product"'));
assert(!searchResults.includes("No listings are available on this page."));

assert.equal((await get("/guide")).status, 404);
const sitemap = await html("/sitemap.xml");
assert(sitemap.includes("https://ootdbuysheetdesk.com/product/7896594713"));
assert(sitemap.includes("https://ootdbuysheetdesk.com/categories"));
assert(sitemap.includes("https://ootdbuysheetdesk.com/image-search"));
assert(!sitemap.includes("/guide"));

console.log("Passed: embedded official OOTDBuy wordmark, Join OOTDBuy CTA, dedicated image-search page, compact category directory, descriptions on all ten category pages, three-step explainer, 24-locale source, GA, referral links, sample product and sitemap.");
