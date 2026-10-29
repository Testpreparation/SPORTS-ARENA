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

  window[API_KEY] = Object.freeze({ init, addModel, setCamera, show, hide, dispose });
})();
