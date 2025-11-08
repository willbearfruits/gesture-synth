import { useEffect, useRef, useState } from 'react';
import { Play, Square, Hand } from 'lucide-react';
import { GranularSynth } from './audio/GranularSynth';
import { HandTracker, GestureData } from './gesture/HandTracker';
import { GestureMapper } from './gesture/GestureMapper';
import { VideoCanvas } from './components/VideoCanvas';
import { ParameterDisplay } from './components/ParameterDisplay';
import { AudioVisualizer } from './components/AudioVisualizer';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gestureData, setGestureData] = useState<GestureData | null>(null);
  const [synthParams, setSynthParams] = useState({
    frequency: 220,
    grainDensity: 10,
    grainDuration: 0.1,
    pitchVariation: 0.1,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const synthRef = useRef<GranularSynth | null>(null);
  const trackerRef = useRef<HandTracker | null>(null);
  const mapperRef = useRef<GestureMapper | null>(null);

  useEffect(() => {
    const synth = new GranularSynth();
    synthRef.current = synth;

    return () => {
      synth.stop();
    };
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    const tracker = new HandTracker(videoRef.current);
    trackerRef.current = tracker;

    if (synthRef.current) {
      const mapper = new GestureMapper(synthRef.current);
      mapperRef.current = mapper;

      tracker.setOnResults((data: GestureData) => {
        setGestureData(data);
        if (isPlaying) {
          mapper.mapGesturesToSynth(data);

          setSynthParams({
            frequency: 100 + data.handHeight * 1500,
            grainDensity: 5 + data.handSpread * 40,
            grainDuration: 0.02 + ((data.palmRotation + Math.PI) / (2 * Math.PI)) * 0.48,
            pitchVariation: data.pinchDistance * 1.5,
          });
        }
      });

      tracker.start();
    }

    return () => {
      tracker.stop();
    };
  }, [isPlaying]);

  const togglePlayback = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.stop();
      setIsPlaying(false);
    } else {
      synthRef.current.start();
      setIsPlaying(true);
    }
  };

  const parameters = [
    { label: 'Frequency', value: synthParams.frequency, unit: 'Hz' },
    { label: 'Grain Density', value: synthParams.grainDensity, unit: '/s' },
    { label: 'Grain Duration', value: synthParams.grainDuration * 1000, unit: 'ms' },
    { label: 'Pitch Variation', value: synthParams.pitchVariation * 100, unit: '%' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Hand className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Gesture Granular Synth
            </h1>
          </div>
          <p className="text-gray-400">
            Control Karplus-Strong synthesis with your hand movements
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Camera Feed</h2>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover transform -scale-x-100"
                autoPlay
                playsInline
                muted
              />
              <VideoCanvas
                landmarks={{
                  left: gestureData?.leftHand || null,
                  right: gestureData?.rightHand || null,
                }}
              />
            </div>
            <div className="mt-4 text-sm text-gray-400 text-center">
              {gestureData?.rightHand || gestureData?.leftHand
                ? 'Hand detected - Move to control synth'
                : 'Waiting for hand detection...'}
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Audio Waveform</h2>
            <AudioVisualizer
              audioContext={synthRef.current?.getContext() || null}
              analyserNode={synthRef.current?.getAnalyserNode() || null}
            />

            <div className="mt-6">
              <button
                onClick={togglePlayback}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 ${
                  isPlaying
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                    : 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square className="w-6 h-6" />
                    Stop Synthesis
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    Start Synthesis
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
              <h3 className="text-sm font-semibold mb-2 text-gray-300">
                Gesture Controls:
              </h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Hand Height → Frequency</li>
                <li>• Hand Spread → Grain Density & Volume</li>
                <li>• Pinch Distance → Pitch Variation</li>
                <li>• Palm Rotation → Grain Duration</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Synthesis Parameters</h2>
          <ParameterDisplay parameters={parameters} />
        </div>
      </div>
    </div>
  );
}

export default App;
