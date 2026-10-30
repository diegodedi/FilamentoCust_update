import React from 'react';
import { X } from 'lucide-react';
import { Product, Customer } from '../../types';

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  customPrice: number | null;
  setCustomPrice: (p: number | null) => void;
  defaultPrice: number;
  saleDate: string;
  setSaleDate: (d: string) => void;
  calculatedTotal: number;
  calculatedCost: number;
  calculatedProfit: number;
  customers: Customer[];
  products: Product[];
  onSubmit: (e: React.FormEvent) => void;
}

export const SalesModal: React.FC<SalesModalProps> = ({
  isOpen,
  onClose,
  selectedClientId,
  setSelectedClientId,
  selectedProductId,
  setSelectedProductId,
  quantity,
  setQuantity,
  customPrice,
  setCustomPrice,
  defaultPrice,
  saleDate,
  setSaleDate,
  calculatedTotal,
  calculatedCost,
  calculatedProfit,
  customers,
  products,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1D25] rounded-2xl border border-[#2B303E] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-[#2B303E] bg-[#14171E] flex justify-between items-center">
          <h3 className="font-headline-sm text-white">Registrar Faturamento / Venda</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#252A37] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="space-y-1">
            <label className="font-label-md text-slate-400 text-xs uppercase">Cliente do Pedido</label>
            <select 
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#2B303E] rounded-xl text-sm bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.company || 'Pessoa Física'})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-label-md text-slate-400 text-xs uppercase">Produto Solicitado</label>
              <select 
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#2B303E] rounded-xl text-sm bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-label-md text-slate-400 text-xs uppercase">Quantidade (un)</label>
              <input 
                type="number" 
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 border border-[#2B303E] rounded-xl text-sm bg-[#11141A] text-slate-200 outline-none font-mono font-bold focus:border-[#FFB800]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-label-md text-slate-400 text-xs uppercase">Preço Unitário (R$)</label>
              <input 
                type="number" 
                step="0.01"
                placeholder={`Padrão: R$ ${defaultPrice}`}
                value={customPrice !== null ? customPrice : ''}
                onChange={(e) => setCustomPrice(e.target.value !== '' ? parseFloat(e.target.value) : null)}
                className="w-full px-3.5 py-2.5 border border-[#2B303E] rounded-xl text-sm bg-[#11141A] text-slate-200 outline-none font-mono focus:border-[#FFB800]"
              />
              <p className="text-[9px] text-slate-500">Deixe em branco para preço do catálogo.</p>
            </div>

            <div className="space-y-1">
              <label className="font-label-md text-slate-400 text-xs uppercase">Data do Faturamento</label>
              <input 
                type="date" 
                required
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#2B303E] rounded-xl text-sm bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
              />
            </div>
          </div>

          {/* Projeções financeiras da venda */}
          <div className="p-4 bg-[#11141A] rounded-xl border border-[#2B303E] text-xs space-y-2">
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">Valor Bruto:</span>
              <span className="font-mono font-bold text-white">R$ {calculatedTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">Custo de Produção:</span>
              <span className="font-mono font-medium text-slate-300">R$ {calculatedCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-[#2B303E]">
              <span className="text-slate-400">Lucro Projetado:</span>
              <span className={`font-mono font-bold ${calculatedProfit > 0 ? 'text-[#10B981]' : 'text-[#FF5E3A]'}`}>
                R$ {calculatedProfit.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#2B303E]">
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
              Faturar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

