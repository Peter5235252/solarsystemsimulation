import React, { useEffect } from 'react';

/**
 * GlassPreloader Component
 * Pre-loads and maintains frosted glass GPU shaders and backdrop-filter
 * rendering buffers in browser GPU memory starting from first app initialization.
 *
 * Renders an invisible full-viewport GPU raster layer at 0.3% opacity (pointer-events: none).
 * This forces WebKit and Chromium GPU engines to compile and warm up the backdrop-filter
 * shader pipeline on initial page boot, completely eliminating the multi-frame initialization lag
 * when glass panels or modals are opened for the first time.
 */
export const GlassPreloader: React.FC = () => {
  useEffect(() => {
    // Force GPU compositor frame update on initialization
    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      window.requestAnimationFrame(() => {
        const elem = document.getElementById('glass-gpu-preloader');
        if (elem) {
          elem.style.transform = 'translate3d(0,0,0) scale(1.00001)';
        }
      });
    }
  }, []);

  return (
    <div
      id="glass-gpu-preloader"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none opacity-[0.003] overflow-hidden z-[2] border-0 p-0 m-0"
      style={{
        transform: 'translate3d(0,0,0)',
        isolation: 'isolate',
        contain: 'strict',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {/* Full-viewport warm-up layers for all 3 frosted glass blur intensities */}
      <div className="!absolute inset-0 dual-kawase-glass" style={{ transform: 'translate3d(0,0,0)', isolation: 'isolate' }} />
      <div className="!absolute inset-0 dual-kawase-glass-subtle" style={{ transform: 'translate3d(0,0,0)', isolation: 'isolate' }} />
      <div className="!absolute inset-0 dual-kawase-glass-card" style={{ transform: 'translate3d(0,0,0)', isolation: 'isolate' }} />
    </div>
  );
};

export default GlassPreloader;

