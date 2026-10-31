import React from 'react';
import { X, Plus } from 'lucide-react';
import { ProductFilament, Material } from '../../types';

interface SingleProductMaterialSelectorProps {
  colorMode: 'MONO' | 'MULTI';
  onChangeColorMode: (val: 'MONO' | 'MULTI') => void;
  monoMaterialId: string;
  onChangeMonoMaterialId: (val: string) => void;
  monoWeight: number;
  onChangeMonoWeight: (val: number) => void;
  multiFilaments: ProductFilament[];
  onChangeMultiFilaments: (val: ProductFilament[]) => void;
  materials: Material[];
  totalWeight: number;
  filamentCost: number;
}

/**
 * Seletor de filamentos (Mono ou Multicolor) com peso e custos parciais.
 */
export const SingleProductMaterialSelector: React.FC<SingleProductMaterialSelectorProps> = ({
  colorMode,
  onChangeColorMode,
  monoMaterialId,
  onChangeMonoMaterialId,
  monoWeight,
  onChangeMonoWeight,
  multiFilaments,
  onChangeMultiFilaments,
  materials,
  totalWeight,
  filamentCost
}) => {
  return (
    <div className="p-5 bg-[#121418] border border-[#2B2F36] rounded-xl space-y-5">
      <div className="flex gap-4 items-center mb-2">
        <label className="font-label-md text-slate-200 text-sm font-bold uppercase">Material</label>
        <select
          value={colorMode}
          onChange={(e) => onChangeColorMode(e.target.value as 'MONO' | 'MULTI')}
          className="bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#0084FF]"
        >
          <option value="MONO">Mono Cor</option>
          <option value="MULTI">Multicolor</option>
        </select>
      </div>

      {colorMode === 'MONO' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-slate-400 uppercase">Filamento</label>
            <select
              required
              value={monoMaterialId || ''}
              onChange={(e) => onChangeMonoMaterialId(e.target.value)}
              className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0084FF]"
            >
              <option value="" disabled>Selecione um filamento</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>{m.brand} - {m.name} ({m.color})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400 uppercase">Peso Usado (G)</label>
            <input
              type="number"
              min="1"
              required
              value={monoWeight}
              onChange={(e) => onChangeMonoWeight(Number(e.target.value.replace(',', '.')))}
              className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0084FF]"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {multiFilaments.map((f, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-xs text-slate-400 uppercase">Cor {index + 1}</label>
                <select
                  required
                  value={f.materialId}
                  onChange={(e) => {
                    const newFils = [...multiFilaments];
                    newFils[index].materialId = e.target.value;
                    onChangeMultiFilaments(newFils);
                  }}
                  className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0084FF]"
                >
                  <option value="" disabled>Selecione um filamento</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.brand} - {m.name} ({m.color})</option>
                  ))}
                </select>
              </div>
              <div className="w-32 space-y-2">
                <label className="text-xs text-slate-400 uppercase">Peso (G)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={f.weight}
                  onChange={(e) => {
                    const newFils = [...multiFilaments];
                    newFils[index].weight = Number(e.target.value.replace(',', '.'));
                    onChangeMultiFilaments(newFils);
                  }}
                  className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0084FF]"
                />
              </div>
              {multiFilaments.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newFils = [...multiFilaments];
                    newFils.splice(index, 1);
                    onChangeMultiFilaments(newFils);
                  }}
                  className="mb-1 p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChangeMultiFilaments([...multiFilaments, { materialId: materials[0]?.id || '', weight: 10 }])}
            className="text-xs font-bold text-[#0084FF] hover:text-[#1d4ed8] flex items-center gap-1 mt-2"
          >
            <Plus className="w-3 h-3" /> ADICIONAR COR
          </button>
        </div>
      )}

      <div className="pt-4 border-t border-[#2B2F36] flex justify-between items-center text-sm">
        <span className="text-slate-400">Peso Total: <strong className="text-white">{totalWeight}g</strong></span>
        <span className="text-slate-400">Custo Material: <strong className="text-white">R$ {filamentCost.toFixed(2)}</strong></span>
      </div>
    </div>
  );
};
