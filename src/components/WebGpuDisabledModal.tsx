import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, AlertTriangle, RefreshCcw, CheckCircle2, Monitor, Cpu, Terminal, ExternalLink, Play } from 'lucide-react';

interface WebGpuDisabledModalProps {
  isOpen: boolean;
  reason?: string;
  onRetry: () => void;
  onBypassHalting: () => void;
}

type OS = 'macos' | 'windows' | 'linux';
type Browser = 'chrome' | 'edge' | 'firefox' | 'brave' | 'vivaldi' | 'safari';

export const WebGpuDisabledModal: React.FC<WebGpuDisabledModalProps> = ({
  isOpen,
  reason,
  onRetry,
  onBypassHalting
}) => {
  const [selectedOS, setSelectedOS] = useState<OS>(() => {
    if (typeof window === 'undefined') return 'windows';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) return 'macos';
    if (ua.includes('linux')) return 'linux';
    return 'windows';
  });

  const [selectedBrowser, setSelectedBrowser] = useState<Browser>(() => {
    if (typeof window === 'undefined') return 'chrome';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('edg')) return 'edge';
    if (ua.includes('firefox')) return 'firefox';
    if (ua.includes('brave')) return 'brave';
    if (ua.includes('vivaldi')) return 'vivaldi';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
    return 'chrome';
  });

  const [isCopied, setIsCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(text);
    setTimeout(() => setIsCopied(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-slate-900/95 border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden my-auto"
        >
          {/* Top Status Banner */}
          <div className="bg-gradient-to-r from-rose-950/80 via-red-900/40 to-slate-900 border-b border-rose-500/20 p-5 sm:p-6 flex items-start gap-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 shrink-0">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  HALTED TO PREVENT CRASH
                </span>
                <span className="text-xs font-mono text-slate-400">WebGPU Standard 2026</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                WebGPU Acceleration Disabled or Unsupported
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                All 3D rendering and WGSL post-processing pipelines have been <strong className="text-rose-400">instantly halted</strong> to protect your browser session from freezing or crash loops.
              </p>
              {reason && (
                <div className="mt-2 text-[11px] font-mono bg-slate-950/80 text-rose-300/90 p-2.5 rounded-lg border border-rose-500/20">
                  <strong>Detection Diagnosis:</strong> {reason}
                </div>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Step Selector Tabs */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Monitor className="w-4 h-4 text-cyan-400" />
                Select Your Operating System & Web Browser
              </label>

              {/* OS Selector */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                {(['windows', 'macos', 'linux'] as OS[]).map((os) => (
                  <button
                    key={os}
                    onClick={() => setSelectedOS(os)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 capitalize flex items-center justify-center gap-2 ${
                      selectedOS === os
                        ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-lg'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    <span>{os === 'macos' ? 'macOS' : os === 'windows' ? 'Windows' : 'Linux'}</span>
                  </button>
                ))}
              </div>

              {/* Browser Selector */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(['chrome', 'edge', 'firefox', 'brave', 'vivaldi', 'safari'] as Browser[]).map((browser) => (
                  <button
                    key={browser}
                    onClick={() => setSelectedBrowser(browser)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all duration-200 capitalize flex flex-col items-center justify-center gap-1 border ${
                      selectedBrowser === browser
                        ? 'bg-slate-800 text-cyan-400 border-cyan-500/40 shadow-md'
                        : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate max-w-full">
                      {browser === 'chrome' ? 'Chrome' : browser === 'edge' ? 'MS Edge' : browser === 'firefox' ? 'Firefox' : browser === 'brave' ? 'Brave' : browser === 'vivaldi' ? 'Vivaldi' : 'Safari'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Instruction Panel */}
            <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-200 capitalize">
                    How to Enable WebGPU in {selectedBrowser} on {selectedOS === 'macos' ? 'macOS' : selectedOS}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Verified August 2026</span>
              </div>

              {/* Browser Specific Step Lists */}
              {selectedBrowser === 'chrome' && (
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2.5 leading-relaxed">
                  <li>
                    Open Google Chrome and navigate to the flags page:
                    <div className="mt-1 flex items-center gap-2">
                      <code className="bg-slate-900 px-2.5 py-1 rounded text-cyan-300 font-mono text-[11px] border border-slate-800">chrome://flags/#enable-unsafe-webgpu</code>
                      <button
                        onClick={() => copyToClipboard('chrome://flags/#enable-unsafe-webgpu')}
                        className="text-[10px] text-slate-400 hover:text-cyan-400 font-mono underline"
                      >
                        {isCopied === 'chrome://flags/#enable-unsafe-webgpu' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </li>
                  <li>
                    Locate <strong>Unsafe WebGPU</strong> (or <strong>WebGPU</strong>) and change the drop-down setting from <em>Default</em> to <strong>Enabled</strong>.
                  </li>
                  {selectedOS === 'linux' && (
                    <li>
                      On Linux, also search for <strong>#enable-vulkan</strong> in <code className="bg-slate-900 px-1 rounded text-cyan-300 font-mono">chrome://flags</code> and set it to <strong>Enabled</strong>.
                    </li>
                  )}
                  <li>
                    Go to Chrome Settings &rarr; System (<code className="bg-slate-900 px-1 rounded text-cyan-300 font-mono">chrome://settings/system</code>) and turn <strong>ON</strong> <em className="text-cyan-300">"Use graphics acceleration when available"</em>.
                  </li>
                  <li>Click <strong>Relaunch</strong> at the bottom of Chrome to apply changes.</li>
                </ol>
              )}

              {selectedBrowser === 'edge' && (
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2.5 leading-relaxed">
                  <li>
                    Open Microsoft Edge and enter the flags URL:
                    <div className="mt-1 flex items-center gap-2">
                      <code className="bg-slate-900 px-2.5 py-1 rounded text-cyan-300 font-mono text-[11px] border border-slate-800">edge://flags/#enable-unsafe-webgpu</code>
                      <button
                        onClick={() => copyToClipboard('edge://flags/#enable-unsafe-webgpu')}
                        className="text-[10px] text-slate-400 hover:text-cyan-400 font-mono underline"
                      >
                        {isCopied === 'edge://flags/#enable-unsafe-webgpu' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </li>
                  <li>
                    Set <strong>Unsafe WebGPU</strong> to <strong>Enabled</strong>.
                  </li>
                  <li>
                    Open Edge Settings &rarr; System and Performance &rarr; turn <strong>ON</strong> <em>"Use graphics acceleration when available"</em>.
                  </li>
                  <li>Click <strong>Restart</strong> to relaunch Microsoft Edge.</li>
                </ol>
              )}

              {selectedBrowser === 'firefox' && (
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2.5 leading-relaxed">
                  <li>
                    Open Firefox and type <code className="bg-slate-900 px-2 py-0.5 rounded text-cyan-300 font-mono">about:config</code> into the address bar and click <em>"Accept the Risk and Continue"</em>.
                  </li>
                  <li>
                    Search for <code className="bg-slate-900 px-2 py-0.5 rounded text-cyan-300 font-mono">dom.webgpu.enabled</code> and double-click to set it to <strong>true</strong>.
                  </li>
                  <li>
                    Search for <code className="bg-slate-900 px-2 py-0.5 rounded text-cyan-300 font-mono">gfx.webgpu.force-enabled</code> and double-click to set it to <strong>true</strong> (recommended for Linux/unlisted GPUs).
                  </li>
                  <li>
                    Verify under Firefox Settings &rarr; General &rarr; Performance that <em>"Use hardware acceleration when available"</em> is checked.
                  </li>
                  <li>Completely close and restart Firefox.</li>
                </ol>
              )}

              {selectedBrowser === 'brave' && (
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2.5 leading-relaxed">
                  <li>
                    Open Brave and navigate to flags:
                    <div className="mt-1 flex items-center gap-2">
                      <code className="bg-slate-900 px-2.5 py-1 rounded text-cyan-300 font-mono text-[11px] border border-slate-800">brave://flags/#enable-unsafe-webgpu</code>
                    </div>
                  </li>
                  <li>Change <strong>Unsafe WebGPU</strong> to <strong>Enabled</strong>.</li>
                  <li>Go to Brave Settings &rarr; System and make sure Hardware Acceleration is enabled.</li>
                  <li>Relaunch Brave Browser.</li>
                </ol>
              )}

              {selectedBrowser === 'vivaldi' && (
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2.5 leading-relaxed">
                  <li>
                    Open Vivaldi and type <code className="bg-slate-900 px-2 py-0.5 rounded text-cyan-300 font-mono">vivaldi://flags/#enable-unsafe-webgpu</code> into the URL bar.
                  </li>
                  <li>Switch the flag from Default to <strong>Enabled</strong>.</li>
                  <li>Open Vivaldi Settings &rarr; Webpages &rarr; Ensure <em>Use Hardware Acceleration</em> is checked.</li>
                  <li>Relaunch Vivaldi.</li>
                </ol>
              )}

              {selectedBrowser === 'safari' && (
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2.5 leading-relaxed">
                  <li>Open Safari on macOS (Requires macOS 14 Sonoma or macOS 15 Sequoia+).</li>
                  <li>Go to top bar: <strong>Safari &rarr; Settings (or Preferences) &rarr; Advanced</strong>.</li>
                  <li>Check the box at the bottom: <strong>"Show features for web developers"</strong>.</li>
                  <li>In the Safari menu bar at the top of screen, open <strong>Developer &rarr; Feature Flags</strong> (or Experimental Features).</li>
                  <li>Scroll to find <strong>WebGPU</strong> and check the box to <strong>Enable</strong> it.</li>
                  <li>Restart Safari.</li>
                </ol>
              )}

              {/* OS / Hardware Specific Note Box */}
              <div className="pt-3 border-t border-slate-800/60 flex items-start gap-2 text-[11px] text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  {selectedOS === 'linux' && (
                    <span>
                      <strong>Linux Hardware Requirement:</strong> WebGPU on Linux relies on Vulkan. Ensure Mesa Vulkan drivers (<code className="text-slate-200">mesa-vulkan-drivers</code>) or proprietary NVIDIA/AMD drivers are installed. Launching Chrome with <code className="text-cyan-300">google-chrome --enable-features=Vulkan,WebGPU</code> forces Vulkan backend.
                    </span>
                  )}
                  {selectedOS === 'windows' && (
                    <span>
                      <strong>Windows Hardware Requirement:</strong> Ensure your DirectX 12 / Vulkan GPU drivers (NVIDIA, AMD Radeon, or Intel Arc / UHD Graphics) are up to date.
                    </span>
                  )}
                  {selectedOS === 'macos' && (
                    <span>
                      <strong>macOS Hardware Requirement:</strong> WebGPU runs on Metal API. Supported on all Apple Silicon (M1/M2/M3/M4) and 2015+ Intel Macs with macOS 13+ (Ventura/Sonoma/Sequoia).
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={onBypassHalting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-700/60 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 text-slate-400" />
                <span>Dismiss & Force 2D Canvas Engine (Fallback)</span>
              </button>

              <button
                onClick={onRetry}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all duration-200 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>Re-Test & Detect WebGPU</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
