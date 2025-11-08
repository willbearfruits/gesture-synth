import { KarplusStrongVoice } from './KarplusStrong';

interface Grain {
  voice: KarplusStrongVoice;
  startTime: number;
  duration: number;
}

export class GranularSynth {
  private context: AudioContext;
  private masterGain: GainNode;
  private grains: Grain[] = [];
  private grainDuration: number = 0.1;
  private grainDensity: number = 10;
  private pitchVariation: number = 0.1;
  private baseFrequency: number = 220;
  private isActive: boolean = false;
  private lastGrainTime: number = 0;

  constructor() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.context.destination);
  }

  start() {
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    this.isActive = true;
    this.scheduleGrains();
  }

  stop() {
    this.isActive = false;
    this.grains.forEach((grain) => grain.voice.stop());
    this.grains = [];
  }

  private scheduleGrains() {
    if (!this.isActive) return;

    const now = this.context.currentTime;
    const timeSinceLastGrain = now - this.lastGrainTime;
    const grainInterval = 1 / this.grainDensity;

    if (timeSinceLastGrain >= grainInterval) {
      this.createGrain();
      this.lastGrainTime = now;
    }

    this.cleanupOldGrains();

    requestAnimationFrame(() => this.scheduleGrains());
  }

  private createGrain() {
    const voice = new KarplusStrongVoice(this.context, this.masterGain);

    const pitchOffset = (Math.random() - 0.5) * 2 * this.pitchVariation;
    const frequency = this.baseFrequency * Math.pow(2, pitchOffset);
    const velocity = 0.5 + Math.random() * 0.5;

    voice.pluck(frequency, velocity);

    const grain: Grain = {
      voice,
      startTime: this.context.currentTime,
      duration: this.grainDuration,
    };

    this.grains.push(grain);
  }

  private cleanupOldGrains() {
    const now = this.context.currentTime;
    this.grains = this.grains.filter((grain) => {
      const age = now - grain.startTime;
      if (age > grain.duration + 1) {
        grain.voice.disconnect();
        return false;
      }
      return true;
    });
  }

  setFrequency(frequency: number) {
    this.baseFrequency = Math.max(50, Math.min(2000, frequency));
  }

  setGrainDuration(duration: number) {
    this.grainDuration = Math.max(0.01, Math.min(1, duration));
  }

  setGrainDensity(density: number) {
    this.grainDensity = Math.max(1, Math.min(50, density));
  }

  setPitchVariation(variation: number) {
    this.pitchVariation = Math.max(0, Math.min(2, variation));
  }

  setDamping(damping: number) {
    this.grains.forEach((grain) => grain.voice.setDamping(damping));
  }

  setFilterFrequency(frequency: number) {
    this.grains.forEach((grain) => grain.voice.setFilterFrequency(frequency));
  }

  setMasterVolume(volume: number) {
    this.masterGain.gain.setValueAtTime(
      Math.max(0, Math.min(1, volume)),
      this.context.currentTime
    );
  }

  getContext(): AudioContext {
    return this.context;
  }
}
