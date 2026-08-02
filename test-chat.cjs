const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.generateContent({
  model: 'gemini-3.6-flash',
  contents: [{ role: 'model', parts: [{ text: 'Hello' }] }],
  config: {
    systemInstruction: 'You are a test.'
  }
}).then(console.log).catch(console.error);
