// functions/index.js - VERSÃO COM FUNÇÃO AGENDADA (SCHEDULER)
const {onCall} = require("firebase-functions/v2/https");
const {onRequest} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const configFunctions = require("firebase-functions"); 
const admin = require("firebase-admin");
const {CloudTasksClient} = require("@google-cloud/tasks");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const cors = require('cors')({ origin: true }); 
const axios = require('axios'); // Para fazer requisição HTTP no Bot do Render

admin.initializeApp();
const db = admin.firestore();

let genAI;
try {
  genAI = new GoogleGenerativeAI(configFunctions.config().gemini.key);
} catch (e) {
  console.error("Não foi possível inicializar o Gemini AI. Verifique se a chave de API 'gemini.key' está configurada.", e);
}

// URL BASE DO BOT NO RENDER
const WHATSAPP_BOT_URL = 'https://superapp-whatsapp-bot.onrender.com';

// --- FUNÇÃO 1: Inicia o chat para um LEAD ESPECÍFICO (Callable Function) ---
exports.startAiChat = onCall(async (request) => {
  if (!request.auth) {
    throw new configFunctions.https.HttpsError("unauthenticated", "Você precisa estar logado.");
  }
  const userId = request.auth.uid;
  const userInput = request.data.prompt;
  const leadId = request.data.leadId; 

  if (!userInput || !leadId) {
    throw new configFunctions.https.HttpsError("invalid-argument", "A mensagem e o ID do lead são obrigatórios.");
  }
  
  const chatRef = db.collection("userData").doc(userId).collection("leads").doc(String(leadId)).collection("chatHistory");

  // 1. Salva a mensagem do usuário
  await chatRef.add({
    role: "user",
    parts: [{text: userInput}],
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 2. Enfileira a tarefa da IA
  const project = process.env.GCLOUD_PROJECT;
  const location = "us-central1";
  const queue = "process-ai-chat";
  const tasksClient = new CloudTasksClient();
  const queuePath = tasksClient.queuePath(project, location, queue);
  const url = `https://${location}-${project}.cloudfunctions.net/executeAiTask`;
  const payload = {userId, prompt: userInput, leadId}; 

  const task = {
    httpRequest: {
      httpMethod: "POST",
      url,
      body: Buffer.from(JSON.stringify(payload)).toString("base64"),
      headers: {
        "Content-Type": "application/json",
      },
    },
  };

  try {
      await tasksClient.createTask({parent: queuePath, task});
  } catch (error) {
      console.error("ERRO AO CRIAR TAREFA DO CLOUD TASKS:", error);
      throw new configFunctions.https.HttpsError("internal", "Falha ao enfileirar a tarefa de IA. Verifique as configurações do Cloud Tasks.");
  }

  return {status: "success", message: "Mensagem adicionada à fila."};
});


// --- FUNÇÃO 2: Executa a IA para um LEAD ESPECÍFICO (HTTP Endpoint) ---
exports.executeAiTask = onRequest({memory: "1GiB", timeoutSeconds: 120}, async (req, res) => {
    cors(req, res, async () => {
        const {userId, prompt, leadId} = req.body;

        if (!genAI) {
            console.error("O cliente Gemini AI não foi inicializado.");
            res.status(500).send("Erro de configuração interna do servidor (Gemini AI).");
            return;
        }
        
        const chatRef = db.collection("userData").doc(userId).collection("leads").doc(String(leadId)).collection("chatHistory");

        try {
            const historySnapshot = await chatRef.orderBy("timestamp", "desc").limit(20).get();
            
            const history = [];
            historySnapshot.forEach((doc) => {
                const data = doc.data();
                history.unshift(data);
            });

            const model = genAI.getGenerativeModel({model: "gemini-pro"});
            const chat = model.startChat({history});
            const result = await chat.sendMessage(prompt);
            const geminiTextResponse = result.response.text();

            // Salva a resposta da IA
            await chatRef.add({
                role: "model",
                parts: [{text: geminiTextResponse}],
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });

            res.status(200).send("Tarefa concluída com sucesso.");
        } catch (error) {
            console.error("Erro CRÍTICO ao executar a tarefa de IA:", error);
            try {
                await chatRef.add({
                    role: "model",
                    parts: [{text: "Desculpe, ocorreu um erro ao processar sua solicitação de IA. Tente novamente."}],
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                });
            } catch (dbError) {
                console.error("Erro ao salvar mensagem de erro no Firestore:", dbError);
            }
            res.status(500).send("Erro na execução da tarefa. (Verifique logs e regras do Firestore)");
        }
    });
});

// --- FUNÇÃO 3: ROBÔ AGENDADOR DE MENSAGENS (Executa a cada 1 minuto) ---
exports.scheduler = onSchedule("every 1 minutes", async (event) => {
    console.log("Iniciando verificação de agendamentos...");

    const now = new Date();
    // Obtém a data e hora formatadas para comparação (Ex: 2025-10-25 e 16:01)
    const scheduledDate = now.toISOString().split('T')[0];
    const scheduledTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Busca todos os Leads que têm uma agenda definida para o momento atual
    const usersSnapshot = await db.collection('userData').get();

    for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const leads = userData.leads || [];

        const leadsToSend = leads.filter(lead => 
            lead.scheduledDate === scheduledDate && 
            (lead.scheduledTime === scheduledTime || lead.scheduledTime === scheduledTime.substring(0, 5)) // Compara 16:01:00 ou 16:01
        );

        for (const lead of leadsToSend) {
            const messageType = lead.reminderType || 'Lembrete';
            const whatsappNumber = lead.whatsapp; 

            // Conteúdo da mensagem com base no tipo de lembrete
            let reminderMessage = `🤖 *Lembrete Automático (${messageType})*:\n\nOlá, ${lead.nome}! Eu sou o Super App. Este é um lembrete do nosso compromisso agendado para agora. Por favor, responda para confirmar!`;
            
            // 1. Envia a mensagem via Bot do Render
            try {
                const response = await axios.post(`${WHATSAPP_BOT_URL}/send`, {
                    to: whatsappNumber,
                    text: reminderMessage,
                    userId: userId 
                });

                if (response.status === 200) {
                    console.log(`[Scheduler] Sucesso: Lembrete enviado para ${lead.nome}.`);

                    // 2. SALVA A MENSAGEM DO LEMBRETE NO HISTÓRICO (Opcional, mas bom para histórico)
                    const chatRef = db.collection('userData').doc(userId).collection('leads').doc(String(lead.id)).collection('chatHistory');
                    await chatRef.add({
                        role: "model",
                        parts: [{text: reminderMessage}],
                        timestamp: admin.firestore.FieldValue.serverTimestamp(),
                        isReminder: true 
                    });
                    
                    // 3. LIMPA O AGENDAMENTO APÓS O ENVIO
                    // Recria o array de leads sem a agenda para este lead específico
                    const updatedLeads = leads.map(l => {
                        if (l.id === lead.id) {
                            const { scheduledDate, scheduledTime, reminderType, ...rest } = l;
                            return rest;
                        }
                        return l;
                    });
                    
                    await userDocRef.update({ leads: updatedLeads });

                } else {
                    console.error(`[Scheduler] Falha ao enviar para ${lead.nome}: Status ${response.status}`);
                }
            } catch (error) {
                console.error(`[Scheduler] Erro de rede/Bot para ${lead.nome}:`, error.message);
            }
        }
    }
    console.log("Verificação de agendamentos concluída.");
});
