import { useState, useEffect, useRef } from 'react';
import { WebcamBackground } from './components/WebcamBackground';
import { WindowSystem } from './components/WindowSystem';
import { Dock } from './components/Dock';
import { Cursor } from './components/Cursor';
import { ControlCenter } from './components/ControlCenter';
import { systemStore } from './store/SystemStore';
import { Volume2, VolumeX } from 'lucide-react';

function App() {
  const [systemState, setSystemState] = useState(systemStore.getState());
  const [showVolume, setShowVolume] = useState(false);
  const volumeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return systemStore.subscribe(setSystemState);
  }, []);

  // Show volume toast when volume changes
  useEffect(() => {
    setShowVolume(true);
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    volumeTimeoutRef.current = setTimeout(() => setShowVolume(false), 2000);
  }, [systemState.volume]);

  // Map 0-100 brightness to 0.8-0 opacity (0 brightness = 80% black, 100 brightness = 0% black)
  const darknessOpacity = (100 - systemState.brightness) / 100 * 0.85;

  return (
    <div className="w-screen h-screen overflow-hidden relative font-sans text-apple-dark">
      {/* Global Brightness Dimming Overlay */}
      <div
        className="fixed inset-0 bg-black pointer-events-none z-[9999] transition-opacity duration-75"
        style={{ opacity: darknessOpacity }}
      />

      {/* Volume HUD Toast */}
      <div
        className={`fixed top-12 left-1/2 -translate-x-1/2 z-[9999] bg-black/60 backdrop-blur-2xl border border-white/20 px-6 py-3 rounded-full flex items-center gap-4 transition-all duration-300 pointer-events-none shadow-2xl ${showVolume ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}
      >
        {systemState.volume === 0 ? <VolumeX className="text-white" size={24} /> : <Volume2 className="text-white" size={24} />}
        <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white transition-all duration-75" style={{ width: `${systemState.volume}%` }} />
        </div>
      </div>

      {/* Background with Camera Feed */}
      <WebcamBackground />

      {/* App Dock (Bottom) */}
      <Dock />

      {/* Control Center (Top Right) */}
      <ControlCenter />

      {/* The Floating Windows */}
      <WindowSystem />

      {/* Global Custom Cursor */}
      <Cursor />
    </div>
  );
}

export default App;
