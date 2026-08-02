/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { parseAIActionsAndCleanText } from '../utils/aiActionParser';
import { X, Send, Sparkles, User, Bot, Loader2, RefreshCcw, History, Maximize2, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface GeminiSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onExpandToFullResearcher?: () => void;
  playTapSound: () => void;
  currentPlanet?: string | null;
  uiAnimations?: boolean;
  uiAnimSpeed?: number;
  apiKey?: string;
  initialQuestion?: string | null;
  onExecuteAction?: (action: any) => void;
  aiModelName?: string;
  currentSettings?: {
    speedMultiplier: number;
    showOrbits: boolean;
    showLabels: boolean;
    showAsteroids: boolean;
    showConstellations: boolean;
    showSpacecraft: boolean;
    perfMode: boolean;
    hdMode: boolean;
    tempUnit: 'C' | 'F';
    lang: string;
    selectedPlanetId: string | null;
    resScale?: number;
    sharpenLevel?: number;
    graphicsPreset?: 'low' | 'medium' | 'high' | 'ultra' | 'custom';
    enableBloom?: boolean;
    enableChromatic?: boolean;
    enableLensFlare?: boolean;
    enableCosmicDust?: boolean;
    enableVignette?: boolean;
    fpsCap?: number;
    wasdSpeed?: number;
  };
}

export const GeminiSidePanel: React.FC<GeminiSidePanelProps> = ({
  isOpen,
  onClose,
  onExpandToFullResearcher,
  playTapSound,
  currentPlanet,
  uiAnimations = true,
  uiAnimSpeed = 1,
  apiKey = "",
  initialQuestion = null,
  onExecuteAction,
  aiModelName = "Gemini",
  currentSettings
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const processedQuestionRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatHistory = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, streamingText, isLoading]);

  const sendQuestion = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    playTapSound();
    
    const userMsgId = Date.now().toString();
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      text: textToSend.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    chatHistory.current.push({ role: 'user', content: textToSend.trim() });
    if (!queryText) setInput('');

    setIsLoading(true);
    setStreamingText('');

    let fullText = "";

    try {
      const currentStatusStr = currentSettings 
        ? `\nCURRENT SIMULATOR SETTINGS STATUS:
- Selected Celestial Body ID: ${currentSettings.selectedPlanetId ? `"${currentSettings.selectedPlanetId}"` : 'None'}
- Quality Preset: ${currentSettings.graphicsPreset ? currentSettings.graphicsPreset.toUpperCase() : 'HIGH'}
- FSR / Res Scale: ${currentSettings.resScale !== undefined ? currentSettings.resScale : '1.0'}
- Performance Mode: ${currentSettings.perfMode ? 'ENABLED' : 'DISABLED'}
- Bloom: ${currentSettings.enableBloom !== false ? 'ENABLED' : 'DISABLED'}
- Orbit lines: ${currentSettings.showOrbits ? 'YES' : 'NO'}
- Celestial labels: ${currentSettings.showLabels ? 'YES' : 'NO'}
- Speed multiplier: ${currentSettings.speedMultiplier}x ${currentSettings.speedMultiplier === 0 ? '(PAUSED)' : ''}
`
        : "";

      const systemInstruction = `You are "${aiModelName}", a concise space intelligence assistant embedded directly into the side panel of the solar system simulator.
Keep all answers short, clear, direct, and engaging (1-2 brief paragraphs max).
${currentStatusStr}
If the user asks to change simulator settings, select/focus planets, or alter speed/FSR/shaders, append ACTION_TRIGGER:{"type":"...", ...} at the end of your response text.
Supported action triggers:
- SELECT CELESTIAL BODY: ACTION_TRIGGER:{"type":"select_planet","id":"BODY_ID"} (e.g. sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto, charon, titan, enceladus, iss, jwst, hubble, sagittarius_a)
- FSR / RES SCALE: ACTION_TRIGGER:{"type":"set_setting","name":"resScale","value":0.5|0.67|0.75|0.85|1.0}
- GRAPHICS PRESET: ACTION_TRIGGER:{"type":"set_setting","name":"graphicsPreset","value":"low"|"medium"|"high"|"ultra"}
- MODIFY TOGGLE: ACTION_TRIGGER:{"type":"set_setting","name":"SETTING_NAME","value":true|false} (e.g. perfMode, enableBloom, showOrbits, showLabels, showAsteroids, showConstellations, showSpacecraft)
- SET SPEED: ACTION_TRIGGER:{"type":"set_setting","name":"speedMultiplier","value":0|1|2|5|10}
- WEBGPU WGSL SHADER & AI EFFECTS: ACTION_TRIGGER:{"type":"set_ai_effect","effect":"custom","enabled":true,"wgslCode":"WGSL_CODE_HERE"}
- OPEN AI EFFECTS: ACTION_TRIGGER:{"type":"open_settings","tab":"ai_effects"}`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: chatHistory.current,
          systemInstruction,
          apiKey,
          provider: aiModelName
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          fullText = data.text;
          setStreamingText(fullText);
        }
      } else {
        throw new Error('API response failed');
      }

      const { cleanedText, actions: actionsToExecute } = parseAIActionsAndCleanText(fullText);

      const modelMsgId = Date.now().toString();
      const modelMsg: Message = {
        id: modelMsgId,
        role: 'model',
        text: cleanedText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, modelMsg]);
      chatHistory.current.push({ role: 'assistant', content: cleanedText });
      setStreamingText('');

      if (onExecuteAction) {
        actionsToExecute.forEach(action => onExecuteAction(action));
      }

    } catch (error) {
      console.error("Gemini Side Panel Error:", error);
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'model',
        text: "Signal interference detected. Please resend your transmission.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialQuestion && processedQuestionRef.current !== initialQuestion) {
        processedQuestionRef.current = initialQuestion;
        
        const welcomeMsg: Message = {
          id: 'welcome-' + Date.now(),
          role: 'model',
          text: `${aiModelName} connected. Answering your query on: "${initialQuestion}"`,
          timestamp: Date.now()
        };

        setMessages([welcomeMsg]);
        sendQuestion(initialQuestion);
      } else if (!initialQuestion && messages.length === 0) {
        setMessages([{
          id: 'welcome',
          role: 'model',
          text: currentPlanet 
            ? `${aiModelName} connected. Ask me anything about ${currentPlanet} or the cosmos!`
            : `${aiModelName} connected. What space topic or simulator command would you like to explore?`,
          timestamp: Date.now()
        }]);
      }
    } else {
      processedQuestionRef.current = null;
    }
  }, [isOpen, initialQuestion]);

  const clearChat = () => {
    playTapSound();
    setMessages([{
      id: 'welcome-' + Date.now(),
      role: 'model',
      text: `Archives cleared. How can ${aiModelName} assist you now?`,
      timestamp: Date.now()
    }]);
    chatHistory.current = [];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="gemini-side-panel"
          initial={{ opacity: 0, x: 40, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.97 }}
          transition={
            uiAnimations 
              ? { duration: 0.22 / uiAnimSpeed, ease: [0.16, 1, 0.3, 1] } 
              : { duration: 0 }
          }
          className="fixed top-4 right-4 bottom-4 w-80 sm:w-96 z-[60] dual-kawase-glass glass-specular border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden ui-layer pointer-events-auto"
        >
          <div className="flex flex-col w-full h-full min-h-0 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 px-4 bg-slate-950/70 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900/80 border border-slate-700/60 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-slate-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  {aiModelName} Sidekick
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">Quick Convo Mode</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onExpandToFullResearcher && (
                <button
                  onClick={() => {
                    playTapSound();
                    onExpandToFullResearcher();
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-all outline-none"
                  title="Expand to Full AI Researcher"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={clearChat}
                className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-all outline-none"
                title="Clear Chat"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  playTapSound();
                  onClose();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all outline-none"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs font-light scrollbar-thin"
          >
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={uiAnimations ? { duration: 0.2 / uiAnimSpeed } : { duration: 0 }}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-6 h-6 rounded-lg bg-slate-800/40 border border-slate-700/60 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-slate-400" />
                  </div>
                )}
                
                <div className={`p-3 rounded-xl max-w-[85%] leading-relaxed shadow ${
                  msg.role === 'user'
                    ? 'bg-slate-900/90 border border-slate-700/80 text-slate-100 rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  {msg.text.split('\n').map((line, idx) => (
                    <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>{line}</p>
                  ))}
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3 h-3 text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))}

            {streamingText && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-lg bg-slate-800/40 border border-slate-700/60 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3 h-3 text-slate-400" />
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200 rounded-tl-none max-w-[85%] leading-relaxed">
                  <Markdown
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0 inline-block w-full" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-slate-100" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-slate-300" {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2 text-slate-100" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2 text-slate-100" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-md font-bold mt-3 mb-2 text-slate-100" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="pl-1" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-600 pl-3 my-2 text-slate-400 italic" {...props} />,
                      code: ({node, className, children, ...props}) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match && !String(children).includes('\n');
                        if (isInline) {
                          return <code className="bg-slate-800/80 px-1.5 py-0.5 rounded text-[12px] font-mono text-slate-300" {...props}>{children}</code>;
                        }
                        return <code className="block bg-slate-800/80 p-3 rounded-lg text-[12px] font-mono text-slate-300 mb-2 overflow-x-auto whitespace-pre-wrap" {...props}>{children}</code>;
                      },
                    }}
                  >
                    {streamingText + (streamingText.endsWith('\n') ? '' : ' ▍')}
                  </Markdown>
                </div>
              </div>
            )}

            {isLoading && !streamingText && (
              <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80 w-fit">
                <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
                <span>Consulting {aiModelName}...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && !isLoading && (
            <div className="p-2 px-3 flex gap-1.5 overflow-x-auto bg-slate-950/40 border-t border-slate-900 shrink-0">
              {['Distance to Mars?', 'Pause simulator', 'What is Titan?'].map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendQuestion(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700/60 text-[10px] text-slate-300 hover:text-slate-200 font-medium transition-all whitespace-nowrap outline-none"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-slate-900/80 border-t border-slate-800 shrink-0">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendQuestion()}
                placeholder={`Ask @${aiModelName} anything...`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-3 pr-10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-600/60 font-light"
              />
              <button
                onClick={() => sendQuestion()}
                disabled={!input.trim() || isLoading}
                className={`absolute right-1.5 p-1.5 rounded-lg transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-slate-700 text-white shadow hover:bg-slate-300 active:scale-[0.98] active:opacity-80 active:duration-75'
                    : 'text-slate-600 bg-transparent cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
  );
};
