# PixelUp SuperApp — Chat-First

- CRM sem login por e-mail/senha (persistência localStorage).
- Mensagens recebidas (SSE) criam/atualizam contatos automaticamente.
- Bot Gemini com toggle ON/OFF (use sua API Key).
- Proxy /api/* já aponta para seu Replit (Baileys).

## Como usar
1. Deploy no Vercel com estes arquivos.
2. Na Home, salve seu número (55DDDNUMERO) e a **Gemini API Key**.
3. Clique **Verificar** para checar o WhatsApp.
4. Ligue o **Bot** para autorrespostas. Desligue para atendimento humano.
5. (Opcional) Ative o Gate antes do Home definindo `window.ACCESS_PASS` em `index.html`.
