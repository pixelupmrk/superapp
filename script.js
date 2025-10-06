document.addEventListener('DOMContentLoaded', () => {
    // --- DADOS DA MENTORIA ---
    const mentoriaData = [
        {
            "moduleId": "MD01",
            "title": "Módulo 1: Conectando com o Cliente Ideal",
            "lessons": [
                { "lessonId": "L01.01", "title": "Questionário para Definição de Persona", "type": "text", "content": "Antes de qualquer estratégia, é essencial saber com quem você está falando..." },
                { "lessonId": "L01.02", "title": "Proposta de Valor e Posicionamento", "type": "video", "content": "Com base na persona, vamos definir a proposta de valor do seu serviço..." },
                { "lessonId": "L01.03", "title": "Exercício Prático: Configurando o CRM", "type": "interactive", "description": "Este exercício prático irá guiá-lo a configurar o CRM do seu super app para a sua persona." }
            ]
        },
        {
            "moduleId": "MD02",
            "title": "Módulo 2: O Algoritmo da Meta (Facebook & Instagram)",
            "lessons": [
                { "lessonId": "L02.01", "title": "Como o Algoritmo Funciona", "type": "text", "content": "O algoritmo da Meta analisa o comportamento dos usuários para decidir o que mostrar..." },
                { "lessonId": "L02.04", "title": "Desafio Prático: Criação de Gancho", "type": "interactive", "description": "Crie três ganchos diferentes para o seu super app, focando nas dores da sua persona." }
            ]
        },
        // ... (o resto dos dados da mentoria continua aqui, omitido para economizar espaço)
    ];

    // --- VARIÁVEIS GLOBAIS ---
    let leads = [], caixa = [], estoque = [], chatHistory = [];
    let nextLeadId = 0, currentLeadId = null, draggedItem = null;
    let statusChart;
    let db;

    // --- INICIALIZAÇÃO ---
    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                db = firebase.firestore();
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
            }
        });
    }
    main();

    // --- CARREGAMENTO E SALVAMENTO ---
    async function loadAllUserData(userId) { /* ...código existente... */ }
    async function saveUserData(userId) { /* ...código existente... */ }

    // --- RENDERIZAÇÃO E UI ---
    function updateAllUI() {
        renderKanbanCards();
        renderLeadsTable();
        updateDashboard();
        renderCaixaTable();
        updateCaixa();
        renderEstoqueTable();
        renderChatHistory();
    }
    
    function applySettings(settings = {}) { /* ...código existente... */ }

    // --- EVENT LISTENERS ---
    function setupEventListeners(userId) {
        // ... (código dos event listeners de navegação, settings, lead-form, etc.)

        // --- Kanban com link de WhatsApp ---
        const kanbanBoard = document.getElementById('kanban-board');
        if (kanbanBoard) {
            kanbanBoard.addEventListener('click', e => {
                if (e.target.tagName === 'A') { // Se clicou no link do WhatsApp
                    e.stopPropagation(); // Impede que o card seja aberto para edição
                    return;
                }
                const card = e.target.closest('.kanban-card');
                if (card) {
                    openEditModal(parseInt(card.dataset.id));
                }
            });
            // ... (resto da lógica de drag and drop)
        }
        
        // --- Tabela com link de WhatsApp e Botão de Custos ---
        document.getElementById('leads-table')?.addEventListener('click', e => {
            if (e.target.tagName === 'A') { e.stopPropagation(); return; }
            if (e.target.closest('.btn-edit-table')) openEditModal(parseInt(e.target.closest('tr').dataset.id));
            if (e.target.closest('.btn-delete-table')) { /* ...lógica de delete... */ }
        });

        document.getElementById('estoque-table')?.addEventListener('click', e => {
            if (e.target.closest('.btn-custo')) {
                const productName = e.target.closest('tr').querySelector('td').textContent;
                alert(`Função para adicionar custos ao produto "${productName}" a ser implementada.`);
                // Aqui você abriria um modal para adicionar o custo
            }
        });

        // ... (resto dos event listeners)
    }

    // --- FUNÇÕES ESPECÍFICAS ---
    function openEditModal(leadId) { /* ...código existente... */ }

    function renderKanbanCards() {
        document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = '');
        leads.forEach(lead => {
            const container = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (container) {
                const whatsappLink = `<a href="https://wa.me/${lead.whatsapp.replace(/\D/g, '')}" target="_blank">${lead.whatsapp}</a>`;
                container.innerHTML += `<div class="kanban-card" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${whatsappLink}</p></div>`;
            }
        });
    }

    function renderLeadsTable() {
        const tableBody = document.querySelector('#leads-table tbody');
        if (tableBody) {
            tableBody.innerHTML = leads.map(l => {
                const whatsappLink = `<a href="https://wa.me/${l.whatsapp.replace(/\D/g, '')}" target="_blank">${l.whatsapp}</a>`;
                return `<tr data-id="${l.id}">
                    <td>${l.nome}</td>
                    <td>${whatsappLink}</td>
                    <td>${l.origem}</td>
                    <td>${l.qualificacao}</td>
                    <td>${l.status}</td>
                    <td>
                        <button class="btn-edit-table"><i class="ph-fill ph-note-pencil"></i></button>
                        <button class="btn-delete-table"><i class="ph-fill ph-trash"></i></button>
                    </td>
                </tr>`;
            }).join('');
        }
    }

    function renderEstoqueTable() {
        const tableBody = document.querySelector('#estoque-table tbody');
        if (!tableBody) return;
        
        const searchTerm = document.getElementById('estoque-search').value.toLowerCase();
        const filteredEstoque = estoque.filter(p => p.produto.toLowerCase().includes(searchTerm) || (p.descricao && p.descricao.toLowerCase().includes(searchTerm)));
        
        tableBody.innerHTML = filteredEstoque.map(p => {
            const lucro = p.venda - p.compra; // Simplificado, custos precisam ser somados aqui
            return `<tr data-id="${p.id}">
                <td>${p.produto}</td>
                <td>${p.descricao}</td>
                <td>R$ ${p.compra.toFixed(2)}</td>
                <td>R$ 0.00</td> <td>R$ ${p.venda.toFixed(2)}</td>
                <td>R$ ${lucro.toFixed(2)}</td>
                <td><button class="btn-custo">Custos</button></td>
            </tr>`;
        }).join('');
    }

    function renderMentoria() {
        const menu = document.getElementById('mentoria-menu');
        const content = document.getElementById('mentoria-content');
        if (!menu || !content) return;
    
        menu.innerHTML = mentoriaData.map((mod, i) =>
            `<div class="sales-accelerator-menu-item ${i === 0 ? 'active' : ''}" data-module-id="${mod.moduleId}">${mod.title}</div>`
        ).join('');
    
        content.innerHTML = mentoriaData.map((mod, i) => `
            <div class="mentoria-module-content ${i === 0 ? 'active' : ''}" id="${mod.moduleId}">
                ${mod.lessons.map(les => {
                    let lessonContent = `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content || ''}</p></div>`;
                    if (les.type === 'interactive') {
                        lessonContent += `<div class="mentoria-exercise"><h4>Exercício Prático</h4><p>${les.description}</p></div>`;
                    }
                    return lessonContent;
                }).join('')}
                <div class="anotacoes-aluno">
                    <label for="notas-${mod.moduleId}">Minhas Anotações</label>
                    <textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="6"></textarea>
                </div>
            </div>`
        ).join('');
    
        document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => {
            item.addEventListener('click', e => {
                document.querySelectorAll('.sales-accelerator-menu-item, .mentoria-module-content').forEach(el => el.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.getElementById(e.currentTarget.dataset.moduleId).classList.add('active');
            });
        });
        // ... (resto da lógica de notas)
    }

    // ... (resto de todas as outras funções: updateDashboard, renderCaixaTable, etc.)
});
