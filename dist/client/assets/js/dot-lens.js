(() => {
  const figure = document.querySelector("[data-dot-lens]");
  const image = figure?.querySelector("img");
  const canvas = figure?.querySelector(".dot-lens");

  if (!figure || !image || !canvas || window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  const outputContext = canvas.getContext("2d", { alpha: true });
  const sourceCanvas = document.createElement("canvas");
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  const stippleCanvas = document.createElement("canvas");
  const stippleContext = stippleCanvas.getContext("2d");
  const maskCanvas = document.createElement("canvas");
  const maskContext = maskCanvas.getContext("2d");
  const effectCanvas = document.createElement("canvas");
  const effectContext = effectCanvas.getContext("2d");

  if (
    !outputContext ||
    !sourceContext ||
    !stippleContext ||
    !maskContext ||
    !effectContext
  ) {
    return;
  }

  const pointer = { active: false, x: 0, y: 0 };
  const dotStep = 3.5;
  const decayTime = 640;
  let width = 0;
  let height = 0;
  let pixels = null;
  let frame = 0;
  let lastFrameTime = 0;
  let lastHoldTime = 0;
  let lastPoint = null;
  let trailEnergy = 0;

  const scheduleFrame = () => {
    if (!frame) {
      frame = window.requestAnimationFrame(render);
    }
  };

  const buildStippleImage = () => {
    stippleContext.clearRect(0, 0, width, height);

    if (!pixels) {
      return;
    }

    for (let y = dotStep / 2; y < height; y += dotStep) {
      for (let x = dotStep / 2; x < width; x += dotStep) {
        const sampleX = Math.min(width - 1, Math.max(0, Math.round(x)));
        const sampleY = Math.min(height - 1, Math.max(0, Math.round(y)));
        const index = (sampleY * width + sampleX) * 4;
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const luminance = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255;
        const saturation = (Math.max(red, green, blue) - Math.min(red, green, blue)) / 255;
        const average = (red + green + blue) / 3;
        const saturationBoost = 1.42;
        const saturatedRed = average + (red - average) * saturationBoost;
        const saturatedGreen = average + (green - average) * saturationBoost;
        const saturatedBlue = average + (blue - average) * saturationBoost;
        const contrast = luminance > 0.42 ? 0.7 : 1.18;
        const lift = luminance > 0.42 ? 0 : 22;
        const dotRed = Math.round(
          Math.min(255, Math.max(0, saturatedRed * contrast + lift)),
        );
        const dotGreen = Math.round(
          Math.min(255, Math.max(0, saturatedGreen * contrast + lift)),
        );
        const dotBlue = Math.round(
          Math.min(255, Math.max(0, saturatedBlue * contrast + lift)),
        );
        const radius = 0.68 + (1 - luminance) * 0.52 + saturation * 0.18;
        const waveX = (Math.sin(y * 0.081) + Math.sin((x + y) * 0.037)) * 0.62;
        const waveY = (Math.cos(x * 0.073) + Math.sin((x - y) * 0.029)) * 0.46;

        stippleContext.beginPath();
        stippleContext.arc(x + waveX, y + waveY, radius, 0, Math.PI * 2);
        stippleContext.fillStyle = `rgba(${dotRed}, ${dotGreen}, ${dotBlue}, 0.9)`;
        stippleContext.fill();
      }
    }
  };

  const syncCanvas = () => {
    if (!image.complete || !image.naturalWidth) {
      return;
    }

    const bounds = image.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(bounds.width));
    const nextHeight = Math.max(1, Math.round(bounds.height));
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    width = nextWidth;
    height = nextHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    outputContext.setTransform(ratio, 0, 0, ratio, 0, 0);

    for (const workingCanvas of [
      sourceCanvas,
      stippleCanvas,
      maskCanvas,
      effectCanvas,
    ]) {
      workingCanvas.width = width;
      workingCanvas.height = height;
    }

    sourceContext.drawImage(image, 0, 0, width, height);
    pixels = sourceContext.getImageData(0, 0, width, height).data;
    buildStippleImage();
    maskContext.clearRect(0, 0, width, height);
    effectContext.clearRect(0, 0, width, height);
    outputContext.clearRect(0, 0, width, height);
    trailEnergy = 0;
    lastPoint = null;
  };

  const stampTrail = (x, y, strength = 1) => {
    const radius = Math.min(42, Math.max(30, width * 0.064));
    const gradient = maskContext.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${0.76 * strength})`);
    gradient.addColorStop(0.24, `rgba(255, 255, 255, ${0.6 * strength})`);
    gradient.addColorStop(0.56, `rgba(255, 255, 255, ${0.24 * strength})`);
    gradient.addColorStop(0.82, `rgba(255, 255, 255, ${0.05 * strength})`);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    maskContext.save();
    maskContext.globalCompositeOperation = "source-over";
    maskContext.fillStyle = gradient;
    maskContext.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    maskContext.restore();
    trailEnergy = 1;
  };

  const paintTo = (x, y) => {
    const nextPoint = { x, y };

    if (!lastPoint) {
      stampTrail(x, y);
      lastPoint = nextPoint;
      return;
    }

    const dx = x - lastPoint.x;
    const dy = y - lastPoint.y;
    const distance = Math.hypot(dx, dy);
    const brushSpacing = 8;
    const steps = Math.max(1, Math.ceil(distance / brushSpacing));

    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps;
      stampTrail(lastPoint.x + dx * progress, lastPoint.y + dy * progress);
    }

    lastPoint = nextPoint;
  };

  const eventPoint = (event) => {
    const bounds = image.getBoundingClientRect();
    return {
      x: Math.min(width, Math.max(0, event.clientX - bounds.left)),
      y: Math.min(height, Math.max(0, event.clientY - bounds.top)),
    };
  };

  function render(time) {
    frame = 0;
    const elapsed = lastFrameTime ? Math.min(64, time - lastFrameTime) : 16;
    lastFrameTime = time;

    if (pointer.active && time - lastHoldTime > 72) {
      stampTrail(pointer.x, pointer.y, 0.1);
      lastHoldTime = time;
    }

    const fadeAmount = 1 - Math.exp(-elapsed / decayTime);
    maskContext.save();
    maskContext.globalCompositeOperation = "destination-out";
    maskContext.fillStyle = `rgba(0, 0, 0, ${fadeAmount})`;
    maskContext.fillRect(0, 0, width, height);
    maskContext.restore();
    trailEnergy *= Math.exp(-elapsed / decayTime);

    effectContext.clearRect(0, 0, width, height);
    effectContext.globalCompositeOperation = "source-over";
    effectContext.drawImage(stippleCanvas, 0, 0);
    effectContext.globalCompositeOperation = "destination-in";
    effectContext.drawImage(maskCanvas, 0, 0);
    effectContext.globalCompositeOperation = "source-over";

    outputContext.clearRect(0, 0, width, height);
    outputContext.drawImage(effectCanvas, 0, 0, width, height);

    if (pointer.active || trailEnergy > 0.012) {
      scheduleFrame();
    } else {
      maskContext.clearRect(0, 0, width, height);
      effectContext.clearRect(0, 0, width, height);
      outputContext.clearRect(0, 0, width, height);
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
  resizeObserver.observe(image);

  if (image.complete) {
    image.decode().catch(() => {}).finally(syncCanvas);
  } else {
    image.addEventListener("load", syncCanvas, { once: true });
  }
})();
