import { useEffect, useRef } from 'react';
import { HandLandmarks } from '../gesture/HandTracker';

interface VideoCanvasProps {
  landmarks: { left: HandLandmarks[] | null; right: HandLandmarks[] | null };
}

export function VideoCanvas({ landmarks }: VideoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawHand = (hand: HandLandmarks[], color: string) => {
      ctx.fillStyle = color;
      hand.forEach((landmark) => {
        ctx.beginPath();
        ctx.arc(
          landmark.x * canvas.width,
          landmark.y * canvas.height,
          5,
          0,
          2 * Math.PI
        );
        ctx.fill();
      });

      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        [5, 9], [9, 13], [13, 17],
      ];

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      connections.forEach(([start, end]) => {
        ctx.beginPath();
        ctx.moveTo(
          hand[start].x * canvas.width,
          hand[start].y * canvas.height
        );
        ctx.lineTo(
          hand[end].x * canvas.width,
          hand[end].y * canvas.height
        );
        ctx.stroke();
      });
    };

    if (landmarks.left) {
      drawHand(landmarks.left, '#3b82f6');
    }
    if (landmarks.right) {
      drawHand(landmarks.right, '#10b981');
    }
  }, [landmarks]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={480}
      className="absolute top-0 left-0 w-full h-full"
    />
  );
}
