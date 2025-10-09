document.addEventListener('DOMContentLoaded', () => {
    let leads = [], caixa = [], estoque = [], chatHistory = [];
    let nextLeadId = 0, currentLeadId = null, draggedItem = null, currentProductId = null;
    let statusChart;
    let db;
    let unsubscribeLeadChat;

    const BOT_PROMPT_TEMPLATE = `
    Você é um assistente virtual para [NOME_DO_NEGOCIO]. Seu ramo é [RAMO_DO_NEGOCIO].
    Seus principais serviços são: [SERVICOS_OFRECIDOS].
    Sua função é fazer o pré-atendimento de novos clientes via WhatsApp. Seu objetivo é extrair 4 informações: NOME do cliente, ASSUNTO (o serviço que ele deseja), ORÇAMENTO (quanto ele planeja investir) e PRAZO.
    Siga estas regras estritamente:
    1. Seja sempre cordial e prestativo.
    2. Faça uma pergunta de cada vez para não confundir o cliente.
    3. [INSTRUCOES_ESPECIAIS]
    4. Quando você tiver todas as 4 informações, finalize a conversa agradecendo e dizendo que um especialista entrará em contato em breve.
    5. Após finalizar, sua resposta DEVE SER APENAS um objeto JSON válido.
    6. Se você ainda não tem todas as informações, apenas continue a conversa normalmente. NÃO retorne um JSON.`;

    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user && document.getElementById('app-container')) {
                db = firebase.firestore();
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
            }
        });
    }
    main();

    async function loadAllUserData(userId) {
        const doc = await db.collection('userData').doc(userId).get();
        if (doc.exists) {
            const data = doc.data();
            leads = data.leads || [];
            // ... (resto do carregamento de dados)
            if (data.botConfig) {
                document.getElementById('bot-config-negocio').value = data.botConfig.negocio || '';
                document.getElementById('bot-config-servicos').value = data.botConfig.servicos || '';
                document.getElementById('bot-config-instrucoes').value = data.botConfig.instrucoes || '';
            }
            if (data.botUrl) {
                const frame = document.getElementById('bot-qr-frame');
                const placeholder = document.getElementById('bot-url-placeholder');
                frame.src = data.botUrl;
                frame.style.display = 'block';
                placeholder.style.display = 'none';
            }
        }
        updateAllUI();
    }

    async function saveUserData(userId, showSuccessAlert = false) {
        try {
            const negocio = document.getElementById('bot-config-negocio').value;
            const servicos = document.getElementById('bot-config-servicos').value;
            const instrucoes = document.getElementById('bot-config-instrucoes').value;
            let botPrompt = '';
            if (negocio && servicos) {
                botPrompt = BOT_PROMPT_TEMPLATE
                    .replace('[NOME_DO_NEGOCIO]', negocio.split(',')[0].trim())
                    .replace('[RAMO_DO_NEGOCIO]', negocio)
                    .replace('[SERVICOS_OFRECIDOS]', servicos)
                    .replace('[INSTRUCOES_ESPECIAIS]', instrucoes || 'Siga o fluxo normal da conversa.');
            }
            const currentData = (await db.collection('userData').doc(userId).get()).data() || {};
            const dataToSave = {
                leads,
                botConfig: { negocio, servicos, instrucoes },
                botPrompt,
                botUrl: currentData.botUrl || "https://superapp-whatsapp-bot.onrender.com/"
            };
            await db.collection('userData').doc(userId).set(dataToSave, { merge: true });
            if (showSuccessAlert) alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error("ERRO AO SALVAR DADOS:", error);
            alert("Atenção: Não foi possível salvar os dados.");
        }
    }

    function updateAllUI() {
        renderKanbanCards();
        renderLeadsTable();
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
        if (tbody) {
            tbody.innerHTML = leads.map(l => `<tr data-id="${l.id}"><td>${l.nome}</td><td>${l.whatsapp}</td><td>${l.origem}</td><td>${l.qualificacao}</td><td>${l.status}</td><td><button class="btn-edit-table">Abrir</button></td></tr>`).join('');
        }
    }

    function setupEventListeners(userId) {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', e => {
                if (e.currentTarget.id === 'logout-btn') return;
                e.preventDefault();
                const targetId = e.currentTarget.getAttribute('data-target');
                if (!targetId) return;
                document.querySelectorAll('.main-content .content-area, .sidebar-nav .nav-item').forEach(el => el.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.getElementById(targetId).style.display = 'block';
                document.getElementById('page-title').textContent = e.currentTarget.querySelector('span').textContent;
            });
        });

        document.getElementById('save-bot-config-btn')?.addEventListener('click', async () => {
            await saveUserData(userId, true);
            const doc = await db.collection('userData').doc(userId).get();
            if (doc.exists() && doc.data().botUrl) {
                const frame = document.getElementById('bot-qr-frame');
                frame.src = doc.data().botUrl;
                frame.style.display = 'block';
                document.getElementById('bot-url-placeholder').style.display = 'none';
            }
        });

        const kanbanBoard = document.getElementById('kanban-board');
        if (kanbanBoard) {
            kanbanBoard.addEventListener('click', e => {
                const card = e.target.closest('.kanban-card');
                if (card) openEditModal(parseInt(card.dataset.id));
            });
            // ... (drag and drop logic)
        }

        document.getElementById('leads-table')?.addEventListener('click', e => {
            if (e.target.closest('.btn-edit-table')) {
                openEditModal(parseInt(e.target.closest('tr').dataset.id));
            }
        });

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById(btn.dataset.target).style.display = 'none';
                if (btn.dataset.target === 'edit-lead-modal' && unsubscribeLeadChat) {
                    unsubscribeLeadChat();
                    unsubscribeLeadChat = null;
                }
            });
        });

        document.getElementById('lead-chat-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('lead-chat-input');
            const messageText = input.value.trim();
            const lead = leads.find(l => l.id === currentLeadId);
            const userDoc = await db.collection('userData').doc(userId).get();
            const botUrl = userDoc.exists ? userDoc.data().botUrl : null;

            if (!messageText || !lead || !botUrl) return;

            input.disabled = true;
            e.target.querySelector('button').disabled = true;

            try {
                const response = await fetch(`${botUrl}/send-message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        number: lead.whatsapp,
                        message: messageText,
                        leadId: String(currentLeadId)
                    })
                });
                if (!response.ok) throw new Error('Falha ao enviar mensagem.');
                input.value = '';
            } catch (error) {
                console.error("Erro ao enviar mensagem:", error);
                alert("Não foi possível enviar a mensagem.");
            } finally {
                input.disabled = false;
                e.target.querySelector('button').disabled = false;
                input.focus();
            }
        });

        document.getElementById('edit-lead-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const leadIndex = leads.findIndex(l => l.id === currentLeadId);
            if (leadIndex > -1) {
                leads[leadIndex].nome = document.getElementById('edit-lead-name').value;
                leads[leadIndex].email = document.getElementById('edit-lead-email').value;
                leads[leadIndex].status = document.getElementById('edit-lead-status').value;
                leads[leadIndex].origem = document.getElementById('edit-lead-origem').value;
                leads[leadIndex].qualificacao = document.getElementById('edit-lead-qualification').value;
                leads[leadIndex].notas = document.getElementById('edit-lead-notes').value;
                await saveUserData(userId);
                updateAllUI();
                alert('Lead atualizado com sucesso!');
            }
        });
    }

    async function openEditModal(leadId) {
        currentLeadId = leadId;
        const userId = firebase.auth().currentUser.uid;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;

        document.getElementById('edit-lead-name').value = lead.nome;
        document.getElementById('edit-lead-email').value = lead.email || '';
        document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
        document.getElementById('edit-lead-status').value = lead.status;
        document.getElementById('edit-lead-origem').value = lead.origem || '';
        document.getElementById('edit-lead-qualification').value = lead.qualificacao || '';
        document.getElementById('edit-lead-notes').value = lead.notas || '';
        document.getElementById('lead-chat-title').textContent = `Conversa com ${lead.nome}`;
        document.getElementById('edit-lead-modal').style.display = 'flex';

        const chatHistoryDiv = document.getElementById('lead-chat-history');
        chatHistoryDiv.innerHTML = '<p>Carregando histórico...</p>';

        if (unsubscribeLeadChat) unsubscribeLeadChat();
        
        // A estrutura do DB mudou para userData/{userId}/leadsMessages/{leadId}/messages
        const messagesRef = db.collection('userData').doc(userId).collection('leadsMessages').doc(String(leadId)).collection('messages').orderBy('timestamp');
        unsubscribeLeadChat = messagesRef.onSnapshot(snapshot => {
            chatHistoryDiv.innerHTML = '';
            if (snapshot.empty) {
                chatHistoryDiv.innerHTML = '<p>Nenhuma mensagem nesta conversa ainda.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const msg = doc.data();
                if(msg.text) renderChatMessage(msg.sender, msg.text);
            });
            chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
        }, error => {
            console.error("Erro ao ouvir o chat:", error);
            chatHistoryDiv.innerHTML = '<p>Erro ao carregar o histórico do chat.</p>';
        });
    }

    function renderChatMessage(sender, text) {
        const chatHistoryDiv = document.getElementById('lead-chat-history');
        const bubble = document.createElement('div');
        bubble.classList.add('msg-bubble');
        if (sender === 'user') {
            bubble.classList.add('msg-user');
        } else {
            bubble.classList.add('msg-operator'); // Bot e operador têm o mesmo estilo
        }
        bubble.textContent = text;
        chatHistoryDiv.appendChild(bubble);
    }
});
