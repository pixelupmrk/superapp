document.addEventListener('DOMContentLoaded', () => {

    // --- SUA LÓGICA ORIGINAL DE CRM (KANBAN, LEADS, FINANCEIRO) ---
    // (Cole aqui toda a lógica do seu javamentoriaok.txt, exceto a parte final da "mentoria")


    // --- NOVA LÓGICA PARA NAVEGAÇÃO COMPLETA (INCLUI CONFIGURAÇÕES) ---
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    const contentAreas = document.querySelectorAll('.main-content .content-area');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-target');
            if (!targetId) return; // Ignora links sem data-target
            const targetText = e.currentTarget.querySelector('span').textContent;

            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');

            contentAreas.forEach(area => { area.style.display = 'none'; });
            document.getElementById(targetId).style.display = 'block';
            pageTitle.textContent = targetText;
        });
    });

    // --- NOVA LÓGICA PARA A SEÇÃO DE ACELERAÇÃO DE VENDAS ---
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

        themeButtons.forEach(button => {
            button.addEventListener('click', () => applyTheme(button.dataset.theme));
        });
        
        businessForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('businessName', nameInput.value);
            alert('Informações salvas!');
            updateUserGreeting();
        });

        // Carregar dados salvos na inicialização
        const savedTheme = localStorage.getItem('appTheme') || 'dark';
        applyTheme(savedTheme);
        updateUserGreeting();
        nameInput.value = localStorage.getItem('businessName') || '';
    }
    
    // Inicializa a nova função de configurações
    setupSettings();
});
