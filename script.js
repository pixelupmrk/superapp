document.addEventListener('DOMContentLoaded', () => {
    // --- 1. VARIÁVEIS GLOBAIS ---
    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let statusChart, db, unsubscribeChat;
    let currentLeadId = null, draggedItem = null;
    const BOT_BACKEND_URL = 'https://superapp-whatsapp-bot.onrender.com';

    // --- 2. INICIALIZAÇÃO ---
    const main = () => {
        firebase.auth().onAuthStateChanged(async user => {
            if (user && !document.body.dataset.initialized) {
                document.body.setAttribute('data-initialized', 'true');
                db = firebase.firestore();
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
                loadMentoriaContent();
            }
        });
    };

    // --- 3. DADOS (CARREGAR E SALVAR) ---
    async function loadAllUserData(userId) {
        try {
            const doc = await db.collection('userData').doc(userId).get();
            if (doc.exists) {
                const data = doc.data();
                leads = data.leads || [];
                leads.forEach(lead => {
                    if (lead.id === undefined) lead.id = Date.now() + Math.random();
                    if (lead.unreadCount === undefined) lead.unreadCount = 0;
                    if (lead.botActive === undefined) lead.botActive = true;
                });
                caixa = data.caixa || [];
                estoque = data.estoque || [];
                mentoriaNotes = data.mentoriaNotes || {};
                chatHistory = data.chatHistory || [];
                document.getElementById('setting-user-name').value = data.settings?.userName || '';
            }
            updateAllUI();
        } catch (error) { console.error("Erro ao carregar dados:", error); }
    }

    async function saveAllUserData(userId, showConfirmation = false) {
        try {
            getMentoriaNotes();
            const dataToSave = { 
                leads, caixa, estoque, mentoriaNotes, chatHistory, 
                settings: { userName: document.getElementById('setting-user-name').value } 
            };
            await db.collection('userData').doc(userId).set(dataToSave, { merge: true });
            if (showConfirmation) alert('Dados salvos!');
        } catch (error) { console.error("Erro ao salvar dados:", error); }
    }

    // --- 4. ATUALIZAÇÃO DA UI ---
    function updateAllUI() {
        updateDashboard();
        renderKanbanCards();
        renderLeadsTable();
        renderCaixaTable();
        updateCaixa();
        renderEstoqueTable();
    }

    // --- 5. FUNÇÕES DE RENDERIZAÇÃO ---
    function updateDashboard() {
        const dashboardElement = document.querySelector('#dashboard-section');
        if (!dashboardElement || !dashboardElement.classList.contains('active')) return;
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
        statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Progresso', 'Fechado'], datasets: [{ data: [n, p, f], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false } });
    }

    function renderKanbanCards() {
        document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = '');
        leads.forEach(lead => {
            const column = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (column) {
                const badgeHtml = lead.unreadCount > 0 ? `<span class="notification-badge">${lead.unreadCount}</span>` : '';
                column.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><div><strong>${lead.nome}</strong><p>${lead.whatsapp}</p></div>${badgeHtml}</div>`;
            }
        });
    }

    function renderLeadsTable() {
        const tbody = document.querySelector('#leads-table tbody');
        if (!tbody) return;
        tbody.innerHTML = leads.map(l => {
            const badgeHtml = l.unreadCount > 0 ? `<span class="notification-badge">${l.unreadCount}</span>` : '';
            return `<tr data-id="${l.id}"><td>${l.nome} ${badgeHtml}</td><td>${l.whatsapp}</td><td>${l.status}</td><td><button class="btn-table-action btn-open-lead">Abrir</button></td></tr>`;
        }).join('');
    }

    function renderCaixaTable() { /* Lógica para renderizar tabela de caixa */ }
    function updateCaixa() { /* Lógica para atualizar totais do caixa */ }
    function renderEstoqueTable() { /* Lógica para renderizar tabela de estoque */ }
    
    async function loadMentoriaContent() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            const menu = document.getElementById('mentoria-menu');
            const content = document.getElementById('mentoria-content');
            if (!menu || !content) return;
            menu.innerHTML = data.mentoria.map(mod => `<div class="sales-accelerator-menu-item" data-module-id="${mod.moduleId}">${mod.title}</div>`).join('');
            content.innerHTML = data.mentoria.map(mod => {
                const placeholder = mod.exercisePrompt || 'Digite suas anotações...';
                const lessonsHtml = mod.lessons.map(les => `<div class="card mentoria-lesson"><h3>${les.title}</h3><p>${les.content.replace(/\n/g, '<br>')}</p></div>`).join('');
                return `<div class="mentoria-module-content" id="${mod.moduleId}">${lessonsHtml}<div class="anotacoes-aluno card"><h3>Suas Anotações / Exercícios</h3><textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="8" placeholder="${placeholder}"></textarea></div></div>`;
            }).join('');

            const menuItems = document.querySelectorAll('.sales-accelerator-menu-item');
            menuItems.forEach(item => {
                item.addEventListener('click', e => {
                    menuItems.forEach(i => i.classList.remove('active'));
                    document.querySelectorAll('.mentoria-module-content').forEach(c => c.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    document.getElementById(e.currentTarget.dataset.moduleId).classList.add('active');
                });
            });
            if (menuItems.length > 0) {
                menuItems[0].classList.add('active');
                document.getElementById(menuItems[0].dataset.moduleId).classList.add('active');
            }
            loadMentoriaNotes();
        } catch(e) { console.error("Falha ao carregar mentoria", e); }
    }
    
    function getMentoriaNotes() { document.querySelectorAll('.mentoria-notas').forEach(t => mentoriaNotes[t.id] = t.value); }
    function loadMentoriaNotes() { for (const id in mentoriaNotes) { const el = document.getElementById(id); if(el) el.value = mentoriaNotes[id]; } }

    // --- 6. MODAIS E INTERAÇÕES ---
    async function openLeadModal(leadId) {
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;
        const userId = firebase.auth().currentUser.uid;

        if (lead.unreadCount > 0) {
            lead.unreadCount = 0;
            await saveAllUserData(userId);
            updateAllUI();
        }
        
        updateBotButton(lead.botActive);
        document.getElementById('lead-modal-title').textContent = `Conversa com ${lead.nome}`;
        document.getElementById('edit-lead-name').value = lead.nome;
        document.getElementById('edit-lead-whatsapp').value = lead.whatsapp;
        document.getElementById('edit-lead-status').value = lead.status;
        
        const chatHistoryDiv = document.getElementById('lead-chat-history');
        if (unsubscribeChat) unsubscribeChat();
        unsubscribeChat = db.collection('userData').doc(userId).collection('leads').doc(String(leadId))
            .collection('messages').orderBy('timestamp').onSnapshot(snapshot => {
                chatHistoryDiv.innerHTML = snapshot.empty ? '<p>Inicie a conversa!</p>' : '';
                snapshot.forEach(doc => {
                    const msg = doc.data();
                    const bubble = document.createElement('div');
                    bubble.className = `msg-bubble msg-from-${msg.sender}`;
                    bubble.innerHTML = msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
                    chatHistoryDiv.appendChild(bubble);
                });
                chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
            });
        
        document.getElementById('lead-modal').style.display = 'flex';
    }

    function updateBotButton(isBotActive) {
        const btn = document.getElementById('toggle-bot-btn');
        if (btn) {
            btn.textContent = isBotActive ? 'Desativar Bot' : 'Ativar Bot';
            btn.className = `btn-save ${isBotActive ? 'btn-secondary' : 'btn-save'}`;
        }
    }

    // --- 7. EVENT LISTENERS ---
    function setupEventListeners(userId) {
        // Navegação
        document.querySelectorAll('.sidebar-nav .nav-item:not(#logout-btn)').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                const targetId = e.currentTarget.dataset.target;
                document.querySelectorAll('.sidebar-nav .nav-item, .content-area').forEach(el => el.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.getElementById(targetId)?.classList.add('active');
                document.getElementById('page-title').textContent = e.currentTarget.querySelector('span').textContent;
                if (targetId === 'dashboard-section') updateDashboard();
            });
        });

        // Abas Financeiro
        document.querySelectorAll('.finance-tab').forEach(tab => {
            tab.addEventListener('click', e => {
                e.preventDefault();
                document.querySelectorAll('.finance-tab, .finance-content').forEach(el => el.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.getElementById(e.currentTarget.dataset.tab + '-tab-content').classList.add('active');
            });
        });
        
        // Abrir Modal do Lead
        document.body.addEventListener('click', e => {
            const card = e.target.closest('.kanban-card, .btn-open-lead');
            if (card) {
                const leadIdStr = card.closest('[data-id]').dataset.id;
                openLeadModal(parseFloat(leadIdStr));
            }
        });
        
        // Fechar Modais
        document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', e => {
            e.target.closest('.modal-overlay').style.display = 'none';
            if (unsubscribeChat) { unsubscribeChat(); unsubscribeChat = null; }
        }));
        window.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
                if (unsubscribeChat) { unsubscribeChat(); unsubscribeChat = null; }
            }
        });

        // Kanban Drag & Drop
        const kanbanBoard = document.getElementById('kanban-board');
        kanbanBoard.addEventListener('dragstart', e => { if (e.target.classList.contains('kanban-card')) { draggedItem = e.target; } });
        kanbanBoard.addEventListener('dragend', () => { draggedItem = null; });
        kanbanBoard.addEventListener('dragover', e => e.preventDefault());
        kanbanBoard.addEventListener('drop', async (e) => {
            e.preventDefault();
            const column = e.target.closest('.kanban-column');
            if (column && draggedItem) {
                const leadId = parseFloat(draggedItem.dataset.id);
                const lead = leads.find(l => l.id === leadId);
                if (lead && lead.status !== column.dataset.status) {
                    lead.status = column.dataset.status;
                    await saveAllUserData(userId);
                    renderKanbanCards();
                }
            }
        });
        
        // Adicionar novo Lead
        document.getElementById('lead-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newLead = {
                id: Date.now(),
                nome: document.getElementById('lead-name').value,
                whatsapp: document.getElementById('lead-whatsapp').value,
                status: document.getElementById('lead-status-form').value,
                unreadCount: 0,
                botActive: true
            };
            leads.push(newLead);
            await saveAllUserData(userId);
            updateAllUI();
            e.target.reset();
        });

        // Chatbot AI
        document.getElementById('chatbot-form')?.addEventListener('submit', async e => {
            e.preventDefault();
            const input = document.getElementById('chatbot-input');
            const messagesContainer = document.getElementById('chatbot-messages');
            const userMessage = input.value.trim();
            if (!userMessage) return;
            
            chatHistory.push({role: 'user', parts: [{ text: userMessage }]});
            messagesContainer.innerHTML += `<div class="user-message">${userMessage}</div>`;
            input.value = '';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            try {
                const response = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ history: chatHistory.slice(0, -1), prompt: userMessage })
                });
                if (!response.ok) throw new Error('Falha na API');
                const data = await response.json();
                chatHistory.push({role: 'model', parts: [{ text: data.text }]});
                messagesContainer.innerHTML += `<div class="bot-message">${data.text}</div>`;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                await saveAllUserData(userId);
            } catch (error) {
                console.error("Erro no Chatbot AI:", error);
                messagesContainer.innerHTML += `<div class="bot-message">Desculpe, não consegui responder. Tente novamente.</div>`;
            }
        });

        // Botão Gerar QR Code
        document.getElementById('save-bot-instructions-btn')?.addEventListener('click', () => {
            const botInstructions = document.getElementById('bot-instructions').value;
            // Salvar instruções antes de conectar
            db.collection('userData').doc(userId).set({ botInstructions }, { merge: true });
            
            const connectionArea = document.getElementById('bot-connection-area');
            connectionArea.innerHTML = '<p>Iniciando conexão... Aguarde o QR Code.</p>';
            
            const eventSource = new EventSource(`${BOT_BACKEND_URL}/events?userId=${userId}`);
            eventSource.onmessage = event => {
                const data = JSON.parse(event.data);
                if (data.type === 'qr') {
                    connectionArea.innerHTML = `<h3>Escaneie o QR Code</h3><img src="${data.data}" alt="QR Code do WhatsApp">`;
                    eventSource.close();
                } else if (data.type === 'status') {
                    connectionArea.innerHTML = `<p style="color: lightgreen;">Status: ${data.data}</p>`;
                }
            };
            eventSource.onerror = () => {
                connectionArea.innerHTML = '<p style="color: red;">Erro ao conectar com o servidor do bot.</p>';
                eventSource.close();
            };
        });

        // Botão Ativar/Desativar Bot
        document.getElementById('toggle-bot-btn')?.addEventListener('click', async () => {
            const lead = leads.find(l => l.id === currentLeadId);
            if (lead) {
                lead.botActive = !lead.botActive;
                await saveAllUserData(userId);
                updateBotButton(lead.botActive);
            }
        });

        // Botão de Tema
        document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
        });

        // Salvar Configurações
        document.getElementById('save-settings-btn')?.addEventListener('click', () => saveAllUserData(userId, true));
    }

    // --- 8. EXECUÇÃO ---
    main();
});
