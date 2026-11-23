import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const path = (name) => resolve(root, name);

let template = await readFile(path("worker/template.js"), "utf8");
template = template.replace(
  "const CATALOG=__CATALOG__, FEATURES=__FEATURES__, I18N=__I18N__, ICON='__ICON__',",
  "const CATALOG=__CATALOG__, FEATURES=__FEATURES__, I18N=__I18N__, ICON='__ICON__', LOGO='__LOGO__',",
);
template = template.replace(
  "const SIGNUP='https://ootdbuy.com/register?inviteCode=PY4OUQ9A1';",
  "const SIGNUP='https://www.lolobuy.com/index?inviteCode=199df';\nconst FEATURED_BUY='https://www.lolobuy.com/productDetail/1787575225494951?url=https://weidian.com/item.html?itemID=7896594713&inviteCode=5mz7f';",
);
template = template.replace(
  "const SITE_ORIGIN='https://ootdbuysheetdesk.com';",
  "const SITE_ORIGIN='https://lolobuyfindsdesk.com';",
);
template = template.replace(
  "buy='https://ootdbuy.com/goods/details?id='+encodeURIComponent(p.id)+'&channel=weidian&inviteCode=endoren'",
  "buy=p.id==='7896594713'?FEATURED_BUY:'https://www.lolobuy.com/index?inviteCode=5mz7f&url='+encodeURIComponent('https://weidian.com/item.html?itemID='+p.id)",
);
template = template.replace(
  '<img src="/favicon.ico" alt="OOTDBuy" width="32" height="32"><span>ootdbuy</span>',
  '<img class="brand-wordmark" src="/lolobuy-logo.svg" alt="LoloBuy" width="128" height="30">',
);
template = template.replace(
  "if(u.pathname==='/favicon.ico')return imageFromBase64(ICON,'image/x-icon');",
  "if(u.pathname==='/favicon.ico')return imageFromBase64(ICON,'image/png');if(u.pathname==='/lolobuy-logo.svg')return imageFromBase64(LOGO,'image/svg+xml');",
);
template = template
  .replaceAll("ootdbuysheetdesk.com", "lolobuyfindsdesk.com")
  .replaceAll("OOTDBUY", "LOLOBUY")
  .replaceAll("OOTDBuy", "LoloBuy")
  .replaceAll("ootdbuy", "lolobuy")
  .replaceAll("G-SN1WS560YB", "G-G15SH577PC")
  .replaceAll("#fffaf5", "#fffaf7");
await writeFile(path("worker/template.js"), template);

let content = await readFile(path("tools/content.json"), "utf8");
content = content
  .replaceAll("ootdbuysheetdesk.com", "lolobuyfindsdesk.com")
  .replaceAll("OOTDBUY", "LOLOBUY")
  .replaceAll("OOTDBuy", "LoloBuy")
  .replaceAll("ootdbuy", "lolobuy");
await writeFile(path("tools/content.json"), `${JSON.stringify(JSON.parse(content), null, 2)}\n`);

let style = await readFile(path("worker/style.css"), "utf8");
style = style.replace(
  ":root{--brand-orange:#f87008;--brand-orange-dark:#d95d00;--brand-peach:#f8c898;--paper:#fffaf5;--ink:#1f1a17;--red:var(--brand-orange);--line:#eadfd5;--muted:#7b7068}",
  ":root{--brand-orange:#ff9f00;--brand-orange-dark:#d53b10;--brand-peach:#ffccb8;--paper:#fffaf7;--ink:#2a211f;--red:#ff5e34;--line:#f0ddd5;--muted:#786b66}",
);
style += `
/* Official LoloBuy wordmark treatment. */
.brand-wordmark{width:128px!important;height:30px!important;object-fit:contain}.brand{min-width:128px}.atlas-cover-inner{background:linear-gradient(135deg,#ff5e34 0%,#ff9f00 100%)}.register{background:#ff5e34}.register:hover{background:#d53b10}.home-search-suggestions{color:#fff8f2}@media(max-width:700px){.brand-wordmark{width:108px!important;height:auto!important}.brand{min-width:108px}}
`;
await writeFile(path("worker/style.css"), style);
