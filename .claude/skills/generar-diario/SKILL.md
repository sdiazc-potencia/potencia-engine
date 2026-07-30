---
name: generar-diario
description: Rutina diaria de contenido - toma el proximo tema de la cola del cliente (temas.csv), genera el carrusel completo con /post, sube las imagenes a Cloudinary/Drive y deja todo listo para aprobar y publicar. NO publica sin aprobacion humana. Usar cuando lo invoque la tarea programada de la manana o el usuario pida "generar el post de hoy".
---

# /generar-diario — Rutina de generación con aprobación

Rutina autónoma: genera todo, **no publica nada** sin aprobación explícita del usuario.

Rutas relativas a la raíz del repo `potencia-engine`. Cliente: el indicado en los argumentos; si no hay argumento, `potencia`. `<C>` = `clientes/<cliente>`.

## Paso 1 — Tomar el próximo tema de la cola

- Leé `<C>/temas.csv`. La cola son las líneas que NO empiezan con `#`.
- Tomá la **primera** línea activa (formato `tipo,horario,tema`).
- Si no hay ninguna: reportá "📭 Cola vacía — no se generó post hoy. Corré /ideas para recargar temas." y terminá ahí (no inventes un tema).

## Paso 2 — Generar el carrusel

Ejecutá el flujo completo de la skill `post` con ese tema y ese cliente (contexto de marca, copy, slides HTML con visuales, render, **verificación visual leyendo los PNG**, `post.json`). Mismas reglas de calidad: solo paleta del cliente, no todo texto, no inventar datos.

Si el tipo del tema es `cita`, `tip` o `caso`, adaptá el formato (una sola imagen o carrusel corto) pero mantené el mismo pipeline.

## Paso 3 — Subir las imágenes (si hay credenciales)

Verificá si están definidas `CLOUDINARY_CLOUD_NAME` y `CLOUDINARY_UPLOAD_PRESET` (PowerShell: `$env:CLOUDINARY_CLOUD_NAME`). Si están:

```
cd clientes/<cliente> && node ../../engine/subir_imagenes.js --carpeta posts/<fecha>/<slug>
```

Esto completa `image_urls` en `post.json`. Si no están, seguí igual y marcá en el resumen que la subida quedó pendiente.

## Paso 3b — Subir a la carpeta de Drive del equipo

```
cd clientes/<cliente> && node ../../engine/subir_drive.js --carpeta posts/<fecha>/<slug>
```

Sube los PNG + post.json a la carpeta compartida del equipo en Google Drive (subcarpeta `<fecha>-<slug>`), vía rclone. Si el script falla porque falta el remote `gdrive`, no es un error de la rutina: marcá en el resumen que Drive quedó pendiente de autorización (el comando de setup está en el README) y seguí.

## Paso 4 — Marcar el tema como usado

Editá `<C>/temas.csv`: comentá la línea usada anteponiendo `# [generado <fecha>] `. No la borres (queda como historial).

## Paso 5 — Resumen para aprobación (SIEMPRE, es el final)

Terminá SIEMPRE con este resumen y **sin publicar**:

- 📋 Tema generado y cantidad de slides
- 📁 Ruta de la carpeta con los PNG (formato clickeable)
- 📝 El caption completo listo para copiar
- ☁️ Estado de la subida a Cloudinary (URLs listas / pendiente de credenciales)
- 📂 Estado de la subida a Drive (subcarpeta creada / pendiente de autorización)
- ✅ Cómo aprobar: "Para publicarlo, decime **publicalo** — o corré: `node ../../engine/publicar_instagram.js --archivo posts/<fecha>/<slug>/post.json` desde `clientes/<cliente>`"
- Cuántos temas quedan en la cola (si quedan ≤2, sugerí correr /ideas)

## Si el usuario aprueba ("publicalo")

Solo ante aprobación explícita en el chat:
1. Verificá que `post.json` tenga `image_urls` completas (si no, corré la subida primero).
2. Verificá `META_ACCESS_TOKEN` y `META_IG_USER_ID`. Si faltan, explicá qué falta (README → Credenciales).
3. `cd clientes/<cliente> && node ../../engine/publicar_instagram.js --archivo posts/<fecha>/<slug>/post.json`
4. Reportá el ID de publicación o el error textual.
