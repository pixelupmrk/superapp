document.addEventListener('DOMContentLoaded', () => {

    const leads = [];
    let nextLeadId = 0;
    let statusChart;
    let caixa = [];
    let estoque = [];
    let currentEstoqueDescricao = null;

    // Lógica para a navegação da sidebar
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const contentAreas = document.querySelectorAll('.main-content .content-area');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-target');
            const targetText = e.currentTarget.querySelector('span').textContent;

            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');

            contentAreas.forEach(area => {
                area.style.display = 'none';
            });
            document.getElementById(targetId).style.display = 'block';
            pageTitle.textContent = targetText;

            if (targetId === 'dashboard-section') {
                updateDashboard();
            } else if (targetId === 'crm-list-section') {
                renderLeadsTable();
            } else if (targetId === 'finance-section') {
                updateCaixa();
                renderCaixaTable();
                updateEstoque();
                renderEstoqueTable();
            } else if (targetId === 'estoque-section') {
                updateEstoque();
                renderEstoqueTable();
            }
        });
    });

    // Funções do Dashboard
    function updateDashboard() {
        const totalLeads = leads.length;
        const leadsFechados = leads.filter(lead => lead.status === 'fechado').length;
        document.getElementById('total-leads').textContent = totalLeads;
        document.getElementById('leads-fechados').textContent = leadsFechados;
        updateStatusChart();
    }

    function updateStatusChart() {
        const leadsStatus = {
            quente: leads.filter(lead => lead.status === 'quente').length,
            morno: leads.filter(lead => lead.status === 'morno').length,
            frio: leads.filter(lead => lead.status === 'frio').length,
            fechado: leads.filter(lead => lead.status === 'fechado').length
        };

        const ctx = document.getElementById('leads-status-chart').getContext('2d');
        if (statusChart) {
            statusChart.destroy();
        }

        statusChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Quente', 'Morno', 'Frio', 'Fechado'],
                datasets: [{
                    data: [leadsStatus.quente, leadsStatus.morno, leadsStatus.frio, leadsStatus.fechado],
                    backgroundColor: ['#dc3545', '#ffc107', '#0d6efd', '#28a745'],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });
    }

    // Funções do CRM
    const addLeadModal = document.getElementById('add-lead-modal');
    const addLeadBtn = document.getElementById('add-lead-btn');
    const closeAddLeadModal = document.getElementById('close-add-lead-modal');
    const addLeadForm = document.getElementById('add-lead-form');

    const editLeadModal = document.getElementById('edit-lead-modal');
    const editLeadForm = document.getElementById('edit-lead-form');
    const deleteLeadBtn = document.getElementById('delete-lead-btn');

    const kanbanColumns = document.querySelectorAll('.kanban-column');

    function renderLeadsTable() {
        const tableBody = document.querySelector('#leads-table tbody');
        tableBody.innerHTML = '';
        leads.forEach(lead => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lead.name}</td>
                <td><span class="lead-status ${lead.status}">${lead.status}</span></td>
                <td>${new Date(lead.date).toLocaleDateString()}</td>
                <td class="table-actions">
                    <button class="edit-btn" data-id="${lead.id}"><i class="ph-fill ph-note-pencil"></i></button>
                    <button class="delete-btn" data-id="${lead.id}"><i class="ph-fill ph-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        attachTableEventListeners();
    }

    function renderLeadsKanban() {
        kanbanColumns.forEach(column => {
            column.querySelector('.kanban-cards').innerHTML = '';
        });

        leads.forEach(lead => {
            const card = document.createElement('div');
            card.className = 'lead-card';
            card.draggable = true;
            card.dataset.id = lead.id;
            card.dataset.status = lead.status;
            card.innerHTML = `
                <h4>${lead.name}</h4>
                <p>${new Date(lead.date).toLocaleDateString()}</p>
                <div class="lead-actions">
                    <button class="edit-btn" data-id="${lead.id}"><i class="ph-fill ph-note-pencil"></i></button>
                    <button class="delete-btn" data-id="${lead.id}"><i class="ph-fill ph-trash"></i></button>
                </div>
            `;
            document.querySelector(`#kanban-${lead.status} .kanban-cards`).appendChild(card);
        });

        attachKanbanEventListeners();
    }

    // Função para adicionar e editar leads
    function addLead(name, email, phone, status, notes) {
        const newLead = {
            id: nextLeadId++,
            name,
            email,
            phone,
            status,
            notes,
            date: new Date().toISOString()
        };
        leads.push(newLead);
        renderLeadsTable();
        renderLeadsKanban();
        updateDashboard();
    }

    function editLead(id, name, email, phone, status, notes) {
        const lead = leads.find(l => l.id === id);
        if (lead) {
            lead.name = name;
            lead.email = email;
            lead.phone = phone;
            lead.status = status;
            lead.notes = notes;
            renderLeadsTable();
            renderLeadsKanban();
            updateDashboard();
        }
    }

    function deleteLead(id) {
        const index = leads.findIndex(l => l.id === id);
        if (index > -1) {
            leads.splice(index, 1);
            renderLeadsTable();
            renderLeadsKanban();
            updateDashboard();
        }
    }

    // Event listeners
    addLeadBtn.addEventListener('click', () => {
        addLeadForm.reset();
        addLeadModal.style.display = 'flex';
    });
    closeAddLeadModal.addEventListener('click', () => {
        addLeadModal.style.display = 'none';
    });
    addLeadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('lead-name').value;
        const email = document.getElementById('lead-email').value;
        const phone = document.getElementById('lead-phone').value;
        const status = document.getElementById('lead-status').value;
        const notes = document.getElementById('lead-notes').value;
        addLead(name, email, phone, status, notes);
        addLeadModal.style.display = 'none';
    });

    function attachTableEventListeners() {
        document.querySelectorAll('#leads-table .edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const lead = leads.find(l => l.id === id);
                if (lead) {
                    document.getElementById('edit-lead-id').value = lead.id;
                    document.getElementById('edit-lead-name').value = lead.name;
                    document.getElementById('edit-lead-email').value = lead.email;
                    document.getElementById('edit-lead-phone').value = lead.phone;
                    document.getElementById('edit-lead-status').value = lead.status;
                    document.getElementById('edit-lead-notes').value = lead.notes;
                    editLeadModal.style.display = 'flex';
                }
            });
        });

        document.querySelectorAll('#leads-table .delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                if (confirm('Tem certeza que deseja excluir este lead?')) {
                    deleteLead(id);
                }
            });
        });
    }

    // Edit and Delete Modal
    editLeadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-lead-id').value);
        const name = document.getElementById('edit-lead-name').value;
        const email = document.getElementById('edit-lead-email').value;
        const phone = document.getElementById('edit-lead-phone').value;
        const status = document.getElementById('edit-lead-status').value;
        const notes = document.getElementById('edit-lead-notes').value;
        editLead(id, name, email, phone, status, notes);
        editLeadModal.style.display = 'none';
    });

    deleteLeadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-lead-id').value);
        if (confirm('Tem certeza que deseja excluir este lead?')) {
            deleteLead(id);
            editLeadModal.style.display = 'none';
        }
    });

    // Kanban Drag and Drop
    function attachKanbanEventListeners() {
        const cards = document.querySelectorAll('.lead-card');
        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.id);
            });
        });

        kanbanColumns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                const leadId = parseInt(e.dataTransfer.getData('text/plain'));
                const newStatus = e.currentTarget.dataset.status;
                const lead = leads.find(l => l.id === leadId);
                if (lead) {
                    lead.status = newStatus;
                    renderLeadsKanban();
                    updateDashboard();
                }
            });
        });
    }

    // Financeiro
    const addReceitaBtn = document.getElementById('add-receita-btn');
    const addDespesaBtn = document.getElementById('add-despesa-btn');
    const addFinanceModal = document.getElementById('add-finance-modal');
    const closeFinanceModalBtn = document.getElementById('close-finance-modal');
    const addFinanceForm = document.getElementById('add-finance-form');
    const financeDescriptionInput = document.getElementById('finance-descricao');
    const financeValueInput = document.getElementById('finance-valor');
    const financeTypeInput = document.getElementById('finance-tipo');

    addReceitaBtn.addEventListener('click', () => {
        financeTypeInput.value = 'receita';
        addFinanceForm.reset();
        addFinanceModal.style.display = 'flex';
    });

    addDespesaBtn.addEventListener('click', () => {
        financeTypeInput.value = 'despesa';
        addFinanceForm.reset();
        addFinanceModal.style.display = 'flex';
    });

    closeFinanceModalBtn.addEventListener('click', () => {
        addFinanceModal.style.display = 'none';
    });

    addFinanceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const descricao = financeDescriptionInput.value;
        const valor = parseFloat(financeValueInput.value);
        const tipo = financeTypeInput.value;
        if (descricao && !isNaN(valor)) {
            const newEntry = {
                id: Date.now(),
                data: new Date().toISOString(),
                tipo,
                descricao,
                valor
            };
            caixa.push(newEntry);
            updateCaixa();
            renderCaixaTable();
            addFinanceModal.style.display = 'none';
        }
    });

    function updateCaixa() {
        const totalReceita = caixa.filter(c => c.tipo === 'receita').reduce((sum, c) => sum + c.valor, 0);
        const totalDespesa = caixa.filter(c => c.tipo === 'despesa').reduce((sum, c) => sum + c.valor, 0);
        const saldo = totalReceita - totalDespesa;
        document.getElementById('total-receita').textContent = `R$ ${totalReceita.toFixed(2).replace('.', ',')}`;
        document.getElementById('total-despesa').textContent = `R$ ${totalDespesa.toFixed(2).replace('.', ',')}`;
        document.getElementById('total-saldo').textContent = `R$ ${saldo.toFixed(2).replace('.', ',')}`;
    }

    function renderCaixaTable() {
        const tableBody = document.querySelector('#caixa-table tbody');
        tableBody.innerHTML = '';
        caixa.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(entry.data).toLocaleDateString()}</td>
                <td><span class="${entry.tipo}">${entry.tipo.toUpperCase()}</span></td>
                <td>${entry.descricao}</td>
                <td>R$ ${entry.valor.toFixed(2).replace('.', ',')}</td>
                <td>
                    <button class="delete-caixa-btn" data-id="${entry.id}"><i class="ph-fill ph-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.delete-caixa-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                caixa = caixa.filter(entry => entry.id !== id);
                updateCaixa();
                renderCaixaTable();
            });
        });
    }

    // Estoque
    const addEstoqueBtn = document.getElementById('add-estoque-btn');
    const addEstoqueModal = document.getElementById('add-estoque-modal');
    const addEstoqueForm = document.getElementById('add-estoque-form');
    const closeAddEstoqueModal = document.getElementById('close-add-estoque-modal');
    const estoqueSearch = document.getElementById('estoque-search');
    const importEstoqueBtn = document.getElementById('import-estoque-btn');
    
    const addCustoModal = document.getElementById('add-custo-modal');
    const closeCustoModalBtn = document.getElementById('close-custo-modal');
    const addCustoForm = document.getElementById('add-custo-form');

    addEstoqueBtn.addEventListener('click', () => {
        addEstoqueForm.reset();
        addEstoqueModal.style.display = 'flex';
    });
    
    addEstoqueForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const produto = document.getElementById('estoque-produto').value;
        const descricao = document.getElementById('estoque-descricao').value;
        const compra = parseFloat(document.getElementById('estoque-compra').value);
        const venda = parseFloat(document.getElementById('estoque-venda').value);
        
        if (produto && !isNaN(compra) && !isNaN(venda)) {
            const novoProduto = {
                produto,
                descricao,
                compra,
                venda,
                custos: []
            };
            estoque.push(novoProduto);
            updateEstoque();
            renderEstoqueTable();
            addEstoqueModal.style.display = 'none';
        }
    });

    closeAddEstoqueModal.addEventListener('click', () => {
        addEstoqueModal.style.display = 'none';
    });

    function updateEstoque() {
        estoque.forEach(produto => {
            const totalCustos = produto.custos.reduce((sum, custo) => sum + custo.valor, 0);
            produto.custoTotal = produto.compra + totalCustos;
            produto.lucroEstimado = produto.venda - produto.custoTotal;
        });
    }

    function renderEstoqueTable(filteredEstoque = estoque) {
        const tableBody = document.querySelector('#estoque-table tbody');
        tableBody.innerHTML = '';
        filteredEstoque.forEach(produto => {
            const row = document.createElement('tr');
            const lucroClass = produto.lucroEstimado >= 0 ? 'profit-positive' : 'profit-negative';
            const lucroFormatado = `R$ ${produto.lucroEstimado.toFixed(2).replace('.', ',')}`;

            row.innerHTML = `
                <td>${produto.produto}</td>
                <td>${produto.descricao}</td>
                <td>R$ ${produto.custoTotal.toFixed(2).replace('.', ',')} <button class="custos-info-btn" data-descricao="${produto.produto}">Custos</button></td>
                <td>R$ ${produto.venda.toFixed(2).replace('.', ',')}</td>
                <td class="profit-column ${lucroClass}">${lucroFormatado}</td>
                <td class="table-actions">
                    <button class="edit-estoque-btn" data-produto="${produto.produto}"><i class="ph-fill ph-note-pencil"></i></button>
                    <button class="delete-estoque-btn" data-produto="${produto.produto}"><i class="ph-fill ph-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        attachEstoqueEventListeners();
    }

    function attachEstoqueEventListeners() {
        document.querySelectorAll('.edit-estoque-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const produto = e.currentTarget.dataset.produto;
                // Lógica de edição
            });
        });
        document.querySelectorAll('.delete-estoque-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const produto = e.currentTarget.dataset.produto;
                if (confirm(`Tem certeza que deseja excluir o produto ${produto}?`)) {
                    estoque = estoque.filter(item => item.produto !== produto);
                    renderEstoqueTable();
                }
            });
        });

        document.querySelectorAll('.custos-info-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                currentEstoqueDescricao = e.currentTarget.dataset.descricao;
                // Lógica para mostrar custos
            });
        });
    }

    estoqueSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredEstoque = estoque.filter(item => 
            item.produto.toLowerCase().includes(searchTerm) || 
            item.descricao.toLowerCase().includes(searchTerm)
        );
        renderEstoqueTable(filteredEstoque);
    });
    
    // Importação de CSV
    importEstoqueBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                Papa.parse(file, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        const parsedData = parseCsvData(results.data);
                        estoque = parsedData;
                        updateEstoque();
                        renderEstoqueTable();
                        alert('Dados de estoque importados com sucesso!');
                    }
                });
            }
        };
        input.click();
    });

    function parseCsvData(data) {
        const parsedData = [];
        let currentProduto = null;

        for (const row of data) {
            const rowProduto = row.Produto;
            const rowDescricao = row.Descricao;
            if (rowProduto && rowDescricao) {
                currentProduto = {
                    produto: rowProduto,
                    descricao: rowDescricao,
                    compra: parseFloat(row['Valor de Compra']),
                    venda: parseFloat(row['Valor de Venda']),
                    custos: [],
                };
                if (row['Custo Adicional Descrição'] && row['Custo Adicional Valor']) {
                    currentProduto.custos.push({
                        descricao: row['Custo Adicional Descrição'],
                        valor: parseFloat(row['Custo Adicional Valor'])
                    });
                }
                parsedData.push(currentProduto);
            } else if (currentProduto) {
                const custoDescricao = row['Custo Adicional Descrição'];
                const custoValor = parseFloat(row['Custo Adicional Valor']);
                if (custoDescricao && !isNaN(custoValor)) {
                    currentProduto.custos.push({
                        descricao: custoDescricao,
                        valor: custoValor
                    });
                }
            } else {
                currentProduto = null; // Reset for empty rows between products
            }
        }
        return parsedData;
    }

    // Inicialização
    updateDashboard();
});
