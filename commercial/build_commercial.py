"""Build commercial-data.js from the Carrier Enterprise rooftop-unit export.

Usage:  python commercial/build_commercial.py [--images]
Input:  commercial/ce_rtu.json  (137 Carrier + Bryant packaged RTUs from CE category 1423187165507:
        model, name, brand, Scene7 asset, CE price, CE spec list)
Output: commercial-data.js      (window.COMMERCIAL_DATA; pricing is applied in inventory.js)
        img/rtu-*.jpg           (with --images: downloads the CE Scene7 photos and cleans them up)

To refresh prices: re-export ce_rtu.json from CE (see memory notes), then run this script.
"""
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
IMG = os.path.join(ROOT, "img")
SRC = os.path.join(IMG, "src", "rtu")
SCENE7 = "https://resource.carrierenterprise.com/is/image/Watscocom/{}?fmt=png-alpha&wid=1200&hei=1200"


def clean(s):
    return re.sub(r"\s+", " ", re.sub("[®™�]", "", str(s))).strip()


def num(s):
    m = re.search(r"[\d,]+(?:\.\d+)?", str(s or ""))
    return float(m.group(0).replace(",", "")) if m else None


def inches(s):
    v = num(s)
    return f"{v:g}" if v is not None else "?"


def kind_of(p):
    s = p["specs"]
    if "Heat Pump" in p["name"]:
        return "hp"
    return "gas" if s.get("Fuel Type") else "cool"


def voltage_of(p):
    m = re.search(r"\((\d{3}(?:/\d{3})?)-(\d)", p["name"])
    if m:
        return f"{m.group(1)}V {m.group(2)}-phase"
    v = clean(p["specs"].get("Voltage", "")).replace(" VAC", "V").replace("208-230", "208/230")
    return f"{v} {'1' if p['specs'].get('Phase') == 'Single' else '3'}-phase"


def kbtu(v):
    """'120,000-180,000' -> '120k-180k'"""
    return "-".join(f"{int(num(x) // 1000)}k" for x in str(v).split("-") if num(x))


# Spec rows shown on the product page, in this order: (label, CE key, formatter)
SPEC_ROWS = [
    ("Series", "Tier", clean),
    ("Product family", "Product Family", clean),
    ("Nominal cooling", "Tonnage", lambda v: f"{v} ton"),
    ("Cooling capacity", "Cooling Capacity", lambda v: f"{v} BTU/h"),
    ("Rated cooling capacity", "Cooling Rated Capacity Btu/h", lambda v: f"{int(num(v)):,} BTU/h"),
    ("EER", "EER", str), ("EER2", "EER2", str), ("IEER", "IEER", str), ("SEER", "SEER", str), ("SEER2", "SEER2", str),
    ("Heating capacity (heat pump)", "Heating Capacity", lambda v: f"{v} BTU/h"), ("COP", "COP", str),
    ("Fuel", "Fuel Type", str),
    ("Gas heat input", "BTU Input", lambda v: f"{v} BTU/h"),
    ("Gas heat output", "BTU Output", lambda v: f"{v} BTU/h"),
    ("Thermal efficiency", "Thermal Efficiency", str), ("AFUE", "AFUE", str),
    ("Heating stages", "Stages Heating", str), ("Heat exchanger", "Heat Exchanger Type", str),
    ("Ignition", "Ignition Type", str),
    ("Electric heat (field-installed)", "Electric Heat Range [kW]", lambda v: f"{v} kW"),
    ("Gas connection", "Gas Connection Size", str),
    ("Cooling stages", "Stages Cooling", str),
    ("Compressor", "Compressor Type", str),
    ("Refrigerant", "Refrigerant", str),
    ("Airflow (cooling)", "CFM", lambda v: f"{v} CFM"),
    ("Airflow (heating)", "CFM Heating", lambda v: f"{v} CFM"),
    ("Indoor blower", "Blower Motor Type", str),
    ("Blower motor", "Blower Motor HP", str),
    ("Blower speeds", "Blower Motor Speeds", str),
    ("Drive", "Drive Type", str),
    ("Condenser fans", "Condenser Fan Motor Qty", str),
    ("Condenser fan motor", "Condenser Motor HP", lambda v: f"{v} HP" if "HP" not in v else v),
    ("Rated load amps (RLA)", "Rated Load Amps (RLA)", lambda v: f"{v} A"),
    ("Locked rotor amps (LRA)", "Locked Rotor Amps (LRA)", lambda v: f"{v} A"),
    ("Full load amps", "Full Load Amps", lambda v: f"{v} A"),
    ("Max overcurrent protection (MOCP)", "Maximum Overcurrent Protection (MOCP)", lambda v: f"{v} A"),
    ("Air flow direction", "Air Flow Direction", str),
    ("Return air filters", "Return Air Filter Size (RA) in Inches (W x H x D)", lambda v: f"{v} in"),
    ("Outdoor air filter", "Outdoor Air Filter Size (OA) in Inches (W x H x D)", lambda v: f"{v} in"),
    ("Drain connection", "Drain Connection Size", str),
    ("Sound level", "Sound Level (dBA)", lambda v: f"{v} dBA"),
    ("Low ambient cooling", "Low Ambient Cooling Capable", str),
    ("Approvals", "Approvals", str),
]


def build_specs(p, tons):
    s = p["specs"]
    out = {}
    for label, key, fmt in SPEC_ROWS:
        v = s.get(key)
        if v in (None, ""):
            continue
        # CE has a few typos (e.g. a 5-ton unit listed at 575,000 BTU/h cooling): skip values that can't be right.
        if key == "Cooling Capacity" and num(v) and not (tons * 7000 < num(v) < tons * 16000):
            continue
        out[label] = fmt(clean(v))
        if key == "Tonnage":
            out["Voltage / Phase"] = voltage_of(p) + ", 60 Hz"
    if s.get("Length") and s.get("Width") and s.get("Height"):
        out["Dimensions (L × W × H)"] = f'{inches(s["Length"])} × {inches(s["Width"])} × {inches(s["Height"])} in'
    if num(s.get("Weight")):
        out["Operating weight"] = f'{int(num(s["Weight"])):,} lb'
    return out


KIND = {
    "gas": ("Gas/Electric Rooftop", "Gas Heat / Electric Cool Packaged Rooftop Unit"),
    "hp": ("Heat Pump Rooftop", "Heat Pump Packaged Rooftop Unit"),
    "cool": ("Cooling Only Rooftop", "Cooling Only Packaged Rooftop Unit"),
}


# Stamped text/logos to blank out: (x0, y0, x1, y1) as fractions of the trimmed photo.
TOP_BLANK = {"carrier_48tc-3-15ton_en_normal": (0, 0, 1, 0.12), "carrier_48nl_en_normal": (0, 0, 0.3, 0.1)}
WHITEN = {"carrier_48nl_en_normal": 236}   # cream studio backdrop: pixels this light in every channel -> white


def image_file(asset):
    return f"img/rtu-{re.sub(r'[^a-z0-9]+', '-', asset.lower()).strip('-')}.jpg"


def fetch_images(assets):
    sys.path.insert(0, IMG)
    from make_images import load_flat  # flattens transparency on white and trims the border
    from PIL import Image, ImageChops, ImageDraw

    os.makedirs(SRC, exist_ok=True)
    for a in sorted(assets):
        png = os.path.join(SRC, a + ".png")
        if not os.path.exists(png):
            req = urllib.request.Request(SCENE7.format(a), headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=60) as r, open(png, "wb") as f:
                f.write(r.read())
        im = load_flat(os.path.join("rtu", a + ".png"))
        if a in TOP_BLANK:   # "Representative Image" / "Puron Advance" stamped above the unit
            x0, y0, x1, y1 = TOP_BLANK[a]
            ImageDraw.Draw(im).rectangle((im.width * x0, im.height * y0, im.width * x1, im.height * y1), fill=(255, 255, 255))
        if a in WHITEN:
            im = im.point(lambda v: v)  # copy
            px = im.load()
            for y in range(im.height):
                for x in range(im.width):
                    if min(px[x, y]) >= WHITEN[a]:
                        px[x, y] = (255, 255, 255)
        for corner in ((0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)):
            ImageDraw.floodfill(im, corner, (255, 255, 255), thresh=40)   # tinted photo backgrounds -> white
        diff = ImageChops.difference(im, Image.new("RGB", im.size, (255, 255, 255))).convert("L")
        im = im.crop(diff.point(lambda v: 255 if v > 18 else 0).getbbox())
        # pad to a 4:3 white canvas so cards line up
        W, H = 1200, 900
        scale = min((W * 0.9) / im.width, (H * 0.9) / im.height)
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
        canvas = Image.new("RGB", (W, H), (255, 255, 255))
        canvas.paste(im, ((W - im.width) // 2, (H - im.height) // 2))
        canvas.save(os.path.join(ROOT, image_file(a)), quality=86)
        print("image", image_file(a))


def main():
    data = json.load(open(os.path.join(HERE, "ce_rtu.json"), encoding="utf-8"))
    units = []
    for p in data:
        s = p["specs"]
        tons = num(s.get("Tonnage"))
        kind = kind_of(p)
        typ, noun = KIND[kind]
        tier = clean(s.get("Tier") or ("WeatherMaker" if p["model"].startswith("48F") else ""))
        heat = kbtu(s["BTU Input"]) if kind == "gas" and s.get("BTU Input") else None
        refr = clean(s.get("Refrigerant") or "")
        eff = [(k, num(s[k])) for k in ("IEER", "EER2", "EER", "SEER2") if num(s.get(k))]
        units.append({
            "model": p["model"],
            "brand": p["brand"],
            "series": tier,
            "family": clean(s.get("Product Family", "")),
            "kind": kind,
            "type": typ,
            "tons": tons,
            "name": f"{tons:g}-Ton {tier + ' ' if tier else ''}{noun}",
            "heat": heat,
            "voltage": voltage_of(p),
            "refrigerant": refr,
            "eff": eff[:2],
            "weight": int(num(s["Weight"])) if num(s.get("Weight")) else None,
            "cost": p["price"],
            "image": image_file(p["asset"]),
            "specs": build_specs(p, tons),
        })
    order = {"gas": 0, "hp": 1, "cool": 2}
    units.sort(key=lambda u: (order[u["kind"]], u["tons"], u["brand"] != "Carrier", "460" in u["voltage"], u["cost"] or 1e9))
    js = ("// GENERATED by commercial/build_commercial.py from commercial/ce_rtu.json. Do not edit by hand.\n"
          "// cost = Carrier Enterprise price (Sept 24, 2026). Site price = cost + commission + freight (see inventory.js).\n"
          "window.COMMERCIAL_DATA = " + json.dumps(units, ensure_ascii=False, indent=0) + ";\n")
    open(os.path.join(ROOT, "commercial-data.js"), "w", encoding="utf-8").write(js)
    print(len(units), "units ->", "commercial-data.js")
    if "--images" in sys.argv:
        fetch_images({p["asset"] for p in data})


if __name__ == "__main__":
    main()
