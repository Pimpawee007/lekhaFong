#!/usr/bin/env python3
"""
Build LeKhaFong's 1200 x 1200 WebP catalog images from approved B&H originals.

This script never downloads anything and never makes a rights decision. It only
processes local originals that were already selected and recorded in
sources/bh-image-map.json.

Usage:
    python3 scripts/build-bh-catalog-images.py --map sources/bh-image-map.json \
        --originals backups/bh-images-2026-11-27/originals \
        --uploads backend/uploads --report /tmp/bh-process-report.json
"""
import argparse
import hashlib
import json
import os
import statistics
import sys

from PIL import Image, ImageOps

CANVAS = 1200
CONTENT = 1080
QUALITY = 90
TRIM_THRESHOLD = 10
TRIM_PAD = 24


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load_rgb(path):
    image = Image.open(path)
    image.load()
    image = ImageOps.exif_transpose(image)
    if image.mode in ("RGBA", "LA", "P"):
        image = image.convert("RGBA")
        bg = Image.new("RGBA", image.size, (255, 255, 255, 255))
        image = Image.alpha_composite(bg, image).convert("RGB")
    else:
        image = image.convert("RGB")
    return image


def edge_background(image):
    w = h = 64
    sample = image.resize((w, h), Image.LANCZOS)
    px = list(sample.getdata())
    ring = []
    for x in range(w):
        ring.append(px[x])
        ring.append(px[(h - 1) * w + x])
    for y in range(h):
        ring.append(px[y * w])
        ring.append(px[y * w + (w - 1)])
    return tuple(int(statistics.median(p[i] for p in ring)) for i in range(3))


def trim_to_content(image, background):
    """Remove uniform studio margins. Returns (image, bbox) or original on failure."""
    w, h = image.size
    # Down-sample the mask calculation for speed, then scale the bbox back.
    probe = image.copy()
    probe.thumbnail((800, 800), Image.LANCZOS)
    pw, ph = probe.size
    pixels = probe.load()
    bx0, by0, bx1, by1 = pw, ph, -1, -1
    for y in range(ph):
        for x in range(pw):
            r, g, b = pixels[x, y]
            if max(abs(r - background[0]), abs(g - background[1]), abs(b - background[2])) > TRIM_THRESHOLD:
                if x < bx0: bx0 = x
                if x > bx1: bx1 = x
                if y < by0: by0 = y
                if y > by1: by1 = y
    if bx1 < 0 or by1 < 0:
        return image, (0, 0, w, h)
    sx = w / pw
    sy = h / ph
    box = (
        max(0, int((bx0 - 2) * sx) - TRIM_PAD),
        max(0, int((by0 - 2) * sy) - TRIM_PAD),
        min(w, int((bx1 + 3) * sx) + TRIM_PAD),
        min(h, int((by1 + 3) * sy) + TRIM_PAD),
    )
    if (box[2] - box[0]) < 40 or (box[3] - box[1]) < 40:
        return image, (0, 0, w, h)
    return image.crop(box), box


def process(src, dst, trim=True):
    image = load_rgb(src)
    background = edge_background(image)
    source_size = image.size
    bbox = None
    if trim:
        image, bbox = trim_to_content(image, background)
    # Fill the content box. A controlled maximum of 1.5x keeps very small
    # B&H derivatives usable without excessive interpolation. Every upscale is
    # reported so the coverage documentation stays accurate.
    scale = min(CONTENT / image.width, CONTENT / image.height, 1.5)
    resized = image.resize(
        (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
        Image.LANCZOS,
    )
    upscaled = resized.width > source_size[0] or resized.height > source_size[1]
    canvas = Image.new("RGB", (CANVAS, CANVAS), background)
    canvas.paste(resized, ((CANVAS - resized.width) // 2, (CANVAS - resized.height) // 2))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    canvas.save(dst, "WEBP", quality=QUALITY, method=6)

    check = Image.open(dst)
    check.load()
    if check.size != (CANVAS, CANVAS):
        sys.exit(f"output validation failed: {dst} {check.size}")
    data = open(dst, "rb").read()
    return {
        "source_width": source_size[0],
        "source_height": source_size[1],
        "trimmed": bool(trim and bbox and bbox != (0, 0, source_size[0], source_size[1])),
        "trim_box": list(bbox) if bbox else None,
        "content_width": resized.width,
        "content_height": resized.height,
        "canvas_background": "#%02X%02X%02X" % background,
        "width": CANVAS,
        "height": CANVAS,
        "bytes": len(data),
        "sha256": sha256_bytes(data),
        "format": "WebP",
        "quality": QUALITY,
        "upscaled": upscaled,
        "scale": round(scale, 4),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--map", required=True)
    ap.add_argument("--originals", required=True)
    ap.add_argument("--uploads", required=True)
    ap.add_argument("--report", required=True)
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    mapping = json.load(open(args.map, encoding="utf-8"))
    items = mapping["products"] if isinstance(mapping, dict) else mapping
    if args.limit:
        items = items[:args.limit]
    report = []
    for item in items:
        eid = item["equipment_id"]
        original = os.path.join(args.originals, item["original_filename"])
        if not os.path.isfile(original):
            sys.exit(f"missing original for {eid}: {original}")
        dst = os.path.join(args.uploads, item["catalog_dir"], item["main_filename"])
        meta = process(original, dst, trim=item.get("trim", True))
        meta.update({
            "equipment_id": eid,
            "name": item["name"],
            "source_path": original,
            "output_path": "/uploads/%s/%s" % (item["catalog_dir"], item["main_filename"]),
            "output_file": dst,
            "original_sha256": sha256_file(original),
        })
        report.append(meta)
        print(eid, meta["output_path"], meta["content_width"], meta["content_height"],
              meta["bytes"], "up" if meta["upscaled"] else "native")
    json.dump(report, open(args.report, "w", encoding="utf-8"), indent=1)
    print("PROCESSED", len(report))


if __name__ == "__main__":
    main()
