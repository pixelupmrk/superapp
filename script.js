document.addEventListener('DOMContentLoaded', () => {
    // --- VARIÁVEIS GLOBAIS ---
    let leads = [];
    let caixa = [];
    let estoque = [];
    let chatHistory = [];
    let nextLeadId = 0;
    let currentLeadId = null;
    let draggedItem = null;
    let statusChart;
    let db; // Instância do Firestore

    // --- SELETORES DE ELEMENTOS ---
    const pageTitle = document.getElementById('page-title');
    const contentAreas = document.querySelectorAll('.main-content .content-area');
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const userNameDisplay = document.querySelector('.user-profile span');
    
    // --- INICIALIZAÇÃO E AUTENTICAÇÃO ---
    // NOVO: Estrutura principal async para garantir a ordem de execução
    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                db = firebase.firestore();
                // PRIMEIRO, obrigatoriamente carrega os dados
                await loadAllUserData(user.uid);
                // DEPOIS, ativa as funcionalidades da página
                setupEventListeners(user.uid);
            }
        });
    }
    main(); // Inicia a aplicação

    // --- CARREGAMENTO E SALVAMENTO DE DADOS (FIRESTORE) ---
    async function loadAllUserData(userId) {
        if (!db) return;
        try {
            const doc = await db.collection('userData').doc(userId).get();
            if (doc.exists) {
                const data = doc.data();
                leads = data.leads || [];
                caixa = data.caixa || [];
                estoque = data.estoque || [];
                chatHistory = data.chatHistory || [];
                nextLeadId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 0;
                applySettings(data.settings);
                loadMentoriaNotes(data.mentoriaNotes);
            }
            updateAllUI(); // Atualiza toda a interface após carregar os dados
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
    }

    async function saveUserData(userId) {
        if (!db) return;
        try {
            const mentoriaNotes = getMentoriaNotes();
            const dataToSave = {
                leads,
                caixa,
                estoque,
                chatHistory,
                mentoriaNotes,
                settings: {
                    theme: document.body.classList.contains('light-theme') ? 'light' : 'dark',
                    userName: document.getElementById('setting-user-name').value || 'Usuário',
                    companyName: document.getElementById('setting-company-name').value
                }
            };
            await db.collection('userData').doc(userId).set(dataToSave);
        } catch (error) {
            console.error(`Erro ao salvar dados:`, error);
        }
    }

    // --- ATUALIZAÇÃO DA INTERFACE ---
    function updateAllUI() {
        renderKanbanCards();
        renderLeadsTable();
        updateDashboard();
        renderCaixaTable();
        updateCaixa();
        renderEstoqueTable();
        updateEstoque();
        renderChatHistory();
    }

    // --- CONFIGURAÇÕES ---
    function applySettings(settings = {}) {
        const theme = settings.theme || 'dark';
        const userName = settings.userName || 'Usuário';
        const companyName = settings.companyName || '';

        document.body.className = theme === 'light' ? 'light-theme' : '';
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) themeBtn.textContent = theme === 'light' ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro';
        
        if(userNameDisplay) userNameDisplay.textContent = `Olá, ${userName}`;
        const userNameInput = document.getElementById('setting-user-name');
        if (userNameInput) userNameInput.value = userName;
        const companyNameInput = document.getElementById('setting-company-name');
        if (companyNameInput) companyNameInput.value = companyName;
    }

    // --- SETUP DE TODOS OS EVENT LISTENERS ---
    function setupEventListeners(userId) {
        // Navegação principal
        navItems.forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                const targetId = e.currentTarget.getAttribute('data-target');
                if (!targetId) return;

                navItems.forEach(nav => nav.classList.remove('active'));
                e.currentTarget.classList.add('active');

                contentAreas.forEach(area => area.style.display = 'none');
                const targetArea = document.getElementById(targetId);
                if (targetArea) targetArea.style.display = 'block';
                if(pageTitle) pageTitle.textContent = e.currentTarget.querySelector('span').textContent;
            });
        });

        // Configurações
        const saveSettingsBtn = document.getElementById('save-settings-btn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                saveUserData(userId);
                alert('Configurações salvas!');
            });
        }
        
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                 document.body.classList.toggle('light-theme');
                 saveUserData(userId);
            });
        }

        // --- CRM ---
        const leadForm = document.getElementById('lead-form');
        if (leadForm) {
            leadForm.addEventListener('submit', e => {
                e.preventDefault();
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
                saveUserData(userId);
                renderKanbanCards();
                renderLeadsTable();
                updateDashboard();
                leadForm.reset();
            });
        }
        
        // --- KANBAN ---
        const kanbanBoard = document.getElementById('kanban-board');
        if (kanbanBoard) {
            kanbanBoard.addEventListener('dragstart', e => {
                if (e.target.classList.contains('kanban-card')) {
                    draggedItem = e.target;
                    setTimeout(() => { if (draggedItem) draggedItem.style.display = 'none'; }, 0);
                }
            });
            kanbanBoard.addEventListener('dragend', () => {
                if(draggedItem) {
                    draggedItem.style.display = 'block';
                    draggedItem = null;
                }
            });
            kanbanBoard.addEventListener('dragover', e => e.preventDefault());
            kanbanBoard.addEventListener('drop', e => {
                e.preventDefault();
                const column = e.target.closest('.kanban-column');
                if (column && draggedItem) {
                    column.querySelector('.kanban-cards-list').appendChild(draggedItem);
                    const leadId = parseInt(draggedItem.getAttribute('data-id'));
                    const newStatus = column.getAttribute('data-status');
                    const lead = leads.find(l => l.id === leadId);
                    if (lead) {
                        lead.status = newStatus;
                        saveUserData(userId);
                        updateDashboard();
                        renderLeadsTable();
                    }
                }
            });
            kanbanBoard.addEventListener('click', e => {
                const card = e.target.closest('.kanban-card');
                if (card) openEditModal(parseInt(card.dataset.id));
            });
        }
        
        // Tabela de Leads
        const leadsTable = document.getElementById('leads-table');
        if(leadsTable) {
            leadsTable.addEventListener('click', e => {
                const editBtn = e.target.closest('.btn-edit-table');
                if (editBtn) {
                    openEditModal(parseInt(editBtn.closest('tr').dataset.id));
                }
                const deleteBtn = e.target.closest('.btn-delete-table');
                if (deleteBtn) {
                    if (confirm('Tem certeza?')) {
                        const leadId = parseInt(deleteBtn.closest('tr').dataset.id);
                        leads = leads.filter(l => l.id !== leadId);
                        saveUserData(userId);
                        renderLeadsTable();
                        renderKanbanCards();
                        updateDashboard();
                    }
                }
            });
        }
        
        // --- MODAL DE EDIÇÃO DE LEAD ---
        const editModal = document.getElementById('edit-lead-modal');
        const editLeadForm = document.getElementById('edit-lead-form');
        if (editLeadForm) {
            editLeadForm.addEventListener('submit', e => {
                e.preventDefault();
                const leadIndex = leads.findIndex(l => l.id === currentLeadId);
                if (leadIndex > -1) {
                    leads[leadIndex].nome = document.getElementById('edit-lead-name').value;
                    leads[leadIndex].email = document.getElementById('edit-lead-email').value;
                    leads[leadIndex].whatsapp = document.getElementById('edit-lead-whatsapp').value;
                    leads[leadIndex].status = document.getElementById('edit-lead-status').value;
                    leads[leadIndex].atendente = document.getElementById('edit-lead-attendant').value;
                    leads[leadIndex].origem = document.getElementById('edit-lead-origem').value;
                    leads[leadIndex].data = document.getElementById('edit-lead-date').value;
                    leads[leadIndex].qualificacao = document.getElementById('edit-lead-qualification').value;
                    leads[leadIndex].notas = document.getElementById('edit-lead-notes').value;
                    saveUserData(userId);
                    renderKanbanCards();
                    renderLeadsTable();
                    updateDashboard();
                    if (editModal) editModal.style.display = 'none';
                }
            });
        }
        
        const deleteLeadBtn = document.getElementById('delete-lead-btn');
        if (deleteLeadBtn) {
            deleteLeadBtn.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja excluir este lead?')) {
                    leads = leads.filter(l => l.id !== currentLeadId);
                    saveUserData(userId);
                    renderLeadsTable();
                    renderKanbanCards();
                    updateDashboard();
                    if (editModal) editModal.style.display = 'none';
                }
            });
        }

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = document.getElementById(btn.dataset.target);
                if(modal) modal.style.display = 'none';
            });
        });

        // --- FINANCEIRO ---
        const caixaForm = document.getElementById('caixa-form');
        if(caixaForm) {
            caixaForm.addEventListener('submit', e => {
                e.preventDefault();
                const valor = parseFloat(document.getElementById('caixa-valor').value);
                if (isNaN(valor)) {
                    alert('Por favor, insira um valor numérico válido.');
                    return;
                }
                caixa.push({
                    data: document.getElementById('caixa-data').value,
                    descricao: document.getElementById('caixa-descricao').value,
                    valor: valor,
                    tipo: document.getElementById('caixa-tipo').value,
                    observacoes: document.getElementById('caixa-observacoes').value
                });
                saveUserData(userId);
                renderCaixaTable();
                updateCaixa();
                e.target.reset();
            });
        }
        
        document.querySelectorAll('.finance-tab').forEach(tab => {
            tab.addEventListener('click', e => {
                e.preventDefault();
                document.querySelectorAll('.finance-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                document.querySelectorAll('.finance-content').forEach(c => c.style.display = 'none');
                const content = document.getElementById(e.target.dataset.tab + '-tab-content');
                if (content) content.style.display = 'block';
            });
        });
        
        // --- ESTOQUE ---
        const estoqueForm = document.getElementById('estoque-form');
        if (estoqueForm) {
            estoqueForm.addEventListener('submit', e => {
                e.preventDefault();
                const compra = parseFloat(document.getElementById('estoque-compra').value);
                const venda = parseFloat(document.getElementById('estoque-venda').value);
                if (isNaN(compra) || isNaN(venda)) {
                    alert('Por favor, insira valores numéricos válidos para compra e venda.');
                    return;
                }
                estoque.push({
                    produto: document.getElementById('estoque-produto').value,
                    descricao: document.getElementById('estoque-descricao').value.toUpperCase(),
                    compra: compra,
                    venda: venda,
                    custos: []
                });
                saveUserData(userId);
                renderEstoqueTable();
                updateEstoque();
                e.target.reset();
            });
        }
        
        const estoqueSearch = document.getElementById('estoque-search');
        if (estoqueSearch) estoqueSearch.addEventListener('input', renderEstoqueTable);

        // --- ACELERADOR DE VENDAS (MENTORIA) ---
        document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => {
            item.addEventListener('click', e => {
                document.querySelectorAll('.sales-accelerator-menu-item').forEach(i => i.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.querySelectorAll('.sales-accelerator-module-content').forEach(c => c.classList.remove('active'));
                const content = document.getElementById(e.currentTarget.dataset.content);
                if (content) content.classList.add('active');
            });
        });

        document.querySelectorAll('.mentoria-notas').forEach(textarea => {
            textarea.addEventListener('keyup', () => saveUserData(userId));
        });

        // --- CHATBOT ---
        const chatbotForm = document.getElementById('chatbot-form');
        if(chatbotForm) {
            chatbotForm.addEventListener('submit', async e => {
                e.preventDefault();
                const chatbotInput = document.getElementById('chatbot-input');
                const userInput = chatbotInput.value.trim();
                if (!userInput) return;

                addMessageToChat(userInput, 'user-message');
                chatHistory.push({ role: "user", parts: [{ text: userInput }] });
                chatbotInput.value = '';

                addMessageToChat("Pensando...", 'bot-message bot-thinking');
                
                try {
                    const response = await fetch('/api/gemini', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: userInput, history: chatHistory })
                    });
                    document.querySelector('.bot-thinking')?.parentElement.remove();
                    
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.details || `Status: ${response.status}`);

                    addMessageToChat(data.text, 'bot-message');
                    chatHistory.push({ role: "model", parts: [{ text: data.text }] });
                    
                } catch (error) {
                    console.error("Erro do chatbot:", error);
                    document.querySelector('.bot-thinking')?.parentElement.remove();
                    addMessageToChat("Ocorreu um erro ao conectar com a IA.", 'bot-message');
                }
                saveUserData(userId);
            });
        }
    }

    // --- FUNÇÕES AUXILIARES E DE RENDERIZAÇÃO ---

    function openEditModal(leadId) {
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        const modal = document.getElementById('edit-lead-modal');
        if (lead && modal) {
            document.getElementById('edit-lead-name').value = lead.nome || '';
            document.getElementById('edit-lead-email').value = lead.email || '';
            document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
            document.getElementById('edit-lead-status').value = lead.status || '';
            document.getElementById('edit-lead-attendant').value = lead.atendente || '';
            document.getElementById('edit-lead-origem').value = lead.origem || '';
            document.getElementById('edit-lead-date').value = lead.data || '';
            document.getElementById('edit-lead-qualification').value = lead.qualificacao || '';
            document.getElementById('edit-lead-notes').value = lead.notas || '';
            modal.style.display = 'flex';
        }
    }

    function renderKanbanCards() {
        const listContainers = document.querySelectorAll('.kanban-cards-list');
        if(!listContainers.length) return;
        listContainers.forEach(list => list.innerHTML = '');
        leads.forEach(lead => {
            const column = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (column) {
                const card = document.createElement('div');
                card.className = 'kanban-card';
                card.draggable = true;
                card.dataset.id = lead.id;
                card.innerHTML = `<strong>${lead.nome}</strong><p>${lead.whatsapp}</p><small>${lead.origem}</small>`;
                column.appendChild(card);
            }
        });
    }

    function renderLeadsTable() {
        const tableBody = document.querySelector('#leads-table tbody');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        leads.forEach(lead => {
            const row = tableBody.insertRow();
            row.dataset.id = lead.id;
            // CORREÇÃO: Corrigido o class do botão de deletar
            row.innerHTML = `
                <td>${lead.nome || ''}</td>
                <td>${lead.whatsapp || ''}</td>
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
        const leadsNovo = leads.filter(l => l.status === 'novo').length;
        const leadsProgresso = leads.filter(l => l.status === 'progresso').length;
        const leadsFechado = leads.filter(l => l.status === 'fechado').length;
        document.getElementById('total-leads').textContent = leads.length;
        document.getElementById('leads-novo').textContent = leadsNovo;
        document.getElementById('leads-progresso').textContent = leadsProgresso;
        document.getElementById('leads-fechado').textContent = leadsFechado;
        
        const ctx = document.getElementById('statusChart')?.getContext('2d');
        if (!ctx) return;
        if (statusChart) statusChart.destroy();
        statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Novo', 'Em Progresso', 'Fechado'],
                datasets: [{ data: [leadsNovo, leadsProgresso, leadsFechado], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'] }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
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

    function updateCaixa() {
        const totalEntradasEl = document.getElementById('total-entradas');
        if(!totalEntradasEl) return;
        const entradas = caixa.filter(m => m.tipo === 'entrada').reduce((acc, m) => acc + m.valor, 0);
        const saidas = caixa.filter(m => m.tipo === 'saida').reduce((acc, m) => acc + m.valor, 0);
        totalEntradasEl.textContent = `R$ ${entradas.toFixed(2)}`;
        document.getElementById('total-saidas').textContent = `R$ ${saidas.toFixed(2)}`;
        document.getElementById('caixa-atual').textContent = `R$ ${(entradas - saidas).toFixed(2)}`;
    }

    function renderEstoqueTable() {
        const tableBody = document.querySelector('#estoque-table tbody');
        if (!tableBody) return;
        const searchInput = document.getElementById('estoque-search');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const filteredEstoque = estoque.filter(p => p.produto.toLowerCase().includes(searchTerm) || p.descricao.toLowerCase().includes(searchTerm));
        tableBody.innerHTML = '';
        filteredEstoque.forEach(produto => {
            const totalCustos = (produto.custos || []).reduce((acc, c) => acc + c.valor, 0);
            const lucro = produto.venda - produto.compra - totalCustos;
            const row = tableBody.insertRow();
            row.dataset.descricao = produto.descricao;
            row.innerHTML = `
                <td>${produto.produto}</td>
                <td>${produto.descricao}</td>
                <td>R$ ${produto.compra.toFixed(2)}</td>
                <td>R$ ${totalCustos.toFixed(2)}</td>
                <td>R$ ${produto.venda.toFixed(2)}</td>
                <td>R$ ${lucro.toFixed(2)}</td>
                <td>Ações</td>
            `;
        });
    }

    function updateEstoque() { /* A lógica já está em renderEstoqueTable */ }

    function addMessageToChat(message, type) {
        const chatbotMessages = document.getElementById('chatbot-messages');
        if (!chatbotMessages) return;
        const messageElement = document.createElement('div');
        messageElement.className = type;
        messageElement.innerHTML = `<p>${message}</p>`;
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function renderChatHistory() {
        const chatbotMessages = document.getElementById('chatbot-messages');
        if (!chatbotMessages) return;
        chatbotMessages.innerHTML = '';
        if (chatHistory.length === 0) {
             addMessageToChat("Olá! Eu sou seu assistente de vendas. Como posso ajudar?", 'bot-message');
        } else {
            chatHistory.forEach(msg => {
                const text = msg.parts[0].text;
                const role = msg.role === 'user' ? 'user-message' : 'bot-message';
                addMessageToChat(text, role);
            });
        }
    }
    
    // Funções para salvar/carregar notas da mentoria no Firestore
    function getMentoriaNotes() {
        const notes = {};
        document.querySelectorAll('.mentoria-notas').forEach(textarea => {
            notes[textarea.id] = textarea.value;
        });
        return notes;
    }

    function loadMentoriaNotes(notes = {}) {
        for (const id in notes) {
            const textarea = document.getElementById(id);
            if (textarea) textarea.value = notes[id];
        }
    }
});
