/* =========================================================================
   BLOCKINO — game logic
   ========================================================================= */
(function(){
"use strict";

const APP_VERSION = '2.0.0';

/* ============================= CONFIG ============================= */
const COLS=8, ROWS=16;
const PIECE_DEFS={
  I:{matrix:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color:'#4ce0d2'},
  O:{matrix:[[1,1],[1,1]], color:'#ffcb47'},
  T:{matrix:[[0,1,0],[1,1,1],[0,0,0]], color:'#b06bff'},
  L:{matrix:[[0,0,1],[1,1,1],[0,0,0]], color:'#ff9c47'},
  J:{matrix:[[1,0,0],[1,1,1],[0,0,0]], color:'#5b8cff'},
  S:{matrix:[[0,1,1],[1,1,0],[0,0,0]], color:'#6bdc7f'},
  Z:{matrix:[[1,1,0],[0,1,1],[0,0,0]], color:'#ff5c6c'},
};
const PIECE_TYPES=Object.keys(PIECE_DEFS);

const THEMES=[
  {level:1,   name:'شامگاه بنفش',   bgFrom:'#1a1035', bgTo:'#2d1b4e', accent:'#7c5cff', accent2:'#ff5ca8', board:'#150c2ecc'},
  {level:10,  name:'جنگل زمرد',     bgFrom:'#0d2b1f', bgTo:'#123a2a', accent:'#3ddc84', accent2:'#ffd447', board:'#0a1f16cc'},
  {level:20,  name:'آتشفشان سرخ',   bgFrom:'#2b0d0d', bgTo:'#3a1210', accent:'#ff5c3d', accent2:'#ffb347', board:'#220a0acc'},
  {level:35,  name:'اقیانوس یخی',   bgFrom:'#08202f', bgTo:'#0c3547', accent:'#4cc9f0', accent2:'#a3f7ff', board:'#061722cc'},
  {level:50,  name:'کهکشان صورتی',  bgFrom:'#2a0d2e', bgTo:'#3d1440', accent:'#ff6fd8', accent2:'#b06bff', board:'#1f0a22cc'},
  {level:75,  name:'طلای افسانه‌ای', bgFrom:'#2b2007', bgTo:'#3a2b0a', accent:'#ffcf47', accent2:'#ff9c47', board:'#211804cc'},
  {level:100, name:'الماس کیهانی',  bgFrom:'#121018', bgTo:'#1c1c2e', accent:'#e8e8ff', accent2:'#7c5cff', board:'#0c0c14cc'},
];

const BOARD_SKINS=[
  {id:'classic', name:'کلاسیک', unlock:1},
  {id:'neon',    name:'نئون',   unlock:25},
];

const AVATARS=[
  {id:'g1', emoji:'👧', unlock:1}, {id:'g2', emoji:'👩‍🎤', unlock:1},
  {id:'g3', emoji:'🧚‍♀️', unlock:15}, {id:'g4', emoji:'👸', unlock:25},
  {id:'g5', emoji:'🧙‍♀️', unlock:40}, {id:'g6', emoji:'🦸‍♀️', unlock:60},
  {id:'b1', emoji:'👦', unlock:1}, {id:'b2', emoji:'🧑‍🚀', unlock:1},
  {id:'b3', emoji:'🧙‍♂️', unlock:15}, {id:'b4', emoji:'🤴', unlock:25},
  {id:'b5', emoji:'🦸‍♂️', unlock:40}, {id:'b6', emoji:'🥷', unlock:60},
  {id:'g7', emoji:'👑', unlock:100}, {id:'b7', emoji:'🐉', unlock:100},
];

const TUTORIAL_STEPS=[
  'قطعه از بالای صفحه می‌آید.',
  'قطعه خودش به سمت پایین حرکت می‌کند.',
  'با دکمه ⬅️ یا Swipe چپ، قطعه را به چپ حرکت بده.',
  'با دکمه ➡️ یا Swipe راست، قطعه را به راست حرکت بده.',
  'با دکمه 🔄 یا Tap روی صفحه، قطعه را بچرخان.',
  'با Swipe سریع به پایین، Hard Drop انجام بده.',
  'با دکمه ⏳ می‌توانی یک قطعه را Hold کنی و بعداً از آن استفاده کنی.',
  'قطعه بعدی همیشه در پنل Next نمایش داده می‌شود.',
  'یک ردیف کامل را بساز تا به‌صورت خودکار حذف شود.',
  'برای هر ردیف، امتیاز و XP دریافت می‌کنی؛ Comboهای پی‌درپی امتیاز بیشتری می‌دهند.',
  'با جمع‌آوری XP، Level تو تا سقف ۱۰۰ بالاتر می‌رود و جوایز تازه باز می‌شوند. موفق باشی!',
];

const LINE_SCORE=[0,100,300,600,1000];
const LINE_XP=[0,10,25,50,100];

const LEVEL_MILESTONES=[
  {lv:10, label:'تم جدید: جنگل زمرد'},
  {lv:15, label:'آواتار جدید باز می‌شود'},
  {lv:20, label:'تم جدید: آتشفشان سرخ'},
  {lv:25, label:'پوسته زمین بازی جدید: نئون'},
  {lv:30, label:'افکت ویژه فعال می‌شود'},
  {lv:35, label:'تم جدید: اقیانوس یخی'},
  {lv:40, label:'آواتار جدید باز می‌شود'},
  {lv:50, label:'تم ویژه: کهکشان صورتی'},
  {lv:60, label:'آواتار جدید باز می‌شود'},
  {lv:75, label:'تم و افکت ویژه: طلای افسانه‌ای'},
  {lv:100, label:'🏆 جایزه افسانه‌ای Blockino: تم الماس کیهانی'},
];

const ACHIEVEMENTS=[
  {id:'first_game',  ic:'🎮', name:'اولین بازی',  desc:'اولین بازی خود را انجام بده', check:()=>progress.gamesPlayed>=1},
  {id:'first_line',  ic:'➖', name:'اولین خط',    desc:'یک خط را پاک کن',              check:()=>progress.linesCleared>=1},
  {id:'first_tetris',ic:'🟪', name:'اولین Tetris',desc:'یک Tetris انجام بده',          check:()=>progress.tetrisCount>=1},
  {id:'combo5',      ic:'🔥', name:'Combo x5',    desc:'به Combo x5 برس',              check:()=>progress.bestCombo>=5},
  {id:'combo10',     ic:'💥', name:'Combo x10',   desc:'به Combo x10 برس',             check:()=>progress.bestCombo>=10},
  {id:'score1000',   ic:'⭐', name:'Score 1,000', desc:'۱٬۰۰۰ امتیاز کسب کن',          check:()=>progress.bestScore>=1000},
  {id:'score10000',  ic:'🌟', name:'Score 10,000',desc:'۱۰٬۰۰۰ امتیاز کسب کن',         check:()=>progress.bestScore>=10000},
  {id:'level10',     ic:'🥉', name:'Level 10',    desc:'به Level 10 برس',              check:()=>progress.level>=10},
  {id:'level50',     ic:'🥈', name:'Level 50',    desc:'به Level 50 برس',              check:()=>progress.level>=50},
  {id:'level100',    ic:'🥇', name:'Level 100',   desc:'به Level 100 برس',             check:()=>progress.level>=100},
];

const MISSION_POOL=[
  {id:'lines',  build:()=>({target:15+Math.floor(Math.random()*11)}), label:t=>`پاک کردن ${t} خط`,               xp:50},
  {id:'combo',  build:()=>({target:5}),                                label:t=>`رسیدن به Combo x${t}`,           xp:40},
  {id:'tetris', build:()=>({target:1}),                                label:t=>`انجام ${t} Tetris`,              xp:60},
  {id:'score',  build:()=>({target:1500+Math.floor(Math.random()*2500)}), label:t=>`کسب ${t} امتیاز در یک بازی`, xp:50},
  {id:'games',  build:()=>({target:2+Math.floor(Math.random()*3)}),   label:t=>`انجام ${t} بازی`,                 xp:35},
];

/* ============================= STORAGE ============================= */
/* Real, standalone browser storage (localStorage) — works in any browser, offline,
   after reload, after the tab/app is closed and reopened, and once wrapped as an APK.
   (Not window.storage — that API only exists inside Claude's own artifact sandbox and
   would silently fail to persist anything in the real, deployed game.) */
async function loadJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    if(raw!=null) return JSON.parse(raw);
  }catch(e){}
  return fallback;
}
async function saveJSON(key, obj){
  try{ localStorage.setItem(key, JSON.stringify(obj)); }
  catch(e){ console.error('save failed', e); }
}

let profile = null;               // {name, avatar}
let progress = {level:1, xp:0, bestScore:0, totalScore:0, gamesPlayed:0, linesCleared:0, bestCombo:0, tetrisCount:0, perfectClears:0, playTimeSec:0};
let settings = {
  music:true, sfx:true, volume:80,
  vibration:true, autoPause:true, ghost:true, showNext:true, showHold:true,
  animQuality:'high', particles:true, performanceMode:'auto',
  boardSkin:'classic', selectedTheme:null,
};
let tutorialSeen = false;
let achievementsState = {unlocked:{}};
let missionsState = {date:'', list:[], dailyStats:{lines:0,bestCombo:0,tetris:0,bestScore:0,games:0}};
let dailyRewardState = {streak:0, lastClaimDate:''};
let supportMessages = [];
let missionsDirty=false;

/* ============================= AUDIO ============================= */
let audioCtx=null, musicTimer=null;
function ensureAudio(){
  if(!audioCtx){ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }
  if(audioCtx.state==='suspended') audioCtx.resume();
}
function tone(freq,duration=0.09,type='sine',vol=0.16,delay=0){
  if(!settings.sfx) return;
  try{
    ensureAudio();
    const t0=audioCtx.currentTime+delay;
    const osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
    osc.type=type; osc.frequency.setValueAtTime(freq,t0);
    const v = vol * ((settings.volume==null?80:settings.volume)/100);
    gain.gain.setValueAtTime(v,t0);
    gain.gain.exponentialRampToValueAtTime(0.001,t0+duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t0); osc.stop(t0+duration+0.02);
  }catch(e){}
}
const SFX={
  move:()=>tone(300,0.05,'square',0.1),
  rotate:()=>tone(420,0.07,'square',0.12),
  softdrop:()=>tone(260,0.04,'square',0.08),
  harddrop:()=>{ tone(180,0.05,'square',0.14); tone(90,0.09,'triangle',0.12,0.03); },
  lock:()=>tone(140,0.09,'triangle',0.15),
  click:()=>tone(500,0.05,'sine',0.1),
  clear:(n)=>{ const base=[520,660,780,940][Math.min(n-1,3)]; tone(base,0.14,'sine',0.2); tone(base*1.5,0.16,'sine',0.14,0.06); },
  combo:(c)=>{ for(let i=0;i<Math.min(c,4);i++) tone(600+i*90,0.08,'square',0.12,i*0.05); },
  xp:()=>tone(920,0.06,'sine',0.1),
  levelup:()=>{ [523,659,784,1047].forEach((f,i)=>tone(f,0.16,'sine',0.18,i*0.11)); },
  achievement:()=>{ [660,880,1108].forEach((f,i)=>tone(f,0.14,'triangle',0.16,i*0.09)); },
  reward:()=>{ [523,784,1047].forEach((f,i)=>tone(f,0.12,'sine',0.15,i*0.07)); },
  newrecord:()=>{ [784,988,1175,1568].forEach((f,i)=>tone(f,0.18,'sine',0.18,i*0.1)); },
  gameover:()=>{ [400,320,240,160].forEach((f,i)=>tone(f,0.22,'sawtooth',0.14,i*0.14)); },
};
function startMusic(){
  stopMusic();
  if(!settings.music) return;
  const pattern=[392,466,523,466,392,349,392,523];
  let i=0;
  musicTimer=setInterval(()=>{
    if(settings.music) tone(pattern[i%pattern.length],0.5,'sine',0.035);
    i++;
  },900);
}
function stopMusic(){ if(musicTimer){ clearInterval(musicTimer); musicTimer=null; } }
function vibrate(pattern){
  if(!settings.vibration) return;
  try{ if(navigator.vibrate) navigator.vibrate(pattern); }catch(e){}
}

/* ============================= PERFORMANCE TIER ============================= */
let PERF_TIER='high';
function computePerfTier(){
  if(settings.performanceMode!=='auto') return settings.performanceMode;
  const cores = navigator.hardwareConcurrency||4;
  const dpr = window.devicePixelRatio||1;
  if(cores<=2 || dpr>=3) return 'low';
  if(cores<=4) return 'medium';
  return 'high';
}
function applyPerfClass(){
  PERF_TIER=computePerfTier();
  document.body.classList.remove('perf-low','perf-medium','perf-high');
  document.body.classList.add('perf-'+PERF_TIER);
}

/* ============================= GAME STATE ============================= */
let board, current, history=[], score=0, xp=0, level=1, combo=0, maxCombo=0;
let nextType=null, holdType=null, holdUsed=false;
let lastClearWasTetris=false, linesThisGame=0, newRecordShownThisGame=false;
let dropTimer=0, state='loading', lastTime=0;
let clearingRows=[], clearStart=0;
let canvas, ctx, CELL=24;
let playTimeAccum=0;

function emptyBoard(){ return Array.from({length:ROWS},()=>Array(COLS).fill(null)); }
function topmostRow(m){ for(let r=0;r<m.length;r++){ if(m[r].some(v=>v)) return r; } return 0; }
function newPiece(type){
  const def=PIECE_DEFS[type];
  const m=def.matrix.map(row=>row.slice());
  const col=Math.floor((COLS-m[0].length)/2);
  const row=-topmostRow(m);
  return {type, matrix:m, color:def.color, row, col};
}
function rotateMatrix(m){
  const n=m.length, r=Array.from({length:n},()=>Array(n).fill(0));
  for(let i=0;i<n;i++) for(let j=0;j<n;j++) r[j][n-1-i]=m[i][j];
  return r;
}
function collides(m, row, col){
  for(let r=0;r<m.length;r++){
    for(let c=0;c<m[r].length;c++){
      if(!m[r][c]) continue;
      const br=row+r, bc=col+c;
      if(bc<0||bc>=COLS||br>=ROWS) return true;
      if(br>=0 && board[br][bc]) return true;
    }
  }
  return false;
}
function colHeights(){
  const h=new Array(COLS).fill(0);
  for(let c=0;c<COLS;c++) for(let r=0;r<ROWS;r++){ if(board[r][c]){ h[c]=ROWS-r; break; } }
  return h;
}
function countHoles(){
  let holes=0;
  for(let c=0;c<COLS;c++){
    let seen=false;
    for(let r=0;r<ROWS;r++){ if(board[r][c]) seen=true; else if(seen) holes++; }
  }
  return holes;
}
function rowGaps(){
  const infos=[];
  for(let r=0;r<ROWS;r++){
    let n=0;
    for(let c=0;c<COLS;c++) if(!board[r][c]) n++;
    if(n>0 && n<=4) infos.push(n);
  }
  return infos;
}
function chooseNextType(){
  const weights={}; PIECE_TYPES.forEach(t=>weights[t]=1);
  const heights=colHeights();
  const avgH=heights.reduce((a,b)=>a+b,0)/COLS;
  const holes=countHoles();
  rowGaps().forEach(n=>{
    if(n===1) PIECE_TYPES.forEach(t=>{ if(t!=='O') weights[t]+=0.45; });
    else if(n===2){ weights.O+=1; weights.I+=0.25; }
    else if(n<=4) weights.I+=0.5;
  });
  if(avgH>ROWS*0.55){ weights.I+=0.7; weights.O+=0.35; weights.S=Math.max(0.2,weights.S-0.35); weights.Z=Math.max(0.2,weights.Z-0.35); }
  if(holes>6) weights.I+=0.4;
  if(history.length>=2 && history[history.length-1]===history[history.length-2]) weights[history[history.length-1]]*=0.15;
  else if(history.length>=1) weights[history[history.length-1]]*=0.55;
  const total=Object.values(weights).reduce((a,b)=>a+b,0);
  let r=Math.random()*total;
  for(const t of PIECE_TYPES){ r-=weights[t]; if(r<=0) return t; }
  return PIECE_TYPES[PIECE_TYPES.length-1];
}

function spawnPiece(){
  const type = nextType!==null ? nextType : chooseNextType();
  history.push(type); if(history.length>6) history.shift();
  current=newPiece(type);
  nextType=chooseNextType();
  holdUsed=false;
  renderNextCanvas();
  updateHoldButtonState();
  if(collides(current.matrix,current.row,current.col)){ gameOver(); }
}

function xpToNext(lv){ return 100 + (lv-1)*40; }
function dropInterval(lv){ return Math.max(120, 900-(lv-1)*7); }
function levelMultiplier(lv){ return 1 + (lv-1)*0.01; }

function addScore(v){
  score+=v; progress.totalScore+=v;
  document.getElementById('hud-score').textContent=score;
  checkNewRecord();
}

async function addXP(v){
  xp+=v;
  let leveled=false, newLv=level;
  while(level<100 && xp>=xpToNext(level)){
    xp-=xpToNext(level); level++; leveled=true; newLv=level;
  }
  updateHUD();
  if(leveled){
    SFX.levelup(); vibrate([20,20,20]); showCenterFX('LEVEL UP! '+newLv,'fx-level'); toast('⭐ Level '+newLv+'!');
    applyThemeState(); applyBoardSkin();
    const th=THEMES.find(t=>t.level===newLv);
    if(th) toast('🎨 تم جدید باز شد: '+th.name);
    AVATARS.forEach(a=>{ if(a.unlock===newLv) toast('👤 آواتار جدید باز شد!'); });
    if(newLv===25) toast('🧩 پوسته زمین بازی جدید باز شد: نئون');
    if(newLv===30) toast('✨ افکت ویژه فعال شد');
    if(newLv===75) toast('✨ افکت ویژه بیشتر فعال شد');
    if(newLv===100){
      toast('🏆 جایزه افسانه‌ای Blockino باز شد!');
      spawnConfetti(40); SFX.achievement();
    }
    progress.level=level; progress.xp=xp;
    await saveJSON('blockino-progress', progress);
    await checkAchievements();
  }
}

function themeForLevel(lv){ let t=THEMES[0]; for(const th of THEMES) if(lv>=th.level) t=th; return t; }
function applyTheme(th){
  const r=document.documentElement.style;
  r.setProperty('--bg-from',th.bgFrom); r.setProperty('--bg-to',th.bgTo);
  r.setProperty('--accent',th.accent); r.setProperty('--accent2',th.accent2); r.setProperty('--board-bg',th.board);
}
function applyThemeState(){
  let th;
  if(settings.selectedTheme!=null){
    const found=THEMES.find(t=>t.level===settings.selectedTheme);
    th = (found && level>=found.level) ? found : themeForLevel(level);
  } else th=themeForLevel(level);
  applyTheme(th);
}
function applyBoardSkin(){
  const frame=document.getElementById('board-frame');
  frame.classList.toggle('skin-neon', settings.boardSkin==='neon' && level>=25);
}

function updateHUD(){
  document.getElementById('hud-level').textContent='Level '+level;
  document.getElementById('hud-best').textContent=Math.max(progress.bestScore,score);
  document.getElementById('hud-combo').textContent=combo;
  const pct=Math.min(100, Math.round((xp/xpToNext(level))*100));
  document.getElementById('xpbar').style.width=pct+'%';
  document.getElementById('hud-combo-chip').classList.toggle('combo-active', combo>1);
}

function toast(msg){
  const wrap=document.getElementById('toast-wrap');
  const el=document.createElement('div');
  el.className='toast'; el.textContent=msg;
  wrap.appendChild(el);
  setTimeout(()=>el.remove(),2200);
}
function showCenterFX(text,cls){
  const wrap=document.getElementById('center-fx-wrap');
  const el=document.createElement('div');
  el.className='center-fx '+cls;
  el.textContent=text;
  wrap.appendChild(el);
  setTimeout(()=>el.remove(),950);
}
function showAchvBanner(a){
  const wrap=document.getElementById('achv-banner-wrap');
  const el=document.createElement('div');
  el.className='achv-banner';
  const ic=document.createElement('span'); ic.className='ic'; ic.textContent=a.ic;
  const tx=document.createElement('span'); tx.className='tx';
  const b=document.createElement('b'); b.textContent='دستاورد باز شد';
  const sp=document.createElement('span'); sp.textContent=a.name;
  tx.appendChild(b); tx.appendChild(sp);
  el.appendChild(ic); el.appendChild(tx);
  wrap.appendChild(el);
  setTimeout(()=>el.remove(),3200);
}
function shakeBoard(){
  const el=document.getElementById('board-frame');
  el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
}
function spawnConfetti(n){
  if(!settings.particles || PERF_TIER==='low' || settings.animQuality==='low') return;
  if(PERF_TIER==='medium') n=Math.round(n*0.5);
  const colors=['#7c5cff','#ff5ca8','#ffc247','#3ddc84','#4cc9f0'];
  for(let i=0;i<n;i++){
    const el=document.createElement('div');
    el.className='confetti-piece';
    el.style.left=(Math.random()*100)+'vw';
    el.style.background=colors[i%colors.length];
    el.style.animationDuration=(1.6+Math.random()*1.2)+'s';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),3200);
  }
}

/* ---------- movement ---------- */
function tryMove(dc){
  if(state!=='playing') return;
  if(!collides(current.matrix,current.row,current.col+dc)){ current.col+=dc; SFX.move(); }
}
function tryRotate(){
  if(state!=='playing') return;
  const m=rotateMatrix(current.matrix);
  const kicks=[0,-1,1,-2,2];
  for(const k of kicks){
    if(!collides(m,current.row,current.col+k)){
      current.matrix=m; current.col+=k; SFX.rotate(); return;
    }
  }
}
function softDropStep(){
  if(state!=='playing') return;
  if(!collides(current.matrix,current.row+1,current.col)){
    current.row++; addScore(1); dropTimer=0; SFX.softdrop();
  } else { lockAndContinue(); }
}
function hardDrop(){
  if(state!=='playing') return;
  let dist=0;
  while(!collides(current.matrix,current.row+1,current.col)){ current.row++; dist++; }
  if(dist>0) addScore(dist*2);
  SFX.harddrop(); vibrate(15);
  dropTimer=0;
  lockAndContinue();
}
function holdPiece(){
  if(state!=='playing' || !settings.showHold || holdUsed) return;
  SFX.click(); vibrate(8);
  if(holdType===null){
    holdType=current.type;
    current=newPiece(nextType);
    nextType=chooseNextType();
  } else {
    const t=holdType; holdType=current.type; current=newPiece(t);
  }
  holdUsed=true;
  renderHoldCanvas(); renderNextCanvas(); updateHoldButtonState();
  if(collides(current.matrix,current.row,current.col)) gameOver();
}
function updateHoldButtonState(){
  const btn=document.getElementById('btn-hold');
  const panel=document.getElementById('hold-panel-tap');
  if(btn) btn.classList.toggle('disabled', holdUsed || !settings.showHold);
  if(panel) panel.classList.toggle('used', holdUsed);
}

async function lockAndContinue(){
  const m=current.matrix;
  for(let r=0;r<m.length;r++) for(let c=0;c<m[r].length;c++){
    if(m[r][c]){ const br=current.row+r, bc=current.col+c; if(br>=0) board[br][bc]=current.color; }
  }
  SFX.lock(); vibrate(10); addScore(2);

  const fullRows=[];
  for(let r=0;r<ROWS;r++) if(board[r].every(v=>v)) fullRows.push(r);

  if(fullRows.length>0){
    state='clearing'; clearingRows=fullRows; clearStart=performance.now();
    const n=fullRows.length;
    const mult=levelMultiplier(level);
    const base=LINE_SCORE[n]||0;
    const lineScore=Math.round(base*mult);
    const isTetris = n===4;
    SFX.clear(n);
    addScore(lineScore);

    let b2bBonus=0;
    if(isTetris && lastClearWasTetris){
      b2bBonus=Math.round(base*0.5*mult);
      addScore(b2bBonus);
      showCenterFX('BACK-TO-BACK!','fx-tetris');
    }
    await addXP(LINE_XP[n]||0);

    combo++; maxCombo=Math.max(maxCombo,combo);
    progress.bestCombo=Math.max(progress.bestCombo,maxCombo);
    if(combo>1){
      SFX.combo(combo);
      addScore(combo*20);
      await addXP(combo*5);
    }
    updateHUD();

    if(isTetris){ showCenterFX('TETRIS!','fx-tetris'); vibrate([30,40,30]); shakeBoard(); spawnConfetti(14); }
    else { const labels={1:'SINGLE',2:'DOUBLE',3:'TRIPLE'}; showCenterFX(labels[n]||'','fx-single'); }
    if(combo===2) showCenterFX('COMBO x2','fx-combo');
    else if(combo===3) showCenterFX('COMBO x3','fx-combo');
    else if(combo>=4) showCenterFX('COMBO x'+combo,'fx-combo');

    lastClearWasTetris=isTetris;
    linesThisGame+=n;
    progress.linesCleared+=n;
    if(isTetris) progress.tetrisCount++;
    dailyStatsBump({lines:n, tetris:isTetris?1:0, comboNow:combo, scoreNow:score});

    await new Promise(res=>setTimeout(res,260));
    const newBoard=board.filter((_,r)=>!fullRows.includes(r));
    while(newBoard.length<ROWS) newBoard.unshift(Array(COLS).fill(null));
    board=newBoard; clearingRows=[];

    const isEmpty=board.every(row=>row.every(v=>!v));
    if(isEmpty){
      progress.perfectClears=(progress.perfectClears||0)+1;
      const pcBonus=Math.round(2000*mult);
      addScore(pcBonus); await addXP(60);
      showCenterFX('PERFECT CLEAR!','fx-perfect'); SFX.combo(4); vibrate([40,30,40,30,60]); spawnConfetti(26);
    }
    await checkAchievements();
  } else {
    combo=0; lastClearWasTetris=false; updateHUD();
    dailyStatsBump({scoreNow:score});
  }
  if(state!=='menu' && state!=='gameover'){ state='playing'; spawnPiece(); }
}

function checkNewRecord(){
  if(score>progress.bestScore && !newRecordShownThisGame){
    showCenterFX('NEW RECORD!','fx-record'); SFX.newrecord(); vibrate([20,20,20,20,60]);
    newRecordShownThisGame=true;
  }
}

async function gameOver(){
  state='gameover';
  stopMusic(); SFX.gameover();
  const isRecord = score>progress.bestScore;
  progress.bestScore=Math.max(progress.bestScore, score);
  progress.gamesPlayed+=1;
  await saveJSON('blockino-progress', progress);
  dailyStatsBump({games:1, scoreNow:score});
  flushMissionsIfDirty();
  await checkAchievements();

  document.getElementById('go-title').textContent = isRecord ? '🏆 پایان بازی — رکورد جدید!' : 'پایان بازی';
  document.getElementById('go-score').textContent=score;
  document.getElementById('go-best').textContent=progress.bestScore;
  document.getElementById('go-lines').textContent=linesThisGame;
  document.getElementById('go-xp').textContent=xp;
  document.getElementById('go-level').textContent=level;
  document.getElementById('go-combo').textContent=maxCombo;
  renderMissionsBadge(); renderRewardsBadge();
  show('ov-gameover');
}

/* ============================= MISSIONS ============================= */
function pad2(n){ return n<10?'0'+n:''+n; }
function todayStr(){ const d=new Date(); return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }
function yesterdayStr(){ const d=new Date(); d.setDate(d.getDate()-1); return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }

function generateMissions(){
  const shuffled=[...MISSION_POOL].sort(()=>Math.random()-0.5).slice(0,3);
  return shuffled.map(m=>{ const b=m.build(); return {id:m.id, target:b.target, progress:0, done:false, claimed:false, xp:m.xp}; });
}
function ensureMissionsToday(){
  const t=todayStr();
  if(missionsState.date!==t){
    missionsState={date:t, list:generateMissions(), dailyStats:{lines:0,bestCombo:0,tetris:0,bestScore:0,games:0}};
    saveJSON('blockino-missions', missionsState);
  }
}
function updateMissionsProgress(){
  const ds=missionsState.dailyStats;
  missionsState.list.forEach(m=>{
    let val=0;
    if(m.id==='lines') val=ds.lines;
    else if(m.id==='combo') val=ds.bestCombo;
    else if(m.id==='tetris') val=ds.tetris;
    else if(m.id==='score') val=ds.bestScore;
    else if(m.id==='games') val=ds.games;
    m.progress=Math.min(val,m.target);
    if(m.progress>=m.target) m.done=true;
  });
}
function dailyStatsBump(delta){
  ensureMissionsToday();
  const ds=missionsState.dailyStats;
  if(delta.lines) ds.lines+=delta.lines;
  if(delta.tetris) ds.tetris+=delta.tetris;
  if(delta.comboNow!=null) ds.bestCombo=Math.max(ds.bestCombo,delta.comboNow);
  if(delta.scoreNow!=null) ds.bestScore=Math.max(ds.bestScore,delta.scoreNow);
  if(delta.games) ds.games+=delta.games;
  updateMissionsProgress();
  missionsDirty=true;
  renderMissionsBadge();
}
function flushMissionsIfDirty(){ if(missionsDirty){ missionsDirty=false; saveJSON('blockino-missions', missionsState); } }

async function claimMission(id){
  const m=missionsState.list.find(x=>x.id===id);
  if(!m||!m.done||m.claimed) return;
  m.claimed=true;
  await addXP(m.xp);
  toast('🎯 مأموریت انجام شد! +'+m.xp+' XP');
  SFX.reward(); vibrate(20);
  await saveJSON('blockino-missions', missionsState);
  renderMissionsList(); renderMissionsBadge();
}
function renderMissionsList(){
  ensureMissionsToday();
  const defMap={}; MISSION_POOL.forEach(m=>defMap[m.id]=m);
  const wrap=document.getElementById('missions-list'); wrap.innerHTML='';
  missionsState.list.forEach(m=>{
    const def=defMap[m.id];
    const pct=Math.min(100,Math.round((m.progress/m.target)*100));
    const el=document.createElement('div');
    el.className='mission-item'+(m.done?' done':'')+(m.claimed?' claimed':'');
    el.innerHTML=
      '<div class="mission-top"><span>'+def.label(m.target)+'</span><span class="mission-reward">+'+m.xp+' XP</span></div>'+
      '<div class="mission-bar-wrap"><div class="mission-bar" style="width:'+pct+'%"></div></div>'+
      '<div class="mission-progress-text"><span>'+m.progress+' / '+m.target+'</span><span>'+(m.claimed?'دریافت شد ✅':(m.done?'آماده دریافت':''))+'</span></div>';
    if(m.done && !m.claimed){
      const btn=document.createElement('button');
      btn.className='btn btn-primary mission-claim';
      btn.textContent='دریافت جایزه';
      btn.addEventListener('click',()=>claimMission(m.id));
      el.appendChild(btn);
    }
    wrap.appendChild(el);
  });
}
function renderMissionsBadge(){
  ensureMissionsToday();
  const readyCount=missionsState.list.filter(m=>m.done&&!m.claimed).length;
  const badge=document.getElementById('badge-missions');
  badge.textContent=readyCount; badge.classList.toggle('hidden', readyCount===0);
}
function renderRewardsBadge(){
  const dailyReady = dailyRewardState.lastClaimDate!==todayStr();
  const rBadge=document.getElementById('badge-rewards');
  rBadge.textContent='●'; rBadge.classList.toggle('hidden', !dailyReady);
}

/* ============================= REWARDS ============================= */
async function claimDailyReward(){
  const t=todayStr();
  if(dailyRewardState.lastClaimDate===t) return;
  const y=yesterdayStr();
  dailyRewardState.streak = dailyRewardState.lastClaimDate===y ? dailyRewardState.streak+1 : 1;
  dailyRewardState.lastClaimDate=t;
  const xpGain=20+Math.min(dailyRewardState.streak,7)*10;
  await addXP(xpGain);
  await saveJSON('blockino-daily-reward', dailyRewardState);
  toast('🎁 جایزه روزانه دریافت شد! +'+xpGain+' XP');
  SFX.reward(); vibrate(25); spawnConfetti(16);
  renderRewardsScreen(); renderRewardsBadge();
}
function renderStreakRow(){
  const wrap=document.getElementById('streak-row'); wrap.innerHTML='';
  const streak=dailyRewardState.streak;
  const filledCount=Math.min(streak,7);
  for(let i=1;i<=7;i++){
    const el=document.createElement('div');
    el.className='streak-day'+(i<=filledCount?' filled':'')+(i===filledCount?' today':'');
    el.textContent=i<=filledCount?'✓':String(i);
    wrap.appendChild(el);
  }
  document.getElementById('streak-count').textContent='Streak: '+streak;
  const claimedToday=dailyRewardState.lastClaimDate===todayStr();
  const btn=document.getElementById('btn-claim-daily');
  btn.classList.toggle('disabled', claimedToday);
  btn.textContent = claimedToday ? 'جایزه امروز دریافت شد ✅' : 'دریافت جایزه امروز';
}
function renderLevelRewardsList(){
  const wrap=document.getElementById('level-rewards-list'); wrap.innerHTML='';
  LEVEL_MILESTONES.forEach(m=>{
    const unlocked=level>=m.lv;
    const el=document.createElement('div');
    el.className='reward-list-item'+(unlocked?' unlocked':'');
    el.innerHTML='<span class="lv">Lv.'+m.lv+'</span><span>'+m.label+(unlocked?' ✓':'')+'</span>';
    wrap.appendChild(el);
  });
}
function renderRewardsScreen(){ renderStreakRow(); renderLevelRewardsList(); }

/* ============================= ACHIEVEMENTS ============================= */
async function checkAchievements(){
  let changed=false;
  for(const a of ACHIEVEMENTS){
    if(!achievementsState.unlocked[a.id] && a.check()){
      achievementsState.unlocked[a.id]=Date.now();
      changed=true;
      showAchvBanner(a);
      SFX.achievement(); vibrate([20,30,20,30,40]);
    }
  }
  if(changed) await saveJSON('blockino-achievements', achievementsState);
}
function renderAchievementsGrid(){
  const wrap=document.getElementById('achv-grid'); wrap.innerHTML='';
  let unlockedCount=0;
  ACHIEVEMENTS.forEach(a=>{
    const unlocked=!!achievementsState.unlocked[a.id];
    if(unlocked) unlockedCount++;
    const el=document.createElement('div');
    el.className='achv-item'+(unlocked?' unlocked':'');
    el.innerHTML='<div class="ic">'+a.ic+'</div><div class="nm">'+a.name+'</div>';
    el.addEventListener('click',()=>toast(unlocked?(a.name+': '+a.desc):('🔒 '+a.desc)));
    wrap.appendChild(el);
  });
  document.getElementById('achv-progress-text').textContent=unlockedCount+' از '+ACHIEVEMENTS.length+' باز شده';
}

/* ============================= PROFILE / STATS / THEMES ============================= */
function formatPlayTime(sec){
  const h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60);
  if(h>0) return h+'س '+m+'د';
  return m+' دقیقه';
}
function avatarEmoji(id){ const a=AVATARS.find(x=>x.id===id); return a?a.emoji:'👧'; }

function renderProfileScreen(){
  const av=document.getElementById('profile-avatar');
  av.textContent=avatarEmoji(profile.avatar);
  av.classList.toggle('legendary', level>=100);
  document.getElementById('profile-name').textContent=profile.name;
  document.getElementById('profile-level').textContent='Level '+level;
  const pct=Math.min(100,Math.round((xp/xpToNext(level))*100));
  document.getElementById('profile-xpbar').style.width=pct+'%';
  document.getElementById('profile-xp-text').textContent=xp+' / '+xpToNext(level)+' XP';
  document.getElementById('p-best').textContent=progress.bestScore;
  document.getElementById('p-total').textContent=progress.totalScore;
  document.getElementById('p-games').textContent=progress.gamesPlayed;
  document.getElementById('p-lines').textContent=progress.linesCleared;
  document.getElementById('p-combo').textContent=progress.bestCombo;
  document.getElementById('p-tetris').textContent=progress.tetrisCount;
  document.getElementById('p-time').textContent=formatPlayTime(progress.playTimeSec);
  const unlockedCount=Object.keys(achievementsState.unlocked).length;
  document.getElementById('p-achv').textContent=unlockedCount+'/'+ACHIEVEMENTS.length;
}
function renderStatsScreen(){
  document.getElementById('s-games').textContent=progress.gamesPlayed;
  document.getElementById('s-best').textContent=progress.bestScore;
  document.getElementById('s-total').textContent=progress.totalScore;
  document.getElementById('s-combo').textContent=progress.bestCombo;
  document.getElementById('s-lines').textContent=progress.linesCleared;
  document.getElementById('s-tetris').textContent=progress.tetrisCount;
  document.getElementById('s-perfect').textContent=progress.perfectClears||0;
  document.getElementById('s-time').textContent=formatPlayTime(progress.playTimeSec);
  document.getElementById('s-level').textContent=level;
}
function renderThemesScreen(){
  const wrap=document.getElementById('theme-grid'); wrap.innerHTML='';
  const activeLevel = settings.selectedTheme!=null ? settings.selectedTheme : themeForLevel(level).level;
  THEMES.forEach(th=>{
    const unlocked=level>=th.level;
    const el=document.createElement('div');
    el.className='theme-swatch'+(unlocked?'':' locked')+(unlocked && activeLevel===th.level?' selected':'');
    el.style.background='linear-gradient(160deg,'+th.bgTo+','+th.accent+')';
    el.textContent=th.name;
    if(!unlocked){ const lv=document.createElement('span'); lv.className='lock-lv'; lv.textContent='Lv.'+th.level; el.appendChild(lv); }
    if(unlocked){
      el.addEventListener('click', async ()=>{
        settings.selectedTheme=th.level;
        await saveJSON('blockino-settings', settings);
        applyThemeState(); renderThemesScreen(); SFX.click();
      });
    }
    wrap.appendChild(el);
  });
  const skinWrap=document.getElementById('skin-row'); skinWrap.innerHTML='';
  BOARD_SKINS.forEach(sk=>{
    const unlocked=level>=sk.unlock;
    const el=document.createElement('div');
    el.className='skin-opt'+(unlocked?'':' locked')+(settings.boardSkin===sk.id?' selected':'');
    el.textContent=sk.name+(unlocked?'':' 🔒');
    if(unlocked){
      el.addEventListener('click', async ()=>{
        settings.boardSkin=sk.id;
        await saveJSON('blockino-settings', settings);
        applyBoardSkin(); renderThemesScreen(); SFX.click();
      });
    }
    skinWrap.appendChild(el);
  });
}
function renderAvatarGrid(containerId){
  const grid=document.getElementById(containerId);
  if(!grid) return;
  grid.innerHTML='';
  AVATARS.forEach(a=>{
    const unlocked = level>=a.unlock;
    const div=document.createElement('div');
    div.className='avatar-opt'+(unlocked?'':' locked')+(profile && profile.avatar===a.id?' selected':'');
    div.textContent=a.emoji;
    if(!unlocked){ const lv=document.createElement('div'); lv.className='lock-lv'; lv.textContent='Lv'+a.unlock; div.appendChild(lv); }
    div.addEventListener('click',()=>{
      if(!unlocked){ toast('🔒 در Level '+a.unlock+' باز می‌شود'); return; }
      profile.avatar=a.id;
      document.getElementById('hud-avatar').textContent=a.emoji;
      saveJSON('blockino-profile', profile);
      renderAvatarGrid(containerId);
      SFX.click();
    });
    grid.appendChild(div);
  });
}

/* ============================= RENDER (canvas) ============================= */
function lighten(hex,pct){
  const n=parseInt(hex.slice(1),16);
  let r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  r=Math.min(255,Math.round(r+(255-r)*pct/100));
  g=Math.min(255,Math.round(g+(255-g)*pct/100));
  b=Math.min(255,Math.round(b+(255-b)*pct/100));
  return 'rgb('+r+','+g+','+b+')';
}
function roundRectOn(c,x,y,w,h,r){
  c.beginPath();
  c.moveTo(x+r,y);
  c.arcTo(x+w,y,x+w,y+h,r);
  c.arcTo(x+w,y+h,x,y+h,r);
  c.arcTo(x,y+h,x,y,r);
  c.arcTo(x,y,x+w,y,r);
  c.closePath();
}
function roundRect(x,y,w,h,r){ roundRectOn(ctx,x,y,w,h,r); }
function drawBlockOn(c,cell,x,y,color,alpha){
  const px=x*cell, py=y*cell, s=cell-2;
  const glow = PERF_TIER!=='low';
  c.save();
  c.globalAlpha = alpha===undefined?1:alpha;
  if(glow){ c.shadowColor=color; c.shadowBlur=cell*0.3; }
  const grad=c.createLinearGradient(px,py,px,py+s);
  grad.addColorStop(0,lighten(color,25)); grad.addColorStop(1,color);
  roundRectOn(c,px+1,py+1,s,s,cell*0.22); c.fillStyle=grad; c.fill();
  c.restore();
  c.save();
  c.globalAlpha=(alpha===undefined?1:alpha)*0.3;
  roundRectOn(c,px+4,py+3,s-8,s*0.32,cell*0.15); c.fillStyle='#fff'; c.fill();
  c.restore();
}
function drawBlock(x,y,color,alpha){ drawBlockOn(ctx,CELL,x,y,color,alpha); }
function drawGhost(x,y,color){
  const px=x*CELL, py=y*CELL, s=CELL-2;
  ctx.save();
  ctx.globalAlpha=0.22; ctx.strokeStyle=color; ctx.lineWidth=2;
  roundRect(px+2,py+2,s-2,s-2,CELL*0.22); ctx.stroke();
  ctx.restore();
}
function ghostRow(){
  let r=current.row;
  while(!collides(current.matrix,r+1,current.col)) r++;
  return r;
}
function render(){
  if(!ctx) return;
  const w=canvas.clientWidth, h=canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  ctx.save();
  const bgGrad=ctx.createLinearGradient(0,0,0,h);
  bgGrad.addColorStop(0,'rgba(255,255,255,.03)'); bgGrad.addColorStop(1,'rgba(0,0,0,.15)');
  roundRect(0,0,w,h,10); ctx.fillStyle=bgGrad; ctx.fill();
  ctx.restore();

  ctx.save(); ctx.strokeStyle='rgba(255,255,255,.05)'; ctx.lineWidth=1;
  for(let c=1;c<COLS;c++){ ctx.beginPath(); ctx.moveTo(c*CELL,0); ctx.lineTo(c*CELL,h); ctx.stroke(); }
  for(let r=1;r<ROWS;r++){ ctx.beginPath(); ctx.moveTo(0,r*CELL); ctx.lineTo(w,r*CELL); ctx.stroke(); }
  ctx.restore();

  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    if(board[r][c]){
      const flashing = clearingRows.includes(r);
      drawBlock(c,r,board[r][c], flashing?0.35:1);
      if(flashing){ ctx.save(); ctx.globalAlpha=0.6; ctx.fillStyle='#fff';
        roundRect(c*CELL+1,r*CELL+1,CELL-2,CELL-2,CELL*0.22); ctx.fill(); ctx.restore(); }
    }
  }

  if(current && (state==='playing')){
    if(settings.ghost){
      const gr=ghostRow();
      const m=current.matrix;
      for(let r=0;r<m.length;r++) for(let c=0;c<m[r].length;c++){
        if(m[r][c]){ const gy=gr+r; if(gy>=0) drawGhost(current.col+c, gy, current.color); }
      }
    }
    const m=current.matrix;
    for(let r=0;r<m.length;r++) for(let c=0;c<m[r].length;c++){
      if(m[r][c]){
        const by=current.row+r;
        if(by>=0) drawBlock(current.col+c, by, current.color);
      }
    }
  }
}

function trimMatrix(m){
  let minR=m.length,maxR=-1,minC=m[0].length,maxC=-1;
  for(let r=0;r<m.length;r++) for(let c=0;c<m[r].length;c++){
    if(m[r][c]){ minR=Math.min(minR,r); maxR=Math.max(maxR,r); minC=Math.min(minC,c); maxC=Math.max(maxC,c); }
  }
  if(maxR<0) return {w:0,h:0,cells:[]};
  const cells=[];
  for(let r=minR;r<=maxR;r++) for(let c=minC;c<=maxC;c++){ if(m[r][c]) cells.push({r:r-minR,c:c-minC}); }
  return {w:maxC-minC+1, h:maxR-minR+1, cells};
}
function renderMiniPiece(canvasId, type){
  const c=document.getElementById(canvasId); if(!c) return;
  const cx=c.getContext('2d');
  const w=c.clientWidth||60, h=c.clientHeight||60;
  const dpr=window.devicePixelRatio||1;
  c.width=Math.max(1,w*dpr); c.height=Math.max(1,h*dpr);
  cx.setTransform(dpr,0,0,dpr,0,0);
  cx.clearRect(0,0,w,h);
  if(!type) return;
  const def=PIECE_DEFS[type];
  const t=trimMatrix(def.matrix);
  if(t.w===0) return;
  const cell=Math.floor(Math.min(w/(t.w+0.6), h/(t.h+0.6)));
  const ox=(w-t.w*cell)/2, oy=(h-t.h*cell)/2;
  t.cells.forEach(({r,c:cc})=>{
    const px=ox+cc*cell, py=oy+r*cell, s=cell-2;
    cx.save();
    const grad=cx.createLinearGradient(px,py,px,py+s);
    grad.addColorStop(0,lighten(def.color,25)); grad.addColorStop(1,def.color);
    roundRectOn(cx,px+1,py+1,s,s,cell*0.22); cx.fillStyle=grad; cx.fill();
    cx.restore();
  });
}
function renderNextCanvas(){ if(settings.showNext) renderMiniPiece('next-canvas', nextType); }
function renderHoldCanvas(){ if(settings.showHold) renderMiniPiece('hold-canvas', holdType); }

function resizeCanvas(){
  const wrap=document.getElementById('board-wrap');
  const maxW=Math.min(wrap.clientWidth-16, 340);
  const maxH=wrap.clientHeight-16;
  let cell=Math.floor(Math.min(maxW/COLS, maxH/ROWS));
  cell=Math.max(16,cell);
  CELL=cell;
  const w=cell*COLS, h=cell*ROWS;
  const dpr=window.devicePixelRatio||1;
  canvas.style.width=w+'px'; canvas.style.height=h+'px';
  canvas.width=w*dpr; canvas.height=h*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  renderNextCanvas(); renderHoldCanvas();
  render();
}

/* ============================= LOOP ============================= */
function loop(t){
  if(!lastTime) lastTime=t;
  const dt=t-lastTime; lastTime=t;
  if(state==='playing'){
    dropTimer+=dt;
    const di=dropInterval(level);
    if(dropTimer>=di){
      dropTimer=0;
      if(!collides(current.matrix,current.row+1,current.col)){ current.row++; }
      else { lockAndContinue(); }
    }
    playTimeAccum+=dt;
    if(playTimeAccum>=5000){
      progress.playTimeSec+=Math.floor(playTimeAccum/1000);
      playTimeAccum%=1000;
      saveJSON('blockino-progress', progress);
      flushMissionsIfDirty();
    }
  }
  render();
  requestAnimationFrame(loop);
}

/* ============================= UI HELPERS ============================= */
function show(id){ document.getElementById(id).classList.remove('hidden'); }
function hide(id){ document.getElementById(id).classList.add('hidden'); }
function hideAllOverlaysExceptLoading(){
  ['ov-onboarding','ov-tutorial','ov-menu','ov-profile','ov-missions','ov-rewards','ov-achievements',
   'ov-stats','ov-themes','ov-settings','ov-reset-confirm','ov-rules','ov-support','ov-about',
   'ov-pause','ov-gameover'].forEach(hide);
}
function renderTutorial(step){
  document.getElementById('tut-text').textContent=TUTORIAL_STEPS[step];
  const dots=document.getElementById('tut-dots'); dots.innerHTML='';
  TUTORIAL_STEPS.forEach((_,i)=>{ const d=document.createElement('div'); d.className='tut-dot'+(i===step?' active':''); dots.appendChild(d); });
  document.getElementById('btn-tut-next').textContent = step===TUTORIAL_STEPS.length-1 ? 'شروع بازی' : 'بعدی';
}

function startNewGame(){
  board=emptyBoard(); score=0; xp=progress.xp; level=progress.level; combo=0; maxCombo=0;
  history=[]; dropTimer=0; lastTime=0; clearingRows=[]; nextType=null; holdType=null; holdUsed=false;
  lastClearWasTetris=false; linesThisGame=0; newRecordShownThisGame=false; playTimeAccum=0;
  applyThemeState(); applyBoardSkin();
  updateHUD();
  document.getElementById('hud-score').textContent=0;
  document.getElementById('hud-best').textContent=progress.bestScore;
  state='playing';
  hideAllOverlaysExceptLoading();
  spawnPiece();
  startMusic();
}

/* ============================= INIT ============================= */
function spawnParticles(){
  const wrap=document.getElementById('particles');
  for(let i=0;i<16;i++){
    const p=document.createElement('div');
    p.className='particle';
    const size=6+Math.random()*16;
    p.style.width=size+'px'; p.style.height=size+'px';
    p.style.left=(Math.random()*100)+'vw';
    p.style.bottom=(-10-Math.random()*20)+'vh';
    p.style.animationDuration=(10+Math.random()*14)+'s';
    p.style.animationDelay=(Math.random()*10)+'s';
    wrap.appendChild(p);
  }
}

function deviceInfoText(){
  return 'نسخه: '+APP_VERSION+' | '+(navigator.platform||'')+' | '+window.innerWidth+'×'+window.innerHeight;
}
function categoryLabel(v){ return {question:'سوال درباره بازی',bug:'گزارش مشکل',suggestion:'پیشنهاد',other:'سایر'}[v]||v; }
function escapeHtml(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
let selectedSupportCategory='question';
function renderSupportHistory(){
  const wrap=document.getElementById('support-history'); wrap.innerHTML='';
  if(supportMessages.length===0){ wrap.innerHTML='<div class="hint">پیامی ذخیره نشده است.</div>'; return; }
  supportMessages.slice().reverse().slice(0,10).forEach(m=>{
    const el=document.createElement('div'); el.className='support-msg-item';
    el.innerHTML='<b>'+categoryLabel(m.cat)+'</b> — '+escapeHtml(m.subject)+'<br><span class="hint">'+new Date(m.date).toLocaleString('fa-IR')+'</span>';
    wrap.appendChild(el);
  });
}

function syncSettingsUI(){
  document.getElementById('sw-music').classList.toggle('on', settings.music);
  document.getElementById('sw-sfx').classList.toggle('on', settings.sfx);
  document.getElementById('rng-volume').value = settings.volume;
  document.getElementById('sw-vibration').classList.toggle('on', settings.vibration);
  document.getElementById('sw-autopause').classList.toggle('on', settings.autoPause);
  document.getElementById('sw-ghost').classList.toggle('on', settings.ghost);
  document.getElementById('sw-next').classList.toggle('on', settings.showNext);
  document.getElementById('sw-hold').classList.toggle('on', settings.showHold);
  document.getElementById('sw-particles').classList.toggle('on', settings.particles);
  document.querySelectorAll('#seg-animquality .seg-btn').forEach(b=>b.classList.toggle('active', b.dataset.v===settings.animQuality));
  document.querySelectorAll('#seg-perf .seg-btn').forEach(b=>b.classList.toggle('active', b.dataset.v===settings.performanceMode));
}
function applySidePanelVisibility(){
  document.getElementById('panel-next').classList.toggle('hidden-pref', !settings.showNext);
  document.getElementById('panel-hold').classList.toggle('hidden-pref', !settings.showHold);
  document.getElementById('btn-hold').classList.toggle('locked', !settings.showHold);
}

async function init(){
  spawnParticles();
  canvas=document.getElementById('board'); ctx=canvas.getContext('2d');
  board=emptyBoard();

  const [p, pr, se, ts, ach, mis, dr, sup] = await Promise.all([
    loadJSON('blockino-profile', null),
    loadJSON('blockino-progress', {level:1, xp:0, bestScore:0, totalScore:0, gamesPlayed:0, linesCleared:0, bestCombo:0, tetrisCount:0, perfectClears:0, playTimeSec:0}),
    loadJSON('blockino-settings', settings),
    loadJSON('blockino-tutorial-seen', false),
    loadJSON('blockino-achievements', {unlocked:{}}),
    loadJSON('blockino-missions', missionsState),
    loadJSON('blockino-daily-reward', {streak:0, lastClaimDate:''}),
    loadJSON('blockino-support-messages', []),
  ]);
  profile=p; progress=Object.assign({level:1, xp:0, bestScore:0, totalScore:0, gamesPlayed:0, linesCleared:0, bestCombo:0, tetrisCount:0, perfectClears:0, playTimeSec:0}, pr);
  settings=Object.assign({}, settings, se);
  tutorialSeen=ts; achievementsState=ach; missionsState=mis; dailyRewardState=dr; supportMessages=sup;
  level=progress.level; xp=progress.xp;

  applyPerfClass();
  document.body.classList.toggle('reduce-motion', settings.animQuality==='low');
  applyThemeState(); applyBoardSkin();
  syncSettingsUI(); applySidePanelVisibility();
  ensureMissionsToday(); renderMissionsBadge(); renderRewardsBadge();

  hide('ov-loading');

  if(!profile){
    profile={name:'بازیکن', avatar:'g1'};
    renderAvatarGrid('onboarding-avatar-grid');
    show('ov-onboarding');
  } else {
    enterMenuFlow();
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(loop);
  registerServiceWorker();
}

function enterMenuFlow(){
  document.getElementById('hud-name').textContent=profile.name;
  document.getElementById('hud-avatar').textContent=avatarEmoji(profile.avatar);
  updateHUD();
  if(!tutorialSeen){
    let step=0; renderTutorial(step);
    show('ov-tutorial');
  } else {
    show('ov-menu');
  }
}

function registerServiceWorker(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
}

/* ---------- events: onboarding / tutorial ---------- */
let onboardingMode='create';
function openProfileEdit(){
  onboardingMode='edit';
  document.getElementById('input-name').value=profile.name;
  document.getElementById('btn-onboarding-save').textContent='ذخیره تغییرات';
  renderAvatarGrid('onboarding-avatar-grid');
  hide('ov-profile');
  show('ov-onboarding');
}
document.getElementById('btn-profile-edit').addEventListener('click', openProfileEdit);
document.getElementById('profile-avatar').addEventListener('click', openProfileEdit);

document.getElementById('btn-onboarding-save').addEventListener('click', async ()=>{
  const val=document.getElementById('input-name').value.trim();
  profile.name = val || 'بازیکن';
  if(!profile.avatar) profile.avatar='g1';
  await saveJSON('blockino-profile', profile);
  hide('ov-onboarding');
  document.getElementById('hud-name').textContent=profile.name;
  document.getElementById('hud-avatar').textContent=avatarEmoji(profile.avatar);
  document.getElementById('btn-onboarding-save').textContent='شروع ماجراجویی';
  if(onboardingMode==='edit'){ renderProfileScreen(); show('ov-profile'); }
  else { enterMenuFlow(); }
  SFX.click();
});

let tutStep=0;
document.getElementById('btn-tut-next').addEventListener('click', async ()=>{
  SFX.click();
  if(tutStep<TUTORIAL_STEPS.length-1){ tutStep++; renderTutorial(tutStep); }
  else { tutorialSeen=true; await saveJSON('blockino-tutorial-seen', true); hide('ov-tutorial'); show('ov-menu'); tutStep=0; }
});

/* ---------- events: main menu ---------- */
document.getElementById('btn-play').addEventListener('click', ()=>{ ensureAudio(); SFX.click(); startNewGame(); });
document.getElementById('tile-missions').addEventListener('click',()=>{ SFX.click(); renderMissionsList(); show('ov-missions'); });
document.getElementById('tile-rewards').addEventListener('click',()=>{ SFX.click(); renderRewardsScreen(); show('ov-rewards'); });
document.getElementById('tile-profile').addEventListener('click',()=>{ SFX.click(); renderProfileScreen(); show('ov-profile'); });
document.getElementById('tile-achievements').addEventListener('click',()=>{ SFX.click(); renderAchievementsGrid(); show('ov-achievements'); });
document.getElementById('tile-stats').addEventListener('click',()=>{ SFX.click(); renderStatsScreen(); show('ov-stats'); });
document.getElementById('tile-themes').addEventListener('click',()=>{ SFX.click(); renderThemesScreen(); show('ov-themes'); });
document.getElementById('tile-settings').addEventListener('click',()=>{ SFX.click(); syncSettingsUI(); show('ov-settings'); });
document.getElementById('tile-rules').addEventListener('click',()=>{ SFX.click(); show('ov-rules'); });
document.getElementById('tile-support').addEventListener('click',()=>{ SFX.click(); document.getElementById('support-device-info').textContent=deviceInfoText(); renderSupportHistory(); show('ov-support'); });
document.getElementById('tile-about').addEventListener('click',()=>{ SFX.click(); show('ov-about'); });

[['btn-missions-close','ov-missions'],['btn-rewards-close','ov-rewards'],['btn-profile-close','ov-profile'],
 ['btn-achievements-close','ov-achievements'],['btn-stats-close','ov-stats'],['btn-themes-close','ov-themes'],
 ['btn-rules-close','ov-rules'],['btn-support-close','ov-support'],['btn-about-close','ov-about'],
 ['btn-settings-close','ov-settings']
].forEach(([b,o])=>document.getElementById(b).addEventListener('click',()=>{ hide(o); SFX.click(); }));

document.getElementById('btn-claim-daily').addEventListener('click', claimDailyReward);
document.getElementById('btn-open-tutorial').addEventListener('click', ()=>{ SFX.click(); tutStep=0; renderTutorial(0); hide('ov-settings'); show('ov-tutorial'); });

/* ---------- events: settings ---------- */
function bindSwitch(id, key, onChange){
  document.getElementById(id).addEventListener('click', async ()=>{
    settings[key]=!settings[key];
    document.getElementById(id).classList.toggle('on', settings[key]);
    await saveJSON('blockino-settings', settings);
    if(onChange) onChange();
    SFX.click();
  });
}
bindSwitch('sw-music','music', ()=>{ if(state==='playing'){ if(settings.music) startMusic(); else stopMusic(); } });
bindSwitch('sw-sfx','sfx');
bindSwitch('sw-vibration','vibration');
bindSwitch('sw-autopause','autoPause');
bindSwitch('sw-ghost','ghost');
bindSwitch('sw-next','showNext', applySidePanelVisibility);
bindSwitch('sw-hold','showHold', ()=>{ applySidePanelVisibility(); updateHoldButtonState(); });
bindSwitch('sw-particles','particles');

document.getElementById('rng-volume').addEventListener('input', async e=>{
  settings.volume=parseInt(e.target.value,10);
  await saveJSON('blockino-settings', settings);
});

function bindSegGroup(id, key, onChange){
  const group=document.getElementById(id);
  group.querySelectorAll('.seg-btn').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      settings[key]=btn.dataset.v;
      group.querySelectorAll('.seg-btn').forEach(b=>b.classList.toggle('active', b===btn));
      await saveJSON('blockino-settings', settings);
      if(onChange) onChange();
      SFX.click();
    });
  });
}
bindSegGroup('seg-animquality','animQuality', ()=>document.body.classList.toggle('reduce-motion', settings.animQuality==='low'));
bindSegGroup('seg-perf','performanceMode', applyPerfClass);

/* ---------- events: reset / clear data ---------- */
let pendingResetAction=null;
function openResetConfirm(action, title){
  pendingResetAction=action;
  document.getElementById('reset-title').textContent=title;
  document.getElementById('reset-step2').classList.add('hidden');
  show('ov-reset-confirm');
}
document.getElementById('btn-reset-progress').addEventListener('click',()=>openResetConfirm('progress','⚠️ بازنشانی پیشرفت'));
document.getElementById('btn-clear-data').addEventListener('click',()=>openResetConfirm('all','⚠️ پاک کردن کامل داده‌ها'));
document.getElementById('btn-reset-step1').addEventListener('click',()=>{ document.getElementById('reset-step2').classList.remove('hidden'); SFX.click(); });
document.getElementById('btn-reset-cancel1').addEventListener('click',()=>{ hide('ov-reset-confirm'); SFX.click(); });
document.getElementById('btn-reset-cancel2').addEventListener('click',()=>{ hide('ov-reset-confirm'); SFX.click(); });
document.getElementById('btn-reset-step2').addEventListener('click', async ()=>{
  if(pendingResetAction==='progress'){
    progress={level:1,xp:0,bestScore:0,totalScore:0,gamesPlayed:0,linesCleared:0,bestCombo:0,tetrisCount:0,perfectClears:0,playTimeSec:0};
    achievementsState={unlocked:{}};
    missionsState={date:'',list:[],dailyStats:{lines:0,bestCombo:0,tetris:0,bestScore:0,games:0}};
    dailyRewardState={streak:0,lastClaimDate:''};
    await Promise.all([
      saveJSON('blockino-progress',progress), saveJSON('blockino-achievements',achievementsState),
      saveJSON('blockino-missions',missionsState), saveJSON('blockino-daily-reward',dailyRewardState),
    ]);
    level=1; xp=0; applyThemeState(); applyBoardSkin(); updateHUD();
    hide('ov-reset-confirm'); hide('ov-settings'); toast('پیشرفت بازنشانی شد');
    show('ov-menu');
  } else {
    profile=null;
    settings={music:true,sfx:true,volume:80,vibration:true,autoPause:true,ghost:true,showNext:true,showHold:true,animQuality:'high',particles:true,performanceMode:'auto',boardSkin:'classic',selectedTheme:null};
    tutorialSeen=false; supportMessages=[];
    progress={level:1,xp:0,bestScore:0,totalScore:0,gamesPlayed:0,linesCleared:0,bestCombo:0,tetrisCount:0,perfectClears:0,playTimeSec:0};
    achievementsState={unlocked:{}};
    missionsState={date:'',list:[],dailyStats:{lines:0,bestCombo:0,tetris:0,bestScore:0,games:0}};
    dailyRewardState={streak:0,lastClaimDate:''};
    await Promise.all([
      saveJSON('blockino-profile',null), saveJSON('blockino-settings',settings), saveJSON('blockino-tutorial-seen',false),
      saveJSON('blockino-progress',progress), saveJSON('blockino-achievements',achievementsState),
      saveJSON('blockino-missions',missionsState), saveJSON('blockino-daily-reward',dailyRewardState),
      saveJSON('blockino-support-messages',[]),
    ]);
    level=1; xp=0; applyThemeState(); applyBoardSkin(); syncSettingsUI(); applySidePanelVisibility();
    hide('ov-reset-confirm'); hide('ov-settings'); hideAllOverlaysExceptLoading();
    toast('همه داده‌ها پاک شد');
    profile={name:'بازیکن', avatar:'g1'};
    renderAvatarGrid('onboarding-avatar-grid');
    onboardingMode='create';
    document.getElementById('input-name').value='';
    document.getElementById('btn-onboarding-save').textContent='شروع ماجراجویی';
    show('ov-onboarding');
  }
  SFX.click();
});

/* ---------- events: support ---------- */
document.querySelectorAll('#support-categories .chip').forEach(chip=>{
  chip.addEventListener('click',()=>{
    selectedSupportCategory=chip.dataset.v;
    document.querySelectorAll('#support-categories .chip').forEach(c=>c.classList.toggle('selected', c===chip));
    SFX.click();
  });
});
document.getElementById('btn-support-send').addEventListener('click', async ()=>{
  const subject=document.getElementById('support-subject').value.trim();
  const body=document.getElementById('support-message').value.trim();
  if(!subject && !body){ toast('لطفاً پیام خود را بنویس'); return; }
  supportMessages.push({cat:selectedSupportCategory, subject:subject||'(بدون موضوع)', body, date:Date.now()});
  await saveJSON('blockino-support-messages', supportMessages);
  document.getElementById('support-subject').value='';
  document.getElementById('support-message').value='';
  renderSupportHistory();
  toast('پیام شما ذخیره شد ✅');
  SFX.click();
});

/* ---------- events: in-game controls ---------- */
document.getElementById('btn-pause').addEventListener('click', pauseGame);
function pauseGame(){
  if(state!=='playing') return;
  flushMissionsIfDirty();
  state='paused'; stopMusic(); show('ov-pause'); SFX.click();
}
document.getElementById('btn-resume').addEventListener('click', ()=>{
  hide('ov-pause'); state='playing'; lastTime=0; startMusic(); SFX.click();
});
document.getElementById('btn-restart').addEventListener('click', ()=>{
  hide('ov-pause'); SFX.click(); startNewGame();
});
document.getElementById('btn-to-menu').addEventListener('click', ()=>{
  hide('ov-pause'); state='menu'; stopMusic(); show('ov-menu'); SFX.click();
});
document.getElementById('btn-go-restart').addEventListener('click', ()=>{ hide('ov-gameover'); SFX.click(); startNewGame(); });
document.getElementById('btn-go-menu').addEventListener('click', ()=>{ hide('ov-gameover'); state='menu'; show('ov-menu'); SFX.click(); });

function bindHold(id, fn){
  const el=document.getElementById(id);
  el.addEventListener('pointerdown', e=>{ e.preventDefault(); ensureAudio(); fn(); });
}
bindHold('btn-left', ()=>tryMove(-1));
bindHold('btn-right', ()=>tryMove(1));
bindHold('btn-rotate', tryRotate);
bindHold('btn-harddrop', hardDrop);
bindHold('btn-hold', holdPiece);
document.getElementById('hold-panel-tap').addEventListener('pointerdown', e=>{ e.preventDefault(); ensureAudio(); holdPiece(); });

/* ---------- keyboard ---------- */
window.addEventListener('keydown', e=>{
  if(e.code==='KeyP'){ if(state==='playing') pauseGame(); return; }
  if(state!=='playing') return;
  switch(e.code){
    case 'ArrowLeft': tryMove(-1); break;
    case 'ArrowRight': tryMove(1); break;
    case 'ArrowUp': case 'KeyX': tryRotate(); break;
    case 'ArrowDown': softDropStep(); break;
    case 'Space': e.preventDefault(); hardDrop(); break;
    case 'KeyC': case 'ShiftLeft': case 'ShiftRight': holdPiece(); break;
  }
});

/* ---------- swipe / tap on board ---------- */
(function(){
  const boardEl=document.getElementById('board-frame');
  let startX=0, startY=0, startT=0, moved=false, active=false;
  boardEl.addEventListener('pointerdown', e=>{
    if(state!=='playing') return;
    ensureAudio();
    startX=e.clientX; startY=e.clientY; startT=performance.now(); moved=false; active=true;
  });
  boardEl.addEventListener('pointermove', e=>{
    if(!active || state!=='playing') return;
    const dx=e.clientX-startX;
    if(Math.abs(dx)>=CELL*0.85){
      tryMove(dx>0?1:-1); startX=e.clientX; moved=true;
    }
  });
  boardEl.addEventListener('pointerup', e=>{
    if(!active) return; active=false;
    if(state!=='playing') return;
    const dy=e.clientY-startY, dt=performance.now()-startT;
    if(!moved){
      if(Math.abs(e.clientX-startX)<12 && Math.abs(dy)<12 && dt<300){ tryRotate(); }
      else if(dy>55 && dt<200){ hardDrop(); }
      else if(dy>26){ softDropStep(); }
    }
  });
  boardEl.addEventListener('pointercancel', ()=>{ active=false; });
})();

/* ---------- auto pause ---------- */
document.addEventListener('visibilitychange', ()=>{ if(document.hidden) pauseGame(); });
window.addEventListener('blur', pauseGame);

init();
})();
