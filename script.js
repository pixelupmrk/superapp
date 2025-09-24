document.addEventListener('DOMContentLoaded', () => {

    // --- ARRAYS DE DADOS GLOBAIS ---
    let leads = [];
    let caixa = [];
    let estoque = [];
    let nextLeadId = 0;
    let nextEstoqueId = 0;
    let statusChart;
    let currentLeadId = null;
    let draggedItem = null;

    // --- SELETORES DE ELEMENTOS ---
    const pageTitle = document.getElementById('page-title');
    const contentAreas = document.querySelectorAll('.main-content .content-area');
    
    // --- INICIALIZAÇÃO DA APLICAÇÃO ---
    function initializeApp() {
        loadData();
        setupEventListeners();
        renderAll();
    }

    function renderAll() {
        updateDashboard();
        renderKanbanCards();
        renderLeadsTable();
        renderCaixaTable();
        renderEstoqueTable();
    }
    
    // --- LÓGICA DE DADOS (CARREGAR E SALVAR) ---
    function loadData() {
        // Configurações
        loadTheme();
        loadUserName();
        loadBusinessInfo();
        // Dados da Aplicação
        leads = JSON.parse(localStorage.getItem('crmLeads')) || [];
        caixa = JSON.parse(localStorage.getItem('crmCaixa')) || [];
        estoque = JSON.parse(localStorage.getItem('crmEstoque')) || [];
        nextLeadId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 0;
        nextEstoqueId = estoque.length > 0 ? Math.max(...estoque.map(p => p.id)) + 1 : 0;
    }

    function saveData() {
        localStorage.setItem('crmLeads', JSON.stringify(leads));
        localStorage.setItem('crmCaixa', JSON.stringify(caixa));
        localStorage.setItem('crmEstoque', JSON.stringify(estoque));
    }

    // --- SETUP DE EVENT LISTENERS ---
    function setupEventListeners() {
        // Navegação Principal
        document.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', handleNavigation));
        
        // Configurações
        document.querySelector('.theme-switcher').addEventListener('click', handleThemeChange);
        document.getElementById('save-user-name-btn').addEventListener('click', saveUserName);
        document.getElementById('business-info-form').addEventListener('submit', saveBusinessInfo);
        document.getElementById('clear-all-data-btn').addEventListener('click', clearAllData);

        // CRM / Leads
        document.getElementById('lead-form').addEventListener('submit', addLead);
        document.getElementById('kanban-board').addEventListener('dragstart', handleDragStart);
        document.getElementById('kanban-board').addEventListener('dragend', handleDragEnd);
        document.getElementById('kanban-board').addEventListener('dragover', e => e.preventDefault());
        document.getElementById('kanban-board').addEventListener('drop', handleDrop);
        document.getElementById('leads-table').addEventListener('click', handleLeadTableActions);
        document.getElementById('edit-lead-form').addEventListener('submit', updateLead);
        document.getElementById('delete-lead-btn').addEventListener('click', deleteLeadFromModal);
        document.getElementById('edit-lead-modal').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.style.display = 'none'; });
        document.getElementById('export-excel-btn').addEventListener('click', exportLeadsToExcel);

        // Financeiro
        document.querySelectorAll('.finance-tab').forEach(tab => tab.addEventListener('click', handleFinanceTab));
        document.getElementById('caixa-form').addEventListener('submit', addCaixaMovement);
        document.getElementById('estoque-form').addEventListener('submit', addEstoqueItem);
        document.getElementById('estoque-table').addEventListener('click', handleEstoqueTableActions);
        document.getElementById('estoque-search').addEventListener('input', renderEstoqueTable);
        document.getElementById('add-custo-form').addEventListener('submit', addCustoToProduto);
        document.getElementById('close-custo-modal').addEventListener('click', () => document.getElementById('add-custo-modal').style.display = 'none');
        document.getElementById('add-custo-modal').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.style.display = 'none'; });

        // Acelerador de Vendas
        document.querySelectorAll('.modulos-menu-item').forEach(item => item.addEventListener('click', handleModuloNavigation));
    }

    // --- NAVEGAÇÃO E UI ---
    function handleNavigation(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('data-target');
        if (!targetId) return;
        pageTitle.textContent = e.currentTarget.querySelector('span').textContent;
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        e.currentTarget.classList.add('active');
        contentAreas.forEach(area => area.style.display = 'none');
        document.getElementById(targetId).style.display = 'block';
    }

    function handleFinanceTab(e) {
        e.preventDefault();
        const targetId = e.currentTarget.dataset.tab + '-tab-content';
        document.querySelectorAll('.finance-tab').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.querySelectorAll('.finance-content').forEach(c => c.style.display = 'none');
        document.getElementById(targetId).style.display = 'block';
    }

    function handleModuloNavigation(e) {
        e.preventDefault();
        const targetId = e.currentTarget.dataset.content;
        document.querySelectorAll('.modulos-menu-item').forEach(nav => nav.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.querySelectorAll('.modulos-module-content').forEach(area => area.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');
    }

    // --- LÓGICA DE CONFIGURAÇÕES ---
    function applyTheme(theme) { document.body.dataset.theme = theme; document.querySelector('.theme-switcher .active')?.classList.remove('active'); document.querySelector(`.btn-theme[data-theme="${theme}"]`)?.classList.add('active'); }
    function loadTheme() { applyTheme(localStorage.getItem('appTheme') || 'dark'); }
    function handleThemeChange(e) { const btn = e.target.closest('.btn-theme'); if (btn) { const theme = btn.dataset.theme; localStorage.setItem('appTheme', theme); applyTheme(theme); updateDashboard(); } }
    function loadUserName() { const name = localStorage.getItem('crmUserName'); if (name) { document.getElementById('user-name-display').textContent = `Olá, ${name}`; document.getElementById('user-name-input').value = name; } }
    function saveUserName() { const name = document.getElementById('user-name-input').value.trim(); if (name) { localStorage.setItem('crmUserName', name); loadUserName(); alert('Nome salvo!'); } }
    function loadBusinessInfo() { const info = JSON.parse(localStorage.getItem('businessInfo')); if (info) { Object.keys(info).forEach(key => { const el = document.getElementById(`business-${key}`); if (el) el.value = info[key]; }); } }
    function saveBusinessInfo(e) { e.preventDefault(); const info = {}; new FormData(e.target).forEach((value, key) => info[key] = value); localStorage.setItem('businessInfo', JSON.stringify(info)); alert('Informações salvas!'); }
    function clearAllData() { if (confirm('ATENÇÃO! Deseja apagar TODOS os dados? A ação é irreversível.')) { leads = []; caixa = []; estoque = []; localStorage.removeItem('crmLeads'); localStorage.removeItem('crmCaixa'); localStorage.removeItem('crmEstoque'); initializeApp(); } }

    // --- LÓGICA DE LEADS (CRM / KANBAN) ---
    function addLead(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newLead = { id: nextLeadId++, status: 'novo' };
        formData.forEach((value, key) => newLead[key] = value);
        leads.push(newLead);
        saveData();
        renderKanbanCards();
        renderLeadsTable();
        updateDashboard();
        e.target.reset();
    }
    
    function updateLead(e) {
        e.preventDefault();
        const lead = leads.find(l => l.id === currentLeadId);
        if (lead) {
            new FormData(e.target).forEach((value, key) => lead[key] = value);
            saveData();
            renderAll();
            document.getElementById('edit-lead-modal').style.display = 'none';
        }
    }
    
    function deleteLead(leadId) {
        leads = leads.filter(l => l.id !== leadId);
        saveData();
        renderAll();
    }
    
    function deleteLeadFromModal() {
        if (confirm('Tem certeza que deseja excluir este lead?')) {
            deleteLead(currentLeadId);
            document.getElementById('edit-lead-modal').style.display = 'none';
        }
    }

    function openEditModal(leadId) {
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
            currentLeadId = leadId;
            const form = document.getElementById('edit-lead-form');
            form.querySelector('#edit-lead-id').value = lead.id;
            Object.keys(lead).forEach(key => {
                const input = form.querySelector(`[id="edit-lead-${key}"]`);
                if (input) input.value = lead[key];
            });
            document.getElementById('edit-lead-modal').style.display = 'flex';
        }
    }
    
    function handleLeadTableActions(e) {
        const editBtn = e.target.closest('.btn-edit-table');
        const deleteBtn = e.target.closest('.btn-delete-table');
        if (editBtn) openEditModal(parseInt(editBtn.closest('tr').dataset.id));
        if (deleteBtn) {
            if (confirm('Tem certeza?')) deleteLead(parseInt(deleteBtn.closest('tr').dataset.id));
        }
    }
    
    function handleDragStart(e) { if (e.target.classList.contains('kanban-card')) { draggedItem = e.target; setTimeout(() => e.target.style.display = 'none', 0); } }
    function handleDragEnd() { if (draggedItem) { draggedItem.style.display = 'block'; draggedItem = null; } }
    function handleDrop(e) {
        const column = e.target.closest('.kanban-column');
        if (column && draggedItem) {
            const list = column.querySelector('.kanban-cards-list');
            list.appendChild(draggedItem);
            const leadId = parseInt(draggedItem.dataset.id);
            const newStatus = column.dataset.status;
            const lead = leads.find(l => l.id === leadId);
            if (lead) { lead.status = newStatus; saveData(); renderAll(); }
        }
    }
    
    // --- LÓGICA FINANCEIRA (CAIXA E ESTOQUE) ---
    function addCaixaMovement(e) { e.preventDefault(); const form = e.target; const movement = { data: form['caixa-data'].value, descricao: form['caixa-descricao'].value, valor: parseFloat(form['caixa-valor'].value), tipo: form['caixa-tipo'].value, observacoes: form['caixa-observacoes'].value, }; caixa.push(movement); saveData(); renderCaixaTable(); form.reset(); }
    function addEstoqueItem(e) { e.preventDefault(); const form = e.target; const newItem = { id: nextEstoqueId++, produto: form.produto.value, descricao: form.descricao.value, compra: parseFloat(form.compra.value) || 0, venda: parseFloat(form.venda.value) || 0, custos: [], }; estoque.push(newItem); saveData(); nextEstoqueId++; renderEstoqueTable(); form.reset(); }
    function addCustoToProduto(e) { e.preventDefault(); const form = e.target; const produtoId = parseInt(form['add-custo-produto-id'].value); const produto = estoque.find(p => p.id === produtoId); if (produto) { produto.custos.push({ descricao: form['custo-descricao'].value, valor: parseFloat(form['custo-valor'].value) }); saveData(); renderEstoqueTable(); } form.reset(); document.getElementById('add-custo-modal').style.display = 'none'; }
    function handleEstoqueTableActions(e) { const addCustoBtn = e.target.closest('.btn-add-custo'); const deleteBtn = e.target.closest('.btn-delete-produto'); if (addCustoBtn) { const produtoId = addCustoBtn.closest('tr').dataset.id; document.getElementById('add-custo-produto-id').value = produtoId; document.getElementById('add-custo-modal').style.display = 'flex'; } if (deleteBtn) { if (confirm('Excluir este produto do estoque?')) { const produtoId = parseInt(deleteBtn.closest('tr').dataset.id); estoque = estoque.filter(p => p.id !== produtoId); saveData(); renderEstoqueTable(); } } }
    
    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    function renderKanbanCards() { document.querySelectorAll('.kanban-cards-list').forEach(list => list.innerHTML = ''); leads.forEach(lead => { const card = document.createElement('div'); card.className = 'kanban-card'; card.draggable = true; card.dataset.id = lead.id; card.innerHTML = `<strong>${lead.nome}</strong><br><small>Tel: ${lead.whatsapp}</small>`; const targetColumn = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`); if (targetColumn) targetColumn.appendChild(card); }); }
    function renderLeadsTable() { const tbody = document.querySelector('#leads-table tbody'); tbody.innerHTML = ''; leads.forEach(lead => { const row = tbody.insertRow(); row.dataset.id = lead.id; row.innerHTML = `<td>${lead.nome}</td><td>${lead.whatsapp}</td><td>${lead.origem}</td><td>${lead.qualificacao}</td><td>${lead.status}</td><td class="table-actions"><button class="btn-edit-table" title="Editar"><i class="ph-fill ph-note-pencil"></i></button><button class="btn-delete-table" title="Excluir"><i class="ph-fill ph-trash"></i></button></td>`; }); }
    function renderCaixaTable() { const tbody = document.querySelector('#caixa-table tbody'); tbody.innerHTML = ''; let saldo = 0; const totalEntradas = caixa.filter(m => m.tipo === 'entrada').reduce((acc, m) => acc + m.valor, 0); const totalSaidas = caixa.filter(m => m.tipo === 'saida').reduce((acc, m) => acc + m.valor, 0); document.getElementById('total-entradas').textContent = `R$ ${totalEntradas.toFixed(2)}`; document.getElementById('total-saidas').textContent = `R$ ${totalSaidas.toFixed(2)}`; document.getElementById('caixa-atual').textContent = `R$ ${(totalEntradas - totalSaidas).toFixed(2)}`; caixa.forEach(mov => { const row = tbody.insertRow(); row.innerHTML = `<td>${mov.data}</td><td>${mov.descricao}</td><td class="entrada">${mov.tipo === 'entrada' ? `R$ ${mov.valor.toFixed(2)}` : ''}</td><td class="saida">${mov.tipo === 'saida' ? `R$ ${mov.valor.toFixed(2)}` : ''}</td><td>${mov.observacoes}</td>`; }); }
    function renderEstoqueTable() { const tbody = document.querySelector('#estoque-table tbody'); tbody.innerHTML = ''; const searchTerm = document.getElementById('estoque-search').value.toLowerCase(); const filteredEstoque = estoque.filter(p => p.produto.toLowerCase().includes(searchTerm) || p.descricao.toLowerCase().includes(searchTerm)); filteredEstoque.forEach(produto => { const totalCustos = produto.custos.reduce((sum, c) => sum + c.valor, 0); const lucro = produto.venda - (produto.compra + totalCustos); const custosHtml = produto.custos.length > 0 ? `<ul class="custos-list">${produto.custos.map(c => `<li>${c.descricao}: R$ ${c.valor.toFixed(2)}</li>`).join('')}</ul>` : '<small>Nenhum</small>'; const row = tbody.insertRow(); row.dataset.id = produto.id; row.innerHTML = `<td>${produto.produto}</td><td>${produto.descricao}</td><td>R$ ${produto.compra.toFixed(2)}</td><td>${custosHtml}</td><td>R$ ${produto.venda.toFixed(2)}</td><td>R$ ${lucro.toFixed(2)}</td><td class="table-actions"><button class="btn-add-custo" title="Adicionar Custo"><i class="ph-fill ph-plus-circle"></i></button><button class="btn-delete-produto" title="Excluir"><i class="ph-fill ph-trash"></i></button></td>`; }); }
    
    // --- DASHBOARD E GRÁFICOS ---
    function updateDashboard() { const totalLeads = leads.length; const leadsNovo = leads.filter(l => l.status === 'novo').length; const leadsProgresso = leads.filter(l => l.status === 'progresso').length; const leadsFechado = leads.filter(l => l.status === 'fechado').length; document.getElementById('total-leads').textContent = totalLeads; document.getElementById('leads-novo').textContent = leadsNovo; document.getElementById('leads-progresso').textContent = leadsProgresso; document.getElementById('leads-fechado').textContent = leadsFechado; updateStatusChart(leadsNovo, leadsProgresso, leadsFechado); }
    function updateStatusChart(novo, progresso, fechado) { const ctx = document.getElementById('statusChart').getContext('2d'); if (statusChart) statusChart.destroy(); const chartTextColor = document.body.dataset.theme === 'light' ? '#212529' : '#cdd6f4'; const chartBgColor = document.body.dataset.theme === 'light' ? '#fff' : '#0d1117'; statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Em Progresso', 'Fechado'], datasets: [{ data: [novo, progresso, fechado], backgroundColor: ['#007bff', '#ffc107', '#28a745'], borderColor: chartBgColor, borderWidth: 3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: chartTextColor, font: { size: 14 } } } } } }); }

    // --- EXPORTAÇÃO ---
    function exportLeadsToExcel() { const worksheet = XLSX.utils.json_to_sheet(leads); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "Leads"); XLSX.writeFile(workbook, "leads_crm.xlsx"); }

    // --- INICIA A APLICAÇÃO ---
    initializeApp();
});
