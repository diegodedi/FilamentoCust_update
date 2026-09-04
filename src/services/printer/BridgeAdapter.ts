import { PRINTER_BRIDGE_URL } from '../../config';
import { PrinterAdapter, PrinterState } from './PrinterAdapter';

const BRIDGE_URL = PRINTER_BRIDGE_URL;

export class BridgeAdapter implements PrinterAdapter {
  private id: string;
  private ip: string;
  private port: number;
  private interval: NodeJS.Timeout | null = null;
  private listeners: ((state: PrinterState) => void)[] = [];
  private isConnecting: boolean = false;

  private protocol: string;
  constructor(id: string, ip: string, port: number = 7125, protocol: string = 'Moonraker') {
    this.id = id;
    this.ip = ip;
    this.port = port;
    this.protocol = protocol;
  }

  async testConnection(): Promise<boolean> {
    // We now have a specific test endpoint in the bridge
    // but the test logic in UI should probably call it directly.
    return true; // We'll handle test in the UI directly via fetch
  }

  async connect(): Promise<void> {
    if (this.interval) return;
    this.isConnecting = true;
    
    // Register the printer with the bridge
    try {
      await fetch(`${BRIDGE_URL}/printers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: this.id, ip: this.ip, port: this.port, protocol: this.protocol })
      });
    } catch (e) {
      console.warn("Failed to register printer with bridge", e);
    }
    
    this.interval = setInterval(async () => {
      try {
        const state = await this.getStatus();
        this.emit(state);
      } catch (e) {
        this.emit({
          status: 'OFFLINE',
          filename: '',
          progress: 0,
          timeElapsed: 0,
          timeRemaining: 0,
          jobId: ''
        });
      }
    }, 1000);

    try {
      const state = await this.getStatus();
      this.emit(state);
    } catch(e) {}
  }

  async disconnect(): Promise<void> {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isConnecting = false;
    
    // Unregister from bridge
    try {
      await fetch(`${BRIDGE_URL}/printers/${this.id}`, { method: 'DELETE' });
    } catch (e) {}
  }

  async getStatus(): Promise<PrinterState> {
    const response = await fetch(`${BRIDGE_URL}/printers/${this.id}/status`);
    if (response.status === 404) {
      // Re-register if the bridge restarted and forgot our session
      fetch(`${BRIDGE_URL}/printers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: this.id, ip: this.ip, port: this.port, protocol: this.protocol })
      }).catch(() => {});
      throw new Error("Printer not registered, attempting to re-register...");
    }
    if (!response.ok) throw new Error("Bridge not responding");
    return await response.json();
  }

  on(event: 'state_change', listener: (state: PrinterState) => void): void {
    if (event === 'state_change') {
      this.listeners.push(listener);
    }
  }

  off(event: 'state_change', listener: (state: PrinterState) => void): void {
    if (event === 'state_change') {
      this.listeners = this.listeners.filter(l => l !== listener);
    }
  }

  private emit(state: PrinterState) {
    this.listeners.forEach(l => l(state));
  }
}
