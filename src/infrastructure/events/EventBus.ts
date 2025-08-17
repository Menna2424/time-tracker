type EventName =
  | 'tasks:changed'
  | 'sessions:changed'
  | 'projects:changed'
  | 'members:changed'
  | 'settings:changed';

type Handler = () => void;

class EventBus {
  private map = new Map<EventName, Set<Handler>>();

  on(name: EventName, handler: Handler): () => void {
    if (!this.map.has(name)) {
      this.map.set(name, new Set());
    }
    this.map.get(name)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.map.get(name);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  emit(name: EventName): void {
    const handlers = this.map.get(name);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler();
        } catch (error) {
          console.error(`Error in event handler for ${name}:`, error);
        }
      });
    }
  }

  // For debugging
  listenerCount(name: EventName): number {
    return this.map.get(name)?.size || 0;
  }

  // For cleanup
  removeAllListeners(name?: EventName): void {
    if (name) {
      this.map.delete(name);
    } else {
      this.map.clear();
    }
  }
}

export const eventBus = new EventBus();
