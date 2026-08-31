import express from "express";
import path from "path";
import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from '@google/genai';
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NOTES_DIR = path.join(process.cwd(), 'data');
const NOTES_FILE = path.join(NOTES_DIR, 'cloud_notes.json');

// Ensure data directory exists
if (!existsSync(NOTES_DIR)) {
  try {
    mkdirSync(NOTES_DIR, { recursive: true });
  } catch (e) {
    console.warn("Could not create data dir:", e);
  }
}

export interface UniversalSource {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  sourceIndex: number;
}

// Universal Web Search & Astrophysics Retrieval Aggregator (August 2026)
async function performUniversalWebSearch(query: string): Promise<UniversalSource[]> {
  const cleanQuery = query
    .replace(/@\s*(web\s*search|search\s*the\s*web|browse\s*the\s*web|web|search|browse):?/gi, '')
    .trim();

  if (!cleanQuery) return [];

  const results: UniversalSource[] = [];
  const seenUrls = new Set<string>();

  const addResult = (title: string, url: string, snippet: string) => {
    if (!url || !title || seenUrls.has(url) || results.length >= 6) return;
    try {
      const parsed = new URL(url);
      const domain = parsed.hostname.replace(/^www\./, '');
      const cleanSnippet = snippet
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanSnippet.length < 20) return;

      seenUrls.add(url);
      results.push({
        title: title.trim(),
        url: url.trim(),
        snippet: cleanSnippet.slice(0, 320),
        domain,
        sourceIndex: results.length + 1
      });
    } catch {
      // ignore invalid URLs
    }
  };

  // Parallel Search: Wikipedia API, DuckDuckGo Instant Answers & HTML Lite, and arXiv
  const tasks: Promise<void>[] = [];

  // 1. Wikipedia Search & Summary
  tasks.push((async () => {
    try {
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&format=json&utf8=1&srlimit=3&origin=*`;
      const res = await fetch(wikiUrl, {
        headers: { 'User-Agent': 'StellarHistorian/2026.8 (astrophysics-education-app)' }
      });
      if (res.ok) {
        const data = await res.json();
        const searchHits = data.query?.search || [];
        for (const hit of searchHits) {
          const pageTitle = hit.title;
          const snippet = hit.snippet;
          const articleUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/\s+/g, '_'))}`;
          addResult(`${pageTitle} — Wikipedia`, articleUrl, snippet);
        }
      }
    } catch (e) {
      // fail silently
    }
  })());

  // 2. DuckDuckGo Instant Answer API
  tasks.push((async () => {
    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`;
      const res = await fetch(ddgUrl, {
        headers: { 'User-Agent': 'StellarHistorian/2026.8' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.AbstractText && data.AbstractURL) {
          addResult(data.Heading || cleanQuery, data.AbstractURL, data.AbstractText);
        }
        if (Array.isArray(data.RelatedTopics)) {
          for (const topic of data.RelatedTopics.slice(0, 3)) {
            if (topic.Text && topic.FirstURL) {
              const title = topic.Text.split(' - ')[0] || topic.Text.slice(0, 60);
              addResult(title, topic.FirstURL, topic.Text);
            }
          }
        }
      }
    } catch (e) {
      // fail silently
    }
  })());

  // 3. DuckDuckGo HTML Lite parsing
  tasks.push((async () => {
    try {
      const htmlUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanQuery)}`;
      const res = await fetch(htmlUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      if (res.ok) {
        const html = await res.text();
        // Simple regex-based SERP extraction
        const resultRegex = /<a[^>]+class="result__url"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        while ((match = resultRegex.exec(html)) !== null && results.length < 5) {
          let rawHref = match[1];
          // DDG redirects
          if (rawHref.includes('uddg=')) {
            const matchUddg = rawHref.match(/uddg=([^&]+)/);
            if (matchUddg) rawHref = decodeURIComponent(matchUddg[1]);
          }
          const rawTitle = match[2].replace(/<[^>]*>/g, '').trim();
          const rawSnippet = match[3].replace(/<[^>]*>/g, '').trim();
          if (rawHref.startsWith('http') && rawTitle && rawSnippet) {
            addResult(rawTitle, rawHref, rawSnippet);
          }
        }
      }
    } catch (e) {
      // fail silently
    }
  })());

  // 4. NASA ADS / arXiv Space Science fallback for deep queries
  tasks.push((async () => {
    try {
      const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(cleanQuery)}&start=0&max_results=2`;
      const res = await fetch(arxivUrl);
      if (res.ok) {
        const xml = await res.text();
        const entries = xml.split('<entry>');
        for (let i = 1; i < entries.length && results.length < 5; i++) {
          const entry = entries[i];
          const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
          const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
          const idMatch = entry.match(/<id>([\s\S]*?)<\/id>/);
          if (titleMatch && summaryMatch && idMatch) {
            const title = titleMatch[1].replace(/\n/g, ' ').trim();
            const summary = summaryMatch[1].replace(/\n/g, ' ').trim();
            const url = idMatch[1].trim();
            addResult(`[arXiv] ${title}`, url, summary);
          }
        }
      }
    } catch (e) {
      // fail silently
    }
  })());

  await Promise.allSettled(tasks);

  // Ensure 1-indexed sequential source indices
  return results.map((r, idx) => ({ ...r, sourceIndex: idx + 1 }));
}

// Detect if a prompt explicitly or implicitly triggers web search
function checkWebSearchTrigger(text: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase().trim();
  return (
    t.includes('@web search') ||
    t.includes('@web') ||
    t.includes('@search the web') ||
    t.includes('@search') ||
    t.includes('@browse the web') ||
    t.includes('@browse') ||
    t.startsWith('/search') ||
    t.startsWith('/web')
  );
}

// Clean @mentions from prompt for clean LLM understanding
function stripWebSearchMentions(text: string): string {
  if (!text) return text;
  return text
    .replace(/@\s*(web\s*search|search\s*the\s*web|browse\s*the\s*web|web|search|browse):?/gi, '')
    .trim();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper to run other providers (ChatGPT GPT-5.6, Claude 5, Mistral, Grok 4.6)
  const callOtherProvider = async (provider: string, apiKey: string, systemInstruction: string, messages: any[], searchSources: UniversalSource[] = []) => {
    let url = "";
    let headers: any = { "Content-Type": "application/json" };
    let body: any = {};
    let isAnthropic = false;

    const isOverviewRequest = Boolean(systemInstruction && /concise stellar guide|static celestial overview/i.test(systemInstruction));

    const FACTUALITY_PROMPT = `\n\n[STRICT FACTUALITY & WEB GROUNDING DIRECTIVE (AUGUST 2026)]
1. ALWAYS RELY ON VERIFIED FACTS: You MUST strictly base your responses on verified real-world scientific data, published astrophysics literature, and real-time live web findings. Never guess, hallucinate, or state speculative assertions as established facts.
2. MANDATORY INLINE CITATIONS: Whenever stating specific factual claims, numerical parameters, dates, or mission outcomes supported by retrieved search results, YOU MUST CITE THEM INLINE using bracketed numbers like [1], [2], etc., corresponding exactly to the source indices.
3. EXPLICIT UNCERTAINTY: If web search findings or domain facts are insufficient to give a conclusive answer, state the uncertainty explicitly instead of fabricating an answer.`;

    const SIMULATOR_CONTROL_PROMPT = `\n\n[SIMULATOR CONTROL & INTERACTIVE APPROVAL INTEGRATION - CHAT ONLY]
- You have direct real-time control over the solar system simulation engine via ACTION_TRIGGER JSON payloads, but ONLY when responding in the Stellar Historian chat interface.
- Whenever you suggest, discuss, recommend, or perform a simulation action (e.g. focusing on a planet, changing speed, toggling orbits/labels/spacecraft/asteroids, opening settings/modals, or pausing) IN CHAT, ALWAYS APPEND THE RELEVANT ACTION_TRIGGER PAYLOAD at the very end of your response.
- DO NOT ask the user for confirmation in plain text without including the ACTION_TRIGGER payload. Our application UI automatically catches your ACTION_TRIGGER payload and presents an interactive Approval Prompt UI ([Approve] / [Reject]) before executing it on the 3D canvas.`;

    const OVERVIEW_NO_ACTION_PROMPT = `\n\n[OVERVIEW MODE - NO SIMULATOR CONTROL]
- This is a static celestial overview triggered by clicking a body on the canvas. You MUST NOT output ACTION_TRIGGER, you MUST NOT control the simulator, and you MUST NOT suggest actions. Only the Stellar Historian chat interface may use ACTION_TRIGGER.`;

    const MANDATORY_FACTUALITY_PROMPT = FACTUALITY_PROMPT + (isOverviewRequest ? OVERVIEW_NO_ACTION_PROMPT : SIMULATOR_CONTROL_PROMPT);

    let ragContext = MANDATORY_FACTUALITY_PROMPT;
    if (searchSources.length > 0) {
      ragContext += `\n\n[REAL-TIME LIVE WEB RETRIEVAL CONTEXT]
The user triggered Web Search. The following verified web sources were retrieved in real time:
${searchSources.map(s => `[${s.sourceIndex}] "${s.title}" (${s.domain})\nURL: ${s.url}\nExcerpt: ${s.snippet}`).join('\n\n')}

INSTRUCTIONS:
Synthesize your response using these verified live search findings alongside core physics/astronomy principles. Cite references inline using [1], [2], etc.`;
    }

    const NO_EMOJI_INSTRUCTION = "\n\nCRITICAL INSTRUCTION: You MUST strictly NOT use ANY emojis or emoticons in your response under any circumstances. Emojis are strictly prohibited.";
    const validSystemPrompt = ((systemInstruction && systemInstruction.trim().length > 0) 
      ? systemInstruction.trim() 
      : "You are the Stellar Historian.") + NO_EMOJI_INSTRUCTION + ragContext;

    // Convert to standard messages and strictly sanitize empty contents
    let standardMessages: { role: 'user' | 'assistant'; content: string }[] = [];
    if (Array.isArray(messages)) {
      for (const m of messages) {
        if (!m) continue;
        const role = (m.role === 'model' || m.role === 'assistant') ? 'assistant' : 'user';
        let text = '';
        if (typeof m.content === 'string') {
          text = m.content;
        } else if (Array.isArray(m.parts)) {
          text = m.parts.map((p: any) => p?.text || '').join('\n');
        } else if (m.text) {
          text = String(m.text);
        }
        text = stripWebSearchMentions(text);
        
        // Ensure content is non-empty so providers like Mistral don't reject assistant messages
        if (!text) {
          if (role === 'assistant') {
            text = 'Understood.';
          } else {
            continue; // skip blank user messages
          }
        }

        if (standardMessages.length > 0 && standardMessages[standardMessages.length - 1].role === role) {
          standardMessages[standardMessages.length - 1].content += '\n\n' + text;
        } else {
          standardMessages.push({ role, content: text });
        }
      }
    }

    if (standardMessages.length === 0) {
      standardMessages.push({ role: 'user', content: 'Hello' });
    } else if (standardMessages[0].role === 'assistant') {
      standardMessages.unshift({ role: 'user', content: 'Hello' });
    }

    if (standardMessages[standardMessages.length - 1].role === 'assistant') {
      standardMessages.push({ role: 'user', content: 'Please continue.' });
    }

    if (provider === "ChatGPT" || provider === "OpenAI") {
      url = "https://api.openai.com/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey}`;
      body = {
        model: "gpt-5.6-sol", // 2026 Frontier Flagship with fallback to gpt-4o-mini
        messages: [{ role: "system", content: validSystemPrompt }, ...standardMessages]
      };
    } else if (provider === "Claude" || provider === "Anthropic") {
      url = "https://api.anthropic.com/v1/messages";
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
      isAnthropic = true;
      
      let filteredMessages = [...standardMessages];
      if (filteredMessages.length > 0 && filteredMessages[0].role === 'assistant') {
          filteredMessages.unshift({ role: 'user', content: 'Hello' });
      }
      
      body = {
        model: "claude-sonnet-5", // 2026 Production Agent model with fallback to claude-3-5-haiku
        max_tokens: 2048,
        system: validSystemPrompt,
        messages: filteredMessages.length > 0 ? filteredMessages : [{ role: 'user', content: 'Hello' }]
      };
    } else if (provider === "Mistral") {
      url = "https://api.mistral.ai/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey}`;
      body = {
        model: "mistral-small-latest",
        messages: [{ role: "system", content: validSystemPrompt }, ...standardMessages]
      };
    } else if (provider === "Grok" || provider === "xAI") {
      url = "https://api.x.ai/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey}`;
      body = {
        model: "grok-4.6",
        messages: [{ role: "system", content: validSystemPrompt }, ...standardMessages]
      };
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    try {
      let res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) {
        // Fallback to secondary model if primary tier is restricted for specific keys
        if (provider === "ChatGPT" || provider === "OpenAI") {
          body.model = "gpt-4o-mini";
          res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
        } else if (provider === "Claude" || provider === "Anthropic") {
          body.model = "claude-3-5-haiku-20241022";
          res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
        } else if (provider === "Mistral") {
          body.model = "open-mistral-7b";
          res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
        } else if (provider === "Grok" || provider === "xAI") {
          body.model = "grok-beta";
          res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
        }
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Provider ${provider} returned ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      if (isAnthropic) {
        return data.content?.[0]?.text || "";
      }
      return data.choices?.[0]?.message?.content || "";
    } catch (err: any) {
      throw err;
    }
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

  // Unified Gemini caller with universal search RAG & Google Grounding
  const callGeminiProvider = async (
    apiKey: string | undefined, 
    systemInstruction: string, 
    promptOrMessages: any,
    searchSources: UniversalSource[] = []
  ) => {
    let client = getAiClient(apiKey);
    if (!client) {
      throw new Error("No valid Gemini API key available.");
    }

    const isOverviewRequest = Boolean(systemInstruction && /concise stellar guide|static celestial overview/i.test(systemInstruction));

    const FACTUALITY_PROMPT = `\n\n[STRICT FACTUALITY & WEB GROUNDING DIRECTIVE (AUGUST 2026)]
1. ALWAYS RELY ON VERIFIED FACTS: You MUST strictly base your responses on verified real-world scientific data, published astrophysics literature, and real-time live web findings. Never guess, hallucinate, or state speculative assertions as established facts.
2. MANDATORY INLINE CITATIONS: Whenever stating specific factual claims, numerical parameters, dates, or mission outcomes supported by retrieved search results, YOU MUST CITE THEM INLINE using bracketed numbers like [1], [2], etc., corresponding exactly to the source indices.
3. EXPLICIT UNCERTAINTY: If web search findings or domain facts are insufficient to give a conclusive answer, state the uncertainty explicitly instead of fabricating an answer.`;

    const SIMULATOR_CONTROL_PROMPT = `\n\n[SIMULATOR CONTROL & INTERACTIVE APPROVAL INTEGRATION - CHAT ONLY]
- You have direct real-time control over the solar system simulation engine via ACTION_TRIGGER JSON payloads, but ONLY when responding in the Stellar Historian chat interface.
- Whenever you suggest, discuss, recommend, or perform a simulation action (e.g. focusing on a planet, changing speed, toggling orbits/labels/spacecraft/asteroids, opening settings/modals, or pausing) IN CHAT, ALWAYS APPEND THE RELEVANT ACTION_TRIGGER PAYLOAD at the very end of your response.
- DO NOT ask the user for confirmation in plain text without including the ACTION_TRIGGER payload. Our application UI automatically catches your ACTION_TRIGGER payload and presents an interactive Approval Prompt UI ([Approve] / [Reject]) before executing it on the 3D canvas.`;

    const OVERVIEW_NO_ACTION_PROMPT = `\n\n[OVERVIEW MODE - NO SIMULATOR CONTROL]
- This is a static celestial overview triggered by clicking a body on the canvas. You MUST NOT output ACTION_TRIGGER, you MUST NOT control the simulator, and you MUST NOT suggest actions. Only the Stellar Historian chat interface may use ACTION_TRIGGER.`;

    const MANDATORY_FACTUALITY_PROMPT = FACTUALITY_PROMPT + (isOverviewRequest ? OVERVIEW_NO_ACTION_PROMPT : SIMULATOR_CONTROL_PROMPT);

    let ragContext = MANDATORY_FACTUALITY_PROMPT;
    if (searchSources.length > 0) {
      ragContext += `\n\n[REAL-TIME LIVE WEB RETRIEVAL CONTEXT]
The user triggered Web Search. The following verified web sources were retrieved in real time:
${searchSources.map(s => `[${s.sourceIndex}] "${s.title}" (${s.domain})\nURL: ${s.url}\nExcerpt: ${s.snippet}`).join('\n\n')}

INSTRUCTIONS:
Synthesize your response using these verified live search findings alongside core physics/astronomy principles. Cite references inline using [1], [2], etc.`;
    }

    const NO_EMOJI_INSTRUCTION = "\n\nCRITICAL INSTRUCTION: You MUST strictly NOT use ANY emojis or emoticons in your response under any circumstances. Emojis are strictly prohibited.";
    const finalSystemInstruction = (systemInstruction || "You are the Stellar Historian.") + NO_EMOJI_INSTRUCTION + ragContext;

    let contents = promptOrMessages;
    if (Array.isArray(promptOrMessages)) {
      let formattedContents: any[] = [];
      for (const m of promptOrMessages) {
        const role = m.role === 'assistant' || m.role === 'model' ? 'model' : 'user';
        const cleanContent = stripWebSearchMentions(m.content || '');
        if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === role) {
          formattedContents[formattedContents.length - 1].parts[0].text += '\n\n' + cleanContent;
        } else {
          formattedContents.push({
            role,
            parts: [{ text: cleanContent || ' ' }]
          });
        }
      }
      if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === 'model') {
        formattedContents.push({ role: 'user', parts: [{ text: 'Continue.' }] });
      }
      contents = formattedContents.length > 0 ? formattedContents : "Hello";
    } else if (typeof promptOrMessages === 'string') {
      contents = stripWebSearchMentions(promptOrMessages);
    }

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: { 
          systemInstruction: finalSystemInstruction,
          // If web search is active and no pre-scraped sources exist, enable native Google Search
          tools: searchSources.length === 0 && checkWebSearchTrigger(JSON.stringify(promptOrMessages)) ? [{ googleSearch: {} }] : undefined
        }
      });
      return response.text || "";
    } catch (err) {
      if (apiKey && process.env.GEMINI_API_KEY && apiKey.trim() !== process.env.GEMINI_API_KEY.trim()) {
        const fallbackClient = getAiClient(undefined);
        if (fallbackClient) {
          console.warn("Custom key failed on Gemini, falling back to server default GEMINI_API_KEY");
          const response = await fallbackClient.models.generateContent({
            model: "gemini-3.7-flash",
            contents,
            config: { 
              systemInstruction: finalSystemInstruction
            }
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

      // Defense in depth: overview must never leak ACTION_TRIGGER (chat only)
      text = text.replace(/ACTION_TRIGGER\s*:?\s*\{[\s\S]*?\}/gi, '').replace(/```[\s\S]*?```/g, (m) => m.replace(/ACTION_TRIGGER[\s\S]*?}/gi, '')).replace(/[*#`]/g, '').trim();
      return res.json({ text, provider: usedProvider });
    } catch (error: any) {
      console.error(`${targetProvider} Error on server:`, error?.message || error);
      return res.status(500).json({ error: `${targetProvider} failed`, detail: error?.message || String(error) });
    }
  });

  // Real-time Chat with Universal Web Search RAG across all LLMs
  app.post("/api/ai/chat", async (req, res) => {
    const { messages, systemInstruction, apiKey, provider, aiModelName, webSearch } = req.body;
    const targetProvider = provider || aiModelName || "Gemini";
    
    const sysInst = systemInstruction || "You are the Stellar Historian.";

    // Determine if web search is triggered explicitly via prop or mention in message
    let shouldSearch = Boolean(webSearch);
    let latestUserQuery = "";

    if (Array.isArray(messages) && messages.length > 0) {
      for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i];
        if (m.role === 'user') {
          const rawText = typeof m.content === 'string' ? m.content : (m.text || '');
          latestUserQuery = rawText;
          if (checkWebSearchTrigger(rawText)) {
            shouldSearch = true;
          }
          break;
        }
      }
    }

    let sources: UniversalSource[] = [];
    if (shouldSearch && latestUserQuery) {
      try {
        sources = await performUniversalWebSearch(latestUserQuery);
      } catch (searchErr) {
        console.warn("Universal Web Search retrieval error:", searchErr);
      }
    }

    try {
      let text = "";
      let usedProvider = targetProvider;

      if (targetProvider !== "Gemini" && apiKey && apiKey.trim().length > 0) {
        try {
          text = await callOtherProvider(targetProvider, apiKey.trim(), sysInst, messages || [], sources);
        } catch (providerError: any) {
          console.warn(`Chat provider ${targetProvider} failed (${providerError?.message}), attempting Gemini fallback...`);
          text = await callGeminiProvider(undefined, sysInst, messages || [], sources);
          usedProvider = `${targetProvider} (Gemini fallback)`;
        }
      } else if (targetProvider !== "Gemini" && (!apiKey || apiKey.trim().length === 0)) {
        text = await callGeminiProvider(undefined, sysInst, messages || [], sources);
        usedProvider = `${targetProvider} (Gemini engine)`;
      } else {
        text = await callGeminiProvider(apiKey, sysInst, messages || [], sources);
      }

      text = text.trim();
      return res.json({ 
        text, 
        provider: usedProvider,
        sources: sources.length > 0 ? sources : undefined,
        isWebSearchGrounded: sources.length > 0,
        searchQuery: shouldSearch ? stripWebSearchMentions(latestUserQuery) : undefined
      });
    } catch (error: any) {
      console.error(`${targetProvider} Chat Error on server:`, error?.message || error);
      return res.status(500).json({ error: `${targetProvider} failed`, detail: error?.message || String(error) });
    }
  });

  app.post("/api/ai/stream-refine", async (req, res) => {
    const { prompt, systemInstruction, apiKey } = req.body;
    
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      const client = getAiClient(apiKey);
      if (!client) throw new Error("No valid Gemini API key available.");

      const NO_EMOJI_INSTRUCTION = "\n\nCRITICAL INSTRUCTION: You MUST strictly NOT use ANY emojis or emoticons in your response under any circumstances. Emojis are strictly prohibited.";
      const finalSystemInstruction = (systemInstruction || "You are the Stellar Historian.") + NO_EMOJI_INSTRUCTION;

      const responseStream = await client.models.generateContentStream({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: { systemInstruction: finalSystemInstruction }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      console.error("Stream error:", error);
      res.write(`data: ${JSON.stringify({ error: error.message || String(error) })}\n\n`);
      res.end();
    }
  });

  // Cloud Notes Sync Endpoints
  app.get("/api/notes", async (req, res) => {
    try {
      if (existsSync(NOTES_FILE)) {
        const data = await fs.readFile(NOTES_FILE, "utf-8");
        const parsed = JSON.parse(data);
        return res.json({ notes: parsed.notes || [], lastSynced: parsed.lastSynced || Date.now() });
      }
      return res.json({ notes: [], lastSynced: Date.now() });
    } catch (error: any) {
      console.error("Error reading cloud notes:", error?.message || error);
      return res.json({ notes: [], lastSynced: Date.now() });
    }
  });

  app.post("/api/notes/sync", async (req, res) => {
    try {
      const { notes } = req.body;
      const notesToSave = Array.isArray(notes) ? notes : [];
      const payload = {
        notes: notesToSave,
        lastSynced: Date.now()
      };
      await fs.writeFile(NOTES_FILE, JSON.stringify(payload, null, 2), "utf-8");
      return res.json({ success: true, count: notesToSave.length, lastSynced: payload.lastSynced });
    } catch (error: any) {
      console.error("Error saving cloud notes:", error?.message || error);
      return res.status(500).json({ error: "Failed to sync cloud notes", detail: error?.message || String(error) });
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

