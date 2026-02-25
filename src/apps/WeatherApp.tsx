import { Cloud, Wind, Droplets } from 'lucide-react';

export function WeatherApp() {
    return (
        <div className="w-full h-full bg-gradient-to-b from-sky-400 to-blue-500 text-white p-6 flex flex-col pointer-events-none">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-medium tracking-tight">Tiruvallur</h2>
                    <p className="text-sky-100 mt-1">Sunny</p>
                </div>
                <Cloud size={48} className="text-white drop-shadow-md" />
            </div>

            <div className="flex-1 flex items-center justify-center">
                <h1 className="text-[120px] font-thin tracking-tighter leading-none">
                    72°
                </h1>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex justify-between px-8">
                <div className="flex flex-col items-center gap-1">
                    <Wind size={20} className="text-sky-100" />
                    <span className="text-sm font-medium">5 mph</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Droplets size={20} className="text-sky-100" />
                    <span className="text-sm font-medium">12%</span>
                </div>
            </div>
        </div>
    );
}
