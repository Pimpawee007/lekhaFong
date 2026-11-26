'use strict';

// PORT validation tests. They do not connect to the development database:
// DB_PORT=1 makes the startup connectivity probe fail harmlessly.
//
// Run with: node --test tests/backend-port.test.js

const { test } = require('node:test');
const assert = require('node:assert');
const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');

const backend = path.join(__dirname, '..', 'backend', 'database.js');
const safeDbEnv = {
    DB_HOST: '127.0.0.1',
    DB_PORT: '1',
    DB_USER: 'unused',
    DB_PASSWORD: 'unused',
    DB_NAME: 'unused'
};

function runToExit(env, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [backend], {
            env: { ...process.env, ...safeDbEnv, ...env },
            stdio: ['ignore', 'pipe', 'pipe']
        });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', d => { stdout += d; });
        child.stderr.on('data', d => { stderr += d; });
        const timer = setTimeout(() => {
            child.kill();
            reject(new Error('backend did not exit in time'));
        }, timeoutMs);
        child.on('exit', code => {
            clearTimeout(timer);
            resolve({ code, stdout, stderr });
        });
        child.on('error', reject);
    });
}

function portIsFree(port) {
    return new Promise(resolve => {
        const s = net.createServer();
        s.once('error', () => resolve(false));
        s.once('listening', () => s.close(() => resolve(true)));
        s.listen(port, '127.0.0.1');
    });
}

test('invalid PORT fails fast with a clear error', async () => {
    const result = await runToExit({ PORT: 'abc' });
    assert.strictEqual(result.code, 1);
    assert.match(result.stderr + result.stdout, /Invalid PORT value "abc"/);
});

test('out-of-range PORT fails fast', async () => {
    const result = await runToExit({ PORT: '70000' });
    assert.strictEqual(result.code, 1);
    assert.match(result.stderr + result.stdout, /Invalid PORT value "70000"/);
});

test('missing/empty PORT falls back to 3031', async t => {
    const free = await portIsFree(3031);
    if (!free) {
        t.skip('port 3031 is already in use; stop the backend before running this test');
        return;
    }

    const child = spawn(process.execPath, [backend], {
        env: { ...process.env, ...safeDbEnv, PORT: '' },
        stdio: ['ignore', 'pipe', 'pipe']
    });
    let output = '';
    child.stdout.on('data', d => { output += d; });
    child.stderr.on('data', d => { output += d; });

    try {
        const started = Date.now();
        while (!output.includes('http://localhost:3031') && Date.now() - started < 8000) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        assert.match(output, /http:\/\/localhost:3031/);
    } finally {
        child.kill();
    }
});
