document.addEventListener('DOMContentLoaded', () => {

    // --- ARRAYS DE DADOS GLOBAIS ---
    let leads = [];
    let caixa = [];
    let estoque = [];
    let nextLeadId = 0;
    let nextEstoqueId = 0;
    let statusChart;
    let currentLeadId = null;

    // --- INICIALIZAÇÃO DA APLICAÇÃO ---
    function initializeApp() {
        loadDataFromLocalStorage();
        setupEventListeners();
        renderAll();
    }

    // --- CARREGAR E SALVAR DADOS ---
    function loadDataFromLocalStorage() {
        loadTheme();
        loadUserName();
        loadBusinessInfo();
        leads = JSON.parse(localStorage.getItem('crmLeads')) || [];
        caixa = JSON.parse(localStorage.getItem('crmCaixa')) || [];
        estoque = JSON.parse(localStorage.getItem('crmEstoque')) || [];
        nextLeadId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 0;
        nextEstoqueId = estoque.length > 0 ? Math.max(...estoque.map(p => p.id)) + 1 : 0;
    }

    function saveDataToLocalStorage() {
        localStorage.setItem('crmLeads', JSON.stringify(leads));
        localStorage.setItem('crmCaixa', JSON.stringify(caixa));
        localStorage.setItem('crmEstoque', JSON.stringify(estoque));
    }

    // --- CONFIGURAÇÃO DOS EVENTOS ---
    function setupEventListeners() {
        document.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', handleNavigation));
        document.querySelector('.theme-switcher').addEventListener('click', handleThemeChange);
        document.getElementById('save-user-name-btn').addEventListener('click', saveUserName);
        document.getElementById('business-info-form').addEventListener('submit', saveBusinessInfo);
        document.getElementById('clear-all-data-btn').addEventListener('click', clearAllData);
        document.getElementById('lead-form').addEventListener('submit', addLead);
        document.querySelector('#leads-table tbody').addEventListener('click', handleLeadTableActions);
        document.getElementById('edit-lead-form').addEventListener('submit', updateLead);
        document.getElementById('delete-lead-btn').addEventListener('click', deleteLeadFromModal);
        document.getElementById('export-excel-btn').addEventListener('click', exportLeadsToExcel);
        document.querySelectorAll('.finance-tab').forEach(tab => tab.addEventListener('click', handleFinanceTab));
        document.getElementById('caixa-form').addEventListener('submit', addCaixaMovement);
        document.getElementById('estoque-form').addEventListener('submit', addEstoqueItem);
        document.querySelector('#estoque-table tbody').addEventListener('click', handleEstoqueTableActions);
        document.getElementById('estoque-search').addEventListener('input', renderEstoqueTable);
        
        // --- CORREÇÃO: EVENTOS DE IMPORTAÇÃO E EXPORTAÇÃO ---
        document.getElementById('import-estoque-file').addEventListener('change', handleImportEstoque);
        document.getElementById('export-estoque-btn').addEventListener('click', handleExportEstoque);

        document.getElementById('add-custo-form').addEventListener('submit', addCustoToProduto);
        document.querySelectorAll('.modulos-menu-item').forEach(item => item.addEventListener('click', handleModuloNavigation));
    }

    // --- RENDERIZAÇÃO GERAL ---
    function renderAll() {
        updateDashboard();
        renderLeadsTable();
        renderCaixaTable();
        renderEstoqueTable();
    }
    
    // --- NAVEGAÇÃO E UI ---
    function handleNavigation(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('data-target');
        if (!targetId) return;
        document.getElementById('page-title').textContent = e.currentTarget.querySelector('span').textContent;
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.querySelectorAll('.content-area').forEach(area => area.classList.remove('active'));
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
    function clearAllData() { if (confirm('ATENÇÃO! Deseja apagar TODOS os dados salvos?')) { leads = []; caixa = []; estoque = []; saveDataToLocalStorage(); loadDataFromLocalStorage(); renderAll(); } }

    // --- LÓGICA DE LEADS ---
    function addLead(e) { e.preventDefault(); const newLead = { id: nextLeadId++, status: 'novo' }; new FormData(e.target).forEach((value, key) => newLead[key] = value); leads.push(newLead); saveDataToLocalStorage(); renderAll(); e.target.reset(); }
    function updateLead(e) { e.preventDefault(); const lead = leads.find(l => l.id === currentLeadId); if (lead) { new FormData(e.target).forEach((value, key) => lead[key] = value); saveDataToLocalStorage(); renderAll(); document.getElementById('edit-lead-modal').style.display = 'none'; } }
    function deleteLead(leadId) { leads = leads.filter(l => l.id !== leadId); saveDataToLocalStorage(); renderAll(); }
    function deleteLeadFromModal() { if (confirm('Tem certeza?')) { deleteLead(currentLeadId); document.getElementById('edit-lead-modal').style.display = 'none'; } }
    function openEditModal(leadId) { const lead = leads.find(l => l.id === leadId); if (lead) { currentLeadId = leadId; const form = document.getElementById('edit-lead-form'); new FormData(form).forEach((_, key) => { const input = form.querySelector(`[name="${key}"]`); if (input) input.value = lead[key] || ''; }); document.getElementById('edit-lead-modal').style.display = 'flex'; } }
    function handleLeadTableActions(e) { const editBtn = e.target.closest('.btn-edit-table'); const deleteBtn = e.target.closest('.btn-delete-table'); if (editBtn) openEditModal(parseInt(editBtn.closest('tr').dataset.id)); if (deleteBtn) if (confirm('Tem certeza?')) deleteLead(parseInt(deleteBtn.closest('tr').dataset.id)); }

    // --- LÓGICA FINANCEIRA E ESTOQUE ---
    function addCaixaMovement(e) { e.preventDefault(); const form = e.target; const movement = { data: form['caixa-data'].value, descricao: form['caixa-descricao'].value, valor: parseFloat(form['caixa-valor'].value), tipo: form['caixa-tipo'].value, observacoes: form['caixa-observacoes'].value }; caixa.push(movement); saveDataToLocalStorage(); renderCaixaTable(); form.reset(); }
    function addEstoqueItem(e) { e.preventDefault(); const form = e.target; const newItem = { id: nextEstoqueId++, produto: form.produto.value, descricao: form.descricao.value, compra: parseFloat(form.compra.value) || 0, venda: parseFloat(form.venda.value) || 0, custos: [] }; estoque.push(newItem); saveDataToLocalStorage(); renderEstoqueTable(); form.reset(); }
    function addCustoToProduto(e) { e.preventDefault(); const form = e.target; const produtoId = parseInt(form['add-custo-produto-id'].value); const produto = estoque.find(p => p.id === produtoId); if (produto) { produto.custos.push({ descricao: form['custo-descricao'].value, valor: parseFloat(form['custo-valor'].value) }); saveDataToLocalStorage(); renderEstoqueTable(); } form.reset(); document.getElementById('add-custo-modal').style.display = 'none'; }
    function handleEstoqueTableActions(e) { const addCustoBtn = e.target.closest('.btn-add-custo'); const deleteBtn = e.target.closest('.btn-delete-produto'); if (addCustoBtn) { const produtoId = addCustoBtn.closest('tr').dataset.id; document.getElementById('add-custo-produto-id').value = produtoId; document.getElementById('add-custo-modal').style.display = 'flex'; } if (deleteBtn) { if (confirm('Excluir este produto?')) { const produtoId = parseInt(deleteBtn.closest('tr').dataset.id); estoque = estoque.filter(p => p.id !== produtoId); saveDataToLocalStorage(); renderEstoqueTable(); } } }

    // --- LÓGICA DE IMPORTAÇÃO E EXPORTAÇÃO DE ESTOQUE ---
    function handleImportEstoque(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet);
            const newEstoque = parseEstoqueData(json);
            estoque = [...estoque, ...newEstoque]; // Adiciona ao invés de substituir
            saveDataToLocalStorage();
            renderEstoqueTable();
            alert('Dados importados com sucesso!');
        };
        reader.readAsBinaryString(file);
    }
    
    function parseEstoqueData(json) {
        return json.map(row => ({
            id: nextEstoqueId++,
            produto: row['Produto'] || '',
            descricao: row['Descrição'] || '',
            compra: parseFloat(row['Valor de Compra']) || 0,
            venda: parseFloat(row['Valor de Venda']) || 0,
            custos: [] // A importação básica não inclui custos detalhados
        }));
    }

    function handleExportEstoque() {
        const dataToExport = estoque.map(item => {
            const totalCustos = item.custos.reduce((sum, custo) => sum + custo.valor, 0);
            const lucro = item.venda - (item.compra + totalCustos);
            return {
                "Produto": item.produto,
                "Descrição": item.descricao,
                "Valor de Compra": item.compra,
                "Valor de Venda": item.venda,
                "Custos Totais": totalCustos,
                "Lucro": lucro,
                "Custos Detalhados": item.custos.map(c => `${c.descricao}: ${c.valor}`).join('; ')
            };
        });
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque");
        XLSX.writeFile(workbook, "estoque_pixelup.xlsx");
    }

    // --- RENDERIZAÇÃO ---
    function renderEstoqueTable() { const tbody = document.querySelector('#estoque-table tbody'); tbody.innerHTML = ''; const searchTerm = document.getElementById('estoque-search').value.toLowerCase(); const filteredEstoque = estoque.filter(p => p.produto.toLowerCase().includes(searchTerm) || p.descricao.toLowerCase().includes(searchTerm)); filteredEstoque.forEach(produto => { const totalCustos = produto.custos.reduce((sum, c) => sum + c.valor, 0); const lucro = produto.venda - (produto.compra + totalCustos); const custosHtml = produto.custos.length > 0 ? `<ul class="custos-list">${produto.custos.map(c => `<li>${c.descricao}: R$ ${c.valor.toFixed(2)}</li>`).join('')}</ul>` : '<small>Nenhum</small>'; const row = tbody.insertRow(); row.dataset.id = produto.id; row.innerHTML = `<td>${produto.produto}</td><td>${produto.descricao}</td><td>R$ ${produto.compra.toFixed(2)}</td><td>${custosHtml}</td><td>R$ ${produto.venda.toFixed(2)}</td><td>R$ ${lucro.toFixed(2)}</td><td class="table-actions"><button class="btn-add-custo" title="Adicionar Custo"><i class="ph-fill ph-plus-circle"></i></button><button class="btn-delete-produto" title="Excluir"><i class="ph-fill ph-trash"></i></button></td>`; }); }
    function renderCaixaTable() { const tbody = document.querySelector('#caixa-table tbody'); tbody.innerHTML = ''; const totalEntradas = caixa.filter(m => m.tipo === 'entrada').reduce((acc, m) => acc + m.valor, 0); const totalSaidas = caixa.filter(m => m.tipo === 'saida').reduce((acc, m) => acc + m.valor, 0); document.getElementById('total-entradas').textContent = `R$ ${totalEntradas.toFixed(2)}`; document.getElementById('total-saidas').textContent = `R$ ${totalSaidas.toFixed(2)}`; document.getElementById('caixa-atual').textContent = `R$ ${(totalEntradas - totalSaidas).toFixed(2)}`; caixa.forEach(mov => { const row = tbody.insertRow(); row.innerHTML = `<td>${mov.data}</td><td>${mov.descricao}</td><td class="entrada">${mov.tipo === 'entrada' ? `R$ ${mov.valor.toFixed(2)}` : ''}</td><td class="saida">${mov.tipo === 'saida' ? `R$ ${mov.valor.toFixed(2)}` : ''}</td><td>${mov.observacoes}</td>`; }); }
    function renderLeadsTable() { const tbody = document.querySelector('#leads-table tbody'); tbody.innerHTML = ''; leads.forEach(lead => { const row = tbody.insertRow(); row.dataset.id = lead.id; row.innerHTML = `<td>${lead.nome}</td><td>${lead.whatsapp}</td><td>${lead.origem}</td><td>${lead.qualificacao}</td><td>${lead.status}</td><td class="table-actions"><button class="btn-edit-table" title="Editar"><i class="ph-fill ph-note-pencil"></i></button><button class="btn-delete-table" title="Excluir"><i class="ph-fill ph-trash"></i></button></td>`; }); }

    // --- DASHBOARD ---
    function updateDashboard() { const totalLeads = leads.length; const leadsNovo = leads.filter(l => l.status === 'novo').length; const leadsProgresso = leads.filter(l => l.status === 'progresso').length; const leadsFechado = leads.filter(l => l.status === 'fechado').length; document.getElementById('total-leads').textContent = totalLeads; document.getElementById('leads-novo').textContent = leadsNovo; document.getElementById('leads-progresso').textContent = leadsProgresso; document.getElementById('leads-fechado').textContent = leadsFechado; updateStatusChart(leadsNovo, leadsProgresso, leadsFechado); }
    function updateStatusChart(novo, progresso, fechado) { const ctx = document.getElementById('statusChart').getContext('2d'); if (statusChart) statusChart.destroy(); const chartTextColor = document.body.dataset.theme === 'light' ? '#212529' : '#cdd6f4'; const chartBgColor = document.body.dataset.theme === 'light' ? '#fff' : '#0d1117'; statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Em Progresso', 'Fechado'], datasets: [{ data: [novo, progresso, fechado], backgroundColor: ['#007bff', '#ffc107', '#28a745'], borderColor: chartBgColor, borderWidth: 3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: chartTextColor, font: { size: 14 } } } } } }); }

    initializeApp();
});
