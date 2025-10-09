document.addEventListener('DOMContentLoaded', () => {
    // --- VARIÁVEIS GLOBAIS ---
    let mentoriaData = [];
    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let currentLeadId = null, draggedItem = null, currentProductId = null;
    let statusChart;
    let db;
    let unsubscribeChat;
    // URL do seu backend do bot (ex: o link do seu Replit)
    const BOT_BACKEND_URL = 'COLE_A_URL_DO_SEU_REPLIT_AQUI'; // <--- IMPORTANTE: Altere esta linha!

    // --- INICIALIZAÇÃO ---
    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user && !document.body.hasAttribute('data-initialized')) {
                document.body.setAttribute('data-initialized', 'true');
                db = firebase.firestore();
                await loadMentoriaData();
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
            }
        });
    }
    main();

    // --- CARREGAMENTO DE DADOS ---
    async function loadMentoriaData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('data.json não encontrado');
            const data = await response.json();
            mentoriaData = data.aceleracao_vendas;
        } catch (error) { console.error("Erro ao carregar mentoria:", error); }
    }

    async function loadAllUserData(userId) {
        const doc = await db.collection('userData').doc(userId).get();
        if (doc.exists) {
            const data = doc.data();
            leads = data.leads || [];
            caixa = data.caixa || [];
            estoque = data.estoque || [];
            mentoriaNotes = data.mentoriaNotes || {};
            applySettings(data.settings);
        }
        renderMentoria();
        loadMentoriaNotes();
        updateAllUI();
    }

    async function saveAllUserData(userId) {
        getMentoriaNotes();
        const settings = {
            userName: document.getElementById('setting-user-name').value || 'Usuário',
            theme: document.body.classList.contains('light-theme') ? 'light' : 'dark'
        };
        const dataToSave = { leads, caixa, estoque, mentoriaNotes, settings };
        await db.collection('userData').doc(userId).set(dataToSave, { merge: true });
    }

    function applySettings(settings = {}) {
        const userName = settings.userName || 'Usuário';
        document.querySelector('.user-profile span').textContent = `Olá, ${userName}`;
        document.getElementById('setting-user-name').value = userName;
        const theme = settings.theme || 'dark';
        document.body.className = theme === 'light' ? 'light-theme' : '';
        document.getElementById('theme-toggle-btn').textContent = theme === 'light' ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro';
    }

    function updateAllUI() {
        renderKanbanCards();
        renderLeadsTable();
        updateDashboard();
        renderCaixaTable();
        updateCaixa();
        renderEstoqueTable();
    }
    
    // --- EVENT LISTENERS ---
    function setupEventListeners(userId) {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', e => {
                if (e.currentTarget.id === 'logout-btn') return;
                e.preventDefault();
                const targetId = e.currentTarget.getAttribute('data-target');
                document.querySelectorAll('.sidebar-nav .nav-item, .content-area').forEach(el => el.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.getElementById(targetId).classList.add('active');
                document.getElementById('page-title').textContent = e.currentTarget.querySelector('span').textContent;
                // Se a aba do bot for clicada, inicia a conexão
                if (targetId === 'bot-section') {
                    initBotConnection();
                }
            });
        });
        
        document.getElementById('save-settings-btn')?.addEventListener('click', async () => { await saveAllUserData(userId); applySettings({ userName: document.getElementById('setting-user-name').value }); alert('Configurações salvas!'); });
        document.getElementById('theme-toggle-btn')?.addEventListener('click', () => { document.body.classList.toggle('light-theme'); const isLight = document.body.classList.contains('light-theme'); document.getElementById('theme-toggle-btn').textContent = isLight ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro'; });
        document.getElementById('lead-form')?.addEventListener('submit', async e => { e.preventDefault(); const nextId = leads.length > 0 ? Math.max(...leads.map(l => l.id || 0)) + 1 : 1; leads.push({ id: nextId, status: 'novo', nome: document.getElementById('lead-name').value, whatsapp: document.getElementById('lead-whatsapp').value, origem: document.getElementById('lead-origin').value, qualificacao: document.getElementById('lead-qualification').value, notas: document.getElementById('lead-notes').value }); await saveAllUserData(userId); updateAllUI(); e.target.reset(); });
        const kanbanBoard = document.getElementById('kanban-board');
        kanbanBoard.addEventListener('dragstart', e => { if (e.target.classList.contains('kanban-card')) draggedItem = e.target; });
        kanbanBoard.addEventListener('dragover', e => e.preventDefault());
        kanbanBoard.addEventListener('drop', async e => { const column = e.target.closest('.kanban-column'); if (column && draggedItem) { const lead = leads.find(l => l.id == draggedItem.dataset.id); if (lead) { lead.status = column.dataset.status; await saveAllUserData(userId); updateAllUI(); } } });
        kanbanBoard.addEventListener('click', e => { const card = e.target.closest('.kanban-card'); if (card) openLeadModal(parseInt(card.dataset.id), userId); });
        document.getElementById('leads-table').addEventListener('click', e => { if (e.target.classList.contains('btn-open-lead')) { const leadId = e.target.closest('tr').dataset.id; openLeadModal(parseInt(leadId), userId); } });
        document.getElementById('edit-lead-form').addEventListener('submit', async e => { e.preventDefault(); const lead = leads.find(l => l.id === currentLeadId); if(lead) { lead.nome = document.getElementById('edit-lead-name').value; lead.whatsapp = document.getElementById('edit-lead-whatsapp').value; lead.status = document.getElementById('edit-lead-status').value; lead.origem = document.getElementById('edit-lead-origem').value; lead.qualificacao = document.getElementById('edit-lead-qualification').value; lead.notas = document.getElementById('edit-lead-notes').value; await saveAllUserData(userId); updateAllUI(); alert('Lead salvo!'); } });
        document.getElementById('delete-lead-btn').addEventListener('click', async () => { if (confirm('Tem certeza?')) { leads = leads.filter(l => l.id !== currentLeadId); await saveAllUserData(userId); updateAllUI(); document.getElementById('lead-modal').style.display = 'none'; } });
        
        // --- ENVIO DE MENSAGEM PELO BOT ---
        document.getElementById('lead-chat-form').addEventListener('submit', async e => {
            e.preventDefault();
            const input = document.getElementById('lead-chat-input');
            const text = input.value.trim();
            const lead = leads.find(l => l.id === currentLeadId);
            if (text && lead && lead.whatsapp) {
                try {
                    const response = await fetch(`${BOT_BACKEND_URL}/send`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ to: lead.whatsapp, text: text })
                    });
                    if (!response.ok) throw new Error('Falha ao enviar mensagem pelo bot.');
                    // Salva a mensagem no histórico do Firebase
                    await db.collection('userData').doc(userId).collection('leads').doc(String(currentLeadId)).collection('messages').add({ text, sender: 'operator', timestamp: new Date() });
                    input.value = '';
                } catch (error) {
                    alert(`Erro ao enviar mensagem: ${error.message}`);
                }
            }
        });

        document.querySelectorAll('.close-modal').forEach(btn => { btn.addEventListener('click', () => { document.getElementById(btn.dataset.target).style.display = 'none'; if (unsubscribeChat) unsubscribeChat(); }); });
        document.getElementById('caixa-form')?.addEventListener('submit', async e => { e.preventDefault(); caixa.push({ data: document.getElementById('caixa-data').value, descricao: document.getElementById('caixa-descricao').value, valor: parseFloat(document.getElementById('caixa-valor').value), tipo: document.getElementById('caixa-tipo').value }); await saveAllUserData(userId); updateAllUI(); e.target.reset(); });
        document.querySelectorAll('.finance-tab').forEach(tab => { tab.addEventListener('click', e => { e.preventDefault(); document.querySelectorAll('.finance-tab, .finance-content').forEach(el => el.classList.remove('active')); e.target.classList.add('active'); document.getElementById(e.target.dataset.tab + '-tab-content').classList.add('active'); }); });
        document.getElementById('estoque-form')?.addEventListener('submit', async e => { e.preventDefault(); const newProduct = { id: `prod_${Date.now()}`, produto: document.getElementById('estoque-produto').value, compra: parseFloat(document.getElementById('estoque-compra').value), venda: parseFloat(document.getElementById('estoque-venda').value), custos: [] }; estoque.push(newProduct); await saveAllUserData(userId); renderEstoqueTable(); e.target.reset(); });
        document.getElementById('estoque-table')?.addEventListener('click', e => { if (e.target.classList.contains('btn-custo')) { openCustosModal(e.target.closest('tr').dataset.id); } });
        document.getElementById('add-custo-form').addEventListener('submit', async e => { e.preventDefault(); const produto = estoque.find(p => p.id === currentProductId); if (produto) { produto.custos.push({ descricao: document.getElementById('custo-descricao').value, valor: parseFloat(document.getElementById('custo-valor').value) }); await saveAllUserData(userId); renderCustosList(produto); renderEstoqueTable(); e.target.reset(); }});
        document.getElementById('chatbot-form').addEventListener('submit', e => e.preventDefault());
    }

    // --- LÓGICA DO BOT WHATSAPP ---
    function initBotConnection() {
        const connectionArea = document.getElementById('bot-connection-area');
        if (!BOT_BACKEND_URL.startsWith('http')) {
            connectionArea.innerHTML = '<p style="color: yellow;">AVISO: A URL do backend do bot não foi configurada no arquivo script.js.</p>';
            return;
        }

        connectionArea.innerHTML = '<p>Verificando status...</p>';
        const eventSource = new EventSource(`${BOT_BACKEND_URL}/events`);

        eventSource.onmessage = function(event) {
            const data = JSON.parse(event.data);
            switch(data.type) {
                case 'status':
                    connectionArea.innerHTML = `<p>Status: <strong>${data.data}</strong></p>`;
                    break;
                case 'qr':
                    connectionArea.innerHTML = '<h3>Escaneie o QR Code</h3><img src="${data.data}" alt="QR Code do WhatsApp">';
                    break;
                // Lógica para receber mensagens seria adicionada aqui
            }
        };

        eventSource.onerror = function() {
            connectionArea.innerHTML = '<p style="color: red;">Não foi possível conectar ao servidor do bot. Verifique se ele está online.</p>';
            eventSource.close();
        };
    }


    // --- FUNÇÕES DE ABERTURA DE MODAL ---
    function openLeadModal(leadId, userId) { /* ...código sem alteração... */ }
    function openCustosModal(productId) { /* ...código sem alteração... */ }
    
    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    function renderKanbanCards() { /* ...código sem alteração... */ }
    function renderLeadsTable() { const t = document.querySelector('#leads-table tbody'); if (t) t.innerHTML = leads.map(l => `<tr data-id="${l.id}"><td>${l.nome}</td><td>${l.whatsapp}</td><td>${l.origem || ''}</td><td>${l.qualificacao || ''}</td><td>${l.status}</td><td><button class="btn-open-lead">Abrir</button></td></tr>`).join(''); }
    function updateDashboard() { /* ...código sem alteração... */ }
    function renderCaixaTable() { /* ...código sem alteração... */ }
    function updateCaixa() { /* ...código sem alteração... */ }
    function renderEstoqueTable() { /* ...código sem alteração... */ }
    function renderCustosList(produto) { /* ...código sem alteração... */ }
    function renderMentoria() { const menu = document.getElementById('mentoria-menu'); const content = document.getElementById('mentoria-content'); if (!menu || !content || mentoriaData.length === 0) { return; } menu.innerHTML = mentoriaData.map(mod => `<div class="sales-accelerator-menu-item" data-module-id="${mod.moduleId}">${mod.title}</div>`).join(''); content.innerHTML = mentoriaData.map(mod => { const lessonsHtml = mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content.replace(/\n/g, '<br>')}</p></div>`).join(''); return `<div class="mentoria-module-content" id="${mod.moduleId}">${lessonsHtml}<div class="anotacoes-aluno"><textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="8" placeholder="Suas anotações..."></textarea></div></div>`; }).join(''); document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => { item.addEventListener('click', e => { document.querySelectorAll('.sales-accelerator-menu-item, .mentoria-module-content').forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active'); document.getElementById(e.currentTarget.dataset.moduleId).classList.add('active'); }); }); const firstMenuItem = document.querySelector('.sales-accelerator-menu-item'); if(firstMenuItem) { firstMenuItem.classList.add('active'); document.getElementById(firstMenuItem.dataset.moduleId).classList.add('active'); } }
    function getMentoriaNotes() { document.querySelectorAll('.mentoria-notas').forEach(t => mentoriaNotes[t.id] = t.value); }
    function loadMentoriaNotes() { for (const id in mentoriaNotes) { const t = document.getElementById(id); if (t) t.value = mentoriaNotes[id]; } }
});
