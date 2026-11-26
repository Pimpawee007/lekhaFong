'use strict';

// Registration / product-image regression tests for the Express API.
//
// IMPORTANT: these tests create users and edit a product. They must only be
// pointed at a disposable test database, never at the development database.
//
// Recommended usage:
//   1. Start an isolated MariaDB instance and import the schema (without the
//      destructive DROP DATABASE header) into a database such as lekhafong_test.
//   2. Start the API against that database, e.g.
//        PORT=3101 DB_HOST=127.0.0.1 DB_PORT=3307 DB_USER=test \
//        DB_PASSWORD=test DB_NAME=lekhafong_test node backend/database.js
//   3. Run:
//        QA_TEST_DB_CONFIRMED=1 QA_API_BASE=http://localhost:3101 \
//        node --test tests/backend-registration.test.js
//
// Without QA_TEST_DB_CONFIRMED=1 every test is skipped so an accidental run
// against the development database cannot create test users.

const { test, before } = require('node:test');
const assert = require('node:assert');

const CONFIRMED = process.env.QA_TEST_DB_CONFIRMED === '1';
const BASE = process.env.QA_API_BASE || 'http://localhost:3101';
let apiAvailable = false;

before(async () => {
    if (!CONFIRMED) return;
    try {
        const res = await fetch(`${BASE}/api/products`);
        apiAvailable = res.ok;
    } catch {
        apiAvailable = false;
    }
});

function skipUnlessDisposable(t) {
    if (!CONFIRMED) {
        t.skip('Set QA_TEST_DB_CONFIRMED=1 and QA_API_BASE to a disposable test API to run write tests.');
        return false;
    }
    if (!apiAvailable) {
        t.skip(`Test API not reachable at ${BASE}.`);
        return false;
    }
    return true;
}

async function post(path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    let data = {};
    try { data = await res.json(); } catch { /* ignore */ }
    return { status: res.status, data };
}

async function put(path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    let data = {};
    try { data = await res.json(); } catch { /* ignore */ }
    return { status: res.status, data };
}

function unique(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function registration(overrides = {}) {
    const suffix = unique('qa');
    return {
        first_name: 'QA',
        last_name: 'Tester',
        email: `${suffix}@example.test`,
        phone: '0812345678',
        address: 'Bangkok',
        username: suffix,
        password: 'secret123',
        ...overrides
    };
}

test('valid registration succeeds', async t => {
    if (!skipUnlessDisposable(t)) return;
    const body = registration();
    const res = await post('/api/auth/register', body);
    assert.strictEqual(res.status, 200, JSON.stringify(res.data));
    assert.strictEqual(res.data.success, true);
});

test('missing, null and empty passwords are rejected with 400', async t => {
    if (!skipUnlessDisposable(t)) return;
    for (const password of [undefined, null, '']) {
        const body = registration();
        if (password === undefined) delete body.password;
        else body.password = password;
        const res = await post('/api/auth/register', body);
        assert.strictEqual(res.status, 400, `password=${String(password)} should be rejected`);
        assert.strictEqual(res.data.success, false);
    }
});

test('duplicate username returns 409', async t => {
    if (!skipUnlessDisposable(t)) return;
    const first = registration();
    const created = await post('/api/auth/register', first);
    assert.strictEqual(created.status, 200);

    const duplicate = registration({ username: first.username });
    const res = await post('/api/auth/register', duplicate);
    assert.strictEqual(res.status, 409, JSON.stringify(res.data));
});

test('duplicate email returns 409', async t => {
    if (!skipUnlessDisposable(t)) return;
    const first = registration();
    const created = await post('/api/auth/register', first);
    assert.strictEqual(created.status, 200);

    const duplicate = registration({ email: first.email });
    const res = await post('/api/auth/register', duplicate);
    assert.strictEqual(res.status, 409, JSON.stringify(res.data));
});

test('both supported phone formats are accepted', async t => {
    if (!skipUnlessDisposable(t)) return;
    for (const phone of ['0812345678', '081-234-5678', '0891234567', '099-123-4567']) {
        const res = await post('/api/auth/register', registration({ phone }));
        assert.strictEqual(res.status, 200, `${phone} should be accepted: ${JSON.stringify(res.data)}`);
    }
});

test('invalid phone numbers are rejected with 400', async t => {
    if (!skipUnlessDisposable(t)) return;
    for (const phone of ['12345', '08123456789', '081-ABC-1234', '081ABC2345678', '081+234+5678', '0712345678', '', null]) {
        const res = await post('/api/auth/register', registration({ phone }));
        assert.strictEqual(res.status, 400, `${String(phone)} should be rejected: ${JSON.stringify(res.data)}`);
    }
});

test('concurrent duplicate usernames yield exactly one success', async t => {
    if (!skipUnlessDisposable(t)) return;
    const username = unique('race');
    const requests = Array.from({ length: 6 }, (_, i) => post('/api/auth/register', registration({
        username,
        email: `race_${i}_${Date.now()}_${Math.random().toString(16).slice(2, 6)}@example.test`
    })));
    const statuses = (await Promise.all(requests)).map(r => r.status).sort();
    assert.strictEqual(statuses.filter(s => s === 200).length, 1, statuses.join(','));
    assert.strictEqual(statuses.filter(s => s === 409).length, 5, statuses.join(','));
});

test('product edit without image fields preserves existing images', async t => {
    if (!skipUnlessDisposable(t)) return;
    const productsRes = await fetch(`${BASE}/api/products`);
    const products = await productsRes.json();
    assert.ok(Array.isArray(products) && products.length > 0, 'test DB needs at least one product');
    const product = products[0];

    const imageUpdate = {
        name: product.name,
        type: product.type,
        brand: product.brand,
        serial_number: product.serial_number,
        description: product.description,
        model_series: product.model_series,
        daily_rate: product.daily_rate,
        stock: product.stock,
        status: product.status,
        main_image: '/uploads/qa-main.png',
        detail_images: ['/uploads/qa-detail-1.png', '/uploads/qa-detail-2.png']
    };
    const setRes = await put(`/api/products/${product.equipment_id}`, imageUpdate);
    assert.strictEqual(setRes.status, 200, JSON.stringify(setRes.data));

    const withoutImages = { ...imageUpdate };
    delete withoutImages.main_image;
    delete withoutImages.detail_images;
    const editRes = await put(`/api/products/${product.equipment_id}`, withoutImages);
    assert.strictEqual(editRes.status, 200, JSON.stringify(editRes.data));

    const after = await (await fetch(`${BASE}/api/products`)).json();
    const updated = after.find(p => p.equipment_id === product.equipment_id);
    assert.strictEqual(updated.main_image, '/uploads/qa-main.png');
    assert.deepStrictEqual(JSON.parse(updated.detail_images), ['/uploads/qa-detail-1.png', '/uploads/qa-detail-2.png']);

    // Restore the fixture's original images.
    const restore = {
        ...withoutImages,
        main_image: product.main_image,
        detail_images: Array.isArray(product.detail_images)
            ? product.detail_images
            : (product.detail_images ? JSON.parse(product.detail_images) : [])
    };
    await put(`/api/products/${product.equipment_id}`, restore);
});
