document.addEventListener('DOMContentLoaded', () => {
    // --- DADOS DA MENTORIA (Seu conteúdo original) ---
    const mentoriaData = [
        { "moduleId": "MD01", "title": "Módulo 1: Conectando com o Cliente Ideal", "exercisePrompt": "Exercício Módulo 1:\n\n1. Descreva sua persona (cliente ideal).\n2. Qual é a principal dor que seu serviço resolve?\n3. Escreva sua Proposta de Valor.", "lessons": [ { "lessonId": "L01.01", "title": "Questionário para Definição de Persona", "content": "Antes de qualquer estratégia, é essencial saber com quem você está falando. O questionário irá ajudar a identificar o perfil do seu cliente ideal. Use o CRM para registrar as respostas e começar a segmentar seus leads.\n\nPerguntas do Questionário:\n1. Nome fictício da persona:\n2. Idade aproximada:\n3. Profissão ou ocupação:\n4. Quais são suas dores e dificuldades?\n5. Quais são seus desejos ou objetivos?\n6. Onde essa pessoa busca informação?\n7. Quais redes sociais essa pessoa usa com frequência?\n8. Que tipo de conteúdo ela consome?" }, { "lessonId": "L01.02", "title": "Proposta de Valor e Posicionamento", "content": "Com base na persona, vamos definir a proposta de valor do seu serviço. A proposta responde: 'Eu ajudo [persona] a [solução] através de [diferencial do seu serviço].'\n\nExemplo: Ajudo [vendedores autônomos] a [acelerar vendas] usando [o super app com CRM e automação]." } ] },
        { "moduleId": "MD02", "title": "Módulo 2: O Algoritmo da Meta", "exercisePrompt": "Exercício Módulo 2:\n\n1. Crie 3 ganchos para um vídeo sobre seu serviço.\n2. Liste 2 tipos de conteúdo que geram mais salvamentos.", "lessons": [ { "lessonId": "L02.01", "title": "Como o Algoritmo Funciona", "content": "O algoritmo da Meta analisa o comportamento dos usuários para decidir o que mostrar. Ele prioriza conteúdos que geram interação rápida. Quanto mais relevante for o seu conteúdo para o público, mais ele será entregue." }, { "lessonId": "L02.03", "title": "Comece com um Gancho Forte", "content": "O primeiro segundo do seu conteúdo precisa chamar a atenção imediatamente. Depois do gancho, entregue valor real e finalize com uma chamada para ação (CTA). Exemplo de ganchos: 'Você está postando, mas ninguém engaja? Isso aqui é pra você.'" } ] },
        { "moduleId": "MD03", "title": "Módulo 3: Cronograma de Postagens", "exercisePrompt": "Exercício Módulo 3:\n\n1. Defina a frequência ideal de postagens para você.\n2. Monte um cronograma de conteúdo para a próxima semana.", "lessons": [ { "lessonId": "L03.01", "title": "Melhores Horários e Dias para Postagem", "content": "O ideal é postar quando seu público está mais ativo (geralmente entre 11h e 13h ou 18h e 20h, de terça a quinta). Use as métricas do Instagram para ver quando seus seguidores estão online." }, { "lessonId": "L03.03", "title": "Exemplo de Cronograma Semanal", "content": "Utilize um calendário para organizar o conteúdo por dia da semana:\nSegunda-feira: Conteúdo Educativo\nTerça-feira: Prova Social (depoimento)\nQuarta-feira: Vídeo Reels\nQuinta-feira: Dica + Engajamento\nSexta-feira: Chamada para Ação/Oferta\nSábado: Conteúdo leve/Bastidor\nDomingo: (Opcional) Inspiração" } ] },
    ];
    // Variáveis globais
    let leads = [], caixa = [], estoque = [], chatHistory = [];
    let currentLeadId = null, draggedItem = null, currentProductId = null;
    let statusChart;
    let db;
    let unsubscribeFromLeads; // Para o listener de leads
    let unsubscribeFromChat;  // Para o listener de chat do lead selecionado

    // Função principal de inicialização
    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user && document.getElementById('app-container') && !document.body.hasAttribute('data-initialized')) {
                document.body.setAttribute('data-initialized', 'true');
                db = firebase.firestore();
                setupEventListeners(user.uid);
                setupRealtimeListeners(user.uid); // Nova função para listeners em tempo real
                loadStaticData(); // Carrega dados que não mudam
            }
        });
    }
    main();

    // Carrega dados estáticos como mentoria
    function loadStaticData() {
        renderMentoria();
        // Carregar outras coisas estáticas se houver
    }
    
    // Configura listeners em tempo real do Firestore
    function setupRealtimeListeners(userId) {
        if (unsubscribeFromLeads) unsubscribeFromLeads(); // Cancela listener anterior
        unsubscribeFromLeads = db.collection('users').doc(userId).collection('leads').onSnapshot(snapshot => {
            leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            updateAllUI();
        }, error => console.error("Erro ao ouvir leads:", error));

        // Listeners para outras coleções (caixa, estoque) podem ser adicionados aqui da mesma forma
    }
    
    function updateAllUI() {
        renderKanbanCards();
        renderLeadsTable();
        updateDashboard();
        // As funções de caixa e estoque seriam chamadas aqui se tivessem listeners
    }

    // A função de salvar foi simplificada, pois os listeners cuidam da UI
    async function saveData(collection, docId, data, userId) {
        try {
            await db.collection('users').doc(userId).collection(collection).doc(docId).set(data, { merge: true });
        } catch (error) {
            console.error(`Erro ao salvar em ${collection}:`, error);
        }
    }
    
    function setupEventListeners(userId) {
        // --- NAVEGAÇÃO PRINCIPAL (seu código original, funcionando) ---
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', e => {
                if (e.currentTarget.id === 'logout-btn') return;
                e.preventDefault();
                const targetId = e.currentTarget.getAttribute('data-target');
                if (!targetId) return;
                document.querySelectorAll('.sidebar-nav .nav-item, .main-content .content-area').forEach(el => el.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.getElementById(targetId).classList.add('active');
                document.getElementById('page-title').textContent = e.currentTarget.querySelector('span').textContent;
            });
        });

        // --- FORMULÁRIO DE NOVO LEAD (Modificado para usar subcoleção) ---
        document.getElementById('lead-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newLead = {
                status: 'novo',
                nome: document.getElementById('lead-name').value,
                email: document.getElementById('lead-email').value,
                whatsapp: document.getElementById('lead-whatsapp').value,
                origem: document.getElementById('lead-origin').value,
                qualificacao: document.getElementById('lead-qualification').value,
                notas: document.getElementById('lead-notes').value,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('users').doc(userId).collection('leads').add(newLead);
            e.target.reset();
        });

        // --- KANBAN BOARD (Eventos de arrastar e clicar) ---
        const kanbanBoard = document.getElementById('kanban-board');
        if (kanbanBoard) {
            kanbanBoard.addEventListener('dragstart', e => { if (e.target.classList.contains('kanban-card')) draggedItem = e.target; });
            kanbanBoard.addEventListener('dragover', e => e.preventDefault());
            kanbanBoard.addEventListener('drop', async e => {
                e.preventDefault();
                const column = e.target.closest('.kanban-column');
                if (column && draggedItem) {
                    const leadId = draggedItem.dataset.id;
                    const newStatus = column.dataset.status;
                    await db.collection('users').doc(userId).collection('leads').doc(leadId).update({ status: newStatus });
                }
                draggedItem = null;
            });
            kanbanBoard.addEventListener('click', e => {
                const card = e.target.closest('.kanban-card');
                if (card) {
                    openLeadDetailsInPanel(card.dataset.id, userId);
                }
            });
        }
        
        // --- PAINEL DE DETALHES/CHAT DO LEAD ---
        document.getElementById('edit-lead-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentLeadId) return;
            const updatedData = {
                nome: document.getElementById('edit-lead-name').value,
                email: document.getElementById('edit-lead-email').value,
                whatsapp: document.getElementById('edit-lead-whatsapp').value,
                status: document.getElementById('edit-lead-status').value,
                origem: document.getElementById('edit-lead-origem').value,
                qualificacao: document.getElementById('edit-lead-qualification').value,
                notas: document.getElementById('edit-lead-notes').value
            };
            await db.collection('users').doc(userId).collection('leads').doc(currentLeadId).update(updatedData);
            alert('Lead atualizado!');
        });

        document.getElementById('delete-lead-btn')?.addEventListener('click', async () => {
            if (confirm('Tem certeza que deseja excluir este lead?')) {
                await db.collection('users').doc(userId).collection('leads').doc(currentLeadId).delete();
                document.getElementById('lead-details-content').style.display = 'none';
                document.getElementById('lead-details-placeholder').style.display = 'flex';
                currentLeadId = null;
            }
        });

        document.getElementById('lead-chat-form')?.addEventListener('submit', async e => {
            e.preventDefault();
            const input = document.getElementById('lead-chat-input');
            const text = input.value.trim();
            if (text && currentLeadId) {
                await db.collection('users').doc(userId).collection('leads').doc(currentLeadId).collection('messages').add({
                    text,
                    sender: 'user', // 'user' é você, 'lead' é o cliente
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                input.value = '';
            }
        });

        // Todos os outros event listeners do seu arquivo original (caixa, estoque, etc.) devem ser mantidos aqui
    }

    // --- NOVA FUNÇÃO PARA ABRIR DETALHES E CHAT NO PAINEL ---
    function openLeadDetailsInPanel(leadId, userId) {
        if (currentLeadId === leadId) return; // Não recarrega se já estiver aberto
        currentLeadId = leadId;

        document.getElementById('lead-details-placeholder').style.display = 'none';
        document.getElementById('lead-details-content').style.display = 'flex';
        
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
            document.getElementById('edit-lead-name').value = lead.nome || '';
            document.getElementById('edit-lead-email').value = lead.email || '';
            document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
            document.getElementById('edit-lead-status').value = lead.status || 'novo';
            document.getElementById('edit-lead-origem').value = lead.origem || '';
            document.getElementById('edit-lead-qualification').value = lead.qualificacao || '';
            document.getElementById('edit-lead-notes').value = lead.notas || '';
            document.getElementById('lead-chat-title').textContent = `Conversa com ${lead.nome}`;
        }

        // Configura o listener em tempo real para as mensagens do chat
        if (unsubscribeFromChat) unsubscribeFromChat();
        unsubscribeFromChat = db.collection('users').doc(userId).collection('leads').doc(leadId).collection('messages').orderBy('timestamp')
            .onSnapshot(snapshot => {
                const chatHistoryDiv = document.getElementById('lead-chat-history');
                chatHistoryDiv.innerHTML = '';
                snapshot.forEach(doc => {
                    const msg = doc.data();
                    const msgDiv = document.createElement('div');
                    msgDiv.classList.add('msg-bubble', msg.sender === 'user' ? 'msg-from-user' : 'msg-from-lead');
                    msgDiv.textContent = msg.text;
                    chatHistoryDiv.appendChild(msgDiv);
                });
                chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
            });
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO (Mantidas do seu código original) ---
    function renderKanbanCards() {
        document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = '');
        leads.forEach(lead => {
            const c = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (c) {
                const wa = `<a href="https://wa.me/${(lead.whatsapp || '').replace(/\D/g, '')}" target="_blank">${lead.whatsapp}</a>`;
                c.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${wa}</p></div>`;
            }
        });
    }

    function updateDashboard() {
        const n = leads.filter(l => l.status === 'novo').length;
        const p = leads.filter(l => l.status === 'progresso').length;
        const f = leads.filter(l => l.status === 'fechado').length;
        document.getElementById('total-leads').textContent = leads.length;
        document.getElementById('leads-novo').textContent = n;
        document.getElementById('leads-progresso').textContent = p;
        document.getElementById('leads-fechado').textContent = f;
        const ctx = document.getElementById('statusChart')?.getContext('2d');
        if (!ctx) return;
        if (statusChart) statusChart.destroy();
        statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Progresso', 'Fechado'], datasets: [{ data: [n, p, f], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'] }] } });
    }
    
    // As outras funções (renderLeadsTable, renderCaixaTable, renderMentoria, etc.) permanecem as mesmas do seu arquivo original
    function renderMentoria() {
        const menu = document.getElementById('mentoria-menu'); const content = document.getElementById('mentoria-content'); if (!menu || !content) return;
        menu.innerHTML = mentoriaData.map((mod, i) => `<div class="sales-accelerator-menu-item ${i === 0 ? 'active' : ''}" data-module-id="${mod.moduleId}">${mod.title}</div>`).join('');
        content.innerHTML = mentoriaData.map((mod, i) => { const placeholder = mod.exercisePrompt || `Digite aqui suas anotações para o Módulo ${i + 1}...`; return `<div class="mentoria-module-content ${i === 0 ? 'active' : ''}" id="${mod.moduleId}">${mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content.replace(/\n/g, '<br>')}</p></div>`).join('')}<div class="anotacoes-aluno"><label for="notas-${mod.moduleId}">Minhas Anotações / Exercícios</label><textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="8" placeholder="${placeholder}"></textarea></div></div>`; }).join('');
        document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => { item.addEventListener('click', e => { document.querySelectorAll('.sales-accelerator-menu-item, .mentoria-module-content').forEach(el => el.classList.remove('active')); const clickedItem = e.currentTarget; clickedItem.classList.add('active'); document.getElementById(clickedItem.dataset.moduleId).classList.add('active'); }); });
    }

    function renderLeadsTable() { /* Coloque sua função renderLeadsTable aqui */ }

});
