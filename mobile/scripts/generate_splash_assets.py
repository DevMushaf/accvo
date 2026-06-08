"""Generate Accvo icon-only splash and app icon assets from logo-transparent.png."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "images"
SOURCE = ASSETS / "logo-transparent.png"
BRAND_BLUE = (0, 86, 179)  # #0056B3
WHITE = (255, 255, 255)


def find_icon_crop_box(img: Image.Image) -> tuple[int, int, int, int]:
    """Crop icon-only region (left of wordmark) using left-half bounding box."""
    w, h = img.size
    split_x = int(w * 0.49)
    left_half = img.crop((0, 0, split_x, h))
    bbox = left_half.getbbox()
    if not bbox:
        return (0, 0, w // 2, h)

    pad = 6
    left = max(0, bbox[0] - pad)
    top = max(0, bbox[1] - pad)
    right = min(split_x, bbox[2] + pad)
    bottom = min(h, bbox[3] + pad)
    return (left, top, right, bottom)


def recolor_icon(img: Image.Image, color: tuple[int, int, int]) -> Image.Image:
    """Replace non-transparent pixels with a solid color, preserve alpha."""
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a > 0:
                pixels[x, y] = (*color, a)
    return img


def pad_square(img: Image.Image, size: int, bg: tuple[int, int, int, int] | None = None) -> Image.Image:
    """Center image in a square canvas."""
    img = img.convert("RGBA")
    max_side = max(img.size)
    scale = (size * 0.72) / max_side
    new_w = int(img.width * scale)
    new_h = int(img.height * scale)
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (size, size), bg or (0, 0, 0, 0))
    x = (size - new_w) // 2
    y = (size - new_h) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    box = find_icon_crop_box(source)
    icon_blue = source.crop(box)

    # Blue icon on transparent — in-app / source asset
    icon_blue.save(ASSETS / "logo-icon-only.png")

    # White icon for splash on brand blue background
    icon_white = recolor_icon(icon_blue.copy(), WHITE)
    icon_white.save(ASSETS / "splash-icon.png")

    # 1024 app icon: brand blue bg + white icon
    app_icon = pad_square(icon_white, 1024, (*BRAND_BLUE, 255))
    app_icon.save(ASSETS / "icon.png")

    # Android adaptive foreground (transparent bg, white icon, safe zone)
    adaptive = pad_square(icon_white, 1024, (0, 0, 0, 0))
    adaptive.save(ASSETS / "android-icon-foreground.png")

    print("Generated:")
    print(f"  logo-icon-only.png  {icon_blue.size}")
    print(f"  splash-icon.png     {icon_white.size}")
    print(f"  icon.png            1024x1024")
    print(f"  android-icon-foreground.png  1024x1024")


if __name__ == "__main__":
    main()
