import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const STATUSES = ['scheduled', 'docked', 'departed'];

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 20_000) reject(Object.assign(new Error('body too large'), { status: 413 }));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(Object.assign(new Error('invalid json'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

function field(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 80 ? value.trim() : undefined;
}

export function createApp() {
  const arrivals = new Map();
  return async function app(req, res) {
    try {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { status: 'ok' });
      if (req.method === 'GET' && url.pathname === '/v1/arrivals') return send(res, 200, [...arrivals.values()]);
      if (req.method === 'POST' && url.pathname === '/v1/arrivals') {
        const body = await readJson(req);
        const vessel = field(body.vessel);
        const berth = field(body.berth);
        if (!vessel || !berth) return send(res, 400, { error: 'vessel and berth are required' });
        const arrival = { id: randomUUID(), vessel, berth, status: 'scheduled' };
        arrivals.set(arrival.id, arrival);
        return send(res, 201, arrival);
      }
      const move = url.pathname.match(/^\/v1\/arrivals\/([^/]+)\/status$/);
      if (req.method === 'POST' && move) {
        const arrival = arrivals.get(move[1]);
        if (!arrival) return send(res, 404, { error: 'arrival not found' });
        const body = await readJson(req);
        const next = STATUSES.indexOf(body.status);
        const current = STATUSES.indexOf(arrival.status);
        if (next < 0) return send(res, 400, { error: 'status must be scheduled, docked, or departed' });
        if (next !== current + 1) return send(res, 409, { error: 'status can only move one step forward' });
        arrival.status = body.status;
        return send(res, 200, arrival);
      }
      send(res, 404, { error: 'not found' });
    } catch (error) {
      send(res, error.status || 500, { error: error.status ? error.message : 'internal error' });
    }
  };
}

export function start({ port = Number(process.env.PORT || 8080) } = {}) {
  const server = createServer(createApp());
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '0.0.0.0', () => {
      const address = server.address();
      resolve({ server, port: typeof address === 'object' && address ? address.port : port, close: () => new Promise(done => server.close(done)) });
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  start().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
