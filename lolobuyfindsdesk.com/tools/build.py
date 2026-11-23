from pathlib import Path
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
subprocess.run([sys.executable, str(root / "tools" / "bundle.py")], check=True)

dist = root / "dist"
if dist.exists():
    shutil.rmtree(dist)
(dist / "server").mkdir(parents=True)
(dist / ".openai").mkdir(parents=True)
shutil.copy2(root / "worker" / "index.js", dist / "server" / "index.js")
shutil.copy2(root / ".openai" / "hosting.json", dist / ".openai" / "hosting.json")
print(f"Built {dist}")
