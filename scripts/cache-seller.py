import concurrent.futures,html,json,pathlib,re,subprocess,time,hashlib
r=pathlib.Path(__file__).resolve().parent.parent;c=r/'.seller-cache';c.mkdir(exist_ok=True)
d=json.loads((r/'common/catalogue.json').read_text());ids=list(dict.fromkeys(p['weidian'] for p in d['items'] if p.get('weidian') and not p.get('gallery')))
def get(w):
 f=c/(w+'.json')
 if f.exists():return
 z=subprocess.run(['curl','-sS','-L','--max-time','8','-A','Mozilla/5.0','https://weidian.com/item.html?itemID='+w],capture_output=True,text=True)
 m=re.search(r'<script[^>]*id="__rocker-render-inject__"[^>]*data-obj="([^"]+)"',z.stdout)
 out={'images':[],'styles':[]}
 try:
  model=json.loads(html.unescape(m[1]))['result']['default_model'];p=model['item_info'];assert str(p['item_id'])==w
  out['images']=list(dict.fromkeys(x for x in p.get('imgs',[]) if isinstance(x,str) and x.startswith('https://si.geilicdn.com/')))
  for sk in model.get('sku_info',{}).get('sku_props',[]):
   for v in sk.get('props',[]):
    im=v.get('img') or v.get('image');name=v.get('name') or v.get('prop_name')
    if im and name:out['styles'].append({'name':name,'image':im})
 except Exception:pass
 f.write_text(json.dumps(out,separators=(',',':')))
with concurrent.futures.ThreadPoolExecutor(max_workers=40) as ex:
 for n,_ in enumerate(ex.map(get,ids),1):
  if n%100==0:print(n,'/',len(ids),flush=True)
print('DONE',flush=True)
