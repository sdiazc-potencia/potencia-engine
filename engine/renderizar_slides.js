#!/usr/bin/env node

/**
 * potencIA — Renderizador de slides HTML → PNG (1080×1350)
 *
 * Toma una carpeta con slides .html (autocontenidas, usando design/brand.css
 * y design/fonts.css) y genera un PNG por slide, listo para Instagram.
 *
 * Uso:
 *   node renderizar_slides.js --carpeta posts/2026-07-14/mi-post
 *   node renderizar_slides.js --carpeta design/patrones --salida design/preview
 *
 * Los .html se renderizan en orden alfabético (nombrarlos 01-..., 02-...).
 * No descarga ningún navegador: usa el Chrome/Edge instalado en Windows.
 */

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";
import { pathToFileURL, fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ANCHO_DEFAULT = 1080;
const ALTO_DEFAULT = 1350;

function encontrarNavegador() {
  if (process.env.POTENCIA_BROWSER && fs.existsSync(process.env.POTENCIA_BROWSER)) {
    return process.env.POTENCIA_BROWSER;
  }
  const candidatos = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  const encontrado = candidatos.find((c) => c && fs.existsSync(c));
  if (!encontrado) {
    console.error("❌ No encontré Chrome ni Edge. Definí POTENCIA_BROWSER con la ruta al ejecutable.");
    process.exit(1);
  }
  return encontrado;
}

async function renderizarCarpeta(carpeta, salida, opciones = {}) {
  const ANCHO = opciones.ancho || ANCHO_DEFAULT;
  const ALTO = opciones.alto || ALTO_DEFAULT;
  const TRANSPARENTE = !!opciones.transparente;
  const dirEntrada = path.resolve(carpeta);
  const dirSalida = path.resolve(salida || dirEntrada);

  if (!fs.existsSync(dirEntrada)) {
    console.error(`❌ No existe la carpeta: ${dirEntrada}`);
    process.exit(1);
  }
  if (!fs.existsSync(dirSalida)) fs.mkdirSync(dirSalida, { recursive: true });

  const slides = fs
    .readdirSync(dirEntrada)
    .filter((f) => f.endsWith(".html"))
    .sort();

  if (slides.length === 0) {
    console.error(`❌ No hay archivos .html en ${dirEntrada}`);
    process.exit(1);
  }

  console.log(`\n🖼  Renderizando ${slides.length} slides de ${dirEntrada}\n`);

  const browser = await puppeteer.launch({
    executablePath: encontrarNavegador(),
    headless: "new",
    args: ["--no-sandbox", "--force-device-scale-factor=1", "--hide-scrollbars"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: ANCHO, height: ALTO, deviceScaleFactor: 1 });

    const generados = [];
    for (const slide of slides) {
      const url = pathToFileURL(path.join(dirEntrada, slide)).href;
      await page.goto(url, { waitUntil: "networkidle0" });
      await page.evaluate(() => document.fonts.ready);

      const nombrePng = slide.replace(/\.html$/, ".png");
      const rutaPng = path.join(dirSalida, nombrePng);
      await page.screenshot({
        path: rutaPng,
        omitBackground: TRANSPARENTE,
        clip: { x: 0, y: 0, width: ANCHO, height: ALTO },
      });
      generados.push(rutaPng);
      console.log(`  ✓ ${nombrePng}`);
    }

    console.log(`\n✅ ${generados.length} imágenes en: ${dirSalida}\n`);
    return generados;
  } finally {
    await browser.close();
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function leerArg(nombre) {
  const idx = args.indexOf(nombre);
  return idx !== -1 ? args[idx + 1] : null;
}

const carpeta = leerArg("--carpeta");
const salida = leerArg("--salida");
const opciones = {
  ancho: parseInt(leerArg("--ancho"), 10) || undefined,
  alto: parseInt(leerArg("--alto"), 10) || undefined,
  transparente: args.includes("--transparente"),
};

if (!carpeta) {
  console.log(`
Uso:
  node renderizar_slides.js --carpeta <carpeta-con-html> [--salida <carpeta-png>]
                            [--ancho 1024 --alto 1024] [--transparente]

Ejemplos:
  node renderizar_slides.js --carpeta posts/2026-07-14/mi-post
  node renderizar_slides.js --carpeta design/patrones --salida design/preview
  node renderizar_slides.js --carpeta design/stickers --ancho 1024 --alto 1024 --transparente
  `);
  process.exit(0);
}

renderizarCarpeta(carpeta, salida, opciones).catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
