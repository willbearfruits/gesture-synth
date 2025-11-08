import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export interface HandLandmarks {
  x: number;
  y: number;
  z: number;
}

export interface GestureData {
  leftHand: HandLandmarks[] | null;
  rightHand: HandLandmarks[] | null;
  pinchDistance: number;
  handHeight: number;
  handSpread: number;
  palmRotation: number;
}

export class HandTracker {
  private hands: Hands;
  private camera: Camera | null = null;
  private videoElement: HTMLVideoElement;
  private onResults: ((data: GestureData) => void) | null = null;

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;

    this.hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.hands.onResults(this.handleResults.bind(this));
  }

  async start() {
    this.camera = new Camera(this.videoElement, {
      onFrame: async () => {
        await this.hands.send({ image: this.videoElement });
      },
      width: 640,
      height: 480,
    });

    await this.camera.start();
  }

  stop() {
    if (this.camera) {
      this.camera.stop();
    }
  }

  setOnResults(callback: (data: GestureData) => void) {
    this.onResults = callback;
  }

  private handleResults(results: Results) {
    const gestureData: GestureData = {
      leftHand: null,
      rightHand: null,
      pinchDistance: 0,
      handHeight: 0.5,
      handSpread: 0,
      palmRotation: 0,
    };

    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        const handedness = results.multiHandedness[i].label;

        if (handedness === 'Left') {
          gestureData.leftHand = landmarks as HandLandmarks[];
        } else {
          gestureData.rightHand = landmarks as HandLandmarks[];
        }
      }

      const primaryHand = gestureData.rightHand || gestureData.leftHand;

      if (primaryHand) {
        const thumb = primaryHand[4];
        const indexFinger = primaryHand[8];
        const pinky = primaryHand[20];
        const wrist = primaryHand[0];

        gestureData.pinchDistance = Math.sqrt(
          Math.pow(thumb.x - indexFinger.x, 2) +
            Math.pow(thumb.y - indexFinger.y, 2)
        );

        gestureData.handHeight = 1 - wrist.y;

        gestureData.handSpread = Math.sqrt(
          Math.pow(indexFinger.x - pinky.x, 2) +
            Math.pow(indexFinger.y - pinky.y, 2)
        );

        const middleFinger = primaryHand[12];
        gestureData.palmRotation = Math.atan2(
          middleFinger.y - wrist.y,
          middleFinger.x - wrist.x
        );
      }
    }

    if (this.onResults) {
      this.onResults(gestureData);
    }
  }
}
