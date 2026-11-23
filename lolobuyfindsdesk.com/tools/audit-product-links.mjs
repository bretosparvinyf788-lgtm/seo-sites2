import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import app from "../worker/index.js";

const catalog = JSON.parse(await readFile(new URL("./catalog-full.json", import.meta.url), "utf8"));
const mainQc = JSON.parse(await readFile(new URL("./main-qc.json", import.meta.url), "utf8"));
const products = Object.values(catalog).flatMap((category) => category.items);
const linked = products.filter((product) => /^\d+$/.test(String(mainQc.items[product.aid]?.id || "")));
const unlinked = products.filter((product) => !/^\d+$/.test(String(mainQc.items[product.aid]?.id || "")));
const routes = linked.map((product) => `/product/${product.aid}`);
assert.equal(new Set(routes).size, routes.length, "every published product route must be unique");

const buildAgentUrls = (id) => {
  const source = `https://weidian.com/item.html?itemID=${id}`;
  const encoded = encodeURIComponent(source);
  return [
    `https://www.lolobuy.com/productDetail/${id}?url=${encoded}&inviteCode=5mz7f`,
    `https://loongbuy.com/product-details?url=${encoded}&invitecode=N64FFV4V`,
    `https://hipobuy.com/product/weidian/${id}?inviteCode=7INJEO667`,
    `https://www.usfans.com/product/3/${id}?ref=ZG4JNV`,
    `https://litbuy.com/product/2/${id}?inviteCode=7N6D4Y6EE`,
    `https://www.cssbuy.com/shop/goodsDetail?type=micro&id=${id}`,
    `https://joyagoo.com/product/?shop_type=weidian&id=${id}&ref=300189539`,
    `https://www.sugargoo.com/products?productLink=${encoded}&memberId=2064761237850680307`,
    `https://orientdig.com/product/?shop_type=weidian&id=${id}&ref=100141587`,
    `https://oopbuy.com/goods/details?id=${id}&channel=weidian&inviteCode=M8WW8HUO2`,
    `https://www.ootdbuy.com/goods/details?id=${id}&channel=weidian&inviteCode=endoren`,
    `https://www.kakobuy.com/item/details?url=${encoded}&affcode=9qtwd`,
    `https://www.lovegobuy.com/product?id=${id}&shop_type=weidian&invite_code=WIP8S9`,
    `https://www.superbuy.com/en/page/buy/?url=${encoded}&partnercode=EOEwZz`,
  ];
};

let agentLinks = 0;
for (const product of linked) {
  const id = String(mainQc.items[product.aid].id);
  assert(/^\d+$/.test(id), `invalid Weidian ID for route ${product.aid}`);
  const urls = buildAgentUrls(id);
  assert.equal(urls.length, 14);
  for (const url of urls) {
    assert.doesNotThrow(() => new URL(url));
    assert(decodeURIComponent(url).includes(id), `agent URL lost product ID ${id}`);
    agentLinks++;
  }
}

const sitemap = await (await app.fetch(new Request("https://lolobuyfindsdesk.com/sitemap.xml"), {}, {})).text();
for (const route of routes) assert(sitemap.includes(route), `sitemap is missing ${route}`);
for (const product of unlinked) {
  assert(!sitemap.includes(`/product/${product.aid}`), `unlinked product ${product.aid} is still published`);
  const response = await app.fetch(new Request(`https://lolobuyfindsdesk.com/product/${product.aid}`), {}, {});
  assert.equal(response.status, 404, `unlinked product ${product.aid} must not expose a broken detail page`);
}

console.log(JSON.stringify({
  sourceProducts: products.length,
  publishedProducts: linked.length,
  excludedWithoutVerifiedId: unlinked.length,
  uniqueProductRoutes: routes.length,
  verifiedAgentLinks: agentLinks,
  agentsPerProduct: 14,
  allPublishedProductsHaveVerifiedWeidianId: true,
}));
