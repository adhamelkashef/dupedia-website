"""Generate paired, server-rendered Arabic pages from shared site templates."""
from html.parser import HTMLParser
from pathlib import Path
import html,json,re
HERE=Path(__file__).parent
D=json.loads((HERE/'ar.json').read_text()); PARTS=json.loads((HERE/'parts-ar.json').read_text())
def norm(s):return ' '.join(s.replace('\xa0',' ').split())
D={norm(k):v for k,v in D.items()}
TERMS={**PARTS,**D}
keys=sorted(TERMS,key=len,reverse=True)
pattern=re.compile(r'(?<![A-Za-z])(?:'+ '|'.join(re.escape(k) for k in keys if k and k!='&')+r')(?![A-Za-z])',re.I)
lookup={k.lower():v for k,v in TERMS.items()}
# Wave 2 landing pages: every string is written as an [English, Arabic] pair (src/content/landing.json).
# Added as exact matches only, so they never rewrite parts of other sentences.
def _pairs(o):
 if isinstance(o,list) and len(o)==2 and all(isinstance(x,str) for x in o):yield o
 elif isinstance(o,list):
  for x in o:yield from _pairs(x)
 elif isinstance(o,dict):
  for k,x in o.items():
   if k not in ('sectors','related','slug','div','img','ptype','industry'):yield from _pairs(x)
_L=json.loads((HERE.parent/'content'/'landing.json').read_text())
_G=json.loads((HERE.parent/'content'/'guides.json').read_text())
for _en,_ar in _pairs(_G['guides']):
 D[norm(_en)]=_ar
for _g in _G['guides']:
 D[norm(_g['title'][0]+' · Dupedia')]=_g['title'][1]+' · دوبيديا'
for _en,_ar in _G['common'].items():
 D[norm(_en)]=_ar
for _en,_ar in _pairs(_L):
 D[norm(_en)]=_ar
for _x in _L['pages']+[_L['projects']]:
 D[norm(_x['title'][0]+' · Dupedia')]=_x['title'][1]+' · دوبيديا'
for _en,_ar in _L['common'].items():
 D.setdefault(norm(_en),_ar)
def translate(s):
 n=norm(s)
 if n in D:return D[n]
 if n.lower() in lookup:return lookup[n.lower()]
 if not re.search('[A-Za-z]',n):return s
 m=re.fullmatch(r'Last updated (\S+)\.',n)
 if m:return f'آخر تحديث {m[1]}.'
 # product page title and meta description (one template for all products)
 m=re.fullmatch(r'(.+?) · (Playground Equipment|Outdoor Furniture) · Dupedia',n)
 if m and translate(m[1])!=m[1]:return f'{translate(m[1])} · {"أثاث خارجي" if m[2]=="Outdoor Furniture" else "ألعاب أطفال خارجية"} · دوبيديا'
 m=re.fullmatch(r'(.+?) \((SW-[A-Z0-9]+)\): (outdoor playground equipment|outdoor furniture) from the (.+?) collection, (for ages (.+?) years|for all ages)\. Size (.+?), safety zone (.+?)\. Made and installed in Egypt by Dupedia\.',n)
 if m:
  def unit(v):
   for a,b in (('Configured per site plan','حسب مخطط الموقع'),('Per configuration','حسب التكوين'),('Site clearance per plan','مسافة خلوص حسب المخطط'),('Segment ','مقطع '),('(supports)','(الدعامات)'),('per arc','لكل قوس'),('L ','الطول '),('W ','العرض '),('H ','الارتفاع '),(' m²',' م²'),(' cm',' سم'),(' m',' م')):v=v.replace(a,b)
   return v
  kind='أثاث خارجي' if m[3]=='outdoor furniture' else 'ألعاب أطفال خارجية'
  ages=f'للأعمار من {m[6]} سنة' if m[6] else 'لجميع الأعمار'
  return f'{translate(m[1])} ({m[2]}): {kind} من مجموعة {translate(m[4])}، {ages}. المقاس {unit(m[7])}، ومنطقة الأمان {unit(m[8])}. تصنيع وتركيب دوبيديا في مصر.'
 n=re.sub(r'Add (.*?) to shortlist',lambda m:'أضف '+translate(m[1])+' للقائمة المختصرة',n)
 n=re.sub(r'Remove (.*?) from shortlist',lambda m:'أزل '+translate(m[1])+' من القائمة المختصرة',n)
 if 'block ' in n and 'Drag or use' in n:return 'قطعة لعب تفاعلية. اسحبها أو استخدم مفاتيح الأسهم لتحريكها، واضغط إدخال لتدويرها.'
 n=pattern.sub(lambda m:lookup[m[0].lower()],n)
 n=re.sub(r'\b(\d+(?:[–+−-]\d+)?\+?) years\b',r'\1 سنة',n)
 n=re.sub(r'\bAge (\d+)',r'عمر \1 سنوات',n)
 n=re.sub(r'\byears\b','سنوات',n)
 n=re.sub(r'المجموعة ([IVX]+) · (\d+) مختارة',r'المجموعة \1 · \2 منتجًا',n)
 return n
ROUTES=[]
def arurl(s):
 if s.startswith('/') and not s.startswith('//'):
  base=s.split('?')[0].split('#')[0]
  if base in ROUTES:return '/ar'+s
 return s
GLOBE='<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>'
class Localize(HTMLParser):
 def __init__(self,path,ar):super().__init__(convert_charrefs=True);self.out=[];self.path=path;self.ar=ar;self.skip=[];self.in_sig=False
 def handle_decl(self,d):self.out.append('<!'+d+'>')
 def handle_starttag(self,tag,attrs):
  at=dict(attrs)
  if tag=='html' and self.ar:at.update(lang='ar',dir='rtl')
  protected=tag in ('script','style','svg') or at.get('translate')=='no'
  if protected:self.skip.append(tag)
  if self.ar and not self.skip:
   for k,v in list(at.items()):
    if v is None:continue
    if k in ('alt','aria-label','title','placeholder','data-name'):at[k]=translate(v)
    if k=='href':at[k]=arurl(v)
    if k=='content' and (at.get('name')=='description' or at.get('property') in ('og:title','og:description')):at[k]=translate(v)
    if k=='href' and at.get('rel')=='canonical':at[k]=v.replace(self.site,self.site+'/ar',1)
    if k=='content' and at.get('property')=='og:url':at[k]=v.replace(self.site,self.site+'/ar',1)
  self.out.append('<'+tag+''.join(' '+k+(('="'+html.escape(v,quote=True)+'"') if v is not None else '') for k,v in at.items())+'>')
  if tag=='div' and at.get('class')=='hdr-act':
   href=self.path if self.ar else '/ar'+self.path
   label='English' if self.ar else 'العربية'
   self.out.append(f'<a class="lang-switch" data-language-switch href="{href}" lang="{"en" if self.ar else "ar"}" hreflang="{"en" if self.ar else "ar"}" aria-label="{"Switch to English" if self.ar else "التبديل إلى العربية"}">{GLOBE}<span>{label}</span></a>')
 def handle_startendtag(self,t,a):self.handle_starttag(t,a);self.handle_endtag(t)
 def handle_endtag(self,t):
  if t=='head':
   self.out.append(f'<link rel="alternate" hreflang="en" href="{self.site}{self.path}"><link rel="alternate" hreflang="ar" href="{self.site}/ar{self.path}"><link rel="alternate" hreflang="x-default" href="{self.site}{self.path}">')
   self.out.append('<script src="/assets/language-switch.js" defer></script>')
   if self.ar:self.out.append('<script src="/assets/ar-runtime.js" defer></script>')
  self.out.append('</'+t+'>')
  if self.skip and self.skip[-1]==t:self.skip.pop()
 def handle_data(self,s):
  if self.ar and not self.skip and s.strip():
   lead=s[:len(s)-len(s.lstrip())];tail=s[len(s.rstrip()):]
   self.out.append(lead+html.escape(translate(html.unescape(s)))+tail)
  else:self.out.append(s)
 def handle_entityref(self,n):self.out.append('&'+n+';')
 def handle_charref(self,n):self.out.append('&#'+n+';')
 def handle_comment(self,s):self.out.append('<!--'+s+'-->')
def build(out,pages,site):
 global ROUTES
 ROUTES=list(pages)+['/404.html']
 for path in ROUTES:
  file=out/(path.lstrip('/')+('index.html' if path.endswith('/') else ''))
  if not file.exists():continue
  source=file.read_text()
  # Translate complete animated sentences before their decorative word spans.
  def sentence(m):
   plain=html.unescape(re.sub('<[^>]*>','',m[2]))
   return m[1]+html.escape(translate(plain))+m[3]
  ar_source=re.sub(r'(<p class="stmt[^"]*"[^>]*>)(.*?)(</p>)',sentence,source,flags=re.S)

  ar_source=re.sub(r'(<p class="brandline"[^>]*>).*?(</p>)',r'\1<span lang="en" dir="ltr">Serious about <em>play.</em></span>\2',ar_source,flags=re.S)
  # X FORCE headline and motto: written in Arabic, keeping the word spans the animation uses
  ar_source=re.sub(r'(<h2 class="xfi-h"[^>]*>).*?(</h2>)',lambda m:m[1]+'<span class="xl"><span class="xw"><span style="--i:0">شركة</span></span> <span class="xw"><span style="--i:1">تعمل</span></span> <span class="xw xw-ai"><span style="--i:2"><em>بالذكاء الاصطناعي.</em></span></span></span> <span class="xl"><span class="xw"><span style="--i:3">مبنية</span></span> <span class="xw"><span style="--i:4">على</span></span></span> <span class="xl"><span class="xw"><span style="--i:5">عمليات</span></span> <span class="xw"><span style="--i:6">ذكية.</span></span></span>'+m[2],ar_source,flags=re.S)
  ar_source=re.sub(r'(<p class="xfi-motto"[^>]*>).*?(</p>)',lambda m:m[1]+'<span>تصنيع أذكى.</span> <span>فحص أدق.</span> <span>تسليم <em>أكثر أمانًا.</em></span>'+m[2],ar_source,flags=re.S)
  ar_source=ar_source.replace('</head>','<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600&display=swap">\n</head>',1)
  def schema(m):
   data=json.loads(m[2])
   def local(v):
    if isinstance(v,dict):return {k:('ar' if k=='inLanguage' else local(x)) for k,x in v.items()}
    if isinstance(v,list):return [local(x) for x in v]
    if isinstance(v,str) and v.startswith(site):return site+arurl(v[len(site):])
    return v
   return m[1]+json.dumps(local(data),ensure_ascii=False)+m[3]
  ar_source=re.sub(r'(<script type="application/ld\+json">)(.*?)(</script>)',schema,ar_source,flags=re.S)
  for ar in (False,True):
   parser=Localize(path,ar);parser.site=site;parser.feed(ar_source if ar else source)
   dest=out/(('ar/' if ar else '')+path.lstrip('/')+('index.html' if path.endswith('/') else ''))
   html_out=''.join(parser.out)
   if ar:  # the English brand line stays English on Arabic pages (no Arabic slogan)
    EN='<span lang="en" dir="ltr" translate="no">Serious about <em>play.</em></span>'
    html_out=re.sub(r'(<p class="brandline"[^>]*>).*?(</p>)',lambda m:m[1]+EN+m[2],html_out,flags=re.S)
    html_out=re.sub(r'(<div class="loader-line">)<span>.*?</span>',lambda m:m[1]+EN,html_out,count=1,flags=re.S)
   dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(html_out)
  if path in pages:pages.append('/ar'+path)
 (out/'assets'/'ar-runtime.js').write_text((HERE.parent/'assets'/'ar-runtime.js').read_text().replace('__TERMS__',json.dumps(TERMS,ensure_ascii=False)))
 (out/'assets'/'language-switch.js').write_text('document.querySelectorAll("[data-language-switch]").forEach(a=>{const base=a.getAttribute("href");const update=()=>{a.href=base+location.search+location.hash;};update();a.addEventListener("click",update);});')
