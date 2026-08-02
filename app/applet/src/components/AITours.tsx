import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Compass, Loader2, Sparkles, ChevronRight, ChevronLeft, MapPin } from 'lucide-react';

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
}

interface AIToursProps {
  isOpen: boolean;
  onClose: () => void;
  playTapSound: () => void;
  apiKey?: string;
  aiModelName?: string;
  onExecuteAction?: (action: any) => void;
  lang?: string;
  uiAnimations?: boolean;
  uiAnimSpeed?: number;
}

const PREDEFINED_TOURS = [
  { id: "inner", title: "The Inner Planets", desc: "Explore the rocky worlds closest to our Sun." },
  { id: "giants", title: "Gas & Ice Giants", desc: "Journey to the massive planets of the outer system." },
  { id: "moons", title: "Fascinating Moons", desc: "Visit the most intriguing natural satellites." },
  { id: "spacecraft", title: "Historic Spacecraft", desc: "Follow the paths of legendary probes." },
];

export const AITours: React.FC<AIToursProps> = ({
  isOpen,
  onClose,
  playTapSound,
  apiKey = "",
  aiModelName = "Gemini",
  onExecuteAction,
  uiAnimations = true,
  uiAnimSpeed = 1
}) => {
  const [activeTour, setActiveTour] = useState<TourStep[] | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [customTopic, setCustomTopic] = useState('');

  const abortController = useRef<AbortController | null>(null);

  const generateTour = async (topic: string) => {
    if (!apiKey && aiModelName !== "Gemini") return;
    setIsLoading(true);
    playTapSound();

    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    const systemInstruction = `You are a knowledgeable space tour guide. The user wants a tour about: "${topic}". Generate a sequence of 4 to 6 interesting stops. Return ONLY a valid JSON array of objects. No markdown formatting, no code blocks, just raw JSON.

Each object must have:
- targetId: (string) Must be one of: sun, mercury, venus, earth, moon, mars, jupiter, saturn, titan, rhea, enceladus, dione, tethys, uranus, neptune, voyager1, voyager2, cassini, newhorizons, hubble, jameswebb, iss, sagittarius_a, cygnus_x1
- title: (string) A short catchy title for this stop
- description: (string) 2-3 sentences explaining what we are looking at and why it's interesting on this tour.`;

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: 'Generate the tour.' }],
          systemInstruction,
          apiKey,
          provider: aiModelName
        }),
        signal: abortController.current.signal
      });

      if (response.ok) {
        const data = await response.json();
        let text = data.text || "[]";
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const steps = JSON.parse(text) as TourStep[];

        if (steps && steps.length > 0) {
          setActiveTour(steps);
          setCurrentStepIndex(0);
          onClose(); // Close the menu

          // Execute first step
          if (onExecuteAction) {
            onExecuteAction({ type: 'select_planet', id: steps[0].targetId });
          }
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error("Tour generation error:", e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goToStep = (index: number) => {
    if (!activeTour) return;
    if (index >= 0 && index < activeTour.length) {
      playTapSound();
      setCurrentStepIndex(index);
      if (onExecuteAction) {
        onExecuteAction({ type: 'select_planet', id: activeTour[index].targetId });
      }
    }
  };

  const endTour = () => {
    playTapSound();
    setActiveTour(null);
    setCurrentStepIndex(0);
  };

  return (
    <>
      {/* Tour Selection Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={uiAnimations ? { duration: 0.2 / uiAnimSpeed } : { duration: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 ui-layer"
            onClick={(e) => {
              if (!(e.target as HTMLElement).closest('.tour-panel')) {
                onClose();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={
                uiAnimations 
                  ? { duration: 0.25 / uiAnimSpeed, ease: [0.16, 1, 0.3, 1] } 
                  : { duration: 0 }
              }
              className="tour-panel panel relative w-full max-w-lg flex flex-col bg-slate-950/98 backdrop-blur-3xl border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              {/* Ambient Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-slate-800/20 blur-[100px] pointer-events-none" />

              <div className="flex items-center justify-between px-6 py-4 bg-slate-950/20 border-b border-slate-900/60 z-30 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-800/40 border border-slate-700/60 text-slate-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">AI Educational Space Tours</h3>
                    <p className="text-[11px] text-slate-500">Interactive guided journeys around the Solar System</p>
                  </div>
                </div>
                <button 
                  onClick={() => { playTapSound(); onClose(); }}
                  className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-900 rounded-lg transition-all active:scale-[0.96] active:opacity-80 active:duration-75 outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto relative z-20">
                {!apiKey && aiModelName !== "Gemini" ? (
                  <div className="text-center py-8 px-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                    <Sparkles className="w-8 h-8 text-slate-400/80 mx-auto mb-3" />
                    <h3 className="text-slate-200 font-medium mb-2">AI Requires Configuration</h3>
                    <p className="text-slate-400 text-sm">Please set up your AI provider and API key in Settings to generate educational tours.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-400 text-sm mb-5">
                      Select a predefined mission or describe a custom tour topic to let the AI guide you through the cosmos.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {PREDEFINED_TOURS.map((tour, index) => (
                        <motion.button
                          key={tour.id}
                          initial={{ opacity: 0, y: 10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={uiAnimations ? { duration: 0.2 / uiAnimSpeed, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => generateTour(tour.title)}
                          disabled={isLoading}
                          className="text-left p-4 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800/60 hover:border-slate-700/60 transition-colors group outline-none focus:ring-2 focus:ring-slate-600/50 cursor-pointer"
                        >
                          <h4 className="text-slate-200 font-medium text-sm mb-1 group-hover:text-slate-100 transition-colors flex items-center justify-between">
                            {tour.title}
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </h4>
                          <p className="text-slate-500 text-xs leading-relaxed">{tour.desc}</p>
                        </motion.button>
                      ))}
                    </div>

                    <div className="relative mb-5">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-800/60"></div>
                      </div>
                      <div className="relative flex justify-center text-sm font-medium leading-6">
                        <span className="bg-slate-950/98 px-3 text-slate-500 text-xs font-semibold uppercase tracking-widest">Or Create Custom Tour</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customTopic}
                        onChange={e => setCustomTopic(e.target.value)}
                        placeholder="e.g. 'The Apollo Missions'"
                        disabled={isLoading}
                        className="flex-1 bg-slate-900/50 border border-slate-800/60 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-slate-600/60 transition-colors"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && customTopic.trim()) {
                            generateTour(customTopic.trim());
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (customTopic.trim()) generateTour(customTopic.trim());
                        }}
                        disabled={isLoading || !customTopic.trim()}
                        className="px-5 py-2.5 active:scale-[0.98] active:opacity-80 active:duration-75 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-slate-900/50 transition-all flex items-center justify-center min-w-[80px] cursor-pointer"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Tour Floating Widget */}
      <AnimatePresence>
        {activeTour && activeTour.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={
              uiAnimations 
                ? { duration: 0.25 / uiAnimSpeed, ease: [0.16, 1, 0.3, 1] } 
                : { duration: 0 }
            }
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[55] w-full max-w-[400px] px-4 ui-layer pointer-events-none"
          >
            <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-3xl border border-slate-800/80 shadow-2xl rounded-2xl overflow-hidden flex flex-col relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-slate-800/20 before:to-slate-900/20 before:pointer-events-none">
              {/* Progress bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900/60">
                <motion.div 
                  className="h-full bg-gradient-to-r from-slate-700 to-slate-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStepIndex + 1) / activeTour.length) * 100}%` }}
                  transition={uiAnimations ? { duration: 0.3 / uiAnimSpeed, ease: 'easeOut' } : { duration: 0 }}
                />
              </div>

              <div className="px-5 pt-5 pb-4 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800/50 border border-slate-700/60 text-slate-400 text-xs font-bold">
                      {currentStepIndex + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      of {activeTour.length} Stops
                    </span>
                  </div>
                  <button 
                    onClick={endTour}
                    className="text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 p-1 rounded-lg transition-all active:scale-[0.96] active:opacity-80 active:duration-75 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStepIndex}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={uiAnimations ? { duration: 0.2 / uiAnimSpeed, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
                  >
                    <h3 className="text-lg font-bold text-slate-100 mb-2 leading-tight">
                      {activeTour[currentStepIndex].title}
                    </h3>
                    
                    <p className="text-sm text-slate-300 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                      {activeTour[currentStepIndex].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="px-5 py-3 bg-slate-950/50 border-t border-slate-800/60 flex items-center justify-between relative z-10">
                <button
                  onClick={() => goToStep(currentStepIndex - 1)}
                  disabled={currentStepIndex === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 transition-all active:scale-[0.96] active:opacity-80 active:duration-75 bg-slate-900/50 border border-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                
                <div className="text-xs font-medium text-slate-400 bg-slate-900/40 px-2.5 py-1 rounded-md border border-slate-800/40 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="capitalize">{activeTour[currentStepIndex].targetId.replace('_', ' ')}</span>
                </div>

                <button
                  onClick={() => goToStep(currentStepIndex + 1)}
                  disabled={currentStepIndex === activeTour.length - 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 transition-all active:scale-[0.96] active:opacity-80 active:duration-75 bg-slate-900/50 border border-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AITours;
