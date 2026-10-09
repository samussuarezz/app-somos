"""Arma la app a partir de src/.

Uso:
  python3 build.py                   -> index.html (lo que publica GitHub Pages) y sw.js
  python3 build.py --fuentes-reales  -> además presentacion.html con las fuentes de marca
                                        incrustadas (necesita la carpeta fonts/, que no se sube al repo)
"""
import base64, hashlib, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
JS_FILES = ["core.js", "screens.js", "mudanza.js"]

LOGO = [
    "M13.39,2.41h26.55v6.1H13.03c-3.89,0-6.2,2.68-6.2,5.99s2.31,5.89,6.2,5.89h14.72c8.04,0,12.46,4.84,12.46,11.93s-4.42,12.14-12.46,12.14H.99v-6.36h26.92c3.84,0,6.2-2.42,6.2-5.73s-2.37-5.89-6.2-5.89h-14.51C5.35,26.49.72,21.65.72,14.55S5.35,2.41,13.39,2.41Z",
    "M67.07,1.56c12.09,0,21.87,9.78,21.87,21.87s-9.78,21.87-21.87,21.87-21.82-9.78-21.82-21.87S55.03,1.56,67.07,1.56ZM82.74,23.44c0-8.78-6.73-15.88-15.67-15.88s-15.61,7.1-15.61,15.88,6.68,15.88,15.61,15.88,15.67-7.1,15.67-15.88Z",
    "M126.16,31.95V14.29c0-8.04,4.94-12.62,12.09-12.62s11.99,4.57,11.99,12.62v30.18h-6.05V13.87c0-4.21-2.68-6.2-5.99-6.2s-5.94,2-5.94,6.2v19.19c0,8.04-4.52,11.67-10.04,11.67s-10.04-3.63-10.04-11.67V13.87c0-4.21-2.63-6.2-5.94-6.2s-5.99,2-5.99,6.2v30.6h-6.05V14.29c0-8.04,4.84-12.62,11.99-12.62s12.09,4.57,12.09,12.62v17.67c0,4.73,1.05,6.78,3.94,6.78s3.94-2.05,3.94-6.78Z",
    "M177.32,1.56c12.09,0,21.87,9.78,21.87,21.87s-9.78,21.87-21.87,21.87-21.82-9.78-21.82-21.87S165.28,1.56,177.32,1.56ZM192.98,23.44c0-8.78-6.73-15.88-15.67-15.88s-15.61,7.1-15.61,15.88,6.68,15.88,15.61,15.88,15.67-7.1,15.67-15.88Z",
    "M216.9,2.41h26.55v6.1h-26.92c-3.89,0-6.2,2.68-6.2,5.99s2.31,5.89,6.2,5.89h14.72c8.04,0,12.46,4.84,12.46,11.93s-4.42,12.14-12.46,12.14h-26.76v-6.36h26.92c3.84,0,6.2-2.42,6.2-5.73s-2.37-5.89-6.2-5.89h-14.51c-8.04,0-12.67-4.84-12.67-11.93s4.63-12.14,12.67-12.14Z",
]
SIMBOLO = "M117.81,14.95c-11.82,0-19.87,7.71-19.87,21.1v28.33c0,6.39-4.29,10.33-9.81,10.33s-9.6-3.94-9.6-10.33v-28.33c0-13.39-8.31-21.1-20.22-21.1s-19.87,7.71-19.87,21.1v28.33c0,6.39-4.29,10.33-9.81,10.33s-9.54-3.94-9.54-10.33v-31.06h-10.59v30.8c0,13.39,8.32,20.75,20.22,20.75s19.87-7.36,19.87-20.75v-28.68c0-6.48,4.29-10.33,9.81-10.33s9.6,3.85,9.6,10.33v28.68c0,13.39,8.32,20.75,20.22,20.75s19.87-7.36,19.87-20.75v-28.68c0-6.48,4.29-10.33,9.81-10.33s9.98,3.85,9.98,10.33v22.51h10.16v-21.9c0-13.39-8.31-21.1-20.22-21.1Z"

ICONS = {
    "home": "M3 10.5 12 3l9 7.5M5 9v12h5v-6h4v6h5V9",
    "orb": "M12 16a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM6 20.5h12M8.2 16.8 7.5 20.5M15.8 16.8l.7 3.7",
    "receipt": "M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6M9 16h3",
    "gift": "M4 11h16v10H4zM3 7h18v4H3zM12 7v14M12 7C10.5 3.5 7 3.2 7 5.2S9.6 7 12 7Zm0 0c1.5-3.5 5-3.8 5-1.8S14.4 7 12 7Z",
    "support": "M4 14v-2a8 8 0 0 1 16 0v2M4 13h3v6H4zM17 13h3v6h-3zM20 19c0 1.5-1.5 2.5-4 2.5h-3",
    "bell": "M6 17v-6a6 6 0 0 1 12 0v6l1.5 2h-15L6 17ZM10 21.5h4",
    "wifi": "M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0M12 19.5v.5",
    "devices": "M3 5h14v9H3zM1.5 17h14M17.5 9h5v11h-5zM19.5 17.5h1",
    "phone": "M7 2.5h10v19H7zM11 18.5h2",
    "laptop": "M4 5h16v11H4zM2 19h20",
    "gamepad": "M7 8h10a4 4 0 0 1 4 4v1.5a3.5 3.5 0 0 1-6.3 2.1L14 15h-4l-.7.6A3.5 3.5 0 0 1 3 13.5V12a4 4 0 0 1 4-4ZM7.5 10.5v3M6 12h3M15.5 11h.5M17.5 13h.5",
    "tv": "M3 6h18v11H3zM8 21h8M9 2l3 4 3-4",
    "tablet": "M5 2.5h14v19H5zM11 18.5h2",
    "speaker": "M7 2.5h10v19H7zM12 16.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 6.5v.5",
    "watch": "M8 6h8v12H8zM9 6l1-3.5h4L15 6M9 18l1 3.5h4l1-3.5M12 9.5V12l1.5 1.5",
    "bulb": "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3Z",
    "check": "M4 12l5 5L20 6",
    "alert": "M12 3 2 20h20L12 3ZM12 10v5M12 17.5v.5",
    "close": "M5 5l14 14M19 5 5 19",
    "back": "M15 4 7 12l8 8",
    "chevR": "M9 5l7 7-7 7",
    "chevD": "M5 9l7 7 7-7",
    "arrowRight": "M4 12h15M13 6l6 6-6 6",
    "eye": "M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    "eyeOff": "M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4 4l16 16",
    "qr": "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM18 18h3v3h-3zM6 6h1v1H6zM17 6h1v1h-1zM6 17h1v1H6z",
    "copy": "M8 8h12v12H8zM4 16V4h12",
    "lock": "M5 10h14v11H5zM8 10V7a4 4 0 0 1 8 0v3M12 14v3",
    "search": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM15.5 15.5 21 21",
    "pin": "M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12ZM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    "box": "M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9ZM3 7.5l9 4.5 9-4.5M12 12v9M7.5 5.2l9 4.5",
    "users": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21a7 7 0 0 1 14 0M15.5 3.3a4 4 0 0 1 0 7.4M22 21a7 7 0 0 0-4-6.3",
    "pulse": "M2 12h5l3-7 4 14 3-7h5",
    "chat": "M4 5h16v11H9l-5 4V5Z",
    "bubble": "M4.5 20.5 6 16.3A8.5 8.5 0 1 1 8.2 18.6l-3.7 1.9ZM9 10.5h6M9 13.5h4",
    "calendar": "M4 5h16v16H4zM4 10h16M8 3v4M16 3v4",
    "send": "M3 20.5 21 12 3 3.5l3 8.5-3 8.5ZM6 12h8",
    "clock": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
    "info": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v6M12 7.5v.5",
    "block": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM5.6 5.6l12.8 12.8",
    "pause": "M8 5v14M16 5v14",
    "bank": "M3 9h18L12 3 3 9ZM5.5 9v9M9.8 9v9M14.2 9v9M18.5 9v9M3 21h18",
    "card": "M2 5h20v14H2zM2 10h20M6 15h4",
    "wallet": "M3 6h17v14H3zM3 6l12-3v3M15 11h6v4h-6z",
}


GOOGLE_FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Red+Hat+Display:wght@400;500&display=swap">'

PWA_HEAD = """<meta name="theme-color" content="#0a0a0a">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Somos">
<meta name="description" content="Prototipo conceptual de la app de Somos para jóvenes que se van a vivir solos. Proyecto de Laboratorio de Prospectiva, Colegiatura Colombiana.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">"""


def b64(p):
    return base64.b64encode((ROOT / "fonts" / p).read_bytes()).decode()


def real_fonts_css():
    return f"""@font-face {{ font-family: "ITC Avant Garde Gothic Pro"; src: url(data:font/otf;base64,{b64('ITCAvantGardePro-Bk.otf')}) format("opentype"); font-weight: 400; font-style: normal; font-display: swap; }}
@font-face {{ font-family: "Silka Mono"; src: url(data:font/otf;base64,{b64('SilkaMono-Regular.otf')}) format("opentype"); font-weight: 400; font-style: normal; font-display: swap; }}
@font-face {{ font-family: "Silka Mono"; src: url(data:font/otf;base64,{b64('SilkaMono-Bold.otf')}) format("opentype"); font-weight: 700; font-style: normal; font-display: swap; }}
"""


def build(real_fonts: bool) -> str:
    css = (SRC / "styles.css").read_text()
    body = (SRC / "body.html").read_text()
    js = "\n".join((SRC / f).read_text() for f in JS_FILES)

    body = body.replace("{{LOGO_PATHS}}", "".join(f'<path d="{d}"/>' for d in LOGO))
    body = body.replace("{{SIMBOLO}}", f'<path d="{SIMBOLO}"/>')

    def icon(m):
        name = m.group(1)
        assert name in ICONS, f"Falta el icono {name}"
        return f'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-{name}"></use></svg>'

    body = re.sub(r"\{\{I:(\w+)\}\}", icon, body)
    used = set(re.findall(r'ic\("(\w+)"', js)) | set(re.findall(r"#i-(\w+)", js)) | set(re.findall(r'icon: "(\w+)"', js))
    missing = sorted(u for u in used if u not in ICONS)
    if missing:
        sys.exit(f"Faltan iconos: {missing}")
    sprite = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' + "".join(
        f'<symbol id="i-{k}" viewBox="0 0 24 24"><path d="{v}"/></symbol>' for k, v in ICONS.items()) + "</defs></svg>"
    js = js.replace("{{LOGO_JSON}}", json.dumps(LOGO))

    fonts_link = "" if real_fonts else GOOGLE_FONTS
    font_faces = real_fonts_css() if real_fonts else ""
    return f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Prototipo App Somos</title>
{PWA_HEAD}
{fonts_link}
<style>
{font_faces}{css}
</style>
</head>
<body>
{sprite}
{body}
<script>
{js}
</script>
</body>
</html>
"""


SW = """// Guarda la app para abrirla sin conexión. La versión cambia con cada build, así el teléfono
// recibe los cambios nuevos la próxima vez que abra la app con internet.
const VERSION = "somos-__V__";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    // Primero la red (para ver la última versión); sin conexión, la copia guardada.
    e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put("index.html", copy)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => {
    if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
    return r;
  })));
});
"""

if __name__ == "__main__":
    html = build(False)
    (ROOT / "index.html").write_text(html)
    version = hashlib.sha1(html.encode()).hexdigest()[:10]
    (ROOT / "sw.js").write_text(SW.replace("__V__", version))
    print("index.html", len(html), "bytes · sw", version)
    if "--fuentes-reales" in sys.argv:
        if not (ROOT / "fonts").exists():
            sys.exit("No encuentro la carpeta fonts/ con las fuentes de marca.")
        (ROOT / "presentacion.html").write_text(build(True))
        print("presentacion.html con fuentes reales")
