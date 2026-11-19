from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path
import base64
import http.client
import json
import math
import threading
from urllib.parse import urlsplit
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "tools" / "catalog-full.json"
QC_ARCHIVE = ROOT / "tools" / "main-qc.json"
OUTPUT = ROOT / "tools" / "image-features.json"
CHECKPOINT = ROOT / "tools" / "image-features.partial.json"
THREADS = 96
DESCRIPTOR_BYTES = 332
CONNECTIONS = threading.local()


def download(url):
    parsed = urlsplit(url)
    connections = getattr(CONNECTIONS, "hosts", {})
    CONNECTIONS.hosts = connections
    for attempt in range(2):
        connection = connections.get(parsed.netloc)
        if connection is None:
            connection = http.client.HTTPSConnection(parsed.netloc, timeout=20)
            connections[parsed.netloc] = connection
        try:
            path = parsed.path + (("?" + parsed.query) if parsed.query else "")
            connection.request("GET", path, headers={"User-Agent": "Mozilla/5.0 OOTDBuy-Sheetdesk-Indexer"})
            response = connection.getresponse()
            content = response.read()
            if response.status != 200:
                raise OSError(f"HTTP {response.status}")
            return content
        except (OSError, http.client.HTTPException):
            connection.close()
            connections.pop(parsed.netloc, None)
            if attempt:
                raise


def image_descriptor(source):
    source = ImageOps.exif_transpose(source).convert("RGB")
    mask = source.point(lambda value: 255 if value < 245 else 0).convert("L")
    box = mask.getbbox()
    if box:
        source = source.crop(box)
    source.thumbnail((22, 22), Image.Resampling.LANCZOS)
    image = Image.new("RGB", (24, 24), "white")
    image.paste(source, ((24 - source.width) // 2, (24 - source.height) // 2))
    pixels = image.load()
    values = []
    for by in range(6):
        for bx in range(6):
            totals = [0, 0, 0]
            for y in range(4):
                for x in range(4):
                    pixel = pixels[bx * 4 + x, by * 4 + y]
                    for channel in range(3):
                        totals[channel] += pixel[channel]
            values.extend(round(total / 16) for total in totals)
    for y in range(8, 16):
        for x in range(8, 15):
            left = sum(pixels[x, y])
            right = sum(pixels[x + 1, y])
            values.append(round(((left - right) / 765 + 1) * 127.5))
    foreground = [pixels[x, y] for y in range(24) for x in range(24) if min(pixels[x, y]) < 245]
    average = [round(sum(pixel[channel] for pixel in foreground) / len(foreground)) for channel in range(3)] if foreground else [255, 255, 255]
    values.extend(average * 8)
    hash_image = image.resize((9, 8), Image.Resampling.BILINEAR).convert("L")
    hash_pixels = hash_image.load()
    for y in range(8):
        value = 0
        for x in range(8):
            if hash_pixels[x, y] > hash_pixels[x + 1, y]:
                value |= 1 << (7 - x)
        values.append(value)
    for y in range(24):
        for byte_x in range(3):
            value = 0
            for bit in range(8):
                if min(pixels[byte_x * 8 + bit, y]) < 245:
                    value |= 1 << (7 - bit)
            values.append(value)
    grayscale = [[sum(pixels[x, y]) / 3 for x in range(24)] for y in range(24)]
    for cell_y in range(4):
        for cell_x in range(4):
            bins = [0.0] * 8
            for y in range(max(1, cell_y * 6), min(23, (cell_y + 1) * 6)):
                for x in range(max(1, cell_x * 6), min(23, (cell_x + 1) * 6)):
                    gradient_x = grayscale[y][x + 1] - grayscale[y][x - 1]
                    gradient_y = grayscale[y + 1][x] - grayscale[y - 1][x]
                    angle = math.atan2(gradient_y, gradient_x) % math.pi
                    bins[min(7, int(angle / math.pi * 8))] += math.hypot(gradient_x, gradient_y)
            total = sum(bins) or 1
            quantized = [min(15, round(value / total * 15)) for value in bins]
            for index in range(0, 8, 2):
                values.append((quantized[index] << 4) | quantized[index + 1])
    return base64.b64encode(bytes(max(0, min(255, value)) for value in values)).decode("ascii")


def descriptor(url):
    with Image.open(BytesIO(download(url))) as source:
        return image_descriptor(source)


def tile_descriptors(url):
    with Image.open(BytesIO(download(url))) as source:
        source = ImageOps.exif_transpose(source).convert("RGB")
        width, height = source.size
        tiles = []
        for columns, rows in ((2, 2), (2, 3)):
            for row in range(rows):
                for column in range(columns):
                    left = round(width * column / columns)
                    top = round(height * row / rows)
                    right = round(width * (column + 1) / columns)
                    bottom = round(height * (row + 1) / rows)
                    tiles.append(image_descriptor(source.crop((left, top, right, bottom))))
        return tiles


def main():
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    qc_archive = json.loads(QC_ARCHIVE.read_text(encoding="utf-8"))["items"]
    products = [item for category in catalog.values() for item in category["items"]]
    shoe_aids = {item["aid"] for item in catalog["2"]["items"]}
    image_sets = {
        item["aid"]: [item["image"], *qc_archive.get(item["aid"], {}).get("qc", [])]
        for item in products
    }
    features = {
        aid: [None] * len(urls)
        for aid, urls in image_sets.items()
    }
    tile_features = {aid: [] for aid in shoe_aids}
    if CHECKPOINT.exists():
        saved = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
        for aid, values in saved.items():
            if aid in features and len(values) == len(features[aid]) and all(value is None or len(base64.b64decode(value)) == DESCRIPTOR_BYTES for value in values):
                features[aid] = values
    elif OUTPUT.exists():
        saved = json.loads(OUTPUT.read_text(encoding="utf-8"))
        for aid, values in saved.items():
            base_count = len(features.get(aid, []))
            if base_count and len(values) >= base_count and all(len(base64.b64decode(value)) == DESCRIPTOR_BYTES for value in values):
                features[aid] = values[:base_count]
                if aid in tile_features and len(values[base_count:]) >= 10:
                    tile_features[aid] = values[base_count:base_count + 10]
    pending = [
        (aid, position, url)
        for aid, urls in image_sets.items()
        for position, url in enumerate(urls)
        if features[aid][position] is None
    ]
    failures = []
    with ThreadPoolExecutor(max_workers=THREADS) as executor:
        futures = {executor.submit(descriptor, url): (aid, position, url) for aid, position, url in pending}
        for done, future in enumerate(as_completed(futures), 1):
            aid, position, url = futures[future]
            try:
                features[aid][position] = future.result()
            except Exception as error:
                failures.append(((aid, position, url), str(error)))
            if done % 250 == 0:
                print(f"Indexed {done}/{len(pending)}; failures {len(failures)}", flush=True)
            if done % 1000 == 0:
                CHECKPOINT.write_text(json.dumps(features, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    if failures:
        CHECKPOINT.write_text(json.dumps(features, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        raise RuntimeError(f"Failed {len(failures)} images; rerun to retry them")
    tile_pending = [
        (aid, image_sets[aid][0])
        for aid in shoe_aids
        if not tile_features[aid]
    ]
    with ThreadPoolExecutor(max_workers=THREADS) as executor:
        futures = {executor.submit(tile_descriptors, url): (aid, url) for aid, url in tile_pending}
        for done, future in enumerate(as_completed(futures), 1):
            aid, url = futures[future]
            try:
                tile_features[aid] = future.result()
            except Exception as error:
                failures.append(((aid, "tiles", url), str(error)))
            if done % 100 == 0:
                print(f"Tiled {done}/{len(tile_pending)}; failures {len(failures)}", flush=True)
    if failures:
        raise RuntimeError(f"Failed {len(failures)} tile sets; rerun to retry them")
    output = {aid: values + tile_features.get(aid, []) for aid, values in features.items()}
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    CHECKPOINT.unlink(missing_ok=True)
    count = sum(len(value) for value in output.values())
    print(f"Saved {count} descriptors for {len(products)} products to {OUTPUT}")


if __name__ == "__main__":
    main()
