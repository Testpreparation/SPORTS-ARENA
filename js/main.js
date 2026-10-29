// 起動画面は操作不要で自動的に既存のメインメニューへ移行する。
(()=>{
 const splash=document.getElementById('appSplash');
 if(!splash)return;
 let started=false,finished=false;
 function finish(){
  if(finished)return;
  finished=true;
  splash.hidden=true;
  splash.setAttribute('aria-hidden','true');
  splash.classList.remove('leaving');
 }
 function enterApp(){
  if(started||finished)return;
  started=true;
  splash.classList.add('leaving');
  splash.addEventListener('transitionend',finish,{once:true});
  window.setTimeout(finish,550);
 }
 // transitionイベントが発生しない環境でも必ずメニューへ進む
 window.setTimeout(enterApp,250);
 window.setTimeout(finish,1500);
})();



(function(){
const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),R=Math.random,DT=1/120,D2R=Math.PI/180;
const CFG={
 tennis:{hw:4.1,hl:11.9,netH:.92,g:9.8,k:.02,bounce:true,e:.75,km:7e-4,pSpeed:7.8,cSpeed:6.48,reach:2.4,hMax:2.8,r:.13,th:11,thP:4},
 badminton:{hw:3.05,hl:6.7,netH:1.55,g:9.8,k:.21,bounce:false,e:0,pSpeed:7.2,cSpeed:6.24,reach:2.6,hMax:3.8,r:.06,th:42,thP:-10}};
const renderer=new THREE.WebGLRenderer({antialias:true});document.body.prepend(renderer.domElement);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const COARSE=matchMedia('(pointer:coarse)').matches;
function ballTex(){const c=document.createElement('canvas');c.width=128;c.height=64;const g=c.getContext('2d');g.fillStyle='#d4ef3a';g.fillRect(0,0,128,64);g.strokeStyle='#f4f4e8';g.lineWidth=4;g.beginPath();for(let x=0;x<=128;x+=2){const y=32+Math.sin(x/128*Math.PI*2)*16;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();return new THREE.CanvasTexture(c)}
function netTex(w,h){const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,16,2);g.fillRect(0,0,2,16);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w*5,h*5);return t}
function bannerTex(w){const c=document.createElement('canvas');c.width=512;c.height=64;const g=c.getContext('2d');g.fillStyle='#0d2a5c';g.fillRect(0,0,512,64);g.fillStyle='#ffd23f';g.font='italic 900 34px system-ui,sans-serif';g.textBaseline='middle';g.fillText('RACKET STARS',20,34);g.fillStyle='#fff';g.fillText('★ PRO TOUR',290,34);const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;t.repeat.set(Math.max(1,w/9),1);t.anisotropy=4;return t}
function stringTex(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.2;for(let i=0;i<=64;i+=8){g.beginPath();g.moveTo(i,0);g.lineTo(i,64);g.moveTo(0,i);g.lineTo(64,i);g.stroke()}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);return t}
function logoTex(){const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.fillStyle='rgba(255,255,255,.4)';g.font='italic 900 78px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('RACKET STARS',256,66);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t}
// RACKET STARS 3D v2 visual blocks — 3D-only deployment refresh
function mkRacket(){const r=new THREE.Group(),dk=M(0x14161b,{roughness:.55}),fr=M(0xf2f5fa,{metalness:.45,roughness:.28}),ac=M(0xff3b30,{roughness:.4,metalness:.2});
 const add=(g,m,y)=>{const o=new THREE.Mesh(g,m);o.position.y=y;r.add(o);return o};
 add(new THREE.CylinderGeometry(.03,.034,.3,14),dk,0);add(new THREE.CylinderGeometry(.04,.04,.03,14),ac,-.165);add(new THREE.CylinderGeometry(.034,.034,.03,14),ac,.16);
 add(new THREE.CylinderGeometry(.011,.014,.24,8),fr,.27);
 const hd=new THREE.Group();hd.position.y=.56;const ring=new THREE.Mesh(new THREE.TorusGeometry(.19,.017,10,44),fr);ring.scale.y=1.2;
 const st=new THREE.Mesh(new THREE.PlaneGeometry(.37,.45),new THREE.MeshBasicMaterial({map:stringTex(),transparent:true,side:THREE.DoubleSide,alphaTest:.2}));
 const band=new THREE.Mesh(new THREE.BoxGeometry(.1,.035,.045),ac);band.position.y=-.228;hd.add(ring,st,band);r.add(hd);r.userData.head=hd;r.traverse(o=>{if(o.isMesh)o.castShadow=true});return r}
function skyTex(){const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#04071a');gr.addColorStop(.55,'#1b2548');gr.addColorStop(.85,'#5a4a7a');gr.addColorStop(1,'#a0708a');g.fillStyle=gr;g.fillRect(0,0,512,256);for(let i=0;i<260;i++){g.fillStyle='rgba(255,255,255,'+(.3+R()*.7)+')';g.fillRect(R()*512,R()*120,1.4,1.4)}return new THREE.CanvasTexture(c)}
function woodTex(w,d){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');for(let i=0;i<8;i++){g.fillStyle='hsl(30,'+(42+R()*12)+'%,'+(30+R()*9)+'%)';g.fillRect(0,i*32,256,32);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,i*32,256,1.5);for(let k=0;k<3;k++)g.fillRect(R()*256,i*32,1.5,32)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w/3,d/3);t.anisotropy=4;return t}
function signTex(){const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.fillStyle='#0b1b3d';g.fillRect(0,0,512,128);g.fillStyle='#ffd23f';g.font='italic 900 56px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('RACKET STARS',256,66);return new THREE.CanvasTexture(c)}
function cyl(rt,rb,h,c,x,y,z,o){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,12),M(c,o));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;courtG.add(m);return m}
function plain(w,h,d,c,x,y,z,o){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c,o));m.position.set(x,y,z);m.receiveShadow=true;courtG.add(m);return m}
function stand(ax,sg,off,len,rows,ps){for(let r=0;r<rows;r++){const h=.45+r*.55,p=off+r*1.05+.5,c=r%2?0x3a4558:0x2f3a4c;if(ax==='z')plain(len,h,1.05,c,0,h/2,sg*p);else plain(1.05,h,len,c,sg*p,h/2,0);for(let u=-len/2+.6;u<len/2-.3;u+=.85)if(R()>.12)ps.push(ax==='z'?[u,h,sg*p]:[sg*p,h,u])}}
function crowd(ps){const n=ps.length,mx=new THREE.Matrix4(),col=new THREE.Color(),sk=[0xf6c9a0,0xe3a97d,0xc68a5e,0x8d5a3b],bd=new THREE.InstancedMesh(new THREE.CylinderGeometry(.2,.25,.62,8),M(0xffffff,{roughness:.8}),n),hd=new THREE.InstancedMesh(new THREE.SphereGeometry(.15,10,8),M(0xffffff,{roughness:.7}),n);ps.forEach((p,i)=>{mx.setPosition(p[0],p[1]+.36,p[2]);bd.setMatrixAt(i,mx);bd.setColorAt(i,col.setHSL(R(),.5+R()*.3,.4+R()*.2));mx.setPosition(p[0],p[1]+.84,p[2]);hd.setMatrixAt(i,mx);hd.setColorAt(i,col.set(sk[(R()*4)|0]))});courtG.add(bd,hd)}
function addExtras(T,hw,hl){const bw=2*hw+8,bl=2*hl+9;[-1,1].forEach(s=>{const lm=new THREE.Mesh(new THREE.PlaneGeometry(8,2),new THREE.MeshBasicMaterial({map:logoTex(),transparent:true,depthWrite:false}));lm.rotation.x=-Math.PI/2;lm.position.set(0,.011,s*(hl+3.3));courtG.add(lm)});[-1,1].forEach(s=>{const t1=bannerTex(bw),t2=bannerTex(bl),o1={map:t1,emissiveMap:t1,emissive:0xffffff,emissiveIntensity:.45},o2={map:t2,emissiveMap:t2,emissive:0xffffff,emissiveIntensity:.45};box(bw,.9,.15,0xffffff,0,.45,s*(hl+4.4),o1);box(bw+.1,.06,.2,0x111827,0,.93,s*(hl+4.4));box(.15,.9,bl,0xffffff,s*(hw+3.9),.45,0,o2);box(.2,.06,bl+.1,0x111827,s*(hw+3.9),.93,0)});const ux=hw+1.5,ch=T?2.2:1.7;[[-.35,-.35],[.35,-.35],[-.35,.35],[.35,.35]].forEach(q=>cyl(.04,.04,ch,0x9aa3ad,ux+q[0],ch/2,q[1]));box(.9,.08,.9,0x1e293b,ux,ch,0);box(.08,.6,.9,0x1e293b,ux+.42,ch+.34,0);cyl(.16,.19,.5,0x1d4ed8,ux,ch+.35,0);const hh=new THREE.Mesh(new THREE.SphereGeometry(.14,12,10),M(0xf1c9a5));hh.position.set(ux,ch+.75,0);courtG.add(hh)}
function grain(w,d,kind='hardcourt'){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,512,512);if(kind==='wood'){for(let y=0;y<512;y+=64){g.fillStyle='rgba(120,75,35,'+(.025+R()*.025)+')';g.fillRect(0,y,512,64);g.fillStyle='rgba(65,40,20,.12)';g.fillRect(0,y,512,2);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,y+4,512,1);for(let j=0;j<34;j++){const yy=y+R()*62;g.strokeStyle='rgba(105,70,38,'+(.025+R()*.035)+')';g.lineWidth=.5+R()*1.2;g.beginPath();g.moveTo(R()*80,yy);g.bezierCurveTo(150,yy-3,300,yy+3,512,yy+(R()-.5)*5);g.stroke()}for(let x=R()*256;x<512;x+=256){g.fillStyle='rgba(55,35,20,.08)';g.fillRect(x,y,1,64)}}}else{const grad=g.createLinearGradient(0,0,512,512);grad.addColorStop(0,'rgba(255,255,255,.10)');grad.addColorStop(.5,'rgba(0,0,0,.035)');grad.addColorStop(1,'rgba(255,255,255,.06)');g.fillStyle=grad;g.fillRect(0,0,512,512);for(let i=0;i<75;i++){const x=R()*512,y=R()*512,rad=8+R()*65,gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,'rgba(0,0,0,.035)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-rad,y-rad,rad*2,rad*2)}for(let i=0;i<18000;i++){const v=.025+R()*.075;g.fillStyle='rgba(0,0,0,'+v+')';g.fillRect(R()*512,R()*512,1,1)}}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w/2,d/2);t.anisotropy=8;return t}
const scene=new THREE.Scene();scene.background=new THREE.Color(0x1b2548);scene.fog=new THREE.Fog(0x1b2548,45,110);
const skyM=new THREE.Mesh(new THREE.SphereGeometry(150,24,16),new THREE.MeshBasicMaterial({map:skyTex(),side:THREE.BackSide,fog:false,depthWrite:false}));skyM.renderOrder=-1;scene.add(skyM);
const camera=new THREE.PerspectiveCamera(60,1,.1,200);
scene.add(new THREE.HemisphereLight(0xcfe0ff,0x334455,.55));
const sun=new THREE.DirectionalLight(0xfff4e0,1.1);sun.position.set(8,22,10);sun.castShadow=true;sun.shadow.mapSize.set(COARSE?1024:2048,COARSE?1024:2048);
const sc=sun.shadow.camera;sc.left=-24;sc.right=24;sc.top=24;sc.bottom=-24;sc.near=1;sc.far=70;sun.shadow.bias=-.0005;scene.add(sun);
const courtG=new THREE.Group();scene.add(courtG);
const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c},o||{}));
function box(w,h,d,c,x,y,z,o){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c,o));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;courtG.add(m);return m}
function mkPlayer(c){
 const g=new THREE.Group(),hi=(Math.abs(c)%251)%4,
  sh=M(c,{roughness:.68}),sk=M([0xf2c29c,0xe8b18a,0xc98c62,0x8b573b][hi],{roughness:.72}),
  hr=M([0x24180f,0x4a2b1a,0x17191f,0x9b743d][hi],{roughness:.82}),
  wh=M(0xf5f7fb,{roughness:.48}),dk=M(0x202631,{roughness:.72}),
  trim=M(0x182a48,{roughness:.55}),sole=M(0xdde3eb,{roughness:.55});
 const mm=(geo,mat,x,y,z,par)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;(par||g).add(o);return o};
 const limb=(a,b,r1,r2,mat,par)=>{const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),o=mm(new THREE.CylinderGeometry(r2,r1,d.length(),14),mat,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,par);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o};
 // 体幹は必ず g.children[0]：既存のユニフォーム色変更との互換性を維持
 const torsoGeo=new THREE.CylinderGeometry(.235,.19,.55,24,1,false);torsoGeo.translate(0,.28,0);
 const tor=mm(torsoGeo,sh,0,.77,0);
 // 肩・腰・ショーツ。身体の輪郭を丸みのあるアスリート体型に
 mm(new THREE.SphereGeometry(.235,20,14),sh,0,.20,0,tor).scale.set(1.18,.56,.88);
 mm(new THREE.CylinderGeometry(.19,.205,.19,20),trim,0,-.025,0,tor);
 mm(new THREE.CylinderGeometry(.205,.17,.27,20),dk,0,-.20,0,tor);
 // 首と頭
 mm(new THREE.CylinderGeometry(.075,.09,.13,14),sk,0,.57,0,tor);
 const hdG=new THREE.Group();hdG.position.set(0,.79,-.005);tor.add(hdG);
 const head=mm(new THREE.SphereGeometry(.235,28,22),sk,0,0,0,hdG);head.scale.set(.94,1.08,.91);
 // 耳・髪のキャップと後ろ髪
 [-1,1].forEach(s=>mm(new THREE.SphereGeometry(.045,12,10),sk,s*.225,-.015,0,hdG).scale.set(.7,1,.65));
 const cap=mm(new THREE.SphereGeometry(.241,26,18,0,Math.PI*2,0,Math.PI*.56),hr,0,.055,.012,hdG);cap.scale.set(1.02,1.02,1);
 mm(new THREE.SphereGeometry(.19,18,14),hr,0,-.085,.105,hdG).scale.set(1,.8,.65);
 // 前髪の束を作り、髪型に立体感を追加
 for(let j=0;j<5;j++){const x=(j-2)*.073;const bang=mm(new THREE.SphereGeometry(.065,10,8),hr,x,.12,-.177,hdG);bang.scale.set(.8,.8,.55);bang.rotation.z=(j-2)*-.12}
 // 目・眉・鼻・口。顔はコート正面（-Z）向き
 [-1,1].forEach(s=>{
  const brow=mm(new THREE.BoxGeometry(.066,.014,.018),hr,s*.083,.045,-.207,hdG);brow.rotation.z=s*.12;
  mm(new THREE.SphereGeometry(.027,12,10),wh,s*.082,.006,-.211,hdG).scale.set(1,.85,.42);
  mm(new THREE.SphereGeometry(.013,10,8),dk,s*.082,.006,-.222,hdG).scale.set(1,1,.5);
 });
 mm(new THREE.SphereGeometry(.023,10,8),sk,0,-.035,-.222,hdG).scale.set(.8,.8,.7);
 const mouth=mm(new THREE.TorusGeometry(.031,.006,6,12,Math.PI),dk,0,-.092,-.204,hdG);mouth.rotation.z=Math.PI;
 // ユニフォームの襟と細い胸ライン
 const collar=mm(new THREE.TorusGeometry(.085,.012,8,20),wh,0,.515,-.004,tor);collar.rotation.x=Math.PI/2;
 mm(new THREE.BoxGeometry(.018,.23,.012),wh,.105,.31,-.192,tor);
 // 右腕（ラケット側）：a / rk の階層と参照を維持
 const a=new THREE.Group();a.position.set(.235,.47,0);tor.add(a);
 mm(new THREE.SphereGeometry(.105,16,12),sh,0,0,0,a).scale.set(1,.92,.95);
 limb([0,.015,0],[.045,.19,-.005],.075,.065,sh,a);
 const fa=new THREE.Group();fa.position.set(.045,.19,-.005);a.add(fa);
 limb([0,0,0],[.025,.205,-.018],.058,.047,sk,fa);
 mm(new THREE.SphereGeometry(.057,12,10),sk,.025,.215,-.018,fa);
 const rk=mkRacket();rk.position.set(.025,.235,-.018);rk.rotation.x=-.08;fa.add(rk);
 // 左腕も肘を独立させ、上腕・前腕が関節で連動する構造にする
 const la=new THREE.Group();la.position.set(-.235,.47,0);tor.add(la);
 mm(new THREE.SphereGeometry(.105,16,12),sh,0,0,0,la).scale.set(1,.92,.95);
 limb([0,.015,0],[-.035,-.13,-.005],.075,.06,sh,la);
 const leftElbow=new THREE.Group();leftElbow.position.set(-.035,-.13,-.005);la.add(leftElbow);
 mm(new THREE.SphereGeometry(.052,12,10),sh,0,0,0,leftElbow);
 limb([0,0,0],[-.04,-.18,-.015],.052,.043,sk,leftElbow);
 mm(new THREE.SphereGeometry(.056,12,10),sk,-.04,-.20,-.015,leftElbow);
 // 脚グループの位置と rotation.x 操作を維持。ショーツから自然につながる脚とシューズ
 const mk=x=>{
  const lg=new THREE.Group();lg.position.set(x,.70,0);g.add(lg);
  limb([0,-.01,0],[x*.12,-.31,.005],.085,.066,sk,lg);
  const knee=new THREE.Group();knee.position.set(x*.12,-.31,.005);lg.add(knee);
  mm(new THREE.SphereGeometry(.068,14,12),sk,0,0,0,knee);
  limb([0,0,0],[x*.02,-.20,-.02],.066,.052,sk,knee);
  mm(new THREE.CylinderGeometry(.067,.075,.055,14),wh,x*.02,-.245,-.025,knee);
  const foot=new THREE.Group();foot.position.set(x*.02,-.20,-.02);knee.add(foot);
  const shoe=mm(new THREE.SphereGeometry(.105,16,12),wh,0,-.095,-.04,foot);shoe.scale.set(.82,.58,1.35);
  mm(new THREE.BoxGeometry(.15,.025,.245),sole,0,-.142,-.04,foot);
  mm(new THREE.BoxGeometry(.055,.018,.12),trim,0,-.06,-.11,foot);
  lg.userData.knee=knee;lg.userData.foot=foot;
  return lg
 };
 const L1=mk(-.105),L2=mk(.105);
 g.userData.rk=rk;g.userData.arm=a;g.userData.elbow=fa;g.userData.leftArm=la;g.userData.leftElbow=leftElbow;g.userData.torso=tor;g.userData.head=hdG;g.userData.legs=[L1,L2];
 // 既存アニメーションとの互換性を保ったまま、頭と上半身に小さな自然な動きを付ける
 const ph=Math.random()*6,cl01=v=>Math.max(0,Math.min(1,v));
 tor.onBeforeRender=function(){
  const t=performance.now()/1000+ph,w=cl01(Math.abs(L1.rotation.x)/.9),s=cl01((-.6-a.rotation.x)/2.1),idle=cl01(1-w);
  const stride1=L1.rotation.x,stride2=L2.rotation.x;
  const run=cl01((Math.abs(stride1)+Math.abs(stride2))*.7),swing=cl01(Math.abs(a.rotation.x+.35)/1.8);
  // 股関節の動きに連動して膝を曲げ、着地時の脚の硬さを軽減
  if(L1.userData.knee)L1.userData.knee.rotation.x=Math.max(0,Math.sin(stride1))*-.72-run*.12-Math.max(0,Math.sin(t*2.8))*.22*idle-.10*idle;
  if(L2.userData.knee)L2.userData.knee.rotation.x=Math.max(0,Math.sin(stride2))*.72+run*.12-Math.max(0,Math.sin(t*2.8+1))* .22*idle-.10*idle;
  if(L1.userData.foot)L1.userData.foot.rotation.x=-Math.max(0,-stride1)*.28;
  if(L2.userData.foot)L2.userData.foot.rotation.x=-Math.max(0,-stride2)*.28;
  // 動作中の体幹ひねり・前傾はゲーム側の打撃フェーズから受け取り、歩行の揺れを重ねる
  tor.position.y=.77+Math.abs(stride1)*.035+Math.sin(t*2.2)*.003+run*.025;
  tor.rotation.y=s*.18+(tor.userData.actionTwist||0);
  tor.rotation.x=-s*.05-w*.035+Math.sin(stride1)*.018+(tor.userData.actionLean||0);
  hdG.rotation.x=Math.sin(t*1.5)*.012+tor.rotation.x*.24;
  hdG.rotation.y=Math.sin(t*1.1+ph)*.018;
 };
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
 scene.add(g);return g
}
const P={who:1,x:0,z:0,swingT:0,swingReqT:0,diveT:0,diveX:0,diveZ:0,jumpT:0,g:mkPlayer(0x3b82f6)},C={who:-1,x:0,z:0,swingT:0,swingReqT:0,diveT:0,diveX:0,diveZ:0,jumpT:0,g:mkPlayer(0xef4444)},P2={who:1,x:0,z:0,swingT:0,swingReqT:0,diveT:0,diveX:0,diveZ:0,jumpT:0,g:mkPlayer(0x60a5fa)},C2={who:-1,x:0,z:0,swingT:0,swingReqT:0,diveT:0,diveX:0,diveZ:0,jumpT:0,g:mkPlayer(0xf87171)};C.g.rotation.y=C2.g.rotation.y=Math.PI;
/* 3Dモデル差し替えを解除し、従来のキャラクターモデルを使用する */
const ballG=new THREE.Group(),tb=new THREE.Mesh(new THREE.SphereGeometry(.13,16,12),M(0xffffff,{emissive:0x223300,map:ballTex()})),sh=new THREE.Group();
const cone=new THREE.Mesh(new THREE.ConeGeometry(.1,.2,16),M(0xe9e5d8,{roughness:.78}));cone.position.y=-.05;cone.material.side=THREE.DoubleSide;
const featherMat=new THREE.MeshStandardMaterial({color:0xf4f1e7,roughness:.72,side:THREE.DoubleSide});
for(let i=0;i<8;i++){const a=i*Math.PI/4,geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([0,.045,0,Math.cos(a)*.085,-.105,Math.sin(a)*.085,Math.cos(a+.13)*.085,-.105,Math.sin(a+.13)*.085],3));geo.computeVertexNormals();sh.add(new THREE.Mesh(geo,featherMat));}
const cork=new THREE.Mesh(new THREE.SphereGeometry(.035,14,10),M(0xd9a46d,{roughness:.62}));cork.position.y=.07;sh.add(cone,cork);
ballG.add(tb,sh);const flameG=new THREE.Group();const flameMats=[new THREE.MeshBasicMaterial({color:0xff3b16,transparent:true,opacity:.88,depthWrite:false,blending:THREE.AdditiveBlending}),new THREE.MeshBasicMaterial({color:0xff9d22,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending}),new THREE.MeshBasicMaterial({color:0xffed8a,transparent:true,opacity:.95,depthWrite:false,blending:THREE.AdditiveBlending})];const fireballShells=[new THREE.Mesh(new THREE.SphereGeometry(.17,16,12),flameMats[0]),new THREE.Mesh(new THREE.SphereGeometry(.13,16,12),flameMats[1]),new THREE.Mesh(new THREE.SphereGeometry(.085,16,12),flameMats[2])];fireballShells.forEach((m,i)=>{m.scale.set(1,i===0?1.12:1,i===0?.92:1);flameG.add(m)});const flameShapes=[[.13,.78,-.015],[.105,.68,.045],[.085,.58,-.065],[.07,.48,.095],[.095,.62,-.12],[.055,.42,.015],[.075,.5,.14]];flameShapes.forEach((f,i)=>{const m=new THREE.Mesh(new THREE.ConeGeometry(f[0],f[1],6),flameMats[i===0||i===4?0:i%3]);m.position.set((i%2===0?-.035:.055),-.1-f[1]*.43,f[2]);m.rotation.z=(i%2===0?-.12:.12);flameG.add(m)});flameG.visible=false;ballG.add(flameG);scene.add(ballG);
const TN=28,tpos=new Float32Array(TN*3),tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.BufferAttribute(tpos,3));const trail=new THREE.Line(tg,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.45}));trail.frustumCulled=false;scene.add(trail);
const PN=60,pp=new Float32Array(PN*3),pv=new Float32Array(PN*3),plf=new Float32Array(PN);let pix=0;const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));const pts2=new THREE.Points(pg,new THREE.PointsMaterial({color:0xe8e0d0,size:.12,transparent:true,opacity:.7}));pts2.frustumCulled=false;scene.add(pts2);
function spawn(p,n,sp){for(let k=0;k<n;k++){const i=pix++%PN;pp[i*3]=p.x;pp[i*3+1]=p.y;pp[i*3+2]=p.z;pv[i*3]=(R()-.5)*sp;pv[i*3+1]=R()*sp*.8;pv[i*3+2]=(R()-.5)*sp;plf[i]=.5}}
function upP(dt){for(let i=0;i<PN;i++){if(plf[i]>0){plf[i]-=dt;pv[i*3+1]-=9*dt;pp[i*3]+=pv[i*3]*dt;pp[i*3+1]=Math.max(0,pp[i*3+1]+pv[i*3+1]*dt);pp[i*3+2]+=pv[i*3+2]*dt}else pp[i*3+1]=-5}pg.attributes.position.needsUpdate=true}
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.22,16),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.35}));shadow.rotation.x=-Math.PI/2;scene.add(shadow);
const ball={pos:new THREE.Vector3(),vel:new THREE.Vector3(),spin:new THREE.Vector3(),prev:new THREE.Vector3(),net:false,lastHitter:1,bounces:0};
let shotAim=null,shotAimExpires=0,pendingShotKind='normal',aimGesture=null;
const aimLinePositions=new Float32Array(150*3),aimLineGeometry=new THREE.BufferGeometry();aimLineGeometry.setAttribute('position',new THREE.BufferAttribute(aimLinePositions,3));
const aimLine=new THREE.Line(aimLineGeometry,new THREE.LineBasicMaterial({color:0x0033cc,transparent:true,opacity:1,depthTest:false}));aimLine.frustumCulled=false;aimLine.renderOrder=20;aimLine.visible=false;scene.add(aimLine);
const aimLanding=new THREE.Mesh(new THREE.RingGeometry(.18,.29,24),new THREE.MeshBasicMaterial({color:0xffdf00,transparent:true,opacity:1,side:THREE.DoubleSide,depthTest:false}));aimLanding.rotation.x=-Math.PI/2;aimLanding.position.y=.035;aimLanding.renderOrder=21;aimLanding.visible=false;scene.add(aimLanding);
let cfg=CFG.tennis,mode='tennis',state='menu',server=1,score,msgT=0,acc=0,hitCd=0,serveT=0,aiT=0,aiL=null,over=null,tm=0,paused=false,pointScoreShown=false,pointWinner=1,suppressPointScore=false;const keys={};let serveCharging=false,serveChargeStart=0,servePower=.65,shotCharging=false,shotPower=.65,pendingShotPower=.65,chargeKind='';
let selectedSport='tennis',selectedFormat='singles',netRole='offline',netPeer=null,netConn=null,roomBusy=false,roomTimeout=null,screenMode='sport',remoteInput={x:0,z:0,dash:false,power:.65},netLastSnapshot=0,netInputTimer=0,netLastInputSignature='',netLastInputSentAt=0,netGuestSnapshotSeen=false,netSnapshotSentAt=0,friendNames={host:'部屋主',guest:'フレンド'};
let fbAuth=null,fbDb=null,activeRoomRef=null,roomListeners=[],roomDisconnectRef=null,lastHostNonce='',lastGuestNonce='',lastGuestSwingNonce='';netLastInputSignature='';netLastInputSentAt=0;
let navigationIntent='play',activeTournament=null,activeTournamentRef=null,activeTournamentMatchRef=null,activeTournamentMatchId=null,activeTournamentMatch=null,isSpectatingTournament=false,spectatorView='player',spectatorListener=null,tournamentListener=null,lastTournamentStateAt=0;
const FIREBASE_CONFIG={apiKey:'AIzaSyB85NfBhRRSLsLxhwewaJYJjWSPxLzaJ'+'KE',authDomain:'sports-app-2e1bb.firebaseapp.com',databaseURL:'https://sports-app-2e1bb-default-rtdb.firebaseio.com',projectId:'sports-app-2e1bb',storageBucket:'sports-app-2e1bb.firebasestorage.app',messagingSenderId:'614670493916',appId:'1:614670493916:web:2bc45bf2fc2fce2af2ec19'};
function withTimeout(promise,ms,label){return Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(label+'（タイムアウト）')),ms))])}
function initFirebase(){
 if(!window.firebase)throw new Error('Firebase SDKを読み込めません。ページを再読み込みしてください。');
 if(!firebase.apps.length)firebase.initializeApp(FIREBASE_CONFIG);
 fbAuth=firebase.auth();fbDb=firebase.database();
 const authPromise=fbAuth.currentUser?Promise.resolve(fbAuth.currentUser):fbAuth.signInAnonymously().then(r=>r.user).catch(e=>{const code=e&&e.code?e.code:'';if(code==='auth/operation-not-allowed')throw new Error('Firebase Authenticationで「匿名」ログインを有効にしてください。');if(code==='auth/unauthorized-domain')throw new Error('Firebase Authenticationの承認済みドメインに testpreparation.github.io を追加してください。');throw new Error('Firebase匿名認証エラー '+code+': '+(e&&e.message?e.message:'設定を確認してください'));});
 return withTimeout(authPromise,12000,'Firebase認証').then(user=>{
  // once('value')は未接続でも false を返すため、実際に接続済みになるまで待つ
  return withTimeout(new Promise((resolve,reject)=>{
   const connectedRef=fbDb.ref('.info/connected');
   const onConnection=snap=>{
    if(snap.val()===true){
     connectedRef.off('value',onConnection);
     resolve(user);
    }
   };
   connectedRef.on('value',onConnection,error=>{
    connectedRef.off('value',onConnection);
    reject(error);
   });
  }),15000,'Firebaseデータベース接続');
 });
}
function listenRoom(ref,event,fn){ref.on(event,fn);roomListeners.push({ref,event,fn})}
let chatQueue=[],chatShowing=false;
function showChatMessage(message){
 const el=$('chatTickerText'),ticker=$('chatTicker');
 if(!el||!ticker)return;
 const sender=message.sender==='host'?'部屋主':message.sender==='guest'?'ゲスト':'参加者';
 el.textContent=sender+'：'+String(message.text||'').slice(0,120);
 ticker.style.display='block';el.classList.remove('run');void el.offsetWidth;el.classList.add('run');
 chatShowing=true;
}
function runChatQueue(){
 if(chatShowing||!chatQueue.length)return;
 showChatMessage(chatQueue.shift());
}
function setupRoomChat(ref){
 chatQueue=[];chatShowing=false;$('chatTicker').style.display='none';$('chatFab').style.display='flex';$('chatPanel').classList.remove('open');
 const chatRef=ref.child('chat').limitToLast(20);
 listenRoom(chatRef,'child_added',snap=>{
  const m=snap.val();if(!m||typeof m.text!=='string'||!m.text.trim())return;
  chatQueue.push(m);runChatQueue();
 });
}
$('chatTickerText').addEventListener('animationend',()=>{chatShowing=false;runChatQueue();if(!chatShowing&&!chatQueue.length)$('chatTicker').style.display='none'});
$('chatFab').addEventListener('click',()=>{$('chatPanel').classList.toggle('open');if($('chatPanel').classList.contains('open'))setTimeout(()=>$('chatInput').focus(),30)});
$('chatClose').addEventListener('click',()=>$('chatPanel').classList.remove('open'));
$('chatForm').addEventListener('submit',async e=>{
 e.preventDefault();const input=$('chatInput'),message=input.value.trim();
 if(!message)return;
 if(!activeRoomRef||!netConn||!netConn.open||(netRole!=='host'&&netRole!=='guest')){roomMessage('部屋に接続してからチャットしてください。');return}
 try{await activeRoomRef.child('chat').push({sender:netRole,text:message.slice(0,120),ts:Date.now()});input.value='';input.focus();}
 catch(err){roomMessage('チャットを送信できませんでした。Firebaseのデータベースルールを確認してください。')}
});
function makeFirebaseConnection(){return {open:true,send(d){if(!activeRoomRef||!this.open)return;const side=netRole==='host'?'hostMessage':'guestMessage';const makePayload=data=>({nonce:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),data,ts:Date.now()});if(netRole==='guest'&&d&&d.type==='input'&&d.input&&d.input.swing){const normalInput={...d.input,swing:false};Promise.all([activeRoomRef.child('guestSwing').set(makePayload(d)),activeRoomRef.child(side).set(makePayload({...d,input:normalInput}))]).catch(e=>roomMessage('Firebase送信エラー：'+e.message));return}activeRoomRef.child(side).set(makePayload(d)).catch(e=>roomMessage('Firebase送信エラー：'+e.message))},close(){this.open=false}}}

function buildCourt(m){
  mode=m;cfg=CFG[m];courtG.clear();
  const{hw,hl,netH}=cfg,T=m==='tennis';
  // Each sport receives its own complete court + arena. Keep gameplay dimensions in CFG unchanged.
  const bgc=T?0x10243b:0x071426;
  scene.background.set(bgc);scene.fog.color.set(bgc);scene.fog.near=T?48:60;scene.fog.far=T?125:145;
  skyM.visible=false;sun.intensity=T?1.0:.62;
  const pl=(w,d,mt,y)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mt);p.rotation.x=-Math.PI/2;p.position.y=y;p.receiveShadow=true;courtG.add(p);return p};
  const gm=(c,w,d,kind='hardcourt')=>{const mt=new THREE.MeshPhysicalMaterial({color:c,roughness:kind==='wood'?.48:.42,metalness:0,clearcoat:kind==='wood'?.34:.24,clearcoatRoughness:.38});mt.map=grain(w,d,kind);mt.bumpMap=mt.map;mt.bumpScale=kind==='wood'?.022:.009;return mt};
  const HX=hw+15,HZ=hl+19,ps=[];
  const ln=(a,b,c,d,y=.018,thick=.035)=>box(Math.abs(c-a)+thick,.022,Math.abs(d-b)+thick,0xffffff,(a+c)/2,y,(b+d)/2,{roughness:.7});
  pl(2*HX,2*HZ,M(T?0x101b2a:0x101827,{roughness:.86}),0);
  pl(2*hw+7,2*hl+8,gm(T?0x173c35:0x12365b,2*hw+7,2*hl+8,T?'hardcourt':'wood'),.004);
  const courtVisualHW=T?5.485:hw;
  pl(2*courtVisualHW,2*hl,gm(T?0x287b55:0x1478c9,2*courtVisualHW,2*hl,T?'hardcourt':'wood'),.009);
  ln(-courtVisualHW,-hl,courtVisualHW,-hl);ln(-courtVisualHW,hl,courtVisualHW,hl);ln(-courtVisualHW,-hl,-courtVisualHW,hl);ln(courtVisualHW,-hl,courtVisualHW,hl);
  if(T){
   // Show doubles court width and retain singles lines; physics dimensions remain unchanged.
   ln(-hw,-hl,-hw,hl);ln(hw,-hl,hw,hl);
   ln(-hw,6.4,hw,6.4);ln(-hw,-6.4,hw,-6.4);ln(0,-6.4,0,6.4);
   ln(-courtVisualHW,-5.5,courtVisualHW,-5.5);ln(-courtVisualHW,5.5,courtVisualHW,5.5);
  }else{
   const sw=Math.min(2.59,hw-.25);
   ln(-sw,-hl,-sw,hl);ln(sw,-hl,sw,hl);
   ln(-hw,hl-.76,hw,hl-.76);ln(-hw,-hl+.76,hw,-hl+.76);
   ln(-hw,1.98,hw,1.98);ln(-hw,-1.98,hw,-1.98);
   ln(0,1.98,0,hl);ln(0,-hl,0,-1.98);
  }
  // Visible net and support posts; physics/collision rules remain unchanged.
  const netMaterial=new THREE.MeshStandardMaterial({color:T?0x202a35:0x101820,map:netTex(2*hw,netH),transparent:true,opacity:.9,side:THREE.DoubleSide,roughness:.9,depthWrite:true});
  const netMesh=new THREE.Mesh(new THREE.PlaneGeometry(2*hw,netH),netMaterial);
  netMesh.position.set(0,netH/2+.035,0);courtG.add(netMesh);
  box(2*hw+.12,.075,.065,0xf8fafc,0,netH+.035,0,{roughness:.45,metalness:.05});
  const postH=netH+(T?.18:.06);
  [-1,1].forEach(side=>{
   cyl(.045,.055,postH,T?0xe5e7eb:0xdbeafe,side*(hw+.025),postH/2+.025,0,{metalness:.25,roughness:.35});
   cyl(.07,.07,.08,0x334155,side*(hw+.025),.04,0);
  });
  // Tiered spectator seating on every side.
  [-1,1].forEach(side=>{
   stand('z',side,hl+(T?6.4:5.5),2*hw+13,4,ps);
   stand('x',side,hw+(T?6.4:5.5),2*hl+10,4,ps);
  });
  // Shared indoor arena architecture: walls, roof trusses, signs and ceiling lights.
  [-1,1].forEach(side=>{
   plain(2*HX+1,12,.45,T?0x17283a:0x101c32,0,6.2,side*(HZ-.25));
   plain(.45,12,2*HZ,T?0x17283a:0x101c32,side*(HX-.25),6.2,0);
   plain(2*HX,.18,.12,T?0x55d6b2:0x20c7e8,0,5.1,side*(HZ-.48),{emissive:T?0x167b62:0x087caa,emissiveIntensity:.65});
   const sign=signTex();
   plain(14,3.2,.12,0xffffff,0,8.2,side*(HZ-.48),{map:sign,emissiveMap:sign,emissive:0xffffff,emissiveIntensity:.65});
  });
  plain(2*HX,.35,2*HZ,0x0a1020,0,14,0);
  for(let z=-HZ+2;z<HZ;z+=5)plain(2*HX,.22,.22,0x334155,0,13.65,z);
  for(let x=-HX+3;x<HX;x+=6)plain(.22,.22,2*HZ,0x334155,x,13.65,0);
  [-10,-5,0,5,10].forEach(x=>[-11,0,11].forEach(z=>{
   plain(2.1,.12,.8,0xf8fafc,x,13.2,z,{emissive:0xffffff,emissiveIntensity:1.25});
   if(!COARSE){const light=new THREE.PointLight(0xfff4d6,T?.85:1.15,20);light.position.set(x,12.9,z);courtG.add(light)}
  }));
  const scoreTex=signTex();plain(7,2.2,.18,0x0b1220,0,10.2,0,{map:scoreTex,emissiveMap:scoreTex,emissive:0xffffff,emissiveIntensity:.8});
  [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(side=>{
   const x=side[0]*(hw+13),z=side[1]*(hl+13);
   cyl(.2,.3,10,0x777f8a,x,5,z);
   plain(2.8,1.2,.3,0xfffbe6,x,10.2,z);
   if(!COARSE){const sl=new THREE.SpotLight(0xfff2d0,.55,70,.8,.6);sl.position.set(x,10,z);sl.target.position.set(0,1,0);courtG.add(sl,sl.target)}
  });
  crowd(ps);addExtras(T,hw,hl);
  tb.visible=T;sh.visible=!T;
  [P,C].forEach(p=>{const hd=p.g.userData.rk.userData.head;hd.scale.set(T?1:.75,T?1:.8,1);hd.position.y=T?.56:.62});
  shadow.scale.setScalar(T?1:.6)
 }
 function simLand(p,v,c,w){w=w||{x:0,y:0,z:0};const km=c.km||0,drag=c.k*(mode==='badminton'?1.35:1);let x=p.x,y=p.y,z=p.z,vx=v.x,vy=v.y,vz=v.z,t=0;
 while(t<8){const s=Math.hypot(vx,vy,vz);const ax=-drag*s*vx+km*(w.y*vz-w.z*vy),az=-drag*s*vz+km*(w.x*vy-w.y*vx),ay=-c.g-drag*s*vy+km*(w.z*vx-w.x*vz);vx+=ax*DT;vz+=az*DT;vy+=ay*DT;x+=vx*DT;y+=vy*DT;z+=vz*DT;t+=DT;if(y<=0)break}
 return{x,z,t}}
function hideAimPreview(){aimLine.visible=false;aimLanding.visible=false}
function updateAimPreview(){hideAimPreview()}
let ac;function audio(){ac=ac||new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();return ac}
function beep(f,d){const v=+$('vol').value;if(!v)return;try{audio();const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.value=f;g.gain.value=.25*v;g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d);noise(Math.min(d,.12),f*4,.5*v)}catch(e){}}
function noise(d,fc,vol){if(!ac||!+$('vol').value)return;const n=Math.max(1,ac.sampleRate*d|0),b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(R()*2-1)*(1-i/n);const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();f.type='bandpass';f.frequency.value=fc;f.Q.value=.8;g.gain.value=vol;s.buffer=b;s.connect(f);f.connect(g);g.connect(ac.destination);s.start()}
function transientNoise(duration,low,high,volume,decay=0.035){
 if(!ac||!+$('vol').value||volume<=0)return;
 const n=Math.max(1,Math.floor(ac.sampleRate*duration)),buf=ac.createBuffer(1,n,ac.sampleRate),data=buf.getChannelData(0);
 for(let i=0;i<n;i++){const x=i/n;data[i]=(Math.random()*2-1)*Math.exp(-x*duration/Math.max(.001,decay)*5)}
 const src=ac.createBufferSource(),hp=ac.createBiquadFilter(),lp=ac.createBiquadFilter(),gain=ac.createGain(),t=ac.currentTime;
 hp.type='highpass';hp.frequency.value=low;hp.Q.value=.7;lp.type='lowpass';lp.frequency.value=high;lp.Q.value=.65;
 gain.gain.setValueAtTime(Math.max(.0001,volume),t);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
 src.buffer=buf;src.connect(hp);hp.connect(lp);lp.connect(gain);gain.connect(ac.destination);src.start(t);src.stop(t+duration);
}
// 実録音の効果音（BigSoundBank / CC0）
const REAL_SFX={
 badmintonHit:'https://bigsoundbank.com/UPLOAD/mp3/0537.mp3',
 tennisBall:'https://bigsoundbank.com/UPLOAD/mp3/0584.mp3'
};
let lastHitAudioAt=0;
const REAL_AUDIO={};
function prepareRealAudio(url){
 if(REAL_AUDIO[url])return REAL_AUDIO[url];
 try{const a=new Audio(url);a.preload='auto';a.volume=1;REAL_AUDIO[url]=a;return a}catch(e){return null}
}
function playRealSound(url,volume,maxMs,startAt=0,allowOverlap=false,kind='hit'){
 const v=+$('vol').value;if(!v)return;
 const now=performance.now();
 if(kind==='hit'&&!allowOverlap&&now-lastHitAudioAt<180)return;
 if(kind==='hit'&&!allowOverlap)lastHitAudioAt=now;
 try{
  const a=prepareRealAudio(url);if(!a)return;
  a.volume=Math.max(0,Math.min(1,v));
  try{a.currentTime=startAt||0}catch(e){}
  const stop=()=>{try{a.pause();a.currentTime=0}catch(e){}};
  a.play().then(()=>{if(maxMs>0)setTimeout(()=>{if(!a.paused)stop()},maxMs)}).catch(()=>{});
 }catch(e){}
}
function racketSound(sport,who,speed){
 const v=+$('vol').value;if(!v)return;
 if(sport==='badminton')playRealSound(REAL_SFX.badmintonHit,v,180,0,false,'hit');
 else playRealSound(REAL_SFX.tennisBall,v,150,0,false,'hit');
}
function courtBounceSound(sport,impact){}
function netSound(){
 const v=+$('vol').value;if(!v)return;
 try{audio();transientNoise(.055,700,5200,.12*v,.02)}catch(e){}
}
function cheer(){const v=+$('vol').value;if(!v)return;playRealSound('https://sfxmint.com/dl/crowd-cheer-44.mp3',v,2800,0,true,'cheer')}
function missReaction(){
 const v=+$('vol').value;if(!v)return;
 try{
  if('speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined'){
   speechSynthesis.cancel();
   const u=new SpeechSynthesisUtterance('あぁ……');u.lang='ja-JP';u.rate=.78;u.pitch=.72;u.volume=Math.max(0,Math.min(1,v));
   const vs=speechSynthesis.getVoices();const ja=vs.find(x=>/^ja/i.test(x.lang));if(ja)u.voice=ja;
   speechSynthesis.speak(u);return;
  }
 }catch(e){}
 try{audio();const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(190,t);o.frequency.exponentialRampToValueAtTime(105,t+.48);f.type='lowpass';f.frequency.value=480;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.18*v,t+.07);g.gain.exponentialRampToValueAtTime(.0001,t+.52);o.connect(f);f.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.53)}catch(e){}
}
// 効果音を事前に準備して、打球・得点時の読み込み待ちを減らす
[REAL_SFX.badmintonHit,REAL_SFX.tennisBall,'https://sfxmint.com/dl/crowd-cheer-44.mp3'].forEach(prepareRealAudio);
function hit(who,tx,tz,deg,sp){sp=sp||0;const p=ball.pos,c=cfg,th=deg*D2R;ball.lastHitter=who;ball.bounces=0;ball.net=false;aiL=null;hitCd=.25;const q=(who===1?P:C).q||0;tx+=(R()-.5)*q*3;tz+=(R()-.5)*q*2;
 let dx=tx-p.x,dz=tz-p.z;const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;let s=Math.max(10,L*1.4);const v={x:0,y:0,z:0},spinPower=mode==='tennis'?Math.sign(sp)*Math.min(65,Math.abs(sp)*.45):sp,w={x:dz*spinPower,y:0,z:-dx*spinPower};
 for(let i=0;i<16;i++){v.x=dx*s*Math.cos(th);v.z=dz*s*Math.cos(th);v.y=s*Math.sin(th);const l=simLand(p,v,c,w),Ld=Math.hypot(l.x-p.x,l.z-p.z)||.1;s=clamp(s*Math.pow(L/Ld,.6),3,70)}
 ball.vel.set(v.x,v.y,v.z);ball.spin.set(w.x,mode==='tennis'?(sp===0?0:Math.sign(sp)*Math.min(22,Math.abs(sp)*.09)):0,w.z);(who===1?P:C).swingT=.3;spawn(ball.pos,6,3);if(practice&&who===1){rally++;updScore()}$('spd').textContent=Math.round(ball.vel.length()*3.6)+' km/h';racketSound(mode,who,ball.vel.length()*3.6)}
const tc={x:0,z:0,dash:false,drop:false};
function inp(){let x=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+tc.x,z=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+tc.z;x=clamp(x,-1,1);z=clamp(z,-1,1);return{x,z,dash:!!(keys.ShiftLeft||keys.ShiftRight||tc.dash)}}
function playerShot(who=1){
 const c=cfg,kind=who===1?pendingShotKind:(remoteInput.kind||'normal');
 const i=who===1?inp():{x:remoteInput.x||0,z:-(remoteInput.z||0),dash:!!remoteInput.dash};
 const actionDash=who===1?(!!i.dash||kind==='power'):(!!remoteInput.dash||kind==='power');
 const actionDrop=who===1?(!!tc.drop||kind==='drop'):(!!remoteInput.drop||kind==='drop');
 const shotDash=mode==='tennis'?!!i.dash:actionDash,shotDrop=mode==='tennis'?false:actionDrop;
 const chargedPower=who===1?pendingShotPower:(remoteInput.power||.65),hitter=who===1?P:C;
 if(mode==='badminton'&&actionDash&&ball.pos.y>2.2)hitter.jumpT=.48;
 let tx=i.x*(c.hw-.5)+(R()-.5)*(i.x?.8:3),dz,deg=c.th;
 if(i.z<-.6&&!shotDash){dz=mode==='badminton'?2.2+R()*.8:1.8+R()*1.4;deg=mode==='badminton'?12:32}
 else if(shotDash){dz=c.hl-.9;deg=mode==='badminton'?(ball.pos.y>2.2?-10:16):c.thP;tx+=(R()-.5)*.6}
 else dz=c.hl-1.2-R()*3;
 if(mode==='badminton'&&!actionDash&&!actionDrop){deg=ball.pos.y>2.2?18:ball.pos.y<.85?38:ball.pos.y<1.5?34:ball.pos.y<2.2?29:24}
 if(shotDrop){dz=2.2+R()*.8;deg=8;}
 hit(who,clamp(tx,-c.hw+.3,c.hw-.3),who===1?-dz:dz,deg,mode==='tennis'?(i.dash?60:(i.z<-.6?-120:180)):0);

 if(mode==='badminton'){const shuttleShotMultiplier=clamp(1.12+Math.max(.25,Math.min(1,chargedPower))*.22,1.18,1.4);ball.vel.multiplyScalar(shuttleShotMultiplier);if(ball.vel.length()>80)ball.vel.setLength(80);/* 強打時の画面フラッシュ演出を無効化 */if(who===1)pendingShotPower=.65;else remoteInput.power=.65}
 if(who===1){shotAim=null;shotAimExpires=0;pendingShotKind='normal'}
 else{remoteInput.aim=null;remoteInput.kind='normal';remoteInput.drop=false;remoteInput.dash=false}
}function cpuShotFor(who,p){const c=cfg;let tx=(R()*2-1)*(c.hw-.6),dz=c.hl-1.5-R()*4,deg=c.th+R()*3;const style=R();
 if(R()<ERR[practice?3:OPT.diff])tx+=(R()<.5?-1:1)*2;if(mode==='badminton'&&ball.pos.y>2.3){if(R()<.7)p.jumpT=.48;if(R()<.35){deg=2;dz=c.hl-1}}hit(who,tx,who===1?-dz:dz,deg,mode==='tennis'?(R()<.25?-100:160):0);p.homeX=clamp(tx*.32+(R()-.5)*1.4,-c.hw*.48,c.hw*.48);p.homeZ=-c.hl*(.40+R()*.18)}
function cpuShot(){cpuShotFor(-1,C)}
function tryHit(p){if(state!=='rally'||ball.net||ball.lastHitter===p.who||hitCd>0)return;const b=ball.pos;
  const powerShot=p===P&&!!inp().dash;
 const controlled=p===P||(p===C&&netRole==='host'&&netConn&&netConn.open);if(controlled&&p.swingReqT<=0)return;
 const hd=Math.hypot(b.x-p.x,b.z-p.z),reach=cfg.reach*(mode==='badminton'?.98:.9),lowBadminton=mode==='badminton'&&b.y<1.1,isDoublesNpc=selectedFormat==='doubles'&&(p===P2||p===C2),hitReach=isDoublesNpc?Math.max(2.15,mode==='badminton'?1.7:reach):(mode==='badminton'?2.35+(lowBadminton?.15:0):(mode==='tennis'?2.8:reach)),diveShot=mode==='tennis'&&p.swingT>0&&b.z*p.who>=.3&&((Math.abs(b.x)>=cfg.hw*.68&&Math.abs(b.x-p.x)>reach*.45)||((b.z-p.z)*p.who>.45&&Math.abs(b.z-p.z)<1.8));
  // バドミントンは低いシャトルも拾えるようにし、床に触れる直前まで打てるようにする
  if(b.z*p.who<-.3||b.y>cfg.hMax||b.y<.07||hd>hitReach)return;
  /* 成功打撃時の画面フラッシュ演出を無効化 */
 if(diveShot){p.diveT=1.2;p.diveX=clamp((b.x-p.x)*.42,-.85,.85);p.diveZ=clamp((b.z-p.z)*.35,-.65,.65);p.vx=0;p.vz=0}
 p.q=Math.max(0,hd/hitReach-.4)+(b.y<.4?.3:0);p.swingReqT=0;if(p===P)playerShot(1);else if(p===C&&netRole==='host'&&netConn&&netConn.open)playerShot(-1);else cpuShotFor(p.who,p);p.swingT=.3}
function doServe(who){const c=cfg;ball.lastHitter=who;state='rally';(who===1?P:C).q=0;const power=who===1?servePower:Math.max(.25,Math.min(1,remoteInput.power||.65));const spread=(1-power*.92);const serveAngle=mode==='tennis'?10-power*9:18;const aim=who===1?serveAim:(remoteInput.serveAim||null);const serveX=mode==='badminton'&&aim?clamp(aim.x,-1,1)*c.hw*.82:(R()*2-1)*c.hw*.6*spread;const serveZ=mode==='badminton'&&aim?-who*(c.hl*.5+clamp(aim.y,-1,1)*c.hl*.25):-who*c.hl*.5;hit(who,serveX,serveZ,serveAngle,mode==='tennis'?120*(1-power*.75):0);if(who===1||who===-1){const serveMultiplier=mode==='badminton'?1:.8+power*.35;ball.vel.multiplyScalar(serveMultiplier);$('spd').textContent=Math.round(ball.vel.length()*3.6)+' km/h'}syncTouchActions();servePower=.65;$('msg').textContent=''}
const T4=[0,15,30,40];
const OPT={mode:0,diff:1,mlen:1,col:0},COLS=['#3b82f6','#ef4444','#22c55e','#f59e0b','#a855f7','#ec4899'],ERR=[.28,.12,.04,.03],SPD=[.8,1,1.2,1],GW=[1,2],BP=[7,11];
let practice=false,rally=0,best=0,pname='プレイヤー',REC={tennis:[0,0],badminton:[0,0]},RATING={tennis:1000,badminton:1000},bgmT=null,needsNickname=true;
try{const sv=JSON.parse(localStorage.getItem('rs1')||'{}');if(sv.REC)REC=sv.REC;if(sv.RATING&&typeof sv.RATING==='object')RATING={tennis:Number(sv.RATING.tennis)||1000,badminton:Number(sv.RATING.badminton)||1000};if(typeof sv.name==='string'&&sv.name.trim()){pname=sv.name;needsNickname=false}if(sv.col!=null)OPT.col=sv.col;Object.assign(OPT,sv.opt||{})}catch(e){}
function save(){try{localStorage.setItem('rs1',JSON.stringify({REC,RATING,name:pname,col:OPT.col,opt:{mode:OPT.mode,diff:OPT.diff,mlen:OPT.mlen}}))}catch(e){}}
function ratingRank(r){r=Number(r)||1000;return r>=2400?'ダイヤモンド':r>=2000?'プラチナ':r>=1600?'ゴールド':r>=1300?'シルバー':'ブロンズ'}
function paint(){document.querySelectorAll('.seg').forEach(sg=>sg.querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.v===OPT[sg.dataset.k])));document.querySelectorAll('.sw').forEach((b,i)=>b.classList.toggle('on',i===OPT.col));$('av').style.background=COLS[OPT.col];const t=REC.tennis,bd=REC.badminton;$('rec').textContent='🎾 '+t[0]+'勝'+t[1]+'敗　🏸 '+bd[0]+'勝'+bd[1]+'敗　｜　🎾 '+RATING.tennis+'（'+ratingRank(RATING.tennis)+'） / 🏸 '+RATING.badminton+'（'+ratingRank(RATING.badminton)+'）';}
function initMenu(){const cs=$('cols');if(cs)COLS.forEach((c,i)=>{const b=document.createElement('button');b.className='sw';b.style.background=c;b.onclick=()=>{OPT.col=i;paint();save();beep(700,.05)};cs.appendChild(b)});document.querySelectorAll('.seg').forEach(sg=>sg.querySelectorAll('button').forEach(b=>b.onclick=()=>{OPT[sg.dataset.k]=+b.dataset.v;paint();save();beep(600,.05)}));$('nm').value=pname;$('nm').maxLength=12;$('nm').readOnly=true;let nicknameEditing=false;const openNicknameEditor=editing=>{nicknameEditing=!!editing;$('nickTitle').textContent=nicknameEditing?'ニックネームの変更':'ニックネーム設定';$('nickDescription').textContent=nicknameEditing?'新しいニックネームを入力してください。変更はこの端末に保存されます。':'ゲームで使用する名前を設定してください。';$('nickInput').value=nicknameEditing?pname:'';$('nickInput').placeholder='12文字以内';$('nickConfirm').textContent=nicknameEditing?'変更を保存':'この名前で始める';$('nickCancel').hidden=!nicknameEditing;$('nickSetup').style.display='flex';setTimeout(()=>$('nickInput').focus(),100)};$('changeNickname').onclick=()=>openNicknameEditor(true);$('nickCancel').onclick=()=>{$('nickSetup').style.display='none';nicknameEditing=false};$('nickConfirm').onclick=()=>{const n=$('nickInput').value.trim().slice(0,12);if(!n){$('nickInput').focus();$('nickInput').placeholder='名前を入力してください';return}pname=n;$('nm').value=n;needsNickname=false;save();$('nickSetup').style.display='none';nicknameEditing=false;beep(660,.08)};$('nickInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('nickConfirm').click()});if(needsNickname)openNicknameEditor(false);paint()}
const bgmNodes=new Set();function bgm(on){clearInterval(bgmT);bgmT=null;if(!on){for(const n of bgmNodes){try{n.stop()}catch(e){}}bgmNodes.clear();return}if(bgmT)return;const chords=[[261.63,329.63,392.00],[220.00,261.63,329.63],[174.61,220.00,261.63],[196.00,246.94,293.66]],scale=[523.25,587.33,659.25,783.99,880,783.99,659.25,587.33,523.25,659.25,783.99,1046.5,880,783.99,659.25,587.33];let i=0;const note=(freq,dur,type,level)=>{const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;bgmNodes.add(o);o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(Math.max(.0002,level*(+$('vol').value)),t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(ac.destination);o.onended=()=>bgmNodes.delete(o);o.start(t);o.stop(t+dur+.03)};bgmT=setInterval(()=>{if((state!=='menu'&&!matchIntro)||(!matchIntro&&$('menu').hidden)||!$('res').hidden||!ac)return;const v=+$('vol').value;if(!v)return;try{const step=i%16,bar=Math.floor(i/16)%4;note(scale[step],.20,'triangle',.045);if(step%2===0)note(chords[bar][(step/2)%3],.38,'sine',.018);if(step%4===0)note(chords[bar][0]/2,.34,'sine',.035);if(step===0||step===8)note(chords[bar][2]*2,.12,'sine',.012);i++}catch(e){}},220)}
function getAchievementState(){try{return JSON.parse(localStorage.getItem('rsAchievements')||'{}')}catch(e){return {}}}
function saveAchievementState(v){try{localStorage.setItem('rsAchievements',JSON.stringify(v))}catch(e){}}
function awardAchievements(){const a=getAchievementState(),matches=(REC.tennis[0]||0)+(REC.tennis[1]||0)+(REC.badminton[0]||0)+(REC.badminton[1]||0),wins=(REC.tennis[0]||0)+(REC.badminton[0]||0),champions=Number(a.champions||0);const rules=[['first_match','🎾','初試合','はじめて試合を完了する',matches>=1],['first_win','🥇','初勝利','はじめて勝利する',wins>=1],['ten_wins','🔥','10勝達成','合計10勝する',wins>=10],['twentyfive_matches','🎯','経験豊富','合計25試合を完了する',matches>=25],['champion','🏆','大会チャンピオン','トーナメントで優勝する',champions>=1]];a.unlocked=a.unlocked||{};rules.forEach(r=>{if(r[4])a.unlocked[r[0]]=true});saveAchievementState(a);return {a,rules,matches,wins}}
function renderAchievements(){const d=awardAchievements(),list=$('achievementList');list.innerHTML=d.rules.map(r=>'<div class="achievementItem '+(d.a.unlocked[r[0]]?'':'locked')+'"><span class="achIcon">'+r[1]+'</span><div><b>'+r[2]+(d.a.unlocked[r[0]]?'　✓':'')+'</b><small>'+r[3]+'</small></div></div>').join('');$('achievementProgress').textContent='獲得 '+d.rules.filter(r=>d.a.unlocked[r[0]]).length+' / '+d.rules.length+'　｜　通算 '+d.matches+' 試合・'+d.wins+' 勝';}
function openAchievements(){$('menu').hidden=true;$('achievementPanel').hidden=false;renderAchievements()}
function closeAchievements(){$('achievementPanel').hidden=true;$('menu').hidden=false}
function showChampionCeremony(){const a=getAchievementState();a.champions=Number(a.champions||0)+1;saveAchievementState(a);$('championName').textContent=pname||'プレイヤー';$('championDetail').textContent='トーナメントを制覇しました！ 新しい称号「大会チャンピオン」を獲得！';$('championCeremony').hidden=false;awardAchievements();try{cheer()}catch(e){}}
function screenTransition(){const el=$('screenFade');if(!el)return;el.classList.remove('active');void el.offsetWidth;el.classList.add('active');clearTimeout(window.rsFadeTimer);window.rsFadeTimer=setTimeout(()=>el.classList.remove('active'),240)}
function finish(){const w=over===1,s=score;if(activeTournamentMatchRef&&(netRole==='host'||netRole==='offline')){const tournamentScore=mode==='tennis'?String(s.sets[0])+' - '+String(s.sets[1]):String(s.games[0])+' - '+String(s.games[1]);completeTournamentMatch(over,tournamentScore).catch(e=>console.warn('トーナメント結果の保存に失敗:',e))}if(!practice){REC[mode][w?0:1]++;RATING[mode]=Math.max(100,Math.min(3000,(Number(RATING[mode])||1000)+(w?20:-15)));save();paint()}$('rt').textContent=w?'WIN!':'LOSE…';$('rt').className=w?'win':'lose';$('resultBadge').textContent=practice?'PRACTICE RESULT':(w?'VICTORY':'MATCH RESULT');$('rs').textContent=mode==='tennis'?'セット '+s.sets[0]+' - '+s.sets[1]:'ゲーム '+s.games[0]+' - '+s.games[1];const a=getAchievementState(),wins=(REC.tennis[0]||0)+(REC.badminton[0]||0),matches=(REC.tennis[0]||0)+(REC.tennis[1]||0)+(REC.badminton[0]||0)+(REC.badminton[1]||0);$('resultSummary').textContent=(practice?'練習モード｜ラリー '+rally+' 回・ベスト '+best+' 回':'通算 '+matches+' 試合｜'+wins+' 勝')+(w?'　🎉 勝利！':'');if(!practice)renderAchievements();state='menu';$('hud').hidden=true;$('touch').hidden=true;$('mb').hidden=true;$('res').hidden=false;$('res').classList.remove('result-enter');void $('res').offsetWidth;$('res').classList.add('result-enter');beep(w?880:200,.4);try{if(w)cheer()}catch(e){}}
function updScore(){const s=score;$('score').innerHTML=sbHtml()}
function sbHtml(){if(practice)return '<div class="sr"><b>ラリー</b><i></i><u>'+rally+'</u></div><div class="sr"><b>ベスト</b><i></i><u>'+best+'</u></div>';const s=score,T=mode==='tennis',a=s.pts[0],b=s.pts[1],homeName=netRole==='offline'?pname:friendNames.host,awayName=netRole==='offline'?'CPU':friendNames.guest;let x=a,y=b;if(T){if(s.tiebreak){x=a;y=b}else if(a>=3&&b>=3){x=a===b?'40':a>b?'Ad':'40';y=a===b?'40':b>a?'Ad':'40'}else{x=T4[a];y=T4[b]}}const clean=n=>String(n).replace(/[<>&"]/g,'');const r=(n,p)=>'<div class="sr playerPoint"><b>'+n+'</b><u>'+p+'</u></div>';if(T)return '<div class="sr summary compactSummary"><b>SET '+s.sets[0]+' - '+s.sets[1]+'</b><i>GAME '+s.games[0]+' - '+s.games[1]+'</i></div>'+r(clean(homeName),x)+r(clean(awayName),y)+(s.tiebreak?'<div class="sr summary compactSummary"><b>タイブレーク</b><i>'+a+' - '+b+'</i></div>':'');return '<div class="sr summary compactSummary"><b>GAME '+s.games[0]+' - '+s.games[1]+'</b><i>21点先取</i></div>'+r(clean(homeName),a)+r(clean(awayName),b)}
let transitionTimer=null;
function showMatchTransition(kicker,title,sub,duration=1350){
 const previous=$('matchTransition');if(previous)previous.remove();
 if(transitionTimer)clearTimeout(transitionTimer);
 const el=document.createElement('div');el.id='matchTransition';
 el.innerHTML='<div class="mt-card"><div class="mt-kicker"></div><div class="mt-title"></div><div class="mt-sub"></div></div>';
 el.querySelector('.mt-kicker').textContent=kicker;
 el.querySelector('.mt-title').textContent=title;
 el.querySelector('.mt-sub').textContent=sub;
 document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('show'));
 try{audio();const t=ac.currentTime,v=+$('vol').value;if(v){const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.setValueAtTime(420,t);o.frequency.exponentialRampToValueAtTime(760,t+.22);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.12*v,t+.035);g.gain.exponentialRampToValueAtTime(.0001,t+.42);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.45)}}catch(e){}
 transitionTimer=setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),260);transitionTimer=null},duration);
}
function point(w,why){const replayDuration=replayFrames.length>1?replayFrames[replayFrames.length-1].t-replayFrames[0].t:0;if(!practice&&replayFrames.length>1&&replayDuration>=3){replayAutoPending=true;replayPointT=tm;replayAutoAt=tm+.85;}else{replayAutoPending=false;}if(practice){state='point';syncTouchActions();msgT=1.4;best=Math.max(best,rally);$('msg').textContent='ラリー '+rally+'回！（'+why+'）';rally=0;server=1;updScore();$('pointScore').hidden=true;beep(300,.2);return}state='point';msgT=2.4;pointScoreShown=false;pointWinner=w;$('pointScore').hidden=true;$('msg').textContent=why;const i=w===1?0:1,o=1-i,s=score,serving=server,oldGames0=s.games[0],oldGames1=s.games[1],oldSets0=s.sets?s.sets[0]:0,oldSets1=s.sets?s.sets[1]:0;let m=(w===1?'ポイント！':'相手のポイント')+'（'+why+'）';
 s.pts[i]++;
 if(mode==='tennis'){
   let gameWon=false,setWon=false;
   if(s.tiebreak){
     const total=s.pts[0]+s.pts[1];
     if(s.pts[i]>=7&&s.pts[i]-s.pts[o]>=2){
       s.games[i]++;s.pts=[0,0];s.tiebreak=false;gameWon=true;
       if(s.games[i]>=6&&s.games[i]-s.games[o]>=2||s.games[i]===7){s.sets[i]++;s.games=[0,0];setWon=true}
       server=-s.tbFirstServer;
     }else if(total===1||(total>1&&total%2===1)){server=-serving}
   }else if(s.pts[i]>=4&&s.pts[i]-s.pts[o]>=2){
     s.games[i]++;s.pts=[0,0];gameWon=true;server=-serving;
     if(s.games[i]>=6&&s.games[i]-s.games[o]>=2){s.sets[i]++;s.games=[0,0];setWon=true}
     else if(s.games[0]===6&&s.games[1]===6){s.tiebreak=true;s.pts=[0,0];s.tbFirstServer=server}
   }
   if(gameWon){suppressPointScore=true;m=setWon?(w===1?'セット獲得！':'相手がセット獲得'):(w===1?'ゲーム獲得！':'相手がゲーム獲得')}
   if(s.sets[i]>=2){over=w;m=w===1?'試合終了！ 2セット先取':'試合終了！ 相手が2セット先取';}
 }else{server=w;const gameWon=(s.pts[i]>=21&&s.pts[i]-s.pts[o]>=2)||s.pts[i]===30;if(gameWon){s.games[i]++;s.pts=[0,0];suppressPointScore=true;m=(w===1?'ゲーム獲得！':'相手がゲーム獲得');if(s.games[i]>=2){over=w;m=w===1?'試合終了！ 2ゲーム先取':'試合終了！ 相手が2ゲーム先取'}}}
 updScore();$('msg').textContent=why;beep(w===1?760:240,.25);if(w===1)cheer();else missReaction();announcePoint(w,m);
 if(mode==='tennis'&&s.sets[i]>oldSets0+(i===0?0:0)||mode==='tennis'&&s.sets[1]>oldSets1){setTimeout(()=>{if(!over)showMatchTransition('SET '+(s.sets[0]+s.sets[1]),w===1?'SET WON':'CPU TAKES SET','SETS  '+s.sets[0]+'  —  '+s.sets[1],1400)},550)}
 else if((s.games[0]!==oldGames0||s.games[1]!==oldGames1)&&!over){const won=s.games[i]>(i===0?oldGames0:oldGames1);setTimeout(()=>{if(!over)showMatchTransition(s.tiebreak?'TIE-BREAK':'GAME '+(s.games[0]+s.games[1]),won?(w===1?'GAME WON':'CPU TAKES GAME'):'NEXT GAME','SETS '+(s.sets?s.sets[0]+'-'+s.sets[1]+' ｜ ':'')+'GAMES '+s.games[0]+' — '+s.games[1],1150)},550)}
}
function announcePoint(w,result){if(!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window))return;const s=score,T=mode==='tennis';let call=w===1?'あなたのポイント。':'CPUのポイント。';if(T){if(s.tiebreak){call+='タイブレーク、'+s.pts[0]+'対'+s.pts[1]+'。セットスコア、'+s.sets[0]+'対'+s.sets[1]+'。'}else{const names=['ラブ','フィフティーン','サーティ','フォーティ'];let a=s.pts[0],b=s.pts[1],x,y;if(a>=3&&b>=3){x=a===b?'フォーティ':a>b?'アドバンテージ あなた':'フォーティ';y=a===b?'フォーティ':b>a?'アドバンテージ CPU':'フォーティ'}else{x=names[a]||'フォーティ';y=names[b]||'フォーティ'}call+='スコア、'+x+'、'+y+'。ゲームスコア、'+s.games[0]+'対'+s.games[1]+'。セットスコア、'+s.sets[0]+'対'+s.sets[1]+'。'}}else{call+='スコア、あなた '+s.pts[0]+'、CPU '+s.pts[1]+'。'}if(result.includes('ゲーム獲得'))call+='ゲーム。';if(result.includes('セット獲得'))call+='セット。';if(over)call+='試合終了。';try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(call);u.lang='ja-JP';u.rate=.92;u.pitch=1;u.volume=Math.max(.35,Math.min(1,+$('vol').value||.8));window.speechSynthesis.speak(u)}catch(e){}}
function showPointScore(w){const s=score,T=mode==='tennis',homeName=(netRole==='offline'?pname:friendNames.host).replace(/[<>&"]/g,''),awayName=(netRole==='offline'?'CPU':friendNames.guest).replace(/[<>&"]/g,''),p=(n)=>T?(s.tiebreak?String(n):(n>=3&&s.pts[0]>=3&&s.pts[1]>=3?(s.pts[0]===s.pts[1]?'40':n===s.pts[0]?(s.pts[0]>s.pts[1]?'Ad':'40'):(s.pts[1]>s.pts[0]?'Ad':'40')):T4[n])):String(n),a=T?p(s.pts[0]):String(s.pts[0]),b=T?p(s.pts[1]):String(s.pts[1]);let sub=(T?'セット '+s.sets[0]+'-'+s.sets[1]+' ／ ':'')+'ゲーム '+s.games[0]+' - '+s.games[1]+' ／ 得点 '+a+' - '+b;if(over)sub+=' ｜ 試合終了';$('pointScore').innerHTML='<div class="ps-title">'+(over?'MATCH POINT':'LIVE SCORE')+'</div><div class="ps-main"><span>'+a+'</span><span>－</span><span>'+b+'</span></div><div class="ps-sub"><span class="ps-names">'+homeName+'</span> 対 <span class="ps-names">'+awayName+'</span>　'+sub+'</div>';$('pointScore').classList.remove('fadeOut');$('pointScore').hidden=false}
// 直近10秒の試合状態を記録し、物理進行を止めて再生する
const REPLAY_MAX=10,REPLAY_STEP=.08;let replayFrames=[],replayRecordT=0,replayPlaying=false,replayAutoPending=false,replayAutoAt=0,replayPointT=0,replayPlayT=0,replaySaved=null,replayBadge=null;
function captureReplayFrame(){
 if(replayPlaying||state!=='rally'||paused||netRole==='guest')return;
 const now=tm;if(now-replayRecordT<REPLAY_STEP)return;replayRecordT=now;
 const pack=p=>({x:p.x,z:p.z,swingT:p.swingT||0,jumpT:p.jumpT||0,diveT:p.diveT||0,diveX:p.diveX||0,diveZ:p.diveZ||0,rot:p.g.rotation.z||0});
 replayFrames.push({t:now,state,P:pack(P),C:pack(C),P2:pack(P2),C2:pack(C2),ball:{x:ball.pos.x,y:ball.pos.y,z:ball.pos.z,net:ball.net},cam:camera.position.toArray(),look:lk.toArray()});
 while(replayFrames.length>2&&now-replayFrames[0].t>REPLAY_MAX)replayFrames.shift();
 
}
function startReplay(auto=false){
 if(replayPlaying||replayFrames.length<2)return false;
 const endLimit=auto?Math.min(replayFrames[replayFrames.length-1].t,replayPointT):replayFrames[replayFrames.length-1].t;
 const endFrameIndex=replayFrames.findLastIndex?replayFrames.findLastIndex(f=>f.t<=endLimit):(()=>{let n=-1;for(let i=0;i<replayFrames.length;i++)if(replayFrames[i].t<=endLimit)n=i;return n})();
 const end=endFrameIndex>=0?replayFrames[endFrameIndex].t:replayFrames[replayFrames.length-1].t,start=Math.max(replayFrames[0].t,end-(auto?3:REPLAY_MAX));
 const frames=replayFrames.filter(f=>f.t>=start&&f.t<=end);
 if(frames.length<2)return false;
 replaySaved={P:{x:P.x,z:P.z},C:{x:C.x,z:C.z},P2:{x:P2.x,z:P2.z},C2:{x:C2.x,z:C2.z},ball:{x:ball.pos.x,y:ball.pos.y,z:ball.pos.z},camera:camera.position.toArray(),look:lk.toArray()};
 replayPlaying=true;replayPlayT=0;replayAutoPending=false;
 
 replayBadge=document.createElement('div');replayBadge.id='replayBadge';replayBadge.textContent='REPLAY  ·  '+Math.min(REPLAY_MAX,frames[frames.length-1].t-frames[0].t).toFixed(1)+'秒';document.body.appendChild(replayBadge);
 replayActiveFrames=frames;return true;
}
let replayActiveFrames=[];
function applyReplayFrame(f){
 const put=(p,d)=>{p.x=d.x;p.z=d.z;p.swingT=d.swingT;p.jumpT=d.jumpT;p.diveT=d.diveT;p.diveX=d.diveX;p.diveZ=d.diveZ;p.g.rotation.z=d.rot||0;p.g.position.set(d.x,0,d.z)};
 put(P,f.P);put(C,f.C);put(P2,f.P2);put(C2,f.C2);
 ball.pos.set(f.ball.x,f.ball.y,f.ball.z);ball.prev.copy(ball.pos);ballG.position.copy(ball.pos);
 camera.position.fromArray(f.cam);lk.fromArray(f.look);camera.lookAt(lk);
}
function updateReplay(dt){
 if(!replayPlaying)return;
 replayPlayT+=dt*.72;const fs=replayActiveFrames,elapsed=replayPlayT,first=fs[0].t,last=fs[fs.length-1].t,target=first+elapsed;
 if(target>=last){applyReplayFrame(fs[fs.length-1]);finishReplay();return}
 let i=0;while(i<fs.length-2&&fs[i+1].t<target)i++;
 const a=fs[i],b=fs[i+1],q=clamp((target-a.t)/Math.max(.001,b.t-a.t),0,1);
 const mix=(x,y)=>x+(y-x)*q,lerpPlayer=(x,y)=>{const d={};['x','z','swingT','jumpT','diveT','diveX','diveZ','rot'].forEach(k=>d[k]=mix(x[k]||0,y[k]||0));return d};
 applyReplayFrame({P:lerpPlayer(a.P,b.P),C:lerpPlayer(a.C,b.C),P2:lerpPlayer(a.P2,b.P2),C2:lerpPlayer(a.C2,b.C2),ball:{x:mix(a.ball.x,b.ball.x),y:mix(a.ball.y,b.ball.y),z:mix(a.ball.z,b.ball.z)},cam:a.cam.map((v,j)=>mix(v,b.cam[j])),look:a.look.map((v,j)=>mix(v,b.look[j]))});
}
function finishReplay(){
 replayPlaying=false;replayActiveFrames=[];if(replayBadge){replayBadge.remove();replayBadge=null}
 if(replaySaved){[[P,replaySaved.P],[C,replaySaved.C],[P2,replaySaved.P2],[C2,replaySaved.C2]].forEach(([p,d])=>{p.x=d.x;p.z=d.z;p.g.position.set(p.x,0,p.z)});ball.pos.set(replaySaved.ball.x,replaySaved.ball.y,replaySaved.ball.z);ball.prev.copy(ball.pos);ballG.position.copy(ball.pos);camera.position.fromArray(replaySaved.camera);lk.fromArray(replaySaved.look);replaySaved=null}
 
}

function triggerPowerImpact(){}
let powerImpactTimer=null;
function beginServe(){replayFrames=[];replayRecordT=0;replayAutoPending=false;suppressPointScore=false;serveCharging=false;shotCharging=false;chargeKind='';serveAim=null;servePower=.65;shotPower=.65;pendingShotPower=.65;$('serveMeter').hidden=true;$('pointScore').classList.remove('fadeOut');$('pointScore').hidden=true;state='serveWait';serveT=0;const c=cfg;P.x=0;C.x=0;P.z=c.hl+1.5;C.z=-(c.hl+1.5);P2.x=-c.hw*.48;P2.z=c.hl*.48;C2.x=c.hw*.48;C2.z=-c.hl*.48;ball.vel.set(0,0,0);ball.spin.set(0,0,0);ball.net=false;ball.bounces=0;ball.lastHitter=server;
 $('msg').textContent=servePrompt();syncTouchActions()}
function servePrompt(){return server===(netRole==='guest'?-1:1)?(mode==='badminton'?'サーブ：ボタンをスライドして方向を決める':'サーブ：ボタン／Space長押しで威力調整'):'相手のサーブ'}
let matchIntro=null;
function introSound(phase){
 const v=+$('vol').value;if(!v)return;
 try{
  audio();const t=ac.currentTime;
  const tone=(freq,endFreq,duration,type,gain,delay=0)=>{
   const o=ac.createOscillator(),g=ac.createGain(),at=t+delay;
   o.type=type;o.frequency.setValueAtTime(freq,at);
   if(endFreq!==freq)o.frequency.exponentialRampToValueAtTime(Math.max(1,endFreq),at+duration);
   g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain*v),at+.025);
   g.gain.exponentialRampToValueAtTime(.0001,at+duration);
   o.connect(g);g.connect(ac.destination);o.start(at);o.stop(at+duration+.03);
  };
  if(phase==='player'){transientNoise(.42,650,5200,.19*v,.015);tone(520,180,.38,'sine',.12)}
  else if(phase==='opponent'){transientNoise(.5,420,3600,.22*v,.02);tone(300,110,.42,'triangle',.16)}
  else if(phase==='match'){transientNoise(.65,350,6200,.16*v,.02);tone(440,660,.42,'sine',.09,.08)}
  else if(phase==='ready'){tone(660,660,.14,'triangle',.19);tone(880,880,.16,'triangle',.21,.19)}
  else if(phase==='play'){
   transientNoise(.28,180,2400,.28*v,.025);
   tone(180,65,.42,'sawtooth',.14);tone(520,1040,.22,'sine',.12,.035);
  }
 }catch(e){}
}
function startMatchIntro(){
 if($('matchIntro'))$('matchIntro').remove();
 const el=document.createElement('div');el.id='matchIntro';el.innerHTML='<div class="mi-glow"></div><div class="mi-top">RACKET STARS · MATCH PRESENTATION</div><div class="mi-bar top"></div><div class="mi-main"><div class="mi-title" id="miTitle">READY?</div><div class="mi-sub" id="miSub">PLAYER 1 VS CPU</div><div class="mi-dots"><i></i><i></i><i></i></div></div><div class="mi-bar bottom"></div><div class="mi-bottom" id="miBottom">GET READY TO PLAY</div>';
 document.body.appendChild(el);matchIntro={el,t:0};
}
function updateMatchIntro(dt){
 if(!matchIntro)return false;
 matchIntro.t+=dt*0.84;const t=matchIntro.t,el=matchIntro.el,title=$('miTitle'),sub=$('miSub'),bottom=$('miBottom');
 let phase='';
 if(t<1.24){phase='player';title.textContent='PLAYER 1';sub.textContent='YOUR COURT. YOUR MOMENT.';bottom.textContent='INTRODUCING YOU';}
 else if(t<2.50){phase='opponent';title.textContent='CHALLENGER';sub.textContent=netRole==='guest'?'PLAYER 1 VS YOU':(netRole==='host'&&activeRoomRef?'PLAYER 1 VS FRIEND':'PLAYER 1 VS CPU');bottom.textContent='MEET YOUR OPPONENT';}
 else if(t<3.62){phase='match';title.textContent=mode==='tennis'?'TENNIS':'BADMINTON';sub.textContent=selectedFormat==='doubles'?'DOUBLES MATCH':'SINGLES MATCH';bottom.textContent='GET INTO POSITION';}
 else if(t<4.40){phase='ready';title.textContent='READY?';sub.textContent='';bottom.textContent='GET READY';}
 else if(t<4.93){phase='three';title.textContent='3';sub.textContent='';bottom.textContent='';}
 else if(t<5.46){phase='two';title.textContent='2';sub.textContent='';bottom.textContent='';}
 else if(t<5.99){phase='one';title.textContent='1';sub.textContent='';bottom.textContent='';}
 else if(t<6.95){phase='play';title.textContent='PLAY!';sub.textContent='LET THE MATCH BEGIN';bottom.textContent='';}
 else{
  el.classList.add('out');matchIntro=null;bgm(false);
  setTimeout(()=>{if(el.isConnected)el.remove()},600);
  if(netRole!=='guest')beginServe();
  return false;
 }
 if(matchIntro.phase!==phase){
   matchIntro.phase=phase;
   introSound(phase);
   title.classList.remove('changing');void title.offsetWidth;title.classList.add('changing');
   sub.classList.remove('changing');void sub.offsetWidth;sub.classList.add('changing');
 }
 return true;
}
function updateMatchIntroCamera(){
 if(!matchIntro)return;
 const t=matchIntro.t,p=netRole==='guest'?C:P,op=netRole==='guest'?P:C;
 let x,y,z,tx,ty,tz;
 if(t<1.26){x=p.x+1.8;y=2.3;z=p.z+(mode==='tennis'?3.4:3.0);tx=p.x;ty=1.15;tz=p.z;}
 else if(t<2.53){x=op.x-1.8;y=2.5;z=op.z-(mode==='tennis'?3.7:3.2);tx=op.x;ty=1.2;tz=op.z;}
 else if(t<3.68){const q=clamp((t-2.53)/1.15,0,1);x=Math.sin(q*Math.PI)*2.2;y=6.5;z=p.z+(mode==='tennis'?10:9);tx=0;ty=.9;tz=0;}
 else{x=p.x*.35;y=4.2;z=p.z+(mode==='tennis'?6.2:8);tx=0;ty=1;tz=0;}
 const target=new THREE.Vector3(x,y,z),look=new THREE.Vector3(tx,ty,tz);camera.position.lerp(target,1-Math.exp(-8*fdt));lk.lerp(look,1-Math.exp(-9*fdt));camera.lookAt(lk);
}
function start(m){
  if(netRole==='guest')netGuestSnapshotSeen=false;
  // 先に画面を切り替え、コート構築時のエラーでPLAYが無反応に見える状態を防ぐ
  const menu=$('menu'),hud=$('hud');
  paused=false;$('pauseMenu').hidden=true;menu.hidden=true;$('formatMenu').hidden=true;$('modeMenu').hidden=true;$('res').hidden=true;hud.hidden=false;$('touch').hidden=!COARSE;$('mb').hidden=false;
  try{
    buildCourt(m);$('fov').value=currentFov();$('fovValue').textContent=$('fov').value+'°';practice=OPT.mode===1&&netRole==='offline';rally=0;best=0;
    const shirt=P.g.children[0];if(shirt&&shirt.material&&shirt.material.color)shirt.material.color.set(COLS[OPT.col]);
    $('res').hidden=true;score={pts:[0,0],games:[0,0],sets:[0,0],tiebreak:false,tbFirstServer:1};over=null;server=1;
    $('ttl').innerHTML='RACKET<br>STARS';updScore();
    renderer.setPixelRatio(Math.min(devicePixelRatio,+$('q').value,COARSE?1.8:2.4));
    rs();
    beginServe();
    startMatchIntro();
    camera.position.set(P.x,4.3,P.z+(mode==='tennis'?7.5:6.5));
    lk.set(P.x*.4,1.2+ball.pos.y*.12,P.z-9+(ball.pos.z-P.z+9)*.1);
    camera.lookAt(lk);
    renderer.clear();
  }catch(err){
    state='menu';hud.hidden=true;$('touch').hidden=true;$('mb').hidden=true;menu.hidden=false;bgm(true);
    console.error('ゲーム開始エラー:',err);
    alert('ゲームを開始できませんでした。ページを再読み込みしてください。\nエラー: '+(err&&err.message?err.message:String(err)));
  }
}
function togglePause(force){if(state==='menu'||!$('res').hidden)return;paused=typeof force==='boolean'?force:!paused;$('pauseMenu').hidden=!paused;if(paused){Object.keys(keys).forEach(k=>keys[k]=false);tc.x=tc.z=0;tc.dash=tc.drop=false;if($('chatPanel'))$('chatPanel').classList.remove('open')} }
function toMenu(){if(replayPlaying)finishReplay();replayFrames=[];replayAutoPending=false;replayAutoAt=0;if(matchIntro){matchIntro.el.remove();matchIntro=null}paused=false;$('pauseMenu').hidden=true;state='menu';$('modeMenu').hidden=true;$('menu').hidden=false;$('hud').hidden=true;$('touch').hidden=true;$('mb').hidden=true;$('res').hidden=true;disconnectRoom();bgm(true);paint()}
function stepBall(){const b=ball,c=cfg,v=b.vel,s=v.length();b.prev.copy(b.pos);
 const sw=b.spin,km=c.km||0,drag=c.k*(mode==='badminton'?1.35:1),ax=-drag*s*v.x+km*(sw.y*v.z-sw.z*v.y),az=-drag*s*v.z+km*(sw.x*v.y-sw.y*v.x),ay=-c.g-drag*s*v.y+km*(sw.z*v.x-sw.x*v.z);v.x+=ax*DT;v.y+=ay*DT;v.z+=az*DT;sw.multiplyScalar(1-.08*DT);const pz=b.pos.z,py=b.pos.y;b.pos.addScaledVector(v,DT);
 const crossedNet=pz*b.pos.z<0,netCrossT=crossedNet?clamp(-pz/(b.pos.z-pz),0,1):1,netCrossY=py+(b.pos.y-py)*netCrossT;
 if(!b.net&&crossedNet&&netCrossY<c.netH-(mode==='tennis'?.06:0)){b.net=true;v.z*=-.12;v.x*=.3;v.y=Math.max(v.y,0)*.2;netSound();b.pos.z=pz;b.pos.y=netCrossY}
 if(b.pos.y<=c.r){if(b.net){point(-b.lastHitter,'ネット');return}const inb=Math.abs(b.pos.x)<=c.hw&&Math.abs(b.pos.z)<=c.hl,side=b.pos.z>0?1:-1,ok=inb&&side===-b.lastHitter;b.pos.y=c.r;
  if(!c.bounce){point(ok?b.lastHitter:-b.lastHitter,ok?'ラリー決着':inb?'自コート':'アウト');return}
  if(b.bounces>=1){point(b.lastHitter,'ツーバウンド');return}
  if(!ok){point(-b.lastHitter,inb?'自コート':'アウト');return}
  const sp0=Math.hypot(v.x,v.z)||1,tp=(b.spin.x*v.z-b.spin.z*v.x)/sp0,m=clamp(.78+tp*.0007,.55,1);v.y=-v.y*c.e*(1-clamp(sp0*.003,0,.2));v.x*=m;v.z*=m;if(mode==='tennis'&&Math.abs(b.spin.y)>.1){v.y-=Math.sign(b.spin.y)*Math.min(1.8,Math.abs(b.spin.y)*.07);v.x*=1+Math.min(.025,Math.abs(b.spin.y)*.001)}b.spin.multiplyScalar(mode==='tennis'?.72:.55);b.bounces++;spawn(b.pos,12,2.5);courtBounceSound(mode,Math.abs(v.y)/12)}}
function moveControlledCharacter(p,input,dt,side){const c=cfg,mx=clamp(input.x||0,-1,1),mz=clamp(input.z||0,-1,1)*(side===1?1:-1),d=Math.max(1,Math.hypot(mx,mz)),speed=c.pSpeed*(input.dash?1.5:1),k=1-Math.exp(-8*dt);p.vx=(p.vx||0)+(mx/d*speed-(p.vx||0))*k;p.vz=(p.vz||0)+(mz/d*speed-(p.vz||0))*k;p.x=clamp(p.x+p.vx*dt,-c.hw-2.5,c.hw+2.5);const minZ=side===1?(state==='serveWait'&&mode==='tennis'&&server===1?c.hl+.15:.8):-c.hl-3.5,maxZ=side===1?c.hl+3.5:(state==='serveWait'&&mode==='tennis'&&server===-1?-c.hl-.15:-.8);p.z=clamp(p.z+p.vz*dt,minZ,maxZ)}
function moveCpuToward(p,tx,tz,dt,c,speedFactor,deadZone,smoothing){const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz),k=1-Math.exp(-smoothing*dt),speed=d>deadZone?c.cSpeed*speedFactor:0;p.vx=(p.vx||0)+((d>deadZone?dx/d*speed:0)-(p.vx||0))*k;p.vz=(p.vz||0)+((d>deadZone?dz/d*speed:0)-(p.vz||0))*k;p.x+=p.vx*dt;p.z+=p.vz*dt}
function update(dt){if(matchIntro||replayPlaying)return;const c=cfg;hitCd-=dt;const i=inp();
 if(state!=='point'){if(P.diveT>0){P.vx=0;P.vz=0}else{moveControlledCharacter(P,i,dt,1)}}
 let tx=Number.isFinite(C.homeX)?C.homeX:0,tz=Number.isFinite(C.homeZ)?C.homeZ:(mode==='badminton'?-c.hl*.25:-c.hl*.55);
 if(state==='rally'&&ball.lastHitter===1){const b=ball;if(c.bounce&&b.bounces>0){tx=b.pos.x+b.vel.x*.3;tz=b.pos.z+b.vel.z*.3}else{aiT-=dt;if(aiT<=0||!aiL){aiL=simLand(b.pos,b.vel,c,b.spin);aiT=mode==='badminton'?.055:.11}tx=aiL.x;tz=aiL.z;
  // バドミントンCPUは着地点だけでなく、到達時間も考慮して取りに行く位置を補正する
  if(mode==='badminton'&&Number.isFinite(aiL.t)&&aiL.t>.08){const maxMoveT=Math.min(aiL.t*.72,Math.hypot(aiL.x-C.x,aiL.z-C.z)/Math.max(1,c.cSpeed*SPD[practice?3:OPT.diff])*.9);if(maxMoveT>0){const lead=clamp(maxMoveT/aiL.t,0,1);tx=b.pos.x+(aiL.x-b.pos.x)*lead;tz=b.pos.z+(aiL.z-b.pos.z)*lead}}
 }}
 tz=clamp(tz,-c.hl-3.5,-.8);tx=clamp(tx,-c.hw-2.5,c.hw+2.5);
 if(state!=='point'){if(C.diveT>0){C.vx=0;C.vz=0}else if(netRole==='host'&&netConn&&netConn.open){moveControlledCharacter(C,remoteInput,dt,-1)}else{moveCpuToward(C,tx,tz,dt,c,SPD[practice?3:OPT.diff],.15,7)}}
 if(selectedFormat==='doubles'&&state!=='point'){[[P2,1,P],[C2,-1,C]].forEach(([p,side,human])=>{const homeX=side===1?-c.hw*.48:c.hw*.48,homeZ=side*c.hl*.32;let tx2=homeX,tz2=homeZ;if(state==='rally'&&ball.lastHitter!==side){const land=simLand(ball.pos,ball.vel,c,ball.spin);const interceptT=clamp(land.t*.72,.08,.9),ix=ball.pos.x+ball.vel.x*interceptT,iz=ball.pos.z+ball.vel.z*interceptT;const npcDist=Math.hypot(ix-p.x,iz-p.z),humanDist=Math.hypot(ix-human.x,iz-human.z);if(npcDist+0.35<humanDist){tx2=ix;tz2=iz}else{const away=Math.sign(human.x-homeX)||1;tx2=clamp(homeX-away*.8,-c.hw*.85,c.hw*.85);tz2=side===1?c.hl*.22:-c.hl*.22}}tx2=clamp(tx2,-c.hw+0.35,c.hw-0.35);tz2=clamp(tz2,side===1?.8:-c.hl-3.5,side===1?c.hl+3.5:-.8);moveCpuToward(p,tx2,tz2,dt,c,SPD[OPT.diff],.1,5.5);p.x=clamp(p.x,-c.hw+0.35,c.hw-0.35);p.z=clamp(p.z,side===1?.8:-c.hl-3.5,side===1?c.hl+3.5:-.8)})}
 if(state==='serveWait'){if(server===1){if(serveT>0){serveT+=dt;ball.pos.set(P.x+.5,1.1+2.1*Math.sin(Math.PI/2*clamp(serveT/.42,0,1))-Math.max(0,serveT-.55)*1.4,P.z);if(serveT>=.72)doServe(1)}else ball.pos.set(P.x+.5,1.1,P.z)}else{serveT+=dt;ball.pos.set(C.x+.5,1.1+2.1*Math.sin(Math.PI/2*clamp(serveT/.42,0,1))-Math.max(0,serveT-.55)*1.4,C.z);if(!(netRole==='host'&&netConn&&netConn.open)&&serveT>=.72)doServe(-1)}}
 if(state==='rally'){acc+=dt;while(acc>=DT&&state==='rally'){stepBall();acc-=DT}tryHit(P);tryHit(C);if(selectedFormat==='doubles'){tryHit(P2);tryHit(C2)}}
 if(state==='point'){msgT-=dt;if(!practice&&!replayAutoPending&&!replayPlaying&&!suppressPointScore&&msgT<=1.7&&!pointScoreShown){pointScoreShown=true;$('msg').textContent='';showPointScore(pointWinner)}if(msgT<=.4&&$('pointScore')&&!$('pointScore').hidden)$('pointScore').classList.add('fadeOut');if(msgT<=0){if(over){finish()}else beginServe()}}
 [P,C,...(selectedFormat==='doubles'?[P2,C2]:[])].forEach(p=>{p.swingT=Math.max(0,p.swingT-dt);p.swingReqT=Math.max(0,p.swingReqT-dt);p.diveT=Math.max(0,p.diveT-dt);p.jumpT=Math.max(0,(p.jumpT||0)-dt);p.g.position.set(p.x,0,p.z);{const b0=p===P?0:Math.PI,wr=a=>Math.atan2(Math.sin(a),Math.cos(a)),tt=state==='rally'?Math.atan2(-(ball.pos.x-p.x),-(ball.pos.z-p.z)):b0,tg2=b0+clamp(wr(tt-b0),-1.1,1.1);p.g.rotation.y+=wr(tg2-p.g.rotation.y)*(1-Math.exp(-10*dt))}const sp=Math.hypot(p.x-(p.px===undefined?p.x:p.px),p.z-(p.pz===undefined?p.z:p.pz))/Math.max(dt,.001),lg=p.g.userData.legs,w=Math.min(1,sp/4);p.px=p.x;p.pz=p.z;p.ph=(p.ph||0)+sp*dt*1.6;lg[0].rotation.x=Math.sin(p.ph)*.9*w;lg[1].rotation.x=-Math.sin(p.ph)*.9*w;const a=p.g.userData.arm,elbow=p.g.userData.elbow,torso=p.g.userData.torso,leftArm=p.g.userData.leftArm,leftElbow=p.g.userData.leftElbow,racket=p.g.userData.rk,head=p.g.userData.head;const u=clamp(1-p.swingT/.3,0,1),ez=p.swingT>0?Math.sin(u*Math.PI):0;
  const smooth=(x)=>{x=clamp(x,0,1);return x*x*(3-2*x)};
  const backswing=1-smooth(u/.34),drive=smooth((u-.22)/.38),follow=smooth((u-.58)/.42);
  // 両競技とも待機時から肘を曲げた構えを維持し、打撃時だけ自然に伸ばす
  const idlePhase=tm*2.8+(p.who===1?0:1.1),idlePose=state==='rally'&&p.swingT<=0&&p.diveT<=0&&sp<1.2;let armX=-.38+(idlePose?Math.sin(idlePhase)*.07:0),armZ=-.05+(idlePose?Math.cos(idlePhase)*.035:0),racketX=-.20+(idlePose?Math.sin(idlePhase)*.09:0),racketZ=idlePose?Math.cos(idlePhase)*.045:0,twist=idlePose?Math.sin(idlePhase)*.035:0,lean=idlePose?Math.cos(idlePhase)*.018:0,elbowBend=-.58-(idlePose?Math.max(0,Math.sin(idlePhase))*.10:0);
  if(mode==='badminton'){
   // バドミントン：肘をたたんだ構えから、打点へ加速して振り抜く
   const low=clamp((1.5-ball.pos.y)/1.25,0,1),overhead=1-low;
   armX=-.38-.92*backswing-(.72+.48*overhead)*drive+.35*follow;
   armZ=-.05-.18*backswing-.16*drive+.08*follow;
   racketX=-.20-.38*backswing-(.58+.20*overhead)*drive+.52*follow;
   racketZ=-.02-.10*backswing-.13*drive+.10*follow;
   twist=-.12*backswing+.30*drive-.12*follow;
   lean=.025*backswing+.10*drive-.055*follow;
   elbowBend=-.68*backswing-.28*drive-.62*follow;
  }else{
   // テニス：肘を曲げたレディポジションからテイクバック、打撃、フォロースルーへ
   armX=-.38-.92*backswing-.82*drive+.62*follow;
   armZ=-.05+.12*backswing-.18*drive-.16*follow;
   racketX=-.20-.48*backswing-.50*drive+.72*follow;
   racketZ=0+.05*backswing-.16*drive-.16*follow;
   twist=-.22*backswing+.38*drive-.18*follow;
   lean=.015*backswing+.085*drive-.04*follow;
   elbowBend=-.62*backswing-.24*drive-.68*follow;
   if(state==='serveWait'&&serveT>0&&((p===P&&server===1)||(p===C&&server===-1))){
    const st=clamp(serveT/.72,0,1);
    if(st<.38){const q=st/.38;armX=-.6-1.15*q;armZ=.12*q;racketX=-.25-.65*q}
    else if(st<.58){const q=(st-.38)/.20;armX=-1.75+.45*q;armZ=.12-.2*q;racketX=-.9+.25*q}
    else{const q=clamp((st-.58)/.14,0,1);armX=-1.3-1.0*q;armZ=-.08-.35*q;racketX=-.65-1.0*q}
   }
  }
  // Natural gait: blend a subtle arm swing and torso counter-rotation with existing movement.
  const movePhase=p.ph||0,moveBlend=clamp(sp/3.8,0,1);
  const gait=Math.sin(movePhase),counterGait=Math.cos(movePhase);
  armX+=gait*.16*moveBlend;
  armZ+=counterGait*.045*moveBlend;
  twist+=gait*.075*moveBlend;
  lean+=clamp((p.vz||0)*-.025,-.07,.07)*moveBlend;
  const blend=1-Math.exp(-16*dt);
  a.rotation.x+=(armX-a.rotation.x)*blend;a.rotation.z+=(armZ-a.rotation.z)*blend;
  if(elbow)elbow.rotation.x+=(elbowBend-elbow.rotation.x)*(1-Math.exp(-19*dt));
  if(elbow){const elbowSide=mode==='tennis'?.48:.42,elbowTarget=-elbowSide+(-a.rotation.z*.22);elbow.rotation.z+=(elbowTarget-elbow.rotation.z)*(1-Math.exp(-16*dt));}
  racket.rotation.x+=(racketX-racket.rotation.x)*(1-Math.exp(-20*dt));
  racket.rotation.z+=(racketZ-racket.rotation.z)*(1-Math.exp(-18*dt));
  if(p.g.userData.syncMii)p.g.userData.syncMii();
  if(torso){const oldTwist=torso.userData.actionTwist||0,oldLean=torso.userData.actionLean||0;torso.userData.actionTwist=oldTwist+(twist-oldTwist)*(1-Math.exp(-11*dt));torso.userData.actionLean=oldLean+(lean-oldLean)*(1-Math.exp(-11*dt))}
  if(leftArm){const leftTarget=-.12-.32*drive+.20*follow;leftArm.rotation.x+=(leftTarget-leftArm.rotation.x)*(1-Math.exp(-12*dt));leftArm.rotation.z+=((.08+.18*drive)-leftArm.rotation.z)*(1-Math.exp(-12*dt))}
  if(leftElbow){const leftElbowTarget=-.32-.30*backswing-.18*drive-.26*follow;leftElbow.rotation.x+=(leftElbowTarget-leftElbow.rotation.x)*(1-Math.exp(-14*dt))}
  if(head)head.rotation.z+=((-twist*.22-head.rotation.z)*(1-Math.exp(-10*dt)));
  p.g.rotation.z+=(clamp(-(p.vx||0)*(p===P?1:-1)*.03,-.22,.22)-p.g.rotation.z)*(1-Math.exp(-8*dt))})}
function cam(){if(isSpectatingTournament&&spectatorView==='stands'){camera.position.lerp(new THREE.Vector3(0,Math.max(9,cfg.hl*.9),cfg.hl+13),1-Math.exp(-5*fdt));lk.lerp(new THREE.Vector3(0,1,0),1-Math.exp(-5*fdt));camera.lookAt(lk);return}const p=netRole==='guest'?C:P;
 if(netRole==='guest'){
  // ゲスト視点がコートの奥を向きすぎて、自分のキャラクターが画面外になるのを防ぐ
  const back=mode==='tennis'?6.2:8.2;
  const px=Number.isFinite(p.x)?p.x:0,pz=Number.isFinite(p.z)?p.z:-(cfg.hl+1.5);
  const t=new THREE.Vector3(px*.7,mode==='badminton'?4.4:4.1,pz-(mode==='badminton'?6.8:back));
  camera.position.lerp(t,1-Math.exp(-9*fdt));
  lk.lerp(new THREE.Vector3(px*.35,1.0,pz+(mode==='badminton'?1.8:2.5)),1-Math.exp(-10*fdt));
 }
 else if(state==='point'){
  const t=new THREE.Vector3(0,Math.max(8,cfg.hl*.55),cfg.hl+9);
  camera.position.lerp(t,1-Math.exp(-5*fdt));
  lk.lerp(new THREE.Vector3(0,1,0),1-Math.exp(-5*fdt));
 }else{
  const t=new THREE.Vector3(p.x*.7,mode==='badminton'?4.5:4.3,p.z+(mode==='tennis'?6.2:7));
  camera.position.lerp(t,1-Math.exp(-7*fdt));
  const bp=state==='rally'||state==='serveWait'?ball.pos:p;
  lk.lerp(new THREE.Vector3(p.x*.4+(bp.x-p.x)*.2,mode==='badminton'?1.45+bp.y*.1:1.2+bp.y*.12,p.z-(mode==='badminton'?6:9)+(bp.z-p.z+(mode==='badminton'?6:9))*.1),1-Math.exp(-8*fdt));
 }
 camera.lookAt(lk)}
let last=performance.now(),fdt=.016;const lk=new THREE.Vector3(0,1,0);
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;tm+=dt;fdt=dt;
 try{
 if(matchIntro){updateMatchIntro(dt);updateMatchIntroCamera()}else if(replayPlaying){updateReplay(dt)}else if(paused){cam()}else if(state==='menu'||!$('modeMenu').hidden){camera.position.set(Math.sin(tm*.25)*16,7,Math.cos(tm*.25)*16);camera.lookAt(0,1,0)}else if(isSpectatingTournament){cam()}else if(netRole==='guest'){guestFrame(dt);cam()}else{update(dt);cam()}
 if(netRole==='guest'&&state==='rally'){const renderBall=ball.pos.clone().addScaledVector(ball.vel,clamp((Date.now()-netSnapshotSentAt)/1000,.025,.075));ballG.position.lerp(renderBall,1-Math.exp(-35*dt))}else if(netRole==='guest'&&state==='serveWait')ballG.position.lerp(ball.pos,1-Math.exp(-35*dt));else if(state==='rally')ballG.position.lerpVectors(ball.prev,ball.pos,clamp(acc/DT,0,1));else{ballG.position.copy(ball.pos);ball.prev.copy(ball.pos)}if(serveCharging||shotCharging)updateServeMeter();if(shotAim&&shotAimExpires>performance.now()&&state==='rally')updateAimPreview(shotAim,pendingShotKind);else if(!aimGesture)hideAimPreview();if(state==='rally'){const speed=ball.vel.length(),kmh=speed*3.6,flaming=kmh>130;trail.material.color.set(flaming?0xff6a18:speed>24?0xa855f7:speed<7?0x38bdf8:0xffffff);trail.material.opacity=flaming?.95:speed>24?.85:speed<7?.72:.38;flameG.visible=flaming;if(flaming){const dir=ball.vel.clone().normalize();flameG.position.copy(dir).multiplyScalar(-.015);flameG.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().negate());const flicker=.88+Math.random()*.3;flameG.scale.set(1.35*flicker,1.9*flicker,1.35*flicker);fireballShells[0].scale.set(1.1*flicker,1.22*flicker,.98*flicker);fireballShells[1].scale.set(.95*flicker,1.02*flicker,.95*flicker);flameMats[0].opacity=.78+Math.random()*.2;flameMats[1].opacity=.78+Math.random()*.2;flameMats[2].opacity=.85+Math.random()*.15}}else flameG.visible=false;if(mode==='tennis'){const sl=ball.spin.length();if(sl>1)tb.rotateOnWorldAxis(ball.spin.clone().normalize(),sl*dt*.12)}
 for(let i=TN-1;i>0;i--){tpos[i*3]=tpos[i*3-3];tpos[i*3+1]=tpos[i*3-2];tpos[i*3+2]=tpos[i*3-1]}tpos[0]=ball.pos.x;tpos[1]=ball.pos.y;tpos[2]=ball.pos.z;tg.attributes.position.needsUpdate=true;trail.visible=state==='rally';upP(dt);if(mode==='badminton'&&ball.vel.lengthSq()>.01)sh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),ball.vel.clone().normalize());
 P.g.visible=C.g.visible=state!=='menu';P2.g.visible=C2.g.visible=state!=='menu'&&selectedFormat==='doubles';if(state!=='menu'){if(!Number.isFinite(P.x)||!Number.isFinite(P.z)){P.x=0;P.z=cfg.hl+1.5}if(!Number.isFinite(C.x)||!Number.isFinite(C.z)){C.x=0;C.z=-(cfg.hl+1.5)}[P,C,P2,C2].forEach(p=>{p.g.position.set(p.x,0,p.z);p.g.rotation.x=0;if(p.diveT>0){const u=clamp(1-p.diveT/1.2,0,1),smooth=x=>x*x*(3-2*x),fly=smooth(clamp(u/.17,0,1)),fall=smooth(clamp((u-.17)/.11,0,1)),rise=smooth(clamp((u-.45)/.55,0,1));p.g.position.x+=p.diveX*fly;p.g.position.z+=p.diveZ*fly;p.g.position.y=0;p.g.rotation.x=0;p.g.rotation.z=(p.diveX<0?1:-1)*(u<.28?.85:u<.45?.2*(1-fall):.2*(1-rise))}else if(mode==='badminton'&&p.jumpT>0){const ju=1-p.jumpT/.48;p.g.position.y=Math.sin(clamp(ju,0,1)*Math.PI)*.72;p.g.rotation.x=-.18*Math.sin(ju*Math.PI)}})}ballG.visible=state!=='menu';shadow.visible=ballG.visible;shadow.position.set(ball.pos.x,.03,ball.pos.z);shadow.material.opacity=clamp(.4-ball.pos.y*.06,.08,.4);
 if(!replayPlaying)captureReplayFrame();if(replayAutoPending&&!replayPlaying&&tm>=replayAutoAt){if(!startReplay(true))replayAutoPending=false}if(netRole==='host'&&netConn&&netConn.open&&now-netLastSnapshot>33){sendSnapshot();netLastSnapshot=now}renderer.render(scene,camera);
 }catch(err){console.error('ゲーム描画エラー:',err);if(!$('renderError')){const e=document.createElement('div');e.id='renderError';e.style.cssText='position:fixed;z-index:20;left:12px;right:12px;top:12px;background:#fff;color:#900;padding:12px;border-radius:8px;font:14px system-ui';e.textContent='描画エラー: '+(err&&err.message?err.message:String(err));document.body.appendChild(e)}}}
function disconnectRoom(){
 if(roomTimeout){clearTimeout(roomTimeout);roomTimeout=null}
 try{if(netConn){netConn.close();netConn=null}if(netPeer){netPeer.destroy();netPeer=null}}catch(e){}
 roomListeners.forEach(x=>{try{x.ref.off(x.event,x.fn)}catch(e){}});roomListeners=[];
 const oldRef=activeRoomRef,oldRole=netRole,uid=fbAuth&&fbAuth.currentUser?fbAuth.currentUser.uid:null;
 if(oldRef){if(oldRole==='host'){oldRef.remove().catch(()=>{})}else if(oldRole==='guest'&&uid){oldRef.child('guestId').transaction(v=>v===uid?null:v).catch(()=>{})}}
 activeRoomRef=null;roomDisconnectRef=null;roomBusy=false;netRole='offline';if($('chatFab'))$('chatFab').style.display='none';if($('chatPanel'))$('chatPanel').classList.remove('open');if($('chatTicker'))$('chatTicker').style.display='none';chatQueue=[];chatShowing=false;remoteInput={x:0,z:0,dash:false};lastHostNonce='';lastGuestNonce='';netGuestSnapshotSeen=false;
 if($('roomStatus'))$('roomStatus').textContent='';
}
// ページを閉じたとき、対戦部屋の後片付けをすぐ要求する。サーバー側の onDisconnect も保険として残す。
window.addEventListener('pagehide',()=>{
 const ref=activeRoomRef,role=netRole,uid=fbAuth&&fbAuth.currentUser?fbAuth.currentUser.uid:null;
 if(!ref)return;
 try{
  if(role==='host')ref.remove().catch(()=>{});
  else if(role==='guest'&&uid)ref.child('guestId').transaction(v=>v===uid?null:v).catch(()=>{});
 }catch(e){}
});
let roomTeams={host:'A',guest:'B'};
function paintTeams(){const a=roomTeams.host==='A'?'チームA':'チームB',b=roomTeams.guest==='A'?'チームA':'チームB';$('teamSummary').textContent='部屋主：'+a+' ／ フレンド：'+b+' ／ 空き枠は開始時にCPUが補充';if($('hostNpcLabel'))$('hostNpcLabel').textContent='PLAYER 3 · '+a+'（空き枠）';if($('guestNpcLabel'))$('guestNpcLabel').textContent='PLAYER 4 · '+b+'（空き枠）';document.querySelectorAll('.teamPick').forEach(btn=>btn.disabled=(netRole==='host'?roomTeams.host:roomTeams.guest)===btn.dataset.team);$('randomTeams').disabled=netRole!=='host'}
function saveTeams(){if(!activeRoomRef||netRole!=='host'&&netRole!=='guest')return;const key=netRole==='host'?'hostTeam':'guestTeam';activeRoomRef.child(key).set(roomTeams[netRole]).catch(()=>roomMessage('チーム設定を保存できませんでした。'));paintTeams()}

async function cancelTournamentNow(){if(!activeTournamentRef||!activeTournament||!fbAuth||!fbAuth.currentUser||fbAuth.currentUser.uid!==activeTournament.hostId){$('tournamentStatus').textContent='大会主催者のみ取り消しできます。';return}if(!confirm('この大会を取り消しますか？参加者も大会に参加できなくなります。'))return;const ref=activeTournamentRef;try{$('cancelTournament').disabled=true;await ref.remove();if(tournamentListener){try{ref.off('value',tournamentListener)}catch(e){}tournamentListener=null}activeTournamentRef=null;activeTournament=null;activeTournamentMatch=null;activeTournamentMatchRef=null;localStorage.removeItem('rsTournamentCode');showTournamentPanel('tournamentHome');$('tournamentStatus').textContent='大会を取り消しました。'}catch(e){$('tournamentStatus').textContent='大会を取り消せませんでした：'+(e&&e.message?e.message:String(e));console.error('大会取消エラー',e)}finally{if($('cancelTournament'))$('cancelTournament').disabled=false}}
function showTournamentPanel(panel){screenTransition();['tournamentHome','tournamentCreatePanel','tournamentJoinPanel','tournamentLobbyPanel','tournamentBracketPanel','tournamentMatchPanel'].forEach(id=>$(id).hidden=id!==panel)}
function safeTournamentName(v){return String(v||'プレイヤー').replace(/[<>&"]/g,'').slice(0,30)||'プレイヤー'}
function openTournamentMenu(){screenTransition();if(isSpectatingTournament)stopTournamentSpectating();$('menu').hidden=true;$('formatMenu').hidden=true;$('modeMenu').hidden=true;$('tournamentMenu').hidden=false;showTournamentPanel('tournamentHome');$('tournamentStatus').textContent='';if(activeTournament)renderTournament(activeTournament)}
function watchTournament(ref){if(tournamentListener&&activeTournamentRef){try{activeTournamentRef.off('value',tournamentListener)}catch(e){}}activeTournamentRef=ref;tournamentListener=snap=>{activeTournament=snap.val();renderTournament(activeTournament)};ref.on('value',tournamentListener)}
function renderTournament(t){if(!t)return;activeTournament=t;$('tournamentLobbyCode').textContent=t.code||'------';$('tournamentLobbyTitle').textContent=t.name||'フレンドトーナメント';const ps=Object.values(t.participants||{});$('tournamentLobbyInfo').textContent=(t.sport==='tennis'?'🎾 テニス':'🏸 バドミントン')+' ／ '+(t.format==='doubles'?'ダブルス':'シングルス')+' ／ '+ps.length+' / '+(t.size||4)+'人';$('tournamentParticipants').innerHTML=ps.map((p,i)=>'<div class="tournamentPlayer"><span>'+(i+1)+'. '+safeTournamentName(p.name)+'</span><span>'+(p.uid===t.hostId?'主催者':'参加中')+'</span></div>').join('');$('startTournament').hidden=!(fbAuth&&fbAuth.currentUser&&fbAuth.currentUser.uid===t.hostId&&t.status==='waiting');$('startTournament').disabled=ps.length<1;$('cancelTournament').hidden=!(fbAuth&&fbAuth.currentUser&&fbAuth.currentUser.uid===t.hostId);$('tournamentBracketTitle').textContent=t.name||'トーナメント表';$('tournamentBracketInfo').textContent=t.status==='complete'?'🏆 優勝：'+(t.winnerName||'未確定'):t.status==='active'?'大会進行中':'大会準備中';renderTournamentBracket(t);showTournamentPanel(t.status==='waiting'?'tournamentLobbyPanel':'tournamentBracketPanel')}
function renderTournamentBracket(t){const root=$('tournamentBracket');root.innerHTML='';Object.keys(t.rounds||{}).sort((a,b)=>Number(a.slice(1))-Number(b.slice(1))).forEach(rk=>{const round=t.rounds[rk],section=document.createElement('div');section.className='tournamentRound';const h=document.createElement('h4');h.textContent=round.title||rk;section.appendChild(h);Object.values(round.matches||{}).forEach(m=>{const b=document.createElement('button');b.className='tournamentMatchBtn';const a=document.createElement('span'),scoreEl=document.createElement('b'),other=document.createElement('span');a.className='tournamentMatchName';other.className='tournamentMatchName';scoreEl.className='tournamentMatchScore';a.textContent=m.a&&m.a.name||'未定';other.textContent=m.b&&m.b.name||'未定';scoreEl.textContent=m.scoreText||(m.status==='live'?'試合中':m.status==='complete'?'終了':'－');b.append(a,scoreEl,other);b.title=(m.status==='live'?'試合中':m.status==='complete'?'試合終了':'試合前');b.onclick=()=>openTournamentMatch(m.id);section.appendChild(b)});root.appendChild(section)})}
async function createTournamentNow(){const button=$('createTournament');button.disabled=true;try{$('tournamentStatus').textContent='大会を作成しています…';const user=await initFirebase(),size=Number($('tournamentSize').value),t={name:safeTournamentName($('tournamentName').value.trim()||'フレンド大会'),hostId:user.uid,hostName:safeTournamentName(pname),createdAt:Date.now(),status:'waiting',sport:$('tournamentSport').value,format:$('tournamentFormat').value,size,participants:{[user.uid]:{uid:user.uid,name:safeTournamentName(pname),joinedAt:Date.now()}},rounds:{}};let created=null;for(let attempt=0;attempt<5;attempt++){const code=String(Math.floor(100000+Math.random()*900000)),ref=fbDb.ref('badminton_rooms/tournament_'+code);t.code=code;const result=await ref.transaction(v=>v===null?t:undefined);if(result.committed){created={code,ref};break}}if(!created)throw new Error('大会コードを確保できませんでした。もう一度お試しください。');localStorage.setItem('rsTournamentCode',created.code);watchTournament(created.ref);showTournamentPanel('tournamentLobbyPanel');$('tournamentStatus').textContent=''}catch(e){const code=e&&e.code?String(e.code):'';const detail=e&&e.message?e.message:String(e||'不明なエラー');$('tournamentStatus').textContent='大会を作成できませんでした：'+(code==='PERMISSION_DENIED'||/permission_denied|PERMISSION_DENIED/i.test(detail)?'Firebase Realtime Databaseのルールで racket_tournaments への読み書きが許可されていません。データベースのルール設定を確認してください。':'')+(code==='PERMISSION_DENIED'||/permission_denied|PERMISSION_DENIED/i.test(detail)?'':' '+detail);console.error('大会作成エラー',e)}finally{button.disabled=false}}
async function joinTournamentNow(){try{const code=$('tournamentJoinCode').value.replace(/[^0-9]/g,'').slice(0,6);if(code.length!==6){$('tournamentStatus').textContent='6桁の大会コードを入力してください。';return}const user=await initFirebase(),ref=fbDb.ref('badminton_rooms/tournament_'+code),snap=await ref.once('value');if(!snap.exists())throw new Error('大会が見つかりません。コードを確認してください。');const t=snap.val();if(t.status!=='waiting')throw new Error('この大会はすでに開始されています。');if(Object.keys(t.participants||{}).length>=Number(t.size||4)&&!t.participants[user.uid])throw new Error('この大会は満員です。');await ref.child('participants/'+user.uid).transaction(v=>v||{uid:user.uid,name:safeTournamentName(pname),joinedAt:Date.now()});localStorage.setItem('rsTournamentCode',code);watchTournament(ref);showTournamentPanel('tournamentLobbyPanel')}catch(e){$('tournamentStatus').textContent='大会に参加できませんでした：'+(e.message||e)}}
function makeTournamentRounds(players){const rounds={};let list=[];for(let i=0;i<players.length;i+=2)list.push({id:'r1m'+(i/2+1),round:1,index:i/2,a:players[i],b:players[i+1],status:'waiting'});rounds.r1={title:'1回戦',matches:Object.fromEntries(list.map(m=>[m.id,m]))};let n=list.length,r=2;while(n>1){n=Math.ceil(n/2);const ms={};for(let i=0;i<n;i++){const id='r'+r+'m'+(i+1);ms[id]={id,round:r,index:i,a:null,b:null,status:'waiting'}}rounds['r'+r]={title:n===1?'決勝':n===2?'準決勝':'第'+r+'ラウンド',matches:ms};r++}return rounds}
async function startTournamentNow(){if(!activeTournamentRef||!activeTournament||!fbAuth.currentUser||fbAuth.currentUser.uid!==activeTournament.hostId)return;const ps=Object.values(activeTournament.participants||{});if(!ps.length){alert('参加者がいません。');return}const size=Number(activeTournament.size||4);if(ps.length>size){alert('参加人数が設定人数を超えています。');return}const players=ps.slice();while(players.length<size){const n=players.length-ps.length+1;players.push({uid:'cpu_tournament_'+Date.now()+'_'+n,name:'CPU '+n,isCpu:true,joinedAt:Date.now()})}const rounds=makeTournamentRounds(players);await activeTournamentRef.update({status:'active',startedAt:Date.now(),rounds});await resolveCpuOnlyTournamentMatches(rounds)}
function findTournamentMatch(id){let found=null;Object.values(activeTournament&&activeTournament.rounds||{}).forEach(r=>Object.values(r.matches||{}).forEach(m=>{if(m.id===id)found=m}));return found}
function openTournamentMatch(id){if(!activeTournament)return;const m=findTournamentMatch(id);if(!m)return;activeTournamentMatchId=id;activeTournamentMatch=m;$('tournamentMatchTitle').textContent='試合情報 · '+m.round+'回戦';$('tournamentMatchInfo').innerHTML='<b>'+(m.a&&safeTournamentName(m.a.name)||'対戦相手未定')+' vs '+(m.b&&safeTournamentName(m.b.name)||'対戦相手未定')+'</b><br>状態：'+(m.status==='live'?'試合中':m.status==='complete'?'試合終了':'試合前')+(m.winnerName?'<br>勝者：'+safeTournamentName(m.winnerName):'')+(m.roomCode?'<br>部屋コード：'+m.roomCode:'');const uid=fbAuth&&fbAuth.currentUser&&fbAuth.currentUser.uid,participant=!!(m.a&&m.a.uid===uid||m.b&&m.b.uid===uid);$('tournamentPlayMatch').hidden=!participant||m.status==='complete';$('tournamentPlayMatch').textContent=m.status==='live'?'試合に参加':'試合を開始';$('tournamentPlayMatch').disabled=m.status==='live'&&!m.roomCode;$('tournamentWatchMatch').hidden=m.status!=='live'||!m.roomCode;showTournamentPanel('tournamentMatchPanel')}
async function playTournamentMatch(){const m=activeTournamentMatch;if(!m||!activeTournamentRef)return;const uid=fbAuth&&fbAuth.currentUser&&fbAuth.currentUser.uid;if(!m.a||m.a.uid!==uid&&(!m.b||m.b.uid!==uid)){alert('この試合の参加者ではありません。');return}activeTournamentMatchRef=activeTournamentRef.child('rounds/r'+m.round+'/matches/'+m.id);selectedSport=activeTournament.sport;selectedFormat=activeTournament.format;navigationIntent='friend';const opponent=m.a.uid===uid?m.b:m.a;if(opponent&&opponent.isCpu){if(m.status==='complete'){return}disconnectRoom();netRole='offline';OPT.mode=0;save();$('tournamentMenu').hidden=true;$('menu').hidden=true;$('modeMenu').hidden=true;start(selectedSport);return}if(m.status==='live'&&m.roomCode){if(m.a.uid===uid){if(netRole==='host'&&activeRoomRef){$('tournamentMenu').hidden=true;return}alert('この試合は開始した端末から続けてください。主催者の端末で試合が開いている場合は、その画面に戻ってください。');return} $('tournamentMenu').hidden=true;$('menu').hidden=true;$('modeMenu').hidden=false;$('modeChoices').hidden=true;$('friendPanel').hidden=false;$('roomCode').value=m.roomCode;await joinRoom();return}if(m.status==='waiting'&&m.a.uid===uid){$('tournamentMenu').hidden=true;$('menu').hidden=true;$('modeMenu').hidden=false;$('modeChoices').hidden=true;$('friendPanel').hidden=true;$('roomCode').value='';createRoom();return}alert('先に対戦相手が試合を開始するまでお待ちください。')}
function applySpectatorSnapshot(a){if(!a||!a.P||!a.C||!a.ball)return;applyMatchSnapshot(a);$('spectatorScore').textContent=$('msg').textContent||''}
function watchTournamentMatch(){const m=activeTournamentMatch;if(!m||!m.roomCode||!activeTournamentRef)return;selectedFormat=activeTournament.format||'singles';const ref=activeTournamentRef.child('live/'+m.id),statusRef=activeTournamentRef.child('rounds/r'+m.round+'/matches/'+m.id);if(spectatorListener){try{spectatorListener.ref.off('value',spectatorListener.fn);if(spectatorListener.statusRef)spectatorListener.statusRef.off('value',spectatorListener.statusFn)}catch(e){}}const fn=snap=>{const v=snap.val();if(v)applySpectatorSnapshot(v)},statusFn=snap=>{const v=snap.val();if(v&&v.status==='complete')$('spectatorScore').textContent='試合終了 · '+(v.winnerName||'勝者')};ref.on('value',fn);statusRef.on('value',statusFn);spectatorListener={ref,fn,statusRef,statusFn};isSpectatingTournament=true;spectatorView='player';$('tournamentMenu').hidden=true;$('spectatorBar').hidden=false;$('spectatorTitle').textContent=(activeTournament.name||'大会')+' · 観戦';$('hud').hidden=false;$('touch').hidden=true;$('mb').hidden=true;$('res').hidden=true;buildCourt(activeTournament.sport);state='rally';camera.position.set(0,5,cfg.hl+9);camera.lookAt(0,1,0)}
function stopTournamentSpectating(){if(spectatorListener){try{spectatorListener.ref.off('value',spectatorListener.fn);if(spectatorListener.statusRef)spectatorListener.statusRef.off('value',spectatorListener.statusFn)}catch(e){}spectatorListener=null}isSpectatingTournament=false;$('spectatorBar').hidden=true;$('hud').hidden=true;$('touch').hidden=true;$('mb').hidden=true;$('tournamentMenu').hidden=false;showTournamentPanel('tournamentBracketPanel');if(activeTournament)renderTournament(activeTournament)}
async function completeTournamentMatch(result,scoreText){if(!activeTournamentMatchRef||!activeTournamentRef||!activeTournamentMatch||!fbAuth.currentUser)return;if(netRole!=='host'&&netRole!=='offline')return;const m=activeTournamentMatch,uid=fbAuth.currentUser.uid,winnerUid=result===1?uid:(m.a&&m.a.uid===uid?m.b&&m.b.uid:m.a&&m.a.uid),winner=m.a&&m.a.uid===winnerUid?m.a:m.b;if(!winnerUid||!winner)return;await advanceTournamentWinner(m,winner,scoreText||'');if(result===1){setTimeout(()=>{if($('res')&&!$('res').hidden)showChampionCeremony()},1600)}}
async function advanceTournamentWinner(m,winner,scoreText){if(!activeTournamentRef||!m||!winner)return;const matchRef=activeTournamentRef.child('rounds/r'+m.round+'/matches/'+m.id);await matchRef.update({status:'complete',winnerUid:winner.uid,winnerName:winner.name,scoreText:scoreText||'',finishedAt:Date.now()});const t=(await activeTournamentRef.once('value')).val(),maxRound=Object.keys(t.rounds||{}).length;if(m.round>=maxRound){await activeTournamentRef.update({status:'complete',winnerUid:winner.uid,winnerName:winner.name,finishedAt:Date.now()});return}const next='r'+(m.round+1)+'m'+(Math.floor(m.index/2)+1),slot=m.index%2===0?'a':'b',nextRef=activeTournamentRef.child('rounds/r'+(m.round+1)+'/matches/'+next+'/'+slot);await nextRef.set({uid:winner.uid,name:winner.name,isCpu:!!winner.isCpu});const updated=(await activeTournamentRef.child('rounds/r'+(m.round+1)+'/matches/'+next).once('value')).val();if(updated&&updated.a&&updated.b&&updated.a.isCpu&&updated.b.isCpu&&updated.status!=='complete'){const cpuWinner=Math.random()<.5?updated.a:updated.b;await advanceTournamentWinner(updated,cpuWinner,'CPU対戦')}}
async function resolveCpuOnlyTournamentMatches(rounds){for(const round of Object.values(rounds||{})){for(const m of Object.values(round.matches||{})){if(m.a&&m.b&&m.a.isCpu&&m.b.isCpu&&m.status!=='complete'){const winner=Math.random()<.5?m.a:m.b;await advanceTournamentWinner(m,winner,'CPU対戦')}}}}

function roomMessage(t){if($('roomStatus'))$('roomStatus').textContent=t;if($('waitingStatus'))$('waitingStatus').textContent=t}
function showWaitingRoom(code){$('roomSportSelect').value=selectedSport;$('roomSportSelect').disabled=netRole!=='host';$('roomSportNote').textContent=netRole==='host'?'競技を変更するとフレンド側にも反映されます':'競技は部屋主が設定します';$('friendPanel').hidden=true;$('modeChoices').hidden=true;$('modeBack').hidden=true;$('waitingPanel').hidden=false;$('doublesNpcSettings').hidden=selectedFormat!=='doubles';$('teamControls').hidden=selectedFormat!=='doubles';$('hostNpcSlot').hidden=selectedFormat!=='doubles';$('guestNpcSlot').hidden=selectedFormat!=='doubles';$('npcStrength').value=String(OPT.diff);$('npcStrength').disabled=netRole==='guest';$('waitingCode').textContent=code||'------';$('waitingCodeMini').textContent=code||'------';$('hostPlayerStatus').textContent=netRole==='host'?'あなた（接続済み）':'部屋主に接続中…';$('hostPlayerStatus').className=netRole==='host'?'onlineStatus':'';$('guestPlayerStatus').textContent=netRole==='guest'?'あなた（接続中…）':'参加待ち…';$('guestPlayerStatus').className=netRole==='guest'?'':'offlineStatus';paintTeams();$('startMatch').hidden=true}
function setWaitingPlayerStatus(host,guest){$('hostPlayerStatus').textContent=host;$('hostPlayerStatus').className=host.includes('接続済み')||host.includes('あなた')?'onlineStatus':'';$('guestPlayerStatus').textContent=guest;$('guestPlayerStatus').className=guest.includes('接続済み')||guest.includes('あなた')?'onlineStatus':'offlineStatus'}
function showMainHome(){screenTransition();navigationIntent='play';screenMode='home';$('menu').hidden=false;$('homeActions').hidden=false;$('playPanel').hidden=true;$('formatMenu').hidden=true;$('modeMenu').hidden=true;$('tournamentMenu').hidden=true;$('waitingPanel').hidden=true;$('friendPanel').hidden=true;$('modeChoices').hidden=false}
function showPlayPanel(intent='play'){screenTransition();navigationIntent=intent;screenMode='sport';$('menu').hidden=false;$('homeActions').hidden=true;$('playPanel').hidden=false;$('formatMenu').hidden=true;$('modeMenu').hidden=true;$('tournamentMenu').hidden=true;$('waitingPanel').hidden=true}
function showSportMenu(){showPlayPanel(navigationIntent)}
function showFormatMenu(sport){screenTransition();selectedSport=sport;screenMode='format';$('menu').hidden=true;$('modeMenu').hidden=true;$('formatMenu').hidden=false;$('formatTitle').textContent=(sport==='tennis'?'🎾 テニス':'🏸 バドミントン')+'｜試合形式';}
function showModeMenu(sport){screenTransition();selectedSport=sport;screenMode='mode';$('waitingPanel').hidden=true;$('formatMenu').hidden=true;$('menu').hidden=true;$('modeMenu').hidden=false;$('modeTitle').textContent=(sport==='tennis'?'🎾 テニス':'🏸 バドミントン')+'｜'+(selectedFormat==='singles'?'シングルス':'ダブルス')+'｜'+(navigationIntent==='friend'?'フレンド対戦':'モード選択');$('modeChoices').hidden=false;$('friendPanel').hidden=true;$('modeBack').hidden=false;$('roomStatus').textContent='';$('roomCode').value='';$('cpuMode').hidden=navigationIntent==='friend';$('practiceMode').hidden=navigationIntent==='friend';$('friendMode').hidden=navigationIntent!=='friend'}
async function createRoom(){
 if(roomBusy||netRole==='host'||netRole==='guest')return;
 disconnectRoom();roomBusy=true;netRole='host';
 const code=String(Math.floor(100000+Math.random()*900000));
 $('roomCode').value=code;showWaitingRoom(code);if(activeTournamentMatchRef)activeTournamentMatchRef.update({status:'live',roomCode:code,roomHostUid:(fbAuth&&fbAuth.currentUser?fbAuth.currentUser.uid:null),liveStartedAt:Date.now()}).catch(()=>{});setWaitingPlayerStatus('Firebaseに接続中…','参加待ち…');
 roomMessage('Firebaseに接続して部屋を作成しています…');
 try{
  const user=await initFirebase();
  if(netRole!=='host')return;
  const ref=fbDb.ref('badminton_rooms/'+code);
  const result=await ref.transaction(current=>current===null?{hostId:user.uid,hostName:pname,createdAt:Date.now(),status:'waiting',sport:selectedSport,format:selectedFormat,npcDiff:OPT.diff,hostTeam:'A',guestTeam:'B'}:undefined);
  if(!result.committed){roomBusy=false;netRole='offline';roomMessage('部屋番号が重複しました。もう一度「部屋を作る」を押してください。');return}
  activeRoomRef=ref;listenRoom(ref.child('sport'),'value',snap=>{const v=snap.val();if(v==='tennis'||v==='badminton'){selectedSport=v;$('roomSportSelect').value=v}});friendNames={host:pname,guest:'フレンド'};roomTeams={host:'A',guest:'B'};paintTeams();listenRoom(ref.child('guestName'),'value',snap=>{const n=String(snap.val()||'フレンド').trim().slice(0,12)||'フレンド';friendNames.guest=n;if(state!=='menu')updScore()});netConn=makeFirebaseConnection();setupRoomChat(ref);listenRoom(ref.child('hostTeam'),'value',snap=>{const v=snap.val();if(v==='A'||v==='B'){roomTeams.host=v;paintTeams()}});listenRoom(ref.child('guestTeam'),'value',snap=>{const v=snap.val();if(v==='A'||v==='B'){roomTeams.guest=v;paintTeams()}});
  try{await ref.onDisconnect().remove()}catch(e){}
  roomBusy=false;setWaitingPlayerStatus('あなた（部屋主・接続済み）','参加待ち…');
  roomMessage('部屋を作成しました。6桁の番号を友達に共有してください。相手の参加を待っています。');
  const guestRef=ref.child('guestId');
  listenRoom(guestRef,'value',snap=>{
   if(netRole!=='host')return;
   if(snap.val()){
    if(roomTimeout){clearTimeout(roomTimeout);roomTimeout=null}
    setWaitingPlayerStatus('あなた（部屋主・接続済み）','対戦相手（接続済み）');
    roomMessage(selectedFormat==='doubles'?'フレンドが接続しました！ダブルスは4人編成で、足りない2人はNPCが補います。強さはメニューの「つよさ」で調整できます。準備ができたら開始してください。':'フレンドが接続しました！準備ができたら「対戦を開始する」を押してください。');
    $('startMatch').hidden=false;
   }else{
    $('startMatch').hidden=selectedFormat!=='doubles';
    setWaitingPlayerStatus('あなた（部屋主・接続済み）','参加待ち…');
   }
  });
  listenRoom(ref.child('guestMessage'),'value',snap=>{const v=snap.val();if(v&&v.nonce&&v.nonce!==lastGuestNonce){lastGuestNonce=v.nonce;handleNetData(v.data)}});listenRoom(ref.child('guestSwing'),'value',snap=>{const v=snap.val();if(v&&v.nonce&&v.nonce!==lastGuestSwingNonce){lastGuestSwingNonce=v.nonce;handleNetData(v.data)}});
  roomTimeout=setTimeout(()=>{if(netRole==='host'&&activeRoomRef)roomMessage('参加待ちが続いています。相手に6桁の番号を確認してもらってください。')},120000);
 }catch(e){roomBusy=false;netRole='offline';roomMessage('Firebaseに接続できません：'+(e&&e.message?e.message:'設定を確認してください'))}
}
async function joinRoom(){
 if(roomBusy||netRole==='host'||netRole==='guest')return;
 const code=$('roomCode').value.replace(/[^0-9]/g,'').slice(0,6);
 if(code.length!==6){roomMessage('6桁の部屋番号を入力してください。');return}
 disconnectRoom();roomBusy=true;netRole='guest';showWaitingRoom(code);
 setWaitingPlayerStatus('部屋主を検索中…','あなた（接続中…）');roomMessage('Firebaseで部屋を検索しています…');
 let failTimer=null;
 try{
  // 認証・接続確認と部屋の読み込みを並行して開始し、待ち時間を短縮
  const firebaseReady=initFirebase();
  const ref=fbDb.ref('badminton_rooms/'+code);
  const [user,roomSnap]=await Promise.all([
   firebaseReady,
   withTimeout(ref.once('value'),12000,'部屋の検索')
  ]);
  if(netRole!=='guest')return;
  if(!roomSnap.exists()||!roomSnap.child('hostId').exists()){roomBusy=false;netRole='offline';roomMessage('部屋が見つかりません。番号を確認し、部屋主が待機中か確認してください。');setWaitingPlayerStatus('部屋が見つかりません','参加できません');return}
  selectedSport=roomSnap.child('sport').val()||selectedSport;selectedFormat=roomSnap.child('format').val()||'singles';friendNames={host:String(roomSnap.child('hostName').val()||'部屋主').trim().slice(0,12)||'部屋主',guest:pname};const roomDiff=roomSnap.child('npcDiff').val();if(Number.isInteger(roomDiff)&&roomDiff>=0&&roomDiff<=2){OPT.diff=roomDiff;save();paint()}$('doublesNpcSettings').hidden=selectedFormat!=='doubles';$('npcStrength').value=String(OPT.diff);$('npcStrength').disabled=true;
  const joined=await withTimeout(ref.child('guestId').transaction(v=>v===null?user.uid:undefined),12000,'部屋への参加登録');
  if(netRole!=='guest')return;
  if(joined.committed){await ref.child('guestName').set(pname);}
  if(!joined.committed){roomBusy=false;netRole='offline';roomMessage('この部屋にはすでに参加者がいます。別の部屋を作成してください。');return}
  activeRoomRef=ref;listenRoom(ref.child('sport'),'value',snap=>{const v=snap.val();if(v==='tennis'||v==='badminton'){selectedSport=v;$('roomSportSelect').value=v;$('doublesNpcSettings').hidden=selectedFormat!=='doubles'}});roomTeams={host:roomSnap.child('hostTeam').val()==='B'?'B':'A',guest:roomSnap.child('guestTeam').val()==='A'?'A':'B'};paintTeams();netConn=makeFirebaseConnection();listenRoom(ref.child('hostTeam'),'value',snap=>{const v=snap.val();if(v==='A'||v==='B'){roomTeams.host=v;paintTeams()}});listenRoom(ref.child('guestTeam'),'value',snap=>{const v=snap.val();if(v==='A'||v==='B'){roomTeams.guest=v;paintTeams()}});
  try{await ref.child('guestId').onDisconnect().remove()}catch(e){}
  roomBusy=false;setWaitingPlayerStatus('部屋主（接続済み）','あなた（参加済み）');
  roomMessage('部屋主に接続しました！部屋主が対戦を開始するまでお待ちください。');
  listenRoom(ref.child('npcDiff'),'value',snap=>{const v=snap.val();if(Number.isInteger(v)&&v>=0&&v<=2){OPT.diff=v;$('npcStrength').value=String(v);save();paint()}});listenRoom(ref.child('hostMessage'),'value',snap=>{const v=snap.val();if(v&&v.nonce&&v.nonce!==lastHostNonce){lastHostNonce=v.nonce;handleNetData(v.data)}});
  failTimer=setTimeout(()=>{if(netRole==='guest'&&activeRoomRef)roomMessage('接続待ちが長くなっています。部屋主が待機中か確認してください。')},120000);
 }catch(e){
  roomBusy=false;
  if(netRole==='guest')netRole='offline';
  const detail=e&&e.message?e.message:'設定を確認してください';
  roomMessage('部屋に参加できませんでした：'+detail+'。通信状況とFirebaseのデータベースルールを確認してください。');
  setWaitingPlayerStatus('接続できませんでした','もう一度お試しください');
 }
}
function applyMatchSnapshot(a){if(!a||!a.P||!a.C||!a.ball)return;if(Number.isFinite(a.sentAt)){if(a.sentAt<netSnapshotSentAt)return;netSnapshotSentAt=a.sentAt}state=a.state;server=a.server;mode=a.mode;cfg=CFG[mode]||CFG.tennis;if(netRole==='guest'&&netGuestSnapshotSeen){P.x+=(a.P.x-P.x)*.52;P.z+=(a.P.z-P.z)*.52;if(server!==-1){C.x+=(a.C.x-C.x)*.42;C.z+=(a.C.z-C.z)*.42}}else{P.x=a.P.x;P.z=a.P.z;if(netRole!=='guest'||server!==-1){C.x=a.C.x;C.z=a.C.z}if(netRole==='guest')netGuestSnapshotSeen=true}if(a.P2){P2.x=a.P2.x;P2.z=a.P2.z;P2.swingT=a.P2.swingT||0}if(a.C2){C2.x=a.C2.x;C2.z=a.C2.z;C2.swingT=a.C2.swingT||0}P.swingT=a.P.swingT;C.swingT=a.C.swingT;P.diveT=a.P.diveT||0;P.diveX=a.P.diveX||0;P.diveZ=a.P.diveZ||0;C.diveT=a.C.diveT||0;C.diveX=a.C.diveX||0;C.diveZ=a.C.diveZ||0;if(netRole==='guest'){ball.pos.set(a.ball.p[0],a.ball.p[1],a.ball.p[2]);ball.prev.copy(ball.pos);ball.vel.set(a.ball.v[0],a.ball.v[1],a.ball.v[2])}else{ball.pos.set(a.ball.p[0],a.ball.p[1],a.ball.p[2]);ball.prev.copy(ball.pos);ball.vel.set(a.ball.v[0],a.ball.v[1],a.ball.v[2])}ball.spin.set(a.ball.s[0],a.ball.s[1],a.ball.s[2]);ball.net=a.ball.net;ball.lastHitter=a.ball.lastHitter;ball.bounces=a.ball.bounces;P.g.visible=C.g.visible=ballG.visible=true;if(a.scoreHtml)$('score').innerHTML=a.scoreHtml;$('msg').textContent=state==='serveWait'?servePrompt():(a.msg||'');$('spd').textContent=a.spd||'';if(isSpectatingTournament){$('spectatorScore').textContent=$('msg').textContent;return}if(netRole==='guest'){if(a.replayPlaying){if(!replayBadge){replayBadge=document.createElement('div');replayBadge.id='replayBadge';replayBadge.textContent='REPLAY';document.body.appendChild(replayBadge)}}else if(replayBadge&&!replayPlaying){replayBadge.remove();replayBadge=null}}if(a.finished){$('hud').hidden=true;$('touch').hidden=true;$('mb').hidden=true;$('res').hidden=false;$('rt').textContent=a.rt||'試合終了';$('rt').className=a.rtClass||'';$('rs').textContent=a.rs||''}else{$('res').hidden=true;$('hud').hidden=false;$('touch').hidden=!COARSE;$('mb').hidden=false}}
function handleNetData(d){
 if(!d||typeof d!=='object')return;
 if(d.type==='start'&&netRole==='guest'){if(d.format)selectedFormat=d.format;if(Number.isInteger(d.diff)&&d.diff>=0&&d.diff<=2){OPT.diff=d.diff;save()}OPT.mode=0;start(selectedSport);return}
 if(d.type==='restart'&&netRole==='host'){start(selectedSport);return}
 if(d.type==='input'&&netRole==='host'){remoteInput={x:clamp(+d.input.x||0,-1,1),z:clamp(+d.input.z||0,-1,1),dash:!!d.input.dash,power:Math.max(.25,Math.min(1,+d.input.power||.65)),serveAim:d.input.serveAim!==undefined?d.input.serveAim:remoteInput.serveAim,aim:d.input.aim!==undefined?d.input.aim:remoteInput.aim,kind:d.input.kind||remoteInput.kind||'normal',drop:d.input.drop!==undefined?!!d.input.drop:!!remoteInput.drop};if(d.input.swing){if(state==='serveWait'&&server===-1)doServe(-1);else if(state==='rally'){C.swingT=Math.max(C.swingT,.3);C.swingReqT=Math.max(C.swingReqT,1.2);tryHit(C)}}}
 if(d.type==='snapshot'&&netRole==='guest'){applyMatchSnapshot(d.data)}
}
function sendSnapshot(){try{const data={sentAt:Date.now(),state,server,mode,replayPlaying,P:{x:P.x,z:P.z,swingT:P.swingT,diveT:P.diveT,diveX:P.diveX,diveZ:P.diveZ},C:{x:C.x,z:C.z,swingT:C.swingT,diveT:C.diveT,diveX:C.diveX,diveZ:C.diveZ},P2:{x:P2.x,z:P2.z,swingT:P2.swingT},C2:{x:C2.x,z:C2.z,swingT:C2.swingT},ball:{p:ball.pos.toArray(),v:ball.vel.toArray(),s:ball.spin.toArray(),net:ball.net,lastHitter:ball.lastHitter,bounces:ball.bounces},scoreHtml:$('score').innerHTML,msg:$('msg').textContent,spd:$('spd').textContent,finished:!$('res').hidden,rt:$('rt').textContent,rtClass:$('rt').className,rs:$('rs').textContent};if(netConn&&netConn.open)netConn.send({type:'snapshot',data});if(activeTournamentMatchRef&&activeTournament&&activeTournamentMatchId&&netRole==='host'&&state!=='menu'&&Date.now()-lastTournamentStateAt>=125){lastTournamentStateAt=Date.now();activeTournamentRef.child('live/'+activeTournamentMatchId).set(data).catch(()=>{})}}catch(e){}}
function guestFrame(dt){if(!netConn||!netConn.open)return;const input={...inp(),swing:false},c=cfg;input.x=-input.x;if(state!=='point'&&C.diveT<=0){moveControlledCharacter(C,input,dt,-1)}const signature=[input.x.toFixed(2),input.z.toFixed(2),input.dash?1:0].join(','),now=performance.now();if((signature!==netLastInputSignature&&now-netLastInputSentAt>=30)||now-netLastInputSentAt>=150){netInputTimer=0;netConn.send({type:'input',input});netLastInputSignature=signature;netLastInputSentAt=now}}
function currentFov(){const saved=localStorage.getItem('rsFov_'+(mode||'tennis'));return clamp(saved===null?(mode==='badminton'?50:48):Number(saved),40,100)}
function rs(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.fov=currentFov();camera.updateProjectionMatrix()}
addEventListener('resize',rs);
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.code==='Escape'&&state!=='menu'){e.preventDefault();togglePause();return}if(paused)return;keys[e.code]=true;if(e.code==='Space'){e.preventDefault();if(e.repeat)return;if(state==='serveWait'&&isLocalServer()){if(mode==='tennis')startServeCharge();else{const i=inp();serveAim={x:i.x,y:i.z};swing()}return}swing()}});
addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='Space'&&serveCharging)releaseServeCharge();else if(e.code==='Space'&&shotCharging)releaseShotCharge()});
function swing(){if(netRole==='guest'){if(netConn&&netConn.open)netConn.send({type:'input',input:{...inp(),swing:true,power:pendingShotPower,serveAim,aim:shotAim&&shotAimExpires>performance.now()?shotAim:null,kind:pendingShotKind,drop:pendingShotKind==='drop'}});return}if(state==='serveWait'&&server===1&&serveT<=0){serveT=.001}else if(state==='rally'){/* 連打しても打撃要求を受け付け、シャトルが届いた瞬間に打てるようにする */P.swingT=Math.max(P.swingT,.3);P.swingReqT=Math.max(P.swingReqT,1.2);tryHit(P)}}
 function isLocalServer(){return netRole==='guest'?server===-1:server===1}
 function syncTouchActions(){const serving=state==='serveWait'&&isLocalServer(),inMatch=state==='serveWait'||state==='rally';$('bs').hidden=!inMatch;$('bp').hidden=!inMatch||serving;$('bd').hidden=!inMatch||serving;$('bs').textContent=serving?'サーブ':'スイング';if(!serving){serveCharging=false;if(!shotCharging)$('serveMeter').hidden=true}}
 function currentServePower(){const cycle=.8,elapsed=Math.max(0,(performance.now()-serveChargeStart)/1000),phase=(elapsed%cycle)/cycle,level=phase<.4?phase/.4:phase<.55?1:(1-phase)/.45;return .25+.75*Math.max(0,Math.min(1,level))}
 function startServeCharge(){if(paused||state!=='serveWait'||!isLocalServer()||(netRole!=='guest'&&serveT>0)||serveCharging)return false;chargeKind='serve';serveCharging=true;serveChargeStart=performance.now();$('serveMeter').hidden=false;$('serveMeterFill').style.height='8%';updateServeMeter();return true}
 function startShotCharge(){if(paused||state!=='rally'||mode!=='badminton'||shotCharging)return false;chargeKind='shot';shotCharging=true;serveChargeStart=performance.now();$('serveMeter').hidden=false;$('serveMeterFill').style.height='8%';updateServeMeter();return true}
  function releaseShotCharge(){if(!shotCharging)return;shotPower=currentServePower();pendingShotPower=shotPower;shotCharging=false;$('serveMeter').hidden=true;swing()}
  function releaseServeCharge(){if(!serveCharging)return;servePower=currentServePower();if(netRole==='guest')pendingShotPower=servePower;serveCharging=false;$('serveMeter').hidden=true;swing()}
 function updateServeMeter(){if(chargeKind==='serve'&&serveCharging){servePower=currentServePower();$('serveMeterFill').style.height=(8+(servePower-.25)/.75*92)+'%'}else if(chargeKind==='shot'&&shotCharging){shotPower=currentServePower();$('serveMeterFill').style.height=(8+(shotPower-.25)/.75*92)+'%'}}
const joy=$('joy'),kn=$('knob');let jid=null;
function jm(e){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const m=Math.hypot(dx,dy),R0=50;if(m>R0){dx*=R0/m;dy*=R0/m}kn.style.transform='translate('+dx+'px,'+dy+'px)';const k=Math.hypot(dx,dy)/R0,level=k<.12?0:(k-.12)/.88;tc.x=m<.001||k<.12?0:dx/m*level;tc.z=m<.001||k<.12?0:dy/m*level}
joy.addEventListener('pointerdown',e=>{jid=e.pointerId;joy.setPointerCapture(jid);jm(e)});
joy.addEventListener('pointermove',e=>{if(e.pointerId===jid)jm(e)});
const je=e=>{if(e.pointerId===jid){jid=null;tc.x=tc.z=0;kn.style.transform=''}};joy.addEventListener('pointerup',je);joy.addEventListener('pointercancel',je);
function beginShotGesture(button,e,kind){
 if(paused||button.hidden)return false;
 if(e.cancelable)e.preventDefault();
 shotAim=null;shotAimExpires=0;hideAimPreview();pendingShotKind=kind;
 aimGesture={id:e.pointerId,button,kind,timer:null};
 try{button.setPointerCapture(e.pointerId)}catch(_e){}return true
}
function moveShotGesture(e){
 const g=aimGesture;if(!g||e.pointerId!==g.id)return;
 // 従来操作ではスワイプによる着地点指定を行わない
}
function finishShotGesture(e,cancelled=false){
 const g=aimGesture;if(!g||e.pointerId!==g.id)return;
 aimGesture=null;hideAimPreview();shotAim=null;shotAimExpires=0;
 if(cancelled){tc.dash=false;tc.drop=false;if(g.kind==='power'&&shotCharging)releaseShotCharge();return}
 pendingShotKind=g.kind;
 if(g.kind==='power'&&shotCharging){releaseShotCharge()}
 else swing();
 tc.dash=false;tc.drop=false
}
const bp=$('bp'),bd=$('bd'),bs=$('bs');
bd.addEventListener('pointerdown',e=>{e.preventDefault();if(beginShotGesture(bd,e,'drop'))tc.drop=true});
bp.addEventListener('pointerdown',e=>{e.preventDefault();if(!beginShotGesture(bp,e,'power'))return;tc.dash=true;if(mode==='badminton'&&state==='rally')startShotCharge()});
bs.addEventListener('pointerdown',e=>{
 e.preventDefault();
 if(paused||bs.hidden)return;
 if(state==='serveWait'&&isLocalServer()){servePointerId=e.pointerId;bs.setPointerCapture(e.pointerId);if(mode==='tennis')startServeCharge();else{servePointerStart={x:e.clientX,y:e.clientY};serveAim={x:0,y:0};$('serveMeter').hidden=true}return}
 beginShotGesture(bs,e,'swing')
});
[bd,bp,bs].forEach(button=>{
 button.addEventListener('pointermove',e=>{if(button===bs&&servePointerId===e.pointerId&&mode==='badminton'&&servePointerStart){serveAim={x:clamp((e.clientX-servePointerStart.x)/100,-1,1),y:clamp((servePointerStart.y-e.clientY)/85,-1,1)};return}moveShotGesture(e)});
 button.addEventListener('pointerup',e=>{if(button===bs&&servePointerId===e.pointerId){servePointerId=null;if(mode==='tennis')releaseServeCharge();else{servePointerStart=null;swing()}return}finishShotGesture(e,false)});
 button.addEventListener('pointercancel',e=>{if(button===bs&&servePointerId===e.pointerId){servePointerId=null;if(mode==='tennis')releaseServeCharge();else{servePointerStart=null;serveAim=null}return}finishShotGesture(e,true)});
 button.addEventListener('lostpointercapture',e=>{if(button===bs&&servePointerId===e.pointerId){servePointerId=null;if(mode==='tennis')releaseServeCharge();else{servePointerStart=null;serveAim=null}return}finishShotGesture(e,true)})
});
let servePointerId=null,servePointerStart=null,serveAim=null,shotPointerId=null;$('mb').onclick=()=>togglePause(true);$('resumeMatch').onclick=()=>togglePause(false);$('quitMatch').onclick=toMenu;
function goFS(){try{const el=document.documentElement;(el.requestFullscreen?el.requestFullscreen():Promise.resolve()).then(()=>screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape')).catch(()=>{})}catch(e){}}
// 起動直後にも横向き固定を要求（対応ブラウザ／ホーム画面アプリ向け）
function requestLandscapeOnOpen(){try{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{})}catch(e){}}
requestLandscapeOnOpen();addEventListener('pageshow',requestLandscapeOnOpen);
document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{showFormatMenu(b.dataset.m);if(COARSE)goFS()});$('fs').onclick=goFS;$('achievementNav').onclick=openAchievements;$('achievementClose').onclick=closeAchievements;$('championClose').onclick=()=>{$('championCeremony').hidden=true};$('playNav').onclick=()=>showPlayPanel('play');$('friendNav').onclick=()=>showPlayPanel('friend');$('playBack').onclick=showMainHome;$('tournamentNav').onclick=openTournamentMenu;$('tournamentClose').onclick=showMainHome;
$('singlesMode').onclick=()=>{selectedFormat='singles';showModeMenu(selectedSport)};$('doublesMode').onclick=()=>{selectedFormat='doubles';showModeMenu(selectedSport)};$('formatBack').onclick=showSportMenu;$('modeBack').onclick=()=>showFormatMenu(selectedSport);
$('cpuMode').onclick=()=>{disconnectRoom();netRole='offline';OPT.mode=0;save();start(selectedSport)};
$('practiceMode').onclick=()=>{disconnectRoom();netRole='offline';OPT.mode=1;save();start(selectedSport)};
$('friendMode').onclick=()=>{screenMode='friend';$('modeTitle').textContent=(selectedSport==='tennis'?'🎾 テニス':'🏸 バドミントン')+'｜フレンドとプレイ';$('modeChoices').hidden=true;$('friendPanel').hidden=false;$('modeBack').hidden=true;$('roomStatus').textContent='部屋を作るか、友達の6桁の部屋番号を入力してください。'};
$('roomSportSelect').onchange=()=>{const v=$('roomSportSelect').value;if(v!=='tennis'&&v!=='badminton')return;if(netRole!=='host'||!activeRoomRef){$('roomSportSelect').value=selectedSport;return}selectedSport=v;activeRoomRef.child('sport').set(v).then(()=>{roomMessage('競技を「'+(v==='tennis'?'テニス':'バドミントン')+'」に変更しました。')}).catch(()=>{roomMessage('競技を変更できませんでした。');$('roomSportSelect').value=selectedSport})};$('waitingBack').onclick=()=>{disconnectRoom();$('waitingPanel').hidden=true;$('friendPanel').hidden=false;$('modeChoices').hidden=true;$('modeBack').hidden=true;$('startMatch').hidden=true;screenMode='friend'};$('copyRoomCode').onclick=async()=>{try{await navigator.clipboard.writeText($('waitingCode').textContent);roomMessage('部屋コードをコピーしました。友達に共有してください。')}catch(e){roomMessage('部屋コードを長押ししてコピーしてください。')}};$('friendBack').onclick=()=>{screenMode='mode';$('waitingPanel').hidden=true;$('friendPanel').hidden=true;$('modeChoices').hidden=false;$('modeBack').hidden=false;$('roomStatus').textContent='';$('modeTitle').textContent=(selectedSport==='tennis'?'🎾 テニス':'🏸 バドミントン')+'｜モード選択'};
document.querySelectorAll('.teamPick').forEach(btn=>btn.addEventListener('click',()=>{if(selectedFormat!=='doubles'||!activeRoomRef||(netRole!=='host'&&netRole!=='guest'))return;roomTeams[netRole]=btn.dataset.team;saveTeams();roomMessage('自分をチーム'+btn.dataset.team+'に移動しました。')}));$('randomTeams').onclick=()=>{if(netRole!=='host'||!activeRoomRef)return;roomTeams={host:Math.random()<.5?'A':'B',guest:Math.random()<.5?'A':'B'};activeRoomRef.update({hostTeam:roomTeams.host,guestTeam:roomTeams.guest}).then(()=>{paintTeams();roomMessage('チームをランダムに振り分けました。')}).catch(()=>roomMessage('ランダム振り分けに失敗しました。'))};$('npcStrength').onchange=()=>{const v=Number($('npcStrength').value);if(Number.isInteger(v)&&v>=0&&v<=2){OPT.diff=v;save();paint();if(netRole==='host'&&activeRoomRef)activeRoomRef.child('npcDiff').set(v).catch(()=>{});roomMessage('NPCの強さを「'+$('npcStrength').selectedOptions[0].textContent+'」に設定しました。')}};$('createRoom').onclick=createRoom;$('joinRoom').onclick=joinRoom;$('startMatch').onclick=async()=>{if(netRole!=='host'||!activeRoomRef){roomMessage('部屋主のみ開始できます。');return}if(roomBusy){roomMessage('接続処理が完了するまでお待ちください。');return}try{const guestSnap=await activeRoomRef.child('guestId').once('value');if(netRole!=='host'||!activeRoomRef)return;if(!guestSnap.val()){roomMessage('フレンドがまだ参加していません。相手が部屋に参加してから開始してください。');$('startMatch').hidden=true;return}if(!netConn||!netConn.open){roomMessage('フレンドとの接続を確認しています。もう一度お試しください。');return}netConn.send({type:'start',format:selectedFormat,diff:OPT.diff});$('startMatch').hidden=true;OPT.mode=0;start(selectedSport)}catch(e){roomMessage('フレンドの接続確認に失敗しました。通信状態を確認してください。')}};
$('tournamentCreateNav').onclick=()=>{showTournamentPanel('tournamentCreatePanel');$('tournamentStatus').textContent=''};$('tournamentJoinNav').onclick=()=>{showTournamentPanel('tournamentJoinPanel');$('tournamentStatus').textContent=''};$('tournamentResumeNav').onclick=async()=>{if(activeTournament){renderTournament(activeTournament);return}const code=localStorage.getItem('rsTournamentCode');if(!code){$('tournamentStatus').textContent='参加中の大会はありません。大会コードから参加してください。';return}try{const user=await initFirebase(),ref=fbDb.ref('badminton_rooms/tournament_'+code),snap=await ref.once('value');if(!snap.exists())throw new Error('保存済みの大会が見つかりません。');if(!snap.child('participants/'+user.uid).exists())throw new Error('この端末の参加者情報が見つかりません。大会コードで参加してください。');watchTournament(ref)}catch(e){$('tournamentStatus').textContent=e.message||'大会を開けませんでした。'}};$('tournamentCreateBack').onclick=()=>showTournamentPanel('tournamentHome');$('tournamentJoinBack').onclick=()=>showTournamentPanel('tournamentHome');$('tournamentLobbyBack').onclick=()=>showTournamentPanel('tournamentHome');$('tournamentBracketBack').onclick=()=>showTournamentPanel('tournamentHome');$('tournamentMatchBack').onclick=()=>activeTournament?renderTournament(activeTournament):showTournamentPanel('tournamentHome');$('createTournament').onclick=createTournamentNow;$('cancelTournament').onclick=cancelTournamentNow;$('joinTournament').onclick=joinTournamentNow;$('startTournament').onclick=()=>startTournamentNow().catch(e=>alert(e.message));$('tournamentPlayMatch').onclick=()=>playTournamentMatch().catch(e=>alert(e.message));$('tournamentWatchMatch').onclick=watchTournamentMatch;$('spectatorPlayerView').onclick=()=>{spectatorView='player';cam()};$('spectatorStandView').onclick=()=>{spectatorView='stands';cam()};$('spectatorBack').onclick=stopTournamentSpectating;$('copyTournamentCode').onclick=async()=>{try{await navigator.clipboard.writeText($('tournamentLobbyCode').textContent);$('tournamentStatus').textContent='大会コードをコピーしました。'}catch(e){$('tournamentStatus').textContent='大会コードを長押ししてコピーしてください。'}};$('q').onchange=()=>renderer.setPixelRatio(Math.min(devicePixelRatio,+$('q').value,COARSE?1.8:2.4));$('fov').oninput=()=>{const value=Number($('fov').value);localStorage.setItem('rsFov_'+(mode||'tennis'),String(value));$('fovValue').textContent=value+'°';rs()};$('fov').value=currentFov();$('fovValue').textContent=$('fov').value+'°';
initMenu();$('ra').onclick=()=>{if(netRole==='guest'){if(netConn&&netConn.open)netConn.send({type:'restart'});$('res').hidden=true;roomMessage('ホストが再戦を開始するまでお待ちください。')}else start(mode)};$('rm').onclick=()=>{$('res').hidden=true;toMenu()};addEventListener('pointerdown',()=>{if(COARSE)goFS();if(!bgmT&&state==='menu'&&!$('menu').hidden&&$('res').hidden&&!needsNickname){try{audio()}catch(e){}beep(1,.01);bgm(true)}},{once:true});
if(COARSE){$('help').hidden=true;$('q').value='1.5'}
// モバイルブラウザのダブルタップ／ピンチズームを抑止（操作ボタンは通常どおり利用）
['gesturestart','gesturechange','gestureend'].forEach(t=>document.addEventListener(t,e=>e.preventDefault(),{passive:false}));
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
let lastTouchEnd=0;document.addEventListener('touchend',e=>{const now=Date.now();if(now-lastTouchEnd<=300)e.preventDefault();lastTouchEnd=now},{passive:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,+$('q').value,COARSE?1.8:2.4));rs();buildCourt('tennis');camera.position.set(0,7,16);requestAnimationFrame(loop);
})();


// ブラウザが報告できるサイト保存容量を確認。HTTPキャッシュそのものの容量ではありません。
(()=>{
 const notice=document.getElementById('cacheNotice');
 const later=document.getElementById('cacheLaterBtn');
 const refresh=document.getElementById('cacheRefreshBtn');
 if(!notice||!later||!refresh||!navigator.storage||typeof navigator.storage.estimate!=='function')return;
 const threshold=10*1024*1024;
 let shown=false;
 async function checkSiteStorage(){
  if(shown||sessionStorage.getItem('rsStorageNoticeDismissed')==='1')return;
  try{
   const estimate=await navigator.storage.estimate();
   if(typeof estimate.usage==='number'&&estimate.usage>=threshold){
    shown=true;
    const mb=(estimate.usage/1024/1024).toFixed(1);
    document.getElementById('cacheNoticeText').textContent='ブラウザが計測したこのサイトの保存容量は約'+mb+'MBです。保存データは削除せず、最新版を読み込み直せます。※通常のブラウザキャッシュ容量とは異なります。';
    notice.hidden=false;
   }
  }catch(e){}
 }
 later.addEventListener('click',()=>{notice.hidden=true;sessionStorage.setItem('rsStorageNoticeDismissed','1')});
 refresh.addEventListener('click',()=>{
  refresh.disabled=true;refresh.textContent='読み込み中…';
  const url=new URL(location.href);url.searchParams.set('_refresh',Date.now().toString());location.replace(url.toString());
 });
 checkSiteStorage();
 setInterval(checkSiteStorage,60000);
 if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
