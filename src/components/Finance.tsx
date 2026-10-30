import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { FinancialLog } from '../types';
import { Plus } from 'lucide-react';
import { FinanceMetrics } from './finance/FinanceMetrics';
import { FinanceLedgerTable } from './finance/FinanceLedgerTable';
import { FinanceModal } from './finance/FinanceModal';

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
    if (confirm('Deseja realmente remover esta movimentação financeira?')) {
      deleteFinancialLog(id);
    }
  };

  const filteredLogs = financialLogs
    .filter(log => {
      const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'Todos' || log.type === selectedType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] shadow-sm">
        <div>
          <h2 className="font-headline-md text-white mb-1">Controle Financeiro</h2>
          <p className="text-slate-400 font-body-md text-xs sm:text-sm">
            Gerencie o fluxo de caixa, despesas operacionais e demonstrativos de faturamento.
          </p>
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
          className="bg-[#FFB800] hover:bg-[#FFA500] text-[#0F1115] px-5 py-2.5 rounded-xl font-label-md flex items-center gap-2 shadow-md shadow-amber-500/20 font-bold transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Novo Lançamento
        </button>
      </div>

      {/* Grid de Balanço Financeiro */}
      <FinanceMetrics
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
        averageTicketValue={averageTicketValue}
      />

      {/* Busca, Filtros e Ledger Table */}
      <FinanceLedgerTable
        filteredLogs={filteredLogs}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal Registrar Transação */}
      <FinanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingId={editingId}
        description={description}
        setDescription={setDescription}
        type={type}
        setType={setType}
        category={category}
        setCategory={setCategory}
        value={value}
        setValue={setValue}
        date={date}
        setDate={setDate}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
