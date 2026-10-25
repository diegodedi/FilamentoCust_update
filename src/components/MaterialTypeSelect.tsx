import React, { useState, useEffect } from 'react';
import { COMMON_3D_MATERIALS, DEFAULT_MATERIAL_TYPE } from '../data/materialTypes';
import { X } from 'lucide-react';

interface MaterialTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const MaterialTypeSelect: React.FC<MaterialTypeSelectProps> = ({
  value,
  onChange,
  label = 'Tipo de Material',
  required = false,
  className = ''
}) => {
  const isKnownMaterial = (val: string) => 
    COMMON_3D_MATERIALS.filter(m => m !== 'Outro').includes(val as any);

  const [isCustom, setIsCustom] = useState<boolean>(() => {
    return Boolean(value && !isKnownMaterial(value) && value !== 'Outro');
  });

  useEffect(() => {
    if (value && !isKnownMaterial(value) && value !== 'Outro') {
      setIsCustom(true);
    }
  }, [value]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === 'Outro') {
      setIsCustom(true);
      onChange('');
    } else {
      setIsCustom(false);
      onChange(selected);
    }
  };

  const handleCancelCustom = () => {
    setIsCustom(false);
    onChange(DEFAULT_MATERIAL_TYPE);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="font-label-md text-slate-400 text-xs uppercase block">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      {isCustom ? (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Digite o material (ex: PEEK, Nylon-CF)..."
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]"
            required={required}
            autoFocus
          />
          <button
            type="button"
            onClick={handleCancelCustom}
            title="Voltar para lista de materiais comuns"
            className="px-3 bg-[#2B2F36] hover:bg-[#3f444e] rounded-lg text-slate-300 text-sm font-bold transition-colors flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <select
          value={value || DEFAULT_MATERIAL_TYPE}
          onChange={handleSelectChange}
          className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]"
          required={required}
        >
          {COMMON_3D_MATERIALS.map(mat => (
            <option key={mat} value={mat}>
              {mat === 'Outro' ? '+ Outro material...' : mat}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
