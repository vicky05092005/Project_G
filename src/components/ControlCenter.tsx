import { useState, useRef, useEffect } from 'react';
import { Settings, Sun, Volume2 } from 'lucide-react';
import { gestureStore } from '../store/GestureStore';
import { systemStore } from '../store/SystemStore';

function GestureSlider({
    value,
    min = 0,
    max = 100,
    onChange,
    icon: Icon
}: {
    value: number,
    min?: number,
    max?: number,
    onChange: (val: number) => void,
    icon: any
}) {
    const trackRef = useRef<HTMLDivElement>(null);
    const isPinchingSlider = useRef(false);

    useEffect(() => {
        const unsubscribe = gestureStore.subscribe((state) => {
            if (state.isPinching && state.pinchStartEl) {
                if (!isPinchingSlider.current && trackRef.current?.contains(state.pinchStartEl)) {
                    isPinchingSlider.current = true;
                }
            }
            if (!state.isPinching) {
                isPinchingSlider.current = false;
            }

            if (isPinchingSlider.current && trackRef.current) {
                const rect = trackRef.current.getBoundingClientRect();
                let percentage = (state.cursorX - rect.left) / rect.width;
                percentage = Math.max(0, Math.min(1, percentage));
                const newValue = min + Math.round(percentage * (max - min));
                onChange(newValue);
            }
        });
        return unsubscribe;
    }, [min, max, onChange]);

    return (
        <div className="flex items-center gap-4 w-full">
            <Icon size={24} className="text-white/80 shrink-0" />
            <div
                ref={trackRef}
                className="relative flex-1 h-6 bg-white/20 rounded-full overflow-hidden cursor-pointer"
                data-clickable="true"
            >
                <div
                    className="absolute top-0 left-0 h-full bg-white/80 rounded-full pointer-events-none transition-all duration-75"
                    style={{ width: `${((value - min) / (max - min)) * 100}%` }}
                />
            </div>
        </div>
    );
}

export function ControlCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [systemState, setSystemState] = useState(systemStore.getState());

    useEffect(() => {
        return systemStore.subscribe(setSystemState);
    }, []);

    return (
        <div className="fixed top-10 right-20 z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                data-clickable="true"
                className="p-4 bg-black/40 backdrop-blur-xl border border-white/30 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:bg-black/50 data-[hovered=true]:bg-black/50 transition-all active:scale-95 data-[pinched=true]:scale-95"
            >
                <Settings className="text-white" size={28} />
            </button>

            {isOpen && (
                <div className="absolute top-20 right-0 w-80 bg-black/40 backdrop-blur-3xl border border-white/20 p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col gap-8 animate-in slide-in-from-top-4 fade-in duration-200">
                    <div className="text-white text-xl font-semibold mb-2">Control Center</div>
                    <div className="flex flex-col gap-2 text-white/70 text-sm">
                        <span>Brightness</span>
                        <GestureSlider
                            icon={Sun}
                            value={systemState.brightness}
                            onChange={(val) => systemStore.update({ brightness: val })}
                        />
                    </div>
                    <div className="flex flex-col gap-2 text-white/70 text-sm">
                        <span>Volume</span>
                        <GestureSlider
                            icon={Volume2}
                            value={systemState.volume}
                            onChange={(val) => systemStore.update({ volume: val })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
