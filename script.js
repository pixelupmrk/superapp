document.addEventListener('DOMContentLoaded', () => {
    // Estado da aplicação (dados)
    let leads = JSON.parse(localStorage.getItem('leads')) || [];
    let caixa = JSON.parse(localStorage.getItem('caixa')) || [];
    let estoque = JSON.parse(localStorage.getItem('estoque')) || [];
    let nextLeadId = localStorage.getItem('nextLeadId') || 0;

    // Função para salvar todos os dados no localStorage
    function saveData() {
        localStorage.setItem('leads', JSON.stringify(leads));
        localStorage.setItem('caixa', JSON.stringify(caixa));
        localStorage.setItem('estoque', JSON.stringify(estoque));
        localStorage.setItem('nextLeadId', nextLeadId);
    }

    // Lógica de Navegação Principal
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    const contentAreas = document.querySelectorAll('.main-content .content-area');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-target');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');

            contentAreas.forEach(area => area.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            
            pageTitle.textContent = e.currentTarget.querySelector('span').textContent;
        });
    });

    // Lógica de Configurações (Nome e Tema)
    const configUserNameInput = document.getElementById('config-user-name');
    const userNameDisplay = document.getElementById('user-name-display');
    const themeSwitcher = document.getElementById('theme-switcher');

    function loadSettings() {
        const savedName = localStorage.getItem('userName') || 'Usuário';
        userNameDisplay.textContent = `Olá, ${savedName}`;
        configUserNameInput.value = savedName;

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            themeSwitcher.checked = true;
        }
    }

    configUserNameInput.addEventListener('keyup', (e) => {
        const newName = e.target.value;
        userNameDisplay.textContent = `Olá, ${newName || 'Usuário'}`;
        localStorage.setItem('userName', newName);
    });

    themeSwitcher.addEventListener('change', () => {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', themeSwitcher.checked ? 'light' : 'dark');
    });
    
    // Inicialização
    loadSettings();

    // Lógica para Limpar Dados
    const clearAllDataBtn = document.getElementById('clear-all-data-btn');
    clearAllDataBtn.addEventListener('click', () => {
        if (confirm('ATENÇÃO! Isso apagará TODOS os dados (leads, financeiro, etc.). Esta ação não pode ser desfeita. Deseja continuar?')) {
            localStorage.clear();
            // Recarrega a página para zerar o estado, exceto tema
            const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            localStorage.setItem('theme', currentTheme);
            window.location.reload();
        }
    });
    
    // ... Aqui entrariam as lógicas do Dashboard, CRM, Financeiro, etc.
    // Para manter o código organizado, você pode colocar cada seção em sua própria função.
    // Exemplo:
    // function initDashboard() { ... }
    // function initCRM() { ... }
    // initDashboard();
    // initCRM();
});
