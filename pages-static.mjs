import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {configureStatic,superProduct} from './static-data.mjs';
import {installHeadRewriter} from './pages-home.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const data=JSON.parse(fs.readFileSync(path.join(root,'common/catalogue.json'))),fx=JSON.parse(fs.readFileSync(path.join(root,'common/rates.json')));
configureStatic(data,fx);
const defaultLanguages=['en','de','fr','es','it','nl','pt','pl','ro','sv','zh','da','fi','el','cs','hu','bg','sk','hr','ja','ko','vi','th','id'];
const slugs=['shoes','t-shirts','clothing','hoodies','pants','belts','bags','perfume','electronics','other'];
const ga={'vigorbuysheetdesk.com':'G-Q1QMYKSCX9','orientdigsheetdesk.com':'G-PYD6BSR5Y8','cssbuyfindshub.com':'G-Z9V5QHJJHP','kakobuysheetdesk.com':'G-TQ0S977B2V','lovegobuysheetlab.com':'G-EY5KH97XMY','oopbuyqcguide.com':'G-PSFZGP4H0M','sugargoosheetdesk.com':'G-CF8XXTL53F','ootdbuysheetdesk.com':'G-SN1WS560YB','lolobuyfindsdesk.com':'G-G15SH577PC'};
const replaceLiteral=(s,name,value)=>{const re=new RegExp('\\b'+name+'=');const m=re.exec(s);if(!m)throw Error('Missing literal '+name);let i=m.index+m[0].length,j=i;const first=s[i];if(first==='{'||first==='['){let depth=0,quote=false,escape=false;for(;j<s.length;j++){const c=s[j];if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c==='"')quote=false}else if(c==='"')quote=true;else if(c==='['||c==='{')depth++;else if(c===']'||c==='}'){if(!--depth){j++;break}}}}else throw Error('Not a JSON literal '+name);return s.slice(0,i)+JSON.stringify(value)+s.slice(j)};
export function patchWorker(source,domain){
 if(/^(kakobuy|sugargoo)/.test(domain)){
  const catalogue=Object.fromEntries(Array.from({length:10},(_,i)=>{const items=data.items.filter(p=>p.cat===i+2).map(p=>({...p,aid:p.id,nameEn:p.english}));return [i+2,{items,pages:Math.ceil(items.length/48),total:items.length}]}));
  source=replaceLiteral(source,'CATALOG',catalogue);
  if(domain.startsWith('sugargoo'))source=replaceLiteral(source,'RATES',{rates:fx.rates,updated:fx.time_last_update_utc});
 }
 if(domain.startsWith('superbuy')){source=replaceLiteral(source,'CATALOGUE',data.items.map(p=>superProduct(p.id)));source=replaceLiteral(source,'SEEDS',Object.fromEntries(data.items.map(p=>[p.id,superProduct(p.id)])));}
 if(!/^(lovegobuy|oopbuy|ootdbuy|lolobuy)/.test(domain))source=fs.readFileSync(path.join(root,'static-data.mjs'),'utf8')+'\n'+source;
 return source;
}
export async function exportStatic(domain,out,source){
 const revision=createHash('sha256').update(fs.readFileSync(path.join(root,'pages-client.js'))).update(fs.readFileSync(path.join(root,'static-data.mjs'))).update(fs.readFileSync(path.join(root,'common/catalogue.json'))).update(source||'').digest('hex').slice(0,12);
 const write=(f,v)=>{fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,v)};
 let languages=defaultLanguages;
 if(/^(kakobuy|sugargoo|ootdbuy|lolobuy)/.test(domain))languages=Object.keys(JSON.parse(fs.readFileSync('tools/content.json')));
 else if(domain.startsWith('superbuy'))languages=(await import(path.join(root,domain,'src/content.js'))).LANGS.map(x=>x[0]);
 else if(domain.startsWith('cssbuy'))languages=JSON.parse(fs.readFileSync('app/hub.tsx','utf8').match(/const languages=(\[.*?\]);/)[1].replaceAll("'",'"')).map(x=>x[0]);
 else if(/^(lovegobuy|oopbuy)/.test(domain))languages=[...fs.readFileSync('lib/i18n.ts','utf8').match(/export const languages[^=]*=\{([^}]+)\}/)[1].matchAll(/(?:^|,)\s*(\w+):/g)].map(x=>x[1]);
 const legacy=/^(kakobuy|sugargoo|lovegobuy|oopbuy)/.test(domain),css=domain.startsWith('cssbuy'),desk=/^(vigorbuy|orientdig)/.test(domain),superbuy=domain.startsWith('superbuy');
 let pages=['/'],get,close=()=>{};
 if(css){
  pages.push('/all-finds','/guide','/qc-guide','/shipping-guide',...slugs.map(s=>'/categories/'+(s==='clothing'?'fashion-clothing':s)));
  const port=8798,child=spawn(process.execPath,['node_modules/wrangler/bin/wrangler.js','pages','dev',out,'--ip=127.0.0.1','--port='+port,'--compatibility-date=2026-05-15','--compatibility-flags=nodejs_compat','--inspector-port=0'],{stdio:['ignore','pipe','pipe'],env:{...process.env,WRANGLER_SEND_METRICS:'false'}});let logs='';child.stdout.on('data',b=>logs=(logs+b).slice(-4000));child.stderr.on('data',b=>logs=(logs+b).slice(-4000));close=()=>child.kill('SIGTERM');
  get=async p=>fetch('http://127.0.0.1:'+port+p,{headers:{Host:domain},signal:AbortSignal.timeout(60000)});
  const deadline=Date.now()+60000;for(;;){try{await get('/');break}catch(e){if(child.exitCode!==null||Date.now()>deadline)throw Error('Preview failed: '+logs);await new Promise(r=>setTimeout(r,300))}}
 }else{
  installHeadRewriter();source=patchWorker(source,domain);
  if(domain.startsWith('ootdbuy'))source=source.replace('if(sourceAid){','if(sourceAid&&globalThis.__OOTDBUY_LIVE){').replace("if(p.id&&(!known||aid==='7896594713')){","if(p.id&&globalThis.__OOTDBUY_LIVE&&(!known||aid==='7896594713')){");
  const module=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));if(typeof module.configureStatic==='function')module.configureStatic(data,fx);
  get=p=>module.default.fetch(new Request('https://'+domain+p),process.env,{});
  if(legacy){
   const headShim=`globalThis.HTMLRewriter=class{handlers=[];on(s,h){this.handlers.push(h);return this}transform(r){const hs=this.handlers;return new Response(new ReadableStream({async start(c){let a='';for(const h of hs)h.element({append(v){a+=v}});c.enqueue(new TextEncoder().encode((await r.text()).replace('</head>',a+'</head>')));c.close()}}),{status:r.status,headers:r.headers})}};\n`;
   write(out+'/page-renderer.mjs',headShim+source);
   pages.push(domain.startsWith('oopbuy')?'/products':'/finds','/guide',...slugs.map((s,i)=>'/category/'+(domain.startsWith('oopbuy')?i+2:s)));
   if(/^(lovegobuy|oopbuy)/.test(domain))pages.push('/categories');
   if(domain.startsWith('lovegobuy'))pages.push('/qc-checklist','/faq');
  }else if(/^(ootdbuy|lolobuy)/.test(domain))pages.push('/categories','/image-search','/finds',...slugs.map(s=>'/category/'+s));
  else if(desk)pages.push('/catalog/','/categories/','/faq/','/saved/','/privacy/',...slugs.map((s,i)=>'/category/'+i+'/'),...(domain.startsWith('orientdig')?['/image-search/']:[]));
  else if(superbuy)pages.push('/spreadsheet','/guide','/saved',...slugs.map(s=>'/category/'+(s==='perfume'?'fragrance':s)));
 }
 const productBase=css?'/products/':'/product/';
 const localProducts=/^(ootdbuy|lolobuy)/.test(domain)?Object.values(JSON.parse(fs.readFileSync('tools/catalog-full.json'))).flatMap(v=>v.items):[];
 const linkedProducts=domain.startsWith('lolobuy')?(()=>{const qc=JSON.parse(fs.readFileSync('tools/main-qc.json'));return localProducts.filter(p=>/^\d+$/.test(String(qc.items[p.aid]?.id||'')))})():localProducts;
 const productIds=/^(ootdbuy|lolobuy)/.test(domain)?[...new Set([...linkedProducts.map(p=>p.aid),'7896594713'])]:[...new Set([...data.items.map(p=>p.id),...(/^(kakobuy|sugargoo)/.test(domain)?Object.keys(data.aliases||{}):[])])];
 pages.push(...productIds.map(id=>productBase+id+(desk?'/':'')));
 const htmlFile=p=>p==='/'?'index.html':p.endsWith('/')?p.slice(1)+'index.html':p.slice(1)+'.html';
 function inject(html){
  html=html.replaceAll('"/favicon.ico"','"/favicon.ico?v='+revision+'"');
  html=html.replace(/(src|href)="\/(?:media|image)\?url=([^"]+)"/g,(m,a,u)=>{try{return a+'="'+decodeURIComponent(u.replaceAll('&amp;','&')).replaceAll('&','&amp;')+'"'}catch{return m}});
  const id=ga[domain],directAnalytics=id?`<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');</script>`:'';
  if(id&&/^(ootdbuy|lolobuy)/.test(domain)){const allowed=JSON.stringify([domain,'www.'+domain]);html=html.replace(directAnalytics,`<script>if(${allowed}.includes(location.hostname)){const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${id}';document.head.append(s);window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}')}</script>`)}
  else if(id&&!html.includes(id))html=html.replace('</head>',directAnalytics+'</head>');
  const originalScripts=legacy?`<script>if(location.search&&!window.__pagesRendered){document.documentElement.dataset.staticQuery='1'}</script>`:'';
  // Defer the original inline application during query rendering; the renderer writes it once.
  if(legacy)html=html.replace(/<script(?![^>]*type="application\/ld\+json")[^>]*>[\s\S]*?<\/script>/g,m=>'<script>if(!location.search)document.write('+JSON.stringify(m).replaceAll('<','\\u003c')+')</script>');
  return html.replace('</head>',`<script>window.__pagesEnv=${JSON.stringify({...Object.fromEntries(['GOOGLE_SITE_VERIFICATION','BING_SITE_VERIFICATION'].filter(k=>process.env[k]).map(k=>[k,process.env[k]])),GA_MEASUREMENT_ID:ga[domain]})}</script><script>window.__pagesVersion='${revision}'</script><script src="/pages-client.js?v=${revision}"></script>${originalScripts}</head>`);
 }
 try{
  // Preserve the four existing background-only QC retouches as static images.
  if(css)for(const key of ['3618-2','3618-3','3618-4','3618-5']){const r=await get('/api/qc-image/'+key+(key==='3618-5'?'?v=2':''));if(!r.ok)throw Error('QC retouch export failed '+key);const bytes=Buffer.from(await r.arrayBuffer());let svg=bytes.toString('utf8');const wranglerRequire=createRequire(fs.realpathSync('node_modules/wrangler/package.json')),sharp=createRequire(wranglerRequire.resolve('miniflare'))('sharp');for(const match of [...svg.matchAll(/data:image\/webp;base64,([^"]+)/g)]){const png=await sharp(Buffer.from(match[1],'base64')).png().toBuffer();svg=svg.replace(match[0],'data:image/png;base64,'+png.toString('base64'))}write(out+'/api/qc-image/'+key,await sharp(svg.includes('<svg')?Buffer.from(svg):bytes).webp({quality:92}).toBuffer())}
  let next=0,completed=0;const work=async()=>{while(next<pages.length){const p=pages[next++];if(domain.startsWith('lolobuy')&&p.startsWith(productBase)){completed++;continue}const r=await get(p);if(!r.ok)throw Error('Static page failed '+p+': '+r.status);const html=await r.text();if(!html.includes('<html')||html.length<1000)throw Error('Incomplete static page '+p);write(out+'/'+htmlFile(p),inject(html));if(++completed%500===0)console.log('Exported '+completed+'/'+pages.length+' '+domain)}};
  await Promise.all(Array.from({length:css?4:1},work));
  // Per-language maps stay below the 50,000 URL limit, including all detail pages.
  const origin='https://'+domain,escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
  const publicPages=pages.filter(p=>!p.includes('saved')&&!p.includes('privacy'));
  const xml=(entries)=>'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+entries.map(loc=>'<url><loc>'+escape(loc)+'</loc><lastmod>'+data.updatedAt.slice(0,10)+'</lastmod></url>').join('')+'</urlset>';
  write(out+'/robots.txt','User-agent: *\nAllow: /\nDisallow: /saved\nDisallow: /api/\nSitemap: '+origin+'/sitemap.xml\n');
  write(out+'/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+languages.map(l=>'<sitemap><loc>'+origin+'/sitemap-'+l+'.xml</loc></sitemap>').join('')+'</sitemapindex>');
  for(const l of languages){const value=xml(publicPages.map(p=>origin+p+(l==='en'?'':'?lang='+l)));write(out+'/sitemap-'+l+'.xml',value);write(out+'/sitemaps/'+l+'/pages.xml',xml(publicPages.filter(p=>!p.startsWith(productBase)).map(p=>origin+p+(l==='en'?'':'?lang='+l))));write(out+'/sitemaps/'+l+'/products-1.xml',xml(publicPages.filter(p=>p.startsWith(productBase)).map(p=>origin+p+(l==='en'?'':'?lang='+l))))}
  write(out+'/sitemaps/pages.xml',xml(publicPages.filter(p=>!p.startsWith(productBase)).map(p=>origin+p)));
  const productPages=publicPages.filter(p=>p.startsWith(productBase));for(let i=0;i<productPages.length;i+=50)write(out+'/sitemaps/products-'+(i/50+1)+'.xml',xml(productPages.slice(i,i+50).map(p=>origin+p)));
  write(out+'/404.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found</title><body><h1>Page not found</h1><p>The requested page is unavailable.</p><a href="/">Return to the homepage</a></body></html>');
  if(!/^(ootdbuy|lolobuy)/.test(domain))for(const name of ['_worker.js','_routes.json'])fs.rmSync(out+'/'+name,{recursive:true,force:true});
  write(out+'/static-data.mjs',fs.readFileSync(path.join(root,'static-data.mjs')));write(out+'/pages-client.js',fs.readFileSync(path.join(root,'pages-client.js')));write(out+'/catalogue.json',JSON.stringify(data));write(out+'/rates.json',JSON.stringify(fx));
  write(out+'/_headers',(fs.existsSync(out+'/_headers')?fs.readFileSync(out+'/_headers','utf8')+'\n':'')+'/*.mjs\n  Content-Type: application/javascript; charset=utf-8\n/robots.txt\n  Content-Type: text/plain; charset=utf-8\n/sitemap*.xml\n  Content-Type: application/xml; charset=utf-8\n/api/qc-image/*\n  Content-Type: image/webp\n');
  console.log(JSON.stringify({domain,pages:pages.length,products:productIds.length,languages:languages.length,hosting:'Cloudflare Pages',functions:/^(ootdbuy|lolobuy)/.test(domain)?1:0}));
 }finally{close()}
}
