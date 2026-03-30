// apps/store/scripts/convert-to-webp.mjs
// Script de conversión única para imágenes de fondo estáticas a WebP.
// Uso: npm run convert-images
// Los originales se conservan como fallback para el elemento <picture>.

import sharp from 'sharp';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const conversions = [
  {
    input:   path.join(root, 'src/assets/peterbilt-hero.png'),
    output:  path.join(root, 'src/assets/peterbilt-hero.webp'),
    label:   'peterbilt-hero (src/assets)',
    quality: 85,
  },
  {
    // Imagen de fondo con overlay — calidad 75 es suficiente y da mejor compresión
    // que quality 85 en JPEGs progresivos ya optimizados.
    input:   path.join(root, 'public/background_inside.jpg.jpeg'),
    output:  path.join(root, 'public/background_inside.webp'),
    label:   'background_inside (public)',
    quality: 75,
  },
  {
    input:   path.join(root, 'public/backgraund_outside.jpg.jpeg'),
    output:  path.join(root, 'public/background_outside.webp'),
    label:   'background_outside (public) [typo corregido en nombre de salida]',
    quality: 75,
  },
];

async function getBytes(p) {
  try { return (await stat(p)).size; } catch { return null; }
}

function fmt(b) {
  return `${(b / 1024).toFixed(1)} KB`;
}

console.log('\nConvirtiendo imágenes a WebP (quality 85)...\n');

for (const { input, output, label, quality } of conversions) {
  const before = await getBytes(input);
  if (!before) {
    console.error(`  [SKIP] No encontrado: ${input}`);
    continue;
  }

  // sharp auto-detecta el formato real por header binario,
  // incluso si la extensión es incorrecta (ej. JPEG con .png).
  await sharp(input).webp({ quality }).toFile(output);

  const after = await getBytes(output);
  const saving = (((before - after) / before) * 100).toFixed(1);

  console.log(`  [OK] ${label}`);
  console.log(`       ${fmt(before)} → ${fmt(after)} (${saving}% reducción)`);
  console.log(`       Salida: ${output}\n`);
}

console.log('Listo. Archivos originales conservados como fallback.\n');
