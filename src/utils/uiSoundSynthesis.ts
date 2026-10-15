/**
 * Synthesized Tactile UI Sound Engine
 * Uses Web Audio API to generate physical, satisfying acoustic clicks,
 * switch snaps, and responsive slider drag detent ratchet sounds.
 * Hardened for Firefox on Windows 11 with proper AudioContext unlock,
 * non-zero exponential ramps, and robust buffer quantum scheduling.
 */

export type UiTapVariant = 'standard' | 'subtle' | 'toggle-on' | 'toggle-off' | 'snap' | 'modal';

export class UiSoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private lastSliderTickTime = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlock();
      };
      window.addEventListener('pointerdown', unlock, { capture: true, once: true });
      window.addEventListener('keydown', unlock, { capture: true, once: true });
      window.addEventListener('touchstart', unlock, { capture: true, once: true });
    }
  }

  public setAudioContext(audioContext: AudioContext | null) {
    if (audioContext) {
      this.ctx = audioContext;
      this.ensureNoiseBuffer();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }
  }

  public getAudioContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      } catch (err) {
        console.warn('AudioContext not available:', err);
      }
    }
    if (this.ctx) {
      this.ensureNoiseBuffer();
    }
    return this.ctx;
  }

  public unlock() {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  private ensureNoiseBuffer() {
    if (!this.ctx) return;
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === this.ctx.sampleRate) return;
    try {
      // 0.1 seconds of white noise for transient synthesis
      const length = Math.floor(this.ctx.sampleRate * 0.1);
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    } catch (err) {
      console.warn('Could not create noise buffer:', err);
    }
  }

  /**
   * Synthesize a tactile, physical mechanical click / tap sound.
   */
  public playTap(volumePercent: number = 80, variant: UiTapVariant = 'standard') {
    if (volumePercent <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        this.renderTap(ctx, volumePercent, variant);
      }).catch(() => {});
      return;
    }

    this.renderTap(ctx, volumePercent, variant);
  }

  private renderTap(ctx: AudioContext, volumePercent: number, variant: UiTapVariant) {
    try {
      this.ensureNoiseBuffer();
      // Lookahead of 6ms ensures events are never scheduled in a past quantum
      const t = Math.max(ctx.currentTime + 0.006, 0.006);
      const masterGain = (Math.max(0, Math.min(100, volumePercent)) / 100) * 0.40;

      // Micro-pitch detune (±2.5%) for organic repetition
      const detuneFactor = 0.975 + Math.random() * 0.05;

      let transientFreq = 3200;
      let transientQ = 3.5;
      let transientDuration = 0.014;
      let transientVol = 0.8;

      let bodyStartFreq = 680;
      let bodyEndFreq = 180;
      let bodyDuration = 0.038;
      let bodyVol = 0.65;
      let bodyOscType: OscillatorType = 'triangle';

      switch (variant) {
        case 'subtle':
          transientFreq = 3800;
          transientQ = 2.8;
          transientDuration = 0.010;
          transientVol = 0.55;
          bodyStartFreq = 540;
          bodyEndFreq = 220;
          bodyDuration = 0.026;
          bodyVol = 0.45;
          break;

        case 'toggle-on':
          transientFreq = 4000;
          transientQ = 4.0;
          transientDuration = 0.012;
          transientVol = 0.85;
          bodyStartFreq = 520;
          bodyEndFreq = 880;
          bodyDuration = 0.032;
          bodyVol = 0.6;
          bodyOscType = 'sine';
          break;

        case 'toggle-off':
          transientFreq = 2800;
          transientQ = 3.2;
          transientDuration = 0.014;
          transientVol = 0.75;
          bodyStartFreq = 780;
          bodyEndFreq = 260;
          bodyDuration = 0.034;
          bodyVol = 0.6;
          bodyOscType = 'sine';
          break;

        case 'snap':
        case 'modal':
          transientFreq = 2600;
          transientQ = 4.2;
          transientDuration = 0.018;
          transientVol = 0.95;
          bodyStartFreq = 820;
          bodyEndFreq = 140;
          bodyDuration = 0.046;
          bodyVol = 0.75;
          break;

        case 'standard':
        default:
          break;
      }

      bodyStartFreq *= detuneFactor;
      bodyEndFreq *= detuneFactor;
      transientFreq *= detuneFactor;

      // 1. Transient Click Layer (Micro-noise burst through Bandpass filter)
      if (this.noiseBuffer) {
        try {
          const noiseSource = ctx.createBufferSource();
          noiseSource.buffer = this.noiseBuffer;

          const noiseFilter = ctx.createBiquadFilter();
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.setValueAtTime(transientFreq, t);
          noiseFilter.Q.setValueAtTime(transientQ, t);

          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.0001, t);
          noiseGain.gain.linearRampToValueAtTime(masterGain * transientVol, t + 0.002);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + transientDuration);

          noiseSource.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(ctx.destination);

          noiseSource.start(t);
          noiseSource.stop(t + transientDuration + 0.01);
        } catch {}
      }

      // 2. Resonant Body Layer
      try {
        const osc = ctx.createOscillator();
        const bodyFilter = ctx.createBiquadFilter();
        const bodyGain = ctx.createGain();

        osc.type = bodyOscType;
        osc.frequency.setValueAtTime(bodyStartFreq, t);
        if (variant === 'toggle-on') {
          osc.frequency.linearRampToValueAtTime(bodyEndFreq, t + bodyDuration * 0.7);
        } else {
          osc.frequency.exponentialRampToValueAtTime(Math.max(40, bodyEndFreq), t + bodyDuration);
        }

        bodyFilter.type = 'lowpass';
        bodyFilter.frequency.setValueAtTime(2400, t);

        bodyGain.gain.setValueAtTime(0.0001, t);
        bodyGain.gain.linearRampToValueAtTime(masterGain * bodyVol, t + 0.002);
        bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + bodyDuration);

        osc.connect(bodyFilter);
        bodyFilter.connect(bodyGain);
        bodyGain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + bodyDuration + 0.01);
      } catch {}
    } catch {}
  }

  /**
   * Synthesize a crisp tactile ratchet tick for continuous slider dragging.
   * Pitch dynamically tracks the slider's normalized position (0.0 to 1.0).
   */
  public playSliderDrag(normalizedVal: number, volumePercent: number = 80) {
    if (volumePercent <= 0) return;
    const now = performance.now();
    if (now - this.lastSliderTickTime < 20) {
      return;
    }
    this.lastSliderTickTime = now;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        this.renderSliderDrag(ctx, normalizedVal, volumePercent);
      }).catch(() => {});
      return;
    }

    this.renderSliderDrag(ctx, normalizedVal, volumePercent);
  }

  private renderSliderDrag(ctx: AudioContext, normalizedVal: number, volumePercent: number) {
    try {
      this.ensureNoiseBuffer();
      const clampedVal = Math.max(0, Math.min(1, normalizedVal));
      const t = Math.max(ctx.currentTime + 0.005, 0.005);
      const masterGain = (Math.max(0, Math.min(100, volumePercent)) / 100) * 0.32;

      // Pitch dynamically scales from ~850 Hz to ~2100 Hz across slider range
      const baseFreq = 880 * Math.pow(2.2, clampedVal - 0.5);

      // 1. Ultra-short noise click (detent tooth)
      if (this.noiseBuffer) {
        try {
          const noise = ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(baseFreq * 2.2, t);
          filter.Q.setValueAtTime(4.0, t);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.linearRampToValueAtTime(masterGain * 0.85, t + 0.0015);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          noise.start(t);
          noise.stop(t + 0.020);
        } catch {}
      }

      // 2. Micro-resonant detent ping
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.65, t + 0.018);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(masterGain * 0.65, t + 0.0015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.020);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.025);
      } catch {}
    } catch {}
  }

  /**
   * Tactile feedback when first pressing down or grabbing a slider thumb.
   */
  public playSliderGrab(normalizedVal: number, volumePercent: number = 80) {
    if (volumePercent <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        this.renderSliderGrab(ctx, normalizedVal, volumePercent);
      }).catch(() => {});
      return;
    }

    this.renderSliderGrab(ctx, normalizedVal, volumePercent);
  }

  private renderSliderGrab(ctx: AudioContext, normalizedVal: number, volumePercent: number) {
    try {
      const t = Math.max(ctx.currentTime + 0.005, 0.005);
      const masterGain = (Math.max(0, Math.min(100, volumePercent)) / 100) * 0.28;
      const clampedVal = Math.max(0, Math.min(1, normalizedVal));
      const freq = 480 + clampedVal * 320;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.025);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(masterGain, t + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.028);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.035);
    } catch {}
  }

  /**
   * Soft mechanical latch when releasing a slider.
   */
  public playSliderRelease(volumePercent: number = 80) {
    if (volumePercent <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        this.renderSliderRelease(ctx, volumePercent);
      }).catch(() => {});
      return;
    }

    this.renderSliderRelease(ctx, volumePercent);
  }

  private renderSliderRelease(ctx: AudioContext, volumePercent: number) {
    try {
      const t = Math.max(ctx.currentTime + 0.005, 0.005);
      const masterGain = (Math.max(0, Math.min(100, volumePercent)) / 100) * 0.24;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, t);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.020);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(masterGain, t + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.028);
    } catch {}
  }
}

export const uiSound = new UiSoundEngine();
