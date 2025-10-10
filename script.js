document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DECLARAÇÃO DE VARIÁVEIS GLOBAIS ---
    const BOT_BACKEND_URL = 'https://superapp-whatsapp-bot.onrender.com';
    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let statusChart, db, unsubscribeChat;
    let currentLeadId = null, draggedItem = null, currentProductId = null;

    // --- 2. DECLARAÇÃO DE TODAS AS FUNÇÕES ---

    async function main() {
        await loadMentoriaContent();
        firebase.auth().onAuthStateChanged(async user => {
            if (user && !document.body.hasAttribute('data-initialized')) {
                document.body.setAttribute('data-initialized', 'true');
                db = firebase.firestore();
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
            }
        });
        checkTheme();
    }

    async function loadMentoriaContent() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            renderMentoria(data.mentoria);
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
            chatHistory = data.chatHistory || [];
            document.getElementById('bot-instructions').value = data.botInstructions || '';
            applySettings(data.settings);
        }
        loadMentoriaNotes();
        renderChatHistory();
        updateAllUI();
    }

    async function saveAllUserData(userId, showConfirmation = false) {
        getMentoriaNotes();
        const settings = { userName: document.getElementById('setting-user-name').value || 'Usuário' };
        const botInstructions = document.getElementById('bot-instructions').value;
        const dataToSave = { leads, caixa, estoque, mentoriaNotes, chatHistory, settings, botInstructions };
        await db.collection('userData').doc(userId).set({ ...dataToSave }, { merge: true });
        if (showConfirmation) alert('Configurações salvas!');
    }

    function setupEventListeners(userId) {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => { item.addEventListener('click', e => { e.preventDefault(); if (e.currentTarget.id === 'logout-btn') return; const targetId = e.currentTarget.getAttribute('data-target'); document.querySelectorAll('.sidebar-nav .nav-item, .content-area').forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active'); document.getElementById(targetId)?.classList.add('active'); if(document.getElementById('page-title')) document.getElementById('page-title').textContent = e.currentTarget.querySelector('span').textContent; }); });
        document.getElementById('save-bot-instructions-btn')?.addEventListener('click', async () => { await saveAllUserData(userId); initBotConnection(userId); });
        document.getElementById('edit-lead-form').addEventListener('submit', async e => { e.preventDefault(); const leadIndex = leads.findIndex(l => l.id === currentLeadId); if (leadIndex > -1) { leads[leadIndex].nome = document.getElementById('edit-lead-name').value; leads[leadIndex].whatsapp = document.getElementById('edit-lead-whatsapp').value; leads[leadIndex].status = document.getElementById('edit-lead-status').value; await saveAllUserData(userId); updateAllUI(); alert('Lead salvo!'); } });
        document.getElementById('toggle-bot-btn').addEventListener('click', async () => { const leadIndex = leads.findIndex(l => l.id === currentLeadId); if (leadIndex > -1) { if (leads[leadIndex].botActive === undefined) { leads[leadIndex].botActive = false; } else { leads[leadIndex].botActive = !leads[leadIndex].botActive; } await saveAllUserData(userId); updateBotButton(leads[leadIndex].botActive); alert(`Bot ${leads[leadIndex].botActive ? 'ATIVADO' : 'DESATIVADO'} para este lead.`); } });
        document.getElementById('save-settings-btn')?.addEventListener('click', () => saveAllUserData(userId, true));
        document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);
        document.getElementById('chatbot-form')?.addEventListener('submit', e => { e.preventDefault(); handleChatbotSubmit(userId); });
        document.getElementById('export-csv-btn')?.addEventListener('click', () => { if (estoque.length === 0) return alert("Não há produtos para exportar."); const ws = XLSX.utils.json_to_sheet(estoque); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Estoque"); XLSX.writeFile(wb, "estoque.xlsx"); });
        document.getElementById('menu-toggle')?.addEventListener('click', () => document.querySelector('.app-container').classList.toggle('sidebar-visible'));
        // ...outros listeners que já funcionavam
    }

    function initBotConnection(userId) { if (!userId) return; const c = document.getElementById('bot-connection-area'); c.innerHTML = '<p>Iniciando conexão... Aguarde o QR Code.</p>'; const es = new EventSource(`${BOT_BACKEND_URL}/events?userId=${userId}`); es.onopen = () => {}; es.onmessage = ev => { try { const d = JSON.parse(ev.data); if (d.type === 'qr') { c.innerHTML = `<h3>Escaneie o QR Code</h3><img src="${d.data}" alt="QR Code">`; es.close(); } else if (d.type === 'status') { c.innerHTML = `<p>Status: <strong style="color:lightgreen;">${d.data}</strong></p>`; } } catch (e) {} }; es.onerror = () => { c.innerHTML = '<p style="color:red;">Não foi possível conectar.</p>'; es.close(); }; }
    
    function updateBotButton(isBotActive) { const btn = document.getElementById('toggle-bot-btn'); if (btn) { if (isBotActive) { btn.textContent = 'Desativar Bot'; btn.style.backgroundColor = ''; btn.style.color = ''; } else { btn.textContent = 'Ativar Bot'; btn.style.backgroundColor = 'var(--delete-color)'; btn.style.color = '#fff'; } } }

    function openLeadModal(leadId, userId) {
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;
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
            snapshot.forEach(doc => {
                const msg = doc.data();
                const bubble = document.createElement('div');
                bubble.className = `msg-bubble msg-from-${msg.sender}`;
                bubble.textContent = msg.text;
                chatHistoryDiv.appendChild(bubble);
            });
            chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
        });
        document.getElementById('lead-modal').style.display = 'flex';
    }

    // --- Funções Auxiliares (Render, Toggle, etc.) ---
    function checkTheme() { const theme = localStorage.getItem('theme'); const btn = document.getElementById('theme-toggle-btn'); if (theme === 'light') { document.body.classList.add('light-theme'); if (btn) btn.textContent = 'Mudar para Tema Escuro'; } else { document.body.classList.remove('light-theme'); if (btn) btn.textContent = 'Mudar para Tema Claro'; } }
    function toggleTheme() { document.body.classList.toggle('light-theme'); localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark'); checkTheme(); }
    function renderMentoria(mentoriaData) { const menu = document.getElementById('mentoria-menu'); const content = document.getElementById('mentoria-content'); if (!menu || !content || !mentoriaData) return; menu.innerHTML = mentoriaData.map(mod => `<div class="sales-accelerator-menu-item" data-module-id="${mod.moduleId}">${mod.title}</div>`).join(''); content.innerHTML = mentoriaData.map(mod => { const lessonsHtml = mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content.replace(/\n/g, '<br>')}</p></div>`).join(''); return `<div class="mentoria-module-content" id="${mod.moduleId}">${lessonsHtml}<div class="anotacoes-aluno"><textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="8" placeholder="Suas anotações..."></textarea></div></div>`; }).join(''); document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => { item.addEventListener('click', e => { e.preventDefault(); document.querySelectorAll('.sales-accelerator-menu-item, .mentoria-module-content').forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active'); document.getElementById(e.currentTarget.dataset.moduleId).classList.add('active'); }); }); const firstMenuItem = document.querySelector('.sales-accelerator-menu-item'); if (firstMenuItem) { firstMenuItem.classList.add('active'); document.getElementById(firstMenuItem.dataset.moduleId).classList.add('active'); } }
    function getMentoriaNotes() { document.querySelectorAll('.mentoria-notas').forEach(t => mentoriaNotes[t.id] = t.value); }
    function loadMentoriaNotes() { for (const id in mentoriaNotes) { const t = document.getElementById(id); if (t) t.value = mentoriaNotes[id]; } }
    // ...demais funções que já funcionavam
    
    // --- 3. PONTO DE ENTRADA DO SCRIPT ---
    main();
});
