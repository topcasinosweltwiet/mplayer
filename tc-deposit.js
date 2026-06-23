// tc-deposit.js — Deposit & Withdrawal

var _depLoaded=false, _wdLoaded=false;
var MIN_WD_EWALLET = 5000;   // Rs. 5000 min for eWallets
var MIN_WD_CRYPTO  = 30;     // $30 min for crypto
var MIN_WD_AGENT   = 500;    // Rs. 500 min for agent

// ── TAB SWITCHING ──
function switchDWTab(tab){
  var depEl=$('dw-dep'), wdEl=$('dw-wd');
  var depBtn=$('dw-btn-dep'), wdBtn=$('dw-btn-wd');
  if(tab==='dep'){
    if(depEl)depEl.style.display='';
    if(wdEl)wdEl.style.display='none';
    if(depBtn){depBtn.style.background='var(--accent)';depBtn.style.color='#fff';depBtn.style.borderColor='var(--accent)';}
    if(wdBtn){wdBtn.style.background='var(--bg2)';wdBtn.style.color='var(--txt2)';wdBtn.style.borderColor='var(--border)';}
    if(!_depLoaded){_depLoaded=true;loadContactAgents();loadDepositSections();}
  } else {
    if(depEl)depEl.style.display='none';
    if(wdEl)wdEl.style.display='';
    if(depBtn){depBtn.style.background='var(--bg2)';depBtn.style.color='var(--txt2)';depBtn.style.borderColor='var(--border)';}
    if(wdBtn){wdBtn.style.background='var(--accent)';wdBtn.style.color='#fff';wdBtn.style.borderColor='var(--accent)';}
    if(!_wdLoaded){_wdLoaded=true;loadWithdrawSections();}
  }
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
  // Build modal
  var ov=document.createElement('div');
  ov.id='dep-modal-ov';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,10,30,0.85);z-index:9000;display:flex;align-items:flex-end;justify-content:center;';
  var box=document.createElement('div');
  box.style.cssText='background:var(--card);border-radius:20px 20px 0 0;width:100%;max-width:560px;padding:20px;max-height:90vh;overflow-y:auto;';

  var isCrypto = (sec.category||'').toLowerCase().includes('crypto');
  var minWd = isCrypto ? MIN_WD_CRYPTO : MIN_WD_EWALLET;
  var minLabel = isCrypto ? '$'+MIN_WD_CRYPTO+' USD' : 'Rs. '+MIN_WD_EWALLET.toLocaleString('en-NP');

  box.innerHTML=
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">'+
      '<div style="font-size:18px;font-weight:800;color:var(--txt);">'+(sec.icon||'💰')+' '+(sec.title||'Deposit')+'</div>'+
      '<button id="dep-modal-close" style="width:32px;height:32px;border-radius:50%;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:16px;cursor:pointer;">✕</button>'+
    '</div>'+
    // QR if set
    (sec.qrImageUrl?'<div style="text-align:center;margin-bottom:14px;"><img src="'+sec.qrImageUrl+'" style="max-width:160px;border-radius:10px;border:2px solid var(--border);"/><div style="font-size:11px;color:var(--txt2);margin-top:6px;">Scan to pay</div></div>':'')+
    // Description
    (sec.description?'<div style="font-size:12px;color:var(--txt2);margin-bottom:12px;background:var(--bg2);border-radius:8px;padding:8px 12px;">'+sec.description+'</div>':'')+
    // Options (addresses)
    (sec.options&&sec.options.length?
      '<div style="margin-bottom:12px;">'+
      sec.options.map(function(opt,oi){
        return '<div class="dep-opt-card" data-addr="'+(opt.address||'')+'" data-label="'+(opt.label||'')+'" style="background:var(--bg2);border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:6px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">'+
          '<div><div style="font-size:13px;font-weight:700;color:var(--txt);">'+(opt.label||'')+'</div>'+
          (opt.sub?'<div style="font-size:11px;color:var(--txt2);">'+(opt.sub||'')+'</div>':'')+
          '</div><div style="font-size:11px;color:var(--accent);">Select</div></div>';
      }).join('')+
      '</div>':'')+ 
    // Address display box
    '<div id="dep-addr-box" style="display:none;background:var(--bg2);border:1.5px solid var(--accent);border-radius:10px;padding:12px;margin-bottom:12px;">'+
      '<div style="font-size:10px;color:var(--txt2);margin-bottom:4px;" id="dep-addr-lbl">Address</div>'+
      '<div style="font-size:12px;font-weight:700;color:var(--txt);word-break:break-all;margin-bottom:8px;" id="dep-addr-val"></div>'+
      '<button onclick="navigator.clipboard.writeText(document.getElementById(\'dep-addr-val\').textContent).then(function(){alert(\'Copied!\');})" style="padding:5px 12px;background:var(--accent);color:#fff;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;">Copy Address</button>'+
    '</div>'+
    // Link buttons
    (sec.links&&sec.links.length?
      sec.links.map(function(lnk){
        return '<a href="'+(lnk.url||'#')+'" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:10px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;text-decoration:none;">'+
          '<div style="font-size:22px;">'+(lnk.icon||'🔗')+'</div>'+
          '<div style="flex:1;"><div style="font-size:13px;font-weight:700;color:var(--txt);">'+(lnk.label||'')+'</div>'+
          (lnk.sub?'<div style="font-size:11px;color:var(--txt2);">'+(lnk.sub||'')+'</div>':'')+
          '</div><div style="color:var(--txt2);">›</div></a>';
      }).join(''):'')+ 
    // Amount field
    '<div style="margin-bottom:10px;">'+
      '<label style="font-size:11px;font-weight:700;color:var(--txt2);display:block;margin-bottom:6px;">AMOUNT</label>'+
      '<input type="number" id="dep-amt" placeholder="Enter amount..." style="width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:14px;outline:none;box-sizing:border-box;"/>'+
    '</div>'+
    // Proof field
    '<div style="margin-bottom:14px;">'+
      '<label style="font-size:11px;font-weight:700;color:var(--txt2);display:block;margin-bottom:6px;">'+(sec.proofLabel||'TRANSACTION ID / PROOF').toUpperCase()+'</label>'+
      '<input type="text" id="dep-proof" placeholder="'+(sec.proofPlaceholder||'Enter proof or TX hash')+'" style="width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:14px;outline:none;box-sizing:border-box;"/>'+
    '</div>'+
    '<div id="dep-err" style="display:none;color:#e74c3c;font-size:12px;margin-bottom:8px;padding:8px;background:rgba(231,76,60,0.08);border-radius:6px;"></div>'+
    '<div id="dep-ok" style="display:none;color:#4ade80;font-size:12px;margin-bottom:8px;padding:8px;background:rgba(74,222,128,0.08);border-radius:6px;"></div>'+
    '<button id="dep-submit-btn" style="width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;">Submit Deposit Request</button>';

  ov.appendChild(box);
  document.body.appendChild(ov);

  // Wire close
  document.getElementById('dep-modal-close').onclick=function(){
    var o=document.getElementById('dep-modal-ov');if(o)o.remove();
  };
  ov.onclick=function(e){if(e.target===ov){ov.remove();}};

  // Wire address options
  box.querySelectorAll('.dep-opt-card').forEach(function(card){
    card.onclick=function(){
      box.querySelectorAll('.dep-opt-card').forEach(function(c){c.style.borderColor='var(--border)';});
      card.style.borderColor='var(--accent)';
      var addrBox=document.getElementById('dep-addr-box');
      var addrVal=document.getElementById('dep-addr-val');
      var addrLbl=document.getElementById('dep-addr-lbl');
      if(addrBox&&addrVal){
        addrBox.style.display='block';
        addrVal.textContent=card.dataset.addr||'';
        if(addrLbl)addrLbl.textContent=card.dataset.label||'Address';
      }
    };
  });

  // Wire submit
  document.getElementById('dep-submit-btn').onclick=function(){
    var amt=parseFloat(document.getElementById('dep-amt').value)||0;
    var proof=(document.getElementById('dep-proof').value||'').trim();
    var errEl=document.getElementById('dep-err');
    var okEl=document.getElementById('dep-ok');
    errEl.style.display='none'; okEl.style.display='none';
    if(amt<1){errEl.textContent='Please enter a valid amount.';errEl.style.display='block';return;}
    if(!proof){errEl.textContent='Please enter proof / transaction ID.';errEl.style.display='block';return;}
    var btn=document.getElementById('dep-submit-btn');
    btn.textContent='Submitting...';btn.disabled=true;
    fbPush('/playerCryptoDeposits',{
      playerKey:CK,playerUid:CD.uid,playerName:CD.username,
      sectionKey:key,section:sec.title,category:sec.category||'Other',
      amount:amt,proof:proof,status:'pending',time:new Date().toISOString()
    }).then(function(){
      // Track deposit method
      return fbUp('/players/'+CK+'/depositMethods/'+key,{title:sec.title,category:sec.category||'Other',key:key,usedAt:new Date().toISOString()});
    }).then(function(){
      okEl.textContent='Submitted! Admin will verify and credit your balance.';
      okEl.style.display='block';
      btn.textContent='Submitted ✓';
      pushNotif('Deposit of '+fmt(amt)+' submitted via '+sec.title+'. Awaiting verification.','deposit');
    }).catch(function(e){errEl.textContent='Error: '+e.message;errEl.style.display='block';btn.textContent='Submit Deposit Request';btn.disabled=false;});
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
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,10,30,0.85);z-index:9000;display:flex;align-items:flex-end;justify-content:center;';

  var box=document.createElement('div');
  box.style.cssText='background:var(--card);border-radius:20px 20px 0 0;width:100%;max-width:560px;padding:20px;max-height:90vh;overflow-y:auto;';

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
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,10,30,0.85);z-index:9000;display:flex;align-items:flex-end;justify-content:center;';
  var box=document.createElement('div');
  box.style.cssText='background:var(--card);border-radius:20px 20px 0 0;width:100%;max-width:560px;padding:20px;max-height:90vh;overflow-y:auto;';
  box.innerHTML=
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">'+
      '<div style="font-size:18px;font-weight:800;color:var(--txt);">🤝 Agent Withdrawal</div>'+
      '<button id="agent-wd-close" style="width:32px;height:32px;border-radius:50%;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:16px;cursor:pointer;">✕</button>'+
    '</div>'+
    '<div style="background:rgba(246,201,0,0.08);border:1px solid rgba(246,201,0,0.2);border-radius:8px;padding:8px 12px;margin-bottom:14px;font-size:12px;color:#f6c90e;">Minimum withdrawal: <strong>Rs. '+MIN_WD_AGENT.toLocaleString('en-NP')+'</strong></div>'+
    '<div style="margin-bottom:10px;">'+
      '<label style="font-size:11px;font-weight:700;color:var(--txt2);display:block;margin-bottom:6px;">AMOUNT (Rs.)</label>'+
      '<input type="number" id="agent-wd-amt" placeholder="Minimum Rs. '+MIN_WD_AGENT+'" style="width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg2);color:var(--txt);font-size:14px;outline:none;box-sizing:border-box;"/>'+
    '</div>'+
    '<div id="agent-wd-err" style="display:none;color:#e74c3c;font-size:12px;margin-bottom:8px;padding:8px;background:rgba(231,76,60,0.08);border-radius:6px;"></div>'+
    '<div id="agent-wd-code-box" style="display:none;background:var(--bg2);border:2px solid var(--accent);border-radius:12px;padding:16px;text-align:center;margin-bottom:14px;">'+
      '<div style="font-size:11px;color:var(--txt2);margin-bottom:6px;">Your Withdrawal Code</div>'+
      '<div id="agent-wd-code" style="font-size:32px;font-weight:900;color:var(--accent);letter-spacing:6px;margin-bottom:8px;"></div>'+
      '<div id="agent-wd-code-amt" style="font-size:13px;color:var(--txt2);margin-bottom:10px;"></div>'+
      '<button onclick="var v=document.getElementById(\'agent-wd-code\');if(v)navigator.clipboard.writeText(v.textContent).then(function(){alert(\'Code copied!\');})" style="padding:7px 18px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">Copy Code</button>'+
    '</div>'+
    '<button id="agent-wd-btn" style="width:100%;padding:14px;background:#f6c90e;color:#000;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;">Generate Withdrawal Code</button>';

  ov.appendChild(box);
  document.body.appendChild(ov);
  document.getElementById('agent-wd-close').onclick=function(){ov.remove();};
  ov.onclick=function(e){if(e.target===ov)ov.remove();};

  document.getElementById('agent-wd-btn').onclick=function(){
    var amt=parseFloat(document.getElementById('agent-wd-amt').value)||0;
    var errEl=document.getElementById('agent-wd-err');
    errEl.style.display='none';
    if(amt<MIN_WD_AGENT){errEl.textContent='Minimum withdrawal is Rs. '+MIN_WD_AGENT.toLocaleString('en-NP')+'.';errEl.style.display='block';return;}
    if(amt>bal()){errEl.textContent='Insufficient balance.';errEl.style.display='block';return;}
    if(CD.wdBlocked){errEl.textContent='Withdrawal blocked. Contact support.';errEl.style.display='block';return;}
    fbGet('/players/'+CK+'/kyc').then(function(kyc){
      if(!kyc||!kyc.name){errEl.textContent='Complete KYC in Settings first.';errEl.style.display='block';return;}
      var code='';var chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      for(var i=0;i<6;i++)code+=chars[Math.floor(Math.random()*chars.length)];
      return fbPush('/withdrawalCodes',{
        code:code,amount:amt,playerKey:CK,playerUid:CD.uid,playerName:CD.username,
        status:'pending',createdAt:new Date().toISOString()
      }).then(function(){
        document.getElementById('agent-wd-code').textContent=code;
        document.getElementById('agent-wd-code-amt').textContent='Show this code to agent for Rs. '+amt.toLocaleString('en-NP');
        document.getElementById('agent-wd-code-box').style.display='block';
        document.getElementById('agent-wd-btn').style.display='none';
        pushNotif('Withdrawal code '+code+' generated for Rs. '+fmt(amt)+'.','withdrawal');
      });
    }).catch(function(e){errEl.textContent='Error: '+e.message;errEl.style.display='block';});
  };
}
window.openAgentWithdrawalModal=openAgentWithdrawalModal;

window.loadContactAgents=loadContactAgents;
window.loadDepositSections=loadDepositSections;
window.loadWithdrawSections=loadWithdrawSections;
