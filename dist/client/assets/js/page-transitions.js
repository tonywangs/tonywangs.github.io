(() => {
  const root = document.documentElement;

  root.classList.add("page-arriving");
  window.setTimeout(() => root.classList.remove("page-arriving"), 650);
})();
