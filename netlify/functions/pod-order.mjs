// POST /.netlify/functions/pod-order  — "Pay on delivery" order (cash or Zelle), local delivery only.
// Body: same as checkout ({ items, delivery: { method: "freight", zip, date: "YYYY-MM-DD" }, customer, repCode, lang })
// Only for ZIPs in the local delivery area (Pricing.localDelivery, about 3 hours of DFW), no commercial units,
// no installed packages, and a delivery date from tomorrow (Dallas time) up to SHIPPING.localDeliveryMaxDays out.
// Prices are rebuilt on the server exactly like the online checkout. The order is saved for the admin page as
// status "pay_on_delivery"; the browser then sends the order to Northgate by text or email as well.
import { buildOrder } from "./checkout.mjs";
import { loadCatalog } from "./lib/catalog.mjs";
import { supabaseReady, userFromToken, select, insert } from "./lib/supabase.mjs";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const clip = (s, n = 490) => String(s || "").slice(0, n);

// Today's date in Dallas as YYYY-MM-DD, and that date moved by n days.
const todayDallas = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
const addDays = (ymd, n) => new Date(Date.parse(ymd + "T12:00:00Z") + n * 864e5).toISOString().slice(0, 10);

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  let body;
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }
  const fail = m => json(400, { error: "bad_order", message: m });

  if (body?.delivery?.method !== "freight") return fail("Pay on delivery is for local delivery. For pickup, choose cash at pickup.");
  if (body?.install) return fail("Installed packages are paid online.");

  const { shipping, Pricing } = loadCatalog();
  const zip = String(body?.delivery?.zip || "").trim();
  if (!Pricing.localDelivery(zip, shipping)) return fail("Pay on delivery is only available within about 3 hours of DFW. Please pay online and we'll ship it.");

  const date = String(body?.delivery?.date || "");
  const today = todayDallas(), first = addDays(today, 1), last = addDays(today, shipping.localDeliveryMaxDays || 30);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < first || date > last) return fail("Pick a delivery date from tomorrow on (no same-day delivery).");

  // Contractor pricing when a signed-in, approved contractor orders (same as the online checkout).
  let user = null, profile = null;
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (token && supabaseReady()) {
    user = await userFromToken(token);
    if (user?.id) profile = (await select("contractors", `user_id=eq.${user.id}&select=*`))[0] || null;
  }

  let order;
  try { order = await buildOrder({ ...body, delivery: { ...body.delivery, liftgate: false } }, profile); }   // we deliver it ourselves: no liftgate charge
  catch (e) { return json(e.status || 500, { error: "bad_order", message: e.message }); }
  if (order.hasCommercial) return fail("Commercial units ship by freight truck and are paid online.");

  const totalCents = order.lines.reduce((s, l) => s + l.unit * l.qty, 0);
  const orderNo = `NG-${date.replace(/-/g, "").slice(2)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const c = body.customer;
  const summary = order.lines.map(l => `${l.qty}x ${l.name} (${l.models})`).join("; ");
  const meta = {
    order_no: orderNo,
    delivery: `LOCAL DELIVERY on ${date} to ZIP ${zip}`,
    delivery_date: date,
    payment: "PAY ON DELIVERY (cash or Zelle)",
    customer: clip(`${c.name} · ${c.phone} · ${c.email}`, 480),
    address: clip([c.street, c.apt, c.city, c.state, zip].filter(Boolean).join(", "), 480),
    warranty: "Customer agreed: warranties registered by Northgate",
    near_dfw: order.lines.some(l => l.near) ? "yes (near-DFW delivery price)" : "no",
    company: clip(c.company, 200),
    license: clip(c.license, 100),
    contractor: profile?.status === "approved" ? clip(`${profile.company || ""} (${user.email})`, 200) : "",
    rep: clip(profile?.rep_code || String(body?.repCode || "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24), 30),
    spanish: body?.lang === "es" ? "yes" : "no",
    order_1: clip(summary, 500),
  };

  let saved = false;
  if (supabaseReady()) {
    try {
      await insert("orders", {
        user_id: user?.id || null,
        status: "pay_on_delivery",
        total_cents: totalCents,
        delivery: `LOCAL DELIVERY ${date} · pay on delivery (cash/Zelle)`,
        items: order.lines.map(l => ({ key: l.key, qty: l.qty, name: l.name, models: l.models, unit_cents: l.unit })),
        rep_code: meta.rep || null,
        customer_name: clip(c.name, 200), customer_email: clip(c.email, 200), customer_phone: clip(c.phone, 60),
        payment_method: "cash / Zelle on delivery",
        meta,
      });
      saved = true;
    } catch (e) { console.error("pod order record failed", e.message); }
  }
  return json(200, { ok: true, orderNo, date, totalCents, saved });
};
