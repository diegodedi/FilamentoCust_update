import React from 'react';
import { Printer as PrinterIcon, Clock, Battery, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { Printer } from '../../types';

interface PrinterState {
  status: 'PRINTING' | 'PAUSED' | 'COMPLETED' | 'ERROR' | 'CANCELLED' | 'IDLE' | 'OFFLINE';
  filename: string;
  progress: number;
  timeElapsed: number;
  timeRemaining: number;
}

interface PrinterCardProps {
  printer: Printer;
  state: PrinterState;
  bridgeOnline: boolean;
}

export const PrinterCard: React.FC<PrinterCardProps> = ({
  printer,
  state,
  bridgeOnline
}) => {
  const isOffline = state.status === 'OFFLINE' || !bridgeOnline;
  const isPrinting = state.status === 'PRINTING' && bridgeOnline;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    if (!bridgeOnline) {
      return { text: 'BRIDGE OFFLINE', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
    }
    switch (state.status) {
      case 'PRINTING':
        return { text: 'IMPRIMINDO', color: 'text-[#FFB800] bg-[#FFB800]/15 border-[#FFB800]/30' };
      case 'PAUSED':
        return { text: 'PAUSADA', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'COMPLETED':
        return { text: 'CONCLUÍDA', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'ERROR':
      case 'CANCELLED':
        return { text: 'ERRO / CANCELADA', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
      case 'IDLE':
        return { text: 'OCIOSA', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      default:
        return { text: 'OFFLINE', color: 'text-slate-400 bg-[#11141A] border-[#222733]' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="bg-[#14171E] rounded-2xl shadow-sm border border-[#222733] hover:border-amber-500/40 transition-all p-5 flex flex-col relative overflow-hidden">
      {/* Progress Line */}
      {isPrinting && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-[#FFB800] transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(255,184,0,0.5)]"
          style={{ width: `${state.progress * 100}%` }}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#1B1E26] rounded-xl border border-[#2B303E] text-[#FFB800]">
            <PrinterIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{printer.name}</h3>
            <p className="text-[11px] font-mono text-slate-400">{printer.ip}:{printer.port}</p>
          </div>
        </div>
        <div className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1 ${statusBadge.color}`}>
          {statusBadge.text}
        </div>
      </div>

      {!printer.monitoringEnabled ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs italic py-6">
          Monitoramento desativado
        </div>
      ) : isOffline ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs py-6">
          Aguardando conexão com impressora...
        </div>
      ) : (
        <div className="flex-1 space-y-3.5">
          <div>
            <label className="text-[9px] font-mono uppercase font-bold text-slate-500 tracking-wider">
              Arquivo em Execução
            </label>
            <p className="text-xs font-semibold text-white truncate" title={state.filename}>
              {state.filename || 'Nenhum arquivo ativo'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#0F1115] p-2.5 rounded-xl border border-[#222733]">
              <label className="text-[9px] font-mono uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#FFB800]" /> Decorrido
              </label>
              <p className="text-xs font-bold font-mono text-slate-200 mt-0.5">
                {formatTime(state.timeElapsed)}
              </p>
            </div>
            <div className="bg-[#0F1115] p-2.5 rounded-xl border border-[#222733]">
              <label className="text-[9px] font-mono uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                <Battery className="w-3 h-3 text-[#FFB800]" /> Restante
              </label>
              <p className="text-xs font-bold font-mono text-slate-200 mt-0.5">
                {formatTime(state.timeRemaining)}
              </p>
            </div>
          </div>
          
          {isPrinting && (
            <div className="pt-1 flex items-center gap-2.5">
              <div className="flex-1 h-2 bg-[#1B1E26] rounded-full overflow-hidden border border-[#222733]">
                <div 
                  className="h-full bg-[#FFB800] rounded-full transition-all duration-1000"
                  style={{ width: `${state.progress * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-amber-300 font-mono">
                {(state.progress * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
