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
  const { inventory, shipping, Pricing } = loadCatalog();
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
  return { lines, pickup, zip, liftgate, liftgatePrice: shipping.liftgatePrice, hasCommercial, comUnload: !pickup && hasCommercial && !!body?.delivery?.comUnload };
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
  const line_items = order.lines.map(l => ({
    quantity: l.qty,
    price_data: { currency: "usd", unit_amount: l.unit, product_data: { name: clip(l.name, 250),
      ...(l.u.image && /^https:\/\//.test(origin) ? { images: [new URL(l.u.image, origin + "/").href] } : {}),
      description: clip(`${l.models ? "Models: " + l.models : ""}${order.pickup ? " · local pickup price" : l.near ? " · near-DFW delivery price" : " · free shipping"}`, 500) } },
  }));
  if (order.liftgate) line_items.push({ quantity: 1, price_data: { currency: "usd", unit_amount: Math.round(order.liftgatePrice * 100), product_data: { name: "Liftgate delivery" } } });

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
    // Installation order: the system is paid now, the installation balance after the install (not charged here).
    install: body?.install ? clip([
      `INSTALL: ${body.install.job || ""}`,
      body.install.address && `at ${body.install.address}`,
      body.install.addons?.length && `add-ons: ${body.install.addons.join(", ")}`,
      Number.isFinite(+body.install.balance) && `install balance due after job (site estimate): $${Math.round(+body.install.balance)}`,
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
    custom_text: { submit: { message: body?.install
      ? "You're paying for your system today. We'll email your installation agreement, ship your system (arrives in 1–3 business days) and install it 1–2 days after it arrives. The installation is paid online after the job is done."
      : order.pickup
      ? "We'll call or text to set your pickup time in DFW."
      : "We confirm stock and ship in 3–5 business days. You'll get tracking by text or email." } },
  };
  if (!order.pickup) params.shipping_address_collection = { allowed_countries: ["US"] };
  params.customer_email = user?.email || String(body.customer.email).trim();
  if (process.env.STRIPE_AUTOMATIC_TAX === "true") params.automatic_tax = { enabled: true };
  if (process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION) params.payment_method_configuration = process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION;

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
        meta: metadata,
      });
    } catch (e) { console.error("order record failed", e.message); }
  }
  return json(200, embedded ? { clientSecret: session.client_secret } : { url: session.url });
};
