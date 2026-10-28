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

    const floor = B.MeshBuilder.CreateGround("stadium-floor", {width:48,height:36}, scene); floor.position.y = -.11; floor.material = darkMat; floor.isPickable = false;
    const court = B.MeshBuilder.CreateGround("court", {width:10.97,height:23.77}, scene); court.position.y = 0; court.material = courtMat; court.isPickable = false;
    const playing = B.MeshBuilder.CreateGround("inner-court", {width:8.23,height:23.77}, scene); playing.position.y = .008; playing.material = courtInner; playing.isPickable = false;

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

    // Stadium bowl: repeated dark seating tiers and soft glowing lamps.
    const seatMats = [material(scene,"seat-a","#17323b",.86),material(scene,"seat-b","#21434a",.86),material(scene,"seat-c","#102a33",.86)];
    for (let row=0; row<5; row++) {
      const zFar = -14.4 - row*.78;
      const zNear = 14.4 + row*.78;
      const h = .22 + row*.2;
      for (const z of [zFar,zNear]) {
        const stand = B.MeshBuilder.CreateBox("stand-row",{width:31+row*1.2,height:.24,depth:.65},scene);
        stand.position.set(0,h,z); stand.material = seatMats[row%seatMats.length]; stand.isPickable = false;
      }
    }
    for (let i=0;i<9;i++) {
      const x=-14+i*3.5;
      const lamp = new B.PointLight("stadium-lamp-"+i,new B.Vector3(x,8,-13),scene);
      lamp.diffuse = new B.Color3(.63,.86,1); lamp.intensity = 16; lamp.range=15;
      const bulb = B.MeshBuilder.CreateSphere("lamp-glow-"+i,{diameter:.18,segments:8},scene);
      bulb.position.set(x,8,-13); bulb.material = material(scene,"lamp-material-"+i,"#d7fff1",.25,.1); bulb.isPickable=false;
    }

    const player = createAthlete(scene,"player",0,7.2,{hair:"#25323b",shirt:"#e8f3e6",shorts:"#193c4a",accent:"#d7ff55"},Math.PI);
    const cpu = createAthlete(scene,"cpu",0,-7.2,{hair:"#472f27",shirt:"#ff835e",shorts:"#f0e7dc",accent:"#68e6df"},0);

    const ballMat = material(scene,"tennis-ball","#d8ff45",.42,.02);
    const ball = B.MeshBuilder.CreateSphere("tennis-ball",{diameter:.22,segments:20},scene);
    ball.material=ballMat; ball.position.set(0,1.1,4.6); ball.isPickable=false;
    const seamMat = new B.StandardMaterial("ball-seam",scene); seamMat.diffuseColor=new B.Color3(.94,1,.65); seamMat.emissiveColor=new B.Color3(.16,.2,.04);
    const seam = B.MeshBuilder.CreateTorus("ball-seam",{diameter:.225,thickness:.009,tessellation:32},scene); seam.parent=ball; seam.rotation.x=.8; seam.material=seamMat; seam.isPickable=false;

    const glow = new B.GlowLayer("arena-glow",scene,{blurKernelSize:32}); glow.intensity=.25;
    const shadows = new B.ShadowGenerator(1024,key); shadows.useBlurExponentialShadowMap=true; shadows.blurKernel=16;
    shadows.addShadowCaster(player); shadows.addShadowCaster(cpu);
    // Procedural athlete meshes are assembled from children; the generator is kept modest for mobile.
    scene.metadata = { player, cpu, ball, camera, court, shadows };
    return scene;
  }

  window.ArenaScene = { create };
})();