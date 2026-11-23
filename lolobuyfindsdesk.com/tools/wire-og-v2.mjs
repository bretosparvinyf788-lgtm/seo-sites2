import { readFile, writeFile } from "node:fs/promises";

let source = await readFile(new URL("../worker/template.js", import.meta.url), "utf8");
const changes = [
  ["ICON='__ICON__', LOGO='__LOGO__'", "ICON='__ICON__', LOGO='__LOGO__', OG_IMAGE='__OG_IMAGE__'"],
  ['<meta property="og:url" content="${canonical.href}"><style>', '<meta property="og:url" content="${canonical.href}"><meta property="og:image" content="${SITE_ORIGIN}/og.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${SITE_ORIGIN}/og.png"><style>'],
  ["if(u.pathname==='/favicon.ico')return imageFromBase64(ICON,'image/png');", "if(u.pathname==='/favicon.ico')return imageFromBase64(ICON,'image/png');if(u.pathname==='/og.png')return imageFromBase64(OG_IMAGE,'image/png');"],
];
for (const [from, to] of changes) {
  if (!source.includes(from)) throw new Error(`Missing template marker: ${from}`);
  source = source.replace(from, to);
}
await writeFile(new URL("../worker/template.js", import.meta.url), source);
