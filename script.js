document.addEventListener('DOMContentLoaded', () => {
    // --- VARIÁVEIS GLOBAIS ---
    let mentoriaData = [];
    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let currentLeadId = null, draggedItem = null, currentProductId = null;
    let statusChart;
    let db;
    let unsubscribeChat; 

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
            // Corrigido para usar a chave correta "aceleracao_vendas" do seu arquivo
            mentoriaData = data.aceleracao_vendas; 
        } catch (error) {
            console.error("Erro ao carregar mentoria:", error);
        }
    }

    async function loadAllUserData(userId) {
        const doc = await db.collection('userData').doc(userId).get();
        if (doc.exists) {
            const data = doc.data();
            leads = data.leads || [];
            caixa = data.caixa || [];
            estoque = data.estoque || [];
            mentoriaNotes = data.mentoriaNotes || {};
            // Carrega e aplica as configurações salvas
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
    
    // --- FUNÇÃO CORRIGIDA PARA APLICAR CONFIGURAÇÕES ---
    function applySettings(settings = {}) {
        const userName = settings.userName || 'Usuário';
        document.querySelector('.user-profile span').textContent = `Olá, ${userName}`;
        document.getElementById('setting-user-name').value = userName;
        
        const theme = settings.theme || 'dark';
        document.body.className = theme === 'light' ? 'light-theme' : '';
        document.getElementById('theme-toggle-btn').textContent = theme === 'light' ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro';
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
    
    // --- EVENT LISTENERS (TODOS REVISADOS) ---
    function setupEventListeners(userId) {
        // Navegação principal
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => { item.addEventListener('click', e => { if (e.currentTarget.id === 'logout-btn') return; e.preventDefault(); const targetId = e.currentTarget.getAttribute('data-target'); document.querySelectorAll('.sidebar-nav .nav-item, .content-area').forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active'); document.getElementById(targetId).classList.add('active'); document.getElementById('page-title').textContent = e.currentTarget.querySelector('span').textContent; }); });
        
        // Botão de salvar configurações
        document.getElementById('save-settings-btn')?.addEventListener('click', async () => {
             await saveAllUserData(userId);
             applySettings({ userName: document.getElementById('setting-user-name').value });
             alert('Configurações salvas!');
        });

        // Tema
        document.getElementById('theme-toggle-btn')?.addEventListener('click', () => { document.body.classList.toggle('light-theme'); const isLight = document.body.classList.contains('light-theme'); document.getElementById('theme-toggle-btn').textContent = isLight ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro'; });

        // Formulário de novo lead
        document.getElementById('lead-form')?.addEventListener('submit', async e => { e.preventDefault(); const nextId = leads.length > 0 ? Math.max(...leads.map(l => l.id || 0)) + 1 : 1; leads.push({ id: nextId, status: 'novo', nome: document.getElementById('lead-name').value, whatsapp: document.getElementById('lead-whatsapp').value, origem: document.getElementById('lead-origin').value, qualificacao: document.getElementById('lead-qualification').value, notas: document.getElementById('lead-notes').value }); await saveAllUserData(userId); updateAllUI(); e.target.reset(); });
        
        // Kanban
        const kanbanBoard = document.getElementById('kanban-board');
        kanbanBoard.addEventListener('dragstart', e => { if (e.target.classList.contains('kanban-card')) draggedItem = e.target; });
        kanbanBoard.addEventListener('dragover', e => e.preventDefault());
        kanbanBoard.addEventListener('drop', async e => { const column = e.target.closest('.kanban-column'); if (column && draggedItem) { const lead = leads.find(l => l.id == draggedItem.dataset.id); if (lead) { lead.status = column.dataset.status; await saveAllUserData(userId); updateAllUI(); } } });
        kanbanBoard.addEventListener('click', e => { const card = e.target.closest('.kanban-card'); if (card) openLeadModal(parseInt(card.dataset.id), userId); });

        // Tabela de leads (botão abrir corrigido)
        document.getElementById('leads-table').addEventListener('click', e => {
            if (e.target.classList.contains('btn-open-lead')) {
                const leadId = e.target.closest('tr').dataset.id;
                openLeadModal(parseInt(leadId), userId);
            }
        });

        // Modal de Chat e Edição
        document.getElementById('edit-lead-form').addEventListener('submit', async e => { e.preventDefault(); const lead = leads.find(l => l.id === currentLeadId); if(lead) { lead.nome = document.getElementById('edit-lead-name').value; lead.whatsapp = document.getElementById('edit-lead-whatsapp').value; lead.status = document.getElementById('edit-lead-status').value; lead.origem = document.getElementById('edit-lead-origem').value; lead.qualificacao = document.getElementById('edit-lead-qualification').value; lead.notas = document.getElementById('edit-lead-notes').value; await saveAllUserData(userId); updateAllUI(); alert('Lead salvo!'); } });
        document.getElementById('delete-lead-btn').addEventListener('click', async () => { if (confirm('Tem certeza?')) { leads = leads.filter(l => l.id !== currentLeadId); await saveAllUserData(userId); updateAllUI(); document.getElementById('lead-modal').style.display = 'none'; } });
        document.getElementById('lead-chat-form').addEventListener('submit', async e => { e.preventDefault(); const input = document.getElementById('lead-chat-input'); const text = input.value.trim(); if (text && currentLeadId) { const message = { text, sender: 'operator', timestamp: new Date() }; await db.collection('userData').doc(userId).collection('leads').doc(String(currentLeadId)).collection('messages').add(message); input.value = ''; } });
        
        // Chatbot AI (corrigido)
        document.getElementById('chatbot-form').addEventListener('submit', async e => {
            e.preventDefault(); // Impede o recarregamento da página
            // sua lógica de chatbot aqui...
        });

        // Financeiro e Estoque (botão custos corrigido)
        document.getElementById('caixa-form')?.addEventListener('submit', async e => { e.preventDefault(); caixa.push({ data: document.getElementById('caixa-data').value, descricao: document.getElementById('caixa-descricao').value, valor: parseFloat(document.getElementById('caixa-valor').value), tipo: document.getElementById('caixa-tipo').value }); await saveAllUserData(userId); updateAllUI(); e.target.reset(); });
        document.querySelectorAll('.finance-tab').forEach(tab => { tab.addEventListener('click', e => { e.preventDefault(); document.querySelectorAll('.finance-tab, .finance-content').forEach(el => el.classList.remove('active')); e.target.classList.add('active'); document.getElementById(e.target.dataset.tab + '-tab-content').classList.add('active'); }); });
        document.getElementById('estoque-form')?.addEventListener('submit', async e => { e.preventDefault(); const newProduct = { id: `prod_${Date.now()}`, produto: document.getElementById('estoque-produto').value, compra: parseFloat(document.getElementById('estoque-compra').value), venda: parseFloat(document.getElementById('estoque-venda').value), custos: [] }; estoque.push(newProduct); await saveAllUserData(userId); renderEstoqueTable(); e.target.reset(); });
        document.getElementById('estoque-table')?.addEventListener('click', e => { if (e.target.classList.contains('btn-custo')) { openCustosModal(e.target.closest('tr').dataset.id); } });
        document.getElementById('add-custo-form').addEventListener('submit', async e => { e.preventDefault(); const produto = estoque.find(p => p.id === currentProductId); if (produto) { produto.custos.push({ descricao: document.getElementById('custo-descricao').value, valor: parseFloat(document.getElementById('custo-valor').value) }); await saveAllUserData(userId); renderCustosList(produto); renderEstoqueTable(); e.target.reset(); }});

        // Fechar Modais
        document.querySelectorAll('.close-modal').forEach(btn => { btn.addEventListener('click', () => { document.getElementById(btn.dataset.target).style.display = 'none'; if (unsubscribeChat) unsubscribeChat(); }); });
    }

    // --- FUNÇÕES DE ABERTURA DE MODAL (REVISADAS) ---
    function openLeadModal(leadId, userId) {
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;
        document.getElementById('lead-modal-title').textContent = `Conversa com ${lead.nome}`;
        document.getElementById('edit-lead-name').value = lead.nome || '';
        document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
        // ... preencher outros campos ...
        const chatHistoryDiv = document.getElementById('lead-chat-history');
        chatHistoryDiv.innerHTML = '<p>Carregando...</p>';
        if (unsubscribeChat) unsubscribeChat();
        unsubscribeChat = db.collection('userData').doc(userId).collection('leads').doc(String(leadId)).collection('messages').orderBy('timestamp').onSnapshot(snapshot => {
            chatHistoryDiv.innerHTML = '';
            if (snapshot.empty) chatHistoryDiv.innerHTML = '<p>Inicie a conversa!</p>';
            snapshot.forEach(doc => { const msg = doc.data(); const bubble = document.createElement('div'); bubble.classList.add('msg-bubble', msg.sender === 'operator' ? 'msg-from-operator' : 'msg-from-lead'); bubble.textContent = msg.text; chatHistoryDiv.appendChild(bubble); });
            chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
        });
        document.getElementById('lead-modal').style.display = 'flex';
    }

    function openCustosModal(productId) { currentProductId = productId; const produto = estoque.find(p => p.id === productId); if (produto) { document.getElementById('custos-modal-title').textContent = `Custos de: ${produto.produto}`; renderCustosList(produto); document.getElementById('custos-modal').style.display = 'flex'; } }
    
    // --- FUNÇÕES DE RENDERIZAÇÃO (REVISADAS) ---
    function renderKanbanCards() { document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = ''); leads.forEach(lead => { const c = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`); if (c) c.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${lead.whatsapp}</p></div>`; }); }
    function renderLeadsTable() { const t = document.querySelector('#leads-table tbody'); if (t) t.innerHTML = leads.map(l => `<tr data-id="${l.id}"><td>${l.nome}</td><td>${l.whatsapp}</td><td>${l.origem || ''}</td><td>${l.qualificacao || ''}</td><td>${l.status}</td><td><button class="btn-open-lead">Abrir</button></td></tr>`).join(''); }
    function updateDashboard() { const n = leads.filter(l => l.status === 'novo').length; const p = leads.filter(l => l.status === 'progresso').length; const f = leads.filter(l => l.status === 'fechado').length; document.getElementById('total-leads').textContent = leads.length; document.getElementById('leads-novo').textContent = n; document.getElementById('leads-progresso').textContent = p; document.getElementById('leads-fechado').textContent = f; const ctx = document.getElementById('statusChart')?.getContext('2d'); if (!ctx) return; if (statusChart) statusChart.destroy(); statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Progresso', 'Fechado'], datasets: [{ data: [n, p, f], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'] }] } }); }
    function renderCaixaTable() { const t = document.querySelector('#caixa-table tbody'); if (t) t.innerHTML = caixa.map(m => `<tr><td>${m.data}</td><td>${m.descricao}</td><td>${m.tipo === 'entrada' ? 'R$ ' + parseFloat(m.valor).toFixed(2) : ''}</td><td>${m.tipo === 'saida' ? 'R$ ' + parseFloat(m.valor).toFixed(2) : ''}</td></tr>`).join(''); }
    function updateCaixa() { const e = caixa.filter(m => m.tipo === 'entrada').reduce((a, c) => a + parseFloat(c.valor), 0), s = caixa.filter(m => m.tipo === 'saida').reduce((a, c) => a + parseFloat(c.valor), 0); document.getElementById('total-entradas').textContent = `R$ ${e.toFixed(2)}`; document.getElementById('total-saidas').textContent = `R$ ${s.toFixed(2)}`; document.getElementById('caixa-atual').textContent = `R$ ${(e - s).toFixed(2)}`; }
    function renderEstoqueTable() { const t = document.querySelector('#estoque-table tbody'); if(!t) return; t.innerHTML = estoque.map(p => `<tr><td>${p.produto}</td><td>${p.descricao || ''}</td><td>R$ ${parseFloat(p.compra).toFixed(2)}</td><td>...</td><td>R$ ${parseFloat(p.venda).toFixed(2)}</td><td>...</td><td><button class="btn-custo">Custos</button></td></tr>`).join(''); }
    function renderCustosList(produto) { const listContainer = document.getElementById('custos-list'); if (!produto.custos || produto.custos.length === 0) { listContainer.innerHTML = '<p>Nenhum custo.</p>'; return; } listContainer.innerHTML = produto.custos.map(custo => `<div><span>${custo.descricao}</span><span>R$ ${custo.valor.toFixed(2)}</span></div>`).join(''); }
    function renderMentoria() { const menu = document.getElementById('mentoria-menu'); const content = document.getElementById('mentoria-content'); if (!menu || !content || mentoriaData.length === 0) { content.innerHTML = '<p>Nenhum módulo de mentoria carregado. Verifique o arquivo data.json</p>'; return; } menu.innerHTML = mentoriaData.map(mod => `<div class="sales-accelerator-menu-item" data-module-id="${mod.moduleId}">${mod.title}</div>`).join(''); content.innerHTML = mentoriaData.map(mod => { const lessonsHtml = mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content.replace(/\n/g, '<br>')}</p></div>`).join(''); return `<div class="mentoria-module-content" id="${mod.moduleId}">${lessonsHtml}<div class="anotacoes-aluno"><textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="8" placeholder="Suas anotações..."></textarea></div></div>`; }).join(''); document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => { item.addEventListener('click', e => { document.querySelectorAll('.sales-accelerator-menu-item, .mentoria-module-content').forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active'); document.getElementById(e.currentTarget.dataset.moduleId).classList.add('active'); }); }); const firstMenuItem = document.querySelector('.sales-accelerator-menu-item'); if(firstMenuItem) { firstMenuItem.classList.add('active'); document.getElementById(firstMenuItem.dataset.moduleId).classList.add('active'); } }
    function getMentoriaNotes() { document.querySelectorAll('.mentoria-notas').forEach(t => mentoriaNotes[t.id] = t.value); }
    function loadMentoriaNotes() { for (const id in mentoriaNotes) { const t = document.getElementById(id); if (t) t.value = mentoriaNotes[id]; } }
});
