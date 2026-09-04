const WebSocket = require('ws');
const EventEmitter = require('events');

class CrealityClient extends EventEmitter {
  constructor(id, ip) {
    super();
    this.id = id;
    this.ip = ip;
    this.ws = null;
    this.connected = false;
    this.reconnectTimer = null;
    this.pingInterval = null;
    this.shouldReconnect = true;
  }

  connect() {
    this.shouldReconnect = true;
    if (this.ws) return;

    console.log(`[Printer ${this.id}] Connecting to ws://${this.ip}:9999`);
    this.ws = new WebSocket(`ws://${this.ip}:9999`);

    this.ws.on('open', () => {
      console.log(`[Printer ${this.id}] WebSocket connected`);
      this.connected = true;
      this.emit('connected');
      
      this.pingInterval = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.ping();
        }
      }, 10000);
    });

    this.ws.on('message', (data) => {
      try {
        const message = data.toString();
        // Try to parse as JSON. Creality Hi sends JSON over WS.
        const parsed = JSON.parse(message);
        this.emit('message', parsed);
      } catch (err) {
        console.error(`[Printer ${this.id}] Error parsing message:`, err.message);
      }
    });

    this.ws.on('close', () => {
      console.log(`[Printer ${this.id}] WebSocket disconnected`);
      this.cleanup();
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    });

    this.ws.on('error', (err) => {
      console.error(`[Printer ${this.id}] WebSocket error: ${err.message}`);
      // Close will be emitted after error
    });
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
    }
    this.cleanup();
  }

  cleanup() {
    this.connected = false;
    this.ws = null;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.emit('disconnected');
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    console.log(`[Printer ${this.id}] Reconnecting in 5 seconds...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }
}

module.exports = CrealityClient;
