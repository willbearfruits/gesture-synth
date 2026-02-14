# Gesture Synth

An experimental web-based audio synthesizer controlled by hand gestures using computer vision.

## Live Demo

- GitHub Pages: https://willbearfruits.github.io/gesture-synth/

## Overview

This project combines Karplus-Strong string synthesis with granular audio processing, controlled through hand tracking via your webcam. Move your hands to manipulate sound parameters in real-time.

## Features

- **Karplus-Strong Synthesis** - Physical string modeling for organic tones
- **Granular Audio Processing** - Texture and atmosphere creation
- **Hand Gesture Control** - MediaPipe-powered real-time hand tracking
- **Visual Feedback** - Audio visualization and hand tracking display
- **Web-Based** - Runs entirely in the browser

## Tech Stack

- **React** + **TypeScript** - UI framework
- **Vite** - Build tool and dev server
- **MediaPipe Hands** - Hand tracking and gesture recognition
- **Web Audio API** - Real-time audio synthesis
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A webcam
- Modern web browser (Chrome/Edge recommended for best performance)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Usage

1. Allow camera access when prompted
2. Position your hands in view of the webcam
3. Move your hands to control synthesis parameters:
   - Hand position controls pitch/frequency
   - Hand distance modulates effects
   - Gesture recognition triggers synthesis modes

## Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Preview production build
npm run preview
```

## Deploy (GitHub Pages)

This repository deploys automatically to GitHub Pages from `main` using:

- `.github/workflows/deploy-pages.yml`

## Security

- MediaPipe runtime assets are pinned to an explicit CDN version in `src/gesture/HandTracker.ts`.
- Report vulnerabilities per `SECURITY.md`.

## Project Structure

```
src/
├── audio/
│   ├── KarplusStrong.ts    # String synthesis engine
│   └── GranularSynth.ts    # Granular processor
├── gesture/
│   ├── HandTracker.ts      # MediaPipe integration
│   └── GestureMapper.ts    # Gesture → audio parameter mapping
├── components/
│   ├── VideoCanvas.tsx     # Camera/hand tracking display
│   ├── AudioVisualizer.tsx # Audio waveform visualization
│   └── ParameterDisplay.tsx # Real-time parameter display
└── App.tsx                 # Main application
```

## Future Ideas

- MIDI output support
- Preset system
- Multi-user jam sessions
- Recording/playback
- Additional synthesis engines

---

*Built with hand gestures and creative coding*

## License

MIT (`LICENSE`)
