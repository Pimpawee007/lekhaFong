#!/usr/bin/env node
/*
 * Verify image candidate URLs without publishing or downloading them.
 *
 * LeKhaFong keeps retailer/B&H images as candidates only until reuse permission
 * is confirmed. This script checks that the recorded product and image URLs are
 * still reachable and that image endpoints return an image MIME type.
 *
 * Usage: node scripts/verify-image-candidates.js
 */
const fs = require('fs');
const path = require('path');

const UA = 'LeKhaFongAcademicCatalog/1.0 (candidate verification only)';
const manifestPath = path.join(__dirname, '..', 'sources', 'image-sources.json');
const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

async function probe(url, { expectImage = false, allowBlocked = false } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            headers: { 'User-Agent': UA },
            signal: controller.signal
        });
        const type = response.headers.get('content-type') || '';
        // Do not stream the body; the goal is reachability and MIME validation.
        try { await response.body?.cancel(); } catch { /* ignore */ }
        const okStatus = response.status === 200 || (allowBlocked && response.status === 403);
        const okType = !expectImage || type.startsWith('image/');
        return { ok: okStatus && okType, status: response.status, type };
    } catch (error) {
        return { ok: false, status: 0, type: '', error: error.message };
    } finally {
        clearTimeout(timer);
    }
}

(async () => {
    const checks = [];

    for (const c of data.retailer_candidates || []) {
        checks.push({
            label: `retailer ${c.retailer} listing #${c.equipment_id}`,
            url: c.product_page_url,
            options: {}
        });
        checks.push({
            label: `retailer ${c.retailer} image #${c.equipment_id}`,
            url: c.image_url,
            options: { expectImage: true }
        });
    }

    for (const c of data.bh_candidates || []) {
        checks.push({
            label: `B&H listing #${c.equipment_id} (${c.bh_product_id})`,
            url: c.bh_product_url,
            options: { allowBlocked: true }
        });
        checks.push({
            label: `B&H CDN image #${c.equipment_id} (${c.bh_product_id})`,
            url: c.bh_image_url,
            options: { expectImage: true }
        });
    }

    let failures = 0;
    for (const check of checks) {
        const result = await probe(check.url, check.options);
        if (!result.ok) failures += 1;
        const mark = result.ok ? 'OK  ' : 'FAIL';
        console.log(`${mark} ${check.label} -> ${result.status || 'ERR'} ${result.type}${result.error ? ` (${result.error})` : ''}`);
    }

    console.log(`\nChecked ${checks.length} URLs; failures: ${failures}`);
    console.log('No candidate image was downloaded, converted, or published by this script.');
    process.exit(failures === 0 ? 0 : 1);
})();
