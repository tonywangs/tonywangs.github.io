(() => {
  const svg = document.querySelector('.calligraphy-svg');
  if (!svg) return;
  const strokes = [...svg.querySelectorAll('polyline[data-start]')];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let frame;
  const finish = () => {
    cancelAnimationFrame(frame);
    strokes.forEach(stroke => {
      stroke.setAttribute('stroke-dashoffset', '0');
      stroke.setAttribute('opacity', '1');
    });
  };
  if (preference.matches) { finish(); return; }
  const start = performance.now();
  const draw = now => {
    const elapsed = (now - start) / 1000;
    let complete = true;
    strokes.forEach(stroke => {
      const progress = Math.max(0, Math.min(1, (elapsed - Number(stroke.dataset.start)) / Number(stroke.dataset.duration)));
      stroke.setAttribute('opacity', progress > 0 ? '1' : '0');
      stroke.setAttribute('stroke-dashoffset', String(Number(stroke.dataset.length) * (1 - progress)));
      if (progress < 1) complete = false;
    });
    if (!complete) frame = requestAnimationFrame(draw);
    else finish();
  };
  frame = requestAnimationFrame(draw);
  preference.addEventListener('change', () => { if (preference.matches) finish(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); });
})();
