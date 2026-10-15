export class SpaceSonificationEngine {
  private ctx: AudioContext | null = null;
  private resonanceMasterGain: GainNode | null = null;
  private radioMasterGain: GainNode | null = null;
  
  // Laplace Resonance Nodes
  private laplaceOscs: OscillatorNode[] = [];
  private laplaceGains: GainNode[] = [];
  
  // Magnetospheric Radio FM Nodes
  private radioCarrier: OscillatorNode | null = null;
  private radioModulator: OscillatorNode | null = null;
  private radioModGain: GainNode | null = null;
  private radioNoiseGain: GainNode | null = null;
  private radioBandpass: BiquadFilterNode | null = null;

  public isInitialized = false;

  public init(audioContext: AudioContext) {
    if (this.isInitialized) return;
    this.ctx = audioContext;

    // 1. Laplace Resonance Harmonic Polyphonic Chords Bus
    this.resonanceMasterGain = this.ctx.createGain();
    this.resonanceMasterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.resonanceMasterGain.connect(this.ctx.destination);

    // Fundamental base frequency for Laplace Resonance (mapped to C2 ~ 65.4 Hz or E2 ~ 82.4 Hz)
    const baseFreq = 73.42; // D2 note
    // Laplace 4:2:1 ratio:
    // Io (4x = 293.68 Hz -> D4)
    // Europa (2x = 146.84 Hz -> D3)
    // Ganymede (1x = 73.42 Hz -> D2)
    // Plus Callisto 3:7 non-resonant overtone (F#3 ~ 185 Hz)
    const moonFrequencies = [
      { name: 'Ganymede (1x)', freq: baseFreq * 1, type: 'sine' as OscillatorType, weight: 0.35 },
      { name: 'Europa (2x)', freq: baseFreq * 2, type: 'sine' as OscillatorType, weight: 0.30 },
      { name: 'Io (4x)', freq: baseFreq * 4, type: 'triangle' as OscillatorType, weight: 0.25 },
      { name: 'Laplace Harmony (5th)', freq: baseFreq * 3, type: 'sine' as OscillatorType, weight: 0.15 },
    ];

    moonFrequencies.forEach(item => {
      if (!this.ctx || !this.resonanceMasterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = item.type;
      osc.frequency.setValueAtTime(item.freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(item.weight, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.resonanceMasterGain);
      osc.start();

      this.laplaceOscs.push(osc);
      this.laplaceGains.push(gain);
    });

    // 2. NASA Voyager / Juno Magnetospheric Radio Wave FM Synthesis
    this.radioMasterGain = this.ctx.createGain();
    this.radioMasterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.radioMasterGain.connect(this.ctx.destination);

    // FM Synthesis for Saturn Kilometric Radiation & Jovian Whistlers
    this.radioCarrier = this.ctx.createOscillator();
    this.radioCarrier.type = 'sawtooth';
    this.radioCarrier.frequency.setValueAtTime(280, this.ctx.currentTime);

    this.radioModulator = this.ctx.createOscillator();
    this.radioModulator.type = 'sine';
    this.radioModulator.frequency.setValueAtTime(1.2, this.ctx.currentTime);

    this.radioModGain = this.ctx.createGain();
    this.radioModGain.gain.setValueAtTime(120, this.ctx.currentTime);

    this.radioModulator.connect(this.radioModGain);
    this.radioModGain.connect(this.radioCarrier.frequency);

    // Dynamic sweeping bandpass filter simulating planetary plasma dispersion
    this.radioBandpass = this.ctx.createBiquadFilter();
    this.radioBandpass.type = 'bandpass';
    this.radioBandpass.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.radioBandpass.Q.setValueAtTime(4.0, this.ctx.currentTime);

    this.radioCarrier.connect(this.radioBandpass);
    this.radioBandpass.connect(this.radioMasterGain);

    this.radioCarrier.start();
    this.radioModulator.start();

    this.isInitialized = true;
  }

  public setResonanceVolume(volumePercent: number) {
    if (!this.resonanceMasterGain || !this.ctx) return;
    const gain = (Math.max(0, Math.min(100, volumePercent)) / 100) * 0.22;
    this.resonanceMasterGain.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.1);
  }

  public setRadioVolume(volumePercent: number) {
    if (!this.radioMasterGain || !this.ctx) return;
    const gain = (Math.max(0, Math.min(100, volumePercent)) / 100) * 0.18;
    this.radioMasterGain.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.1);
  }

  public update(time: number, focusedPlanetId: string | null) {
    if (!this.ctx || !this.isInitialized) return;

    // Modulate Laplace resonance chord beats dynamically with orbital positions
    if (this.laplaceGains.length >= 4) {
      const beat1 = 0.5 + 0.5 * Math.sin(time * 0.008);
      const beat2 = 0.5 + 0.5 * Math.sin(time * 0.004);
      const beat3 = 0.5 + 0.5 * Math.sin(time * 0.002);

      this.laplaceGains[0].gain.setTargetAtTime(0.35 * beat3, this.ctx.currentTime, 0.2);
      this.laplaceGains[1].gain.setTargetAtTime(0.30 * beat2, this.ctx.currentTime, 0.2);
      this.laplaceGains[2].gain.setTargetAtTime(0.25 * beat1, this.ctx.currentTime, 0.2);
    }

    // Dynamic Whistler / Chorus dispersion frequency modulation
    if (this.radioCarrier && this.radioBandpass && this.radioModulator) {
      if (focusedPlanetId === 'jupiter') {
        // Jovian Decametric Emission (rapid rising chirps)
        const chirpFreq = 300 + 400 * (0.5 + 0.5 * Math.sin(time * 0.4));
        this.radioBandpass.frequency.setTargetAtTime(chirpFreq, this.ctx.currentTime, 0.05);
        this.radioModulator.frequency.setTargetAtTime(4.5, this.ctx.currentTime, 0.1);
      } else if (focusedPlanetId === 'saturn') {
        // Saturn Kilometric Radiation (smooth ghostly whistling sweeps)
        const sweepFreq = 180 + 220 * (0.5 + 0.5 * Math.sin(time * 0.05));
        this.radioBandpass.frequency.setTargetAtTime(sweepFreq, this.ctx.currentTime, 0.1);
        this.radioModulator.frequency.setTargetAtTime(0.8, this.ctx.currentTime, 0.2);
      } else {
        // Ambient interstellar plasma background
        const ambientFreq = 220 + 80 * Math.sin(time * 0.02);
        this.radioBandpass.frequency.setTargetAtTime(ambientFreq, this.ctx.currentTime, 0.2);
        this.radioModulator.frequency.setTargetAtTime(0.5, this.ctx.currentTime, 0.2);
      }
    }
  }

  public dispose() {
    this.laplaceOscs.forEach(o => {
      try { o.stop(); o.disconnect(); } catch (_) {}
    });
    if (this.radioCarrier) {
      try { this.radioCarrier.stop(); this.radioCarrier.disconnect(); } catch (_) {}
    }
    if (this.radioModulator) {
      try { this.radioModulator.stop(); this.radioModulator.disconnect(); } catch (_) {}
    }
  }
}
