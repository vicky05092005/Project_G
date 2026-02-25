export type AppConfig = {
    id: string;
    title: string;
    type: 'youtube' | 'photos' | 'weather' | 'paint' | 'clock' | 'calendar';
    defaultWidth: number;
    defaultHeight: number;
};

export type WindowState = AppConfig & {
    x: number;
    y: number;
    width: number;
    height: number;
    isMinimized: boolean;
    zIndex: number;
};

type Subscriber = (windows: WindowState[]) => void;

class WindowStore {
    private windows: WindowState[] = [];
    private subscribers: Set<Subscriber> = new Set();
    private nextZIndex = 10;

    subscribe(callback: Subscriber) {
        this.subscribers.add(callback);
        return () => { this.subscribers.delete(callback); };
    }

    getWindows() {
        return this.windows;
    }

    openApp(app: AppConfig) {
        // If already open and not minimized, just focus
        const existing = this.windows.find((w) => w.id === app.id);
        if (existing) {
            if (existing.isMinimized) {
                this.updateWindow(app.id, { isMinimized: false });
            }
            this.focusWindow(app.id);
            return;
        }

        // Open in center of screen
        const newWindow: WindowState = {
            ...app,
            x: window.innerWidth / 2 - app.defaultWidth / 2,
            y: window.innerHeight / 2 - app.defaultHeight / 2,
            width: app.defaultWidth,
            height: app.defaultHeight,
            isMinimized: false,
            zIndex: ++this.nextZIndex,
        };

        this.windows = [...this.windows, newWindow];
        this.notify();
    }

    closeApp(id: string) {
        this.windows = this.windows.filter((w) => w.id !== id);
        this.notify();
    }

    updateWindow(id: string, updates: Partial<WindowState>) {
        this.windows = this.windows.map((w) =>
            w.id === id ? { ...w, ...updates } : w
        );
        this.notify();
    }

    focusWindow(id: string) {
        const win = this.windows.find((w) => w.id === id);
        if (win && win.zIndex < this.nextZIndex) {
            this.updateWindow(id, { zIndex: ++this.nextZIndex });
        }
    }

    private notify() {
        this.subscribers.forEach((sub) => sub([...this.windows]));
    }
}

export const windowStore = new WindowStore();

// Predefined apps
export const APPS: AppConfig[] = [
    { id: 'youtube', title: 'YouTube', type: 'youtube', defaultWidth: 800, defaultHeight: 500 },
    { id: 'photos', title: 'Photos', type: 'photos', defaultWidth: 700, defaultHeight: 500 },
    { id: 'weather', title: 'Weather', type: 'weather', defaultWidth: 400, defaultHeight: 300 },
    { id: 'paint', title: 'Paint', type: 'paint', defaultWidth: 800, defaultHeight: 600 },
    { id: 'clock', title: 'Clock', type: 'clock', defaultWidth: 600, defaultHeight: 400 },
    { id: 'calendar', title: 'Calendar', type: 'calendar', defaultWidth: 700, defaultHeight: 500 },
];
