export type GestureState = {
    cursorX: number;
    cursorY: number;
    isPinching: boolean;
    isFist: boolean;
    swipeDown: boolean;
    pinchStartEl: HTMLElement | null;
    pinchStartX: number;
    pinchStartY: number;
    scrollTarget: HTMLElement | null;
    scrollInitialTop: number;
};

type Subscriber = (state: GestureState) => void;

class GestureStore {
    private state: GestureState = {
        cursorX: window.innerWidth / 2,
        cursorY: window.innerHeight / 2,
        isPinching: false,
        isFist: false,
        swipeDown: false,
        pinchStartEl: null,
        pinchStartX: 0,
        pinchStartY: 0,
        scrollTarget: null,
        scrollInitialTop: 0,
    };

    private subscribers: Set<Subscriber> = new Set();

    subscribe(callback: Subscriber) {
        this.subscribers.add(callback);
        return () => { this.subscribers.delete(callback); };
    }

    getState() {
        return this.state;
    }

    update(newState: Partial<GestureState>) {
        this.state = { ...this.state, ...newState };
        this.subscribers.forEach((sub) => {
            try {
                sub(this.state);
            } catch (err) {
                console.error("GestureStore subscriber error:", err);
            }
        });
    }
}

export const gestureStore = new GestureStore();
