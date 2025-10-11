# PixelUp SuperApp — V7 PixelUp (Como-style)
[![CI/CD Super App - Deploy Seletivo Final](https://github.com/pixelupmrk/superapp/actions/workflows/deploy.yml/badge.svg)](https://github.com/pixelupmrk/superapp/actions/workflows/deploy.yml)
Projeto **pronto** com sua logo e layout em 3 colunas no CRM (Contatos • Conversa • Ficha + Agenda).

## O que tem de novo
- **Logo PixelUp** no topo.
- **CRM estilo Como**: ficha do lead e **Agenda** ao lado da conversa.
- **Autopiloto (Gemini)**: ao receber a primeira mensagem, o bot extrai **nome / assunto / orçamento / prazo** e preenche a ficha.
- **Agendar**: define data/hora e envia confirmação no WhatsApp. Os compromissos ficam salvos no navegador (localStorage).
- **Exportar CSV** de contatos.

## Deploy
1. Suba **index.html**, **vercel.json** e **logo.jpg** no GitHub.
2. Conecte na Vercel e faça deploy.
3. Na Home do app:
   - Cole sua **Gemini API Key** (ou use `?gemini=SUA_KEY` na URL).
   - Clique **Verificar** para testar `/api/status`.

## Backend (Replit)
- Endpoints esperados:
  - `GET /status` → `{ connected: boolean, user?: string }`
  - `GET /events` (SSE) → eventos `{ type:'status'|'message', from, name?, text, ts }`
  - `POST /send` → body `{ to, text }` → `{ ok: true }`
- (Opcional) adicione `POST /gemini` com env `GEMINI_API_KEY` para esconder a key do front (o app usa se a key não estiver preenchida).

## Dica
Acesse `https://SEU-APP.vercel.app/?gemini=SUA_KEY` para salvar a key automaticamente no navegador.
