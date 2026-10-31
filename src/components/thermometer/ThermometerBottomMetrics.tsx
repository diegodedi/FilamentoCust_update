import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ThermometerBottomMetricsProps {
  totalMonthlyProfit: number;
  targetIncome: number;
  setTargetIncome: (val: number) => void;
  percentOfTarget: number;
  numPrinters: number;
  printersNeeded: number;
}

export const ThermometerBottomMetrics: React.FC<ThermometerBottomMetricsProps> = ({
  totalMonthlyProfit,
  targetIncome,
  setTargetIncome,
  percentOfTarget,
  numPrinters,
  printersNeeded
}) => {
  return (
    <div className="min-h-20 bg-[#11141A] border-t border-[#222733] flex flex-wrap items-center px-6 py-4 gap-4 md:gap-8 shrink-0">
      <div className="flex flex-col">
        <span className="block text-[10px] text-slate-400 font-mono font-bold tracking-wider mb-1 uppercase">
          Lucro Total / Mês
        </span>
        <span className="text-xl font-mono font-black text-emerald-400">
          R$ {totalMonthlyProfit >= 1000 ? (totalMonthlyProfit/1000).toFixed(1).replace('.', ',') + 'K' : totalMonthlyProfit.toFixed(2).replace('.', ',')}
        </span>
      </div>

      <div className="hidden md:block w-px h-8 bg-[#222733] shrink-0" />

      <div className="flex flex-col">
        <span className="block text-[10px] text-slate-400 font-mono font-bold tracking-wider mb-1 uppercase">
          Renda Alvo
        </span>
        <div className="flex items-center text-xl font-mono font-black text-white">
          R$ 
          <input 
            type="number" 
            value={targetIncome || ''} 
            onChange={e => setTargetIncome(Number(e.target.value))} 
            className="bg-[#14171E] border border-[#2B303E] rounded-lg px-2 py-0.5 w-24 outline-none text-white ml-2 font-black focus:border-[#FFB800]"
          />
        </div>
      </div>

      <div className="hidden md:block w-px h-8 bg-[#222733] shrink-0" />

      <div className="flex flex-col">
        <span className="block text-[10px] text-slate-400 font-mono font-bold tracking-wider mb-1 uppercase">
          % Da Meta
        </span>
        <span className="text-xl font-mono font-black text-[#FFB800]">
          {percentOfTarget.toFixed(1)}%
        </span>
      </div>

      <div className="hidden md:block w-px h-8 bg-[#222733] shrink-0" />

      <div className="flex flex-col">
        <span className="block text-[10px] text-slate-400 font-mono font-bold tracking-wider mb-1 uppercase">
          Impressoras
        </span>
        <span className="text-xl font-mono font-black text-slate-200">
          {numPrinters}
        </span>
      </div>

      {totalMonthlyProfit > 0 && totalMonthlyProfit < targetIncome && (
        <div className="ml-auto bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2 flex items-center gap-2.5 shrink-0 max-w-[340px]">
          <AlertTriangle className="w-4 h-4 text-[#FFB800] shrink-0" />
          <span className="text-xs text-amber-200 leading-tight">
            <strong className="text-[#FFB800] font-bold">Faltam {Math.max(1, printersNeeded - numPrinters)} impressoras</strong> para atingir a meta mensal.
          </span>
        </div>
      )}
    </div>
  );
};

