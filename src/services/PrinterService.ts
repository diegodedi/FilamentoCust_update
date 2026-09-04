import { PRINTER_BRIDGE_URL } from "../config";
import { PrinterAdapter, PrinterState } from './printer/PrinterAdapter';
import { BridgeAdapter } from './printer/BridgeAdapter';

export { type PrinterState } from './printer/PrinterAdapter';
export type PrinterEventHandler = (printerId: string, state: PrinterState) => void;

export class PrinterIntegrationService {
  private adapters: Map<string, PrinterAdapter> = new Map();
  private onStateChange: PrinterEventHandler;

  constructor(onStateChange: PrinterEventHandler) {
    this.onStateChange = onStateChange;
  }

  public startMonitoring(printerId: string, ip: string, port: number, protocol: string = 'Moonraker') {
    this.stopMonitoring(printerId);
    console.log(`Starting monitoring for printer ${printerId} at ${ip}:${port}`);
    
    // We now use the BridgeAdapter which delegates to the local Node.js bridge
    const adapter = new BridgeAdapter(printerId, ip, port, protocol);
    
    adapter.on('state_change', (state) => {
      this.onStateChange(printerId, state);
    });

    this.adapters.set(printerId, adapter);
    adapter.connect(); // Connect starts the polling internally
  }

  public stopMonitoring(printerId: string) {
    const adapter = this.adapters.get(printerId);
    if (adapter) {
      adapter.disconnect();
      this.adapters.delete(printerId);
    }
  }

  public stopAll() {
    this.adapters.forEach((adapter, id) => this.stopMonitoring(id));
  }
}

// Global utility to check if bridge is online
export async function checkBridgeHealth(): Promise<{ online: boolean, details?: any }> {
  try {
    const res = await fetch(PRINTER_BRIDGE_URL + '/health', { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      return { online: true, details: data };
    }
    return { online: false };
  } catch (e) {
    return { online: false };
  }
}
