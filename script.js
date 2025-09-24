document.addEventListener('DOMContentLoaded', () => {

    // Arrays para armazenar os dados da aplicação
    let leads = [];
    let caixa = [];
    let estoque = [];
    
    let nextLeadId = 0;
    let statusChart;
    let currentEstoqueDescricao = null;

    // --- Seletores de Elementos ---
    const navItems = document.querySelectorAll('.nav-item');
    const contentAreas = document.querySelectorAll('.main-content .content-area');
    const pageTitle = document.getElementById('page-title');
    const userNameDisplay = document.getElementById('user-name-display');
    const userNameInput = document.getElementById('user-name-input');
    const saveUserNameBtn = document.getElementById('save-user-name-btn');
    const clearAllDataBtn = document.getElementById('clear-all-data-btn');

    // --- INICIALIZAÇÃO ---
    function initializeApp() {
        loadUserName();
        updateDashboard();
        // Adicione outras funções de carregamento de dados do localStorage aqui se necessário
    }

    // --- LÓGICA DE NAVEGAÇÃO ---
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-target');
            const targetText = e.currentTarget.querySelector('span').textContent;

            // Atualiza o item ativo na navegação
            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');

            // Mostra a área de conteúdo correta
            contentAreas.forEach(area => {
                area.style.display = 'none';
            });
            document.getElementById(targetId).style.display = 'block';
            pageTitle.textContent = targetText;

            // Renderiza conteúdo dinâmico ao trocar de aba
            if (targetId === 'dashboard-section') updateDashboard();
            if (targetId === 'crm-list-section') renderLeadsTable();
            if (targetId === 'finance-section') {
                updateCaixa();
                renderCaixaTable();
                updateEstoque();
                renderEstoqueTable();
            }
        });
    });

    // --- LÓGICA DE CONFIGURAÇÕES ---
    function loadUserName() {
        const savedName = localStorage.getItem('crmUserName');
        if (savedName) {
            userNameDisplay.textContent = `Olá, ${savedName}`;
            userNameInput.value = savedName;
        }
    }

    saveUserNameBtn.addEventListener('click', () => {
        const newName = userNameInput.value.trim();
        if (newName) {
            localStorage.setItem('crmUserName', newName);
            userNameDisplay.textContent = `Olá, ${newName}`;
            alert('Nome salvo com sucesso!');
        } else {
            alert('Por favor, digite um nome válido.');
        }
    });

    clearAllDataBtn.addEventListener('click', () => {
        if (confirm('ATENÇÃO!\n\nVocê tem certeza que deseja apagar TODOS os dados?\nEsta ação não pode ser desfeita.')) {
            // Limpa os arrays de dados
            leads = [];
            caixa = [];
            estoque = [];
            nextLeadId = 0;

            // Limpa o localStorage se houver dados salvos lá
            // localStorage.removeItem('crmLeads'); // Exemplo
            
            // Re-renderiza todas as seções
            updateDashboard();
            renderKanbanCards();
            renderLeadsTable();
            updateCaixa();
            renderCaixaTable();
            updateEstoque();
            renderEstoqueTable();

            alert('Todos os dados foram limpos.');
        }
    });


    // --- LÓGICA DO KANBAN (DRAG & DROP) ---
    const kanbanBoard = document.getElementById('kanban-board');
    let draggedItem = null;

    kanbanBoard.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('kanban-card')) {
            draggedItem = e.target;
            setTimeout(() => {
                e.target.style.display = 'none';
            }, 0);
        }
    });

    kanbanBoard.addEventListener('dragend', (e) => {
        if (draggedItem) {
            e.target.style.display = 'block';
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
                renderLeadsTable(); // Atualiza a tabela também
            }
        }
    });

    // --- FUNÇÕES DE RENDERIZAÇÃO E CRIAÇÃO DE ELEMENTOS ---
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
        tableBody.innerHTML = '';
        leads.forEach(lead => {
            const newRow = createLeadTableRow(lead);
            tableBody.appendChild(newRow);
        });
    }

    function createKanbanCard(lead) {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.draggable = true;
        card.dataset.id = lead.id;
        card.innerHTML = `
            <strong>${lead.nome || ''}</strong><br>
            <small>WhatsApp: <a href="https://wa.me/${lead.whatsapp || ''}" target="_blank">${lead.whatsapp || ''}</a></small><br>
            <small>Qualificação: ${lead.qualificacao || ''}</small>
        `;
        return card;
    }

    function createLeadTableRow(lead) {
        const row = document.createElement('tr');
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
        return row;
    }
    
    // --- LÓGICA DE LEADS (NOVO, EDITAR, EXCLUIR) ---
    document.getElementById('lead-form').addEventListener('submit', (e) => {
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
        updateDashboard();
        e.target.reset();
    });

    const editModal = document.getElementById('edit-lead-modal');
    const editForm = document.getElementById('edit-lead-form');
    let currentLeadId = null;

    document.addEventListener('click', (e) => {
        const editButton = e.target.closest('.btn-edit-table');
        const deleteButton = e.target.closest('.btn-delete-table');
        const card = e.target.closest('.kanban-card');

        if (editButton || card) {
            const id = editButton ? editButton.closest('tr').dataset.id : card.dataset.id;
            currentLeadId = parseInt(id);
            const lead = leads.find(l => l.id === currentLeadId);
            if (lead) {
                document.getElementById('edit-lead-id').value = lead.id;
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
            const leadId = parseInt(deleteButton.closest('tr').dataset.id);
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

    document.getElementById('delete-lead-btn').addEventListener('click', () => {
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

    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) { // Fechar se clicar fora do conteúdo
            editModal.style.display = 'none';
        }
    });

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

    // --- LÓGICA DO DASHBOARD ---
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
        statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Novo', 'Em Progresso', 'Fechado'],
                datasets: [{
                    data: [novo, progresso, fechado],
                    backgroundColor: ['#00f7ff', '#ffc107', '#28a745'],
                    borderColor: ['#0d1117', '#0d1117', '#0d1117'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#cdd6f4',
                            font: { size: 14 }
                        }
                    }
                }
            }
        });
    }

    // --- LÓGICA DE EXPORTAÇÃO PARA EXCEL ---
    document.getElementById('export-excel-btn').addEventListener('click', () => {
        const dataToExport = leads.map(lead => ({
            "Nome": lead.nome,
            "Email": lead.email,
            "WhatsApp": lead.whatsapp,
            "Atendente": lead.atendente,
            "Origem": lead.origem,
            "Data de Contato": lead.data,
            "Qualificação": lead.qualificacao,
            "Status": lead.status,
            "Notas": lead.notas
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
        XLSX.writeFile(workbook, "leads_crm.xlsx");
    });
    
    // --- LÓGICA FINANCEIRO (CAIXA E ESTOQUE) ---
    // (O código de Financeiro, Estoque e Importação/Exportação do estoque permanece o mesmo)
    const caixaForm = document.getElementById('caixa-form');
    caixaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const novaMovimentacao = {
            data: document.getElementById('caixa-data').value,
            descricao: document.getElementById('caixa-descricao').value,
            valor: parseFloat(document.getElementById('caixa-valor').value),
            tipo: document.getElementById('caixa-tipo').value,
            observacoes: document.getElementById('caixa-observacoes').value
        };
        caixa.push(novaMovimentacao);
        updateCaixa();
        renderCaixaTable();
        caixaForm.reset();
    });

    function updateCaixa() {
        const totalEntradas = caixa.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.valor, 0);
        const totalSaidas = caixa.filter(m => m.tipo === 'saida').reduce((sum, m) => sum + m.valor, 0);
        document.getElementById('total-entradas').textContent = `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`;
        document.getElementById('total-saidas').textContent = `R$ ${totalSaidas.toFixed(2).replace('.', ',')}`;
        document.getElementById('caixa-atual').textContent = `R$ ${(totalEntradas - totalSaidas).toFixed(2).replace('.', ',')}`;
    }

    function renderCaixaTable() {
        const tableBody = document.querySelector('#caixa-table tbody');
        tableBody.innerHTML = '';
        caixa.forEach(mov => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${mov.data}</td>
                <td>${mov.descricao}</td>
                <td class="entrada">${mov.tipo === 'entrada' ? `R$ ${mov.valor.toFixed(2).replace('.', ',')}` : ''}</td>
                <td class="saida">${mov.tipo === 'saida' ? `R$ ${mov.valor.toFixed(2).replace('.', ',')}` : ''}</td>
                <td>${mov.observacoes}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    document.querySelectorAll('.finance-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTabId = e.target.dataset.tab + '-tab-content';
            document.querySelectorAll('.finance-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.finance-content').forEach(c => c.style.display = 'none');
            e.target.classList.add('active');
            document.getElementById(targetTabId).style.display = 'block';
        });
    });

    // ... (Restante do código de estoque, custos, importação/exportação)
    
    // --- LÓGICA DO ACELERADOR DE VENDAS (ANTIGA MENTORIA) ---
    // ATUALIZADO para usar as novas classes .modulos-*
    const modulosNavItems = document.querySelectorAll('.modulos-menu-item');
    const modulosContentAreas = document.querySelectorAll('.modulos-module-content');

    modulosNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-content');
            
            modulosNavItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            modulosContentAreas.forEach(area => {
                area.classList.remove('active');
                if (area.id === targetId) {
                    area.classList.add('active');
                }
            });
        });
    });

    // Inicia a aplicação
    initializeApp();
});
