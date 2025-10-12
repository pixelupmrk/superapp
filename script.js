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
            // ... (resto da função original)
        } catch(e) { console.error("Falha ao carregar mentoria", e); }
    }
    
    function getMentoriaNotes() { /* ... */ }
    function loadMentoriaNotes() { /* ... */ }

    // --- 6. MODAIS E INTERAÇÕES ---
    async function openLeadModal(leadId) {
        // ... (lógica original do modal)
    }

    function updateBotButton(isBotActive) {
        // ... (lógica original do botão)
    }

    // --- 7. EVENT LISTENERS ---
    function setupEventListeners(userId) {
        // ... (todos os listeners originais)
    }

    // --- 8. EXECUÇÃO ---
    main();
});
