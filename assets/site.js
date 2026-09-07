/* Progressive enhancement: the content and links work without JavaScript. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-nav');
  const setMenu = open => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    const english = document.documentElement.lang.startsWith('en');
    toggle.setAttribute('aria-label', english ? (open ? 'Close menu' : 'Open menu') : (open ? '关闭导航' : '打开导航'));
    menu.hidden = !open;
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  const mobile = matchMedia('(max-width: 820px)');
  mobile.addEventListener('change', () => { if (!mobile.matches) setMenu(false); });

  if ('IntersectionObserver' in window && !reduce.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }), {threshold: .08, rootMargin: '0px 0px 30px 0px'});
    document.querySelectorAll('[data-reveal]').forEach(el => {
      if (el.getBoundingClientRect().top <= window.innerHeight) return;
      el.classList.add('reveal-ready');
      observer.observe(el);
    });
    reduce.addEventListener('change', () => {
      if (reduce.matches) document.querySelectorAll('.reveal-ready').forEach(el => el.classList.add('is-visible'));
    });
  }

  document.querySelectorAll('[data-rail]').forEach(rail => {
    const group = rail.parentElement;
    const previous = group.querySelector('[data-rail-prev]');
    const next = group.querySelector('[data-rail-next]');
    const position = group.querySelector('[data-rail-position]');
    const playback = group.querySelector('[data-rail-autoplay]');
    const cards = Array.from(rail.querySelectorAll('.story-card'));
    if (!cards.length) return;
    if (playback) playback.hidden = false;
    let frame, timer;
    let inView = false, hovered = false, dragging = false, focusPaused = false;
    let userPaused = reduce.matches;
    let direction = 1;
    const step = () => cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth;
    const stopped = () => userPaused || focusPaused || reduce.matches;
    const sync = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      previous.disabled = rail.scrollLeft < 5;
      next.disabled = rail.scrollLeft >= max - 5;
      const current = Math.min(cards.length, Math.round(rail.scrollLeft / step()) + 1);
      if (position) position.textContent = String(current).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
    };
    const updatePlayback = () => {
      if (!playback) return;
      playback.disabled = reduce.matches;
      playback.setAttribute('aria-label', reduce.matches ? '已遵循减少动态效果设置，自动滚动已关闭' : (stopped() ? '播放自动滚动' : '暂停自动滚动'));
      playback.title = playback.getAttribute('aria-label');
      playback.querySelector('[data-playback-label]').textContent = stopped() ? '播放' : '暂停';
      playback.querySelector('[data-pause-icon]').toggleAttribute('hidden', stopped());
      playback.querySelector('[data-play-icon]').toggleAttribute('hidden', !stopped());
      rail.setAttribute('aria-live', stopped() ? 'polite' : 'off');
    };
    const move = amount => rail.scrollBy({left: amount * step(), behavior: reduce.matches ? 'instant' : 'smooth'});
    const schedule = () => {
      clearTimeout(timer);
      updatePlayback();
      if (!playback || stopped() || hovered || dragging || !inView || document.hidden || rail.scrollWidth <= rail.clientWidth + 5) return;
      timer = setTimeout(() => {
        const max = rail.scrollWidth - rail.clientWidth;
        if (rail.scrollLeft >= max - 5) direction = -1;
        else if (rail.scrollLeft < 5) direction = 1;
        move(direction);
        schedule();
      }, 5000);
    };
    const pauseForInteraction = () => { userPaused = true; schedule(); };
    previous?.addEventListener('click', () => { pauseForInteraction(); move(-1); });
    next?.addEventListener('click', () => { pauseForInteraction(); move(1); });
    playback?.addEventListener('click', () => {
      userPaused = !stopped();
      focusPaused = false;
      schedule();
    });
    rail.addEventListener('keydown', event => {
      if (event.target !== rail) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault(); pauseForInteraction(); move(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    group.addEventListener('focusin', event => {
      if (event.target.closest('[data-rail-autoplay]')) return;
      focusPaused = true; schedule();
    });
    rail.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; schedule(); } });
    rail.addEventListener('pointerleave', () => { hovered = false; schedule(); });
    rail.addEventListener('pointerdown', () => { dragging = true; pauseForInteraction(); }, {passive:true});
    addEventListener('pointerup', () => { if (dragging) { dragging = false; schedule(); } }, {passive:true});
    addEventListener('pointercancel', () => { dragging = false; schedule(); }, {passive:true});
    rail.addEventListener('wheel', event => { if (Math.abs(event.deltaX) > 0) pauseForInteraction(); }, {passive:true});
    rail.addEventListener('scroll', () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(sync); }, {passive:true});
    addEventListener('resize', () => { sync(); schedule(); }, {passive:true});
    document.addEventListener('visibilitychange', schedule);
    addEventListener('pagehide', () => clearTimeout(timer));
    addEventListener('pageshow', schedule);
    reduce.addEventListener('change', schedule);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting && entries[0].intersectionRatio >= .25; schedule(); }, {threshold:.25});
      observer.observe(rail);
    } else { inView = true; }
    sync(); schedule();
  });

  const filters = document.querySelector('.filter-group');
  if (filters) {
    filters.hidden = false;
    const cards = Array.from(document.querySelectorAll('.archive-grid .story-card'));
    filters.addEventListener('click', event => {
      const button = event.target.closest('button[data-filter]');
      if (!button) return;
      filters.querySelectorAll('button').forEach(el => el.setAttribute('aria-pressed', String(el === button)));
      let count = 0;
      cards.forEach(card => {
        const visible = button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter;
        card.hidden = !visible;
        if (visible) {
          count++;
          if (!reduce.matches) card.animate([{opacity: 0, transform: 'translateY(8px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 320, easing: 'ease-out'});
        }
      });
      const result = document.querySelector('[data-filter-result]');
      if (result) result.textContent = count + ' 场活动';
    });
  }

  const progress = document.querySelector('.reading-progress');
  if (progress) {
    let pending = false;
    const update = () => {
      const total = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = 'scaleX(' + (total > 0 ? Math.min(1, scrollY / total) : 0) + ')';
      pending = false;
    };
    addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(update); } }, {passive:true});
    addEventListener('resize', update, {passive:true}); update();
  }

  const toc = document.querySelector('.document-toc');
  if (toc && 'IntersectionObserver' in window) {
    const links = Array.from(toc.querySelectorAll('a[href^="#"]'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, {rootMargin: '-90px 0px -65% 0px'});
    document.querySelectorAll('.document-body h2[id]').forEach(el => observer.observe(el));
  }

  const gallery = document.querySelectorAll('.article-body figure img, .article-legacy figure img');
  if (gallery.length && typeof HTMLDialogElement !== 'undefined') {
    const dialog = document.createElement('dialog');
    dialog.className = 'lightbox'; dialog.setAttribute('aria-label', '查看活动照片');
    const close = document.createElement('button'); close.className = 'dialog-close'; close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label', '关闭照片');
    const image = document.createElement('img');
    const caption = document.createElement('p');
    dialog.append(close, caption); document.body.append(dialog);
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
    gallery.forEach(img => {
      const open = () => { image.src = img.currentSrc || img.src; image.alt = img.alt; caption.before(image); caption.textContent = img.closest('figure')?.querySelector('figcaption')?.textContent || img.alt; dialog.showModal(); };
      img.classList.add('zoom-image'); img.tabIndex = 0; img.setAttribute('role', 'button'); img.setAttribute('aria-label', '放大查看：' + img.alt);
      img.addEventListener('click', open);
      img.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') {event.preventDefault();open();} });
    });
  }
  if (document.body.classList.contains('page-home')) {
    const legacyAnchor = () => {
      if (/^#s(?:[1-9]|1[0-2])$/.test(location.hash)) location.replace('whitepaper.html' + location.hash);
    };
    legacyAnchor(); addEventListener('hashchange', legacyAnchor);
  }
})();
