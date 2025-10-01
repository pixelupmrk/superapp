const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const { prompt } = req.body;

  if (!apiKey) {
    console.error("ERRO: Variável de ambiente GEMINI_API_KEY não encontrada na Vercel.");
    return res.status(500).json({ error: 'Chave de API não configurada no servidor.' });
  }

  if (!prompt) {
    return res.status(400).json({ error: 'O "prompt" (pergunta) é necessário.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // CORREÇÃO FINAL: Usando o modelo 'gemini-pro' que é o padrão e mais estável para a versão da API.
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return res.status(200).json({ text });

  } catch (error) {
    console.error('Erro ao chamar a API Gemini:', error);
    return res.status(500).json({ error: 'Falha ao se comunicar com a IA.', details: error.message });
  }
};
