#!/usr/bin/env node
// Small image optimizer that creates responsive WebP/AVIF and resized PNG variants
// Usage: node scripts/optimize-images.js --input=public/awardlogo.png --output=public/optimized --name=awardlogo

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const argv = require('minimist')(process.argv.slice(2));
const input = argv.input || 'public/awardlogo.png';
const output = argv.output || 'public/optimized';
const name = argv.name || path.basename(input, path.extname(input));

if (!fs.existsSync(input)) {
  console.error('Input file not found:', input);
  process.exit(1);
}

if (!fs.existsSync(output)) fs.mkdirSync(output, { recursive: true });

const sizes = [48, 64, 96, 160, 320, 640];

async function main() {
  for (const size of sizes) {
    const outWebp = path.join(output, `${name}-${size}.webp`);
    const outAvif = path.join(output, `${name}-${size}.avif`);
    const outPng = path.join(output, `${name}-${size}.png`);

    await sharp(input).resize(size, size, { fit: 'inside' }).toFile(outPng);
    await sharp(input).resize(size, size, { fit: 'inside' }).webp({ quality: 80 }).toFile(outWebp);
    await sharp(input).resize(size, size, { fit: 'inside' }).avif({ quality: 50 }).toFile(outAvif);
    console.log('Generated:', outWebp, outAvif, outPng);
  }

  // Also create a 1x original-optimized WebP
  const outWebpOriginal = path.join(output, `${name}-orig.webp`);
  await sharp(input).webp({ quality: 80 }).toFile(outWebpOriginal);
  console.log('Generated:', outWebpOriginal);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
