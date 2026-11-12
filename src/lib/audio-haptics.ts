class AudioHapticsEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("fold.sound.v1");
        this.muted = stored === "muted";
      } catch {}
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    try {
      localStorage.setItem("fold.sound.v1", this.muted ? "muted" : "active");
    } catch {}
    if (!this.muted) {
      this.trigger("toggle");
    }
    return this.muted;
  }

  public trigger(type: "tap" | "toggle" | "format" | "delete" | "success" = "tap"): void {
    if (this.muted) return;
    const c = this.getContext();
    if (!c) return;

    const now = c.currentTime;

    try {
      switch (type) {
        case "tap": {
          const osc = c.createOscillator();
          const gain = c.createGain();
          const filter = c.createBiquadFilter();

          osc.type = "sine";
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(350, now + 0.015);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(2000, now);

          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(c.destination);

          osc.start(now);
          osc.stop(now + 0.015);
          break;
        }

        case "toggle": {
          const osc = c.createOscillator();
          const gain = c.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.035);

          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

          osc.connect(gain);
          gain.connect(c.destination);

          osc.start(now);
          osc.stop(now + 0.035);
          break;
        }

        case "format": {
          const osc = c.createOscillator();
          const gain = c.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(640, now);
          osc.frequency.exponentialRampToValueAtTime(780, now + 0.02);

          gain.gain.setValueAtTime(0.035, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

          osc.connect(gain);
          gain.connect(c.destination);

          osc.start(now);
          osc.stop(now + 0.02);
          break;
        }

        case "delete": {
          const osc = c.createOscillator();
          const gain = c.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(280, now);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.045);

          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

          osc.connect(gain);
          gain.connect(c.destination);

          osc.start(now);
          osc.stop(now + 0.045);
          break;
        }

        case "success": {
          const osc1 = c.createOscillator();
          const osc2 = c.createOscillator();
          const gain = c.createGain();

          osc1.type = "sine";
          osc2.type = "sine";
          osc1.frequency.setValueAtTime(587.33, now); // D5
          osc2.frequency.setValueAtTime(880, now + 0.04); // A5

          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(c.destination);

          osc1.start(now);
          osc1.stop(now + 0.05);
          osc2.start(now + 0.04);
          osc2.stop(now + 0.1);
          break;
        }
      }
    } catch {
      // Audio playback can occasionally be blocked by browser autoplay policies
    }
  }
}

export const audioHaptics = new AudioHapticsEngine();
