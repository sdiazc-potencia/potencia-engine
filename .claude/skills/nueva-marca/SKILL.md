---
name: nueva-marca
description: Da de alta una marca/cliente nuevo en el repo — crea la estructura clientes/<slug>/, genera su design system (tokens, tipografía, patrones de slides, capa web) a partir del manual de marca, y lo verifica con un render de prueba. Usar cuando el usuario pida sumar, crear u onboardear una marca o cliente nuevo.
---

# /nueva-marca — Alta de un cliente con su design system

Crea todo lo que una marca necesita para producir contenido con `/post`, `/ideas` y
`/generar-diario`, **y para armarle una web o landing**. Rutas relativas a la raíz del
repo `potencia-engine`.

## Paso 0 — Insumos (pedir lo que falte antes de arrancar)

Necesitás del usuario:
1. **Nombre de la marca** y slug para la carpeta (minúsculas, sin espacios — ej: `celebrando`).
2. **Manual de marca** (PDF o imágenes) o, como mínimo: paleta de colores (hex), tipografías, logo/wordmark.
3. **Handle de Instagram**, **web** (si tiene) y **audiencia** (a quién le habla).
4. **Voz**: 3-5 referencias de tono (posts que les gusten, cómo NO hablar, muletillas de la marca). Si hay web, complementá con WebFetch.

No inventes identidad de marca: si falta la paleta o la tipografía, pedilas.
Lo que no sepas va como pendiente explícito en `cliente.md`, nunca inventado.

**Si el manual es un PDF**: extraé los vectores del logo/isotipo con PyMuPDF
(`page.get_drawings()` → path SVG) en vez de rasterizar. Quedan como archivos madre
en `design/marca/`. Nunca redibujar ni escanear.

## Paso 1 — Estructura

Creá `clientes/<slug>/` con: `design/fonts/`, `design/marca/`, `design/patrones/`,
`design/preview/`, `contexto/reuniones/`, `posts/`.

## Paso 2 — Ficha y voz

- `cliente.md` — usá `clientes/celebrando/cliente.md` como plantilla: nombre, rubro, handle,
  web, audiencia, paleta con hex y Pantone, tipografía, estética en 1-2 líneas, formato
  (default 1080×1350, 6-8 slides), variantes de fondo disponibles, y una sección
  **"Pendientes de alta"** con lo que quedó sin confirmar.
- `prompt_maestro.md` — la voz: quién habla, a quién, tono, estructura de carrusel
  (gancho → valor → cierre → CTA), reglas de qué decir y qué no, hashtags.
  Si lo inferiste del manual y no de un brief, **marcalo como borrador arriba de todo**.
  Mostráselo al usuario para validar antes de seguir.

## Paso 3 — Design system

**Fuentes** — conseguí los woff2 (Google Fonts) a `design/fonts/` y generá `design/fonts.css`
con las fuentes **incrustadas en base64**, solo el subset `latin`, así los HTML renderizan sin red.
Si la tipografía oficial no es libre, elegí la sustituta más cercana y dejalo escrito en el
encabezado del archivo y en `cliente.md`.

**`design/brand.css`** (slides) — partí del de otra marca y reemplazá los tokens por los
de la marca nueva.

> **Regla clave: mantené los MISMOS nombres de clases y tokens** (`.slide`, `.glow`,
> `.wordmark`, `.kicker`, `.pill`, `.highlight`, `.acento`, `.footer-marca`, `.deslizar`,
> `.card`, `.stat`, `.barras`, `.comparativa`, `.flujo`, `.contador`; y `--color-fondo`,
> `--color-texto`, `--color-acento`, `--texto-gancho`, `--pad`, `--radio`…).
> Las skills y los patrones dependen de esos nombres: entre marcas cambia la estética,
> no la API. Agregar modificadores nuevos está bien; renombrar lo existente, no.

Dos recursos que conviene resolver con tokens:
- **Logo y mascota como data-URI** en `:root` (ver `clientes/celebrando/design/brand.css`).
  Así `.wordmark` funciona a cualquier profundidad de carpeta, sin rutas relativas rotas.
- **Variantes de fondo** (`.slide.claro`, `.slide.rojo`…) que **redefinen los tokens
  semánticos**. Así `.acento`, `.card` y `.pill` se ven bien en cualquier fondo sin tocar el HTML.

**`design/web.css`** (webs y landings) — segunda capa con los mismos tokens pero componentes
de sitio: `.contenedor`, `.seccion`, `.grid`, `.btn`, `.nav`, `.hero`, `.tarjeta`, `.chip`,
`.campo`, `.pie`. Responsive, con `:focus-visible` y `prefers-reduced-motion`.
Usá nombres que **no choquen** con los de `brand.css` (`.tarjeta` y no `.card`), para que
se puedan cargar juntos. Copiá `clientes/celebrando/design/web.css` como base.

**`design/patrones/`** — copiá los 8 patrones de otra marca y reescribilos con la estética
y el rubro del cliente (textos demo verosímiles de SU negocio, no lorem). El link a CSS
queda igual (`../fonts.css`, `../brand.css` — en patrones es un nivel, en posts son tres).

**`design/web-demo.html`** — una página de ejemplo que ejercita `web.css` con contenido real
del cliente. Sirve de verificación y de punto de partida para la landing.

## Paso 4 — Verificación visual (innegociable)

```
cd clientes/<slug> && node ../../engine/renderizar_slides.js --carpeta design/patrones --salida design/preview
```

**Leé los PNG generados** y verificá:
- Paleta correcta y tipografía cargada (que no haya caído al fallback del sistema).
- Nada desbordado ni tapado; los fondos decorativos no compiten con el texto.
- **Tildes y eñes**: si generaste los HTML desde un script, revisá que no se hayan comido
  los acentos. "menu", "mas", "calculo" en vez de "menú", "más", "cálculo" es el error
  más común y se ve en el render.
- Que se sienta la marca y no un reskin de otra.

Después, la capa web:

```
npx playwright screenshot --viewport-size=1280,900 --full-page clientes/<slug>/design/web-demo.html web.png
```

Revisá **colisiones de cascada**, que es donde más se rompe: un botón que queda del color
del fondo, texto gris sobre fondo de color, un `.grid` que da 3 columnas donde querías 2.
Regla práctica: si una regla pinta enlaces sobre fondo de color, excluí los botones
(`a:not(.btn)`), o el botón hereda el color equivocado.

Iterá hasta que esté bien y mostrale la preview al usuario para aprobación.

## Paso 5 — Showcase para el equipo

Publicá un Artifact con el design system del cliente: marca y versiones, paleta con Pantone,
tipografía, recursos gráficos, mascota si tiene, y las plantillas de posteo.

Es la superficie **no técnica** del sistema: el link que abren Cata, Lola, Delfi y Titi
desde el celular cuando dudan qué color o qué tipografía va. El repo es para el motor;
el link es para el equipo. Guardá la URL en `cliente.md`.

## Paso 6 — Cierre

- `temas.csv` con solo una línea comentada de ejemplo: `# tipo,horario,tema`.
- `contexto/README.md`: qué va ahí (resúmenes de reuniones en `reuniones/YYYY-MM-DD-tema.md`,
  briefs, decisiones vigentes) y la regla de que lo más reciente manda sobre el prompt maestro.
- Ofrecé crear el proyecto en Claude Design (generar `design/ds_bundle/` inlineando
  fonts.css+brand.css en cada patrón y usar DesignSync).
- Commit + push: `alta de marca <nombre>: design system + voz + estructura`.
- Cerrá recordando: las credenciales de publicación (Cloudinary/Meta) de esta marca se
  configuran por máquina cuando toque publicar.
