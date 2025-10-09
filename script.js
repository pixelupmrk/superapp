document.addEventListener('DOMContentLoaded', () => {
    // ... (toda a sua `mentoriaData` e as variáveis globais continuam aqui, sem alteração) ...
    let leads = [], caixa = [], estoque = [], chatHistory = [];
    let nextLeadId = 0, currentLeadId = null, draggedItem = null, currentProductId = null;
    let statusChart;
    let db;
    let unsubscribeLeadChat; // Variável para parar de ouvir o chat quando o modal fechar

    const BOT_PROMPT_TEMPLATE = `...`; // Seu template de prompt continua aqui

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

    // ... (funções loadAllUserData, saveUserData, updateAllUI, etc. continuam aqui) ...
    
    // FUNÇÃO openEditModal - TOTALMENTE REFEITA
    async function openEditModal(leadId) {
        currentLeadId = leadId;
        const userId = firebase.auth().currentUser.uid;
        const lead = leads.find(l => l.id === leadId);
        
        if (lead) {
            // Preenche o formulário de informações do lead
            document.getElementById('edit-lead-name').value = lead.nome;
            document.getElementById('edit-lead-email').value = lead.email;
            document.getElementById('edit-lead-whatsapp').value = lead.whatsapp;
            document.getElementById('edit-lead-status').value = lead.status;
            document.getElementById('edit-lead-origem').value = lead.origem;
            document.getElementById('edit-lead-qualification').value = lead.qualificacao;
            document.getElementById('edit-lead-notes').value = lead.notas;
            document.getElementById('lead-chat-title').textContent = `Conversa com ${lead.nome}`;
            
            // Mostra o modal
            document.getElementById('edit-lead-modal').style.display = 'flex';
            
            // Limpa o histórico de chat anterior
            const chatHistoryDiv = document.getElementById('lead-chat-history');
            chatHistoryDiv.innerHTML = '<p>Carregando histórico...</p>';

            // Ouve as mensagens do chat em tempo real
            const messagesRef = db.collection('userData').doc(userId).collection('leadsMessages').doc(String(leadId)).collection('messages').orderBy('timestamp');
            
            // Cancela a inscrição anterior para evitar múltiplos listeners
            if (unsubscribeLeadChat) unsubscribeLeadChat();
            
            unsubscribeLeadChat = messagesRef.onSnapshot(snapshot => {
                chatHistoryDiv.innerHTML = ''; // Limpa antes de renderizar
                if (snapshot.empty) {
                    chatHistoryDiv.innerHTML = '<p>Nenhuma mensagem nesta conversa ainda.</p>';
                    return;
                }
                snapshot.forEach(doc => {
                    const msg = doc.data();
                    renderChatMessage(msg.sender, msg.text);
                });
                chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight; // Rola para a última mensagem
            });
        }
    }

    // NOVA FUNÇÃO para renderizar os balões de chat
    function renderChatMessage(sender, text) {
        const chatHistoryDiv = document.getElementById('lead-chat-history');
        const bubble = document.createElement('div');
        bubble.classList.add('msg-bubble');
        
        // Define a classe com base em quem enviou
        if (sender === 'user') {
            bubble.classList.add('msg-user');
        } else if (sender === 'operator') {
            bubble.classList.add('msg-operator');
        } else { // 'bot'
            bubble.classList.add('msg-bot');
        }
        
        bubble.textContent = text;
        chatHistoryDiv.appendChild(bubble);
    }
    

    function setupEventListeners(userId) {
        // ... (Todos os seus event listeners antigos continuam aqui) ...

        // Listener para fechar o modal e parar de ouvir o chat
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById(btn.dataset.target).style.display = 'none';
                // Se estamos fechando o modal do chat, cancela a inscrição
                if (btn.dataset.target === 'edit-lead-modal' && unsubscribeLeadChat) {
                    unsubscribeLeadChat();
                    unsubscribeLeadChat = null;
                    console.log('Parou de ouvir o chat do lead.');
                }
            });
        });

        // NOVO: Listener para o formulário de envio de mensagem do chat
        document.getElementById('lead-chat-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('lead-chat-input');
            const messageText = input.value.trim();
            const lead = leads.find(l => l.id === currentLeadId);
            const userDoc = await db.collection('userData').doc(userId).get();
            const botUrl = userDoc.exists ? userDoc.data().botUrl : null;

            if (!messageText || !lead || !botUrl) {
                console.error("Não é possível enviar a mensagem. Faltam dados.");
                return;
            }

            // Desabilita o formulário enquanto envia
            input.disabled = true;
            e.target.querySelector('button').disabled = true;

            try {
                // Envia a mensagem para o backend do bot na Render
                const response = await fetch(`${botUrl}/send-message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        number: lead.whatsapp,
                        message: messageText,
                        leadId: String(currentLeadId)
                    })
                });

                if (!response.ok) {
                    throw new Error('Falha ao enviar mensagem pelo servidor do bot.');
                }
                
                // Limpa o input se o envio for bem-sucedido
                input.value = '';

            } catch (error) {
                console.error("Erro ao enviar mensagem:", error);
                alert("Não foi possível enviar a mensagem. Verifique se o bot está conectado.");
            } finally {
                // Reabilita o formulário
                input.disabled = false;
                e.target.querySelector('button').disabled = false;
                input.focus();
            }
        });
    }

    // ... (o resto do seu script.js continua aqui) ...
});
