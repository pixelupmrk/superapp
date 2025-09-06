export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method === "GET") return res.status(405).json({ reply: "Método não permitido. Use POST." });
  if (req.method !== "POST") return res.status(405).json({ reply: "Método não permitido" });

  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ reply: "Envie { \"message\": \"...\" }" });

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return res.status(500).json({ reply: "GEMINI_API_KEY não configurada no Vercel" });

    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
      }
    );

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      return res.status(r.status).json({ reply: `Erro API Google AI: ${r.status}`, detail: txt.slice(0, 500) });
    }

    const data = await r.json().catch(() => ({}));
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ reply: "Erro no servidor: " + (err?.message || String(err)) });
  }
}
