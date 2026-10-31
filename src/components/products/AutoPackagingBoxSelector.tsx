import React from 'react';
import { Package, Sparkles, RotateCcw, Check, Scale } from 'lucide-react';
import { Supply } from '../../types';

interface AutoPackagingBoxSelectorProps {
  boxes: Supply[];
  selectedSupplyId: string;
  onSelectBox: (id: string) => void;
  packagingCost: number;
  onChangePackagingCost: (val: number) => void;
  isAutoMatched: boolean;
  isManuallySelected: boolean;
  autoBoxId?: string;
  onResetToAuto: () => void;
  pieceWeight: number;
  packageWeight: number;
  onChangePackageWeight: (val: number) => void;
  estimatedBoxWeight: number;
  hasBoxWeightRegistered: boolean;
  protectionWeight: number;
  estimatedTotalWeight: number;
  isWeightCustomized: boolean;
  onResetWeightToEstimated: () => void;
}

/**
 * Seletor inteligente de embalagem com detecção automática e possibilidade de ajuste manual.
 */
export const AutoPackagingBoxSelector: React.FC<AutoPackagingBoxSelectorProps> = ({
  boxes,
  selectedSupplyId,
  onSelectBox,
  packagingCost,
  onChangePackagingCost,
  isAutoMatched,
  isManuallySelected,
  autoBoxId,
  onResetToAuto,
  pieceWeight,
  packageWeight,
  onChangePackageWeight,
  estimatedBoxWeight,
  hasBoxWeightRegistered,
  protectionWeight,
  estimatedTotalWeight,
  isWeightCustomized,
  onResetWeightToEstimated
}) => {
  const selectedBox = boxes.find((b) => b.id === selectedSupplyId);

  return (
    <div className="p-4 bg-[#14171E] border border-[#2B303E] rounded-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#FFB800]" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Embalagem do Produto
          </h4>
          {isAutoMatched && !isManuallySelected && (
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Caixa Sugerida Automaticamente
            </span>
          )}
        </div>
        {isManuallySelected && (
          <button
            type="button"
            onClick={onResetToAuto}
            className="text-[11px] text-[#FFB800] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Restaurar Sugestão Automática
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div className="sm:col-span-2 space-y-1">
          <label className="text-[10px] text-slate-400 uppercase font-bold block">
            Caixa de Papelão (Insumos)
          </label>
          <select
            value={selectedSupplyId}
            onChange={(e) => onSelectBox(e.target.value)}
            className="w-full bg-[#1C1F24] border border-[#2B303E] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#FFB800]"
          >
            <option value="NONE">Sem Caixa (Embalagem Própria / Sacola)</option>
            {boxes.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} — R$ {Number(b.unitPrice).toFixed(2)}
                {b.unitWeightGrams ? ` (${b.unitWeightGrams}g)` : ''}
                {autoBoxId === b.id ? ' ⭐ (Sugerida pelo App)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase font-bold block">
            Custo Embalagem (R$)
          </label>
          <input
            type="number"
            step="0.05"
            min="0"
            value={packagingCost}
            onChange={(e) => onChangePackagingCost(Math.max(0, Number(e.target.value)))}
            className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono font-bold outline-none focus:border-[#FFB800]"
          />
        </div>
      </div>

      {/* Composição Inteligente do Peso do Pacote para Mercado Envios */}
      <div className="p-3 bg-[#11141A] rounded-xl border border-[#2B303E] space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
          <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            Composição do Peso para Envio (Mercado Envios)
          </span>
          {isWeightCustomized && (
            <button
              type="button"
              onClick={onResetWeightToEstimated}
              className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Restaurar Peso Estimado ({estimatedTotalWeight}g)
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-[#1C1F24] p-2 rounded border border-[#2B303E]">
            <span className="text-[9px] text-slate-400 block uppercase">1. Peça 3D</span>
            <span className="text-white font-bold">{Math.round(pieceWeight)} g</span>
          </div>
          <div className="bg-[#1C1F24] p-2 rounded border border-[#2B303E]">
            <span className="text-[9px] text-slate-400 block uppercase">
              2. Caixa {hasBoxWeightRegistered ? '(Insumo)' : '(Estimado)'}
            </span>
            <span className="text-white font-bold">{estimatedBoxWeight} g</span>
          </div>
          <div className="bg-[#1C1F24] p-2 rounded border border-[#2B303E]">
            <span className="text-[9px] text-slate-400 block uppercase">3. Bolha + Fita</span>
            <span className="text-white font-bold">{protectionWeight} g</span>
          </div>
          <div className="bg-[#1C1F24] p-1.5 rounded border border-amber-500/40">
            <span className="text-[9px] text-amber-300 font-bold uppercase block mb-0.5">Total Embalado</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                value={packageWeight || ''}
                onChange={(e) => onChangePackageWeight(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[#14171E] border border-amber-500/40 rounded px-1.5 py-0.5 text-xs text-amber-300 font-bold font-mono outline-none"
              />
              <span className="text-[10px] text-slate-400">g</span>
            </div>
          </div>
        </div>
      </div>

      {boxes.length === 0 && (
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-lg text-[11px] text-amber-300">
          💡 Nenhuma caixa cadastrada em <strong>Insumos</strong> ainda. O app usará o custo digitado acima. Ao cadastrar caixas na aba Insumos (ex: &quot;Caixa 16x11x6&quot;), o app selecionará a caixa ideal automaticamente para cada produto!
        </div>
      )}

      {selectedBox && (
        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          Caixa selecionada: <strong className="text-white">{selectedBox.name}</strong> • Adicionará{' '}
          <strong className="text-emerald-400">R$ {packagingCost.toFixed(2)}</strong> ao custo total do produto.
        </p>
      )}
    </div>
  );
};
