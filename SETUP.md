# Northgate: going live (checkout, monthly payments, contractor accounts)

The site already works in **demo mode**: everything shows, and "Pay online" / contractor sign-in
say "not switched on yet" and point people to text/email ordering. These steps switch them on.
Do them in **test mode** first, place a test order, then flip to live keys.

You'll set up 3 free accounts: **Stripe** (payments), **Supabase** (contractor logins + order records),
**Netlify** (hosting + the small checkout server).

---

## 1. Stripe: payments + monthly payments (about 20 min)

1. Sign up at **https://dashboard.stripe.com/register** (use your business info and the bank account
   payouts should go to).
2. **Settings → Payments → Payment methods**, turn on:
   - **Cards** (plus **Apple Pay** and **Google Pay**)
   - **ACH Direct Debit** (bank transfer: 0.8%, max $5 per payment, cheapest for $3k–$5k systems)
   - **Affirm** (monthly payments; you're paid in full upfront, Affirm takes the risk; orders $50–$30,000)
   - **Klarna** (monthly / pay-in-4)
3. **Developers → API keys** (start with the **Test mode** toggle ON):
   - **Publishable key** (`pk_test_…`) → paste into `config.js` → `STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (`sk_test_…`) → goes in Netlify (step 3), **never** in `config.js`
4. **Settings → Business → Notifications**: turn on email for **successful payments** so every order
   hits your inbox. **Settings → Emails**: turn on **successful payment receipts** for customers.

## 2. Supabase: contractor accounts (about 10 min)

1. **https://supabase.com** → **New project** → name it `northgate` → save the database password.
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**.
3. **Project Settings → API**:
   - **Project URL** and **anon / publishable key** → paste into `config.js`
   - **service_role key** → goes in Netlify (step 3), **never** in `config.js`
4. **Authentication → URL Configuration**: set **Site URL** to your site address (step 3), and add it
   under **Redirect URLs** too (for email confirmation and password reset links).
5. Open your site → **Account login → Apply** → create **your own** account. Then in the
   **SQL Editor** run the "make yourself the admin" lines at the bottom of `schema.sql` with your email.
   Now `yoursite/admin.html` lets you approve contractors, set their prices, and see paid orders.

### 2b. Sales reps (after step 2)
- **Add a rep:** `admin.html` → **Sales reps** → name, email, link code (e.g. MIKE), Northgate's % (10/15/20).
- **The rep** creates a login on the site with that same email (Account login → Apply), then opens
  `yoursite/rep.html`. They see their sign-up link (`yoursite/?rep=MIKE`), their customers, orders,
  margins and commission, and they can approve and discount their own customers (up to the max you set).
- **Costs:** `admin.html` → **Costs & margins**: enter what each item costs you. Margins and commissions
  use these; reps see costs, customers never do.
- If you already ran `schema.sql` before, **run it again**: it's safe to re-run and adds the rep tables.

## 3. Netlify: put it online (about 10 min)

The checkout server runs as a Netlify Function, so deploy with the Netlify CLI or GitHub.
(Drag-and-drop "Netlify Drop" does **not** run functions.)

```bash
cd C:\Users\sasan\projects\hvac-supply
netlify login
netlify init        # create a new site, publish directory "."
netlify deploy --prod
```

Then in Netlify → **Site configuration → Environment variables**, add:

| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_…` (later `sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | from step 4 below (`whsec_…`) |
| `SUPABASE_URL` | same Project URL as in config.js |
| `SUPABASE_SERVICE_KEY` | Supabase **service_role** key |
| `STRIPE_AUTOMATIC_TAX` | `true` only after you set up Stripe Tax (see "Sales tax") |

Redeploy after adding them (`netlify deploy --prod`).

## 4. Stripe webhook: marks orders paid (5 min)

Stripe → **Developers → Webhooks → Add endpoint**
- URL: `https://YOUR-SITE/.netlify/functions/stripe-webhook`
- Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
  `checkout.session.async_payment_failed`, `checkout.session.expired`
- Copy the **Signing secret** (`whsec_…`) into Netlify as `STRIPE_WEBHOOK_SECRET`, redeploy.

## 5. Test, then go live

1. On the site, add a system, enter a ZIP, tap **Pay online**. Pay with test card
   `4242 4242 4242 4242` (any future date, any CVC). Also try Affirm in test mode (it has a
   test approve screen).
2. Check: you got the Stripe email, the order shows in `admin.html` as **paid**, and the success
   message showed on the site.
3. Approve a test contractor in `admin.html`, give $250 off systems, sign in as them, confirm the
   lower price shows and is what Stripe charges.
4. Switch Stripe to **Live mode**, put the live `pk_live_…` in `config.js` and live `sk_live_…` +
   live webhook secret in Netlify, redeploy.

---

## Before launch checklist
- [ ] `inventory.js` → `BUSINESS`: real **name, phone, SMS number, email** (they're placeholders now),
      and set `sampleData: false` (hides the "Preview" bar).
- [ ] **Sales tax:** decide with your accountant. Texas taxes equipment sold to end users; contractors
      with a resale certificate may be exempt. Stripe Tax can calculate it automatically
      (`STRIPE_AUTOMATIC_TAX=true`) once you register in Stripe → Tax.
- [ ] **Card fees:** Stripe charges ~2.9% + 30¢ on cards, 0.8% (max $5) on ACH, ~6% on Affirm.
      Prices don't add a card surcharge. If you want one, tell me (card surcharge rules apply).
- [ ] **Supplier policy:** confirm Carrier Enterprise / your distributor allows online resale nationwide.
- [ ] Custom domain (Netlify → Domain management), e.g. northgatehvac.com.

## Local testing with the checkout server
`netlify dev` runs the site **and** the functions at http://localhost:8888. Put test keys in a `.env`
file (copy `.env.example`); it's ignored by git and never published.
