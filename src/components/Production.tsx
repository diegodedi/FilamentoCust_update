import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { usePrinters } from '../context/PrinterContext';
import { Printer as PrinterIcon, Plus, Server, Activity, ServerCrash } from 'lucide-react';
import { PrinterCard } from './production/PrinterCard';
import { PrintJobsHistoryTable } from './production/PrintJobsHistoryTable';
import { AddPrinterModal } from './production/AddPrinterModal';

export const Production: React.FC = () => {
  const { printers, printJobs, addPrinter, products } = useDb();
  const { activeStates, bridgeOnline, checkBridgeStatus } = usePrinters();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const sortedJobs = printJobs
    .filter(job => job.productId && products.some(p => p.id === job.productId))
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#14171E] p-5 sm:p-6 rounded-2xl border border-[#222733] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#FFB800] rounded-xl text-[#0F1115] shadow-lg shadow-amber-500/20">
            <PrinterIcon className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Produção & Impressoras 3D
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Monitore temperaturas, status em tempo real e fila de fatiamento local.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Bridge Status Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold border ${
            bridgeOnline 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            {bridgeOnline ? <Activity className="w-3.5 h-3.5" /> : <ServerCrash className="w-3.5 h-3.5" />}
            <span>{bridgeOnline ? 'BRIDGE ONLINE' : 'BRIDGE OFFLINE'}</span>
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-[#FFB800] hover:bg-[#e6a600] text-[#0F1115] font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Conectar Impressora
          </button>
        </div>
      </div>

      {/* Printers Cards Grid */}
      <section className="space-y-4">
        {printers.length === 0 ? (
          <div className="bg-[#14171E] border border-[#222733] rounded-2xl p-10 text-center">
            <PrinterIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">Nenhuma impressora configurada</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Conecte sua impressora Klipper (Moonraker) ou OctoPrint para acompanhar o progresso em tempo real.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 bg-[#FFB800] text-[#0F1115] font-bold rounded-xl text-xs"
            >
              Adicionar Primeira Impressora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {printers.map((printer) => {
              const state = activeStates[printer.id] || { 
                status: 'OFFLINE', 
                filename: '', 
                progress: 0, 
                timeElapsed: 0, 
                timeRemaining: 0 
              };

              return (
                <PrinterCard
                  key={printer.id}
                  printer={printer}
                  state={state}
                  bridgeOnline={bridgeOnline}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Print Jobs History */}
      <PrintJobsHistoryTable
        jobs={sortedJobs}
        products={products}
      />

      {/* Add Printer Modal */}
      <AddPrinterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addPrinter}
      />
    </div>
  );
};
