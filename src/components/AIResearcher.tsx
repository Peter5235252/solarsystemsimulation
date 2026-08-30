/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Send, Sparkles, User, Bot, Loader2, RefreshCcw, 
  BookOpen, Rocket, Compass, Copy, Check, Bookmark, 
  BookmarkCheck, Volume2, VolumeX, Square, Play, Pause,
  ChevronRight, ChevronDown, ChevronUp, ChevronsUpDown, Search, Atom, Orbit, Share2, 
  Sliders, ArrowUpRight, Flame, ShieldAlert, Cpu,
  Plus, Edit3, FileText, Wand2, Lightbulb, Clipboard,
  ClipboardPaste, ClipboardCheck, ClipboardCopy,
  Cloud, CloudUpload, CloudOff, Bold, Italic, Heading,
  List, ListTodo, Quote, Code, Tag, Trash2, CheckCircle2,
  Undo2, Redo2, Calculator, Eye, Globe, FastForward, Zap,
  ZoomIn, ZoomOut, Monitor, Activity, Sun, Moon, Telescope,
  Satellite, Layers, Gauge, Thermometer, Mic, MicOff
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { CustomDropdown } from './CustomDropdown';
import { CitationPill, formatCitationsInText } from './CitationPill';
import { parseAIActionsAndCleanText, getDispatchedActionInfo, AIAction } from '../utils/aiActionParser';
import { 
  CELESTIAL_DOSSIERS, 
  SPACE_MISSIONS, 
  COSMIC_PHENOMENA, 
  CelestialDossier, 
  SpaceMission, 
  CosmicPhenomenon 
} from '../data/stellarArchives';

interface SearchSource {
  title: string;
  url: string;
  snippet: string;
  sourceIndex: number;
  domain: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  executedActions?: AIAction[];
  pendingActions?: AIAction[];
  actionStatus?: 'pending' | 'approved' | 'rejected';
  suggestedFollowUps?: string[];
  sources?: SearchSource[];
  isWebSearchGrounded?: boolean;
  searchQuery?: string;
}

interface SavedNote {
  id: string;
  sourceMsgId: string;
  title: string;
  text: string;
  timestamp: number;
  category?: string;
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

type TabMode = 'dialogue' | 'dossiers' | 'expeditions' | 'phenomena' | 'notes';

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
  const [activeTab, setActiveTab] = useState<TabMode>('dialogue');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  
  // History & Bookmarks State
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stellar_historian_notes');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { return []; }
      }
    }
    return [];
  });

  // Custom Note Creation & AI Refinement State
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('Observation');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isAiRefining, setIsAiRefining] = useState(false);
  const [aiRefineSuccess, setAiRefineSuccess] = useState(false);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [copiedDraftSuccess, setCopiedDraftSuccess] = useState(false);

  // Undo / Redo History Stack for Research Notes
  const [noteHistory, setNoteHistory] = useState<string[]>(['']);
  const [historyPointer, setHistoryPointer] = useState<number>(0);
  const historyDebounceRef = useRef<any>(null);

  // Saved Notes List State: Collapsed by Default & Search Filter
  const [expandedNoteIds, setExpandedNoteIds] = useState<Set<string>>(() => new Set());
  const [notesSearchQuery, setNotesSearchQuery] = useState('');
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<number | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [userQueryHistory, setUserQueryHistory] = useState<string[]>([]);

  // Dossiers Tab state
  const [dossierCategory, setDossierCategory] = useState<'All' | 'Planet' | 'Moon' | 'Star' | 'Black Hole'>('All');
  const [dossierSearch, setDossierSearch] = useState('');
  const [selectedDossierId, setSelectedDossierId] = useState<string>('sun');

  // Missions Tab state
  const [missionCategory, setMissionCategory] = useState<'All' | 'Flyby / Interstellar' | 'Orbiter' | 'Observatory' | 'Crewed'>('All');
  const [missionSearch, setMissionSearch] = useState('');

  // TTS Speech State
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isTtsSupported, setIsTtsSupported] = useState(false);
  
  // STT Speech State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const handleSendRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<any>(null);
  const analyserRef = useRef<any>(null);
  const animationFrameRef = useRef<any>(null);
  const streamRef = useRef<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const processedQuestionRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const chatHistory = useRef<{ role: string; content: string }[]>([]);
  const syncTimeoutRef = useRef<any>(null);

  // Check TTS & STT availability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        setIsTtsSupported(true);
      }
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInput(currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          setIsListening(false);
          stopWaveform();
          if (event.error !== 'no-speech') {
            setMessages(prev => [...prev, {
              id: 'error-' + Date.now(),
              role: 'model',
              text: "Sorry, I didn't get that.",
              timestamp: Date.now()
            }]);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          stopWaveform();
        };
      }
    }
  }, []);

  const stopWaveform = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch((err: any) => console.error(err));
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop());
    }
  };

  const startWaveform = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();

        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = v * canvas.height / 2;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        animationFrameRef.current = requestAnimationFrame(draw);
      };
      draw();
    } catch (err) {
      console.error('Waveform Error:', err);
    }
  };

  const toggleSpeechToText = () => {
    if (!recognitionRef.current) {
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'model',
        text: "Speech recognition is not supported in your browser.",
        timestamp: Date.now()
      }]);
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      stopWaveform();
    } else {
      // Clear input and start listening
      setInput('');
      startWaveform();
      recognitionRef.current.start();
    }
  };

  // Fetch Cloud Notes on mount and merge with local notes
  const fetchCloudNotes = async () => {
    try {
      setCloudSyncStatus('syncing');
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notes) && data.notes.length > 0) {
          setSavedNotes(prev => {
            const map = new Map<string, SavedNote>();
            prev.forEach(n => map.set(n.id, n));
            data.notes.forEach((cn: SavedNote) => {
              const existing = map.get(cn.id);
              if (!existing || cn.timestamp >= existing.timestamp) {
                map.set(cn.id, cn);
              }
            });
            const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
            if (typeof window !== 'undefined') {
              localStorage.setItem('stellar_historian_notes', JSON.stringify(merged));
            }
            return merged;
          });
        }
        setCloudSyncStatus('synced');
        setLastCloudSyncTime(data.lastSynced || Date.now());
      } else {
        setCloudSyncStatus('synced');
      }
    } catch (e) {
      console.warn("Cloud notes fetch error:", e);
      setCloudSyncStatus('offline');
    }
  };

  useEffect(() => {
    fetchCloudNotes();
  }, []);

  // Sync to cloud in background
  const syncNotesToCloud = async (notesToSync: SavedNote[]) => {
    try {
      setCloudSyncStatus('syncing');
      const res = await fetch('/api/notes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesToSync })
      });
      if (res.ok) {
        const data = await res.json();
        setCloudSyncStatus('synced');
        setLastCloudSyncTime(data.lastSynced || Date.now());
      } else {
        setCloudSyncStatus('error');
      }
    } catch (e) {
      console.warn("Cloud sync failed:", e);
      setCloudSyncStatus('offline');
    }
  };

  const scheduleCloudSync = (notesToSync: SavedNote[]) => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      syncNotesToCloud(notesToSync);
    }, 600);
  };

  // Save notes to localStorage and trigger cloud sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('stellar_historian_notes', JSON.stringify(savedNotes));
    }
    scheduleCloudSync(savedNotes);
  }, [savedNotes]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && activeTab === 'dialogue') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, activeTab]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current && activeTab === 'dialogue') {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, streamingText, isLoading, activeTab]);

  // Sync selected planet with dossier if opened
  useEffect(() => {
    if (currentPlanet) {
      const match = CELESTIAL_DOSSIERS.find(d => d.id.toLowerCase() === currentPlanet.toLowerCase());
      if (match) {
        setSelectedDossierId(match.id);
      }
    }
  }, [currentPlanet]);

  // Stop TTS on modal close or unmount
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
  }, [isOpen]);

  // Action Menu State for '+' Button in Message Bar
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [actionSearchQuery, setActionSearchQuery] = useState('');
  const [actionCategoryFilter, setActionCategoryFilter] = useState<'All' | 'Focus' | 'Events' | 'Speed' | 'Graphics' | 'Layers'>('All');
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Web Search / Universal RAG State
  const [expandedSourcesMsgIds, setExpandedSourcesMsgIds] = useState<Set<string>>(() => new Set());
  const [isMentionMenuOpen, setIsMentionMenuOpen] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);
  const mentionMenuRef = useRef<HTMLDivElement>(null);

  const WEB_SEARCH_OPTIONS = useMemo(() => [
    { trigger: '@Web', label: 'Web Search', desc: 'Live web search & inline citations' },
    { trigger: '@Search', label: 'Search Web', desc: 'Query real-time astrophysics sources' },
    { trigger: '@Browse', label: 'Browse Web', desc: 'Ground query in verified internet data' }
  ], []);

  const checkIsWebSearchMention = (text: string): boolean => {
    if (!text) return false;
    const lower = text.toLowerCase().trim();
    return (
      lower.includes('@web search') ||
      lower.includes('@search the web') ||
      lower.includes('@browse the web') ||
      lower.includes('@web') ||
      lower.includes('@search') ||
      lower.includes('@browse') ||
      lower.startsWith('/search') ||
      lower.startsWith('/web')
    );
  };

  const isWebSearchActiveInInput = useMemo(() => {
    return checkIsWebSearchMention(input);
  }, [input]);

  const toggleExpandSources = (msgId: string) => {
    setExpandedSourcesMsgIds(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  const filteredMentionOptions = useMemo(() => {
    if (!mentionFilter) return WEB_SEARCH_OPTIONS;
    const q = mentionFilter.toLowerCase().replace(/^@/, '');
    return WEB_SEARCH_OPTIONS.filter(opt => 
      opt.trigger.toLowerCase().includes(q) || 
      opt.label.toLowerCase().includes(q) ||
      opt.desc.toLowerCase().includes(q)
    );
  }, [WEB_SEARCH_OPTIONS, mentionFilter]);

  const handleSelectMention = (trigger: string) => {
    playTapSound();
    setInput(prev => {
      const match = prev.match(/(?:^|\s)@([a-zA-Z0-9_\s]*)$/);
      if (match) {
        const prefix = prev.slice(0, prev.length - match[0].length);
        const leadingSpace = match[0].startsWith(' ') ? ' ' : '';
        return `${prefix}${leadingSpace}${trigger} `;
      }
      if (checkIsWebSearchMention(prev)) {
        return prev;
      }
      return `${trigger} ${prev.trimStart()}`;
    });
    setIsMentionMenuOpen(false);
    inputRef.current?.focus();
  };

  const toggleWebSearchInput = () => {
    playTapSound();
    if (isWebSearchActiveInInput) {
      // Strip triggers
      const cleaned = input
        .replace(/@web\s+search/gi, '')
        .replace(/@search\s+the\s+web/gi, '')
        .replace(/@browse\s+the\s+web/gi, '')
        .replace(/@web/gi, '')
        .replace(/@search/gi, '')
        .replace(/@browse/gi, '')
        .trim();
      setInput(cleaned);
    } else {
      setInput(prev => `@Web search ${prev.trimStart()}`);
    }
    inputRef.current?.focus();
  };

  // Close Action Menu on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setIsActionMenuOpen(false);
      }
    };
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActionMenuOpen) {
        setIsActionMenuOpen(false);
      }
    };
    if (isActionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleEscKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isActionMenuOpen]);

  // Comprehensive list of force actions the LLM can dispatch
  const forceActionItems = useMemo(() => [
    // Celestial Focus & Tracking
    { id: 'focus_sun', label: 'Focus Sun', category: 'Focus' as const, desc: 'Target Solar Core & Corona', icon: <Sun className="w-3.5 h-3.5 text-slate-300" />, badge: 'STAR', action: { type: 'select_planet', id: 'sun' } },
    { id: 'focus_earth', label: 'Focus Earth', category: 'Focus' as const, desc: 'Target Earth & Atmosphere', icon: <Globe className="w-3.5 h-3.5 text-slate-300" />, badge: 'PLANET', action: { type: 'select_planet', id: 'earth' } },
    { id: 'focus_moon', label: 'Focus Moon', category: 'Focus' as const, desc: 'Target Lunar Orbit & Surface', icon: <Moon className="w-3.5 h-3.5 text-slate-300" />, badge: 'MOON', action: { type: 'select_planet', id: 'moon' } },
    { id: 'focus_mars', label: 'Focus Mars', category: 'Focus' as const, desc: 'Target Martian Surface & Dust', icon: <Flame className="w-3.5 h-3.5 text-slate-300" />, badge: 'PLANET', action: { type: 'select_planet', id: 'mars' } },
    { id: 'focus_jupiter', label: 'Focus Jupiter', category: 'Focus' as const, desc: 'Target Gas Giant & Great Red Spot', icon: <Orbit className="w-3.5 h-3.5 text-slate-300" />, badge: 'GIANT', action: { type: 'select_planet', id: 'jupiter' } },
    { id: 'focus_saturn', label: 'Focus Saturn', category: 'Focus' as const, desc: 'Target Saturn & Ring System', icon: <Orbit className="w-3.5 h-3.5 text-slate-300" />, badge: 'RINGS', action: { type: 'select_planet', id: 'saturn' } },
    { id: 'focus_titan', label: 'Focus Titan', category: 'Focus' as const, desc: 'Target Titan Methane Seas', icon: <Moon className="w-3.5 h-3.5 text-slate-300" />, badge: 'MOON', action: { type: 'select_planet', id: 'titan' } },
    { id: 'focus_europa', label: 'Focus Europa', category: 'Focus' as const, desc: 'Target Jovian Ice Crust & Subsurface Ocean', icon: <Moon className="w-3.5 h-3.5 text-slate-300" />, badge: 'MOON', action: { type: 'select_planet', id: 'europa' } },
    { id: 'focus_uranus', label: 'Focus Uranus', category: 'Focus' as const, desc: 'Target Tilted Ice Giant', icon: <Orbit className="w-3.5 h-3.5 text-slate-300" />, badge: 'ICE', action: { type: 'select_planet', id: 'uranus' } },
    { id: 'focus_neptune', label: 'Focus Neptune', category: 'Focus' as const, desc: 'Target Outermost Supersonic Winds', icon: <Orbit className="w-3.5 h-3.5 text-slate-300" />, badge: 'ICE', action: { type: 'select_planet', id: 'neptune' } },
    { id: 'focus_pluto', label: 'Focus Pluto', category: 'Focus' as const, desc: 'Target Kuiper Belt Dwarf Planet', icon: <Orbit className="w-3.5 h-3.5 text-slate-300" />, badge: 'DWARF', action: { type: 'select_planet', id: 'pluto' } },
    { id: 'focus_sagittarius', label: 'Focus Sagittarius A*', category: 'Focus' as const, desc: 'Target Supermassive Black Hole', icon: <Atom className="w-3.5 h-3.5 text-slate-300" />, badge: 'BLACK HOLE', action: { type: 'select_planet', id: 'sagittarius_a' } },
    { id: 'focus_jwst', label: 'Focus JWST', category: 'Focus' as const, desc: 'Target Webb Infrared Observatory at L2', icon: <Telescope className="w-3.5 h-3.5 text-slate-300" />, badge: 'OPTICS', action: { type: 'select_planet', id: 'jwst' } },
    { id: 'focus_iss', label: 'Focus ISS', category: 'Focus' as const, desc: 'Target International Space Station', icon: <Satellite className="w-3.5 h-3.5 text-slate-300" />, badge: 'STATION', action: { type: 'select_planet', id: 'iss' } },
    { id: 'focus_voyager1', label: 'Focus Voyager 1', category: 'Focus' as const, desc: 'Target Interstellar Deep Space Probe', icon: <Rocket className="w-3.5 h-3.5 text-slate-300" />, badge: 'PROBE', action: { type: 'select_planet', id: 'voyager1' } },
    { id: 'reset_camera', label: 'Solar Overview', category: 'Focus' as const, desc: 'Reset Camera to Solar System View', icon: <Compass className="w-3.5 h-3.5 text-slate-300" />, badge: 'RESET', action: { type: 'reset_camera' } },

    // Historic Time Warp Events
    { id: 'warp_apollo11', label: 'Apollo 11 Landing (1969)', category: 'Events' as const, desc: 'July 20, 1969 Neil Armstrong Lunar Landing', icon: <Rocket className="w-3.5 h-3.5 text-slate-300" />, badge: 'HISTORIC', action: { type: 'time_travel', id: 'apollo11' } },
    { id: 'warp_voyager1', label: 'Voyager 1 Launch (1977)', category: 'Events' as const, desc: 'Sept 5, 1977 Deep Space Mission Launch', icon: <Compass className="w-3.5 h-3.5 text-slate-300" />, badge: 'MISSION', action: { type: 'time_travel', id: 'voyager1' } },
    { id: 'warp_halley', label: "Halley's Comet (1986)", category: 'Events' as const, desc: 'Feb 9, 1986 Perihelion Pass & Bright Coma', icon: <Flame className="w-3.5 h-3.5 text-slate-300" />, badge: 'COMET', action: { type: 'time_travel', id: 'halley1986' } },
    { id: 'warp_alignment2000', label: 'Planetary Alignment (2000)', category: 'Events' as const, desc: 'May 5, 2000 6-Planet Orbital Alignment', icon: <Orbit className="w-3.5 h-3.5 text-slate-300" />, badge: 'ALIGNMENT', action: { type: 'time_travel', id: 'alignment2000' } },
    { id: 'warp_jwst2021', label: 'JWST Launch (2021)', category: 'Events' as const, desc: 'Dec 25, 2021 Webb Telescope Launch to L2', icon: <Telescope className="w-3.5 h-3.5 text-slate-300" />, badge: 'TELESCOPE', action: { type: 'time_travel', id: 'jwst2021' } },
    { id: 'warp_alignment2040', label: 'Grand Conjunction (2040)', category: 'Events' as const, desc: 'Sept 8, 2040 5-Planet Twilight Alignment', icon: <Sparkles className="w-3.5 h-3.5 text-slate-300" />, badge: 'FUTURE', action: { type: 'time_travel', id: 'alignment2040' } },

    // Simulation Speed & Velocity
    { id: 'speed_pause', label: 'Pause Simulation', category: 'Speed' as const, desc: 'Freeze Orbital Progression (0x)', icon: <Pause className="w-3.5 h-3.5 text-slate-300" />, badge: '0X', action: { type: 'pause' } },
    { id: 'speed_1x', label: 'Real-Time Orbit (1x)', category: 'Speed' as const, desc: 'Standard Astronomical Real-Time Velocity', icon: <Play className="w-3.5 h-3.5 text-slate-300" />, badge: '1X', action: { type: 'set_speed', value: 1 } },
    { id: 'speed_5x', label: 'Fast-Forward (5x)', category: 'Speed' as const, desc: 'Accelerate Orbital Time Flow by 5x', icon: <FastForward className="w-3.5 h-3.5 text-slate-300" />, badge: '5X', action: { type: 'set_speed', value: 5 } },
    { id: 'speed_20x', label: 'Hyper-Speed (20x)', category: 'Speed' as const, desc: 'Observe Rapid Planetary Transits', icon: <Zap className="w-3.5 h-3.5 text-slate-300" />, badge: '20X', action: { type: 'set_speed', value: 20 } },
    { id: 'speed_100x', label: 'Maximum Warp (100x)', category: 'Speed' as const, desc: 'Maximum Orbital Velocity Multiplier', icon: <Gauge className="w-3.5 h-3.5 text-slate-300" />, badge: '100X', action: { type: 'set_speed', value: 100 } },

    // Graphics Presets & FSR Upscaling
    { id: 'preset_ultra', label: 'Ultra Quality Preset', category: 'Graphics' as const, desc: 'Full HDR Bloom, Cosmic Dust, and MSAA', icon: <Sparkles className="w-3.5 h-3.5 text-slate-300" />, badge: 'PRESET', action: { type: 'apply_preset', preset: 'ultra' } },
    { id: 'preset_high', label: 'High Fidelity Preset', category: 'Graphics' as const, desc: 'Balanced High Visual Quality & FPS', icon: <Activity className="w-3.5 h-3.5 text-slate-300" />, badge: 'PRESET', action: { type: 'apply_preset', preset: 'high' } },
    { id: 'preset_low', label: 'Low / Battery Saver', category: 'Graphics' as const, desc: 'Optimized Render Pipeline for Efficiency', icon: <Cpu className="w-3.5 h-3.5 text-slate-300" />, badge: 'PRESET', action: { type: 'apply_preset', preset: 'low' } },
    { id: 'fsr_100', label: 'FSR Native (100%)', category: 'Graphics' as const, desc: 'Native 1:1 Render Resolution Scale', icon: <Monitor className="w-3.5 h-3.5 text-slate-300" />, badge: 'FSR', action: { type: 'set_setting', name: 'resScale', value: 1.0 } },
    { id: 'fsr_75', label: 'FSR Quality (75%)', category: 'Graphics' as const, desc: '0.75x Resolution Scale with CAS Sharpening', icon: <Monitor className="w-3.5 h-3.5 text-slate-300" />, badge: 'FSR', action: { type: 'set_setting', name: 'resScale', value: 0.75 } },
    { id: 'fsr_50', label: 'FSR Performance (50%)', category: 'Graphics' as const, desc: '0.50x Resolution Scale for Max Performance', icon: <Monitor className="w-3.5 h-3.5 text-slate-300" />, badge: 'FSR', action: { type: 'set_setting', name: 'resScale', value: 0.50 } },

    // Display Layers & HUD Toggles
    { id: 'layer_orbits', label: 'Toggle Orbits', category: 'Layers' as const, desc: 'Keplerian Orbital Trajectory Trails', icon: <Orbit className="w-3.5 h-3.5 text-slate-300" />, badge: 'LAYER', action: { type: 'set_setting', name: 'showOrbits', value: !(currentSettings?.showOrbits) } },
    { id: 'layer_labels', label: 'Toggle Labels', category: 'Layers' as const, desc: 'Celestial Body Nameplates & HUD Tags', icon: <Tag className="w-3.5 h-3.5 text-slate-300" />, badge: 'LAYER', action: { type: 'set_setting', name: 'showLabels', value: !(currentSettings?.showLabels) } },
    { id: 'layer_asteroids', label: 'Toggle Asteroid Belt', category: 'Layers' as const, desc: 'Main Asteroid Belt Particles & Comets', icon: <Orbit className="w-3.5 h-3.5 text-slate-300" />, badge: 'LAYER', action: { type: 'set_setting', name: 'showAsteroids', value: !(currentSettings?.showAsteroids) } },
    { id: 'layer_constellations', label: 'Toggle Constellations', category: 'Layers' as const, desc: 'Stellar Constellation Lines & Zodiac Grid', icon: <Sparkles className="w-3.5 h-3.5 text-slate-300" />, badge: 'LAYER', action: { type: 'set_setting', name: 'showConstellations', value: !(currentSettings?.showConstellations) } },
    { id: 'layer_spacecraft', label: 'Toggle Spacecraft', category: 'Layers' as const, desc: 'Active Deep Space Exploration Probes', icon: <Satellite className="w-3.5 h-3.5 text-slate-300" />, badge: 'LAYER', action: { type: 'set_setting', name: 'showSpacecraft', value: !(currentSettings?.showSpacecraft) } },
    { id: 'layer_bloom', label: 'Toggle Bloom Glow', category: 'Layers' as const, desc: 'HDR Emissive Lighting Glow on Stars', icon: <Flame className="w-3.5 h-3.5 text-slate-300" />, badge: 'LAYER', action: { type: 'set_setting', name: 'enableBloom', value: !(currentSettings?.enableBloom) } },

    // Zoom & Audio Controls
    { id: 'zoom_in', label: 'Zoom In (+60%)', category: 'Focus' as const, desc: 'Increase Camera Magnification', icon: <ZoomIn className="w-3.5 h-3.5 text-slate-300" />, badge: 'ZOOM', action: { type: 'set_zoom', value: 'in' } },
    { id: 'zoom_out', label: 'Zoom Out (-40%)', category: 'Focus' as const, desc: 'Decrease Camera Magnification', icon: <ZoomOut className="w-3.5 h-3.5 text-slate-300" />, badge: 'ZOOM', action: { type: 'set_zoom', value: 'out' } },
    { id: 'audio_mute', label: 'Mute Ambience', category: 'Layers' as const, desc: 'Silence Ambient Cosmic Soundscape', icon: <VolumeX className="w-3.5 h-3.5 text-slate-300" />, badge: 'AUDIO', action: { type: 'set_audio', mute: true } },
    { id: 'audio_full', label: 'Max Ambience (100%)', category: 'Layers' as const, desc: 'Set Cosmic Ambience Volume to 100%', icon: <Volume2 className="w-3.5 h-3.5 text-slate-300" />, badge: 'AUDIO', action: { type: 'set_audio', ambienceVolume: 100 } },

    // Temperature Unit Toggles
    { id: 'temp_c', label: 'Celsius (°C)', category: 'Layers' as const, desc: 'Display Temperatures in Celsius', icon: <Thermometer className="w-3.5 h-3.5 text-slate-300" />, badge: '°C', action: { type: 'set_setting', name: 'tempUnit', value: 'C' } },
    { id: 'temp_f', label: 'Fahrenheit (°F)', category: 'Layers' as const, desc: 'Display Temperatures in Fahrenheit', icon: <Thermometer className="w-3.5 h-3.5 text-slate-300" />, badge: '°F', action: { type: 'set_setting', name: 'tempUnit', value: 'F' } },
    { id: 'temp_k', label: 'Kelvin (K)', category: 'Layers' as const, desc: 'Display Temperatures in Kelvin', icon: <Thermometer className="w-3.5 h-3.5 text-slate-300" />, badge: 'K', action: { type: 'set_setting', name: 'tempUnit', value: 'K' } }
  ], [currentSettings]);

  const filteredForceActions = useMemo(() => {
    return forceActionItems.filter(item => {
      const matchCat = actionCategoryFilter === 'All' || item.category === actionCategoryFilter;
      const q = actionSearchQuery.toLowerCase().trim();
      const matchQuery = !q || item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.badge?.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [forceActionItems, actionCategoryFilter, actionSearchQuery]);

  const handleForceDispatchAction = (label: string, action: any, desc?: string) => {
    playTapSound();
    if (onExecuteAction) {
      onExecuteAction(action);
    }
    
    // Add a clean commander dispatch message into the dialogue thread
    const dispatchMsg: Message = {
      id: 'dispatch-' + Date.now(),
      role: 'model',
      text: `**Manual Directive Dispatched:** \`${label}\`\n\n*${desc || 'Simulator telemetry and visual pipeline updated via commander override.'}*`,
      timestamp: Date.now(),
      executedActions: [action]
    };
    setMessages(prev => [...prev, dispatchMsg]);
    
    // Update LLM chat history context
    chatHistory.current.push({
      role: 'user',
      content: `[Commander Direct Action Executed: ${label}]`
    });
    chatHistory.current.push({
      role: 'assistant',
      content: `Acknowledged. Executed simulator action: ${label}. Telemetry updated accordingly.`
    });

    setIsActionMenuOpen(false);
  };

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

  const toggleTts = (msgId: string, text: string) => {
    if (!isTtsSupported) return;
    playTapSound();

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean text of markdown artifacts for natural reading
    const cleanSpeech = text
      .replace(/[*#_`~\[\]]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Pick natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (text: string, id: string) => {
    playTapSound();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSaveNote = (msg: Message) => {
    playTapSound();
    setSavedNotes(prev => {
      const exists = prev.some(n => n.sourceMsgId === msg.id);
      if (exists) {
        return prev.filter(n => n.sourceMsgId !== msg.id);
      } else {
        const titleSnippet = msg.text.slice(0, 48).replace(/[*#]/g, '').trim() + '...';
        return [{
          id: 'note-' + Date.now(),
          sourceMsgId: msg.id,
          title: titleSnippet,
          text: msg.text,
          timestamp: Date.now(),
          category: 'Observation'
        }, ...prev];
      }
    });
  };

  const toggleBookmark = toggleSaveNote;

  const handleOpenNewNote = () => {
    playTapSound();
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory('Observation');
    setNoteHistory(['']);
    setHistoryPointer(0);
    setAiRefineSuccess(false);
    setPasteSuccess(false);
    setCopiedDraftSuccess(false);
    setIsCreatingNote(true);
  };

  const handleEditNote = (note: SavedNote) => {
    playTapSound();
    setEditingNoteId(note.id);
    setNoteTitle(note.title || '');
    setNoteContent(note.text);
    setNoteCategory(note.category || 'Observation');
    setNoteHistory([note.text]);
    setHistoryPointer(0);
    setAiRefineSuccess(false);
    setPasteSuccess(false);
    setCopiedDraftSuccess(false);
    setIsCreatingNote(true);
  };

  // Helper to directly push text changes into the Undo/Redo history stack
  const setContentWithHistory = (newText: string) => {
    if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current);
    setNoteContent(newText);
    setNoteHistory(prev => {
      const sliced = prev.slice(0, historyPointer + 1);
      if (sliced[sliced.length - 1] === newText) return prev;
      return [...sliced, newText];
    });
    setHistoryPointer(prev => {
      const sliced = noteHistory.slice(0, prev + 1);
      if (sliced[sliced.length - 1] === newText) return prev;
      return sliced.length;
    });
  };

  // Debounced history recording for manual keystrokes
  const handleNoteTextChange = (text: string) => {
    setNoteContent(text);
    if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current);
    historyDebounceRef.current = setTimeout(() => {
      setNoteHistory(prev => {
        const sliced = prev.slice(0, historyPointer + 1);
        if (sliced[sliced.length - 1] === text) return prev;
        return [...sliced, text];
      });
      setHistoryPointer(prev => {
        const sliced = noteHistory.slice(0, prev + 1);
        if (sliced[sliced.length - 1] === text) return prev;
        return sliced.length;
      });
    }, 450);
  };

  const handleUndo = () => {
    if (historyPointer > 0) {
      playTapSound();
      const prevIndex = historyPointer - 1;
      setHistoryPointer(prevIndex);
      setNoteContent(noteHistory[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyPointer < noteHistory.length - 1) {
      playTapSound();
      const nextIndex = historyPointer + 1;
      setHistoryPointer(nextIndex);
      setNoteContent(noteHistory[nextIndex]);
    }
  };

  const handlePasteIntoNote = async () => {
    playTapSound();
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const updated = !noteContent.trim() ? text : `${noteContent}\n\n${text}`;
          setContentWithHistory(updated);
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2000);
        }
      }
    } catch (err) {
      console.warn('Clipboard read access note:', err);
    }
  };

  const handleCopyCurrentNoteDraft = () => {
    if (!noteContent.trim() && !noteTitle.trim()) return;
    playTapSound();
    const textToCopy = noteTitle ? `# ${noteTitle}\n\n${noteContent}` : noteContent;
    navigator.clipboard.writeText(textToCopy);
    setCopiedDraftSuccess(true);
    setTimeout(() => setCopiedDraftSuccess(false), 2000);
  };

  const handleAppendTextToNote = (textToAppend: string, suggestedTitle?: string, suggestedCat?: string) => {
    playTapSound();
    setActiveTab('notes');
    setIsCreatingNote(true);
    if (suggestedTitle && !noteTitle) {
      setNoteTitle(suggestedTitle);
    }
    if (suggestedCat && !noteCategory) {
      setNoteCategory(suggestedCat);
    }
    const updated = !noteContent.trim() ? textToAppend : `${noteContent}\n\n---\n${textToAppend}`;
    setContentWithHistory(updated);
    setPasteSuccess(true);
    setTimeout(() => setPasteSuccess(false), 2000);
  };

  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    playTapSound();
    const textarea = noteTextareaRef.current;
    if (!textarea) {
      setContentWithHistory(noteContent + `${prefix}${defaultText}${suffix}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = noteContent;
    const selected = currentVal.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;
    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    setContentWithHistory(newVal);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const insertTemplate = (templateMarkdown: string, suggestedTitle?: string, suggestedCat?: string) => {
    playTapSound();
    if (suggestedTitle && !noteTitle) {
      setNoteTitle(suggestedTitle);
    }
    if (suggestedCat) {
      setNoteCategory(suggestedCat);
    }
    const updated = !noteContent.trim() ? templateMarkdown : `${noteContent}\n\n${templateMarkdown}`;
    setContentWithHistory(updated);
  };

  const toggleNoteExpand = (id: string) => {
    playTapSound();
    setExpandedNoteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAllNotes = () => {
    playTapSound();
    setExpandedNoteIds(new Set(savedNotes.map(n => n.id)));
  };

  const handleCollapseAllNotes = () => {
    playTapSound();
    setExpandedNoteIds(new Set());
  };

  const handleManualCloudSync = () => {
    playTapSound();
    syncNotesToCloud(savedNotes);
  };

  const handleSaveCustomNote = () => {
    if (!noteContent.trim() && !noteTitle.trim()) return;
    playTapSound();

    const timestamp = Date.now();
    const finalTitle = noteTitle.trim() || `Research Note (${new Date(timestamp).toLocaleDateString()})`;
    const finalText = noteContent.trim();
    const finalCategory = noteCategory.trim() || 'Observation';

    if (editingNoteId) {
      setSavedNotes(prev => prev.map(n => n.id === editingNoteId ? {
        ...n,
        title: finalTitle,
        text: finalText,
        category: finalCategory,
        timestamp: Date.now()
      } : n));
    } else {
      const newNote: SavedNote = {
        id: 'note-' + Date.now(),
        sourceMsgId: 'user-custom',
        title: finalTitle,
        text: finalText,
        category: finalCategory,
        timestamp
      };
      setSavedNotes(prev => [newNote, ...prev]);
    }

    setIsCreatingNote(false);
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory('Observation');
    setAiRefineSuccess(false);
  };

  const filteredSavedNotes = useMemo(() => {
    if (!notesSearchQuery.trim()) return savedNotes;
    const q = notesSearchQuery.toLowerCase();
    return savedNotes.filter(n => 
      (n.title && n.title.toLowerCase().includes(q)) || 
      (n.text && n.text.toLowerCase().includes(q)) || 
      (n.category && n.category.toLowerCase().includes(q))
    );
  }, [savedNotes, notesSearchQuery]);

  const [aiRefineCoT, setAiRefineCoT] = useState<string | null>(null);
  const [isNotePreview, setIsNotePreview] = useState(false);

  const handleAiRefineNote = async () => {
    if (!noteContent.trim() || isAiRefining) return;
    playTapSound();
    setIsAiRefining(true);
    setAiRefineSuccess(false);
    setAiRefineCoT(null);

    const draftText = noteContent.trim();
    const prompt = `Please refine the following scientific research note into a high-quality Markdown document with LaTeX math formatting.\nIMPORTANT: First, output a concise explanation of what you are doing inside <think>...</think> tags. Keep the thought to exactly 3-6 words, starting with a verb (e.g. "Formatting equations...", "Refining scholarly tone..."). Then, output ONLY the final refined note text outside the tags. Do NOT include any conversational filler.\n\nNOTE TO REFINE:\n${draftText}`;

    try {
      const systemInstruction = `You are the Stellar Historian research refinement engine.
Your task: Directly refine, clarify, format, and enhance the user's scientific research note with rigorous scientific precision, clean Markdown structure, and standard LaTeX notation for mathematical equations ($...$ or $$...$$).
STRICT INSTRUCTION: DO NOT use ANY emojis under any circumstances. Emojis are strictly prohibited. Output your brief 3-6 word plan inside <think>...</think>, then output the refined, polished research note directly in Markdown and LaTeX. Do NOT include any conversational filler, greetings, explanations, commentary, preamble, or postscript questions.`;

      const response = await fetch('/api/ai/stream-refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          apiKey
        })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let isThinking = false;
      let thinkBuffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.error) throw new Error(data.error);
              if (data.text) {
                fullText += data.text;
                
                // Parse think tag
                if (fullText.includes('<think>') && !fullText.includes('</think>')) {
                  isThinking = true;
                  const thinkStart = fullText.indexOf('<think>') + 7;
                  setAiRefineCoT(fullText.slice(thinkStart).trim());
                } else if (fullText.includes('</think>')) {
                  isThinking = false;
                  const thinkStart = fullText.indexOf('<think>') + 7;
                  const thinkEnd = fullText.indexOf('</think>');
                  if (thinkStart > 6 && thinkEnd > thinkStart) {
                     setAiRefineCoT(fullText.slice(thinkStart, thinkEnd).trim());
                  }
                  
                  const refinedText = fullText.slice(fullText.indexOf('</think>') + 8).trim();
                  // We update the content live so the user can see it stream in
                  if (refinedText) {
                     setNoteContent(refinedText);
                  }
                } else if (!fullText.includes('<think>')) {
                  setNoteContent(fullText.trim());
                }
              }
            } catch (e) {
              // ignore parse errors for split chunks
            }
          }
        }
      }
      
      // Final save to history after stream
      const finalCleanText = fullText.includes('</think>') 
         ? fullText.slice(fullText.indexOf('</think>') + 8).trim() 
         : fullText.trim();
         
      setContentWithHistory(finalCleanText);
      setAiRefineSuccess(true);
      setTimeout(() => setAiRefineSuccess(false), 4500);

    } catch (err) {
      console.error('Note AI refine error:', err);
    } finally {
      setIsAiRefining(false);
      // Keep CoT visible for 2 seconds after finishing, then fade it
      setTimeout(() => setAiRefineCoT(null), 3000);
    }
  };

  const exportTranscript = () => {
    playTapSound();
    const lines = [
      '# Stellar Historian - Cosmic Research Log',
      `*Generated on ${new Date().toLocaleString()}*`,
      '',
      `**Target Context:** ${currentPlanet ? currentPlanet.toUpperCase() : 'General Astrophysics'}`,
      '',
      '---',
      ''
    ];

    messages.forEach(m => {
      lines.push(`### ${m.role === 'user' ? 'Commander Inquiry' : 'Stellar Historian Dossier'} (${new Date(m.timestamp).toLocaleTimeString()})`);
      lines.push(m.text);
      lines.push('');
    });

    const fullDoc = lines.join('\n');
    navigator.clipboard.writeText(fullDoc);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2500);
  };

  const sendQuestionForHistory = async (overridePrompt?: string, isVoice: boolean = false) => {
    setIsLoading(true);
    setStreamingText('');

    let fullText = "";

    try {
      const currentStatusStr = currentSettings 
        ? `\nCURRENT SIMULATOR SETTINGS STATUS:
- Selected/Focused Celestial Body ID: ${currentSettings.selectedPlanetId ? `"${currentSettings.selectedPlanetId}"` : 'None (no body is focused)'}
- Graphics Quality Preset (graphicsPreset): ${currentSettings.graphicsPreset ? currentSettings.graphicsPreset.toUpperCase() : 'HIGH'}
- FSR / Resolution Scale (resScale): ${currentSettings.resScale !== undefined ? (currentSettings.resScale >= 0.999 ? '1.0 (Native/Off)' : currentSettings.resScale === 0.85 ? '0.85 (Ultra Quality)' : currentSettings.resScale === 0.75 ? '0.75 (Quality)' : currentSettings.resScale === 0.67 ? '0.67 (Balanced)' : currentSettings.resScale === 0.50 ? '0.50 (Performance)' : currentSettings.resScale) : '1.0'}
- Performance Mode (perfMode): ${currentSettings.perfMode ? 'ENABLED' : 'DISABLED'}
- High Definition (HD) Textures (hdMode): ${currentSettings.hdMode ? 'ENABLED' : 'DISABLED'}
- Bloom Lighting Glow (enableBloom): ${currentSettings.enableBloom !== false ? 'ENABLED' : 'DISABLED'}
- Chromatic Aberration (enableChromatic): ${currentSettings.enableChromatic !== false ? 'ENABLED' : 'DISABLED'}
- Orbit Lines (showOrbits): ${currentSettings.showOrbits ? 'ENABLED' : 'DISABLED'}
- Celestial Names/Labels (showLabels): ${currentSettings.showLabels ? 'ENABLED' : 'DISABLED'}
- Asteroid Belt & Comets (showAsteroids): ${currentSettings.showAsteroids ? 'ENABLED' : 'DISABLED'}
- Constellation Grid Lines (showConstellations): ${currentSettings.showConstellations ? 'ENABLED' : 'DISABLED'}
- Active Spacecraft Trackers (showSpacecraft): ${currentSettings.showSpacecraft ? 'ENABLED' : 'DISABLED'}
- Temperature Unit (tempUnit): ${currentSettings.tempUnit === 'K' ? 'Kelvin (K)' : `°${currentSettings.tempUnit}`}
- Simulator Language (lang): "${currentSettings.lang}"
- Simulation Speed Multiplier (speedMultiplier): ${currentSettings.speedMultiplier}x ${currentSettings.speedMultiplier === 0 ? '(PAUSED)' : ''}
`
        : "";

      const systemInstruction = `You are the "Stellar Historian", an expert astrophysics and space intelligence AI assistant embedded into the WebGPU solar system simulator, endowed with full direct control over the entire simulation engine.
CRITICAL RULE: DO NOT use ANY emojis or emoticons in your response under any circumstances. Emojis are strictly prohibited.
Communication Style: Approachable, warm, curious, and concise. Explain fascinating cosmic phenomena with genuine scientific curiosity and engaging clarity while remaining focused and direct. Avoid dry academic roboticism, introductory pleasantries, preambles, and repetitive disclaimers. Prioritize clear physical principles, exact numerical parameters, and rich scientific depth using structured markdown headers (###) and bullet points.
Tables Guidance: Only use Markdown tables when genuinely helpful for structured comparison, multi-parameter spec sheets, or multi-item metrics (e.g. comparing planets, telescope specs, mission timelines). Do NOT force tables for standard conceptual explanations, narrative history, or single-topic answers.
Formatting: Use standard clean Markdown. When writing scientific units or formulas, standard LaTeX notation ($...$ or $$...$$) is fully supported and rendered via KaTeX.

CRITICAL FACTUALITY & WEB GROUNDING DIRECTIVE:
You MUST ALWAYS rely exclusively on verified, real-world scientific data, published astrophysics literature, and live web search results instead of guessing, fabricating, or assuming unverified facts.
When Web Search (@Web) is triggered or live web search findings are provided:
1. Synthesize your response using the verified search results alongside core physics principles.
2. YOU MUST CITE YOUR SOURCES INLINE using bracketed numbers like [1], [2], etc., matching the exact sourceIndex of the provided search results.
3. NEVER fabricate numbers, dates, mission parameters, or non-existent URLs/papers. If information is uncertain or not found in search results, explicitly state the limitation.

Factuality & Nature: Focus directly on answering the user's scientific or simulation inquiry. Only discuss your AI identity, non-human nature, or potential for hallucinations if the user explicitly asks about your identity or challenges your nature.

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

      const isWebSearch = overridePrompt ? checkIsWebSearchMention(overridePrompt) : checkIsWebSearchMention(input);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: chatHistory.current,
          systemInstruction,
          apiKey,
          provider: aiModelName,
          webSearch: isWebSearch
        })
      });
      
      let searchSources: SearchSource[] | undefined = undefined;
      let isWebSearchGrounded = false;
      let searchQuery = '';

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          fullText = data.text;
          setStreamingText(fullText);
        }
        if (data.sources && Array.isArray(data.sources)) {
          searchSources = data.sources;
        }
        isWebSearchGrounded = Boolean(data.isWebSearchGrounded);
        searchQuery = data.searchQuery || '';
      } else {
        throw new Error('API response not ok');
      }

      const { cleanedText, actions: actionsToExecute } = parseAIActionsAndCleanText(fullText);

      // Generate contextual follow-up ideas
      const followUps: string[] = [];
      if (cleanedText.toLowerCase().includes('mars')) {
        followUps.push('Olympus Mons vs Everest', 'Ancient Martian water evidence');
      } else if (cleanedText.toLowerCase().includes('jupiter') || cleanedText.toLowerCase().includes('europa')) {
        followUps.push('Europa subsurface ocean', 'Jupiter metallic hydrogen core');
      } else if (cleanedText.toLowerCase().includes('black hole') || cleanedText.toLowerCase().includes('event horizon')) {
        followUps.push('Spaghetti effect & Tidal forces', 'Hawking radiation mechanism');
      } else if (cleanedText.toLowerCase().includes('saturn') || cleanedText.toLowerCase().includes('titan')) {
        followUps.push('Titan methane lakes', 'Saturn ring lifespan');
      } else {
        followUps.push('Cosmic distance scale', 'How stars forge heavy elements');
      }

      const modelMsgId = Date.now().toString();
      const modelMsg: Message = {
        id: modelMsgId,
        role: 'model',
        text: cleanedText,
        timestamp: Date.now(),
        pendingActions: actionsToExecute.length > 0 ? actionsToExecute : undefined,
        actionStatus: actionsToExecute.length > 0 ? 'pending' : undefined,
        suggestedFollowUps: followUps.slice(0, 2),
        sources: searchSources,
        isWebSearchGrounded,
        searchQuery
      };

      setMessages(prev => [...prev, modelMsg]);
      chatHistory.current.push({ role: 'assistant', content: cleanedText });
      setStreamingText('');
      
    } catch (error) {
      console.error("AI Researcher Error:", error);
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'model',
        text: isVoice ? "Sorry, I didn't get that." : "Signal disrupted. Try again later.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const noticeDisclaimer = "Notice: I'm an artificial intelligence assistant, not a real person. AI-generated responses can occasionally hallucinate or make errors. Always verify mission-critical parameters with verified astrophysics sources.";

      const getWelcomeMsg = () => currentPlanet 
        ? `### Stellar Historian • Target: **${currentPlanet.toUpperCase()}**\nTelemetry locked onto **${currentPlanet}**. How can I assist your exploration of ${currentPlanet} or astrophysics today?\n\n*Select a prompt chip below or type an inquiry.*\n\n> ${noticeDisclaimer}`
        : `### Stellar Historian\nWelcome, Commander. The Encyclopedia Galactica is synchronized. Query celestial mechanics, astrophysics, historic missions, or simulator controls.\n\n*What cosmic realm shall we explore today?*\n\n> ${noticeDisclaimer}`;

      if (initialQuestion && processedQuestionRef.current !== initialQuestion) {
        processedQuestionRef.current = initialQuestion;
        
        const welcomeMsg = getWelcomeMsg();
        const initWelcome: Message = {
          id: 'welcome-' + Date.now(),
          role: 'model',
          text: welcomeMsg,
          timestamp: Date.now(),
          suggestedFollowUps: ['Explain orbital mechanics', 'Show historic missions']
        };

        const userMsg: Message = {
          id: 'user-' + Date.now(),
          role: 'user',
          text: initialQuestion,
          timestamp: Date.now() + 1
        };

        setMessages([initWelcome, userMsg]);
        chatHistory.current = [{ role: 'user', content: initialQuestion }];
        setActiveTab('dialogue');
        sendQuestionForHistory(initialQuestion);
      } else if (!initialQuestion && messages.length === 0) {
        const welcomeMsg = getWelcomeMsg();
        setMessages([{
          id: 'welcome',
          role: 'model',
          text: welcomeMsg,
          timestamp: Date.now(),
          suggestedFollowUps: ['How did the solar system form?', 'Target Sagittarius A*']
        }]);
      }
    } else {
      processedQuestionRef.current = null;
    }
  }, [isOpen, initialQuestion, currentPlanet]);

  const handleSend = async (customText?: string, isVoice: boolean = false) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    if (isListening) {
      recognitionRef.current?.stop();
      stopWaveform();
      setIsListening(false);
    }

    const userText = textToSend.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    chatHistory.current.push({ role: 'user', content: userText });
    setUserQueryHistory(prev => [userText, ...prev.slice(0, 19)]);
    setHistoryIndex(-1);
    
    setInput('');
    playTapSound();
    setActiveTab('dialogue');

    await sendQuestionForHistory(userText, isVoice);
  };

  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    const match = val.match(/(?:^|\s)@([a-zA-Z0-9_\s]*)$/);
    if (match) {
      setMentionFilter(match[1]);
      setIsMentionMenuOpen(true);
      setMentionSelectedIndex(0);
    } else {
      setIsMentionMenuOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isMentionMenuOpen && filteredMentionOptions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionSelectedIndex(prev => (prev + 1) % filteredMentionOptions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionSelectedIndex(prev => (prev - 1 + filteredMentionOptions.length) % filteredMentionOptions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredMentionOptions[mentionSelectedIndex]) {
          handleSelectMention(filteredMentionOptions[mentionSelectedIndex].trigger);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsMentionMenuOpen(false);
        return;
      }
    }

    if (e.key === 'Enter') {
      handleSend();
    } else if (e.key === 'ArrowUp') {
      if (userQueryHistory.length > 0) {
        const nextIdx = Math.min(historyIndex + 1, userQueryHistory.length - 1);
        setHistoryIndex(nextIdx);
        setInput(userQueryHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(userQueryHistory[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const clearChat = () => {
    playTapSound();
    setMessages(prev => prev.length > 0 ? [prev[0]] : []);
    chatHistory.current = [];
    setStreamingText('');
  };

  // Filtered Dossiers
  const filteredDossiers = useMemo(() => {
    return CELESTIAL_DOSSIERS.filter(d => {
      const matchCat = dossierCategory === 'All' || d.category === dossierCategory;
      const matchSearch = !dossierSearch || 
        d.name.toLowerCase().includes(dossierSearch.toLowerCase()) || 
        d.type.toLowerCase().includes(dossierSearch.toLowerCase()) ||
        d.summary.toLowerCase().includes(dossierSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [dossierCategory, dossierSearch]);

  const activeDossier = useMemo(() => {
    return CELESTIAL_DOSSIERS.find(d => d.id === selectedDossierId) || CELESTIAL_DOSSIERS[0];
  }, [selectedDossierId]);

  // Filtered Missions
  const filteredMissions = useMemo(() => {
    return SPACE_MISSIONS.filter(m => {
      const matchCat = missionCategory === 'All' || m.category === missionCategory;
      const matchSearch = !missionSearch || 
        m.name.toLowerCase().includes(missionSearch.toLowerCase()) ||
        m.target.toLowerCase().includes(missionSearch.toLowerCase()) ||
        m.agency.toLowerCase().includes(missionSearch.toLowerCase()) ||
        m.description.toLowerCase().includes(missionSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [missionCategory, missionSearch]);

  // Dynamic Prompt Chips based on current context
  const contextualPrompts = useMemo(() => {
    if (currentPlanet) {
      const planetDossier = CELESTIAL_DOSSIERS.find(d => d.id.toLowerCase() === currentPlanet.toLowerCase());
      if (planetDossier && planetDossier.suggestedQuestions.length > 0) {
        return planetDossier.suggestedQuestions.slice(0, 3);
      }
    }
    return [
      'Explain Gravitational Lensing around Black Holes',
      'What caused Venus to undergo a runaway greenhouse effect?',
      'How does the Sun generate energy via nuclear fusion?'
    ];
  }, [currentPlanet]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="ai-researcher-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: uiAnimations ? 0.2 / uiAnimSpeed : 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 lg:p-6 ui-layer"
        >
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: uiAnimations ? 0.2 / uiAnimSpeed : 0 }}
            onClick={() => { playTapSound(); onClose(); }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto"
          />

          {/* Main Modal Shell */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={uiAnimations ? { duration: 0.22 / uiAnimSpeed, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
            className="panel relative w-full max-w-5xl xl:max-w-6xl h-[90vh] max-h-[880px] flex flex-col dual-kawase-glass glass-specular border border-white/20 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto z-10 select-none"
          >
            <div className="w-full h-full flex flex-col min-h-0 relative z-10">
              
              {/* Top Header & Telemetry Status */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-3.5 bg-slate-950/20 border-b border-white/10 z-30 shrink-0 gap-3">
                {/* Brand & Subtle Powered By Tag */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-base font-bold tracking-tight text-slate-100 flex items-center gap-2">
                        Stellar Historian
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-white/20 text-slate-200" title="EU AI Act Art. 50: Artificial Intelligence System">
                          AI
                        </span>
                      </h2>
                      <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded-md bg-slate-900/90 border border-white/10">
                        Powered by {aiModelName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-light">
                      <span>Encyclopedia Galactica & Space AI Assistant</span>
                    </p>
                  </div>
                </div>

                {/* Subsystem Telemetry & Controls */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Context Target Badge */}
                  {currentPlanet && (
                    <button
                      onClick={() => {
                        playTapSound();
                        const match = CELESTIAL_DOSSIERS.find(d => d.id.toLowerCase() === currentPlanet.toLowerCase());
                        if (match) {
                          setSelectedDossierId(match.id);
                          setActiveTab('dossiers');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-slate-300 text-xs font-mono hover:bg-slate-800 hover:text-slate-100 transition-all"
                      title="Click to view Dossier"
                    >
                      <Orbit className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[120px]">{currentPlanet.toUpperCase()}</span>
                    </button>
                  )}

                  {/* Actions Deck */}
                  <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
                    {/* Transcript Export */}
                    <button
                      onPointerDown={() => playTapSound()}
                      onClick={exportTranscript}
                      disabled={messages.length <= 1}
                      className={`p-1.5 rounded-lg transition-all ${
                        copiedTranscript 
                          ? 'bg-slate-800 text-slate-200 border border-white/10' 
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                      title="Copy Full Research Transcript"
                    >
                      {copiedTranscript ? <Check className="w-4 h-4 text-slate-300" /> : <Share2 className="w-4 h-4 text-slate-400" />}
                    </button>

                    {/* Clear Chat */}
                    <button 
                      onPointerDown={() => playTapSound()}
                      onClick={clearChat}
                      className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-all active:scale-[0.96]"
                      title="Reset Dialogue History"
                    >
                      <RefreshCcw className="w-4 h-4 text-slate-400" />
                    </button>

                    {/* Close Button */}
                    <button 
                      onPointerDown={() => playTapSound()}
                      onClick={onClose}
                      className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-all active:scale-[0.96]"
                      title="Close Historian"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mode Segmented Switcher Tab Bar */}
              <div className="flex items-center px-5 py-2 bg-slate-950/40 border-b border-white/5 shrink-0 overflow-x-auto scrollbar-none gap-2">
                <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-white/5 w-full sm:w-auto">
                  <button
                    onClick={() => { playTapSound(); setActiveTab('dialogue'); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'dialogue'
                        ? 'bg-slate-800 text-white shadow-sm border border-white/10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    <span>Research Dialogue</span>
                  </button>

                  <button
                    onClick={() => { playTapSound(); setActiveTab('dossiers'); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'dossiers'
                        ? 'bg-slate-800 text-white shadow-sm border border-white/10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Celestial Dossiers</span>
                  </button>

                  <button
                    onClick={() => { playTapSound(); setActiveTab('expeditions'); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'expeditions'
                        ? 'bg-slate-800 text-white shadow-sm border border-white/10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Rocket className="w-3.5 h-3.5 text-slate-400" />
                    <span>Expeditions Log</span>
                  </button>

                  <button
                    onClick={() => { playTapSound(); setActiveTab('phenomena'); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'phenomena'
                        ? 'bg-slate-800 text-white shadow-sm border border-white/10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Atom className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cosmic Phenomena</span>
                  </button>

                  <button
                    onClick={() => { playTapSound(); setActiveTab('notes'); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'notes'
                        ? 'bg-slate-800 text-white shadow-sm border border-white/10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                    <span>Saved Notes ({savedNotes.length})</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: RESEARCH DIALOGUE */}
              {activeTab === 'dialogue' && (
                <div className="flex-1 flex flex-col min-h-0 relative">
                  
                  {/* Messages Stream Area */}
                  <div 
                    ref={scrollRef}
                    className="relative flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 space-y-6 scrollbar-thin z-20"
                  >
                    <div className="flex flex-col gap-6">
                      {messages.map((msg) => {
                        const isUser = msg.role === 'user';
                        const isSpeaking = speakingMsgId === msg.id;
                        const isSaved = savedNotes.some(n => n.sourceMsgId === msg.id);

                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={uiAnimations ? { duration: 0.25 / uiAnimSpeed, ease: "easeOut" } : { duration: 0 }}
                            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex gap-3.5 max-w-[92%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                              
                              {/* Avatar */}
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                isUser 
                                  ? 'bg-slate-800/80 border-white/20 text-slate-200 shadow-sm' 
                                  : 'bg-slate-900/90 border-white/10 text-slate-300 shadow-sm'
                              }`}>
                                {isUser ? <User className="w-4 h-4 text-slate-300" /> : <Bot className="w-4 h-4 text-slate-300" />}
                              </div>

                              {/* Message Content Bubble */}
                              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                <div className={`relative px-5 py-4 rounded-2xl shadow-xl transition-all select-text cursor-text ${
                                  isUser
                                    ? 'bg-slate-900/95 border border-white/15 text-slate-100 rounded-tr-none'
                                    : 'bg-slate-900/80 text-slate-200 border border-white/10 rounded-tl-none'
                                }`}>
                                  {/* Markdown Body */}
                                  <div className="text-[13.5px] leading-relaxed font-light tracking-wide text-slate-200 select-text cursor-text">
                                    <Markdown
                                      remarkPlugins={[remarkGfm, remarkMath]}
                                      rehypePlugins={[rehypeKatex]}
                                      components={{
                                        p: ({node, ...props}) => <p className="mb-2.5 last:mb-0" {...props} />,
                                        strong: ({node, ...props}) => <strong className="font-semibold text-slate-100" {...props} />,
                                        em: ({node, ...props}) => <em className="italic text-slate-300 font-mono text-[13px]" {...props} />,
                                        h1: ({node, ...props}) => <h1 className="text-base font-bold mt-4 mb-2 text-slate-100 flex items-center gap-2 border-b border-white/10 pb-1" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-sm font-bold mt-3 mb-1.5 text-slate-100" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-3 mb-1" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2.5 space-y-1 text-slate-300" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2.5 space-y-1 text-slate-300" {...props} />,
                                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-slate-500/60 pl-3 my-2 text-slate-300 italic bg-slate-900/40 py-1 rounded-r-lg font-light" {...props} />,
                                        table: ({node, ...props}) => (
                                          <div className="overflow-x-auto my-3.5 rounded-xl border border-white/15 bg-slate-950/60 shadow-lg">
                                            <table className="w-full text-xs text-left divide-y divide-white/10 border-collapse" {...props} />
                                          </div>
                                        ),
                                        thead: ({node, ...props}) => <thead className="bg-slate-800/90 text-slate-200" {...props} />,
                                        tbody: ({node, ...props}) => <tbody className="divide-y divide-white/5 bg-slate-900/30" {...props} />,
                                        tr: ({node, ...props}) => <tr className="hover:bg-white/[0.04] transition-colors" {...props} />,
                                        th: ({node, ...props}) => <th className="px-3.5 py-2.5 font-semibold text-slate-100 tracking-wide border-r border-white/5 last:border-r-0 whitespace-nowrap" {...props} />,
                                        td: ({node, ...props}) => <td className="px-3.5 py-2.5 text-slate-300 border-r border-white/5 last:border-r-0 align-top font-light leading-relaxed" {...props} />,
                                        code: ({node, className, children, ...props}) => {
                                          const match = /language-(\w+)/.exec(className || '');
                                          const isInline = !match && !String(children).includes('\n');
                                          if (isInline) {
                                            return <code className="bg-slate-800 px-1.5 py-0.5 rounded text-[11.5px] font-mono text-slate-200 border border-white/10" {...props}>{children}</code>;
                                          }
                                          return <code className="block bg-slate-950 p-3 rounded-xl text-[12px] font-mono text-slate-300 my-2 overflow-x-auto whitespace-pre-wrap border border-white/10" {...props}>{children}</code>;
                                        },
                                      }}
                                    >
                                      {msg.text}
                                    </Markdown>
                                  </div>

                                  {/* Web Grounding & Verified Citations Section */}
                                  {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
                                      <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <button
                                          type="button"
                                          onClick={() => toggleExpandSources(msg.id)}
                                          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950/60 hover:bg-slate-950/90 border border-white/10 text-xs text-slate-300 hover:text-white transition-all group active:scale-[0.98]"
                                        >
                                          <Globe className="w-3.5 h-3.5 text-slate-300 animate-pulse shrink-0" />
                                          <span className="font-medium text-slate-200">
                                            {expandedSourcesMsgIds.has(msg.id) ? 'Hide' : 'View'} Live Grounding Sources ({msg.sources.length})
                                          </span>
                                          {expandedSourcesMsgIds.has(msg.id) ? (
                                            <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                                          ) : (
                                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                                          )}
                                        </button>

                                        {msg.searchQuery && (
                                          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-flex items-center gap-1 bg-slate-950/40 px-2 py-0.5 rounded border border-white/5 truncate max-w-[240px]">
                                            Query: "{msg.searchQuery}"
                                          </span>
                                        )}
                                      </div>

                                      {expandedSourcesMsgIds.has(msg.id) && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1"
                                        >
                                          {msg.sources.map((src, sIdx) => (
                                            <a
                                              key={sIdx}
                                              href={src.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-white/10 hover:border-white/20 transition-all flex flex-col gap-1 text-left group"
                                            >
                                              <div className="flex items-center justify-between gap-1.5">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 border border-white/10 shrink-0">
                                                    [{src.sourceIndex || sIdx + 1}]
                                                  </span>
                                                  <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                                                    {src.title}
                                                  </span>
                                                </div>
                                                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0" />
                                              </div>
                                              {src.snippet && (
                                                <p className="text-[11px] text-slate-400 font-light line-clamp-2 leading-relaxed">
                                                  {src.snippet}
                                                </p>
                                              )}
                                              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono pt-0.5">
                                                <Globe className="w-3 h-3 text-slate-400" />
                                                <span className="truncate">{src.domain || 'Verified Source'}</span>
                                              </div>
                                            </a>
                                          ))}
                                        </motion.div>
                                      )}
                                    </div>
                                  )}

                                  {/* Simulator Actions Prompt & Badges */}
                                  {msg.role === 'model' && (
                                    (msg.actionStatus === 'pending' && msg.pendingActions && msg.pendingActions.length > 0) ||
                                    (msg.actionStatus === 'approved' || (!msg.actionStatus && msg.executedActions && msg.executedActions.length > 0)) ||
                                    (msg.actionStatus === 'rejected')
                                  ) && (
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                      {/* PENDING APPROVAL PROMPT */}
                                      {msg.actionStatus === 'pending' && msg.pendingActions && msg.pendingActions.length > 0 && (
                                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-lg font-sans text-slate-200">
                                          <div className="flex items-center gap-1.5 mb-2.5 text-slate-300 text-[11px] font-mono font-semibold uppercase tracking-wider">
                                            <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>Proposed Action</span>
                                          </div>

                                          <div className="space-y-1.5 mb-3">
                                            {msg.pendingActions.map((act, idx) => {
                                              const info = getDispatchedActionInfo(act);
                                              return (
                                                <div 
                                                  key={idx}
                                                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] font-mono"
                                                >
                                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                                  <span className="text-slate-400">{info.label}:</span>
                                                  <span className="font-semibold text-slate-200">{info.details}</span>
                                                </div>
                                              );
                                            })}
                                          </div>

                                          <div className="flex items-center justify-end gap-2">
                                            <button
                                              type="button"
                                              onClick={() => handleRejectActions(msg.id)}
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-sm"
                                            >
                                              <X className="w-3.5 h-3.5 text-slate-400" />
                                              Reject
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleApproveActions(msg.id)}
                                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-white text-slate-950 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
                                            >
                                              <Check className="w-3.5 h-3.5 text-slate-950" />
                                              Approve
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* APPROVED / DISPATCHED BADGES */}
                                      {(msg.actionStatus === 'approved' || (!msg.actionStatus && msg.executedActions && msg.executedActions.length > 0)) && (
                                        <div className="flex flex-wrap gap-2 items-center">
                                          <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1 font-semibold mr-0.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Action Dispatched:
                                          </span>
                                          {msg.executedActions?.map((act, idx) => {
                                            const info = getDispatchedActionInfo(act);
                                            return (
                                              <div 
                                                key={idx}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-mono shadow-sm"
                                              >
                                                <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="text-slate-400">{info.label}:</span>
                                                <span className="font-semibold text-slate-200">{info.details}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                      {/* REJECTED BADGES */}
                                      {msg.actionStatus === 'rejected' && (
                                        <div className="flex flex-wrap gap-2 items-center">
                                          <span className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1 font-semibold mr-0.5">
                                            <X className="w-3.5 h-3.5 text-slate-500" /> Action Rejected:
                                          </span>
                                          {msg.pendingActions?.map((act, idx) => {
                                            const info = getDispatchedActionInfo(act);
                                            return (
                                              <div 
                                                key={idx}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/60 border border-slate-800 text-slate-400 text-[11px] font-mono shadow-sm opacity-60"
                                              >
                                                <X className="w-3.5 h-3.5 text-slate-500 shrink-0" />
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

                                {/* Message Footer Actions */}
                                <div className={`flex items-center gap-2 px-1 text-[11px] text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                                  {!isUser && (
                                    <>
                                      <span>•</span>
                                      {/* TTS Button */}
                                      {isTtsSupported && (
                                        <button
                                          onClick={() => toggleTts(msg.id, msg.text)}
                                          className={`inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors ${isSpeaking ? 'text-slate-100 font-semibold' : ''}`}
                                          title={isSpeaking ? 'Stop Audio Narration' : 'Read Aloud with Voice Synthesis'}
                                        >
                                          {isSpeaking ? (
                                            <>
                                              <Square className="w-3 h-3 text-slate-300 fill-current" />
                                              <span>Speaking...</span>
                                            </>
                                          ) : (
                                            <>
                                              <Volume2 className="w-3 h-3 text-slate-400" />
                                              <span>Listen</span>
                                            </>
                                          )}
                                        </button>
                                      )}

                                      <span>•</span>
                                      {/* Copy Button */}
                                      <button
                                        onClick={() => copyToClipboard(msg.text, msg.id)}
                                        className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                                        title="Copy response"
                                      >
                                        {copiedId === msg.id ? (
                                          <span className="text-slate-200 flex items-center gap-1 font-medium">
                                            <Check className="w-3 h-3 text-slate-300" /> Copied
                                          </span>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3 text-slate-400" />
                                            <span>Copy</span>
                                          </>
                                        )}
                                      </button>

                                      <span>•</span>
                                      {/* Bookmark / Note */}
                                      <button
                                        onClick={() => toggleSaveNote(msg)}
                                        className={`inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors ${isSaved ? 'text-slate-100 font-semibold' : ''}`}
                                        title={isSaved ? 'Remove from Saved Notes' : 'Save to Notes'}
                                      >
                                        {isSaved ? (
                                          <>
                                            <BookmarkCheck className="w-3 h-3 text-slate-300" />
                                            <span>Saved</span>
                                          </>
                                        ) : (
                                          <>
                                            <Bookmark className="w-3 h-3 text-slate-400" />
                                            <span>Save</span>
                                          </>
                                        )}
                                      </button>

                                      <span>•</span>
                                      {/* Append directly into Note Editor */}
                                      <button
                                        onClick={() => handleAppendTextToNote(msg.text, `Historian Insight: ${currentPlanet ? currentPlanet.toUpperCase() : 'Cosmic Observation'}`)}
                                        className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                                        title="Send/Paste this insight directly into Note editor"
                                      >
                                        <ClipboardPaste className="w-3 h-3 text-slate-400" />
                                        <span>Paste to Note</span>
                                      </button>
                                    </>
                                  )}
                                </div>

                                {/* Suggested Follow-up Chips */}
                                {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-1.5 ml-1">
                                    {msg.suggestedFollowUps.map((q, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => handleSend(q)}
                                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all group"
                                      >
                                        <span>{q}</span>
                                        <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-slate-200" />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                      
                      {/* Streaming Pending State */}
                      {streamingText && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="flex gap-3.5 max-w-[85%]">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/10 bg-slate-900/90 text-slate-300">
                              <Bot className="w-4 h-4 text-slate-300" />
                            </div>
                            <div className="relative px-5 py-4 rounded-2xl bg-slate-900/90 text-slate-200 border border-white/10 rounded-tl-none shadow-xl select-text cursor-text">
                              <div className="text-[13.5px] leading-relaxed font-light tracking-wide select-text cursor-text">
                                <Markdown 
                                  remarkPlugins={[remarkGfm, remarkMath]} 
                                  rehypePlugins={[rehypeKatex]}
                                  components={{
                                    p: ({node, ...props}) => <p className="mb-2.5 last:mb-0" {...props} />,
                                    strong: ({node, ...props}) => <strong className="font-semibold text-slate-100" {...props} />,
                                    em: ({node, ...props}) => <em className="italic text-slate-300 font-mono text-[13px]" {...props} />,
                                    h1: ({node, ...props}) => <h1 className="text-base font-bold mt-4 mb-2 text-slate-100 flex items-center gap-2 border-b border-white/10 pb-1" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-sm font-bold mt-3 mb-1.5 text-slate-100" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-3 mb-1" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2.5 space-y-1 text-slate-300" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2.5 space-y-1 text-slate-300" {...props} />,
                                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                    blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-slate-500/60 pl-3 my-2 text-slate-300 italic bg-slate-900/40 py-1 rounded-r-lg font-light" {...props} />,
                                    table: ({node, ...props}) => (
                                      <div className="overflow-x-auto my-3.5 rounded-xl border border-white/15 bg-slate-950/60 shadow-lg">
                                        <table className="w-full text-xs text-left divide-y divide-white/10 border-collapse" {...props} />
                                      </div>
                                    ),
                                    thead: ({node, ...props}) => <thead className="bg-slate-800/90 text-slate-200" {...props} />,
                                    tbody: ({node, ...props}) => <tbody className="divide-y divide-white/5 bg-slate-900/30" {...props} />,
                                    tr: ({node, ...props}) => <tr className="hover:bg-white/[0.04] transition-colors" {...props} />,
                                    th: ({node, ...props}) => <th className="px-3.5 py-2.5 font-semibold text-slate-100 tracking-wide border-r border-white/5 last:border-r-0 whitespace-nowrap" {...props} />,
                                    td: ({node, ...props}) => <td className="px-3.5 py-2.5 text-slate-300 border-r border-white/5 last:border-r-0 align-top font-light leading-relaxed" {...props} />,
                                  }}
                                >
                                  {streamingText + (streamingText.endsWith('\n') ? '' : ' ▍')}
                                </Markdown>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Loading Radar */}
                      {isLoading && !streamingText && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="flex gap-3 items-center ml-12 p-3 bg-slate-900/70 border border-white/10 rounded-xl shadow-lg">
                            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                            <span className="text-xs text-slate-300 font-mono tracking-wider">
                              Thinking...
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Contextual Quick Starters & Prompt Carousel */}
                  <div className="px-5 py-2 bg-slate-950/40 border-t border-white/5 z-30 shrink-0">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 shrink-0 font-mono flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-slate-400" /> Starters:
                      </span>
                      {contextualPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => { playTapSound(); handleSend(prompt); }}
                          disabled={isLoading}
                          className="shrink-0 text-xs font-light px-3 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <span>{prompt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dialogue Input Deck */}
                  <div className="relative p-4 sm:p-5 border-t border-white/10 bg-slate-950/40 z-30 shrink-0">
                    <div className="relative flex items-center gap-2.5">
                      
                      {/* '+' Action Menu Button on Far Left */}
                      <div className="relative shrink-0" ref={actionMenuRef}>
                        <button
                          type="button"
                          onClick={() => {
                            playTapSound();
                            setIsActionMenuOpen(prev => !prev);
                          }}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-200 shadow-md ${
                            isActionMenuOpen 
                              ? 'bg-slate-800 border-white/30 text-white ring-2 ring-slate-400/40 scale-100' 
                              : 'bg-slate-900/80 hover:bg-slate-800 border-white/15 hover:border-white/25 text-slate-300 hover:text-white active:scale-95'
                          }`}
                          title="Force Simulation Directive / LLM Actions"
                          aria-label="Force Simulation Directive"
                        >
                          <Plus className={`w-5 h-5 transition-transform duration-200 ${isActionMenuOpen ? 'rotate-45 text-white' : ''}`} />
                        </button>

                        {/* Upward Dropdown Menu */}
                        <AnimatePresence>
                          {isActionMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 12, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.96 }}
                              transition={{ duration: 0.16 }}
                              className="!absolute bottom-[calc(100%+16px)] left-0 w-80 sm:w-96 max-w-[calc(100vw-3rem)] max-h-[460px] bg-slate-900/80 dual-kawase-glass border border-white/20 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col z-[100] text-slate-200 pointer-events-auto"
                            >
                              {/* Menu Header */}
                              <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-slate-300 shrink-0" />
                                  <div>
                                    <h4 className="text-xs font-semibold text-white tracking-wide">
                                      Direct Action Dispatch
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-light">Force any action the LLM can dispatch</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => { playTapSound(); setIsActionMenuOpen(false); }}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Search & Category Filter */}
                              <div className="p-3 border-b border-white/10 bg-slate-950/30 space-y-2">
                                <div className="relative">
                                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                  <input
                                    type="text"
                                    value={actionSearchQuery}
                                    onChange={(e) => setActionSearchQuery(e.target.value)}
                                    placeholder="Filter celestial targets, simulation speed, presets..."
                                    className="w-full bg-slate-950/80 border border-white/10 rounded-lg py-1.5 pl-8 pr-7 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-white/30 transition-all font-light"
                                  />
                                  {actionSearchQuery && (
                                    <button
                                      type="button"
                                      onClick={() => setActionSearchQuery('')}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-0.5"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
                                  {(['All', 'Focus', 'Events', 'Speed', 'Graphics', 'Layers'] as const).map(cat => (
                                    <button
                                      key={cat}
                                      type="button"
                                      onClick={() => { playTapSound(); setActionCategoryFilter(cat); }}
                                      className={`shrink-0 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                                        actionCategoryFilter === cat
                                          ? 'bg-slate-800 text-white border border-white/20 shadow-sm'
                                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                      }`}
                                    >
                                      {cat}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Action Items List */}
                              <div className="overflow-y-auto max-h-[280px] p-2 space-y-1 scrollbar-thin">
                                {filteredForceActions.length === 0 ? (
                                  <div className="p-6 text-center text-xs text-slate-500">
                                    No actions match your search query.
                                  </div>
                                ) : (
                                  filteredForceActions.map(item => (
                                    <button
                                      key={item.id}
                                      type="button"
                                      onClick={() => handleForceDispatchAction(item.label, item.action, item.desc)}
                                      className="w-full p-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-800/80 border border-transparent hover:border-white/10 transition-all text-left group active:scale-[0.98]"
                                    >
                                      <div className="w-7 h-7 rounded-lg bg-slate-800/90 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-white/20 transition-colors">
                                        {item.icon}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-slate-200 group-hover:text-white flex items-center gap-1.5 truncate">
                                          <span>{item.label}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 group-hover:text-slate-300 font-light truncate">
                                          {item.desc}
                                        </div>
                                      </div>
                                      {item.badge && (
                                        <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 group-hover:text-slate-200">
                                          {item.badge}
                                        </span>
                                      )}
                                    </button>
                                  ))
                                )}
                              </div>

                              {/* Footer Info */}
                              <div className="px-3.5 py-2 bg-slate-950/60 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                <span>Commander Override Engine</span>
                                <span>{filteredForceActions.length} Actions Available</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Main Message Input Bar with Mention Dropdown */}
                      <div className="relative flex-1 flex items-center">
                        {/* Autocomplete Mention Menu for @Web (Detached, Floating & Minimalist) */}
                        <AnimatePresence>
                          {isMentionMenuOpen && filteredMentionOptions.length > 0 && (
                            <motion.div
                              ref={mentionMenuRef}
                              initial={{ opacity: 0, y: 8, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.98 }}
                              transition={{ duration: 0.12, ease: 'easeOut' }}
                              className="!absolute bottom-[calc(100%+12px)] left-0 w-72 sm:w-80 bg-slate-900/80 dual-kawase-glass border border-white/15 rounded-xl shadow-2xl shadow-black/80 overflow-hidden z-50 flex flex-col p-1"
                            >
                              <div className="px-2.5 py-1.5 border-b border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                <span className="flex items-center gap-1.5 font-medium">
                                  <Globe className="w-3 h-3 text-slate-400" />
                                  Directive
                                </span>
                                <span className="text-[9px] text-slate-500">Tab ↵</span>
                              </div>
                              <div className="pt-1">
                                {filteredMentionOptions.map((opt, idx) => (
                                  <button
                                    key={opt.trigger}
                                    type="button"
                                    onClick={() => handleSelectMention(opt.trigger)}
                                    className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between text-left transition-all ${
                                      mentionSelectedIndex === idx
                                        ? 'bg-white/10 text-white'
                                        : 'hover:bg-white/5 text-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span className="text-xs font-mono font-semibold text-slate-100">
                                        {opt.trigger}
                                      </span>
                                      <span className="text-xs text-slate-400 font-light truncate">
                                        {opt.label}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-light truncate pl-2 hidden sm:inline">
                                      {opt.desc}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="absolute left-4 pointer-events-none flex items-center justify-center z-10">
                          {isWebSearchActiveInInput ? (
                            <Globe className="w-4 h-4 text-white" strokeWidth={1.5} />
                          ) : !isListening && (
                            <Compass className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        
                        {isListening && (
                          <canvas ref={canvasRef} className="w-full h-full absolute inset-0 rounded-xl opacity-40 pointer-events-none z-0" width={600} height={50} />
                        )}
                        <input
                          ref={inputRef}
                          type="text"
                          value={input}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          placeholder={isListening ? (input ? "" : "Listening...") : (currentPlanet ? `Inquire about ${currentPlanet} or type @Web to browse...` : "Ask astrophysics question, type @Web, or issue command...")}
                          className="w-full bg-slate-900/80 dual-kawase-glass-subtle border border-white/15 rounded-xl py-3.5 pl-12 pr-20 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-500/60 transition-all font-light tracking-wide shadow-inner relative z-1"
                        />
                        
                        {/* Microphone Button (Speech to Text) */}
                        <button
                          type="button"
                          onClick={() => {
                            playTapSound();
                            toggleSpeechToText();
                          }}
                          className={`absolute right-10 p-2 rounded-lg transition-all z-10 ${
                            isListening
                              ? 'text-red-400'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          }`}
                          title="Voice Input (Speech-to-Text)"
                          aria-label="Voice Input"
                        >
                          {isListening ? (
                            <Mic className="w-4 h-4" />
                          ) : (
                            <MicOff className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => { playTapSound(); handleSend(); }}
                          disabled={!input.trim() || isLoading}
                          className={`absolute right-2 p-2 rounded-lg transition-all z-10 ${
                            input.trim() && !isLoading
                              ? 'bg-slate-800 border border-white/15 text-slate-200 hover:bg-slate-700 active:scale-[0.96] shadow-md font-semibold'
                              : 'text-slate-600 bg-slate-900/40 border border-transparent cursor-not-allowed opacity-40'
                          }`}
                          title="Send Transmission"
                        >
                          <Send className="w-4 h-4 text-slate-300" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-slate-500 font-mono">
                      <span>Tip: Use ↑ / ↓ for query history • Click + for direct simulation actions</span>
                      <span className="uppercase tracking-widest text-slate-600 font-semibold">ENCYCLOPEDIA GALACTICA</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CELESTIAL DOSSIERS */}
              {activeTab === 'dossiers' && (
                <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
                  
                  {/* Left Sidebar List */}
                  <div className="w-full md:w-72 lg:w-80 bg-slate-950/40 border-b md:border-b-0 md:border-r border-white/10 flex flex-col min-h-0 shrink-0">
                    
                    {/* Search & Categories */}
                    <div className="p-3.5 border-b border-white/10 space-y-2.5">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text"
                          value={dossierSearch}
                          onChange={(e) => setDossierSearch(e.target.value)}
                          placeholder="Search cosmic archives..."
                          className="w-full bg-slate-900/80 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-400/50"
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {(['All', 'Planet', 'Moon', 'Star', 'Black Hole'] as const).map(cat => (
                          <button
                            key={cat}
                            onClick={() => { playTapSound(); setDossierCategory(cat); }}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                              dossierCategory === cat 
                                ? 'bg-slate-800 text-slate-100 border border-white/15 shadow-sm' 
                                : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-white/5'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dossier Item List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
                      {filteredDossiers.map(dossier => {
                        const isSelected = dossier.id === selectedDossierId;
                        return (
                          <button
                            key={dossier.id}
                            onClick={() => {
                              playTapSound();
                              setSelectedDossierId(dossier.id);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all border ${
                              isSelected
                                ? 'bg-slate-800/90 border-white/20 text-white shadow-md'
                                : 'border-transparent text-slate-300 hover:bg-slate-900/60 hover:border-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span 
                                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                                style={{ backgroundColor: dossier.color }}
                              />
                              <div className="truncate">
                                <div className="text-xs font-semibold text-slate-100 truncate">{dossier.name}</div>
                                <div className="text-[10px] text-slate-400 truncate">{dossier.type}</div>
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Detailed Dossier Panel */}
                  <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-5 sm:p-7 space-y-6 scrollbar-thin bg-transparent">
                    {activeDossier && (
                      <div className="space-y-6">
                        
                        {/* Header Banner */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span 
                                className="w-4 h-4 rounded-full shadow-lg shrink-0"
                                style={{ backgroundColor: activeDossier.color }}
                              />
                              <h3 className="text-2xl font-bold text-slate-100 tracking-tight">
                                {activeDossier.name}
                              </h3>
                              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300 font-mono">
                                {activeDossier.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 font-light">{activeDossier.type}</p>
                          </div>

                          {/* Quick Interactive Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                playTapSound();
                                if (onExecuteAction) {
                                  onExecuteAction({ type: 'select_planet', id: activeDossier.id });
                                }
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/15 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <Orbit className="w-3.5 h-3.5 text-slate-400" />
                              <span>Focus in 3D</span>
                            </button>

                            <button
                              onClick={() => {
                                playTapSound();
                                handleSend(`Provide a deep scientific briefing on ${activeDossier.name}`);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/15 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                              <span>Ask Historian</span>
                            </button>

                            <button
                              onClick={() => {
                                const text = `### Celestial Dossier: ${activeDossier.name} (${activeDossier.type})\n${activeDossier.summary}\n\nKey Empirical Facts:\n${activeDossier.keyFacts.map(f => `- ${f}`).join('\n')}`;
                                handleAppendTextToNote(text, `${activeDossier.name} Research Dossier`);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/15 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                              title="Paste this dossier into Research Notes"
                            >
                              <ClipboardPaste className="w-3.5 h-3.5 text-slate-400" />
                              <span>Paste to Note</span>
                            </button>
                          </div>
                        </div>

                        {/* Physical Metric Parameters Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {activeDossier.distanceAu && (
                            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5">
                              <div className="text-[10px] font-mono text-slate-400 uppercase">Distance (Solar Center)</div>
                              <div className="text-xs font-semibold text-slate-200 mt-1">{activeDossier.distanceAu}</div>
                            </div>
                          )}
                          {activeDossier.radiusKm && (
                            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5">
                              <div className="text-[10px] font-mono text-slate-400 uppercase">Physical Radius</div>
                              <div className="text-xs font-semibold text-slate-200 mt-1">{activeDossier.radiusKm}</div>
                            </div>
                          )}
                          {activeDossier.mass && (
                            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5">
                              <div className="text-[10px] font-mono text-slate-400 uppercase">Total Mass</div>
                              <div className="text-xs font-semibold text-slate-200 mt-1">{activeDossier.mass}</div>
                            </div>
                          )}
                          {activeDossier.gravity && (
                            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5">
                              <div className="text-[10px] font-mono text-slate-400 uppercase">Surface Gravity</div>
                              <div className="text-xs font-semibold text-slate-200 mt-1">{activeDossier.gravity}</div>
                            </div>
                          )}
                          {activeDossier.tempRange && (
                            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5">
                              <div className="text-[10px] font-mono text-slate-400 uppercase">Thermal Profile</div>
                              <div className="text-xs font-semibold text-slate-200 mt-1">{activeDossier.tempRange}</div>
                            </div>
                          )}
                          {activeDossier.orbitalPeriod && (
                            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5">
                              <div className="text-[10px] font-mono text-slate-400 uppercase">Orbital Period</div>
                              <div className="text-xs font-semibold text-slate-200 mt-1">{activeDossier.orbitalPeriod}</div>
                            </div>
                          )}
                        </div>

                        {/* Atmosphere & Discovery */}
                        {activeDossier.atmosphere && (
                          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                              <Atom className="w-3.5 h-3.5 text-slate-400" /> Atmospheric Composition
                            </div>
                            <p className="text-xs text-slate-400 font-light leading-relaxed">{activeDossier.atmosphere}</p>
                          </div>
                        )}

                        {/* Scientific Overview Summary */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                            Scientific Abstract
                          </h4>
                          <p className="text-sm text-slate-300 font-light leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-white/5">
                            {activeDossier.summary}
                          </p>
                        </div>

                        {/* Key Empirical Facts */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                            Empirical Observations & Key Findings
                          </h4>
                          <div className="space-y-2">
                            {activeDossier.keyFacts.map((fact, idx) => (
                              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-white/5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                <span className="font-light leading-relaxed">{fact}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Suggested Questions */}
                        {activeDossier.suggestedQuestions.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                              Deep Inquiry Prompts
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {activeDossier.suggestedQuestions.map((q, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSend(q)}
                                  className="text-xs text-left px-3 py-1.5 rounded-lg bg-slate-950/90 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                                >
                                  <span>{q}</span>
                                  <ArrowUpRight className="w-3 h-3 text-slate-400 shrink-0" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: EXPEDITIONS & MISSION LOG */}
              {activeTab === 'expeditions' && (
                <div className="flex-1 flex flex-col min-h-0 p-5 sm:p-7 space-y-5 overflow-y-auto scrollbar-thin">
                  
                  {/* Category & Search Filter */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10 shrink-0">
                    <div className="flex flex-wrap gap-1.5">
                      {(['All', 'Flyby / Interstellar', 'Orbiter', 'Observatory', 'Crewed'] as const).map(cat => (
                        <button
                          key={cat}
                          onClick={() => { playTapSound(); setMissionCategory(cat); }}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            missionCategory === cat 
                              ? 'bg-slate-800 text-slate-100 border border-white/15 shadow-sm' 
                              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-white/5'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        value={missionSearch}
                        onChange={(e) => setMissionSearch(e.target.value)}
                        placeholder="Search mission archives..."
                        className="w-full bg-slate-900/80 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-400/50"
                      />
                    </div>
                  </div>

                  {/* Mission Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMissions.map((mission) => (
                      <div 
                        key={mission.id}
                        className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4 shadow-lg"
                      >
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold text-slate-100 tracking-tight">
                                  {mission.name}
                                </h4>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10">
                                  {mission.launchYear}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">{mission.agency} • {mission.category}</p>
                            </div>
                            
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border bg-slate-800/80 border-white/10 text-slate-300">
                              {mission.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 font-light leading-relaxed">
                            {mission.description}
                          </p>

                          {/* Historical Milestones */}
                          <div className="space-y-1.5 pt-2 border-t border-white/5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                              Key Milestones
                            </span>
                            {mission.milestones.map((m, idx) => (
                              <div key={idx} className="text-[11.5px] text-slate-400 font-light flex items-start gap-2">
                                <span className="text-slate-500">▹</span>
                                <span>{m}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-500 font-mono truncate max-w-[180px]">
                            Target: {mission.target}
                          </span>

                          <div className="flex items-center gap-2">
                            {mission.targetBodyId && (
                              <button
                                onClick={() => {
                                  playTapSound();
                                  if (onExecuteAction) {
                                    onExecuteAction({ type: 'select_planet', id: mission.targetBodyId });
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 text-xs font-mono flex items-center gap-1 transition-all"
                              >
                                <Rocket className="w-3 h-3 text-slate-400" /> Focus 3D
                              </button>
                            )}

                            <button
                              onClick={() => {
                                playTapSound();
                                handleSend(`Provide full mission history and scientific payload details for ${mission.name}`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 text-xs font-mono flex items-center gap-1 transition-all"
                            >
                              <Sparkles className="w-3 h-3 text-slate-400" /> Inquire
                            </button>

                            <button
                              onClick={() => {
                                const text = `### Mission Log: ${mission.name} (${mission.agency}, ${mission.launchYear})\n**Category:** ${mission.category} | **Target:** ${mission.target} | **Status:** ${mission.status}\n\n${mission.description}\n\n**Milestones:**\n${mission.milestones.map(m => `- ${m}`).join('\n')}`;
                                handleAppendTextToNote(text, `${mission.name} Mission Notes`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 text-xs font-mono flex items-center gap-1 transition-all"
                              title="Paste this mission log into Research Notes"
                            >
                              <ClipboardPaste className="w-3 h-3 text-slate-400" /> Paste to Note
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: COSMIC PHENOMENA */}
              {activeTab === 'phenomena' && (
                <div className="flex-1 flex flex-col min-h-0 p-5 sm:p-7 space-y-5 overflow-y-auto scrollbar-thin">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Astrophysics & Fundamental Physics Lab</h3>
                    <p className="text-xs text-slate-400 font-light mt-0.5">Explore foundational cosmological phenomena, spacetime geometry, and theoretical astrophysics.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {COSMIC_PHENOMENA.map((phenom) => (
                      <div 
                        key={phenom.id}
                        className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4 shadow-lg"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-base font-bold text-slate-100 tracking-tight">{phenom.title}</h4>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-white/10 mt-1 inline-block">
                                {phenom.category} • {phenom.tag}
                              </span>
                            </div>
                          </div>

                          {/* Key Equation or Principle */}
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-slate-300 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 uppercase font-semibold">Principle:</span>
                            <span className="text-slate-200">{phenom.keyEquationOrFact}</span>
                          </div>

                          <p className="text-xs text-slate-300 font-light leading-relaxed">
                            {phenom.shortDesc}
                          </p>

                          <p className="text-[11.5px] text-slate-400 font-light leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-white/5">
                            {phenom.detailedInsight}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const text = `### Astrophysics Principle: ${phenom.title} (${phenom.category} • ${phenom.tag})\n**Key Formula / Principle:** \`${phenom.keyEquationOrFact}\`\n\n${phenom.shortDesc}\n\n**Theoretical Insight:**\n${phenom.detailedInsight}`;
                              handleAppendTextToNote(text, `${phenom.title} Physics Notes`);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/15 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                            title="Paste this physics topic into Research Notes"
                          >
                            <ClipboardPaste className="w-3.5 h-3.5 text-slate-400" />
                            <span>Paste to Note</span>
                          </button>

                          <button
                            onClick={() => {
                              playTapSound();
                              handleSend(phenom.promptQuestion);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/15 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                            <span>Analyze with Historian</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: SAVED NOTES & BOOKMARKS */}
              {activeTab === 'notes' && (
                <div className="flex-1 flex flex-col min-h-0 p-5 sm:p-7 space-y-5 overflow-y-auto scrollbar-thin">
                  {/* Notes Header & Cloud Sync Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/10 gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-lg font-bold text-slate-100">Saved Research Notes</h3>
                        {/* Cloud Sync Status Indicator */}
                        <div 
                          onClick={handleManualCloudSync}
                          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-white/10 text-[10px] font-mono text-slate-400 cursor-pointer hover:border-white/25 transition-colors"
                          title="Click to manually synchronize notes with cloud"
                        >
                          {cloudSyncStatus === 'syncing' ? (
                            <>
                              <Loader2 className="w-3 h-3 text-slate-300 animate-spin" />
                              <span className="text-slate-300">Syncing Cloud...</span>
                            </>
                          ) : cloudSyncStatus === 'synced' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-slate-300" />
                              <span className="text-slate-300">Cloud Synced</span>
                            </>
                          ) : cloudSyncStatus === 'offline' ? (
                            <>
                              <CloudOff className="w-3 h-3 text-slate-400" />
                              <span className="text-slate-400">Local (Offline)</span>
                            </>
                          ) : (
                            <>
                              <Cloud className="w-3 h-3 text-slate-400" />
                              <span>Sync Ready</span>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 font-light mt-0.5">
                        Cloud-synced celestial observations, mathematical formulations, and AI-refined logs.
                      </p>
                    </div>

                    {/* Top Action Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      {savedNotes.length > 0 && (
                        <>
                          <button
                            onClick={expandedNoteIds.size === savedNotes.length ? handleCollapseAllNotes : handleExpandAllNotes}
                            className="px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-white/10 flex items-center gap-1.5 transition-all"
                            title={expandedNoteIds.size === savedNotes.length ? "Collapse all notes to titles" : "Expand all notes"}
                          >
                            {expandedNoteIds.size === savedNotes.length ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                <span>Collapse All</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                <span>Expand All</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              playTapSound();
                              setSavedNotes([]);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-white/10 transition-all"
                          >
                            Clear All
                          </button>
                        </>
                      )}

                      <button
                        onClick={handleOpenNewNote}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-white text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                        title="Create New Research Note"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>New Note</span>
                      </button>
                    </div>
                  </div>

                  {/* Search Bar for Notes (if notes exist) */}
                  {savedNotes.length > 1 && (
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={notesSearchQuery}
                        onChange={(e) => setNotesSearchQuery(e.target.value)}
                        placeholder="Search notes by title, keywords, or physics equations..."
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/30 transition-all font-light"
                      />
                      {notesSearchQuery && (
                        <button
                          onClick={() => setNotesSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Note Creation / Editing Card */}
                  <AnimatePresence>
                    {isCreatingNote && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-5 sm:p-6 rounded-2xl dual-kawase-glass-subtle border border-white/20 shadow-2xl space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-sm font-semibold text-slate-100">
                              {editingNoteId ? 'Edit Research Note' : 'New Research Note'}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              playTapSound();
                              setIsCreatingNote(false);
                              setEditingNoteId(null);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {/* Title & Category Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
                            <input
                              type="text"
                              value={noteTitle}
                              onChange={(e) => setNoteTitle(e.target.value)}
                              onKeyDown={(e) => e.stopPropagation()}
                              onKeyUp={(e) => e.stopPropagation()}
                              onPaste={(e) => e.stopPropagation()}
                              onCopy={(e) => e.stopPropagation()}
                              onCut={(e) => e.stopPropagation()}
                              placeholder="Note title or celestial topic..."
                              className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-white/30 transition-all font-light select-text cursor-text"
                            />

                            <div className="sm:col-span-1">
                              <CustomDropdown
                                value={noteCategory}
                                options={[
                                  { value: 'Observation', label: 'Observation' },
                                  { value: 'Astrophysics', label: 'Astrophysics' },
                                  { value: 'Kepler Math', label: 'Kepler Math' },
                                  { value: 'Mission Log', label: 'Mission Log' },
                                  { value: 'Theoretical', label: 'Theoretical' },
                                  { value: 'Scratchpad', label: 'Scratchpad' },
                                ]}
                                onChange={(val) => setNoteCategory(val)}
                                className="w-full"
                                buttonClassName="bg-slate-950/80 border border-white/10 hover:bg-slate-900 text-slate-200 text-xs rounded-xl px-3.5 py-2.5"
                                menuClassName="bg-slate-950 border border-white/15"
                              />
                            </div>
                          </div>

                          {/* Quick Starter Templates */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold mr-1">Starters:</span>
                            <button
                              type="button"
                              onClick={() => { playTapSound(); insertTemplate(`### Celestial Profile: ${currentPlanet ? currentPlanet.toUpperCase() : 'Target Body'}\n- **Semi-Major Axis ($a$):** \n- **Atmospheric Composition:** \n- **Key Surface Phenomenon:** \n- **Tidal / Gravitational Observations:** `, `${currentPlanet ? currentPlanet.toUpperCase() : 'Target Body'} Profile`, 'Observation'); }}
                              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-light border border-white/5 transition-all flex items-center gap-1.5"
                            >
                              <Orbit className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Planet Spec</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => { playTapSound(); insertTemplate(`### Deep Space Observation Log\n- **Target Coordinates / Body:** \n- **Instrument / Spectral Band:** \n- **Key Empirical Discovery:** \n- **Anomalous Signatures:** `, 'Deep Space Observation', 'Observation'); }}
                              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-light border border-white/5 transition-all flex items-center gap-1.5"
                            >
                              <Compass className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Observation Log</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => { playTapSound(); insertTemplate(`### Orbital Mechanics Calculation\n$$\nT^2 = \\frac{4\\pi^2}{G M_\\odot} a^3\n$$\n- **Semi-Major Axis ($a$):** \n- **Orbital Period ($T$):** \n- **Eccentricity ($e$):** \n- **Orbital Velocity ($v$):** `, 'Orbital Calculation', 'Kepler Math'); }}
                              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-light border border-white/5 transition-all flex items-center gap-1.5"
                            >
                              <Calculator className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Kepler Math</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => { playTapSound(); insertTemplate(`### Spacecraft Mission Profile\n- **Mission Name:** \n- **Target Body / Orbit:** \n- **Delta-v / Trajectory:** \n- **Primary Scientific Objectives:** `, 'Mission Trajectory Log', 'Mission Log'); }}
                              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-light border border-white/5 transition-all flex items-center gap-1.5"
                            >
                              <Rocket className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Mission Log</span>
                            </button>
                          </div>

                          {/* Markdown & LaTeX Fast Formatting Bar with Functional Undo / Redo */}
                          <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-1 rounded-xl bg-slate-950/60 border border-white/10 text-xs">
                            <div className="flex items-center gap-1">
                              {/* Functional Undo & Redo Buttons */}
                              <div className="flex items-center gap-0.5 pr-1.5 border-r border-white/10">
                                <button
                                  type="button"
                                  onClick={() => { playTapSound(); handleUndo(); }}
                                  disabled={historyPointer <= 0}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 text-xs transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                  title="Undo (Ctrl+Z)"
                                >
                                  <Undo2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { playTapSound(); handleRedo(); }}
                                  disabled={historyPointer >= noteHistory.length - 1}
                                  className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 text-xs transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                  title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
                                >
                                  <Redo2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => { playTapSound(); insertFormatting('**', '**', 'bold text'); }}
                                className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 font-bold text-xs"
                                title="Bold (**text**)"
                              >
                                B
                              </button>
                              <button
                                type="button"
                                onClick={() => { playTapSound(); insertFormatting('*', '*', 'italic text'); }}
                                className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 italic text-xs font-serif"
                                title="Italic (*text*)"
                              >
                                I
                              </button>
                              <button
                                type="button"
                                onClick={() => { playTapSound(); insertFormatting('### ', '', 'Heading 3'); }}
                                className="px-1.5 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 font-mono text-xs"
                                title="Heading (### Header)"
                              >
                                H
                              </button>
                              <button
                                type="button"
                                onClick={() => { playTapSound(); insertFormatting('- ', '', 'List item'); }}
                                className="px-1.5 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 font-mono text-xs"
                                title="Bullet list (- Item)"
                              >
                                • List
                              </button>
                              <button
                                type="button"
                                onClick={() => { playTapSound(); insertFormatting('$$\n', '\n$$', 'E = mc^2'); }}
                                className="px-1.5 h-6 rounded flex items-center justify-center text-cyan-300 hover:text-cyan-100 hover:bg-white/10 font-mono text-xs font-semibold"
                                title="LaTeX Math Equation ($$ formula $$)"
                              >
                                𝑓(𝑥) Math
                              </button>
                              <button
                                type="button"
                                onClick={() => { playTapSound(); insertFormatting('> ', '', 'Quotation or finding'); }}
                                className="px-1.5 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 font-mono text-xs"
                                title="Blockquote (> Quote)"
                              >
                                &ldquo; Quote
                              </button>
                              <button
                                type="button"
                                onClick={() => { playTapSound(); insertFormatting('`', '`', 'code'); }}
                                className="px-1.5 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 font-mono text-xs"
                                title="Inline Code (`code`)"
                              >
                                &lt;/&gt;
                              </button>
                            </div>

                            {/* Edit / Preview Tabs */}
                            <div className="flex items-center gap-1.5 ml-auto">
                              <button
                                type="button"
                                onClick={() => { playTapSound(); setIsNotePreview(false); }}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${!isNotePreview ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => { playTapSound(); setIsNotePreview(true); }}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${isNotePreview ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                              >
                                Preview
                              </button>
                            </div>
                            
                            {/* Paste Button */}
                            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10 ml-2">
                              <button
                                type="button"
                                onClick={handlePasteIntoNote}
                                className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1 text-[11px] font-light transition-all active:scale-95"
                                title="Paste clipboard text into note"
                              >
                                {pasteSuccess ? (
                                  <>
                                    <ClipboardCheck className="w-3 h-3 text-slate-200" />
                                    <span className="text-slate-200">Pasted!</span>
                                  </>
                                ) : (
                                  <>
                                    <ClipboardPaste className="w-3 h-3 text-slate-400" />
                                    <span>Paste</span>
                                  </>
                                )}
                              </button>

                              {/* Copy Draft Button */}
                              <button
                                type="button"
                                onClick={handleCopyCurrentNoteDraft}
                                disabled={!noteContent.trim() && !noteTitle.trim()}
                                className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1 text-[11px] font-light transition-all active:scale-95 disabled:opacity-40"
                                title="Copy note draft to clipboard"
                              >
                                {copiedDraftSuccess ? (
                                  <>
                                    <Check className="w-3 h-3 text-slate-200" />
                                    <span className="text-slate-200">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-slate-400" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              {noteContent && (
                                <button
                                  type="button"
                                  onClick={() => { playTapSound(); setContentWithHistory(''); }}
                                  className="px-1.5 py-1 text-slate-500 hover:text-slate-300 text-[11px] transition-colors"
                                  title="Clear note text"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="relative group">
                            {isNotePreview ? (
                              <div className="w-full min-h-[192px] max-h-[400px] overflow-y-auto p-4 rounded-xl bg-slate-950 border border-white/10 text-slate-100 text-xs leading-relaxed font-sans prose prose-invert max-w-none prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/10 prose-p:leading-relaxed prose-headings:font-bold prose-a:text-blue-400">
                                {noteContent ? (
                                  <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                    {noteContent}
                                  </Markdown>
                                ) : (
                                  <div className="text-slate-500 italic h-full flex items-center justify-center">Nothing to preview</div>
                                )}
                              </div>
                            ) : (
                              <textarea
                                ref={noteTextareaRef}
                                value={noteContent}
                                onChange={(e) => handleNoteTextChange(e.target.value)}
                                onKeyDown={(e) => {
                                  e.stopPropagation();
                                  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                                    if (e.shiftKey) {
                                      e.preventDefault();
                                      handleRedo();
                                    } else {
                                      e.preventDefault();
                                      handleUndo();
                                    }
                                  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                                    e.preventDefault();
                                    handleRedo();
                                  }
                                }}
                                onKeyUp={(e) => e.stopPropagation()}
                                onPaste={(e) => e.stopPropagation()}
                                onCopy={(e) => e.stopPropagation()}
                                onCut={(e) => e.stopPropagation()}
                                placeholder="Write or paste your research notes, theories, orbital metrics, or observations (Markdown & KaTeX supported)..."
                                rows={8}
                                className="w-full p-4 rounded-xl bg-slate-950/80 border border-white/10 text-slate-100 placeholder-slate-500 text-xs leading-relaxed focus:outline-none focus:border-white/30 transition-all font-mono select-text cursor-text resize-y"
                              />
                            )}
                            
                            {/* Word & Character Counter */}
                            <div className="absolute right-3 bottom-3 text-[10px] font-mono text-slate-500 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                              {noteContent.trim() ? noteContent.trim().split(/\s+/).length : 0} words • {noteContent.length} chars
                            </div>
                          </div>
                        </div>

                        {/* AI Refining Toolbar & Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleAiRefineNote}
                              disabled={!noteContent.trim() || isAiRefining}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-white/15 hover:border-white/25 text-xs font-light flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-800/90 disabled:hover:border-white/15"
                              title={!noteContent.trim() ? "Write or paste notes to refine with AI" : "Directly refine notes with Stellar Historian"}
                            >
                              {isAiRefining ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 text-slate-300 animate-spin" />
                                  <span>Refining with AI...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-slate-300" />
                                  <span>Refine with AI</span>
                                </>
                              )}
                            </button>

                            {/* CoT Output Display */}
                            <AnimatePresence>
                              {aiRefineCoT && (
                                <motion.div
                                  initial={{ opacity: 0, x: -6 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center gap-2 text-[11px] text-slate-400 font-mono"
                                >
                                  <span className="w-1 h-1 rounded-full bg-slate-400 animate-pulse" />
                                  {aiRefineCoT}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {aiRefineSuccess && !aiRefineCoT && (
                              <motion.div
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-800/80 border border-white/15 px-2.5 py-1 rounded-lg font-light"
                              >
                                <CheckCircle2 className="w-3 h-3 text-slate-300" />
                                <span>Refined by AI</span>
                                <button
                                  type="button"
                                  onClick={handleUndo}
                                  className="ml-1 text-slate-300 hover:text-white underline font-mono text-[10px]"
                                >
                                  Undo
                                </button>
                              </motion.div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                playTapSound();
                                setIsCreatingNote(false);
                                setEditingNoteId(null);
                              }}
                              className="px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-light transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveCustomNote}
                              disabled={!noteContent.trim() && !noteTitle.trim()}
                              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-white text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow disabled:opacity-40"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Save Note</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Empty State */}
                  {savedNotes.length === 0 && !isCreatingNote ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500">
                        <Bookmark className="w-6 h-6 text-slate-500" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-slate-300">No Saved Notes Yet</h4>
                        <p className="text-xs text-slate-500 max-w-sm font-light">
                          Click "+ New Note" above to write your own observations with AI refining and cloud sync, or click "Paste to Note" on any cosmic phenomenon.
                        </p>
                      </div>
                      <button
                        onClick={handleOpenNewNote}
                        className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/15 text-slate-200 text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Your First Note</span>
                      </button>
                    </div>
                  ) : (
                    /* Collapsed by Default Note List */
                    <div className="space-y-3">
                      {filteredSavedNotes.length === 0 && notesSearchQuery && (
                        <div className="py-8 text-center text-xs text-slate-500">
                          No notes found matching &ldquo;{notesSearchQuery}&rdquo;.
                        </div>
                      )}

                      {filteredSavedNotes.map((note) => {
                        const isExpanded = expandedNoteIds.has(note.id);
                        const wordCount = note.text ? note.text.trim().split(/\s+/).length : 0;

                        return (
                          <div 
                            key={note.id}
                            className="rounded-2xl bg-slate-900/60 border border-white/10 hover:border-white/20 transition-all shadow-md overflow-hidden"
                          >
                            {/* Note Header / Collapsed Title Bar (Always Visible) */}
                            <div 
                              onClick={() => toggleNoteExpand(note.id)}
                              className="px-4 py-3 sm:px-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors select-none"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNoteExpand(note.id);
                                  }}
                                  className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors shrink-0"
                                  title={isExpanded ? "Collapse note" : "Expand note"}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-slate-300" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>

                                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                                  <span className="text-xs font-semibold text-slate-200 truncate">
                                    {note.title || 'Research Note'}
                                  </span>
                                  {note.category && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5 shrink-0 self-start sm:self-auto">
                                      {note.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block">
                                  {wordCount} words • {new Date(note.timestamp).toLocaleDateString()}
                                </span>

                                <div 
                                  onClick={(e) => e.stopPropagation()} 
                                  className="flex items-center gap-1 ml-1"
                                >
                                  <button
                                    onClick={() => handleEditNote(note)}
                                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors"
                                    title="Edit Note"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => copyToClipboard(note.text, note.id)}
                                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors"
                                    title="Copy Note Content"
                                  >
                                    {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-slate-200" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => {
                                      playTapSound();
                                      setSavedNotes(prev => prev.filter(n => n.id !== note.id));
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                    title="Delete Note"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Content View */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-white/5 px-5 py-4 space-y-3 bg-slate-950/40"
                                >
                                  <div className="text-xs text-slate-300 font-light leading-relaxed select-text cursor-text overflow-x-auto">
                                    <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                      {note.text}
                                    </Markdown>
                                  </div>

                                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                                    <span>Last updated: {new Date(note.timestamp).toLocaleTimeString()}</span>
                                    <button
                                      onClick={() => toggleNoteExpand(note.id)}
                                      className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
                                    >
                                      <ChevronUp className="w-3 h-3" />
                                      <span>Collapse</span>
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIResearcher;
