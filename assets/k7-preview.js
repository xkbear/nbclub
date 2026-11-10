(() => {
  const deadline = new Date('2026-11-11T20:00:00+13:00').getTime();
  const end = new Date('2026-11-14T12:30:00+13:00').getTime();
  function refreshStatus() {
    const now = Date.now();
    if (now < deadline) return;
    document.querySelectorAll('[data-k7-register]').forEach(link => { link.textContent = '报名已截止 · 查看海报'; });
    document.querySelectorAll('[data-k7-deadline]').forEach(item => { item.textContent = '线下报名已于 11 月 11 日 20:00 截止（新西兰时间）'; });
    if (now >= end) {
      document.querySelectorAll('[data-k7-status]').forEach(item => { item.textContent = '活动时间已过'; });
      document.querySelectorAll('[data-k7-live]').forEach(link => { link.textContent = '查看直播信息'; });
    }
  }
  document.querySelectorAll('[data-k7-dialog]').forEach(link => {
    link.addEventListener('click', event => {
      const dialog = document.getElementById(link.dataset.k7Dialog);
      if (!dialog || typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      dialog.showModal();
    });
  });
  document.querySelectorAll('.k7-dialog').forEach(dialog => {
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const rect=dialog.getBoundingClientRect(); if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) dialog.close(); } });
  });
  refreshStatus();
  setInterval(refreshStatus, 60000);
})();
