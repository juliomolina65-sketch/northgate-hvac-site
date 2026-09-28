// POST /.netlify/functions/checkout
// Body: { items: { "<order key>": qty }, delivery: { method: "freight"|"pickup", zip, liftgate, comUnload },
//         customer: { name, phone, email, street, apt, city, state, company, license, warrantyAck }, lang }
// Header (optional): Authorization: Bearer <Supabase access token>  -> contractor pricing
// Returns: { url } of a Stripe Checkout page (card, bank/ACH, Affirm, Klarna... whatever is turned on in Stripe).
import { loadCatalog, zipInfo } from "./lib/catalog.mjs";
import { supabaseReady, userFromToken, select, insert } from "./lib/supabase.mjs";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// Stripe wants form encoding with bracket keys: line_items[0][price_data][currency]=usd
function formEncode(obj, prefix = "", out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") formEncode(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}
const clip = (s, n = 490) => String(s || "").slice(0, n);

export async function buildOrder(body, profile) {
  const { inventory, shipping, install, Pricing } = loadCatalog();
  if (profile) Pricing.applyContractorPricing(inventory, profile);

  const entries = Object.entries(body?.items || {});
  if (!entries.length) throw Object.assign(new Error("Your order is empty."), { status: 400 });
  if (entries.length > 40) throw Object.assign(new Error("Too many different items; please call us."), { status: 400 });

  const pickup = body?.delivery?.method === "pickup";
  const lines = [];
  for (const [key, qtyRaw] of entries) {
    const qty = Math.floor(+qtyRaw);
    if (!(qty >= 1 && qty <= 50)) throw Object.assign(new Error("Bad quantity."), { status: 400 });
    const it = Pricing.parseKey(inventory, key);
    if (!it) throw Object.assign(new Error(`Item not found: ${key}`), { status: 400 });
    const { u, heat } = it;
    const each = Pricing.priceOf(u, heat);
    if (each == null) throw Object.assign(new Error(`${u.brand} ${u.name} needs a quote; text or call us for it.`), { status: 400 });
    const near = !pickup && Pricing.nearDfw(body?.delivery?.zip, shipping);
    const off = pickup ? Pricing.pickupOff(u, shipping) : near ? Pricing.nearDfwOff(u, shipping) : 0;
    const parts = u.components ? [...u.components, ...(heat?.part ? [heat.part] : [])] : [];
    lines.push({
      key, qty, u, heat,
      unit: Math.round((each - off) * 100),     // cents
      name: `${u.brand} ${u.name}${heat?.part ? ` · ${heat.desc}` : ""}`,
      near,
      models: parts.map(c => c.model).join(" + "),
    });
  }

  const onlyCommercial = lines.every(l => l.u.commercial);
  const hasCommercial = lines.some(l => l.u.commercial);
  let zip = null;
  if (!pickup) {
    zip = zipInfo(shipping, body?.delivery?.zip);
    if (zip.offshore) throw Object.assign(new Error("Alaska, Hawaii and territories need a freight quote. Text or call us to order."), { status: 400 });
    if (!zip.ok) throw Object.assign(new Error("Enter the 5-digit ZIP code where it's going."), { status: 400 });
  }
  const liftgate = !pickup && !onlyCommercial && !!body?.delivery?.liftgate && shipping.liftgatePrice > 0;
  // Buyer details are required (warranty registration + delivery).
  const c = body?.customer || {};
  const need = [["name", "full name"], ["phone", "phone number"], ["email", "email"], ["street", "street address"], ["city", "city"], ["state", "state"]]
    .filter(([k]) => !String(c[k] || "").trim()).map(([, label]) => label);
  if (need.length) throw Object.assign(new Error(`Please fill in your ${need.join(", ")}.`), { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(c.email)) throw Object.assign(new Error("Please enter a valid email."), { status: 400 });
  if (!c.warrantyAck) throw Object.assign(new Error("Please check the warranty box to continue."), { status: 400 });
  return { lines, pickup, zip, liftgate, liftgatePrice: shipping.liftgatePrice, hasCommercial, comUnload: !pickup && hasCommercial && !!body?.delivery?.comUnload,
    installCharge: body?.install ? installCharge(body, lines, pickup, install, Pricing) : null };
}

// Installed package. Priced from INSTALL in inventory.js (never from the browser): system + job price for the
// area + add-ons, minus the free install heat kit (Goodman/Trane electric and heat pump systems, same as the quote).
//   pay "klarna": the whole package is charged now (Klarna finances it; $10,000 max, not IA/WV/MA)
//   pay "card":   INSTALL.cardDeposit (75%) of the package now, the rest after the install
const KLARNA_MAX_CENTS = 1000000;   // Klarna financing in the US tops out at $10,000
const NO_KLARNA_FINANCING = ["IA", "WV", "MA"];
export function installCharge(body, lines, pickup, INSTALL, Pricing) {
  const klarna = body?.install?.pay === "klarna";
  const fail = m => { throw Object.assign(new Error(m), { status: 400 }); };
  const inst = body.install || {}, state = String(body?.customer?.state || "").trim().toUpperCase();
  if (!INSTALL) fail("Installation pricing isn't available. Please text or call us.");
  if (pickup) fail("Installed packages ship to the job address; choose shipping instead of pickup.");
  if (lines.length !== 1 || lines[0].qty !== 1) fail("An installed package is one system. Remove other items or change the quantity to 1.");
  const { u, heat } = lines[0];
  if (u.commercial) fail("Installation is for home systems only.");
  const job = INSTALL.jobs.find(j => j.key === inst.jobKey && !j.custom);
  if (!job) fail("This job needs a custom quote. Please text or call us.");
  if (job.equip === "outdoor" ? !/Condenser/.test(u.type) : !/System/.test(u.type)) fail("That system doesn't match the installation job. Please start the quote again.");
  if (klarna && NO_KLARNA_FINANCING.includes(state)) fail(`Klarna monthly financing isn't available in ${state}. Choose card or bank payments, or text us.`);
  const tier = INSTALL.tiers.high.includes(state) ? "high" : INSTALL.tiers.mid.includes(state) ? "mid" : "standard";
  const addons = INSTALL.addons.filter(a => (inst.addonKeys || []).includes(a.key));
  const std = Pricing.heatOf(u);
  const kitCredit = !/Gas/.test(u.type) && heat?.part && !std?.part ? Math.max(0, Pricing.priceOf(u, heat) - Pricing.priceOf(u, std)) : 0;
  const dollars = job.price[tier] + addons.reduce((s, a) => s + a.price, 0) - kitCredit;
  const cents = Math.round(dollars * 100);
  const packageCents = lines[0].unit + cents;
  if (klarna && packageCents > KLARNA_MAX_CENTS) fail("Klarna financing covers up to $10,000. Choose card or bank payments, or text us.");
  const share = Number(INSTALL.cardDeposit) > 0 && Number(INSTALL.cardDeposit) <= 1 ? Number(INSTALL.cardDeposit) : 0.75;
  const nowCents = klarna ? packageCents : Math.round(packageCents * share / 100) * 100;   // whole dollars
  return {
    klarna, cents, packageCents, nowCents, laterCents: packageCents - nowCents, share, tier, addons: addons.map(a => a.label), kitCredit,
    name: `Installation: ${job.label}`,
    description: clip(["Labor, materials and 1-year labor warranty", addons.length && `add-ons: ${addons.map(a => a.label).join(", ")}`, kitCredit && "heat kit included free"].filter(Boolean).join(" · "), 500),
  };
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return json(503, { error: "not_configured", message: "Online payment isn't connected yet. Text or email your order instead." });

  let body;
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }

  // Contractor pricing when a signed-in, approved contractor checks out.
  let user = null, profile = null;
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (token && supabaseReady()) {
    user = await userFromToken(token);
    if (user?.id) profile = (await select("contractors", `user_id=eq.${user.id}&select=*`))[0] || null;
  }

  let order;
  try { order = await buildOrder(body, profile); }
  catch (e) { return json(e.status || 500, { error: "bad_order", message: e.message }); }

  const origin = req.headers.get("origin") || process.env.URL || "http://localhost:8888";
  const ic = order.installCharge;
  const klarnaPackage = !!ic?.klarna, cardPackage = !!ic && !ic.klarna;
  const $d = cents => "$" + Math.round(cents / 100).toLocaleString("en-US");
  const line_items = cardPackage ? [{
    // Card / bank: one line for the upfront share of the whole installed package.
    quantity: 1,
    price_data: { currency: "usd", unit_amount: ic.nowCents, product_data: {
      name: clip(`Installed package, ${Math.round(ic.share * 100)}% upfront: ${order.lines[0].name}`, 250),
      ...(order.lines[0].u.image && /^https:\/\//.test(origin) ? { images: [new URL(order.lines[0].u.image, origin + "/").href] } : {}),
      description: clip(`Package ${$d(ic.packageCents)}: system (${order.lines[0].models}) + ${ic.name.replace(/^Installation: /, "installation, ")}${ic.addons.length ? `, ${ic.addons.join(", ")}` : ""}. Remaining ${$d(ic.laterCents)} is due after your install.`, 500) } },
  }] : order.lines.map(l => ({
    quantity: l.qty,
    price_data: { currency: "usd", unit_amount: l.unit, product_data: { name: clip(l.name, 250),
      ...(l.u.image && /^https:\/\//.test(origin) ? { images: [new URL(l.u.image, origin + "/").href] } : {}),
      description: clip(`${l.models ? "Models: " + l.models : ""}${order.pickup ? " · local pickup price" : l.near ? " · near-DFW delivery price" : " · free shipping"}`, 500) } },
  }));
  if (order.liftgate) line_items.push({ quantity: 1, price_data: { currency: "usd", unit_amount: Math.round(order.liftgatePrice * 100), product_data: { name: "Liftgate delivery" } } });
  if (klarnaPackage) line_items.push({ quantity: 1, price_data: { currency: "usd", unit_amount: ic.cents, product_data: { name: clip(ic.name, 250), description: ic.description } } });

  const summary = order.lines.map(l => `${l.qty}x ${l.name} (${l.models})`).join("; ");
  const metadata = {
    delivery: order.pickup ? "LOCAL PICKUP (DFW)" : `SHIP to ZIP ${order.zip.zip}`,
    liftgate: order.liftgate ? "yes" : "no",
    commercial_unloading: order.hasCommercial ? (order.comUnload ? "NEEDS HELP - quote it" : "customer has forklift") : "n/a",
    customer: clip(`${body.customer.name} · ${body.customer.phone} · ${body.customer.email}`, 480),
    address: clip([body.customer.street, body.customer.apt, body.customer.city, body.customer.state, body?.delivery?.zip].filter(Boolean).join(", "), 480),
    warranty: "Customer agreed: warranties registered by Northgate",
    near_dfw: order.lines.some(l => l.near) ? "yes (near-DFW delivery price)" : "no",
    company: clip(body?.customer?.company, 200),
    license: clip(body?.customer?.license, 100),
    contractor: profile?.status === "approved" ? clip(`${profile.company || ""} (${user.email})`, 200) : "",
    rep: clip(profile?.rep_code || String(body?.repCode || "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24), 30),
    spanish: body?.lang === "es" ? "yes" : "no",
    install: klarnaPackage ? clip([
      `INSTALLED PACKAGE, PAID IN FULL (Klarna): ${body.install.job || ""}`,
      body.install.address && `at ${body.install.address}`,
      ic.addons.length && `add-ons: ${ic.addons.join(", ")}`,
      ic.kitCredit && `heat kit included free`,
      `installation charged in this payment: $${(ic.cents / 100).toFixed(0)} (${ic.tier} area)`,
      body.install.notes && `notes: ${body.install.notes}`,
    ].filter(Boolean).join(" · "), 500) : cardPackage ? clip([
      `INSTALLED PACKAGE ${$d(ic.packageCents)}: ${Math.round(ic.share * 100)}% paid now (${$d(ic.nowCents)}), ${$d(ic.laterCents)} DUE AFTER INSTALL`,
      body.install.job,
      body.install.address && `at ${body.install.address}`,
      ic.addons.length && `add-ons: ${ic.addons.join(", ")}`,
      ic.kitCredit && `heat kit included free`,
      `installation part ${$d(ic.cents)} (${ic.tier} area)`,
      body.install.notes && `notes: ${body.install.notes}`,
    ].filter(Boolean).join(" · "), 500) : "",
    order_1: clip(summary, 500), order_2: clip(summary.slice(500), 500), order_3: clip(summary.slice(1000), 500),
  };

  // Embedded = Stripe's payment form shown inside our own page (customer stays on northgatehvac.com).
  const embedded = body?.embedded === true;
  const params = {
    mode: "payment",
    ...(embedded
      ? { ui_mode: "embedded", return_url: `${origin}/?paid={CHECKOUT_SESSION_ID}` }
      : { success_url: `${origin}/?paid={CHECKOUT_SESSION_ID}`, cancel_url: `${origin}/?checkout=cancelled` }),
    line_items,
    billing_address_collection: "required",
    phone_number_collection: { enabled: true },
    customer_creation: "always",
    metadata,
    payment_intent_data: { metadata, description: clip(`Northgate order: ${summary}`, 1000) },
    custom_text: { submit: { message: klarnaPackage
      ? "This pays for your whole installed package with Klarna monthly payments. We'll email your installation agreement, ship your system (arrives in 1–3 business days) and install it 1–2 days after it arrives. Nothing more is due to us after the install."
      : cardPackage
      ? `This is ${Math.round(ic.share * 100)}% of your ${$d(ic.packageCents)} installed package. We'll email your installation agreement, ship your system (arrives in 1–3 business days) and install it 1–2 days after it arrives. The remaining ${$d(ic.laterCents)} is paid online once the installation is finished.`
      : order.pickup
      ? "We'll call or text to set your pickup time in DFW."
      : "We confirm stock and ship in 3–5 business days. You'll get tracking by text or email." } },
  };
  if (!order.pickup) params.shipping_address_collection = { allowed_countries: ["US"] };
  params.customer_email = user?.email || String(body.customer.email).trim();
  if (process.env.STRIPE_AUTOMATIC_TAX === "true") params.automatic_tax = { enabled: true };
  if (process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION) params.payment_method_configuration = process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION;
  // Installed packages: Klarna finances the whole package in one payment; card/bank buyers pay in 2 payments, so no Klarna there.
  if (klarnaPackage) params.allowed_payment_method_types = ["klarna"];
  else if (cardPackage) params.excluded_payment_method_types = ["klarna"];

  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: formEncode(params),
  });
  const session = await r.json();
  if (!r.ok) {
    console.error("stripe error", session);
    return json(502, { error: "stripe_error", message: session?.error?.message || "Payment page couldn't be created." });
  }

  // Keep a record for order history / contractor accounts (the webhook marks it paid).
  if (supabaseReady()) {
    try {
      await insert("orders", {
        stripe_session_id: session.id,
        user_id: user?.id || null,
        status: "pending",
        total_cents: session.amount_total,
        delivery: metadata.delivery,
        items: order.lines.map(l => ({ key: l.key, qty: l.qty, name: l.name, models: l.models, unit_cents: l.unit })),
        rep_code: metadata.rep || null,
        // Installed packages paid by card: what's still owed after the install (admin sends the final payment link).
        meta: cardPackage ? { ...metadata, install_package_cents: ic.packageCents, install_due_cents: ic.laterCents } : metadata,
      });
    } catch (e) { console.error("order record failed", e.message); }
  }
  return json(200, embedded ? { clientSecret: session.client_secret } : { url: session.url });
};
