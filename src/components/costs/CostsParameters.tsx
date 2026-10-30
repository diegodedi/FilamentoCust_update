import React from 'react';
import { Settings2, Scale, Clock, User, AlertTriangle, MonitorSpeaker, HelpCircle, Plus, X } from 'lucide-react';
import { Material } from '../../types';

interface FilamentSelection {
  id: string;
  weight: number;
  time: number;
}

interface CostsParametersProps {
  calcName: string;
  setCalcName: (name: string) => void;
  selectedFilaments: FilamentSelection[];
  setSelectedFilaments: (f: FilamentSelection[]) => void;
  materials: Material[];
  weight: number;
  time: number;
  failureMargin: number;
  setFailureMargin: (n: number) => void;
  prepTime: number;
  setPrepTime: (n: number) => void;
  operatorWage: number;
  setOperatorWage: (n: number) => void;
  machineValue: number;
  setMachineValue: (n: number) => void;
  machineLifespan: number;
  setMachineLifespan: (n: number) => void;
  machineMaintenance: number;
  setMachineMaintenance: (n: number) => void;
  profitMargin: number;
  setProfitMargin: (n: number) => void;
  extraCosts: number;
  setExtraCosts: (n: number) => void;
}

export const CostsParameters: React.FC<CostsParametersProps> = ({
  calcName,
  setCalcName,
  selectedFilaments,
  setSelectedFilaments,
  materials,
  weight,
  time,
  failureMargin,
  setFailureMargin,
  prepTime,
  setPrepTime,
  operatorWage,
  setOperatorWage,
  machineValue,
  setMachineValue,
  machineLifespan,
  setMachineLifespan,
  machineMaintenance,
  setMachineMaintenance,
  profitMargin,
  setProfitMargin,
  extraCosts,
  setExtraCosts
}) => {
  return (
    <div className="bg-[#1A1D25] border border-[#2B303E] rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Seção 1: Básico */}
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-[#2B303E]">
          <h3 className="font-headline-sm text-white text-sm flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[#FFB800]" /> Parâmetros da Peça
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-label-md text-slate-400 text-xs uppercase">Nome do Protótipo</label>
            <input 
              type="text"
              value={calcName}
              onChange={(e) => setCalcName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#2B303E] rounded-xl text-sm bg-[#11141A] text-white outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] font-medium"
            />
          </div>
          <div className="space-y-2 flex flex-col">
            <label className="font-label-md text-slate-400 text-xs uppercase">Filamentos (Cores)</label>
            {selectedFilaments.map((filament, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select 
                  value={filament.id}
                  onChange={(e) => {
                    const newFils = [...selectedFilaments];
                    newFils[index].id = e.target.value;
                    setSelectedFilaments(newFils);
                  }}
                  className="flex-1 min-w-0 truncate px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name} {m.color} {m.brand} - R$ {m.costPerGram.toFixed(2)}/g</option>
                  ))}
                </select>
                
                <div className="flex gap-1.5 w-[150px] shrink-0">
                  <div className="relative flex-1">
                    <input 
                      type="number"
                      min="1"
                      value={filament.weight}
                      onChange={(e) => {
                        const newFils = [...selectedFilaments];
                        newFils[index].weight = parseFloat(e.target.value) || 0;
                        setSelectedFilaments(newFils);
                      }}
                      className="w-full pl-2 pr-4 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
                      title="Peso (g)"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold uppercase">g</span>
                  </div>
                  <div className="relative flex-1">
                    <input 
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={filament.time}
                      onChange={(e) => {
                        const newFils = [...selectedFilaments];
                        newFils[index].time = parseFloat(e.target.value) || 0;
                        setSelectedFilaments(newFils);
                      }}
                      className="w-full pl-2 pr-4 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] text-slate-200 outline-none focus:border-[#FFB800]"
                      title="Tempo (h)"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold uppercase">h</span>
                  </div>
                </div>

                {selectedFilaments.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => {
                      const newFils = [...selectedFilaments];
                      newFils.splice(index, 1);
                      setSelectedFilaments(newFils);
                    }}
                    className="p-1.5 text-[#FF5E3A] hover:bg-[#FF5E3A]/10 rounded-lg transition-colors shrink-0"
                    title="Remover cor"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => setSelectedFilaments([...selectedFilaments, { id: materials[0]?.id || 'mat-01', weight: 50, time: 2.0 }])}
              className="text-xs text-[#FFB800] hover:text-[#FFA000] flex items-center gap-1 mt-1 font-bold w-fit cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> ADICIONAR COR
            </button>
          </div>
        </div>

        {/* Totais de Peso e Tempo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="flex justify-between text-xs items-center p-3 bg-[#11141A] border border-[#2B303E] rounded-xl">
            <span className="font-bold text-slate-400 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#FFB800]" /> Peso Total
            </span>
            <span className="font-mono font-bold text-white text-sm">{weight}g</span>
          </div>

          <div className="flex justify-between text-xs items-center p-3 bg-[#11141A] border border-[#2B303E] rounded-xl">
            <span className="font-bold text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#FFB800]" /> Tempo Total
            </span>
            <span className="font-mono font-bold text-white text-sm">{time.toFixed(1)}h</span>
          </div>
        </div>
      </div>

      {/* Seção 2: Falhas e Mão de Obra */}
      <div className="space-y-4 pt-3 border-t border-[#2B303E]">
        <div className="flex justify-between items-center pb-1">
          <h3 className="font-headline-sm text-white text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-[#FFB800]" /> Falhas & Mão de Obra
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="font-label-md text-slate-400 text-xs uppercase flex items-center gap-1">
              Taxa Falha <AlertTriangle className="w-3 h-3 text-[#FFB800]" />
            </label>
            <div className="relative">
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={failureMargin} 
                onChange={(e) => setFailureMargin(parseInt(e.target.value) || 0)} 
                className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-sm bg-[#11141A] text-slate-200 outline-none pr-6 font-mono focus:border-[#FFB800]" 
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">%</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-label-md text-slate-400 text-[10px] uppercase">Tempo Setup (h)</label>
            <input 
              type="number" 
              step="0.1" 
              value={prepTime} 
              onChange={(e) => setPrepTime(parseFloat(e.target.value) || 0)} 
              className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-sm bg-[#11141A] text-slate-200 outline-none font-mono focus:border-[#FFB800]" 
            />
          </div>
          <div className="space-y-1">
            <label className="font-label-md text-slate-400 text-[10px] uppercase">Hora Operador (R$)</label>
            <input 
              type="number" 
              step="1" 
              value={operatorWage} 
              onChange={(e) => setOperatorWage(parseFloat(e.target.value) || 0)} 
              className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-sm bg-[#11141A] text-slate-200 outline-none font-mono focus:border-[#FFB800]" 
            />
          </div>
        </div>
      </div>

      {/* Seção 3: Depreciação da Máquina */}
      <div className="space-y-4 pt-3 border-t border-[#2B303E]">
        <div className="flex justify-between items-center pb-1">
          <h3 className="font-headline-sm text-white text-sm flex items-center gap-2">
            <MonitorSpeaker className="w-4 h-4 text-[#FFB800]" /> Depreciação & Máquina
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="font-label-md text-slate-400 text-[10px] uppercase">Valor Máquina (R$)</label>
            <input 
              type="number" 
              step="100" 
              value={machineValue} 
              onChange={(e) => setMachineValue(parseFloat(e.target.value) || 0)} 
              className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-sm bg-[#11141A] text-slate-200 outline-none font-mono focus:border-[#FFB800]" 
            />
          </div>
          <div className="space-y-1">
            <label className="font-label-md text-slate-400 text-[10px] uppercase">Vida Útil (Horas)</label>
            <input 
              type="number" 
              step="100" 
              value={machineLifespan} 
              onChange={(e) => setMachineLifespan(parseFloat(e.target.value) || 0)} 
              className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-sm bg-[#11141A] text-slate-200 outline-none font-mono focus:border-[#FFB800]" 
            />
          </div>
          <div className="space-y-1">
            <label className="font-label-md text-slate-400 text-[10px] uppercase">Manutenção/h (R$)</label>
            <input 
              type="number" 
              step="0.5" 
              value={machineMaintenance} 
              onChange={(e) => setMachineMaintenance(parseFloat(e.target.value) || 0)} 
              className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-sm bg-[#11141A] text-slate-200 outline-none font-mono focus:border-[#FFB800]" 
            />
          </div>
        </div>
      </div>

      {/* Seção 4: Margem e Impostos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#2B303E]">
        <div className="space-y-1">
          <label className="font-label-md text-slate-400 text-xs uppercase">Margem de Lucro (%)</label>
          <input 
            type="number" 
            min="1" 
            value={profitMargin} 
            onChange={(e) => setProfitMargin(parseInt(e.target.value) || 0)} 
            className="w-full px-3.5 py-2.5 border border-[#2B303E] rounded-xl text-sm bg-[#11141A] text-[#FFB800] outline-none font-mono font-bold focus:border-[#FFB800]" 
          />
        </div>
        <div className="space-y-1">
          <label className="font-label-md text-slate-400 text-xs uppercase flex items-center gap-1">
            Extras (R$) <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          </label>
          <input 
            type="number" 
            min="0" 
            step="1" 
            value={extraCosts} 
            onChange={(e) => setExtraCosts(Math.max(0, parseFloat(e.target.value) || 0))} 
            className="w-full px-3.5 py-2.5 border border-[#2B303E] rounded-xl text-sm bg-[#11141A] text-slate-200 outline-none font-mono focus:border-[#FFB800]" 
          />
        </div>
      </div>
    </div>
  );
};

