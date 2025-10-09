document.addEventListener('DOMContentLoaded', () => {
    // 🔧 Variáveis globais
    let leads = [];
    let db;
    let unsubscribeLeads;
    let unsubscribeLeadChat;
    let currentUserId;
    let currentLeadId = null;
    let botUrl = null; // 🔧 Armazenar botUrl globalmente

    // 🔧 Verificação de Firebase antes de iniciar
    if (typeof firebase === 'undefined') {
        console.error("❌ Firebase não carregado!");
        return;
    }

    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                currentUserId = user.uid;
                db = firebase.firestore();
                await loadInitialData(currentUserId);
                setupEventListeners(currentUserId);
                setupRealtimeListeners(currentUserId);
            }
        });
    }
    main();

    // 🔧 Escuta em tempo real dos leads
    function setupRealtimeListeners(userId) {
        if (unsubscribeLeads) unsubscribeLeads();

        unsubscribeLeads = db.collection('users').doc(userId).collection('leads')
            .onSnapshot(snapshot => {
                leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("📡 Leads atualizados em tempo real:", leads);
                updateAllUI();
            }, error => {
                console.error("Erro ao ouvir os leads:", error);
            });
    }

    // 🔧 Carrega informações iniciais, como o bot URL
    async function loadInitialData(userId) {
        try {
            const doc = await db.collection('users').doc(userId).get();
            if (doc.exists) {
                const data = doc.data();
                if (data.botUrl) {
                    botUrl = data.botUrl; // 🔧 Guardar globalmente
                    const frame = document.getElementById('bot-qr-frame');
                    const placeholder = document.getElementById('bot-url-placeholder');
                    if (frame && placeholder) {
                        frame.src = data.botUrl;
                        frame.style.display = 'block';
                        placeholder.style.display = 'none';
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao carregar dados iniciais:", error);
        }
    }
    
    // 🔧 Atualiza todos os elementos de UI
    function updateAllUI() {
        renderKanbanCards();
        renderLeadsTable();
    }

    // 🔧 Renderização otimizada do Kanban
    function renderKanbanCards() {
        const lists = document.querySelectorAll('.kanban-cards-list');
        lists.forEach(list => list.innerHTML = '');

        leads.forEach(lead => {
            const column = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (!column) return;
            const card = document.createElement('div');
            card.className = 'kanban-card';
            card.draggable = true;
            card.dataset.id = lead.id;
            card.innerHTML = `<strong>${lead.nome}</strong><p>${lead.whatsapp}</p>`;
            column.appendChild(card);
        });
    }

    // 🔧 Renderiza tabela de leads
    function renderLeadsTable() {
        const tbody = document.querySelector('#leads-table tbody');
        if (!tbody) return;
        tbody.innerHTML = leads.map(l => 
            `<tr data-id="${l.id}">
                <td>${l.nome}</td>
                <td>${l.whatsapp}</td>
                <td>${l.origem}</td>
                <td>${l.qualificacao}</td>
                <td>${l.status}</td>
                <td><button class="btn-edit-table">Abrir</button></td>
            </tr>`
        ).join('');
    }

    // 🔧 Configura todos os listeners de interface
    function setupEventListeners(userId) {
        // Navegação lateral
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', e => {
                if (e.currentTarget.id === 'logout-btn') return;
                e.preventDefault();
                const targetId = e.currentTarget.getAttribute('data-target');
                if (!targetId) return;
                
                document.querySelectorAll('.main-content .content-area').forEach(area => area.style.display = 'none');
                document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => nav.classList.remove('active'));
                
                e.currentTarget.classList.add('active');
                const targetElement = document.getElementById(targetId);
                if (targetElement) targetElement.style.display = 'block';
                
                const pageTitle = document.getElementById('page-title');
                if(pageTitle && e.currentTarget.querySelector('span')) {
                    pageTitle.textContent = e.currentTarget.querySelector('span').textContent;
                }
            });
        });

        // Abertura do modal pelo Kanban
        const kanbanBoard = document.getElementById('kanban-board');
        if (kanbanBoard) {
            kanbanBoard.addEventListener('click', e => {
                const card = e.target.closest('.kanban-card');
                if (card && card.dataset.id) openEditModal(card.dataset.id);
            });
        }

        // Abertura do modal pela tabela
        document.getElementById('leads-table')?.addEventListener('click', e => {
            if (e.target.closest('.btn-edit-table')) {
                const row = e.target.closest('tr');
                if (row && row.dataset.id) openEditModal(row.dataset.id);
            }
        });

        // Fechar modais
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetModal = document.getElementById(btn.dataset.target);
                if(targetModal) targetModal.style.display = 'none';
                if (btn.dataset.target === 'edit-lead-modal' && unsubscribeLeadChat) {
                    unsubscribeLeadChat();
                    unsubscribeLeadChat = null;
                }
            });
        });

        // Envio de mensagens no chat do lead
        document.getElementById('lead-chat-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('lead-chat-input');
            const messageText = input.value.trim();
            const lead = leads.find(l => l.id === currentLeadId);

            if (!messageText || !lead || !botUrl) {
                alert("Preencha a mensagem e verifique se o bot está conectado.");
                return;
            }

            input.disabled = true;
            e.target.querySelector('button').disabled = true;

            try {
                const response = await fetch(`${botUrl}/send-message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ number: lead.whatsapp, message: messageText, leadId: currentLeadId })
                });
                if (!response.ok) throw new Error('Falha ao enviar mensagem pelo servidor do bot.');
                input.value = '';
            } catch (error) {
                console.error("Erro ao enviar mensagem:", error);
                alert("Não foi possível enviar a mensagem. Verifique o bot.");
            } finally {
                input.disabled = false;
                e.target.querySelector('button').disabled = false;
                input.focus();
            }
        });

        // Atualização do lead
        document.getElementById('edit-lead-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentLeadId) return;
            const updatedData = {
                nome: document.getElementById('edit-lead-name').value,
                email: document.getElementById('edit-lead-email').value,
                status: document.getElementById('edit-lead-status').value,
                origem: document.getElementById('edit-lead-origem').value,
                qualificacao: document.getElementById('edit-lead-qualification').value,
                notas: document.getElementById('edit-lead-notes').value
            };
            try {
                await db.collection('users').doc(userId).collection('leads').doc(currentLeadId).update(updatedData);
                alert('✅ Lead atualizado com sucesso!');
            } catch (error) {
                console.error("Erro ao atualizar lead:", error);
                alert("Falha ao atualizar lead.");
            }
        });
    }

    // 🔧 Abre modal de edição e histórico de chat
    async function openEditModal(leadId) {
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) {
            console.error("Lead não encontrado com o ID:", leadId);
            return;
        }

        if (!document.getElementById('edit-lead-modal')) return;

        document.getElementById('edit-lead-name').value = lead.nome || '';
        document.getElementById('edit-lead-email').value = lead.email || '';
        document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
        document.getElementById('edit-lead-status').value = lead.status || 'novo';
        document.getElementById('edit-lead-origem').value = lead.origem || '';
        document.getElementById('edit-lead-qualification').value = lead.qualificacao || '';
        document.getElementById('edit-lead-notes').value = lead.notas || '';
        document.getElementById('lead-chat-title').textContent = `Conversa com ${lead.nome}`;
        document.getElementById('edit-lead-modal').style.display = 'flex';

        const chatHistoryDiv = document.getElementById('lead-chat-history');
        chatHistoryDiv.innerHTML = '<p>Carregando histórico...</p>';

        if (unsubscribeLeadChat) unsubscribeLeadChat();
        
        const messagesRef = db.collection('users').doc(currentUserId)
            .collection('leads').doc(leadId)
            .collection('messages').orderBy('timestamp');

        unsubscribeLeadChat = messagesRef.onSnapshot(snapshot => {
            chatHistoryDiv.innerHTML = '';
            if (snapshot.empty) {
                chatHistoryDiv.innerHTML = '<p>Nenhuma mensagem nesta conversa ainda.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const msg = doc.data();
                if (msg.text) renderChatMessage(msg.sender, msg.text);
            });
            chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
        }, error => {
            console.error("Erro ao ouvir o chat:", error);
            chatHistoryDiv.innerHTML = `<p style="color:red;">Erro ao carregar o histórico: ${error.message}</p>`;
        });
    }

    // 🔧 Renderiza mensagens no chat
    function renderChatMessage(sender, text) {
        const chatHistoryDiv = document.getElementById('lead-chat-history');
        if (!chatHistoryDiv) return;
        const bubble = document.createElement('div');
        bubble.classList.add('msg-bubble', sender === 'user' ? 'msg-user' : 'msg-operator');
        bubble.textContent = text;
        chatHistoryDiv.appendChild(bubble);
    }
});
