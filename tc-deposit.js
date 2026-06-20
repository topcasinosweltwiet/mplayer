// tc-deposit.js
'use strict';

// ── CONTACT AGENTS ──
function loadContactAgents() {
  var wrap = $('contact-agents-wrap');
  if (!wrap) return;
  wrap.innerHTML = '<div style="color:var(--txt2);font-size:13px;padding:0.5rem 0;">Loading...</div>';
  fbGet('/adminContacts').then(function(data) {
    if (!data || !Object.keys(data).length) {
      wrap.innerHTML = '<div style="color:var(--txt2);font-size:13px;padding:0.5rem 0;">No contact options yet.</div>';
      return;
    }
    var entries = Object.entries(data).filter(function(e) { return e[1].active !== false; });
    if (!entries.length) {
      wrap.innerHTML = '<div style="color:var(--txt2);font-size:13px;">No contacts available.</div>';
      return;
    }
    wrap.innerHTML = '';
    entries.forEach(function(e) {
      var c = e[1];
      var type = c.type || 'telegram';
      var color = type === 'whatsapp' ? '#25d366' : '#2aa3ef';
      var label = type === 'whatsapp' ? 'WhatsApp' : 'Telegram';
      var icon = type === 'whatsapp' ? 'W' : 'T';

      // Build correct absolute URL
      var raw = (c.link || '').trim();
      var url;
      if (!raw) {
        url = '#';
      } else if (raw.indexOf('http') === 0) {
        url = raw;
      } else if (raw.indexOf('t.me') === 0) {
        url = 'https://' + raw;
      } else if (raw.charAt(0) === '@') {
        url = 'https://t.me/' + raw.slice(1);
      } else if (type === 'whatsapp') {
        url = 'https://wa.me/' + raw.replace(/[^0-9+]/g, '');
      } else {
        url = 'https://t.me/' + raw;
      }

      var a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.cssText = 'display:flex;align-items:center;gap:12px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:8px;text-decoration:none;';
      a.innerHTML =
        '<div style="width:40px;height:40px;border-radius:50%;background:' + color + ';display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#fff;flex-shrink:0;">' + icon + '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:14px;font-weight:700;color:var(--txt);">' + (c.name || label) + '</div>' +
          '<div style="font-size:11px;color:' + color + ';font-weight:600;margin-top:2px;">' + label + (c.username ? ' · @' + c.username : '') + '</div>' +
          '<div style="font-size:11px;color:var(--txt2);margin-top:2px;">' + (c.note || 'Tap to contact for deposit') + '</div>' +
        '</div>' +
        '<div style="font-size:18px;color:var(--txt2);">›</div>';
      wrap.appendChild(a);
    });
  }).catch(function() {
    wrap.innerHTML = '<div style="color:var(--txt2);font-size:13px;">Could not load contacts.</div>';
  });
}

// ── CRYPTO DEPOSIT ──
var depCrypto = null;

function loadDeposit() {
  var list = $('dlist');
  if (!list) return;
  list.innerHTML = '<div style="color:var(--txt2);font-size:13px;padding:0.5rem;">Loading payment options...</div>';
  fbGet('/agentWebSettings').then(function(settings) {
    if (!settings) {
      list.innerHTML = '<div style="color:var(--txt2);font-size:13px;">No deposit options. Contact support.</div>';
      return;
    }
    var cryptos = [];
    Object.values(settings).forEach(function(s) {
      if (s.cryptos) s.cryptos.forEach(function(c) { cryptos.push(c); });
    });
    if (!cryptos.length) {
      list.innerHTML = '<div style="color:var(--txt2);font-size:13px;">No deposit options available.</div>';
      return;
    }
    list.innerHTML = '';
    cryptos.forEach(function(c) {
      var opt = document.createElement('div');
      opt.className = 'dopt';
      opt.innerHTML =
        '<div><div class="don">' + c.coin + ' (' + c.symbol + ')</div><div class="dnet">Network: ' + c.network + '</div></div>' +
        '<div style="color:var(--txt2);">›</div>';
      opt.addEventListener('click', function() {
        list.querySelectorAll('.dopt').forEach(function(o) { o.classList.remove('sel'); });
        opt.classList.add('sel');
        depCrypto = c;
        st('dadrv', c.address);
        st('dnetl', 'Network: ' + c.network);
        $('daddr').style.display = 'block';
        $('dform').style.display = 'block';
      });
      list.appendChild(opt);
    });
  }).catch(function() {
    list.innerHTML = '<div style="color:var(--red);font-size:13px;">Error loading. Tap Refresh.</div>';
  });
}

function submitDeposit() {
  hd('derr'); hd('dok');
  if (!depCrypto) { sh('derr', 'Select a payment method first.'); return; }
  var amt = parseInt($('damt').value) || 0;
  var hash = ($('dtxh').value || '').trim();
  if (amt < 100) { sh('derr', 'Minimum deposit is Rs. 100.'); return; }
  if (!hash) { sh('derr', 'Please enter the transaction hash.'); return; }
  $('dsubmit').textContent = 'Submitting...'; $('dsubmit').disabled = true;
  fbPush('/playerCryptoDeposits', {
    playerKey: CK, playerUid: CD.uid, playerName: CD.username,
    coin: depCrypto.coin, symbol: depCrypto.symbol, network: depCrypto.network,
    amount: amt, txHash: hash, status: 'pending', time: new Date().toISOString()
  }).then(function() {
    sh('dok', 'Deposit submitted! Admin will verify and credit your balance shortly.');
    pushNotif('Deposit of ' + fmt(amt) + ' submitted via ' + depCrypto.coin + '. Awaiting verification.', 'deposit');
    $('damt').value = ''; $('dtxh').value = '';
    $('dsubmit').textContent = 'Submit Deposit'; $('dsubmit').disabled = false;
  }).catch(function(e) {
    sh('derr', 'Error: ' + e.message);
    $('dsubmit').textContent = 'Submit Deposit'; $('dsubmit').disabled = false;
  });
}

// ── WITHDRAWAL ──
var allAgents = {}, selAgent = null, pendingWdKey = null;

fbGet('/agents').then(function(a) { allAgents = a || {}; }).catch(function() {});

function onCityInput() {
  var q = ($('wci').value || '').trim().toLowerCase();
  var res = $('wcr'); res.innerHTML = '';
  $('wsf').style.display = 'none';
  $('wcbox').style.display = 'none';
  $('wdcbox').style.display = 'none';
  selAgent = null;
  if (!q) return;
  var cities = {};
  Object.values(allAgents).forEach(function(a) {
    if ((a.city || '').toLowerCase().indexOf(q) >= 0) {
      cities[a.city] = (cities[a.city] || []).concat([a]);
    }
  });
  Object.keys(cities).slice(0, 8).forEach(function(city) {
    var btn = document.createElement('button');
    btn.className = 'tag-btn';
    btn.textContent = city;
    btn.addEventListener('click', function() {
      $('wci').value = city; res.innerHTML = '';
      allAgents._ca = cities[city];
      $('wsi').value = ''; $('wsr').innerHTML = '';
      $('wsf').style.display = 'block';
      $('wcbox').style.display = 'none';
      selAgent = null;
    });
    res.appendChild(btn);
  });
}

function onStreetInput() {
  var q = ($('wsi').value || '').trim().toLowerCase();
  var res = $('wsr'); res.innerHTML = '';
  $('wcbox').style.display = 'none';
  selAgent = null;
  if (!q) return;
  var ca = allAgents._ca || Object.values(allAgents);
  ca.filter(function(a) { return (a.street || '').toLowerCase().indexOf(q) >= 0; })
    .slice(0, 8).forEach(function(a) {
      var btn = document.createElement('button');
      btn.className = 'tag-btn';
      btn.style.background = 'var(--bg2)';
      btn.style.color = 'var(--accent)';
      btn.style.border = '2px solid var(--border)';
      btn.textContent = a.street;
      btn.addEventListener('click', function() {
        $('wsi').value = a.street; res.innerHTML = '';
        selAgent = a;
        st('wcs', a.city); st('wss', a.street);
        $('wcbox').style.display = 'block';
        $('wdcbox').style.display = 'none';
      });
      res.appendChild(btn);
    });
}

function genWdCode() {
  hd('werr');
  if (!CD) return;
  fbGet('/players/' + CK + '/kyc').then(function(kyc) {
    if (!kyc || !kyc.name) {
      sh('werr', 'Please complete KYC in Settings first to enable withdrawal.');
      return;
    }
    if (CD.wdBlocked) {
      sh('werr', 'Your withdrawal is blocked by security department. Contact your agent to unlock.');
      return;
    }
    if (!selAgent) { sh('werr', 'Please select your city and street.'); return; }
    var amt = parseInt($('wamt').value) || 0;
    if (amt < 1) { sh('werr', 'Enter a valid amount.'); return; }
    if (amt > bal()) { sh('werr', 'Insufficient balance: ' + fmt(bal())); return; }
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    var code = '';
    for (var i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    fbPush('/withdrawalCodes', {
      code: code, amount: amt,
      playerKey: CK, playerUid: CD.uid, playerName: CD.username,
      agentCity: selAgent.city, agentStreet: selAgent.street, agentId: selAgent.agentId,
      status: 'pending', createdAt: new Date().toISOString()
    }).then(function(res) {
      pendingWdKey = res.name;
      st('wdcval', code);
      st('wdcamt', fmt(amt));
      $('wdcbox').style.display = 'block';
      pushNotif('Withdrawal of ' + fmt(amt) + ' requested. Code: ' + code + '. Show to agent in ' + selAgent.city + '.', 'withdrawal');
    }).catch(function(e) { sh('werr', 'Error: ' + e.message); });
  }).catch(function() { sh('werr', 'Could not verify KYC. Please try again.'); });
}

function cancelWdCode() {
  if (!pendingWdKey || !confirm('Cancel this withdrawal request?')) return;
  fbUp('/withdrawalCodes/' + pendingWdKey, { status: 'cancelled' }).then(function() {
    $('wdcbox').style.display = 'none';
    pendingWdKey = null;
  });
}
