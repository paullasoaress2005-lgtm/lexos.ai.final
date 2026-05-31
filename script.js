const projects = [
  {
    eyebrow: "Frente 01",
    area: "Produção assistida",
    year: "2026",
    description:
      "Fluxos operacionais para transformar volume jurídico em rotina controlada, com IA como apoio de produção, revisão e priorização.",
    href: "/bpo-juridico",
    visual: "./visuals/bpo.svg",
  },
  {
    eyebrow: "Frente 02",
    area: "Capacitação aplicada",
    year: "2026",
    description:
      "Formações para equipes jurídicas adotarem IA com segurança, linguagem simples e exemplos conectados ao trabalho real.",
    href: "/treinamento",
    visual: "./visuals/training.svg",
  },
  {
    eyebrow: "Frente 03",
    area: "Arquitetura de IA",
    year: "2026",
    description:
      "Agentes, automações e sistemas internos desenhados para reduzir retrabalho e organizar tarefas repetitivas da operação jurídica.",
    href: "/agentes-sistemas",
    visual: "./visuals/agents.svg",
  },
  {
    eyebrow: "Frente 04",
    area: "Diagnóstico executivo",
    year: "2026",
    description:
      "Uma leitura objetiva da maturidade da operação, com mapa de oportunidades para aplicar IA sem perder governança.",
    href: "/raio-x",
    visual: "./visuals/raiox.svg",
  },
  {
    eyebrow: "Marketplace 05",
    area: "Plugins jurídicos",
    year: "2026",
    description:
      "Um ambiente de compra e descoberta para plugins, pacotes e soluções prontas que ampliam o ecossistema LEX.OS.",
    href: "/store",
    visual: "./visuals/store.svg",
  },
];

const root = document.body;
const eyebrowEl = document.querySelector("#activeEyebrow");
const areaEl = document.querySelector("#activeArea");
const yearEl = document.querySelector("#activeYear");
const descEl = document.querySelector("#activeDescription");
const linkEl = document.querySelector("#activeLink");
const visualEl = document.querySelector("#activeVisual");
const counterEl = document.querySelector("#counterCurrent");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const rows = [...document.querySelectorAll(".project-row")];
const stepButtons = [...document.querySelectorAll(".steps button")];
const clock = document.querySelector("#clock");

let activeIndex = 0;
let lockUntil = 0;
let touchStartY = 0;
let touchStartX = 0;

function setInteractionPoint(clientX, clientY) {
  const x = clientX - window.innerWidth / 2;
  const y = clientY - window.innerHeight / 2;

  root.style.setProperty("--mx", `${x}px`);
  root.style.setProperty("--my", `${y}px`);
  root.style.setProperty("--spot-x", `${clientX}px`);
  root.style.setProperty("--spot-y", `${clientY}px`);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateClock() {
  const time = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Fortaleza",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  clock.textContent = `BRT ${time}`;
}

function updateProject(index, instant = false) {
  const nextIndex = (index + projects.length) % projects.length;
  if (nextIndex === activeIndex && !instant) return;

  activeIndex = nextIndex;
  const project = projects[activeIndex];

  root.dataset.project = String(activeIndex + 1);
  root.classList.add("is-switching");

  window.setTimeout(
    () => {
      eyebrowEl.textContent = project.eyebrow;
      areaEl.textContent = project.area;
      yearEl.textContent = project.year;
      descEl.textContent = project.description;
      linkEl.href = project.href;
      visualEl.src = project.visual;
      counterEl.textContent = pad(activeIndex + 1);

      const progress = Math.round((activeIndex / (projects.length - 1)) * 100);
      progressText.textContent = `${progress}%`;
      progressBar.style.setProperty("--progress", `${progress}%`);

      rows.forEach((row) => row.classList.toggle("is-active", Number(row.dataset.index) === activeIndex));
      stepButtons.forEach((button) =>
        button.classList.toggle("is-active", Number(button.dataset.index) === activeIndex),
      );
    },
    instant ? 0 : 120,
  );

  window.setTimeout(
    () => {
      root.classList.remove("is-switching");
    },
    instant ? 80 : 430,
  );
}

function navigate(direction) {
  const now = Date.now();
  if (now < lockUntil) return;
  lockUntil = now + 620;
  updateProject(activeIndex + direction);
}

window.addEventListener(
  "wheel",
  (event) => {
    if (Math.abs(event.deltaY) < 18) return;
    event.preventDefault();
    navigate(event.deltaY > 0 ? 1 : -1);
  },
  { passive: false },
);

window.addEventListener("keydown", (event) => {
  const forwardKeys = ["ArrowDown", "ArrowRight", "PageDown", " "];
  const backwardKeys = ["ArrowUp", "ArrowLeft", "PageUp"];

  if (forwardKeys.includes(event.key)) {
    event.preventDefault();
    navigate(1);
  }

  if (backwardKeys.includes(event.key)) {
    event.preventDefault();
    navigate(-1);
  }

  if (event.key === "Escape") {
    root.classList.remove("show-method");
  }
});

window.addEventListener(
  "touchstart",
  (event) => {
    const point = event.touches[0];
    touchStartY = point.clientY;
    touchStartX = point.clientX;
    setInteractionPoint(point.clientX, point.clientY);
  },
  { passive: true },
);

window.addEventListener(
  "touchmove",
  (event) => {
    const point = event.touches[0];
    setInteractionPoint(point.clientX, point.clientY);
  },
  { passive: true },
);

window.addEventListener(
  "touchend",
  (event) => {
    const point = event.changedTouches[0];
    const diffY = touchStartY - point.clientY;
    const diffX = touchStartX - point.clientX;
    const primary = Math.abs(diffY) > Math.abs(diffX) ? diffY : diffX;

    if (Math.abs(primary) > 42) {
      navigate(primary > 0 ? 1 : -1);
    }
  },
  { passive: true },
);

window.addEventListener("mousemove", (event) => {
  setInteractionPoint(event.clientX, event.clientY);
});

[...rows, ...stepButtons].forEach((control) => {
  control.addEventListener("click", () => updateProject(Number(control.dataset.index)));
});

document.querySelectorAll('a[href="#sobre"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    root.classList.toggle("show-method");
  });
});

updateClock();
setInterval(updateClock, 30000);
updateProject(0, true);
