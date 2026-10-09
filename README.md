# App Somos · prototipo

Prototipo conceptual de una app de **Somos Internet** para jóvenes que se van a vivir solos por primera vez.
Proyecto individual de Samuel Suárez para Laboratorio de Prospectiva, Diseño Estratégico, Colegiatura Colombiana (2026).

> No es la app oficial de Somos. Los datos de usuario, coberturas, beneficios y políticas son de ejemplo o propuestas.
> Los planes y precios (Essential y Pro) vienen de somosinternet.com, Medellín.

## El reto

¿Cómo podríamos lograr que los jóvenes que se independizan elijan a Somos como su primer operador,
aprovechando la desconfianza que generan los operadores tradicionales y lo que diferencia a Somos?

La app trabaja en los tres momentos del planning:

| Resultado | Qué lo mueve en la app |
|---|---|
| Que contraten | Flujo **Me mudo**: cobertura por torre, prueba de los vecinos, oferta sin letra pequeña, contratar solo con la cédula, instalación el día de la mudanza |
| Que se queden | Estado de la red con la lámpara Orb, avisos de fallas antes de que llamen, factura clara, soporte |
| Que recomienden | Código para amigos y roomies, factura dividida con el roomie |

## Verla en el teléfono

1. Abre el link de GitHub Pages del repo en el teléfono.
2. Instálala como app:
   - **iPhone (Safari):** botón Compartir → *Agregar a pantalla de inicio*.
   - **Android (Chrome):** menú ⋮ → *Instalar app* o *Agregar a pantalla principal*.
3. Se abre a pantalla completa y funciona sin conexión. Cuando subes cambios, el teléfono los recibe la próxima vez que abre la app con internet.
4. Si cambia el ícono, el nombre o la barra de estado, borra la app de la pantalla de inicio y agrégala otra vez: el iPhone guarda esa configuración en el momento de instalarla.

### Entradas para pruebas con usuarios

Agrega estas terminaciones al link:

| Link | Qué simula |
|---|---|
| `…/` | Primera vez: apertura y bienvenida |
| `…/#mudanza` | Un QR en el edificio o la inmobiliaria: entra directo a Me mudo |
| `…/#invitado` | El link que te manda un amigo: la bienvenida dice quién te invitó |
| `…/#cliente` | Alguien que ya tiene Somos: entra directo al inicio |

En la pestaña **Ayuda** (o tocando la inicial arriba a la derecha) está el **modo demostración**: simular una falla en la red, el día de la instalación con el técnico en camino, el primer día, quedarse sin conexión, un pago rechazado, volver a la bienvenida y ver la apertura otra vez.

## Lo que se cuidó en la experiencia (v3, oct. 2026)

| Momento | Mejora |
|---|---|
| Antes de contratar | **Comparar apartamentos:** guarda varios edificios y compáralos (cobertura por torre, vecinos con Somos, velocidad medida, precio). |
| | **Estrato según la dirección:** el precio sale con el estrato del edificio y se puede corregir. Si no hay dato, la app dice dónde encontrarlo. |
| | **Megas en la vida diaria:** "¿Cuánto internet necesitas?" recomienda el plan más barato que alcanza. Referencia: Netflix pide 15 MBPS para 4K. |
| Antes de la instalación | **Cambiar la fecha** en dos toques, sin costo hasta un día antes. |
| | **Técnico en camino:** nombre, minutos para llegar, aviso al llegar y pasos de la instalación. |
| El primer día | **Bienvenida en tres pasos:** nombre del Wi‑Fi, compartirlo con el roomie por QR y "Lo que te prometimos" (promesa contra lo medido). |
| | **Primera factura explicada:** línea de tiempo con los 30 días gratis y el cobro de los días del primer mes. |
| El día a día | **Qué avisos recibir:** por tipo y con horario de silencio. |
| | **Prueba real desde el celular** en la pestaña Red, con los servidores de Cloudflare (hasta unos 60 MB). El número grande sigue siendo la medición del Orb. |
| Siempre | **Textos más grandes** (mínimo 12 px en pestañas y 14 px en etiquetas) y estados de **sin conexión** y **pago rechazado**. |

Cambiar la fecha sin costo, el prorrateo de la primera factura y la compensación si no se cumple una promesa son propuestas de este prototipo, no políticas de Somos.

## Cómo mejorarla

Todo el código vive en `src/`:

| Archivo | Qué tiene |
|---|---|
| `src/styles.css` | Estilos y tokens del sistema de diseño Somos |
| `src/body.html` | Las pantallas |
| `src/core.js` | Utilidades, la lámpara Orb, la apertura en acordeón, hojas, avisos y el QR |
| `src/screens.js` | Inicio, Red, Pagos, Para ti, Ayuda, chat y notificaciones |
| `src/mudanza.js` | Bienvenida, flujo Me mudo y estado de cliente nuevo |
| `src/experiencia.js` | Mejoras v3: comparar, megas, cambiar fecha, técnico, primer día, factura, avisos, prueba real y estados de error. Arranca la app |

Después de editar, arma la app y sube los cambios:

```bash
python3 build.py        # genera index.html y sw.js
git add -A && git commit -m "Describe el cambio" && git push
```

GitHub Pages publica `index.html` en uno o dos minutos.

### Fuentes

El manual usa ITC Avant Garde Gothic y Silka Mono, que son de pago, así que no están en este repo.
La versión publicada usa las alternativas gratis que recomienda el mismo manual: **Red Hat Display** y **JetBrains Mono**.
Para presentar con las fuentes reales, pon los archivos en una carpeta `fonts/` (ignorada por git) y corre
`python3 build.py --fuentes-reales`, que genera `presentacion.html`.

## Lo que sabemos de Somos (octubre 2026)

- Se contrata **sin estudio de crédito**.
- La cobertura es **por edificio y hasta por torre**: en un conjunto, una torre puede tener Somos y otra no.
- La instalación **siempre se agenda para una fecha futura**.

### Supuestos por validar

- Que Somos pueda mostrar la velocidad promedio medida por torre o edificio, sin datos personales.
- La recompensa por referidos. En la app: un mes por amigo, hasta 3.
- El descuento automático por fallas largas (más de 4 horas) es una propuesta.

## Decisiones frente al sistema de diseño

- **Movimiento:** el sistema dice que la interfaz no se anima. La app deja el movimiento en los momentos de marca (apertura, lámpara, velocidad, pagar) y respeta *reducir movimiento* del teléfono.
- **Logo:** el manual prohíbe deformarlo. El estiramiento solo pasa en la apertura y siempre termina en la forma exacta.
- **"Somos":** se escribe con mayúscula inicial, como pide la sección de voz del manual.
- **Iconos:** de línea con el lenguaje del sistema (1.5 px, esquinas vivas). Falta cambiarlos por Material Symbols, como pide el manual.
