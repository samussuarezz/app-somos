/* ============ Usuario nuevo: bienvenida y "Me mudo" ============
   Lo que sabemos de Somos (oct. 2026, contado por Samu):
   - Se contrata sin estudio de crédito.
   - La cobertura es por edificio y hasta por torre: en un mismo conjunto una torre puede tener y otra no.
   - La instalación siempre se agenda para una fecha futura.
   Supuestos por validar: que Somos pueda mostrar la velocidad medida por torre, y la recompensa
   por referidos (aquí: un mes por amigo, hasta 3). */

const HASH = (location.hash || "").replace("#", "").toLowerCase();
const PAGA = /^#paga/i.test(location.hash || ""); // link que recibe quien paga
DATA.client = HASH === "cliente" ? "active" : null; // null = aún no elige; "new" = contrató y espera la instalación
DATA.userName = "Samu";

const LUGARES = [
  { id: "mirador", city: "Medellín", name: "Conjunto Mirador de Laureles", addr: "Cra. 76 #33-40, Laureles", estrato: 3, towers: ["Torre 1", "Torre 2", "Torre 3"], cover: { "Torre 1": true, "Torre 2": false, "Torre 3": true }, vecinos: { "Torre 1": 14, "Torre 3": 9 }, speed: { "Torre 1": 872, "Torre 3": 866 } },
  { id: "nogal", city: "Medellín", name: "Edificio Nogal", addr: "Calle 10 Sur #43-12, Envigado", estrato: 4, cover: true, vecinos: 11, speed: 869 },
  { id: "altos", city: "Medellín", name: "Unidad Altos del Norte", addr: "Cra. 50 #52-30, Bello", estrato: 2, towers: ["Bloque A", "Bloque B"], cover: { "Bloque A": false, "Bloque B": false } },
  { id: "calle60", city: "Bogotá", name: "Edificio Calle 60", addr: "Cra. 7 #59-40, Chapinero", estrato: 4, cover: true, vecinos: 18, speed: 874 },
  { id: "prados", city: "Bogotá", name: "Conjunto Prados de Suba", addr: "Calle 145 #91-20, Suba", estrato: 3, towers: ["Torre 1", "Torre 2"], cover: { "Torre 1": true, "Torre 2": false }, vecinos: { "Torre 1": 7 }, speed: { "Torre 1": 861 } }
];
const PLANES = {
  essential: { name: "Essential", n: 1, fit: "Para ti y tu roomie.", price: { "1-3": 63000, "4-6": 75000 }, rows: [["Velocidad", "Hasta 900 MBPS"], ["Puntos por cable", "Hasta 2"], ["Orb 2", "No incluido"], ["Soporte", "24/7"]] },
  pro: { name: "Pro", n: 2, fit: "Para casas de 4 o más.", price: { "1-3": 100000, "4-6": 120000 }, rows: [["Velocidad", "Hasta 2.0 GBPS"], ["Puntos por cable", "Ilimitados"], ["Orb 2", "1 incluido"], ["Soporte", "VIP 24/7"]] }
};
/* Dos recorridos con el mismo motor: contratar por primera vez y llevarse el internet al mudarse (traslado). */
const MV_FLOWS = {
  nuevo: ["donde", "cobertura", "plan", "datos", "instalacion", "listo"],
  traslado: ["donde", "cobertura", "instalacion", "listo"]
};
const mvSteps = () => MV_FLOWS[MV.mode] || MV_FLOWS.nuevo;
const curStep = () => mvSteps()[MV.step];
const PAYERS = [["yo", "Yo"], ["familia", "Mi familia"], ["roomie", "Yo y mi roomie"]];
const PAYER_WHO = ["Mamá", "Papá", "Otro familiar"];
/* El cliente de ejemplo tiene Essential en estrato 1 a 3; en el traslado el precio sigue el estrato del nuevo edificio. */
const CLIENTE = { plan: "essential", estrato: "1-3" };
const SLOTS_INST = [
  { id: "am", chip: "Mañana · 8 a 12", frase: "en la mañana, entre las 8 y las 12" },
  { id: "pm", chip: "Tarde · 1 a 5", frase: "en la tarde, entre la 1 y las 5" }
];
const slotDe = (id) => SLOTS_INST.find((x) => x.id === id) || SLOTS_INST[0];
const MV = {};
function resetMove(mode = "nuevo") {
  Object.assign(MV, { mode, step: 0, city: "Medellín", kind: "apto", place: null, free: "", tower: null, apt: mode === "traslado" ? "" : "504", estrato: "1-3", estratoEdit: false, needs: { people: 2, acts: [] }, plan: "essential",
    name: "Valentina Ríos", cc: "1.036.000.000", phone: "300 000 0000", mail: "valentina@correo.com", split: false, day: null, slot: null, requested: null,
    payer: "yo", payerWho: "Mamá", payerPhone: "", payerConfirmed: false, wait: false, waitPhone: mode === "traslado" ? "300 000 0000" : "" });
}
resetMove();

const hashStr = (t) => { let h = 7; for (const c of t) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
function coverageOf() {
  const p = MV.place;
  if (MV.kind === "casa") return { ok: false, casa: true, towers: false, others: [], vecinos: 0, speed: 0 };
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
/* Vecinos que ya pidieron que lleguemos: dato de ejemplo, estable para cada edificio y torre. */
const waitCount = () => 8 + (hashStr(mvTitle() || "casa") % 27);
const waToNumber = (t) => { const d = String(t || "").replace(/\D/g, ""); return d.length === 10 ? "57" + d : d; };
const waLink = (phone, text) => `https://wa.me/${waToNumber(phone)}?text=${encodeURIComponent(text)}`;
const inviteMsg = (code) => `Te invito a Somos. Revisa si llega a tu edificio y usa mi código ${code}: ${location.origin}${location.pathname}#invitado`;

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
  const on = MV.place && MV.place.id === pl.id, saved = isSaved(pl.id);
  return `<div class="place-row"><button class="method" type="button" role="radio" aria-checked="${on}" data-action="mv-place" data-id="${pl.id}">
    <span class="list-item__icon" style="width:40px;height:40px">${ic(pl.towers ? "users" : "pin", "i--20")}</span>
    <span class="list-item__main"><span class="body">${pl.name}</span><span class="label muted">${pl.addr}${pl.towers ? ` · ${pl.towers.length} torres` : ""}</span></span>
    <span class="method__radio"></span></button>
    <button class="icon-btn save-btn" type="button" aria-pressed="${saved}" data-action="save-place" data-id="${pl.id}" aria-label="Guardar ${pl.name} para comparar">${ic("bookmark")}</button></div>`;
}
function suggestions() {
  if (MV.kind === "casa") return `<p class="label muted">Escribe la dirección de la casa y toca Revisar cobertura.</p>`;
  const q = MV.free.trim().toLowerCase();
  return LUGARES.filter((l) => l.city === MV.city && (!q || MV.place || (l.name + " " + l.addr).toLowerCase().includes(q))).map(placeBtn).join("") ||
    `<p class="label muted">No está en la lista. Toca Revisar cobertura.</p>`;
}

function mvStepHTML() {
  const step = curStep();
  if (step === "donde") {
    const tras = MV.mode === "traslado", casa = MV.kind === "casa";
    return {
      body: `<div class="mv-step step-in">
        <div class="mv-lead"><h2 class="h2">${tras ? "¿A dónde te vas?" : "¿A dónde te mudas?"}</h2><p class="body-s muted">${tras ? "Revisamos tu nuevo edificio y tu torre." : "Revisamos tu edificio y tu torre."}</p></div>
        ${tras ? "" : `<div id="mvSaved">${savedStrip()}</div>`}
        <div class="field"><span class="label">Ciudad</span><div class="chips">${["Medellín", "Bogotá"].map((c) => `<button class="chip" type="button" aria-pressed="${MV.city === c}" data-action="mv-city" data-v="${c}">${c}</button>`).join("")}</div></div>
        <div class="field"><span class="label">Es un</span><div class="chips">${[["apto", "Apartamento"], ["casa", "Casa"]].map(([v, t]) => `<button class="chip" type="button" aria-pressed="${MV.kind === v}" data-action="mv-kind" data-v="${v}">${t}</button>`).join("")}</div></div>
        <div class="field"><label for="mvAddr">${casa ? "Dirección de la casa" : "Dirección o nombre del edificio"}</label>
          <div class="input-wrap"><input class="input" id="mvAddr" name="mvAddr" type="text" autocomplete="off" value="${esc(MV.place ? MV.place.addr : MV.free)}" placeholder="Ej.: Cra. 76 #33-40"><span class="icon-btn" aria-hidden="true" style="pointer-events:none">${ic("search")}</span></div></div>
        <div class="place-list" id="mvPlaces" role="radiogroup" aria-label="Edificios encontrados">${suggestions()}</div>
        <div id="mvTowers">${casa ? "" : towersField()}</div>
        ${casa ? "" : `<div class="field"><label for="mvApt">Apartamento</label><div class="input-wrap"><input class="input" id="mvApt" name="mvApt" type="text" inputmode="numeric" value="${esc(MV.apt)}" style="padding-right:18px"></div></div>`}
      </div>`,
      foot: `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="mv-next" id="mvCta" ${mvValid() ? "" : "disabled"}>Revisar cobertura</button>`
    };
  }
  if (step === "cobertura") {
    const c = coverageOf(), donde = MV.tower ? "tu torre" : "tu edificio", tras = MV.mode === "traslado";
    const head = c.ok ? `Llegamos a ${donde}` : c.casa ? "Todavía no instalamos en casas" : c.towers && c.others.length ? `Todavía no llegamos a la ${MV.tower}` : "Todavía no llegamos a ese edificio";
    let body = `<div class="mv-step step-in"><div class="mv-lead"><h2 class="h2">${head}</h2><p class="label muted">${esc(mvTitle())}${MV.apt && !c.casa ? " · apto " + esc(MV.apt) : ""}</p></div>${c.casa ? "" : towersArt()}${MV.place && !tras ? saveBigBtn(MV.place) : ""}`;
    let foot = "";
    if (c.ok && tras) {
      const p = MV.place, est = p && p.estrato ? (p.estrato <= 3 ? "1-3" : "4-6") : CLIENTE.estrato;
      MV.estrato = est; MV.plan = CLIENTE.plan;
      const antes = PLANES[CLIENTE.plan].price[CLIENTE.estrato], ahora = PLANES[CLIENTE.plan].price[est];
      body += `<div class="state">${ic("check")}<div class="state__body"><p class="state__title">Tu internet se muda contigo</p><p class="state__text">Lo instalamos allá el mismo día. Sin costo.</p></div></div>
        <div class="results">
          <div class="result"><span class="label muted">Aptos</span><span class="result__v num">${c.vecinos}</span><span class="label">con Somos</span></div>
          <div class="result"><span class="label muted">Velocidad</span><span class="result__v num">${c.speed}</span><span class="label">MBPS medios</span></div>
          <div class="result"><span class="label muted">Fallas</span><span class="result__v num">0</span><span class="label">el mes pasado</span></div>
        </div>
        <div class="card card--flat"><span class="label label--caps">Así queda tu plan</span>
          <dl class="rows">
            <div><dt>Plan</dt><dd>${PLANES[CLIENTE.plan].name}</dd></div>
            <div><dt>Precio allá</dt><dd>${money(ahora)} / mes</dd></div>
            <div><dt>Traslado</dt><dd>$0</dd></div>
            <div><dt>Tus meses con Somos</dt><dd>Siguen contando</dd></div>
          </dl>
          ${ahora !== antes ? `<p class="label muted">${p && p.estrato ? `Estrato ${p.estrato}` : "Otro estrato"}. Hoy pagas ${money(antes)}.</p>` : `<p class="label muted">Pagas lo mismo que hoy.</p>`}
        </div>`;
      foot = `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="mv-next">Elegir el día</button><button class="link-btn" type="button" data-action="mv-back">Revisar otra dirección</button>`;
    } else if (c.ok) {
      body += `<div class="state">${ic("check")}<div class="state__body"><p class="state__title">Puedes tener Somos desde el día que llegues</p><p class="state__text">Sin cláusulas y con 30 días gratis.</p></div></div>
        <div class="sec"><div class="sec__row"><span class="label label--caps">Tus vecinos con Somos</span><span class="label">${cap(FACT.prevMes)}</span></div></div>
        <div class="results">
          <div class="result"><span class="label muted">Aptos</span><span class="result__v num">${c.vecinos}</span><span class="label">con Somos</span></div>
          <div class="result"><span class="label muted">Velocidad</span><span class="result__v num">${c.speed}</span><span class="label">MBPS medios</span></div>
          <div class="result"><span class="label muted">Fallas</span><span class="result__v num">0</span><span class="label">el mes pasado</span></div>
        </div>`;
      foot = `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="mv-next">Ver planes</button><button class="link-btn" type="button" data-action="mv-back">Revisar otra dirección</button>`;
    } else {
      // Sin cobertura: en vez de un "no", una lista de espera con los vecinos que ya lo pidieron.
      const lugar = c.casa ? "las casas de tu zona" : MV.tower ? `la ${MV.tower}` : "tu edificio";
      const n = waitCount() + (MV.wait ? 1 : 0);
      const why = c.casa
        ? `<div class="state state--warning">${ic("alert")}<div class="state__body"><p class="state__title">Hoy llegamos a edificios y conjuntos</p><p class="state__text">A las casas todavía no.</p></div></div>`
        : c.towers && c.others.length
          ? `<div class="state state--warning">${ic("alert")}<div class="state__body"><p class="state__title">Estamos cerca</p><p class="state__text">Ya llegamos a la ${c.others.join(" y la ")}. Falta la tuya.</p></div></div>`
          : `<div class="state state--warning">${ic("alert")}<div class="state__body"><p class="state__title">Todavía no llegamos</p><p class="state__text">Este edificio todavía no tiene nuestra fibra.</p></div></div>`;
      body += why + `<div class="card wait">
          <span class="card__row">${ic("users")}<span class="label label--caps">Avísame cuando llegue</span></span>
          <p class="wait__count"><span class="num">${n}</span><span class="body-s">${MV.wait ? `vecinos ya lo pidieron, contigo` : `vecinos ya lo pidieron`}</span></p>
          ${MV.wait
            ? `<div class="state step-in">${ic("check")}<div class="state__body"><p class="state__title">Listo, quedaste en la lista</p><p class="state__text">Te escribimos al ${esc(MV.waitPhone)} apenas lleguemos.</p></div></div>`
            : `<p class="body-s muted">Nunca te llamamos para venderte.</p>
               <div class="field"><label for="mvWaitPhone">¿A qué WhatsApp te avisamos?</label><div class="input-wrap"><input class="input" id="mvWaitPhone" name="mvWaitPhone" type="text" inputmode="tel" autocomplete="off" value="${esc(MV.waitPhone)}" placeholder="300 000 0000" style="padding-right:18px"></div></div>`}
        </div>
        ${tras ? `<p class="label muted">Tu internet sigue donde vives hoy. Si te mudas antes, cancelas sin multa.</p>` : ""}`;
      foot = MV.wait
        ? `<button class="btn btn--secondary btn--lg btn--block" type="button" data-action="mv-back">Revisar otra dirección</button>`
        : `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="mv-wait" id="mvWaitBtn" ${MV.waitPhone.replace(/\D/g, "").length >= 10 ? "" : "disabled"}>Avísame cuando llegue</button><button class="link-btn" type="button" data-action="mv-back">Revisar otra dirección</button>`;
    }
    return { body: body + "</div>", foot };
  }
  if (step === "plan") {
    const p = MV.place, auto = !!(p && p.estrato && !MV.estratoEdit);
    if (auto) MV.estrato = p.estrato <= 3 ? "1-3" : "4-6";
    const pr = mvPrice();
    const estratoField = auto
      ? `<div class="estrato-auto"><div class="setting__text"><span class="body">Estrato ${p.estrato}</span><span class="label muted">Según la dirección de tu edificio</span></div><button class="link-btn" type="button" data-action="mv-estrato-edit">Cambiar</button></div>`
      : `<div class="field"><span class="label">Tu estrato</span><div class="chips">${[["1-3", "Estrato 1 a 3"], ["4-6", "Estrato 4 a 6"]].map(([v, t]) => `<button class="chip" type="button" aria-pressed="${MV.estrato === v}" data-action="mv-estrato" data-v="${v}">${t}</button>`).join("")}</div><p class="label muted">Aparece en el recibo de la luz o del agua.</p></div>`;
    return {
      body: `<div class="mv-step step-in">
        <div class="mv-lead"><h2 class="h2">Elige tu plan</h2></div>
        ${estratoField}
        <div id="mvNeeds">${needsHTML()}</div>
        <div role="radiogroup" aria-label="Planes" style="display:flex;flex-direction:column;gap:16px">
        ${Object.entries(PLANES).map(([id, pl]) => `<button class="plan plan--${pl.n} plan-opt" type="button" role="radio" aria-checked="${MV.plan === id}" data-action="mv-plan" data-v="${id}">
            <span class="card__top"><span class="plan__name">${pl.name}</span><span class="method__radio"></span></span>
            <span class="plan__price"><span class="price num">${money(pl.price[MV.estrato])}</span><span class="label muted">/ mes</span></span>
            <span class="body-s plan__fit">${pl.fit}</span>
            <span class="rows">${pl.rows.map(([a, b]) => `<span><span class="dt">${a}</span><span class="dd">${b}</span></span>`).join("")}</span>
          </button>`).join("")}
        </div>
        <div class="card card--flat"><span class="label label--caps">Lo que vas a pagar</span>
          <dl class="rows">
            <div><dt>Primeros 30 días</dt><dd>$0</dd></div>
            <div><dt>Desde el día 31</dt><dd id="mvPriceDd">${money(pr)} / mes</dd></div>
            <div><dt>Permanencia</dt><dd>Sin cláusulas</dd></div>
            <div><dt>Estudio de crédito</dt><dd>No lo necesitas</dd></div>
            <div><dt>Cancelar</dt><dd>Cuando quieras, desde la app</dd></div>
          </dl>
        </div>
        <p class="label muted">IVA incluido.</p>
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
        <div class="field"><span class="label">¿Quién paga el internet?</span>
          <div class="chips" role="radiogroup" aria-label="Quién paga">${PAYERS.map(([v, t]) => `<button class="chip" type="button" role="radio" aria-checked="${MV.payer === v}" aria-pressed="${MV.payer === v}" data-action="mv-payer" data-v="${v}">${t}</button>`).join("")}</div></div>
        <div id="mvPayer">${payerFields()}</div>
      </div>`,
      foot: `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="mv-next" id="mvCta">Seguir</button>`
    };
  }
  if (step === "instalacion") {
    const start = addDays(NOW, 1), pad = (start.getDay() + 6) % 7;
    const days = Array.from({ length: 21 }, (_, i) => addDays(start, i));
    const meses = [...new Set(days.map((d) => MESES[d.getMonth()]))].join(" y ");
    const cells = Array.from({ length: pad }, () => "<span></span>").join("") + days.map((d) => {
      const iso = isoOf(d), off = d.getDay() === 0;
      return `<button class="day ${d.getDate() === 1 ? "is-first" : ""}" type="button" data-action="mv-day" data-v="${iso}" aria-pressed="${MV.day === iso}" aria-label="${fechaLarga(d)}${off ? ", sin instalaciones" : ""}" ${off ? "disabled" : ""}>${d.getDate()}</button>`;
    }).join("");
    const resumen = MV.day && MV.slot ? `<div class="state step-in">${ic("calendar")}<div class="state__body"><p class="state__title">${cap(fechaLarga(isoDate(MV.day)))}</p><p class="state__text">Llegamos ${slotDe(MV.slot).frase}. Toma unos 30 minutos.</p></div></div>` : "";
    return {
      body: `<div class="mv-step step-in">
        <div class="mv-lead"><h2 class="h2">¿Qué día llegas?</h2><p class="body-s muted">Elige el día de tu mudanza.</p></div>
        <div class="field"><div class="cal-head"><span class="label">Día</span><span class="label muted">${cap(meses)}</span></div>
          <div class="cal">${["L", "M", "M", "J", "V", "S", "D"].map((w) => `<span class="cal__wd" aria-hidden="true">${w}</span>`).join("")}${cells}</div></div>
        <div class="field"><span class="label">Franja</span><div class="chips">${SLOTS_INST.map((t) => `<button class="chip" type="button" aria-pressed="${MV.slot === t.id}" data-action="mv-slot" data-v="${t.id}">${t.chip}</button>`).join("")}</div></div>
        <div id="mvResumen">${resumen}</div>
      </div>`,
      foot: `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="mv-next" id="mvCta" ${MV.day && MV.slot ? "" : "disabled"}>Confirmar</button>`
    };
  }
  // listo
  const d = isoDate(MV.day);
  if (MV.mode === "traslado") {
    return {
      body: `<div class="mv-step mv-done step-in">
        <div class="center-col" style="padding:8px 0 0"><div class="lamp" id="mvLamp"></div>
          <h2 class="h1" style="text-align:center">Tu internet se muda contigo.</h2>
          <p class="body-s muted">El ${fechaLarga(d)}, ${slotDe(MV.slot).frase}, desconectamos tu Orb y lo dejamos funcionando en tu nuevo lugar.</p></div>
        <dl class="rows">
          <div><dt>Dónde</dt><dd>${esc(mvTitle())}${MV.apt ? ", apto " + esc(MV.apt) : ""}</dd></div>
          <div><dt>Plan</dt><dd>${PLANES[MV.plan].name} · ${money(mvPrice())} / mes</dd></div>
          <div><dt>Traslado</dt><dd>$0</dd></div>
          <div><dt>Tus meses con Somos</dt><dd>Siguen contando</dd></div>
        </dl>
        <p class="label muted">Empaca el Orb con su adaptador. Te escribimos un día antes.</p>
      </div>`,
      foot: `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="mv-finish">Volver al inicio</button>`
    };
  }
  const I = mvInstall();
  return {
    body: `<div class="mv-step mv-done step-in">
      <div class="center-col" style="padding:8px 0 0"><div class="lamp" id="mvLamp"></div>
        <h2 class="h1" style="text-align:center">Listo, llegas con internet.</h2>
        <p class="body-s muted">Te esperamos el ${fechaLarga(d)}, ${slotDe(MV.slot).frase}.</p></div>
      <dl class="rows">
        <div><dt>Plan</dt><dd>${PLANES[MV.plan].name}</dd></div>
        <div><dt>Primeros 30 días</dt><dd>$0</dd></div>
        <div><dt>Después</dt><dd>${money(mvPrice())} / mes</dd></div>
        <div><dt>Dónde</dt><dd>${esc(mvTitle())}${MV.apt ? ", apto " + esc(MV.apt) : ""}</dd></div>
        <div><dt>Paga</dt><dd>${MV.payer === "familia" ? MV.payerWho : MV.payer === "roomie" ? "Tú y tu roomie, mitad y mitad" : "Tú"}</dd></div>
      </dl>
      ${payerCardHTML(I, "listo")}
      <div class="card">
        <span class="card__row">${ic("users")}<span class="label label--caps">¿Alguien más se muda?</span></span>
        <p class="body-s muted">Un mes gratis por cada amigo, hasta 3.</p>
        <button class="btn btn--primary btn--block" type="button" data-action="invite" data-code="${I.code}">${ic("send")}Invitar a un amigo</button>
        <div class="code-box"><span class="label">${I.code}</span><button class="btn btn--secondary" type="button" data-action="copy" data-copy="${I.code}" data-ok="Código copiado">${ic("copy")}Copiar</button></div>
      </div>
    </div>`,
    foot: `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="mv-finish">Entrar a la app</button>`
  };
}
/* Lo que se contrata, armado desde el flujo (también lo usa el resumen de quien paga). */
function mvInstall() {
  const youngName = (MV.name.trim().split(" ")[0] || "Humano");
  return { day: MV.day, slot: MV.slot, plan: MV.plan, estrato: MV.estrato, price: mvPrice(), where: mvTitle() + (MV.apt ? ", apto " + MV.apt : ""), apt: MV.apt,
    split: MV.payer === "roomie", checks: {}, youngName, payerWho: MV.payerWho,
    payer: { who: MV.payer, phone: MV.payerPhone, confirmed: !!MV.payerConfirmed },
    code: youngName.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "") + "-" + (MV.apt || "100") };
}
/* Quién paga: muchas veces no es el joven (cruce de la investigación, oct. 2026). */
function payerFields() {
  if (MV.payer === "roomie") return `<div class="state step-in">${ic("users")}<div class="state__body"><p class="state__title">Cada uno paga su parte</p><p class="state__text">A cada uno le llega su mitad de la factura.</p></div></div>`;
  if (MV.payer !== "familia") return "";
  return `<div class="payer step-in">
      <div class="field"><span class="label">¿Quién de tu familia?</span><div class="chips">${PAYER_WHO.map((w) => `<button class="chip" type="button" aria-pressed="${MV.payerWho === w}" data-action="mv-payer-who" data-v="${w}">${w}</button>`).join("")}</div></div>
      <div class="field"><label for="mvPayerPhone">Su WhatsApp</label><div class="input-wrap"><input class="input" id="mvPayerPhone" name="mvPayerPhone" type="text" inputmode="tel" autocomplete="off" value="${esc(MV.payerPhone)}" placeholder="Opcional" style="padding-right:18px"></div></div>
      <div class="state">${ic("send")}<div class="state__body"><p class="state__title">Le mandamos el resumen</p><p class="state__text">Paga desde su celular. Tú manejas el internet.</p></div></div>
    </div>`;
}
/* Link que recibe quien paga: abre la app en #paga con el resumen (sin datos personales). */
function payerLink(I) {
  const q = new URLSearchParams({ n: I.youngName, q: I.payerWho, p: I.plan, e: I.estrato, d: I.day, s: I.slot, w: I.where });
  return location.origin + location.pathname + "#paga?" + q.toString();
}
function payerMessage(I) {
  return `${I.payerWho === "Otro familiar" ? "Hola." : "Hola, " + I.payerWho + "."} Elegí Somos para mi internet: ${PLANES[I.plan].name}, 30 días gratis y luego ${money(I.price)} al mes, sin permanencia. Resumen y pago: ${payerLink(I)}`;
}
function payerCardHTML(I, where) {
  const P = I.payer;
  if (!P || P.who !== "familia") return "";
  const done = P.confirmed;
  return `<div class="card ${done ? "" : "card--payer"}">
      <span class="card__row">${ic("wallet")}<span class="label label--caps">Quién paga</span>${done ? `<span class="pill" style="margin-left:auto">${ic("check", "i--16")}Listo</span>` : ""}</span>
      <p class="h3">${done ? `${I.payerWho} registró su medio de pago` : `A ${I.payerWho.toLowerCase() === "otro familiar" ? "tu familiar" : "tu " + I.payerWho.toLowerCase()} le llega el resumen`}</p>
      <p class="body-s muted">${done ? `Le avisamos antes de cada cobro.` : "Paga desde su celular."}</p>
      ${done ? "" : `<div class="btn-row"><a class="btn btn--primary" href="${waLink(P.phone, payerMessage(I))}" target="_blank" rel="noopener" data-action="payer-wa" data-where="${where}">${ic("send")}Enviar por WhatsApp</a><button class="btn btn--secondary" type="button" data-action="payer-preview">Ver lo que le llega</button></div>`}
    </div>`;
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
  const total = mvSteps().length - 1, done = curStep() === "listo", shown = Math.min(MV.step + 1, total);
  $("#pageMove .page__title .body").textContent = MV.mode === "traslado" ? "Traslado" : "Me mudo";
  $("#pageMove").setAttribute("aria-label", MV.mode === "traslado" ? "Traslado" : "Me mudo");
  $("#mvStepLabel").textContent = done ? "Listo" : `Paso ${shown} de ${total}`;
  $("#mvProg").style.width = (done ? 100 : (shown / total) * 100) + "%";
  if (done) {
    const L = mountLamp($("#mvLamp"), { mode: "fn", temp: true });
    const t0 = performance.now();
    L.fn = (now) => (now - t0 < 500 ? 0.03 : lampOn(now - t0 - 500) * (0.94 + 0.04 * Math.sin(now / 800)));
    setLevel(L, 0.03);
  }
  if (curStep() === "donde") mountDonde();
  if (curStep() === "datos") mountDatos();
  if (curStep() === "cobertura") mountWait();
}
function mountDonde() {
  const addr = $("#mvAddr"), apt = $("#mvApt");
  addr.addEventListener("input", () => {
    MV.free = addr.value; MV.place = null; MV.tower = null;
    $("#mvPlaces").innerHTML = suggestions(); $("#mvTowers").innerHTML = "";
    $("#mvCta").disabled = !mvValid();
  });
  if (apt) apt.addEventListener("input", () => (MV.apt = apt.value.trim()));
}
function mountDatos() {
  [["mvName", "name"], ["mvCc", "cc"], ["mvPhone", "phone"], ["mvMail", "mail"]].forEach(([id, k]) => {
    const el = $("#" + id);
    el.addEventListener("input", () => { MV[k] = el.value; $("#mvCta").disabled = !(MV.name.trim() && MV.cc.trim()); });
  });
  mountPayerPhone();
}
function mountPayerPhone() {
  const el = $("#mvPayerPhone");
  if (el) el.addEventListener("input", () => (MV.payerPhone = el.value));
}
function mountWait() {
  const el = $("#mvWaitPhone");
  if (!el) return;
  el.addEventListener("input", () => { MV.waitPhone = el.value; $("#mvWaitBtn").disabled = MV.waitPhone.replace(/\D/g, "").length < 10; });
}
function openMove(fresh = true, mode = "nuevo") {
  if (fresh) resetMove(mode);
  renderMove();
  const p = $("#pageMove");
  p.classList.add("is-open");
  setTimeout(() => { const b = p.querySelector("[data-action=mv-back]"); b && b.focus({ preventScroll: true }); }, 80);
}
/* Traslado: el cliente se lleva su internet. Puede entrar con una dirección ya escrita (pestaña Para ti o chat). */
function openTraslado(addr) {
  if (!DATA.client) { DATA.client = "active"; applyClientState(); }
  resetMove("traslado");
  if (addr && addr.trim()) {
    const hit = LUGARES.find((l) => (l.name + " " + l.addr).toLowerCase().includes(addr.trim().toLowerCase()));
    if (hit) { MV.place = hit; MV.city = hit.city; } else MV.free = addr.trim();
    if (!hit || !hit.towers) MV.step = 1; // con torres, primero elige la torre
  }
  openMove(false);
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
  if (PAGA && !afterSplash.done) { afterSplash.done = true; setTimeout(() => openPayer(payerFromUrl(), "link"), 250); return; }
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
  $("#payMeta").textContent = isNew ? "Cliente nuevo" : "Cliente desde feb. 2026";
  $("#scr-0 .h1").textContent = `Hola, ${DATA.userName}.`;
  $(".avatar").textContent = DATA.userName.charAt(0).toUpperCase();
  if (isNew) {
    heroLamp.mode = "fn"; heroLamp.fn = (now) => 0.04 + 0.015 * Math.sin(now / 900);
  } else if (heroLamp.mode === "fn" && !heroLamp.restarting) heroLamp.mode = "auto";
  renderHero(false);
  renderNewClient();
  renderMoveCard();
}
function installDays() {
  if (!DATA.install) return 0;
  const hoy0 = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
  return Math.max(0, Math.round((isoDate(DATA.install.day) - hoy0) / 864e5));
}
function renderNewClient() {
  if (DATA.client !== "new" || !DATA.install) return;
  const I = DATA.install, bill = firstBill(I);
  $("#homeNew").innerHTML = `
    ${techCardHTML()}
    ${TECH.on ? "" : `<button class="btn btn--secondary btn--block" type="button" data-action="resched">${ic("calendar")}Cambiar la fecha de instalación</button>`}
    ${payerCardHTML(I, "home")}
    <div class="card card--flat">
      <span class="label label--caps">Tu primera factura</span>
      <div><p class="price num">${money(bill.prorAmt)}</p><p class="label muted">Llega el ${fechaLarga(bill.firstBill)}.</p></div>
      <button class="link-btn" type="button" data-nav="pagos" style="align-self:flex-start">Ver por qué${ic("arrowRight", "i--16")}</button>
    </div>
    <div class="card">
      <span class="card__row">${ic("users")}<span class="label label--caps">Tu código</span></span>
      <p class="body-s muted">Un mes gratis por cada amigo, hasta 3.</p>
      <button class="btn btn--primary btn--block" type="button" data-action="invite" data-code="${I.code}">${ic("send")}Invitar a un amigo</button>
        <div class="code-box"><span class="label">${I.code}</span><button class="btn btn--secondary" type="button" data-action="copy" data-copy="${I.code}" data-ok="Código copiado">${ic("copy")}Copiar</button></div>
    </div>`;
  $("#newBill").innerHTML = billTimelineHTML(I);
}
function openInstallSheet() {
  const I = DATA.install; if (!I) return;
  openSheet(sheetHead("Tu instalación", cap(fechaLarga(isoDate(I.day)))) +
    `<dl class="rows"><div><dt>Franja</dt><dd>${slotDe(I.slot).chip}</dd></div><div><dt>Dónde</dt><dd>${I.where}</dd></div><div><dt>Plan</dt><dd>${PLANES[I.plan].name}</dd></div></dl>
     <p class="body-s muted">El técnico instala tu Orb en unos 30 minutos. Ese día lo ves venir en la app.</p>
     <button class="btn btn--secondary btn--block" type="button" data-action="resched">${ic("calendar")}Cambiar la fecha</button>
     <div class="card demo" style="padding:16px;gap:10px"><span class="label label--caps">Modo demostración</span>
       <div class="btn-row"><button class="btn btn--primary" type="button" data-nav="tech">Simular el día</button><button class="btn btn--secondary" type="button" data-nav="install">Instalar ya</button></div></div>`);
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
    setTimeout(openFirstDay, REDUCED ? 200 : 1500);
  }, REDUCED ? 100 : 1300);
}
function finishMove() {
  if (MV.mode === "traslado") { finishTraslado(); return; }
  DATA.install = mvInstall();
  DATA.client = "new";
  DATA.userName = DATA.install.youngName;
  applyClientState();
  goTab(0, true); $("#scr-0").scrollTop = 0;
  hideWelcome();
  closeMove();
  setTimeout(riseHome, 120);
  DATA.notifs.unshift({ id: "inst", icon: "calendar", title: "Agendamos tu instalación", text: `${cap(fechaLarga(isoDate(MV.day)))}, ${slotDe(MV.slot).frase}. Te escribimos un día antes.`, when: "Hoy", time: hora(new Date()), unread: true });
  renderNotifs();
}
function finishTraslado() {
  const d = isoDate(MV.day);
  DATA.traslado = { day: MV.day, slot: MV.slot, where: mvTitle() + (MV.apt ? ", apto " + MV.apt : ""), price: mvPrice() };
  closeMove();
  goTab(0, true); $("#scr-0").scrollTop = 0;
  renderMoveCard();
  DATA.notifs.unshift({ id: "tras", icon: "box", title: "Agendamos tu traslado", text: `${cap(fechaLarga(d))}, ${slotDe(MV.slot).frase}. Reinstalamos tu Orb en ${DATA.traslado.where}.`, when: "Hoy", time: hora(new Date()), unread: true });
  renderNotifs();
  toast(`Tu internet se muda el ${fechaLarga(d)}`, "box");
}
/* Tarjeta de mudanza del inicio: invita a trasladar o muestra el traslado agendado. */
function renderMoveCard() {
  const c = $("#homeMoveCard"); if (!c) return;
  const T = DATA.traslado;
  c.innerHTML = T
    ? `<span class="card__row">${ic("box")}<span class="label label--caps">Traslado agendado</span></span>
       <span class="h3">Tu internet se muda el ${fechaLarga(isoDate(T.day))}</span>
       <span class="body-s muted">${esc(T.where)} · ${slotDe(T.slot).chip}</span>`
    : `<span class="card__row">${ic("box")}<span class="label label--caps">Mudanza</span></span>
       <span class="h3">¿Te vas a mudar?</span>
       <span class="body-s muted">Llévate tu internet a tu nuevo edificio.</span>`;
}

/* ============ Para quien paga ============
   Lo que ve la mamá, el papá o el familiar que paga cuando abre el link que le mandan por WhatsApp (#paga).
   Sale del cruce de la investigación: el internet casi nunca lo elige y lo paga el mismo joven.
   Avisar antes de cada cobro y con un mes si cambia el precio son propuestas del prototipo, no políticas de Somos. */
const PAYER = { I: null, src: "link", method: "nequi", auto: true, done: false };
function payerFromUrl() {
  const raw = (location.hash.split("?")[1] || "");
  const q = new URLSearchParams(raw);
  const plan = PLANES[q.get("p")] ? q.get("p") : "essential";
  const estrato = q.get("e") === "4-6" ? "4-6" : "1-3";
  const day = /^\d{4}-\d{2}-\d{2}$/.test(q.get("d") || "") ? q.get("d") : isoOf(addDays(NOW, 7));
  return { youngName: (q.get("n") || "Tu familiar").slice(0, 40), payerWho: (q.get("q") || "").slice(0, 30), plan, estrato, price: PLANES[plan].price[estrato],
    day, slot: q.get("s") === "pm" ? "pm" : "am", where: (q.get("w") || "su nuevo apartamento").slice(0, 120), payer: { who: "familia", confirmed: false } };
}
function samplePayer() {
  if (DATA.install && DATA.install.payer && DATA.install.payer.who === "familia") return DATA.install;
  return { youngName: "Valentina", payerWho: "Mamá", plan: "essential", estrato: "1-3", price: PLANES.essential.price["1-3"], day: isoOf(addDays(NOW, 7)), slot: "am",
    where: "Torre 1 · Conjunto Mirador de Laureles, apto 504", payer: { who: "familia", confirmed: false } };
}
function payerHTML() {
  const I = PAYER.I, b = firstBill(I), m = METHODS.find((x) => x.id === PAYER.method), who = I.payerWho;
  const hola = !who || who === "Otro familiar" ? "Hola." : `Hola, ${esc(who)}.`;
  if (PAYER.done) {
    return {
      body: `<div class="mv-step mv-done step-in">
        <div class="center-col" style="padding:24px 0 0"><span class="done-badge"><svg class="i check-draw" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg></span>
          <h2 class="h2" style="text-align:center">Listo, quedó ${m.name}</h2>
          <p class="body-s muted">La primera factura te llega el ${fechaLarga(b.firstBill)} por WhatsApp${PAYER.auto ? ` y se paga sola` : ""}.</p></div>
        <dl class="rows">
          <div><dt>Primera factura</dt><dd>${money(b.prorAmt)}</dd></div>
          <div><dt>Después</dt><dd>${money(I.price)} / mes</dd></div>
          <div><dt>Aviso antes de cobrar</dt><dd>3 días antes</dd></div>
        </dl>
      </div>`,
      foot: `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="payer-close">${PAYER.src === "link" ? "Conocer Somos" : "Volver"}</button>`
    };
  }
  return {
    body: `<div class="mv-step step-in">
      <div class="mv-lead"><h2 class="h2">${hola}</h2><p class="body-s muted">${esc(I.youngName)} eligió Somos para su internet. Esto es lo que pagas.</p></div>
      <dl class="rows">
        <div><dt>Plan</dt><dd>${PLANES[I.plan].name}</dd></div>
        <div><dt>Instalación</dt><dd>${cap(fechaCorta(isoDate(I.day)))} · ${slotDe(I.slot).chip.split(" · ")[0]}</dd></div>
        <div><dt>Primeros 30 días</dt><dd>$0</dd></div>
        <div><dt>Primera factura</dt><dd>${money(b.prorAmt)}</dd></div>
        <div><dt>Desde ahí</dt><dd>${money(I.price)} / mes</dd></div>
        <div><dt>Permanencia</dt><dd>Sin cláusulas</dd></div>
        <div><dt>Estudio de crédito</dt><dd>No lo necesita</dd></div>
      </dl>
      <div class="state">${ic("check")}<div class="state__body"><p class="state__title">Sin sorpresas en la factura</p><p class="state__text">Te avisamos 3 días antes de cada cobro, y con un mes si cambia el precio.</p></div></div>
      <div class="field"><span class="label">¿Cómo quieres pagar?</span>
        <div role="radiogroup" aria-label="Medio de pago" style="display:flex;flex-direction:column;gap:8px">
        ${METHODS.map((x) => `<button class="method" type="button" role="radio" aria-checked="${x.id === PAYER.method}" data-action="payer-method" data-id="${x.id}"><span class="list-item__icon" style="width:40px;height:40px">${ic(x.icon, "i--20")}</span><span class="list-item__main"><span class="body">${x.name}</span><span class="label muted">${x.sub}</span></span><span class="method__radio"></span></button>`).join("")}
        </div></div>
      <div class="setting"><div class="setting__text"><span class="body">Pago automático cada mes</span></div>
        <button class="switch" type="button" role="switch" aria-checked="${PAYER.auto}" data-action="payer-auto" aria-label="Pago automático cada mes"></button></div>
    </div>`,
    foot: `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="payer-confirm">Usar ${m.name}</button>`
  };
}
function renderPayer() {
  const { body, foot } = payerHTML();
  $("#payerBody").innerHTML = body; $("#payerFoot").innerHTML = foot; $("#payerBody").scrollTop = 0;
  $("#payerMeta").textContent = PAYER.done ? "Listo" : `Internet de ${PAYER.I.youngName}`;
}
function openPayer(I, src = "app") {
  Object.assign(PAYER, { I, src, method: "nequi", auto: true, done: !!(I.payer && I.payer.confirmed) });
  renderPayer();
  $("#pagePayer").classList.add("is-open");
}
function closePayer() { $("#pagePayer").classList.remove("is-open"); }
function confirmPayer() {
  const I = PAYER.I;
  PAYER.done = true;
  if (I.payer) I.payer.confirmed = true;
  if (PAYER.src === "app") {
    if (DATA.install === I) {
      renderNewClient();
      DATA.notifs.unshift({ id: "payer", tone: "success", icon: "check", title: `${I.payerWho} registró su medio de pago`, text: `Paga con ${METHODS.find((x) => x.id === PAYER.method).name}. Le avisamos antes de cada cobro.`, when: "Hoy", time: hora(new Date()), unread: true });
      renderNotifs();
    } else if ($("#pageMove").classList.contains("is-open")) { MV.payerConfirmed = true; renderMove(); }
  }
  renderPayer();
}
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-action]");
  if (!a) return;
  switch (a.dataset.action) {
    case "payer-method": PAYER.method = a.dataset.id; renderPayer(); break;
    case "payer-auto": PAYER.auto = !PAYER.auto; a.setAttribute("aria-checked", String(PAYER.auto)); break;
    case "payer-confirm": confirmPayer(); break;
    case "payer-close": closePayer(); break;
  }
});

/* Acciones del flujo */
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-action]");
  if (!a) return;
  const v = a.dataset.v;
  switch (a.dataset.action) {
    case "move-start": openMove(true); break;
    case "welcome-client": DATA.client = "active"; DATA.userName = "Samu"; welcomeToHome(); break;
    case "mv-back":
      if (curStep() === "cobertura" && MV.wait) { MV.wait = false; MV.step = 0; renderMove(-1); }
      else if (MV.step === 0 || curStep() === "listo") closeMove();
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
    case "mv-kind": MV.kind = v; MV.place = null; MV.tower = null; renderMove(); break;
    case "mv-wait":
      if (a.disabled) break;
      MV.wait = true; renderMove();
      toast("Te avisamos por WhatsApp cuando lleguemos", "bubble");
      break;
    case "mv-payer":
      MV.payer = v; MV.split = v === "roomie";
      $$("[data-action=mv-payer]").forEach((b) => { b.setAttribute("aria-checked", String(b === a)); b.setAttribute("aria-pressed", String(b === a)); });
      $("#mvPayer").innerHTML = payerFields(); mountPayerPhone();
      break;
    case "mv-payer-who": MV.payerWho = v; $$("[data-action=mv-payer-who]").forEach((b) => b.setAttribute("aria-pressed", String(b === a))); break;
    case "payer-preview": openPayer(DATA.install && DATA.client === "new" ? DATA.install : mvInstall(), "app"); break;
    case "payer-wa": toast("Abrimos WhatsApp con el resumen", "send"); break;
    case "mv-estrato": MV.estrato = v; renderMove(); break;
    case "mv-estrato-edit": MV.estratoEdit = true; renderMove(); setTimeout(() => { const f = $("#mvBody .chip[data-action=mv-estrato]"); f && f.focus({ preventScroll: true }); }, 60); break;
    case "mv-plan": MV.plan = v; $$("[data-action=mv-plan]").forEach((b) => b.setAttribute("aria-checked", String(b === a))); $("#mvFoot .btn").textContent = `Seguir con ${PLANES[v].name}`; $("#mvPriceDd").textContent = `${money(mvPrice())} / mes`; break;
    case "mv-day": MV.day = v; $$("[data-action=mv-day]").forEach((b) => b.setAttribute("aria-pressed", String(b === a))); refreshInstall(); break;
    case "mv-slot": MV.slot = v; $$("[data-action=mv-slot]").forEach((b) => b.setAttribute("aria-pressed", String(b === a))); refreshInstall(); break;
    case "mv-finish": finishMove(); break;
    case "check": { const I = DATA.install; I.checks[v] = !I.checks[v]; a.setAttribute("aria-checked", String(I.checks[v])); break; }
  }
});
function refreshInstall() {
  $("#mvCta").disabled = !(MV.day && MV.slot);
  if (MV.day && MV.slot) $("#mvResumen").innerHTML = `<div class="state step-in">${ic("calendar")}<div class="state__body"><p class="state__title">${cap(fechaLarga(isoDate(MV.day)))}</p><p class="state__text">Llegamos ${slotDe(MV.slot).frase}. Toma unos 30 minutos.</p></div></div>`;
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("#pageMove").classList.contains("is-open") && !sheet.classList.contains("is-open") && !openPageEl) closeMove(); });

/* Instalable en el teléfono (solo cuando se sirve por https, como en GitHub Pages) */
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
