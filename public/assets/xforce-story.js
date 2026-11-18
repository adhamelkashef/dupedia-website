/* A scroll-led brand assembly and connected project workflow. No private app data. */
(() => {
 'use strict';
 const section=document.querySelector('.xos-section');
 if(!section)return;
 const steps=[...section.querySelectorAll('[data-xos-step]')];
 const buttons=[...section.querySelectorAll('[data-xos-select]')];
 const details=[...section.querySelectorAll('.xos-detail')];
 let active=0,trigger=null;
 function select(index){
  index=Math.max(0,Math.min(steps.length-1,index));
  active=index;
  steps.forEach((el,i)=>{el.classList.toggle('is-current',i===index);el.classList.toggle('is-complete',i<index);});
  buttons.forEach((el,i)=>{if(i===index)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  details.forEach((el,i)=>{el.hidden=i!==index;});
 }
 buttons.forEach((button,i)=>button.addEventListener('click',()=>{
  select(i);
  if(trigger?.isActive&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*(.28+i*.17),behavior:'smooth'});
  }
 }));
 if(!window.gsap||!window.ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);
 const mm=gsap.matchMedia();
 mm.add({motion:'(prefers-reduced-motion: no-preference)',wide:'(min-width:1000px) and (min-height:740px)',phone:'(max-width:640px)'},context=>{
  if(!context.conditions.motion)return;
  const {wide,phone}=context.conditions;
  const original=section.querySelector('.xos-logo-original');
  const pieces=[...section.querySelectorAll('.xos-piece')];
  const line=section.querySelector('.xos-line>i');
  const decoration=section.querySelectorAll('.xos-orbit i');
  section.classList.add('xos-motion');
  gsap.set(original,{opacity:0});
  const assembly=gsap.timeline({defaults:{ease:'power3.out',duration:.8}});
  assembly.fromTo(pieces,{x:i=>[-90,-32,0,35,100][i],y:i=>[35,-38,48,-35,25][i],rotation:i=>[-14,9,-7,11,-12][i],autoAlpha:0},{x:0,y:0,rotation:0,autoAlpha:1,stagger:.08},0)
   .fromTo(decoration,{scale:.2,autoAlpha:0,rotation:-40},{scale:1,autoAlpha:1,rotation:0,stagger:.08},.08)
   .to(original,{opacity:1,duration:.1},1.15).to(pieces,{opacity:0,duration:.1},1.15);
  if(wide){
   section.classList.add('xos-is-pinned');
   const state={phase:0};
   const story=gsap.timeline({defaults:{ease:'none',duration:1},scrollTrigger:{id:'xforce-story',trigger:section,start:'top top+=72',end:'+=1500',pin:section.querySelector('.xos-pin'),scrub:.65,invalidateOnRefresh:true,refreshPriority:5,onUpdate:self=>{const index=Math.min(4,Math.max(0,Math.floor((self.progress-.25)/.17)));if(index!==active)select(index);}}});
   story.add(assembly,0)
    .fromTo(line,{scaleX:0},{scaleX:1,duration:3.2},1.05)
    .to(state,{phase:1,duration:.3},4.25);
   trigger=story.scrollTrigger;
  }else{
   ScrollTrigger.create({trigger:section.querySelector('.xos-logo-wrap'),start:'top 88%',animation:assembly,toggleActions:'play none none reverse'});
   gsap.fromTo(line,phone?{scaleY:0}:{scaleX:0},{...(phone?{scaleY:1}:{scaleX:1}),ease:'none',scrollTrigger:{trigger:section.querySelector('.xos-workflow'),start:'top 75%',end:'bottom 55%',scrub:.5}});
   steps.forEach((el,i)=>ScrollTrigger.create({trigger:el,start:phone?'top 65%':'top 72%',onEnter:()=>select(i),onEnterBack:()=>select(i)}));
  }
  const refresh=()=>ScrollTrigger.refresh();
  addEventListener('dp:intro-end',refresh);
  return()=>{trigger=null;section.classList.remove('xos-motion','xos-is-pinned');removeEventListener('dp:intro-end',refresh);select(0);};
 },section);
 addEventListener('load',()=>{ScrollTrigger.sort();ScrollTrigger.refresh();},{once:true});
 document.fonts?.ready.then(()=>ScrollTrigger.refresh());
})();
