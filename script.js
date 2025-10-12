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
                    if (!lead.id) lead.id = Date.now() + Math.random();
                    if (lead.botActive === undefined) lead.botActive = true;
                });
                // ... (outros dados)
            }
            updateAllUI();
        } catch (error) { console.error("Erro ao carregar dados:", error); }
    }

    async function saveAllUserData(userId, showConfirmation = false) {
        try {
            const dataToSave = { 
                leads, // ... (outros dados)
            };
            await db.collection('userData').doc(userId).set(dataToSave, { merge: true });
            if (showConfirmation) alert('Dados salvos!');
        } catch (error) { console.error("Erro ao salvar dados:", error); }
    }

    // --- 4. ATUALIZAÇÃO DA UI ---
    function updateAllUI() {
        renderKanbanCards();
        // ... (outras funções de renderização)
    }

    // --- 5. FUNÇÕES DE RENDERIZAÇÃO ---
    function renderKanbanCards() {
        document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = '');
        leads.forEach(lead => {
            const column = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (column) {
                column.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${lead.whatsapp}</p></div>`;
            }
        });
    }

    // (outras funções de renderização aqui...)

    // --- 6. MODAIS E INTERAÇÕES (VERSÃO COM ABAS) ---
    async function openLeadModal(leadId) {
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;
        const userId = firebase.auth().currentUser.uid;

        // Resetar para a aba de conversa como padrão
        document.querySelectorAll('.modal-tab, .modal-tab-content').forEach(el => el.classList.remove('active'));
        document.querySelector('.modal-tab[data-tab-target="#chat-tab-content"]').classList.add('active');
        document.querySelector('#chat-tab-content').classList.add('active');

        // Preencher informações
        document.getElementById('lead-modal-title').textContent = `Conversa com ${lead.nome}`;
        document.getElementById('edit-lead-name').value = lead.nome || '';
        document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
        document.getElementById('edit-lead-status').value = lead.status;
        document.getElementById('lead-notes').value = lead.notes || ''; // Carrega anotações
        
        const chatHistoryDiv = document.getElementById('lead-chat-history');
        if (unsubscribeChat) unsubscribeChat();

        unsubscribeChat = db.collection('userData').doc(userId).collection('leads').doc(String(leadId))
            .collection('messages').orderBy('timestamp').onSnapshot(snapshot => {
                chatHistoryDiv.innerHTML = snapshot.empty ? '<p>Inicie a conversa!</p>' : '';
                snapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        const msg = change.doc.data();
                        const bubble = document.createElement('div');
                        bubble.className = `msg-bubble msg-from-${msg.sender}`;
                        bubble.innerHTML = msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
                        chatHistoryDiv.appendChild(bubble);
                    }
                });
                chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
            }, error => {
                console.error("Erro ao carregar mensagens:", error);
                chatHistoryDiv.innerHTML = '<p style="color:red;">Não foi possível carregar o chat.</p>';
            });
        
        document.getElementById('lead-modal').style.display = 'flex';
    }

    // --- 7. EVENT LISTENERS ---
    function setupEventListeners(userId) {
        // Navegação principal
        document.querySelectorAll('.sidebar-nav .nav-item:not(#logout-btn)').forEach(item => {
            item.addEventListener('click', e => { /* ... (código existente) ... */ });
        });
        
        // ** NOVA LÓGICA PARA AS ABAS DO MODAL **
        document.querySelectorAll('.modal-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const target = document.querySelector(tab.dataset.tabTarget);
                // Remove 'active' de todas as abas e conteúdos do modal
                document.querySelectorAll('.modal-tab, .modal-tab-content').forEach(el => {
                    el.classList.remove('active');
                });
                // Adiciona 'active' à aba clicada e ao seu conteúdo correspondente
                tab.classList.add('active');
                target.classList.add('active');
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
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', e => {
                e.target.closest('.modal-overlay').style.display = 'none';
                if (unsubscribeChat) { unsubscribeChat(); unsubscribeChat = null; }
            });
        });

        // Adicionar novo Lead
        document.getElementById('lead-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newLead = {
                id: Date.now(),
                nome: document.getElementById('lead-name').value,
                whatsapp: document.getElementById('lead-whatsapp').value,
                status: document.getElementById('lead-status-form').value,
                botActive: true,
                notes: '' // Campo de anotações inicia vazio
            };
            leads.push(newLead);
            await saveAllUserData(userId);
            updateAllUI();
            e.target.reset();
        });

        // Salvar detalhes do lead (aba de anotações)
        document.getElementById('edit-lead-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const leadIndex = leads.findIndex(l => l.id === currentLeadId);
            if (leadIndex > -1) {
                leads[leadIndex].nome = document.getElementById('edit-lead-name').value;
                leads[leadIndex].whatsapp = document.getElementById('edit-lead-whatsapp').value;
                leads[leadIndex].status = document.getElementById('edit-lead-status').value;
                leads[leadIndex].notes = document.getElementById('lead-notes').value; // Salva as anotações
                await saveAllUserData(userId);
                updateAllUI();
                alert('Lead salvo com sucesso!');
            }
        });

        // Chat do Lead
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

        // Menu responsivo
        document.getElementById('menu-toggle')?.addEventListener('click', () => {
            document.querySelector('.app-container').classList.toggle('sidebar-visible');
        });

        // ... (resto dos seus event listeners: chatbot, bot, etc.)
    }

    main();
});
