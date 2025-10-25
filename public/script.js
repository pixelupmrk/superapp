// script.js - VERSÃO FINAL COM AGENDAMENTO E KEEP-ALIVE (24/7)
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

    // URL BASE DO SEU BOT DE WHATSAPP NO RENDER
    const WHATSAPP_BOT_URL = 'https://superapp-whatsapp-bot.onrender.com';

    // === FUNÇÕES DE UTILIDADE E RENDERIZAÇÃO ===
    
    function addMessageToChat(msg, type, containerId) { 
        const c = document.getElementById(containerId); 
        if (c) { 
            // Remove o 'Pensando...' quando a mensagem real chega
            if(type !== 'bot-thinking' && document.querySelector(`#${containerId} .bot-thinking`)) {
                 document.querySelector(`#${containerId} .bot-thinking`).remove();
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
            addMessageToChat("Olá! Como posso ajudar?", 'bot-message', containerId); 
        } else { 
            // Garante que o histórico não tenha o 'Pensando...' no final
            document.querySelector(`#${containerId} .bot-thinking`)?.remove(); 
            history.forEach(m => addMessageToChat(m.parts[0].text, m.role === 'user' ? 'user-message' : 'bot-message', containerId)); 
        } 
    }
    
    // --- FUNÇÃO DE RENDERIZAÇÃO DO KANBAN COM NOTIFICAÇÃO ---
    function renderKanbanCards() { 
        document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = ''); 
        leads.forEach(lead => { 
            const c = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`); 
            if (c) { 
                const wa = `<a href="https://wa.me/${(lead.whatsapp || '').replace(/\D/g, '')}" target="_blank">${lead.whatsapp}</a>`; 
                
                // LÓGICA DA BOLINHA DE NOTIFICAÇÃO
                const unreadCount = lead.unreadCount || 0;
                let notificationBadge = '';
                if (unreadCount > 0) {
                    notificationBadge = `<span class="notification-badge">${unreadCount}</span>`;
                }

                c.innerHTML += `
                    <div class="kanban-card" draggable="true" data-id="${lead.id}">
                        <strong>${lead.nome} ${notificationBadge}</strong>
                        <p>${wa}</p>
                    </div>`; 
            } 
        }); 
    }
    
    function renderLeadsTable() { const t = document.querySelector('#leads-table tbody'); if (t) { t.innerHTML = leads.map(l => { const wa = `<a href="https://wa.me/${(l.whatsapp || '').replace(/\D/g, '')}" target="_blank">${l.whatsapp}</a>`; return `<tr data-id="${l.id}"><td>${l.nome}</td><td>${wa}</td><td>${l.origem}</td><td>${l.qualificacao}</td><td>${l.status}</td><td><button class="btn-edit-table"><i class="ph-fill ph-note-pencil"></i></button><button class="btn-delete-table"><i class="ph-fill ph-trash"></i></button></td></tr>`; }).join(''); } }
    function updateDashboard() { const n = leads.filter(l=>l.status==='novo').length, p=leads.filter(l=>l.status==='progresso').length, f=leads.filter(l=>l.status==='fechado').length; document.getElementById('total-leads').textContent = leads.length; document.getElementById('leads-novo').textContent = n; document.getElementById('leads-progresso').textContent = p; document.getElementById('leads-fechado').textContent = f; const ctx = document.getElementById('statusChart')?.getContext('2d'); if (!ctx) return; if (statusChart) statusChart.destroy(); statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Progresso', 'Fechado'], datasets: [{ data: [n, p, f], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'] }] } }); }
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
    function getMentoriaNotes() { const n = {}; document.querySelectorAll('.mentoria-notas').forEach(t => n[t.id] = t.value); return n; }
    function loadMentoriaNotes(notes = {}) { for (const id in notes) { const t = document.getElementById(id); if (t) t.value = notes[id]; } }
    function updateAllUI() {
        renderKanbanCards();
        renderLeadsTable();
        updateDashboard();
        renderCaixaTable();
        updateCaixa();
        renderEstoqueTable();
    }
    
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

    async function saveUserData(userId) {
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
            await db.collection('userData').doc(userId).set(dataToSave);
        } catch (error) {
            console.error("ERRO CRÍTICO AO SALVAR DADOS NO FIRESTORE:", error);
            alert("Atenção: Não foi possível salvar os dados. Verifique o console de erros (F12) para mais detalhes. O problema pode ser relacionado às regras de segurança do Firestore.");
        }
    }

    // === FUNÇÃO PARA CONFIGURAR O LISTENER DE CHAT EM TEMPO REAL ===
    function setupLeadChatListener(leadId) {
        // Se houver um listener antigo, cancela
        if (unsubscribeLeadChatListener) {
            unsubscribeLeadChatListener();
        }
        
        const userId = firebase.auth().currentUser.uid;
        const chatRef = db.collection('userData').doc(userId).collection('leads').doc(String(leadId)).collection('chatHistory');

        // Adiciona um listener (escuta em tempo real)
        unsubscribeLeadChatListener = chatRef.orderBy('timestamp', 'asc').onSnapshot(snapshot => {
            const history = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                history.push(data);
            });
            
            // Atualiza o histórico local e renderiza
            const lead = leads.find(l => l.id === leadId);
            if(lead) {
                 lead.chatHistory = history;
            }
            
            renderChatHistory('lead-chatbot-messages', history);
        }, error => {
            console.error("Erro no listener de chat do Firestore:", error);
            // Verifica se o erro é de permissão (o motivo mais comum para não carregar)
            if (error.code === 'permission-denied') {
                 addMessageToChat("ERRO: O histórico não pôde ser carregado. Verifique e implante as Regras de Segurança do Firestore.", 'bot-message', 'lead-chatbot-messages');
            } else {
                 addMessageToChat("Erro: Falha ao carregar histórico de conversas em tempo real.", 'bot-message', 'lead-chatbot-messages');
            }
        });
    }

    // A função openEditModal agora usa o listener e garante o estado visual
    async function openEditModal(leadId) { 
        currentLeadId = leadId; 
        const lead = leads.find(l => l.id === leadId); 
        const toggleBotBtn = document.getElementById('toggle-bot-btn');

        if(lead) { 
            document.getElementById('edit-lead-name').value = lead.nome; 
            document.getElementById('edit-lead-email').value = lead.email; 
            document.getElementById('edit-lead-whatsapp').value = lead.whatsapp; 
            document.getElementById('edit-lead-status').value = lead.status; 
            document.getElementById('edit-lead-origem').value = lead.origem; 
            document.getElementById('edit-lead-qualification').value = lead.qualificacao; 
            document.getElementById('edit-lead-notes').value = lead.notas; 
            
            // NOVO: Carregar campos de Agendamento
            document.getElementById('edit-lead-date').value = lead.scheduledDate || '';
            document.getElementById('edit-lead-time').value = lead.scheduledTime || '';
            document.getElementById('edit-lead-reminder-type').value = lead.reminderType || 'none';
            
            // ZERA O CONTADOR DE MENSAGENS NÃO LIDAS
            if (lead.unreadCount && lead.unreadCount > 0) {
                lead.unreadCount = 0;
                // É essencial salvar o estado para zerar a notificação
                await saveUserData(firebase.auth().currentUser.uid); 
                // Atualiza a UI imediatamente (Kanban)
                renderKanbanCards();
            }

            const botActive = lead.botActive === undefined ? true : lead.botActive; 
            toggleBotBtn.classList.toggle('btn-delete', botActive); 
            toggleBotBtn.classList.toggle('btn-save', !botActive);
            toggleBotBtn.textContent = botActive ? 'Desativar Bot' : 'Ativar Bot';

            // NOVO: Limpa o chat e mostra mensagem de carregamento antes de ligar o listener
            const chatContainer = document.getElementById('lead-chatbot-messages');
            if (chatContainer) {
                chatContainer.innerHTML = ''; 
                addMessageToChat("Carregando histórico...", 'bot-message bot-thinking', 'lead-chatbot-messages'); 
            }

            // ATIVA O LISTENER DE CHAT EM TEMPO REAL. 
            setupLeadChatListener(lead.id);

            document.getElementById('edit-lead-modal').style.display = 'flex'; 
        } 
    }

    function openCustosModal(productId) { currentProductId = productId; const produto = estoque.find(p => p.id === productId); if (produto) { document.getElementById('custos-modal-title').textContent = `Custos de: ${produto.produto}`; renderCustosList(produto); document.getElementById('custos-modal').style.display = 'flex'; } }
    function renderCustosList(produto) { const listContainer = document.getElementById('custos-list'); if (!produto.custos || produto.custos.length === 0) { listContainer.innerHTML = '<p>Nenhum custo adicionado.</p>'; return; } listContainer.innerHTML = produto.custos.map(custo => `<div class="custo-item"><span>${custo.descricao}</span><span>R$ ${custo.valor.toFixed(2)}</span></div>`).join(''); }

    // --- LÓGICA DE CONEXÃO DO WHATSAPP BOT (MANTIDA ATIVA) ---
    // NOVO: Função Keep-Alive
    function startKeepAlive() {
        if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
        }
        const currentUserId = firebase.auth().currentUser.uid;
        
        // Função que cutuca o Bot no Render
        const cutucarBot = async () => {
             try {
                // Requisição simples para o endpoint /status. Apenas a chamada já evita o sleep.
                await fetch(`${WHATSAPP_BOT_URL}/status?userId=${currentUserId}`);
                // console.log("[KeepAlive] Bot cutucado com sucesso."); // Descomente para debug
            } catch (error) {
                // console.error("[KeepAlive] Falha ao cutucar Bot:", error); // Descomente para debug
            }
        };

        // Inicia a cutucada a cada 30 segundos (30000ms)
        keepAliveInterval = setInterval(cutucarBot, 30000);
        console.log("[KeepAlive] Serviço de prevenção de sono do Bot iniciado.");
    }
    
    function setupWhatsappBotConnection() {
        const statusElement = document.getElementById('bot-status');
        const qrCodeImg = document.getElementById('qr-code-img');
        const qrCodeMessage = document.getElementById('qr-code-message');
        const checkStatusBtn = document.getElementById('check-bot-status-btn');
        const instructionsTextarea = document.getElementById('bot-instructions');
        const saveInstructionsBtn = document.getElementById('save-bot-instructions');
        const saveMessage = document.getElementById('instructions-save-message');

        // Função para atualizar o status na tela
        function updateStatus(message, isConnected) {
            statusElement.textContent = message;
            statusElement.style.color = isConnected ? '#25D366' : '#e57373'; 
            qrCodeImg.style.display = 'none';
            qrCodeMessage.textContent = '';
        }

        // 1. Monitorar Eventos (SSE - Server-Sent Events)
        function startSSEListener() {
            if (whatsappEventsSource) {
                whatsappEventsSource.close();
            }
            const currentUserId = firebase.auth().currentUser.uid;
            whatsappEventsSource = new EventSource(`${WHATSAPP_BOT_URL}/events?userId=${currentUserId}`); 
            
            whatsappEventsSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'qr' && data.data) {
                        qrCodeImg.src = data.data;
                        qrCodeImg.style.display = 'block';
                        qrCodeMessage.textContent = 'Escaneie o QR Code com seu celular para conectar o WhatsApp.';
                        updateStatus('Aguardando Conexão (QR Code Disponível)', false);
                    } else if (data.type === 'status') {
                        if (data.connected) {
                            updateStatus(`Conectado como: ${data.user || 'Dispositivo'}`, true);
                            qrCodeImg.style.display = 'none';
                            qrCodeMessage.textContent = '';
                        } else if (data.status === 'disconnected' || !data.connected) {
                             updateStatus('Desconectado. Pressione "Verificar Status" para obter um novo QR Code.', false);
                        }
                    } else if (data.type === 'message' && data.from) {
                        // Força a recarga dos leads (para novos leads e atualização do Kanban)
                        loadAllUserData(currentUserId);
                        // O chat em tempo real (modal) já é atualizado automaticamente pelo listener onSnapshot
                    }
                } catch (e) {
                    console.error("Erro ao processar evento SSE:", e, event.data);
                }
            };

            whatsappEventsSource.onerror = (error) => {
                console.error("Erro na conexão SSE com o WhatsApp Bot:", error);
                updateStatus('Erro na Conexão em Tempo Real. Tentando reconectar...', false);
                setTimeout(startSSEListener, 5000); 
            };
        }
        
        // Chamada inicial para garantir que o Bot seja ativado assim que o app carregar
        startSSEListener(); 
        // NOVO: Inicia o serviço de keep-alive 
        startKeepAlive();

        // 2. Função para verificar o status atual (chamada pelo botão)
        checkStatusBtn?.addEventListener('click', async () => {
            updateStatus('Verificando status...', false);
            qrCodeImg.style.display = 'none';

            const currentUserId = firebase.auth().currentUser.uid;
            if (!currentUserId) {
                 updateStatus('Erro: Usuário não autenticado.', false);
                 return;
            }

            try {
                const response = await fetch(`${WHATSAPP_BOT_URL}/status?userId=${currentUserId}`); 
                
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") === -1) {
                    const textResponse = await response.text();
                    console.error("Resposta do servidor não é JSON:", textResponse);
                    throw new Error(`Resposta inválida. O servidor retornou: ${contentType}.`);
                }

                const data = await response.json();
                
                if (data.connected || data.status === 'QR_AVAILABLE') {
                    updateStatus(`Conectado como: ${data.user || 'Dispositivo'}`, true);
                    if (data.qrCodeUrl) {
                        qrCodeImg.src = data.qrCodeUrl;
                        qrCodeImg.style.display = 'block';
                        qrCodeMessage.textContent = 'Escaneie o QR Code com seu celular para conectar o WhatsApp.';
                    }
                    // A conexão SSE é iniciada na abertura do app, mas é bom garantir.
                    if (!whatsappEventsSource) startSSEListener();
                } else {
                    updateStatus('Desconectado. Por favor, escaneie o QR Code.', false);
                    qrCodeMessage.textContent = 'Aguardando o backend gerar o QR Code. Se o QR não aparecer, verifique os logs do Render.';
                    if (!whatsappEventsSource) startSSEListener();
                }

            } catch (error) {
                console.error("Erro ao verificar status do Bot:", error);
                updateStatus(`Erro de Conexão: ${error.message}. Verifique a hospedagem do Bot.`, false);
            }
        });
        
        // 3. Salvar instruções da IA
        saveInstructionsBtn?.addEventListener('click', async () => {
            const newInstructions = instructionsTextarea.value;
            try {
                await saveUserData(firebase.auth().currentUser.uid); 
                botInstructions = newInstructions;
                saveMessage.textContent = 'Instruções salvas com sucesso!';
                saveMessage.style.color = '#25D366';
            } catch (error) {
                console.error("Erro ao salvar instruções:", error);
                saveMessage.textContent = 'Erro ao salvar instruções.';
                saveMessage.style.color = '#e57373';
            }
            setTimeout(() => saveMessage.textContent = '', 3000);
        });
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
            await saveUserData(userId);
            alert('Configurações salvas!');
        });

        document.getElementById('lead-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            leads.push({ id: nextLeadId++, status: 'novo', nome: document.getElementById('lead-name').value, email: document.getElementById('lead-email').value, whatsapp: document.getElementById('lead-whatsapp').value, origem: document.getElementById('lead-origin').value, qualificacao: document.getElementById('lead-qualification').value, notas: document.getElementById('lead-notes').value });
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

        // NOVO: Bloco de salvar agendamento e informações do lead
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
                
                // NOVO: Salvar Campos de Agendamento
                const reminderType = document.getElementById('edit-lead-reminder-type').value;
                lead.scheduledDate = document.getElementById('edit-lead-date').value;
                lead.scheduledTime = document.getElementById('edit-lead-time').value;
                lead.reminderType = reminderType;
                
                // Limpa o agendamento se o tipo for 'none'
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
                
                // Fecha o modal e desativa o listener de chat
                if (unsubscribeLeadChatListener) unsubscribeLeadChatListener();
                document.getElementById('edit-lead-modal').style.display = 'none';
            }
        });

        document.getElementById('toggle-bot-btn')?.addEventListener('click', async () => {
             const lead = leads.find(l => l.id === currentLeadId);
             if (lead) {
                 lead.botActive = lead.botActive === undefined ? false : !lead.botActive; // Alterna o estado (padrão é ativo)
                 await saveUserData(userId);
                 openEditModal(currentLeadId); // Recarrega o modal para atualizar o botão
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
        
        // CHATBOT DO LEAD (NO MODAL) - LÓGICA REESCRITA PARA BOT ATIVO/DESATIVADO
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
                    const chatRef = db.collection('userData').doc(userId).collection('leads').doc(String(currentLeadId)).collection('chatHistory');
                    await chatRef.add({
                        role: "model", // Mensagens do operador são salvas como "model" para aparecer à esquerda
                        parts: [{text: userInput}],
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    });
                    
                    // 3. ENVIAR DIRETAMENTE PARA O WHATSAPP
                    const sendResponse = await fetch(`${WHATSAPP_BOT_URL}/send`, {
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify({ 
                            to: lead.whatsapp, 
                            text: userInput, 
                            userId: userId 
                        }) 
                    });
                    
                    if (!sendResponse.ok) {
                        const errorData = await sendResponse.json();
                        throw new Error(errorData.error || 'Falha no envio da mensagem via Bot API.');
                    }

                    // 4. Se o envio foi OK, não precisa de mais feedback visual além do que já apareceu
                    
                } catch (error) {
                    console.error("Erro ao enviar mensagem como operador:", error);
                    addMessageToChat(`ERRO DE ENVIO: ${error.message}.`, 'bot-message', chatContainerId);
                }
                
            } else { 
                // --- BOT ATIVO: CHAMA CLOUD FUNCTION (Fluxo IA)
                
                addMessageToChat("Pensando...", 'bot-message bot-thinking', chatContainerId);

                try {
                    // O Cloud Function startAiChat SALVA A MENSAGEM DO OPERADOR e INICIA A RESPOSTA DA IA
                    const startChat = firebase.functions().httpsCallable('startAiChat');
                    await startChat({ prompt: userInput, leadId: currentLeadId });
                    
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
                botInstructions = document.getElementById('bot-instructions')?.value || data.botInstructions || document.getElementById('bot-instructions')?.placeholder || "Você é um assistente virtual prestativo.";
                
                nextLeadId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 0;
                applySettings(data.settings);
                loadMentoriaNotes(data.mentoriaNotes);
            } else {
                applySettings();
            }
            renderMentoria();
            updateAllUI();
            if (document.getElementById('bot-instructions')) {
                document.getElementById('bot-instructions').value = botInstructions;
            }
        } catch (error) { console.error("Erro ao carregar dados:", error); }
    }

    // === INICIALIZAÇÃO DA APP ===
    // NOVO: Função Keep-Alive
    function startKeepAlive() {
        if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
        }
        const currentUserId = firebase.auth().currentUser.uid;
        
        // Função que cutuca o Bot no Render
        const cutucarBot = async () => {
             try {
                // Requisição simples para o endpoint /status. Apenas a chamada já evita o sleep.
                await fetch(`${WHATSAPP_BOT_URL}/status?userId=${currentUserId}`);
                // console.log("[KeepAlive] Bot cutucado com sucesso."); // Descomente para debug
            } catch (error) {
                // console.error("[KeepAlive] Falha ao cutucar Bot:", error); // Descomente para debug
            }
        };

        // Inicia a cutucada a cada 30 segundos (30000ms)
        keepAliveInterval = setInterval(cutucarBot, 30000);
        console.log("[KeepAlive] Serviço de prevenção de sono do Bot iniciado.");
    }

    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user && document.getElementById('app-container') && !document.body.hasAttribute('data-initialized')) {
                document.body.setAttribute('data-initialized', 'true');
                db = firebase.firestore();
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid); 
                setupWhatsappBotConnection(); 
            }
        });
    }

    main(); 
});
