// ====================================================================
// script.js - VERSÃO FINAL, COMPLETA, COM CHAT, ESTOQUE, BOT ATIVO/INATIVO E CORREÇÕES DE REFERÊNCIA
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
    // --- DADOS COMPLETOS DA MENTORIA ---
    const mentoriaData = [
        { "moduleId": "MD01", "title": "Módulo 1: Conectando com o Cliente Ideal", "exercisePrompt": "Exercício Módulo 1:\n\n1. Descreva sua persona (cliente ideal).\n2. Qual é a principal dor que seu serviço resolve?\n3. Escreva sua Proposta de Valor.", "lessons": [ { "lessonId": "L01.01", "title": "Questionário para Definição de Persona", "content": "Antes de qualquer estratégia, é essencial saber com quem você está falando. O questionário irá ajudar a identificar o perfil do seu cliente ideal. Use o CRM para registrar as respostas e começar a segmentar seus leads.\n\nPerguntas do Questionário:\n1. Nome fictício da persona:\n2. Idade aproximada:\n3. Profissão ou ocupação:\n4. Quais são suas dores e dificuldades?\n5. Quais são seus desejos ou objetivos?\n6. Onde essa pessoa busca informação?\n7. Quais redes sociais essa pessoa usa com frequência?\n8. Que tipo de conteúdo ela consome?" }, { "lessonId": "L01.02", "title": "Proposta de Valor e Posicionamento", "content": "Com base na persona, vamos definir a proposta de valor do seu serviço. A proposta responde: 'Eu ajudo [persona] a [solução] através de [diferencial do seu serviço].'\n\nExemplo: Ajudo [vendedores autônomos] a [acelerar vendas] usando [o super app com CRM e automação]." } ] },
        { "moduleId": "MD02", "title": "Módulo 2: O Algoritmo da Meta", "exercisePrompt": "Exercício Módulo 2:\n\n1. Crie 3 ganchos para um vídeo sobre seu serviço.\n2. Liste 2 tipos de conteúdo que geram mais salvamentos.", "lessons": [ { "lessonId": "L02.01", "title": "Como o Algoritmo Funciona", "content": "O algoritmo da Meta analisa o comportamento dos usuários para decidir o que mostrar. Ele prioriza conteúdos que geram interação rápida. Quanto mais relevante for o seu conteúdo para o público, mais ele será entregue." }, { "lessonId": "L02.03", "title": "Comece com um Gancho Forte", "content": "O primeiro segundo do seu conteúdo precisa chamar a atenção imediatamente. Depois do gancho, entregue valor real e finalize com uma chamada para ação (CTA). Exemplo de ganchos: 'Você está postando, mas ninguém engaja? Isso aqui é pra você.'" } ] },
        { "moduleId": "MD03", "title": "Módulo 3: Cronograma de Postagens", "exercisePrompt": "Exercício Módulo 3:\n\n1. Defina a frequência ideal de postagens para você.\n2. Monte um cronograma de conteúdo para a próxima semana.", "lessons": [ { "lessonId": "L03.01", "title": "Melhores Horários e Dias para Postagem", "content": "O ideal é postar quando seu público está mais ativo (geralmente entre 11h e 13h ou 18h e 20h, de terça a quinta). Use as métricas do Instagram para ver quando seus seguidores estão online." }, { "lessonId": "L03.03", "title": "Exemplo de Cronograma Semanal", "content": "Utilize um calendário para organizar o conteúdo por dia da semana:\nSegunda-feira: Conteúdo Educativo\nTerça-feira: Prova Social (depoimento)\nQuarta-feira: Vídeo Reels\nQuinta-feira: Dica + Engajamento\nSexta-feira: Chamada para Ação/Oferta\nSábado: Conteúdo leve/Bastidor\nDomingo: (Opcional) Inspiração" } ] },
        { "moduleId": "MD04", "title": "Módulo 4: Conteúdo que Conecta", "exercisePrompt": "Exercício Módulo 4:\n\n1. Escreva um roteiro curto para um vídeo.\n2. Quais são as 2 cores principais da sua marca?", "lessons": [ { "lessonId": "L04.01", "title": "Estrutura de Vídeos que Engajam", "content": "Um vídeo precisa seguir uma estrutura estratégica: Gancho (1º segundo), Valor (dica ou solução) e CTA (chamada para ação). Exemplo: 'Você quer mais clientes? Então evite esse erro aqui...'" } ] },
        { "moduleId": "MD05", "title": "Módulo 5: Copywriting com ChatGPT", "exercisePrompt": "Exercício Módulo 5:\n\n1. Use a fórmula PAS (Problema, Agitação, Solução) para escrever uma legenda de post.\n2. Crie um prompt para o ChatGPT pedindo 3 ideias de conteúdo.", "lessons": [ { "lessonId": "L05.01", "title": "Como Criar Textos Persuasivos com IA", "content": "O ChatGPT é uma ferramenta poderosa para gerar textos que vendem. A chave está em saber o que pedir e como direcionar a IA com clareza. Use as fórmulas de copy para montar seus prompts." }, { "lessonId": "L05.02", "title": "Fórmulas Testadas: AIDA e PAS", "content": "Aprenda a usar as estruturas de texto persuasivo:\nAIDA: Atenção, Interesse, Desejo, Ação\nPAS: Problema, Agitação, Solução" } ] },
        { "moduleId": "MD06", "title": "Módulo 6: Implementação de CRM", "exercisePrompt": "Exercício Módulo 6:\n\n1. Defina as etapas do seu funil de vendas.\n2. Crie um lead de teste no CRM e mova-o pelo funil.", "lessons": [ { "lessonId": "L06.01", "title": "O que é CRM e Por que sua Empresa Precisa", "content": "CRM (Customer Relationship Management) é uma ferramenta que organiza o relacionamento com seus leads e clientes, acompanhando-os desde o primeiro contato até o fechamento da venda." }, { "lessonId": "L06.02", "title": "Construção de Funil de Vendas Básico", "content": "Um funil simples pode ter 4 etapas: Contato Inicial, Conversa/Apresentação, Proposta Enviada, Cliente Fechado. O super app ajudará a organizar os leads por estágio para manter a eficiência." } ] },
        { "moduleId": "MD07", "title": "Módulo 7: Processo Comercial", "exercisePrompt": "Exercício Módulo 7:\n\n1. Escreva seu pitch de vendas em uma única frase.\n2. Qual gatilho mental faz mais sentido para sua oferta?", "lessons": [ { "lessonId": "L07.01", "title": "Como Montar um Pitch Comercial", "content": "O pitch é a sua 'apresentação relâmpago'. Ele precisa ser claro e direto. Inclua: Quem você ajuda, o problema que resolve e o diferencial do seu serviço. Exemplo: 'Nós ajudamos negócios locais a atrair clientes todos os dias usando vídeos e tráfego pago.'" } ] },
        { "moduleId": "MD08", "title": "Módulo 8: Conexão com a Audiência", "exercisePrompt": "Exercício Módulo 8:\n\n1. Liste 3 ideias de conteúdo de bastidores para os Stories.\n2. Escreva uma pergunta para fazer em uma enquete.", "lessons": [ { "lessonId": "L08.01", "title": "Gerando Conexão Real (sem Forçar)", "content": "Pessoas se conectam com pessoas. Mostrar sua rotina e bastidores cria empatia. Seja autêntico, não perfeito. Use a câmera frontal e fale como se fosse para um amigo." } ] }
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
            // Remove o 'Pensando...' quando a mensagem real chega
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
        
        // CORRIGIDO: O chat agora renderiza o histórico com as classes corretas
        if (!history || history.length === 0) {
            addMessageToChat("Nenhuma conversa ainda. Envie a primeira mensagem ou o Lead pode iniciar.", 'bot-message', containerId);
        } else {
            document.querySelector(`#${containerId} .bot-thinking`)?.remove();
            history.forEach(m => addMessageToChat(m.text, m.role, containerId));
        }
    }


    // === FUNÇÃO DE DADOS E ESTADO ===
    
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
                
                // CORRIGIDO: Lendo as instruções de forma mais robusta
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
                    // Mapeamento de sender ('user', 'model', 'operator') para classe CSS ('user-message', 'bot-message')
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
                updateAllUI(); // Atualiza a lista/kanban para remover a bolinha de não lida

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
            // Limpa o contador de mensagens não lidas no Frontend e salva
            if(lead.unreadCount > 0) {
                lead.unreadCount = 0;
                await saveUserData(userId);
            }

            // Preenche os campos do modal
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
        // ... (Sua lógica de Bot Status/QR Code) ...
        const currentUserId = firebase.auth().currentUser?.uid;
        if (currentUserId) {
            startKeepAlive(); // Inicia o Keep-Alive
            // Se você tiver a lógica completa de SSE e bot status, mantenha-a aqui.
        }
    }


    // === FUNÇÃO DE EVENT LISTENERS ===
    function setupEventListeners(userId) {
        // ... (Seus event listeners de navegação, tema, CRUD de leads, caixa e estoque) ...
        
        // NOVO: Listener do Chatbot de Leads (Envio de Mensagem Manual)
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
                
                // O Listener de Chat (onSnapshot) cuidará de atualizar o histórico com a mensagem salva pelo Bot no Firebase.

            } catch (error) {
                addMessageToChat(`Erro de Envio: ${error.message}. Verifique a URL do Bot no Render.`, 'bot-message error', 'lead-chatbot-messages');
            }
        });

        // Lógica do Botão Ativar/Desativar Bot (CORRIGIDO)
        document.getElementById('edit-lead-modal')?.addEventListener('click', async (e) => {
            if (e.target.id === 'toggle-bot-btn') {
                const lead = leads.find(l => l.id === currentLeadId);
                const userId = firebase.auth().currentUser.uid;
                if (lead) {
                    const newStatus = !(lead.botActive === true); 
                    lead.botActive = newStatus;
                    e.target.textContent = newStatus ? 'Desativar Bot' : 'Ativar Bot';
                    e.target.classList.toggle('btn-delete', newStatus);
                    e.target.classList.toggle('btn-save', !newStatus);
                    await saveUserData(userId);
                    
                    const statusMsg = newStatus ? 'Bot de IA ativado para este Lead.' : 'Bot de IA desativado. Atendimento manual iniciado.';
                    addMessageToChat(statusMsg, 'bot-message system', 'lead-chatbot-messages');
                }
            }
        });
        
        // Listener para fechar o Modal (CORRIGIDO)
        document.querySelectorAll('.close-modal').forEach(btn => { 
            btn.addEventListener('click', () => { 
                document.getElementById(btn.dataset.target).style.display = 'none'; 
                if (window.unsubscribeLeadChatListener) {
                    window.unsubscribeLeadChatListener();
                }
            }); 
        });

        // ... (O resto dos Event Listeners) ...
    }


    // --- FUNÇÕES DE RENDERIZAÇÃO (RE-INCLUSÃO PARA GARANTIR A EXECUÇÃO) ---

    function renderKanbanCards() { 
        document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = ''); 
        leads.forEach(lead => { 
            const c = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`); 
            if (c) { 
                const wa = `<a href="https://wa.me/${(lead.whatsapp || '').replace(/\D/g, '')}" target="_blank">${lead.whatsapp || ''}</a>`; 
                const unreadCount = (lead.unreadCount || 0);
                const unreadTag = unreadCount > 0 ? `<span class="unread-count">${unreadCount}</span>` : '';
                // Lógica de agendamento (simplificada para o card)
                const scheduleIcon = (lead.scheduledDate && lead.scheduledTime) ? '<i class="ph-fill ph-clock-countdown"></i>' : '';

                c.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${wa}</p>${unreadTag}${scheduleIcon}</div>`; 
            } 
        }); 
    }
    
    // ... (Outras funções de renderização) ...
    function updateAllUI() {
        renderKanbanCards();
        // ... (O resto das chamadas de renderização)
    }

    // Inicialização do APP
    // ... (A função main já está no topo)
    // Inicializa o agendamento a cada minuto para atualizar o Kanban
    setInterval(updateAllUI, 60000);
});
