import test from 'node:test';
import assert from 'node:assert/strict';
import { start } from '../src/server.mjs';

test('records an arrival and moves it forward one step', async () => {
  const app = await start({ port: 0 });
  const base = `http://127.0.0.1:${app.port}`;
  try {
    assert.deepEqual(await (await fetch(`${base}/health`)).json(), { status: 'ok' });

    const created = await fetch(`${base}/v1/arrivals`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ vessel: 'Nile Star', berth: 'B2' })
    });
    assert.equal(created.status, 201);
    const arrival = await created.json();
    assert.equal(arrival.status, 'scheduled');

    const docked = await fetch(`${base}/v1/arrivals/${arrival.id}/status`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'docked' })
    });
    assert.equal(docked.status, 200);
    assert.equal((await docked.json()).status, 'docked');

    const skipped = await fetch(`${base}/v1/arrivals/${arrival.id}/status`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'scheduled' })
    });
    assert.equal(skipped.status, 409);
    assert.equal((await fetch(`${base}/v1/missing`)).status, 404);
  } finally {
    await app.close();
  }
});
