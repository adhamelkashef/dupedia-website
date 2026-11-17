/* Three different visual narratives, controlled by the visitor's scroll. */
(()=>{
 const page=document.querySelector('[data-brand-page]');if(!page||!window.gsap||!window.ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);const mm=gsap.matchMedia();
 mm.add('(prefers-reduced-motion: no-preference)',()=>{
  const journey=page.querySelector('.brand-journey'),panels=[...journey.querySelectorAll('[data-brand-panel]')],buttons=[...journey.querySelectorAll('[data-brand-step]')],kind=page.dataset.brandPage;
  journey.classList.add('brand-live');let active=-1;
  const update=p=>{
   const index=Math.min(panels.length-1,Math.floor(p*panels.length));
   if(index!==active){active=index;journey.dataset.chapter=String(index);panels.forEach((el,i)=>{el.classList.toggle('is-active',index===i);el.inert=index!==i;});buttons.forEach((el,i)=>el.setAttribute('aria-current',index===i?'step':'false'));}
   journey.querySelector('.brand-journey-progress i').style.transform=`scaleX(${p})`;
   if(kind==='about'){
    gsap.set('.ab-roof',{y:(1-p)*-85,rotation:(1-p)*-30});gsap.set('.ab-tower',{y:(1-p)*60,rotation:(1-p)*12});gsap.set('.ab-bridge',{scaleX:.3+p*.7});gsap.set('.ab-circle',{x:(1-p)*100,rotation:p*120});gsap.set('.ab-slide',{y:(1-p)*50,rotation:(1-p)*30});
   }else if(kind==='factory'){
    journey.querySelectorAll('.workbench-parts i').forEach((el,i)=>{const local=Math.max(0,Math.min(1,p*6-i*.7));gsap.set(el,{x:(1-local)*(i%2?110:-110),y:(1-local)*(i-3)*25,rotation:(i===4?-30:i===5?30:0)+(1-local)*(i%2?15:-15),opacity:.25+local*.75});});journey.querySelectorAll('.workbench-checks i').forEach((el,i)=>el.classList.toggle('is-checked',i<=index));
   }else gsap.set(journey.querySelector('.project-client-track'),{xPercent:-index*100});
  };
  const trigger=ScrollTrigger.create({trigger:journey,start:()=>`top top+=${innerWidth<=760?64:72}`,end:'bottom bottom',onUpdate:self=>update(self.progress)});update(0);
  const seek=e=>{const index=+e.currentTarget.dataset.brandStep,p=(index+.5)/panels.length,top=journey.getBoundingClientRect().top+scrollY,start=top-(innerWidth<=760?64:72),end=top+journey.offsetHeight-innerHeight;window.scrollTo({top:start+(end-start)*p,behavior:'smooth'});};buttons.forEach(b=>b.addEventListener('click',seek));
  gsap.fromTo(page.querySelector('.brand-hero-art'),{y:45,rotation:3,opacity:.4},{y:0,rotation:0,opacity:1,duration:1.1,ease:'power3.out',clearProps:'all'});
  gsap.to(page.querySelector('.brand-spark'),{rotation:160,ease:'none',scrollTrigger:{trigger:'.brand-hero',start:'top top',end:'bottom top',scrub:1}});
  const portrait=page.querySelector('.ceo2-photo');if(portrait)gsap.from(portrait,{y:50,rotation:-3,ease:'none',scrollTrigger:{trigger:'.ceo2',start:'top bottom',end:'top 20%',scrub:.7}});
  document.fonts?.ready.then(()=>ScrollTrigger.refresh());
  return()=>{trigger.kill();journey.classList.remove('brand-live');buttons.forEach(b=>{b.removeEventListener('click',seek);b.removeAttribute('aria-current');});panels.forEach(el=>{el.inert=false;el.classList.remove('is-active');});};
 });
})();
