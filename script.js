// CÓDIGO FINAL E CORRIGIDO
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] DOM carregado. Aguardando Firebase...');
    const mentoriaData = [ { "moduleId": "MD01", "title": "Módulo 1: Conectando com o Cliente Ideal", "lessons": [ { "title": "Questionário para Definição de Persona", "content": "Antes de qualquer estratégia, é essencial saber com quem você está falando. O questionário irá ajudar a identificar o perfil do seu cliente ideal. Use o CRM para registrar as respostas e começar a segmentar seus leads.\n\nPerguntas do Questionário:\n1. Nome fictício da persona:\n2. Idade aproximada:\n3. Profissão ou ocupação:\n4. Quais são suas dores e dificuldades?\n5. Quais são seus desejos ou objetivos?\n6. Onde essa pessoa busca informação?\n7. Quais redes sociais essa pessoa usa com frequência?\n8. Que tipo de conteúdo ela consome?" }, { "title": "Proposta de Valor e Posicionamento", "content": "Com base na persona, vamos definir a proposta de valor do seu serviço. A proposta responde: 'Eu ajudo [persona] a [solução] através de [diferencial do seu serviço].'\n\nExemplo: Ajudo [vendedores autônomos] a [acelerar vendas] usando [o super app com CRM e automação]." } ] }, { "moduleId": "MD02", "title": "Módulo 2: O Algoritmo da Meta (Facebook & Instagram)", "lessons": [ { "title": "Como o Algoritmo Funciona", "content": "O algoritmo da Meta analisa o comportamento dos usuários para decidir o que mostrar. Ele prioriza conteúdos que geram interação rápida. Quanto mais relevante for o seu conteúdo para o público, mais ele será entregue." }, { "title": "O que Influencia o Alcance Orgânico", "content": "O alcance orgânico depende de fatores como: qualidade do conteúdo, engajamento nos primeiros minutos, frequência de publicações e relacionamento com o público (DMs, respostas, salvamentos)." }, { "title": "Comece com um Gancho Forte", "content": "O primeiro segundo do seu conteúdo precisa chamar a atenção imediatamente. Depois do gancho, entregue valor real e finalize com uma chamada para ação (CTA). Exemplo de ganchos: 'Você está postando, mas ninguém engaja? Isso aqui é pra você.'" } ] }, { "moduleId": "MD03", "title": "Módulo 3: Cronograma de Postagens Estratégico", "lessons": [ { "title": "Melhores Horários e Dias para Postagem", "content": "O ideal é postar quando seu público está mais ativo (geralmente entre 11h e 13h ou 18h e 20h, de terça a quinta). Use as métricas do Instagram para ver quando seus seguidores estão online." }, { "title": "Frequência Ideal e Consistência", "content": "Mais importante que a quantidade, é a consistência. A frequência ideal varia por nicho. A mentoria sugere: Estética e beleza (4 a 5 posts por semana); B2B (3 posts bem elaborados por semana); Varejo (diária)." }, { "title": "Exemplo de Cronograma Semanal", "content": "Utilize um calendário para organizar o conteúdo por dia da semana:\nSegunda-feira: Conteúdo Educativo\nTerça-feira: Prova Social (depoimento)\nQuarta-feira: Vídeo Reels\nQuinta-feira: Dica + Engajamento\nSexta-feira: Chamada para Ação/Oferta\nSábado: Conteúdo leve/Bastidor\nDomingo: (Opcional) Inspiração" } ] }, { "moduleId": "MD04", "title": "Módulo 4: Conteúdo que Conecta", "lessons": [ { "title": "Estrutura de Vídeos que Engajam", "content": "Um vídeo precisa seguir uma estrutura estratégica: Gancho (1º segundo), Valor (dica ou solução) e CTA (chamada para ação). Exemplo: 'Você quer mais clientes? Então evite esse erro aqui...'" }, { "title": "Edição Prática com CapCut ou InShot", "content": "Aprenda a usar ferramentas de edição como CapCut para cortar partes desnecessárias, adicionar legendas automáticas e inserir trilha sonora." }, { "title": "Design com Canva", "content": "Use o Canva para criar uma identidade visual coesa. Mantenha fontes legíveis, as cores da sua marca e crie um padrão visual para que seus posts sejam reconhecidos no feed." } ] }, { "moduleId": "MD05", "title": "Módulo 5: Copywriting com ChatGPT", "lessons": [ { "title": "Como Criar Textos Persuasivos com IA", "content": "O ChatGPT é uma ferramenta poderosa para gerar textos que vendem. A chave está em saber o que pedir e como direcionar a IA com clareza. Use as fórmulas de copy para montar seus prompts." }, { "title": "Fórmulas Testadas: AIDA e PAS", "content": "Aprenda a usar as estruturas de texto persuasivo:\nAIDA: Atenção, Interesse, Desejo, Ação\nPAS: Problema, Agitação, Solução" }, { "title": "Criando Prompts Inteligentes", "content": "Um bom prompt direciona o ChatGPT a criar algo útil. Use a estrutura: [Ação] + [Assunto] + [Objetivo] + [Estilo/Tom]. Exemplo: 'Escreva uma copy para anúncio no Instagram sobre mentoria de marketing, com objetivo de gerar leads, num tom direto e persuasivo.'" } ] }, { "moduleId": "MD06", "title": "Módulo 6: Implementação de CRM", "lessons": [ { "title": "O que é CRM e Por que sua Empresa Precisa", "content": "CRM (Customer Relationship Management) é uma ferramenta que organiza o relacionamento com seus leads e clientes, acompanhando-os desde o primeiro contato até o fechamento da venda." }, { "title": "Construção de Funil de Vendas Básico", "content": "Um funil simples pode ter 4 etapas: Contato Inicial, Conversa/Apresentação, Proposta Enviada, Cliente Fechado. O super app ajudará a organizar os leads por estágio para manter a eficiência." }, { "title": "Opções de Remarketing", "content": "Aprenda a segmentar leads no CRM e criar campanhas de remarketing para: Leads que não fecharam (com anúncios de cases), Leads que sumiram (com mensagens personalizadas) e Ex-clientes (com bônus de retorno)." } ] }, { "moduleId": "MD07", "title": "Módulo 7: Processo Comercial e Técnicas de Venda", "lessons": [ { "title": "Como Montar um Pitch Comercial", "content": "O pitch é a sua 'apresentação relâmpago'. Ele precisa ser claro e direto. Inclua: Quem você ajuda, o problema que resolve e o diferencial do seu serviço. Exemplo: 'Nós ajudamos negócios locais a atrair clientes todos os dias usando vídeos e tráfego pago.'" }, { "title": "Rapport e Gatilhos Mentais", "content": "Crie conexão usando técnicas como: Rapport (usar linguagem e ritmo parecidos com o cliente) e Gatilhos Mentais (escassez, autoridade, prova social). O cliente compra quando sente confiança e identificação." }, { "title": "Follow-up Eficiente", "content": "A maioria das vendas acontece no 2º ou 3º contato. Use o CRM do super app para agendar retornos e sempre traga um valor novo na abordagem. Evite ser insistente; seja consultivo." } ] }, { "moduleId": "MD08", "title": "Módulo 8: Conexão com a Audiência e Humanização", "lessons": [ { "title": "Gerando Conexão Real (sem Forçar)", "content": "Pessoas se conectam com pessoas. Mostrar sua rotina e bastidores cria empatia. Seja autêntico, não perfeito. Use a câmera frontal e fale como se fosse para um amigo." }, { "title": "Estratégias de Bastidores nos Stories", "content": "Use os Stories para mostrar o que acontece por trás do conteúdo pronto. Compartilhe erros, aprendizados e a rotina de trabalho. Quanto mais humano, maior a identificação." }, { "title": "Criando uma Comunidade Engajada e Leal", "content": "Uma audiência fiel é construída com interação real e constância. Responda comentários e DMs, envolva seguidores com perguntas e enquetes. Quem se sente visto, volta. E quem volta, compra." } ] } ];
    const BOT_BACKEND_URL = 'https://superapp-whatsapp-bot.onrender.com';

    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let statusChart, db, unsubscribeChat;
    let currentLeadId = null, draggedItem = null, currentProductId = null;

    async function main() {
        console.log('[DEBUG] Função main() iniciada.');
        firebase.auth().onAuthStateChanged(async user => {
            if (user && !document.body.hasAttribute('data-initialized')) {
                console.log('[DEBUG] Usuário AUTENTICADO:', user.uid);
                document.body.setAttribute('data-initialized', 'true');
                db = firebase.firestore();
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
            } else if (!user) {
                console.log('[DEBUG] Usuário NÃO autenticado.');
            }
        });
        checkTheme();
    }
    main();

    async function loadAllUserData(userId) { /* ...código sem alterações... */ }
    async function saveAllUserData(userId, showConfirmation = false) { /* ...código sem alterações... */ }
    function applySettings(settings = {}) { /* ...código sem alterações... */ }
    function updateAllUI() { renderKanbanCards(); renderLeadsTable(); updateDashboard(); renderCaixaTable(); updateCaixa(); renderEstoqueTable(); }
    
    function setupEventListeners(userId) {
        console.log('[DEBUG] Configurando event listeners...');
        // ... (todo o resto dos event listeners permanece o mesmo) ...

        const saveBtn = document.getElementById('save-bot-instructions-btn');
        if(saveBtn) {
            saveBtn.addEventListener('click', async () => {
                console.log('[DEBUG] Botão "Salvar e Gerar QR Code" CLICADO.');
                try {
                    await saveAllUserData(userId);
                    initBotConnection();
                } catch (error) {
                    console.error('[DEBUG] Erro ao salvar dados ou iniciar conexão:', error);
                }
            });
            console.log('[DEBUG] Event listener do botão de salvar bot ADICIONADO.');
        } else {
            console.error('[DEBUG] ERRO: Botão "save-bot-instructions-btn" não encontrado no DOM.');
        }
    }

    function initBotConnection() {
        console.log('[DEBUG] Função initBotConnection() chamada. Tentando conectar a:', BOT_BACKEND_URL);
        const c = document.getElementById('bot-connection-area');
        c.innerHTML = '<p>Tentando conectar ao servidor do bot... Isso pode levar até 1 minuto se ele estiver inativo.</p>';
        const es = new EventSource(`${BOT_BACKEND_URL}/events`);
        es.onopen = () => console.log('[DEBUG] Conexão EventSource ABERTA com o servidor.');
        es.onmessage = ev => {
            console.log('[DEBUG] Mensagem recebida do servidor:', ev.data);
            try {
                const d = JSON.parse(ev.data);
                if (d.type === 'qr') {
                    c.innerHTML = `<h3>Escaneie o QR Code</h3><img src="${d.data}" alt="QR Code">`;
                    es.close();
                } else if (d.type === 'status') {
                    c.innerHTML = `<p>Status: <strong style="color:lightgreen;">${d.data}</strong></p>`;
                }
            } catch (e) {
                console.error("Erro ao processar mensagem do servidor: ", e);
            }
        };
        es.onerror = (err) => {
            console.error('[DEBUG] ERRO na conexão EventSource:', err);
            c.innerHTML = '<p style="color:red;">Não foi possível conectar. Verifique o problema de CORS no backend e se o bot está ativo no Render.</p>';
            es.close();
        };
    }

    async function handleChatbotSubmit(userId) {
        const input = document.getElementById('chatbot-input');
        const text = input.value.trim();
        if (!text) return;
        addMessageToChat(text, 'user-message');
        chatHistory.push({ role: "user", parts: [{ text }] });
        input.value = '';
        const thinkingMsg = addMessageToChat("...", 'bot-message thinking');
        await saveAllUserData(userId);
        
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: chatHistory.slice(0, -1), prompt: text })
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            thinkingMsg.textContent = data.text;
            thinkingMsg.classList.remove('thinking');
            chatHistory.push({ role: 'model', parts: [{ text: data.text }] });
            await saveAllUserData(userId);
        } catch (error) {
            console.error("Erro ao chamar a API do Chatbot:", error);
            thinkingMsg.textContent = "Desculpe, não consegui me conectar à IA. Tente novamente.";
            thinkingMsg.classList.remove('thinking');
        }
    }
    
    // **FUNÇÃO CORRIGIDA**
    function addMessageToChat(msg, type) {
        const container = document.getElementById('chatbot-messages');
        if (!container) return null;
        const msgDiv = document.createElement('div');
        // A correção está aqui: dividimos as classes pelo espaço
        const classes = type.split(' ');
        classes.forEach(cls => msgDiv.classList.add(cls));
        msgDiv.textContent = msg;
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
        return msgDiv;
    }

    // ... (restante das funções: toggleTheme, checkTheme, render, etc. permanecem as mesmas)
    function toggleTheme() { document.body.classList.toggle('light-theme'); const isLight = document.body.classList.contains('light-theme'); localStorage.setItem('theme', isLight ? 'light' : 'dark'); checkTheme(); }
    function checkTheme() { const theme = localStorage.getItem('theme'); const btn = document.getElementById('theme-toggle-btn'); if (theme === 'light') { document.body.classList.add('light-theme'); if (btn) btn.textContent = 'Mudar para Tema Escuro'; } else { document.body.classList.remove('light-theme'); if (btn) btn.textContent = 'Mudar para Tema Claro'; } }
    function renderChatHistory() { const container = document.getElementById('chatbot-messages'); if (!container) return; container.innerHTML = ''; if (chatHistory.length === 0) { addMessageToChat("Olá! Como posso ajudar?", 'bot-message'); } else { chatHistory.forEach(m => addMessageToChat(m.parts[0].text, m.role === 'user' ? 'user-message' : 'bot-message')); } }
    // ... (e todas as outras funções de renderização)

});
