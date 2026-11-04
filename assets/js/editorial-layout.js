(() => {
  const rail = document.querySelector(".github-activity");
  if (!rail) return;
  new ResizeObserver(() => {
    rail.style.setProperty("--rail-length", `${rail.clientHeight}px`);
  }).observe(rail);
})();
