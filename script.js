document.addEventListener('DOMContentLoaded', () => {
    // Todas as suas funções originais (kanban, leads, financeiro) são mantidas
    // ...

    // --- LÓGICA ATUALIZADA PARA A SEÇÃO DE ACELERAÇÃO DE VENDAS ---
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
        // Lógica do Seletor de Tema
        const themeButtons = document.querySelectorAll('.btn-theme');
        const body = document.body;

        const applyTheme = (theme) => {
            body.dataset.theme = theme;
            localStorage.setItem('appTheme', theme);
            themeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === theme);
            });
        };

        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                applyTheme(button.dataset.theme);
            });
        });

        // Carrega o tema salvo ao iniciar
        const savedTheme = localStorage.getItem('appTheme') || 'dark';
        applyTheme(savedTheme);

        // Lógica do Formulário de Informações da Empresa
        const businessForm = document.getElementById('business-info-form');
        const nameInput = document.getElementById('business-name');
        const emailInput = document.getElementById('business-email');
        const phoneInput = document.getElementById('business-phone');

        businessForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const businessInfo = {
                name: nameInput.value,
                email: emailInput.value,
                phone: phoneInput.value,
            };
            localStorage.setItem('businessInfo', JSON.stringify(businessInfo));
            alert('Informações da empresa salvas com sucesso!');
        });

        // Carrega as informações salvas ao iniciar
        const savedInfo = JSON.parse(localStorage.getItem('businessInfo'));
        if (savedInfo) {
            nameInput.value = savedInfo.name || '';
            emailInput.value = savedInfo.email || '';
            phoneInput.value = savedInfo.phone || '';
        }
    }
    
    // Inicializa a nova função de configurações
    setupSettings();

}); // Fim do addEventListener 'DOMContentLoaded'
