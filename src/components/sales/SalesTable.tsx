import React from 'react';
import { Search, User, ShoppingBag, Edit, Trash2 } from 'lucide-react';
import { Sale } from '../../types';

interface SalesTableProps {
  filteredSales: Sale[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onEdit: (s: Sale) => void;
  onDelete: (id: string) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  filteredSales,
  searchTerm,
  setSearchTerm,
  onEdit,
  onDelete
}) => {
  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="bg-[#1A1D25] border border-[#2B303E] rounded-2xl p-4 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Pesquisar por ID, produto ou nome do cliente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#11141A] border border-[#2B303E] rounded-xl text-slate-200 outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] text-xs transition-colors"
          />
        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className="bg-[#1A1D25] border border-[#2B303E] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-[#14171E] text-slate-400 font-label-md text-[11px] uppercase tracking-wider border-b border-[#2B303E]">
                <th className="px-6 py-4">ID Pedido</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4 text-center">Qtd</th>
                <th className="px-6 py-4 text-right">Valor Total</th>
                <th className="px-6 py-4 text-right">Custo Total</th>
                <th className="px-6 py-4 text-right">Lucro Real</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232733]">
              {filteredSales.length > 0 ? (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-[#11141A] transition-colors text-slate-200 font-body-md">
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400 font-bold">{s.id}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">
                      {s.date.split('-').reverse().join('/')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-[#11141A] border border-[#2B303E] rounded-lg text-slate-400">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-white truncate max-w-[160px]">{s.clientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-[#11141A] border border-[#2B303E] rounded-lg text-[#FFB800]">
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium text-slate-200 truncate max-w-[200px]">{s.productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-slate-300">{s.quantity} un</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-white">R$ {s.totalValue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">R$ {s.totalCost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-[#10B981]">R$ {s.profit.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => onEdit(s)}
                          className="text-slate-400 hover:text-[#FFB800] hover:bg-[#FFB800]/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Editar Venda"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(s.id)}
                          className="text-slate-400 hover:text-[#FF5E3A] hover:bg-[#FF5E3A]/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Venda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500 italic">
                    Nenhum pedido faturado correspondente.
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

