from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
image = Image.new("RGBA", (128, 128), "#171717")
draw = ImageDraw.Draw(image)
try:
    font = ImageFont.truetype("arialbd.ttf", 78)
except OSError:
    font = ImageFont.load_default()
box = draw.textbbox((0, 0), "O", font=font)
draw.text(((128 - (box[2] - box[0])) / 2, (128 - (box[3] - box[1])) / 2 - box[1] - 2), "O", font=font, fill="white")
draw.ellipse((92, 88, 110, 106), fill="#e63222")
image.save(root / "tools" / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128)])
