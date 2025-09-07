// server.js - PixelUp WA Server (Baileys + Express)
// Run on Replit. Exposes REST API used by the Vercel proxy.

import express from "express";
import cors from "cors";
import qrcode from "qrcode";
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

let sock = null;
let isConnecting = false;
let lastQR = null;
let connected = false;
let userId = null;

async function createSock() {
  if (isConnecting) return;
  isConnecting = true;
  try {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");
    const { version } = await fetchLatestBaileysVersion();
    sock = makeWASocket({
      version,
      printQRInTerminal: false,
      auth: state,
      browser: ["PixelUp CRM", "Chrome", "1.0"],
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          lastQR = await qrcode.toDataURL(qr);
        } catch (e) {
          console.error("QR error", e);
        }
      }

      if (connection === "open") {
        connected = true;
        isConnecting = false;
        lastQR = null;
        userId = sock.user?.id || null;
        console.log("WA connected", userId);
      } else if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        const reason = lastDisconnect?.error?.message || "";
        console.log("WA closed", code, reason);
        connected = false;
        // Try reconnect
        setTimeout(() => {
          isConnecting = false;
          createSock().catch(console.error);
        }, 2000);
      }
    });
  } catch (e) {
    console.error("createSock error", e);
    isConnecting = false;
  }
}

// --- API ---
app.get("/api/wa/ping", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/wa/status", async (req, res) => {
  res.json({
    connected,
    connecting: isConnecting,
    user: userId,
    qr: connected ? null : lastQR
  });
});

app.post("/api/wa/start", async (req, res) => {
  if (!sock || (!connected && !isConnecting)) {
    createSock().catch(console.error);
  }
  res.json({
    ok: true,
    connected,
    connecting: isConnecting,
    qr: connected ? null : lastQR
  });
});

function toJid(to) {
  if (!to) return null;
  let d = String(to).replace(/\D/g, "");
  if (!d.startsWith("55")) d = "55" + d;
  return d + "@s.whatsapp.net";
}

app.post("/api/wa/send", async (req, res) => {
  try {
    const { to, text } = req.body || {};
    if (!connected || !sock) {
      return res.status(400).json({ error: "not_connected" });
    }
    const jid = toJid(to);
    if (!jid || !text) return res.status(400).json({ error: "missing to/text" });
    await sock.sendMessage(jid, { text: String(text) });
    res.json({ ok: true });
  } catch (e) {
    console.error("send error", e);
    res.status(500).json({ error: String(e) });
  }
});

// start server
app.listen(PORT, () => {
  console.log("WA Server on http://localhost:" + PORT);
  createSock().catch(console.error);
});
