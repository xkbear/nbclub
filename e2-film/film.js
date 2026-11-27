'use strict';
const en=new URLSearchParams(location.search).get('lang')==='en';
const say=(zh,eng)=>en?eng:zh;
const $=id=>document.getElementById(id);
if(en){document.documentElement.lang='en-NZ';document.title='Fourteen Gatherings · E2 Member Cinema | NewBee AI Club';$('back').href='../event-2026-11-28-e2-en.html#recap-film';$('language').href='./';}
const gate=$('gate'), pass=$('pass'), unlock=$('unlock'), statusLine=$('status'), room=$('room'), film=$('film');
const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
let blobURL,request,epoch=0;
function lock(){
  epoch++; request?.abort();film.pause();film.removeAttribute('src');film.load();
  if(blobURL)URL.revokeObjectURL(blobURL);blobURL=null;
  room.hidden=true;gate.hidden=false;pass.value='';statusLine.textContent='';
  unlock.disabled=!globalThis.crypto?.subtle;
  if(unlock.disabled)statusLine.textContent=say('请使用较新的浏览器并通过 HTTPS 打开。','Open this page over HTTPS in an up-to-date browser.');
}
lock();$('lock').onclick=()=>{lock();pass.focus();};addEventListener('pagehide',lock);
film.addEventListener('error',()=>{if(blobURL) statusLine.textContent=say('当前浏览器无法播放此影片，请换用 Safari 或 Chrome。','Please try Safari or Chrome to play this film.');});
gate.addEventListener('submit',async e=>{
  e.preventDefault();if(unlock.disabled)return;unlock.disabled=true;const ticket=++epoch;
  const ctrl=new AbortController();request=ctrl;const options={signal:ctrl.signal};
  let phase='load';statusLine.textContent=say('正在核对密码…','Checking password…');
  try{
    const res=await fetch('release.json',options);if(!res.ok)throw Error();const meta=await res.json();
    const api=crypto.subtle;
    const material=await api.importKey('raw',new TextEncoder().encode(pass.value),'PBKDF2',false,['deriveKey']);
    const key=await api.deriveKey({name:'PBKDF2',hash:'SHA-256',iterations:meta.rounds,salt:bytes(meta.salt)},material,{name:'AES-GCM',length:256},false,['decrypt']);
    phase='password';
    await api.decrypt({name:'AES-GCM',iv:bytes(meta.checkIV)},key,bytes(meta.check));
    if(ticket!==epoch)return;phase='load';pass.value='';
    statusLine.textContent=say('密码正确，正在载入 1080p 影片…','Unlocked. Loading the 1080p film…');
    const media=await fetch(meta.file,options);if(!media.ok)throw Error();
    const clear=await api.decrypt({name:'AES-GCM',iv:bytes(meta.mediaIV)},key,await media.arrayBuffer());
    if(ticket!==epoch)return;
    blobURL=URL.createObjectURL(new Blob([clear],{type:'video/mp4'}));film.src=blobURL;
    gate.hidden=true;room.hidden=false;film.focus();statusLine.textContent=say('已解锁，点击播放即可观看。','Unlocked. Press play to watch.');
  }catch{if(ticket!==epoch)return;statusLine.textContent=phase==='password'?say('影片密码不正确，请重试。','Incorrect film password. Please try again.'):say('载入失败，请检查网络后再试。','Could not load the film. Check your connection and retry.');pass.focus();pass.select();}
  finally{if(ticket===epoch)unlock.disabled=false;}
});
