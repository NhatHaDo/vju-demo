(() => {
  const searchForm = document.querySelector(".header-search");
  const searchInput = searchForm?.querySelector('input[name="q"]');
  const searchButton = searchForm?.querySelector('button[type="submit"]');

  searchButton?.addEventListener("click", (event) => {
    if (window.matchMedia("(max-width: 767px)").matches && !searchForm.classList.contains("search-open")) {
      event.preventDefault();
      searchForm.classList.add("search-open");
      searchInput?.focus();
    }
  });

  const filters = document.querySelectorAll(".editorial-filters [data-filter]");
  const newsCards = document.querySelectorAll(".editorial-news-card[data-category]");
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.dataset.filter;
      filters.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      newsCards.forEach((card) => {
        card.hidden = selected !== "all" && card.dataset.category !== selected;
      });
    });
  });

  const currentPath = window.location.pathname.replace(/\/+$/, "");
  if (!/(?:^|\/)(?:tin-tuc|tim-kiem)$/.test(currentPath)) return;

  const query = new URLSearchParams(window.location.search).get("q")?.trim();
  if (!query) return;

  const listing = document.querySelector(".route-listing");
  const heading = listing?.querySelector(".section-heading h2");
  const grid = listing?.querySelector(".content-grid");
  if (!listing || !heading || !grid) return;

  heading.textContent = `Kết quả tìm kiếm: ${query}`;
  const normalizedQuery = query.toLocaleLowerCase("vi");
  let visible = 0;
  grid.querySelectorAll(".content-card").forEach((card) => {
    const matches = card.textContent.toLocaleLowerCase("vi").includes(normalizedQuery);
    card.hidden = !matches;
    if (matches) visible += 1;
  });

  let emptyMessage = listing.querySelector(".empty-results");
  if (!emptyMessage) {
    emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-results";
    emptyMessage.textContent = "Chưa tìm thấy bài viết phù hợp. Thử từ khóa khác nhé.";
    grid.after(emptyMessage);
  }
  emptyMessage.hidden = visible > 0;
})();
