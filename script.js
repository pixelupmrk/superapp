// script.js - VERSÃO FINAL E CORRIGIDA
document.addEventListener('DOMContentLoaded', () => {
    const mentoriaData = [ /* Seus dados da mentoria */ ];

    let leads = [], caixa = [], estoque = [];
    let nextLeadId = 0, currentLeadId = null, draggedItem = null, currentProductId = null;
    let statusChart;
    let db;
    let unsubscribeLeadChatListener = null;

    async function main() {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user && !document.body.hasAttribute('data-initialized')) {
                document.body.setAttribute('data-initialized', 'true');
                db = firebase.firestore();
                await loadStaticUserData(user.uid);
                setupRealtimeListeners(user.uid);
                setupEventListeners(user.uid);
            }
        });
    }
    main();

    async function loadStaticUserData(userId) {
        try {
            const userDocRef = db.collection('userData').doc(userId);
            const doc = await userDocRef.get();
            if (doc.exists) {
                const data = doc.data();
                caixa = data.caixa || [];
                estoque = data.estoque || [];
                estoque.forEach((item, index) => { if (!item.id) item.id = `prod_${Date.now()}_${index}`; });
                applySettings(data.settings);
            } else {
                applySettings();
            }
            updateFinanceUI();
        } catch (error) { console.error("Erro ao carregar dados estáticos:", error); }
    }

    function setupRealtimeListeners(userId) {
        db.collection('userData').doc(userId).collection('leads').onSnapshot(snapshot => {
            leads = [];
            snapshot.forEach(doc => {
                leads.push({ firestoreId: doc.id, ...doc.data() });
            });
            nextLeadId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 0;
            updateCrmUI();
        }, error => {
            console.error("Erro no listener de leads: ", error);
        });
    }

    function updateCrmUI() {
        renderKanbanCards();
        renderLeadsTable();
        updateDashboard();
    }

    function updateFinanceUI() {
        renderCaixaTable();
        updateCaixa();
        renderEstoqueTable();
    }
    
    function applySettings(settings = {}) { /* ... código ... */ }
    
    async function saveUserData(userId, dataToSave) { /* ... código ... */ }

    function setupEventListeners(userId) {
        // ... todos os seus event listeners aqui, sem alterações no código que você me enviou ...
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
        
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById(btn.dataset.target).style.display = 'none';
                if (btn.dataset.target === 'edit-lead-modal' && unsubscribeLeadChatListener) {
                    unsubscribeLeadChatListener();
                    unsubscribeLeadChatListener = null;
                }
            });
        });
    }

    function openEditModal(leadId) {
        currentLeadId = leadId;
        const lead = leads.find(l => l.id === leadId);
        
        if(lead) {
            document.getElementById('edit-lead-name').value = lead.nome;
            // ... resto do preenchimento do formulário ...
            
            const userId = firebase.auth().currentUser.uid;
            const leadChatRef = db.collection('userData').doc(userId).collection('leads').doc(lead.firestoreId).collection('chatHistory').orderBy('timestamp');

            if (unsubscribeLeadChatListener) unsubscribeLeadChatListener();
            
            unsubscribeLeadChatListener = leadChatRef.onSnapshot(snapshot => {
                const messagesContainer = document.getElementById('lead-chatbot-messages');
                messagesContainer.innerHTML = '';
                if (snapshot.empty) {
                    addMessageToChat("Converse com a IA para iniciar.", 'bot-message', 'lead-chatbot-messages');
                } else {
                    snapshot.forEach(doc => {
                        const message = doc.data();
                        addMessageToChat(message.parts[0].text, message.role === 'user' ? 'user-message' : 'bot-message', 'lead-chatbot-messages');
                    });
                }
            }, error => console.error("Erro no listener de chat do lead: ", error));

            document.getElementById('edit-lead-modal').style.display = 'flex';
        }
    }

    function addMessageToChat(msg, type, containerId) { /* ... código ... */ }
    function renderKanbanCards() { /* ... código ... */ }
    function renderLeadsTable() { /* ... código ... */ }
    function updateDashboard() { /* ... código ... */ }
    // ... resto das suas funções ...
});
