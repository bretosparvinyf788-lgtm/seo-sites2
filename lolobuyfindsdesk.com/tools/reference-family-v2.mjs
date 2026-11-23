import { readFile, writeFile } from "node:fs/promises";

const cssUrl = new URL("../worker/style.css", import.meta.url);
let css = await readFile(cssUrl, "utf8");
const marker = "/* LoloBuy Finds Desk V2: spreadsheet workspace. */";
if (!css.includes(marker)) throw new Error("Missing spreadsheet CSS marker");
css = css.slice(0, css.indexOf(marker)).trimEnd() + "\n";
await writeFile(cssUrl, css);

const templateUrl = new URL("../worker/template.js", import.meta.url);
let template = await readFile(templateUrl, "utf8");
template = template.replace('<div class="atlas-cover-inner"><div class="sheet-toolbar"><span class="sheet-file">LoloBuy Finds Desk</span><span>File</span><span>Edit</span><span>View</span><span>Data</span><span class="sheet-status">Saved</span></div><div class="atlas-spine">', '<div class="atlas-cover-inner"><div class="atlas-spine">');
template = template.replace('<div class="sheet-column-head"><span>#</span><span>Preview</span><span>Product / category</span><span>Price</span></div><div class="atlas-spread">', '<div class="atlas-spread">');
await writeFile(templateUrl, template);
