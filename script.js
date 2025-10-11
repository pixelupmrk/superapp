document.addEventListener('DOMContentLoaded', () => {
    // --- 1. VARIÁVEIS GLOBAIS ---
    const BOT_BACKEND_URL = 'https://superapp-whatsapp-bot.onrender.com';
    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let statusChart, db, unsubscribeChat, unsubscribeUserData;
    let currentLeadId = null, draggedItem = null, currentProductId = null;

    // --- 2. DECLARAÇÃO DE TODAS AS FUNÇÕES ---

    function applySettings(settings = {}) { const userName = settings.userName || 'Usuário'; const userProfileSpan = document.querySelector('.user-profile span'); const settingUserNameInput = document.getElementById('setting-user-name'); if (userProfileSpan) userProfileSpan.textContent = `Olá, ${userName}`; if (settingUserNameInput) settingUserNameInput.value = userName; }
    function addMessageToChat(msg, type) { const container = document.getElementById('chatbot-messages'); if (!container) return null; const msgDiv = document.createElement('div'); const classes = type.split(' '); classes.forEach(cls => { if(cls) msgDiv.classList.add(cls) }); msgDiv.textContent = msg; container.appendChild(msgDiv); container.scrollTop = container.scrollHeight; return msgDiv; }
    function getMentoriaNotes() { document.querySelectorAll('.mentoria-notas').forEach(t => mentoriaNotes[t.id] = t.value); }
    function loadMentoriaNotes() { for (const id in mentoriaNotes) { const t = document.getElementById(id); if (t) t.value = mentoriaNotes[id]; } }
    function updateNotificationBadge() { const newMessagesCount = leads.reduce((count, lead) => count + (lead.newMessages || 0), 0); const kanbanBadge = document.getElementById('kanban-badge'); const listBadge = document.getElementById('list-badge'); if (kanbanBadge && listBadge) { if (newMessagesCount > 0) { kanbanBadge.textContent = newMessagesCount; listBadge.textContent = newMessagesCount; kanbanBadge.classList.add('visible'); listBadge.classList.add('visible'); } else { kanbanBadge.classList.remove('visible'); listBadge.classList.remove('visible'); } } }
    
    function renderKanbanCards() { document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = ''); leads.forEach(lead => { const c = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`); if (c) c.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${lead.whatsapp}</p></div>`; }); }
    function renderLeadsTable() { const t = document.querySelector('#leads-table tbody'); if (t) t.innerHTML = leads.map(l => `<tr data-id="${l.id}"><td>${l.nome}</td><td>${l.whatsapp}</td><td>${l.status}</td><td><button class="btn-table-action btn-open-lead">Abrir</button></td></tr>`).join(''); }
    function updateDashboard() { const n = leads.filter(l => l.status === 'novo').length; const p = leads.filter(l => l.status === 'progresso').length; const f = leads.filter(l => l.status === 'fechado').length; const totalLeads = document.getElementById('total-leads'); const leadsNovo = document.getElementById('leads-novo'); const leadsProgresso = document.getElementById('leads-progresso'); const leadsFechado = document.getElementById('leads-fechado'); if(totalLeads) totalLeads.textContent = leads.length; if(leadsNovo) leadsNovo.textContent = n; if(leadsProgresso) leadsProgresso.textContent = p; if(leadsFechado) leadsFechado.textContent = f; const ctx = document.getElementById('statusChart')?.getContext('2d'); if (!ctx) return; if (statusChart) statusChart.destroy(); statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Progresso', 'Fechado'], datasets: [{ data: [n, p, f], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'], borderWidth: 0 }] } }); }
    function renderCaixaTable() { const t = document.querySelector('#caixa-table tbody'); if (t) t.innerHTML = caixa.map(m => `<tr data-id="${m.id}"><td>${m.data}</td><td>${m.descricao}</td><td>R$ ${parseFloat(m.valor).toFixed(2)}</td><td>${m.tipo}</td><td><button class="btn-table-action btn-delete-item btn-delete-caixa" data-id="${m.id}">Excluir</button></td></tr>`).join(''); }
    function updateCaixa() { const e = caixa.filter(m => m.tipo === 'entrada').reduce((a, c) => a + parseFloat(c.valor || 0), 0), s = caixa.filter(m => m.tipo === 'saida').reduce((a, c) => a + parseFloat(c.valor || 0), 0); const totalEntradas = document.getElementById('total-entradas'); const totalSaidas = document.getElementById('total-saidas'); const caixaAtual = document.getElementById('caixa-atual'); if(totalEntradas) totalEntradas.textContent = `R$ ${e.toFixed(2)}`; if(totalSaidas) totalSaidas.textContent = `R$ ${s.toFixed(2)}`; if(caixaAtual) caixaAtual.textContent = `R$ ${(e - s).toFixed(2)}`; }
    function renderEstoqueTable() { const t = document.querySelector('#estoque-table tbody'); if(!t) return; t.innerHTML = estoque.map(p => { const totalCustos = p.custos?.reduce((a, c) => a + c.valor, 0) || 0; const lucro = p.venda - p.compra - totalCustos; return `<tr data-id="${p.id}"><td>${p.produto}</td><td>R$ ${p.compra.toFixed(2)}</td><td>R$ ${totalCustos.toFixed(2)}</td><td>R$ ${p.venda.toFixed(2)}</td><td>R$ ${lucro.toFixed(2)}</td><td><button class="btn-table-action btn-custo">Custos</button><button class="btn-table-action btn-delete-item btn-delete-estoque">Excluir</button></td></tr>`}).join(''); }
    function renderCustosList(produto) { const list = document.getElementById('custos-list'); if (!produto.custos || produto.custos.length === 0) { list.innerHTML = '<p>Nenhum custo adicionado.</p>'; return; } list.innerHTML = produto.custos.map(c => `<div><span>${c.descricao}</span><span>R$ ${c.valor.toFixed(2)}</span></div>`).join(''); }
    function renderChatHistory() { const container = document.getElementById('chatbot-messages'); if (!container) return; container.innerHTML = ''; if (chatHistory.length === 0) { addMessageToChat("Olá! Como posso ajudar?", 'bot-message'); } else { chatHistory.forEach(m => addMessageToChat(m.parts[0].text, m.role === 'user' ? 'user-message' : 'bot-message')); } }
    function renderMentoria(mentoriaData) { const menu = document.getElementById('mentoria-menu'); const content = document.getElementById('mentoria-content'); if (!menu || !content || !mentoriaData) return; menu.innerHTML = mentoriaData.map(mod => `<div class="sales-accelerator-menu-item" data-module-id="${mod.moduleId}">${mod.title}</div>`).join(''); content.innerHTML = mentoriaData.map(mod => { const lessonsHtml = mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content.replace(/\n/g, '<br>')}</p></div>`).join(''); return `<div class="mentoria-module-content" id="${mod.moduleId}">${lessonsHtml}<div class="anotacoes-aluno"><textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="8" placeholder="Suas anotações..."></textarea></div></div>`; }).join(''); document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => { item.addEventListener('click', e => { e.preventDefault(); document.querySelectorAll('.sales-accelerator-menu-item, .mentoria-module-content').forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active'); document.getElementById(e.currentTarget.dataset.moduleId).classList.add('active'); }); }); const firstMenuItem = document.querySelector('.sales-accelerator-menu-item'); if (firstMenuItem) { firstMenuItem.classList.add('active'); document.getElementById(firstMenuItem.dataset.moduleId).classList.add('active'); } }
    
    function updateAllUI() { renderKanbanCards(); renderLeadsTable(); updateDashboard(); renderCaixaTable(); updateCaixa(); renderEstoqueTable(); updateNotificationBadge(); }

    async function saveAllUserData(userId, showConfirmation = false) { getMentoriaNotes(); const settings = { userName: document.getElementById('setting-user-name').value || 'Usuário' }; const botInstructions = document.getElementById('bot-instructions').value; const dataToSave = { leads, caixa, estoque, mentoriaNotes, chatHistory, settings, botInstructions }; await db.collection('userData').doc(userId).set({ ...dataToSave }, { merge: true }); if (showConfirmation) alert('Configurações salvas!'); }

    function setupEventListeners(userId) {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => { item.addEventListener('click', e => { e.preventDefault(); if (e.currentTarget.id === 'logout-btn') return; const targetId = e.currentTarget.getAttribute('data-target'); document.querySelectorAll('.sidebar-nav .nav-item, .content-area').forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active'); document.getElementById(targetId)?.classList.add('active'); document.getElementById('page-title').textContent = e.currentTarget.querySelector('span').textContent; }); });
        document.getElementById('save-bot-instructions-btn')?.addEventListener('click', async () => { await saveAllUserData(userId); initBotConnection(userId); });
        document.getElementById('edit-lead-form')?.addEventListener('submit', async e => { e.preventDefault(); const leadIndex = leads.findIndex(l => l.id === currentLeadId); if (leadIndex > -1) { leads[leadIndex].nome = document.getElementById('edit-lead-name').value; leads[leadIndex].whatsapp = document.getElementById('edit-lead-whatsapp').value; leads[leadIndex].status = document.getElementById('edit-lead-status').value; await saveAllUserData(userId); alert('Lead salvo!'); } });
        document.getElementById('toggle-bot-btn')?.addEventListener('click', async () => { const leadIndex = leads.findIndex(l => l.id === currentLeadId); if (leadIndex > -1) { leads[leadIndex].botActive = leads[leadIndex].botActive === undefined ? false : !leads[leadIndex].botActive; await saveAllUserData(userId); updateBotButton(leads[leadIndex].botActive); } });
        document.getElementById('save-settings-btn')?.addEventListener('click', () => saveAllUserData(userId, true));
        document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);
        document.getElementById('chatbot-form')?.addEventListener('submit', e => { e.preventDefault(); handleChatbotSubmit(userId); });
        document.getElementById('export-csv-btn')?.addEventListener('click', () => { if (estoque.length === 0) return alert("Não há produtos para exportar."); const ws = XLSX.utils.json_to_sheet(estoque.map(p => ({...p, custos: JSON.stringify(p.custos)}))); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Estoque"); XLSX.writeFile(wb, "estoque.xlsx"); });
        document.getElementById('menu-toggle')?.addEventListener('click', () => document.querySelector('.app-container').classList.toggle('sidebar-visible'));
        document.getElementById('lead-form')?.addEventListener('submit', async e => { e.preventDefault(); const nextId = leads.length > 0 ? Math.max(...leads.map(l => l.id || 0)) + 1 : 1; leads.push({ id: nextId, status: document.getElementById('lead-status-form').value, nome: document.getElementById('lead-name').value, whatsapp: document.getElementById('lead-whatsapp').value, botActive: true, newMessages: 0 }); await saveAllUserData(userId); e.target.reset(); });
        const kanbanBoard = document.getElementById('kanban-board');
        if (kanbanBoard) {
            kanbanBoard.addEventListener('dragstart', e => { if (e.target.classList.contains('kanban-card')) draggedItem = e.target; });
            kanbanBoard.addEventListener('dragover', e => e.preventDefault());
            kanbanBoard.addEventListener('drop', async e => { e.preventDefault(); const column = e.target.closest('.kanban-column'); if (column && draggedItem) { const leadIndex = leads.findIndex(l => l.id == draggedItem.dataset.id); if (leadIndex > -1) { leads[leadIndex].status = column.dataset.status; await saveAllUserData(userId); } } });
            kanbanBoard.addEventListener('click', e => { e.preventDefault(); const card = e.target.closest('.kanban-card'); if (card) openLeadModal(parseInt(card.dataset.id), userId); });
        }
        document.getElementById('leads-table')?.addEventListener('click', e => { const openBtn = e.target.closest('.btn-open-lead'); if(openBtn) { const leadId = openBtn.closest('tr').dataset.id; openLeadModal(parseInt(leadId), userId); }});
        document.getElementById('delete-lead-btn')?.addEventListener('click', async () => { if (confirm('Tem certeza?')) { leads = leads.filter(l => l.id !== currentLeadId); await saveAllUserData(userId); document.getElementById('lead-modal').style.display = 'none'; } });
        document.querySelectorAll('.close-modal').forEach(btn => { btn.addEventListener('click', () => { document.getElementById(btn.dataset.target).style.display = 'none'; if (unsubscribeChat) unsubscribeChat(); }); });
        document.getElementById('caixa-form')?.addEventListener('submit', async e => { e.preventDefault(); caixa.push({ id: `caixa_${Date.now()}`, data: document.getElementById('caixa-data').value, descricao: document.getElementById('caixa-descricao').value, valor: parseFloat(document.getElementById('caixa-valor').value), tipo: document.getElementById('caixa-tipo').value }); await saveAllUserData(userId); e.target.reset(); });
        document.getElementById('caixa-table')?.addEventListener('click', async e => { const deleteBtn = e.target.closest('.btn-delete-caixa'); if (deleteBtn) { if (confirm('Tem certeza?')) { caixa = caixa.filter(item => item.id !== deleteBtn.dataset.id); await saveAllUserData(userId); } } });
        document.querySelectorAll('.finance-tab').forEach(tab => { tab.addEventListener('click', e => { e.preventDefault(); document.querySelectorAll('.finance-tab, .finance-content').forEach(el => el.classList.remove('active')); e.target.classList.add('active'); document.getElementById(e.target.dataset.tab + '-tab-content').classList.add('active'); }); });
        document.getElementById('estoque-form')?.addEventListener('submit', async e => { e.preventDefault(); estoque.push({ id: `prod_${Date.now()}`, produto: document.getElementById('estoque-produto').value, compra: parseFloat(document.getElementById('estoque-compra').value), venda: parseFloat(document.getElementById('estoque-venda').value), custos: [] }); await saveAllUserData(userId); e.target.reset(); });
        document.getElementById('estoque-table')?.addEventListener('click', async e => { if (e.target.closest('.btn-custo')) openCustosModal(e.target.closest('tr').dataset.id); if (e.target.closest('.btn-delete-estoque')) { if (confirm('Tem certeza?')) { estoque = estoque.filter(p => p.id !== e.target.closest('tr').dataset.id); await saveAllUserData(userId); } } });
        document.getElementById('add-custo-form')?.addEventListener('submit', async e => { e.preventDefault(); const produto = estoque.find(p => p.id === currentProductId); if (produto) { if(!produto.custos) produto.custos = []; produto.custos.push({ descricao: document.getElementById('custo-descricao').value, valor: parseFloat(document.getElementById('custo-valor').value) }); await saveAllUserData(userId); renderCustosList(produto); }});
    }

    function initBotConnection(userId) { if (!userId) return; const c = document.getElementById('bot-connection-area'); c.innerHTML = '<p>Iniciando conexão... Aguarde o QR Code.</p>'; const es = new EventSource(`${BOT_BACKEND_URL}/events?userId=${userId}`); es.onopen = () => {}; es.onmessage = ev => { try { const d = JSON.parse(ev.data); if (d.type === 'qr') { c.innerHTML = `<h3>Escaneie o QR Code</h3><img src="${d.data}" alt="QR Code">`; es.close(); } else if (d.type === 'status') { c.innerHTML = `<p>Status: <strong style="color:lightgreen;">${d.data}</strong></p>`; } } catch (e) {} }; es.onerror = () => { c.innerHTML = '<p style="color:red;">Não foi possível conectar.</p>'; es.close(); }; }
    function updateBotButton(isBotActive) { const btn = document.getElementById('toggle-bot-btn'); if (btn) { if (isBotActive) { btn.textContent = 'Desativar Bot'; btn.style.backgroundColor = ''; btn.style.color = ''; } else { btn.textContent = 'Ativar Bot'; btn.style.backgroundColor = 'var(--delete-color)'; btn.style.color = '#fff'; } } }
    function openLeadModal(leadId, userId) {
        currentLeadId = leadId;
        const leadIndex = leads.findIndex(l => l.id === leadId);
        if (leadIndex === -1) return;
        leads[leadIndex].newMessages = 0;
        saveAllUserData(userId);
        const lead = leads[leadIndex];
        const isBotActive = lead.botActive !== false;
        updateBotButton(isBotActive);
        document.getElementById('lead-modal-title').textContent = `Conversa com ${lead.nome}`;
        document.getElementById('edit-lead-name').value = lead.nome || '';
        document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
        document.getElementById('edit-lead-status').value = lead.status;
        const chatHistoryDiv = document.getElementById('lead-chat-history');
        chatHistoryDiv.innerHTML = '<p>Carregando...</p>';
        if (unsubscribeChat) unsubscribeChat();
        unsubscribeChat = db.collection('userData').doc(userId).collection('leads').doc(String(leadId)).collection('messages').orderBy('timestamp').onSnapshot(snapshot => {
            chatHistoryDiv.innerHTML = '';
            if (snapshot.empty) chatHistoryDiv.innerHTML = '<p>Inicie a conversa!</p>';
            snapshot.forEach(doc => { const msg = doc.data(); const bubble = document.createElement('div'); bubble.className = `msg-bubble msg-from-${msg.sender}`; bubble.textContent = msg.text; chatHistoryDiv.appendChild(bubble); });
            setTimeout(() => { chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight; }, 0);
        });
        document.getElementById('lead-modal').style.display = 'flex';
    }
    function checkTheme() { const theme = localStorage.getItem('theme'); const btn = document.getElementById('theme-toggle-btn'); if (theme === 'light') { document.body.classList.add('light-theme'); if (btn) btn.textContent = 'Mudar para Tema Escuro'; } else { document.body.classList.remove('light-theme'); if (btn) btn.textContent = 'Mudar para Tema Claro'; } }
    function toggleTheme() { document.body.classList.toggle('light-theme'); localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark'); checkTheme(); }
    async function loadMentoriaContent() { try { const response = await fetch('data.json'); const data = await response.json(); renderMentoria(data.mentoria); } catch (error) { console.error("Erro ao carregar mentoria:", error); } }
    async function handleChatbotSubmit(userId) { const input = document.getElementById('chatbot-input'); const text = input.value.trim(); if (!text) return; addMessageToChat(text, 'user-message'); chatHistory.push({ role: "user", parts: [{ text }] }); input.value = ''; const thinkingMsg = addMessageToChat("...", 'bot-message thinking'); await saveAllUserData(userId); try { const response = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: chatHistory.slice(0, -1), prompt: text }) }); if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); const data = await response.json(); thinkingMsg.textContent = data.text; thinkingMsg.classList.remove('thinking'); chatHistory.push({ role: 'model', parts: [{ text: data.text }] }); await saveAllUserData(userId); } catch (error) { thinkingMsg.textContent = "Desculpe, não consegui me conectar à IA."; thinkingMsg.classList.remove('thinking'); } }

    async function main() {
        await loadMentoriaContent();
        firebase.auth().onAuthStateChanged(async user => {
            if (user && !document.body.hasAttribute('data-initialized')) {
                document.body.setAttribute('data-initialized', 'true');
                db = firebase.firestore();
                if (unsubscribeUserData) unsubscribeUserData();
                unsubscribeUserData = db.collection('userData').doc(user.uid).onSnapshot(doc => {
                    console.log("Recebeu atualização do Firebase!");
                    if (doc.exists) {
                        const data = doc.data();
                        leads = data.leads || [];
                        caixa = data.caixa || [];
                        estoque = data.estoque || [];
                        updateAllUI();
                    }
                }, err => {
                    console.error("Erro no listener do Firebase:", err);
                });
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
            }
        });
        checkTheme();
    }
    main(); 
});
