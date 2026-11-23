import { readFile, writeFile } from "node:fs/promises";

const url = new URL("../worker/template.js", import.meta.url);
let source = await readFile(url, "utf8");
const from = '<div class="atlas-cover-inner">${loloLaunchPreview(featured.slice(0,4),c)}<div class="atlas-spine">';
const to = '<div class="atlas-cover-inner"><div class="atlas-spine">';
if (!source.includes(from)) throw new Error("Missing launch preview insertion");
source = source.replace(from, to);
await writeFile(url, source);
