import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {validateCapsule} from '../core/capsule.mjs';

const h = s => crypto.createHash('sha256').update(s).digest();

// Local, read-only, token-protected. Not a production service: no TLS, no multi-tenancy, no audit log.
export function makeServer({capsulePath, token}) {
  if (!token || token.length < 16) throw new Error('Set a bearer token of 16+ characters in the specified environment variable');
  const capsule = JSON.parse(fs.readFileSync(capsulePath, 'utf8'));
  const validation = validateCapsule(capsule); if (!validation.valid) throw new Error('Cannot serve an invalid capsule');
  const body = JSON.stringify(capsule); if (Buffer.byteLength(body) > 1024 * 1024) throw new Error('Capsule exceeds 1 MB server limit');
  const want = h(token);
  const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'no-referrer');
    // Host check blocks DNS-rebinding: a hostile web page cannot reach this server under another name.
    if (!/^(?:127\.0\.0\.1|localhost|\[::1\])(?::\d+)?$/i.test(req.headers.host || '')) { res.writeHead(403); return res.end('{"error":"forbidden_host"}'); }
    if (req.method !== 'GET') { res.writeHead(405); return res.end('{"error":"method_not_allowed"}'); }
    if (req.url === '/health') { res.writeHead(200); return res.end('{"status":"ok","mode":"read_only_localhost"}'); }
    if (req.url !== '/capsule') { res.writeHead(404); return res.end('{"error":"not_found"}'); }
    const auth = req.headers.authorization || '';
    const provided = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!crypto.timingSafeEqual(h(provided), want)) { res.writeHead(401); return res.end('{"error":"unauthorized"}'); }
    res.writeHead(200); res.end(body);
  });
  server.headersTimeout = 10000; server.requestTimeout = 10000;
  return server;
}
