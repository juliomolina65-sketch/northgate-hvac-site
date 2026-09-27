// ============================================================
//  NORTHGATE — PUBLIC KEYS (safe to be in the browser)
//  Leave blank to run in DEMO MODE: the site works, contractor sign-in
//  and "Pay online" show a "not connected yet" note. See SETUP.md.
//
//  SECRET keys (Stripe secret key, Supabase service key) never go here:
//  they go in Netlify > Site settings > Environment variables.
// ============================================================
window.NORTHGATE_CONFIG = {
  SUPABASE_URL: "",               // Supabase > Project Settings > API > Project URL
  SUPABASE_ANON_KEY: "",          // Supabase > Project Settings > API > anon / publishable key
  STRIPE_PUBLISHABLE_KEY: "pk_live_51QNJsaH9I0r7YLxVtNOJRWW4RnSflq3KzM38s64PyXw86Y5VYAXb9v178ADtFuKit9G3EZ5pSYaUtEnIuTz1nGuQ00JTBcX3k4", // Stripe > Developers > API keys > Publishable key (pk_live_… or pk_test_…)
};
