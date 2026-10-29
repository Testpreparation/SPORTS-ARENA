/* UI-only mode: 3D rendering, physics, ball/racket behavior, CPU and match engine removed. */
(()=>{'use strict';
const $=id=>document.getElementById(id), all=s=>[...document.querySelectorAll(s)];
const CFG={apiKey:'AIzaSyB85NfBhRRSLsLxhwewaJYJjWSPxLzaJKE',authDomain:'sports-app-2e1bb.firebaseapp.com',databaseURL:'https://sports-app-2e1bb-default-rtdb.firebaseio.com',projectId:'sports-app-2e1bb',storageBucket:'sports-app-2e1bb.firebasestorage.app',messagingSenderId:'614670493916',appId:'1:614670493916:web:2bc45bf2fc2fce2af2ec19'};
let db=null,user=null,roomRef=null,role='',name=localStorage.getItem('rs-nick')||'',sport='tennis',format='singles',listeners=[];
const hide=id=>{const e=$(id);if(e)e.hidden=true},show=id=>{const e=$(id);if(e)e.hidden=false};
function screen(ids){['menu','tournamentMenu','achievementPanel'].forEach(hide);show('menu');hide('homeActions');hide('playPanel');hide('formatMenu');hide('modeMenu');hide('friendPanel');hide('waitingPanel');if(ids.includes('menu')){show('homeActions');}ids.forEach(id=>{if($(id))show(id)});}
function msg(t){const e=$('roomStatus');if(e)e.textContent=t;const w=$('waitingStatus');if(w)w.textContent=t}
function setName(){const e=$('nickInput'),panel=$('nickSetup');if(e)e.value=name;if(panel){panel.hidden=false;panel.style.display='flex';panel.style.visibility='visible';panel.style.zIndex='100000'}}
function ensureFirebase(){if(db&&user)return Promise.resolve();if(!window.firebase)return Promise.reject(Error('Firebase SDKを読み込めません'));if(!firebase.apps.length)firebase.initializeApp(CFG);const auth=firebase.auth();db=firebase.database();return (auth.currentUser?Promise.resolve(auth.currentUser):auth.signInAnonymously().then(r=>r.user)).then(u=>{user=u;return u})}
function watch(ref,event,fn){ref.on(event,fn);listeners.push([ref,event,fn])}
function clearListeners(){listeners.forEach(([r,e,f])=>r.off(e,f));listeners=[]}
function renderRoom(code){show('waitingPanel');hide('friendPanel');hide('modeMenu');$('waitingCode').textContent=code;$('waitingCodeMini').textContent=code}
function setupChat(){if(!roomRef)return;show('chatFab');watch(roomRef.child('chat').limitToLast(20),'child_added',s=>{const m=s.val();if(!m)return;const ticker=$('chatTickerText');if(ticker)ticker.textContent=(m.name||'参加者')+'：'+String(m.text||'').slice(0,120);show('chatTicker')})}
function disconnect(){clearListeners();if(roomRef&&role==='guest')roomRef.child('guestId').remove().catch(()=>{});roomRef=null;role=''}
async function createRoom(){try{msg('Firebaseに接続中…');await ensureFirebase();disconnect();role='host';const code=String(Math.floor(100000+Math.random()*900000));const ref=db.ref('badminton_rooms/'+code);const result=await ref.transaction(v=>v===null?{hostId:user.uid,hostName:name||'プレイヤー',createdAt:Date.now(),status:'waiting',sport,format,hostTeam:'A',guestTeam:'B'}:undefined);if(!result.committed)throw Error('部屋番号が重複しました。もう一度お試しください');roomRef=ref;renderRoom(code);$('hostPlayerStatus').textContent=name||'あなた';$('guestPlayerStatus').textContent='参加待ち…';msg('部屋を作成しました。6桁の番号をフレンドに共有してください。');watch(ref.child('guestName'),'value',s=>{if(s.val())$('guestPlayerStatus').textContent=s.val()});watch(ref.child('guestId'),'value',s=>{if(s.val())msg('フレンドが接続しました。試合システムは削除されているため、待機・チャットのみ利用できます。')});setupChat()}catch(e){role='';msg('部屋を作成できませんでした：'+e.message)}}
async function joinRoom(){try{const code=($('roomCode').value||'').replace(/\D/g,'').slice(0,6);if(code.length!==6)throw Error('6桁の部屋番号を入力してください');msg('部屋を検索中…');await ensureFirebase();disconnect();role='guest';const ref=db.ref('badminton_rooms/'+code);const snap=await ref.once('value');if(!snap.exists()||!snap.child('hostId').exists())throw Error('部屋が見つかりません');const r=await ref.child('guestId').transaction(v=>v===null?user.uid:undefined);if(!r.committed)throw Error('この部屋は満員です');roomRef=ref;sport=snap.child('sport').val()||sport;format=snap.child('format').val()||format;await ref.child('guestName').set(name||'フレンド');renderRoom(code);msg('部屋主に接続しました。試合システムは削除されているため、待機・チャットのみ利用できます。');setupChat()}catch(e){role='';msg('参加できませんでした：'+e.message)}}
function bind(id,fn,event='click'){const e=$(id);if(e)e.addEventListener(event,fn)}
bind('nickConfirm',()=>{name=($('nickInput').value||'プレイヤー').trim().slice(0,12)||'プレイヤー';localStorage.setItem('rs-nick',name);hide('nickSetup');$('nm')&&($('nm').textContent=name);show('menu')});
bind('nickCancel',()=>{hide('nickSetup');show('menu')});
function openSportSelect(){['tournamentMenu','achievementPanel','formatMenu','modeMenu','friendPanel','waitingPanel'].forEach(hide);show('menu');hide('homeActions');show('playPanel');const menu=$('menu'),panel=$('playPanel');if(menu){menu.hidden=false;menu.style.display='flex';menu.style.visibility='visible';menu.style.opacity='1';menu.style.zIndex='10'}if(panel){panel.hidden=false;panel.style.display='block';panel.style.visibility='visible';panel.style.opacity='1';panel.style.color='#fff'}const home=document.querySelector('#menu .home');if(home){home.style.display='grid';home.style.visibility='visible';home.style.opacity='1'}}bind('playNav',openSportSelect);bind('friendNav',()=>{openSportSelect();msg('競技を選択してください。')});
bind('tournamentNav',()=>screen(['tournamentMenu']));bind('achievementNav',()=>screen(['achievementPanel']));
bind('playBack',()=>{const menu=$('menu');if(menu){menu.hidden=false;menu.style.display='flex';menu.style.visibility='visible';menu.style.opacity='1';menu.style.zIndex='10'}show('homeActions');hide('playPanel');hide('formatMenu');hide('modeMenu');hide('friendPanel');hide('waitingPanel')});bind('formatBack',()=>{hide('formatMenu');show('menu');show('playPanel');hide('homeActions')});bind('modeBack',()=>{hide('modeMenu');show('menu');show('playPanel');hide('homeActions')});bind('friendBack',()=>{show('modeChoices');hide('friendPanel')});
bind('singlesMode',()=>{format='singles';hide('formatMenu');hide('menu');show('modeMenu');show('modeChoices');hide('friendPanel')});bind('doublesMode',()=>{format='doubles';hide('formatMenu');hide('menu');show('modeMenu');show('modeChoices');hide('friendPanel')});
function openArenaPreview(){
  const stage=$('game3dStage');
  if(!stage){msg('3D表示エリアが見つかりません。');return;}
  hide('menu');hide('formatMenu');hide('modeMenu');hide('tournamentMenu');hide('achievementPanel');
  stage.innerHTML='';
  Object.assign(stage.style,{position:'fixed',inset:'0',width:'100vw',height:'100dvh',zIndex:'9998',background:'#0b0d12',display:'block'});
  stage.hidden=false;
  const frame=document.createElement('iframe');
  frame.src='./3d/stadium-scene.html';
  frame.title='3Dスタジアム';
  frame.setAttribute('allow','fullscreen');
  Object.assign(frame.style,{display:'block',width:'100%',height:'100%',border:'0',background:'#0b0d12'});
  stage.appendChild(frame);
  let back=$('arena3dBack');
  if(!back){
    back=document.createElement('button');back.id='arena3dBack';back.type='button';back.textContent='← メニューへ戻る';
    Object.assign(back.style,{position:'fixed',top:'max(12px,env(safe-area-inset-top))',left:'max(12px,env(safe-area-inset-left))',zIndex:'10000',padding:'11px 16px',border:'1px solid rgba(255,255,255,.35)',borderRadius:'12px',background:'rgba(12,22,34,.88)',color:'#fff',fontWeight:'800',fontSize:'14px'});
    back.addEventListener('click',()=>{stage.hidden=true;stage.innerHTML='';stage.style.display='none';hide('arena3dBack');show('menu');show('modeMenu');show('modeChoices');hide('friendPanel')});
    document.body.appendChild(back);
  }
  show('arena3dBack');
  msg('3Dスタジアムを表示しました。UIや試合ロジックとは分離した3Dシーンです。');
}
bind('cpuMode',openArenaPreview);bind('practiceMode',openArenaPreview);
bind('friendMode',()=>{hide('modeChoices');show('friendPanel')});all('[data-m]').forEach(b=>b.addEventListener('click',()=>{sport=b.dataset.m||'tennis';$('formatTitle').textContent=(sport==='tennis'?'🎾 テニス':'🏸 バドミントン')+'｜試合形式';hide('menu');hide('playPanel');show('formatMenu')}));bind('createRoom',createRoom);bind('joinRoom',joinRoom);
bind('waitingBack',()=>{disconnect();show('menu');hide('waitingPanel')});bind('copyRoomCode',()=>navigator.clipboard?.writeText($('waitingCode').textContent||'').catch(()=>{}));
bind('roomSportSelect',e=>{sport=e.target.value;if(roomRef&&role==='host')roomRef.child('sport').set(sport).catch(()=>{})},'change');
bind('randomTeams',()=>{if(!roomRef||role!=='host')return;const host=Math.random()<.5?'A':'B';roomRef.update({hostTeam:host,guestTeam:host==='A'?'B':'A'}).catch(()=>{})});
bind('chatFab',()=>show('chatPanel'));bind('chatClose',()=>hide('chatPanel'));bind('chatSend',async()=>{const input=$('chatInput'),text=(input.value||'').trim();if(!text||!roomRef)return;try{await roomRef.child('chat').push({name:name||'参加者',text:text.slice(0,120),at:Date.now()});input.value=''}catch(e){msg('チャット送信に失敗しました')}});
bind('chatForm',e=>{e.preventDefault();$('chatSend')?.click()});
bind('tournamentClose',()=>screen(['menu']));bind('achievementClose',()=>screen(['menu']));bind('tournamentCreateNav',()=>{hide('tournamentMenu');show('tournamentCreatePanel')});bind('tournamentJoinNav',()=>{hide('tournamentMenu');show('tournamentJoinPanel')});bind('tournamentCreateBack',()=>show('tournamentMenu'));bind('tournamentJoinBack',()=>show('tournamentMenu'));bind('tournamentLobbyBack',()=>show('tournamentMenu'));bind('tournamentBracketBack',()=>show('tournamentMenu'));bind('tournamentMatchBack',()=>show('tournamentBracketPanel'));bind('championClose',()=>hide('championCeremony'));bind('spectatorBack',()=>{hide('spectatorBar');show('tournamentBracketPanel')});
bind('fs',()=>{if(!matchMedia('(pointer:coarse)').matches)document.documentElement.requestFullscreen?.().catch(()=>{})});
bind('changeNickname',setName);bind('cacheRefreshBtn',()=>location.reload());bind('cacheLaterBtn',()=>hide('cacheNotice'));
all('button').forEach(b=>{if(['startMatch','tournamentPlayMatch','tournamentWatchMatch','startTournament','createTournament','joinTournament','tournamentResumeNav'].includes(b.id))b.addEventListener('click',()=>msg('試合システムは削除されています。画面構成のみ残しています。'))});
const splash=$('appSplash');setTimeout(()=>{if(splash)splash.hidden=true;if(!name)setName();else{hide('nickSetup');show('menu');$('nm')&&($('nm').textContent=name)}},500);
window.addEventListener('beforeunload',disconnect);
})();