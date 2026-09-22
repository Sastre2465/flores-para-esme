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
        error.textContent = "";
        card.classList.remove("shake");
        void card.offsetWidth;
        card.classList.add("shake");
        input.value = "";
        input.focus();
      }
    });
  }

  /* ============================================================
     1) Tulipán en SVG — se reutiliza a distinto tamaño tanto en la
        flor grande de inicio como en cada flor del árbol.
     ============================================================ */
  function petalPath(len, halfW) {
    return (
      `M0,0 C ${(-halfW).toFixed(1)},${(-len * 0.32).toFixed(1)} ` +
      `${(-halfW * 0.9).toFixed(1)},${(-len * 0.82).toFixed(1)} 0,${(-len).toFixed(1)} ` +
      `C ${(halfW * 0.9).toFixed(1)},${(-len * 0.82).toFixed(1)} ` +
      `${halfW.toFixed(1)},${(-len * 0.32).toFixed(1)} 0,0 Z`
    );
  }

  // Tulipán hecho de 3 pétalos (dos traseros + uno frontal más claro) y
  // una vena central sutil; el punto (0,0) es la base, de donde "crece".
  function buildTulip({ len, halfW, front, back, vein, sepals = false }) {
    const g = document.createElementNS(SVG_NS, "g");

    if (sepals) {
      [-1, 1].forEach((side) => {
        const s = document.createElementNS(SVG_NS, "path");
        s.setAttribute(
          "d",
          `M0,0 Q ${(side * halfW * 0.5).toFixed(1)},${(len * 0.12).toFixed(1)} ` +
            `${(side * halfW * 1.05).toFixed(1)},${(len * 0.42).toFixed(1)} ` +
            `Q ${(side * halfW * 0.3).toFixed(1)},${(len * 0.26).toFixed(1)} 0,0 Z`
        );
        s.setAttribute("fill", "#3d6b4a");
        g.appendChild(s);
      });
    }

    [-1, 1].forEach((side) => {
      const p = document.createElementNS(SVG_NS, "path");
      p.setAttribute("d", petalPath(len * 0.93, halfW * 0.96));
      p.setAttribute("fill", back);
      p.setAttribute("transform", `rotate(${side * 27})`);
      g.appendChild(p);
    });

    const front1 = document.createElementNS(SVG_NS, "path");
    front1.setAttribute("d", petalPath(len, halfW));
    front1.setAttribute("fill", front);
    g.appendChild(front1);

    const veinLine = document.createElementNS(SVG_NS, "path");
    veinLine.setAttribute("d", `M0,${(-len * 0.12).toFixed(1)} L0,${(-len * 0.86).toFixed(1)}`);
    veinLine.setAttribute("stroke", vein);
    veinLine.setAttribute("stroke-width", Math.max(0.6, len * 0.028).toFixed(2));
    veinLine.setAttribute("stroke-linecap", "round");
    veinLine.setAttribute("fill", "none");
    veinLine.setAttribute("opacity", "0.4");
    g.appendChild(veinLine);

    return g;
  }

  // pequeñas variaciones de tono para que el corazón no se vea plano,
  // como un ramillete real de tulipanes amarillos.
  const TULIP_SHADES = [
    { front: "#ffe08a", back: "#f0b300" },
    { front: "#ffd766", back: "#e8a800" },
    { front: "#f7c948", back: "#d98c0b" },
  ];

  function buildHeroFlower(svg) {
    const wrap = document.createElementNS(SVG_NS, "g");
    wrap.setAttribute("transform", "translate(0, 18)");

    const sway = document.createElementNS(SVG_NS, "g");
    sway.classList.add("tulip-sway");
    sway.style.setProperty("--sway-a", "-3deg");
    sway.style.setProperty("--sway-b", "3deg");
    sway.style.setProperty("--sway-dur", "4.5s");

    sway.appendChild(
      buildTulip({
        len: 62,
        halfW: 26,
        front: "#ffd766",
        back: "#d98c0b",
        vein: "#8a5a06",
        sepals: true,
      })
    );

    wrap.appendChild(sway);
    svg.appendChild(wrap);
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

  function heartPolygonPoints(steps = 240) {
    const poly = [];
    for (let i = 0; i < steps; i++) {
      poly.push(heartPoint((i / steps) * Math.PI * 2));
    }
    return poly;
  }

  function pointInHeart(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y;
      const xj = poly[j].x, yj = poly[j].y;
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // Rejilla hexagonal que cubre el corazón por completo, sin huecos: cada
  // flor se solapa levemente con sus vecinas (como en la referencia), en
  // vez de puntos al azar que dejan claros entre unas y otras.
  function heartFillPoints(spacing, jitter) {
    const poly = heartPolygonPoints();
    const minX = Math.min(...poly.map((p) => p.x));
    const maxX = Math.max(...poly.map((p) => p.x));
    const minY = Math.min(...poly.map((p) => p.y));
    const maxY = Math.max(...poly.map((p) => p.y));

    const rowH = spacing * 0.87;
    const points = [];
    let row = 0;
    for (let y = minY - rowH; y <= maxY + rowH; y += rowH) {
      const xOffset = row % 2 === 0 ? 0 : spacing / 2;
      for (let x = minX - spacing; x <= maxX + spacing; x += spacing) {
        const px = x + xOffset;
        // un pelín "hacia dentro" para que el borde también quede tupido
        if (pointInHeart(px, y, poly) || pointInHeart(px, y - rowH * 0.4, poly)) {
          points.push({
            x: px + (Math.random() - 0.5) * jitter,
            y: y + (Math.random() - 0.5) * jitter,
            kind: "fill",
          });
        }
      }
      row++;
    }
    return points;
  }

  // punto sobre una curva de Bézier cuadrática (misma curva que dibuja la rama)
  function quadBezier(p0, p1, p2, t) {
    const mt = 1 - t;
    return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
  }

  // flores repartidas a lo largo de TODA la rama (no solo en la punta), para
  // que quede completamente cubierta, sin tramos pelados. Se acumulan más
  // flores y con más dispersión cerca de la punta, como un ramillete real.
  function branchFlowerPoints(branch, bi) {
    const points = [];
    const steps = 9;
    for (let s = 0; s <= steps; s++) {
      const t = 0.2 + (s / steps) * 0.8;
      const bx = quadBezier(branch.from[0], branch.cp[0], branch.to[0], t);
      const by = quadBezier(branch.from[1], branch.cp[1], branch.to[1], t);
      const count = t > 0.7 ? 3 : 1;
      const jitterR = 7 + t * 15;
      for (let k = 0; k < count; k++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * jitterR;
        points.push({
          x: bx + Math.cos(a) * r,
          y: by + Math.sin(a) * r * 0.85,
          kind: "branch",
          branch: bi,
          t,
        });
      }
    }
    return points;
  }

  function buildHeart(group) {
    // 1) relleno principal del corazón, en coordenadas "crudas" de la fórmula
    const rawFill = heartFillPoints(1.22, 0.2);
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

    // 2) flores a lo largo de cada rama completa (base → punta), para que
    //    el árbol entero quede cubierto y se una con el corazón de arriba.
    const branchFlowers = [];
    BRANCHES.forEach((b, bi) => {
      branchFlowers.push(...branchFlowerPoints(b, bi));
    });

    const flowers = [...branchFlowers, ...fillFlowers];

    // orden de aparición: cada rama florece de la base hacia la punta,
    // siguiendo su propio despliegue, y el corazón florece después,
    // en oleada desde el tronco hacia arriba.
    const maxDist = Math.max(
      ...fillFlowers.map((f) => Math.hypot(f.x - TRUNK_TOP.x, f.y - TRUNK_TOP.y))
    );

    flowers.forEach((f) => {
      let delay;
      if (f.kind === "branch") {
        delay = f.branch * 0.09 + f.t * 0.55 + Math.random() * 0.12;
      } else {
        const dist = Math.hypot(f.x - TRUNK_TOP.x, f.y - TRUNK_TOP.y);
        delay = 0.55 + (dist / maxDist) * 1.3 + Math.random() * 0.25;
      }

      const g = document.createElementNS(SVG_NS, "g");
      g.classList.add("heart-flower");
      g.style.setProperty("--delay", `${delay.toFixed(2)}s`);

      // grupo de posición (traslada al punto f.x,f.y) separado del grupo de
      // bloom (que anima "transform" por CSS), para que no se pisen entre sí
      const pos = document.createElementNS(SVG_NS, "g");
      pos.setAttribute("transform", `translate(${f.x.toFixed(1)}, ${f.y.toFixed(1)})`);

      const sway = document.createElementNS(SVG_NS, "g");
      sway.classList.add("tulip-sway");
      const tilt = (Math.random() - 0.5) * 26;
      const swayAmp = 2.5 + Math.random() * 2.5;
      sway.style.setProperty("--sway-a", `${(tilt - swayAmp).toFixed(1)}deg`);
      sway.style.setProperty("--sway-b", `${(tilt + swayAmp).toFixed(1)}deg`);
      sway.style.setProperty("--sway-dur", `${(3.4 + Math.random() * 2.4).toFixed(2)}s`);
      sway.style.setProperty("--sway-delay", `-${(Math.random() * 4).toFixed(2)}s`);

      const len = (f.kind === "branch" ? 11 : 13) + Math.random() * 5;
      const shade = TULIP_SHADES[(Math.random() * TULIP_SHADES.length) | 0];
      sway.appendChild(
        buildTulip({
          len,
          halfW: len * 0.42,
          front: shade.front,
          back: shade.back,
          vein: "#8a5a06",
        })
      );

      pos.appendChild(sway);
      g.appendChild(pos);
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
     6) Apple Music — "Flores Amarillas" de Floricienta, embebido oficialmente.
        El widget de Apple Music no expone una API de control como la de
        Spotify: Esme le da play ella misma dentro del reproductor.
     ============================================================ */
  function playMusic() {}
  function stopMusic() {
  }

  /* ============================================================
     7) Secuencia principal
     ============================================================ */
  const CONTENT = {
    title: "🌻 Para ti, Esme 🌻",
    paragraph:
      "Elegí flores amarillas porque no hay color que se parezca más a ti: cálido, alegre, imposible de ignorar.\n\n" +
      "Cada tulipán de este árbol es una razón distinta por la que sonrío cuando pienso en ti: tu risa, tu forma de ver el mundo, la manera en que conviertes un día cualquiera en uno especial.\n\n" +
      "Y aun así, por más que este árbol se llene de flores, ninguna alcanza a decir todo lo que siento.",
    signoff: "— Te quiero, Esme.",
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

      await wait(350);

      // 2. crecer el tronco
      trunkPath.classList.add("grown");
      await wait(reduceMotion ? 0 : 1000);

      // 3. las ramas se despliegan (se dibujan + se abren)
      buildBranches(branchesGroup);
      requestAnimationFrame(() => {
        branchesGroup.querySelectorAll(".branch").forEach((b) => b.classList.add("drawn"));
      });
      await wait(reduceMotion ? 0 : 1000);

      // 4. el árbol se llena de flores hasta formar el corazón
      const flowers = buildHeart(heartGroup);
      requestAnimationFrame(() => {
        flowers.forEach((f) => f.classList.add("bloom"));
      });
      await wait(reduceMotion ? 200 : 1800);

      // 5. panel de texto
      textPanel.classList.add("visible");
      tpTitle.textContent = CONTENT.title;
      tpCursive.textContent = CONTENT.cursive;
      requestAnimationFrame(() => {
        tpTitle.classList.add("visible");
        tpCursive.classList.add("visible");
      });
      await wait(400);

      await typeText(tpParagraph, CONTENT.paragraph, 12);
      await wait(200);

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
