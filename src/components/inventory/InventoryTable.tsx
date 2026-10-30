import React from 'react';
import { Search, Plus, Minus } from 'lucide-react';
import { InventoryItem } from '../../types';

interface InventoryTableProps {
  filteredInventory: InventoryItem[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  statuses: string[];
  onOpenMovement: (item: InventoryItem, type: 'IN' | 'OUT') => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  filteredInventory,
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  statuses,
  onOpenMovement
}) => {
  return (
    <div className="space-y-4">
      {/* Filtros e Pesquisa */}
      <div className="bg-[#1A1D25] border border-[#2B303E] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Filtrar por nome do produto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#11141A] border border-[#2B303E] rounded-xl text-slate-200 outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] text-xs transition-colors"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {statuses.map((stat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedStatus(stat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedStatus === stat 
                  ? 'bg-[#FFB800] text-[#0F1115] shadow-md shadow-amber-500/25 border border-transparent' 
                  : 'bg-[#11141A] border border-[#2B303E] text-slate-400 hover:text-white'
              }`}
            >
              {stat === 'Todos' ? 'Status: Todos' : stat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela do Estoque */}
      <div className="bg-[#1A1D25] border border-[#2B303E] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="bg-[#14171E] text-slate-400 font-label-md text-[11px] uppercase tracking-wider border-b border-[#2B303E]">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nome do Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Estoque</th>
                <th className="px-6 py-4">Qtd Mínima</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Custo Unit</th>
                <th className="px-6 py-4 text-right">Valor em Estoque</th>
                <th className="px-6 py-4 text-center">Movimentações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232733]">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#11141A] transition-colors text-slate-200 font-body-md">
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400 font-bold">{item.id}</td>
                    <td className="px-6 py-4 font-bold text-white">{item.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{item.category}</td>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-white">{item.stock} un</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{item.minStock} un</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        item.status === 'NORMAL' 
                          ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' 
                          : item.status === 'BAIXO' 
                          ? 'bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30' 
                          : 'bg-[#FF5E3A]/15 text-[#FF5E3A] border border-[#FF5E3A]/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">R$ {item.costPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-mono text-xs font-bold text-[#FFB800]">
                      R$ {(item.stock * item.costPrice).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => onOpenMovement(item, 'IN')}
                          className="flex items-center gap-1 px-3 py-1 bg-[#FFB800]/15 text-[#FFB800] hover:bg-[#FFB800] hover:text-[#0F1115] border border-[#FFB800]/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Entrada
                        </button>
                        <button 
                          onClick={() => onOpenMovement(item, 'OUT')}
                          className="flex items-center gap-1 px-3 py-1 bg-[#FF5E3A]/15 text-[#FF5E3A] hover:bg-[#FF5E3A] hover:text-white border border-[#FF5E3A]/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[2.5]" /> Saída
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500 italic">
                    Nenhum item do inventário localizado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

