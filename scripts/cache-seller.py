import concurrent.futures,html,json,pathlib,re,subprocess,time,hashlib
r=pathlib.Path(__file__).resolve().parent.parent;c=r/'.seller-cache';c.mkdir(exist_ok=True)
d=json.loads((r/'common/catalogue.json').read_text());ids=list(d['seller'])
def get(w):
 f=c/(w+'.json')
 if f.exists() and (not json.loads(f.read_text()).get('images') or json.loads(f.read_text()).get('styles')):return
 z=subprocess.run(['curl','-sS','-L','--max-time','8','-A','Mozilla/5.0','https://weidian.com/item.html?itemID='+w],capture_output=True,text=True)
 m=re.search(r'<script[^>]*id="__rocker-render-inject__"[^>]*data-obj="([^"]+)"',z.stdout)
 out={'images':[],'styles':[]}
 try:
  model=json.loads(html.unescape(m[1]))['result']['default_model'];p=model['item_info'];assert str(p['item_id'])==w
  out['images']=list(dict.fromkeys(x for x in p.get('imgs',[]) if isinstance(x,str) and x.startswith('https://si.geilicdn.com/')))
  props=model.get('sku_properties') or p.get('sku_properties') or {}
  seen=set()
  for attr in props.get('attr_list',[]):
   for v in attr.get('attr_values',[]):
    im=v.get('img');name=v.get('attr_value')
    if im and name and im not in seen:out['styles'].append({'id':str(v.get('attr_id','')),'name':name,'image':im});seen.add(im)
  if not out['styles']:
   for v in props.get('sku',{}).values():
    im=v.get('img');name=v.get('title')
    if im and name and im not in seen:out['styles'].append({'id':str(v.get('id','')),'name':name,'image':im});seen.add(im)
 except Exception:
  if f.exists():return
 f.write_text(json.dumps(out,separators=(',',':')))
with concurrent.futures.ThreadPoolExecutor(max_workers=40) as ex:
 for n,_ in enumerate(ex.map(get,ids),1):
  if n%100==0:print(n,'/',len(ids),flush=True)
print('DONE',flush=True)
