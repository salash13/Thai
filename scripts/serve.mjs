#!/usr/bin/env node
/* Serveur local minimal, sans aucune dépendance.   node scripts/serve.mjs [port]
   Sert le dossier du projet et cherche un port libre si celui demandé est pris. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/plain; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const file = join(ROOT, normalize(p).replace(/^(\.\.[/\\])+/, ''));
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 — fichier introuvable');
  }
});

let port = Number(process.argv[2]) || 8123;
server.on('error', e => {
  if (e.code === 'EADDRINUSE' && port < 8199) { server.listen(++port, '127.0.0.1'); }
  else { console.error(e.message); process.exit(1); }
});
server.listen(port, '127.0.0.1', () =>
  console.log('\n  Application prête →  http://localhost:' + server.address().port + '\n  (Ctrl+C pour arrêter)\n'));
