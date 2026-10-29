/* Extracted reusable character, equipment and motion rig from the uploaded v4 HTML. */
(()=>{'use strict';
const THREE=window.THREE;
if(!THREE){console.error('SportsRig requires Three.js loaded first.');return;}
const M=(c,r=.6,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const tex=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t};
const mesh=(g,m,x,y,z,p)=>{const o=new THREE.Mesh(g,m);o.position.set(x||0,y||0,z||0);o.castShadow=true;if(p)p.add(o);return o};
const V=(x,y)=>new THREE.Vector3(x,y,0);
function bar(a,b,r,m,p){const d=new THREE.Vector3().subVectors(b,a),o=mesh(new THREE.CylinderGeometry(r,r,d.length(),8),m);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(V(0,1),d.normalize());p.add(o)}

/* ---------- 道具（グリップ中心が原点、+Yがラケット先端、面の法線は±Z、単位はm） ---------- */
const gripTex=c=>tex(64,256,(x,w,h)=>{x.fillStyle='#'+c.toString(16).padStart(6,'0');x.fillRect(0,0,w,h);x.strokeStyle='rgba(0,0,0,.3)';x.lineWidth=4;for(let i=-8;i<=16;i++){x.beginPath();x.moveTo(0,i*16);x.lineTo(w,i*16+40);x.stroke()}});
function racket(o){const g=new THREE.Group(),f=new THREE.MeshPhysicalMaterial({color:o.c,roughness:.3,metalness:.25,clearcoat:1,clearcoatRoughness:.15}),gr=new THREE.MeshStandardMaterial({roughness:.9,map:gripTex(o.g)}),y0=o.hb+o.hh/2,a=(o.hw-o.fr*2)/2,b=(o.hh-o.fr*2)/2;
 mesh(new THREE.CylinderGeometry(.017,.017,o.gl,16),gr,0,0,0,g);
 mesh(new THREE.CylinderGeometry(.02,.02,.012,16),M(0x111111),0,-o.gl/2,0,g);
 bar(V(0,o.gl/2),V(0,o.ty),o.sr,f,g);
 const pts=[];for(let i=0;i<48;i++){const t=i/48*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(t)*a,y0+Math.sin(t)*b,0))}
 mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),96,o.fr,8,true),f,0,0,0,g);
 for(const s of[-1,1])bar(V(0,o.ty),V(s*o.tr*a,y0-Math.sqrt(1-o.tr*o.tr)*b),o.sr*.9,f,g);
 const st=tex(512,512,(c,w,h)=>{c.save();c.beginPath();c.ellipse(w/2,h/2,w/2,h/2,0,0,7);c.clip();c.strokeStyle=o.sc;c.lineWidth=o.sw;for(let i=0;i<=o.n;i++){const p=i/o.n*w;c.beginPath();c.moveTo(p,0);c.lineTo(p,h);c.stroke();c.beginPath();c.moveTo(0,p);c.lineTo(w,p);c.stroke()}c.restore()});
 const pm=new THREE.Mesh(new THREE.PlaneGeometry(a*2,b*2),new THREE.MeshBasicMaterial({map:st,transparent:true,side:2,depthWrite:false}));pm.position.y=y0;g.add(pm);return g}
const badRacket=()=>racket({c:0xd8232a,g:0xf2f2f2,gl:.2,sr:.004,fr:.0045,hb:.285,hh:.29,hw:.23,ty:.22,tr:.25,sc:'rgba(240,240,240,.85)',sw:3,n:22});
const tennisRacket=()=>racket({c:0x1f5fbf,g:0x1a1a1a,gl:.19,sr:.008,fr:.01,hb:.26,hh:.33,hw:.27,ty:.16,tr:.75,sc:'rgba(235,235,225,.9)',sw:5,n:16});
const rubber=c=>new THREE.MeshStandardMaterial({roughness:.85,map:tex(128,128,(x,w,h)=>{x.fillStyle=c;x.fillRect(0,0,w,h);x.fillStyle='rgba(0,0,0,.22)';for(let i=0;i<w;i+=8)for(let j=0;j<h;j+=8){x.beginPath();x.arc(i+4,j+4,2,0,7);x.fill()}})});
function paddle(){const g=new THREE.Group(),w=M(0xc9955a,.7),Y=.118;
 mesh(new THREE.BoxGeometry(.03,.1,.022),w,0,0,0,g);
 mesh(new THREE.CylinderGeometry(.078,.078,.008,40),w,0,Y,0,g).rotation.x=Math.PI/2;
 mesh(new THREE.CylinderGeometry(.077,.077,.003,40),rubber('#d01f26'),0,Y,.0055,g).rotation.x=Math.PI/2;
 mesh(new THREE.CylinderGeometry(.077,.077,.003,40),rubber('#151515'),0,Y,-.0055,g).rotation.x=Math.PI/2;return g}
const ball=(r,m)=>mesh(new THREE.SphereGeometry(r,48,32),m);
function volleyball(){const t=tex(512,256,(c,w,h)=>{const C=['#1d5fc0','#f5c518','#f4f4f0'];for(let i=0;i<12;i++){c.fillStyle=C[i%3];c.fillRect(i*w/12,0,w/12+1,h)}c.strokeStyle='#222';c.lineWidth=2;for(let i=0;i<12;i++){c.beginPath();c.moveTo(i*w/12,0);c.lineTo(i*w/12,h);c.stroke()}});return ball(.105,new THREE.MeshStandardMaterial({map:t,roughness:.55}))}
function tennisBall(){const t=tex(512,256,(c,w,h)=>{c.fillStyle='#d4e34a';c.fillRect(0,0,w,h);c.strokeStyle='#f4f4ea';c.lineWidth=10;for(const ph of[0,Math.PI]){c.beginPath();for(let x=0;x<=w;x+=4){const y=h/2+Math.sin(x/w*Math.PI*2+ph)*h*.26;x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}});return ball(.0335,new THREE.MeshStandardMaterial({map:t,roughness:.95,bumpMap:tex(256,128,(c,w,h)=>{c.fillStyle='#888';c.fillRect(0,0,w,h);for(let i=0;i<7000;i++){c.fillStyle=Math.random()<.5?'#444':'#ccc';c.fillRect(Math.random()*w,Math.random()*h,2,2)}}),bumpScale:.8}))}
const ttBall=()=>ball(.02,M(0xfff4e4,.35));
function shuttle(){const W=new THREE.Group(),g=new THREE.Group();W.add(g);g.position.y=-.035;
 mesh(new THREE.SphereGeometry(.0125,24,16,0,Math.PI*2,0,Math.PI/2),M(0xe3c795,.7),0,0,0,g).rotation.x=Math.PI;
 const ft=tex(256,64,(c,w,h)=>{c.fillStyle='#f7f7f2';c.fillRect(0,0,w,h);c.strokeStyle='#b8b8aa';c.lineWidth=2;for(let i=0;i<16;i++){c.beginPath();c.moveTo(i*w/16,0);c.lineTo(i*w/16,h);c.stroke()}c.fillStyle='#d9c9a0';c.fillRect(0,h*.3,w,3)});
 mesh(new THREE.CylinderGeometry(.033,.012,.066,16,1,true),new THREE.MeshStandardMaterial({map:ft,roughness:.8,side:2}),0,.033,0,g);
 mesh(new THREE.TorusGeometry(.033,.0012,6,24),M(0xf0e2b0),0,.066,0,g).rotation.x=Math.PI/2;return W}

/* ---------- キャラ（丸みのあるデフォルメ体型・指まである全関節・Tポーズ） ---------- */
function cap(r0,r1,len,m){const p=[],n=10;for(let i=0;i<=n;i++){const a=i/n*Math.PI/2;p.push(new THREE.Vector2(r1*Math.sin(a),-len-r1*Math.cos(a)))}for(let i=0;i<=n;i++){const a=Math.PI/2-i/n*Math.PI/2;p.push(new THREE.Vector2(r0*Math.sin(a),r0*Math.cos(a)))}return new THREE.Mesh(new THREE.LatheGeometry(p,32),m)}
function makeChar(){const P=(c,r)=>new THREE.MeshPhysicalMaterial({color:c,roughness:r||.5,clearcoat:.25,clearcoatRoughness:.4}),
 skin=P(0xf3c6a0,.55),shirt=P(0x2f7bff),wh=P(0xf7f7f7),sh=P(0x20304f),hair=P(0x3a2a22,.6),dk=P(0x15171c,.3),pink=P(0xf59a9a,.7),red=P(0xd8232a),blue=P(0x1f5fbf),J={};
 const fab=tex(64,64,(c,w,h)=>{c.fillStyle='#808080';c.fillRect(0,0,w,h);c.fillStyle='#6a6a6a';for(let i=0;i<w;i+=2)c.fillRect(i,0,1,h);for(let j=0;j<h;j+=2)c.fillRect(0,j,w,1)});fab.wrapS=fab.wrapT=THREE.RepeatWrapping;fab.repeat.set(12,12);[shirt,sh,wh].forEach(m=>{m.bumpMap=fab;m.bumpScale=.35});
 const gl=c=>new THREE.MeshPhysicalMaterial({color:c,roughness:.12,clearcoat:1,clearcoatRoughness:.05});
 const grp=(n,p,x,y,z)=>{const o=new THREE.Group();o.position.set(x||0,y||0,z||0);p.add(o);J[n]=o;return o};
 const jt=(p,x,y)=>{const o=new THREE.Group();o.position.set(x,y,0);p.add(o);return o};
 const limb=(p,r0,r1,l,m,y)=>{const o=cap(r0,r1,l,m);o.castShadow=true;o.position.y=y||0;p.add(o);return o};
 const decal=(txt,a0)=>{const t=tex(128,128,(c,w,h)=>{c.font='bold 100px Arial Black,Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=8;c.strokeStyle='#15306b';c.strokeText(txt,w/2,h/2+4);c.fillStyle='#fff';c.fillText(txt,w/2,h/2+4)});
  const m=new THREE.Mesh(new THREE.CylinderGeometry(.148,.148,.13,20,1,true,a0,.8),new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.6,polygonOffset:true,polygonOffsetFactor:-2}));m.scale.z=.82;m.position.y=.25;return m};
 const root=new THREE.Group(),hips=grp('hips',root,0,.72,0);
 mesh(new THREE.SphereGeometry(.13,28,20),sh,0,0,0,hips).scale.set(1.15,.85,.95);
 mesh(new THREE.TorusGeometry(.125,.012,8,36),wh,0,.06,0,hips).rotation.x=Math.PI/2;
 const sp=grp('spine',hips,0,.03,0);limb(sp,.15,.13,.25,shirt,.33).scale.z=.82;sp.add(decal('7',-.4),decal('7',Math.PI-.4));
 for(const[y,r,m]of[[.43,.115,wh],[.1,.136,wh]]){const g=new THREE.Group();g.position.y=y;g.scale.z=.82;sp.add(g);mesh(new THREE.TorusGeometry(r,.012,8,36),m,0,0,0,g).rotation.x=Math.PI/2}
 const nk=grp('neck',sp,0,.46,0),hd=grp('head',nk,0,.17,0);mesh(new THREE.CylinderGeometry(.045,.05,.1,16),skin,0,-.14,0,hd);
 mesh(new THREE.SphereGeometry(.17,48,32),skin,0,0,0,hd).scale.set(1,.96,.98);
 mesh(new THREE.SphereGeometry(.18,40,24,0,Math.PI*2,0,Math.PI*.52),hair,0,.01,0,hd).rotation.x=-.25;
 for(let i=0;i<34;i++){const th=i*2.399,ph=.25+((i*37)%100)/100*1.05,nx=Math.sin(ph)*Math.cos(th),ny=Math.cos(ph),nz2=Math.sin(ph)*Math.sin(th);if(nz2>.45&&ny<.6)continue;const t=mesh(new THREE.SphereGeometry(.03,10,8),hair,nx*.175,ny*.175+.01,nz2*.175,hd);t.scale.set(1,1.7,1);t.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(nx,ny,nz2))}
 for(const[x,r]of[[-.075,.2],[0,0],[.075,-.2]]){const b=mesh(new THREE.SphereGeometry(.06,16,12),hair,x,.115,.125,hd);b.scale.set(1,.6,.7);b.rotation.z=r}
 for(const s of[-1,1])mesh(new THREE.SphereGeometry(.05,14,10),hair,s*.155,.0,.03,hd).scale.set(.6,1.2,.9);
 mesh(new THREE.SphereGeometry(.06,16,12),hair,0,.05,-.19,hd);mesh(new THREE.TorusGeometry(.04,.008,6,16),red,0,.05,-.165,hd);mesh(new THREE.SphereGeometry(.045,16,12),hair,0,-.03,-.23,hd).scale.y=1.5;
 mesh(new THREE.SphereGeometry(.016,12,10),skin,0,-.022,.166,hd).scale.set(1,.8,.9);
 for(const s of[-1,1]){const e=mesh(new THREE.SphereGeometry(.035,14,10),skin,s*.17,0,0,hd);e.scale.z=.6;mesh(new THREE.SphereGeometry(.02,10,8),pink,s*.172,0,.004,hd).scale.set(.5,1,.7);
  mesh(new THREE.SphereGeometry(.024,16,12),gl(0xffffff),s*.066,.012,.148,hd).scale.set(1,1.25,.55);
  mesh(new THREE.SphereGeometry(.0165,16,12),gl(0x4a2e1c),s*.066,.012,.156,hd).scale.set(1,1.25,.5);
  mesh(new THREE.SphereGeometry(.009,10,8),dk,s*.066,.012,.16,hd);mesh(new THREE.SphereGeometry(.005,8,6),wh,s*.066+.005,.02,.163,hd);
  mesh(new THREE.SphereGeometry(.027,14,10),skin,s*.066,.03,.15,hd).scale.set(1,.45,.6);
  const b=mesh(new THREE.BoxGeometry(.05,.01,.01),hair,s*.066,.064,.15,hd);b.rotation.z=s*.12;
  mesh(new THREE.SphereGeometry(.022,12,8),pink,s*.1,-.035,.135,hd).scale.set(1,.7,.3)}
 mesh(new THREE.TorusGeometry(.03,.005,6,16,Math.PI),P(0xa8484a,.4),0,-.055,.16,hd).rotation.z=Math.PI;
 {const m1=new THREE.Mesh(new THREE.CircleGeometry(.03,20,Math.PI,Math.PI),P(0x5a1f26,.6));m1.position.set(0,-.055,.1585);hd.add(m1);const m2=new THREE.Mesh(new THREE.PlaneGeometry(.044,.008),P(0xffffff,.3));m2.position.set(0,-.0605,.159);hd.add(m2)}
 const FL=[[.027,1],[.009,1.12],[-.009,1.05],[-.027,.85]];
 for(const s of[-1,1]){const n=s<0?'R':'L';
  const sd=grp('shoulder'+n,sp,s*.18,.35,0);
  mesh(new THREE.SphereGeometry(.054,20,16),shirt,0,0,0,sd);limb(sd,.042,.038,.24,skin);limb(sd,.054,.05,.11,shirt);
  mesh(new THREE.TorusGeometry(.052,.008,6,20),wh,0,-.115,0,sd).rotation.x=Math.PI/2;
  const el=grp('elbow'+n,sd,0,-.24,0);mesh(new THREE.SphereGeometry(.037,14,10),skin,0,0,0,el);limb(el,.038,.032,.22,skin);mesh(new THREE.TorusGeometry(.035,.008,6,20),wh,0,-.17,0,el).rotation.x=Math.PI/2;
  const wr=grp('wrist'+n,el,0,-.22,0);const pa=mesh(new THREE.SphereGeometry(.04,20,14),skin,0,-.04,0,wr);pa.scale.set(1.05,1,.55);mesh(new THREE.SphereGeometry(.022,12,10),skin,-s*.03,-.03,.008,wr);mesh(new THREE.SphereGeometry(.02,12,10),skin,s*.02,-.065,.008,wr);
  if(s>0){mesh(new THREE.TorusGeometry(.036,.006,8,24),dk,0,-.025,0,wr).rotation.x=Math.PI/2;mesh(new THREE.BoxGeometry(.03,.006,.03),P(0x9fb4c8,.2),0,-.025,-.038,wr)}
  J['fing'+n]=[];
  FL.forEach(([x,k])=>{let g=jt(wr,-s*x,-.078);const ch=[];[.026,.02,.016].forEach((l0,q)=>{const l=l0*k;ch.push(g);limb(g,.0085-q*.0006,.0078-q*.0006,l,skin);if(q===2){const nl=mesh(new THREE.SphereGeometry(.0065,10,8),P(0xf1b9a0,.35),0,-l*.55,-.0072,g);nl.scale.set(1,1.5,.4)}g=jt(g,0,-l)});J['fing'+n].push(ch)});
  {let g=jt(wr,-s*.04,-.025);g.userData.z=-s*.45;g.rotation.z=-s*.45;const ch=[];[.03,.024].forEach(l=>{ch.push(g);limb(g,.011,.009,l,skin);g=jt(g,0,-l)});J['fing'+n].push(ch)}
  grp('hand'+n,wr,0,-.076,.018).rotation.z=-s*Math.PI/2; /* 持ち手：道具の+Yは手首ローカルの∓X */
  const hp=grp('hip'+n,hips,s*.075,-.02,0);limb(hp,.062,.05,.34,skin);limb(hp,.075,.07,.17,sh);mesh(new THREE.BoxGeometry(.008,.17,.03),wh,s*.073,-.09,0,hp);
  const kn=grp('knee'+n,hp,0,-.34,0);mesh(new THREE.SphereGeometry(.05,16,12),skin,0,0,.008,kn);limb(kn,.05,.04,.27,skin);mesh(new THREE.SphereGeometry(.045,14,10),skin,0,-.1,-.022,kn).scale.y=1.5;
  limb(kn,.047,.043,.14,wh,-.13);mesh(new THREE.TorusGeometry(.046,.007,6,20),red,0,-.145,0,kn).rotation.x=Math.PI/2;
  const an=grp('ankle'+n,kn,0,-.27,0);
  mesh(new THREE.SphereGeometry(.06,28,18),wh,0,-.045,.04,an).scale.set(1,.7,1.8);mesh(new THREE.SphereGeometry(.04,16,12),blue,0,-.05,.108,an).scale.set(1.15,.8,1);
  mesh(new THREE.SphereGeometry(.06,28,12),dk,0,-.078,.04,an).scale.set(1.04,.25,1.84);mesh(new THREE.SphereGeometry(.03,12,10),blue,0,-.04,-.04,an);mesh(new THREE.SphereGeometry(.058,20,10),blue,0,-.04,.04,an).scale.set(1.01,.12,1.6);
  for(let i=0;i<3;i++)mesh(new THREE.BoxGeometry(.05,.004,.01),dk,0,-.012-i*.002,.045+i*.022,an).rotation.x=-.25}
 return{root,J}}
function equip(c,k){const R=c.J.handR;while(R.children.length)R.remove(R.children[0]);if(c.ball){c.root.remove(c.ball);c.ball=null}
 c.sp=k;c.def=k==='volley'?2:1;c.alpha=0;c.fm=[1,1,1,1,1];c.ho=[.03,.07];
 const give=(t,y,al,fm)=>{t.position.y=y;R.add(t);c.alpha=al;c.fm=fm};
 if(k==='badm'){give(badRacket(),.05,-.44,[.7,1,1,1,1]);c.ball=shuttle();c.br=.02;c.ho=[.012,.105]}
 if(k==='tennis'){give(tennisRacket(),.04,-.4,[.8,1,1,1,1]);c.ball=tennisBall();c.br=.0335;c.ho=[.046,.07]}
 if(k==='volley'){c.ball=volleyball();c.br=.105;c.ho=[.117,.07]}
 if(k==='tt'){give(paddle(),0,-.3,[.15,.95,1,1,1]);c.ball=ttBall();c.br=.02;c.ho=[.032,.075]}
 R.rotation.z=Math.PI/2-c.alpha;if(c.ball)c.root.add(c.ball)}
/*DATA 動作データ（キー姿勢を補間）。手は[位置xyz, 指先方向xyz, 手のひら法線xyz, 握り]、座標はキャラ基準（+z=ネット側, 右手は-x）*/
const nz=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return v.map(x=>x/l)},cr=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const hf=(p,f,n,c)=>[...p,...f,...n,c];
const rk=(p,u,n,c)=>{u=nz(u);const d=n[0]*u[0]+n[1]*u[1]+n[2]*u[2];n=nz(n.map((x,i)=>x-u[i]*d));return[...p,...cr(n,u),...n,c]};
const HC=(R,d)=>{const u=nz(cr(R.slice(3,6),R.slice(6,9)));return[R[0]+u[0]*d,R[1]+u[1]*d,R[2]+u[2]*d]};
const HN=(R,d)=>{const n=nz(R.slice(6,9));return[R[0]+n[0]*d,R[1]+n[1]*d,R[2]+n[2]*d]};
const B=[0,0,0,0,0,0,0,0,0,0,0,0,0,.1,.1,-.24,.8,.05,0,-1,0,1,0,0,0,.24,.8,.05,0,-1,0,-1,0,0,0,-.6,-.5,-.6,.6,-.5,-.6,0,1,0];
const K=(t,o)=>{const a=B.slice(),p=(i,v)=>{if(v)v.forEach((x,j)=>a[i+j]=x)};p(0,o.rt);if(o.y!=null)a[2]=o.y;if(o.j!=null)a[3]=o.j;p(4,o.sp);p(7,o.hd);p(9,o.lg);p(15,o.R);p(25,o.L);p(35,o.PR);p(38,o.PL);p(41,o.b);return{t,a,s:o.s==null?-1:o.s}};
const mk=(d,k)=>({dur:d,keys:k}),MO={};
const Lr=[-.5,.95,-.5,.95,.22,.22],Ld=[-.8,1.5,-.8,1.5,.3,.3],Lj=[-.35,.8,-.35,.8,.2,.2],Lw=[-.5,1,-.5,1,.35,.35],Ls=[-.05,.1,-.05,.1,.12,.12],H=3;
const TPk=(rn,ln,rc,lc)=>{const o={lg:Ls,R:hf([-.64,1.1,0],[-1,0,0],rn,rc),L:hf([.64,1.1,0],[1,0,0],ln,lc)};return mk(1,[K(0,o),K(1,o)])};
const TP={none:TPk([0,0,1],[0,0,1],0,0),badm:TPk([0,0,1],[0,1,0],1,.35),volley:TPk([0,1,0],[0,0,1],.35,0)};TP.tennis=TP.tt=TP.badm;
const hang=(s,c)=>hf([s*.24,.66,.04],[0,-1,.15],[-s,0,0],c);
{const a={lg:Ls,sp:[.02,0,0],hd:[0,.25,0],R:hang(-1,.4),L:hang(1,.4)};MO.idle=mk(3,[K(0,a),K(1.5,{...a,sp:[0,0,0],hd:[0,-.25,0]}),K(3,a)])}
{const A={lg:[-.9,.7,.55,1,.1,.1],sp:[.15,.25,0],R:hf([-.2,.78,-.3],[0,-.5,-1],[1,0,0],.7),L:hf([.2,.95,.4],[0,.35,1],[-1,0,0],.7),PR:[-.3,.2,-1]},
 C={lg:[.55,1,-.9,.7,.1,.1],sp:[.15,-.25,0],R:hf([-.2,.95,.4],[0,.35,1],[1,0,0],.7),L:hf([.2,.78,-.3],[0,-.5,-1],[-1,0,0],.7),PL:[.3,.2,-1]};MO.run=mk(.6,[K(0,A),K(.3,C),K(.6,A)])}
/* バドミントン */
{const rd=hf([-.22,1,.3],[0,.4,1],[1,0,.2],.9),BR={lg:Lr,sp:[.18,0,0],R:rk([-.22,1,.3],[0,1,.4],[1,0,.2],.9),L:hf([.2,.95,.25],[0,.4,1],[-1,0,.2],.2),s:H};
 MO['badm:ready']=mk(1.4,[K(0,BR),K(.7,{...BR,lg:[-.6,1.15,-.6,1.15,.22,.22],sp:[.24,0,0]}),K(1.4,BR)]);
 const c=rk([-.12,1.8,.2],[0,.8,.6],[0,-.6,.8],.9),bl=hf([.2,.95,.25],[0,.4,1],[-1,0,.2],.2);
 MO['badm:smash']=mk(2.2,[K(0,BR),
  K(.35,{...BR,lg:[-.6,1.1,-.5,.9,.25,.25],y:-.2,sp:[-.05,-.6,0],R:rk([-.3,1.4,-.12],[-.3,.4,-1],[1,0,-.3],.8),L:hf([.22,1.55,.35],[0,1,.2],[0,.2,1],0),PR:[-.8,.4,-.4],s:0,b:[.05,2.5,1]}),
  K(.6,{lg:Lj,j:.22,y:-.25,sp:[-.15,-.75,0],R:rk([-.3,1.7,-.2],[-.2,.2,-1],[1,0,-.2],.85),L:hf([.2,1.7,.3],[0,1,.2],[0,.2,1],0),PR:[-.8,.4,-.4],s:0,b:[-.05,2.45,.8]}),
  K(.78,{lg:Lj,j:.28,y:.05,sp:[.2,.1,0],R:c,L:hf([.3,1.2,.15],[.3,-.6,.4],[0,.5,1],0),PR:[-.4,.9,-.4],s:0,b:HC(c,.5)}),
  K(.92,{lg:[-.5,.9,-.4,.7,.25,.25],j:.15,y:.35,sp:[.4,.5,0],R:rk([.08,1.3,.4],[.6,-.4,.6],[0,.83,.55],.9),L:hf([.3,1.2,.1],[.3,-.5,.5],[0,.5,1],0),s:0,b:[-.1,1.7,1.7]}),
  K(1.1,{lg:Ld,sp:[.35,.2,0],R:rk([-.1,1,.5],[.3,.3,1],[0,1,-.3],.9),L:bl,s:0,b:[-.1,.45,4.5]}),
  K(1.2,{lg:Ld,sp:[.35,.2,0],R:rk([-.1,1,.5],[.3,.3,1],[0,1,-.3],.9),L:bl,s:H,b:[-.1,.4,4.6]}),K(1.8,BR),K(2.2,BR)]);
 const n=rk([-.25,.85,.8],[0,.6,.8],[1,0,0],.9),lu=[-1.05,1.15,.62,.3,.3,.3],nl=hf([.5,1,-.1],[.5,.8,0],[0,.4,1],0);
 MO['badm:net']=mk(2,[K(0,BR),K(.3,{...BR,lg:[-.8,1,-.2,.6,.25,.25],rt:[0,.06],sp:[.4,.1,0],R:rk([-.25,.9,.6],[0,.7,.7],[1,0,0],.9),s:0,b:[-.25,1.5,1.6]}),
  K(.55,{lg:lu,rt:[0,.12],sp:[.5,.15,0],R:n,L:nl,s:0,b:HC(n,.5)}),K(.8,{lg:lu,rt:[0,.12],sp:[.5,.15,0],R:rk([-.25,1.05,.85],[0,.8,.5],[1,0,0],.9),L:nl,s:0,b:[-.25,1.7,2.2]}),
  K(.95,{lg:lu,rt:[0,.12],sp:[.5,.15,0],R:rk([-.25,1.05,.85],[0,.8,.5],[1,0,0],.9),L:nl,s:H,b:[-.25,1.5,2.7]}),K(1.5,BR),K(2,BR)])}
/* テニス */
{const TR={lg:Lw,sp:[.2,0,0],R:rk([-.22,.95,.35],[0,.5,1],[1,0,0],.95),L:hf([-.05,1,.55],[-1,.3,0],[0,1,.2],.5),s:H},T2={...TR,lg:[-.6,1.2,-.6,1.2,.35,.35]};
 MO['tennis:ready']=mk(1.6,[K(0,TR),K(.8,T2),K(1.6,TR)]);
 const fc=rk([-.45,.78,.55],[.55,.45,.35],[-.25,.1,.95],.95),lf=hf([.3,1,.3],[.3,.5,.5],[0,.5,1],.2);
 MO['tennis:fh']=mk(2.2,[K(0,TR),
  K(.45,{lg:[-.5,1,-.6,1.1,.4,.4],y:-.1,sp:[.15,-.8,0],R:rk([-.6,1,-.4],[-.3,.1,-1],[0,-1,0],.95),L:hf([.35,1.15,.4],[0,1,.3],[0,.3,1],.2),PR:[-.8,-.2,-.5],s:0,b:[-.4,.6,2.6]}),
  K(.62,{lg:[-.75,1.2,-.4,.8,.4,.4],y:.1,sp:[.2,-.2,0],R:rk([-.55,.8,-.1],[.1,.1,-1],[0,-1,.1],.95),L:hf([.4,1.05,.45],[0,1,.3],[0,.3,1],.2),s:0,b:[-.42,.85,1.4]}),
  K(.75,{lg:[-.8,1.2,-.4,.8,.4,.4],y:.25,sp:[.2,.45,0],R:fc,L:lf,s:0,b:HC(fc,.5)}),
  K(.95,{lg:[-.6,1,-.3,.6,.35,.35],y:.5,sp:[.1,.9,0],R:rk([.2,1.3,.3],[.5,.3,-.8],[.2,-.9,0],.95),L:hf([.4,1.1,.2],[1,0,0],[0,.3,1],0),s:0,b:[-.15,1,3.5]}),
  K(1.05,{lg:[-.6,1,-.3,.6,.35,.35],y:.5,sp:[.1,.9,0],R:rk([.2,1.3,.3],[.5,.3,-.8],[.2,-.9,0],.95),L:hf([.4,1.1,.2],[1,0,0],[0,.3,1],0),s:H,b:[-.15,1,4.5]}),K(1.7,TR),K(2.2,TR)]);
 const sc=rk([-.12,1.85,.2],[0,1,.35],[0,-.35,1],.95),dn={lg:[-.5,1,-.5,1,.3,.3],R:rk([-.2,.75,.2],[0,.2,1],[1,0,0],.95),L:hf([0,.8,.3],[0,.4,1],[0,1,.1],.5)};
 MO['tennis:serve']=mk(3,[K(0,{lg:[-.3,.5,-.3,.5,.3,.3],sp:[.05,-.3,0],R:rk([-.2,.9,.3],[0,.6,1],[1,0,0],.95),L:hf([0,.95,.4],[0,.4,1],[0,1,.1],.5),s:1}),
  K(.5,{...dn,sp:[.1,-.3,0],s:1}),K(.8,{lg:[-.6,1.2,-.6,1.2,.3,.3],sp:[0,-.5,0],R:rk([-.4,.95,-.1],[-.4,.3,-1],[0,-1,0],.95),L:hf([.2,1.5,.3],[0,1,0],[0,.3,1],0),s:1}),
  K(.95,{lg:[-.6,1.2,-.6,1.2,.3,.3],sp:[0,-.5,0],R:rk([-.4,1.1,-.1],[-.4,.3,-1],[0,-1,0],.95),L:hf([.2,1.7,.35],[0,1,0],[0,.3,1],0),s:0,b:[.2,1.9,.45]}),
  K(1.3,{lg:[-.6,1.2,-.6,1.2,.3,.3],sp:[-.2,-.5,0],R:rk([-.35,1.5,-.2],[0,-.5,-1],[1,0,0],.95),L:hf([.2,1.7,.35],[0,1,0],[0,.3,1],0),s:0,b:[.1,2.6,.55]}),
  K(1.55,{lg:[-.2,.4,-.2,.4,.3,.3],j:.15,sp:[.1,.1,0],R:sc,L:hf([.3,1.2,.2],[.3,-.3,.5],[0,.5,1],0),s:0,b:HC(sc,.5)}),
  K(1.8,{lg:[-.5,1,-.3,.7,.3,.3],y:.3,sp:[.5,.7,0],R:rk([.15,1.1,.4],[.5,-.6,.6],[.4,.7,.5],.95),L:hf([.3,1.1,.2],[.3,-.5,.5],[0,.5,1],0),s:0,b:[-.1,1.6,2.8]}),
  K(1.95,{lg:[-.5,1,-.3,.7,.3,.3],y:.3,sp:[.5,.7,0],R:rk([.15,1.1,.4],[.5,-.6,.6],[.4,.7,.5],.95),L:hf([.3,1.1,.2],[.3,-.5,.5],[0,.5,1],0),s:H,b:[-.1,1,5]}),K(2.5,TR),K(3,TR)])}
/* バレーボール */
{const vr=hf([-.2,.85,.35],[0,.2,1],[0,1,0],.3),vl=hf([.2,.85,.35],[0,.2,1],[0,1,0],.3),VR={lg:[-.7,1.3,-.7,1.3,.3,.3],sp:[.3,0,0],R:vr,L:vl,s:H};
 MO['volley:ready']=mk(1.6,[K(0,VR),K(.8,{...VR,lg:[-.8,1.5,-.8,1.5,.3,.3]}),K(1.6,VR)]);
 const pl=(y,z,c)=>({R:hf([-.07,y,z],[.2,.3,1],[.3,1,.1],c),L:hf([.07,y,z],[-.2,.3,1],[-.3,1,.1],c)});
 MO['volley:recv']=mk(2.4,[K(0,VR),K(.35,{...VR,lg:Ld,sp:[.45,0,0],...pl(.62,.5,.6),s:0,b:[0,1.2,3]}),
  K(.7,{lg:[-.5,.9,-.5,.9,.3,.3],sp:[.35,0,0],...pl(.78,.55,.6),s:0,b:[0,.93,.55]}),K(.9,{lg:[-.3,.6,-.3,.6,.3,.3],sp:[.2,0,0],...pl(.9,.6,.6),s:0,b:[0,1.3,.7]}),
  K(1.2,{lg:[-.3,.6,-.3,.6,.3,.3],sp:[.2,0,0],...pl(.9,.6,.6),s:0,b:[0,3.2,2.4]}),K(1.3,{lg:[-.3,.6,-.3,.6,.3,.3],sp:[.2,0,0],...pl(.9,.6,.6),s:H,b:[0,3.4,2.6]}),K(1.8,VR),K(2.4,VR)]);
 const st=(y,z)=>({R:hf([-.1,y,z],[0,.6,-.8],[.15,.75,.65],.35),L:hf([.1,y,z],[0,.6,-.8],[-.15,.75,.65],.35)});
 MO['volley:set']=mk(2.2,[K(0,VR),K(.35,{lg:Ld,sp:[.25,0,0],...st(1.45,.2),s:0,b:[0,2.2,.9]}),K(.7,{lg:[-.5,.9,-.5,.9,.3,.3],sp:[.05,0,0],...st(1.55,.22),s:0,b:[0,1.76,.3]}),
  K(.9,{lg:[-.2,.4,-.2,.4,.2,.2],sp:[-.05,0,0],R:hf([-.12,1.75,.4],[0,1,.3],[0,.3,1],.2),L:hf([.12,1.75,.4],[0,1,.3],[0,.3,1],.2),s:0,b:[0,2.8,1.6]}),
  K(1.1,{lg:[-.2,.4,-.2,.4,.2,.2],R:hf([-.12,1.75,.4],[0,1,.3],[0,.3,1],.2),L:hf([.12,1.75,.4],[0,1,.3],[0,.3,1],.2),s:H,b:[0,3.2,2.4]}),K(1.7,VR),K(2.2,VR)]);
 const hit=hf([-.12,1.85,.35],[0,1,.1],[0,.1,1],.2),sk={lg:Lj,sp:[.15,.3,0],j:.5};
 MO['volley:spike']=mk(2.8,[K(0,VR),
  K(.3,{lg:Ld,sp:[.4,0,0],R:hf([-.28,.55,-.35],[0,-.2,-1],[0,1,0],.3),L:hf([.28,.55,-.35],[0,-.2,-1],[0,1,0],.3),s:0,b:[.1,3.1,1.1]}),
  K(.6,{lg:Lj,j:.4,sp:[-.1,0,0],R:hf([-.2,1.6,.25],[0,1,.1],[0,0,1],.1),L:hf([.2,1.6,.25],[0,1,.1],[0,0,1],.1),s:0,b:[.05,3,1]}),
  K(.8,{lg:Lj,j:.45,sp:[-.35,-.7,0],R:hf([-.3,1.7,-.15],[-.2,.8,-.5],[.2,.5,.8],.2),L:hf([.2,1.8,.4],[0,1,.3],[0,-.3,1],0),PR:[-.8,.3,-.4],s:0,b:[.0,2.6,.7]}),
  K(1,{...sk,R:hit,L:hf([.25,1.3,.2],[0,-1,.3],[0,0,1],.2),PR:[-.4,.9,-.4],s:0,b:HN(hit,.14)}),
  K(1.12,{lg:Lj,j:.4,sp:[.5,.5,0],R:hf([0,1.35,.5],[0,-.8,.6],[0,.6,.8],.2),L:hf([.25,1.2,.2],[0,-1,.3],[0,0,1],.2),s:0,b:[-.1,1.2,2.8]}),
  K(1.3,{lg:Lj,j:.3,sp:[.5,.5,0],R:hf([0,1.35,.5],[0,-.8,.6],[0,.6,.8],.2),L:hf([.25,1.2,.2],[0,-1,.3],[0,0,1],.2),s:H,b:[-.1,.1,4.2]}),
  K(1.6,{lg:Ld,sp:[.4,0,0],R:vr,L:vl,s:H}),K(2.2,VR),K(2.8,VR)]);
 const sh=hf([-.12,1.85,.4],[0,1,.1],[0,.1,1],.2);
 MO['volley:serve']=mk(3,[K(0,{lg:[-.3,.6,-.3,.6,.2,.2],sp:[.05,0,0],R:hf([-.2,.8,.2],[0,.2,1],[0,1,0],.3),L:hf([.1,1,.4],[0,.2,1],[0,1,0],.3),s:1}),
  K(.6,{lg:[-.5,1,-.5,1,.2,.2],sp:[-.1,-.4,0],R:hf([-.3,1.6,-.15],[-.2,.8,-.5],[.2,.5,.8],.2),L:hf([.1,1.5,.4],[0,1,.2],[0,.3,1],0),PR:[-.8,.3,-.4],s:0,b:[.1,2.3,.55]}),
  K(.9,{lg:[-.5,1,-.5,1,.2,.2],sp:[-.3,-.6,0],R:hf([-.3,1.6,-.15],[-.2,.8,-.5],[.2,.5,.8],.2),L:hf([.1,1.5,.4],[0,1,.2],[0,.3,1],0),PR:[-.8,.3,-.4],s:0,b:[.1,2.9,.6]}),
  K(1.15,{lg:Lj,j:.15,sp:[.1,.2,0],R:sh,L:hf([.25,1.2,.2],[0,-1,.3],[0,0,1],.2),PR:[-.4,.9,-.4],s:0,b:HN(sh,.14)}),
  K(1.3,{lg:[-.4,.8,-.4,.8,.2,.2],sp:[.3,.3,0],R:hf([0,1.45,.5],[0,.5,.8],[0,.5,.6],.2),L:hf([.25,1.2,.2],[0,-1,.3],[0,0,1],.2),s:0,b:[0,2.3,3.6]}),
  K(1.55,{lg:[-.4,.8,-.4,.8,.2,.2],sp:[.3,.3,0],R:hf([0,1.45,.5],[0,.5,.8],[0,.5,.6],.2),L:hf([.25,1.2,.2],[0,-1,.3],[0,0,1],.2),s:H,b:[0,1.8,5]}),K(2.2,VR),K(3,VR)])}
/* 卓球 */
{const tr=rk([-.2,.95,.4],[0,.95,.3],[0,-.3,.95],.95),TT={lg:Lw,sp:[.3,0,0],R:tr,L:hf([.25,1,.35],[0,.3,1],[-.5,.8,.2],.2),s:H};
 MO['tt:ready']=mk(1.4,[K(0,TT),K(.7,{...TT,lg:[-.6,1.2,-.6,1.2,.35,.35],sp:[.34,0,0]}),K(1.4,TT)]);
 const fc=rk([-.3,.95,.65],[.1,.9,.4],[.3,-.4,.9],.95);
 MO['tt:drive']=mk(1.8,[K(0,TT),K(.3,{lg:[-.55,1.1,-.5,.9,.4,.4],y:-.1,sp:[.3,-.6,0],R:rk([-.55,.8,0],[-.2,.8,-.5],[.2,-.5,.9],.95),L:hf([.3,1,.4],[0,.3,1],[-.5,.8,.2],.2),s:0,b:[-.35,.9,1]}),
  K(.55,{lg:[-.7,1.3,-.5,.9,.4,.4],y:.2,sp:[.3,.3,0],R:fc,L:hf([.3,1,.3],[.3,.3,1],[0,.8,.3],.2),s:0,b:HC(fc,.21)}),
  K(.75,{lg:[-.6,1.1,-.5,.9,.4,.4],y:.4,sp:[.25,.7,0],R:rk([0,1.2,.5],[.6,.7,.2],[.2,-.2,.9],.95),L:hf([.3,1,.2],[0,.3,1],[0,.8,.3],.2),s:0,b:[.2,.95,3]}),
  K(.85,{lg:[-.6,1.1,-.5,.9,.4,.4],y:.4,sp:[.25,.7,0],R:rk([0,1.2,.5],[.6,.7,.2],[.2,-.2,.9],.95),L:hf([.3,1,.2],[0,.3,1],[0,.8,.3],.2),s:H,b:[.2,.95,3.4]}),K(1.4,TT),K(1.8,TT)]);
 const sv=rk([-.12,.85,.5],[.3,.9,.2],[.4,-.2,.9],.95),pm=hf([.2,1,.45],[0,0,1],[0,1,0],.1);
 MO['tt:serve']=mk(2.6,[K(0,{...TT,L:pm,R:rk([-.3,.95,.3],[0,.9,.3],[0,-.3,.95],.95),s:1}),K(.6,{...TT,L:pm,R:rk([-.35,.95,.15],[-.2,.9,.2],[.2,-.3,.9],.95),s:1}),
  K(.8,{...TT,L:hf([.2,1.1,.45],[0,0,1],[0,1,0],.1),R:rk([-.35,.95,.15],[-.2,.9,.2],[.2,-.3,.9],.95),s:0,b:[.2,1.15,.45]}),
  K(1.05,{...TT,L:hf([.25,1.2,.4],[0,-.3,1],[0,.5,.8],0),R:rk([-.35,.9,.05],[-.2,.9,.2],[.2,-.3,.9],.95),s:0,b:[.2,1.4,.45]}),
  K(1.3,{...TT,y:.15,sp:[.3,.3,0],L:hf([.3,1.1,.3],[0,-.3,1],[0,.5,.8],0),R:sv,s:0,b:HC(sv,.21)}),K(1.5,{...TT,y:.2,sp:[.3,.4,0],R:rk([-.05,1,.6],[.5,.8,.2],[.3,-.3,.9],.95),s:0,b:[.15,.9,1.8]}),
  K(1.65,{...TT,y:.2,sp:[.3,.4,0],R:rk([-.05,1,.6],[.5,.8,.2],[.3,-.3,.9],.95),s:H,b:[.15,.9,2.4]}),K(2.1,TT),K(2.6,TT)])}
function sample(M,t){const k=M.keys,n=k.length-1,T=M.dur;if(n<1)return{a:k[0].a,s:k[0].s};t=((t%T)+T)%T;let i=0;while(i<n-1&&t>=k[i+1].t)i++;
 const j=m=>((m%n)+n)%n,tt=m=>k[j(m)].t+Math.floor(m/n)*T,A=m=>k[j(m)].a,a=tt(i),b=tt(i+1),h=b-a,u=(t-a)/h,u2=u*u,u3=u2*u,h00=2*u3-3*u2+1,h10=u3-2*u2+u,h01=-2*u3+3*u2,h11=u3-u2,d0=tt(i+1)-tt(i-1),d1=tt(i+2)-tt(i),o=[];
 for(let q=0;q<44;q++){const p0=A(i)[q],p1=A(i+1)[q];if(q>=41){o.push(p0+(p1-p0)*u);continue}const m0=(A(i+1)[q]-A(i-1)[q])/d0,m1=(A(i+2)[q]-A(i)[q])/d1;o.push(h00*p0+h10*h*m0+h01*p1+h11*h*m1)}
 return{a:o,s:k[i].s}}
/*ENDDATA*/
const ZA=new THREE.Vector3(0,0,1),AZ=new THREE.Quaternion(),DN=new THREE.Vector3(0,-1,0),W3=o=>o.getWorldPosition(new THREE.Vector3()),WQ=o=>o.getWorldQuaternion(new THREE.Quaternion()),v3=(a,i)=>new THREE.Vector3(a[i],a[i+1],a[i+2]);
function curl(c,n,v){const fm=n==='R'?c.fm||[1,1,1,1,1]:[1,1,1,1,1];c.J['fing'+n].forEach((ch,i)=>{const w=v*fm[i];ch.forEach((g,j)=>{g.rotation.x=-w*(i<4?[1,1.3,1][j]:[.5,.9][j]);if(i===4&&j===0)g.rotation.z=g.userData.z*(1-2.1*w)})})}
function ik(c,s,a,i,pi){const J=c.J,n=s<0?'R':'L',sd=J['shoulder'+n],el=J['elbow'+n],wr=J['wrist'+n],S=W3(sd),T=v3(a,i),F=v3(a,i+3).normalize(),N=v3(a,i+6);
 N.addScaledVector(F,-N.dot(F)).normalize();const d=T.clone().sub(S);let L=Math.min(Math.max(d.length(),.05),.455);d.normalize();
 const l1=.24,l2=.22,x=(l1*l1-l2*l2+L*L)/(2*L),hh=Math.sqrt(Math.max(l1*l1-x*x,0)),p=v3(a,pi);p.addScaledVector(d,-p.dot(d));if(p.lengthSq()<1e-6)p.set(0,-1,0).addScaledVector(d,d.y);p.normalize();
 const E=S.clone().addScaledVector(d,x).addScaledVector(p,hh),Wp=S.clone().addScaledVector(d,L),
 q1=new THREE.Quaternion().setFromUnitVectors(DN,E.clone().sub(S).normalize()),q2=new THREE.Quaternion().setFromUnitVectors(DN,Wp.clone().sub(E).normalize());
 sd.quaternion.copy(WQ(sd.parent).invert().multiply(q1));el.quaternion.copy(q1.clone().invert().multiply(q2));
 const qw=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(F.clone().cross(N).negate(),F.clone().negate(),N));
 if(n==='R'&&c.alpha)qw.multiply(AZ.setFromAxisAngle(ZA,c.alpha));wr.quaternion.copy(q2.clone().invert().multiply(qw));curl(c,n,a[i+9])}
function pose(c,a,st){const J=c.J,co=Math.cos;J.hips.rotation.set(0,a[2],0);let dr=0;
 for(const n of['R','L']){const q=n==='R'?0:2,A=a[9+q],Kn=a[10+q],S=a[n==='R'?13:14];J['hip'+n].rotation.set(A,0,(n==='R'?-1:1)*S);J['knee'+n].rotation.set(Kn,0,0);J['ankle'+n].rotation.set(-(A+Kn),0,0);dr=Math.max(dr,(.34*co(A)+.27*co(A+Kn))*co(S)+.09)}
 J.hips.position.set(a[0],dr+.02+a[3],a[1]);J.spine.rotation.set(a[4],a[5],a[6]);J.head.rotation.set(a[7],a[8],0);c.root.updateMatrixWorld(true);
 ik(c,-1,a,15,35);ik(c,1,a,25,38);const b=c.ball;if(!b)return;if(st<0)st=c.def;b.visible=st!==3;
 if(st===0)b.position.set(a[41],a[42],a[43]);
 else if(st<3){c.root.updateMatrixWorld(true);const w=J['wrist'+(st===1?'L':'R')],q=WQ(w);b.position.copy(W3(w)).addScaledVector(new THREE.Vector3(0,0,1).applyQuaternion(q),c.ho[0]).addScaledVector(new THREE.Vector3(0,-1,0).applyQuaternion(q),c.ho[1])}}
let mode='tpose',t0=0;
function play(c,now){const M=mode==='tpose'?TP[c.sp||'none']:MO[mode];if(!M)return;const r=sample(M,now-t0);pose(c,r.a,r.s)}
const MN={badm:[['ready','構え'],['smash','スマッシュ'],['net','ネットショット']],tennis:[['ready','構え'],['fh','フォアハンド'],['serve','サーブ']],volley:[['ready','構え'],['recv','レシーブ'],['set','トス'],['spike','スパイク'],['serve','サーブ']],tt:[['ready','構え'],['drive','ドライブ'],['serve','サーブ']]};
window.SportsRig=Object.freeze({makeChar,equip,play,pose,MO,TP,badRacket,tennisRacket,paddle,volleyball,tennisBall,ttBall,shuttle,setMotion(name){mode=name;t0=performance.now()/1000;},setEquipment(c,k){equip(c,k);mode=k+':ready';t0=performance.now()/1000;}});


})();
