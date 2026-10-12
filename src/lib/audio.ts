// Synthetic Web Audio Engine for Nahata Campaign
// Zero external files, zero latency, works offline & on all mobile browsers

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private isBgmPlaying: boolean = false;
  private bgmTimeout: NodeJS.Timeout | null = null;

  private initCtx() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopFestiveBGM();
    } else {
      this.startFestiveBGM();
    }
    return this.isMuted;
  }

  // Soft Indian Festive Devotional Melody (Raga Bhairav / Durga Shehnai Chords & Bells)
  public startFestiveBGM() {
    if (this.isMuted || this.isBgmPlaying) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    this.isBgmPlaying = true;

    // Traditional Auspicious Melody sequence: Sa, Re, Ga, Ma, Pa, Dha, Ni, Sa (Frequencies in Hz)
    const melody = [
      { note: 261.63, dur: 0.45 }, // Sa (C4)
      { note: 293.66, dur: 0.45 }, // Re (D4)
      { note: 329.63, dur: 0.60 }, // Ga (E4)
      { note: 392.00, dur: 0.80 }, // Pa (G4)
      { note: 329.63, dur: 0.45 }, // Ga (E4)
      { note: 392.00, dur: 0.50 }, // Pa (G4)
      { note: 523.25, dur: 1.10 }, // Taar Sa (C5)
      { note: 440.00, dur: 0.50 }, // Dha (A4)
      { note: 392.00, dur: 0.65 }, // Pa (G4)
      { note: 329.63, dur: 0.70 }, // Ga (E4)
      { note: 261.63, dur: 1.20 }, // Sa (C4)
    ];

    let currentOffset = 0;
    const playLoop = () => {
      if (!this.isBgmPlaying || this.isMuted) return;
      const now = ctx.currentTime;

      melody.forEach((step, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm Flute / Shehnai Harmonics tone
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(step.note, now + currentOffset);

        // Soft, ambient volume so it feels pleasant and not jarring
        gain.gain.setValueAtTime(0.001, now + currentOffset);
        gain.gain.linearRampToValueAtTime(0.08, now + currentOffset + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + currentOffset + step.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + currentOffset);
        osc.stop(now + currentOffset + step.dur);

        currentOffset += step.dur;
      });

      // Also add divine temple bell chime at loop start
      this.playFestiveBell();

      // Loop after full melody duration (~6.5 seconds)
      this.bgmTimeout = setTimeout(() => {
        currentOffset = 0;
        playLoop();
      }, 7200);
    };

    playLoop();
  }

  public stopFestiveBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimeout) {
      clearTimeout(this.bgmTimeout);
      this.bgmTimeout = null;
    }
  }

  // 1. Festive Celebration Chime (Winning Fanfare Arpeggio: C5 -> E5 -> G5 -> C6)
  public playCelebrationChime() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    const startTime = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.08);

      // Volume envelope with golden bell shimmer
      gain.gain.setValueAtTime(0.001, startTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.28, startTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.08 + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.08);
      osc.stop(startTime + idx * 0.08 + 0.7);
    });
  }

  // 2. Divine Temple Bell (Shankh / Mandir Ghanti Harmonics)
  public playFestiveBell() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const freqs = [587.33, 880.0, 1174.66, 1760.0]; // D5 and bright harmonics
    const startTime = ctx.currentTime;

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      const peakVol = 0.2 / (i + 1);
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(peakVol, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2 + i * 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.5);
    });
  }

  // 3. Playful Bouncing Whoosh (Logo Drop Entrance)
  public playBounceWhoosh() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  }

  // 4. Scratch Friction Sound
  public playScratchSound() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400 + Math.random() * 300, ctx.currentTime);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.07);
  }

  // 5. Tactile Tick / Share Step Ping
  public playTick() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5 crisp chime

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.09);
  }
}

export const soundEngine = new SoundEngine();
