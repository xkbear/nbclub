(() => {
  const button = document.querySelector('.fullscreen');
  const status = document.getElementById('display-status');
  if (!button || !document.documentElement.requestFullscreen || !document.fullscreenEnabled) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      status.textContent = '';
    } catch {
      status.textContent = '浏览器未能进入全屏，可使用浏览器菜单中的全屏功能。';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    const active = Boolean(document.fullscreenElement);
    button.querySelector('span').textContent = active ? '退出全屏' : '全屏';
    button.setAttribute('aria-label', active ? '退出全屏' : '全屏展示');
    button.title = active ? '退出全屏' : '全屏展示';
  });
})();
