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
 const controls=style(document.createElement('div'),{position:'absolute',inset:'auto 0 max(18px,env(safe-area-inset-bottom)) 0',display:'flex',justifyContent:'space-between',alignItems:'end',padding:'0 max(18px,env(safe-area-inset-left))',pointerEvents:'none',gap:'20px'});
 const joyWrap=style(document.createElement('div'),{width:'140px',height:'140px',position:'relative',pointerEvents:'auto',touchAction:'none',flex:'0 0 140px'});
 const joyBase=style(document.createElement('div'),{position:'absolute',inset:'8px',borderRadius:'50%',background:'rgba(8,25,42,.48)',border:'2px solid rgba(255,255,255,.48)',boxShadow:'inset 0 0 20px #0005'});
 const joyKnob=style(document.createElement('div'),{position:'absolute',width:'54px',height:'54px',left:'43px',top:'43px',borderRadius:'50%',background:'rgba(245,250,255,.85)',border:'2px solid #fff',boxShadow:'0 3px 12px #0006'});
 joyWrap.append(joyBase,joyKnob);controls.appendChild(joyWrap);
 const hitArea=style(document.createElement('div'),{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',pointerEvents:'auto',touchAction:'none'});
 const shotHint=style(document.createElement('div'),{fontSize:'11px',padding:'5px 9px',borderRadius:'10px',background:'#081625bb',color:'#fff'});shotHint.textContent='方向を入力して打つ';
 const hit=button('打つ','hit');style(hit,{width:'104px',height:'104px',borderRadius:'50%',border:'3px solid #ffffffbb',background:'linear-gradient(145deg,#2188ee,#0752a7)',color:'#fff',fontSize:'21px',fontWeight:'900',boxShadow:'0 6px 22px #0007',touchAction:'none'});
 hitArea.append(shotHint,hit);controls.appendChild(hitArea);ui.appendChild(controls);stage.appendChild(ui);
 let joyId=null,origin=null,aim={x:0,y:0},hitStart=0,hitTimer=null;
 const joyMove=ev=>{if(joyId!==ev.pointerId||!origin)return;const dx=ev.clientX-origin.x,dy=ev.clientY-origin.y,len=Math.hypot(dx,dy),scale=len>42?42/len:1;aim={x:Math.max(-1,Math.min(1,dx/42)),y:Math.max(-1,Math.min(1,-dy/42))};joyKnob.style.left=(43+dx*scale)+'px';joyKnob.style.top=(43+dy*scale)+'px';const k=[];if(aim.x<-.25)k.push('left');if(aim.x>.25)k.push('right');if(aim.y>.25)k.push('up');if(aim.y<-.25)k.push('down');keys=new Set(k);post('move',{keys:k,aim})};
 joyWrap.addEventListener('pointerdown',ev=>{ev.preventDefault();joyId=ev.pointerId;origin={x:ev.clientX,y:ev.clientY};joyWrap.setPointerCapture(ev.pointerId);joyMove(ev)});
 joyWrap.addEventListener('pointermove',joyMove);
 const joyEnd=ev=>{if(joyId!==ev.pointerId)return;joyId=null;origin=null;keys.clear();aim={x:0,y:0};joyKnob.style.left='43px';joyKnob.style.top='43px';post('move',{keys:[]})};
 joyWrap.addEventListener('pointerup',joyEnd);joyWrap.addEventListener('pointercancel',joyEnd);
 hit.addEventListener('pointerdown',ev=>{ev.preventDefault();hitStart=performance.now();hit.setPointerCapture(ev.pointerId);hit.style.transform='scale(.94)';hitTimer=setTimeout(()=>{shotHint.textContent='強打！'},420)});
 const hitEnd=ev=>{if(!hitStart)return;ev.preventDefault();const duration=performance.now()-hitStart;hitStart=0;clearTimeout(hitTimer);hit.style.transform='';shotHint.textContent='方向を入力して打つ';post('hit',{kind:duration>420?'power':'hit',aim})};
 hit.addEventListener('pointerup',hitEnd);hit.addEventListener('pointercancel',hitEnd);
 ui.querySelector('[data-action="quit"]').addEventListener('click',()=>{stop();window.dispatchEvent(new CustomEvent('tennis-engine-exit'))});
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