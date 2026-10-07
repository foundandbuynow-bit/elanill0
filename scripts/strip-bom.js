/* Quita la marca BOM (EF BB BF) de los archivos de texto del proyecto: un BOM antes de <?php rompe las cabeceras de WordPress.
   Uso: node scripts/strip-bom.js */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', 'dist', 'scratch', 'fotos', 'referencia']);
const EXT = new Set(['.php', '.json', '.css', '.js', '.html', '.txt', '.xml', '.md', '.webmanifest', '.htaccess']);
let n = 0;
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!EXT.has(path.extname(e.name)) && e.name !== '_redirects' && e.name !== '_headers') continue;
    const b = fs.readFileSync(p);
    if (b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) { fs.writeFileSync(p, b.subarray(3)); n++; console.log('sin BOM:', path.relative(ROOT, p)); }
  }
})(ROOT);
console.log(n, 'archivos corregidos');
