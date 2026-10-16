(() => {
  const run = document.querySelector(".sled-run");
  const sled = run?.querySelector(".sledder");

  if (!run || !sled || typeof sled.animate !== "function") return;

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const duration = 14000;
  const delay = 120;
  const travelEnd = 0.6;
  const preferredFadeDuration = 700;

  let animation;
  let resizeFrame;

  const makeAnimation = () => {
    if (motionPreference.matches) return;

    const runWidth = run.getBoundingClientRect().width;
    const sledWidth = sled.getBoundingClientRect().width;

    if (!runWidth || !sledWidth) return;

    const previousTime = animation?.currentTime;
    animation?.cancel();

    // The sled begins one full sled-width outside the lane and ends one full
    // lane-width across it. These offsets are the exact instants when it has
    // cleared the left edge and when its leading edge reaches the right edge.
    const enterOffset = travelEnd * sledWidth / (runWidth + sledWidth);
    const exitOffset = travelEnd * runWidth / (runWidth + sledWidth);
    const visibleSpan = exitOffset - enterOffset;
    const fadeOffset = Math.min(preferredFadeDuration / duration, visibleSpan / 3);
    const fadeInEnd = enterOffset + fadeOffset;
    const fadeOutStart = exitOffset - fadeOffset;

    const xAt = (offset) => (
      -sledWidth + (offset / travelEnd) * (runWidth + sledWidth)
    );

    const frame = (offset, opacity, x = xAt(offset)) => ({
      offset,
      opacity,
      transform: `translate3d(${x}px, 0, 0)`,
    });

    animation = sled.animate([
      frame(0, 0),
      frame(enterOffset, 0),
      frame(fadeInEnd, 1),
      frame(fadeOutStart, 1),
      frame(exitOffset, 0),
      frame(travelEnd, 0, runWidth),
      frame(1, 0, runWidth),
    ], {
      duration,
      delay,
      iterations: Infinity,
      easing: "linear",
      fill: "both",
    });

    if (typeof previousTime === "number") animation.currentTime = previousTime;
  };

  const scheduleAnimation = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(makeAnimation);
  };

  const handleMotionPreference = () => {
    animation?.cancel();
    animation = undefined;
    if (!motionPreference.matches) makeAnimation();
  };

  makeAnimation();

  const resizeObserver = new ResizeObserver(scheduleAnimation);
  resizeObserver.observe(run);
  resizeObserver.observe(sled);
  motionPreference.addEventListener("change", handleMotionPreference);
})();
