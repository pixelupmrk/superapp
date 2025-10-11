document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DECLARAÇÃO DE VARIÁVEIS GLOBAIS ---
    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let statusChart, db, unsubscribeChat;
    let currentLeadId = null, draggedItem = null;

    // --- 2. FUNÇÃO PRINCIPAL (INICIALIZAÇÃO) ---
    const main = async () => {
        firebase.auth().onAuthStateChanged(async user => {
            if (user && !document.body.dataset.initialized) {
                document.body.setAttribute('data-initialized', 'true');
                db = firebase.firestore();
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
            }
        });
    };

    // --- 3. LÓGICA DE DADOS (CARREGAR E SALVAR) ---
    async function loadAllUserData(userId) {
        try {
            const doc = await db.collection('userData').doc(userId).get();
            if (doc.exists) {
                const data = doc.data();
                leads = data.leads || [];
                leads.forEach(lead => {
                    if (lead.unreadCount === undefined) lead.unreadCount = 0;
                    if (lead.botActive === undefined) lead.botActive = true;
                });
                caixa = data.caixa || [];
                estoque = data.estoque || [];
                // Carregar outros dados como mentoria, chat, etc.
                mentoriaNotes = data.mentoriaNotes || {};
                chatHistory = data.chatHistory || {};
            }
            updateAllUI(); // Agora isso vai renderizar tudo
        } catch (error) {
            console.error("Erro Crítico ao carregar dados do usuário:", error);
        }
    }

    async function saveAllUserData(userId, showConfirmation = false) {
        try {
            const dataToSave = { leads, caixa, estoque, mentoriaNotes, chatHistory };
            await db.collection('userData').doc(userId).set(dataToSave, { merge: true });
            if (showConfirmation) {
                alert('Dados salvos com sucesso!');
            }
        } catch (error) {
            console.error("Erro ao salvar dados:", error);
        }
    }

    // --- 4. FUNÇÃO CENTRAL DE ATUALIZAÇÃO DA UI ---
    function updateAllUI() {
        updateDashboard();
        renderKanbanCards();
        renderLeadsTable();
        renderCaixaTable();
        updateCaixa();
        renderEstoqueTable();
    }

    // --- 5. FUNÇÕES DE RENDERIZAÇÃO ESPECÍFICAS (COMPLETAS) ---
    function updateDashboard() {
        const dashboardElement = document.getElementById('dashboard-section');
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
        if (tbody) {
            tbody.innerHTML = leads.map(l => {
                const badgeHtml = l.unreadCount > 0 ? `<span class="notification-badge">${l.unreadCount}</span>` : '';
                return `<tr data-id="${l.id}"><td>${l.nome} ${badgeHtml}</td><td>${l.whatsapp}</td><td>${l.status}</td><td><button class="btn-table-action btn-open-lead">Abrir</button></td></tr>`;
            }).join('');
        }
    }
    
    function renderCaixaTable() {
        const tbody = document.querySelector('#caixa-table tbody');
        if (tbody) {
            tbody.innerHTML = caixa.map(m => `<tr><td>${m.data}</td><td>${m.descricao}</td><td>R$ ${parseFloat(m.valor).toFixed(2)}</td><td>${m.tipo}</td><td><button class="btn-delete-item">Excluir</button></td></tr>`).join('');
        }
    }

    function updateCaixa() {
        const entradas = caixa.filter(m => m.tipo === 'entrada').reduce((acc, cur) => acc + parseFloat(cur.valor), 0);
        const saidas = caixa.filter(m => m.tipo === 'saida').reduce((acc, cur) => acc + parseFloat(cur.valor), 0);
        document.getElementById('total-entradas').textContent = `R$ ${entradas.toFixed(2)}`;
        document.getElementById('total-saidas').textContent = `R$ ${saidas.toFixed(2)}`;
        document.getElementById('caixa-atual').textContent = `R$ ${(entradas - saidas).toFixed(2)}`;
    }

    function renderEstoqueTable() {
        const tbody = document.querySelector('#estoque-table tbody');
        if (tbody) {
            tbody.innerHTML = estoque.map(p => `<tr><td>${p.produto}</td><td>R$ ${p.compra.toFixed(2)}</td><td>R$ ${p.venda.toFixed(2)}</td><td>...</td></tr>`).join('');
        }
    }

    // --- 6. FUNÇÕES DE INTERAÇÃO E MODAIS ---
    async function openLeadModal(leadId) {
        const userId = firebase.auth().currentUser.uid;
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;

        if (lead.unreadCount > 0) {
            lead.unreadCount = 0;
            await saveAllUserData(userId);
            updateAllUI();
        }
        
        updateBotButton(lead.botActive);
        document.getElementById('lead-modal-title').textContent = `Conversa com ${lead.nome}`;
        
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
            btn.className = isBotActive ? 'btn-secondary' : 'btn-save';
        }
    }

    // --- 7. SETUP DE EVENT LISTENERS (COMPLETO) ---
    function setupEventListeners(userId) {
        // Navegação principal do Sidebar
        document.querySelectorAll('.sidebar-nav .nav-item:not(#logout-btn)').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                const targetId = e.currentTarget.dataset.target;
                document.querySelectorAll('.sidebar-nav .nav-item, .content-area').forEach(el => el.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.classList.add('active');
                }
                document.getElementById('page-title').textContent = e.currentTarget.querySelector('span').textContent;
                // Atualiza o dashboard se ele for selecionado
                if (targetId === 'dashboard-section') {
                    updateDashboard();
                }
            });
        });

        // Navegação das abas do Financeiro
        document.querySelectorAll('.finance-tab').forEach(tab => {
            tab.addEventListener('click', e => {
                e.preventDefault();
                document.querySelectorAll('.finance-tab, .finance-content').forEach(el => el.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.getElementById(e.currentTarget.dataset.tab + '-tab-content').classList.add('active');
            });
        });
        
        // Abrir Modal de Lead (Kanban e Lista)
        document.body.addEventListener('click', e => {
            if (e.target.closest('.kanban-card')) {
                openLeadModal(parseInt(e.target.closest('.kanban-card').dataset.id, 10));
            }
            if (e.target.closest('.btn-open-lead')) {
                openLeadModal(parseInt(e.target.closest('tr').dataset.id, 10));
            }
        });
        
        // Fechar Modais (Botão X e tecla ESC)
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', e => {
                e.target.closest('.modal-overlay').style.display = 'none';
                if (unsubscribeChat) { unsubscribeChat(); unsubscribeChat = null; }
            });
        });

        window.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay').forEach(modal => {
                    modal.style.display = 'none';
                });
                if (unsubscribeChat) { unsubscribeChat(); unsubscribeChat = null; }
            }
        });

        // Botão Ativar/Desativar Bot
        document.getElementById('toggle-bot-btn')?.addEventListener('click', async () => {
            const leadIndex = leads.findIndex(l => l.id === currentLeadId);
            if (leadIndex > -1) {
                leads[leadIndex].botActive = !leads[leadIndex].botActive;
                await saveAllUserData(userId);
                updateBotButton(leads[leadIndex].botActive);
                alert(`Bot ${leads[leadIndex].botActive ? 'ATIVADO' : 'DESATIVADO'} para este lead.`);
            }
        });
    }

    // --- 8. EXECUÇÃO INICIAL ---
    main();
});
