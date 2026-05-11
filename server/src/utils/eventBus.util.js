import EventEmitter from 'events';

// Create a single shared instance (Singleton) used across the app
export const eventBus = new EventEmitter();

// Increase the default listener limit to avoid memory-leak warnings in large systems
eventBus.setMaxListeners(20);