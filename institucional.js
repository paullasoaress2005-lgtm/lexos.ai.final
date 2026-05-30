const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const revealItems = document.querySelectorAll("[data-reveal]");

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  mobileNav.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

mobileNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    rootMargin: "0px 0px -6% 0px",
    threshold: 0.05,
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
  revealObserver.observe(item);
});
