/* ============ Utilidades ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ic = (name, cls = "") => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const money = (n) => "$" + Math.round(n).toLocaleString("es-CO").replace(/,/g, ".");
const app = $("#app");

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const NOW = new Date();
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fechaLarga = (d) => `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
const fechaCorta = (d) => `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}.`;
const mesNombre = (offset = 0) => { const d = new Date(NOW.getFullYear(), NOW.getMonth() + offset, 1); return { mes: MESES[d.getMonth()], anio: d.getFullYear(), d }; };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
/* El cliente de ejemplo (Samu) entró en febrero de 2026: los meses se cuentan desde ahí. */
const MESES_CLIENTE = Math.max(1, NOW.getFullYear() * 12 + NOW.getMonth() - (2026 * 12 + 1) + 1);
function hora(d) {
  let h = d.getHours(); const m = String(d.getMinutes()).padStart(2, "0");
  const suf = h >= 12 ? "p.m." : "a.m."; h = h % 12 || 12;
  return `${h}:${m} ${suf}`;
}
function addMin(d, m) { return new Date(d.getTime() + m * 60000); }

/* Escala del teléfono en escritorio */
function fitDevice() {
  const dev = $("#device"), slot = $("#deviceSlot");
  if (window.innerWidth <= 520) { dev.style.transform = ""; slot.style.width = slot.style.height = ""; return; }
  const s = Math.min(1, (window.innerHeight - 40) / 868);
  dev.style.transform = s < 1 ? `scale(${s})` : "";
  slot.style.width = 414 * s + "px"; slot.style.height = 868 * s + "px";
}
function appScale() { const r = app.getBoundingClientRect(); return r.width / app.offsetWidth || 1; }
function localRect(el) {
  const r = el.getBoundingClientRect(), a = app.getBoundingClientRect(), s = appScale();
  return { x: (r.left - a.left) / s, y: (r.top - a.top) / s, w: r.width / s, h: r.height / s };
}

/* ============ Lámpara Orb ============ */
let lampSeq = 0;
function lampMarkup() {
  const id = "lp" + (++lampSeq);
  return `<span class="lamp__bloom"></span>
<svg class="lamp__svg" viewBox="0 0 200 196" aria-hidden="true">
  <defs>
    <radialGradient id="${id}on" cx="0.63" cy="0.33" r="0.8">
      <stop offset="0" stop-color="#ffffff"/><stop offset="0.42" stop-color="#fffaf1"/>
      <stop offset="0.78" stop-color="#f3e7d4"/><stop offset="1" stop-color="#dfccb1"/>
    </radialGradient>
    <radialGradient id="${id}off" cx="0.63" cy="0.33" r="0.8">
      <stop offset="0" stop-color="#57534d"/><stop offset="0.6" stop-color="#312f2b"/><stop offset="1" stop-color="#1c1b19"/>
    </radialGradient>
    <linearGradient id="${id}top" x1="0" x2="1">
      <stop offset="0" stop-color="#b98f5e"/><stop offset="0.5" stop-color="#dcbd8f"/><stop offset="1" stop-color="#b38756"/>
    </linearGradient>
    <linearGradient id="${id}side" x1="0" x2="1">
      <stop offset="0" stop-color="#5e4127"/><stop offset="0.45" stop-color="#9a7148"/><stop offset="1" stop-color="#553a22"/>
    </linearGradient>
    <radialGradient id="${id}spill" cx="0.5" cy="0.2" r="0.62">
      <stop offset="0" stop-color="#fff6e6" stop-opacity="0.95"/><stop offset="1" stop-color="#fff6e6" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="${id}band"><path d="M42 170 A58 11 0 0 0 158 170 L158 182 A58 11 0 0 1 42 182 Z"/></clipPath>
  </defs>
  <ellipse cx="100" cy="182" rx="58" ry="11" fill="url(#${id}side)"/>
  <rect x="42" y="170" width="116" height="12" fill="url(#${id}side)"/>
  <g clip-path="url(#${id}band)" fill="none" stroke="#3b2714" stroke-opacity="0.55" stroke-width="0.7">
    <path d="M42 173 A58 11 0 0 0 158 173"/><path d="M42 176 A58 11 0 0 0 158 176"/><path d="M42 179 A58 11 0 0 0 158 179"/>
  </g>
  <ellipse cx="100" cy="170" rx="58" ry="11" fill="url(#${id}top)"/>
  <ellipse class="lamp__spill" cx="100" cy="170" rx="58" ry="11" fill="url(#${id}spill)"/>
  <circle cx="100" cy="92" r="78" fill="url(#${id}off)"/>
  <circle class="lamp__on" cx="100" cy="92" r="78" fill="url(#${id}on)"/>
</svg>`;
}
const lamps = [];
function mountLamp(el, opts = {}) {
  el.innerHTML = lampMarkup();
  const L = { el, mode: opts.mode || "auto", level: 1, phase: Math.random() * 6, target: el, extra: opts.extra || null, temp: !!opts.temp, fn: opts.fn || null };
  lamps.push(L);
  return L;
}
function setLevel(L, v) {
  L.level = v;
  L.el.style.setProperty("--L", v.toFixed(3));
  if (L.extra) L.extra.style.setProperty("--L", Math.min(1, v).toFixed(3));
}
const STATE = { unstable: false };
function levelOf(L, now) { return L.mode === "fn" && L.fn ? L.fn(now) : autoLevel(now / 1000, L.phase); }
/* Transición de elemento compartido: lleva `el` a la posición y tamaño de `target`. */
function flipTo(el, target, opts = {}) {
  const f = opts.fromRect || localRect(el), t = opts.toRect || localRect(target), box = localRect(el);
  el.style.transformOrigin = `${f.x - box.x}px ${f.y - box.y}px`;
  return el.animate([{ transform: "none" }, { transform: `translate(${t.x - f.x}px, ${t.y - f.y}px) scale(${t.w / f.w})` }],
    { duration: REDUCED ? 1 : opts.dur || 950, easing: opts.easing || "cubic-bezier(0.65, 0, 0.2, 1)", fill: "forwards" });
}
function autoLevel(t, phase) {
  if (REDUCED) return STATE.unstable ? 0.7 : 0.96;
  if (!STATE.unstable) return 0.93 + 0.05 * Math.sin(t * 1.25 + phase);
  let n = 0.62 + 0.18 * Math.sin(t * 7.3 + phase) + 0.1 * Math.sin(t * 13.7 + 1.3) + 0.06 * Math.sin(t * 2.1);
  if (Math.sin(t * 1.7 + phase) * Math.sin(t * 0.83) > 0.72) n *= 0.32;
  return clamp(n, 0.12, 1);
}
let lastLampTick = 0;
function lampLoop(now) {
  const t = now / 1000;
  if (now - lastLampTick > 30) {
    lastLampTick = now;
    for (let i = lamps.length - 1; i >= 0; i--) if (!lamps[i].el.isConnected && lamps[i].temp) lamps.splice(i, 1);
    for (const L of lamps) {
      if (!L.el.isConnected) continue;
      if (L.mode === "auto") setLevel(L, autoLevel(t, L.phase));
      else if (L.mode === "fn") setLevel(L, L.fn(now));
    }
  }
  requestAnimationFrame(lampLoop);
}

/* ============ Apertura: wordmark en acordeón ============ */
const LOGO = {{LOGO_JSON}};
const LETTERS = [
  { d: LOGO[0], x0: 0.72, x1: 40.21, max: 14, cuts: [{ x: 20, bands: [[2.41, 8.51], [20.39, 26.49], [38.1, 44.46]] }] },
  { d: LOGO[1], x0: 45.25, x1: 88.94, max: 16, cuts: [{ x: 67.07, bands: [[1.56, 7.56], [39.32, 45.3]] }] },
  { d: LOGO[2], x0: 94.2, x1: 150.24, max: 11, cuts: [{ x: 106.2, bands: [[1.67, 7.67]] }, { x: 122.22, bands: [[38.74, 44.73]] }, { x: 138.22, bands: [[1.67, 7.67]] }] },
  { d: LOGO[3], x0: 155.5, x1: 199.19, max: 16, cuts: [{ x: 177.32, bands: [[1.56, 7.56], [39.32, 45.3]] }] },
  { d: LOGO[4], x0: 204.23, x1: 243.72, max: 14, cuts: [{ x: 223.51, bands: [[2.41, 8.51], [20.39, 26.49], [38.1, 44.46]] }] }
];
const SPL = { joints: [], segs: [], rects: [], word: null, running: false, done: false };
function buildSplashLogo() {
  const NS = "http://www.w3.org/2000/svg";
  const svg = $("#splashLogo");
  svg.innerHTML = "";
  const defs = document.createElementNS(NS, "defs");
  const word = document.createElementNS(NS, "g");
  svg.append(defs, word);
  const joints = [];
  LETTERS.forEach((L, i) => {
    L.cuts.forEach((c) => joints.push({ x: c.x, bands: c.bands, max: L.max }));
    if (i < LETTERS.length - 1) joints.push({ x: (L.x1 + LETTERS[i + 1].x0) / 2, bands: [], max: 7 });
  });
  joints.sort((a, b) => a.x - b.x);
  joints.forEach((j) => Object.assign(j, { e: 0, v: 0, target: 0, k: 90, c: 17, at: Infinity, next: null }));
  const segs = [];
  LETTERS.forEach((L, li) => {
    const b = [L.x0 - 3, ...L.cuts.map((c) => c.x), L.x1 + 3];
    for (let k = 0; k < b.length - 1; k++) {
      const x0 = b[k] - (k > 0 ? 0.35 : 0), x1 = b[k + 1] + (k < b.length - 2 ? 0.35 : 0);
      const cp = document.createElementNS(NS, "clipPath");
      cp.setAttribute("id", `sc${li}${k}`);
      const r = document.createElementNS(NS, "rect");
      r.setAttribute("x", x0); r.setAttribute("y", -4); r.setAttribute("width", x1 - x0); r.setAttribute("height", 56);
      cp.appendChild(r); defs.appendChild(cp);
      const g = document.createElementNS(NS, "g");
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", L.d); p.setAttribute("clip-path", `url(#sc${li}${k})`);
      g.appendChild(p); word.appendChild(g);
      segs.push({ g, before: joints.filter((j) => j.x < b[k] + 0.01).length });
    }
  });
  const rects = [];
  joints.forEach((j, ji) => j.bands.forEach(([y0, y1]) => {
    const r = document.createElementNS(NS, "rect");
    r.setAttribute("y", y0); r.setAttribute("height", y1 - y0); r.setAttribute("width", 0);
    word.appendChild(r); rects.push({ r, ji });
  }));
  Object.assign(SPL, { joints, segs, rects, word, emax: joints.reduce((s, j) => s + j.max, 0) });
  renderSplashLogo();
}
function renderSplashLogo() {
  const { joints, segs, rects, word } = SPL;
  const pre = [0];
  joints.forEach((j, i) => (pre[i + 1] = pre[i] + j.e));
  segs.forEach((s) => s.g.setAttribute("transform", `translate(${pre[s.before].toFixed(3)} 0)`));
  rects.forEach(({ r, ji }) => {
    const j = joints[ji];
    r.setAttribute("x", (j.x - 0.35 + pre[ji]).toFixed(3));
    r.setAttribute("width", j.e > 0.02 ? (j.e + 0.7).toFixed(3) : 0);
  });
  word.setAttribute("transform", `translate(${(-pre[joints.length] / 2).toFixed(3)} 0)`);
  return pre[joints.length];
}
function stepSprings(dt) {
  const h = 1 / 240;
  for (let t = 0; t < dt; t += h) {
    for (const j of SPL.joints) {
      const a = -j.k * (j.e - j.target) - j.c * j.v;
      j.v += a * h; j.e += j.v * h;
    }
  }
}
function lampOn(ms) {
  // encendido con un par de parpadeos, como una bombilla real
  const k = [[0, 0.08], [160, 0.1], [230, 0.6], [290, 0.14], [370, 0.82], [430, 0.46], [520, 0.9], [760, 1]];
  if (ms <= 0) return k[0][1];
  for (let i = 1; i < k.length; i++) if (ms < k[i][0]) { const [t0, v0] = k[i - 1], [t1, v1] = k[i]; return lerp(v0, v1, (ms - t0) / (t1 - t0)); }
  return 1;
}
let splashLamp = null, heroLamp = null, welcomeLamp = null;
const T_STRETCH = 1050, T_RELEASE = 1950, T_LEAVE = 3350;
function splashTargets() {
  // Usuario nuevo: la marca aterriza en la bienvenida. Cliente: en el inicio.
  if (!DATA.client) return { home: false, logo: $("#welcomeLogoG"), logoBox: $("#welcomeLogo"), lamp: $("#welcomeLamp"), lampObj: welcomeLamp };
  return { home: true, logo: $("#headerLogoG"), logoBox: $("#headerLogo"), lamp: $("#heroLamp"), lampObj: heroLamp };
}
function runSplash() {
  const splash = $("#splash");
  splash.hidden = false;
  splash.classList.remove("is-leaving");
  $("#splashLogo").getAnimations().forEach((a) => a.cancel());
  $("#splashLamp").getAnimations().forEach((a) => a.cancel());
  $("#splashLogo").style.opacity = 0;
  SPL.joints.forEach((j) => { j.e = 0; j.v = 0; j.target = 0; j.stretched = false; });
  renderSplashLogo();
  const T = splashTargets();
  if (!T.home) showWelcome(true);
  T.logoBox.classList.add("is-hidden-for-flip");
  T.lamp.classList.add("is-hidden-for-flip");
  $$("[data-rise]").forEach((el) => el.classList.remove("rise"));
  SPL.done = false; SPL.running = true;
  const fx = $("#splashFx");
  splashLamp.mode = "manual";
  const t0 = performance.now();
  let last = t0, leaving = false;
  const stretchAt = SPL.joints.map((_, i) => T_STRETCH + i * 42);
  const releaseAt = SPL.joints.map((_, i) => T_RELEASE + (SPL.joints.length - 1 - i) * 16);
  SPL.skip = () => { if (!leaving) { SPL.joints.forEach((j) => { j.e = 0; j.v = 0; j.target = 0; }); renderSplashLogo(); leave(); } };
  if (REDUCED) {
    setLevel(splashLamp, 1); fx.style.setProperty("--L", 1); $("#splashLogo").style.opacity = 1;
    setTimeout(() => SPL.skip(), 1200);
    return;
  }
  function frame(now) {
    if (!SPL.running) return;
    const t = now - t0, dt = Math.min(0.05, (now - last) / 1000); last = now;
    SPL.joints.forEach((j, i) => {
      if (t >= stretchAt[i] && t < releaseAt[i] && j.target === 0 && !j.stretched) { j.target = j.max; j.k = 95; j.c = 2 * 0.9 * Math.sqrt(95); j.stretched = true; }
      if (t >= releaseAt[i] && j.target !== 0) { j.target = 0; j.k = 320; j.c = 2 * 0.23 * Math.sqrt(320); }
    });
    stepSprings(dt);
    const E = leaving ? 0 : renderSplashLogo();
    const ratio = clamp(E / SPL.emax, -0.3, 1);
    const on = lampOn(t - 120);
    const L = on * (0.84 + 0.28 * ratio);
    if (!leaving) {
      setLevel(splashLamp, L);
      fx.style.setProperty("--L", clamp(L, 0, 1));
      $("#splashLogo").style.opacity = smooth(420, 980, t).toFixed(3);
    }
    if (t >= T_LEAVE && !leaving) leave();
    if (t < T_LEAVE + 1400) requestAnimationFrame(frame);
    else SPL.running = false;
  }
  function leave() {
    leaving = true;
    SPL.joints.forEach((j) => { j.e = 0; j.v = 0; j.target = 0; j.stretched = true; });
    renderSplashLogo();
    $("#splashLogo").style.opacity = 1;
    if (T.home) { goTab(0, true); $("#scr-0").scrollTop = 0; }
    const dur = REDUCED ? 1 : 950;
    flipTo($("#splashLogo"), T.logo, { fromRect: localRect(SPL.word), dur });
    flipTo($("#splashLamp"), T.lamp, { dur });
    splashLamp.mode = "fn";
    const from = splashLamp.level, tl = performance.now();
    splashLamp.fn = (now) => lerp(from, levelOf(T.lampObj, now), smooth(0, dur, now - tl));
    $("#splash").classList.add("is-leaving");
    if (T.home) setTimeout(riseHome, 40);
    setTimeout(() => {
      T.logoBox.classList.remove("is-hidden-for-flip");
      T.lamp.classList.remove("is-hidden-for-flip");
      splashLamp.mode = "manual";
      $("#splash").hidden = true;
      SPL.done = true;
      if (T.home) startHomeCounters();
      afterSplash();
    }, dur + 30);
  }
  requestAnimationFrame(frame);
}
function riseHome() {
  $$("[data-rise]").forEach((el) => { el.classList.remove("rise"); el.style.setProperty("--d", (+el.dataset.rise + 260) + "ms"); void el.offsetWidth; el.classList.add("rise"); });
}

/* ============ Hojas, páginas, avisos ============ */
const sheet = $("#sheet"), sheetBody = $("#sheetBody"), scrim = $("#scrim");
let sheetReturn = null, sheetOnClose = null;
function openSheet(html, mount, onClose) {
  closePage(true);
  sheetReturn = document.activeElement;
  sheetOnClose = onClose || null;
  sheetBody.innerHTML = html;
  sheet.hidden = false;
  sheet.getBoundingClientRect();
  sheet.classList.add("is-open");
  scrim.classList.add("is-on");
  if (mount) mount(sheetBody);
  setTimeout(() => { const f = sheetBody.querySelector("[autofocus], .sheet__head .icon-btn"); if (f) f.focus({ preventScroll: true }); }, 60);
}
function swapSheet(html, mount) {
  sheetBody.innerHTML = html;
  sheetBody.firstElementChild && sheetBody.firstElementChild.classList.add("step-in");
  sheetBody.scrollTop = 0;
  if (mount) mount(sheetBody);
}
function closeSheet() {
  if (!sheet.classList.contains("is-open")) return;
  sheet.classList.remove("is-open");
  sheet.style.transform = "";
  scrim.classList.remove("is-on");
  const cb = sheetOnClose; sheetOnClose = null;
  setTimeout(() => { if (!sheet.classList.contains("is-open")) { sheet.hidden = true; sheetBody.innerHTML = ""; } }, 470);
  if (cb) cb();
  if (sheetReturn && document.contains(sheetReturn)) sheetReturn.focus({ preventScroll: true });
}
(function sheetDrag() {
  const grab = $("#sheetGrab");
  let y0 = null, dy = 0, t0 = 0;
  grab.addEventListener("pointerdown", (e) => { y0 = e.clientY; dy = 0; t0 = performance.now(); grab.setPointerCapture(e.pointerId); sheet.classList.add("is-dragging"); });
  grab.addEventListener("pointermove", (e) => { if (y0 === null) return; dy = Math.max(0, (e.clientY - y0) / appScale()); sheet.style.transform = `translateY(${dy}px)`; });
  const end = () => {
    if (y0 === null) return;
    const v = dy / Math.max(1, performance.now() - t0);
    y0 = null; sheet.classList.remove("is-dragging");
    if (dy > 110 || v > 0.6) closeSheet(); else sheet.style.transform = "";
  };
  grab.addEventListener("pointerup", end); grab.addEventListener("pointercancel", end);
})();
function sheetHead(title, sub) {
  return `<div class="sheet__head"><div style="display:flex;flex-direction:column;gap:4px;min-width:0"><h2 class="h3" id="sheetTitle">${title}</h2>${sub ? `<p class="label muted">${sub}</p>` : ""}</div><button class="icon-btn" type="button" data-action="close-sheet" aria-label="Cerrar">${ic("close")}</button></div>`;
}

let openPageEl = null;
function openPage(id) {
  closeSheet();
  const p = $("#" + id);
  p.classList.add("is-open");
  openPageEl = p;
  setTimeout(() => { const b = p.querySelector("[data-action=close-page]"); b && b.focus({ preventScroll: true }); }, 80);
}
function closePage(silent) {
  if (!openPageEl) return;
  openPageEl.classList.remove("is-open");
  openPageEl = null;
  if (!silent) $("#bellBtn").focus({ preventScroll: true });
}

let toastTimer = null;
function toast(msg, icon = "check") {
  const t = $("#toast");
  t.querySelector("use").setAttribute("href", "#i-" + icon);
  $("#toastTxt").textContent = msg;
  t.classList.toggle("toast--top", sheet.classList.contains("is-open"));
  t.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("is-on"), 2600);
}
let pushTimer = null, pushHandler = null;
function push({ title, text, tone = "warning", icon = "alert", onTap = null }) {
  const p = $("#push"), pi = $("#pushIcon");
  $("#pushTitle").textContent = title; $("#pushText").textContent = text;
  pi.style.borderColor = `var(--${tone})`; pi.style.background = `var(--${tone}-ground)`; pi.style.color = `var(--${tone})`;
  pi.querySelector("use").setAttribute("href", "#i-" + icon);
  pushHandler = onTap;
  p.classList.remove("is-on"); p.getBoundingClientRect();
  p.classList.add("is-on"); p.tabIndex = 0;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(hidePush, 5200);
}
function hidePush() { const p = $("#push"); p.classList.remove("is-on"); p.tabIndex = -1; }

/* Hold-to-confirm */
function holdButton(btn, ms, onDone) {
  const fill = btn.querySelector(".hold__fill");
  let anim = null, busy = false;
  const start = (e) => {
    if (busy || btn.disabled) return;
    if (e && e.pointerId !== undefined) btn.setPointerCapture(e.pointerId);
    btn.classList.add("is-holding");
    anim = fill.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: REDUCED ? 300 : ms, easing: "linear", fill: "forwards" });
    anim.onfinish = () => { busy = true; btn.classList.remove("is-holding"); fill.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: "forwards" }); onDone(() => { busy = false; anim && anim.cancel(); fill.getAnimations().forEach((a) => a.cancel()); }); };
  };
  const stop = () => { if (anim && anim.playState === "running") { anim.reverse(); btn.classList.remove("is-holding"); } };
  btn.addEventListener("pointerdown", start);
  btn.addEventListener("pointerup", stop); btn.addEventListener("pointerleave", stop); btn.addEventListener("pointercancel", stop);
  btn.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) { e.preventDefault(); start(); } });
  btn.addEventListener("keyup", (e) => { if (e.key === "Enter" || e.key === " ") stop(); });
  btn.addEventListener("contextmenu", (e) => e.preventDefault());
}

/* ============ Código QR (modo byte, corrección M, versiones 1 a 6) ============ */
const QR = (() => {
  const ECC = [0, 10, 16, 26, 18, 24, 16], BLK = [0, 1, 1, 1, 2, 2, 4];
  const mul = (x, y) => { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11d); z ^= ((y >>> i) & 1) * x; } return z & 0xff; };
  const divisor = (deg) => { const r = new Array(deg).fill(0); r[deg - 1] = 1; let root = 1; for (let i = 0; i < deg; i++) { for (let j = 0; j < deg; j++) { r[j] = mul(r[j], root); if (j + 1 < deg) r[j] ^= r[j + 1]; } root = mul(root, 2); } return r; };
  const rem = (data, div) => { const r = div.map(() => 0); for (const b of data) { const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => (r[i] ^= mul(c, f))); } return r; };
  const raw = (v) => { let r = (16 * v + 128) * v + 64; if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; } return r; };
  const dcw = (v) => Math.floor(raw(v) / 8) - ECC[v] * BLK[v];
  function encode(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    let v = 1; while (v <= 6 && 12 + bytes.length * 8 > dcw(v) * 8) v++;
    if (v > 6) return null;
    const bits = []; const put = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    put(4, 4); put(bytes.length, 8); bytes.forEach((b) => put(b, 8));
    const cap = dcw(v) * 8;
    put(0, Math.min(4, cap - bits.length)); put(0, (8 - (bits.length % 8)) % 8);
    for (let p = 0xec; bits.length < cap; p ^= 0xec ^ 0x11) put(p, 8);
    const data = []; for (let i = 0; i < bits.length; i += 8) { let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]; data.push(b); }
    const nb = BLK[v], ecl = ECC[v], rc = Math.floor(raw(v) / 8), nShort = nb - (rc % nb), sLen = Math.floor(rc / nb), div = divisor(ecl);
    const blocks = [];
    for (let i = 0, k = 0; i < nb; i++) { const d = data.slice(k, k + sLen - ecl + (i < nShort ? 0 : 1)); k += d.length; const e = rem(d, div); if (i < nShort) d.push(0); blocks.push(d.concat(e)); }
    const cw = []; for (let i = 0; i < blocks[0].length; i++) for (let j = 0; j < nb; j++) if (i !== sLen - ecl || j >= nShort) cw.push(blocks[j][i]);
    const size = v * 4 + 17;
    const M = Array.from({ length: size }, () => new Array(size).fill(false));
    const F = Array.from({ length: size }, () => new Array(size).fill(false));
    const set = (x, y, d) => { M[y][x] = d; F[y][x] = true; };
    for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    const finder = (cx, cy) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)), x = cx + dx, y = cy + dy; if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4); } };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    if (v >= 2) { const p = size - 7; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(p + dx, p + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); }
    const format = (mask) => {
      const d = mask; let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      const b = ((d << 10) | r) ^ 0x5412, g = (i) => ((b >>> i) & 1) !== 0;
      for (let i = 0; i <= 5; i++) set(8, i, g(i));
      set(8, 7, g(6)); set(8, 8, g(7)); set(7, 8, g(8));
      for (let i = 9; i < 15; i++) set(14 - i, 8, g(i));
      for (let i = 0; i < 8; i++) set(size - 1 - i, 8, g(i));
      for (let i = 8; i < 15; i++) set(8, size - 15 + i, g(i));
      set(8, size - 8, true);
    };
    format(0);
    let i = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
        const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
        if (!F[y][x] && i < cw.length * 8) { M[y][x] = ((cw[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0; i++; }
      }
    }
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!F[y][x] && (x + y) % 2 === 0) M[y][x] = !M[y][x];
    format(0);
    return { size, M };
  }
  function svg(text) {
    const q = encode(text); if (!q) return "";
    const { size, M } = q; const inFinder = (x, y) => (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
    let dots = "";
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (M[y][x] && !inFinder(x, y)) dots += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.46"/>`;
    const fp = (x, y) => `<rect x="${x + 0.5}" y="${y + 0.5}" width="6" height="6" rx="0.5" fill="none" stroke="currentColor" stroke-width="1"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.5"/>`;
    return `<svg viewBox="-1 -1 ${size + 2} ${size + 2}" role="img" aria-label="Código QR de la red Wi‑Fi" fill="currentColor">${dots}${fp(0, 0)}${fp(size - 7, 0)}${fp(0, size - 7)}</svg>`;
  }
  return { svg, encode };
})();
