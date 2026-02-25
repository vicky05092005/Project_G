import { useRef, useState, useEffect } from 'react';
import { gestureStore } from '../store/GestureStore';
import { Eraser, Undo } from 'lucide-react';

const COLORS = ['#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
const SIZES = [2, 5, 10, 20];

export function PaintApp() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    const [color, setColor] = useState(COLORS[0]);
    const [size, setSize] = useState(SIZES[1]);
    const [isDrawing, setIsDrawing] = useState(false);

    // Save history for undo
    const [history, setHistory] = useState<ImageData[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Make canvas match its display size exactly
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = size;

        // Fill white background initially
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        contextRef.current = ctx;

        // Save initial state
        saveHistoryState();
    }, []);

    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = size;
        }
    }, [color, size]);

    // Handle gesture drawing
    useEffect(() => {
        const unsubscribe = gestureStore.subscribe((state) => {
            const canvas = canvasRef.current;
            const ctx = contextRef.current;
            if (!canvas || !ctx) return;

            const rect = canvas.getBoundingClientRect();

            // Check if cursor is over the canvas
            const isOverCanvas =
                state.cursorX >= rect.left && state.cursorX <= rect.right &&
                state.cursorY >= rect.top && state.cursorY <= rect.bottom;

            if (state.isPinching && isOverCanvas) {
                // Map screen coordinates to canvas coordinates
                const x = state.cursorX - rect.left;
                const y = state.cursorY - rect.top;

                if (!isDrawing) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    setIsDrawing(true);
                } else {
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
            } else if (!state.isPinching && isDrawing) {
                ctx.closePath();
                setIsDrawing(false);
                saveHistoryState();
            }
        });

        return unsubscribe;
    }, [isDrawing]);

    const saveHistoryState = () => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prev => [...prev.slice(-10), imageData]); // Keep last 10 steps
    };

    const undo = () => {
        if (history.length <= 1) return;

        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx) return;

        const previousState = history[history.length - 2];
        ctx.putImageData(previousState, 0, 0);

        setHistory(prev => prev.slice(0, -1));
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx) return;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveHistoryState();
    };

    return (
        <div className="flex flex-col h-full bg-[#1a1a1a] select-none">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 bg-black/40 border-b border-white/10 shrink-0">

                {/* Colors */}
                <div className="flex gap-2">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            data-clickable="true"
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform data-[hovered=true]:scale-110 ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>

                {/* Sizes & Tools */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/5 rounded-full p-1">
                        {SIZES.map(s => (
                            <button
                                key={s}
                                data-clickable="true"
                                onClick={() => setSize(s)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors data-[hovered=true]:bg-white/20 ${size === s ? 'bg-white/20' : ''}`}
                            >
                                <div className="bg-white rounded-full pointer-events-none" style={{ width: s, height: s }} />
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-8 bg-white/10 mx-2" />

                    <button
                        data-clickable="true"
                        onClick={undo}
                        disabled={history.length <= 1}
                        className="p-2 text-white/70 hover:text-white disabled:opacity-30 transition-colors data-[hovered=true]:text-white"
                        title="Undo"
                    >
                        <Undo size={20} />
                    </button>

                    <button
                        data-clickable="true"
                        onClick={clearCanvas}
                        className="p-2 text-white/70 hover:text-red-400 transition-colors data-[hovered=true]:text-red-400"
                        title="Clear All"
                    >
                        <Eraser size={20} />
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-hidden cursor-crosshair">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full touch-none"
                    style={{ touchAction: 'none' }}
                />
            </div>
        </div>
    );
}
