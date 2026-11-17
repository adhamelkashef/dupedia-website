/* On-demand 3D viewer: no WebGL context or Three.js download until requested. */
const media=document.querySelector('[data-product-studio]');
if(media){
 const data=JSON.parse(document.getElementById('product-model-data').textContent),ar=document.documentElement.lang==='ar';
 const label=(en,arabic)=>ar?arabic:en;
 const image=media.querySelector('[data-studio-image]'),host=media.querySelector('[data-product-canvas]'),status=media.querySelector('[data-model-status]'),buttons=[...media.querySelectorAll('[data-studio-view]')];
 let engine,loading,active='image';
 const setView=async(view)=>{
  active=view;media.closest('.product-story')?.classList.toggle('is-material-mode',view==='3d');buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.studioView===view)));
  if(view==='image'){image.hidden=false;host.hidden=true;engine?.setVisible(false);return;}
  image.hidden=true;host.hidden=false;
  if(engine){engine.setVisible(true);return;}
  if(loading)return;
  loading=true;status.textContent=label('Opening the 3D view…','جارٍ فتح العرض ثلاثي الأبعاد…');
  try{
   const [T,{createProductModel}]=await Promise.all([import('./vendor/three.module.min.js'),import('./product-models.js')]);
   if(!host.isConnected)return;
   const renderer=new T.WebGLRenderer({alpha:true,antialias:devicePixelRatio<2,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
   renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;host.querySelector('.product-canvas-stage').appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
   const scene=new T.Scene();scene.add(new T.HemisphereLight(0xffffff,0xabb894,3));
   const light=new T.DirectionalLight(0xfff4df,4);light.position.set(-6,10,7);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-12;light.shadow.camera.right=12;light.shadow.camera.top=12;light.shadow.camera.bottom=-12;light.shadow.normalBias=.035;scene.add(light);
   const rim=new T.DirectionalLight(0xe4efff,1.8);rim.position.set(5,4,-5);scene.add(rim);
   const model=createProductModel(data);scene.add(model.root);
   const ground=new T.Mesh(new T.PlaneGeometry(100,100),new T.ShadowMaterial({opacity:.14}));ground.rotation.x=-Math.PI/2;ground.position.y=-.015;ground.receiveShadow=true;scene.add(ground);
   const camera=new T.PerspectiveCamera(35,1,.01,250);const state={yaw:.65,pitch:.35,zoom:innerWidth<=760?1:1.2,explode:0};
   const target=new T.Vector3(0,model.size.y*.46,0),radius=model.size.length()*.5;let visible=active==='3d',raf=0,drag=null,animation=null,autoStop=null;
   const draw=()=>{raf=0;if(!visible)return;const vfov=T.MathUtils.degToRad(camera.fov),hfov=2*Math.atan(Math.tan(vfov/2)*camera.aspect),distance=radius/Math.sin(Math.min(vfov,hfov)/2)*(innerWidth<=760||camera.aspect<1?1.12:.9)/state.zoom;camera.position.set(target.x+Math.sin(state.yaw)*Math.cos(state.pitch)*distance,target.y+Math.sin(state.pitch)*distance,target.z+Math.cos(state.yaw)*Math.cos(state.pitch)*distance);camera.lookAt(target);
    model.parts.forEach(p=>{p.obj.position.copy(p.offset).multiplyScalar(state.explode*.55);p.obj.rotation.y=state.explode*(p.order%2?1:-1)*.1;});renderer.render(scene,camera);};
   const render=()=>{if(!raf)raf=requestAnimationFrame(draw);};
   const resize=()=>{const r=host.querySelector('.product-canvas-stage').getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();render();};
   const ro=new ResizeObserver(resize);ro.observe(host.querySelector('.product-canvas-stage'));
   const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&active==='3d';if(visible)render();},{rootMargin:'50px'});io.observe(host);
   const raycaster=new T.Raycaster(),pointer=new T.Vector2(),readout=host.querySelector('[data-material-readout]'),samples=host.querySelector('[data-material-samples]');
   const materialNames={'Wood':'الخشب','Metal':'المعدن','Rope':'الحبال','Fabric':'القماش','Ground surface':'سطح الأرضية','Surface material to confirm':'مادة السطح تحتاج إلى تأكيد'};
   const materialText=name=>ar?(materialNames[name]||materialNames['Surface material to confirm']):name;
   const materials=new Set();model.root.traverse(obj=>{if(obj.isMesh)(Array.isArray(obj.material)?obj.material:[obj.material]).forEach(m=>materials.add(m));});
   const originalEmissive=new Map([...materials].filter(m=>m.emissive).map(m=>[m,m.emissive.clone()]));
   let selectedMaterial='',hoverFrame=0,lastPoint;
   const showMaterial=(name,part='')=>{selectedMaterial=name;readout.textContent=name?label('Model material: ','خامة النموذج: ')+materialText(name)+(part&&!ar?' · '+part:''):label('Hover or tap a part to explore its material.','مرّر فوق جزء أو اضغط عليه لاستكشاف خامته.');for(const m of materials){if(m.emissive)m.emissive.copy(originalEmissive.get(m));if(name&&m.name===name&&m.emissive)m.emissive.setHex(0x242c0a);}samples.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.materialName===name)));render();};
   [...new Set([...materials].map(m=>m.name||'Surface material to confirm'))].forEach(name=>{const b=document.createElement('button');b.type='button';b.textContent=materialText(name);b.dataset.materialName=name;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>showMaterial(selectedMaterial===name?'':name));samples.append(b);});
   const pick=e=>{const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObject(model.root,true)[0];if(!hit){showMaterial('');return;}let part=hit.object;while(part.parent&&part.parent!==model.root)part=part.parent;const mat=Array.isArray(hit.object.material)?hit.object.material[hit.face?.materialIndex||0]:hit.object.material;showMaterial(mat.name||'Surface material to confirm',part.name);};
   const input=host.querySelector('.product-canvas-stage');
   input.addEventListener('pointerdown',e=>{if(e.button!==0)return;stopTurn();drag={x:e.clientX,y:e.clientY,yaw:state.yaw,pitch:state.pitch};input.setPointerCapture(e.pointerId);input.classList.add('is-dragging');});
   input.addEventListener('pointermove',e=>{if(!drag){lastPoint={clientX:e.clientX,clientY:e.clientY};if(!hoverFrame)hoverFrame=requestAnimationFrame(()=>{hoverFrame=0;pick(lastPoint);});return;}state.yaw=drag.yaw+(e.clientX-drag.x)*.009;if(e.pointerType!=='touch')state.pitch=Math.max(.08,Math.min(.9,drag.pitch+(e.clientY-drag.y)*.005));render();});
   input.addEventListener('click',pick);input.addEventListener('pointerleave',()=>{if(!drag)showMaterial('');});
   const endDrag=()=>{drag=null;input.classList.remove('is-dragging');};input.addEventListener('pointerup',endDrag);input.addEventListener('pointercancel',endDrag);
   input.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Home'].includes(e.key))return;e.preventDefault();stopTurn();if(e.key==='ArrowLeft')state.yaw-=.15;if(e.key==='ArrowRight')state.yaw+=.15;if(e.key==='ArrowUp')state.pitch=Math.min(.9,state.pitch+.07);if(e.key==='ArrowDown')state.pitch=Math.max(.08,state.pitch-.07);if(e.key==='+')state.zoom=Math.min(1.7,state.zoom+.1);if(e.key==='-')state.zoom=Math.max(.65,state.zoom-.1);if(e.key==='Home')Object.assign(state,{yaw:.65,pitch:.35,zoom:1});render();});
   host.querySelector('[data-model-zoom="in"]').addEventListener('click',()=>{state.zoom=Math.min(1.7,state.zoom+.12);render();});
   host.querySelector('[data-model-zoom="out"]').addEventListener('click',()=>{state.zoom=Math.max(.65,state.zoom-.12);render();});
   host.querySelector('[data-model-reset]').addEventListener('click',()=>{stopTurn();Object.assign(state,{yaw:.65,pitch:.35,zoom:1,explode:0});host.querySelector('[data-model-explode]').setAttribute('aria-pressed','false');render();});
   const explode=host.querySelector('[data-model-explode]');explode.addEventListener('click',()=>{stopTurn();const next=explode.getAttribute('aria-pressed')!=='true';explode.setAttribute('aria-pressed',String(next));if(window.gsap&&!matchMedia('(prefers-reduced-motion:reduce)').matches)gsap.to(state,{explode:next?1:0,duration:1.1,ease:'power3.inOut',overwrite:'auto',onUpdate:render});else{state.explode=next?1:0;render();}});
   const turn=host.querySelector('[data-model-turn]');
   function stopTurn(){animation?.kill();animation=null;clearTimeout(autoStop);turn.setAttribute('aria-pressed','false');}
   turn.addEventListener('click',()=>{if(animation){stopTurn();return;}if(!window.gsap)return;turn.setAttribute('aria-pressed','true');animation=gsap.to(state,{yaw:state.yaw+Math.PI*2,duration:matchMedia('(prefers-reduced-motion:reduce)').matches?.01:8,ease:'none',onUpdate:render,onComplete:stopTurn});autoStop=setTimeout(stopTurn,8500);});
   renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();stopTurn();status.textContent=label('3D view interrupted. Switch to the product visual.','توقف العرض ثلاثي الأبعاد. يمكنك العودة إلى صورة المنتج.');});
   engine={setVisible(v){visible=v;if(!v)stopTurn();else{resize();render();}},dispose(){stopTurn();cancelAnimationFrame(raf);cancelAnimationFrame(hoverFrame);ro.disconnect();io.disconnect();model.dispose();ground.geometry.dispose();ground.material.dispose();renderer.dispose();}};
   addEventListener('pagehide',e=>{if(e.persisted)engine?.setVisible(false);else engine?.dispose();});
   addEventListener('pageshow',e=>{if(e.persisted)engine?.setVisible(active==='3d');});
   status.textContent=label('Drag to turn. Arrow keys also rotate the model.','اسحب لتدوير النموذج. يمكنك أيضًا استخدام مفاتيح الأسهم.');resize();render();
  }catch(error){status.textContent=label('3D is unavailable in this browser. The product visual and specifications are still available.','العرض ثلاثي الأبعاد غير متاح في هذا المتصفح. صورة المنتج ومواصفاته متاحة.');}
  finally{loading=false;}
 };
 buttons.forEach(b=>b.addEventListener('click',()=>setView(b.dataset.studioView)));
}
