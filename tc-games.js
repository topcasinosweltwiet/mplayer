// tc-games.js — Complete rewrite, all games fixed

// ── GLOBAL STATE ──
currentGame = null;
gState = {};
CS = {};
tState = {};
mState = {};
bjState = {};
var _streak = 0;

// ── HELPERS ──
function fmt(n){return 'Rs. '+(Number(n)||0).toLocaleString('en-NP');}
function bal(){return CD ? Number(CD.balance||0) : 0;}
function ub(){var b=$('bshow');if(b)b.textContent=fmt(bal());var g=$('gbal');if(g)g.textContent=fmt(bal());}
function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function pickArr(a){return a[Math.floor(Math.random()*a.length)];}
function wc(){
  if(_streak>0){_streak--;return false;}
  var w=Math.random()<0.40;
  if(w)_streak=rnd(1,2);
  return w;
}
function deductBet(bet){
  var nb=bal()-bet;
  CD.balance=nb;
  fbUp('/players/'+CK,{balance:nb});
  ub();
}
function creditWin(payout){
  var nb=bal()+payout;
  CD.balance=nb;
  fbUp('/players/'+CK,{balance:nb});
  ub();
}
function recordTxn(type,amount,gameId){
  fbPush('/gameTxns',{playerKey:CK,type:type,amount:amount,game:gameId||'',time:new Date().toISOString()});
}
function finishGame(won,payout,bet,gameId){
  if(!CK)return;
  if(won && payout>0) creditWin(payout);
  recordTxn(won?'win':'loss', won?payout:bet, gameId);
}
function showResult(won,title,sub){
  var res=$('gres');var rt=$('grt');var rs=$('grs');
  if(!res)return;
  res.style.display='block';
  res.className='gres '+(won?'win':'lose');
  if(rt)rt.textContent=title||'';
  if(rs)rs.textContent=sub||'';
}
function getBetVal(){return parseFloat(($('gbinp')||{}).value)||0;}
function buildChips(){
  var w=$('gchips');if(!w)return;w.innerHTML='';
  [50,100,500,1000,5000].forEach(function(v){
    var b=document.createElement('button');
    b.className='chip';
    b.textContent=v>=1000?(v/1000)+'K':v;
    b.onclick=function(){var i=$('gbinp');if(i)i.value=v;};
    w.appendChild(b);
  });
}

// ── GAME DATA ──
var SLOT_SYMS = {
  slots1:['🍒','🍋','🍊','🍇','⭐','💎'],
  slots2:['💎','💍','👑','⭐','🔷','🔮'],
  slots3:['7️⃣','🎰','💰','🍀','🎲','⚡'],
  slots4:['7️⃣','💎','⭐','🍀','🔔','👑'],
};

var GAME_DESIGNS = {
  crash1:{bg:'linear-gradient(135deg,#0a2a1a,#0d3d22)',c1:'#4ade80',c2:'#86efac',badge:'LIVE'},
  crash2:{bg:'linear-gradient(135deg,#0a1a3d,#0d2460)',c1:'#3b82f6',c2:'#93c5fd',badge:'HOT'},
  crash3:{bg:'linear-gradient(135deg,#3d1a00,#5c2a00)',c1:'#f97316',c2:'#fdba74',badge:'HOT'},
  slots1:{bg:'linear-gradient(135deg,#2d0a3d,#3d0d52)',c1:'#a855f7',c2:'#d8b4fe',badge:'HOT'},
  slots2:{bg:'linear-gradient(135deg,#0a2040,#0d3060)',c1:'#38bdf8',c2:'#7dd3fc',badge:''},
  slots3:{bg:'linear-gradient(135deg,#3d0a0a,#520d0d)',c1:'#ef4444',c2:'#f87171',badge:''},
  slots4:{bg:'linear-gradient(135deg,#1a3d00,#225200)',c1:'#84cc16',c2:'#a3e635',badge:'LUCKY'},
  bj1:{bg:'linear-gradient(135deg,#0a3d1a,#0d5224)',c1:'#10b981',c2:'#6ee7b7',badge:''},
  bj2:{bg:'linear-gradient(135deg,#1a0a3d,#240d52)',c1:'#8b5cf6',c2:'#a78bfa',badge:'VIP'},
  hilo1:{bg:'linear-gradient(135deg,#3d1a2a,#52243a)',c1:'#f43f5e',c2:'#fda4af',badge:''},
  war1:{bg:'linear-gradient(135deg,#3d0a0a,#520d0d)',c1:'#dc2626',c2:'#f87171',badge:''},
  dt1:{bg:'linear-gradient(135deg,#2a1a00,#3d2600)',c1:'#d97706',c2:'#fbbf24',badge:''},
  bac1:{bg:'linear-gradient(135deg,#0a1a3d,#0d2452)',c1:'#6366f1',c2:'#818cf8',badge:''},
  dice1:{bg:'linear-gradient(135deg,#003d3d,#005252)',c1:'#06b6d4',c2:'#22d3ee',badge:''},
  dice2:{bg:'linear-gradient(135deg,#1a003d,#260052)',c1:'#7c3aed',c2:'#9f67fa',badge:''},
  roul1:{bg:'linear-gradient(135deg,#1a3d00,#225200)',c1:'#22c55e',c2:'#4ade80',badge:''},
  wheel1:{bg:'linear-gradient(135deg,#3d1a00,#522400)',c1:'#f97316',c2:'#fb923c',badge:''},
  coin1:{bg:'linear-gradient(135deg,#3d3000,#524000)',c1:'#eab308',c2:'#facc15',badge:''},
  lucky1:{bg:'linear-gradient(135deg,#003d0a,#005210)',c1:'#16a34a',c2:'#4ade80',badge:'LUCKY'},
  keno1:{bg:'linear-gradient(135deg,#001a3d,#002452)',c1:'#0284c7',c2:'#38bdf8',badge:''},
  color1:{bg:'linear-gradient(135deg,#2a003d,#3a0052)',c1:'#c026d3',c2:'#e879f9',badge:''},
  colorball1:{bg:'linear-gradient(135deg,#00293d,#003852)',c1:'#0891b2',c2:'#22d3ee',badge:''},
  bigsmall1:{bg:'linear-gradient(135deg,#1a1a3d,#262652)',c1:'#4f46e5',c2:'#818cf8',badge:''},
  oddeven1:{bg:'linear-gradient(135deg,#003d2a,#005238)',c1:'#059669',c2:'#34d399',badge:''},
  mines1:{bg:'linear-gradient(135deg,#3d0000,#520000)',c1:'#dc2626',c2:'#f87171',badge:'HOT'},
  mines2:{bg:'linear-gradient(135deg,#1a0000,#2a0000)',c1:'#991b1b',c2:'#ef4444',badge:'HARD'},
  plinko1:{bg:'linear-gradient(135deg,#00193d,#002452)',c1:'#2563eb',c2:'#60a5fa',badge:''},
  tower1:{bg:'linear-gradient(135deg,#0a3d2a,#0d5238)',c1:'#047857',c2:'#34d399',badge:''},
};

var HOT_GAMES = [
  {id:'crash1',name:'Rocket Crash',icon:'🚀',badge:'hbl',type:'crash',vehicle:'rocket'},
  {id:'slots1',name:'Fruit Slots',icon:'🍒',badge:'hbl',type:'slots',syms:'slots1',mult:3},
  {id:'bj1',name:'Blackjack',icon:'🃏',badge:'hbh',type:'bj'},
  {id:'mines1',name:'Mines',icon:'💣',badge:'hbh',type:'mines',mines:5},
  {id:'plinko1',name:'Plinko',icon:'⚪',badge:'hbl',type:'plinko'},
  {id:'tower1',name:'Tower',icon:'🏗️',badge:'hbh',type:'tower'},
  {id:'coin1',name:'Coin Flip',icon:'🪙',badge:'hbn',type:'coin'},
  {id:'wheel1',name:'Money Wheel',icon:'🎡',badge:'hbh',type:'wheel'},
  {id:'dt1',name:'Dragon Tiger',icon:'🐯',badge:'hbl',type:'dt'},
];

var ALL_CASINO = [
  {id:'crash1',name:'Rocket Crash',icon:'🚀',type:'crash',vehicle:'rocket'},
  {id:'crash2',name:'Aviator',icon:'✈️',type:'crash',vehicle:'plane'},
  {id:'crash3',name:'Dragon Blast',icon:'🐉',type:'crash',vehicle:'lightning'},
  {id:'slots1',name:'Fruit Slots',icon:'🍒',type:'slots',syms:'slots1',mult:3},
  {id:'slots2',name:'Diamond Slots',icon:'💎',type:'slots',syms:'slots2',mult:4},
  {id:'slots3',name:'Vegas Slots',icon:'🎰',type:'slots',syms:'slots3',mult:3},
  {id:'slots4',name:'Lucky 7s',icon:'7️⃣',type:'slots',syms:'slots4',mult:7},
  {id:'bj1',name:'Blackjack',icon:'🃏',type:'bj'},
  {id:'bj2',name:'VIP Blackjack',icon:'♠️',type:'bj',mult:3},
  {id:'hilo1',name:'Hi-Lo',icon:'🎴',type:'hilo'},
  {id:'war1',name:'Card War',icon:'⚔️',type:'war'},
  {id:'dt1',name:'Dragon Tiger',icon:'🐯',type:'dt'},
  {id:'bac1',name:'Baccarat',icon:'🥂',type:'bac'},
  {id:'dice1',name:'Classic Dice',icon:'🎲',type:'dice',nd:2},
  {id:'dice2',name:'Sic Bo',icon:'🎯',type:'dice',nd:3},
  {id:'roul1',name:'Roulette',icon:'🎡',type:'roulette'},
  {id:'wheel1',name:'Money Wheel',icon:'🎡',type:'wheel'},
  {id:'coin1',name:'Coin Flip',icon:'🪙',type:'coin'},
  {id:'lucky1',name:'Lucky Number',icon:'🍀',type:'lucky',max:10,mult:8},
  {id:'keno1',name:'Keno',icon:'🔢',type:'keno'},
  {id:'color1',name:'Color Predict',icon:'🎨',type:'colorpick'},
  {id:'colorball1',name:'Color Ball',icon:'🔵',type:'colorball'},
  {id:'bigsmall1',name:'Big Small',icon:'🎯',type:'bigsmall'},
  {id:'oddeven1',name:'Odd Even',icon:'♟️',type:'oddeven'},
  {id:'mines1',name:'Mines',icon:'💣',type:'mines',mines:5},
  {id:'mines2',name:'Hard Mines',icon:'💥',type:'mines',mines:10},
  {id:'plinko1',name:'Plinko',icon:'⚪',type:'plinko'},
  {id:'tower1',name:'Tower',icon:'🏗️',type:'tower'},
];

// ── INJECT STYLES ──
(function(){
  if(document.getElementById('gc-styles'))return;
  var st=document.createElement('style');
  st.id='gc-styles';
  st.textContent=[
    '@keyframes gc-bounce{0%{transform:scale(0.85);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}',
    '@keyframes gc-shine{0%{left:-100%}100%{left:150%}}',
    '@keyframes reel-blur{0%,100%{filter:blur(0)}50%{filter:blur(2px)}}',
    '@keyframes mine-reveal{0%{transform:scale(0) rotate(-90deg)}60%{transform:scale(1.2)}100%{transform:scale(1)}}',
    '@keyframes tower-glow{0%,100%{box-shadow:0 0 8px #4ade8044}50%{box-shadow:0 0 20px #4ade8099}}',
    '@keyframes plinko-drop{0%{transform:translateY(-8px)}100%{transform:translateY(0)}}',
    '@keyframes card-flip{0%{transform:rotateY(90deg)}100%{transform:rotateY(0deg)}}',
    '@keyframes result-pop{0%{transform:scale(0.7);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}',
    '.game-card{cursor:pointer;border-radius:14px;overflow:hidden;position:relative;transition:transform 0.22s,box-shadow 0.22s}',
    '.game-card:hover{transform:translateY(-5px) scale(1.04)}',
    '.game-card:active{transform:scale(0.96)}',
    '.gc-shine{position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.09),transparent);transform:skewX(-20deg);transition:left 0.55s;pointer-events:none}',
    '.game-card:hover .gc-shine{left:150%}',
    '.gc-icon{height:90px;display:flex;align-items:center;justify-content:center;position:relative}',
    '.gc-glow{position:absolute;inset:0;background:radial-gradient(circle at center,currentColor 0%,transparent 65%);opacity:0.13}',
    '.gc-badge{position:absolute;top:7px;right:7px;font-size:8px;font-weight:900;padding:2px 7px;border-radius:20px;letter-spacing:0.8px;text-transform:uppercase}',
    '.gc-name{font-size:11px;font-weight:800;color:#fff;text-align:center;padding:4px 6px 10px;line-height:1.3}',
    '.gres{border-radius:14px;padding:14px;text-align:center;margin-top:10px;animation:result-pop 0.4s ease both}',
    '.gres.win{background:linear-gradient(135deg,rgba(74,222,128,0.14),rgba(74,222,128,0.05));border:1.5px solid rgba(74,222,128,0.4)}',
    '.gres.lose{background:linear-gradient(135deg,rgba(231,76,60,0.1),rgba(231,76,60,0.04));border:1.5px solid rgba(231,76,60,0.25)}',
    '.grt{font-size:17px;font-weight:900;margin-bottom:4px}',
    '.gres.win .grt{color:#4ade80}.gres.lose .grt{color:#e74c3c}',
    '.grs{font-size:12px;color:var(--txt2)}',
    '.chip{padding:6px 14px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s}',
    '.chip:hover{border-color:var(--accent);color:var(--accent)}',
    '.gcbtn{flex:1;padding:11px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:13px;font-weight:700;cursor:pointer;transition:all 0.15s;text-align:center}',
    '.gcbtn.sel{background:var(--accent);color:#000;border-color:var(--accent)}',
    '.gcbtn:hover:not(.sel){border-color:var(--accent);color:var(--accent)}',
    '.play-card{background:var(--bg2);border:1.5px solid var(--border);border-radius:10px;padding:10px 14px;font-size:22px;font-weight:900;min-width:48px;text-align:center;display:inline-block}',
    '.mine-btn{width:100%;aspect-ratio:1;border-radius:10px;background:linear-gradient(135deg,#0d1f3c,#1a3a6a);border:2px solid #4ade8055;font-size:22px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center}',
    '.mine-btn:hover{border-color:#4ade80;background:linear-gradient(135deg,#0a3d1a,#0d4d22);transform:scale(1.05)}',
    '.mine-btn:active{transform:scale(0.93)}',
    '.mine-btn.revealed-safe{background:rgba(74,222,128,0.12);border-color:#4ade80;animation:mine-reveal 0.3s ease}',
    '.mine-btn.revealed-bomb{background:rgba(231,76,60,0.15);border-color:#e74c3c;animation:mine-reveal 0.3s ease}',
    '.tower-row{display:grid;grid-template-columns:28px 1fr 1fr 1fr;gap:5px;align-items:center}',
    '.tower-btn{height:48px;border-radius:10px;border:2px solid #4ade8055;background:linear-gradient(135deg,#0d1f3c,#1a3a6a);font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;animation:tower-glow 2s ease infinite}',
    '.tower-btn:hover{border-color:#4ade80;background:linear-gradient(135deg,#0a3d1a,#0d5224);transform:scale(1.06)}',
    '.tower-btn.safe{background:rgba(74,222,128,0.15);border-color:#4ade80;box-shadow:0 0 14px #4ade8055}',
    '.tower-btn.bomb{background:rgba(231,76,60,0.15);border-color:#e74c3c;box-shadow:0 0 14px #e74c3c55}',
    '.tower-btn.future{opacity:0.3;cursor:default;animation:none}',
    '.hilo-card{background:var(--bg2);border:2px solid var(--border);border-radius:10px;padding:10px 16px;font-size:28px;font-weight:900;text-align:center;min-width:60px;display:inline-block;transition:all 0.3s}',
    '.cres{border-radius:12px;padding:10px;text-align:center;margin:6px 16px}',
    '.cres.win{background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.3)}',
    '.cres.lose{background:rgba(231,76,60,0.08);border:1px solid rgba(231,76,60,0.2)}',
    '.crt{font-size:15px;font-weight:800}.cres.win .crt{color:#4ade80}.cres.lose .crt{color:#e74c3c}',
    '.crs{font-size:11px;color:var(--txt2)}',
  ].join('');
  document.head.appendChild(st);
})();

// ── CARD RENDERING ──
function buildGameLogo(g,d){
  var c1=d.c1||'#4ade80', c2=d.c2||'#86efac', id=g.id||'x';
  if(g.type==='crash'){
    if(g.vehicle==='plane') return '<svg width="52" height="52" viewBox="0 0 52 52"><defs><linearGradient id="p'+id+'" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="'+c1+'"/><stop offset="100%" stop-color="'+c2+'"/></linearGradient></defs><ellipse cx="26" cy="26" rx="18" ry="7" fill="url(#p'+id+')" opacity="0.9"/><polygon points="44,26 32,20 32,32" fill="'+c2+'"/><polygon points="20,18 26,26 20,34 12,34 16,26 12,18" fill="'+c1+'" opacity="0.85"/><polygon points="36,20 42,26 36,32 34,26" fill="'+c2+'" opacity="0.6"/><circle cx="28" cy="26" r="3" fill="'+c2+'"/></svg>';
    if(g.vehicle==='lightning') return '<svg width="52" height="52" viewBox="0 0 52 52"><polygon points="32,4 17,28 25,28 18,50 38,22 30,22" fill="'+c1+'"/><polygon points="32,4 17,28 25,28 18,50 38,22 30,22" fill="'+c2+'" opacity="0.4"/></svg>';
    return '<svg width="52" height="52" viewBox="0 0 52 52"><defs><linearGradient id="r'+id+'" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="'+c1+'"/><stop offset="100%" stop-color="'+c2+'"/></linearGradient></defs><ellipse cx="26" cy="32" rx="10" ry="13" fill="url(#r'+id+')"/><polygon points="26,8 20,24 32,24" fill="'+c2+'"/><polygon points="14,35 20,28 20,39" fill="'+c1+'" opacity="0.8"/><polygon points="38,35 32,28 32,39" fill="'+c1+'" opacity="0.8"/><circle cx="26" cy="24" r="5" fill="'+c2+'" opacity="0.9"/><ellipse cx="26" cy="44" rx="7" ry="3" fill="'+c1+'" opacity="0.35"/></svg>';
  }
  if(g.type==='slots') return '<svg width="52" height="52" viewBox="0 0 52 52"><rect x="4" y="10" width="14" height="30" rx="3" fill="'+c1+'" opacity="0.85"/><rect x="19" y="10" width="14" height="30" rx="3" fill="'+c2+'" opacity="0.9"/><rect x="34" y="10" width="14" height="30" rx="3" fill="'+c1+'" opacity="0.85"/><text x="11" y="31" font-size="10" fill="#fff" text-anchor="middle" font-weight="900">7</text><text x="26" y="31" font-size="10" fill="#fff" text-anchor="middle" font-weight="900">★</text><text x="41" y="31" font-size="10" fill="#fff" text-anchor="middle" font-weight="900">7</text><line x1="4" y1="25" x2="48" y2="25" stroke="'+c2+'" stroke-width="1.5" opacity="0.5"/></svg>';
  if(g.type==='bj') return '<svg width="52" height="52" viewBox="0 0 52 52"><rect x="6" y="8" width="22" height="30" rx="4" fill="'+c1+'" opacity="0.9"/><rect x="22" y="14" width="22" height="30" rx="4" fill="'+c2+'" opacity="0.85"/><text x="16" y="28" font-size="14" fill="#fff" text-anchor="middle" font-weight="900">A</text><text x="33" y="34" font-size="14" fill="#fff" text-anchor="middle" font-weight="900">K</text><text x="8" y="16" font-size="8" fill="#fff">♠</text><text x="34" y="44" font-size="8" fill="#fff">♥</text></svg>';
  if(g.type==='roulette') return '<svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="21" fill="none" stroke="'+c1+'" stroke-width="3"/><circle cx="26" cy="26" r="13" fill="none" stroke="'+c2+'" stroke-width="1.5" opacity="0.6"/><path d="M26,5 A21,21 0 0,1 47,26" fill="'+c1+'" opacity="0.7"/><path d="M47,26 A21,21 0 0,1 26,47" fill="#1a3a6a" opacity="0.8"/><path d="M26,47 A21,21 0 0,1 5,26" fill="'+c1+'" opacity="0.5"/><path d="M5,26 A21,21 0 0,1 26,5" fill="#1a3a6a" opacity="0.8"/><circle cx="26" cy="26" r="5" fill="'+c2+'"/></svg>';
  if(g.type==='dice') return '<svg width="52" height="52" viewBox="0 0 52 52"><rect x="4" y="14" width="24" height="24" rx="5" fill="'+c1+'" opacity="0.9"/><circle cx="12" cy="22" r="2.5" fill="#fff"/><circle cx="20" cy="22" r="2.5" fill="#fff"/><circle cx="12" cy="30" r="2.5" fill="#fff"/><circle cx="20" cy="30" r="2.5" fill="#fff"/><rect x="24" y="6" width="24" height="24" rx="5" fill="'+c2+'" opacity="0.85"/><circle cx="36" cy="18" r="2.5" fill="#fff"/></svg>';
  if(g.type==='wheel') return '<svg width="52" height="52" viewBox="0 0 52 52"><path d="M26,5 A21,21 0 0,1 47,26" fill="'+c1+'" opacity="0.9"/><path d="M47,26 A21,21 0 0,1 26,47" fill="'+c2+'" opacity="0.9"/><path d="M26,47 A21,21 0 0,1 5,26" fill="'+c1+'" opacity="0.7"/><path d="M5,26 A21,21 0 0,1 26,5" fill="'+c2+'" opacity="0.7"/><circle cx="26" cy="26" r="6" fill="#fff"/><circle cx="26" cy="5" r="3" fill="'+c1+'"/></svg>';
  if(g.type==='coin') return '<svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="21" fill="'+c1+'" opacity="0.85" stroke="'+c2+'" stroke-width="2"/><circle cx="26" cy="26" r="15" fill="none" stroke="'+c2+'" stroke-width="1.5" opacity="0.5"/><text x="26" y="32" font-size="15" fill="#fff" text-anchor="middle" font-weight="900">₿</text></svg>';
  if(g.type==='mines') return '<svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="15" fill="'+c1+'" opacity="0.85"/><circle cx="26" cy="26" r="9" fill="#0a0000"/><line x1="26" y1="4" x2="26" y2="48" stroke="'+c1+'" stroke-width="2.5" stroke-linecap="round"/><line x1="4" y1="26" x2="48" y2="26" stroke="'+c1+'" stroke-width="2.5" stroke-linecap="round"/><line x1="10" y1="10" x2="42" y2="42" stroke="'+c1+'" stroke-width="2" stroke-linecap="round"/><line x1="42" y1="10" x2="10" y2="42" stroke="'+c1+'" stroke-width="2" stroke-linecap="round"/><circle cx="26" cy="26" r="4" fill="'+c2+'"/></svg>';
  if(g.type==='tower') return '<svg width="52" height="52" viewBox="0 0 52 52"><rect x="19" y="38" width="14" height="10" rx="2" fill="'+c1+'" opacity="0.9"/><rect x="15" y="27" width="22" height="12" rx="2" fill="'+c2+'" opacity="0.85"/><rect x="11" y="16" width="30" height="12" rx="2" fill="'+c1+'" opacity="0.8"/><rect x="19" y="5" width="14" height="12" rx="2" fill="'+c2+'" opacity="0.9"/><circle cx="26" cy="3" r="3" fill="'+c2+'"/></svg>';
  if(g.type==='plinko') return '<svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="8" r="5" fill="'+c2+'" opacity="0.95"/><circle cx="17" cy="20" r="3" fill="'+c1+'" opacity="0.7"/><circle cx="35" cy="20" r="3" fill="'+c1+'" opacity="0.7"/><circle cx="8" cy="32" r="3" fill="'+c1+'" opacity="0.6"/><circle cx="26" cy="32" r="3" fill="'+c1+'" opacity="0.6"/><circle cx="44" cy="32" r="3" fill="'+c1+'" opacity="0.6"/><rect x="3" y="44" width="13" height="6" rx="2" fill="'+c2+'" opacity="0.7"/><rect x="20" y="44" width="12" height="6" rx="2" fill="'+c1+'" opacity="0.95"/><rect x="36" y="44" width="13" height="6" rx="2" fill="'+c2+'" opacity="0.7"/></svg>';
  if(g.type==='hilo') return '<svg width="52" height="52" viewBox="0 0 52 52"><rect x="4" y="16" width="20" height="28" rx="4" fill="'+c1+'" opacity="0.9"/><rect x="28" y="8" width="20" height="28" rx="4" fill="'+c2+'" opacity="0.9"/><text x="14" y="35" font-size="14" fill="#fff" text-anchor="middle" font-weight="900">2</text><text x="38" y="27" font-size="14" fill="#fff" text-anchor="middle" font-weight="900">A</text><polygon points="26,24 22,32 30,32" fill="#fff" opacity="0.9"/></svg>';
  if(g.type==='war') return '<svg width="52" height="52" viewBox="0 0 52 52"><rect x="4" y="10" width="20" height="28" rx="4" fill="'+c1+'" opacity="0.9"/><rect x="28" y="14" width="20" height="28" rx="4" fill="'+c2+'" opacity="0.7"/><text x="14" y="30" font-size="14" fill="#fff" text-anchor="middle" font-weight="900">A</text><text x="38" y="34" font-size="14" fill="#fff" text-anchor="middle" font-weight="900">K</text><line x1="26" y1="8" x2="26" y2="44" stroke="#fff" stroke-width="2" opacity="0.5"/></svg>';
  if(g.type==='dt') return '<svg width="52" height="52" viewBox="0 0 52 52"><text x="6" y="34" font-size="22">🐉</text><text x="28" y="34" font-size="22">🐯</text><line x1="26" y1="8" x2="26" y2="44" stroke="'+c1+'" stroke-width="2" opacity="0.5"/></svg>';
  if(g.type==='bac') return '<svg width="52" height="52" viewBox="0 0 52 52"><rect x="4" y="8" width="18" height="26" rx="3" fill="'+c1+'" opacity="0.9"/><rect x="18" y="14" width="18" height="26" rx="3" fill="'+c2+'" opacity="0.7"/><rect x="32" y="10" width="16" height="22" rx="3" fill="'+c1+'" opacity="0.8"/><text x="13" y="26" font-size="12" fill="#fff" text-anchor="middle" font-weight="900">B</text><text x="27" y="32" font-size="12" fill="#fff" text-anchor="middle" font-weight="900">P</text></svg>';
  // Default emoji with glow
  return '<div style="font-size:34px;filter:drop-shadow(0 0 8px '+c2+');">'+(g.icon||'🎮')+'</div>';
}

function renderCasinoGrid(){
  var wrap=$('cgrid');if(!wrap)return;wrap.innerHTML='';
  var sections=[
    {label:'🚀 Crash Games',color:'#4ade80',types:['crash']},
    {label:'🎰 Slots',color:'#a855f7',types:['slots']},
    {label:'🃏 Card Games',color:'#38bdf8',types:['bj','hilo','war','dt','bac']},
    {label:'🎲 Numbers & More',color:'#06b6d4',types:['dice','roulette','keno','bigsmall','oddeven','lucky','colorpick','colorball','wheel','coin']},
    {label:'💣 Mines & Tower',color:'#ef4444',types:['mines','tower','plinko']},
  ];
  sections.forEach(function(sec){
    var list=ALL_CASINO.filter(function(g){return sec.types.indexOf(g.type)>=0;});
    if(!list.length)return;
    var hdr=document.createElement('div');
    hdr.style.cssText='display:flex;align-items:center;gap:10px;padding:16px 1rem 10px;';
    hdr.innerHTML='<span style="font-size:14px;font-weight:900;color:'+sec.color+';">'+sec.label+'</span><div style="flex:1;height:1px;background:linear-gradient(to right,'+sec.color+'44,transparent);"></div>';
    wrap.appendChild(hdr);
    var grid=document.createElement('div');
    grid.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 1rem 6px;';
    list.forEach(function(g){
      var d=GAME_DESIGNS[g.id]||{bg:'linear-gradient(135deg,#0a1525,#0d2040)',c1:'#4ade80',c2:'#86efac',badge:''};
      var card=document.createElement('div');
      card.className='game-card';
      card.style.cssText='background:'+d.bg+';border:1px solid '+d.c1+'33;';
      card.innerHTML='<div class="gc-shine"></div>'+
        (d.badge?'<div class="gc-badge" style="background:'+d.c1+'22;color:'+d.c1+';border:1px solid '+d.c1+'44;">'+d.badge+'</div>':'')+
        '<div class="gc-icon" style="color:'+d.c2+';"><div class="gc-glow"></div>'+buildGameLogo(g,d)+'</div>'+
        '<div class="gc-name">'+g.name+'</div>';
      card.onclick=function(){openGame(g);};
      card.addEventListener('mouseenter',function(){card.style.transform='translateY(-5px) scale(1.04)';card.style.boxShadow='0 10px 25px '+d.c1+'44';card.style.borderColor=d.c1+'66';});
      card.addEventListener('mouseleave',function(){card.style.transform='';card.style.boxShadow='';card.style.borderColor=d.c1+'33';});
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
  });
}

function renderHotGames(list){
  var wrap=$('hotscroll');if(!wrap)return;wrap.innerHTML='';
  var lbl=$('hot-section-label');if(lbl)lbl.style.display=list.length?'flex':'none';
  list.forEach(function(g){
    var d=GAME_DESIGNS[g.id]||{bg:'linear-gradient(135deg,#0d1f3c,#1a3a7c)',c1:'#4ade80',c2:'#86efac',badge:''};
    var badge=g.badge==='hbl'?{l:'LIVE',c:'#4ade80'}:g.badge==='hbh'?{l:'HOT',c:'#f97316'}:{l:'NEW',c:'#3b82f6'};
    var card=document.createElement('div');
    card.style.cssText='flex-shrink:0;width:115px;border-radius:14px;overflow:hidden;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;background:'+d.bg+';border:1px solid '+d.c1+'33;';
    card.innerHTML='<div style="height:82px;display:flex;align-items:center;justify-content:center;position:relative;">'+
      '<div style="position:absolute;inset:0;background:radial-gradient(circle,'+d.c2+'18,transparent);"></div>'+
      '<div style="position:relative;z-index:1;">'+buildGameLogo(g,d)+'</div>'+
      '<div style="position:absolute;top:6px;right:6px;background:'+badge.c+'22;color:'+badge.c+';border:1px solid '+badge.c+'44;font-size:8px;font-weight:900;padding:2px 7px;border-radius:12px;">'+badge.l+'</div>'+
    '</div>'+
    '<div style="padding:0 8px 10px;text-align:center;font-size:11px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+g.name+'</div>';
    card.onclick=function(){openGame(g);};
    card.addEventListener('mouseenter',function(){card.style.transform='translateY(-4px) scale(1.05)';card.style.boxShadow='0 8px 20px '+d.c1+'44';});
    card.addEventListener('mouseleave',function(){card.style.transform='';card.style.boxShadow='';});
    wrap.appendChild(card);
  });
}

function loadHotGames(){
  fbGet('/adminSettings/hotGames').then(function(data){
    var list=data?HOT_GAMES.filter(function(g){return data[g.id];}):HOT_GAMES;
    if(!list.length)list=HOT_GAMES;
    renderHotGames(list.slice(0,10));
    renderCasinoGrid();
  }).catch(function(){renderHotGames(HOT_GAMES.slice(0,10));renderCasinoGrid();});
}

// ── OPEN GAME ──
function openGame(g){
  if(!CD){alert('Please login first.');return;}
  if(g.type==='crash'){openCrash(g);return;}
  currentGame=g; gState={};
  var titleEl=$('gtitle');if(titleEl)titleEl.textContent=g.name;
  var balEl=$('gbal');if(balEl)balEl.textContent=fmt(bal());
  buildChips();
  // Clear previous state
  var gma=$('gma');if(gma)gma.innerHTML='';
  var gres=$('gres');if(gres){gres.style.display='none';}
  var gbinp=$('gbinp');if(gbinp)gbinp.value='';
  var gpbtn=$('gpbtn');
  if(gpbtn){
    gpbtn.disabled=false;
    gpbtn.textContent='Play';
    gpbtn.onclick=function(){doPlayGame(g);};
  }
  var gcl=$('gclose');
  if(gcl)gcl.onclick=function(){$('gov').classList.remove('open');};
  buildGameUI(g);
  $('gov').classList.add('open');
}

function doPlayGame(g){
  var bet=getBetVal();
  if(!bet||bet<1){alert('Enter a bet amount.');return;}
  if(bet>bal()){alert('Insufficient balance: '+fmt(bal()));return;}
  var btn=$('gpbtn');if(btn){btn.disabled=true;btn.textContent='Playing...';}
  var gres=$('gres');if(gres)gres.style.display='none';
  // Route to specific games
  if(g.type==='bj'){startBJ(g,bet);return;}
  if(g.type==='mines'){startMines(g,bet);return;}
  if(g.type==='tower'){startTower(g,bet);return;}
  if(g.type==='plinko'){startPlinko(g,bet);return;}
  // Deduct for instant games
  deductBet(bet);
  var won=wc();
  setTimeout(function(){runInstantGame(g,bet,won,btn);},350);
}

function enablePlayBtn(){
  var btn=$('gpbtn');if(btn){btn.disabled=false;btn.textContent='Play Again';}
}

// ── BUILD GAME UI ──
function buildGameUI(g){
  var area=$('gma');if(!area)return;
  area.innerHTML='';
  var t=g.type;

  if(t==='slots'){
    var d=GAME_DESIGNS[g.id]||{c1:'#a855f7',c2:'#d8b4fe'};
    var syms=SLOT_SYMS[g.syms]||SLOT_SYMS.slots1;
    area.innerHTML=
      '<div style="background:linear-gradient(135deg,#080d18,#0d1a30);border-radius:16px;padding:16px;border:1px solid '+d.c1+'33;margin-bottom:8px;">'+
      // Top lights
      '<div style="display:flex;justify-content:center;gap:6px;margin-bottom:12px;">'+
        [d.c1,'#fff',d.c1,'#fff',d.c1].map(function(c){return '<div style="width:9px;height:9px;border-radius:50%;background:'+c+';box-shadow:0 0 8px '+c+'55;"></div>';}).join('')+
      '</div>'+
      // Reel frame
      '<div style="background:#040810;border-radius:12px;padding:10px;border:2px solid '+d.c1+'44;margin-bottom:12px;">'+
        '<div style="display:flex;gap:8px;justify-content:center;">'+
        [0,1,2].map(function(i){
          return '<div style="flex:1;height:76px;background:#050a18;border-radius:8px;border:1.5px solid '+d.c1+'33;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;">'+
            '<div id="sr'+i+'" style="font-size:36px;transition:all 0.2s;position:relative;z-index:1;">'+pickArr(syms)+'</div>'+
            '<div style="position:absolute;top:0;width:100%;height:30%;background:linear-gradient(to bottom,#050a18,transparent);pointer-events:none;"></div>'+
            '<div style="position:absolute;bottom:0;width:100%;height:30%;background:linear-gradient(to top,#050a18,transparent);pointer-events:none;"></div>'+
          '</div>';
        }).join('')+
        '</div>'+
        // Win line
        '<div style="height:2px;background:linear-gradient(to right,transparent,'+d.c1+',transparent);margin-top:8px;opacity:0.6;"></div>'+
      '</div>'+
      // Paytable
      '<div style="display:flex;justify-content:space-around;font-size:10px;color:var(--txt2);">'+
        '<div style="text-align:center;"><div style="font-size:13px;">'+syms[0]+syms[0]+syms[0]+'</div><div style="color:'+d.c1+';font-weight:800;">'+(g.mult||3)+'x</div></div>'+
        '<div style="text-align:center;"><div style="font-size:13px;">'+syms[1]+syms[1]+syms[1]+'</div><div style="color:'+d.c1+';font-weight:800;">'+(g.mult||3)+'x</div></div>'+
        '<div style="text-align:center;"><div style="font-size:13px;">'+syms[2]+syms[2]+syms[2]+'</div><div style="color:'+d.c1+';font-weight:800;">'+(g.mult||3)+'x</div></div>'+
      '</div>'+
      '</div>';
  }

  if(t==='coin'){
    area.innerHTML='<div style="text-align:center;padding:14px 0;">'+
      '<div id="coinface" style="font-size:56px;margin-bottom:16px;filter:drop-shadow(0 0 12px #eab30888);transition:all 0.4s;">🌕</div>'+
      '<div style="font-size:12px;color:var(--txt2);margin-bottom:12px;">Choose your side</div>'+
      '<div style="display:flex;gap:10px;justify-content:center;">'+
        '<button class="gcbtn sel" id="coin-h" data-v="HEADS" onclick="selectCoin(this)">🌕 HEADS</button>'+
        '<button class="gcbtn" id="coin-t" data-v="TAILS" onclick="selectCoin(this)">🌑 TAILS</button>'+
      '</div></div>';
  }

  if(t==='roulette'){
    area.innerHTML='<div style="text-align:center;padding:10px 0;">'+
      '<div style="font-size:44px;margin-bottom:4px;">🎡</div>'+
      '<div id="roulres" style="font-size:18px;font-weight:900;color:var(--accent);margin-bottom:14px;min-height:26px;"> </div>'+
      '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">'+
        '<button class="gcbtn sel" id="rp-r" data-v="red" onclick="selectRoul(this)" style="background:rgba(231,76,60,0.15);border-color:#e74c3c;color:#e74c3c;">🔴 Red (2x)</button>'+
        '<button class="gcbtn" id="rp-b" data-v="black" onclick="selectRoul(this)" style="color:#aaa;">⚫ Black (2x)</button>'+
        '<button class="gcbtn" id="rp-g" data-v="green" onclick="selectRoul(this)" style="color:#4ade80;">🟢 Zero (14x)</button>'+
      '</div></div>';
  }

  if(t==='hilo'){
    var cards=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    var cur=cards[rnd(0,cards.length-1)];
    gState.hiloCard=cur;
    area.innerHTML='<div style="text-align:center;padding:12px 0;">'+
      '<div style="font-size:13px;color:var(--txt2);margin-bottom:8px;">Current card:</div>'+
      '<div id="hilo-cur" class="hilo-card" style="font-size:32px;margin:0 auto 16px;width:70px;">'+cur+'</div>'+
      '<div style="font-size:12px;color:var(--txt2);margin-bottom:10px;">Next card will be:</div>'+
      '<div style="display:flex;gap:10px;justify-content:center;">'+
        '<button class="gcbtn sel" id="hi-btn" data-v="high" onclick="selectHilo(this)">▲ Higher</button>'+
        '<button class="gcbtn" id="lo-btn" data-v="low" onclick="selectHilo(this)">▼ Lower</button>'+
      '</div></div>';
  }

  if(t==='war'){
    area.innerHTML='<div style="padding:10px 0;">'+
      '<div style="display:flex;justify-content:space-around;align-items:center;margin-bottom:16px;">'+
        '<div style="text-align:center;"><div style="font-size:11px;color:var(--txt2);margin-bottom:6px;">YOU</div><div id="war-p" class="hilo-card" style="font-size:30px;width:60px;margin:0 auto;">?</div></div>'+
        '<div style="font-size:16px;font-weight:900;color:var(--txt2);">VS</div>'+
        '<div style="text-align:center;"><div style="font-size:11px;color:var(--txt2);margin-bottom:6px;">DEALER</div><div id="war-d" class="hilo-card" style="font-size:30px;width:60px;margin:0 auto;color:#e74c3c;">?</div></div>'+
      '</div>'+
      '<div style="font-size:11px;color:var(--txt2);text-align:center;">Higher card wins! • 2x payout</div>'+
    '</div>';
  }

  if(t==='dt'){
    area.innerHTML='<div style="padding:10px 0;">'+
      '<div style="display:flex;justify-content:space-around;align-items:center;margin-bottom:14px;">'+
        '<div style="text-align:center;"><div style="font-size:24px;margin-bottom:4px;">🐉</div><div id="dt-d" class="hilo-card" style="font-size:28px;width:56px;margin:0 auto;">?</div><div style="font-size:11px;color:var(--txt2);margin-top:4px;">Dragon</div></div>'+
        '<div style="font-size:14px;font-weight:900;color:var(--txt2);margin-top:20px;">VS</div>'+
        '<div style="text-align:center;"><div style="font-size:24px;margin-bottom:4px;">🐯</div><div id="dt-t" class="hilo-card" style="font-size:28px;width:56px;margin:0 auto;">?</div><div style="font-size:11px;color:var(--txt2);margin-top:4px;">Tiger</div></div>'+
      '</div>'+
      '<div style="display:flex;gap:10px;justify-content:center;">'+
        '<button class="gcbtn sel" id="dt-pick" data-v="dragon" onclick="selectDT(this)">🐉 Dragon</button>'+
        '<button class="gcbtn" data-v="tiger" onclick="selectDT(this)">🐯 Tiger</button>'+
      '</div></div>';
  }

  if(t==='bac'){
    area.innerHTML='<div style="padding:10px 0;">'+
      '<div style="display:flex;justify-content:space-around;margin-bottom:14px;">'+
        '<div style="text-align:center;"><div style="font-size:12px;color:var(--txt2);margin-bottom:6px;">BANKER</div><div id="bac-b" class="hilo-card" style="font-size:28px;color:#e74c3c;width:56px;margin:0 auto;">?</div></div>'+
        '<div style="text-align:center;"><div style="font-size:12px;color:var(--txt2);margin-bottom:6px;">PLAYER</div><div id="bac-p" class="hilo-card" style="font-size:28px;color:#3b82f6;width:56px;margin:0 auto;">?</div></div>'+
      '</div>'+
      '<div style="display:flex;gap:8px;justify-content:center;">'+
        '<button class="gcbtn sel" id="bac-pick" data-v="banker" onclick="selectBac(this)">Banker (2x)</button>'+
        '<button class="gcbtn" data-v="player" onclick="selectBac(this)">Player (2x)</button>'+
        '<button class="gcbtn" data-v="tie" onclick="selectBac(this)">Tie (8x)</button>'+
      '</div></div>';
  }

  if(t==='dice'){
    area.innerHTML='<div style="text-align:center;padding:12px 0;">'+
      '<div style="display:flex;gap:12px;justify-content:center;margin-bottom:14px;">'+
        [0,1].map(function(i){return '<div id="die'+i+'" style="width:60px;height:60px;background:var(--card);border:2px solid var(--border);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:32px;">🎲</div>';}).join('')+
      '</div>'+
      '<div id="dice-res" style="font-size:20px;font-weight:900;color:var(--accent);min-height:28px;"></div>'+
      '<div style="font-size:11px;color:var(--txt2);margin-top:4px;">Roll higher numbers to win!</div>'+
    '</div>';
  }

  if(t==='wheel'){
    var segs=[{l:'2x',v:2,c:'#4ade80'},{l:'0x',v:0,c:'#e74c3c'},{l:'3x',v:3,c:'#3b82f6'},{l:'0x',v:0,c:'#e74c3c'},{l:'5x',v:5,c:'#f6c90e'},{l:'0x',v:0,c:'#e74c3c'},{l:'1.5x',v:1.5,c:'#a855f7'},{l:'0x',v:0,c:'#e74c3c'}];
    area.innerHTML='<div style="text-align:center;padding:12px 0;">'+
      '<canvas id="wheel-canvas" width="220" height="220" style="max-width:100%;border-radius:50%;"></canvas>'+
      '<div id="wheel-res" style="font-size:22px;font-weight:900;color:var(--accent);margin-top:10px;min-height:30px;"></div>'+
    '</div>';
    drawWheelCanvas(segs, -1);
    gState.wheelSegs=segs;
  }

  if(t==='bigsmall'){
    area.innerHTML='<div style="text-align:center;padding:12px 0;">'+
      '<div style="font-size:13px;color:var(--txt2);margin-bottom:14px;">Pick BIG (7+) or SMALL (6-)</div>'+
      '<div style="display:flex;gap:12px;justify-content:center;margin-bottom:14px;">'+
        '<button class="gcbtn sel" id="bs-pick" data-v="big" onclick="selectBS(this)" style="flex:1;padding:16px;font-size:16px;">BIG 📈</button>'+
        '<button class="gcbtn" data-v="small" onclick="selectBS(this)" style="flex:1;padding:16px;font-size:16px;">SMALL 📉</button>'+
      '</div>'+
      '<div id="bs-dice" style="font-size:36px;min-height:44px;"></div>'+
    '</div>';
  }

  if(t==='oddeven'){
    area.innerHTML='<div style="text-align:center;padding:12px 0;">'+
      '<div style="font-size:13px;color:var(--txt2);margin-bottom:14px;">Pick ODD or EVEN number</div>'+
      '<div style="display:flex;gap:12px;justify-content:center;margin-bottom:14px;">'+
        '<button class="gcbtn sel" id="oe-pick" data-v="odd" onclick="selectOE(this)" style="flex:1;padding:16px;font-size:16px;">ODD 🔴</button>'+
        '<button class="gcbtn" data-v="even" onclick="selectOE(this)" style="flex:1;padding:16px;font-size:16px;">EVEN 🔵</button>'+
      '</div>'+
      '<div id="oe-num" style="font-size:44px;font-weight:900;color:var(--accent);min-height:54px;"></div>'+
    '</div>';
  }

  if(t==='lucky'){
    area.innerHTML='<div style="text-align:center;padding:12px 0;">'+
      '<div style="font-size:13px;color:var(--txt2);margin-bottom:10px;">Pick a lucky number (1-'+(g.max||10)+')</div>'+
      '<input type="number" id="lucky-inp" min="1" max="'+(g.max||10)+'" value="7" style="width:90px;padding:12px;font-size:28px;font-weight:900;text-align:center;border-radius:12px;border:2px solid var(--accent);background:var(--bg2);color:var(--txt);outline:none;margin-bottom:10px;"/>'+
      '<div id="lucky-res" style="font-size:28px;min-height:36px;font-weight:900;color:var(--accent);"></div>'+
      '<div style="font-size:11px;color:var(--txt2);">Guess correct = '+(g.mult||8)+'x win!</div>'+
    '</div>';
  }

  if(t==='keno'){
    area.innerHTML='<div style="padding:10px 0;">'+
      '<div style="font-size:12px;color:var(--txt2);margin-bottom:10px;text-align:center;">Pick up to 5 numbers then press Play</div>'+
      '<div id="keno-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-bottom:10px;"></div>'+
      '<div id="keno-res" style="text-align:center;font-size:14px;font-weight:700;color:var(--accent);min-height:20px;"></div>'+
    '</div>';
    var kg=document.getElementById('keno-grid');
    gState.kenoPicks=[];
    for(var kn=1;kn<=20;kn++){
      (function(num){
        var b=document.createElement('button');
        b.className='chip';
        b.style.cssText='width:100%;aspect-ratio:1;font-weight:800;font-size:13px;';
        b.textContent=num;
        b.onclick=function(){
          if(gState.kenoPicks.indexOf(num)>=0){
            gState.kenoPicks=gState.kenoPicks.filter(function(n){return n!==num;});
            b.classList.remove('sel');
          } else if(gState.kenoPicks.length<5){
            gState.kenoPicks.push(num);
            b.classList.add('sel');
          }
        };
        kg.appendChild(b);
      })(kn);
    }
  }

  if(t==='colorpick'||t==='colorball'){
    area.innerHTML='<div style="text-align:center;padding:12px 0;">'+
      '<div id="cball" style="font-size:52px;margin-bottom:14px;transition:all 0.4s;filter:drop-shadow(0 0 12px currentColor);">🔵</div>'+
      '<div style="display:flex;gap:10px;justify-content:center;">'+
        '<button class="gcbtn sel" id="cp-pick" data-v="Red" onclick="selectColor(this)" style="color:#e74c3c;border-color:#e74c3c;background:rgba(231,76,60,0.1);">🔴 Red</button>'+
        '<button class="gcbtn" data-v="Blue" onclick="selectColor(this)" style="color:#3b82f6;border-color:#3b82f6;background:rgba(59,130,246,0.1);">🔵 Blue</button>'+
        '<button class="gcbtn" data-v="Green" onclick="selectColor(this)" style="color:#4ade80;border-color:#4ade80;background:rgba(74,222,128,0.1);">🟢 Green</button>'+
      '</div></div>';
  }
}

// ── SELECTOR FUNCTIONS ──
window.selectCoin=function(btn){document.querySelectorAll('#coin-h,#coin-t').forEach(function(b){b.classList.remove('sel');});btn.classList.add('sel');};
window.selectRoul=function(btn){document.querySelectorAll('#rp-r,#rp-b,#rp-g').forEach(function(b){b.classList.remove('sel');b.style.opacity='0.6';});btn.classList.add('sel');btn.style.opacity='1';};
window.selectHilo=function(btn){document.querySelectorAll('#hi-btn,#lo-btn').forEach(function(b){b.classList.remove('sel');});btn.classList.add('sel');};
window.selectDT=function(btn){document.querySelectorAll('[onclick*="selectDT"]').forEach(function(b){b.classList.remove('sel');});btn.classList.add('sel');$('dt-pick').dataset.v=btn.dataset.v;};
window.selectBac=function(btn){document.querySelectorAll('[onclick*="selectBac"]').forEach(function(b){b.classList.remove('sel');});btn.classList.add('sel');$('bac-pick').dataset.v=btn.dataset.v;};
window.selectBS=function(btn){document.querySelectorAll('[onclick*="selectBS"]').forEach(function(b){b.classList.remove('sel');});btn.classList.add('sel');$('bs-pick').dataset.v=btn.dataset.v;};
window.selectOE=function(btn){document.querySelectorAll('[onclick*="selectOE"]').forEach(function(b){b.classList.remove('sel');});btn.classList.add('sel');$('oe-pick').dataset.v=btn.dataset.v;};
window.selectColor=function(btn){document.querySelectorAll('[onclick*="selectColor"]').forEach(function(b){b.classList.remove('sel');});btn.classList.add('sel');$('cp-pick').dataset.v=btn.dataset.v;};

// ── WHEEL CANVAS ──
function drawWheelCanvas(segs, winner){
  var canvas=document.getElementById('wheel-canvas');if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var W=canvas.width,H=canvas.height,R=W/2-8,cx=W/2,cy=H/2;
  var arc=Math.PI*2/segs.length;
  ctx.clearRect(0,0,W,H);
  segs.forEach(function(s,i){
    var a=arc*i-Math.PI/2;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,a,a+arc);ctx.closePath();
    ctx.fillStyle=i===winner?s.c+'ff':s.c+'88';ctx.fill();
    ctx.strokeStyle='#050a18';ctx.lineWidth=2;ctx.stroke();
    // Label
    ctx.save();ctx.translate(cx,cy);ctx.rotate(a+arc/2);
    ctx.fillStyle='#fff';ctx.font='bold 13px sans-serif';ctx.textAlign='right';
    ctx.fillText(s.l,R-10,5);ctx.restore();
  });
  // Center
  ctx.beginPath();ctx.arc(cx,cy,14,0,Math.PI*2);ctx.fillStyle='#0a1525';ctx.fill();
  ctx.strokeStyle='#4ade80';ctx.lineWidth=2;ctx.stroke();
  // Pointer
  ctx.fillStyle='#f6c90e';
  ctx.beginPath();ctx.moveTo(cx,cy-R-2);ctx.lineTo(cx-8,cy-R+12);ctx.lineTo(cx+8,cy-R+12);ctx.closePath();ctx.fill();
}

// ── INSTANT GAMES ──
function runInstantGame(g,bet,won,btn){
  var t=g.type,payout=0;

  if(t==='slots'){
    var syms=SLOT_SYMS[g.syms]||SLOT_SYMS.slots1;
    var finalSyms;
    if(won){var ws=pickArr(syms);finalSyms=[ws,ws,ws];}
    else{finalSyms=[pickArr(syms),pickArr(syms),pickArr(syms)];if(finalSyms[0]===finalSyms[1]&&finalSyms[1]===finalSyms[2])finalSyms[2]=syms[(syms.indexOf(finalSyms[2])+1)%syms.length];}
    // Animate reels
    var stops=[600,950,1300];
    for(var ri=0;ri<3;ri++){
      (function(idx,sym){
        var reel=document.getElementById('sr'+idx);if(!reel)return;
        var spins=setInterval(function(){reel.textContent=pickArr(syms);reel.style.transform='scale(1.05) translateY('+(Math.random()*6-3)+'px)';},90);
        setTimeout(function(){
          clearInterval(spins);
          reel.textContent=sym;
          reel.style.transform='scale(1)';
          if(won&&idx===2){
            reel.style.color='#f6c90e';
            reel.style.textShadow='0 0 20px #f6c90e, 0 0 40px #f6c90e88';
            [0,1].forEach(function(j){
              var r=document.getElementById('sr'+j);
              if(r){r.style.color='#f6c90e';r.style.textShadow='0 0 20px #f6c90e88';}
            });
          }
        },stops[idx]);
      })(ri,finalSyms[ri]);
    }
    payout=won?Math.floor(bet*(g.mult||3)):0;
    setTimeout(function(){
      finishGame(won,payout,bet,g.id);
      showResult(won,won?'🎰 WIN! +'+fmt(payout):'No match — Try again','');
      enablePlayBtn();
    },1550);
    return;
  }

  if(t==='coin'){
    var pick=document.querySelector('#coin-h.sel,#coin-t.sel');
    var choice=pick?pick.dataset.v:'HEADS';
    var result=Math.random()<0.5?'HEADS':'TAILS';
    var cf=document.getElementById('coinface');
    // Flip animation
    if(cf){
      cf.style.transform='rotateY(720deg)';
      setTimeout(function(){cf.textContent=result==='HEADS'?'🌕':'🌑';cf.style.transform='rotateY(0deg)';},400);
    }
    won=wc()?result===choice:result!==choice;
    payout=won?Math.floor(bet*1.95):0;
    setTimeout(function(){
      finishGame(won,payout,bet,g.id);
      showResult(won,won?result+'! ✓ +'+fmt(payout):result+' — Lost',choice+' vs '+result);
      enablePlayBtn();
    },600);
    return;
  }

  if(t==='roulette'){
    var num=rnd(0,36);
    var redNums=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    var color=num===0?'green':redNums.indexOf(num)>=0?'red':'black';
    var sel=document.querySelector('#rp-r.sel,#rp-b.sel,#rp-g.sel');
    var choice=sel?sel.dataset.v:'red';
    won=color===choice;
    var mult=choice==='green'?14:1.95;
    payout=won?Math.floor(bet*mult):0;
    var rr=document.getElementById('roulres');
    if(rr){
      rr.style.opacity='0';
      setTimeout(function(){
        rr.style.opacity='1';
        rr.textContent=num+' '+{red:'🔴',black:'⚫',green:'🟢'}[color]+' '+color.toUpperCase();
        rr.style.color={red:'#e74c3c',black:'#ccc',green:'#4ade80'}[color];
      },300);
    }
    setTimeout(function(){
      finishGame(won,payout,bet,g.id);
      showResult(won,won?num+' '+color.toUpperCase()+'! +'+fmt(payout):num+' '+color.toUpperCase()+' — Lost','');
      enablePlayBtn();
    },500);
    return;
  }

  if(t==='hilo'){
    var cards=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    var cv=gState.hiloCard||cards[6];
    var cidx=cards.indexOf(cv);
    var next=cards[rnd(0,cards.length-1)];
    var nidx=cards.indexOf(next);
    var sel2=document.querySelector('#hi-btn.sel,#lo-btn.sel');
    var choice2=sel2?sel2.dataset.v:'high';
    won=wc()?(choice2==='high'?nidx>cidx:nidx<cidx):(choice2==='high'?nidx<=cidx:nidx>=cidx);
    payout=won?Math.floor(bet*1.95):0;
    var nc=document.getElementById('hilo-cur');
    if(nc){nc.style.animation='card-flip 0.4s ease';nc.textContent=next;}
    setTimeout(function(){
      finishGame(won,payout,bet,g.id);
      showResult(won,won?next+'! +'+fmt(payout):next+' — Lost',cv+' → '+next);
      enablePlayBtn();
    },500);
    return;
  }

  if(t==='war'){
    var wc2=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    var pi=rnd(0,wc2.length-1),di=rnd(0,wc2.length-1);
    won=wc()?pi>=di:pi<di;
    payout=won?Math.floor(bet*1.95):0;
    var wp=document.getElementById('war-p'),wd=document.getElementById('war-d');
    [wp,wd].forEach(function(el){if(el){el.style.animation='card-flip 0.35s ease';}});
    setTimeout(function(){
      if(wp)wp.textContent=wc2[pi];
      if(wd){wd.textContent=wc2[di];wd.style.color=di>pi?'#e74c3c':'#4ade80';}
      finishGame(won,payout,bet,g.id);
      showResult(won,won?'You Win! +'+fmt(payout):'Dealer Wins!','Your: '+wc2[pi]+' vs Dealer: '+wc2[di]);
      enablePlayBtn();
    },400);
    return;
  }

  if(t==='dt'){
    var dtCards=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    var dc=dtCards[rnd(0,dtCards.length-1)],tc=dtCards[rnd(0,dtCards.length-1)];
    var dti=dtCards.indexOf(dc),tti=dtCards.indexOf(tc);
    var sel3=document.getElementById('dt-pick');
    var choice3=sel3?sel3.dataset.v:'dragon';
    won=wc()?(choice3==='dragon'?dti>tti:tti>dti):(choice3==='dragon'?dti<=tti:tti<=dti);
    payout=won?Math.floor(bet*1.95):0;
    var dtd=document.getElementById('dt-d'),dtt=document.getElementById('dt-t');
    [dtd,dtt].forEach(function(el){if(el)el.style.animation='card-flip 0.35s ease';});
    setTimeout(function(){
      if(dtd)dtd.textContent=dc;if(dtt)dtt.textContent=tc;
      finishGame(won,payout,bet,g.id);
      showResult(won,won?choice3.toUpperCase()+' wins! +'+fmt(payout):choice3.toUpperCase()+' lost','🐉 '+dc+' vs 🐯 '+tc);
      enablePlayBtn();
    },400);
    return;
  }

  if(t==='bac'){
    var bacCards=[1,2,3,4,5,6,7,8,9,0,0,0,0];
    var bs=(pickArr(bacCards)+pickArr(bacCards))%10;
    var ps=(pickArr(bacCards)+pickArr(bacCards))%10;
    var sel4=document.getElementById('bac-pick');
    var choice4=sel4?sel4.dataset.v:'banker';
    var actualWin=bs>ps?'banker':ps>bs?'player':'tie';
    won=wc()?actualWin===choice4:(actualWin===choice4&&Math.random()<0.3);
    var mult4=choice4==='tie'?8:1.95;
    payout=won?Math.floor(bet*mult4):0;
    var bb=document.getElementById('bac-b'),bp=document.getElementById('bac-p');
    setTimeout(function(){
      if(bb)bb.textContent=bs;if(bp)bp.textContent=ps;
      finishGame(won,payout,bet,g.id);
      showResult(won,won?choice4.toUpperCase()+' wins! +'+fmt(payout):choice4.toUpperCase()+' lost','Banker: '+bs+' | Player: '+ps);
      enablePlayBtn();
    },400);
    return;
  }

  if(t==='dice'){
    var nd=g.nd||2,rolls=[],total=0;
    for(var di2=0;di2<nd;di2++){var d=rnd(1,6);rolls.push(d);total+=d;}
    var maxT=6*nd,minT=nd;
    won=wc()?total>Math.floor((maxT+minT)/2):total<=Math.floor((maxT+minT)/2);
    payout=won?Math.floor(bet*1.9):0;
    var dfaces=['⚀','⚁','⚂','⚃','⚄','⚅'];
    [0,1].forEach(function(i){
      var el=document.getElementById('die'+i);
      if(!el)return;
      var spinD=setInterval(function(){el.textContent=dfaces[rnd(0,5)];},80);
      setTimeout(function(){clearInterval(spinD);if(rolls[i])el.textContent=dfaces[(rolls[i]||1)-1];},500);
    });
    var dr=document.getElementById('dice-res');
    setTimeout(function(){
      if(dr)dr.textContent='Total: '+total+(won?' ✓':' ✗');
      finishGame(won,payout,bet,g.id);
      showResult(won,won?'Rolled '+total+'! +'+fmt(payout):'Rolled '+total+' — Lost',rolls.join(' + ')+' = '+total);
      enablePlayBtn();
    },650);
    return;
  }

  if(t==='wheel'){
    var segs=gState.wheelSegs||[];
    var winIdx=won?[0,2,4,6][rnd(0,3)]:rnd(0,3)*2+1; // odd=lose (0x), even=win
    var seg=segs[winIdx]||{l:'0x',v:0};
    payout=seg.v>0?Math.floor(bet*seg.v):0;
    won=payout>0;
    // Animate wheel spin
    var canvas2=document.getElementById('wheel-canvas');
    if(canvas2&&segs.length){
      var angle=0,speed=20,targetAngle=(360-winIdx*(360/segs.length))+360*4;
      var spinInt=setInterval(function(){
        angle+=speed;speed*=0.97;
        drawWheelCanvas(segs,-1);
        var ctx2=canvas2.getContext('2d');
        ctx2.save();ctx2.translate(canvas2.width/2,canvas2.height/2);ctx2.rotate(angle*Math.PI/180);ctx2.translate(-canvas2.width/2,-canvas2.height/2);
        if(speed<0.5){clearInterval(spinInt);drawWheelCanvas(segs,winIdx);var wr=document.getElementById('wheel-res');if(wr)wr.textContent=seg.l;}
        ctx2.restore();
      },30);
    }
    var wr2=document.getElementById('wheel-res');
    setTimeout(function(){
      if(wr2)wr2.textContent=seg.l;
      finishGame(won,payout,bet,g.id);
      showResult(won,won?seg.l+'! +'+fmt(payout):seg.l+' — Lost','');
      enablePlayBtn();
    },2500);
    return;
  }

  if(t==='bigsmall'){
    var d1=rnd(1,6),d2=rnd(1,6),tot=d1+d2;
    var isBig=tot>=7;
    var sel5=document.getElementById('bs-pick');
    var choice5=sel5?sel5.dataset.v:'big';
    won=wc()?(choice5==='big')===isBig:Math.random()<0.45;
    payout=won?Math.floor(bet*1.95):0;
    var bd=document.getElementById('bs-dice');
    var faces2=['⚀','⚁','⚂','⚃','⚄','⚅'];
    if(bd){bd.textContent=faces2[d1-1]+' '+faces2[d2-1]+' = '+tot+' ('+(isBig?'BIG':'SMALL')+')';}
    finishGame(won,payout,bet,g.id);
    showResult(won,won?(isBig?'BIG':'SMALL')+' '+tot+'! +'+fmt(payout):(isBig?'BIG':'SMALL')+' '+tot+' — Lost','');
    enablePlayBtn();
    return;
  }

  if(t==='oddeven'){
    var num2=rnd(1,20);
    var isOdd=num2%2===1;
    var sel6=document.getElementById('oe-pick');
    var choice6=sel6?sel6.dataset.v:'odd';
    won=wc()?(choice6==='odd')===isOdd:(choice6==='odd')===isOdd;
    payout=won?Math.floor(bet*1.95):0;
    var oen=document.getElementById('oe-num');
    if(oen){oen.textContent=num2;oen.style.color=isOdd?'#ef4444':'#3b82f6';}
    finishGame(won,payout,bet,g.id);
    showResult(won,won?(isOdd?'ODD':'EVEN')+' '+num2+'! +'+fmt(payout):(isOdd?'ODD':'EVEN')+' '+num2+' — Lost','');
    enablePlayBtn();
    return;
  }

  if(t==='lucky'){
    var guess=parseInt(($('lucky-inp')||{}).value)||5;
    var draw=rnd(1,g.max||10);
    won=wc()?draw===guess:false;
    payout=won?Math.floor(bet*(g.mult||8)):0;
    var lr=document.getElementById('lucky-res');
    if(lr){lr.textContent=draw;lr.style.color=won?'#f6c90e':'#e74c3c';}
    finishGame(won,payout,bet,g.id);
    showResult(won,won?'🍀 Lucky '+draw+'! +'+fmt(payout):'Drew '+draw+' — Lost','You picked: '+guess);
    enablePlayBtn();
    return;
  }

  if(t==='keno'){
    var drawn=[];while(drawn.length<10){var k=rnd(1,20);if(drawn.indexOf(k)<0)drawn.push(k);}
    var hits=(gState.kenoPicks||[]).filter(function(n){return drawn.indexOf(n)>=0;}).length;
    var kenoMults=[0,0,1,2,5,10];
    var km=kenoMults[Math.min(hits,kenoMults.length-1)]||0;
    won=km>0;payout=Math.floor(bet*km);
    document.querySelectorAll('#keno-grid button').forEach(function(b){
      var num3=parseInt(b.textContent);
      if(drawn.indexOf(num3)>=0){b.classList.add('sel');b.style.background='rgba(74,222,128,0.2)';}
    });
    var kr=document.getElementById('keno-res');
    if(kr)kr.textContent=hits+' hits! Mult: '+km+'x';
    finishGame(won,payout,bet,g.id);
    showResult(won,won?hits+' hits! +'+fmt(payout):hits+' hits — Lost','Need 3+ to win');
    enablePlayBtn();
    return;
  }

  if(t==='colorpick'||t==='colorball'){
    var cols=['Red','Blue','Green'];
    var drawn2=pickArr(cols);
    var sel7=document.getElementById('cp-pick');
    var choice7=sel7?sel7.dataset.v:'Red';
    won=wc()?drawn2===choice7:false;
    payout=won?Math.floor(bet*2.7):0;
    var cb=document.getElementById('cball');
    var emoji={Red:'🔴',Blue:'🔵',Green:'🟢'};
    if(cb){cb.textContent=emoji[drawn2]||'🔵';}
    finishGame(won,payout,bet,g.id);
    showResult(won,won?drawn2+'! +'+fmt(payout):drawn2+' — Lost','');
    enablePlayBtn();
    return;
  }

  // Default fallback
  payout=won?Math.floor(bet*2):0;
  finishGame(won,payout,bet,g.id);
  showResult(won,won?'Win! +'+fmt(payout):'Lost!','');
  enablePlayBtn();
}

// ── BLACKJACK ──
function startBJ(g,bet){
  deductBet(bet);
  var deck=[],suits=['♠','♥','♦','♣'],ranks='A23456789TJQK'.split('');
  suits.forEach(function(s){ranks.forEach(function(r){deck.push(r+s);deck.push(r+s);});});
  function shuf(d){for(var i=d.length-1;i>0;i--){var j=rnd(0,i);var t=d[i];d[i]=d[j];d[j]=t;}return d;}
  deck=shuf(deck);
  function val(c){var r=c[0];return r==='A'?11:isNaN(r)?10:parseInt(r);}
  function hval(h){var t=h.reduce(function(s,c){return s+val(c);},0);h.forEach(function(c){if(c[0]==='A'&&t>21)t-=10;});return t;}
  bjState={deck:deck,p:[deck.pop(),deck.pop()],d:[deck.pop(),deck.pop()],bet:bet,done:false,g:g};

  function cardHtml(c,hidden){
    var isRed=c.includes('♥')||c.includes('♦');
    return '<div class="play-card" style="color:'+(hidden?'var(--txt2)':isRed?'#ef4444':'var(--txt)');+'transition:all 0.3s;">'+(hidden?'🂠':c)+'</div>';
  }

  function render(){
    var pv=hval(bjState.p),dv=hval(bjState.d);
    var area=$('gma');if(!area)return;
    area.innerHTML=
      '<div style="margin-bottom:12px;">'+
        '<div style="font-size:11px;color:var(--txt2);font-weight:700;margin-bottom:6px;">DEALER '+(bjState.done?'('+dv+')':'')+'</div>'+
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">'+
          bjState.d.map(function(c,i){return cardHtml(c,!bjState.done&&i===1);}).join('')+
        '</div>'+
        '<div style="font-size:11px;color:var(--txt2);font-weight:700;margin-bottom:6px;">YOU ('+pv+')'+(pv>21?' 💥 BUST':pv===21?' 🎉 21!':'')+'</div>'+
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">'+
          bjState.p.map(function(c){return cardHtml(c,false);}).join('')+
        '</div>'+
      '</div>';

    if(!bjState.done&&pv<21){
      area.innerHTML+=
        '<div style="display:flex;gap:8px;margin-top:10px;">'+
          '<button id="bj-hit" style="flex:1;padding:13px;background:rgba(74,222,128,0.12);color:#4ade80;border:2px solid rgba(74,222,128,0.35);border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;">HIT ➕</button>'+
          '<button id="bj-stand" style="flex:1;padding:13px;background:rgba(231,76,60,0.08);color:#e74c3c;border:2px solid rgba(231,76,60,0.25);border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;">STAND ✋</button>'+
        '</div>';
      document.getElementById('bj-hit').onclick=function(){bjState.p.push(bjState.deck.pop());render();};
      document.getElementById('bj-stand').onclick=endBJ;
    } else if(!bjState.done){endBJ();}
  }

  function endBJ(){
    bjState.done=true;
    while(hval(bjState.d)<17)bjState.d.push(bjState.deck.pop());
    var pv=hval(bjState.p),dv=hval(bjState.d);
    var won2=pv<=21&&(pv>dv||dv>21);
    var push=pv===dv&&pv<=21;
    var payout=push?bjState.bet:won2?Math.floor(bjState.bet*(g.mult||2)):0;
    if(push)creditWin(bjState.bet);
    else finishGame(won2,payout,bjState.bet,g.id);
    render();
    setTimeout(function(){
      showResult(won2||push,
        push?'Push — Tie! Bet returned':won2?'Blackjack! +'+fmt(payout):'Dealer wins — Lost '+fmt(bjState.bet),
        'You: '+pv+' | Dealer: '+dv);
      enablePlayBtn();
    },300);
  }
  render();
  var gpbtn=$('gpbtn');if(gpbtn){gpbtn.disabled=true;gpbtn.textContent='Playing...';}
}

// ── MINES ──
function calcMinesMult(total,mines,safe){
  var m=1;for(var i=0;i<safe;i++){var rem=total-i,rs=rem-mines;if(rs<=0)break;m*=(rem/rs)*0.97;}
  return Math.round(m*100)/100;
}

function startMines(g,bet){
  deductBet(bet);
  var TOTAL=25,mc=g.mines||5;
  var mines=[];while(mines.length<mc){var m=rnd(0,TOTAL-1);if(mines.indexOf(m)<0)mines.push(m);}
  mState={bet:bet,mines:mines,revealed:[],active:true,safe:0,g:g};

  function render(){
    var mult=calcMinesMult(TOTAL,mc,mState.safe);
    var pot=Math.floor(bet*mult);
    var area=$('gma');if(!area)return;

    area.innerHTML=
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:linear-gradient(135deg,#1a0000,#2a0000);border-radius:12px;border:1px solid #e74c3c33;margin-bottom:10px;">'+
        '<div><div style="font-size:10px;color:#e74c3c;font-weight:700;text-transform:uppercase;">Mines</div><div style="font-size:20px;font-weight:900;color:#e74c3c;">'+mc+'💣</div></div>'+
        '<div style="text-align:center;"><div style="font-size:10px;color:var(--txt2);font-weight:700;text-transform:uppercase;">Multiplier</div><div style="font-size:20px;font-weight:900;color:#f6c90e;">'+mult.toFixed(2)+'x</div></div>'+
        '<div style="text-align:right;"><div style="font-size:10px;color:#4ade80;font-weight:700;text-transform:uppercase;">Payout</div><div style="font-size:18px;font-weight:900;color:#4ade80;">'+fmt(pot)+'</div></div>'+
      '</div>'+
      '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-bottom:10px;">'+
      Array.from({length:TOTAL},function(_,i){
        var rev=mState.revealed.indexOf(i)>=0;
        var isMine=mines.indexOf(i)>=0;
        if(rev&&isMine) return '<div class="mine-btn revealed-bomb" style="cursor:default;">💣</div>';
        if(rev) return '<div class="mine-btn revealed-safe" style="cursor:default;">💎</div>';
        if(mState.active) return '<div class="mine-btn" data-i="'+i+'">❓</div>';
        return '<div class="mine-btn" style="opacity:0.3;cursor:default;">'+(isMine?'💣':'💎')+'</div>';
      }).join('')+
      '</div>'+
      (mState.safe>0&&mState.active?
        '<button onclick="minesCashout()" style="width:100%;padding:13px;background:linear-gradient(135deg,rgba(74,222,128,0.15),rgba(74,222,128,0.08));color:#4ade80;border:2px solid rgba(74,222,128,0.35);border-radius:12px;font-size:15px;font-weight:800;cursor:pointer;margin-bottom:8px;">💰 Cash Out '+fmt(pot)+'</button>':'')+
      '<div id="gres" class="gres" style="display:none;"><div id="grt" class="grt"></div><div id="grs" class="grs"></div></div>';

    if(mState.active){
      area.querySelectorAll('.mine-btn[data-i]').forEach(function(btn){
        btn.onclick=function(){
          var idx=parseInt(btn.dataset.i);
          if(mState.revealed.indexOf(idx)>=0||!mState.active)return;
          mState.revealed.push(idx);
          if(mines.indexOf(idx)>=0){
            mState.active=false;
            mines.forEach(function(m2){if(mState.revealed.indexOf(m2)<0)mState.revealed.push(m2);});
            render();
            finishGame(false,0,bet,g.id);
            showResult(false,'💣 BOOM! Lost '+fmt(bet),'You found a mine!');
            enablePlayBtn();
          } else {
            mState.safe++;
            render();
          }
        };
      });
    }
  }
  render();
  var gpbtn=$('gpbtn');if(gpbtn){gpbtn.disabled=true;gpbtn.textContent='Cash Out';}
}

window.minesCashout=function(){
  if(!mState.active)return;
  mState.active=false;
  var mult=calcMinesMult(25,mState.mines.length,mState.safe);
  var payout=Math.floor(mState.bet*mult);
  finishGame(true,payout,mState.bet,(mState.g||{}).id);
  showResult(true,'💎 Cashed out! +'+fmt(payout),mState.safe+' gems found × '+mult.toFixed(2)+'x');
  enablePlayBtn();
  // Re-render to show all mines
  var area=$('gma');
  if(area){
    var grid=area.querySelector('div[style*="grid-template-columns"]');
    if(grid){
      grid.querySelectorAll('.mine-btn').forEach(function(btn){
        if(btn.dataset.i){btn.style.opacity='0.4';btn.style.cursor='default';}
      });
    }
  }
};

// ── TOWER ──
function startTower(g,bet){
  deductBet(bet);
  var FLOORS=6,COLS=3;
  var mults=[1,1.90,3.60,6.80,12.90,24.50,46.50];
  var safeCol=[],traps=[];
  for(var f=0;f<FLOORS;f++){
    var s=rnd(0,COLS-1);safeCol.push(s);
    var t=[];for(var c=0;c<COLS;c++){if(c!==s)t.push(c);}traps.push(t);
  }
  tState={bet:bet,floor:0,active:true,safeCol:safeCol,traps:traps,mults:mults,g:g};

  function render(){
    var area=$('gma');if(!area)return;
    var fl=tState.floor,mult=mults[fl]||1,pot=Math.floor(bet*mult);

    area.innerHTML=
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:linear-gradient(135deg,#0a2a18,#0d3d22);border-radius:12px;border:1px solid #4ade8033;margin-bottom:10px;">'+
        '<div><div style="font-size:10px;color:#4a6ab0;font-weight:700;text-transform:uppercase;">Floor</div><div style="font-size:22px;font-weight:900;color:#4ade80;">'+fl+' / '+FLOORS+'</div></div>'+
        '<div style="text-align:center;"><div style="font-size:10px;color:#4a6ab0;font-weight:700;text-transform:uppercase;">Next mult</div><div style="font-size:22px;font-weight:900;color:#f6c90e;">'+(mults[fl+1]||mults[fl])+'x</div></div>'+
        '<div style="text-align:right;"><div style="font-size:10px;color:#4a6ab0;font-weight:700;text-transform:uppercase;">Cash out</div><div style="font-size:18px;font-weight:900;color:#4ade80;">'+fmt(pot)+'</div></div>'+
      '</div>'+
      // Tower rows (bottom to top)
      '<div style="display:flex;flex-direction:column-reverse;gap:5px;margin-bottom:10px;">'+
      Array.from({length:FLOORS},function(_,fi){
        var isActive=fi===fl&&tState.active;
        var isDone=fi<fl;
        var isFuture=fi>fl;
        return '<div style="display:flex;gap:5px;align-items:center;">'+
          '<div style="font-size:10px;color:#4a6ab0;font-weight:800;width:32px;text-align:center;flex-shrink:0;">'+(mults[fi+1]||mults[fi])+'x</div>'+
          Array.from({length:COLS},function(_,ci){
            if(isDone){
              var safe=safeCol[fi]===ci;
              return '<div style="flex:1;height:50px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;'+
                'background:'+(safe?'rgba(74,222,128,0.14)':'rgba(231,76,60,0.1)')+';'+
                'border:2px solid '+(safe?'#4ade80':'#e74c3c')+';'+
                'box-shadow:'+(safe?'0 0 12px #4ade8033':'none')+';">'+
                (safe?'💎':'💣')+'</div>';
            }
            if(isActive){
              return '<div class="tower-btn" data-fi="'+fi+'" data-ci="'+ci+'">❓</div>';
            }
            return '<div class="tower-btn future">▪</div>';
          }).join('')+
        '</div>';
      }).join('')+
      '</div>'+
      (fl>0&&tState.active?'<button onclick="towerCashout()" style="width:100%;padding:13px;background:linear-gradient(135deg,rgba(74,222,128,0.14),rgba(74,222,128,0.07));color:#4ade80;border:2px solid rgba(74,222,128,0.35);border-radius:12px;font-size:15px;font-weight:800;cursor:pointer;margin-bottom:8px;">💎 Cash Out '+fmt(pot)+'</button>':'')+
      '<div id="gres" class="gres" style="display:none;"><div id="grt" class="grt"></div><div id="grs" class="grs"></div></div>';

    area.querySelectorAll('.tower-btn[data-fi]').forEach(function(btn){
      btn.onclick=function(){
        var fi=parseInt(btn.dataset.fi),ci=parseInt(btn.dataset.ci);
        if(fi!==tState.floor||!tState.active)return;
        if(tState.traps[fi].indexOf(ci)>=0){
          btn.className='tower-btn bomb';btn.textContent='💣';
          tState.active=false;
          setTimeout(function(){render();finishGame(false,0,bet,g.id);showResult(false,'💣 Bomb! Lost '+fmt(bet),'Reached floor '+fl);enablePlayBtn();},400);
        } else {
          btn.className='tower-btn safe';btn.textContent='💎';
          tState.floor++;
          if(tState.floor>=FLOORS){
            tState.active=false;
            var p=Math.floor(bet*mults[FLOORS]);
            setTimeout(function(){render();finishGame(true,p,bet,g.id);showResult(true,'🏆 TOP FLOOR! +'+fmt(p),'All '+FLOORS+' floors cleared!');enablePlayBtn();},400);
          } else {
            setTimeout(function(){render();},350);
          }
        }
      };
    });
  }
  render();
  var gpbtn=$('gpbtn');if(gpbtn){gpbtn.disabled=true;gpbtn.textContent='Cash Out';}
}

window.towerCashout=function(){
  if(!tState.active)return;
  tState.active=false;
  var p=Math.floor(tState.bet*(tState.mults[tState.floor]||1));
  finishGame(true,p,tState.bet,(tState.g||{}).id);
  showResult(true,'💎 Cashed out! +'+fmt(p),'Floor '+tState.floor+' cleared!');
  enablePlayBtn();
};

// ── PLINKO ──
function startPlinko(g,bet){
  deductBet(bet);
  var ROWS=8;
  var MULTS=[10,3,1.5,1,0.5,1,1.5,3,10];
  var COLORS=['#f6c90e','#e67e22','#3b82f6','#4ade80','#6366f1','#4ade80','#3b82f6','#e67e22','#f6c90e'];
  var area=$('gma');if(!area)return;
  area.innerHTML='<canvas id="plc" style="width:100%;height:260px;display:block;border-radius:14px;background:#050a18;border:1px solid #1a3a7c33;"></canvas>'+
    '<div id="gres" class="gres" style="display:none;margin-top:10px;"><div id="grt" class="grt"></div><div id="grs" class="grs"></div></div>';

  var canvas=document.getElementById('plc');
  canvas.width=canvas.offsetWidth||300;canvas.height=260;
  var W=canvas.width,H=canvas.height,ctx=canvas.getContext('2d');
  var NCOLS=ROWS+1,padX=W/(NCOLS+1),padY=30;

  // Build peg grid
  var pegs=[];
  for(var r=0;r<ROWS;r++){
    var nc=r+2,sx=W/2-(nc-1)*padX/2;
    for(var c=0;c<nc;c++) pegs.push({x:sx+c*padX,y:padY+r*((H-90)/(ROWS))});
  }

  // Ball path
  var path=[{x:W/2,y:8}];
  var bx=W/2,bucketIdx=Math.floor(NCOLS/2)-1;
  for(var row=0;row<ROWS;row++){
    var right=Math.random()<0.5;
    bx+=right?padX/2:-padX/2;
    bucketIdx+=right?1:0;
    path.push({x:bx,y:padY+row*((H-90)/ROWS)+((H-90)/ROWS)});
  }
  bucketIdx=Math.max(0,Math.min(MULTS.length-1,bucketIdx-1));
  var mult=MULTS[bucketIdx],payout=Math.floor(bet*mult),won=payout>=bet;
  var frame=0,total=path.length*14;

  function draw(){
    ctx.fillStyle='#050a18';ctx.fillRect(0,0,W,H);
    // Grid lines
    ctx.strokeStyle='rgba(255,255,255,0.03)';ctx.lineWidth=1;
    for(var x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}

    // Pegs
    pegs.forEach(function(p){
      ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);
      ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.35)';ctx.lineWidth=1;ctx.stroke();
    });

    // Buckets
    var bw=W/MULTS.length;
    MULTS.forEach(function(m,i){
      var bx2=i*bw,by=H-44;
      var hl=frame>=total&&i===bucketIdx;
      ctx.fillStyle=COLORS[i]+(hl?'66':'22');
      ctx.fillRect(bx2+2,by,bw-4,40);
      ctx.strokeStyle=COLORS[i]+(hl?'cc':'44');ctx.lineWidth=hl?2:1;
      ctx.strokeRect(bx2+2,by,bw-4,40);
      ctx.fillStyle=hl?'#fff':'rgba(255,255,255,0.7)';
      ctx.font='bold '+(bw>28?'10':'8')+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(m+'x',bx2+bw/2,by+20);
    });

    // Ball
    var pi=Math.min(Math.floor(frame/14),path.length-1);
    var sf=(frame%14)/14;
    var cur=path[pi],nxt=path[Math.min(pi+1,path.length-1)];
    var ballX=cur.x+(nxt.x-cur.x)*sf;
    var ballY=cur.y+(nxt.y-cur.y)*sf;
    // Trail
    for(var t2=1;t2<=3;t2++){
      var tp=Math.max(0,frame-t2*4);
      var tpi=Math.min(Math.floor(tp/14),path.length-1);
      ctx.beginPath();ctx.arc(path[tpi].x,path[tpi].y,7*(1-t2*0.25),0,Math.PI*2);
      ctx.fillStyle='rgba(246,201,0,'+(0.25-t2*0.07)+')';ctx.fill();
    }
    // Glow
    var g2=ctx.createRadialGradient(ballX,ballY,0,ballX,ballY,14);
    g2.addColorStop(0,'rgba(246,201,0,0.5)');g2.addColorStop(1,'transparent');
    ctx.fillStyle=g2;ctx.beginPath();ctx.arc(ballX,ballY,14,0,Math.PI*2);ctx.fill();
    // Ball
    var bg=ctx.createRadialGradient(ballX-2,ballY-2,0,ballX,ballY,8);
    bg.addColorStop(0,'#fff');bg.addColorStop(0.4,'#f6c90e');bg.addColorStop(1,'#e67e22');
    ctx.fillStyle=bg;ctx.beginPath();ctx.arc(ballX,ballY,8,0,Math.PI*2);ctx.fill();

    frame++;
    if(frame<=total+10) requestAnimationFrame(draw);
    else{finishGame(won,payout,bet,g.id);showResult(won,mult+'x → '+(won?'+':'')+fmt(payout),'');enablePlayBtn();}
  }
  requestAnimationFrame(draw);
  var gpbtn=$('gpbtn');if(gpbtn){gpbtn.disabled=true;gpbtn.textContent='Dropping...';}
}

// ── CRASH GAME ──
function openCrash(g){
  CS={vehicle:g.vehicle||'rocket',theme:{color:(GAME_DESIGNS[g.id]||{c1:'#4ade80'}).c1,lc:(GAME_DESIGNS[g.id]||{c2:'#86efac'}).c2},bet:0,betPlaced:false,phase:'waiting',cashedOut:false,mult:1.00,running:false,animId:null,crashAt:2,idleAnim:null};
  var ti=$('ctitle');if(ti)ti.textContent=g.name;
  var cc=$('cclose');if(cc)cc.onclick=function(){closeCrashGame();$('cov').classList.remove('open');};
  $('cov').classList.add('open');
  var canvas=$('ccanvas');
  if(canvas){canvas.width=canvas.offsetWidth||360;canvas.height=220;}
  startCrashRound();
}

function closeCrashGame(){
  CS.running=false;
  if(CS.animId){cancelAnimationFrame(CS.animId);CS.animId=null;}
  if(CS.idleAnim){cancelAnimationFrame(CS.idleAnim);CS.idleAnim=null;}
  if(CS.betPlaced&&CS.bet>0&&CS.phase!=='crashed'&&CS.phase!=='cashed'){
    creditWin(CS.bet); // refund
    CS.betPlaced=false;CS.bet=0;
  }
}

function startCrashRound(){
  CS.phase='waiting';CS.running=true;CS.cashedOut=false;CS.betPlaced=false;CS.bet=0;CS.mult=1.00;
  // Decide crash point
  var r=Math.random();
  CS.crashAt=r<0.45?1+(Math.random()*0.09):r<0.75?1.09+Math.random()*0.25:r<0.90?1.34+Math.random()*0.80:2.14+Math.random()*3.0;
  CS.crashAt=parseFloat(CS.crashAt.toFixed(2));

  var cplay=$('cplay'),ccash=$('ccashout'),cmult=$('cmult'),cres=$('cres');
  if(cres)cres.style.display='none';
  if(cplay){cplay.textContent='Place Bet';cplay.disabled=false;}
  if(ccash){ccash.disabled=true;}
  if(cmult){cmult.style.fontSize='28px';cmult.style.color='#f6c90e';}

  if(cplay) cplay.onclick=function(){
    var bet=parseFloat(($('cbinp')||{}).value)||0;
    if(!bet||bet<1){alert('Enter bet amount.');return;}
    if(bet>bal()){alert('Insufficient balance: '+fmt(bal()));return;}
    if(CS.phase!=='waiting'){alert('Wait for next round.');return;}
    deductBet(bet);
    CS.bet=bet;CS.betPlaced=true;
    cplay.textContent='✓ Bet Placed';cplay.disabled=true;
    if(ccash)ccash.disabled=false;
  };
  if(ccash) ccash.onclick=function(){doCrashCashout();};

  // 10 second idle countdown with moving plane
  var count=10;
  var canvas=$('ccanvas');if(!canvas)return;
  canvas.width=canvas.offsetWidth||360;canvas.height=220;
  var ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
  var idleT=0;

  function idleFrame(){
    if(!CS.running||CS.phase!=='waiting')return;
    idleT++;
    ctx.fillStyle='#050a18';ctx.fillRect(0,0,W,H);
    drawGrid(ctx,W,H);
    drawStars(ctx,W,H);
    // Rocket hovers with sine wave
    var hy=H*0.78+Math.sin(idleT*0.06)*6;
    var hx=W*0.10+Math.sin(idleT*0.03)*12;
    drawVehicle(ctx,hx,hy,-Math.PI*0.18,true);
    // Countdown
    var cx2=W*0.5,cy2=H*0.35,r=40;
    ctx.strokeStyle='rgba(246,201,0,0.15)';ctx.lineWidth=4;
    ctx.beginPath();ctx.arc(cx2,cy2,r,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle='#f6c90e99';ctx.lineWidth=4;
    ctx.beginPath();ctx.arc(cx2,cy2,r,-Math.PI/2,-Math.PI/2+(count/10)*Math.PI*2);ctx.stroke();
    ctx.fillStyle='#f6c90e';ctx.font='bold 26px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(count,cx2,cy2-4);
    ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='bold 9px sans-serif';
    ctx.fillText('PLACE YOUR BET',cx2,cy2+16);
    if(cmult)cmult.textContent=count+'s';
    CS.idleAnim=requestAnimationFrame(idleFrame);
  }
  CS.idleAnim=requestAnimationFrame(idleFrame);

  var iv=setInterval(function(){
    if(!CS.running){clearInterval(iv);return;}
    count--;
    if(count<0){
      clearInterval(iv);
      if(CS.idleAnim){cancelAnimationFrame(CS.idleAnim);CS.idleAnim=null;}
      if(CS.running)beginFlight();
    }
  },1000);
}

function beginFlight(){
  CS.phase='flying';CS.mult=1.00;
  var cplay=$('cplay'),ccash=$('ccashout'),cmult=$('cmult');
  if(cplay){cplay.disabled=true;cplay.textContent='Next round...';}
  if(!CS.betPlaced&&ccash)ccash.disabled=true;

  var canvas=$('ccanvas');if(!canvas)return;
  canvas.width=canvas.offsetWidth||360;canvas.height=220;
  var ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
  var t0=performance.now(),pts=[{x:W*0.08,y:H*0.82}];
  var auto=parseFloat(($('cauto')||{}).value)||0;

  function flight(ts){
    if(!CS.running)return;
    var el=(ts-t0)/1000;
    CS.mult=parseFloat(Math.max(1.00,Math.pow(1.055,el*5)).toFixed(2));

    if(auto>1&&CS.mult>=auto&&!CS.cashedOut&&CS.betPlaced){doCrashCashout();return;}
    if(CS.mult>=CS.crashAt){doCrashEnd(ctx,W,H);return;}

    ctx.fillStyle='#050a18';ctx.fillRect(0,0,W,H);
    drawGrid(ctx,W,H);drawStars(ctx,W,H);

    var progress=Math.min(0.88,(CS.mult-1)/Math.max(0.5,CS.crashAt-1));
    var rx=W*0.08+Math.pow(progress,1.1)*W*0.83;
    var ry=H*0.82-Math.pow(progress,0.52)*H*0.76;
    pts.push({x:rx,y:ry});

    // Trail fill
    if(pts.length>1){
      var gfill=ctx.createLinearGradient(0,H*0.06,0,H*0.82);
      gfill.addColorStop(0,CS.theme.lc+'22');gfill.addColorStop(1,'transparent');
      ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
      pts.forEach(function(p){ctx.lineTo(p.x,p.y);});
      ctx.lineTo(pts[pts.length-1].x,H*0.82);ctx.lineTo(pts[0].x,H*0.82);
      ctx.closePath();ctx.fillStyle=gfill;ctx.fill();
      // Trail line
      ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
      pts.forEach(function(p){ctx.lineTo(p.x,p.y);});
      ctx.strokeStyle=CS.theme.lc;ctx.lineWidth=2.5;
      ctx.shadowColor=CS.theme.color;ctx.shadowBlur=8;ctx.stroke();ctx.shadowBlur=0;
    }

    // Vehicle at tip
    var tip=pts[pts.length-1];
    var angle=-Math.PI*0.18;
    if(pts.length>12){
      var a=pts[pts.length-12],b=pts[pts.length-1];
      var ca=Math.atan2(b.y-a.y,b.x-a.x);
      angle=Math.max(-Math.PI*0.38,Math.min(0,ca));
    }
    drawVehicle(ctx,tip.x,tip.y,angle,true);

    // Mult display color
    var mc=CS.mult>=5?'#e74c3c':CS.mult>=3?'#f97316':CS.mult>=2?'#f6c90e':'#4ade80';
    if(cmult){cmult.textContent=CS.mult.toFixed(2)+'x';cmult.style.color=mc;cmult.style.fontSize='42px';}

    CS.animId=requestAnimationFrame(flight);
  }
  CS.animId=requestAnimationFrame(flight);
}

function doCrashEnd(ctx,W,H){
  CS.running=false;CS.phase='crashed';
  if(CS.animId){cancelAnimationFrame(CS.animId);CS.animId=null;}
  var cmult=$('cmult'),cres=$('cres'),crt=$('crt'),crs=$('crs');
  if(cmult){cmult.textContent='CRASHED @ '+CS.crashAt+'x';cmult.style.color='#e74c3c';cmult.style.fontSize='22px';}
  // Red flash
  if(ctx){
    ctx.fillStyle='rgba(231,76,60,0.2)';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#e74c3c';ctx.font='bold 26px sans-serif';ctx.textAlign='center';ctx.fillText('CRASHED @ '+CS.crashAt+'x',W/2,H/2);
  }
  if(CS.betPlaced&&!CS.cashedOut){
    finishGame(false,0,CS.bet,'crash');
    if(cres){cres.className='cres lose';cres.style.display='block';}
    if(crt)crt.textContent='💥 Crashed at '+CS.crashAt+'x — Lost '+fmt(CS.bet);
    if(crs)crs.textContent='Better luck next round!';
  }
  setTimeout(function(){if(CS.phase==='crashed')startCrashRound();},4000);
}

function doCrashCashout(){
  if(!CS.betPlaced||CS.cashedOut||CS.phase!=='flying')return;
  CS.cashedOut=true;CS.phase='cashed';
  var payout=Math.floor(CS.bet*CS.mult);
  finishGame(true,payout,CS.bet,'crash');
  var cres=$('cres'),crt=$('crt'),crs=$('crs'),ccash=$('ccashout');
  if(cres){cres.className='cres win';cres.style.display='block';}
  if(crt)crt.textContent='💰 Cashed out @ '+CS.mult.toFixed(2)+'x! +'+fmt(payout);
  if(crs)crs.textContent='Profit: +'+fmt(payout-CS.bet);
  if(ccash)ccash.disabled=true;
}

// ── VEHICLE DRAW ──
function drawVehicle(ctx,x,y,angle,flame){
  var v=CS.vehicle||'rocket',c1=CS.theme.color,c2=CS.theme.lc;
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  if(v==='plane'){
    // Fuselage
    ctx.fillStyle='#c8d8ff';ctx.beginPath();ctx.ellipse(0,0,18,6,0,0,Math.PI*2);ctx.fill();
    // Nose
    ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(10,-5);ctx.lineTo(10,5);ctx.closePath();ctx.fill();
    // Wings
    ctx.fillStyle=c1;
    ctx.beginPath();ctx.moveTo(2,-5);ctx.lineTo(6,-20);ctx.lineTo(10,-20);ctx.lineTo(8,-5);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(2,5);ctx.lineTo(6,20);ctx.lineTo(10,20);ctx.lineTo(8,5);ctx.closePath();ctx.fill();
    // Tail
    ctx.fillStyle='#1e3a8a';
    ctx.beginPath();ctx.moveTo(-14,-5);ctx.lineTo(-20,-13);ctx.lineTo(-16,-5);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-14,5);ctx.lineTo(-20,13);ctx.lineTo(-16,5);ctx.closePath();ctx.fill();
    // Window
    ctx.fillStyle='rgba(147,197,253,0.9)';ctx.beginPath();ctx.ellipse(4,0,3,2.5,0,0,Math.PI*2);ctx.fill();
    if(flame){
      var t=Date.now()*0.012,fl2=12+Math.sin(t)*4;
      var g2=ctx.createLinearGradient(-16,0,-16-fl2,0);
      g2.addColorStop(0,'rgba(150,200,255,0.9)');g2.addColorStop(1,'transparent');
      ctx.fillStyle=g2;ctx.beginPath();ctx.ellipse(-16-fl2/2,0,fl2/2,3.5,0,0,Math.PI*2);ctx.fill();
    }
  } else if(v==='lightning'){
    ctx.shadowColor=c1;ctx.shadowBlur=flame?18:6;
    ctx.fillStyle=c1;
    ctx.beginPath();ctx.moveTo(20,-4);ctx.lineTo(2,3);ctx.lineTo(8,3);ctx.lineTo(-20,4);ctx.lineTo(-2,-3);ctx.lineTo(-8,-3);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.beginPath();ctx.moveTo(14,-2);ctx.lineTo(2,1.5);ctx.lineTo(6,1.5);ctx.lineTo(-14,2);ctx.lineTo(-2,-1.5);ctx.lineTo(-6,-1.5);ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;
  } else {
    // Rocket
    ctx.fillStyle='#dde8ff';ctx.beginPath();ctx.ellipse(0,0,14,6,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#e74c3c';ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(6,-5.5);ctx.lineTo(6,5.5);ctx.closePath();ctx.fill();
    ctx.fillStyle=c1;
    ctx.beginPath();ctx.moveTo(-8,-6.5);ctx.lineTo(-18,-15);ctx.lineTo(-10,-6.5);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-8,6.5);ctx.lineTo(-18,15);ctx.lineTo(-10,6.5);ctx.closePath();ctx.fill();
    ctx.fillStyle='#4ade80';ctx.beginPath();ctx.arc(4,0,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(200,255,200,0.8)';ctx.beginPath();ctx.arc(3,-1,2,0,Math.PI*2);ctx.fill();
    if(flame){
      var ft=Date.now()*0.015,fh=14+Math.sin(ft)*5;
      var gf=ctx.createLinearGradient(-13,0,-13-fh,0);
      gf.addColorStop(0,'#f6c90e');gf.addColorStop(0.4,'#e67e22');gf.addColorStop(1,'rgba(231,76,60,0)');
      ctx.fillStyle=gf;ctx.beginPath();ctx.moveTo(-13,-5);ctx.quadraticCurveTo(-13-fh,0,-13,5);ctx.closePath();ctx.fill();
    }
  }
  ctx.restore();
}

function drawGrid(ctx,W,H){
  ctx.strokeStyle='rgba(255,255,255,0.035)';ctx.lineWidth=1;
  for(var x=0;x<W;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(var y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
}
function drawStars(ctx,W,H){
  ctx.fillStyle='rgba(255,255,255,0.55)';
  for(var i=0;i<28;i++){
    var sx=(Math.sin(i*137.5+1)*0.5+0.5)*W;
    var sy=(Math.cos(i*97.3+1)*0.5+0.5)*H*0.8;
    ctx.fillRect(sx,sy,1,1);
  }
}

// ── EXPOSE ALL ──
window.openGame=openGame;
window.doPlayGame=doPlayGame;
window.buildChips=buildChips;
window.renderCasinoGrid=renderCasinoGrid;
window.loadHotGames=loadHotGames;
window.buildGameLogo=buildGameLogo;
window.openCrash=openCrash;
window.closeCrashGame=closeCrashGame;
window.doCrashCashout=doCrashCashout;
window.startCrashRound=startCrashRound;
window.beginFlight=beginFlight;
window.startBJ=startBJ;
window.startMines=startMines;
window.startTower=startTower;
window.startPlinko=startPlinko;
window.minesCashout=minesCashout;
window.towerCashout=towerCashout;
window.calcMinesMult=calcMinesMult;
window.buildGameUI=buildGameUI;
window.runInstantGame=runInstantGame;
window.showResult=showResult;
window.enablePlayBtn=enablePlayBtn;
window.finishGame=finishGame;
window.deductBet=deductBet;
window.creditWin=creditWin;
window.fmt=fmt;
window.bal=bal;
window.ub=ub;
window.rnd=rnd;
window.pickArr=pickArr;
window.wc=wc;
window.drawVehicle=drawVehicle;
// Aliases for compatibility
window.showGRes=showResult;
window.getBetVal=getBetVal;
window.refundBet=function(b){creditWin(b);};
window.loadLiveGames=function(){};
window.openLiveGame=function(){};
