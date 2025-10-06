document.addEventListener('DOMContentLoaded', () => {
    // Variáveis globais para os dados
    let leads = [];
    let caixa = [];
    let estoque = [];
    let chatHistory = [];
    let nextLeadId = 0; // Será gerenciado pelo Firestore agora
    let statusChart;
    let currentEstoqueDescricao = null;
    let draggedItem = null;
    let currentLeadId = null;
    let db; // Instância do Firestore

    // --- Seletores de Elementos ---
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const contentAreas = document.querySelectorAll('.main-content .content-area');
    const pageTitle = document.getElementById('page-title');
    const kanbanBoard = document.getElementById('kanban-board');
    const leadForm = document.getElementById('lead-form');
    const editModal = document.getElementById('edit-lead-modal');
    const editForm = document.getElementById('edit-lead-form');
    const caixaForm = document.getElementById('caixa-form');
    const financeTabs = document.querySelectorAll('.finance-tab');
    const estoqueForm = document.getElementById('estoque-form');
    const estoqueSearch = document.getElementById('estoque-search');
    const addCustoModal = document.getElementById('add-custo-modal');
    const addCustoForm = document.getElementById('add-custo-form');
    const importEstoqueFile = document.getElementById('import-estoque-file');
    const exportEstoqueBtn = document.getElementById('export-estoque-btn');
    const exportLeadsBtn = document.getElementById('export-excel-btn');
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const saveSettingsButton = document.getElementById('save-settings-btn');
    const userNameInput = document.getElementById('setting-user-name');
    const companyNameInput = document.getElementById('setting-company-name');
    const userNameDisplay = document.querySelector('.user-profile span');
    const chatbotForm = document.getElementById('chatbot-form');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');

    // --- INICIALIZAÇÃO E AUTENTICAÇÃO ---
    function initializeApp() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                db = firebase.firestore();
                loadAllUserData(user.uid); // Carrega TODOS os dados do usuário
            }
        });
    }

    // --- PERSISTÊNCIA DE DADOS (FIRESTORE) ---

    // Função central para SALVAR todos os dados
    async function saveAllUserData(userId) {
        if (!db || !userId) return;
        try {
            const userData = {
                leads: leads,
                caixa: caixa,
                estoque: estoque,
                chatHistory: chatHistory,
                settings: {
                    theme: document.body.classList.contains('light-theme') ? 'light' : 'dark',
                    userName: userNameInput.value.trim() || 'Usuário',
                    companyName: companyNameInput.value.trim()
                }
            };
            await db.collection('userData').doc(userId).set(userData, { merge: true });
        } catch (error) {
            console.error("Erro ao salvar dados do usuário:", error);
        }
    }

    // Função central para CARREGAR todos os dados
    async function loadAllUserData(userId) {
        if (!db || !userId) return;
        try {
            const doc = await db.collection('userData').doc(userId).get();
            if (doc.exists) {
                const data = doc.data();
                
                // Carrega Leads, Caixa e Estoque
                leads = data.leads || [];
                caixa = data.caixa || [];
                estoque = data.estoque || [];
                
                // Carrega Histórico do Chat
                chatHistory = data.chatHistory || [];
                renderChatHistory();

                // Carrega Configurações
                applySettings(data.settings);
                
                // Recalcula o próximo ID de lead
                nextLeadId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 0;

            } else {
                 // Se não houver dados, exibe a mensagem inicial do bot
                addMessageToChat("Olá! Eu sou seu assistente de vendas. Como posso ajudar?", 'bot-message');
            }
            // Atualiza a interface com os dados carregados
            updateAllUI();
        } catch (error) {
            console.error("Erro ao carregar dados do usuário:", error);
        }
    }
    
    // Função para atualizar toda a interface
    function updateAllUI() {
        updateDashboard();
        renderKanbanCards();
        renderLeadsTable();
        updateCaixa();
        renderCaixaTable();
        updateEstoque();
        renderEstoqueTable();
    }
    
    // --- LÓGICA DE CONFIGURAÇÕES ---
    function applySettings(settings) {
        const defaultSettings = { theme: 'dark', userName: 'Usuário', companyName: '' };
        const s = { ...defaultSettings, ...settings };

        if (s.theme === 'light') {
            document.body.classList.add('light-theme');
            if (themeToggleButton) themeToggleButton.textContent = 'Mudar para Tema Escuro';
        } else {
            document.body.classList.remove('light-theme');
            if (themeToggleButton) themeToggleButton.textContent = 'Mudar para Tema Claro';
        }

        if (userNameInput) userNameInput.value = s.userName === 'Usuário' ? '' : s.userName;
        if (userNameDisplay) userNameDisplay.textContent = `Olá, ${s.userName}`;
        if (companyNameInput) companyNameInput.value = s.companyName;
    }

    if (saveSettingsButton) {
        saveSettingsButton.addEventListener('click', () => {
            const user = firebase.auth().currentUser;
            if (user) {
                saveAllUserData(user.uid);
                applySettings({ // Aplica imediatamente na tela
                    theme: document.body.classList.contains('light-theme') ? 'light' : 'dark',
                    userName: userNameInput.value.trim() || 'Usuário',
                    companyName: companyNameInput.value.trim()
                });
                alert('Configurações salvas com sucesso!');
            }
        });
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const user = firebase.auth().currentUser;
            if (user) {
                saveAllUserData(user.uid); // Salva a mudança de tema
            }
        });
    }

    // --- NAVEGAÇÃO ---
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-target');
            if (!targetId) return;

            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');

            contentAreas.forEach(area => area.style.display = 'none');
            const targetArea = document.getElementById(targetId);
            if (targetArea) targetArea.style.display = 'block';

            if (pageTitle) pageTitle.textContent = e.currentTarget.querySelector('span').textContent;
            if (targetId === 'dashboard-section') updateStatusChart();
        });
    });
    
    // --- LÓGICA DO CRM (LEADS) ---
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = firebase.auth().currentUser;
            if (!user) return;

            const newLead = {
                id: nextLeadId++,
                nome: document.getElementById('lead-name').value,
                email: document.getElementById('lead-email').value,
                whatsapp: document.getElementById('lead-whatsapp').value,
                atendente: document.getElementById('lead-attendant').value,
                origem: document.getElementById('lead-origin').value,
                data: document.getElementById('lead-date').value,
                qualificacao: document.getElementById('lead-qualification').value,
                notas: document.getElementById('lead-notes').value,
                status: 'novo'
            };
            leads.push(newLead);
            updateAllUI();
            saveAllUserData(user.uid);
            leadForm.reset();
        });
    }
    
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = firebase.auth().currentUser;
            const leadIndex = leads.findIndex(l => l.id === currentLeadId);
            if (leadIndex > -1 && user) {
                leads[leadIndex] = {
                    ...leads[leadIndex],
                    nome: document.getElementById('edit-lead-name').value,
                    email: document.getElementById('edit-lead-email').value,
                    whatsapp: document.getElementById('edit-lead-whatsapp').value,
                    status: document.getElementById('edit-lead-status').value,
                    atendente: document.getElementById('edit-lead-attendant').value,
                    origem: document.getElementById('edit-lead-origem').value,
                    data: document.getElementById('edit-lead-date').value,
                    qualificacao: document.getElementById('edit-lead-qualification').value,
                    notas: document.getElementById('edit-lead-notes').value,
                };
                updateAllUI();
                saveAllUserData(user.uid);
                if (editModal) editModal.style.display = 'none';
            }
        });
    }
    
    document.body.addEventListener('click', (e) => {
        // Editar Lead (da tabela)
        const editButton = e.target.closest('.btn-edit-table');
        if (editButton) {
            const row = editButton.closest('tr');
            currentLeadId = parseInt(row.getAttribute('data-id'));
            const lead = leads.find(l => l.id === currentLeadId);
            if (lead && editForm) {
                document.getElementById('edit-lead-name').value = lead.nome || '';
                document.getElementById('edit-lead-email').value = lead.email || '';
                document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
                document.getElementById('edit-lead-status').value = lead.status || '';
                document.getElementById('edit-lead-attendant').value = lead.atendente || '';
                document.getElementById('edit-lead-origem').value = lead.origem || '';
                document.getElementById('edit-lead-date').value = lead.data || '';
                document.getElementById('edit-lead-qualification').value = lead.qualificacao || '';
                document.getElementById('edit-lead-notes').value = lead.notas || '';
                if(editModal) editModal.style.display = 'flex';
            }
        }

        // Deletar Lead (da tabela)
        const deleteButton = e.target.closest('.btn-delete-table');
        if (deleteButton) {
            const user = firebase.auth().currentUser;
            if (confirm('Tem certeza que deseja excluir este lead?')) {
                const row = deleteButton.closest('tr');
                const leadId = parseInt(row.getAttribute('data-id'));
                leads = leads.filter(l => l.id !== leadId);
                updateAllUI();
                if (user) saveAllUserData(user.uid);
            }
        }
    });

    function renderKanbanCards() {
        if (!kanbanBoard) return;
        kanbanBoard.querySelectorAll('.kanban-cards-list').forEach(list => list.innerHTML = '');
        leads.forEach(lead => {
            const card = document.createElement('div');
            card.className = 'kanban-card';
            card.draggable = true;
            card.dataset.id = lead.id;
            card.innerHTML = `<strong>${lead.nome}</strong><p>${lead.whatsapp}</p>`;
            const column = kanbanBoard.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (column) column.appendChild(card);
        });
    }

    function renderLeadsTable() {
        const tableBody = document.querySelector('#leads-table tbody');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        leads.forEach(lead => {
            const row = tableBody.insertRow();
            row.dataset.id = lead.id;
            row.innerHTML = `
                <td>${lead.nome || ''}</td>
                <td><a href="https://wa.me/${lead.whatsapp || ''}" target="_blank">${lead.whatsapp || ''}</a></td>
                <td>${lead.origem || ''}</td>
                <td>${lead.qualificacao || ''}</td>
                <td>${lead.status || ''}</td>
                <td>
                    <button class="btn-edit-table"><i class="ph-fill ph-note-pencil"></i></button>
                    <button class="btn-delete-table"><i class="ph-fill ph-trash"></i></button>
                </td>
            `;
        });
    }

    function updateDashboard() {
        if (!document.getElementById('total-leads')) return;
        document.getElementById('total-leads').textContent = leads.length;
        document.getElementById('leads-novo').textContent = leads.filter(l => l.status === 'novo').length;
        document.getElementById('leads-progresso').textContent = leads.filter(l => l.status === 'progresso').length;
        document.getElementById('leads-fechado').textContent = leads.filter(l => l.status === 'fechado').length;
        updateStatusChart();
    }
    
    function updateStatusChart() {
        const ctx = document.getElementById('statusChart')?.getContext('2d');
        if (!ctx) return;
        if (statusChart) statusChart.destroy();
        statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Novo', 'Em Progresso', 'Fechado'],
                datasets: [{
                    data: [
                        leads.filter(l => l.status === 'novo').length,
                        leads.filter(l => l.status === 'progresso').length,
                        leads.filter(l => l.status === 'fechado').length
                    ],
                    backgroundColor: ['#00f7ff', '#ffc107', '#28a745']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // --- LÓGICA FINANCEIRO ---
    if (caixaForm) {
        caixaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = firebase.auth().currentUser;
            if (user) {
                caixa.push({
                    data: document.getElementById('caixa-data').value,
                    descricao: document.getElementById('caixa-descricao').value,
                    valor: parseFloat(document.getElementById('caixa-valor').value),
                    tipo: document.getElementById('caixa-tipo').value,
                    observacoes: document.getElementById('caixa-observacoes').value
                });
                updateCaixa();
                renderCaixaTable();
                saveAllUserData(user.uid);
                caixaForm.reset();
            }
        });
    }

    function updateCaixa() {
        if (!document.getElementById('total-entradas')) return;
        const totalEntradas = caixa.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.valor, 0);
        const totalSaidas = caixa.filter(m => m.tipo === 'saida').reduce((sum, m) => sum + m.valor, 0);
        document.getElementById('total-entradas').textContent = `R$ ${totalEntradas.toFixed(2)}`;
        document.getElementById('total-saidas').textContent = `R$ ${totalSaidas.toFixed(2)}`;
        document.getElementById('caixa-atual').textContent = `R$ ${(totalEntradas - totalSaidas).toFixed(2)}`;
    }

    function renderCaixaTable() {
        const tableBody = document.querySelector('#caixa-table tbody');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        caixa.forEach(mov => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${mov.data}</td>
                <td>${mov.descricao}</td>
                <td class="entrada">${mov.tipo === 'entrada' ? `R$ ${mov.valor.toFixed(2)}` : ''}</td>
                <td class="saida">${mov.tipo === 'saida' ? `R$ ${mov.valor.toFixed(2)}` : ''}</td>
                <td>${mov.observacoes}</td>
            `;
        });
    }

    // --- LÓGICA ESTOQUE ---
    if (estoqueForm) {
        estoqueForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = firebase.auth().currentUser;
            if (user) {
                estoque.push({
                    produto: document.getElementById('estoque-produto').value,
                    descricao: document.getElementById('estoque-descricao').value.toUpperCase(),
                    compra: parseFloat(document.getElementById('estoque-compra').value),
                    venda: parseFloat(document.getElementById('estoque-venda').value),
                    custos: [],
                });
                updateEstoque();
                renderEstoqueTable();
                saveAllUserData(user.uid);
                estoqueForm.reset();
            }
        });
    }

    function updateEstoque() {
        estoque.forEach(produto => {
            produto.totalCustos = produto.custos.reduce((sum, custo) => sum + custo.valor, 0);
            produto.lucro = produto.venda - (produto.compra + produto.totalCustos);
        });
    }

    function renderEstoqueTable() {
        const tableBody = document.querySelector('#estoque-table tbody');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        const searchTerm = estoqueSearch ? estoqueSearch.value.toLowerCase() : '';
        const filteredEstoque = estoque.filter(p => p.produto.toLowerCase().includes(searchTerm) || p.descricao.toLowerCase().includes(searchTerm));
        filteredEstoque.forEach(produto => {
            const row = tableBody.insertRow();
            row.dataset.descricao = produto.descricao;
            row.innerHTML = `
                <td>${produto.produto}</td>
                <td>${produto.descricao}</td>
                <td>R$ ${produto.compra.toFixed(2)}</td>
                <td>R$ ${produto.totalCustos.toFixed(2)}</td>
                <td>R$ ${produto.venda.toFixed(2)}</td>
                <td>R$ ${produto.lucro.toFixed(2)}</td>
                <td><button class="btn-delete-produto"><i class="ph-fill ph-trash"></i></button></td>
            `;
        });
    }

    // --- LÓGICA DO CHATBOT ---
    function addMessageToChat(message, type) {
        if (!chatbotMessages) return;
        const messageElement = document.createElement('div');
        messageElement.className = `${type}`;
        if(type !== 'user-message' && type !== 'bot-message') { // Compatibilidade
            messageElement.className = `${type}-message`;
        }
        messageElement.innerHTML = `<p>${message}</p>`;
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    function renderChatHistory() {
        if (!chatbotMessages) return;
        chatbotMessages.innerHTML = '';
        chatHistory.forEach(msg => {
            addMessageToChat(msg.parts[0].text, msg.role === 'user' ? 'user-message' : 'bot-message');
        });
    }

    if (chatbotForm) {
        chatbotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userInput = chatbotInput.value.trim();
            const user = firebase.auth().currentUser;
            if (!userInput || !user) return;

            addMessageToChat(userInput, 'user-message');
            chatHistory.push({ role: "user", parts: [{ text: userInput }] });
            chatbotInput.value = '';

            const sendButton = chatbotForm.querySelector('button');
            sendButton.disabled = true;
            addMessageToChat("Pensando...", 'bot-message bot-thinking');

            const apiUrl = '/api/gemini';
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: userInput, history: chatHistory })
                });

                const thinkingMsg = chatbotMessages.querySelector('.bot-thinking');
                if (thinkingMsg) thinkingMsg.remove();

                if (!response.ok) {
                    const errorData = await response.json();
                    addMessageToChat(`Ocorreu um erro no servidor (Status: ${response.status}).`, 'bot-message');
                } else {
                    const data = await response.json();
                    addMessageToChat(data.text, 'bot-message');
                    chatHistory.push({ role: "model", parts: [{ text: data.text }] });
                }
            } catch (error) {
                const thinkingMsg = chatbotMessages.querySelector('.bot-thinking');
                if (thinkingMsg) thinkingMsg.remove();
                addMessageToChat("Não consegui me conectar ao servidor.", 'bot-message');
            } finally {
                sendButton.disabled = false;
                saveAllUserData(user.uid); // Salva o histórico do chat
            }
        });
    }

    // --- INICIALIZAÇÃO GERAL ---
    initializeApp();
});
