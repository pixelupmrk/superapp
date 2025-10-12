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
                await loadMentoriaContent();
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
                    if (lead.botActive === undefined) lead.botActive = true;
                });
                caixa = data.caixa || [];
                estoque = data.estoque || [];
                chatHistory = data.chatHistory || [];
                mentoriaNotes = data.mentoriaNotes || {};
                document.getElementById('setting-user-name').value = data.settings?.userName || '';
            }
            updateAllUI();
        } catch (error) { console.error("Erro ao carregar dados:", error); }
    }

    async function saveAllUserData(userId, showConfirmation = false) {
        try {
            getMentoriaNotes();
            const dataToSave = { 
                leads, caixa, estoque, chatHistory, mentoriaNotes,
                settings: { userName: document.getElementById('setting-user-name').value } 
            };
            await db.collection('userData').doc(userId).set(dataToSave, { merge: true });
            if (showConfirmation) alert('Dados salvos!');
        } catch (error) { console.error("Erro ao salvar dados:", error); }
    }

    // --- 4. ATUALIZAÇÃO DA UI (COMPLETA) ---
    function updateAllUI() {
        updateDashboard();
        renderKanbanCards();
        renderLeadsTable();
        renderCaixaTable();
        updateCaixa();
        renderEstoqueTable();
    }

    // --- 5. FUNÇÕES DE RENDERIZAÇÃO (RESTAURADAS) ---
    function updateDashboard() {
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
                column.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${lead.whatsapp}</p></div>`;
            }
        });
    }

    function renderLeadsTable() {
        const tbody = document.querySelector('#leads-table tbody');
        if (!tbody) return;
        tbody.innerHTML = leads.map(l => `<tr data-id="${l.id}"><td>${l.nome}</td><td>${l.whatsapp}</td><td>${l.status}</td><td><button class="btn-table-action btn-open-lead">Abrir</button></td></tr>`).join('');
    }

    function renderCaixaTable() { /* Adicionar lógica se necessário */ }
    function updateCaixa() { /* Adicionar lógica se necessário */ }
    function renderEstoqueTable() { /* Adicionar lógica se necessário */ }

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
        document.body.classList.add('modal-open'); // Trava o scroll do fundo
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;
        const userId = firebase.auth().currentUser.uid;

        document.querySelectorAll('#lead-modal .modal-tab, #lead-modal .modal-tab-content').forEach(el => el.classList.remove('active'));
        document.querySelector('.modal-tab[data-tab-target="#chat-tab-content"]').classList.add('active');
        document.querySelector('#chat-tab-content').classList.add('active');

        document.getElementById('lead-modal-title').textContent = `Conversa com ${lead.nome}`;
        document.getElementById('edit-lead-name').value = lead.nome || '';
        document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
        document.getElementById('edit-lead-status').value = lead.status;
        document.getElementById('lead-notes').value = lead.notes || '';
        
        const chatHistoryDiv = document.getElementById('lead-chat-history');
        if (unsubscribeChat) unsubscribeChat();

        unsubscribeChat = db.collection('userData').doc(userId).collection('leads').doc(String(leadId))
            .collection('messages').orderBy('timestamp').onSnapshot(snapshot => {
                if (!snapshot.metadata.hasPendingWrites) {
                    chatHistoryDiv.innerHTML = snapshot.empty ? '<p>Inicie a conversa!</p>' : '';
                    snapshot.forEach(doc => {
                        const msg = doc.data();
                        const bubble = document.createElement('div');
                        bubble.className = `msg-bubble msg-from-${msg.sender}`;
                        bubble.innerHTML = msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
                        chatHistoryDiv.appendChild(bubble);
                    });
                    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
                }
            }, error => {
                console.error("Erro ao carregar mensagens:", error);
                chatHistoryDiv.innerHTML = '<p style="color:red;">Não foi possível carregar o chat.</p>';
            });
        
        document.getElementById('lead-modal').style.display = 'flex';
    }

    // --- 7. EVENT LISTENERS ---
    function setupEventListeners(userId) {
        document.querySelectorAll('.sidebar-nav .nav-item:not(#logout-btn)').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                const targetId = e.currentTarget.dataset.target;
                document.querySelectorAll('.sidebar-nav .nav-item, .content-area').forEach(el => el.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.getElementById(targetId)?.classList.add('active');
            });
        });
        
        document.querySelectorAll('.modal-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const modal = tab.closest('.modal-content');
                const target = modal.querySelector(tab.dataset.tabTarget);
                modal.querySelectorAll('.modal-tab, .modal-tab-content').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                target.classList.add('active');
            });
        });
        
        document.body.addEventListener('click', e => {
            const card = e.target.closest('.kanban-card, .btn-open-lead');
            if (card) {
                const leadIdStr = card.closest('[data-id]').dataset.id;
                openLeadModal(parseFloat(leadIdStr));
            }
        });
        
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', e => {
                e.target.closest('.modal-overlay').style.display = 'none';
                document.body.classList.remove('modal-open'); // Libera o scroll
                if (unsubscribeChat) { unsubscribeChat(); unsubscribeChat = null; }
            });
        });

        document.getElementById('lead-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newLead = {
                id: Date.now(),
                nome: document.getElementById('lead-name').value,
                whatsapp: document.getElementById('lead-whatsapp').value,
                status: document.getElementById('lead-status-form').value,
                botActive: true,
                notes: ''
            };
            leads.push(newLead);
            await saveAllUserData(userId);
            updateAllUI();
            e.target.reset();
        });

        document.getElementById('edit-lead-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const leadIndex = leads.findIndex(l => l.id === currentLeadId);
            if (leadIndex > -1) {
                leads[leadIndex].nome = document.getElementById('edit-lead-name').value;
                leads[leadIndex].whatsapp = document.getElementById('edit-lead-whatsapp').value;
                leads[leadIndex].status = document.getElementById('edit-lead-status').value;
                leads[leadIndex].notes = document.getElementById('lead-notes').value;
                await saveAllUserData(userId);
                updateAllUI();
                alert('Lead salvo com sucesso!');
            }
        });

        document.getElementById('lead-chat-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('lead-chat-input');
            const text = input.value.trim();
            if (!text || !currentLeadId) return;

            const message = {
                sender: 'operator',
                text: text,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

            try {
                await db.collection('userData').doc(userId).collection('leads').doc(String(currentLeadId)).collection('messages').add(message);
                input.value = '';
            } catch (error) {
                console.error("ERRO AO ENVIAR MENSAGEM:", error);
                alert('Falha ao enviar mensagem! Verifique o console (F12).');
            }
        });

        document.getElementById('menu-toggle')?.addEventListener('click', () => {
            document.querySelector('.app-container').classList.toggle('sidebar-visible');
        });
    }

    // --- 8. EXECUÇÃO ---
    main();
});
