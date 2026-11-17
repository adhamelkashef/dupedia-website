/* Dupedia product storytelling. All content is visible without animation libraries. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const tabs = [...document.querySelectorAll('[data-story-tab]')];
  const stage = document.querySelector('.p-story-stage');
  const activate = (tab, focus = false) => {
    tabs.forEach(t => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
    if (stage) {
      const index = +tab.dataset.storyTab;
      stage.dataset.view = String(index);
      const image = stage.querySelector('img');
      if (window.gsap && !reduce.matches) gsap.to(image, {scale: [1, 1.28, 1][index], duration: .8, ease: 'power2.inOut', overwrite: 'auto'});
      else image.style.transform = 'none';
    }
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', e => {
      let next;
      if (['ArrowDown', 'ArrowRight'].includes(e.key)) next = (i + 1) % tabs.length;
      if (['ArrowUp', 'ArrowLeft'].includes(e.key)) next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {e.preventDefault(); activate(tabs[next], true);}
    });
  });
  const rail = document.getElementById('product-rail');
  if (rail) {
    const controls = [...document.querySelectorAll('[data-rail-step]')];
    const update = () => controls.forEach(b => {
      b.disabled = +b.dataset.railStep < 0 ? rail.scrollLeft < 5 : rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 5;
    });
    controls.forEach(b => b.addEventListener('click', () => rail.scrollBy({left: +b.dataset.railStep * (rail.querySelector('li').getBoundingClientRect().width + 24), behavior: reduce.matches ? 'instant' : 'smooth'})));
    rail.addEventListener('scroll', update, {passive: true});
    addEventListener('resize', update, {passive: true}); update();
  }
  // Split already-localized lines so the reading animation works in both languages.
  document.querySelectorAll('.p-statement h2 > span').forEach(line => {
    const words=line.textContent.trim().split(/\s+/),fragment=document.createDocumentFragment();
    words.forEach((word,i)=>{const span=document.createElement('span');span.textContent=word;fragment.append(span);if(i<words.length-1)fragment.append(document.createTextNode(' '));});
    line.replaceWith(fragment);
  });
  const intro = document.querySelector('.dp-intro');
  let introTimeline, introTimer, previousFocus, inertElements = [];
  const closeIntro = () => {
    if (!intro || intro.hidden) return;
    introTimeline?.kill(); clearTimeout(introTimer);
    intro.hidden = true; intro.style.cssText = '';
    document.body.classList.remove('intro-playing');
    inertElements.forEach(([el, original]) => { el.inert = original; });
    inertElements = [];
    if (intro.contains(document.activeElement)) {
      if (previousFocus && previousFocus !== document.body) previousFocus.focus({preventScroll:true});
      else { const title=document.querySelector('#hero-t'); title.setAttribute('tabindex','-1'); title.focus({preventScroll:true}); }
    }
    dispatchEvent(new Event('dp:intro-end'));
  };
  const openIntro = () => {
    if (!intro || reduce.matches || !window.gsap) return;
    previousFocus = document.activeElement;
    intro.hidden = false; document.body.classList.add('intro-playing');
    inertElements = [...document.querySelectorAll('.hdr,.sheet,.ftr,main > :not(.dp-intro)')].map(el => {const old=el.inert;el.inert=true;return [el,old];});
    try {sessionStorage.setItem('dp-playful-intro-v2','seen');} catch {}
    // A hard timeout keeps the page usable even if a tween is interrupted.
    introTimer = setTimeout(closeIntro,4200);
    introTimeline = gsap.timeline({onComplete:closeIntro});
    introTimeline.fromTo('.dp-intro-blocks i',{y:100,rotation:(i)=>[-110,85,-70,120][i],scale:.45,opacity:0},{y:0,rotation:0,scale:1,opacity:1,stagger:.14,duration:.85,ease:'back.out(1.5)'})
      .fromTo('.dp-intro-center h2,.dp-intro-center p',{y:25,opacity:0},{y:0,opacity:1,stagger:.13,duration:.55,ease:'power2.out'},.65)
      .to('.dp-intro-blocks i',{y:(i)=>i%2?-12:12,rotation:(i)=>i%2?12:-12,stagger:.04,duration:.4,ease:'power2.inOut'},1.35)
      .to('.dp-intro-blocks i',{y:0,rotation:0,stagger:.04,duration:.4,ease:'back.out(2)'},1.75)
      .to(intro,{yPercent:-105,duration:.75,ease:'power3.inOut'},2.25);
  };
  document.querySelectorAll('[data-replay-intro]').forEach(b => b.addEventListener('click',openIntro));
  intro?.querySelector('[data-skip-intro]').addEventListener('click',closeIntro);
  addEventListener('keydown',e => {if(intro && !intro.hidden && e.key==='Escape')closeIntro();if(intro && !intro.hidden && e.key==='Tab'){e.preventDefault();intro.querySelector('button').focus();}});
  reduce.addEventListener('change',()=>{if(reduce.matches)closeIntro();document.querySelectorAll('[data-replay-intro]').forEach(b=>{b.hidden=reduce.matches;});});
  document.querySelectorAll('[data-replay-intro]').forEach(b=>{b.hidden=reduce.matches;});
  let seen=false;try{seen=sessionStorage.getItem('dp-playful-intro-v2')==='seen';}catch{}
  if(!seen)openIntro();
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const copy = document.querySelector('.p-hero-copy');
    const entranceTargets = copy ? copy.querySelectorAll(':scope > .p-intro,:scope > h1,:scope > .p-hero-lede,:scope > .p-actions') : [];
    const entrance=()=> {if(entranceTargets.length)gsap.fromTo(entranceTargets,{y:32,opacity:0},{y:0,opacity:1,duration:.9,stagger:.1,ease:'power3.out',clearProps:'all',overwrite:'auto'});};
    if (!document.body.classList.contains('intro-playing')) entrance();
    addEventListener('dp:intro-end',entrance);
    const letters=[...document.querySelectorAll('.play-letters i')],playButton=document.querySelector('[data-play-letters]');
    let letterTimeline;
    const spinLetters=()=>{
      letterTimeline?.kill();gsap.killTweensOf(letters);
      letterTimeline=gsap.timeline().to(letters,{y:(i)=>[-24,-40,-18,-34,-12][i],rotation:(i)=>[-17,13,-11,18,30][i],rotationY:180,stagger:.055,duration:.38,ease:'power2.out'})
        .to(letters,{y:0,rotation:0,rotationY:360,stagger:.055,duration:.85,ease:'elastic.out(1,.5)'})
        .set(letters,{clearProps:'transform'});
    };
    const letterOver=e=>{if(letterTimeline?.isActive())return;gsap.fromTo(e.currentTarget,{y:0,rotation:0},{y:-15,rotation:8,duration:.22,yoyo:true,repeat:1,ease:'power2.out',overwrite:true});};
    letters.forEach(el=>el.addEventListener('pointerenter',letterOver));
    if(playButton){playButton.hidden=false;playButton.addEventListener('click',spinLetters);}
    const firstPlay=()=>{if(!letterTimeline)spinLetters();};
    if(document.body.classList.contains('intro-playing'))addEventListener('dp:intro-end',firstPlay,{once:true});else firstPlay();
    const shapes = document.querySelectorAll('.hero-shape');
    if(shapes.length) gsap.fromTo(shapes,{y:35,rotation:-25,scale:.65},{y:(i)=>[-95,-45,-110,-60][i],rotation:(i)=>[35,-40,70,-25][i],scale:1,ease:'none',stagger:.08,scrollTrigger:{trigger:'.p-hero-copy',start:'top top+=100',end:'bottom top',scrub:1}});
    const words = document.querySelectorAll('.p-statement h2 > span');
    if(words.length)gsap.from(words,{opacity:.15,y:22,rotation:3,stagger:.16,ease:'none',scrollTrigger:{trigger:'.p-statement',start:'top 75%',end:'center 45%',scrub:.6}});
    const ribbon=document.querySelector('.play-ribbon > div');
    if(ribbon)gsap.fromTo(ribbon,{xPercent:3},{xPercent:-24,ease:'none',scrollTrigger:{trigger:'.play-ribbon',start:'top bottom',end:'bottom top',scrub:1}});
    const statementShape=document.querySelector('.statement-shape');
    if(statementShape)gsap.to(statementShape,{rotation:140,y:-90,ease:'none',scrollTrigger:{trigger:'.p-statement',start:'top bottom',end:'bottom top',scrub:1}});
    const storyImage=document.querySelector('.p-story-image');
    if(storyImage)gsap.from(storyImage,{scale:1.13,ease:'none',scrollTrigger:{trigger:'.p-story-stage',start:'top bottom',end:'bottom 30%',scrub:.7}});
    gsap.utils.toArray('.p-solution').forEach((tile,i)=>gsap.from(tile,{y:70,rotation:(i%2?2:-2),opacity:.2,duration:.9,ease:'power2.out',scrollTrigger:{trigger:tile,start:'top 88%',toggleActions:'play none none none'},clearProps:'transform,opacity'}));
    const ceo=document.querySelector('.p-ceo-portrait img');
    if(ceo)gsap.fromTo(ceo,{yPercent:5,scale:1.07},{yPercent:-3,scale:1,ease:'none',scrollTrigger:{trigger:'.p-ceo',start:'top bottom',end:'bottom top',scrub:.8}});
    const mark=document.querySelector('.ceo-play-mark');
    if(mark)gsap.to(mark,{rotation:150,ease:'none',scrollTrigger:{trigger:'.p-ceo',start:'top bottom',end:'bottom top',scrub:1}});
    const quote=document.querySelector('.p-ceo blockquote');
    if(quote)gsap.from(quote,{opacity:.2,y:25,ease:'none',scrollTrigger:{trigger:quote,start:'top 85%',end:'top 50%',scrub:.7}});
    const portrait = document.querySelector('.p-behind figure img');
    if (portrait) gsap.from(portrait, {y:65, ease:'none',scrollTrigger:{trigger:'.p-behind',start:'top bottom',end:'bottom bottom',scrub:.6}});
    const brand = document.querySelectorAll('.p-brand-symbol i');
    if(brand.length)gsap.from(brand,{y:60,rotation:(i)=>[90,-180,120,-60][i],scale:.4,stagger:.12,duration:1,ease:'back.out(1.5)',scrollTrigger:{trigger:'.p-finish',start:'top 70%'}});
    return()=>{letterTimeline?.kill();gsap.killTweensOf(letters);gsap.set(letters,{clearProps:'transform'});letters.forEach(el=>el.removeEventListener('pointerenter',letterOver));if(playButton){playButton.hidden=true;playButton.removeEventListener('click',spinLetters);}removeEventListener('dp:intro-end',firstPlay);removeEventListener('dp:intro-end',entrance);if(entranceTargets.length){gsap.killTweensOf(entranceTargets);gsap.set(entranceTargets,{clearProps:'all'});}};
  });
  reduce.addEventListener('change', () => {
    if (reduce.matches && stage) gsap.set(stage.querySelector('img'), {clearProps:'transform'});
  });
  addEventListener('load', () => ScrollTrigger.refresh(), {once:true});
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
