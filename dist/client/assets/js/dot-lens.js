(() => {
  const figure = document.querySelector("[data-dot-lens]");
  const image = figure?.querySelector("img");
  const canvas = figure?.querySelector(".dot-lens");

  if (!figure || !image || !canvas || window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  const context = canvas.getContext("2d", { alpha: true });
  const sampleCanvas = document.createElement("canvas");
  const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });

  if (!context || !sampleContext) {
    return;
  }

  const pointer = { active: false, x: 0, y: 0 };
  const dotStep = 6;
  let width = 0;
  let height = 0;
  let pixelData = null;
  let frame = 0;

  const scheduleDraw = () => {
    if (!frame) {
      frame = window.requestAnimationFrame(draw);
    }
  };

  const syncCanvas = () => {
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
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    sampleCanvas.width = width;
    sampleCanvas.height = height;
    sampleContext.clearRect(0, 0, width, height);
    sampleContext.drawImage(image, 0, 0, width, height);
    pixelData = sampleContext.getImageData(0, 0, width, height).data;
    scheduleDraw();
  };

  function draw() {
    frame = 0;
    context.clearRect(0, 0, width, height);

    if (!pointer.active || !pixelData) {
      return;
    }

    const radius = Math.min(88, width * 0.18);
    const left = Math.max(0, pointer.x - radius);
    const top = Math.max(0, pointer.y - radius);
    const size = radius * 2;

    context.save();
    context.beginPath();
    context.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
    context.clip();
    context.fillStyle = "rgba(250, 249, 245, 0.96)";
    context.fillRect(left, top, size, size);

    const firstX = Math.floor(left / dotStep) * dotStep + dotStep / 2;
    const firstY = Math.floor(top / dotStep) * dotStep + dotStep / 2;
    const right = Math.min(width, pointer.x + radius);
    const bottom = Math.min(height, pointer.y + radius);

    for (let y = firstY; y <= bottom; y += dotStep) {
      for (let x = firstX; x <= right; x += dotStep) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;

        if (dx * dx + dy * dy > radius * radius) {
          continue;
        }

        const sampleX = Math.min(width - 1, Math.max(0, Math.round(x)));
        const sampleY = Math.min(height - 1, Math.max(0, Math.round(y)));
        const index = (sampleY * width + sampleX) * 4;
        const red = pixelData[index];
        const green = pixelData[index + 1];
        const blue = pixelData[index + 2];
        const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
        const darkness = 1 - luminance / 255;
        const dotRadius = 0.35 + darkness * 2.45;

        context.beginPath();
        context.arc(x, y, dotRadius, 0, Math.PI * 2);
        context.fillStyle = `rgba(31, 30, 27, ${0.34 + darkness * 0.66})`;
        context.fill();
      }
    }

    context.restore();
    context.beginPath();
    context.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
    context.strokeStyle = "rgba(255, 255, 255, 0.52)";
    context.lineWidth = 1;
    context.stroke();
  }

  figure.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "touch") {
      return;
    }

    const bounds = image.getBoundingClientRect();
    pointer.active = true;
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
    scheduleDraw();
  });

  figure.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") {
      return;
    }

    const bounds = image.getBoundingClientRect();
    pointer.active = true;
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
    scheduleDraw();
  });

  figure.addEventListener("pointerleave", () => {
    pointer.active = false;
    scheduleDraw();
  });

  const resizeObserver = new ResizeObserver(syncCanvas);
  resizeObserver.observe(image);

  if (image.complete) {
    image.decode().catch(() => {}).finally(syncCanvas);
  } else {
    image.addEventListener("load", syncCanvas, { once: true });
  }
})();
