import { useRef } from 'react';
import { useGestureTracking } from '../hooks/useGestureTracking';

export function WebcamBackground() {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Initialize MediaPipe and hand tracking
    useGestureTracking(videoRef);

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-apple-gray">
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1] blur-[30px] opacity-80"
                playsInline
                muted
                autoPlay
            />
            {/* Soft gradient overlay to brighten the background Apple-style */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10" />
        </div>
    );
}
