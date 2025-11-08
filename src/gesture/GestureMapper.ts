import { GestureData } from './HandTracker';
import { GranularSynth } from '../audio/GranularSynth';

export class GestureMapper {
  private synth: GranularSynth;
  private smoothingFactor: number = 0.3;
  private previousValues: Map<string, number> = new Map();

  constructor(synth: GranularSynth) {
    this.synth = synth;
  }

  private smooth(key: string, value: number): number {
    const prev = this.previousValues.get(key) || value;
    const smoothed = prev + (value - prev) * this.smoothingFactor;
    this.previousValues.set(key, smoothed);
    return smoothed;
  }

  mapGesturesToSynth(gestureData: GestureData) {
    const hasHand = gestureData.rightHand || gestureData.leftHand;

    if (!hasHand) {
      return;
    }

    const handHeight = this.smooth('height', gestureData.handHeight);
    const frequency = 100 + handHeight * 1500;
    this.synth.setFrequency(frequency);

    const handSpread = this.smooth('spread', gestureData.handSpread);
    const grainDensity = 5 + handSpread * 40;
    this.synth.setGrainDensity(grainDensity);

    const pinchDistance = this.smooth('pinch', gestureData.pinchDistance);
    const pitchVariation = pinchDistance * 1.5;
    this.synth.setPitchVariation(pitchVariation);

    const normalizedRotation =
      (gestureData.palmRotation + Math.PI) / (2 * Math.PI);
    const rotation = this.smooth('rotation', normalizedRotation);
    const grainDuration = 0.02 + rotation * 0.48;
    this.synth.setGrainDuration(grainDuration);

    const damping = 0.995 + handSpread * 0.0049;
    this.synth.setDamping(damping);

    const filterFreq = 500 + handHeight * 7500;
    this.synth.setFilterFrequency(filterFreq);

    const volume = Math.min(handSpread * 1.5, 0.5);
    this.synth.setMasterVolume(volume);
  }

  setSmoothingFactor(factor: number) {
    this.smoothingFactor = Math.max(0.1, Math.min(1, factor));
  }
}
