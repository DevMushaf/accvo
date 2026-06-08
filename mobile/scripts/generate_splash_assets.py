"""Generate Accvo icon-only splash and app icon assets from logo-transparent.png."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "images"
SOURCE = ASSETS / "logo-transparent.png"
BRAND_BLUE = (0, 86, 179)  # #0056B3
WHITE = (255, 255, 255)

# Wordmark starts ~49% from left; icon-only block is the left ~38%.
ICON_SPLIT_RATIO = 0.385


def find_icon_crop_box(img: Image.Image) -> tuple[int, int, int, int]:
    """Crop icon-only region — document + check + sparkle, no Accvo wordmark."""
    w, h = img.size
    split_x = int(w * ICON_SPLIT_RATIO)
    region = img.crop((0, 0, split_x, h))
    bbox = region.getbbox()
    if not bbox:
        return (0, 0, split_x, h)

    pad = 4
    return (
        max(0, bbox[0] - pad),
        max(0, bbox[1] - pad),
        min(w, bbox[2] + pad),
        min(h, bbox[3] + pad),
    )


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


def solid_color_png(size: int, color: tuple[int, int, int]) -> Image.Image:
    return Image.new("RGBA", (size, size), (*color, 255))


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    box = find_icon_crop_box(source)
    icon_blue = source.crop(box)

    icon_blue.save(ASSETS / "logo-icon-only.png")

    icon_white = recolor_icon(icon_blue.copy(), WHITE)
    icon_white.save(ASSETS / "splash-icon.png")

    app_icon = pad_square(icon_white, 1024, (*BRAND_BLUE, 255))
    app_icon.save(ASSETS / "icon.png")

    adaptive = pad_square(icon_white, 1024, (0, 0, 0, 0))
    adaptive.save(ASSETS / "android-icon-foreground.png")

    monochrome = pad_square(icon_white, 1024, (0, 0, 0, 0))
    monochrome.save(ASSETS / "android-icon-monochrome.png")

    solid_color_png(1024, BRAND_BLUE).save(ASSETS / "android-icon-background.png")

    app_icon.resize((48, 48), Image.Resampling.LANCZOS).save(ASSETS / "favicon.png")

    print("Generated from logo-transparent.png:")
    print(f"  crop box           {box}")
    print(f"  logo-icon-only.png {icon_blue.size}")
    print(f"  splash-icon.png    {icon_white.size} (white icon for #0056B3 splash)")


if __name__ == "__main__":
    main()
