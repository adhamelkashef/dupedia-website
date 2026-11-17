/* A lightweight procedural play-tower concept. No engineering model is implied. */
import * as THREE from './vendor/three.module.min.js';
import {createProductModel} from './product-models.js';
const mount = document.querySelector('.play-model');
if (mount && window.gsap && window.ScrollTrigger) {
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({alpha:true,antialias:devicePixelRatio<2,powerPreference:'low-power'}); }
    catch { mount.parentElement.classList.add('no-webgl'); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33,1,.1,80);
    camera.position.set(6.2,4.25,8.5);camera.lookAt(0,1.55,.55);
    scene.add(new THREE.HemisphereLight(0xffffff,0xb0b98b,3));
    const key = new THREE.DirectionalLight(0xfff3dc,4.5);
    key.position.set(-4,7,6);key.castShadow=true;
    key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-10;key.shadow.camera.right=10;
    key.shadow.camera.top=10;key.shadow.camera.bottom=-10;key.shadow.normalBias=.035;
    key.shadow.camera.near=.1;key.shadow.camera.far=25;scene.add(key);
    const rim = new THREE.DirectionalLight(0xe3f0ff,2);rim.position.set(5,3,-4);scene.add(rim);
    const product=createProductModel({code:'SW-E107'});
    const model=product.root;scene.add(model);
    const parts=product.parts.map((part,i)=>({...part,delay:i/Math.max(1,product.parts.length-1)*.7,rx:(i%2?1:-1)*.25,rz:(i%3-1)*.25}));
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.15}));ground.rotation.x=-Math.PI/2;ground.position.y=-.015;ground.receiveShadow=true;scene.add(ground);
    const state={progress:0,turn:0};let visible=true,raf=0,lost=false;
    const pin=mount.closest('.play-pin'),scroll=mount.closest('.play-scroll'),real=pin.querySelector('.play-real');
    const phases=[...pin.querySelectorAll('.play-phases li')];
    const clamp=(v)=>Math.max(0,Math.min(1,v));
    const render=()=>{
      raf=0;if(!visible||lost)return;
      const p=state.progress;
      for(const part of parts){const local=clamp((p-part.delay*.66)/.36),ease=1-Math.pow(1-local,3);part.obj.position.copy(part.offset).multiplyScalar(1-ease);part.obj.rotation.x=part.rx*(1-ease);part.obj.rotation.z=part.rz*(1-ease);}
      model.rotation.y=state.turn+(.25-p*.3);
      const fade=clamp((p-.8)/.17);
      renderer.domElement.style.opacity=String(1-fade);
      real.style.opacity=String(fade);
      real.style.transform=`translateY(${(1-fade)*18}px) scale(${.96+fade*.04})`;
      const finish=pin.querySelector('.play-finish-copy');
      finish.style.opacity=String(clamp((p-.87)/.1));finish.inert=p<.87;
      pin.querySelector('.play-scene-copy').style.opacity=String(1-clamp((p-.69)/.1));
      pin.querySelector('.play-progress i').style.transform=`scaleX(${p})`;
      phases.forEach((el,i)=>el.classList.toggle('is-active',i===(p<.33?0:p<.8?1:2)));
      pin.dataset.phase=p<.33?'imagine':p<.8?'assemble':'play';
      if(fade<1)renderer.render(scene,camera);
    };
    const requestRender=()=>{if(!raf)raf=requestAnimationFrame(render);};
    const resize=()=>{const {width,height}=mount.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;const vfov=THREE.MathUtils.degToRad(camera.fov),hfov=2*Math.atan(Math.tan(vfov/2)*camera.aspect),radius=product.size.length()*.5,distance=radius/Math.sin(Math.min(vfov,hfov)/2)*.92,target=new THREE.Vector3(0,product.size.y*.46,0),direction=new THREE.Vector3(.85,.52,1.25).normalize();camera.position.copy(target).addScaledVector(direction,distance);camera.lookAt(target);camera.updateProjectionMatrix();requestRender();};
    const observer=new ResizeObserver(resize);observer.observe(mount);
    const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)requestRender();},{rootMargin:'100px'});intersection.observe(pin);
    const tween=gsap.to(state,{progress:1,ease:'none',onUpdate:requestRender,scrollTrigger:{trigger:scroll,start:'top top+=72',end:'bottom bottom',scrub:.7,invalidateOnRefresh:true}});
    const pointer=e=>{const r=pin.getBoundingClientRect();gsap.to(state,{turn:((e.clientX-r.left)/r.width-.5)*.15,duration:.8,ease:'power2.out',overwrite:'auto',onUpdate:requestRender});};
    const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
    if(fine)pin.addEventListener('pointermove',pointer,{passive:true});
    const replay=pin.querySelector('[data-replay-assembly]');replay.hidden=false;
    const restart=()=>{window.scrollTo({top:scroll.getBoundingClientRect().top+scrollY-72,behavior:'smooth'});};replay.addEventListener('click',restart);
    const onLost=e=>{e.preventDefault();lost=true;mount.closest('.p-hero').classList.remove('has-assembly');document.documentElement.classList.remove('has-playground-3d');real.style.opacity='1';real.style.transform='none';pin.querySelector('.play-finish-copy').inert=false;ScrollTrigger.refresh();};
    renderer.domElement.addEventListener('webglcontextlost',onLost);
    mount.closest('.p-hero').classList.add('has-assembly');document.documentElement.classList.add('has-playground-3d');
    resize();ScrollTrigger.refresh();requestRender();
    const ready=()=>ScrollTrigger.refresh();addEventListener('dp:intro-end',ready);
    return()=>{
      cancelAnimationFrame(raf);tween.scrollTrigger?.kill();tween.kill();gsap.killTweensOf(state);
      observer.disconnect();intersection.disconnect();pin.removeEventListener('pointermove',pointer);replay.removeEventListener('click',restart);removeEventListener('dp:intro-end',ready);
      replay.hidden=true;mount.closest('.p-hero').classList.remove('has-assembly');document.documentElement.classList.remove('has-playground-3d');
      real.style.cssText='';pin.querySelector('.play-finish-copy').inert=false;phases.forEach((el,i)=>el.classList.toggle('is-active',i===2));pin.querySelector('.play-progress i').style.transform='';pin.querySelector('.play-finish-copy').style.cssText='';pin.querySelector('.play-scene-copy').style.cssText='';
      product.dispose();ground.geometry.dispose();ground.material.dispose();renderer.dispose();renderer.domElement.remove();
    };
  });
}
