# PixelUp SuperApp — Index V6

## Configurado para o seu Replit
Proxy da Vercel apontando para: `https://pixelup-wa-server.pixelupmrkt.repl.co`

## Gemini: duas opções
- **Front-end**: cole sua API Key do AI Studio na Home (chaves costumam começar com `AIza...`).
- **Backend** (recomendado): defina `GEMINI_API_KEY` no Replit e adicione a rota abaixo. O front chama `POST /api/gemini` e a key fica segura no servidor.

```js
// Replit (Node/Express) — rota /gemini (proxy seguro)
// 1) Defina a variável de ambiente GEMINI_API_KEY no Replit.
// 2) Adicione esta rota ao seu servidor existente (que já expõe /status, /events, /send).

import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/gemini", async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "GEMINI_API_KEY ausente no servidor" });
    const prompt = (req.body?.prompt || "").toString();
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const j = await r.json();
    const text = j?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.json({ text });
  } catch (e) {
    res.status(500).json({ error: "falha na chamada ao Gemini" });
  }
});

// app.listen(process.env.PORT || 3000);

```

## Como usar
1. Suba `index.html` e `vercel.json` na raiz do projeto Vercel.
2. Abra a Home → veja o card **Diagnóstico** para confirmar `/api/status` e `/api/gemini` (se sem key no front).
3. Salve **Seu número WA** e a **Gemini API Key** (se optar pelo front).
4. Em **CRM + Chat**, as mensagens recebidas criam contatos automaticamente. O Bot responde quando ligado.
