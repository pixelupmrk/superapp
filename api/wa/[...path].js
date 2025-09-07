// api/wa/[...path].js  (Node runtime)
export default async function handler(req, res) {
  const BASE = process.env.WA_BASE; // ex.: https://pixelup-wa-server.pixelupmrkt.repl.co
  if (!BASE) return res.status(500).json({ error: "WA_BASE não configurado" });

  // monta a cauda da rota (tudo após /api/wa/)
  const parts = (req.query.path || []);
  const tail = Array.isArray(parts) ? parts.join("/") : String(parts || "");
  const qs = req.url.includes("?") ? "?" + req.url.split("?")[1] : "";
  const target = `${BASE}/${tail}${qs}`;

  try {
    const init = { method: req.method, headers: { ...req.headers } };

    // corpo (quando existir)
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      init.body = Buffer.concat(chunks);
    }

    // remove cabeçalhos que podem conflitar
    delete init.headers.host;
    delete init.headers["content-length"];

    const r = await fetch(target, init);
    // repassa status/headers/corpo
    r.headers.forEach((v, k) => res.setHeader(k, v));
    res.status(r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    return res.send(buf);
  } catch (e) {
    return res.status(502).json({ error: "Proxy error", detail: e.message, target });
  }
}
