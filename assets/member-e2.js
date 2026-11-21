// Only the authenticated ciphertext is published. No password or plaintext is persisted.
const sealed = {"salt":"qmMH7gYO911GVybHInYZcg==","iv":"x8m1ifgMGBAgZRhK","ciphertext":"RciTPVkqlHXLeo68q9++LqHF0Dkmp6u8+t02dyuMyK6um81ZqtGLv56L40Fj6x/9tNp/wLQU+mSBI3BnC8GJhAPknFbHGqAQq6ur8vHD5lPdDfRkndd+erx2+erH9qJmMaLIZ8RIcSSH8qJnvfM8Ax600JBpZdFqthd+heZDbkY3enKeq9opMPdrrVx+uZXAXNcdCT5/qQZz+LzzLlziD3ZXmXjlV00YtIdgmnTl/ZUnuZNoK+6b7VuujA/3uleBXgHNzWu+Es+WIBjU0IfSIjZTqbpMf3uPmbV3zzwolc4hvclq5LHrO4MU2VEVnc0PyOFz0qGcJTXLopedBfOElf5ig86fwheQpFWHuwjxny6Hm/xYi3PF8TVpaWmIJIID4Kx38upDvuqfEvhWy1em7D/2cQI4fw4DmXlDd1RWahoaoRhj0DwEOj7qLR7EaYF9swyD/7FXGVQexWzrVup2rJiOckq+s6aoNcQ7pwK3QYBNXRBdtMiUSIl/VcA/tm80BVf1gx+dQHLtBl1bFb74GZbNJEQC049LVoGQh3Ooq5BJUIOAhtW4UCIla24bqDsMttwfdBtuxAoH9uk3I3eV4mNDQ6liC6FGCXzJNOivOSZBPiiQOuO+RidqAb1I/Vp7L0/SGdoUNgqM8galxRtl1XH8vCIa+jnSxBlJEYBO3QQ2AEPPOTOB/LQ/RjEM2x34QUAUPkBcs3hc2x2YMst8XVv7oSNeGNCsyQoa867aB/KPvVa7s5Cgh8l20hIXxeGRrOhQtELy6DqsCuiw++xbeaQhPhagL1KXef7MlfjJTx47lPsEHp7PoWt3elgAD2pN4Ag9cMrUN3b+9oddcEmo9r/0srVfEwAGU0z/z6vLF/7nfURQ0sVX6EBnoqQ1P21gtGf9As55wxTYiKtmhGjarI5PZB7R9FKpmjnogp/N4MZAKypaoE2Os4OWm84zDnJp1tLIwaPZa1DXwQxz0P8wECoENh/RJkV3/lfjGWEaFccvjdMcRDRiInXJHxi2MxtOOmk0qynNtAT9+A/q5S52iEmyfAstqRZqWua57S9OLm0pPbNDpgnjEEmY2cL7xwhnBLdL4R7YxsGuW/lSnwWPwISW/i9mRoG2tWvQxnELWXk4OdEmbr0aHXG24veUc3AwTgu58GqcO72/hpjG8FwtWMvuXgtsUBuqygeWXuRgrrjzb0FtbTC0qTm0ql/oe4jPFgmeTDhLc0h4yH5pFO1rBx9bDQ+MPN1+axC47KpoprWqKfebAyILoyudoz4HZeLOuOAol/4l2/wieJsMHvA/EQeWwkTiXXXGguVHVy8xewvBGyuEUcrbosvIV5G9z16tPQNZoqu/OmiqaMhUnOni64zFwxMKyt1eaBbNGavHTesNfc1joeXyhqzXR+2zWJ3g50KSKk64CUZye3AoXPTEbifVs64XwQ/JPgH3dCaxKkZt9XhxF/1FCY8ApNhHJHYunX0cWXJIHlIibaTFxQlQuY9xDja1QbXo3LQofIa4IX6ZbRwW94n4ADrRK9BOJwyjyv6MQUd7DgIuGEW8ejIppvdJYFF7Kn23YywWl7ULH7xfnijXkUvvEmBfSp2GEhbLyatw1xI+miEoTpxix5jnXXhHxjm71NrBveyyaxFoLgO3WUsYrk0Nv3STejvx1PfyoLkAPrM="};
const bytes = value => Uint8Array.from(atob(value), char => char.charCodeAt(0));
const form = document.querySelector('[data-invite]');
const field = form.elements.passcode;
const english = document.documentElement.lang.startsWith('en');
const status = document.querySelector('#gate-status');
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!crypto.subtle) { status.textContent = english ? 'Open this page in a secure browser.' : '请使用安全浏览器打开本页。'; return; }
  const submit = form.querySelector('button'); submit.disabled = true;
  try {
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(field.value), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({name:'PBKDF2', hash:'SHA-256', salt:bytes(sealed.salt), iterations:600000}, material, {name:'AES-GCM', length:256}, false, ['decrypt']);
    const clear = await crypto.subtle.decrypt({name:'AES-GCM', iv:bytes(sealed.iv)}, key, bytes(sealed.ciphertext));
    const output = document.querySelector('#invitation');
    for (const text of JSON.parse(new TextDecoder().decode(clear))[english ? 'en' : 'zh']) {
      const paragraph = document.createElement('p'); paragraph.textContent = text; output.append(paragraph);
    }
    field.value = ''; form.hidden = true; status.textContent = ''; output.hidden = false; output.focus();
  } catch {
    status.textContent = english ? 'Could not unlock. Check the member password and try again.' : '未能解锁，请核对会员密码后再试。';
    field.select();
  } finally { submit.disabled = false; }
});
addEventListener('pagehide', () => { form.reset(); form.hidden=false; status.textContent=''; const out=document.querySelector('#invitation'); out.hidden=true; out.replaceChildren(); });
