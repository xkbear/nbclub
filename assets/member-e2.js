// Only the authenticated ciphertext is published. No password or plaintext is persisted.
const sealed = {"salt":"mb0GoIvu9kG9OLIbqxPiuA==","iv":"5xP3dp30sIC+evzZ","ciphertext":"rFMLgVDCSHYedW/yOkMmSyM+WrsvOIf2kq21p1aYaLUAE9Y/TGfrhVbqw79whq5+YEnCwEmgQvc52l8rp1OPPfm00DbI6Anw4qHP7eng1H1e1YvLoKvQb8CR21DQheJC99v0RT270Da1bLZE6iz63IKH5u4ZLCfj4IhaigAQ+aPpcfbalmWLihSBMcBwKvofsfSzq4QsmcmSVp0H/u8YpBNm3wj58ypMm3u9vTiXc1nSofRdwLndyeYqHNrcVmw/AHug/DCHB/+rwi+SpsX81HHENy8zvobx8VBDbWF7Gy/bSOnDI8FWJTOu/vzar3asu+lHmtBRxE8z2xMsbmZUNeyhpbqobPHF+u7fwjxutzLS6IPHrvy+29aEf/c3ZknxZL+0XifhaTQRBNto5GCFc8nxWAV3VM4yWaK8XMteTVhPIqqfvrQaZ3Hxr9R30LNDPN1+1FcHVU9XRPVoH4dgxCkjROajykzpz5kdoP7NABL3+K/UpMPh8Y+LwA0aobDvRRP1QwMWcpPI/bwNQYHwH8jJXCQzqHKvmj+zc6zOqsHrJzoMhgzGoMDxYXkyW7R0R5gDaYLs/qirnIXETbk/0Nzmj2rxd6x2qkEQacePk92OjLLNWDMaHTl5n+ZeD5NdnfYiM1i2YRZyNAFNiKOPQZP+1MlvEZQsxFgEP9YYMdDkEDy80Igr/BlijgUI1DCLNHPPQqpV29zHYcRPcVKRpMdUZ2wT2C62YgEICfTKTkf8rHpLUZQ2hookKXnEumfzLQGz+A1W28e+hsk8dAWhCHDSHWbaKcDdEVDwV0uqtnvJp0uARsOP6X6456WWA2hfspk+vux6SPgw2cQXjOd9e8LQy5nTaZttlxmZ0+ttSLmaXqn3ERyfZnoJpcAWOepWtz0AW9EDJFowrCvv2XyyoI7zVKsQE49ujeAElB3hE//Dj2JKvJWjw//yvXX+X592Dft2vqAmIwLHjOxleLpdmpTL6Im7F7tU2UKF1htxeltTpK25n3iwwdKvhM1z1fTY4XfKdGsSfuF/ww/c0xKSwwpFYxrrZGmFkeOZyTaKX2uyaPzMmi+DQ24pQoKJ7u3URqKSbYokJDTdb75xnf7KWmwcWuEqVpOAgOKbhfz/wNf53wr5sucvN8S/6O1uFYFN8WS8mTp+hbNFNz9c+HjycxE6Lugl+x1mdpSIB4PoY8pohl5xpD1/tPHT6cpZ69YKT8COKvjwHR8QWIWza1xOTWH5IFROyEMwYJEDMBxc5KNer2UA2GSYrHCJvTXL0ddGj0K0pBe7O0RSPgNp/PBg+RxGOJHzbLVP4KYBceVg7Mr2UzPiqhNEMnRd+TxEEkVtB6xm9wQUsjb0LVOmAnSa7ofde64Q2n9gv4/c2IIHDFiLpPpFaSCf9VC/t1pNFiLjwiKL3S+dvmkwKbYemG7ksW7fIDdk3+cy2iRm19bcVK86hjKfuhM53LItiBMYthMCWss8ooi+Rs6CkkEfCj9kaIO9guePooS1w1t5iUHkgO0RPX6epD5QI9g2ubWvtbc3RD2dufUySZ7SDO8WAboIS3qPQPuJojtmupAuyRZBs62+5wckwjgj0nzxwZL+l1jhTbXvcpEctSjnkWdNCyUne9fMqR/IjxO3F/TmV4PeX1gCg3Qc8WvMOhrbFyTBIxMieHbSyVSn+eWvwczIsN8y8RQM2AKm0oaCPmKh6VEMWoJ1VM8xxtCkLvF+PUcZKihVkg3CIbI0FcUlzDk2hH9Qz7LULSJFzUsQA67NSLgrcBPyYpC/ExlQ"};
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
