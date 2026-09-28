// POST /.netlify/functions/final-payment   (admin only)
// Body: { orderId }   Header: Authorization: Bearer <admin's Supabase access token>
// Creates a one-time Stripe Payment Link for what an installed-package order still owes after the install
// (meta.install_due_cents, written by checkout). The link never expires and can only be paid once;
// the webhook marks the order when it's paid. Returns { url }.
import { supabaseReady, userFromToken, select, update } from "./lib/supabase.mjs";

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function formEncode(obj, prefix = "", out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") formEncode(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}
async function stripe(path, params, secret) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: formEncode(params),
  });
  const out = await r.json();
  if (!r.ok) throw new Error(out?.error?.message || `Stripe ${path} failed`);
  return out;
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !supabaseReady()) return json(503, { error: "not_configured", message: "Stripe or the database isn't connected on the server." });

  // Admins only.
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const user = token ? await userFromToken(token) : null;
  if (!user?.id) return json(401, { error: "signin", message: "Sign in again." });
  const isAdmin = (await select("admins", `user_id=eq.${user.id}&select=user_id`)).length > 0;
  if (!isAdmin) return json(403, { error: "forbidden", message: "Admins only." });

  let body;
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }
  const id = Math.floor(+body?.orderId);
  if (!(id > 0)) return json(400, { error: "bad_order", message: "Missing order." });
  const order = (await select("orders", `id=eq.${id}&select=*`))[0];
  if (!order) return json(404, { error: "not_found", message: "Order not found." });

  const meta = order.meta || {};
  const due = Math.round(+meta.install_due_cents || 0);
  if (!(due > 0)) return json(400, { error: "nothing_due", message: "This order has no amount due after the install." });
  if (meta.final_paid_at) return json(400, { error: "paid", message: "The final payment was already received." });
  if (!["paid", "shipped", "picked_up"].includes(order.status)) return json(400, { error: "unpaid", message: "The first payment on this order hasn't cleared yet." });
  if (meta.final_link_url) return json(200, { url: meta.final_link_url, existing: true });   // one link per order

  const name = (order.items?.[0]?.name || "Installed package").slice(0, 200);
  try {
    const price = await stripe("prices", {
      currency: "usd", unit_amount: due,
      product_data: { name: `Final payment: installed package (order #${id})` },
    }, secret);
    const link = await stripe("payment_links", {
      line_items: [{ price: price.id, quantity: 1 }],
      restrictions: { completed_sessions: { limit: 1 } },
      metadata: { final_for_order: String(id) },
      payment_intent_data: { metadata: { final_for_order: String(id) }, description: `Northgate final payment, order #${id}: ${name}` },
      after_completion: { type: "hosted_confirmation", hosted_confirmation: { custom_message: "Thank you! Your installed package is paid in full." } },
    }, secret);
    await update("orders", `id=eq.${id}`, {
      meta: { ...meta, final_link_url: link.url, final_link_id: link.id, final_link_created_at: new Date().toISOString() },
      updated_at: new Date().toISOString(),
    });
    return json(200, { url: link.url });
  } catch (e) {
    console.error("final payment link failed", e.message);
    return json(502, { error: "stripe_error", message: e.message });
  }
};
