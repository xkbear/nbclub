/* Read the theme before styles paint; storage is optional, never required. */
(() => {
  const root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)');
  const key = 'newbee-theme';
  let preference;
  let transitionTimer;
  try { preference = localStorage.getItem(key); } catch { /* Private or restricted storage. */ }
  if (preference !== 'light' && preference !== 'dark') preference = null;

  const apply = (animate = false) => {
    if (animate) {
      root.classList.add('theme-changing');
      clearTimeout(transitionTimer);
      transitionTimer = setTimeout(() => root.classList.remove('theme-changing'), 300);
    }
    const dark = (preference || (system.matches ? 'dark' : 'light')) === 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    root.style.colorScheme = dark ? 'dark' : 'light';
    root.style.backgroundColor = dark ? '#181a1e' : '#f1f2f4';
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      const english = root.lang.startsWith('en');
      button.setAttribute('aria-pressed', String(dark));
      button.title = english ? (dark ? 'Switch to light appearance' : 'Switch to dark appearance') : (dark ? '切换到浅色模式' : '切换到深色模式');
    });
  };
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.querySelectorAll('[data-theme-toggle]').forEach(button => button.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, preference); } catch { /* Current page still switches. */ }
      apply(true);
    }));
  });
  system.addEventListener('change', () => { if (!preference) apply(true); });
  addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : null;
    apply(true);
  });
  addEventListener('pageshow', () => {
    try { const saved = localStorage.getItem(key); preference = saved === 'light' || saved === 'dark' ? saved : null; } catch { /* Keep current preference. */ }
    apply();
  });
})();
