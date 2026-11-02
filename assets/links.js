/* Screenshot links also work without JavaScript. */
(() => {
  const dialog = document.querySelector('.screenshot-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = document.createElement('img');
  image.decoding = 'async';
  const title = dialog.querySelector('#screenshot-title');
  const original = dialog.querySelector('.screenshot-original');
  original.before(image);
  let trigger;
  document.querySelectorAll('[data-screenshot]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      trigger = link;
      image.src = link.href;
      const thumbnail = link.querySelector('img');
      image.alt = thumbnail.alt;
      image.width = thumbnail.naturalWidth || thumbnail.width;
      image.height = thumbnail.naturalHeight || thumbnail.height;
      title.textContent = image.alt;
      original.href = link.href;
      dialog.showModal();
    });
  });
  dialog.querySelector('[data-close-screenshot]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => trigger?.focus({preventScroll:true}));
})();
