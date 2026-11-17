/* Art-directed product concepts built from catalogue component lists.
   These meshes are illustrative, not dimensioned engineering/CAD models. */
import * as T from './vendor/three.module.min.js';
export const recipes = {
 'SW-E101':{type:'tower',t:4,r:2,s:7,w:3,bridge:1,ramp:1,monkey:1},
 'SW-E102':{type:'tower',t:3,r:3,s:1,w:3,monkey:1},
 'SW-E103':{type:'tower',t:3,r:3,s:4,w:3,tunnel:2,ramp:1},
 'SW-E104':{type:'tower',t:2,r:2,s:1,w:3,bridge:1,ramp:1},
 'SW-E105':{type:'tower',t:1,r:1,s:0,w:6,ramp:1,monkey:1},
 'SW-E106':{type:'tower',t:1,r:1,s:1,w:3,ramp:1},
 'SW-E107':{type:'ship',dark:1},
 'SW-E108':{type:'tower',t:1,r:1,s:1,w:2,trampoline:1},
 'SW-E109':{type:'tower',t:2,r:2,s:2,bridge:1,tunnel:2,h:1.05},
 'SW-E110':{type:'tower',t:1,r:1,s:2,w:4,ramp:1,spiral:1},
 'SW-E111':{type:'tower',t:3,r:2,s:3,tunnel:2,bridge:1},
 'SW-E112':{type:'trampolines',count:2,w:3},
 'SW-T201':{type:'tower',t:1,r:0,s:1,w:2,castle:1,h:1.3,slide:'red'},
 'SW-T202':{type:'tower',t:2,r:1,s:1,w:2,bridge:1,ramp:1,pointed:1,h:1.45},
 'SW-T203':{type:'tower',t:1,r:1,s:1,sandbox:1,h:1.25},
 'SW-T204':{type:'tower',t:2,r:1,s:1,w:1,bridge:1,ramp:1,prow:1,h:1.2},
 'SW-T205':{type:'tower',t:1,r:0,s:1,w:2,net:1,monkey:1,wall:1,h:1.2},
 'SW-T206':{type:'tower',t:1,r:1,s:1,ramp:1,balcony:1,greenRoof:1,h:1.5},
 'SW-T207':{type:'tower',t:1,r:1,s:1,bridge:1,ramp:1,redRoof:1,balcony:1,h:1.2},
 'SW-T208':{type:'tower',t:2,r:1,s:1,bridge:1,ramp:1,house:1,h:1.1},
 'SW-T209':{type:'tower',t:1,r:1,s:1,w:2,ramp:1,h:1.5},
 'SW-T210':{type:'tower',t:1,r:1,s:1,w:2,h:1.1},
 'SW-T211':{type:'tower',t:1,r:0,s:1,ramp:1,h:.75,slide:'lime'},
 'SW-T212':{type:'swing',w:1,slide:1,ladder:1,h:1.8},
 'SW-Y301':{type:'tower',t:1,r:1,s:1,house:1,ramp:1,h:.6,redRoof:1,slide:'red'},
 'SW-Y302':{type:'tower',t:2,r:2,s:1,bridge:1,tunnel:1,ramp:1,h:.8},
 'SW-Y303':{type:'aframe',slide:1,tent:1,h:1.2},
 'SW-Y304':{type:'aframe',tent:1,h:.95},
 'SW-Y305':{type:'house',count:1,h:.45,porch:1},
 'SW-Y306':{type:'house',count:2,h:.25,tower:1,slide:1},
 'SW-Y307':{type:'house',count:1,h:1.1,slide:1},
 'SW-Y308':{type:'house',count:1,h:0,open:1,board:1},
 'SW-Y309':{type:'house',count:2,h:0,round:1,bridge:1},
 'SW-Y310':{type:'house',count:1,h:0,porch:1,sandbox:1,canopy:1},
 'SW-Y311':{type:'pavilion',h:2.1},
 'SW-Y312':{type:'table',yellow:1,sensory:1},
 'SW-Y313':{type:'table',round:1,back:1},
 'SW-Y314':{type:'table'},
 'SW-A401':{type:'zipline'},
 'SW-A402':{type:'aframe',long:1,h:2},
 'SW-A403':{type:'hexa'},
 'SW-A404':{type:'climbing',walls:2,ladders:2,slide:1},
 'SW-A405':{type:'agility',ramp:1},
 'SW-A406':{type:'trail',tunnel:1,pods:6},
 'SW-A407':{type:'bridge',length:3.8,suspended:0},
 'SW-A408':{type:'seesaw'},
 'SW-A409':{type:'swing',w:3,h:2.3},
 'SW-A410':{type:'game'},
 'SW-A411':{type:'corn'},
 'SW-A412':{type:'bridge',length:3,suspended:1},
 'SW-L501':{type:'bench',back:1,frame:'curved',length:1.5},
 'SW-L502':{type:'bench',back:1,frame:'heritage',dark:1,length:1.8},
 'SW-L503':{type:'arcbench',radius:2.8},
 'SW-L504':{type:'bench',frame:'loop',length:1.5},
 'SW-L505':{type:'bench',back:1,backPlanks:2,frame:'box',length:1.55},
 'SW-L506':{type:'bench',frame:'u',length:1.6},
 'SW-L507':{type:'bench',frame:'hoop',length:4.43},
 'SW-L508':{type:'bench',back:1,partialBack:1,frame:'rail',black:1,length:1.5},
 'SW-L509':{type:'bench',frame:'arch',yellow:1,length:1.5}
};
export function createProductModel(product) {
 const recipe=recipes[product.code];if(!recipe)throw new Error('Missing product model '+product.code);
 const root=new T.Group(),parts=[];let index=0;
 const c=document.createElement('canvas');c.width=64;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#c59a65';ctx.fillRect(0,0,64,256);
 for(let i=0;i<64;i++){ctx.strokeStyle=`rgba(90,48,16,${.025+(i%7)*.009})`;ctx.lineWidth=.3;ctx.beginPath();ctx.moveTo(i,0);for(let y=0;y<260;y+=12)ctx.lineTo(i+Math.sin(y*.03+i)*.8,y);ctx.stroke();}
 const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
 const wood=new T.MeshStandardMaterial({map:texture,color:recipe.dark?0xa76d48:0xe7c38e,roughness:.72});
 const green=new T.MeshStandardMaterial({color:0x236c4b,roughness:.33,side:T.DoubleSide});
 const lime=new T.MeshStandardMaterial({color:0xb8d241,roughness:.4,side:T.DoubleSide});
 const red=new T.MeshStandardMaterial({color:0xc85846,roughness:.5,side:T.DoubleSide});
 const yellow=new T.MeshStandardMaterial({color:0xefbd2e,roughness:.4});
 const steel=new T.MeshStandardMaterial({color:recipe.yellow?0xeac523:recipe.frame==='loop'?0x999da0:0x3e4445,metalness:.5,roughness:.4});
 const rope=new T.MeshStandardMaterial({color:0xa28a61,roughness:1});
 const sail=new T.MeshStandardMaterial({color:0xf5f1e0,roughness:1,side:T.DoubleSide});
 const sand=new T.MeshStandardMaterial({color:0xdfd1ad,roughness:1});
 const dark=new T.MeshStandardMaterial({color:0x253b37,roughness:.8,side:T.DoubleSide});
 wood.name='Wood';steel.name='Metal';rope.name='Rope';sail.name='Fabric';sand.name='Ground surface';
 [green,lime,red,yellow,dark].forEach(m=>m.name='Surface material to confirm');
 const group=(name,offset=null)=>{const obj=new T.Group();obj.name=name;root.add(obj);const n=index++;parts.push({obj,offset:new T.Vector3(...(offset||[(n%2?1:-1)*(1.4+n%3*.5),1.2+n%4*.45,(n%3-1)*1.4])),order:n});return obj;};
 const mesh=(g,geo,mat,x=0,y=0,z=0)=>{const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;};
 const box=(g,w,h,d,x,y,z,mat=wood)=>mesh(g,new T.BoxGeometry(w,h,d),mat,x,y,z);
 const beam=(g,a,b,w=.09,mat=wood,round=false)=>{const A=new T.Vector3(...a),B=new T.Vector3(...b),v=B.clone().sub(A);const o=mesh(g,round?new T.CylinderGeometry(w/2,w/2,v.length(),8):new T.BoxGeometry(w,v.length(),w),mat);o.position.copy(A.add(B).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;};
 const ring=(g,r,t,x,y,z,mat=steel,axis='z')=>{const o=mesh(g,new T.TorusGeometry(r,t,8,32),mat,x,y,z);if(axis==='x')o.rotation.y=Math.PI/2;if(axis==='y')o.rotation.x=Math.PI/2;return o;};
 const deck=(g,x,z,y=1.25,w=1.4,d=1.4)=>{for(let i=0;i<9;i++)box(g,w,.09,d/9*.94,x,y,z-d/2+(i+.5)*d/9);};
 const rails=(g,x,z,y,w=1.4,d=1.4,front=true)=>{
  for(const sign of [-1,1]){box(g,.075,.075,d,x+sign*w/2,y+.72,z);for(let i=0;i<8;i++)box(g,.05,.65,.09,x+sign*w/2,y+.36,z-d/2+.1+i*(d-.2)/7);}
  for(let i=0;i<8;i++)box(g,.09,.65,.05,x-w/2+.1+i*(w-.2)/7,y+.36,z-d/2);
  box(g,w,.075,.075,x,y+.72,z-d/2);
  if(front){for(let i=0;i<4;i++)box(g,.09,.65,.05,x-w/2+.1+i*.15,y+.36,z+d/2);box(g,.7,.075,.075,x-w/4,y+.72,z+d/2);}
 };
 const roof=(g,x,z,y,w=1.8,d=1.8,material=wood,pointed=false)=>{
  if(pointed){const o=mesh(g,new T.ConeGeometry(w*.78,.95,4),material,x,y+.5,z);o.rotation.y=Math.PI/4;return;}
  for(let i=0;i<10;i++)for(const sign of [-1,1]){const p=box(g,w*.67,.06,d/10*.97,x+sign*w*.25,y+.28,z-d/2+(i+.5)*d/10,material);p.rotation.z=-sign*.63;}
  for(const dz of [-d/2,d/2])for(const sign of [-1,1])beam(g,[x,y+.64,z+dz],[x+sign*w*.55,y-.03,z+dz],.09,material);
 };
 const slide=(x,z,h=1.3,length=h*1.7+1,mat=green)=>{
  const g=group('Slide',[2,1.2,2]),rows=32,cols=8,v=[],ids=[];
  const pos=t=>new T.Vector3(x,h*(1-t*t*(3-2*t))+.09,z+length*t);
  for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){const p=pos(i/rows),u=j/cols*2-1;v.push(p.x+u*.34,p.y+Math.pow(Math.abs(u),8)*.14,p.z);}
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;ids.push(a,b,a+1,b,b+1,a+1);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setIndex(ids);geo.computeVertexNormals();mesh(g,geo,mat);
  for(const sign of [-1,1]){const pts=Array.from({length:24},(_,i)=>{const p=pos(i/23);p.x+=sign*.34;p.y+=.15;return p;});mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts),32,.036,6,false),mat);}
 };
 const ladder=(x,z,h=1.3,width=.6)=>{const g=group('Access ladder');for(const dx of [-width/2,width/2])beam(g,[x+dx,.03,z+.9],[x+dx,h+.06,z],.08);for(let i=0;i<5;i++){const t=(i+1)/6;beam(g,[x-width/2,h*t,z+.9*(1-t)],[x+width/2,h*t,z+.9*(1-t)],.055,yellow,true);}return g;};
 const ramp=(x,z,h=1.3,w=.8)=>{const g=group('Climbing wall');const p=box(g,w,.07,Math.hypot(h,1.1),x,h/2,z+.55);p.rotation.x=Math.atan2(h,1.1);for(let i=0;i<10;i++){const t=.12+(i%5)*.17;mesh(g,new T.DodecahedronGeometry(.065,0),[green,yellow,red][i%3],x+(i%2?1:-1)*w*.25,h*t+.06,z+1.1*(1-t));}return g;};
 const swing=(x,z,count=2,h=2.4)=>{const g=group('Swing frame'),length=count*.85+1;
  for(const dx of [-length/2,length/2])for(const dz of [-.8,.8])beam(g,[x+dx,0,z+dz],[x+dx,h,z],.12);
  beam(g,[x-length/2-.15,h,z],[x+length/2+.15,h,z],.14);
  for(let i=0;i<count;i++){const xx=x-length/2+.6+i*.85;for(const off of [-.19,.19])beam(g,[xx+off,h-.05,z],[xx+off,.55,z+.1],.025,steel,true);box(g,.48,.065,.25,xx,.53,z+.1,dark);}return g;
 };
 const bridge=(x1,x2,z,h=1.2,suspended=false)=>{const g=group('Connecting bridge');const len=x2-x1;
  for(let i=0;i<Math.ceil(len*8);i++){const t=(i+.5)/Math.ceil(len*8),yy=h-(suspended?Math.sin(t*Math.PI)*.2:0);box(g,len/Math.ceil(len*8)*.88,.065,.8,x1+t*len,yy,z);}
  for(const x of [x1,x2])for(const dz of [-.43,.43])box(g,.09,h+.8,.09,x,(h+.8)/2,z+dz);
  for(const dz of [-.43,.43]){beam(g,[x1,h+.75,z+dz],[x2,h+.75,z+dz],suspended?.025:.065,suspended?rope:wood,suspended);for(let i=1;i<len*5;i++){const x=x1+i/5;beam(g,[x,h+.06,z+dz],[x,h+.72,z+dz],.025,rope,true);}}
  return g;
 };
 const tunnel=(x,z,y=.7,length=1.1)=>{const g=group('Crawl tunnel');const o=mesh(g,new T.CylinderGeometry(.38,.38,length,24,1,true),wood,x,y,z);o.rotation.z=Math.PI/2;for(const dx of [-length*.4,length*.4])ring(g,.39,.025,x+dx,y,z,steel,'x');return g;};
 const monkey=(x,z,length=2.8,h=2.2)=>{const g=group('Monkey bars');for(const dx of [-length/2,length/2])for(const dz of [-.45,.45])box(g,.1,h,.1,x+dx,h/2,z+dz);for(const dz of [-.45,.45])beam(g,[x-length/2,h,z+dz],[x+length/2,h,z+dz]);for(let i=0;i<10;i++)beam(g,[x-length/2+i*length/9,h,z-.45],[x-length/2+i*length/9,h,z+.45],.045,green,true);return g;};
 const net=(g,x,z,w=1.3,h=1.7)=>{for(let i=0;i<=6;i++){beam(g,[x-w/2+i*w/6,.1,z],[x-w/2+i*w/6,h,z],.017,rope,true);beam(g,[x-w/2,.1+i*(h-.1)/6,z],[x+w/2,.1+i*(h-.1)/6,z],.017,rope,true);}};
 const tower=(x,z,h=1.3,withRoof=true,options={})=>{
  const frame=group('Tower structure');for(const dx of [-.64,.64])for(const dz of [-.64,.64])box(frame,.12,h+1.25,.12,x+dx,(h+1.25)/2,z+dz);
  deck(group('Raised play deck'),x,z,h);rails(group('Safety balustrades'),x,z,h,1.3,1.3);
  if(withRoof)roof(group('Roof'),x,z,h+1.2,1.8,1.8,options.greenRoof?green:options.redRoof?red:wood,options.pointed);
  if(options.castle){const g=group('Castle battlements');for(let i=0;i<5;i++)for(const sign of [-1,1])box(g,.16,.22,.12,x-.6+i*.3,h+.88,z+sign*.66);}
 };
 const house=(x,z,h=.1,options={})=>{
  const frame=group('Playhouse frame');for(const dx of [-.7,.7])for(const dz of [-.65,.65])box(frame,.1,h+1.55,.1,x+dx,(h+1.55)/2,z+dz);
  deck(group('Playhouse floor'),x,z,h,1.5,1.4);const walls=group('Playhouse walls');
  if(options.open)rails(walls,x,z,h,1.4,1.3);
  else {
   for(const side of [-1,1]){for(let i=0;i<10;i++){const yy=h+.08+i*.14;if(i<4||i>7)box(walls,1.4,.13,.055,x,yy,z+side*.66);else for(const dx of [-.52,.52])box(walls,.35,.13,.055,x+dx,yy,z+side*.66);}}
   for(const sign of [-1,1])for(let i=0;i<7;i++)box(walls,.055,.14,1.3,x+sign*.72,h+.1+i*.145,z);
   box(walls,.055,.4,1.3,x-.72,h+1.2,z);box(walls,.055,.4,.4,x+.72,h+1.2,z-.45);
  }
  roof(group('Playhouse roof'),x,z,h+1.5,1.95,1.8);
  if(h>.35)ladder(x-.25,z+.7,h);
  if(options.porch)deck(group('Front porch'),x,z+.95,h,1.5,.5);
  if(options.round){for(const dx of [-.4,.4]){mesh(walls,new T.CircleGeometry(.2,24),dark,x+dx,h+.86,z+.7);ring(walls,.22,.035,x+dx,h+.86,z+.73,wood);}}
 };
 if(recipe.type==='ship') {
  const hull=group('Timber ship hull',[0,-.6,0]);
  const shape=new T.Shape();shape.moveTo(-3,.55);shape.lineTo(-2.35,.12);shape.lineTo(1.75,.12);shape.lineTo(2.2,.65);shape.lineTo(2.2,1.28);shape.lineTo(-2.35,1.28);shape.closePath();
  for(const sign of [-1,1]){mesh(hull,new T.ExtrudeGeometry(shape,{depth:.08,bevelEnabled:false}),wood,0,0,sign*.78);for(let i=0;i<6;i++)beam(hull,[-2.35,.3+i*.16,sign*.83],[2.12,.3+i*.16,sign*.83],.022,rope);}
  const decks=group('Observation decks',[0,2.2,0]);deck(decks,-.1,0,1.2,4.5,1.5);deck(decks,1.45,0,1.8,1.45,1.5);
  const bow=group('Ship bow',[-2.5,1.2,0]);for(let i=0;i<6;i++)beam(bow,[-2.3-i*.1,1.2,(-.75+i*.12)],[-2.3-i*.1,1.2,.75-i*.12],.12);
  const railsGroup=group('Ship safety rails',[0,1.8,-1.5]);
  for(const z of [-.8,.8]){for(let i=0;i<13;i++){const x=-2.25+i*.35;box(railsGroup,.07,.65,.07,x,(x>1?1.8:1.2)+.33,z);}beam(railsGroup,[-2.25,1.88,z],[.8,1.88,z],.09);beam(railsGroup,[1.1,2.48,z],[2.05,2.48,z],.09);}
  const mast=group('Main mast',[0,3,0]);box(mast,.13,4.3,.13,-.35,2.15,0);beam(mast,[-1.45,3.65,0],[.85,3.65,0],.08);
  const cloth=group('Sail and pennant',[0,2.5,-1]);const geo=new T.PlaneGeometry(2.15,1.7,12,12);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin((pos.getX(i)+1.08)/2.15*Math.PI)*.18);geo.computeVertexNormals();mesh(cloth,geo,sail,-.35,2.78,.02);
  const flag=new T.Shape();flag.moveTo(0,0);flag.lineTo(.75,-.15);flag.lineTo(0,-.35);mesh(cloth,new T.ShapeGeometry(flag),lime,-.27,4.12,0);
  const anchor=group('Bow anchor');ring(anchor,.065,.025,-2.42,1.05,.9,red);beam(anchor,[-2.42,.54,.9],[-2.42,1,.9],.045,red,true);beam(anchor,[-2.6,.86,.9],[-2.24,.86,.9],.045,red,true);beam(anchor,[-2.65,.62,.9],[-2.42,.48,.9],.045,red,true);beam(anchor,[-2.42,.48,.9],[-2.19,.62,.9],.045,red,true);
  const portals=group('Portholes');for(const x of [-1.5,-.5,.5,1.45]){mesh(portals,new T.CircleGeometry(.17,24),dark,x,.68,.875);ring(portals,.19,.035,x,.68,.89,yellow);}
  const helm=group('Ship wheel',[2,1,0]);box(helm,.07,.8,.07,1.4,2.15,0);ring(helm,.28,.035,1.4,2.6,0,wood);for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(helm,[1.4,2.6,0],[1.4+Math.cos(a)*.36,2.6+Math.sin(a)*.36,0],.04,wood,true);}
  slide(-.4,.8,1.2,2.55);ramp(-1.5,-.8,1.2);swing(3.7,0,2,2.4);ladder(1.8,-.75,1.8);
 } else if(recipe.type==='tower') {
  const n=recipe.t,h=recipe.h||1.4,positions=Array.from({length:n},(_,i)=>[(i-(n-1)/2)*2.25,0]);
  positions.forEach(([x,z],i)=>{tower(x,z,h,i<recipe.r,recipe);if(i===0)ladder(x-.3,z+.7,h);});
  if(n>1)for(let i=0;i<n-1;i++)bridge(positions[i][0]+.65,positions[i+1][0]-.65,0,h,!!recipe.bridge);
  for(let i=0;i<((recipe.s||0)-(recipe.spiral?1:0));i++){const [x,z]=positions[i%n];slide(x+.25+(Math.floor(i/n)*.68),z+.68,h,undefined,recipe.slide==='red'?red:recipe.slide==='lime'?lime:green);}
  if(recipe.spiral){const g=group('Curved tube slide');const pts=Array.from({length:60},(_,i)=>{const t=i/59,a=t*Math.PI*2.2;return new T.Vector3(-1.2+Math.cos(a)*.65,h*(1-t)+.18,-.8+Math.sin(a)*.65);});mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts),70,.24,12,false),green);}
  if(recipe.balcony){const g=group('Balcony deck');deck(g,1.05,0,h,.7,1.3);rails(g,1.05,0,h,.7,1.3,false);}
  if(recipe.wall&&!recipe.ramp)ramp(-1.35,-.7,h);
  if(recipe.w)swing((n-1)*1.125+2.2+recipe.w*.3,-.25,recipe.w,2.35);
  if(recipe.ramp)ramp(positions[0][0]-.4,-1.6,h);
  if(recipe.monkey)monkey(-n*1.125-1.2,0,2.3,2.2);
  if(recipe.tunnel)for(let i=0;i<recipe.tunnel;i++)tunnel(positions[i%n][0],0,.55,1.2);
  if(recipe.trampoline){const g=group('Trampoline');box(g,1.5,.13,1.5,-2.1,.15,0,green);box(g,1.22,.14,1.22,-2.1,.16,0,dark);for(const dx of [-.7,.7])for(const dz of [-.7,.7])box(g,.045,1.7,.045,-2.1+dx,.9,dz,steel);net(g,-2.1,-.7,1.4,1.7);}
  if(recipe.net){const g=group('Scramble net');net(g,-1.4,-.65,1.3,2);}
  if(recipe.sandbox){const g=group('Sandbox');box(g,1.25,.08,1.25,0,.04,0,sand);for(const z of [-.7,.7])box(g,1.5,.16,.08,0,.08,z);}
  if(recipe.house){const g=group('Cottage wall panels');for(let i=0;i<7;i++)box(g,1.25,.14,.06,positions[0][0],h+.12+i*.14,-.66);}
 } else if(recipe.type==='house') {
  for(let i=0;i<recipe.count;i++)house((i-(recipe.count-1)/2)*2.15,0,i&&recipe.tower?1.1:recipe.h,recipe);
  if(recipe.bridge&&recipe.count>1)bridge(-.4,.4,0,.15);
  if(recipe.slide)slide(recipe.count>1?1.1:.4,.7,recipe.h>.4?recipe.h:1.1);
  if(recipe.sandbox){const g=group('Sandbox canopy');box(g,1.5,.1,1.5,2,.05,0,sand);for(const x of [1.25,2.75])box(g,.08,1.65,.08,x,.82,-.65);box(g,1.65,.055,1.6,2,1.65,0,green);}
  if(recipe.board){const g=group('Chalkboard');box(g,1.1,.7,.05,0,.7,-.72,dark);}
 } else if(recipe.type==='pavilion'||recipe.type==='corn') {
  const g=group('Pavilion structure');for(const x of [-.8,.8])for(const z of [-.8,.8])box(g,.13,2,.13,x,1,z);deck(g,0,0,.1,1.7,1.7);
  if(recipe.type==='pavilion')roof(group('Pavilion roof'),0,0,1.95,2.1,2.1);
  else {const wall=group('Climbing panels');for(let i=0;i<3;i++){const x=-.6+i*.6;box(wall,.48,1.85,.1,x,.98,-.8, i%2?yellow:wood);for(let j=0;j<5;j++)mesh(wall,new T.DodecahedronGeometry(.08,0),green,x,.3+j*.3,-.7);}net(group('Rope net'),0,.8,1.6,1.9);}
 } else if(recipe.type==='table') {
  const g=group('Table frame');const mat=recipe.yellow?yellow:wood;
  for(const x of [-.45,.45])for(const sign of [-1,1])beam(g,[x,.03,sign*.62],[x,.7,-sign*.2],.09,mat);
  const top=group('Tabletop');if(recipe.round){const o=mesh(top,new T.CylinderGeometry(.65,.65,.055,40),wood,0,.73,0);}
  else for(let i=0;i<6;i++)box(top,1.2,.055,.12,0,.72,-.32+i*.13);
  const seats=group('Integrated bench seats');for(const sign of [-1,1]){box(seats,1.35,.075,.28,0,.42,sign*.66,mat);if(recipe.back)box(seats,1.15,.2,.045,0,.62,sign*.79);}
  if(recipe.sensory)box(top,.42,.08,.34,0,.755,0,sand);
 } else if(recipe.type==='bench') {
  const l=recipe.length,g=group('Bench frame');
  for(const x of [-l*.38,l*.38]){
   if(recipe.frame==='hoop')ring(g,.34,.028,x,.37,0,steel,'x');
   else if(recipe.frame==='arch'||recipe.frame==='curved'){const arc=mesh(g,new T.TorusGeometry(.34,.028,8,32,Math.PI),steel,x,.37,0);arc.rotation.y=Math.PI/2;for(const z of [-.34,.34])beam(g,[x,0,z],[x,.37,z],.055,steel,true);}
   else if(recipe.frame==='u'){const points=[[x,0,-.32],[x,.55,-.32],[x,.69,-.2],[x,.69,.2],[x,.55,.32],[x,0,.32]].map(p=>new T.Vector3(...p));mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points),36,.029,8,false),steel);} 
   else {for(const z of [-.23,.23])box(g,.06,.42,.06,x,.21,z,steel);box(g,.06,.06,.5,x,.03,0,steel);if(recipe.frame==='loop')box(g,.06,.06,.5,x,.43,0,steel);}
  }
  const seat=group('Timber seat');for(let i=0;i<5;i++)box(seat,l,.055,.095,0,.47,-.21+i*.105);
  if(recipe.back){const back=group('Backrest');const lengths=recipe.partialBack?[[-l*.3,l*.27],[l*.3,l*.27]]:[[0,l]];for(const [x,w] of lengths){for(let j=0;j<(recipe.backPlanks||3);j++)box(back,w,.1,.055,x,.67+j*.11,-.24);for(const dx of [-w*.4,w*.4])beam(g,[x+dx,.4,-.24],[x+dx,.98,-.3],.045,steel);}}
 } else if(recipe.type==='arcbench') {
  const g=group('Curved timber seat'),r=recipe.radius;
  for(let i=0;i<75;i++){const a=-Math.PI*.78+i/74*Math.PI*1.56;const p=box(g,.07,.06,.5,Math.cos(a)*r,.48,Math.sin(a)*r);p.rotation.y=-a+Math.PI/2;}
  const legs=group('Recessed steel plinths');for(let i=0;i<7;i++){const a=-Math.PI*.78+i/6*Math.PI*1.56;const p=box(legs,.12,.45,.4,Math.cos(a)*r,.225,Math.sin(a)*r,steel);p.rotation.y=-a+Math.PI/2;}
 } else if(recipe.type==='swing') {swing(0,0,recipe.w,recipe.h);if(recipe.slide)slide(-1.5,.3,1.1);if(recipe.ladder)ladder(-1.7,-.3,1.5);}
 else if(recipe.type==='bridge')bridge(-recipe.length/2,recipe.length/2,0,.3,!!recipe.suspended);
 else if(recipe.type==='seesaw') {const g=group('Central pivot');box(g,.25,.65,.4,0,.325,0);const arm=group('See-saw beam');const p=box(arm,3,.09,.35,0,.72,0);p.rotation.z=.09;for(const sign of [-1,1])ring(arm,.14,.022,sign*1.1,.98,0,yellow);}
 else if(recipe.type==='game') {const g=group('Game frame');for(const x of [-.6,.6])box(g,.1,1.6,.1,x,.8,0);box(g,1.25,.1,.12,0,1.5,0);for(let i=0;i<3;i++)for(let j=0;j<3;j++){const o=mesh(group('Rotating game tile'),new T.CylinderGeometry(.14,.14,.28,12),green,-.37+i*.37,.55+j*.35,0);o.rotation.z=Math.PI/2;ring(o,.07,.012,0,0,.15,yellow);}}
 else if(recipe.type==='zipline') {const g=group('Zipline supports');for(const x of [-4.5,4.5])for(const z of [-.7,.7])beam(g,[x,0,z],[x,2.8,0],.14);beam(g,[-4.5,2.8,0],[4.5,2.8,0],.025,steel,true);beam(g,[0,2.75,0],[0,.9,0],.03,rope,true);mesh(g,new T.CylinderGeometry(.2,.2,.07,24),dark,0,.88,0);deck(g,-4.5,0,.45,1.2,1.3);}
 else if(recipe.type==='aframe') {const h=recipe.h,w=recipe.long?3.4:1.3,g=group('A-frame supports');for(const x of [-w/2,w/2])for(const sign of [-1,1])beam(g,[x,0,sign*.8],[x,h,0],.1);for(const sign of [-1,1]){const wall=group('Climbing wall panel');const o=box(wall,w,.07,Math.hypot(h,.8),0,h/2,sign*.4);o.rotation.x=sign*Math.atan2(h,.8);for(let i=0;i<18;i++){const xx=-w*.4+(i%6)*w*.16,t=.2+Math.floor(i/6)*.28;mesh(wall,new T.DodecahedronGeometry(.06,0),[yellow,green,red][i%3],xx,h*t,sign*.8*(1-t));}}
  if(recipe.slide)slide(.45,.55,h*.8);if(recipe.tent){const tent=group('Tent flap');const shape=new T.Shape();shape.moveTo(-.7,0);shape.lineTo(0,h);shape.lineTo(.7,0);shape.closePath();mesh(tent,new T.ShapeGeometry(shape),red,recipe.long?1.7:.67,0,0).rotation.y=Math.PI/2;}
 } else if(recipe.type==='hexa') {const g=group('Hexagonal climbing frame');for(let i=0;i<6;i++){const a=i*Math.PI/3;box(g,.12,2.2,.12,Math.cos(a)*1.2,1.1,Math.sin(a)*1.2);const b=(i+1)*Math.PI/3;beam(g,[Math.cos(a)*1.2,2.2,Math.sin(a)*1.2],[Math.cos(b)*1.2,2.2,Math.sin(b)*1.2]);}net(group('Rope climbing face'),0,-1.04,1.2,2);ramp(0,.3,1.8);for(let i=0;i<4;i++){beam(g,[-.6+i*.4,2.1,0],[-.6+i*.4,1.55,0],.02,rope,true);ring(g,.12,.022,-.6+i*.4,1.42,0,yellow);}}
 else if(recipe.type==='climbing'){const g=group('Climbing circuit frame');for(const x of [-2.2,0,2.2])box(g,.13,2.1,.13,x,1.05,0);beam(g,[-2.2,2.1,0],[2.2,2.1,0],.14);for(const x of [-1.1,1.1]){const wall=group('Rock-hold wall');box(wall,1.1,1.8,.08,x,1,0);for(let i=0;i<12;i++)mesh(wall,new T.DodecahedronGeometry(.07,0),yellow,x+(i%3-1)*.33,.3+Math.floor(i/3)*.43,.09);}slide(0,.15,.8);}
 else if(recipe.type==='agility'||recipe.type==='trail') {monkey(-1.5,0,2.5,2.1);bridge(-.2,2,0,.35,true);if(recipe.type==='agility'){ramp(-2.4,.7,.75,1);deck(group('Balance decks'),1.5,0,.35,1.5,1.2);}else{tunnel(3,0,.8,1.4);const g=group('Suspended stepping pods');for(let i=0;i<6;i++){const x=-3+i*.6;box(g,.06,1.8,.06,x,.9,-1.4);beam(g,[x,1.8,-1.4],[x,.35,-.75],.025,rope,true);mesh(g,new T.CylinderGeometry(.17,.17,.07,16),wood,x,.32,-.75);}}}
 else if(recipe.type==='trampolines'){for(const x of [-2.3,2.3]){const g=group('Trampoline enclosure');box(g,1.7,.15,1.7,x,.25,0,green);box(g,1.4,.16,1.4,x,.26,0,dark);for(const dx of [-.8,.8])for(const dz of [-.8,.8])box(g,.1,2.3,.1,x+dx,1.15,dz);for(const dz of [-.8,.8])beam(g,[x-.8,2.3,dz],[x+.8,2.3,dz]);net(g,x,-.8,1.6,2.2);}swing(0,0,3,2.3);}
 root.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(root),center=bounds.getCenter(new T.Vector3());root.position.x=-center.x;root.position.z=-center.z;root.position.y=-bounds.min.y;
 const size=bounds.getSize(new T.Vector3());
 return {root,parts,size,recipe,dispose(){root.traverse(o=>{o.geometry?.dispose();});[wood,green,lime,red,yellow,steel,rope,sail,sand,dark].forEach(m=>m.dispose());texture.dispose();}};
}
