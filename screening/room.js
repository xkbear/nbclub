'use strict';
const $ = s => document.querySelector(s);
const token = location.hash.slice(1);
const keyOK = /^[A-Za-z0-9_-]{43}$/.test(token);
let films = [], active = 0, generation = 0;
const bytes = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const number = i => String(i + 1).padStart(2, '0');
function list() {
  const query = $('#search').value.trim().toLowerCase(), items = [];
  films.forEach(({name},i) => {
    const title = number(i) + ' · ' + name;
    if (!title.toLowerCase().includes(query)) return;
    const b = document.createElement('button');
    b.textContent = title; b.setAttribute('aria-current', String(i === active));
    b.onclick = () => { select(i); $('#title').focus(); }; items.push(b);
  });
  $('#list').replaceChildren(...items);
  $('#total').textContent = items.length ? '显示 ' + items.length + ' / ' + films.length + ' 段' : '没有匹配的短片';
}
function select(i) {
  active = i; const f = films[i], url = 'https://drive.google.com/file/d/' + encodeURIComponent(f.id);
  const frame = document.createElement('iframe');
  frame.title = f.name; frame.allowFullscreen = true; frame.allow = 'fullscreen; encrypted-media'; frame.referrerPolicy = 'no-referrer'; frame.src = url+'/preview';
  $('#screen').replaceChildren(frame); $('#drive').href = url+'/view';
  $('#title').textContent = f.name; $('#counter').textContent = 'FILM ' + number(i) + ' / ' + films.length;
  $('#prev').disabled = !i; $('#next').disabled = i === films.length-1; list();
}
function lock() {
  generation++; films = []; $('#screen').replaceChildren(); $('#list').replaceChildren(); $('#drive').removeAttribute('href');
  for (const id of ['#title','#total','#counter','#message']) $(id).textContent='';
  $('#pass').value = ''; $('#search').value = ''; $('#room').hidden = $('#lock').hidden = true; $('#gate').hidden = false;
  $('form button').disabled = !keyOK;
  if (!keyOK) $('#message').textContent = '链接不完整，请使用筹备组收到的完整专用链接。';
}
lock(); $('#lock').onclick = () => {lock(); $('#pass').focus();}; addEventListener('pagehide', lock);
$('#prev').onclick = () => select(active-1); $('#next').onclick = () => select(active+1); $('#search').oninput = list;
$('form').onsubmit = async e => {
  e.preventDefault(); if (!keyOK) return; const g = generation;
  $('form button').disabled = true; $('#message').textContent = '正在解锁…';
  let stage = 'fetch';
  try {
    const res = await fetch('collection.json',{cache:'no-store'}); if (!res.ok) throw Error();
    const [salt,iv,cipher] = (await res.json()).map(bytes); stage = 'unlock';
    const material = await crypto.subtle.importKey('raw',new TextEncoder().encode(token+':'+$('#pass').value),'PBKDF2',false,['deriveKey']);
    const key = await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',iterations:600000,salt},material,{name:'AES-GCM',length:256},false,['decrypt']);
    const data = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},key,cipher)));
    if (g !== generation) return; films = data; $('#pass').value = ''; $('#message').textContent = '';
    $('#gate').hidden = true; $('#room').hidden = $('#lock').hidden = false; select(0); $('#title').focus();
  } catch { if (g === generation) $('#message').textContent = stage === 'fetch' ? '片单暂未载入，请检查网络后重试。' : '无法解锁，请核对专用链接和审片密码。'; }
  finally {if (g === generation) $('form button').disabled = false;}
};
