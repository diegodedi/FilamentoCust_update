import React, { useState } from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';
import { ProductPackagingItem, Supply } from '../../types';

interface MlPackagingSelectorProps {
  supplies: Supply[];
  wastePercent: number;
  setWastePercent: (val: number) => void;
  packItems: ProductPackagingItem[];
  setPackItems: (items: ProductPackagingItem[]) => void;
}

/**
 * Subcomponente para vínculo de insumos de embalagem (caixas, plástico bolha, fita) e perda 3D.
 */
export const MlPackagingSelector: React.FC<MlPackagingSelectorProps> = ({
  supplies,
  wastePercent,
  setWastePercent,
  packItems,
  setPackItems
}) => {
  const [selectedSupplyId, setSelectedSupplyId] = useState<string>(supplies[0]?.id || '');
  const [selectedSupplyQty, setSelectedSupplyQty] = useState<number>(1);

  const handleAddSupplyItem = () => {
    if (!selectedSupplyId || selectedSupplyQty <= 0) return;
    const existingIdx = packItems.findIndex((i) => i.supplyId === selectedSupplyId);
    if (existingIdx >= 0) {
      const next = [...packItems];
      next[existingIdx].quantity += selectedSupplyQty;
      setPackItems(next);
    } else {
      setPackItems([...packItems, { supplyId: selectedSupplyId, quantity: selectedSupplyQty }]);
    }
  };

  return (
    <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-bold text-[#FFB800] uppercase tracking-wider flex items-center gap-1.5">
          <Package className="w-4 h-4" />
          1. Embalagem Vinculada & Margem de Falha/Suporte 3D
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-slate-400 font-bold">Perda/Suporte 3D (%):</label>
          <input
            type="number"
            min="0"
            max="50"
            value={wastePercent}
            onChange={(e) => setWastePercent(Math.max(0, Number(e.target.value)))}
            className="w-16 bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-2 py-1 text-xs text-white font-mono text-center focus:border-[#FFB800] outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] text-slate-400 uppercase block mb-1">
            Adicionar Insumo (Caixa, Plástico Bolha, Fita)
          </label>
          <select
            value={selectedSupplyId}
            onChange={(e) => setSelectedSupplyId(e.target.value)}
            className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-[#FFB800]"
          >
            {supplies.length === 0 && <option value="">Nenhum insumo cadastrado na aba Insumos</option>}
            {supplies.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.type}] {s.name} — R$ {Number(s.unitPrice).toFixed(2)}/un
              </option>
            ))}
          </select>
        </div>
        <div className="w-20">
          <label className="text-[10px] text-slate-400 uppercase block mb-1">Qtd</label>
          <input
            type="number"
            min="0.1"
            step="0.5"
            value={selectedSupplyQty}
            onChange={(e) => setSelectedSupplyQty(Number(e.target.value))}
            className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAddSupplyItem}
          disabled={!selectedSupplyId}
          className="px-3 py-1.5 bg-[#252A37] hover:bg-[#2B303E] text-white border border-[#383F50] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#FFB800]" /> Incluir
        </button>
      </div>

      {packItems.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {packItems.map((item, idx) => {
            const sup = supplies.find((s) => s.id === item.supplyId);
            const sub = (sup ? Number(sup.unitPrice) : 0) * item.quantity;
            return (
              <div key={idx} className="flex items-center justify-between bg-[#1C1F24] px-3 py-1.5 rounded-lg text-xs">
                <span className="text-slate-300">
                  {item.quantity}x {sup ? `${sup.type} - ${sup.name}` : 'Insumo'}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-200 font-bold">R$ {sub.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => setPackItems(packItems.filter((_, i) => i !== idx))}
                    className="text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

