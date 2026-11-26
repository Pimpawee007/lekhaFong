'use strict';

// Regression tests for the frontend static server.
// Run with: node --test tests/static-server.test.js

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');

const PORT = Number(process.env.TEST_FRONTEND_PORT) || 3137;
const HOST = '127.0.0.1';
const frontserver = path.join(__dirname, '..', 'frontend', 'frontserver.js');

let child;

function request(rawPath, method = 'GET') {
    return new Promise((resolve, reject) => {
        const req = http.request({ host: HOST, port: PORT, path: rawPath, method }, res => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks), headers: res.headers }));
        });
        req.on('error', reject);
        req.end();
    });
}

async function waitForServer(timeoutMs = 10000) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
        try {
            const res = await request('/');
            if (res.status === 200) return;
        } catch { /* not listening yet */ }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('static server did not start');
}

before(async () => {
    child = spawn(process.execPath, [frontserver], {
        env: { ...process.env, FRONTEND_PORT: String(PORT), FRONTEND_HOST: HOST },
        stdio: 'ignore'
    });
    await waitForServer();
});

after(() => {
    if (child && !child.killed) child.kill();
});

test('serves the homepage and required frontend assets', async () => {
    for (const [rawPath, expectedType] of [
        ['/', 'text/html'],
        ['/style.css', 'text/css'],
        ['/script.js', 'application/javascript'],
        ['/lekhaFongLogo.png', 'image/png'],
        ['/banner/1.png', 'image/png'],
        ['/pic_member/bpw032.png', 'image/png']
    ]) {
        const res = await request(rawPath);
        assert.strictEqual(res.status, 200, `${rawPath} should return 200`);
        assert.match(String(res.headers['content-type'] || ''), new RegExp(expectedType), `${rawPath} content type`);
    }
});

test('malformed URLs return 400 without crashing the process', async () => {
    const bad = await request('/%');
    assert.strictEqual(bad.status, 400);

    const badEncoded = await request('/%E0%A4%A');
    assert.strictEqual(badEncoded.status, 400);

    // The same process must still answer normal requests.
    const ok = await request('/');
    assert.strictEqual(ok.status, 200);
    assert.strictEqual(child.exitCode, null, 'server process should still be running');
});

test('sensitive server/dependency files are not downloadable', async () => {
    for (const rawPath of [
        '/package.json',
        '/package-lock.json',
        '/frontserver.js',
        '/.env',
        '/node_modules/express/package.json'
    ]) {
        const res = await request(rawPath);
        assert.ok([403, 404].includes(res.status), `${rawPath} must not be served (got ${res.status})`);
        assert.ok(!String(res.body).includes('"dependencies"'), `${rawPath} leaked file contents`);
    }
});

test('directory traversal is blocked', async () => {
    for (const rawPath of [
        '/../backend/database.js',
        '/..%2fbackend%2fdatabase.js',
        '/%2e%2e/backend/database.js',
        '/banner/../../backend/.env'
    ]) {
        const res = await request(rawPath);
        assert.ok([400, 403, 404].includes(res.status), `${rawPath} must be rejected (got ${res.status})`);
        assert.ok(!String(res.body).includes('DB_PASSWORD'), `${rawPath} leaked backend config`);
    }
});

test('non-GET methods are rejected', async () => {
    const res = await request('/', 'POST');
    assert.strictEqual(res.status, 405);
});

test('HEAD returns headers without a body', async () => {
    const res = await request('/', 'HEAD');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.length, 0);
});
