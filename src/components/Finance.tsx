import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { FinancialLog } from '../types';
import { Search, Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Tag, FileText, X, Trash2, Edit } from 'lucide-react';

export const Finance: React.FC = () => {
  const { financialLogs, addFinancialLog, updateFinancialLog, deleteFinancialLog, sales } = useDb();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'RECEITA' | 'DESPESA'>('RECEITA');
  const [category, setCategory] = useState('Vendas');
  const [value, setValue] = useState(100.00);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Financial calculations
  const totalRevenue = financialLogs
    .filter(log => log.type === 'RECEITA')
    .reduce((acc, curr) => acc + curr.value, 0);

  const totalExpenses = financialLogs
    .filter(log => log.type === 'DESPESA')
    .reduce((acc, curr) => acc + curr.value, 0);

  const netProfit = totalRevenue - totalExpenses;
  const averageTicketValue = sales.length > 0 
    ? sales.reduce((acc, curr) => acc + curr.totalValue, 0) / sales.length 
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    if (editingId) {
      updateFinancialLog(editingId, {
        id: editingId,
        date,
        type,
        description,
        category,
        value: Math.max(0.01, parseFloat(value.toString()) || 0.01)
      });
    } else {
      addFinancialLog({
        date,
        type,
        description,
        category,
        value: Math.max(0.01, parseFloat(value.toString()) || 0.01)
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
    setDescription('');
    setValue(100.00);
  };

  const handleEdit = (log: FinancialLog) => {
    setEditingId(log.id);
    setDescription(log.description);
    setType(log.type);
    setCategory(log.category);
    setValue(log.value);
    setDate(log.date);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      deleteFinancialLog(id);
    }
  };

  // Filter logs
  const filteredLogs = financialLogs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'Todos' || log.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-white mb-1">Controle Financeiro</h2>
          <p className="text-slate-400 font-body-md">Gerencie o fluxo de caixa, despesas operacionais e demonstrativos de faturamento.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setDescription('');
            setType('RECEITA');
            setCategory('Vendas');
            setValue(100.00);
            setDate(new Date().toISOString().split('T')[0]);
            setIsModalOpen(true);
          }}
          className="bg-[#0084FF] text-white px-5 py-2.5 rounded-lg font-label-md hover:bg-[#0084FF]/90 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Novo Lançamento
        </button>
      </div>

      {/* Grid de Balanço Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Receita Acumulada */}
        <div className="bg-[#1C1F24] p-6 rounded-xl border border-[#2B2F36] shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-1">Receita Total</p>
              <h3 className="font-headline-md text-white">
                R$ {totalRevenue.toFixed(2)}
              </h3>
            </div>
            <div className="p-2.5 bg-green-50 rounded-lg text-[#22C55E] border border-green-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="text-slate-400 text-xs font-body-md">Entradas de faturamento faturadas</span>
        </div>

        {/* Custos Totais */}
        <div className="bg-[#1C1F24] p-6 rounded-xl border border-[#2B2F36] shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-1">Custos Totais</p>
              <h3 className="font-headline-md text-white">
                R$ {totalExpenses.toFixed(2)}
              </h3>
            </div>
            <div className="p-2.5 bg-red-50 rounded-lg text-red-600 border border-red-100">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <span className="text-slate-400 text-xs font-body-md">Insumos, energia e amortização</span>
        </div>

        {/* Lucro Líquido */}
        <div className="bg-[#1C1F24] p-6 rounded-xl border border-[#2B2F36] shadow-sm border-l-4 border-l-[#22C55E]">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-1">Lucro Líquido</p>
              <h3 className={`font-headline-md font-extrabold ${netProfit >= 0 ? 'text-[#22C55E]' : 'text-red-600'}`}>
                R$ {netProfit.toFixed(2)}
              </h3>
            </div>
            <div className="p-2.5 bg-[#121418] border border-[#2B2F36] rounded-lg">
              <DollarSign className="w-5 h-5 text-slate-300" />
            </div>
          </div>
          <span className="text-slate-400 text-xs font-body-md">EBITDA operacional ajustado</span>
        </div>

        {/* Ticket Médio */}
        <div className="bg-[#1C1F24] p-6 rounded-xl border border-[#2B2F36] shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-label-md text-slate-400 text-[11px] uppercase tracking-wider mb-1">Ticket Médio</p>
              <h3 className="font-headline-md text-white">
                R$ {averageTicketValue.toFixed(2)}
              </h3>
            </div>
            <div className="p-2.5 bg-[#121418] border border-[#2B2F36] rounded-lg">
              <TrendingUp className="w-5 h-5 text-slate-300" />
            </div>
          </div>
          <span className="text-slate-400 text-xs font-body-md">Média faturada por venda</span>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Pesquisar transação ou categoria..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#2B2F36] rounded-lg text-slate-200 bg-[#121418] outline-none focus:ring-2 focus:ring-[#0084FF]/50 text-xs"
          />
        </div>
        
        <div className="flex gap-2">
          {['Todos', 'RECEITA', 'DESPESA'].map((t, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedType(t)}
              className={`px-4 py-2 rounded-lg text-xs font-medium border cursor-pointer ${
                selectedType === t 
                  ? 'bg-slate-900 border-slate-900 text-white font-bold' 
                  : 'bg-[#1C1F24] border-[#2B2F36] text-slate-400 hover:bg-[#121418]'
              }`}
            >
              {t === 'Todos' ? 'Todos os Lançamentos' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela do Livro Caixa / Ledger */}
      <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#121418] text-slate-400 font-label-md text-[11px] uppercase tracking-wider border-b border-[#2B2F36]">
                <th className="px-6 py-4">ID Transação</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#121418] transition-colors text-slate-200 font-body-md">
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400 font-bold">{log.id}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">
                      {log.date.split('-').reverse().join('/')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#2B2F36] rounded text-slate-400">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-white truncate max-w-[250px]">{log.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        log.type === 'RECEITA' 
                          ? 'bg-[#22C55E]/15 text-[#22C55E]' 
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-[#2B2F36] border border-[#2B2F36] rounded text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {log.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold text-sm ${
                      log.type === 'RECEITA' ? 'text-[#22C55E]' : 'text-red-600'
                    }`}>
                      {log.type === 'RECEITA' ? '+' : '-'} R$ {log.value.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(log)}
                          className="p-1.5 text-slate-400 hover:text-[#0084FF] hover:bg-[#0084FF]/10 rounded-lg transition-colors cursor-pointer"
                          title="Editar lançamento"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
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
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    Nenhum registro financeiro localizado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Transação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1F24] rounded-xl border border-[#2B2F36] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-[#2B2F36] bg-[#121418] flex justify-between items-center">
              <h3 className="font-headline-sm text-white">{editingId ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-300 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-xs uppercase">Descrição do Lançamento</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Compra de parafusos para suporte"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Tipo</label>
                  <select 
                    value={type}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setType(t);
                      if (t === 'DESPESA') setCategory('Manutenção');
                      else setCategory('Vendas');
                    }}
                    className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#1C1F24] outline-none"
                  >
                    <option value="RECEITA">Entrada (Receita)</option>
                    <option value="DESPESA">Saída (Despesa)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Categoria</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#1C1F24] outline-none"
                  >
                    {type === 'RECEITA' ? (
                      <>
                        <option value="Vendas">Vendas</option>
                        <option value="Serviços">Serviços</option>
                        <option value="Outros">Outros</option>
                      </>
                    ) : (
                      <>
                        <option value="Insumos">Insumos (Filamento)</option>
                        <option value="Manutenção">Manutenção</option>
                        <option value="Energia">Energia Elétrica</option>
                        <option value="Operacional">Operacional / Pro Labore</option>
                        <option value="Outros">Outros</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Valor (R$)</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    min="0.01"
                    value={value}
                    onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Data</label>
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#2B2F36] text-slate-400 rounded-lg text-xs font-label-md hover:bg-[#121418] cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#0084FF] hover:bg-[#0084FF]/90 text-white rounded-lg text-xs font-label-md cursor-pointer"
                >
                  {editingId ? 'Salvar Alterações' : 'Registrar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
