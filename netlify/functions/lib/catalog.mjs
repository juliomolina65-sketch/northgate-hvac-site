// Loads the same catalog + pricing rules the website uses (inventory.js, commercial-data.js, pricing.js)
// into a sandbox, so the server never trusts prices sent from the browser.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const FILES = ["commercial-data.js", "inventory.js", "pricing.js"];
let sources = null;

function findRoot() {
  const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
  const candidates = [process.cwd(), process.env.LAMBDA_TASK_ROOT, path.resolve(here, "../../.."), path.resolve(here, "../..")].filter(Boolean);
  const root = candidates.find(dir => fs.existsSync(path.join(dir, "inventory.js")));
  if (!root) throw new Error("catalog files not found (looked in " + candidates.join(", ") + ")");
  return root;
}

// A fresh copy per call: contractor pricing changes item prices in place.
export function loadCatalog() {
  if (!sources) {
    const root = findRoot();
    sources = FILES.map(f => [f, fs.readFileSync(path.join(root, f), "utf8")]);
  }
  const sandbox = { window: {}, console };
  sandbox.globalThis = sandbox.window;
  vm.createContext(sandbox);
  for (const [name, code] of sources) vm.runInContext(code, sandbox, { filename: name });
  const w = sandbox.window;
  return { inventory: w.INVENTORY, shipping: w.SHIPPING, business: w.BUSINESS, Pricing: w.Pricing };
}

// Same rules as the website's ZIP check.
export function zipInfo(shipping, zip) {
  zip = String(zip || "").trim();
  if (!/^\d{5}$/.test(zip)) return { ok: false, zip };
  const z3 = +zip.slice(0, 3);
  if (z3 <= 9 || (z3 >= 967 && z3 <= 969) || z3 >= 995) return { ok: false, zip, offshore: true };
  const region = Object.keys(shipping.regions).find(r => shipping.regions[r].some(([lo, hi]) => z3 >= lo && z3 <= hi)) || "North";
  return { ok: true, zip, region };
}
