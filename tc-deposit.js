// tc-deposit.js — Deposit & Withdrawal with dynamic sections

// ── TAB SWITCHING ──
var _depLoaded=false, _wdLoaded=false, _curDWTab='dep';

function switchDWTab(tab) {
  _curDWTab=tab;
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
// Force reload when tab opened from nav
function resetDWTabs(){_depLoaded=false;_wdLoaded=false;}
window.switchDWTab=switchDWTab;
window.resetDWTabs=resetDWTabs;

// ── CONTACT AGENTS ──
function loadContactAgents() {
  var wrap = $('contact-agents-wrap'); if(!wrap)return;
  wrap.innerHTML='<div style="color:var(--txt2);font-size:13px;padding:0.5rem 0;">Loading...</div>';
  fbGet('/adminContacts').then(function(data){
    if(!data||!Object.keys(data).length){
      wrap.innerHTML='<div style="color:var(--txt2);font-size:13px;padding:0.5rem 0;">No contacts yet.</div>'; return;
    }
    var entries=Object.entries(data).filter(function(e){return e[1].active!==false;});
    if(!entries.length){wrap.innerHTML='<div style="color:var(--txt2);font-size:13px;">No contacts available.</div>';return;}
    wrap.innerHTML='';
    entries.forEach(function(e){
      var c=e[1];
      var type=c.type||'telegram';
      var color=type==='whatsapp'?'#25d366':'#2aa3ef';
      var label=type==='whatsapp'?'WhatsApp':'Telegram';
      var icon=type==='whatsapp'?'W':'T';
      var raw=(c.link||'').trim();
      var url;
      if(!raw)url='#';
      else if(raw.indexOf('http')===0)url=raw;
      else if(raw.indexOf('t.me')===0)url='https://'+raw;
      else if(raw.charAt(0)==='@')url='https://t.me/'+raw.slice(1);
      else if(type==='whatsapp')url='https://wa.me/'+raw.replace(/[^0-9+]/g,'');
      else url='https://t.me/'+raw;
      var a=document.createElement('a');
      a.href=url; a.target='_blank'; a.rel='noopener noreferrer';
      a.style.cssText='display:flex;align-items:center;gap:12px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:8px;text-decoration:none;';
      a.innerHTML='<div style="width:40px;height:40px;border-radius:50%;background:'+color+';display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#fff;flex-shrink:0;">'+icon+'</div>'+
        '<div style="flex:1;"><div style="font-size:14px;font-weight:700;color:var(--txt);">'+(c.name||label)+'</div>'+
        '<div style="font-size:11px;color:'+color+';font-weight:600;margin-top:2px;">'+label+(c.username?' · @'+c.username:'')+'</div>'+
        '<div style="font-size:11px;color:var(--txt2);margin-top:2px;">'+(c.note||'Tap to contact for deposit')+'</div></div>'+
        '<div style="font-size:18px;color:var(--txt2);">›</div>';
      wrap.appendChild(a);
    });
  }).catch(function(){wrap.innerHTML='<div style="color:var(--txt2);font-size:13px;">Could not load.</div>';});
}

// ── LOAD DEPOSIT SECTIONS FROM FIREBASE ──
function loadDepositSections() {
  var wrap=$('deposit-sections-wrap'); if(!wrap)return;
  wrap.innerHTML='<div style="color:var(--txt2);font-size:13px;padding:1rem;text-align:center;">Loading deposit options...</div>';
  fbGet('/depositSections').then(function(data){
    wrap.innerHTML='';
    if(!data){
      wrap.innerHTML='<div style="color:var(--txt2);font-size:13px;padding:1rem;text-align:center;">No deposit options configured yet.</div>';
      return;
    }
    Object.entries(data).forEach(function(e){
      var key=e[0], sec=e[1];
      if(sec.active===false)return;
      renderDepositSection(wrap, key, sec);
    });
  }).catch(function(err){
    wrap.innerHTML='<div style="color:var(--red);padding:1rem;">Error loading: '+err.message+'</div>';
  });
}

function renderDepositSection(wrap, key, sec) {
  var div=document.createElement('div');
  div.className='dwsec';
  var icon=sec.icon||'💰';

  var html='<div class="dwh" style="display:flex;justify-content:space-between;align-items:center;">'+
    '<span>'+icon+' '+sec.title+'</span></div>'+
    '<div class="dwb">';

  // Description
  if(sec.description){
    html+='<div style="font-size:12px;color:var(--txt2);margin-bottom:10px;">'+sec.description+'</div>';
  }

  // QR Code image if set
  if(sec.qrImageUrl){
    html+='<div style="text-align:center;margin-bottom:12px;">'+
      '<img src="'+sec.qrImageUrl+'" alt="QR Code" style="max-width:180px;max-height:180px;border-radius:10px;border:2px solid var(--border);"/>'+
      '<div style="font-size:11px;color:var(--txt2);margin-top:6px;">Scan QR to pay</div>'+
      '</div>';
  }

  // Options (e.g. crypto addresses, bank details)
  if(sec.options && sec.options.length){
    html+='<div id="dep-opts-'+key+'" style="margin-bottom:10px;">';
    sec.options.forEach(function(opt, oi){
      html+='<div class="dopt" onclick="selectDepOpt(\''+key+'\','+oi+',\''+escAttr(JSON.stringify(opt))+'\')" style="margin-bottom:6px;">'+
        '<div>'+
          '<div class="don">'+opt.label+'</div>'+
          (opt.sub?'<div class="dnet">'+opt.sub+'</div>':'')+
        '</div>'+
        '<div style="color:var(--txt2);">›</div>'+
      '</div>';
    });
    html+='</div>';
    // Address display area
    html+='<div id="dep-addr-'+key+'" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px;">'+
      '<div style="font-size:10px;color:var(--txt2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;" id="dep-addr-lbl-'+key+'">Address</div>'+
      '<div style="font-size:13px;font-weight:700;color:var(--txt);word-break:break-all;margin-bottom:8px;" id="dep-addr-val-'+key+'"></div>'+
      '<button onclick="copyDepAddr(\''+key+'\')" style="padding:6px 14px;background:var(--accent);color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">Copy</button>'+
    '</div>';
  }

  // Direct link buttons (e.g. for eSewa, Khalti, bank links)
  if(sec.links && sec.links.length){
    sec.links.forEach(function(link){
      html+='<a href="'+link.url+'" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:10px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;text-decoration:none;">'+
        '<div style="width:36px;height:36px;border-radius:8px;background:'+(link.color||'var(--accent)')+';display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">'+(link.icon||'🔗')+'</div>'+
        '<div style="flex:1;"><div style="font-size:13px;font-weight:700;color:var(--txt);">'+link.label+'</div>'+
        (link.sub?'<div style="font-size:11px;color:var(--txt2);margin-top:2px;">'+link.sub+'</div>':'')+
        '</div><div style="font-size:18px;color:var(--txt2);">›</div></a>';
    });
  }

  // Submission form
  html+='<div id="dep-form-'+key+'" style="display:none;margin-top:8px;">'+
    '<div class="field"><label>Amount (Rs.)</label><input type="number" id="dep-amt-'+key+'" placeholder="Minimum Rs. 100"/></div>'+
    '<div class="field"><label>'+(sec.proofLabel||'Transaction ID / Proof')+'</label><input type="text" id="dep-proof-'+key+'" placeholder="'+(sec.proofPlaceholder||'Enter proof...')+'"/></div>'+
    '<div class="merr" id="dep-err-'+key+'"></div>'+
    '<div class="mok" id="dep-ok-'+key+'"></div>'+
    '<button class="mbtn" onclick="submitDepSection(\''+key+'\',\''+escAttr(sec.title)+'\')">Submit Deposit</button>'+
  '</div>';

  // Show form button if no options
  if(!sec.options || !sec.options.length){
    html+='<button onclick="showDepForm(\''+key+'\')" class="mbtn" style="margin-top:6px;">Make a Deposit</button>';
  }

  html+='</div>';
  div.innerHTML=html;
  wrap.appendChild(div);
}

function escAttr(s){ return (s||'').replace(/'/g,'&#39;').replace(/"/g,'&quot;'); }

window.selectDepOpt=function(key,oi,optJson){
  var opt=JSON.parse(optJson.replace(/&quot;/g,'"').replace(/&#39;/g,"'"));
  // Show address
  var addrDiv=$('dep-addr-'+key);
  var addrLbl=$('dep-addr-lbl-'+key);
  var addrVal=$('dep-addr-val-'+key);
  if(addrDiv){
    if(opt.address){
      addrDiv.style.display='block';
      if(addrLbl)addrLbl.textContent=opt.label+(opt.sub?' — '+opt.sub:'');
      if(addrVal)addrVal.textContent=opt.address;
    }
    $('dep-form-'+key).style.display='block';
  }
  // Highlight selected
  var opts=$('dep-opts-'+key);
  if(opts)opts.querySelectorAll('.dopt').forEach(function(d,i){
    d.style.borderColor=i===oi?'var(--accent)':'var(--border)';
    d.style.background=i===oi?'rgba(74,222,128,0.05)':'var(--bg2)';
  });
};
window.copyDepAddr=function(key){
  var v=$('dep-addr-val-'+key);
  if(v&&navigator.clipboard)navigator.clipboard.writeText(v.textContent).then(function(){alert('Copied!');});
};
window.showDepForm=function(key){ $('dep-form-'+key).style.display='block'; };
window.submitDepSection=function(key,title){
  var amt=parseInt($('dep-amt-'+key).value)||0;
  var proof=($('dep-proof-'+key).value||'').trim();
  var errEl=$('dep-err-'+key), okEl=$('dep-ok-'+key);
  if(errEl)errEl.style.display='none'; if(okEl)okEl.style.display='none';
  if(amt<100){if(errEl){errEl.textContent='Minimum Rs. 100';errEl.style.display='block';}return;}
  if(!proof){if(errEl){errEl.textContent='Please enter proof/transaction ID';errEl.style.display='block';}return;}
  var depData={
    playerKey:CK,playerUid:CD.uid,playerName:CD.username,
    sectionKey:key,section:title,amount:amt,proof:proof,
    status:'pending',time:new Date().toISOString()
  };
  fbPush('/playerCryptoDeposits',depData).then(function(){
    // Track which deposit method this player used
    // Store under /players/{key}/depositMethods/{sectionKey} = title
    return fbUp('/players/'+CK+'/depositMethods/'+key, {title:title,key:key,usedAt:new Date().toISOString()});
  }).then(function(){
    if(okEl){okEl.textContent='Submitted! Admin will verify and credit your balance.';okEl.style.display='block';}
    if($('dep-amt-'+key))$('dep-amt-'+key).value='';
    if($('dep-proof-'+key))$('dep-proof-'+key).value='';
    pushNotif('Deposit of '+fmt(amt)+' submitted via '+title+'. Awaiting admin verification.','deposit');
  }).catch(function(e){if(errEl){errEl.textContent='Error: '+e.message;errEl.style.display='block';}});
};

// ── LOAD WITHDRAWAL SECTIONS ──
var allAgents={};
fbGet('/agents').then(function(a){allAgents=a||{};}).catch(function(){});

function loadWithdrawSections(){
  var wrap=$('withdraw-sections-wrap'); if(!wrap)return;
  wrap.innerHTML='<div style="color:var(--txt2);font-size:13px;padding:1rem;text-align:center;">Loading withdrawal options...</div>';
  // Get player deposit methods + allowed overrides + withdrawal sections simultaneously
  Promise.all([
    fbGet('/withdrawalSections'),
    fbGet('/players/'+CK+'/depositMethods'),
    fbGet('/players/'+CK+'/allowedWdMethods')
  ]).then(function(results){
    var sections=results[0]||{};
    var depositMethods=results[1]||{};     // methods player deposited with
    var allowedOverrides=results[2]||{};   // admin unlocked extra methods
    wrap.innerHTML='';
    // Always show agent withdrawal
    renderAgentWithdrawal(wrap);
    if(Object.keys(sections).length===0){return;}
    Object.entries(sections).forEach(function(e){
      var key=e[0],sec=e[1];
      if(sec.active===false)return;
      // Check if player used this deposit method
      var usedToDeposit = !!depositMethods[key];
      // Check if admin explicitly allowed or blocked
      var adminOverride = allowedOverrides[key];
      var allowed;
      if(adminOverride==='allowed') allowed=true;
      else if(adminOverride==='blocked') allowed=false;
      else allowed=usedToDeposit; // default: only allow if deposited via this method
      if(allowed){
        renderWithdrawSection(wrap,key,sec,false);
      } else {
        // Show locked version
        renderWithdrawSection(wrap,key,sec,true);
      }
    });
  }).catch(function(){
    wrap.innerHTML='';
    renderAgentWithdrawal(wrap);
  });
}

function renderAgentWithdrawal(wrap){
  var div=document.createElement('div');
  div.className='dwsec';
  div.innerHTML='<div class="dwh">Agent Withdrawal</div>'+
    '<div class="dwb">'+
    '<div class="field"><label>Search City</label>'+
    '<input type="text" id="wci" placeholder="Type your city..." oninput="onCityInput()"/>'+
    '<div id="wcr" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;"></div></div>'+
    '<div class="field" id="wsf" style="display:none;"><label>Search Street</label>'+
    '<input type="text" id="wsi" placeholder="Type your street..." oninput="onStreetInput()"/>'+
    '<div id="wsr" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;"></div></div>'+
    '<div id="wcbox" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:1rem;">'+
    '<div style="font-size:13px;font-weight:700;color:var(--txt);" id="wcs"></div>'+
    '<div style="font-size:12px;color:var(--txt2);" id="wss"></div></div>'+
    '<div class="field"><label>Amount to Withdraw (Rs.)</label><input type="number" id="wamt" placeholder="Enter amount..."/></div>'+
    '<div class="merr" id="werr"></div>'+
    '<button class="mbtn orng" id="wgenbtn" onclick="genWdCode()">Generate Withdrawal Code</button>'+
    '<div class="wdcbox" id="wdcbox" style="display:none;">'+
    '<div class="wdclbl">Your Withdrawal Code</div>'+
    '<div class="wdcval" id="wdcval"></div>'+
    '<div class="wdchint">Show to agent for <strong id="wdcamt"></strong></div>'+
    '<button class="cpbtn" onclick="copyWdCode()">Copy Code</button><br/>'+
    '<button class="wdcanbtn" onclick="cancelWdCode()">Cancel</button></div>'+
    '</div>';
  wrap.appendChild(div);
}

function renderWithdrawSection(wrap,key,sec,locked){
  var div=document.createElement('div');
  div.className='dwsec';
  var hdr=document.createElement('div'); hdr.className='dwh';
  hdr.textContent=(sec.icon||'💸')+' '+sec.title+(locked?' (Locked)':'');
  div.appendChild(hdr);
  var body=document.createElement('div'); body.className='dwb';
  if(locked){
    // Show locked message
    body.innerHTML='<div style="background:rgba(231,76,60,0.08);border:1px solid rgba(231,76,60,0.2);border-radius:10px;padding:14px;text-align:center;">'+
      '<div style="font-size:28px;margin-bottom:8px;">🔒</div>'+
      '<div style="font-size:13px;font-weight:700;color:#e74c3c;margin-bottom:6px;">Method Locked</div>'+
      '<div style="font-size:12px;color:var(--txt2);">You have not deposited via this method. Contact customer support to unlock.</div>'+
      '</div>';
  } else {
    if(sec.description){var d=document.createElement('div');d.style.cssText='font-size:12px;color:var(--txt2);margin-bottom:10px;';d.textContent=sec.description;body.appendChild(d);}
    var amtDiv=document.createElement('div'); amtDiv.className='field';
    amtDiv.innerHTML='<label>Amount (Rs.)</label><input type="number" id="wd-amt-'+key+'" placeholder="Enter amount..."/>';
    body.appendChild(amtDiv);
    if(sec.fields){sec.fields.forEach(function(f,fi){
      var fd=document.createElement('div'); fd.className='field';
      fd.innerHTML='<label>'+f.label+'</label><input type="text" id="wd-f'+fi+'-'+key+'" placeholder="'+(f.placeholder||'')+'"/>';
      body.appendChild(fd);
    });}
    var errDiv=document.createElement('div'); errDiv.id='wd-err-'+key; errDiv.className='merr'; body.appendChild(errDiv);
    var okDiv=document.createElement('div'); okDiv.id='wd-ok-'+key; okDiv.className='mok'; body.appendChild(okDiv);
    var btn=document.createElement('button'); btn.className='mbtn orng'; btn.textContent='Request Withdrawal';
    btn.addEventListener('click',function(){submitWdSectionDom(key,sec);});
    body.appendChild(btn);
  }
  div.appendChild(body);
  wrap.appendChild(div);
}

function submitWdSectionDom(key,sec){
  var amt=parseInt($('wd-amt-'+key)?$('wd-amt-'+key).value:0)||0;
  var errEl=$('wd-err-'+key), okEl=$('wd-ok-'+key);
  if(errEl)errEl.style.display='none'; if(okEl)okEl.style.display='none';
  if(amt<1){if(errEl){errEl.textContent='Enter a valid amount.';errEl.style.display='block';}return;}
  if(amt>bal()){if(errEl){errEl.textContent='Insufficient balance: '+fmt(bal());errEl.style.display='block';}return;}
  var fields={};
  if(sec.fields){sec.fields.forEach(function(f,fi){
    var el=$('wd-f'+fi+'-'+key); if(el)fields[f.label]=el.value;
  });}
  fbGet('/players/'+CK+'/kyc').then(function(kyc){
    if(!kyc||!kyc.name){if(errEl){errEl.textContent='Complete KYC in Settings first.';errEl.style.display='block';}return;}
    if(CD.wdBlocked){if(errEl){errEl.textContent='Withdrawal blocked. Contact agent.';errEl.style.display='block';}return;}
    return fbPush('/withdrawalRequests',{
      playerKey:CK,playerUid:CD.uid,playerName:CD.username,
      sectionKey:key,section:sec.title,amount:amt,fields:fields,
      status:'pending',time:new Date().toISOString()
    }).then(function(){
      if(okEl){okEl.textContent='Request submitted! Admin will process it.';okEl.style.display='block';}
      pushNotif('Withdrawal of '+fmt(amt)+' requested via '+sec.title+'.','withdrawal');
    });
  }).catch(function(e){if(errEl){errEl.textContent='Error: '+e.message;errEl.style.display='block';}});
}

window.submitWdSection=function(key,secJson){
  var sec=JSON.parse(secJson.replace(/&quot;/g,'"').replace(/&#39;/g,"'"));
  var amt=parseInt($('wd-amt-'+key).value)||0;
  var errEl=$('wd-err-'+key), okEl=$('wd-ok-'+key);
  if(errEl)errEl.style.display='none'; if(okEl)okEl.style.display='none';
  if(amt<1){if(errEl){errEl.textContent='Enter a valid amount.';errEl.style.display='block';}return;}
  if(amt>bal()){if(errEl){errEl.textContent='Insufficient balance: '+fmt(bal());errEl.style.display='block';}return;}
  // Collect custom fields
  var fields={};
  if(sec.fields)sec.fields.forEach(function(f,fi){
    var val=$('wd-f'+fi+'-'+key);
    fields[f.label]=val?val.value:'';
  });
  fbGet('/players/'+CK+'/kyc').then(function(kyc){
    if(!kyc||!kyc.name){if(errEl){errEl.textContent='Complete KYC in Settings first.';errEl.style.display='block';}return;}
    if(CD.wdBlocked){if(errEl){errEl.textContent='Withdrawal blocked by security. Contact agent.';errEl.style.display='block';}return;}
    return fbPush('/withdrawalRequests',{
      playerKey:CK,playerUid:CD.uid,playerName:CD.username,
      section:sec.title,amount:amt,fields:fields,status:'pending',time:new Date().toISOString()
    }).then(function(){
      if(okEl){okEl.textContent='Withdrawal request submitted! Admin will process it.';okEl.style.display='block';}
      pushNotif('Withdrawal of '+fmt(amt)+' requested via '+sec.title+'.','withdrawal');
    });
  }).catch(function(e){if(errEl){errEl.textContent='Error: '+e.message;errEl.style.display='block';}});
};

// ── LOAD DEPOSIT (called on tab open) ──
var depCrypto=null;
function loadDeposit(){
  loadContactAgents();
  loadDepositSections();
}

// ── AGENT WITHDRAWAL HELPERS ──
var selAgent=null, pendingWdKey=null;
function onCityInput(){
  var q=($('wci')?$('wci').value:'').trim().toLowerCase();
  var res=$('wcr'); if(res)res.innerHTML='';
  var wsf=$('wsf'); if(wsf)wsf.style.display='none';
  var wcbox=$('wcbox'); if(wcbox)wcbox.style.display='none';
  selAgent=null;
  if(!q)return;
  var cities={};
  Object.values(allAgents).forEach(function(a){
    if((a.city||'').toLowerCase().indexOf(q)>=0)cities[a.city]=(cities[a.city]||[]).concat([a]);
  });
  Object.keys(cities).slice(0,8).forEach(function(city){
    var btn=document.createElement('button');
    btn.className='tag-btn'; btn.textContent=city;
    btn.addEventListener('click',function(){
      $('wci').value=city; if(res)res.innerHTML='';
      allAgents._ca=cities[city];
      $('wsi').value=''; var wsr=$('wsr'); if(wsr)wsr.innerHTML='';
      if(wsf)wsf.style.display='block';
      if(wcbox)wcbox.style.display='none';
      selAgent=null;
    });
    if(res)res.appendChild(btn);
  });
}
window.onCityInput=onCityInput;

function onStreetInput(){
  var q=($('wsi')?$('wsi').value:'').trim().toLowerCase();
  var res=$('wsr'); if(res)res.innerHTML='';
  var wcbox=$('wcbox'); if(wcbox)wcbox.style.display='none';
  selAgent=null;
  if(!q)return;
  var ca=allAgents._ca||Object.values(allAgents);
  ca.filter(function(a){return(a.street||'').toLowerCase().indexOf(q)>=0;})
    .slice(0,8).forEach(function(a){
      var btn=document.createElement('button');
      btn.className='tag-btn'; btn.style.cssText='background:var(--bg2);color:var(--accent);border:2px solid var(--border);';
      btn.textContent=a.street;
      btn.addEventListener('click',function(){
        $('wsi').value=a.street; if(res)res.innerHTML='';
        selAgent=a;
        if($('wcs'))$('wcs').textContent=a.city;
        if($('wss'))$('wss').textContent=a.street;
        if(wcbox)wcbox.style.display='block';
        $('wdcbox').style.display='none';
      });
      if(res)res.appendChild(btn);
    });
}
window.onStreetInput=onStreetInput;

function genWdCode(){
  hd('werr');
  if(!CD)return;
  fbGet('/players/'+CK+'/kyc').then(function(kyc){
    if(!kyc||!kyc.name){sh('werr','Complete KYC in Settings first.');return;}
    if(CD.wdBlocked){sh('werr','Withdrawal blocked by security. Contact agent.');return;}
    if(!selAgent){sh('werr','Select city and street first.');return;}
    var amt=parseInt($('wamt').value)||0;
    if(amt<1){sh('werr','Enter a valid amount.');return;}
    if(amt>bal()){sh('werr','Insufficient balance: '+fmt(bal()));return;}
    var chars='ABCDEFGHJKLMNPQRSTUVWXYZ';
    var code='';for(var i=0;i<4;i++)code+=chars[Math.floor(Math.random()*chars.length)];
    fbPush('/withdrawalCodes',{
      code:code,amount:amt,
      playerKey:CK,playerUid:CD.uid,playerName:CD.username,
      agentCity:selAgent.city,agentStreet:selAgent.street,agentId:selAgent.agentId,
      status:'pending',createdAt:new Date().toISOString()
    }).then(function(res){
      pendingWdKey=res.name;
      if($('wdcval'))$('wdcval').textContent=code;
      if($('wdcamt'))$('wdcamt').textContent=fmt(amt);
      if($('wdcbox'))$('wdcbox').style.display='block';
      pushNotif('Withdrawal of '+fmt(amt)+' requested. Code: '+code+'. Show agent in '+selAgent.city+'.','withdrawal');
    }).catch(function(e){sh('werr','Error: '+e.message);});
  }).catch(function(){sh('werr','Could not verify KYC. Try again.');});
}
window.genWdCode=genWdCode;

function copyWdCode(){
  var v=$('wdcval');
  if(v&&navigator.clipboard)navigator.clipboard.writeText(v.textContent).then(function(){alert('Code copied!');});
}
window.copyWdCode=copyWdCode;

function cancelWdCode(){
  if(!pendingWdKey||!confirm('Cancel this withdrawal?'))return;
  fbUp('/withdrawalCodes/'+pendingWdKey,{status:'cancelled'}).then(function(){
    $('wdcbox').style.display='none'; pendingWdKey=null;
  });
}
window.cancelWdCode=cancelWdCode;

// ── LEGACY submitDeposit (crypto) ──
function submitDeposit(){
  if(!depCrypto){sh('derr','Select a payment method.');return;}
  var amt=parseInt($('damt').value)||0;
  var hash=($('dtxh').value||'').trim();
  if(amt<100){sh('derr','Minimum Rs.100.');return;}
  if(!hash){sh('derr','Enter transaction hash.');return;}
  $('dsubmit').textContent='Submitting...'; $('dsubmit').disabled=true;
  fbPush('/playerCryptoDeposits',{
    playerKey:CK,playerUid:CD.uid,playerName:CD.username,
    coin:depCrypto.coin,symbol:depCrypto.symbol,network:depCrypto.network,
    amount:amt,txHash:hash,status:'pending',time:new Date().toISOString()
  }).then(function(){
    sh('dok','Submitted! Admin will verify and credit your balance.');
    $('damt').value=''; $('dtxh').value='';
    $('dsubmit').textContent='Submit Deposit'; $('dsubmit').disabled=false;
  }).catch(function(e){sh('derr','Error: '+e.message);$('dsubmit').textContent='Submit Deposit';$('dsubmit').disabled=false;});
}

window.loadContactAgents = loadContactAgents;
window.loadDepositSections = loadDepositSections;
window.loadWithdrawSections = loadWithdrawSections;
window.loadDeposit = function(){ loadContactAgents(); loadDepositSections(); };
