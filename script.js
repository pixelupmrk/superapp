document.addEventListener('DOMContentLoaded', () => {
    // ... (todo o início do arquivo, variáveis, main(), loadAllUserData(), etc. continua igual)
    
    // ===================================================================
    // FUNÇÃO initBotConnection ATUALIZADA PARA ENVIAR O ID DO USUÁRIO
    // ===================================================================
    function initBotConnection(userId) { // A função agora recebe o userId
        if (!userId) {
            console.error('[DEBUG] ERRO: Tentativa de conectar sem ID de usuário.');
            return;
        }

        console.log(`[DEBUG] Função initBotConnection() chamada para o usuário: ${userId}`);
        const c = document.getElementById('bot-connection-area');
        c.innerHTML = '<p>Iniciando conexão... Aguarde o QR Code.</p>';
        
        // Adicionamos o userId como um parâmetro na URL
        const es = new EventSource(`${BOT_BACKEND_URL}/events?userId=${userId}`);

        es.onopen = () => console.log('[DEBUG] Conexão EventSource ABERTA com o servidor.');
        
        es.onmessage = ev => {
            console.log('[DEBUG] Mensagem recebida do servidor:', ev.data);
            try {
                const d = JSON.parse(ev.data);
                if (d.type === 'qr') {
                    c.innerHTML = `<h3>Escaneie o QR Code com o seu WhatsApp</h3><img src="${d.data}" alt="QR Code">`;
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
            c.innerHTML = '<p style="color:red;">Não foi possível conectar. Verifique se o backend está no ar e tente novamente.</p>';
            es.close();
        };
    }

    // ===================================================================
    // ATUALIZAÇÃO NO EVENT LISTENER DO BOTÃO PARA PASSAR O USER ID
    // ===================================================================
    function setupEventListeners(userId) {
        // ... (todos os outros listeners continuam iguais)

        const saveBtn = document.getElementById('save-bot-instructions-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                console.log('[DEBUG] Botão "Salvar e Gerar QR Code" CLICADO.');
                try {
                    await saveAllUserData(userId);
                    initBotConnection(userId); // Passamos o userId aqui!
                } catch (error) {
                    console.error('[DEBUG] Erro ao salvar dados ou iniciar conexão:', error);
                }
            });
            console.log('[DEBUG] Event listener do botão de salvar bot ADICIONADO.');
        } else {
            console.error('[DEBUG] ERRO: Botão "save-bot-instructions-btn" não encontrado no DOM.');
        }

        // ... (o resto da função setupEventListeners continua igual)
    }

    // Cole o resto do seu arquivo script.js aqui para garantir que tudo esteja completo.
    // Para facilitar, aqui está o arquivo COMPLETO novamente:
});

// ===================================================================
// VERSÃO COMPLETA E FINAL DO SCRIPT.JS PARA SUBSTITUIÇÃO TOTAL
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] DOM carregado. Aguardando Firebase...');
    const mentoriaData = [ { "moduleId": "MD01", "title": "Módulo 1: Conectando com o Cliente Ideal", "lessons": [ { "title": "Questionário para Definição de Persona", "content": "Antes de qualquer estratégia, é essencial saber com quem você está falando. O questionário irá ajudar a identificar o perfil do seu cliente ideal. Use o CRM para registrar as respostas e começar a segmentar seus leads.\n\nPerguntas do Questionário:\n1. Nome fictício da persona:\n2. Idade aproximada:\n3. Profissão ou ocupação:\n4. Quais são suas dores e dificuldades?\n5. Quais são seus desejos ou objetivos?\n6. Onde essa pessoa busca informação?\n7. Quais redes sociais essa pessoa usa com frequência?\n8. Que tipo de conteúdo ela consome?" }, { "title": "Proposta de Valor e Posicionamento", "content": "Com base na persona, vamos definir a proposta de valor do seu serviço. A proposta responde: 'Eu ajudo [persona] a [solução] através de [diferencial do seu serviço].'\n\nExemplo: Ajudo [vendedores autônomos] a [acelerar vendas] usando [o super app com CRM e automação]." } ] }, { "moduleId": "MD02", "title": "Módulo 2: O Algoritmo da Meta (Facebook & Instagram)", "lessons": [ { "title": "Como o Algoritmo Funciona", "content": "O algoritmo da Meta analisa o comportamento dos usuários para decidir o que mostrar. Ele prioriza conteúdos que geram interação rápida. Quanto mais relevante for o seu conteúdo para o público, mais ele será entregue." }, { "title": "O que Influencia o Alcance Orgânico", "content": "O alcance orgânico depende de fatores como: qualidade do conteúdo, engajamento nos primeiros minutos, frequência de publicações e relacionamento com o público (DMs, respostas, salvamentos)." }, { "title": "Comece com um Gancho Forte", "content": "O primeiro segundo do seu conteúdo precisa chamar a atenção imediatamente. Depois do gancho, entregue valor real e finalize com uma chamada para ação (CTA). Exemplo de ganchos: 'Você está postando, mas ninguém engaja? Isso aqui é pra você.'" } ] }, { "moduleId": "MD03", "title": "Módulo 3: Cronograma de Postagens Estratégico", "lessons": [ { "title": "Melhores Horários e Dias para Postagem", "content": "O ideal é postar quando seu público está mais ativo (geralmente entre 11h e 13h ou 18h e 20h, de terça a quinta). Use as métricas do Instagram para ver quando seus seguidores estão online." }, { "title": "Frequência Ideal e Consistência", "content": "Mais importante que a quantidade, é a consistência. A frequência ideal varia por nicho. A mentoria sugere: Estética e beleza (4 a 5 posts por semana); B2B (3 posts bem elaborados por semana); Varejo (diária)." }, { "title": "Exemplo de Cronograma Semanal", "content": "Utilize um calendário para organizar o conteúdo por dia da semana:\nSegunda-feira: Conteúdo Educativo\nTerça-feira: Prova Social (depoimento)\nQuarta-feira: Vídeo Reels\nQuinta-feira: Dica + Engajamento\nSexta-feira: Chamada para Ação/Oferta\nSábado: Conteúdo leve/Bastidor\nDomingo: (Opcional) Inspiração" } ] }, { "moduleId": "MD04", "title": "Módulo 4: Conteúdo que Conecta", "lessons": [ { "title": "Estrutura de Vídeos que Engajam", "content": "Um vídeo precisa seguir uma estrutura estratégica: Gancho (1º segundo), Valor (dica ou solução) e CTA (chamada para ação). Exemplo: 'Você quer mais clientes? Então evite esse erro aqui...'" }, { "title": "Edição Prática com CapCut ou InShot", "content": "Aprenda a usar ferramentas de edição como CapCut para cortar partes desnecessárias, adicionar legendas automáticas e inserir trilha sonora." }, { "title": "Design com Canva", "content": "Use o Canva para criar uma identidade visual coesa. Mantenha fontes legíveis, as cores da sua marca e crie um padrão visual para que seus posts sejam reconhecidos no feed." } ] }, { "moduleId": "MD05", "title": "Módulo 5: Copywriting com ChatGPT", "lessons": [ { "title": "Como Criar Textos Persuasivos com IA", "content": "O ChatGPT é uma ferramenta poderosa para gerar textos que vendem. A chave está em saber o que pedir e como direcionar a IA com clareza. Use as fórmulas de copy para montar seus prompts." }, { "title": "Fórmulas Testadas: AIDA e PAS", "content": "Aprenda a usar as estruturas de texto persuasivo:\nAIDA: Atenção, Interesse, Desejo, Ação\nPAS: Problema, Agitação, Solução" }, { "title": "Criando Prompts Inteligentes", "content": "Um bom prompt direciona o ChatGPT a criar algo útil. Use a estrutura: [Ação] + [Assunto] + [Objetivo] + [Estilo/Tom]. Exemplo: 'Escreva uma copy para anúncio no Instagram sobre mentoria de marketing, com objetivo de gerar leads, num tom direto e persuasivo.'" } ] }, { "moduleId": "MD06", "title": "Módulo 6: Implementação de CRM", "lessons": [ { "title": "O que é CRM e Por que sua Empresa Precisa", "content": "CRM (Customer Relationship Management) é uma ferramenta que organiza o relacionamento com seus leads e clientes, acompanhando-os desde o primeiro contato até o fechamento da venda." }, { "title": "Construção de Funil de Vendas Básico", "content": "Um funil simples pode ter 4 etapas: Contato Inicial, Conversa/Apresentação, Proposta Enviada, Cliente Fechado. O super app ajudará a organizar os leads por estágio para manter a eficiência." }, { "title": "Opções de Remarketing", "content": "Aprenda a segmentar leads no CRM e criar campanhas de remarketing para: Leads que não fecharam (com anúncios de cases), Leads que sumiram (com mensagens personalizadas) e Ex-clientes (com bônus de retorno)." } ] }, { "moduleId": "MD07", "title": "Módulo 7: Processo Comercial e Técnicas de Venda", "lessons": [ { "title": "Como Montar um Pitch Comercial", "content": "O pitch é a sua 'apresentação relâmpago'. Ele precisa ser claro e direto. Inclua: Quem você ajuda, o problema que resolve e o diferencial do seu serviço. Exemplo: 'Nós ajudamos negócios locais a atrair clientes todos os dias usando vídeos e tráfego pago.'" }, { "title": "Rapport e Gatilhos Mentais", "content": "Crie conexão usando técnicas como: Rapport (usar linguagem e ritmo parecidos com o cliente) e Gatilhos Mentais (escassez, autoridade, prova social). O cliente compra quando sente confiança e identificação." }, { "title": "Follow-up Eficiente", "content": "A maioria das vendas acontece no 2º ou 3º contato. Use o CRM do super app para agendar retornos e sempre traga um valor novo na abordagem. Evite ser insistente; seja consultivo." } ] }, { "moduleId": "MD08", "title": "Módulo 8: Conexão com a Audiência e Humanização", "lessons": [ { "title": "Gerando Conexão Real (sem Forçar)", "content": "Pessoas se conectam com pessoas. Mostrar sua rotina e bastidores cria empatia. Seja autêntico, não perfeito. Use a câmera frontal e fale como se fosse para um amigo." }, { "title": "Estratégias de Bastidores nos Stories", "content": "Use os Stories para mostrar o que acontece por trás do conteúdo pronto. Compartilhe erros, aprendizados e a rotina de trabalho. Quanto mais humano, maior a identificação." }, { "title": "Criando uma Comunidade Engajada e Leal", "content": "Uma audiência fiel é construída com interação real e constância. Responda comentários e DMs, envolva seguidores com perguntas e enquetes. Quem se sente visto, volta. E quem volta, compra." } ] } ];
    const BOT_BACKEND_URL = 'https://superapp-whatsapp-bot.onrender.com';
    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let statusChart, db, unsubscribeChat;
    let currentLeadId = null, draggedItem = null, currentProductId = null;
    async function main() { console.log('[DEBUG] Função main() iniciada.'); firebase.auth().onAuthStateChanged(async user => { if (user && !document.body.hasAttribute('data-initialized')) { console.log('[DEBUG] Usuário AUTENTICADO:', user.uid); document.body.setAttribute('data-initialized', 'true'); db = firebase.firestore(); await loadAllUserData(user.uid); setupEventListeners(user.uid); } else if (!user) { console.log('[DEBUG] Usuário NÃO autenticado.'); } }); checkTheme(); }
    main();
    async function loadAllUserData(userId) { console.log('[DEBUG] Carregando dados do usuário...'); try { const doc = await db.collection('userData').doc(userId).get(); if (doc.exists) { const data = doc.data(); leads = data.leads || []; caixa = data.caixa || []; estoque = data.estoque || []; mentoriaNotes = data.mentoriaNotes || {}; chatHistory = data.chatHistory || []; document.getElementById('bot-instructions').value = data.botInstructions || ''; applySettings(data.settings); } renderMentoria(); loadMentoriaNotes(); renderChatHistory(); updateAllUI(); console.log('[DEBUG] Dados carregados e UI atualizada.'); } catch (error) { console.error("Erro ao carregar dados do usuário:", error); } }
    async function saveAllUserData(userId, showConfirmation = false) { getMentoriaNotes(); const settings = { userName: document.getElementById('setting-user-name').value || 'Usuário' }; const botInstructions = document.getElementById('bot-instructions').value; const dataToSave = { leads, caixa, estoque, mentoriaNotes, chatHistory, settings, botInstructions }; try { await db.collection('userData').doc(userId).set(dataToSave, { merge: true }); if (showConfirmation) alert('Configurações salvas!'); console.log('[DEBUG] Dados do usuário salvos no Firestore.'); } catch (error) { console.error("Erro ao salvar dados:", error); } }
    function applySettings(settings = {}) { const userName = settings.userName || 'Usuário'; document.querySelector('.user-profile span').textContent = `Olá, ${userName}`; document.getElementById('setting-user-name').value = userName; }
    function updateAllUI() { renderKanbanCards(); renderLeadsTable(); updateDashboard(); renderCaixaTable(); updateCaixa(); renderEstoqueTable(); }
    function setupEventListeners(userId) {
        console.log('[DEBUG] Configurando event listeners...');
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', e => {
                console.log('[DEBUG] Clique na sidebar detectado:', e.currentTarget.getAttribute('data-target'));
                try {
                    e.preventDefault();
                    if (e.currentTarget.id === 'logout-btn') {
                        console.log('[DEBUG] Botão de logout clicado.');
                        return;
                    }
                    const targetId = e.currentTarget.getAttribute('data-target');
                    if (!targetId) return;
                    document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => el.classList.remove('active'));
                    document.querySelectorAll('.content-area').forEach(el => el.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.classList.add('active');
                        document.getElementById('page-title').textContent = e.currentTarget.querySelector('span').textContent;
                    } else {
                        console.error('[DEBUG] ERRO: Elemento com ID', targetId, 'não encontrado.');
                    }
                } catch (error) {
                    console.error('[DEBUG] ERRO CRÍTICO no listener da sidebar:', error);
                }
            });
        });
        console.log('[DEBUG] Listeners da SIDEBAR adicionados.');
        const saveBtn = document.getElementById('save-bot-instructions-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                console.log('[DEBUG] Botão "Salvar e Gerar QR Code" CLICADO.');
                try {
                    await saveAllUserData(userId);
                    initBotConnection(userId); // Passamos o userId aqui!
                } catch (error) {
                    console.error('[DEBUG] Erro ao salvar dados ou iniciar conexão:', error);
                }
            });
            console.log('[DEBUG] Event listener do botão de salvar bot ADICIONADO.');
        } else {
            console.error('[DEBUG] ERRO: Botão "save-bot-instructions-btn" não encontrado no DOM.');
        }
        document.getElementById('save-settings-btn')?.addEventListener('click', () => { console.log('[DEBUG] Botão Salvar Configurações clicado.'); saveAllUserData(userId, true); });
        document.getElementById('theme-toggle-btn')?.addEventListener('click', () => { console.log('[DEBUG] Botão Mudar Tema clicado.'); toggleTheme(); });
        document.getElementById('chatbot-form')?.addEventListener('submit', e => { console.log('[DEBUG] Formulário do Chatbot enviado.'); e.preventDefault(); handleChatbotSubmit(userId); });
        document.getElementById('export-csv-btn')?.addEventListener('click', () => { console.log('[DEBUG] Botão Exportar CSV clicado.'); if (estoque.length === 0) return alert("Não há produtos para exportar."); const ws = XLSX.utils.json_to_sheet(estoque); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Estoque"); XLSX.writeFile(wb, "estoque.xlsx"); });
        document.getElementById('menu-toggle')?.addEventListener('click', () => { console.log('[DEBUG] Botão de Menu (mobile) clicado.'); document.querySelector('.app-container').classList.toggle('sidebar-visible'); });
        document.getElementById('lead-form')?.addEventListener('submit', async e => { e.preventDefault(); const nextId = leads.length > 0 ? Math.max(...leads.map(l => l.id || 0)) + 1 : 1; leads.push({ id: nextId, status: document.getElementById('lead-status-form').value, nome: document.getElementById('lead-name').value, whatsapp: document.getElementById('lead-whatsapp').value }); await saveAllUserData(userId); updateAllUI(); e.target.reset(); });
        const kanbanBoard = document.getElementById('kanban-board');
        kanbanBoard.addEventListener('dragstart', e => { if (e.target.classList.contains('kanban-card')) draggedItem = e.target; });
        kanbanBoard.addEventListener('dragover', e => e.preventDefault());
        kanbanBoard.addEventListener('drop', async e => { e.preventDefault(); const column = e.target.closest('.kanban-column'); if (column && draggedItem) { const lead = leads.find(l => l.id == draggedItem.dataset.id); if (lead) { lead.status = column.dataset.status; await saveAllUserData(userId); updateAllUI(); } } });
        kanbanBoard.addEventListener('click', e => { e.preventDefault(); const card = e.target.closest('.kanban-card'); if (card) openLeadModal(parseInt(card.dataset.id), userId); });
        document.getElementById('leads-table').addEventListener('click', e => { e.preventDefault(); if (e.target.closest('.btn-open-lead')) { const leadId = e.target.closest('tr').dataset.id; openLeadModal(parseInt(leadId), userId); } });
        document.getElementById('edit-lead-form').addEventListener('submit', async e => { e.preventDefault(); const lead = leads.find(l => l.id === currentLeadId); if(lead) { lead.nome = document.getElementById('edit-lead-name').value; lead.whatsapp = document.getElementById('edit-lead-whatsapp').value; lead.status = document.getElementById('edit-lead-status').value; await saveAllUserData(userId); updateAllUI(); alert('Lead salvo!'); } });
        document.getElementById('delete-lead-btn').addEventListener('click', async () => { if (confirm('Tem certeza?')) { leads = leads.filter(l => l.id !== currentLeadId); await saveAllUserData(userId); updateAllUI(); document.getElementById('lead-modal').style.display = 'none'; } });
        document.querySelectorAll('.close-modal').forEach(btn => { btn.addEventListener('click', () => { document.getElementById(btn.dataset.target).style.display = 'none'; if (unsubscribeChat) unsubscribeChat(); }); });
        document.getElementById('caixa-form')?.addEventListener('submit', async e => { e.preventDefault(); caixa.push({ id: `caixa_${Date.now()}`, data: document.getElementById('caixa-data').value, descricao: document.getElementById('caixa-descricao').value, valor: parseFloat(document.getElementById('caixa-valor').value), tipo: document.getElementById('caixa-tipo').value }); await saveAllUserData(userId); updateAllUI(); e.target.reset(); });
        document.getElementById('caixa-table').addEventListener('click', async e => { if (e.target.closest('.btn-delete-caixa')) { if (confirm('Tem certeza?')) { const itemId = e.target.dataset.id; caixa = caixa.filter(item => item.id !== itemId); await saveAllUserData(userId); updateAllUI(); } } });
        document.querySelectorAll('.finance-tab').forEach(tab => { tab.addEventListener('click', e => { e.preventDefault(); document.querySelectorAll('.finance-tab, .finance-content').forEach(el => el.classList.remove('active')); e.target.classList.add('active'); document.getElementById(e.target.dataset.tab + '-tab-content').classList.add('active'); }); });
        document.getElementById('estoque-form')?.addEventListener('submit', async e => { e.preventDefault(); estoque.push({ id: `prod_${Date.now()}`, produto: document.getElementById('estoque-produto').value, compra: parseFloat(document.getElementById('estoque-compra').value), venda: parseFloat(document.getElementById('estoque-venda').value), custos: [] }); await saveAllUserData(userId); renderEstoqueTable(); e.target.reset(); });
        document.getElementById('estoque-table').addEventListener('click', async e => { e.preventDefault(); if (e.target.closest('.btn-custo')) { openCustosModal(e.target.closest('tr').dataset.id); } if (e.target.closest('.btn-delete-estoque')) { if (confirm('Tem certeza?')) { const productId = e.target.closest('tr').dataset.id; estoque = estoque.filter(p => p.id !== productId); await saveAllUserData(userId); updateAllUI(); } } });
        document.getElementById('add-custo-form').addEventListener('submit', async e => { e.preventDefault(); const produto = estoque.find(p => p.id === currentProductId); if (produto) { if(!produto.custos) produto.custos = []; produto.custos.push({ descricao: document.getElementById('custo-descricao').value, valor: parseFloat(document.getElementById('custo-valor').value) }); await saveAllUserData(userId); renderCustosList(produto); renderEstoqueTable(); e.target.reset(); }});
        console.log('[DEBUG] TODOS os listeners foram configurados.');
    }
    function initBotConnection(userId) { if (!userId) { console.error('[DEBUG] ERRO: Tentativa de conectar sem ID de usuário.'); return; } console.log(`[DEBUG] Função initBotConnection() chamada para o usuário: ${userId}`); const c = document.getElementById('bot-connection-area'); c.innerHTML = '<p>Iniciando conexão... Aguarde o QR Code.</p>'; const es = new EventSource(`${BOT_BACKEND_URL}/events?userId=${userId}`); es.onopen = () => console.log('[DEBUG] Conexão EventSource ABERTA com o servidor.'); es.onmessage = ev => { console.log('[DEBUG] Mensagem recebida do servidor:', ev.data); try { const d = JSON.parse(ev.data); if (d.type === 'qr') { c.innerHTML = `<h3>Escaneie o QR Code com o seu WhatsApp</h3><img src="${d.data}" alt="QR Code">`; es.close(); } else if (d.type === 'status') { c.innerHTML = `<p>Status: <strong style="color:lightgreen;">${d.data}</strong></p>`; } } catch (e) { console.error("Erro ao processar mensagem do servidor: ", e); } }; es.onerror = (err) => { console.error('[DEBUG] ERRO na conexão EventSource:', err); c.innerHTML = '<p style="color:red;">Não foi possível conectar. Verifique se o backend está no ar e tente novamente.</p>'; es.close(); }; }
    async function handleChatbotSubmit(userId) { const input = document.getElementById('chatbot-input'); const text = input.value.trim(); if (!text) return; addMessageToChat(text, 'user-message'); chatHistory.push({ role: "user", parts: [{ text }] }); input.value = ''; const thinkingMsg = addMessageToChat("...", 'bot-message thinking'); await saveAllUserData(userId); try { const response = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: chatHistory.slice(0, -1), prompt: text }) }); if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); const data = await response.json(); thinkingMsg.textContent = data.text; thinkingMsg.classList.remove('thinking'); chatHistory.push({ role: 'model', parts: [{ text: data.text }] }); await saveAllUserData(userId); } catch (error) { console.error("Erro ao chamar a API do Chatbot:", error); thinkingMsg.textContent = "Desculpe, não consegui me conectar à IA. Verifique se a chave da API Gemini foi configurada na Vercel."; thinkingMsg.classList.remove('thinking'); } }
    function addMessageToChat(msg, type) { const container = document.getElementById('chatbot-messages'); if (!container) return null; const msgDiv = document.createElement('div'); const classes = type.split(' '); classes.forEach(cls => { if(cls) msgDiv.classList.add(cls) }); msgDiv.textContent = msg; container.appendChild(msgDiv); container.scrollTop = container.scrollHeight; return msgDiv; }
    function toggleTheme() { document.body.classList.toggle('light-theme'); const isLight = document.body.classList.contains('light-theme'); localStorage.setItem('theme', isLight ? 'light' : 'dark'); checkTheme(); }
    function checkTheme() { const theme = localStorage.getItem('theme'); const btn = document.getElementById('theme-toggle-btn'); if (theme === 'light') { document.body.classList.add('light-theme'); if (btn) btn.textContent = 'Mudar para Tema Escuro'; } else { document.body.classList.remove('light-theme'); if (btn) btn.textContent = 'Mudar para Tema Claro'; } }
    function openLeadModal(leadId, userId) { currentLeadId = leadId; const lead = leads.find(l => l.id === leadId); if (!lead) return; document.getElementById('lead-modal-title').textContent = `Conversa com ${lead.nome}`; document.getElementById('edit-lead-name').value = lead.nome || ''; document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || ''; document.getElementById('edit-lead-status').value = lead.status; const chatHistoryDiv = document.getElementById('lead-chat-history'); chatHistoryDiv.innerHTML = '<p>Carregando...</p>'; if (unsubscribeChat) unsubscribeChat(); unsubscribeChat = db.collection('userData').doc(userId).collection('leads').doc(String(leadId)).collection('messages').orderBy('timestamp').onSnapshot(snapshot => { chatHistoryDiv.innerHTML = ''; if (snapshot.empty) chatHistoryDiv.innerHTML = '<p>Inicie a conversa!</p>'; snapshot.forEach(doc => { const msg = doc.data(); const bubble = document.createElement('div'); bubble.classList.add('msg-bubble', msg.sender === 'operator' ? 'msg-from-operator' : 'msg-from-lead'); bubble.textContent = msg.text; chatHistoryDiv.appendChild(bubble); }); chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight; }); document.getElementById('lead-modal').style.display = 'flex'; }
    function openCustosModal(productId) { currentProductId = productId; const produto = estoque.find(p => p.id === productId); if (produto) { document.getElementById('custos-modal-title').textContent = `Custos de: ${produto.produto}`; renderCustosList(produto); document.getElementById('custos-modal').style.display = 'flex'; } }
    function renderKanbanCards() { document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = ''); leads.forEach(lead => { const c = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`); if (c) c.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${lead.whatsapp}</p></div>`; }); }
    function renderLeadsTable() { const t = document.querySelector('#leads-table tbody'); if (t) t.innerHTML = leads.map(l => `<tr data-id="${l.id}"><td>${l.nome}</td><td>${l.whatsapp}</td><td>${l.status}</td><td><button class="btn-table-action btn-open-lead">Abrir</button></td></tr>`).join(''); }
    function updateDashboard() { const n = leads.filter(l => l.status === 'novo').length; const p = leads.filter(l => l.status === 'progresso').length; const f = leads.filter(l => l.status === 'fechado').length; document.getElementById('total-leads').textContent = leads.length; document.getElementById('leads-novo').textContent = n; document.getElementById('leads-progresso').textContent = p; document.getElementById('leads-fechado').textContent = f; const ctx = document.getElementById('statusChart')?.getContext('2d'); if (!ctx) return; if (statusChart) statusChart.destroy(); statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Progresso', 'Fechado'], datasets: [{ data: [n, p, f], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'], borderWidth: 0 }] } }); }
    function renderCaixaTable() { const t = document.querySelector('#caixa-table tbody'); if (t) t.innerHTML = caixa.map(m => `<tr data-id="${m.id}"><td>${m.data}</td><td>${m.descricao}</td><td>R$ ${parseFloat(m.valor).toFixed(2)}</td><td>${m.tipo}</td><td><button class="btn-table-action btn-delete-item btn-delete-caixa" data-id="${m.id}">Excluir</button></td></tr>`).join(''); }
    function updateCaixa() { const e = caixa.filter(m => m.tipo === 'entrada').reduce((a, c) => a + parseFloat(c.valor || 0), 0), s = caixa.filter(m => m.tipo === 'saida').reduce((a, c) => a + parseFloat(c.valor || 0), 0); document.getElementById('total-entradas').textContent = `R$ ${e.toFixed(2)}`; document.getElementById('total-saidas').textContent = `R$ ${s.toFixed(2)}`; document.getElementById('caixa-atual').textContent = `R$ ${(e - s).toFixed(2)}`; }
    function renderEstoqueTable() { const t = document.querySelector('#estoque-table tbody'); if(!t) return; t.innerHTML = estoque.map(p => { const totalCustos = p.custos?.reduce((a, c) => a + c.valor, 0) || 0; const lucro = p.venda - p.compra - totalCustos; return `<tr data-id="${p.id}"><td>${p.produto}</td><td>R$ ${p.compra.toFixed(2)}</td><td>R$ ${totalCustos.toFixed(2)}</td><td>R$ ${p.venda.toFixed(2)}</td><td>R$ ${lucro.toFixed(2)}</td><td><button class="btn-table-action btn-custo">Custos</button><button class="btn-table-action btn-delete-item btn-delete-estoque">Excluir</button></td></tr>`}).join(''); }
    function renderCustosList(produto) { const list = document.getElementById('custos-list'); if (!produto.custos || produto.custos.length === 0) { list.innerHTML = '<p>Nenhum custo adicionado.</p>'; return; } list.innerHTML = produto.custos.map(c => `<div><span>${c.descricao}</span><span>R$ ${c.valor.toFixed(2)}</span></div>`).join(''); }
    function renderMentoria() { const menu = document.getElementById('mentoria-menu'); const content = document.getElementById('mentoria-content'); if (!menu || !content || mentoriaData.length === 0) return; menu.innerHTML = mentoriaData.map(mod => `<div class="sales-accelerator-menu-item" data-module-id="${mod.moduleId}">${mod.title}</div>`).join(''); content.innerHTML = mentoriaData.map(mod => { const lessonsHtml = mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content.replace(/\n/g, '<br>')}</p></div>`).join(''); return `<div class="mentoria-module-content" id="${mod.moduleId}">${lessonsHtml}<div class="anotacoes-aluno"><textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="8" placeholder="Suas anotações..."></textarea></div></div>`; }).join(''); document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => { item.addEventListener('click', e => { e.preventDefault(); document.querySelectorAll('.sales-accelerator-menu-item, .mentoria-module-content').forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active'); document.getElementById(e.currentTarget.dataset.moduleId).classList.add('active'); }); }); const firstMenuItem = document.querySelector('.sales-accelerator-menu-item'); if (firstMenuItem) { firstMenuItem.classList.add('active'); document.getElementById(firstMenuItem.dataset.moduleId).classList.add('active'); } }
    function renderChatHistory() { const container = document.getElementById('chatbot-messages'); if (!container) return; container.innerHTML = ''; if (chatHistory.length === 0) { addMessageToChat("Olá! Como posso ajudar?", 'bot-message'); } else { chatHistory.forEach(m => addMessageToChat(m.parts[0].text, m.role === 'user' ? 'user-message' : 'bot-message')); } }
    function getMentoriaNotes() { document.querySelectorAll('.mentoria-notas').forEach(t => mentoriaNotes[t.id] = t.value); }
    function loadMentoriaNotes() { for (const id in mentoriaNotes) { const t = document.getElementById(id); if (t) t.value = mentoriaNotes[id]; } }
});
