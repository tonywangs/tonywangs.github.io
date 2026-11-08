(() => {
  const video = document.querySelector('.calligraphy-signature video');
  if (!video) return;
  const signature = video.parentElement;
  const canvas = document.createElement('canvas');
  canvas.width = 460;
  canvas.height = 196;
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  signature.append(canvas);
  const poster = new Image();
  poster.src = video.poster;
  let usePoster = false;
  let checkedAlpha = false;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    let source = !usePoster && video.readyState >= 2 ? video : poster;
    if (source === poster && !poster.naturalWidth) return;
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    if (source === video && !checkedAlpha) {
      try {
        checkedAlpha = true;
        if (ctx.getImageData(0, 0, 1, 1).data[3] > 240) {
          usePoster = true;
          signature.classList.add('use-poster');
          poster.className = 'calligraphy-poster-fallback';
          poster.alt = '';
          signature.append(poster);
          video.pause();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (!poster.naturalWidth) return;
          ctx.drawImage(poster, 0, 0, canvas.width, canvas.height);
        }
      } catch { /* Local-file previews may restrict pixel inspection. */ }
    }
    ctx.globalCompositeOperation = 'source-in';
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    [[0, '#edb183'], [0.23, '#d6a6a3'], [0.46, '#b8aac3'], [0.68, '#9fb4ce'], [1, '#aab7c5']]
      .forEach(([stop, color]) => gradient.addColorStop(stop, color));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  poster.addEventListener('load', draw);
  video.addEventListener('loadeddata', draw);
  video.addEventListener('seeked', draw);
  video.addEventListener('ended', draw);
  if ('requestVideoFrameCallback' in video) {
    const frame = () => { draw(); if (!usePoster) video.requestVideoFrameCallback(frame); };
    video.requestVideoFrameCallback(frame);
  } else {
    let frameId;
    const frame = () => { draw(); if (!video.paused && !video.ended) frameId = requestAnimationFrame(frame); };
    video.addEventListener('play', () => { cancelAnimationFrame(frameId); frame(); });
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) {
    video.removeAttribute('autoplay');
    video.pause();
    video.addEventListener('loadedmetadata', () => { video.currentTime = Math.max(0, video.duration - 0.05); }, { once: true });
  } else {
    video.play().catch(() => { /* Keep the final signature poster if autoplay is unavailable. */ });
  }
})();
