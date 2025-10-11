document.addEventListener('DOMContentLoaded', () => {
    // --- DECLARAÇÃO DE VARIÁVEIS GLOBAIS ---
    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let statusChart, db, unsubscribeChat;
    let currentLeadId = null;

    // --- FUNÇÃO PRINCIPAL (INICIALIZAÇÃO) ---
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

    // --- LÓGICA DE DADOS (CARREGAR E SALVAR) ---
    async function loadAllUserData(userId) {
        const doc = await db.collection('userData').doc(userId).get();
        if (doc.exists) {
            const data = doc.data();
            leads = data.leads || [];
            // Garante que cada lead tenha as novas propriedades
            leads.forEach(lead => {
                if (lead.unreadCount === undefined) lead.unreadCount = 0;
                if (lead.botActive === undefined) lead.botActive = true;
            });
            caixa = data.caixa || [];
            estoque = data.estoque || [];
            // ... resto do carregamento
        }
        updateAllUI();
    }

    async function saveAllUserData(userId) {
        const dataToSave = { leads, caixa, estoque /* ... etc */ };
        await db.collection('userData').doc(userId).set(dataToSave, { merge: true });
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO E ATUALIZAÇÃO DA UI ---
    function updateAllUI() {
        renderKanbanCards();
        renderLeadsTable();
        // ... outras atualizações
    }

    function renderKanbanCards() {
        document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = '');
        leads.forEach(lead => {
            const column = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (column) {
                // Cria o badge de notificação se houver mensagens não lidas
                const badgeHtml = lead.unreadCount > 0 ? `<span class="notification-badge">${lead.unreadCount}</span>` : '';
                column.innerHTML += `
                    <div class="kanban-card" draggable="true" data-id="${lead.id}">
                        <div>
                            <strong>${lead.nome}</strong>
                            <p>${lead.whatsapp}</p>
                        </div>
                        ${badgeHtml}
                    </div>`;
            }
        });
    }

    function renderLeadsTable() {
        const tbody = document.querySelector('#leads-table tbody');
        if (tbody) {
            tbody.innerHTML = leads.map(l => {
                const badgeHtml = l.unreadCount > 0 ? `<span class="notification-badge">${l.unreadCount}</span>` : '';
                return `<tr data-id="${l.id}">
                    <td>${l.nome} ${badgeHtml}</td>
                    <td>${l.whatsapp}</td>
                    <td>${l.status}</td>
                    <td><button class="btn-table-action btn-open-lead">Abrir</button></td>
                </tr>`;
            }).join('');
        }
    }

    // --- FUNÇÕES DE INTERAÇÃO E MODAIS ---
    async function openLeadModal(leadId) {
        const userId = firebase.auth().currentUser.uid;
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;

        // Zera as notificações ao abrir o chat
        if (lead.unreadCount > 0) {
            lead.unreadCount = 0;
            await saveAllUserData(userId);
            updateAllUI(); // Atualiza a UI para remover a bolinha
        }
        
        updateBotButton(lead.botActive); // Atualiza o estado do botão

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
                    // **CORREÇÃO DO LAYOUT DO CHAT**
                    // Usa .innerHTML para renderizar formatação como negrito
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
            if (isBotActive) {
                btn.textContent = 'Desativar Bot';
                btn.classList.remove('btn-delete');
                btn.classList.add('btn-secondary');
            } else {
                btn.textContent = 'Ativar Bot';
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-save'); // Estilo mais positivo para ativar
            }
        }
    }

    // --- SETUP DE EVENT LISTENERS ---
    function setupEventListeners(userId) {
        // Abrir Modal de Lead
        document.body.addEventListener('click', e => {
            const kanbanCard = e.target.closest('.kanban-card');
            const openLeadButton = e.target.closest('.btn-open-lead');
            if (kanbanCard) openLeadModal(parseInt(kanbanCard.dataset.id, 10));
            if (openLeadButton) openLeadModal(parseInt(openLeadButton.closest('tr').dataset.id, 10));
        });

        // Fechar modal com a tecla ESC
        window.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                const leadModal = document.getElementById('lead-modal');
                if (leadModal.style.display === 'flex') {
                    leadModal.style.display = 'none';
                    if (unsubscribeChat) { unsubscribeChat(); unsubscribeChat = null; }
                }
            }
        });

        // **FUNCIONALIDADE DO BOTÃO ATIVAR/DESATIVAR**
        document.getElementById('toggle-bot-btn')?.addEventListener('click', async () => {
            const leadIndex = leads.findIndex(l => l.id === currentLeadId);
            if (leadIndex > -1) {
                // Inverte o valor: se era true, vira false; se era false, vira true.
                leads[leadIndex].botActive = !leads[leadIndex].botActive;
                
                await saveAllUserData(userId);
                updateBotButton(leads[leadIndex].botActive);
                
                alert(`Bot ${leads[leadIndex].botActive ? 'ATIVADO' : 'DESATIVADO'} para este lead.`);
            }
        });

        // Outros event listeners (navegação, formulários, etc.)
        // ... (o restante do seu código de setupEventListeners)
    }

    main();
});
