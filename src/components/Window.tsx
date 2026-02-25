import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { windowStore, type WindowState } from '../store/WindowStore';
import { gestureStore } from '../store/GestureStore';
import { X, Minus } from 'lucide-react';

interface WindowProps {
    window: WindowState;
    children: React.ReactNode;
}

export function Window({ window: win, children }: WindowProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Motion values for smooth native-like animations
    const x = useMotionValue(win.x);
    const y = useMotionValue(win.y);
    const width = useMotionValue(win.width);
    const height = useMotionValue(win.height);
    const scale = useSpring(win.isMinimized ? 0.8 : 1, { stiffness: 300, damping: 30 });
    const opacity = useSpring(win.isMinimized ? 0 : 1, { stiffness: 300, damping: 30 });

    // Interaction State
    const interactionRef = useRef<{
        type: 'drag' | 'resize-br' | 'resize-bl' | null;
        startX: number;
        startY: number;
        initialWinX: number;
        initialWinY: number;
        initialWinW: number;
        initialWinH: number;
    }>({
        type: null,
        startX: 0, startY: 0,
        initialWinX: 0, initialWinY: 0,
        initialWinW: 0, initialWinH: 0
    });

    const wasPinchingRef = useRef(false);
    const isClosingRef = useRef(false);

    useEffect(() => {
        scale.set(win.isMinimized ? 0 : 1);
        opacity.set(win.isMinimized ? 0 : 1);
    }, [win.isMinimized, scale, opacity]);

    useEffect(() => {
        const unsubscribe = gestureStore.subscribe((state) => {
            const { cursorX, cursorY, isPinching } = state;

            // Ensure window isn't animating out
            if (isClosingRef.current || win.isMinimized) return;

            const act = interactionRef.current;

            // Handle start of pinch
            if (isPinching && !wasPinchingRef.current) {
                // Find what we are pointing at
                const el = document.elementFromPoint(cursorX, cursorY) as HTMLElement | null;
                if (!el) return;

                const isWinDescendant = containerRef.current?.contains(el);
                if (isWinDescendant) {
                    windowStore.focusWindow(win.id);
                }

                const safeEl = el as any;
                // safely use closest to avoid accessing undefined dataset on SVG elements
                if (safeEl.closest?.(`[data-drag-bar="${win.id}"]`) && !safeEl.closest?.(`[data-close-btn="${win.id}"]`) && !safeEl.closest?.(`[data-min-btn="${win.id}"]`)) {
                    act.type = 'drag';
                } else if (safeEl.closest?.(`[data-resize-br="${win.id}"]`)) {
                    act.type = 'resize-br';
                } else if (safeEl.closest?.(`[data-resize-bl="${win.id}"]`)) {
                    act.type = 'resize-bl';
                } else if (safeEl.closest?.(`[data-close-btn="${win.id}"]`)) {
                    closeWindow();
                    return;
                } else if (safeEl.closest?.(`[data-min-btn="${win.id}"]`)) {
                    windowStore.updateWindow(win.id, { isMinimized: true });
                    return;
                }

                if (act.type) {
                    act.startX = cursorX;
                    act.startY = cursorY;
                    act.initialWinX = x.get();
                    act.initialWinY = y.get();
                    act.initialWinW = width.get();
                    act.initialWinH = height.get();
                }
            }

            // Handle during pinch
            if (isPinching && act.type) {
                const deltaX = cursorX - act.startX;
                const deltaY = cursorY - act.startY;

                if (act.type === 'drag') {
                    x.set(act.initialWinX + deltaX);
                    y.set(act.initialWinY + deltaY);
                } else if (act.type === 'resize-br') {
                    const newW = Math.max(300, Math.min(window.innerWidth * 0.9, act.initialWinW + deltaX));
                    const newH = Math.max(200, act.initialWinH + deltaY);
                    width.set(width.get() + (newW - width.get()) * 0.6); // Increased smoothing tightness
                    height.set(height.get() + (newH - height.get()) * 0.6);
                } else if (act.type === 'resize-bl') {
                    const newW = Math.max(300, Math.min(window.innerWidth * 0.9, act.initialWinW - deltaX));
                    const newH = Math.max(200, act.initialWinH + deltaY);

                    if (newW !== 300 && newW !== window.innerWidth * 0.9) {
                        const shiftX = act.initialWinX + deltaX;
                        x.set(x.get() + (shiftX - x.get()) * 0.6);
                    }
                    width.set(width.get() + (newW - width.get()) * 0.6);
                    height.set(height.get() + (newH - height.get()) * 0.6);
                }
            }

            // Handle Release
            if (!isPinching && wasPinchingRef.current && act.type) {
                // Persist to store (mostly so WindowStore knows bounds for re-layout if ever needed)
                windowStore.updateWindow(win.id, {
                    x: x.get(), y: y.get(), width: width.get(), height: height.get()
                });
                act.type = null;
            }

            wasPinchingRef.current = isPinching;
        });

        return unsubscribe;
    }, [win.id, win.isMinimized, win.zIndex, x, y, width, height]);

    const closeWindow = () => {
        isClosingRef.current = true;
        scale.set(0.8);
        opacity.set(0);
        setTimeout(() => windowStore.closeApp(win.id), 300);
    };

    if (win.isMinimized && opacity.get() === 0) return null;

    return (
        <motion.div
            ref={containerRef}
            style={{ x, y, width, height, scale, opacity, zIndex: win.zIndex }}
            className="absolute flex flex-col glass-panel overflow-hidden transition-shadow duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] will-change-transform"
            onPointerDown={() => windowStore.focusWindow(win.id)}
        >
            {/* Top Drag Bar */}
            <div
                data-drag-bar={win.id}
                data-clickable="true"
                className="h-16 w-full flex items-center justify-center bg-white/20 border-b border-white/10 relative group shrink-0"
            >
                <div className="absolute left-6 flex gap-4">
                    <button
                        data-close-btn={win.id}
                        data-clickable="true"
                        onClick={closeWindow}
                        className="w-8 h-8 rounded-full bg-red-400 hover:bg-red-500 data-[hovered=true]:bg-red-500 shadow-xl flex items-center justify-center pointer-events-none group-hover:pointer-events-auto group-data-[hovered=true]:pointer-events-auto transition-transform hover:scale-110 data-[hovered=true]:scale-110 data-[pinched=true]:scale-90"
                    >
                        <X size={18} className="text-red-900 opacity-0 group-hover:opacity-100 group-data-[hovered=true]:opacity-100 transition-opacity" />
                    </button>
                    <button
                        data-min-btn={win.id}
                        data-clickable="true"
                        onClick={() => windowStore.updateWindow(win.id, { isMinimized: true })}
                        className="w-8 h-8 rounded-full bg-yellow-400 hover:bg-yellow-500 data-[hovered=true]:bg-yellow-500 shadow-xl flex items-center justify-center pointer-events-none group-hover:pointer-events-auto group-data-[hovered=true]:pointer-events-auto transition-transform hover:scale-110 data-[hovered=true]:scale-110 data-[pinched=true]:scale-90"
                    >
                        <Minus size={18} className="text-yellow-900 opacity-0 group-hover:opacity-100 group-data-[hovered=true]:opacity-100 transition-opacity" />
                    </button>
                </div>
                <span className="text-lg font-semibold text-apple-dark/80 tracking-wide select-none pointer-events-none">{win.title}</span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                <div className="absolute inset-0 z-[-1] bg-white/40 backdrop-blur-[10px]" />
                {children}
            </div>

            {/* Resize Handles */}
            <div
                data-resize-br={win.id}
                data-clickable="true"
                className="absolute bottom-[-10px] right-[-10px] w-12 h-12 rounded-br-2xl cursor-se-resize z-50 bg-gradient-to-tl from-white/20 to-transparent hover:bg-white/30 data-[hovered=true]:bg-white/30 transition-colors"
            />
            <div
                data-resize-bl={win.id}
                data-clickable="true"
                className="absolute bottom-[-10px] left-[-10px] w-12 h-12 rounded-bl-2xl cursor-sw-resize z-50 bg-gradient-to-tr from-white/20 to-transparent hover:bg-white/30 data-[hovered=true]:bg-white/30 transition-colors"
            />
        </motion.div>
    );
}
