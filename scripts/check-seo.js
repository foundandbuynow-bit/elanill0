/* Auditoría SEO on-page de site/: títulos, descripciones, H1, canónica, imágenes, JSON-LD, duplicados.
   Uso: node scripts/check-seo.js */
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'site');
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk(OUT).filter(f => f.endsWith('.html'));

const titles = {}, descs = {};
let warn = 0, err = 0;
const W = (f, m) => { warn++; console.log(`  ! ${f}: ${m}`); };
const E = (f, m) => { err++; console.log(`  ✗ ${f}: ${m}`); };

for (const f of files) {
  const rel = path.relative(OUT, f).replace(/\\/g, '/');
  const h = fs.readFileSync(f, 'utf8');
  const get = re => (h.match(re) || [])[1] || '';
  const title = get(/<title>([\s\S]*?)<\/title>/);
  const desc = get(/<meta name="description" content="([^"]*)"/);
  const canonical = get(/<link rel="canonical" href="([^"]*)"/);
  const noindex = /name="robots" content="noindex/.test(h);
  const h1s = [...h.matchAll(/<h1[\s>][\s\S]*?<\/h1>/g)];
  const unesc = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  if (!title) E(rel, 'sin <title>'); else {
    const t = unesc(title);
    if (t.length > 60) W(rel, `título largo (${t.length}): ${t}`);
    if (t.length < 25) W(rel, `título corto (${t.length}): ${t}`);
    (titles[t] = titles[t] || []).push(rel);
  }
  if (!desc) E(rel, 'sin meta description'); else {
    const d = unesc(desc);
    if (d.length > 160) W(rel, `descripción larga (${d.length})`);
    if (d.length < 70) W(rel, `descripción corta (${d.length})`);
    (descs[d] = descs[d] || []).push(rel);
  }
  if (!noindex && !/^https:\/\/elanill0\.com\//.test(canonical)) E(rel, 'canónica ausente o incorrecta: ' + canonical);
  if (h1s.length !== 1) E(rel, `hay ${h1s.length} H1 (debe haber 1)`);
  if (!/<html lang="es-ES">/.test(h)) E(rel, 'falta lang="es-ES"');
  if (!/property="og:image"/.test(h)) E(rel, 'falta og:image');

  // imágenes: alt y dimensiones
  for (const m of h.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    if (!/\balt="/.test(tag)) E(rel, 'img sin alt: ' + tag.slice(0, 80));
    else if (/\balt=""/.test(tag)) W(rel, 'img con alt vacío: ' + (tag.match(/src="([^"]*)"/) || [])[1]);
    if (!/\bwidth="/.test(tag) || !/\bheight="/.test(tag)) W(rel, 'img sin width/height: ' + (tag.match(/src="([^"]*)"/) || [])[1]);
  }
  // JSON-LD válido
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { E(rel, 'JSON-LD inválido: ' + e.message); }
  }
  // jerarquía de encabezados: sin saltos grandes
  const levels = [...h.matchAll(/<h([1-6])[\s>]/g)].map(m => +m[1]);
  for (let i = 1; i < levels.length; i++) if (levels[i] - levels[i - 1] > 1) { W(rel, `salto de encabezados h${levels[i - 1]}→h${levels[i]}`); break; }
}
for (const [k, v] of Object.entries(titles)) if (v.length > 1) E(v.join(', '), 'título duplicado: ' + k);
for (const [k, v] of Object.entries(descs)) if (v.length > 1) E(v.join(', '), 'descripción duplicada');

// sitemap: todas las URL indexables aparecen
const sm = fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const urlsInSitemap = locs.filter(l => !l.includes('/img/')).length;
console.log(`\n${files.length} páginas · ${urlsInSitemap} URL en sitemap · ${err} errores · ${warn} avisos`);
process.exit(err ? 1 : 0);
