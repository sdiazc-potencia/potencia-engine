---
name: post
description: Genera un posteo completo de Instagram para un cliente de la agencia a partir de un tema — copy con la voz de la marca, slides HTML con gráficos y visualizaciones del design system del cliente, y render a PNG 1080×1350 listos para publicar. Usar cuando el usuario pida crear un post, carrusel o contenido de Instagram.
---

# /post — Generador de carruseles multi-cliente

Genera un carrusel de Instagram completo a partir del tema que pasa el usuario en los argumentos. Si no pasó tema, pedíselo antes de arrancar.

Todas las rutas son relativas a la raíz del repo `potencia-engine`.

## Paso 0 — Resolver el cliente

- Si el argumento empieza con el slug de una carpeta de `clientes/` (ej: `potencia: 5 automatizaciones...`), ese es el cliente y el resto es el tema.
- Si hay **una sola** carpeta en `clientes/`, usala sin preguntar.
- Si hay varias y no se indicó, preguntá cuál.

En adelante, `<C>` = `clientes/<cliente>`.

## Paso 1 — Contexto

Leé (si no los tenés ya en contexto):
- `<C>/cliente.md` — ficha del cliente: handle de Instagram, web, audiencia, paleta, formato.
- `<C>/prompt_maestro.md` — la voz, tono y reglas de contenido de la marca. **Respetalo siempre.**
- `<C>/design/brand.css` — tokens y componentes disponibles.
- 2 o 3 archivos de `<C>/design/patrones/` — patrones de referencia de slides.

## Paso 2 — Copy del carrusel

Escribí el contenido siguiendo el prompt maestro (estructura de carrusel educativo: gancho → valor → cierre → CTA suave), entre 6 y 8 slides. Además del texto, decidí **qué elemento visual lleva cada slide**. Regla de oro: **no puede ser todo texto** — al menos la mitad de las slides llevan un elemento visual protagonista. Patrones disponibles (nombres estándar en `<C>/design/patrones/`):

- `02-lista-cards.html` — lista numerada de cards con icono, subtítulo y número
- `03-dato.html` — número gigante con gradiente (stat) para un dato que impacte
- `04-grafico-barras.html` — barras horizontales comparativas (datos plausibles y honestos)
- `05-comparativa.html` — dos paneles antes/después (✕ vs ✓)
- `06-flujo.html` — diagrama de pasos conectados (ideal para "cómo funciona")

## Paso 3 — Slides HTML

Creá la carpeta `<C>/posts/<YYYY-MM-DD>/<slug-del-tema>/` y escribí un `.html` por slide, numerados `01-portada.html`, `02-...html`, etc.

Reglas de diseño (innegociables — es la identidad de marca del cliente):
- Cada slide arranca de la estructura de los patrones: `<link rel="stylesheet" href="../../../design/fonts.css">` y `.../brand.css` (la profundidad `../../../` es fija: posts/fecha/slug/ → design/), `<div class="slide">` con los efectos de fondo del design system (para potencia: `.glow` — variantes normal, `calido`, `sutil` — variá entre slides).
- **Solo colores de la paleta del cliente vía variables CSS de su `brand.css`.** Nada de colores nuevos.
- Solo la tipografía cargada en su `fonts.css`.
- Portada: gancho grande (máx. 12 palabras) con una palabra destacada según los componentes del brand.css (para potencia: `.acento-italic` o `.highlight`), tag arriba a la derecha, "deslizá →" o gancho de continuidad abajo, y si suma, un mini elemento visual. El handle de Instagram sale de `cliente.md`.
- Slides intermedias: `.kicker` con numeración `0X / 0N — sección` arriba.
- Cierre de cada slide: el wordmark de la marca (para potencia: `potenc<span class="ia">IA</span>`; footer-marca centrado solo si sobra espacio; si la slide es densa, wordmark chico abajo a la izquierda + `.deslizar` a la derecha).
- Última slide: CTA con `.pill llena` y una línea que invite a guardar/comentar.
- Cuidado con el desborde vertical: el lienzo es fijo (1080×1350). Si una slide tiene 4+ cards o mucho texto, compactá paddings/gaps en línea. `.footer-marca` es absoluto: no lo uses en slides llenas.

## Paso 4 — Render y verificación visual

```
cd clientes/<cliente> && node ../../engine/renderizar_slides.js --carpeta posts/<fecha>/<slug>
```

Después **leé los PNG generados** (herramienta Read) y verificá: que nada se superponga ni desborde, que los contrastes se lean, que ninguna slide haya quedado vacía a medias. Si algo está mal, corregí el HTML y volvé a renderizar. No des por terminado sin esta verificación.

## Paso 5 — Caption y metadata

En la misma carpeta guardá `post.json` con el formato que consume `engine/publicar_instagram.js`:

```json
{
  "tema": "...",
  "tipo": "carrusel",
  "horario": "9am",
  "slides": ["texto slide 1", "..."],
  "caption": "...",
  "hashtags": ["#...", "..."],
  "image_urls": []
}
```

Caption según prompt maestro: gancho en las 2 primeras líneas, desarrollo, CTA, 5-8 hashtags de la marca.

## Paso 6 — Entrega

Mostrale al usuario: ruta de la carpeta, las slides renderizadas (mencioná que puede abrir los PNG), el caption listo para copiar y los hashtags. Recordale que para publicar automático necesita subir los PNG a una URL pública y completar `image_urls`, o subirlos a mano desde el teléfono.
