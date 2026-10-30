import React from 'react';
import { Search, FileText, Edit, Trash2 } from 'lucide-react';
import { FinancialLog } from '../../types';

interface FinanceLedgerTableProps {
  filteredLogs: FinancialLog[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  selectedType: string;
  setSelectedType: (t: string) => void;
  onEdit: (log: FinancialLog) => void;
  onDelete: (id: string) => void;
}

export const FinanceLedgerTable: React.FC<FinanceLedgerTableProps> = ({
  filteredLogs,
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  onEdit,
  onDelete
}) => {
  return (
    <div className="space-y-4">
      {/* Busca e Filtros estilo segmented pill */}
      <div className="bg-[#1A1D25] border border-[#2B303E] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Pesquisar transação ou categoria..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#11141A] border border-[#2B303E] rounded-xl text-slate-200 outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] text-xs transition-colors"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['Todos', 'RECEITA', 'DESPESA'].map((t, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedType(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedType === t 
                  ? 'bg-[#FFB800] text-[#0F1115] shadow-md shadow-amber-500/25 border border-transparent' 
                  : 'bg-[#11141A] border border-[#2B303E] text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              {t === 'Todos' ? 'Todos os Lançamentos' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela do Livro Caixa */}
      <div className="bg-[#1A1D25] border border-[#2B303E] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#14171E] text-slate-400 font-label-md text-[11px] uppercase tracking-wider border-b border-[#2B303E]">
                <th className="px-6 py-4">ID Transação</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232733]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#11141A] transition-colors text-slate-200 font-body-md">
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400 font-bold">{log.id}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">
                      {log.date.split('-').reverse().join('/')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-[#11141A] border border-[#2B303E] rounded-lg text-slate-400">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-white truncate max-w-[280px]" title={log.description}>
                          {log.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        log.type === 'RECEITA' 
                          ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' 
                          : 'bg-[#FF5E3A]/15 text-[#FF5E3A] border border-[#FF5E3A]/30'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-[#11141A] border border-[#2B303E] rounded-full text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                        {log.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold text-sm ${
                      log.type === 'RECEITA' ? 'text-[#10B981]' : 'text-[#FF5E3A]'
                    }`}>
                      {log.type === 'RECEITA' ? '+' : '-'} R$ {log.value.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEdit(log)}
                          className="p-1.5 text-slate-400 hover:text-[#FFB800] hover:bg-[#FFB800]/10 rounded-lg transition-colors cursor-pointer"
                          title="Editar lançamento"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(log.id)}
                          className="p-1.5 text-slate-400 hover:text-[#FF5E3A] hover:bg-[#FF5E3A]/10 rounded-lg transition-colors cursor-pointer"
                          title="Excluir lançamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">
                    Nenhum registro financeiro localizado.
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

