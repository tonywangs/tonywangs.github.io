(() => {
  const storageKey = "tony-theme";
  const root = document.documentElement;

  const storedTheme = localStorage.getItem(storageKey);
  const initialTheme = storedTheme === "dark" || storedTheme === "light"
    ? storedTheme
    : "light";

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    document.querySelectorAll('link[rel="icon"]').forEach((icon) => {
      icon.href = theme === "dark" ? "images/teal-slash-favicon.png" : "images/teal-slash-favicon-light.svg";
      icon.type = theme === "dark" ? "image/png" : "image/svg+xml";
    });
  };

  const updateToggle = (button, theme) => {
    const isDark = theme === "dark";
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    button.querySelector(".theme-toggle-copy").textContent = isDark ? "light" : "dark";
  };

  applyTheme(initialTheme);

  let fadeCleanup;

  const bindToggles = () => {
    applyTheme(root.dataset.theme);
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      updateToggle(button, root.dataset.theme);
      button.addEventListener("click", () => {
        const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
        clearTimeout(fadeCleanup);
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
          root.classList.add('theme-fading');
        }
        localStorage.setItem(storageKey, nextTheme);
        applyTheme(nextTheme);
        document.querySelectorAll('.theme-toggle').forEach(toggle => updateToggle(toggle, nextTheme));
        fadeCleanup = setTimeout(() => root.classList.remove('theme-fading'), 240);
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindToggles, { once: true });
  } else {
    bindToggles();
  }
})();
