// tc-games.js — All casino games

currentGame = null; gState = {};
CS = {}; tState = {}; mState = {}; bjState = {};
var _streak = 0;

// ── GAME DESIGNS ──
var GAME_DESIGNS = {
  'crash1':{bg:'linear-gradient(135deg,#0a2a1a,#0d3d22)',c1:'#4ade80',c2:'#86efac',badge:'LIVE'},
  'crash2':{bg:'linear-gradient(135deg,#0a1a3d,#0d2460)',c1:'#3b82f6',c2:'#93c5fd',badge:'POPULAR'},
  'crash3':{bg:'linear-gradient(135deg,#3d1a00,#5c2a00)',c1:'#f97316',c2:'#fdba74',badge:'HOT'},
  'crash4':{bg:'linear-gradient(135deg,#3d3300,#524400)',c1:'#facc15',c2:'#fde047',badge:'NEW'},
  'slots1':{bg:'linear-gradient(135deg,#2d0a3d,#3d0d52)',c1:'#a855f7',c2:'#d8b4fe',badge:'HOT'},
  'slots2':{bg:'linear-gradient(135deg,#0a2040,#0d3060)',c1:'#38bdf8',c2:'#7dd3fc',badge:''},
  'slots3':{bg:'linear-gradient(135deg,#3d0a0a,#520d0d)',c1:'#ef4444',c2:'#f87171',badge:''},
  'slots4':{bg:'linear-gradient(135deg,#1a3d00,#225200)',c1:'#84cc16',c2:'#a3e635',badge:'LUCKY'},
  'slots5':{bg:'linear-gradient(135deg,#3d2a00,#523800)',c1:'#f59e0b',c2:'#fcd34d',badge:''},
  'bj1':{bg:'linear-gradient(135deg,#0a3d1a,#0d5224)',c1:'#10b981',c2:'#6ee7b7',badge:''},
  'bj2':{bg:'linear-gradient(135deg,#1a0a3d,#240d52)',c1:'#8b5cf6',c2:'#a78bfa',badge:'VIP'},
  'hilo1':{bg:'linear-gradient(135deg,#3d1a2a,#52243a)',c1:'#f43f5e',c2:'#fda4af',badge:''},
  'war1':{bg:'linear-gradient(135deg,#3d0a0a,#520d0d)',c1:'#dc2626',c2:'#f87171',badge:''},
  'dt1':{bg:'linear-gradient(135deg,#2a1a00,#3d2600)',c1:'#d97706',c2:'#fbbf24',badge:''},
  'bac1':{bg:'linear-gradient(135deg,#0a1a3d,#0d2452)',c1:'#6366f1',c2:'#818cf8',badge:''},
  'dice1':{bg:'linear-gradient(135deg,#003d3d,#005252)',c1:'#06b6d4',c2:'#22d3ee',badge:''},
  'dice2':{bg:'linear-gradient(135deg,#1a003d,#260052)',c1:'#7c3aed',c2:'#9f67fa',badge:''},
  'roul1':{bg:'linear-gradient(135deg,#1a3d00,#225200)',c1:'#22c55e',c2:'#4ade80',badge:''},
  'wheel1':{bg:'linear-gradient(135deg,#3d1a00,#522400)',c1:'#f97316',c2:'#fb923c',badge:''},
  'coin1':{bg:'linear-gradient(135deg,#3d3000,#524000)',c1:'#eab308',c2:'#facc15',badge:''},
  'lucky1':{bg:'linear-gradient(135deg,#003d0a,#005210)',c1:'#16a34a',c2:'#4ade80',badge:'LUCKY'},
  'keno1':{bg:'linear-gradient(135deg,#001a3d,#002452)',c1:'#0284c7',c2:'#38bdf8',badge:''},
  'color1':{bg:'linear-gradient(135deg,#2a003d,#3a0052)',c1:'#c026d3',c2:'#e879f9',badge:''},
  'colorball1':{bg:'linear-gradient(135deg,#00293d,#003852)',c1:'#0891b2',c2:'#22d3ee',badge:''},
  'bigsmall1':{bg:'linear-gradient(135deg,#1a1a3d,#262652)',c1:'#4f46e5',c2:'#818cf8',badge:''},
  'oddeven1':{bg:'linear-gradient(135deg,#003d2a,#005238)',c1:'#059669',c2:'#34d399',badge:''},
  'mines1':{bg:'linear-gradient(135deg,#3d0000,#520000)',c1:'#dc2626',c2:'#f87171',badge:'HOT'},
  'mines2':{bg:'linear-gradient(135deg,#1a0000,#2a0000)',c1:'#991b1b',c2:'#ef4444',badge:'HARD'},
  'plinko1':{bg:'linear-gradient(135deg,#00193d,#002452)',c1:'#2563eb',c2:'#60a5fa',badge:''},
  'tower1':{bg:'linear-gradient(135deg,#0a3d2a,#0d5238)',c1:'#047857',c2:'#34d399',badge:''},
};

var HOT_GAMES = [
  {id:'crash1',name:'Rocket Crash',icon:'🚀',badge:'hbl',type:'crash',vehicle:'rocket',theme:{name:'Rocket Crash',color:'#4ade80',lc:'#4ade80'}},
  {id:'slots1',name:'Fruit Slots',icon:'🍒',badge:'hbl',type:'slots',syms:'slots1',mult:2},
  {id:'bj1',name:'Blackjack',icon:'🃏',badge:'hbh',type:'bj',mult:2},
  {id:'mines1',name:'Mines',icon:'💣',badge:'hbh',type:'mines',mines:5},
  {id:'plinko1',name:'Plinko',icon:'⚪',badge:'hbl',type:'plinko',rows:8,maxMult:8},
  {id:'tower1',name:'Tower',icon:'🏗️',badge:'hbh',type:'tower',cols:3},
  {id:'coin1',name:'Coin Flip',icon:'🪙',badge:'hbn',type:'coin',c1:'HEADS',c2:'TAILS'},
  {id:'wheel1',name:'Money Wheel',icon:'🎡',badge:'hbh',type:'wheel'},
  {id:'dt1',name:'Dragon Tiger',icon:'🐯',badge:'hbl',type:'dt',mult:2},
];

var ALL_CASINO = [
  {id:'crash1',name:'Rocket Crash',icon:'🚀',type:'crash',vehicle:'rocket',theme:{name:'Rocket Crash',color:'#4ade80',lc:'#4ade80'}},
  {id:'crash2',name:'Aviator',icon:'✈️',type:'crash',vehicle:'plane',theme:{name:'Aviator',color:'#3b82f6',lc:'#60a5fa'}},
  {id:'crash3',name:'Dragon Blast',icon:'🐉',type:'crash',vehicle:'lightning',theme:{name:'Dragon Blast',color:'#f97316',lc:'#f97316'}},
  {id:'slots1',name:'Fruit Slots',icon:'🍒',type:'slots',syms:'slots1',mult:2},
  {id:'slots2',name:'Diamond Slots',icon:'💎',type:'slots',syms:'slots2',mult:3},
  {id:'slots3',name:'Vegas Slots',icon:'🎰',type:'slots',syms:'slots3',mult:2},
  {id:'slots4',name:'Lucky 7s',icon:'7️⃣',type:'slots',syms:'slots4',mult:5},
  {id:'bj1',name:'Blackjack',icon:'🃏',type:'bj',mult:2},
  {id:'bj2',name:'VIP Blackjack',icon:'♠️',type:'bj',mult:3},
  {id:'hilo1',name:'Hi-Lo',icon:'🎴',type:'hilo'},
  {id:'war1',name:'Card War',icon:'⚔️',type:'war',mult:2},
  {id:'dt1',name:'Dragon Tiger',icon:'🐯',type:'dt',mult:2},
  {id:'bac1',name:'Baccarat',icon:'🥂',type:'bac',mult:2},
  {id:'dice1',name:'Classic Dice',icon:'🎲',type:'dice',nd:2},
  {id:'dice2',name:'Sic Bo',icon:'🎯',type:'dice',nd:3},
  {id:'roul1',name:'Roulette',icon:'🎡',type:'roulette'},
  {id:'wheel1',name:'Money Wheel',icon:'🎡',type:'wheel'},
  {id:'coin1',name:'Coin Flip',icon:'🪙',type:'coin',c1:'HEADS',c2:'TAILS'},
  {id:'lucky1',name:'Lucky Number',icon:'🍀',type:'lucky',max:10,mult:8},
  {id:'keno1',name:'Keno',icon:'🔢',type:'keno'},
  {id:'color1',name:'Color Predict',icon:'🎨',type:'colorpick'},
  {id:'colorball1',name:'Color Ball',icon:'🔵',type:'colorball'},
  {id:'bigsmall1',name:'Big Small',icon:'🎯',type:'bigsmall'},
  {id:'oddeven1',name:'Odd Even',icon:'♟️',type:'oddeven'},
  {id:'mines1',name:'Mines',icon:'💣',type:'mines',mines:5},
  {id:'mines2',name:'Hard Mines',icon:'💥',type:'mines',mines:10},
  {id:'plinko1',name:'Plinko',icon:'⚪',type:'plinko',rows:8},
  {id:'tower1',name:'Tower',icon:'🏗️',type:'tower',cols:3},
];

var SLOT_SYMS = {
  slots1:['🍒','🍋','🍊','🍇','⭐','💎'],
  slots2:['💎','💍','👑','⭐','🔷','🔮'],
  slots3:['7️⃣','🎰','💰','🍀','🎲','⚡'],
  slots4:['7️⃣','7️⃣','⭐','💎','🍀','🔔'],
  slots5:['⭐','💛','🥇','👑','🔔','💰'],
};

// ── INJECT STYLES ──
(function(){
  if(document.getElementById('gc-styles'))return;
  var st=document.createElement('style');
  st.id='gc-styles';
  st.textContent=
    '@keyframes glow-pulse{0%,100%{box-shadow:0 0 8px var(--gc,#4ade80)44;}50%{box-shadow:0 0 20px var(--gc,#4ade80)88,0 0 35px var(--gc,#4ade80)33;}}'+
    '@keyframes float-icon{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-5px) scale(1.05);}}'+
    '@keyframes shimmer-card{0%{left:-100%;}100%{left:150%;}}'+
    '@keyframes spin-slow{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}'+
    '@keyframes bounce-in{0%{transform:scale(0.8);opacity:0;}60%{transform:scale(1.05);}100%{transform:scale(1);opacity:1;}}'+
    '.game-card{cursor:pointer;border-radius:14px;overflow:hidden;position:relative;transition:transform 0.2s,box-shadow 0.3s;animation:bounce-in 0.3s ease both;}'+
    '.game-card:hover{transform:translateY(-5px) scale(1.04);}'+
    '.game-card:active{transform:scale(0.96);}'+
    '.gc-shine{position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);transform:skewX(-20deg);transition:left 0.6s;}'+
    '.game-card:hover .gc-shine{left:150%;}'+
    '.gc-icon{height:88px;display:flex;align-items:center;justify-content:center;position:relative;}'+
    '.gc-icon-inner{position:relative;z-index:1;}'+
    '.gc-glow{position:absolute;inset:0;background:radial-gradient(circle at center,currentColor 0%,transparent 65%);opacity:0.15;}'+
    '.gc-badge{position:absolute;top:7px;right:7px;font-size:8px;font-weight:900;padding:2px 7px;border-radius:20px;letter-spacing:0.8px;text-transform:uppercase;}'+
    '.gc-name{font-size:11px;font-weight:800;color:#fff;text-align:center;padding:4px 6px 10px;line-height:1.3;}';
  document.head.appendChild(st);
})();

// ── GAME LOGO SVG ──
function buildGameLogo(g, d){
  var c1=d.c1||'#4ade80', c2=d.c2||'#86efac';
  var t=g.type, id=g.id;

  if(t==='crash'){
    if(g.vehicle==='plane'){
      return '<svg width="54" height="54" viewBox="0 0 54 54">'+
        '<defs><linearGradient id="pg'+id+'" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="'+c2+'"/><stop offset="100%" stop-color="'+c1+'"/></linearGradient></defs>'+
        '<ellipse cx="27" cy="27" rx="19" ry="8" fill="url(#pg'+id+')" opacity="0.9"/>'+
        '<polygon points="46,27 34,20 34,34" fill="'+c2+'"/>'+
        '<polygon points="22,17 28,27 22,37 13,37 18,27 13,17" fill="'+c1+'" opacity="0.85"/>'+
        '<polygon points="38,20 44,27 38,34 35,27" fill="'+c2+'" opacity="0.6"/>'+
        '<circle cx="30" cy="27" r="3.5" fill="'+c2+'"/></svg>';
    }
    if(g.vehicle==='lightning'){
      return '<svg width="54" height="54" viewBox="0 0 54 54">'+
        '<defs><linearGradient id="lg'+id+'" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="'+c1+'"/><stop offset="100%" stop-color="'+c2+'"/></linearGradient></defs>'+
        '<polygon points="32,4 18,28 26,28 20,50 38,22 30,22" fill="url(#lg'+id+')"/>'+
        '<polygon points="32,4 18,28 26,28 20,50 38,22 30,22" fill="'+c2+'" opacity="0.3"/>'+
        '</svg>';
    }
    // Rocket
    return '<svg width="54" height="54" viewBox="0 0 54 54">'+
      '<defs><linearGradient id="rg'+id+'" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="'+c1+'"/><stop offset="100%" stop-color="'+c2+'"/></linearGradient></defs>'+
      '<ellipse cx="27" cy="33" rx="10" ry="14" fill="url(#rg'+id+')"/>'+
      '<polygon points="27,8 21,25 33,25" fill="'+c2+'"/>'+
      '<polygon points="15,36 21,29 21,40" fill="'+c1+'" opacity="0.8"/>'+
      '<polygon points="39,36 33,29 33,40" fill="'+c1+'" opacity="0.8"/>'+
      '<circle cx="27" cy="25" r="5" fill="'+c2+'" opacity="0.9"/>'+
      '<ellipse cx="27" cy="45" rx="7" ry="3" fill="'+c1+'" opacity="0.4"/>'+
      '</svg>';
  }
  if(t==='slots'){
    return '<svg width="54" height="54" viewBox="0 0 54 54">'+
      '<defs><linearGradient id="sg'+id+'" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="'+c1+'"/><stop offset="100%" stop-color="'+c2+'" stop-opacity="0.6"/></linearGradient></defs>'+
      '<rect x="5" y="10" width="44" height="34" rx="6" fill="url(#sg'+id+')" opacity="0.15"/>'+
      '<rect x="8" y="14" width="11" height="26" rx="3" fill="'+c1+'" opacity="0.85"/>'+
      '<rect x="21" y="14" width="12" height="26" rx="3" fill="'+c2+'" opacity="0.9"/>'+
      '<rect x="35" y="14" width="11" height="26" rx="3" fill="'+c1+'" opacity="0.85"/>'+
      '<text x="13.5" y="32" font-size="10" fill="#fff" text-anchor="middle" font-weight="900">7</text>'+
      '<text x="27" y="32" font-size="10" fill="#fff" text-anchor="middle" font-weight="900">★</text>'+
      '<text x="40.5" y="32" font-size="10" fill="#fff" text-anchor="middle" font-weight="900">7</text>'+
      '<line x1="5" y1="27" x2="49" y2="27" stroke="'+c2+'" stroke-width="1.5" opacity="0.5"/>'+
      '</svg>';
  }
  if(t==='bj'){
    return '<svg width="54" height="54" viewBox="0 0 54 54">'+
      '<rect x="7" y="8" width="24" height="32" rx="4" fill="'+c1+'" opacity="0.9"/>'+
      '<rect x="23" y="14" width="24" height="32" rx="4" fill="'+c2+'" opacity="0.85"/>'+
      '<text x="17" y="30" font-size="14" fill="#fff" text-anchor="middle" font-weight="900">A</text>'+
      '<text x="35" y="36" font-size="14" fill="#fff" text-anchor="middle" font-weight="900">K</text>'+
      '<text x="9" y="17" font-size="9" fill="#fff">♠</text>'+
      '<text x="36" y="46" font-size="9" fill="#fff">♥</text>'+
      '</svg>';
  }
  if(t==='hilo'){
    return '<svg width="54" height="54" viewBox="0 0 54 54">'+
      '<rect x="5" y="16" width="20" height="28" rx="4" fill="'+c1+'" opacity="0.9"/>'+
      '<rect x="29" y="10" width="20" height="28" rx="4" fill="'+c2+'" opacity="0.9"/>'+
      '<text x="15" y="35" font-size="14" fill="#fff" text-anchor="middle" font-weight="900">2</text>'+
      '<text x="39" y="29" font-size="14" fill="#fff" text-anchor="middle" font-weight="900">A</text>'+
      '<polygon points="27,24 23,32 31,32" fill="#fff" opacity="0.9"/>'+
      '</svg>';
  }
  if(t==='war'){
    return '<svg width="54" height="54" viewBox="0 0 54 54">'+
      '<rect x="5" y="10" width="20" height="28" rx="4" fill="'+c1+'" opacity="0.9"/>'+
      '<rect x="29" y="16" width="20" height="28" rx="4" fill="'+c2+'" opacity="0.7"/>'+
      '<text x="15" y="30" font-size="14" fill="#fff" text-anchor="middle" font-weight="900">A</text>'+
      '<text x="39" y="36" font-size="14" fill="#fff" text-anchor="middle" font-weight="900">K</text>'+
      '<line x1="27" y1="10" x2="27" y2="44" stroke="#fff" stroke-width="2" opacity="0.6"/>'+
      '</svg>';
  }
  if(t==='dt'){
    return '<svg width="54" height="54" viewBox="0 0 54 54">'+
      '<text x="8" y="34" font-size="26">🐉</text>'+
      '<text x="30" y="34" font-size="20">🐯</text>'+
      '<line x1="27" y1="8" x2="27" y2="46" stroke="'+c1+'" stroke-width="2" opacity="0.6"/>'+
      '</svg>';
  }
  if(t==='bac'){
    return '<svg width="54" height="54" viewBox="0 0 54 54">'+
      '<rect x="5" y="8" width="18" height="26" rx="3" fill="'+c1+'" opacity="0.9"/>'+
      '<rect x="20" y="14" width="18" height="26" rx="3" fill="'+c2+'" opacity="0.7"/>'+
      '<rect x="35" y="10" width="14" height="22" rx="3" fill="'+c1+'" opacity="0.8"/>'+
      '<text x="14" y="26" font-size="11" fill="#fff" text-anchor="middle" font-weight="900">B</text>'+
      '<text x="29" y="32" font-size="11" fill="#fff" text-anchor="middle" font-weight="900">P</text>'+
      '</svg>';
  }
  if(t==='roulette'){
    return '<svg width="54" height="54" viewBox="0 0 54 54">'+
      '<defs><radialGradient id="wg'+id+'" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="'+c2+'" stop-opacity="0.3"/><stop offset="100%" stop-color="'+c1+'" stop-opacity="0.8"/></radialGradient></defs>'+
      '<circle cx="27" cy="27" r="22" fill="url(#wg'+id+')" stroke="'+c1+'" stroke-width="2"/>'+
      '<circle cx="27" cy="27" r="14" fill="none" stroke="'+c2+'" stroke-width="1.5" opacity="0.6"/>'+
      '<circle cx="27" cy="27" r="5" fill="'+c2+'"/>'+
      '<line x1="27" y1="5" x2="27" y2="49" stroke="'+c1+'" stroke-width="1" opacity="0.4"/>'+
      '<line x1="5" y1="27" x2="49" y2="27" stroke="'+c1+'" stroke-width="1" opacity="0.4"/>'+
      '<line x1="11" y1="11" x2="43" y2="43" stroke="'+c1+'" stroke-width="1" opacity="0.3"/>'+
      '<line x1="43" y1="11" x2="11" y2="43" stroke="'+c1+'" stroke-width="1" opacity="0.3"/>'+
      '</svg>';
  }
  if(t==='dice'){
    return '<svg width="54" height="54" viewBox="0 0 54 54">'+
      '<defs><linearGradient id="dg'+id+'" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="'+c1+'"/><stop offset="100%" stop-color="'+c2+'"/></linearGradient></defs>'+
      '<rect x="5" y="14" width="26" height="26" rx="5" fill="url(#dg'+id+')" opacity="0.9"/>'+
      '<circle cx="14" cy="23" r="2.5" fill="#fff" opacity="0.9"/>'+
      '<circle cx="23" cy="23" r="2.5" fill="#fff" opacity="0.9"/>'+
      '<circle cx="14" cy="32" r="2.5" fill="#fff" opacity="0.9"/>'+
      '<circle cx="23" cy="32" r="2.5" fill="#fff" opacity="0.9"/>'+
      '<rect x="23" y="5" width="26" height="26" rx="5" fill="'+c2+'" opacity="0.85"/>'+
      '<circle cx="36" cy="18" r="2.5" fill="#fff" opacity="0.9"/>'+
      '</svg>';
  }
  if(t==='wheel'){
    return '<svg width="54" height="54" viewBox="0 0 54 54">'+
      '<circle cx="27" cy="27" r="21" fill="none" stroke="'+c1+'" stroke-width="3" opacity="0.8"/>'+
      '<path d="M27,6 A21,21 0 0,1 48,27" fill="'+c1+'" opacity="0.85"/>'+
      '<path d="M48,27 A21,21 0 0,1 27,48" fill="'+c2+'" opacity="0.85"/>'+
      '<path d="M27,48 A21,21 0 0,1 6,27" fill="'+c1+'" opacity="0.65"/>'+
      '<path d="M6,27 A21,21 0 0,1 27,6" fill="'+c2+'" opacity="0.65"/>'+
      '<circle cx="27" cy="27" r="5" fill="#fff" opacity="0.95"/>'+
      '</svg>';
  }
  if(t==='coin'){
    return '<svg width="54" height="54" viewBox="0 0 54 54">'+
      '<defs><radialGradient id="cg'+id+'" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="'+c2+'"/><stop offset="70%" stop-color="'+c1+'"/><stop offset="100%" stop-color="'+c1+'" stop-opacity="0.5"/></radialGradient></defs>'+
      '<circle cx="27" cy="27" r="22" fill="url(#cg'+id+')" stroke="'+c1+'" stroke-width="2"/>'+
      '<circle cx="27" cy="27" r="16" fill="none" stroke="'+c2+'" stroke-width="1.5" opacity="0.6"/>'+
      '<text x="27" y="33" font-size="14" fill="#fff" text-anchor="middle" font-weight="900">₿</text>'+
      '</svg>';
  }
  if(t==='mines'){
    return '<svg width="54" height="54" viewBox="0 0 54 54">'+
      '<circle cx="27" cy="27" r="16" fill="'+c1+'" opacity="0.85"/>'+
      '<circle cx="27" cy="27" r="10" fill="#1a0000"/>'+
      '<line x1="27" y1="5" x2="27" y2="49" stroke="'+c1+'" stroke-width="2.5" stroke-linecap="round"/>'+
      '<line x1="5" y1="27" x2="49" y2="27" stroke="'+c1+'" stroke-width="2.5" stroke-linecap="round"/>'+
      '<line x1="11" y1="11" x2="43" y2="43" stroke="'+c1+'" stroke-width="2" stroke-linecap="round"/>'+
      '<line x1="43" y1="11" x2="11" y2="43" stroke="'+c1+'" stroke-width="2" stroke-linecap="round"/>'+
      '<circle cx="27" cy="27" r="4" fill="'+c2+'"/>'+
      '</svg>';
  }
  if(t==='tower'){
    return '<svg width="54" height="54" viewBox="0 0 54 54">'+
      '<rect x="19" y="38" width="16" height="10" rx="2" fill="'+c1+'" opacity="0.9"/>'+
      '<rect x="16" y="27" width="22" height="13" rx="2" fill="'+c2+'" opacity="0.85"/>'+
      '<rect x="13" y="16" width="28" height="13" rx="2" fill="'+c1+'" opacity="0.8"/>'+
      '<rect x="19" y="5" width="16" height="13" rx="2" fill="'+c2+'" opacity="0.9"/>'+
      '<circle cx="27" cy="3" r="3" fill="'+c2+'"/>'+
      '</svg>';
  }
  if(t==='plinko'){
    return '<svg width="54" height="54" viewBox="0 0 54 54">'+
      '<circle cx="27" cy="8" r="5" fill="'+c2+'" opacity="0.95"/>'+
      '<circle cx="18" cy="20" r="3" fill="'+c1+'" opacity="0.7"/>'+
      '<circle cx="36" cy="20" r="3" fill="'+c1+'" opacity="0.7"/>'+
      '<circle cx="10" cy="32" r="3" fill="'+c1+'" opacity="0.6"/>'+
      '<circle cx="27" cy="32" r="3" fill="'+c1+'" opacity="0.6"/>'+
      '<circle cx="44" cy="32" r="3" fill="'+c1+'" opacity="0.6"/>'+
      '<rect x="4" y="44" width="12" height="6" rx="2" fill="'+c2+'" opacity="0.7"/>'+
      '<rect x="21" y="44" width="12" height="6" rx="2" fill="'+c1+'" opacity="0.95"/>'+
      '<rect x="38" y="44" width="12" height="6" rx="2" fill="'+c2+'" opacity="0.7"/>'+
      '</svg>';
  }
  if(t==='lucky'||t==='keno'||t==='bigsmall'||t==='oddeven'){
    var nums={'lucky':'🍀','keno':'🔢','bigsmall':'🎯','oddeven':'♟️'};
    return '<div style="font-size:36px;filter:drop-shadow(0 0 10px '+c2+');">'+(g.icon||nums[t])+'</div>';
  }
  if(t==='colorpick'||t==='colorball'){
    return '<svg width="54" height="54" viewBox="0 0 54 54">'+
      '<circle cx="18" cy="22" r="12" fill="#e74c3c" opacity="0.9"/>'+
      '<circle cx="36" cy="22" r="12" fill="#3b82f6" opacity="0.9"/>'+
      '<circle cx="27" cy="36" r="12" fill="'+c1+'" opacity="0.9"/>'+
      '</svg>';
  }
  // Default emoji
  return '<div style="font-size:36px;filter:drop-shadow(0 0 10px '+c2+');">'+(g.icon||'🎮')+'</div>';
}

// ── RENDER CASINO GRID ──
function renderCasinoGrid(){
  var wrap=$('cgrid'); if(!wrap)return; wrap.innerHTML='';

  var sections=[
    {label:'🚀 Crash Games',color:'#4ade80',games:ALL_CASINO.filter(function(g){return g.type==='crash';})},
    {label:'🎰 Slots',color:'#a855f7',games:ALL_CASINO.filter(function(g){return g.type==='slots';})},
    {label:'🃏 Card Games',color:'#38bdf8',games:ALL_CASINO.filter(function(g){return ['bj','hilo','war','dt','bac'].indexOf(g.type)>=0;})},
    {label:'🎲 Dice & Numbers',color:'#06b6d4',games:ALL_CASINO.filter(function(g){return ['dice','roulette','keno','bigsmall','oddeven','lucky','colorpick','colorball','wheel','coin'].indexOf(g.type)>=0;})},
    {label:'💣 Mines & Tower',color:'#ef4444',games:ALL_CASINO.filter(function(g){return ['mines','tower','plinko'].indexOf(g.type)>=0;})},
  ];

  sections.forEach(function(sec){
    if(!sec.games.length)return;
    var hdr=document.createElement('div');
    hdr.style.cssText='display:flex;align-items:center;gap:10px;padding:16px 1rem 10px;';
    hdr.innerHTML='<div style="font-size:14px;font-weight:900;color:'+sec.color+';">'+sec.label+'</div>'+
      '<div style="flex:1;height:1px;background:linear-gradient(to right,'+sec.color+'55,transparent);"></div>';
    wrap.appendChild(hdr);

    var grid=document.createElement('div');
    grid.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 1rem 6px;';

    sec.games.forEach(function(g){
      var d=GAME_DESIGNS[g.id]||{bg:'linear-gradient(135deg,#0a1525,#0d2040)',c1:'#4ade80',c2:'#86efac',badge:''};
      var card=document.createElement('div');
      card.className='game-card';
      card.style.cssText='background:'+d.bg+';border:1px solid '+d.c1+'33;--gc:'+d.c2+';';

      var badgeHtml=d.badge?'<div class="gc-badge" style="background:'+d.c1+'22;color:'+d.c1+';border:1px solid '+d.c1+'44;">'+d.badge+'</div>':'';

      card.innerHTML=
        '<div class="gc-shine"></div>'+
        badgeHtml+
        '<div class="gc-icon" style="color:'+d.c2+';">'+
          '<div class="gc-glow"></div>'+
          '<div class="gc-icon-inner">'+buildGameLogo(g,d)+'</div>'+
        '</div>'+
        '<div class="gc-name">'+g.name+'</div>';

      card.addEventListener('click',function(){openGame(g);});
      card.addEventListener('mouseenter',function(){
        card.style.transform='translateY(-5px) scale(1.04)';
        card.style.boxShadow='0 10px 25px '+d.c1+'44';
        card.style.borderColor=d.c1+'77';
      });
      card.addEventListener('mouseleave',function(){
        card.style.transform='';
        card.style.boxShadow='';
        card.style.borderColor=d.c1+'33';
      });
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
  });
}

function renderHotGames(gamesList){
  var wrap=$('hotscroll');if(!wrap)return;wrap.innerHTML='';
  var lbl=$('hot-section-label');
  if(lbl)lbl.style.display=gamesList.length?'flex':'none';

  gamesList.forEach(function(g){
    var d=GAME_DESIGNS[g.id]||{bg:'linear-gradient(135deg,#0d1f3c,#1a3a7c)',c1:'#4ade80',c2:'#86efac',badge:''};
    var card=document.createElement('div');
    card.style.cssText='flex-shrink:0;width:115px;border-radius:14px;overflow:hidden;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;background:'+d.bg+';border:1px solid '+d.c1+'33;';

    var badgeLabel=g.badge==='hbl'?'LIVE':g.badge==='hbh'?'HOT':g.badge==='hbn'?'NEW':'';
    var badgeColor=g.badge==='hbl'?'#4ade80':g.badge==='hbh'?'#f97316':'#3b82f6';

    card.innerHTML=
      '<div style="height:82px;display:flex;align-items:center;justify-content:center;position:relative;">'+
        '<div style="position:absolute;inset:0;background:radial-gradient(circle at center,'+d.c2+'22,transparent);"></div>'+
        '<div style="position:relative;z-index:1;">'+buildGameLogo(g,d)+'</div>'+
        (badgeLabel?'<div style="position:absolute;top:6px;right:6px;background:'+badgeColor+'22;color:'+badgeColor+';border:1px solid '+badgeColor+'44;font-size:8px;font-weight:900;padding:2px 7px;border-radius:12px;letter-spacing:0.5px;">'+badgeLabel+'</div>':'')+
      '</div>'+
      '<div style="padding:0 8px 10px;text-align:center;">'+
        '<div style="font-size:11px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+g.name+'</div>'+
      '</div>';

    card.addEventListener('click',function(){openGame(g);});
    card.addEventListener('mouseenter',function(){card.style.transform='translateY(-4px) scale(1.05)';card.style.boxShadow='0 8px 20px '+d.c1+'44';});
    card.addEventListener('mouseleave',function(){card.style.transform='';card.style.boxShadow='';});
    wrap.appendChild(card);
  });
}

function loadHotGames(){
  fbGet('/adminSettings/hotGames').then(function(data){
    var games=data?HOT_GAMES.filter(function(g){return data[g.id];}):HOT_GAMES;
    if(!games.length)games=HOT_GAMES;
    renderHotGames(games.slice(0,10));
    renderCasinoGrid();
  }).catch(function(){renderHotGames(HOT_GAMES.slice(0,10));renderCasinoGrid();});
}

// ── OPEN GAME ──
function openGame(g){
  if(!CD){alert('Please login.');return;}
  if(g.type==='crash'){openCrash(g);return;}
  currentGame=g; gState={};
  st('gtitle',g.name);
  buildChips('gchips','gbinp');
  buildGameArea(g);
  $('gpbtn').onclick=function(){doPlayGame(g);};
  $('gclose').onclick=function(){closeCrashGame();cm('gov');};
  om('gov');
}

function getBetVal(id){var e=$(id);if(!e)return 0;return parseFloat(e.value)||0;}

function buildChips(chipsId,inputId){
  var w=$(chipsId);if(!w)return;w.innerHTML='';
  [50,100,500,1000,5000].forEach(function(v){
    var b=document.createElement('button');
    b.className='cbtn';
    b.textContent=v>=1000?(v/1000)+'K':v;
    b.onclick=function(){var i=$(inputId);if(i)i.value=v;};
    w.appendChild(b);
  });
}

function showGRes(resId,titleId,subId,won,title,sub){
  var res=$(resId);if(!res)return;
  res.style.display='block';
  res.className='gres '+(won?'win':'lose');
  var t=$(titleId);if(t)t.textContent=title||'';
  var s=$(subId);if(s)s.textContent=sub||'';
}

function fmt(n){return 'Rs. '+(Number(n)||0).toLocaleString('en-NP');}
function bal(){return CD?Number(CD.balance||0):0;}
function ub(){var b=$('bshow');if(b)b.textContent=fmt(bal());}
function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function wc(){
  if(_streak>0){_streak--;return false;}
  var won=Math.random()<0.40;
  if(won)_streak=rnd(1,2);
  return won;
}
function finishGame(won,payout,bet){
  if(!CK)return;
  var nb=won?bal()+payout:bal();
  CD.balance=nb;
  fbUp('/players/'+CK,{balance:nb});
  ub();
  fbPush('/gameTxns',{playerKey:CK,type:won?'win':'loss',amount:won?payout:bet,game:currentGame?currentGame.id:'',time:new Date().toISOString()});
}
function refundBet(bet){
  CD.balance=bal()+bet;fbUp('/players/'+CK,{balance:bal()});ub();
}

// ── PLAY GAME ──
function doPlayGame(g){
  var bet=getBetVal('gbinp');
  if(!bet||bet<1){alert('Enter a bet amount.');return;}
  if(bet>bal()){alert('Insufficient balance: '+fmt(bal()));return;}
  if(g.type==='bj'){startBJ(g,bet);return;}
  if(g.type==='mines'){startMines(g,bet);return;}
  if(g.type==='plinko'){startPlinko(g,bet);return;}
  if(g.type==='tower'){startTower(g,bet);return;}
  // Deduct bet
  var nb=bal()-bet;CD.balance=nb;fbUp('/players/'+CK,{balance:nb});ub();
  var btn=$('gpbtn');if(btn){btn.disabled=true;}
  var won=wc();
  setTimeout(function(){execGame(g,bet,won,btn);},400);
}

function execGame(g,bet,won,btn){
  var payout=0,result='',t=g.type;
  if(t==='slots'){
    var syms=SLOT_SYMS[g.syms]||SLOT_SYMS.slots1;
    var reels=[$('sr0'),$('sr1'),$('sr2')];
    var results=[];
    reels.forEach(function(r,i){
      var sym=won&&i<2?syms[0]:pick(syms);
      if(won&&i===2)sym=results[0];
      else if(!won){sym=syms[rnd(1,syms.length-1)];}
      results.push(sym);
      setTimeout(function(){if(r){r.textContent=sym;r.classList.add('spin');}},i*150);
    });
    if(won){payout=Math.floor(bet*(g.mult||2));result='WIN! +'+fmt(payout);}
    else{result='No match. Try again!';}
    setTimeout(function(){
      finishGame(won,payout,bet);
      showGRes('gres','grt','grs',won,won?'🎰 WIN! +'+fmt(payout):'No match',result);
      if(btn)btn.disabled=false;
    },800);
    return;
  }
  if(t==='coin'){
    var side=Math.random()<0.5?g.c1||'HEADS':g.c2||'TAILS';
    var chosen=$('coin-pick');
    var pick2=chosen?chosen.dataset.val||g.c1:g.c1;
    won=wc()?side===pick2:side!==pick2;
    payout=won?Math.floor(bet*1.95):0;
    var cf=$('coinface');if(cf)cf.textContent=side==='HEADS'?'🌕':'🌑';
    finishGame(won,payout,bet);
    showGRes('gres','grt','grs',won,won?'✓ '+side+'! +'+fmt(payout):side+' — Lost',side);
    if(btn)btn.disabled=false;
    return;
  }
  if(t==='dice'){
    var total=0,rolls=[],nd=g.nd||2;
    for(var i=0;i<nd;i++){var d=rnd(1,6);rolls.push(d);total+=d;}
    won=wc();payout=won?Math.floor(bet*(g.mult||2)):0;
    finishGame(won,payout,bet);
    showGRes('gres','grt','grs',won,won?'🎲 Rolled '+total+'! +'+fmt(payout):'Rolled '+total+' — Lost',rolls.map(function(r){return '⚀⚁⚂⚃⚄⚅'[r-1];}).join(' '));
    if(btn)btn.disabled=false;
    return;
  }
  if(t==='roulette'){
    var num=rnd(0,36);var isRed=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].indexOf(num)>=0;
    var color=num===0?'Green':isRed?'Red':'Black';
    var bet2=$('roul-pick')?$('roul-pick').dataset.val:'red';
    won=wc()?bet2===color.toLowerCase()||(bet2==='number'&&num===rnd(0,36)):(color.toLowerCase()===bet2);
    payout=won?Math.floor(bet*(bet2==='number'?35:1.95)):0;
    var rb=$('roulball');if(rb){rb.textContent=num+' '+color;}
    finishGame(won,payout,bet);
    showGRes('gres','grt','grs',won,won?'🎡 '+num+' '+color+'! +'+fmt(payout):num+' '+color+' — Lost','');
    if(btn)btn.disabled=false;
    return;
  }
  if(t==='wheel'){
    var segs=[{l:'2x',v:2},{l:'3x',v:3},{l:'5x',v:5},{l:'0x',v:0},{l:'1.5x',v:1.5},{l:'0x',v:0},{l:'10x',v:10},{l:'0x',v:0}];
    var seg=won?segs[rnd(1,segs.length-2)]:segs[0];
    if(!won)seg=segs.filter(function(s){return s.v===0;})[0];
    payout=seg.v>0?Math.floor(bet*seg.v):0;
    var wr=$('wheelres');if(wr)wr.textContent=seg.l;
    finishGame(payout>0,payout,bet);
    showGRes('gres','grt','grs',payout>0,payout>0?'🎡 '+seg.l+'! +'+fmt(payout):seg.l+' — Lost','');
    if(btn)btn.disabled=false;
    return;
  }
  if(t==='lucky'){
    var pick3=rnd(1,g.max||10);
    var guess=$('lucky-inp')?parseInt($('lucky-inp').value):rnd(1,g.max||10);
    won=wc()?pick3===guess:pick3!==guess&&Math.random()<0.2;
    payout=won?Math.floor(bet*(g.mult||8)):0;
    finishGame(won,payout,bet);
    showGRes('gres','grt','grs',won,won?'🍀 Lucky '+pick3+'! +'+fmt(payout):'Number was '+pick3+' — Lost','You guessed: '+guess);
    if(btn)btn.disabled=false;
    return;
  }
  if(t==='keno'){
    won=wc();payout=won?Math.floor(bet*3):0;
    finishGame(won,payout,bet);
    showGRes('gres','grt','grs',won,won?'🔢 Win! +'+fmt(payout):'Lost — Try again','');
    if(btn)btn.disabled=false;
    return;
  }
  if(t==='colorpick'||t==='colorball'){
    var colors2=['Red','Blue','Green'];
    var drawn=pick(colors2);
    var guessed=$('cpick-sel')?$('cpick-sel').dataset.val||'Red':'Red';
    won=wc()?drawn===guessed:drawn!==guessed&&Math.random()<0.2;
    payout=won?Math.floor(bet*2.8):0;
    var cb=$('cballball');if(cb)cb.textContent={'Red':'🔴','Blue':'🔵','Green':'🟢'}[drawn]||'🔵';
    finishGame(won,payout,bet);
    showGRes('gres','grt','grs',won,won?drawn+'! +'+fmt(payout):drawn+' — Lost','');
    if(btn)btn.disabled=false;
    return;
  }
  if(t==='bigsmall'){
    var sum2=rnd(2,12);var isBig=sum2>=7;
    var bsPick=($('bs-pick')&&$('bs-pick').dataset.val)?$('bs-pick').dataset.val:'big';
    won=wc()?((bsPick==='big')===isBig):((bsPick==='big')===isBig);
    payout=won?Math.floor(bet*1.95):0;
    finishGame(won,payout,bet);
    showGRes('gres','grt','grs',won,won?(isBig?'BIG':'SMALL')+' '+sum2+'! +'+fmt(payout):(isBig?'BIG':'SMALL')+' '+sum2+' — Lost','');
    if(btn)btn.disabled=false;
    return;
  }
  if(t==='oddeven'){
    var num2=rnd(1,20);var isOdd=num2%2===1;
    var oePick=($('oe-pick')&&$('oe-pick').dataset.val)?$('oe-pick').dataset.val:'odd';
    won=wc()?((oePick==='odd')===isOdd):((oePick==='odd')===isOdd);
    payout=won?Math.floor(bet*1.95):0;
    finishGame(won,payout,bet);
    showGRes('gres','grt','grs',won,won?(isOdd?'ODD':'EVEN')+' '+num2+'! +'+fmt(payout):(isOdd?'ODD':'EVEN')+' '+num2+' — Lost','');
    if(btn)btn.disabled=false;
    return;
  }
  if(t==='hilo'){
    var cards=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    var cur=cards[rnd(0,cards.length-1)];
    var next=cards[rnd(0,cards.length-1)];
    var hiPick=$('hilo-hi')?true:true;
    won=wc();payout=won?Math.floor(bet*1.95):0;
    var hp=$('hilop');if(hp)hp.textContent=next;
    finishGame(won,payout,bet);
    showGRes('gres','grt','grs',won,won?next+'! +'+fmt(payout):next+' — Lost','Card: '+cur+' → '+next);
    if(btn)btn.disabled=false;
    return;
  }
  if(t==='war'){
    var wCards=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    var pc=rnd(0,wCards.length-1),dc=rnd(0,wCards.length-1);
    won=wc()?pc>dc:pc<=dc;
    payout=won?Math.floor(bet*1.95):0;
    var wp=$('warp');if(wp)wp.textContent=wCards[pc];
    var wd=$('warb');if(wd)wd.textContent=wCards[dc];
    finishGame(won,payout,bet);
    showGRes('gres','grt','grs',won,won?'You win! +'+fmt(payout):'Dealer wins!','You: '+wCards[pc]+' vs Dealer: '+wCards[dc]);
    if(btn)btn.disabled=false;
    return;
  }
  if(t==='dt'){
    var dtCards=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    var dCard=dtCards[rnd(0,dtCards.length-1)];
    var tCard=dtCards[rnd(0,dtCards.length-1)];
    var side=$('dt-pick')?$('dt-pick').dataset.val||'dragon':'dragon';
    won=wc()?((side==='dragon')?dCard>tCard:tCard>dCard):((side==='dragon')?dCard<tCard:tCard<dCard);
    payout=won?Math.floor(bet*1.95):0;
    var dtd=$('dtb');if(dtd)dtd.textContent=dCard;
    var dtt=$('dtp');if(dtt)dtt.textContent=tCard;
    finishGame(won,payout,bet);
    showGRes('gres','grt','grs',won,won?'Win! +'+fmt(payout):'Lost!','Dragon: '+dCard+' | Tiger: '+tCard);
    if(btn)btn.disabled=false;
    return;
  }
  if(t==='bac'){
    var bCards=['A','2','3','4','5','6','7','8','9','0','0','0','0'];
    var bp=rnd(0,9)+rnd(0,9)%10, pp=rnd(0,9)+rnd(0,9)%10;
    var bside=$('bac-pick')?$('bac-pick').dataset.val||'banker':'banker';
    won=wc()?((bside==='banker')?bp>pp:pp>bp):((bside==='banker')?bp<pp:pp<bp);
    payout=won?Math.floor(bet*1.95):0;
    var bacb=$('bacb');if(bacb)bacb.textContent=bp;
    var bacp=$('bacp');if(bacp)bacp.textContent=pp;
    finishGame(won,payout,bet);
    showGRes('gres','grt','grs',won,won?'Win! +'+fmt(payout):'Lost!','Banker: '+bp+' | Player: '+pp);
    if(btn)btn.disabled=false;
    return;
  }
  // Default
  won=wc();payout=won?Math.floor(bet*(g.mult||2)):0;
  finishGame(won,payout,bet);
  showGRes('gres','grt','grs',won,won?'Win! +'+fmt(payout):'Lost!','');
  if(btn)btn.disabled=false;
}

// ── BUILD GAME AREA ──
function buildGameArea(g){
  var area=$('gma');area.innerHTML='';
  var t=g.type;
  if(t==='slots'){
    var w=document.createElement('div');
    w.style.cssText='display:flex;gap:10px;justify-content:center;margin:0.5rem 0;';
    for(var i=0;i<3;i++){
      var r=document.createElement('div');r.className='slreel';r.id='sr'+i;
      r.textContent=pick(SLOT_SYMS[g.syms]||SLOT_SYMS.slots1);
      w.appendChild(r);
    }
    area.appendChild(w);
  }
  if(t==='coin'){
    area.innerHTML='<div style="text-align:center;margin:1rem 0;"><div id="coinface" style="font-size:48px;margin-bottom:14px;">🌕</div>'+
      '<div style="display:flex;gap:10px;justify-content:center;">'+
      '<button class="cbtn sel" data-val="HEADS" onclick="document.querySelectorAll(\'[data-val]\').forEach(function(b){b.classList.remove(\'sel\');});this.classList.add(\'sel\');" id="coin-pick" style="padding:10px 22px;">HEADS</button>'+
      '<button class="cbtn" data-val="TAILS" onclick="document.querySelectorAll(\'[data-val]\').forEach(function(b){b.classList.remove(\'sel\');});this.classList.add(\'sel\');document.getElementById(\'coin-pick\').dataset.val=\'TAILS\';" style="padding:10px 22px;">TAILS</button>'+
      '</div></div>';
    var cp=area.querySelector('[data-val="HEADS"]');
    if(cp){cp.onclick=function(){area.querySelectorAll('[data-val]').forEach(function(b){b.classList.remove('sel');});cp.classList.add('sel');cp.dataset.val='HEADS';$('coin-pick').dataset.val='HEADS';};}
  }
  if(t==='roulette'){
    area.innerHTML='<div style="text-align:center;margin:1rem 0;">'+
      '<div id="roulball" style="font-size:20px;font-weight:800;color:var(--accent);margin-bottom:14px;">Spin to play!</div>'+
      '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">'+
      '<button class="cbtn sel" data-val="red" style="background:#e74c3c;color:#fff;border-color:#e74c3c;">🔴 Red</button>'+
      '<button class="cbtn" data-val="black" style="background:#222;color:#fff;border-color:#444;">⚫ Black</button>'+
      '<button class="cbtn" data-val="green">🟢 0</button>'+
      '</div></div>';
    var rp=document.getElementById('roul-pick')||document.createElement('input');
    rp.id='roul-pick';rp.type='hidden';rp.dataset.val='red';area.appendChild(rp);
    area.querySelectorAll('[data-val]').forEach(function(b){
      b.onclick=function(){area.querySelectorAll('[data-val]').forEach(function(x){x.classList.remove('sel');x.style.opacity='0.7';});b.classList.add('sel');b.style.opacity='1';if(rp)rp.dataset.val=b.dataset.val;};
    });
  }
  if(t==='hilo'){
    area.innerHTML='<div style="text-align:center;margin:1rem 0;">'+
      '<div style="font-size:28px;font-weight:900;color:var(--txt);margin-bottom:14px;" id="hilop">?</div>'+
      '<div style="display:flex;gap:10px;justify-content:center;">'+
      '<button class="cbtn sel" id="hilo-hi" style="padding:10px 22px;">▲ Higher</button>'+
      '<button class="cbtn" id="hilo-lo" style="padding:10px 22px;">▼ Lower</button>'+
      '</div></div>';
  }
  if(t==='dt'){
    area.innerHTML='<div style="display:flex;justify-content:space-around;margin:1rem 0;">'+
      '<div style="text-align:center;"><div style="font-size:24px;margin-bottom:6px;">🐉</div><div id="dtb" style="font-size:28px;font-weight:900;color:var(--accent);">?</div><div style="font-size:11px;color:var(--txt2);">Dragon</div></div>'+
      '<div style="text-align:center;padding-top:20px;font-size:12px;color:var(--txt2);font-weight:700;">VS</div>'+
      '<div style="text-align:center;"><div style="font-size:24px;margin-bottom:6px;">🐯</div><div id="dtp" style="font-size:28px;font-weight:900;color:var(--accent);">?</div><div style="font-size:11px;color:var(--txt2);">Tiger</div></div>'+
      '</div>'+
      '<div style="display:flex;gap:10px;justify-content:center;"><button class="cbtn sel" data-val="dragon" id="dt-pick" style="padding:10px 20px;">🐉 Dragon</button><button class="cbtn" data-val="tiger" style="padding:10px 20px;">🐯 Tiger</button></div>';
    area.querySelectorAll('.cbtn').forEach(function(b){
      b.onclick=function(){area.querySelectorAll('.cbtn').forEach(function(x){x.classList.remove('sel');});b.classList.add('sel');var dp=$('dt-pick');if(dp)dp.dataset.val=b.dataset.val;};
    });
  }
  if(t==='bac'){
    area.innerHTML='<div style="display:flex;justify-content:space-around;margin:1rem 0;">'+
      '<div style="text-align:center;"><div style="font-size:12px;color:var(--txt2);margin-bottom:4px;">Banker</div><div id="bacb" style="font-size:28px;font-weight:900;color:#e74c3c;">?</div></div>'+
      '<div style="text-align:center;"><div style="font-size:12px;color:var(--txt2);margin-bottom:4px;">Player</div><div id="bacp" style="font-size:28px;font-weight:900;color:#3b82f6;">?</div></div>'+
      '</div>'+
      '<div style="display:flex;gap:8px;justify-content:center;"><button class="cbtn sel" data-val="banker" id="bac-pick" style="padding:10px 20px;">Banker</button><button class="cbtn" data-val="player" style="padding:10px 20px;">Player</button></div>';
    area.querySelectorAll('.cbtn').forEach(function(b){
      b.onclick=function(){area.querySelectorAll('.cbtn').forEach(function(x){x.classList.remove('sel');});b.classList.add('sel');var bp=$('bac-pick');if(bp)bp.dataset.val=b.dataset.val;};
    });
  }
  if(t==='wheel'){
    area.innerHTML='<div style="text-align:center;margin:1rem 0;"><div id="wheelres" style="font-size:32px;font-weight:900;color:var(--accent);margin-bottom:6px;">?</div><div style="font-size:11px;color:var(--txt2);">Spin the wheel!</div></div>';
  }
  if(t==='bigsmall'){
    area.innerHTML='<div style="text-align:center;margin:1rem 0;">'+
      '<div style="font-size:24px;font-weight:900;color:var(--accent);margin-bottom:14px;">BIG or SMALL?</div>'+
      '<div style="display:flex;gap:12px;justify-content:center;">'+
      '<button class="cbtn sel" data-val="big" id="bs-pick" style="padding:12px 28px;font-size:15px;">BIG (7+)</button>'+
      '<button class="cbtn" data-val="small" style="padding:12px 28px;font-size:15px;">SMALL (<7)</button>'+
      '</div></div>';
    area.querySelectorAll('.cbtn').forEach(function(b){
      b.onclick=function(){area.querySelectorAll('.cbtn').forEach(function(x){x.classList.remove('sel');});b.classList.add('sel');var bp=$('bs-pick');if(bp)bp.dataset.val=b.dataset.val;};
    });
  }
  if(t==='oddeven'){
    area.innerHTML='<div style="text-align:center;margin:1rem 0;">'+
      '<div style="font-size:24px;font-weight:900;color:var(--accent);margin-bottom:14px;">ODD or EVEN?</div>'+
      '<div style="display:flex;gap:12px;justify-content:center;">'+
      '<button class="cbtn sel" data-val="odd" id="oe-pick" style="padding:12px 28px;font-size:15px;">ODD</button>'+
      '<button class="cbtn" data-val="even" style="padding:12px 28px;font-size:15px;">EVEN</button>'+
      '</div></div>';
    area.querySelectorAll('.cbtn').forEach(function(b){
      b.onclick=function(){area.querySelectorAll('.cbtn').forEach(function(x){x.classList.remove('sel');});b.classList.add('sel');var op=$('oe-pick');if(op)op.dataset.val=b.dataset.val;};
    });
  }
  if(t==='colorpick'||t==='colorball'){
    area.innerHTML='<div style="text-align:center;margin:1rem 0;">'+
      '<div id="cballball" style="font-size:44px;margin-bottom:14px;">🔵</div>'+
      '<div style="display:flex;gap:10px;justify-content:center;">'+
      '<button class="cbtn sel" data-val="Red" id="cpick-sel" style="background:rgba(231,76,60,0.2);border-color:#e74c3c;color:#e74c3c;">🔴 Red</button>'+
      '<button class="cbtn" data-val="Blue" style="background:rgba(59,130,246,0.2);border-color:#3b82f6;color:#3b82f6;">🔵 Blue</button>'+
      '<button class="cbtn" data-val="Green" style="background:rgba(74,222,128,0.2);border-color:#4ade80;color:#4ade80;">🟢 Green</button>'+
      '</div></div>';
    area.querySelectorAll('.cbtn').forEach(function(b){
      b.onclick=function(){area.querySelectorAll('.cbtn').forEach(function(x){x.classList.remove('sel');});b.classList.add('sel');var cp=$('cpick-sel');if(cp)cp.dataset.val=b.dataset.val;};
    });
  }
  if(t==='lucky'){
    area.innerHTML='<div style="text-align:center;margin:1rem 0;">'+
      '<div style="font-size:13px;color:var(--txt2);margin-bottom:10px;">Pick a number (1-'+( g.max||10)+')</div>'+
      '<input type="number" id="lucky-inp" min="1" max="'+(g.max||10)+'" value="5" style="width:80px;padding:10px;border-radius:10px;border:2px solid var(--border);background:var(--bg2);color:var(--txt);font-size:22px;font-weight:900;text-align:center;outline:none;"/>'+
      '</div>';
  }
  if(t==='keno'){
    area.innerHTML='<div style="text-align:center;margin:1rem 0;">'+
      '<div style="font-size:13px;color:var(--txt2);margin-bottom:8px;">Keno — pick numbers below</div>'+
      '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">'+
      Array.from({length:20},function(_,i){return '<button class="cbtn" style="width:36px;height:36px;padding:0;">'+(i+1)+'</button>';}).join('')+
      '</div></div>';
  }
  if(t==='war'){
    area.innerHTML='<div style="display:flex;justify-content:space-around;margin:1rem 0;">'+
      '<div style="text-align:center;"><div style="font-size:12px;color:var(--txt2);margin-bottom:4px;">You</div><div id="warp" style="font-size:36px;font-weight:900;color:var(--accent);">?</div></div>'+
      '<div style="text-align:center;padding-top:14px;font-size:20px;color:var(--txt2);font-weight:900;">VS</div>'+
      '<div style="text-align:center;"><div style="font-size:12px;color:var(--txt2);margin-bottom:4px;">Dealer</div><div id="warb" style="font-size:36px;font-weight:900;color:#e74c3c;">?</div></div>'+
      '</div>';
  }
  // Add result div
  if(!area.querySelector('#gres')){
    var rd=document.createElement('div');rd.id='gres';rd.className='gres';rd.style.display='none';
    rd.innerHTML='<div id="grt" class="grt"></div><div id="grs" class="grs"></div>';
    area.appendChild(rd);
  }
}

// ── BLACKJACK ──
function startBJ(g,bet){
  var nb=bal()-bet;CD.balance=nb;fbUp('/players/'+CK,{balance:nb});ub();
  var deck='23456789TJQKA'.split('').map(function(c){return [c+'♠',c+'♥',c+'♦',c+'♣'];}).flat();
  function shuffle(d){for(var i=d.length-1;i>0;i--){var j=rnd(0,i);var t=d[i];d[i]=d[j];d[j]=t;}return d;}
  deck=shuffle(deck.concat(shuffle(deck)));
  function val(c){var v=c[0];return isNaN(v)?(v==='A'?11:10):parseInt(v);}
  function handVal(h){var t=h.reduce(function(s,c){return s+val(c);},0);h.forEach(function(c){if(c[0]==='A'&&t>21)t-=10;});return t;}
  bjState={deck:deck,player:[deck.pop(),deck.pop()],dealer:[deck.pop(),deck.pop()],bet:bet,done:false};

  var area=$('gma');
  function render(){
    var pv=handVal(bjState.player),dv=handVal(bjState.dealer);
    area.innerHTML=
      '<div style="margin-bottom:12px;"><div style="font-size:11px;color:var(--txt2);margin-bottom:4px;">Dealer '+(bjState.done?'('+dv+')':'')+'</div>'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap;" id="bjd">'+
      bjState.dealer.map(function(c,i){return '<div class="hilo-card" style="background:var(--bg2);color:'+(c.includes('♥')||c.includes('♦')?'#e74c3c':'var(--txt)')+';">'+(bjState.done||i===0?c:'?')+'</div>';}).join('')+'</div></div>'+
      '<div><div style="font-size:11px;color:var(--txt2);margin-bottom:4px;">You ('+pv+')'+(pv===21?' 🃏 Blackjack!':pv>21?' 💥 Bust':'')+'</div>'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap;" id="bjp">'+
      bjState.player.map(function(c){return '<div class="hilo-card" style="background:var(--bg2);color:'+(c.includes('♥')||c.includes('♦')?'#e74c3c':'var(--txt)')+';">'+c+'</div>';}).join('')+'</div></div>'+
      (!bjState.done?'<div style="display:flex;gap:8px;margin-top:12px;"><button id="bjhit" style="flex:1;padding:12px;background:rgba(74,222,128,0.15);color:#4ade80;border:1.5px solid rgba(74,222,128,0.4);border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;">HIT</button>'+
      '<button id="bjstand" style="flex:1;padding:12px;background:rgba(231,76,60,0.1);color:#e74c3c;border:1.5px solid rgba(231,76,60,0.3);border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;">STAND</button></div>':'');

    if(!bjState.done){
      var pv2=handVal(bjState.player);
      if(pv2>=21)endBJ();
      else{
        var hit=document.getElementById('bjhit');
        var stand=document.getElementById('bjstand');
        if(hit)hit.onclick=function(){bjState.player.push(bjState.deck.pop());render();};
        if(stand)stand.onclick=function(){endBJ();};
      }
    }
  }

  function endBJ(){
    bjState.done=true;
    while(handVal(bjState.dealer)<17)bjState.dealer.push(bjState.deck.pop());
    var pv=handVal(bjState.player),dv=handVal(bjState.dealer);
    var won=pv<=21&&(pv>dv||dv>21);
    var push=pv===dv&&pv<=21;
    var payout=push?bet:won?Math.floor(bet*(g.mult||2)):0;
    if(push){CD.balance=bal()+bet;fbUp('/players/'+CK,{balance:bal()});ub();}
    else finishGame(won,payout,bet);
    render();
    setTimeout(function(){
      showGRes('gres','grt','grs',won||push,
        push?'Push — Tie!':won?'Blackjack Win! +'+fmt(payout):'Bust or Dealer Wins',
        'You: '+pv+' | Dealer: '+dv);
      var rd=$('gres');if(rd)area.appendChild(rd);
    },200);
  }
  render();
  var rd=document.getElementById('gres');
  if(!rd){rd=document.createElement('div');rd.id='gres';rd.className='gres';rd.style.display='none';
    rd.innerHTML='<div id="grt" class="grt"></div><div id="grs" class="grs"></div>';area.appendChild(rd);}
}

// ── MINES ──
function calcMinesMult(total,mines,safe){
  var m=1;for(var i=0;i<safe;i++){var rem=total-i;var rs=rem-mines;if(rs<=0)break;m*=(rem/rs)*0.97;}
  return Math.round(m*100)/100;
}

function startMines(g,bet){
  var nb=bal()-bet;CD.balance=nb;fbUp('/players/'+CK,{balance:nb});ub();
  var TOTAL=25,mc=g.mines||5,mines=[];
  while(mines.length<mc){var m=rnd(0,TOTAL-1);if(mines.indexOf(m)<0)mines.push(m);}
  mState={bet:bet,mines:mines,revealed:[],active:true,safeCount:0};

  var area=$('gma');
  function render(){
    area.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding:8px 12px;background:var(--bg2);border-radius:10px;border:1px solid var(--border);">'+
      '<div style="font-size:12px;color:var(--txt2);">'+mc+' mines · '+(TOTAL-mc)+' gems</div>'+
      '<div id="minepot" style="font-size:14px;font-weight:800;color:var(--accent);">'+fmt(Math.floor(bet*calcMinesMult(TOTAL,mc,mState.safeCount)))+'</div>'+
      '</div>'+
      '<div id="minemult" style="text-align:center;font-size:11px;color:var(--txt2);margin-bottom:8px;">Multiplier: '+calcMinesMult(TOTAL,mc,mState.safeCount).toFixed(2)+'x</div>'+
      '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;">'+
      Array.from({length:TOTAL},function(_,i){
        var isRev=mState.revealed.indexOf(i)>=0;
        var isMine=mines.indexOf(i)>=0;
        if(isRev){
          return '<div style="height:44px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:20px;background:'+(isMine?'rgba(231,76,60,0.15)':'rgba(74,222,128,0.1)')+';border:1.5px solid '+(isMine?'#e74c3c':'#4ade80')+';">'+(isMine?'💣':'💎')+'</div>';
        }
        return '<div class="mine-cell" data-i="'+i+'" style="height:44px;border-radius:8px;background:var(--bg2);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;">❓</div>';
      }).join('')+
      '</div>'+
      (mState.safeCount>0&&mState.active?'<button onclick="minesCashout()" style="width:100%;margin-top:12px;padding:12px;background:rgba(74,222,128,0.15);color:#4ade80;border:1.5px solid rgba(74,222,128,0.4);border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;">Cash Out '+fmt(Math.floor(bet*calcMinesMult(TOTAL,mc,mState.safeCount)))+'</button>':'')+
      '<div id="gres" class="gres" style="display:none;"><div id="grt" class="grt"></div><div id="grs" class="grs"></div></div>';

    if(mState.active){
      area.querySelectorAll('.mine-cell').forEach(function(cell){
        cell.onclick=function(){
          var idx=parseInt(cell.dataset.i);
          if(mState.revealed.indexOf(idx)>=0||!mState.active)return;
          mState.revealed.push(idx);
          if(mines.indexOf(idx)>=0){
            mState.active=false;
            // Reveal all mines
            mines.forEach(function(m2){if(mState.revealed.indexOf(m2)<0)mState.revealed.push(m2);});
            render();
            finishGame(false,0,bet);
            showGRes('gres','grt','grs',false,'💣 BOOM! Lost '+fmt(bet),'Mine hit!');
          } else {
            mState.safeCount++;
            render();
          }
        };
      });
    }
  }
  render();
}

window.minesCashout=function(){
  if(!mState.active)return;
  mState.active=false;
  var payout=Math.floor(mState.bet*calcMinesMult(25,mState.mines.length,mState.safeCount));
  finishGame(true,payout,mState.bet);
  showGRes('gres','grt','grs',true,'💎 Cashed out! +'+fmt(payout),mState.safeCount+' gems found');
};

// ── TOWER ──
function startTower(g,bet){
  var nb=bal()-bet;CD.balance=nb;fbUp('/players/'+CK,{balance:nb});ub();
  var FLOORS=6,COLS=3;
  tState={bet:bet,floor:0,mult:1.0,active:true,traps:[],safeCol:[]};
  for(var f=0;f<FLOORS;f++){
    var safe=rnd(0,COLS-1);tState.safeCol.push(safe);
    var bombs=[];for(var c=0;c<COLS;c++){if(c!==safe)bombs.push(c);}
    tState.traps.push(bombs);
  }
  var mults=[1,1.90,3.60,6.80,12.90,24.50,46.50];
  var area=$('gma');

  function render(){
    area.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding:8px 12px;background:var(--bg2);border-radius:10px;border:1px solid var(--border);">'+
      '<div id="towerco" style="font-size:13px;color:var(--txt2);">Floor '+(tState.floor+1)+'/'+FLOORS+'</div>'+
      '<div id="towermult" style="font-size:14px;font-weight:800;color:var(--accent);">'+(mults[tState.floor]||1)+'x · '+fmt(Math.floor(bet*(mults[tState.floor]||1)))+'</div>'+
      '</div>'+
      '<div style="display:flex;flex-direction:column-reverse;gap:6px;">'+
      Array.from({length:FLOORS},function(_,fi){
        var active=fi===tState.floor&&tState.active;
        var done=fi<tState.floor;
        return '<div style="display:flex;gap:6px;opacity:'+(active?1:done?0.5:0.3)+';">'+
          Array.from({length:COLS},function(_,ci){
            if(done){var wasSafe=tState.safeCol[fi]===ci;return '<div style="flex:1;height:42px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:20px;background:'+(wasSafe?'rgba(74,222,128,0.1)':'rgba(231,76,60,0.1)')+';border:1.5px solid '+(wasSafe?'#4ade80':'#e74c3c')+';">'+(wasSafe?'🍎':'💣')+'</div>';}
            if(active)return '<div class="tower-cell" data-fi="'+fi+'" data-ci="'+ci+'" style="flex:1;height:42px;border-radius:8px;background:var(--bg2);border:1.5px solid var(--accent);display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;">❓</div>';
            return '<div style="flex:1;height:42px;border-radius:8px;background:var(--bg2);border:1.5px solid var(--border);"></div>';
          }).join('')+
        '</div>';
      }).join('')+
      '</div>'+
      (tState.floor>0&&tState.active?'<button onclick="towerCashout()" style="width:100%;margin-top:12px;padding:12px;background:rgba(74,222,128,0.15);color:#4ade80;border:1.5px solid rgba(74,222,128,0.4);border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;">Cash Out '+fmt(Math.floor(bet*(mults[tState.floor]||1)))+'</button>':'')+
      '<div id="gres" class="gres" style="display:none;"><div id="grt" class="grt"></div><div id="grs" class="grs"></div></div>';

    if(tState.active){
      area.querySelectorAll('.tower-cell').forEach(function(cell){
        cell.onclick=function(){
          var fi=parseInt(cell.dataset.fi),ci=parseInt(cell.dataset.ci);
          if(fi!==tState.floor||!tState.active)return;
          if(tState.traps[fi].indexOf(ci)>=0){
            tState.active=false;render();
            finishGame(false,0,bet);
            showGRes('gres','grt','grs',false,'💣 Bomb! Lost '+fmt(bet),'');
          } else {
            tState.floor++;
            if(tState.floor>=FLOORS){tState.active=false;var p=Math.floor(bet*mults[FLOORS]);finishGame(true,p,bet);render();showGRes('gres','grt','grs',true,'🏆 Top! +'+fmt(p),'All floors cleared!');}
            else render();
          }
        };
      });
    }
  }
  render();
}

window.towerCashout=function(){
  if(!tState.active)return;
  tState.active=false;
  var mults=[1,1.90,3.60,6.80,12.90,24.50,46.50];
  var p=Math.floor(tState.bet*(mults[tState.floor]||1));
  finishGame(true,p,tState.bet);
  showGRes('gres','grt','grs',true,'🍎 Cashed out! +'+fmt(p),'Floor '+(tState.floor)+' cleared!');
};

// ── PLINKO ──
function startPlinko(g,bet){
  var nb=bal()-bet;CD.balance=nb;fbUp('/players/'+CK,{balance:nb});ub();
  var rows=g.rows||8;
  var mults=[0.2,0.5,1,1.5,2,1.5,1,0.5,0.2];
  var pos=0;
  for(var r=0;r<rows;r++){pos+=Math.random()<0.5?1:0;}
  var mult=mults[Math.min(pos,mults.length-1)]||1;
  var payout=Math.floor(bet*mult);
  var won=payout>=bet;
  finishGame(won,payout,bet);
  var area=$('gma');
  area.innerHTML='<div style="text-align:center;padding:1.5rem;"><div style="font-size:36px;margin-bottom:10px;">⚪</div>'+
    '<div style="font-size:18px;font-weight:900;color:var(--accent);margin-bottom:8px;">'+mult+'x</div>'+
    '<div style="font-size:13px;color:var(--txt2);">Plinko result</div>'+
    '<div id="gres" class="gres" style="display:none;"><div id="grt" class="grt"></div><div id="grs" class="grs"></div></div></div>';
  showGRes('gres','grt','grs',won,'Plinko '+mult+'x → '+(won?'Win':'Loss')+' '+fmt(payout),'');
}

// ── CRASH GAME ──
function openCrash(g){
  CS={vehicle:g.vehicle||'rocket',theme:g.theme||{color:'#4ade80',lc:'#4ade80'},bet:0,betPlaced:false,phase:'waiting',cashedOut:false,mult:1.00,running:false,animId:null,crashAt:1.5};
  st('gtitle',g.name);
  var ccanvas=$('ccanvas');
  if(ccanvas){ccanvas.width=ccanvas.offsetWidth||400;ccanvas.height=220;}
  $('gclose').onclick=function(){closeCrashGame();cm('gov');};
  om('gov');
  startCrashCountdown();
}

function closeCrashGame(){
  CS.running=false;
  if(CS.animId){cancelAnimationFrame(CS.animId);CS.animId=null;}
  if(CS.betPlaced&&CS.bet>0&&CS.phase!=='crashed'){
    CD.balance=bal()+CS.bet;fbUp('/players/'+CK,{balance:bal()});ub();
    CS.betPlaced=false;CS.bet=0;
  }
}

function startCrashCountdown(){
  CS.phase='waiting';CS.running=true;CS.cashedOut=false;CS.betPlaced=false;CS.bet=0;CS.mult=1.00;
  var won=Math.random()<0.40;CS.crashAt=parseFloat((won?1.40+Math.random()*2.5:Math.random()<0.45?1.01+Math.random()*0.08:Math.random()<0.80?1.09+Math.random()*0.20:1.29+Math.random()*0.30).toFixed(2));

  var cplay=$('cplay'),ccash=$('ccashout'),cmult=$('cmult');
  if(cplay){cplay.textContent='Place Bet';cplay.disabled=false;}
  if(ccash){ccash.disabled=true;}
  if(cmult){cmult.textContent='WAITING';cmult.style.color='#f6c90e';cmult.style.fontSize='28px';}

  if(cplay)cplay.onclick=function(){
    var bet=getBetVal('cbinp');
    if(!bet||bet<1){alert('Enter bet amount.');return;}
    if(bet>bal()){alert('Insufficient balance.');return;}
    if(CS.phase!=='waiting'){alert('Wait for next round.');return;}
    CS.bet=bet;CS.betPlaced=true;
    var nb=bal()-bet;CD.balance=nb;fbUp('/players/'+CK,{balance:nb});ub();
    cplay.textContent='Bet Placed ✓';cplay.disabled=true;
    if(ccash)ccash.disabled=false;
  };
  if(ccash)ccash.onclick=function(){doCashout();};

  var count=8;
  var ccanvas=$('ccanvas');
  var ctx=ccanvas?ccanvas.getContext('2d'):null;
  var W=ccanvas?ccanvas.width:400, H=ccanvas?ccanvas.height:220;

  var iv=setInterval(function(){
    if(!CS.running){clearInterval(iv);return;}
    if(ctx){
      ctx.fillStyle='#050a18';ctx.fillRect(0,0,W,H);
      drawCrashStars(ctx,W,H);
      drawCrashGrid(ctx,W,H);
      drawCrashRocket(ctx,W*0.12,H*0.78,-Math.PI/4,false);
      // Countdown circle
      var cx=W/2,cy=H/2,r=40;
      ctx.strokeStyle='rgba(246,201,0,0.2)';ctx.lineWidth=4;
      ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle='#f6c90e';
      ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+(count/8)*Math.PI*2);ctx.stroke();
      ctx.fillStyle='#f6c90e';ctx.font='bold 32px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(count,cx,cy-6);
      ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='10px sans-serif';
      ctx.fillText('PLACE BET NOW',cx,cy+18);
    }
    if(cmult)cmult.textContent=count+'s...';
    count--;
    if(count<0){clearInterval(iv);if(CS.running)beginFlight();}
  },1000);
}

function beginFlight(){
  CS.phase='flying';CS.running=true;CS.mult=1.00;
  var cplay=$('cplay'),ccash=$('ccashout'),cmult=$('cmult');
  if(cplay){cplay.disabled=true;cplay.textContent='Running...';}
  if(CS.betPlaced){if(ccash)ccash.disabled=false;}else{if(ccash)ccash.disabled=true;}

  var ccanvas=$('ccanvas');
  if(!ccanvas)return;
  ccanvas.width=ccanvas.offsetWidth||400;ccanvas.height=220;
  var ctx=ccanvas.getContext('2d'),W=ccanvas.width,H=ccanvas.height;
  var t0=performance.now(),pts=[];
  var startX=W*0.10,startY=H*0.82;
  var FIXED_ANGLE=-Math.PI*0.18;
  var auto=parseFloat($('cauto')?$('cauto').value||0:0)||0;

  function frame(ts){
    if(!CS.running)return;
    var el=(ts-t0)/1000;
    CS.mult=parseFloat(Math.max(1.00,Math.pow(1.04,el*5)).toFixed(2));
    if(auto>1&&CS.mult>=auto&&!CS.cashedOut&&CS.betPlaced){doCashout();return;}
    if(CS.mult>=CS.crashAt){doCrashEnd(ctx,W,H,pts,startY);return;}

    ctx.fillStyle='#050a18';ctx.fillRect(0,0,W,H);
    drawCrashGrid(ctx,W,H);
    drawCrashStars(ctx,W,H);

    var progress=Math.min(0.88,(CS.mult-1)/(Math.max(1.5,CS.crashAt)-1));
    var rx=startX+Math.pow(progress,1.2)*W*0.80;
    var ry=startY-Math.pow(progress,0.55)*H*0.76;
    pts.push({x:rx,y:ry});

    if(pts.length>1){
      var grad=ctx.createLinearGradient(0,startY-H*0.7,0,startY);
      grad.addColorStop(0,CS.theme.lc+'18');grad.addColorStop(1,'transparent');
      ctx.beginPath();ctx.moveTo(startX,startY);
      pts.forEach(function(p){ctx.lineTo(p.x,p.y);});
      ctx.lineTo(pts[pts.length-1].x,startY);ctx.closePath();
      ctx.fillStyle=grad;ctx.fill();
      ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
      for(var pi=1;pi<pts.length;pi++)ctx.lineTo(pts[pi].x,pts[pi].y);
      ctx.strokeStyle=CS.theme.lc;ctx.lineWidth=2.5;
      ctx.shadowColor=CS.theme.color;ctx.shadowBlur=8;ctx.stroke();ctx.shadowBlur=0;
    }

    var tip=pts[pts.length-1];
    if(tip){
      var smoothAngle=FIXED_ANGLE;
      if(pts.length>10){
        var p1=pts[Math.max(0,pts.length-12)],p2=pts[pts.length-1];
        var dx=p2.x-p1.x,dy=p2.y-p1.y;
        var ca=Math.atan2(dy,dx);
        smoothAngle=Math.max(-Math.PI*0.35,Math.min(0,ca));
      }
      if(pts.length>8){
        ctx.save();ctx.globalAlpha=0.1;
        drawCrashRocket(ctx,pts[Math.max(0,pts.length-8)].x,pts[Math.max(0,pts.length-8)].y,smoothAngle,false);
        ctx.globalAlpha=1;ctx.restore();
      }
      drawCrashRocket(ctx,tip.x,tip.y,smoothAngle,true);
    }

    var multColor=CS.mult>=5?'#e74c3c':CS.mult>=3?'#f6c90e':CS.mult>=2?'#e67e22':'#4ade80';
    if(cmult){cmult.textContent=CS.mult.toFixed(2)+'x';cmult.style.color=multColor;cmult.style.fontSize='42px';}
    CS.animId=requestAnimationFrame(frame);
  }
  CS.animId=requestAnimationFrame(frame);
}

function doCrashEnd(ctx,W,H,pts,startY){
  CS.running=false;CS.phase='crashed';
  if(CS.animId){cancelAnimationFrame(CS.animId);CS.animId=null;}
  var cmult=$('cmult');
  if(cmult){cmult.textContent='CRASHED '+CS.crashAt+'x';cmult.style.color='#e74c3c';cmult.style.fontSize='24px';}
  if(CS.betPlaced&&!CS.cashedOut){
    finishGame(false,0,CS.bet);
    showGRes('cres','crt','crs',false,'💥 Crashed at '+CS.crashAt+'x','Better luck next round!');
  }
  // Draw crash
  if(ctx){
    ctx.fillStyle='rgba(231,76,60,0.15)';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#e74c3c';ctx.font='bold 28px sans-serif';ctx.textAlign='center';
    ctx.fillText('CRASHED @ '+CS.crashAt+'x',W/2,H/2);
  }
  setTimeout(function(){if(CS.phase==='crashed')startCrashCountdown();},4000);
}

function doCashout(){
  if(!CS.betPlaced||CS.cashedOut||CS.phase!=='flying')return;
  CS.cashedOut=true;
  var payout=Math.floor(CS.bet*CS.mult);
  finishGame(true,payout,CS.bet);
  showGRes('cres','crt','crs',true,'💰 Cashed out at '+CS.mult.toFixed(2)+'x! +'+fmt(payout),'Profit: +'+fmt(payout-CS.bet));
  var ccash=$('ccashout');if(ccash)ccash.disabled=true;
}

// ── CRASH HELPERS ──
function drawCrashGrid(ctx,W,H){
  ctx.strokeStyle='rgba(255,255,255,0.04)';ctx.lineWidth=1;
  for(var x=0;x<W;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(var y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
}

function drawCrashStars(ctx,W,H){
  ctx.fillStyle='rgba(255,255,255,0.6)';
  for(var i=0;i<30;i++){
    var sx=(Math.sin(i*137.5)*W+W)%W;
    var sy=(Math.cos(i*97.3)*H+H)%H;
    ctx.fillRect(sx,sy,1,1);
  }
}

function drawCrashRocket(ctx,x,y,rotation,withFlame){
  var vehicle=CS.vehicle||'rocket';
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation);
  var c1=CS.theme?CS.theme.color:'#4ade80';
  var c2=CS.theme?CS.theme.lc:'#86efac';

  if(vehicle==='plane'){
    ctx.fillStyle='#c8d8ff';ctx.beginPath();ctx.ellipse(0,0,18,5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(10,-5);ctx.lineTo(10,5);ctx.closePath();ctx.fill();
    ctx.fillStyle=c1;
    ctx.beginPath();ctx.moveTo(2,-5);ctx.lineTo(6,-22);ctx.lineTo(10,-22);ctx.lineTo(8,-5);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(2,5);ctx.lineTo(6,22);ctx.lineTo(10,22);ctx.lineTo(8,5);ctx.closePath();ctx.fill();
    ctx.fillStyle='#1e3a8a';
    ctx.beginPath();ctx.moveTo(-14,-5);ctx.lineTo(-20,-14);ctx.lineTo(-16,-5);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-14,5);ctx.lineTo(-20,14);ctx.lineTo(-16,5);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(147,197,253,0.9)';ctx.beginPath();ctx.ellipse(4,0,3,2.5,0,0,Math.PI*2);ctx.fill();
    if(withFlame){
      var t=Date.now()*0.012,tl=14+Math.sin(t)*4;
      var g2=ctx.createLinearGradient(-18,0,-18-tl,0);
      g2.addColorStop(0,'rgba(150,200,255,0.9)');g2.addColorStop(1,'rgba(150,200,255,0)');
      ctx.fillStyle=g2;ctx.beginPath();ctx.ellipse(-18-tl/2,0,tl/2,4,0,0,Math.PI*2);ctx.fill();
    }
  } else if(vehicle==='lightning'){
    ctx.shadowColor=c1;ctx.shadowBlur=withFlame?20:8;ctx.fillStyle=c1;
    ctx.beginPath();ctx.moveTo(20,-4);ctx.lineTo(2,3);ctx.lineTo(8,3);ctx.lineTo(-20,4);ctx.lineTo(-2,-3);ctx.lineTo(-8,-3);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.7)';
    ctx.beginPath();ctx.moveTo(15,-2);ctx.lineTo(2,1.5);ctx.lineTo(6,1.5);ctx.lineTo(-15,2);ctx.lineTo(-2,-1.5);ctx.lineTo(-6,-1.5);ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;
  } else {
    ctx.fillStyle='#dde8ff';ctx.beginPath();ctx.ellipse(0,0,15,7,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#e74c3c';ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(6,-6);ctx.lineTo(6,6);ctx.closePath();ctx.fill();
    ctx.fillStyle=c1;
    ctx.beginPath();ctx.moveTo(-8,-7);ctx.lineTo(-18,-16);ctx.lineTo(-10,-7);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-8,7);ctx.lineTo(-18,16);ctx.lineTo(-10,7);ctx.closePath();ctx.fill();
    ctx.fillStyle='#4ade80';ctx.beginPath();ctx.arc(4,0,4,0,Math.PI*2);ctx.fill();
    if(withFlame){
      var ft=Date.now()*0.015,fh=16+Math.sin(ft)*5;
      var gf=ctx.createLinearGradient(-14,0,-14-fh,0);
      gf.addColorStop(0,'#f6c90e');gf.addColorStop(0.4,'#e67e22');gf.addColorStop(1,'rgba(231,76,60,0)');
      ctx.fillStyle=gf;ctx.beginPath();ctx.moveTo(-14,-5);ctx.quadraticCurveTo(-14-fh,0,-14,5);ctx.closePath();ctx.fill();
    }
  }
  ctx.restore();
}

// ── LIVE GAMES ──
var LIVE_GAMES=[
  {name:'Book of Dead',provider:"Play'n GO",cat:'slots',icon:'📖',color:'#8B4513',url:'https://asccw.playngonetwork.com/casino/ContainerLauncher?pid=2&gid=bookofdead&lang=en_GB&practice=1&channel=desktop&demo=2'},
  {name:'Gates of Olympus',provider:'Pragmatic Play',cat:'slots',icon:'⚡',color:'#4B0082',url:'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs20olympgate&websiteUrl=https://demogamesfree.pragmaticplay.net&jurisdiction=99&lobbyUrl=https://demogamesfree.pragmaticplay.net'},
  {name:'Sweet Bonanza',provider:'Pragmatic Play',cat:'slots',icon:'🍬',color:'#FF1493',url:'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs20fruitsw&websiteUrl=https://demogamesfree.pragmaticplay.net&jurisdiction=99&lobbyUrl=https://demogamesfree.pragmaticplay.net'},
  {name:'Big Bass Bonanza',provider:'Pragmatic Play',cat:'slots',icon:'🎣',color:'#006994',url:'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs10bbbonanza&websiteUrl=https://demogamesfree.pragmaticplay.net&jurisdiction=99&lobbyUrl=https://demogamesfree.pragmaticplay.net'},
  {name:'Wolf Gold',provider:'Pragmatic Play',cat:'slots',icon:'🐺',color:'#2F4F4F',url:'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs25wolfgold&websiteUrl=https://demogamesfree.pragmaticplay.net&jurisdiction=99&lobbyUrl=https://demogamesfree.pragmaticplay.net'},
  {name:'Fruit Party',provider:'Pragmatic Play',cat:'slots',icon:'🍉',color:'#228B22',url:'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs20fruitparty&websiteUrl=https://demogamesfree.pragmaticplay.net&jurisdiction=99'},
  {name:'Sugar Rush',provider:'Pragmatic Play',cat:'slots',icon:'🍭',color:'#FF69B4',url:'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs20sugarrush&websiteUrl=https://demogamesfree.pragmaticplay.net&jurisdiction=99'},
  {name:'Reactoonz',provider:"Play'n GO",cat:'slots',icon:'👾',color:'#006400',url:'https://asccw.playngonetwork.com/casino/ContainerLauncher?pid=2&gid=reactoonz&lang=en_GB&practice=1&channel=desktop&demo=2'},
  {name:'Fire Joker',provider:"Play'n GO",cat:'slots',icon:'🃏',color:'#DC143C',url:'https://asccw.playngonetwork.com/casino/ContainerLauncher?pid=2&gid=firejoker&lang=en_GB&practice=1&channel=desktop&demo=2'},
  {name:'European Roulette',provider:'Pragmatic Play',cat:'table',icon:'🎡',color:'#006400',url:'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=europeanroulette&websiteUrl=https://demogamesfree.pragmaticplay.net&jurisdiction=99'},
  {name:'Blackjack',provider:'Pragmatic Play',cat:'table',icon:'🃏',color:'#1a3a7c',url:'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=multihandblackjack21&websiteUrl=https://demogamesfree.pragmaticplay.net&jurisdiction=99'},
  {name:'Baccarat',provider:'Pragmatic Play',cat:'table',icon:'🎴',color:'#8B0000',url:'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=Baccarat&websiteUrl=https://demogamesfree.pragmaticplay.net&jurisdiction=99'},
];

function loadLiveGames(){
  var wrap=document.getElementById('live-games-wrap');if(!wrap)return;
  wrap.innerHTML='';
  var cats=[{id:'all',label:'🎮 All'},{id:'slots',label:'🎰 Slots'},{id:'table',label:'🃏 Table'}];
  var tabs=document.createElement('div');
  tabs.style.cssText='display:flex;gap:8px;margin-bottom:12px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px;scrollbar-width:none;';

  function renderCards(cat){
    var grid=document.getElementById('live-game-grid');if(!grid)return;
    grid.innerHTML='';
    var list=cat==='all'?LIVE_GAMES:LIVE_GAMES.filter(function(g){return g.cat===cat;});
    list.forEach(function(game){
      var card=document.createElement('div');
      card.style.cssText='flex-shrink:0;width:130px;background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;cursor:pointer;transition:all 0.2s;';
      card.innerHTML=
        '<div style="background:linear-gradient(135deg,'+game.color+'22,'+game.color+'44);height:80px;display:flex;align-items:center;justify-content:center;font-size:36px;position:relative;">'+
          game.icon+'<div style="position:absolute;top:6px;right:6px;background:#e74c3c;color:#fff;font-size:8px;font-weight:900;padding:2px 6px;border-radius:10px;">FREE</div>'+
        '</div>'+
        '<div style="padding:8px 10px 10px;">'+
          '<div style="font-size:12px;font-weight:800;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+game.name+'</div>'+
          '<div style="font-size:10px;color:var(--txt2);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+game.provider+'</div>'+
        '</div>';
      card.addEventListener('click',function(){openLiveGame(game);});
      card.addEventListener('mouseenter',function(){card.style.transform='scale(1.05)';card.style.borderColor='var(--accent)';});
      card.addEventListener('mouseleave',function(){card.style.transform='scale(1)';card.style.borderColor='var(--border)';});
      grid.appendChild(card);
    });
  }

  cats.forEach(function(c){
    var tab=document.createElement('button');
    tab.textContent=c.label;
    tab.style.cssText='padding:7px 16px;border-radius:20px;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt2);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all 0.2s;';
    if(c.id==='all'){tab.style.background='var(--accent)';tab.style.color='#000';tab.style.borderColor='var(--accent)';}
    tab.onclick=function(){
      tabs.querySelectorAll('button').forEach(function(b){b.style.background='var(--bg2)';b.style.color='var(--txt2)';b.style.borderColor='var(--border)';});
      tab.style.background='var(--accent)';tab.style.color='#000';tab.style.borderColor='var(--accent)';
      renderCards(c.id);
    };
    tabs.appendChild(tab);
  });

  var strip=document.createElement('div');
  strip.id='live-game-grid';
  strip.style.cssText='display:flex;gap:10px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:8px;scrollbar-width:none;';
  wrap.appendChild(tabs);
  wrap.appendChild(strip);
  renderCards('all');
}

function openLiveGame(game){
  var ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:#000;z-index:9999;display:flex;flex-direction:column;';
  var hdr=document.createElement('div');
  hdr.style.cssText='background:#0d1f3c;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;border-bottom:1px solid #1a3a7c;';
  hdr.innerHTML='<div style="display:flex;align-items:center;gap:10px;"><div style="font-size:26px;">'+game.icon+'</div>'+
    '<div><div style="font-size:15px;font-weight:800;color:#fff;">'+game.name+'</div>'+
    '<div style="font-size:10px;color:#4a6ab0;">'+game.provider+' · <span style="color:#4ade80;">Free Play</span></div></div></div>'+
    '<button id="lg-close" style="padding:7px 16px;background:rgba(231,76,60,0.15);color:#e74c3c;border:1px solid rgba(231,76,60,0.3);border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">✕ Close</button>';
  var notice=document.createElement('div');
  notice.style.cssText='background:rgba(246,201,0,0.08);border-bottom:1px solid rgba(246,201,0,0.15);padding:5px 14px;font-size:11px;color:#f6c90e;text-align:center;flex-shrink:0;';
  notice.textContent='🎮 Free demo — for fun only. No real money.';
  var frameWrap=document.createElement('div');frameWrap.style.cssText='flex:1;position:relative;';
  var loading=document.createElement('div');
  loading.style.cssText='position:absolute;inset:0;background:#050a18;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;';
  loading.innerHTML='<div style="font-size:48px;">'+game.icon+'</div><div style="color:#4a6ab0;font-size:14px;font-weight:700;">Loading...</div>';
  var frame=document.createElement('iframe');
  frame.src=game.url;frame.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:none;';
  frame.allow='fullscreen autoplay';frame.setAttribute('allowfullscreen','');
  frame.onload=function(){if(loading.parentNode)loading.remove();};
  frameWrap.appendChild(loading);frameWrap.appendChild(frame);
  ov.appendChild(hdr);ov.appendChild(notice);ov.appendChild(frameWrap);
  document.body.appendChild(ov);
  document.getElementById('lg-close').onclick=function(){ov.remove();};
}

// ── EXPOSE ALL ──
window.openGame=openGame;
window.doPlayGame=doPlayGame;
window.renderCasinoGrid=renderCasinoGrid;
window.loadHotGames=loadHotGames;
window.buildChips=buildChips;
window.getBetVal=getBetVal;
window.showGRes=showGRes;
window.finishGame=finishGame;
window.refundBet=refundBet;
window.openCrash=openCrash;
window.startCrash=startCrashCountdown;
window.doCashout=doCashout;
window.closeCrashGame=closeCrashGame;
window.startBJ=startBJ;
window.startMines=startMines;
window.startTower=startTower;
window.startPlinko=startPlinko;
window.towerCashout=towerCashout;
window.calcMinesMult=calcMinesMult;
window.buildGameArea=buildGameArea;
window.execGame=execGame;
window.loadLiveGames=loadLiveGames;
window.openLiveGame=openLiveGame;
window.fmt=fmt;
window.bal=bal;
window.ub=ub;
window.rnd=rnd;
window.pick=pick;
window.wc=wc;
window.buildGameLogo=buildGameLogo;
