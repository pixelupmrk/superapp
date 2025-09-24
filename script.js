document.addEventListener('DOMContentLoaded', () => {
    
    // COLE AQUI TODO O CÓDIGO DO SEU ARQUIVO `javamentoriaok.txt`
    // (Desde o início, com a lógica de leads, kanban, financeiro, etc.)

    // DEPOIS DE COLAR TODO O SEU CÓDIGO, ADICIONE AS FUNÇÕES ABAIXO NO FINAL,
    // DENTRO DO `DOMContentLoaded`

    // --- LÓGICA PARA CARREGAR MÓDULOS DE ACELERAÇÃO ---
    async function loadAceleracaoModules() {
        const menu = document.querySelector('#aceleracao-menu ul');
        const contentArea = document.getElementById('aceleracao-content');
        
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            const modules = data.aceleracao_vendas;

            if (!modules) {
                menu.innerHTML = '<li>Erro ao carregar módulos.</li>';
                return;
            }
            menu.innerHTML = '';
            modules.forEach((module, index) => {
                const menuItem = document.createElement('li');
                menuItem.className = 'aceleracao-menu-item';
                menuItem.textContent = module.title;
                menuItem.addEventListener('click', () => {
                    document.querySelectorAll('.aceleracao-menu-item').forEach(item => item.classList.remove('active'));
                    menuItem.classList.add('active');
                    displayModuleContent(module, contentArea);
                });
                menu.appendChild(menuItem);
                if (index === 0) menuItem.click();
            });
        } catch (error) {
            console.error('Falha ao carregar data.json:', error);
            menu.innerHTML = '<li>Conteúdo indisponível.</li>';
        }
    }

    function displayModuleContent(module, contentArea) {
        let html = `<div class="card"><h2>${module.title}</h2><p>${module.description}</p></div>`;
        if (module.lessons) {
            module.lessons.forEach(lesson => {
                html += `<div class="card section"><h3>${lesson.title}</h3><p>${lesson.content || lesson.description}</p></div>`;
            });
        }
        contentArea.innerHTML = html;
    }

    // --- LÓGICA PARA A PÁGINA DE CONFIGURAÇÕES ---
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

    // Inicializa as novas funções
    loadAceleracaoModules();
    setupSettings();
});
