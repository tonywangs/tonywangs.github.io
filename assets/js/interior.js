(() => {
  const nav = document.querySelector(".site-nav");

  if (nav) {
    const updateNav = () => nav.classList.toggle("is-scrolled", window.scrollY > 18);
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const items = [
    ...document.querySelectorAll(".project-post, #readingList > p, #writingList > p"),
  ];

  if (!("IntersectionObserver" in window)) return;

  items.forEach((item, index) => {
    item.classList.add("reveal-item");
    item.style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 28}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -6%", threshold: 0.06 },
  );

  items.forEach((item) => observer.observe(item));
})();
