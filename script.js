// Script para carregar e exibir a mentoria do super app
// Por favor, garanta que o arquivo 'mentoria.json' esteja na pasta 'data' do seu projeto.

document.addEventListener('DOMContentLoaded', () => {
    const MENTORSHIP_DATA_URL = './data/mentoria.json';
    const mainContainer = document.getElementById('mentorship-main-container');

    // Estado simples da aplicação para controle de visualização
    let appState = {
        view: 'modules', // 'modules' ou 'lessons'
        selectedModule: null
    };

    // Função para carregar o conteúdo da mentoria
    async function loadMentorshipContent() {
        try {
            const response = await fetch(MENTORSHIP_DATA_URL);
            if (!response.ok) {
                throw new Error(`Erro ao carregar o arquivo: ${response.statusText}`);
            }
            const data = await response.json();
            
            // Renderiza a visualização inicial (lista de módulos)
            renderView(data.mentorship);

        } catch (error) {
            console.error('Ocorreu um erro ao carregar o conteúdo da mentoria:', error);
            if (mainContainer) {
                mainContainer.innerHTML = '<p>Não foi possível carregar o conteúdo da mentoria. Por favor, tente novamente mais tarde.</p>';
            }
        }
    }

    // Função para renderizar a visualização atual com base no estado
    function renderView(mentorshipData) {
        if (!mainContainer) {
            console.error("Elemento HTML 'mentorship-main-container' não encontrado.");
            return;
        }

        // Limpa o container para a nova renderização
        mainContainer.innerHTML = '';

        if (appState.view === 'modules') {
            renderModules(mentorshipData);
        } else if (appState.view === 'lessons' && appState.selectedModule) {
            renderLessons(appState.selectedModule);
        }
    }

    // Renderiza a lista de todos os módulos
    function renderModules(modules) {
        modules.forEach(module => {
            const moduleElement = document.createElement('div');
            moduleElement.classList.add('module-card');
            moduleElement.innerHTML = `
                <h2>${module.title}</h2>
                <p>${module.description}</p>
            `;
            moduleElement.addEventListener('click', () => {
                appState.view = 'lessons';
                appState.selectedModule = module;
                renderView();
            });
            mainContainer.appendChild(moduleElement);
        });
    }

    // Renderiza a lista de lições para um módulo específico
    function renderLessons(module) {
        // Cria um botão de voltar
        const backButton = document.createElement('button');
        backButton.textContent = '← Voltar para os Módulos';
        backButton.classList.add('back-button');
        backButton.addEventListener('click', () => {
            appState.view = 'modules';
            appState.selectedModule = null;
            renderView(mentorshipData); // Passa os dados novamente para a renderização
        });
        mainContainer.appendChild(backButton);

        // Renderiza o título do módulo
        const moduleTitle = document.createElement('h2');
        moduleTitle.textContent = module.title;
        mainContainer.appendChild(moduleTitle);

        // Renderiza cada lição do módulo
        module.lessons.forEach(lesson => {
            const lessonElement = document.createElement('div');
            lessonElement.classList.add('lesson-card');
            
            let contentHTML = `<p>${lesson.content}</p>`;
            if (lesson.type === 'video' && lesson.videoUrl) {
                contentHTML = `<p><strong>Assista ao vídeo:</strong> <a href="${lesson.videoUrl}" target="_blank">Clique aqui para ver a lição em vídeo.</a></p>`;
            } else if (lesson.type === 'interactive') {
                 contentHTML = `<p><strong>Exercício Prático:</strong> ${lesson.description}</p>`;
            }

            lessonElement.innerHTML = `
                <h3>${lesson.title}</h3>
                ${contentHTML}
            `;
            mainContainer.appendChild(lessonElement);
        });
    }

    // Inicia a aplicação carregando o conteúdo
    loadMentorshipContent();
});
