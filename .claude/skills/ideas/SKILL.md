---
name: ideas
description: Propone ideas de posteos de Instagram para un cliente de la agencia optimizadas para que la gente guarde, comparta, comente o para construir autoridad — basadas en la web del cliente y su propuesta de valor. Usar cuando el usuario pida ideas, sugerencias o un plan de contenido.
---

# /ideas — Banco de ideas de contenido

Generá ideas de posteos de Instagram para un cliente de la agencia. Rutas relativas a la raíz del repo `potencia-engine`.

## Paso 0 — Resolver el cliente

- Si el argumento nombra el slug de una carpeta de `clientes/` (ej: `potencia: ideas sobre agentes`), ese es el cliente.
- Si hay una sola carpeta en `clientes/`, usala sin preguntar.
- Si hay varias y no se indicó, preguntá cuál.

Si el usuario pasó además un foco (ej: "ideas sobre agentes de WhatsApp"), respetalo; si no, cubrí un mix de los servicios del cliente. `<C>` = `clientes/<cliente>`.

## Paso 1 — Contexto

- Leé `<C>/cliente.md` y `<C>/prompt_maestro.md` (voz, audiencia, servicios).
- Traé la web oficial del cliente (URL en `cliente.md`) con WebFetch — extraé servicios, propuestas, diferenciales y casos que se puedan convertir en contenido.
- Leé `<C>/temas.csv` y, si existe, mirá los slugs en `<C>/posts/` para **no repetir temas ya usados**.

## Paso 2 — Generar ideas

Proponé **10 a 12 ideas**, clasificadas por objetivo (2-3 por objetivo):

- 💾 **Para guardar** — contenido de utilidad inmediata: checklists, pasos, prompts listos, "hacelo vos mismo". El lector lo guarda porque lo va a necesitar.
- 📤 **Para compartir** — verdades incómodas del mercado, datos que sorprenden, humor de identificación con la audiencia del cliente.
- 💬 **Para comentar** — preguntas polarizantes, "equipo A o equipo B", errores comunes que invitan a confesarse.
- 🏆 **Para autoridad** — behind the scenes, resultados con números, opiniones firmes del rubro, desmitificaciones.

Para cada idea entregá:
1. **Hook** (el texto de la portada, máx. 12 palabras, en la voz de la marca)
2. **Formato**: carrusel / cita / tip / caso — y qué elemento visual llevaría (gráfico de barras, flujo, comparativa, dato gigante, lista de cards)
3. **Esqueleto**: 1 línea por slide o sección
4. **Por qué funciona**: 1 línea sobre el disparador psicológico (utilidad, identificación, controversia, prueba social)

## Paso 3 — Cierre

Presentá las ideas en una lista clara y preguntale al usuario cuál quiere producir. Si elige una, ejecutá el flujo de la skill `post` con ese tema y ese cliente (podés invocarla directamente). Ofrecé también agregar las elegidas a `<C>/temas.csv` como backlog.
