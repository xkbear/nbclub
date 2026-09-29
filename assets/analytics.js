/* Cloudflare Web Analytics: only the public, top-level production website. */
(() => {
  // Keep local development, GitHub previews and test.html's iframe out of traffic totals.
  if (location.protocol !== 'https:' || location.hostname !== 'new-bee.club' || window.top !== window.self) return;
  if (document.querySelector('script[data-cf-beacon]')) return;

  const beacon = document.createElement('script');
  beacon.type = 'module';
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  // This is the public site identifier supplied by Cloudflare, not an API credential.
  beacon.dataset.cfBeacon = JSON.stringify({token: '959339b768f84be6839b4cdda1a2aefb'});
  document.head.appendChild(beacon);
})();
