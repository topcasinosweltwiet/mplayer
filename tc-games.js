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
  var w=Math.random()<0.42;
  if(w)_streak=rnd(0,1); // shorter streak = slightly higher actual win rate
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
  {id:'slots1',name:'Fruit Slots',icon:'🍒',badge:'hbl',type:'slots',syms:'slots1',mult:2},
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
  {id:'slots1',name:'Fruit Slots',icon:'🍒',type:'slots',syms:'slots1',mult:2},
  {id:'slots2',name:'Diamond Slots',icon:'💎',type:'slots',syms:'slots2',mult:3},
  {id:'slots3',name:'Vegas Slots',icon:'🎰',type:'slots',syms:'slots3',mult:2},
  {id:'slots4',name:'Lucky 7s',icon:'7️⃣',type:'slots',syms:'slots4',mult:5},
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
  {id:'lucky1',name:'Lucky Number',icon:'🍀',type:'lucky',max:5,mult:4},
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
    // Animated logo keyframes
    '@keyframes rocket-float{0%,100%{transform:translateY(0) rotate(-10deg)}50%{transform:translateY(-6px) rotate(-10deg)}}',
    '@keyframes plane-fly{0%{transform:translateX(0)}50%{transform:translateX(4px)}100%{transform:translateX(0)}}',
    '@keyframes coin-spin{0%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}',
    '@keyframes wheel-spin-idle{from{transform:rotate(0)}to{transform:rotate(360deg)}}',
    '@keyframes bomb-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}',
    '@keyframes gem-shine{0%,100%{filter:brightness(1)}50%{filter:brightness(1.6)}}',
    '@keyframes card-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}',
    '@keyframes plinko-bounce{0%,100%{transform:translateY(0)}25%{transform:translateY(-5px)}75%{transform:translateY(-2px)}}',
    '@keyframes lightning-zap{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(1.05)}}',
    '@keyframes slot-reel{0%{transform:translateY(0)}100%{transform:translateY(-100%)}}',
    '.gc-icon-inner svg{animation:none}',
    '.game-card:hover .gc-icon-inner svg{animation-play-state:running !important}',
  ].join('');
  document.head.appendChild(st);
})();

// ── CARD RENDERING ──
function buildGameLogo(g,d){
  var c1=d.c1||'#4ade80', c2=d.c2||'#86efac', id=g.id||'x';
  if(g.type==='crash'){
    if(g.vehicle==='plane') return '<svg width="52" height="52" viewBox="0 0 52 52" style="animation:plane-fly 1.5s ease-in-out infinite;display:block;"><defs><linearGradient id="p'+id+'" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="'+c1+'"/><stop offset="100%" stop-color="'+c2+'"/></linearGradient></defs>'+
      '<ellipse cx="26" cy="26" rx="18" ry="7" fill="url(#p'+id+')" opacity="0.9"/>'+
      '<polygon points="44,26 32,20 32,32" fill="'+c2+'"/>'+
      '<polygon points="20,18 26,26 20,34 12,34 16,26 12,18" fill="'+c1+'" opacity="0.85"/>'+
      '<polygon points="36,20 42,26 36,32 34,26" fill="'+c2+'" opacity="0.6"/>'+
      '<circle cx="28" cy="26" r="3" fill="'+c2+'"/>'+
      '<ellipse cx="28" cy="26" rx="1.5" ry="1" fill="white" opacity="0.7"/>'+
      '</svg>';
    if(g.vehicle==='lightning') return '<svg width="52" height="52" viewBox="0 0 52 52"><polygon points="32,4 17,28 25,28 18,50 38,22 30,22" fill="'+c1+'"/><polygon points="32,4 17,28 25,28 18,50 38,22 30,22" fill="'+c2+'" opacity="0.4"/></svg>';
    return '<svg width="52" height="52" viewBox="0 0 52 52" style="animation:rocket-float 2s ease-in-out infinite;display:block;"><defs><linearGradient id="r'+id+'" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="'+c1+'"/><stop offset="100%" stop-color="'+c2+'"/></linearGradient><radialGradient id="rg'+id+'" cx="40%" cy="30%" r="60%"><stop offset="0%" stop-color="#fff" stop-opacity="0.5"/><stop offset="100%" stop-color="'+c2+'" stop-opacity="0"/></radialGradient></defs>'+
      '<ellipse cx="26" cy="32" rx="10" ry="13" fill="url(#r'+id+')"/>'+
      '<ellipse cx="26" cy="32" rx="10" ry="13" fill="url(#rg'+id+')" opacity="0.6"/>'+
      '<polygon points="26,8 20,24 32,24" fill="'+c2+'"/>'+
      '<polygon points="14,35 20,28 20,39" fill="'+c1+'" opacity="0.8"/>'+
      '<polygon points="38,35 32,28 32,39" fill="'+c1+'" opacity="0.8"/>'+
      '<circle cx="26" cy="24" r="5" fill="'+c2+'" opacity="0.9"/>'+
      '<ellipse cx="26" cy="24" rx="3" ry="2" fill="white" opacity="0.5"/>'+
      '<ellipse cx="26" cy="45" rx="6" ry="2.5" fill="'+c1+'" opacity="0.3">'+
        '<animate attributeName="ry" values="2.5;4;2.5" dur="0.4s" repeatCount="indefinite"/>'+
        '<animate attributeName="opacity" values="0.3;0.6;0.3" dur="0.4s" repeatCount="indefinite"/>'+
      '</ellipse>'+
      '</svg>';
  }
  if(g.type==='slots') return '<svg width="52" height="52" viewBox="0 0 52 52" style="display:block;">'+
    '<rect x="4" y="8" width="14" height="36" rx="3" fill="'+c1+'" opacity="0.85"/>'+
    '<rect x="19" y="8" width="14" height="36" rx="3" fill="'+c2+'" opacity="0.9"/>'+
    '<rect x="34" y="8" width="14" height="36" rx="3" fill="'+c1+'" opacity="0.85"/>'+
    '<text x="11" y="21" font-size="9" fill="#fff" text-anchor="middle" font-weight="900" opacity="0.4">7</text>'+
    '<text x="11" y="31" font-size="11" fill="#fff" text-anchor="middle" font-weight="900">7</text>'+
    '<text x="11" y="41" font-size="9" fill="#fff" text-anchor="middle" font-weight="900" opacity="0.4">★</text>'+
    '<text x="26" y="31" font-size="11" fill="#fff" text-anchor="middle" font-weight="900">★</text>'+
    '<text x="41" y="31" font-size="11" fill="#fff" text-anchor="middle" font-weight="900">7</text>'+
    '<line x1="4" y1="26" x2="48" y2="26" stroke="'+c2+'" stroke-width="2" opacity="0.6"/>'+
    '<rect x="4" y="8" width="44" height="6" rx="2" fill="url(#slot-shade)" opacity="0.5"/>'+
    '<rect x="4" y="38" width="44" height="6" rx="2" fill="'+c1+'" opacity="0.3"/>'+
    '</svg>';
  if(g.type==='bj') return '<svg width="52" height="52" viewBox="0 0 52 52" style="display:block;">'+
    '<rect x="6" y="8" width="22" height="30" rx="4" fill="'+c1+'" opacity="0.9" style="animation:card-bounce 2s ease-in-out infinite;transform-origin:17px 23px;"/>'+
    '<rect x="22" y="14" width="22" height="30" rx="4" fill="'+c2+'" opacity="0.85" style="animation:card-bounce 2s ease-in-out 0.3s infinite;transform-origin:33px 29px;"/>'+
    '<text x="16" y="28" font-size="14" fill="#fff" text-anchor="middle" font-weight="900">A</text>'+
    '<text x="33" y="34" font-size="14" fill="#fff" text-anchor="middle" font-weight="900">K</text>'+
    '<text x="8" y="16" font-size="8" fill="#fff">♠</text>'+
    '<text x="34" y="44" font-size="8" fill="#fff">♥</text>'+
    '</svg>';
  if(g.type==='roulette') return '<svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="21" fill="none" stroke="'+c1+'" stroke-width="3"/><circle cx="26" cy="26" r="13" fill="none" stroke="'+c2+'" stroke-width="1.5" opacity="0.6"/><path d="M26,5 A21,21 0 0,1 47,26" fill="'+c1+'" opacity="0.7"/><path d="M47,26 A21,21 0 0,1 26,47" fill="#1a3a6a" opacity="0.8"/><path d="M26,47 A21,21 0 0,1 5,26" fill="'+c1+'" opacity="0.5"/><path d="M5,26 A21,21 0 0,1 26,5" fill="#1a3a6a" opacity="0.8"/><circle cx="26" cy="26" r="5" fill="'+c2+'"/></svg>';
  if(g.type==='dice') return '<svg width="52" height="52" viewBox="0 0 52 52"><rect x="4" y="14" width="24" height="24" rx="5" fill="'+c1+'" opacity="0.9"/><circle cx="12" cy="22" r="2.5" fill="#fff"/><circle cx="20" cy="22" r="2.5" fill="#fff"/><circle cx="12" cy="30" r="2.5" fill="#fff"/><circle cx="20" cy="30" r="2.5" fill="#fff"/><rect x="24" y="6" width="24" height="24" rx="5" fill="'+c2+'" opacity="0.85"/><circle cx="36" cy="18" r="2.5" fill="#fff"/></svg>';
  if(g.type==='wheel') return '<svg width="52" height="52" viewBox="0 0 52 52" style="display:block;">'+
    '<g style="transform-origin:26px 26px;animation:wheel-spin-idle 3s linear infinite;">'+
      '<path d="M26,5 A21,21 0 0,1 47,26 L26,26 Z" fill="'+c1+'" opacity="0.9"/>'+
      '<path d="M47,26 A21,21 0 0,1 26,47 L26,26 Z" fill="'+c2+'" opacity="0.9"/>'+
      '<path d="M26,47 A21,21 0 0,1 5,26 L26,26 Z" fill="'+c1+'" opacity="0.7"/>'+
      '<path d="M5,26 A21,21 0 0,1 26,5 L26,26 Z" fill="'+c2+'" opacity="0.7"/>'+
      '<circle cx="26" cy="26" r="4" fill="#fff"/>'+
    '</g>'+
    '<circle cx="26" cy="5" r="4" fill="#f6c90e"/>'+
    '</svg>';
  if(g.type==='coin') return '<svg width="52" height="52" viewBox="0 0 52 52" style="display:block;">'+
    '<ellipse cx="26" cy="26" rx="21" ry="21" fill="'+c1+'" opacity="0.85" stroke="'+c2+'" stroke-width="2">'+
      '<animate attributeName="rx" values="21;8;21" dur="2s" repeatCount="indefinite"/>'+
    '</ellipse>'+
    '<text x="26" y="32" font-size="15" fill="#fff" text-anchor="middle" font-weight="900">₿</text>'+
    '</svg>';
  if(g.type==='mines') return '<svg width="52" height="52" viewBox="0 0 52 52" style="animation:bomb-pulse 1.2s ease-in-out infinite;display:block;">'+
    '<circle cx="26" cy="26" r="15" fill="'+c1+'" opacity="0.85"/>'+
    '<circle cx="26" cy="26" r="9" fill="#0a0000"/>'+
    '<line x1="26" y1="4" x2="26" y2="48" stroke="'+c1+'" stroke-width="2.5" stroke-linecap="round"/>'+
    '<line x1="4" y1="26" x2="48" y2="26" stroke="'+c1+'" stroke-width="2.5" stroke-linecap="round"/>'+
    '<line x1="10" y1="10" x2="42" y2="42" stroke="'+c1+'" stroke-width="2" stroke-linecap="round"/>'+
    '<line x1="42" y1="10" x2="10" y2="42" stroke="'+c1+'" stroke-width="2" stroke-linecap="round"/>'+
    '<circle cx="26" cy="26" r="4" fill="'+c2+'"/>'+
    '<circle cx="20" cy="16" r="2" fill="'+c2+'" opacity="0.7">'+
      '<animate attributeName="opacity" values="0.7;1;0.7" dur="0.8s" repeatCount="indefinite"/>'+
    '</circle>'+
    '</svg>';
  if(g.type==='tower') return '<svg width="52" height="52" viewBox="0 0 52 52" style="display:block;">'+
    '<rect x="19" y="38" width="14" height="10" rx="2" fill="'+c1+'" opacity="0.9"/>'+
    '<rect x="15" y="27" width="22" height="12" rx="2" fill="'+c2+'" opacity="0.85"/>'+
    '<rect x="11" y="16" width="30" height="12" rx="2" fill="'+c1+'" opacity="0.8"/>'+
    '<rect x="19" y="5" width="14" height="12" rx="2" fill="'+c2+'" opacity="0.9">'+
      '<animate attributeName="fill" values="'+c2+';#fff;'+c2+'" dur="1.5s" repeatCount="indefinite"/>'+
    '</rect>'+
    '<circle cx="26" cy="3" r="3" fill="'+c2+'">'+
      '<animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite"/>'+
      '<animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>'+
    '</circle>'+
    '</svg>';
  if(g.type==='plinko') return '<svg width="52" height="52" viewBox="0 0 52 52" style="display:block;">'+
    '<circle cx="26" cy="8" r="5" fill="'+c2+'" opacity="0.95">'+
      '<animate attributeName="cy" values="8;14;8" dur="0.6s" repeatCount="indefinite"/>'+
    '</circle>'+
    '<circle cx="17" cy="20" r="3" fill="'+c1+'" opacity="0.7"/>'+
    '<circle cx="35" cy="20" r="3" fill="'+c1+'" opacity="0.7"/>'+
    '<circle cx="8" cy="32" r="3" fill="'+c1+'" opacity="0.6"/>'+
    '<circle cx="26" cy="32" r="3" fill="'+c1+'" opacity="0.6"/>'+
    '<circle cx="44" cy="32" r="3" fill="'+c1+'" opacity="0.6"/>'+
    '<rect x="3" y="44" width="13" height="6" rx="2" fill="'+c2+'" opacity="0.7"/>'+
    '<rect x="20" y="44" width="12" height="6" rx="2" fill="'+c1+'" opacity="0.95"/>'+
    '<rect x="36" y="44" width="13" height="6" rx="2" fill="'+c2+'" opacity="0.7"/>'+
    '</svg>';
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
  // Make modal taller for tower/plinko/mines
  var gmodal=document.getElementById('main-gmodal');
  if(gmodal){
    if(g.type==='tower'||g.type==='plinko'||g.type==='mines'){
      gmodal.style.maxHeight='98vh';
      gmodal.style.height='96vh';
    } else {
      gmodal.style.maxHeight='92vh';
      gmodal.style.height='';
    }
  }
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
  setTimeout(function(){runInstantGame(g,bet,null,btn);},350);
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
    var nd2=g.nd||2;
    area.innerHTML='<div style="text-align:center;padding:12px 0;">'+
      '<div style="display:flex;gap:10px;justify-content:center;margin-bottom:14px;">'+
        Array.from({length:nd2},function(_,i){return '<div id="die'+i+'" style="width:60px;height:60px;background:var(--card);border:2px solid var(--border);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:30px;transition:all 0.2s;">🎲</div>';}).join('')+
      '</div>'+
      '<div id="dice-res" style="font-size:20px;font-weight:900;color:var(--accent);min-height:28px;margin-bottom:6px;"></div>'+
      '<div style="font-size:11px;color:var(--txt2);">'+(nd2===3?'Sic Bo: guess total range':'Roll and win!')+'</div>'+
      (nd2===3?'<div style="display:flex;gap:8px;justify-content:center;margin-top:12px;">'+
        '<button class="gcbtn sel" id="sb-pick" data-v="big" onclick="selectSB(this)">BIG (11-18)</button>'+
        '<button class="gcbtn" data-v="small" onclick="selectSB(this)">SMALL (3-10)</button>'+
      '</div>':'')+
    '</div>';
  }

  if(t==='wheel'){
    var segs=[{l:'2x',v:2,c:'#4ade80'},{l:'0x',v:0,c:'#e74c3c'},{l:'0x',v:0,c:'#e74c3c'},{l:'1.5x',v:1.5,c:'#3b82f6'},{l:'0x',v:0,c:'#e74c3c'},{l:'3x',v:3,c:'#f6c90e'},{l:'0x',v:0,c:'#e74c3c'},{l:'0x',v:0,c:'#e74c3c'}];
    area.innerHTML='<div style="text-align:center;padding:12px 0;">'+
      '<canvas id="wheel-canvas" width="220" height="220" style="max-width:100%;border-radius:50%;"></canvas>'+
      '<div id="wheel-res" style="font-size:22px;font-weight:900;color:var(--accent);margin-top:10px;min-height:30px;"></div>'+
    '</div>';
    drawWheelCanvas(segs, -1);
    gState.wheelSegs=segs;
    gState.wheelWinSegs=[0,3,5]; // indices of winning segments
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
      '<div style="font-size:12px;color:var(--txt2);margin-bottom:8px;text-align:center;">Pick 1-5 numbers • 3 hits = 2x • 4 hits = 5x • 5 hits = 10x</div>'+
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
            b.style.background='';
            b.style.borderColor='';
          } else if(gState.kenoPicks.length<5){
            gState.kenoPicks.push(num);
            b.classList.add('sel');
            b.style.background='rgba(74,222,128,0.2)';
            b.style.borderColor='#4ade80';
          } else {
            // Show max picks warning
            var kr2=document.getElementById('keno-res');
            if(kr2){kr2.textContent='Max 5 picks!';kr2.style.color='#e74c3c';}
            setTimeout(function(){if(kr2)kr2.textContent='';},1200);
          }
          // Update pick count display
          var kr3=document.getElementById('keno-res');
          if(kr3&&gState.kenoPicks.length>0&&!kr3.textContent.includes('Max')){
            kr3.textContent='Picked: '+gState.kenoPicks.length+'/5 → '+gState.kenoPicks.join(', ');
            kr3.style.color='var(--accent)';
          } else if(kr3&&gState.kenoPicks.length===0){
            kr3.textContent='';
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
window.selectSB=function(btn){document.querySelectorAll('[onclick*="selectSB"]').forEach(function(b){b.classList.remove('sel');});btn.classList.add('sel');$('sb-pick').dataset.v=btn.dataset.v;};
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
  var t=g.type;

  // ── SLOTS ──
  if(t==='slots'){
    var syms=SLOT_SYMS[g.syms]||SLOT_SYMS.slots1;
    var playerW=wc();
    var finalSyms;
    if(playerW){var ws=pickArr(syms);finalSyms=[ws,ws,ws];}
    else{
      finalSyms=[pickArr(syms),pickArr(syms),pickArr(syms)];
      var tries=0;
      while(finalSyms[0]===finalSyms[1]&&finalSyms[1]===finalSyms[2]&&tries<20){
        finalSyms[2]=syms[(syms.indexOf(finalSyms[2])+1)%syms.length];tries++;
      }
    }
    var stops=[600,950,1300];
    for(var ri=0;ri<3;ri++){
      (function(idx,sym){
        var reel=document.getElementById('sr'+idx);if(!reel)return;
        var sp=setInterval(function(){reel.textContent=pickArr(syms);reel.style.transform='scale(1.05) translateY('+(Math.random()*4-2)+'px)';},90);
        setTimeout(function(){
          clearInterval(sp);reel.textContent=sym;reel.style.transform='scale(1)';
          if(playerW){reel.style.color='#f6c90e';reel.style.textShadow='0 0 16px #f6c90e88';}
          else{reel.style.color='var(--txt)';reel.style.textShadow='none';}
        },stops[idx]);
      })(ri,finalSyms[ri]);
    }
    var payout=playerW?Math.floor(bet*(g.mult||3)):0;
    setTimeout(function(){
      finishGame(playerW,payout,bet,g.id);
      showResult(playerW,playerW?'🎰 MATCH! +'+fmt(payout):'No match — Try again','');
      enablePlayBtn();
    },1550);
    return;
  }

  // ── COIN FLIP ──
  if(t==='coin'){
    var choiceEl=document.querySelector('#coin-h.sel,#coin-t.sel');
    var choice=choiceEl?choiceEl.dataset.v:'HEADS';
    var playerW=wc();
    var result=playerW?choice:(choice==='HEADS'?'TAILS':'HEADS');
    var cf=document.getElementById('coinface');
    if(cf){
      cf.style.transform='scale(0.8) rotateY(90deg)';
      setTimeout(function(){
        cf.textContent=result==='HEADS'?'🌕':'🌑';
        cf.style.color=playerW?'#f6c90e':'#e74c3c';
        cf.style.transform='scale(1.1) rotateY(0deg)';
        setTimeout(function(){cf.style.transform='scale(1)';},150);
      },300);
    }
    var payout=playerW?Math.floor(bet*1.95):0;
    setTimeout(function(){
      finishGame(playerW,payout,bet,g.id);
      showResult(playerW,
        playerW?result+' ✓ You Win! +'+fmt(payout):result+' — You Lose!',
        'You picked '+choice+' • Result: '+result
      );
      enablePlayBtn();
    },700);
    return;
  }

  // ── ROULETTE ──
  if(t==='roulette'){
    var selR=document.querySelector('#rp-r.sel,#rp-b.sel,#rp-g.sel');
    var choiceR=selR?selR.dataset.v:'red';
    var playerW=wc();
    var redNums=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    var blackNums=[2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
    var numR;
    if(playerW){
      if(choiceR==='red') numR=redNums[rnd(0,redNums.length-1)];
      else if(choiceR==='black') numR=blackNums[rnd(0,blackNums.length-1)];
      else numR=0;
    } else {
      if(choiceR==='red') numR=blackNums[rnd(0,blackNums.length-1)];
      else if(choiceR==='black') numR=redNums[rnd(0,redNums.length-1)];
      else numR=redNums[rnd(0,redNums.length-1)];
    }
    var colorR=numR===0?'green':redNums.indexOf(numR)>=0?'red':'black';
    var multR=choiceR==='green'?14:1.95;
    var payoutR=playerW?Math.floor(bet*multR):0;
    var rr=document.getElementById('roulres');
    if(rr){
      rr.style.opacity='0';
      setTimeout(function(){
        rr.style.opacity='1';
        rr.textContent=numR+' '+{red:'🔴',black:'⚫',green:'🟢'}[colorR]+' '+colorR.toUpperCase();
        rr.style.color={red:'#ef4444',black:'#aaa',green:'#4ade80'}[colorR];
      },400);
    }
    setTimeout(function(){
      finishGame(playerW,payoutR,bet,g.id);
      showResult(playerW,playerW?numR+' '+colorR.toUpperCase()+'! +'+fmt(payoutR):numR+' '+colorR.toUpperCase()+' — Lost','You: '+choiceR);
      enablePlayBtn();
    },700);
    return;
  }

  // ── HI-LO ──
  if(t==='hilo'){
    var cards=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    var cv=gState.hiloCard||'7';
    var cidx=cards.indexOf(cv);if(cidx<0)cidx=6;
    var selH=document.querySelector('#hi-btn.sel,#lo-btn.sel');
    var choiceH=selH?selH.dataset.v:'high';
    var playerW=wc();
    var pool;
    if(playerW) pool=cards.filter(function(c,i){return choiceH==='high'?i>cidx:i<cidx;});
    else pool=cards.filter(function(c,i){return choiceH==='high'?i<=cidx:i>=cidx;});
    if(!pool.length){playerW=!playerW;pool=cards;}
    var nextCard=pool[rnd(0,pool.length-1)];
    var payoutH=playerW?Math.floor(bet*1.95):0;
    var nc=document.getElementById('hilo-cur');
    if(nc){
      nc.style.color='rgba(255,255,255,0.3)';
      setTimeout(function(){nc.textContent=nextCard;nc.style.color=playerW?'#4ade80':'#e74c3c';},300);
    }
    // Update card for next round
    gState.hiloCard=nextCard;
    setTimeout(function(){
      finishGame(playerW,payoutH,bet,g.id);
      showResult(playerW,playerW?nextCard+'! +'+fmt(payoutH):nextCard+' — Lost',cv+' → '+nextCard+' (you picked '+choiceH+')');
      enablePlayBtn();
    },600);
    return;
  }

  // ── CARD WAR ──
  if(t==='war'){
    var cardW=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    var playerW=wc();
    var pi,di;
    if(playerW){
      pi=rnd(5,12);di=rnd(0,pi-2); // player clearly wins
    } else {
      di=rnd(5,12);pi=rnd(0,di-1); // dealer clearly wins
      if(pi<0)pi=0;
    }
    var wp=document.getElementById('war-p'),wd2=document.getElementById('war-d');
    if(wp){wp.style.opacity='0';setTimeout(function(){wp.textContent=cardW[pi];wp.style.opacity='1';wp.style.color=playerW?'#4ade80':'#e74c3c';},350);}
    if(wd2){wd2.style.opacity='0';setTimeout(function(){wd2.textContent=cardW[di];wd2.style.opacity='1';wd2.style.color=playerW?'#e74c3c':'#4ade80';},400);}
    var payoutW=playerW?Math.floor(bet*1.95):0;
    setTimeout(function(){
      finishGame(playerW,payoutW,bet,g.id);
      showResult(playerW,playerW?'You Win! +'+fmt(payoutW):'Dealer Wins!','Your: '+cardW[pi]+' vs Dealer: '+cardW[di]);
      enablePlayBtn();
    },700);
    return;
  }

  // ── DRAGON TIGER ──
  if(t==='dt'){
    var dtCards=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    var selDT=document.getElementById('dt-pick');
    var choiceDT=selDT?selDT.dataset.v:'dragon';
    var playerW=wc();
    var dc,tc2;
    if(playerW){
      if(choiceDT==='dragon'){dc=dtCards[rnd(7,12)];tc2=dtCards[rnd(0,dtCards.indexOf(dc)-1)];}
      else{tc2=dtCards[rnd(7,12)];dc=dtCards[rnd(0,dtCards.indexOf(tc2)-1)];}
    } else {
      if(choiceDT==='dragon'){tc2=dtCards[rnd(7,12)];dc=dtCards[rnd(0,dtCards.indexOf(tc2)-1)];}
      else{dc=dtCards[rnd(7,12)];tc2=dtCards[rnd(0,dtCards.indexOf(dc)-1)];}
    }
    var dtd=document.getElementById('dt-d'),dtt=document.getElementById('dt-t');
    if(dtd){dtd.style.opacity='0';setTimeout(function(){dtd.textContent=dc;dtd.style.opacity='1';},300);}
    if(dtt){dtt.style.opacity='0';setTimeout(function(){dtt.textContent=tc2;dtt.style.opacity='1';},350);}
    var payoutDT=playerW?Math.floor(bet*1.95):0;
    setTimeout(function(){
      finishGame(playerW,payoutDT,bet,g.id);
      showResult(playerW,playerW?choiceDT.toUpperCase()+' wins! +'+fmt(payoutDT):choiceDT.toUpperCase()+' lost!','🐉 '+dc+' vs 🐯 '+tc2);
      enablePlayBtn();
    },700);
    return;
  }

  // ── BACCARAT ──
  if(t==='bac'){
    var selB=document.getElementById('bac-pick');
    var choiceB=selB?selB.dataset.v:'banker';
    var playerW=wc();
    var bs2,ps2;
    if(playerW){
      if(choiceB==='banker'){bs2=rnd(6,9);ps2=rnd(0,bs2-1);}
      else if(choiceB==='player'){ps2=rnd(6,9);bs2=rnd(0,ps2-1);}
      else{bs2=rnd(0,9);ps2=bs2;} // tie
    } else {
      if(choiceB==='banker'){ps2=rnd(6,9);bs2=rnd(0,ps2-1);}
      else if(choiceB==='player'){bs2=rnd(6,9);ps2=rnd(0,bs2-1);}
      else{bs2=rnd(1,9);ps2=(bs2+rnd(1,3))%10;} // no tie
    }
    if(bs2===undefined)bs2=rnd(3,8);
    if(ps2===undefined)ps2=rnd(1,5);
    var bb=document.getElementById('bac-b'),bp=document.getElementById('bac-p');
    if(bb){bb.style.opacity='0';setTimeout(function(){bb.textContent=bs2;bb.style.opacity='1';bb.style.color=bs2>ps2?'#4ade80':'#e74c3c';},300);}
    if(bp){bp.style.opacity='0';setTimeout(function(){bp.textContent=ps2;bp.style.opacity='1';bp.style.color=ps2>bs2?'#4ade80':'#e74c3c';},350);}
    var multB=choiceB==='tie'?8:1.95;
    var payoutB=playerW?Math.floor(bet*multB):0;
    setTimeout(function(){
      finishGame(playerW,payoutB,bet,g.id);
      showResult(playerW,playerW?choiceB.toUpperCase()+' wins! +'+fmt(payoutB):choiceB.toUpperCase()+' lost','Banker:'+bs2+' Player:'+ps2);
      enablePlayBtn();
    },700);
    return;
  }

  // ── DICE ──
  if(t==='dice'){
    var nd=g.nd||2;
    var playerW=wc();
    var rolls=[],total=0;
    for(var i=0;i<nd;i++){var dv=rnd(1,6);rolls.push(dv);total+=dv;}
    var dfaces=['⚀','⚁','⚂','⚃','⚄','⚅'];
    if(nd===3){
      // Sic Bo
      var sbEl=document.getElementById('sb-pick');
      var sbPick=sbEl?sbEl.dataset.v:'big';
      var isBigD=total>=11;
      // Force correct outcome
      if(playerW!==(sbPick==='big'?isBigD:!isBigD)){
        rolls=[];total=0;
        for(var j=0;j<nd;j++){var dv2=playerW!==(sbPick==='big')?(rnd(1,3)):(rnd(3,6));rolls.push(dv2);total+=dv2;}
        isBigD=total>=11;
      }
      won=playerW;
    } else {
      won=playerW;
    }
    for(var k=0;k<nd;k++){
      (function(idx,val){
        var el=document.getElementById('die'+idx);if(!el)return;
        var sp=setInterval(function(){el.textContent=dfaces[rnd(0,5)];},80);
        setTimeout(function(){clearInterval(sp);el.textContent=dfaces[val-1];el.style.borderColor=won?'#4ade80':'#e74c3c';},500);
      })(k,rolls[k]);
    }
    var payoutD=won?Math.floor(bet*1.9):0;
    setTimeout(function(){
      finishGame(won,payoutD,bet,g.id);
      showResult(won,won?'Rolled '+total+'! +'+fmt(payoutD):'Rolled '+total+' — Lost',rolls.join('+')+'='+total+(nd===3?' ('+(total>=11?'BIG':'SMALL')+')':''));
      enablePlayBtn();
    },700);
    return;
  }

  // ── MONEY WHEEL ──
  if(t==='wheel'){
    var segs=gState.wheelSegs;
    if(!segs||!segs.length){enablePlayBtn();return;}
    var playerW=wc();
    // Segs: index 0=2x,1=0x,2=3x,3=0x,4=5x,5=0x,6=1.5x,7=0x
    var winIdxW=playerW?[0,3,5][rnd(0,2)]:[1,2,4,6,7][rnd(0,4)];
    var segW=segs[winIdxW]||{l:'0x',v:0};
    var payoutW=segW.v>0?Math.floor(bet*segW.v):0;
    var canvas2=document.getElementById('wheel-canvas');
    if(canvas2){
      var W2=canvas2.width,H2=canvas2.height,cx2=W2/2,cy2=H2/2,R2=W2/2-6;
      var segAng=Math.PI*2/segs.length;
      var targetRot=(Math.PI*2*5)+(Math.PI*2-(winIdxW*segAng+segAng/2)-Math.PI/2);
      var startT=null,dur=3500;
      function spinW(ts){
        if(!startT)startT=ts;
        var el=(ts-startT)/dur;
        var ease=el<1?1-Math.pow(1-el,3):1;
        var ctx2=canvas2.getContext('2d');
        ctx2.clearRect(0,0,W2,H2);
        ctx2.save();ctx2.translate(cx2,cy2);ctx2.rotate(ease*targetRot);ctx2.translate(-cx2,-cy2);
        segs.forEach(function(s,i){
          var a=segAng*i-Math.PI/2;
          ctx2.beginPath();ctx2.moveTo(cx2,cy2);ctx2.arc(cx2,cy2,R2,a,a+segAng);ctx2.closePath();
          ctx2.fillStyle=(el>=1&&i===winIdxW)?s.c+'ff':s.c+'99';ctx2.fill();
          ctx2.strokeStyle='#050a18';ctx2.lineWidth=2;ctx2.stroke();
          ctx2.save();ctx2.translate(cx2,cy2);ctx2.rotate(a+segAng/2);
          ctx2.fillStyle='#fff';ctx2.font='bold 12px sans-serif';ctx2.textAlign='right';
          ctx2.fillText(s.l,R2-8,5);ctx2.restore();
        });
        ctx2.restore();
        ctx2.beginPath();ctx2.arc(cx2,cy2,12,0,Math.PI*2);ctx2.fillStyle='#0a1525';ctx2.fill();
        ctx2.strokeStyle='#4ade80';ctx2.lineWidth=2;ctx2.stroke();
        ctx2.fillStyle='#f6c90e';ctx2.beginPath();ctx2.moveTo(cx2,cy2-R2-2);ctx2.lineTo(cx2-8,cy2-R2+12);ctx2.lineTo(cx2+8,cy2-R2+12);ctx2.closePath();ctx2.fill();
        if(el<1)requestAnimationFrame(spinW);
        else{var wr=document.getElementById('wheel-res');if(wr){wr.textContent=segW.l;wr.style.color=payoutW>0?'#4ade80':'#e74c3c';}}
      }
      requestAnimationFrame(spinW);
    }
    setTimeout(function(){
      finishGame(playerW,payoutW,bet,g.id);
      showResult(playerW,playerW?segW.l+'! +'+fmt(payoutW):'0x — Lost','');
      enablePlayBtn();
    },3800);
    return;
  }

  // ── BIG SMALL ──
  if(t==='bigsmall'){
    var selBS=document.getElementById('bs-pick');
    var choiceBS=selBS?selBS.dataset.v:'big';
    var playerW=wc();
    var d1,d2,totBS,isBigBS;
    if(playerW){
      if(choiceBS==='big'){d1=rnd(4,6);d2=rnd(3,6);totBS=Math.min(12,d1+d2);isBigBS=totBS>=7;}
      else{d1=rnd(1,3);d2=rnd(1,3);totBS=Math.max(2,d1+d2);isBigBS=false;}
    } else {
      if(choiceBS==='big'){d1=rnd(1,3);d2=rnd(1,3);totBS=Math.max(2,d1+d2);isBigBS=false;}
      else{d1=rnd(4,6);d2=rnd(3,6);totBS=Math.min(12,d1+d2);isBigBS=true;}
    }
    var faces3=['⚀','⚁','⚂','⚃','⚄','⚅'];
    var bdEl=document.getElementById('bs-dice');
    if(bdEl){
      bdEl.style.opacity='0';
      setTimeout(function(){
        bdEl.textContent=faces3[(d1||1)-1]+' '+faces3[(d2||1)-1]+' = '+totBS+' ('+(isBigBS?'BIG':'SMALL')+')';
        bdEl.style.opacity='1';
        bdEl.style.color=playerW?'#4ade80':'#e74c3c';
      },300);
    }
    var payoutBS=playerW?Math.floor(bet*1.95):0;
    setTimeout(function(){
      finishGame(playerW,payoutBS,bet,g.id);
      showResult(playerW,playerW?(isBigBS?'BIG':'SMALL')+' '+totBS+'! +'+fmt(payoutBS):(isBigBS?'BIG':'SMALL')+' '+totBS+' — Lost','You: '+(choiceBS==='big'?'BIG':'SMALL'));
      enablePlayBtn();
    },600);
    return;
  }

  // ── ODD EVEN ──
  if(t==='oddeven'){
    var selOE=document.getElementById('oe-pick');
    var choiceOE=selOE?selOE.dataset.v:'odd';
    var playerW=wc();
    var numOE;
    if(playerW){
      if(choiceOE==='odd'){var odds=[1,3,5,7,9,11,13,15,17,19];numOE=odds[rnd(0,odds.length-1)];}
      else{var evens=[2,4,6,8,10,12,14,16,18,20];numOE=evens[rnd(0,evens.length-1)];}
    } else {
      if(choiceOE==='odd'){var evens2=[2,4,6,8,10,12,14,16,18,20];numOE=evens2[rnd(0,evens2.length-1)];}
      else{var odds2=[1,3,5,7,9,11,13,15,17,19];numOE=odds2[rnd(0,odds2.length-1)];}
    }
    var isOddOE=numOE%2===1;
    var oenEl=document.getElementById('oe-num');
    if(oenEl){
      oenEl.style.transform='scale(0)';
      setTimeout(function(){
        oenEl.textContent=numOE;
        oenEl.style.color=playerW?'#4ade80':'#e74c3c';
        oenEl.style.transform='scale(1.2)';
        setTimeout(function(){oenEl.style.transform='scale(1)';},150);
      },300);
    }
    var payoutOE=playerW?Math.floor(bet*1.95):0;
    setTimeout(function(){
      finishGame(playerW,payoutOE,bet,g.id);
      showResult(playerW,playerW?(isOddOE?'ODD':'EVEN')+' '+numOE+'! +'+fmt(payoutOE):(isOddOE?'ODD':'EVEN')+' '+numOE+' — Lost','You: '+choiceOE.toUpperCase());
      enablePlayBtn();
    },600);
    return;
  }

  // ── LUCKY NUMBER ──
  if(t==='lucky'){
    var guessEl=$('lucky-inp');
    var guess=parseInt(guessEl?guessEl.value:3)||3;
    var max=g.max||5;
    // True random draw - win only if guess matches AND house allows
    var draw=rnd(1,max);
    var isMatch=(draw===guess);
    var pw=(isMatch&&Math.random()<0.85)||(Math.random()<0.02);
    if(pw) draw=guess;
    else if(isMatch){draw=draw>=max?draw-1:draw+1;} // move away from guess on loss
    var lrEl=document.getElementById('lucky-res');
    if(lrEl){
      lrEl.style.transform='scale(0)';
      setTimeout(function(){
        lrEl.textContent=draw;
        lrEl.style.color=pw?'#f6c90e':'#e74c3c';
        lrEl.style.transform='scale(1.3)';
        setTimeout(function(){lrEl.style.transform='scale(1)';},200);
      },300);
    }
    var payoutL=pw?Math.floor(bet*(g.mult||4)):0;
    setTimeout(function(){
      finishGame(pw,payoutL,bet,g.id);
      showResult(pw,pw?'🍀 LUCKY '+draw+'! +'+fmt(payoutL):'Drew '+draw+' — Lost','You picked: '+guess);
      enablePlayBtn();
    },700);
    return;
  }

  // ── KENO ──
  if(t==='keno'){
    if(!gState.kenoPicks||gState.kenoPicks.length===0){
      creditWin(bet);
      var krAlert=document.getElementById('keno-res');
      if(krAlert){krAlert.textContent='⚠️ Pick numbers first!';krAlert.style.color='#e74c3c';}
      enablePlayBtn();return;
    }
    var drawn=[];
    while(drawn.length<10){var k=rnd(1,20);if(drawn.indexOf(k)<0)drawn.push(k);}
    var myPicks=gState.kenoPicks.slice();
    var hits=myPicks.filter(function(n){return drawn.indexOf(n)>=0;}).length;
    var kenoMults=[0,0,0.5,2,5,10];
    var km=kenoMults[Math.min(hits,kenoMults.length-1)]||0;
    var wonK=km>0;
    var payoutK=wonK?Math.floor(bet*km):0;
    document.querySelectorAll('#keno-grid button').forEach(function(b){
      var num=parseInt(b.textContent);
      var isD=drawn.indexOf(num)>=0,isP=myPicks.indexOf(num)>=0;
      if(isD&&isP){b.style.background='rgba(74,222,128,0.35)';b.style.color='#4ade80';b.style.borderColor='#4ade80';b.style.transform='scale(1.12)';}
      else if(isD){b.style.background='rgba(246,201,0,0.15)';b.style.color='#f6c90e';}
      else if(isP){b.style.background='rgba(231,76,60,0.15)';b.style.color='#e74c3c';}
    });
    var krEl=document.getElementById('keno-res');
    if(krEl){krEl.textContent=hits+'/'+myPicks.length+' hits × '+km+'x';krEl.style.color=wonK?'#4ade80':'#e74c3c';}
    gState.kenoPicks=[];
    finishGame(wonK,payoutK,bet,g.id);
    showResult(wonK,wonK?hits+' hits! +'+fmt(payoutK):hits+' hits — Lost','Need 3+ to win. Picks:'+myPicks.join(','));
    enablePlayBtn();
    return;
  }

  // ── COLOR PREDICT / COLOR BALL ──
  if(t==='colorpick'||t==='colorball'){
    var selC=document.getElementById('cp-pick');
    var choiceC=selC?selC.dataset.v:'Red';
    var playerW=wc();
    var cols=['Red','Blue','Green'];
    var drawnC=playerW?choiceC:pickArr(cols.filter(function(c){return c!==choiceC;}));
    var emojiC={Red:'🔴',Blue:'🔵',Green:'🟢'};
    var cbEl=document.getElementById('cball');
    if(cbEl){
      cbEl.style.transform='scale(0)';
      setTimeout(function(){
        cbEl.textContent=emojiC[drawnC]||'🔵';
        cbEl.style.transform='scale(1.2)';
        cbEl.style.filter='drop-shadow(0 0 16px '+(playerW?'#4ade80':'#e74c3c')+')';
        setTimeout(function(){cbEl.style.transform='scale(1)';},200);
      },350);
    }
    var payoutC=playerW?Math.floor(bet*2.7):0;
    setTimeout(function(){
      finishGame(playerW,payoutC,bet,g.id);
      showResult(playerW,playerW?drawnC+'! ✓ +'+fmt(payoutC):drawnC+' — Lost!','You: '+choiceC+' | Result: '+drawnC);
      enablePlayBtn();
    },750);
    return;
  }

  // ── DEFAULT fallback ──
  var playerW=wc();
  var payout=playerW?Math.floor(bet*2):0;
  finishGame(playerW,payout,bet,g.id);
  showResult(playerW,playerW?'Win! +'+fmt(payout):'Lost!','');
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
  var mults=[1,1.50,2.50,4.00,7.00,12.00,20.00];
  var safeCol=[],traps=[];
  for(var f=0;f<FLOORS;f++){
    var s=rnd(0,COLS-1);safeCol.push(s);
    var t=[];for(var c=0;c<COLS;c++){if(c!==s)t.push(c);}traps.push(t);
  }
  tState={bet:bet,floor:0,active:true,safeCol:safeCol,traps:traps,mults:mults,g:g};

  function render(){
    var area=$('gma');if(!area)return;
    var fl=tState.floor,mult=mults[fl]||1,pot=Math.floor(bet*mult);

    area.style.minHeight='';
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
        return '<div style="display:flex;gap:5px;align-items:center;margin-bottom:2px;">'+
          '<div style="font-size:10px;color:#4a6ab0;font-weight:800;width:32px;text-align:center;flex-shrink:0;">'+(mults[fi+1]||mults[fi])+'x</div>'+
          Array.from({length:COLS},function(_,ci){
            if(isDone){
              var safe=safeCol[fi]===ci;
              return '<div style="flex:1;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;'+
                'background:'+(safe?'rgba(74,222,128,0.14)':'rgba(231,76,60,0.1)')+';'+
                'border:2px solid '+(safe?'#4ade80':'#e74c3c')+';'+
                'box-shadow:'+(safe?'0 0 12px #4ade8033':'none')+';">'+
                (safe?'💎':'💣')+'</div>';
            }
            if(isActive){
              return '<div class="tower-btn" data-fi="'+fi+'" data-ci="'+ci+'" style="height:44px;font-size:22px;">❓</div>';
            }
            return '<div class="tower-btn future" style="height:44px;">▪</div>';
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
  // Changed 10x→5x. Center weighted heavily (0.5x middle, rare 5x edges)
  var MULTS=[5,2,1,0.5,0.2,0.5,1,2,5];
  var COLORS=['#f6c90e','#e67e22','#3b82f6','#4ade80','#6366f1','#4ade80','#3b82f6','#e67e22','#f6c90e'];
  var area=$('gma');if(!area)return;
  area.innerHTML='<canvas id="plc" style="width:100%;height:300px;display:block;border-radius:14px;background:#050a18;border:1px solid #1a3a7c33;"></canvas>'+
    '<div id="gres" class="gres" style="display:none;margin-top:10px;"><div id="grt" class="grt"></div><div id="grs" class="grs"></div></div>';

  var canvas=document.getElementById('plc');
  canvas.width=canvas.offsetWidth||300;canvas.height=300;
  var W=canvas.width,H=canvas.height,ctx=canvas.getContext('2d');
  var NCOLS=ROWS+1,padX=W/(NCOLS+1),padY=30;

  // Build peg grid
  var pegs=[];
  for(var r=0;r<ROWS;r++){
    var nc=r+2,sx=W/2-(nc-1)*padX/2;
    for(var c=0;c<nc;c++) pegs.push({x:sx+c*padX,y:padY+r*((H-90)/(ROWS))});
  }

  var bw=W/MULTS.length;
  var path=[{x:W/2,y:8}];
  // Weighted bucket selection - strongly center biased
  // Only 1/30 chance of hitting 5x (index 0 or 8)
  // Weights: [1,2,4,8,12,8,4,2,1] = 42 total, 5x gets 1/42 each side ≈ 1/21
  // For house edge: further weight toward 0.2x (middle) 
  // Weighted bucket selection - house edge builds in center bias
  // 5x only ~1 in 30, most land in 0.2x-0.5x range
  var bucketWeights=[1,2,5,9,15,9,5,2,1]; // sum=49
  var totalW=bucketWeights.reduce(function(a,b){return a+b;},0);
  var rand=Math.random()*totalW;
  var bucketIdx=4; // default center
  var cumW=0;
  for(var wi=0;wi<bucketWeights.length;wi++){
    cumW+=bucketWeights[wi];
    if(rand<=cumW){bucketIdx=wi;break;}
  }
  bucketIdx=Math.max(0,Math.min(MULTS.length-1,bucketIdx));
  var finalBX=bucketIdx*bw+bw/2;
  
  // Build path toward bucket with natural peg-bouncing look
  var startX=W/2;
  var rowH=(H-90)/ROWS;
  for(var row2=0;row2<ROWS;row2++){
    var t=(row2+1)/ROWS;
    // Ease toward final bucket more as we go down
    var eased=Math.pow(t,1.3);
    var targetX=startX+(finalBX-startX)*eased;
    // Add small random wobble like real peg bounce
    var wobble=(Math.random()-0.5)*padX*0.5;
    path.push({x:targetX+wobble,y:padY+(row2+1)*rowH});
  }
  path.push({x:finalBX,y:H-48});
  
  var mult=MULTS[bucketIdx],payout=Math.floor(bet*mult),won=payout>bet;
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
  var gd=GAME_DESIGNS[g.id]||{c1:'#4ade80',c2:'#86efac'};
  CS={
    vehicle:g.vehicle||'rocket',
    theme:{color:gd.c1,lc:gd.c2},
    gameName:g.name||'Crash',
    bet:0,betPlaced:false,phase:'waiting',
    cashedOut:false,mult:1.00,running:false,
    animId:null,crashAt:2,idleAnim:null
  };
  // Style canvas background based on vehicle
  var ccanv=$('ccanvas');
  if(ccanv){
    if(g.vehicle==='plane') ccanv.style.background='linear-gradient(to bottom,#000510,#001030,#000820)';
    else if(g.vehicle==='lightning') ccanv.style.background='linear-gradient(to bottom,#1a0030,#0d0020,#000015)';
    else ccanv.style.background='#050a18';
  }
  var ti=$('ctitle');if(ti)ti.textContent=g.name;
  var cc=$('cclose');if(cc)cc.onclick=function(){closeCrashGame();$('cov').classList.remove('open');};
  // Build chip suggestions for crash
  var cchips=$('cchips');
  if(cchips){
    cchips.innerHTML='';
    [50,100,500,1000,5000].forEach(function(v){
      var b=document.createElement('button');
      b.className='chip';
      b.textContent=v>=1000?(v/1000)+'K':v;
      b.onclick=function(){var i=$('cbinp');if(i)i.value=v;};
      cchips.appendChild(b);
    });
  }
  // Update crash balance display
  var cbal=$('cbal');if(cbal)cbal.textContent=fmt(bal());
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
    ctx.fillStyle=CS.vehicle==='plane'?'#000820':'#050a18';
    ctx.fillRect(0,0,W,H);
    drawGrid(ctx,W,H);
    drawStars(ctx,W,H);
    var hy,hx,hangle;
    if(CS.vehicle==='plane'){
      // Plane flies across screen in a loop
      var loopT=(idleT%160)/160;
      hx=loopT*W*1.2-W*0.1;
      hy=H*0.5+Math.sin(loopT*Math.PI*2)*H*0.2;
      hangle=Math.atan2(Math.cos(loopT*Math.PI*2)*H*0.2*Math.PI*2/W,1)*0.5;
    } else {
      // Rocket hovers with sine wave
      hy=H*0.78+Math.sin(idleT*0.06)*6;
      hx=W*0.10+Math.sin(idleT*0.03)*12;
      hangle=-Math.PI*0.18;
    }
    drawVehicle(ctx,hx,hy,hangle||(-Math.PI*0.18),true);
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
      if(CS.vehicle==='plane'){
        angle=Math.max(-Math.PI*0.25,Math.min(0,ca)); // plane stays flatter
      } else {
        angle=Math.max(-Math.PI*0.38,Math.min(0,ca));
      }
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
