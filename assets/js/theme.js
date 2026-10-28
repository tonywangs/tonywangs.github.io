(() => {
  const storageKey = "tony-theme";
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  const storedTheme = localStorage.getItem(storageKey);
  const initialTheme = storedTheme === "dark" || storedTheme === "light"
    ? storedTheme
    : (prefersDark.matches ? "dark" : "light");

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  };

  const updateToggle = (button, theme) => {
    const isDark = theme === "dark";
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    button.querySelector(".theme-toggle-copy").textContent = isDark ? "light" : "dark";
  };

  applyTheme(initialTheme);

  const bindToggles = () => {
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      updateToggle(button, root.dataset.theme);
      button.addEventListener("click", () => {
        const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
        localStorage.setItem(storageKey, nextTheme);
        applyTheme(nextTheme);
        document.querySelectorAll(".theme-toggle").forEach((toggle) => updateToggle(toggle, nextTheme));
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindToggles, { once: true });
  } else {
    bindToggles();
  }
})();
