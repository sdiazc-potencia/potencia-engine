#!/usr/bin/env node

/**
 * potencIA — Subida de un post a Google Drive (carpeta compartida del equipo)
 *
 * Sube los PNG + post.json de una carpeta de post a la carpeta de Drive
 * del equipo, en una subcarpeta con el nombre <fecha>-<slug>.
 *
 * Requiere rclone configurado UNA VEZ con el remote "gdrive" apuntando a la
 * carpeta compartida (ver README → 'Subida a Google Drive').
 *
 * Uso:
 *   node subir_drive.js --carpeta posts/2026-07-28/agente-whatsapp-califica-leads
 */

import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const idx = args.indexOf("--carpeta");
const carpeta = idx !== -1 ? args[idx + 1] : null;

if (!carpeta) {
  console.log("Uso: node subir_drive.js --carpeta posts/<fecha>/<slug>");
  process.exit(0);
}

const dir = path.resolve(carpeta);
if (!fs.existsSync(dir)) {
  console.error(`❌ No existe la carpeta: ${dir}`);
  process.exit(1);
}

// Localizar rclone (PATH o instalación de winget)
function encontrarRclone() {
  const candidatos = [
    "rclone",
    path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Links", "rclone.exe"),
    path.join(
      process.env.LOCALAPPDATA || "",
      "Microsoft", "WinGet", "Packages",
      "Rclone.Rclone_Microsoft.Winget.Source_8wekyb3d8bbwe",
      "rclone-v1.74.4-windows-amd64", "rclone.exe"
    ),
  ];
  for (const c of candidatos) {
    try {
      execFileSync(c, ["version"], { stdio: "ignore" });
      return c;
    } catch { /* probar el siguiente */ }
  }
  return null;
}

const RCLONE = encontrarRclone();
if (!RCLONE) {
  console.error("❌ rclone no está disponible. Instalalo con: winget install Rclone.Rclone");
  process.exit(1);
}

// Verificar que el remote gdrive esté configurado
const remotes = execFileSync(RCLONE, ["listremotes"], { encoding: "utf-8" });
if (!remotes.includes("gdrive:")) {
  console.error("❌ Falta configurar el remote de Drive (una sola vez). Corré:");
  console.error('   rclone config create gdrive drive scope=drive root_folder_id=1Mc-9Y2cvZ22lNY1IpXMHD9UNgfVatYOH');
  console.error("   (se abre el navegador para autorizar tu cuenta de Google)");
  process.exit(1);
}

// Nombre de la subcarpeta en Drive: <fecha>-<slug>
const partes = dir.split(path.sep);
const destino = partes.slice(-2).join("-");

console.log(`\n📤 Subiendo a Drive → ${destino}\n`);
execFileSync(
  RCLONE,
  ["copy", dir, `gdrive:${destino}`, "--include", "*.png", "--include", "post.json", "--progress"],
  { stdio: "inherit" }
);
console.log(`\n✅ Subido a la carpeta del equipo en Drive: ${destino}\n`);
