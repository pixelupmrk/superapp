document.addEventListener('DOMContentLoaded', () => {

    // Inicialização do Firestore
    const db = firebase.firestore();
    let userId = null;

    // Arrays locais que servirão como cache dos dados do Firebase
    let leads = [];
    let caixa = [];
    let estoque = [];
    
    let statusChart;

    // --- Seletores de Elementos (sem alterações) ---
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
    const closeCustoModalBtn = document.getElementById('close-custo-modal');
    const importEstoqueFile = document.getElementById('import-estoque-file');
    const exportEstoqueBtn = document.getElementById('export-estoque-btn');
    const acceleratorNavItems = document.querySelectorAll('.sales-accelerator-menu-item');
    const acceleratorContentAreas = document.querySelectorAll('.sales-accelerator-module-content');
    const editProdutoModal = document.getElementById('edit-produto-modal');
    const editProdutoForm = document.getElementById('edit-produto-form');
    const closeEditProdutoModalBtn = document.getElementById('close-edit-produto-modal');
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const saveSettingsButton = document.getElementById('save-settings-btn');
    const userNameInput = document.getElementById('setting-user-name');
    const companyNameInput = document.getElementById('setting-company-name');
    const userNameDisplay = document.querySelector('.user-profile span');
    const chatbotForm = document.getElementById('chatbot-form');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');

    let draggedItem = null;

    // --- PONTO DE ENTRADA PRINCIPAL: OBSERVA A AUTENTICAÇÃO ---
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            userId = user.uid;
            // Quando o usuário está logado, carregamos todos os seus dados
            loadAllData();
            loadSettings();
        } else {
            // Se o usuário deslogar, o auth.js redirecionará para a página de login
            userId = null;
        }
    });

    // --- FUNÇÕES DE CARREGAMENTO DE DADOS (Leitura do Firebase) ---
    async function loadAllData() {
        if (!userId) return;
        try {
            await Promise.all([loadLeads(), loadCaixa(), loadEstoque()]);
            // Após carregar tudo, renderiza a tela
            renderAll();
            console.log("Todos os dados foram carregados do Firebase.");
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
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


    // --- LÓGICA DE NAVEGAÇÃO E UI (sem grandes alterações) ---
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-target');
            if(!targetId) return;

            const targetText = e.currentTarget.querySelector('span').textContent;
            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');

            contentAreas.forEach(area => {
                area.style.display = 'none';
            });
            
            document.getElementById(targetId).style.display = 'block';
            pageTitle.textContent = targetText;
        });
    });
    
    // --- LÓGICAS DO CRM (Agora com Firebase) ---
    if(leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newLead = {
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
            try {
                await db.collection('users').doc(userId).collection('leads').add(newLead);
                leadForm.reset();
                await loadLeads(); // Recarrega os leads do Firebase
                renderKanbanCards();
                renderLeadsTable();
                updateDashboard();
            } catch (error) {
                console.error("Erro ao adicionar lead:", error);
            }
        });
    }

    if(editLeadForm) {
        editLeadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const leadId = document.getElementById('edit-lead-id').value;
            const updatedLead = {
                nome: document.getElementById('edit-lead-name').value,
                email: document.getElementById('edit-lead-email').value,
                whatsapp: document.getElementById('edit-lead-whatsapp').value,
                status: document.getElementById('edit-lead-status').value,
                atendente: document.getElementById('edit-lead-attendant').value,
                origem: document.getElementById('edit-lead-origem').value,
                data: document.getElementById('edit-lead-date').value,
                qualificacao: document.getElementById('edit-lead-qualification').value,
                notas: document.getElementById('edit-lead-notes').value,
            };
            try {
                await db.collection('users').doc(userId).collection('leads').doc(leadId).update(updatedLead);
                editLeadModal.style.display = 'none';
                await loadLeads();
                renderKanbanCards();
                renderLeadsTable();
                updateDashboard();
            } catch (error) {
                console.error("Erro ao atualizar lead:", error);
            }
        });
    }

    // --- LÓGICA DO FINANCEIRO (Agora com Firebase) ---
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
                console.error("Erro ao adicionar movimentação de caixa:", error);
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
            }
        });
    }
    
    if (editProdutoForm) {
        editProdutoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const produtoId = document.getElementById('edit-produto-id').value;
            const updatedProduto = {
                produto: document.getElementById('edit-produto-nome').value,
                descricao: document.getElementById('edit-produto-descricao').value,
                compra: parseFloat(document.getElementById('edit-produto-compra').value),
                venda: parseFloat(document.getElementById('edit-produto-venda').value),
            };
            try {
                await db.collection('users').doc(userId).collection('estoque').doc(produtoId).update(updatedProduto);
                editProdutoModal.style.display = 'none';
                await loadEstoque();
                renderEstoqueTable();
            } catch (error) {
                console.error("Erro ao atualizar produto:", error);
            }
        });
    }

    if(addCustoForm) {
        addCustoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const produtoId = document.getElementById('add-custo-produto-id').value; // Usaremos um campo hidden
            const produtoRef = db.collection('users').doc(userId).collection('estoque').doc(produtoId);
            const novoCusto = {
                descricao: document.getElementById('custo-descricao-custo').value,
                valor: parseFloat(document.getElementById('custo-valor').value)
            };
            try {
                // Usamos a função de arrayUnion para adicionar um item ao array de custos
                await produtoRef.update({
                    custos: firebase.firestore.FieldValue.arrayUnion(novoCusto)
                });
                addCustoModal.style.display = 'none';
                addCustoForm.reset();
                await loadEstoque();
                renderEstoqueTable();
            } catch (error) {
                console.error("Erro ao adicionar custo:", error);
            }
        });
    }

    // --- LÓGICA DE EVENTOS DE CLIQUE (Abrir Modais, Excluir) ---
    document.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.btn-edit-table');
        const deleteBtn = e.target.closest('.btn-delete-table');
        const addCustoBtn = e.target.closest('.btn-custo-table');

        if (editBtn) {
            const row = editBtn.closest('tr');
            const docId = row.getAttribute('data-id');

            if (editBtn.closest('#leads-table')) {
                const lead = leads.find(l => l.id === docId);
                if (lead && editLeadModal) {
                    document.getElementById('edit-lead-id').value = lead.id; // Salva o ID do documento
                    // Preenche o resto do formulário...
                    document.getElementById('edit-lead-name').value = lead.nome || '';
                    document.getElementById('edit-lead-email').value = lead.email || '';
                    document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
                    document.getElementById('edit-lead-status').value = lead.status || '';
                    document.getElementById('edit-lead-attendant').value = lead.atendente || '';
                    document.getElementById('edit-lead-origem').value = lead.origem || '';
                    document.getElementById('edit-lead-date').value = lead.data || '';
                    document.getElementById('edit-lead-qualification').value = lead.qualificacao || '';
                    document.getElementById('edit-lead-notes').value = lead.notas || '';
                    editLeadModal.style.display = 'flex';
                }
            } else if (editBtn.closest('#estoque-table')) {
                const produto = estoque.find(p => p.id === docId);
                if (produto && editProdutoModal) {
                    document.getElementById('edit-produto-id').value = produto.id; // Salva o ID do documento
                    document.getElementById('edit-produto-nome').value = produto.produto;
                    document.getElementById('edit-produto-descricao').value = produto.descricao;
                    document.getElementById('edit-produto-compra').value = produto.compra;
                    document.getElementById('edit-produto-venda').value = produto.venda;
                    editProdutoModal.style.display = 'flex';
                }
            }
        }
        
        if (deleteBtn) {
            const row = deleteBtn.closest('tr');
            const docId = row.getAttribute('data-id');
            
            if (deleteBtn.closest('#leads-table')) {
                if (confirm('Tem certeza que deseja excluir este lead?')) {
                    try {
                        await db.collection('users').doc(userId).collection('leads').doc(docId).delete();
                        await loadLeads();
                        renderKanbanCards();
                        renderLeadsTable();
                        updateDashboard();
                    } catch (error) { console.error("Erro ao excluir lead:", error); }
                }
            } else if (deleteBtn.closest('#estoque-table')) {
                if (confirm('Tem certeza que deseja excluir este produto?')) {
                    try {
                        await db.collection('users').doc(userId).collection('estoque').doc(docId).delete();
                        await loadEstoque();
                        renderEstoqueTable();
                    } catch (error) { console.error("Erro ao excluir produto:", error); }
                }
            }
        }

        if (addCustoBtn) {
            const row = addCustoBtn.closest('tr');
            const docId = row.getAttribute('data-id');
            const produto = estoque.find(p => p.id === docId);
            if (produto) {
                document.getElementById('add-custo-produto-id').value = produto.id; // Salva o ID do documento
                addCustoModal.style.display = 'flex';
            }
        }
    });

    // --- FUNÇÕES DE RENDERIZAÇÃO (agora leem dos arrays locais atualizados) ---
    // Adicionar data-id="${lead.id}" para identificar os documentos do Firestore
    function createLeadTableRow(lead) {
        const row = document.createElement('tr');
        row.setAttribute('data-id', lead.id);
        // ... resto do HTML da linha ...
        row.innerHTML = `
            <td>${lead.nome || ''}</td>
            <td><a href="https://wa.me/${lead.whatsapp || ''}" target="_blank">${lead.whatsapp || ''}</a></td>
            <td>${lead.origem || ''}</td>
            <td>${lead.qualificacao || ''}</td>
            <td>${lead.status || ''}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit-table"><i class="ph-fill ph-note-pencil"></i></button>
                    <button class="btn-delete-table"><i class="ph-fill ph-trash"></i></button>
                </div>
            </td>
        `;
        return row;
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
            // ... resto do HTML da linha ...
            row.innerHTML = `
                <td>${item.produto}</td>
                <td>${item.descricao}</td>
                <td>${formatCurrency(item.compra)}</td>
                <td>${formatCurrency(totalCustos)}</td>
                <td>${formatCurrency(item.venda)}</td>
                <td>${formatCurrency(lucro)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-custo-table" title="Adicionar Custo"><i class="ph-fill ph-currency-dollar-simple"></i></button>
                        <button class="btn-edit-table" title="Editar Produto"><i class="ph-fill ph-note-pencil"></i></button>
                        <button class="btn-delete-table" title="Excluir Produto"><i class="ph-fill ph-trash"></i></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // --- Outras funções (exportação, chatbot, etc. permanecem com a lógica original) ---
    // Nenhuma alteração necessária para o resto do código, pois eles operam sobre os arrays locais.
    // O código de exportação, por exemplo, já lê os arrays 'leads' e 'estoque', que agora são
    // preenchidos com os dados do Firebase.

    // Cole aqui o restante do seu código (funções de fechar modais, exportação, etc.)
    // As funções abaixo não precisam de alteração
    if (exportLeadsBtn) { /* ...código de exportar leads... */ }
    if (exportEstoqueBtn) { /* ...código de exportar estoque... */ }
    if (importEstoqueFile) { /* ...código de importar estoque... */ }
    if(closeCustoModalBtn) { closeCustoModalBtn.addEventListener('click', () => { addCustoModal.style.display = 'none'; }); }
    if (closeEditProdutoModalBtn) { closeEditProdutoModalBtn.addEventListener('click', () => { editProdutoModal.style.display = 'none'; }); }
    function formatCurrency(value) { return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
    function updateDashboard() { /* ...código do dashboard... */ }
    function updateStatusChart(novo, progresso, fechado) { /* ...código do gráfico... */ }
    if (chatbotForm) { /* ...código do chatbot... */ }

    // Colando as funções não alteradas para garantir que o arquivo fique completo:
    
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
            row.innerHTML = `
                <td>${new Date(item.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                <td>${item.descricao}</td>
                <td>${item.tipo === 'entrada' ? formatCurrency(item.valor) : '-'}</td>
                <td>${item.tipo === 'saida' ? formatCurrency(item.valor) : '-'}</td>
                <td>${item.observacoes}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function renderKanbanCards() {
        if(!document.querySelector('.kanban-cards-list')) return;
        document.querySelectorAll('.kanban-cards-list').forEach(list => list.innerHTML = '');
        leads.forEach(lead => {
            const newCard = createKanbanCard(lead);
            const targetColumn = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (targetColumn) {
                targetColumn.appendChild(newCard);
            }
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
    
});
