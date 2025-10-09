document.addEventListener('DOMContentLoaded', () => {
    // 🔧 Variáveis globais
    let leads = [];
    let db;
    let unsubscribeLeads;
    let unsubscribeLeadChat;
    let currentUserId;
    let currentLeadId = null;
    let botUrl = null;

    if (typeof firebase === 'undefined') {
        console.error("❌ Firebase não carregado!");
        return;
    }

    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                currentUserId = user.uid;
                db = firebase.firestore();
                await loadInitialData(currentUserId);
                setupEventListeners(currentUserId);
                setupRealtimeListeners(currentUserId);
                // Carrega os módulos de venda uma vez ao iniciar
                loadSalesAcceleratorModules();
            }
        });
    }
    main();

    function setupEventListeners(userId) {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', e => {
                if (e.currentTarget.id === 'logout-btn') return;
                e.preventDefault();
                const targetId = e.currentTarget.getAttribute('data-target');
                if (!targetId) return;
                
                // Usa classes para mostrar/esconder
                document.querySelectorAll('.main-content .content-area').forEach(area => area.classList.remove('active'));
                document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => nav.classList.remove('active'));
                
                e.currentTarget.classList.add('active');
                const targetElement = document.getElementById(targetId);
                if (targetElement) targetElement.classList.add('active');
                
                if (targetId === 'crm-list-section') {
                    renderLeadsTable();
                }
                
                const pageTitle = document.getElementById('page-title');
                if(pageTitle && e.currentTarget.querySelector('span')) {
                    pageTitle.textContent = e.currentTarget.querySelector('span').textContent;
                }
            });
        });

        const kanbanBoard = document.getElementById('kanban-board');
        if (kanbanBoard) {
            kanbanBoard.addEventListener('click', e => {
                const card = e.target.closest('.kanban-card');
                if (card && card.dataset.id) {
                    openChatForLead(card.dataset.id, userId);
                }
            });
        }
        
        // Listeners dos formulários (chat e edição)
        document.getElementById('lead-chat-form')?.addEventListener('submit', async (e) => { e.preventDefault(); /* ...código original... */ });
        document.getElementById('edit-lead-form')?.addEventListener('submit', async (e) => { e.preventDefault(); /* ...código original... */ });
    }
    
    // NOVA FUNÇÃO para carregar o conteúdo do Acelerador de Vendas
    async function loadSalesAcceleratorModules() {
        const container = document.getElementById('accelerator-modules-container');
        if (!container) return;

        try {
            // Usa o arquivo data.json que você forneceu
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('Não foi possível carregar o arquivo data.json');
            const data = await response.json();
            
            // Verifica se a estrutura esperada existe
            const modules = data.aceleracao_vendas; // Usando a chave do seu arquivo
            if (!modules) {
                 container.innerHTML = '<p style="color:red;">Erro: A estrutura "aceleracao_vendas" não foi encontrada no arquivo JSON.</p>';
                 return;
            }

            container.innerHTML = ''; // Limpa o container
            modules.forEach(module => {
                const moduleEl = document.createElement('div');
                moduleEl.className = 'card';
                
                let lessonsHtml = module.lessons.map(lesson => `<li><strong>${lesson.title}</strong>: ${lesson.content}</li>`).join('');

                moduleEl.innerHTML = `
                    <h3>${module.title}</h3>
                    <p>${module.description}</p>
                    <ul>${lessonsHtml}</ul>
                `;
                container.appendChild(moduleEl);
            });

        } catch (error) {
            console.error("Erro ao carregar módulos de vendas:", error);
            container.innerHTML = `<p style="color:red;">Falha ao carregar conteúdo do acelerador: ${error.message}</p>`;
        }
    }


    // --- Funções do CRM, Chat, etc. (sem alterações) ---
    function setupRealtimeListeners(userId) { /* ...código original... */ }
    async function loadInitialData(userId) { /* ...código original... */ }
    function renderKanbanCards() { /* ...código original... */ }
    function renderLeadsTable() { /* ...código original... */ }
    async function openChatForLead(leadId, userId) { /* ...código original... */ }
    async function analyzeLeadMessageWithAI(leadId, message, userId) { /* ...código original... */ }
    function renderChatMessage(sender, text) { /* ...código original... */ }
});

// Cole as funções originais que foram omitidas para manter a clareza
// (setupRealtimeListeners, loadInitialData, etc.) aqui.
// O código acima é a estrutura principal e as novas adições.
