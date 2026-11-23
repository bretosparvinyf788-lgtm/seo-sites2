import { readFile, writeFile } from "node:fs/promises";

const cssUrl = new URL("../worker/style.css", import.meta.url);
let css = await readFile(cssUrl, "utf8");
const marker = "/* LoloBuy Finds Desk V2: quiet reference desk. */";
if (!css.includes(marker)) throw new Error("Missing quiet-design CSS marker");
css = css.slice(0, css.indexOf(marker)).trimEnd() + "\n";
await writeFile(cssUrl, css);

const templateUrl = new URL("../worker/template.js", import.meta.url);
let template = await readFile(templateUrl, "utf8");
const coverNeedle = '<div class="atlas-cover-inner"><div class="atlas-spine">';
const coverReplacement = '<div class="atlas-cover-inner"><div class="sheet-toolbar"><span class="sheet-file">LoloBuy Finds Desk</span><span>File</span><span>Edit</span><span>View</span><span>Data</span><span class="sheet-status">Saved</span></div><div class="atlas-spine">';
if (!template.includes(coverNeedle)) throw new Error("Missing cover marker");
template = template.replace(coverNeedle, coverReplacement);

const spreadNeedle = '<div class="atlas-spread">${visible.map((p,i)=>atlasEntry(p,c,(page-1)*6+i)).join(\'\')}</div>';
const spreadReplacement = '<div class="sheet-column-head"><span>#</span><span>Preview</span><span>Product / category</span><span>Price</span></div><div class="atlas-spread">${visible.map((p,i)=>atlasEntry(p,c,(page-1)*6+i)).join(\'\')}</div>';
if (!template.includes(spreadNeedle)) throw new Error("Missing product grid marker");
template = template.replace(spreadNeedle, spreadReplacement);
await writeFile(templateUrl, template);
