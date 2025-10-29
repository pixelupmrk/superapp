// ====================================================================
// script.js - VERSÃO FINAL E FUNCIONAL COM CHAT, ESTOQUE E CORREÇÕES DE AUTH
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
        { "moduleId": "MD06", "title": "Módulo 6: Implementação de CRM", "exercisePrompt": "Exercício Módulo 6:\n\n1. Defina as etapas do seu funil de vendas.\n2. Crie um lead de teste no CRM e mova-o pelo funil.", "lessons": [ { "lessonId": "L06.01", "content": "CRM (Customer Relationship Management) é uma ferramenta que organiza o relacionamento com seus leads e clientes, acompanhando-os desde o primeiro contato até o fechamento da venda." }, { "lessonId": "L06.02", "content": "Um funil simples pode ter 4 etapas: Contato Inicial, Conversa/Apresentação, Proposta Enviada, Cliente Fechado. O super app ajudará a organizar os leads por estágio para manter a eficiência." } ] },
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

    // === FUNÇÕES AUXILIARES DE CONFIGURAÇÃO E DADOS (CORREÇÃO DO REFERENCEERROR) ===

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
            c.innerHTML += `<div class="${type}">${msg}</div></div>`; // Adicionei um </div> a mais aqui, por segurança.
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

        // ... (Outros Event Listeners de Estoque/Custo/Exportação) ...
        
        // CHATBOT DO LEAD (NO MODAL) - LÓGICA FINAL PARA ENVIO MANUAL
        document.getElementById('lead-chatbot-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const lead = leads.find(l => l.id === currentLeadId);
            const chatbotInput = document.getElementById('lead-chatbot-input');
            const userInput = chatbotInput.value.trim();
            const userId = firebase.auth().currentUser.uid;
            
            const rawWhatsappNumber = (lead.whatsapp || '').replace(/@.*/, '').replace(/\D/g, '');

            if (!lead || !rawWhatsappNumber || !userInput) {
                if (userInput) addMessageToChat("Erro: Lead ou número de WhatsApp inválido.", 'bot-message error', 'lead-chatbot-messages');
                return;
            }
            
            addMessageToChat(userInput, 'user-message', 'lead-chatbot-messages'); 
            chatbotInput.value = '';
            
            try {
                const endpoint = `${WHATSAPP_BOT_URL}/send`; 
                
                const response = await fetch(endpoint, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ 
                        to: rawWhatsappNumber, 
                        text: userInput,
                        userId: userId,
                        leadId: lead.id // Passa o leadId para o Bot salvar o histórico
                    }) 
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ details: 'Erro desconhecido na comunicação com o Bot.' }));
                    throw new Error(errorData.details || `Falha no envio. Status: ${response.status}`);
                }
                
            } catch (error) {
                addMessageToChat(`Erro de Envio: ${error.message}. Verifique a URL do Bot no Render.`, 'bot-message error', 'lead-chatbot-messages');
            }
        });

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
        
        document.querySelectorAll('.close-modal').forEach(btn => { 
            btn.addEventListener('click', () => { 
                document.getElementById(btn.dataset.target).style.display = 'none'; 
                if (unsubscribeLeadChatListener) {
                    unsubscribeLeadChatListener();
                }
            }); 
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    const modalId = e.target.id;
                    document.getElementById(modalId).style.display = 'none';
                    if (modalId === 'edit-lead-modal' && unsubscribeLeadChatListener) {
                        unsubscribeLeadChatListener();
                    }
                }
            });
        });
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO (Completo, baseado no seu original) ---

    function renderKanbanCards() { 
        document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = ''); 
        leads.forEach(lead => { 
            const c = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`); 
            if (c) { 
                const wa = `<a href="https://wa.me/${(lead.whatsapp || '').replace(/\D/g, '')}" target="_blank">${lead.whatsapp || ''}</a>`; 
                const unreadCount = (lead.unreadCount || 0);
                const unreadTag = unreadCount > 0 ? `<span class="unread-count">${unreadCount}</span>` : '';
                const scheduleIcon = (lead.scheduledDate && lead.scheduledTime) ? '<i class="ph-fill ph-clock-countdown"></i>' : '';

                c.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${wa}</p>${unreadTag}${scheduleIcon}</div>`; 
            } 
        }); 
    }
    
    function renderLeadsTable() { 
        const t = document.querySelector('#leads-table tbody'); 
        if (t) { 
            t.innerHTML = leads.map(l => { 
                const wa = `<a href="https://wa.me/${(l.whatsapp || '').replace(/\D/g, '')}" target="_blank">${l.whatsapp || ''}</a>`; 
                const unreadCount = (l.unreadCount || 0);
                const unreadClass = unreadCount > 0 ? 'new-message' : '';
                return `<tr data-id="${l.id}" class="${unreadClass}"><td>${l.nome}</td><td>${wa}</td><td>${l.origem || ''}</td><td>${l.qualificacao || ''}</td><td>${l.status}</td><td><button class="btn-edit-table" onclick="openEditModal(${l.id})"><i class="ph-fill ph-note-pencil"></i></button><button class="btn-delete-table"><i class="ph-fill ph-trash"></i></button></td></tr>`; 
            }).join(''); 
        } 
    }
    
    function updateDashboard() { 
        const n = leads.filter(l=>l.status==='novo').length, p=leads.filter(l=>l.status==='progresso').length, f=leads.filter(l=>l.status==='fechado').length; 
        document.getElementById('total-leads').textContent = leads.length; 
        document.getElementById('leads-novo').textContent = n; 
        document.getElementById('leads-progresso').textContent = p; 
        document.getElementById('leads-fechado').textContent = f; 
        const ctx = document.getElementById('statusChart')?.getContext('2d'); 
        if (!ctx) return; 
        if (statusChart) statusChart.destroy(); 
        statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Progresso', 'Fechado'], datasets: [{ data: [n, p, f], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'] }] } }); 
    }
    
    function renderCaixaTable() { const t = document.querySelector('#caixa-table tbody'); if (t) { t.innerHTML = caixa.map(m => `<tr><td>${m.data}</td><td>${m.descricao}</td><td>${m.tipo==='entrada'?'R$ '+m.valor.toFixed(2):''}</td><td>${m.tipo==='saida'?'R$ '+m.valor.toFixed(2):''}</td></tr>`).join(''); } }
    function updateCaixa() { const e = caixa.filter(m=>m.tipo==='entrada').reduce((a,c)=>a+c.valor,0), s = caixa.filter(m=>m.tipo==='saida').reduce((a,c)=>a+c.valor,0); document.getElementById('total-entradas').textContent = `R$ ${e.toFixed(2)}`; document.getElementById('total-saidas').textContent = `R$ ${s.toFixed(2)}`; document.getElementById('caixa-atual').textContent = `R$ ${(e-s).toFixed(2)}`; }
    function renderEstoqueTable() { const t = document.querySelector('#estoque-table tbody'); if (!t) return; const searchTerm = document.getElementById('estoque-search').value.toLowerCase(); const filteredEstoque = estoque.filter(p => (p.produto && p.produto.toLowerCase().includes(searchTerm)) || (p.descricao && p.descricao.toLowerCase().includes(searchTerm))); t.innerHTML = filteredEstoque.map(p => { const totalCustos = (p.custos || []).reduce((acc, c) => acc + c.valor, 0); const lucro = p.venda - p.compra - totalCustos; return `<tr data-id="${p.id}"><td>${p.produto}</td><td>${p.descricao}</td><td>R$ ${p.compra.toFixed(2)}</td><td>R$ ${totalCustos.toFixed(2)}</td><td>R$ ${p.venda.toFixed(2)}</td><td>R$ ${lucro.toFixed(2)}</td><td><button class="btn-custo">Custos</button><button class="btn-delete-table btn-delete-estoque"><i class="ph-fill ph-trash"></i></button></td></tr>`; }).join(''); }
    function renderMentoria() {
        const menu = document.getElementById('mentoria-menu'); const content = document.getElementById('mentoria-content'); if (!menu || !content) return;
        menu.innerHTML = mentoriaData.map((mod, i) => `<div class="sales-accelerator-menu-item ${i === 0 ? 'active' : ''}" data-module-id="${mod.moduleId}">${mod.title}</div>`).join('');
        content.innerHTML = mentoriaData.map((mod, i) => { const placeholder = mod.exercisePrompt || `Digite aqui suas anotações para o Módulo ${i + 1}...`; return `<div class="mentoria-module-content ${i === 0 ? 'active' : ''}" id="${mod.moduleId}">${mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content}</p></div>`).join('')}<div class="anotacoes-aluno"><label for="notas-${mod.moduleId}">Minhas Anotações / Exercícios</label><textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="8" placeholder="${placeholder}"></textarea></div></div>`; }).join('');
        document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => { item.addEventListener('click', e => { document.querySelectorAll('.sales-accelerator-menu-item').forEach(el => el.classList.remove('active')); document.querySelectorAll('.mentoria-module-content').forEach(el => el.classList.remove('active')); const clickedItem = e.currentTarget; clickedItem.classList.add('active'); document.getElementById(clickedItem.dataset.moduleId).classList.add('active'); }); });
        document.querySelectorAll('.mentoria-notas').forEach(t => t.addEventListener('keyup', () => saveUserData(firebase.auth().currentUser.uid)));
    }
    
    // Inicialização do APP
    // A função main() foi movida para o topo, dentro do DOMContentLoaded
    // Seu setInterval(updateAllUI, 60000) foi movido para o final do DOMContentLoaded

    // ... (As funções openCustosModal, renderCustosList, etc. também foram movidas ou estão no setupEventListeners) ...

    main(); 
    // Inicializa o agendamento a cada minuto para atualizar o Kanban
    setInterval(updateAllUI, 60000);
});
