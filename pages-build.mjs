import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {renderPagesHome,installHeadRewriter} from './pages-home.mjs';

// Each Pages project watches its own directory and this shared build entry.
const domain=process.argv[2];
const root=path.dirname(new URL(import.meta.url).pathname);
const directory=path.join(root,domain||'');
if(!domain||!fs.existsSync(path.join(directory,'package.json')))throw new Error('Unknown site directory');
process.chdir(directory);
const run=(command,args)=>execFileSync(command,args,{stdio:'inherit'});
const write=(file,value)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,value)};
const out='pages-dist';
const copyPublic=()=>{if(fs.existsSync('public'))fs.cpSync('public',out,{recursive:true})};
const routes=exclude=>write(out+'/_routes.json',JSON.stringify({version:1,include:['/*'],exclude}));
const moduleFrom=async source=>import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const assetsFrom=async(worker,paths)=>{for(const p of paths){const r=await worker.fetch(new Request('https://'+domain+p),{},{});if(!r.ok)throw new Error('Static asset failed: '+p);write(out+p,Buffer.from(await r.arrayBuffer()))}};
const homeFrom=async worker=>{const r=await worker.fetch(new Request('https://'+domain+'/'),process.env,{});if(r.ok&&r.headers.get('content-type')?.includes('text/html'))write(out+'/index.html',await r.text());else throw new Error('Homepage build failed: '+r.status)};
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
if(domain==='cssbuyfindshub.com'){
 run('npx',['--yes','pnpm@11.25.0','install','--frozen-lockfile']);
 run('node',['scripts/build-cloudflare-pages.mjs']);
 await renderPagesHome(domain,out);
}else if(domain==='kakobuysheetdesk.com'){
 run('python3',['scripts/build-cloudflare.py']);
 fs.cpSync('cloudflare-dist',out,{recursive:true});
 const source=fs.readFileSync(out+'/_worker.js','utf8');
 await homeFrom((await moduleFrom(source)).default);
}else if(domain==='sugargoosheetdesk.com'){
 run('python3',['tools/build.py']);
 let source=fs.readFileSync('dist/server/index.js','utf8');
 const data=JSON.parse(fs.readFileSync('tools/assets.json'));
 for(const a of Object.values(data))write(out+'/asset/'+a.key,Buffer.from(a.data,'base64'));
 const guides=JSON.parse(fs.readFileSync('tools/guide-images.json'));
 guides.forEach((b,i)=>write(out+'/guide-image/'+i,Buffer.from(b,'base64')));
 // Do not bundle several megabytes of static images into every invocation.
 source=source.replace('ASSETS='+JSON.stringify(data),'ASSETS='+JSON.stringify(Object.fromEntries(Object.entries(data).map(([u,a])=>[u,{key:a.key}]))));
 const assetStart=source.indexOf("if(u.pathname.startsWith('/asset/'))");
 const assetEnd=source.indexOf("if(u.pathname==='/image')",assetStart);
 if(assetStart<0||assetEnd<0)throw new Error('Sugargoo asset handler changed');
 source=source.slice(0,assetStart)+"if(u.pathname.startsWith('/asset/')||u.pathname.startsWith('/guide-image/'))return env.ASSETS.fetch(request);\n"+source.slice(assetEnd);
 source=source.replace(/GUIDE_IMAGES=\[[^\]]*\]/,'GUIDE_IMAGES='+JSON.stringify(guides.map(()=>true)));
 write(out+'/_worker.js',source);
 const worker=(await moduleFrom(source)).default;
 await assetsFrom(worker,['/favicon.ico']);await homeFrom(worker);
 routes(['/asset/*','/guide-image/*','/favicon.ico']);
 write(out+'/_headers','/asset/*\n  Content-Type: image/webp\n  Cache-Control: public, max-age=86400\n/guide-image/*\n  Content-Type: image/png\n  Cache-Control: public, max-age=86400\n');
}else if(domain==='oopbuyqcguide.com'){
 run('npm',['install','--no-audit','--no-fund']);run('npm',['run','build']);
 fs.cpSync('dist',out,{recursive:true});
 installHeadRewriter();await homeFrom((await moduleFrom(fs.readFileSync(out+'/_worker.js','utf8'))).default);
 routes(['/site.css','/site.js','/favicon*','/apple-touch-icon.png','/oopbuy-logo.png','/guide/*','/qc-repairs/*']);
}else if(domain==='lovegobuysheetlab.com'){
 run('npm',['install','--no-audit','--no-fund']);run('npm',['run','build']);
 copyPublic();
 const source=fs.readFileSync('dist-worker/worker.js','utf8');write(out+'/_worker.js',source);
 installHeadRewriter();await homeFrom((await moduleFrom(source)).default);
 routes(['/site.css','/layout.css','/site.js','/lovegobuy-icon.png']);
}else if(domain==='orientdigsheetdesk.com'||domain==='vigorbuysheetdesk.com'){
 if(domain==='orientdigsheetdesk.com')run('node',['scripts/build-pages.mjs']);else run('node',['scripts/build.mjs']);
 const source=fs.readFileSync(domain==='orientdigsheetdesk.com'?out+'/_worker.js':'dist/server/index.js','utf8');
 write(out+'/_worker.js',source);
 const worker=(await moduleFrom(source)).default;
 const assets=['/style.css','/app.js','/locales.json','/assets/favicon.ico',...fs.readdirSync('brand/agents').filter(f=>f.endsWith('.png')).map(f=>'/assets/agents/'+f)];
 if(domain==='orientdigsheetdesk.com')assets.push('/visual-core.js','/visual-engine.js');
 await assetsFrom(worker,assets);await homeFrom(worker);
 routes(['/style.css','/app.js','/locales.json','/assets/*',...(domain==='orientdigsheetdesk.com'?['/visual-core.js','/visual-engine.js','/visual-index.json']:[])]);
}else if(domain==='superbuyfindsdesk.com'){
 run('node',['scripts/build.mjs']);const source=fs.readFileSync('dist/server/index.js','utf8');
 write(out+'/_worker.js',source);const worker=(await moduleFrom(source)).default;
 await assetsFrom(worker,['/app.js','/content.js','/help-locales.js','/style.css','/favicon.svg','/api/catalogue','/api/seed']);
 await homeFrom(worker);
 routes(['/app.js','/content.js','/help-locales.js','/style.css','/favicon.svg','/api/catalogue','/api/seed']);
}else throw new Error('No Pages build configured for '+domain);
if(!fs.existsSync(out+'/_worker.js'))throw new Error('Pages Functions entry is missing');
const count=dir=>fs.readdirSync(dir,{withFileTypes:true}).reduce((n,e)=>n+(e.isDirectory()?count(path.join(dir,e.name)):1),0);
console.log(JSON.stringify({site:domain,output:out,files:count(out),source:'seo-sites2/main',hosting:'Cloudflare Pages'}));
