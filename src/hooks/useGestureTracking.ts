import { useEffect, useRef } from 'react';
import { Hands, type Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { gestureStore } from '../store/GestureStore';

export function useGestureTracking(videoRef: React.RefObject<HTMLVideoElement | null>) {
    const cameraRef = useRef<Camera | null>(null);
    const handsRef = useRef<Hands | null>(null);

    // Smoothing states
    const targetCursorRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    useEffect(() => {
        if (!videoRef.current) return;

        handsRef.current = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        handsRef.current.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        handsRef.current.onResults(onResults);

        cameraRef.current = new Camera(videoRef.current, {
            onFrame: async () => {
                if (videoRef.current && handsRef.current) {
                    await handsRef.current.send({ image: videoRef.current });
                }
            },
            width: 1280,
            height: 720,
        });

        cameraRef.current.start();

        // Start smoothing loop
        let animationFrameId: number;
        let lastHoveredEl: HTMLElement | null = null;

        const smoothLoop = () => {
            const state = gestureStore.getState();
            // Smoothed to 0.4 for a balance between responsiveness and jitter reduction
            const newX = state.cursorX + (targetCursorRef.current.x - state.cursorX) * 0.4;
            const newY = state.cursorY + (targetCursorRef.current.y - state.cursorY) * 0.4;

            if (Math.abs(newX - state.cursorX) > 0.5 || Math.abs(newY - state.cursorY) > 0.5) {
                gestureStore.update({ cursorX: newX, cursorY: newY });
            }

            // --- HOVER LOGIC ---
            const el = document.elementFromPoint(newX, newY) as HTMLElement | null;
            const targetEl = el?.closest?.('button, a, [role="button"], [data-clickable="true"]') as HTMLElement | null;

            if (targetEl !== lastHoveredEl) {
                if (lastHoveredEl) {
                    try { lastHoveredEl.removeAttribute('data-hovered'); } catch (e) { }
                }
                if (targetEl) {
                    try { targetEl.setAttribute('data-hovered', 'true'); } catch (e) { }
                }
                lastHoveredEl = targetEl;
            }
            // -------------------

            animationFrameId = requestAnimationFrame(smoothLoop);
        };
        smoothLoop();

        return () => {
            cameraRef.current?.stop();
            handsRef.current?.close();
            cancelAnimationFrame(animationFrameId);
            if (lastHoveredEl) {
                try { lastHoveredEl.removeAttribute('data-hovered'); } catch (e) { }
            }
        };
    }, []);

    const onResults = (results: Results) => {
        try {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const landmarks = results.multiHandLandmarks[0];

                const indexFinger = landmarks[8];
                const thumb = landmarks[4];

                // Screen coordinates (Mirror effect by subtracting from 1)
                const mappedX = (1 - indexFinger.x) * window.innerWidth;
                const mappedY = indexFinger.y * window.innerHeight;

                targetCursorRef.current = { x: mappedX, y: mappedY };

                // Pinch Detection
                const distance = Math.sqrt(
                    Math.pow(indexFinger.x - thumb.x, 2) + Math.pow(indexFinger.y - thumb.y, 2)
                );
                const isPinching = distance < 0.05;
                const state = gestureStore.getState();

                if (isPinching && !state.isPinching) {
                    // Pinch START
                    const el = document.elementFromPoint(state.cursorX, state.cursorY) as HTMLElement | null;
                    let scrollable: HTMLElement | null = null;
                    let curr = el;
                    try {
                        while (curr && curr !== document.documentElement && curr.nodeType === 1) {
                            const style = window.getComputedStyle(curr);
                            if (style.overflowY === 'auto' || style.overflowY === 'scroll' || curr.classList.contains('custom-scroll')) {
                                scrollable = curr; break;
                            }
                            curr = curr.parentElement;
                        }
                    } catch (e) { }

                    // Visual feedback if clickable
                    let clickable: HTMLElement | null = null;
                    try {
                        if (typeof el?.closest === 'function') {
                            clickable = el.closest('button, a, [role="button"], [data-clickable="true"], [data-clickable]') as HTMLElement | null;
                        }
                    } catch (e) { }
                    if (clickable && clickable.style) {
                        try {
                            clickable.style.transform = 'scale(0.95)';
                            clickable.setAttribute('data-pinched', 'true');
                        } catch (e) { }
                    }

                    gestureStore.update({
                        isPinching: true,
                        pinchStartEl: clickable || el,
                        pinchStartX: state.cursorX,
                        pinchStartY: state.cursorY,
                        scrollTarget: scrollable,
                        scrollInitialTop: scrollable ? scrollable.scrollTop : 0
                    });

                } else if (isPinching && state.isPinching) {
                    // Pinch MOVE
                    if (state.scrollTarget && state.pinchStartY !== undefined) {
                        const deltaY = state.pinchStartY - state.cursorY;
                        state.scrollTarget.scrollTop = state.scrollInitialTop + deltaY;
                    }
                } else if (!isPinching && state.isPinching) {
                    // Pinch END
                    const dx = state.cursorX - (state.pinchStartX ?? state.cursorX);
                    const dy = state.cursorY - (state.pinchStartY ?? state.cursorY);
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (state.pinchStartEl) {
                        try {
                            if (state.pinchStartEl.style) {
                                state.pinchStartEl.style.transform = '';
                                state.pinchStartEl.removeAttribute('data-pinched');
                            }
                            // IF we didn't drag it (like scroll/drag window), consider it a click
                            if (dist < 200) {
                                const target = state.pinchStartEl;

                                // Do not fire synthetic clicks for drag/resize bars or window controls, they are handled natively by the gesture loop
                                const isWindowControl = target.closest('[data-drag-bar]') || target.closest('[data-resize-br]') || target.closest('[data-resize-bl]') || target.closest('[data-close-btn]') || target.closest('[data-min-btn]');

                                if (!isWindowControl) {
                                    // Dispatch full event sequence for React synthetic event compatibility
                                    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window }));
                                    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                                    target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, view: window }));
                                    target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
                                    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

                                    // Fallback native click if element supports it
                                    if (typeof (target as any).click === 'function') {
                                        (target as any).click();
                                    }
                                }
                            }
                        } catch (e) {
                            console.error("Error clicking element:", e);
                        }
                    }

                    gestureStore.update({
                        isPinching: false,
                        pinchStartEl: null,
                        scrollTarget: null,
                        pinchStartX: undefined,
                        pinchStartY: undefined,
                        scrollInitialTop: undefined,
                    });
                }

                // Fist Detection (check if fingers 8, 12, 16, 20 are folded tightly to palm)
                const isFist =
                    landmarks[8].y > landmarks[5].y &&
                    landmarks[12].y > landmarks[9].y &&
                    landmarks[16].y > landmarks[13].y &&
                    landmarks[20].y > landmarks[17].y;

                gestureStore.update({ isPinching, isFist });
            } else {
                // No hands detected, clear active pinch state if any
                const state = gestureStore.getState();
                if (state.isPinching) {
                    if (state.pinchStartEl) {
                        try { state.pinchStartEl.style.transform = ''; } catch (e) { }
                    }
                    gestureStore.update({
                        isPinching: false,
                        pinchStartEl: null,
                        scrollTarget: null,
                        pinchStartX: undefined,
                        pinchStartY: undefined,
                        scrollInitialTop: undefined,
                    });
                }
            }
        } catch (err) {
            console.error("Error in onResults gesture tracking:", err);
            // Emergency reset of pinch state to prevent freezing
            const state = gestureStore.getState();
            if (state.isPinching) {
                if (state.pinchStartEl) {
                    try { state.pinchStartEl.style.transform = ''; } catch (e) { }
                }
                gestureStore.update({
                    isPinching: false,
                    pinchStartEl: null,
                    scrollTarget: null,
                    pinchStartX: undefined,
                    pinchStartY: undefined,
                    scrollInitialTop: undefined,
                });
            }
        }
    };
}
