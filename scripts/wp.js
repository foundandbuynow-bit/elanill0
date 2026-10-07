/* Cliente mínimo de Novamira (MCP sobre HTTP) para desplegar en WordPress.
   Las credenciales NO viven en el proyecto: se leen del manifest del bundle .mcpb ya descomprimido.

   Uso:
     NOVAMIRA_BUNDLE=<carpeta con manifest.json> node scripts/wp.js <ability> '<json>'
     NOVAMIRA_BUNDLE=...                          node scripts/wp.js php <archivo.php>     (ejecuta PHP con novamira/execute-php)
     NOVAMIRA_BUNDLE=...                          node scripts/wp.js php-inline "return get_option('blogname');"
*/
const fs = require('fs');
const path = require('path');

function creds() {
  if (process.env.WP_API_URL) return { url: process.env.WP_API_URL, user: process.env.WP_API_USERNAME, pass: process.env.WP_API_PASSWORD };
  const dir = process.env.NOVAMIRA_BUNDLE;
  if (!dir) throw new Error('Define NOVAMIRA_BUNDLE (carpeta del bundle descomprimido) o WP_API_URL/USERNAME/PASSWORD');
  const env = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8')).server.mcp_config.env;
  return { url: env.WP_API_URL, user: env.WP_API_USERNAME, pass: env.WP_API_PASSWORD };
}

const parse = raw => {
  const line = raw.split('\n').find(l => l.startsWith('data:'));
  return JSON.parse(line ? line.slice(5).trim() : raw);
};

let session = null;
async function open(c) {
  const auth = 'Basic ' + Buffer.from(`${c.user}:${c.pass}`).toString('base64');
  const r = await fetch(c.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', Authorization: auth },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'elanill0-deploy', version: '1' } } })
  });
  const sid = r.headers.get('mcp-session-id');
  if (!sid) throw new Error('Sin Mcp-Session-Id (HTTP ' + r.status + '): ' + (await r.text()).slice(0, 300));
  await fetch(c.url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: auth, 'Mcp-Session-Id': sid }, body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) });
  return { sid, auth };
}

async function ability(name, params = {}) {
  const c = creds();
  if (!session) session = await open(c);
  const call = () => fetch(c.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', Authorization: session.auth, 'Mcp-Session-Id': session.sid },
    body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'mcp-adapter-execute-ability', arguments: { ability_name: name, parameters: params } } }),
    signal: AbortSignal.timeout(180000)
  }).then(r => r.text());
  let out = await call();
  if (/Missing Mcp-Session-Id|Invalid session/.test(out)) { session = await open(c); out = await call(); }
  const d = parse(out);
  if (d.error) throw new Error(JSON.stringify(d.error).slice(0, 800));
  const text = (d.result?.content || []).map(b => b.text || '').join('\n');
  try { return JSON.parse(text); } catch { return text; }
}
const php = code => ability('novamira/execute-php', { code });

module.exports = { ability, php };

if (require.main === module) {
  (async () => {
    const [a, b] = process.argv.slice(2);
    let res;
    if (a === 'php') res = await php(fs.readFileSync(b, 'utf8').replace(/^<\?php\s*/, ''));
    else if (a === 'php-inline') res = await php(b);
    else res = await ability(a, b ? JSON.parse(b.startsWith('@') ? fs.readFileSync(b.slice(1), 'utf8') : b) : {});
    console.log(typeof res === 'string' ? res : JSON.stringify(res, null, 1));
  })().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
}
