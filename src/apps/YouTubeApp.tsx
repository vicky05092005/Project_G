import { useState, useRef, useEffect } from 'react';
import { Play } from 'lucide-react';
import { systemStore } from '../store/SystemStore';

const VIDEOS = [
    { id: 'V-XnXYTKmWw', title: 'Varna26 - Vishwaksenaa School Annual Day - Teaser Video', channel: 'Vishwaksenaa Educational Institutions' },
    { id: '45ltSP86xdY', title: 'Varna26 - Vishwaksenaa School Annual Day celebration', channel: 'Vishwaksenaa Educational Institutions' },
    { id: 'UVgMRd76Bbo', title: 'உங்க விஜய், நா வரேன்!', channel: 'Tamilaga Vettri Kazhagam' },
    { id: 'Dyt1jelmjY0', title: 'Sidu Sidu  Video Song', channel: 'Think Music' },
    { id: '4Bsc2uI_LsM', title: 'PSOorum Blood | Dude', channel: 'Think Music' }
];

export function YouTubeApp() {
    const [activeVid, setActiveVid] = useState(VIDEOS[0].id);
    const [isPlaying, setIsPlaying] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const togglePlay = () => {
        if (!iframeRef.current?.contentWindow) return;
        const command = isPlaying ? 'pauseVideo' : 'playVideo';
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: command, args: [] }), '*');
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        setIsPlaying(true); // new video autoplays
    }, [activeVid]);

    // Handle system volume changes
    useEffect(() => {
        const unsubscribe = systemStore.subscribe((state) => {
            if (iframeRef.current?.contentWindow) {
                // The youtube player expects a volume between 0 and 100
                const volumeStr = JSON.stringify({ event: 'command', func: 'setVolume', args: [state.volume] });
                iframeRef.current.contentWindow.postMessage(volumeStr, '*');
            }
        });

        // Set initial volume when component mounts
        const initialVolume = systemStore.getState().volume;
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [initialVolume] }), '*');
        }

        return unsubscribe;
    }, [activeVid]);

    return (
        <div className="w-full h-full bg-[#0f0f0f] flex flex-col text-white pointer-events-auto">
            {/* Top Main Player Container */}
            <div className="relative w-full shrink-0 shadow-xl" style={{ height: '55%' }}>
                <iframe
                    ref={iframeRef}
                    className="w-full h-full border-none pointer-events-none" // Disable pointer events so our overlay catches clicks and elementFromPoint!
                    src={`https://www.youtube.com/embed/${activeVid}?autoplay=1&controls=0&modestbranding=1&enablejsapi=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube Video"
                />
                {/* Overlay to catch clicks and toggle play/pause */}
                <button
                    className="absolute inset-0 z-10 w-full h-full cursor-pointer flex items-center justify-center group outline-none"
                    onClick={togglePlay}
                >
                    {!isPlaying && (
                        <div className="w-16 h-16 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-apple-blue/80 transition-colors">
                            <Play size={32} className="text-white translate-x-[2px]" />
                        </div>
                    )}
                </button>
            </div>

            {/* Feed Container */}
            <div className="flex-1 overflow-y-auto custom-scroll p-4">
                <h2 className="text-xl font-bold mb-4 px-2 tracking-tight">Up Next</h2>
                <div className="space-y-3">
                    {VIDEOS.filter(v => v.id !== activeVid).map(v => (
                        <button
                            key={v.id}
                            onClick={() => setActiveVid(v.id)}
                            className="flex items-start gap-4 w-full text-left bg-white/5 p-3 rounded-2xl hover:bg-white/10 transition-colors active:scale-[0.98] outline-none"
                        >
                            <div className="w-40 aspect-video bg-black rounded-xl shrink-0 overflow-hidden relative shadow-md">
                                <img src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play className="text-white" size={24} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 py-1">
                                <h3 className="font-semibold text-[15px] leading-snug line-clamp-2">{v.title}</h3>
                                <p className="text-white/50 text-sm mt-1.5">{v.channel}</p>
                                <p className="text-white/40 text-xs mt-0.5">1.2M views • 2 years ago</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
