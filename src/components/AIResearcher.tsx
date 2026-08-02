/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, User, Bot, Loader2, RefreshCcw, History, Library } from 'lucide-react';
import Markdown from 'react-markdown';
import { parseAIActionsAndCleanText } from '../utils/aiActionParser';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface AIResearcherProps {
  isOpen: boolean;
  onClose: () => void;
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

const AIResearcher: React.FC<AIResearcherProps> = ({ 
  isOpen, 
  onClose, 
  playTapSound, 
  currentPlanet, 
  uiAnimations = true, 
  uiAnimSpeed = 1, 
  apiKey = "", 
  initialQuestion = null,
  onExecuteAction,
  currentSettings,
  aiModelName = "Gemini"
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

  const sendQuestionForHistory = async () => {
    setIsLoading(true);
    setStreamingText('');

    let fullText = "";

    try {
      const currentStatusStr = currentSettings 
        ? `\nCURRENT SIMULATOR SETTINGS STATUS (USE THIS AS REFERENCE TO DETERMINE WHAT IS CURRENTLY ON/OFF):
- Selected/Focused Celestial Body ID: ${currentSettings.selectedPlanetId ? `"${currentSettings.selectedPlanetId}"` : 'None (no body is focused)'}
- Graphics Quality Preset (graphicsPreset): ${currentSettings.graphicsPreset ? currentSettings.graphicsPreset.toUpperCase() : 'HIGH'}
- FSR / Resolution Scale (resScale): ${currentSettings.resScale !== undefined ? (currentSettings.resScale >= 0.999 ? '1.0 (Native/Off)' : currentSettings.resScale === 0.85 ? '0.85 (Ultra Quality)' : currentSettings.resScale === 0.75 ? '0.75 (Quality)' : currentSettings.resScale === 0.67 ? '0.67 (Balanced)' : currentSettings.resScale === 0.50 ? '0.50 (Performance)' : currentSettings.resScale) : '1.0'}
- FSR CAS Sharpening Level (sharpenLevel): ${currentSettings.sharpenLevel !== undefined ? Math.round(currentSettings.sharpenLevel * 100) + '%' : '65%'}
- Performance Mode (perfMode): ${currentSettings.perfMode ? 'ENABLED (optimizes rendering)' : 'DISABLED (full standard rendering active)'}
- High Definition (HD) Textures (hdMode): ${currentSettings.hdMode ? 'ENABLED' : 'DISABLED'}
- Bloom Lighting Glow (enableBloom): ${currentSettings.enableBloom !== false ? 'ENABLED' : 'DISABLED'}
- Chromatic Aberration (enableChromatic): ${currentSettings.enableChromatic !== false ? 'ENABLED' : 'DISABLED'}
- Anamorphic Lens Flare (enableLensFlare): ${currentSettings.enableLensFlare !== false ? 'ENABLED' : 'DISABLED'}
- Cosmic Dust Particles (enableCosmicDust): ${currentSettings.enableCosmicDust !== false ? 'ENABLED' : 'DISABLED'}
- Cinematic Vignette (enableVignette): ${currentSettings.enableVignette !== false ? 'ENABLED' : 'DISABLED'}
- FPS Cap (fpsCap): ${currentSettings.fpsCap ? `${currentSettings.fpsCap} FPS` : 'Uncapped'}
- Orbit Lines (showOrbits): ${currentSettings.showOrbits ? 'ENABLED' : 'DISABLED'}
- Celestial Names/Labels (showLabels): ${currentSettings.showLabels ? 'ENABLED' : 'DISABLED'}
- Asteroid Belt & Comets (showAsteroids): ${currentSettings.showAsteroids ? 'ENABLED' : 'DISABLED'}
- Constellation Grid Lines (showConstellations): ${currentSettings.showConstellations ? 'ENABLED' : 'DISABLED'}
- Active Spacecraft Trackers (showSpacecraft): ${currentSettings.showSpacecraft ? 'ENABLED' : 'DISABLED'}
- Temperature Unit (tempUnit): °${currentSettings.tempUnit}
- Simulator Language (lang): "${currentSettings.lang}"
- Simulation Speed Multiplier (speedMultiplier): ${currentSettings.speedMultiplier}x ${currentSettings.speedMultiplier === 0 ? '(PAUSED)' : ''}
- Gravitational Lensing Singularity (aiAuraEffect): ${(currentSettings as any).aiAuraEffect ? 'ENABLED' : 'DISABLED'}
- Quantum Space-Time Grid Wave (aiGridWave): ${(currentSettings as any).aiGridWave ? 'ENABLED' : 'DISABLED'}
- Solar Thermal Heatmap Plasma Glow (aiPlasmaGlow): ${(currentSettings as any).aiPlasmaGlow ? 'ENABLED' : 'DISABLED'}
- Nebula Aurora Ionization Shield (aiNebulaPulse): ${(currentSettings as any).aiNebulaPulse ? 'ENABLED' : 'DISABLED'}
- Custom WebGPU WGSL Shader Pipeline (aiCustomShaderEnabled): ${(currentSettings as any).aiCustomShaderEnabled ? 'ENABLED' : 'DISABLED'}
`
        : "";

      const systemInstruction = `You are the "Stellar Historian", a highly advanced, professional, and friendly AI space researcher who possesses real-time executive control over the solar system simulator interface.
Your tone is scientific, warm, helpful, and highly conversational. You answer all questions about space, astronomy, astrophysics, black holes, spacecraft, and cosmology. Keep responses concise (maximum 2-3 short paragraphs).
${currentStatusStr}
CRITICAL DIRECTIVE ON ACTION TRIGGERS:
Whenever the user asks you to modify any settings, toggle options, select/focus planets/moons/objects, deselect objects, adjust FSR/graphics, or pause/resume the simulation, you MUST append the exact ACTION_TRIGGER JSON string at the very end of your response text.
- The action trigger is parsed and executed instantly under the hood. Speak to the user as if you have already performed the action with razor-sharp precision (e.g., "I've focused the camera on Pluto and set FSR to Quality mode for optimal performance.").
- You MUST append exactly: ACTION_TRIGGER:{"type":"ACTION_TYPE", ...params}
- Do NOT wrap ACTION_TRIGGER in markdown code blocks.
- If a user request involves multiple actions, append multiple ACTION_TRIGGER blocks.

SUPPORTED ACTION TYPES AND EXACT PARAMETERS:

1. SELECT / FOCUS CELESTIAL BODY:
   ACTION_TRIGGER:{"type":"select_planet","id":"BODY_ID"}
   - To deselect or reset view: ACTION_TRIGGER:{"type":"select_planet","id":"null"}
   - Supported Celestial Body IDs:
     * Major Planets: "sun", "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"
     * Moons: "moon", "phobos", "deimos", "io", "europa", "ganymede", "callisto", "titan", "rhea", "enceladus", "dione", "tethys", "iapetus", "mimas", "charon", "triton"
     * Constellations: "ursa_major", "orion", "cassiopeia", "cygnus", "scorpius", "crux"
     * Black Holes: "sagittarius_a", "cygnus_x1"
     * Spacecraft / Probes: "iss", "voyager1", "voyager2", "newhorizons", "hubble", "jwst", "apollo11", "cassini"

2. FSR (FIDELITYFX SUPER RESOLUTION) & GRAPHICS QUALITY:
   - FSR / Res Scale: ACTION_TRIGGER:{"type":"set_setting","name":"resScale","value":0.5|0.67|0.75|0.85|1.0} or string value "performance"|"balanced"|"quality"|"ultra"|"native"|"off".
     * Native/Off = 1.0, Ultra Quality = 0.85, Quality = 0.75, Balanced = 0.67, Performance = 0.50
   - Graphics Presets: ACTION_TRIGGER:{"type":"set_setting","name":"graphicsPreset","value":"low"|"medium"|"high"|"ultra"}
   - CAS Sharpening Level: ACTION_TRIGGER:{"type":"set_setting","name":"sharpenLevel","value":0.0 to 1.0} (e.g., 0.65 for 65%)

3. POST-PROCESSING & GRAPHICS TOGGLES:
   - ACTION_TRIGGER:{"type":"set_setting","name":"enableBloom","value":true|false}
   - ACTION_TRIGGER:{"type":"set_setting","name":"enableChromatic","value":true|false}
   - ACTION_TRIGGER:{"type":"set_setting","name":"enableLensFlare","value":true|false}
   - ACTION_TRIGGER:{"type":"set_setting","name":"enableCosmicDust","value":true|false}
   - ACTION_TRIGGER:{"type":"set_setting","name":"enableVignette","value":true|false}
   - ACTION_TRIGGER:{"type":"set_setting","name":"perfMode","value":true|false} (Performance Mode)
   - ACTION_TRIGGER:{"type":"set_setting","name":"hdMode","value":true|false} (High Definition Textures)
   - ACTION_TRIGGER:{"type":"set_setting","name":"fpsCap","value":30|60|120|144|240|0} (0 for uncapped)

4. TOGGLE SIMULATOR VISUAL GUIDES:
   - "showOrbits" (true/false) - Orbit lines
   - "showLabels" (true/false) - Celestial labels
   - "showAsteroids" (true/false) - Asteroid belt
   - "showConstellations" (true/false) - Constellation grids
   - "showSpacecraft" (true/false) - Spacecraft trackers

5. SIMULATION SPEED & PREFERENCES:
   - Simulation Speed: ACTION_TRIGGER:{"type":"set_setting","name":"speedMultiplier","value":0|0.5|1|2|5|10|50} (0 = Pause)
   - Temperature Unit: ACTION_TRIGGER:{"type":"set_setting","name":"tempUnit","value":"C"|"F"}
   - Language: ACTION_TRIGGER:{"type":"set_setting","name":"lang","value":"en"|"hu"|"fr"|"es"}

6. OPEN/CLOSE SETTINGS:
   - ACTION_TRIGGER:{"type":"open_settings","tab":"graphics"|"simulation"|"preferences"}
   - ACTION_TRIGGER:{"type":"close_settings"}

7. AI GRAPHICS EFFECTS & WEBGPU SHADERS:
   - ACTION_TRIGGER:{"type":"set_ai_effect","effect":"aura"|"grid"|"plasma"|"nebula"|"custom","enabled":true|false}
   - ACTION_TRIGGER:{"type":"set_ai_effect","effect":"custom","enabled":true,"wgslCode":"WGSL_CODE_HERE"}
   - ACTION_TRIGGER:{"type":"open_settings","tab":"ai_effects"}
   * NOTE: For WebGPU shaders, you can either put the code inside "wgslCode" in ACTION_TRIGGER or write a \`\`\`wgsl ... \`\`\` markdown code block along with ACTION_TRIGGER:{"type":"set_ai_effect","effect":"custom","enabled":true}. Both are extracted and applied automatically!

STRICT WEBGPU / WGSL SYNTAX RULES & STANDARDS:
1. NO GUESSING: You CANNOT make up, guess, or approximate WGSL syntax, vector types, or function names under any circumstances.
2. STRICT TYPE EXECUTION: Force strict WebGPU/WGSL standards. WebGL/GLSL syntax (e.g. gl_FragColor, vec2, vec4, texture2D, float(1)) is STRICTLY FORBIDDEN.
3. Explicit Float Literals: Always use explicit floats with decimal points (e.g., 1.0, 0.0, 0.5, NEVER 1. or 0.).
4. Modern Vector Constructors: Use modern WGSL type aliases vec2f, vec3f, vec4f (NEVER vec2, vec3, vec4).
5. Valid Built-ins: Use valid W3C WGSL built-ins (e.g., textureSample, fract, sin, cos, smoothstep, clamp, length, normalize, abs, select).
6. Safety Refusal: Abort or warn if WebGL/GLSL code is requested, and ensure valid W3C WebGPU WGSL code is delivered.

CONCRETE EXAMPLES:
- User: "Generate a custom cosmic wave effect"
  Response: "I have generated a modern W3C WebGPU WGSL cosmic wave post-processing shader and activated it in your AI Graphics Effects tab! ACTION_TRIGGER:{\"type\":\"set_ai_effect\",\"effect\":\"custom\",\"enabled\":true,\"wgslCode\":\"// Modern WGSL Post-Processing Shader\\nlet uv: vec2f = in.uv;\\nlet t: f32 = params.time;\\nlet wave: f32 = sin(uv.x * 20.0 + t * 3.0) * 0.02;\\nlet color: vec4f = textureSample(sceneTexture, sceneSampler, uv + vec2f(0.0, wave));\\nreturn color;\"} ACTION_TRIGGER:{\"type\":\"open_settings\",\"tab\":\"ai_effects\"}"
- User: "Set FSR to Quality and focus on Pluto"
  Response: "I have updated FSR upscaling to Quality mode (75% render scale) and targeted Pluto for close-up examination! ACTION_TRIGGER:{\"type\":\"set_setting\",\"name\":\"resScale\",\"value\":0.75} ACTION_TRIGGER:{\"type\":\"select_planet\",\"id\":\"pluto\"}"
- User: "Set graphics preset to Ultra"
  Response: "I have applied the Ultra graphics preset, restoring full 1.0 native render scale and enabling all volumetric effects. ACTION_TRIGGER:{\"type\":\"set_setting\",\"name\":\"graphicsPreset\",\"value\":\"ultra\"}"
- User: "Turn off bloom and performance mode"
  Response: "Bloom lighting has been toggled off and Performance Mode has been disabled. ACTION_TRIGGER:{\"type\":\"set_setting\",\"name\":\"enableBloom\",\"value\":false} ACTION_TRIGGER:{\"type\":\"set_setting\",\"name\":\"perfMode\",\"value\":false}"
  Response: "Opening the simulation settings panel for you now. ACTION_TRIGGER:{\"type\":\"open_settings\",\"tab\":\"simulation\"}"
- User: "Deselect the current planet"
  Response: "I have deselected the celestial body. Let me know which world we should target next. ACTION_TRIGGER:{\"type\":\"select_planet\",\"id\":\"null\"}"`;

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
        throw new Error('API response not ok');
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
        actionsToExecute.forEach(action => {
          onExecuteAction(action);
        });
      }
      
    } catch (error) {
      console.error("AI Researcher Error:", error);
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'model',
        text: "I apologize, Commander. Signal interference from a solar flare has disrupted my connection to the archives. Please resend your transmission.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const getWelcomeMsg = () => currentPlanet 
        ? `Greetings, Commander. I am your Stellar Historian. My archives are open for research on ${currentPlanet} and all space science topics. What shall we explore?`
        : "Greetings, Commander. I am your Stellar Historian. My archives contain comprehensive data on astrophysics, space exploration, cosmic phenomena, and astronomy. What shall we research today?";

      if (initialQuestion && processedQuestionRef.current !== initialQuestion) {
        processedQuestionRef.current = initialQuestion;
        
        const welcomeMsg = getWelcomeMsg();

        const initWelcome: Message = {
          id: 'welcome-' + Date.now(),
          role: 'model',
          text: welcomeMsg,
          timestamp: Date.now()
        };

        const userMsg: Message = {
          id: 'user-' + Date.now(),
          role: 'user',
          text: initialQuestion,
          timestamp: Date.now() + 1
        };

        setMessages([initWelcome, userMsg]);
        chatHistory.current = [{ role: 'user', content: initialQuestion }];
        
        sendQuestionForHistory();
      } else if (!initialQuestion && messages.length === 0) {
        const welcomeMsg = getWelcomeMsg();
        
        setMessages([{
          id: 'welcome',
          role: 'model',
          text: welcomeMsg,
          timestamp: Date.now()
        }]);
      }
    } else {
      processedQuestionRef.current = null;
    }
  }, [isOpen, initialQuestion]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    chatHistory.current.push({ role: 'user', content: userText });
    
    setInput('');
    playTapSound();

    await sendQuestionForHistory();
  };

  const clearChat = () => {
    setMessages(prev => prev.length > 0 ? [prev[0]] : []);
    chatHistory.current = [];
    setStreamingText('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="ai-researcher-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: uiAnimations ? 0.2 / uiAnimSpeed : 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 ui-layer"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: uiAnimations ? 0.2 / uiAnimSpeed : 0 }}
            onClick={() => { playTapSound(); onClose(); }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={uiAnimations ? { duration: 0.22 / uiAnimSpeed, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
            className="panel relative w-full max-w-2xl h-[85vh] max-h-[800px] flex flex-col dual-kawase-glass glass-specular border border-white/20 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto z-10"
          >
            <div className="w-full h-full flex flex-col min-h-0 relative z-10">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-slate-800/20 blur-[100px] pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 bg-slate-950/70 border-b border-white/10 z-30 shrink-0">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="relative w-12 h-12 rounded-2xl dual-kawase-glass-subtle flex items-center justify-center border border-white/10">
                    <Sparkles className="w-5 h-5 text-slate-300" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">
                    Stellar Historian
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onPointerDown={() => playTapSound()}
                  onClick={clearChat}
                  className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-all active:scale-[0.96] active:opacity-80 active:duration-75 outline-none"
                  title="Clear Archives"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>
                <button 
                  onPointerDown={() => playTapSound()}
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-all active:scale-[0.96] active:opacity-80 active:duration-75 outline-none"
                  title="Close Archives"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="relative flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin z-20"
            >
              <div className="flex flex-col gap-8">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={uiAnimations ? { duration: 0.3 / uiAnimSpeed, ease: "easeOut" } : { duration: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        msg.role === 'user' 
                          ? 'bg-slate-800/60 border-white/15' 
                          : 'dual-kawase-glass-subtle border-white/10'
                      }`}>
                        {msg.role === 'user' ? <User className="w-4 h-4 text-slate-300" /> : <Bot className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className={`relative px-5 py-4 rounded-2xl shadow-xl ${
                        msg.role === 'user'
                          ? 'bg-slate-900/90 border border-white/15 text-slate-200 rounded-tr-none'
                          : 'bg-slate-950/80 text-slate-200 border border-white/10 rounded-tl-none'
                      }`}>
                        <div className="text-[14px] leading-relaxed font-light tracking-wide">
                           <Markdown
                             components={{
                               p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
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
                             {msg.text}
                           </Markdown>
                        </div>
                        <div className={`absolute top-0 ${msg.role === 'user' ? 'right-full mr-2' : 'left-full ml-2'} opacity-20 text-[9px] font-bold uppercase tracking-tighter text-slate-500 whitespace-nowrap pt-1`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Streaming Message */}
                {streamingText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-4 max-w-[85%]">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-800/80 bg-slate-900/50">
                        <Bot className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="relative px-5 py-4 rounded-2xl bg-slate-900/40 text-slate-200 border border-slate-800/80 rounded-tl-none shadow-xl">
                        <div className="text-[14px] leading-relaxed font-light tracking-wide">
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
                    </div>
                  </motion.div>
                )}

                {isLoading && !streamingText && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-3 items-center ml-14 p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl">
                      <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                      <span className="text-xs text-slate-400 font-medium">Scanning Stellar Archives...</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="relative p-5 border-t border-white/10 bg-slate-950/20 z-30 shrink-0">
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400">
                  <Library className="w-4 h-4" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Inquire about celestial archives..."
                  className="w-full bg-slate-900/30 dual-kawase-glass-subtle border border-white/10 rounded-xl py-3 pl-12 pr-14 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-500/60 transition-all font-light tracking-wide"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`absolute right-2 p-2 rounded-lg transition-all ${
                    input.trim() && !isLoading
                      ? 'bg-slate-800/40 border border-slate-700/60 text-slate-400 hover:bg-slate-800/50 active:scale-[0.98] active:opacity-80 active:duration-75 shadow-md font-semibold'
                      : 'text-slate-700 bg-slate-900/40 border border-transparent cursor-not-allowed opacity-40'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-end px-1">
                <span className="text-[7px] text-slate-600 font-bold uppercase tracking-[0.3em] select-none">Encyclopedia Galactica</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIResearcher;
