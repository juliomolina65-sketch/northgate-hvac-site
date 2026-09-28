// Northgate web server for Railway (or any Node 20+ host). No dependencies.
// Serves the site and runs the checkout + Stripe webhook at the same URLs the
// Netlify version used, so the website code doesn't change.
//   Start: node server.js   (Railway sets PORT)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import checkout from "./netlify/functions/checkout.mjs";
import stripeWebhook from "./netlify/functions/stripe-webhook.mjs";
import finalPayment from "./netlify/functions/final-payment.mjs";
import checkoutStatus from "./netlify/functions/checkout-status.mjs";
import podOrder from "./netlify/functions/pod-order.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = +process.env.PORT || 8080;

const FUNCTIONS = {
  "/.netlify/functions/checkout": checkout,
  "/.netlify/functions/stripe-webhook": stripeWebhook,
  "/.netlify/functions/final-payment": finalPayment,
  "/.netlify/functions/checkout-status": checkoutStatus,
  "/.netlify/functions/pod-order": podOrder,
};

// Working files that must never be served.
const BLOCKED_DIRS = ["/commercial/", "/supabase/", "/netlify/", "/img/src/", "/img/__pycache__/", "/node_modules/", "/sibi/"];
const BLOCKED_EXT = new Set([".md", ".py", ".pyc", ".sql", ".toml", ".mjs", ".example"]);
const BLOCKED_FILES = new Set(["/server.js", "/package.json", "/package-lock.json", "/railway.json"]);

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".avif": "image/avif", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml",
  ".pdf": "application/pdf", ".mp4": "video/mp4", ".webm": "video/webm",
};

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

function send(res, status, headers, body) {
  res.writeHead(status, { ...SECURITY_HEADERS, ...headers });
  res.end(body);
}

function notFound(res) {
  const file = path.join(ROOT, "index.html");
  send(res, 404, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" }, fs.readFileSync(file));
}

function isBlocked(p) {
  if (p.split("/").some(seg => seg.startsWith("."))) return true;     // .env, .git, .claude ...
  if (BLOCKED_FILES.has(p)) return true;
  if (BLOCKED_DIRS.some(d => p.startsWith(d))) return true;
  return BLOCKED_EXT.has(path.extname(p).toLowerCase());
}

// Turn a Node request into a web Request, run the function, write its Response back.
async function runFunction(fn, req, res) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const proto = req.headers["x-forwarded-proto"] || "http";
  const url = `${proto}://${req.headers.host}${req.url}`;
  const hasBody = !["GET", "HEAD"].includes(req.method);
  const request = new Request(url, {
    method: req.method,
    headers: Object.entries(req.headers).flatMap(([k, v]) => (Array.isArray(v) ? v.map(x => [k, x]) : [[k, v]])),
    body: hasBody ? Buffer.concat(chunks) : undefined,
  });
  try {
    const out = await fn(request);
    send(res, out.status, Object.fromEntries(out.headers), Buffer.from(await out.arrayBuffer()));
  } catch (e) {
    console.error("function error", req.url, e);
    send(res, 500, { "Content-Type": "application/json" }, JSON.stringify({ error: "server_error" }));
  }
}

function serveStatic(req, res) {
  let p;
  try { p = decodeURIComponent(new URL(req.url, "http://x").pathname); } catch { return notFound(res); }
  if (p.endsWith("/")) p += "index.html";
  if (isBlocked(p)) return notFound(res);

  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT + path.sep)) return notFound(res);
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return notFound(res);
    const ext = path.extname(file).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    // HTML and JS always fresh so edits show right away; images can cache for a day.
    const cache = [".html", ".js", ".css", ".json"].includes(ext) ? "no-cache" : "public, max-age=86400";
    res.writeHead(200, { ...SECURITY_HEADERS, "Content-Type": type, "Content-Length": st.size, "Cache-Control": cache });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

http.createServer((req, res) => {
  const pathname = (req.url || "/").split("?")[0];
  const fn = FUNCTIONS[pathname];
  if (fn) return runFunction(fn, req, res);
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, { "Content-Type": "text/plain" }, "Method not allowed");
  serveStatic(req, res);
}).listen(PORT, () => console.log(`Northgate running on port ${PORT}`));
