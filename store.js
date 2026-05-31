const moneyFallbackUrl =
  "https://wa.me/5598981557382?text=Ol%C3%A1%2C%20vim%20pela%20loja%20da%20LEX.OS%20AI%20e%20quero%20comprar%20um%20pacote.";

const state = {
  catalog: null,
  activeFilter: "Todos",
};

const byId = (id) => document.getElementById(id);
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(pointer: fine)");

async function loadCatalog() {
  const response = await fetch("/data/catalogo.json");
  state.catalog = await response.json();
  wireGlobalLinks();
  renderFeatured();
  renderCatalog();
  renderContents();
}

function wireGlobalLinks() {
  document.querySelectorAll("[data-whatsapp-group]").forEach((link) => {
    link.href = state.catalog.whatsappGroupUrl;
  });
}

function createProductCard(product) {
  const checkoutReady = product.checkoutUrl && !product.checkoutUrl.includes("SEU-CHECKOUT");
  const checkoutUrl = checkoutReady
    ? product.checkoutUrl
    : `${moneyFallbackUrl}%20Produto:%20${encodeURIComponent(product.title)}`;
  const ctaText = checkoutReady ? "Comprar pela Kirvano" : "Solicitar liberação";

  const commands = product.commands.map((command) => `<code>${command}</code>`).join("");
  const features = product.features.map((feature) => `<li>${feature}</li>`).join("");

  return `
    <article class="product-card" data-category="${product.category}" data-reveal>
      <div class="product-kicker">
        <span>/// ${product.category} ${product.number}</span>
        <strong>${product.status}</strong>
      </div>
      <h3>${product.name}</h3>
      <p class="product-title">${product.title}</p>
      <p>${product.summary}</p>
      <div class="command-row" aria-label="Comandos inclusos">${commands}</div>
      <ul>${features}</ul>
      <div class="price-row">
        <div>
          <strong>${product.price}</strong>
          <span>${product.terms}</span>
        </div>
        <a class="buy-link" href="${checkoutUrl}" target="_blank" rel="noreferrer">${ctaText}</a>
      </div>
    </article>
  `;
}

function renderFeatured() {
  const target = byId("featured-products");
  if (!target || !state.catalog) return;

  const limit = Number(target.dataset.limit || 3);
  target.innerHTML = state.catalog.products.slice(0, limit).map(createProductCard).join("");
  revealVisible();
  bindInteractiveMotion(target);
}

function renderCatalog() {
  const target = byId("product-catalog");
  if (!target || !state.catalog) return;

  const products =
    state.activeFilter === "Todos"
      ? state.catalog.products
      : state.catalog.products.filter((product) => product.category === state.activeFilter);

  target.innerHTML = products.map(createProductCard).join("");
  revealVisible();
  bindInteractiveMotion(target);
}

function renderContents() {
  const target = byId("content-list");
  if (!target || !state.catalog) return;

  target.innerHTML = state.catalog.contents
    .map(
      (item) => `
        <article class="content-card" data-reveal>
          <span>${item.tag}</span>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <a href="${item.url}">Abrir material →</a>
        </article>
      `,
    )
    .join("");
  revealVisible();
  bindInteractiveMotion(target);
}

function wireFilters() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeFilter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      renderCatalog();
    });
  });
}

function wireMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".mobile-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function bindInteractiveMotion(root = document) {
  if (motionQuery.matches || !finePointerQuery.matches) return;

  if (!document.documentElement.dataset.pointerMotionBound) {
    document.documentElement.dataset.pointerMotionBound = "true";

    window.addEventListener("pointermove", (event) => {
      const x = event.clientX;
      const y = event.clientY;
      const shiftX = ((x / window.innerWidth) - 0.5) * 14;
      const shiftY = ((y / window.innerHeight) - 0.5) * 14;

      document.documentElement.style.setProperty("--cursor-x", `${x}px`);
      document.documentElement.style.setProperty("--cursor-y", `${y}px`);
      document.documentElement.style.setProperty("--grid-x", `${shiftX}px`);
      document.documentElement.style.setProperty("--grid-y", `${shiftY}px`);
      document.body.classList.add("is-pointer-active");
    });

    window.addEventListener("pointerleave", () => {
      document.body.classList.remove("is-pointer-active");
      document.documentElement.style.setProperty("--grid-x", "0px");
      document.documentElement.style.setProperty("--grid-y", "0px");
    });
  }

  root
    .querySelectorAll(
      ".product-card, .terminal-panel, .page-panel, .content-card, .principle-list article, .step-grid article",
    )
    .forEach((element) => {
      if (element.dataset.motionBound) return;
      element.dataset.motionBound = "true";

      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;
        const xPercent = Math.max(0, Math.min(100, (localX / rect.width) * 100));
        const yPercent = Math.max(0, Math.min(100, (localY / rect.height) * 100));

        element.style.setProperty("--glow-x", `${xPercent}%`);
        element.style.setProperty("--glow-y", `${yPercent}%`);

        if (element.classList.contains("product-card")) {
          const dx = localX / rect.width - 0.5;
          const dy = localY / rect.height - 0.5;
          element.style.setProperty("--tilt-x", `${dy * -7}deg`);
          element.style.setProperty("--tilt-y", `${dx * 8}deg`);
          element.classList.add("is-tilting");
        }
      });

      element.addEventListener("pointerleave", () => {
        element.style.setProperty("--tilt-x", "0deg");
        element.style.setProperty("--tilt-y", "0deg");
        element.style.removeProperty("--glow-x");
        element.style.removeProperty("--glow-y");
        element.classList.remove("is-tilting");
      });
    });

  root.querySelectorAll(".button, .buy-link, .chip").forEach((element) => {
    if (element.dataset.magneticBound) return;
    element.dataset.magneticBound = "true";

    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const dx = (event.clientX - rect.left - rect.width / 2) * 0.12;
      const dy = (event.clientY - rect.top - rect.height / 2) * 0.16;

      element.style.setProperty("--mag-x", `${dx}px`);
      element.style.setProperty("--mag-y", `${dy}px`);
    });

    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--mag-x", "0px");
      element.style.setProperty("--mag-y", "0px");
    });
  });
}

function revealVisible() {
  const items = document.querySelectorAll("[data-reveal]:not(.is-visible)");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  items.forEach((item) => observer.observe(item));
}

wireMenu();
wireFilters();
bindInteractiveMotion();
loadCatalog().catch(() => {
  document.body.classList.add("catalog-error");
});
