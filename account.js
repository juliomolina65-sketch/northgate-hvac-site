// ============================================================
//  CONTRACTOR ACCOUNTS + ONLINE CHECKOUT
//  - Contractor sign-up / sign-in (Supabase). Approved contractors see their own prices.
//  - "Pay online" in the order drawer -> Stripe Checkout (card, ACH, Affirm/Klarna monthly).
//  Runs in DEMO MODE until config.js has keys (see SETUP.md).
// ============================================================
(function () {
  const C = window.NORTHGATE_CONFIG || {};
  const SB_ON = !!(C.SUPABASE_URL && C.SUPABASE_ANON_KEY);
  const STRIPE_PK = C.STRIPE_PUBLISHABLE_KEY || "";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = v => String(v ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const loadScript = src => new Promise((ok, fail) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = fail; document.head.appendChild(s); });

  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let sb = null, session = null, profile = null, isAdmin = false, myRepCode = null;
  let stripeP = null, payForm = null;   // Stripe.js (loaded once) and the open on-page payment form

  // ---------------------------------------------------------- Rep links: yoursite/?rep=CODE
  // The code is remembered on this device for 90 days; whoever signs up belongs to that rep.
  const REP_KEY = "ngRep", REP_DAYS = 90;
  (function captureRep() {
    const q = new URLSearchParams(location.search);
    const code = (q.get("rep") || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24);
    if (code) {
      try { localStorage.setItem(REP_KEY, JSON.stringify({ code, t: Date.now() })); } catch (e) {}
      q.delete("rep");
      history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : "") + location.hash);
    }
  })();
  window.NGRep = {
    code() {
      try {
        const r = JSON.parse(localStorage.getItem(REP_KEY) || "null");
        return r && Date.now() - r.t < REP_DAYS * 864e5 ? r.code : null;
      } catch (e) { return null; }
    },
  };
  let caTab = "apply";

  function start() {
    const NG = window.NG;
    buildContractorModal(NG);
    wireCheckout(NG);
    handleReturnFromStripe(NG);
    if (STRIPE_PK) setupMonthlyMessaging();
    if (SB_ON) initSupabase(NG);
  }
  if (window.NG) start(); else document.addEventListener("ng:ready", start, { once: true });

  // ---------------------------------------------------------- Supabase session + contractor pricing
  async function initSupabase(NG) {
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
      sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);
      const { data } = await sb.auth.getSession();
      await onSession(NG, data.session);
      sb.auth.onAuthStateChange((_e, s) => { if ((s?.access_token || null) !== (session?.access_token || null)) onSession(NG, s); });
    } catch (e) { console.error("Supabase failed to load", e); }
  }

  async function onSession(NG, s) {
    session = s;
    profile = null; isAdmin = false;
    if (s?.user) {
      profile = null;
      const { data: repRow } = await sb.from("reps").select("code").eq("user_id", s.user.id).maybeSingle();
      if (!repRow) profile = await ensureContractorRow(s.user);   // reps don't get a customer profile
      const { data: adm } = await sb.from("admins").select("user_id").eq("user_id", s.user.id).maybeSingle();
      isAdmin = !!adm;
      try { const { data: code } = await sb.rpc("claim_rep"); myRepCode = code || null; } catch (e) { myRepCode = null; }
    }
    Pricing.applyContractorPricing(NG.INV, profile);
    NG.refresh();
    renderAccountBits(NG);
  }

  // The application details are saved with the sign-up, so the row is created on first sign-in
  // even when Supabase asks the user to confirm their email first.
  async function ensureContractorRow(user) {
    const { data: row } = await sb.from("contractors").select("*").eq("user_id", user.id).maybeSingle();
    if (row) return row;
    const m = user.user_metadata || {};
    const fresh = { user_id: user.id, email: user.email, name: m.name, company: m.company, phone: m.phone, license: m.license, license_state: m.license_state, volume: m.volume, work: m.work, account_type: m.account_type, zip: m.zip,
      role: m.role, city: m.city, state: m.state, service_areas: m.service_areas, rep_code: m.rep_code || null };
    await sb.from("contractors").insert(fresh);
    const { data: again } = await sb.from("contractors").select("*").eq("user_id", user.id).maybeSingle();
    return again;
  }

  // Header button label + banner.
  function renderAccountBits(NG) {
    const btn = $('.call-btn[data-contractor] span');
    if (btn) btn.textContent = session ? (myRepCode ? "Rep dashboard" : profile?.company || profile?.name || "My account") : "Account login";
    let banner = $("#acctBanner");
    if (!banner) { banner = document.createElement("div"); banner.id = "acctBanner"; document.body.insertBefore(banner, document.body.firstChild); }
    banner.hidden = !session;
    if (session) {
      const st = myRepCode || isAdmin ? "approved" : profile?.status;
      banner.className = "acct-banner" + (st === "approved" ? "" : " pending");
      banner.textContent = myRepCode ? `Signed in as Northgate sales rep (${myRepCode}).` : isAdmin && !profile ? "Signed in as admin." : st === "approved"
        ? `Signed in as ${profile.company || profile.email}: your contractor prices are showing.`
        : st === "rejected" ? "Your contractor account wasn't approved. Call us with any questions."
        : "Your contractor account is waiting for approval. You'll see your prices as soon as we approve it.";
    }
    if ($("#caBg").classList.contains("open")) showCaView(NG);
  }

  // ---------------------------------------------------------- Contractor modal: apply / sign in / my account
  function buildContractorModal(NG) {
    const form = $("#caForm");
    form.insertAdjacentHTML("afterbegin", `<div class="ca-tabs" id="caTabs"><button type="button" data-ca-tab="signin" aria-pressed="false">Sign in</button><button type="button" data-ca-tab="apply" aria-pressed="true">Create an account</button></div>`);
    // Password + create-account button on the application (only when accounts are connected).
    const send = form.querySelector(".send");
    send.insertAdjacentHTML("beforebegin", `<div class="ws-row" id="caPassRow"><label>Create a password<input id="caPass" type="password" autocomplete="new-password" minlength="8" placeholder="8+ characters"></label><span></span></div>
      <button class="btn btn-cta" type="button" id="caCreate" style="width:100%;justify-content:center">Create account &amp; apply</button>
      <div id="caApplyMsg"></div>
      <div class="or-line" id="caOr"><span>or send your application by message</span></div>`);
    form.insertAdjacentHTML("afterend", `
      <div class="ws-body" id="caSignin" hidden>
        <div class="ca-tabs"><button type="button" data-ca-tab="signin" aria-pressed="true">Sign in</button><button type="button" data-ca-tab="apply" aria-pressed="false">Create an account</button></div>
        <div class="ca-msg err" id="siSoon" hidden>Online login turns on when the site goes live. Until then, create your account request on the next tab and we'll set you up.</div>
        <label>Email<input id="siEmail" type="email" autocomplete="email"></label>
        <label>Password<input id="siPass" type="password" autocomplete="current-password"></label>
        <button class="btn btn-cta" type="button" id="siGo" style="width:100%;justify-content:center;margin-top:6px">Sign in</button>
        <button class="btn btn-line" type="button" id="siReset" style="width:100%;justify-content:center;margin-top:8px">Forgot password? Email me a link</button>
        <div id="siMsg"></div>
        <p class="fine" style="text-align:center;margin-top:10px">Don't have an account? <button type="button" class="linkish" data-ca-tab="apply">Create one</button>. Trade accounts are for HVAC contractors and businesses.</p>
      </div>
      <div class="ws-body" id="caAccount" hidden></div>`);

    document.addEventListener("click", e => {
      const t = e.target.closest?.("[data-ca-tab]"); if (!t) return;
      caTab = t.dataset.caTab; showCaView(NG);
    });
    // Re-render the right view every time the modal opens.
    // "Account login" opens Sign in; "Apply" / contractor pricing buttons open Create an account.
    document.addEventListener("click", e => {
      const b = e.target.closest?.("[data-contractor]"); if (!b) return;
      if (!session) caTab = b.id === "acctBtn" ? "signin" : "apply";
      setTimeout(() => showCaView(NG), 0);
    });

    showReferral();
    $("#caCreate").onclick = () => createAccount(NG);
    $("#siGo").onclick = () => signIn();
    $("#siPass").addEventListener("keydown", e => { if (e.key === "Enter") signIn(); });
    $("#siReset").onclick = () => resetPassword();
    showCaView(NG);
  }

  async function showReferral() {
    const code = window.NGRep.code(), el = $("#caRef");
    if (!code) { el.hidden = true; return; }
    let name = null;
    try { if (sb) { const { data } = await sb.rpc("rep_name", { p_code: code }); name = data; } } catch (e) {}
    el.hidden = false;
    el.textContent = `Referred by ${name ? name + " (Northgate sales rep)" : "Northgate rep " + code}. Your account will be set up with them.`;
  }

  function showCaView(NG) {
    const acct = !!session;
    $("#caForm").hidden = acct || caTab !== "apply";
    $("#caSignin").hidden = acct || caTab !== "signin";
    $("#caAccount").hidden = !acct;
    $$("#caBg [data-ca-tab]").forEach(b => b.setAttribute("aria-pressed", b.dataset.caTab === caTab));
    // Sign in is always offered; until Supabase is connected it explains that login isn't live yet.
    $("#caTabs").hidden = false;
    $("#caPassRow").hidden = !SB_ON; $("#caCreate").hidden = !SB_ON; $("#caOr").hidden = !SB_ON;
    $("#siSoon").hidden = SB_ON;
    ["#siEmail", "#siPass", "#siGo", "#siReset"].forEach(sel => $(sel).disabled = !SB_ON);
    const signin = !acct && caTab === "signin";
    $$("#caBg .ws-head p, #caBg .ws-head ul").forEach(el => el.hidden = signin);   // keep the login screen short
    $("#caTitle").textContent = acct ? "Your account" : signin ? "Account login" : "Open a trade account";
    if (acct) renderAccountPanel(NG);
  }
  const msg = (el, text, ok) => { $(el).innerHTML = text ? `<div class="ca-msg ${ok ? "ok" : "err"}">${esc(text)}</div>` : ""; };

  async function createAccount(NG) {
    const v = id => $("#" + id).value.trim();
    if (!v("caName") || !v("caEmail") || v("caPass").length < 8) return msg("#caApplyMsg", "Enter your name, email and a password of at least 8 characters.");
    $("#caCreate").setAttribute("aria-busy", "true");
    const { data, error } = await sb.auth.signUp({
      email: v("caEmail"), password: $("#caPass").value,
      options: { emailRedirectTo: location.origin + location.pathname,
        data: { name: v("caName"), company: v("caCompany"), phone: v("caPhone"), license: v("caLicense"), license_state: v("caState"), volume: v("caVolume"), work: v("caWork"),
          account_type: "Contractor / business", zip: v("caZip"),
          role: v("caRole"), city: v("caCity"), state: v("caSt").toUpperCase(), service_areas: v("caAreas"), rep_code: window.NGRep.code() } },
    });
    $("#caCreate").removeAttribute("aria-busy");
    if (error) return msg("#caApplyMsg", error.message);
    if (!data.session) return msg("#caApplyMsg", "Almost done: check your email and click the confirmation link, then sign in here. We'll review your application and call you.", true);
    msg("#caApplyMsg", "Account created. We'll review it and call you, usually within one business day.", true);
  }

  async function signIn() {
    if (!sb) return;
    const { error } = await sb.auth.signInWithPassword({ email: $("#siEmail").value.trim(), password: $("#siPass").value });
    msg("#siMsg", error ? (error.message === "Invalid login credentials" ? "Wrong email or password." : error.message) : "");
  }
  async function resetPassword() {
    const email = $("#siEmail").value.trim();
    if (!email) return msg("#siMsg", "Enter your email first.");
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    msg("#siMsg", error ? error.message : "Check your email for a link to reset your password.", !error);
  }

  async function renderAccountPanel(NG) {
    if (myRepCode && !profile) {
      $("#caAccount").innerHTML = `<div class="ca-msg ok"><b>Northgate sales rep · ${esc(myRepCode)}</b></div>
        <p>Your sign-up link:<br><input readonly value="${esc(location.origin + location.pathname + "?rep=" + myRepCode)}" style="width:100%" onclick="this.select()"></p>
        <div class="send"><a class="btn btn-cta" href="rep.html">Open my rep dashboard</a>${isAdmin ? `<a class="btn btn-navy" href="admin.html">Admin</a>` : ""}<button class="btn btn-line" type="button" id="acctOut">Sign out</button></div>`;
      $("#acctOut").onclick = async () => { await sb.auth.signOut(); caTab = "signin"; };
      return;
    }
    const p = profile || {};
    const st = { approved: "Approved: your contractor prices are on", pending: "Waiting for approval", rejected: "Not approved" }[p.status] || "Waiting for approval";
    const deals = p.status === "approved" ? [
      p.discount_system && `${NG.money(p.discount_system)} off every system`,
      p.discount_part && `${NG.money(p.discount_part)} off every part`,
      p.discount_commercial && `${NG.money(p.discount_commercial)} off every commercial unit`,
      Object.keys(p.prices || {}).length && `Special prices on ${Object.keys(p.prices).length} item(s)`,
    ].filter(Boolean) : [];
    $("#caAccount").innerHTML = `
      <div class="ca-msg ${p.status === "approved" ? "ok" : "err"}"><b>${esc(st)}</b></div>
      <p><b>${esc(p.company || p.name || "")}</b><br><small>${esc(p.email || session.user.email)}${p.license ? ` · License ${esc(p.license)} ${esc(p.license_state || "")}` : ""}</small></p>
      ${deals.length ? `<ul class="ws-perks" style="color:var(--text)">${deals.map(d => `<li>${esc(d)}</li>`).join("")}</ul>` : ""}
      <h4 style="margin:14px 0 6px">Recent orders</h4><div id="acctOrders"><small>Loading…</small></div>
      <div class="send" style="margin-top:14px">${isAdmin ? `<a class="btn btn-navy" href="admin.html">Admin: contractors &amp; orders</a>` : ""}<button class="btn btn-line" type="button" id="acctOut">Sign out</button></div>`;
    $("#acctOut").onclick = async () => { await sb.auth.signOut(); caTab = "signin"; };
    const { data: orders } = await sb.from("orders").select("created_at,status,total_cents,items").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(8);
    $("#acctOrders").innerHTML = orders?.length ? orders.map(o => `<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid var(--line)">
      <span><small>${new Date(o.created_at).toLocaleDateString()} · ${esc(o.status)}</small><br>${esc((o.items || []).map(i => `${i.qty}× ${i.name}`).join(", "))}</span><b>${NG.money((o.total_cents || 0) / 100)}</b></div>`).join("") : "<small>No online orders yet.</small>";
  }

  // ---------------------------------------------------------- Checkout
  function wireCheckout(NG) {
    const btn = $("#payOnline"), err = $("#payError");
    ["#zip", 'input[name="ship"]'].forEach(sel => document.querySelectorAll(sel).forEach(el => el.addEventListener(el.type === "radio" ? "change" : "input", () => { err.hidden = true; })));
    const fail = text => { err.hidden = false; err.textContent = text; btn.removeAttribute("aria-busy"); };
    btn.onclick = async () => {
      err.hidden = true;
      const items = NG.order;
      if (!Object.keys(items).length) return fail("Add something to your order first.");
      const d = NG.deliveryInfo();
      if (d.method === "freight") {
        const z = NG.zipInfo();
        if (z.offshore) return fail("Alaska, Hawaii and territories need a freight quote. Please text or email your order.");
        if (!z.ok) { $("#zip").focus(); return fail("Enter the ZIP code where it's going, then tap Pay online."); }
      }
      if (!NG.checkBuyer()) { btn.removeAttribute("aria-busy"); return; }
      const priced = Object.keys(items).every(k => NG.parseKey(k)?.u.price != null);
      if (!priced) return fail("Something in your order needs a price quote. Please text or email your order.");
      btn.setAttribute("aria-busy", "true");
      try {
        const headers = { "Content-Type": "application/json" };
        if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
        const stripe = await getStripe();
        const r = await fetch("/.netlify/functions/checkout", { method: "POST", headers,
          body: JSON.stringify({ items, delivery: d, customer: NG.customerInfo(), install: NG.installInfo?.() || null, repCode: window.NGRep.code(), lang: document.documentElement.lang, embedded: !!stripe }) });
        const out = await r.json().catch(() => ({}));
        if (r.ok && out.clientSecret && stripe) { btn.removeAttribute("aria-busy"); return openPayment(stripe, out.clientSecret); }
        if (r.ok && out.url) { location.href = out.url; return; }
        if (r.status === 404 || r.status === 405 || r.status === 501 || out.error === "not_configured")
          return fail("Online payment isn't switched on yet. Please send your order by text or email below and we'll invoice you.");
        fail(out.message || "Couldn't open the payment page. Please try again, or text/email your order.");
      } catch (e) {
        fail("Couldn't reach the payment page. Check your connection, or text/email your order.");
      }
    };
  }

  // ---------------------------------------------------------- Payment form on our own page (Stripe embedded Checkout)
  function getStripe() {
    if (!STRIPE_PK) return Promise.resolve(null);
    stripeP = stripeP || loadScript("https://js.stripe.com/v3/").then(() => window.Stripe(STRIPE_PK)).catch(() => { stripeP = null; return null; });
    return stripeP;
  }
  function payModal() {
    let bg = $("#payBg");
    if (bg) return bg;
    const css = document.createElement("style");
    css.textContent = `
      #payBg { position: fixed; inset: 0; z-index: 1000; background: rgba(12,34,64,.55); display: none; overflow-y: auto; padding: 24px 12px; }
      #payBg.open { display: block; }
      #payBg .pay-box { max-width: 1000px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 20px 60px rgba(0,0,0,.3); overflow: hidden; }
      #payBg .pay-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 18px; border-bottom: 1px solid #e3e7ee; }
      #payBg .pay-head img { height: 38px; display: block; }
      #payBg .pay-head span { font-size: 13.5px; color: #4a5566; display: flex; align-items: center; gap: 6px; }
      #payBg .pay-x { border: 0; background: #f1f4f8; width: 36px; height: 36px; border-radius: 50%; font-size: 22px; line-height: 1; cursor: pointer; color: #1d2530; }
      #payBg .pay-x:hover { background: #e3e8ef; }
      #payForm { min-height: 420px; padding: 8px 0; }
      body.pay-open { overflow: hidden; }
      @media (max-width: 560px) { #payBg { padding: 0; } #payBg .pay-box { border-radius: 0; min-height: 100%; } #payBg .pay-head span b { display: none; } }`;
    document.head.appendChild(css);
    bg = document.createElement("div");
    bg.id = "payBg";
    bg.innerHTML = `<div class="pay-box" role="dialog" aria-modal="true" aria-label="Secure payment">
      <div class="pay-head"><img src="img/brand/northgate-logo-900.png" alt="Northgate">
        <span>🔒 <b>Secure payment</b></span>
        <button class="pay-x" type="button" aria-label="Close">×</button></div>
      <div id="payForm"></div></div>`;
    document.body.appendChild(bg);
    bg.querySelector(".pay-x").onclick = closePayment;
    document.addEventListener("keydown", e => { if (e.key === "Escape" && bg.classList.contains("open")) closePayment(); });
    return bg;
  }
  async function openPayment(stripe, clientSecret) {
    const bg = payModal();
    closePayment();
    document.querySelectorAll(".drawer.open, .drawer-bg.open, #drawerBg.open").forEach(el => el.classList.remove("open"));
    bg.classList.add("open"); document.body.classList.add("pay-open");
    try {
      payForm = await stripe.initEmbeddedCheckout({ fetchClientSecret: async () => clientSecret });
      payForm.mount("#payForm");
    } catch (e) {
      $("#payForm").innerHTML = `<p style="padding:30px;text-align:center">Couldn't load the payment form. Please try again, or text/email your order.</p>`;
    }
  }
  function closePayment() {
    if (payForm) { try { payForm.destroy(); } catch (e) {} payForm = null; }
    const bg = $("#payBg");
    if (bg) { bg.classList.remove("open"); $("#payForm").innerHTML = ""; }
    document.body.classList.remove("pay-open");
  }

  // Back from Stripe: ?paid=cs_... (success) or ?checkout=cancelled
  // Coming back from Stripe doesn't mean the customer paid: backing out of Klarna or a bank app also returns
  // here. Ask the server what Stripe says before thanking anyone or clearing the order.
  async function handleReturnFromStripe(NG) {
    const q = new URLSearchParams(location.search);
    const sessionId = q.get("paid"), cancelled = q.get("checkout") === "cancelled";
    if (!sessionId && !cancelled) return;
    history.replaceState(null, "", location.pathname + location.hash);
    const install = NG.installInfo?.();
    const box = document.createElement("div");
    box.className = "notice-bg";
    const show = html => {
      box.innerHTML = `<div class="notice" role="dialog" aria-modal="true">${html}
        <button class="btn btn-cta" type="button" style="margin-top:8px">OK</button></div>`;
      box.querySelector("button").onclick = () => box.remove();
    };
    const notFinished = `<h2>Payment not finished</h2><p>No charge was made. Your order is still saved; you can pay again, choose another way to pay, or send it by text or email.</p>`;
    document.body.appendChild(box);
    if (cancelled) return show(notFinished);
    show(`<h2>Checking your payment…</h2><p>One moment while we confirm it with our payment processor.</p>`);
    let s = null;
    try { const r = await fetch(`/.netlify/functions/checkout-status?session_id=${encodeURIComponent(sessionId)}`); if (r.ok) s = await r.json(); } catch (e) {}
    if (!s) return show(`<h2>We couldn't confirm your payment yet</h2><p>If you finished paying, you'll get a receipt by email shortly and we'll contact you. If you didn't, your order is still saved here; you can try again.</p>`);
    if (s.status !== "complete") return show(notFinished);
    NG.clearOrder();
    const clearing = s.payment_status !== "paid";   // bank transfer still clearing
    show(`<div style="font-size:40px">✓</div><h2>Thank you, your order is in!</h2>
      <p>You'll get a receipt by email. ${install
        ? "We'll email your installation agreement, ship your system and call or text you to schedule the install 1–2 days after it arrives."
        : `We confirm stock and ${NG.method() === "pickup" ? "call or text you to set up pickup" : "ship in " + NG.S.shipsIn + ", with tracking by text or email"}.`}</p>
      ${clearing ? `<p><small>Paid by bank transfer? It takes 3–5 business days to clear; we ship once it does.</small></p>` : ""}`);
  }

  // ---------------------------------------------------------- Monthly payments message (Stripe's official Affirm/Klarna element)
  async function setupMonthlyMessaging() {
    let stripe = null, el = null;
    stripe = await getStripe(); if (!stripe) return;
    const elements = stripe.elements();
    document.addEventListener("ng:price", e => {
      const amount = Math.round((e.detail.amount || 0) * 100);
      const host = $("#specsMonthly");
      if (!host || amount < 5000) return;
      const opts = { amount, currency: "USD", countryCode: "US", paymentMethodTypes: ["klarna"] };
      host.innerHTML = '<div id="pmme"></div>';
      el = elements.create("paymentMethodMessaging", opts);
      el.mount("#pmme");
    });
    // Installation quote: Klarna estimate for payment 1 (any element on the page, by selector).
    let n = 0;
    const mountAt = ({ host, amount }) => {
      const box = document.querySelector(host), cents = Math.round((amount || 0) * 100);
      if (!box || cents < 5000) return;
      const id = "pmmi" + (++n);
      box.innerHTML = `<div id="${id}"></div>`;
      elements.create("paymentMethodMessaging", { amount: cents, currency: "USD", countryCode: "US", paymentMethodTypes: ["klarna"] }).mount("#" + id);
    };
    document.addEventListener("ng:monthly", e => mountAt(e.detail));
    (window.NG_MONTHLY_QUEUE || []).forEach(mountAt);   // requests made before Stripe loaded
    window.NG_MONTHLY_READY = true;
  }
})();
