document.addEventListener('DOMContentLoaded', () => {
    const db = firebase.firestore();
    let userId = null;

    let leads = [];
    let caixa = [];
    let estoque = [];
    
    let statusChart;

    // --- Seletores de Elementos ---
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const contentAreas = document.querySelectorAll('.main-content .content-area');
    const pageTitle = document.getElementById('page-title');
    const leadForm = document.getElementById('lead-form');
    const editLeadModal = document.getElementById('edit-lead-modal');
    const editLeadForm = document.getElementById('edit-lead-form');
    const exportLeadsBtn = document.getElementById('export-excel-btn');
    const caixaForm = document.getElementById('caixa-form');
    const financeTabs = document.querySelectorAll('.finance-tab');
    const financeContentAreas = document.querySelectorAll('.finance-content');
    const estoqueForm = document.getElementById('estoque-form');
    const addCustoModal = document.getElementById('add-custo-modal');
    const addCustoForm = document.getElementById('add-custo-form');
    const importEstoqueFile = document.getElementById('import-estoque-file');
    const exportEstoqueBtn = document.getElementById('export-estoque-btn');
    const editProdutoModal = document.getElementById('edit-produto-modal');
    const editProdutoForm = document.getElementById('edit-produto-form');
    const userNameDisplay = document.querySelector('.user-profile span');
    
    // --- PONTO DE ENTRADA PRINCIPAL ---
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            userId = user.uid;
            userNameDisplay.textContent = `Olá, ${user.displayName || user.email}`;
            loadAllData();
        }
    });

    // --- FUNÇÕES DE CARREGAMENTO DE DADOS ---
    async function loadAllData() {
        if (!userId) return;
        try {
            await Promise.all([loadLeads(), loadCaixa(), loadEstoque()]);
            renderAll();
        } catch (error) {
            console.error("Erro fatal ao carregar dados:", error);
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

    // --- FUNÇÃO GERAL PARA RENDERIZAR TUDO ---
    function renderAll() {
        renderKanbanCards();
        renderLeadsTable();
        updateDashboard();
        renderCaixaTable();
        updateCaixa();
        renderEstoqueTable();
    }

    // --- LÓGICA DE NAVEGAÇÃO SIMPLIFICADA ---
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-target');
            if(!targetId) return;

            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');

            contentAreas.forEach(area => {
                area.classList.remove('active');
            });
            
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

    // --- LÓGICA DE ADICIONAR DADOS ---
    if(leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newLead = {
                nome: document.getElementById('lead-name').value,
                email: document.getElementById('lead-email').value,
                whatsapp: document.getElementById('lead-whatsapp').value,
                status: 'novo'
                // ... outros campos ...
            };
            try {
                await db.collection('users').doc(userId).collection('leads').add(newLead);
                leadForm.reset();
                await loadLeads();
                renderKanbanCards();
                renderLeadsTable();
                updateDashboard();
            } catch (error) {
                console.error("Erro ao adicionar lead:", error);
                alert("Falha ao salvar o lead: " + error.message);
            }
        });
    }

    if(caixaForm) {
        caixaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newMovimentacao = {
                data: document.getElementById('caixa-data').value,
                descricao: document.getElementById('caixa-descricao').value,
                valor: parseFloat(document.getElementById('caixa-valor').value),
                tipo: document.getElementById('caixa-tipo').value,
                observacoes: document.getElementById('caixa-observacoes').value,
            };
            try {
                await db.collection('users').doc(userId).collection('caixa').add(newMovimentacao);
                caixaForm.reset();
                await loadCaixa();
                updateCaixa();
                renderCaixaTable();
            } catch (error) {
                console.error("Erro detalhado ao adicionar movimentação de caixa:", error);
                alert("Falha ao salvar no caixa: " + error.message);
            }
        });
    }
    
    if(estoqueForm) {
        estoqueForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newProduto = {
                produto: document.getElementById('estoque-produto').value,
                descricao: document.getElementById('estoque-descricao').value,
                compra: parseFloat(document.getElementById('estoque-compra').value),
                venda: parseFloat(document.getElementById('estoque-venda').value),
                custos: []
            };
            try {
                await db.collection('users').doc(userId).collection('estoque').add(newProduto);
                estoqueForm.reset();
                await loadEstoque();
                renderEstoqueTable();
            } catch (error) {
                console.error("Erro ao adicionar produto:", error);
                alert("Falha ao salvar produto: " + error.message);
            }
        });
    }

    // --- LÓGICA GERAL DE CLIQUE PARA MODAIS E EXCLUSÃO ---
    document.addEventListener('click', async (e) => {
        // Lógica para fechar modais
        if (e.target.matches('[data-close]')) {
            e.target.closest('.modal-overlay').classList.remove('active');
        }
        
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
                    // ... preencher outros campos
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
                    await loadLeads();
                    renderKanbanCards();
                    renderLeadsTable();
                    updateDashboard();
                }
            } else if (deleteBtn.closest('#estoque-table')) {
                if (confirm('Tem certeza que deseja excluir este produto?')) {
                    await db.collection('users').doc(userId).collection('estoque').doc(docId).delete();
                    await loadEstoque();
                    renderEstoqueTable();
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

    // --- LÓGICA DE SUBMISSÃO DOS FORMS DE EDIÇÃO ---
    
    // As funções restantes (renderização, formatação, etc.) permanecem as mesmas.
    // Omitidas para brevidade, mas devem ser mantidas no seu arquivo.
    // Cole o código completo abaixo, que inclui todas elas.
});


// ==================================================================
// CÓDIGO COMPLETO PARA SUBSTITUIÇÃO (inclui as funções omitidas acima)
// ==================================================================
document.addEventListener('DOMContentLoaded', () => {
    const db = firebase.firestore();
    let userId = null;

    let leads = [];
    let caixa = [];
    let estoque = [];
    
    let statusChart;

    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const contentAreas = document.querySelectorAll('.main-content .content-area');
    const pageTitle = document.getElementById('page-title');
    const leadForm = document.getElementById('lead-form');
    const editLeadModal = document.getElementById('edit-lead-modal');
    const editLeadForm = document.getElementById('edit-lead-form');
    const exportLeadsBtn = document.getElementById('export-excel-btn');
    const caixaForm = document.getElementById('caixa-form');
    const financeTabs = document.querySelectorAll('.finance-tab');
    const financeContentAreas = document.querySelectorAll('.finance-content');
    const estoqueForm = document.getElementById('estoque-form');
    const addCustoModal = document.getElementById('add-custo-modal');
    const addCustoForm = document.getElementById('add-custo-form');
    const importEstoqueFile = document.getElementById('import-estoque-file');
    const exportEstoqueBtn = document.getElementById('export-estoque-btn');
    const editProdutoModal = document.getElementById('edit-produto-modal');
    const editProdutoForm = document.getElementById('edit-produto-form');
    const userNameDisplay = document.querySelector('.user-profile span');

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            userId = user.uid;
            userNameDisplay.textContent = `Olá, ${user.displayName || user.email.split('@')[0]}`;
            loadAllData();
        }
    });

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

    if(leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newLead = {
                nome: document.getElementById('lead-name').value, email: document.getElementById('lead-email').value, whatsapp: document.getElementById('lead-whatsapp').value, atendente: document.getElementById('lead-attendant').value, origem: document.getElementById('lead-origin').value, data: document.getElementById('lead-date').value, qualificacao: document.getElementById('lead-qualification').value, notas: document.getElementById('lead-notes').value, status: 'novo'
            };
            try {
                await db.collection('users').doc(userId).collection('leads').add(newLead);
                leadForm.reset();
                await loadLeads();
                renderKanbanCards();
                renderLeadsTable();
                updateDashboard();
            } catch (error) {
                console.error("Erro ao adicionar lead:", error); alert("Falha ao salvar o lead: " + error.message);
            }
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
                await loadCaixa();
                updateCaixa();
                renderCaixaTable();
            } catch (error) {
                console.error("Erro detalhado ao adicionar movimentação de caixa:", error); alert("Falha ao salvar no caixa: " + error.message);
            }
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
                await loadEstoque();
                renderEstoqueTable();
            } catch (error) {
                console.error("Erro ao adicionar produto:", error); alert("Falha ao salvar produto: " + error.message);
            }
        });
    }

    document.addEventListener('click', async (e) => {
        if (e.target.matches('[data-close]')) {
            e.target.closest('.modal-overlay').classList.remove('active');
        }
        
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
                    await loadLeads();
                    renderAll();
                }
            } else if (deleteBtn.closest('#estoque-table')) {
                if (confirm('Tem certeza que deseja excluir este produto?')) {
                    await db.collection('users').doc(userId).collection('estoque').doc(docId).delete();
                    await loadEstoque();
                    renderAll();
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
            await loadLeads();
            renderAll();
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
            await loadEstoque();
            renderAll();
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
            await loadEstoque();
            renderAll();
        });
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    function renderLeadsTable() {
        const tableBody = document.querySelector('#leads-table tbody');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        leads.forEach(lead => tableBody.appendChild(createLeadTableRow(lead)));
    }

    function createLeadTableRow(lead) {
        const row = document.createElement('tr');
        row.setAttribute('data-id', lead.id);
        row.innerHTML = `<td>${lead.nome||''}</td><td><a href="https://wa.me/${lead.whatsapp||''}" target="_blank">${lead.whatsapp||''}</a></td><td>${lead.origem||''}</td><td>${lead.qualificacao||''}</td><td>${lead.status||''}</td><td><div class="table-actions"><button class="btn-edit-table" title="Editar Lead"><i class="ph-fill ph-note-pencil"></i></button><button class="btn-delete-table" title="Excluir Lead"><i class="ph-fill ph-trash"></i></button></div></td>`;
        return row;
    }
    
    function renderKanbanCards() {
        const lists = document.querySelectorAll('.kanban-cards-list');
        if(!lists.length) return;
        lists.forEach(list => list.innerHTML = '');
        leads.forEach(lead => {
            const targetColumn = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (targetColumn) {
                targetColumn.appendChild(createKanbanCard(lead));
            }
        });
    }

    function createKanbanCard(lead) {
        const newCard = document.createElement('div');
        newCard.classList.add('kanban-card');
        newCard.draggable = true;
        newCard.setAttribute('data-id', lead.id);
        newCard.innerHTML = `<strong>${lead.nome||''}</strong><br><small>WhatsApp: <a href="https://wa.me/${lead.whatsapp||''}" target="_blank">${lead.whatsapp||''}</a></small><br><small>Origem: ${lead.origem||''}</small><br><small>Qualificação: ${lead.qualificacao||''}</small>`;
        return newCard;
    }
    
    function updateCaixa() {
        const totalEntradas = caixa.filter(item => item.tipo === 'entrada').reduce((sum, item) => sum + item.valor, 0);
        const totalSaidas = caixa.filter(item => item.tipo === 'saida').reduce((sum, item) => sum + item.valor, 0);
        const saldoAtual = totalEntradas - totalSaidas;
        document.getElementById('total-entradas').textContent = formatCurrency(totalEntradas);
        document.getElementById('total-saidas').textContent = formatCurrency(totalSaidas);
        document.getElementById('caixa-atual').textContent = formatCurrency(saldoAtual);
    }
    
    function renderCaixaTable() {
        const tableBody = document.querySelector('#caixa-table tbody');
        if(!tableBody) return;
        tableBody.innerHTML = '';
        caixa.forEach(item => {
            const row = document.createElement('tr');
            row.classList.add(item.tipo === 'entrada' ? 'entrada-row' : 'saida-row');
            row.innerHTML = `<td>${new Date(item.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td><td>${item.descricao}</td><td>${item.tipo === 'entrada' ? formatCurrency(item.valor) : '-'}</td><td>${item.tipo === 'saida' ? formatCurrency(item.valor) : '-'}</td><td>${item.observacoes}</td>`;
            tableBody.appendChild(row);
        });
    }

    function renderEstoqueTable() {
        const tableBody = document.querySelector('#estoque-table tbody');
        if(!tableBody) return;
        tableBody.innerHTML = '';
        estoque.forEach(item => {
            const totalCustos = (item.custos || []).reduce((sum, custo) => sum + custo.valor, 0);
            const lucro = item.venda - (item.compra + totalCustos);
            const row = document.createElement('tr');
            row.setAttribute('data-id', item.id);
            row.innerHTML = `<td>${item.produto}</td><td>${item.descricao}</td><td>${formatCurrency(item.compra)}</td><td>${formatCurrency(totalCustos)}</td><td>${formatCurrency(item.venda)}</td><td>${formatCurrency(lucro)}</td><td><div class="table-actions"><button class="btn-custo-table" title="Adicionar Custo"><i class="ph-fill ph-currency-dollar-simple"></i></button><button class="btn-edit-table" title="Editar Produto"><i class="ph-fill ph-note-pencil"></i></button><button class="btn-delete-table" title="Excluir Produto"><i class="ph-fill ph-trash"></i></button></div></td>`;
            tableBody.appendChild(row);
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
        const ctx = document.getElementById('statusChart');
        if (!ctx) return;
        if (statusChart) {
            statusChart.destroy();
        }
        statusChart = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Novo', 'Em Progresso', 'Fechado'],
                datasets: [{ data: [novo, progresso, fechado], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'] }]
            }
        });
    }

    // --- FUNÇÕES UTILITÁRIAS E OUTRAS ---
    function formatCurrency(value) { return (typeof value === 'number' ? value : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
});
