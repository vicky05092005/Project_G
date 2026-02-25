import { useEffect, useRef } from 'react';
import { gestureStore } from '../store/GestureStore';

export function Cursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = gestureStore.subscribe((state) => {
            if (!cursorRef.current || !ringRef.current) return;

            const { cursorX, cursorY, isPinching } = state;

            cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) scale(${isPinching ? 0.8 : 1})`;
            ringRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) scale(${isPinching ? 1.2 : 1})`;
            ringRef.current.style.opacity = isPinching ? '0.5' : '0.2';
        });

        return unsubscribe;
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999]">
            <div
                ref={ringRef}
                className="absolute left-[-20px] top-[-20px] w-10 h-10 rounded-full border-2 border-apple-blue bg-apple-blue/10 transition-all duration-150 ease-out will-change-transform"
            />
            <div
                ref={cursorRef}
                className="absolute left-[-8px] top-[-8px] w-4 h-4 rounded-full bg-apple-blue shadow-[0_0_10px_rgba(10,132,255,0.8)] transition-transform duration-75 will-change-transform"
            />
        </div>
    );
}
