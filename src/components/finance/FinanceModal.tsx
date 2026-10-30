import React from 'react';
import { X } from 'lucide-react';

interface FinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingId: string | null;
  description: string;
  setDescription: (s: string) => void;
  type: 'RECEITA' | 'DESPESA';
  setType: (t: 'RECEITA' | 'DESPESA') => void;
  category: string;
  setCategory: (c: string) => void;
  value: number;
  setValue: (v: number) => void;
  date: string;
  setDate: (d: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const FinanceModal: React.FC<FinanceModalProps> = ({
  isOpen,
  onClose,
  editingId,
  description,
  setDescription,
  type,
  setType,
  category,
  setCategory,
  value,
  setValue,
  date,
  setDate,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1D25] rounded-2xl border border-[#2B303E] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-[#2B303E] bg-[#14171E] flex justify-between items-center">
          <h3 className="font-headline-sm text-white">
            {editingId ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#252A37] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="space-y-1">
            <label className="font-label-md text-slate-400 text-xs uppercase">Descrição do Lançamento</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Compra de parafusos para suporte"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#11141A] border border-[#2B303E] rounded-xl text-sm text-slate-200 outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                className="w-full px-3.5 py-2.5 bg-[#11141A] border border-[#2B303E] rounded-xl text-sm text-slate-200 outline-none focus:border-[#FFB800]"
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
                className="w-full px-3.5 py-2.5 bg-[#11141A] border border-[#2B303E] rounded-xl text-sm text-slate-200 outline-none focus:border-[#FFB800]"
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-label-md text-slate-400 text-xs uppercase">Valor (R$)</label>
              <input 
                type="number" 
                required
                step="0.01"
                min="0.01"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-[#11141A] border border-[#2B303E] rounded-xl text-sm text-slate-200 outline-none font-mono font-bold focus:border-[#FFB800]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-label-md text-slate-400 text-xs uppercase">Data</label>
              <input 
                type="date" 
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#11141A] border border-[#2B303E] rounded-xl text-sm text-slate-200 outline-none focus:border-[#FFB800]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2B303E]">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2.5 bg-[#11141A] border border-[#2B303E] text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-[#FFB800] hover:bg-[#FFA500] text-[#0F1115] font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all"
            >
              {editingId ? 'Salvar Alterações' : 'Registrar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

