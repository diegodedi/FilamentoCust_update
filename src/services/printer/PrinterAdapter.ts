export interface PrinterState {
  status: 'IDLE' | 'PRINTING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'ERROR' | 'OFFLINE';
  filename: string;
  progress: number;
  timeElapsed: number;
  timeRemaining: number;
  jobId: string;
  plateQuantity?: number;
  filamentWeight?: number;
}

export interface PrinterAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  testConnection(): Promise<boolean>;
  getStatus(): Promise<PrinterState>;
  on(event: 'state_change', listener: (state: PrinterState) => void): void;
  off(event: 'state_change', listener: (state: PrinterState) => void): void;
}
