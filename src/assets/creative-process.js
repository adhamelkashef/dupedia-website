/* One model, three creative states: drawn edges → flat colour → dimensional form. */
import * as THREE from './vendor/three.module.min.js';
import {createProductModel} from './product-models.js';
const section=document.querySelector('.creative-process');
if(section && window.gsap && window.ScrollTrigger){
  gsap.registerPlugin(ScrollTrigger);
  const mm=gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)',()=>{
    const mount=section.querySelector('.creative-canvas'),pin=section.querySelector('.creative-pin');
    const steps=[...section.querySelectorAll('[data-design-step]')],chapters=[...section.querySelectorAll('.creative-chapters article')];
    let renderer;
    try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:devicePixelRatio<2,powerPreference:'low-power'});}catch{return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
    mount.append(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-6,6,4,-4,.1,100);
    scene.add(new THREE.HemisphereLight(0xffffff,0xc3bc9a,3));
    const sun=new THREE.DirectionalLight(0xfff4df,4);sun.position.set(-5,8,7);scene.add(sun);
    const rim=new THREE.DirectionalLight(0xd4ecff,2);rim.position.set(6,4,-5);scene.add(rim);
    const product=createProductModel({code:'SW-E107'}),root=product.root;scene.add(root);
    const meshes=[],edges=[],originalMaterials=new Map();
    root.traverse(obj=>{if(!obj.isMesh)return;meshes.push(obj);originalMaterials.set(obj,obj.material);});
    for(const mesh of meshes){
      const list=Array.isArray(mesh.material)?mesh.material:[mesh.material];
      const copies=list.map(mat=>{const m=mat.clone();m.transparent=true;m.opacity=0;return m;});
      mesh.material=Array.isArray(mesh.material)?copies:copies[0];
      const geometry=new THREE.EdgesGeometry(mesh.geometry,27),material=new THREE.LineBasicMaterial({color:0xd3eaff,transparent:true,opacity:1,depthTest:false});
      const line=new THREE.LineSegments(geometry,material);line.renderOrder=2;mesh.add(line);edges.push(line);
    }
    const state={p:0};let raf=0,visible=false,lost=false,active=-1;
    const clamp=v=>Math.max(0,Math.min(1,v));const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
    const blue=new THREE.Color('#124883'),paper=new THREE.Color('#f2f4ef');
    const target=new THREE.Vector3(0,product.size.y*.47,0);
    const draw=()=>{
      raf=0;if(!visible||lost)return;
      const p=state.p,colour=smooth((p-.27)/.18),depth=smooth((p-.57)/.34),fade=1-smooth((p-.33)/.16);
      pin.style.backgroundColor='#'+blue.clone().lerp(paper,colour).getHexString();
      section.classList.toggle('creative-light',colour>.55);
      section.querySelector('.creative-grid').style.opacity=String(1-depth*.82);
      section.querySelector('.creative-progress i').style.transform=`scaleX(${p})`;
      root.scale.z=.012+.988*depth;
      root.rotation.y=-.48*depth;
      for(const mesh of meshes){for(const mat of(Array.isArray(mesh.material)?mesh.material:[mesh.material])){mat.opacity=colour;mat.depthWrite=colour>.95;}}
      edges.forEach((line,i)=>{const progress=clamp((p-(i/edges.length)*.13)/.13);line.geometry.setDrawRange(0,Math.floor(line.geometry.attributes.position.count*progress/2)*2);line.material.opacity=fade;line.visible=fade>.001;});
      const direction=new THREE.Vector3(.52*depth,.035+.48*depth,1).normalize();
      camera.position.copy(target).addScaledVector(direction,25);camera.lookAt(target);camera.updateProjectionMatrix();
      const index=p<.32?0:p<.63?1:2;
      if(index!==active){active=index;section.dataset.designPhase=String(index);steps.forEach((b,i)=>{b.setAttribute('aria-current',i===index?'step':'false');});chapters.forEach((el,i)=>el.classList.toggle('is-current',i===index));}
      renderer.render(scene,camera);
    };
    const request=()=>{if(!raf)raf=requestAnimationFrame(draw);};
    const resize=()=>{const {width,height}=mount.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);const aspect=width/height;const vertical=Math.max(product.size.y*1.45,product.size.x/aspect*1.2);camera.left=-vertical*aspect/2;camera.right=vertical*aspect/2;camera.top=vertical/2;camera.bottom=-vertical/2;camera.updateProjectionMatrix();request();};
    const ro=new ResizeObserver(resize);ro.observe(mount);
    const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)request();},{rootMargin:'150px'});io.observe(pin);
    section.classList.add('creative-enhanced');
    const tween=gsap.to(state,{p:1,ease:'none',onUpdate:request,scrollTrigger:{id:'creative-process',trigger:section,start:()=>`top top+=${innerWidth<=760?64:72}`,end:'bottom bottom',scrub:.45,invalidateOnRefresh:true}});
    const seek=e=>{const progress=[.24,.47,.94][Number(e.currentTarget.dataset.designStep)],header=innerWidth<=760?64:72,start=section.getBoundingClientRect().top+scrollY-header,end=section.getBoundingClientRect().top+scrollY+section.offsetHeight-innerHeight;window.scrollTo({top:start+(end-start)*progress,behavior:'smooth'});};
    steps.forEach(b=>b.addEventListener('click',seek));
    const fail=()=>{lost=true;section.classList.remove('creative-enhanced','creative-light');pin.style.backgroundColor='';steps.forEach(b=>b.removeAttribute('aria-current'));tween.scrollTrigger?.kill();tween.kill();ScrollTrigger.refresh();};
    renderer.domElement.addEventListener('webglcontextlost',fail);
    const refresh=()=>ScrollTrigger.refresh();addEventListener('dp:intro-end',refresh);
    resize();ScrollTrigger.refresh();request();
    return()=>{cancelAnimationFrame(raf);tween.scrollTrigger?.kill();tween.kill();ro.disconnect();io.disconnect();steps.forEach(b=>{b.removeEventListener('click',seek);b.removeAttribute('aria-current');});removeEventListener('dp:intro-end',refresh);renderer.domElement.removeEventListener('webglcontextlost',fail);section.classList.remove('creative-enhanced','creative-light');pin.style.backgroundColor='';section.querySelector('.creative-grid').style.opacity='';chapters.forEach(el=>el.classList.remove('is-current'));edges.forEach(line=>{line.removeFromParent();line.geometry.dispose();line.material.dispose();});meshes.forEach(mesh=>{(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>m.dispose());mesh.material=originalMaterials.get(mesh);});product.dispose();renderer.dispose();renderer.domElement.remove();};
  });
}
