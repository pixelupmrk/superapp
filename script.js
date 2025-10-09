document.addEventListener('DOMContentLoaded', () => {
    // 🔧 Variáveis globais
    let leads = [];
    let db;
    let unsubscribeLeads;
    let unsubscribeLeadChat;
    let currentUserId;
    let currentLeadId = null;
    let botUrl = null;

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

    function setupRealtimeListeners(userId) {
        if (unsubscribeLeads) unsubscribeLeads();
        unsubscribeLeads = db.collection('users').doc(userId).collection('leads')
            .onSnapshot(snapshot => {
                leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("📡 Leads atualizados em tempo real:", leads);
                renderKanbanCards(); // Apenas o Kanban precisa de atualização constante
                // A tabela será atualizada apenas quando a seção for visível
            }, error => {
                console.error("Erro ao ouvir os leads:", error);
            });
    }

    async function loadInitialData(userId) {
        // ... (código original sem alterações)
    }
    
    // ATUALIZADO: Renderiza apenas o Kanban
    function renderKanbanCards() {
        const kanbanBoard = document.getElementById('kanban-board');
        if (!kanbanBoard) return;
        
        // Limpa e recria colunas para garantir a estrutura
        kanbanBoard.innerHTML = `
            <div class="kanban-column" data-status="novo"><h2>Novos</h2><div class="kanban-cards-list"></div></div>
            <div class="kanban-column" data-status="progresso"><h2>Em Progresso</h2><div class="kanban-cards-list"></div></div>
            <div class="kanban-column" data-status="fechado"><h2>Fechados</h2><div class="kanban-cards-list"></div></div>
        `;
        
        leads.forEach(lead => {
            const column = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (!column) return;
            const card = document.createElement('div');
            card.className = 'kanban-card';
            card.draggable = true;
            card.dataset.id = lead.id;
            card.innerHTML = `<strong>${lead.nome || 'Novo Lead'}</strong><p>${lead.whatsapp}</p>`;
            column.appendChild(card);
        });
    }

    // Função para renderizar a tabela, chamada quando a aba é ativada
    function renderLeadsTable() {
        // ... (código original sem alterações)
    }

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
                    renderLeadsTable(); // Renderiza a tabela só quando necessário
                }
                
                const pageTitle = document.getElementById('page-title');
                if(pageTitle && e.currentTarget.querySelector('span')) {
                    pageTitle.textContent = e.currentTarget.querySelector('span').textContent;
                }
            });
        });

        // ATUALIZADO: Evento de clique no Kanban para abrir o chat na lateral
        const kanbanBoard = document.getElementById('kanban-board');
        if (kanbanBoard) {
            kanbanBoard.addEventListener('click', e => {
                const card = e.target.closest('.kanban-card');
                if (card && card.dataset.id) {
                    openChatForLead(card.dataset.id, userId);
                }
            });
        }

        // ... (outros listeners como o da tabela e chat)
        
        // Listener do formulário de chat
        document.getElementById('lead-chat-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            // ... (lógica de envio de mensagem original, sem alterações)
        });

        // Listener do formulário de edição
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

    // NOVA FUNÇÃO: Substitui o openEditModal
    async function openChatForLead(leadId, userId) {
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;

        // Mostra a área de interação e esconde o placeholder
        document.getElementById('lead-chat-placeholder').style.display = 'none';
        document.getElementById('lead-interaction-area').style.display = 'flex';

        // Preenche os dados do lead
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
                // NOVA LÓGICA: Verifica se precisa analisar a primeira mensagem
                if (lead.status === 'novo' && lead.primeiraMensagem && !lead.analisadoPelaIA) {
                    await analyzeLeadMessageWithAI(leadId, lead.primeiraMensagem, userId);
                }
                return;
            }
            snapshot.forEach(doc => renderChatMessage(doc.data().sender, doc.data().text));
            chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
        }, error => {
            console.error("Erro ao ouvir o chat:", error);
            chatHistoryDiv.innerHTML = `<p style="color:red;">Erro ao carregar o histórico.</p>`;
        });
    }

    // NOVA FUNÇÃO: Para o pré-atendimento com Gemini
    async function analyzeLeadMessageWithAI(leadId, message, userId) {
        console.log(`🤖 Analisando a primeira mensagem do lead ${leadId}...`);
        try {
            const prompt = `Analise a mensagem de um novo lead e extraia em formato JSON: nome, assunto, orcamento, prazo. Mensagem: "${message}". Responda apenas com o JSON.`;
            
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, history: [] })
            });

            if (!response.ok) throw new Error(`API Gemini respondeu com status ${response.status}`);
            
            const result = await response.json();
            const data = JSON.parse(result.text); // A API retorna o JSON como string dentro do 'text'

            const leadRef = db.collection('users').doc(userId).collection('leads').doc(leadId);
            
            // Monta os dados para atualização, usando os valores extraídos
            const updateData = {
                nome: data.nome || 'Lead (Auto)',
                notas: `Assunto: ${data.assunto || 'N/A'}\nOrçamento: ${data.orcamento || 'N/A'}\nPrazo: ${data.prazo || 'N/A'}`,
                status: 'progresso', // Move o lead para a próxima etapa
                analisadoPelaIA: true // Flag para não analisar novamente
            };

            await leadRef.update(updateData);
            console.log(`✅ Lead ${leadId} qualificado e atualizado pela IA.`);

        } catch (error) {
            console.error("Erro na análise com IA:", error);
            // Mesmo com erro, marca como analisado para não tentar de novo
            await db.collection('users').doc(userId).collection('leads').doc(leadId).update({ analisadoPelaIA: true, notas: 'Falha na análise da IA.' });
        }
    }

    function renderChatMessage(sender, text) {
        const chatHistoryDiv = document.getElementById('lead-chat-history');
        if (!chatHistoryDiv || !text) return;
        const bubble = document.createElement('div');
        bubble.classList.add('msg-bubble', sender === 'user' ? 'msg-user' : 'msg-operator');
        bubble.textContent = text;
        chatHistoryDiv.appendChild(bubble);
    }
});
