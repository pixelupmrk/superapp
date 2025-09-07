# PixelUp SuperApp (Vercel + Proxy)

Suba estes arquivos no Vercel. Configure as envs:
- WA_BASE = URL pública do seu Replit (ex.: https://pixelup-wa-server.seuusuario.repl.co)
- GEMINI_API_KEY = (opcional) sua chave do Google AI Studio

Rotas:
- Front: index.html
- Proxy WhatsApp: /api/wa/[...path].js  → encaminha p/ WA_BASE
- Chat: /api/chat  (usa GEMINI_API_KEY, com fallback demo)

Depois do deploy: vá para /#/whatsapp e clique “Conectar / Mostrar QR”.
