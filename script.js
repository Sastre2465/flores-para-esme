/* =========================================================
   Para Esme — interacción y animaciones
   ========================================================= */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Rosas SVG (rosa, rojo, pastel y vino) ---------- */

  const ROSE_COLORS = ['rosa', 'rojo', 'pastel', 'vino'];

  // Contenido de una rosa vista desde arriba, en un lienzo de 100 × 100
  const roseInner = (v) => {
    const outer = 'M50 50 C30 46 22 18 50 6 C78 18 70 46 50 50Z';
    const mid = 'M50 50 C36 46 31 24 50 15 C69 24 64 46 50 50Z';
    const dark = { rosa: '#8e2a4f', rojo: '#5c0a1e', pastel: '#b86f88', vino: '#33060f' }[v];
    let s = `<g fill="url(#roseOut-${v})">`;
    for (let i = 0; i < 5; i++) s += `<path d="${outer}" transform="rotate(${i * 72} 50 50)"/>`;
    s += `</g><g fill="url(#roseMid-${v})" stroke="${dark}" stroke-opacity=".25" stroke-width=".8">`;
    for (let i = 0; i < 5; i++) s += `<path d="${mid}" transform="rotate(${i * 72 + 36} 50 50)"/>`;
    s += `</g><circle cx="50" cy="50" r="15" fill="url(#roseIn-${v})"/>`;
    s += `<g fill="none" stroke="${dark}" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round">`;
    s += '<path d="M50 41 C58 41 60 51 54 55 C48 59 41 54 43 47 C45 43 50 44 51 48"/>';
    s += '<path d="M42 39 C51 34 62 39 63 48"/><path d="M38 55 C42 63 54 65 60 58"/></g>';
    s += '<ellipse cx="44" cy="40" rx="5" ry="3" fill="#fff" opacity=".18"/>';
    return s;
  };
  const ROSE = (v = pick(ROSE_COLORS)) =>
    `<svg class="flower-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${roseInner(v)}</svg>`;

  // Florecita silvestre de cinco pétalos (detalles blancos y rosados)
  const WILD = (color) => {
    const petal = 'M50 50 C38 40 38 16 50 12 C62 16 62 40 50 50Z';
    let s = `<svg class="flower-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g fill="${color}" stroke="rgba(140,40,80,.25)" stroke-width="1">`;
    for (let i = 0; i < 5; i++) s += `<path d="${petal}" transform="rotate(${i * 72} 50 50)"/>`;
    s += '</g><circle cx="50" cy="50" r="9" fill="url(#goldCenter)"/></svg>';
    return s;
  };
  const WILD_COLORS = ['#fff5f7', '#ffd6e0', '#f7a6bd', '#ffffff'];

  /* ---------- Escaramuza a caballo (SVG) ---------- */

  const HORSE = 'M-72,-86 C-66,-98 -40,-100 -10,-97 C14,-95 34,-98 46,-108 C58,-122 74,-142 88,-154 L91,-166 L96,-158 C104,-153 112,-140 120,-124 C123,-118 121,-112 114,-113 C106,-115 98,-122 90,-126 C82,-116 74,-100 66,-86 C62,-74 54,-64 42,-62 C14,-58 -18,-58 -44,-62 C-60,-64 -74,-72 -78,-80 C-79,-84 -76,-86 -72,-86 Z';
  const LEG_F = 'M-7,-4 L7,-4 C8,10 6,24 5,34 C4,44 4,52 5,58 L7,66 L-5,66 L-4,58 C-4,50 -5,42 -5,34 C-6,24 -8,10 -7,-4 Z';
  const LEG_H = 'M-11,-6 L10,-6 C10,8 6,20 8,32 C9,38 5,44 4,56 L7,68 L-5,68 L-4,56 C-3,44 -2,38 -2,32 C-6,22 -12,10 -11,-6 Z';
  // falda amplia con olanes, como los vestidos de escaramuza
  const SKIRT = 'M-26,-98 C-18,-107 16,-107 24,-98 C32,-86 40,-68 44,-52 Q37.3,-42 30.6,-50 Q23.9,-42 17.1,-50 Q10.4,-42 3.7,-50 Q-3,-42 -9.7,-50 Q-16.4,-42 -23.1,-50 Q-29.9,-42 -36.6,-50 Q-43.3,-42 -50,-50 C-51,-68 -36,-86 -26,-98 Z';
  const RUFFLE = 'M42,-58 Q35.6,-50 29.4,-57 Q22.9,-50 16.5,-57 Q10.1,-50 3.7,-57 Q-2.7,-50 -9.1,-57 Q-15.5,-50 -21.9,-57 Q-28.3,-50 -34.7,-57 Q-41.1,-50 -47.5,-57';

  // body: caballo y jinete · skirt/ruffle/ribbon: detalles del vestido (o el mismo color para silueta)
  function riderSVG({ body, skirt = body, ruffle = null, ribbon = body, bordado = null }) {
    let s = `<g fill="${body}" stroke="${body}" stroke-linecap="round">`;
    s += '<path stroke="none" d="M-74,-88 C-90,-92 -98,-74 -100,-52 C-101,-42 -97,-33 -91,-28 C-93,-42 -89,-64 -74,-77 Z"/>';
    s += `<g transform="translate(34 -66)"><g class="leg" style="--pose:14deg;--d:-0.12s;--amp:26deg"><path stroke="none" d="${LEG_F}"/></g></g>`;
    s += `<g transform="translate(-56 -68)"><g class="leg" style="--pose:-10deg;--d:-0.32s;--amp:20deg"><path stroke="none" d="${LEG_H}"/></g></g>`;
    s += `<path stroke="none" d="${HORSE}"/>`;
    s += '<g fill="none" stroke-width="3">';
    for (let i = 0; i < 3; i++) {
      const mx = 58 + i * 10, my = -118 - i * 12;
      s += `<path d="M${mx} ${my} Q${mx - 8} ${my + 2} ${mx - 14} ${my + 8}"/>`;
    }
    s += '</g>';
    s += `<g transform="translate(42 -66)"><g class="leg" style="--pose:-12deg;--d:0s;--amp:26deg"><path stroke="none" d="${LEG_F}"/></g></g>`;
    s += `<g transform="translate(-48 -68)"><g class="leg" style="--pose:8deg;--d:-0.22s;--amp:20deg"><path stroke="none" d="${LEG_H}"/></g></g>`;
    s += `<g fill="none" stroke="${ribbon}" stroke-width="2.4"><path d="M-1,-138 Q-10,-139 -20,-131"/><path d="M-1,-136 Q-8,-130 -16,-124"/></g>`;
    s += '<path stroke="none" d="M-4,-100 C-7,-112 -5,-125 1,-131 L11,-131 C15,-123 15,-111 13,-100 Z"/>';
    s += '<circle stroke="none" cx="6" cy="-138" r="6.2"/><circle stroke="none" cx="0" cy="-137" r="3.8"/>';
    s += '<ellipse stroke="none" cx="6" cy="-145" rx="18" ry="3.3" transform="rotate(-3 6 -145)"/>';
    s += '<path stroke="none" d="M0,-145 C0,-156 4,-159 6.5,-159 C9,-159 12,-156 12,-145 Z"/>';
    s += '<path fill="none" stroke-width="4.2" d="M10,-126 Q20,-112 33,-110"/>';
    s += '<path fill="none" stroke-width="1.1" d="M33,-110 Q70,-104 100,-121"/>';
    s += `<path stroke="none" fill="${skirt}" d="${SKIRT}"/>`;
    if (ruffle) s += `<path fill="none" stroke="${ruffle}" stroke-width="2.4" d="${RUFFLE}"/>`;
    if (bordado) {
      s += `<g fill="${bordado}" stroke="none">`;
      for (const [x, y] of [[-14, -86], [0, -92], [12, -84], [-26, -70], [-6, -72], [16, -68], [32, -64]]) {
        s += `<circle cx="${x}" cy="${y}" r="2.3"/>`;
      }
      s += '</g>';
    }
    return s + '</g>';
  }

  const silhouette = (color) =>
    `<svg class="rider-svg" viewBox="-112 -172 244 176" aria-hidden="true" focusable="false">${riderSVG({ body: color })}</svg>`;

  $('#gateFlower').innerHTML = ROSE('rojo');
  // escaramuza a todo color: vestido rojo con olán blanco, moño rosa y bordado dorado
  const colorRider = () =>
    `<svg class="rider-svg" viewBox="-112 -172 244 176" aria-hidden="true" focusable="false">${riderSVG({ body: '#3a1530', skirt: 'url(#skirtGrad)', ruffle: '#fff8f2', ribbon: '#f7a6bd', bordado: '#e9b44c' })}</svg>`;

  $('#letterFlower').innerHTML = ROSE('rojo');
  $('#heroRider').innerHTML = `<div class="rider-bob gallop">${colorRider()}</div>`;
  $('#finaleRider').innerHTML = `<div class="rider-bob">${silhouette('#3a1530')}</div>`;

  /* ---------- Banderines del lienzo (rosas, rojos y blancos) ---------- */

  (() => {
    const wrap = $('#banderines');
    const n = window.innerWidth < 700 ? 14 : 26;
    const cols = ['#c8102e', '#f7a6bd', '#fff8f2', '#d6336c', '#e9b44c', '#f7a6bd'];
    // dos guirnaldas que cuelgan en curva
    const yAt = (u) => 8 + 24 * Math.sin(Math.PI * ((u * 2) % 1));
    let pts = '';
    for (let i = 0; i <= 60; i++) pts += `${(i / 60) * 100},${yAt(i / 60).toFixed(2)} `;
    let html = `<svg class="banderin-cuerda" viewBox="0 0 100 90" preserveAspectRatio="none"><polyline points="${pts.trim()}"/></svg>`;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      html += `<span class="banderin" style="--x:${(u * 100).toFixed(2)}%;--y:${yAt(u).toFixed(1)}px;--c:${cols[i % cols.length]};--t:${rand(2.2, 3.6).toFixed(1)}s;--d:${rand(-3, 0).toFixed(1)}s"></span>`;
    }
    wrap.innerHTML = html;
  })();

  /* ---------- Estrellas ---------- */

  (() => {
    const stars = $('#stars');
    const frag = document.createDocumentFragment();
    const count = window.innerWidth < 700 ? 70 : 140;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'star';
      el.style.left = rand(0, 100) + '%';
      el.style.top = rand(0, 70) + '%';
      el.style.setProperty('--s', rand(1, 3).toFixed(1) + 'px');
      el.style.setProperty('--t', rand(2, 5).toFixed(2) + 's');
      el.style.setProperty('--d', rand(-5, 0).toFixed(2) + 's');
      frag.appendChild(el);
    }
    stars.appendChild(frag);
  })();

  /* ---------- Cielo: cambia de color conforme avanzas ---------- */

  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

  // [avance entre pantallas, [arriba, medio, abajo]] — una tarde en el lienzo charro que termina en atardecer
  const SKY = [
    [0.00, ['#ffe7d2', '#ffd3c0', '#f9bfa6']],
    [0.25, ['#ffdcc8', '#ffc2b0', '#f6a8a0']],
    [0.50, ['#ffcaa8', '#f9a294', '#ec8590']],
    [0.75, ['#f7a98a', '#e5737e', '#bf567c']],
    [1.00, ['#4a2458', '#b8507a', '#f59a74']],
  ].map(([p, cols]) => [p, cols.map(hex)]);

  const GATE_SKY = ['#ffe3d0', '#f9c6b8', '#efa6a8'].map(hex);

  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

  function skyAt(p) {
    for (let i = 0; i < SKY.length - 1; i++) {
      const [p0, c0] = SKY[i];
      const [p1, c1] = SKY[i + 1];
      if (p <= p1) {
        const t = clamp((p - p0) / (p1 - p0));
        return c0.map((c, j) => mix(c, c1[j], t));
      }
    }
    return SKY[SKY.length - 1][1];
  }

  const rgb = (c) => `rgb(${c.map(Math.round).join(',')})`;

  /* ---------- Pétalos (canvas) ---------- */

  const canvas = $('#petals');
  const ctx = canvas.getContext('2d');
  let W = 0;
  let H = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const PETAL_COLORS = ['#e8789a', '#f7a6bd', '#d92b45', '#ffc2d2', '#b8406a', '#f0657a', '#8e1f3f'];
  const SUNSET_COLORS = ['#e6c66e', '#f3d58a', '#c9a24a'];
  const CONFETTI = ['#7a1a33', '#e6c66e', '#f6ead4', '#d92b45', '#c9a24a'];
  const particles = [];
  let ambientTarget = reduceMotion ? 0 : 6;
  let progress = 0;

  function ambientPetal(anywhere) {
    const sunset = Math.random() < progress * 0.3;
    return {
      ambient: true,
      kind: 'petal',
      x: rand(-40, W),
      y: anywhere ? rand(-H * 0.2, H) : rand(-80, -20),
      vx: rand(-0.2, 0.7),
      vy: rand(0.5, 1.3),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.025, 0.025),
      flip: rand(0, Math.PI * 2),
      phase: rand(0, Math.PI * 2),
      sway: rand(0.5, 1.4),
      size: rand(6, 12),
      color: sunset ? pick(SUNSET_COLORS) : pick(PETAL_COLORS),
      alpha: rand(0.7, 1),
    };
  }

  function burst(x, y, n, kind = 'petal', opts = {}) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2);
      const speed = rand(2, opts.speed || 8);
      particles.push({
        ambient: false,
        kind,
        x: x + rand(-6, 6),
        y: y + rand(-6, 6),
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - rand(2, 5),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.2, 0.2),
        flip: rand(0, Math.PI * 2),
        phase: 0,
        sway: 0,
        size: kind === 'confetti' ? rand(8, 13) : rand(7, 13),
        color: kind === 'confetti' ? pick(CONFETTI) : pick(PETAL_COLORS),
        alpha: 1,
        life: rand(110, 180),
      });
    }
  }

  function rain(n) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) {
      const p = ambientPetal(false);
      p.ambient = false;
      p.y = rand(-H * 0.6, -10);
      p.vy = rand(1.4, 3);
      p.size = rand(8, 14);
      p.life = 900;
      particles.push(p);
    }
  }

  function drawParticle(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    ctx.scale(1, 0.35 + 0.65 * Math.abs(Math.cos(p.flip)));
    ctx.fillStyle = p.color;
    if (p.kind === 'confetti') {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      if (p.color === '#ffffff') {
        ctx.strokeStyle = 'rgba(217,43,69,.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
    } else {
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.62, -s * 0.1, 0, s);
      ctx.quadraticCurveTo(-s * 0.62, -s * 0.1, 0, -s);
      ctx.fill();
      ctx.strokeStyle = 'rgba(120, 20, 50, .25)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.7);
      ctx.lineTo(0, s * 0.75);
      ctx.stroke();
    }
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    let ambientCount = 0;
    for (const p of particles) if (p.ambient) ambientCount++;
    if (ambientCount < ambientTarget && Math.random() < 0.2) {
      particles.push(ambientPetal(ambientCount === 0 && particles.length === 0));
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.flip += 0.035;
      p.rot += p.vr;

      if (p.ambient || p.life > 300) {
        p.phase += 0.02;
        p.x += p.vx + Math.sin(p.phase) * p.sway * 0.6;
        p.y += p.vy;
      } else {
        p.vy += 0.16;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.vr *= 0.99;
      }
      if (!p.ambient) {
        p.life--;
        p.alpha = clamp(p.life / 40);
      }

      const out = p.y > H + 40 || p.x < -80 || p.x > W + 80;
      if (out || (!p.ambient && p.life <= 0)) {
        if (p.ambient && ambientCount <= ambientTarget) {
          Object.assign(p, ambientPetal(false));
        } else {
          particles.splice(i, 1);
          if (p.ambient) ambientCount--;
        }
        continue;
      }
      drawParticle(p);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ---------- Chispitas al mover el mouse ---------- */

  let lastSpark = 0;
  if (finePointer && !reduceMotion) {
    window.addEventListener('mousemove', (e) => {
      if (!document.body.classList.contains('entered')) return;
      const now = performance.now();
      if (now - lastSpark < 55) return;
      lastSpark = now;
      const s = document.createElement('span');
      s.className = 'sparkle';
      s.style.left = e.clientX + 'px';
      s.style.top = e.clientY + 'px';
      s.style.setProperty('--dx', rand(-18, 18).toFixed(0) + 'px');
      s.style.setProperty('--dy', rand(8, 30).toFixed(0) + 'px');
      document.body.appendChild(s);
      s.addEventListener('animationend', () => s.remove());
    });
  }

  /* =========================================================
     ENTRADA
     ========================================================= */

  const gate = $('#gate');
  const form = $('#gateForm');
  const input = $('#nameInput');
  const msg = $('#gateMsg');
  const hero = $('#inicio');

  const NOT_HER = [
    'Mmm… esta página tiene una destinataria muy especial, y no parece ser ese nombre 🌹',
    'Estas rosas están guardadas para alguien en particular ❤️',
    'Casi… pero este atardecer fue pintado para otra persona 🌅',
    'Lo siento, este pequeño jardín ya tiene dueña 🌷',
  ];
  let wrongCount = 0;
  let skyBlend = 1; // 1 = cielo de la entrada, 0 = cielo de la página
  let entered = false;

  const normalize = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

  function showMsg(text, ok = false) {
    msg.classList.remove('show');
    msg.classList.toggle('ok', ok);
    requestAnimationFrame(() => {
      msg.textContent = text;
      msg.classList.add('show');
    });
  }

  window.addEventListener('load', () => setTimeout(() => input.focus(), 900));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (entered) return;
    const value = normalize(input.value);

    if (!value) {
      showMsg('Escribe tu nombre para abrir el regalo 🌹');
      input.focus();
      return;
    }

    if (value !== 'esme') {
      showMsg(NOT_HER[wrongCount % NOT_HER.length]);
      wrongCount++;
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      input.select();
      return;
    }

    enter();
  });

  function enter() {
    entered = true;
    input.blur();
    input.disabled = true;
    form.classList.add('success');
    showMsg('¡Hola, Esme! Qué gusto que estés aquí. Pasa, esto es para ti 🌹', true);

    const rect = form.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top, 40);

    const openMain = () => {
      gate.classList.add('hidden');
      document.body.classList.add('entered');
      document.body.classList.remove('locked');
      $('#main').removeAttribute('aria-hidden');
      fadeSky();
      activate(0);
    };

    // Una pasada de escaramuzas cruza la pantalla y, detrás de ella, aparece la página
    setTimeout(() => runPasada(1, '¡Las puntas abren la rutina! Bienvenida, Esme', openMain, startHero), reduceMotion ? 0 : 900);
  }

  function fadeSky() {
    const start = performance.now();
    const dur = reduceMotion ? 1 : 2200;
    const step = (now) => {
      const t = clamp((now - start) / dur);
      skyBlend = 1 - t * t * (3 - 2 * t);
      render();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* =========================================================
     INICIO
     ========================================================= */

  (() => {
    const name = $('#heroName');
    const letters = name.textContent.trim().split('');
    name.setAttribute('aria-label', name.textContent.trim());
    name.innerHTML = letters
      .map((ch, i) => `<span class="ch" style="--i:${i}" aria-hidden="true">${ch}</span>`)
      .join('');
  })();

  (() => {
    const wrap = $('#heroFlowers');
    const n = window.innerWidth < 700 ? 5 : 9;
    let html = '';
    for (let i = 0; i < n; i++) {
      // Pocas flores y pequeñas: el inicio debe sentirse tranquilo
      const side = i % 2 === 0 ? rand(2, 30) : rand(70, 97);
      const w = rand(34, 62);
      html += `<div class="hero-flower" style="--x:${side.toFixed(1)}%;--b:${rand(0, 18).toFixed(0)}%;--w:${w.toFixed(0)}px;--h:${rand(40, 110).toFixed(0)}px;--d:${(1.6 + i * 0.18).toFixed(2)}s;--sway:${rand(3, 5).toFixed(1)}s;--amp:${rand(2, 4).toFixed(1)}deg">
        <div class="hf-head">${ROSE()}</div><div class="hf-stem"></div></div>`;
    }
    wrap.innerHTML = html;
  })();

  function startHero() {
    hero.classList.add('play');
    typeText($('#typed'), 'Hoy el lienzo se llenó de flores… y pensé en ti.', 2000);
  }

  function typeText(el, text, delay) {
    if (reduceMotion) {
      el.textContent = text;
      return;
    }
    let i = 0;
    setTimeout(function next() {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(next, text[i - 1] === '…' ? 380 : rand(40, 75));
    }, delay);
  }

  /* =========================================================
     JARDÍN
     ========================================================= */

  const meadow = $('#meadow');
  const note = $('#flowerNote');

  const PHRASES = [
    'Esta rosa es para recordarte lo bonita que es tu sonrisa 🌹',
    'Cada pétalo es un «me acordé de ti» que no alcancé a decirte.',
    'Si alguna vez dudas de lo especial que eres, vuelve a este jardín ❤️',
    'Ojalá tu día sea tan bonito como tú.',
    'Me alegra mucho haberte conocido, Esme. De verdad.',
    'Esta florecita es para los días en que necesites un poquito de luz ✨',
    'Sigue haciendo lo que amas: se te nota el corazón cuando lo haces 🐎🌹',
    'Nunca dejes de florecer 🌹',
    'Para una escaramuza muy especial 🌸',
    'Como las puntas: siempre al frente y con mucho estilo 🐎',
    'Que tu vida tenga tantas flores como tu figura favorita 🌸',
    'Ojalá cada día termine con una rayada perfecta ✨',
    'Eres de esas personas que hacen los días más bonitos 🌅',
    'Aquí hay una flor por cada vez que me sacaste una sonrisa… y aun así me faltaron flores.',
    'Que nunca te falten razones para sonreír, y si te faltan, aquí hay unas cuantas ❤️',
  ];
  let phraseOrder = [];

  (() => {
    const small = window.innerWidth < 700;
    const n = small ? 9 : 17;
    const frag = document.createDocumentFragment();

    for (let i = 0; i < n; i++) {
      const x = ((i + 0.5) / n) * 100 + rand(-2.5, 2.5);
      const tall = rand(0.3, 0.72);
      const w = (small ? rand(70, 100) : rand(90, 140)) * (0.75 + tall * 0.5);
      const el = document.createElement('div');
      el.className = 'sflower';
      el.style.cssText = [
        `--x:${x.toFixed(1)}%`,
        `--w:${w.toFixed(0)}px`,
        `--h:${(tall * 64).toFixed(1)}vh`,
        `--z:${Math.round(20 - tall * 20)}`,
        `--d:${(rand(0, 0.9) + (i % 3) * 0.15).toFixed(2)}s`,
        `--sway:${rand(3.2, 5.5).toFixed(1)}s`,
        `--sd:${rand(-4, 0).toFixed(1)}s`,
        `--amp:${rand(2, 4.5).toFixed(1)}deg`,
      ].join(';');
      el.innerHTML = `<div class="sflower-sway">
        <button class="sflower-head" type="button" aria-label="Flor ${i + 1}: toca para leer un mensaje">${ROSE(ROSE_COLORS[i % ROSE_COLORS.length])}</button>
        <div class="sflower-stem"><i class="leaf l"></i><i class="leaf r"></i></div>
      </div>`;
      frag.appendChild(el);
    }

    // Florecitas silvestres girando sobre el pasto
    const buds = small ? 10 : 22;
    for (let i = 0; i < buds; i++) {
      const b = document.createElement('div');
      b.className = 'bud';
      b.style.cssText = `--x:${rand(0, 97).toFixed(1)}%;--b:${rand(4, 40).toFixed(0)}px;--w:${rand(22, 38).toFixed(0)}px;--d:${rand(1, 2.6).toFixed(2)}s;--spin:${rand(18, 40).toFixed(0)}s`;
      b.innerHTML = Math.random() < 0.55 ? WILD(pick(WILD_COLORS)) : ROSE();
      frag.appendChild(b);
    }
    meadow.appendChild(frag);

    const ff = $('#fireflies');
    for (let i = 0; i < (small ? 10 : 22); i++) {
      const f = document.createElement('span');
      f.className = 'firefly';
      f.style.cssText = `--x:${rand(0, 100).toFixed(1)}%;--y:${rand(10, 85).toFixed(1)}%;--t:${rand(5, 10).toFixed(1)}s;--d:${rand(-8, 0).toFixed(1)}s;--dx:${rand(-60, 60).toFixed(0)}px;--dy:${rand(-50, 30).toFixed(0)}px`;
      ff.appendChild(f);
    }
  })();

  let noteTimer;
  meadow.addEventListener('click', (e) => {
    const head = e.target.closest('.sflower-head');
    if (!head) return;

    if (!phraseOrder.length) phraseOrder = PHRASES.slice().sort(() => Math.random() - 0.5);
    const text = phraseOrder.pop();

    const hr = head.getBoundingClientRect();
    const mr = meadow.getBoundingClientRect();
    const cx = hr.left + hr.width / 2;
    const x = clamp(cx - mr.left, 150, mr.width - 150);

    note.textContent = text;
    note.style.left = x + 'px';
    note.style.top = (hr.top - mr.top) + 'px';
    note.classList.remove('show');
    void note.offsetWidth;
    note.classList.add('show');
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => note.classList.remove('show'), 4200);

    head.classList.remove('pop');
    void head.offsetWidth;
    head.classList.add('pop');
    burst(cx, hr.top + hr.height / 2, 18, 'petal', { speed: 6 });
  });

  meadow.addEventListener('mouseover', (e) => {
    const head = e.target.closest('.sflower-head');
    if (!head || head.dataset.hovered) return;
    head.dataset.hovered = '1';
    const r = head.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 5, 'petal', { speed: 3 });
    setTimeout(() => delete head.dataset.hovered, 900);
  });

  /* =========================================================
     MENSAJE: sobre lacrado → la carta se despliega y se escribe con tinta
     ========================================================= */

  const envScene = $('#envScene');
  const envelope = $('#envelope');
  const letter = $('#letter');
  $('#envSeal').innerHTML = ROSE('rojo');

  // Separa cada línea en caracteres (respetando emojis y <strong>) para "escribirlos"
  const segmenter = window.Intl && Intl.Segmenter ? new Intl.Segmenter('es', { granularity: 'grapheme' }) : null;
  const graphemes = (s) => (segmenter ? Array.from(segmenter.segment(s), (g) => g.segment) : Array.from(s));

  function inkify(el) {
    const chars = [];
    const walk = (node) => {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent.replace(/\s+/g, ' ');
          const frag = document.createDocumentFragment();
          for (const g of graphemes(text)) {
            const s = document.createElement('span');
            s.className = 'ink';
            s.textContent = g;
            frag.appendChild(s);
            chars.push(s);
          }
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      }
    };
    walk(el);
    return chars;
  }

  let inkChars = [];
  let inkDone = false;

  function writeLetter() {
    const lines = $$('.line', letter);
    inkChars = [];
    lines.forEach((l) => {
      l.innerHTML = l.innerHTML.trim();
      inkChars.push(...inkify(l), null); // null = pausa entre párrafos
    });

    let i = 0;
    (function next() {
      if (inkDone) return;
      while (i < inkChars.length && inkChars[i] === null) i++;
      if (i >= inkChars.length) return finishLetter();
      const ch = inkChars[i++];
      ch.classList.add('on');
      const t = ch.textContent;
      const pause = inkChars[i] === null ? 650 : /[.,:;…]/.test(t) ? 260 : rand(16, 30);
      setTimeout(next, reduceMotion ? 0 : pause);
    })();
  }

  function finishLetter() {
    if (inkDone) return;
    inkDone = true;
    inkChars.forEach((c) => c && c.classList.add('on'));
    letter.classList.add('written');
    const r = letter.getBoundingClientRect();
    burst(r.left + r.width - 40, r.bottom - 40, 22, 'petal', { speed: 6 });
  }

  letter.addEventListener('click', () => {
    if (letter.classList.contains('writing')) finishLetter();
  });

  let opened = false;
  function openEnvelope() {
    if (opened) return;
    opened = true;
    envScene.classList.add('opening');

    const sr = $('#envSeal').getBoundingClientRect();
    burst(sr.left + sr.width / 2, sr.top + sr.height / 2, 34, 'petal', { speed: 9 });
    burst(sr.left + sr.width / 2, sr.top + sr.height / 2, 16, 'confetti', { speed: 7 });

    const wait = reduceMotion ? 0 : 1;
    setTimeout(() => envScene.classList.add('opened'), 2000 * wait);
    setTimeout(() => {
      envScene.hidden = true;
      letter.classList.remove('is-sealed');
      letter.classList.add('unfold', 'writing');
      setTimeout(writeLetter, 1100 * wait);
    }, 2800 * wait);
  }

  envelope.addEventListener('click', openEnvelope);
  envelope.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEnvelope();
    }
  });

  /* =========================================================
     ESCARAMUZA
     ========================================================= */

  const escFrame = $('#escFrame');
  const escImg = $('#escImg');
  const bubble = $('#escBubble');

  // Ilustración incluida: atardecer, escaramuza con vestido rojo y rosas alrededor
  // (se usa en el aro de la escaramuza y como foto de la credencial)
  function duskScene() {
    let s = '<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">';
    s += '<circle cx="100" cy="100" r="100" fill="url(#duskDisc)"/>';
    s += '<circle cx="128" cy="118" r="26" fill="#ffe7b0" opacity=".85"/>';
    s += '<path d="M0 132 C40 118 80 136 120 126 C150 119 175 128 200 124 L200 200 L0 200Z" fill="#b4507a" opacity=".55"/>';
    s += '<path d="M0 150 C50 140 110 156 200 146 L200 200 L0 200Z" fill="#7a2a55"/>';
    s += `<g transform="translate(96 152) scale(.56)">${riderSVG({ body: '#3a1530', skirt: 'url(#skirtGrad)', ruffle: '#ffd6e0', ribbon: '#d92b45', bordado: '#e9b44c' })}</g>`;
    const roses = [[6, 150, 34, 'rojo'], [30, 162, 30, 'rosa'], [56, 166, 26, 'pastel'], [118, 166, 28, 'vino'], [142, 158, 32, 'rojo'], [166, 148, 30, 'rosa']];
    for (const [x, y, w, v] of roses) {
      s += `<svg x="${x}" y="${y}" width="${w}" height="${w}" viewBox="0 0 100 100">${roseInner(v)}</svg>`;
    }
    return s + '</svg>';
  }
  $('#escFallback').innerHTML = duskScene();
  $('#credPhoto').innerHTML = duskScene();

  /* ---------- Credencial: se voltea al tocarla y se inclina con el mouse ---------- */

  const cred = $('#cred');
  const credInner = $('#credInner');
  let flipping = false;

  function flipCred() {
    flipping = true;
    cred.classList.remove('tilting');
    credInner.style.setProperty('--rx', '0deg');
    credInner.style.setProperty('--ry', '0deg');
    cred.classList.toggle('flipped');
    const r = cred.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 12, 'petal', { speed: 5 });
    setTimeout(() => (flipping = false), 900);
  }

  cred.addEventListener('click', flipCred);
  cred.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flipCred();
    }
  });

  if (finePointer && !reduceMotion) {
    cred.addEventListener('pointermove', (e) => {
      if (flipping) return;
      const r = cred.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cred.classList.add('tilting');
      credInner.style.setProperty('--ry', (x * 18).toFixed(1) + 'deg');
      credInner.style.setProperty('--rx', (-y * 14).toFixed(1) + 'deg');
    });
    cred.addEventListener('pointerleave', () => {
      cred.classList.remove('tilting');
      credInner.style.setProperty('--rx', '0deg');
      credInner.style.setProperty('--ry', '0deg');
    });
  }

  // Cuando el sello "Aprobada" cae sobre la credencial, salta confeti dorado
  $('.cred-stamp').addEventListener('animationend', (e) => {
    if (e.animationName !== 'stampIn') return;
    const r = e.currentTarget.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 22, 'confetti', { speed: 7 });
  });

  // Si hay una imagen propia en imagenes/ se usa; si no, la ilustración incluida
  (() => {
    const sources = ['png', 'jpg', 'jpeg', 'webp', 'gif'].map((ext) => `imagenes/escaramuza.${ext}`);
    let i = 0;
    escImg.addEventListener('error', () => {
      i++;
      if (i < sources.length) escImg.src = sources[i];
      else escFrame.classList.add('no-img');
    });
    escImg.src = sources[0];
  })();

  const BUBBLES = ['¡Hola, Esme! 👋', '¡Las puntas al frente! 🐎', '¡Qué rayada tan bonita! ✨', '¡Esa flor quedó perfecta! 🌸', '¡Arriba las escaramuzas! 🌹', 'Siempre con la frente en alto 💃'];
  let bubbleIdx = 0;

  function riderJump() {
    escFrame.classList.remove('jump');
    void escFrame.offsetWidth;
    escFrame.classList.add('jump');
    bubbleIdx = (bubbleIdx + 1) % BUBBLES.length;
    bubble.textContent = BUBBLES[bubbleIdx];
    const r = escFrame.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height * 0.3, 26, 'confetti', { speed: 9 });
  }

  escFrame.addEventListener('click', riderJump);
  escFrame.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      riderJump();
    }
  });
  escFrame.addEventListener('animationend', (e) => {
    if (e.animationName === 'jump') escFrame.classList.remove('jump');
  });

  $('#escBtn').addEventListener('click', (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    burst(cx, r.top, 60, 'confetti', { speed: 11 });
    burst(cx, r.top, 20, 'petal', { speed: 8 });
    riderJump();
    e.currentTarget.textContent = '¡Arriba, Esme! 🐎❤️';
  });

  (() => {
    const phrase = ['ESME', 'LAS PUNTAS AL FRENTE', '🐎', 'LA FLOR', '🌹', 'EL ABANICO', '🌸', 'LA RAYADA', '✨', 'ESCARAMUZA DE CORAZÓN'];
    const chunk = phrase.map((w) => `<span>${w}</span>`).join('');
    $('#ribbonTrack').innerHTML = chunk.repeat(4);
  })();

  /* =========================================================
     FINAL
     ========================================================= */

  const finale = $('#final');

  (() => {
    const build = (el, n) => {
      let html = '';
      for (let i = 0; i < n; i++) {
        html += `<div class="shore-flower" style="--x:${((i + 0.5) / n * 90).toFixed(1)}%;--b:${rand(0, 14).toFixed(0)}%;--w:${rand(38, 64).toFixed(0)}px;--h:${rand(30, 90).toFixed(0)}px;--d:${(i * 0.15).toFixed(2)}s;--sway:${rand(3, 5).toFixed(1)}s;--amp:${rand(2, 4).toFixed(1)}deg">
          <div class="hf-head">${ROSE()}</div><div class="hf-stem"></div></div>`;
      }
      el.innerHTML = html;
    };
    const n = window.innerWidth < 700 ? 3 : 6;
    build($('#shoreLeft'), n);
    build($('#shoreRight'), n);
  })();

  $('#finalBtn').addEventListener('click', (e) => {
    finale.classList.add('bloomed');
    rain(140);
    const r = e.currentTarget.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 40, 'petal', { speed: 10 });
    e.currentTarget.textContent = 'Para ti, con cariño ❤️';
  });

  /* =========================================================
     PANTALLAS: la página no baja; se avanza de una "vuelta" a otra
     ========================================================= */

  const sky = $('#sky');
  const starsEl = $('#stars');
  const slides = $$('[data-section]');
  const navLinks = $$('.dots a');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  const counter = $('#slideCount');
  const pasada = $('#pasada');
  const pasadaCaption = $('#pasadaCaption');
  let current = -1;
  let busy = false;

  // Lo que anuncia la pasada de escaramuzas al llegar a cada pantalla
  const CAPTIONS = [
    'La entrada · Hola, Esme',
    'La flor · Un jardín para ti',
    'El abanico · Un pequeño mensaje',
    'Las puntas al frente · Algo que también te gusta',
    'La rayada final · Para Esme',
  ];

  // Formación en punta: la punta al frente y las demás abriéndose detrás en "V".
  // [x, y, ancho, retraso del galope] en % de la formación; más arriba = más lejos (cerca de la barda)
  const PUNTA = [
    [6, 100, 17, -0.05],
    [4, -14, 36, -0.3],
    [33, 74, 21, -0.18],
    [31, 14, 31, -0.4],
    [60, 44, 26, 0],
  ];
  $('#pasadaRiders').innerHTML = PUNTA
    .map(([x, y, w, d]) => `<div class="pasada-rider" style="left:${x}%;bottom:${y}%;width:${w}%;z-index:${100 - y};--rd:${d}s"><div class="rider-bob gallop">${colorRider()}</div></div>`)
    .join('');

  function render() {
    const cols = skyAt(progress).map((c, i) => mix(c, GATE_SKY[i], skyBlend));
    sky.style.background = `linear-gradient(180deg, ${rgb(cols[0])} 0%, ${rgb(cols[1])} 55%, ${rgb(cols[2])} 100%)`;

    // las estrellas solo salen en el gran final
    starsEl.style.setProperty('--stars', (entered ? clamp((progress - 0.74) / 0.2) : 0).toFixed(3));

    // Empieza tranquilo y cada vez caen más pétalos
    if (!reduceMotion) ambientTarget = entered ? Math.round(5 + progress * 42) : 6;
  }

  // La pasada: un olán de vestido de escaramuza cruza la pantalla con jinetes al galope
  function runPasada(dir, caption, onCovered, onDone) {
    if (reduceMotion) {
      onCovered();
      if (onDone) onDone();
      return;
    }
    pasadaCaption.textContent = caption;
    pasada.className = 'pasada run cover' + (dir < 0 ? ' rev' : '');
    setTimeout(() => {
      onCovered();
      pasada.classList.replace('cover', 'covered');
    }, 1520);
    setTimeout(() => pasada.classList.replace('covered', 'uncover'), 2500);
    setTimeout(() => {
      pasada.className = 'pasada';
      if (onDone) onDone();
    }, 4150);
  }

  function activate(i) {
    const prev = slides[current];
    if (prev) $$('.reveal', prev).forEach((r) => r.classList.remove('visible'));
    current = i;
    slides.forEach((s, k) => {
      s.classList.toggle('is-active', k === i);
      s.setAttribute('aria-hidden', k === i ? 'false' : 'true');
    });
    const slide = slides[i];
    slide.scrollTop = 0;
    requestAnimationFrame(() => $$('.reveal', slide).forEach((r) => r.classList.add('visible')));
    if (slide.id === 'jardin') meadow.classList.add('grown');
    if (slide.id === 'final') finale.classList.add('arrived');

    progress = i / (slides.length - 1);
    render();

    navLinks.forEach((a, k) => a.classList.toggle('active', k === i));
    counter.textContent = `${i + 1} / ${slides.length}`;
    prevBtn.disabled = i === 0;
    nextBtn.textContent = i === 0 ? 'Comenzar 🐎' : i === slides.length - 1 ? 'Volver a empezar ↺' : 'Siguiente 🐎';
  }

  function goTo(i) {
    if (busy || !entered || i === current) return;
    if (i < 0 || i >= slides.length) return;
    busy = true;
    runPasada(i > current ? 1 : -1, CAPTIONS[i], () => activate(i), () => (busy = false));
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current === slides.length - 1 ? 0 : current + 1));
  navLinks.forEach((a, k) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      goTo(k);
    })
  );

  // Si el contenido de una pantalla es más alto que el celular, primero se recorre por dentro
  function canScrollInside(target, dy) {
    const slide = slides[current];
    for (let el = target; el && el !== document.body; el = el.parentElement) {
      if (el.scrollHeight > el.clientHeight + 2 && /(auto|scroll)/.test(getComputedStyle(el).overflowY)) {
        if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 0) return true;
      }
      if (el === slide) break;
    }
    return false;
  }

  let lastWheel = 0;
  window.addEventListener('wheel', (e) => {
    if (!entered || Math.abs(e.deltaY) < 25 || canScrollInside(e.target, e.deltaY)) return;
    const now = performance.now();
    if (now - lastWheel < 4400) return;
    lastWheel = now;
    goTo(current + (e.deltaY > 0 ? 1 : -1));
  }, { passive: true });

  let touch = null;
  window.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    touch = { x: t.clientX, y: t.clientY, target: e.target };
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    if (!touch || !entered) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.x;
    const dy = t.clientY - touch.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) goTo(current + (dx < 0 ? 1 : -1));
    else if (Math.abs(dy) > 90 && Math.abs(dy) > Math.abs(dx) * 1.5 && !canScrollInside(touch.target, -dy)) goTo(current + (dy < 0 ? 1 : -1));
    touch = null;
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (!entered || e.target.closest('input, textarea')) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) {
      e.preventDefault();
      goTo(current + 1);
    } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      goTo(current - 1);
    }
  });

  render();
})();