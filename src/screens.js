/* ============ Datos de ejemplo ============ */
const DATA = {
  ssid: "Samu_5G", pass: "laureles-503", guest: false, autopay: false, paid: false, tv: false, pro: false,
  down: 874, up: 866, ping: 3,
  devices: [
    { id: "iphone", name: "iPhone de Samu", type: "Celular", icon: "phone", conn: "Wi‑Fi · 5 GHz", sig: 4, base: 18.2, since: "7:02 a.m.", today: "3,2 GB", ip: "192.168.1.23" },
    { id: "mac", name: "MacBook Air", type: "Portátil", icon: "laptop", conn: "Wi‑Fi · 5 GHz", sig: 4, base: 42.6, since: "8:15 a.m.", today: "11,8 GB", ip: "192.168.1.31" },
    { id: "ps5", name: "PlayStation 5", type: "Consola", icon: "gamepad", conn: "Cable", sig: 4, base: 96.4, since: "Ayer, 9:40 p.m.", today: "24,5 GB", ip: "192.168.1.40" },
    { id: "tv", name: "Smart TV sala", type: "Televisor", icon: "tv", conn: "Wi‑Fi · 5 GHz", sig: 3, base: 24.1, since: "6:30 p.m.", today: "6,1 GB", ip: "192.168.1.52" },
    { id: "new", name: "Galaxy A54", type: "No lo reconocemos", icon: "phone", conn: "Wi‑Fi · 2.4 GHz", sig: 2, base: 3.4, since: "hace 20 min", today: "0,3 GB", ip: "192.168.1.77", isNew: true },
    { id: "ipad", name: "iPad", type: "Tableta", icon: "tablet", conn: "Wi‑Fi · 5 GHz", sig: 3, base: 0.4, since: "10:12 a.m.", today: "0,9 GB", ip: "192.168.1.35" },
    { id: "speaker", name: "Parlante del cuarto", type: "Parlante", icon: "speaker", conn: "Wi‑Fi · 2.4 GHz", sig: 3, base: 0.2, since: "Hace 4 días", today: "0,2 GB", ip: "192.168.1.61" },
    { id: "watch", name: "Reloj", type: "Reloj", icon: "watch", conn: "Wi‑Fi · 2.4 GHz", sig: 2, base: 0.05, since: "7:01 a.m.", today: "40 MB", ip: "192.168.1.24" },
    { id: "bulb", name: "Bombillo del cuarto", type: "Bombillo", icon: "bulb", conn: "Wi‑Fi · 2.4 GHz", sig: 2, base: 0.01, since: "Hace 9 días", today: "2 MB", ip: "192.168.1.63" }
  ],
  history: [],
  notifs: []
};
DATA.devices.forEach((d) => (d.rate = d.base));
/* Factura: la del próximo día 5. Todo se calcula desde la fecha real para que el prototipo no envejezca. */
const FACT = (() => {
  const due = NOW.getDate() <= 5 ? new Date(NOW.getFullYear(), NOW.getMonth(), 5) : new Date(NOW.getFullYear(), NOW.getMonth() + 1, 5);
  const hoy0 = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
  const dias = Math.round((due - hoy0) / 864e5);
  const prox = new Date(due.getFullYear(), due.getMonth() + 1, 1);
  const prev = new Date(due.getFullYear(), due.getMonth() - 1, 1);
  return { due, dias, mes: MESES[due.getMonth()], titulo: cap(MESES[due.getMonth()]) + " " + due.getFullYear(), vence: fechaLarga(due),
    prox: `${prox.getDate()} de ${MESES[prox.getMonth()]}`, prevMes: MESES[prev.getMonth()],
    enDias: dias === 0 ? "Vence hoy" : dias === 1 ? "Vence mañana" : `En ${dias} días` };
})();
const EN30 = (() => { const d = addDays(NOW, 30); return `${d.getDate()} de ${MESES[d.getMonth()]}`; })();
(function buildHistory() {
  const hows = ["Nequi", "PSE", "Nequi", "Nequi", "PSE", "Nequi"];
  let y = FACT.due.getFullYear(), m = FACT.due.getMonth() - 1, k = 0;
  if (m < 0) { m = 11; y--; }
  while (y * 12 + m >= 2026 * 12 + 1 && k < 36) {
    const free = y === 2026 && m === 1, mes = MESES[m];
    DATA.history.push({ m: `${cap(mes)} ${y}`, amt: free ? 0 : 63000, how: free ? "30 días gratis" : hows[k % hows.length], on: free ? "Primer mes" : `${2 + ((k * 3) % 4)} ${mes.slice(0, 3)}.`, free });
    m--; if (m < 0) { m = 11; y--; } k++;
  }
})();
const REAL_NOW = new Date();
const ETA = (() => { const d = addMin(REAL_NOW, 40); d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5); return hora(d); })();
DATA.notifs = [
  { id: "dev", tone: "warning", icon: "devices", title: "Se conectó un dispositivo nuevo", text: "Galaxy A54 entró a tu red hace 20 minutos. ¿Lo reconoces?", when: "Hoy", time: hora(addMin(REAL_NOW, -20)), unread: true, action: { label: "Revisar", act: "dev-review" } },
  { id: "orb", icon: "orb", title: "Tu Orb se actualizó anoche", text: "Mejoramos la estabilidad del Wi‑Fi. No tienes que hacer nada.", when: "Hoy", time: "3:00 a.m.", unread: true },
  { id: "cov", icon: "pin", title: "Llegamos a Envigado", text: "Si tienes amigos por allá, ya se pueden pasar a Somos. Tu código es SAMU-503.", when: "Esta semana", time: "jue.", unread: true },
  { id: "tvn", icon: "gift", title: "Desbloqueaste un mes de Somos TV", text: "Es por tus 6 meses con nosotros. Actívalo cuando quieras.", when: "Esta semana", time: "mar.", action: { label: "Ver beneficio", act: "nav-beneficios" } },
  { id: "pay-prev", tone: "success", icon: "check", title: `Recibimos tu pago de ${FACT.prevMes}`, text: "$63.000 con Nequi. Quedaste al día.", when: "Este mes", time: `3 ${FACT.prevMes.slice(0, 3)}.` }
];
const dev = (id) => DATA.devices.find((d) => d.id === id);

/* ============ Navegación ============ */
let curTab = 0;
function moveInd(i, instant) {
  const tab = $$(".tab")[i], ind = $("#tabInd");
  const w = 60, x = tab.offsetLeft + (tab.offsetWidth - w) / 2;
  const prev = ind._x == null ? x : ind._x;
  ind.style.left = "0px";
  ind.style.transform = `translateX(${x}px)`;
  if (!instant && !REDUCED && prev !== x) {
    const dist = Math.abs(x - prev), dir = x > prev ? 1 : -1;
    const mid = dir > 0 ? prev + dist * 0.22 : prev - dist * 0.82;
    ind.animate([
      { transform: `translateX(${prev}px)`, width: w + "px" },
      { transform: `translateX(${mid}px)`, width: w + dist * 0.6 + "px", offset: 0.42 },
      { transform: `translateX(${x}px)`, width: w + "px" }
    ], { duration: 480, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)" });
  }
  ind._x = x;
}
function goTab(i, instant) {
  if (i === curTab) return;
  const dir = i > curTab ? 1 : -1;
  const from = $("#scr-" + curTab), to = $("#scr-" + i);
  from.style.setProperty("--from", -dir * 14 + "px");
  from.classList.remove("is-active");
  to.style.transition = "none";
  to.style.setProperty("--from", dir * 18 + "px");
  to.getBoundingClientRect();
  to.style.transition = "";
  to.classList.add("is-active");
  $$(".tab").forEach((t, k) => t.setAttribute("aria-selected", String(k === i)));
  curTab = i;
  moveInd(i, instant);
  elevate();
}
function elevate() { $("#appbar").classList.toggle("is-elevated", $("#scr-" + curTab).scrollTop > 6); }
function scrollScreen(i, top) { $("#scr-" + i).scrollTo({ top, behavior: REDUCED ? "auto" : "smooth" }); }
function scrollToEl(i, sel) { const el = $(sel); setTimeout(() => scrollScreen(i, Math.max(0, el.offsetTop - 104)), 60); }

function go(t) {
  if (!SPL.done && t !== "splash") { SPL.skip && SPL.skip(); setTimeout(() => go(t), 1050); return; }
  if (t !== "unstable") { closeSheet(); closePage(true); }
  if (t === "welcome") {
    closeMove(); DATA.client = null; DATA.userName = "Samu"; DATA.install = null; applyClientState();
    showWelcome(false); return;
  }
  if (t === "mudanza") { showWelcome(true); openMove(true); return; }
  if (t === "install") { simulateInstall(); return; }
  if (t === "tech") { startTechDay(); return; }
  if (t === "offline") { toggleOffline(); return; }
  if (t === "payfail") { togglePayFail(); return; }
  if (t === "firstday") { openFirstDay(); return; }
  if (t === "prefs") { openPrefs(); return; }
  if (t !== "splash") {
    if (!DATA.client) { DATA.client = "active"; applyClientState(); }
    hideWelcome(); closeMove();
  }
  switch (t) {
    case "inicio": goTab(0); scrollScreen(0, 0); break;
    case "red": goTab(1); scrollScreen(1, 0); break;
    case "speed": goTab(1); scrollScreen(1, 0); setTimeout(runSpeedTest, 420); break;
    case "devices": goTab(1); scrollToEl(1, "#devicesSec"); break;
    case "wifi": goTab(1); scrollToEl(1, "#wifiSec"); break;
    case "wifi-pass": goTab(1); scrollToEl(1, "#wifiSec"); setTimeout(openPasswordSheet, 380); break;
    case "pagos": goTab(2); scrollScreen(2, 0); break;
    case "pay": goTab(2); scrollScreen(2, 0); setTimeout(() => (DATA.paid ? openReceipt(-1) : openPaySheet()), 320); break;
    case "beneficios": goTab(3); scrollScreen(3, 0); break;
    case "move": goTab(3); scrollToEl(3, "#moveSec"); break;
    case "pro": goTab(3); scrollToEl(3, "#proCard"); break;
    case "ayuda": goTab(4); scrollScreen(4, 0); break;
    case "chat": openChat(); break;
    case "notifs": openNotifs(); break;
    case "splash": closeSheet(); closePage(true); runSplash(); break;
    case "unstable":
      closeSheet(); closePage(true);
      if (curTab !== 0) goTab(0);
      scrollScreen(0, 0);
      setTimeout(() => setUnstable(!STATE.unstable), 280);
      break;
  }
}

/* ============ Inicio ============ */
function countTo(el, to, dur = 700) {
  const from = parseInt(el.textContent.replace(/\D/g, ""), 10) || 0;
  const id = (el._count = (el._count || 0) + 1);
  if (REDUCED || from === to) { el.textContent = to; return; }
  const t0 = performance.now();
  (function f(now) {
    if (el._count !== id) return;
    const k = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
    el.textContent = Math.round(lerp(from, to, e));
    if (k < 1) requestAnimationFrame(f);
  })(t0);
}
function heroTarget() { if (DATA.client === "new") return installDays(); return STATE.unstable ? 196 + Math.round(Math.random() * 40) : DATA.down - 4 + Math.round(Math.random() * 8); }
function renderHero(animate = true) {
  const pill = $("#heroPill"), sub = $("#heroSub"), hero = $("#hero");
  hero.classList.toggle("is-off", DATA.client === "new");
  if (DATA.client === "new" && DATA.install && TECH.on) { heroTech(); return; }
  if (DATA.client === "new" && DATA.install) {
    const d = isoDate(DATA.install.day), n = installDays();
    pill.className = "pill pill--neutral"; pill.innerHTML = "Por instalar";
    $("#heroLabel").textContent = "Tu instalación";
    $("#heroUnit").textContent = n === 1 ? "día para tu instalación" : "días para tu instalación";
    sub.innerHTML = `<span>${cap(fechaLarga(d))}</span><span>${slotDe(DATA.install.slot).chip}</span>`;
    $("#heroLink").innerHTML = "Ver detalle " + ic("arrowRight");
    hero.setAttribute("aria-label", "Ver el detalle de tu instalación");
    hero.classList.remove("is-unstable");
    if (animate) countTo($("#heroNum"), n, 800); else $("#heroNum").textContent = n;
    return;
  }
  $("#heroUnit").textContent = "MBPS de bajada";
  $("#heroLabel").textContent = "Tu red en vivo";
  $("#heroLink").innerHTML = "Ver tu red " + ic("arrowRight");
  hero.setAttribute("aria-label", "Ver el detalle de tu red");
  if (STATE.unstable) {
    pill.className = "pill pill--warning"; pill.innerHTML = ic("alert") + "Inestable";
    sub.innerHTML = `<span>Intermitencia en tu zona</span><span>Ya estamos trabajando</span>`;
  } else {
    pill.className = "pill"; pill.innerHTML = ic("check") + "Estable";
    sub.innerHTML = `<span>${DATA.up} MBPS de subida</span><span>${DATA.ping} ms de latencia</span>`;
  }
  hero.classList.toggle("is-unstable", STATE.unstable);
  if (animate) countTo($("#heroNum"), heroTarget(), 800);
}
function startHomeCounters() {
  $("#heroNum").textContent = "0";
  countTo($("#heroNum"), heroTarget(), 1300);
}
setInterval(() => { if (SPL.done && curTab === 0 && DATA.client === "active" && !document.hidden) countTo($("#heroNum"), heroTarget(), 600); }, 2800);

function renderHomeBill() {
  const el = $("#homeBill");
  el.innerHTML = DATA.paid
    ? `<span class="card__top"><span class="label label--caps">Factura de ${FACT.mes}</span><span class="pill">${ic("check")}Pagada</span></span>
       <p class="body-s">Estás al día. Tu próxima factura llega el ${FACT.prox}.</p>`
    : `<span class="card__top"><span class="label label--caps">Próximo pago</span><span class="pill pill--warning">${ic("clock")}${FACT.enDias}</span></span>
       <div class="bill-row"><div><p class="price num">$63.000</p><p class="label muted">Vence el ${FACT.vence}</p></div>
       <button class="btn btn--primary" type="button" data-nav="pay">Pagar</button></div>`;
}
function renderMonths(el) {
  const n = Math.min(12, MESES_CLIENTE);
  el.innerHTML = Array.from({ length: 12 }, (_, i) => `<span class="month ${i < n - 1 ? "is-on" : ""} ${i === n - 1 ? "is-now" : ""} ${i === 11 && n < 12 ? "is-goal" : ""}"></span>`).join("");
}
function renderLoyaltyText() {
  const n = MESES_CLIENTE, falta = 12 - n;
  $("#homeLoyaltyTitle").textContent = falta > 0 ? `Te faltan ${falta} ${falta === 1 ? "mes" : "meses"} para tu mes de Pro gratis` : "Ya ganaste tu mes de Pro gratis";
  $("#homeLoyaltyMeta").textContent = `${n} ${n === 1 ? "mes" : "meses"} con Somos`;
  $("#loyaltyTitle").textContent = `Llevas ${n} ${n === 1 ? "mes" : "meses"} con nosotros`;
  $("#months").setAttribute("aria-label", `${Math.min(12, n)} de 12 meses cumplidos`);
}
function renderHomeAlert() {
  $("#homeAlert").innerHTML = STATE.unstable
    ? `<div class="state state--warning step-in">${ic("alert")}<div class="state__body"><p class="state__title">Intermitencia en Laureles</p><p class="state__text">Ya estamos trabajando. Estimamos normalidad a las ${ETA} y te avisamos cuando quede.</p><button class="link-btn" type="button" data-action="alert-detail">Ver detalle${ic("arrowRight", "i--16")}</button></div></div>`
    : "";
}
function renderCounts() {
  const n = DATA.devices.length;
  $("#homeDevCount").textContent = n;
  $("#devMeta").textContent = `${n} conectados`;
}

/* ============ Red: velocidad ============ */
const G = { cx: 130, cy: 130, r: 112 };
G.len = G.r * Math.PI * 1.5;
const gp = (deg, r = G.r) => { const a = (deg * Math.PI) / 180; return `${(G.cx + r * Math.cos(a)).toFixed(2)} ${(G.cy + r * Math.sin(a)).toFixed(2)}`; };
function buildGauge() {
  const d = `M ${gp(135)} A ${G.r} ${G.r} 0 1 1 ${gp(405)}`;
  $("#gTrack").setAttribute("d", d);
  const v = $("#gVal"); v.setAttribute("d", d); v.style.strokeDasharray = G.len;
  let dots = "";
  for (let i = 0; i <= 30; i++) { const deg = 135 + (270 * i) / 30; const [x, y] = gp(deg, 94).split(" "); dots += `<circle class="gauge__dot" data-f="${i / 30}" cx="${x}" cy="${y}" r="1.6"/>`; }
  $("#gDots").innerHTML = dots;
}
function setGauge(val) {
  const f = clamp(val / 1000, 0, 1), v = $("#gVal");
  v.style.strokeDashoffset = G.len * (1 - f);
  v.style.opacity = f < 0.004 ? 0 : 1;
  $$(".gauge__dot").forEach((c) => c.classList.toggle("is-lit", +c.dataset.f <= f + 0.001 && f > 0.004));
}
let testing = false;
function runSpeedTest() {
  if (testing || phoneTesting) return;
  testing = true;
  const btn = $("#runTest"); btn.disabled = true; btn.textContent = "Midiendo…";
  $("#speedMsg").innerHTML = "";
  ["rDown", "rUp", "rPing"].forEach((id) => ($("#" + id).textContent = "—"));
  $$(".phase").forEach((p) => p.classList.remove("is-on", "is-done"));
  const u = STATE.unstable;
  const T = { ping: u ? 38 : 3, down: Math.round(u ? 188 + Math.random() * 40 : 869 + Math.random() * 10), up: Math.round(u ? 170 + Math.random() * 36 : 859 + Math.random() * 10) };
  const num = $("#gNum"), unit = $("#gUnit"), cap = $("#gCap");
  cap.textContent = "Midiendo desde tu Orb";
  $("#runPhone").disabled = true;
  const t0 = performance.now(), D = REDUCED ? 0.25 : 1;
  let phase = "";
  const setPhase = (p) => { if (phase === p) return; $$(".phase").forEach((el) => { if (el.dataset.ph === phase) { el.classList.remove("is-on"); el.classList.add("is-done"); } if (el.dataset.ph === p) el.classList.add("is-on"); }); phase = p; };
  (function f(now) {
    const t = (now - t0) / D;
    if (t < 1000) {
      setPhase("ping"); unit.textContent = "ms de latencia"; setGauge(0);
      num.textContent = Math.max(T.ping, Math.round(lerp(42, T.ping, smooth(0, 900, t)) + (t < 850 ? Math.random() * 3 : 0)));
    } else if (t < 4300) {
      if (phase === "ping") $("#rPing").textContent = T.ping;
      setPhase("down"); unit.textContent = "MBPS de bajada";
      const k = (t - 1000) / 3300, v = T.down * (1 - Math.exp(-k * 4.2)) + Math.sin(t / 70) * T.down * 0.025 * (1 - k);
      num.textContent = Math.round(v); setGauge(v);
    } else if (t < 7200) {
      if (phase === "down") $("#rDown").textContent = T.down;
      setPhase("up"); unit.textContent = "MBPS de subida";
      const k = (t - 4300) / 2900, v = T.up * (1 - Math.exp(-k * 4.2)) + Math.sin(t / 60) * T.up * 0.025 * (1 - k);
      num.textContent = Math.round(v); setGauge(v);
    } else {
      $("#rUp").textContent = T.up; setPhase("");
      num.textContent = T.down; unit.textContent = "MBPS de bajada"; setGauge(T.down);
      cap.textContent = "Hoy · " + hora(new Date());
      if (!u) { DATA.down = T.down; DATA.up = T.up; DATA.ping = T.ping; renderHero(); }
      $("#speedMsg").innerHTML = u
        ? `<div class="state state--warning step-in">${ic("alert")}<div class="state__body"><p class="state__title">Tu velocidad está más baja</p><p class="state__text">Es por la intermitencia en tu zona. Ya estamos trabajando y te avisamos cuando quede.</p></div></div>`
        : `<div class="state step-in">${ic("check")}<div class="state__body"><p class="state__title">Recibes lo que contrataste</p><p class="state__text">Tu plan Essential es de hasta 900 MBPS por cable, y la subida es casi igual a la bajada. ${enLaVida(T.down)}</p></div></div>`;
      btn.disabled = false; btn.textContent = "Medir de nuevo"; testing = false; $("#runPhone").disabled = false;
      return;
    }
    requestAnimationFrame(f);
  })(t0);
}

/* ============ Red: dispositivos ============ */
let devFilter = "all";
const fmtRate = (d) => (d.paused ? "Pausado" : d.rate < 0.1 ? "En reposo" : d.rate.toFixed(1).replace(".", ",") + " MBPS");
const bars = (n) => `<span class="bars" aria-hidden="true">${[4, 7, 10, 12].map((h, i) => `<i class="${i < n ? "" : "off"}" style="height:${h}px"></i>`).join("")}</span>`;
const SIG = ["", "Débil", "Regular", "Buena", "Excelente"];
function renderDevices() {
  const list = DATA.devices.filter((d) => devFilter === "all" || (devFilter === "paused" ? d.paused : !d.paused && d.rate >= 0.1));
  $("#devList").innerHTML = list.length
    ? list.map((d) => `<button class="list-item ${d.paused ? "is-paused" : ""}" type="button" data-action="dev" data-id="${d.id}">
        <span class="list-item__icon">${ic(d.icon)}</span>
        <span class="list-item__main"><span class="list-item__title">${d.name}</span><span class="label muted">${d.paused ? "Sin internet por ahora" : d.conn}</span></span>
        <span class="list-item__side">${d.isNew ? `<span class="pill pill--warning">${ic("alert")}Nuevo</span>` : `<span class="rate num" data-rate="${d.id}">${fmtRate(d)}</span>${bars(d.sig)}`}</span>
      </button>`).join("")
    : `<p class="body-s muted" style="padding:16px 0">No tienes dispositivos pausados.</p>`;
  renderCounts();
}
setInterval(() => {
  if (document.hidden) return;
  DATA.devices.forEach((d) => {
    if (d.paused) return;
    const base = d.base * (STATE.unstable ? 0.3 : 1);
    d.rate = Math.max(0, lerp(d.rate, base, 0.35) + (Math.random() - 0.5) * base * 0.35);
    const el = document.querySelector(`[data-rate="${d.id}"]`); if (el) el.textContent = fmtRate(d);
    const live = document.querySelector(`[data-live="${d.id}"]`); if (live) live.textContent = fmtRate(d);
  });
}, 1400);

function openDevice(id) {
  const d = dev(id); if (!d) return;
  const html = sheetHead(d.name, d.type) +
    (d.isNew ? `<div class="state state--warning">${ic("alert")}<div class="state__body"><p class="state__title">No reconocemos este dispositivo</p><p class="state__text">Entró a tu red hace 20 minutos. Si no es tuyo, bloquéalo y cambia tu clave.</p></div></div>
      <div class="btn-row"><button class="btn btn--secondary" type="button" data-action="dev-mine" data-id="${d.id}">Es mío</button><button class="btn btn--primary" type="button" data-action="dev-block" data-id="${d.id}">Bloquear</button></div>` : "") +
    `<div class="card__row"><span class="list-item__icon" style="width:56px;height:56px">${ic(d.icon, "i--28")}</span>
      <div class="list-item__main"><span class="h3 num" data-live="${d.id}">${fmtRate(d)}</span><span class="label muted">Uso en este momento</span></div></div>
    <dl class="rows">
      <div><dt>Conexión</dt><dd>${d.conn}</dd></div>
      <div><dt>Señal</dt><dd>${SIG[d.sig]}</dd></div>
      <div><dt>Conectado desde</dt><dd>${d.since}</dd></div>
      <div><dt>Uso hoy</dt><dd>${d.today}</dd></div>
      <div><dt>Dirección</dt><dd>${d.ip}</dd></div>
    </dl>
    <div class="setting"><div class="setting__text"><span class="body">Pausar internet</span><span class="label muted">Útil a la hora de dormir o de estudiar.</span></div>
      <button class="switch" type="button" role="switch" aria-checked="${!!d.paused}" data-action="dev-pause" data-id="${d.id}" aria-label="Pausar internet de ${d.name}"></button></div>` +
    (d.isNew ? "" : `<button class="btn btn--secondary btn--block" type="button" data-action="dev-block" data-id="${d.id}">${ic("block")}Bloquear dispositivo</button>`);
  openSheet(html);
}
function confirmBlock(id) {
  const d = dev(id);
  swapSheet(sheetHead(`¿Bloquear ${d.name}?`, d.type) +
    `<div class="state state--danger">${ic("block")}<div class="state__body"><p class="state__title">No podrá volver a entrar</p><p class="state__text">Lo sacamos de tu red ahora mismo. Si fue un error, lo desbloqueas desde esta pantalla.</p></div></div>
    <div class="btn-row"><button class="btn btn--secondary" type="button" data-action="dev" data-id="${id}">Cancelar</button><button class="btn btn--primary" type="button" data-action="dev-block-yes" data-id="${id}">Sí, bloquear</button></div>`);
}

/* ============ Red: Wi‑Fi ============ */
const wifiString = () => { const e = (s) => s.replace(/([\\;,:"])/g, "\\$1"); return `WIFI:T:WPA;S:${e(DATA.ssid)};P:${e(DATA.pass)};;`; };
function strength(p) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[a-záéíóúñ]/i.test(p) && /\d/.test(p)) s++;
  if (/[^a-z0-9áéíóúñ]/i.test(p)) s++;
  if (p.length >= 12) s++;
  return s;
}
function openPasswordSheet() {
  const html = sheetHead("Cambiar clave del Wi‑Fi", "Red principal") +
    `<div class="field"><label for="pwSsid">Nombre de la red</label><div class="input-wrap"><input class="input" id="pwSsid" name="pwSsid" value="${DATA.ssid}" maxlength="32" style="padding-right:18px"></div></div>
     <div class="field"><label for="pwNew">Nueva clave</label><div class="input-wrap"><input class="input" id="pwNew" name="pwNew" type="password" autocomplete="new-password" autofocus><button class="icon-btn" type="button" data-action="pw-eye" aria-label="Mostrar clave">${ic("eye")}</button></div></div>
     <div class="meter" id="pwMeter" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
     <div class="setting" style="align-items:flex-start">
       <div class="rules" id="pwRules">
         <span class="rule label" data-r="len">${ic("check")}8 caracteres o más</span>
         <span class="rule label" data-r="mix">${ic("check")}Letras y números</span>
         <span class="rule label" data-r="sym">${ic("check")}Un símbolo, como - o #</span>
       </div>
       <span id="pwWord"></span>
     </div>
     <div class="state state--warning">${ic("info")}<div class="state__body"><p class="state__title">Tus dispositivos se desconectan</p><p class="state__text">Al guardar, tus ${DATA.devices.length} dispositivos salen un momento de la red. Conéctalos con la clave nueva.</p></div></div>
     <button class="btn btn--primary btn--block btn--lg" type="button" id="pwSave" data-action="pw-save" disabled>Guardar clave</button>`;
  openSheet(html, (root) => {
    const inp = $("#pwNew", root);
    inp.addEventListener("input", () => {
      const p = inp.value, s = strength(p);
      $$("#pwMeter i", root).forEach((b, i) => b.classList.toggle("on", i < s));
      $('[data-r="len"]', root).classList.toggle("ok", p.length >= 8);
      $('[data-r="mix"]', root).classList.toggle("ok", /[a-z]/i.test(p) && /\d/.test(p));
      $('[data-r="sym"]', root).classList.toggle("ok", /[^a-z0-9]/i.test(p));
      const w = $("#pwWord", root);
      w.innerHTML = !p ? "" : s <= 1 ? `<span class="pill pill--danger">${ic("close")}Débil</span>` : s === 2 ? `<span class="pill pill--warning">${ic("alert")}Media</span>` : `<span class="pill">${ic("check")}Fuerte</span>`;
      $("#pwSave", root).disabled = !(p.length >= 8 && /[a-z]/i.test(p) && /\d/.test(p));
    });
  });
}
function savePassword() {
  const ssid = ($("#pwSsid").value || DATA.ssid).trim().slice(0, 32) || DATA.ssid, pass = $("#pwNew").value;
  swapSheet(`<div class="center-col"><svg class="spinner" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="24"/></svg><p class="h3">Aplicando en tu Orb…</p><p class="label muted">Toma unos segundos.</p></div>`);
  setTimeout(() => {
    DATA.ssid = ssid; DATA.pass = pass;
    ["#ssidLabel", "#homeSsid"].forEach((s) => ($(s).textContent = ssid));
    maskPass();
    swapSheet(`<div class="center-col"><span class="done-badge"><svg class="i check-draw" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg></span>
      <h2 class="h3" id="sheetTitle">Listo, cambiamos tu clave</h2><p class="label muted">Tu red ahora es ${ssid}. Conecta otra vez tus dispositivos.</p></div>
      <div class="btn-row"><button class="btn btn--secondary" type="button" data-action="close-sheet">Cerrar</button><button class="btn btn--primary" type="button" data-action="open-qr">${ic("qr")}Compartir</button></div>`);
  }, REDUCED ? 300 : 1800);
}
let passShown = false;
function maskPass() { $("#passTxt").textContent = passShown ? DATA.pass : "•".repeat(Math.max(8, DATA.pass.length)); }
function openQR() {
  const html = sheetHead("Comparte tu Wi‑Fi", "Escanea con la cámara para conectarte") +
    `<div class="qr-card">${QR.svg(wifiString())}<span class="label" style="font-weight:700">${DATA.ssid}</span></div>
     <dl class="rows"><div><dt>Red</dt><dd>${DATA.ssid}</dd></div><div><dt>Clave</dt><dd class="num">${DATA.pass}</dd></div></dl>
     <button class="btn btn--secondary btn--block" type="button" data-action="copy" data-copy="${DATA.pass}" data-ok="Clave copiada">${ic("copy")}Copiar clave</button>
     <p class="label muted">Para visitas es mejor la red de invitados: se apaga sola en 24 horas.</p>`;
  if (sheet.classList.contains("is-open")) swapSheet(html); else openSheet(html);
}

/* ============ Red: Orb ============ */
function restartOrb(reset) {
  const txt = $("#orbState"), btnTxt = $("#holdTxt");
  btnTxt.textContent = "Reiniciando…";
  txt.textContent = "Se apaga y vuelve en unos segundos";
  const t0 = performance.now();
  const fn = (now) => { const t = now - t0; if (t < 420) return lerp(1, 0.02, t / 420); if (t < 1900) return 0.02; return lampOn(t - 1900) * 0.95; };
  [orbLamp, heroLamp].forEach((L) => { L.mode = "fn"; L.fn = fn; });
  setTimeout(() => {
    [orbLamp, heroLamp].forEach((L) => (L.mode = "auto"));
    txt.textContent = "Encendido hace un momento · al día";
    btnTxt.textContent = "Mantén para reiniciar";
    toast("Tu Orb volvió. Todo en orden.");
    reset();
  }, REDUCED ? 600 : 3000);
}

/* ============ Pagos ============ */
let payMethod = "nequi";
const METHODS = [
  { id: "nequi", name: "Nequi", sub: "Te llega una notificación para aprobar", icon: "phone" },
  { id: "pse", name: "PSE", sub: "Débito desde tu banco", icon: "bank" },
  { id: "card", name: "Tarjeta", sub: "Crédito o débito", icon: "card" },
  { id: "davi", name: "Daviplata", sub: "Desde tu celular", icon: "wallet" }
];
function renderInvoice() {
  const m = METHODS.find((x) => x.id === payMethod);
  $("#invoice").innerHTML = DATA.paid
    ? `<div class="card__top"><span class="label label--caps">${FACT.titulo}</span><span class="pill">${ic("check")}Pagada</span></div>
       <p class="invoice__amount num">$63.000</p><p class="label muted">Pagaste hoy con ${m.name}. Gracias.</p>
       <dl class="rows"><div><dt>Plan Essential · 900 MBPS</dt><dd>$63.000</dd></div><div><dt>Próxima factura</dt><dd>${FACT.prox}</dd></div></dl>
       <button class="btn btn--secondary btn--block" type="button" data-action="receipt" data-i="-1">${ic("receipt")}Ver comprobante</button>`
    : `<div class="card__top"><span class="label label--caps">${FACT.titulo}</span><span class="pill pill--warning">${ic("clock")}Pendiente</span></div>
       <p class="invoice__amount num">$63.000</p><p class="label muted">IVA incluido · vence el ${FACT.vence}</p>
       <dl class="rows"><div><dt>Plan Essential · 900 MBPS</dt><dd>$63.000</dd></div><div><dt>Cargos adicionales</dt><dd>$0</dd></div><div><dt>Permanencia</dt><dd>Sin cláusulas</dd></div></dl>
       <button class="btn btn--primary btn--block btn--lg" type="button" data-nav="pay">Pagar $63.000</button>`;
}
function renderHistory() {
  const rows = (DATA.paid ? [{ m: FACT.titulo, amt: 63000, how: METHODS.find((x) => x.id === payMethod).name, on: "hoy", i: -1 }] : []).concat(DATA.history.map((h, i) => ({ ...h, i })));
  $("#history").innerHTML = rows.map((h) => `<button class="list-item" type="button" data-action="receipt" data-i="${h.i}">
      <span class="list-item__icon">${ic(h.free ? "gift" : "receipt")}</span>
      <span class="list-item__main"><span class="list-item__title">${h.m}</span><span class="label muted">${h.free ? "Prueba gratis" : "Pagada " + h.on + " · " + h.how}</span></span>
      <span class="list-item__side"><span class="rate num">${money(h.amt)}</span></span></button>`).join("");
}
function openReceipt(i) {
  const h = i === -1 ? { m: FACT.titulo, amt: 63000, how: METHODS.find((x) => x.id === payMethod).name, on: "hoy" } : DATA.history[i];
  openSheet(sheetHead("Comprobante", h.m) +
    `<dl class="rows"><div><dt>Valor</dt><dd>${money(h.amt)}</dd></div><div><dt>Método</dt><dd>${h.how}</dd></div><div><dt>Fecha</dt><dd>${h.on}</dd></div><div><dt>Plan</dt><dd>Essential · 900 MBPS</dd></div><div><dt>Referencia</dt><dd class="num">SMS-${(26 * 1000 + (i + 3) * 137).toString().padStart(6, "0")}</dd></div></dl>
     <p class="label muted">Te enviamos una copia a tu correo.</p>
     <button class="btn btn--primary btn--block" type="button" data-action="close-sheet">Listo</button>`);
}
function payStepHTML() {
  return sheetHead(`Pagar factura de ${FACT.mes}`, "Plan Essential · IVA incluido") +
    `<p class="invoice__amount num">$63.000</p>
     <div class="field"><span class="label">Paga con</span>
       <div role="radiogroup" aria-label="Método de pago" style="display:flex;flex-direction:column;gap:8px">
       ${METHODS.map((m) => `<button class="method" type="button" role="radio" aria-checked="${m.id === payMethod}" data-action="method" data-id="${m.id}"><span class="list-item__icon" style="width:40px;height:40px">${ic(m.icon, "i--20")}</span><span class="list-item__main"><span class="body">${m.name}</span><span class="label muted">${m.sub}</span></span><span class="method__radio"></span></button>`).join("")}
       </div></div>
     <div class="slider" id="slider"><span class="slider__fill"></span><span class="slider__label">Desliza para pagar</span>
       <button class="slider__knob" type="button" aria-label="Desliza para pagar $63.000. Con teclado, presiona Enter.">${ic("arrowRight")}</button></div>
     <p class="label muted">Pago simulado: este prototipo no cobra ni pide datos reales.</p>`;
}
function openPaySheet() { openSheet(payStepHTML(), mountSlider); }
function mountSlider(root) {
  const s = $("#slider", root); if (!s) return;
  const knob = $(".slider__knob", s), fill = $(".slider__fill", s), label = $(".slider__label", s);
  let x0 = null, x = 0, max = 0, moved = false, fired = false;
  const setX = (v) => { x = v; knob.style.transform = `translateX(${v}px)`; fill.style.width = v + 60 + "px"; label.style.opacity = String(clamp(1 - v / (max * 0.55), 0, 1)); };
  const done = () => { if (fired) return; fired = true; s.classList.add("is-back"); setX(max); setTimeout(processPayment, 380); };
  knob.addEventListener("pointerdown", (e) => { max = s.clientWidth - 62; x0 = e.clientX; moved = false; s.classList.remove("is-back"); knob.setPointerCapture(e.pointerId); });
  knob.addEventListener("pointermove", (e) => { if (x0 === null) return; const dx = (e.clientX - x0) / appScale(); if (Math.abs(dx) > 3) moved = true; setX(clamp(dx, 0, max)); });
  const up = () => {
    if (x0 === null) return; x0 = null;
    if (x > max * 0.82) done();
    else { s.classList.add("is-back"); setX(0); if (!moved && !REDUCED) knob.animate([{ transform: "translateX(0)" }, { transform: "translateX(28px)" }, { transform: "translateX(0)" }], { duration: 560, easing: "cubic-bezier(0.34, 1.45, 0.64, 1)" }); }
  };
  knob.addEventListener("pointerup", up); knob.addEventListener("pointercancel", up);
  knob.addEventListener("click", (e) => { if (e.detail === 0) { max = s.clientWidth - 62; done(); } });
}
function processPayment() {
  const m = METHODS.find((x) => x.id === payMethod);
  swapSheet(`<div class="center-col"><svg class="spinner" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="24"/></svg><p class="h3">Procesando tu pago con ${m.name}…</p><p class="label muted">No cierres la app.</p></div>`);
  setTimeout(() => {
    if (STATE.payFail) { STATE.payFail = false; refreshDemoLabels(); payFailed(m); return; }
    DATA.paid = true;
    renderInvoice(); renderHistory(); renderHomeBill();
    DATA.notifs.unshift({ id: "pay-oct", tone: "success", icon: "check", title: `Recibimos tu pago de ${FACT.mes}`, text: `$63.000 con ${m.name}. Quedaste al día.`, when: "Hoy", time: hora(new Date()), unread: false });
    renderNotifs();
    swapSheet(`<div class="center-col"><span class="done-badge"><svg class="i check-draw" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg></span>
      <h2 class="h3" id="sheetTitle">Pago recibido</h2><p class="label muted">Quedaste al día. Te enviamos el comprobante a tu correo.</p></div>
      <dl class="rows"><div><dt>Valor</dt><dd>$63.000</dd></div><div><dt>Método</dt><dd>${m.name}</dd></div><div><dt>Fecha</dt><dd>${fechaCorta(NOW)} · ${hora(new Date())}</dd></div></dl>
      <button class="btn btn--primary btn--block btn--lg" type="button" data-action="close-sheet">Listo</button>`);
  }, REDUCED ? 300 : 1700);
}

/* ============ Beneficios ============ */
function coverage(a) { return !/bello|itag|suba|bosa|kennedy|soacha|copacabana|estrella|caldas|girardota/i.test(a); }
function checkMove(addr) {
  const out = $("#moveResult");
  if (!addr.trim()) { $("#moveInput").focus(); toast("Escribe la dirección de tu nuevo lugar", "info"); return; }
  $("#suggest").hidden = true;
  out.innerHTML = `<div class="card__row step-in"><svg class="spinner" viewBox="0 0 56 56" style="width:24px;height:24px" aria-hidden="true"><circle cx="28" cy="28" r="24"/></svg><span class="label">Revisando cobertura…</span></div>`;
  setTimeout(() => {
    out.innerHTML = coverage(addr)
      ? `<div class="state step-in">${ic("check")}<div class="state__body"><p class="state__title">Llegamos a ese edificio</p><p class="state__text">${addr}. Trasladamos tu servicio sin costo: elige el día de la mudanza y reinstalamos tu Orb.</p></div></div>
         <button class="btn btn--primary btn--block step-in" type="button" data-action="open-visit" data-motive="Traslado">Agenda una cita</button>`
      : `<div class="state state--warning step-in">${ic("alert")}<div class="state__body"><p class="state__title">Todavía no llegamos a ese edificio</p><p class="state__text">Podemos empezar la gestión si tiene al menos 5 pisos. ¿Me confirmas eso?</p></div></div>
         <div class="btn-row step-in"><button class="btn btn--secondary" type="button" data-action="floors" data-v="yes">Tiene 5 o más</button><button class="btn btn--secondary" type="button" data-action="floors" data-v="no">Tiene menos</button></div>`;
  }, REDUCED ? 200 : 1000);
}

/* ============ Ayuda ============ */
const FAQS = [
  ["¿Qué pasa con mi internet si me mudo?", "Revisamos si ya llegamos a tu nuevo edificio. Si llegamos, agendas el día y reinstalamos tu Orb allá. Si no, te decimos qué tan cerca estamos."],
  ["¿Tengo cláusula de permanencia?", "No. Puedes cancelar cuando quieras, sin multas."],
  ["¿Por qué mi celular marca menos que el Orb?", "El Orb mide la velocidad que llega a tu casa. Por Wi‑Fi influyen la distancia, las paredes y tu celular. Por cable llegas a la velocidad de tu plan."],
  ["¿Cómo le doy el Wi‑Fi a una visita?", "Activa la red de invitados en la pestaña Red o comparte el código QR. Así no tienes que dictar tu clave."]
];
function renderFaqs() {
  $("#faqs").innerHTML = FAQS.map(([q, a], i) => `<div class="faq" data-open="false"><button class="faq__btn" type="button" aria-expanded="false" aria-controls="faq${i}" data-action="faq"><span>${q}</span>${ic("chevD")}</button><div class="faq__body" id="faq${i}"><div><p>${a}</p></div></div></div>`).join("");
}
let diagRunning = false;
function runDiag() {
  if (diagRunning) return; diagRunning = true;
  const steps = ["Tu Orb", "La fibra hasta tu edificio", "La red de tu zona", "Tus dispositivos"];
  const box = $("#diagSteps"), btn = $("#diagBtn");
  box.hidden = false; $("#diagResult").innerHTML = ""; btn.disabled = true; btn.textContent = "Revisando…";
  box.innerHTML = steps.map((s, i) => `<div class="step is-wait" data-s="${i}"><span class="step__mark"></span><span class="step__txt body-s">${s}</span><span class="label muted" data-st></span></div>`).join("");
  let i = 0;
  const next = () => {
    if (i > 0) {
      const prev = $(`[data-s="${i - 1}"]`, box), warn = STATE.unstable && i - 1 === 2;
      prev.className = "step " + (warn ? "is-warn" : "is-ok");
      prev.querySelector(".step__mark").innerHTML = ic(warn ? "alert" : "check");
      prev.querySelector("[data-st]").textContent = warn ? "Intermitencia" : "Bien";
    }
    if (i === steps.length) {
      $("#diagResult").innerHTML = STATE.unstable
        ? `<div class="state state--warning step-in">${ic("alert")}<div class="state__body"><p class="state__title">Hay intermitencia en tu zona</p><p class="state__text">No es tu Orb ni tus dispositivos. Ya estamos trabajando en Laureles y estimamos que a las ${ETA} vuelva la normalidad.</p><button class="link-btn" type="button" data-action="alert-detail">Ver detalle${ic("arrowRight", "i--16")}</button></div></div>`
        : `<div class="state step-in">${ic("check")}<div class="state__body"><p class="state__title">Todo está bien de nuestro lado</p><p class="state__text">Si algo va lento, acerca el dispositivo al Orb o reinícialo. Si sigue igual, escríbenos.</p></div></div>`;
      btn.disabled = false; btn.textContent = "Revisar otra vez"; diagRunning = false;
      return;
    }
    const cur = $(`[data-s="${i}"]`, box); cur.className = "step is-run";
    i++;
    setTimeout(next, REDUCED ? 120 : 650 + Math.random() * 350);
  };
  next();
}
const DAYS = Array.from({ length: 5 }, (_, i) => { const d = addDays(NOW, i + 1); return { key: i, label: `${DIAS[d.getDay()].slice(0, 3)}. ${d.getDate()}`, long: `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}` }; });
const SLOTS = ["8:00 a.m.", "10:00 a.m.", "12:00 m.", "2:00 p.m.", "4:00 p.m."];
const visit = { motive: "Sin internet", day: null, slot: null };
function openVisit(motive) {
  visit.motive = motive || "Sin internet"; visit.day = null; visit.slot = null;
  const motives = ["Sin internet", "Internet lento", "Mover el Orb", "Traslado"];
  openSheet(sheetHead("Agenda una visita", visit.motive === "Traslado" ? "Traslado a tu nuevo lugar" : "Un técnico va a tu casa") +
    `<div class="field"><span class="label">Motivo</span><div class="chips">${motives.map((m) => `<button class="chip" type="button" aria-pressed="${m === visit.motive}" data-action="v-motive" data-v="${m}">${m}</button>`).join("")}</div></div>
     <div class="field"><span class="label">Día</span><div class="chips">${DAYS.map((d) => `<button class="chip" type="button" aria-pressed="false" data-action="v-day" data-v="${d.key}">${d.label}</button>`).join("")}</div></div>
     <div class="field"><span class="label">Hora</span><div class="chips">${SLOTS.map((s, i) => `<button class="chip" type="button" aria-pressed="false" data-action="v-slot" data-v="${s}" ${i === 2 ? "disabled" : ""}>${s}</button>`).join("")}</div></div>
     <button class="btn btn--primary btn--block btn--lg" type="button" id="vOk" data-action="v-ok" disabled>Confirmar visita</button>`);
}
function pickChip(btn, group) { $$(`[data-action="${group}"]`, sheetBody).forEach((b) => b.setAttribute("aria-pressed", String(b === btn))); }

/* ============ Chat ============ */
const CHAT = { started: false, used: new Set() };
const QUICK = ["Mi internet está lento", "Me voy a mudar", "Quiero cambiar de plan", "¿Cuándo vence mi factura?"];
function openChat() {
  openPage("pageChat");
  if (!CHAT.started) { CHAT.started = true; setTimeout(() => agentSay("Hola, Samu. Soy Laura, de Somos. ¿En qué te ayudo hoy?"), 380); }
  renderQuick();
}
function renderQuick() { $("#quick").innerHTML = QUICK.filter((q) => !CHAT.used.has(q)).map((q) => `<button class="chip" type="button" data-action="quick" data-v="${q}">${q}</button>`).join(""); }
function chatScroll() { const s = $("#chatScroll"); s.scrollTo({ top: s.scrollHeight, behavior: REDUCED ? "auto" : "smooth" }); }
function meSay(t) { $("#msgs").insertAdjacentHTML("beforeend", `<div class="msg msg--me"></div>`); $("#msgs").lastElementChild.textContent = t; chatScroll(); }
let chatQ = Promise.resolve();
function agentSay(t) {
  chatQ = chatQ.then(() => new Promise((done) => {
    const msgs = $("#msgs");
    const typing = document.createElement("div");
    typing.className = "msg msg--them typing"; typing.setAttribute("aria-label", "Laura está escribiendo"); typing.innerHTML = "<i></i><i></i><i></i>";
    msgs.appendChild(typing); chatScroll();
    setTimeout(() => {
      const m = document.createElement("div"); m.className = "msg msg--them"; m.textContent = t;
      const meta = document.createElement("span"); meta.className = "label msg-meta"; meta.textContent = "Laura · " + hora(new Date());
      typing.replaceWith(m); m.after(meta); chatScroll(); done();
    }, REDUCED ? 100 : 900 + Math.min(1200, t.length * 8));
  }));
}
function reply(q) {
  const s = q.toLowerCase();
  if (/lent|velocidad|cae|falla|no (me )?funciona|sin internet/.test(s))
    return STATE.unstable ? `Siento que estés teniendo problemas. Hay una intermitencia en Laureles y ya tenemos un equipo allá. Estimamos que a las ${ETA} todo esté normal. Te aviso apenas quede.`
      : "Siento que estés teniendo problemas. Ya revisé tu Orb y la fibra hasta tu edificio, y todo está en orden. ¿Me dices en qué dispositivo lo notas? Lo revisamos juntos.";
  if (/mud|trasl|nuevo (apto|apartamento|lugar)|cambio de casa/.test(s)) return "¡Qué buena noticia! Pásame la dirección de tu nuevo lugar y reviso si ya llegamos a ese edificio. Si llegamos, el traslado no tiene costo.";
  if (/plan|pro\b|cambiar|subir|velocidad m/.test(s)) return "Hoy tienes Essential, hasta 900 MBPS. Si quieres, puedes probar Pro 30 días sin pagar más y decides después. ¿Te lo activo?";
  if (/factura|pago|pagar|vence|cobr/.test(s)) return DATA.paid ? `Tu factura de ${FACT.mes} ya está paga. Gracias. La próxima llega el ${FACT.prox}.` : `Tu factura de ${FACT.mes} es de $63.000 y vence el ${FACT.vence}. La puedes pagar en la pestaña Pagos en menos de un minuto.`;
  if (/gracias|listo|perfecto|genial/.test(s)) return "Con gusto. Aquí estoy si necesitas algo más.";
  if (/^s[ií]\b|dale|activa/.test(s)) return "Listo. Te dejo la prueba de Pro en la pestaña Para ti para que la actives con un toque.";
  return "Gracias por contarme. Déjame revisarlo y te respondo en un momento. Si prefieres, también estamos en WhatsApp.";
}
function send(q) { if (!q.trim()) return; CHAT.used.add(q); meSay(q); renderQuick(); agentSay(reply(q)); }

/* ============ Notificaciones ============ */
function updateBadge() { const n = DATA.notifs.filter((x) => x.unread).length; $("#badge").textContent = n ? String(n) : ""; $("#bellBtn").setAttribute("aria-label", n ? `Notificaciones, ${n} sin leer` : "Notificaciones"); $("#notifMeta").textContent = n ? `${n} sin leer` : "Todo al día"; }
function renderNotifs() {
  const groups = [];
  DATA.notifs.forEach((n) => { let g = groups.find((x) => x.when === n.when); if (!g) groups.push((g = { when: n.when, items: [] })); g.items.push(n); });
  $("#notifList").innerHTML = groups.map((g) => `<div><p class="label label--caps muted group-label">${g.when}</p>${g.items.map((n) => `
    <div class="notif"><span class="notif__icon ${n.tone ? "notif__icon--" + n.tone : ""}">${ic(n.icon)}</span>
      <div class="notif__main"><div class="notif__head"><span class="notif__title">${n.title}</span><span class="label muted" style="flex:none">${n.time}</span></div>
      <p class="body-s muted">${n.text}</p>${n.action ? `<button class="link-btn" type="button" data-action="${n.action.act}" style="align-self:flex-start">${n.action.label}${ic("arrowRight", "i--16")}</button>` : ""}</div>
      ${n.unread ? `<span class="unread" aria-label="Sin leer"></span>` : ""}</div>`).join("")}</div>`).join("");
  updateBadge();
}
function openNotifs() {
  renderNotifs(); openPage("pageNotifs");
  setTimeout(() => { DATA.notifs.forEach((n) => (n.unread = false)); updateBadge(); $$("#notifList .unread").forEach((u) => u.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" })); }, 1400);
}

/* ============ Inestabilidad ============ */
function alertDetail() {
  openSheet(sheetHead("Intermitencia en tu zona", "Laureles, Medellín") +
    `<div class="state state--warning">${ic("alert")}<div class="state__body"><p class="state__title">Estamos trabajando en eso</p><p class="state__text">Una falla en la fibra de la zona está afectando a varios edificios. No es tu Orb.</p></div></div>
     <dl class="rows">
       <div><dt>${hora(addMin(REAL_NOW, -13))}</dt><dd>Detectamos la falla</dd></div>
       <div><dt>${hora(addMin(REAL_NOW, -2))}</dt><dd>El equipo llegó a la zona</dd></div>
       <div><dt>${ETA}</dt><dd>Estimamos que se normalice</dd></div>
     </dl>
     <p class="body-s muted">Si la falla dura más de 4 horas, te descontamos ese día de la factura.</p>
     <div class="setting"><div class="setting__text"><span class="body">Avísame cuando se arregle</span><span class="label muted">Te llega una notificación.</span></div><button class="switch" type="button" role="switch" aria-checked="true" data-action="toggle-switch" aria-label="Avísame cuando se arregle"></button></div>
     <button class="btn btn--secondary btn--block" type="button" data-action="diag-from-alert">${ic("pulse")}Revisar mi conexión</button>`);
}
function setUnstable(on) {
  STATE.unstable = on;
  $$("[data-unstable-label] .ul").forEach((el) => (el.textContent = on ? "Volver a la normalidad" : "Simular inestabilidad"));
  renderHero(); renderHomeAlert();
  $("#redMeta").textContent = on ? "Intermitencia en tu zona" : "En vivo";
  DATA.notifs = DATA.notifs.filter((n) => n.id !== "zone" && n.id !== "zone-ok");
  if (on) {
    DATA.notifs.unshift({ id: "zone", tone: "warning", icon: "alert", title: "Intermitencia en tu zona", text: `Ya estamos trabajando en Laureles. Estimamos que a las ${ETA} vuelva la normalidad.`, when: "Hoy", time: "ahora", unread: true, action: { label: "Ver detalle", act: "alert-detail" } });
    notify("fallas", { title: "Intermitencia en tu zona", text: `Ya estamos trabajando en Laureles. Estimamos que a las ${ETA} vuelva la normalidad.`, tone: "warning", icon: "alert", onTap: alertDetail });
  } else {
    DATA.notifs.unshift({ id: "zone-ok", tone: "success", icon: "check", title: "Tu red volvió a la normalidad", text: "Gracias por la paciencia. Todo está en orden.", when: "Hoy", time: "ahora", unread: true });
    notify("fallas", { title: "Tu red volvió a la normalidad", text: "Gracias por la paciencia. Todo está en orden.", tone: "success", icon: "check" });
  }
  renderNotifs();
}

/* ============ Cuenta ============ */
function openAccount() {
  const sub = DATA.client === "new" && DATA.install ? `${DATA.userName} · instalación el ${fechaLarga(isoDate(DATA.install.day))}` : `${DATA.userName} · cliente desde febrero de 2026`;
  openSheet(sheetHead("Tu cuenta", sub) +
    `<dl class="rows">
      <div><dt>Plan</dt><dd>Essential · 900 MBPS</dd></div>
      <div><dt>Dirección</dt><dd>Laureles, Medellín</dd></div>
      <div><dt>Estrato</dt><dd>3</dd></div>
      <div><dt>Permanencia</dt><dd>Sin cláusulas</dd></div>
    </dl>
    <button class="channel" type="button" data-nav="prefs"><span class="list-item__icon">${ic("sliders")}</span><span class="channel__main"><span class="body">Qué avisos recibir</span><span class="label muted">Fallas, factura, instalación y horario de silencio</span></span>${ic("chevR")}</button>
    <div class="card demo" style="padding:20px">
      <span class="label label--caps">Modo demostración</span>
      <div class="btn-row"><button class="btn btn--secondary" type="button" data-nav="unstable" data-unstable-label><span class="ul">${STATE.unstable ? "Volver a la normalidad" : "Simular inestabilidad"}</span></button><button class="btn btn--secondary" type="button" data-nav="splash">Ver apertura</button><button class="btn btn--secondary" type="button" data-nav="welcome">Nuevo usuario</button>${DATA.client === "new" ? `<button class="btn btn--primary" type="button" data-nav="tech">Simular el día de instalación</button><button class="btn btn--secondary" type="button" data-nav="install">Instalar ya</button>` : `<button class="btn btn--secondary" type="button" data-nav="firstday">Ver el primer día</button>`}${demoToggles()}</div>
    </div>
    <p class="label muted">Prototipo conceptual. No es la app oficial de Somos.</p>`);
}

/* ============ Eventos ============ */
function copyText(text, ok) {
  const fallback = () => toast("Mantén presionado el texto para copiarlo", "info");
  try { navigator.clipboard.writeText(text).then(() => toast(ok), fallback); } catch (e) { fallback(); }
}
document.addEventListener("click", (e) => {
  if (e.target.closest("#splash")) { SPL.skip && SPL.skip(); return; }
  const tab = e.target.closest(".tab");
  if (tab) { if (!SPL.done) return; closeSheet(); closePage(true); goTab(+tab.dataset.tab); return; }
  const nav = e.target.closest("[data-nav]");
  if (nav) { go(nav.dataset.nav); return; }
  const a = e.target.closest("[data-action]");
  if (!a) return;
  const id = a.dataset.id;
  switch (a.dataset.action) {
    case "close-sheet": closeSheet(); break;
    case "hero": if (DATA.client === "new") openInstallSheet(); else go("red"); break;
    case "close-page": closePage(); break;
    case "open-notifs": openNotifs(); break;
    case "open-account": openAccount(); break;
    case "open-chat": openChat(); break;
    case "speedtest": runSpeedTest(); break;
    case "toggle-pass": passShown = !passShown; maskPass(); a.setAttribute("aria-label", passShown ? "Ocultar clave" : "Mostrar clave"); a.querySelector("use").setAttribute("href", passShown ? "#i-eyeOff" : "#i-eye"); break;
    case "open-password": openPasswordSheet(); break;
    case "pw-eye": { const inp = $("#pwNew"); const show = inp.type === "password"; inp.type = show ? "text" : "password"; a.querySelector("use").setAttribute("href", show ? "#i-eyeOff" : "#i-eye"); a.setAttribute("aria-label", show ? "Ocultar clave" : "Mostrar clave"); break; }
    case "pw-save": savePassword(); break;
    case "open-qr": openQR(); break;
    case "copy": copyText(a.dataset.copy, a.dataset.ok || "Copiado"); break;
    case "guest": {
      DATA.guest = a.getAttribute("aria-checked") !== "true"; a.setAttribute("aria-checked", String(DATA.guest));
      $("#guestTxt").textContent = DATA.guest ? `${DATA.ssid.replace(/_5G$/, "")}_Invitados · se apaga en 24 horas` : "Para visitas, sin darles tu clave";
      $("#wifiMeta").textContent = DATA.guest ? "2 redes activas" : "1 red activa";
      toast(DATA.guest ? "Red de invitados activa" : "Apagamos la red de invitados"); break;
    }
    case "dev": openDevice(id); break;
    case "dev-review": closePage(true); goTab(1); scrollToEl(1, "#devicesSec"); setTimeout(() => openDevice("new"), 420); break;
    case "dev-pause": {
      const d = dev(id); d.paused = !d.paused; a.setAttribute("aria-checked", String(d.paused));
      const live = $(`[data-live="${id}"]`); if (live) live.textContent = fmtRate(d);
      renderDevices(); toast(d.paused ? `Pausamos el internet de ${d.name}` : `${d.name} volvió a tener internet`, d.paused ? "pause" : "check"); break;
    }
    case "dev-mine": { const d = dev(id); d.isNew = false; d.type = "Celular"; DATA.notifs = DATA.notifs.filter((n) => n.id !== "dev"); renderNotifs(); renderDevices(); closeSheet(); toast(`Listo, ${d.name} quedó como tuyo`); break; }
    case "dev-block": confirmBlock(id); break;
    case "dev-block-yes": { const d = dev(id); DATA.devices = DATA.devices.filter((x) => x.id !== id); if (id === "new") DATA.notifs = DATA.notifs.filter((n) => n.id !== "dev"); renderNotifs(); renderDevices(); closeSheet(); toast(`Bloqueamos ${d.name}`, "block"); break; }
    case "method": payMethod = id; $$(".method", sheetBody).forEach((m) => m.setAttribute("aria-checked", String(m === a))); break;
    case "receipt": openReceipt(+a.dataset.i); break;
    case "autopay": DATA.autopay = a.getAttribute("aria-checked") !== "true"; a.setAttribute("aria-checked", String(DATA.autopay)); $("#autoTxt").textContent = DATA.autopay ? "Activo. Lo cobramos el día 1 con Nequi." : "Lo cobramos el día 1. Te avisamos 3 días antes."; toast(DATA.autopay ? "Activamos el pago automático" : "Apagamos el pago automático"); break;
    case "tv": DATA.tv = true; $("#tvAction").innerHTML = `<div class="state step-in">${ic("check")}<div class="state__body"><p class="state__title">Somos TV quedó activo</p><p class="state__text">Tienes más de 100 canales hasta el ${EN30}. Este mes no te cobramos.</p></div></div>`; toast("Activamos tu mes de Somos TV"); break;
    case "pro":
      openSheet(sheetHead("Prueba Pro 30 días", "Sin pagar más este mes") +
        `<dl class="rows"><div><dt>Hoy tienes</dt><dd>Essential · 900 MBPS</dd></div><div><dt>Durante la prueba</dt><dd>Pro · hasta 2.0 GBPS</dd></div><div><dt>Pagas</dt><dd>Lo mismo: $63.000</dd></div><div><dt>${EN30}</dt><dd>Decides si te quedas</dd></div></dl>
         <p class="body-s muted">Si no haces nada, vuelves a Essential. Sin cláusulas y sin llamadas para convencerte.</p>
         <button class="btn btn--primary btn--block btn--lg" type="button" data-action="pro-yes">Activar prueba</button>`);
      break;
    case "pro-yes": DATA.pro = true; $("#proAction").innerHTML = `<div class="state step-in">${ic("check")}<div class="state__body"><p class="state__title">Tu prueba de Pro arrancó</p><p class="state__text">El ${EN30} te preguntamos si te quedas. Si no respondes, vuelves a Essential.</p></div></div>`; closeSheet(); toast("Tu prueba de Pro arrancó"); break;
    case "copy-code": copyText("SAMU-503", "Código copiado"); break;
    case "floors":
      $("#moveResult").innerHTML = a.dataset.v === "yes"
        ? `<div class="state step-in">${ic("check")}<div class="state__body"><p class="state__title">Empezamos la gestión</p><p class="state__text">Te escribimos cuando tengamos fecha. Mientras tanto, tu servicio actual sigue igual.</p></div></div>`
        : `<p class="body-s step-in">Gracias por contarme. Te avisamos apenas lleguemos a esa zona.</p>`;
      break;
    case "diag": runDiag(); break;
    case "diag-from-alert": closeSheet(); goTab(4); scrollScreen(4, 0); setTimeout(runDiag, 420); break;
    case "faq": { const f = a.closest(".faq"), o = f.dataset.open !== "true"; f.dataset.open = String(o); a.setAttribute("aria-expanded", String(o)); break; }
    case "open-whatsapp":
      openSheet(sheetHead("WhatsApp", "Te responde una persona, todos los días") +
        `<p class="h2 num" style="user-select:all">+57 323 396 8936</p><p class="body-s muted">Guárdalo como Somos y escríbenos cuando quieras. Ten a mano la cédula del titular.</p>
         <button class="btn btn--primary btn--block" type="button" data-action="copy" data-copy="+573233968936" data-ok="Número copiado">${ic("copy")}Copiar número</button>`);
      break;
    case "open-visit": openVisit(a.dataset.motive); break;
    case "v-motive": visit.motive = a.dataset.v; pickChip(a, "v-motive"); break;
    case "v-day": visit.day = +a.dataset.v; pickChip(a, "v-day"); $("#vOk").disabled = !(visit.day != null && visit.slot); break;
    case "v-slot": visit.slot = a.dataset.v; pickChip(a, "v-slot"); $("#vOk").disabled = !(visit.day != null && visit.slot); break;
    case "v-ok": {
      const d = DAYS[visit.day];
      swapSheet(`<div class="center-col"><span class="done-badge"><svg class="i check-draw" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg></span><h2 class="h3" id="sheetTitle">Tu visita quedó agendada</h2><p class="label muted">Te escribimos cuando el técnico vaya en camino.</p></div>
        <dl class="rows"><div><dt>Día</dt><dd>${d.long}</dd></div><div><dt>Hora</dt><dd>${visit.slot}</dd></div><div><dt>Motivo</dt><dd>${visit.motive}</dd></div><div><dt>Dirección</dt><dd>Laureles, Medellín</dd></div></dl>
        <button class="btn btn--primary btn--block btn--lg" type="button" data-action="close-sheet">Listo</button>`);
      DATA.notifs.unshift({ id: "visit", icon: "calendar", title: "Visita agendada", text: `${d.long[0].toUpperCase() + d.long.slice(1)}, ${visit.slot}. Motivo: ${visit.motive}.`, when: "Hoy", time: hora(new Date()), unread: false });
      renderNotifs();
      break;
    }
    case "quick": send(a.dataset.v); break;
    case "alert-detail": closePage(true); alertDetail(); break;
    case "nav-beneficios": go("beneficios"); break;
    case "push-tap": hidePush(); if (pushHandler) pushHandler(); break;
    case "toggle-switch": a.setAttribute("aria-checked", String(a.getAttribute("aria-checked") !== "true")); break;
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (sheet.classList.contains("is-open")) closeSheet(); else if (openPageEl) closePage();
});
$("#moveForm").addEventListener("submit", (e) => { e.preventDefault(); checkMove($("#moveInput").value); });
$("#suggest").addEventListener("click", (e) => { const b = e.target.closest("[data-addr]"); if (b) { $("#moveInput").value = b.dataset.addr; checkMove(b.dataset.addr); } });
$("#moveInput").addEventListener("input", () => { $("#suggest").hidden = false; });
$("#composer").addEventListener("submit", (e) => { e.preventDefault(); const i = $("#chatInput"); send(i.value); i.value = ""; });
$$(".chips [data-filter]").forEach((c) => c.addEventListener("click", () => { devFilter = c.dataset.filter; $$(".chips [data-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x === c))); renderDevices(); }));
$$(".screen").forEach((s) => s.addEventListener("scroll", elevate, { passive: true }));
(function pushSwipe() {
  const p = $("#push"); let y0 = null;
  p.addEventListener("pointerdown", (e) => (y0 = e.clientY));
  p.addEventListener("pointerup", (e) => { if (y0 !== null && e.clientY - y0 < -20) { hidePush(); e.preventDefault(); } y0 = null; });
})();

/* ============ Arranque ============ */
let orbLamp;
function init() {
  fitDevice();
  window.addEventListener("resize", () => { fitDevice(); moveInd(curTab, true); });
  const d = NOW; const dia = DIAS[d.getDay()];
  $("#today").textContent = `${dia[0].toUpperCase() + dia.slice(1)} ${d.getDate()} de ${MESES[d.getMonth()]}`;
  heroLamp = mountLamp($("#heroLamp"), { extra: $("#hero") });
  orbLamp = mountLamp($("#orbLamp"));
  splashLamp = mountLamp($("#splashLamp"), { mode: "manual" });
  welcomeLamp = mountLamp($("#welcomeLamp"));
  buildSplashLogo(); buildGauge(); setGauge(874);
  renderHero(false); renderHomeBill(); renderMonths($("#homeMonths")); renderMonths($("#months")); renderLoyaltyText();
  applyClientState();
  renderDevices(); renderInvoice(); renderHistory(); renderFaqs(); renderNotifs();
  moveInd(0, true);
  holdButton($("#holdBtn"), 1200, restartOrb);
  requestAnimationFrame(lampLoop);
  runSplash();
}
