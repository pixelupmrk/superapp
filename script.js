document.addEventListener('DOMContentLoaded', () => {
    // --- DADOS COMPLETOS DA MENTORIA ---
    const mentoriaData = [
         // ... (COLE AQUI O CONTEÚDO COMPLETO DO ARQUIVO 'data', como na resposta anterior)
    ];

    // --- VARIÁVEIS GLOBAIS ---
    let leads = [], caixa = [], estoque = [], chatHistory = [];
    let nextLeadId = 0, currentLeadId = null, draggedItem = null, currentProductId = null;
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

    // --- LÓGICA DE CARREGAMENTO E SALVAMENTO (sem alterações) ---
    async function loadAllUserData(userId) { /* ...código completo e sem alterações... */ }
    async function saveUserData(userId) { /* ...código completo e sem alterações... */ }
    
    // --- LÓGICA DE ATUALIZAÇÃO DA UI (sem alterações) ---
    function updateAllUI() { /* ...código completo e sem alterações... */ }
    function applySettings(settings = {}) { /* ...código completo e sem alterações... */ }

    // --- EVENT LISTENERS (COM CORREÇÕES) ---
    function setupEventListeners(userId) {
        // Navegação da Sidebar
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', e => { /* ...código existente... */ });
        });

        // Botão de Tema (CORRIGIDO)
        document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            document.getElementById('theme-toggle-btn').textContent = isLight ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro';
            saveUserData(userId);
        });
        
        // Kanban Drag-and-Drop (CORRIGIDO)
        const kanbanBoard = document.getElementById('kanban-board');
        if (kanbanBoard) {
            kanbanBoard.addEventListener('dragstart', e => { if (e.target.classList.contains('kanban-card')) { draggedItem = e.target; } });
            kanbanBoard.addEventListener('dragend', () => { draggedItem = null; });
            kanbanBoard.addEventListener('dragover', e => e.preventDefault());
            kanbanBoard.addEventListener('drop', e => {
                e.preventDefault();
                const column = e.target.closest('.kanban-column');
                if (column && draggedItem) {
                    const lead = leads.find(l => l.id == draggedItem.dataset.id);
                    if (lead) {
                        lead.status = column.dataset.status;
                        saveUserData(userId);
                        renderKanbanCards();
                        updateDashboard();
                    }
                }
            });
            // ... (resto do listener de click do kanban)
        }

        // Tabela de Estoque e Botão de Custos (FUNCIONAL)
        document.getElementById('estoque-table')?.addEventListener('click', e => {
            if (e.target.closest('.btn-custo')) {
                const productId = e.target.closest('tr').dataset.id;
                openCustosModal(productId);
            }
        });

        // Formulário de Adicionar Custo
        document.getElementById('add-custo-form')?.addEventListener('submit', e => {
            e.preventDefault();
            const produto = estoque.find(p => p.id === currentProductId);
            if (produto) {
                const descricao = document.getElementById('custo-descricao').value;
                const valor = parseFloat(document.getElementById('custo-valor').value);
                if (!produto.custos) produto.custos = [];
                produto.custos.push({ descricao, valor });
                saveUserData(userId);
                renderCustosList(produto); // Atualiza a lista no modal
                renderEstoqueTable(); // Atualiza a tabela principal
                e.target.reset();
            }
        });
        
        // Fechar Modais
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById(btn.dataset.target).style.display = 'none';
            });
        });
        
        // ... (resto de todos os outros event listeners que já funcionavam)
    }

    // --- FUNÇÕES ESPECÍFICAS (COM ATUALIZAÇÕES) ---
    
    // Abrir e popular o Modal de Custos
    function openCustosModal(productId) {
        currentProductId = productId;
        const produto = estoque.find(p => p.id === productId);
        if (produto) {
            document.getElementById('custos-modal-title').textContent = `Custos de: ${produto.produto}`;
            renderCustosList(produto);
            document.getElementById('custos-modal').style.display = 'flex';
        }
    }

    // Renderizar a lista de custos dentro do modal
    function renderCustosList(produto) {
        const listContainer = document.getElementById('custos-list');
        if (!produto.custos || produto.custos.length === 0) {
            listContainer.innerHTML = '<p>Nenhum custo adicionado.</p>';
            return;
        }
        listContainer.innerHTML = produto.custos.map(custo =>
            `<div class="custo-item">
                <span>${custo.descricao}</span>
                <span>R$ ${custo.valor.toFixed(2)}</span>
            </div>`
        ).join('');
    }

    // Tabela de Estoque com cálculo de custos
    function renderEstoqueTable() {
        const tableBody = document.querySelector('#estoque-table tbody');
        if (!tableBody) return;
        tableBody.innerHTML = estoque.map(p => {
            const totalCustos = (p.custos || []).reduce((acc, custo) => acc + custo.valor, 0);
            const lucro = p.venda - p.compra - totalCustos;
            return `<tr data-id="${p.id}">
                <td>${p.produto}</td>
                <td>${p.descricao}</td>
                <td>R$ ${p.compra.toFixed(2)}</td>
                <td>R$ ${totalCustos.toFixed(2)}</td>
                <td>R$ ${p.venda.toFixed(2)}</td>
                <td>R$ ${lucro.toFixed(2)}</td>
                <td><button class="btn-custo">Custos</button></td>
            </tr>`;
        }).join('');
    }

    // Mentoria com placeholder de exercícios
    function renderMentoria() {
        const menu = document.getElementById('mentoria-menu');
        const content = document.getElementById('mentoria-content');
        if (!menu || !content) return;
    
        menu.innerHTML = mentoriaData.map((mod, i) =>
            `<div class="sales-accelerator-menu-item ${i === 0 ? 'active' : ''}" data-module-id="${mod.moduleId}">${mod.title}</div>`
        ).join('');
    
        content.innerHTML = mentoriaData.map((mod, i) => {
            const placeholderText = `Digite aqui suas anotações e o exercício prático para o Módulo ${i + 1}...\n\nExemplo: Qual é a principal dor da minha persona que meu serviço resolve?`;
            return `
            <div class="mentoria-module-content ${i === 0 ? 'active' : ''}" id="${mod.moduleId}">
                ${mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content || les.description}</p></div>`).join('')}
                <div class="anotacoes-aluno">
                    <label for="notas-${mod.moduleId}">Minhas Anotações / Exercícios</label>
                    <textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="8" placeholder="${placeholderText}"></textarea>
                </div>
            </div>`;
        }).join('');
    
        document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => { /* ...código de clique existente... */ });
        document.querySelectorAll('.mentoria-notas').forEach(t => t.addEventListener('keyup', () => saveUserData(firebase.auth().currentUser.uid)));
    }

    // ... (resto das funções que não foram alteradas, como renderKanbanCards, renderLeadsTable, etc.)
});
