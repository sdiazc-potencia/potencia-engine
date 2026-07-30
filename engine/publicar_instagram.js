#!/usr/bin/env node

/**
 * potencIA — Publicador automático en Instagram
 * 
 * Este script toma los posts generados y los programa en Instagram
 * usando la Meta Graph API.
 * 
 * Requisitos:
 *   - META_ACCESS_TOKEN: token de acceso de larga duración
 *   - META_IG_USER_ID: ID del usuario de Instagram Business
 *   - La imagen ya subida a una URL pública (Canva export, S3, etc.)
 * 
 * Uso:
 *   node publicar_instagram.js --archivo posts/2024-01-15/0900_carrusel.json
 *   node publicar_instagram.js --carpeta posts/2024-01-15
 * 
 * NOTA: Instagram requiere que las imágenes estén en una URL pública accesible.
 * Para carruseles, cada slide debe ser una imagen separada.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Config ───────────────────────────────────────────────────────────────────

const IG_USER_ID = process.env.META_IG_USER_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const BASE_URL = `https://graph.facebook.com/v19.0`;

// Horarios en formato 24h Argentina (UTC-3)
const HORARIOS = {
  "9am": "09:00",
  "6pm": "18:00",
};

// ─── Meta Graph API ───────────────────────────────────────────────────────────

async function apiCall(endpoint, method = "GET", body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const data = await res.json();

  if (data.error) {
    throw new Error(`Meta API Error: ${data.error.message} (code: ${data.error.code})`);
  }
  return data;
}

/**
 * Crea un contenedor de media para un post de imagen simple
 */
async function crearContenedorImagen(imageUrl, caption) {
  return await apiCall(`/${IG_USER_ID}/media`, "POST", {
    image_url: imageUrl,
    caption,
    access_token: ACCESS_TOKEN,
  });
}

/**
 * Crea contenedores para cada slide de un carrusel
 */
async function crearContenedoresCarrusel(imageUrls) {
  const contenedores = [];
  for (const url of imageUrls) {
    const res = await apiCall(`/${IG_USER_ID}/media`, "POST", {
      image_url: url,
      is_carousel_item: true,
      access_token: ACCESS_TOKEN,
    });
    contenedores.push(res.id);
    await new Promise((r) => setTimeout(r, 500)); // pausa entre requests
  }
  return contenedores;
}

/**
 * Crea el contenedor del carrusel completo
 */
async function crearCarrusel(childrenIds, caption) {
  return await apiCall(`/${IG_USER_ID}/media`, "POST", {
    media_type: "CAROUSEL",
    children: childrenIds.join(","),
    caption,
    access_token: ACCESS_TOKEN,
  });
}

/**
 * Publica un contenedor ya creado
 */
async function publicarContenedor(containerId) {
  return await apiCall(`/${IG_USER_ID}/media_publish`, "POST", {
    creation_id: containerId,
    access_token: ACCESS_TOKEN,
  });
}

// ─── Lógica principal ─────────────────────────────────────────────────────────

/**
 * Construye el caption completo con hashtags
 */
function construirCaption(data) {
  const hashtags = data.hashtags ? "\n\n" + data.hashtags.join(" ") : "";
  return data.caption + hashtags;
}

/**
 * Publica un post. 
 * 
 * Para carruseles: necesitás pasar las URLs de las imágenes de cada slide.
 * Estas imágenes deben estar exportadas de Canva y subidas a una URL pública.
 * 
 * @param {Object} postData - JSON del post generado
 * @param {string[]} imageUrls - URLs públicas de las imágenes (1 para imagen simple, N para carrusel)
 */
async function publicarPost(postData, imageUrls) {
  const caption = construirCaption(postData);

  console.log(`\n📤 Publicando: [${postData.tipo}] ${postData.tema}`);

  if (postData.tipo === "carrusel" && imageUrls.length > 1) {
    // Carrusel
    console.log(`   Creando ${imageUrls.length} slides...`);
    const childrenIds = await crearContenedoresCarrusel(imageUrls);
    const contenedor = await crearCarrusel(childrenIds, caption);
    const resultado = await publicarContenedor(contenedor.id);
    console.log(`   ✅ Carrusel publicado. ID: ${resultado.id}`);
    return resultado;
  } else {
    // Post de imagen simple
    const contenedor = await crearContenedorImagen(imageUrls[0], caption);
    const resultado = await publicarContenedor(contenedor.id);
    console.log(`   ✅ Post publicado. ID: ${resultado.id}`);
    return resultado;
  }
}

/**
 * Lee un archivo JSON de post y lo publica
 * Las URLs de imágenes deben estar en el JSON bajo "image_urls"
 * (las agregás vos después de exportar de Canva)
 */
async function publicarDesdeArchivo(rutaArchivo) {
  const data = JSON.parse(fs.readFileSync(rutaArchivo, "utf-8"));

  if (!data.image_urls || data.image_urls.length === 0) {
    console.warn(`⚠️  Sin image_urls en ${rutaArchivo}`);
    console.warn(`   Agregá las URLs de las imágenes exportadas de Canva en el JSON.`);
    console.warn(`   Ejemplo: "image_urls": ["https://tu-url/slide1.jpg", ...]`);
    return null;
  }

  return await publicarPost(data, data.image_urls);
}

/**
 * Publica todos los posts de una carpeta que tengan image_urls definidas
 */
async function publicarCarpeta(rutaCarpeta) {
  const archivos = fs
    .readdirSync(rutaCarpeta)
    .filter((f) => f.endsWith(".json") && !f.includes("_legible"))
    .sort();

  console.log(`\n📁 Publicando carpeta: ${rutaCarpeta}`);
  console.log(`   ${archivos.length} posts encontrados\n`);

  for (const archivo of archivos) {
    const ruta = path.join(rutaCarpeta, archivo);
    await publicarDesdeArchivo(ruta);
    await new Promise((r) => setTimeout(r, 2000)); // pausa entre posts
  }
}

// ─── Verificar configuración ──────────────────────────────────────────────────

function verificarConfig() {
  const errores = [];
  if (!ACCESS_TOKEN) errores.push("META_ACCESS_TOKEN");
  if (!IG_USER_ID) errores.push("META_IG_USER_ID");

  if (errores.length > 0) {
    console.error("❌ Faltan variables de entorno:");
    errores.forEach((e) => console.error(`   export ${e}=tu_valor`));
    console.error("\nConsultá: https://developers.facebook.com/docs/instagram-api");
    process.exit(1);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  verificarConfig();

  const args = process.argv.slice(2);

  try {
    if (args.includes("--archivo")) {
      const idx = args.indexOf("--archivo");
      await publicarDesdeArchivo(args[idx + 1]);
    } else if (args.includes("--carpeta")) {
      const idx = args.indexOf("--carpeta");
      await publicarCarpeta(args[idx + 1]);
    } else {
      console.log(`
Uso:
  node publicar_instagram.js --archivo posts/2024-01-15/0900_carrusel.json
  node publicar_instagram.js --carpeta posts/2024-01-15

Antes de publicar, agregá "image_urls" en cada JSON con las URLs
de las imágenes exportadas desde Canva.
      `);
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();
