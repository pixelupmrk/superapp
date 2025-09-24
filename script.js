document.addEventListener('DOMContentLoaded', () => {
    // --- VARIÁVEIS GLOBAIS ---
    let leads = [], caixa = [], estoque = [];
    let nextLeadId = 0, nextEstoqueId = 0;
    let statusChart, currentLeadId = null, draggedItem = null;

    // --- INICIALIZAÇÃO ---
    const initializeApp = () => {
        renderStaticTemplates();
        loadDataFromLocalStorage();
        setupEventListeners();
        renderAllDynamicContent();
    };

    // --- DADOS (LOCALSTORAGE) ---
    const loadDataFromLocalStorage = () => {
        loadTheme();
        loadUserName();
        loadBusinessInfo();
        leads = JSON.parse(localStorage.getItem('crmLeads')) || [];
        caixa = JSON.parse(localStorage.getItem('crmCaixa')) || [];
        estoque = JSON.parse(localStorage.getItem('crmEstoque')) || [];
        nextLeadId = leads.length ? Math.max(...leads.map(l => l.id)) + 1 : 0;
        nextEstoqueId = estoque.length ? Math.max(...estoque.map(p => p.id)) + 1 : 0;
    };
    const saveDataToLocalStorage = () => {
        localStorage.setItem('crmLeads', JSON.stringify(leads));
        localStorage.setItem('crmCaixa', JSON.stringify(caixa));
        localStorage.setItem('crmEstoque', JSON.stringify(estoque));
    };

    // --- RENDERIZAÇÃO ---
    const renderAllDynamicContent = () => {
        renderKanbanCards();
        renderLeadsTable();
        renderCaixaTable();
        renderEstoqueTable();
        updateDashboard();
    };
            
    // --- EVENTOS (ESTRUTURA À PROVA DE FALHAS) ---
    const setupEventListeners = () => {
        document.body.addEventListener('click', handleGlobalClick);
        
        document.getElementById('lead-form')?.addEventListener('submit', addLead);
        document.getElementById('edit-lead-form')?.addEventListener('submit', updateLead);
        document.getElementById('business-info-form')?.addEventListener('submit', saveBusinessInfo);
        document.getElementById('caixa-form')?.addEventListener('submit', addCaixaMovement);
        document.getElementById('estoque-form')?.addEventListener('submit', addEstoqueItem);
        document.getElementById('add-custo-form')?.addEventListener('submit', addCustoToProduto);
        
        document.getElementById('estoque-search')?.addEventListener('input', renderEstoqueTable);
        document.getElementById('import-estoque-file')?.addEventListener('change', handleImportEstoque);

        const kanbanBoard = document.getElementById('kanban-board');
        if (kanbanBoard) {
            kanbanBoard.addEventListener('dragstart', handleDragStart);
            kanbanBoard.addEventListener('dragend', handleDragEnd);
            kanbanBoard.addEventListener('dragover', e => e.preventDefault());
            kanbanBoard.addEventListener('drop', handleDrop);
        }
    };
            
    const handleGlobalClick = (e) => {
        const target = e.target;
        const navItem = target.closest('.nav-item');
        if (navItem) handleNavigation(e, navItem);

        const financeTab = target.closest('.finance-tab');
        if (financeTab) handleFinanceTab(e, financeTab);

        const moduloItem = target.closest('.modulos-menu-item');
        if (moduloItem) handleModuloNavigation(e, moduloItem);

        const themeButton = target.closest('.btn-theme');
        if (themeButton) handleThemeChange(themeButton);

        if (target.closest('#save-user-name-btn')) saveUserName();
        if (target.closest('#clear-all-data-btn')) clearAllData();
        if (target.closest('#export-excel-btn')) exportLeadsToExcel();
        if (target.closest('#export-estoque-btn')) handleExportEstoque();
        
        const editLeadBtn = target.closest('.btn-edit-table');
        if(editLeadBtn) openEditModal(parseInt(editLeadBtn.closest('tr').dataset.id));

        const deleteLeadBtnTable = target.closest('.btn-delete-table');
        if(deleteLeadBtnTable) { if (confirm('Tem certeza?')) deleteLead(parseInt(deleteLeadBtnTable.closest('tr').dataset.id)); }

        if (target.closest('#delete-lead-btn')) deleteLeadFromModal();
        
        const addCustoBtn = target.closest('.btn-add-custo');
        if(addCustoBtn) openAddCustoModal(addCustoBtn);

        const deleteProdutoBtn = target.closest('.btn-delete-produto');
        if(deleteProdutoBtn) deleteProduto(deleteProdutoBtn);

        const modalOverlay = target.closest('.modal-overlay');
        if (modalOverlay === e.target || target.closest('.btn-cancel')) {
            modalOverlay.style.display = 'none';
        }
    };

    // --- NAVEGAÇÃO E UI ---
    const handleNavigation = (e, element) => {
        e.preventDefault();
        const targetId = element.dataset.target;
        if (!targetId) return;
        document.getElementById('page-title').textContent = element.querySelector('span').textContent;
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        element.classList.add('active');
        document.querySelectorAll('.content-area').forEach(area => area.classList.remove('active'));
        const targetArea = document.getElementById(targetId);
        if(targetArea) targetArea.classList.add('active');
    };
    const handleFinanceTab = (e, element) => {
        e.preventDefault();
        const targetId = element.dataset.tab + '-tab-content';
        document.querySelectorAll('.finance-tab').forEach(t => t.classList.remove('active'));
        element.classList.add('active');
        document.querySelectorAll('.finance-content').forEach(c => c.classList.remove('active'));
        document.getElementById(targetId)?.classList.add('active');
    };
    const handleModuloNavigation = (e, element) => {
        e.preventDefault();
        const targetId = element.dataset.content;
        document.querySelectorAll('.modulos-menu-item').forEach(nav => nav.classList.remove('active'));
        element.classList.add('active');
        document.querySelectorAll('.modulos-module-content').forEach(area => area.classList.remove('active'));
        document.getElementById(targetId)?.classList.add('active');
    };
            
    // --- LÓGICA DE CONFIGURAÇÕES ---
    const loadUserName = () => {
        const name = localStorage.getItem('crmUserName');
        const userNameDisplayEl = document.getElementById('user-name-display');
        const userNameInputEl = document.getElementById('user-name-input');
        if (userNameDisplayEl) userNameDisplayEl.textContent = `Olá, ${name || 'Usuário'}`;
        if (userNameInputEl && name) userNameInputEl.value = name;
    };
    const saveUserName = () => { const name = document.getElementById('user-name-input').value.trim(); if (name) { localStorage.setItem('crmUserName', name); loadUserName(); alert('Nome salvo!'); } };
    const loadTheme = () => { applyTheme(localStorage.getItem('appTheme') || 'dark'); };
    const applyTheme = (theme) => { document.body.dataset.theme = theme; const switcher = document.querySelector('.theme-switcher'); if(switcher){ switcher.querySelector('.active')?.classList.remove('active'); switcher.querySelector(`.btn-theme[data-theme="${theme}"]`)?.classList.add('active');} };
    const handleThemeChange = (element) => { const theme = element.dataset.theme; localStorage.setItem('appTheme', theme); applyTheme(theme); updateDashboard(); };
    const loadBusinessInfo = () => { const info = JSON.parse(localStorage.getItem('businessInfo')); if (info) { Object.keys(info).forEach(key => { const el = document.getElementById(`business-${key}`); if (el) el.value = info[key]; }); } };
    const saveBusinessInfo = (e) => { e.preventDefault(); const info = {}; new FormData(e.target).forEach((value, key) => info[key] = value.replace('business-','')); localStorage.setItem('businessInfo', JSON.stringify(info)); alert('Informações salvas!'); };
    const clearAllData = () => { if (confirm('ATENÇÃO! Deseja apagar TODOS os dados salvos?')) { localStorage.removeItem('crmLeads'); localStorage.removeItem('crmCaixa'); localStorage.removeItem('crmEstoque'); leads=[];caixa=[];estoque=[];nextLeadId=0;nextEstoqueId=0; renderAllDynamicContent();} };

    // --- LÓGICA DE LEADS E KANBAN ---
    const addLead = (e) => { e.preventDefault(); const newLead = { id: nextLeadId++, status: 'novo' }; new FormData(e.target).forEach((value, key) => newLead[key] = value); leads.push(newLead); saveDataToLocalStorage(); renderAllDynamicContent(); e.target.reset(); };
    const updateLead = (e) => { e.preventDefault(); const lead = leads.find(l => l.id === currentLeadId); if (lead) { new FormData(e.target).forEach((value, key) => lead[key] = value); saveDataToLocalStorage(); renderAllDynamicContent(); document.getElementById('edit-lead-modal').style.display = 'none'; } };
    const deleteLead = (leadId) => { leads = leads.filter(l => l.id !== leadId); saveDataToLocalStorage(); renderAllDynamicContent(); };
    const deleteLeadFromModal = () => { if (confirm('Tem certeza?')) { deleteLead(currentLeadId); document.getElementById('edit-lead-modal').style.display = 'none'; } };
    const openEditModal = (leadId) => { const lead = leads.find(l => l.id === leadId); if (lead) { currentLeadId = leadId; const form = document.getElementById('edit-lead-form'); new FormData(form).forEach((_, key) => { const input = form.querySelector(`[name="${key}"]`); if (input) input.value = lead[key] || ''; }); document.getElementById('edit-lead-modal').style.display = 'flex'; } };
    const handleDragStart = (e) => { if (e.target.classList.contains('kanban-card')) { draggedItem = e.target; setTimeout(() => e.target.style.opacity = '0.5', 0); } };
    const handleDragEnd = () => { if (draggedItem) { draggedItem.style.opacity = '1'; draggedItem = null; } };
    const handleDrop = (e) => { const column = e.target.closest('.kanban-column'); if (column && draggedItem) { const leadId = parseInt(draggedItem.dataset.id); const newStatus = column.dataset.status; const lead = leads.find(l => l.id === leadId); if (lead && lead.status !== newStatus) { lead.status = newStatus; saveDataToLocalStorage(); renderAllDynamicContent(); } } };
    
    // --- LÓGICA FINANCEIRA E ESTOQUE ---
    const addCaixaMovement = (e) => { e.preventDefault(); const form = e.target; const movement = { data: form.querySelector('#caixa-data').value, descricao: form.querySelector('#caixa-descricao').value, valor: parseFloat(form.querySelector('#caixa-valor').value), tipo: form.querySelector('#caixa-tipo').value, observacoes: form.querySelector('#caixa-observacoes').value }; caixa.push(movement); saveDataToLocalStorage(); renderCaixaTable(); form.reset(); };
    const addEstoqueItem = (e) => { e.preventDefault(); const form = e.target; const newItem = { id: nextEstoqueId++, produto: form.produto.value, descricao: form.descricao.value, compra: parseFloat(form.compra.value) || 0, venda: parseFloat(form.venda.value) || 0, custos: [] }; estoque.push(newItem); saveDataToLocalStorage(); renderEstoqueTable(); form.reset(); };
    const addCustoToProduto = (e) => { e.preventDefault(); const form = e.target; const produtoId = parseInt(form.querySelector('#add-custo-produto-id').value); const produto = estoque.find(p => p.id === produtoId); if (produto) { produto.custos.push({ descricao: form.querySelector('#custo-descricao').value, valor: parseFloat(form.querySelector('#custo-valor').value) }); saveDataToLocalStorage(); renderEstoqueTable(); } form.reset(); document.getElementById('add-custo-modal').style.display = 'none'; };
    const openAddCustoModal = (btn) => { const produtoId = btn.closest('tr').dataset.id; document.getElementById('add-custo-produto-id').value = produtoId; document.getElementById('add-custo-modal').style.display = 'flex'; };
    const deleteProduto = (btn) => { if (confirm('Excluir este produto?')) { const produtoId = parseInt(btn.closest('tr').dataset.id); estoque = estoque.filter(p => p.id !== produtoId); saveDataToLocalStorage(); renderEstoqueTable(); } };
    const handleImportEstoque = (e) => { if (typeof XLSX === 'undefined') { alert("Biblioteca de importação não carregada."); return; } const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event) => { try { const data = event.target.result; const workbook = XLSX.read(data, { type: 'binary' }); const sheetName = workbook.SheetNames[0]; const sheet = workbook.Sheets[sheetName]; const json = XLSX.utils.sheet_to_json(sheet); const newEstoque = parseEstoqueData(json); estoque.push(...newEstoque); saveDataToLocalStorage(); renderEstoqueTable(); alert('Dados importados!'); } catch (error) { alert("Erro ao ler o arquivo."); } }; reader.readAsBinaryString(file); e.target.value = ''; };
    const parseEstoqueData = (json) => json.map(row => ({ id: nextEstoqueId++, produto: row['Produto'] || '', descricao: row['Descrição'] || '', compra: parseFloat(String(row['Valor de Compra']).replace(',', '.')) || 0, venda: parseFloat(String(row['Valor de Venda']).replace(',', '.')) || 0, custos: [] }));
    const handleExportEstoque = () => { if (typeof XLSX === 'undefined') { alert("Biblioteca de exportação não carregada."); return; } if (estoque.length === 0) { alert("Não há dados para exportar."); return; } const dataToExport = estoque.map(item => ({ "Produto": item.produto, "Descrição": item.descricao, "Valor de Compra": item.compra, "Valor de Venda": item.venda, })); const worksheet = XLSX.utils.json_to_sheet(dataToExport); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque"); XLSX.writeFile(workbook, "estoque_pixelup.xlsx"); };
    const exportLeadsToExcel = () => { if (typeof XLSX === 'undefined') { alert("Biblioteca de exportação não carregada."); return; } const worksheet = XLSX.utils.json_to_sheet(leads); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "Leads"); XLSX.writeFile(workbook, "leads_crm.xlsx"); };
    
    // ... (restante das funções de renderização e update do dashboard)

    initializeApp();
});
