import { useEffect, useState } from 'react';
import { windowStore, type WindowState } from '../store/WindowStore';
import { Window } from './Window';

import { YouTubeApp } from '../apps/YouTubeApp';
import { PhotosApp } from '../apps/PhotosApp';
import { WeatherApp } from '../apps/WeatherApp';
import { PaintApp } from '../apps/PaintApp';
import { ClockApp } from '../apps/ClockApp';
import { CalendarApp } from '../apps/CalendarApp';

const AppMap: Record<string, React.FC> = {
    youtube: YouTubeApp,
    photos: PhotosApp,
    weather: WeatherApp,
    paint: PaintApp,
    clock: ClockApp,
    calendar: CalendarApp,
};

export function WindowSystem() {
    const [windows, setWindows] = useState<WindowState[]>([]);

    useEffect(() => {
        const unsub = windowStore.subscribe((newWindows) => {
            setWindows(newWindows);
        });
        // initial state
        setWindows(windowStore.getWindows());
        return unsub;
    }, []);

    return (
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
            {windows.map((win) => {
                const AppContent = AppMap[win.type];
                return (
                    <div key={win.id} className="pointer-events-auto shadow-2xl">
                        <Window window={win}>
                            {AppContent ? <AppContent /> : <div className="flex items-center justify-center h-full text-gray-500">App not found</div>}
                        </Window>
                    </div>
                );
            })}
        </div>
    );
}
