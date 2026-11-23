import base64
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
source = (root / "worker" / "template.js").read_text(encoding="utf-8")


def load_json(name):
    with (root / "tools" / name).open(encoding="utf-8") as file:
        return json.load(file)


values = {
    "MAIN_QC": load_json("main-qc.json"),
    "CATALOG": load_json("catalog-full.json"),
    "FEATURES": load_json("featured.json"),
    "IMAGE_FEATURES": load_json("image-features.json"),
    "I18N": load_json("content.json"),
    "GUIDE_IMAGES": load_json("guide-images.json") if (root / "tools" / "guide-images.json").exists() else [],
    "BLOCKED_IMAGES": load_json("blocked-images.json"),
    "ASSETS": load_json("assets.json") if (root / "tools" / "assets.json").exists() else {},
    "CSS": (root / "worker" / "style.css").read_text(encoding="utf-8"),
    "CLIENT": (root / "worker" / "client.js").read_text(encoding="utf-8"),
}

for key, value in values.items():
    source = source.replace(f"__{key}__", json.dumps(value, ensure_ascii=False, separators=(",", ":")))

icon = base64.b64encode((root / "tools" / "favicon.ico").read_bytes()).decode()
source = source.replace("__ICON__", icon)
(root / "worker" / "index.js").write_text(source, encoding="utf-8")
print("Worker bytes:", len(source.encode("utf-8")))
