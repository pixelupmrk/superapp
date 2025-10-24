// functions/index.js - VERSÃO FINAL (CORRIGIDO PROBLEMA 'internal' e CORS)
const {onCall} = require("firebase-functions/v2/https");
const {onRequest} = require("firebase-functions/v2/https");
const configFunctions = require("firebase-functions"); 
const admin = require("firebase-admin");
const {CloudTasksClient} = require("@google-cloud/tasks");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const cors = require('cors')({ origin: true }); // Importa e configura o CORS

admin.initializeApp();
const db = admin.firestore();

let genAI;
try {
  genAI = new GoogleGenerativeAI(configFunctions.config().gemini.key);
} catch (e) {
  console.error("Não foi possível inicializar o Gemini AI. Verifique se a chave de API 'gemini.key' está configurada.", e);
}

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
  
  // O Front-end também precisa ter o lead com botActive=true para esta lógica
  // if (lead && !lead.botActive) {
  //     throw new configFunctions.https.HttpsError("unavailable", "O Bot está desativado para este lead.");
  // }
  
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
  // O endpoint deve usar o domínio correto. Usaremos a função de deploy 'executeAiTask'.
  const url = `https://${location}-${project}.cloudfunctions.net/executeAiTask`;
  const payload = {userId, prompt: userInput, leadId}; 

  const task = {
    httpRequest: {
      httpMethod: "POST",
      url,
      body: Buffer.from(JSON.stringify(payload)).toString("base64"),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${configFunctions.config().internal.token}` // Adicionado token interno de segurança
      },
    },
  };

  try {
      await tasksClient.createTask({parent: queuePath, task});
  } catch (error) {
      console.error("ERRO AO CRIAR TAREFA DO CLOUD TASKS:", error);
      // Se a tarefa falhar ao ser criada, avisa o Front-end
      throw new configFunctions.https.HttpsError("internal", "Falha ao enfileirar a tarefa de IA. Verifique as configurações do Cloud Tasks.");
  }

  return {status: "success", message: "Mensagem adicionada à fila."};
});


// --- FUNÇÃO 2: Executa a IA para um LEAD ESPECÍFICO (HTTP Endpoint) ---
// É CRÍTICO que esta função permita CORS e processamento correto
exports.executeAiTask = onRequest({memory: "1GiB", timeoutSeconds: 120}, async (req, res) => {
    // Aplica o middleware CORS
    cors(req, res, async () => {
        // Validação básica do cabeçalho de segurança (opcional, mas recomendado)
        // if (req.headers.authorization !== `Bearer ${configFunctions.config().internal.token}`) {
        //     res.status(401).send("Não Autorizado");
        //     return;
        // }
        
        const {userId, prompt, leadId} = req.body;

        if (!genAI) {
            console.error("O cliente Gemini AI não foi inicializado.");
            res.status(500).send("Erro de configuração interna do servidor (Gemini AI).");
            return;
        }
        
        const chatRef = db.collection("userData").doc(userId).collection("leads").doc(String(leadId)).collection("chatHistory");

        try {
            // 1. Recupera o histórico
            const historySnapshot = await chatRef.orderBy("timestamp", "desc").limit(20).get();
            
            const history = [];
            historySnapshot.forEach((doc) => {
                const data = doc.data();
                history.unshift(data);
            });

            // 2. Chama o modelo Gemini
            const model = genAI.getGenerativeModel({model: "gemini-pro"});
            const chat = model.startChat({history});
            const result = await chat.sendMessage(prompt);
            const geminiTextResponse = result.response.text();

            // 3. Salva a resposta da IA
            await chatRef.add({
                role: "model",
                parts: [{text: geminiTextResponse}],
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });

            res.status(200).send("Tarefa concluída com sucesso.");
        } catch (error) {
            console.error("Erro CRÍTICO ao executar a tarefa de IA:", error);
            try {
                // Tenta salvar uma mensagem de erro no histórico
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
