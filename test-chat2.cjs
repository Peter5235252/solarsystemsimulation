const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.generateContent({
  model: 'gemini-3.6-flash',
  contents: [
    { role: 'user', parts: [{ text: 'Hello' }] },
    { role: 'user', parts: [{ text: 'How are you?' }] }
  ],
  config: {
    systemInstruction: 'You are a test.'
  }
}).then(console.log).catch(console.error);
