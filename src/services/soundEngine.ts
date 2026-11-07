/**
 * Institutional Quantitative Web Audio Engine
 * Generates synthesizer chimes & radar sonar pings natively using the Web Audio API.
 * No external mp3 files required, zero latency, 100% offline resilient.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5; // 0.0 to 1.0

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Sound 1: "MODO ESPEJO ACTIVO" (Pearson r > 0.85)
   * A modern cybernetic tri-tone chime (D5 -> A5 -> D6) indicating lock-in.
   */
  public playMirrorModeAlert() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.35, now);
    masterGain.connect(ctx.destination);

    const tones = [
      { freq: 587.33, start: 0.0, dur: 0.12 }, // D5
      { freq: 880.00, start: 0.1, dur: 0.14 }, // A5
      { freq: 1174.66, start: 0.22, dur: 0.32 }, // D6
    ];

    tones.forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(t.freq, now + t.start);

      gain.gain.setValueAtTime(0.001, now + t.start);
      gain.gain.exponentialRampToValueAtTime(1.0, now + t.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t.start + t.dur);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + t.start);
      osc.stop(now + t.start + t.dur + 0.05);
    });
  }

  /**
   * Sound 2: "ZONA DE ATRACCIÓN DETECTADA" (Radar Confluence)
   * An urgent dual-frequency sonar ping (1046Hz -> 1567Hz) with institutional radar resonance.
   */
  public playMagneticRadarAlert() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.45, now);
    masterGain.connect(ctx.destination);

    // Primary sonar sweep
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1046.5, now); // C6
    osc1.frequency.exponentialRampToValueAtTime(1567.98, now + 0.09); // G6

    gain1.gain.setValueAtTime(0.01, now);
    gain1.gain.linearRampToValueAtTime(1.0, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Secondary echo ping for sonar depth
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1567.98, now + 0.16);

    gain2.gain.setValueAtTime(0.001, now + 0.16);
    gain2.gain.linearRampToValueAtTime(0.8, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.16);
    osc2.stop(now + 0.48);
  }

  /**
   * Preview helper to test volume and sound
   */
  public testSound(type: 'mirror' | 'radar') {
    if (type === 'mirror') {
      this.playMirrorModeAlert();
    } else {
      this.playMagneticRadarAlert();
    }
  }
}

export const soundEngine = new SoundEngine();
