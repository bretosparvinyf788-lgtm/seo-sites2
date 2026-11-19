import concurrent.futures,datetime,hashlib,html,json,pathlib,re,subprocess,time
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT/'common';OUT.mkdir(exist_ok=True)
CACHE=ROOT/'.catalog-cache';CACHE.mkdir(exist_ok=True)
def clean(s):return html.unescape(re.sub('<[^>]*>','',s)).strip()
def fetch(url):
 f=CACHE/(hashlib.sha256(url.encode()).hexdigest()+'.html')
 if f.exists() and f.stat().st_size>100:return f.read_text()
 for attempt in range(3):
  r=subprocess.run(['curl','-f','-sS','-L','--max-time','25','-A','Mozilla/5.0','-H','Accept: text/html,application/xhtml+xml','-H','Referer: https://kakobuymake.com/',url],capture_output=True,text=True)
  if r.returncode==0 and len(r.stdout)>100:f.write_text(r.stdout);return r.stdout
  time.sleep(1+attempt)
 raise RuntimeError('Source failed: '+url)
def catalog(page):
 s=fetch('https://kakobuymake.com/?m=home&c=Lists&a=index&tid=1&page='+str(page));rows=[]
 for m in re.finditer(r'<a\b[^>]*href=[\"\']([^\"\']*aid=(\d+)[^\"\']*)[\"\'][^>]*class=[\"\']product-card[\"\'][^>]*>([\s\S]*?)</a>',s):
  b=m[3];title=re.search(r'<h3[^>]*>([\s\S]*?)</h3>',b);image=re.search(r'<img[^>]*src=[\"\']([^\"\']+)',b);price=re.search(r'class=[\"\']price[\"\'][^>]*>\s*\$?([\d.]+)',b)
  if title and image:rows.append(dict(id=m[2],title=clean(title[1]),image=__import__('urllib.parse',fromlist=['urljoin']).urljoin('https://kakobuymake.com/',html.unescape(image[1])),price=float(price[1]) if price else None))
 if not rows:raise RuntimeError('Catalog parse failed page '+str(page))
 total=re.search(r'共\s*(?:<strong>)?(\d+)(?:</strong>)?\s*页',s)
 return rows,int(total[1]) if total else 1
old=json.loads((ROOT/'sugargoosheetdesk.com/tools/catalog-full.json').read_text());qc=json.loads((ROOT/'sugargoosheetdesk.com/tools/main-qc.json').read_text())['items']
oldmap={str(p['aid']):dict(p,cat=int(c)) for c,v in old.items() for p in v['items']}
first,pages=catalog(1);allrows={p['id']:p for p in first}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
 for count,(rows,_) in enumerate(ex.map(catalog,range(2,pages+1)),2):
  allrows.update({p['id']:p for p in rows})
  if count%10==0:print('Catalog pages',count,'/',pages,flush=True)
cats=['Shoes/slippers','T-shirt','Fashion Clothing','Hoodies','Pants/Trousers','Leather Belt','Fashion Bag','Perfume','Electronics','Other Stuff']
for p in allrows.values():
 prev=oldmap.get(p['id'],{});q=qc.get(p['id'],{})
 p.update(cat=prev.get('cat'),weidian=q.get('id'),qc=q.get('qc',[]),gallery=[],styles=[],agentLinks=[])
def enrich(p):
 s=fetch('https://kakobuymake.com/?m=home&c=View&a=index&aid='+p['id'])
 links=[html.unescape(x) for x in re.findall(r'href=[\"\']([^\"\']+)',s)]
 for u in links:
  match=re.search(r'(?:itemID(?:=|%3D)|/weidian/|shop_type=weidian&id=|/product/2/)(\d{8,15})',u)
  if match:p['weidian']=match[1];break
 crumb=re.search(r'class=[\"\']product-breadcrumb[\"\'][^>]*>([\s\S]*?)</div>',s)
 if crumb:
  t=clean(crumb[1]);p['cat']=next((i+2 for i,c in enumerate(cats) if c in t),p.get('cat'))
 gallery=re.search(r'class=[\"\']thumbnail-carousel[\"\'][^>]*>([\s\S]*?)</div>',s)
 if gallery:
  images=list(dict.fromkeys(html.unescape(x) for x in re.findall(r'<img[^>]*src=[\"\']([^\"\']+)',gallery[1])))
  p['qc']=[__import__('urllib.parse',fromlist=['urljoin']).urljoin('https://kakobuymake.com/',u) for u in images if u!=p['image']]
 if not p['cat']:p['cat']=11 # Main source marks these legacy items Hot, not a usable category.
 if p['weidian']:
  p['agentLinks']=[u for u in links if u.startswith('https://') and p['weidian'] in html.unescape(u) and re.search(r'(?:buy|fans|agoo|orientdig)\.com/',u)]
 return p
missing=[p for p in allrows.values() if not p['cat'] or not p['weidian']]
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
 for count,p in enumerate(ex.map(enrich,missing),1):
  if count%10==0:print('New source details',count,'/',len(missing),flush=True)
# Reuse genuine seller-gallery records already attached to the same Weidian ID.
seller={};english={};aliases={}
for brand in ['kakobuysheetdesk.com','sugargoosheetdesk.com']:
 d=json.loads((ROOT/brand/'tools/featured.json').read_text())
 for p in [d['sample'],*d['featured']]:
  if p.get('id') and p.get('gallery'):seller[str(p['id'])]={'images':p['gallery'],'styles':[]}
  if p.get('nameEn'):english[str(p.get('aid'))]=p['nameEn']
  if str(p.get('aid')) not in allrows:aliases[str(p.get('aid'))]=p
for p in json.loads((ROOT/'cssbuyfindshub.com/app/seller-images.json').read_text()):seller[str(p['wid'])]={'images':p['images'],'styles':[]}
for p in json.loads((ROOT/'cssbuyfindshub.com/app/details.json').read_text()):
 if p.get('english'):english[p['id']]=p['english']
for f in (ROOT/'superbuyfindsdesk.com/src/details').glob('*.json'):
 p=json.loads(f.read_text())
 if p.get('weidian') and p.get('gallery'):seller[str(p['weidian'])]={'images':p['gallery'],'styles':[]}
names=['Shoes & slippers','T-shirts','Clothing','Hoodies','Pants & shorts','Belts','Bags','Fragrance','Electronics','Other finds']
for p in allrows.values():
 p['english']=english.get(p['id']) or (p['title'] if not re.search(r'[\u3400-\u9fff]',p['title']) else names[p['cat']-2]+' · '+p['id'])
 if p.get('weidian') in seller:p['gallery']=seller[p['weidian']]['images']
 p['updatedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
data={'updatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':'https://kakobuymake.com','items':sorted(allrows.values(),key=lambda p:int(p['id']),reverse=True),'aliases':aliases,'seller':seller}
(OUT/'catalogue.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
print('Saved verified catalogue',len(data['items']),'new details',len(missing),'cached seller galleries',len(seller),flush=True)
