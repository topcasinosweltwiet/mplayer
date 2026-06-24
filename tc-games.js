// tc-games.js — All casino games
currentGame = null; gState = {}; // global game state

var HOT_GAMES = [
  {id:'crash1',name:'Rocket Crash',icon:'🚀',badge:'hbl',type:'crash',vehicle:'rocket',theme:{name:'Rocket Crash',color:'#4ade80',lc:'#4ade80'}},
  {id:'slots1',name:'Fruit Slots',icon:'🍒',badge:'hbl',type:'slots',syms:'slots1',mult:2},
  {id:'bj1',name:'Blackjack',icon:'🃏',badge:'hbh',type:'bj',mult:2},
  {id:'mines1',name:'Mines',icon:'💣',badge:'hbh',type:'mines',mines:5},
  {id:'plinko1',name:'Plinko',icon:'⚪',badge:'hbl',type:'plinko',rows:8,maxMult:8},
  {id:'tower1',name:'Tower',icon:'🏗️',badge:'hbh',type:'tower',cols:3},
  {id:'coin1',name:'Coin Flip',icon:'🪙',badge:'hbn',type:'coin',mult:2,c1:'HEADS',c2:'TAILS'},
  {id:'wheel1',name:'Money Wheel',icon:'🎰',badge:'hbh',type:'wheel'},
  {id:'dt1',name:'Dragon Tiger',icon:'🐯',badge:'hbl',type:'dt',mult:2},
];

var ALL_CASINO = [
  {id:'crash1',name:'Rocket Crash',icon:'🚀',type:'crash',theme:{name:'Rocket Crash',color:'#4ade80',lc:'#4ade80'}},
  {id:'crash2',name:'Aviator',icon:'✈️',type:'crash',vehicle:'plane',theme:{name:'Aviator',color:'#3b82f6',lc:'#60a5fa'}},
  {id:'crash3',name:'Dragon Blast',icon:'🐉',type:'crash',vehicle:'lightning',theme:{name:'Dragon Blast',color:'#f97316',lc:'#f97316'}},
  {id:'crash4',name:'Lightning',icon:'⚡',type:'crash',theme:{name:'Lightning',color:'#facc15',lc:'#facc15'}},
  {id:'slots1',name:'Fruit Slots',icon:'🍒',type:'slots',syms:'slots1',mult:2},
  {id:'slots2',name:'Diamond Slots',icon:'GEM',type:'slots',syms:'slots2',mult:3},
  {id:'slots3',name:'Vegas Slots',icon:'🎰',type:'slots',syms:'slots3',mult:2},
  {id:'slots4',name:'Lucky 7s',icon:'7️⃣',type:'slots',syms:'slots4',mult:5},
  {id:'slots5',name:'Gold Rush',icon:'⭐',type:'slots',syms:'slots5',mult:4},
  {id:'bj1',name:'Blackjack',icon:'🃏',type:'bj',mult:2},
  {id:'bj2',name:'VIP Blackjack',icon:'♠️',type:'bj',mult:3},
  {id:'hilo1',name:'Hi-Lo',icon:'🎴',type:'hilo',mult:2},
  {id:'war1',name:'Card War',icon:'⚔️',type:'war',mult:2},
  {id:'dt1',name:'Dragon Tiger',icon:'🐯',type:'dt',mult:2},
  {id:'bac1',name:'Baccarat',icon:'🥂',type:'bac',mult:2},
  {id:'dice1',name:'Classic Dice',icon:'🎲',type:'dice',nd:2,mult:2},
  {id:'dice2',name:'Sic Bo',icon:'🎯',type:'dice',nd:3,mult:5},
  {id:'roul1',name:'Roulette',icon:'🎡',type:'roulette'},
  {id:'wheel1',name:'Money Wheel',icon:'🎰',type:'wheel'},
  {id:'coin1',name:'Coin Flip',icon:'🪙',type:'coin',mult:2,c1:'HEADS',c2:'TAILS'},
  {id:'coin2',name:'Gold Coin',icon:'💰',type:'coin',mult:3,c1:'GOLD',c2:'SILVER'},
  {id:'lucky1',name:'Lucky Number',icon:'🔮',type:'lucky',max:20,mult:5},
  {id:'keno1',name:'Keno',icon:'📊',type:'keno',mult:8},
  {id:'mines1',name:'Mines',icon:'💣',badge:'hbh',type:'mines',mines:5},
  {id:'mines2',name:'Hard Mines',icon:'💥',type:'mines',mines:10},
  {id:'plinko1',name:'Plinko',icon:'⚪',type:'plinko',rows:8,maxMult:8},
  {id:'plinko2',name:'Mega Plinko',icon:'🔵',type:'plinko',rows:12,maxMult:15},
  {id:'tower1',name:'Tower',icon:'🏗️',type:'tower',cols:3},
  {id:'color1',name:'Color Predict',icon:'🎨',type:'colorpick'},
  {id:'color2',name:'Color Ball',icon:'🟤',type:'colorball',mult:3},

  {id:'bigsmall1',name:'Big Small',icon:'🎯',type:'bigsmall',mult:2},
  {id:'oddeven1',name:'Odd Even',icon:'🔄',type:'oddeven',mult:2},
];

var SLOT_SYMS = {
  slots1:['🍒','🍋','🍊','🍇','⭐','🔔'],
  slots2:['GEM','💍','🏆','🌟','👑','💰'],
  slots3:['BAR','777','WLD','BNS','SCT','MLT'],
  slots4:['7️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'],
  slots5:['🥇','🥈','🏅','🎖️','🌠','👑'],
};
var BJR=['A','2','3','4','5','6','7','8','9','10','J','Q','K'],BJS=['♠','♥','♦','♣'];
var WOF_SEGS=[
  {l:'0x',v:0,c:'#4a1a7c'},{l:'1x',v:1,c:'#1a3a7c'},
  {l:'0x',v:0,c:'#2d0a4a'},{l:'1x',v:1,c:'#0d2460'},
  {l:'0x',v:0,c:'#3a0a6a'},{l:'2x',v:2,c:'#c0390a'},
  {l:'0x',v:0,c:'#4a1a7c'},{l:'1x',v:1,c:'#1a3a7c'},
  {l:'3x',v:3,c:'#27ae60'},{l:'0x',v:0,c:'#2d0a4a'},
  {l:'5x',v:5,c:'#e67e22'},{l:'10x',v:10,c:'#f6c90e'},
];

// ── WIN RATES — 30% all games ──
var _streak = 0;
function loadHotGames() {
  fbGet('/adminSettings/hotGames').then(function(data) {
    var games = data ? HOT_GAMES.filter(function(g){return data[g.id];}) : HOT_GAMES;
    if (!games.length) games = HOT_GAMES;
    renderHotGames(games.slice(0,10));
  }).catch(function(){renderHotGames(HOT_GAMES.slice(0,10));});
}

function renderHotGames(gamesList) {
  var wrap=$('hotscroll');if(!wrap)return;wrap.innerHTML='';
  var lbl=$('hot-section-label');
  if(lbl)lbl.style.display=gamesList.length?'flex':'none';

  var HOT_DESIGNS={
    'crash1':{bg:'linear-gradient(135deg,#0a2a1a,#0d3d22)',c1:'#4ade80',c2:'#86efac'},
    'crash2':{bg:'linear-gradient(135deg,#0a1a3d,#0d2460)',c1:'#3b82f6',c2:'#93c5fd'},
    'crash3':{bg:'linear-gradient(135deg,#3d1a00,#5c2a00)',c1:'#f97316',c2:'#fdba74'},
    'slots1':{bg:'linear-gradient(135deg,#2d0a3d,#3d0d52)',c1:'#a855f7',c2:'#d8b4fe'},
    'bj1':   {bg:'linear-gradient(135deg,#0a3d1a,#0d5224)',c1:'#10b981',c2:'#6ee7b7'},
    'mines1':{bg:'linear-gradient(135deg,#3d0000,#520000)',c1:'#ef4444',c2:'#fca5a5'},
    'plinko1':{bg:'linear-gradient(135deg,#00193d,#002452)',c1:'#2563eb',c2:'#93c5fd'},
    'tower1':{bg:'linear-gradient(135deg,#0a3d2a,#0d5238)',c1:'#047857',c2:'#6ee7b7'},
    'coin1': {bg:'linear-gradient(135deg,#3d3000,#524000)',c1:'#eab308',c2:'#fde68a'},
    'wheel1':{bg:'linear-gradient(135deg,#3d1a00,#522400)',c1:'#f97316',c2:'#fed7aa'},
    'dt1':   {bg:'linear-gradient(135deg,#2a1a00,#3d2600)',c1:'#d97706',c2:'#fcd34d'},
    'roul1': {bg:'linear-gradient(135deg,#1a3d00,#225200)',c1:'#22c55e',c2:'#86efac'},
    'hilo1': {bg:'linear-gradient(135deg,#3d1a2a,#52243a)',c1:'#f43f5e',c2:'#fda4af'},
  };

  gamesList.forEach(function(g){
    var d=HOT_DESIGNS[g.id]||{bg:'linear-gradient(135deg,#0d1f3c,#1a3a7c)',c1:'#4ade80',c2:'#86efac'};
    var card=document.createElement('div');
    card.style.cssText='flex-shrink:0;width:110px;border-radius:14px;overflow:hidden;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;background:'+d.bg+';border:1px solid '+d.c1+'33;';

    var badgeLabel=g.badge==='hbl'?'LIVE':g.badge==='hbh'?'HOT':g.badge==='hbn'?'NEW':'';
    var badgeColor=g.badge==='hbl'?'#4ade80':g.badge==='hbh'?'#f97316':'#3b82f6';

    card.innerHTML=
      '<div style="height:80px;display:flex;align-items:center;justify-content:center;position:relative;">'+
        '<div style="position:absolute;inset:0;background:radial-gradient(circle at center,'+d.c2+'22,transparent);"></div>'+
        '<div style="font-size:36px;filter:drop-shadow(0 0 10px '+d.c2+');">'+g.icon+'</div>'+
        (badgeLabel?'<div style="position:absolute;top:6px;right:6px;background:'+badgeColor+'22;color:'+badgeColor+';border:1px solid '+badgeColor+'44;font-size:8px;font-weight:900;padding:2px 6px;border-radius:10px;letter-spacing:0.5px;">'+badgeLabel+'</div>':'')+
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


