(() => {
  const article = document.querySelector(".about");
  if (!article) return;

  // Give each word its own window onto the same continuous gradient.
  // This also keeps links that wrap across lines aligned with the page.
  for (const link of article.querySelectorAll("a:not(.github-chart-link)")) {
    const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const part of node.textContent.split(/(\s+)/)) {
        if (!part.trim()) fragment.append(document.createTextNode(part));
        else {
          const word = document.createElement("span");
          word.className = "sunset-word";
          word.textContent = part;
          fragment.append(word);
        }
      }
      node.replaceWith(fragment);
    }
  }
  let frame;
  const update = () => {
    const bounds = article.getBoundingClientRect();
    for (const word of article.querySelectorAll(".sunset-word")) {
      const rect = word.getBoundingClientRect();
      word.style.setProperty("--sunset-size", `${bounds.width}px ${bounds.height}px`);
      word.style.setProperty("--sunset-position", `${bounds.left - rect.left}px ${bounds.top - rect.top}px`);
    }
  };
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  };
  new ResizeObserver(schedule).observe(article);
  window.addEventListener("resize", schedule);
  article.addEventListener("animationend", schedule);
  document.fonts.ready.then(schedule);
  schedule();
})();
