/* Tennis match controller. The 3D scene owns simulation; this file owns controls and HUD. */
(()=>{'use strict';
let frame=null,stage=null,active=false,keys=new Set(),held=null,scoreText='0 - 0';
const $=id=>document.getElementById(id);
function post(type,data={}){try{frame?.contentWindow?.postMessage({type:'tennis-engine',action:type,...data},location.origin)}catch(_){}}
function button(label,action,cls=''){const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.action=action;b.className=cls;return b}
function style(el,css){Object.assign(el.style,css);return el}
function makeUI(){
 let ui=$('tennisEngineUI');if(ui)ui.remove();
 ui=document.createElement('div');ui.id='tennisEngineUI';
 style(ui,{position:'fixed',inset:'0',zIndex:'10001',pointerEvents:'none',color:'#fff',fontFamily:'system-ui,-apple-system,sans-serif',userSelect:'none'});
 const hud=style(document.createElement('div'),{position:'absolute',top:'max(12px,env(safe-area-inset-top))',left:'50%',transform:'translateX(-50%)',padding:'10px 18px',minWidth:'190px',textAlign:'center',border:'1px solid #ffffff55',borderRadius:'14px',background:'#081625d9',boxShadow:'0 8px 28px #0005',pointerEvents:'auto'});
 hud.id='tennisEngineScore';hud.innerHTML='<div style="font-size:10px;letter-spacing:2px;opacity:.75">TENNIS MATCH</div><strong style="font-size:25px">0 - 0</strong><div id="tennisEngineStatus" style="font-size:12px;margin-top:3px">サーブしてください</div>';ui.appendChild(hud);
 const exit=button('✕ 終了','quit');style(exit,{position:'absolute',top:'max(12px,env(safe-area-inset-top))',left:'max(12px,env(safe-area-inset-left))',pointerEvents:'auto',padding:'10px 14px',border:'1px solid #ffffff55',borderRadius:'12px',background:'#081625d9',color:'#fff',fontWeight:'800'});
 ui.appendChild(exit);
 const controls=style(document.createElement('div'),{position:'absolute',left:'max(16px,env(safe-area-inset-left))',bottom:'max(18px,env(safe-area-inset-bottom))',display:'flex',alignItems:'end',gap:'8px',pointerEvents:'auto'});
 const pad=style(document.createElement('div'),{display:'grid',gridTemplateColumns:'repeat(3,44px)',gridTemplateRows:'repeat(2,42px)',gap:'4px'});
 [['←','left',0,1],['→','right',2,1],['↑','up',1,0],['↓','down',1,1]].forEach(([label,act,x,y])=>{const b=button(label,act);style(b,{gridColumn:String(x+1),gridRow:String(y+1),border:'1px solid #ffffff55',borderRadius:'12px',background:'#0a1c2cbb',color:'#fff',fontSize:'18px',fontWeight:'800',touchAction:'none'});pad.appendChild(b);});
 controls.appendChild(pad);
 const hitBox=style(document.createElement('div'),{display:'grid',gridTemplateColumns:'repeat(2,minmax(76px,auto))',gap:'7px'});
 [['サーブ/打つ','hit'],['強打','power'],['ドロップ','drop'],['スライス','slice']].forEach(([label,act])=>{const b=button(label,act);style(b,{padding:'13px 12px',border:'1px solid #ffffff66',borderRadius:'13px',background:act==='hit'?'#1676d2dd':'#081625d9',color:'#fff',fontWeight:'800',fontSize:'13px',touchAction:'none'});hitBox.appendChild(b)});
 controls.appendChild(hitBox);ui.appendChild(controls);stage.appendChild(ui);
 ui.addEventListener('pointerdown',e=>{const b=e.target.closest('button[data-action]');if(!b)return;const a=b.dataset.action;if(a==='quit'){stop();window.dispatchEvent(new CustomEvent('tennis-engine-exit'));return}if(['left','right','up','down'].includes(a)){e.preventDefault();keys.add(a);post('move',{keys:[...keys]});return}if(['hit','power','drop','slice'].includes(a)){e.preventDefault();post('hit',{kind:a});}});
 ['pointerup','pointercancel','pointerleave'].forEach(type=>ui.addEventListener(type,e=>{if(e.target.closest('button[data-action]')){keys.clear();post('move',{keys:[]})}}));
}
function start(iframe,container){frame=iframe;stage=container;active=true;makeUI();frame.addEventListener('load',()=>post('start'),{once:true});if(frame.contentDocument?.readyState==='complete')post('start');}
function stop(){active=false;keys.clear();post('stop');$('tennisEngineUI')?.remove();frame=null;stage=null}
function setStatus(t){const e=$('tennisEngineStatus');if(e)e.textContent=t}
function updateScore(d){const e=$('tennisEngineScore');if(!e)return;const s=e.querySelector('strong');if(s)s.textContent=d.score||scoreText;scoreText=d.score||scoreText;setStatus(d.status||'ラリー中');}
window.addEventListener('message',e=>{if(!active||e.source!==frame?.contentWindow||e.origin!==location.origin)return;const d=e.data;if(!d||d.type!=='tennis-engine')return;if(d.action==='score')updateScore(d);if(d.action==='status')setStatus(d.text||'');if(d.action==='quit'){stop();}});
window.addEventListener('keydown',e=>{if(!active)return;const map={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down'};const k=map[e.key];if(k){keys.add(k);post('move',{keys:[...keys]});e.preventDefault()}if(e.code==='Space'){post('hit',{kind:e.shiftKey?'power':'hit'});e.preventDefault()}if(e.key==='Escape'){stop()}});
window.addEventListener('keyup',e=>{if(!active)return;const map={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down'};const k=map[e.key];if(k){keys.delete(k);post('move',{keys:[...keys]})}});
window.TennisEngine={start,stop};
})();