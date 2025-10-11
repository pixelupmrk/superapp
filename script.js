document.addEventListener('DOMContentLoaded', () => {
    // --- 1. VARIÁVEIS GLOBAIS ---
    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let statusChart, db, unsubscribeChat;
    let currentLeadId = null;

    // --- 2. INICIALIZAÇÃO ---
    const main = () => {
        firebase.auth().onAuthStateChanged(async user => {
            if (user && !document.body.dataset.initialized) {
                document.body.setAttribute('data-initialized', 'true');
                db = firebase.firestore();
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
                loadMentoriaContent(); // Carrega conteúdo da mentoria
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
                leads.forEach(l => {
                    if (l.id === undefined) l.id = Date.now() + Math.random();
                    if (l.unreadCount === undefined) l.unreadCount = 0;
                    if (l.botActive === undefined) l.botActive = true;
                });
                caixa = data.caixa || [];
                estoque = data.estoque || [];
                mentoriaNotes = data.mentoriaNotes || {};
                chatHistory = data.chatHistory || [];
            }
            updateAllUI();
        } catch (error) { console.error("Erro ao carregar dados:", error); }
    }

    async function saveAllUserData(userId, showConfirmation = false) {
        try {
            const dataToSave = { leads, caixa, estoque, mentoriaNotes, chatHistory };
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
        const activeSection = document.querySelector('.content-area.active');
        if (!activeSection || activeSection.id !== 'dashboard-section') return;
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
        const listContainers = document.querySelectorAll('.kanban-cards-list');
        if (listContainers.length === 0) return;
        listContainers.forEach(l => l.innerHTML = '');
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

    function renderCaixaTable() {
        const tbody = document.querySelector('#caixa-table tbody');
        if (!tbody) return;
        tbody.innerHTML = caixa.map(m => `<tr><td>${m.data}</td><td>${m.descricao}</td><td>R$ ${parseFloat(m.valor).toFixed(2)}</td><td>${m.tipo}</td><td><button class="btn-delete-item">Excluir</button></td></tr>`).join('');
    }

    function updateCaixa() {
        const totalEntradasEl = document.getElementById('total-entradas');
        if (!totalEntradasEl) return;
        const entradas = caixa.filter(m => m.tipo === 'entrada').reduce((acc, cur) => acc + parseFloat(cur.valor), 0);
        const saidas = caixa.filter(m => m.tipo === 'saida').reduce((acc, cur) => acc + parseFloat(cur.valor), 0);
        totalEntradasEl.textContent = `R$ ${entradas.toFixed(2)}`;
        document.getElementById('total-saidas').textContent = `R$ ${saidas.toFixed(2)}`;
        document.getElementById('caixa-atual').textContent = `R$ ${(entradas - saidas).toFixed(2)}`;
    }

    function renderEstoqueTable() {
        const tbody = document.querySelector('#estoque-table tbody');
        if (!tbody) return;
        tbody.innerHTML = estoque.map(p => `<tr><td>${p.produto}</td><td>R$ ${p.compra.toFixed(2)}</td><td>R$ ${p.venda.toFixed(2)}</td><td>...</td></tr>`).join('');
    }

    async function loadMentoriaContent() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            const menu = document.getElementById('mentoria-menu');
            const content = document.getElementById('mentoria-content');
            if (!menu || !content) return;
            menu.innerHTML = data.mentoria.map(mod => `<div class="sales-accelerator-menu-item" data-module-id="${mod.moduleId}">${mod.title}</div>`).join('');
            content.innerHTML = data.mentoria.map(mod => `<div class="mentoria-module-content" id="${mod.moduleId}">${mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content.replace(/\n/g, '<br>')}</p></div>`).join('')}</div>`).join('');
            
            // Ativar primeiro item e adicionar listeners
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
        } catch(e) { console.error("Falha ao carregar mentoria", e); }
    }

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
            btn.className = `btn-${isBotActive ? 'secondary' : 'save'}`;
        }
    }

    // --- 7. EVENT LISTENERS ---
    function setupEventListeners(userId) {
        // Navegação Sidebar
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
                const leadId = card.closest('[data-id]').dataset.id;
                openLeadModal(parseInt(leadId, 10));
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

        // Botão Ativar/Desativar Bot
        document.getElementById('toggle-bot-btn')?.addEventListener('click', async () => {
            const lead = leads.find(l => l.id === currentLeadId);
            if (lead) {
                lead.botActive = !lead.botActive;
                await saveAllUserData(userId);
                updateBotButton(lead.botActive);
                alert(`Bot ${lead.botActive ? 'ATIVADO' : 'DESATIVADO'}.`);
            }
        });

        // Botão de Tema
        document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
        });
    }

    // --- 8. EXECUÇÃO ---
    main();
});
