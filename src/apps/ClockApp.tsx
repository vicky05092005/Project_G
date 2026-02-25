import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gestureStore } from '../store/GestureStore';
import { Play, Square, RotateCcw } from 'lucide-react';

export function ClockApp() {
    const [mode, setMode] = useState<'clock' | 'timer'>('clock');

    // Clock State
    const [time, setTime] = useState(new Date());

    // Timer State
    const [timerValue, setTimerValue] = useState(0); // in ms
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const lastTickRef = useRef<number>(0);
    const lastToggleRef = useRef<number>(0);

    // Swipe Detection State
    const swipeHistory = useRef<{ x: number, y: number, time: number }[]>([]);
    const appContainerRef = useRef<HTMLDivElement>(null);

    // Clock Tick
    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Timer Loop
    useEffect(() => {
        let animationFrame: number;

        const tick = () => {
            if (isTimerRunning) {
                const now = performance.now();
                const delta = now - lastTickRef.current;
                setTimerValue(prev => prev + delta);
                lastTickRef.current = now;
                animationFrame = requestAnimationFrame(tick);
            }
        };

        if (isTimerRunning) {
            lastTickRef.current = performance.now();
            animationFrame = requestAnimationFrame(tick);
        }

        return () => cancelAnimationFrame(animationFrame);
    }, [isTimerRunning]);

    // Swipe Gesture Detection
    useEffect(() => {
        let cooldown = false;

        const unsubscribe = gestureStore.subscribe((state) => {
            if (!appContainerRef.current || cooldown) return;

            // Check if cursor is over the app
            const rect = appContainerRef.current.getBoundingClientRect();
            const overApp = state.cursorX >= rect.left && state.cursorX <= rect.right &&
                state.cursorY >= rect.top && state.cursorY <= rect.bottom;

            if (!overApp) {
                swipeHistory.current = [];
                return;
            }

            const now = performance.now();
            swipeHistory.current.push({ x: state.cursorX, y: state.cursorY, time: now });

            // Keep only last 500ms of history
            swipeHistory.current = swipeHistory.current.filter(p => now - p.time < 500);

            if (swipeHistory.current.length > 10 && !state.isPinching) {
                const start = swipeHistory.current[0];
                const end = swipeHistory.current[swipeHistory.current.length - 1];
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const timeDiff = end.time - start.time;

                // If moved fast enough horizontally
                if (dist > 150 && timeDiff < 400 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                    if (dx > 0 && mode === 'timer') {
                        // Swipe Right
                        setMode('clock');
                        triggerCooldown();
                    } else if (dx < 0 && mode === 'clock') {
                        // Swipe Left
                        setMode('timer');
                        triggerCooldown();
                    }
                }
            }
        });

        const triggerCooldown = () => {
            cooldown = true;
            swipeHistory.current = [];
            setTimeout(() => { cooldown = false; }, 800);
        };

        return unsubscribe;
    }, [mode]);

    // Formatting Helpers
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    const formatTimer = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((ms % 1000) / 10); // 2 digits

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        const now = performance.now();
        if (now - lastToggleRef.current < 250) return; // Prevent double-click from gesture engine
        lastToggleRef.current = now;
        setIsTimerRunning(prev => !prev);
    };

    const resetTimer = () => {
        setIsTimerRunning(false);
        setTimerValue(0);
    };

    return (
        <div ref={appContainerRef} className="h-full w-full bg-[#f5f5f7]/80 backdrop-blur-3xl flex flex-col items-center justify-center select-none overflow-hidden relative shadow-inner">

            {/* Top Toggle Switch */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center bg-black/10 rounded-full p-1 z-10 transition-colors">
                <button
                    data-clickable="true"
                    onClick={() => setMode('clock')}
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${mode === 'clock' ? 'bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] text-apple-dark' : 'text-apple-dark/60 hover:text-apple-dark'}`}
                >
                    Clock
                </button>
                <button
                    data-clickable="true"
                    onClick={() => setMode('timer')}
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${mode === 'timer' ? 'bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] text-[#0A84FF]' : 'text-apple-dark/60 hover:text-apple-dark'}`}
                >
                    Timer
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full flex items-center justify-center relative mt-16">
                <AnimatePresence mode="wait">
                    {mode === 'clock' ? (
                        <motion.div
                            key="clock"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-center"
                        >
                            <h2 className="text-xl font-medium text-apple-dark/60 tracking-wide uppercase mb-2">
                                {formatDate(time)}
                            </h2>
                            <h1 className="text-8xl font-light text-apple-dark tracking-tighter tabular-nums">
                                {formatTime(time)}
                            </h1>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="timer"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-center w-full"
                        >
                            <h1 className={`text-8xl font-light tracking-tighter tabular-nums transition-colors duration-500 mb-12 ${isTimerRunning ? 'text-[#0A84FF]' : 'text-apple-dark'}`}>
                                {formatTimer(timerValue)}
                            </h1>

                            <div className="flex gap-8">
                                <button
                                    data-clickable="true"
                                    onClick={resetTimer}
                                    className="w-20 h-20 rounded-full border border-black/10 bg-white shadow-sm flex items-center justify-center text-apple-dark hover:bg-black/5 data-[hovered=true]:bg-black/5 data-[pinched=true]:scale-90 transition-all group"
                                >
                                    <RotateCcw size={24} className="text-apple-dark/70 group-hover:text-apple-dark transition-colors pointer-events-none" />
                                </button>

                                <button
                                    data-clickable="true"
                                    onClick={toggleTimer}
                                    className={`w-20 h-20 rounded-full shadow-md flex items-center justify-center transition-all data-[pinched=true]:scale-90 ${isTimerRunning ? 'bg-[#ff3b30]/10 text-[#ff3b30] hover:bg-[#ff3b30]/20 data-[hovered=true]:bg-[#ff3b30]/20' : 'bg-[#0A84FF]/10 text-[#0A84FF] hover:bg-[#0A84FF]/20 data-[hovered=true]:bg-[#0A84FF]/20'}`}
                                >
                                    {isTimerRunning ? <Square size={24} fill="currentColor" className="pointer-events-none" /> : <Play size={28} fill="currentColor" className="ml-1 pointer-events-none" />}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
