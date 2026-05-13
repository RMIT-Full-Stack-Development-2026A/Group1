import EventEmitter from 'events';

class SystemEventBus extends EventEmitter {
    constructor() {
        super();
        // Prevent memory leak warnings if the system scales up
        this.setMaxListeners(30); 
    }

    /**
     * Publishes an event to the system.
     * @param {string} eventName - Use SYSTEM_EVENTS constants
     * @param {Object} payload - Data to send
     */
    publish(eventName, payload) {
        this.emit(eventName, payload);
    }

    /**
     * Subscribes to an event with a built-in safety net for async errors.
     * @param {string} eventName - Use SYSTEM_EVENTS constants
     * @param {Function} listener - The callback function
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

// Export 
export const eventBus = new SystemEventBus();