import { readFile, writeFile } from "node:fs/promises";

const url = new URL("../worker/template.js", import.meta.url);
let source = await readFile(url, "utf8");
const from = '<img class="brand-wordmark" src="/lolobuy-logo.svg" alt="LoloBuy" width="128" height="30"><span class="brand-site-label">FINDS DESK</span>';
const to = '<span class="brand-wordmark-text" aria-hidden="true"><span>Lolo</span><b>Buy</b></span><span class="brand-site-label">FINDS DESK</span>';
if (!source.includes(from)) throw new Error("Missing incorrect header image");
source = source.replace(from, to);
await writeFile(url, source);
