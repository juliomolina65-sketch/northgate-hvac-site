// ============================================================
//  REP COMMISSION MATH (used by admin.html and rep.html)
//  margin  = what the customer paid for the equipment - your cost (from the Costs list)
//  Northgate fee = rep.house_pct % of the margin (or of the sale, if rep.house_basis = "sale")
//  rep earns = margin - Northgate fee
//  Liftgate / freight add-ons are pass-through and not counted.
// ============================================================
(function (root) {
  const COUNTED = ["paid", "shipped", "picked_up"];          // money received
  const itemId = key => String(key || "").split("::")[0];

  // costs: { "<item id>" or "<item id>::<heat option>": cost }
  function orderMoney(order, costs, rep) {
    let sale = 0, cost = 0, known = true;
    for (const it of order.items || []) {
      const qty = +it.qty || 0, unit = (+it.unit_cents || 0) / 100;
      sale += unit * qty;
      const c = costs[it.key] ?? costs[itemId(it.key)];
      if (c == null) known = false; else cost += +c * qty;
    }
    const pct = (+rep?.house_pct || 0) / 100;
    const margin = known ? sale - cost : null;
    const fee = rep?.house_basis === "sale" ? sale * pct : margin == null ? null : margin * pct;
    const earn = margin == null || fee == null ? null : margin - fee;
    return { sale, cost: known ? cost : null, margin, fee, earn, known, counted: COUNTED.includes(order.status) };
  }

  function totals(orders, costs, rep) {
    const t = { orders: 0, sale: 0, margin: 0, fee: 0, earn: 0, missingCost: 0, pending: 0 };
    for (const o of orders) {
      const m = orderMoney(o, costs, rep);
      if (!m.counted) { if (o.status === "processing" || o.status === "pending") t.pending += m.sale; continue; }
      t.orders++; t.sale += m.sale;
      if (m.known) { t.margin += m.margin; t.fee += m.fee; t.earn += m.earn; } else t.missingCost++;
    }
    return t;
  }

  root.Commission = { orderMoney, totals, COUNTED, itemId };
})(typeof window !== "undefined" ? window : globalThis);
