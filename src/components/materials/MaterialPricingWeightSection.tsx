import React from 'react';
import { Seller } from '../../types';
import { Scale } from 'lucide-react';

interface MaterialPricingWeightSectionProps {
  sellers: Seller[];
  selectedSellerId: string;
  setSelectedSellerId: (id: string) => void;
  spoolPrice: number;
  setSpoolPrice: (val: number) => void;
  purchaseDate: string;
  setPurchaseDate: (val: string) => void;
  initialWeight: number;
  setInitialWeight: (val: number) => void;
  currentWeight: number;
  setCurrentWeight: (val: number) => void;
}

export const MaterialPricingWeightSection: React.FC<MaterialPricingWeightSectionProps> = ({
  sellers,
  selectedSellerId,
  setSelectedSellerId,
  spoolPrice,
  setSpoolPrice,
  purchaseDate,
  setPurchaseDate,
  initialWeight,
  setInitialWeight,
  currentWeight,
  setCurrentWeight
}) => {
  return (
    <div className="space-y-3.5">
      <div className="space-y-1">
        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">Vendedor / Loja</label>
        <select
          value={selectedSellerId}
          onChange={(e) => setSelectedSellerId(e.target.value)}
          className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
        >
          <option value="">Selecione um vendedor (Opcional)</option>
          {sellers.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">Valor Pago (R$)</label>
          <input 
            type="number" 
            required
            step="0.01"
            min="1"
            value={spoolPrice}
            onChange={(e) => setSpoolPrice(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">Data Compra</label>
          <input 
            type="date" 
            required
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">Peso Inicial (g)</label>
          <input 
            type="number" 
            required
            min={1}
            value={initialWeight}
            onChange={(e) => setInitialWeight(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">Peso Atual (g)</label>
          <input 
            type="number" 
            required
            min={0}
            value={currentWeight}
            onChange={(e) => setCurrentWeight(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
          />
        </div>
      </div>

      <div className="p-3 bg-[#11141A] rounded-xl border border-[#222733] text-xs flex justify-between items-center font-medium">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-[#FFB800]" /> Custo Projetado:
        </span>
        <span className="font-mono font-bold text-amber-300">
          R$ {(spoolPrice / initialWeight).toFixed(4)} / grama
        </span>
      </div>
    </div>
  );
};
