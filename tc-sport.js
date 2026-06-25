// tc-sport.js — 1xbet style sports UI

var allSportEvents = [];
var sbState = { event: null, sel: null, odds: 0 };
var activeSportCat = 'All';
var oddsFluctTimer = null;

var SPORT_ICONS = {
  'Football':'⚽','Cricket':'🏏','Basketball':'🏀','Tennis':'🎾',
  'Hockey':'🏑','Rugby':'🏉','Baseball':'⚾','Horse Racing':'🏇',
  'Volleyball':'🏐','Boxing':'🥊','MMA':'🥋','Table Tennis':'🏓',
  'All':'🏆'
};

// ── LOAD HOME ──
function loadHome() {
  fbGet('/sportEvents').then(function(data) {
    allSportEvents = [];
    if (data) {
      allSportEvents = Object.entries(data)
        .filter(function(e) { return e[1].active !== false; })
        .map(function(e) { return Object.assign({ key: e[0] }, e[1]); });
    }
    var hasSport = allSportEvents.length > 0;
    var sl=$('sport-section-label'), sw=$('spscroll'), ss=$('sport-search-wrap'), sc=$('sport-cats-wrap');
    if (hasSport) {
      if(sl)sl.style.display='flex'; if(sw)sw.style.display='flex';
      if(ss)ss.style.display='flex'; if(sc)sc.style.display='flex';
      renderCategoryTabs();
      renderSportCards(allSportEvents);
      startOddsFluctuation();
    } else {
      if(sl)sl.style.display='none'; if(sw)sw.style.display='none';
      if(ss)ss.style.display='none'; if(sc)sc.style.display='none';
      if(oddsFluctTimer)clearInterval(oddsFluctTimer);
    }
  }).catch(function() {
    ['sport-section-label','spscroll','sport-search-wrap','sport-cats-wrap'].forEach(function(id){
      var el=$id; if(el)el.style.display='none';
    });
  });
  loadHotGames();
  renderCasinoGrid();
}

// ── CATEGORY TABS ──
function renderCategoryTabs() {
  var wrap = $('sport-cats');
  if (!wrap) return;
  var cats = ['All'];
  allSportEvents.forEach(function(ev) {
    if (ev.sport && cats.indexOf(ev.sport) < 0) cats.push(ev.sport);
  });
  wrap.innerHTML = cats.map(function(cat) {
    return '<div class="spcat' + (cat===activeSportCat?' active':'') + '" data-cat="' + cat + '">' +
      (SPORT_ICONS[cat]||'🏆') + ' ' + cat + '</div>';
  }).join('');
  wrap.querySelectorAll('.spcat').forEach(function(btn) {
    btn.addEventListener('click', function() {
      activeSportCat = btn.dataset.cat;
      wrap.querySelectorAll('.spcat').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');
      var filtered = activeSportCat==='All' ? allSportEvents :
        allSportEvents.filter(function(ev){return ev.sport===activeSportCat;});
      renderSportCards(filtered);
    });
  });
}

// ── RENDER SPORT CARDS - 1xbet style ──
function renderSportCards(events) {
  var wrap = $('spscroll');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (!events || !events.length) {
    wrap.innerHTML = '<div style="color:var(--txt2);padding:1rem;font-size:13px;text-align:center;">No events available</div>';
    return;
  }
  // Horizontal scroll container for mobile
  var hscroll = document.createElement('div');
  hscroll.style.cssText = 'display:flex;gap:10px;overflow-x:auto;padding:0 1rem 8px;-webkit-overflow-scrolling:touch;scrollbar-width:none;';
  hscroll.style.setProperty('scrollbar-width','none');
  events.forEach(function(ev) {
    var card = buildSportCard(ev);
    card.style.minWidth = '280px';
    card.style.maxWidth = '280px';
    card.style.flexShrink = '0';
    hscroll.appendChild(card);
  });
  wrap.appendChild(hscroll);
}

function buildSportCard(ev) {
  var odds = ev.odds || { h: 1.85, d: 3.20, a: 4.10 };
  var is2way = ev.type === '2way';
  var isLive = ev.live === true;
  var icon = SPORT_ICONS[ev.sport] || '🏆';

  var card = document.createElement('div');
  card.className = 'spcard';
  card.dataset.evkey = ev.key;

  // ── TOP ROW: League + Live badge ──
  var top = document.createElement('div');
  top.className = 'sptop';
  top.innerHTML =
    '<div class="sptop-left">' +
      '<span class="spico">' + icon + '</span>' +
      '<span class="splea">' + (ev.league || ev.sport || 'Match') + '</span>' +
    '</div>' +
    '<div class="sptop-right">' +
      (isLive ? '<span class="splive">LIVE</span>' : '<span class="sptime">Upcoming</span>') +
    '</div>';
  card.appendChild(top);

  // ── TEAMS ──
  var teams = document.createElement('div');
  teams.className = 'spteams';
  if (is2way) {
    teams.innerHTML =
      '<div class="spteam-row"><span class="spteam-name">' + (ev.team1||'Home') + '</span>' +
        (isLive?'<span class="spteam-score" id="sc1_'+ev.key+'">0</span>':'') + '</div>' +
      '<div style="font-size:10px;color:var(--txt2);margin:2px 0;padding-left:2px;">vs</div>' +
      '<div class="spteam-row"><span class="spteam-name">' + (ev.team2||'Away') + '</span>' +
        (isLive?'<span class="spteam-score" id="sc2_'+ev.key+'">0</span>':'') + '</div>';
  } else {
    teams.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;">' +
        '<span class="spteam-name">' + (ev.team1||'Home') + '</span>' +
        (isLive?'<span style="font-size:13px;font-weight:900;color:var(--accent);" id="sc1_'+ev.key+'">0 - 0</span>':'') +
        '<span class="spteam-name" style="text-align:right;">' + (ev.team2||'Away') + '</span>' +
      '</div>';
  }
  card.appendChild(teams);

  // ── MARKET TABS ──
  var markets = [
    { label: '1X2', key: 'main' },
    { label: 'O/U', key: 'ou' },
    { label: 'BTTS', key: 'btts' },
  ];
  if (is2way) markets = [{ label: 'WIN', key: 'main' }];

  var mktTabsWrap = document.createElement('div');
  mktTabsWrap.className = 'spmkts';
  markets.forEach(function(mkt, mi) {
    var t = document.createElement('div');
    t.className = 'spmkt-tab' + (mi===0?' active':'');
    t.textContent = mkt.label;
    t.addEventListener('click', function() {
      mktTabsWrap.querySelectorAll('.spmkt-tab').forEach(function(b){b.classList.remove('active');});
      t.classList.add('active');
      renderOddsRow(oddsWrap, ev, mkt.key);
    });
    mktTabsWrap.appendChild(t);
  });
  card.appendChild(mktTabsWrap);

  // ── ODDS ROW ──
  var oddsWrap = document.createElement('div');
  oddsWrap.className = 'spodds';
  oddsWrap.dataset.evkey = ev.key;
  renderOddsRow(oddsWrap, ev, 'main');
  card.appendChild(oddsWrap);

  // ── MORE MARKETS ──
  var more = document.createElement('div');
  more.className = 'spmore';
  more.innerHTML = '+' + (is2way ? 8 : 15) + ' more markets ›';
  more.addEventListener('click', function(e) {
    e.stopPropagation();
    openSportBet(ev, '1', parseFloat(odds.h));
  });
  card.appendChild(more);

  return card;
}

function renderOddsRow(wrap, ev, market) {
  wrap.innerHTML = '';
  var odds = ev.odds || { h: 1.85, d: 3.20, a: 4.10 };
  var is2way = ev.type === '2way';
  var btns = [];

  if (market === 'main') {
    if (is2way) {
      btns = [
        { sel:'1', n: shortName(ev.team1,'Team 1'), v: odds.h||1.75 },
        { sel:'2', n: shortName(ev.team2,'Team 2'), v: odds.a||2.05 }
      ];
    } else {
      btns = [
        { sel:'1', n: shortName(ev.team1,'Team 1'), v: odds.h||1.85 },
        { sel:'X', n:'Draw', v: odds.d||3.20 },
        { sel:'2', n: shortName(ev.team2,'Team 2'), v: odds.a||4.10 }
      ];
    }
  } else if (market === 'ou') {
    btns = [
      { sel:'ov25', n:'Over 2.5', v: roundOdds(1.80+Math.random()*0.2) },
      { sel:'un25', n:'Under 2.5', v: roundOdds(1.90+Math.random()*0.2) }
    ];
  } else if (market === 'btts') {
    btns = [
      { sel:'bttsY', n:'Yes', v: roundOdds(1.70+Math.random()*0.3) },
      { sel:'bttsN', n:'No', v: roundOdds(1.90+Math.random()*0.2) }
    ];
  }

  btns.forEach(function(b) {
    var btn = document.createElement('div');
    btn.className = 'spod';
    btn.dataset.sel = b.sel;
    btn.dataset.odds = b.v;
    btn.dataset.evkey = ev.key;
    btn.innerHTML = '<div class="spod-n">' + b.n + '</div><div class="spod-v">' + Number(b.v).toFixed(2) + '</div>';
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      // Deselect others in same card
      var card = btn.closest('.spcard');
      if(card) card.querySelectorAll('.spod').forEach(function(o){o.classList.remove('sel');});
      btn.classList.add('sel');
      openSportBet(ev, b.sel, parseFloat(b.v));
    });
    wrap.appendChild(btn);
  });
}

function shortName(name, fallback) {
  if (!name) return fallback;
  var parts = name.split(' ');
  return parts.length > 1 ? parts[0] : name;
}
function roundOdds(v) { return Math.round(v * 100) / 100; }

// ── ODDS FLUCTUATION - green when up, red when down, shows for 5 seconds ──
function startOddsFluctuation() {
  if (oddsFluctTimer) clearInterval(oddsFluctTimer);
  oddsFluctTimer = setInterval(function() {
    document.querySelectorAll('.spod').forEach(function(btn) {
      if (Math.random() < 0.20) { // 20% chance each tick
        var currentOdds = parseFloat(btn.dataset.odds) || 1.5;
        var change = (Math.random() - 0.48) * 0.08; // slight bias toward increase
        var newOdds = Math.max(1.01, Math.round((currentOdds + change) * 100) / 100);
        if (newOdds === currentOdds) return; // no change, skip
        var isUp = newOdds > currentOdds;
        btn.dataset.odds = newOdds;
        var vEl = btn.querySelector('.spod-v');
        if (vEl) {
          vEl.textContent = newOdds.toFixed(2);
          // Remove old classes first
          btn.classList.remove('odds-up','odds-down');
          void btn.offsetWidth; // force reflow to restart animation
          // Add color class - green for up, red for down
          btn.classList.add(isUp ? 'odds-up' : 'odds-down');
          // Remove after exactly 5 seconds
          setTimeout(function() {
            btn.classList.remove('odds-up','odds-down');
          }, 5000);
        }
      }
    });
  }, 3000); // check every 3 seconds
}

// ── SEARCH ──
function doSportSearch() {
  var q = ($('ssinp')?$('ssinp').value:'').trim().toLowerCase();
  if (!q) { renderSportCards(allSportEvents); return; }
  var filtered = allSportEvents.filter(function(ev) {
    return (ev.team1||'').toLowerCase().indexOf(q)>=0 ||
           (ev.team2||'').toLowerCase().indexOf(q)>=0 ||
           (ev.league||'').toLowerCase().indexOf(q)>=0 ||
           (ev.sport||'').toLowerCase().indexOf(q)>=0;
  });
  renderSportCards(filtered, 'No results for "'+q+'"');
}

document.addEventListener('DOMContentLoaded', function() {
  var sb=$('ssbtn'); if(sb)sb.onclick=doSportSearch;
  var si=$('ssinp'); if(si)si.onkeydown=function(e){if(e.key==='Enter')doSportSearch();};
});

// ── OPEN BET MODAL ──
function openSportBet(ev, sel, odds) {
  if (!CD) { alert('Please login first.'); return; }
  sbState = { event: ev, sel: sel, odds: odds };
  var o = ev.odds || {};
  var is2way = ev.type === '2way';

  st('sbet-ttl', ev.team1 + ' vs ' + ev.team2);
  st('sf1', SPORT_ICONS[ev.sport]||'🏆');
  st('sf2', SPORT_ICONS[ev.sport]||'🏆');
  st('st1', ev.team1||'Home');
  st('st2', ev.team2||'Away');

  var mwrap = $('bmkts'); mwrap.innerHTML = '';
  var markets = is2way ?
    [{sel:'1',name:ev.team1||'Team 1',odds:o.h||1.75},{sel:'2',name:ev.team2||'Team 2',odds:o.a||2.05}] :
    [{sel:'1',name:ev.team1||'Team 1',odds:o.h||1.85},{sel:'X',name:'Draw',odds:o.d||3.20},{sel:'2',name:ev.team2||'Team 2',odds:o.a||3.50}];

  markets.forEach(function(m) {
    var d = document.createElement('div');
    d.className = 'bmkt' + (m.sel===sel?' sel':'');
    d.innerHTML = '<div class="bmn">' + m.name + '</div><div class="bmo">' + Number(m.odds).toFixed(2) + '</div>';
    d.addEventListener('click', function() {
      sbState.sel = m.sel; sbState.odds = m.odds;
      mwrap.querySelectorAll('.bmkt').forEach(function(b){b.classList.remove('sel');});
      d.classList.add('sel');
      updateBsum();
    });
    mwrap.appendChild(d);
  });

  $('sbamt').value = ''; hd('sberr'); updateBsum();
  st('sbbal', fmt(bal()));
  om('ov-sbet');
}

function updateBsum() {
  var amt = parseFloat($('sbamt')?$('sbamt').value:0)||0;
  var ev = sbState.event;
  var selName = sbState.sel==='1'?(ev&&ev.team1||'Team 1'):sbState.sel==='2'?(ev&&ev.team2||'Team 2'):'Draw';
  st('bsell', selName);
  st('boddsl', Number(sbState.odds||0).toFixed(2)+'x');
  st('bwinl', amt>0?fmt(Math.floor(amt*(sbState.odds||0))):'—');
}

// ── PLACE BET ──
function placeSportBet() {
  var amt = parseInt($('sbamt').value)||0;
  hd('sberr');
  if (!sbState.sel) { sh('sberr','Select a market first.'); return; }
  if (amt < 10) { sh('sberr','Minimum bet is Rs. 10.'); return; }
  if (amt > bal()) { sh('sberr','Insufficient balance: '+fmt(bal())); return; }
  var btn=$('sbplace'); btn.textContent='Placing...'; btn.disabled=true;

  // Deduct immediately
  var nb=bal()-amt; CD.balance=nb; fbUp('/players/'+CK,{balance:nb}); ub();

  var ev=sbState.event;
  var selName=sbState.sel==='1'?(ev.team1||'Team 1'):sbState.sel==='2'?(ev.team2||'Team 2'):'Draw';
  var potentialPayout=Math.floor(amt*sbState.odds);

  fbPush('/sportBets',{
    playerKey:CK, playerUid:CD.uid, playerName:CD.username,
    eventKey:ev.key||'', event:ev.team1+' vs '+ev.team2,
    league:ev.league, sport:ev.sport,
    selection:selName, selCode:sbState.sel,
    odds:sbState.odds, bet:amt,
    potentialPayout:potentialPayout,
    status:'pending', settled:false,
    time:new Date().toISOString()
  }).then(function(){
    cm('ov-sbet');
    btn.textContent='Place Bet'; btn.disabled=false;
    alert('Bet placed! Rs.'+amt.toLocaleString('en-NP')+' on '+selName+'.\nPotential win: '+fmt(potentialPayout)+'\n\nResult announced after match.');
    pushNotif('Bet placed: '+selName+' @ '+Number(sbState.odds).toFixed(2)+'x | Bet: Rs.'+amt.toLocaleString('en-NP')+' | Potential win: '+fmt(potentialPayout),'withdrawal');
  }).catch(function(e){
    var wb=bal()+amt; CD.balance=wb; fbUp('/players/'+CK,{balance:wb}); ub();
    sh('sberr','Error: '+e.message); btn.textContent='Place Bet'; btn.disabled=false;
  });
}

// ── HISTORY ──
function loadHistory(type) {
  var wrap=$('hlist');
  wrap.innerHTML='<div style="text-align:center;color:var(--txt2);padding:2rem;">Loading...</div>';
  if(type==='sport'){
    fbGet('/sportBets').then(function(data){
      if(!data){wrap.innerHTML='<div style="text-align:center;color:var(--txt2);padding:2rem;">No sport bets yet.</div>';return;}
      var bets=Object.entries(data)
        .filter(function(e){return e[1].playerKey===CK;})
        .sort(function(a,b){return new Date(b[1].time)-new Date(a[1].time);});
      if(!bets.length){wrap.innerHTML='<div style="text-align:center;color:var(--txt2);padding:2rem;">No sport bets yet.</div>';return;}
      wrap.innerHTML=bets.map(function(e){
        var b=e[1], status=b.status||'pending';
        var statusClr,statusLabel,amtDisplay;
        if(status==='won'){
          var paid=b.finalPayout||b.potentialPayout||Math.floor((b.bet||0)*(b.odds||1));
          statusClr='win';statusLabel='PAID';amtDisplay='+'+fmt(paid);
        } else if(status==='lost'){
          statusClr='loss';statusLabel='RESULT: LOST';amtDisplay=fmt(b.bet)+' (bet held)';
        } else {
          statusClr='pending';statusLabel='IN PROGRESS';amtDisplay=fmt(b.bet)+' (bet placed)';
        }
        return '<div class="hitem">'+
          '<div style="flex:1;">'+
            '<div class="hn">'+b.event+'</div>'+
            '<div class="hd">'+b.selection+' @ '+Number(b.odds).toFixed(2)+'x</div>'+
            '<div class="hd">'+new Date(b.time).toLocaleDateString()+(b.settledAt?' · Settled: '+new Date(b.settledAt).toLocaleDateString():'')+
            '</div>'+
          '</div>'+
          '<div style="text-align:right;flex-shrink:0;">'+
            '<div class="ha '+statusClr+'">'+amtDisplay+'</div>'+
            '<div class="has '+statusClr+'">'+statusLabel+'</div>'+
            (status==='won'?'<div style="font-size:10px;color:var(--txt2);margin-top:2px;">Bet: '+fmt(b.bet)+'</div>':
             status==='pending'?'<div style="font-size:10px;color:var(--txt2);margin-top:2px;">Awaiting result</div>':'')+
          '</div></div>';
      }).join('');
    }).catch(function(){wrap.innerHTML='<div style="color:var(--red);padding:1rem;">Error loading.</div>';});
  } else {
    fbGet('/playerTxns').then(function(data){
      if(!data){wrap.innerHTML='<div style="text-align:center;color:var(--txt2);padding:2rem;">No casino bets yet.</div>';return;}
      var bets=Object.values(data).filter(function(b){return b.playerKey===CK;})
        .sort(function(a,b){return new Date(b.time)-new Date(a.time);}).slice(0,80);
      if(!bets.length){wrap.innerHTML='<div style="text-align:center;color:var(--txt2);padding:2rem;">No casino bets yet.</div>';return;}
      wrap.innerHTML=bets.map(function(b){
        var won=b.win;
        return '<div class="hitem">'+
          '<div><div class="hn">'+b.game+'</div><div class="hd">'+new Date(b.time).toLocaleString()+'</div></div>'+
          '<div style="text-align:right;">'+
            '<div class="ha '+(won?'win':'loss')+'">'+(won?'+'+fmt(b.payout):'-'+fmt(b.bet))+'</div>'+
            '<div class="has '+(won?'win':'loss')+'">'+(won?'WON':'LOST')+'</div>'+
          '</div></div>';
      }).join('');
    }).catch(function(){wrap.innerHTML='<div style="color:var(--red);padding:1rem;">Error loading.</div>';});
  }
}

window.loadHome = loadHome;
window.loadHistory = loadHistory;
window.openSportBet = openSportBet;
window.placeSportBet = placeSportBet;
window.updateBsum = updateBsum;
window.doSportSearch = doSportSearch;
