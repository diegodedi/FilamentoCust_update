import React from 'react';
import { PrintJob, Product } from '../../types';
import { Box, CheckCircle2 } from 'lucide-react';

interface PrintJobsHistoryTableProps {
  jobs: PrintJob[];
  products: Product[];
}

export const PrintJobsHistoryTable: React.FC<PrintJobsHistoryTableProps> = ({
  jobs,
  products
}) => {
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: PrintJob['status']) => {
    switch (status) {
      case 'PRINTING': return 'text-[#FFB800] bg-[#FFB800]/15 border-[#FFB800]/30';
      case 'COMPLETED': return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
      case 'PAUSED': return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
      case 'ERROR':
      case 'CANCELLED': return 'text-red-400 bg-red-500/15 border-red-500/30';
      default: return 'text-slate-400 bg-[#1B1E26] border-[#2B303E]';
    }
  };

  return (
    <section className="space-y-4 pt-4">
      <div className="flex items-center gap-2">
        <Box className="w-5 h-5 text-[#FFB800]" />
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
          Histórico de Produção & Fila
        </h2>
      </div>

      <div className="bg-[#14171E] rounded-2xl shadow-sm border border-[#222733] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#11141A] border-b border-[#222733] text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="p-4 font-bold">Data</th>
                <th className="p-4 font-bold">Impressora</th>
                <th className="p-4 font-bold">Arquivo / Produto</th>
                <th className="p-4 font-bold">Duração</th>
                <th className="p-4 font-bold">Consumo Real</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Estoque</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#222733]">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Nenhum histórico de impressão registrado até o momento.
                  </td>
                </tr>
              ) : (
                jobs.map(job => (
                  <tr key={job.id} className="hover:bg-[#181D26] transition-colors">
                    <td className="p-4 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(job.startedAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-4 font-medium text-white">
                      {job.printerName}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{job.productName || 'Desconhecido'}</div>
                      <div className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]" title={job.fileName}>
                        {job.fileName}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      {formatTime(job.duration)}
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      {job.filamentConsumption && job.filamentConsumption.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {job.filamentConsumption.map((f, i) => (
                            <span key={i}>
                              {(f.consumedWeight != null ? f.consumedWeight : (f.plannedWeight || 0)).toFixed(1)}g
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {job.inventoryApplied ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Baixa Aplicada
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Pendente</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
