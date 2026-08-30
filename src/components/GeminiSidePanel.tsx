/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { parseAIActionsAndCleanText, getDispatchedActionInfo, AIAction } from '../utils/aiActionParser';
import { CitationPill, formatCitationsInText, SearchSource } from './CitationPill';
import { X, Send, Sparkles, User, Bot, Loader2, RefreshCcw, History, Maximize2, Trash2, Cpu, Check, Globe, ChevronDown, ChevronUp, ArrowUpRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  executedActions?: AIAction[];
  pendingActions?: AIAction[];
  actionStatus?: 'pending' | 'approved' | 'rejected';
  sources?: SearchSource[];
  searchQuery?: string;
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
    tempUnit: 'C' | 'F' | 'K';
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

  const handleApproveActions = (msgId: string) => {
    playTapSound();
    const targetMsg = messages.find(msg => msg.id === msgId);
    if (targetMsg && targetMsg.pendingActions && targetMsg.pendingActions.length > 0) {
      if (onExecuteAction) {
        targetMsg.pendingActions.forEach(action => onExecuteAction(action));
      }
    }
    setMessages(prev => prev.map(msg => {
      if (msg.id === msgId && msg.pendingActions && msg.pendingActions.length > 0) {
        return {
          ...msg,
          actionStatus: 'approved',
          executedActions: msg.pendingActions,
          pendingActions: undefined
        };
      }
      return msg;
    }));
  };

  const handleRejectActions = (msgId: string) => {
    playTapSound();
    setMessages(prev => prev.map(msg => {
      if (msg.id === msgId) {
        return {
          ...msg,
          actionStatus: 'rejected'
        };
      }
      return msg;
    }));
  };

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

      const systemInstruction = `You are "${aiModelName}", an approachable, friendly, and curious space AI assistant embedded into the side panel of the solar system simulator.
CRITICAL RULE: DO NOT use ANY emojis or emoticons under any circumstances. Emojis are strictly prohibited.
Communication Style: Friendly, curious, and concise (1-2 brief paragraphs max). Share captivating cosmic insights with warm clarity and enthusiasm while avoiding robotic filler, preambles, and repetitive disclaimers.
Identity & Factuality: Answer user questions directly. Only state your AI identity, non-human nature, or potential for hallucinations if the user explicitly asks about your identity or challenges your nature.
${currentStatusStr}

CRITICAL SIMULATOR CONTROL & ACTION DISPATCH RULES:
You have direct real-time control over the solar system simulation engine via ACTION_TRIGGER JSON payloads, SUBJECT TO AN EXTREMELY STRICT USER-APPROVAL REQUIREMENT.

1. SIMULATOR CONTROL & INTERACTIVE APPROVAL UI INTEGRATION:
- You have direct real-time control over the solar system simulation engine via ACTION_TRIGGER JSON payloads.
- Whenever you suggest, discuss, recommend, or perform a simulation action (e.g., focusing on a planet, changing speed, toggling orbits/labels/spacecraft/asteroids, opening settings/modals, or pausing), ALWAYS APPEND THE RELEVANT ACTION_TRIGGER PAYLOAD at the very end of your response.
- DO NOT ask the user for confirmation in plain text without including the ACTION_TRIGGER payload. Our application UI automatically catches your ACTION_TRIGGER payload and presents an interactive Approval Prompt UI ([Approve] / [Reject]) before executing it on the 3D canvas.

2. STRICT EXCLUSIVE ACTION TYPES RULE:
YOU MUST ONLY USE THE 15 EXACT ACTION TYPES LISTED BELOW. YOU ARE STRICTLY FORBIDDEN FROM INVENTING OR HALLUCINATING NONEXISTENT ACTION TYPES (such as custom_shader, warp_speed, change_color, set_ai_effect, rotate, set_camera, etc.).

3. FORMATTING RULE:
When approved by the user, every action trigger MUST be formatted as: ACTION_TRIGGER:{"type":"ACTION_TYPE", ...} appended at the end of text.

EXACT 15 SUPPORTED ACTION TYPES AND PARAMETER SCHEMAS:

1. SELECT CELESTIAL BODY / CAMERA TARGET:
   ACTION_TRIGGER:{"type":"select_planet","id":"BODY_ID"}
   Valid IDs: "sun", "mercury", "venus", "earth", "moon", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "charon", "titan", "enceladus", "iss", "jwst", "hubble", "sagittarius_a".
   Use null to reset camera lock: ACTION_TRIGGER:{"type":"select_planet","id":null}

2. RESET CAMERA / OVERVIEW:
   ACTION_TRIGGER:{"type":"reset_camera"}

3. ZOOM CONTROL:
   ACTION_TRIGGER:{"type":"set_zoom","value":"in"} or ACTION_TRIGGER:{"type":"set_zoom","value":"out"} or ACTION_TRIGGER:{"type":"set_zoom","value":1.5}

4. SIMULATION SPEED:
   ACTION_TRIGGER:{"type":"set_speed","value":0|0.5|1|2|5|10|20|50|100|1000}

5. PAUSE SIMULATION:
   ACTION_TRIGGER:{"type":"pause"}

6. RESUME SIMULATION:
   ACTION_TRIGGER:{"type":"resume"}

7. TOGGLE PAUSE STATE:
   ACTION_TRIGGER:{"type":"toggle_pause"}

8. TIME TRAVEL & CELESTIAL EVENTS:
   ACTION_TRIGGER:{"type":"time_travel","id":"EVENT_ID"}
   Valid Event IDs: "apollo11" (1969 Moon Landing), "voyager1" (1977 Probe Launch), "halley1986" (1986 Comet Perihelion), "alignment2000" (2000 Grand Alignment), "jwst2021" (2021 JWST Deployment), "alignment2040" (2040 Conjunction).

9. SIMULATOR SETTINGS & TOGGLES:
   ACTION_TRIGGER:{"type":"set_setting","name":"SETTING_NAME","value":VALUE}
   Valid Setting Names and Values:
   - "showOrbits": true|false
   - "showLabels": true|false
   - "showAsteroids": true|false
   - "showConstellations": true|false
   - "showSpacecraft": true|false
   - "perfMode": true|false
   - "hdMode": true|false
   - "tempUnit": "C"|"F"|"K"
   - "resScale": 0.50|0.67|0.75|0.85|1.0
   - "sharpenLevel": 0.0..1.0
   - "graphicsPreset": "low"|"medium"|"high"|"ultra"
   - "enableBloom": true|false
   - "enableChromatic": true|false
   - "enableLensFlare": true|false
   - "enableCosmicDust": true|false
   - "enableVignette": true|false
   - "fpsCap": 60|75|90|120|144|240|360|540
   - "wasdSpeed": 0.5..5.0

10. APPLY GRAPHICS PRESET:
    ACTION_TRIGGER:{"type":"apply_preset","preset":"low"|"medium"|"high"|"ultra"}

11. AUDIO & SOUND CONTROL:
    ACTION_TRIGGER:{"type":"set_audio","ambienceVolume":50,"tapVolume":80} or ACTION_TRIGGER:{"type":"set_audio","mute":true}

12. OPEN SETTINGS MODAL:
    ACTION_TRIGGER:{"type":"open_settings","tab":"graphics"|"audio"|"simulation"|"preferences"}

13. CLOSE SETTINGS MODAL:
    ACTION_TRIGGER:{"type":"close_settings"}

14. CELESTIAL SEARCH MODAL:
    ACTION_TRIGGER:{"type":"open_search","query":"QUERY","category":"Planets"|"Moons"|"Spacecraft"|"Constellations"|"Black Holes"}

15. MULTI-ACTION BATCH:
    ACTION_TRIGGER:{"type":"batch","actions":[{"type":"select_planet","id":"mars"},{"type":"set_speed","value":10}]}`;

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

      let resSources: SearchSource[] | undefined;
      let resQuery: string | undefined;

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          fullText = data.text;
          setStreamingText(fullText);
        }
        if (data.sources) resSources = data.sources;
        if (data.searchQuery) resQuery = data.searchQuery;
      } else {
        throw new Error('API response failed');
      }

      const { cleanedText, actions: actionsToExecute } = parseAIActionsAndCleanText(fullText);

      const modelMsgId = Date.now().toString();
      const modelMsg: Message = {
        id: modelMsgId,
        role: 'model',
        text: cleanedText,
        timestamp: Date.now(),
        pendingActions: actionsToExecute.length > 0 ? actionsToExecute : undefined,
        actionStatus: actionsToExecute.length > 0 ? 'pending' : undefined,
        sources: resSources,
        searchQuery: resQuery
      };

      setMessages(prev => [...prev, modelMsg]);
      chatHistory.current.push({ role: 'assistant', content: cleanedText });
      setStreamingText('');

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
            ? `${aiModelName} connected. Ask me anything about ${currentPlanet} or simulator controls!`
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
          className="!fixed top-4 right-4 bottom-4 w-80 sm:w-96 z-[60] dual-kawase-glass glass-specular border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden ui-layer pointer-events-auto select-none"
        >
          <div className="flex flex-col w-full h-full min-h-0 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 px-4 bg-slate-950/20 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900/80 border border-slate-700/60 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-slate-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>{aiModelName} Sidekick</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 border border-white/20 text-slate-300">
                    AI
                  </span>
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
                
                <div className={`p-3 rounded-xl max-w-[85%] leading-relaxed shadow select-text cursor-text ${
                  msg.role === 'user'
                    ? 'bg-slate-900/90 border border-slate-700/80 text-slate-100 rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  {msg.role === 'user' ? (
                    msg.text.split('\n').map((line, idx) => (
                      <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>{line}</p>
                    ))
                  ) : (
                    <Markdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
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
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto my-2.5 rounded-lg border border-slate-700/80 bg-slate-950/70 shadow">
                            <table className="w-full text-xs text-left divide-y divide-slate-700/80 border-collapse" {...props} />
                          </div>
                        ),
                        thead: ({node, ...props}) => <thead className="bg-slate-800/90 text-slate-200" {...props} />,
                        tbody: ({node, ...props}) => <tbody className="divide-y divide-slate-800/60 bg-slate-900/30" {...props} />,
                        tr: ({node, ...props}) => <tr className="hover:bg-slate-800/30 transition-colors" {...props} />,
                        th: ({node, ...props}) => <th className="px-2.5 py-1.5 font-semibold text-slate-100 tracking-wide border-r border-slate-800 last:border-r-0 whitespace-nowrap" {...props} />,
                        td: ({node, ...props}) => <td className="px-2.5 py-1.5 text-slate-300 border-r border-slate-800 last:border-r-0 align-top leading-relaxed" {...props} />,
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
                      {msg.text}
                    </Markdown>
                  )}

                  {/* Simulator Actions Prompt & Badges */}
                  {msg.role === 'model' && (
                    (msg.actionStatus === 'pending' && msg.pendingActions && msg.pendingActions.length > 0) ||
                    (msg.actionStatus === 'approved' || (!msg.actionStatus && msg.executedActions && msg.executedActions.length > 0)) ||
                    (msg.actionStatus === 'rejected')
                  ) && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-800">
                      {/* PENDING APPROVAL PROMPT */}
                      {msg.actionStatus === 'pending' && msg.pendingActions && msg.pendingActions.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-md font-sans text-slate-200">
                          <div className="flex items-center gap-1.5 mb-2 text-slate-300 text-[10px] font-mono font-semibold uppercase tracking-wider">
                            <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Proposed Action</span>
                          </div>

                          <div className="space-y-1 mb-2.5">
                            {msg.pendingActions.map((act, idx) => {
                              const info = getDispatchedActionInfo(act);
                              return (
                                <div 
                                  key={idx}
                                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-[10px] font-mono"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                  <span className="text-slate-400">{info.label}:</span>
                                  <span className="font-semibold text-slate-200">{info.details}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleRejectActions(msg.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-all active:scale-95 cursor-pointer shadow-sm"
                            >
                              <X className="w-3 h-3 text-slate-400" />
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveActions(msg.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-200 hover:bg-white text-slate-950 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
                            >
                              <Check className="w-3 h-3 text-slate-950" />
                              Approve
                            </button>
                          </div>
                        </div>
                      )}

                      {/* APPROVED BADGES */}
                      {(msg.actionStatus === 'approved' || (!msg.actionStatus && msg.executedActions && msg.executedActions.length > 0)) && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1 font-semibold mr-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Action Dispatched:
                          </span>
                          {msg.executedActions?.map((act, idx) => {
                            const info = getDispatchedActionInfo(act);
                            return (
                              <div 
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono shadow-sm"
                              >
                                <Check className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="text-slate-400">{info.label}:</span>
                                <span className="font-semibold text-slate-200">{info.details}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* REJECTED BADGES */}
                      {msg.actionStatus === 'rejected' && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1 font-semibold mr-0.5">
                            <X className="w-3.5 h-3.5 text-slate-500" /> Action Rejected:
                          </span>
                          {msg.pendingActions?.map((act, idx) => {
                            const info = getDispatchedActionInfo(act);
                            return (
                              <div 
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/60 border border-slate-800 text-slate-400 text-[11px] font-mono shadow-sm opacity-60"
                              >
                                <X className="w-3 h-3 text-slate-500 shrink-0" />
                                <span className="text-slate-500">{info.label}:</span>
                                <span className="font-semibold text-slate-400 line-through">{info.details}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
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
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200 rounded-tl-none max-w-[85%] leading-relaxed select-text cursor-text">
                  <Markdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
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
                      table: ({node, ...props}) => (
                        <div className="overflow-x-auto my-2.5 rounded-lg border border-slate-700/80 bg-slate-950/70 shadow">
                          <table className="w-full text-xs text-left divide-y divide-slate-700/80 border-collapse" {...props} />
                        </div>
                      ),
                      thead: ({node, ...props}) => <thead className="bg-slate-800/90 text-slate-200" {...props} />,
                      tbody: ({node, ...props}) => <tbody className="divide-y divide-slate-800/60 bg-slate-900/30" {...props} />,
                      tr: ({node, ...props}) => <tr className="hover:bg-slate-800/30 transition-colors" {...props} />,
                      th: ({node, ...props}) => <th className="px-2.5 py-1.5 font-semibold text-slate-100 tracking-wide border-r border-slate-800 last:border-r-0 whitespace-nowrap" {...props} />,
                      td: ({node, ...props}) => <td className="px-2.5 py-1.5 text-slate-300 border-r border-slate-800 last:border-r-0 align-top leading-relaxed" {...props} />,
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
          <div className="p-3 bg-slate-950/40 border-t border-slate-800 shrink-0">
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
