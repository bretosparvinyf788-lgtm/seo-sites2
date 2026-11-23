import { readFile, writeFile } from "node:fs/promises";

const cssUrl = new URL("../worker/style.css", import.meta.url);
let css = await readFile(cssUrl, "utf8");
const marker = "/* LoloBuy Finds Desk V2: midnight bento travel magazine. */";
if (!css.includes(marker)) throw new Error("Missing V2 CSS marker");
css = css.slice(0, css.indexOf(marker)).trimEnd() + "\n";
await writeFile(cssUrl, css);

const templateUrl = new URL("../worker/template.js", import.meta.url);
let template = await readFile(templateUrl, "utf8");
template = template.replace('<span class="eyebrow">LOLOBUY FINDS DESK · EDIT 02</span><h1>${t.hero}</h1><div class="hero-badges"><span>4,000+ finds</span><span>10 departments</span><span>Photo search</span></div>', '<span class="eyebrow">LOLOBUY FINDS DESK</span><h1>${t.hero}</h1>');
await writeFile(templateUrl, template);
