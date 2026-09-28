// ============================================================
//  PRICING RULES shared by the website AND the checkout server
//  (netlify/functions/checkout.mjs), so what a customer sees is exactly
//  what they're charged. Edit prices in inventory.js, not here.
// ============================================================
(function (root) {
  // Heat kit / furnace option picked for an item (standard = the option with add: 0).
  const heatOf = (u, model) => u.heatOptions ? (u.heatOptions.find(o => o.model === model) || u.heatOptions.find(o => !o.add) || u.heatOptions[0]) : null;
  const priceOf = (u, heat) => u.price == null ? null : u.price + (heat?.add || 0);
  // $ off for local DFW pickup: systems get SHIPPING.pickupDiscount, parts/commercial carry their own.
  const pickupOff = (u, shipping) => u.pickupDiscount ?? (/System/.test(u.type || "") ? (shipping.pickupDiscount || 0) : 0);

  // Near-DFW delivery: ZIP within ~2 hours of DFW gets a smaller delivery charge (per unit shipped).
  // Only items that carry built-in freight (anything with a pickup discount) qualify; never more than pickup saves.
  const nearDfw = (zip, shipping) => /^\d{5}$/.test(String(zip || "")) && (shipping.nearDfwZip3 || []).includes(+String(zip).slice(0, 3));
  const nearDfwOff = (u, shipping) => {
    const d = shipping.nearDfwDiscount || {};
    const pick = pickupOff(u, shipping);
    if (!pick) return 0;
    const want = u.nearDfwDiscount ?? (u.commercial ? d.commercial : u.unit === "each" ? d.part : d.system);   // item can set its own
    return Math.min(want || 0, pick);
  };

  // What kind of item this is, for contractor discounts.
  const kindOf = u => u.commercial ? "commercial" : u.unit === "each" ? "part" : "system";

  // Contractor account price. The owner sets, per contractor (Supabase "contractors" table):
  //   discount_system / discount_part / discount_commercial  ($ off the site price)
  //   prices: { "<item id>": 3200 }                          (exact price for one item, beats the discount)
  // Only approved accounts get account pricing.
  function contractorPrice(u, profile) {
    if (u.price == null || !profile || profile.status !== "approved") return u.price;
    const exact = profile.prices && profile.prices[u.id];
    if (exact != null && exact !== "") return Math.max(0, Math.round(+exact));
    const off = +profile["discount_" + kindOf(u)] || 0;
    return Math.max(0, Math.round(u.price - off));
  }

  // Replace site prices with a contractor's prices (keeps the original in listPrice).
  function applyContractorPricing(inventory, profile) {
    inventory.forEach(u => {
      if (u.listPrice === undefined) u.listPrice = u.price;
      u.price = contractorPrice({ ...u, price: u.listPrice }, profile);
    });
  }

  // "id" or "id::heatModel" -> { u, heat }
  function parseKey(inventory, key) {
    const [id, hm] = String(key).split("::");
    const u = inventory.find(x => x.id === id);
    return u ? { u, heat: heatOf(u, hm) } : null;
  }

  root.Pricing = { heatOf, priceOf, pickupOff, nearDfw, nearDfwOff, kindOf, contractorPrice, applyContractorPricing, parseKey };
})(typeof window !== "undefined" ? window : globalThis);
