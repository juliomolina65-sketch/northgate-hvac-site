// ============================================================
//  NORTHGATE — PUBLIC KEYS (safe to be in the browser)
//  Leave blank to run in DEMO MODE: the site works, contractor sign-in
//  and "Pay online" show a "not connected yet" note. See SETUP.md.
//
//  SECRET keys (Stripe secret key, Supabase service key) never go here:
//  they go in Railway > Variables.
// ============================================================
window.NORTHGATE_CONFIG = {
  SUPABASE_URL: "https://yakwxhlorhpoviqnkrju.supabase.co",               // Supabase > Project Settings > API > Project URL
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlha3d4aGxvcmhwb3ZpcW5rcmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Mzg4NDEsImV4cCI6MjEwNjExNDg0MX0._stejaqMfDIlAkcailWZHs5fDEHxRu4Fb6huJYL9iRg",          // Supabase > Project Settings > API > anon / publishable key
  STRIPE_PUBLISHABLE_KEY: "pk_live_51QNJsaH9I0r7YLxVtNOJRWW4RnSflq3KzM38s64PyXw86Y5VYAXb9v178ADtFuKit9G3EZ5pSYaUtEnIuTz1nGuQ00JTBcX3k4", // Stripe > Developers > API keys > Publishable key (pk_live_… or pk_test_…)
};
