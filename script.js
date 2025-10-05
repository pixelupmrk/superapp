document.addEventListener('DOMContentLoaded', () => {
    const db = firebase.firestore();
    let userId = null;

    let leads = [];
    let caixa = [];
    let estoque = [];
    
    let statusChart;
    let draggedItem = null;

    // --- Seletores de Elementos ---
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const contentAreas = document.querySelectorAll('.main-content .content-area');
    const pageTitle = document.getElementById('page-title');
    const kanbanBoard = document.getElementById('kanban-board');
    const leadForm = document.getElementById('lead-form');
    const editLeadModal = document.getElementById('edit-lead-modal');
    const editLeadForm = document.getElementById('edit-lead-form');
    const exportLeadsBtn = document.getElementById('export-excel-btn');
    const caixaForm = document.getElementById('caixa-form');
    const financeTabs = document.querySelectorAll('.finance-tab');
    const financeContentAreas = document.querySelectorAll('.finance-content');
    const estoqueForm = document.getElementById('estoque-form');
    const estoqueSearch = document.getElementById('estoque-search');
    const addCustoModal = document.getElementById('add-custo-modal');
    const addCustoForm = document.getElementById('add-custo-form');
    const importEstoqueFile = document.getElementById('import-estoque-file');
    const exportEstoqueBtn = document.getElementById('export-estoque-btn');
    const editProdutoModal = document.getElementById('edit-produto-modal');
    const editProdutoForm = document.getElementById('edit-produto-form');
    const acceleratorNavItems = document.querySelectorAll('.sales-accelerator-menu-item');
    const acceleratorContentAreas = document.querySelectorAll('.sales-accelerator-module-content');
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const saveSettingsButton = document.getElementById('save-settings-btn');
    const userNameInput = document.getElementById('setting-user-name');
    const companyNameInput = document.getElementById('setting-company-name');
    const userNameDisplay = document.querySelector('.user-profile span');
    const chatbotForm = document.getElementById('chatbot-form');
    const chatbotInput = document.getElementById('chatbot-input');

    // --- PONTO DE ENTRADA PRINCIPAL ---
    firebase.auth().onAuthStateChanged(async user => {
        if (user) {
            userId = user.uid;
            await loadSettings(); // Espera as configurações serem carregadas
            loadAllData();
        }
    });

    // --- FUNÇÕES DE CARREGAMENTO DE DADOS ---
    async function loadAllData() {
        if (!userId) return;
        try {
            document.body.style.cursor = 'wait';
            await Promise.all([loadLeads(), loadCaixa(), loadEstoque()]);
            renderAll();
        } catch (error) {
            console.error("Erro fatal ao carregar dados:", error);
        } finally {
            document.body.style.cursor = 'default';
        }
    }

    async function loadLeads() {
        const snapshot = await db.collection('users').doc(userId).collection('leads').get();
        leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    async function loadCaixa() {
        const snapshot = await db.collection('users').doc(userId).collection('caixa').get();
        caixa = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    async function loadEstoque() {
        const snapshot = await db.collection('users').doc(userId).collection('estoque').get();
        estoque = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    function renderAll() {
        renderKanbanCards();
        renderLeadsTable();
        updateDashboard();
        renderCaixaTable();
        updateCaixa();
        renderEstoqueTable();
    }

    // --- LÓGICA DE NAVEGAÇÃO E UI ---
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-target');
            if(!targetId) return;
            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');
            contentAreas.forEach(area => area.classList.remove('active'));
            const targetArea = document.getElementById(targetId);
            if (targetArea) {
                targetArea.classList.add('active');
                pageTitle.textContent = e.currentTarget.querySelector('span').textContent;
            }
        });
    });

    financeTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-tab') + '-tab-content';
            financeTabs.forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            financeContentAreas.forEach(area => {
                area.classList.remove('active');
                if (area.id === targetId) {
                    area.classList.add('active');
                }
            });
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
    
    // --- LÓGICA DE CONFIGURAÇÕES (TEMA, NOME) ---
    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            if(themeToggleButton) themeToggleButton.textContent = 'Mudar para Tema Escuro';
        } else {
            document.body.classList.remove('light-theme');
            if(themeToggleButton) themeToggleButton.textContent = 'Mudar para Tema Claro';
        }
    }

    // FUNÇÃO DE CARREGAR CONFIGURAÇÕES ATUALIZADA
    async function loadSettings() {
        // Carrega o tema do localStorage (isso pode continuar sendo local)
        const savedTheme = localStorage.getItem(`appTheme_${userId}`) || 'dark';
        applyTheme(savedTheme);

        if (!userId) return;

        try {
            // Tenta carregar as configurações do Firestore
            const userDocRef = db.collection('users').doc(userId);
            const doc = await userDocRef.get();

            let userName = firebase.auth().currentUser?.email.split('@')[0] || 'Usuário';
            let companyName = '';

            if (doc.exists && doc.data().settings) {
                const settings = doc.data().settings;
                userName = settings.userName || userName;
                companyName = settings.companyName || '';
            }
            
            // Atualiza a UI
            userNameDisplay.textContent = `Olá, ${userName}`;
            if (userNameInput) userNameInput.value = userName === 'Usuário' ? '' : userName;
            if (companyNameInput) companyNameInput.value = companyName;

        } catch (error) {
            console.error("Erro ao carregar configurações do Firestore:", error);
            // Se falhar, usa um fallback
            const defaultUserName = firebase.auth().currentUser?.email.split('@')[0] || 'Usuário';
            userNameDisplay.textContent = `Olá, ${defaultUserName}`;
        }
    }
    
    if(themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const isLight = document.body.classList.contains('light-theme');
            const newTheme = isLight ? 'dark' : 'light';
            // Salva o tema associado ao userId para não misturar entre usuários
            localStorage.setItem(`appTheme_${userId}`, newTheme);
            applyTheme(newTheme);
        });
    }

    // BOTÃO DE SALVAR CONFIGURAÇÕES ATUALIZADO
    if(saveSettingsButton) {
        saveSettingsButton.addEventListener('click', async () => {
            if (!userId) {
                alert('Erro: Usuário não autenticado.');
                return;
            }

            const newUserName = userNameInput.value.trim() || 'Usuário';
            const newCompanyName = companyNameInput.value.trim();
            
            const settings = {
                userName: newUserName,
                companyName: newCompanyName
            };

            try {
                // Salva (ou atualiza) as configurações no documento do usuário no Firestore
                const userDocRef = db.collection('users').doc(userId);
                await userDocRef.set({ settings: settings }, { merge: true });

                // Atualiza a UI
                userNameDisplay.textContent = `Olá, ${newUserName}`;
                alert('Configurações salvas com sucesso!');

            } catch (error) {
                console.error("Erro ao salvar configurações no Firestore:", error);
                alert('Falha ao salvar as configurações. Tente novamente.');
            }
        });
    }
    
    // --- LÓGICA DE PESQUISA DO ESTOQUE ---
    if (estoqueSearch) {
        estoqueSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#estoque-table tbody tr');
            rows.forEach(row => {
                const produtoText = row.children[0].textContent.toLowerCase();
                const descricaoText = row.children[1].textContent.toLowerCase();
                if (produtoText.includes(searchTerm) || descricaoText.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // --- LÓGICA DE DADOS (CRIAR, ATUALIZAR, EXCLUIR) ---
    if(leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newLead = {
                nome: document.getElementById('lead-name').value, email: document.getElementById('lead-email').value, whatsapp: document.getElementById('lead-whatsapp').value, atendente: document.getElementById('lead-attendant').value, origem: document.getElementById('lead-origin').value, data: document.getElementById('lead-date').value, qualificacao: document.getElementById('lead-qualification').value, notas: document.getElementById('lead-notes').value, status: 'novo'
            };
            try {
                await db.collection('users').doc(userId).collection('leads').add(newLead);
                leadForm.reset();
                await loadLeads(); renderAll();
            } catch (error) { console.error("Erro ao adicionar lead:", error); alert("Falha ao salvar o lead: " + error.message); }
        });
    }

    if(caixaForm) {
        caixaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newMovimentacao = {
                data: document.getElementById('caixa-data').value, descricao: document.getElementById('caixa-descricao').value, valor: parseFloat(document.getElementById('caixa-valor').value), tipo: document.getElementById('caixa-tipo').value, observacoes: document.getElementById('caixa-observacoes').value,
            };
            try {
                await db.collection('users').doc(userId).collection('caixa').add(newMovimentacao);
                caixaForm.reset();
                await loadCaixa(); renderAll();
            } catch (error) { console.error("Erro ao adicionar movimentação de caixa:", error); alert("Falha ao salvar no caixa: " + error.message); }
        });
    }
    
    if(estoqueForm) {
        estoqueForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newProduto = {
                produto: document.getElementById('estoque-produto').value, descricao: document.getElementById('estoque-descricao').value, compra: parseFloat(document.getElementById('estoque-compra').value), venda: parseFloat(document.getElementById('estoque-venda').value), custos: []
            };
            try {
                await db.collection('users').doc(userId).collection('estoque').add(newProduto);
                estoqueForm.reset();
                await loadEstoque(); renderAll();
            } catch (error) { console.error("Erro ao adicionar produto:", error); alert("Falha ao salvar produto: " + error.message); }
        });
    }
    
    if(importEstoqueFile) {
        importEstoqueFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file || !userId) return;
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);
                    const batch = db.batch();
                    json.forEach(row => {
                        const newProduto = {
                            produto: row['Produto'] || 'Sem nome', descricao: row['Descrição'] || '', compra: parseFloat(row['Valor de Compra']) || 0, venda: parseFloat(row['Valor de Venda']) || 0, custos: []
                        };
                        const docRef = db.collection('users').doc(userId).collection('estoque').doc();
                        batch.set(docRef, newProduto);
                    });
                    await batch.commit();
                    await loadEstoque(); renderAll();
                    alert(`${json.length} produtos importados com sucesso!`);
                } catch (error) { console.error("Erro ao importar arquivo:", error); alert("Ocorreu um erro ao importar o arquivo: " + error.message); } 
                finally { e.target.value = ''; }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    if (exportLeadsBtn) {
        exportLeadsBtn.addEventListener('click', () => {
            if (leads.length === 0) { alert("Não há leads para exportar."); return; }
            const dataToExport = leads.map(lead => ({
                'Nome': lead.nome, 'Email': lead.email, 'WhatsApp': lead.whatsapp, 'Status': lead.status, 'Qualificação': lead.qualificacao, 'Origem': lead.origem, 'Atendente': lead.atendente, 'Data': lead.data, 'Notas': lead.notas
            }));
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
            XLSX.writeFile(workbook, "lista_de_leads.xlsx");
        });
    }

    if(exportEstoqueBtn) {
        exportEstoqueBtn.addEventListener('click', () => {
            if (estoque.length === 0) { alert("Não há produtos no estoque para exportar."); return; }
            const dataToExport = estoque.map(item => {
                const totalCustos = (item.custos || []).reduce((sum, custo) => sum + custo.valor, 0);
                const lucro = item.venda - (item.compra + totalCustos);
                return { 'Produto': item.produto, 'Descrição': item.descricao, 'Valor de Compra': item.compra, 'Custos Adicionais': totalCustos, 'Valor de Venda': item.venda, 'Lucro': lucro };
            });
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque");
            XLSX.writeFile(workbook, "estoque_produtos.xlsx");
        });
    }

    if (kanbanBoard) {
        kanbanBoard.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('kanban-card')) {
                draggedItem = e.target;
                setTimeout(() => { if(draggedItem) draggedItem.style.opacity = '0.5'; }, 0);
            }
        });
        kanbanBoard.addEventListener('dragend', (e) => {
            if (draggedItem) {
                draggedItem.style.opacity = '1';
                draggedItem = null;
            }
        });
        kanbanBoard.addEventListener('dragover', (e) => e.preventDefault() );
        kanbanBoard.addEventListener('drop', async (e) => {
            e.preventDefault();
            const column = e.target.closest('.kanban-column');
            if (column && draggedItem) {
                const list = column.querySelector('.kanban-cards-list');
                list.appendChild(draggedItem);
                const docId = draggedItem.getAttribute('data-id');
                const newStatus = column.getAttribute('data-status');
                try {
                    await db.collection('users').doc(userId).collection('leads').doc(docId).update({ status: newStatus });
                    await loadLeads();
                    renderAll();
                } catch (error) {
                    console.error("Erro ao atualizar status do lead:", error);
                }
            }
        });
    }

    document.addEventListener('click', async (e) => {
        if (e.target.matches('[data-close]')) { e.target.closest('.modal-overlay').classList.remove('active'); }
        const editBtn = e.target.closest('.btn-edit-table');
        const deleteBtn = e.target.closest('.btn-delete-table');
        const addCustoBtn = e.target.closest('.btn-custo-table');

        if (editBtn) {
            const row = editBtn.closest('tr');
            const docId = row.getAttribute('data-id');
            if (editBtn.closest('#leads-table')) {
                const lead = leads.find(l => l.id === docId);
                if (lead) {
                    editLeadForm.querySelector('#edit-lead-id').value = lead.id;
                    editLeadForm.querySelector('#edit-lead-name').value = lead.nome || '';
                    editLeadForm.querySelector('#edit-lead-email').value = lead.email || '';
                    editLeadForm.querySelector('#edit-lead-whatsapp').value = lead.whatsapp || '';
                    editLeadForm.querySelector('#edit-lead-status').value = lead.status || 'novo';
                    editLeadForm.querySelector('#edit-lead-attendant').value = lead.atendente || '';
                    editLeadForm.querySelector('#edit-lead-origem').value = lead.origem || '';
                    editLeadForm.querySelector('#edit-lead-date').value = lead.data || '';
                    editLeadForm.querySelector('#edit-lead-qualification').value = lead.qualificacao || '';
                    editLeadForm.querySelector('#edit-lead-notes').value = lead.notas || '';
                    editLeadModal.classList.add('active');
                }
            } else if (editBtn.closest('#estoque-table')) {
                const produto = estoque.find(p => p.id === docId);
                if (produto) {
                    editProdutoForm.querySelector('#edit-produto-id').value = produto.id;
                    editProdutoForm.querySelector('#edit-produto-nome').value = produto.produto;
                    editProdutoForm.querySelector('#edit-produto-descricao').value = produto.descricao;
                    editProdutoForm.querySelector('#edit-produto-compra').value = produto.compra;
                    editProdutoForm.querySelector('#edit-produto-venda').value = produto.venda;
                    editProdutoModal.classList.add('active');
                }
            }
        }
        
        if (deleteBtn) {
            const row = deleteBtn.closest('tr');
            const docId = row.getAttribute('data-id');
            if (deleteBtn.closest('#leads-table')) {
                if (confirm('Tem certeza que deseja excluir este lead?')) {
                    await db.collection('users').doc(userId).collection('leads').doc(docId).delete();
                    await loadLeads(); renderAll();
                }
            } else if (deleteBtn.closest('#estoque-table')) {
                if (confirm('Tem certeza que deseja excluir este produto?')) {
                    await db.collection('users').doc(userId).collection('estoque').doc(docId).delete();
                    await loadEstoque(); renderAll();
                }
            }
        }

        if (addCustoBtn) {
            const row = addCustoBtn.closest('tr');
            const docId = row.getAttribute('data-id');
            addCustoForm.querySelector('#add-custo-produto-id').value = docId;
            addCustoModal.classList.add('active');
        }
    });

    if(editLeadForm) {
        editLeadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const leadId = editLeadForm.querySelector('#edit-lead-id').value;
            const updatedLead = {
                nome: editLeadForm.querySelector('#edit-lead-name').value, email: editLeadForm.querySelector('#edit-lead-email').value, whatsapp: editLeadForm.querySelector('#edit-lead-whatsapp').value, status: editLeadForm.querySelector('#edit-lead-status').value, atendente: editLeadForm.querySelector('#edit-lead-attendant').value, origem: editLeadForm.querySelector('#edit-lead-origem').value, data: editLeadForm.querySelector('#edit-lead-date').value, qualificacao: editLeadForm.querySelector('#edit-lead-qualification').value, notas: editLeadForm.querySelector('#edit-lead-notes').value,
            };
            await db.collection('users').doc(userId).collection('leads').doc(leadId).update(updatedLead);
            editLeadModal.classList.remove('active');
            await loadLeads(); renderAll();
        });
    }
    
    if (editProdutoForm) {
        editProdutoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const produtoId = editProdutoForm.querySelector('#edit-produto-id').value;
            const updatedProduto = {
                produto: editProdutoForm.querySelector('#edit-produto-nome').value, descricao: editProdutoForm.querySelector('#edit-produto-descricao').value, compra: parseFloat(editProdutoForm.querySelector('#edit-produto-compra').value), venda: parseFloat(editProdutoForm.querySelector('#edit-produto-venda').value),
            };
            await db.collection('users').doc(userId).collection('estoque').doc(produtoId).update(updatedProduto);
            editProdutoModal.classList.remove('active');
            await loadEstoque(); renderAll();
        });
    }

    if(addCustoForm) {
        addCustoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const produtoId = addCustoForm.querySelector('#add-custo-produto-id').value;
            const produtoRef = db.collection('users').doc(userId).collection('estoque').doc(produtoId);
            const novoCusto = {
                descricao: addCustoForm.querySelector('#custo-descricao-custo').value, valor: parseFloat(addCustoForm.querySelector('#custo-valor').value)
            };
            await produtoRef.update({ custos: firebase.firestore.FieldValue.arrayUnion(novoCusto) });
            addCustoModal.classList.remove('active');
            addCustoForm.reset();
            await loadEstoque(); renderAll();
        });
    }
    
    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    function renderLeadsTable() { const tableBody = document.querySelector('#leads-table tbody'); if (!tableBody) return; tableBody.innerHTML = ''; leads.forEach(lead => tableBody.appendChild(createLeadTableRow(lead))); }
    function createLeadTableRow(lead) { const row = document.createElement('tr'); row.setAttribute('data-id', lead.id); row.innerHTML = `<td>${lead.nome||''}</td><td><a href="https://wa.me/${lead.whatsapp||''}" target="_blank">${lead.whatsapp||''}</a></td><td>${lead.origem||''}</td><td>${lead.qualificacao||''}</td><td>${lead.status||''}</td><td><div class="table-actions"><button class="btn-edit-table" title="Editar Lead"><i class="ph-fill ph-note-pencil"></i></button><button class="btn-delete-table" title="Excluir Lead"><i class="ph-fill ph-trash"></i></button></div></td>`; return row; }
    function renderKanbanCards() { const lists = document.querySelectorAll('.kanban-cards-list'); if(!lists.length) return; lists.forEach(list => list.innerHTML = ''); leads.forEach(lead => { const targetColumn = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`); if (targetColumn) { targetColumn.appendChild(createKanbanCard(lead)); } }); }
    function createKanbanCard(lead) { const newCard = document.createElement('div'); newCard.classList.add('kanban-card'); newCard.draggable = true; newCard.setAttribute('data-id', lead.id); newCard.innerHTML = `<strong>${lead.nome||''}</strong><br><small>WhatsApp: <a href="https://wa.me/${lead.whatsapp||''}" target="_blank">${lead.whatsapp||''}</a></small><br><small>Origem: ${lead.origem||''}</small><br><small>Qualificação: ${lead.qualificacao||''}</small>`; return newCard; }
    function updateCaixa() { const totalEntradas = caixa.filter(item => item.tipo === 'entrada').reduce((sum, item) => sum + item.valor, 0); const totalSaidas = caixa.filter(item => item.tipo === 'saida').reduce((sum, item) => sum + item.valor, 0); const saldoAtual = totalEntradas - totalSaidas; document.getElementById('total-entradas').textContent = formatCurrency(totalEntradas); document.getElementById('total-saidas').textContent = formatCurrency(totalSaidas); document.getElementById('caixa-atual').textContent = formatCurrency(saldoAtual); }
    function renderCaixaTable() { const tableBody = document.querySelector('#caixa-table tbody'); if(!tableBody) return; tableBody.innerHTML = ''; caixa.forEach(item => { const row = document.createElement('tr'); row.classList.add(item.tipo === 'entrada' ? 'entrada-row' : 'saida-row'); row.innerHTML = `<td>${new Date(item.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td><td>${item.descricao}</td><td>${item.tipo === 'entrada' ? formatCurrency(item.valor) : '-'}</td><td>${item.tipo === 'saida' ? formatCurrency(item.valor) : '-'}</td><td>${item.observacoes}</td>`; tableBody.appendChild(row); }); }
    function renderEstoqueTable() { const tableBody = document.querySelector('#estoque-table tbody'); if(!tableBody) return; tableBody.innerHTML = ''; estoque.forEach(item => { const totalCustos = (item.custos || []).reduce((sum, custo) => sum + custo.valor, 0); const lucro = item.venda - (item.compra + totalCustos); const row = document.createElement('tr'); row.setAttribute('data-id', item.id); row.innerHTML = `<td>${item.produto}</td><td>${item.descricao}</td><td>${formatCurrency(item.compra)}</td><td>${formatCurrency(totalCustos)}</td><td>${formatCurrency(item.venda)}</td><td>${formatCurrency(lucro)}</td><td><div class="table-actions"><button class="btn-custo-table" title="Adicionar Custo"><i class="ph-fill ph-currency-dollar-simple"></i></button><button class="btn-edit-table" title="Editar Produto"><i class="ph-fill ph-note-pencil"></i></button><button class="btn-delete-table" title="Excluir Produto"><i class="ph-fill ph-trash"></i></button></div></td>`; tableBody.appendChild(row); }); }
    function updateDashboard() { if(!document.getElementById('total-leads')) return; const totalLeads = leads.length; const leadsNovo = leads.filter(l => l.status === 'novo').length; const leadsProgresso = leads.filter(l => l.status === 'progresso').length; const leadsFechado = leads.filter(l => l.status === 'fechado').length; document.getElementById('total-leads').textContent = totalLeads; document.getElementById('leads-novo').textContent = leadsNovo; document.getElementById('leads-progresso').textContent = leadsProgresso; document.getElementById('leads-fechado').textContent = leadsFechado; updateStatusChart(leadsNovo, leadsProgresso, leadsFechado); }
    function updateStatusChart(novo, progresso, fechado) { const ctx = document.getElementById('statusChart'); if (!ctx) return; if (statusChart) { statusChart.destroy(); } statusChart = new Chart(ctx.getContext('2d'), { type: 'doughnut', data: { labels: ['Novo', 'Em Progresso', 'Fechado'], datasets: [{ data: [novo, progresso, fechado], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'] }] } }); }
    function formatCurrency(value) { return (typeof value === 'number' ? value : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
    
    // --- LÓGICA DO CHATBOT ---
    if(chatbotForm) {
        chatbotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userMessage = chatbotInput.value.trim();
            if (!userMessage) return;

            addMessageToChat('user', userMessage);
            chatbotInput.value = '';
            addMessageToChat('bot', 'Digitando...', true);

            try {
                const response = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: userMessage })
                });
                document.querySelector('.bot-thinking')?.remove();
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Falha na comunicação com a API.');
                }
                const data = await response.json();
                addMessageToChat('bot', data.text);
            } catch (error) {
                console.error("Erro no Chatbot:", error);
                document.querySelector('.bot-thinking')?.remove();
                addMessageToChat('bot', `Desculpe, ocorreu um erro: ${error.message}`);
            }
        });
    }

    function addMessageToChat(sender, message, isThinking = false) {
        const chatbotMessages = document.getElementById('chatbot-messages');
        if(!chatbotMessages) return;
        const messageElement = document.createElement('div');
        messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        if (isThinking) {
            messageElement.classList.add('bot-thinking');
            messageElement.textContent = message;
        } else {
            messageElement.innerHTML = `<p>${message}</p>`;
        }
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
});
