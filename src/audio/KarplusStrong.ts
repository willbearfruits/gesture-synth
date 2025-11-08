export class KarplusStrongVoice {
  private context: AudioContext;
  private worklet: AudioWorkletNode | null = null;
  private gainNode: GainNode;
  private filterNode: BiquadFilterNode;
  private osc: OscillatorNode;
  private isPlaying: boolean = false;

  constructor(context: AudioContext, destination: AudioNode) {
    this.context = context;

    this.gainNode = context.createGain();
    this.gainNode.gain.value = 0;

    this.filterNode = context.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 8000;

    this.osc = context.createOscillator();
    this.osc.type = 'triangle';

    this.osc.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(destination);

    this.osc.start();
  }

  pluck(frequency: number, velocity: number = 1.0) {
    this.osc.frequency.setValueAtTime(frequency, this.context.currentTime);

    this.isPlaying = true;

    this.gainNode.gain.cancelScheduledValues(this.context.currentTime);
    this.gainNode.gain.setValueAtTime(0.2 * velocity, this.context.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.context.currentTime + 2
    );
  }

  setDamping(value: number) {
    const mapped = Math.max(1000, Math.min(10000, value * 5000));
    this.filterNode.frequency.setValueAtTime(
      mapped,
      this.context.currentTime
    );
  }

  setFilterFrequency(value: number) {
    this.filterNode.frequency.setValueAtTime(
      value,
      this.context.currentTime
    );
  }

  stop() {
    this.isPlaying = false;
    this.gainNode.gain.cancelScheduledValues(this.context.currentTime);
    this.gainNode.gain.setValueAtTime(0, this.context.currentTime);
  }

  disconnect() {
    this.stop();
    this.osc.stop();
    this.osc.disconnect();
    this.filterNode.disconnect();
    this.gainNode.disconnect();
  }
}
