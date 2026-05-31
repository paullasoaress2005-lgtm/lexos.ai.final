const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const revealItems = document.querySelectorAll("[data-reveal]");
const interactiveSurfaces = document.querySelectorAll(
  ".redirect-card, .raiox-panel, .method-grid article, .page-panel, .compact-grid article, .process-list article"
);
const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (menuButton && mobileNav) {
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
}

if (!reduceMotion) {
  let interactionFrame = 0;

  const updateInteraction = (clientX, clientY, pointerType = "mouse") => {
    window.cancelAnimationFrame(interactionFrame);
    interactionFrame = window.requestAnimationFrame(() => {
      const mobileIntensity = pointerType === "touch" ? 0.42 : 1;
      const offsetX = (clientX - window.innerWidth / 2) * 0.018 * mobileIntensity;
      const offsetY = (clientY - window.innerHeight / 2) * 0.018 * mobileIntensity;

      root.style.setProperty("--light-x", `${clientX}px`);
      root.style.setProperty("--light-y", `${clientY}px`);
      root.style.setProperty("--grid-shift-x", `${offsetX.toFixed(2)}px`);
      root.style.setProperty("--grid-shift-y", `${offsetY.toFixed(2)}px`);
    });
  };

  const trackPointer = (event) => {
    updateInteraction(event.clientX, event.clientY, event.pointerType);
  };

  window.addEventListener("pointermove", trackPointer, { passive: true });
  window.addEventListener("pointerdown", trackPointer, { passive: true });

  interactiveSurfaces.forEach((surface) => {
    surface.addEventListener(
      "pointermove",
      (event) => {
        const bounds = surface.getBoundingClientRect();
        surface.style.setProperty("--card-x", `${event.clientX - bounds.left}px`);
        surface.style.setProperty("--card-y", `${event.clientY - bounds.top}px`);
      },
      { passive: true }
    );
  });
}

if ("IntersectionObserver" in window) {
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
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
