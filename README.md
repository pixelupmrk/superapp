# PixelUp SuperApp — V7 (fresh)

**Tudo novo** para substituir o repositório.

## Arquitetura
- Front-end SPA em `index.html` (CRM + WhatsApp + Bot Gemini + Mentoria + Bootcamp).
- Proxy na Vercel (`vercel.json`) roteando **/api/** → `https://pixelup-wa-server.pixelupmrkt.repl.co` (evita CORS e faz o SSE funcionar).

## Subir na Vercel (do zero)
1. Apague os arquivos antigos no GitHub e suba **apenas**:
   - `index.html`
   - `vercel.json`
2. Conecte o repo na Vercel e faça o deploy.
3. Abra a URL do app → **Home**:
   - Cole sua **Gemini API Key** (ou use `?gemini=SUA_KEY` na URL) e clique **Salvar Key**.
   - Clique **Verificar** para checar o WhatsApp (`/api/status`).

## Fluxo de uso
- **CRM + Chat**: mensagens recebidas no WhatsApp aparecem, criam/atualizam contato e entram na conversa.
- **Bot ON/OFF**: quando ON, o Gemini responde automaticamente; desligue para atendimento humano.
- **Bootcamp**: chat IA separado (não envia ao WhatsApp).
- **Mentoria**: 8 módulos embutidos (offline).

## Requisitos do backend (Replit)
- `GET /status` → `{ connected: boolean, user?: string }`
- `GET /events` (SSE) → eventos `{ type:'status'|'message', from, name?, text, ts }`
- `POST /send` → body `{ to, text }` → `{ ok: true }`

### (Opcional) Proxy seguro do Gemini no backend
Se quiser manter a API Key fora do front:
1. No Replit, crie a env **GEMINI_API_KEY**.
2. Adicione uma rota **POST /gemini** que chama a API do Gemini e retorna `{ text }`.
3. O front já testa `/api/gemini` quando a key não estiver preenchida no app.

Exemplo de rota (Node/Express):
```js
import express from "express";
import fetch from "node-fetch";
const app = express();
app.use(express.json());

app.post("/gemini", async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "GEMINI_API_KEY ausente" });
    const prompt = String(req.body?.prompt || "");
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const j = await r.json();
    res.json({ text: j?.candidates?.[0]?.content?.parts?.[0]?.text || "" });
  } catch (e) {
    res.status(500).json({ error: "falha na chamada ao Gemini" });
  }
});
```

---

> Dica: quer fixar a key sem colar toda vez? Acesse `https://SEU-APP.vercel.app/?gemini=SUA_KEY` e o app salva no navegador.
