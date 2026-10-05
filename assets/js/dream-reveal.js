(() => {
  const figure = document.querySelector("[data-dream-reveal]");
  const reality = figure?.querySelector(".reality-image");
  const dream = figure?.querySelector(".dream-image");
  const canvas = figure?.querySelector(".dream-reveal");
  const ghostCursor = figure?.querySelector(".ghost-cursor");
  const demoButton = document.querySelector("[data-dream-demo]");
  const hasFinePointer = !window.matchMedia("(pointer: coarse)").matches;

  if (
    !figure ||
    !reality ||
    !dream ||
    !canvas ||
    !ghostCursor
  ) {
    return;
  }

  const outputContext = canvas.getContext("2d", { alpha: true });
  const maskCanvas = document.createElement("canvas");
  const maskContext = maskCanvas.getContext("2d");
  const brushTexture = document.createElement("canvas");
  const brushContext = brushTexture.getContext("2d");

  if (!outputContext || !maskContext || !brushContext) {
    return;
  }

  const pointer = { active: false, x: 0, y: 0, angle: 0 };
  let width = 0;
  let height = 0;
  let ratio = 1;
  let frame = 0;
  let lastHoldTime = 0;
  let lastPoint = null;
  let stamps = [];
  let brushPhase = 0;
  let lateralWander = 0;
  let demoRunning = false;

  brushTexture.width = 256;
  brushTexture.height = 256;
  const brushGradient = brushContext.createRadialGradient(128, 128, 0, 128, 128, 128);
  brushGradient.addColorStop(0, "rgba(255, 255, 255, 0.98)");
  brushGradient.addColorStop(0.26, "rgba(255, 255, 255, 0.9)");
  brushGradient.addColorStop(0.6, "rgba(255, 255, 255, 0.36)");
  brushGradient.addColorStop(0.84, "rgba(255, 255, 255, 0.07)");
  brushGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  brushContext.fillStyle = brushGradient;
  brushContext.fillRect(0, 0, 256, 256);

  const randomBetween = (minimum, maximum) =>
    minimum + Math.random() * (maximum - minimum);

  const scheduleFrame = () => {
    if (!frame) {
      frame = window.requestAnimationFrame(render);
    }
  };

  const drawImageCover = (context, image, targetWidth, targetHeight) => {
    const sourceWidth = image.naturalWidth || targetWidth;
    const sourceHeight = image.naturalHeight || targetHeight;
    const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
    const cropWidth = targetWidth / scale;
    const cropHeight = targetHeight / scale;
    const sourceX = Math.max(0, (sourceWidth - cropWidth) * 0.5);
    const sourceY = Math.max(0, (sourceHeight - cropHeight) * 0.48);

    context.drawImage(
      image,
      sourceX,
      sourceY,
      cropWidth,
      cropHeight,
      0,
      0,
      targetWidth,
      targetHeight,
    );
  };

  const drawReality = () => {
    outputContext.save();
    outputContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    outputContext.clearRect(0, 0, width, height);
    outputContext.globalCompositeOperation = "source-over";
    drawImageCover(outputContext, reality, width, height);
    outputContext.globalCompositeOperation = "destination-out";
    outputContext.drawImage(maskCanvas, 0, 0, width, height);
    outputContext.restore();
  };

  const paintBrush = (
    x,
    y,
    radius,
    stretchX,
    stretchY,
    angle,
    opacity,
  ) => {
    maskContext.save();
    maskContext.translate(x, y);
    maskContext.rotate(angle);
    maskContext.scale(stretchX, stretchY);
    maskContext.globalAlpha = Math.min(1, Math.max(0, opacity));
    maskContext.drawImage(
      brushTexture,
      -radius,
      -radius,
      radius * 2,
      radius * 2,
    );
    maskContext.restore();
  };

  const addWake = (
    x,
    y,
    angle,
    strength = 1,
    speed = 0,
    born = performance.now(),
    lifespanScale = 1,
  ) => {
    const baseRadius = Math.min(80, Math.max(61, width * 0.126));
    const normalX = -Math.sin(angle);
    const normalY = Math.cos(angle);
    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);

    brushPhase += randomBetween(0.36, 0.82);
    lateralWander =
      lateralWander * 0.72 + randomBetween(-baseRadius * 0.24, baseRadius * 0.24);

    const sizeWave = Math.sin(brushPhase) * 0.22;
    const sizeNoise = randomBetween(-0.16, 0.16);
    const radius = baseRadius * Math.min(1.34, Math.max(0.68, 1 + sizeWave + sizeNoise));
    const angleNoise = randomBetween(-0.28, 0.28);
    const alongJitter = randomBetween(-radius * 0.14, radius * 0.14);
    const crossJitter = lateralWander + randomBetween(-radius * 0.12, radius * 0.12);
    const velocityStretch = Math.min(0.34, speed / 105);

    stamps.push({
      x: x + directionX * alongJitter + normalX * crossJitter,
      y: y + directionY * alongJitter + normalY * crossJitter,
      angle: angle + angleNoise,
      radius,
      stretchX: randomBetween(1.12, 1.5) + velocityStretch,
      stretchY: randomBetween(0.58, 0.82),
      curl: randomBetween(-0.38, 0.38),
      counterCurl: randomBetween(-0.34, 0.34),
      backwash: randomBetween(0.12, 0.42),
      lobeScaleA: randomBetween(0.42, 0.68),
      lobeScaleB: randomBetween(0.32, 0.56),
      lobeStretchA: randomBetween(0.92, 1.16),
      lobeStrengthA: randomBetween(0.42, 0.7),
      lobeStrengthB: randomBetween(0.32, 0.58),
      strength,
      born,
      lifespan: randomBetween(3600, 4400) * lifespanScale,
    });

    if (stamps.length > 700) {
      stamps = stamps.slice(-700);
    }
  };

  const drawStamp = (stamp, opacity) => {
    const normalX = -Math.sin(stamp.angle);
    const normalY = Math.cos(stamp.angle);
    const directionX = Math.cos(stamp.angle);
    const directionY = Math.sin(stamp.angle);
    const visibleStrength = opacity * stamp.strength;

    paintBrush(
      stamp.x,
      stamp.y,
      stamp.radius,
      stamp.stretchX,
      stamp.stretchY,
      stamp.angle,
      visibleStrength,
    );

    paintBrush(
      stamp.x + normalX * stamp.radius * stamp.curl - directionX * stamp.radius * 0.08,
      stamp.y + normalY * stamp.radius * stamp.curl - directionY * stamp.radius * 0.08,
      stamp.radius * stamp.lobeScaleA,
      stamp.lobeStretchA,
      0.62,
      stamp.angle + 0.72,
      visibleStrength * stamp.lobeStrengthA,
    );

    paintBrush(
      stamp.x - normalX * stamp.radius * stamp.counterCurl - directionX * stamp.radius * stamp.backwash,
      stamp.y - normalY * stamp.radius * stamp.counterCurl - directionY * stamp.radius * stamp.backwash,
      stamp.radius * stamp.lobeScaleB,
      1.28,
      0.48,
      stamp.angle - 0.86,
      visibleStrength * stamp.lobeStrengthB,
    );
  };

  const rebuildMask = (time) => {
    maskContext.clearRect(0, 0, width, height);
    const livingStamps = [];

    for (const stamp of stamps) {
      const progress = Math.max(0, (time - stamp.born) / stamp.lifespan);

      if (progress >= 1) {
        continue;
      }

      const remainder = Math.max(0, 1 - progress);
      const opacity = remainder * remainder * (3 - 2 * remainder);
      drawStamp(stamp, opacity);
      livingStamps.push(stamp);
    }

    stamps = livingStamps;
  };

  const paintTo = (x, y) => {
    const nextPoint = { x, y };

    if (!lastPoint) {
      addWake(x, y, pointer.angle, 0.92);
      lastPoint = nextPoint;
      return;
    }

    const dx = x - lastPoint.x;
    const dy = y - lastPoint.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 0.75) {
      return;
    }

    const angle = Math.atan2(dy, dx);
    const spacing = randomBetween(13, 20);
    const steps = Math.max(1, Math.ceil(distance / spacing));
    const born = performance.now();

    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps;
      addWake(
        lastPoint.x + dx * progress,
        lastPoint.y + dy * progress,
        angle,
        randomBetween(0.84, 1),
        distance,
        born + step * 2,
      );
    }

    pointer.angle = angle;
    lastPoint = nextPoint;
  };

  const paintDemoSegment = (from, to, born) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 0.5) {
      return;
    }

    const angle = Math.atan2(dy, dx);
    const steps = Math.max(1, Math.ceil(distance / randomBetween(12, 17)));

    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps;
      addWake(
        from.x + dx * progress,
        from.y + dy * progress,
        angle,
        randomBetween(0.9, 1),
        distance,
        born,
        1.05,
      );
    }
  };

  const buildDemoPath = () => {
    const baseRadius = Math.min(80, Math.max(61, width * 0.126));
    let rowCount = Math.max(7, Math.ceil(height / (baseRadius * 0.96)));

    if (rowCount % 2 === 0) {
      rowCount += 1;
    }

    const paddingX = Math.min(24, baseRadius * 0.34);
    const paddingY = Math.min(18, baseRadius * 0.24);
    const points = [];

    for (let row = 0; row < rowCount; row += 1) {
      const progress = rowCount === 1 ? 0 : row / (rowCount - 1);
      const y = paddingY + (height - paddingY * 2) * progress;
      const startsLeft = row % 2 === 0;
      const startX = startsLeft ? paddingX : width - paddingX;
      const endX = startsLeft ? width - paddingX : paddingX;

      points.push({ x: startX, y });
      points.push({ x: endX, y });
    }

    const segments = [];
    let totalLength = 0;

    for (let index = 1; index < points.length; index += 1) {
      const from = points[index - 1];
      const to = points[index];
      const length = Math.hypot(to.x - from.x, to.y - from.y);
      segments.push({ from, to, length, startsAt: totalLength });
      totalLength += length;
    }

    return { points, segments, totalLength };
  };

  const pointAlongPath = (path, progress) => {
    const targetDistance = path.totalLength * progress;
    const segment =
      path.segments.find(
        (candidate) => targetDistance <= candidate.startsAt + candidate.length,
      ) || path.segments[path.segments.length - 1];
    const segmentProgress = segment.length
      ? (targetDistance - segment.startsAt) / segment.length
      : 0;

    return {
      x: segment.from.x + (segment.to.x - segment.from.x) * segmentProgress,
      y: segment.from.y + (segment.to.y - segment.from.y) * segmentProgress,
    };
  };

  const runDemo = () => {
    if (demoRunning || !width || !height) {
      return;
    }

    const bounds = figure.getBoundingClientRect();
    const needsScroll = bounds.top < 0 || bounds.bottom > window.innerHeight;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    demoRunning = true;
    demoButton?.setAttribute("aria-disabled", "true");
    pointer.active = false;
    lastPoint = null;

    if (needsScroll) {
      figure.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }

    window.setTimeout(
      () => {
        const path = buildDemoPath();
        const duration = reducedMotion ? 1450 : 3400;
        const startedAt = performance.now();
        const fadeDelay = 900;
        let previousPoint = path.points[0];

        figure.classList.add("demo-running");
        ghostCursor.style.transform = `translate3d(${previousPoint.x}px, ${previousPoint.y}px, 0)`;

        const animate = (time) => {
          const progress = Math.min(1, (time - startedAt) / duration);
          const point = pointAlongPath(path, progress);

          paintDemoSegment(previousPoint, point, time + fadeDelay);
          ghostCursor.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
          previousPoint = point;
          scheduleFrame();

          if (progress < 1) {
            window.requestAnimationFrame(animate);
            return;
          }

          window.setTimeout(() => {
            figure.classList.remove("demo-running");
            demoButton?.removeAttribute("aria-disabled");
            demoRunning = false;
          }, 180);
        };

        window.requestAnimationFrame(animate);
      },
      needsScroll && !reducedMotion ? 360 : 0,
    );
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

    stamps = [];
    lastPoint = null;
    lateralWander = 0;
    maskContext.clearRect(0, 0, width, height);
    drawReality();
    figure.classList.add("is-reveal-ready");
  };

  function render(time) {
    frame = 0;

    if (pointer.active && time - lastHoldTime > 112) {
      const drift = time * 0.0021;
      addWake(
        pointer.x + Math.sin(drift * 1.7) * 7,
        pointer.y + Math.cos(drift * 1.23) * 7,
        pointer.angle + randomBetween(-0.42, 0.42),
        0.13,
        0,
        time,
      );
      lastHoldTime = time;
    }

    rebuildMask(time);
    drawReality();

    if (pointer.active || stamps.length) {
      scheduleFrame();
    }
  }

  if (hasFinePointer) {
    figure.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch" || demoRunning) {
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
      if (event.pointerType === "touch" || demoRunning) {
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
  }

  demoButton?.addEventListener("click", runDemo);

  const resizeObserver = new ResizeObserver(syncCanvas);
  resizeObserver.observe(reality);

  Promise.all([
    reality.decode().catch(() => {}),
    dream.decode().catch(() => {}),
  ]).finally(syncCanvas);
})();
