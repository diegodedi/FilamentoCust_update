import React, { useState } from 'react';
import { PRINTER_BRIDGE_URL } from '../../config';
import { X, Terminal, CheckCircle2, AlertCircle, Printer as PrinterIcon } from 'lucide-react';

interface AddPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (printer: { 
    name: string; 
    model: string; 
    ip: string; 
    port: number; 
    monitoringEnabled: boolean;
    protocol: 'MOONRAKER' | 'OCTOPRINT';
  }) => void;
}

export const AddPrinterModal: React.FC<AddPrinterModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [newPrinter, setNewPrinter] = useState({
    name: 'Creality Ender 3',
    model: 'Creality Klipper',
    ip: '192.168.1.105',
    port: 7125,
    monitoringEnabled: true,
    protocol: 'MOONRAKER' as 'MOONRAKER' | 'OCTOPRINT'
  });

  const [testStatus, setTestStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [testLog, setTestLog] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestStatus('TESTING');
    setTestLog([`[${new Date().toLocaleTimeString()}] Testando Printer Bridge em localhost:3001...`]);
    
    try {
      try {
        const healthRes = await fetch(PRINTER_BRIDGE_URL + '/health', { signal: AbortSignal.timeout(3000) });
        if (!healthRes.ok) throw new Error('Health check status not OK');
        setTestLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✓ Bridge acessível em localhost:3001`]);
      } catch (err: any) {
        setTestLog(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] ✕ Não foi possível conectar ao Bridge local`,
          `Motivo: ${err.message}`
        ]);
        setTestStatus('ERROR');
        return;
      }

      setTestLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Testando impressora em ${newPrinter.ip}:${newPrinter.port}...`]);

      const res = await fetch(PRINTER_BRIDGE_URL + '/printers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: newPrinter.ip, model: newPrinter.model })
      });
      
      const data = await res.json();
      if (data.logs && Array.isArray(data.logs)) {
        setTestLog(prev => [...prev, ...data.logs]);
      }
      
      if (data.success) {
        if (data.protocol) {
          setNewPrinter(prev => ({ ...prev, protocol: data.protocol }));
        }
        setTestStatus('SUCCESS');
      } else {
        setTestStatus('ERROR');
      }
    } catch (e: any) {
      setTestLog(prev => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] Erro na chamada do teste: ${e.message}`
      ]);
      setTestStatus('ERROR');
    }
  };

  const handleConfirmSave = () => {
    onSave(newPrinter);
    onClose();
    setTestStatus('IDLE');
    setTestLog([]);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#14171E] rounded-2xl border border-[#2B303E] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
        <div className="p-5 border-b border-[#222733] bg-[#11141A] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FFB800] rounded-xl text-[#0F1115]">
              <PrinterIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Conectar Nova Impressora 3D</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1A1D25] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">Nome de Exibição</label>
              <input 
                type="text" 
                value={newPrinter.name} 
                onChange={e => setNewPrinter({ ...newPrinter, name: e.target.value })} 
                className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">Modelo</label>
              <input 
                type="text" 
                value={newPrinter.model} 
                onChange={e => setNewPrinter({ ...newPrinter, model: e.target.value })} 
                className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">Endereço IP</label>
              <input 
                type="text" 
                placeholder="192.168.1.100" 
                value={newPrinter.ip} 
                onChange={e => setNewPrinter({ ...newPrinter, ip: e.target.value })} 
                className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 font-mono outline-none focus:border-[#FFB800]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">Porta</label>
              <input 
                type="number" 
                value={newPrinter.port} 
                onChange={e => setNewPrinter({ ...newPrinter, port: parseInt(e.target.value) || 7125 })} 
                className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 font-mono outline-none focus:border-[#FFB800]"
              />
            </div>
          </div>

          {/* Terminal Test Log */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#FFB800]" /> Teste de Comunicação
              </span>
              <button 
                type="button" 
                onClick={handleTestConnection}
                disabled={testStatus === 'TESTING'}
                className="px-3 py-1 bg-[#1B1E26] hover:bg-[#252A36] text-[#FFB800] border border-[#2B303E] rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {testStatus === 'TESTING' ? 'Testando...' : 'Testar Conexão'}
              </button>
            </div>

            <div className="bg-[#0B0C0E] border border-[#222733] rounded-xl p-3 font-mono text-[11px] text-slate-300 h-28 overflow-y-auto space-y-1">
              {testLog.length === 0 ? (
                <span className="text-slate-600">Clique em "Testar Conexão" para validar o IP e protocolo.</span>
              ) : (
                testLog.map((log, i) => (
                  <div key={i} className="leading-tight">{log}</div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#222733]">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-[#2B303E] text-slate-400 hover:text-white rounded-xl text-xs font-semibold hover:bg-[#1A1D25] cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={handleConfirmSave}
              className="px-5 py-2 bg-[#FFB800] hover:bg-[#e6a600] text-[#0F1115] font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Salvar Impressora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

