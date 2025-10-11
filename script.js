document.addEventListener('DOMContentLoaded', () => {
    const BOT_BACKEND_URL = 'https://superapp-whatsapp-bot.onrender.com';
    let leads = [], caixa = [], estoque = [], chatHistory = [], mentoriaNotes = {};
    let statusChart, db, unsubscribeChat, unsubscribeLeads;
    let currentLeadId = null, draggedItem = null, currentProductId = null;

    function applySettings(settings = {}) { /* ... */ }
    function addMessageToChat(msg, type) { /* ... */ }
    function getMentoriaNotes() { /* ... */ }
    function loadMentoriaNotes() { /* ... */ }
    function renderKanbanCards() { /* ... */ }
    function renderLeadsTable() { /* ... */ }
    function updateDashboard() { /* ... */ }
    function renderCaixaTable() { /* ... */ }
    function updateCaixa() { /* ... */ }
    function renderEstoqueTable() { /* ... */ }
    function renderCustosList(produto) { /* ... */ }
    function renderChatHistory() { /* ... */ }
    function renderMentoria(mentoriaData) { /* ... */ }
    function updateAllUI() { /* ... */ }
    async function loadAllUserData(userId) { /* ... */ }
    async function saveAllUserData(userId, showConfirmation = false) { /* ... */ }
    function setupEventListeners(userId) { /* ... */ }
    function initBotConnection(userId) { /* ... */ }
    function updateBotButton(isBotActive) { /* ... */ }
    function openLeadModal(leadId, userId) { /* ... */ }
    function checkTheme() { /* ... */ }
    function toggleTheme() { /* ... */ }
    async function loadMentoriaContent() { /* ... */ }
    async function handleChatbotSubmit(userId) { /* ... */ }

    async function main() {
        await loadMentoriaContent();
        firebase.auth().onAuthStateChanged(async user => {
            if (user && !document.body.hasAttribute('data-initialized')) {
                document.body.setAttribute('data-initialized', 'true');
                db = firebase.firestore();
                
                // Listener em tempo real para os leads
                unsubscribeLeads = db.collection('userData').doc(user.uid).onSnapshot(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        const oldLeadsCount = leads.length;
                        leads = data.leads || [];
                        if (leads.length > oldLeadsCount) {
                            updateNotificationBadge();
                        }
                        updateAllUI(); // Atualiza a UI sempre que os dados mudam
                    }
                });

                await loadAllUserData(user.uid);
                setupEventListeners(user.uid);
            }
        });
        checkTheme();
    }
    
    main(); 
});
