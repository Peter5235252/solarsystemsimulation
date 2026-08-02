import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from '@google/genai';
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to run other providers (ChatGPT, Claude, Mistral, Grok)
  const callOtherProvider = async (provider: string, apiKey: string, systemInstruction: string, messages: any[]) => {
    let url = "";
    let headers: any = { "Content-Type": "application/json" };
    let body: any = {};
    let isAnthropic = false;

    // Convert to OpenAI standard messages and collapse same-role messages
    let standardMessages: any[] = [];
    for (const m of messages) {
      const role = m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user';
      const content = m.content || m.parts?.[0]?.text || '';
      if (standardMessages.length > 0 && standardMessages[standardMessages.length - 1].role === role) {
        standardMessages[standardMessages.length - 1].content += '\n\n' + content;
      } else {
        standardMessages.push({ role, content });
      }
    }

    if (provider === "ChatGPT") {
      url = "https://api.openai.com/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey}`;
      body = {
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemInstruction }, ...standardMessages]
      };
    } else if (provider === "Claude") {
      url = "https://api.anthropic.com/v1/messages";
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
      isAnthropic = true;
      
      let filteredMessages = standardMessages.filter(m => m.role !== 'system');
      if (filteredMessages.length > 0 && filteredMessages[0].role === 'assistant') {
          filteredMessages.unshift({ role: 'user', content: 'Hello' });
      }
      
      body = {
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        system: systemInstruction,
        messages: filteredMessages.length > 0 ? filteredMessages : [{ role: 'user', content: 'Hello' }]
      };
    } else if (provider === "Mistral") {
      url = "https://api.mistral.ai/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey}`;
      body = {
        model: "mistral-small-latest",
        messages: [{ role: "system", content: systemInstruction }, ...standardMessages]
      };
    } else if (provider === "Grok") {
      url = "https://api.x.ai/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey}`;
      body = {
        model: "grok-beta",
        messages: [{ role: "system", content: systemInstruction }, ...standardMessages]
      };
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Provider ${provider} returned ${res.status}: ${errorText}`);
    }
    const data = await res.json();
    if (isAnthropic) {
      return data.content?.[0]?.text || "";
    }
    return data.choices?.[0]?.message?.content || "";
  };

  // AI Setup - Helper function to instantiate GoogleGenAI
  const getAiClient = (key?: string) => {
    const apiKey = (key && key.trim().length > 0) ? key.trim() : (process.env.GEMINI_API_KEY || "");
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // Unified Gemini caller with fallback
  const callGeminiProvider = async (apiKey: string | undefined, systemInstruction: string, promptOrMessages: any) => {
    let client = getAiClient(apiKey);
    if (!client) {
      throw new Error("No valid Gemini API key available.");
    }

    let contents = promptOrMessages;
    if (Array.isArray(promptOrMessages)) {
      let formattedContents: any[] = [];
      for (const m of promptOrMessages) {
        const role = m.role === 'assistant' || m.role === 'model' ? 'model' : 'user';
        if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === role) {
          formattedContents[formattedContents.length - 1].parts[0].text += '\n\n' + (m.content || '');
        } else {
          formattedContents.push({
            role,
            parts: [{ text: m.content || ' ' }]
          });
        }
      }
      if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === 'model') {
        formattedContents.push({ role: 'user', parts: [{ text: 'Continue.' }] });
      }
      contents = formattedContents.length > 0 ? formattedContents : "Hello";
    }

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: { systemInstruction }
      });
      return response.text || "";
    } catch (err) {
      if (apiKey && process.env.GEMINI_API_KEY && apiKey.trim() !== process.env.GEMINI_API_KEY.trim()) {
        const fallbackClient = getAiClient(undefined);
        if (fallbackClient) {
          console.warn("Custom key failed on Gemini, falling back to server default GEMINI_API_KEY");
          const response = await fallbackClient.models.generateContent({
            model: "gemini-3.6-flash",
            contents,
            config: { systemInstruction }
          });
          return response.text || "";
        }
      }
      throw err;
    }
  };

  // API Routes
  app.post("/api/ai/description", async (req, res) => {
    const { prompt, systemInstruction, apiKey, provider, aiModelName } = req.body;
    const targetProvider = provider || aiModelName || "Gemini";
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const sysInst = systemInstruction || "You are a concise stellar guide.";

    try {
      let text = "";
      let usedProvider = targetProvider;

      if (targetProvider !== "Gemini" && apiKey && apiKey.trim().length > 0) {
        try {
          text = await callOtherProvider(targetProvider, apiKey.trim(), sysInst, [{ role: 'user', content: prompt }]);
        } catch (providerError: any) {
          console.warn(`Provider ${targetProvider} failed (${providerError?.message}), attempting Gemini fallback...`);
          text = await callGeminiProvider(undefined, sysInst, prompt);
          usedProvider = `${targetProvider} (Gemini fallback)`;
        }
      } else if (targetProvider !== "Gemini" && (!apiKey || apiKey.trim().length === 0)) {
        text = await callGeminiProvider(undefined, sysInst, prompt);
        usedProvider = `${targetProvider} (Gemini engine)`;
      } else {
        text = await callGeminiProvider(apiKey, sysInst, prompt);
      }

      text = text.replace(/[*#`]/g, '').trim();
      return res.json({ text, provider: usedProvider });
    } catch (error: any) {
      console.error(`${targetProvider} Error on server:`, error?.message || error);
      return res.status(500).json({ error: `${targetProvider} failed`, detail: error?.message || String(error) });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    const { messages, systemInstruction, apiKey, provider, aiModelName } = req.body;
    const targetProvider = provider || aiModelName || "Gemini";
    
    const sysInst = systemInstruction || "You are the Stellar Historian.";

    try {
      let text = "";
      let usedProvider = targetProvider;

      if (targetProvider !== "Gemini" && apiKey && apiKey.trim().length > 0) {
        try {
          text = await callOtherProvider(targetProvider, apiKey.trim(), sysInst, messages || []);
        } catch (providerError: any) {
          console.warn(`Chat provider ${targetProvider} failed (${providerError?.message}), attempting Gemini fallback...`);
          text = await callGeminiProvider(undefined, sysInst, messages || []);
          usedProvider = `${targetProvider} (Gemini fallback)`;
        }
      } else if (targetProvider !== "Gemini" && (!apiKey || apiKey.trim().length === 0)) {
        text = await callGeminiProvider(undefined, sysInst, messages || []);
        usedProvider = `${targetProvider} (Gemini engine)`;
      } else {
        text = await callGeminiProvider(apiKey, sysInst, messages || []);
      }

      text = text.trim();
      return res.json({ text, provider: usedProvider });
    } catch (error: any) {
      console.error(`${targetProvider} Chat Error on server:`, error?.message || error);
      return res.status(500).json({ error: `${targetProvider} failed`, detail: error?.message || String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
