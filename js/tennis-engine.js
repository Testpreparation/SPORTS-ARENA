/* Tennis match controller. The 3D scene owns simulation; this file owns controls and HUD. */
(()=>{'use strict';
let frame=null,stage=null,active=false,keys=new Set(),held=null,scoreText='0 - 0',lastStatus='',serveChargeStart=0,serveCharging=false,statusTimer=0;
const $=id=>document.getElementById(id);
function post(type,data={}){try{frame?.contentWindow?.postMessage({type:'tennis-engine',action:type,...data},location.origin)}catch(_){}}
function button(label,action,cls=''){const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.action=action;b.className=cls;return b}
function style(el,css){Object.assign(el.style,css);return el}
function makeUI(){
 const hud=$('hud'),touch=$('touch'),score=$('score'),joy=$('joy'),knob=$('knob');
 const bs=$('bs'),bp=$('bp'),bd=$('bd'),mb=$('mb'),pause=$('pauseMenu'),meter=$('serveMeter'),meterFill=$('serveMeterFill');
 if(!hud||!touch||!score||!joy||!knob||!bs||!bp||!bd)throw new Error('BADMINTON-ARENA共通UIが見つかりません');
 hud.hidden=false;touch.hidden=false;
 Object.assign(hud.style,{zIndex:'10000',pointerEvents:'none'});
 Object.assign(touch.style,{zIndex:'10001',pointerEvents:'none'});
 if(mb){mb.hidden=false;mb.style.zIndex='10002';}if(pause)pause.style.zIndex='10003';
 score.innerHTML='<div class="sr summary compactSummary"><b>SET 0 - 0</b><i>GAME 0 - 0</i></div><div class="sr playerPoint"><b>あなた</b><u>0</u></div><div class="sr playerPoint"><b>CPU</b><u>0</u></div>';
 if(touch.dataset.tennisBound==='1')return;
 touch.dataset.tennisBound='1';
 let joyId=null,origin=null,aim={x:0,y:0},hitStarted=0,holdTimer=null,heldButton=null;
 const joyMove=ev=>{
  if(joyId!==ev.pointerId||!origin)return;
  const dx=ev.clientX-origin.x,dy=ev.clientY-origin.y,len=Math.hypot(dx,dy),scale=len>50?50/len:1;
  knob.style.transform='translate('+(dx*scale)+'px,'+(dy*scale)+'px)';
  aim={x:Math.max(-1,Math.min(1,dx/50)),y:Math.max(-1,Math.min(1,-dy/50))};
  const keys=[];if(aim.x<-.25)keys.push('left');if(aim.x>.25)keys.push('right');if(aim.y>.25)keys.push('up');if(aim.y<-.25)keys.push('down');
  post('move',{keys,aim});
 };
 joy.addEventListener('pointerdown',ev=>{ev.preventDefault();joyId=ev.pointerId;origin={x:ev.clientX,y:ev.clientY};joy.setPointerCapture(ev.pointerId);joyMove(ev)});
 joy.addEventListener('pointermove',joyMove);
 const joyEnd=ev=>{if(joyId!==ev.pointerId)return;joyId=null;origin=null;aim={x:0,y:0};knob.style.transform='';post('move',{keys:[]})};
 joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);
 function currentServePower(){const cycle=.8,elapsed=Math.max(0,(performance.now()-serveChargeStart)/1000),phase=(elapsed%cycle)/cycle,level=phase<.4?phase/.4:phase<.55?1:(1-phase)/.45;return .25+.75*Math.max(0,Math.min(1,level))}
 function updateServeMeter(){if(!serveCharging||!meterFill)return;const power=currentServePower();meterFill.style.height=(8+(power-.25)/.75*92)+'%';requestAnimationFrame(updateServeMeter)}
 function beginServeCharge(button,ev){if(!active||button.hidden)return;ev.preventDefault();heldButton=button;serveCharging=true;serveChargeStart=performance.now();try{button.setPointerCapture(ev.pointerId)}catch(_){}button.style.transform='scale(.94)';if(meter){meter.hidden=false;if(meterFill)meterFill.style.height='8%'}updateServeMeter()}
 function bindHit(button,kind){
  button.addEventListener('pointerdown',ev=>{if(button.hidden||!active)return;if(button===bs&&lastStatus==='サーブしてください'){beginServeCharge(button,ev);return}ev.preventDefault();heldButton=button;hitStarted=performance.now();try{button.setPointerCapture(ev.pointerId)}catch(_){}button.style.transform='scale(.94)';clearTimeout(holdTimer);holdTimer=setTimeout(()=>{if(heldButton===button&&kind==='hit')button.textContent='強打！'},420)});
  const finish=ev=>{if(heldButton!==button)return;ev.preventDefault();if(serveCharging){const power=currentServePower();serveCharging=false;heldButton=null;button.style.transform='';button.textContent='サーブ';if(meter)meter.hidden=true;post('hit',{kind:'hit',aim,power});return}const elapsed=performance.now()-hitStarted;heldButton=null;hitStarted=0;clearTimeout(holdTimer);button.style.transform='';button.textContent=lastStatus.includes('サーブ')?'サーブ':(button===bs?'スイング':button===bp?'打撃':'ドロップ');post('hit',{kind:kind==='hit'&&elapsed>420?'power':kind,aim});};
  button.addEventListener('pointerup',finish);button.addEventListener('pointercancel',finish);
 }
 bindHit(bs,'hit');bindHit(bp,'power');bindHit(bd,'drop');
 if(mb)mb.addEventListener('click',()=>{if(pause){pause.hidden=false;post('pause')}});
 $('resumeMatch')?.addEventListener('click',()=>{if(pause)pause.hidden=true;post('resume')});
 $('quitMatch')?.addEventListener('click',()=>{stop();window.dispatchEvent(new CustomEvent('tennis-engine-exit'))});
}

function start(iframe,container){frame=iframe;stage=container;active=true;makeUI();frame.addEventListener('load',()=>post('start'),{once:true});if(frame.contentDocument?.readyState==='complete')post('start');}
function stop(){active=false;keys.clear();clearTimeout(statusTimer);statusTimer=0;lastStatus='';post('stop');$('hud')&&($('hud').hidden=true);$('touch')&&($('touch').hidden=true);$('mb')&&($('mb').hidden=true);$('pauseMenu')&&($('pauseMenu').hidden=true);frame=null;stage=null}
function setStatus(t,options={}){
 clearTimeout(statusTimer);statusTimer=0;
 lastStatus=String(t||'');
 const e=$('msg');if(e){e.textContent=lastStatus;e.hidden=!lastStatus;}
 if(lastStatus&&Number.isFinite(options.duration)&&options.duration>0){const expected=lastStatus;statusTimer=setTimeout(()=>{if(lastStatus===expected){lastStatus='';const msg=$('msg');if(msg)msg.textContent='';}},options.duration);}
 const bs=$('bs'),bp=$('bp'),bd=$('bd'),serving=lastStatus==='サーブしてください';
 if(bs)bs.textContent=serving?'サーブ':'スイング';
 if(bp)bp.hidden=serving;if(bd)bd.hidden=serving;
 const joy=$('joy');if(joy)joy.style.visibility=serving?'hidden':'visible';
 if(!serving){serveCharging=false;const meter=$('serveMeter');if(meter)meter.hidden=true;}
}
function updateScore(d){
 const score=$('score');if(!score)return;
 const sets=d.sets||[0,0],games=d.games||[0,0],pts=d.points||[0,0],labels=['0','15','30','40'];
 const point=(a,b,side)=>{if(a>=3&&b>=3){if(a===b)return '40';return (side===0?a>b:b>a)?'Ad':'40'}return labels[Math.min(side===0?a:b,3)]};
 const safe=n=>String(n).replace(/[<>&"]/g,'');
 const player=(n,p)=>'<div class="sr playerPoint"><b>'+safe(n)+'</b><u>'+p+'</u></div>';
 score.innerHTML='<div class="sr summary compactSummary"><b>SET '+sets[0]+' - '+sets[1]+'</b><i>GAME '+games[0]+' - '+games[1]+'</i></div>'+player(localStorage.getItem('rs-nick')||'あなた',point(pts[0],pts[1],0))+player('CPU',point(pts[0],pts[1],1));
 scoreText=d.score||scoreText;setStatus(d.status||'ラリー中',{duration:d.statusDuration});
}
window.addEventListener('message',e=>{if(!active||e.source!==frame?.contentWindow||e.origin!==location.origin)return;const d=e.data;if(!d||d.type!=='tennis-engine')return;if(d.action==='score')updateScore(d);if(d.action==='status')setStatus(d.text||'',{duration:d.duration});if(d.action==='quit'){stop();}});
window.addEventListener('keydown',e=>{if(!active)return;const map={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down'};const k=map[e.key];if(k){keys.add(k);post('move',{keys:[...keys]});e.preventDefault()}if(e.code==='Space'){post('hit',{kind:e.shiftKey?'power':'hit'});e.preventDefault()}if(e.key==='Escape'){const p=$('pauseMenu');if(p){p.hidden=!p.hidden;post(p.hidden?'resume':'pause')}else{stop();window.dispatchEvent(new CustomEvent('tennis-engine-exit'))}}});
window.addEventListener('keyup',e=>{if(!active)return;const map={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down'};const k=map[e.key];if(k){keys.delete(k);post('move',{keys:[...keys]})}});
window.TennisEngine={start,stop};
})();