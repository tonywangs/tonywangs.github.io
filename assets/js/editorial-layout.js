(() => {
  const page = document.querySelector('.page');
  const rail = document.querySelector('.github-activity');
  const art = document.querySelector('.drafting-lines');
  if (!page || !rail || !art) return;
  const paths = [...art.querySelectorAll('path')];
  const update = () => {
    rail.style.setProperty('--rail-length', `${rail.clientHeight}px`);
    const bounds = page.getBoundingClientRect();
    const about = document.querySelector('.about').getBoundingClientRect();
    const photo = document.querySelector('.morning').getBoundingClientRect();
    const calendar = rail.getBoundingClientRect();
    const mobile = innerWidth <= 600;
    const top = about.top - bounds.top - 24;
    const bottom = photo.bottom - bounds.top + 22;
    const divider = (photo.right + calendar.left) / 2 - bounds.left;
    const w = bounds.width;
    art.setAttribute('viewBox', `0 0 ${w} ${bounds.height}`);
    const shapes = mobile ? [
      `M0 ${top} H${w * 0.68}`,
      `M16 ${top - 9} V${top + 10}`,
      '',
      `M${w} ${bottom} H${w * 0.55}`,
      `M${w - 18} ${bottom - 8} V${bottom + 10}`
    ] : [
      `M0 ${top} H${w * 0.53}`,
      `M20 ${top - 11} V${top + 14}`,
      `M${divider - 60} ${top + 7} H${divider + 15} M${divider} ${top - 10} V${top + (bottom - top) * 0.57}`,
      `M${w} ${bottom} H${w * 0.64}`,
      `M${divider} ${bottom + 15} V${bottom - 74} L${divider - 16} ${bottom - 90}`
    ];
    paths.forEach((path, i) => path.setAttribute('d', shapes[i]));
  };
  new ResizeObserver(update).observe(page);
  new ResizeObserver(update).observe(rail);
  document.fonts.ready.then(update);
  update();
})();
