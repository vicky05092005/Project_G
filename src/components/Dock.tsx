import { windowStore, APPS } from '../store/WindowStore';
import { Youtube, Image, Cloud, Clock, Calendar, Palette } from 'lucide-react';

const icons = {
    youtube: <Youtube size={24} className="text-red-500" />,
    photos: <Image size={24} className="text-blue-500" />,
    weather: <Cloud size={24} className="text-sky-400" />,
    paint: <Palette size={24} className="text-white" />,
    clock: <Clock size={24} className="text-orange-500" />,
    calendar: <Calendar size={24} className="text-red-500" />,
};

export function Dock() {
    return (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50 glass-panel px-8 py-5 flex gap-8 items-center rounded-[2rem] backdrop-blur-3xl bg-white/40 border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
            {APPS.map((app) => (
                <button
                    key={app.id}
                    className="relative group p-4 rounded-2xl hover:bg-white/50 data-[hovered=true]:bg-white/50 transition-colors shadow-sm bg-white/20 will-change-transform active:scale-90 data-[pinched=true]:scale-90"
                    onClick={() => windowStore.openApp(app)}
                >
                    {icons[app.id as keyof typeof icons]}

                    {/* Tooltip */}
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-apple-dark text-white text-xs rounded-full opacity-0 group-hover:opacity-100 group-data-[hovered=true]:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                        {app.title}
                    </span>
                </button>
            ))}
        </div>
    );
}
