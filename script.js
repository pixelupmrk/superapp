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
            themeToggleButton.textContent = 'Mudar para Tema Escuro';
        } else {
            document.body.classList.remove('light-theme');
            themeToggleButton.textContent = 'Mudar para Tema Claro';
        }
        if (document.getElementById('dashboard-section').style.display === 'block') {
            updateDashboard();
        }
    }

    function loadSettings() {
        const savedTheme = localStorage.getItem('appTheme') || 'dark';
        const savedUserName = localStorage.getItem('userName') || 'Usuário';
        const savedCompanyName = localStorage.getItem('companyName') || '';

        applyTheme(savedTheme);
        
        userNameInput.value = savedUserName === 'Usuário' ? '' : savedUserName;
        userNameDisplay.textContent = `Olá, ${savedUserName}`;
        companyNameInput.value = savedCompanyName;
    }

    saveSettingsButton.addEventListener('click', () => {
        const newUserName = userNameInput.value.trim() || 'Usuário';
        const newCompanyName = companyNameInput.value.trim();

        localStorage.setItem('userName', newUserName);
        localStorage.setItem('companyName', newCompanyName);

        userNameDisplay.textContent = `Olá, ${newUserName}`;
        alert('Configurações salvas com sucesso!');
    });
    
    themeToggleButton.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-theme');
        const newTheme = isLight ? 'dark' : 'light';
        localStorage.setItem('appTheme', newTheme);
        applyTheme(newTheme);
    });

    // --- LÓGICA DE NAVEGAÇÃO ---
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
            const targetArea = document.getElementById(targetId);
            if(targetArea) {
                 targetArea.style.display = 'block';
            }
            pageTitle.textContent = targetText;
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
                <td>${mov.data}</td> <td>${mov.descricao}</td>
                <td class="entrada">${mov.tipo === 'entrada' ? `R$ ${mov.valor.toFixed(2).replace('.', ',')}` : ''}</td>
                <td class="saida">${mov.tipo === 'saida' ? `R$ ${mov.valor.toFixed(2).replace('.', ',')}` : ''}</td>
                <td>${mov.observacoes}</td>
            `;
            tableBody.appendChild(row);
        });
    }

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

    estoqueSearch.addEventListener('input', renderEstoqueTable);

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
                if (produtoIndex > -1) {
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

    // --- LÓGICA DO CHATBOT AI (COM IA GENERATIVA) ---
    function addMessageToChat(message, type) {
        const messageElement = document.createElement('div');
        messageElement.className = type; // e.g., "user-message" or "bot-message"
        
        const paragraph = document.createElement('p');
        paragraph.innerText = message;
        
        messageElement.appendChild(paragraph);
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    async function getGeminiResponse(prompt) {
        // A CHAVE DE API ESTÁ DIRETAMENTE NO CÓDIGO CONFORME SOLICITADO
        const apiKey = "AIzaSyDSLlNgmXKWZnrZSw5qP2sbOYhMnsUZcGE";
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erro da API Gemini:", errorData);
                return `Ocorreu um erro ao contatar a IA (Status: ${response.status}). Verifique se sua chave de API é válida e está habilitada.`;
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts.length > 0) {
                 return data.candidates[0].content.parts[0].text;
            } else {
                // Resposta de segurança ou conteúdo bloqueado
                console.warn("Resposta da IA bloqueada ou vazia:", data);
                return "Não consigo responder a essa pergunta. Tente reformular ou fazer outra pergunta.";
            }
           
        } catch (error) {
            console.error("Erro de conexão com a API Gemini:", error);
            return "Não consegui me conectar ao servidor da IA. Verifique sua conexão com a internet.";
        }
    }

    async function generateBotResponse(userInput) {
        const input = userInput.toLowerCase().trim();
        const sendButton = chatbotForm.querySelector('button');

        sendButton.disabled = true;
        addMessageToChat("Pensando...", 'bot-message bot-thinking');
        
        const prompt = `Você é um assistente de marketing digital e vendas para um pequeno empresário. Seja direto, prestativo e use uma linguagem informal. O usuário pediu: "${userInput}"`;
        
        const aiResponse = await getGeminiResponse(prompt);

        const thinkingMessage = chatbotMessages.querySelector('.bot-thinking');
        if (thinkingMessage) {
            thinkingMessage.remove();
        }

        sendButton.disabled = false;
        return aiResponse;
    }

    chatbotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userInput = chatbotInput.value;
        if (!userInput) return;

        addMessageToChat(userInput, 'user-message');
        chatbotInput.value = '';
        
        // Respostas rápidas primeiro
        const lowerInput = userInput.toLowerCase().trim();
        if (lowerInput.includes('olá') || lowerInput.includes('oi')) {
            addMessageToChat('Olá! Pronto para acelerar suas vendas hoje? Como posso te ajudar?', 'bot-message');
            return;
        }
        if (lowerInput.includes('crm') || lowerInput.includes('lead')) {
            addMessageToChat('O CRM é essencial para não perder nenhuma venda! Você pode adicionar um novo lead na seção "CRM / Kanban" e ver todos na "Lista de Leads".', 'bot-message');
            return;
        }
        if (lowerInput.includes('obrigado')) {
             addMessageToChat('De nada! Se precisar de mais alguma coisa, é só chamar.', 'bot-message');
             return;
        }

        // Se não for uma resposta rápida, chama a IA
        const botResponse = await generateBotResponse(userInput);
        
        if (botResponse) {
             addMessageToChat(botResponse, 'bot-message');
        }
    });

    // --- INICIALIZAÇÃO ---
    loadSettings();
    updateDashboard();
});
