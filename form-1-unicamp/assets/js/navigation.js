(() => {
  const nav = document.querySelector(".primary-nav");
  const menuButton = document.querySelector(".mobile-menu-trigger");
  if (!nav || !menuButton) return;

  const closeBranches = () => {
    nav.querySelectorAll(".nav-branch.is-expanded").forEach((branch) => {
      branch.classList.remove("is-expanded");
      const toggle = branch.querySelector(":scope > .nav-link-row > .submenu-toggle");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", `Mở menu ${branch.querySelector(":scope > .nav-link-row > a")?.textContent?.trim() ?? ""}`);
      }
    });
  };

  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("mobile-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Đóng menu" : "Mở menu");
    if (!isOpen) closeBranches();
  });

  nav.addEventListener("click", (event) => {
    const toggle = event.target.closest(".submenu-toggle");
    if (toggle) {
      event.preventDefault();
      event.stopPropagation();
      const branch = toggle.closest(".nav-branch");
      const expanded = branch.classList.toggle("is-expanded");
      toggle.setAttribute("aria-expanded", String(expanded));
      const label = branch.querySelector(":scope > .nav-link-row > a")?.textContent?.trim() ?? "";
      toggle.setAttribute("aria-label", `${expanded ? "Đóng" : "Mở"} menu ${label}`);
      return;
    }
    if (event.target.closest("a") && window.matchMedia("(max-width: 767px)").matches) {
      nav.classList.remove("mobile-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Mở menu");
      closeBranches();
    }
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeBranches();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    nav.classList.remove("mobile-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Mở menu");
    closeBranches();
    menuButton.focus();
  });
})();
