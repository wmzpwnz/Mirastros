// Validate the packaged release, not the workspace's development server.
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';

const directory = mkdtempSync(join(tmpdir(), 'mirastros-web-check-'));
let child;
try {
  execFileSync('tar', ['-xzf', 'mirastros-release.tar.gz', '-C', directory]);
  child = spawn(join(directory, 'bin/node'), ['apps/web/server.js'], {
    cwd: join(directory, 'web'),
    env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: '14300', NODE_ENV: 'production' },
    stdio: 'ignore',
  });
  const origin = 'http://127.0.0.1:14300';
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) throw new Error('Packaged server exited');
    try {
      if ((await fetch(origin)).ok) { ready = true; break; }
    } catch { /* Wait for startup. */ }
    await delay(500);
  }
  assert(ready, 'Packaged server did not start');
  const assets = new Set();
  for (const route of ['/', '/auth/login', '/services/tarot']) {
    const response = await fetch(origin + route);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    for (const match of html.matchAll(/(?:src|href)="(\/_next\/static\/[^"?]+)(?:\?[^"\s]*)?"/g)) {
      assets.add(match[1]);
    }
  }
  assert(assets.size > 5, 'Expected JS/CSS/font assets in rendered HTML');
  for (const asset of assets) {
    const response = await fetch(origin + asset);
    assert.equal(response.status, 200, asset);
    await response.arrayBuffer();
  }
  console.log(`Packaged pages and ${assets.size} static assets passed`);
} finally {
  if (child && child.exitCode === null) {
    child.kill('SIGTERM');
    await new Promise(resolve => child.once('exit', resolve));
  }
  rmSync(directory, { recursive: true, force: true });
}
