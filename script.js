// script.js — versão corrigida
document.addEventListener('DOMContentLoaded', () => {
    // --- DADOS COMPLETOS DA MENTORIA ---
    const mentoriaData = [ /* ...mantive seu array original sem alteração... */ ];

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
            if (!userId) {
                console.warn('saveUserData chamado sem userId. Salvando localmente (fallback).');
                return;
            }
            await db.collection('userData').doc(userId).set(dataToSave);
        } catch (error) {
            console.error("ERRO CRÍTICO AO SALVAR DADOS NO FIRESTORE:", error);
            alert("Atenção: Não foi possível salvar os dados. Verifique o console de erros (F12) para mais detalhes. O problema pode ser relacionado às regras de segurança do Firestore.");
        }
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
        const profileSpan = document.querySelector('.user-profile span');
        if (profileSpan) profileSpan.textContent = `Olá, ${userName}`;
        const settingInput = document.getElementById('setting-user-name');
        if (settingInput) settingInput.value = userName;
    }

    function setupEventListeners(userId) {
        const menuToggle = document.getElementById('menu-toggle');
        const appContainer = document.getElementById('app-container');

        if (menuToggle && appContainer) {
            menuToggle.addEventListener('click', () => {
                appContainer.classList.toggle('sidebar-visible');
            });
        }
        
        // Navegação lateral (usar currentTarget para evitar problemas de clique em elementos filhos)
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
                const targetEl = document.getElementById(targetId);
                if (targetEl) targetEl.style.display = 'block';
                const titleSpan = e.currentTarget.querySelector('span');
                if (titleSpan) document.getElementById('page-title').textContent = titleSpan.textContent;
            });
        });

        document.getElementById('theme-toggle-btn')?.addEventListener('click', () => { 
            document.body.classList.toggle('light-theme'); 
            const isLight = document.body.classList.contains('light-theme'); 
            document.getElementById('theme-toggle-btn').textContent = isLight ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro'; 
            if (firebase.auth().currentUser) saveUserData(firebase.auth().currentUser.uid); 
        });
        
        document.getElementById('save-settings-btn')?.addEventListener('click', async () => {
            if (!firebase.auth().currentUser) { alert('Faça login para salvar as configurações.'); return; }
            await saveUserData(firebase.auth().currentUser.uid);
            alert('Configurações salvas!');
        });

        document.getElementById('lead-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            leads.push({ id: nextLeadId++, status: 'novo', nome: document.getElementById('lead-name').value, email: document.getElementById('lead-email').value, whatsapp: document.getElementById('lead-whatsapp').value, origem: document.getElementById('lead-origin').value, qualificacao: document.getElementById('lead-qualification').value, notas: document.getElementById('lead-notes').value });
            if (firebase.auth().currentUser) await saveUserData(firebase.auth().currentUser.uid);
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
                        if (firebase.auth().currentUser) await saveUserData(firebase.auth().currentUser.uid);
                        renderKanbanCards();
                        updateDashboard();
                    }
                }
            });

            // Delegação de clique no kanban: permitir abrir modal ao clicar no card,
            // mas IGNORAR quando o clique foi em um link (ex: referência para WhatsApp)
            kanbanBoard.addEventListener('click', e => { 
                // se clicou em um <a> ou filho de <a>, ignora (abre o link)
                if (e.target.closest('a')) { return; }
                const card = e.target.closest('.kanban-card'); 
                if (card) openEditModal(parseInt(card.dataset.id)); 
            });
        }
        
        // Tabela de leads (usar delegação segura)
        document.getElementById('leads-table')?.addEventListener('click', e => { 
            if (e.target.closest('a')) { return; } 
            const tr = e.target.closest('tr');
            if (!tr) return;
            const id = parseInt(tr.dataset.id);
            if (e.target.closest('.btn-edit-table')) openEditModal(id);
            else if (e.target.closest('.btn-delete-table')) { if (confirm('Tem certeza?')) { leads = leads.filter(l => l.id != id); if (firebase.auth().currentUser) saveUserData(firebase.auth().currentUser.uid); updateAllUI(); } }
        });

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
                if (firebase.auth().currentUser) await saveUserData(firebase.auth().currentUser.uid);
                updateAllUI();
                const modal = document.getElementById('edit-lead-modal');
                if (modal) modal.style.display = 'none';
            }
        });

        document.getElementById('delete-lead-btn')?.addEventListener('click', async () => {
            if (confirm('Tem certeza?')) {
                leads = leads.filter(l => l.id !== currentLeadId);
                if (firebase.auth().currentUser) await saveUserData(firebase.auth().currentUser.uid);
                updateAllUI();
                const modal = document.getElementById('edit-lead-modal');
                if (modal) modal.style.display = 'none';
            }
        });

        document.getElementById('caixa-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            caixa.push({ data: document.getElementById('caixa-data').value, descricao: document.getElementById('caixa-descricao').value, valor: parseFloat(document.getElementById('caixa-valor').value), tipo: document.getElementById('caixa-tipo').value });
            if (firebase.auth().currentUser) await saveUserData(firebase.auth().currentUser.uid);
            renderCaixaTable();
            updateCaixa();
            e.target.reset();
        });

        // *** Corrigido: usar currentTarget para pegar o dataset correto ***
        document.querySelectorAll('.finance-tab').forEach(tab => { 
            tab.addEventListener('click', e => { 
                e.preventDefault(); 
                document.querySelectorAll('.finance-tab, .finance-content').forEach(el => el.classList.remove('active')); 
                e.currentTarget.classList.add('active'); 
                const tabname = e.currentTarget.dataset.tab;
                const el = document.getElementById(tabname + '-tab-content');
                if (el) el.classList.add('active');
            }); 
        });
        
        document.getElementById('estoque-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newProduct = { id: `prod_${Date.now()}`, produto: document.getElementById('estoque-produto').value, descricao: document.getElementById('estoque-descricao').value, compra: parseFloat(document.getElementById('estoque-compra').value), venda: parseFloat(document.getElementById('estoque-venda').value), custos: [] };
            estoque.push(newProduct);
            if (firebase.auth().currentUser) await saveUserData(firebase.auth().currentUser.uid);
            renderEstoqueTable();
            e.target.reset();
        });
        
        document.getElementById('estoque-search')?.addEventListener('input', renderEstoqueTable);
        
        document.getElementById('estoque-table')?.addEventListener('click', async (e) => {
            if (e.target.closest('.btn-custo')) {
                const tr = e.target.closest('tr');
                if (!tr) return;
                const productId = tr.dataset.id;
                openCustosModal(productId);
            }
            if (e.target.closest('.btn-delete-estoque')) {
                if (confirm('Tem certeza?')) {
                    const productId = e.target.closest('tr').dataset.id;
                    estoque = estoque.filter(p => p.id !== productId);
                    if (firebase.auth().currentUser) await saveUserData(firebase.auth().currentUser.uid);
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
                if (firebase.auth().currentUser) await saveUserData(firebase.auth().currentUser.uid);
                renderCustosList(produto);
                renderEstoqueTable();
                e.target.reset();
            }
        });

        document.getElementById('export-leads-btn')?.addEventListener('click', () => { if (leads.length === 0) { alert("Não há leads para exportar."); return; } const header = ["Nome", "Email", "WhatsApp", "Origem", "Qualificação", "Status", "Notas"]; const rows = leads.map(l => [l.nome, l.email, l.whatsapp, l.origem, l.qualificacao, l.status, `"${(l.notas || '').replace(/"/g, '""')}"`]); const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "Leads"); XLSX.writeFile(workbook, "leads.xlsx"); });
        document.getElementById('export-csv-btn')?.addEventListener('click', () => { if (estoque.length === 0) { alert("Não há produtos para exportar."); return; } const header = ["Produto", "Descrição", "Valor de Compra", "Valor de Venda"]; const rows = estoque.map(p => [p.produto, p.descricao, p.compra, p.venda]); const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque"); XLSX.writeFile(workbook, "estoque.xlsx"); });
        document.getElementById('import-csv-btn')?.addEventListener('click', () => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'; input.onchange = e => { const file = e.target.files[0]; const reader = new FileReader(); reader.onload = async (event) => { const data = new Uint8Array(event.target.result); const workbook = XLSX.read(data, {type: 'array'}); const ws = workbook.Sheets[workbook.SheetNames[0]]; const json = XLSX.utils.sheet_to_json(ws); json.forEach(item => { const pKey = Object.keys(item).find(k=>k.toLowerCase()==='produto'); const cKey = Object.keys(item).find(k=>k.toLowerCase().includes('compra')); const vKey = Object.keys(item).find(k=>k.toLowerCase().includes('venda')); if(item[pKey] && item[cKey] && item[vKey]){ estoque.push({ id: `prod_${Date.now()}_${Math.random()}`, produto: item[pKey], descricao: item['Descrição']||item['descricao']||'', compra: parseFloat(item[cKey]), venda: parseFloat(item[vKey]), custos: [] }); } }); if (firebase.auth().currentUser) await saveUserData(firebase.auth().currentUser.uid); renderEstoqueTable(); alert(`${json.length} produtos importados!`); }; reader.readAsArrayBuffer(file); }; input.click(); });
        
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
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details || 'Erro desconhecido na API');
                }
                const data = await response.json();
                addMessageToChat(data.text, 'bot-message');
                chatHistory.push({ role: "model", parts: [{ text: data.text }] });
            } catch (error) {
                document.querySelector('.bot-thinking')?.remove();
                addMessageToChat(`Erro: ${error.message}`, 'bot-message');
            }
            if (firebase.auth().currentUser) await saveUserData(firebase.auth().currentUser.uid);
        });
        
        document.querySelectorAll('.close-modal').forEach(btn => { btn.addEventListener('click', () => { const modal = document.getElementById(btn.dataset.target); if (modal) modal.style.display = 'none'; }); });
    }

    function openEditModal(leadId) { 
        currentLeadId = leadId; 
        const lead = leads.find(l => l.id === leadId);
        if(lead) { 
            document.getElementById('edit-lead-name').value = lead.nome || '';
            document.getElementById('edit-lead-email').value = lead.email || '';
            document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
            document.getElementById('edit-lead-status').value = lead.status || 'novo';
            document.getElementById('edit-lead-origem').value = lead.origem || '';
            const qualEl = document.getElementById('edit-lead-qualification');
            if (qualEl) qualEl.value = lead.qualificacao || '';
            document.getElementById('edit-lead-notes').value = lead.notas || '';
            const modal = document.getElementById('edit-lead-modal');
            if (modal) modal.style.display = 'flex';
        } 
    }
    function openCustosModal(productId) { currentProductId = productId; const produto = estoque.find(p => p.id === productId); if (produto) { const title = document.getElementById('custos-modal-title'); if (title) title.textContent = `Custos de: ${produto.produto}`; renderCustosList(produto); const modal = document.getElementById('custos-modal'); if (modal) modal.style.display = 'flex'; } }
    function renderCustosList(produto) { const listContainer = document.getElementById('custos-list'); if (!produto.custos || produto.custos.length === 0) { if (listContainer) listContainer.innerHTML = '<p>Nenhum custo adicionado.</p>'; return; } if (listContainer) listContainer.innerHTML = produto.custos.map(custo => `<div class="custo-item"><span>${custo.descricao}</span><span>R$ ${custo.valor.toFixed(2)}</span></div>`).join(''); }
    function renderKanbanCards() { document.querySelectorAll('.kanban-cards-list').forEach(l => l.innerHTML = ''); leads.forEach(lead => { const c = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`); if (c) { const wa = `<a href="https://wa.me/${(lead.whatsapp || '').replace(/\D/g, '')}" target="_blank">${lead.whatsapp}</a>`; c.innerHTML += `<div class="kanban-card" draggable="true" data-id="${lead.id}" style="cursor: pointer;"><strong>${lead.nome}</strong><p>${wa}</p></div>`; } }); }
    function renderLeadsTable() { const t = document.querySelector('#leads-table tbody'); if (t) { t.innerHTML = leads.map(l => { const wa = `<a href="https://wa.me/${(l.whatsapp || '').replace(/\D/g, '')}" target="_blank">${l.whatsapp}</a>`; return `<tr data-id="${l.id}"><td>${l.nome}</td><td>${wa}</td><td>${l.origem}</td><td>${l.qualificacao}</td><td>${l.status}</td><td><button class="btn-edit-table"><i class="ph-fill ph-note-pencil"></i></button><button class="btn-delete-table"><i class="ph-fill ph-trash"></i></button></td></tr>`; }).join(''); } }
    function updateDashboard() { const n = leads.filter(l=>l.status==='novo').length, p=leads.filter(l=>l.status==='progresso').length, f=leads.filter(l=>l.status==='fechado').length; const totalEl = document.getElementById('total-leads'); if (totalEl) totalEl.textContent = leads.length; const novoEl = document.getElementById('leads-novo'); if (novoEl) novoEl.textContent = n; const progEl = document.getElementById('leads-progresso'); if (progEl) progEl.textContent = p; const fechEl = document.getElementById('leads-fechado'); if (fechEl) fechEl.textContent = f; const ctx = document.getElementById('statusChart')?.getContext('2d'); if (!ctx) return; if (statusChart) statusChart.destroy(); statusChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Novo', 'Progresso', 'Fechado'], datasets: [{ data: [n, p, f], backgroundColor: ['#00f7ff', '#ffc107', '#28a745'] }] } }); }
    function renderCaixaTable() { const t = document.querySelector('#caixa-table tbody'); if (t) { t.innerHTML = caixa.map(m => `<tr><td>${m.data}</td><td>${m.descricao}</td><td>${m.tipo==='entrada'?'R$ '+m.valor.toFixed(2):''}</td><td>${m.tipo==='saida'?'R$ '+m.valor.toFixed(2):''}</td></tr>`).join(''); } }
    function updateCaixa() { const e = caixa.filter(m=>m.tipo==='entrada').reduce((a,c)=>a+c.valor,0), s = caixa.filter(m=>m.tipo==='saida').reduce((a,c)=>a+c.valor,0); const entradasEl = document.getElementById('total-entradas'); if (entradasEl) entradasEl.textContent = `R$ ${e.toFixed(2)}`; const saidasEl = document.getElementById('total-saidas'); if (saidasEl) saidasEl.textContent = `R$ ${s.toFixed(2)}`; const saldoEl = document.getElementById('caixa-atual'); if (saldoEl) saldoEl.textContent = `R$ ${(e-s).toFixed(2)}`; }
    function renderEstoqueTable() { const t = document.querySelector('#estoque-table tbody'); if (!t) return; const searchTerm = (document.getElementById('estoque-search')?.value || '').toLowerCase(); const filteredEstoque = estoque.filter(p => (p.produto && p.produto.toLowerCase().includes(searchTerm)) || (p.descricao && p.descricao.toLowerCase().includes(searchTerm))); t.innerHTML = filteredEstoque.map(p => { const totalCustos = (p.custos || []).reduce((acc, c) => acc + c.valor, 0); const lucro = p.venda - p.compra - totalCustos; return `<tr data-id="${p.id}"><td>${p.produto}</td><td>${p.descricao}</td><td>R$ ${p.compra.toFixed(2)}</td><td>R$ ${totalCustos.toFixed(2)}</td><td>R$ ${p.venda.toFixed(2)}</td><td>R$ ${lucro.toFixed(2)}</td><td><button class="btn-custo">Custos</button><button class="btn-delete-table btn-delete-estoque"><i class="ph-fill ph-trash"></i></button></td></tr>`; }).join(''); }
    function addMessageToChat(msg, type) { const c = document.getElementById('chatbot-messages'); if (c) { c.innerHTML += `<div class="${type}">${msg}</div>`; c.scrollTop = c.scrollHeight; } }
    function renderChatHistory() { const c = document.getElementById('chatbot-messages'); if (!c) return; c.innerHTML = ''; if (chatHistory.length === 0) { addMessageToChat("Olá! Como posso ajudar?", 'bot-message'); } else { chatHistory.forEach(m => addMessageToChat(m.parts[0].text, m.role === 'user' ? 'user-message' : 'bot-message')); } }
    function renderMentoria() {
        const menu = document.getElementById('mentoria-menu'); const content = document.getElementById('mentoria-content'); if (!menu || !content) return;
        menu.innerHTML = mentoriaData.map((mod, i) => `<div class="sales-accelerator-menu-item ${i === 0 ? 'active' : ''}" data-module-id="${mod.moduleId}">${mod.title}</div>`).join('');
        content.innerHTML = mentoriaData.map((mod, i) => { const placeholder = mod.exercisePrompt || `Digite aqui suas anotações para o Módulo ${i + 1}...`; return `<div class="mentoria-module-content ${i === 0 ? 'active' : ''}" id="${mod.moduleId}">${mod.lessons.map(les => `<div class="mentoria-lesson"><h3>${les.title}</h3><p>${les.content}</p></div>`).join('')}<div class="anotacoes-aluno"><label for="notas-${mod.moduleId}">Minhas Anotações / Exercícios</label><textarea class="mentoria-notas" id="notas-${mod.moduleId}" rows="8" placeholder="${placeholder}"></textarea></div></div>`; }).join('');
        document.querySelectorAll('.sales-accelerator-menu-item').forEach(item => { item.addEventListener('click', e => { document.querySelectorAll('.sales-accelerator-menu-item').forEach(el => el.classList.remove('active')); document.querySelectorAll('.mentoria-module-content').forEach(el => el.classList.remove('active')); const clickedItem = e.currentTarget; clickedItem.classList.add('active'); document.getElementById(clickedItem.dataset.moduleId).classList.add('active'); }); });
        document.querySelectorAll('.mentoria-notas').forEach(t => t.addEventListener('keyup', () => { const user = firebase.auth().currentUser; if (user) saveUserData(user.uid); }));
    }
    function getMentoriaNotes() { const n = {}; document.querySelectorAll('.mentoria-notas').forEach(t => n[t.id] = t.value); return n; }
    function loadMentoriaNotes(notes = {}) { for (const id in notes) { const t = document.getElementById(id); if (t) t.value = notes[id]; } }
});
