---
name: nueva-marca
description: Da de alta una marca/cliente nuevo en el repo — crea la estructura clientes/<slug>/, genera su design system (tokens, tipografía, patrones de slides) a partir del manual de marca, y lo verifica con un render de prueba. Usar cuando el usuario pida sumar, crear u onboardear una marca o cliente nuevo.
---

# /nueva-marca — Alta de un cliente con su design system

Crea todo lo que una marca necesita para producir contenido con `/post`, `/ideas` y `/generar-diario`. Rutas relativas a la raíz del repo `potencia-engine`.

## Paso 0 — Insumos (pedir lo que falte antes de arrancar)

Necesitás del usuario:
1. **Nombre de la marca** y slug para la carpeta (minúsculas, sin espacios — ej: `celebrando`).
2. **Manual de marca** (PDF o imágenes) o, como mínimo: paleta de colores (hex), tipografías, logo/wordmark.
3. **Handle de Instagram**, **web** (si tiene) y **audiencia** (a quién le habla).
4. **Voz**: 3-5 referencias de tono (posts que les gusten, cómo NO hablar, muletillas de la marca). Si hay web, complementá con WebFetch.

No inventes identidad de marca: si falta la paleta o la tipografía, pedilas.

## Paso 1 — Estructura

Creá `clientes/<slug>/` con: `design/fonts/`, `design/patrones/`, `design/preview/`, `contexto/reuniones/`, `posts/`.

## Paso 2 — Ficha y voz

- `cliente.md` — usá `clientes/potencia/cliente.md` como plantilla: nombre, handle, web, audiencia, paleta con hex, tipografía, estética en 1-2 líneas, formato (default 1080×1350, 6-8 slides), y dónde publica.
- `prompt_maestro.md` — la voz: quién habla, a quién, tono, estructura de carrusel (gancho → valor → cierre → CTA), reglas de qué decir y qué no, hashtags de la marca. Basate en el de potencia como estructura, pero el contenido es 100% de la marca nueva. Mostráselo al usuario para validar antes de seguir.

## Paso 3 — Design system

- **Fuentes**: conseguí los woff2 (Google Fonts: descargar los pesos que use la marca) a `design/fonts/` y generá `design/fonts.css` con las fuentes **incrustadas en base64** (mismo enfoque que `clientes/potencia/design/fonts.css` — así los HTML renderizan sin red).
- **`design/brand.css`**: partí del de potencia y reemplazá los tokens (colores, gradientes, efectos de fondo, radios, sombras) por los de la marca nueva. **Regla clave: mantené los MISMOS nombres de clases y componentes** (`.slide`, `.glow` o el efecto de fondo que corresponda, `.kicker`, `.pill`, `.highlight`, `.acento-italic`, `.footer-marca`, `.deslizar`, cards, stats, barras, flujo) — las skills y los patrones dependen de esos nombres; lo que cambia es su estética, no su API.
- **`design/patrones/`**: copiá los 8 patrones de `clientes/potencia/design/patrones/` y reescribilos con la estética y el rubro del cliente (textos demo verosímiles de SU negocio). El link a CSS queda igual (`../fonts.css`, `../brand.css` — ojo: en patrones es un nivel, en posts son tres).

## Paso 4 — Verificación visual (innegociable)

```
cd clientes/<slug> && node ../../engine/renderizar_slides.js --carpeta design/patrones --salida design/preview
```

Leé los PNG generados y verificá: paleta correcta, tipografía cargada (no fallback), nada desbordado, que se sienta la marca y no un reskin de potencia. Iterá hasta que esté bien y mostrale la preview al usuario para aprobación.

## Paso 5 — Cierre

- `temas.csv` con solo una línea comentada de ejemplo: `# tipo,horario,tema`.
- `contexto/README.md`: qué va ahí (resúmenes de reuniones en `reuniones/YYYY-MM-DD-tema.md`, briefs, decisiones vigentes).
- Ofrecé crear el proyecto en Claude Design (generar `design/ds_bundle/` inlineando fonts.css+brand.css en cada patrón y usar DesignSync).
- Commit + push: `alta de marca <nombre>: design system + voz + estructura`.
- Cerrá recordando: las credenciales de publicación (Cloudinary/Meta) de esta marca se configuran por máquina cuando toque publicar.
