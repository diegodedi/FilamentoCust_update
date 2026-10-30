import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ChevronRight, AlertTriangle, Award } from 'lucide-react';
import { InventoryItem } from '../../types';

interface CategoryItem {
  name: string;
  value: number;
}

interface TopProductItem {
  id: string;
  qty: number;
  total: number;
  name: string;
  image: string;
}

interface DashboardAlertsAndTopProps {
  categoryChartData: CategoryItem[];
  currentMonthRevenue: number;
  lowStockItems: InventoryItem[];
  topProductsList: TopProductItem[];
  setView: (v: string) => void;
}

const LUXURY_COLORS = ['#FFB800', '#FF5E3A', '#10B981', '#38BDF8', '#C084FC'];

export const DashboardAlertsAndTop: React.FC<DashboardAlertsAndTopProps> = ({
  categoryChartData,
  currentMonthRevenue,
  lowStockItems,
  topProductsList,
  setView
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
      {/* 1. Distribuição por Categoria (Donut Chart) */}
      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] shadow-sm flex flex-col justify-between">
        <div className="mb-4">
          <h4 className="font-headline-sm text-white">Vendas por Categoria</h4>
          <p className="text-xs text-slate-400">Distribuição financeira das encomendas</p>
        </div>

        {categoryChartData.length > 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={LUXURY_COLORS[index % LUXURY_COLORS.length]} stroke="#11141A" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`R$ ${Number(val).toFixed(2)}`, 'Total']}
                    contentStyle={{ 
                      backgroundColor: '#161922', 
                      borderRadius: '10px', 
                      borderColor: '#2B303E',
                      color: '#FFF' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
                <span className="text-sm font-extrabold text-[#FFB800]">R$ {currentMonthRevenue.toFixed(0)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full text-xs">
              {categoryChartData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: LUXURY_COLORS[index % LUXURY_COLORS.length] }}></span>
                  <span className="text-slate-300 truncate max-w-[110px]" title={entry.name}>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500 italic py-10">
            Nenhuma venda registrada
          </div>
        )}
      </div>

      {/* 2. Alertas de Reposição de Estoque */}
      <div className="bg-[#1A1D25] rounded-2xl border border-[#2B303E] shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="p-4 sm:p-5 border-b border-[#2B303E] bg-[#14171E] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5E3A] animate-pulse"></span>
            <h4 className="font-headline-sm text-sm text-white">Alertas de Reposição</h4>
          </div>
          <button 
            onClick={() => setView('estoque')} 
            className="text-[#FFB800] hover:text-[#FFA000] font-label-md text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            Ver Todos <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[240px] divide-y divide-[#232733] p-1">
          {lowStockItems.length > 0 ? (
            lowStockItems.map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center gap-3 hover:bg-[#11141A] rounded-xl transition-colors">
                <div className={`p-2 rounded-xl shrink-0 ${
                  item.status === 'CRITICO' 
                    ? 'bg-[#FF5E3A]/15 text-[#FF5E3A] border border-[#FF5E3A]/30' 
                    : 'bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Estoque: {item.stock} un | Mínimo: {item.minStock} un
                  </p>
                </div>
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    item.status === 'CRITICO' 
                      ? 'bg-[#FF5E3A]/20 text-[#FF5E3A] border border-[#FF5E3A]/40' 
                      : 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/40'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 italic flex flex-col items-center justify-center h-full">
              <Award className="w-8 h-8 text-[#10B981] mb-2" />
              Estoque 100% regulado!
            </div>
          )}
        </div>
      </div>

      {/* 3. Mais Vendidos */}
      <div className="bg-[#1A1D25] rounded-2xl border border-[#2B303E] shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="p-4 sm:p-5 border-b border-[#2B303E] bg-[#14171E] flex justify-between items-center">
          <h4 className="font-headline-sm text-sm text-white">Mais Vendidos</h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFB800]/15 text-[#FFB800] font-bold">
            TOP VENDAS
          </span>
        </div>

        <div className="flex-1 p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[240px] overflow-y-auto">
          {topProductsList.length > 0 ? (
            topProductsList.map((prod, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 p-2.5 border border-[#2B303E] rounded-xl bg-[#11141A] hover:border-[#FFB800]/50 transition-all group"
              >
                <img 
                  src={prod.image} 
                  className="w-10 h-10 rounded-lg object-cover border border-[#2B303E] group-hover:scale-105 transition-transform shrink-0" 
                  referrerPolicy="no-referrer" 
                  alt={prod.name} 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-[#FFB800] transition-colors">
                    {prod.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">{prod.qty} vendas</p>
                  <p className="text-[10px] text-[#FFB800] font-extrabold font-mono">
                    R$ {prod.total.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center text-xs text-slate-500 italic py-10 h-full flex items-center justify-center">
              Sem registros de vendas
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

