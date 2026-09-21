(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
     3) Corazón de flores (fórmula paramétrica de corazón)
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
  function buildHeartPoints(count = 230) {
    const points = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random());
      const p = heartPoint(t);
      const jitter = 0.5;
      points.push({
        x: p.x * r + (Math.random() - 0.5) * jitter,
        y: p.y * r + (Math.random() - 0.5) * jitter,
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

    const rawPoints = buildHeartPoints();
    const SCALE = 9.4;
    const scaled = rawPoints.map((p) => ({ x: p.x * SCALE, y: p.y * SCALE }));

    const minX = Math.min(...scaled.map((p) => p.x));
    const maxX = Math.max(...scaled.map((p) => p.x));
    const maxY = Math.max(...scaled.map((p) => p.y));

    const offsetX = 300 - (minX + maxX) / 2;
    const offsetY = 466 - maxY; // apoya la punta del corazón sobre el árbol

    const flowers = scaled.map((p) => ({
      x: p.x + offsetX,
      y: p.y + offsetY,
    }));

    // orden de aparición: de abajo (junto al tronco) hacia arriba, con variación
    const anchor = { x: 300, y: 466 };
    const maxDist = Math.max(
      ...flowers.map((f) => Math.hypot(f.x - anchor.x, f.y - anchor.y))
    );

    flowers.forEach((f, i) => {
      const dist = Math.hypot(f.x - anchor.x, f.y - anchor.y);
      const delay = (dist / maxDist) * 1.1 + Math.random() * 0.25;

      const g = document.createElementNS(SVG_NS, "g");
      g.classList.add("heart-flower");
      g.style.setProperty("--delay", `${delay.toFixed(2)}s`);

      const r = 8 + Math.random() * 3;
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
     4) Ramas del árbol
     ============================================================ */
  const BRANCHES = [
    { from: [300, 462], to: [300, 372], cp: [300, 415] },
    { from: [294, 478], to: [204, 420] , cp: [248, 445] },
    { from: [306, 478], to: [396, 420], cp: [352, 445] },
    { from: [288, 516], to: [154, 462], cp: [216, 486] },
    { from: [312, 516], to: [446, 462], cp: [384, 486] },
    { from: [284, 558], to: [186, 556], cp: [232, 552] },
    { from: [316, 558], to: [414, 556], cp: [368, 552] },
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
     5) Máquina de escribir
     ============================================================ */
  function typeText(el, text, speed = 26) {
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
     6) Secuencia principal
     ============================================================ */
  const CONTENT = {
    title: "🌻 Feliz Día de las Flores Amarillas, Esme 🌻",
    paragraph:
      "Cada girasol que ves aquí es un latido de mi corazón.\n" +
      "Así como el sol ilumina los campos, tú iluminas mi vida.\n" +
      "Que estas flores te recuerden lo especial que eres para mí.",
    signoff: "— ¡Te amo, Esme!",
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
    const musicToggle = document.getElementById("musicToggle");
    const replayBtn = document.getElementById("replayBtn");
    const audio = document.getElementById("bgAudio");
    const petalField = document.getElementById("petalField");

    buildHeroFlower(document.getElementById("heroFlowerSvg"));
    startPetalRain(petalField);

    const trunkD =
      "M 278 650 C 274 578 276 502 284 462 " +
      "C 286 450 314 450 316 462 " +
      "C 324 502 326 578 322 650 Z";
    trunkPath.setAttribute("d", trunkD);

    let started = false;

    function fadeInAudio(target = 0.55) {
      audio.volume = 0;
      audio.play().catch(() => {
        /* el navegador podría bloquear el autoplay: el usuario puede darle a play manualmente */
      });
      let v = 0;
      const step = setInterval(() => {
        v += 0.05;
        audio.volume = Math.min(v, target);
        if (v >= target) clearInterval(step);
      }, 120);
    }

    async function runSequence() {
      // 1. mostrar escenario
      stage.hidden = false;
      requestAnimationFrame(() => intro.classList.add("leaving"));
      fadeInAudio();

      await wait(500);

      // 2. crecer el tronco
      trunkPath.classList.add("grown");
      await wait(reduceMotion ? 0 : 1500);

      // 3. dibujar las ramas
      buildBranches(branchesGroup);
      requestAnimationFrame(() => {
        branchesGroup.querySelectorAll(".branch").forEach((b) => b.classList.add("drawn"));
      });
      await wait(reduceMotion ? 0 : 1100);

      // 4. florecer el corazón
      const flowers = buildHeart(heartGroup);
      requestAnimationFrame(() => {
        flowers.forEach((f) => f.classList.add("bloom"));
      });
      await wait(reduceMotion ? 200 : 1700);

      // 5. panel de texto
      textPanel.classList.add("visible");
      tpTitle.textContent = CONTENT.title;
      tpCursive.textContent = CONTENT.cursive;
      requestAnimationFrame(() => {
        tpTitle.classList.add("visible");
        tpCursive.classList.add("visible");
      });
      await wait(600);

      await typeText(tpParagraph, CONTENT.paragraph, 24);
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

    musicToggle.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().catch(() => {});
        musicBox.classList.remove("paused");
        musicToggle.setAttribute("aria-label", "Pausar música");
      } else {
        audio.pause();
        musicBox.classList.add("paused");
        musicToggle.setAttribute("aria-label", "Reproducir música");
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
      audio.pause();
      audio.currentTime = 0;

      void stage.offsetWidth; // reinicia la animación de entrada
      started = false;
      startExperience();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
