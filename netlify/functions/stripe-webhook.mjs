// POST /.netlify/functions/stripe-webhook  (Stripe > Developers > Webhooks points here)
// Marks orders paid / failed in Supabase. Bank (ACH) payments take a few days to clear,
// so a completed checkout can be "processing" before it's "paid".
import crypto from "node:crypto";
import { supabaseReady, select, update } from "./lib/supabase.mjs";

function verify(raw, header, secret) {
  const parts = Object.fromEntries(String(header || "").split(",").map(p => p.split("=")));
  if (!parts.t || !parts.v1) return false;
  if (Math.abs(Date.now() / 1000 - +parts.t) > 300) return false;   // reject replays older than 5 minutes
  const expected = crypto.createHmac("sha256", secret).update(`${parts.t}.${raw}`).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(parts.v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async (req) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response("not configured", { status: 503 });
  const raw = await req.text();
  if (!verify(raw, req.headers.get("stripe-signature"), secret)) return new Response("bad signature", { status: 400 });

  const event = JSON.parse(raw);
  const s = event.data?.object;
  const status = {
    "checkout.session.completed": s?.payment_status === "paid" ? "paid" : "processing",
    "checkout.session.async_payment_succeeded": "paid",
    "checkout.session.async_payment_failed": "failed",
    "checkout.session.expired": "abandoned",
  }[event.type];

  // Final payment on an installed package (paid through the link from admin.html): mark the original order.
  if (status && s?.payment_link && supabaseReady()) {
    const order = (await select("orders", `meta->>final_link_id=eq.${encodeURIComponent(s.payment_link)}&select=id,meta`))[0];
    if (order && ["paid", "processing", "failed"].includes(status)) {
      await update("orders", `id=eq.${order.id}`, {
        meta: { ...order.meta, final_payment_status: status, ...(status === "paid" ? { final_paid_at: new Date().toISOString(), final_session_id: s.id } : {}) },
        updated_at: new Date().toISOString(),
      });
    }
    return new Response("ok");
  }

  if (status && s?.id && supabaseReady()) {
    await update("orders", `stripe_session_id=eq.${encodeURIComponent(s.id)}`, {
      status,
      customer_email: s.customer_details?.email || null,
      customer_name: s.customer_details?.name || null,
      customer_phone: s.customer_details?.phone || null,
      shipping_address: s.shipping_details?.address || s.collected_information?.shipping_details?.address || null,
      payment_method: s.payment_method_types?.join(",") || null,
      updated_at: new Date().toISOString(),
    });
  }
  return new Response("ok");
};
