(() => {
  const personalHosts = new Set([
    window.location.hostname,
    "tonywang.xyz",
    "www.tonywang.xyz",
  ]);

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    let url;
    try {
      url = new URL(href, window.location.href);
    } catch {
      return;
    }

    if (url.protocol === "mailto:" || url.protocol === "tel:") {
      link.removeAttribute("target");
      return;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") return;

    if (personalHosts.has(url.hostname)) {
      link.target = "_self";
      return;
    }

    link.target = "_blank";
    const rel = new Set((link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
    rel.add("noopener");
    rel.add("noreferrer");
    link.setAttribute("rel", [...rel].join(" "));
  });
})();
