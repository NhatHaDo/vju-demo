(() => {
  const root = document.body.dataset.root || "./";
  const header = document.querySelector("[data-e-header]");

  /* sticky header */
  if (header) {
    const spacer = document.createElement("div");
    spacer.className = "e-header-spacer";
    header.after(spacer);
    const threshold = () => header.offsetHeight + 160;
    window.addEventListener("scroll", () => {
      const sticky = window.scrollY > threshold();
      if (sticky !== header.classList.contains("is-sticky")) {
        spacer.style.height = sticky ? `${header.offsetHeight}px` : "0";
        header.classList.toggle("is-sticky", sticky);
      }
    }, { passive: true });
  }

  /* dropdown menus (hover, keyboard, touch) */
  const items = [...document.querySelectorAll(".e-nav__item.has-children")];
  const close = (li) => { li.classList.remove("is-open"); li.querySelector(":scope > a")?.setAttribute("aria-expanded", "false"); };
  const open = (li) => { items.forEach((i) => i !== li && close(i)); li.classList.add("is-open"); li.querySelector(":scope > a")?.setAttribute("aria-expanded", "true"); };
  items.forEach((li) => {
    let t;
    li.addEventListener("mouseenter", () => { clearTimeout(t); open(li); });
    li.addEventListener("mouseleave", () => { t = setTimeout(() => close(li), 150); });
    li.addEventListener("focusin", () => open(li));
    li.addEventListener("focusout", (e) => { if (!li.contains(e.relatedTarget)) close(li); });
    li.querySelector(":scope > a").addEventListener("click", (e) => {
      if (!li.classList.contains("is-open") && window.matchMedia("(hover: none)").matches) { e.preventDefault(); open(li); }
    });
  });
  document.querySelectorAll(".e-dropdown .has-children").forEach((li) => {
    li.addEventListener("mouseenter", () => li.classList.add("is-open"));
    li.addEventListener("mouseleave", () => li.classList.remove("is-open"));
    li.addEventListener("focusin", () => li.classList.add("is-open"));
    li.addEventListener("focusout", (e) => { if (!li.contains(e.relatedTarget)) li.classList.remove("is-open"); });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".e-nav__item")) items.forEach(close); });

  /* search popup */
  const search = document.getElementById("e-search");
  const searchBtns = [...document.querySelectorAll(".e-search-toggle")];
  let searchOpener = null;
  const closeSearch = () => {
    if (!search || search.hidden) return;
    search.hidden = true;
    searchBtns.forEach((b) => b.setAttribute("aria-expanded", "false"));
    document.body.classList.remove("e-side-open");
    searchOpener?.focus();
  };
  searchBtns.forEach((btn) => btn.addEventListener("click", () => {
    searchOpener = btn;
    search.hidden = false;
    searchBtns.forEach((b) => b.setAttribute("aria-expanded", "true"));
    document.body.classList.add("e-side-open");
    search.querySelector("input").focus();
  }));
  search?.querySelector(".e-search__close")?.addEventListener("click", closeSearch);
  search?.addEventListener("click", (e) => { if (e.target === search) closeSearch(); });

  /* side panel with accordion */
  const side = document.getElementById("e-side");
  const burger = document.querySelector(".e-burger");
  const openSide = () => {
    side.classList.add("is-open");
    side.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    document.body.classList.add("e-side-open");
    side.querySelector(".e-side__close").focus();
  };
  const closeSide = () => {
    if (!side?.classList.contains("is-open")) return;
    side.classList.remove("is-open");
    side.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("e-side-open");
    burger.focus();
  };
  burger?.addEventListener("click", openSide);
  side?.querySelectorAll("[data-e-side-close]").forEach((b) => b.addEventListener("click", closeSide));
  side?.addEventListener("click", (e) => {
    const btn = e.target.closest(".e-acc__toggle");
    if (!btn) return;
    const sub = btn.closest("li").querySelector(":scope > .e-acc--sub");
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
    sub.hidden = expanded;
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const openItem = items.find((i) => i.classList.contains("is-open"));
    if (openItem) { close(openItem); openItem.querySelector("a").focus(); }
    closeSearch();
    closeSide();
  });

  /* sliders */
  document.querySelectorAll("[data-e-slider]").forEach((slider) => {
    const track = slider.querySelector(".e-slider__track");
    const nav = slider.id ? document.querySelector(`[data-e-nav-for="${slider.id}"]`) || slider : slider;
    const step = () => { const first = track.children[0]; return first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap) || 30 : track.clientWidth; };
    const update = () => {
      const prev = nav.querySelector("[data-e-prev]");
      const next = nav.querySelector("[data-e-next]");
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    nav.querySelector("[data-e-prev]")?.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    nav.querySelector("[data-e-next]")?.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* hero slider */
  const hero = document.querySelector("[data-e-hero]");
  if (hero) {
    const slides = [...hero.querySelectorAll(".e-hero__slide")];
    const dots = [...hero.querySelectorAll(".e-hero__dots button")];
    let current = 0;
    let timer;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const go = (i) => {
      current = (i + slides.length) % slides.length;
      slides.forEach((s, k) => {
        const on = k === current;
        s.classList.toggle("is-active", on);
        s.setAttribute("aria-hidden", String(!on));
        s.querySelectorAll("a").forEach((a) => (on ? a.removeAttribute("tabindex") : a.setAttribute("tabindex", "-1")));
      });
      dots.forEach((d, k) => d.setAttribute("aria-current", String(k === current)));
    };
    const play = () => { if (reduce) return; clearInterval(timer); timer = setInterval(() => go(current + 1), 6500); };
    hero.querySelector(".e-hero__arrow--prev")?.addEventListener("click", () => { go(current - 1); play(); });
    hero.querySelector(".e-hero__arrow--next")?.addEventListener("click", () => { go(current + 1); play(); });
    dots.forEach((d, k) => d.addEventListener("click", () => { go(k); play(); }));
    hero.addEventListener("mouseenter", () => clearInterval(timer));
    hero.addEventListener("mouseleave", play);
    hero.addEventListener("focusin", () => clearInterval(timer));
    play();
  }

  /* back to top */
  const toTop = document.querySelector(".e-totop");
  if (toTop) {
    window.addEventListener("scroll", () => { toTop.hidden = window.scrollY < 600; }, { passive: true });
    toTop.addEventListener("click", () => window.scrollTo({ top: 0 }));
  }

  /* search page */
  const results = document.querySelector("[data-e-search-results]");
  if (results) {
    const params = new URLSearchParams(location.search);
    const q = (params.get("q") || "").trim();
    const level = params.get("level") || "";
    const status = document.querySelector("[data-e-search-status]");
    const input = document.getElementById("e-q");
    const select = document.getElementById("e-level");
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
        document.querySelector("[data-e-search-heading]").textContent = `Kết quả tìm kiếm ${label}`;
        status.textContent = hits.length ? `Tìm thấy ${hits.length} trang phù hợp.` : "Chưa tìm thấy trang phù hợp. Thử từ khóa khác hoặc chọn tất cả các trang.";
        results.innerHTML = hits.map((p) => `<a class="e-card e-card--link" href="${root}${p.url}"><div class="e-card__media"><img src="${root}${p.img}" alt="" loading="lazy"></div><div class="e-card__body"><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.desc)}</p></div></a>`).join("");
      }).catch(() => { status.textContent = "Không tải được dữ liệu tìm kiếm. Hãy mở website qua HTTP server."; });
    }
  }
})();
