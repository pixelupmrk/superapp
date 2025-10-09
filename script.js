document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------------------------
    // VARIÁVEIS GLOBAIS
    // --------------------------------------------------------------------
    let leads = [];
    let db;
    let unsubscribeLeads;
    let unsubscribeLeadChat;
    let currentUserId;
    let currentLeadId = null;

    // --------------------------------------------------------------------
    // INICIALIZAÇÃO PRINCIPAL
    // --------------------------------------------------------------------
    if (typeof firebase === 'undefined') {
        console.error("❌ Firebase não carregado! Verifique a conexão e as tags de script no HTML.");
        return;
    }

    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                currentUserId = user.uid;
                db = firebase.firestore();
                
                setupEventListeners(currentUserId);
                setupRealtimeListeners(currentUserId);
                loadSalesAcceleratorModules(); // Carrega o conteúdo educacional
            }
        });
    }
    main();

    // --------------------------------------------------------------------
    // LISTENERS (Ouvintes de eventos)
    // --------------------------------------------------------------------

    // Listener de navegação da barra lateral
    function setupEventListeners(userId) {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', e => {
                if (e.currentTarget.id === 'logout-btn') return;
                e.preventDefault();
                const targetId = e.currentTarget.getAttribute('data-target');
                if (!targetId) return;

                document.querySelectorAll('.main-content .content-area').forEach(area => area.classList.remove('active'));
                document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => nav.classList.remove('active'));

                e.currentTarget.classList.add('active');
                const targetElement = document.getElementById(targetId);
                if (targetElement) targetElement.classList.add('active');

                if (targetId === 'crm-list-section') {
                    renderLeadsTable();
                }

                const pageTitle = document.getElementById('page-title');
                if (pageTitle && e.currentTarget.querySelector('span')) {
                    pageTitle.textContent = e.currentTarget.querySelector('span').textContent;
                }
            });
        });

        // Listener para abrir o chat ao clicar em um card do Kanban
        const kanbanBoard = document.getElementById('kanban-board');
        if (kanbanBoard) {
            kanbanBoard.addEventListener('click', e => {
                const card = e.target.closest('.kanban-card');
                if (card && card.dataset.id) {
                    openChatForLead(card.dataset.id, userId);
                }
            });
        }
        
        // Listener do formulário de envio de mensagem no chat
        document.getElementById('lead-chat-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('lead-chat-input');
            const messageText = input.value.trim();
            if (!messageText || !currentLeadId) return;

            // Adiciona a mensagem no Firestore para o histórico
             const messageData = {
                sender: 'operator', // 'user' para o lead, 'operator' para você
                text: messageText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('users').doc(userId).collection('leads').doc(currentLeadId).collection('messages').add(messageData);
            
            input.value = '';
            input.focus();
        });

        // Listener do formulário de edição de dados do lead
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
                alert("❌ Falha ao atualizar lead.");
            }
        });
    }

    // Listener de dados em tempo real do Firestore
    function setupRealtimeListeners(userId) {
        if (unsubscribeLeads) unsubscribeLeads();
        unsubscribeLeads = db.collection('users').doc(userId).collection('leads')
            .onSnapshot(snapshot => {
                leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("📡 Leads atualizados em tempo real:", leads); // Esta linha aparece no seu print
                renderKanbanCards(); // Agora vamos renderizar
            }, error => {
                console.error("Erro ao ouvir os leads:", error);
            });
    }

    // --------------------------------------------------------------------
    // FUNÇÕES DE RENDERIZAÇÃO (Desenhar na tela)
    // --------------------------------------------------------------------

    // Renderiza os cards no Kanban
    function renderKanbanCards() {
        const kanbanBoard = document.getElementById('kanban-board');
        if (!kanbanBoard) return;

        kanbanBoard.innerHTML = `
            <div class="kanban-column" data-status="novo"><h2>Novos</h2><div class="kanban-cards-list"></div></div>
            <div class="kanban-column" data-status="progresso"><h2>Em Progresso</h2><div class="kanban-cards-list"></div></div>
            <div class="kanban-column" data-status="fechado"><h2>Fechados</h2><div class="kanban-cards-list"></div></div>
        `;

        leads.forEach(lead => {
            const column = kanbanBoard.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (column) {
                const card = document.createElement('div');
                card.className = 'kanban-card';
                card.draggable = true;
                card.dataset.id = lead.id;
                card.innerHTML = `<strong>${lead.nome || 'Novo Lead'}</strong><p>${lead.whatsapp || 'Sem número'}</p>`;
                column.appendChild(card);
            }
        });
    }

    // Renderiza a tabela de leads
    function renderLeadsTable() {
        const tbody = document.querySelector('#leads-table tbody');
        if (!tbody) return;
        tbody.innerHTML = leads.map(l =>
            `<tr data-id="${l.id}">
                <td>${l.nome || ''}</td>
                <td>${l.whatsapp || ''}</td>
                <td>${l.origem || ''}</td>
                <td>${l.qualificacao || ''}</td>
                <td>${l.status || ''}</td>
                <td><button class="btn-edit-table">Abrir</button></td>
            </tr>`
        ).join('');
    }

    // Renderiza uma mensagem no chat
    function renderChatMessage(sender, text) {
        const chatHistoryDiv = document.getElementById('lead-chat-history');
        if (!chatHistoryDiv || !text) return;
        const bubble = document.createElement('div');
        bubble.classList.add('msg-bubble', sender === 'user' ? 'msg-user' : 'msg-operator');
        bubble.textContent = text;
        chatHistoryDiv.appendChild(bubble);
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
    }

    // Carrega e renderiza os módulos do Acelerador de Vendas
    async function loadSalesAcceleratorModules() {
        const container = document.getElementById('accelerator-modules-container');
        if (!container) return;
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('Arquivo data.json não encontrado');
            const data = await response.json();
            const modules = data.aceleracao_vendas;
            if (!modules) throw new Error('Estrutura "aceleracao_vendas" não encontrada no JSON');

            container.innerHTML = '';
            modules.forEach(module => {
                const moduleEl = document.createElement('div');
                moduleEl.className = 'card';
                let lessonsHtml = module.lessons.map(lesson => `<li><b>${lesson.title}:</b> ${lesson.content}</li>`).join('');
                moduleEl.innerHTML = `<h3>${module.title}</h3><p>${module.description}</p><ul style="list-style-position: inside; margin-top: 1rem;">${lessonsHtml}</ul>`;
                container.appendChild(moduleEl);
            });
        } catch (error) {
            console.error("Erro ao carregar módulos de vendas:", error);
            container.innerHTML = `<p style="color:red;">Falha ao carregar conteúdo: ${error.message}</p>`;
        }
    }

    // --------------------------------------------------------------------
    // LÓGICA DO CHAT E DA IA
    // --------------------------------------------------------------------

    // Abre a visão do chat para um lead específico
    async function openChatForLead(leadId, userId) {
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;

        document.getElementById('lead-chat-placeholder').style.display = 'none';
        document.getElementById('lead-interaction-area').style.display = 'flex';

        document.getElementById('edit-lead-name').value = lead.nome || '';
        document.getElementById('edit-lead-email').value = lead.email || '';
        document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
        document.getElementById('edit-lead-status').value = lead.status || 'novo';
        document.getElementById('edit-lead-origem').value = lead.origem || '';
        document.getElementById('edit-lead-qualification').value = lead.qualificacao || '';
        document.getElementById('edit-lead-notes').value = lead.notas || '';
        document.getElementById('lead-chat-title').textContent = `Conversa com ${lead.nome || 'Lead'}`;

        const chatHistoryDiv = document.getElementById('lead-chat-history');
        chatHistoryDiv.innerHTML = '<p>Carregando histórico...</p>';

        if (unsubscribeLeadChat) unsubscribeLeadChat();
        const messagesRef = db.collection('users').doc(userId).collection('leads').doc(leadId).collection('messages').orderBy('timestamp');

        unsubscribeLeadChat = messagesRef.onSnapshot(async snapshot => {
            chatHistoryDiv.innerHTML = '';
            if (snapshot.empty) {
                chatHistoryDiv.innerHTML = '<p>Nenhuma mensagem nesta conversa ainda.</p>';
                if (lead.status === 'novo' && lead.primeiraMensagem && !lead.analisadoPelaIA) {
                    await analyzeLeadMessageWithAI(leadId, lead.primeiraMensagem, userId);
                }
                return;
            }
            snapshot.forEach(doc => renderChatMessage(doc.data().sender, doc.data().text));
        }, error => {
            console.error("Erro ao ouvir o chat:", error);
            chatHistoryDiv.innerHTML = `<p style="color:red;">Erro ao carregar o histórico.</p>`;
        });
    }

    // Analisa a primeira mensagem do lead com a IA
    async function analyzeLeadMessageWithAI(leadId, message, userId) {
        console.log(`🤖 Analisando a primeira mensagem do lead ${leadId}...`);
        try {
            const prompt = \`Analise a mensagem de um novo lead e extraia em formato JSON: nome, assunto, orcamento, prazo. Mensagem: "${message}". Responda apenas com o JSON.\`;
            
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, history: [] })
            });

            if (!response.ok) throw new Error(\`API Gemini respondeu com status \${response.status}\`);
            const result = await response.json();
            const data = JSON.parse(result.text);

            const leadRef = db.collection('users').doc(userId).collection('leads').doc(leadId);
            const updateData = {
                nome: data.nome || 'Lead (Auto)',
                notas: \`Assunto: \${data.assunto || 'N/A'}\\nOrçamento: \${data.orcamento || 'N/A'}\\nPrazo: \${data.prazo || 'N/A'}\`,
                status: 'progresso',
                analisadoPelaIA: true
            };
            await leadRef.update(updateData);
            console.log(\`✅ Lead \${leadId} qualificado e atualizado pela IA.\`);
        } catch (error) {
            console.error("Erro na análise com IA:", error);
            await db.collection('users').doc(userId).collection('leads').doc(leadId).update({ analisadoPelaIA: true, notas: 'Falha na análise da IA.' });
        }
    }
});
