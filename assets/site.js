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
    const cards = Array.from(rail.querySelectorAll('.story-card'));
    if (!cards.length) return;
    // A second visual copy lets the last card meet the first without a rewind.
    // Only the original set participates in keyboard and screen-reader navigation.
    const copies = cards.map(card => {
      const copy = card.cloneNode(true);
      copy.dataset.railClone = '';
      copy.setAttribute('aria-hidden', 'true');
      copy.removeAttribute('id');
      copy.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      copy.querySelectorAll('a,button,[tabindex]').forEach(el => el.tabIndex = -1);
      return copy;
    });
    rail.append(...copies);
    rail.setAttribute('aria-live', 'off');
    const speed = 24; // CSS pixels per second, independent of display refresh rate.
    let frame = 0, lastTime = 0, resumeTimer = 0, holdUntil = 0;
    let cycle = 0, cardStep = 0, offset = 0, written = 0;
    let inView = false, hovered = false, dragging = false, focusPaused = false;
    const sync = () => {
      const progress = cycle ? ((rail.scrollLeft % cycle) + cycle) % cycle : rail.scrollLeft;
      const current = Math.min(cards.length, Math.floor((progress + .5) / (cardStep || 1)) + 1);
      const label = String(current).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
      if (position && position.textContent !== label) position.textContent = label;
      if (previous) previous.disabled = !cycle && rail.scrollLeft < 5;
      if (next) next.disabled = !cycle && rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 5;
    };
    const normalize = () => {
      if (cycle && rail.scrollLeft >= cycle) rail.scrollLeft %= cycle;
      offset = written = rail.scrollLeft;
    };
    const canRun = () => cycle > 0 && !reduce.matches && !hovered && !dragging && !focusPaused && inView && !document.hidden && performance.now() >= holdUntil;
    const tick = time => {
      frame = 0;
      if (!canRun()) { lastTime = 0; return; }
      // Keep fractional progress instead of losing subpixel movement to scrollLeft rounding.
      if (Math.abs(rail.scrollLeft - written) > .75) offset = rail.scrollLeft;
      if (lastTime) offset += speed * Math.min(time - lastTime, 50) / 1000;
      lastTime = time;
      offset %= cycle;
      rail.scrollLeft = offset;
      written = rail.scrollLeft;
      sync();
      frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      normalize();
      sync();
      if (canRun()) frame = requestAnimationFrame(tick);
    };
    const pauseForInteraction = (duration = 900) => {
      holdUntil = performance.now() + duration;
      clearTimeout(resumeTimer);
      schedule();
      resumeTimer = setTimeout(schedule, duration + 20);
    };
    const measure = () => {
      const progress = cycle ? (rail.scrollLeft % cycle) / cycle : 0;
      const looping = !reduce.matches && cards.length > 1;
      copies.forEach(copy => { copy.hidden = !looping; });
      rail.classList.toggle('is-continuous', looping);
      const first = cards[0].getBoundingClientRect();
      cardStep = cards[1] ? cards[1].getBoundingClientRect().left - first.left : first.width;
      cycle = looping ? copies[0].getBoundingClientRect().left - first.left : 0;
      // No endless scrolling when all original cards already fit on screen.
      if (cycle && cycle <= rail.clientWidth) {
        cycle = 0;
        copies.forEach(copy => { copy.hidden = true; });
        rail.classList.remove('is-continuous');
      }
      rail.scrollLeft = cycle ? progress * cycle : 0;
      schedule();
    };
    const move = amount => {
      pauseForInteraction();
      if (cycle && amount < 0 && rail.scrollLeft < cardStep) rail.scrollLeft += cycle;
      rail.scrollBy({left: amount * cardStep, behavior: reduce.matches ? 'instant' : 'smooth'});
    };
    previous?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));
    rail.addEventListener('keydown', event => {
      if (event.target !== rail) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        move(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    group.addEventListener('focusin', event => {
      focusPaused = event.target.matches(':focus-visible');
      schedule();
    });
    group.addEventListener('focusout', event => {
      if (!group.contains(event.relatedTarget)) { focusPaused = false; schedule(); }
    });
    group.addEventListener('pointerdown', () => { focusPaused = false; schedule(); });
    rail.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') { hovered = true; schedule(); }
    });
    rail.addEventListener('pointerleave', () => { hovered = false; schedule(); });
    rail.addEventListener('pointerdown', () => { dragging = true; schedule(); }, {passive:true});
    const release = () => {
      if (!dragging) return;
      dragging = false;
      pauseForInteraction();
    };
    addEventListener('pointerup', release, {passive:true});
    addEventListener('pointercancel', release, {passive:true});
    rail.addEventListener('wheel', event => {
      if (Math.abs(event.deltaX) > 0) pauseForInteraction();
    }, {passive:true});
    rail.addEventListener('scroll', sync, {passive:true});
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(rail);
    else addEventListener('resize', measure, {passive:true});
    document.fonts?.ready.then(measure);
    document.addEventListener('visibilitychange', schedule);
    addEventListener('pagehide', () => { cancelAnimationFrame(frame); clearTimeout(resumeTimer); });
    addEventListener('pageshow', () => { holdUntil = 0; schedule(); });
    reduce.addEventListener('change', measure);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        schedule();
      }, {threshold:0}).observe(rail);
    } else { inView = true; }
    measure();
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
