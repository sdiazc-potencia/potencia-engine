# Celebrando — Ficha de cliente

- **Nombre**: Celebrando
- **Rubro**: barra y bebidas para eventos (casamientos, corporativos, cumpleaños)
- **Instagram**: `@celebrando` ⚠️ **a confirmar** — el manual no trae el handle
- **Web**: https://www.celebrando.com
- **Contacto del manual**: info@celebrando.com · +54 11 7078 0765
- **Audiencia**: quien organiza el evento — novios/as, wedding planners, responsables de eventos corporativos. Decide con poco tiempo y mucha incertidumbre sobre cantidades.
- **Voz y reglas de contenido**: [prompt_maestro.md](prompt_maestro.md) — leer siempre antes de escribir copy
- **Paleta** (manual oficial): `#2345BD` azul PANTONE 2728C · `#E53E51` rojo PANTONE 710C · blanco — tokens en [design/brand.css](design/brand.css)
- **Tipografía**: Museo Sans (oficial, **licencia no disponible**) → sustituida por **Mulish** 300/500/700/900 + itálica, incrustada en `design/fonts.css`. Titulares SIEMPRE en 900.
- **Estética**: flat, sin degradados ni sombras. Azul dominante, rojo de acento. El recurso gráfico es la estrella fugaz del isotipo: como macro gigante recortado (`.glow`) o como trama repetida (`.glow.trama`). Regla de oro: **nunca todo texto** — cada carrusel lleva un gráfico, dato o comparativa.
- **Mascota**: "Estela", la estrella fugaz hecha personaje (`.mascota`). Acompaña, **nunca reemplaza al logo**. Una sola por pieza, en el slide de cierre.
- **Formato**: carrusel 1080×1350, 6-8 slides
- **Fondos disponibles**: `.slide` (azul, default) · `.slide.claro` (blanco) · `.slide.rojo`. Alternar para que el feed respire: portada azul → interiores claros → cierre rojo.

## Pendientes de alta

- [ ] Confirmar handle de Instagram
- [ ] Validar `prompt_maestro.md` con el cliente (la voz está inferida del manual, no de un brief)
- [ ] Cargar `temas.csv` con el backlog real
- [ ] Drive del equipo (rclone `root_folder_id`) para esta marca
- [ ] Credenciales de publicación (Meta) — se configuran por máquina cuando toque publicar
- [ ] Si consiguen licencia de Museo Sans, reemplazar `design/fonts.css`
