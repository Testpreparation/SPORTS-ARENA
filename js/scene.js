/* REAL TENNIS ARENA — 3D scene foundation
 * The current athletes are procedural placeholders for validating scale, lighting and camera.
 * Replace them with licensed/owned rigged GLB models when ready.
 */
(function () {
  "use strict";
  const B = window.BABYLON;
  if (!B) {
    window.ArenaScene = { create: async () => { throw new Error("Babylon.js could not be loaded. Check your internet connection."); } };
    return;
  }

  function material(scene, name, color, roughness = 0.65, metallic = 0) {
    const m = new B.PBRMaterial(name, scene);
    m.albedoColor = B.Color3.FromHexString(color);
    m.roughness = roughness;
    m.metallic = metallic;
    return m;
  }

  function createAthlete(scene, name, x, z, palette, facing) {
    const root = new B.TransformNode(name + "-root", scene);
    root.position.set(x, 0, z);
    root.rotation.y = facing;
    const skin = material(scene, name + "-skin", "#d99b73", .82);
    const hair = material(scene, name + "-hair", palette.hair, .9);
    const shirt = material(scene, name + "-shirt", palette.shirt, .6);
    const shorts = material(scene, name + "-shorts", palette.shorts, .7);
    const shoe = material(scene, name + "-shoe", "#f2f2e9", .48);
    const accent = material(scene, name + "-accent", palette.accent, .45, .08);

    function sphere(label, diameter, pos, mat, scale) {
      const mesh = B.MeshBuilder.CreateSphere(name + "-" + label, { diameter, segments: 20 }, scene);
      mesh.parent = root; mesh.position.set(pos[0], pos[1], pos[2]); mesh.material = mat;
      if (scale) mesh.scaling.set(scale[0], scale[1], scale[2]);
      mesh.isPickable = false;
      return mesh;
    }
    function capsule(label, height, radius, pos, mat, scale) {
      const mesh = B.MeshBuilder.CreateCapsule(name + "-" + label, { height, radius, tessellation: 12, subdivisions: 4 }, scene);
      mesh.parent = root; mesh.position.set(pos[0], pos[1], pos[2]); mesh.material = mat;
      if (scale) mesh.scaling.set(scale[0], scale[1], scale[2]);
      mesh.isPickable = false;
      return mesh;
    }

    // Approximately 5.5-head proportions: intentionally stylized, not a photoreal human.
    capsule("torso", .86, .24, [0, 1.47, 0], shirt, [1.08, 1, .7]);
    sphere("hip", .48, [0, 1.04, 0], shorts, [1, .68, .76]);
    sphere("head", .48, [0, 2.16, 0], skin, [1, 1.08, .9]);
    sphere("hair-cap", .49, [0, 2.34, -.015], hair, [1.03, .62, .94]);
    sphere("ear-l", .105, [-.245, 2.14, 0], skin);
    sphere("ear-r", .105, [.245, 2.14, 0], skin);
    // Simple readable face details.
    const eyeMat = material(scene, name + "-eyes", "#18252b", .35);
    sphere("eye-l", .045, [-.095, 2.19, .214], eyeMat, [1, 1.2, .55]);
    sphere("eye-r", .045, [.095, 2.19, .214], eyeMat, [1, 1.2, .55]);
    const armL = capsule("arm-l", .68, .105, [-.31, 1.48, 0], shirt); armL.rotation.z = -.23;
    const armR = capsule("arm-r", .68, .105, [.31, 1.48, 0], shirt); armR.rotation.z = -.45;
    sphere("hand-l", .17, [-.39, 1.12, .015], skin);
    sphere("hand-r", .47, [.48, 1.13, .03], skin, [.56, .62, .55]);
    const legL = capsule("leg-l", .72, .115, [-.13, .55, 0], shorts); legL.rotation.z = -.05;
    const legR = capsule("leg-r", .72, .115, [.13, .55, 0], shorts); legR.rotation.z = .05;
    sphere("shoe-l", .29, [-.14, .16, .055], shoe, [1, .55, 1.55]);
    sphere("shoe-r", .29, [.14, .16, .055], shoe, [1, .55, 1.55]);
    // Lightweight racket silhouette for the initial visual build.
    const racket = new B.TransformNode(name + "-racket-root", scene);
    racket.parent = root; racket.position.set(.56, 1.2, .03); racket.rotation.z = -.35;
    const shaft = B.MeshBuilder.CreateCylinder(name + "-racket-shaft", {height:.58, diameter:.035, tessellation:10}, scene);
    shaft.parent = racket; shaft.position.y = -.22; shaft.material = accent;
    const head = B.MeshBuilder.CreateTorus(name + "-racket-head", {diameter:.39, thickness:.035, tessellation:24}, scene);
    head.parent = racket; head.position.y = .18; head.scaling.x = .7; head.material = accent;
    // Soft ground shadow under the character.
    const shadow = B.MeshBuilder.CreateDisc(name + "-shadow", {radius:.46, tessellation:32}, scene);
    shadow.parent = root; shadow.rotation.x = Math.PI / 2; shadow.position.y = .025; shadow.scaling.set(1.5, .8, 1);
    const shadowMat = new B.StandardMaterial(name + "-shadow-mat", scene);
    shadowMat.diffuseColor = new B.Color3(.015,.045,.05); shadowMat.alpha = .28; shadowMat.disableLighting = true;
    shadow.material = shadowMat; shadow.isPickable = false;

    root.metadata = { name, racket, limbs: [armL, armR, legL, legR], home: root.position.clone(), facing };
    return root;
  }

  async function create(engine, canvas) {
    const scene = new B.Scene(engine);
    scene.clearColor = new B.Color4(.025, .07, .085, 1);
    scene.ambientColor = new B.Color3(.18,.2,.2);
    scene.imageProcessingConfiguration.toneMappingEnabled = true;
    scene.imageProcessingConfiguration.toneMappingType = B.ImageProcessingConfiguration.TONEMAPPING_ACES;
    scene.imageProcessingConfiguration.exposure = 1.15;
    scene.imageProcessingConfiguration.contrast = 1.12;

    // Image-based lighting supplies broad, physically plausible reflections and
    // ambient illumination to PBR surfaces. If the remote environment cannot load,
    // the existing direct lights remain as a graceful visual fallback.
    try {
      const stadiumEnvironment = B.CubeTexture.CreateFromPrefilteredData(
        "https://assets.babylonjs.com/environments/environmentSpecular.env", scene
      );
      scene.environmentTexture = stadiumEnvironment;
      scene.environmentIntensity = .72;
      stadiumEnvironment.onError = () => {
        if (scene.environmentTexture === stadiumEnvironment) scene.environmentTexture = null;
      };
    } catch (e) {
      scene.environmentTexture = null;
    }

    const camera = new B.ArcRotateCamera("arena-camera", -Math.PI / 2 + .2, 1.08, 21.5, new B.Vector3(0, 1.4, 0), scene);
    camera.lowerRadiusLimit = 16; camera.upperRadiusLimit = 25;
    camera.lowerBetaLimit = .82; camera.upperBetaLimit = 1.28;
    camera.panningSensibility = 0; camera.wheelPrecision = 80;
    camera.inputs.clear();

    const hemi = new B.HemisphericLight("sky-fill", new B.Vector3(0,1,0), scene);
    hemi.intensity = .8; hemi.diffuse = new B.Color3(.77,.88,1); hemi.groundColor = new B.Color3(.08,.13,.16);
    const key = new B.DirectionalLight("stadium-key", new B.Vector3(-.55,-1,.38), scene);
    key.position = new B.Vector3(-7,12,-6); key.intensity = 2.1;
    key.shadowEnabled = true;
    const fill = new B.PointLight("warm-rim", new B.Vector3(8,6,4), scene);
    fill.diffuse = new B.Color3(.3,.85,.83); fill.intensity = 65; fill.range = 28;

    const courtMat = material(scene, "court-surface", "#176b72", .78);
    const courtInner = material(scene, "court-inner", "#238b8a", .74);
    const lineMat = material(scene, "court-lines", "#f3f5df", .52);
    const darkMat = material(scene, "stadium-floor", "#0b2028", .92);
    const netMat = material(scene, "net-frame", "#d6e5dd", .55, .12);
    const netMeshMat = new B.StandardMaterial("net-mesh-material", scene);
    netMeshMat.diffuseColor = new B.Color3(.7,.8,.77); netMeshMat.alpha = .52; netMeshMat.wireframe = true;

    // Procedural high-frequency court coatings: subtle pigment variation and fine
    // surface grain add material depth without external downloads or large assets.
    function createCourtTexture(name, base, light, dark, seed) {
      const tex = new B.DynamicTexture(name, { width: 1024, height: 2048 }, scene, true);
      const ctx = tex.getContext();
      ctx.fillStyle = base; ctx.fillRect(0, 0, 1024, 2048);
      const grad = ctx.createLinearGradient(0, 0, 1024, 2048);
      grad.addColorStop(0, light); grad.addColorStop(.5, base); grad.addColorStop(1, dark);
      ctx.globalAlpha = .24; ctx.fillStyle = grad; ctx.fillRect(0, 0, 1024, 2048);
      let state = seed >>> 0;
      const rand = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
      for (let i = 0; i < 17000; i++) {
        const x = rand() * 1024, y = rand() * 2048;
        const a = .025 + rand() * .075;
        ctx.globalAlpha = a;
        ctx.fillStyle = rand() > .52 ? light : dark;
        const w = 1 + rand() * 5, h = 1 + rand() * 10;
        ctx.fillRect(x, y, w, h);
      }
      // Fine, irregular roller marks suggest a real acrylic court coating.
      for (let i = 0; i < 360; i++) {
        ctx.globalAlpha = .025 + rand() * .035;
        ctx.strokeStyle = rand() > .5 ? light : dark;
        ctx.lineWidth = .5 + rand() * 1.4;
        const x = rand() * 1024, y = rand() * 2048;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rand() - .5) * 5, y + 8 + rand() * 42); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      tex.update(false);
      tex.wrapU = B.Texture.CLAMP_ADDRESSMODE;
      tex.wrapV = B.Texture.CLAMP_ADDRESSMODE;
      return tex;
    }
    const outerCourtTexture = createCourtTexture("court-acrylic-grain", "#176b72", "#398c89", "#0b424d", 4817);
    const innerCourtTexture = createCourtTexture("inner-court-acrylic-grain", "#238b8a", "#51a69b", "#145c68", 9203);
    courtMat.albedoTexture = outerCourtTexture;
    courtMat.albedoColor = B.Color3.White();
    courtMat.roughness = .82;
    courtInner.albedoTexture = innerCourtTexture;
    courtInner.albedoColor = B.Color3.White();
    courtInner.roughness = .79;

    // Real acrylic courts are mostly matte, but a restrained clear coat gives
    // the surface a subtle light response instead of a flat painted appearance.
    [courtMat, courtInner].forEach(m => {
      m.clearCoat.isEnabled = true;
      m.clearCoat.intensity = .12;
      m.clearCoat.roughness = .62;
    });

    const floor = B.MeshBuilder.CreateGround("stadium-floor", {width:48,height:36}, scene); floor.position.y = -.11; floor.material = darkMat; floor.isPickable = false;
    const court = B.MeshBuilder.CreateGround("court", {width:10.97,height:23.77}, scene); court.position.y = 0; court.material = courtMat; court.isPickable = false;
    const playing = B.MeshBuilder.CreateGround("inner-court", {width:8.23,height:23.77}, scene); playing.position.y = .008; playing.material = courtInner; playing.isPickable = false;

    // Slightly varied apron finish and a recessed boundary strip make the court
    // read as a professionally installed surface rather than a flat primitive.
    const apronEdgeMat = material(scene, "court-apron-edge", "#101f27", .86);
    const apronEdge = B.MeshBuilder.CreateBox("court-apron-recessed-edge", {width:18.1,height:.08,depth:29.5}, scene);
    apronEdge.position.y = -.13; apronEdge.material = apronEdgeMat; apronEdge.isPickable = false;

    function line(name, x1,z1,x2,z2, thickness=.055) {
      const length = Math.hypot(x2-x1,z2-z1);
      const mesh = B.MeshBuilder.CreateBox(name,{width:thickness,height:.018,depth:length},scene);
      mesh.position.set((x1+x2)/2,.025,(z1+z2)/2); mesh.rotation.y = -Math.atan2(x2-x1,z2-z1); mesh.material = lineMat; mesh.isPickable = false; return mesh;
    }
    const half = 11.885, singles = 4.115, doubles = 5.485, serviceZ = 6.4;
    line("baseline-far",-doubles,-half,doubles,-half); line("baseline-near",-doubles,half,doubles,half);
    line("sideline-left",-singles,-half,-singles,half); line("sideline-right",singles,-half,singles,half);
    line("doubles-left",-doubles,-half,-doubles,half); line("doubles-right",doubles,-half,doubles,half);
    line("service-far-left",-singles,-serviceZ,0,-serviceZ); line("service-far-right",0,-serviceZ,singles,-serviceZ);
    line("service-near-left",-singles,serviceZ,0,serviceZ); line("service-near-right",0,serviceZ,singles,serviceZ);
    line("center-service-far",0,-serviceZ,0,0,.04); line("center-service-near",0,0,0,serviceZ,.04);

    const net = B.MeshBuilder.CreateBox("net-body",{width:10.97,height:.82,depth:.045},scene); net.position.set(0,.48,0); net.material = netMeshMat; net.isPickable = false;
    for (const x of [-5.49,5.49]) {
      const post = B.MeshBuilder.CreateCylinder("net-post",{height:1.08,diameter:.11,tessellation:12},scene);
      post.position.set(x,.54,0); post.material = netMat; post.isPickable = false;
    }
    const tape = B.MeshBuilder.CreateBox("net-tape",{width:10.97,height:.055,depth:.06},scene); tape.position.set(0,.91,0); tape.material = lineMat; tape.isPickable = false;

    // Detailed professional outdoor stadium: tiered stands, crowd, roof trusses,
    // perimeter fencing, sponsor boards, umpire chair, player benches and floodlights.
    const seatMats = [
      material(scene,"seat-a","#17323b",.86),
      material(scene,"seat-b","#21434a",.86),
      material(scene,"seat-c","#102a33",.86),
      material(scene,"seat-highlight","#2a5057",.84)
    ];
    const structureMat = material(scene,"stadium-structure","#182b34",.78,.18);
    const concreteMat = material(scene,"stand-concrete","#65747a",.9);
    const railMat = material(scene,"stadium-rails","#9aadb0",.38,.55);
    const boardMats = [
      material(scene,"ad-board-dark","#10232c",.55),
      material(scene,"ad-board-cyan","#176c72",.5),
      material(scene,"ad-board-lime","#c4e84d",.48)
    ];
    const crowdMats = [
      material(scene,"crowd-white","#e4e7dc",.92),
      material(scene,"crowd-blue","#477b99",.92),
      material(scene,"crowd-red","#b95d52",.92),
      material(scene,"crowd-yellow","#d4b85d",.92),
      material(scene,"crowd-teal","#4caaa1",.92),
      material(scene,"crowd-dark","#273944",.92),
      material(scene,"crowd-purple","#77678e",.92)
    ];

    // Low apron around the court gives the playing surface a finished stadium edge.
    const apron = B.MeshBuilder.CreateGround("court-apron",{width:17.8,height:29.2},scene);
    apron.position.y=-.075; apron.material=material(scene,"court-apron-material","#273b40",.88); apron.isPickable=false;

    // Rear and front grandstands: five stepped concrete tiers with individual seat rows.
    for (let side of [-1,1]) {
      for (let row=0;row<6;row++) {
        const z=side*(13.45+row*.92);
        const y=.25+row*.31;
        const width=29.8+row*.9;
        const riser=B.MeshBuilder.CreateBox("grandstand-riser-"+side+"-"+row,{width,height:.24,depth:.82},scene);
        riser.position.set(0,y,z); riser.material=concreteMat; riser.isPickable=false;
        const seatRow=B.MeshBuilder.CreateBox("seat-row-"+side+"-"+row,{width:width-.18,height:.18,depth:.42},scene);
        seatRow.position.set(0,y+.17,z-side*.08); seatRow.material=seatMats[row%seatMats.length]; seatRow.isPickable=false;
        const rail=B.MeshBuilder.CreateBox("tier-front-rail-"+side+"-"+row,{width:width-.4,height:.035,depth:.035},scene);
        rail.position.set(0,y+.42,z-side*.39); rail.material=railMat; rail.isPickable=false;
      }
    }
    // Side stands close the bowl around the baseline ends.
    for (let side of [-1,1]) {
      for (let row=0;row<5;row++) {
        const x=side*(7.2+row*1.15);
        const tier=B.MeshBuilder.CreateBox("side-stand-tier-"+side+"-"+row,{width:.78,height:.24,depth:22.8+row*.8},scene);
        tier.position.set(x,.35+row*.34,0); tier.material=concreteMat; tier.isPickable=false;
        const seats=B.MeshBuilder.CreateBox("side-seat-tier-"+side+"-"+row,{width:.43,height:.17,depth:22.3+row*.8},scene);
        seats.position.set(x-side*.08,.52+row*.34,0); seats.material=seatMats[(row+1)%seatMats.length]; seats.isPickable=false;
      }
    }


    // Individual molded seats break up the long, block-like stand rows.
    // Instancing keeps the extra stadium detail substantially lighter than
    // creating a separate high-detail mesh for every seat.
    const seatShellMat = material(scene, "individual-seat-shell", "#203d47", .56, .08);
    const seatPadMat = material(scene, "individual-seat-pad", "#31535c", .72);
    const seatBackBase = B.MeshBuilder.CreateBox("seat-back-instance-source", {width:1,height:1,depth:1}, scene);
    seatBackBase.material = seatShellMat; seatBackBase.position.set(0,-120,0); seatBackBase.isPickable = false;
    const seatPadBase = B.MeshBuilder.CreateBox("seat-pad-instance-source", {width:1,height:1,depth:1}, scene);
    seatPadBase.material = seatPadMat; seatPadBase.position.set(0,-120,0); seatPadBase.isPickable = false;
    function addIndividualSeat(name, x, y, z, facing, width=.34) {
      const back = seatBackBase.createInstance(name + "-back");
      back.position.set(x,y+.27,z); back.rotation.x = facing; back.scaling.set(width,.36,.075); back.isPickable=false;
      const pad = seatPadBase.createInstance(name + "-pad");
      pad.position.set(x,y+.08,z-.08*Math.cos(facing)); pad.rotation.x=facing; pad.scaling.set(width,.09,.31); pad.isPickable=false;
    }
    // Rear and front grandstands: individual seat backs and cushions per row.
    for (let side of [-1,1]) {
      for (let row=0;row<6;row++) {
        const z=side*(13.45+row*.92);
        const y=.25+row*.31;
        const count=52+row;
        const start=-(count-1)*.28/2;
        for (let i=0;i<count;i++) {
          addIndividualSeat("stadium-seat-"+side+"-"+row+"-"+i,
            start+i*.28,y+.17,z-side*.08,side*.035,.235);
        }
      }
    }
    // Individual seats along the side stands, oriented toward the court.
    for (let side of [-1,1]) {
      for (let row=0;row<5;row++) {
        const x=side*(7.2+row*1.15);
        const count=38+row*2;
        const start=-(count-1)*.28/2;
        for (let i=0;i<count;i++) {
          addIndividualSeat("side-stadium-seat-"+side+"-"+row+"-"+i,
            x-side*.08,.35+row*.34,start+i*.28,side*.035,.235);
        }
      }
    }

    // Crowd silhouettes use one instancing source per material for mobile-friendly detail.
    const crowdBases=crowdMats.map((mat,mi)=>{
      const base=B.MeshBuilder.CreateCapsule("crowd-instance-base-"+mi,{height:.34,radius:.105,tessellation:6,subdivisions:1},scene);
      base.material=mat; base.isPickable=false;
      base.position.set(0,-100-mi,0); base.scaling.set(.001,.001,.001);
      return base;
    });
    let crowdIndex=0;
    function addCrowd(name,x,y,z,sx,sy,sz,rotation,matIndex) {
      const source=crowdBases[matIndex%crowdBases.length];
      const inst=source.createInstance(name);
      inst.position.set(x,y,z); inst.scaling.set(sx,sy,sz); inst.rotation.y=rotation;
      inst.isPickable=false;
      return inst;
    }
    for (let side of [-1,1]) {
      for (let row=0;row<6;row++) {
        const z=side*(13.65+row*.92);
        const y=.57+row*.31;
        for (let i=0;i<37;i++) {
          const x=-14.1+i*.785+(row%2)*.18;
          addCrowd("crowd-person-"+(crowdIndex++),x,y,z-side*.06,
            .72+(i%3)*.09,.78+((i+row)%4)*.1,.72,
            ((i*7+row*13)%9)*.11,(i*3+row*5+(side>0?2:0))%crowdMats.length);
        }
      }
    }
    for (let side of [-1,1]) {
      for (let row=0;row<4;row++) {
        const x=side*(7.55+row*1.15);
        for (let i=0;i<27;i++) {
          const z=-10.7+i*.82+(row%2)*.16;
          addCrowd("side-crowd-"+side+"-"+row+"-"+i,x-side*.06,.6+row*.34,z,
            .72,.82+((i+row)%3)*.12,.72,side*.12,
            (i+row*3+(side>0?1:4))%crowdMats.length);
        }
      }
    }

    // Structural canopy and trusses around the upper seating bowl.
    for (let side of [-1,1]) {
      const fascia=B.MeshBuilder.CreateBox("roof-fascia-"+side,{width:35,height:.42,depth:1.25},scene);
      fascia.position.set(0,5.1,side*19.25); fascia.material=structureMat; fascia.isPickable=false;
      const beam=B.MeshBuilder.CreateBox("roof-beam-"+side,{width:35,height:.16,depth:.18},scene);
      beam.position.set(0,5.42,side*18.8); beam.material=railMat; beam.isPickable=false;
      for (let i=0;i<9;i++) {
        const x=-16+i*4;
        const brace=B.MeshBuilder.CreateBox("roof-brace-"+side+"-"+i,{width:.12,height:2.1,depth:.12},scene);
        brace.position.set(x,4.15,side*(17.8+(i%2)*.45)); brace.rotation.x=side*.12; brace.rotation.z=(i%2?-.12:.12); brace.material=structureMat; brace.isPickable=false;
      }
    }
    for (let side of [-1,1]) {
      for (let i=0;i<5;i++) {
        const x=side*(15.1+i*.2);
        const column=B.MeshBuilder.CreateBox("stadium-column-"+side+"-"+i,{width:.32,height:4.6,depth:.38},scene);
        column.position.set(x,2.25,-10+i*5); column.material=structureMat; column.isPickable=false;
      }
    }

    // Courtside sponsor panels around the playable area.
    function panel(name,x,z,width,mat,rotation=0) {
      const p=B.MeshBuilder.CreateBox(name,{width,height:.68,depth:.13},scene);
      p.position.set(x,.42,z); p.rotation.y=rotation; p.material=mat; p.isPickable=false;
      const top=B.MeshBuilder.CreateBox(name+"-top-trim",{width,height:.045,depth:.15},scene);
      top.position.set(x,.78,z); top.rotation.y=rotation; top.material=boardMats[2]; top.isPickable=false;
    }
    for (let i=0;i<5;i++) {
      const x=-8.1+i*4.05;
      panel("far-courtside-board-"+i,x,-12.35,3.85,boardMats[i%2]);
      panel("near-courtside-board-"+i,x,12.35,3.85,boardMats[(i+1)%2]);
    }
    panel("left-courtside-board",-6.05,0,5.2,boardMats[1],Math.PI/2);
    panel("right-courtside-board",6.05,0,5.2,boardMats[0],Math.PI/2);

    // Main umpire chair and compact courtside officials' station beside the net.
    const chairMat=material(scene,"umpire-chair","#e8e9df",.48);
    const chairSeat=B.MeshBuilder.CreateBox("umpire-chair-seat",{width:.78,height:.12,depth:.72},scene);
    chairSeat.position.set(6.35,1.55,-.45); chairSeat.material=chairMat; chairSeat.isPickable=false;
    const chairBack=B.MeshBuilder.CreateBox("umpire-chair-back",{width:.78,height:.8,depth:.1},scene);
    chairBack.position.set(6.35,1.94,-.78); chairBack.material=chairMat; chairBack.isPickable=false;
    for (let x of [6.08,6.62]) {
      const leg=B.MeshBuilder.CreateBox("umpire-chair-leg",{width:.09,height:1.55,depth:.09},scene);
      leg.position.set(x,.78,-.45); leg.material=structureMat; leg.isPickable=false;
    }
    for (let step=0;step<4;step++) {
      const stair=B.MeshBuilder.CreateBox("umpire-chair-step-"+step,{width:.52,height:.09,depth:.22},scene);
      stair.position.set(6.35,.28+step*.27,-1.05+step*.17); stair.material=railMat; stair.isPickable=false;
    }
    const officialsDesk=B.MeshBuilder.CreateBox("officials-desk",{width:1.35,height:.72,depth:.58},scene);
    officialsDesk.position.set(-6.2,.38,-.7); officialsDesk.material=structureMat; officialsDesk.isPickable=false;

    // Player benches, towels and equipment cases behind each baseline.
    for (let side of [-1,1]) {
      const bench=B.MeshBuilder.CreateBox("player-bench-seat-"+side,{width:2.2,height:.12,depth:.48},scene);
      bench.position.set(0,.62,side*12.95); bench.material=chairMat; bench.isPickable=false;
      for (let x of [-.92,.92]) {
        const leg=B.MeshBuilder.CreateBox("player-bench-leg-"+side+"-"+x,{width:.09,height:.58,depth:.09},scene);
        leg.position.set(x,.31,side*12.95); leg.material=structureMat; leg.isPickable=false;
      }
      const caseMesh=B.MeshBuilder.CreateBox("equipment-case-"+side,{width:.55,height:.38,depth:.42},scene);
      caseMesh.position.set(side>0?1.45:-1.45,.22,side*12.95); caseMesh.material=boardMats[side>0?2:1]; caseMesh.isPickable=false;
    }

    // Floodlight gantries with rows of individual lamp lenses.
    for (let side of [-1,1]) {
      for (let i=0;i<3;i++) {
        const x=-12+i*12;
        const pole=B.MeshBuilder.CreateCylinder("floodlight-pole-"+side+"-"+i,{height:7.2,diameter:.18,tessellation:8},scene);
        pole.position.set(x,3.6,side*15.8); pole.material=structureMat; pole.isPickable=false;
        const bar=B.MeshBuilder.CreateBox("floodlight-bar-"+side+"-"+i,{width:2.25,height:.18,depth:.28},scene);
        bar.position.set(x,7.15,side*15.8); bar.material=railMat; bar.isPickable=false;
        for (let j=0;j<7;j++) {
          const bulb=B.MeshBuilder.CreateBox("floodlight-lens-"+side+"-"+i+"-"+j,{width:.19,height:.12,depth:.06},scene);
          bulb.position.set(x-1+j*.333,7.12,side*15.62); bulb.material=material(scene,"floodlight-lens-mat-"+side+"-"+i+"-"+j,"#f1ffe6",.24,.05); bulb.isPickable=false;
        }
        const lamp=new B.PointLight("stadium-lamp-"+side+"-"+i,new B.Vector3(x,7,side*15),scene);
        lamp.diffuse=new B.Color3(.72,.87,1); lamp.intensity=11; lamp.range=18;
      }
    }

    // Low perimeter fence and access gates complete the arena silhouette.
    for (let side of [-1,1]) {
      const fence=B.MeshBuilder.CreateBox("perimeter-fence-"+side,{width:32,height:1.15,depth:.07},scene);
      fence.position.set(0,.58,side*20.4); fence.material=netMeshMat; fence.isPickable=false;
      for (let i=0;i<17;i++) {
        const post=B.MeshBuilder.CreateBox("fence-post-"+side+"-"+i,{width:.055,height:1.3,depth:.09},scene);
        post.position.set(-15.5+i*1.94,.65,side*20.4); post.material=railMat; post.isPickable=false;
      }
    }
    const player = createAthlete(scene,"player",0,7.2,{hair:"#25323b",shirt:"#e8f3e6",shorts:"#193c4a",accent:"#d7ff55"},Math.PI);
    const cpu = createAthlete(scene,"cpu",0,-7.2,{hair:"#472f27",shirt:"#ff835e",shorts:"#f0e7dc",accent:"#68e6df"},0);

    const ballMat = material(scene,"tennis-ball","#d8ff45",.42,.02);
    const ball = B.MeshBuilder.CreateSphere("tennis-ball",{diameter:.22,segments:20},scene);
    ball.material=ballMat; ball.position.set(0,1.1,4.6); ball.isPickable=false;
    const seamMat = new B.StandardMaterial("ball-seam",scene); seamMat.diffuseColor=new B.Color3(.94,1,.65); seamMat.emissiveColor=new B.Color3(.16,.2,.04);
    const seam = B.MeshBuilder.CreateTorus("ball-seam",{diameter:.225,thickness:.009,tessellation:32},scene); seam.parent=ball; seam.rotation.x=.8; seam.material=seamMat; seam.isPickable=false;

    const glow = new B.GlowLayer("arena-glow",scene,{blurKernelSize:32}); glow.intensity=.25;
    const shadows = new B.ShadowGenerator(1024,key);
    shadows.useBlurExponentialShadowMap=true; shadows.blurKernel=16;
    shadows.bias = .0005; shadows.normalBias = .025;
    shadows.usePercentageCloserFiltering = true;
    shadows.filteringQuality = B.ShadowGenerator.QUALITY_MEDIUM;
    // Register the actual child meshes (not only their TransformNode roots) so
    // the players cast usable shadows on supported mobile and desktop devices.
    scene.meshes.forEach(mesh => {
      if (mesh.name.startsWith("player-") || mesh.name.startsWith("cpu-")) {
        shadows.addShadowCaster(mesh);
      }
    });
    // Stadium surfaces receive shadows; keep expensive crowd silhouettes unshadowed.
    scene.meshes.forEach(mesh => {
      if (mesh.name === "court" || mesh.name === "inner-court" || mesh.name === "court-apron") {
        mesh.receiveShadows = true;
      }
    });
    // Procedural athlete meshes are assembled from children; the generator is kept modest for mobile.
    scene.metadata = { player, cpu, ball, camera, court, shadows };
    return scene;
  }

  window.ArenaScene = { create };
})();