const express = require('express');
const cors = require('cors');
const makeWASocket = require('@whiskeysockets/baileys').default;

const app = express();
app.use(cors());
app.use(express.json());

let sock;
let qrCodeBase64 = null;
let connected = false;

async function connectToWhatsApp() {
    sock = makeWASocket({ printQRInTerminal: true });
    sock.ev.on('connection.update', (update) => {
        const { qr, connection } = update;
        if (qr) {
            const QRCode = require('qrcode');
            QRCode.toDataURL(qr, (err, url) => {
                qrCodeBase64 = url;
            });
        }
        if (connection === 'open') {
            connected = true;
        }
        if (connection === 'close') {
            connected = false;
        }
    });
}

app.get('/api/wa/status', (req, res) => {
    res.json({ connected, qr: qrCodeBase64 });
});

app.post('/api/wa/start', async (req, res) => {
    if (!connected) await connectToWhatsApp();
    res.json({ connected, qr: qrCodeBase64 });
});

app.post('/api/wa/send', async (req, res) => {
    const { to, text } = req.body;
    if (!sock) return res.status(500).json({ error: 'Not connected' });
    await sock.sendMessage(to, { text });
    res.json({ success: true });
});

app.listen(8080, () => console.log('WA Server rodando na porta 8080'));
