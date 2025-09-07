// /api/chat/index.js
export default async function handler(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body || {};
    if (!message) { res.status(400).json({ error: "Mensagem vazia" }); return; }
    if (!apiKey) { res.status(200).json({ reply: "👋 (demo) Sem GEMINI_API_KEY. Eco: " + message }); return; }
    const payload = { contents: [{ parts: [{ text: message }]}] };
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="+apiKey, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    const data = await r.json(); const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta";
    res.status(200).json({ reply: text });
  } catch (e) { res.status(500).json({ error: String(e) }); }
}
