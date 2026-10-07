/* Comprueba que todos los enlaces/imágenes internos de site/ existen.  Uso: node scripts/check-links.js */
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'site');
const pages = fs.readdirSync(OUT).filter(f => f.endsWith('.html'));
let bad = 0, total = 0;
const external = new Set();
for (const f of pages) {
  const html = fs.readFileSync(path.join(OUT, f), 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  for (const m of html.matchAll(/(?:href|src|action)="([^"]+)"/g)) {
    let u = m[1];
    if (/^(mailto:|tel:|data:|javascript:)/.test(u)) continue;
    if (/^https?:/.test(u)) { external.add(u.split('?')[0]); continue; }
    total++;
    const [file, hash] = u.split('#');
    const clean = file.split('?')[0];
    if (!clean) { if (hash && !ids.has(hash)) { bad++; console.log(`✗ ${f}: ancla #${hash} no existe`); } continue; }
    const target = path.join(OUT, clean);
    if (!fs.existsSync(target)) { bad++; console.log(`✗ ${f}: ${u} no existe`); }
  }
}
console.log(`${pages.length} páginas · ${total} enlaces/recursos internos · ${bad} rotos`);
console.log('Externos distintos:', [...external].join('\n  '));
process.exit(bad ? 1 : 0);
