const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Pega a chave E o nome do modelo das variáveis de ambiente da Vercel
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL_NAME;
  const { prompt } = req.body;

  if (!apiKey || !modelName) {
    console.error("ERRO: Uma ou mais variáveis de ambiente (GEMINI_API_KEY, GEMINI_MODEL_NAME) não foram encontradas na Vercel.");
    return res.status(500).json({ error: 'Configuração de API ou modelo incompleta no servidor.' });
  }

  if (!prompt) {
    return res.status(400).json({ error: 'O "prompt" (pergunta) é necessário.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // CORREÇÃO FINAL: Usa o nome do modelo que VOCÊ configurou na Vercel.
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return res.status(200).json({ text });

  } catch (error) {
    console.error('Erro ao chamar a API Gemini:', error);
    return res.status(500).json({ error: 'Falha ao se comunicar com a IA.', details: error.message });
  }
};
