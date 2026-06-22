// tc-core.js — Core helpers, session, auth, nav, win rates
'use strict';

// ── HELPERS ──
function $(i){return document.getElementById(i);}
function st(i,v){var e=$(i);if(e)e.textContent=v;}
function sh(i,m){var e=$(i);if(!e)return;if(m!==undefined)e.textContent=m;e.style.display='block';}
function hd(i){var e=$(i);if(e)e.style.display='none';}
function fmt(n){return 'Rs. '+Number(n||0).toLocaleString('en-NP');}
function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function pick(arr){return arr[rnd(0,arr.length-1)];}
function om(i){var e=$(i);if(e)e.classList.add('open');}
function cm(i){var e=$(i);if(e)e.classList.remove('open');}
function closeCrashGame(){
  if(typeof CS==='undefined')return;
  if(CS.animId){cancelAnimationFrame(CS.animId);CS.animId=null;}
  if(CS.countdownTimer){clearInterval(CS.countdownTimer);CS.countdownTimer=null;}
  CS.running=false; CS.phase='idle';
  if(CS.betPlaced&&CS.bet>0&&!CS.cashedOut&&typeof bal==='function'){
    var wb=bal()+CS.bet; if(typeof CD!=='undefined'){CD.balance=wb;} 
    if(typeof fbUp==='function'&&typeof CK!=='undefined')fbUp('/players/'+CK,{balance:wb});
    if(typeof ub==='function')ub();
  }
  CS.betPlaced=false; CS.bet=0;
  var cov=$('cov'); if(cov)cov.classList.remove('open');
}

// ── WIN RATES — VERY LOW ──
var _streak = 0;
function wc(crash) {
  if (_streak > 0) { _streak--; return false; }
  var rate = crash ? 0.04 : 0.07; // 4% crash, 7% other games
  var won = Math.random() < rate;
  if (won) _streak = rnd(6, 15); // force 6-15 losses after every win
  return won;
}

// ── SESSION STATE ──
var CK = null, CD = null, ptimer = null, ntimer = null;
function bal() { return CD ? Number(CD.balance || 0) : 0; }
function ub() {
  var b = fmt(bal());
  st('bshow', b); st('gbal', b); st('cbal', b); st('sbbal', b); st('pibal', b);
}

// ── SAVE BET — ALWAYS DEDUCT FIRST ──
function saveBet(game, bet, won, payout) {
  if (!CK) return;
  // Step 1: deduct bet
  var nb = bal() - bet;
  if (nb < 0) nb = 0;
  // Step 2: if won, add payout (profit only, not bet+profit)
  if (won) nb += payout;
  nb = Math.max(0, Math.round(nb));
  CD.balance = nb;
  fbUp('/players/' + CK, { balance: nb });
  fbPush('/playerTxns', {
    playerKey: CK, uid: CD.uid, game: game,
    bet: bet, win: won, payout: won ? payout : 0,
    time: new Date().toISOString()
  });
  ub();
}

// ── THEME ──
function applyTheme(t) {
  localStorage.setItem('tc_theme', t);
  if (t === 'dark') document.body.classList.add('dark');
  else document.body.classList.remove('dark');
}

// ── AUTH ──
document.addEventListener('DOMContentLoaded', function() {
  // Hide loading screen with fade
  setTimeout(function() {
    var ls = $('loading-screen');
    if (ls) { ls.style.transition='opacity 0.5s'; ls.style.opacity='0'; setTimeout(function(){ls.style.display='none';},500); }
  }, 800);
  $('tl').onclick = function() {
    $('tl').classList.add('active'); $('tr').classList.remove('active');
    $('fl').style.display = ''; $('fr').style.display = 'none'; hd('aerr');
  };
  $('tr').onclick = function() {
    $('tr').classList.add('active'); $('tl').classList.remove('active');
    $('fr').style.display = ''; $('fl').style.display = 'none'; hd('aerr');
    refreshCaptcha();
  };
  $('lbtn').onclick = doLogin;
  $('rbtn').onclick = doReg;
  [$('lu'), $('lp')].forEach(function(e) { if (e) e.onkeydown = function(ev) { if (ev.key === 'Enter') doLogin(); }; });
  [$('ru'), $('rp'), $('rp2')].forEach(function(e) { if (e) e.onkeydown = function(ev) { if (ev.key === 'Enter') doReg(); }; });
  applyTheme(localStorage.getItem('tc_theme') || 'light');
  refreshCaptcha();
});

function aerr(m) { sh('aerr', m); }

function doLogin() {
  var u = ($('lu').value || '').trim().toLowerCase(), p = $('lp').value || '';
  if (!u || !p) { aerr('Fill all fields.'); return; }
  $('lbtn').textContent = 'Loading...'; $('lbtn').disabled = true;
  fbGet('/players').then(function(pl) {
    $('lbtn').textContent = 'Login'; $('lbtn').disabled = false;
    if (!pl) { aerr('Invalid credentials.'); return; }
    var k = Object.keys(pl).find(function(k) {
      return (pl[k].username || '').toLowerCase() === u && pl[k].password === p;
    });
    if (!k) { aerr('Invalid username or password.'); return; }
    CK = k; CD = pl[k]; startSession();
  }).catch(function(e) { $('lbtn').textContent = 'Login'; $('lbtn').disabled = false; aerr('Error: ' + e.message); });
}

// ── CAPTCHA ──
var _captchaAnswer = 0;
function refreshCaptcha() {
  var a = Math.floor(Math.random() * 20) + 1;
  var b = Math.floor(Math.random() * 20) + 1;
  var ops = [
    { q: a + ' + ' + b, ans: a + b },
    { q: a + ' x ' + b, ans: a * b },
    { q: (a + b) + ' - ' + a, ans: b },
  ];
  var op = ops[Math.floor(Math.random() * ops.length)];
  _captchaAnswer = op.ans;
  var qEl = $('captcha-q'); if (qEl) qEl.textContent = 'What is ' + op.q + '?';
  var aEl = $('captcha-a'); if (aEl) aEl.value = '';
  var eEl = $('captcha-err'); if (eEl) eEl.style.display = 'none';
}
window.refreshCaptcha = refreshCaptcha; // expose for onclick

function doReg() {
  var u = ($('ru').value || '').trim(), p = $('rp').value || '', p2 = $('rp2').value || '';
  if (!u || !p || !p2) { aerr('Fill all fields.'); return; }
  if (p.length < 4) { aerr('Password min 4 characters.'); return; }
  if (p !== p2) { aerr('Passwords do not match.'); return; }

  // ── CAPTCHA CHECK ──
  var captchaRaw = ($('captcha-a') ? $('captcha-a').value : '').trim();
  var captchaErr = $('captcha-err');
  if (captchaRaw === '' || parseInt(captchaRaw) !== _captchaAnswer) {
    if (captchaErr) captchaErr.style.display = 'block';
    if ($('captcha-a')) $('captcha-a').value = '';
    refreshCaptcha();
    return;
  }
  if (captchaErr) captchaErr.style.display = 'none';

  $('rbtn').textContent = 'Creating...'; $('rbtn').disabled = true;
  fbGet('/players').then(function(pl) {
    if (pl && Object.values(pl).some(function(x) { return (x.username || '').toLowerCase() === u.toLowerCase(); })) {
      aerr('Username already taken.'); $('rbtn').textContent = 'Create Account'; $('rbtn').disabled = false; return;
    }
    var uid = Date.now();
    return fbPush('/players', { username: u, password: p, uid: uid, balance: 0, createdAt: new Date().toISOString() });
  }).then(function(res) {
    if (!res) return;
    CK = res.name;
    return fbGet('/players/' + CK);
  }).then(function(d) {
    if (!d) return;
    CD = d; $('rbtn').textContent = 'Create Account'; $('rbtn').disabled = false;
    startSession();
  }).catch(function(e) { $('rbtn').textContent = 'Create Account'; $('rbtn').disabled = false; aerr('Error: ' + e.message); });
}

function startSession() {
  $('p-auth').classList.remove('active');
  $('app').style.display = 'block';
  applyTheme(localStorage.getItem('tc_theme') || 'light');
  st('set-un', CD.username || '');
  ub(); loadHome(); loadDeposit(); loadContactAgents(); startNotifPoll();
  if (ptimer) clearInterval(ptimer);
  ptimer = setInterval(function() {
    if (!CK) { clearInterval(ptimer); return; }
    fbGet('/players/' + CK).then(function(d) { if (d) { CD = d; ub(); } });
  }, 10000);
}

function doLogout() {
  CK = null; CD = null;
  if (ptimer) clearInterval(ptimer);
  if (ntimer) clearInterval(ntimer);
  $('app').style.display = 'none';
  showPage('p-auth');
}

// ── NAV ──
function showPage(id) {
  ['p-auth', 'pg-home', 'pg-hist', 'pg-dw', 'pg-set'].forEach(function(p) {
    var e = $(p); if (e) e.classList.remove('active');
  });
  var e = $(id); if (e) e.classList.add('active');
  ['bn-h', 'bn-hi', 'bn-dw', 'bn-s'].forEach(function(b) {
    var el = $(b); if (el) el.classList.remove('active');
  });
  var map = { 'pg-home': 'bn-h', 'pg-hist': 'bn-hi', 'pg-dw': 'bn-dw', 'pg-set': 'bn-s' };
  if (map[id]) { var el = $(map[id]); if (el) el.classList.add('active'); }
  window.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', function() {
  $('bn-h').onclick = function() { showPage('pg-home'); loadHome(); };
  $('bn-hi').onclick = function() { showPage('pg-hist'); loadHistory('sport'); };
  $('bn-dw').onclick = function() { showPage('pg-dw'); if(window.resetDWTabs)resetDWTabs(); switchDWTab('dep'); };
  $('bn-s').onclick = function() { showPage('pg-set'); var sb=$('set-bal');if(sb)sb.textContent=fmt(bal()); };

  // Settings items
  $('si-prof').onclick = openProfile;
  $('si-kyc').onclick = openKYC;
  $('si-theme').onclick = function() { om('ov-theme'); };
  $('si-sup').onclick = openSupport;
  $('si-out').onclick = function() { if (confirm('Logout?')) doLogout(); };

  // Theme
  $('theme-cl').onclick = function() { cm('ov-theme'); };
  $('th-li').onclick = function() { applyTheme('light'); cm('ov-theme'); };
  $('th-dk').onclick = function() { applyTheme('dark'); cm('ov-theme'); };

  // Notif
  $('notifbtn').onclick = openNotif;
  $('notif-cl').onclick = function() { cm('ov-notif'); };

  // Profile
  $('prof-cl').onclick = function() { cm('ov-prof'); };
  $('prof-save').onclick = savePassword;

  // KYC
  $('kyc-cl').onclick = function() { cm('ov-kyc'); };
  $('kycsave').onclick = saveKYC;

  // Support
  $('sup-cl').onclick = function() { cm('ov-sup'); };
  $('sup-send').onclick = sendSupport;
  $('sup-inp').onkeydown = function(e) { if (e.key === 'Enter') sendSupport(); };

  // Sport bet
  $('sbet-cl').onclick = function() { cm('ov-sbet'); };
  $('sbplace').onclick = placeSportBet;
  document.querySelectorAll('.bchip').forEach(function(c) {
    c.onclick = function() { $('sbamt').value = c.dataset.v; updateBsum(); };
  });
  $('sbamt').oninput = updateBsum;

  // Game overlay
  $('gclose').onclick = function() {
    $('gov').classList.remove('open');
    // Reset game state
    if (typeof gState !== 'undefined') gState = {};
    if (typeof tState !== 'undefined' && tState.active) { tState.active = false; }
    if (typeof mState !== 'undefined' && mState.active) { mState.active = false; }
  };
  $('gpbtn').onclick = function() { if (typeof doPlayGame === 'function' && typeof currentGame !== 'undefined' && currentGame) doPlayGame(currentGame); };

  // Crash
  $('cclose').onclick = closeCrashGame;
  $('cplay').onclick = startCrash;
  $('ccashout').onclick = doCashout;

  // WD

  // Deposit

  // History tabs
  $('ht-sp').onclick = function() { $('ht-sp').classList.add('active'); $('ht-ca').classList.remove('active'); loadHistory('sport'); };
  $('ht-ca').onclick = function() { $('ht-ca').classList.add('active'); $('ht-sp').classList.remove('active'); loadHistory('casino'); };

  // Sport search
  $('ssbtn').onclick = doSportSearch;
  $('ssinp').onkeydown = function(e) { if (e.key === 'Enter') doSportSearch(); };

  // Close on outside click
  document.addEventListener('click', function(e) {
    ['ov-sbet','ov-notif','ov-prof','ov-kyc','ov-theme','ov-sup'].forEach(function(id) {
      var el = $(id); if (el && e.target === el) el.classList.remove('open');
    });
    ['gov', 'cov'].forEach(function(id) {
      var el = $(id); if (el && e.target === el) {
        el.classList.remove('open');
        if (id === 'cov') {
          if (CS.animId) { cancelAnimationFrame(CS.animId); CS.animId = null; }
          if (CS.countdownTimer) { clearInterval(CS.countdownTimer); CS.countdownTimer = null; }
          CS.running = false; CS.phase = 'waiting';
          if (CS.betPlaced && CS.bet > 0 && !CS.cashedOut) {
            var wb = bal() + CS.bet; CD.balance = wb; fbUp('/players/' + CK, {balance: wb}); ub();
          }
          CS.betPlaced = false; CS.bet = 0;
        }
      }
    });
  });
});

// ── PROFILE ──
function openProfile() {
  if (!CD) return;
  st('piun', CD.username || ''); st('piid', '#' + CD.uid); st('pibal', fmt(bal()));
  var av = $('prof-user'); if (av) av.textContent = (CD.username || '?')[0].toUpperCase();
  $('prof-cp').value = ''; $('prof-np').value = ''; $('prof-cp').value = '';
  hd('prof-err'); hd('pwok');
  om('ov-prof');
}
function savePassword() {
  var old = $('prof-cp').value, nw = $('prof-np').value, cf = $('prof-cp').value;
  hd('prof-err'); hd('pwok');
  if (!old || !nw || !cf) { sh('prof-err', 'Fill all fields.'); return; }
  if (old !== CD.password) { sh('prof-err', 'Current password incorrect.'); return; }
  if (nw.length < 4) { sh('prof-err', 'Min 4 characters.'); return; }
  if (nw !== cf) { sh('prof-err', 'Passwords do not match.'); return; }
  $('prof-save').textContent = 'Saving...'; $('prof-save').disabled = true;
  fbUp('/players/' + CK, { password: nw }).then(function() {
    CD.password = nw; sh('pwok', 'Password changed successfully!');
    $('prof-cp').value = ''; $('prof-np').value = ''; $('prof-cp').value = '';
    $('prof-save').textContent = 'Save Password'; $('prof-save').disabled = false;
  }).catch(function(e) { sh('prof-err', 'Error: ' + e.message); $('prof-save').textContent = 'Save Password'; $('prof-save').disabled = false; });
}

// ── KYC ──
function openKYC() {
  om('ov-kyc');
  fbGet('/players/' + CK + '/kyc').then(function(kyc) {
    if (kyc && kyc.name) { $('kycbody').style.display = 'none'; $('kycdone').style.display = 'block'; }
    else { $('kycbody').style.display = 'block'; $('kycdone').style.display = 'none'; }
  }).catch(function() {});
}
function saveKYC() {
  var name = $('kname').value.trim(), state = $('kstate').value.trim(), city = $('kcity').value.trim(), gid = $('kgid').value.trim();
  hd('kycerr');
  if (!name || !state || !city || !gid) { sh('kycerr', 'Please fill all fields.'); return; }
  $('kycsave').textContent = 'Saving...'; $('kycsave').disabled = true;
  fbUp('/players/' + CK + '/kyc', { name: name, state: state, city: city, gid: gid, submittedAt: new Date().toISOString() }).then(function() {
    $('kycbody').style.display = 'none'; $('kycdone').style.display = 'block';
    $('kycsave').textContent = 'Submit & Unlock Withdrawal'; $('kycsave').disabled = false;
  }).catch(function(e) { sh('kycerr', 'Error: ' + e.message); $('kycsave').textContent = 'Submit'; $('kycsave').disabled = false; });
}

// ── NOTIFICATIONS ──
function startNotifPoll() {
  if (ntimer) clearInterval(ntimer);
  ntimer = setInterval(function() { if (CK) { checkNotifCount(); checkSupportUnread(); } }, 7000);
  checkNotifCount();
  checkSupportUnread();
}

function checkSupportUnread() {
  if (!CK) return;
  fbGet('/support/' + CK).then(function(data) {
    if (!data) return;
    // Check if there are any admin messages that are unread
    var hasNewAdmin = Object.values(data).some(function(m) {
      return m.sender === 'admin' && !m.readByPlayer;
    });
    var badge = $('supp-badge');
    if (badge) {
      badge.style.display = hasNewAdmin ? 'flex' : 'none';
    }
  }).catch(function() {});
}
function checkNotifCount() {
  fbGet('/notifications/' + CK).then(function(data) {
    if (!data) return;
    var unread = Object.values(data).filter(function(n) { return !n.read; }).length;
    var badge = $('nbadge');
    if (badge) { badge.textContent = unread; badge.style.display = unread > 0 ? 'flex' : 'none'; }
  }).catch(function() {});
}
function openNotif() {
  om('ov-notif');
  var list = $('notif-list'); list.innerHTML = '<div style="text-align:center;color:var(--txt2);padding:1.5rem;">Loading...</div>';
  fbGet('/notifications/' + CK).then(function(data) {
    if (!data || !Object.keys(data).length) { list.innerHTML = '<div style="text-align:center;color:var(--txt2);padding:2rem;">No notifications yet.</div>'; return; }
    var entries = Object.entries(data).sort(function(a, b) { return new Date(b[1].time) - new Date(a[1].time); });
    list.innerHTML = entries.map(function(e) {
      var n = e[1];
      var icon = n.type === 'deposit' ? '💰' : n.type === 'withdrawal' ? '💸' : n.type === 'admin' ? '📢' : n.type === 'rejected' ? '❌' : '🔔';
      var cls = 'nitem ' + (n.read ? '' : 'nnew ') + 'n' + (n.type || 'adm');
      return '<div class="' + cls + '"><div class="nico">' + icon + '</div><div><div class="nmsg">' + n.msg + '</div><div class="ntime">' + new Date(n.time).toLocaleString() + '</div></div></div>';
    }).join('');
    var updates = {}; entries.forEach(function(e) { if (!e[1].read) updates[e[0] + '/read'] = true; });
    if (Object.keys(updates).length) fbUp('/notifications/' + CK, updates).catch(function() {});
    var badge = $('nbadge'); if (badge) badge.style.display = 'none';
  }).catch(function() { list.innerHTML = '<div style="color:var(--red);padding:1rem;">Error loading.</div>'; });
}
function pushNotif(msg, type) {
  if (!CK) return;
  fbPush('/notifications/' + CK, { msg: msg, type: type || 'info', time: new Date().toISOString(), read: false }).catch(function() {});
}

// ── SUPPORT ──
function openSupport() {
  om('ov-sup'); loadSupportMsgs();
  // Clear red badge when opening
  var badge = $('supp-badge');
  if (badge) badge.style.display = 'none';
  // Mark all admin messages as read
  if (CK) {
    fbGet('/support/' + CK).then(function(data) {
      if (!data) return;
      var updates = {};
      Object.entries(data).forEach(function(e) {
        if (e[1].sender === 'admin' && !e[1].readByPlayer) {
          updates[e[0] + '/readByPlayer'] = true;
        }
      });
      if (Object.keys(updates).length) fbUp('/support/' + CK, updates).catch(function() {});
    }).catch(function() {});
  }
  if (window._suppTimer) clearInterval(window._suppTimer);
  window._suppTimer = setInterval(function() { if ($('ov-sup').classList.contains('open')) loadSupportMsgs(); }, 8000);
}
function loadSupportMsgs() {
  if (!CK) return;
  fbGet('/support/' + CK).then(function(data) {
    var wrap = $('sup-msgs');
    if (!data || !Object.keys(data).length) { wrap.innerHTML = '<div style="text-align:center;color:var(--txt2);padding:1.5rem;font-size:13px;">No messages yet. Tell us your problem!</div>'; return; }
    var entries = Object.entries(data).sort(function(a, b) { return new Date(a[1].time) - new Date(b[1].time); });
    wrap.innerHTML = entries.map(function(e) {
      var m = e[1], isAdmin = m.sender === 'admin';
      return '<div style="display:flex;flex-direction:column;align-items:' + (isAdmin ? 'flex-start' : 'flex-end') + ';">' +
        '<div class="smsg ' + (isAdmin ? 'am' : 'pm') + '">' + m.msg + '</div>' +
        '<div class="stime" style="text-align:' + (isAdmin ? 'left' : 'right') + ';">' + new Date(m.time).toLocaleString() + '</div>' +
        '</div>';
    }).join('');
    wrap.scrollTop = wrap.scrollHeight;
  }).catch(function() {});
}
function sendSupport() {
  var msg = $('sup-inp').value.trim(); if (!msg || !CK) return;
  $('sup-send').disabled = true; $('sup-inp').value = '';
  fbPush('/support/' + CK, { msg: msg, sender: 'player', playerName: CD.username, playerUid: CD.uid, time: new Date().toISOString() }).then(function() {
    loadSupportMsgs(); $('sup-send').disabled = false;
  }).catch(function() { $('sup-send').disabled = false; });
}
