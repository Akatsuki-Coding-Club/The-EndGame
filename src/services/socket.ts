/* Simulated Socket.IO client — emits mock events via custom event emitter */

type Listener = (...args: any[]) => void;

class MockSocket {
  private listeners: Record<string, Listener[]> = {};

  on(event: string, fn: Listener) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  off(event: string, fn?: Listener) {
    if (!fn) { this.listeners[event] = []; return; }
    this.listeners[event] = (this.listeners[event] || []).filter(l => l !== fn);
  }

  emit(event: string, ...args: any[]) {
    (this.listeners[event] || []).forEach(fn => fn(...args));
  }

  /* Simulate connection */
  connect() {
    setTimeout(() => this.emit("connect"), 100);
  }

  disconnect() {
    this.emit("disconnect");
  }
}

export const mockSocket = new MockSocket();
