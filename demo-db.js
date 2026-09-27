// ============================================================
//  DEMO DATABASE for admin.html / rep.html when Supabase isn't connected yet.
//  Sample reps, customers, orders and costs, kept in memory (nothing is saved).
//  Mimics the small part of the Supabase client those pages use.
// ============================================================
window.makeDemoClient = function (as) {   // as: "admin" | "rep"
  const day = n => new Date(Date.now() - n * 864e5).toISOString();
  const db = {
    admins: [{ user_id: "demo-admin" }],
    reps: [
      { code: "MIKE", name: "Mike Alvarez", email: "mike@northgate.com", phone: "(214) 555-0161", user_id: "demo-rep", active: true, house_pct: 15, house_basis: "margin", max_discount_system: 400, max_discount_part: 100, max_discount_commercial: 1000, created_at: day(20) },
      { code: "JESS", name: "Jessica Tran", email: "jess@northgate.com", phone: "(817) 555-0174", user_id: null, active: true, house_pct: 20, house_basis: "margin", max_discount_system: null, max_discount_part: null, max_discount_commercial: null, created_at: day(5) },
    ],
    contractors: [
      { user_id: "c1", created_at: day(0), email: "mike@coolrightac.com", name: "Mike Torres", company: "CoolRight AC", phone: "(512) 555-0142", license: "TACLA00012345E", license_state: "TX", volume: "5 – 9", work: "Residential replacement", status: "pending", discount_system: 0, discount_part: 0, discount_commercial: 0, prices: {}, notes: "", rep_code: "MIKE", role: "Contractor / company owner", city: "Waco", state: "TX", service_areas: "Waco, Temple, Killeen", account_type: "Contractor / business", zip: "76706" },
      { user_id: "c2", created_at: day(3), email: "ops@gulfbreezehvac.com", name: "Dana Reyes", company: "Gulf Breeze HVAC", phone: "(813) 555-0199", license: "CAC1818123", license_state: "FL", volume: "10 – 24", work: "Both", status: "approved", discount_system: 250, discount_part: 50, discount_commercial: 500, prices: { "trane-3.5t-gas-5ttr4042a1000a": 4300 }, notes: "Buys Trane gas systems mostly. Pays by ACH.", rep_code: "MIKE", role: "Contractor / company owner", city: "Tampa", state: "FL", service_areas: "Tampa Bay, Clearwater, St. Pete", account_type: "Contractor / business", zip: "33634" },
      { user_id: "c3", created_at: day(9), email: "carlos@example.com", name: "Carlos Mena", company: "", phone: "(972) 555-0110", license: "", license_state: "", volume: "1 – 4", work: "Residential replacement", status: "approved", discount_system: 150, discount_part: 0, discount_commercial: 0, prices: {}, notes: "", rep_code: "JESS", role: "HVAC technician", city: "Garland", state: "TX", service_areas: "Garland, Rowlett, Mesquite", account_type: "Local customer (within 2 hours of DFW)", zip: "75040" },
      { user_id: "c4", created_at: day(12), email: "info@quickfixair.com", name: "Sam Lee", company: "QuickFix Air", phone: "(214) 555-0118", license: "", license_state: "TX", volume: "1 – 4", work: "Residential replacement", status: "rejected", discount_system: 0, discount_part: 0, discount_commercial: 0, prices: {}, notes: "", rep_code: null, role: "Contractor / company owner", city: "Dallas", state: "TX", service_areas: "Dallas", account_type: "Contractor / business", zip: "75201" },
    ],
    orders: [
      { id: 1, created_at: day(0), status: "paid", total_cents: 419000, delivery: "SHIP to ZIP 33634", payment_method: "card", user_id: "c2", rep_code: "MIKE", customer_name: "Dana Reyes", customer_email: "ops@gulfbreezehvac.com", customer_phone: "(813) 555-0199", meta: { company: "Gulf Breeze HVAC", contractor: "Gulf Breeze HVAC (ops@gulfbreezehvac.com)", liftgate: "no" }, items: [{ key: "trane-3.5t-gas-5ttr4042a1000a::S8X1B080M4PSC", qty: 1, unit_cents: 419000, name: "Trane 3.5-Ton XR14 Gas AC System · 80k BTU furnace", models: "5TTR4042A1000A + 5TXCB006AS3HCA + S8X1B080M4PSC" }], shipping_address: { line1: "4410 W Kennedy Blvd", city: "Tampa", state: "FL", postal_code: "33609" } },
      { id: 2, created_at: day(4), status: "shipped", total_cents: 820000, delivery: "SHIP to ZIP 33634", payment_method: "us_bank_account", user_id: "c2", rep_code: "MIKE", customer_name: "Dana Reyes", customer_email: "ops@gulfbreezehvac.com", customer_phone: "(813) 555-0199", meta: { company: "Gulf Breeze HVAC", liftgate: "no" }, items: [{ key: "carrier-3t-electric-ga5san53602w::KFFEH3101C15", qty: 2, unit_cents: 410000, name: "Carrier 3-Ton Electric AC System · 15 kW heat", models: "GA5SAN53602W + FJ5ANXB36L00 + KFFEH3101C15" }] },
      { id: 3, created_at: day(1), status: "processing", total_cents: 505000, delivery: "SHIP to ZIP 76706", payment_method: "us_bank_account", user_id: "c1", rep_code: "MIKE", customer_name: "Mike Torres", customer_email: "mike@coolrightac.com", customer_phone: "(512) 555-0142", meta: {}, items: [{ key: "trane-5t-electric-5ttr4060a1000a::BAYHTR1517BRK", qty: 1, unit_cents: 505000, name: "Trane 5-Ton XR14 Electric AC System · 15 kW heat kit", models: "5TTR4060A1000A + 5TEM4D07AC51SA + BAYHTR1517BRK" }] },
      { id: 4, created_at: day(2), status: "picked_up", total_cents: 330000, delivery: "LOCAL PICKUP (DFW)", payment_method: "affirm", user_id: "c3", rep_code: "JESS", customer_name: "Carlos Mena", customer_email: "carlos@example.com", customer_phone: "(972) 555-0110", meta: {}, items: [{ key: "goodman-2t-gas-glxs4ba2410", qty: 1, unit_cents: 330000, name: "Goodman 2-Ton 15.2 SEER2 Gas Furnace System · 60k BTU furnace", models: "GLXS4BA2410 + CAPTA3022B3 + GR9S800603BN" }] },
    ],
    costs: [
      { item_id: "trane-3.5t-gas-5ttr4042a1000a", cost: 3400, updated_at: day(1) },
      { item_id: "carrier-3t-electric-ga5san53602w", cost: 2950, updated_at: day(1) },
      { item_id: "trane-5t-electric-5ttr4060a1000a", cost: 3800, updated_at: day(1) },
    ],
  };
  const user = as === "rep" ? { id: "demo-rep", email: "mike@northgate.com" } : { id: "demo-admin", email: "you@northgate.com" };
  const repCode = as === "rep" ? "MIKE" : null;
  const visible = (table, rows) => {                       // imitate row-level security for the rep view
    if (as !== "rep") return rows;
    if (table === "contractors" || table === "orders") return rows.filter(r => r.rep_code === repCode);
    if (table === "reps") return rows.filter(r => r.user_id === user.id);
    if (table === "admins") return [];
    return rows;
  };
  const query = (table, op, payload) => {
    const filters = [];
    const q = {
      select() { return q; }, order() { return q; }, limit() { return q; },
      eq(col, val) { filters.push([col, val]); return q; },
      maybeSingle() { return Promise.resolve({ data: run()[0] || null, error: null }); },
      single() { return Promise.resolve({ data: run()[0] || null, error: null }); },
      then(ok, fail) { return Promise.resolve({ data: run(), error: null }).then(ok, fail); },
    };
    const run = () => {
      const rows = db[table] || (db[table] = []);
      if (op === "insert" || op === "upsert") {
        const list = Array.isArray(payload) ? payload : [payload];
        const key = table === "reps" ? "code" : table === "costs" ? "item_id" : "user_id";
        list.forEach(r => { const i = rows.findIndex(x => x[key] === r[key]); if (i >= 0) Object.assign(rows[i], r); else rows.push({ ...r }); });
        return list;
      }
      let hit = visible(table, rows).filter(r => filters.every(([c, v]) => String(r[c]) === String(v)));
      if (op === "update") hit.forEach(r => Object.assign(r, payload));
      if (op === "delete") { hit.forEach(r => rows.splice(rows.indexOf(r), 1)); }
      return hit;
    };
    return q;
  };
  return {
    auth: { getSession: async () => ({ data: { session: { user } } }), signOut: async () => {}, signInWithPassword: async () => ({}) },
    from: table => ({
      select: () => query(table, "select"),
      update: patch => query(table, "update", patch),
      insert: rows => query(table, "insert", rows),
      upsert: rows => query(table, "upsert", rows),
      delete: () => query(table, "delete"),
    }),
    rpc: async name => ({ data: name === "claim_rep" || name === "my_rep_code" ? repCode : null, error: null }),
  };
};
