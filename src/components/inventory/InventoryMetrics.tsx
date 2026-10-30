import React from 'react';
import { InventoryItem } from '../../types';

interface InventoryMetricsProps {
  inventory: InventoryItem[];
}

export const InventoryMetrics: React.FC<InventoryMetricsProps> = ({ inventory }) => {
  const totalStock = inventory.reduce((acc, c) => acc + c.stock, 0);
  const totalCost = inventory.reduce((acc, c) => acc + (c.stock * c.costPrice), 0);
  const criticalItems = inventory.filter(i => i.status === 'CRITICO');
  const lowItems = inventory.filter(i => i.status === 'BAIXO');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] hover:border-[#FFB800]/40 transition-all shadow-sm group">
        <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-2">Total em Estoque</p>
        <div className="flex items-end justify-between">
          <span className="text-[28px] font-bold text-white group-hover:text-[#FFB800] transition-colors">
            {totalStock} un
          </span>
          <span className="text-slate-400 font-label-md text-xs">peças prontas</span>
        </div>
      </div>

      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] hover:border-[#FFB800]/40 transition-all shadow-sm group">
        <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-2">Custo do Patrimônio</p>
        <div className="flex items-end justify-between">
          <span className="text-[28px] font-bold text-[#FFB800] font-mono">
            R$ {totalCost.toFixed(0)}
          </span>
          <span className="text-[#FFB800] font-label-md text-xs font-bold">Investido</span>
        </div>
      </div>

      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] hover:border-[#FF5E3A]/40 transition-all shadow-sm group">
        <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-2">Críticos (Zerar)</p>
        <div className="flex items-end justify-between">
          <span className="text-[28px] font-bold text-[#FF5E3A] font-mono">
            {criticalItems.length} Itens
          </span>
          <span className="px-2 py-0.5 bg-[#FF5E3A]/15 text-[#FF5E3A] border border-[#FF5E3A]/30 text-[10px] rounded-full font-bold">
            Urgente
          </span>
        </div>
      </div>

      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] hover:border-[#FFB800]/40 transition-all shadow-sm group">
        <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-2">Sob Alerta Baixo</p>
        <div className="flex items-end justify-between">
          <span className="text-[28px] font-bold text-[#FFB800] font-mono">
            {lowItems.length} Itens
          </span>
          <span className="px-2 py-0.5 bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30 text-[10px] rounded-full font-bold">
            Reposição
          </span>
        </div>
      </div>
    </div>
  );
};

