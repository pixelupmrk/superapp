// ====================================================================
// script.js - VERSÃO FINAL E FUNCIONAL COM CHAT, ESTOQUE E CORREÇÕES DE SINTAXE
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
    // --- DADOS COMPLETOS DA MENTORIA ---
    const mentoriaData = [
        // ... (Dados da mentoria - mantidos iguais ao original) ...
        { "moduleId": "MD01", "title": "Módulo 1: Conectando com o Cliente Ideal", "exercisePrompt": "Exercício Módulo 1:\n\n1. Descreva sua persona (cliente ideal).\n2. Qual é a principal dor que seu serviço resolve?\n3. Escreva sua Proposta de Valor.", "lessons": [ { "lessonId": "L01.01", "title": "Questionário para Definição de Persona", "content": "Antes de qualquer estratégia, é essencial saber com quem você está falando. O questionário irá ajudar a identificar o perfil do seu cliente ideal. Use o CRM para registrar as respostas e começar a segmentar seus leads.\n\nPerguntas do Questionário:\n1. Nome fictício da persona:\n2. Idade aproximada:\n3. Profissão ou ocupação:\n4. Quais são suas dores e dificuldades?\n5. Quais são seus desejos ou objetivos?\n6. Onde essa pessoa busca informação?\n7. Quais redes sociais essa pessoa usa com frequência?\n8. Que tipo de conteúdo ela consome?" }, { "lessonId": "L01.02", "title": "Proposta de Valor e Posicionamento", "content": "Com base na persona, vamos definir a proposta de valor do seu serviço. A proposta responde: 'Eu ajudo [persona] a [solução] através de [diferencial do seu serviço].'\n\nExemplo: Ajudo [vendedores autônomos] a [acelerar vendas] usando [o super app com CRM e automação]." } ] },
        { "moduleId": "MD02", "title": "Módulo 2: O Algoritmo da Meta", "exercisePrompt": "Exercício Módulo 2:\n\n1. Crie 3 ganchos para um vídeo sobre seu serviço.\n2. Liste 2 tipos de conteúdo que geram mais salvamentos.", "lessons": [ { "lessonId": "L02.01", "content": "O algoritmo da Meta analisa o comportamento dos usuários para decidir o que mostrar. Ele prioriza conteúdos que geram interação rápida. Quanto mais relevante for o seu conteúdo para o público, mais ele será entregue." }, { "lessonId": "L02.03", "content": "O primeiro segundo do seu conteúdo precisa chamar a atenção imediatamente. Depois do gancho, entregue valor real e finalize com uma chamada para ação (CTA). Exemplo de ganchos: 'Você está postando, mas ninguém engaja? Isso aqui é pra você.'" } ] },
        { "moduleId": "MD03", "title": "Módulo 3: Cronograma de Postagens", "exercisePrompt": "Exercício Módulo 3:\n\n1. Defina a frequência ideal de postagens para você.\n2. Monte um cronograma de conteúdo para a próxima semana.", "lessons": [ { "lessonId": "L03.01", "content": "O ideal é postar quando seu público está mais ativo (geralmente entre 11h e 13h ou 18h e 20h, de terça a quinta). Use as métricas do Instagram para ver quando seus seguidores estão online." }, { "lessonId": "L03.03", "content": "Utilize um calendário para organizar o conteúdo por dia da semana:\nSegunda-feira: Conteúdo Educativo\nTerça-feira: Prova Social (depoimento)\nQuarta-feira: Vídeo Reels\nQuinta-feira: Dica + Engajamento\nSexta-feira: Chamada para Ação/Oferta\nSábado: Conteúdo leve/Bastidor\nDomingo: (Opcional) Inspiração" } ] },
        { "moduleId": "MD04", "title": "Módulo 4: Conteúdo que Conecta", "exercisePrompt": "Exercício Módulo 4:\n\n1. Escreva um roteiro curto para um vídeo.\n2. Quais são as 2 cores principais da sua marca?", "lessons": [ { "lessonId": "L04.01", "content": "Um vídeo precisa seguir uma estrutura estratégica: Gancho (1º segundo), Valor (dica ou solução) e CTA (chamada para ação). Exemplo: 'Você quer mais clientes? Então evite esse erro aqui...'" } ] },
        { "moduleId": "MD05", "title": "Módulo 5: Copywriting com ChatGPT", "exercisePrompt": "Exercício Módulo 5:\n\n1. Use a fórmula PAS (Problema, Agitação, Solução) para escrever uma legenda de post.\n2. Crie um prompt para o ChatGPT pedindo 3 ideias de conteúdo.", "lessons": [ { "lessonId": "L05.01", "content": "O ChatGPT é uma ferramenta poderosa para gerar textos que vendem. A chave está em saber o que pedir e como direcionar a IA com clareza. Use as fórmulas de copy para montar seus prompts." }, { "lessonId": "L05.02", "content": "Aprenda a usar as estruturas de texto persuasivo:\nAIDA: Atenção, Interesse, Desejo, Ação\nPAS: Problema, Agitação, Solução" } ] },
        { "moduleId": "MD06", "title": "Módulo 6: Implementação de CRM", "exercisePrompt": "Exercício Módulo 6:\n\n1. Defina as etapas do seu funil de vendas.\n2. Crie um lead de teste no CRM e mova-o pelo funil.", "lessons": [ { "lessonId": "L06.01", "content": "CRM (Customer Relationship Management) é uma ferramenta que organiza o relacionamento com seus leads e clientes, acompanhando-os desde o primeiro contato até o fechamento da venda." }, { "lessonId": "L06.02", "content": "Construção de Funil de Vendas Básico", "content": "Um funil simples pode ter 4 etapas: Contato Inicial, Conversa/Apresentação, Proposta Enviada, Cliente Fechado. O super app ajudará a organizar os leads por estágio para manter a eficiência." } ] },
        { "moduleId": "MD07", "title": "Módulo 7: Processo Comercial", "exercisePrompt": "Exercício Módulo 7:\n\n1. Escreva seu pitch de vendas em uma única frase.\n2. Qual gatilho mental faz mais sentido para sua oferta?", "lessons": [ { "lessonId": "L07.01", "content": "O pitch é a sua 'apresentação relâmpago'. Ele precisa ser claro e direto. Inclua: Quem você ajuda, o problema que resolve e o diferencial do seu serviço. Exemplo: 'Nós ajudamos negócios locais a atrair clientes todos os dias usando vídeos e tráfego pago.'" } ] },
        { "moduleId": "MD08", "title": "Módulo 8: Conexão com a Audiência", "exercisePrompt": "Exercício Módulo 8:\n\n1. Liste 3 ideias de conteúdo de bastidores para os Stories.\n2. Escreva uma pergunta para fazer em uma enquete.", "lessons": [ { "lessonId": "L08.01", "content": "Pessoas se conectam com pessoas. Mostrar sua rotina e bastidores cria empatia. Seja autêntico, não perfeito. Use a câmera frontal e fale como se fosse para um amigo." } ] }
    ];

    let leads = [], caixa = [], estoque = [], chatHistory = [];
    let nextLeadId = 0, currentLeadId = null, draggedItem = null, currentProductId = null;
    let statusChart;
    let db;
    let unsubscribeLeadChatListener = null;
    let whatsappEventsSource = null;
    let botInstructions = "";
    let keepAliveInterval = null;

    // URL BASE DO SEU BOT DE WHATSAPP NO RENDER (CONFIRMADA NO LOG)
    const WHATSAPP_BOT_URL = 'https://superapp-whatsapp-bot.onrender.com';

    // === FUNÇÕES AUXILIARES DE CONFIGURAÇÃO E DADOS ===
    function applySettings(settings = {}) {
        const theme = settings.theme || 'dark';
        const userName = settings.userName || 'Usuário';
        document.body.className = theme === 'light' ? 'light-theme' : '';
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if(themeToggleBtn) {
            const isLight = document.body.classList.contains('light-theme');
            themeToggleBtn.textContent = isLight ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro';
        }
        const userProfileSpan = document.querySelector('.user-profile span');
        if(userProfileSpan) userProfileSpan.textContent = `Olá, ${userName}`;
        const settingUserName = document.getElementById('setting-user-name');
        if(settingUserName) settingUserName.value = userName;
    }

    function getMentoriaNotes() { 
        const n = {}; 
        document.querySelectorAll('.mentoria-notas').forEach(t => n[t.id] = t.value); 
        return n; 
    }

    function loadMentoriaNotes(notes = {}) { 
        for (const id in notes) { 
            const t = document.getElementById(id); 
            if (t) t.value = notes[id]; 
        } 
    }
    
    function addMessageToChat(msg, type, containerId) {
        const c = document.getElementById(containerId);
        if (c) {
            if(type !== 'bot-thinking' && document.querySelector(`#${containerId} .bot-thinking`)) {
                 document.querySelector(`#${containerId} .bot-thinking`)?.remove();
            }
            c.innerHTML += `<div class="${type}">${msg}</div>`;
            c.scrollTop = c.scrollHeight;
        }
    }

    function renderChatHistory(containerId, history) {
        const c = document.getElementById(containerId);
        if (!c) return;
        c.innerHTML = '';
        
        if (!history || history.length === 0) {
            addMessageToChat("Nenhuma conversa ainda. Envie a primeira mensagem ou o Lead pode iniciar.", 'bot-message', containerId);
        } else {
            document.querySelector(`#${containerId} .bot-thinking`)?.remove();
            history.forEach(m => addMessageToChat(m.text, m.role, containerId));
        }
    }


    // === FUNÇÕES DE DADOS E ESTADO ===
    
    async function loadAllUserData(userId) {
        try {
            const doc = await db.collection('userData').doc(userId).get();
            if (doc.exists) {
                const data = doc.data();
                leads = data.leads || [];
                caixa = data.caixa || [];
                estoque = data.estoque || [];
                estoque.forEach((item, index) => { if (!item.id) item.id = `prod_${Date.now()}_${index}`; });
                chatHistory = data.chatHistory || [];
                
                const instructionsElement = document.getElementById('bot-instructions');
                botInstructions = instructionsElement?.value || data.botInstructions || instructionsElement?.placeholder || "Você é um assistente virtual prestativo.";

                nextLeadId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 0;
                applySettings(data.settings);
                loadMentoriaNotes(data.mentoriaNotes);

                if (instructionsElement) {
                    instructionsElement.value = botInstructions;
                }
            } else {
                applySettings();
            }
            renderMentoria();
            updateAllUI();
        } catch (error) { console.error("Erro ao carregar dados:", error); }
    }

    async function saveUserData(userId, showSuccessAlert = false) {
        try {
            const dataToSave = {
                leads, caixa, estoque, chatHistory,
                mentoriaNotes: getMentoriaNotes(),
                botInstructions: document.getElementById('bot-instructions')?.value || botInstructions, 
                settings: {
                    theme: document.body.classList.contains('light-theme') ? 'light' : 'dark',
                    userName: document.getElementById('setting-user-name').value || 'Usuário',
                }
            };
            await db.collection('userData').doc(userId).set(dataToSave, { merge: true });
            if (showSuccessAlert) {
                alert('Configurações salvas com sucesso!');
            }
        } catch (error) {
            console.error("ERRO CRÍTICO AO SALVAR DADOS NO FIRESTORE:", error);
            alert("Atenção: Não foi possível salvar os dados.");
        }
    }
    
    // === FUNÇÃO CRÍTICA: INICIA O LISTENER DE CHAT EM TEMPO REAL (NOVA FUNCIONALIDADE) ===
    function startLeadChatListener(userId, leadId) {
        const chatContainerId = 'lead-chatbot-messages';
        
        if (window.unsubscribeLeadChatListener) {
            window.unsubscribeLeadChatListener();
        }

        const chatRef = db.collection('userData').doc(userId).collection('leads').doc(String(leadId)).collection('chatHistory');
        
        window.unsubscribeLeadChatListener = chatRef.orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                const history = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    let roleClass = 'bot-message';
                    if (data.sender === 'user' || data.role === 'user') {
                        roleClass = 'user-message';
                    } else if (data.sender === 'bot' || data.sender === 'model' || data.sender === 'operator' || data.role === 'model') {
                        roleClass = 'bot-message';
                    }

                    history.push({ 
                        role: roleClass, 
                        text: data.text 
                    });
                });

                renderChatHistory(chatContainerId, history); 
                updateAllUI(); 

            }, error => {
                console.error("Erro ao ouvir o histórico de chat:", error);
                addMessageToChat("Erro: Falha na conexão em tempo real com o chat.", 'bot-message error', chatContainerId);
            });
    }

    // --- FUNÇÃO CRÍTICA: ABRE O MODAL E INICIA O CHAT ---
    async function openEditModal(leadId) { 
        currentLeadId = leadId; 
        const lead = leads.find(l => l.id === leadId); 
        const userId = firebase.auth().currentUser.uid;
        const toggleBotBtn = document.getElementById('toggle-bot-btn');

        if(lead) { 
            if(lead.unreadCount > 0) {
                lead.unreadCount = 0;
                await saveUserData(userId);
            }

            // Preenche os campos do modal (utilizando o código do seu original)
            document.getElementById('edit-lead-name').value = lead.nome; 
            document.getElementById('edit-lead-email').value = lead.email || ''; 
            document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || ''; 
            document.getElementById('edit-lead-status').value = lead.status; 
            document.getElementById('edit-lead-origem').value = lead.origem || ''; 
            document.getElementById('edit-lead-qualification').value = lead.qualificacao || ''; 
            document.getElementById('edit-lead-notes').value = lead.notas || '';

            // Campos de Agendamento
            const editLeadDate = document.getElementById('edit-lead-date');
            if (editLeadDate) editLeadDate.value = lead.scheduledDate || '';

            const editLeadTime = document.getElementById('edit-lead-time');
            if (editLeadTime) editLeadTime.value = lead.scheduledTime || '';

            const editLeadReminderType = document.getElementById('edit-lead-reminder-type');
            if (editLeadReminderType) editLeadReminderType.value = lead.reminderType || 'none';
            
            // Lógica do botão Ativar/Desativar
            const botActive = lead.botActive === undefined ? true : lead.botActive; 
            if (toggleBotBtn) {
                 toggleBotBtn.textContent = botActive ? 'Desativar Bot' : 'Ativar Bot';
                 toggleBotBtn.classList.toggle('btn-delete', botActive); 
                 toggleBotBtn.classList.toggle('btn-save', !botActive);
            }

            // Inicia o listener em tempo real para o chat
            const chatContainer = document.getElementById('lead-chatbot-messages');
            if (chatContainer) {
                chatContainer.innerHTML = '';
                addMessageToChat("Carregando histórico...", 'bot-message bot-thinking', 'lead-chatbot-messages');
            }
            setupLeadChatListener(lead.id);

            // Exibe o modal
            document.getElementById('edit-lead-modal').style.display = 'flex'; 
        } 
    }

    
    // --- LÓGICA DE CONEXÃO DO WHATSAPP BOT (MANTIDA ATIVA) ---
    function startKeepAlive() {
        if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
        }
        const currentUserId = firebase.auth().currentUser.uid;

        const cutucarBot = async () => {
             try {
                 await fetch(`${WHATSAPP_BOT_URL}/status?userId=${currentUserId}`);
             } catch (error) {
                 // Falha silenciosa é intencional
             }
        };

        keepAliveInterval = setInterval(cutucarBot, 30000);
        console.log("[KeepAlive] Serviço de prevenção de sono do Bot iniciado.");
    }

    function setupWhatsappBotConnection() {
        const currentUserId = firebase.auth().currentUser?.uid;
        if (currentUserId) {
            startKeepAlive();
            // ... (Seu código de setupWhatsappBotConnection original para a aba de status deve vir aqui)
        }
    }


    // === FUNÇÃO DE EVENT LISTENERS ===
    function setupEventListeners(userId) {
        const menuToggle = document.getElementById('menu-toggle');
        const appContainer = document.getElementById('app-container');

        if (menuToggle && appContainer) {
            menuToggle.addEventListener('click', () => {
                appContainer.classList.toggle('sidebar-visible');
            });
        }
        
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', e => {
                if (window.innerWidth <= 768) {
                    appContainer.classList.remove('sidebar-visible');
                }
                if (e.currentTarget.id === 'logout-btn') return;
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

        document.getElementById('theme-toggle-btn')?.addEventListener('click', () => { document.body.classList.toggle('light-theme'); const isLight = document.body.classList.contains('light-theme'); document.getElementById('theme-toggle-btn').textContent = isLight ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro'; saveUserData(userId); });
        
        document.getElementById('save-settings-btn')?.addEventListener('click', async () => {
            await saveUserData(userId, true);
        });
        
        document.getElementById('lead-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            leads.push({ id: nextLeadId++, status: 'novo', nome: document.getElementById('lead-name').value, email: document.getElementById('lead-email').value, whatsapp: document.getElementById('lead-whatsapp').value, origem: document.getElementById('lead-origin').value, qualificacao: document.getElementById('lead-qualification').value, notas: document.getElementById('lead-notes').value, chatHistory: [], botActive: true, unreadCount: 0 }); 
            await saveUserData(userId);
            updateAllUI();
            e.target.reset();
        });

        const kanbanBoard = document.getElementById('kanban-board');
        if (kanbanBoard) {
            kanbanBoard.addEventListener('dragstart', e => { if (e.target.classList.contains('kanban-card')) { draggedItem = e.target; } });
            kanbanBoard.addEventListener('dragend', () => { draggedItem = null; });
            kanbanBoard.addEventListener('dragover', e => e.preventDefault());
            kanbanBoard.addEventListener('drop', async (e) => {
                e.preventDefault();
                const column = e.target.closest('.kanban-column');
                if (column && draggedItem) {
                    const lead = leads.find(l => l.id == draggedItem.dataset.id);
                    if (lead) {
                        lead.status = column.dataset.status;
                        await saveUserData(userId);
                        renderKanbanCards();
                        updateDashboard();
                    }
                }
            });
            kanbanBoard.addEventListener('click', e => { if (e.target.tagName === 'A') { e.stopPropagation(); return; } const card = e.target.closest('.kanban-card'); if (card) openEditModal(parseInt(card.dataset.id)); });
        }

        document.getElementById('leads-table')?.addEventListener('click', e => { if (e.target.tagName === 'A') { e.stopPropagation(); return; } if (e.target.closest('.btn-edit-table')) openEditModal(parseInt(e.target.closest('tr').dataset.id)); if (e.target.closest('.btn-delete-table')) { if (confirm('Tem certeza?')) { leads = leads.filter(l => l.id != parseInt(e.target.closest('tr').dataset.id)); saveUserData(userId); updateAllUI(); } } });

        // Bloco de salvar agendamento e informações do lead (DO SEU CÓDIGO ORIGINAL)
        document.getElementById('edit-lead-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const lead = leads.find(l => l.id === currentLeadId);
            if(lead) {
                lead.nome = document.getElementById('edit-lead-name').value;
                lead.email = document.getElementById('edit-lead-email').value;
                lead.whatsapp = document.getElementById('edit-lead-whatsapp').value;
                lead.status = document.getElementById('edit-lead-status').value;
                lead.origem = document.getElementById('edit-lead-origem').value;
                lead.qualificacao = document.getElementById('edit-lead-qualification').value;
                lead.notas = document.getElementById('edit-lead-notes').value;

                // Salvar Campos de Agendamento
                const reminderType = document.getElementById('edit-lead-reminder-type').value;
                lead.scheduledDate = document.getElementById('edit-lead-date').value;
                lead.scheduledTime = document.getElementById('edit-lead-time').value;
                lead.reminderType = reminderType;

                if (reminderType === 'none') {
                    delete lead.scheduledDate;
                    delete lead.scheduledTime;
                    delete lead.reminderType;
                }

                await saveUserData(userId);
                updateAllUI();

                if (unsubscribeLeadChatListener) unsubscribeLeadChatListener();
                document.getElementById('edit-lead-modal').style.display = 'none';
            }
        });

        document.getElementById('delete-lead-btn')?.addEventListener('click', async () => {
            if (confirm('Tem certeza?')) {
                leads = leads.filter(l => l.id !== currentLeadId);
                await saveUserData(userId);
                updateAllUI();
                if (unsubscribeLeadChatListener) unsubscribeLeadChatListener();
                document.getElementById('edit-lead-modal').style.display = 'none';
            }
        });

        document.getElementById('toggle-bot-btn')?.addEventListener('click', async () => {
            const lead = leads.find(l => l.id === currentLeadId);
            if (lead) {
                lead.botActive = lead.botActive === undefined ? false : !lead.botActive; 
                await saveUserData(userId);
                openEditModal(currentLeadId);
            }
        });

        document.getElementById('caixa-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            caixa.push({ data: document.getElementById('caixa-data').value, descricao: document.getElementById('caixa-descricao').value, valor: parseFloat(document.getElementById('caixa-valor').value), tipo: document.getElementById('caixa-tipo').value });
            await saveUserData(userId);
            renderCaixaTable();
            updateCaixa();
            e.target.reset();
        });

        document.querySelectorAll('.finance-tab').forEach(tab => { tab.addEventListener('click', e => { e.preventDefault(); document.querySelectorAll('.finance-tab, .finance-content').forEach(el => el.classList.remove('active')); e.target.classList.add('active'); document.getElementById(e.target.dataset.tab + '-tab-content').classList.add('active'); }); });

        document.getElementById('estoque-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newProduct = { id: `prod_${Date.now()}`, produto: document.getElementById('estoque-produto').value, descricao: document.getElementById('estoque-descricao').value, compra: parseFloat(document.getElementById('estoque-compra').value), venda: parseFloat(document.getElementById('estoque-venda').value), custos: [] };
            estoque.push(newProduct);
            await saveUserData(userId);
            renderEstoqueTable();
            e.target.reset();
        });

        document.getElementById('estoque-search')?.addEventListener('input', renderEstoqueTable);

        document.getElementById('estoque-table')?.addEventListener('click', async (e) => {
            if (e.target.closest('.btn-custo')) {
                const productId = e.target.closest('tr').dataset.id;
                openCustosModal(productId);
            }
            if (e.target.closest('.btn-delete-estoque')) {
                if (confirm('Tem certeza?')) {
                    const productId = e.target.closest('tr').dataset.id;
                    estoque = estoque.filter(p => p.id !== productId);
                    await saveUserData(userId);
                    renderEstoqueTable();
                }
            }
        });

        document.getElementById('add-custo-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const produto = estoque.find(p => p.id === currentProductId);
            if (produto) {
                const descricao = document.getElementById('custo-descricao').value;
                const valor = parseFloat(document.getElementById('custo-valor').value);
                if (!produto.custos) produto.custos = [];
                produto.custos.push({ descricao, valor });
                await saveUserData(userId);
                renderCustosList(produto);
                renderEstoqueTable();
                e.target.reset();
            }
        });

        document.getElementById('export-leads-btn')?.addEventListener('click', () => { if (leads.length === 0) { alert("Não há leads para exportar."); return; } const header = ["Nome", "Email", "WhatsApp", "Origem", "Qualificação", "Status", "Notas"]; const rows = leads.map(l => [l.nome, l.email, l.whatsapp, l.origem, l.qualificacao, l.status, `"${(l.notas || '').replace(/"/g, '""')}"`]); const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "Leads"); XLSX.writeFile(workbook, "leads.xlsx"); });
        document.getElementById('export-csv-btn')?.addEventListener('click', () => { if (estoque.length === 0) { alert("Não há produtos para exportar."); return; } const header = ["Produto", "Descrição", "Valor de Compra", "Valor de Venda"]; const rows = estoque.map(p => [p.produto, p.descricao, p.compra, p.venda]); const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque"); XLSX.writeFile(workbook, "estoque.xlsx"); });
        document.getElementById('import-csv-btn')?.addEventListener('click', () => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'; input.onchange = e => { const file = e.target.files[0]; const reader = new FileReader(); reader.onload = async (event) => { const data = new Uint8Array(event.target.result); const workbook = XLSX.read(data, {type: 'array'}); const ws = workbook.Sheets[workbook.SheetNames[0]]; const json = XLSX.utils.sheet_to_json(ws); json.forEach(item => { const pKey = Object.keys(item).find(k=>k.toLowerCase()==='produto'); const cKey = Object.keys(item).find(k=>k.toLowerCase().includes('compra')); const vKey = Object.keys(item).find(k=>k.toLowerCase().includes('venda')); if(item[pKey] && item[cKey] && item[vKey]){ estoque.push({ id: `prod_${Date.now()}_${Math.random()}`, produto: item[pKey], descricao: item['Descrição']||item['descricao']||'', compra: parseFloat(item[cKey]), venda: parseFloat(item[vKey]), custos: [] }); } }); await saveUserData(userId); renderEstoqueTable(); alert(`${json.length} produtos importados!`); }; reader.readAsArrayBuffer(file); }; input.click(); });

        // CHATBOT PRINCIPAL (USANDO A ROTA /api/gemini.js)
        document.getElementById('chatbot-form')?.addEventListener('submit', async e => {
            e.preventDefault();
            const chatbotInput = document.getElementById('chatbot-input');
            const userInput = chatbotInput.value.trim();
            if (!userInput) return;
            addMessageToChat(userInput, 'user-message', 'chatbot-messages');
            chatHistory.push({ role: "user", parts: [{ text: userInput }] });
            chatbotInput.value = '';
            addMessageToChat("Pensando...", 'bot-message bot-thinking', 'chatbot-messages');
            try {
                const response = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: userInput, history: chatHistory })
                });

                document.querySelector('#chatbot-messages .bot-thinking')?.remove();
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details || 'Erro desconhecido na API');
                }
                const data = await response.json();
                addMessageToChat(data.text, 'bot-message', 'chatbot-messages');
                chatHistory.push({ role: "model", parts: [{ text: data.text }] });
            } catch (error) {
                document.querySelector('#chatbot-messages .bot-thinking')?.remove();
                addMessageToChat(`Erro: ${error.message}`, 'bot-message', 'chatbot-messages');
            }
            await saveUserData(userId);
        });

        // CHATBOT DO LEAD (NO MODAL)
        document.getElementById('lead-chatbot-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('lead-chatbot-input');
            const userInput = input.value.trim();
            if (!userInput || currentLeadId === null) return;

            const lead = leads.find(l => l.id === currentLeadId);
            if (!lead) return;

            const isBotActive = lead.botActive === undefined ? true : lead.botActive;
            const userId = firebase.auth().currentUser.uid;
            const chatContainerId = 'lead-chatbot-messages';

            // 1. Adiciona a mensagem do operador IMEDIATAMENTE (Sua mensagem)
            addMessageToChat(userInput, 'user-message', chatContainerId);
            input.value = '';

            if (!isBotActive) {
                // --- BOT DESATIVADO: ENVIO DIRETO PARA WHATSAPP (Via /send do Render)

                try {
                    // 2. SALVA A MENSAGEM NO HISTÓRICO COMO OPERADOR (role: "model")
                    //    -> O listener do Firestore já fará isso aparecer na tela.

                    // 3. ENVIAR DIRETAMENTE PARA O WHATSAPP
                    const sendResponse = await fetch(`${WHATSAPP_BOT_URL}/send`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: lead.whatsapp,
                            text: userInput,
                            userId: userId,
                            leadId: currentLeadId // <<< CORREÇÃO APLICADA AQUI
                        })
                    });

                    if (!sendResponse.ok) {
                        const errorData = await sendResponse.json();
                        throw new Error(errorData.error || 'Falha no envio da mensagem via Bot API.');
                    }
                    // 4. O listener já atualizou o chat com a mensagem salva pelo backend do bot.

                } catch (error) {
                    console.error("Erro ao enviar mensagem como operador:", error);
                    addMessageToChat(`ERRO DE ENVIO: ${error.message}. Verifique o console do Bot.`, 'bot-message', chatContainerId);
                }

            } else {
                // --- BOT ATIVO: CHAMA CLOUD FUNCTION (Fluxo IA)

                addMessageToChat("Pensando...", 'bot-message bot-thinking', chatContainerId);

                try {
                    // O Cloud Function startAiChat SALVA A MENSAGEM DO OPERADOR e INICIA A RESPOSTA DA IA
                    const startChat = firebase.functions().httpsCallable('startAiChat');
                    await startChat({ prompt: userInput, leadId: currentLeadId });
                    // O listener (setupLeadChatListener) cuidará de mostrar a resposta da IA

                } catch (error) {
                    document.querySelector(`#${chatContainerId} .bot-thinking`)?.remove();
                    const errorMessage = error.message.includes('permission-denied') ? 'Erro de permissão do Firebase Functions.' : error.message;
                    addMessageToChat(`Erro ao iniciar chat do Lead: ${errorMessage}`, 'bot-message', chatContainerId);
                }
            }
        });

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                // Fecha o modal
                document.getElementById(btn.dataset.target).style.display = 'none';
                // DESATIVA O LISTENER DE CHAT AO FECHAR O MODAL
                if (unsubscribeLeadChatListener) {
                    unsubscribeLeadChatListener();
                    unsubscribeLeadChatListener = null;
                }
            });
        });

        // NOVO: Funcionalidade para fechar o modal ao clicar no overlay (clicar fora)
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                // Verifica se o clique foi exatamente no overlay (e não dentro do modal-content)
                if (e.target.classList.contains('modal-overlay')) {
                    const modalId = e.target.id;
                    document.getElementById(modalId).style.display = 'none';

                    // Se for o modal de edição de lead, desativa o listener de chat
                    if (modalId === 'edit-lead-modal' && unsubscribeLeadChatListener) {
                        unsubscribeLeadChatListener();
                        unsubscribeLeadChatListener = null;
                    }
                }
            });
        });
    }

    // Ações Finais
    main(); 
    setInterval(updateAllUI, 60000);
});
