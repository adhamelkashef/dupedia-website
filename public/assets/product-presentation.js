/* Catalogue-driven stories: tactile images, scene choices and a scrollable presentation. */
(()=>{
 const page=document.querySelector('.product-presentation');if(!page)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),studio=page.querySelector('[data-product-studio]'),image=studio.querySelector('.studio-image img');
 const backdrops=[...studio.querySelectorAll('[data-product-backdrop]')];
 backdrops.forEach(button=>button.addEventListener('click',()=>{studio.dataset.backdrop=button.dataset.productBackdrop;backdrops.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
 page.querySelectorAll('[data-open-product-model]').forEach(b=>b.addEventListener('click',()=>{studio.querySelector('[data-studio-view="3d"]').click();studio.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'center'});studio.querySelector('[data-studio-view="3d"]').focus({preventScroll:true});}));
 if(!window.gsap||!window.ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);const mm=gsap.matchMedia();
 mm.add('(prefers-reduced-motion: no-preference)',()=>{
   const story=page.querySelector('.product-story'),steps=[...story.querySelectorAll('[data-product-step]')],chapters=[...story.querySelectorAll('[data-product-chapter]')],visual=story.querySelector('.photo-material-frame')||story.querySelector('.product-story-image'),orbit=story.querySelector('.product-story-orbit');
   let poseTween;
   story.classList.add('is-interactive');let active=-1;
   const setChapter=index=>{if(index===active)return;active=index;story.dataset.chapter=String(index);steps.forEach((b,i)=>b.setAttribute('aria-current',i===index?'step':'false'));chapters.forEach((el,i)=>{el.classList.toggle('is-active',i===index);el.inert=i!==index;});if(visual){poseTween?.kill();poseTween=gsap.to(visual,{scale:[1,1.15,.87][index],rotation:[-2,2,0][index],xPercent:[0,-3,0][index],duration:.9,ease:'power3.inOut',overwrite:true});}};
   const trigger=ScrollTrigger.create({trigger:story,start:()=>`top top+=${innerWidth<=760?64:72}`,end:'bottom bottom',onUpdate:self=>{setChapter(self.progress<.31?0:self.progress<.64?1:2);story.querySelector('.product-story-progress i').style.transform=`scaleX(${self.progress})`;gsap.set(orbit,{rotation:self.progress*80});}});
   setChapter(0);
   const seek=e=>{const p=[.1,.48,.91][Number(e.currentTarget.dataset.productStep)],header=innerWidth<=760?64:72,top=story.getBoundingClientRect().top+scrollY,start=top-header,end=top+story.offsetHeight-innerHeight;window.scrollTo({top:start+(end-start)*p,behavior:'smooth'});};steps.forEach(b=>b.addEventListener('click',seek));
   document.fonts?.ready.then(()=>ScrollTrigger.refresh());
   return()=>{poseTween?.kill();trigger.kill();if(image){gsap.killTweensOf(image);gsap.set(image,{clearProps:'transform'});}story.classList.remove('is-interactive');chapters.forEach(el=>{el.inert=false;el.classList.remove('is-active');});steps.forEach(b=>{b.removeEventListener('click',seek);b.removeAttribute('aria-current');});if(visual)gsap.set(visual,{clearProps:'transform'});gsap.set(orbit,{clearProps:'transform'});};
 });
})();
