# potencia-engine

Motor de contenido de Instagram de **potencIA**: genera carruseles completos (copy con la voz de la marca + slides con design system + PNG 1080×1350) desde Claude Code, para la marca propia y para clientes de la agencia.

## Setup (una vez por persona)

1. Cloná el repo y entrá a la carpeta:
   ```bash
   git clone <URL-del-repo> && cd potencia-engine
   npm install
   ```
2. Abrí **Claude Code** en esta carpeta. Las skills (`/post`, `/ideas`, `/generar-diario`) se cargan solas porque viven en `.claude/skills/` del repo.
3. Requisitos de la máquina: Node 20+, Chrome o Edge instalado (el render los usa; no descarga navegador).

## Uso diario

```
/ideas                                  ← 10-12 ideas de posteos por objetivo
/post <tema>                            ← carrusel completo del único/primer cliente
/post <cliente>: <tema>                 ← carrusel para un cliente específico
/generar-diario                         ← toma el próximo tema de temas.csv y genera todo
```

El output queda en `clientes/<cliente>/posts/<fecha>/<slug>/` (HTML + PNG + `post.json` con caption y hashtags). **Nada se publica sin aprobación humana.**

## Estructura

- `engine/` — scripts genéricos: `renderizar_slides.js` (HTML→PNG), `subir_imagenes.js` (Cloudinary), `subir_drive.js` (Drive del equipo vía rclone), `publicar_instagram.js` (Meta Graph API).
- `clientes/<cliente>/` — todo lo de una marca: `cliente.md` (ficha), `prompt_maestro.md` (voz), `design/` (tokens, fuentes, patrones, stickers), `temas.csv` (backlog), `posts/` (output).
- `.claude/skills/` — las skills que orquestan todo.

Convenciones completas para Claude: ver [CLAUDE.md](CLAUDE.md). Alta de cliente nuevo: también en CLAUDE.md.

## Credenciales (por máquina, nunca al repo)

Solo hacen falta para subir/publicar; generar contenido funciona sin nada de esto.

```powershell
# Cloudinary (hosting público de imágenes, requisito de la API de Instagram)
[Environment]::SetEnvironmentVariable("CLOUDINARY_CLOUD_NAME", "...", "User")
[Environment]::SetEnvironmentVariable("CLOUDINARY_UPLOAD_PRESET", "...", "User")

# Meta / Instagram (publicación; token vence cada 60 días)
[Environment]::SetEnvironmentVariable("META_ACCESS_TOKEN", "...", "User")
[Environment]::SetEnvironmentVariable("META_IG_USER_ID", "...", "User")
```

Drive del equipo (una vez): `winget install Rclone.Rclone` y después

```bash
rclone config create gdrive drive scope=drive root_folder_id=1Mc-9Y2cvZ22lNY1IpXMHD9UNgfVatYOH
```

(Guía completa de cómo obtener cada credencial: pedírsela a Claude o ver el historial del equipo.)

## Rutina automática

La tarea programada **carrusel-diario-potencia** (L-V 7 AM, en la máquina de Santi) corre `/generar-diario`: toma el próximo tema de `clientes/potencia/temas.csv`, genera el carrusel, sube a Cloudinary/Drive y deja el resumen esperando el "publicalo" humano.
