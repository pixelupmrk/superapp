document.addEventListener('DOMContentLoaded', () => {

    // Dados Iniciais (Mentoria)
    // Para que a página não comece vazia, adicionamos alguns leads, itens de caixa e de estoque.
    // Em um ambiente real, estes dados seriam carregados de um banco de dados ou de uma API.
    const leads = [
        { id: 0, nome: 'Ana Carolina', status: 'quente', origem: 'Instagram', notas: 'Interessada na mentoria completa.', data: new Date('2025-05-15') },
        { id: 1, nome: 'Lucas Dantas', status: 'morno', origem: 'Anúncio', notas: 'Ficou de responder sobre o plano básico.', data: new Date('2025-05-10') },
        { id: 2, nome: 'Maria Lima', status: 'frio', origem: 'WhatsApp', notas: 'Apenas pediu informações, não respondeu mais.', data: new Date('2025-05-08') }
    ];
    let nextLeadId = 3; // Começa após o último ID

    let statusChart;
    
    let caixa = [
        { id: 0, tipo: 'entrada', data: '2025-05-10', valor: 550.00, descricao: 'Mentoria básica - Lucas Dantas' },
        { id: 1, tipo: 'saida', data: '2025-05-11', valor: 120.00, descricao: 'Anúncio Meta Ads' }
    ];
    let nextCaixaId = 2;

    let estoque = [
        { id: 0, produto: 'Módulo 1', descricao: 'Fundamentos e Posicionamento', compra: 0, venda: 500, custos: [{ descricao: 'Produção de conteúdo', valor: 0 }] },
        { id: 1, produto: 'Módulo 2', descricao: 'Algoritmo do Meta', compra: 0, venda: 500, custos: [{ descricao: 'Produção de conteúdo', valor: 0 }] },
        { id: 2, produto: 'Mentoria Completa', descricao: 'Pacote de 8 Módulos', compra: 0, venda: 3500, custos: [{ descricao: 'Horas de consultoria', valor: 0 }] }
    ];
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
            } else if (targetId === 'custos-section') {
                renderEstoqueCustosTable();
            }
        });
    });

    // Função para renderizar as visualizações
    function renderViews(view) {
        // Lógica de visualização ainda não implementada, apenas redireciona para a lista de leads
        renderLeadsTable();
    }

    // Modal de Lead
    const addLeadModal = document.getElementById('add-lead-modal');
    const addLeadForm = document.getElementById('add-lead-form');
    const openAddLeadModalBtn = document.getElementById('open-add-lead-modal');
    const closeAddLeadModalBtn = document.getElementById('close-add-lead-modal');

    openAddLeadModalBtn.addEventListener('click', () => {
        addLeadForm.reset();
        addLeadModal.style.display = 'flex';
    });

    closeAddLeadModalBtn.addEventListener('click', () => {
        addLeadModal.style.display = 'none';
    });

    addLeadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('add-lead-name').value;
        const status = document.getElementById('add-lead-status').value;
        const origem = document.getElementById('add-lead-source').value;
        const notas = document.getElementById('add-lead-notes').value;

        const newLead = {
            id: nextLeadId++,
            nome,
            status,
            origem,
            notas,
            data: new Date()
        };
        leads.push(newLead);
        renderLeadsTable();
        updateDashboard();
        addLeadModal.style.display = 'none';
        alert('Lead adicionado com sucesso!');
    });


    // Tabela de Leads
    const leadsTableBody = document.getElementById('leads-table-body');
    const searchLeadsInput = document.getElementById('search-leads');
    const filterStatusSelect = document.getElementById('filter-status');

    function renderLeadsTable(filteredLeads = leads) {
        leadsTableBody.innerHTML = '';
        filteredLeads.forEach(lead => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lead.nome}</td>
                <td><span class="status-badge status-${lead.status}">${lead.status.toUpperCase()}</span></td>
                <td>${lead.origem}</td>
                <td>${lead.data.toLocaleDateString()}</td>
                <td>
                    <button class="btn-action btn-edit-lead" data-id="${lead.id}"><i class="ph-fill ph-note-pencil"></i></button>
                    <button class="btn-action btn-delete-lead" data-id="${lead.id}"><i class="ph-fill ph-trash"></i></button>
                </td>
            `;
            leadsTableBody.appendChild(row);
        });
        attachTableEventListeners();
    }

    function attachTableEventListeners() {
        // Eventos para editar e excluir leads
        document.querySelectorAll('.btn-edit-lead').forEach(button => {
            button.addEventListener('click', (e) => {
                const leadId = parseInt(e.currentTarget.getAttribute('data-id'));
                openEditLeadModal(leadId);
            });
        });

        document.querySelectorAll('.btn-delete-lead').forEach(button => {
            button.addEventListener('click', (e) => {
                const leadId = parseInt(e.currentTarget.getAttribute('data-id'));
                deleteLead(leadId);
            });
        });
    }

    // Filtros e busca de leads
    searchLeadsInput.addEventListener('input', () => {
        filterLeads();
    });

    filterStatusSelect.addEventListener('change', () => {
        filterLeads();
    });

    function filterLeads() {
        const searchText = searchLeadsInput.value.toLowerCase();
        const statusFilter = filterStatusSelect.value;
        const filtered = leads.filter(lead => {
            const matchesSearch = lead.nome.toLowerCase().includes(searchText) ||
                                  lead.origem.toLowerCase().includes(searchText) ||
                                  lead.notas.toLowerCase().includes(searchText);
            const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        renderLeadsTable(filtered);
    }

    // Modal de Edição de Lead
    const editLeadModal = document.getElementById('edit-lead-modal');
    const editLeadForm = document.getElementById('edit-lead-form');
    const deleteLeadBtn = document.getElementById('delete-lead-btn');
    const closeEditModalBtn = document.getElementById('close-edit-modal');
    let currentEditLeadId = null;

    closeEditModalBtn.addEventListener('click', () => {
        editLeadModal.style.display = 'none';
    });

    function openEditLeadModal(leadId) {
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
            currentEditLeadId = leadId;
            document.getElementById('edit-lead-id').value = lead.id;
            document.getElementById('edit-lead-name').value = lead.nome;
            document.getElementById('edit-lead-status').value = lead.status;
            document.getElementById('edit-lead-source').value = lead.origem;
            document.getElementById('edit-lead-notes').value = lead.notas;

            editLeadModal.style.display = 'flex';
        }
    }

    editLeadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-lead-id').value);
        const nome = document.getElementById('edit-lead-name').value;
        const status = document.getElementById('edit-lead-status').value;
        const origem = document.getElementById('edit-lead-source').value;
        const notas = document.getElementById('edit-lead-notes').value;

        const leadIndex = leads.findIndex(l => l.id === id);
        if (leadIndex !== -1) {
            leads[leadIndex] = {
                ...leads[leadIndex],
                nome,
                status,
                origem,
                notas
            };
            renderLeadsTable();
            updateDashboard();
            editLeadModal.style.display = 'none';
            alert('Lead atualizado com sucesso!');
        }
    });

    deleteLeadBtn.addEventListener('click', () => {
        const id = parseInt(document.getElementById('edit-lead-id').value);
        deleteLead(id);
        editLeadModal.style.display = 'none';
    });

    function deleteLead(id) {
        const leadIndex = leads.findIndex(l => l.id === id);
        if (leadIndex !== -1) {
            if (confirm('Tem certeza que deseja excluir este lead?')) {
                leads.splice(leadIndex, 1);
                renderLeadsTable();
                updateDashboard();
                alert('Lead excluído com sucesso!');
            }
        }
    }

    // Kanban CRM
    const kanbanColumns = document.querySelectorAll('.kanban-column .kanban-cards');

    function renderKanbanCards() {
        kanbanColumns.forEach(column => column.innerHTML = '');

        leads.forEach(lead => {
            const card = document.createElement('div');
            card.classList.add('kanban-card');
            card.setAttribute('draggable', 'true');
            card.setAttribute('data-id', lead.id);
            card.innerHTML = `
                <div class="card-header">
                    <h4>${lead.nome}</h4>
                    <button class="btn-action btn-edit-lead-kanban" data-id="${lead.id}"><i class="ph-fill ph-note-pencil"></i></button>
                </div>
                <p class="card-meta">${lead.origem}</p>
                <p class="card-notes">${lead.notas.length > 50 ? lead.notas.substring(0, 50) + '...' : lead.notas}</p>
            `;
            document.getElementById(`kanban-column-${lead.status}`).appendChild(card);
        });

        attachKanbanEventListeners();
    }

    function attachKanbanEventListeners() {
        // Eventos de arrastar e soltar
        kanbanColumns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = getDragAfterElement(column, e.clientY);
                const draggable = document.querySelector('.kanban-card.dragging');
                if (draggable) {
                    if (afterElement == null) {
                        column.appendChild(draggable);
                    } else {
                        column.insertBefore(draggable, afterElement);
                    }
                }
            });
            column.addEventListener('drop', () => {
                const draggable = document.querySelector('.kanban-card.dragging');
                if (draggable) {
                    const newStatus = column.id.replace('kanban-column-', '');
                    const leadId = parseInt(draggable.getAttribute('data-id'));
                    const lead = leads.find(l => l.id === leadId);
                    if (lead) {
                        lead.status = newStatus;
                        updateDashboard();
                    }
                    draggable.classList.remove('dragging');
                }
            });
        });

        document.querySelectorAll('.kanban-card').forEach(card => {
            card.addEventListener('dragstart', () => {
                card.classList.add('dragging');
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });

        // Eventos de edição no Kanban
        document.querySelectorAll('.btn-edit-lead-kanban').forEach(button => {
            button.addEventListener('click', (e) => {
                const leadId = parseInt(e.currentTarget.getAttribute('data-id'));
                openEditLeadModal(leadId);
            });
        });
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }


    // Dashboard
    function updateDashboard() {
        const totalLeads = leads.length;
        const leadsQuentes = leads.filter(l => l.status === 'quente').length;
        const leadsMornos = leads.filter(l => l.status === 'morno').length;
        const leadsFrios = leads.filter(l => l.status === 'frio').length;

        document.getElementById('total-leads').textContent = totalLeads;
        document.getElementById('leads-quentes').textContent = leadsQuentes;
        document.getElementById('leads-mornos').textContent = leadsMornos;
        document.getElementById('leads-frios').textContent = leadsFrios;

        updateStatusChart(leadsQuentes, leadsMornos, leadsFrios);
        renderKanbanCards();
    }

    function updateStatusChart(quentes, mornos, frios) {
        const ctx = document.getElementById('statusChart').getContext('2d');
        const data = [quentes, mornos, frios];

        if (statusChart) {
            statusChart.data.datasets[0].data = data;
            statusChart.update();
        } else {
            statusChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Quentes', 'Mornos', 'Frios'],
                    datasets: [{
                        data: data,
                        backgroundColor: ['#ff6384', '#ffcd56', '#36a2eb'],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#cdd6f4'
                            }
                        }
                    }
                }
            });
        }
    }

    // Finanças: Caixa
    const caixaTableBody = document.getElementById('caixa-table-body');
    const totalEntradasElement = document.getElementById('total-entradas');
    const totalSaidasElement = document.getElementById('total-saidas');
    const saldoFinalElement = document.getElementById('saldo-final');
    const addCaixaForm = document.getElementById('add-caixa-form');
    const openAddCaixaModalBtn = document.getElementById('open-add-caixa-modal');
    const closeAddCaixaModalBtn = document.getElementById('close-add-caixa-modal');
    const addCaixaModal = document.getElementById('add-caixa-modal');

    openAddCaixaModalBtn.addEventListener('click', () => {
        addCaixaForm.reset();
        addCaixaModal.style.display = 'flex';
    });

    closeAddCaixaModalBtn.addEventListener('click', () => {
        addCaixaModal.style.display = 'none';
    });

    addCaixaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tipo = document.getElementById('caixa-tipo').value;
        const valor = parseFloat(document.getElementById('caixa-valor').value);
        const descricao = document.getElementById('caixa-descricao').value;
        const data = new Date().toLocaleDateString('pt-BR');

        if (valor > 0) {
            const newEntry = {
                id: nextCaixaId++,
                tipo,
                data,
                valor,
                descricao
            };
            caixa.push(newEntry);
            updateCaixa();
            renderCaixaTable();
            addCaixaModal.style.display = 'none';
            alert('Lançamento adicionado com sucesso!');
        } else {
            alert('Por favor, insira um valor válido.');
        }
    });

    function updateCaixa() {
        const totalEntradas = caixa.filter(e => e.tipo === 'entrada').reduce((sum, entry) => sum + entry.valor, 0);
        const totalSaidas = caixa.filter(e => e.tipo === 'saida').reduce((sum, entry) => sum + entry.valor, 0);
        const saldoFinal = totalEntradas - totalSaidas;

        totalEntradasElement.textContent = `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`;
        totalSaidasElement.textContent = `R$ ${totalSaidas.toFixed(2).replace('.', ',')}`;
        saldoFinalElement.textContent = `R$ ${saldoFinal.toFixed(2).replace('.', ',')}`;
    }

    function renderCaixaTable() {
        caixaTableBody.innerHTML = '';
        caixa.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="type-badge ${entry.tipo === 'entrada' ? 'type-entrada' : 'type-saida'}">${entry.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span></td>
                <td>${entry.data}</td>
                <td>${entry.descricao}</td>
                <td class="${entry.tipo === 'entrada' ? 'valor-entrada' : 'valor-saida'}">R$ ${entry.valor.toFixed(2).replace('.', ',')}</td>
            `;
            caixaTableBody.appendChild(row);
        });
    }

    // Finanças: Estoque
    const estoqueTableBody = document.getElementById('estoque-table-body');
    const estoqueTableBodyCustos = document.getElementById('estoque-table-body-custos');
    const addEstoqueModal = document.getElementById('add-estoque-modal');
    const addEstoqueForm = document.getElementById('add-estoque-form');
    const openAddEstoqueModalBtn = document.getElementById('open-add-estoque-modal');
    const closeAddEstoqueModalBtn = document.getElementById('close-add-estoque-modal');

    openAddEstoqueModalBtn.addEventListener('click', () => {
        addEstoqueForm.reset();
        addEstoqueModal.style.display = 'flex';
    });

    closeAddEstoqueModalBtn.addEventListener('click', () => {
        addEstoqueModal.style.display = 'none';
    });

    addEstoqueForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const produto = document.getElementById('estoque-produto').value;
        const descricao = document.getElementById('estoque-descricao').value;
        const compra = parseFloat(document.getElementById('estoque-compra').value);
        const venda = parseFloat(document.getElementById('estoque-venda').value);

        if (produto && !isNaN(compra) && !isNaN(venda)) {
            const newProduto = {
                id: estoque.length > 0 ? Math.max(...estoque.map(p => p.id)) + 1 : 0,
                produto,
                descricao,
                compra,
                venda,
                custos: []
            };
            estoque.push(newProduto);
            updateEstoque();
            renderEstoqueTable();
            addEstoqueModal.style.display = 'none';
            alert('Produto/Serviço adicionado com sucesso!');
        } else {
            alert('Por favor, preencha todos os campos corretamente.');
        }
    });

    function updateEstoque() {
        const totalItens = estoque.length;
        const totalVenda = estoque.reduce((sum, item) => sum + item.venda, 0);
        const totalCompra = estoque.reduce((sum, item) => sum + item.compra, 0);
        const totalLucro = totalVenda - totalCompra - estoque.reduce((sum, item) => sum + item.custos.reduce((costSum, custo) => costSum + custo.valor, 0), 0);

        document.getElementById('total-produtos').textContent = totalItens;
        document.getElementById('valor-venda-total').textContent = `R$ ${totalVenda.toFixed(2).replace('.', ',')}`;
        document.getElementById('valor-compra-total').textContent = `R$ ${totalCompra.toFixed(2).replace('.', ',')}`;
        document.getElementById('lucro-total').textContent = `R$ ${totalLucro.toFixed(2).replace('.', ',')}`;
    }

    function renderEstoqueTable(filtered = estoque) {
        estoqueTableBody.innerHTML = '';
        filtered.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.produto}</td>
                <td>${item.descricao}</td>
                <td>R$ ${item.compra.toFixed(2).replace('.', ',')}</td>
                <td>R$ ${item.venda.toFixed(2).replace('.', ',')}</td>
                <td>R$ ${item.custos.reduce((sum, custo) => sum + custo.valor, 0).toFixed(2).replace('.', ',')}</td>
                <td><button class="btn-action btn-add-custo" data-id="${item.id}"><i class="ph-fill ph-plus-circle"></i></button></td>
            `;
            estoqueTableBody.appendChild(row);
        });

        attachEstoqueEventListeners();
    }

    function renderEstoqueCustosTable() {
        estoqueTableBodyCustos.innerHTML = '';
        estoque.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.produto}</td>
                <td>${item.descricao}</td>
                <td>R$ ${item.compra.toFixed(2).replace('.', ',')}</td>
                <td>R$ ${item.venda.toFixed(2).replace('.', ',')}</td>
                <td>R$ ${item.custos.reduce((sum, custo) => sum + custo.valor, 0).toFixed(2).replace('.', ',')}</td>
                <td><button class="btn-action btn-add-custo" data-id="${item.id}"><i class="ph-fill ph-plus-circle"></i></button></td>
                <td><button class="btn-action btn-view-custos" data-id="${item.id}"><i class="ph-fill ph-eye"></i></button></td>
            `;
            estoqueTableBodyCustos.appendChild(row);
        });
        
        attachEstoqueCustosEventListeners();
    }

    function attachEstoqueEventListeners() {
        document.querySelectorAll('.btn-add-custo').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = parseInt(e.currentTarget.getAttribute('data-id'));
                openAddCustoModal(itemId);
            });
        });
    }

    function attachEstoqueCustosEventListeners() {
        document.querySelectorAll('.btn-add-custo').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = parseInt(e.currentTarget.getAttribute('data-id'));
                openAddCustoModal(itemId);
            });
        });

        document.querySelectorAll('.btn-view-custos').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = parseInt(e.currentTarget.getAttribute('data-id'));
                viewCustos(itemId);
            });
        });
    }

    // Modal de Custos
    const addCustoModal = document.getElementById('add-custo-modal');
    const addCustoForm = document.getElementById('add-custo-form');
    const closeCustoModalBtn = document.getElementById('close-custo-modal');
    let currentAddCustoProdutoId = null;

    closeCustoModalBtn.addEventListener('click', () => {
        addCustoModal.style.display = 'none';
    });

    function openAddCustoModal(itemId) {
        currentAddCustoProdutoId = itemId;
        const produto = estoque.find(p => p.id === itemId);
        if (produto) {
            document.getElementById('add-custo-descricao-produto').value = produto.produto;
            addCustoForm.reset();
            addCustoModal.style.display = 'flex';
        }
    }

    addCustoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const descricaoCusto = document.getElementById('custo-descricao-custo').value;
        const valorCusto = parseFloat(document.getElementById('custo-valor').value);

        if (descricaoCusto && !isNaN(valorCusto)) {
            const produto = estoque.find(p => p.id === currentAddCustoProdutoId);
            if (produto) {
                produto.custos.push({ descricao: descricaoCusto, valor: valorCusto });
                updateEstoque();
                renderEstoqueTable();
                renderEstoqueCustosTable();
                addCustoModal.style.display = 'none';
                alert('Custo adicionado com sucesso!');
            }
        } else {
            alert('Por favor, preencha todos os campos de custo corretamente.');
        }
    });

    // Função de importar dados
    function parseCSV(csv) {
        const lines = csv.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(';');
        const data = lines.slice(1).map(line => {
            const values = line.split(';');
            return headers.reduce((obj, header, index) => {
                obj[header.trim()] = values[index]?.trim() || '';
                return obj;
            }, {});
        });
        return data;
    }

    function parseEstoque(csv) {
        const lines = csv.split('\n').map(line => line.trim());
        const parsedData = [];
        let currentProduto = null;

        for (const line of lines) {
            if (line.trim() === '') {
                currentProduto = null;
                continue;
            }

            const row = line.split(';');
            const rowProduto = row[0];
            const rowDescricao = row[1];

            if (rowProduto && rowDescricao) {
                const existingProduct = parsedData.find(p => p.produto === rowProduto);
                if (existingProduct) {
                    const custoDescricao = row[5];
                    const custoValor = parseFloat(row[6]?.toString().replace(',', '.'));
                    if (custoDescricao && !isNaN(custoValor)) {
                        existingProduct.custos.push({
                            descricao: custoDescricao,
                            valor: custoValor
                        });
                    }
                } else {
                    const compra = parseFloat(row[4]?.toString().replace(',', '.'));
                    const venda = parseFloat(row[8]?.toString().replace(',', '.'));
                    const novoProduto = {
                        produto: rowProduto,
                        descricao: rowDescricao,
                        compra: compra,
                        venda: venda,
                        custos: [],
                    };
                    
                    const custoDescricao = row[5];
                    const custoValor = parseFloat(row[6]?.toString().replace(',', '.'));
                    if (custoDescricao && !isNaN(custoValor)) {
                        novoProduto.custos.push({
                            descricao: custoDescricao,
                            valor: custoValor
                        });
                    }
                    parsedData.push(novoProduto);
                    currentProduto = novoProduto;
                }
            } else {
                currentProduto = null; // Reset for empty rows between products
            }
        }
        return parsedData;
    }

    // Inicialização
    updateDashboard();
    renderKanbanCards();
    renderEstoqueTable();
    renderLeadsTable();
});
