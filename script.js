document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DECLARAÇÃO DE VARIÁVEIS GLOBAIS ---
    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let statusChart, db, unsubscribeChat;
    let currentLeadId = null;

    // --- 2. FUNÇÃO PRINCIPAL (INICIALIZAÇÃO) ---
    const main = async () => {
        firebase.auth().onAuthStateChanged(async user => {
            if (user && !document.body.dataset.initialized) {
                document.body.dataset.initialized = 'true';
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
            }
            // Chama a função para desenhar TUDO na tela após carregar os dados
            updateAllUI();
        } catch (error) {
            console.error("Erro Crítico ao carregar dados do usuário:", error);
            alert("Não foi possível carregar os dados. Verifique o console para mais detalhes.");
        }
    }

    async function saveAllUserData(userId) {
        try {
            // Inclua todas as variáveis que precisam ser salvas
            const dataToSave = { leads, caixa, estoque, mentoriaNotes, chatHistory };
            await db.collection('userData').doc(userId).set(dataToSave, { merge: true });
        } catch (error) {
            console.error("Erro ao salvar dados:", error);
        }
    }

    // --- 4. FUNÇÃO CENTRAL DE ATUALIZAÇÃO DA UI (CORRIGIDA) ---
    function updateAllUI() {
        // Comandos que faltavam:
        updateDashboard();
        renderCaixaTable();
        updateCaixa();
        renderEstoqueTable();
        
        // Comandos que já estavam:
        renderKanbanCards();
        renderLeadsTable();
    }

    // --- 5. FUNÇÕES DE RENDERIZAÇÃO ESPECÍFICAS ---
    function updateDashboard() {
        const dashboardElement = document.getElementById('dashboard-section');
        if (!dashboardElement || dashboardElement.style.display === 'none' && !dashboardElement.classList.contains('active')) return;

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

    function renderCaixaTable() { /* Adicione a lógica para renderizar a tabela do caixa */ }
    function updateCaixa() { /* Adicione a lógica para atualizar os totais do caixa */ }
    function renderEstoqueTable() { /* Adicione a lógica para renderizar a tabela de estoque */ }

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

    // --- 7. SETUP DE EVENT LISTENERS ---
    function setupEventListeners(userId) {
        document.body.addEventListener('click', e => {
            const kanbanCard = e.target.closest('.kanban-card');
            if (kanbanCard) openLeadModal(parseInt(kanbanCard.dataset.id, 10));

            const openLeadButton = e.target.closest('.btn-open-lead');
            if (openLeadButton) openLeadModal(parseInt(openLeadButton.closest('tr').dataset.id, 10));
        });

        window.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                const leadModal = document.getElementById('lead-modal');
                if (leadModal && leadModal.style.display === 'flex') {
                    leadModal.style.display = 'none';
                    if (unsubscribeChat) { unsubscribeChat(); unsubscribeChat = null; }
                }
            }
        });

        document.getElementById('toggle-bot-btn')?.addEventListener('click', async () => {
            const leadIndex = leads.findIndex(l => l.id === currentLeadId);
            if (leadIndex > -1) {
                leads[leadIndex].botActive = !leads[leadIndex].botActive;
                await saveAllUserData(userId);
                updateBotButton(leads[leadIndex].botActive);
                alert(`Bot ${leads[leadIndex].botActive ? 'ATIVADO' : 'DESATIVADO'} para este lead.`);
            }
        });
        
        // Adicione aqui outros listeners essenciais que possam estar faltando
    }

    // --- 8. EXECUÇÃO INICIAL ---
    main();
});
