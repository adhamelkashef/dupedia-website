/* Localize only visitor-facing text; product codes, dimensions and form values stay intact. */
(() => {
  const terms = __TERMS__;
  const norm = s => s.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  const lower = Object.fromEntries(Object.entries(terms).map(([k,v]) => [norm(k).toLowerCase(),v]));
  const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const keys = Object.keys(lower).filter(k=>k !== '&').sort((a,b)=>b.length-a.length);
  const words = new RegExp('(?<![A-Za-z])(?:'+keys.map(escape).join('|')+')(?![A-Za-z])','gi');
  const t = raw => {
    const s=norm(raw); if (!s || !/[A-Za-z]/.test(s)) return raw;
    if (lower[s.toLowerCase()]) return raw.replace(s,lower[s.toLowerCase()]);
    let v=s
      .replace(/(\d+) of (\d+) products/g,'$1 من $2 منتجًا')
      .replace(/of (\d+) play structures fit a/g,'من $1 هيكل لعب يناسب مساحة')
      .replace(/play structures fit/g,'هياكل لعب تناسب')
      .replace(/with their full published safety zone/g,'مع منطقة الأمان المنشورة كاملة')
      .replace(/with their full safety zone/g,'مع منطقة الأمان كاملة')
      .replace(/(\d+) more fit by footprint; their zone is set in your layout\./g,'$1 منتجات أخرى تناسب من حيث القاعدة؛ وتحدد منطقة الأمان عند إعداد مخططك.')
      .replace(/Shown: /g,'المعروض: ')
      .replace(/,? for age (\d+)/g,'، لعمر $1 سنوات')
      .replace(/m space/g,'م')
      .replace(/(\d+) fit (.*?) with their full safety zone/g,'$1 يناسب مساحة $2 مع منطقة الأمان كاملة')
      .replace(/, the largest that fits, with its safety zone\./g,'، أكبر منتج مناسب مع منطقة الأمان الخاصة به.')
      .replace(/Fits (.*?) with its full safety zone\./g,'يناسب مساحة $1 مع منطقة الأمان كاملة.')
      .replace(/Does not fit (.*?) with its safety zone\./g,'لا يناسب مساحة $1 مع منطقة الأمان.')
      .replace(/Added (.*?) to your shortlist\./g,'تمت إضافة $1 إلى قائمتك المختصرة.')
      .replace(/Removed (.*?)\./g,'تمت إزالة $1.')
      .replace(/Remove (.*?) from shortlist/g,'أزل $1 من القائمة المختصرة')
      .replace(/Add (.*?) to shortlist/g,'أضف $1 للقائمة المختصرة')
      .replace(/Age (\d+)/g,'عمر $1 سنوات')
      .replace(/(\d+(?:[–+−-]\d+)?\+?) years/g,'$1 سنة');
    v=v.replace(words,m=>lower[m.toLowerCase()]);
    return raw.replace(s,v);
  };
  window.DP_TRANSLATE=t;
  const route = el => {
    if(el.matches('[data-language-switch]'))return;
    const href=el.getAttribute('href');
    if(href && /^\/(?!\/|ar(?:\/|$)|assets\/|img\/|brand\/|downloads\/)/.test(href)) el.setAttribute('href','/ar'+href);
  };
  const text = node => {
    if(node.parentElement?.closest('script,style,.sig,[data-language-switch],textarea,input,[translate=no]'))return;
    const next=t(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;
  };
  const visit = root => {
    if(root.nodeType===3){text(root);return;}
    if(root.nodeType!==1 || root.matches('script,style,.sig,[data-language-switch]'))return;
    for(const el of [root,...root.querySelectorAll('*')]){
      if(el.closest('script,style,.sig,[data-language-switch],[translate=no]'))continue;
      if(el.tagName==='A')route(el);
      for(const a of ['aria-label','title','placeholder','alt']){
        const v=el.getAttribute(a);if(v){const n=t(v);if(n!==v)el.setAttribute(a,n);}
      }
    }
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let n;while(n=walker.nextNode())text(n);
  };
  visit(document.body);
  new MutationObserver(records=>{
    for(const r of records){
      if(r.type==='characterData')text(r.target);
      else if(r.type==='attributes')visit(r.target);
      else for(const n of r.addedNodes)visit(n);
    }
  }).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','href','hidden']});
})();
