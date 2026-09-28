"""Clean up product photos and build bundle images.

Usage: python make_images.py
Reads img/src/*.png (manufacturer photos), writes web-ready JPGs to img/.
"""
import os

from PIL import Image, ImageChops, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src")


# Areas to blank out before trimming (e.g. a "Puron Advance" logo stamped in a corner): name -> box
BLANK = {"coil-cvava.png": (0, 0, 460, 260), "coil-caamp.png": (0, 0, 460, 260)}


def load_flat(name):
    """Open a photo, flatten transparency onto white, and trim the empty border."""
    im = Image.open(os.path.join(SRC, name)).convert("RGBA")
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    im = Image.alpha_composite(bg, im).convert("RGB")
    if name in BLANK:
        ImageDraw.Draw(im).rectangle(BLANK[name], fill=(255, 255, 255))
    diff = ImageChops.difference(im, Image.new("RGB", im.size, (255, 255, 255))).convert("L")
    bbox = diff.point(lambda v: 255 if v > 18 else 0).getbbox()
    return im.crop(bbox)


def cutout_mask(im):
    """Mask of the product (everything that isn't near-white), softened at the edges."""
    diff = ImageChops.difference(im, Image.new("RGB", im.size, (255, 255, 255))).convert("L")
    m = diff.point(lambda v: 255 if v > 14 else 0)
    return m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.2))


def floor_shadow(canvas, x0, x1, y, depth=38, opacity=70):
    """Soft elliptical contact shadow under a product."""
    w = x1 - x0
    layer = Image.new("L", canvas.size, 0)
    ImageDraw.Draw(layer).ellipse([x0 + w * 0.04, y - depth * 0.45, x1 - w * 0.04, y + depth * 0.55], fill=opacity)
    layer = layer.filter(ImageFilter.GaussianBlur(depth * 0.55))
    shade = Image.new("RGB", canvas.size, (40, 48, 60))
    canvas.paste(shade, (0, 0), layer)


def background(size):
    """Very light studio gradient so white products still read against it."""
    w, h = size
    top, bottom = (255, 255, 255), (238, 242, 247)
    grad = Image.new("RGB", (1, h))
    for yy in range(h):
        t = yy / (h - 1)
        grad.putpixel((0, yy), tuple(round(a + (b - a) * t) for a, b in zip(top, bottom)))
    return grad.resize((w, h))


def place(canvas, im, height, x, floor_y, shadow=True):
    scale = height / im.height
    im = im.resize((round(im.width * scale), round(height)), Image.LANCZOS)
    y = floor_y - im.height
    if shadow:
        floor_shadow(canvas, x, x + im.width, floor_y)
    canvas.paste(im, (x, y), cutout_mask(im))
    return x + im.width


def single(name, out, size=1200, fill=0.84):
    im = load_flat(name)
    canvas = background((size, size))
    s = fill * size / max(im.size)
    h = im.height * s
    x = round((size - im.width * s) / 2)
    floor_y = round((size + h) / 2)
    place(canvas, im, h, x, floor_y)
    canvas.save(os.path.join(HERE, out), quality=86, optimize=True, progressive=True)


def bundle(parts, out, size=(1600, 1200), px_per_in=21.5):
    """parts: list of (file, real height in inches, x position, floor y) drawn back-to-front."""
    canvas = background(size)
    for name, inches, x, floor_y in parts:
        place(canvas, load_flat(name), inches * px_per_in, x, floor_y)
    canvas.save(os.path.join(HERE, out), quality=86, optimize=True, progressive=True)


def gas_bundle(out, size=(1600, 1200), px_per_in=21.5):
    # Furnace (33.3") back-left, condenser (~36") right, cased coil in front between them.
    # (The photos are shot from different angles, so stacking the coil on the furnace looks wrong.)
    bundle([
        ("furnace-58sc0b.png", 33.3, 245, 1040),
        ("condenser-ga5san5.png", 35.0, 770, 1070),
        ("coil-cvava.png", 14.7 * 1.25, 470, 1150),
    ], out, size=size, px_per_in=px_per_in)


if __name__ == "__main__":
    single("condenser-ga5san5.png", "condenser-ga5san5.jpg")
    single("airhandler-fj5.png", "airhandler-fj5.jpg")
    single("heatkit-kffeh.png", "heatkit-kffeh.jpg")
    # 1.5-ton electric bundle: air handler (42.7") back-left, condenser (33.3") right, heat kit (8") in front.
    bundle([
        ("airhandler-fj5.png", 42.7, 235, 1040),
        ("condenser-ga5san5.png", 33.3, 765, 1070),
        ("heatkit-kffeh.png", 8.0 * 2.1, 430, 1150),   # heat kit photo includes coil height; scaled to read at a glance
    ], "bundle-carrier-1.5t-electric.jpg")

    # Gas systems: furnace, condenser and cased coil.
    single("furnace-58sc0b.png", "furnace-58sc0b.jpg")
    single("coil-cvava.png", "coil-cvava.jpg")
    single("coil-caamp.png", "coil-caamp.jpg")
    gas_bundle("bundle-carrier-gas.jpg")

    # Heat pumps: GH5SAN heat pump + the same fan coil and heat kit as electric systems.
    single("hp-gh5san.png", "hp-gh5san.jpg")
    bundle([
        ("airhandler-fj5.png", 42.7, 235, 1040),
        ("hp-gh5san.png", 35.0, 765, 1070),
        ("heatkit-kffeh.png", 8.0 * 2.1, 430, 1150),
    ], "bundle-carrier-heatpump.jpg")

    # Goodman (manufacturer photos from goodmanmfg.com): GLXS4B condenser + AMST-style air handler, cooling only.
    single("goodman-cond-glx.png", "goodman-cond-glxs4b.jpg")
    single("goodman-ah.png", "goodman-ah-amst.jpg")
    bundle([
        ("goodman-ah.png", 45.0, 250, 1080),
        ("goodman-cond-glx.png", 30.0, 740, 1090),
    ], "bundle-goodman-ac.jpg")
    # Goodman electric systems ship with a heat kit included (10 kW up to 2.5 ton, 15 kW from 3 ton).
    # Generic heat-kit photo in front, same placement as the Carrier electric bundle.
    bundle([
        ("goodman-ah.png", 45.0, 250, 1080),
        ("goodman-cond-glx.png", 30.0, 740, 1090),
        ("heatkit-kffeh.png", 8.0 * 2.1, 445, 1150),
    ], "bundle-goodman-ac-heat.jpg")
    single("goodman-hp-glzs4b.jpg", "goodman-hp-glzs4b-1200.jpg")
    bundle([
        ("goodman-ah.png", 45.0, 250, 1080),
        ("goodman-hp-glzs4b.jpg", 31.0, 735, 1090),
    ], "bundle-goodman-hp.jpg")
    # Trane (manufacturer photos from trane.com): XR condenser, S8X1 80% furnace, 5TXC cased coil.
    single("trane-cond-xr.png", "trane-cond-xr.jpg")
    single("trane-furnace-s8x1.png", "trane-furnace-s8x1.jpg")
    single("trane-coil-5txc.png", "trane-coil-5txc.jpg")
    bundle([
        ("trane-furnace-s8x1.png", 34.0, 235, 1040),
        ("trane-cond-xr.png", 36.0, 780, 1070),
        ("trane-coil-5txc.png", 22.0 * 1.1, 470, 1150),
    ], "bundle-trane-gas.jpg")
    # Trane electric: 5TEM4 air handler + XR condenser (heat kit installs inside the air handler).
    single("trane-ah-tem4.png", "trane-ah-tem4.jpg")
    bundle([
        ("trane-ah-tem4.png", 45.0, 300, 1060),
        ("trane-cond-xr.png", 33.0, 780, 1090),
    ], "bundle-trane-electric.jpg")
    # Goodman gas: GR9S80 furnace + CAPTA coil + GLXS4B condenser (photos from goodmanmfg.com).
    single("goodman-furnace-gr9s80.png", "goodman-furnace-gr9s80.jpg")
    single("goodman-coil-capta.jpg", "goodman-coil-capta.jpg")
    bundle([
        ("goodman-furnace-gr9s80.png", 33.4, 250, 1040),
        ("goodman-cond-glx.png", 30.0, 760, 1080),
        ("goodman-coil-capta.jpg", 19.0, 430, 1150),
    ], "bundle-goodman-gas.jpg")
    # Heat kit included (Sept 28, 2026): electric and heat pump bundles show the heat kit in front.
    bundle([("goodman-ah.png", 45.0, 330, 1080), ("goodman-hp-glzs4b.jpg", 31.0, 815, 1090),
            ("heatkit-kffeh.png", 8.0 * 2.1, 525, 1150)], "bundle-goodman-hp-kit.jpg")
    bundle([("trane-ah-tem4.png", 45.0, 360, 1060), ("trane-cond-xr.png", 33.0, 840, 1090),
            ("heatkit-kffeh.png", 8.0 * 2.1, 530, 1150)], "bundle-trane-electric-kit.jpg")
    bundle([("payne/payne-airhandler.png", 42.0, 320, 1045), ("payne/payne-ac.png", 34.0, 820, 1075),
            ("heatkit-kffeh.png", 8.0 * 2.1, 470, 1150)], "bundle-payne-electric-kit.jpg")
    bundle([("payne/payne-airhandler.png", 42.0, 300, 1045), ("payne/payne-hp.png", 28.0, 790, 1075),
            ("heatkit-kffeh.png", 8.0 * 2.1, 450, 1150)], "bundle-payne-heatpump-kit.jpg")
    # Carrier photos with the Carrier logo (owner's photos, Sept 28, 2026)
    single("carrier-cond-brand.png", "condenser-carrier.jpg")
    single("carrier-hp-brand.png", "hp-carrier.jpg")
    single("carrier-ah-brand.png", "airhandler-carrier.jpg")
    bundle([("carrier-ah-brand.png", 44.0, 400, 1045), ("carrier-cond-brand.png", 34.0, 860, 1075),
            ("heatkit-kffeh.png", 8.0 * 2.1, 560, 1150)], "bundle-carrier-electric.jpg")
    bundle([("furnace-58sc0b.png", 33.3, 245, 1040), ("carrier-cond-brand.png", 35.0, 770, 1070),
            ("coil-cvava.png", 14.7 * 1.25, 470, 1150)], "bundle-carrier-gas-brand.jpg")
    bundle([("carrier-ah-brand.png", 44.0, 330, 1045), ("carrier-hp-brand.png", 28.0, 760, 1075),
            ("heatkit-kffeh.png", 8.0 * 2.1, 490, 1150)], "bundle-carrier-heatpump-brand.jpg")
    print("done")
