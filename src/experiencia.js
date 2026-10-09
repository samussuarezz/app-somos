/* ============ Mejoras de experiencia (v3, oct. 2026) ============
   1. Comparar apartamentos          5. Técnico en camino             9. Prueba real desde el celular
   2. Estrato según la dirección      6. Primer día con internet      10. Textos más grandes (styles.css)
   3. Megas en la vida diaria         7. Primera factura explicada    11. Sin conexión y pago rechazado
   4. Cambiar la fecha                8. Qué avisos recibir
   Políticas como "cambiar la fecha sin costo" o el prorrateo de la primera factura son propuestas del prototipo. */

DATA.saved = [];
DATA.prefs = { fallas: true, dispositivos: true, factura: true, instalacion: true, promos: false, quiet: true };
STATE.forceOffline = false;
STATE.payFail = false;

/* ============ 1. Comparar apartamentos ============ */
const isSaved = (id) => DATA.saved.includes(id);
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
function savedStrip() {
  const list = DATA.saved.map((id) => LUGARES.find((l) => l.id === id)).filter(Boolean);
  if (!list.length) return `<p class="label muted saved-hint">${ic("bookmark", "i--16")}¿Estás viendo varios apartamentos? Guarda cada edificio y compáralos.</p>`;
  return `<div class="saved-strip step-in">
    <div class="saved-strip__top"><span class="label label--caps">Tus opciones · ${list.length}</span>
      <button class="btn btn--secondary btn--sm" type="button" data-action="open-compare">${ic("compare")}Comparar</button></div>
    <div class="saved-strip__names">${list.map((p) => `<span class="pill pill--neutral">${p.name}</span>`).join("")}</div>
  </div>`;
}
function saveBigBtn(p) {
  const on = isSaved(p.id);
  return `<button class="btn btn--secondary btn--block save-big" type="button" data-action="save-place" data-id="${p.id}" aria-pressed="${on}">${ic("bookmark")}${on ? "Guardado para comparar" : "Guardar para comparar"}</button>`;
}
function toggleSaved(id) {
  const on = !isSaved(id);
  DATA.saved = on ? [...DATA.saved, id] : DATA.saved.filter((x) => x !== id);
  $$(`[data-action="save-place"][data-id="${id}"]`).forEach((b) => {
    b.setAttribute("aria-pressed", String(on));
    if (b.classList.contains("save-big")) b.innerHTML = `${ic("bookmark")}${on ? "Guardado para comparar" : "Guardar para comparar"}`;
  });
  const box = $("#mvSaved"); if (box) box.innerHTML = savedStrip();
  if (sheet.classList.contains("is-open") && $("#cmpList")) { if (DATA.saved.length) openCompare(true); else closeSheet(); }
  toast(on ? (DATA.saved.length > 1 ? "Guardado. Ya puedes compararlos" : "Guardado. Busca otro para comparar") : "Lo quitamos de tus opciones", on ? "bookmark" : "check");
}
function coverSummary(p) {
  if (p.towers) {
    const yes = p.towers.filter((t) => p.cover[t]), no = p.towers.filter((t) => !p.cover[t]);
    if (!yes.length) return { ok: false, txt: "Todavía no llegamos" };
    return { ok: true, partial: no.length > 0, txt: no.length ? `${yes.join(" y ")} sí · ${no.join(" y ")} todavía no` : "Todas las torres" };
  }
  return p.cover ? { ok: true, txt: "Todo el edificio" } : { ok: false, txt: "Todavía no llegamos" };
}
function placeStats(p) {
  if (!p.vecinos) return { vecinos: 0, speed: 0 };
  if (typeof p.vecinos === "number") return { vecinos: p.vecinos, speed: p.speed };
  const v = Object.values(p.vecinos), sp = Object.values(p.speed || {});
  return { vecinos: v.reduce((a, b) => a + b, 0), speed: sp.length ? Math.round(sp.reduce((a, b) => a + b, 0) / sp.length) : 0 };
}
function openCompare(swap) {
  const list = DATA.saved.map((id) => LUGARES.find((l) => l.id === id)).filter(Boolean);
  const cards = list.map((p) => {
    const c = coverSummary(p), st = placeStats(p), price = PLANES.essential.price[p.estrato <= 3 ? "1-3" : "4-6"];
    return `<div class="cmp ${c.ok ? "" : "is-off"}">
      <div class="cmp__head"><div class="list-item__main"><span class="body">${p.name}</span><span class="label muted">${p.addr}</span></div>
        ${c.ok ? `<span class="pill">${ic("check")}${c.partial ? "Por torre" : "Hay Somos"}</span>` : `<span class="pill pill--warning">${ic("alert")}Todavía no</span>`}</div>
      <dl class="rows">
        <div><dt>Cobertura</dt><dd>${c.txt}</dd></div>
        <div><dt>Vecinos con Somos</dt><dd>${st.vecinos || "—"}</dd></div>
        <div><dt>Velocidad medida</dt><dd>${st.speed ? st.speed + " MBPS" : "—"}</dd></div>
        <div><dt>Estrato ${p.estrato}</dt><dd>${money(price)} / mes</dd></div>
      </dl>
      ${c.ok ? `<button class="btn btn--primary btn--block" type="button" data-action="cmp-pick" data-id="${p.id}">Elegir este</button>` : `<button class="btn btn--secondary btn--block" type="button" data-action="save-place" data-id="${p.id}">Quitar de mis opciones</button>`}
    </div>`;
  }).join("");
  const html = sheetHead("Compara tus opciones", list.length === 1 ? "Guarda otro edificio para ponerlos lado a lado" : `${list.length} edificios guardados`) +
    `<div class="cmp-list" id="cmpList">${cards}</div>
     <p class="label muted">Velocidad medida por los Orb de cada edificio, sin datos de nadie en particular. Precio del plan Essential con IVA.</p>`;
  if (swap && sheet.classList.contains("is-open")) swapSheet(html); else openSheet(html);
}
function pickCompared(id) {
  const p = LUGARES.find((l) => l.id === id); if (!p) return;
  closeSheet();
  MV.city = p.city; MV.place = p; MV.free = ""; MV.estratoEdit = false;
  MV.tower = p.towers ? p.towers.find((t) => p.cover[t]) || null : null;
  MV.step = 0; renderMove();
  toast(p.towers ? "Confirma tu torre abajo" : "Edificio elegido");
}

/* ============ 3. Megas en la vida diaria ============ */
const ACTS = [
  { id: "4k", label: "Series en 4K", mbps: 15 },            // Netflix recomienda 15 MBPS o más para 4K
  { id: "video", label: "Videollamadas o clases", mbps: 4 },
  { id: "juego", label: "Juegos en línea", mbps: 5 },
  { id: "descargas", label: "Descargar juegos grandes", mbps: 0, heavy: true },
  { id: "vivo", label: "Transmitir en vivo", mbps: 10 }
];
const minutosPara = (gb, mbps) => Math.max(1, Math.round((gb * 8000) / mbps / 60));
function enLaVida(mbps) { return `Con eso, un juego de 100 GB baja en unos ${minutosPara(100, mbps)} minutos por cable.`; }
function needsHTML() {
  const N = MV.needs, sel = (id) => N.acts.includes(id);
  let res = `<p class="label muted">Toca lo que hacen en tu casa y te decimos cuál plan te alcanza.</p>`;
  if (N.acts.length) {
    const per = ACTS.filter((a) => sel(a.id)).reduce((s, a) => s + a.mbps, 0), total = Math.max(5, per * N.people);
    const pro = sel("descargas") && N.people >= 3;
    res = pro
      ? `<div class="state state--info step-in">${ic("info")}<div class="state__body"><p class="state__title">Te sirve Pro</p><p class="state__text">Con ${N.people} personas descargando juegos grandes, Pro baja 100 GB en unos ${minutosPara(100, 2000)} minutos. Con Essential, en unos ${minutosPara(100, 900)}.</p><button class="link-btn" type="button" data-action="needs-pick" data-v="pro">Elegir Pro${ic("arrowRight", "i--16")}</button></div></div>`
      : `<div class="state step-in">${ic("check")}<div class="state__body"><p class="state__title">Te alcanza con Essential</p><p class="state__text">Todos al mismo tiempo usarían unos ${total} MBPS de 900. Te recomendamos el más barato porque te sobra.</p><button class="link-btn" type="button" data-action="needs-pick" data-v="essential">Elegir Essential${ic("arrowRight", "i--16")}</button></div></div>`;
  }
  const head = `<button class="needs__toggle" type="button" data-action="needs-toggle" aria-expanded="${!!N.open}" aria-controls="needsBody"><span class="card__row">${ic("pulse")}<span class="label label--caps">¿Cuánto internet necesitas?</span></span>${ic("chevD")}</button>`;
  if (!N.open) return `<div class="card card--flat needs">${head}<p class="body-s muted">Te ayudamos a elegir según lo que hacen en tu casa.</p></div>`;
  return `<div class="card card--flat needs is-open">${head}
    <div class="needs__body" id="needsBody"><div class="field"><span class="label">¿Cuántos viven contigo, contándote?</span><div class="chips">${[1, 2, 3, 4].map((n) => `<button class="chip" type="button" aria-pressed="${N.people === n}" data-action="needs-people" data-v="${n}">${n === 4 ? "4 o más" : n}</button>`).join("")}</div></div>
    <div class="field"><span class="label">¿Qué hacen?</span><div class="chips">${ACTS.map((a) => `<button class="chip" type="button" aria-pressed="${sel(a.id)}" data-action="needs-act" data-v="${a.id}">${a.label}</button>`).join("")}</div></div>
    <div id="needsRes">${res}</div></div>
  </div>`;
}
function refreshNeeds() { const box = $("#mvNeeds"); if (box) box.innerHTML = needsHTML(); }

/* ============ 4. Cambiar la fecha ============ */
const RS = { day: null, slot: null };
function reschedHTML() {
  const start = addDays(NOW, 1), pad = (start.getDay() + 6) % 7, days = Array.from({ length: 21 }, (_, i) => addDays(start, i));
  const meses = [...new Set(days.map((d) => MESES[d.getMonth()]))].join(" y ");
  const cells = Array.from({ length: pad }, () => "<span></span>").join("") + days.map((d) => {
    const iso = isoOf(d), off = d.getDay() === 0;
    return `<button class="day" type="button" data-action="rs-day" data-v="${iso}" aria-pressed="${RS.day === iso}" aria-label="${fechaLarga(d)}${off ? ", sin instalaciones" : ""}" ${off ? "disabled" : ""}>${d.getDate()}</button>`;
  }).join("");
  return sheetHead("Cambia la fecha", "Sin costo, hasta un día antes") +
    `<div class="field"><div class="cal-head"><span class="label">Día</span><span class="label muted">${cap(meses)}</span></div>
       <div class="cal">${["L", "M", "M", "J", "V", "S", "D"].map((w) => `<span class="cal__wd" aria-hidden="true">${w}</span>`).join("")}${cells}</div></div>
     <div class="field"><span class="label">Franja</span><div class="chips">${SLOTS_INST.map((t) => `<button class="chip" type="button" aria-pressed="${RS.slot === t.id}" data-action="rs-slot" data-v="${t.id}">${t.chip}</button>`).join("")}</div></div>
     <button class="btn btn--primary btn--block btn--lg" type="button" data-action="rs-ok" id="rsOk" disabled>Guardar la nueva fecha</button>`;
}
const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function openResched() {
  const I = DATA.install; if (!I) return;
  RS.day = I.day; RS.slot = I.slot;
  if (sheet.classList.contains("is-open")) swapSheet(reschedHTML()); else openSheet(reschedHTML());
}
function rsRefresh() {
  const I = DATA.install, changed = RS.day !== I.day || RS.slot !== I.slot;
  $("#rsOk").disabled = !(RS.day && RS.slot && changed);
}
function saveResched() {
  const I = DATA.install; I.day = RS.day; I.slot = RS.slot;
  renderHero(true); renderNewClient();
  const txt = `${cap(fechaLarga(isoDate(I.day)))}, ${slotDe(I.slot).frase}.`;
  DATA.notifs.unshift({ id: "resched", icon: "calendar", title: "Cambiamos tu instalación", text: txt + " Te escribimos un día antes.", when: "Hoy", time: hora(new Date()), unread: false });
  renderNotifs();
  swapSheet(`<div class="center-col"><span class="done-badge"><svg class="i check-draw" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg></span>
    <h2 class="h3" id="sheetTitle">Listo, te esperamos ese día</h2><p class="label muted">${txt}</p></div>
    <button class="btn btn--primary btn--block btn--lg" type="button" data-action="close-sheet">Listo</button>`);
}

/* ============ 5. Técnico en camino ============ */
const TECH = { on: false, phase: 0, eta: 15, step: 0, timers: [], name: "Andrés Molina", ini: "AM" };
const techTitle = () => ["Andrés va saliendo hacia tu casa", `Llega en ${TECH.eta} ${TECH.eta === 1 ? "minuto" : "minutos"}`, "Andrés llegó a tu edificio", "Instalando tu Orb"][TECH.phase];
function techCardHTML() {
  if (!TECH.on) return "";
  const I = DATA.install || {}, prog = TECH.phase === 0 ? 0.04 : TECH.phase === 1 ? (15 - TECH.eta) / 15 : 1;
  const status = TECH.phase <= 1 ? `<span class="pill pill--neutral">${ic("van")}En camino</span>` : TECH.phase === 2 ? `<span class="pill">${ic("check")}Llegó</span>` : `<span class="pill pill--neutral">${ic("orb")}Instalando</span>`;
  const mid = TECH.phase <= 1
    ? `<div class="route" aria-hidden="true"><span class="route__line"><i style="width:${(prog * 100).toFixed(1)}%"></i></span><span class="route__van" style="left:${(prog * 100).toFixed(1)}%">${ic("van")}</span></div>
       <div class="route__ends"><span class="label muted">Bodega Somos</span><span class="label muted">Tu casa</span></div>`
    : TECH.phase === 2
      ? `<p class="body-s muted">Avísale a portería que suba al apto ${I.apt || "504"}. Trae tu Orb y su credencial de Somos.</p>`
      : `<div class="steps">${["Conectamos la fibra", "Encendemos tu Orb", "Medimos la velocidad contigo"].map((t, i) => `<div class="step ${i < TECH.step ? "is-ok" : i === TECH.step ? "is-run" : "is-wait"}"><span class="step__mark">${i < TECH.step ? ic("check") : ""}</span><span class="step__txt body-s">${t}</span></div>`).join("")}</div>`;
  return `<div class="card tech" id="techCard" aria-live="polite">
    <div class="tech__who"><span class="tech__av" aria-hidden="true">${TECH.ini}</span><div class="list-item__main"><span class="body">${TECH.name}</span><span class="label muted">Técnico de Somos</span></div>${status}</div>
    <p class="h3">${techTitle()}</p>
    ${mid}
    <div class="btn-row"><button class="btn btn--secondary" type="button" data-action="tech-call">${ic("phone")}Llamar</button><button class="btn btn--secondary" type="button" data-action="tech-msg">${ic("bubble")}Escribir</button></div>
  </div>`;
}
function heroTech() {
  const pill = $("#heroPill"), sub = $("#heroSub");
  $("#heroLabel").textContent = "Hoy es tu instalación";
  $("#heroLink").innerHTML = "Ver detalle " + ic("arrowRight");
  if (TECH.phase <= 1) {
    $("#heroNum").textContent = TECH.phase === 0 ? 15 : TECH.eta;
    $("#heroUnit").textContent = "minutos para que llegue";
    pill.className = "pill pill--neutral"; pill.innerHTML = ic("van") + "En camino";
  } else {
    $("#heroNum").textContent = "Hoy";
    $("#heroUnit").textContent = TECH.phase === 2 ? "Andrés ya llegó" : "instalando tu Orb";
    pill.className = "pill"; pill.innerHTML = ic("check") + (TECH.phase === 2 ? "Llegó" : "Instalando");
  }
  sub.innerHTML = `<span>${TECH.name}</span><span>${slotDe(DATA.install.slot).chip}</span>`;
}
function renderTech() {
  const box = $("#techCard");
  if (box) box.outerHTML = techCardHTML(); else renderNewClient();
  if (DATA.client === "new") heroTech();
}
function startTechDay() {
  if (DATA.client !== "new" || !DATA.install) { toast("Primero haz el flujo Me mudo", "info"); return; }
  closeSheet(); closePage(true);
  TECH.timers.forEach(clearTimeout); TECH.timers = [];
  Object.assign(TECH, { on: true, phase: 0, eta: 15, step: 0 });
  DATA.install.day = isoOf(NOW);
  goTab(0); scrollScreen(0, 0);
  renderNewClient(); heroTech();
  const at = (ms, fn) => TECH.timers.push(setTimeout(fn, REDUCED ? Math.min(ms, 300) : ms));
  notify("instalacion", { title: "Andrés va en camino", text: "Llega en unos 15 minutos con tu Orb.", tone: "success", icon: "van" });
  let t = 1600;
  at(t, () => { TECH.phase = 1; renderTech(); });
  for (let m = 14; m >= 1; m--) { t += 520; at(t, () => { TECH.eta = m; renderTech(); }); }
  t += 600;
  at(t, () => { TECH.phase = 2; renderTech(); notify("instalacion", { title: "Andrés llegó a tu edificio", text: `Avísale a portería que suba al apto ${DATA.install.apt || "504"}.`, tone: "success", icon: "check" }); });
  t += 2600;
  at(t, () => { TECH.phase = 3; TECH.step = 0; renderTech(); const t0 = performance.now(); heroLamp.mode = "fn"; heroLamp.fn = (now) => 0.04 + Math.min(0.16, (now - t0) / 30000); });
  [1500, 3000, 4500].forEach((d, i) => at(t + d, () => { TECH.step = i + 1; renderTech(); }));
  at(t + 5100, () => { TECH.on = false; renderNewClient(); simulateInstall(); });
}

/* ============ 6. Primer día con internet ============ */
const FD = { step: 0, name: "", pass: "", saving: false };
const PALABRAS = ["luz", "nido", "casa", "sol", "fibra", "orb", "cafe", "luna", "rio", "pino", "faro", "mango"];
function newPass() {
  const r = (n) => Math.floor(Math.random() * n), a = r(PALABRAS.length), b = (a + 1 + r(PALABRAS.length - 1)) % PALABRAS.length;
  return `${PALABRAS[a]}-${100 + r(900)}-${PALABRAS[b]}`;
}
function promiseRows(fresh) {
  const I = DATA.install;
  const fecha = I ? cap(fechaLarga(isoDate(I.day))) + ", " + slotDe(I.slot).frase : "Febrero de 2026, el día que agendaste";
  const plan = I ? PLANES[I.plan] : PLANES.essential, price = I ? I.price : 63000;
  const rows = [
    ["Velocidad", `Hasta ${plan.name === "Pro" ? "2.0 GBPS" : "900 MBPS"} por cable`, `${DATA.down} MBPS medidos ${fresh ? "hoy" : "esta semana"}`],
    ["Fecha de instalación", fecha, fresh ? `Llegamos ese día a las ${I && I.slot === "pm" ? "2:15 p.m." : "9:40 a.m."}` : "Llegamos ese día"],
    ["Precio", `30 días gratis, luego ${money(price)} al mes`, "Así quedó en tu factura"],
    ["Permanencia", "Sin cláusulas", "Así quedó en tu contrato"]
  ];
  return `<div class="promise">${rows.map(([k, a, b]) => `<div class="promise__row"><span class="promise__ok">${ic("check")}</span><div class="promise__main"><span class="label label--caps muted">${k}</span><span class="body-s">${a}</span><span class="label promise__got">${b}</span></div></div>`).join("")}</div>
    <p class="label muted">Si algo no se cumple, te lo decimos nosotros primero y te lo compensamos en la factura.</p>`;
}
function openPromise() { openSheet(sheetHead("Lo que te prometimos", "4 de 4 cumplidas") + promiseRows(false)); }
function fdStepHTML() {
  const I = DATA.install || {}, who = DATA.userName || "Samu";
  if (FD.step === 0) {
    const sug = [`Casa de ${who}`, "El nido", `Apto ${I.apt || "504"}`, "La base"];
    return {
      body: `<div class="mv-step step-in">
        <div class="mv-lead"><h2 class="h2">Ponle nombre a tu Wi‑Fi</h2><p class="body-s muted">Es tu primera casa. Que tu red se llame como tú quieras.</p></div>
        <div class="field"><label for="fdName">Nombre de la red</label><div class="input-wrap"><input class="input" id="fdName" name="fdName" maxlength="32" autocomplete="off" value="${esc(FD.name)}" style="padding-right:18px"></div>
          <div class="chips">${sug.map((n) => `<button class="chip" type="button" data-action="fd-suggest" data-v="${n}">${n}</button>`).join("")}</div></div>
        <div class="field"><label for="fdPass">Clave</label><div class="input-wrap"><input class="input num" id="fdPass" name="fdPass" autocomplete="off" value="${esc(FD.pass)}"><button class="icon-btn" type="button" data-action="fd-newpass" aria-label="Sugerir otra clave">${ic("refresh")}</button></div>
          <p class="label muted">Te sugerimos una fácil de dictar y difícil de adivinar. Puedes cambiarla.</p></div>
      </div>`,
      foot: `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="fd-next" id="fdCta">Guardar y seguir</button>`
    };
  }
  if (FD.step === 1) {
    const msg = encodeURIComponent(`Wi‑Fi de la casa: ${DATA.ssid}\nClave: ${DATA.pass}`);
    return {
      body: `<div class="mv-step step-in">
        <div class="mv-lead"><h2 class="h2">Compártelo con tu roomie</h2><p class="body-s muted">Que escanee el código con la cámara y queda conectado. Nadie tiene que dictar la clave.</p></div>
        <div class="qr-card">${QR.svg(wifiString())}<span class="label" style="font-weight:700">${esc(DATA.ssid)}</span></div>
        <div class="btn-row"><button class="btn btn--secondary" type="button" data-action="copy" data-copy="${esc(DATA.pass)}" data-ok="Clave copiada">${ic("copy")}Copiar clave</button><a class="btn btn--secondary" href="https://wa.me/?text=${msg}" target="_blank" rel="noopener">${ic("bubble")}WhatsApp</a></div>
        <p class="label muted">Para visitas es mejor la red de invitados: la activas en la pestaña Red y se apaga sola en 24 horas.</p>
      </div>`,
      foot: `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="fd-next">Seguir</button>`
    };
  }
  return {
    body: `<div class="mv-step step-in">
      <div class="mv-lead"><h2 class="h2">Lo que te prometimos</h2><p class="body-s muted">Lo revisamos contigo el primer día, para que nada quede en letra pequeña.</p></div>
      ${promiseRows(true)}
    </div>`,
    foot: `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="fd-done">Empezar a usar Somos</button>`
  };
}
function renderFirst() {
  const { body, foot } = fdStepHTML();
  $("#fdBody").innerHTML = body; $("#fdFoot").innerHTML = foot; $("#fdBody").scrollTop = 0;
  $("#fdStepLabel").textContent = `Paso ${FD.step + 1} de 3`;
  $("#fdProg").style.width = ((FD.step + 1) / 3) * 100 + "%";
  if (FD.step === 0) {
    const n = $("#fdName"), p = $("#fdPass");
    const check = () => { FD.name = n.value; FD.pass = p.value; $("#fdCta").disabled = !(n.value.trim() && p.value.length >= 8 && /[a-z]/i.test(p.value) && /\d/.test(p.value)); };
    n.addEventListener("input", check); p.addEventListener("input", check); check();
  }
}
function openFirstDay() {
  if (DATA.client !== "active") { DATA.client = "active"; applyClientState(); }
  hideWelcome(); closeMove(); closeSheet(); closePage(true);
  Object.assign(FD, { step: 0, name: DATA.ssid.replace(/_5G$/, ""), pass: newPass(), saving: false });
  renderFirst();
  $("#pageFirst").classList.add("is-open");
}
function closeFirst() { $("#pageFirst").classList.remove("is-open"); }
function fdNext() {
  if (FD.step === 0) {
    if (FD.saving) return;
    FD.saving = true;
    $("#fdBody").innerHTML = `<div class="center-col"><svg class="spinner" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="24"/></svg><p class="h3">Aplicando en tu Orb…</p><p class="label muted">Toma unos segundos.</p></div>`;
    $("#fdFoot").innerHTML = "";
    setTimeout(() => {
      DATA.ssid = FD.name.trim().slice(0, 32); DATA.pass = FD.pass;
      ["#ssidLabel", "#homeSsid"].forEach((sel) => ($(sel).textContent = DATA.ssid));
      maskPass(); FD.saving = false; FD.step = 1; renderFirst();
    }, REDUCED ? 200 : 1300);
    return;
  }
  FD.step++; renderFirst();
}

/* ============ 7. Primera factura explicada ============ */
/* Propuesta: 30 días gratis desde la instalación; luego se cobra por mes calendario el día 1, con los días del primer mes. */
function firstBill(I) {
  const d = isoDate(I.day), freeEnd = addDays(d, 29), paidStart = addDays(d, 30);
  const monthEnd = new Date(paidStart.getFullYear(), paidStart.getMonth() + 1, 0), dim = monthEnd.getDate();
  const prorDays = dim - paidStart.getDate() + 1, prorAmt = Math.round((I.price * prorDays) / dim / 50) * 50;
  const firstBill = new Date(monthEnd.getFullYear(), monthEnd.getMonth() + 1, 1), second = new Date(firstBill.getFullYear(), firstBill.getMonth() + 1, 1);
  return { d, freeEnd, paidStart, monthEnd, dim, prorDays, prorAmt, firstBill, second };
}
function billTimelineHTML(I) {
  const b = firstBill(I), half = (n) => money(Math.round(n / 2 / 50) * 50);
  const items = [
    [fechaCorta(b.d), "Instalamos tu Orb", "$0"],
    [`${fechaCorta(b.d)} al ${fechaCorta(b.freeEnd)}`, "30 días gratis", "$0"],
    [fechaCorta(b.firstBill), `Primera factura: del ${b.paidStart.getDate()} al ${b.monthEnd.getDate()} de ${MESES[b.monthEnd.getMonth()]}, ${b.prorDays} días`, money(b.prorAmt)],
    [`Desde el ${fechaCorta(b.second)}`, "Cada mes, el mes completo", money(I.price)]
  ];
  return `<span class="label label--caps">Tu primera factura</span>
    <p class="invoice__amount num">${money(b.prorAmt)}</p>
    <p class="body-s muted">Llega el ${fechaLarga(b.firstBill)}. Es más baja porque solo cobra los ${b.prorDays} días que usas después de los 30 gratis.</p>
    <ol class="timeline">${items.map(([w, t, a], i) => `<li class="timeline__item ${i === 2 ? "is-key" : ""}"><span class="timeline__dot"></span><div class="timeline__main"><span class="label muted">${w}</span><span class="body-s">${t}</span></div><span class="label timeline__amt">${a}</span></li>`).join("")}</ol>
    <p class="label muted">Así se calcula: ${money(I.price)} ÷ ${b.dim} días × ${b.prorDays} días. Vence 5 días después de llegar.</p>
    ${I.split ? `<div class="state">${ic("users")}<div class="state__body"><p class="state__title">La dividen con tu roomie</p><p class="state__text">Cada uno paga ${half(b.prorAmt)} la primera vez y ${half(I.price)} desde el ${fechaCorta(b.second)}</p></div></div>` : ""}
    <dl class="rows"><div><dt>Plan</dt><dd>${PLANES[I.plan].name}</dd></div><div><dt>Permanencia</dt><dd>Sin cláusulas</dd></div><div><dt>Estudio de crédito</dt><dd>No hizo falta</dd></div></dl>`;
}

/* ============ 8. Qué avisos recibir ============ */
const PREFS = [
  ["fallas", "Fallas en tu zona", "Te avisamos antes de que llames y cuando quede"],
  ["dispositivos", "Dispositivos nuevos", "Si alguien entra a tu red sin que lo sepas"],
  ["factura", "Factura y pagos", "Tres días antes de que venza"],
  ["instalacion", "Instalación y visitas", "Cuando el técnico va en camino"],
  ["promos", "Beneficios y promociones", "Máximo uno al mes"]
];
function quietNow() { const h = new Date().getHours(); return DATA.prefs.quiet && (h >= 22 || h < 7); }
function notify(kind, opts) {
  if (!DATA.prefs[kind]) { toast("No te enviamos el aviso: lo apagaste. Queda en Notificaciones", "bell"); return false; }
  if (quietNow() && kind !== "fallas" && kind !== "instalacion") { toast("Horario de silencio: queda en Notificaciones", "moon"); return false; }
  push(opts); return true;
}
function openPrefs() {
  const sw = (k) => `<button class="switch" type="button" role="switch" aria-checked="${!!DATA.prefs[k]}" data-action="pref" data-k="${k}" aria-label="${(PREFS.find((p) => p[0] === k) || [0, "Horario de silencio"])[1]}"></button>`;
  openSheet(sheetHead("Qué avisos recibir", "Tú decides cuáles te llegan") +
    `<div class="pref-list">${PREFS.map(([k, t, d]) => `<div class="setting"><div class="setting__text"><span class="body">${t}</span><span class="label muted">${d}</span></div>${sw(k)}</div>`).join("")}</div>
     <div class="card card--flat" style="gap:12px">
       <div class="setting"><div class="card__row" style="gap:12px">${ic("moon")}<div class="setting__text"><span class="body">Horario de silencio</span><span class="label muted">De 10:00 p.m. a 7:00 a.m.</span></div></div>${sw("quiet")}</div>
       <p class="label muted">En ese horario no suena nada. Las fallas en tu zona y el día de tu instalación te llegan igual.</p>
     </div>
     <button class="btn btn--primary btn--block" type="button" data-action="close-sheet">Listo</button>`);
}

/* ============ 9. Prueba real desde el celular ============ */
const CF = "https://speed.cloudflare.com/";
let phoneTesting = false;
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
async function measurePing() {
  const lat = [];
  for (let i = 0; i < 8; i++) {
    const t0 = performance.now();
    const r = await fetch(`${CF}__down?bytes=0&r=${Math.random()}`, { cache: "no-store" });
    await r.arrayBuffer();
    lat.push(performance.now() - t0);
    $("#gNum").textContent = Math.round(Math.min(...lat));
  }
  lat.shift(); // la primera incluye abrir la conexión
  return Math.max(1, Math.round(median(lat)));
}
async function measureDown(onRate) {
  const ctrl = new AbortController(), T = 6500, CAP = 40e6, t0 = performance.now();
  let bytes = 0, tWarm = null, bWarm = 0;
  const rate = () => { const t = performance.now(); return tWarm !== null && t - tWarm > 250 ? ((bytes - bWarm) * 8) / ((t - tWarm) / 1000) / 1e6 : (bytes * 8) / ((t - t0) / 1000) / 1e6; };
  const stream = async () => {
    const r = await fetch(`${CF}__down?bytes=25000000&r=${Math.random()}`, { cache: "no-store", signal: ctrl.signal });
    if (!r.ok || !r.body) throw new Error("descarga");
    const rd = r.body.getReader();
    for (;;) {
      const { done, value } = await rd.read();
      if (done) break;
      bytes += value.length;
      const t = performance.now() - t0;
      if (tWarm === null && t > 1000) { tWarm = performance.now(); bWarm = bytes; }
      onRate(rate());
      if (t > T || bytes > CAP) { ctrl.abort(); break; }
    }
  };
  const res = await Promise.allSettled([stream(), stream()]);
  if (!bytes && res.every((x) => x.status === "rejected")) throw new Error("descarga");
  return rate();
}
async function measureUp(onRate) {
  const T = 5000, CAP = 20e6, t0 = performance.now();
  let bytes = 0;
  const worker = async () => {
    let size = 250e3;
    while (performance.now() - t0 < T && bytes < CAP) {
      const r = await fetch(`${CF}__up`, { method: "POST", body: new Uint8Array(size), cache: "no-store" });
      if (!r.ok) throw new Error("subida");
      bytes += size; size = Math.min(4e6, size * 2);
      onRate((bytes * 8) / ((performance.now() - t0) / 1000) / 1e6);
    }
  };
  await Promise.all([worker(), worker()]);
  return (bytes * 8) / ((performance.now() - t0) / 1000) / 1e6;
}
async function runPhoneTest() {
  if (phoneTesting || testing) return;
  const btn = $("#runPhone"), orbBtn = $("#runTest"), num = $("#gNum"), unit = $("#gUnit"), capEl = $("#gCap"), msg = $("#speedMsg");
  if (isOffline()) { msg.innerHTML = speedError(true); return; }
  phoneTesting = true; btn.disabled = true; orbBtn.disabled = true; btn.lastChild.textContent = "Midiendo…";
  msg.innerHTML = ""; capEl.textContent = "Midiendo desde este celular";
  ["rDown", "rUp", "rPing"].forEach((id) => ($("#" + id).textContent = "—"));
  const ORDER = ["ping", "down", "up"];
  const setPhase = (p) => $$(".phase").forEach((el) => { const i = ORDER.indexOf(el.dataset.ph), j = p ? ORDER.indexOf(p) : ORDER.length; el.classList.toggle("is-on", i === j); el.classList.toggle("is-done", i < j); });
  let last = 0;
  const live = (v) => { const now = performance.now(); if (now - last < 90) return; last = now; num.textContent = Math.round(v); setGauge(v); };
  try {
    setPhase("ping"); unit.textContent = "ms de latencia"; setGauge(0);
    const ping = await measurePing(); $("#rPing").textContent = ping;
    setPhase("down"); unit.textContent = "MBPS de bajada";
    const down = Math.round(await measureDown(live)); $("#rDown").textContent = down;
    setPhase("up"); unit.textContent = "MBPS de subida"; last = 0;
    const up = Math.round(await measureUp(live)); $("#rUp").textContent = up;
    setPhase(""); num.textContent = down; unit.textContent = "MBPS de bajada"; setGauge(down);
    capEl.textContent = "Desde este celular · " + hora(new Date());
    msg.innerHTML = phoneResult(down);
  } catch (e) {
    setPhase(""); num.textContent = "—"; unit.textContent = "Sin resultado"; setGauge(0); capEl.textContent = "Desde este celular";
    msg.innerHTML = speedError(isOffline());
  }
  phoneTesting = false; btn.disabled = false; orbBtn.disabled = false; btn.lastChild.textContent = "Medir otra vez";
}
function phoneResult(down) {
  const vs = `El Orb mide ${DATA.down} MBPS en la entrada de tu casa. La diferencia es normal: por Wi‑Fi influyen la distancia, las paredes y el celular.`;
  if (down < 50) return `<div class="state state--warning step-in">${ic("alert")}<div class="state__body"><p class="state__title">A este celular le llega poco: ${down} MBPS</p><p class="state__text">Acércate al Orb o conéctate a la red de 5 GHz. Si estás con datos móviles, esto mide tu plan de celular, no tu internet de Somos.</p><button class="link-btn" type="button" data-action="diag-from-alert">Revisar mi conexión${ic("arrowRight", "i--16")}</button></div></div>`;
  return `<div class="state step-in">${ic("check")}<div class="state__body"><p class="state__title">A este celular le llegan ${down} MBPS</p><p class="state__text">Alcanza para ver 4K en ${Math.floor(down / 15)} pantallas al mismo tiempo. ${vs}</p></div></div>`;
}
function speedError(offline) {
  return `<div class="state state--danger step-in">${ic(offline ? "wifiOff" : "alert")}<div class="state__body"><p class="state__title">${offline ? "Sin conexión" : "No pudimos medir"}</p><p class="state__text">${offline ? "Este celular no tiene internet ahora. Revisa que estés conectado a tu Wi‑Fi y vuelve a intentarlo." : "La prueba se cortó antes de terminar. Puede ser la señal en este momento."}</p><button class="link-btn" type="button" data-action="phonetest">Intentar otra vez${ic("arrowRight", "i--16")}</button></div></div>`;
}

/* ============ 11. Sin conexión y pago rechazado ============ */
const isOffline = () => STATE.forceOffline || navigator.onLine === false;
function renderOffline() {
  const off = isOffline();
  $("#offline").hidden = !off;
  app.classList.toggle("is-offline", off);
}
function toggleOffline() {
  STATE.forceOffline = !STATE.forceOffline;
  renderOffline(); refreshDemoLabels();
  toast(STATE.forceOffline ? "Simulamos que no hay conexión" : "Volvió la conexión", STATE.forceOffline ? "wifiOff" : "wifi");
}
function togglePayFail() {
  STATE.payFail = !STATE.payFail; refreshDemoLabels();
  toast(STATE.payFail ? "El siguiente pago va a fallar. Pruébalo en Pagos" : "Los pagos vuelven a funcionar", "info");
}
function refreshDemoLabels() {
  $$("[data-offline-label]").forEach((el) => (el.textContent = STATE.forceOffline ? "Volver a conectar" : "Simular sin conexión"));
  $$("[data-payfail-label]").forEach((el) => (el.textContent = STATE.payFail ? "Quitar pago rechazado" : "Simular pago rechazado"));
}
function demoToggles() {
  return `<button class="btn btn--secondary" type="button" data-nav="offline"><span data-offline-label>${STATE.forceOffline ? "Volver a conectar" : "Simular sin conexión"}</span></button><button class="btn btn--secondary" type="button" data-nav="payfail"><span data-payfail-label>${STATE.payFail ? "Quitar pago rechazado" : "Simular pago rechazado"}</span></button>`;
}
function payFailed(m) {
  swapSheet(`<div class="center-col"><span class="done-badge done-badge--danger">${ic("close")}</span>
      <h2 class="h3" id="sheetTitle">${m.name} no aprobó el pago</h2><p class="label muted">No te cobramos nada. Pasa cuando la notificación vence o no hay saldo suficiente.</p></div>
    <div class="state state--warning">${ic("info")}<div class="state__body"><p class="state__title">Tu internet sigue igual</p><p class="state__text">Tu factura vence el ${FACT.vence}. Tienes tiempo de pagar sin recargos.</p></div></div>
    <div class="btn-row"><button class="btn btn--secondary" type="button" data-action="pay-other">Otro medio</button><button class="btn btn--primary" type="button" data-action="pay-retry">Intentar otra vez</button></div>`);
}
window.addEventListener("online", renderOffline);
window.addEventListener("offline", renderOffline);
/* Sin conexión, lo que necesita internet avisa antes de intentarlo */
document.addEventListener("click", (e) => {
  if (!isOffline()) return;
  const el = e.target.closest('[data-nav="pay"], [data-action="speedtest"], [data-action="diag"], [data-action="pay-retry"], [data-action="v-ok"], [data-action="pw-save"], [data-action="fd-next"], [data-action="rs-ok"]');
  if (!el) return;
  e.preventDefault(); e.stopPropagation();
  toast("Necesitas conexión para esto", "wifiOff");
}, true);
$("#composer").addEventListener("submit", (e) => {
  if (!isOffline()) return;
  e.preventDefault(); e.stopImmediatePropagation();
  toast("Sin conexión: tu mensaje sale cuando vuelva", "wifiOff");
}, true);

/* ============ Eventos ============ */
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-action]");
  if (!a) return;
  const v = a.dataset.v;
  switch (a.dataset.action) {
    case "save-place": toggleSaved(a.dataset.id); break;
    case "open-compare": openCompare(); break;
    case "cmp-pick": pickCompared(a.dataset.id); break;
    case "needs-toggle": MV.needs.open = !MV.needs.open; refreshNeeds(); break;
    case "needs-people": MV.needs.people = +v; refreshNeeds(); break;
    case "needs-act": { const s = MV.needs.acts; MV.needs.acts = s.includes(v) ? s.filter((x) => x !== v) : [...s, v]; refreshNeeds(); break; }
    case "needs-pick": { const b = $(`[data-action="mv-plan"][data-v="${v}"]`); if (b) { b.click(); b.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "center" }); } break; }
    case "resched": openResched(); break;
    case "rs-day": RS.day = v; $$("[data-action=rs-day]").forEach((b) => b.setAttribute("aria-pressed", String(b === a))); rsRefresh(); break;
    case "rs-slot": RS.slot = v; $$("[data-action=rs-slot]").forEach((b) => b.setAttribute("aria-pressed", String(b === a))); rsRefresh(); break;
    case "rs-ok": saveResched(); break;
    case "tech-call": toast("Llamada simulada a Andrés", "phone"); break;
    case "tech-msg": toast("Le escribimos a Andrés por WhatsApp", "bubble"); break;
    case "fd-suggest": FD.name = v; $("#fdName").value = v; $("#fdName").dispatchEvent(new Event("input")); break;
    case "fd-newpass": FD.pass = newPass(); $("#fdPass").value = FD.pass; $("#fdPass").dispatchEvent(new Event("input")); break;
    case "fd-next": if (!a.disabled) fdNext(); break;
    case "fd-back": if (FD.step > 0 && !FD.saving) { FD.step--; renderFirst(); } else if (!FD.saving) closeFirst(); break;
    case "fd-done": closeFirst(); goTab(0); scrollScreen(0, 0); toast(`Listo. Tu red ${DATA.ssid} ya está activa`); break;
    case "open-promise": openPromise(); break;
    case "pref": { const k = a.dataset.k; DATA.prefs[k] = !DATA.prefs[k]; a.setAttribute("aria-checked", String(DATA.prefs[k])); break; }
    case "phonetest": runPhoneTest(); break;
    case "pay-retry": processPayment(); break;
    case "pay-other": swapSheet(payStepHTML(), mountSlider); break;
  }
});

renderOffline();
init();
