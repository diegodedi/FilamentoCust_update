import React, { useRef } from 'react';
import { X, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { ProductPart, Material } from '../../types';
import { MaterialTypeSelect } from '../MaterialTypeSelect';

interface MultipartPartsEditorProps {
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
  image: string;
  setImage: (val: string) => void;
  defaultImages: string[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  parts: ProductPart[];
  onAddPart: () => void;
  onRemovePart: (id: string) => void;
  onUpdatePart: (id: string, updates: Partial<ProductPart>) => void;
  materials: Material[];
  renderTime: number;
  renderWeight: number;
  productionCost: number;
}

/**
 * Seção de dados básicos, upload de imagem e editor de partes do Produto Multipartes.
 */
export const MultipartPartsEditor: React.FC<MultipartPartsEditorProps> = ({
  name, setName, dimensions, setDimensions, category, setCategory,
  isCustomCategory, setIsCustomCategory, allCategories, defaultCategories,
  materialType, setMaterialType, accessoryCost, onChangeAccessoryCost,
  image, setImage, defaultImages, onImageUpload,
  parts, onAddPart, onRemovePart, onUpdatePart, materials,
  renderTime, renderWeight, productionCost
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Produto Completo *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#141518] border border-[#2B2F36] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0084FF]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1 flex justify-between items-center">
              <span>Dimensões do Produto</span>
              <span className="text-xs text-slate-500 font-normal lowercase">ex: 20 x 15 x 12 cm</span>
            </label>
            <input
              type="text"
              placeholder="Ex: 20 x 15 x 12 cm (A x L x P)"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              className="w-full bg-[#141518] border border-[#2B2F36] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0084FF]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Categoria *</label>
              {isCustomCategory ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite a nova categoria..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#141518] border border-[#2B2F36] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0084FF]"
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
                  className="w-full bg-[#141518] border border-[#2B2F36] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0084FF]"
                >
                  {allCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="NEW">+ Nova Categoria...</option>
                </select>
              )}
            </div>
            <MaterialTypeSelect value={materialType} onChange={setMaterialType} required />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Custo de Acessórios (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={accessoryCost}
                onChange={(e) => onChangeAccessoryCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#141518] border border-[#2B2F36] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0084FF]"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Imagem do Produto</label>
          <div className="flex gap-4 items-start">
            <div className="w-32 h-32 rounded-lg bg-[#141518] border border-[#2B2F36] overflow-hidden shrink-0">
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs">Sem foto</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <input type="file" ref={fileInputRef} onChange={onImageUpload} accept="image/*" className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-[#2B2F36] hover:bg-[#3f444e] text-white py-2 rounded-lg transition-colors text-sm"
              >
                <Upload className="w-4 h-4" /> Enviar Foto
              </button>
              <div className="text-xs text-slate-400">
                <p>Ou selecione uma padrão:</p>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {defaultImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImage(img)}
                      className={`aspect-square rounded overflow-hidden border ${image === img ? 'border-[#0084FF]' : 'border-transparent'}`}
                    >
                      <img src={img} alt="Default" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2B2F36] pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-headline-sm text-white">Partes do Produto</h3>
          <button
            type="button"
            onClick={onAddPart}
            className="text-sm bg-[#2B2F36] hover:bg-[#3f444e] text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Adicionar Parte
          </button>
        </div>

        <div className="space-y-4">
          {parts.map((part, index) => (
            <div key={part.id} className="bg-[#141518] p-4 rounded-lg border border-[#2B2F36] space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-white text-sm">Parte {index + 1}</h4>
                {parts.length > 1 && (
                  <button type="button" onClick={() => onRemovePart(part.id)} className="text-red-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Nome da Parte (Igual ao G-Code)</label>
                  <input
                    type="text"
                    required
                    value={part.name}
                    onChange={(e) => onUpdatePart(part.id, { name: e.target.value })}
                    className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-3 py-1.5 text-white text-sm focus:border-[#0084FF] outline-none"
                    placeholder="Ex: base_v1.gcode"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Qtd p/ Produto</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={part.quantity}
                    onChange={(e) => onUpdatePart(part.id, { quantity: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-3 py-1.5 text-white text-sm focus:border-[#0084FF] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tempo de Impressão</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      value={Math.floor(part.printTime)}
                      onChange={(e) => onUpdatePart(part.id, { printTime: parseInt(e.target.value || '0') + (part.printTime % 1) })}
                      className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-2 py-1.5 text-white text-sm outline-none"
                    />
                    <span className="text-slate-400 text-xs">h</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={Math.round((part.printTime % 1) * 60)}
                      onChange={(e) => onUpdatePart(part.id, { printTime: Math.floor(part.printTime) + parseInt(e.target.value || '0') / 60 })}
                      className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-2 py-1.5 text-white text-sm outline-none"
                    />
                    <span className="text-slate-400 text-xs">m</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Filamento Principal</label>
                  <select
                    value={part.materialId}
                    onChange={(e) => onUpdatePart(part.id, { materialId: e.target.value })}
                    className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-3 py-1.5 text-white text-sm focus:border-[#0084FF] outline-none"
                  >
                    <option value="">Selecione um filamento...</option>
                    {materials.map((m) => <option key={m.id} value={m.id}>{m.name} - {m.color}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Peso Gasto (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={part.weight}
                    onChange={(e) => onUpdatePart(part.id, { weight: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-3 py-1.5 text-white text-sm focus:border-[#0084FF] outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-between items-center text-xs border-t border-[#2B2F36] pt-3 text-slate-400 mt-4">
          <span>Tempo Total: <strong className="text-white">{Math.floor(renderTime)}h {Math.round((renderTime % 1) * 60)}m</strong></span>
          <span>Peso Total: <strong className="text-white">{renderWeight}g</strong></span>
          <span>Custo das Partes: <strong className="text-white">R$ {productionCost.toFixed(2)}</strong></span>
        </div>
      </div>
    </div>
  );
};
