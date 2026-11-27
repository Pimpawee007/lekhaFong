#!/usr/bin/env python3
"""
LeKhaFong approved-image processor.

This is the reuse of HALIDE's practical image-processing idea (keep a source,
normalize locally, publish a web derivative) adapted to LeKhaFong's existing
single-WebP architecture.

It NEVER downloads an image and NEVER checks permission. Run it only after a
photograph has been approved for publication and its source metadata has been
recorded in sources/image-sources.json.

Usage:
    python3 scripts/process-approved-image.py INPUT OUTPUT

Output:
    - 1200 x 1200 WebP, quality 90
    - product scaled without upscaling into a 1080 x 1080 content box
    - centred on a canvas filled with the sampled edge colour
    - prints width, height, bytes and SHA-256 as JSON
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


def sha256(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_rgb(path):
    image = Image.open(path)
    image.load()
    image = ImageOps.exif_transpose(image)
    if image.mode in ("RGBA", "LA", "P"):
        image = image.convert("RGBA")
        background = Image.new("RGBA", image.size, (247, 247, 247, 255))
        image = Image.alpha_composite(background, image).convert("RGB")
    else:
        image = image.convert("RGB")
    return image


def edge_background(image):
    width = height = 64
    sample = image.resize((width, height))
    pixels = list(sample.getdata())
    ring = []
    for x in range(width):
        ring.append(pixels[x])
        ring.append(pixels[(height - 1) * width + x])
    for y in range(height):
        ring.append(pixels[y * width])
        ring.append(pixels[y * width + (width - 1)])
    return tuple(int(statistics.median(p[i] for p in ring)) for i in range(3))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("output")
    args = parser.parse_args()

    if not os.path.isfile(args.input):
        sys.exit(f"input not found: {args.input}")

    image = load_rgb(args.input)
    background = edge_background(image)
    scale = min(CONTENT / image.width, CONTENT / image.height, 1.0)
    resized = image.resize(
        (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
        Image.LANCZOS,
    )
    canvas = Image.new("RGB", (CANVAS, CANVAS), background)
    canvas.paste(resized, ((CANVAS - resized.width) // 2, (CANVAS - resized.height) // 2))
    canvas.save(args.output, "WEBP", quality=QUALITY, method=6)

    check = Image.open(args.output)
    check.load()
    if check.size != (CANVAS, CANVAS):
        sys.exit(f"output validation failed: {check.size}")

    print(json.dumps({
        "output": os.path.abspath(args.output),
        "width": CANVAS,
        "height": CANVAS,
        "content_width": resized.width,
        "content_height": resized.height,
        "canvas_background": "#%02X%02X%02X" % background,
        "bytes": os.path.getsize(args.output),
        "sha256": sha256(args.output),
        "format": "WebP",
        "quality": QUALITY,
        "upscaled": scale > 1.0,
    }, indent=2))


if __name__ == "__main__":
    main()
