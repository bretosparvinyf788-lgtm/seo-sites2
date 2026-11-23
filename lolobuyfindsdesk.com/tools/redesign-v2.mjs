import { readFile, writeFile } from "node:fs/promises";

const replaceRequired = (source, from, to, label) => {
  if (!source.includes(from)) throw new Error(`Missing ${label}: ${from}`);
  return source.replaceAll(from, to);
};

let template = await readFile(new URL("../worker/template.js", import.meta.url), "utf8");
for (const [from, to, label] of [
  ["LoloBuy Sheetdesk", "LoloBuy Finds Desk", "site name"],
  ["LoloBuy Spreadsheet", "LoloBuy Finds Desk", "page title"],
  ["home-v4", "home-lolo-v2", "home class"],
  ["LOLOBUY SHEETDESK", "LOLOBUY FINDS DESK", "hero eyebrow"],
  [">O.</span>", ">LO</span>", "hero mark"],
  ["#fffaf7\"><link rel=\"icon\"", "#17152b\"><link rel=\"icon\"", "theme color"],
]) template = replaceRequired(template, from, to, label);

const oldHero = '<div class="atlas-cover-title"><span class="eyebrow">LOLOBUY FINDS DESK</span><h1>${t.hero}</h1></div>';
const newHero = '<div class="atlas-cover-title"><span class="eyebrow">LOLOBUY FINDS DESK · EDIT 02</span><h1>${t.hero}</h1><div class="hero-badges"><span>4,000+ finds</span><span>10 departments</span><span>Photo search</span></div></div>';
template = replaceRequired(template, oldHero, newHero, "hero badges");
await writeFile(new URL("../worker/template.js", import.meta.url), template);

let content = await readFile(new URL("content.json", import.meta.url), "utf8");
for (const [from, to, label] of [
  ['"spreadsheet": "Spreadsheet"', '"spreadsheet": "Finds"', "nav label"],
  ['"hero": "LoloBuy<br>Spreadsheet<span>.</span>"', '"hero": "Find it in China.<br><em>Ship it your way.</em>"', "hero"],
  ['"intro": "Your next find, without the endless tabs. Explore shoes, clothing and everyday extras. Compare seller photos, check the details, then make your move."', '"intro": "A fast, visual way to browse Chinese marketplace finds. Search the catalogue, compare seller and QC photos, then continue on LoloBuy when you are ready."', "intro"],
  ['"explore": "Explore the collection"', '"explore": "Start exploring"', "explore"],
  ['"index": "The category index"', '"index": "Shop the edit"', "index"],
  ['"selected": "On the desk"', '"selected": "Fresh drops"', "selected"],
  ['"selectedDesc": "A fresh selection from the collection. Open a find to see its seller gallery and available QC photos."', '"selectedDesc": "A rotating edit of standout finds. Open any item for seller photos, price context and available QC references."', "selected description"],
  ['"categoriesTitle": "Find your kind of find"', '"categoriesTitle": "Pick a lane. Find your thing"', "categories title"],
  ['"guideTeaser": "Find it. Check it. Make it yours."', '"guideTeaser": "From link to parcel, minus the guesswork."', "guide teaser"],
  ["LoloBuy Sheetdesk", "LoloBuy Finds Desk", "brand references"],
]) content = replaceRequired(content, from, to, label);
await writeFile(new URL("content.json", import.meta.url), content);
