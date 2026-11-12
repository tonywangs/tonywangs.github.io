(() => {
  const links = [...document.querySelectorAll('[data-page]')];
  const dialog = document.querySelector('.viewer');
  const image = dialog.querySelector('img');
  const count = dialog.querySelector('.viewer-count');
  const status = dialog.querySelector('.viewer-status');
  const original = dialog.querySelector('.original-link');
  let current = 0;
  let generation = 0;
  async function show(index) {
    current = (index + links.length) % links.length;
    const token = ++generation;
    const link = links[current];
    const source = link.querySelector('img');
    count.textContent = `${String(current + 1).padStart(2, '0')} / 07`;
    original.href = link.href;
    image.alt = source.alt;
    image.src = source.currentSrc || source.src;
    status.textContent = 'loading full resolution…';
    const full = new Image();
    full.src = link.href;
    try {
      await full.decode();
      if (token !== generation) return;
      image.src = full.src;
      status.textContent = '';
    } catch {
      if (token === generation) status.textContent = 'showing preview — full resolution unavailable';
    }
  }
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    dialog.showModal();
    show(index);
  }));
  dialog.querySelector('[data-close]').onclick = () => dialog.close();
  dialog.querySelector('[data-previous]').onclick = () => show(current - 1);
  dialog.querySelector('[data-next]').onclick = () => show(current + 1);
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  const indexLinks = [...document.querySelectorAll('.folio-index a')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      indexLinks.forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-15% 0px -40% 0px' });
  document.querySelectorAll('.spread').forEach(spread => observer.observe(spread));
})();
