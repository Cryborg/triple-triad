/**
 * Simple EventEmitter implementation for Triple Triad v0.9
 * Provides a decoupled way to handle game events like card placement,
 * captures, game start/end, etc.
 */
class EventEmitter {
    constructor() {
        this.events = {};
    }

    /**
     * Register an event listener
     * @param {string} eventName - Name of the event to listen for
     * @param {Function} listener - Function to call when event is emitted
     */
    on(eventName, listener) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(listener);
    }

    /**
     * Register a one-time event listener
     * @param {string} eventName - Name of the event to listen for
     * @param {Function} listener - Function to call when event is emitted
     */
    once(eventName, listener) {
        const onceWrapper = (...args) => {
            listener(...args);
            this.off(eventName, onceWrapper);
        };
        this.on(eventName, onceWrapper);
    }

    /**
     * Remove an event listener
     * @param {string} eventName - Name of the event
     * @param {Function} listener - The listener function to remove
     */
    off(eventName, listener) {
        if (!this.events[eventName]) return;

        this.events[eventName] = this.events[eventName].filter(l => l !== listener);
        
        // Clean up empty event arrays
        if (this.events[eventName].length === 0) {
            delete this.events[eventName];
        }
    }

    /**
     * Emit an event to all registered listeners
     * @param {string} eventName - Name of the event to emit
     * @param {...any} args - Arguments to pass to the listeners
     */
    emit(eventName, ...args) {
        if (!this.events[eventName]) return;

        // Create a copy of the listeners array to avoid issues if listeners modify the array
        const listeners = [...this.events[eventName]];
        
        for (const listener of listeners) {
            try {
                listener(...args);
            } catch (error) {
                console.error(`Error in event listener for '${eventName}':`, error);
            }
        }
    }

    /**
     * Remove all listeners for a specific event, or all listeners if no event specified
     * @param {string} [eventName] - Name of the event to clear (optional)
     */
    removeAllListeners(eventName) {
        if (eventName) {
            delete this.events[eventName];
        } else {
            this.events = {};
        }
    }

    /**
     * Get all event names that have listeners
     * @returns {string[]} Array of event names
     */
    eventNames() {
        return Object.keys(this.events);
    }

    /**
     * Get the number of listeners for a specific event
     * @param {string} eventName - Name of the event
     * @returns {number} Number of listeners
     */
    listenerCount(eventName) {
        return this.events[eventName] ? this.events[eventName].length : 0;
    }
}

module.exports = EventEmitter;