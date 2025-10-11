document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DECLARAÇÃO DE VARIÁVEIS GLOBAIS ---
    const BOT_BACKEND_URL = 'https://superapp-whatsapp-bot.onrender.com';
    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let statusChart, db, unsubscribeChat;
    let currentLeadId = null, draggedItem = null;

    // --- 2. DECLARAÇÃO DE FUNÇÕES ---

    // Funções Auxiliares
    const applySettings = (settings = {}) => {
        const userName = settings.userName || 'Usuário';
        document.querySelector('.user-profile span').textContent = `Olá, ${userName}`;
        document.getElementById('setting-user-name').value = userName;
    };

    const addMessageToChat = (msg, type) => {
        const container = document.getElementById('chatbot-messages');
        if (!container) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = type;
        msgDiv.textContent = msg;
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
        return msgDiv;
    };

    const getMentoriaNotes = () => document.querySelectorAll('.mentoria-notas').forEach(t => mentoriaNotes[t.id] = t.value);
    const loadMentoriaNotes = () => { for (const id in mentoriaNotes) { const t = document.getElementById(id); if (t) t.value = mentoriaNotes[id]; } };

    // Funções de Renderização da UI
    const renderKanbanCards = () => {
        document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = '');
        leads.forEach(lead => {
            const column = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (column) {
                column.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${lead.whatsapp}</p></div>`;
            }
        });
    };

    const renderLeadsTable = () => {
        const tbody = document.querySelector('#leads-table tbody');
        if (tbody) tbody.innerHTML = leads.map(l => `<tr data-id="${l.id}"><td>${l.nome}</td><td>${l.whatsapp}</td><td>${l.status}</td><td><button class="btn-table-action btn-open-lead">Abrir</button></td></tr>`).join('');
    };

    const updateDashboard = () => {
        const n = leads.filter(l => l.status === 'novo').length;
        const p = leads.filter(l => l.status === 'progresso').length;
        const f = leads.filter(l => l.status === 'fechado').length;
        document.getElementById('total-leads').textContent = leads.length;
        document.getElementById('leads-novo').textContent = n;
        document.getElementById('leads-progresso').textContent = p;
        document.getElementById('leads-fechado').textContent = f;
        const ctx = document.getElementById('statusChart')?.getContext('2d');
        if (!ctx) return;
        if (statusChart) statusChart.destroy();
        statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Progresso', 'Fechado'], datasets: [{ data: [n, p, f], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'], borderWidth: 0 }] } });
    };
    
    const renderCaixaTable = () => {
        const tbody = document.querySelector('#caixa-table tbody');
        if (tbody) tbody.innerHTML = caixa.map(m => `<tr data-id="${m.id}"><td>${m.data}</td><td>${m.descricao}</td><td>R$ ${parseFloat(m.valor).toFixed(2)}</td><td>${m.tipo}</td><td><button class="btn-table-action btn-delete-item btn-delete-caixa" data-id="${m.id}">Excluir</button></td></tr>`).join('');
    };

    const updateCaixa = () => {
        const e = caixa.filter(m => m.tipo === 'entrada').reduce((a, c) => a + parseFloat(c.valor || 0), 0);
        const s = caixa.filter(m => m.tipo === 'saida').reduce((a, c) => a + parseFloat(c.valor || 0), 0);
        document.getElementById('total-entradas').textContent = `R$ ${e.toFixed(2)}`;
        document.getElementById('total-saidas').textContent = `R$ ${s.toFixed(2)}`;
        document.getElementById('caixa-atual').textContent = `R$ ${(e - s).toFixed(2)}`;
    };

    const renderEstoqueTable = () => {
        const tbody = document.querySelector('#estoque-table tbody');
        if (!tbody) return;
        tbody.innerHTML = estoque.map(p => {
            const totalCustos = p.custos?.reduce((a, c) => a + c.valor, 0) || 0;
            const lucro = p.venda - p.compra - totalCustos;
            return `<tr data-id="${p.id}"><td>${p.produto}</td><td>R$ ${p.compra.toFixed(2)}</td><td>R$ ${totalCustos.toFixed(2)}</td><td>R$ ${p.venda.toFixed(2)}</td><td>R$ ${lucro.toFixed(2)}</td><td><button class="btn-table-action btn-custo">Custos</button><button class="btn-table-action btn-delete-item btn-delete-estoque">Excluir</button></td></tr>`;
        }).join('');
    };

    const renderChatHistory = () => {
        const container = document.getElementById('chatbot-messages');
        if (!container) return;
        container.innerHTML = '';
        if (chatHistory.length === 0) {
            addMessageToChat("Olá! Como posso ajudar?", 'bot-message');
        } else {
            chatHistory.forEach(m => addMessageToChat(m.parts[0].text, m.role === 'user' ? 'user-message' : 'bot-message'));
        }
    };

    const renderMentoria = (mentoriaData) => {
        const menu = document.getElementById('mentoria-menu');
        const content = document.getElementById('mentoria-content');
        if (!menu || !content || !mentoriaData) return;
        menu.innerHTML = mentoriaData.map(mod => `<div class="sales-accelerator-menu-item" data-module-id="${mod.moduleId}">${mod.title}</div>`).join('');
        content.innerHTML = mentoriaData.map(mod => {
            const lessonsHtml = mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content.replace(/\n/g, '<br>')}</p></div>`).join('');
            return `<div class="mentoria-module-content" id="${mod.moduleId}">${lessonsHtml}<div class="anotacoes-aluno"><h3>Suas Anotações</h3><textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="8" placeholder="Ex: Falar com o cliente X sobre a nova proposta de valor na segunda-feira."></textarea></div></div>`;
        }).join('');
        document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
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
    };
    
    // Funções de Lógica de Dados
    const updateAllUI = () => { renderKanbanCards(); renderLeadsTable(); updateDashboard(); renderCaixaTable(); updateCaixa(); renderEstoqueTable(); };

    const loadAllUserData = async (userId) => {
        const doc = await db.collection('userData').doc(userId).get();
        if (doc.exists) {
            const data = doc.data();
            leads = data.leads || [];
            caixa = data.caixa || [];
            estoque = data.estoque || [];
            mentoriaNotes = data.mentoriaNotes || {};
            chatHistory = data.chatHistory || [];
            document.getElementById('bot-instructions').value = data.botInstructions || '';
            applySettings(data.settings);
        }
        loadMentoriaNotes();
        renderChatHistory();
        updateAllUI();
    };

    const saveAllUserData = async (userId, showConfirmation = false) => {
        getMentoriaNotes();
        const settings = { userName: document.getElementById('setting-user-name').value || 'Usuário' };
        const botInstructions = document.getElementById('bot-instructions').value;
        const dataToSave = { leads, caixa, estoque, mentoriaNotes, chatHistory, settings, botInstructions };
        await db.collection('userData').doc(userId).set(dataToSave, { merge: true });
        if (showConfirmation) alert('Configurações salvas!');
    };

    // Funções de Interação e Modais
    const openLeadModal = (leadId, userId) => {
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;

        document.getElementById('lead-modal-title').textContent = `Conversa com ${lead.nome}`;
        document.getElementById('edit-lead-name').value = lead.nome || '';
        document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
        document.getElementById('edit-lead-status').value = lead.status;
        
        const chatHistoryDiv = document.getElementById('lead-chat-history');
        chatHistoryDiv.innerHTML = '<p>Carregando chat...</p>';
        if (unsubscribeChat) unsubscribeChat();
        
        unsubscribeChat = db.collection('userData').doc(userId).collection('leads').doc(String(leadId))
            .collection('messages').orderBy('timestamp').onSnapshot(snapshot => {
                chatHistoryDiv.innerHTML = snapshot.empty ? '<p>Inicie a conversa!</p>' : '';
                snapshot.forEach(doc => {
                    const msg = doc.data();
                    const bubble = document.createElement('div');
                    bubble.className = `msg-bubble msg-from-${msg.sender}`;
                    bubble.textContent = msg.text;
                    chatHistoryDiv.appendChild(bubble);
                });
                chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
            });
        
        document.getElementById('lead-modal').style.display = 'flex';
    };

    const handleChatbotSubmit = async (userId) => {
        const userInput = document.getElementById('chatbot-input');
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        addMessageToChat(userMessage, 'user-message');
        chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });
        userInput.value = '';

        const loadingMessage = addMessageToChat('Digitando...', 'bot-message loading');

        try {
            // Se você estiver usando Vercel, o endpoint é /api/gemini
            // Se for um backend externo, use a URL completa
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: chatHistory.slice(0, -1), prompt: userMessage })
            });

            if (!response.ok) throw new Error((await response.json()).error || 'Erro na API');

            const data = await response.json();
            const botMessage = data.text;
            
            loadingMessage.remove();
            addMessageToChat(botMessage, 'bot-message');
            chatHistory.push({ role: 'model', parts: [{ text: botMessage }] });
            
            await saveAllUserData(userId);
        } catch (error) {
            loadingMessage.textContent = `Desculpe, ocorreu um erro: ${error.message}`;
            console.error("Erro no chatbot:", error);
        }
    };
    
    // Configuração de Event Listeners
    const setupEventListeners = (userId) => {
        // Navegação principal
        document.querySelectorAll('.sidebar-nav .nav-item:not(#logout-btn)').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                const targetId = e.currentTarget.dataset.target;
                document.querySelectorAll('.sidebar-nav .nav-item, .content-area').forEach(el => el.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.getElementById(targetId)?.classList.add('active');
                document.getElementById('page-title').textContent = e.currentTarget.querySelector('span').textContent;
            });
        });

        // Abas do Financeiro
        document.querySelectorAll('.finance-nav .finance-tab').forEach(tab => {
            tab.addEventListener('click', e => {
                e.preventDefault();
                document.querySelectorAll('.finance-nav .finance-tab, .finance-content').forEach(el => el.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.getElementById(`${e.currentTarget.dataset.tab}-tab-content`)?.classList.add('active');
            });
        });

        // Abrir Modal de Lead (Kanban e Lista)
        document.body.addEventListener('click', e => {
            if (e.target.closest('.kanban-card')) {
                openLeadModal(e.target.closest('.kanban-card').dataset.id, userId);
            }
            if (e.target.classList.contains('btn-open-lead')) {
                openLeadModal(e.target.closest('tr').dataset.id, userId);
            }
        });

        // Fechar Modais
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', e => {
                document.getElementById(e.currentTarget.dataset.target).style.display = 'none';
                if (unsubscribeChat) { unsubscribeChat(); unsubscribeChat = null; }
            });
        });

        // Kanban Drag & Drop
        const kanbanBoard = document.getElementById('kanban-board');
        kanbanBoard.addEventListener('dragstart', e => {
            if (e.target.classList.contains('kanban-card')) {
                draggedItem = e.target;
                setTimeout(() => e.target.classList.add('dragging'), 0);
            }
        });
        kanbanBoard.addEventListener('dragend', () => {
            draggedItem?.classList.remove('dragging');
            draggedItem = null;
        });
        kanbanBoard.addEventListener('dragover', e => e.preventDefault());
        kanbanBoard.addEventListener('drop', async e => {
            e.preventDefault();
            const column = e.target.closest('.kanban-column');
            if (column && draggedItem) {
                const leadId = draggedItem.dataset.id;
                const newStatus = column.dataset.status;
                const leadIndex = leads.findIndex(l => l.id === leadId);
                if (leadIndex > -1 && leads[leadIndex].status !== newStatus) {
                    leads[leadIndex].status = newStatus;
                    await saveAllUserData(userId);
                    updateAllUI();
                }
            }
        });

        // Formulário do Chatbot
        document.getElementById('chatbot-form')?.addEventListener('submit', e => {
            e.preventDefault();
            handleChatbotSubmit(userId);
        });
        
        // Salvar configurações
        document.getElementById('save-settings-btn')?.addEventListener('click', () => saveAllUserData(userId, true));
    };

    // --- FUNÇÃO PRINCIPAL (INICIALIZAÇÃO) ---
    const main = async () => {
        await fetch('data.json').then(res => res.json()).then(data => renderMentoria(data.mentoria)).catch(console.error);
        
        firebase.auth().onAuthStateChanged(async user => {
            if (user && !document.body.dataset.initialized) {
                document.body.dataset.initialized = 'true';
                db = firebase.firestore();
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
            }
        });
    };

    main();
});
