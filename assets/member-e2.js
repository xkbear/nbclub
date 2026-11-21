// Only the authenticated ciphertext is published. No password or plaintext is persisted.
const sealed = {"salt":"veQtmmObtJvvPDIf/2qaqQ==","iv":"MP8xmcPqaRCtYXYp","ciphertext":"LodtcdC5eROKGlkhXlFG45Ws6tiNnwKT7J/XAxUSJMuQ+R2MYQT+z751U34ILvs6t6vUhtYrEs7UVQT3lnmnRTo4/Bnbh0U5PvicDu3Zg2ZgIR/FUkyJWUjPusSwDE/9e2j4Kha0QsJHx4NvaYEuHrAvzIuy0Oxnuap6vv2Kxqw85U/wAC8hF3DkzsPjmCQ5ATvBIV4MFbtP3iV0y0nq4aCjsY/B/zNsOpFGq9Z5Rnj0m478HhgKYd7srz0MjzIZKXKEy+Gz5ZrjY6GEdg0MSwF/vvpH1fIwxT6aURXUM1CQZ/WmlVu6kBmGMUntBsHxjUQ01DTxMbLrHEubzYVnh+GXXyFOW7wbNTmT5CtelzTJvJhcU8Foosf3URZaGV/0cdhLFjmXIBGiS2vrInDo8SH16YBOMli6oARYUBGtqM1vFVIDN/5l2DYs/x6iXUN0SJy6z9FJhbOmB6JVlHKtjG5brIM+Fq7iuZuB+x3FaWzmGSq+4QGVmD7lLdfeEPDCaQhOe+pE/9kM6bC/3RLK75HQVovJzNxM9WYhK5wi7k/5Um6jCpeW5tGhUop3DStFiwZ7Js7/ZZOQzm64jzqfkbMEA3+XRH57O+I/zgmw9JUOoOkyxgUcDno0G9aN7E2OkeqCBtwKQah2CwjpLOOv6t6+J9FuN76XbtCEWN0SOnOph7F+v+sJGXuE6wQDIM6ZQtRe8JOsemQL6rINutCDxTwxDeXbMn4w2XK5a09E38l+ubxNqORh0/W/PvXq/SgMrK3F6rt77Hbv+koDkMFYHn9oyNLTL4+EBw3B6q2z2HUmdHSXtftbNrICOelcLPuRLgD8DGi6wVTxXCXR8SS8CEB0mkk0y09ONJZL7PrbHS5dQYEZ+l+ZBJf80EEeUVKCr092/iqpXPBca4nw/GJ8LgAaqRHt7kk+hfStX/Z3Q7jRLODByaUMbmTZClTXM9YCfSMEPp3nEg2hNOwLLkN0boU1CWC+jPhxFtijWw+Zm4VFAypdBmwTT2eXAmr9JyW57CE7mwagaElEhta0H+5/owkFiQEK41LI9VLxVr272qWQqWxcZfg5Qjh1yrIGwsVvyaYHuKYEKEoxYw+/aB9MyfYfwmcRa97byL7Z6euOtpG+spHKHton2xv/E1huwfU0KmIGyrUK9aYihfP9J3GNyzRJ6tXJKA6K/zenkNyaRWUTsg1ncMBH1v45UACSb5MeUvNau/zXlib90YekGH6LFO2IQz8mKc00WOaPLl6gYjxSLnoURpKE/p2tSF192tkMQN4EOLDTa9Ydn8lT7MdyJoF6HWcjRliTh4Bam/zNG1E56ebX9ohqY67hWB2m66yoy9lPHuUmBnusgeNtUIX/RNP9Kjgnk5QSmakUlo0toU2hbocf5xCNVv1A2H5bOkZ/lFvAZpid0B+A+3GS7uwKjJw2DeRhyZWdN45pET2/NEqI8ZHze8ct2FS4KqOFJYoZ3duygU3MXH7sNKnyOa4WsTVIOTt2XTqtFCfoBk3oWbjURIkvu2ao+q0BxzDD2EPLlACJwTQMMk8GGgAzPesFXmwOYsr12tpOyi44vPL9Qeozzzpf+HMCi6Xci/jXDPsj0aE+7Vh7SMwdLJDOpefleUh+RYhsLEp5DSLlg4RSX1/69pGsmiUbttzaupFhH8C+103W913+RLTn9uR3jJPQ+OpON6Qw49wW4QkKWG2+b3R6gglfB6XoVDPL+Of7NKpcWjsAkuqShCeHFU7UYjROzQfa7Gheft2rYIDTCZX7WYJH7lMlNCgi"};
const bytes = value => Uint8Array.from(atob(value), char => char.charCodeAt(0));
const form = document.querySelector('[data-invite]');
const field = form.elements.passcode;
const english = document.documentElement.lang.startsWith('en');
const status = document.querySelector('#gate-status');
function directions(address, vicinity) {
  const make = (tag, text) => Object.assign(document.createElement(tag), {textContent:text});
  const google = new URL('https://www.google.com/maps/dir/');
  google.search = new URLSearchParams({api:'1', destination:address, travelmode:'driving', dir_action:'navigate'});
  const apple = new URL('https://maps.apple.com/');
  apple.search = new URLSearchParams({daddr:address, dirflg:'d'});
  const ios = /iPhone|iPod|iPad/.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
  const link = (url, label) => Object.assign(make('a', label), {href:url.href, target:'_blank', rel:'noopener noreferrer'});
  const section = make('section',''); section.className='farm-location';
  const heading = make('h2',english?'Getting to the farm':'怎么到绵羊谷农场');
  const map = make('div',''); map.className='farm-map';
  const frame = document.createElement('iframe');
  const preview = new URL('https://www.google.com/maps');
  preview.search = new URLSearchParams({q:vicinity,z:'16',output:'embed'});
  frame.title=english?'Farm location on Google Maps':'农场位置 · Google 地图';
  frame.referrerPolicy='no-referrer'; frame.tabIndex=-1; frame.src=preview.href;
  const open = link(ios?apple:google, '');
  open.append(make('span',english?'Directions to the farm ↗':'导航去农场 ↗'));
  map.append(frame,open);
  const actions=make('div',''); actions.className='farm-routes';
  actions.append(link(google,english?'Google Maps directions ↗':'Google 地图导航 ↗'),link(apple,english?'Apple Maps directions ↗':'苹果地图导航 ↗'));
  const note = make('p',english?'The pin marks the farm vicinity. Directions use the invitation address; please follow the member group’s instructions for the entrance.':'图钉标注农场附近位置。导航使用邀请地址，具体入口请按会员群指引。');
  section.append(heading,make('p',address),map,actions,note);
  return section;
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!crypto.subtle) { status.textContent = english ? 'Open this page in a secure browser.' : '请使用安全浏览器打开本页。'; return; }
  const submit = form.querySelector('button'); submit.disabled = true;
  try {
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(field.value), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({name:'PBKDF2', hash:'SHA-256', salt:bytes(sealed.salt), iterations:600000}, material, {name:'AES-GCM', length:256}, false, ['decrypt']);
    const clear = await crypto.subtle.decrypt({name:'AES-GCM', iv:bytes(sealed.iv)}, key, bytes(sealed.ciphertext));
    const output = document.querySelector('#invitation');
    const invitation = JSON.parse(new TextDecoder().decode(clear));
    output.append(directions(invitation.address, invitation.vicinity));
    for (const text of invitation[english ? 'en' : 'zh']) {
      const paragraph = document.createElement('p'); paragraph.textContent = text; output.append(paragraph);
    }
    field.value = ''; form.hidden = true; status.textContent = ''; output.hidden = false; output.focus();
  } catch {
    status.textContent = english ? 'Could not unlock. Check the member password and try again.' : '未能解锁，请核对会员密码后再试。';
    field.select();
  } finally { submit.disabled = false; }
});
addEventListener('pagehide', () => { form.reset(); form.hidden=false; status.textContent=''; const out=document.querySelector('#invitation'); out.hidden=true; out.replaceChildren(); });
