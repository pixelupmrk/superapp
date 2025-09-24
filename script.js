// Espera todo o HTML carregar antes de executar o script
document.addEventListener('DOMContentLoaded', () => {
    // Carrega o conteúdo dos módulos do arquivo data.json
    loadModules();

    // Configura a navegação entre as seções (Módulos e Configurações)
    setupNavigation();

    // Configura o seletor de tema (claro/escuro)
    setupThemeSwitcher();

    // Configura o salvamento das informações da empresa
    setupBusinessInfo();
});

// Função para carregar e exibir os módulos de Aceleração de Vendas
async function loadModules() {
    const menu = document.querySelector('#modulos-menu ul');
    const contentArea = document.getElementById('modulos-content');
    
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        const modules = data.aceleracao_vendas;

        if (!modules) {
            menu.innerHTML = '<li>Erro ao carregar módulos.</li>';
            return;
        }

        // Limpa o menu antes de adicionar os novos itens
        menu.innerHTML = '';

        // Cria um item de menu para cada módulo
        modules.forEach((module, index) => {
            const menuItem = document.createElement('li');
            menuItem.className = 'modulos-menu-item';
            menuItem.textContent = module.title;
            menuItem.dataset.moduleId = module.moduleId;

            // Adiciona evento de clique para mostrar o conteúdo do módulo
            menuItem.addEventListener('click', () => {
                // Remove a classe 'active' de outros itens e a adiciona no clicado
                document.querySelectorAll('.modulos-menu-item').forEach(item => item.classList.remove('active'));
                menuItem.classList.add('active');
                displayModuleContent(module);
            });

            menu.appendChild(menuItem);

            // Deixa o primeiro módulo ativo por padrão
            if (index === 0) {
                menuItem.click();
            }
        });

    } catch (error) {
        console.error('Falha ao buscar o arquivo data.json:', error);
        menu.innerHTML = '<li>Não foi possível carregar o conteúdo.</li>';
    }
}

// Função para exibir o conteúdo detalhado de um módulo
function displayModuleContent(module) {
    const contentArea = document.getElementById('modulos-content');
    let contentHTML = `
        <div class="card">
            <h2>${module.title}</h2>
            <p>${module.description}</p>
        </div>
    `;

    module.lessons.forEach(lesson => {
        contentHTML += `
            <div class="card section">
                <h3>${lesson.title}</h3>
                <p>${lesson.content || lesson.description}</p>
                ${lesson.type === 'video' ? '<p><i>(Conteúdo em vídeo)</i></p>' : ''}
                ${lesson.type === 'interactive' ? '<button class="btn-save">Iniciar Exercício</button>' : ''}
            </div>
        `;
    });

    contentArea.innerHTML = contentHTML;
}

// Função para configurar a navegação principal (abas)
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentAreas = document.querySelectorAll('.content-area');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Gerencia a classe 'active' nos botões de navegação
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Mostra a área de conteúdo correspondente
            const targetId = item.dataset.target;
            contentAreas.forEach(area => {
                area.classList.remove('active');
                if (area.id === targetId) {
                    area.classList.add('active');
                }
            });
        });
    });
}

// Função para gerenciar o tema claro e escuro
function setupThemeSwitcher() {
    const lightThemeBtn = document.getElementById('theme-light');
    const darkThemeBtn = document.getElementById('theme-dark');
    const body = document.body;

    // Função para aplicar o tema
    const applyTheme = (theme) => {
        body.dataset.theme = theme;
        localStorage.setItem('app-theme', theme); // Salva a preferência
        
        // Atualiza a aparência dos botões
        lightThemeBtn.classList.toggle('active', theme === 'light');
        darkThemeBtn.classList.toggle('active', theme === 'dark');
    };

    // Eventos de clique nos botões
    lightThemeBtn.addEventListener('click', () => applyTheme('light'));
    darkThemeBtn.addEventListener('click', () => applyTheme('dark'));

    // Carrega o tema salvo ao iniciar a página
    const savedTheme = localStorage.getItem('app-theme') || 'dark'; // Padrão escuro
    applyTheme(savedTheme);
}

// Função para salvar e carregar as informações da empresa
function setupBusinessInfo() {
    const saveBtn = document.getElementById('save-business-info');
    const nameInput = document.getElementById('business-name');
    const emailInput = document.getElementById('business-email');
    const phoneInput = document.getElementById('business-phone');

    // Salva as informações no localStorage quando o botão é clicado
    saveBtn.addEventListener('click', () => {
        const info = {
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
        };
        localStorage.setItem('business-info', JSON.stringify(info));
        alert('Informações da empresa salvas com sucesso!');
    });

    // Carrega as informações salvas ao iniciar a página
    const savedInfo = localStorage.getItem('business-info');
    if (savedInfo) {
        const info = JSON.parse(savedInfo);
        nameInput.value = info.name || '';
        emailInput.value = info.email || '';
        phoneInput.value = info.phone || '';
    }
}
