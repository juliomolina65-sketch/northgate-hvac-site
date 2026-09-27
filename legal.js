// Fills business details on the Terms / Privacy pages from inventory.js (BUSINESS and SHIPPING),
// so the legal pages always match the rest of the site.
(function () {
  const B = window.BUSINESS || {}, S = window.SHIPPING || {};
  const money = n => "$" + Math.round(n).toLocaleString("en-US");
  document.querySelectorAll("[data-biz]").forEach(el => { el.textContent = B[el.dataset.biz] || ""; });
  document.querySelectorAll("[data-ship]").forEach(el => {
    const v = S[el.dataset.ship];
    el.textContent = typeof v === "number" && el.dataset.money !== undefined ? money(v) : v ?? "";
  });
  const links = { tel: "tel:" + (B.sms || ""), sms: "sms:" + (B.sms || ""), mailto: "mailto:" + (B.email || "") };
  document.querySelectorAll("[data-href]").forEach(el => { el.href = links[el.dataset.href]; });
  const mail = document.getElementById("mailLine");
  if (mail) mail.hidden = !B.mailingAddress;
  document.title = document.title.replace("Northgate", B.name || "Northgate");
})();
