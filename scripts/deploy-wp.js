/* Despliegue en WordPress por etapas (todas idempotentes).
   Uso:  NOVAMIRA_BUNDLE=<carpeta del bundle> node scripts/deploy-wp.js <etapa>
   Etapas: package · upload · install · media · terms · content · finish · cleanup
   Las credenciales se leen del bundle; nunca se guardan en el proyecto.                                   */
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { ability, php } = require('./wp.js');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const STATE = path.join(DIST, 'state.json');
const readState = () => (fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {});
const writeState = s => { fs.mkdirSync(DIST, { recursive: true }); fs.writeFileSync(STATE, JSON.stringify(s, null, 1)); };
const phpFile = n => fs.readFileSync(path.join(__dirname, 'wp-php', n), 'utf8').replace(/^<\?php\s*/, '');
const unwrap = r => (r && r.data && r.data.return_value !== undefined ? r.data.return_value : r);

function addDir(zip, dir, zipPath, filter = () => true) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) addDir(zip, p, `${zipPath}/${e.name}`, filter);
    else if (filter(p)) zip.addLocalFile(p, zipPath);
  }
}

/* ---- 1. empaquetar ---- */
function pack() {
  fs.mkdirSync(DIST, { recursive: true });
  // tema (las tipografías se copian desde el sitio)
  const theme = new AdmZip();
  addDir(theme, path.join(ROOT, 'wp', 'elanill0-theme'), 'elanill0-theme');
  for (const f of fs.readdirSync(path.join(ROOT, 'site', 'assets', 'fonts'))) theme.addLocalFile(path.join(ROOT, 'site', 'assets', 'fonts', f), 'elanill0-theme/assets/fonts');
  theme.writeZip(path.join(DIST, 'e0-theme.zip'));
  // plugin (+ imágenes para redes)
  const plugin = new AdmZip();
  addDir(plugin, path.join(ROOT, 'wp', 'elanill0-catalogo'), 'elanill0-catalogo');
  const og = path.join(ROOT, 'site', 'img', 'og');
  for (const f of fs.readdirSync(og)) plugin.addLocalFile(path.join(og, f), 'elanill0-catalogo/assets/og');
  plugin.addLocalFile(path.join(ROOT, 'site', 'img', 'og-elanill0.jpg'), 'elanill0-catalogo/assets/og');
  plugin.writeZip(path.join(DIST, 'e0-plugin.zip'));
  // medios
  const { media } = mediaList();
  const mz = new AdmZip();
  const manifest = {};
  for (const [slug, m] of Object.entries(media)) { mz.addLocalFile(m.path, ''); manifest[slug] = { file: path.basename(m.path), title: m.title, alt: m.alt }; }
  mz.addFile('manifest.json', Buffer.from(JSON.stringify(manifest)));
  mz.writeZip(path.join(DIST, 'e0-media.zip'));
  return Object.fromEntries(['e0-theme.zip', 'e0-plugin.zip', 'e0-media.zip'].map(f => [f, Math.round(fs.statSync(path.join(DIST, f)).size / 1024) + ' KB']));
}

function mediaList() {
  const img = p => path.join(ROOT, 'site', 'img', p);
  const products = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'products.json'), 'utf8')).products;
  const cats = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'categories.json'), 'utf8')).categories;
  const media = {
    logo: { path: img('marca/logo.webp'), title: 'Elanill0 · logotipo', alt: 'Elanill0 · Joyas únicas y modernas de acero inoxidable' },
    icon: { path: img('marca/icon-512.png'), title: 'Elanill0 · icono del sitio', alt: 'Icono de Elanill0' },
    hero: { path: img('joyas-acero-inoxidable-mujer-aros.webp'), title: 'Mujer con pendientes de aro de acero inoxidable', alt: 'Mujer con pendientes de aro de acero inoxidable dorados' },
    promo: { path: img('pendientes-aro-dorado-acero-inoxidable.webp'), title: 'Aro dorado con bolitas de acero inoxidable', alt: 'Aro dorado con bolitas de acero inoxidable en la oreja' },
    banner: { path: img('anillo-sello-hombre-acero-inoxidable-cadena.webp'), title: 'Hombre con anillo de sello de acero inoxidable', alt: 'Hombre con anillo de sello de acero inoxidable y cadena al cuello' }
  };
  for (const c of cats) media['cover-' + c.slug] = { path: path.join(ROOT, 'site', c.cover), title: c.title, alt: c.alt };
  for (const p of products) p.images.forEach((f, i) => { media['prod-' + f] = { path: img('productos/' + f), title: p.name, alt: p.alts[i] || p.name }; });
  return { media };
}

/* ---- 2. subir ---- */
async function uploadFile(local, remoteName) {
  const r = unwrap(await ability('novamira/create-upload-link', { path: 'wp-content/uploads/' + remoteName, overwrite: true }));
  const d = r.data || r;
  const url = d.upload_url, token = d.upload_token;
  if (!url || !token) throw new Error('Respuesta inesperada de create-upload-link: ' + JSON.stringify(r).slice(0, 300));
  const res = await fetch(url, { method: 'PUT', headers: { 'X-Novamira-Upload-Token': token }, body: fs.readFileSync(local) });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Subida de ${remoteName} falló (${res.status}): ${txt.slice(0, 200)}`);
  return `${remoteName} ${res.status}`;
}

async function main() {
  const stage = process.argv[2];
  const state = readState();
  if (stage === 'package') return console.log(pack());
  if (stage === 'upload') {
    const out = [];
    for (const f of ['e0-theme.zip', 'e0-plugin.zip', 'e0-media.zip']) out.push(await uploadFile(path.join(DIST, f), f));
    return console.log(out);
  }
  if (stage === 'install') return console.log(JSON.stringify(unwrap(await php(phpFile('install.php'))), null, 1));
  if (stage === 'terms') {
    state.terms = unwrap(await php(phpFile('terms.php')));
    writeState(state);
    return console.log(JSON.stringify(state.terms, null, 1));
  }
  if (stage === 'media') {
    state.media = unwrap(await php(phpFile('media.php')));
    writeState(state);
    return console.log(JSON.stringify(Object.fromEntries(Object.entries(state.media).map(([k, v]) => [k, v.error ? v.error : v.id])), null, 1));
  }
  if (stage === 'content') {
    if (!state.media || !state.terms) throw new Error('Faltan las etapas media y terms.');
    const { buildContent } = require('./wp-content.js');
    const { pages, products } = buildContent({ img: state.media, term: state.terms });
    const payload = { media: state.media, terms: state.terms, pages, products };
    const f = path.join(DIST, 'e0-content.json');
    fs.writeFileSync(f, JSON.stringify(payload));
    console.log('Subiendo contenido:', await uploadFile(f, 'e0-content.json'), Math.round(fs.statSync(f).size / 1024) + ' KB');
    return console.log(JSON.stringify(unwrap(await php(phpFile('content.php'))), null, 1));
  }
  if (stage === 'finish') return console.log(JSON.stringify(unwrap(await php(phpFile('finish.php'))), null, 1));
  if (stage === 'purge') return console.log(JSON.stringify(unwrap(await php(phpFile('purge.php'))), null, 1));
  if (stage === 'cleanup') {
    const r = unwrap(await php(`$up = wp_get_upload_dir()['basedir']; $o = []; foreach (['e0-theme.zip','e0-plugin.zip','e0-media.zip','e0-content.json'] as $f) { $o[$f] = file_exists("$up/$f") ? (unlink("$up/$f") ? 'borrado' : 'error') : 'no existe'; } return $o;`));
    return console.log(JSON.stringify(r, null, 1));
  }
  console.log('Etapas: package · upload · install · media · terms · content · finish · cleanup');
}
main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
