document.addEventListener('DOMContentLoaded', () => {

    let leads = [];
    let nextLeadId = 0;
    let statusChart;
    let caixa = [];
    let estoque = [];
    let currentEstoqueDescricao = null;

    // --- Seletores de Elementos ---
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const contentAreas = document.querySelectorAll('.main-content .content-area');
    const pageTitle = document.getElementById('page-title');
    const kanbanBoard = document.getElementById('kanban-board');
    const leadForm = document.getElementById('lead-form');
    const editModal = document.getElementById('edit-lead-modal');
    const editForm = document.getElementById('edit-lead-form');
    const deleteLeadBtn = document.getElementById('delete-lead-btn');
    const caixaForm = document.getElementById('caixa-form');
    const financeTabs = document.querySelectorAll('.finance-tab');
    const estoqueForm = document.getElementById('estoque-form');
    const estoqueSearch = document.getElementById('estoque-search');
    const addCustoModal = document.getElementById('add-custo-modal');
    const addCustoForm = document.getElementById('add-custo-form');
    const closeCustoModalBtn = document.getElementById('close-custo-modal');
    const importEstoqueFile = document.getElementById('import-estoque-file');
    const exportEstoqueBtn = document.getElementById('export-estoque-btn');
    const acceleratorNavItems = document.querySelectorAll('.sales-accelerator-menu-item');
    const acceleratorContentAreas = document.querySelectorAll('.sales-accelerator-module-content');
    
    // --- Seletores de Configurações ---
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const saveSettingsButton = document.getElementById('save-settings-btn');
    const userNameInput = document.getElementById('setting-user-name');
    const companyNameInput = document.getElementById('setting-company-name');
    const userNameDisplay = document.querySelector('.user-profile span');
    
    // --- Seletores do Chatbot ---
    const chatbotForm = document.getElementById('chatbot-form');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');

    let draggedItem = null;
    let currentLeadId = null;

    // --- LÓGICA DE CONFIGURAÇÕES ---
    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            if(themeToggleButton) themeToggleButton.textContent = 'Mudar para Tema Escuro';
        } else {
            document.body.classList.remove('light-theme');
            if(themeToggleButton) themeToggleButton.textContent = 'Mudar para Tema Claro';
        }
        if (document.getElementById('dashboard-section')?.style.display === 'block') {
            updateDashboard();
        }
    }

    function loadSettings() {
        const savedTheme = localStorage.getItem('appTheme') || 'dark';
        const savedUserName = localStorage.getItem('userName') || 'Usuário';
        const savedCompanyName = localStorage.getItem('companyName') || '';

        applyTheme(savedTheme);
        
        if(userNameInput) userNameInput.value = savedUserName === 'Usuário' ? '' : savedUserName;
        if(userNameDisplay) userNameDisplay.textContent = `Olá, ${savedUserName}`;
        if(companyNameInput) companyNameInput.value = savedCompanyName;
    }

    if(saveSettingsButton) {
        saveSettingsButton.addEventListener('click', () => {
            const newUserName = userNameInput.value.trim() || 'Usuário';
            const newCompanyName = companyNameInput.value.trim();

            localStorage.setItem('userName', newUserName);
            localStorage.setItem('companyName', newCompanyName);

            userNameDisplay.textContent = `Olá, ${newUserName}`;
            alert('Configurações salvas com sucesso!');
        });
    }
    
    if(themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const isLight = document.body.classList.contains('light-theme');
            const newTheme = isLight ? 'dark' : 'light';
            localStorage.setItem('appTheme', newTheme);
            applyTheme(newTheme);
        });
    }

    // --- LÓGICA DE NAVEGAÇÃO ---
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-target');
            if(!targetId) return; // Ignora o botão de sair

            const targetText = e.currentTarget.querySelector('span').textContent;
            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');

            contentAreas.forEach(area => {
                area.style.display = 'none';
            });
            
            const targetArea = document.getElementById(targetId);
            if(targetArea) {
                 targetArea.style.display = 'block';
            }
            
            if(pageTitle) pageTitle.textContent = targetText;

            if (targetId === 'dashboard-section') updateDashboard();
            else if (targetId === 'crm-list-section') renderLeadsTable();
            else if (targetId === 'finance-section') {
                updateCaixa();
                renderCaixaTable();
                updateEstoque();
                renderEstoqueTable();
            }
        });
    });
    
    acceleratorNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-content');
            acceleratorNavItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');
            acceleratorContentAreas.forEach(area => {
                area.classList.remove('active');
                if (area.id === targetId) {
                    area.classList.add('active');
                }
            });
        });
    });

    // --- LÓGICAS DO CRM, FINANCEIRO, ESTOQUE, ETC. ---
    if (kanbanBoard) {
        kanbanBoard.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('kanban-card')) {
                draggedItem = e.target;
                setTimeout(() => { if(draggedItem) draggedItem.style.display = 'none'; }, 0);
            }
        });
        kanbanBoard.addEventListener('dragend', (e) => {
            if (draggedItem) {
                draggedItem.style.display = 'block';
                draggedItem = null;
            }
        });
        kanbanBoard.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        kanbanBoard.addEventListener('drop', (e) => {
            e.preventDefault();
            const column = e.target.closest('.kanban-column');
            if (column && draggedItem) {
                const list = column.querySelector('.kanban-cards-list');
                list.appendChild(draggedItem);
                const cardId = draggedItem.getAttribute('data-id');
                const newStatus = column.getAttribute('data-status');
                const lead = leads.find(l => l.id == cardId);
                if (lead) {
                    lead.status = newStatus;
                    updateDashboard();
                    renderLeadsTable();
                }
            }
        });
    }

    function renderKanbanCards() {
        document.querySelectorAll('.kanban-cards-list').forEach(list => list.innerHTML = '');
        leads.forEach(lead => {
            const newCard = createKanbanCard(lead);
            const targetColumn = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (targetColumn) {
                targetColumn.appendChild(newCard);
            }
        });
    }

    function renderLeadsTable() {
        const tableBody = document.querySelector('#leads-table tbody');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        leads.forEach(lead => {
            const newRow = createLeadTableRow(lead);
            tableBody.appendChild(newRow);
        });
    }

    function createKanbanCard(lead) {
        const newCard = document.createElement('div');
        newCard.classList.add('kanban-card');
        newCard.draggable = true;
        newCard.setAttribute('data-id', lead.id);
        newCard.innerHTML = `
            <strong>${lead.nome || ''}</strong><br>
            <small>WhatsApp: <a href="https://wa.me/${lead.whatsapp || ''}" target="_blank">${lead.whatsapp || ''}</a></small><br>
            <small>Origem: ${lead.origem || ''}</small><br>
            <small>Qualificação: ${lead.qualificacao || ''}</small>
        `;
        return newCard;
    }

    function createLeadTableRow(lead) {
        const row = document.createElement('tr');
        row.setAttribute('data-id', lead.id);
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
        return row;
    }

    if(leadForm) {
        leadForm.addEventListener('submit', (e) => {
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
            renderKanbanCards();
            renderLeadsTable();
            updateDashboard();
            leadForm.reset();
        });
    }

    document.addEventListener('click', (e) => {
        const editButton = e.target.closest('.btn-edit-table');
        const deleteButton = e.target.closest('.btn-delete-table');

        if (editButton) {
            const row = editButton.closest('tr');
            currentLeadId = parseInt(row.getAttribute('data-id'));
            const lead = leads.find(l => l.id === currentLeadId);
            if (lead) {
                document.getElementById('edit-lead-name').value = lead.nome || '';
                document.getElementById('edit-lead-email').value = lead.email || '';
                document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
                document.getElementById('edit-lead-status').value = lead.status || '';
                document.getElementById('edit-lead-attendant').value = lead.atendente || '';
                document.getElementById('edit-lead-origem').value = lead.origem || '';
                document.getElementById('edit-lead-date').value = lead.data || '';
                document.getElementById('edit-lead-qualification').value = lead.qualificacao || '';
                document.getElementById('edit-lead-notes').value = lead.notas || '';
                editModal.style.display = 'flex';
            }
        }
        
        if (deleteButton) {
            const row = deleteButton.closest('tr');
            const leadId = parseInt(row.getAttribute('data-id'));
            if (confirm('Tem certeza que deseja excluir este lead?')) {
                const leadIndex = leads.findIndex(l => l.id === leadId);
                if (leadIndex > -1) {
                    leads.splice(leadIndex, 1);
                    renderKanbanCards();
                    renderLeadsTable();
                    updateDashboard();
                }
            }
        }
    });

    if(deleteLeadBtn) {
        deleteLeadBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja excluir este lead?')) {
                const leadIndex = leads.findIndex(l => l.id === currentLeadId);
                if (leadIndex > -1) {
                    leads.splice(leadIndex, 1);
                    renderKanbanCards();
                    renderLeadsTable();
                    updateDashboard();
                }
                editModal.style.display = 'none';
            }
        });
    }

    if(editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const lead = leads.find(l => l.id === currentLeadId);
            if (lead) {
                lead.nome = document.getElementById('edit-lead-name').value;
                lead.email = document.getElementById('edit-lead-email').value;
                lead.whatsapp = document.getElementById('edit-lead-whatsapp').value;
                lead.status = document.getElementById('edit-lead-status').value;
                lead.atendente = document.getElementById('edit-lead-attendant').value;
                lead.origem = document.getElementById('edit-lead-origem').value;
                lead.data = document.getElementById('edit-lead-date').value;
                lead.qualificacao = document.getElementById('edit-lead-qualification').value;
                lead.notas = document.getElementById('edit-lead-notes').value;
                renderKanbanCards();
                renderLeadsTable();
                updateDashboard();
                editModal.style.display = 'none';
            }
        });
    }

    function updateDashboard() {
        if(!document.getElementById('total-leads')) return;

        const totalLeads = leads.length;
        const leadsNovo = leads.filter(l => l.status === 'novo').length;
        const leadsProgresso = leads.filter(l => l.status === 'progresso').length;
        const leadsFechado = leads.filter(l => l.status === 'fechado').length;

        document.getElementById('total-leads').textContent = totalLeads;
        document.getElementById('leads-novo').textContent = leadsNovo;
        document.getElementById('leads-progresso').textContent = leadsProgresso;
        document.getElementById('leads-fechado').textContent = leadsFechado;
        updateStatusChart(leadsNovo, leadsProgresso, leadsFechado);
    }

    function updateStatusChart(novo, progresso, fechado) {
        if (!document.getElementById('statusChart')) return;
        const ctx = document.getElementById('statusChart').getContext('2d');
        if (statusChart) {
            statusChart.destroy();
        }
        const isLightTheme = document.body.classList.contains('light-theme');
        const legendColor = isLightTheme ? '#212529' : '#cdd6f4';

        statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Novo', 'Em Progresso', 'Fechado'],
                datasets: [{
                    data: [novo, progresso, fechado],
                    backgroundColor: ['#00f7ff', '#ffc107', '#28a745'],
                }]
            }
        });
    }

    // --- CARREGAMENTO INICIAL ---
    loadSettings();
    updateDashboard();
    renderKanbanCards();
    renderLeadsTable();
});
