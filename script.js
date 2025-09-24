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

    const renderStaticTemplates = () => {
        // Injeta o HTML inicial nas seções para garantir que os elementos existam
        document.getElementById('dashboard-section').innerHTML = `<div class="dashboard-stats"><div class="stat-card"><h3>Total de Leads</h3><p id="total-leads">0</p></div><div class="stat-card"><h3>Leads Novos</h3><p id="leads-novo">0</p></div><div class="stat-card"><h3>Leads em Progresso</h3><p id="leads-progresso">0</p></div><div class="stat-card"><h3>Leads Fechados</h3><p id="leads-fechado">0</p></div></div><div class="dashboard-charts"><div class="chart-card"><h3>Status dos Leads</h3><div class="chart-container"><canvas id="statusChart"></canvas></div></div></div>`;
        document.getElementById('crm-kanban-section').innerHTML = `<div class="card new-lead-card"><h2>Novo Lead</h2><form id="lead-form"><div class="input-grid"><input type="text" name="nome" placeholder="Nome" required><input type="email" name="email" placeholder="E-mail"><input type="tel" name="whatsapp" placeholder="WhatsApp" required><input type="text" name="atendente" placeholder="Atendente"><input type="text" name="origem" placeholder="Origem"><input type="date" name="data"><div class="select-group"><select name="qualificacao"><option value="">Qualificação</option><option value="quente">Lead Quente</option><option value="morno">Lead Morno</option><option value="frio">Lead Frio</option></select></div></div><textarea name="notas" placeholder="Notas"></textarea><button type="submit" class="btn-save">Salvar</button></form></div><div class="kanban-board" id="kanban-board"><div class="kanban-column" data-status="novo"><h3>Novo</h3><div class="kanban-cards-list"></div></div><div class="kanban-column" data-status="progresso"><h3>Em Progresso</h3><div class="kanban-cards-list"></div></div><div class="kanban-column" data-status="fechado"><h3>Fechado</h3><div class="kanban-cards-list"></div></div></div>`;
        // ... (Adicionar outros templates estáticos aqui)
    };
            
    // --- EVENTOS (ESTRUTURA À PROVA DE FALHAS) ---
    const setupEventListeners = () => {
        document.body.addEventListener('click', handleGlobalClick);
        
        document.getElementById('lead-form')?.addEventListener('submit', addLead);
        // ... (outros listeners de formulário)
    };
            
    const handleGlobalClick = (e) => {
        // ... (Lógica de delegação de eventos)
    };

    // --- LÓGICA DE NAVEGAÇÃO, LEADS, KANBAN, FINANCEIRO, ESTOQUE, CONFIGURAÇÕES, ETC ---
    // ... (Todo o restante do seu JavaScript funcional)

    initializeApp();
});
