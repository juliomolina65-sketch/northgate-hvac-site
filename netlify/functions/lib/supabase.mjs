// Minimal Supabase REST helpers for the server (uses the SERVICE key, which bypasses row security,
// so it only ever runs here, never in the browser).
const URL_ = () => (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const KEY = () => process.env.SUPABASE_SERVICE_KEY || "";

export const supabaseReady = () => !!(URL_() && KEY());

// Who is signed in, from the browser's access token (null if missing/invalid).
export async function userFromToken(token) {
  if (!token || !supabaseReady()) return null;
  const r = await fetch(`${URL_()}/auth/v1/user`, { headers: { apikey: KEY(), Authorization: `Bearer ${token}` } });
  return r.ok ? r.json() : null;
}

export async function select(table, query) {
  const r = await fetch(`${URL_()}/rest/v1/${table}?${query}`, { headers: { apikey: KEY(), Authorization: `Bearer ${KEY()}` } });
  if (!r.ok) throw new Error(`supabase select ${table}: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function insert(table, row) {
  const r = await fetch(`${URL_()}/rest/v1/${table}`, {
    method: "POST",
    headers: { apikey: KEY(), Authorization: `Bearer ${KEY()}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  if (!r.ok) throw new Error(`supabase insert ${table}: ${r.status} ${await r.text()}`);
}

export async function update(table, query, patch) {
  const r = await fetch(`${URL_()}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: { apikey: KEY(), Authorization: `Bearer ${KEY()}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error(`supabase update ${table}: ${r.status} ${await r.text()}`);
}
