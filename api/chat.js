
const allowCors = (handler) => async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  return handler(req, res);
};

module.exports = allowCors(async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { message } = req.body || {};
    if (!message) {
      res.status(400).json({ error: "Missing 'message' in body" });
      return;
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Fallback: echo response so frontend still works
      res.status(200).json({ reply: `Echo: ${message}` });
      return;
    }

    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + key;
    const payload = {
      contents: [{ parts: [{ text: message }]}]
    };
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const j = await r.json();
    const txt = j?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
    res.status(200).json({ reply: txt });
  } catch (err) {
    res.status(500).json({ error: String(err?.message || err) });
  }
});
