/* Genera las imágenes 1200x630 (JPEG) para compartir en redes: una por producto, una por categoría y la de "Sobre nosotros".
   Uso: node scripts/make-og.js                                                                                              */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'site', 'img');
const OUT = path.join(IMG, 'og');
fs.mkdirSync(OUT, { recursive: true });
const products = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'products.json'), 'utf8')).products;
const cats = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'categories.json'), 'utf8')).categories;

async function square(file, out, bg = '#ececec') {
  const inner = await sharp(file).resize(630, 630, { fit: 'cover' }).jpeg({ quality: 88 }).toBuffer();
  const logo = await sharp(path.join(IMG, 'marca', 'logo.webp')).resize(110, 110).png().toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: bg } })
    .composite([{ input: inner, left: 285, top: 0 }, { input: logo, left: 40, top: 40 }])
    .jpeg({ quality: 86 }).toFile(path.join(OUT, out));
}

(async () => {
  for (const p of products) await square(path.join(IMG, 'productos', p.images[0]), `${p.slug}.jpg`);
  for (const c of cats) await square(path.join(ROOT, 'site', c.cover), `cat-${c.slug}.jpg`, '#D8A697');
  await square(path.join(IMG, 'pendientes-aro-dorado-acero-inoxidable.webp'), 'sobre-nosotros.jpg', '#D8A697');
  console.log('OG OK:', fs.readdirSync(OUT).length, 'imágenes');
})();
