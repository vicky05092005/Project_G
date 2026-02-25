export type SystemState = {
    brightness: number;
    volume: number;
};

type Subscriber = (state: SystemState) => void;

class SystemStore {
    private state: SystemState = {
        brightness: 80,
        volume: 50
    };

    private subscribers: Set<Subscriber> = new Set();

    subscribe(callback: Subscriber) {
        this.subscribers.add(callback);
        return () => { this.subscribers.delete(callback); };
    }

    getState() {
        return this.state;
    }

    update(newState: Partial<SystemState>) {
        this.state = { ...this.state, ...newState };
        this.subscribers.forEach((sub) => {
            try {
                sub(this.state);
            } catch (err) {
                console.error("SystemStore subscriber error:", err);
            }
        });
    }
}

export const systemStore = new SystemStore();
