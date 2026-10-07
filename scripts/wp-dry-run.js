/* Prueba en seco del generador de contenido (sin tocar WordPress). Uso: node scripts/wp-dry-run.js */
const { buildContent } = require('./wp-content.js');
const fake = new Proxy({}, { get: (t, k) => ({ id: 1, url: 'https://x/' + String(k) + '.webp', alt: 'alt ' + String(k) }) });
const term = { categoria: { anillos: 11, collares: 12, pulseras: 13, pendientes: 14 }, destacado: { 'mas-vendidos': 21 } };
const { pages, products } = buildContent({ img: fake, term });
let total = 0, htmlBlocks = 0;
const nonCore = new Set();
for (const p of [...pages, ...products]) {
  const names = [...p.content.matchAll(/<!-- wp:([a-z0-9/-]+)/g)].map(m => m[1]);
  names.forEach(n => { total++; if (n === 'html') htmlBlocks++; if (n.includes('/')) nonCore.add(n); });
  const open = [...p.content.matchAll(/<!-- wp:[a-z0-9/-]+(?: \{.*?\})? -->/g)].length;
  const close = [...p.content.matchAll(/<!-- \/wp:[a-z0-9/-]+ -->/g)].length;
  if (open !== close) console.log('DESEQUILIBRIO en', p.slug, open, close);
}
console.log(pages.length, 'páginas ·', products.length, 'productos ·', total, 'bloques ·', htmlBlocks, 'core/html · otros namespaces:', [...nonCore].join(',') || 'ninguno');
console.log(pages.map(p => (p.parent ? p.parent + '/' : '') + p.slug + ' (' + Math.round(p.content.length / 1024) + ' KB)').join('\n'));
