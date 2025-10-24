// functions/index.js - VERSÃO FINAL E CORRIGIDA
const {onCall} = require("firebase-functions/v2/https");
const {onRequest} = require("firebase-functions/v2/https");
// Renomeado para evitar o erro "functions.runWith is not a function" durante o deploy
const configFunctions = require("firebase-functions"); 
const admin = require("firebase-admin");
const {CloudTasksClient} = require("@google-cloud/tasks");
const {GoogleGenerativeAI} = require("@google/generative-ai");

admin.initializeApp();
const db = admin.firestore();

let genAI;
try {
  // Usa o nome renomeado para acessar a configuração
  genAI = new GoogleGenerativeAI(configFunctions.config().gemini.key);
} catch (e) {
  console.error("Não foi possível inicializar o Gemini AI. Verifique se a chave de API 'gemini.key' está configurada.", e);
}

// --- FUNÇÃO 1: Inicia o chat para um LEAD ESPECÍFICO ---
exports.startAiChat = onCall(async (request) => {
  if (!request.auth) {
    // Usa o nome renomeado para HttpsError
    throw new configFunctions.https.HttpsError("unauthenticated", "Você precisa estar logado.");
  }
  const userId = request.auth.uid;
  const userInput = request.data.prompt;
  const leadId = request.data.leadId; // ALTERAÇÃO AQUI: Recebemos o ID do Lead

  if (!userInput || !leadId) {
    // Usa o nome renomeado para HttpsError
    throw new configFunctions.https.HttpsError("invalid-argument", "A mensagem e o ID do lead são obrigatórios.");
  }
  
  // ALTERAÇÃO AQUI: O caminho agora aponta para a subcoleção de chat DENTRO do lead
  const chatRef = db.collection("userData").doc(userId).collection("leads").doc(String(leadId)).collection("chatHistory");

  await chatRef.add({
    role: "user",
    parts: [{text: userInput}],
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  const project = process.env.GCLOUD_PROJECT;
  const location = "us-central1";
  const queue = "process-ai-chat";
  const tasksClient = new CloudTasksClient();
  const queuePath = tasksClient.queuePath(project, location, queue);
  const url = `https://${location}-${project}.cloudfunctions.net/executeAiTask`;
  const payload = {userId, prompt: userInput, leadId}; // ALTERAÇÃO AQUI: Enviamos o leadId para a próxima função

  const task = {
    httpRequest: {
      httpMethod: "POST",
      url,
      body: Buffer.from(JSON.stringify(payload)).toString("base64"),
      headers: {"Content-Type": "application/json"},
    },
  };

  await tasksClient.createTask({parent: queuePath, task});
  return {status: "success", message: "Mensagem adicionada à fila."};
});


// --- FUNÇÃO 2: Executa a IA para um LEAD ESPECÍFICO ---
exports.executeAiTask = onRequest({memory: "1GiB", timeoutSeconds: 120}, async (req, res) => {
  const {userId, prompt, leadId} = req.body; // ALTERAÇÃO AQUI: Recebemos o leadId

  if (!genAI) {
    console.error("O cliente Gemini AI não foi inicializado.");
    res.status(500).send("Erro de configuração interna do servidor.");
    return;
  }
  
  // O caminho agora aponta para a subcoleção de chat DENTRO do lead
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

    await chatRef.add({
      role: "model",
      parts: [{text: geminiTextResponse}],
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).send("Tarefa concluída com sucesso.");
  } catch (error) {
    console.error("Erro ao executar a tarefa de IA:", error);
    try {
      await chatRef.add({
        role: "model",
        parts: [{text: "Desculpe, ocorreu um erro ao processar sua solicitação."}],
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (dbError) {
      console.error("Erro ao salvar mensagem de erro no Firestore:", dbError);
    }
    res.status(500).send("Erro na execução da tarefa.");
  }
});
