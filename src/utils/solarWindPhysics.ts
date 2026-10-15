/**
 * Subtle, Highly Realistic Solar Wind & Interplanetary Magnetic Field (IMF) Physics Engine
 * 
 * Design Principles:
 * - Visually restrained, elegant, and astrophysical (subtle ethereal plasma, no garish fireworks)
 * - Parker Spiral Archimedean geometry r = (v_sw / Omega) * (phi - phi_0) with low-contrast field lines
 * - Realistic particle density decay (~1/r^2 dispersion), gentle velocity vector streaks
 * - Ethereal magnetosheath compression & bow shocks with soft, elegant opacities
 * - Natural, quiet plasma flow matching true deep space scientific visualizations
 */

export interface SolarWindParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseAngle: number;
  radialDist: number;
  speed: number;
  type: 'proton' | 'alpha' | 'electron';
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
  trailX: [number, number];
  trailY: [number, number];
}

export interface MagnetosphereTarget {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  type: 'intrinsic_dipole' | 'induced_ionosphere' | 'giant_magnetodisc';
  dipoleTilt: number;
  standoffRadius: number;
  currentStandoff: number;
  flaringParameter: number;
  magneticMomentColor?: string;
  auroralActivity: number;
  tailLength: number;
  hasPlasmaTorus?: boolean;
  hasRings?: boolean;
}

export class SolarWindEngine {
  private particles: SolarWindParticle[] = [];
  private maxParticles: number = 750; // Balanced, non-cluttered particle count
  private timeElapsed: number = 0;

  constructor() {
    this.initParticles();
  }

  private initParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  private createParticle(randomDistance = false): SolarWindParticle {
    const angle = Math.random() * Math.PI * 2;
    const isAlpha = Math.random() < 0.08;
    const isElectron = !isAlpha && Math.random() < 0.06;

    let pType: 'proton' | 'alpha' | 'electron' = 'proton';
    let speed = 1.1 + Math.random() * 0.5; // Natural, realistic drift speed
    let size = 0.8;
    let opacity = 0.22 + Math.random() * 0.18;
    let maxLife = 380 + Math.random() * 120;

    if (isAlpha) {
      pType = 'alpha';
      speed = 0.95 + Math.random() * 0.4;
      size = 0.9;
      opacity = 0.16 + Math.random() * 0.12;
    } else if (isElectron) {
      pType = 'electron';
      speed = 1.8 + Math.random() * 0.8;
      size = 0.6;
      opacity = 0.14 + Math.random() * 0.10;
      maxLife = 260 + Math.random() * 80;
    }

    const dist = randomDistance ? (55 + Math.random() * 950) : (46 + Math.random() * 6);
    const omega = 0.0028; // Sun equatorial rotation rate
    const spiralAngle = angle - dist * omega;

    const x = Math.cos(spiralAngle) * dist;
    const y = Math.sin(spiralAngle) * dist;

    return {
      x,
      y,
      vx: Math.cos(spiralAngle) * speed,
      vy: Math.sin(spiralAngle) * speed,
      baseAngle: angle,
      radialDist: dist,
      speed,
      type: pType,
      life: randomDistance ? Math.random() * maxLife * 0.85 : 0,
      maxLife,
      size,
      opacity,
      trailX: [x, x],
      trailY: [y, y]
    };
  }

  public update(dt: number, targets: MagnetosphereTarget[]) {
    this.timeElapsed += dt;
    const omega = 0.0028;

    // Smooth relaxation of standoff distance
    for (const target of targets) {
      target.currentStandoff += (target.standoffRadius - target.currentStandoff) * Math.min(1.0, dt * 0.05);
      target.auroralActivity = Math.max(0.08, target.auroralActivity - 0.002 * dt);
    }

    const pCount = this.particles.length;
    for (let i = 0; i < pCount; i++) {
      const p = this.particles[i];
      p.life += dt;

      if (p.life >= p.maxLife || p.radialDist > 1100) {
        this.particles[i] = this.createParticle(false);
        continue;
      }

      p.trailX[1] = p.trailX[0];
      p.trailY[1] = p.trailY[0];
      p.trailX[0] = p.x;
      p.trailY[0] = p.y;

      // Radial progression along Parker spiral
      p.radialDist += p.speed * dt;
      const spiralAngle = p.baseAngle - p.radialDist * omega;

      let currentX = Math.cos(spiralAngle) * p.radialDist;
      let currentY = Math.sin(spiralAngle) * p.radialDist;

      // Gentle, aerodynamic deflection around magnetospheres
      for (const target of targets) {
        const dx = currentX - target.x;
        const dy = currentY - target.y;
        const distToBody = Math.hypot(dx, dy);

        const sunToPlanetAngle = Math.atan2(target.y, target.x);
        const particleAngle = Math.atan2(dy, dx);
        let theta = particleAngle - (sunToPlanetAngle + Math.PI);
        while (theta > Math.PI) theta -= Math.PI * 2;
        while (theta < -Math.PI) theta += Math.PI * 2;
        const absTheta = Math.abs(theta);

        const alpha = target.flaringParameter || 0.58;
        const cosTheta = Math.cos(absTheta);
        const magnetopauseR = target.currentStandoff * Math.pow(2.0 / Math.max(0.1, 1.0 + cosTheta), alpha);
        const bowShockR = magnetopauseR * 1.32;

        if (distToBody < bowShockR) {
          const sheathRatio = (distToBody - magnetopauseR) / Math.max(1.0, bowShockR - magnetopauseR);
          const deflectionTangent = theta >= 0 ? sunToPlanetAngle + Math.PI * 0.5 : sunToPlanetAngle - Math.PI * 0.5;

          if (sheathRatio < 0) {
            // Push outside magnetopause boundary
            const pushDist = magnetopauseR * 1.02 - distToBody;
            currentX += Math.cos(particleAngle) * pushDist;
            currentY += Math.sin(particleAngle) * pushDist;
          } else {
            // Smoothly deflect along magnetosheath flow
            const flowSpeed = (1.0 - sheathRatio) * p.speed * 1.2;
            currentX += Math.cos(deflectionTangent) * flowSpeed * dt;
            currentY += Math.sin(deflectionTangent) * flowSpeed * dt;
          }
        }
      }

      p.x = currentX;
      p.y = currentY;
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    targets: MagnetosphereTarget[],
    zoom: number
  ) {
    ctx.save();

    // -------------------------------------------------------------
    // 1. Subtle, Translucent Parker Spiral IMF Lines
    // -------------------------------------------------------------
    const spiralCount = 6;
    const omega = 0.0028;
    ctx.lineWidth = Math.max(0.4, 0.6 / zoom);

    for (let s = 0; s < spiralCount; s++) {
      const baseA = (Math.PI * 2 * s) / spiralCount;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(226, 232, 240, 0.035)`; // Subtle warm ethereal gray

      let first = true;
      for (let r = 50; r <= 950; r += 24) {
        const phi = baseA - r * omega;
        const sx = Math.cos(phi) * r;
        const sy = Math.sin(phi) * r;
        if (first) {
          ctx.moveTo(sx, sy);
          first = false;
        } else {
          ctx.lineTo(sx, sy);
        }
      }
      ctx.stroke();
    }

    // -------------------------------------------------------------
    // 2. Refined, Ethereal Solar Wind Plasma Streaks
    // -------------------------------------------------------------
    const pLen = this.particles.length;
    for (let i = 0; i < pLen; i++) {
      const p = this.particles[i];
      const lifeFade = 1.0 - p.life / p.maxLife;
      // Natural 1/r dispersion fading
      const distanceFade = Math.max(0.12, 1.0 - (p.radialDist / 1050) * 0.75);
      const alpha = lifeFade * distanceFade * p.opacity;
      if (alpha <= 0.01) continue;

      let r = 245, g = 243, b = 237; // Off-white subtle solar plasma

      if (p.type === 'alpha') {
        r = 186; g = 230; b = 253; // Soft celestial blue-gray
      } else if (p.type === 'electron') {
        r = 233; g = 213; b = 255; // Pale lavender-white
      }

      ctx.beginPath();
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.lineWidth = Math.max(0.5, p.size / zoom);
      ctx.moveTo(p.trailX[1], p.trailY[1]);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    // -------------------------------------------------------------
    // 3. Subtle, Accurate Planetary Magnetospheres & Bow Shocks
    // -------------------------------------------------------------
    for (const target of targets) {
      const sunAngle = Math.atan2(target.y, target.x);
      const rStandoff = target.currentStandoff;
      const tailLen = target.tailLength || (rStandoff * 4.0);

      ctx.save();
      ctx.translate(target.x, target.y);
      ctx.rotate(sunAngle);

      // Upstream Bow Shock Curve
      const shockStandoff = rStandoff * 1.32;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(186, 230, 253, 0.12)`;
      ctx.lineWidth = Math.max(0.5, 0.9 / zoom);
      
      ctx.moveTo(-shockStandoff, 0);
      for (let angle = 0.08; angle <= Math.PI * 0.68; angle += 0.1) {
        const rad = shockStandoff * Math.pow(2.0 / (1.0 + Math.cos(angle)), 0.52);
        ctx.lineTo(-Math.cos(angle) * rad, -Math.sin(angle) * rad);
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-shockStandoff, 0);
      for (let angle = 0.08; angle <= Math.PI * 0.68; angle += 0.1) {
        const rad = shockStandoff * Math.pow(2.0 / (1.0 + Math.cos(angle)), 0.52);
        ctx.lineTo(-Math.cos(angle) * rad, Math.sin(angle) * rad);
      }
      ctx.stroke();

      // Magnetopause Envelope & Tail
      ctx.beginPath();
      ctx.strokeStyle = target.magneticMomentColor || `rgba(203, 213, 225, 0.14)`;
      ctx.lineWidth = Math.max(0.4, 0.75 / zoom);
      ctx.setLineDash([3 / zoom, 3 / zoom]);

      // Upper Magnetopause
      ctx.moveTo(-rStandoff, 0);
      ctx.quadraticCurveTo(-rStandoff * 0.6, -rStandoff * 1.15, tailLen * 0.3, -rStandoff * 1.35);
      ctx.lineTo(tailLen, -rStandoff * 1.5);

      // Lower Magnetopause
      ctx.moveTo(-rStandoff, 0);
      ctx.quadraticCurveTo(-rStandoff * 0.6, rStandoff * 1.15, tailLen * 0.3, rStandoff * 1.35);
      ctx.lineTo(tailLen, rStandoff * 1.5);
      ctx.stroke();
      ctx.setLineDash([]);

      // Subtle Central Neutral Sheet
      ctx.beginPath();
      ctx.strokeStyle = `rgba(241, 245, 249, 0.06)`;
      ctx.lineWidth = Math.max(0.4, 0.8 / zoom);
      ctx.moveTo(rStandoff * 0.7, 0);
      ctx.lineTo(tailLen * 0.9, 0);
      ctx.stroke();

      // Inner Dipole loop for intrinsic planets
      if (target.type === 'intrinsic_dipole' || target.type === 'giant_magnetodisc') {
        const dipoleR = rStandoff * 0.7;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(216, 180, 254, 0.07)`;
        ctx.lineWidth = Math.max(0.3, 0.6 / zoom);
        ctx.ellipse(-dipoleR * 0.25, 0, dipoleR * 0.65, dipoleR * 0.55, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // Soft Polar Auroral Ovals
      if (target.type === 'intrinsic_dipole' || target.type === 'giant_magnetodisc') {
        ctx.save();
        ctx.translate(target.x, target.y);
        ctx.rotate(target.dipoleTilt);

        const pRadius = target.radius;
        const ovalR = pRadius * 0.48;

        // North Auroral Oval (gentle emerald glow)
        ctx.beginPath();
        ctx.ellipse(0, -pRadius * 0.75, ovalR, ovalR * 0.32, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(110, 231, 183, 0.32)`;
        ctx.lineWidth = Math.max(0.6, 1.1 / zoom);
        ctx.stroke();

        // South Auroral Oval (gentle violet glow)
        ctx.beginPath();
        ctx.ellipse(0, pRadius * 0.75, ovalR, ovalR * 0.32, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(216, 180, 254, 0.28)`;
        ctx.lineWidth = Math.max(0.6, 1.1 / zoom);
        ctx.stroke();

        ctx.restore();
      }
    }

    ctx.restore();
  }
}
