if(process.env.CF_PAGES_BRANCH==='main')throw Error('Internal QA build cannot run on main');
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const manifest=JSON.parse(fs.readFileSync('release-manifest.json','utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const parts=manifest.parts.map(p=>{const b=fs.readFileSync(p.path);if(hash(b)!==p.sha256)throw Error('Release part checksum mismatch: '+p.path);return b});
const archive=Buffer.concat(parts);if(hash(archive)!==manifest.archive_sha256)throw Error('Release archive checksum mismatch');
fs.writeFileSync('site-source.tar.xz',archive);execFileSync('tar',['-xJf','site-source.tar.xz','--no-same-owner']);
const c=JSON.parse(fs.readFileSync('dist/catalog.json','utf8'));
const gi=JSON.parse(fs.readFileSync('dist/gallery-index.json','utf8'));
if(c.length!==manifest.products||Object.keys(gi).length!==manifest.galleries||c.some(p=>!['available','no_images'].includes(gi[p.id]?.status)))throw Error('Incomplete catalogue or gallery data');
fs.writeFileSync('dist/production-analytics.js',`(()=>{if(!['usfanssheetdesk.com','www.usfanssheetdesk.com'].includes(location.hostname))return;window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','G-4K90H51CBJ');const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-4K90H51CBJ';document.head.appendChild(s)})();`);
function walk(dir){for(const p of fs.readdirSync(dir,{withFileTypes:true})){const full=dir+'/'+p.name;if(p.isDirectory())walk(full);else if(p.name.endsWith('.html')){let html=fs.readFileSync(full,'utf8');html=html.replace('</head>','<script defer src="/production-analytics.js"></script></head>');fs.writeFileSync(full,html)}}}
walk('dist');
fs.writeFileSync('dist/404.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | USFans</title><body><main style="max-width:640px;margin:15vh auto;padding:24px;font:18px system-ui"><img src="/assets/usfans-logo.webp" alt="USFans" width="120"><h1>Page not found</h1><p>This page is unavailable. Browse the current catalogue to find your item.</p><a href="/spreadsheet/">Browse Spreadsheet</a></main></body></html>');
// Canonical www redirects are managed by the zone's HTTP redirect rule.
if(fs.existsSync('dist/_redirects'))fs.unlinkSync('dist/_redirects');
fs.writeFileSync('dist/_headers','/*\n  Referrer-Policy: no-referrer\n  X-Content-Type-Options: nosniff\n/catalog.json\n  Cache-Control: no-store\n/gallery-index.json\n  Cache-Control: no-store\n/data/galleries/*\n  Cache-Control: no-store\n');
if(fs.existsSync('verification'))fs.cpSync('verification','dist',{recursive:true});
console.log(`Prepared ${c.length} products, ${manifest.galleries} verified galleries and production-only analytics.`);

const qa=JSON.parse(fs.readFileSync('qa/manifest.json','utf8'));
const qaParts=qa.parts.map(p=>{const b=fs.readFileSync(p.path);if(hash(b)!==p.sha256)throw Error('QA checksum');return b});
const qaArchive=Buffer.concat(qaParts);if(hash(qaArchive)!==qa.sha256)throw Error('QA archive checksum');
fs.writeFileSync('qa-overlay.tar.xz',qaArchive);execFileSync('tar',['-xJf','qa-overlay.tar.xz','--no-same-owner']);
const oldIndex=fs.readFileSync('dist/index.html','utf8');
for(const [source,pattern] of [['qa-app.js',/assets\/(app-[a-f0-9]+\.js)/],['qa-style.css',/assets\/(style-[a-f0-9]+\.css)/]]){const m=oldIndex.match(pattern);if(!m)throw Error('Missing QA asset');fs.copyFileSync(source,'dist/assets/'+m[1])}
fs.appendFileSync('dist/_headers','/*\n  X-Robots-Tag: noindex, nofollow\n');
fs.writeFileSync('dist/robots.txt','User-agent: *\nDisallow: /\n');
console.log('Internal partial-index runtime QA only; full production gate remains required');
