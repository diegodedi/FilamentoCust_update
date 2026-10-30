import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface FinanceMetricsProps {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  averageTicketValue: number;
}

export const FinanceMetrics: React.FC<FinanceMetricsProps> = ({
  totalRevenue,
  totalExpenses,
  netProfit,
  averageTicketValue
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Receita Acumulada */}
      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] hover:border-[#10B981]/40 shadow-sm transition-all group">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-1">Receita Total</p>
            <h3 className="font-headline-md text-white group-hover:text-[#10B981] transition-colors font-mono">
              R$ {totalRevenue.toFixed(2)}
            </h3>
          </div>
          <div className="p-3 bg-[#10B981]/15 rounded-xl text-[#10B981] border border-[#10B981]/30">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <span className="text-slate-400 text-xs font-body-md">Entradas de faturamento faturadas</span>
      </div>

      {/* Custos Totais */}
      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] hover:border-[#FF5E3A]/40 shadow-sm transition-all group">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-1">Custos Totais</p>
            <h3 className="font-headline-md text-white group-hover:text-[#FF5E3A] transition-colors font-mono">
              R$ {totalExpenses.toFixed(2)}
            </h3>
          </div>
          <div className="p-3 bg-[#FF5E3A]/15 rounded-xl text-[#FF5E3A] border border-[#FF5E3A]/30">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <span className="text-slate-400 text-xs font-body-md">Insumos, energia e amortização</span>
      </div>

      {/* Lucro Líquido */}
      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] hover:border-[#FFB800]/40 shadow-sm transition-all group">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-1">Lucro Líquido</p>
            <h3 className={`font-headline-md font-mono font-extrabold ${netProfit >= 0 ? 'text-[#10B981]' : 'text-[#FF5E3A]'}`}>
              R$ {netProfit.toFixed(2)}
            </h3>
          </div>
          <div className="p-3 bg-[#11141A] border border-[#2B303E] rounded-xl text-[#FFB800]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <span className="text-slate-400 text-xs font-body-md">EBITDA operacional ajustado</span>
      </div>

      {/* Ticket Médio */}
      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] hover:border-[#FFB800]/40 shadow-sm transition-all group">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-1">Ticket Médio</p>
            <h3 className="font-headline-md text-white group-hover:text-[#FFB800] transition-colors font-mono">
              R$ {averageTicketValue.toFixed(2)}
            </h3>
          </div>
          <div className="p-3 bg-[#11141A] border border-[#2B303E] rounded-xl text-[#FFB800]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <span className="text-slate-400 text-xs font-body-md">Média faturada por venda</span>
      </div>
    </div>
  );
};

