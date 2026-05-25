// Tiny Web Audio synthesizer for a soft "Happy Birthday" jingle.
// Public domain melody (since 2016). No external asset needed.

type Note = { freq: number; dur: number }; // dur in beats

// Happy Birthday in F major (gentle, recognizable)
// Beats: quarter = 1, dotted-quarter = 1.5, eighth = 0.5, half = 2
const F4 = 349.23, G4 = 392.0, A4 = 440.0, AS4 = 466.16, C5 = 523.25, D5 = 587.33, F5 = 698.46;

const MELODY: Note[] = [
  // Happy birth-day to you
  { freq: F4, dur: 0.75 }, { freq: F4, dur: 0.25 }, { freq: G4, dur: 1 }, { freq: F4, dur: 1 }, { freq: AS4, dur: 1 }, { freq: A4, dur: 2 },
  // Happy birth-day to you
  { freq: F4, dur: 0.75 }, { freq: F4, dur: 0.25 }, { freq: G4, dur: 1 }, { freq: F4, dur: 1 }, { freq: C5, dur: 1 }, { freq: AS4, dur: 2 },
  // Happy birth-day dear ___
  { freq: F4, dur: 0.75 }, { freq: F4, dur: 0.25 }, { freq: F5, dur: 1 }, { freq: D5, dur: 1 }, { freq: AS4, dur: 1 }, { freq: A4, dur: 1 }, { freq: G4, dur: 1 },
  // Happy birth-day to you
  { freq: 0, dur: 0.5 },
  { freq: F5, dur: 0.75 }, { freq: F5, dur: 0.25 }, { freq: D5, dur: 1 }, { freq: AS4, dur: 1 }, { freq: C5, dur: 1 }, { freq: AS4, dur: 2 },
];

const BPM = 130;
const SECONDS_PER_BEAT = 60 / BPM;

export class BirthdayJingle {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private scheduled: OscillatorNode[] = [];
  private endTimeout: number | null = null;
  private _isPlaying = false;
  private _volume = 0.18;
  private _muted = false;

  get isPlaying() { return this._isPlaying; }

  private ensureCtx() {
    if (!this.ctx) {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this._muted ? 0 : this._volume;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  setVolume(v: number) {
    this._volume = v;
    if (this.master && !this._muted) this.master.gain.setTargetAtTime(v, this.ctx!.currentTime, 0.05);
  }

  setMuted(m: boolean) {
    this._muted = m;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : this._volume, this.ctx.currentTime, 0.05);
    }
  }

  async play({ loop = false, volume = 0.18 }: { loop?: boolean; volume?: number } = {}) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();
    this.stop();
    this._volume = volume;
    if (this.master) this.master.gain.value = this._muted ? 0 : volume;
    this._isPlaying = true;
    this.scheduleMelody(ctx.currentTime, loop);
  }

  private scheduleMelody(startAt: number, loop: boolean) {
    if (!this.ctx || !this.master) return;
    let t = startAt;
    for (const note of MELODY) {
      const dur = note.dur * SECONDS_PER_BEAT;
      if (note.freq > 0) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = note.freq;
        // ADSR-ish envelope so notes don't click
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.9, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.6, t + dur * 0.6);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95);
        osc.connect(g);
        g.connect(this.master);
        osc.start(t);
        osc.stop(t + dur);
        this.scheduled.push(osc);
      }
      t += dur;
    }
    const totalMs = (t - startAt) * 1000;
    this.endTimeout = window.setTimeout(() => {
      this.scheduled = [];
      if (loop && this._isPlaying) {
        this.scheduleMelody(this.ctx!.currentTime + 0.6, true);
      } else {
        this._isPlaying = false;
      }
    }, totalMs + 100);
  }

  stop() {
    if (this.endTimeout) { clearTimeout(this.endTimeout); this.endTimeout = null; }
    for (const o of this.scheduled) { try { o.stop(); } catch {} }
    this.scheduled = [];
    this._isPlaying = false;
  }

  dispose() {
    this.stop();
    if (this.ctx) { try { this.ctx.close(); } catch {} this.ctx = null; this.master = null; }
  }
}
