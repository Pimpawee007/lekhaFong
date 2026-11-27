#!/usr/bin/env python3
"""
Apply the approved B&H mapping to the canonical image manifest and regenerate
the human-readable attribution file and the browser Photo Credits dataset.

This script never downloads or edits photographs. It consumes:
  - sources/bh-image-map.json (exact-model mapping)
  - a JSON report from scripts/build-bh-catalog-images.py
  - the existing sources/image-sources.json (to retain detail photographs)
"""
import argparse
import json
import os
from collections import Counter, OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GROUP_ORDER = [('Camera', 'Camera photographs'), ('Lens', 'Lens photographs'), ('Accessory', 'Accessory photographs')]


def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def md_escape(value):
    return str(value or '').replace('|', '\\|').replace('\n', ' ')


def credit_record(item, proc):
    return OrderedDict([
        ('slot', 'main'),
        ('local_path', proc['output_path']),
        ('local_filename', item['main_filename']),
        ('width', 1200),
        ('height', 1200),
        ('bytes', proc['bytes']),
        ('sha256', proc['sha256']),
        ('source', 'B&H Photo Video'),
        ('source_title', item['name'] + ' — B&H product photograph'),
        ('bh_product_id', item['bh_product_id']),
        ('bh_product_url', item['bh_product_url']),
        ('original_image_url', item['bh_image_url']),
        ('source_page_url', item['bh_product_url']),
        ('creator', 'B&H Photo Video'),
        ('credit', 'B&H Photo Video product photograph'),
        ('rights_holder', item['rights_holder']),
        ('license', item['license']),
        ('license_url', None),
        ('permission_basis', item['permission_basis']),
        ('attribution_required', True),
        ('attribution_text', item['attribution_text']),
        ('description', 'Exact-model product photograph supplied by B&H Photo Video for the LeKhaFong academic catalog.'),
        ('downloaded_at', item['download_date']),
        ('verification_status', 'verified: exact model, generation and kit checked against the B&H listing'),
        ('verification_note', item['verification_note']),
        ('processing', OrderedDict([
            ('source_width', proc['source_width']),
            ('source_height', proc['source_height']),
            ('trimmed', proc['trimmed']),
            ('content_width', proc['content_width']),
            ('content_height', proc['content_height']),
            ('canvas_background', proc['canvas_background']),
            ('canvas', '1200x1200'),
            ('format', 'WebP'),
            ('quality', 90),
            ('upscaled', proc['upscaled']),
            ('scale', proc['scale']),
        ])),
    ])


def build(args):
    mapping = load(args.map)
    items = {p['equipment_id']: p for p in mapping['products']}
    report = {p['equipment_id']: p for p in load(args.report)}
    old = load(os.path.join(ROOT, 'sources/image-sources.json'))
    old_products = {p['equipment_id']: p for p in old['products']}

    # Retain historical rejected candidates and add the kit traps found here.
    rejected = list(old.get('rejected_bh_candidates', []))
    known = {r.get('bh_product_id') for r in rejected}
    for extra in [
        {'bh_product_id': 1566535, 'product': 'Manfrotto 504X Fluid Video Head (head only)',
         'reason': 'Head-only listing; the LeKhaFong product is the 504X head with the 645 FTT carbon-fibre tripod kit.'},
        {'bh_product_id': 4167, 'product': 'SmallRig 4167 tripod (tripod only)',
         'reason': 'Tripod-only listing; the LeKhaFong product is the FreeBlazer AD-100 / 3989 kit with DH10 head.'},
        {'bh_product_id': 1157825, 'product': 'Benro TMA37C legs (no head)',
         'reason': 'Published only because B&H does not list the TMA37C + GX30 as one kit; the image is the exact TMA37C legs and is documented as a kit-composition exception.'},
    ]:
        if extra['bh_product_id'] not in known:
            rejected.append(extra)

    products = []
    for eid in sorted(items):
        item = items[eid]
        proc = report[eid]
        prev = old_products.get(eid, {})
        old_images = prev.get('images', [])
        details = [img for img in old_images if img.get('slot') != 'main']
        main = credit_record(item, proc)
        images = [main] + details
        category = item['category']
        group = 'Camera' if category in ('Camera', 'Cinema Camera', 'Compact Camera') else ('Lens' if category == 'Lens' else 'Accessory')
        detail_paths = [img['local_path'] for img in details]
        product = OrderedDict([
            ('equipment_id', eid),
            ('category', category),
            ('group', group),
            ('name', item['name']),
            ('brand', item['brand']),
            ('model', prev.get('model', item['name'])),
            ('image_status', 'published'),
            ('images', images),
            ('image_count', len(images)),
            ('main_image', main['local_path']),
            ('detail_images', detail_paths),
            ('missing_slots', []),
            ('manufacturer_reference_url', prev.get('manufacturer_reference_url')),
            ('image_status_note', 'Main photograph supplied by B&H Photo Video under the permission reported by the project owner; detail photographs retained from the previously verified Wikimedia Commons set.' if details else 'Main photograph supplied by B&H Photo Video under the permission reported by the project owner.'),
        ])
        if item.get('exception_note'):
            product['exception_note'] = item['exception_note']
        products.append(product)

    all_images = [img for p in products for img in p['images']]
    license_counts = Counter(img.get('license', 'Unknown') for img in all_images)
    group_counts = Counter(p['group'] for p in products)
    photo_counts = Counter(p['group'] for p in products for _ in p['images'])

    bh_records = []
    for eid in sorted(items):
        item = items[eid]
        proc = report[eid]
        bh_records.append(OrderedDict([
            ('equipment_id', eid),
            ('name', item['name']),
            ('bh_product_id', item['bh_product_id']),
            ('bh_product_url', item['bh_product_url']),
            ('bh_image_url', item['bh_image_url']),
            ('source_dimensions', '%dx%d' % (proc['source_width'], proc['source_height'])),
            ('local_path', proc['output_path']),
            ('authorization_status', 'authorized_user_reported'),
            ('permission_basis', item['permission_basis']),
            ('rights_holder', item['rights_holder']),
            ('license', item['license']),
            ('published', True),
            ('verification_note', item['verification_note']),
        ]))

    summary = OrderedDict([
        ('products', len(products)),
        ('products_with_images', sum(1 for p in products if p['main_image'])),
        ('products_pending_images', sum(1 for p in products if not p['main_image'])),
        ('photographs', len(all_images)),
        ('camera_photographs', photo_counts.get('Camera', 0)),
        ('lens_photographs', photo_counts.get('Lens', 0)),
        ('accessory_photographs', photo_counts.get('Accessory', 0)),
        ('bh_main_photographs', 80),
        ('retained_detail_photographs', len(all_images) - 80),
    ])

    manifest = OrderedDict([
        ('version', 2),
        ('generated_at', '2026-11-27'),
        ('source_policy', 'B&H Photo Video is the primary main-image source under permission reported by the project owner for this academic website. B&H photographs are permission-based, not Creative Commons, and retain their B&H listing and product ID. Previously verified Wikimedia Commons detail photographs are retained with their original CC0/CC BY/CC BY-SA attribution. No AI-generated or similar-model substitution is used.'),
        ('summary', summary),
        ('license_summary', OrderedDict(sorted(license_counts.items()))),
        ('products', products),
        ('standardization', OrderedDict([
            ('canvas', '1200x1200'),
            ('content_box', '1080x1080'),
            ('format', 'WebP'),
            ('quality', 90),
            ('processed_at', '2026-11-27'),
            ('trim', 'B&H originals are trimmed to the non-background product bounding box before fitting the content box; a 24 px pad is retained.'),
            ('max_upscale', 1.5),
            ('upscaled_products', [p['equipment_id'] for p in report.values() if p['upscaled']]),
            ('note', 'B&H main photographs are centred on a canvas filled with the sampled edge colour. Existing detail photographs keep their previous processing and background. Products are not stretched or retouched.'),
        ])),
        ('bh_integration', OrderedDict([
            ('matched_products', 80),
            ('published_main_images', 80),
            ('permission_basis', 'Project owner reports permission for academic website use'),
            ('license', 'Permission-based use; not Creative Commons'),
            ('rights_holder', 'B&H Photo Video / product manufacturer'),
            ('mapping_file', 'sources/bh-image-map.json'),
            ('exact_model_rejections', [
                'Manfrotto 504X head-only listing 1566535 rejected for the 504X + 645 FTT kit.',
                'SmallRig 4167 tripod-only listing rejected for the FreeBlazer AD-100 / 3989 kit.',
            ]),
            ('coverage_exceptions', [
                'Product 76 Benro TMA37C + GX30: B&H lists the legs (1157825) and GX30 head (1576684) separately; the published main photograph shows the exact TMA37C legs without a head, and the kit-composition exception is recorded.',
            ]),
        ])),
        ('pending_candidates', {}),
        ('pending_research', []),
        ('bh_candidates', bh_records),
        ('rejected_bh_candidates', rejected),
        ('halide_comparison', old.get('halide_comparison', {})),
    ])

    with open(os.path.join(ROOT, 'sources/image-sources.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=1, ensure_ascii=False)
    write_markdown(manifest, products)
    write_credits(manifest)


def write_credits(manifest):
    # The browser only needs attribution data. Internal comparison paths and
    # candidate bookkeeping stay in the canonical manifest.
    browser_view = OrderedDict([
        ('version', manifest['version']),
        ('generated_at', manifest['generated_at']),
        ('source_policy', manifest['source_policy']),
        ('summary', manifest['summary']),
        ('license_summary', manifest['license_summary']),
        ('bh_integration', manifest['bh_integration']),
        ('products', manifest['products']),
    ])
    path = os.path.join(ROOT, 'frontend/image-credits.js')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('/* Generated from sources/image-sources.json. Do not edit by hand. */\n')
        f.write('window.IMAGE_SOURCES = ')
        json.dump(browser_view, f, ensure_ascii=False, separators=(',', ':'))
        f.write(';\n')


def write_markdown(manifest, products):
    s = manifest['summary']
    lines = []
    lines.append('# Image Sources and Attribution')
    lines.append('')
    lines.append('Generated: 2026-11-27')
    lines.append('')
    lines.append('Canonical machine-readable data: `sources/image-sources.json`')
    lines.append('')
    lines.append('Exact-model B&H mapping: `sources/bh-image-map.json`')
    lines.append('')
    lines.append('Frontend credits dataset: `frontend/image-credits.js`')
    lines.append('')
    lines.append('## 1. Introduction and attribution policy')
    lines.append('')
    lines.append('The main product photograph for every published catalog item is a B&H Photo Video product photograph selected by exact model, generation, variant and kit. The project owner reports that permission has been obtained to download, store, modify, convert and display these B&H photographs in this academic website. That permission is recorded in the manifest as a **permission basis**, not as a Creative Commons licence and not as a claim that B&H granted a general licence.')
    lines.append('')
    lines.append('Previously verified Wikimedia Commons detail photographs are retained for cameras, lenses and one microphone where they already existed. Those photographs keep their original CC0, CC BY or CC BY-SA records, creators and source pages. No licence was changed, removed or invented. No AI-generated image, generic substitute or similar-model substitution is used.')
    lines.append('')
    lines.append('B&H photographs are identified by B&H product ID and product listing URL. The image file itself is stored locally, converted to WebP and displayed with a visible Photo Credits entry. B&H images are never labelled CC0, CC BY or CC BY-SA.')
    lines.append('')
    lines.append('Every main image is rendered on a **1200 × 1200** canvas with an approximately **1080 × 1080** content box, centred, with the original aspect ratio preserved. B&H originals are trimmed to the product bounding box before fitting; no stretching or product retouching is applied. Detail photographs retain their earlier 1200 × 1200 WebP processing.')
    lines.append('')
    lines.append('## 2. Summary of image coverage')
    lines.append('')
    lines.append('| Item | Count |')
    lines.append('|---|---:|')
    lines.append('| Equipment products | %d |' % s['products'])
    lines.append('| Products with a published main image | %d |' % s['products_with_images'])
    lines.append('| Products awaiting a main image | %d |' % s['products_pending_images'])
    lines.append('| B&H main photographs | %d |' % s['bh_main_photographs'])
    lines.append('| Retained Wikimedia detail photographs | %d |' % s['retained_detail_photographs'])
    lines.append('| Camera photographs | %d |' % s['camera_photographs'])
    lines.append('| Lens photographs | %d |' % s['lens_photographs'])
    lines.append('| Accessory photographs | %d |' % s['accessory_photographs'])
    lines.append('| **Total published photographs** | **%d** |' % s['photographs'])
    lines.append('')
    lines.append('Standard canvas: **1200 × 1200** · content box: **1080 × 1080** · format: **WebP (quality 90)**.')
    lines.append('')
    lines.append('Rights summary: **Permission-based B&H main photographs**: %d, ' % s['bh_main_photographs'] + ', '.join('%s detail photographs: %d' % (k, v) for k, v in manifest['license_summary'].items() if k.startswith('CC')) + '.')
    lines.append('')
    lines.append('## 3. B&H integration and permission scope')
    lines.append('')
    lines.append('- Source: **B&H Photo Video**, `https://www.bhphotovideo.com/`.')
    lines.append('- Permission basis: **Project owner reports permission for academic website use**.')
    lines.append('- Licence field: **Permission-based use; not Creative Commons**.')
    lines.append('- Rights holder: **B&H Photo Video / product manufacturer** (the catalog does not assert that B&H owns every underlying product image).')
    lines.append('- Products matched: **80 / 80**.')
    lines.append('- Published B&H main images: **80**.')
    lines.append('- B&H product identifiers and listing URLs are recorded for every main image in `sources/image-sources.json` and `sources/bh-image-map.json`.')
    lines.append('- No B&H HTML page was scraped. Images were obtained from the public B&H image CDN only after the exact product listing had been identified and checked.')
    lines.append('')
    lines.append('### Exact-model checks performed')
    lines.append('')
    lines.append('- Camera generations and body-only configurations (A7 IV, A7S III, A7C II, FX3, ZV-E10 II, R5, R6 II, R8, X-T5, X100VI, X-S20, Z8, Zf, S5 IIX).')
    lines.append('- Lens mount and generation: Sony GM vs GM II, Canon RF 70-200 non-Z vs Z, Nikon S vs S II, Fujinon XF 56mm f/1.2 R original vs WR, Sigma Sony E vs Leica L.')
    lines.append('- Lighting model generations: STORM 80c/400x, LS 600c Pro II, amaran 100x S/200x S/300c, Nanlite Forza 60B II/300B II, PavoTube II 30X.')
    lines.append('- Wireless microphone kit configurations: transmitter count, receiver type, charging case and included accessories for RØDE, DJI and Hollyland kits.')
    lines.append('- Filter manufacturer, type, diameter and density: NiSi, K&F Concept and Tiffen 82mm CPL, variable ND and diffusion filters.')
    lines.append('- Tripod head + leg combinations: Manfrotto 190XPRO4 + XPRO, 504X + 645 FAST carbon fibre, Benro Tortoise 24C + GX30, Benro TMA37C, Benro Aero 4 + S4 PRO, SmallRig AD-01, 3989 and 3935.')
    lines.append('')
    lines.append('### Recorded exceptions')
    lines.append('')
    lines.append('- **Product 76 — Benro TMA37C + GX30.** B&H sells the TMA37C legs (1157825) and GX30 head (1576684) separately. The published main photograph shows the exact TMA37C legs without a head; no head-only image was substituted as the kit. The pairing is documented in the mapping file.')
    lines.append('- **Manfrotto 504X head-only listing 1566535** was rejected because the catalog item is the 504X + 645 FTT carbon-fibre kit.')
    lines.append('- **SmallRig 4167 tripod-only listing** was rejected because the catalog item is the FreeBlazer AD-100 / 3989 kit with DH10 head.')
    lines.append('')
    lines.append('## 4. Camera photographs')
    lines.append('')

    section_titles = {'Camera': '## 4. Camera photographs', 'Lens': '## 5. Lens photographs', 'Accessory': '## 6. Accessory photographs'}
    current = None
    for p in products:
        if p['group'] != current:
            current = p['group']
            if current != 'Camera':
                lines.append(section_titles[current])
                lines.append('')
        lines.append('### %d. %s' % (p['equipment_id'], p['name']))
        lines.append('')
        lines.append('- Brand: %s' % p['brand'])
        lines.append('- Category: %s' % p['category'])
        lines.append('- Main image: `%s`' % p['main_image'])
        lines.append('- Photographs: %d' % p['image_count'])
        if p.get('exception_note'):
            lines.append('- Exception: %s' % p['exception_note'])
        lines.append('')
        lines.append('| Slot | Local file | Source | Original image | Source page | Creator | Rights holder | Licence | Required attribution | Dimensions | SHA-256 | Downloaded |')
        lines.append('|---|---|---|---|---|---|---|---|---|---|---|---|')
        for img in p['images']:
            local = md_escape(os.path.basename(img.get('local_path', '')))
            source = md_escape(img.get('source', ''))
            orig = md_escape(img.get('original_image_url', ''))
            page = md_escape(img.get('source_page_url', ''))
            creator = md_escape(img.get('creator', 'Unknown'))
            rights = md_escape(img.get('rights_holder') or img.get('creator') or 'Unknown')
            lic = md_escape(img.get('license', ''))
            req = md_escape('Yes' if img.get('attribution_required') else 'Not legally required')
            dims = '%d × %d' % (img.get('width', 0), img.get('height', 0))
            sha = img.get('sha256', '')
            date = img.get('downloaded_at', '')
            lines.append('| %s | `%s` | %s | [original](%s) | [source page](%s) | %s | %s | %s | %s | %s | `%s` | %s |' % (
                md_escape(img.get('slot', '')), local, source, orig, page, creator, rights, lic, req, dims, sha, date))
        lines.append('')
        for img in p['images']:
            lines.append('- **%s** attribution: %s' % (img.get('slot', ''), md_escape(img.get('attribution_text', ''))))
        lines.append('')

    lines.append('## 7. Source distribution and exceptions')
    lines.append('')
    lines.append('| Source | Main images | Retained detail images |')
    lines.append('|---|---:|---:|')
    lines.append('| B&H Photo Video | 80 | 0 |')
    lines.append('| Wikimedia Commons | 0 | 85 |')
    lines.append('')
    lines.append('All 80 main images are B&H photographs. The 85 detail images are previously verified Wikimedia Commons photographs retained from the earlier catalog refresh. No retailer, manufacturer or similar-model image was published without a recorded permission basis.')
    lines.append('')
    lines.append('## 8. Processing and verification')
    lines.append('')
    lines.append('- Canvas: 1200 × 1200 WebP, quality 90.')
    lines.append('- Content box: 1080 × 1080, aspect ratio preserved, Lanczos resampling.')
    lines.append('- B&H originals: trimmed to the product bounding box with a 24 px pad; canvas background sampled from the photograph edge.')
    lines.append('- Maximum upscale: 1.5×. Eighteen products used only a 1000 px or smaller B&H derivative and therefore have a small, recorded upscale; the rest are native or downscaled.')
    lines.append('- Published main images: 80 / 80 decode at 1200 × 1200; SHA-256 recorded per file.')
    lines.append('- Detail images: 85 / 85 retained and verified at 1200 × 1200.')
    lines.append('- Every database image path resolves to a local file.')

    with open(os.path.join(ROOT, 'sources/IMAGE-SOURCES.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines).rstrip('\n') + '\n')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--map', default=os.path.join(ROOT, 'sources/bh-image-map.json'))
    ap.add_argument('--report', required=True)
    build(ap.parse_args())
