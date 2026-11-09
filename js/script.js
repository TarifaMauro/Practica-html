/* ==========================================================
   FLORES AMARILLAS — script.js
   Estados de la página (atributo data-state en <body>):
     welcome   → pantalla inicial con el botón "Tócame"
     starting  → la bienvenida se desvanece
     garden    → jardín animado + mensaje permanente
     resetting → el jardín se desvanece antes de volver al inicio
   ========================================================== */
(() => {
  'use strict';

  /* ---------- 1. CONFIGURACIÓN (edita aquí) ---------- */
  const CONFIG = {
    texts: {
      welcome: 'Tengo algo especial para ti...',
      startButton: 'Tócame ✨',
      message: 'Estas flores amarillas son un reflejo de la alegría que traes a mi vida.',
      messageSub: 'Gracias por iluminar mis días con tu presencia. 🌻',
      restartButton: 'Volver a ver la animación ↻'
    },
    counts: { stars: 56, particles: 22 },
    timing: {
      transitionMs: 800,   // duración del fundido entre pantallas (debe coincidir con el CSS)
      startDelayS: 0.5,    // espera antes de que crezca la primera flor
      staggerS: 0.3        // separación entre una flor y la siguiente
    },
    seed: 11,              // misma semilla = mismo jardín siempre
    // x: posición horizontal (%) · height: alto del tallo (unidades SVG)
    // petal: largo del pétalo · bend: curvatura del tallo · tilt: inclinación (grados)
    flowers: [
      { x: 9,  height: 330, petal: 38, bend: -10, tilt: 5 },
      { x: 21, height: 455, petal: 46, bend: 12,  tilt: 3 },
      { x: 35, height: 350, petal: 42, bend: -14, tilt: -3 },
      { x: 50, height: 560, petal: 58, bend: 8,   tilt: 0 },
      { x: 65, height: 370, petal: 44, bend: 14,  tilt: 3 },
      { x: 79, height: 495, petal: 52, bend: -10, tilt: -4 },
      { x: 91, height: 320, petal: 36, bend: 10,  tilt: -5 }
    ]
  };

  /* ---------- 2. Referencias y estado ---------- */
  const $ = (id) => document.getElementById(id);
  const els = {
    welcomeText: $('welcomeText'),
    startBtn: $('startBtn'),
    garden: $('garden'),
    flowers: $('flowers'),
    messageMain: $('messageMain'),
    messageSub: $('messageSub'),
    restartBtn: $('restartBtn'),
    stars: $('stars'),
    particles: $('particles')
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const smallScreen = window.matchMedia('(max-width: 600px)');

  let state = 'welcome';
  let timerId = null;

  function setState(next) {
    state = next;
    document.body.dataset.state = next;
  }

  /* ---------- 3. Utilidades ---------- */
  // Generador pseudoaleatorio con semilla (mulberry32)
  function mulberry32(seed) {
    let a = seed;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const between = (rand, min, max) => min + rand() * (max - min);
  const round1 = (n) => Math.round(n * 10) / 10;
  const round2 = (n) => Math.round(n * 100) / 100;

  function cubicPoint(p0, p1, p2, p3, t) {
    const m = 1 - t;
    return {
      x: m * m * m * p0.x + 3 * m * m * t * p1.x + 3 * m * t * t * p2.x + t * t * t * p3.x,
      y: m * m * m * p0.y + 3 * m * m * t * p1.y + 3 * m * t * t * p2.y + t * t * t * p3.y
    };
  }

  const transitionMs = () => (reduceMotion.matches ? 300 : CONFIG.timing.transitionMs);

  /* ---------- 4. Textos ---------- */
  function applyTexts() {
    const t = CONFIG.texts;
    els.welcomeText.textContent = t.welcome;
    els.startBtn.textContent = t.startButton;
    els.messageMain.textContent = t.message;
    els.messageSub.textContent = t.messageSub;
    els.restartBtn.textContent = t.restartButton;
  }

  /* ---------- 5. Cielo: estrellas y partículas ---------- */
  function createSky() {
    const rand = mulberry32(2024);
    const scale = smallScreen.matches ? 0.65 : 1;
    const starColors = ['#ffffff', '#ffffff', '#cfefff', '#fff2b0'];
    const dustColors = ['#ffd84d', '#9fe8ff', '#fff2b0'];

    const stars = document.createDocumentFragment();
    for (let i = 0; i < Math.round(CONFIG.counts.stars * scale); i++) {
      const s = document.createElement('span');
      s.className = 'star';
      s.style.cssText =
        `left:${round1(between(rand, 0, 100))}%;top:${round1(between(rand, 0, 88))}%;` +
        `--s:${round1(between(rand, 1, 2.8))}px;--t:${round1(between(rand, 2.5, 6))}s;` +
        `--td:${round1(between(rand, 0, 6))}s;--o:${round2(between(rand, .5, 1))};` +
        `--c:${starColors[Math.floor(rand() * starColors.length)]}`;
      stars.appendChild(s);
    }
    els.stars.replaceChildren(stars);

    const dust = document.createDocumentFragment();
    const total = reduceMotion.matches ? 0 : Math.round(CONFIG.counts.particles * scale);
    for (let i = 0; i < total; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      p.style.cssText =
        `--x:${round1(between(rand, 2, 98))}%;--y:${round1(between(rand, 0, 35))}%;` +
        `--s:${round1(between(rand, 2, 4))}px;--t:${round1(between(rand, 9, 18))}s;` +
        `--td:-${round1(between(rand, 0, 14))}s;--o:${round2(between(rand, .45, .85))};` +
        `--dx:${Math.round(between(rand, -40, 40))}px;--rise:${Math.round(between(rand, 45, 85))}vh;` +
        `--c:${dustColors[Math.floor(rand() * dustColors.length)]}`;
      dust.appendChild(p);
    }
    els.particles.replaceChildren(dust);
  }

  /* ---------- 6. Construcción de las flores (SVG) ---------- */
  const petalPath = (r) =>
    `M0 0C${round1(-.38 * r)} ${round1(-.2 * r)} ${round1(-.34 * r)} ${round1(-.8 * r)} 0 ${-r}` +
    `C${round1(.34 * r)} ${round1(-.8 * r)} ${round1(.38 * r)} ${round1(-.2 * r)} 0 0Z`;

  const leafPath = (L) =>
    `M0 0C${round1(.25 * L)} ${round1(-.34 * L)} ${round1(.7 * L)} ${round1(-.36 * L)} ${round1(L)} 0` +
    `C${round1(.7 * L)} ${round1(.32 * L)} ${round1(.25 * L)} ${round1(.3 * L)} 0 0Z`;

  const SPARKLE_PATH = 'M0 -7Q0 0 7 0Q0 0 0 7Q0 0 -7 0Q0 0 0 -7Z';
  const LEAF_POSITIONS = [0.28, 0.46, 0.64]; // a qué altura del tallo nace cada hoja (0 = base, 1 = flor)

  function leavesMarkup(curve, cfg, index, rand) {
    return LEAF_POSITIONS.map((t, k) => {
      const pt = cubicPoint(curve.p0, curve.p1, curve.p2, curve.p3, t);
      const side = (index + k) % 2 === 0 ? 1 : -1;
      const angle = round1((side === 1 ? -36 : -144) + between(rand, -8, 8));
      const len = (38 + 32 * (cfg.height / 560)) * (1 - k * 0.1);
      const tone = 1 + Math.floor(rand() * 3);
      const delay = round2(0.25 + t * 1.8);
      return (
        `<g transform="translate(${round1(pt.x)} ${round1(pt.y)}) rotate(${angle})">` +
          `<g class="leaf-sway" style="--fs:${round1(between(rand, 4, 6.5))}s;--fd:${round1(between(rand, 0, 2))}s">` +
            `<g class="leaf leaf--${tone}" style="--ld:${delay}s">` +
              `<path class="leaf__blade" d="${leafPath(len)}"/>` +
              `<path class="leaf__vein" d="M0 0L${round1(len * .82)} 0"/>` +
            `</g>` +
          `</g>` +
        `</g>`
      );
    }).join('');
  }

  function headMarkup(cfg, cx, cy, rand) {
    const R = cfg.petal;
    const n = 8;
    const step = 360 / n;
    const backD = petalPath(R);
    const frontD = petalPath(R * 0.84);

    let back = '';
    let front = '';
    for (let k = 0; k < n; k++) {
      const a1 = round1(k * step + between(rand, -4, 4));
      const a2 = round1(k * step + step / 2 + between(rand, -4, 4));
      back += `<g transform="rotate(${a1})"><path class="petal petal--back" style="--k:${k}" fill="url(#g-petal-back)" d="${backD}"/></g>`;
      front += `<g transform="rotate(${a2})"><path class="petal petal--front" style="--k:${k}" fill="url(#g-petal-front)" d="${frontD}"/></g>`;
    }

    const c = R * 0.3;
    let dots = '';
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      dots += `<circle cx="${round1(Math.cos(a) * c * .62)}" cy="${round1(Math.sin(a) * c * .62)}" r="${round1(c * .07)}" fill="#a85d00" opacity=".55"/>`;
    }

    let sparkles = '';
    for (let k = 0; k < 2; k++) {
      const a = between(rand, 0, Math.PI * 2);
      const d = R * between(rand, 1.3, 2);
      sparkles +=
        `<g transform="translate(${round1(Math.cos(a) * d)} ${round1(Math.sin(a) * d)})">` +
          `<path class="sparkle" style="--sd:${round1(between(rand, 0, 2.5))}s" d="${SPARKLE_PATH}"/>` +
        `</g>`;
    }

    return (
      `<g class="head" transform="translate(${round1(cx)} ${round1(cy)})">` +
        `<circle class="halo" r="${round1(R * 2.8)}" fill="url(#g-halo)"/>` +
        `<g class="petals">${back}${front}</g>` +
        `<g class="center-group">` +
          `<circle r="${round1(c)}" fill="url(#g-center)"/>` +
          `<circle r="${round1(c * .55)}" fill="#ffd966" opacity=".55"/>` +
          dots +
        `</g>` +
        sparkles +
      `</g>`
    );
  }

  function buildFlower(cfg, index, order, rand) {
    const H = cfg.height;
    const R = cfg.petal;
    const cx = 100 + cfg.bend;
    const cy = R + 14;
    const span = H - cy;

    const curve = {
      p0: { x: 100, y: H },
      p1: { x: 100 - cfg.bend * 0.5, y: H - span * 0.4 },
      p2: { x: cx + cfg.bend * 0.5, y: cy + span * 0.35 },
      p3: { x: cx, y: cy }
    };
    const stemD = `M${curve.p0.x} ${curve.p0.y}C${round1(curve.p1.x)} ${round1(curve.p1.y)} ${round1(curve.p2.x)} ${round1(curve.p2.y)} ${round1(curve.p3.x)} ${round1(curve.p3.y)}`;
    const stemWidth = round1(3 + R / 28);

    const delay = round2(CONFIG.timing.startDelayS + order * CONFIG.timing.staggerS);
    const sway = round1(between(rand, 5, 8));

    return (
      `<div class="flower" style="--x:${cfg.x}%;--h:${H};--tilt:${cfg.tilt}deg;--d:${delay}s;--sway:${sway}s">` +
        `<svg class="flower__svg" viewBox="0 0 200 ${H}" aria-hidden="true" focusable="false">` +
          `<path class="stem" pathLength="1" stroke-width="${stemWidth}" d="${stemD}"/>` +
          leavesMarkup(curve, cfg, index, rand) +
          headMarkup(cfg, cx, cy, rand) +
        `</svg>` +
      `</div>`
    );
  }

  function buildGarden() {
    const rand = mulberry32(CONFIG.seed);
    const flowers = CONFIG.flowers;

    // Orden de aparición: del centro hacia los lados
    const rank = new Array(flowers.length);
    flowers
      .map((f, i) => ({ i, dist: Math.abs(f.x - 50) }))
      .sort((a, b) => a.dist - b.dist || a.i - b.i)
      .forEach((o, pos) => { rank[o.i] = pos; });

    els.flowers.replaceChildren();   // nunca duplicar flores
    els.flowers.insertAdjacentHTML(
      'beforeend',
      flowers.map((cfg, i) => buildFlower(cfg, i, rank[i], rand)).join('')
    );
  }

  function clearGarden() {
    els.garden.classList.remove('is-playing');
    els.flowers.replaceChildren();
  }

  /* ---------- 7. Flujo de la experiencia ---------- */
  function startExperience() {
    if (state !== 'welcome') return;          // evita iniciar varias veces
    setState('starting');
    timerId = window.setTimeout(() => {
      buildGarden();
      els.garden.classList.add('is-playing'); // dispara las animaciones CSS
      setState('garden');
    }, transitionMs());
  }

  function restartExperience() {
    if (state !== 'garden') return;           // evita reinicios simultáneos
    setState('resetting');
    timerId = window.setTimeout(() => {
      clearGarden();
      setState('welcome');
      els.startBtn.focus({ preventScroll: true });
    }, transitionMs());
  }

  /* ---------- 8. Inicio ---------- */
  function init() {
    applyTexts();
    createSky();
    els.startBtn.addEventListener('click', startExperience);     // mouse y táctil
    els.restartBtn.addEventListener('click', restartExperience);
  }

  init();
})();
