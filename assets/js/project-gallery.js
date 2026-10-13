(() => {
  const syncRatio = (image) => {
    if (!image.naturalWidth || !image.naturalHeight) {
      return;
    }

    image.style.setProperty(
      "--image-ratio",
      String(image.naturalWidth / image.naturalHeight),
    );
  };

  document.querySelectorAll(".project-images-row .project-image").forEach((image) => {
    if (image.complete) {
      syncRatio(image);
    } else {
      image.addEventListener("load", () => syncRatio(image), { once: true });
    }
  });
})();
