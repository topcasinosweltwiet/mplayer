// tc-firebase.js — Firebase helpers
'use strict';
var FB = 'https://topcasinos-b75b3-default-rtdb.asia-southeast1.firebasedatabase.app';
function fbGet(p){return fetch(FB+p+'.json').then(function(r){if(!r.ok)throw new Error(r.status);return r.json();});}
function fbSet(p,d){return fetch(FB+p+'.json',{method:'PUT',body:JSON.stringify(d)}).then(function(r){return r.json();});}
function fbUp(p,d){return fetch(FB+p+'.json',{method:'PATCH',body:JSON.stringify(d)}).then(function(r){return r.json();});}
function fbPush(p,d){return fetch(FB+p+'.json',{method:'POST',body:JSON.stringify(d)}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();});}
function fbDel(p){return fetch(FB+p+'.json',{method:'DELETE'}).then(function(r){return r.json();});}
