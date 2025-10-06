document.addEventListener('DOMContentLoaded', () => {
    // --- DADOS COMPLETOS DA MENTORIA ---
    const mentoriaData = [
        { "moduleId": "MD01", "title": "Módulo 1: Conectando com o Cliente Ideal", "exercisePrompt": "Exercício Módulo 1:\n\n1. Descreva sua persona (cliente ideal) em 3 parágrafos.\n2. Qual é a principal dor que seu serviço resolve para essa persona?\n3. Escreva sua Proposta de Valor Única (PVU).", "lessons": [ { "lessonId": "L01.01", "title": "Questionário para Definição de Persona", "type": "text", "content": "Antes de qualquer estratégia, é essencial saber com quem você está falando..." } ] },
        { "moduleId": "MD02", "title": "Módulo 2: O Algoritmo da Meta", "exercisePrompt": "Exercício Módulo 2:\n\n1. Crie 3 ganchos (frases de impacto iniciais) para um vídeo sobre seu serviço.\n2. Liste 2 tipos de conteúdo que você pode criar que geram mais salvamentos e compartilhamentos.", "lessons": [ { "lessonId": "L02.01", "title": "Como o Algoritmo Funciona", "type": "text", "content": "O algoritmo da Meta analisa o comportamento dos usuários para decidir o que mostrar..." } ] },
        { "moduleId": "MD03", "title": "Módulo 3: Cronograma de Postagens", "exercisePrompt": "Exercício Módulo 3:\n\n1. Baseado no seu nicho, defina a frequência ideal de postagens semanais para você.\n2. Monte um cronograma de conteúdo para a próxima semana (Ex: Segunda - Dica, Terça - Bastidores, etc.).", "lessons": [ { "lessonId": "L03.01", "title": "Melhores Horários e Dias para Postagem", "type": "text", "content": "O ideal é postar quando seu público está mais ativo..." } ] },
        { "moduleId": "MD04", "title": "Módulo 4: Conteúdo que Conecta", "exercisePrompt": "Exercício Módulo 4:\n\n1. Escreva um roteiro curto para um vídeo no formato '1 Dica em 1 Minuto'.\n2. Pense na identidade visual: quais são as 2 cores principais e a fonte que definem sua marca?", "lessons": [ { "lessonId": "L04.01", "title": "Estrutura de Vídeos que Engajam", "type": "text", "content": "Um vídeo precisa seguir uma estrutura estratégica: Gancho, Valor e CTA..." } ] },
        { "moduleId": "MD05", "title": "Módulo 5: Copywriting com ChatGPT", "exercisePrompt": "Exercício Módulo 5:\n\n1. Use a fórmula PAS (Problema, Agitação, Solução) para escrever uma legenda de post sobre seu serviço.\n2. Crie um prompt para o ChatGPT pedindo 3 ideias de conteúdo para seu nicho.", "lessons": [ { "lessonId": "L05.01", "title": "Como Criar Textos Persuasivos com IA", "type": "text", "content": "O ChatGPT é uma ferramenta poderosa para gerar textos que vendem..." } ] },
        { "moduleId": "MD06", "title": "Módulo 6: Implementação de CRM", "exercisePrompt": "Exercício Módulo 6:\n\n1. Defina as 3 a 4 etapas do seu funil de vendas (Ex: Novo Contato, Apresentação, Negociação).\n2. Crie um lead de teste no CRM e mova-o pelas etapas do funil.", "lessons": [ { "lessonId": "L06.01", "title": "O que é CRM e Por que sua Empresa Precisa", "type": "text", "content": "CRM é uma ferramenta que organiza o relacionamento com seus leads e clientes..." } ] },
        { "moduleId": "MD07", "title": "Módulo 7: Processo Comercial", "exercisePrompt": "Exercício Módulo 7:\n\n1. Escreva seu pitch de vendas em uma única frase.\n2. Qual gatilho mental (escassez, urgência, prova social) faz mais sentido para sua oferta e por quê?", "lessons": [ { "lessonId": "L07.01", "title": "Como Montar um Pitch Comercial", "type": "text", "content": "O pitch é a sua 'apresentação relâmpago', precisa ser claro e direto..." } ] },
        { "moduleId": "MD08", "title": "Módulo 8: Conexão com a Audiência", "exercisePrompt": "Exercício Módulo 8:\n\n1. Liste 3 ideias de conteúdo de bastidores que você poderia postar nos Stories.\n2. Escreva uma pergunta para fazer em uma enquete que gere engajamento com seu público.", "lessons": [ { "lessonId": "L08.01", "title": "Gerando Conexão Real (sem Forçar)", "type": "text", "content": "Pessoas se conectam com pessoas. Mostrar sua rotina e bastidores cria empatia..." } ] }
    ];

    let leads = [], caixa = [], estoque = [], chatHistory = [];
    let nextLeadId = 0, currentLeadId = null, draggedItem = null, currentProductId = null;
    let statusChart;
    let db;

    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user && !document.body.hasAttribute('data-initialized')) {
                document.body.setAttribute('data-initialized', 'true');
                db = firebase.firestore();
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
            }
        });
    }
    main();

    async function loadAllUserData(userId) { /* ...código existente... */ }
    async function saveUserData(userId) { /* ...código existente... */ }
    function updateAllUI() { /* ...código existente... */ }
    function applySettings(settings = {}) { /* ...código existente... */ }

    function setupEventListeners(userId) {
        // ... (Listeners de navegação, tema, salvar configurações, etc., continuam iguais)

        // BOTÃO EXPORTAR LEADS
        document.getElementById('export-leads-btn')?.addEventListener('click', () => {
            if (leads.length === 0) {
                alert("Não há leads para exportar.");
                return;
            }
            const header = ["Nome", "Email", "WhatsApp", "Origem", "Qualificação", "Status", "Atendente", "Data", "Notas"];
            const rows = leads.map(l => [l.nome, l.email, l.whatsapp, l.origem, l.qualificacao, l.status, l.atendente, l.data, `"${(l.notas || '').replace(/"/g, '""')}"`]);
            
            const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
            XLSX.writeFile(workbook, "leads.xlsx");
        });

        // BOTÕES IMPORTAR/EXPORTAR ESTOQUE
        document.getElementById('export-csv-btn')?.addEventListener('click', () => { /* ...código existente... */ });
        document.getElementById('import-csv-btn')?.addEventListener('click', () => { /* ...código existente... */ });
        
        // BOTÃO EXCLUIR ITEM DO ESTOQUE
        document.getElementById('estoque-table')?.addEventListener('click', e => {
            if (e.target.closest('.btn-custo')) {
                const productId = e.target.closest('tr').dataset.id;
                openCustosModal(productId);
            }
            if (e.target.closest('.btn-delete-estoque')) {
                if (confirm('Tem certeza que deseja excluir este item do estoque?')) {
                    const productId = e.target.closest('tr').dataset.id;
                    estoque = estoque.filter(p => p.id !== productId);
                    saveUserData(userId);
                    renderEstoqueTable();
                }
            }
        });
        
        // ... (Resto dos event listeners que já estavam funcionando)
    }

    // FUNÇÃO ATUALIZADA: RENDERIZAR TABELA DE ESTOQUE
    function renderEstoqueTable() {
        const t = document.querySelector('#estoque-table tbody');
        if (!t) return;
        t.innerHTML = estoque.map(p => {
            const totalCustos = (p.custos || []).reduce((acc, c) => acc + c.valor, 0);
            const lucro = p.venda - p.compra - totalCustos;
            return `<tr data-id="${p.id}">
                <td>${p.produto}</td>
                <td>${p.descricao}</td>
                <td>R$ ${p.compra.toFixed(2)}</td>
                <td>R$ ${totalCustos.toFixed(2)}</td>
                <td>R$ ${p.venda.toFixed(2)}</td>
                <td>R$ ${lucro.toFixed(2)}</td>
                <td>
                    <button class="btn-custo">Custos</button>
                    <button class="btn-delete-table btn-delete-estoque"><i class="ph-fill ph-trash"></i></button>
                </td>
            </tr>`;
        }).join('');
    }

    // FUNÇÃO ATUALIZADA: RENDERIZAR MENTORIA
    function renderMentoria() {
        const menu = document.getElementById('mentoria-menu');
        const content = document.getElementById('mentoria-content');
        if (!menu || !content) return;

        menu.innerHTML = mentoriaData.map((mod, i) => `<div class="sales-accelerator-menu-item ${i === 0 ? 'active' : ''}" data-module-id="${mod.moduleId}">${mod.title}</div>`).join('');
        
        content.innerHTML = mentoriaData.map((mod, i) => {
            const placeholder = mod.exercisePrompt || `Digite aqui suas anotações para o Módulo ${i + 1}...`;
            return `<div class="mentoria-module-content ${i === 0 ? 'active' : ''}" id="${mod.moduleId}">
                ${mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content || les.description}</p></div>`).join('')}
                <div class="anotacoes-aluno">
                    <label for="notas-${mod.moduleId}">Minhas Anotações / Exercícios</label>
                    <textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="8" placeholder="${placeholder}"></textarea>
                </div>
            </div>`;
        }).join('');
        
        document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => { /* ...código existente... */ });
        document.querySelectorAll('.mentoria-notas').forEach(t => t.addEventListener('keyup', () => saveUserData(firebase.auth().currentUser.uid)));
    }
    
    // ... (O resto das funções continua igual)
});
