/* Material annotations on the actual isolated picture. No product image pixels are altered. */
(()=>{
 const page=document.querySelector('.product-presentation');if(!page)return;
 const ar=document.documentElement.lang==='ar',data=JSON.parse(document.getElementById('product-model-data').textContent),metal=data.materialEvidence?.includes('Metal');
 const names=ar?['','الخشب','المعدن','مادة السطح تحتاج إلى تأكيد']:['','Wood','Metal','Surface material to confirm'];
 page.querySelectorAll('.product-static-studio img,.material-photo img').forEach(img=>{
  const frame=document.createElement('div');frame.className='photo-material-frame';img.before(frame);frame.append(img);
  const overlay=document.createElement('div');overlay.className='photo-material-overlay';frame.append(overlay);
  const tip=document.createElement('div');tip.className='photo-material-tooltip';tip.setAttribute('role','status');tip.setAttribute('aria-live','polite');overlay.append(tip);
  let pixels,w,h,box,locked=false,last=0;
  const locate=()=>{if(!img.naturalWidth)return;const style=getComputedStyle(img),pw=parseFloat(style.paddingLeft)+parseFloat(style.paddingRight),ph=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom),availW=frame.clientWidth-pw,availH=frame.clientHeight-ph,scale=Math.min(availW/img.naturalWidth,availH/img.naturalHeight);box={x:(frame.clientWidth-img.naturalWidth*scale)/2,y:(frame.clientHeight-img.naturalHeight*scale)/2,w:img.naturalWidth*scale,h:img.naturalHeight*scale};overlay.querySelectorAll('button').forEach(b=>{b.style.left=(box.x+Number(b.dataset.x)*box.w)+'px';b.style.top=(box.y+Number(b.dataset.y)*box.h)+'px';});};
  const show=(kind,x,y)=>{if(!kind){if(!locked){tip.classList.remove('is-visible');last=0;}return;}if(last!==kind){tip.textContent=names[kind];last=kind;}tip.style.left=Math.max(95,Math.min(frame.clientWidth-95,x))+'px';tip.style.top=Math.max(42,Math.min(frame.clientHeight-28,y-18))+'px';tip.classList.add('is-visible');};
  const load=()=>{
   if(!img.naturalWidth)return;const canvas=document.createElement('canvas');w=160;h=Math.max(1,Math.round(w*img.naturalHeight/img.naturalWidth));canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);const raw=ctx.getImageData(0,0,w,h).data;pixels=new Uint8Array(w*h);
   for(let i=0;i<pixels.length;i++){const [r,g,b,a]=raw.subarray(i*4,i*4+4);if(a<235)continue;const max=Math.max(r,g,b),min=Math.min(r,g,b);pixels[i]=(r>55&&g/r>.5&&g/r<.91&&b/g<.95&&r-b>24)?1:(metal&&max-min<24&&max<190&&max>35)?2:3;}
   [1,2,3].forEach(kind=>{if(kind===2&&!metal)return;let best=null;for(let y=3;y<h-3;y++)for(let x=3;x<w-3;x++){if(pixels[y*w+x]!==kind)continue;let count=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(pixels[(y+dy)*w+x+dx]===kind)count++;if(count<22)continue;const score=count*10-Math.hypot(x/w-(kind===1?.48:.7),y/h-(kind===1?.55:.4))*60;if(!best||score>best.score)best={x:(x+.5)/w,y:(y+.5)/h,score};}if(!best)return;
    const button=document.createElement('button');button.type='button';button.className='photo-material-pin';button.dataset.x=best.x;button.dataset.y=best.y;button.setAttribute('aria-label',(ar?'استكشف الخامة: ':'Explore material: ')+names[kind]);button.innerHTML='<span aria-hidden="true">+</span>';overlay.append(button);
    const reveal=()=>{locate();show(kind,box.x+best.x*box.w,box.y+best.y*box.h);};button.addEventListener('pointerenter',reveal);button.addEventListener('focus',()=>{locked=true;reveal();});button.addEventListener('blur',()=>{locked=false;show(0);});button.addEventListener('click',()=>{locked=true;reveal();});
   });locate();frame.classList.add('has-photo-materials');
  };
  frame.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||locked||!pixels||!box||e.target.closest('button'))return;const r=frame.getBoundingClientRect(),x=(e.clientX-r.left)*frame.clientWidth/r.width,y=(e.clientY-r.top)*frame.clientHeight/r.height,nx=(x-box.x)/box.w,ny=(y-box.y)/box.h;if(nx<0||nx>1||ny<0||ny>1){show(0);return;}const kind=pixels[Math.min(h-1,Math.floor(ny*h))*w+Math.min(w-1,Math.floor(nx*w))];show(kind,x,y);});
  frame.addEventListener('pointerleave',()=>{if(!locked)show(0);});frame.addEventListener('keydown',e=>{if(e.key==='Escape'){locked=false;tip.classList.remove('is-visible');img.focus?.();}});
  new ResizeObserver(locate).observe(frame);if(img.complete)load();else img.addEventListener('load',load,{once:true});
 });
})();
