// ... todo o seu código original do CRM e Financeiro ...

// ---------------- CHATBOT GEMINI -----------------
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

async function sendMessageToGemini(message) {
    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=API_KEY", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, não consegui responder.";
    } catch (error) {
        return "Erro ao conectar com a IA.";
    }
}

function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.classList.add("chat-message", sender);
    msg.textContent = text;
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

if (chatForm) {
    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value;
        addMessage(userMessage, "user");
        chatInput.value = "";

        const botReply = await sendMessageToGemini(userMessage);
        addMessage(botReply, "bot");
    });
}
