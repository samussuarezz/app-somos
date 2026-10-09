/* ============ Usuario nuevo: bienvenida y "Me mudo" ============
   Lo que sabemos de Somos (oct. 2026, contado por Samu):
   - Se contrata sin estudio de crédito.
   - La cobertura es por edificio y hasta por torre: en un mismo conjunto una torre puede tener y otra no.
   - La instalación siempre se agenda para una fecha futura.
   Supuestos por validar: que Somos pueda mostrar la velocidad medida por torre, y la recompensa
   por referidos (aquí: un mes por amigo, hasta 3). */

const HASH = (location.hash || "").replace("#", "").toLowerCase();
DATA.client = HASH === "cliente" ? "active" : null; // null = aún no elige; "new" = contrató y espera la instalación
DATA.userName = "Samu";

const LUGARES = [
  { id: "mirador", city: "Medellín", name: "Conjunto Mirador de Laureles", addr: "Cra. 76 #33-40, Laureles", towers: ["Torre 1", "Torre 2", "Torre 3"], cover: { "Torre 1": true, "Torre 2": false, "Torre 3": true }, vecinos: { "Torre 1": 14, "Torre 3": 9 }, speed: { "Torre 1": 872, "Torre 3": 866 } },
  { id: "nogal", city: "Medellín", name: "Edificio Nogal", addr: "Calle 10 Sur #43-12, Envigado", cover: true, vecinos: 11, speed: 869 },
  { id: "altos", city: "Medellín", name: "Unidad Altos del Norte", addr: "Cra. 50 #52-30, Bello", towers: ["Bloque A", "Bloque B"], cover: { "Bloque A": false, "Bloque B": false } },
  { id: "calle60", city: "Bogotá", name: "Edificio Calle 60", addr: "Cra. 7 #59-40, Chapinero", cover: true, vecinos: 18, speed: 874 },
  { id: "prados", city: "Bogotá", name: "Conjunto Prados de Suba", addr: "Calle 145 #91-20, Suba", towers: ["Torre 1", "Torre 2"], cover: { "Torre 1": true, "Torre 2": false }, vecinos: { "Torre 1": 7 }, speed: { "Torre 1": 861 } }
];
const PLANES = {
  essential: { name: "Essential", n: 1, price: { "1-3": 63000, "4-6": 75000 }, rows: [["Velocidad", "Hasta 900 MBPS"], ["Puntos por cable", "Hasta 2"], ["Orb 2", "No incluido"], ["Soporte", "24/7"]] },
  pro: { name: "Pro", n: 2, price: { "1-3": 100000, "4-6": 120000 }, rows: [["Velocidad", "Hasta 2.0 GBPS"], ["Puntos por cable", "Ilimitados"], ["Orb 2", "1 incluido"], ["Soporte", "VIP 24/7"]] }
};
const MV_STEPS = ["donde", "cobertura", "plan", "datos", "instalacion", "listo"];
const SLOTS_INST = [
  { id: "am", chip: "Mañana · 8 a 12", frase: "en la mañana, entre las 8 y las 12" },
  { id: "pm", chip: "Tarde · 1 a 5", frase: "en la tarde, entre la 1 y las 5" }
];
const slotDe = (id) => SLOTS_INST.find((x) => x.id === id) || SLOTS_INST[0];
const MV = {};
function resetMove() {
  Object.assign(MV, { step: 0, city: "Medellín", place: null, free: "", tower: null, apt: "504", estrato: "1-3", plan: "essential",
    name: "Valentina Ríos", cc: "1.036.000.000", phone: "300 000 0000", mail: "valentina@correo.com", split: false, day: null, slot: null, requested: null });
}
resetMove();

const hashStr = (t) => { let h = 7; for (const c of t) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
function coverageOf() {
  const p = MV.place;
  if (p && p.towers) {
    const others = p.towers.filter((t) => t !== MV.tower && p.cover[t]);
    return { ok: !!p.cover[MV.tower], towers: true, others, vecinos: (p.vecinos || {})[MV.tower] || 0, speed: (p.speed || {})[MV.tower] || 0 };
  }
  if (p) return { ok: !!p.cover, towers: false, others: [], vecinos: p.vecinos || 0, speed: p.speed || 0 };
  const h = hashStr(MV.free);
  return { ok: coverage(MV.free), towers: false, others: [], vecinos: 5 + (h % 14), speed: 858 + (h % 16) };
}
const mvTitle = () => (MV.place ? (MV.tower ? `${MV.tower} · ${MV.place.name}` : MV.place.name) : MV.free.trim());
const mvPrice = () => PLANES[MV.plan].price[MV.estrato];
const mvValid = () => (MV.place ? !MV.place.towers || !!MV.tower : MV.free.trim().length > 5);

/* Ilustración técnica de línea: las torres del conjunto, con las ventanas encendidas donde ya llega la fibra. */
function towersArt() {
  const p = MV.place, list = p && p.towers ? p.towers : [p ? "Edificio" : "Tu edificio"];
  const cov = (t) => (p ? (p.towers ? !!p.cover[t] : !!p.cover) : coverageOf().ok);
  const W = 300, H = 184, gap = 22, n = list.length, tw = Math.min(70, (W - 40 - gap * (n - 1)) / n);
  const total = n * tw + (n - 1) * gap, x0 = (W - total) / 2, base = 132, heights = [104, 90, 116, 98];
  let g = `<line x1="8" y1="${base}" x2="${W - 8}" y2="${base}" stroke="var(--line)" stroke-width="1"/>`;
  g += `<line x1="8" y1="${base + 12}" x2="${W - 8}" y2="${base + 12}" stroke="var(--ink)" stroke-width="1.2" stroke-dasharray="1 4" stroke-linecap="round"/>`;
  g += `<text x="${W - 8}" y="${base + 46}" text-anchor="end" fill="var(--ink-muted)" font-family="var(--font-mono)" font-size="10" letter-spacing="0.6">FIBRA SOMOS ···</text>`;
  list.forEach((t, i) => {
    const x = x0 + i * (tw + gap), h = heights[i % heights.length], y = base - h, on = cov(t), sel = !p || !p.towers || t === MV.tower;
    g += `<rect x="${x}" y="${y}" width="${tw}" height="${h}" fill="none" stroke="${sel ? "var(--ink)" : "var(--line)"}" stroke-width="${sel ? 1.5 : 1}"/>`;
    const cols = 4, rows = Math.floor((h - 18) / 12);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const cx = x + 10 + (c * (tw - 20)) / (cols - 1), cy = y + 12 + r * 12, lit = on && (hashStr(t + r + c) % 7 !== 0);
      g += `<circle cx="${cx.toFixed(1)}" cy="${cy}" r="1.8" fill="${lit ? "var(--ink)" : "rgba(255,255,255,0.16)"}"/>`;
    }
    if (on) g += `<line x1="${x + tw / 2}" y1="${base}" x2="${x + tw / 2}" y2="${base + 12}" stroke="var(--ink)" stroke-width="1.2"/>`;
    g += `<text x="${x + tw / 2}" y="${base + 28}" text-anchor="middle" fill="${sel ? "var(--ink)" : "var(--ink-muted)"}" font-family="var(--font-mono)" font-size="10" font-weight="${sel ? 700 : 400}" letter-spacing="0.6">${(p && p.towers ? t : "").toUpperCase()}</text>`;
  });
  return `<svg class="towers" viewBox="0 0 ${W} ${H}" role="img" aria-label="${list.map((t) => `${t}: ${cov(t) ? "con Somos" : "sin Somos todavía"}`).join(". ")}">${g}</svg>`;
}

function placeBtn(pl) {
  const on = MV.place && MV.place.id === pl.id;
  return `<button class="method" type="button" role="radio" aria-checked="${on}" data-action="mv-place" data-id="${pl.id}">
    <span class="list-item__icon" style="width:40px;height:40px">${ic(pl.towers ? "users" : "pin", "i--20")}</span>
    <span class="list-item__main"><span class="body">${pl.name}</span><span class="label muted">${pl.addr}${pl.towers ? ` · ${pl.towers.length} torres` : ""}</span></span>
    <span class="method__radio"></span></button>`;
}
function suggestions() {
  const q = MV.free.trim().toLowerCase();
  return LUGARES.filter((l) => l.city === MV.city && (!q || MV.place || (l.name + " " + l.addr).toLowerCase().includes(q))).map(placeBtn).join("") ||
    `<p class="label muted">No está en la lista. Igual podemos revisarla: toca Revisar cobertura.</p>`;
}

function mvStepHTML() {
  const step = MV_STEPS[MV.step];
  if (step === "donde") {
    return {
      body: `<div class="mv-step step-in">
        <div class="mv-lead"><h2 class="h2">¿A dónde te mudas?</h2><p class="body-s muted">Revisamos tu edificio y, si es un conjunto, tu torre. A veces llegamos a una torre y a otra todavía no.</p></div>
        <div class="field"><span class="label">Ciudad</span><div class="chips">${["Medellín", "Bogotá"].map((c) => `<button class="chip" type="button" aria-pressed="${MV.city === c}" data-action="mv-city" data-v="${c}">${c}</button>`).join("")}</div></div>
        <div class="field"><label for="mvAddr">Dirección o nombre del edificio</label>
          <div class="input-wrap"><input class="input" id="mvAddr" name="mvAddr" type="text" autocomplete="off" value="${MV.place ? MV.place.addr : MV.free}" placeholder="Ej.: Cra. 76 #33-40"><span class="icon-btn" aria-hidden="true" style="pointer-events:none">${ic("search")}</span></div></div>
        <div class="place-list" id="mvPlaces" role="radiogroup" aria-label="Edificios encontrados">${suggestions()}</div>
        <div id="mvTowers">${towersField()}</div>
        <div class="field"><label for="mvApt">Apartamento</label><div class="input-wrap"><input class="input" id="mvApt" name="mvApt" type="text" inputmode="numeric" value="${MV.apt}" style="padding-right:18px"></div></div>
      </div>`,
      foot: `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="mv-next" id="mvCta" ${mvValid() ? "" : "disabled"}>Revisar cobertura</button>`
    };
  }
  if (step === "cobertura") {
    const c = coverageOf(), donde = MV.tower ? "tu torre" : "tu edificio";
    const head = c.ok ? `Llegamos a ${donde}` : c.towers && c.others.length ? `Todavía no llegamos a la ${MV.tower}` : "Todavía no llegamos a ese edificio";
    let body = `<div class="mv-step step-in"><div class="mv-lead"><h2 class="h2">${head}</h2><p class="label muted">${mvTitle()}${MV.apt ? " · apto " + MV.apt : ""}</p></div>${towersArt()}`;
    let foot = "";
    if (c.ok) {
      body += `<div class="state">${ic("check")}<div class="state__body"><p class="state__title">Puedes tener Somos desde el día que llegues</p><p class="state__text">Fibra óptica hasta tu edificio, sin cláusulas y con 30 días gratis.</p></div></div>
        <div class="sec"><div class="sec__row"><span class="label label--caps">Tus vecinos con Somos</span><span class="label">${cap(FACT.prevMes)}</span></div></div>
        <div class="results">
          <div class="result"><span class="label muted">Aptos</span><span class="result__v num">${c.vecinos}</span><span class="label">con Somos</span></div>
          <div class="result"><span class="label muted">Velocidad</span><span class="result__v num">${c.speed}</span><span class="label">MBPS medios</span></div>
          <div class="result"><span class="label muted">Fallas</span><span class="result__v num">0</span><span class="label">el mes pasado</span></div>
        </div>
        <p class="label muted">Medido por los Orb de ${donde}, sin datos de nadie en particular.</p>`;
      foot = `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="mv-next">Ver planes</button><button class="link-btn" type="button" data-action="mv-back">Revisar otra dirección</button>`;
    } else if (MV.requested) {
      body += `<div class="state step-in">${ic("check")}<div class="state__body"><p class="state__title">Empezamos la gestión</p><p class="state__text">${MV.requested === "no" ? "Gracias por contarnos. Te avisamos apenas lleguemos a esa zona." : "Te escribimos por WhatsApp cuando tengamos fecha para " + (MV.tower ? "tu torre" : "tu edificio") + "."}</p></div></div>`;
      foot = `<button class="btn btn--secondary btn--lg btn--block" type="button" data-action="mv-back">Revisar otra dirección</button>`;
    } else if (c.towers && c.others.length) {
      body += `<div class="state state--warning">${ic("alert")}<div class="state__body"><p class="state__title">Estamos cerca</p><p class="state__text">Ya llegamos a la ${c.others.join(" y la ")} de tu conjunto. Podemos empezar la gestión para tu torre.</p></div></div>`;
      foot = `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="mv-request" data-v="torre">Pedir que lleguemos a mi torre</button><button class="link-btn" type="button" data-action="mv-back">Revisar otra dirección</button>`;
    } else {
      body += `<div class="state state--warning">${ic("alert")}<div class="state__body"><p class="state__title">Todavía no llegamos</p><p class="state__text">Podemos empezar la gestión si el edificio tiene al menos 5 pisos. ¿Me confirmas eso?</p></div></div>`;
      foot = `<div class="btn-row"><button class="btn btn--secondary" type="button" data-action="mv-request" data-v="si">Tiene 5 o más</button><button class="btn btn--secondary" type="button" data-action="mv-request" data-v="no">Tiene menos</button></div>`;
    }
    return { body: body + "</div>", foot };
  }
  if (step === "plan") {
    const pr = mvPrice();
    return {
      body: `<div class="mv-step step-in">
        <div class="mv-lead"><h2 class="h2">Elige tu plan</h2><p class="body-s muted">Los dos son fibra con subida igual a la bajada. Puedes cambiar cuando quieras.</p></div>
        <div class="field"><span class="label">Tu estrato</span><div class="chips">${[["1-3", "Estrato 1 a 3"], ["4-6", "Estrato 4 a 6"]].map(([v, t]) => `<button class="chip" type="button" aria-pressed="${MV.estrato === v}" data-action="mv-estrato" data-v="${v}">${t}</button>`).join("")}</div></div>
        <div role="radiogroup" aria-label="Planes" style="display:flex;flex-direction:column;gap:16px">
        ${Object.entries(PLANES).map(([id, pl]) => `<button class="plan plan--${pl.n} plan-opt" type="button" role="radio" aria-checked="${MV.plan === id}" data-action="mv-plan" data-v="${id}">
            <span class="card__top"><span class="plan__name">${pl.name}</span><span class="method__radio"></span></span>
            <span class="plan__price"><span class="price num">${money(pl.price[MV.estrato])}</span><span class="label muted">/ mes</span></span>
            <span class="rows">${pl.rows.map(([a, b]) => `<span><span class="dt">${a}</span><span class="dd">${b}</span></span>`).join("")}</span>
          </button>`).join("")}
        </div>
        <div class="card card--flat"><span class="label label--caps">Lo que vas a pagar</span>
          <dl class="rows">
            <div><dt>Primeros 30 días</dt><dd>$0</dd></div>
            <div><dt>Desde el día 31</dt><dd>${money(pr)} / mes</dd></div>
            <div><dt>Permanencia</dt><dd>Sin cláusulas</dd></div>
            <div><dt>Estudio de crédito</dt><dd>No lo necesitas</dd></div>
            <div><dt>Cancelar</dt><dd>Cuando quieras, desde la app</dd></div>
          </dl>
        </div>
        <p class="label muted">IVA incluido. Planes y precios de somosinternet.com.</p>
      </div>`,
      foot: `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="mv-next">Seguir con ${PLANES[MV.plan].name}</button>`
    };
  }
  if (step === "datos") {
    const f = (id, label, val, extra = "") => `<div class="field"><label for="${id}">${label}</label><div class="input-wrap"><input class="input" id="${id}" name="${id}" value="${val}" style="padding-right:18px" ${extra}></div></div>`;
    return {
      body: `<div class="mv-step step-in">
        <div class="mv-lead"><h2 class="h2">Tus datos</h2></div>
        <div class="state">${ic("check")}<div class="state__body"><p class="state__title">Solo con tu cédula</p><p class="state__text">No necesitas fiador ni estudio de crédito.</p></div></div>
        ${f("mvName", "Nombre completo", MV.name, 'autocomplete="off"')}
        ${f("mvCc", "Cédula", MV.cc, 'inputmode="numeric" autocomplete="off"')}
        ${f("mvPhone", "Celular con WhatsApp", MV.phone, 'inputmode="tel" autocomplete="off"')}
        ${f("mvMail", "Correo", MV.mail, 'type="email" autocomplete="off"')}
        <div class="setting"><div class="setting__text"><span class="body">Dividir la factura con un roomie</span><span class="label muted">Cada uno paga su parte desde la app.</span></div>
          <button class="switch" type="button" role="switch" aria-checked="${MV.split}" data-action="mv-split" aria-label="Dividir la factura con un roomie"></button></div>
        <p class="label muted">Datos de ejemplo. Este prototipo no guarda ni envía lo que escribas.</p>
      </div>`,
      foot: `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="mv-next" id="mvCta">Seguir</button>`
    };
  }
  if (step === "instalacion") {
    const start = addDays(NOW, 1), pad = (start.getDay() + 6) % 7;
    const days = Array.from({ length: 21 }, (_, i) => addDays(start, i));
    const meses = [...new Set(days.map((d) => MESES[d.getMonth()]))].join(" y ");
    const cells = Array.from({ length: pad }, () => "<span></span>").join("") + days.map((d) => {
      const iso = d.toISOString().slice(0, 10), off = d.getDay() === 0;
      return `<button class="day ${d.getDate() === 1 ? "is-first" : ""}" type="button" data-action="mv-day" data-v="${iso}" aria-pressed="${MV.day === iso}" aria-label="${fechaLarga(d)}${off ? ", sin instalaciones" : ""}" ${off ? "disabled" : ""}>${d.getDate()}</button>`;
    }).join("");
    const resumen = MV.day && MV.slot ? `<div class="state step-in">${ic("calendar")}<div class="state__body"><p class="state__title">${cap(fechaLarga(isoDate(MV.day)))}</p><p class="state__text">Llegamos ${slotDe(MV.slot).frase} con tu Orb y lo dejamos funcionando. Toma unos 30 minutos.</p></div></div>` : "";
    return {
      body: `<div class="mv-step step-in">
        <div class="mv-lead"><h2 class="h2">¿Qué día llegas?</h2><p class="body-s muted">Agenda la instalación para el día de tu mudanza y llega a una casa con internet.</p></div>
        <div class="field"><div class="cal-head"><span class="label">Día</span><span class="label muted">${cap(meses)}</span></div>
          <div class="cal">${["L", "M", "M", "J", "V", "S", "D"].map((w) => `<span class="cal__wd" aria-hidden="true">${w}</span>`).join("")}${cells}</div></div>
        <div class="field"><span class="label">Franja</span><div class="chips">${SLOTS_INST.map((t) => `<button class="chip" type="button" aria-pressed="${MV.slot === t.id}" data-action="mv-slot" data-v="${t.id}">${t.chip}</button>`).join("")}</div></div>
        <div id="mvResumen">${resumen}</div>
      </div>`,
      foot: `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="mv-next" id="mvCta" ${MV.day && MV.slot ? "" : "disabled"}>Confirmar</button>`
    };
  }
  // listo
  const d = isoDate(MV.day), code = (MV.name.split(" ")[0] || "AMIGO").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "") + "-" + (MV.apt || "100");
  return {
    body: `<div class="mv-step mv-done step-in">
      <div class="center-col" style="padding:8px 0 0"><div class="lamp" id="mvLamp"></div>
        <h2 class="h1" style="text-align:center">Listo, llegas con internet.</h2>
        <p class="body-s muted">Te esperamos el ${fechaLarga(d)}, ${slotDe(MV.slot).frase}.</p></div>
      <dl class="rows">
        <div><dt>Plan</dt><dd>${PLANES[MV.plan].name}</dd></div>
        <div><dt>Primeros 30 días</dt><dd>$0</dd></div>
        <div><dt>Después</dt><dd>${money(mvPrice())} / mes</dd></div>
        <div><dt>Dónde</dt><dd>${mvTitle()}${MV.apt ? ", apto " + MV.apt : ""}</dd></div>
      </dl>
      <p class="label muted">Te escribimos por WhatsApp un día antes.${MV.split ? " A tu roomie le llega su parte de la factura cada mes." : ""}</p>
      <div class="card">
        <span class="card__row">${ic("users")}<span class="label label--caps">¿Alguien más se muda?</span></span>
        <p class="body-s muted">Comparte tu código con tu roomie o tus amigos. Por cada uno que se pase a Somos te regalamos un mes, hasta 3.</p>
        <div class="code-box"><span class="label">${code}</span><button class="btn btn--primary" type="button" data-action="copy" data-copy="${code}" data-ok="Código copiado">${ic("copy")}Copiar</button></div>
      </div>
    </div>`,
    foot: `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="mv-finish">Entrar a la app</button>`
  };
}
function towersField() {
  if (!MV.place || !MV.place.towers) return "";
  return `<div class="field step-in"><span class="label">¿En qué torre?</span><div class="chips">${MV.place.towers.map((t) => `<button class="chip" type="button" aria-pressed="${MV.tower === t}" data-action="mv-tower" data-v="${t}">${t}</button>`).join("")}</div></div>`;
}
const isoDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };

function renderMove(dir = 1) {
  const { body, foot } = mvStepHTML();
  const b = $("#mvBody");
  b.innerHTML = body; $("#mvFoot").innerHTML = foot;
  b.scrollTop = 0;
  const shown = Math.min(MV.step + 1, 5);
  $("#mvStepLabel").textContent = MV.step >= 5 ? "Listo" : `Paso ${shown} de 5`;
  $("#mvProg").style.width = (MV.step >= 5 ? 100 : (shown / 5) * 100) + "%";
  if (MV_STEPS[MV.step] === "listo") {
    const L = mountLamp($("#mvLamp"), { mode: "fn", temp: true });
    const t0 = performance.now();
    L.fn = (now) => (now - t0 < 500 ? 0.03 : lampOn(now - t0 - 500) * (0.94 + 0.04 * Math.sin(now / 800)));
    setLevel(L, 0.03);
  }
  if (MV_STEPS[MV.step] === "donde") mountDonde();
  if (MV_STEPS[MV.step] === "datos") mountDatos();
}
function mountDonde() {
  const addr = $("#mvAddr"), apt = $("#mvApt");
  addr.addEventListener("input", () => {
    MV.free = addr.value; MV.place = null; MV.tower = null;
    $("#mvPlaces").innerHTML = suggestions(); $("#mvTowers").innerHTML = "";
    $("#mvCta").disabled = !mvValid();
  });
  apt.addEventListener("input", () => (MV.apt = apt.value.trim()));
}
function mountDatos() {
  [["mvName", "name"], ["mvCc", "cc"], ["mvPhone", "phone"], ["mvMail", "mail"]].forEach(([id, k]) => {
    const el = $("#" + id);
    el.addEventListener("input", () => { MV[k] = el.value; $("#mvCta").disabled = !(MV.name.trim() && MV.cc.trim()); });
  });
}
function openMove(fresh = true) {
  if (fresh) resetMove();
  renderMove();
  const p = $("#pageMove");
  p.classList.add("is-open");
  setTimeout(() => { const b = p.querySelector("[data-action=mv-back]"); b && b.focus({ preventScroll: true }); }, 80);
}
function closeMove() { $("#pageMove").classList.remove("is-open"); }

/* Bienvenida */
function showWelcome(instant) {
  const w = $("#pageWelcome");
  w.classList.remove("is-leaving");
  if (instant) w.classList.add("is-instant");
  w.classList.add("is-open");
  if (instant) { w.getBoundingClientRect(); w.classList.remove("is-instant"); }
  $("#inviteChip").hidden = HASH !== "invitado";
}
function hideWelcome() { const w = $("#pageWelcome"); w.classList.add("is-instant"); w.classList.remove("is-open", "is-leaving"); w.getBoundingClientRect(); w.classList.remove("is-instant"); }
function welcomeToHome() {
  // La lámpara de la bienvenida vuela a su lugar en el inicio mientras todo lo demás se desvanece.
  applyClientState();
  goTab(0, true); $("#scr-0").scrollTop = 0;
  const w = $("#pageWelcome"), lamp = $("#welcomeLamp"), dur = REDUCED ? 1 : 900;
  $("#heroLamp").classList.add("is-hidden-for-flip");
  flipTo(lamp, $("#heroLamp"), { dur });
  w.classList.add("is-leaving");
  setTimeout(riseHome, 60);
  startHomeCounters();
  setTimeout(() => {
    $("#heroLamp").classList.remove("is-hidden-for-flip");
    hideWelcome();
    lamp.getAnimations().forEach((a) => a.cancel());
  }, dur + 40);
}
function afterSplash() {
  if (!DATA.client && HASH === "mudanza" && !afterSplash.done) { afterSplash.done = true; setTimeout(() => openMove(true), 250); }
  else setTimeout(reinstallNotice, 450);
}

/* ============ iPhone: instalación anterior con barra translúcida ============ */
/* Desde iOS 26, una app instalada con la barra de estado translúcida queda corta abajo y el iPhone desenfoca el encabezado.
   La versión actual pide la barra opaca, pero el iPhone guarda esa configuración al instalar: hay que volver a agregarla. */
function screenInfo() {
  const p = document.createElement("div");
  p.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)";
  document.body.appendChild(p);
  const cs = getComputedStyle(p), top = parseFloat(cs.paddingTop) || 0, bottom = parseFloat(cs.paddingBottom) || 0;
  p.remove();
  const standalone = navigator.standalone === true || !!(window.matchMedia && matchMedia("(display-mode: standalone)").matches);
  return { standalone, top, bottom, vw: innerWidth, vh: innerHeight, sw: screen.width, sh: screen.height };
}
function checkScreen() {
  const s = screenInfo(), old = s.standalone && s.top > 20;
  document.documentElement.classList.toggle("is-standalone", s.standalone);
  document.documentElement.classList.toggle("is-old-install", old);
  const d = $("#screenDiag");
  if (d) d.textContent = `Pantalla: ${s.standalone ? "app instalada" : "navegador"}${s.standalone ? (old ? ", barra translúcida (instalación anterior)" : ", barra opaca") : ""}. Ventana ${s.vw}×${s.vh}, pantalla ${s.sw}×${s.sh}, márgenes ${Math.round(s.top)} arriba y ${Math.round(s.bottom)} abajo.`;
  return old;
}
function reinstallNotice() {
  if (!checkScreen()) return;
  try { if (localStorage.getItem("somos-aviso-reinstalar") === "1") return; localStorage.setItem("somos-aviso-reinstalar", "1"); } catch (e) { /* sin almacenamiento: se muestra igual */ }
  openSheet(sheetHead("Vuelve a agregar la app", "Tu iPhone guardó la configuración anterior") +
    `<div class="state state--warning">${ic("alert")}<div class="state__body"><p class="state__title">Instalación anterior</p><p class="state__text">Por eso queda un espacio abajo y el logo se ve borroso. Se arregla instalándola otra vez.</p></div></div>
     <p class="body-s"><b>1.</b> Mantén presionado el ícono de Somos y elige <b>Eliminar app</b>.</p>
     <p class="body-s"><b>2.</b> Abre el link en Safari y recarga la página.</p>
     <p class="body-s"><b>3.</b> Toca Compartir y luego <b>Agregar a pantalla de inicio</b>.</p>
     <button class="btn btn--primary btn--block" type="button" data-action="close-sheet">Entendido</button>`);
}
checkScreen();
window.addEventListener("resize", checkScreen);

/* Estado del cliente: nuevo (espera la instalación) o activo */
function applyClientState() {
  const isNew = DATA.client === "new";
  app.classList.toggle("is-new", isNew);
  $("#scr-0 .h1").textContent = `Hola, ${DATA.userName}.`;
  $(".avatar").textContent = DATA.userName.charAt(0).toUpperCase();
  if (isNew) {
    heroLamp.mode = "fn"; heroLamp.fn = (now) => 0.04 + 0.015 * Math.sin(now / 900);
  } else if (heroLamp.mode === "fn" && !heroLamp.restarting) heroLamp.mode = "auto";
  renderHero(false);
  renderNewClient();
}
function installDays() {
  if (!DATA.install) return 0;
  const hoy0 = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
  return Math.max(0, Math.round((isoDate(DATA.install.day) - hoy0) / 864e5));
}
function renderNewClient() {
  if (DATA.client !== "new" || !DATA.install) return;
  const I = DATA.install, d = isoDate(I.day), first = addDays(d, 30);
  $("#homeNew").innerHTML = `
    <div class="card">
      <span class="label label--caps">Antes de la instalación</span>
      <div>
        ${[["cedula", "Ten a mano tu cédula."], ["lugar", "Piensa dónde va el Orb: un lugar central y a la vista."], ["admin", "Avísale a la administración que vamos ese día."]].map(([k, t]) =>
          `<button class="check-row" type="button" role="checkbox" aria-checked="${!!(I.checks && I.checks[k])}" data-action="check" data-v="${k}"><span class="check-row__box">${ic("check")}</span><span class="body-s">${t}</span></button>`).join("")}
      </div>
    </div>
    <div class="card card--flat">
      <span class="label label--caps">Tu primer mes</span>
      <dl class="rows"><div><dt>Hasta el ${first.getDate()} de ${MESES[first.getMonth()]}</dt><dd>$0</dd></div><div><dt>Después</dt><dd>${money(I.price)} / mes</dd></div></dl>
    </div>
    <div class="card">
      <span class="card__row">${ic("users")}<span class="label label--caps">Tu código</span></span>
      <p class="body-s muted">Por cada amigo que se pase a Somos te regalamos un mes, hasta 3.</p>
      <div class="code-box"><span class="label">${I.code}</span><button class="btn btn--primary" type="button" data-action="copy" data-copy="${I.code}" data-ok="Código copiado">${ic("copy")}Copiar</button></div>
    </div>`;
  $("#newBill").innerHTML = `<span class="label label--caps">Tu primera factura</span><p class="invoice__amount num">${money(I.price)}</p>
    <p class="label muted">Llega el ${first.getDate()} de ${MESES[first.getMonth()]}. Los primeros 30 días desde la instalación no pagas.</p>
    <dl class="rows"><div><dt>Plan</dt><dd>${PLANES[I.plan].name}</dd></div><div><dt>Permanencia</dt><dd>Sin cláusulas</dd></div><div><dt>Estudio de crédito</dt><dd>No hizo falta</dd></div></dl>`;
}
function openInstallSheet() {
  const I = DATA.install; if (!I) return;
  openSheet(sheetHead("Tu instalación", cap(fechaLarga(isoDate(I.day)))) +
    `<dl class="rows"><div><dt>Franja</dt><dd>${slotDe(I.slot).chip}</dd></div><div><dt>Dónde</dt><dd>${I.where}</dd></div><div><dt>Plan</dt><dd>${PLANES[I.plan].name}</dd></div></dl>
     <p class="body-s muted">El técnico llega con tu Orb, lo instala y mide la velocidad contigo. Toma unos 30 minutos.</p>
     <button class="btn btn--primary btn--block" type="button" data-nav="install">Simular instalación</button>`);
}
function simulateInstall() {
  if (DATA.client !== "new") { toast("Primero haz el flujo Me mudo", "info"); return; }
  closeSheet(); closePage(true);
  goTab(0); scrollScreen(0, 0);
  const t0 = performance.now();
  heroLamp.fn = (now) => (now - t0 < 300 ? 0.04 : lampOn(now - t0 - 300));
  setTimeout(() => {
    DATA.client = "active"; heroLamp.mode = "auto";
    DATA.ssid = DATA.userName.normalize("NFD").replace(/[\u0300-\u036f]/g, "") + "_5G";
    ["#ssidLabel", "#homeSsid"].forEach((sel) => ($(sel).textContent = DATA.ssid));
    applyClientState();
    countTo($("#heroNum"), heroTarget(), 1200);
    toast("Instalamos tu Orb. Ya tienes internet.");
  }, REDUCED ? 100 : 1300);
}
function finishMove() {
  const where = mvTitle() + (MV.apt ? ", apto " + MV.apt : "");
  DATA.install = { day: MV.day, slot: MV.slot, plan: MV.plan, price: mvPrice(), where, checks: {}, code: (MV.name.split(" ")[0] || "AMIGO").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "") + "-" + (MV.apt || "100") };
  DATA.client = "new";
  DATA.userName = (MV.name.trim().split(" ")[0] || "Humano");
  applyClientState();
  goTab(0, true); $("#scr-0").scrollTop = 0;
  hideWelcome();
  closeMove();
  setTimeout(riseHome, 120);
  DATA.notifs.unshift({ id: "inst", icon: "calendar", title: "Agendamos tu instalación", text: `${cap(fechaLarga(isoDate(MV.day)))}, ${slotDe(MV.slot).frase}. Te escribimos un día antes.`, when: "Hoy", time: hora(new Date()), unread: true });
  renderNotifs();
}

/* Acciones del flujo */
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-action]");
  if (!a) return;
  const v = a.dataset.v;
  switch (a.dataset.action) {
    case "move-start": openMove(true); break;
    case "welcome-client": DATA.client = "active"; DATA.userName = "Samu"; welcomeToHome(); break;
    case "mv-back":
      if (MV.step === 1 && MV.requested) { MV.requested = null; MV.step = 0; renderMove(-1); }
      else if (MV.step === 0 || MV.step >= 5) closeMove();
      else { MV.step--; renderMove(-1); }
      break;
    case "mv-next": if (!a.disabled) { MV.step++; renderMove(1); } break;
    case "mv-city": MV.city = v; MV.place = null; MV.tower = null; MV.free = ""; renderMove(); break;
    case "mv-place":
      MV.place = LUGARES.find((l) => l.id === a.dataset.id); MV.tower = null; MV.free = "";
      $("#mvAddr").value = MV.place.addr;
      $("#mvPlaces").innerHTML = suggestions(); $("#mvTowers").innerHTML = towersField();
      $("#mvCta").disabled = !mvValid();
      break;
    case "mv-tower": MV.tower = v; $$("[data-action=mv-tower]").forEach((b) => b.setAttribute("aria-pressed", String(b === a))); $("#mvCta").disabled = !mvValid(); break;
    case "mv-request": MV.requested = v === "no" ? "no" : "si"; renderMove(); break;
    case "mv-estrato": MV.estrato = v; renderMove(); break;
    case "mv-plan": MV.plan = v; $$("[data-action=mv-plan]").forEach((b) => b.setAttribute("aria-checked", String(b === a))); $("#mvFoot .btn").textContent = `Seguir con ${PLANES[v].name}`; $$("#mvBody dd")[1].textContent = `${money(mvPrice())} / mes`; break;
    case "mv-split": MV.split = !MV.split; a.setAttribute("aria-checked", String(MV.split)); break;
    case "mv-day": MV.day = v; $$("[data-action=mv-day]").forEach((b) => b.setAttribute("aria-pressed", String(b === a))); refreshInstall(); break;
    case "mv-slot": MV.slot = v; $$("[data-action=mv-slot]").forEach((b) => b.setAttribute("aria-pressed", String(b === a))); refreshInstall(); break;
    case "mv-finish": finishMove(); break;
    case "check": { const I = DATA.install; I.checks[v] = !I.checks[v]; a.setAttribute("aria-checked", String(I.checks[v])); break; }
  }
});
function refreshInstall() {
  $("#mvCta").disabled = !(MV.day && MV.slot);
  if (MV.day && MV.slot) $("#mvResumen").innerHTML = `<div class="state step-in">${ic("calendar")}<div class="state__body"><p class="state__title">${cap(fechaLarga(isoDate(MV.day)))}</p><p class="state__text">Llegamos ${slotDe(MV.slot).frase} con tu Orb y lo dejamos funcionando. Toma unos 30 minutos.</p></div></div>`;
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("#pageMove").classList.contains("is-open") && !sheet.classList.contains("is-open") && !openPageEl) closeMove(); });

/* Instalable en el teléfono (solo cuando se sirve por https, como en GitHub Pages) */
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

init();
