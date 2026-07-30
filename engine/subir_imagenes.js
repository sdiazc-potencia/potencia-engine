#!/usr/bin/env node

/**
 * potencIA — Subida de slides a Cloudinary
 *
 * Sube todos los PNG de una carpeta de post a Cloudinary (URLs públicas,
 * que es lo que exige la API de Instagram) y escribe "image_urls" en el
 * post.json de esa carpeta, dejándolo listo para publicar_instagram.js.
 *
 * Requiere (variables de entorno):
 *   CLOUDINARY_CLOUD_NAME     → nombre del cloud (dashboard de Cloudinary)
 *   CLOUDINARY_UPLOAD_PRESET  → upload preset UNSIGNED (Settings → Upload)
 *
 * Uso:
 *   node subir_imagenes.js --carpeta posts/2026-07-21/que-automatizar-primero
 */

import fs from "fs";
import path from "path";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

function verificarConfig() {
  const faltan = [];
  if (!CLOUD_NAME) faltan.push("CLOUDINARY_CLOUD_NAME");
  if (!UPLOAD_PRESET) faltan.push("CLOUDINARY_UPLOAD_PRESET");
  if (faltan.length) {
    console.error("❌ Faltan variables de entorno:");
    faltan.forEach((v) => console.error(`   ${v}`));
    console.error("\nVer README → 'Setup de publicación automática'.");
    process.exit(1);
  }
}

async function subirImagen(rutaPng, publicId) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const form = new FormData();
  form.append("file", new Blob([fs.readFileSync(rutaPng)], { type: "image/png" }));
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("public_id", publicId);

  const res = await fetch(url, { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Cloudinary: ${data.error?.message || res.statusText}`);
  }
  return data.secure_url;
}

async function subirCarpeta(carpeta) {
  const dir = path.resolve(carpeta);
  if (!fs.existsSync(dir)) {
    console.error(`❌ No existe la carpeta: ${dir}`);
    process.exit(1);
  }

  const pngs = fs.readdirSync(dir).filter((f) => f.endsWith(".png")).sort();
  if (!pngs.length) {
    console.error(`❌ No hay PNG en ${dir}. ¿Renderizaste las slides?`);
    process.exit(1);
  }

  // slug único para no pisar posts anteriores: fecha + nombre de carpeta
  const partes = dir.split(path.sep);
  const slugPost = partes.slice(-2).join("_").replace(/[^a-zA-Z0-9_-]/g, "-");

  // prefijo por cliente: el segmento que sigue a "clientes" en la ruta (fallback: potencia)
  const idxClientes = partes.lastIndexOf("clientes");
  const prefijo = idxClientes !== -1 && partes[idxClientes + 1] ? partes[idxClientes + 1] : "potencia";

  console.log(`\n☁️  Subiendo ${pngs.length} slides a Cloudinary…\n`);
  const urls = [];
  for (const png of pngs) {
    const publicId = `${prefijo}/${slugPost}/${png.replace(/\.png$/, "")}`;
    const url = await subirImagen(path.join(dir, png), publicId);
    urls.push(url);
    console.log(`  ✓ ${png} → ${url}`);
  }

  // Escribir image_urls en post.json si existe
  const rutaJson = path.join(dir, "post.json");
  if (fs.existsSync(rutaJson)) {
    const data = JSON.parse(fs.readFileSync(rutaJson, "utf-8"));
    data.image_urls = urls;
    fs.writeFileSync(rutaJson, JSON.stringify(data, null, 2), "utf-8");
    console.log(`\n✅ ${urls.length} URLs guardadas en post.json — listo para publicar:`);
    console.log(`   node publicar_instagram.js --archivo ${path.relative(process.cwd(), rutaJson)}\n`);
  } else {
    console.log(`\n⚠️  No hay post.json en la carpeta. URLs subidas:\n${urls.join("\n")}\n`);
  }
  return urls;
}

const args = process.argv.slice(2);
const idx = args.indexOf("--carpeta");
const carpeta = idx !== -1 ? args[idx + 1] : null;

if (!carpeta) {
  console.log(`
Uso:
  node subir_imagenes.js --carpeta posts/<fecha>/<slug>

Sube los PNG a Cloudinary y completa image_urls en post.json.
  `);
  process.exit(0);
}

verificarConfig();
subirCarpeta(carpeta).catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
