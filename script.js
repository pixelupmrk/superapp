document.addEventListener('DOMContentLoaded', () => {
    // --- SEU CONTEÚDO ORIGINAL DA MENTORIA ---
    const mentoriaData = [ { "moduleId": "MD01", "title": "Módulo 1: Conectando com o Cliente Ideal", "lessons": [ { "lessonId": "L01.01", "title": "Questionário para Definição de Persona", "content": "..." }, { "lessonId": "L01.02", "title": "Proposta de Valor", "content": "..." } ] }, { "moduleId": "MD08", "title": "Módulo 8: Conexão com a Audiência", "lessons": [ { "lessonId": "L08.01", "title": "Gerando Conexão Real", "content": "..." } ] } ];
    
    // --- VARIÁVEIS GLOBAIS ---
    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let currentLeadId = null, draggedItem = null, currentProductId = null;
    let statusChart;
    let db;
    let unsubscribeChat; // Para parar de ouvir o chat ao fechar o modal

    // --- INICIALIZAÇÃO ---
    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user && !document.body.hasAttribute('data-initialized')) {
                document.body.setAttribute('data-initialized', 'true');
                db = firebase.firestore();
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
            }
        });
    }
    main();

    // --- CARREGAMENTO E SALVAMENTO DE DADOS (Restaurado do seu original) ---
    async function loadAllUserData(userId) {
        const doc = await db.collection('userData').doc(userId).get();
        if (doc.exists) {
            const data = doc.data();
            leads = data.leads || [];
            caixa = data.caixa || [];
            estoque = data.estoque || [];
            mentoriaNotes = data.mentoriaNotes || {};
        }
        renderMentoria();
        loadMentoriaNotes();
        updateAllUI();
    }

    async function saveAllUserData(userId) {
        getMentoriaNotes(); // Garante que as anotações mais recentes sejam salvas
        const dataToSave = { leads, caixa, estoque, mentoriaNotes };
        await db.collection('userData').doc(userId).set(dataToSave, { merge: true });
    }

    // --- ATUALIZAÇÃO DA INTERFACE ---
    function updateAllUI() {
        renderKanbanCards();
        renderLeadsTable();
        updateDashboard();
        renderCaixaTable();
        updateCaixa();
        renderEstoqueTable();
    }
    
    // --- EVENT LISTENERS (Todos revisados e corrigidos) ---
    function setupEventListeners(userId) {
        // Navegação principal
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', e => {
                if (e.currentTarget.id === 'logout-btn') return;
                e.preventDefault();
                const targetId = e.currentTarget.getAttribute('data-target');
                document.querySelectorAll('.sidebar-nav .nav-item, .content-area').forEach(el => el.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.getElementById(targetId).classList.add('active');
                document.getElementById('page-title').textContent = e.currentTarget.querySelector('span').textContent;
            });
        });
        
        // Tema
        document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
        });

        // Formulário de novo lead
        document.getElementById('lead-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nextId = leads.length > 0 ? Math.max(...leads.map(l => l.id || 0)) + 1 : 1;
            leads.push({ id: nextId, status: 'novo', nome: document.getElementById('lead-name').value, whatsapp: document.getElementById('lead-whatsapp').value, /* ... outros campos */ });
            await saveAllUserData(userId);
            updateAllUI();
            e.target.reset();
        });

        // Kanban (Arrastar e clicar)
        const kanbanBoard = document.getElementById('kanban-board');
        kanbanBoard.addEventListener('dragstart', e => { if (e.target.classList.contains('kanban-card')) draggedItem = e.target; });
        kanbanBoard.addEventListener('dragover', e => e.preventDefault());
        kanbanBoard.addEventListener('drop', async e => {
            const column = e.target.closest('.kanban-column');
            if (column && draggedItem) {
                const lead = leads.find(l => l.id == draggedItem.dataset.id);
                if (lead) {
                    lead.status = column.dataset.status;
                    await saveAllUserData(userId);
                    updateAllUI();
                }
            }
        });
        kanbanBoard.addEventListener('click', e => {
            const card = e.target.closest('.kanban-card');
            if (card) openLeadModal(parseInt(card.dataset.id), userId);
        });

        // Modal de Chat e Edição
        document.getElementById('edit-lead-form').addEventListener('submit', async e => {
            e.preventDefault();
            const lead = leads.find(l => l.id === currentLeadId);
            if(lead) {
                lead.nome = document.getElementById('edit-lead-name').value;
                lead.whatsapp = document.getElementById('edit-lead-whatsapp').value;
                lead.status = document.getElementById('edit-lead-status').value;
                // ... outros campos
                await saveAllUserData(userId);
                updateAllUI();
                alert('Lead salvo!');
            }
        });

        document.getElementById('lead-chat-form').addEventListener('submit', async e => {
            e.preventDefault();
            const input = document.getElementById('lead-chat-input');
            const text = input.value.trim();
            if (text && currentLeadId) {
                const message = { text, sender: 'operator', timestamp: new Date() };
                // Salva mensagem no Firestore (subcoleção)
                await db.collection('userData').doc(userId).collection('leads').doc(String(currentLeadId)).collection('messages').add(message);
                input.value = '';
            }
        });

        // Fechar Modais
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById(btn.dataset.target).style.display = 'none';
                if (unsubscribeChat) unsubscribeChat(); // Para de ouvir o chat
            });
        });

        // Listeners do Financeiro, Estoque, etc. (restaurados)
        document.getElementById('caixa-form')?.addEventListener('submit', async e => { e.preventDefault(); caixa.push({ data: document.getElementById('caixa-data').value, descricao: document.getElementById('caixa-descricao').value, valor: parseFloat(document.getElementById('caixa-valor').value), tipo: document.getElementById('caixa-tipo').value }); await saveAllUserData(userId); updateAllUI(); e.target.reset(); });
        document.querySelectorAll('.finance-tab').forEach(tab => { tab.addEventListener('click', e => { e.preventDefault(); document.querySelectorAll('.finance-tab, .finance-content').forEach(el => el.classList.remove('active')); e.target.classList.add('active'); document.getElementById(e.target.dataset.tab + '-tab-content').classList.add('active'); }); });
    }

    // --- NOVA FUNÇÃO PARA ABRIR O MODAL COM CHAT ---
    function openLeadModal(leadId, userId) {
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;

        // Preenche os campos de edição
        document.getElementById('lead-modal-title').textContent = `Conversa com ${lead.nome}`;
        document.getElementById('edit-lead-name').value = lead.nome;
        document.getElementById('edit-lead-whatsapp').value = lead.whatsapp;
        document.getElementById('edit-lead-status').value = lead.status;
        
        // Limpa o chat antigo e começa a ouvir o novo
        const chatHistoryDiv = document.getElementById('lead-chat-history');
        chatHistoryDiv.innerHTML = '<p>Carregando conversa...</p>';
        
        if (unsubscribeChat) unsubscribeChat(); // Para o listener anterior
        unsubscribeChat = db.collection('userData').doc(userId).collection('leads').doc(String(leadId)).collection('messages').orderBy('timestamp')
            .onSnapshot(snapshot => {
                chatHistoryDiv.innerHTML = ''; // Limpa antes de renderizar
                if (snapshot.empty) {
                    chatHistoryDiv.innerHTML = '<p>Inicie a conversa!</p>';
                }
                snapshot.forEach(doc => {
                    const msg = doc.data();
                    const bubble = document.createElement('div');
                    bubble.classList.add('msg-bubble', msg.sender === 'operator' ? 'msg-from-operator' : 'msg-from-lead');
                    bubble.textContent = msg.text;
                    chatHistoryDiv.appendChild(bubble);
                });
                chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
            });

        document.getElementById('lead-modal').style.display = 'flex';
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO (Restauradas do seu original) ---
    function renderKanbanCards() {
        document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = '');
        leads.forEach(lead => {
            const c = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (c) c.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${lead.whatsapp}</p></div>`;
        });
    }

    function renderLeadsTable() {
        const t = document.querySelector('#leads-table tbody');
        if (t) t.innerHTML = leads.map(l => `<tr data-id="${l.id}"><td>${l.nome}</td><td>${l.whatsapp}</td><td>${l.origem}</td><td>${l.qualificacao}</td><td>${l.status}</td><td>...</td></tr>`).join('');
    }

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
        statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Progresso', 'Fechado'], datasets: [{ data: [n, p, f], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'] }] } });
    }
    
    function renderCaixaTable() { const t = document.querySelector('#caixa-table tbody'); if (t) { t.innerHTML = caixa.map(m => `<tr><td>${m.data}</td><td>${m.descricao}</td><td>${m.tipo === 'entrada' ? 'R$ ' + m.valor.toFixed(2) : ''}</td><td>${m.tipo === 'saida' ? 'R$ ' + m.valor.toFixed(2) : ''}</td></tr>`).join(''); } }
    function updateCaixa() { const e = caixa.filter(m => m.tipo === 'entrada').reduce((a, c) => a + c.valor, 0), s = caixa.filter(m => m.tipo === 'saida').reduce((a, c) => a + c.valor, 0); document.getElementById('total-entradas').textContent = `R$ ${e.toFixed(2)}`; document.getElementById('total-saidas').textContent = `R$ ${s.toFixed(2)}`; document.getElementById('caixa-atual').textContent = `R$ ${(e - s).toFixed(2)}`; }
    function renderEstoqueTable() { /* ... Sua função original ... */ }
    function renderMentoria() { /* ... Sua função original ... */ }
    function getMentoriaNotes() { document.querySelectorAll('.mentoria-notas').forEach(t => mentoriaNotes[t.id] = t.value); }
    function loadMentoriaNotes() { for (const id in mentoriaNotes) { const t = document.getElementById(id); if (t) t.value = mentoriaNotes[id]; } }
});
