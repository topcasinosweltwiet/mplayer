// tc-deposit.js — Deposit & Withdrawal

var _depLoaded=false, _wdLoaded=false;
var MIN_WD_EWALLET = 5000;   // Rs. 5000 min for eWallets
var MIN_WD_CRYPTO  = 30;     // $30 min for crypto
var MIN_WD_AGENT   = 500;    // Rs. 500 min for agent

// ── TAB SWITCHING ──
function switchDWTab(tab){
  var panels={dep:$('dw-dep'),wd:$('dw-wd'),hist:$('dw-hist')};
  var btns={dep:$('dw-btn-dep'),wd:$('dw-btn-wd'),hist:$('dw-btn-hist')};
  // Hide all panels
  Object.values(panels).forEach(function(p){if(p)p.style.display='none';});
  // Reset all buttons
  Object.values(btns).forEach(function(b){
    if(b){b.style.background='var(--bg2)';b.style.color='var(--txt2)';b.style.borderColor='var(--border)';}
  });
  // Show active
  if(panels[tab])panels[tab].style.display='';
  if(btns[tab]){btns[tab].style.background='var(--accent)';btns[tab].style.color='#fff';btns[tab].style.borderColor='var(--accent)';}
  // Load data
  if(tab==='dep'&&!_depLoaded){_depLoaded=true;loadContactAgents();loadDepositSections();}
  if(tab==='wd'&&!_wdLoaded){_wdLoaded=true;loadWithdrawSections();}
  if(tab==='hist'){loadTxHistory();}
}
function resetDWTabs(){_depLoaded=false;_wdLoaded=false;}
window.switchDWTab=switchDWTab;
window.resetDWTabs=resetDWTabs;
window.loadDeposit=function(){loadContactAgents();loadDepositSections();};

// ── CONTACT AGENTS ──
function loadContactAgents(){
  var wrap=$('contact-agents-wrap');if(!wrap)return;
  wrap.innerHTML='<div style="color:var(--txt2);font-size:13px;padding:0.5rem 0;">Loading...</div>';
  fbGet('/adminContacts').then(function(data){
    if(!data||!Object.keys(data).length){wrap.innerHTML='<div style="color:var(--txt2);font-size:13px;">No contacts yet.</div>';return;}
    var entries=Object.entries(data).filter(function(e){return e[1].active!==false;});
    if(!entries.length){wrap.innerHTML='<div style="color:var(--txt2);font-size:13px;">No contacts available.</div>';return;}
    wrap.innerHTML='';
    entries.forEach(function(e){
      var c=e[1];
      var isWA=c.type==='whatsapp';
      var color=isWA?'#25d366':'#2aa3ef';
      var label=isWA?'WhatsApp':'Telegram';
      var raw=(c.link||'').trim();
      var url=!raw?'#':raw.indexOf('http')===0?raw:isWA?'https://wa.me/'+raw.replace(/[^0-9+]/g,''):'https://t.me/'+raw.replace('@','');
      var a=document.createElement('a');
      a.href=url;a.target='_blank';a.rel='noopener noreferrer';
      a.style.cssText='display:flex;align-items:center;gap:12px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:8px;text-decoration:none;';
      a.innerHTML='<div style="width:38px;height:38px;border-radius:50%;background:'+color+';display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:#fff;flex-shrink:0;">'+(isWA?'W':'T')+'</div>'+
        '<div style="flex:1;"><div style="font-size:14px;font-weight:700;color:var(--txt);">'+(c.name||label)+'</div>'+
        '<div style="font-size:11px;color:'+color+';font-weight:600;">'+(c.note||'Tap to contact')+'</div></div>'+
        '<div style="font-size:20px;color:var(--txt2);">›</div>';
      wrap.appendChild(a);
    });
  }).catch(function(){wrap.innerHTML='<div style="color:var(--txt2);font-size:13px;">Could not load.</div>';});
}
window.loadContactAgents=loadContactAgents;

// ── LOAD DEPOSIT SECTIONS ──
function loadDepositSections(){
  var wrap=$('deposit-sections-wrap');if(!wrap)return;
  wrap.innerHTML='<div style="color:var(--txt2);font-size:13px;padding:1rem;text-align:center;">Loading...</div>';
  fbGet('/depositSections').then(function(data){
    wrap.innerHTML='';
    if(!data||!Object.keys(data).length){
      wrap.innerHTML='<div style="color:var(--txt2);font-size:13px;padding:1rem;text-align:center;">No deposit options yet.</div>';return;
    }
    // Group by category
    var groups={};
    Object.entries(data).forEach(function(e){
      var key=e[0],sec=e[1];
      if(sec.active===false)return;
      var cat=sec.category||'E-Wallets';
      if(!groups[cat])groups[cat]=[];
      groups[cat].push({key:key,sec:sec});
    });
    if(!Object.keys(groups).length){
      wrap.innerHTML='<div style="color:var(--txt2);font-size:13px;padding:1rem;text-align:center;">No deposit options yet.</div>';return;
    }
    // Render each group
    Object.entries(groups).forEach(function(g){
      var catName=g[0], items=g[1];
      // Category header
      var hdr=document.createElement('div');
      hdr.style.cssText='font-size:10px;font-weight:800;letter-spacing:1.5px;color:var(--txt2);text-transform:uppercase;padding:16px 0 8px;border-bottom:1px solid var(--border);margin-bottom:10px;';
      hdr.textContent=catName;
      wrap.appendChild(hdr);
      // Grid of method cards
      var grid=document.createElement('div');
      grid.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;';
      items.forEach(function(item){
        var card=buildDepositCard(item.key,item.sec);
        grid.appendChild(card);
      });
      wrap.appendChild(grid);
    });
  }).catch(function(e){wrap.innerHTML='<div style="color:var(--red);padding:1rem;">Error: '+e.message+'</div>';});
}
window.loadDepositSections=loadDepositSections;

function buildDepositCard(key,sec){
  var card=document.createElement('div');
  card.style.cssText='background:var(--card);border:1.5px solid var(--border);border-radius:12px;padding:14px 10px;text-align:center;cursor:pointer;transition:all 0.15s;';
  card.innerHTML='<div style="font-size:26px;margin-bottom:6px;">'+(sec.icon||'💰')+'</div>'+
    '<div style="font-size:12px;font-weight:700;color:var(--txt);">'+(sec.title||'')+'</div>';
  card.addEventListener('click',function(){openDepositModal(key,sec);});
  card.addEventListener('mouseenter',function(){card.style.borderColor='var(--accent)';});
  card.addEventListener('mouseleave',function(){card.style.borderColor='var(--border)';});
  return card;
}

// ── DEPOSIT MODAL ──
var _activeDepKey=null;
function openDepositModal(key,sec){
  _activeDepKey=key;
  var isCrypto=(sec.category||'').toLowerCase().includes('crypto');

  var ov=document.createElement('div');
  ov.id='dep-modal-ov';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,10,30,0.85);z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px;';

  var box=document.createElement('div');
  box.style.cssText='background:var(--card);border-radius:16px;width:100%;max-width:480px;padding:20px;max-height:85vh;overflow-y:auto;';

  // Header
  var header='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">'+
    '<div style="font-size:18px;font-weight:800;color:var(--txt);">'+(sec.icon||'💰')+' '+(sec.title||'Deposit')+'</div>'+
    '<button id="dep-modal-close" style="width:32px;height:32px;border-radius:50%;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>'+
  '</div>';

  // STEP 1: Show address/network/QR — 1xbet style
  var isCrypto=(sec.category||'').toLowerCase().includes('crypto');
  var warningMsg=sec.warningMsg||(isCrypto?'Only send '+sec.title+' on the correct network. Sending on a different network will result in PERMANENT LOSS of funds.':'');
  var minAmtLabel=sec.minAmount?'Minimum deposit: <strong>'+sec.minAmount+'</strong>':'';

  var step1='<div id="dep-step1">'+
    // Big red warning
    (warningMsg?
      '<div style="background:rgba(231,76,60,0.08);border:1.5px solid rgba(231,76,60,0.35);border-radius:10px;padding:12px 14px;margin-bottom:14px;">'+
        '<div style="font-size:13px;font-weight:800;color:#e74c3c;margin-bottom:6px;">⚠️ IMPORTANT</div>'+
        '<div style="font-size:12px;color:#e74c3c;line-height:1.6;">'+warningMsg+'</div>'+
      '</div>':'')+
    // Network badge
    (sec.network?
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">'+
        '<div style="font-size:11px;color:var(--txt2);">Network:</div>'+
        '<div style="background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.3);border-radius:20px;padding:3px 12px;font-size:12px;font-weight:700;color:#4ade80;">'+sec.network+'</div>'+
        '<div style="font-size:11px;color:#e74c3c;font-weight:600;">ONLY use this network</div>'+
      '</div>':'')+
    // Address + copy
    (sec.address?
      '<div style="margin-bottom:14px;">'+
        '<div style="font-size:11px;color:var(--txt2);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Deposit Address — Copy and send here:</div>'+
        '<div style="background:var(--bg2);border:1.5px solid var(--accent);border-radius:10px;padding:12px 14px;">'+
          '<div style="font-size:13px;font-weight:700;color:var(--accent);word-break:break-all;font-family:monospace;line-height:1.6;margin-bottom:10px;" id="dep-addr-display">'+sec.address+'</div>'+
          '<div style="display:flex;gap:8px;">'+
            '<button id="dep-copy-addr-btn" style="flex:1;padding:8px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">📋 Copy Address</button>'+
            (sec.network?'<button id="dep-copy-net-btn" style="padding:8px 12px;background:var(--bg2);color:var(--txt);border:1.5px solid var(--border);border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">Copy Network</button>':'')+
          '</div>'+
        '</div>'+
      '</div>':'')+ 
    // QR code
    (sec.qrImageUrl?
      '<div style="text-align:center;margin-bottom:14px;">'+
        '<div style="font-size:11px;color:var(--txt2);margin-bottom:8px;">Or scan QR code:</div>'+
        '<img src="'+sec.qrImageUrl+'" style="max-width:180px;width:100%;border-radius:10px;border:2px solid var(--border);"/>'+
      '</div>':'')+ 
    // E-wallet account info
    (!isCrypto&&sec.ewalletAccount?
      '<div style="background:var(--bg2);border:1.5px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:14px;">'+
        '<div style="font-size:11px;color:var(--txt2);margin-bottom:4px;">Send to this account:</div>'+
        '<div style="font-size:16px;font-weight:800;color:var(--txt);font-family:monospace;">'+sec.ewalletAccount+'</div>'+
        (sec.ewalletName?'<div style="font-size:12px;color:var(--txt2);margin-top:4px;">Name: '+sec.ewalletName+'</div>':'')+
        '<button id="dep-copy-ewallet-btn" style="margin-top:8px;padding:6px 14px;background:var(--accent);color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">Copy Number</button>'+
      '</div>':'')+ 
    // Description
    (sec.description?'<div style="font-size:12px;color:var(--txt2);background:var(--bg2);border-radius:8px;padding:10px 12px;margin-bottom:12px;">'+sec.description+'</div>':'')+
    // Min amount
    (minAmtLabel?'<div style="background:rgba(246,201,0,0.08);border:1px solid rgba(246,201,0,0.2);border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:12px;color:#f6c90e;">'+minAmtLabel+'</div>':'')+
    // Confirm paid button
    '<div style="background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);border-radius:8px;padding:10px 12px;margin-bottom:12px;font-size:11px;color:var(--txt2);">'+
      'By clicking Confirm, you agree that you have sent the correct amount to the address above.'+
    '</div>'+
    '<button id="dep-continue-btn" style="width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;">✓ I Have Paid — Continue</button>'+
  '</div>';

  // STEP 2: Amount + Proof
  var step2='<div id="dep-step2" style="display:none;">'+
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">'+
      '<button id="dep-back-btn" style="padding:7px 14px;background:var(--bg2);border:1.5px solid var(--border);color:var(--txt);border-radius:8px;font-size:12px;cursor:pointer;">← Back</button>'+
      '<div style="font-size:14px;font-weight:700;color:var(--txt);">Confirm Your Deposit</div>'+
    '</div>'+
    // Selected option summary
    '<div id="dep-selected-summary" style="background:var(--bg2);border:1.5px solid var(--accent);border-radius:10px;padding:12px;margin-bottom:14px;display:none;">'+
      '<div style="font-size:10px;color:var(--txt2);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">You are depositing via</div>'+
      '<div id="dep-selected-label" style="font-size:14px;font-weight:700;color:var(--txt);"></div>'+
      '<div id="dep-selected-addr" style="font-size:11px;color:var(--txt2);font-family:monospace;margin-top:4px;word-break:break-all;"></div>'+
    '</div>'+
    '<div style="margin-bottom:12px;">'+
      '<label style="font-size:11px;font-weight:700;color:var(--txt2);display:block;margin-bottom:6px;">AMOUNT</label>'+
      '<input type="number" id="dep-amt" placeholder="Enter amount you sent..." style="width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:15px;outline:none;box-sizing:border-box;"/>'+
    '</div>'+
    '<div style="margin-bottom:16px;">'+
      '<label style="font-size:11px;font-weight:700;color:var(--txt2);display:block;margin-bottom:6px;">'+(sec.proofLabel||'TRANSACTION ID / PROOF').toUpperCase()+'</label>'+
      '<input type="text" id="dep-proof" placeholder="Paste TX hash or screenshot ID..." style="width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:14px;outline:none;box-sizing:border-box;"/>'+
      '<div style="font-size:11px;color:var(--txt2);margin-top:6px;">We will verify your payment within 30 minutes.</div>'+
    '</div>'+
    '<div id="dep-err" style="display:none;color:#e74c3c;font-size:12px;margin-bottom:10px;padding:10px;background:rgba(231,76,60,0.08);border-radius:8px;border:1px solid rgba(231,76,60,0.2);"></div>'+
    '<div id="dep-ok" style="display:none;color:#4ade80;font-size:12px;margin-bottom:10px;padding:10px;background:rgba(74,222,128,0.08);border-radius:8px;border:1px solid rgba(74,222,128,0.2);"></div>'+
    '<button id="dep-submit-btn" style="width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;">Confirm Deposit</button>'+
  '</div>';

  box.innerHTML = header + step1 + step2;
  ov.appendChild(box);
  document.body.appendChild(ov);

  // Close
  document.getElementById('dep-modal-close').onclick=function(){ov.remove();};
  ov.onclick=function(e){if(e.target===ov)ov.remove();};
  // Wire copy buttons
  var cab=document.getElementById('dep-copy-addr-btn');
  if(cab){cab.onclick=function(){navigator.clipboard.writeText(sec.address||'').then(function(){cab.textContent='✓ Copied!';setTimeout(function(){cab.textContent='📋 Copy Address';},2000);});};}
  var cnb=document.getElementById('dep-copy-net-btn');
  if(cnb){cnb.onclick=function(){navigator.clipboard.writeText(sec.network||'').then(function(){alert('Network copied: '+sec.network);});};}
  var ceb=document.getElementById('dep-copy-ewallet-btn');
  if(ceb){ceb.onclick=function(){navigator.clipboard.writeText(sec.ewalletAccount||'').then(function(){alert('Account number copied!');});};}

  var selectedOpt=null;

  // Wire option rows
  box.querySelectorAll('.dep-opt-row').forEach(function(row){
    row.onclick=function(){
      // Highlight selected
      box.querySelectorAll('.dep-opt-row').forEach(function(r){r.style.borderColor='var(--border)';});
      row.style.borderColor='var(--accent)';
      selectedOpt={label:row.dataset.label, addr:row.dataset.addr, net:row.dataset.net};
      // Copy buttons
      var existingCopy=box.querySelector('#dep-copy-area');
      if(existingCopy)existingCopy.remove();
      if(row.dataset.addr){
        var copyArea=document.createElement('div');
        copyArea.id='dep-copy-area';
        copyArea.style.cssText='background:rgba(74,222,128,0.05);border:1.5px solid rgba(74,222,128,0.3);border-radius:10px;padding:12px;margin-top:8px;';
        copyArea.innerHTML='<div style="font-size:12px;font-weight:700;color:var(--txt);margin-bottom:6px;">Selected: '+row.dataset.label+'</div>'+
          '<div style="font-size:11px;color:var(--txt2);font-family:monospace;word-break:break-all;margin-bottom:8px;">'+row.dataset.addr+'</div>'+
          (row.dataset.net?'<div style="font-size:11px;color:#e74c3c;font-weight:600;margin-bottom:8px;">⚠️ Network: '+row.dataset.net+' — Only use this network</div>':'')+
          '<div style="display:flex;gap:8px;">'+
            '<button id="copy-addr-btn" style="flex:1;padding:7px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">Copy Address</button>'+
            (row.dataset.net?'<button id="copy-net-btn" style="flex:1;padding:7px;background:var(--bg2);color:var(--txt);border:1.5px solid var(--border);border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">Copy Network</button>':'')+
          '</div>';
        row.appendChild(copyArea);
        document.getElementById('copy-addr-btn').onclick=function(e){e.stopPropagation();navigator.clipboard.writeText(row.dataset.addr).then(function(){alert('Address copied!');});};
        var cnb=document.getElementById('copy-net-btn');
        if(cnb)cnb.onclick=function(e){e.stopPropagation();navigator.clipboard.writeText(row.dataset.net).then(function(){alert('Network copied!');});};
      }
    };
  });

  // Continue button
  document.getElementById('dep-continue-btn').onclick=function(){
    document.getElementById('dep-step1').style.display='none';
    document.getElementById('dep-step2').style.display='block';
    // Fill summary
    var sum=document.getElementById('dep-selected-summary');
    var lbl=document.getElementById('dep-selected-label');
    var addr=document.getElementById('dep-selected-addr');
    if(selectedOpt&&sum&&lbl){
      sum.style.display='block';
      lbl.textContent=selectedOpt.label+(selectedOpt.net?' ('+selectedOpt.net+')':'');
      if(addr)addr.textContent=selectedOpt.addr||'';
    }
  };

  // Back button
  document.getElementById('dep-back-btn').onclick=function(){
    document.getElementById('dep-step2').style.display='none';
    document.getElementById('dep-step1').style.display='block';
  };

  // Submit
  document.getElementById('dep-submit-btn').onclick=function(){
    var amt=parseFloat(document.getElementById('dep-amt').value)||0;
    var proof=(document.getElementById('dep-proof').value||'').trim();
    var errEl=document.getElementById('dep-err'), okEl=document.getElementById('dep-ok');
    errEl.style.display='none'; okEl.style.display='none';
    if(amt<1){errEl.textContent='Please enter the amount you sent.';errEl.style.display='block';return;}
    if(!proof){errEl.textContent='Please enter the transaction ID or proof.';errEl.style.display='block';return;}
    var btn=document.getElementById('dep-submit-btn');
    btn.textContent='Submitting...';btn.disabled=true;
    var optInfo=selectedOpt||{};
    fbPush('/playerCryptoDeposits',{
      playerKey:CK,playerUid:CD.uid,playerName:CD.username,
      sectionKey:key,section:sec.title,category:sec.category||'Other',
      selectedOption:optInfo.label||'',network:optInfo.net||'',address:optInfo.addr||'',
      amount:amt,proof:proof,status:'pending',time:new Date().toISOString()
    }).then(function(){
      return fbUp('/players/'+CK+'/depositMethods/'+key,{title:sec.title,category:sec.category||'Other',key:key,usedAt:new Date().toISOString()});
    }).then(function(){
      okEl.textContent='✓ Deposit submitted! We will verify and credit your balance within 30 minutes.';
      okEl.style.display='block';
      btn.textContent='Submitted ✓';
      pushNotif('Deposit of '+fmt(amt)+' submitted via '+sec.title+'. Awaiting verification.','deposit');
    }).catch(function(e){errEl.textContent='Error: '+e.message;errEl.style.display='block';btn.textContent='Confirm Deposit';btn.disabled=false;});
  };
}

window.openDepositModal=openDepositModal;

// ── LOAD WITHDRAWAL SECTIONS ──
function loadWithdrawSections(){
  var wrap=$('withdraw-sections-wrap');if(!wrap)return;
  wrap.innerHTML='<div style="color:var(--txt2);font-size:13px;padding:1rem;text-align:center;">Loading...</div>';

  Promise.all([
    fbGet('/withdrawalSections'),
    fbGet('/players/'+CK+'/depositMethods'),
    fbGet('/players/'+CK+'/allowedWdMethods')
  ]).then(function(res){
    var sections=res[0]||{}, depositMethods=res[1]||{}, allowedOverrides=res[2]||{};
    wrap.innerHTML='';

    // ── AGENT WITHDRAWAL ──
    var agentSec=document.createElement('div');
    agentSec.style.cssText='margin-bottom:6px;';
    agentSec.innerHTML='<div style="font-size:10px;font-weight:800;letter-spacing:1.5px;color:var(--txt2);text-transform:uppercase;padding:16px 0 8px;border-bottom:1px solid var(--border);margin-bottom:10px;">Agent Withdrawal</div>';
    var agentCard=document.createElement('div');
    agentCard.style.cssText='background:var(--card);border:1.5px solid var(--border);border-radius:12px;padding:14px;cursor:pointer;display:flex;align-items:center;gap:12px;';
    agentCard.innerHTML='<div style="font-size:28px;">🤝</div>'+
      '<div><div style="font-size:14px;font-weight:700;color:var(--txt);">Cash via Agent</div>'+
      '<div style="font-size:11px;color:var(--txt2);">Min Rs. '+MIN_WD_AGENT.toLocaleString('en-NP')+'</div></div>'+
      '<div style="margin-left:auto;color:var(--txt2);">›</div>';
    agentCard.onclick=function(){openAgentWithdrawalModal();};
    agentSec.appendChild(agentCard);
    wrap.appendChild(agentSec);

    if(!Object.keys(sections).length){
      var noSec=document.createElement('div');
      noSec.style.cssText='color:var(--txt2);font-size:13px;padding:1rem;text-align:center;';
      noSec.textContent='No withdrawal options configured yet.';
      wrap.appendChild(noSec);
      return;
    }

    // Group by category
    var groups={};
    Object.entries(sections).forEach(function(e){
      var key=e[0],sec=e[1];
      if(sec.active===false)return;
      var cat=sec.category||'E-Wallets';
      if(!groups[cat])groups[cat]=[];
      groups[cat].push({key:key,sec:sec});
    });

    Object.entries(groups).forEach(function(g){
      var catName=g[0], items=g[1];
      var catDiv=document.createElement('div');
      catDiv.style.cssText='margin-bottom:6px;';
      var catHdr=document.createElement('div');
      catHdr.style.cssText='font-size:10px;font-weight:800;letter-spacing:1.5px;color:var(--txt2);text-transform:uppercase;padding:16px 0 8px;border-bottom:1px solid var(--border);margin-bottom:10px;';
      catHdr.textContent=catName;
      catDiv.appendChild(catHdr);
      var grid=document.createElement('div');
      grid.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;';
      items.forEach(function(item){
        var key=item.key,sec=item.sec;
        var usedToDeposit=!!depositMethods[key];
        var override=allowedOverrides[key];
        var allowed=override==='allowed'?true:override==='blocked'?false:usedToDeposit;
        var card=document.createElement('div');
        card.style.cssText='background:var(--card);border:1.5px solid '+(allowed?'var(--border)':'rgba(231,76,60,0.3)')+';border-radius:12px;padding:14px 10px;text-align:center;cursor:'+(allowed?'pointer':'default')+';position:relative;transition:all 0.15s;';
        card.innerHTML='<div style="font-size:26px;margin-bottom:6px;">'+(sec.icon||'💸')+'</div>'+
          '<div style="font-size:12px;font-weight:700;color:'+(allowed?'var(--txt)':'var(--txt2)')+';">'+(sec.title||'')+'</div>'+
          (!allowed?'<div style="font-size:9px;color:#e74c3c;margin-top:4px;">🔒 Not unlocked</div>':'');
        if(allowed){
          card.addEventListener('click',function(){openWithdrawModal(key,sec);});
          card.addEventListener('mouseenter',function(){card.style.borderColor='var(--accent)';});
          card.addEventListener('mouseleave',function(){card.style.borderColor='var(--border)';});
        } else {
          card.title='Deposit via '+sec.title+' first, or contact support to unlock.';
        }
        grid.appendChild(card);
      });
      catDiv.appendChild(grid);
      wrap.appendChild(catDiv);
    });
  }).catch(function(e){wrap.innerHTML='<div style="color:#e74c3c;padding:1rem;">Error: '+e.message+'</div>';});
}
window.loadWithdrawSections=loadWithdrawSections;

// ── WITHDRAWAL MODAL ──
function openWithdrawModal(key,sec){
  var isCrypto=(sec.category||'').toLowerCase().includes('crypto');
  var minAmt=isCrypto?MIN_WD_CRYPTO:MIN_WD_EWALLET;
  var minLabel=isCrypto?'$'+MIN_WD_CRYPTO+' USD':'Rs. '+minAmt.toLocaleString('en-NP');

  var ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,10,30,0.85);z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px;';

  var box=document.createElement('div');
  box.style.cssText='background:var(--card);border-radius:16px;width:100%;max-width:480px;padding:20px;max-height:85vh;overflow-y:auto;';

  // Build fields HTML
  var fieldsHtml='';
  var fields=sec.fields||[];

  // Always add wallet number and name fields for ewallets
  if(!isCrypto){
    fieldsHtml+=
      '<div style="margin-bottom:10px;">'+
        '<label style="font-size:11px;font-weight:700;color:var(--txt2);display:block;margin-bottom:6px;">WALLET NUMBER</label>'+
        '<input type="text" id="wd-wallet-num" placeholder="Your wallet number / ID" style="width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:14px;outline:none;box-sizing:border-box;"/>'+
      '</div>'+
      '<div style="margin-bottom:10px;">'+
        '<label style="font-size:11px;font-weight:700;color:var(--txt2);display:block;margin-bottom:6px;">ACCOUNT NAME</label>'+
        '<input type="text" id="wd-wallet-name" placeholder="Your name on the wallet" style="width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:14px;outline:none;box-sizing:border-box;"/>'+
      '</div>';
  }

  // Crypto: wallet address + network
  if(isCrypto){
    fieldsHtml+=
      '<div style="margin-bottom:10px;">'+
        '<label style="font-size:11px;font-weight:700;color:var(--txt2);display:block;margin-bottom:6px;">WALLET ADDRESS</label>'+
        '<input type="text" id="wd-crypto-addr" placeholder="Your crypto wallet address" style="width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:14px;outline:none;box-sizing:border-box;"/>'+
      '</div>'+
      '<div style="margin-bottom:10px;">'+
        '<label style="font-size:11px;font-weight:700;color:var(--txt2);display:block;margin-bottom:6px;">NETWORK</label>'+
        '<input type="text" id="wd-crypto-net" placeholder="e.g. TRC20, ERC20, BEP20" style="width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:14px;outline:none;box-sizing:border-box;"/>'+
      '</div>';
  }

  // Extra custom fields from admin
  fields.forEach(function(f,fi){
    fieldsHtml+=
      '<div style="margin-bottom:10px;">'+
        '<label style="font-size:11px;font-weight:700;color:var(--txt2);display:block;margin-bottom:6px;">'+(f.label||'').toUpperCase()+'</label>'+
        '<input type="text" id="wd-custom-'+fi+'" placeholder="'+(f.placeholder||'')+'" style="width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:14px;outline:none;box-sizing:border-box;"/>'+
      '</div>';
  });

  box.innerHTML=
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">'+
      '<div style="font-size:18px;font-weight:800;color:var(--txt);">'+(sec.icon||'💸')+' '+sec.title+'</div>'+
      '<button id="wd-modal-close" style="width:32px;height:32px;border-radius:50%;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:16px;cursor:pointer;">✕</button>'+
    '</div>'+
    '<div style="background:rgba(246,201,0,0.08);border:1px solid rgba(246,201,0,0.2);border-radius:8px;padding:8px 12px;margin-bottom:14px;font-size:12px;color:#f6c90e;">Minimum withdrawal: <strong>'+minLabel+'</strong></div>'+
    '<div style="margin-bottom:10px;">'+
      '<label style="font-size:11px;font-weight:700;color:var(--txt2);display:block;margin-bottom:6px;">AMOUNT '+(isCrypto?'(USD)':'(Rs.)')+'</label>'+
      '<input type="number" id="wd-amt" placeholder="'+minLabel+'" style="width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:14px;outline:none;box-sizing:border-box;"/>'+
    '</div>'+
    fieldsHtml+
    '<div id="wd-err" style="display:none;color:#e74c3c;font-size:12px;margin-bottom:8px;padding:8px;background:rgba(231,76,60,0.08);border-radius:6px;"></div>'+
    '<div id="wd-ok" style="display:none;color:#4ade80;font-size:12px;margin-bottom:8px;padding:8px;background:rgba(74,222,128,0.08);border-radius:6px;"></div>'+
    '<button id="wd-submit-btn" style="width:100%;padding:14px;background:#f6c90e;color:#000;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;">Request Withdrawal</button>';

  ov.appendChild(box);
  document.body.appendChild(ov);

  document.getElementById('wd-modal-close').onclick=function(){ov.remove();};
  ov.onclick=function(e){if(e.target===ov)ov.remove();};
  // Wire copy buttons
  var cab=document.getElementById('dep-copy-addr-btn');
  if(cab){cab.onclick=function(){navigator.clipboard.writeText(sec.address||'').then(function(){cab.textContent='✓ Copied!';setTimeout(function(){cab.textContent='📋 Copy Address';},2000);});};}
  var cnb=document.getElementById('dep-copy-net-btn');
  if(cnb){cnb.onclick=function(){navigator.clipboard.writeText(sec.network||'').then(function(){alert('Network copied: '+sec.network);});};}
  var ceb=document.getElementById('dep-copy-ewallet-btn');
  if(ceb){ceb.onclick=function(){navigator.clipboard.writeText(sec.ewalletAccount||'').then(function(){alert('Account number copied!');});};}

  document.getElementById('wd-submit-btn').onclick=function(){
    var amt=parseFloat(document.getElementById('wd-amt').value)||0;
    var errEl=document.getElementById('wd-err');
    var okEl=document.getElementById('wd-ok');
    errEl.style.display='none'; okEl.style.display='none';

    if(amt<minAmt){errEl.textContent='Minimum withdrawal is '+minLabel+'.';errEl.style.display='block';return;}
    if(amt>bal()){errEl.textContent='Insufficient balance. Your balance: '+fmt(bal());errEl.style.display='block';return;}
    if(CD.wdBlocked){errEl.textContent='Withdrawal is blocked. Contact support.';errEl.style.display='block';return;}

    // Collect all fields
    var fieldData={};
    if(!isCrypto){
      var wNum=document.getElementById('wd-wallet-num');
      var wName=document.getElementById('wd-wallet-name');
      if(!wNum||!wNum.value.trim()){errEl.textContent='Please enter your wallet number.';errEl.style.display='block';return;}
      if(!wName||!wName.value.trim()){errEl.textContent='Please enter your account name.';errEl.style.display='block';return;}
      fieldData['Wallet Number']=wNum.value.trim();
      fieldData['Account Name']=wName.value.trim();
    }
    if(isCrypto){
      var wAddr=document.getElementById('wd-crypto-addr');
      var wNet=document.getElementById('wd-crypto-net');
      if(!wAddr||!wAddr.value.trim()){errEl.textContent='Please enter your wallet address.';errEl.style.display='block';return;}
      if(!wNet||!wNet.value.trim()){errEl.textContent='Please enter the network.';errEl.style.display='block';return;}
      fieldData['Wallet Address']=wAddr.value.trim();
      fieldData['Network']=wNet.value.trim();
    }
    fields.forEach(function(f,fi){
      var el=document.getElementById('wd-custom-'+fi);
      if(el)fieldData[f.label]=el.value.trim();
    });

    // Check KYC
    fbGet('/players/'+CK+'/kyc').then(function(kyc){
      if(!kyc||!kyc.name){errEl.textContent='Please complete KYC verification in Settings first.';errEl.style.display='block';return;}
      var btn=document.getElementById('wd-submit-btn');
      btn.textContent='Submitting...';btn.disabled=true;
      return fbPush('/withdrawalRequests',{
        playerKey:CK,playerUid:CD.uid,playerName:CD.username,
        sectionKey:key,section:sec.title,category:sec.category||'Other',
        amount:amt,fields:fieldData,status:'pending',time:new Date().toISOString()
      });
    }).then(function(res){
      if(!res)return;
      var okEl2=document.getElementById('wd-ok');
      var btn=document.getElementById('wd-submit-btn');
      if(okEl2){okEl2.textContent='Withdrawal request submitted! Admin will process it soon.';okEl2.style.display='block';}
      if(btn){btn.textContent='Submitted ✓';btn.disabled=true;}
      pushNotif('Withdrawal of '+fmt(amt)+' requested via '+sec.title+'.','withdrawal');
    }).catch(function(e){
      var errEl2=document.getElementById('wd-err');
      var btn=document.getElementById('wd-submit-btn');
      if(errEl2){errEl2.textContent='Error: '+e.message;errEl2.style.display='block';}
      if(btn){btn.textContent='Request Withdrawal';btn.disabled=false;}
    });
  };
}
window.openWithdrawModal=openWithdrawModal;

// ── AGENT WITHDRAWAL MODAL ──
function openAgentWithdrawalModal(){
  var ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,10,30,0.85);z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px;';
  var box=document.createElement('div');
  box.style.cssText='background:var(--card);border-radius:16px;width:100%;max-width:480px;padding:20px;max-height:85vh;overflow-y:auto;';

  box.innerHTML=
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">'+
      '<div style="font-size:18px;font-weight:800;color:var(--txt);">🤝 Agent Withdrawal</div>'+
      '<button id="agent-wd-close" style="width:32px;height:32px;border-radius:50%;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:16px;cursor:pointer;">✕</button>'+
    '</div>'+
    '<div style="background:rgba(246,201,0,0.08);border:1px solid rgba(246,201,0,0.2);border-radius:8px;padding:8px 12px;margin-bottom:16px;font-size:12px;color:#f6c90e;">'+
      'Minimum withdrawal: <strong>Rs. 500</strong> · Show code to agent'+
    '</div>'+

    // Step 1: Search City
    '<div id="agent-step1">'+
      '<div style="font-size:12px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Step 1 — Find Agent by City</div>'+
      '<div style="display:flex;gap:8px;margin-bottom:8px;">'+
        '<input type="text" id="agent-city-inp" placeholder="Type city name..." style="flex:1;padding:11px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:14px;outline:none;"/>'+
        '<button id="agent-city-search" style="padding:11px 16px;background:var(--accent);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;">Search</button>'+
      '</div>'+
      '<div id="agent-city-results" style="max-height:180px;overflow-y:auto;"></div>'+
    '</div>'+

    // Step 2: Select Agent
    '<div id="agent-step2" style="display:none;">'+
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">'+
        '<button id="agent-back-btn" style="padding:6px 12px;background:var(--bg2);border:1.5px solid var(--border);color:var(--txt);border-radius:8px;font-size:12px;cursor:pointer;">← Back</button>'+
        '<div style="font-size:12px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:0.5px;">Step 2 — Select Agent</div>'+
      '</div>'+
      '<div id="agent-list" style="max-height:220px;overflow-y:auto;margin-bottom:12px;"></div>'+
    '</div>'+

    // Step 3: Amount & Generate Code
    '<div id="agent-step3" style="display:none;">'+
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">'+
        '<button id="agent-back-btn2" style="padding:6px 12px;background:var(--bg2);border:1.5px solid var(--border);color:var(--txt);border-radius:8px;font-size:12px;cursor:pointer;">← Back</button>'+
        '<div style="font-size:12px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:0.5px;">Step 3 — Enter Amount</div>'+
      '</div>'+
      // Selected agent info
      '<div id="agent-selected-info" style="background:var(--bg2);border:1.5px solid var(--accent);border-radius:12px;padding:12px;margin-bottom:14px;display:flex;align-items:center;gap:12px;">'+
        '<div style="font-size:28px;">🧑‍💼</div>'+
        '<div id="agent-selected-text" style="font-size:13px;color:var(--txt);font-weight:700;"></div>'+
      '</div>'+
      '<div style="margin-bottom:12px;">'+
        '<label style="font-size:11px;font-weight:700;color:var(--txt2);display:block;margin-bottom:6px;">AMOUNT (Rs.)</label>'+
        '<input type="number" id="agent-wd-amt" placeholder="Minimum Rs. 500" style="width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:14px;outline:none;box-sizing:border-box;"/>'+
      '</div>'+
      '<div id="agent-wd-err" style="display:none;color:#e74c3c;font-size:12px;margin-bottom:8px;padding:8px;background:rgba(231,76,60,0.08);border-radius:6px;"></div>'+
      // Code display
      '<div id="agent-code-box" style="display:none;background:var(--bg2);border:2px solid var(--accent);border-radius:14px;padding:20px;text-align:center;margin-bottom:14px;">'+
        '<div style="font-size:11px;color:var(--txt2);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">Your Withdrawal Code</div>'+
        '<div id="agent-code-val" style="font-size:36px;font-weight:900;color:var(--accent);letter-spacing:8px;margin-bottom:8px;font-family:monospace;"></div>'+
        '<div id="agent-code-sub" style="font-size:13px;color:var(--txt2);margin-bottom:14px;"></div>'+
        '<div style="font-size:11px;color:var(--txt2);background:rgba(246,201,0,0.08);border:1px solid rgba(246,201,0,0.2);border-radius:8px;padding:8px;">Show this code to your agent to receive cash</div>'+
        '<button id="agent-copy-btn" style="margin-top:12px;padding:8px 20px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">Copy Code</button>'+
      '</div>'+
      '<button id="agent-gen-btn" style="width:100%;padding:14px;background:#f6c90e;color:#000;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;">Generate Withdrawal Code</button>'+
    '</div>';

  ov.appendChild(box);
  document.body.appendChild(ov);

  document.getElementById('agent-wd-close').onclick=function(){ov.remove();};
  ov.onclick=function(e){if(e.target===ov)ov.remove();};
  // Wire copy buttons
  var cab=document.getElementById('dep-copy-addr-btn');
  if(cab){cab.onclick=function(){navigator.clipboard.writeText(sec.address||'').then(function(){cab.textContent='✓ Copied!';setTimeout(function(){cab.textContent='📋 Copy Address';},2000);});};}
  var cnb=document.getElementById('dep-copy-net-btn');
  if(cnb){cnb.onclick=function(){navigator.clipboard.writeText(sec.network||'').then(function(){alert('Network copied: '+sec.network);});};}
  var ceb=document.getElementById('dep-copy-ewallet-btn');
  if(ceb){ceb.onclick=function(){navigator.clipboard.writeText(sec.ewalletAccount||'').then(function(){alert('Account number copied!');});};}

  var allAgents={}, selectedAgent=null;

  // Load all agents
  fbGet('/agents').then(function(data){allAgents=data||{};}).catch(function(){});

  // Live search as user types
  function doAgentSearch(){
    var q=(document.getElementById('agent-city-inp').value||'').trim().toLowerCase();
    var res=document.getElementById('agent-city-results');
    res.innerHTML='';
    if(q.length<1)return;

    // Collect all matching cities and streets (no agent names shown)
    var cityMatches={};
    Object.entries(allAgents).forEach(function(e){
      var id=e[0], a=e[1];
      var city=(a.city||'').toLowerCase();
      var street=(a.street||'').toLowerCase();
      if(city.indexOf(q)>=0||street.indexOf(q)>=0){
        var cityKey=a.city||'Unknown';
        if(!cityMatches[cityKey])cityMatches[cityKey]=[];
        cityMatches[cityKey].push({id:id,agent:a});
      }
    });

    if(!Object.keys(cityMatches).length){
      res.innerHTML='<div style="color:var(--txt2);font-size:13px;padding:10px;text-align:center;">No results for "'+q+'"</div>';
      return;
    }

    // Show city groups with streets (NO agent names)
    Object.entries(cityMatches).forEach(function(m){
      var city=m[0], agents=m[1];
      var grp=document.createElement('div');
      grp.style.cssText='margin-bottom:8px;';

      // City header
      var cityHdr=document.createElement('div');
      cityHdr.style.cssText='font-size:10px;font-weight:800;color:var(--txt2);text-transform:uppercase;letter-spacing:1px;padding:8px 4px 4px;';
      cityHdr.textContent=city;
      grp.appendChild(cityHdr);

      // Street cards (not showing agent name)
      agents.forEach(function(item){
        var a=item.agent;
        var card=document.createElement('div');
        card.style.cssText='background:var(--bg2);border:1.5px solid var(--border);border-radius:10px;padding:11px 14px;margin-bottom:6px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:border-color 0.15s;';
        card.innerHTML=
          '<div>'+
            '<div style="font-size:14px;font-weight:700;color:var(--txt);">'+city+'</div>'+
            '<div style="font-size:12px;color:var(--txt2);margin-top:2px;">'+(a.street||'Street not specified')+'</div>'+
          '</div>'+
          '<div style="color:var(--accent);font-size:13px;font-weight:700;">Select →</div>';
        card.addEventListener('mouseenter',function(){card.style.borderColor='var(--accent)';});
        card.addEventListener('mouseleave',function(){card.style.borderColor='var(--border)';});
        card.addEventListener('click',function(){
          // Select this location - store agent id internally but show only city+street to player
          selectedAgent={id:item.id,city:city,street:a.street||''};
          // Show in step3 - only city and street, no agent name
          document.getElementById('agent-selected-text').textContent=city+(a.street?' · '+a.street:'');
          document.getElementById('agent-city-results').innerHTML='';
          document.getElementById('agent-city-inp').value=city+(a.street?' — '+a.street:'');
          document.getElementById('agent-step1').style.display='none';
          document.getElementById('agent-step2').style.display='none';
          document.getElementById('agent-step3').style.display='block';
        });
        grp.appendChild(card);
      });
      res.appendChild(grp);
    });
  }

  // Search on button click
  document.getElementById('agent-city-search').onclick=doAgentSearch;
  // Live search as typing
  document.getElementById('agent-city-inp').oninput=doAgentSearch;
  // Also search on Enter
  document.getElementById('agent-city-inp').onkeydown=function(e){if(e.key==='Enter')doAgentSearch();};



  // Back buttons
  var backBtn=document.getElementById('agent-back-btn');
  if(backBtn){backBtn.onclick=function(){
    document.getElementById('agent-step2').style.display='none';
    document.getElementById('agent-step1').style.display='block';
  };}
  var backBtn2=document.getElementById('agent-back-btn2');
  if(backBtn2){backBtn2.onclick=function(){
    document.getElementById('agent-step3').style.display='none';
    document.getElementById('agent-step2').style.display='block';
  };}

  // Generate code
  document.getElementById('agent-gen-btn').onclick=function(){
    var amt=parseFloat(document.getElementById('agent-wd-amt').value)||0;
    var errEl=document.getElementById('agent-wd-err');
    errEl.style.display='none';
    if(!selectedAgent){errEl.textContent='Please select a location first.';errEl.style.display='block';return;}
    if(amt<500){errEl.textContent='Minimum withdrawal is Rs. 500.';errEl.style.display='block';return;}
    if(amt>bal()){errEl.textContent='Insufficient balance: '+fmt(bal());errEl.style.display='block';return;}
    if(CD.wdBlocked){errEl.textContent='Withdrawal blocked. Contact support.';errEl.style.display='block';return;}
    fbGet('/players/'+CK+'/kyc').then(function(kyc){
      if(!kyc||!kyc.name){errEl.textContent='Complete KYC in Settings first.';errEl.style.display='block';return;}
      // Generate 4-digit code
      var code='';var nums='0123456789';
      for(var i=0;i<4;i++)code+=nums[Math.floor(Math.random()*nums.length)];
      return fbPush('/withdrawalCodes',{
        code:code,amount:amt,
        playerKey:CK,playerUid:CD.uid,playerName:CD.username,
        agentId:selectedAgent.id,
        agentCity:selectedAgent.city,agentStreet:selectedAgent.street,
        status:'pending',createdAt:new Date().toISOString()
      }).then(function(){
        document.getElementById('agent-code-val').textContent=code;
        document.getElementById('agent-code-sub').textContent='Amount: Rs. '+amt.toLocaleString('en-NP')+' · '+selectedAgent.city+(selectedAgent.street?' · '+selectedAgent.street:'');
        document.getElementById('agent-code-box').style.display='block';
        document.getElementById('agent-gen-btn').style.display='none';
        document.getElementById('agent-wd-amt').disabled=true;
        var cpBtn=document.getElementById('agent-copy-btn');
        if(cpBtn){cpBtn.onclick=function(){navigator.clipboard.writeText(code).then(function(){alert('Code copied!');});};}
        pushNotif('Withdrawal code '+code+' generated for Rs. '+fmt(amt)+'.','withdrawal');
      });
    }).catch(function(e){errEl.textContent='Error: '+e.message;errEl.style.display='block';});
  };
}
window.openAgentWithdrawalModal=openAgentWithdrawalModal;
