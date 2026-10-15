import React, { useEffect, useRef } from 'react';

interface CosmicDustProps {
  enabled?: boolean;
}

export default function CosmicDust({ enabled = true }: CosmicDustProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width;
    let h = canvas.height;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        w = parent.clientWidth;
        h = parent.clientHeight;
        canvas.width = w;
        canvas.height = h;
      }
    };
    
    // Observe parent resize
    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }
    resize();
    window.addEventListener('resize', resize);
    
    interface Particle {
      x: number;
      y: number;
      s: number;
      vx: number;
      vy: number;
      baseOpacity: number;
      phase: number;
      phaseSpeed: number;
    }

    // Generate balanced, subtle cosmic speck particles
    const particles: Particle[] = Array.from({ length: 130 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      s: Math.random() * 0.9 + 0.25, // Refined particle sizes
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      baseOpacity: Math.random() * 0.35 + 0.12,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: Math.random() * 0.012 + 0.004,
    }));

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.phaseSpeed;
        
        // Wrap around seamlessly
        if (p.y < -5) p.y = h + 5;
        if (p.y > h + 5) p.y = -5;
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
        
        // Balanced, gentle twinkling effect for dust particles catching light
        const currentOpacity = p.baseOpacity + Math.sin(p.phase) * 0.18;
        const boundedOpacity = Math.max(0.05, Math.min(0.65, currentOpacity));
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(241, 245, 249, ${boundedOpacity})`;
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      // z-[5] ensures the particles render explicitly ON TOP of any frosted glass pseudo-elements 
      // but behind the z-10 relative content wrappers
      className={`absolute inset-0 pointer-events-none z-[5] transition-opacity duration-1000 ease-in-out ${enabled ? 'opacity-100' : 'opacity-0'}`} 
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
