// Search-engine pages: one real HTML page per product (/equipment/<id>) and per category (/shop/<key>),
// plus /sitemap.xml and /robots.txt. Built from the same inventory.js the website uses, so prices always match.
// The interactive store stays at "/"; every page here links back to it (/?item=<id> opens that product).
import { loadCatalog } from "./netlify/functions/lib/catalog.mjs";

const SITE = "https://northgatehvac.com";

const CATS = [
  { key: "commercial", label: "Commercial Rooftop Units", test: u => u.commercial,
    intro: "Carrier and Bryant packaged rooftop units (RTUs): gas/electric, heat pump and straight cool, 3 to 25 tons. Freight to your job site or pickup in Dallas–Fort Worth." },
  { key: "electric", label: "Electric & AC Systems", test: u => u.type === "Electric AC System" || u.type === "Split AC System",
    intro: "Complete split AC systems (condenser + air handler) from Carrier, Trane, Goodman and Payne, 1.5 to 5 tons, with free nationwide shipping." },
  { key: "gas", label: "Gas Furnace Systems", test: u => u.type === "Gas AC System",
    intro: "Matched AC + coil + gas furnace systems from Carrier, Trane, Goodman and Payne, 1.5 to 5 tons, with free nationwide shipping." },
  { key: "heatpump", label: "Heat Pump Systems", test: u => /Heat Pump System/.test(u.type) && !u.commercial,
    intro: "Complete heat pump systems with matched air handlers from Carrier, Goodman and Payne, 1.5 to 5 tons, with free nationwide shipping." },
  { key: "condenser", label: "AC & Heat Pump Condensers", test: u => /Condenser/.test(u.type),
    intro: "Outdoor AC condensers and heat pump condensers sold individually, 1.5 to 5 tons, R-454B refrigerant." },
  { key: "airhandler", label: "Air Handlers", test: u => u.type === "Air Handler",
    intro: "Air handlers / fan coils sold individually, 1.5 to 5 tons, with optional electric heat kits." },
  { key: "furnace", label: "Gas Furnaces", test: u => u.type === "Furnace", intro: "80% AFUE gas furnaces sold individually." },
  { key: "coil", label: "Evaporator Coils", test: u => u.type === "Coil", intro: "Cased evaporator coils sold individually, 2 to 5 tons." },
  { key: "heatkit", label: "Heat Kits", test: u => u.type === "Heat Kit", intro: "Electric heat kits (strip heat) for air handlers, 8 to 20 kW." },
];

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const money = n => "$" + Math.round(n).toLocaleString("en-US");
const title = u => `${u.brand} ${u.name || `${u.tons}-Ton ${u.type}`}`;
const models = u => u.components ? u.components.map(c => c.model).join(" + ") : (u.model || "");
const abs = p => p ? `${SITE}/${String(p).replace(/^\//, "")}` : "";
const catOf = u => CATS.find(c => c.test(u));

let cache = null;
function data() {
  if (cache) return cache;
  const { inventory, shipping, business, Pricing } = loadCatalog();
  cache = { inv: inventory, S: shipping, B: business, Pricing, pages: new Map() };
  return cache;
}

function layout({ path, pageTitle, description, image, jsonLd, body }) {
  const { B } = data();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Northgate">
<meta property="og:title" content="${esc(pageTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE}${path}">
${image ? `<meta property="og:image" content="${esc(abs(image))}">` : ""}
<link rel="icon" href="/img/brand/favicon-64.png">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
${jsonLd.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("\n")}
<style>
  :root { --text:#1f2733; --muted:#667181; --line:#d8dce2; --page:#f3f4f6; --brand:#13335e; --brand-dark:#0c2240; --link:#1767b3; --cta:#2b8a3e; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:Roboto, Arial, sans-serif; color:var(--text); background:var(--page); line-height:1.5; }
  a { color:var(--link); }
  header { background:#fff; border-bottom:1px solid var(--line); }
  .bar, main, footer .in { max-width:1200px; margin:0 auto; padding:0 16px; }
  .bar { display:flex; align-items:center; gap:16px; justify-content:space-between; padding-top:10px; padding-bottom:10px; flex-wrap:wrap; }
  .bar img { height:48px; width:auto; display:block; }
  .bar nav { display:flex; gap:10px; flex-wrap:wrap; font-size:14px; }
  .btn { display:inline-block; background:var(--cta); color:#fff; text-decoration:none; font-weight:700; padding:12px 20px; border-radius:4px; }
  .btn.alt { background:#fff; color:var(--brand); border:1px solid var(--brand); }
  .cats { background:var(--brand); }
  .cats div { max-width:1200px; margin:0 auto; padding:0 16px; display:flex; gap:4px 18px; flex-wrap:wrap; }
  .cats a { color:#fff; text-decoration:none; font-size:14px; font-weight:500; padding:10px 0; }
  .crumb { font-size:13px; color:var(--muted); margin:16px 0 8px; }
  h1 { color:var(--brand); font-size:28px; margin:0 0 6px; line-height:1.2; }
  .box { background:#fff; border:1px solid var(--line); border-radius:6px; padding:20px; margin-bottom:18px; }
  .prod { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:24px; }
  .prod img { width:100%; height:auto; max-height:420px; object-fit:contain; background:#fff; }
  .price { font-size:32px; font-weight:700; color:var(--text); }
  .was { color:var(--muted); margin-left:8px; }
  .chips span { display:inline-block; border:1px solid var(--line); border-radius:3px; padding:2px 8px; font-size:13px; margin:0 6px 6px 0; }
  ul.ok { padding-left:20px; margin:10px 0; }
  table { width:100%; border-collapse:collapse; font-size:14px; }
  td, th { text-align:left; padding:7px 8px; border-bottom:1px solid #e8ebef; vertical-align:top; }
  th { width:40%; color:var(--muted); font-weight:500; }
  h2 { color:var(--brand); font-size:20px; margin:0 0 10px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:14px; }
  .card { background:#fff; border:1px solid var(--line); border-radius:6px; padding:14px; text-decoration:none; color:var(--text); display:flex; flex-direction:column; gap:6px; }
  .card img { width:100%; height:160px; object-fit:contain; }
  .card b { color:var(--link); }
  .card small { color:var(--muted); }
  .card .p { font-weight:700; font-size:18px; }
  footer { background:var(--brand-dark); color:#cdd5e0; margin-top:30px; padding:24px 0; font-size:14px; }
  footer a { color:#fff; }
  @media (max-width:760px) { .prod { grid-template-columns:1fr; } h1 { font-size:23px; } }
</style>
</head>
<body>
<header>
  <div class="bar">
    <a href="/"><img src="/img/brand/northgate-logo-900.png" width="900" height="296" alt="Northgate HVAC equipment"></a>
    <nav><a href="tel:${esc(B.sms)}">Call ${esc(B.phone)}</a> · <a href="sms:${esc(B.sms)}">Text us</a> · <a href="/">Shop all equipment</a></nav>
  </div>
  <nav class="cats"><div>${CATS.map(c => `<a href="/shop/${c.key}">${esc(c.label)}</a>`).join("")}</div></nav>
</header>
<main>
${body}
</main>
<footer><div class="in">
  <b style="color:#fff">Northgate</b> · HVAC equipment from Carrier, Trane, Goodman, Payne and Bryant, shipped free nationwide from Dallas, TX, or picked up in Dallas–Fort Worth.<br>
  Call or text <a href="tel:${esc(B.sms)}">${esc(B.phone)}</a> · <a href="/">Shop</a> · <a href="/terms.html">Terms of Sale</a> · <a href="/privacy.html">Privacy</a>
</div></footer>
</body>
</html>`;
}

function card(u) {
  return `<a class="card" href="/equipment/${encodeURIComponent(u.id)}">
    ${u.image ? `<img src="/${esc(u.image)}" alt="${esc(title(u))}" loading="lazy">` : ""}
    <b>${esc(title(u))}</b><small>${esc(models(u))}</small>
    <span class="p">${u.price == null ? "Call for price" : money(u.price)}</span>
  </a>`;
}

function productPage(u) {
  const { inv, S, B, Pricing } = data();
  const cat = catOf(u);
  const name = title(u);
  const mdl = models(u);
  const ship = u.commercial ? "Freight to your job site included (forklift needed to unload)" : `Free shipping nationwide · ships in ${S.shipsIn}`;
  const pick = u.price != null ? Pricing.pickupOff(u, S) : 0;
  const chips = [u.seer2 && `${u.seer2} SEER2`, u.eer2 && `${u.eer2} EER2`, u.hspf2 && `${u.hspf2} HSPF2`, u.afue && `${u.afue}% AFUE`,
    ...(u.chips || []), u.refrigerant, u.voltage].filter(Boolean);
  const desc = `${name}${mdl ? ` (${mdl})` : ""}${u.price != null ? ` for ${money(u.price)}` : ""}. ${u.commercial ? "Freight to your job site" : "Free shipping nationwide"}, or save with local pickup in Dallas–Fort Worth. Northgate HVAC equipment.`;
  const comps = (u.components || []).map(c => `<div class="box">
      <h2>${esc(c.role)}: ${esc(c.model)}</h2>
      ${c.name ? `<p style="margin:0 0 8px">${esc(c.name)}</p>` : ""}
      ${c.highlights?.length ? `<ul class="ok">${c.highlights.map(h => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
      ${c.specs ? `<table>${Object.entries(c.specs).map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table>` : ""}
    </div>`).join("");
  const heat = u.heatOptions?.length ? `<div class="box"><h2>${esc(u.optionTitle || "Heat options")}</h2><table>${u.heatOptions.map(o =>
    `<tr><th>${esc(o.label)}${o.model ? ` (${esc(o.model)})` : ""}</th><td>${o.add ? `+${money(o.add)}` : o.add < 0 ? `−${money(-o.add)}` : "Included"}${o.desc ? ` · ${esc(o.desc)}` : ""}</td></tr>`).join("")}</table></div>` : "";
  const related = inv.filter(x => x !== u && catOf(x) === cat && (x.brand === u.brand || x.tons === u.tons)).slice(0, 8);
  const offer = u.price == null ? undefined : {
    "@type": "Offer", url: `${SITE}/equipment/${u.id}`, priceCurrency: "USD", price: String(u.price), itemCondition: "https://schema.org/NewCondition",
    seller: { "@type": "Organization", name: "Northgate" },
    shippingDetails: { "@type": "OfferShippingDetails", shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" } },
  };
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Product", name, sku: u.id, mpn: mdl || undefined, brand: { "@type": "Brand", name: u.brand },
      image: u.image ? [abs(u.image)] : undefined, description: desc, category: cat?.label, offers: offer },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
      ...(cat ? [{ "@type": "ListItem", position: 2, name: cat.label, item: `${SITE}/shop/${cat.key}` }] : []),
      { "@type": "ListItem", position: cat ? 3 : 2, name } ] },
  ];
  const body = `
  <div class="crumb"><a href="/">Home</a> › ${cat ? `<a href="/shop/${cat.key}">${esc(cat.label)}</a> › ` : ""}${esc(name)}</div>
  <div class="box prod">
    <div>${u.image ? `<img src="/${esc(u.image)}" alt="${esc(name)}">` : ""}</div>
    <div>
      <div style="color:var(--muted);font-size:14px">${esc(u.brand)} · ${esc(u.type)}${u.tons ? ` · ${u.tons} ton` : ""}</div>
      <h1>${esc(name)}</h1>
      ${mdl ? `<div style="margin-bottom:10px"><b>Model:</b> ${esc(mdl)}</div>` : ""}
      <div class="chips">${chips.map(c => `<span>${esc(c)}</span>`).join("")}</div>
      <div style="margin:12px 0">${u.price == null ? '<span class="price">Call for price</span>'
        : `<span class="price">${money(u.price)}</span> <span style="color:var(--muted)">/ ${esc(u.unit || "system")}</span>${u.saleOff ? `<s class="was">${money(u.regularPrice)}</s>` : ""}`}</div>
      <div>${esc(ship)}</div>
      ${pick ? `<div>Local pickup in Dallas–Fort Worth: <b>${money(u.price - pick)}</b></div>` : ""}
      ${u.heatText ? `<div><b>Heat:</b> ${esc(u.heatText)}</div>` : ""}
      <p style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
        <a class="btn" href="/?item=${encodeURIComponent(u.id)}">${u.price == null ? "View and ask for price" : "Order this system"}</a>
        <a class="btn alt" href="tel:${esc(B.sms)}">Call ${esc(B.phone)}</a>
      </p>
      <p style="font-size:14px;color:var(--muted)">New equipment, manufacturer warranty registered by Northgate. Monthly payments available at checkout.</p>
    </div>
  </div>
  ${heat}
  ${comps}
  ${related.length ? `<h2>Related equipment</h2><div class="grid">${related.map(card).join("")}</div>` : ""}`;
  return layout({ path: `/equipment/${u.id}`, pageTitle: `${name}${mdl && mdl.length < 40 ? ` ${mdl}` : ""} | ${u.price != null ? money(u.price) + " | " : ""}Northgate`,
    description: desc, image: u.image, jsonLd, body });
}

function categoryPage(c) {
  const { inv } = data();
  const items = inv.filter(c.test).sort((a, b) => (a.brand > b.brand) - (a.brand < b.brand) || (a.tons || 0) - (b.tons || 0));
  const prices = items.map(u => u.price).filter(p => p != null);
  const from = prices.length ? ` from ${money(Math.min(...prices))}` : "";
  const desc = `${c.label}${from}. ${c.intro}`;
  const jsonLd = [{ "@context": "https://schema.org", "@type": "ItemList", name: c.label,
    itemListElement: items.map((u, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/equipment/${u.id}`, name: title(u) })) }];
  const body = `
  <div class="crumb"><a href="/">Home</a> › ${esc(c.label)}</div>
  <h1>${esc(c.label)}</h1>
  <p>${esc(c.intro)} ${items.length} items${from}.</p>
  <p><a class="btn" href="/?cat=${c.key}">Shop and order ${esc(c.label.toLowerCase())}</a></p>
  <div class="grid">${items.map(card).join("")}</div>`;
  return layout({ path: `/shop/${c.key}`, pageTitle: `${c.label}${from} | Free Shipping | Northgate`, description: desc, jsonLd, body });
}

function sitemap() {
  const { inv } = data();
  const urls = [`${SITE}/`, ...CATS.map(c => `${SITE}/shop/${c.key}`), ...inv.map(u => `${SITE}/equipment/${encodeURIComponent(u.id)}`),
    `${SITE}/terms.html`, `${SITE}/privacy.html`];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${esc(u)}</loc></url>`).join("\n")}\n</urlset>\n`;
}

const ROBOTS = `User-agent: *
Disallow: /admin.html
Disallow: /rep.html
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

// Returns { status, type, body } for SEO routes, or null when the path isn't one of ours.
export function seoRoute(pathname) {
  if (pathname === "/robots.txt") return { status: 200, type: "text/plain; charset=utf-8", body: ROBOTS };
  if (pathname === "/sitemap.xml") return { status: 200, type: "application/xml; charset=utf-8", body: sitemap() };
  let m = pathname.match(/^\/shop\/([a-z]+)\/?$/);
  if (m) {
    const c = CATS.find(x => x.key === m[1]);
    return c ? { status: 200, type: "text/html; charset=utf-8", body: page("c:" + c.key, () => categoryPage(c)) } : null;
  }
  m = pathname.match(/^\/equipment\/([^/]+)\/?$/);
  if (m) {
    let id; try { id = decodeURIComponent(m[1]); } catch { return null; }
    const u = data().inv.find(x => x.id === id);
    return u ? { status: 200, type: "text/html; charset=utf-8", body: page("p:" + id, () => productPage(u)) } : null;
  }
  return null;
}

function page(key, build) {
  const { pages } = data();
  if (!pages.has(key)) pages.set(key, build());
  return pages.get(key);
}
