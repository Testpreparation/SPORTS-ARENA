/* New isolated Three.js rendering foundation.
 * This file intentionally does not restore legacy gameplay, physics, input, or scoring.
 * Model/texture builders can be registered later without coupling to the UI or room layer.
 */
(() => {
  'use strict';
  const API_KEY = 'RacketArena3D';
  const state = { renderer: null, scene: null, camera: null, root: null, frame: 0, resize: null, active: false };

  function getStage() {
    let stage = document.getElementById('game3dStage');
    if (!stage) {
      stage = document.createElement('div');
      stage.id = 'game3dStage';
      stage.setAttribute('aria-label', '3Dゲーム表示');
      stage.hidden = true;
      document.body.appendChild(stage);
    }
    return stage;
  }

  function configureStage(stage) {
    Object.assign(stage.style, {
      position: 'fixed', inset: '0', width: '100%', height: '100%',
      overflow: 'hidden', background: '#101820', zIndex: '1'
    });
  }

  function resize() {
    if (!state.renderer || !state.camera) return;
    const stage = getStage();
    const w = Math.max(1, stage.clientWidth || window.innerWidth);
    const h = Math.max(1, stage.clientHeight || window.innerHeight);
    state.camera.aspect = w / h;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(w, h, false);
    state.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  function init(options = {}) {
    if (!window.THREE) throw new Error('Three.jsを読み込めませんでした');
    const stage = getStage();
    configureStage(stage);
    const THREE = window.THREE;

    if (state.renderer) dispose();

    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(options.background || 0x101820);
    state.camera = new THREE.PerspectiveCamera(options.fov || 48, 1, 0.1, 500);
    state.camera.position.set(0, 3.2, 8);
    state.camera.lookAt(0, 1.2, 0);

    state.renderer = new THREE.WebGLRenderer({
      antialias: true, alpha: false, powerPreference: 'high-performance'
    });
    state.renderer.outputEncoding = THREE.sRGBEncoding;
    state.renderer.shadowMap.enabled = true;
    state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    state.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    state.renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    stage.replaceChildren(state.renderer.domElement);

    state.scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x35404a, 1.65));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 8, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    state.scene.add(key);
    const fill = new THREE.DirectionalLight(0xc8e3ff, 0.65);
    fill.position.set(-5, 3, -4);
    state.scene.add(fill);

    state.root = new THREE.Group();
    state.root.name = 'modelRoot';
    state.scene.add(state.root);
    stage.hidden = false;
    state.active = true;
    state.resize = resize;
    window.addEventListener('resize', resize, { passive: true });
    resize();
    animate();
    return state.root;
  }

  function animate() {
    if (!state.active || !state.renderer) return;
    state.frame = requestAnimationFrame(animate);
    state.renderer.render(state.scene, state.camera);
  }

  function addModel(object3D) {
    if (!state.root) throw new Error('先に RacketArena3D.init() を実行してください');
    if (!object3D || !object3D.isObject3D) throw new TypeError('Three.js Object3D が必要です');
    state.root.add(object3D);
    return object3D;
  }

  function setCamera(position, target) {
    if (!state.camera || !window.THREE) return;
    state.camera.position.set(position.x, position.y, position.z);
    state.camera.lookAt(target.x, target.y, target.z);
  }

  function show() {
    getStage().hidden = false;
    if (state.renderer) resize();
  }

  function hide() {
    const stage = getStage();
    stage.hidden = true;
  }

  function dispose() {
    state.active = false;
    if (state.frame) cancelAnimationFrame(state.frame);
    if (state.resize) window.removeEventListener('resize', state.resize);
    if (state.renderer) {
      state.renderer.dispose();
      state.renderer.domElement.remove();
    }
    state.renderer = state.scene = state.camera = state.root = null;
    state.frame = 0;
    state.resize = null;
  }


  function clearRoot() {
    if (!state.root) return;
    while (state.root.children.length) {
      const child = state.root.children.pop();
      state.root.remove(child);
      child.traverse?.(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
        }
      });
    }
  }

  function buildArena(sport = 'badminton') {
    if (!state.scene || !state.root) throw new Error('先に RacketArena3D.init() を実行してください');
    const T = window.THREE;
    clearRoot();
    const mat = (color, roughness = .78, metalness = 0) => new T.MeshStandardMaterial({ color, roughness, metalness });
    const box = (w,h,d,m,x,y,z,parent=state.root) => {
      const o = new T.Mesh(new T.BoxGeometry(w,h,d),m);
      o.position.set(x,y,z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
    };
    const cyl = (rt,rb,h,m,x,y,z,parent=state.root) => {
      const o = new T.Mesh(new T.CylinderGeometry(rt,rb,h,48),m);
      o.position.set(x,y,z); o.castShadow=true; o.receiveShadow=true; parent.add(o); return o;
    };
    const line = (x1,z1,x2,z2,y,m,th=.025) => {
      const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz);
      const o=box(len,th,.018,m,(x1+x2)/2,y,(z1+z2)/2);
      o.rotation.y=-Math.atan2(dz,dx); return o;
    };

    // Shared indoor multi-sport stadium shell
    state.scene.background = new T.Color(0x111c2b);
    const floor = mat(0x263341), concrete = mat(0x536171), dark = mat(0x17212d), seatA=mat(0x1d5a78), seatB=mat(0x2d7893), rail=mat(0x9eafbd,.32,.55);
    const arena = new T.Group(); arena.name='multiSportArena'; state.root.add(arena);
    const floorMesh = new T.Mesh(new T.CylinderGeometry(18,18,.45,96),floor);
    floorMesh.position.y=-.28; floorMesh.receiveShadow=true; arena.add(floorMesh);
    // Concentric grandstand tiers, seating bands and aisle gaps
    for(let tier=0;tier<7;tier++){
      const radius=11.2+tier*.82, y=.15+tier*.34;
      const ring=new T.Mesh(new T.CylinderGeometry(radius+.35,radius,.28,96,1,true),concrete);
      ring.position.y=y; ring.receiveShadow=true; arena.add(ring);
      for(let seg=0;seg<48;seg++){
        if(seg%12===0) continue;
        const a=seg/48*Math.PI*2, rr=radius+.16;
        const seat=box(.62,.16,.38,(seg+tier)%3===0?seatB:seatA,Math.cos(a)*rr,y+.17,Math.sin(a)*rr,arena);
        seat.rotation.y=-a;
      }
    }
    // Roof beams and bright stadium luminaires
    const roof = new T.Mesh(new T.TorusGeometry(10.9,.24,12,96),dark);
    roof.rotation.x=Math.PI/2; roof.position.y=3.05; arena.add(roof);
    for(let i=0;i<8;i++){
      const a=i/8*Math.PI*2;
      const beam=cyl(.075,.12,3.2,rail,Math.cos(a)*10.8,1.5,Math.sin(a)*10.8,arena);
      beam.material=rail;
      const lamp=new T.Mesh(new T.BoxGeometry(1.25,.12,.36),new T.MeshStandardMaterial({color:0xf8fbff,emissive:0xd7ecff,emissiveIntensity:1.6}));
      lamp.position.set(Math.cos(a)*9.7,2.85,Math.sin(a)*9.7); lamp.rotation.y=-a; arena.add(lamp);
    }
    // Court apron and selected-sport playing surface
    const cfg = {
      badminton:{label:'BADMINTON',w:6.1,l:13.4,color:0x147b9c, line:0xf4f8fb, netH:1.55},
      tennis:{label:'TENNIS',w:10.97,l:23.77,color:0x276d55,line:0xf8f7ef,netH:.92},
      tt:{label:'TABLE TENNIS',w:2.74,l:5.5,color:0x245eac,line:0xffffff,netH:.152},
      volleyball:{label:'VOLLEYBALL',w:9,l:18,color:0x2d9b70,line:0xffffff,netH:2.24}
    };
    const c=cfg[sport]||cfg.badminton, scale=Math.min(1,8.2/c.w,14.5/c.l), w=c.w*scale,l=c.l*scale;
    const apron=box(w+1.8,.08,l+1.8,mat(0x111c28),0,-.015,0,arena);
    const court=box(w,.035,l,mat(c.color,.58),0,.04,0,arena);
    const lm=mat(c.line,.4);
    const xL=-w/2,xR=w/2,zF=-l/2,zB=l/2;
    line(xL,zF,xR,zF,.067,lm,.035);line(xL,zB,xR,zB,.067,lm,.035);
    line(xL,zF,xL,zB,.067,lm,.035);line(xR,zF,xR,zB,.067,lm,.035);
    if(sport==='badminton'){
      [-.5,.5].forEach(k=>line(xL,zF+l*k,xR,zF+l*k,.067,lm,.022));
      [-.36,.36].forEach(k=>line(xL+k*w,zF,xL+k*w,zB,.067,lm,.022));
      [-.25,.25].forEach(k=>line(xL,zF+l*(.5+k*.5),xR,zF+l*(.5+k*.5),.067,lm,.018));
    } else if(sport==='tennis'){
      [-.32,.32].forEach(k=>line(xL+k*w,zF,xL+k*w,zB,.067,lm,.024));
      [-.22,.22].forEach(k=>line(xL,zF+l*(.5+k),xR,zF+l*(.5+k),.067,lm,.024));
      line(xL,zF+l*.5,xR,zF+l*.5,.067,lm,.024);
    } else if(sport==='volleyball'){
      line(xL,zF+l*.5,xR,zF+l*.5,.067,lm,.03);
      line(xL,zF+l*.33,xR,zF+l*.33,.067,lm,.02);
      line(xL,zF+l*.67,xR,zF+l*.67,.067,lm,.02);
    } else {
      box(.025,.012,l*.85,lm,-w*.5,.068,0,arena);
      box(.025,.012,l*.85,lm,w*.5,.068,0,arena);
    }
    // Net with posts; table-tennis net is scaled down with its table
    const netZ=0, nh=c.netH*scale, postM=mat(0xe7edf4,.38,.2);
    cyl(.055,.055,nh+.12,postM,-w/2-.06,.07+nh/2,netZ,arena);
    cyl(.055,.055,nh+.12,postM,w/2+.06,.07+nh/2,netZ,arena);
    const netMat=new T.MeshStandardMaterial({color:0xdce4eb,roughness:.95,wireframe:true});
    const net=new T.Mesh(new T.PlaneGeometry(w,nh,Math.max(12,Math.round(w*8)),Math.max(4,Math.round(nh*12))),netMat);
    net.position.set(0,.07+nh/2,netZ); arena.add(net);
    // Camera frames the full court with stadium visible
    setCamera({x:0,y:Math.max(5.4,l*.42),z:Math.max(9,l*.66)},{x:0,y:.7,z:0});
    state.scene.background = new T.Color(0x101a28);
    return {sport,label:c.label,dimensions:{width:c.w,length:c.l},group:arena};
  }

  window[API_KEY] = Object.freeze({ init, addModel, setCamera, buildArena, show, hide, dispose });
})();
