document.addEventListener('DOMContentLoaded', () => {

    let leads = [];
    let nextLeadId = 0;
    let statusChart;
    let caixa = [];
    let estoque = [];
    let currentEstoqueDescricao = null;
    let chatHistory = []; // Variável para guardar o histórico do chat

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
    let db; // Variável para a instância do Firestore

    // --- INICIALIZAÇÃO DO FIREBASE E DADOS DO USUÁRIO ---
    function initializeApp() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                db = firebase.firestore();
                loadChatHistory(user.uid);
                loadSettings();
                // Carregar outros dados do Firestore se necessário...
            }
        });
    }

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
        if (!document.querySelectorAll('.kanban-cards-list').length) return;
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
                if(editModal) editModal.style.display = 'flex';
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
                if(editModal) editModal.style.display = 'none';
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
                if(editModal) editModal.style.display = 'none';
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
                    borderColor: [isLightTheme ? '#ffffff' : '#0d1117'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: legendColor, font: { size: 14 } }
                    },
                    tooltip: { enabled: true }
                }
            }
        });
    }

    if(document.getElementById('export-excel-btn')) {
        document.getElementById('export-excel-btn').addEventListener('click', () => {
            const dataToExport = leads.map(lead => ({
                "Nome": lead.nome, "Email": lead.email, "WhatsApp": lead.whatsapp,
                "Atendente": lead.atendente, "Origem": lead.origem, "Data de Contato": lead.data,
                "Qualificação": lead.qualificacao, "Status": lead.status, "Notas": lead.notas
            }));
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
            XLSX.writeFile(workbook, "leads_crm.xlsx");
        });
    }

    if(caixaForm) {
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
    }

    function updateCaixa() {
        if(!document.getElementById('total-entradas')) return;
        const totalEntradas = caixa.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.valor, 0);
        const totalSaidas = caixa.filter(m => m.tipo === 'saida').reduce((sum, m) => sum + m.valor, 0);
        const caixaAtual = totalEntradas - totalSaidas;
        document.getElementById('total-entradas').textContent = `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`;
        document.getElementById('total-saidas').textContent = `R$ ${totalSaidas.toFixed(2).replace('.', ',')}`;
        document.getElementById('caixa-atual').textContent = `R$ ${caixaAtual.toFixed(2).replace('.', ',')}`;
    }

    function renderCaixaTable() {
        const tableBody = document.querySelector('#caixa-table tbody');
        if(!tableBody) return;
        tableBody.innerHTML = '';
        caixa.forEach(mov => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${mov.data}</td> <td>${mov.descricao}</td>
                <td class="entrada">${mov.tipo === 'entrada' ? `R$ ${mov.valor.toFixed(2).replace('.', ',')}` : ''}</td>
                <td class="saida">${mov.tipo === 'saida' ? `R$ ${mov.valor.toFixed(2).replace('.', ',')}` : ''}</td>
                <td>${mov.observacoes}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    if(financeTabs) {
        financeTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTabId = e.target.getAttribute('data-tab') + '-tab-content';
                financeTabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.finance-content').forEach(c => c.style.display = 'none');
                e.target.classList.add('active');
                const targetContent = document.getElementById(targetTabId);
                if (targetContent) targetContent.style.display = 'block';
            });
        });
    }
    
    // --- LÓGICA DE ESTOQUE E CUSTOS ---
    if(estoqueForm) {
        estoqueForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const novoProduto = {
                produto: document.getElementById('estoque-produto').value,
                descricao: document.getElementById('estoque-descricao').value.toUpperCase(),
                compra: parseFloat(document.getElementById('estoque-compra').value),
                venda: parseFloat(document.getElementById('estoque-venda').value),
                custos: [], totalCustos: 0, lucro: 0
            };
            estoque.push(novoProduto);
            updateEstoque();
            renderEstoqueTable();
            estoqueForm.reset();
        });
    }

    function updateEstoque() {
        estoque.forEach(produto => {
            const totalCustos = produto.custos.reduce((sum, custo) => sum + custo.valor, 0);
            produto.totalCustos = totalCustos;
            produto.lucro = produto.venda - (produto.compra + totalCustos);
        });
    }

    function renderEstoqueTable() {
        const tableBody = document.querySelector('#estoque-table tbody');
        if(!tableBody) return;
        tableBody.innerHTML = '';
        const searchTerm = estoqueSearch ? estoqueSearch.value.toLowerCase() : '';
        const filteredEstoque = estoque.filter(p => p.produto.toLowerCase().includes(searchTerm) || p.descricao.toLowerCase().includes(searchTerm));
        
        filteredEstoque.forEach(produto => {
            const row = document.createElement('tr');
            row.setAttribute('data-descricao', produto.descricao);
            const custosHtml = produto.custos.length > 0 ? produto.custos.map(c => `<li>${c.descricao}: R$ ${c.valor.toFixed(2).replace('.', ',')}</li>`).join('') : 'Nenhum custo adicionado.';
            row.innerHTML = `
                <td>${produto.produto}</td> <td>${produto.descricao}</td>
                <td>R$ ${produto.compra.toFixed(2).replace('.', ',')}</td>
                <td>
                    <ul class="custos-list">${custosHtml}</ul>
                    <button class="custos-info-btn" data-descricao="${produto.descricao}">+ Add Custo</button>
                </td>
                <td>R$ ${produto.venda.toFixed(2).replace('.', ',')}</td>
                <td>R$ ${produto.lucro.toFixed(2).replace('.', ',')}</td>
                <td><button class="btn-delete-produto"><i class="ph-fill ph-trash"></i></button></td>
            `;
            tableBody.appendChild(row);
        });
    }

    if(estoqueSearch) estoqueSearch.addEventListener('input', renderEstoqueTable);

    document.addEventListener('click', (e) => {
        const addCustoBtn = e.target.closest('.custos-info-btn');
        const deleteProdutoBtn = e.target.closest('.btn-delete-produto');
        if (addCustoBtn) {
            currentEstoqueDescricao = addCustoBtn.getAttribute('data-descricao');
            if(addCustoModal) addCustoModal.style.display = 'flex';
        }
        if (deleteProdutoBtn) {
            const row = deleteProdutoBtn.closest('tr');
            const descricao = row.getAttribute('data-descricao');
            if (confirm(`Tem certeza que deseja excluir o produto com a descrição ${descricao}?`)) {
                const produtoIndex = estoque.findIndex(p => p.descricao === descricao);
                if (produtoIndex > -1) {
                    estoque.splice(produtoIndex, 1);
                    updateEstoque();
                    renderEstoqueTable();
                }
            }
        }
    });

    if(closeCustoModalBtn) {
        closeCustoModalBtn.addEventListener('click', () => {
            if(addCustoModal) addCustoModal.style.display = 'none';
            if(addCustoForm) addCustoForm.reset();
        });
    }

    if(addCustoForm) {
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
                if(addCustoModal) addCustoModal.style.display = 'none';
                addCustoForm.reset();
            }
        });
    }
    
    function parseEstoqueData(json) {
        const estoqueMap = new Map();
        if (!json || json.length === 0) {
            alert("A planilha parece estar vazia ou em um formato não reconhecido.");
            return [];
        }
        json.forEach(row => {
            const descricao = row['Descrição'] || row['Placa'];
            if (!descricao) return;
            if (!estoqueMap.has(descricao)) {
                const compra = parseFloat(String(row['Valor de Compra'] || 0).replace(',', '.'));
                const venda = parseFloat(String(row['Valor de Venda'] || 0).replace(',', '.'));
                estoqueMap.set(descricao, {
                    produto: row['Produto'] || row['Veículo'],
                    descricao: descricao,
                    compra: !isNaN(compra) ? compra : 0,
                    venda: !isNaN(venda) ? venda : 0,
                    custos: []
                });
            }
            const custoDescricao = row['Custo - Descrição'];
            const custoValor = parseFloat(String(row['Custo - Valor'] || 0).replace(',', '.'));
            if (custoDescricao && !isNaN(custoValor) && custoValor > 0) {
                estoqueMap.get(descricao).custos.push({ descricao: custoDescricao, valor: custoValor });
            }
        });
        return Array.from(estoqueMap.values());
    }

    if(importEstoqueFile) {
        importEstoqueFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = event.target.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(sheet);
                    const newEstoque = parseEstoqueData(json);
                    if (newEstoque.length > 0) {
                        estoque = newEstoque;
                        updateEstoque();
                        renderEstoqueTable();
                        alert(`Dados importados com sucesso! ${newEstoque.length} produtos carregados.`);
                    }
                } catch (error) {
                    console.error("Erro ao importar planilha:", error);
                    alert("Ocorreu um erro ao ler o arquivo. Verifique se o formato está correto.");
                }
                importEstoqueFile.value = '';
            };
            reader.readAsArrayBuffer(file);
        });
    }

    if(exportEstoqueBtn) {
        exportEstoqueBtn.addEventListener('click', () => {
            const dataToExport = [];
            estoque.forEach(item => {
                const baseRow = {
                    "Produto": item.produto, "Descrição": item.descricao, "Valor de Compra": item.compra,
                    "Valor de Venda": item.venda, "Total de Custos": item.totalCustos, "Lucro": item.lucro
                };
                if (item.custos.length > 0) {
                    item.custos.forEach(custo => {
                        dataToExport.push({ ...baseRow, "Custo - Descrição": custo.descricao, "Custo - Valor": custo.valor });
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
    }
    
    // --- LÓGICA DO CHATBOT ---
    function addMessageToChat(message, type) {
        if (!chatbotMessages) return;
        const messageElement = document.createElement('div');
        messageElement.className = `${type}-message`; // Correção: user-message ou bot-message
        const paragraph = document.createElement('p');
        paragraph.innerText = message;
        messageElement.appendChild(paragraph);
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    async function getAiResponse(prompt, history) {
        const apiUrl = '/api/gemini';
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt, history: history }) // Envia o histórico
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erro da função Vercel:", errorData);
                return `Ocorreu um erro no servidor (Status: ${response.status}).`;
            }
            const data = await response.json();
            return data.text;
        } catch (error) {
            console.error("Erro de conexão com a função Vercel:", error);
            return "Não consegui me conectar ao servidor.";
        }
    }

    async function handleBotLogic(userInput) {
        const user = firebase.auth().currentUser;
        if (!user) return;
        
        const sendButton = chatbotForm.querySelector('button');
        sendButton.disabled = true;

        // Adiciona a mensagem do usuário ao histórico local
        chatHistory.push({ role: "user", parts: [{ text: userInput }] });

        const thinkingMessage = addMessageToChat("Pensando...", 'bot-message bot-thinking');
        const prompt = `Você é um assistente de marketing digital e vendas. Responda de forma direta e prestativa. O usuário pediu: "${userInput}"`;
        
        // Passa o histórico para a API
        const aiResponse = await getAiResponse(prompt, chatHistory);
        
        const thinkingElement = chatbotMessages.querySelector('.bot-thinking');
        if (thinkingElement) {
            thinkingElement.parentElement.remove();
        }
        
        if (aiResponse) {
            addMessageToChat(aiResponse, 'bot-message');
            // Adiciona a resposta do bot ao histórico local
            chatHistory.push({ role: "model", parts: [{ text: aiResponse }] });
            saveChatHistory(user.uid, chatHistory); // Salva no Firestore
        }

        sendButton.disabled = false;
        chatbotInput.focus();
    }

    if(chatbotForm) {
        chatbotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userInput = chatbotInput.value;
            if (!userInput.trim()) return;
            addMessageToChat(userInput, 'user');
            chatbotInput.value = '';
            handleBotLogic(userInput);
        });
    }

    // --- FUNÇÕES DE PERSISTÊNCIA (FIRESTORE) PARA O CHATBOT ---
    async function saveChatHistory(userId, history) {
        if (!db) return;
        try {
            await db.collection('chatHistories').doc(userId).set({ history: history });
        } catch (error) {
            console.error("Erro ao salvar o histórico do chat:", error);
        }
    }

    async function loadChatHistory(userId) {
        if (!db || !chatbotMessages) return;
        try {
            const doc = await db.collection('chatHistories').doc(userId).get();
            if (doc.exists) {
                chatHistory = doc.data().history || [];
                chatbotMessages.innerHTML = ''; // Limpa o chat antes de carregar
                chatHistory.forEach(message => {
                    addMessageToChat(message.parts[0].text, message.role === 'user' ? 'user' : 'bot');
                });
            } else {
                 // Adiciona a mensagem inicial apenas se não houver histórico
                addMessageToChat("Olá! Eu sou seu assistente de vendas. Como posso ajudar?", 'bot-message');
            }
        } catch (error) {
            console.error("Erro ao carregar o histórico do chat:", error);
        }
    }


    // --- INICIALIZAÇÃO GERAL ---
    initializeApp();
    updateDashboard();
});
