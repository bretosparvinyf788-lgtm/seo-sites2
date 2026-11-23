import { readFile, writeFile } from "node:fs/promises";

const url = new URL("../worker/template.js", import.meta.url);
let source = await readFile(url, "utf8");

const required = (from, to, label) => {
  if (!source.includes(from)) throw new Error(`Missing ${label}`);
  source = source.replace(from, to);
};

required(
  '<img class="brand-wordmark" src="/lolobuy-logo.svg" alt="LoloBuy" width="128" height="30">',
  '<img class="brand-wordmark" src="/lolobuy-logo.svg" alt="LoloBuy" width="128" height="30"><span class="brand-site-label">FINDS DESK</span>',
  "header brand"
);

const previewFunction = `function loloLaunchPreview(items,c){const{t,link}=c;return \`<div class="lolo-launch-preview"><div class="lolo-preview-bar"><span>LOLOBUY PRODUCT SHEET</span><strong>LIVE FINDS</strong></div><div class="lolo-preview-grid">\${items.map((p,i)=>\`<a href="\${link('/product/'+p.aid)}"><span class="lolo-preview-index">\${String(i+1).padStart(2,'0')}</span><img src="\${esc(imageURL(p.image))}" alt="\${esc(headingName(p,t))}" width="320" height="320"><span class="lolo-preview-copy"><strong>\${esc(headingName(p,t))}</strong><small>\${esc(t.shortCategories[p.cat-2])}</small></span><span class="lolo-preview-price">\${price(p,t)}</span></a>\`).join('')}</div></div>\`;}
`;
required("function home(c){", previewFunction + "function home(c){", "home function");
required('<div class="atlas-cover-inner"><div class="atlas-spine">', '<div class="atlas-cover-inner">${loloLaunchPreview(featured.slice(0,4),c)}<div class="atlas-spine">', "hero preview");
required('${homeHow(c)}${homeCategoryGuide(c)}', '${homeCategoryGuide(c)}', "three explainer cards");

await writeFile(url, source);
