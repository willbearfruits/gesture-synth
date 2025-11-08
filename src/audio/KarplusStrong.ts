export class KarplusStrongVoice {
  private context: AudioContext;
  private buffer: Float32Array;
  private bufferIndex: number = 0;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode;
  private filterNode: BiquadFilterNode;
  private scriptNode: ScriptProcessorNode;
  private isPlaying: boolean = false;
  private damping: number = 0.996;

  constructor(context: AudioContext, destination: AudioNode) {
    this.context = context;
    this.buffer = new Float32Array(4096);

    this.gainNode = context.createGain();
    this.gainNode.gain.value = 0;

    this.filterNode = context.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 8000;

    this.scriptNode = context.createScriptProcessor(256, 0, 1);
    this.scriptNode.onaudioprocess = this.processAudio.bind(this);

    this.scriptNode.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(destination);
  }

  private processAudio(event: AudioProcessingEvent) {
    if (!this.isPlaying) return;

    const output = event.outputBuffer.getChannelData(0);

    for (let i = 0; i < output.length; i++) {
      const bufferSize = this.buffer.length;
      const currentSample = this.buffer[this.bufferIndex];
      const nextIndex = (this.bufferIndex + 1) % bufferSize;
      const nextSample = this.buffer[nextIndex];

      const avgSample = (currentSample + nextSample) * 0.5 * this.damping;

      this.buffer[this.bufferIndex] = avgSample;
      output[i] = currentSample;

      this.bufferIndex = nextIndex;
    }
  }

  pluck(frequency: number, velocity: number = 1.0) {
    const sampleRate = this.context.sampleRate;
    const delayLength = Math.floor(sampleRate / frequency);

    this.buffer = new Float32Array(delayLength);

    for (let i = 0; i < delayLength; i++) {
      this.buffer[i] = (Math.random() * 2 - 1) * velocity;
    }

    this.bufferIndex = 0;
    this.isPlaying = true;

    this.gainNode.gain.cancelScheduledValues(this.context.currentTime);
    this.gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.context.currentTime + 4
    );
  }

  setDamping(value: number) {
    this.damping = Math.max(0.9, Math.min(0.9999, value));
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
    this.scriptNode.disconnect();
    this.filterNode.disconnect();
    this.gainNode.disconnect();
  }
}
