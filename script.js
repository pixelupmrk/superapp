// script.js - VERSÃO FINAL
document.addEventListener('DOMContentLoaded', () => {
    // --- DADOS DA MENTORIA (sem alterações) ---
    const mentoriaData = [ /* ... seu array mentoriaData completo aqui ... */ ];

    let leads = [], caixa = [], estoque = [];
    let nextLeadId = 0, currentLeadId = null, draggedItem = null, currentProductId = null;
    let statusChart;
    let db;
    let unsubscribeLeadChatListener = null; // Listener para o chat do lead

    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user && !document.body.hasAttribute('data-initialized')) {
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
            const userDocRef = db.collection('userData').doc(userId);
            const doc = await userDocRef.get();
            if (doc.exists) {
                const data = doc.data();
                caixa = data.caixa || [];
                estoque = data.estoque || [];
                estoque.forEach((item, index) => { if (!item.id) item.id = `prod_${Date.now()}_${index}`; });
                applySettings(data.settings);
                loadMentoriaNotes(data.mentoriaNotes);
            } else {
                applySettings();
            }

            // Listener para a coleção de leads
            db.collection('userData').doc(userId).collection('leads').onSnapshot(snapshot => {
                leads = [];
                snapshot.forEach(doc => {
                    leads.push({ firestoreId: doc.id, ...doc.data() });
                });
                nextLeadId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 0;
                updateAllUI();
            });

            renderMentoria();

        } catch (error) { console.error("Erro ao carregar dados:", error); }
    }

    async function saveLead(userId, leadData) {
        const { firestoreId, ...dataToSave } = leadData;
        const leadsCollection = db.collection('userData').doc(userId).collection('leads');
        if (firestoreId) {
            await leadsCollection.doc(firestoreId).set(dataToSave, { merge: true });
        } else {
            await leadsCollection.add(dataToSave);
        }
    }

    function updateAllUI() {
        renderKanbanCards();
        renderLeadsTable();
        updateDashboard();
        renderCaixaTable();
        updateCaixa();
        renderEstoqueTable();
    }
    
    // --- FUNÇÕES DE LÓGICA (a maioria sem alterações) ---
    function applySettings(settings = {}) { /* ... código sem alterações ... */ }
    function renderKanbanCards() { /* ... código sem alterações ... */ }
    function renderLeadsTable() { /* ... código sem alterações ... */ }
    function updateDashboard() { /* ... código sem alterações ... */ }
    function renderCaixaTable() { /* ... código sem alterações ... */ }
    function updateCaixa() { /* ... código sem alterações ... */ }
    function renderEstoqueTable() { /* ... código sem alterações ... */ }
    function openCustosModal(productId) { /* ... código sem alterações ... */ }
    function renderCustosList(produto) { /* ... código sem alterações ... */ }
    function addMessageToChat(msg, type, containerId) { 
        const c = document.getElementById(containerId); 
        if (c) { 
            c.innerHTML += `<div class="${type}">${msg}</div>`; 
            c.scrollTop = c.scrollHeight; 
        } 
    }
    function renderMentoria() { /* ... código sem alterações ... */ }
    function getMentoriaNotes() { /* ... código sem alterações ... */ }
    function loadMentoriaNotes(notes = {}) { /* ... código sem alterações ... */ }


    // --- GRANDE ATUALIZAÇÃO NA FUNÇÃO DE ABRIR O MODAL ---
    function openEditModal(leadId) {
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        
        if(lead) {
            // Preenche o formulário como antes
            document.getElementById('edit-lead-name').value = lead.nome;
            document.getElementById('edit-lead-email').value = lead.email;
            document.getElementById('edit-lead-whatsapp').value = lead.whatsapp;
            document.getElementById('edit-lead-status').value = lead.status;
            document.getElementById('edit-lead-origem').value = lead.origem;
            document.getElementById('edit-lead-qualification').value = lead.qualificacao;
            document.getElementById('edit-lead-notes').value = lead.notas;
            
            // ATIVA O LISTENER DE CHAT PARA ESTE LEAD ESPECÍFICO
            const userId = firebase.auth().currentUser.uid;
            const leadChatRef = db.collection('userData').doc(userId).collection('leads').doc(lead.firestoreId).collection('chatHistory').orderBy('timestamp');

            if (unsubscribeLeadChatListener) unsubscribeLeadChatListener(); // Cancela o ouvinte anterior
            
            unsubscribeLeadChatListener = leadChatRef.onSnapshot(snapshot => {
                const messagesContainer = document.getElementById('lead-chatbot-messages');
                messagesContainer.innerHTML = ''; // Limpa chat anterior
                if (snapshot.empty) {
                    addMessageToChat("Converse com a IA para iniciar.", 'bot-message', 'lead-chatbot-messages');
                } else {
                    snapshot.forEach(doc => {
                        const message = doc.data();
                        addMessageToChat(message.parts[0].text, message.role === 'user' ? 'user-message' : 'bot-message', 'lead-chatbot-messages');
                    });
                }
            });

            document.getElementById('edit-lead-modal').style.display = 'flex';
        }
    }
    
    function setupEventListeners(userId) {
        // --- EVENT LISTENERS EXISTENTES (a maioria sem alteração) ---
        // ... sidebar, theme, lead-form, kanban, etc ...

        // ATUALIZAÇÃO NO FORM DE NOVO LEAD
        document.getElementById('lead-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newLead = { 
                id: nextLeadId++, 
                status: 'novo', 
                nome: document.getElementById('lead-name').value, 
                email: document.getElementById('lead-email').value, 
                whatsapp: document.getElementById('lead-whatsapp').value, 
                origem: document.getElementById('lead-origin').value, 
                qualificacao: document.getElementById('lead-qualification').value, 
                notas: document.getElementById('lead-notes').value 
            };
            await db.collection('userData').doc(userId).collection('leads').add(newLead);
            e.target.reset();
        });
        
        // ATUALIZAÇÃO NO FORM DE EDIÇÃO DE LEAD
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
                
                await saveLead(userId, lead);
                document.getElementById('edit-lead-modal').style.display = 'none';
            }
        });
        
        // NOVO EVENT LISTENER PARA O CHAT DENTRO DO MODAL
        document.getElementById('lead-chatbot-form')?.addEventListener('submit', async e => {
            e.preventDefault();
            const lead = leads.find(l => l.id === currentLeadId);
            const chatbotInput = document.getElementById('lead-chatbot-input');
            const userInput = chatbotInput.value.trim();

            if (!userInput || !lead) return;

            const messageToSend = userInput;
            chatbotInput.value = '';

            try {
                const startAiChatFunction = firebase.functions().httpsCallable('startAiChat');
                await startAiChatFunction({ prompt: messageToSend, leadId: lead.firestoreId });
            } catch (error) {
                console.error("Erro ao chamar a Cloud Function:", error);
                addMessageToChat(`Erro ao enviar: ${error.message}`, 'bot-message', 'lead-chatbot-messages');
            }
        });

        // Fechar modal agora também desliga o ouvinte do chat
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById(btn.dataset.target).style.display = 'none';
                if (btn.dataset.target === 'edit-lead-modal' && unsubscribeLeadChatListener) {
                    unsubscribeLeadChatListener();
                    unsubscribeLeadChatListener = null;
                }
            });
        });

        // O listener do chatbot antigo (página separada) pode ser removido ou mantido,
        // dependendo se você ainda quer ter uma página de chat genérica.
        // Vou deixá-lo comentado por enquanto.
        /*
        document.getElementById('chatbot-form')?.addEventListener('submit', ...);
        */
    }
});
