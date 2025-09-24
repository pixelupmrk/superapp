// Espera todo o HTML carregar antes de executar o script
document.addEventListener('DOMContentLoaded', () => {
    loadModules();
    setupNavigation();
    setupThemeSwitcher();
    setupBusinessInfo();
});

// Função para carregar e exibir os módulos de Aceleração de Vendas
async function loadModules() {
    const menu = document.querySelector('#modulos-menu ul');
    
    try {
        // Tenta buscar o arquivo data.json
        const response = await fetch('data.json');
        if (!response.ok) { // Verifica se o arquivo foi encontrado
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Agora busca pela chave correta: "aceleracao_vendas"
        const modules = data.aceleracao_vendas;

        if (!modules) {
            menu.innerHTML = '<li>Chave "aceleracao_vendas" não encontrada no JSON.</li>';
            return;
        }

        menu.innerHTML = ''; // Limpa o menu

        // Cria um item de menu para cada módulo
        modules.forEach((module, index) => {
            const menuItem = document.createElement('li');
            menuItem.className = 'modulos-menu-item';
            menuItem.textContent = module.title;
            menuItem.dataset.moduleId = module.moduleId;

            // Adiciona evento de clique para mostrar o conteúdo do módulo
            menuItem.addEventListener('click', () => {
                document.querySelectorAll('.modulos-menu-item').forEach(item => item.classList.remove('active'));
                menuItem.classList.add('active');
                displayModuleContent(module);
            });

            menu.appendChild(menuItem);

            // Ativa o primeiro módulo por padrão
            if (index === 0) {
                menuItem.click();
            }
        });

    } catch (error) {
        console.error('Falha ao carregar ou processar o data.json:', error);
        menu.innerHTML = '<li>Erro ao carregar módulos. Verifique o console.</li>';
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

    if (module.lessons && module.lessons.length > 0) {
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
    }

    contentArea.innerHTML = contentHTML;
}

// Função para configurar a navegação principal (abas)
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentAreas = document.querySelectorAll('.content-area');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

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

    const applyTheme = (theme) => {
        body.dataset.theme = theme;
        localStorage.setItem('app-theme', theme);
        lightThemeBtn.classList.toggle('active', theme === 'light');
        darkThemeBtn.classList.toggle('active', theme === 'dark');
    };

    lightThemeBtn.addEventListener('click', () => applyTheme('light'));
    darkThemeBtn.addEventListener('click', () => applyTheme('dark'));

    const savedTheme = localStorage.getItem('app-theme') || 'dark';
    applyTheme(savedTheme);
}

// Função para salvar e carregar as informações da empresa
function setupBusinessInfo() {
    const saveBtn = document.getElementById('save-business-info');
    const nameInput = document.getElementById('business-name');
    const emailInput = document.getElementById('business-email');
    const phoneInput = document.getElementById('business-phone');

    saveBtn.addEventListener('click', () => {
        const info = {
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
        };
        localStorage.setItem('business-info', JSON.stringify(info));
        alert('Informações da empresa salvas com sucesso!');
    });

    const savedInfo = localStorage.getItem('business-info');
    if (savedInfo) {
        const info = JSON.parse(savedInfo);
        nameInput.value = info.name || '';
        emailInput.value = info.email || '';
        phoneInput.value = info.phone || '';
    }
}
