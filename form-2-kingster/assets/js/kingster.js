(() => {
  const root = document.body.dataset.root || "./";
  const header = document.querySelector("[data-k-header]");
  const desktop = window.matchMedia("(min-width: 1000px)");

  /* sticky header */
  if (header) {
    const spacer = document.createElement("div");
    spacer.className = "k-header-spacer";
    header.after(spacer);
    let threshold = 0;
    const measure = () => { threshold = header.offsetTop + header.offsetHeight + 120; };
    const onScroll = () => {
      const sticky = window.scrollY > threshold;
      if (sticky !== header.classList.contains("is-sticky")) {
        spacer.style.height = sticky ? `${header.offsetHeight}px` : "0";
        header.classList.toggle("is-sticky", sticky);
        placeMega();
      }
    };
    measure();
    window.addEventListener("resize", () => { if (!header.classList.contains("is-sticky")) measure(); placeMega(); });
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* navigation: slide bar, dropdowns, mega menu */
  const nav = document.querySelector(".k-nav");
  const bar = nav?.querySelector(".k-nav__bar");
  const items = [...document.querySelectorAll(".k-nav__item")];
  const activeItem = document.querySelector(".k-nav__item.is-active");
  const moveBar = (item) => {
    if (!bar || !nav) return;
    if (!item) { bar.style.width = "0"; return; }
    const link = item.querySelector(".k-nav__link");
    const navBox = nav.getBoundingClientRect();
    const box = link.getBoundingClientRect();
    bar.style.width = `${box.width}px`;
    bar.style.transform = `translateX(${box.left - navBox.left}px)`;
  };
  function placeMega() {
    const mega = document.querySelector(".k-mega");
    if (mega && header) mega.style.top = `${header.getBoundingClientRect().bottom}px`;
  }
  const close = (item) => { item.classList.remove("is-open"); item.querySelector(":scope > .k-nav__link")?.setAttribute("aria-expanded", "false"); };
  const open = (item) => {
    items.forEach((i) => i !== item && close(i));
    if (!item.classList.contains("has-children")) return;
    placeMega();
    item.classList.add("is-open");
    item.querySelector(":scope > .k-nav__link")?.setAttribute("aria-expanded", "true");
  };
  items.forEach((item) => {
    let timer;
    item.addEventListener("mouseenter", () => { clearTimeout(timer); open(item); moveBar(item); });
    item.addEventListener("mouseleave", () => { timer = setTimeout(() => close(item), 160); moveBar(activeItem); });
    item.addEventListener("focusin", () => { open(item); moveBar(item); });
    item.addEventListener("focusout", (e) => { if (!item.contains(e.relatedTarget)) { close(item); moveBar(activeItem); } });
    const link = item.querySelector(":scope > .k-nav__link");
    link?.addEventListener("click", (e) => {
      // touch devices: first tap opens the panel, second tap follows the link
      if (item.classList.contains("has-children") && !item.classList.contains("is-open") && window.matchMedia("(hover: none)").matches) { e.preventDefault(); open(item); }
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const openItem = items.find((i) => i.classList.contains("is-open"));
    if (openItem) { close(openItem); openItem.querySelector(".k-nav__link")?.focus(); }
    closeSearch();
    closeMobile();
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".k-nav__item")) items.forEach(close); });
  window.addEventListener("load", () => moveBar(activeItem));
  window.addEventListener("resize", () => moveBar(activeItem));
  document.fonts?.ready.then(() => moveBar(activeItem));

  /* search overlay */
  const searchBtn = document.querySelector(".k-search-toggle");
  const search = document.getElementById("k-search");
  function closeSearch() { if (search && !search.hidden) { search.hidden = true; searchBtn.setAttribute("aria-expanded", "false"); } }
  searchBtn?.addEventListener("click", () => {
    const show = search.hidden;
    search.hidden = !show;
    searchBtn.setAttribute("aria-expanded", String(show));
    if (show) {
      const sticky = header.classList.contains("is-sticky");
      search.style.position = sticky ? "fixed" : "absolute";
      search.style.top = `${sticky ? header.offsetHeight : header.offsetTop + header.offsetHeight}px`;
      search.querySelector("input").focus();
    }
  });

  /* mobile menu with sliding panels */
  const mm = document.getElementById("k-mm");
  const burger = document.querySelector(".k-burger");
  const rootPanel = mm?.querySelector(".k-mm__panel--root");
  function resetPanels() {
    mm?.querySelectorAll(".k-mm__panel").forEach((p) => { p.classList.remove("is-current", "is-parent"); if (p !== rootPanel) p.hidden = true; });
    rootPanel?.classList.add("is-current");
  }
  function openMobile() {
    resetPanels();
    mm.classList.add("is-open");
    mm.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    document.body.classList.add("k-mm-open");
    mm.querySelector(".k-mm__close").focus();
  }
  function closeMobile() {
    if (!mm?.classList.contains("is-open")) return;
    mm.classList.remove("is-open");
    mm.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("k-mm-open");
    burger.focus();
  }
  burger?.addEventListener("click", openMobile);
  mm?.querySelectorAll("[data-k-mm-close]").forEach((b) => b.addEventListener("click", closeMobile));
  mm?.addEventListener("click", (e) => {
    const next = e.target.closest(".k-mm__next");
    const back = e.target.closest(".k-mm__back");
    if (next) {
      const panel = next.parentElement.querySelector(":scope > .k-mm__panel");
      const parent = next.closest(".k-mm__panel");
      // move panel to drawer level so it overlays the parent panel
      if (panel.parentElement !== parent.parentElement) { panel._origin = next.parentElement; parent.parentElement.appendChild(panel); }
      panel._parent = parent;
      parent.classList.remove("is-current");
      parent.classList.add("is-parent");
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add("is-current"));
      panel.querySelector(".k-mm__back").focus();
    } else if (back) {
      const panel = back.closest(".k-mm__panel");
      const parent = panel._parent || rootPanel;
      panel.classList.remove("is-current");
      setTimeout(() => { panel.hidden = true; }, 300);
      parent.classList.remove("is-parent");
      parent.classList.add("is-current");
    }
  });
  desktop.addEventListener("change", (e) => { if (e.matches) closeMobile(); });

  /* hero slider */
  document.querySelectorAll("[data-k-slider]").forEach((slider) => {
    const slides = [...slider.querySelectorAll(".k-hero__slide")];
    const dots = [...slider.querySelectorAll(".k-hero__dots button")];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = 0;
    let timer;
    const go = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => { s.classList.toggle("is-active", n === index); s.setAttribute("aria-hidden", String(n !== index)); s.querySelectorAll("a").forEach((a) => { a.tabIndex = n === index ? 0 : -1; }); });
      dots.forEach((d, n) => d.setAttribute("aria-selected", String(n === index)));
    };
    const play = () => { if (reduce) return; clearInterval(timer); timer = setInterval(() => go(index + 1), 6500); };
    const stop = () => clearInterval(timer);
    slider.querySelector(".k-hero__arrow--prev")?.addEventListener("click", () => { go(index - 1); play(); });
    slider.querySelector(".k-hero__arrow--next")?.addEventListener("click", () => { go(index + 1); play(); });
    dots.forEach((d, n) => d.addEventListener("click", () => { go(n); play(); }));
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", play);
    slider.addEventListener("focusin", stop);
    let startX = null;
    slider.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) { go(index + (dx < 0 ? 1 : -1)); play(); }
      startX = null;
    });
    go(0);
    play();
  });

  /* tabs */
  document.querySelectorAll("[data-k-tabs]").forEach((tabs) => {
    const buttons = [...tabs.querySelectorAll('[role="tab"]')];
    const select = (btn) => {
      buttons.forEach((b) => {
        const on = b === btn;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
        document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
      });
    };
    buttons.forEach((b, i) => {
      b.addEventListener("click", () => select(b));
      b.addEventListener("keydown", (e) => {
        const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!dir) return;
        const next = buttons[(i + dir + buttons.length) % buttons.length];
        select(next);
        next.focus();
      });
    });
  });

  /* search page */
  const results = document.querySelector("[data-k-search-results]");
  if (results) {
    const params = new URLSearchParams(location.search);
    const q = (params.get("q") || "").trim();
    const level = params.get("level") || "";
    const status = document.querySelector("[data-k-search-status]");
    const input = document.getElementById("k-q");
    const select = document.getElementById("k-level");
    input.value = q;
    if ([...select.options].some((o) => o.value === level)) select.value = level;
    const norm = (s) => s.toLocaleLowerCase("vi").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
    const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    if (q || level) {
      fetch(`${root}assets/data/search-index.json`).then((r) => r.json()).then((index) => {
        const terms = norm(q).split(/\s+/).filter(Boolean);
        const hits = index.filter((p) => (!level || p.url.startsWith(level)) && (!terms.length || terms.every((t) => norm(`${p.title} ${p.desc} ${p.text || ""}`).includes(t))))
          .map((p) => ({ ...p, score: terms.reduce((s, t) => s + (norm(p.title).includes(t) ? 3 : 0) + (norm(p.desc).includes(t) ? 1 : 0), 0) }))
          .sort((a, b) => b.score - a.score);
        const label = [q && `“${q}”`, level && select.options[select.selectedIndex].text].filter(Boolean).join(" trong ");
        document.querySelector("[data-k-search-heading]").textContent = `Kết quả tìm kiếm ${label}`;
        status.textContent = hits.length ? `Tìm thấy ${hits.length} trang phù hợp.` : "Chưa tìm thấy trang phù hợp. Thử từ khóa khác hoặc chọn tất cả các trang.";
        results.innerHTML = hits.map((p) => `<a class="k-card k-card--link" href="${root}${p.url}"><div class="k-card__media"><img src="${root}${p.img}" alt="" loading="lazy"></div><div class="k-card__body"><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.desc)}</p></div></a>`).join("");
      }).catch(() => { status.textContent = "Không tải được dữ liệu tìm kiếm. Hãy mở website qua HTTP server."; });
    }
  }
})();
