import {spawn} from 'node:child_process';
import fs from 'node:fs';

// Render with the actual Pages runtime, including HTMLRewriter and Node bindings.
export async function renderPagesHome(domain,out){
 const port=8798;
 const child=spawn(process.execPath,['node_modules/wrangler/bin/wrangler.js','pages','dev',out,'--ip=127.0.0.1','--port='+port,'--compatibility-date=2026-05-15','--compatibility-flags=nodejs_compat','--inspector-port=0'],{stdio:['ignore','pipe','pipe'],env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
 let log='';child.stdout.on('data',b=>log=(log+b).slice(-6000));child.stderr.on('data',b=>log=(log+b).slice(-6000));
 try{
  let response;
  const deadline=Date.now()+60000;
  while(Date.now()<deadline){
   if(child.exitCode!==null)throw new Error('Pages preview exited: '+log);
   try{response=await fetch('http://127.0.0.1:'+port+'/',{headers:{Host:domain},signal:AbortSignal.timeout(15000)});break}catch{await new Promise(resolve=>setTimeout(resolve,300))}
  }
  if(!response?.ok)throw new Error('Pages homepage rendering failed: '+response?.status+' '+log);
  const html=await response.text();
  if(!html.includes('<html')||html.length<1000)throw new Error('Incomplete homepage');
  fs.writeFileSync(out+'/index.html',html);
  console.log('Rendered static homepage using Pages runtime: '+domain);
 }finally{child.kill('SIGTERM');}
}

// The simple bundled sites use only head.append(); keep the build implementation
// deliberately scoped, while production continues to use the native API.
export function installHeadRewriter(){
 if(typeof globalThis.HTMLRewriter!=='undefined')return;
 globalThis.HTMLRewriter=class {
  handlers=[];
  on(selector,handler){if(selector!=='head')throw new Error('Unsupported build selector '+selector);this.handlers.push(handler);return this}
  transform(response){const headers=new Headers(response.headers);const handlers=this.handlers;return new Response(new ReadableStream({async start(controller){try{let additions='';for(const h of handlers)h.element({append(value){additions+=value}});const html=(await response.text()).replace('</head>',additions+'</head>');controller.enqueue(new TextEncoder().encode(html));controller.close()}catch(e){controller.error(e)}}}),{status:response.status,headers})}
 };
}
