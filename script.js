document.addEventListener('DOMContentLoaded', () => {
    // --- DADOS DA MENTORIA ---
    const mentoriaData = [
        { 
            moduleId: "MD01", title: "Módulo 1: Conectando com o Cliente Ideal",
            lessons: [
                { title: "Questionário para Definição de Persona", content: "Antes de qualquer estratégia, é essencial saber com quem você está falando. O questionário irá ajudar a identificar o perfil do seu cliente ideal.\n\nPerguntas do Questionário:\n1. Nome fictício da persona:\n2. Idade aproximada:\n3. Profissão ou ocupação:\n4. Quais são suas dores e dificuldades?\n5. Quais são seus desejos ou objetivos?\n6. Onde essa pessoa busca informação?\n7. Quais redes sociais essa pessoa usa com frequência?\n8. Que tipo de conteúdo ela consome?" },
                { title: "Proposta de Valor e Posicionamento", content: "Com base na persona, vamos definir a proposta de valor do seu serviço. A proposta responde: 'Eu ajudo [persona] a [solução] através de [diferencial do seu serviço].'\n\nExemplo: Ajudo [vendedores autônomos] a [acelerar vendas] usando [o super app com CRM e automação]." }
            ]
        },
        {
            moduleId: "MD02", title: "Módulo 2: O Algoritmo da Meta",
            lessons: [
                { title: "Como o Algoritmo Funciona", content: "O algoritmo da Meta analisa o comportamento dos usuários para decidir o que mostrar. Ele prioriza conteúdos que geram interação rápida. Quanto mais relevante for o seu conteúdo para o público, mais ele será entregue." },
                { title: "Comece com um Gancho Forte", content: "O primeiro segundo do seu conteúdo precisa chamar a atenção imediatamente. Depois do gancho, entregue valor real e finalize com uma chamada para ação (CTA). Exemplo de ganchos: 'Você está postando, mas ninguém engaja? Isso aqui é pra você.'" }
            ]
        },
        {
            moduleId: "MD03", title: "Módulo 3: Cronograma de Postagens",
            lessons: [
                { title: "Melhores Horários e Dias para Postagem", content: "O ideal é postar quando seu público está mais ativo (geralmente entre 11h e 13h ou 18h e 20h, de terça a quinta). Use as métricas do Instagram para ver quando seus seguidores estão online." },
                { title: "Exemplo de Cronograma Semanal", content: "Utilize um calendário para organizar o conteúdo por dia da semana:\nSegunda-feira: Conteúdo Educativo\nTerça-feira: Prova Social (depoimento)\nQuarta-feira: Vídeo Reels\nQuinta-feira: Dica + Engajamento\nSexta-feira: Chamada para Ação/Oferta" }
            ]
        },
        {
            moduleId: "MD04", title: "Módulo 4: Conteúdo que Conecta",
            lessons: [
                { title: "Estrutura de Vídeos que Engajam", content: "Um vídeo precisa seguir uma estrutura estratégica: Gancho (1º segundo), Valor (dica ou solução) e CTA (chamada para ação). Exemplo: 'Você quer mais clientes? Então evite esse erro aqui...'" },
                { title: "Design com Canva", content: "Use o Canva para criar uma identidade visual coesa. Mantenha fontes legíveis, as cores da sua marca e crie um padrão visual para que seus posts sejam reconhecidos no feed." }
            ]
        },
        {
            moduleId: "MD05", title: "Módulo 5: Copywriting com ChatGPT",
            lessons: [
                { title: "Fórmulas Testadas: AIDA e PAS", content: "Aprenda a usar as estruturas de texto persuasivo:\nAIDA: Atenção, Interesse, Desejo, Ação\nPAS: Problema, Agitação, Solução" },
                { title: "Criando Prompts Inteligentes", content: "Um bom prompt direciona o ChatGPT a criar algo útil. Use a estrutura: [Ação] + [Assunto] + [Objetivo] + [Estilo/Tom]. Exemplo: 'Escreva uma copy para anúncio no Instagram sobre mentoria de marketing, com objetivo de gerar leads, num tom direto e persuasivo.'" }
            ]
        },
        {
            moduleId: "MD06", title: "Módulo 6: Implementação de CRM",
            lessons: [
                { title: "O que é CRM e Por que sua Empresa Precisa", content: "CRM (Customer Relationship Management) é uma ferramenta que organiza o relacionamento com seus leads e clientes, acompanhando-os desde o primeiro contato até o fechamento da venda." },
                { title: "Construção de Funil de Vendas Básico", content: "Um funil simples pode ter 4 etapas: Contato Inicial, Conversa/Apresentação, Proposta Enviada, Cliente Fechado. O super app ajudará a organizar os leads por estágio para manter a eficiência." }
            ]
        },
        {
            moduleId: "MD07", title: "Módulo 7: Processo Comercial",
            lessons: [
                { title: "Como Montar um Pitch Comercial", content: "O pitch é a sua 'apresentação relâmpago'. Ele precisa ser claro e direto. Inclua: Quem você ajuda, o problema que resolve e o diferencial do seu serviço. Exemplo: 'Nós ajudamos negócios locais a atrair clientes todos os dias usando vídeos e tráfego pago.'" },
                { title: "Rapport e Gatilhos Mentais", content: "Crie conexão usando técnicas como: Rapport (usar linguagem e ritmo parecidos com o cliente) e Gatilhos Mentais (escassez, autoridade, prova social). O cliente compra quando sente confiança e identificação." }
            ]
        },
        {
            moduleId: "MD08", title: "Módulo 8: Conexão e Humanização",
            lessons: [
                { title: "Gerando Conexão Real (sem Forçar)", content: "Pessoas se conectam com pessoas. Mostrar sua rotina e bastidores cria empatia. Seja autêntico, não perfeito. Use a câmera frontal e fale como se fosse para um amigo." },
                { title: "Estratégias de Bastidores nos Stories", content: "Use os Stories para mostrar o que acontece por trás do conteúdo pronto. Compartilhe erros, aprendizados e a rotina de trabalho. Quanto mais humano, maior a identificação." }
            ]
        }
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
    async function loadAllUserData(userId) {
        try {
            const doc = await db.collection('userData').doc(userId).get();
            if (doc.exists) {
                const data = doc.data();
                leads = data.leads || [];
                caixa = data.caixa || [];
                estoque = data.estoque || [];
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
    
    function applySettings(settings = {}) {
        const theme = settings.theme || 'dark';
        const userName = settings.userName || 'Usuário';
        document.body.className = theme === 'light' ? 'light-theme' : '';
        document.getElementById('theme-toggle-btn').textContent = theme === 'light' ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro';
        document.querySelector('.user-profile span').textContent = `Olá, ${userName}`;
        document.getElementById('setting-user-name').value = userName;
        document.getElementById('setting-company-name').value = settings.companyName || '';
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners(userId) {
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

        document.getElementById('save-settings-btn').addEventListener('click', () => {
            saveUserData(userId);
            alert('Configurações salvas!');
        });
        document.getElementById('theme-toggle-btn').addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            saveUserData(userId);
        });

        document.getElementById('lead-form')?.addEventListener('submit', e => {
            e.preventDefault();
            leads.push({
                id: nextLeadId++, status: 'novo',
                nome: document.getElementById('lead-name').value,
                email: document.getElementById('lead-email').value,
                whatsapp: document.getElementById('lead-whatsapp').value,
                atendente: document.getElementById('lead-attendant').value,
                origem: document.getElementById('lead-origin').value,
                data: document.getElementById('lead-date').value,
                qualificacao: document.getElementById('lead-qualification').value,
                notas: document.getElementById('lead-notes').value
            });
            saveUserData(userId);
            updateAllUI();
            e.target.reset();
        });

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
                    if (lead) { lead.status = column.dataset.status; saveUserData(userId); updateAllUI(); }
                }
            });
            kanbanBoard.addEventListener('click', e => { const card = e.target.closest('.kanban-card'); if (card) openEditModal(parseInt(card.dataset.id)); });
        }
        
        document.getElementById('leads-table')?.addEventListener('click', e => {
            if (e.target.closest('.btn-edit-table')) openEditModal(parseInt(e.target.closest('tr').dataset.id));
            if (e.target.closest('.btn-delete-table')) { if (confirm('Tem certeza?')) { leads = leads.filter(l => l.id != parseInt(e.target.closest('tr').dataset.id)); saveUserData(userId); updateAllUI(); } }
        });

        document.getElementById('edit-lead-form')?.addEventListener('submit', e => {
            e.preventDefault();
            const lead = leads.find(l => l.id === currentLeadId);
            if(lead) {
                lead.nome = document.getElementById('edit-lead-name').value;
                lead.email = document.getElementById('edit-lead-email').value;
                lead.whatsapp = document.getElementById('edit-lead-whatsapp').value;
                lead.status = document.getElementById('edit-lead-status').value;
                lead.atendente = document.getElementById('edit-lead-attendant').value;
                lead.origem = document.getElementById('edit-lead-origem').value;
                lead.data = document.getElementById('edit-lead-date').value;
                lead.qualificacao = document.getElementById('edit-lead-qualification').value;
                lead.notas = document.getElementById('edit-lead-notes').value;
                saveUserData(userId);
                updateAllUI();
                document.getElementById('edit-lead-modal').style.display = 'none';
            }
        });
        document.getElementById('delete-lead-btn')?.addEventListener('click', () => { if (confirm('Tem certeza?')) { leads = leads.filter(l => l.id !== currentLeadId); saveUserData(userId); updateAllUI(); document.getElementById('edit-lead-modal').style.display = 'none'; } });
        document.querySelectorAll('.close-modal').forEach(btn => { btn.addEventListener('click', () => document.getElementById(btn.dataset.target).style.display = 'none'); });

        document.getElementById('caixa-form')?.addEventListener('submit', e => {
            e.preventDefault();
            caixa.push({
                data: document.getElementById('caixa-data').value,
                descricao: document.getElementById('caixa-descricao').value,
                valor: parseFloat(document.getElementById('caixa-valor').value),
                tipo: document.getElementById('caixa-tipo').value,
                observacoes: document.getElementById('caixa-observacoes').value
            });
            saveUserData(userId);
            renderCaixaTable(); updateCaixa();
            e.target.reset();
        });
        document.querySelectorAll('.finance-tab').forEach(tab => {
            tab.addEventListener('click', e => {
                e.preventDefault();
                document.querySelectorAll('.finance-tab, .finance-content').forEach(el => el.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(e.target.dataset.tab + '-tab-content').classList.add('active');
            });
        });
        
        document.getElementById('estoque-search')?.addEventListener('input', renderEstoqueTable);

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
                document.querySelector('.bot-thinking')?.parentElement.remove();
                const data = await response.json();
                if (!response.ok) throw new Error(data.details);
                addMessageToChat(data.text, 'bot-message');
                chatHistory.push({ role: "model", parts: [{ text: data.text }] });
            } catch (error) { document.querySelector('.bot-thinking')?.parentElement.remove(); addMessageToChat("Erro ao conectar com a IA.", 'bot-message'); }
            saveUserData(userId);
        });
    }

    // --- FUNÇÕES ESPECÍFICAS ---
    function openEditModal(leadId) {
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        if(lead) {
            document.getElementById('edit-lead-name').value = lead.nome; document.getElementById('edit-lead-email').value = lead.email; document.getElementById('edit-lead-whatsapp').value = lead.whatsapp; document.getElementById('edit-lead-status').value = lead.status;
            document.getElementById('edit-lead-attendant').value = lead.atendente; document.getElementById('edit-lead-origem').value = lead.origem; document.getElementById('edit-lead-date').value = lead.data;
            document.getElementById('edit-lead-qualification').value = lead.qualificacao; document.getElementById('edit-lead-notes').value = lead.notas;
            document.getElementById('edit-lead-modal').style.display = 'flex';
        }
    }
    function renderKanbanCards() { document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = ''); leads.forEach(lead => { const c = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`); if (c) c.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${lead.whatsapp}</p></div>`; }); }
    function renderLeadsTable() { const t = document.querySelector('#leads-table tbody'); if (t) { t.innerHTML = leads.map(l => `<tr data-id="${l.id}"><td>${l.nome}</td><td>${l.whatsapp}</td><td>${l.origem}</td><td>${l.qualificacao}</td><td>${l.status}</td><td><button class="btn-edit-table"><i class="ph-fill ph-note-pencil"></i></button><button class="btn-delete-table"><i class="ph-fill ph-trash"></i></button></td></tr>`).join(''); } }
    function updateDashboard() { const n = leads.filter(l=>l.status==='novo').length, p=leads.filter(l=>l.status==='progresso').length, f=leads.filter(l=>l.status==='fechado').length; document.getElementById('total-leads').textContent = leads.length; document.getElementById('leads-novo').textContent = n; document.getElementById('leads-progresso').textContent = p; document.getElementById('leads-fechado').textContent = f; const ctx = document.getElementById('statusChart')?.getContext('2d'); if (!ctx) return; if (statusChart) statusChart.destroy(); statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Progresso', 'Fechado'], datasets: [{ data: [n, p, f], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'] }] } }); }
    function renderCaixaTable() { const t = document.querySelector('#caixa-table tbody'); if (t) { t.innerHTML = caixa.map(m => `<tr><td>${m.data}</td><td>${m.descricao}</td><td class="entrada">${m.tipo==='entrada'?'R$ '+m.valor.toFixed(2):''}</td><td class="saida">${m.tipo==='saida'?'R$ '+m.valor.toFixed(2):''}</td><td>${m.observacoes}</td></tr>`).join(''); } }
    function updateCaixa() { const e = caixa.filter(m=>m.tipo==='entrada').reduce((a,c)=>a+c.valor,0), s = caixa.filter(m=>m.tipo==='saida').reduce((a,c)=>a+c.valor,0); document.getElementById('total-entradas').textContent = `R$ ${e.toFixed(2)}`; document.getElementById('total-saidas').textContent = `R$ ${s.toFixed(2)}`; document.getElementById('caixa-atual').textContent = `R$ ${(e-s).toFixed(2)}`; }
    function renderEstoqueTable() { const t = document.querySelector('#estoque-table tbody'); if (t) { const s = document.getElementById('estoque-search').value.toLowerCase(); t.innerHTML = estoque.filter(p => p.produto.toLowerCase().includes(s) || p.descricao.toLowerCase().includes(s)).map(p => `<tr data-descricao="${p.descricao}"><td>${p.produto}</td><td>${p.descricao}</td><td>R$ ${p.compra.toFixed(2)}</td><td>R$ 0.00</td><td>R$ ${p.venda.toFixed(2)}</td><td>R$ ${(p.venda - p.compra).toFixed(2)}</td><td>Ações</td></tr>`).join(''); } }
    function addMessageToChat(msg, type) { const c = document.getElementById('chatbot-messages'); if(c) { c.innerHTML += `<div class="${type}"><p>${msg}</p></div>`; c.scrollTop = c.scrollHeight; } }
    function renderChatHistory() { const c = document.getElementById('chatbot-messages'); if (!c) return; c.innerHTML = ''; if (chatHistory.length === 0) { addMessageToChat("Olá! Como posso ajudar?", 'bot-message'); } else { chatHistory.forEach(m => addMessageToChat(m.parts[0].text, m.role === 'user' ? 'user-message' : 'bot-message')); } }
    function renderMentoria() { const menu = document.getElementById('mentoria-menu'); const content = document.getElementById('mentoria-content'); if (!menu || !content) return; menu.innerHTML = `<h2>Módulos</h2><ul>${mentoriaData.map((mod, i) => `<li class="sales-accelerator-menu-item ${i===0?'active':''}" data-module-id="${mod.moduleId}">${mod.title}</li>`).join('')}</ul>`; content.innerHTML = mentoriaData.map((mod, i) => `<div class="mentoria-module-content ${i===0?'active':''}" id="${mod.moduleId}">${mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content}</p></div>`).join('')}<div class="anotacoes-aluno"><label for="notas-${mod.moduleId}">Minhas Anotações</label><textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="6"></textarea></div></div>`).join(''); document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => { item.addEventListener('click', e => { document.querySelectorAll('.sales-accelerator-menu-item, .mentoria-module-content').forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active'); document.getElementById(e.currentTarget.dataset.moduleId).classList.add('active'); }); }); document.querySelectorAll('.mentoria-notas').forEach(t => t.addEventListener('keyup', () => saveUserData(firebase.auth().currentUser.uid))); }
    function getMentoriaNotes() { const n = {}; document.querySelectorAll('.mentoria-notas').forEach(t => n[t.id] = t.value); return n; }
    function loadMentoriaNotes(notes = {}) { for (const id in notes) { const t = document.getElementById(id); if (t) t.value = notes[id]; } }
});
