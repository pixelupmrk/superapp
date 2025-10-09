document.addEventListener('DOMContentLoaded', () => {
    let leads = [], caixa = [], estoque = [], mentoriaNotes = {};
    let db, currentUserId;
    let unsubscribeLeads;

    // Dados da mentoria (Acelerador de Vendas)
    const mentoriaData = [
        {"moduleId":"MD01","title":"Módulo 1: Conectando com o Cliente Ideal","lessons":[{"lessonId":"L01.01","title":"Questionário para Definição de Persona","content":"..."}]},
        {"moduleId":"MD02","title":"Módulo 2: O Algoritmo da Meta","lessons":[{"lessonId":"L02.01","title":"Como o Algoritmo Funciona","content":"..."}]}
        // Adicione todos os outros módulos da mentoria aqui
    ];

    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                currentUserId = user.uid;
                db = firebase.firestore();
                setupEventListeners(currentUserId);
                setupRealtimeListeners(currentUserId);
                loadInitialData(currentUserId);
            }
        });
    }
    main();

    function setupRealtimeListeners(userId) {
        if (unsubscribeLeads) unsubscribeLeads();
        unsubscribeLeads = db.collection('users').doc(userId).collection('leads')
            .onSnapshot(snapshot => {
                leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                updateAllUI();
            }, error => console.error("Erro ao ouvir leads:", error));
    }

    async function loadInitialData(userId) {
        const doc = await db.collection('users').doc(userId).get();
        if (doc.exists) {
            const data = doc.data();
            caixa = data.caixa || [];
            estoque = data.estoque || [];
            mentoriaNotes = data.mentoriaNotes || {};
            // Carrega outras configurações como botUrl, etc.
        }
        updateAllUI(); // Atualiza a UI com os dados carregados
    }
    
    function updateAllUI() {
        renderKanbanCards();
        renderLeadsTable();
        renderCaixaTable();
        updateCaixa();
        renderEstoqueTable();
        renderMentoria();
        loadMentoriaNotes();
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    function renderKanbanCards() { /* ... (como estava antes) ... */ }
    function renderLeadsTable() { /* ... (como estava antes) ... */ }
    
    function renderCaixaTable() {
        const tbody = document.querySelector('#caixa-table tbody');
        if (tbody) tbody.innerHTML = caixa.map(m => `<tr><td>${m.data}</td><td>${m.descricao}</td><td>${m.tipo === 'entrada' ? `R$ ${m.valor.toFixed(2)}` : ''}</td><td>${m.tipo === 'saida' ? `R$ ${m.valor.toFixed(2)}` : ''}</td></tr>`).join('');
    }

    function updateCaixa() {
        const totalEntradas = caixa.filter(m => m.tipo === 'entrada').reduce((acc, cur) => acc + cur.valor, 0);
        const totalSaidas = caixa.filter(m => m.tipo === 'saida').reduce((acc, cur) => acc + cur.valor, 0);
        document.getElementById('total-entradas').textContent = `R$ ${totalEntradas.toFixed(2)}`;
        document.getElementById('total-saidas').textContent = `R$ ${totalSaidas.toFixed(2)}`;
        document.getElementById('caixa-atual').textContent = `R$ ${(totalEntradas - totalSaidas).toFixed(2)}`;
    }

    function renderEstoqueTable() {
        const tbody = document.querySelector('#estoque-table tbody');
        if(tbody) tbody.innerHTML = estoque.map(p => `<tr><td>${p.produto}</td><td>...</td></tr>`).join('');
    }

    function renderMentoria() {
        const menu = document.getElementById('mentoria-menu');
        const content = document.getElementById('mentoria-content');
        if (!menu || !content) return;
        menu.innerHTML = mentoriaData.map(mod => `<div class="sales-accelerator-menu-item" data-module-id="${mod.moduleId}">${mod.title}</div>`).join('');
        content.innerHTML = mentoriaData.map(mod => `<div class="mentoria-module-content" id="${mod.moduleId}">${mod.lessons.map(l => `<h3>${l.title}</h3><p>${l.content}</p>`).join('')}</div>`).join('');
    }

    function loadMentoriaNotes() {
        for (const id in mentoriaNotes) {
            const textarea = document.getElementById(id);
            if (textarea) textarea.value = mentoriaNotes[id];
        }
    }

    function setupEventListeners(userId) {
        // Navegação
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
            });
        });

        // Finanças
        document.querySelectorAll('.finance-tab').forEach(tab => {
            tab.addEventListener('click', e => {
                e.preventDefault();
                document.querySelectorAll('.finance-tab, .finance-content').forEach(el => el.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(e.target.dataset.tab + '-tab-content').classList.add('active');
            });
        });
        
        // Listeners para os formulários de finanças, etc.
    }
});
