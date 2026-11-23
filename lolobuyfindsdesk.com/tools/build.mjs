import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const text = (path) => readFile(resolve(root, path), "utf8");
const json = async (path, fallback) => {
  try {
    return JSON.parse(await text(path));
  } catch (error) {
    if (error.code === "ENOENT" && fallback !== undefined) return fallback;
    throw error;
  }
};

let worker = await text("worker/template.js");
const catalog = await json("tools/catalog-full.json");
const mainQc = await json("tools/main-qc.json");
const isLinkedProduct = (product) => /^\d+$/.test(String(mainQc.items[product.aid]?.id || ""));
let excludedUnlinkedProducts = 0;
for (const category of Object.values(catalog)) {
  const originalCount = category.items.length;
  category.items = category.items.filter(isLinkedProduct);
  excludedUnlinkedProducts += originalCount - category.items.length;
  category.total = category.items.length;
  category.pages = Math.max(1, Math.ceil(category.total / 48));
}
const imageFeatures = await json("tools/image-features.json");
const assets = await json("tools/assets.json", {});
const agentIconFiles = {
  lolobuy: ["lolobuy.png", "image/png"],
  loongbuy: ["loongbuy.ico", "image/x-icon"],
  hipobuy: ["hipobuy.png", "image/png"],
  usfans: ["usfans.png", "image/png"],
  litbuy: ["litbuy.ico", "image/x-icon"],
  cssbuy: ["cssbuy.png", "image/png"],
  joyagoo: ["joyagoo.ico", "image/x-icon"],
  sugargoo: ["sugargoo.ico", "image/x-icon"],
  orientdig: ["orientdig.ico", "image/x-icon"],
  oopbuy: ["oopbuy.png", "image/png"],
  ootdbuy: ["ootdbuy.ico", "image/x-icon"],
  kakobuy: ["kakobuy.ico", "image/x-icon"],
  lovegobuy: ["lovegobuy.ico", "image/x-icon"],
  superbuy: ["superbuy.svg", "image/svg+xml"],
};
const agentIcons = {};
for (const [id, [filename, mime]] of Object.entries(agentIconFiles)) {
  agentIcons[id] = { mime, data: (await readFile(resolve(root, "tools", "agent-icons", filename))).toString("base64") };
}
let client = await text("worker/client.js");
client = client.replace("__AGENT_ICONS__", JSON.stringify(agentIcons));
const visualIndex = Object.values(catalog).flatMap((value) => value.items).filter((product) => imageFeatures[product.aid]?.length).map((product) => ({
  aid: product.aid,
  title: product.nameEn || product.title || "",
  categoryKey: product.cat,
  image: assets[product.image] ? `/asset/${assets[product.image].key}` : `/image?url=${encodeURIComponent(product.image)}`,
  // The primary seller image is the catalogue/search thumbnail. Keeping its
  // descriptor makes every product searchable while keeping the Worker index
  // small enough to serve directly from the server-backed Site.
  features: imageFeatures[product.aid].slice(0, 1),
}));
const values = {
  MAIN_QC: mainQc,
  CATALOG: catalog,
  FEATURES: await json("tools/featured.json"),
  I18N: await json("tools/content.json"),
  GUIDE_IMAGES: await json("tools/guide-images.json", []),
  BLOCKED_IMAGES: await json("tools/blocked-images.json"),
  ASSETS: assets,
  VISUAL_INDEX_JSON: JSON.stringify(visualIndex),
  CSS: await text("worker/style.css"),
  CLIENT: client,
};
for (const [key, value] of Object.entries(values)) {
  worker = worker.replace(`__${key}__`, JSON.stringify(value));
}
worker = worker.replace("__ICON__", (await readFile(resolve(root, "tools/lolobuy-icon.png"))).toString("base64"));
worker = worker.replace("__LOGO__", (await readFile(resolve(root, "tools/lolobuy-logo.svg"))).toString("base64"));
worker = worker.replace("__OG_IMAGE__", (await readFile(resolve(root, "tools/lolobuy-og-v2.png"))).toString("base64"));
await writeFile(resolve(root, "worker/index.js"), worker);

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "server"), { recursive: true });
await mkdir(resolve(dist, ".openai"), { recursive: true });
await writeFile(resolve(dist, "visual-index.json"), JSON.stringify(visualIndex));
await cp(resolve(root, "worker", "index.js"), resolve(dist, "server", "index.js"));
await cp(resolve(root, ".openai", "hosting.json"), resolve(dist, ".openai", "hosting.json"));

console.log(`Built ${dist}; excluded ${excludedUnlinkedProducts} products without a verified Weidian ID`);
