document.addEventListener('DOMContentLoaded', () => {
    // --- DADOS COMPLETOS DA MENTORIA (INTEGRADO DIRETAMENTE) ---
    const mentoriaData = [
        {"moduleId":"MD01","title":"Módulo 1: Conectando com o Cliente Ideal","lessons":[{"lessonId":"L01.01","title":"Questionário para Definição de Persona","content":"Antes de qualquer estratégia, é essencial saber com quem você está falando. O questionário irá ajudar a identificar o perfil do seu cliente ideal. Use o CRM para registrar as respostas e começar a segmentar seus leads.\n\nPerguntas do Questionário:\n1. Nome fictício da persona:\n2. Idade aproximada:\n3. Profissão ou ocupação:\n4. Quais são suas dores e dificuldades?\n5. Quais são seus desejos ou objetivos?\n6. Onde essa pessoa busca informação?\n7. Quais redes sociais essa pessoa usa com frequência?\n8. Que tipo de conteúdo ela consome?"},{"lessonId":"L01.02","title":"Proposta de Valor e Posicionamento","content":"Com base na persona, vamos definir a proposta de valor do seu serviço. A proposta responde: 'Eu ajudo [persona] a [solução] através de [diferencial do seu serviço].'\n\nExemplo: Ajudo [vendedores autônomos] a [acelerar vendas] usando [o super app com CRM e automação]."}]},
        {"moduleId":"MD02","title":"Módulo 2: O Algoritmo da Meta (Facebook & Instagram)","lessons":[{"lessonId":"L02.01","title":"Como o Algoritmo Funciona","content":"O algoritmo da Meta analisa o comportamento dos usuários para decidir o que mostrar. Ele prioriza conteúdos que geram interação rápida. Quanto mais relevante for o seu conteúdo para o público, mais ele será entregue."},{"lessonId":"L02.03","title":"Comece com um Gancho Forte","content":"O primeiro segundo do seu conteúdo precisa chamar a atenção imediatamente. Depois do gancho, entregue valor real e finalize com uma chamada para ação (CTA). Exemplo de ganchos: 'Você está postando, mas ninguém engaja? Isso aqui é pra você.'"}]},
        {"moduleId":"MD03","title":"Módulo 3: Cronograma de Postagens Estratégico","lessons":[{"lessonId":"L03.01","title":"Melhores Horários e Dias para Postagem","content":"O ideal é postar quando seu público está mais ativo (geralmente entre 11h e 13h ou 18h e 20h, de terça a quinta). Use as métricas do Instagram para ver quando seus seguidores estão online."},{"lessonId":"L03.03","title":"Exemplo de Cronograma Semanal","content":"Utilize um calendário para organizar o conteúdo por dia da semana:\nSegunda-feira: Conteúdo Educativo\nTerça-feira: Prova Social (depoimento)\nQuarta-feira: Vídeo Reels\nQuinta-feira: Dica + Engajamento\nSexta-feira: Chamada para Ação/Oferta\nSábado: Conteúdo leve/Bastidor\nDomingo: (Opcional) Inspiração"}]},
        {"moduleId":"MD04","title":"Módulo 4: Conteúdo que Conecta","lessons":[{"lessonId":"L04.01","title":"Estrutura de Vídeos que Engajam","content":"Um vídeo precisa seguir uma estrutura estratégica: Gancho (1º segundo), Valor (dica ou solução) e CTA (chamada para ação). Exemplo: 'Você quer mais clientes? Então evite esse erro aqui...'"}]},
        {"moduleId":"MD05","title":"Módulo 5: Copywriting com ChatGPT","lessons":[{"lessonId":"L05.01","title":"Como Criar Textos Persuasivos com IA","content":"O ChatGPT é uma ferramenta poderosa para gerar textos que vendem. A chave está em saber o que pedir e como direcionar a IA com clareza. Use as fórmulas de copy para montar seus prompts."},{"lessonId":"L05.02","title":"Fórmulas Testadas: AIDA e PAS","content":"Aprenda a usar as estruturas de texto persuasivo:\nAIDA: Atenção, Interesse, Desejo, Ação\nPAS: Problema, Agitação, Solução"}]},
        {"moduleId":"MD06","title":"Módulo 6: Implementação de CRM","lessons":[{"lessonId":"L06.01","title":"O que é CRM e Por que sua Empresa Precisa","content":"CRM (Customer Relationship Management) é uma ferramenta que organiza o relacionamento com seus leads e clientes, acompanhando-os desde o primeiro contato até o fechamento da venda."},{"lessonId":"L06.02","title":"Construção de Funil de Vendas Básico","content":"Um funil simples pode ter 4 etapas: Contato Inicial, Conversa/Apresentação, Proposta Enviada, Cliente Fechado. O super app ajudará a organizar os leads por estágio para manter a eficiência."}]},
        {"moduleId":"MD07","title":"Módulo 7: Processo Comercial e Técnicas de Venda","lessons":[{"lessonId":"L07.01","title":"Como Montar um Pitch Comercial","content":"O pitch é a sua 'apresentação relâmpago'. Ele precisa ser claro e direto. Inclua: Quem você ajuda, o problema que resolve e o diferencial do seu serviço. Exemplo: 'Nós ajudamos negócios locais a atrair clientes todos os dias usando vídeos e tráfego pago.'"},{"lessonId":"L07.03","title":"Follow-up Eficiente","content":"A maioria das vendas acontece no 2º ou 3º contato. Use o CRM do super app para agendar retornos e sempre traga um valor novo na abordagem. Evite ser insistente; seja consultivo."}]},
        {"moduleId":"MD08","title":"Módulo 8: Conexão com a Audiência e Humanização","lessons":[{"lessonId":"L08.01","title":"Gerando Conexão Real (sem Forçar)","content":"Pessoas se conectam com pessoas. Mostrar sua rotina e bastidores cria empatia. Seja autêntico, não perfeito. Use a câmera frontal e fale como se fosse para um amigo."}]}
    ];
    
    // URL DO BOT (JÁ PREENCHIDA COM A SUA)
    const BOT_BACKEND_URL = 'https://superapp-whatsapp-bot.onrender.com'; // Sem a barra no final

    // --- VARIÁVEIS GLOBAIS ---
    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let currentLeadId = null, draggedItem = null, currentProductId = null;
    let statusChart;
    let db;
    let unsubscribeChat;

    // --- INICIALIZAÇÃO ---
    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user && !document.body.hasAttribute('data-initialized')) {
                document.body.setAttribute('data-initialized', 'true');
                db = firebase.firestore();
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
            }
        });
    }
    main();

    // --- CARREGAMENTO E SALVAMENTO DE DADOS ---
    async function loadAllUserData(userId) {
        const doc = await db.collection('userData').doc(userId).get();
        if (doc.exists) {
            const data = doc.data();
            leads = data.leads || [];
            caixa = data.caixa || [];
            estoque = data.estoque || [];
            mentoriaNotes = data.mentoriaNotes || {};
            chatHistory = data.chatHistory || [];
            applySettings(data.settings);
        }
        renderMentoria();
        loadMentoriaNotes();
        renderChatHistory();
        updateAllUI();
    }

    async function saveAllUserData(userId) {
        getMentoriaNotes();
        const settings = {
            userName: document.getElementById('setting-user-name').value || 'Usuário',
            theme: document.body.classList.contains('light-theme') ? 'light' : 'dark'
        };
        const dataToSave = { leads, caixa, estoque, mentoriaNotes, chatHistory, settings };
        await db.collection('userData').doc(userId).set(dataToSave, { merge: true });
    }

    // --- FUNÇÕES DE LÓGICA E INTERFACE ---
    function applySettings(settings = {}) {
        const userName = settings.userName || 'Usuário';
        document.querySelector('.user-profile span').textContent = `Olá, ${userName}`;
        document.getElementById('setting-user-name').value = userName;
        const theme = settings.theme || 'dark';
        document.body.className = theme === 'light' ? 'light-theme' : '';
        document.getElementById('theme-toggle-btn').textContent = theme === 'light' ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro';
    }

    function updateAllUI() {
        renderKanbanCards();
        renderLeadsTable();
        updateDashboard();
        renderCaixaTable();
        updateCaixa();
        renderEstoqueTable();
    }
    
    function initBotConnection() { 
        const connectionArea = document.getElementById('bot-connection-area');
        connectionArea.innerHTML = '<p>Tentando conectar ao servidor do bot... Isso pode levar até 1 minuto.</p>';
        const eventSource = new EventSource(`${BOT_BACKEND_URL}/events`);
        eventSource.onmessage = function(event) {
            const data = JSON.parse(event.data);
            if(data.type === 'qr') {
                connectionArea.innerHTML = `<h3>Escaneie o QR Code</h3><img src="${data.data}" alt="QR Code do WhatsApp" style="width: 250px; height: 250px;">`;
            } else if (data.type === 'status') {
                connectionArea.innerHTML = `<p>Status: <strong style="color: lightgreen;">${data.data}</strong></p>`;
            }
        };
        eventSource.onerror = function() {
            connectionArea.innerHTML = '<p style="color: red;">Não foi possível conectar ao servidor do bot. Verifique se ele está ativo no Render e tente novamente.</p>';
            eventSource.close();
        };
    }

    function openLeadModal(leadId, userId) {
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;
        document.getElementById('lead-modal-title').textContent = `Conversa com ${lead.nome}`;
        document.getElementById('edit-lead-name').value = lead.nome || '';
        document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
        document.getElementById('edit-lead-status').value = lead.status;
        const chatHistoryDiv = document.getElementById('lead-chat-history');
        chatHistoryDiv.innerHTML = '<p>Carregando...</p>';
        if (unsubscribeChat) unsubscribeChat();
        unsubscribeChat = db.collection('userData').doc(userId).collection('leads').doc(String(leadId)).collection('messages').orderBy('timestamp').onSnapshot(snapshot => {
            chatHistoryDiv.innerHTML = '';
            if (snapshot.empty) chatHistoryDiv.innerHTML = '<p>Inicie a conversa!</p>';
            snapshot.forEach(doc => { const msg = doc.data(); const bubble = document.createElement('div'); bubble.classList.add('msg-bubble', msg.sender === 'operator' ? 'msg-from-operator' : 'msg-from-lead'); bubble.textContent = msg.text; chatHistoryDiv.appendChild(bubble); });
            chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
        });
        document.getElementById('lead-modal').style.display = 'flex';
    }

    function openCustosModal(productId) {
        currentProductId = productId;
        const produto = estoque.find(p => p.id === productId);
        if (produto) {
            document.getElementById('custos-modal-title').textContent = `Custos de: ${produto.produto}`;
            renderCustosList(produto);
            document.getElementById('custos-modal').style.display = 'flex';
        }
    }
    
    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    function renderKanbanCards() { document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = ''); leads.forEach(lead => { const c = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`); if (c) c.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${lead.whatsapp}</p></div>`; }); }
    function renderLeadsTable() { const t = document.querySelector('#leads-table tbody'); if (t) t.innerHTML = leads.map(l => `<tr data-id="${l.id}"><td>${l.nome}</td><td>${l.whatsapp}</td><td>${l.origem || ''}</td><td>${l.qualificacao || ''}</td><td>${l.status}</td><td><button class="btn-table-action btn-open-lead">Abrir</button></td></tr>`).join(''); }
    function updateDashboard() { const n = leads.filter(l => l.status === 'novo').length; const p = leads.filter(l => l.status === 'progresso').length; const f = leads.filter(l => l.status === 'fechado').length; document.getElementById('total-leads').textContent = leads.length; document.getElementById('leads-novo').textContent = n; document.getElementById('leads-progresso').textContent = p; document.getElementById('leads-fechado').textContent = f; const ctx = document.getElementById('statusChart')?.getContext('2d'); if (!ctx) return; if (statusChart) statusChart.destroy(); statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Progresso', 'Fechado'], datasets: [{ data: [n, p, f], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'], borderWidth: 0 }] } }); }
    function renderCaixaTable() { const t = document.querySelector('#caixa-table tbody'); if (t) t.innerHTML = caixa.map((m, index) => `<tr><td>${m.data}</td><td>${m.descricao}</td><td>${m.tipo === 'entrada' ? 'R$ ' + parseFloat(m.valor).toFixed(2) : ''}</td><td>${m.tipo === 'saida' ? 'R$ ' + parseFloat(m.valor).toFixed(2) : ''}</td><td><button class="btn-table-action btn-delete-item btn-delete-caixa" data-index="${index}">Excluir</button></td></tr>`).join(''); }
    function updateCaixa() { const e = caixa.filter(m => m.tipo === 'entrada').reduce((a, c) => a + parseFloat(c.valor || 0), 0), s = caixa.filter(m => m.tipo === 'saida').reduce((a, c) => a + parseFloat(c.valor || 0), 0); document.getElementById('total-entradas').textContent = `R$ ${e.toFixed(2)}`; document.getElementById('total-saidas').textContent = `R$ ${s.toFixed(2)}`; document.getElementById('caixa-atual').textContent = `R$ ${(e - s).toFixed(2)}`; }
    function renderEstoqueTable() { const t = document.querySelector('#estoque-table tbody'); if(!t) return; t.innerHTML = estoque.map(p => `<tr data-id="${p.id}"><td>${p.produto}</td><td>${p.descricao || ''}</td><td>R$ ${parseFloat(p.compra).toFixed(2)}</td><td>...</td><td>R$ ${parseFloat(p.venda).toFixed(2)}</td><td>...</td><td><button class="btn-table-action btn-custo">Custos</button><button class="btn-table-action btn-delete-item btn-delete-estoque">Excluir</button></td></tr>`).join(''); }
    function renderCustosList(produto) { const list = document.getElementById('custos-list'); if (!produto.custos || produto.custos.length === 0) { list.innerHTML = '<p>Nenhum custo.</p>'; return; } list.innerHTML = produto.custos.map(c => `<div><span>${c.descricao}</span><span>R$ ${c.valor.toFixed(2)}</span></div>`).join(''); }
    function renderMentoria() {
        const menu = document.getElementById('mentoria-menu'); const content = document.getElementById('mentoria-content');
        if (!menu || !content || mentoriaData.length === 0) return;
        menu.innerHTML = mentoriaData.map(mod => `<div class="sales-accelerator-menu-item" data-module-id="${mod.moduleId}">${mod.title}</div>`).join('');
        content.innerHTML = mentoriaData.map(mod => { const lessonsHtml = mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content.replace(/\n/g, '<br>')}</p></div>`).join(''); return `<div class="mentoria-module-content" id="${mod.moduleId}">${lessonsHtml}<div class="anotacoes-aluno"><textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="8" placeholder="Suas anotações..."></textarea></div></div>`; }).join('');
        document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => {
            item.addEventListener('click', e => {
                document.querySelectorAll('.sales-accelerator-menu-item, .mentoria-module-content').forEach(el => el.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.getElementById(e.currentTarget.dataset.moduleId).classList.add('active');
            });
        });
        const firstMenuItem = document.querySelector('.sales-accelerator-menu-item');
        if (firstMenuItem) {
            firstMenuItem.classList.add('active');
            document.getElementById(firstMenuItem.dataset.moduleId).classList.add('active');
        }
    }
    function addMessageToChat(msg, type) { const container = document.getElementById('chatbot-messages'); if (container) { const msgDiv = document.createElement('div'); msgDiv.classList.add(type); msgDiv.textContent = msg; container.appendChild(msgDiv); container.scrollTop = container.scrollHeight; } }
    function renderChatHistory() { const container = document.getElementById('chatbot-messages'); if (!container) return; container.innerHTML = ''; if (chatHistory.length === 0) { addMessageToChat("Olá! Como posso ajudar?", 'bot-message'); } else { chatHistory.forEach(m => addMessageToChat(m.parts[0].text, m.role === 'user' ? 'user-message' : 'bot-message')); } }
    function getMentoriaNotes() { document.querySelectorAll('.mentoria-notas').forEach(t => mentoriaNotes[t.id] = t.value); }
    function loadMentoriaNotes() { for (const id in mentoriaNotes) { const t = document.getElementById(id); if (t) t.value = mentoriaNotes[id]; } }
    
    // --- EVENT LISTENERS DINÂMICOS (para tabelas) ---
    function setupEventListeners(userId) {
        // ... (código dos listeners estáticos aqui)
        document.getElementById('save-settings-btn')?.addEventListener('click', async () => { await saveAllUserData(userId); applySettings({ userName: document.getElementById('setting-user-name').value }); alert('Configurações salvas!'); });
        // ... (resto dos listeners)

        // Listener para a tabela de estoque (deleção)
        document.getElementById('estoque-table').addEventListener('click', async e => {
            if (e.target.closest('.btn-delete-estoque')) {
                if (confirm('Tem certeza que quer excluir este produto?')) {
                    const productId = e.target.closest('tr').dataset.id;
                    estoque = estoque.filter(p => p.id !== productId);
                    await saveAllUserData(userId);
                    updateAllUI();
                }
            }
            if (e.target.closest('.btn-custo')) {
                openCustosModal(e.target.closest('tr').dataset.id);
            }
        });
        
        // Listener para a tabela de caixa (deleção)
        document.getElementById('caixa-table').addEventListener('click', async e => {
            if (e.target.closest('.btn-delete-caixa')) {
                if (confirm('Tem certeza que quer excluir esta movimentação?')) {
                    const itemIndex = e.target.dataset.index;
                    caixa.splice(itemIndex, 1);
                    await saveAllUserData(userId);
                    updateAllUI();
                }
            }
        });
    }
});
