(() => {
  const figure = document.querySelector("[data-dream-reveal]");
  const reality = figure?.querySelector(".reality-image");
  const dream = figure?.querySelector(".dream-image");
  const canvas = figure?.querySelector(".dream-reveal");

  if (
    !figure ||
    !reality ||
    !dream ||
    !canvas ||
    window.matchMedia("(pointer: coarse)").matches
  ) {
    return;
  }

  const outputContext = canvas.getContext("2d", { alpha: true });
  const maskCanvas = document.createElement("canvas");
  const maskContext = maskCanvas.getContext("2d");

  if (!outputContext || !maskContext) {
    return;
  }

  const pointer = { active: false, x: 0, y: 0, angle: 0 };
  const decayTime = 760;
  let width = 0;
  let height = 0;
  let ratio = 1;
  let frame = 0;
  let lastFrameTime = 0;
  let lastHoldTime = 0;
  let lastPoint = null;
  let trailEnergy = 0;
  let brushIndex = 0;

  const scheduleFrame = () => {
    if (!frame) {
      frame = window.requestAnimationFrame(render);
    }
  };

  const drawReality = () => {
    outputContext.save();
    outputContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    outputContext.clearRect(0, 0, width, height);
    outputContext.globalCompositeOperation = "source-over";
    outputContext.drawImage(reality, 0, 0, width, height);
    outputContext.globalCompositeOperation = "destination-out";
    outputContext.drawImage(maskCanvas, 0, 0, width, height);
    outputContext.restore();
  };

  const paintEllipse = (
    x,
    y,
    radius,
    stretchX,
    stretchY,
    angle,
    strength,
  ) => {
    const gradient = maskContext.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${0.96 * strength})`);
    gradient.addColorStop(0.28, `rgba(255, 255, 255, ${0.84 * strength})`);
    gradient.addColorStop(0.62, `rgba(255, 255, 255, ${0.32 * strength})`);
    gradient.addColorStop(0.84, `rgba(255, 255, 255, ${0.08 * strength})`);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    maskContext.save();
    maskContext.translate(x, y);
    maskContext.rotate(angle);
    maskContext.scale(stretchX, stretchY);
    maskContext.fillStyle = gradient;
    maskContext.fillRect(-radius, -radius, radius * 2, radius * 2);
    maskContext.restore();
  };

  const stampWake = (x, y, angle, strength = 1, speed = 0) => {
    brushIndex += 1;
    const radius = Math.min(58, Math.max(43, width * 0.078));
    const normalX = -Math.sin(angle);
    const normalY = Math.cos(angle);
    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);
    const curl = Math.sin(brushIndex * 1.73) * radius * 0.2;
    const counterCurl = Math.cos(brushIndex * 1.11) * radius * 0.17;
    const velocityStretch = Math.min(0.28, speed / 90);

    paintEllipse(
      x,
      y,
      radius,
      1.24 + velocityStretch,
      0.68,
      angle,
      strength,
    );

    paintEllipse(
      x + normalX * curl - directionX * radius * 0.12,
      y + normalY * curl - directionY * radius * 0.12,
      radius * 0.56,
      1.08,
      0.62,
      angle + 0.7,
      strength * 0.58,
    );

    paintEllipse(
      x - normalX * counterCurl - directionX * radius * 0.3,
      y - normalY * counterCurl - directionY * radius * 0.3,
      radius * 0.43,
      1.32,
      0.48,
      angle - 0.82,
      strength * 0.46,
    );

    trailEnergy = 1;
  };

  const paintTo = (x, y) => {
    const nextPoint = { x, y };

    if (!lastPoint) {
      stampWake(x, y, pointer.angle, 0.9);
      lastPoint = nextPoint;
      return;
    }

    const dx = x - lastPoint.x;
    const dy = y - lastPoint.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 0.5) {
      return;
    }

    const angle = Math.atan2(dy, dx);
    const steps = Math.max(1, Math.ceil(distance / 11));

    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps;
      stampWake(
        lastPoint.x + dx * progress,
        lastPoint.y + dy * progress,
        angle,
        1,
        distance,
      );
    }

    pointer.angle = angle;
    lastPoint = nextPoint;
  };

  const eventPoint = (event) => {
    const bounds = reality.getBoundingClientRect();
    return {
      x: Math.min(width, Math.max(0, event.clientX - bounds.left)),
      y: Math.min(height, Math.max(0, event.clientY - bounds.top)),
    };
  };

  const syncCanvas = () => {
    if (!reality.complete || !reality.naturalWidth || !dream.complete) {
      return;
    }

    figure.classList.remove("is-reveal-ready");
    const bounds = reality.getBoundingClientRect();
    width = Math.max(1, Math.round(bounds.width));
    height = Math.max(1, Math.round(bounds.height));
    ratio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    maskCanvas.width = width;
    maskCanvas.height = height;

    maskContext.clearRect(0, 0, width, height);
    trailEnergy = 0;
    lastPoint = null;
    drawReality();
    figure.classList.add("is-reveal-ready");
  };

  function render(time) {
    frame = 0;
    const elapsed = lastFrameTime ? Math.min(64, time - lastFrameTime) : 16;
    lastFrameTime = time;

    if (pointer.active && time - lastHoldTime > 86) {
      const drift = time * 0.0024;
      stampWake(
        pointer.x + Math.sin(drift * 1.7) * 3,
        pointer.y + Math.cos(drift * 1.3) * 3,
        pointer.angle + Math.sin(drift) * 0.32,
        0.1,
      );
      lastHoldTime = time;
    }

    const fadeAmount = 1 - Math.exp(-elapsed / decayTime);
    maskContext.save();
    maskContext.globalCompositeOperation = "destination-out";
    maskContext.fillStyle = `rgba(0, 0, 0, ${fadeAmount})`;
    maskContext.fillRect(0, 0, width, height);
    maskContext.restore();
    trailEnergy *= Math.exp(-elapsed / decayTime);

    drawReality();

    if (pointer.active || trailEnergy > 0.018) {
      scheduleFrame();
    } else {
      maskContext.clearRect(0, 0, width, height);
      drawReality();
      lastFrameTime = 0;
    }
  }

  figure.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "touch") {
      return;
    }

    const point = eventPoint(event);
    pointer.active = true;
    pointer.x = point.x;
    pointer.y = point.y;
    lastPoint = null;
    paintTo(point.x, point.y);
    scheduleFrame();
  });

  figure.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") {
      return;
    }

    const events = event.getCoalescedEvents?.() || [event];

    for (const coalescedEvent of events) {
      const point = eventPoint(coalescedEvent);
      pointer.x = point.x;
      pointer.y = point.y;
      paintTo(point.x, point.y);
    }

    pointer.active = true;
    scheduleFrame();
  });

  figure.addEventListener("pointerleave", () => {
    pointer.active = false;
    lastPoint = null;
    scheduleFrame();
  });

  const resizeObserver = new ResizeObserver(syncCanvas);
  resizeObserver.observe(reality);

  Promise.all([
    reality.decode().catch(() => {}),
    dream.decode().catch(() => {}),
  ]).finally(syncCanvas);
})();
