#!/usr/bin/env node

/**
 * potencIA — Generador automático de contenido para Instagram
 * 
 * Uso:
 *   node generar_contenido.js              → genera contenido para hoy
 *   node generar_contenido.js --semana     → genera los 14 posts de la semana
 *   node generar_contenido.js --tema "X"   → genera un post para un tema específico
 * 
 * Requiere:
 *   - ANTHROPIC_API_KEY en variables de entorno
 *   - npm install @anthropic-ai/sdk fs-extra
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new Anthropic();

// ─── Configuración ────────────────────────────────────────────────────────────

const ARCHIVOS = {
  prompt_maestro: path.join(__dirname, "prompt_maestro.md"),
  temas: path.join(__dirname, "temas.csv"),
  output: path.join(__dirname, "posts"),
};

// ─── Utilidades ───────────────────────────────────────────────────────────────

function leerPromptMaestro() {
  return fs.readFileSync(ARCHIVOS.prompt_maestro, "utf-8");
}

function leerTemas() {
  const contenido = fs.readFileSync(ARCHIVOS.temas, "utf-8");
  return contenido
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const [tipo, horario, ...resto] = l.split(",");
      return { tipo: tipo.trim(), horario: horario.trim(), tema: resto.join(",").trim() };
    });
}

function crearCarpetaOutput(fecha) {
  const carpeta = path.join(ARCHIVOS.output, fecha);
  if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta, { recursive: true });
  return carpeta;
}

function slugify(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 60);
}

function guardarPost(carpeta, horario, data) {
  const slug = slugify(data.tema || "");
  const nombre = `${horario.replace(":", "")}_${data.tipo}_${slug}.json`;
  const rutaJSON = path.join(carpeta, nombre);
  fs.writeFileSync(rutaJSON, JSON.stringify(data, null, 2), "utf-8");

  // También guardar versión legible para Canva/revisión manual
  const rutaTXT = path.join(carpeta, `${horario.replace(":", "")}_${data.tipo}_${slug}_legible.txt`);
  const legible = formatearLegible(data);
  fs.writeFileSync(rutaTXT, legible, "utf-8");

  console.log(`  ✓ Guardado: ${nombre}`);
  return rutaJSON;
}

function formatearLegible(data) {
  let texto = `═══════════════════════════════════════
TEMA: ${data.tema}
TIPO: ${data.tipo.toUpperCase()} | HORARIO: ${data.horario}
═══════════════════════════════════════\n`;

  if (data.slides && data.slides.length > 0) {
    texto += "\n── SLIDES ──\n";
    data.slides.forEach((slide, i) => {
      texto += `\nSlide ${i + 1}:\n${slide}\n`;
    });
  }

  texto += `\n── CAPTION ──\n${data.caption}\n`;
  texto += `\n── HASHTAGS ──\n${data.hashtags.join(" ")}\n`;

  return texto;
}

// ─── Generación con Claude ────────────────────────────────────────────────────

async function generarPost(promptMaestro, tema) {
  console.log(`  → Generando: [${tema.tipo} ${tema.horario}] ${tema.tema}`);

  const userPrompt = `Generá el contenido para Instagram de potencIA sobre este tema:

Tipo: ${tema.tipo}
Horario de publicación: ${tema.horario}
Tema: ${tema.tema}

Respondé ÚNICAMENTE con el JSON válido, sin texto antes ni después, sin backticks, sin markdown.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: promptMaestro,
    messages: [{ role: "user", content: userPrompt }],
  });

  const texto = response.content[0].text.trim();

  try {
    const data = JSON.parse(texto);
    return { ...data, horario: tema.horario };
  } catch (e) {
    // Si el JSON viene con markdown, intentar extraerlo
    const match = texto.match(/\{[\s\S]*\}/);
    if (match) return { ...JSON.parse(match[0]), horario: tema.horario };
    throw new Error(`No se pudo parsear el JSON para el tema: ${tema.tema}`);
  }
}

// ─── Modos de ejecución ───────────────────────────────────────────────────────

async function generarHoy() {
  const temas = leerTemas();
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0=Dom, 1=Lun... 6=Sab
  const indice = (diaSemana === 0 ? 6 : diaSemana - 1) * 2; // 2 posts por día, lunes=0

  if (indice >= temas.length) {
    console.log("⚠️  No hay temas para hoy. Agregá más temas en temas.csv");
    return;
  }

  const temasHoy = temas.slice(indice, indice + 2);
  const fecha = hoy.toISOString().split("T")[0];
  const carpeta = crearCarpetaOutput(fecha);
  const promptMaestro = leerPromptMaestro();

  console.log(`\n📅 Generando posts para hoy (${fecha}):\n`);

  for (const tema of temasHoy) {
    const data = await generarPost(promptMaestro, tema);
    guardarPost(carpeta, data.horario, data);
  }

  console.log(`\n✅ Posts guardados en: ${carpeta}\n`);
}

async function generarSemana() {
  const temas = leerTemas();
  const hoy = new Date();
  const fecha = hoy.toISOString().split("T")[0];
  const carpeta = crearCarpetaOutput(`semana_${fecha}`);
  const promptMaestro = leerPromptMaestro();

  const dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

  console.log(`\n📅 Generando semana completa (${temas.length} posts):\n`);

  for (let i = 0; i < temas.length; i++) {
    const tema = temas[i];
    const dia = dias[Math.floor(i / 2)];
    const postNum = (i % 2) + 1;
    console.log(`\n[${dia} — post ${postNum}]`);

    const data = await generarPost(promptMaestro, tema);
    const subcarpeta = path.join(carpeta, `${dia}`);
    if (!fs.existsSync(subcarpeta)) fs.mkdirSync(subcarpeta, { recursive: true });
    guardarPost(subcarpeta, data.horario, data);

    // Pequeña pausa para no saturar la API
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n✅ Semana completa guardada en: ${carpeta}\n`);
}

async function generarTemaSuelto(temaTexto) {
  const promptMaestro = leerPromptMaestro();
  const fecha = new Date().toISOString().split("T")[0];
  const carpeta = crearCarpetaOutput(fecha);

  // Detectar tipo automáticamente según el texto
  const tema = {
    tipo: "carrusel",
    horario: "9am",
    tema: temaTexto,
  };

  console.log(`\n💡 Generando post para tema suelto:\n`);
  const data = await generarPost(promptMaestro, tema);
  guardarPost(carpeta, data.horario, data);
  console.log(`\n✅ Post guardado en: ${carpeta}\n`);

  // Mostrar preview en consola
  console.log("─── PREVIEW ───────────────────────────────");
  console.log(formatearLegible(data));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ Falta la variable ANTHROPIC_API_KEY");
    console.error("   Ejecutá: export ANTHROPIC_API_KEY=tu_clave_aqui");
    process.exit(1);
  }

  if (!fs.existsSync(ARCHIVOS.output)) {
    fs.mkdirSync(ARCHIVOS.output, { recursive: true });
  }

  try {
    if (args.includes("--semana")) {
      await generarSemana();
    } else if (args.includes("--tema")) {
      const idx = args.indexOf("--tema");
      const tema = args[idx + 1];
      if (!tema) {
        console.error('❌ Usá: node generar_contenido.js --tema "Tu tema acá"');
        process.exit(1);
      }
      await generarTemaSuelto(tema);
    } else {
      await generarHoy();
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();
