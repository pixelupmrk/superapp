document.addEventListener('DOMContentLoaded', () => {
    // --- DADOS COMPLETOS DA MENTORIA ---
    const mentoriaData = [
        {
            "moduleId": "MD01",
            "title": "Módulo 1: Conectando com o Cliente Ideal",
            "description": "Aprenda a usar o CRM do super app para construir a persona do seu cliente, otimizando seu funil de vendas desde o início.",
            "lessons": [
                { "lessonId": "L01.01", "title": "Questionário para Definição de Persona", "type": "text", "content": "Antes de qualquer estratégia, é essencial saber com quem você está falando. O questionário irá ajudar a identificar o perfil do seu cliente ideal. Use o CRM para registrar as respostas e começar a segmentar seus leads.\n\nPerguntas do Questionário:\n1. Nome fictício da persona:\n2. Idade aproximada:\n3. Profissão ou ocupação:\n4. Quais são suas dores e dificuldades?\n5. Quais são seus desejos ou objetivos?\n6. Onde essa pessoa busca informação?\n7. Quais redes sociais essa pessoa usa com frequência?\n8. Que tipo de conteúdo ela consome?" },
                { "lessonId": "L01.02", "title": "Proposta de Valor e Posicionamento", "type": "video", "videoUrl": "URL_DO_VIDEO_A_SER_ADICIONADO_AQUI", "content": "Com base na persona, vamos definir a proposta de valor do seu serviço. A proposta responde: 'Eu ajudo [persona] a [solução] através de [diferencial do seu serviço].'\n\nExemplo: Ajudo [vendedores autônomos] a [acelerar vendas] usando [o super app com CRM e automação]." },
                { "lessonId": "L01.03", "title": "Exercício Prático: Configurando o CRM", "type": "interactive", "description": "Este exercício prático irá guiá-lo a configurar o CRM do seu super app para a sua persona. Você irá criar as primeiras tags e campos para começar a registrar as informações." }
            ]
        },
        {
            "moduleId": "MD02",
            "title": "Módulo 2: O Algoritmo da Meta (Facebook & Instagram)",
            "description": "Entenda como o algoritmo da Meta funciona e aprenda a criar ganchos e conteúdos que direcionam tráfego para o seu super app.",
            "lessons": [
                { "lessonId": "L02.01", "title": "Como o Algoritmo Funciona", "type": "text", "content": "O algoritmo da Meta analisa o comportamento dos usuários para decidir o que mostrar. Ele prioriza conteúdos que geram interação rápida. Quanto mais relevante for o seu conteúdo para o público, mais ele será entregue." },
                { "lessonId": "L02.02", "title": "O que Influencia o Alcance Orgânico", "type": "text", "content": "O alcance orgânico depende de fatores como: qualidade do conteúdo, engajamento nos primeiros minutos, frequência de publicações e relacionamento com o público (DMs, respostas, salvamentos)." },
                { "lessonId": "L02.03", "title": "Comece com um Gancho Forte", "type": "text", "content": "O primeiro segundo do seu conteúdo precisa chamar a atenção imediatamente. Depois do gancho, entregue valor real e finalize com uma chamada para ação (CTA). Exemplo de ganchos: 'Você está postando, mas ninguém engaja? Isso aqui é pra você.'" },
                { "lessonId": "L02.04", "title": "Desafio Prático: Criação de Gancho", "type": "interactive", "description": "Crie três ganchos diferentes para o seu super app, focando nas dores da sua persona. Exemplo: 'Você quer vender mais, mas não sabe por onde começar? O super app resolve isso!'" }
            ]
        },
        {
            "moduleId": "MD03",
            "title": "Módulo 3: Cronograma de Postagens Estratégico",
            "description": "Planeje a sua rotina de conteúdo nas redes sociais com um calendário que aumenta o seu alcance e consistência.",
            "lessons": [
                { "lessonId": "L03.01", "title": "Melhores Horários e Dias para Postagem", "type": "text", "content": "O ideal é postar quando seu público está mais ativo (geralmente entre 11h e 13h ou 18h e 20h, de terça a quinta). Use as métricas do Instagram para ver quando seus seguidores estão online." },
                { "lessonId": "L03.02", "title": "Frequência Ideal e Consistência", "type": "text", "content": "Mais importante que a quantidade, é a consistência. A frequência ideal varia por nicho. A mentoria sugere: Estética e beleza (4 a 5 posts por semana); B2B (3 posts bem elaborados por semana); Varejo (diária)." },
                { "lessonId": "L03.03", "title": "Exemplo de Cronograma Semanal", "type": "text", "content": "Utilize um calendário para organizar o conteúdo por dia da semana:\nSegunda-feira: Conteúdo Educativo\nTerça-feira: Prova Social (depoimento)\nQuarta-feira: Vídeo Reels\nQuinta-feira: Dica + Engajamento\nSexta-feira: Chamada para Ação/Oferta\nSábado: Conteúdo leve/Bastidor\nDomingo: (Opcional) Inspiração" }
            ]
        },
        {
            "moduleId": "MD04",
            "title": "Módulo 4: Conteúdo que Conecta",
            "description": "Aprenda a gravar e editar vídeos que engajam, utilizando ferramentas como CapCut e Canva para fortalecer a identidade visual da sua marca.",
            "lessons": [
                { "lessonId": "L04.01", "title": "Estrutura de Vídeos que Engajam", "type": "text", "content": "Um vídeo precisa seguir uma estrutura estratégica: Gancho (1º segundo), Valor (dica ou solução) e CTA (chamada para ação). Exemplo: 'Você quer mais clientes? Então evite esse erro aqui...'" },
                { "lessonId": "L04.02", "title": "Edição Prática com CapCut ou InShot", "type": "video", "videoUrl": "URL_DO_VIDEO_A_SER_ADICIONADO_AQUI", "content": "Aprenda a usar ferramentas de edição como CapCut para cortar partes desnecessárias, adicionar legendas automáticas e inserir trilha sonora." },
                { "lessonId": "L04.03", "title": "Design com Canva", "type": "text", "content": "Use o Canva para criar uma identidade visual coesa. Mantenha fontes legíveis, as cores da sua marca e crie um padrão visual para que seus posts sejam reconhecidos no feed." },
                { "lessonId": "L04.04", "title": "Desafio de Vídeo Teste: '1 Dica, 1 Minuto'", "type": "interactive", "description": "Crie um roteiro para um vídeo curto e direto, com foco em engajamento. Siga a estrutura: Gancho, Valor e CTA." }
            ]
        },
        {
            "moduleId": "MD05",
            "title": "Módulo 5: Copywriting com ChatGPT",
            "description": "Utilize o ChatGPT para criar textos persuasivos para suas redes sociais e anúncios, usando fórmulas de copy que realmente convertem.",
            "lessons": [
                { "lessonId": "L05.01", "title": "Como Criar Textos Persuasivos com IA", "type": "text", "content": "O ChatGPT é uma ferramenta poderosa para gerar textos que vendem. A chave está em saber o que pedir e como direcionar a IA com clareza. Use as fórmulas de copy para montar seus prompts." },
                { "lessonId": "L05.02", "title": "Fórmulas Testadas: AIDA e PAS", "type": "text", "content": "Aprenda a usar as estruturas de texto persuasivo:\nAIDA: Atenção, Interesse, Desejo, Ação\nPAS: Problema, Agitação, Solução" },
                { "lessonId": "L05.03", "title": "Criando Prompts Inteligentes", "type": "text", "content": "Um bom prompt direciona o ChatGPT a criar algo útil. Use a estrutura: [Ação] + [Assunto] + [Objetivo] + [Estilo/Tom]. Exemplo: 'Escreva uma copy para anúncio no Instagram sobre mentoria de marketing, com objetivo de gerar leads, num tom direto e persuasivo.'" },
                { "lessonId": "L05.04", "title": "Prompt Base Personalizado", "type": "text", "content": "Use este prompt base para agilizar sua criação de conteúdo:\n📍 Tema:\n🎯 Objetivo:\n🧑 Público-alvo:\n🗣 Tom de voz:\n📱 Formato desejado:" }
            ]
        },
        {
            "moduleId": "MD06",
            "title": "Módulo 6: Implementação de CRM",
            "description": "Organize o relacionamento com seus leads e clientes, e aprenda a fazer remarketing segmentado para vender mais.",
            "lessons": [
                { "lessonId": "L06.01", "title": "O que é CRM e Por que sua Empresa Precisa", "type": "text", "content": "CRM (Customer Relationship Management) é uma ferramenta que organiza o relacionamento com seus leads e clientes, acompanhando-os desde o primeiro contato até o fechamento da venda." },
                { "lessonId": "L06.02", "title": "Construção de Funil de Vendas Básico", "type": "text", "content": "Um funil simples pode ter 4 etapas: Contato Inicial, Conversa/Apresentação, Proposta Enviada, Cliente Fechado. O super app ajudará a organizar os leads por estágio para manter a eficiência." },
                { "lessonId": "L06.03", "title": "Opções de Remarketing", "type": "text", "content": "Aprenda a segmentar leads no CRM e criar campanhas de remarketing para: Leads que não fecharam (com anúncios de cases), Leads que sumiram (com mensagens personalizadas) e Ex-clientes (com bônus de retorno)." }
            ]
        },
        {
            "moduleId": "MD07",
            "title": "Módulo 7: Processo Comercial e Técnicas de Venda",
            "description": "Domine o processo comercial com técnicas de rapport, gatilhos mentais e um pitch de vendas que realmente gera interesse.",
            "lessons": [
                { "lessonId": "L07.01", "title": "Como Montar um Pitch Comercial", "type": "text", "content": "O pitch é a sua 'apresentação relâmpago'. Ele precisa ser claro e direto. Inclua: Quem você ajuda, o problema que resolve e o diferencial do seu serviço. Exemplo: 'Nós ajudamos negócios locais a atrair clientes todos os dias usando vídeos e tráfego pago.'" },
                { "lessonId": "L07.02", "title": "Rapport e Gatilhos Mentais", "type": "text", "content": "Crie conexão usando técnicas como: Rapport (usar linguagem e ritmo parecidos com o cliente) e Gatilhos Mentais (escassez, autoridade, prova social). O cliente compra quando sente confiança e identificação." },
                { "lessonId": "L07.03", "title": "Follow-up Eficiente", "type": "text", "content": "A maioria das vendas acontece no 2º ou 3º contato. Use o CRM do super app para agendar retornos e sempre traga um valor novo na abordagem. Evite ser insistente; seja consultivo." }
            ]
        },
        {
            "moduleId": "MD08",
            "title": "Módulo 8: Conexão com a Audiência e Humanização",
            "description": "Construa uma audiência leal ao ser autêntico, mostrar os bastidores e interagir de forma genuína com o seu público.",
            "lessons": [
                { "lessonId": "L08.01", "title": "Gerando Conexão Real (sem Forçar)", "type": "text", "content": "Pessoas se conectam com pessoas. Mostrar sua rotina e bastidores cria empatia. Seja autêntico, não perfeito. Use a câmera frontal e fale como se fosse para um amigo." },
                { "lessonId": "L08.02", "title": "Estratégias de Bastidores nos Stories", "type": "text", "content": "Use os Stories para mostrar o que acontece por trás do conteúdo pronto. Compartilhe erros, aprendizados e a rotina de trabalho. Quanto mais humano, maior a identificação." },
                { "lessonId": "L08.03", "title": "Criando uma Comunidade Engajada e Leal", "type": "text", "content": "Uma audiência fiel é construída com interação real e constância. Responda comentários e DMs, envolva seguidores com perguntas e enquetes. Quem se sente visto, volta. E quem volta, compra." }
            ]
        }
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

    // --- LÓGICA DE CARREGAMENTO E SALVAMENTO ---
    async function loadAllUserData(userId) {
        try {
            const doc = await db.collection('userData').doc(userId).get();
            if (doc.exists) {
                const data = doc.data();
                leads = data.leads || [];
                caixa = data.caixa || [];
                estoque = data.estoque || [];
                // Garante que cada produto no estoque tenha um 'id' único para o modal de custos
                estoque.forEach((item, index) => {
                    if (!item.id) {
                        item.id = `prod_${Date.now()}_${index}`;
                    }
                });

                chatHistory = data.chatHistory || [];
                nextLeadId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 0;
                applySettings(data.settings);
                loadMentoriaNotes(data.mentoriaNotes);
            }
            renderMentoria();
            updateAllUI();
        } catch (error) { console.error("Erro ao carregar dados:", error); }
    }

    async function saveUserData(userId) {
        try {
            const dataToSave = {
                leads, caixa, estoque, chatHistory,
                mentoriaNotes: getMentoriaNotes(),
                settings: {
                    theme: document.body.classList.contains('light-theme') ? 'light' : 'dark',
                    userName: document.getElementById('setting-user-name').value || 'Usuário',
                    companyName: document.getElementById('setting-company-name').value
                }
            };
            await db.collection('userData').doc(userId).set(dataToSave);
        } catch (error) { console.error(`Erro ao salvar dados:`, error); }
    }
    
    // --- LÓGICA DE ATUALIZAÇÃO DA UI ---
    function updateAllUI() {
        renderKanbanCards();
        renderLeadsTable();
        updateDashboard();
        renderCaixaTable();
        updateCaixa();
        renderEstoqueTable();
        renderChatHistory();
    }
    
    function applySettings(settings = {}) {
        const theme = settings ? settings.theme || 'dark' : 'dark';
        const userName = settings ? settings.userName || 'Usuário' : 'Usuário';
        document.body.className = theme === 'light' ? 'light-theme' : '';
        document.getElementById('theme-toggle-btn').textContent = theme === 'light' ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro';
        document.querySelector('.user-profile span').textContent = `Olá, ${userName}`;
        document.getElementById('setting-user-name').value = userName;
        document.getElementById('setting-company-name').value = settings ? settings.companyName || '' : '';
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners(userId) {
        // Navegação da Sidebar
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                const targetId = e.currentTarget.getAttribute('data-target');
                if (!targetId) return;
                document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => nav.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.querySelectorAll('.main-content .content-area').forEach(area => area.style.display = 'none');
                document.getElementById(targetId).style.display = 'block';
                document.getElementById('page-title').textContent = e.currentTarget.querySelector('span').textContent;
            });
        });

        // Botão de Tema
        document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            document.getElementById('theme-toggle-btn').textContent = isLight ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro';
            saveUserData(userId);
        });
        
        // Botão Salvar Configurações
        document.getElementById('save-settings-btn')?.addEventListener('click', () => {
            saveUserData(userId);
            alert('Configurações salvas!');
        });

        // Formulário Novo Lead
        document.getElementById('lead-form')?.addEventListener('submit', e => {
            e.preventDefault();
            const newLead = {
                id: nextLeadId++, status: 'novo',
                nome: document.getElementById('lead-name').value, email: document.getElementById('lead-email').value,
                whatsapp: document.getElementById('lead-whatsapp').value, atendente: document.getElementById('lead-attendant').value,
                origem: document.getElementById('lead-origin').value, data: document.getElementById('lead-date').value,
                qualificacao: document.getElementById('lead-qualification').value, notas: document.getElementById('lead-notes').value
            };
            leads.push(newLead);
            saveUserData(userId);
            updateAllUI();
            e.target.reset();
        });

        // Kanban Board
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
                        renderKanbanCards(); updateDashboard();
                    }
                }
            });
            kanbanBoard.addEventListener('click', e => {
                if (e.target.tagName === 'A') { e.stopPropagation(); return; }
                const card = e.target.closest('.kanban-card');
                if (card) openEditModal(parseInt(card.dataset.id));
            });
        }
        
        // Tabela de Leads
        document.getElementById('leads-table')?.addEventListener('click', e => {
            if (e.target.tagName === 'A') { e.stopPropagation(); return; }
            if (e.target.closest('.btn-edit-table')) openEditModal(parseInt(e.target.closest('tr').dataset.id));
            if (e.target.closest('.btn-delete-table')) { if (confirm('Tem certeza?')) { leads = leads.filter(l => l.id != parseInt(e.target.closest('tr').dataset.id)); saveUserData(userId); updateAllUI(); } }
        });

        // Formulário Edição de Lead
        document.getElementById('edit-lead-form')?.addEventListener('submit', e => {
            e.preventDefault();
            const lead = leads.find(l => l.id === currentLeadId);
            if(lead) {
                lead.nome = document.getElementById('edit-lead-name').value; lead.email = document.getElementById('edit-lead-email').value;
                lead.whatsapp = document.getElementById('edit-lead-whatsapp').value; lead.status = document.getElementById('edit-lead-status').value;
                lead.atendente = document.getElementById('edit-lead-attendant').value; lead.origem = document.getElementById('edit-lead-origem').value;
                lead.data = document.getElementById('edit-lead-date').value; lead.qualificacao = document.getElementById('edit-lead-qualification').value;
                lead.notas = document.getElementById('edit-lead-notes').value;
                saveUserData(userId);
                updateAllUI();
                document.getElementById('edit-lead-modal').style.display = 'none';
            }
        });
        document.getElementById('delete-lead-btn')?.addEventListener('click', () => { if (confirm('Tem certeza?')) { leads = leads.filter(l => l.id !== currentLeadId); saveUserData(userId); updateAllUI(); document.getElementById('edit-lead-modal').style.display = 'none'; } });

        // Seção Financeiro
        document.getElementById('caixa-form')?.addEventListener('submit', e => { e.preventDefault(); caixa.push({ data: document.getElementById('caixa-data').value, descricao: document.getElementById('caixa-descricao').value, valor: parseFloat(document.getElementById('caixa-valor').value), tipo: document.getElementById('caixa-tipo').value, observacoes: document.getElementById('caixa-observacoes').value }); saveUserData(userId); renderCaixaTable(); updateCaixa(); e.target.reset(); });
        document.querySelectorAll('.finance-tab').forEach(tab => { tab.addEventListener('click', e => { e.preventDefault(); document.querySelectorAll('.finance-tab, .finance-content').forEach(el => el.classList.remove('active')); e.target.classList.add('active'); document.getElementById(e.target.dataset.tab + '-tab-content').classList.add('active'); }); });
        
        // Seção Estoque
        document.getElementById('estoque-form')?.addEventListener('submit', e => {
            e.preventDefault();
            const newProduct = {
                id: `prod_${Date.now()}`,
                produto: document.getElementById('estoque-produto').value,
                descricao: document.getElementById('estoque-descricao').value,
                compra: parseFloat(document.getElementById('estoque-compra').value),
                venda: parseFloat(document.getElementById('estoque-venda').value),
                custos: []
            };
            estoque.push(newProduct);
            saveUserData(userId);
            renderEstoqueTable();
            e.target.reset();
        });
        document.getElementById('estoque-search')?.addEventListener('input', renderEstoqueTable);
        document.getElementById('estoque-table')?.addEventListener('click', e => { if (e.target.closest('.btn-custo')) { const productId = e.target.closest('tr').dataset.id; openCustosModal(productId); } });
        document.getElementById('add-custo-form')?.addEventListener('submit', e => {
            e.preventDefault();
            const produto = estoque.find(p => p.id === currentProductId);
            if (produto) {
                const descricao = document.getElementById('custo-descricao').value;
                const valor = parseFloat(document.getElementById('custo-valor').value);
                if (!produto.custos) produto.custos = [];
                produto.custos.push({ descricao, valor });
                saveUserData(userId);
                renderCustosList(produto);
                renderEstoqueTable();
                e.target.reset();
            }
        });

        // Chatbot
        document.getElementById('chatbot-form')?.addEventListener('submit', async e => {
            e.preventDefault();
            const chatbotInput = document.getElementById('chatbot-input');
            const userInput = chatbotInput.value.trim();
            if (!userInput) return;
            addMessageToChat(userInput, 'user-message');
            chatHistory.push({ role: "user", parts: [{ text: userInput }] });
            chatbotInput.value = '';
            addMessageToChat("Pensando...", 'bot-message bot-thinking');
            try {
                const response = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: userInput, history: chatHistory }) });
                document.querySelector('.bot-thinking')?.remove();
                const data = await response.json();
                if (!response.ok) throw new Error(data.details || 'Erro desconhecido');
                addMessageToChat(data.text, 'bot-message');
                chatHistory.push({ role: "model", parts: [{ text: data.text }] });
            } catch (error) { document.querySelector('.bot-thinking')?.remove(); addMessageToChat(`Erro: ${error.message}`, 'bot-message'); }
            saveUserData(userId);
        });
        
        // Fechar Modais
        document.querySelectorAll('.close-modal').forEach(btn => { btn.addEventListener('click', () => { document.getElementById(btn.dataset.target).style.display = 'none'; }); });
    }

    // --- FUNÇÕES ESPECÍFICAS ---
    function openEditModal(leadId) { currentLeadId = leadId; const lead = leads.find(l => l.id === leadId); if(lead) { document.getElementById('edit-lead-name').value = lead.nome; document.getElementById('edit-lead-email').value = lead.email; document.getElementById('edit-lead-whatsapp').value = lead.whatsapp; document.getElementById('edit-lead-status').value = lead.status; document.getElementById('edit-lead-attendant').value = lead.atendente; document.getElementById('edit-lead-origem').value = lead.origem; document.getElementById('edit-lead-date').value = lead.data; document.getElementById('edit-lead-qualification').value = lead.qualificacao; document.getElementById('edit-lead-notes').value = lead.notas; document.getElementById('edit-lead-modal').style.display = 'flex'; } }
    function openCustosModal(productId) { currentProductId = productId; const produto = estoque.find(p => p.id === productId); if (produto) { document.getElementById('custos-modal-title').textContent = `Custos de: ${produto.produto}`; renderCustosList(produto); document.getElementById('custos-modal').style.display = 'flex'; } }
    function renderCustosList(produto) { const listContainer = document.getElementById('custos-list'); if (!produto.custos || produto.custos.length === 0) { listContainer.innerHTML = '<p>Nenhum custo adicionado.</p>'; return; } listContainer.innerHTML = produto.custos.map(custo => `<div class="custo-item"><span>${custo.descricao}</span><span>R$ ${custo.valor.toFixed(2)}</span></div>`).join(''); }
    function renderKanbanCards() { document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = ''); leads.forEach(lead => { const c = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`); if (c) { const wa = `<a href="https://wa.me/${(lead.whatsapp || '').replace(/\D/g, '')}" target="_blank">${lead.whatsapp}</a>`; c.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${wa}</p></div>`; } }); }
    function renderLeadsTable() { const t = document.querySelector('#leads-table tbody'); if (t) { t.innerHTML = leads.map(l => { const wa = `<a href="https://wa.me/${(l.whatsapp || '').replace(/\D/g, '')}" target="_blank">${l.whatsapp}</a>`; return `<tr data-id="${l.id}"><td>${l.nome}</td><td>${wa}</td><td>${l.origem}</td><td>${l.qualificacao}</td><td>${l.status}</td><td><button class="btn-edit-table"><i class="ph-fill ph-note-pencil"></i></button><button class="btn-delete-table"><i class="ph-fill ph-trash"></i></button></td></tr>`; }).join(''); } }
    function updateDashboard() { const n = leads.filter(l=>l.status==='novo').length, p=leads.filter(l=>l.status==='progresso').length, f=leads.filter(l=>l.status==='fechado').length; document.getElementById('total-leads').textContent = leads.length; document.getElementById('leads-novo').textContent = n; document.getElementById('leads-progresso').textContent = p; document.getElementById('leads-fechado').textContent = f; const ctx = document.getElementById('statusChart')?.getContext('2d'); if (!ctx) return; if (statusChart) statusChart.destroy(); statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Progresso', 'Fechado'], datasets: [{ data: [n, p, f], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'] }] } }); }
    function renderCaixaTable() { const t = document.querySelector('#caixa-table tbody'); if (t) { t.innerHTML = caixa.map(m => `<tr><td>${m.data}</td><td>${m.descricao}</td><td>${m.tipo==='entrada'?'R$ '+m.valor.toFixed(2):''}</td><td>${m.tipo==='saida'?'R$ '+m.valor.toFixed(2):''}</td><td>${m.observacoes}</td></tr>`).join(''); } }
    function updateCaixa() { const e = caixa.filter(m=>m.tipo==='entrada').reduce((a,c)=>a+c.valor,0), s = caixa.filter(m=>m.tipo==='saida').reduce((a,c)=>a+c.valor,0); document.getElementById('total-entradas').textContent = `R$ ${e.toFixed(2)}`; document.getElementById('total-saidas').textContent = `R$ ${s.toFixed(2)}`; document.getElementById('caixa-atual').textContent = `R$ ${(e-s).toFixed(2)}`; }
    function renderEstoqueTable() { const t = document.querySelector('#estoque-table tbody'); if (!t) return; t.innerHTML = estoque.map(p => { const totalCustos = (p.custos || []).reduce((acc, c) => acc + c.valor, 0); const lucro = p.venda - p.compra - totalCustos; return `<tr data-id="${p.id}"><td>${p.produto}</td><td>${p.descricao}</td><td>R$ ${p.compra.toFixed(2)}</td><td>R$ ${totalCustos.toFixed(2)}</td><td>R$ ${p.venda.toFixed(2)}</td><td>R$ ${lucro.toFixed(2)}</td><td><button class="btn-custo">Custos</button></td></tr>`; }).join(''); }
    function addMessageToChat(msg, type) { const c = document.getElementById('chatbot-messages'); if (c) { c.innerHTML += `<div class="${type}">${msg}</div>`; c.scrollTop = c.scrollHeight; } }
    function renderChatHistory() { const c = document.getElementById('chatbot-messages'); if (!c) return; c.innerHTML = ''; if (chatHistory.length === 0) { addMessageToChat("Olá! Como posso ajudar?", 'bot-message'); } else { chatHistory.forEach(m => addMessageToChat(m.parts[0].text, m.role === 'user' ? 'user-message' : 'bot-message')); } }
    function renderMentoria() {
        const menu = document.getElementById('mentoria-menu'); const content = document.getElementById('mentoria-content'); if (!menu || !content) return;
        menu.innerHTML = mentoriaData.map((mod, i) => `<div class="sales-accelerator-menu-item ${i === 0 ? 'active' : ''}" data-module-id="${mod.moduleId}">${mod.title}</div>`).join('');
        content.innerHTML = mentoriaData.map((mod, i) => { const placeholder = `Digite aqui suas anotações e o exercício prático para o Módulo ${i + 1}...\n\nExemplo: Qual é a principal dor da minha persona que meu serviço resolve?`; return `<div class="mentoria-module-content ${i === 0 ? 'active' : ''}" id="${mod.moduleId}">${mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content || les.description}</p></div>`).join('')}<div class="anotacoes-aluno"><label for="notas-${mod.moduleId}">Minhas Anotações / Exercícios</label><textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="8" placeholder="${placeholder}"></textarea></div></div>`; }).join('');
        document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => { item.addEventListener('click', e => { document.querySelectorAll('.sales-accelerator-menu-item, .mentoria-module-content').forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active'); document.getElementById(e.currentTarget.dataset.moduleId).classList.add('active'); }); });
        document.querySelectorAll('.mentoria-notas').forEach(t => t.addEventListener('keyup', () => saveUserData(userId)));
    }
    function getMentoriaNotes() { const n = {}; document.querySelectorAll('.mentoria-notas').forEach(t => n[t.id] = t.value); return n; }
    function loadMentoriaNotes(notes = {}) { for (const id in notes) { const t = document.getElementById(id); if (t) t.value = notes[id]; } }
});
