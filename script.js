document.addEventListener('DOMContentLoaded', () => {
    const mentoriaData = [{"moduleId":"MD01","title":"Módulo 1: Conectando com o Cliente Ideal","lessons":[{"title":"Questionário para Definição de Persona","content":"Antes de qualquer estratégia, é essencial saber com quem você está falando..."}]}, {"moduleId":"MD02","title":"Módulo 2: O Algoritmo da Meta","lessons":[{"title":"Como o Algoritmo Funciona","content":"O algoritmo da Meta analisa o comportamento dos usuários..."}]}, {"moduleId":"MD03","title":"Módulo 3: Cronograma de Postagens","lessons":[{"title":"Exemplo de Cronograma Semanal","content":"Utilize um calendário para organizar o conteúdo por dia da semana..."}]}, {"moduleId":"MD04","title":"Módulo 4: Conteúdo que Conecta","lessons":[{"title":"Estrutura de Vídeos que Engajam","content":"Um vídeo precisa seguir uma estrutura estratégica: Gancho, Valor e CTA..."}]}, {"moduleId":"MD05","title":"Módulo 5: Copywriting com ChatGPT","lessons":[{"title":"Como Criar Textos Persuasivos","content":"O ChatGPT é uma ferramenta poderosa..."}]}, {"moduleId":"MD06","title":"Módulo 6: Implementação de CRM","lessons":[{"title":"O que é CRM","content":"CRM é uma ferramenta que organiza o relacionamento..."}]}, {"moduleId":"MD07","title":"Módulo 7: Processo Comercial","lessons":[{"title":"Como Montar um Pitch Comercial","content":"O pitch é a sua 'apresentação relâmpago'..."}]}, {"moduleId":"MD08","title":"Módulo 8: Conexão com a Audiência","lessons":[{"title":"Gerando Conexão Real","content":"Pessoas se conectam com pessoas..."}]}];
    const BOT_BACKEND_URL = 'https://superapp-whatsapp-bot.onrender.com';

    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let currentLeadId = null, draggedItem = null, currentProductId = null;
    let statusChart;
    let db;
    let unsubscribeChat;

    async function main() { firebase.auth().onAuthStateChanged(async user => { if (user && !document.body.hasAttribute('data-initialized')) { document.body.setAttribute('data-initialized', 'true'); db = firebase.firestore(); await loadAllUserData(user.uid); setupEventListeners(user.uid); } }); }
    main();

    async function loadAllUserData(userId) {
        const doc = await db.collection('userData').doc(userId).get();
        if (doc.exists) {
            const data = doc.data();
            leads = data.leads || [];
            caixa = data.caixa || [];
            estoque = data.estoque || [];
            mentoriaNotes = data.mentoriaNotes || {};
            chatHistory = data.chatHistory || [];
            document.getElementById('bot-instructions').value = data.botInstructions || '';
            applySettings(data.settings);
        }
        renderMentoria();
        loadMentoriaNotes();
        renderChatHistory();
        updateAllUI();
    }

    async function saveAllUserData(userId) {
        getMentoriaNotes();
        const settings = { userName: document.getElementById('setting-user-name').value || 'Usuário' };
        const botInstructions = document.getElementById('bot-instructions').value;
        const dataToSave = { leads, caixa, estoque, mentoriaNotes, chatHistory, settings, botInstructions };
        await db.collection('userData').doc(userId).set(dataToSave, { merge: true });
    }

    function applySettings(settings = {}) {
        const userName = settings.userName || 'Usuário';
        document.querySelector('.user-profile span').textContent = `Olá, ${userName}`;
        document.getElementById('setting-user-name').value = userName;
    }

    function updateAllUI() { renderKanbanCards(); renderLeadsTable(); updateDashboard(); renderCaixaTable(); updateCaixa(); renderEstoqueTable(); }
    
    function setupEventListeners(userId) {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => { item.addEventListener('click', e => { e.preventDefault(); if (e.currentTarget.id === 'logout-btn') return; const targetId = e.currentTarget.getAttribute('data-target'); document.querySelectorAll('.sidebar-nav .nav-item, .content-area').forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active'); document.getElementById(targetId).classList.add('active'); document.getElementById('page-title').textContent = e.currentTarget.querySelector('span').textContent; }); });
        document.getElementById('save-settings-btn')?.addEventListener('click', async () => { await saveAllUserData(userId); applySettings({ userName: document.getElementById('setting-user-name').value }); alert('Configurações salvas!'); });
        document.getElementById('lead-form')?.addEventListener('submit', async e => { e.preventDefault(); const nextId = leads.length > 0 ? Math.max(...leads.map(l => l.id || 0)) + 1 : 1; leads.push({ id: nextId, status: document.getElementById('lead-status-form').value, nome: document.getElementById('lead-name').value, whatsapp: document.getElementById('lead-whatsapp').value }); await saveAllUserData(userId); updateAllUI(); e.target.reset(); });
        const kanbanBoard = document.getElementById('kanban-board');
        kanbanBoard.addEventListener('dragstart', e => { if (e.target.classList.contains('kanban-card')) draggedItem = e.target; });
        kanbanBoard.addEventListener('dragover', e => e.preventDefault());
        kanbanBoard.addEventListener('drop', async e => { e.preventDefault(); const column = e.target.closest('.kanban-column'); if (column && draggedItem) { const lead = leads.find(l => l.id == draggedItem.dataset.id); if (lead) { lead.status = column.dataset.status; await saveAllUserData(userId); updateAllUI(); } } });
        kanbanBoard.addEventListener('click', e => { e.preventDefault(); const card = e.target.closest('.kanban-card'); if (card) openLeadModal(parseInt(card.dataset.id), userId); });
        document.getElementById('leads-table').addEventListener('click', e => { e.preventDefault(); if (e.target.closest('.btn-open-lead')) { const leadId = e.target.closest('tr').dataset.id; openLeadModal(parseInt(leadId), userId); } });
        document.getElementById('edit-lead-form').addEventListener('submit', async e => { e.preventDefault(); const lead = leads.find(l => l.id === currentLeadId); if(lead) { lead.nome = document.getElementById('edit-lead-name').value; lead.whatsapp = document.getElementById('edit-lead-whatsapp').value; lead.status = document.getElementById('edit-lead-status').value; await saveAllUserData(userId); updateAllUI(); alert('Lead salvo!'); } });
        document.getElementById('delete-lead-btn').addEventListener('click', async () => { if (confirm('Tem certeza?')) { leads = leads.filter(l => l.id !== currentLeadId); await saveAllUserData(userId); updateAllUI(); document.getElementById('lead-modal').style.display = 'none'; } });
        document.getElementById('lead-chat-form').addEventListener('submit', async e => { e.preventDefault(); const input = document.getElementById('lead-chat-input'); const text = input.value.trim(); if (text && currentLeadId) { await db.collection('userData').doc(userId).collection('leads').doc(String(currentLeadId)).collection('messages').add({ text, sender: 'operator', timestamp: new Date() }); input.value = ''; } });
        document.getElementById('chatbot-form').addEventListener('submit', async e => { e.preventDefault(); const input = document.getElementById('chatbot-input'); const text = input.value.trim(); if (!text) return; addMessageToChat(text, 'user-message'); chatHistory.push({ role: "user", parts: [{ text }] }); input.value = ''; addMessageToChat("...", 'bot-message'); await saveAllUserData(userId); });
        document.querySelectorAll('.close-modal').forEach(btn => { btn.addEventListener('click', () => { document.getElementById(btn.dataset.target).style.display = 'none'; if (unsubscribeChat) unsubscribeChat(); }); });
        document.getElementById('caixa-form')?.addEventListener('submit', async e => { e.preventDefault(); caixa.push({ id: `caixa_${Date.now()}`, data: document.getElementById('caixa-data').value, descricao: document.getElementById('caixa-descricao').value, valor: parseFloat(document.getElementById('caixa-valor').value), tipo: document.getElementById('caixa-tipo').value }); await saveAllUserData(userId); updateAllUI(); e.target.reset(); });
        document.getElementById('caixa-table').addEventListener('click', async e => { if (e.target.closest('.btn-delete-caixa')) { if (confirm('Tem certeza?')) { const itemId = e.target.dataset.id; caixa = caixa.filter(item => item.id !== itemId); await saveAllUserData(userId); updateAllUI(); } } });
        document.querySelectorAll('.finance-tab').forEach(tab => { tab.addEventListener('click', e => { e.preventDefault(); document.querySelectorAll('.finance-tab, .finance-content').forEach(el => el.classList.remove('active')); e.target.classList.add('active'); document.getElementById(e.target.dataset.tab + '-tab-content').classList.add('active'); }); });
        document.getElementById('estoque-form')?.addEventListener('submit', async e => { e.preventDefault(); estoque.push({ id: `prod_${Date.now()}`, produto: document.getElementById('estoque-produto').value, compra: parseFloat(document.getElementById('estoque-compra').value), venda: parseFloat(document.getElementById('estoque-venda').value), custos: [] }); await saveAllUserData(userId); renderEstoqueTable(); e.target.reset(); });
        document.getElementById('estoque-table').addEventListener('click', async e => { e.preventDefault(); if (e.target.closest('.btn-custo')) { openCustosModal(e.target.closest('tr').dataset.id); } if (e.target.closest('.btn-delete-estoque')) { if (confirm('Tem certeza?')) { const productId = e.target.closest('tr').dataset.id; estoque = estoque.filter(p => p.id !== productId); await saveAllUserData(userId); updateAllUI(); } } });
        document.getElementById('add-custo-form').addEventListener('submit', async e => { e.preventDefault(); const produto = estoque.find(p => p.id === currentProductId); if (produto) { if(!produto.custos) produto.custos = []; produto.custos.push({ descricao: document.getElementById('custo-descricao').value, valor: parseFloat(document.getElementById('custo-valor').value) }); await saveAllUserData(userId); renderCustosList(produto); renderEstoqueTable(); e.target.reset(); }});
        document.getElementById('export-csv-btn')?.addEventListener('click', () => { if (estoque.length === 0) return alert("Não há produtos para exportar."); const ws = XLSX.utils.json_to_sheet(estoque); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Estoque"); XLSX.writeFile(wb, "estoque.xlsx"); });
        document.getElementById('save-bot-instructions-btn').addEventListener('click', async () => { await saveAllUserData(userId); alert('Instruções salvas! Iniciando conexão...'); initBotConnection(); });
    }

    function initBotConnection() { const c = document.getElementById('bot-connection-area'); c.innerHTML = '<p>Tentando conectar ao servidor do bot... Isso pode levar até 1 minuto se ele estiver inativo.</p>'; const es = new EventSource(`${BOT_BACKEND_URL}/events`); es.onmessage = ev => { const d = JSON.parse(ev.data); if (d.type === 'qr') c.innerHTML = `<h3>Escaneie o QR Code</h3><img src="${d.data}" alt="QR Code">`; else if (d.type === 'status') c.innerHTML = `<p>Status: <strong style="color:lightgreen;">${d.data}</strong></p>`; }; es.onerror = () => { c.innerHTML = '<p style="color:red;">Não foi possível conectar. Verifique se o bot está ativo no Render e tente novamente.</p>'; es.close(); }; }
    function openLeadModal(leadId, userId) { currentLeadId = leadId; const lead = leads.find(l => l.id === leadId); if (!lead) return; document.getElementById('lead-modal-title').textContent = `Conversa com ${lead.nome}`; document.getElementById('edit-lead-name').value = lead.nome || ''; document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || ''; document.getElementById('edit-lead-status').value = lead.status; const chatHistoryDiv = document.getElementById('lead-chat-history'); chatHistoryDiv.innerHTML = '<p>Carregando...</p>'; if (unsubscribeChat) unsubscribeChat(); unsubscribeChat = db.collection('userData').doc(userId).collection('leads').doc(String(leadId)).collection('messages').orderBy('timestamp').onSnapshot(snapshot => { chatHistoryDiv.innerHTML = ''; if (snapshot.empty) chatHistoryDiv.innerHTML = '<p>Inicie a conversa!</p>'; snapshot.forEach(doc => { const msg = doc.data(); const bubble = document.createElement('div'); bubble.classList.add('msg-bubble', msg.sender === 'operator' ? 'msg-from-operator' : 'msg-from-lead'); bubble.textContent = msg.text; chatHistoryDiv.appendChild(bubble); }); chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight; }); document.getElementById('lead-modal').style.display = 'flex'; }
    function openCustosModal(productId) { currentProductId = productId; const produto = estoque.find(p => p.id === productId); if (produto) { document.getElementById('custos-modal-title').textContent = `Custos de: ${produto.produto}`; renderCustosList(produto); document.getElementById('custos-modal').style.display = 'flex'; } }
    
    function renderKanbanCards() { document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = ''); leads.forEach(lead => { const c = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`); if (c) c.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${lead.whatsapp}</p></div>`; }); }
    function renderLeadsTable() { const t = document.querySelector('#leads-table tbody'); if (t) t.innerHTML = leads.map(l => `<tr data-id="${l.id}"><td>${l.nome}</td><td>${l.whatsapp}</td><td>${l.status}</td><td><button class="btn-table-action btn-open-lead">Abrir</button></td></tr>`).join(''); }
    function updateDashboard() { const n = leads.filter(l => l.status === 'novo').length; const p = leads.filter(l => l.status === 'progresso').length; const f = leads.filter(l => l.status === 'fechado').length; document.getElementById('total-leads').textContent = leads.length; document.getElementById('leads-novo').textContent = n; document.getElementById('leads-progresso').textContent = p; document.getElementById('leads-fechado').textContent = f; const ctx = document.getElementById('statusChart')?.getContext('2d'); if (!ctx) return; if (statusChart) statusChart.destroy(); statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Progresso', 'Fechado'], datasets: [{ data: [n, p, f], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'], borderWidth: 0 }] } }); }
    function renderCaixaTable() { const t = document.querySelector('#caixa-table tbody'); if (t) t.innerHTML = caixa.map(m => `<tr data-id="${m.id}"><td>${m.data}</td><td>${m.descricao}</td><td>R$ ${parseFloat(m.valor).toFixed(2)}</td><td>${m.tipo}</td><td><button class="btn-table-action btn-delete-item btn-delete-caixa" data-id="${m.id}">Excluir</button></td></tr>`).join(''); }
    function updateCaixa() { const e = caixa.filter(m => m.tipo === 'entrada').reduce((a, c) => a + parseFloat(c.valor || 0), 0), s = caixa.filter(m => m.tipo === 'saida').reduce((a, c) => a + parseFloat(c.valor || 0), 0); document.getElementById('total-entradas').textContent = `R$ ${e.toFixed(2)}`; document.getElementById('total-saidas').textContent = `R$ ${s.toFixed(2)}`; document.getElementById('caixa-atual').textContent = `R$ ${(e - s).toFixed(2)}`; }
    function renderEstoqueTable() { const t = document.querySelector('#estoque-table tbody'); if(!t) return; t.innerHTML = estoque.map(p => `<tr data-id="${p.id}"><td>${p.produto}</td><td>R$ ${parseFloat(p.compra).toFixed(2)}</td><td>...</td><td>R$ ${parseFloat(p.venda).toFixed(2)}</td><td>...</td><td><button class="btn-table-action btn-custo">Custos</button><button class="btn-table-action btn-delete-item btn-delete-estoque">Excluir</button></td></tr>`).join(''); }
    function renderCustosList(produto) { const list = document.getElementById('custos-list'); if (!produto.custos || produto.custos.length === 0) { list.innerHTML = '<p>Nenhum custo.</p>'; return; } list.innerHTML = produto.custos.map(c => `<div><span>${c.descricao}</span><span>R$ ${c.valor.toFixed(2)}</span></div>`).join(''); }
    function renderMentoria() { const menu = document.getElementById('mentoria-menu'); const content = document.getElementById('mentoria-content'); if (!menu || !content || mentoriaData.length === 0) return; menu.innerHTML = mentoriaData.map(mod => `<div class="sales-accelerator-menu-item" data-module-id="${mod.moduleId}">${mod.title}</div>`).join(''); content.innerHTML = mentoriaData.map(mod => { const lessonsHtml = mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content.replace(/\n/g, '<br>')}</p></div>`).join(''); return `<div class="mentoria-module-content" id="${mod.moduleId}">${lessonsHtml}<div class="anotacoes-aluno"><textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="8" placeholder="Suas anotações..."></textarea></div></div>`; }).join(''); document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => { item.addEventListener('click', e => { e.preventDefault(); document.querySelectorAll('.sales-accelerator-menu-item, .mentoria-module-content').forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active'); document.getElementById(e.currentTarget.dataset.moduleId).classList.add('active'); }); }); const firstMenuItem = document.querySelector('.sales-accelerator-menu-item'); if (firstMenuItem) { firstMenuItem.classList.add('active'); document.getElementById(firstMenuItem.dataset.moduleId).classList.add('active'); } }
    function addMessageToChat(msg, type) { const container = document.getElementById('chatbot-messages'); if (container) { const msgDiv = document.createElement('div'); msgDiv.classList.add(type); msgDiv.textContent = msg; container.appendChild(msgDiv); container.scrollTop = container.scrollHeight; } }
    function renderChatHistory() { const container = document.getElementById('chatbot-messages'); if (!container) return; container.innerHTML = ''; if (chatHistory.length === 0) { addMessageToChat("Olá! Como posso ajudar?", 'bot-message'); } else { chatHistory.forEach(m => addMessageToChat(m.parts[0].text, m.role === 'user' ? 'user-message' : 'bot-message')); } }
    function getMentoriaNotes() { document.querySelectorAll('.mentoria-notas').forEach(t => mentoriaNotes[t.id] = t.value); }
    function loadMentoriaNotes() { for (const id in mentoriaNotes) { const t = document.getElementById(id); if (t) t.value = mentoriaNotes[id]; } }
});
// No topo do seu arquivo principal (index.js) do bot
const cors = require('cors');

// ... outras inicializações como 'const express = require('express');'

const app = express(); // Você provavelmente já tem essa linha

// ADICIONE ESTA LINHA LOGO ABAIXO
// Isso irá permitir que o seu Super App se conecte ao bot
app.use(cors()); 

// ... resto do seu código (app.get('/events'), etc.)
