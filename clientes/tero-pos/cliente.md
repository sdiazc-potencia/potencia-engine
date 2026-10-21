# Tero POS — Ficha de cliente

- **Producto**: Tero POS — punto de venta para comercios de mostrador
- **Empresa**: Terominds
- **Rubro**: software SaaS + hardware financiado (POS)
- **Instagram**: ⚠️ **a confirmar** — no figura en el sitio
- **Web**: https://pos.terominds.com
- **Contacto**: hola@terominds.com
- **Audiencia**: dueños de kioscos, cafeterías y comercios que venden por unidad. Gente que atiende el mostrador todos los días y no quiere que la administración le coma la tarde.
- **Voz y reglas de contenido**: [prompt_maestro.md](prompt_maestro.md) — leer siempre antes de escribir copy

## Identidad

El design system **no se inventó**: los tokens salieron medidos del sitio en producción
(stack Tailwind + shadcn). Si el sitio cambia, esto se vuelve a medir.

- **Paleta**: `#2B6945` verde marca (el del logo) · `#1A4732` verde oscuro (titulares y fondos invertidos) · `#F2C98C` arena (acento) · `#F8F5F1` crema (fondo) · `#172531` tinta (texto). Tokens en [design/brand.css](design/brand.css).
- **Tipografía**: **Inter** 400/600/700, con tracking muy apretado en titulares (`-0.055em`). Es un rasgo fuerte del sitio, no un detalle.
- **El gesto de la marca**: **una palabra del titular va en Source Serif 4 itálica** (`.acento-italic`). "Todo *incluido*." / "Nosotros, *Tero*." Una sola vez por slide — si se repite, deja de ser un gesto y se vuelve ruido.
- **Estética**: clara, aireada, mucho aire alrededor del texto. Sin grano, sin sombras duras, sin degradados fuertes. El fondo lleva a lo sumo un degradado orgánico muy suave.
- **Iconografía del producto**: [Lucide](https://lucide.dev) (es la que usa el sitio).
- **Formato**: carrusel 1080×1350, 6-8 slides.
- **Fondos**: `.slide` (crema, default) · `.slide.verde` (verde oscuro) · `.slide.marca` (verde del logo) · `.slide.arena`. Alternar para que el feed respire.

## El logo — no se modifica

El archivo oficial es [design/marca/tero.svg](design/marca/tero.svg), bajado de
`pos.terominds.com/tero.svg`. Es idéntico al que pasó el cliente (verificado:
diferencia de 0,4/255 contra el JPG original).

Reglas de uso:
- **No se recolorea, no se redibuja, no se recorta el ave, no se cambian proporciones.** Se usa el archivo tal cual.
- El badge **siempre con esquinas redondeadas al ~26% de su lado** (es como lo presenta el sitio: 8px sobre 30px). En `brand.css` ya viene así.
- **Sobre verde marca el badge se pierde** (es el mismo verde). En ese caso lleva respaldo crema — ya resuelto en `.slide.marca .badge`. Nunca se resuelve aclarando el logo.
- El lockup es badge + "POS Terominds" en Inter 700. Clase `.wordmark`.
- Tamaño mínimo del badge: 44px de lado. Más chico que eso, el ave no se lee.

## Hallazgos sobre el sitio (para pasarle al cliente)

1. **`--font-serif` declara "Source Serif 4" pero el sitio no la carga**, así que la itálica del h1 cae a Georgia. Se ven distintas. Conviene cargarla para que el gesto de marca sea consistente entre web y contenido.
2. **Dos verdes oscuros conviviendo**: el token `--primary` dice `#1A4732`, pero los titulares y las secciones oscuras renderizan `#193E31`. La diferencia es imperceptible pero son dos valores. Conviene unificar en el token.

## Pendientes de alta

- [ ] Handle de Instagram
- [ ] Validar `prompt_maestro.md` con el cliente (la voz está derivada del sitio, no de un brief)
- [ ] Cargar `temas.csv` con el backlog real
- [ ] Drive del equipo (rclone `root_folder_id`) para esta marca
- [ ] Credenciales de publicación (Meta) — se configuran por máquina cuando toque publicar
