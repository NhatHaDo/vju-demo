(() => {
  const root = document.body.dataset.root || "./";
  const header = document.querySelector("[data-u-header]");

  /* sticky header */
  if (header) {
    const spacer = document.createElement("div");
    spacer.className = "u-header-spacer";
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
  const items = [...document.querySelectorAll(".u-nav__item.has-children")];
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
  document.querySelectorAll(".u-dropdown .has-children").forEach((li) => {
    li.addEventListener("mouseenter", () => li.classList.add("is-open"));
    li.addEventListener("mouseleave", () => li.classList.remove("is-open"));
    li.addEventListener("focusin", () => li.classList.add("is-open"));
    li.addEventListener("focusout", (e) => { if (!li.contains(e.relatedTarget)) li.classList.remove("is-open"); });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".u-nav__item")) items.forEach(close); });

  /* search overlay */
  const searchBtn = document.querySelector(".u-search-toggle");
  const search = document.getElementById("u-search");
  const closeSearch = () => { if (search && !search.hidden) { search.hidden = true; searchBtn.setAttribute("aria-expanded", "false"); } };
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

  /* side panel with accordion */
  const side = document.getElementById("u-side");
  const burger = document.querySelector(".u-burger");
  const openSide = () => {
    side.classList.add("is-open");
    side.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    document.body.classList.add("u-side-open");
    side.querySelector(".u-side__close").focus();
  };
  const closeSide = () => {
    if (!side?.classList.contains("is-open")) return;
    side.classList.remove("is-open");
    side.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("u-side-open");
    burger.focus();
  };
  burger?.addEventListener("click", openSide);
  side?.querySelectorAll("[data-u-side-close]").forEach((b) => b.addEventListener("click", closeSide));
  side?.addEventListener("click", (e) => {
    const btn = e.target.closest(".u-acc__toggle");
    if (!btn) return;
    const sub = btn.closest("li").querySelector(":scope > .u-acc--sub");
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
  document.querySelectorAll("[data-u-slider]").forEach((slider) => {
    const track = slider.querySelector(".u-slider__track");
    const nav = slider.id ? document.querySelector(`[data-u-nav-for="${slider.id}"]`) || slider : slider;
    const step = () => { const first = track.children[0]; return first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 30) : track.clientWidth; };
    const update = () => {
      const prev = nav.querySelector("[data-u-prev]");
      const next = nav.querySelector("[data-u-next]");
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    nav.querySelector("[data-u-prev]")?.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    nav.querySelector("[data-u-next]")?.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* search page */
  const results = document.querySelector("[data-u-search-results]");
  if (results) {
    const params = new URLSearchParams(location.search);
    const q = (params.get("q") || "").trim();
    const level = params.get("level") || "";
    const status = document.querySelector("[data-u-search-status]");
    const input = document.getElementById("u-q");
    const select = document.getElementById("u-level");
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
        document.querySelector("[data-u-search-heading]").textContent = `Kết quả tìm kiếm ${label}`;
        status.textContent = hits.length ? `Tìm thấy ${hits.length} trang phù hợp.` : "Chưa tìm thấy trang phù hợp. Thử từ khóa khác hoặc chọn tất cả các trang.";
        results.innerHTML = hits.map((p) => `<a class="u-card u-card--link" href="${root}${p.url}"><div class="u-card__media"><img src="${root}${p.img}" alt="" loading="lazy"></div><div class="u-card__body"><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.desc)}</p></div></a>`).join("");
      }).catch(() => { status.textContent = "Không tải được dữ liệu tìm kiếm. Hãy mở website qua HTTP server."; });
    }
  }
})();
