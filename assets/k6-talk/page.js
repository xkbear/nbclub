(() => {
  // Run in the head so unrevealed questions never flash before initialization.
  document.documentElement.classList.add('reveal-mode');
  document.addEventListener('DOMContentLoaded', () => {
    const status = document.getElementById('display-status');
    const topics = document.querySelector('.topics');
    const questions = [...document.querySelectorAll('.topic-list li')];
    const next = document.querySelector('.reveal-next');
    const reset = document.querySelector('.reveal-reset');
    const progress = document.querySelector('.reveal-progress');
    let shown = 0;

    if (topics && questions.length && next && reset && progress) {
      const show = (count, announce = true) => {
        shown = Math.max(0, Math.min(questions.length, count));
        questions.forEach((question, index) => {
          const visible = index < shown;
          question.classList.toggle('is-revealed', visible);
          question.setAttribute('aria-hidden', String(!visible));
        });
        next.disabled = shown === questions.length;
        next.textContent = next.disabled ? '五问已展开' : `显示第 ${shown + 1} 问 →`;
        reset.disabled = shown === 0;
        progress.textContent = `${shown} / ${questions.length}`;
        if (announce && status) {
          status.textContent = shown
            ? `第 ${shown} 问：${questions[shown - 1].querySelector('h3').textContent}`
            : '已重新开始，点击显示第一问。';
        }
      };
      show(0, false);
      document.querySelector('.topic-controls').hidden = false;
      next.addEventListener('click', () => show(shown + 1));
      reset.addEventListener('click', () => show(0));
      topics.addEventListener('click', (event) => {
        if (event.target.closest('a, button') || window.getSelection()?.toString()) return;
        show(shown + 1);
      });
      document.addEventListener('keydown', (event) => {
        if (event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
        if (event.key === ' ' && event.target.closest('button, a')) return;
        if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
          event.preventDefault();
          show(shown + 1);
        } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
          event.preventDefault();
          show(shown - 1);
        }
      });
    } else {
      document.documentElement.classList.remove('reveal-mode');
    }

    const button = document.querySelector('.fullscreen');
    if (!button || !document.documentElement.requestFullscreen || !document.fullscreenEnabled) return;
    button.hidden = false;
    button.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.documentElement.requestFullscreen();
      } catch {
        if (status) status.textContent = '浏览器未能进入全屏，可使用浏览器菜单中的全屏功能。';
      }
    });
    document.addEventListener('fullscreenchange', () => {
      const active = Boolean(document.fullscreenElement);
      button.querySelector('span').textContent = active ? '退出全屏' : '全屏';
      button.setAttribute('aria-label', active ? '退出全屏' : '全屏展示');
      button.title = active ? '退出全屏' : '全屏展示';
    });
  }, { once: true });
})();
