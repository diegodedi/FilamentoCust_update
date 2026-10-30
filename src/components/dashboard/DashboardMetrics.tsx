import React from 'react';
import { Package, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface DashboardMetricsProps {
  totalProductsCount: number;
  totalInventoryValue: number;
  currentMonthRevenue: number;
  currentMonthProfit: number;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  totalProductsCount,
  totalInventoryValue,
  currentMonthRevenue,
  currentMonthProfit
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Card 1: Total Produtos */}
      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] hover:border-[#FFB800]/40 transition-all shadow-sm group">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-label-md text-slate-400 uppercase tracking-wider text-[11px] mb-1">
              Total de Produtos
            </p>
            <h3 className="font-headline-md text-white group-hover:text-[#FFB800] transition-colors">
              {totalProductsCount} Itens
            </h3>
          </div>
          <div className="p-3 bg-[#11141A] border border-[#2B303E] rounded-xl text-[#FFB800]">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#10B981] font-bold text-xs flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" /> +12%
          </span>
          <span className="text-slate-400 text-xs">vs mês anterior</span>
        </div>
      </div>

      {/* Card 2: Valor Estoque */}
      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] hover:border-[#FFB800]/40 transition-all shadow-sm group">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-label-md text-slate-400 uppercase tracking-wider text-[11px] mb-1">
              Valor do Estoque
            </p>
            <h3 className="font-headline-md text-white group-hover:text-[#FFB800] transition-colors">
              {formatCurrency(totalInventoryValue)}
            </h3>
          </div>
          <div className="p-3 bg-[#11141A] border border-[#2B2F36] rounded-xl text-[#FFB800]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#10B981] font-bold text-xs flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" /> +5.2%
          </span>
          <span className="text-slate-400 text-xs">itens ativos</span>
        </div>
      </div>

      {/* Card 3: Faturamento Mensal */}
      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] hover:border-[#FFB800]/40 transition-all shadow-sm group relative overflow-hidden">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-label-md text-slate-400 uppercase tracking-wider text-[11px] mb-1">
              Faturamento Mensal
            </p>
            <h3 className="font-headline-md text-[#FFB800]">
              {formatCurrency(currentMonthRevenue)}
            </h3>
          </div>
          <div className="p-3 bg-[#FFB800]/15 border border-[#FFB800]/30 rounded-xl text-[#FFB800]">
            <DollarSign className="w-5 h-5 font-black" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#10B981] font-bold text-xs flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" /> +18%
          </span>
          <span className="text-slate-400 text-xs">meta jun/26</span>
        </div>
      </div>

      {/* Card 4: Lucro Mensal Líquido */}
      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] hover:border-[#FF5E3A]/40 transition-all shadow-sm group">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-label-md text-slate-400 uppercase tracking-wider text-[11px] mb-1">
              Lucro Líquido
            </p>
            <h3 className="font-headline-md text-[#10B981]">
              {formatCurrency(currentMonthProfit)}
            </h3>
          </div>
          <div className="p-3 bg-[#11141A] border border-[#2B303E] rounded-xl text-[#10B981]">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#FFB800] font-bold text-xs flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" /> +8.4%
          </span>
          <span className="text-slate-400 text-xs">
            margem ~{currentMonthRevenue ? Math.round((currentMonthProfit / currentMonthRevenue) * 100) : 40}%
          </span>
        </div>
      </div>
    </div>
  );
};

