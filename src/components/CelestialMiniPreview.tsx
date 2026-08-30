import React, { useEffect, useRef } from 'react';
import { Globe, Sun, Aperture, Rocket, Sparkles, SlidersHorizontal, ShieldCheck, Thermometer, Weight, Focus, CircleDot, Moon } from 'lucide-react';
import { CONSTELLATIONS } from '../data/constellations';

export interface CelestialBodyData {
  id: string;
  name: string;
  color?: string;
  radius?: number;
  distance?: number;
  speed?: number;
  sides?: number;
  rings?: boolean;
  moons?: any[];
  desc?: string;
  nameKey?: string;
}

export interface CelestialInfoData {
  type?: string;
  mass?: string;
  gravity?: string;
  temp?: string;
  funFacts?: string[];
}

interface CelestialMiniPreviewProps {
  body: CelestialBodyData | null;
  info?: CelestialInfoData | null;
  tempUnit?: 'C' | 'F' | 'K';
  onToggleTempUnit?: () => void;
  onFocusBody?: (id: string) => void;
  onCompareBody?: (id: string) => void;
  onAskAIBody?: (name: string) => void;
  playTapSound?: () => void;
}

export const CelestialMiniPreviewComponent: React.FC<CelestialMiniPreviewProps> = ({
  body,
  info,
  tempUnit = 'C',
  onToggleTempUnit,
  onFocusBody,
  onCompareBody,
  onAskAIBody,
  playTapSound,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-Accuracy Photorealistic Canvas Rendering Engine (Optimized)
  useEffect(() => {
    if (!canvasRef.current || !body) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    let lastRenderTime = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = 280;
    const displayHeight = 160;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    const render = (now: number) => {
      animId = requestAnimationFrame(render);
      if (now - lastRenderTime < 33) return; // 30 FPS cap for preview keeps rendering smooth without CPU overhead
      lastRenderTime = now;
      time += 0.033;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const width = displayWidth;
      const height = displayHeight;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Deep space background with subtle nebular glow matching body color
      const bodyColor = body.color || '#38bdf8';
      const bgGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.75);
      bgGlow.addColorStop(0, `${bodyColor}1f`);
      bgGlow.addColorStop(0.5, '#03071240');
      bgGlow.addColorStop(1, '#02061700');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Distant background starfield
      for (let i = 0; i < 28; i++) {
        const sx = (Math.sin(i * 77 + 0.15) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 41 + 0.12) * 0.5 + 0.5) * height;
        const sa = Math.sin(time * 1.8 + i * 2) * 0.35 + 0.55;
        ctx.fillStyle = `rgba(255, 255, 255, ${sa * 0.65})`;
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      ctx.save();
      ctx.translate(cx, cy);

      const R = Math.min(50, Math.max(24, (body.radius || 14) * 1.5));

      // -------------------------------------------------------------------
      // 1. BLACK HOLE (Sagittarius A*, M87*, Cygnus X-1)
      // -------------------------------------------------------------------
      if (['sagittarius_a', 'm87_star', 'cygnus_x1'].includes(body.id)) {
        const isCygnus = body.id === 'cygnus_x1';
        const isM87 = body.id === 'm87_star';
        const tilt = isCygnus ? -Math.PI / 6 : (isM87 ? Math.PI / 5 : Math.PI / 7);
        const primaryCol = bodyColor;
        const secondaryCol = isCygnus ? '#67e8f9' : '#fef08a';

        // Gravitational Lensing Field / Space Distortion Aura
        const lensRadius = R * 2.8;
        const lensGrad = ctx.createRadialGradient(0, 0, R * 0.5, 0, 0, lensRadius);
        lensGrad.addColorStop(0, `${primaryCol}33`);
        lensGrad.addColorStop(0.5, `${primaryCol}10`);
        lensGrad.addColorStop(1, '#00000000');
        ctx.beginPath();
        ctx.arc(0, 0, lensRadius, 0, Math.PI * 2);
        ctx.fillStyle = lensGrad;
        ctx.fill();

        // Relativistic Polar Plasma Jets for Cygnus X-1 and M87*
        if (isCygnus || isM87) {
          ctx.save();
          ctx.rotate(tilt);
          const jetLength = R * (isM87 ? 4.2 : 3.2);
          const jetWidth = R * 0.38;

          [-1, 1].forEach(dir => {
            const startY = dir * R * 0.6;
            const endY = dir * jetLength;

            const jetGrad = ctx.createLinearGradient(0, startY, 0, endY);
            jetGrad.addColorStop(0, '#ffffff');
            jetGrad.addColorStop(0.2, primaryCol);
            jetGrad.addColorStop(0.65, secondaryCol);
            jetGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.beginPath();
            ctx.moveTo(-jetWidth * 0.25, startY);
            ctx.lineTo(-jetWidth, endY);
            ctx.lineTo(jetWidth, endY);
            ctx.lineTo(jetWidth * 0.25, startY);
            ctx.closePath();
            ctx.fillStyle = jetGrad;
            ctx.fill();

            // Pulsing plasma knot
            const knotPos = ((time * 1.5) % 1);
            const knotY = startY + (endY - startY) * knotPos;
            const knotR = R * (0.08 + knotPos * 0.2);
            ctx.beginPath();
            ctx.ellipse(0, knotY, knotR * 1.4, knotR * 0.6, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${(1 - knotPos) * 0.7})`;
            ctx.fill();
          });
          ctx.restore();
        }

        // Lensed Accretion Disk (Back arc)
        ctx.save();
        ctx.rotate(tilt);

        const outerRx = R * 2.2;
        const outerRy = R * 0.7;

        // Doppler Beaming Gradient (Approaching side brighter)
        const diskGrad = ctx.createLinearGradient(-outerRx, 0, outerRx, 0);
        diskGrad.addColorStop(0, '#ffffff');
        diskGrad.addColorStop(0.35, secondaryCol);
        diskGrad.addColorStop(0.65, primaryCol);
        diskGrad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');

        // Upper Lensed Warped Arc
        ctx.beginPath();
        ctx.ellipse(0, -R * 0.3, outerRx * 0.85, outerRy * 0.9, 0, Math.PI * 0.85, Math.PI * 2.15);
        ctx.strokeStyle = diskGrad;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Main Accretion Ring
        ctx.beginPath();
        ctx.ellipse(0, 0, outerRx, outerRy, 0, 0, Math.PI * 2);
        ctx.strokeStyle = diskGrad;
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.restore();

        // Event Horizon & Photon Sphere Ring
        ctx.beginPath();
        ctx.arc(0, 0, R * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, R * 0.82, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, R * 0.92, 0, Math.PI * 2);
        ctx.strokeStyle = primaryCol;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Front Accretion Overlap
        ctx.save();
        ctx.rotate(tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, outerRx, outerRy, 0, 0, Math.PI);
        ctx.strokeStyle = diskGrad;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();
      }

      // -------------------------------------------------------------------
      // 2. STAR / SUN
      // -------------------------------------------------------------------
      else if (body.id === 'sun') {
        const pulse = Math.sin(time * 2.5) * 2.5;

        // Multi-layer Solar Corona Radiance
        const coronaGrad = ctx.createRadialGradient(0, 0, R * 0.5, 0, 0, R + 30 + pulse);
        coronaGrad.addColorStop(0, '#ffffff');
        coronaGrad.addColorStop(0.2, '#fef08a');
        coronaGrad.addColorStop(0.5, '#f59e0b');
        coronaGrad.addColorStop(0.8, '#dc262640');
        coronaGrad.addColorStop(1, '#00000000');

        ctx.beginPath();
        ctx.arc(0, 0, R + 30 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = coronaGrad;
        ctx.fill();

        // Solar Prominence Plasma Arcs
        for (let p = 0; p < 6; p++) {
          const pAngle = time * 0.4 + (p * Math.PI * 2) / 6;
          const px1 = Math.cos(pAngle) * R;
          const py1 = Math.sin(pAngle) * R;
          const px2 = Math.cos(pAngle + 0.3) * (R + 14 + Math.sin(time * 3 + p) * 5);
          const py2 = Math.sin(pAngle + 0.3) * (R + 14 + Math.sin(time * 3 + p) * 5);

          ctx.beginPath();
          ctx.moveTo(px1, py1);
          ctx.quadraticCurveTo(px2, py2, Math.cos(pAngle + 0.6) * R, Math.sin(pAngle + 0.6) * R);
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.85)';
          ctx.lineWidth = 2.2;
          ctx.stroke();
        }

        // Photosphere Core
        const sunBody = ctx.createRadialGradient(-R * 0.25, -R * 0.25, 0, 0, 0, R);
        sunBody.addColorStop(0, '#ffffff');
        sunBody.addColorStop(0.3, '#fde047');
        sunBody.addColorStop(0.85, '#f59e0b');
        sunBody.addColorStop(1, '#d97706');

        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fillStyle = sunBody;
        ctx.fill();

        // Solar Granulation / Sunspots
        ctx.fillStyle = 'rgba(180, 83, 9, 0.55)';
        ctx.beginPath();
        ctx.arc(-R * 0.3, R * 0.1, 3.5, 0, Math.PI * 2);
        ctx.arc(-R * 0.2, R * 0.15, 2.5, 0, Math.PI * 2);
        ctx.arc(R * 0.25, -R * 0.3, 4, 0, Math.PI * 2);
        ctx.arc(R * 0.35, -R * 0.25, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // -------------------------------------------------------------------
      // 3. EARTH
      // -------------------------------------------------------------------
      else if (body.id === 'earth') {
        // Rayleigh Scattering Atmosphere Halo
        ctx.beginPath();
        ctx.arc(0, 0, R + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.fill();

        // Ocean Base Sphere
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fillStyle = '#1d4ed8';
        ctx.fill();

        // Continents (Green/Brown landmasses clipped to sphere)
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.clip();

        const rot = time * 0.15;
        ctx.fillStyle = '#15803d';

        // North America patch
        ctx.beginPath();
        ctx.ellipse(Math.cos(rot) * R * 0.4 - 6, Math.sin(rot * 0.5) * R * 0.2 - 8, 12, 16, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // South America patch
        ctx.beginPath();
        ctx.ellipse(Math.cos(rot + 0.2) * R * 0.5 + 4, Math.sin(rot * 0.5) * R * 0.2 + 10, 9, 15, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Eurasia & Africa patch
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(Math.cos(rot + 2.2) * R * 0.6 - 4, -4, 18, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Polar Ice Cap
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(0, -R + 3, 10, 0, Math.PI * 2);
        ctx.arc(0, R - 3, 8, 0, Math.PI * 2);
        ctx.fill();

        // Swirling Clouds Layer
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.ellipse(Math.cos(rot * 1.3) * 10, -8, R * 0.7, 5, 0.1, 0, Math.PI * 2);
        ctx.ellipse(Math.cos(rot * 1.1 + 1.5) * 12, 6, R * 0.6, 4, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // 3D Spherical Shading Overlay
        const shade = ctx.createRadialGradient(-R * 0.35, -R * 0.35, R * 0.1, 0, 0, R);
        shade.addColorStop(0, 'rgba(255, 255, 255, 0.38)');
        shade.addColorStop(0.65, 'rgba(0, 0, 0, 0)');
        shade.addColorStop(1, 'rgba(2, 6, 23, 0.88)');
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Orbiting Moon
        const mDist = R + 22;
        ctx.beginPath();
        ctx.arc(0, 0, mDist, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);

        const mAngle = time * 0.8;
        const mx = Math.cos(mAngle) * mDist;
        const my = Math.sin(mAngle) * mDist * 0.4;
        ctx.beginPath();
        ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#cbd5e1';
        ctx.fill();
      }

      // -------------------------------------------------------------------
      // 4. EARTH'S MOON (LUNA)
      // -------------------------------------------------------------------
      else if (body.id === 'moon') {
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fillStyle = '#d6d3d1';
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.clip();

        // Lunar Maria Basins (Sea of Tranquility & Oceanus Procellarum)
        ctx.fillStyle = '#78716c';
        ctx.beginPath();
        ctx.ellipse(-R * 0.3, -R * 0.1, R * 0.35, R * 0.28, -0.2, 0, Math.PI * 2);
        ctx.ellipse(R * 0.2, R * 0.2, R * 0.25, R * 0.2, 0.3, 0, Math.PI * 2);
        ctx.ellipse(R * 0.1, -R * 0.3, R * 0.2, R * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tycho Impact Crater Rays
        ctx.fillStyle = '#f5f5f4';
        ctx.beginPath();
        ctx.arc(R * 0.25, R * 0.45, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(245, 245, 244, 0.4)';
        ctx.lineWidth = 1;
        for (let a = 0; a < 6; a++) {
          const rayAngle = (a * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(R * 0.25, R * 0.45);
          ctx.lineTo(R * 0.25 + Math.cos(rayAngle) * 14, R * 0.45 + Math.sin(rayAngle) * 14);
          ctx.stroke();
        }

        // 3D Spherical Shading
        const shade = ctx.createRadialGradient(-R * 0.35, -R * 0.35, R * 0.1, 0, 0, R);
        shade.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        shade.addColorStop(0.65, 'rgba(0, 0, 0, 0)');
        shade.addColorStop(1, 'rgba(28, 25, 23, 0.88)');
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // -------------------------------------------------------------------
      // 5. MERCURY, VENUS, MARS
      // -------------------------------------------------------------------
      else if (body.id === 'mercury' || body.id === 'venus' || body.id === 'mars') {
        const isMercury = body.id === 'mercury';
        const isVenus = body.id === 'venus';

        // Limb Haze
        ctx.beginPath();
        ctx.arc(0, 0, R + 3, 0, Math.PI * 2);
        ctx.fillStyle = isMercury ? 'rgba(212, 212, 216, 0.2)' : isVenus ? 'rgba(253, 224, 71, 0.25)' : 'rgba(248, 113, 113, 0.25)';
        ctx.fill();

        // Planet Base Sphere
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fillStyle = bodyColor;
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.clip();

        if (isMercury) {
          // Caloris Basin & Craters
          ctx.fillStyle = '#71717a';
          ctx.beginPath();
          ctx.ellipse(-R * 0.2, -R * 0.1, R * 0.38, R * 0.3, 0.1, 0, Math.PI * 2);
          ctx.ellipse(R * 0.3, R * 0.3, R * 0.22, R * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (isVenus) {
          // Swirling Venusian Cloud Belts
          const bandColors = ['#fde047', '#f59e0b', '#d97706', '#fef08a'];
          bandColors.forEach((col, idx) => {
            ctx.fillStyle = col;
            const y = -R + idx * (R * 0.5);
            ctx.fillRect(-R, y, R * 2, R * 0.35);
          });
        } else {
          // Mars Basaltic Regions (Syrtis Major & Valles Marineris)
          ctx.fillStyle = '#991b1b';
          ctx.beginPath();
          ctx.ellipse(-4, 2, R * 0.5, R * 0.3, 0.2, 0, Math.PI * 2);
          ctx.ellipse(6, -6, R * 0.4, R * 0.25, -0.3, 0, Math.PI * 2);
          ctx.fill();

          // Polar Ice Cap
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, -R + 2, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3D Shading
        const shade = ctx.createRadialGradient(-R * 0.35, -R * 0.35, R * 0.1, 0, 0, R);
        shade.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
        shade.addColorStop(0.65, 'rgba(0, 0, 0, 0)');
        shade.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // -------------------------------------------------------------------
      // 6. JUPITER
      // -------------------------------------------------------------------
      else if (body.id === 'jupiter') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.clip();

        // Base atmosphere
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-R, -R, R * 2, R * 2);

        // Alternating Equatorial Belts & Zones
        const bandColors = ['#78350f', '#fef3c7', '#92400e', '#fde68a', '#b45309', '#fef08a', '#78350f'];
        const bandHeight = (R * 2) / bandColors.length;
        bandColors.forEach((color, idx) => {
          ctx.fillStyle = color;
          const y = -R + idx * bandHeight;
          ctx.fillRect(-R, y, R * 2, bandHeight);
        });

        // The Great Red Spot Oval Storm
        const spotX = Math.cos(time * 0.2) * (R * 0.4) + 6;
        const spotY = R * 0.3;
        ctx.beginPath();
        ctx.ellipse(spotX, spotY, 11, 7, 0.05, 0, Math.PI * 2);
        ctx.fillStyle = '#dc2626';
        ctx.fill();
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3D Shading
        const shade = ctx.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R);
        shade.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        shade.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        shade.addColorStop(1, 'rgba(45, 16, 3, 0.85)');
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Orbiting Galilean Moons (Io, Europa, Ganymede, Callisto)
        [0.85, 1.35, 1.85, 2.35].forEach((mDistMult, idx) => {
          const mDist = R + 14 + idx * 8;
          ctx.beginPath();
          ctx.arc(0, 0, mDist, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.setLineDash([2, 2]);
          ctx.stroke();

          const mAngle = time * (0.9 - idx * 0.18);
          const mx = Math.cos(mAngle) * mDist;
          const my = Math.sin(mAngle) * mDist * 0.35;
          ctx.beginPath();
          ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = ['#fde047', '#e2e8f0', '#94a3b8', '#64748b'][idx];
          ctx.fill();
        });
        ctx.setLineDash([]);
      }

      // -------------------------------------------------------------------
      // 7. SATURN
      // -------------------------------------------------------------------
      else if (body.id === 'saturn') {
        // Back Rings
        ctx.save();
        ctx.rotate(Math.PI / 8);
        ctx.scale(1, 0.32);

        const ringGrad = ctx.createRadialGradient(0, 0, R * 1.15, 0, 0, R * 2.1);
        ringGrad.addColorStop(0, 'rgba(217, 119, 6, 0.2)');
        ringGrad.addColorStop(0.3, 'rgba(253, 230, 138, 0.85)');
        ringGrad.addColorStop(0.65, 'rgba(15, 23, 42, 0.1)'); // Cassini Division
        ringGrad.addColorStop(0.72, 'rgba(253, 230, 138, 0.7)');
        ringGrad.addColorStop(1, 'rgba(253, 230, 138, 0.05)');

        ctx.beginPath();
        ctx.arc(0, 0, R * 2.1, 0, Math.PI * 2);
        ctx.fillStyle = ringGrad;
        ctx.fill();
        ctx.restore();

        // Planet Body Sphere
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = '#fde68a';
        ctx.fillRect(-R, -R, R * 2, R * 2);

        // Golden Band Shading
        ['#f59e0b', '#fde68a', '#d97706', '#fef08a', '#b45309'].forEach((col, idx) => {
          ctx.fillStyle = col;
          ctx.fillRect(-R, -R + idx * (R * 0.4), R * 2, R * 0.4);
        });

        // Ring Shadow on Planet
        ctx.save();
        ctx.rotate(Math.PI / 8);
        ctx.scale(1, 0.32);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(-R * 1.5, R * 0.2, R * 3, 8);
        ctx.restore();

        // 3D Shading
        const shade = ctx.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R);
        shade.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        shade.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        shade.addColorStop(1, 'rgba(45, 26, 3, 0.85)');
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Front Rings
        ctx.save();
        ctx.rotate(Math.PI / 8);
        ctx.scale(1, 0.32);
        ctx.beginPath();
        ctx.arc(0, 0, R * 2.1, 0, Math.PI);
        ctx.fillStyle = ringGrad;
        ctx.fill();
        ctx.restore();
      }

      // -------------------------------------------------------------------
      // 8. URANUS & NEPTUNE
      // -------------------------------------------------------------------
      else if (body.id === 'uranus' || body.id === 'neptune') {
        const isUranus = body.id === 'uranus';

        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fillStyle = isUranus ? '#2dd4bf' : '#2563eb';
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.clip();

        if (!isUranus) {
          // Neptune Great Dark Spot storm
          ctx.beginPath();
          ctx.ellipse(-6, 4, 9, 5, -0.2, 0, Math.PI * 2);
          ctx.fillStyle = '#1e3a8a';
          ctx.fill();

          // White Methane Cirrus Cloud Streak
          ctx.beginPath();
          ctx.ellipse(-4, 0, 11, 2, -0.1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fill();
        }

        // 3D Shading
        const shade = ctx.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R);
        shade.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        shade.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        shade.addColorStop(1, isUranus ? 'rgba(4, 47, 46, 0.85)' : 'rgba(15, 23, 42, 0.9)');
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Uranus Vertical Rings (98° tilt)
        if (isUranus) {
          ctx.save();
          ctx.rotate(-Math.PI / 3);
          ctx.scale(0.28, 1);
          ctx.beginPath();
          ctx.arc(0, 0, R * 1.6, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(153, 246, 228, 0.6)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.restore();
        }
      }

      // -------------------------------------------------------------------
      // 9. PLUTO & CHARON
      // -------------------------------------------------------------------
      else if (body.id === 'pluto') {
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fillStyle = '#fed7aa';
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.clip();

        // Iconic Heart-Shaped Tombaugh Regio
        ctx.fillStyle = '#fff7ed';
        ctx.beginPath();
        ctx.ellipse(3, 2, 8, 9, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // 3D Shading
        const shade = ctx.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R);
        shade.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        shade.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        shade.addColorStop(1, 'rgba(67, 20, 7, 0.85)');
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Orbiting Charon
        const cAngle = time * 0.6;
        const cxPos = Math.cos(cAngle) * (R + 14);
        const cyPos = Math.sin(cAngle) * (R + 14);
        ctx.beginPath();
        ctx.arc(cxPos, cyPos, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#a8a29e';
        ctx.fill();
      }

      // -------------------------------------------------------------------
      // 10. SPECIFIC MOONS (Titan, Io, Europa, Enceladus, Rhea, Dione, Tethys, Charon)
      // -------------------------------------------------------------------
      else if (['titan', 'io', 'europa', 'enceladus', 'rhea', 'dione', 'tethys', 'charon'].includes(body.id)) {
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fillStyle = bodyColor;
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.clip();

        if (body.id === 'titan') {
          // Orange hazy atmosphere & hydrocarbon lakes
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.arc(0, -R * 0.4, R * 0.3, 0, Math.PI * 2);
          ctx.fill();
        } else if (body.id === 'io') {
          // Yellow volcanic moon with dark sulfur calderas
          ctx.fillStyle = '#c2410c';
          ctx.beginPath();
          ctx.arc(-R * 0.2, R * 0.2, 3, 0, Math.PI * 2);
          ctx.arc(R * 0.3, -R * 0.1, 2.5, 0, Math.PI * 2);
          ctx.arc(0, R * 0.4, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (body.id === 'europa') {
          // Smooth icy crust with reddish fractures
          ctx.strokeStyle = '#9a3412';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-R * 0.6, -R * 0.2); ctx.lineTo(R * 0.5, R * 0.4);
          ctx.moveTo(-R * 0.3, R * 0.5); ctx.lineTo(R * 0.4, -R * 0.5);
          ctx.stroke();
        } else if (body.id === 'enceladus') {
          // Pure white ice with blue tiger stripe plumes at south pole
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-R * 0.4, R * 0.7); ctx.lineTo(-R * 0.2, R * 0.85);
          ctx.moveTo(0, R * 0.7); ctx.lineTo(R * 0.2, R * 0.85);
          ctx.stroke();
        } else {
          // Cratered ice
          ctx.fillStyle = 'rgba(0,0,0,0.2)';
          ctx.beginPath();
          ctx.arc(-R * 0.2, -R * 0.2, R * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3D Shading
        const shade = ctx.createRadialGradient(-R * 0.35, -R * 0.35, R * 0.1, 0, 0, R);
        shade.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        shade.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        shade.addColorStop(1, 'rgba(2, 6, 23, 0.85)');
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // -------------------------------------------------------------------
      // 11. SPACECRAFT (ISS, JWST, Voyager 1 & 2, Hubble, Apollo 11, Cassini, New Horizons)
      // -------------------------------------------------------------------
      else if (['iss', 'voyager1', 'voyager2', 'jwst', 'cassini', 'apollo11', 'hubble', 'newhorizons'].includes(body.id)) {
        ctx.rotate(time * 0.15);
        const s = 1.3;

        if (body.id === 'iss') {
          // 1. Central Metallic Truss
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(-22 * s, -1.8 * s, 44 * s, 3.6 * s);

          // 2. Solar Arrays (8 bronze/gold photovoltaic wings with cell grid)
          const arrayWidth = 8 * s;
          const arrayHeight = 16 * s;

          [-18 * s, -9 * s, 9 * s, 18 * s].forEach(x => {
            [-17 * s, 1 * s].forEach(y => {
              const solGrad = ctx.createLinearGradient(x, y, x + arrayWidth, y + arrayHeight);
              solGrad.addColorStop(0, '#b45309');
              solGrad.addColorStop(0.5, '#f59e0b');
              solGrad.addColorStop(1, '#78350f');

              ctx.fillStyle = solGrad;
              ctx.fillRect(x - arrayWidth * 0.5, y, arrayWidth, arrayHeight);

              ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
              ctx.lineWidth = 0.6;
              ctx.strokeRect(x - arrayWidth * 0.5, y, arrayWidth, arrayHeight);

              // Grid lines inside solar panel
              ctx.beginPath();
              ctx.moveTo(x - arrayWidth * 0.5, y + arrayHeight * 0.5);
              ctx.lineTo(x + arrayWidth * 0.5, y + arrayHeight * 0.5);
              ctx.stroke();
            });
          });

          // 3. Radiator Panels
          ctx.fillStyle = '#f8fafc';
          [-4.5 * s, 4.5 * s].forEach(x => {
            ctx.fillRect(x - 1.4 * s, -13 * s, 2.8 * s, 9 * s);
          });

          // 4. Pressurized Modules (Habitation & Labs in T-shape)
          ctx.fillStyle = '#f1f5f9';
          ctx.beginPath();
          ctx.roundRect(-3 * s, -8 * s, 6 * s, 16 * s, 1.8 * s);
          ctx.fill();

          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(-7 * s, -2.5 * s, 14 * s, 5 * s);

          // Cupola / Window dots
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, 0, 1.5 * s, 0, Math.PI * 2);
          ctx.fill();

          // 5. Navigation Beacon LEDs
          const flash = Math.sin(time * 8) > 0;
          ctx.fillStyle = '#ef4444'; // Red port light
          ctx.beginPath();
          ctx.arc(-22 * s, 0, 1.5 * s, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#22c55e'; // Green starboard light
          ctx.beginPath();
          ctx.arc(22 * s, 0, 1.5 * s, 0, Math.PI * 2);
          ctx.fill();

          if (flash) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -8 * s, 1.8 * s, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (body.id === 'jwst') {
          // JWST
          // 1. 5-Layer Diamond Sunshield
          const sunGrad = ctx.createLinearGradient(0, -18 * s, 0, 16 * s);
          sunGrad.addColorStop(0, '#f43f5e');
          sunGrad.addColorStop(0.3, '#fbbf24');
          sunGrad.addColorStop(0.7, '#cbd5e1');
          sunGrad.addColorStop(1, '#a855f7');

          [0, 1.2 * s, 2.4 * s].forEach((offset, idx) => {
            ctx.beginPath();
            ctx.moveTo(0, -20 * s + offset);
            ctx.lineTo(14 * s - offset * 0.5, 0);
            ctx.lineTo(0, 17 * s - offset);
            ctx.lineTo(-14 * s + offset * 0.5, 0);
            ctx.closePath();
            if (idx === 0) {
              ctx.fillStyle = sunGrad;
              ctx.fill();
            }
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          });

          // 2. Primary Mirror Assembly (18 Beryllium-Gold Hexagons)
          const rHex = 2.4 * s;
          const drawHexTile = (hx: number, hy: number) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i - Math.PI / 6;
              const px = hx + rHex * Math.cos(angle);
              const py = hy + rHex * Math.sin(angle);
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          };

          const mCenterY = -4 * s;
          const dx = rHex * 1.732;
          const dy = rHex * 1.5;

          [[-dx, -dy], [0, -dy * 2], [dx, -dy], [-dx, dy], [0, dy * 2], [dx, dy]].forEach(([hx, hy]) => {
            drawHexTile(hx, mCenterY + hy);
          });
          [[-dx * 2, 0], [dx * 2, 0], [-dx, -dy * 3], [dx, -dy * 3], [-dx, dy * 3], [dx, dy * 3], [-dx * 2, -dy * 2], [dx * 2, -dy * 2], [-dx * 2, dy * 2], [dx * 2, dy * 2]].forEach(([hx, hy]) => {
            drawHexTile(hx, mCenterY + hy);
          });

          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, mCenterY, rHex * 0.9, 0, Math.PI * 2);
          ctx.fill();

          // Secondary Mirror Tripod
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-8 * s, mCenterY + 4 * s); ctx.lineTo(0, mCenterY - 12 * s);
          ctx.moveTo(8 * s, mCenterY + 4 * s); ctx.lineTo(0, mCenterY - 12 * s);
          ctx.moveTo(0, mCenterY + 8 * s); ctx.lineTo(0, mCenterY - 12 * s);
          ctx.stroke();

          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, mCenterY - 12 * s, 1.5 * s, 0, Math.PI * 2);
          ctx.fill();
        } else if (body.id === 'hubble') {
          // Hubble
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-20 * s, -3 * s, 13 * s, 6 * s);
          ctx.fillRect(7 * s, -3 * s, 13 * s, 6 * s);

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 0.6;
          ctx.strokeRect(-20 * s, -3 * s, 13 * s, 6 * s);
          ctx.strokeRect(7 * s, -3 * s, 13 * s, 6 * s);

          const hubGrad = ctx.createLinearGradient(-4.5 * s, 0, 4.5 * s, 0);
          hubGrad.addColorStop(0, '#f8fafc');
          hubGrad.addColorStop(0.5, '#cbd5e1');
          hubGrad.addColorStop(1, '#475569');

          ctx.fillStyle = hubGrad;
          ctx.fillRect(-4.5 * s, -14 * s, 9 * s, 28 * s);

          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          [-9 * s, -4.5 * s, 0, 4.5 * s, 9 * s].forEach(y => {
            ctx.beginPath();
            ctx.moveTo(-4.5 * s, y);
            ctx.lineTo(4.5 * s, y);
            ctx.stroke();
          });

          // Open Aperture Door Flap
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.moveTo(-4.5 * s, -14 * s);
          ctx.lineTo(-9 * s, -20 * s);
          ctx.lineTo(-2.5 * s, -20 * s);
          ctx.lineTo(-4.5 * s, -14 * s);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.ellipse(0, -14 * s, 4.2 * s, 1.8 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, -14 * s, 2 * s, 0, Math.PI * 2);
          ctx.fill();
        } else if (body.id === 'apollo11') {
          // Apollo 11
          // Service Module
          const smGrad = ctx.createLinearGradient(-4.5 * s, 0, 4.5 * s, 0);
          smGrad.addColorStop(0, '#cbd5e1');
          smGrad.addColorStop(0.5, '#f8fafc');
          smGrad.addColorStop(1, '#64748b');

          ctx.fillStyle = smGrad;
          ctx.fillRect(-4.5 * s, -2 * s, 9 * s, 12 * s);

          // Engine Nozzle
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.moveTo(-2.8 * s, 10 * s);
          ctx.lineTo(-4.5 * s, 17 * s);
          ctx.lineTo(4.5 * s, 17 * s);
          ctx.lineTo(2.8 * s, 10 * s);
          ctx.closePath();
          ctx.fill();

          // Engine Plume Glow
          const plume = ctx.createLinearGradient(0, 17 * s, 0, 24 * s);
          plume.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
          plume.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = plume;
          ctx.beginPath();
          ctx.moveTo(-3.5 * s, 17 * s);
          ctx.lineTo(0, 24 * s);
          ctx.lineTo(3.5 * s, 17 * s);
          ctx.closePath();
          ctx.fill();

          // Command Module (Conical Capsule)
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.moveTo(0, -9 * s);
          ctx.lineTo(4 * s, -2 * s);
          ctx.lineTo(-4 * s, -2 * s);
          ctx.closePath();
          ctx.fill();

          // Lunar Module Eagle
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-4.5 * s, -15 * s, 9 * s, 6 * s);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 0.6;
          ctx.strokeRect(-4.5 * s, -15 * s, 9 * s, 6 * s);
        } else if (body.id === 'cassini') {
          // Cassini-Huygens
          const casDish = ctx.createRadialGradient(0, -7 * s, 0, 0, -7 * s, 10 * s);
          casDish.addColorStop(0, '#ffffff');
          casDish.addColorStop(1, '#cbd5e1');

          ctx.fillStyle = casDish;
          ctx.beginPath();
          ctx.ellipse(0, -7 * s, 10 * s, 5.5 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.fillStyle = '#d97706';
          ctx.fillRect(-4 * s, -1 * s, 8 * s, 11 * s);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(-4 * s, -1 * s, 8 * s, 11 * s);

          // Huygens Probe
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.ellipse(7 * s, 3 * s, 4 * s, 2.2 * s, Math.PI / 6, 0, Math.PI * 2);
          ctx.fill();

          // Magnetometer Boom
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-4 * s, 2 * s);
          ctx.lineTo(-20 * s, -9 * s);
          ctx.stroke();
        } else if (['voyager1', 'voyager2'].includes(body.id)) {
          // Voyager
          const dishGrad = ctx.createRadialGradient(0, -4 * s, 0, 0, -4 * s, 12 * s);
          dishGrad.addColorStop(0, '#ffffff');
          dishGrad.addColorStop(0.7, '#cbd5e1');
          dishGrad.addColorStop(1, '#64748b');

          ctx.fillStyle = dishGrad;
          ctx.beginPath();
          ctx.ellipse(0, -4 * s, 12 * s, 6.5 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-7 * s, -4 * s); ctx.lineTo(0, -12 * s);
          ctx.moveTo(7 * s, -4 * s); ctx.lineTo(0, -12 * s);
          ctx.stroke();

          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(-1.5 * s, -13 * s, 3 * s, 2.5 * s);

          ctx.fillStyle = '#f1f5f9';
          ctx.beginPath();
          ctx.arc(0, 3 * s, 5.5 * s, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-5 * s, 3 * s); ctx.lineTo(-18 * s, 10 * s);
          ctx.moveTo(5 * s, 3 * s); ctx.lineTo(16 * s, 9 * s);
          ctx.stroke();
        } else {
          // New Horizons / Generic Probe
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(0, -12 * s);
          ctx.lineTo(8 * s, 8 * s);
          ctx.lineTo(-8 * s, 8 * s);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(0, 0, 7 * s, 4 * s, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // -------------------------------------------------------------------
      // 12. CONSTELLATIONS
      // -------------------------------------------------------------------
      else if (CONSTELLATIONS.some(c => c.id === body.id) || ['orion', 'ursa_major', 'cassiopeia', 'scorpius', 'cygnus', 'crux'].includes(body.id)) {
        const foundConst = CONSTELLATIONS.find(c => c.id === body.id) || CONSTELLATIONS[0];
        const col = foundConst.color || bodyColor;

        // Auto-fit scale factor for constellation coordinates
        const scaleFactor = 1.35;

        // Draw connecting lines
        ctx.strokeStyle = `${col}d0`;
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        foundConst.edges.forEach(([p1_idx, p2_idx]) => {
          const p1 = foundConst.points[p1_idx];
          const p2 = foundConst.points[p2_idx];
          if (p1 && p2) {
            ctx.moveTo(p1.x * scaleFactor, p1.y * scaleFactor);
            ctx.lineTo(p2.x * scaleFactor, p2.y * scaleFactor);
          }
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw star nodes with pulsating magnitude glow
        foundConst.points.forEach(p => {
          const px = p.x * scaleFactor;
          const py = p.y * scaleFactor;
          const mag = p.mag || 3.5;
          const size = Math.max(2, mag * 0.9);
          const pulse = Math.sin(time * 2.5 + px * 0.1) * 0.2 + 0.9;

          ctx.beginPath();
          ctx.arc(px, py, size * 2.2 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = `${col}35`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          if (p.name) {
            ctx.font = '9px "JetBrains Mono", monospace';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.fillText(p.name, px + size + 3, py + 3);
          }
        });
      }

      // -------------------------------------------------------------------
      // 13. DEFAULT CRATERED CELESTIAL BODY / ASTEROID
      // -------------------------------------------------------------------
      else {
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fillStyle = bodyColor;
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.arc(-R * 0.3, -R * 0.2, R * 0.25, 0, Math.PI * 2);
        ctx.arc(R * 0.2, R * 0.3, R * 0.18, 0, Math.PI * 2);
        ctx.arc(-R * 0.1, R * 0.4, R * 0.15, 0, Math.PI * 2);
        ctx.fill();

        const shade = ctx.createRadialGradient(-R * 0.35, -R * 0.35, R * 0.1, 0, 0, R);
        shade.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        shade.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        shade.addColorStop(1, 'rgba(2, 6, 23, 0.85)');
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();
      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [body]);

  if (!body) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400 space-y-2">
        <Globe className="w-7 h-7 text-slate-600 mb-1 shrink-0" />
        <p className="text-xs font-medium text-slate-300">No Celestial Preview</p>
        <p className="text-[11px] font-light text-slate-400 leading-relaxed max-w-[240px]">
          Highlight or select a planet, moon, star, spacecraft, or constellation to view live preview.
        </p>
      </div>
    );
  }

  const moonsCount = body.moons ? body.moons.length : 0;
  const classification = info?.type || (body.rings ? 'Ringed Planet' : moonsCount > 0 ? 'Planet with Moons' : 'Celestial Object');

  // Convert temperature if present
  let displayTemp = info?.temp || 'N/A';
  if (info?.temp && tempUnit !== 'C') {
    if (tempUnit === 'F') {
      displayTemp = info.temp
        .replace(/(\d+(?:\.\d+)?)\s*M\s*°C/gi, (_, num) => `${Math.round(parseFloat(num) * 1.8 * 10) / 10}M °F`)
        .replace(/(-?\d+(?:,\d+)?(?:\.\d+)?)\s*°C/g, (_, num) => {
          const val = parseFloat(num.replace(/,/g, ''));
          if (isNaN(val)) return `${num}°F`;
          return `${Math.round((val * 9) / 5 + 32).toLocaleString()}°F`;
        });
    } else if (tempUnit === 'K') {
      displayTemp = info.temp
        .replace(/(\d+(?:\.\d+)?)\s*M\s*°C/gi, (_, num) => `${num}M K`)
        .replace(/(-?\d+(?:,\d+)?(?:\.\d+)?)\s*°C/g, (_, num) => {
          const val = parseFloat(num.replace(/,/g, ''));
          if (isNaN(val)) return `${num} K`;
          return `${Math.max(0, Math.round(val + 273.15)).toLocaleString()} K`;
        });
    }
  }

  return (
    <div className="flex flex-col h-full space-y-3 text-left select-none">
      {/* Header Badge & Name */}
      <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5 font-mono">
            {classification}
          </span>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: body.color || '#38bdf8', boxShadow: `0 0 8px ${body.color || '#38bdf8'}80` }}
            />
            {body.name}
          </h3>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-900/80 text-slate-300 rounded border border-white/10 shrink-0">
          ID: {body.id.toUpperCase()}
        </span>
      </div>

      {/* Mini Canvas Visual Preview */}
      <div className="relative w-full h-40 bg-slate-950/80 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
        <canvas ref={canvasRef} width={280} height={160} className="w-full h-full object-contain" />
      </div>

      {/* Trait Tags Badges */}
      <div className="flex flex-wrap gap-1">
        {body.rings && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-slate-900/80 text-slate-300 border border-white/10 rounded-full">
            <CircleDot className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Rings System</span>
          </span>
        )}
        {moonsCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-slate-900/80 text-slate-300 border border-white/10 rounded-full">
            <Moon className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{moonsCount} {moonsCount === 1 ? 'Moon' : 'Moons'}</span>
          </span>
        )}
        {body.id === 'earth' && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-slate-900/80 text-slate-300 border border-white/10 rounded-full">
            <ShieldCheck className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Habitable Zone</span>
          </span>
        )}
        {body.id === 'sun' && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-slate-900/80 text-slate-300 border border-white/10 rounded-full">
            <Sun className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Primary Star</span>
          </span>
        )}
        {['jupiter', 'saturn'].includes(body.id) && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-slate-900/80 text-slate-300 border border-white/10 rounded-full">
            <Aperture className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Gas Giant</span>
          </span>
        )}
        {['uranus', 'neptune'].includes(body.id) && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-slate-900/80 text-slate-300 border border-white/10 rounded-full">
            <Sparkles className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Ice Giant</span>
          </span>
        )}
      </div>

      {/* Attribute / Specs Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-slate-950/60 border border-white/10 rounded-xl">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Scale Radius</span>
          <span className="font-semibold text-slate-200 font-mono">{body.radius ?? 'N/A'} AU</span>
        </div>
        <div className="p-2 bg-slate-950/60 border border-white/10 rounded-xl">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Orbit Distance</span>
          <span className="font-semibold text-slate-200 font-mono">{body.distance ? `${body.distance} AU` : 'Central Origin'}</span>
        </div>
        <div className="p-2 bg-slate-950/60 border border-white/10 rounded-xl">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Thermometer className="w-2.5 h-2.5" /> Temp
            </span>
            {onToggleTempUnit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playTapSound?.();
                  onToggleTempUnit();
                }}
                className="text-[9px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded transition-colors"
                title={`Current unit: ${tempUnit === 'C' ? 'Celsius (°C)' : tempUnit === 'F' ? 'Fahrenheit (°F)' : 'Kelvin (K)'}. Click to toggle.`}
              >
                {tempUnit === 'C' ? '°C' : tempUnit === 'F' ? '°F' : 'K'}
              </button>
            )}
          </div>
          <span className="font-semibold text-slate-200 font-mono truncate block">{displayTemp}</span>
        </div>
        <div className="p-2 bg-slate-950/60 border border-white/10 rounded-xl">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
            <Weight className="w-2.5 h-2.5" /> Mass / Gravity
          </span>
          <span className="font-semibold text-slate-200 font-mono truncate block">{info?.mass || 'N/A'}</span>
        </div>
      </div>

      {/* Description Snippet */}
      {body.desc && (
        <div className="p-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-[11px] leading-relaxed text-slate-300">
          <p className="line-clamp-3">{body.desc}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-1 grid grid-cols-2 gap-2 mt-auto">
        <button
          onClick={() => {
            playTapSound?.();
            onFocusBody?.(body.id);
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2 dual-kawase-glass-subtle hover:bg-slate-800/80 border border-white/15 rounded-xl text-xs font-semibold text-slate-100 transition-all shadow-sm outline-none active:scale-[0.98]"
        >
          <Focus className="w-3.5 h-3.5 text-sky-400" /> Target & Focus
        </button>
        <button
          onClick={() => {
            playTapSound?.();
            onCompareBody?.(body.id);
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-slate-800/80 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all outline-none"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> Compare Specs
        </button>
      </div>
    </div>
  );
};

export const CelestialMiniPreview = React.memo(CelestialMiniPreviewComponent, (prevProps, nextProps) => {
  if (prevProps.body?.id !== nextProps.body?.id) return false;
  if (prevProps.tempUnit !== nextProps.tempUnit) return false;
  if (prevProps.info !== nextProps.info) return false;
  if (prevProps.onToggleTempUnit !== nextProps.onToggleTempUnit) return false;
  return true;
});

export default CelestialMiniPreview;
