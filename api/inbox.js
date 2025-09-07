
// /api/inbox.js
// Webhook para receber mensagens do seu servidor Baileys (Replit) e servir para o frontend via GET.
// Armazenamento em memória (adequado para testes). Para produção, use um banco (Firestore/Redis).

const allowCors = (handler) => async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  return handler(req, res);
};

// Memória por instância (ephemeral)
global._PX_INBOX = global._PX_INBOX || new Map(); // key: number (digits), value: array of {id, from, to, text, ts}

function digitsOnly(s = "") { return String(s).replace(/\D/g, ""); }
function nowTs() { return Date.now(); }

function getArr(key) {
  if (!global._PX_INBOX.has(key)) global._PX_INBOX.set(key, []);
  return global._PX_INBOX.get(key);
}

module.exports = allowCors(async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const b = req.body || {};
      // Esperado: from (jid ou nº), text, ts (opcional), to (opcional)
      const fromDigits = digitsOnly(b.from || "");
      const toDigits = digitsOnly(b.to || "");
      const text = (b.text || "").toString();
      const ts = Number(b.ts || nowTs());

      if (!fromDigits || !text) {
        res.status(400).json({ ok: false, error: "Campos obrigatórios: from, text" });
        return;
      }

      const id = `${ts}-${Math.random().toString(36).slice(2, 8)}`;
      const msg = { id, from: fromDigits, to: toDigits, text, ts };

      // Guardamos por REMETENTE (de onde está vindo a msg/contato)
      const arr = getArr(fromDigits);
      arr.push(msg);
      // Limite simples para não crescer sem fim
      if (arr.length > 500) arr.splice(0, arr.length - 500);

      res.status(200).json({ ok: true, stored: 1 });
    } catch (e) {
      res.status(500).json({ ok: false, error: String(e?.message || e) });
    }
    return;
  }

  if (req.method === "GET") {
    try {
      // Filtros: number (digits do contato), since (timestamp num), limit
      const url = new URL(req.url, "http://x");
      const number = digitsOnly(url.searchParams.get("number") || "");
      const since = Number(url.searchParams.get("since") || 0);
      const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") || 50)));

      if (!number) {
        res.status(400).json({ ok: false, error: "Parâmetro 'number' obrigatório" });
        return;
      }
      const arr = getArr(number);
      const items = arr.filter(m => !since || Number(m.ts) > since).slice(-limit);
      res.status(200).json({ ok: true, items, count: items.length, latestTs: items.at(-1)?.ts || since });
    } catch (e) {
      res.status(500).json({ ok: false, error: String(e?.message || e) });
    }
    return;
  }

  res.status(405).json({ ok: false, error: "Method not allowed" });
});
