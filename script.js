document.addEventListener('DOMContentLoaded', () => {
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
    let unsubscribeLeadChat;

    const BOT_PROMPT_TEMPLATE = `...`;

    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user && document.getElementById('app-container')) {
                db = firebase.firestore();
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
            }
        });
    }
    main();

    async function loadAllUserData(userId) {
        const doc = await db.collection('userData').doc(userId).get();
        if (doc.exists) {
            const data = doc.data();
            leads = data.leads || [];
            if (data.botConfig) {
                document.getElementById('bot-config-negocio').value = data.botConfig.negocio || '';
                document.getElementById('bot-config-servicos').value = data.botConfig.servicos || '';
                document.getElementById('bot-config-instrucoes').value = data.botConfig.instrucoes || '';
            }
            if (data.botUrl) {
                const frame = document.getElementById('bot-qr-frame');
                const placeholder = document.getElementById('bot-url-placeholder');
                frame.src = data.botUrl;
                frame.style.display = 'block';
                placeholder.style.display = 'none';
            }
        }
        updateAllUI();
    }

    async function saveUserData(userId, showSuccessAlert = false) {
        // ... (código de salvar dados)
    }

    function updateAllUI() {
        renderKanbanCards();
        renderLeadsTable();
    }

    function renderKanbanCards() {
        document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = '');
        leads.forEach(lead => {
            const column = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (column) {
                column.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${lead.whatsapp}</p></div>`;
            }
        });
    }

    // FUNÇÃO CORRIGIDA
    function renderLeadsTable() {
        const tbody = document.querySelector('#leads-table tbody');
        if (tbody) {
            tbody.innerHTML = leads.map(l => { // A variável para cada lead é 'l'
                // CORREÇÃO: Usar 'l' em vez de 'lead'
                const wa = `<a href="https://wa.me/${(l.whatsapp || '').replace(/\D/g, '')}" target="_blank">${l.whatsapp}</a>`;
                return `<tr data-id="${l.id}"><td>${l.nome}</td><td>${wa}</td><td>${l.origem}</td><td>${l.qualificacao}</td><td>${l.status}</td><td><button class="btn-edit-table">Abrir</button></td></tr>`;
            }).join('');
        }
    }

    function setupEventListeners(userId) {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', e => {
                if (e.currentTarget.id === 'logout-btn') return;
                e.preventDefault();
                const targetId = e.currentTarget.getAttribute('data-target');
                if (!targetId) return;
                document.querySelectorAll('.main-content .content-area, .sidebar-nav .nav-item').forEach(el => el.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const targetElement = document.getElementById(targetId);
                if (targetElement) targetElement.style.display = 'block';
                const pageTitle = document.getElementById('page-title');
                if(pageTitle) pageTitle.textContent = e.currentTarget.querySelector('span').textContent;
            });
        });

        document.getElementById('save-bot-config-btn')?.addEventListener('click', async () => {
            await saveUserData(userId, true);
            const doc = await db.collection('userData').doc(userId).get();
            if (doc.exists() && doc.data().botUrl) {
                const frame = document.getElementById('bot-qr-frame');
                if(frame) frame.src = doc.data().botUrl;
                if(frame) frame.style.display = 'block';
                const placeholder = document.getElementById('bot-url-placeholder');
                if(placeholder) placeholder.style.display = 'none';
            }
        });

        const kanbanBoard = document.getElementById('kanban-board');
        if (kanbanBoard) {
            kanbanBoard.addEventListener('click', e => {
                const card = e.target.closest('.kanban-card');
                if (card && card.dataset.id) openEditModal(parseInt(card.dataset.id));
            });
        }

        document.getElementById('leads-table')?.addEventListener('click', e => {
            if (e.target.closest('.btn-edit-table')) {
                const row = e.target.closest('tr');
                if (row && row.dataset.id) openEditModal(parseInt(row.dataset.id));
            }
        });

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetModal = document.getElementById(btn.dataset.target);
                if(targetModal) targetModal.style.display = 'none';
                if (btn.dataset.target === 'edit-lead-modal' && unsubscribeLeadChat) {
                    unsubscribeLeadChat();
                    unsubscribeLeadChat = null;
                }
            });
        });

        document.getElementById('lead-chat-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('lead-chat-input');
            const messageText = input.value.trim();
            const lead = leads.find(l => l.id === currentLeadId);
            const userDoc = await db.collection('userData').doc(userId).get();
            const botUrl = userDoc.exists ? userDoc.data().botUrl : null;

            if (!messageText || !lead || !botUrl) return;

            input.disabled = true;
            e.target.querySelector('button').disabled = true;

            try {
                const response = await fetch(`${botUrl}/send-message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        number: lead.whatsapp,
                        message: messageText,
                        leadId: String(currentLeadId)
                    })
                });
                if (!response.ok) throw new Error('Falha ao enviar mensagem.');
                input.value = '';
            } catch (error) {
                console.error("Erro ao enviar mensagem:", error);
                alert("Não foi possível enviar a mensagem.");
            } finally {
                input.disabled = false;
                e.target.querySelector('button').disabled = false;
                input.focus();
            }
        });

        document.getElementById('edit-lead-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const leadIndex = leads.findIndex(l => l.id === currentLeadId);
            if (leadIndex > -1) {
                leads[leadIndex].nome = document.getElementById('edit-lead-name').value;
                leads[leadIndex].email = document.getElementById('edit-lead-email').value;
                leads[leadIndex].status = document.getElementById('edit-lead-status').value;
                leads[leadIndex].origem = document.getElementById('edit-lead-origem').value;
                leads[leadIndex].qualificacao = document.getElementById('edit-lead-qualification').value;
                leads[leadIndex].notas = document.getElementById('edit-lead-notes').value;
                await saveUserData(userId);
                updateAllUI();
                alert('Lead atualizado com sucesso!');
            }
        });
    }

    async function openEditModal(leadId) {
        currentLeadId = leadId;
        const userId = firebase.auth().currentUser.uid;
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return;

        document.getElementById('edit-lead-name').value = lead.nome;
        document.getElementById('edit-lead-email').value = lead.email || '';
        document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
        document.getElementById('edit-lead-status').value = lead.status;
        document.getElementById('edit-lead-origem').value = lead.origem || '';
        document.getElementById('edit-lead-qualification').value = lead.qualificacao || '';
        document.getElementById('edit-lead-notes').value = lead.notas || '';
        document.getElementById('lead-chat-title').textContent = `Conversa com ${lead.nome}`;
        document.getElementById('edit-lead-modal').style.display = 'flex';

        const chatHistoryDiv = document.getElementById('lead-chat-history');
        chatHistoryDiv.innerHTML = '<p>Carregando histórico...</p>';

        if (unsubscribeLeadChat) unsubscribeLeadChat();
        
        const messagesRef = db.collection('userData').doc(userId).collection('leadsMessages').doc(String(leadId)).collection('messages').orderBy('timestamp');
        unsubscribeLeadChat = messagesRef.onSnapshot(snapshot => {
            chatHistoryDiv.innerHTML = '';
            if (snapshot.empty) {
                chatHistoryDiv.innerHTML = '<p>Nenhuma mensagem nesta conversa ainda.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const msg = doc.data();
                if(msg.text) renderChatMessage(msg.sender, msg.text);
            });
            chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
        }, error => {
            console.error("Erro ao ouvir o chat:", error);
            chatHistoryDiv.innerHTML = '<p>Erro ao carregar o histórico do chat.</p>';
        });
    }

    function renderChatMessage(sender, text) {
        const chatHistoryDiv = document.getElementById('lead-chat-history');
        const bubble = document.createElement('div');
        bubble.classList.add('msg-bubble');
        if (sender === 'user') {
            bubble.classList.add('msg-user');
        } else {
            bubble.classList.add('msg-operator');
        }
        bubble.textContent = text;
        chatHistoryDiv.appendChild(bubble);
    }
});
