'use strict';

// Read-only browser regression checks for the UI fixes.
//
// The script does not submit rentals, register users, upload files, or save
// products. It only exercises client-side state and reads the catalog/admin
// data that the app already exposes.
//
// Prerequisites:
//   npm install --no-save playwright-core
//   npx playwright install chromium
//   backend on http://localhost:3031 and frontend on http://localhost:3030
//
// Run:
//   QA_E2E_BASE=http://localhost:3030 node tests/e2e/qa-ui.cjs
// Optional:
//   CHROME_PATH=/path/to/chrome node tests/e2e/qa-ui.cjs

const { chromium } = require('playwright-core');

const BASE = process.env.QA_E2E_BASE || 'http://localhost:3030';
const CHROME_PATH = process.env.CHROME_PATH || '';
const results = [];
function check(name, ok, extra = '') {
    results.push({ name, ok: !!ok });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -- ' + extra : ''}`);
}

async function waitForCards(page, min = 1) {
    await page.waitForFunction(n => document.querySelectorAll('.card').length >= n, min, { timeout: 15000 });
}

function isoDaysFromToday(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

(async () => {
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox'],
        ...(CHROME_PATH ? { executablePath: CHROME_PATH } : {})
    });

    try {
        // ---------------- Sorting + favourites ----------------
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));

        await page.goto(`${BASE}/?page=search`, { waitUntil: 'domcontentloaded' });
        await waitForCards(page);
        const originalNames = await page.$$eval('.card h3', els => els.map(e => e.textContent.trim()));

        await page.selectOption('#catalog-sort', 'price-asc');
        let prices = await page.$$eval('.card .price b', els => els.map(e => Number(e.textContent.replace(/[^0-9]/g, ''))));
        check('price ascending', prices.every((v, i) => i === 0 || prices[i - 1] <= v));

        await page.selectOption('#catalog-sort', 'price-desc');
        prices = await page.$$eval('.card .price b', els => els.map(e => Number(e.textContent.replace(/[^0-9]/g, ''))));
        check('price descending', prices.every((v, i) => i === 0 || prices[i - 1] >= v));

        await page.selectOption('#catalog-sort', 'name-asc');
        let names = await page.$$eval('.card h3', els => els.map(e => e.textContent.trim()));
        check('name A-Z (Thai/English locale)', names.every((v, i) => i === 0 || names[i - 1].localeCompare(v, 'th', { sensitivity: 'base', numeric: true }) <= 0));

        await page.selectOption('#catalog-sort', 'name-desc');
        names = await page.$$eval('.card h3', els => els.map(e => e.textContent.trim()));
        check('name Z-A', names.every((v, i) => i === 0 || names[i - 1].localeCompare(v, 'th', { sensitivity: 'base', numeric: true }) >= 0));

        await page.selectOption('#catalog-sort', 'default');
        names = await page.$$eval('.card h3', els => els.map(e => e.textContent.trim()));
        check('default order restored', JSON.stringify(names) === JSON.stringify(originalNames));

        await page.selectOption('#catalog-sort', 'price-asc');
        await page.click('[data-type-chip="0"]');
        const filtered = await page.$$eval('.card', els => els.map(el => ({
            cat: el.querySelector('.card-cat')?.textContent.trim(),
            price: Number(el.querySelector('.price b')?.textContent.replace(/[^0-9]/g, ''))
        })));
        check('sort + category filter combine', filtered.every(f => f.cat === 'กล้อง') && filtered.every((f, i) => i === 0 || filtered[i - 1].price <= f.price));

        await page.evaluate(() => localStorage.removeItem('lekhafong_favorites'));
        await page.goto(`${BASE}/?page=search`, { waitUntil: 'domcontentloaded' });
        await waitForCards(page);
        const firstId = await page.$eval('.card .fav', el => el.dataset.favId);
        await page.click('.card .fav');
        check('favourite adds .on state', await page.$eval('.card .fav', el => el.classList.contains('on')));
        let stored = await page.evaluate(() => JSON.parse(localStorage.getItem('lekhafong_favorites') || '[]'));
        check('favourite stored by stable id', stored.length === 1 && stored[0] === firstId);

        await page.reload({ waitUntil: 'domcontentloaded' });
        await waitForCards(page);
        check('favourite survives refresh', await page.$eval('.card .fav', el => el.classList.contains('on')));

        await page.goto(`${BASE}/?page=detail&id=${firstId}`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.fav-toggle');
        check('detail heart reflects favourite', await page.$eval('.fav-toggle', el => el.classList.contains('on')));
        await page.click('.fav-toggle');
        check('detail heart can remove favourite', await page.$eval('.fav-toggle', el => !el.classList.contains('on')));

        await page.goto(`${BASE}/?page=search`, { waitUntil: 'domcontentloaded' });
        await waitForCards(page);
        await page.locator('.card .fav').nth(0).click();
        await page.locator('.card .fav').nth(1).click();
        await page.click('button[aria-label^="รายการโปรด"]');
        await page.waitForFunction(() => document.querySelectorAll('.card').length === 2);
        check('favourites-only view shows only favourites', (await page.$$eval('.card .fav', els => els.length)) === 2);

        await page.click('[data-type-chip="0"]');
        const leftFavouritesMode = await page.evaluate(() => !state.filters.onlyFavorites && document.querySelectorAll('.card').length > 2);
        check('normal catalog navigation exits favourites mode', leftFavouritesMode);

        await page.evaluate(() => localStorage.setItem('lekhafong_favorites', '{broken'));
        await page.goto(`${BASE}/?page=search`, { waitUntil: 'domcontentloaded' });
        await waitForCards(page);
        check('corrupted favourites storage recovers', await page.evaluate(() => localStorage.getItem('lekhafong_favorites') === null));

        check('no uncaught errors (catalog)', errors.length === 0, errors.join('; '));
        await ctx.close();

        // ---------------- Delivery / rental pricing ----------------
        const rentalCtx = await browser.newContext();
        await rentalCtx.addInitScript(() => {
            localStorage.setItem('lekhafong_auth', JSON.stringify({ id: 2, customer_id: 1, username: 'qa_customer', role: 'Customer' }));
        });
        const rp = await rentalCtx.newPage();
        const rentalErrors = [];
        rp.on('pageerror', e => rentalErrors.push(e.message));
        await rp.goto(`${BASE}/?page=search`, { waitUntil: 'domcontentloaded' });
        await waitForCards(rp);
        const rentalProduct = await rp.evaluate(() => {
            const p = P.find(x => x.status === 'Available' && Number(x.stock) > 0) || P[0];
            return { id: p.id, rate: Number(p.p) || 0 };
        });
        const detailId = rentalProduct.id;
        const dailyRate = rentalProduct.rate;

        await rp.goto(`${BASE}/?page=detail&id=${detailId}`, { waitUntil: 'domcontentloaded' });
        await rp.waitForSelector('#rent-start-date');
        const start = isoDaysFromToday(10);
        const threeDays = isoDaysFromToday(13);
        await rp.fill('#rent-start-date', start);
        await rp.fill('#rent-return-date', threeDays);
        let estimate = await rp.textContent('#rental-estimate');
        const equipmentTotal = (dailyRate * 3).toLocaleString('en-US');
        check('pickup estimate excludes delivery', estimate.includes(equipmentTotal) && estimate.includes('ฟรี'), estimate.replace(/\s+/g, ' ').trim());

        await rp.check('input[name="pickup_method"][value="จัดส่งถึงที่"]');
        estimate = await rp.textContent('#rental-estimate');
        const grandTotal = (dailyRate * 3 + 150).toLocaleString('en-US');
        check('delivery adds 150 to grand total', estimate.includes('150') && estimate.includes(grandTotal), estimate.replace(/\s+/g, ' ').trim());

        await rp.click('button:has-text("เช่าเลย")');
        await rp.waitForSelector('#rental-confirm-popup');
        const popup = await rp.textContent('#rental-confirm-popup');
        check('confirmation breaks out equipment + delivery + total', popup.includes('ค่าจัดส่ง') && popup.includes('150') && popup.includes(grandTotal));

        await rp.goBack();
        await rp.waitForFunction(() => !document.getElementById('rental-confirm-popup'));
        check('Back closes rental popup without leaving detail', await rp.evaluate(() => location.search.includes('page=detail')));

        check('no uncaught errors (rental)', rentalErrors.length === 0, rentalErrors.join('; '));
        await rentalCtx.close();

        // ---------------- History / deep links / forgot password ----------------
        const navCtx = await browser.newContext();
        const np = await navCtx.newPage();
        await np.goto(`${BASE}/?page=search`, { waitUntil: 'domcontentloaded' });
        await waitForCards(np);
        await np.click('.card');
        await np.waitForFunction(() => location.search.includes('page=detail'));
        const title = await np.textContent('h1');
        await np.reload({ waitUntil: 'domcontentloaded' });
        await np.waitForSelector('h1');
        check('detail deep link survives reload', (await np.textContent('h1')) === title);
        await np.goBack();
        await np.waitForFunction(() => location.search.includes('page=search'));
        check('Back returns to catalog', true);
        await np.goForward();
        await np.waitForFunction(() => location.search.includes('page=detail'));
        check('Forward returns to detail', true);

        await np.goto(`${BASE}/?page=home`, { waitUntil: 'domcontentloaded' });
        await np.click('#nav-login-btn');
        await np.click('text=Forgot password?');
        await np.waitForSelector('.toast');
        check('forgot password toast mentions administrator', (await np.textContent('.toast')).includes('ติดต่อผู้ดูแลระบบ'));

        await np.evaluate(() => switchAuthTab('signup'));
        const phoneValidity = await np.evaluate(() => {
            const input = document.getElementById('su-phone');
            const out = {};
            for (const value of ['0812345678', '081-234-5678', '081ABC2345678', '12345']) {
                input.value = value;
                out[value] = input.checkValidity();
            }
            return out;
        });
        check('phone input accepts both formats', phoneValidity['0812345678'] && phoneValidity['081-234-5678']);
        check('phone input rejects invalid content/length', !phoneValidity['081ABC2345678'] && !phoneValidity['12345']);

        const phoneToasts = await np.evaluate(async () => {
            document.getElementById('su-first').value = 'QA';
            document.getElementById('su-last').value = 'Tester';
            document.getElementById('su-email').value = 'qa@example.test';
            document.getElementById('su-username').value = 'qa_phone_check';
            document.getElementById('su-password').value = 'secret';
            document.getElementById('su-phone').value = '081ABC2345678';
            await handleSignupSubmit({ preventDefault() {} });
            return [...document.querySelectorAll('.toast .toast-msg')].map(el => el.textContent);
        });
        check('invalid phone shows a useful validation toast', phoneToasts.some(m => m.includes('เบอร์โทรศัพท์มือถือ')), phoneToasts.join(' | '));
        await navCtx.close();

        // ---------------- Admin image state (no DB writes) ----------------
        const adminCtx = await browser.newContext();
        await adminCtx.addInitScript(() => {
            localStorage.setItem('lekhafong_auth', JSON.stringify({ id: 1, admin_id: 1, username: 'qa_admin', role: 'Admin' }));
        });
        const ap = await adminCtx.newPage();
        const adminErrors = [];
        ap.on('pageerror', e => adminErrors.push(e.message));
        await ap.goto(`${BASE}/?page=admin`, { waitUntil: 'domcontentloaded' });
        await ap.waitForFunction(() => {
            const tbody = document.getElementById('admin-products-tbody');
            return tbody && tbody.querySelectorAll('tr').length > 0 && !tbody.textContent.includes('กำลังโหลด');
        }, null, { timeout: 15000 });

        const switchResult = await ap.evaluate(() => {
            const a = adminProductsCache[0];
            const b = adminProductsCache[1] || adminProductsCache[0];
            openProductDetailById(a.equipment_id);
            const aState = JSON.parse(JSON.stringify(activeProductImages));
            openProductDetailById(b.equipment_id);
            const bState = JSON.parse(JSON.stringify(activeProductImages));
            const parse = v => Array.isArray(v) ? v : (v ? JSON.parse(v) : []);
            return {
                a: { id: a.equipment_id, main: a.main_image || '', details: parse(a.detail_images), state: aState },
                b: { id: b.equipment_id, main: b.main_image || '', details: parse(b.detail_images), state: bState }
            };
        });
        check('opening A initialises A image state', switchResult.a.state.productId === String(switchResult.a.id) && switchResult.a.state.main_image === switchResult.a.main);
        check('switching A->B never carries A images', switchResult.b.state.main_image === switchResult.b.main && JSON.stringify(switchResult.b.state.detail_images.filter(Boolean)) === JSON.stringify(switchResult.b.details.filter(Boolean)));

        const payload = await ap.evaluate((id) => {
            openProductDetailById(id);
            let captured = null;
            const original = window.apiAdminUpdateProduct;
            window.apiAdminUpdateProduct = async (_id, data) => { captured = data; };
            submitProductUpdate();
            window.apiAdminUpdateProduct = original;
            return captured;
        }, switchResult.b.id);
        check('edit B without image modal keeps B images', (payload?.main_image || '') === switchResult.b.main && JSON.stringify(payload?.detail_images || []) === JSON.stringify(switchResult.b.details.filter(Boolean)));

        const normalized = await ap.evaluate(async (id) => {
            openProductDetailById(id);
            openProductImageModal('edit');
            const originalUpload = window.apiUploadImageFile;
            window.apiUploadImageFile = async () => '/uploads/qa-mock.png';
            imageModalDraft.main = 'blob:qa-preview';
            imageModalDraft.mainFile = new File(['x'], 'x.png', { type: 'image/png' });
            await confirmProductImageModal();
            window.apiUploadImageFile = originalUpload;
            const active = { ...activeProductImages };
            backToProductList();
            return {
                active,
                backendToRelative: normalizeImagePath('http://localhost:3031/uploads/x.png'),
                relativeToBackend: resolveImageUrl('/uploads/x.png')
            };
        }, switchResult.a.id);
        check('uploaded preview becomes one relative /uploads path', normalized.active.main_image === '/uploads/qa-mock.png');
        check('image URL helpers avoid duplicate origins', normalized.backendToRelative === '/uploads/x.png' && normalized.relativeToBackend.endsWith('/uploads/x.png') && !normalized.relativeToBackend.includes('/uploads/uploads'));

        check('no uncaught errors (admin)', adminErrors.length === 0, adminErrors.join('; '));
        await adminCtx.close();
    } finally {
        await browser.close();
    }

    const failed = results.filter(r => !r.ok);
    console.log(`\nSUMMARY: ${results.length - failed.length}/${results.length} passed`);
    if (failed.length) {
        console.log('FAILED:', failed.map(f => f.name).join(' | '));
        process.exit(1);
    }
})().catch(err => {
    console.error('FATAL', err);
    process.exit(2);
});
