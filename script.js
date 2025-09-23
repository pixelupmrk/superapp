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
            }
        });
    });
 // Lógica para o Kanban (Drag and Drop)
    const kanbanBoard = document.getElementById('kanban-board');
    let draggedItem = null;
 kanbanBoard.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('kanban-card')) {
            draggedItem = e.target;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', e.target.getAttribute('data-id'));
            setTimeout(() => {
                e.target.style.display = 'none';
            }, 0);
 
        }
    });
 kanbanBoard.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('kanban-card')) {
            e.target.style.display = 'block';
            draggedItem = null;
        }
    });
 kanbanBoard.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(e.target, e.clientY);
        const column = e.target.closest('.kanban-column');
        if (column) {
            const list = column.querySelector('.kanban-cards-list');
            if (afterElement == null) {
                list.appendChild(draggedItem);
         
        } else {
                list.insertBefore(draggedItem, afterElement);
            }
        }
    });
 kanbanBoard.addEventListener('drop', (e) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('text/plain');
        const card = document.querySelector(`.kanban-card[data-id="${cardId}"]`);
        const newStatus = e.target.closest('.kanban-column').getAttribute('data-status');

        if (card && newStatus) {
            const lead = leads.find(l => l.id == cardId);
            if (lead) {
           
             lead.status = newStatus;
                updateDashboard();
            }
        }
    });
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
            <strong>${lead.nome ||
 ''}</strong><br>
            <small>WhatsApp: <a href="https://wa.me/${lead.whatsapp || ''}" target="_blank">${lead.whatsapp ||
 ''}</a></small><br>
            <small>Origem: ${lead.origem ||
 ''}</small><br>
            <small>Qualificação: ${lead.qualificacao ||
 ''}</small>
        `;

        return newCard;
 }

    function createLeadTableRow(lead) {
        const row = document.createElement('tr');
        row.setAttribute('data-id', lead.id);
 row.innerHTML = `
            <td>${lead.nome ||
 ''}</td>
            <td><a href="https://wa.me/${lead.whatsapp || ''}" target="_blank">${lead.whatsapp ||
 ''}</a></td>
            <td>${lead.origem ||
 ''}</td>
            <td>${lead.qualificacao ||
 ''}</td>
            <td>${lead.status ||
 ''}</td>
            <td>
                <button class="btn-edit-table"><i class="ph-fill ph-note-pencil"></i></button>
                <button class="btn-delete-table"><i class="ph-fill ph-trash"></i></button>
            </td>
        `;
 return row;
    }

    // Lógica para o formulário de novo lead
    const leadForm = document.getElementById('lead-form');
 leadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newLead = {
            id: nextLeadId++,
            nome: document.getElementById('lead-name').value,
            email: document.getElementById('lead-email').value,
            whatsapp: document.getElementById('lead-whatsapp').value,
            atendente: document.getElementById('lead-attendant').value,
            origem: 
 document.getElementById('lead-origin').value,
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

    // Lógica para o Modal de Edição
    const editModal = document.getElementById('edit-lead-modal');
 const editForm = document.getElementById('edit-lead-form');
    const deleteLeadBtn = document.getElementById('delete-lead-btn');
    let currentLeadId = null;
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
                document.getElementById('edit-lead-date').value = lead.data ||
 '';
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
                            font: {
              
                                 size: 14
                            }
                        }
                    },
         
                     tooltip: {
                        enabled: true
                    }
                }
            }
        });
 }

    // Lógica de Exportação para Excel
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
    
    // Lógica para a área Financeira
    const caixaForm = document.getElementById('caixa-form');
 caixaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const tipo = document.getElementById('caixa-tipo').value;
        const valor = parseFloat(document.getElementById('caixa-valor').value);
        const novaMovimentacao = {
            data: document.getElementById('caixa-data').value,
            descricao: document.getElementById('caixa-descricao').value,
            valor: valor,
         
             tipo: tipo,
            observacoes: document.getElementById('caixa-observacoes').value
        };

        caixa.push(novaMovimentacao);
        updateCaixa();
        renderCaixaTable();
        caixaForm.reset();
    });
 function updateCaixa() {
        let totalEntradas = 0;
        let totalSaidas = 0;
 caixa.forEach(mov => {
            if (mov.tipo === 'entrada') {
                totalEntradas += mov.valor;
            } else if (mov.tipo === 'saida') {
                totalSaidas += mov.valor;
            }
        });
 const caixaAtual = totalEntradas - totalSaidas;
        document.getElementById('total-entradas').textContent = `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`;
        document.getElementById('total-saidas').textContent = `R$ ${totalSaidas.toFixed(2).replace('.', ',')}`;
 document.getElementById('caixa-atual').textContent = `R$ ${caixaAtual.toFixed(2).replace('.', ',')}`;
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

    // Lógica para as abas do Financeiro
    const financeTabs = document.querySelectorAll('.finance-tab');
 financeTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTabId = e.target.getAttribute('data-tab') + '-tab-content';
            
            financeTabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.finance-content').forEach(c => c.style.display = 'none');
            
    
             e.target.classList.add('active');
            document.getElementById(targetTabId).style.display = 'block';
        });
    });
 // Lógica para a área de Estoque e Custos
    const estoqueForm = document.getElementById('estoque-form');
    const estoqueSearch = document.getElementById('estoque-search');
 estoqueForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const novoProduto = {
            produto: document.getElementById('estoque-produto').value,
            descricao: document.getElementById('estoque-descricao').value.toUpperCase(),
            compra: parseFloat(document.getElementById('estoque-compra').value),
            venda: parseFloat(document.getElementById('estoque-venda').value),
            custos: [],
            totalCustos: 
 0,
            lucro: 0
        };

        estoque.push(novoProduto);
        updateEstoque();
        renderEstoqueTable();
        estoqueForm.reset();
    });
 function updateEstoque() {
        estoque.forEach(produto => {
            const totalCustos = produto.custos.reduce((sum, custo) => sum + custo.valor, 0);
            produto.totalCustos = totalCustos;
            produto.lucro = produto.venda - (produto.compra + totalCustos);
        });
 }

    function renderEstoqueTable() {
        const tableBody = document.querySelector('#estoque-table tbody');
 tableBody.innerHTML = '';
        
        const searchTerm = estoqueSearch.value.toLowerCase();
        const filteredEstoque = estoque.filter(produto => 
            produto.produto.toLowerCase().includes(searchTerm) || 
            produto.descricao.toLowerCase().includes(searchTerm)
        );
 filteredEstoque.forEach(produto => {
            const row = document.createElement('tr');
            row.setAttribute('data-descricao', produto.descricao);

            const custosHtml = produto.custos.length > 0
                ? produto.custos.map(c => `<li>${c.descricao}: R$ ${c.valor.toFixed(2).replace('.', ',')}</li>`).join('')
                : 'Nenhum custo adicionado.';

            
 row.innerHTML = `
                <td>${produto.produto}</td>
                <td>${produto.descricao}</td>
                <td>R$ ${produto.compra.toFixed(2).replace('.', ',')}</td>
                <td>
                    <ul class="custos-list">${custosHtml}</ul>
           
                 <button class="custos-info-btn" data-descricao="${produto.descricao}">+ Add Custo</button>
                </td>
                <td>R$ ${produto.venda.toFixed(2).replace('.', ',')}</td>
                <td>R$ ${produto.lucro.toFixed(2).replace('.', ',')}</td>
                <td>
                   
                  <button class="btn-delete-produto"><i class="ph-fill ph-trash"></i></button>
                </td>
            `;
 tableBody.appendChild(row);
        });
    }

    estoqueSearch.addEventListener('input', renderEstoqueTable);

    // Lógica para Adicionar Custos e Excluir Produtos
    const addCustoModal = document.getElementById('add-custo-modal');
 const addCustoForm = document.getElementById('add-custo-form');
    const closeCustoModalBtn = document.getElementById('close-custo-modal');

    document.addEventListener('click', (e) => {
        const addCustoBtn = e.target.closest('.custos-info-btn');
        const deleteProdutoBtn = e.target.closest('.btn-delete-produto');
        
        if (addCustoBtn) {
            currentEstoqueDescricao = addCustoBtn.getAttribute('data-descricao');
            addCustoModal.style.display = 'flex';
        }
        
     
        if (deleteProdutoBtn) {
            const row = deleteProdutoBtn.closest('tr');
            const descricao = row.getAttribute('data-descricao');
            if (confirm(`Tem certeza que deseja excluir o produto com a descrição ${descricao}?`)) {
                const produtoIndex = estoque.findIndex(p => p.descricao === descricao);
                if (produtoIndex 
 > -1) {
                    estoque.splice(produtoIndex, 1);
                    updateEstoque();
                    renderEstoqueTable();
                }
            }
        }
 
     });

    closeCustoModalBtn.addEventListener('click', () => {
        addCustoModal.style.display = 'none';
        addCustoForm.reset();
    });
 addCustoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const produto = estoque.find(p => p.descricao === currentEstoqueDescricao);
        if (produto) {
            const novoCusto = {
                descricao: document.getElementById('custo-descricao-custo').value,
                valor: parseFloat(document.getElementById('custo-valor').value)
            };
   
                 produto.custos.push(novoCusto);
            updateEstoque();
            renderEstoqueTable();
            addCustoModal.style.display = 'none';
            addCustoForm.reset();
        }
    });
 // Lógica de Importação/Exportação para a tabela de Estoque
    const importEstoqueFile = document.getElementById('import-estoque-file');
    const exportEstoqueBtn = document.getElementById('export-estoque-btn');
 importEstoqueFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
    
             const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
                raw: false,
                defval: "",
            });
          
       
            // Mapear os dados da planilha para a estrutura do aplicativo
            const newEstoque = parseEstoqueData(json);
            estoque = newEstoque;
            updateEstoque();
            renderEstoqueTable();
            alert('Dados importados com sucesso!');
        
 };
        reader.readAsBinaryString(file);
    });
 exportEstoqueBtn.addEventListener('click', () => {
        const dataToExport = [];
        estoque.forEach(item => {
            const baseRow = {
                "Produto": item.produto,
                "Descrição": item.descricao,
                "Valor de Compra": item.compra,
        
                 "Valor de Venda": item.venda,
                "Total de Custos": item.totalCustos,
                "Lucro": item.lucro
            };
            if (item.custos.length > 0) {
                item.custos.forEach(custo => {
       
                      dataToExport.push({
                        ...baseRow,
                        "Custo - Descrição": custo.descricao,
                        "Custo - Valor": custo.valor
         
                     });
                });
            } else {
                dataToExport.push(baseRow);
            }
        });
        
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
         const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque");
        XLSX.writeFile(workbook, "estoque_e_custos.xlsx");
 });
    
    function parseEstoqueData(data) {
        const parsedData = [];
 const headerIndex = data.findIndex(row => row[0] === "Veículo" || row[0] === "Produto");
 if (headerIndex === -1) {
            alert("Não foi possível encontrar o cabeçalho da planilha. Verifique se as colunas 'Veículo'/'Produto' e 'Placa'/'Descrição' existem.");
 return [];
        }

        let currentProduto = null;
 for (let i = headerIndex + 1; i < data.length; i++) {
            const row = data[i];
 const rowProduto = row[0] || currentProduto?.produto;
            const rowDescricao = row[1] || currentProduto?.descricao;
 if (rowProduto && rowDescricao) {
                const existingProduct = parsedData.find(p => p.descricao === rowDescricao);
 if (existingProduct) {
                    const custoDescricao = row[5];
 const custoValor = parseFloat(row[6].toString().replace(',', '.'));
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
                currentProduto = null;
 // Reset for empty rows between products
            }
        }
        return parsedData;
 }

    // Inicialização
    updateDashboard();

    // --- NOVA LÓGICA PARA A SEÇÃO DE MENTORIA ---
    const mentoriaNavItems = document.querySelectorAll('.mentoria-menu-item');
    const mentoriaContentAreas = document.querySelectorAll('.mentoria-module-content');

    mentoriaNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-content');

            // Atualiza o menu
            mentoriaNavItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');

            // Atualiza o conteúdo
            mentoriaContentAreas.forEach(area => {
                area.classList.remove('active');
                if (area.id === targetId) {
                    area.classList.add('active');
                }
            });
        });
    });
});
