document.addEventListener('DOMContentLoaded', () => {

    // --- SUA LÓGICA ORIGINAL COMPLETA DO CRM ---
    const leads = [];
    let nextLeadId = 0;
    let statusChart;
    let caixa = [];
    let estoque = [];
    let currentEstoqueDescricao = null;

    // Lógica para o Kanban (Drag and Drop)
    const kanbanBoard = document.getElementById('kanban-board');
    if (kanbanBoard) {
        let draggedItem = null;
        kanbanBoard.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('kanban-card')) {
                draggedItem = e.target;
                setTimeout(() => { e.target.style.display = 'none'; }, 0);
            }
        });
        kanbanBoard.addEventListener('dragend', (e) => {
            if (draggedItem) {
                e.target.style.display = 'block';
                draggedItem = null;
            }
        });
        kanbanBoard.addEventListener('dragover', (e) => { e.preventDefault(); });
        kanbanBoard.addEventListener('drop', (e) => {
            e.preventDefault();
            const column = e.target.closest('.kanban-column');
            if (column && draggedItem) {
                const list = column.querySelector('.kanban-cards-list');
                list.appendChild(draggedItem);
                const leadId = parseInt(draggedItem.getAttribute('data-id'));
                const newStatus = column.getAttribute('data-status');
                const lead = leads.find(l => l.id === leadId);
                if (lead) {
                    lead.status = newStatus;
                    updateDashboard();
                    renderLeadsTable();
                }
            }
        });
    }

    // Funções de Renderização
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
        newCard.innerHTML = `<strong>${lead.nome || ''}</strong><br><small>WhatsApp: ${lead.whatsapp || ''}</small>`;
        return newCard;
    }

    function createLeadTableRow(lead) {
        const row = document.createElement('tr');
        row.setAttribute('data-id', lead.id);
        row.innerHTML = `<td>${lead.nome || ''}</td><td>${lead.whatsapp || ''}</td><td>${lead.origem || ''}</td><td>${lead.qualificacao || ''}</td><td>${lead.status || ''}</td><td><button class="btn-edit-table"><i class="ph-fill ph-note-pencil"></i></button><button class="btn-delete-table"><i class="ph-fill ph-trash"></i></button></td>`;
        return row;
    }

    // Lógica para o formulário de novo lead
    const leadForm = document.getElementById('lead-form');
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

    // Lógica do Dashboard
    function updateDashboard() {
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
        const ctx = document.getElementById('statusChart').getContext('2d');
        if (statusChart) {
            statusChart.destroy();
        }
        statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Em Progresso', 'Fechado'], datasets: [{ data: [novo, progresso, fechado], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'], borderColor: ['#0d1117'], borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#cdd6f4' } } } } });
    }

    // --- NAVEGAÇÃO PRINCIPAL (SIDEBAR COMPLETA) ---
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    const contentAreas = document.querySelectorAll('.main-content .content-area');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-target');
            if (!targetId) return;

            const targetText = e.currentTarget.querySelector('span').textContent;
            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');

            contentAreas.forEach(area => {
                area.style.display = 'none';
            });
            
            const targetArea = document.getElementById(targetId);
            if(targetArea) {
                targetArea.style.display = 'block';
                pageTitle.textContent = targetText;
            }
        });
    });

    // --- LÓGICA DA ACELERAÇÃO DE VENDAS ---
    const aceleracaoNavItems = document.querySelectorAll('.aceleracao-menu-item');
    const aceleracaoContentAreas = document.querySelectorAll('.aceleracao-module-content');

    aceleracaoNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-content');
            aceleracaoNavItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');
            aceleracaoContentAreas.forEach(area => {
                area.classList.remove('active');
                if (area.id === targetId) {
                    area.classList.add('active');
                }
            });
        });
    });

    // --- NOVA LÓGICA PARA A PÁGINA DE CONFIGURAÇÕES ---
    function setupSettings() {
        const themeButtons = document.querySelectorAll('.btn-theme');
        const body = document.body;
        const businessForm = document.getElementById('business-info-form');
        const nameInput = document.getElementById('business-name');
        const emailInput = document.getElementById('business-email');
        const phoneInput = document.getElementById('business-phone');
        const userGreeting = document.getElementById('user-greeting');

        const applyTheme = (theme) => {
            body.dataset.theme = theme;
            localStorage.setItem('appTheme', theme);
            themeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === theme));
        };

        const updateUserGreeting = () => {
            const savedName = localStorage.getItem('businessName');
            userGreeting.textContent = savedName ? `Olá, ${savedName}` : 'Olá, Usuário';
        };

        themeButtons.forEach(button => {
            button.addEventListener('click', () => applyTheme(button.dataset.theme));
        });
        
        if (businessForm) {
            businessForm.addEventListener('submit', (e) => {
                e.preventDefault();
                localStorage.setItem('businessName', nameInput.value);
                localStorage.setItem('businessEmail', emailInput.value);
                localStorage.setItem('businessPhone', phoneInput.value);
                alert('Informações da empresa salvas com sucesso!');
                updateUserGreeting();
            });
        }

        // Carregar dados salvos na inicialização
        const savedTheme = localStorage.getItem('appTheme') || 'dark';
        applyTheme(savedTheme);
        if(nameInput) nameInput.value = localStorage.getItem('businessName') || '';
        if(emailInput) emailInput.value = localStorage.getItem('businessEmail') || '';
        if(phoneInput) phoneInput.value = localStorage.getItem('businessPhone') || '';
        updateUserGreeting();
    }

    // --- INICIALIZAÇÃO DE TODAS AS FUNÇÕES ---
    updateDashboard(); // Sua função original
    setupSettings(); // Nova função de configurações
});
