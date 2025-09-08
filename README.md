# PixelUp SuperApp (Proxy /api)

Home • CRM com ChatBot + WhatsApp • Mentoria (8 módulos)

## O que mudou nesta versão
- **Sem CORS**: o front consome **/api/status**, **/api/events**, **/api/send** (mesmo domínio).
- **vercel.json** já aponta para seu **Replit Baileys**.
- **Footer** corrigido dentro do `<body>`.

## Passos
1. Deploy no Vercel com todos os arquivos.
2. Garanta que seu Replit esteja público e expondo:
   - `GET /status` → `{ connected: boolean, user?: string }`
   - `GET /events?token=` → SSE
   - `POST /send` → `{ ok:true }`
3. Abra o site:
   - Em **Home**, clique **Verificar** para checar o status.
   - Em **CRM**, faça login (Auth e-mail/senha) e salve contatos no Firestore.
   - Em **Mentoria**, edite `mentoria/modules.json` com seu conteúdo final.

Se o Replit usar outro domínio, edite `vercel.json` e altere a `destination`.
