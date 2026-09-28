// GET /.netlify/functions/checkout-status?session_id=cs_...
// After Stripe sends a customer back to the site, the page asks here whether the payment really went
// through. (Backing out of Klarna or a bank app also returns to the site, without paying.)
// Returns only { status, payment_status }: "complete"/"open"/"expired" and "paid"/"unpaid"/"no_payment_required".
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export default async (req) => {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return json(503, { error: "not_configured" });
  const id = new URL(req.url).searchParams.get("session_id") || "";
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) return json(400, { error: "bad_session" });
  const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${id}`, { headers: { Authorization: `Bearer ${secret}` } });
  const s = await r.json().catch(() => ({}));
  if (!r.ok) return json(r.status === 404 ? 404 : 502, { error: "lookup_failed" });
  return json(200, { status: s.status, payment_status: s.payment_status });
};
