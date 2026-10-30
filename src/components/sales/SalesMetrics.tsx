import React from 'react';
import { ShoppingBag, TrendingUp, DollarSign } from 'lucide-react';

interface SalesMetricsProps {
  salesCount: number;
  averageTicket: number;
  totalSalesProfit: number;
  totalSalesRevenue: number;
}

export const SalesMetrics: React.FC<SalesMetricsProps> = ({
  salesCount,
  averageTicket,
  totalSalesProfit,
  totalSalesRevenue
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] hover:border-[#FFB800]/40 transition-all shadow-sm group">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-1">Pedidos Faturados</p>
            <h3 className="font-headline-md text-white group-hover:text-[#FFB800] transition-colors">
              {salesCount} Pedidos
            </h3>
          </div>
          <div className="p-3 bg-[#11141A] border border-[#2B303E] rounded-xl text-[#FFB800]">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
        <span className="text-slate-400 font-label-md text-xs">acumulado histórico</span>
      </div>

      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] hover:border-[#FFB800]/40 transition-all shadow-sm group">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-1">Ticket Médio</p>
            <h3 className="font-headline-md text-[#FFB800] font-mono">
              R$ {averageTicket.toFixed(2)}
            </h3>
          </div>
          <div className="p-3 bg-[#FFB800]/15 border border-[#FFB800]/30 rounded-xl text-[#FFB800]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <span className="text-slate-400 font-label-md text-xs">por transação</span>
      </div>

      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] hover:border-[#10B981]/40 transition-all shadow-sm group">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-1">Lucro Total Acumulado</p>
            <h3 className="font-headline-md text-[#10B981] font-mono">
              R$ {totalSalesProfit.toFixed(2)}
            </h3>
          </div>
          <div className="p-3 bg-[#10B981]/15 border border-[#10B981]/30 rounded-xl text-[#10B981]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <span className="text-[#10B981] font-label-md text-xs font-bold">
          ~{totalSalesRevenue ? Math.round((totalSalesProfit / totalSalesRevenue) * 100) : 0}% margem média
        </span>
      </div>
    </div>
  );
};

