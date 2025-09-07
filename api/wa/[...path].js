// /api/wa/[...path].js
export default async function handler(req, res) {
  try {
    const base = process.env.WA_BASE; // ex.: https://pixelup-wa-server.seuusuario.repl.co
    if (!base) { res.status(500).json({ error: "WA_BASE não configurado no Vercel" }); return; }
    const path = Array.isArray(req.query.path) ? req.query.path.join("/") : "";
    const url  = `${base}/api/wa/${path}`;
    const init = { method: req.method, headers: { "Content-Type": req.headers["content-type"] || "application/json" } };
    if (req.method !== "GET" && req.method !== "HEAD") { init.body = JSON.stringify(req.body || {}); }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") { res.status(204).end(); return; }
    const r = await fetch(url, init); const text = await r.text();
    res.status(r.status).setHeader("Content-Type", r.headers.get("content-type") || "application/json"); res.send(text);
  } catch (err) { res.status(500).json({ error: String(err) }); }
}
