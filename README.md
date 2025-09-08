# PixelUp SuperApp

Home • CRM com ChatBot + WhatsApp • Mentoria (8 módulos)

## 1) O que está pronto
- **Index único** com abas (Home, CRM, Mentoria) e **chat widget global**.
- **CRM** com login (e-mail/senha), contatos (Firestore) e envio rápido de WhatsApp.
- **Mentoria** lendo `mentoria/modules.json` (substitua pelo seu conteúdo completo).
- **Integração WhatsApp** via backend Baileys (Replit): `/status`, `/events` (SSE) e `/send`.

## 2) Como configurar
1. **WhatsApp Backend (Replit/Baileys)**   - Deploy seu servidor e copie a URL base (ex.: `https://pixelup-wa-server.seuusuario.repl.co`).
   - No `index.html`, preencha:
     ```html
     window.PIXELUP_BOT_CONFIG = {
       WA_BASE_URL: "https://pixelup-wa-server.seuusuario.repl.co",
       API_TOKEN: ""
     };
     ```
   - Endpoints esperados: `GET /status`, `GET /events?token=`, `POST /send`.

2. **Firebase (Firestore + Auth e-mail/senha)**   - Crie um projeto, habilite **Authentication (Email/Password)** e **Cloud Firestore**.
   - Copie as credenciais Web e substitua em `window.FIREBASE_CONFIG` (no `index.html`).

3. **Vercel Deploy**
   - Suba todos os arquivos deste pacote.
   - Edite `vercel.json` para apontar `/api/*` para o seu backend (opcional).

## 3) Dicas
- O chat flutuante funciona mesmo fora do CRM. Os eventos recebidos via SSE aparecem ali.
- `modules.json` está com conteúdo placeholder. Cole o conteúdo real dos 8 módulos.
- Se quiser, você pode mover as credenciais para **Variáveis de Ambiente** no Vercel e injetar via `script` em tempo de build/deploy.

## 4) Compatibilidade do backend WhatsApp
- **/status** → retorna `{ connected: boolean, user?: string }`
- **/events** → envia eventos SSE (`type: "message"|"status"`) com `from,to,text,ts`
- **/send** (POST) → body `{ to, text, token? }` e resposta `{ ok: true }` em sucesso.

Boa sorte e bons testes! 🚀
