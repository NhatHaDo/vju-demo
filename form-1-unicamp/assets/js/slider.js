(() => {
  const carousel = document.querySelector(".hero-slider");
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll(".hero-slide")];
  const dots = [...carousel.querySelectorAll(".hero-pagination button")];
  const eyebrow = carousel.querySelector(".hero-eyebrow");
  const heading = carousel.querySelector(".hero-inner h1");
  const copy = carousel.querySelector(".hero-copy");
  const action = carousel.querySelector(".hero-inner .button");
  if (slides.length !== 3 || !eyebrow || !heading || !copy || !action) return;

  const content = [
    {
      eyebrow: "Đại học Việt Nam – Nhật Bản",
      title: "Cùng kiến tạo tương lai bền vững",
      text: "Môi trường học thuật liên ngành, kết nối tri thức và trải nghiệm Việt Nam – Nhật Bản.",
      href: "./ve-vju/",
      action: "Khám phá VJU",
    },
    {
      eyebrow: "Đào tạo và nghiên cứu",
      title: "Học tập từ những vấn đề của thế giới thật",
      text: "Phát triển năng lực chuyên môn qua thực hành, nghiên cứu và hợp tác quốc tế.",
      href: "./dao-tao/",
      action: "Tìm hiểu chương trình",
    },
    {
      eyebrow: "Tuyển sinh VJU 2026",
      title: "Bắt đầu hành trình của bạn tại VJU",
      text: "Khám phá các chương trình đại học, sau đại học và cơ hội học tập tại VJU.",
      href: "./tuyen-sinh/",
      action: "Thông tin tuyển sinh",
    },
  ];
  let active = 0;
  let timer;

  const show = (next) => {
    active = (next + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      slide.classList.toggle("active", index === active);
      slide.setAttribute("aria-hidden", String(index !== active));
    });
    dots.forEach((dot, index) => dot.setAttribute("aria-current", String(index === active)));
    eyebrow.textContent = content[active].eyebrow;
    heading.textContent = content[active].title;
    copy.textContent = content[active].text;
    action.href = content[active].href;
    action.innerHTML = `${content[active].action} <span aria-hidden="true">→</span>`;
  };

  const start = () => {
    window.clearInterval(timer);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timer = window.setInterval(() => show(active + 1), 6500);
    }
  };

  dots.forEach((dot, index) => dot.addEventListener("click", () => { show(index); start(); }));
  const arrows = carousel.querySelectorAll(".hero-arrows button");
  arrows[0]?.addEventListener("click", () => { show(active - 1); start(); });
  arrows[1]?.addEventListener("click", () => { show(active + 1); start(); });
  carousel.addEventListener("mouseenter", () => window.clearInterval(timer));
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("focusin", () => window.clearInterval(timer));
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) start();
  });
  show(0);
  start();
})();
