PixelUp SuperApp — pacote mínimo (frontend + funções de API)

Estrutura:
- index.html  → Frontend (Home/CRM/Mentoria/Chat) — já configurado.
- api/chat.js → Rota do Vercel que responde o chat (usa Gemini se houver chave; senão faz echo).
- api/wa/*    → Rotas proxy para seu servidor Baileys no Replit (evita CORS).

Como publicar na Vercel (resumo):
1) Crie um novo projeto e suba estes arquivos.
2) Em Settings → Environment Variables, adicione (se desejar usar IA de verdade):
   • GEMINI_API_KEY = sua chave da API do Google AI Studio.
   (Opcional) • WA_BASE = URL do seu Replit Baileys (ex.: https://pixelup-wa-server.pixelupmrkt.repl.co)
3) Deploy. A página irá abrir e o Chat usará /api/chat. O CRM continuará salvando no localStorage.
4) Se quiser que o front use o proxy da Vercel para o WhatsApp, troque no index.html:
      const WA_API = "/api/wa";
   Caso prefira chamar direto o Replit, deixe como está com a URL completa.

Testes rápidos:
• Chat: aba ChatBot → enviar uma mensagem. Sem GEMINI_API_KEY ele responde 'Echo: ...'.
• WhatsApp:
  - CRM → Conexão WhatsApp → 'Conectar / Mostrar QR' → escaneie.
  - Adicione um contato e clique 'Enviar Whats'.

Observações:
• Se o Replit 'dormir', clique 'Conectar / Mostrar QR' novamente para reativar a sessão.
• Este pacote remove o erro antigo 'WA_BASE não configurado' pois já tem um padrão embutido.
• Ajuste visuais e textos diretamente no index.html.
