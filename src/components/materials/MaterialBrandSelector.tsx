import React from 'react';
import { filamentCatalog } from '../../data/filamentCatalog';

interface MaterialBrandSelectorProps {
  brand: string;
  name: string;
  color: string;
  colorHex: string;
  customBrand: string;
  customName: string;
  customColor: string;
  onBrandChange: (brand: string) => void;
  onNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
  onColorHexChange: (hex: string) => void;
  setCustomBrand: (val: string) => void;
  setCustomName: (val: string) => void;
  setCustomColor: (val: string) => void;
}

export const MaterialBrandSelector: React.FC<MaterialBrandSelectorProps> = ({
  brand,
  name,
  color,
  colorHex,
  customBrand,
  customName,
  customColor,
  onBrandChange,
  onNameChange,
  onColorChange,
  onColorHexChange,
  setCustomBrand,
  setCustomName,
  setCustomColor
}) => {
  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">Marca</label>
          <select 
            required
            value={brand}
            onChange={(e) => onBrandChange(e.target.value)}
            className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
          >
            <option value="" disabled>Selecione a Marca</option>
            {filamentCatalog.map(b => <option key={b.brand} value={b.brand}>{b.brand}</option>)}
            <option value="Outro">Outro...</option>
          </select>
          {brand === 'Outro' && (
            <input 
              type="text" 
              required
              placeholder="Nome da marca"
              value={customBrand}
              onChange={(e) => setCustomBrand(e.target.value)}
              className="w-full px-3 py-2 mt-1.5 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
            />
          )}
        </div>
        
        <div className="space-y-1">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">Material</label>
          {filamentCatalog.some(b => b.brand === brand) ? (
            <select
              required
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
            >
              {filamentCatalog.find(b => b.brand === brand)?.materials.map(m => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
              <option value="Outro">Outro...</option>
            </select>
          ) : (
            <input 
              type="text" 
              required
              placeholder="Ex: PLA Premium"
              value={brand === 'Outro' ? customName : name}
              onChange={(e) => brand === 'Outro' ? setCustomName(e.target.value) : onNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
            />
          )}
          {name === 'Outro' && filamentCatalog.some(b => b.brand === brand) && (
            <input 
              type="text" 
              required
              placeholder="Digite o nome"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3 py-2 mt-1.5 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">Cor</label>
          {filamentCatalog.some(b => b.brand === brand) && filamentCatalog.find(b => b.brand === brand)?.materials.some(m => m.name === name) ? (
            <select
              required
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
            >
              {filamentCatalog.find(b => b.brand === brand)?.materials.find(m => m.name === name)?.colors.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
              <option value="Outro">Outro...</option>
            </select>
          ) : (
            <input 
              type="text" 
              required
              placeholder="Ex: Preto Matte"
              value={brand === 'Outro' || name === 'Outro' ? customColor : color}
              onChange={(e) => brand === 'Outro' || name === 'Outro' ? setCustomColor(e.target.value) : onColorChange(e.target.value)}
              className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
            />
          )}
          {color === 'Outro' && filamentCatalog.some(b => b.brand === brand) && (
            <input 
              type="text" 
              required
              placeholder="Digite a cor"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-full px-3 py-2 mt-1.5 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
            />
          )}
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">Cor Hex</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              value={colorHex}
              onChange={(e) => onColorHexChange(e.target.value)}
              className="w-10 h-9 p-0.5 border border-[#2B303E] rounded-xl bg-[#11141A] cursor-pointer"
            />
            <input 
              type="text" 
              value={colorHex}
              onChange={(e) => onColorHexChange(e.target.value)}
              className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs font-mono bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

