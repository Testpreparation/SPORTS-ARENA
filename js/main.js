/* REAL TENNIS ARENA — application controller */
(function () {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const state = { mode: "singles", level: "normal", playing: false, scoreYou: 0, scoreCpu: 0, keys: new Set(), touchX: 0, touchY: 0, ballVelocity: null };
  let engine, scene, sceneData, toastTimer;

  function showScreen(id) {
    $$(".screen").forEach(el => {
      const active = el.id === id;
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-hidden", String(!active));
    });
    const home = id === "screen-home";
    $(".scene-vignette").style.opacity = home ? "1" : (id === "screen-gameplay" ? ".2" : ".45");
    if (sceneData && sceneData.camera) {
      sceneData.camera.alpha = home ? -Math.PI / 2 + .2 : -Math.PI / 2;
      sceneData.camera.beta = home ? 1.08 : 1.18;
      sceneData.camera.radius = home ? 21.5 : 19;
      sceneData.camera.setTarget(home ? new BABYLON.Vector3(0,1.4,0) : new BABYLON.Vector3(0,1,0));
    }
  }
  function toast(message) {
    const el = $("#toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }
  function updateScore() {
    $("#score-you").textContent = String(state.scoreYou);
    $("#score-cpu").textContent = String(state.scoreCpu);
  }
  function resetRally() {
    const ball = sceneData && sceneData.ball;
    if (!ball) return;
    ball.position.set((Math.random()-.5)*.9, 1.1, 4.5);
    state.ballVelocity = new BABYLON.Vector3((Math.random()-.5)*3.4, 5.8, -8.4);
    $("#point-state").textContent = "RALLY";
  }
  function startMatch(practice) {
    state.playing = true; state.scoreYou = 0; state.scoreCpu = 0; updateScore();
    $("#match-mode-label").textContent = practice ? "PRACTICE" : state.mode.toUpperCase();
    $("#game-hint").textContent = window.matchMedia("(pointer: coarse)").matches ? "左スティック：移動　・　A：打つ　・　B：ロブ" : "移動：WASD / 矢印キー　・　打球：SPACE　・　ロブ：L";
    showScreen("screen-gameplay");
    if (sceneData) {
      sceneData.player.position.set(0,0,7.2);
      sceneData.cpu.position.set(0,0,-7.2);
      resetRally();
    }
    toast(practice ? "練習モードの基盤を起動しました" : "試合画面を起動しました。操作と試合ルールは順次実装します。");
  }
  function returnHome() {
    state.playing = false; state.ballVelocity = null; showScreen("screen-home");
  }

  const playOpenButton = $("#play-open");
  if (playOpenButton) playOpenButton.addEventListener("click", () => showScreen("screen-setup"));
  $("#main-play-button").addEventListener("click", () => {
    $("#top-menu").hidden = true;
    $("#menu-toggle").setAttribute("aria-expanded", "false");
    showScreen("screen-setup");
  });
  $("#friend-match-button").addEventListener("click", () => {
    toast("フレンド対戦は準備中です。次の開発段階でオンライン対戦を実装します。");
  });
  const practiceOpenButton = $("#practice-open");
  if (practiceOpenButton) practiceOpenButton.addEventListener("click", () => startMatch(true));
  $("#setup-back").addEventListener("click", returnHome);
  $("#menu-toggle").addEventListener("click", () => {
    const menu = $("#top-menu");
    const open = menu.hidden;
    menu.hidden = !open;
    $("#menu-toggle").setAttribute("aria-expanded", String(open));
  });
  $("#settings-open").addEventListener("click", () => {
    $("#top-menu").hidden = true;
    $("#menu-toggle").setAttribute("aria-expanded", "false");
    showScreen("screen-settings");
  });
  document.addEventListener("pointerdown", e => {
    if (!e.target.closest(".top-actions")) {
      $("#top-menu").hidden = true;
      $("#menu-toggle").setAttribute("aria-expanded", "false");
    }
  });
  $("#settings-close").addEventListener("click", returnHome);
  $("#game-exit").addEventListener("click", returnHome);
  $("#match-start").addEventListener("click", () => startMatch(false));
  $$("[data-mode]").forEach(btn => btn.addEventListener("click", () => {
    $$("[data-mode]").forEach(el => el.classList.toggle("selected", el === btn));
    state.mode = btn.dataset.mode;
  }));
  $$("[data-level]").forEach(btn => btn.addEventListener("click", () => {
    $$("[data-level]").forEach(el => el.classList.toggle("selected", el === btn));
    state.level = btn.dataset.level;
  }));

  window.addEventListener("keydown", e => {
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
    state.keys.add(e.key.toLowerCase());
    if (!state.playing || e.repeat) return;
    if (e.code === "Space") hitBall(false);
    if (e.key.toLowerCase() === "l") hitBall(true);
    if (e.key === "Escape") returnHome();
  });
  window.addEventListener("keyup", e => state.keys.delete(e.key.toLowerCase()));
  window.addEventListener("blur", () => state.keys.clear());

  function hitBall(lob) {
    if (!state.playing || !sceneData) return;
    const ball = sceneData.ball;
    const player = sceneData.player;
    const distance = BABYLON.Vector3.Distance(player.position, new BABYLON.Vector3(ball.position.x,0,ball.position.z));
    // This is an interaction prototype only; full racket collision and shot tuning are a later milestone.
    if (distance < 7.5) {
      state.ballVelocity = new BABYLON.Vector3((Math.random()-.5)*4.5, lob ? 8.5 : 4.2, -(lob ? 8.2 : 12.2));
      $("#point-state").textContent = lob ? "LOB" : "SHOT";
      toast(lob ? "LOB" : "SHOT");
    } else {
      toast("ボールに近づいてから打ってみよう");
    }
  }
  $("#hit-button").addEventListener("pointerdown", e => { e.preventDefault(); hitBall(false); });
  $("#lob-button").addEventListener("pointerdown", e => { e.preventDefault(); hitBall(true); });

  const pad = $("#move-pad"), knob = $("#move-knob");
  let padPointer = null;
  function setPad(e) {
    const r = pad.getBoundingClientRect(), cx = r.left+r.width/2, cy = r.top+r.height/2;
    let dx = (e.clientX-cx)/(r.width*.33), dy = (e.clientY-cy)/(r.height*.33);
    const len = Math.hypot(dx,dy); if (len>1) { dx/=len; dy/=len; }
    state.touchX = dx; state.touchY = dy;
    knob.style.transform = "translate("+dx*23+"px,"+dy*23+"px)";
  }
  pad.addEventListener("pointerdown", e => { padPointer=e.pointerId; pad.setPointerCapture(e.pointerId); setPad(e); });
  pad.addEventListener("pointermove", e => { if (padPointer===e.pointerId) setPad(e); });
  function resetPad() { padPointer=null; state.touchX=0; state.touchY=0; knob.style.transform="translate(0,0)"; }
  pad.addEventListener("pointerup", resetPad); pad.addEventListener("pointercancel", resetPad);

  function update(dt, time) {
    if (!sceneData) return;
    const {player,cpu,ball} = sceneData;
    if (state.playing) {
      const x = (state.keys.has("d")||state.keys.has("arrowright")?1:0) - (state.keys.has("a")||state.keys.has("arrowleft")?1:0) + state.touchX;
      const z = (state.keys.has("s")||state.keys.has("arrowdown")?1:0) - (state.keys.has("w")||state.keys.has("arrowup")?1:0) + state.touchY;
      const inputLen = Math.hypot(x,z);
      if (inputLen>.05) {
        player.position.x = BABYLON.Scalar.Clamp(player.position.x + x/inputLen*dt*5.5,-4.4,4.4);
        player.position.z = BABYLON.Scalar.Clamp(player.position.z + z/inputLen*dt*5.5,1.1,10.8);
        player.rotation.y = Math.atan2(x,-z);
        const limbs = player.metadata.limbs;
        const swing = Math.sin(time*13)*.34;
        limbs[2].rotation.x = swing; limbs[3].rotation.x = -swing;
        limbs[0].rotation.z = -.23+Math.sin(time*13)*.12;
        limbs[1].rotation.z = -.45+Math.sin(time*13)*.12;
      } else {
        player.metadata.limbs[2].rotation.x *= .85;
        player.metadata.limbs[3].rotation.x *= .85;
      }
      // Lightweight CPU tracking placeholder; tactical positioning is part of the match-system milestone.
      const targetX = BABYLON.Scalar.Clamp(ball.position.x*.72,-3.8,3.8);
      cpu.position.x += (targetX-cpu.position.x)*Math.min(1,dt*1.8);
      cpu.position.z += (-7.2-cpu.position.z)*Math.min(1,dt*2);
      if (state.ballVelocity) {
        state.ballVelocity.y -= 9.81*dt;
        ball.position.addInPlace(state.ballVelocity.scale(dt));
        ball.rotation.x += dt*7; ball.rotation.z += dt*4;
        if (ball.position.y<.12 && state.ballVelocity.y<0) {
          ball.position.y=.12; state.ballVelocity.y *= -.57; state.ballVelocity.x *= .83; state.ballVelocity.z *= .83;
          if (Math.abs(state.ballVelocity.y)<1.3) {
            state.ballVelocity=null;
            if (Math.random()>.55) state.scoreYou++; else state.scoreCpu++;
            updateScore(); $("#point-state").textContent="POINT";
            setTimeout(() => { if(state.playing) resetRally(); },650);
          }
        }
        if (Math.abs(ball.position.x)>6 || Math.abs(ball.position.z)>13) {
          state.ballVelocity=null; setTimeout(() => {if(state.playing) resetRally();},500);
        }
      }
    } else {
      // Cinematic idle movement for the menu athlete and ball.
      player.position.x = Math.sin(time*.32)*.2;
      player.rotation.y = Math.PI + Math.sin(time*.24)*.035;
      ball.position.y = 1.1 + Math.sin(time*1.1)*.09;
      ball.rotation.x += dt*.3;
    }
  }

  async function boot() {
    const loading = $("#loading-screen");
    try {
      const canvas = $("#game-canvas");
      engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer:false, stencil:true, adaptToDeviceRatio:true, powerPreference:"high-performance"});
      scene = await window.ArenaScene.create(engine, canvas);
      sceneData = scene.metadata;
      engine.runRenderLoop(() => {
        if (!scene || scene.isDisposed) return;
        const dt = Math.min(engine.getDeltaTime()/1000,.04);
        update(dt, performance.now()/1000);
        scene.render();
      });
      window.addEventListener("resize", () => engine.resize());
      document.addEventListener("visibilitychange", () => { if(document.hidden) state.keys.clear(); });
      loading.classList.add("done");
      // Initial scene and controls are ready; gameplay systems will be expanded in later milestones.
    } catch (err) {
      console.error(err);
      loading.classList.add("done");
      toast("3Dの読み込みに失敗しました。通信環境を確認して再読み込みしてください。");
    }
  }
  boot();
})();