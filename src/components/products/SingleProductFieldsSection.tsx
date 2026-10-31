import React, { useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { ProductFilament, Material } from '../../types';
import { MaterialTypeSelect } from '../MaterialTypeSelect';
import { SingleProductMaterialSelector } from './SingleProductMaterialSelector';

interface SingleProductFieldsSectionProps {
  name: string;
  setName: (val: string) => void;
  dimensions: string;
  setDimensions: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  isCustomCategory: boolean;
  setIsCustomCategory: (val: boolean) => void;
  allCategories: string[];
  defaultCategories: string[];
  materialType: string;
  setMaterialType: (val: string) => void;
  accessoryCost: number;
  onChangeAccessoryCost: (val: number) => void;
  unitsPerPrint: number;
  onChangeUnitsPerPrint: (val: number) => void;
  printHours: number;
  onChangePrintHours: (val: number) => void;
  printMinutes: number;
  onChangePrintMinutes: (val: number) => void;
  image: string;
  setImage: (val: string) => void;
  defaultImages: string[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
 * Campos de Imagem, Dados Básicos e Seleção de Filamentos para Produto Único.
 */
export const SingleProductFieldsSection: React.FC<SingleProductFieldsSectionProps> = ({
  name, setName, dimensions, setDimensions, category, setCategory,
  isCustomCategory, setIsCustomCategory, allCategories, defaultCategories,
  materialType, setMaterialType, accessoryCost, onChangeAccessoryCost,
  unitsPerPrint, onChangeUnitsPerPrint, printHours, onChangePrintHours,
  printMinutes, onChangePrintMinutes, image, setImage, defaultImages, onImageUpload,
  colorMode, onChangeColorMode, monoMaterialId, onChangeMonoMaterialId,
  monoWeight, onChangeMonoWeight, multiFilaments, onChangeMultiFilaments,
  materials, totalWeight, filamentCost
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-bold text-slate-200 uppercase mb-4">Imagem do Produto</h3>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-48 h-48 bg-[#2B2F36] rounded-xl border-2 border-dashed border-[#2B2F36] flex items-center justify-center overflow-hidden relative group">
            {image ? (
              <>
                <img src={image} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Trocar
                  </button>
                </div>
              </>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-slate-400 flex flex-col items-center gap-2 hover:text-[#0084FF] transition-colors">
                <Upload className="w-6 h-6" />
                <span className="text-xs font-medium">Fazer Upload</span>
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={onImageUpload} accept="image/*" className="hidden" />
          </div>
          <div className="flex-1 space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase">Ou escolha uma imagem padrão</label>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {defaultImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImage(img)}
                  className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${image === img ? 'border-[#2563EB] shadow-md scale-105' : 'border-transparent hover:border-[#3A3F47]'}`}
                >
                  <img src={img} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={`Preset ${i + 1}`} />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Dica: Adicione uma foto real da peça impressa para deixar seu catálogo mais profissional.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2B2F36]" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2 lg:col-span-2">
          <label className="font-label-md text-slate-400 text-xs uppercase block">Nome *</label>
          <input
            type="text"
            placeholder="ex: Suporte Headset Gamer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF]"
            required
          />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <label className="font-label-md text-slate-400 text-xs uppercase block flex justify-between items-center">
            <span>Dimensões do Produto</span>
            <span className="text-[10px] text-slate-500 font-normal lowercase">ex: 15 x 10 x 8 cm</span>
          </label>
          <input
            type="text"
            placeholder="Ex: 15 x 10 x 8 cm (A x L x P)"
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF]"
          />
        </div>

        <div className="space-y-2">
          <label className="font-label-md text-slate-400 text-xs uppercase block">Categoria</label>
          {isCustomCategory ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Digite a nova categoria..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF]"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => { setIsCustomCategory(false); setCategory(defaultCategories[0]); }}
                className="px-3 bg-[#2B2F36] hover:bg-[#3f444e] rounded-lg text-slate-300 text-sm font-bold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <select
              value={category}
              onChange={(e) => {
                if (e.target.value === 'NEW') { setIsCustomCategory(true); setCategory(''); }
                else setCategory(e.target.value);
              }}
              className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF]"
            >
              {allCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              <option value="NEW">+ Nova Categoria...</option>
            </select>
          )}
        </div>

        <MaterialTypeSelect value={materialType} onChange={setMaterialType} />

        <div className="space-y-2">
          <label className="font-label-md text-slate-400 text-xs uppercase block">Acessório (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={accessoryCost}
            onChange={(e) => onChangeAccessoryCost(Number(e.target.value))}
            className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF]"
          />
        </div>

        <div className="space-y-2 lg:col-span-1">
          <label className="font-label-md text-slate-400 text-xs uppercase block">Unidades por Impressão</label>
          <input
            type="number"
            min="1"
            step="1"
            value={unitsPerPrint}
            onChange={(e) => onChangeUnitsPerPrint(Number(e.target.value))}
            className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF]"
          />
        </div>

        <div className="space-y-2 lg:col-span-1">
          <label className="font-label-md text-slate-400 text-xs uppercase block">Tempo de Impressão</label>
          <div className="flex gap-2">
            <div className="relative w-full">
              <input
                type="number"
                min="0"
                value={printHours}
                onChange={(e) => onChangePrintHours(Number(e.target.value.replace(',', '.')))}
                className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 pr-8 text-sm text-slate-200 outline-none focus:border-[#0084FF]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">H</span>
            </div>
            <div className="relative w-full">
              <input
                type="number"
                min="0"
                max="59"
                value={printMinutes}
                onChange={(e) => onChangePrintMinutes(Number(e.target.value.replace(',', '.')))}
                className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 pr-8 text-sm text-slate-200 outline-none focus:border-[#0084FF]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">M</span>
            </div>
          </div>
        </div>
      </div>

      <SingleProductMaterialSelector
        colorMode={colorMode}
        onChangeColorMode={onChangeColorMode}
        monoMaterialId={monoMaterialId}
        onChangeMonoMaterialId={onChangeMonoMaterialId}
        monoWeight={monoWeight}
        onChangeMonoWeight={onChangeMonoWeight}
        multiFilaments={multiFilaments}
        onChangeMultiFilaments={onChangeMultiFilaments}
        materials={materials}
        totalWeight={totalWeight}
        filamentCost={filamentCost}
      />
    </div>
  );
};
