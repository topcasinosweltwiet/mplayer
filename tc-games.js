// tc-games.js — All casino games
'use strict';

var HOT_GAMES = [
  {id:'crash1',name:'Rocket Crash',icon:'🚀',badge:'hbl',type:'crash',theme:{name:'Rocket Crash',color:'#4ade80',lc:'#4ade80'}},
  {id:'slots1',name:'Fruit Slots',icon:'🍒',badge:'hbl',type:'slots',syms:'slots1',mult:2},
  {id:'bj1',name:'Blackjack',icon:'🃏',badge:'hbh',type:'bj',mult:2},
  {id:'mines1',name:'Mines',icon:'💣',badge:'hbh',type:'mines',mines:3},
  {id:'plinko1',name:'Plinko',icon:'⚪',badge:'hbl',type:'plinko',rows:8,maxMult:8},
  {id:'tower1',name:'Tower',icon:'🏗️',badge:'hbh',type:'tower',cols:3},
  {id:'coin1',name:'Coin Flip',icon:'🪙',badge:'hbn',type:'coin',mult:2,c1:'HEADS',c2:'TAILS'},
  {id:'wheel1',name:'Money Wheel',icon:'🎰',badge:'hbh',type:'wheel'},
  {id:'dt1',name:'Dragon Tiger',icon:'🐯',badge:'hbl',type:'dt',mult:2},
];

var ALL_CASINO = [
  {id:'crash1',name:'Rocket Crash',icon:'🚀',type:'crash',theme:{name:'Rocket Crash',color:'#4ade80',lc:'#4ade80'}},
  {id:'crash2',name:'Aviator',icon:'✈️',type:'crash',theme:{name:'Aviator',color:'#60a5fa',lc:'#60a5fa'}},
  {id:'crash3',name:'Dragon Blast',icon:'🐉',type:'crash',theme:{name:'Dragon Blast',color:'#f97316',lc:'#f97316'}},
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
  {id:'lucky1',name:'Lucky Number',icon:'🔮',type:'lucky',max:10,mult:5},
  {id:'keno1',name:'Keno',icon:'📊',type:'keno',mult:8},
  {id:'mines1',name:'Mines',icon:'💣',type:'mines',mines:3},
  {id:'mines2',name:'Hard Mines',icon:'BOMB',type:'mines',mines:8},
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

// ── WIN RATES — 15% all games ──
var _streak = 0;
function wc(crash) {
  if (_streak > 0) { _streak--; return false; }
  var won = Math.random() < 0.15;  // 15% win chance
  if (won) _streak = rnd(3,6);     // after win, 3-6 forced losses
  return won;
}

function loadHotGames() {
  fbGet('/adminSettings/hotGames').then(function(data) {
    var games = data ? HOT_GAMES.filter(function(g){return data[g.id];}) : HOT_GAMES;
    if (!games.length) games = HOT_GAMES;
    renderHotGames(games.slice(0,10));
  }).catch(function(){renderHotGames(HOT_GAMES.slice(0,10));});
}

function renderHotGames(games) {
  var wrap = $('hotscroll'); if(!wrap)return; wrap.innerHTML = '';
  games.forEach(function(g) {
    var card = document.createElement('div'); card.className = 'hotcard';
    card.innerHTML = '<div class="hico">'+g.icon+'</div><div class="hname">'+g.name+'</div>'+
      '<div class="hbadge '+(g.badge||'hbh')+'">'+(g.badge==='hbl'?'LIVE':g.badge==='hbn'?'NEW':'HOT')+'</div>';
    card.addEventListener('click', function(){openGame(g);});
    wrap.appendChild(card);
  });
}

function renderCasinoGrid() {
  var wrap = $('cgrid'); if(!wrap)return; wrap.innerHTML = '';
  ALL_CASINO.forEach(function(g) {
    var card = document.createElement('div'); card.className = 'ccard';
    card.innerHTML = '<div class="cico">'+g.icon+'</div><div class="cname">'+g.name+'</div>';
    card.addEventListener('click', function(){
      if (!CD) { alert('Please login first.'); return; }
      openGame(g);
    });
    wrap.appendChild(card);
  });
}

// ── HELPERS ──
function buildChips(wrapId, inpId) {
  var wrap = $(wrapId); if(!wrap) return; wrap.innerHTML = '';
  [50,100,500,1000,5000].forEach(function(v) {
    var c = document.createElement('div'); c.className = 'gbchip';
    c.textContent = v >= 1000 ? (v/1000)+'K' : v;
    c.addEventListener('click', function(){var inp=$(inpId);if(inp)inp.value=v;});
    wrap.appendChild(c);
  });
}

function showGRes(resId,titleId,subId,won,title,sub) {
  var r=$(resId); if(!r)return;
  r.className = 'gres '+(won?'win':'loss'); r.style.display = 'block';
  st(titleId,title); st(subId,sub||'');
}

function getBetVal(inpId) {
  var inp=$(inpId); if(!inp)return 0;
  return parseInt(inp.value)||0;
}

// ── OPEN GAME ──
var currentGame = null, gState = {};

function openGame(g) {
  if (!CD) { alert('Please login.'); return; }
  if (g.type === 'crash') { openCrash(g); return; }
  currentGame = g; gState = {};
  $('gov').classList.add('open');
  st('gmt', g.name||'Game');
  st('gms', g.sub||'Place your bet and play!');
  $('gres').style.display = 'none'; $('gres').className = 'gres';
  $('ginp').value = ''; st('gbal', fmt(bal()));
  buildChips('gchips','ginp');
  buildGameArea(g);
  $('gpbtn').disabled = false; $('gpbtn').textContent = 'Play';
  $('gpbtn').onclick = function(){doPlayGame(g);};
}

function doPlayGame(g) {
  var bet = getBetVal('ginp');
  if (!bet || bet < 1) { alert('Enter a bet amount.'); return; }
  if (bet > bal()) { alert('Insufficient balance! Balance: '+fmt(bal())); return; }

  // Special games handle their own flow
  if (g.type === 'bj') { startBJ(g, bet); return; }
  if (g.type === 'mines') { startMines(g, bet); return; }
  if (g.type === 'plinko') { startPlinko(g, bet); return; }
  if (g.type === 'tower') { startTower(g, bet); return; }
  if (g.type === 'scratch') { startScratch(g, bet); return; }

  // For choice-based games, validate choice
  var needsChoice = ['dice','bigsmall','oddeven','roulette','coin','lucky','colorpick','colorball','keno','hilo','war','dt','bac'];
  if (needsChoice.indexOf(g.type) >= 0) {
    if (!gState.choice && g.type !== 'dice' && g.type !== 'keno' && g.type !== 'war' && g.type !== 'slots' && g.type !== 'wheel') {
      if (!gState.choice) { alert('Please make a selection first!'); return; }
    }
  }

  // Deduct bet first
  var nb = bal() - bet;
  CD.balance = nb; fbUp('/players/'+CK, {balance:nb}); ub();

  var btn = $('gpbtn'); btn.disabled = true; btn.textContent = 'Playing...';
  $('gres').style.display = 'none';
  var won = wc(false);
  setTimeout(function(){ execGame(g, bet, won, btn); }, 600+Math.random()*400);
}

function buildGameArea(g) {
  var area = $('gma'); area.innerHTML = '';
  var t = g.type;

  if (t === 'slots') {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:10px;justify-content:center;margin:0.5rem 0;';
    for (var i=0;i<3;i++) {
      var r = document.createElement('div'); r.className = 'slreel';
      r.textContent = pick(SLOT_SYMS[g.syms]||SLOT_SYMS.slots1); wrap.appendChild(r);
    }
    area.appendChild(wrap);
    var lbl = document.createElement('div');
    lbl.style.cssText='text-align:center;font-size:12px;color:var(--txt2);margin-top:4px;';
    lbl.textContent='Press Play to spin!'; area.appendChild(lbl);

  } else if (t === 'dice') {
    var nd = g.nd||2;
    var wrap = document.createElement('div');
    wrap.style.cssText='display:flex;gap:8px;justify-content:center;margin:0.5rem 0;';
    for(var i=0;i<nd;i++){var d=document.createElement('div');d.className='dief';d.textContent=rnd(1,6);wrap.appendChild(d);}
    area.appendChild(wrap);

  } else if (t === 'bigsmall' || t === 'oddeven') {
    var wrap = document.createElement('div');
    wrap.style.cssText='display:flex;gap:8px;justify-content:center;margin:0.5rem 0;';
    for(var i=0;i<3;i++){var d=document.createElement('div');d.className='dief';d.textContent=rnd(1,6);wrap.appendChild(d);}
    area.appendChild(wrap);
    var cg = document.createElement('div'); cg.className='cgrid2 c2';
    var opts = t==='bigsmall'?[{k:'big',l:'BIG (11+)'},{k:'small',l:'SMALL (10-)'}]:[{k:'odd',l:'ODD'},{k:'even',l:'EVEN'}];
    opts.forEach(function(o){
      var b=document.createElement('div');b.className='cbtn';b.textContent=o.l;
      b.addEventListener('click',function(){cg.querySelectorAll('.cbtn').forEach(function(x){x.classList.remove('sel');});b.classList.add('sel');gState.choice=o.k;});
      cg.appendChild(b);
    });
    area.appendChild(cg);

  } else if (t === 'roulette') {
    var cg = document.createElement('div'); cg.className='cgrid2 c3';
    [{k:'red',l:'🔴 Red 2x'},{k:'black',l:'⚫ Black 2x'},{k:'green',l:'🟢 Green 5x'}].forEach(function(o){
      var b=document.createElement('div');b.className='cbtn';b.textContent=o.l;
      b.addEventListener('click',function(){cg.querySelectorAll('.cbtn').forEach(function(x){x.classList.remove('sel');});b.classList.add('sel');gState.choice=o.k;});
      cg.appendChild(b);
    });
    area.appendChild(cg);
    var ball=document.createElement('div');ball.id='roulball';
    ball.style.cssText='width:60px;height:60px;border-radius:50%;background:#ccc;margin:0.5rem auto;border:3px solid var(--border);transition:background 0.5s;';
    area.appendChild(ball);

  } else if (t === 'wheel') {
    var wsvg=buildWheelSVG();area.appendChild(wsvg);
    var wr=document.createElement('div');wr.id='wheelres';
    wr.style.cssText='text-align:center;font-size:16px;font-weight:700;color:var(--accent);min-height:24px;margin-top:4px;';
    area.appendChild(wr);

  } else if (t === 'coin') {
    var coin=document.createElement('div');
    coin.style.cssText='width:80px;height:80px;border-radius:50%;background:#f6c90e;margin:0.75rem auto;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,0.15);';
    coin.id='coinface';coin.textContent=g.c1||'H';area.appendChild(coin);
    var cg=document.createElement('div');cg.className='cgrid2 c2';
    [{k:g.c1||'HEADS',l:g.c1||'HEADS'},{k:g.c2||'TAILS',l:g.c2||'TAILS'}].forEach(function(o){
      var b=document.createElement('div');b.className='cbtn';b.textContent=o.l;
      b.addEventListener('click',function(){cg.querySelectorAll('.cbtn').forEach(function(x){x.classList.remove('sel');});b.classList.add('sel');gState.choice=o.k;});
      cg.appendChild(b);
    });
    area.appendChild(cg);

  } else if (t === 'lucky') {
    var max=g.max||10;
    var info=document.createElement('div');info.style.cssText='font-size:12px;color:var(--txt2);margin-bottom:8px;';info.textContent='Pick a number (1-'+max+'):';area.appendChild(info);
    var grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(5,1fr);gap:6px;';
    for(var i=1;i<=max;i++){
      (function(num){
        var b=document.createElement('div');b.className='cbtn';b.textContent=num;b.style.fontSize='14px';
        b.addEventListener('click',function(){grid.querySelectorAll('.cbtn').forEach(function(x){x.classList.remove('sel');});b.classList.add('sel');gState.choice=num;});
        grid.appendChild(b);
      })(i);
    }
    area.appendChild(grid);

  } else if (t === 'colorpick') {
    var cg=document.createElement('div');cg.className='cgrid2 c3';
    [{k:'red',l:'🔴 Red',c:'#e74c3c'},{k:'green',l:'🟢 Green',c:'#27ae60'},{k:'violet',l:'🟣 Violet',c:'#9b59b6'}].forEach(function(o){
      var b=document.createElement('div');b.className='cbtn';b.style.color=o.c;b.textContent=o.l;
      b.addEventListener('click',function(){cg.querySelectorAll('.cbtn').forEach(function(x){x.classList.remove('sel');});b.classList.add('sel');gState.choice=o.k;});
      cg.appendChild(b);
    });
    area.appendChild(cg);
    var ball=document.createElement('div');ball.id='cpickball';
    ball.style.cssText='width:60px;height:60px;border-radius:50%;background:#ccc;margin:0.5rem auto;border:3px solid var(--border);transition:background 0.4s;';
    area.appendChild(ball);

  } else if (t === 'colorball') {
    var cg=document.createElement('div');cg.className='cgrid2 c3';
    [{k:'red',l:'🔴 Red'},{k:'blue',l:'🔵 Blue'},{k:'yellow',l:'🟡 Yellow'}].forEach(function(o){
      var b=document.createElement('div');b.className='cbtn';b.textContent=o.l;
      b.addEventListener('click',function(){cg.querySelectorAll('.cbtn').forEach(function(x){x.classList.remove('sel');});b.classList.add('sel');gState.choice=o.k;});
      cg.appendChild(b);
    });
    area.appendChild(cg);
    var ball=document.createElement('div');ball.id='cballball';
    ball.style.cssText='width:60px;height:60px;border-radius:50%;background:#ccc;margin:0.5rem auto;border:3px solid var(--border);transition:background 0.4s;';
    area.appendChild(ball);

  } else if (t === 'keno') {
    var info=document.createElement('div');info.style.cssText='font-size:12px;color:var(--txt2);margin-bottom:8px;';info.textContent='Pick up to 3 numbers:';area.appendChild(info);
    var grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(5,1fr);gap:6px;';
    gState.kenoSel=[];
    for(var i=1;i<=20;i++){
      (function(num){
        var b=document.createElement('div');b.className='cbtn';b.textContent=num;b.style.fontSize='13px';
        b.addEventListener('click',function(){
          var idx=gState.kenoSel.indexOf(num);
          if(idx>=0){gState.kenoSel.splice(idx,1);b.classList.remove('sel');}
          else if(gState.kenoSel.length<3){gState.kenoSel.push(num);b.classList.add('sel');}
        });
        grid.appendChild(b);
      })(i);
    }
    area.appendChild(grid);

  } else if (t === 'bj') {
    area.innerHTML = '<div style="margin-bottom:8px;"><div style="font-size:11px;color:var(--txt2);margin-bottom:4px;">Dealer</div><div class="cwrap" id="bjd"></div><div id="bjds" style="font-size:12px;color:var(--txt2);">?</div></div>'+
      '<div><div style="font-size:11px;color:var(--txt2);margin-bottom:4px;">You</div><div class="cwrap" id="bjp"></div><div id="bjps" style="font-size:12px;color:var(--txt2);">?</div></div>'+
      '<div style="display:flex;gap:8px;margin-top:8px;"><button class="gpbtn" id="bjhit" style="flex:1;">Hit</button><button class="gpbtn" id="bjstand" style="flex:1;background:#e67e22;">Stand</button></div>';
    setTimeout(function(){$('gpbtn').style.display='none';},50);

  } else if (t === 'hilo') {
    area.innerHTML = '<div style="text-align:center;margin:0.5rem 0;"><div class="cwrap" id="hilop" style="justify-content:center;"></div></div>'+
      '<div class="cgrid2 c2"><div class="cbtn" id="hilohi">Higher ↑</div><div class="cbtn" id="hilolo">Lower ↓</div></div>';
    setTimeout(function(){
      gState.hiloDeck=newDeck();gState.hiloCard=gState.hiloDeck.pop();
      var w=$('hilop');if(w){w.innerHTML='';w.appendChild(makeCard(gState.hiloCard,false));}
      $('hilohi').onclick=function(){gState.choice='hi';$('hilohi').classList.add('sel');$('hilolo').classList.remove('sel');};
      $('hilolo').onclick=function(){gState.choice='lo';$('hilolo').classList.add('sel');$('hilohi').classList.remove('sel');};
    },80);

  } else if (t === 'war') {
    area.innerHTML = '<div style="display:flex;gap:12px;justify-content:center;margin:0.5rem 0;">'+
      '<div style="text-align:center;"><div style="font-size:11px;color:var(--txt2);margin-bottom:4px;">Your Card</div><div class="cwrap" id="warp" style="justify-content:center;min-height:72px;"></div><div id="warps" style="font-size:12px;color:var(--txt2);margin-top:4px;">?</div></div>'+
      '<div style="font-size:14px;color:var(--txt2);padding-top:30px;">VS</div>'+
      '<div style="text-align:center;"><div style="font-size:11px;color:var(--txt2);margin-bottom:4px;">Dealer</div><div class="cwrap" id="warb" style="justify-content:center;min-height:72px;"></div><div id="warbs" style="font-size:12px;color:var(--txt2);margin-top:4px;">?</div></div>'+
      '</div>';

  } else if (t === 'dt') {
    area.innerHTML = '<div style="display:flex;gap:12px;justify-content:center;margin:0.5rem 0;">'+
      '<div style="text-align:center;"><div style="font-size:11px;color:var(--txt2);margin-bottom:4px;">Dragon</div><div class="cwrap" id="dtp" style="justify-content:center;min-height:72px;"></div><div id="dtps" style="font-size:12px;color:var(--txt2);margin-top:4px;">?</div></div>'+
      '<div style="font-size:14px;color:var(--txt2);padding-top:30px;">VS</div>'+
      '<div style="text-align:center;"><div style="font-size:11px;color:var(--txt2);margin-bottom:4px;">Tiger</div><div class="cwrap" id="dtb" style="justify-content:center;min-height:72px;"></div><div id="dtbs" style="font-size:12px;color:var(--txt2);margin-top:4px;">?</div></div>'+
      '</div>'+
      '<div class="cgrid2 c2"><div class="cbtn" id="dtpd">Dragon</div><div class="cbtn" id="dtpt">Tiger</div></div>';
    setTimeout(function(){
      $('dtpd').onclick=function(){$('dtpd').classList.add('sel');$('dtpt').classList.remove('sel');gState.choice='dragon';};
      $('dtpt').onclick=function(){$('dtpt').classList.add('sel');$('dtpd').classList.remove('sel');gState.choice='tiger';};
    },80);

  } else if (t === 'bac') {
    area.innerHTML = '<div style="display:flex;gap:12px;justify-content:center;margin:0.5rem 0;">'+
      '<div style="text-align:center;"><div style="font-size:11px;color:var(--txt2);margin-bottom:4px;">Player</div><div class="cwrap" id="bacp" style="justify-content:center;flex-wrap:wrap;min-height:72px;"></div><div id="bacps" style="font-size:12px;color:var(--txt2);margin-top:4px;">?</div></div>'+
      '<div style="font-size:14px;color:var(--txt2);padding-top:30px;">VS</div>'+
      '<div style="text-align:center;"><div style="font-size:11px;color:var(--txt2);margin-bottom:4px;">Banker</div><div class="cwrap" id="bacb" style="justify-content:center;flex-wrap:wrap;min-height:72px;"></div><div id="bacbs" style="font-size:12px;color:var(--txt2);margin-top:4px;">?</div></div>'+
      '</div>'+
      '<div class="cgrid2 c2"><div class="cbtn" id="bacpp">Player</div><div class="cbtn" id="bacpb">Banker</div></div>';
    setTimeout(function(){
      $('bacpp').onclick=function(){$('bacpp').classList.add('sel');$('bacpb').classList.remove('sel');gState.choice='player';};
      $('bacpb').onclick=function(){$('bacpb').classList.add('sel');$('bacpp').classList.remove('sel');gState.choice='banker';};
    },80);

  } else if (t === 'mines') {
    area.innerHTML = '<div style="text-align:center;color:var(--txt2);font-size:13px;padding:0.5rem;">Press Play to start</div>';
  } else if (t === 'plinko') {
    var cv=document.createElement('canvas');cv.id='plinkocanvas';
    cv.style.cssText='width:100%;height:200px;border-radius:10px;display:block;background:var(--bg2);margin-bottom:0.5rem;';
    area.appendChild(cv);
    var pm=document.createElement('div');pm.id='plinkomult';pm.style.cssText='text-align:center;font-size:18px;font-weight:700;color:var(--accent);';pm.textContent='Drop the ball!';area.appendChild(pm);
  } else if (t === 'tower') {
    area.innerHTML = '<div style="text-align:center;color:var(--txt2);font-size:13px;padding:0.5rem;">Press Play to start</div>';
  } else if (t === 'scratch') {
    area.innerHTML = '<div style="text-align:center;color:var(--txt2);font-size:13px;padding:0.5rem;">Press Play to get a card</div>';
  }
}

function execGame(g, bet, won, btn) {
  var payout = 0;
  var result = '';
  var t = g.type;
  var area = $('gma');

  if (t === 'slots') {
    var syms = SLOT_SYMS[g.syms]||SLOT_SYMS.slots1;
    // Slot multipliers by symbol index (higher index = higher value)
    var slotMults = [2, 3, 5, 8, 15, 25]; // matches 6 syms
    var winSymIdx = won ? Math.floor(Math.random()*syms.length) : -1;
    var winMult = won ? (slotMults[winSymIdx] || 2) : 0;
    var f1=won?syms[winSymIdx]:pick(syms), f2=won?f1:pick(syms), f3=won?f1:(f2===f1?pick(syms.filter(function(s){return s!==f1;}))||pick(syms):f2);
    payout = won ? Math.floor(bet*winMult) : 0;
    // Animate spinning
    var reels=area.querySelectorAll('.slreel'), c=0;
    var iv=setInterval(function(){
      reels.forEach(function(r){r.textContent=pick(syms);});
      if(++c>15){clearInterval(iv);
        if(reels[0])reels[0].textContent=f1;if(reels[1])reels[1].textContent=f2;if(reels[2])reels[2].textContent=f3;
        if(won)reels.forEach(function(r){r.style.color='#27ae60';r.style.borderColor='#27ae60';});
        finishGame(g,bet,won,payout,won?f1+' '+f1+' '+f1+' — '+winMult+'x':'No match',btn);
      }
    },80);
    return;

  } else if (t === 'dice') {
    var nd=g.nd||2;var vals=[];for(var i=0;i<nd;i++)vals.push(rnd(1,6));
    var total=vals.reduce(function(a,v){return a+v;},0);
    // Dice: win pays 2.04x (house edge ~2%)
    payout=won?Math.floor(bet*2.04):0;
    var diefs=area.querySelectorAll('.dief'),c=0;
    var iv=setInterval(function(){
      diefs.forEach(function(d){d.textContent=rnd(1,6);});
      if(++c>15){clearInterval(iv);diefs.forEach(function(d,i){if(vals[i])d.textContent=vals[i];if(won)d.style.background='#27ae60';});
        finishGame(g,bet,won,payout,'Total: '+total,btn);}
    },80);return;

  } else if (t === 'bigsmall') {
    if(!gState.choice){alert('Pick Big or Small!');refundBet(bet);btn.disabled=false;btn.textContent='Play';return;}
    var shouldWin=wc(false);
    var vals=[rnd(1,6),rnd(1,6),rnd(1,6)];
    var total=vals[0]+vals[1]+vals[2];
    var res=total>=11?'big':'small';
    if(shouldWin&&res!==gState.choice){vals[2]=gState.choice==='big'?6:1;total=vals[0]+vals[1]+vals[2];res=total>=11?'big':'small';}
    if(!shouldWin&&res===gState.choice){vals[2]=gState.choice==='big'?1:6;total=vals[0]+vals[1]+vals[2];res=total>=11?'big':'small';}
    var actualWin=res===gState.choice;
    // Stake Big/Small: 1.96x payout
    payout=actualWin?Math.floor(bet*1.96):0;
    var diefs=area.querySelectorAll('.dief'),c=0;
    var iv=setInterval(function(){diefs.forEach(function(d){d.textContent=rnd(1,6);});if(++c>15){clearInterval(iv);diefs.forEach(function(d,i){d.textContent=vals[i];if(actualWin)d.style.background='#27ae60';else d.style.background='var(--accent)';});finishGame(g,bet,actualWin,payout,'Total '+total+' = '+res.toUpperCase()+' ('+gState.choice.toUpperCase()+')',btn);}},80);return;

  } else if (t === 'oddeven') {
    if(!gState.choice){alert('Pick Odd or Even!');refundBet(bet);btn.disabled=false;btn.textContent='Play';return;}
    var shouldWin=wc(false);
    var vals=[rnd(1,6),rnd(1,6),rnd(1,6)];
    var total=vals[0]+vals[1]+vals[2];
    var res=total%2===0?'even':'odd';
    if(shouldWin&&res!==gState.choice){vals[2]=vals[2]%2===0?vals[2]-1:vals[2]+1;if(vals[2]<1)vals[2]=1;if(vals[2]>6)vals[2]=6;total=vals[0]+vals[1]+vals[2];res=total%2===0?'even':'odd';}
    if(!shouldWin&&res===gState.choice){vals[2]=vals[2]%2===0?vals[2]-1:vals[2]+1;if(vals[2]<1)vals[2]=1;if(vals[2]>6)vals[2]=6;total=vals[0]+vals[1]+vals[2];res=total%2===0?'even':'odd';}
    var actualWin=res===gState.choice;
    // Stake Odd/Even: 1.96x
    payout=actualWin?Math.floor(bet*1.96):0;
    var diefs=area.querySelectorAll('.dief'),c=0;
    var iv=setInterval(function(){diefs.forEach(function(d){d.textContent=rnd(1,6);});if(++c>15){clearInterval(iv);diefs.forEach(function(d,i){d.textContent=vals[i];if(actualWin)d.style.background='#27ae60';else d.style.background='var(--accent)';});finishGame(g,bet,actualWin,payout,'Total '+total+' = '+res.toUpperCase()+' ('+gState.choice.toUpperCase()+')',btn);}},80);return;

  } else if (t === 'roulette') {
    if(!gState.choice){alert('Pick a color!');refundBet(bet);btn.disabled=false;btn.textContent='Play';return;}
    var shouldWin=wc(false);
    var clrMap={red:'#e74c3c',black:'#222',green:'#27ae60'};
    var r;
    if(shouldWin){r=gState.choice;}
    else{r=pick(['red','black','green'].filter(function(x){return x!==gState.choice;}));}
    var ball=$('roulball');
    var c=0,iv=setInterval(function(){var rc=['red','black','green'][c%3];if(ball)ball.style.background=clrMap[rc];c++;
      if(c>18){clearInterval(iv);if(ball){ball.style.background=clrMap[r];ball.style.transform='scale(1.2)';setTimeout(function(){ball.style.transform='scale(1)';},200);}
        var actualWin=r===gState.choice;payout=actualWin?Math.floor(bet*(r==='green'?14:2)):0;finishGame(g,bet,actualWin,payout,r.toUpperCase()+(actualWin?' — '+(r==='green'?'14x':'2x'):''),btn);}
    },80);return;

  } else if (t === 'wheel') {
    // Wheel: pick segment, spin pointer to land exactly on it
    var wr2=Math.random();var segIdx;
    // 0=0x,1=1x,2=0x,3=1x,4=0x,5=2x,6=0x,7=1x,8=3x,9=0x,10=5x,11=10x
    if(wr2<0.50)segIdx=0;        // 50%  -> 0x (seg 0)
    else if(wr2<0.80)segIdx=9;   // 30%  -> 0x (seg 9)
    else if(wr2<0.90)segIdx=1;   // 10%  -> 1x (seg 1)
    else if(wr2<0.96)segIdx=5;   // 6%   -> 2x (seg 5)
    else if(wr2<0.98)segIdx=8;   // 2%   -> 3x (seg 8)
    else if(wr2<0.995)segIdx=10; // 1.5% -> 5x (seg 10)
    else segIdx=11;               // 0.5% -> 10x (seg 11)
    var seg=WOF_SEGS[segIdx];
    // Calculate exact rotation so pointer (at 270deg/top) lands on chosen segment center
    // Segment i center = (i+0.5)*30 degrees (SVG clockwise from right)
    // We need: segCenter + rotation = 270 => rotation = 270 - segCenter
    var segCenter=(segIdx+0.5)*(360/WOF_SEGS.length);
    var baseRotation=(270-segCenter+360)%360;
    // Add full spins for visual effect (3-6 spins)
    var fullSpins=(3+Math.floor(Math.random()*4))*360;
    var totalRot=fullSpins+baseRotation;
    // Pay out
    var wheelPay=Math.floor(bet*seg.v);
    if(wheelPay>0){var wwb=bal()+wheelPay;CD.balance=wwb;fbUp('/players/'+CK,{balance:wwb});ub();}
    fbPush('/playerTxns',{playerKey:CK,uid:CD.uid,game:'Money Wheel',bet:bet,win:wheelPay>0,payout:wheelPay,time:new Date().toISOString()});
    // Animate with cubic ease-out so wheel decelerates and stops exactly
    var wg=document.getElementById('wofg');
    var t0w=null,dur=4000;
    function easeW(t){return 1-Math.pow(1-t,4);}
    function animW(ts){
      if(!t0w)t0w=ts;
      var p=Math.min(1,(ts-t0w)/dur);
      var cur=totalRot*easeW(p);
      if(wg)wg.setAttribute('transform','rotate('+cur+' 100 100)');
      if(p<1){requestAnimationFrame(animW);}
      else{
        // Snap to exact final position
        if(wg)wg.setAttribute('transform','rotate('+totalRot+' 100 100)');
        var wrd=$('wheelres');if(wrd)wrd.textContent='Landed: '+seg.l;
        if(seg.v===0){showGRes('gres','grt','grs',false,'0x — No payout this round','Spin again!');}
        else{showGRes('gres','grt','grs',true,seg.l+' — You get '+fmt(wheelPay)+'!',(seg.v===1?'Bet returned!':'Profit: +'+fmt(wheelPay-bet)));}
        btn.disabled=false;btn.textContent='Spin Again';
      }
    }
    requestAnimationFrame(animW);
    return;

  } else if (t === 'coin') {
    if(!gState.choice){alert('Pick a side!');refundBet(bet);btn.disabled=false;btn.textContent='Play';return;}
    var shouldWin=wc(false);
    var res=shouldWin?gState.choice:(gState.choice===g.c1?g.c2:g.c1);
    var coin=$('coinface');
    var c=0,iv=setInterval(function(){if(coin)coin.style.background=c%2===0?'#f6c90e':'#a0aec0';c++;
      if(c>10){clearInterval(iv);if(coin){coin.textContent=res;coin.style.background=res===g.c1?'#f6c90e':'#a0aec0';}
        var actualWin=res===gState.choice;
        // Real coin flip: 1.98x (1% house edge)
        payout=actualWin?Math.floor(bet*1.98):0;
        finishGame(g,bet,actualWin,payout,'Result: '+res+(actualWin?' — 1.98x':''),btn);}
    },100);return;

  } else if (t === 'lucky') {
    if(!gState.choice){alert('Pick a number!');refundBet(bet);btn.disabled=false;btn.textContent='Play';return;}
    var shouldWinL=wc(false);
    var max=g.max||10;
    var drawn;
    if(shouldWinL){drawn=gState.choice;}
    else{drawn=rnd(1,max);while(drawn===gState.choice)drawn=rnd(1,max);}
    var aw2=drawn===gState.choice;
    // 1 of max: payout = max * 0.99 (house edge 1%)
    var luckyMult=Math.floor(max*0.99*100)/100;
    var py2=aw2?Math.floor(bet*luckyMult):0;
    finishGame(g,bet,aw2,py2,'Drawn: '+drawn+(aw2?' — '+luckyMult+'x!':''),btn);

  } else if (t === 'colorpick') {
    if(!gState.choice){alert('Pick a color!');refundBet(bet);btn.disabled=false;btn.textContent='Play';return;}
    var shouldWin=wc(false);
    var clrs=['red','green','violet'],cmap={red:'#e74c3c',green:'#27ae60',violet:'#9b59b6'};
    var r=shouldWin?gState.choice:pick(clrs.filter(function(x){return x!==gState.choice;}));
    payout=r===gState.choice?Math.floor(bet*(r==='violet'?3:2)):0;
    var bl=$('cpickball'),c=0,iv=setInterval(function(){if(bl)bl.style.background=cmap[clrs[c%3]];c++;
      if(c>18){clearInterval(iv);if(bl){bl.style.background=cmap[r];bl.style.transform='scale(1.15)';setTimeout(function(){bl.style.transform='scale(1)';},200);}
        var actualWin=r===gState.choice;finishGame(g,bet,actualWin,actualWin?payout:0,r.toUpperCase(),btn);}
    },80);return;

  } else if (t === 'colorball') {
    if(!gState.choice){alert('Pick a color!');refundBet(bet);btn.disabled=false;btn.textContent='Play';return;}
    var shouldWinCB=wc(false);
    var clrs=['red','blue','yellow'],cmap={red:'#e74c3c',blue:'#3b82f6',yellow:'#f6c90e'};
    var r=shouldWinCB?gState.choice:pick(clrs.filter(function(x){return x!==gState.choice;}));
    // 1 of 3: 2.97x (1% house edge)
    var bl=$('cballball'),c=0,iv=setInterval(function(){if(bl)bl.style.background=cmap[clrs[c%3]];c++;
      if(c>18){clearInterval(iv);if(bl){bl.style.background=cmap[r];bl.style.transform='scale(1.15)';setTimeout(function(){bl.style.transform='scale(1)';},200);}
        var aw=r===gState.choice;var py=aw?Math.floor(bet*2.97):0;finishGame(g,bet,aw,py,r.toUpperCase()+(aw?' — 2.97x':''),btn);}
    },80);return;

  } else if (t === 'keno') {
    var drawn=[];
    while(drawn.length<3){var n2=rnd(1,20);if(drawn.indexOf(n2)<0)drawn.push(n2);}
    var matches=(gState.kenoSel||[]).filter(function(n){return drawn.indexOf(n)>=0;}).length;
    // Real keno payouts: 3 match = 23x, 2 match = 3.8x, 1 match = 0x, 0 = 0x
    var kenoPay=matches===3?23:matches===2?3.8:0;
    var kenoWin=kenoPay>0&&wc(false);
    payout=kenoWin?Math.floor(bet*kenoPay):0;
    finishGame(g,bet,kenoWin,payout,'Drawn: '+drawn.join(', ')+' | Matches: '+matches+(kenoPay>0?' — '+kenoPay+'x':''),btn);

  } else if (t === 'hilo') {
    if(!gState.choice){alert('Pick Higher or Lower!');refundBet(bet);btn.disabled=false;btn.textContent='Play';return;}
    var shouldWin=wc(false);
    var pc2=bjCV(gState.hiloCard?gState.hiloCard.r:'5');
    var next,cv;
    // Rig the next card based on shouldWin
    var allCards=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    var suits=['♠','♥','♦','♣'];
    if(shouldWin){
      var opts=allCards.filter(function(r){var v=bjCV(r);return gState.choice==='hi'?v>pc2:v<pc2;});
      if(opts.length===0)opts=allCards;
      next={r:pick(opts),s:pick(suits)};
    }else{
      var opts=allCards.filter(function(r){var v=bjCV(r);return gState.choice==='hi'?v<=pc2:v>=pc2;});
      if(opts.length===0)opts=allCards;
      next={r:pick(opts),s:pick(suits)};
    }
    cv=bjCV(next.r);
    var actualWin=(gState.choice==='hi'&&cv>pc2)||(gState.choice==='lo'&&cv<pc2);
    payout=actualWin?Math.floor(bet*(g.mult||2)):0;
    var hw=$('hilop');if(hw){hw.innerHTML='';if(gState.hiloCard)hw.appendChild(makeCard(gState.hiloCard,false));hw.appendChild(makeCard(next,false));}
    gState.hiloCard=next;
    // Real HiLo: payout based on probability of chosen direction
    // prob = remaining_cards_in_direction / remaining_cards
    var hiloMult;
    if(gState.choice==='hi'){
      var higherCount=['A','2','3','4','5','6','7','8','9','10','J','Q','K'].filter(function(r){return bjCV(r)>pc2;}).length;
      hiloMult=higherCount>0?Math.round((13/higherCount)*0.99*100)/100:1.98;
    } else {
      var lowerCount=['A','2','3','4','5','6','7','8','9','10','J','Q','K'].filter(function(r){return bjCV(r)<pc2;}).length;
      hiloMult=lowerCount>0?Math.round((13/lowerCount)*0.99*100)/100:1.98;
    }
    hiloMult=Math.min(hiloMult,20); // cap at 20x
    payout=actualWin?Math.floor(bet*hiloMult):0;
    finishGame(g,bet,actualWin,payout,'Previous: '+pc2+' → New: '+next.r+'('+cv+')'+(actualWin?' — '+hiloMult+'x':''),btn);

  } else if (t === 'war') {
    var deck=newDeck();var pc=deck.pop(),dc=deck.pop();
    won=bjCV(pc.r)>bjCV(dc.r)&&wc(false);payout=won?Math.floor(bet*2):0;
    var pw=$('warp'),dw=$('warb');
    if(pw){pw.innerHTML='';pw.appendChild(makeCard(pc,false));}
    if(dw){dw.innerHTML='';dw.appendChild(makeCard(dc,false));}
    // Real card war: win=2x, tie=2.5x
    var warWon=bjCV(pc.r)>bjCV(dc.r)&&wc(false);
    var warTie=bjCV(pc.r)===bjCV(dc.r);
    payout=warWon?Math.floor(bet*2):warTie?Math.floor(bet*2.5):0;
    won=warWon||warTie;
    st('warps',pc.r+' ('+bjCV(pc.r)+')');st('warbs',dc.r+' ('+bjCV(dc.r)+')');
    // Real card war: win=2x, tie=2.5x
    var warWon=bjCV(pc.r)>bjCV(dc.r)&&wc(false);
    var warTie=bjCV(pc.r)===bjCV(dc.r);
    payout=warWon?Math.floor(bet*2):warTie?Math.floor(bet*2.5):0;
    finishGame(g,bet,warWon||warTie,payout,'You: '+pc.r+'('+bjCV(pc.r)+') vs Dealer: '+dc.r+'('+bjCV(dc.r)+')'+(warTie?' TIE 2.5x':warWon?' WIN 2x':''),btn);

  } else if (t === 'dt') {
    if(!gState.choice){alert('Pick Dragon or Tiger!');refundBet(bet);btn.disabled=false;btn.textContent='Play';return;}
    var deck=newDeck();var dc=deck.pop(),tc=deck.pop();
    var dv=bjCV(dc.r)%10,tv=bjCV(tc.r)%10;
    var winner=dv>tv?'dragon':tv>dv?'tiger':'tie';
    won=winner===gState.choice&&wc(false);payout=won?Math.floor(bet*(g.mult||2)):0;
    var dw=$('dtp'),tw=$('dtb');
    if(dw){dw.innerHTML='';dw.appendChild(makeCard(dc,false));}
    if(tw){tw.innerHTML='';tw.appendChild(makeCard(tc,false));}
    st('dtps',dc.r+' ('+dv+')');st('dtbs',tc.r+' ('+tv+')');
    // Real Dragon Tiger: Dragon/Tiger=2x, Tie=11x
    var dtMult=winner==='tie'?11:2;
    var dtWin=winner===gState.choice&&wc(false);
    payout=dtWin?Math.floor(bet*dtMult):0;
    finishGame(g,bet,dtWin,payout,'Dragon:'+dc.r+'('+dv+') Tiger:'+tc.r+'('+tv+') — '+winner.toUpperCase()+(dtWin?' '+dtMult+'x':''),btn);

  } else if (t === 'bac') {
    if(!gState.choice){alert('Pick Player or Banker!');refundBet(bet);btn.disabled=false;btn.textContent='Play';return;}
    var deck=newDeck();var p=[deck.pop(),deck.pop()],b2=[deck.pop(),deck.pop()];
    var ps=(bjCV(p[0].r)%10+bjCV(p[1].r)%10)%10,bs=(bjCV(b2[0].r)%10+bjCV(b2[1].r)%10)%10;
    var winner2=ps>bs?'player':bs>ps?'banker':'tie';
    won=winner2===gState.choice&&wc(false);payout=won?Math.floor(bet*(g.mult||2)):0;
    var pw=$('bacp'),bw=$('bacb');
    if(pw){pw.innerHTML='';p.forEach(function(c){pw.appendChild(makeCard(c,false));});}
    if(bw){bw.innerHTML='';b2.forEach(function(c){bw.appendChild(makeCard(c,false));});}
    st('bacps','P:'+ps);st('bacbs','B:'+bs);
    // Real baccarat: Player=2x, Banker=1.95x, Tie=8x
    var bacMult=winner2==='player'?2:winner2==='banker'?1.95:8;
    var bacWin=(winner2===gState.choice)&&wc(false);
    payout=bacWin?Math.floor(bet*bacMult):0;
    finishGame(g,bet,bacWin,payout,'Player:'+ps+' Banker:'+bs+' — '+winner2.toUpperCase()+(bacWin?' '+bacMult+'x':''),btn);

  } else {
    finishGame(g,bet,won,payout,'',btn);
  }
}

function refundBet(bet) {
  var nb=bal()+bet;CD.balance=nb;fbUp('/players/'+CK,{balance:nb});ub();
}

function finishGame(g,bet,won,payout,result,btn) {
  if(won){var wb=bal()+payout;CD.balance=wb;fbUp('/players/'+CK,{balance:wb});ub();}
  fbPush('/playerTxns',{playerKey:CK,uid:CD.uid,game:g.name||g.id,bet:bet,win:won,payout:won?payout:0,time:new Date().toISOString()});
  showGRes('gres','grt','grs',won,won?'WIN! +'+fmt(payout):'Result: Lost '+fmt(bet),result);
  if(btn){btn.disabled=false;btn.textContent='Play Again';}
  st('gbal',fmt(bal()));
}

// ── CARD HELPERS ──
function newDeck(){var dk=[];BJS.forEach(function(s){BJR.forEach(function(r){dk.push({r:r,s:s});});});for(var i=dk.length-1;i>0;i--){var j=rnd(0,i);var t=dk[i];dk[i]=dk[j];dk[j]=t;}return dk;}
function bjCV(r){return['J','Q','K'].indexOf(r)!==-1?10:r==='A'?11:parseInt(r)||0;}
function bjSc(hand){var s=0,a=0;hand.forEach(function(c){s+=bjCV(c.r);if(c.r==='A')a++;});while(s>21&&a){s-=10;a--;}return s;}
function makeCard(c,hidden){
  var el=document.createElement('div');
  el.style.cssText='width:50px;height:72px;border-radius:7px;display:inline-flex;flex-direction:column;justify-content:space-between;padding:5px 6px;font-weight:700;box-shadow:0 3px 10px rgba(0,0,0,0.12);flex-shrink:0;';
  if(hidden){el.style.background='repeating-linear-gradient(135deg,#1a3a7c 0px,#1a3a7c 4px,#0d2460 4px,#0d2460 8px)';el.style.border='1px solid #2255b8';}
  else{var isR=c.s==='♥'||c.s==='♦';var clr=isR?'#c0392b':'#1a1a2e';el.style.background='#fff';el.style.border='1px solid #d0d0d0';
    var tl=document.createElement('div');tl.style.cssText='font-size:11px;color:'+clr+';line-height:1.2;';tl.innerHTML='<div>'+c.r+'</div><div>'+c.s+'</div>';
    var mid=document.createElement('div');mid.style.cssText='font-size:18px;color:'+clr+';text-align:center;';mid.textContent=c.s;
    var br=document.createElement('div');br.style.cssText='font-size:11px;color:'+clr+';line-height:1.2;text-align:right;transform:rotate(180deg);';br.innerHTML='<div>'+c.r+'</div><div>'+c.s+'</div>';
    el.appendChild(tl);el.appendChild(mid);el.appendChild(br);}
  return el;
}

// ── BLACKJACK ──
var bjState={};
function startBJ(g,bet){
  var nb=bal()-bet;CD.balance=nb;fbUp('/players/'+CK,{balance:nb});ub();
  bjState={deck:newDeck(),player:[],dealer:[],g:g,bet:bet,over:false};
  bjState.player.push(bjState.deck.pop(),bjState.deck.pop());
  bjState.dealer.push(bjState.deck.pop(),bjState.deck.pop());
  renderBJ(true);
  $('bjhit').onclick=function(){if(bjState.over)return;bjState.player.push(bjState.deck.pop());renderBJ(true);if(bjSc(bjState.player)>21)endBJ(false);};
  $('bjstand').onclick=function(){if(bjState.over)return;while(bjSc(bjState.dealer)<17)bjState.dealer.push(bjState.deck.pop());endBJ(null);};
}
function renderBJ(hideD){
  var dw=$('bjd'),pw=$('bjp');if(!dw||!pw)return;
  dw.innerHTML='';pw.innerHTML='';
  bjState.dealer.forEach(function(c,i){dw.appendChild(makeCard(c,hideD&&i===1));});
  bjState.player.forEach(function(c){pw.appendChild(makeCard(c,false));});
  st('bjds',hideD?'?':bjSc(bjState.dealer));st('bjps',bjSc(bjState.player));
}
function endBJ(force){
  bjState.over=true;renderBJ(false);
  var ps=bjSc(bjState.player),ds=bjSc(bjState.dealer);
  var won=force!==null?force:(ps<=21&&(ps>ds||ds>21));
  // Natural blackjack (21 with 2 cards) = 2.5x, normal win = 2x
  var isNatural=bjState.player.length===2&&bjSc(bjState.player)===21;
  var bjMult=isNatural?2.5:2;
  var payout=won?Math.floor(bjState.bet*bjMult):0;
  if(won){var wb=bal()+payout;CD.balance=wb;fbUp('/players/'+CK,{balance:wb});ub();}
  fbPush('/playerTxns',{playerKey:CK,uid:CD.uid,game:'Blackjack',bet:bjState.bet,win:won,payout:won?payout:0,time:new Date().toISOString()});
  showGRes('gres','grt','grs',won,won?'WIN! +'+fmt(payout):'Bust/Lose','You: '+ps+' | Dealer: '+ds);
  $('gpbtn').style.display='block';$('gpbtn').disabled=false;$('gpbtn').textContent='Play Again';
}

// ── WHEEL SVG ──
function buildWheelSVG(){
  var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 200 200');svg.setAttribute('width','180');svg.setAttribute('height','180');
  var g=document.createElementNS('http://www.w3.org/2000/svg','g');g.id='wofg';g.setAttribute('transform','rotate(0 100 100)');svg.appendChild(g);
  var n=WOF_SEGS.length,r=90;
  WOF_SEGS.forEach(function(seg,i){
    var a1=(i/n)*360,a2=((i+1)/n)*360,x1=100+r*Math.cos(a1*Math.PI/180),y1=100+r*Math.sin(a1*Math.PI/180),x2=100+r*Math.cos(a2*Math.PI/180),y2=100+r*Math.sin(a2*Math.PI/180),large=a2-a1>180?1:0;
    var path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d','M100,100 L'+x1+','+y1+' A'+r+','+r+' 0 '+large+',1 '+x2+','+y2+' Z');
    path.setAttribute('fill',seg.c);path.setAttribute('stroke','#fff');path.setAttribute('stroke-width','1.5');g.appendChild(path);
    var am=(a1+a2)/2,tx=100+60*Math.cos(am*Math.PI/180),ty=100+60*Math.sin(am*Math.PI/180);
    var txt=document.createElementNS('http://www.w3.org/2000/svg','text');
    txt.setAttribute('x',tx);txt.setAttribute('y',ty);txt.setAttribute('text-anchor','middle');txt.setAttribute('dominant-baseline','middle');
    txt.setAttribute('fill','#fff');txt.setAttribute('font-size','9');txt.setAttribute('font-weight','bold');txt.textContent=seg.l;g.appendChild(txt);
  });
  var cir=document.createElementNS('http://www.w3.org/2000/svg','circle');cir.setAttribute('cx','100');cir.setAttribute('cy','100');cir.setAttribute('r','14');cir.setAttribute('fill','#fff');svg.appendChild(cir);
  var ptr=document.createElementNS('http://www.w3.org/2000/svg','polygon');ptr.setAttribute('points','100,4 94,18 106,18');ptr.setAttribute('fill','#e74c3c');svg.appendChild(ptr);
  return svg;
}

// ── CRASH ──
var CS={running:false,bet:0,mult:1.00,crashAt:1.5,animId:null,cashedOut:false,theme:{name:'Crash',color:'#4ade80',lc:'#4ade80'}};
function openCrash(g){
  if(CS.animId)cancelAnimationFrame(CS.animId);
  CS={running:false,bet:0,mult:1.00,crashAt:1.5,animId:null,cashedOut:false,theme:g.theme||{name:g.name,color:'#4ade80',lc:'#4ade80'}};
  st('ctitle',g.name||'Crash');
  st('cmult','1.00x');$('cmult').style.color='#4ade80';
  $('cres').style.display='none';$('cres').className='gres';
  $('ccashout').disabled=true;$('cplay').disabled=false;$('cplay').textContent='Play';
  $('cinp').value='';$('cauto').value='';
  buildChips('cchips','cinp');st('cbal',fmt(bal()));
  $('cov').classList.add('open');
  var c=$('ccanvas');c.width=c.offsetWidth||380;c.height=185;
  var ctx=c.getContext('2d');ctx.fillStyle='#0a1020';ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle='#4ade80';ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText('Press Play to start',c.width/2,c.height/2);
}
function startCrash(){
  var bet=parseInt($('cinp').value)||0;
  if(!bet||bet<1){alert('Enter a bet amount.');return;}
  if(bet>bal()){alert('Insufficient balance!');return;}
  var auto=parseFloat($('cauto').value)||0;
  // Deduct bet immediately
  var nb=bal()-bet;CD.balance=nb;fbUp('/players/'+CK,{balance:nb});ub();
  var won=wc(true);
  var crashAt;
  if(won){crashAt=parseFloat((1.50+Math.random()*2.5).toFixed(2));}
  else{
    if(Math.random()<0.75)crashAt=parseFloat((1.01+Math.random()*0.10).toFixed(2));
    else crashAt=parseFloat((1.11+Math.random()*0.38).toFixed(2));
    if(auto>1&&auto<=crashAt){crashAt=parseFloat((auto-0.01).toFixed(2));if(crashAt<1.01)crashAt=1.01;}
  }
  CS.bet=bet;CS.cashedOut=false;CS.running=true;CS.mult=1.00;CS.crashAt=crashAt;
  $('cres').style.display='none';$('cplay').disabled=true;$('cplay').textContent='Running...';
  $('ccashout').disabled=false;$('cmult').style.color='#4ade80';
  var c=$('ccanvas');c.width=c.offsetWidth||380;c.height=185;
  var ctx=c.getContext('2d'),W=c.width,H=c.height,t0=performance.now(),pts=[];
  function frame(ts){
    if(!CS.running)return;
    var el=(ts-t0)/1000;
    CS.mult=parseFloat(Math.max(1.00,Math.pow(1.06,el*6)).toFixed(2));
    if(auto>1&&CS.mult>=auto&&!CS.cashedOut){doCashout();return;}
    if(CS.mult>=CS.crashAt){doCrash(ctx,W,H);return;}
    ctx.fillStyle='#0a1020';ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(74,18,124,0.15)';ctx.lineWidth=1;
    for(var x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(var y=0;y<H;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    var progress=Math.min(0.95,(CS.mult-1)/(Math.max(1.5,CS.crashAt)-1));
    var px=W*0.05+progress*W*0.88,py=H*0.88-progress*H*0.78;
    pts.push({x:px,y:py});
    if(pts.length>1){
      ctx.beginPath();ctx.strokeStyle=CS.theme.lc;ctx.lineWidth=2.5;ctx.shadowColor=CS.theme.color;ctx.shadowBlur=8;
      ctx.moveTo(pts[0].x,pts[0].y);pts.forEach(function(p){ctx.lineTo(p.x,p.y);});ctx.stroke();ctx.shadowBlur=0;
      var g2=ctx.createLinearGradient(0,H*0.05,0,H);g2.addColorStop(0,CS.theme.lc+'44');g2.addColorStop(1,'transparent');
      ctx.beginPath();ctx.fillStyle=g2;ctx.moveTo(pts[0].x,H);pts.forEach(function(p){ctx.lineTo(p.x,p.y);});
      ctx.lineTo(pts[pts.length-1].x,H);ctx.closePath();ctx.fill();
    }
    st('cmult',CS.mult.toFixed(2)+'x');
    CS.animId=requestAnimationFrame(frame);
  }
  CS.animId=requestAnimationFrame(frame);
}
function doCashout(){
  if(!CS.running||CS.cashedOut)return;
  CS.cashedOut=true;CS.running=false;
  if(CS.animId)cancelAnimationFrame(CS.animId);
  $('ccashout').disabled=true;$('cplay').disabled=false;$('cplay').textContent='Play Again';
  var payout=Math.floor(CS.bet*CS.mult);
  var nb=bal()+payout;CD.balance=nb;fbUp('/players/'+CK,{balance:nb});
  fbPush('/playerTxns',{playerKey:CK,uid:CD.uid,game:CS.theme.name,bet:CS.bet,win:true,payout:payout,time:new Date().toISOString()});
  ub();st('cmult',CS.mult.toFixed(2)+'x');$('cmult').style.color='#4ade80';
  showGRes('cres','crt','crs',true,'Cashed out at '+CS.mult.toFixed(2)+'x — Won '+fmt(payout)+'!','Profit: '+fmt(payout-CS.bet));
}
function doCrash(ctx,W,H){
  CS.running=false;if(CS.animId)cancelAnimationFrame(CS.animId);
  $('ccashout').disabled=true;$('cplay').disabled=false;$('cplay').textContent='Play Again';
  ctx.fillStyle='rgba(231,76,60,0.12)';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#e74c3c';ctx.font='bold 22px sans-serif';ctx.textAlign='center';
  ctx.fillText('CRASHED at '+CS.crashAt.toFixed(2)+'x',W/2,H/2);
  st('cmult','CRASHED '+CS.crashAt.toFixed(2)+'x');$('cmult').style.color='#e74c3c';
  if(!CS.cashedOut){
    fbPush('/playerTxns',{playerKey:CK,uid:CD.uid,game:CS.theme.name,bet:CS.bet,win:false,payout:0,time:new Date().toISOString()});
    showGRes('cres','crt','crs',false,'Crashed at '+CS.crashAt.toFixed(2)+'x — Lost '+fmt(CS.bet),'Play again!');
  }
}

// ── MINES ──
// Stake/1xbet-style mines multiplier formula
function calcMinesMult(total, mines, safeRevealed) {
  var mult = 1.0;
  for (var i = 0; i < safeRevealed; i++) {
    var rem = total - i;
    var remSafe = rem - mines;
    if (remSafe <= 0) break;
    mult *= (rem / remSafe) * 0.99;
  }
  return Math.round(mult * 100) / 100;
}

function startMines(g,bet){
  var nb=bal()-bet;CD.balance=nb;fbUp('/players/'+CK,{balance:nb});ub();
  var TOTAL=25,mc=g.mines||3,mines=[];
  while(mines.length<mc){var m=rnd(0,TOTAL-1);if(mines.indexOf(m)<0)mines.push(m);}
  var mState={bet:bet,mines:mines,revealed:[],active:true,safeCount:0};
  var area=$('gma');area.innerHTML='';

  var info=document.createElement('div');
  info.style.cssText='display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--txt2);margin-bottom:6px;';
  info.innerHTML='<span>'+mc+' mines | '+(TOTAL-mc)+' gems</span><span style="font-size:16px;font-weight:800;color:var(--accent);" id="minemult">1.00x</span>';
  area.appendChild(info);

  var potDiv=document.createElement('div');
  potDiv.style.cssText='text-align:center;font-size:12px;color:var(--txt2);margin-bottom:6px;';
  potDiv.id='minepot';potDiv.textContent='Reveal a gem to start';
  area.appendChild(potDiv);

  var co=document.createElement('button');
  co.style.cssText='width:100%;padding:9px;background:rgba(39,174,96,0.1);color:#1a7a4a;border:1px solid rgba(39,174,96,0.3);border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:8px;';
  co.textContent='Cash Out';co.id='mineco';co.disabled=true;
  area.appendChild(co);

  var grid=document.createElement('div');
  grid.className='mines-grid';grid.style.gridTemplateColumns='repeat(5,1fr)';
  area.appendChild(grid);

  for(var i=0;i<TOTAL;i++){
    (function(idx){
      var cell=document.createElement('div');cell.className='mcell';
      cell.style.fontSize='12px';cell.textContent='?';
      cell.addEventListener('click',function(){
        if(!mState.active||mState.revealed.indexOf(idx)>=0)return;
        mState.revealed.push(idx);
        if(mState.mines.indexOf(idx)>=0){
          // Hit mine
          cell.className='mcell boom';
          cell.innerHTML='<div style="font-size:16px;font-weight:900;color:#e74c3c;">X</div>';
          mState.active=false;co.disabled=true;
          grid.querySelectorAll('.mcell').forEach(function(c,i){
            if(mState.mines.indexOf(i)>=0&&mState.revealed.indexOf(i)<0){
              c.className='mcell boom';
              c.innerHTML='<div style="font-size:16px;font-weight:900;color:#e74c3c;">X</div>';
            }
          });
          fbPush('/playerTxns',{playerKey:CK,uid:CD.uid,game:'Mines',bet:bet,win:false,payout:0,time:new Date().toISOString()});
          showGRes('gres','grt','grs',false,'Mine hit! Lost '+fmt(bet),'You revealed '+mState.safeCount+' gems');
          $('gpbtn').disabled=false;$('gpbtn').textContent='Play Again';
        } else {
          // Safe
          mState.safeCount++;
          var mult=calcMinesMult(TOTAL,mc,mState.safeCount);
          var payout=Math.floor(bet*mult);
          cell.className='mcell gem';
          cell.innerHTML='<div style="font-size:14px;font-weight:900;color:#27ae60;">*</div><div style="font-size:9px;color:#27ae60;">'+mult.toFixed(2)+'x</div>';
          st('minemult',mult.toFixed(2)+'x');
          var pot=$('minepot');if(pot)pot.textContent='Cash out for '+fmt(payout);
          co.disabled=false;
          co.textContent='Cash Out  '+mult.toFixed(2)+'x  =  '+fmt(payout);
        }
      });
      grid.appendChild(cell);
    })(i);
  }

  co.addEventListener('click',function(){
    if(!mState.active||mState.safeCount===0)return;
    mState.active=false;co.disabled=true;
    var mult=calcMinesMult(TOTAL,mc,mState.safeCount);
    var p=Math.floor(bet*mult);
    var wb=bal()+p;CD.balance=wb;fbUp('/players/'+CK,{balance:wb});ub();
    fbPush('/playerTxns',{playerKey:CK,uid:CD.uid,game:'Mines',bet:bet,win:true,payout:p,time:new Date().toISOString()});
    showGRes('gres','grt','grs',true,'Cashed out at '+mult.toFixed(2)+'x  —  Won '+fmt(p)+'!',mState.safeCount+' gems revealed');
    $('gpbtn').disabled=false;$('gpbtn').textContent='Play Again';
  });

  $('gpbtn').disabled=false;$('gpbtn').textContent='Play Again';
}

// ── PLINKO ──
function startPlinko(g,bet){
  var nb=bal()-bet;CD.balance=nb;fbUp('/players/'+CK,{balance:nb});ub();
  var canvas=$('plinkocanvas');if(!canvas)return;
  var W=canvas.offsetWidth||320;canvas.width=W;canvas.height=200;
  var ctx=canvas.getContext('2d'),H=200,rows=g.rows||8;
  var pegs=[];for(var r=2;r<=rows;r++)for(var c=0;c<=r;c++)pegs.push({x:W/2+(c-r/2)*(W/(rows+1)),y:20+r*(H-70)/rows});
  var slots=rows+1,slotW=W/slots;
  // Real Stake plinko multipliers by row count
  var stakePlinko8=[5.6,2.1,1.1,1.0,0.5,1.0,1.1,2.1,5.6];  // 8 rows = 9 slots
  var stakePlinko12=[13,3,1.5,0.7,0.4,0.2,0.4,0.7,1.5,3,13]; // 12 rows = 11 slots (approx)
  var baseMults=rows>=10?stakePlinko12:stakePlinko8;
  var mults=[];
  for(var s=0;s<slots;s++){
    // Map slot index to baseMults
    var mIdx=Math.round(s*(baseMults.length-1)/(slots-1));
    mults.push(baseMults[Math.min(mIdx,baseMults.length-1)]);
  }
  var won=wc(false);var forceSlot=won&&Math.random()<0.10?rnd(0,1):-1;
  var bx=W/2+(Math.random()-0.5)*4,by=14,vx=(Math.random()-0.5)*1.5,vy=0,done=false;
  function loop(){
    ctx.fillStyle='#eef2ff';ctx.fillRect(0,0,W,H);
    pegs.forEach(function(p){ctx.fillStyle='#1a3a7c';ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();});
    for(var i=0;i<slots;i++){
      ctx.fillStyle=i===Math.floor(bx/slotW)?'rgba(26,58,124,0.2)':'rgba(26,58,124,0.08)';ctx.fillRect(i*slotW+1,H-34,slotW-2,32);
      ctx.fillStyle=mults[i]>=(g.maxMult||8)?'#f6c90e':mults[i]>=3?'#27ae60':mults[i]>=1?'#1a3a7c':'#e74c3c';
      ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText(mults[i]+'x',i*slotW+slotW/2,H-18);
    }
    ctx.fillStyle='#1a3a7c';ctx.beginPath();ctx.arc(bx,by,4,0,Math.PI*2);ctx.fill();
    if(done)return;
    vy+=0.55;bx+=vx;by+=vy;
    pegs.forEach(function(p){var dx=bx-p.x,dy=by-p.y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<8){var a=Math.atan2(dy,dx);bx=p.x+Math.cos(a)*8;by=p.y+Math.sin(a)*8;var sp=Math.sqrt(vx*vx+vy*vy);vx=Math.cos(a)*sp*0.7+(Math.random()-0.5)*2;vy=Math.abs(Math.sin(a)*sp*0.7);}});
    if(bx<4){bx=4;vx=Math.abs(vx);}if(bx>W-4){bx=W-4;vx=-Math.abs(vx);}
    if(by>=H-34){done=true;var slot=forceSlot>=0?forceSlot:Math.min(slots-1,Math.floor(bx/slotW));bx=slot*slotW+slotW/2;var m=mults[slot];
      // Always give back bet * multiplier - never show "lose"
      var plinkoPay=Math.floor(bet*m);
      if(plinkoPay>0){var pwb=bal()+plinkoPay;CD.balance=pwb;fbUp('/players/'+CK,{balance:pwb});ub();}
      fbPush('/playerTxns',{playerKey:CK,uid:CD.uid,game:'Plinko',bet:bet,win:plinkoPay>0,payout:plinkoPay,time:new Date().toISOString()});
      st('plinkomult',m+'x');
      var plinkoNet=plinkoPay-bet;
      if(m===0){showGRes('gres','grt','grs',false,'0x — No payout this round','Bet: '+fmt(bet)+' | Payout: Rs.0');}
      else{showGRes('gres','grt','grs',m>=1,''+m+'x — Got back '+fmt(plinkoPay),(m>=1?'Profit: +'+fmt(plinkoNet):'Partial: '+fmt(plinkoPay)+' back'));}
      $('gpbtn').disabled=false;$('gpbtn').textContent='Drop Again';return;
    }
    requestAnimationFrame(loop);
  }
  st('plinkomult','Dropping...');$('gpbtn').disabled=true;requestAnimationFrame(loop);
}

// ── TOWER ──
var tState={};
function startTower(g,bet){
  var nb=bal()-bet;CD.balance=nb;fbUp('/players/'+CK,{balance:nb});ub();
  var FLOORS=6,COLS=g.cols||3;
  tState={bet:bet,floor:0,mult:1.0,active:true,traps:[]};
  for(var f=0;f<FLOORS;f++)tState.traps.push(rnd(0,COLS-1));
  var area=$('gma');area.innerHTML='';
  var info=document.createElement('div');info.style.cssText='display:flex;justify-content:space-between;font-size:12px;color:var(--txt2);margin-bottom:6px;';
  info.innerHTML='<span>Pick safe tile each floor</span><span id="towermult">1.00x</span>';area.appendChild(info);
  var co=document.createElement('button');co.style.cssText='width:100%;padding:8px;background:rgba(39,174,96,0.1);color:#1a7a4a;border:1px solid rgba(39,174,96,0.3);border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;margin-bottom:8px;';
  co.textContent='Cash Out';co.id='towerco';co.disabled=true;area.appendChild(co);
  var grid=document.createElement('div');grid.style.cssText='display:flex;flex-direction:column;gap:5px;';area.appendChild(grid);
  function activateFloor(fl){
    grid.querySelectorAll('[data-trow]').forEach(function(r){
      var rf=parseInt(r.dataset.trow);
      r.querySelectorAll('.tcell').forEach(function(c){
        c.style.opacity=rf===fl?'1':'0.35';c.style.cursor=rf===fl?'pointer':'default';c.style.pointerEvents=rf===fl?'auto':'none';
        if(rf===fl)c.style.borderColor='#f6c90e';
      });
    });
  }
  for(var f2=FLOORS-1;f2>=0;f2--){
    (function(floor){
      var row=document.createElement('div');row.style.cssText='display:grid;grid-template-columns:repeat('+COLS+',1fr);gap:5px;';row.dataset.trow=floor;
      for(var c=0;c<COLS;c++){
        (function(col){
          var cell=document.createElement('div');cell.className='tcell';cell.textContent='?';cell.style.opacity='0.35';cell.style.pointerEvents='none';
          cell.addEventListener('click',function(){
            if(!tState.active||tState.floor!==floor)return;
            row.querySelectorAll('.tcell').forEach(function(tc){tc.style.pointerEvents='none';tc.style.opacity='0.5';});
            if(col===tState.traps[floor]){
              cell.textContent='BOMB';cell.style.background='rgba(231,76,60,0.2)';cell.style.borderColor='#e74c3c';cell.style.opacity='1';
              tState.active=false;co.disabled=true;
              fbPush('/playerTxns',{playerKey:CK,uid:CD.uid,game:'Tower',bet:tState.bet,win:false,payout:0,time:new Date().toISOString()});
              showGRes('gres','grt','grs',false,'Trap! Lost '+fmt(tState.bet),'');
              $('gpbtn').disabled=false;$('gpbtn').textContent='Play Again';
            } else {
              cell.textContent='OK';cell.style.background='rgba(39,174,96,0.1)';cell.style.borderColor='#27ae60';cell.style.opacity='1';
              tState.floor++;
              // Stake tower multipliers (3 cols): 1.46, 2.12, 3.09, 4.50, 6.56, 9.56
              var towerMults=[1,1.46,2.12,3.09,4.50,6.56,9.56];
              tState.mult=towerMults[Math.min(tState.floor,towerMults.length-1)];
              st('towermult',tState.mult.toFixed(2)+'x');co.disabled=false;
              co.textContent='Cash Out  '+tState.mult.toFixed(2)+'x  =  '+fmt(Math.floor(tState.bet*tState.mult));
              if(tState.floor<FLOORS)activateFloor(tState.floor);else towerCashout();
            }
          });row.appendChild(cell);
        })(c);
      }
      grid.appendChild(row);
    })(f2);
  }
  activateFloor(0);
  co.addEventListener('click',towerCashout);
  $('gpbtn').disabled=false;$('gpbtn').textContent='Restart';
}
function towerCashout(){
  if(!tState.active)return;tState.active=false;
  var co=$('towerco');if(co)co.disabled=true;
  var p=Math.floor(tState.bet*tState.mult);var wb=bal()+p;CD.balance=wb;fbUp('/players/'+CK,{balance:wb});ub();
  fbPush('/playerTxns',{playerKey:CK,uid:CD.uid,game:'Tower',bet:tState.bet,win:true,payout:p,time:new Date().toISOString()});
  showGRes('gres','grt','grs',true,'Cashed out '+tState.mult+'x — Won '+fmt(p)+'!','');
  $('gpbtn').disabled=false;$('gpbtn').textContent='Play Again';
}

// ── SCRATCH ──
function startScratch(g,bet){
  var nb=bal()-bet;CD.balance=nb;fbUp('/players/'+CK,{balance:nb});ub();
  var won=wc(false);
  var SYMS=['5x','0x','3x','0x','2x','0x'];
  var prizes=[];
  if(won){var ws=pick(['5x','3x','2x']);for(var i=0;i<g.tiles;i++)prizes.push(i<2?ws:'0x');prizes.sort(function(){return Math.random()-0.5;});}
  else{for(var i=0;i<g.tiles;i++)prizes.push(SYMS[i%SYMS.length]);var cnt={};prizes.forEach(function(p){cnt[p]=(cnt[p]||0)+1;});if(cnt['5x']>=2||cnt['3x']>=2||cnt['2x']>=2)prizes[prizes.length-1]='0x';}
  var area=$('gma');area.innerHTML='';
  var info=document.createElement('div');info.style.cssText='font-size:12px;color:var(--txt2);margin-bottom:8px;text-align:center;';info.textContent='Tap each tile to scratch!';area.appendChild(info);
  var grid=document.createElement('div');grid.className='scratch-grid';grid.style.gridTemplateColumns='repeat('+g.tiles+',1fr)';area.appendChild(grid);
  var revealed=0;
  for(var i=0;i<g.tiles;i++){
    (function(idx){
      var tile=document.createElement('div');tile.className='stile';tile.textContent='🎟️';
      tile.addEventListener('click',function(){
        if(tile.classList.contains('rev'))return;
        tile.classList.add('rev');var p=prizes[idx];var isW=p!=='0x';
        tile.textContent=p;tile.classList.add(isW?'wt':'lt');
        revealed++;
        if(revealed>=g.tiles){
          var payout=won?Math.floor(bet*(g.mult||5)):0;
          if(won){var wb=bal()+payout;CD.balance=wb;fbUp('/players/'+CK,{balance:wb});ub();}
          fbPush('/playerTxns',{playerKey:CK,uid:CD.uid,game:g.name||'Scratch',bet:bet,win:won,payout:won?payout:0,time:new Date().toISOString()});
          showGRes('gres','grt','grs',won,won?'WIN! +'+fmt(payout):'Result: Lost '+fmt(bet),won?'Match! '+g.mult+'x':'No match');
          $('gpbtn').disabled=false;$('gpbtn').textContent='New Card';
        }
      });grid.appendChild(tile);
    })(i);
  }
  $('gpbtn').disabled=false;$('gpbtn').textContent='New Card';
}
