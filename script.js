document.addEventListener('DOMContentLoaded', () => {

    // --- SEU CÓDIGO JAVASCRIPT ORIGINAL COMPLETO VEM AQUI ---
    const leads = [];
    let nextLeadId = 0;
    let statusChart;
    let caixa = [];
    let estoque = [];
    let currentEstoqueDescricao = null;

    // Lógica para a navegação da sidebar (ATUALIZADA PARA INCLUIR CONFIGURAÇÕES)
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    const contentAreas = document.querySelectorAll('.main-content .content-area');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-target');
            if (!targetId) return;
            const targetText = e.currentTarget.querySelector('span').textContent;

            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');

            contentAreas.forEach(area => {
                area.style.display = 'none';
                area.classList.remove('active');
            });
            const targetArea = document.getElementById(targetId);
            if (targetArea) {
                targetArea.style.display = 'block';
                targetArea.classList.add('active');
                pageTitle.textContent = targetText;
            }

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
    
    // (O resto do seu código JS original vem aqui... Kanban, Leads, Financeiro, etc.)

    // --- LÓGICA DA MENTORIA RENOMEADA PARA ACELERAÇÃO ---
    const aceleracaoNavItems = document.querySelectorAll('.aceleracao-menu-item');
    const aceleracaoContentAreas = document.querySelectorAll('.aceleracao-module-content');

    aceleracaoNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-content');
            aceleracaoNavItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');
            aceleracaoContentAreas.forEach(area => {
                area.classList.remove('active');
                if (area.id === targetId) {
                    area.classList.add('active');
                }
            });
        });
    });

    // --- NOVA LÓGICA PARA A PÁGINA DE CONFIGURAÇÕES ---
    function setupSettings() {
        const themeButtons = document.querySelectorAll('.btn-theme');
        const body = document.body;
        const businessForm = document.getElementById('business-info-form');
        const nameInput = document.getElementById('business-name');
        const emailInput = document.getElementById('business-email');
        const phoneInput = document.getElementById('business-phone');
        const userGreeting = document.getElementById('user-greeting');

        const applyTheme = (theme) => {
            body.dataset.theme = theme;
            localStorage.setItem('appTheme', theme);
            themeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === theme));
        };

        const updateUserGreeting = () => {
            const savedName = localStorage.getItem('businessName');
            userGreeting.textContent = savedName ? `Olá, ${savedName}` : 'Olá, Usuário';
        };

        themeButtons.forEach(button => button.addEventListener('click', () => applyTheme(button.dataset.theme)));
        
        businessForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('businessName', nameInput.value);
            localStorage.setItem('businessEmail', emailInput.value);
            localStorage.setItem('businessPhone', phoneInput.value);
            alert('Informações da empresa salvas com sucesso!');
            updateUserGreeting();
        });

        // Carregar dados salvos na inicialização
        const savedTheme = localStorage.getItem('appTheme') || 'dark';
        applyTheme(savedTheme);
        nameInput.value = localStorage.getItem('businessName') || '';
        emailInput.value = localStorage.getItem('businessEmail') || '';
        phoneInput.value = localStorage.getItem('businessPhone') || '';
        updateUserGreeting();
    }
    
    // Inicialização
    updateDashboard(); // Sua função original
    setupSettings(); // Nova função de configurações
});
