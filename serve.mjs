// Prosty serwer podglądu: node serve.mjs  -> http://localhost:5174 (lub PORT=xxxx)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
createServer(async (req, res) => {
  let p = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[\\/])+/, '');
  if (p.endsWith('\\') || p.endsWith('/')) p = join(p, 'index.html');
  try {
    const data = await readFile(join(import.meta.dirname, 'dist', p));
    res.writeHead(200, { 'Content-Type': types[extname(p)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(process.env.PORT || 5174, () => console.log('http://localhost:' + (process.env.PORT || 5174) + ''));
