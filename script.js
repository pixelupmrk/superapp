document.addEventListener('DOMContentLoaded', () => {
    // --- 1. VARIÁVEIS GLOBAIS ---
    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let statusChart, db, unsubscribeChat;
    let currentLeadId = null, draggedItem = null;

    // --- 2. INICIALIZAÇÃO ---
    const main = () => {
        firebase.auth().onAuthStateChanged(async user => {
            if (user && !document.body.dataset.initialized) {
                document.body.setAttribute('data-initialized', 'true');
                db = firebase.firestore();
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
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
                    if (!lead.id) lead.id = Date.now() + Math.random();
                });
            }
            updateAllUI();
        } catch (error) { console.error("Erro ao carregar dados:", error); }
    }

    async function saveAllUserData(userId) {
        try {
            const dataToSave = { leads }; // Adicionar outros dados se necessário
            await db.collection('userData').doc(userId).set(dataToSave, { merge: true });
        } catch (error) { console.error("Erro ao salvar dados:", error); }
    }

    // --- 4. ATUALIZAÇÃO DA UI (COMPLETA) ---
    function updateAllUI() {
        updateDashboard();
        renderKanbanCards();
        renderLeadsTable();
    }

    // --- 5. FUNÇÕES DE RENDERIZAÇÃO ---
    function updateDashboard() {
        if (!document.getElementById('dashboard-section')) return;
        const n = leads.filter(l => l.status === 'novo').length;
        const p = leads.filter(l => l.status === 'progresso').length;
        const f = leads.filter(l => l.status === 'fechado').length;
        document.getElementById('total-leads').textContent = leads.length;
        document.getElementById('leads-novo').textContent = n;
        document.getElementById('leads-progresso').textContent = p;
        document.getElementById('leads-fechado').textContent = f;
    }

    function renderKanbanCards() {
        document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = '');
        leads.forEach(lead => {
            const column = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (column) {
                column.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${lead.whatsapp}</p></div>`;
            }
        });
    }

    function renderLeadsTable() {
        const tbody = document.querySelector('#leads-table tbody');
        if (!tbody) return;
        tbody.innerHTML = leads.map(l => `<tr data-id="${l.id}"><td>${l.nome}</td><td>${l.whatsapp}</td><td>${l.status}</td><td><button class="btn-open-lead">Abrir</button></td></tr>`).join('');
    }

    // --- 6. LÓGICA DO MODAL ---
    function openModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
        document.body.classList.add('modal-open');
    }

    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        document.body.classList.remove('modal-open');
        if (unsubscribeChat) {
            unsubscribeChat();
            unsubscribeChat = null;
        }
    }

    async function openLeadModal(leadId) {
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;
        const userId = firebase.auth().currentUser.uid;

        const modal = document.getElementById('lead-modal');
        modal.querySelectorAll('.modal-tab, .modal-tab-content').forEach(el => el.classList.remove('active'));
        modal.querySelector('.modal-tab[data-tab-target="#chat-tab-content"]').classList.add('active');
        modal.querySelector('#chat-tab-content').classList.add('active');

        modal.querySelector('#lead-modal-title').textContent = `Conversa com ${lead.nome}`;
        modal.querySelector('#edit-lead-name').value = lead.nome || '';
        modal.querySelector('#edit-lead-whatsapp').value = lead.whatsapp || '';
        modal.querySelector('#edit-lead-status').value = lead.status;
        modal.querySelector('#lead-notes').value = lead.notes || '';
        
        const chatHistoryDiv = modal.querySelector('#lead-chat-history');
        if (unsubscribeChat) unsubscribeChat();

        unsubscribeChat = db.collection('userData').doc(userId).collection('leads').doc(String(leadId))
            .collection('messages').orderBy('timestamp').onSnapshot(snapshot => {
                chatHistoryDiv.innerHTML = snapshot.empty ? '<p>Inicie a conversa!</p>' : '';
                snapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        const msg = change.doc.data();
                        const bubble = document.createElement('div');
                        bubble.className = `msg-bubble msg-from-${msg.sender}`;
                        bubble.innerHTML = msg.text.replace(/\n/g, '<br>');
                        chatHistoryDiv.appendChild(bubble);
                    }
                });
                chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
            }, error => {
                console.error("Erro ao carregar mensagens:", error);
                chatHistoryDiv.innerHTML = '<p style="color:red;">Não foi possível carregar o chat.</p>';
            });
        
        openModal('lead-modal');
    }

    // --- 7. EVENT LISTENERS ---
    function setupEventListeners(userId) {
        // Navegação
        document.querySelectorAll('.sidebar-nav .nav-item:not(#logout-btn)').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                document.querySelectorAll('.sidebar-nav .nav-item, .content-area').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                document.getElementById(item.dataset.target)?.classList.add('active');
            });
        });

        // Abas do Modal
        document.querySelectorAll('.modal-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const modal = tab.closest('.modal-content');
                modal.querySelectorAll('.modal-tab, .modal-tab-content').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                modal.querySelector(tab.dataset.tabTarget).classList.add('active');
            });
        });
        
        // Abrir/Fechar Modal
        document.body.addEventListener('click', e => {
            const card = e.target.closest('.kanban-card');
            if (card) {
                openLeadModal(parseFloat(card.dataset.id));
            }
            const closeBtn = e.target.closest('.close-modal');
            if (closeBtn) {
                closeModal(closeBtn.closest('.modal-overlay').id);
            }
        });

        // Adicionar Lead
        document.getElementById('lead-form').addEventListener('submit', async e => {
            e.preventDefault();
            const newLead = {
                id: Date.now(),
                nome: document.getElementById('lead-name').value,
                whatsapp: document.getElementById('lead-whatsapp').value,
                status: document.getElementById('lead-status-form').value,
                notes: ''
            };
            leads.push(newLead);
            await saveAllUserData(userId);
            updateAllUI();
            e.target.reset();
        });

        // Salvar Detalhes do Lead
        document.getElementById('edit-lead-form').addEventListener('submit', async e => {
            e.preventDefault();
            const leadIndex = leads.findIndex(l => l.id === currentLeadId);
            if (leadIndex > -1) {
                leads[leadIndex].nome = document.getElementById('edit-lead-name').value;
                leads[leadIndex].whatsapp = document.getElementById('edit-lead-whatsapp').value;
                leads[leadIndex].status = document.getElementById('edit-lead-status').value;
                leads[leadIndex].notes = document.getElementById('lead-notes').value;
                await saveAllUserData(userId);
                updateAllUI();
                alert('Lead salvo!');
            }
        });

        // Enviar Mensagem no Chat
        document.getElementById('lead-chat-form').addEventListener('submit', async e => {
            e.preventDefault();
            const input = document.getElementById('lead-chat-input');
            const text = input.value.trim();
            if (!text) return;
            const message = {
                sender: 'operator',
                text: text,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
            input.value = '';
            await db.collection('userData').doc(userId).collection('leads').doc(String(currentLeadId)).collection('messages').add(message);
        });
    }

    // --- 8. EXECUÇÃO ---
    main();
});
