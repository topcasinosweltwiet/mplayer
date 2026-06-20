// tc-sport.js — Sports betting and home page loader
'use strict';

var allSportEvents = [];
var sbState = { event: null, sel: null, odds: 0 };

function getSportIcon(s) {
  return {'Football':'⚽','Cricket':'🏏','Basketball':'🏀','Tennis':'🎾','Hockey':'🏑','Rugby':'🏉','Baseball':'⚾','Horse Racing':'🏇'}[s] || '🏆';
}

var BG_GRADIENTS = [
  'linear-gradient(135deg,#1a3a7c,#e74c3c)',
  'linear-gradient(135deg,#0d2460,#27ae60)',
  'linear-gradient(135deg,#7c1a3a,#e67e22)',
  'linear-gradient(135deg,#1a5c3a,#1a3a7c)',
  'linear-gradient(135deg,#2d0a4a,#e74c3c)',
  'linear-gradient(135deg,#0a3a2a,#2255b8)',
];

// ── LOAD HOME ──
function loadHome() {
  // Load sport events from Firebase
  fbGet('/sportEvents').then(function(data) {
    allSportEvents = [];
    if (data) {
      allSportEvents = Object.entries(data)
        .filter(function(e) { return e[1].active !== false; })
        .map(function(e) { return Object.assign({ key: e[0] }, e[1]); });
    }
    // Show sport section only if admin has added events
    var sportLabel = $('sport-section-label');
    var sportWrap = $('spscroll');
    var sportSearch = $('sport-search-wrap');
    if (allSportEvents.length > 0) {
      if (sportLabel) sportLabel.style.display = 'flex';
      if (sportWrap) sportWrap.style.display = 'flex';
      if (sportSearch) sportSearch.style.display = 'flex';
      renderSportScroll(allSportEvents);
    } else {
      if (sportLabel) sportLabel.style.display = 'none';
      if (sportWrap) sportWrap.style.display = 'none';
      if (sportSearch) sportSearch.style.display = 'none';
    }
  }).catch(function() {
    var sl=$('sport-section-label'),sw=$('spscroll'),ss=$('sport-search-wrap');
    if(sl)sl.style.display='none';if(sw)sw.style.display='none';if(ss)ss.style.display='none';
  });

  loadHotGames();
  renderCasinoGrid();
}

// ── RENDER SPORT CARDS ──
function renderSportScroll(events, emptyMsg) {
  var wrap = $('spscroll');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (!events || !events.length) {
    wrap.innerHTML = '<div style="color:var(--txt2);padding:1rem;font-size:13px;">' + (emptyMsg || 'No events.') + '</div>';
    return;
  }
  events.forEach(function(ev, idx) {
    var card = document.createElement('div');
    card.className = 'spcard';
    var bg = BG_GRADIENTS[idx % BG_GRADIENTS.length];
    var odds = ev.odds || { h: 1.85, d: 3.20, a: 4.10 };
    var is2way = ev.type === '2way';

    var oddsHtml = is2way ?
      mkOdd('1', (ev.team1||'').split(' ')[0], odds.h) +
      mkOdd('2', (ev.team2||'').split(' ')[0], odds.a) :
      mkOdd('1', 'Home', odds.h) +
      mkOdd('X', 'Draw', odds.d || 3.2) +
      mkOdd('2', 'Away', odds.a);

    card.innerHTML =
      '<div class="spbanner" style="background:' + bg + ';">' +
        '<div class="spbanner-team"><div class="spbanner-team-ico">' + getSportIcon(ev.sport) + '</div><div class="spbanner-team-name">' + (ev.team1||'').split(' ')[0] + '</div></div>' +
        '<div class="spbanner-vs">' + (ev.live ? 'LIVE' : 'VS') + '</div>' +
        '<div class="spbanner-team"><div class="spbanner-team-ico">' + getSportIcon(ev.sport) + '</div><div class="spbanner-team-name">' + (ev.team2||'').split(' ')[0] + '</div></div>' +
      '</div>' +
      '<div class="spbody">' +
        (ev.live ? '<div class="splive">LIVE</div>' : '') +
        '<div class="splea">' + (ev.league || '') + '</div>' +
        '<div class="spmatch">' + (ev.team1||'') + ' vs ' + (ev.team2||'') + '</div>' +
        '<div class="spodds">' + oddsHtml + '</div>' +
      '</div>';

    // Wire odds buttons
    card.querySelectorAll('.spod').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        openSportBet(ev, btn.dataset.sel, parseFloat(btn.dataset.odds));
      });
    });
    card.addEventListener('click', function() { openSportBet(ev, '1', parseFloat(odds.h)); });
    wrap.appendChild(card);
  });
}

function mkOdd(sel, name, val) {
  return '<div class="spod" data-sel="' + sel + '" data-odds="' + val + '">' +
    '<div class="spod-n">' + name + '</div>' +
    '<div class="spod-v">' + Number(val).toFixed(2) + '</div>' +
    '</div>';
}

// ── SPORT SEARCH ──
function doSportSearch() {
  var q = ($('ssinp') ? $('ssinp').value : '').trim().toLowerCase();
  if (!q) { renderSportScroll(allSportEvents); return; }
  var filtered = allSportEvents.filter(function(ev) {
    return (ev.team1||'').toLowerCase().indexOf(q) >= 0 ||
           (ev.team2||'').toLowerCase().indexOf(q) >= 0 ||
           (ev.league||'').toLowerCase().indexOf(q) >= 0 ||
           (ev.sport||'').toLowerCase().indexOf(q) >= 0;
  });
  renderSportScroll(filtered, 'No results for "' + q + '"');
}

// Wire search button (called after DOM ready)
document.addEventListener('DOMContentLoaded', function() {
  var sb = $('ssbtn'); if(sb) sb.onclick = doSportSearch;
  var si = $('ssinp'); if(si) si.onkeydown = function(e){if(e.key==='Enter')doSportSearch();};
});

// ── OPEN SPORT BET ──
function openSportBet(ev, sel, odds) {
  if (!CD) { alert('Please login first.'); return; }
  sbState = { event: ev, sel: sel, odds: odds };
  st('sbet-ttl', ev.team1 + ' vs ' + ev.team2);
  st('sf1', getSportIcon(ev.sport)); st('sf2', getSportIcon(ev.sport));
  st('st1', ev.team1 || 'Team A'); st('st2', ev.team2 || 'Team B');

  var mwrap = $('bmkts'); mwrap.innerHTML = '';
  var o = ev.odds || {};
  var markets = ev.type === '2way' ?
    [{sel:'1', name: ev.team1, odds: o.h||1.75}, {sel:'2', name: ev.team2, odds: o.a||2.00}] :
    [{sel:'1', name:'Home Win', odds: o.h||1.85}, {sel:'X', name:'Draw', odds: o.d||3.20}, {sel:'2', name:'Away Win', odds: o.a||3.50}];

  markets.forEach(function(m) {
    var d = document.createElement('div');
    d.className = 'bmkt' + (m.sel === sel ? ' sel' : '');
    d.innerHTML = '<div class="bmn">' + m.name + '</div><div class="bmo">' + Number(m.odds).toFixed(2) + '</div>';
    d.addEventListener('click', function() {
      sbState.sel = m.sel; sbState.odds = m.odds;
      mwrap.querySelectorAll('.bmkt').forEach(function(b){b.classList.remove('sel');});
      d.classList.add('sel'); updateBsum();
    });
    mwrap.appendChild(d);
  });

  $('sbamt').value = ''; hd('sberr');
  updateBsum();
  st('sbbal', fmt(bal()));
  om('ov-sbet');
}

function updateBsum() {
  var amt = parseFloat($('sbamt') ? $('sbamt').value : 0) || 0;
  var ev = sbState.event;
  var selName = sbState.sel==='1' ? (ev&&ev.team1||'Home') : sbState.sel==='2' ? (ev&&ev.team2||'Away') : 'Draw';
  st('bsell', selName);
  st('boddsl', Number(sbState.odds||0).toFixed(2) + 'x');
  st('bwinl', amt > 0 ? fmt(Math.floor(amt * (sbState.odds||0))) : '—');
}

// ── PLACE SPORT BET ──
function placeSportBet() {
  var amt = parseInt($('sbamt').value) || 0;
  hd('sberr');
  if (!sbState.sel) { sh('sberr', 'Select a market first.'); return; }
  if (amt < 10) { sh('sberr', 'Minimum bet is Rs. 10.'); return; }
  if (amt > bal()) { sh('sberr', 'Insufficient balance: ' + fmt(bal())); return; }

  var btn = $('sbplace'); btn.textContent = 'Placing...'; btn.disabled = true;

  // Deduct bet immediately
  var nb = bal() - amt;
  CD.balance = nb; fbUp('/players/' + CK, {balance: nb}); ub();

  var ev = sbState.event;
  var selName = sbState.sel==='1'?(ev.team1||'Home'):sbState.sel==='2'?(ev.team2||'Away'):'Draw';
  var potentialPayout = Math.floor(amt * sbState.odds);

  fbPush('/sportBets', {
    playerKey: CK, playerUid: CD.uid, playerName: CD.username,
    eventKey: ev.key || '', event: ev.team1 + ' vs ' + ev.team2,
    league: ev.league, sport: ev.sport,
    selection: selName, selCode: sbState.sel,
    odds: sbState.odds, bet: amt,
    potentialPayout: potentialPayout,
    status: 'pending', settled: false,
    time: new Date().toISOString()
  }).then(function() {
    cm('ov-sbet');
    btn.textContent = 'Place Bet'; btn.disabled = false;
    alert('Bet placed! Rs.' + amt.toLocaleString('en-NP') + ' on ' + selName + '.\nPotential win: ' + fmt(potentialPayout) + '\n\nResult will be announced after the match.');
    pushNotif('Bet placed: ' + selName + ' @ ' + Number(sbState.odds).toFixed(2) + 'x | Bet: Rs.' + amt.toLocaleString('en-NP') + ' | Potential win: ' + fmt(potentialPayout), 'withdrawal');
  }).catch(function(e) {
    // Refund on error
    var wb = bal() + amt; CD.balance = wb; fbUp('/players/' + CK, {balance: wb}); ub();
    sh('sberr', 'Error: ' + e.message); btn.textContent = 'Place Bet'; btn.disabled = false;
  });
}

// ── HISTORY ──
function loadHistory(type) {
  var wrap = $('hlist');
  wrap.innerHTML = '<div style="text-align:center;color:var(--txt2);padding:2rem;">Loading...</div>';
  if (type === 'sport') {
    fbGet('/sportBets').then(function(data) {
      if (!data) { wrap.innerHTML = '<div style="text-align:center;color:var(--txt2);padding:2rem;">No sport bets yet.</div>'; return; }
      var bets = Object.entries(data)
        .filter(function(e) { return e[1].playerKey === CK; })
        .sort(function(a, b) { return new Date(b[1].time) - new Date(a[1].time); });
      if (!bets.length) { wrap.innerHTML = '<div style="text-align:center;color:var(--txt2);padding:2rem;">No sport bets yet.</div>'; return; }
      wrap.innerHTML = bets.map(function(e) {
        var b = e[1];
        var status = b.status || 'pending';
        var statusClr, statusLabel, amtDisplay;
        if (status === 'won') {
          var paid = b.finalPayout || b.potentialPayout || Math.floor((b.bet||0)*(b.odds||1));
          statusClr='win'; statusLabel='PAID'; amtDisplay='+'+fmt(paid);
        } else if (status === 'lost') {
          statusClr='loss'; statusLabel='RESULT: LOST'; amtDisplay=fmt(b.bet)+' (bet held)';
        } else {
          statusClr='pending'; statusLabel='IN PROGRESS'; amtDisplay=fmt(b.bet)+' (bet placed)';
        }
        return '<div class="hitem">' +
          '<div style="flex:1;">' +
            '<div class="hn">' + b.event + '</div>' +
            '<div class="hd">' + b.selection + ' @ ' + Number(b.odds).toFixed(2) + 'x</div>' +
            '<div class="hd">' + new Date(b.time).toLocaleDateString() + (b.settledAt?' · Settled: '+new Date(b.settledAt).toLocaleDateString():'') + '</div>' +
          '</div>' +
          '<div style="text-align:right;flex-shrink:0;">' +
            '<div class="ha ' + statusClr + '">' + amtDisplay + '</div>' +
            '<div class="has ' + statusClr + '">' + statusLabel + '</div>' +
            (status==='won'?'<div style="font-size:10px;color:var(--txt2);margin-top:2px;">Bet: '+fmt(b.bet)+'</div>':
             status==='pending'?'<div style="font-size:10px;color:var(--txt2);margin-top:2px;">Awaiting result</div>':'') +
          '</div></div>';
      }).join('');
    }).catch(function() { wrap.innerHTML = '<div style="color:var(--red);padding:1rem;">Error loading.</div>'; });
  } else {
    fbGet('/playerTxns').then(function(data) {
      if (!data) { wrap.innerHTML = '<div style="text-align:center;color:var(--txt2);padding:2rem;">No casino bets yet.</div>'; return; }
      var bets = Object.values(data)
        .filter(function(b) { return b.playerKey === CK; })
        .sort(function(a, b) { return new Date(b.time) - new Date(a.time); })
        .slice(0, 80);
      if (!bets.length) { wrap.innerHTML = '<div style="text-align:center;color:var(--txt2);padding:2rem;">No casino bets yet.</div>'; return; }
      wrap.innerHTML = bets.map(function(b) {
        var won = b.win;
        return '<div class="hitem">' +
          '<div><div class="hn">' + b.game + '</div><div class="hd">' + new Date(b.time).toLocaleString() + '</div></div>' +
          '<div style="text-align:right;">' +
            '<div class="ha ' + (won?'win':'loss') + '">' + (won?'+'+fmt(b.payout):'-'+fmt(b.bet)) + '</div>' +
            '<div class="has ' + (won?'win':'loss') + '">' + (won?'WON':'LOST') + '</div>' +
          '</div></div>';
      }).join('');
    }).catch(function() { wrap.innerHTML = '<div style="color:var(--red);padding:1rem;">Error loading.</div>'; });
  }
}
