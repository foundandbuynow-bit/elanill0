/* Comprueba que todos los enlaces/imágenes internos de site/ existen (rutas absolutas /x/ y carpetas con index.html).
   Uso: node scripts/check-links.js */
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'site');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
const htmls = walk(OUT).filter(f => f.endsWith('.html'));
const exists = u => {
  const clean = u.split('#')[0].split('?')[0];
  const target = path.join(OUT, clean);
  if (!fs.existsSync(target)) return false;
  return fs.statSync(target).isDirectory() ? fs.existsSync(path.join(target, 'index.html')) : true;
};
let bad = 0, total = 0;
const external = new Set();
for (const f of htmls) {
  const html = fs.readFileSync(f, 'utf8');
  const rel = path.relative(OUT, f);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  for (const m of html.matchAll(/(?:href|src|action|data-src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(mailto:|tel:|data:|javascript:)/.test(u)) continue;
    if (/^https?:/.test(u)) { external.add(new URL(u).origin); continue; }
    total++;
    if (u.startsWith('#')) { if (!ids.has(u.slice(1))) { bad++; console.log(`✗ ${rel}: ancla ${u} no existe`); } continue; }
    if (!u.startsWith('/')) { bad++; console.log(`✗ ${rel}: ruta relativa ${u} (usar absoluta)`); continue; }
    if (!exists(u)) { bad++; console.log(`✗ ${rel}: ${u} no existe`); }
  }
}
console.log(`${htmls.length} páginas HTML · ${total} enlaces/recursos internos · ${bad} rotos`);
console.log('Dominios externos:', [...external].join(', '));
process.exit(bad ? 1 : 0);
