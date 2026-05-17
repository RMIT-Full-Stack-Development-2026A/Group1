import EventEmitter from 'events';

class SystemEventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(30); 
    }

    /**
     * Emits an event to the system.
     * @param {string} eventName - Target event name.
     * @param {Object} payload - Event data payload.
     */
    publish(eventName, payload) {
        this.emit(eventName, payload);
    }

    /**
     * Attaches an asynchronous, error-safe listener to an event.
     * @param {string} eventName - Target event name.
     * @param {Function} listener - Callback function.
     */
    subscribe(eventName, listener) {
        const safeListener = async (...args) => {
            try {
                await listener(...args);
            } catch (error) {
                console.error(`[EventBus Error] Listener failed for event: ${eventName}`, error);
            }
        };

        this.on(eventName, safeListener);
    }
}

export const eventBus = new SystemEventBus();