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

    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user && document.getElementById('app-container') && !document.body.hasAttribute('data-initialized')) {
                document.body.setAttribute('data-initialized', 'true');
                db = firebase.firestore();
                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
            }
        });
    }
    main();

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
                nextLeadId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 0;
                applySettings(data.settings);
                loadMentoriaNotes(data.mentoriaNotes);
            } else {
                applySettings();
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
                }
            };
            await db.collection('userData').doc(userId).set(dataToSave);
        } catch (error) { console.error(`Erro ao salvar dados:`, error); }
    }

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
    }

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

                if (e.currentTarget.id === 'logout-btn') {
                    return; 
                }
                
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
        document.getElementById('save-settings-btn')?.addEventListener('click', () => { saveUserData(userId); alert('Configurações salvas!'); });
        document.getElementById('lead-form')?.addEventListener('submit', e => { e.preventDefault(); leads.push({ id: nextLeadId++, status: 'novo', nome: document.getElementById('lead-name').value, email: document.getElementById('lead-email').value, whatsapp: document.getElementById('lead-whatsapp').value, origem: document.getElementById('lead-origin').value, qualificacao: document.getElementById('lead-qualification').value, notas: document.getElementById('lead-notes').value }); saveUserData(userId); updateAllUI(); e.target.reset(); });
        const kanbanBoard = document.getElementById('kanban-board');
        if (kanbanBoard) {
            kanbanBoard.addEventListener('dragstart', e => { if (e.target.classList.contains('kanban-card')) { draggedItem = e.target; } });
            kanbanBoard.addEventListener('dragend', () => { draggedItem = null; });
            kanbanBoard.addEventListener('dragover', e => e.preventDefault());
            kanbanBoard.addEventListener('drop', e => { e.preventDefault(); const column = e.target.closest('.kanban-column'); if (column && draggedItem) { const lead = leads.find(l => l.id == draggedItem.dataset.id); if (lead) { lead.status = column.dataset.status; saveUserData(userId); renderKanbanCards(); updateDashboard(); } } });
            kanbanBoard.addEventListener('click', e => { if (e.target.tagName === 'A') { e.stopPropagation(); return; } const card = e.target.closest('.kanban-card'); if (card) openEditModal(parseInt(card.dataset.id)); });
        }
        document.getElementById('leads-table')?.addEventListener('click', e => { if (e.target.tagName === 'A') { e.stopPropagation(); return; } if (e.target.closest('.btn-edit-table')) openEditModal(parseInt(e.target.closest('tr').dataset.id)); if (e.target.closest('.btn-delete-table')) { if (confirm('Tem certeza?')) { leads = leads.filter(l => l.id != parseInt(e.target.closest('tr').dataset.id)); saveUserData(userId); updateAllUI(); } } });
        document.getElementById('edit-lead-form')?.addEventListener('submit', e => { e.preventDefault(); const lead = leads.find(l => l.id === currentLeadId); if(lead) { lead.nome = document.getElementById('edit-lead-name').value; lead.email = document.getElementById('edit-lead-email').value; lead.whatsapp = document.getElementById('edit-lead-whatsapp').value; lead.status = document.getElementById('edit-lead-status').value; lead.origem = document.getElementById('edit-lead-origem').value; lead.qualificacao = document.getElementById('edit-lead-qualification').value; lead.notas = document.getElementById('edit-lead-notes').value; saveUserData(userId); updateAllUI(); document.getElementById('edit-lead-modal').style.display = 'none'; } });
        document.getElementById('delete-lead-btn')?.addEventListener('click', () => { if (confirm('Tem certeza?')) { leads = leads.filter(l => l.id !== currentLeadId); saveUserData(userId); updateAllUI(); document.getElementById('edit-lead-modal').style.display = 'none'; } });
        document.getElementById('caixa-form')?.addEventListener('submit', e => { e.preventDefault(); caixa.push({ data: document.getElementById('caixa-data').value, descricao: document.getElementById('caixa-descricao').value, valor: parseFloat(document.getElementById('caixa-valor').value), tipo: document.getElementById('caixa-tipo').value }); saveUserData(userId); renderCaixaTable(); updateCaixa(); e.target.reset(); });
        document.querySelectorAll('.finance-tab').forEach(tab => { tab.addEventListener('click', e => { e.preventDefault(); document.querySelectorAll('.finance-tab, .finance-content').forEach(el => el.classList.remove('active')); e.target.classList.add('active'); document.getElementById(e.target.dataset.tab + '-tab-content').classList.add('active'); }); });
        document.getElementById('estoque-form')?.addEventListener('submit', e => { e.preventDefault(); const newProduct = { id: `prod_${Date.now()}`, produto: document.getElementById('estoque-produto').value, descricao: document.getElementById('estoque-descricao').value, compra: parseFloat(document.getElementById('estoque-compra').value), venda: parseFloat(document.getElementById('estoque-venda').value), custos: [] }; estoque.push(newProduct); saveUserData(userId); renderEstoqueTable(); e.target.reset(); });
        document.getElementById('estoque-search')?.addEventListener('input', renderEstoqueTable);
        document.getElementById('estoque-table')?.addEventListener('click', e => { if (e.target.closest('.btn-custo')) { const productId = e.target.closest('tr').dataset.id; openCustosModal(productId); } if (e.target.closest('.btn-delete-estoque')) { if (confirm('Tem certeza?')) { const productId = e.target.closest('tr').dataset.id; estoque = estoque.filter(p => p.id !== productId); saveUserData(userId); renderEstoqueTable(); } } });
        document.getElementById('add-custo-form')?.addEventListener('submit', e => { e.preventDefault(); const produto = estoque.find(p => p.id === currentProductId); if (produto) { const descricao = document.getElementById('custo-descricao').value; const valor = parseFloat(document.getElementById('custo-valor').value); if (!produto.custos) produto.custos = []; produto.custos.push({ descricao, valor }); saveUserData(userId); renderCustosList(produto); renderEstoqueTable(); e.target.reset(); } });
        document.getElementById('export-leads-btn')?.addEventListener('click', () => { if (leads.length === 0) { alert("Não há leads para exportar."); return; } const header = ["Nome", "Email", "WhatsApp", "Origem", "Qualificação", "Status", "Notas"]; const rows = leads.map(l => [l.nome, l.email, l.whatsapp, l.origem, l.qualificacao, l.status, `"${(l.notas || '').replace(/"/g, '""')}"`]); const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "Leads"); XLSX.writeFile(workbook, "leads.xlsx"); });
        document.getElementById('export-csv-btn')?.addEventListener('click', () => { if (estoque.length === 0) { alert("Não há produtos para exportar."); return; } const header = ["Produto", "Descrição", "Valor de Compra", "Valor de Venda"]; const rows = estoque.map(p => [p.produto, p.descricao, p.compra, p.venda]); const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque"); XLSX.writeFile(workbook, "estoque.xlsx"); });
        document.getElementById('import-csv-btn')?.addEventListener('click', () => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'; input.onchange = e => { const file = e.target.files[0]; const reader = new FileReader(); reader.onload = event => { const data = new Uint8Array(event.target.result); const workbook = XLSX.read(data, {type: 'array'}); const ws = workbook.Sheets[workbook.SheetNames[0]]; const json = XLSX.utils.sheet_to_json(ws); json.forEach(item => { const pKey = Object.keys(item).find(k=>k.toLowerCase()==='produto'); const cKey = Object.keys(item).find(k=>k.toLowerCase().includes('compra')); const vKey = Object.keys(item).find(k=>k.toLowerCase().includes('venda')); if(item[pKey] && item[cKey] && item[vKey]){ estoque.push({ id: `prod_${Date.now()}_${Math.random()}`, produto: item[pKey], descricao: item['Descrição']||item['descricao']||'', compra: parseFloat(item[cKey]), venda: parseFloat(item[vKey]), custos: [] }); } }); saveUserData(userId); renderEstoqueTable(); alert(`${json.length} produtos importados!`); }; reader.readAsArrayBuffer(file); }; input.click(); });
        document.getElementById('chatbot-form')?.addEventListener('submit', async e => { e.preventDefault(); const chatbotInput = document.getElementById('chatbot-input'); const userInput = chatbotInput.value.trim(); if (!userInput) return; addMessageToChat(userInput, 'user-message'); chatHistory.push({ role: "user", parts: [{ text: userInput }] }); chatbotInput.value = ''; addMessageToChat("Pensando...", 'bot-message bot-thinking'); try { const response = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: userInput, history: chatHistory }) }); document.querySelector('.bot-thinking')?.remove(); const data = await response.json(); if (!response.ok) throw new Error(data.details || 'Erro desconhecido'); addMessageToChat(data.text, 'bot-message'); chatHistory.push({ role: "model", parts: [{ text: data.text }] }); } catch (error) { document.querySelector('.bot-thinking')?.remove(); addMessageToChat(`Erro: ${error.message}`, 'bot-message'); } saveUserData(userId); });
        document.querySelectorAll('.close-modal').forEach(btn => { btn.addEventListener('click', () => { document.getElementById(btn.dataset.target).style.display = 'none'; }); });
    }

    function openEditModal(leadId) { currentLeadId = leadId; const lead = leads.find(l => l.id === leadId); if(lead) { document.getElementById('edit-lead-name').value = lead.nome; document.getElementById('edit-lead-email').value = lead.email; document.getElementById('edit-lead-whatsapp').value = lead.whatsapp; document.getElementById('edit-lead-status').value = lead.status; document.getElementById('edit-lead-origem').value = lead.origem; document.getElementById('edit-lead-qualification').value = lead.qualificacao; document.getElementById('edit-lead-notes').value = lead.notas; document.getElementById('edit-lead-modal').style.display = 'flex'; } }
    function openCustosModal(productId) { currentProductId = productId; const produto = estoque.find(p => p.id === productId); if (produto) { document.getElementById('custos-modal-title').textContent = `Custos de: ${produto.produto}`; renderCustosList(produto); document.getElementById('custos-modal').style.display = 'flex'; } }
    function renderCustosList(produto) { const listContainer = document.getElementById('custos-list'); if (!produto.custos || produto.custos.length === 0) { listContainer.innerHTML = '<p>Nenhum custo adicionado.</p>'; return; } listContainer.innerHTML = produto.custos.map(custo => `<div class="custo-item"><span>${custo.descricao}</span><span>R$ ${custo.valor.toFixed(2)}</span></div>`).join(''); }
    function renderKanbanCards() { document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = ''); leads.forEach(lead => { const c = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`); if (c) { const wa = `<a href="https://wa.me/${(lead.whatsapp || '').replace(/\D/g, '')}" target="_blank">${lead.whatsapp}</a>`; c.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}"><strong>${lead.nome}</strong><p>${wa}</p></div>`; } }); }
    function renderLeadsTable() { const t = document.querySelector('#leads-table tbody'); if (t) { t.innerHTML = leads.map(l => { const wa = `<a href="https://wa.me/${(lead.whatsapp || '').replace(/\D/g, '')}" target="_blank">${l.whatsapp}</a>`; return `<tr data-id="${l.id}"><td>${l.nome}</td><td>${wa}</td><td>${l.origem}</td><td>${l.qualificacao}</td><td>${l.status}</td><td><button class="btn-edit-table"><i class="ph-fill ph-note-pencil"></i></button><button class="btn-delete-table"><i class="ph-fill ph-trash"></i></button></td></tr>`; }).join(''); } }
    function updateDashboard() { const n = leads.filter(l=>l.status==='novo').length, p=leads.filter(l=>l.status==='progresso').length, f=leads.filter(l=>l.status==='fechado').length; document.getElementById('total-leads').textContent = leads.length; document.getElementById('leads-novo').textContent = n; document.getElementById('leads-progresso').textContent = p; document.getElementById('leads-fechado').textContent = f; const ctx = document.getElementById('statusChart')?.getContext('2d'); if (!ctx) return; if (statusChart) statusChart.destroy(); statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Progresso', 'Fechado'], datasets: [{ data: [n, p, f], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'] }] } }); }
    function renderCaixaTable() { const t = document.querySelector('#caixa-table tbody'); if (t) { t.innerHTML = caixa.map(m => `<tr><td>${m.data}</td><td>${m.descricao}</td><td>${m.tipo==='entrada'?'R$ '+m.valor.toFixed(2):''}</td><td>${m.tipo==='saida'?'R$ '+m.valor.toFixed(2):''}</td></tr>`).join(''); } }
    function updateCaixa() { const e = caixa.filter(m=>m.tipo==='entrada').reduce((a,c)=>a+c.valor,0), s = caixa.filter(m=>m.tipo==='saida').reduce((a,c)=>a+c.valor,0); document.getElementById('total-entradas').textContent = `R$ ${e.toFixed(2)}`; document.getElementById('total-saidas').textContent = `R$ ${s.toFixed(2)}`; document.getElementById('caixa-atual').textContent = `R$ ${(e-s).toFixed(2)}`; }
    function renderEstoqueTable() { const t = document.querySelector('#estoque-table tbody'); if (!t) return; const searchTerm = document.getElementById('estoque-search').value.toLowerCase(); const filteredEstoque = estoque.filter(p => (p.produto && p.produto.toLowerCase().includes(searchTerm)) || (p.descricao && p.descricao.toLowerCase().includes(searchTerm))); t.innerHTML = filteredEstoque.map(p => { const totalCustos = (p.custos || []).reduce((acc, c) => acc + c.valor, 0); const lucro = p.venda - p.compra - totalCustos; return `<tr data-id="${p.id}"><td>${p.produto}</td><td>${p.descricao}</td><td>R$ ${p.compra.toFixed(2)}</td><td>R$ ${totalCustos.toFixed(2)}</td><td>R$ ${p.venda.toFixed(2)}</td><td>R$ ${lucro.toFixed(2)}</td><td><button class="btn-custo">Custos</button><button class="btn-delete-table btn-delete-estoque"><i class="ph-fill ph-trash"></i></button></td></tr>`; }).join(''); }
    function addMessageToChat(msg, type) { const c = document.getElementById('chatbot-messages'); if (c) { c.innerHTML += `<div class="${type}">${msg}</div>`; c.scrollTop = c.scrollHeight; } }
    function renderChatHistory() { const c = document.getElementById('chatbot-messages'); if (!c) return; c.innerHTML = ''; if (chatHistory.length === 0) { addMessageToChat("Olá! Como posso ajudar?", 'bot-message'); } else { chatHistory.forEach(m => addMessageToChat(m.parts[0].text, m.role === 'user' ? 'user-message' : 'bot-message')); } }
    function renderMentoria() {
        const menu = document.getElementById('mentoria-menu'); const content = document.getElementById('mentoria-content'); if (!menu || !content) return;
        menu.innerHTML = mentoriaData.map((mod, i) => `<div class="sales-accelerator-menu-item ${i === 0 ? 'active' : ''}" data-module-id="${mod.moduleId}">${mod.title}</div>`).join('');
        content.innerHTML = mentoriaData.map((mod, i) => { const placeholder = mod.exercisePrompt || `Digite aqui suas anotações para o Módulo ${i + 1}...`; return `<div class="mentoria-module-content ${i === 0 ? 'active' : ''}" id="${mod.moduleId}">${mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content}</p></div>`).join('')}<div class="anotacoes-aluno"><label for="notas-${mod.moduleId}">Minhas Anotações / Exercícios</label><textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="8" placeholder="${placeholder}"></textarea></div></div>`; }).join('');
        document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => { item.addEventListener('click', e => { document.querySelectorAll('.sales-accelerator-menu-item').forEach(el => el.classList.remove('active')); document.querySelectorAll('.mentoria-module-content').forEach(el => el.classList.remove('active')); const clickedItem = e.currentTarget; clickedItem.classList.add('active'); document.getElementById(clickedItem.dataset.moduleId).classList.add('active'); }); });
        document.querySelectorAll('.mentoria-notas').forEach(t => t.addEventListener('keyup', () => saveUserData(firebase.auth().currentUser.uid)));
    }
    function getMentoriaNotes() { const n = {}; document.querySelectorAll('.mentoria-notas').forEach(t => n[t.id] = t.value); return n; }
    function loadMentoriaNotes(notes = {}) { for (const id in notes) { const t = document.getElementById(id); if (t) t.value = notes[id]; } }
});
