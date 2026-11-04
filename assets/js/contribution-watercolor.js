(() => {
  const chart = document.querySelector('.github-chart');
  const holder = document.querySelector('.github-chart-scroll');
  if (!chart || !holder || !matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'contribution-watercolor';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.width = 1326;
  canvas.height = 208;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  holder.append(canvas);
  const paint = document.createElement('canvas');
  paint.width = canvas.width;
  paint.height = canvas.height;
  const ink = paint.getContext('2d');
  ink.scale(2, 2);
  ink.fillStyle = '#f6dfc7';
  ink.fillRect(0, 0, 663, 104);
  let seed = 144;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const colors = ['232,139,95', '227,164,130', '180,115,148', '127,133,185', '89,151,188', '226,190,130'];
  // Overlapping translucent pigment blooms, with uneven edges and paper grain.
  for (let i = 0; i < 170; i++) {
    const x = random() * 663, y = random() * 104;
    const radius = 12 + random() * 55;
    const color = colors[Math.min(5, Math.floor(x / 133 + random() * 2))];
    const wash = ink.createRadialGradient(x, y, 0, x, y, radius);
    wash.addColorStop(0, `rgba(${color},0.38)`);
    wash.addColorStop(0.65, `rgba(${color},0.20)`);
    wash.addColorStop(0.88, `rgba(${color},0.29)`);
    wash.addColorStop(1, `rgba(${color},0)`);
    ink.fillStyle = wash;
    ink.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  for (let i = 0; i < 26000; i++) {
    ink.fillStyle = random() > 0.5 ? 'rgba(255,247,232,0.16)' : 'rgba(64,47,81,0.08)';
    ink.fillRect(random() * 663, random() * 104, 0.4 + random(), 0.4 + random());
  }
  const mask = document.createElement('canvas');
  mask.width = canvas.width;
  mask.height = canvas.height;
  const brush = mask.getContext('2d');
  const cells = new Path2D();
  // ghchart's fixed SVG geometry: seven days, 53 weeks, two-unit gutters.
  for (let week = 0; week < 53; week++) {
    for (let day = 0; day < 7; day++) {
      if (week === 52 && day > new Date().getUTCDay()) continue;
      cells.rect(27 + week * 12, 20 + day * 12, 10, 10);
    }
  }
  let strokes = [], last = null, frame = 0;
  function render(now) {
    strokes = strokes.filter(p => now - p.time < 4200);
    brush.setTransform(2, 0, 0, 2, 0, 0);
    brush.clearRect(0, 0, 663, 104);
    for (const point of strokes) {
      const age = (now - point.time) / 4200;
      const radius = 24 + age * 14;
      const bloom = brush.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
      bloom.addColorStop(0, `rgba(0,0,0,${Math.min(1, (1 - age) * 2)})`);
      bloom.addColorStop(0.55, `rgba(0,0,0,${(1 - age) * 0.85})`);
      bloom.addColorStop(1, 'transparent');
      brush.fillStyle = bloom;
      brush.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(2, 2);
    ctx.clip(cells);
    ctx.drawImage(paint, 0, 0, 663, 104);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(mask, 0, 0, 663, 104);
    ctx.restore();
    frame = strokes.length ? requestAnimationFrame(render) : 0;
  }
  holder.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const box = chart.getBoundingClientRect();
    // Undo the calendar's clockwise rotation.
    const x = (event.clientY - box.top) / box.height * 663;
    const y = (box.right - event.clientX) / box.width * 104;
    const distance = last ? Math.hypot(x - last.x, y - last.y) : 0;
    const steps = Math.max(1, Math.ceil(distance / 5));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      strokes.push({ x: last ? last.x + (x - last.x) * t : x, y: last ? last.y + (y - last.y) * t : y, time: performance.now() });
    }
    strokes = strokes.slice(-240);
    last = { x, y };
    if (!frame) frame = requestAnimationFrame(render);
  });
  holder.addEventListener('pointerleave', () => { last = null; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { strokes = []; last = null; cancelAnimationFrame(frame); frame = 0; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  });
})();
