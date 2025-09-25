document.addEventListener('DOMContentLoaded', () => {

    // --- SEU CÓDIGO JAVASCRIPT ORIGINAL COMPLETO VEM AQUI ---
    // (Copie e cole aqui todo o conteúdo do seu javamentoriaok.txt, desde o início até ao fim)

    // --- LÓGICA DA MENTORIA RENOMEADA PARA ACELERAÇÃO ---
    // (No seu código, encontre a secção 'NOVA LÓGICA PARA A SEÇÃO DE MENTORIA' e substitua por isto)
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

    // --- NOVA LÓGICA ADICIONAL PARA A PÁGINA DE CONFIGURAÇÕES ---
    // (Adicione esta função no final do seu ficheiro, antes do último '});')
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

        // Carregar dados salvos
        const savedTheme = localStorage.getItem('appTheme') || 'dark';
        applyTheme(savedTheme);
        nameInput.value = localStorage.getItem('businessName') || '';
        emailInput.value = localStorage.getItem('businessEmail') || '';
        phoneInput.value = localStorage.getItem('businessPhone') || '';
        updateUserGreeting();
    }

    // Inicializa a nova função
    setupSettings();
});
