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
const imageFeatures = await json("tools/image-features.json");
const assets = await json("tools/assets.json", {});
const visualIndex = Object.values(catalog).flatMap((value) => value.items).filter((product) => imageFeatures[product.aid]?.length).map((product) => ({
  aid: product.aid,
  title: product.nameEn || product.title || "",
  categoryKey: product.cat,
  image: assets[product.image] ? `/asset/${assets[product.image].key}` : `/image?url=${encodeURIComponent(product.image)}`,
  features: imageFeatures[product.aid],
}));
const values = {
  MAIN_QC: await json("tools/main-qc.json"),
  CATALOG: catalog,
  FEATURES: await json("tools/featured.json"),
  I18N: await json("tools/content.json"),
  GUIDE_IMAGES: await json("tools/guide-images.json", []),
  BLOCKED_IMAGES: await json("tools/blocked-images.json"),
  ASSETS: assets,
  CSS: await text("worker/style.css"),
  CLIENT: await text("worker/client.js"),
};
for (const [key, value] of Object.entries(values)) {
  worker = worker.replace(`__${key}__`, JSON.stringify(value));
}
worker = worker.replace("__ICON__", (await readFile(resolve(root, "tools/favicon.ico"))).toString("base64"));
await writeFile(resolve(root, "worker/index.js"), worker);

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "server"), { recursive: true });
await mkdir(resolve(dist, ".openai"), { recursive: true });
await writeFile(resolve(dist, "visual-index.json"), JSON.stringify(visualIndex));
await cp(resolve(root, "worker", "index.js"), resolve(dist, "server", "index.js"));
await cp(resolve(root, ".openai", "hosting.json"), resolve(dist, ".openai", "hosting.json")).catch((error) => {
  if (error.code !== "ENOENT") throw error;
});

console.log(`Built ${dist}`);
