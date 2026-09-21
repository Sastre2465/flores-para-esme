(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ALLOWED_NAME = "esme";

  /* ============================================================
     0) Puerta de acceso — solo reconoce el nombre de Esme
     ============================================================ */
  function normalizeName(str) {
    return str
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // quita acentos
      .toLowerCase()
      .trim();
  }

  function initGate(onSuccess) {
    const gate = document.getElementById("gate");
    const form = document.getElementById("gateForm");
    const input = document.getElementById("gateInput");
    const card = gate.querySelector(".gate-card");
    const error = document.getElementById("gateError");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = normalizeName(input.value);

      if (value === ALLOWED_NAME) {
        error.textContent = "";
        gate.classList.add("leaving");
        setTimeout(onSuccess, 700);
      } else {
        error.textContent = "Esta flor solo se abre para Esme 🌻";
        card.classList.remove("shake");
        void card.offsetWidth;
        card.classList.add("shake");
        input.value = "";
        input.focus();
      }
    });
  }

  /* ============================================================
     1) Flor principal (pantalla de inicio) — girasol dibujado en SVG
     ============================================================ */
  function buildHeroFlower(svg) {
    const petalCount = 16;
    const group = document.createElementNS(SVG_NS, "g");

    for (let i = 0; i < petalCount; i++) {
      const angle = (360 / petalCount) * i;
      const petal = document.createElementNS(SVG_NS, "ellipse");
      petal.setAttribute("cx", "0");
      petal.setAttribute("cy", "-32");
      petal.setAttribute("rx", "10");
      petal.setAttribute("ry", "24");
      petal.setAttribute("fill", i % 2 === 0 ? "#f4b400" : "#e6a400");
      petal.setAttribute("transform", `rotate(${angle})`);
      group.appendChild(petal);
    }

    const center = document.createElementNS(SVG_NS, "circle");
    center.setAttribute("cx", "0");
    center.setAttribute("cy", "0");
    center.setAttribute("r", "16");
    center.setAttribute("fill", "#6b3f1d");
    group.appendChild(center);

    // textura de puntitos en el centro
    for (let i = 0; i < 14; i++) {
      const t = Math.random() * Math.PI * 2;
      const r = Math.random() * 11;
      const dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("cx", (Math.cos(t) * r).toFixed(1));
      dot.setAttribute("cy", (Math.sin(t) * r).toFixed(1));
      dot.setAttribute("r", "1.1");
      dot.setAttribute("fill", "#3f2410");
      group.appendChild(dot);
    }

    svg.appendChild(group);
  }

  /* ============================================================
     2) Pétalos cayendo de fondo, durante toda la experiencia
     ============================================================ */
  function startPetalRain(field) {
    if (reduceMotion) return;

    function spawnPetal() {
      const petal = document.createElement("div");
      petal.className = "petal";
      const size = 8 + Math.random() * 12;
      petal.style.setProperty("--size", `${size}px`);
      petal.style.setProperty("--x", `${Math.random() * 100}vw`);
      petal.style.setProperty("--fall-dur", `${9 + Math.random() * 8}s`);
      petal.style.setProperty("--sway-dur", `${3 + Math.random() * 3}s`);
      petal.style.setProperty("--delay", `-${Math.random() * 4}s`);
      field.appendChild(petal);
      setTimeout(() => petal.remove(), 19000);
    }

    for (let i = 0; i < 12; i++) setTimeout(spawnPetal, i * 260);
    setInterval(spawnPetal, 850);
  }

  /* ============================================================
     3) Ramas del árbol — coordenadas contenidas dentro de la
        silueta del corazón, para que las flores las cubran por
        completo al florecer.
     ============================================================ */
  const TRUNK_TOP = { x: 300, y: 462 };

  const BRANCHES = [
    { from: [300, 462], to: [300, 366], cp: [300, 410] },
    { from: [292, 476], to: [226, 396], cp: [254, 434] },
    { from: [308, 476], to: [374, 396], cp: [346, 434] },
    { from: [286, 508], to: [196, 444], cp: [230, 474] },
    { from: [314, 508], to: [404, 444], cp: [370, 474] },
    { from: [282, 544], to: [222, 534], cp: [248, 540] },
    { from: [318, 544], to: [378, 534], cp: [352, 540] },
  ];

  function buildBranches(group) {
    BRANCHES.forEach((b, i) => {
      const path = document.createElementNS(SVG_NS, "path");
      const d = `M ${b.from[0]} ${b.from[1]} Q ${b.cp[0]} ${b.cp[1]} ${b.to[0]} ${b.to[1]}`;
      path.setAttribute("d", d);
      path.classList.add("branch");
      group.appendChild(path);

      const len = path.getTotalLength();
      path.style.setProperty("--len", len.toFixed(1));
      path.style.setProperty("--delay", `${i * 0.09}s`);
    });
  }

  /* ============================================================
     4) Corazón de flores (fórmula paramétrica de corazón) + racimos
        en la punta de cada rama, para que el árbol quede cubierto
        por completo.
     ============================================================ */
  function heartPoint(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    return { x, y: -y }; // se invierte porque en SVG "y" crece hacia abajo
  }

  // La curva del corazón es "estrellada" respecto al origen (todo rayo desde
  // el centro la cruza una sola vez), así que basta escalar cada punto del
  // contorno por un radio aleatorio para rellenar el área sin dejar
  // "rayos" visibles, con densidad uniforme (sqrt para repartir por área).
  function heartFillPoints(count, jitter) {
    const points = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random());
      const p = heartPoint(t);
      points.push({
        x: p.x * r + (Math.random() - 0.5) * jitter,
        y: p.y * r + (Math.random() - 0.5) * jitter,
        kind: "fill",
      });
    }
    return points;
  }

  function buildHeart(group) {
    const defs = document.createElementNS(SVG_NS, "defs");
    const grad = document.createElementNS(SVG_NS, "radialGradient");
    grad.setAttribute("id", "petalGrad");
    grad.innerHTML =
      '<stop offset="0%" stop-color="#ffe08a"/>' +
      '<stop offset="65%" stop-color="#f4b400"/>' +
      '<stop offset="100%" stop-color="#d98c0b"/>';
    defs.appendChild(grad);
    group.appendChild(defs);

    // 1) relleno principal del corazón, en coordenadas "crudas" de la fórmula
    const rawFill = heartFillPoints(260, 0.55);
    const SCALE = 9.4;
    const scaledFill = rawFill.map((p) => ({
      x: p.x * SCALE,
      y: p.y * SCALE,
      kind: p.kind,
    }));

    const minX = Math.min(...scaledFill.map((p) => p.x));
    const maxX = Math.max(...scaledFill.map((p) => p.x));
    const maxY = Math.max(...scaledFill.map((p) => p.y));

    const offsetX = TRUNK_TOP.x - (minX + maxX) / 2;
    const offsetY = TRUNK_TOP.y + 4 - maxY; // apoya la punta del corazón sobre el árbol

    const fillFlowers = scaledFill.map((p) => ({
      x: p.x + offsetX,
      y: p.y + offsetY,
      kind: "fill",
    }));

    // 2) racimos pequeños justo en la punta de cada rama, para que
    //    ninguna quede "pelada" — el árbol se llena por completo.
    const tipFlowers = [];
    BRANCHES.forEach((b, bi) => {
      const [tx, ty] = b.to;
      const clusterSize = 6;
      for (let i = 0; i < clusterSize; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 22;
        tipFlowers.push({
          x: tx + Math.cos(a) * r,
          y: ty + Math.sin(a) * r * 0.8,
          kind: "tip",
          branch: bi,
        });
      }
    });

    const flowers = [...tipFlowers, ...fillFlowers];

    // orden de aparición: las puntas de las ramas abren casi de inmediato
    // (siguiendo el orden en que cada rama terminó de dibujarse) y el
    // relleno del corazón florece después, en oleada desde el tronco
    // hacia arriba.
    const maxDist = Math.max(
      ...fillFlowers.map((f) => Math.hypot(f.x - TRUNK_TOP.x, f.y - TRUNK_TOP.y))
    );

    flowers.forEach((f) => {
      let delay;
      if (f.kind === "tip") {
        delay = f.branch * 0.09 + 0.25 + Math.random() * 0.15;
      } else {
        const dist = Math.hypot(f.x - TRUNK_TOP.x, f.y - TRUNK_TOP.y);
        delay = 0.5 + (dist / maxDist) * 1.3 + Math.random() * 0.25;
      }

      const g = document.createElementNS(SVG_NS, "g");
      g.classList.add("heart-flower");
      g.style.setProperty("--delay", `${delay.toFixed(2)}s`);

      const r = (f.kind === "tip" ? 7 : 8) + Math.random() * 3;
      const petal = document.createElementNS(SVG_NS, "circle");
      petal.setAttribute("cx", f.x.toFixed(1));
      petal.setAttribute("cy", f.y.toFixed(1));
      petal.setAttribute("r", r.toFixed(1));
      petal.setAttribute("fill", "url(#petalGrad)");
      g.appendChild(petal);

      const center = document.createElementNS(SVG_NS, "circle");
      center.setAttribute("cx", f.x.toFixed(1));
      center.setAttribute("cy", f.y.toFixed(1));
      center.setAttribute("r", (r * 0.32).toFixed(1));
      center.setAttribute("fill", "#5b3115");
      g.appendChild(center);

      group.appendChild(g);
    });

    return group.querySelectorAll(".heart-flower");
  }

  /* ============================================================
     5) Máquina de escribir
     ============================================================ */
  function typeText(el, text, speed = 22) {
    return new Promise((resolve) => {
      el.textContent = "";
      if (reduceMotion) {
        el.textContent = text;
        resolve();
        return;
      }
      el.classList.add("typing");
      let i = 0;
      (function step() {
        if (i <= text.length) {
          el.textContent = text.slice(0, i);
          i++;
          setTimeout(step, speed);
        } else {
          el.classList.remove("typing");
          resolve();
        }
      })();
    });
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  /* ============================================================
     6) Spotify — "Lover" (versión piano), embebido oficialmente
     ============================================================ */
  const SPOTIFY_TRACK_URI = "spotify:track:1vGG6k6R00jmYHnlLMvAOY";
  let spotifyController = null;

  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    const element = document.getElementById("spotifyEmbed");
    if (!element) return;
    IFrameAPI.createController(
      element,
      { uri: SPOTIFY_TRACK_URI, width: "100%", height: "80" },
      (controller) => {
        spotifyController = controller;
      }
    );
  };

  function playMusic() {
    try {
      spotifyController && spotifyController.play();
    } catch (err) {
      /* si la API todavía no cargó, Esme puede darle play en el reproductor */
    }
  }

  function stopMusic() {
    try {
      spotifyController && spotifyController.pause();
    } catch (err) {
      /* noop */
    }
  }

  /* ============================================================
     7) Secuencia principal
     ============================================================ */
  const CONTENT = {
    title: "🌻 Para ti, Esme 🌻",
    paragraph:
      "Elegí flores amarillas porque no hay color que se parezca más a ti: cálido, alegre, imposible de ignorar.\n\n" +
      "Cada girasol de este árbol es una razón distinta por la que sonrío cuando pienso en ti: tu risa, tu forma de ver el mundo, la manera en que conviertes un día cualquiera en uno especial.\n\n" +
      "Y aun así, por más que este árbol se llene de flores, ninguna alcanza a decir todo lo que siento.",
    signoff: "— Te amo, Esme.",
    cursive: "Eres el sol que hace florecer cada uno de mis días.",
  };

  function init() {
    const intro = document.getElementById("intro");
    const introFlower = document.getElementById("introFlower");
    const stage = document.getElementById("stage");
    const trunkPath = document.getElementById("trunkPath");
    const branchesGroup = document.getElementById("branchesGroup");
    const heartGroup = document.getElementById("heartGroup");
    const textPanel = document.getElementById("textPanel");
    const tpTitle = document.getElementById("tpTitle");
    const tpParagraph = document.getElementById("tpParagraph");
    const tpSignoff = document.getElementById("tpSignoff");
    const tpCursive = document.getElementById("tpCursive");
    const musicBox = document.getElementById("musicBox");
    const replayBtn = document.getElementById("replayBtn");
    const petalField = document.getElementById("petalField");

    buildHeroFlower(document.getElementById("heroFlowerSvg"));
    startPetalRain(petalField);

    const trunkD =
      "M 278 650 C 274 578 276 502 284 462 " +
      "C 286 450 314 450 316 462 " +
      "C 324 502 326 578 322 650 Z";
    trunkPath.setAttribute("d", trunkD);

    let started = false;

    async function runSequence() {
      // 1. mostrar escenario
      stage.hidden = false;
      requestAnimationFrame(() => intro.classList.add("leaving"));
      playMusic();

      await wait(500);

      // 2. crecer el tronco
      trunkPath.classList.add("grown");
      await wait(reduceMotion ? 0 : 1500);

      // 3. las ramas se despliegan (se dibujan + se abren)
      buildBranches(branchesGroup);
      requestAnimationFrame(() => {
        branchesGroup.querySelectorAll(".branch").forEach((b) => b.classList.add("drawn"));
      });
      await wait(reduceMotion ? 0 : 1500);

      // 4. el árbol se llena de flores hasta formar el corazón
      const flowers = buildHeart(heartGroup);
      requestAnimationFrame(() => {
        flowers.forEach((f) => f.classList.add("bloom"));
      });
      await wait(reduceMotion ? 200 : 2300);

      // 5. panel de texto
      textPanel.classList.add("visible");
      tpTitle.textContent = CONTENT.title;
      tpCursive.textContent = CONTENT.cursive;
      requestAnimationFrame(() => {
        tpTitle.classList.add("visible");
        tpCursive.classList.add("visible");
      });
      await wait(600);

      await typeText(tpParagraph, CONTENT.paragraph, 20);
      await wait(250);

      tpSignoff.textContent = CONTENT.signoff;
      requestAnimationFrame(() => tpSignoff.classList.add("visible"));
      await wait(300);

      musicBox.classList.add("visible");
      replayBtn.hidden = false;
      requestAnimationFrame(() => replayBtn.classList.add("visible"));
    }

    function startExperience() {
      if (started) return;
      started = true;
      runSequence();
    }

    introFlower.addEventListener("click", startExperience);
    introFlower.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        startExperience();
      }
    });

    replayBtn.addEventListener("click", () => {
      trunkPath.classList.remove("grown");
      branchesGroup.innerHTML = "";
      heartGroup.innerHTML = "";
      textPanel.classList.remove("visible");
      musicBox.classList.remove("visible");
      replayBtn.classList.remove("visible");
      replayBtn.hidden = true;
      tpTitle.classList.remove("visible");
      tpTitle.textContent = "";
      tpParagraph.textContent = "";
      tpSignoff.classList.remove("visible");
      tpSignoff.textContent = "";
      tpCursive.classList.remove("visible");
      tpCursive.textContent = "";
      stopMusic();

      void stage.offsetWidth; // reinicia la animación de entrada
      started = false;
      startExperience();
    });

    initGate(() => {
      const gate = document.getElementById("gate");
      gate.hidden = true;
      intro.hidden = false;
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
