# potencia-engine — Motor de contenido multi-cliente

Sistema de generación de carruseles de Instagram de la agencia potencIA. Separa **el motor** (scripts + skills, genéricos) de **la marca** (una carpeta por cliente).

## Estructura

```
engine/                  ← scripts genéricos (render, subidas, publicación)
clientes/<cliente>/      ← todo lo específico de una marca
├── cliente.md           ← ficha: handle, web, audiencia, paleta, credenciales/IDs
├── prompt_maestro.md    ← voz, tono y reglas de contenido
├── design/              ← brand.css (tokens), fonts.css, patrones/, stickers/, favicons/
├── temas.csv            ← backlog de temas (tipo,horario,tema; # = usado/comentado)
└── posts/<fecha>/<slug>/ ← output generado (HTML + post.json en git; PNG no)
.claude/skills/          ← /post, /ideas, /generar-diario (reciben cliente como parámetro)
```

## Convenciones

- **Resolución de cliente en las skills**: si el argumento empieza con el slug de una carpeta de `clientes/` (ej: `/post potencia: tema...`), ese es el cliente. Si hay un solo cliente, usarlo sin pedir nada. Si hay varios y no se indicó, preguntar.
- **Los comandos de render/subida se corren desde la carpeta del cliente**, con rutas relativas:
  ```
  cd clientes/<cliente> && node ../../engine/renderizar_slides.js --carpeta posts/<fecha>/<slug>
  ```
- Los HTML de slides referencian el design system con `../../../design/...` (relativo a `posts/<fecha>/<slug>/`) — no cambiar esa profundidad de carpetas.
- **Identidad de marca innegociable**: solo colores de la paleta del cliente vía variables CSS de su `brand.css`; partir siempre de sus `design/patrones/`.
- **Nunca publicar en Instagram sin aprobación humana explícita** ("publicalo").
- Credenciales (Cloudinary, Meta, rclone) son **por máquina** (variables de entorno), nunca van al repo.
- Los PNG generados no se commitean (ver `.gitignore`); se comparten por Drive/Cloudinary. Sí se commitean HTML y `post.json`.

## Alta de un cliente nuevo

1. Crear `clientes/<slug>/` copiando la estructura de `clientes/potencia/`.
2. Reemplazar `cliente.md` y `prompt_maestro.md` con la ficha y voz del cliente nuevo.
3. Adaptar `design/brand.css` con la paleta/tipografía de su manual de marca y regenerar los patrones de `design/patrones/` con esos tokens (misma estructura HTML, tokens nuevos).
4. Verificar con un render de prueba: `cd clientes/<slug> && node ../../engine/renderizar_slides.js --carpeta design/patrones --salida design/preview`.
5. Crear su `temas.csv` vacío y, si corresponde, su proyecto en Claude Design.
