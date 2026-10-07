/* Vista previa local con URLs limpias (/tienda/), redirecciones 301 y página 404 real.
   Uso:  node scripts/preview.js      (PORT=4400 node scripts/preview.js para cambiar el puerto) */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(path.join(__dirname, '..', 'site'));
const PORT = Number(process.env.PORT || 4400);
const redirects = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'redirects.json'), 'utf8')));
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let rel;
  try { rel = decodeURIComponent(req.url.split('?')[0]); } catch { res.writeHead(400); return res.end('400'); }
  const query = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';

  if (redirects[rel]) { res.writeHead(301, { Location: redirects[rel] }); return res.end(); }

  let file = path.join(ROOT, rel);
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end('403'); }

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!rel.endsWith('/')) { res.writeHead(301, { Location: rel + '/' + query }); return res.end(); }
    file = path.join(file, 'index.html');
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      const nf = path.join(ROOT, '404.html');
      res.writeHead(404, { 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-store' });
      return fs.existsSync(nf) ? res.end(fs.readFileSync(nf)) : res.end('404');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
});

function listen(port, tries) {
  server.once('error', e => { if (e.code === 'EADDRINUSE' && tries > 0) listen(port + 1, tries - 1); else throw e; });
  server.listen(port, '127.0.0.1', () => console.log('Vista previa en http://127.0.0.1:' + server.address().port + '/'));
}
listen(PORT, 20);
