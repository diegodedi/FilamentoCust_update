import React from 'react';
import { Plus } from 'lucide-react';

export interface PrinterItem {
  id: string;
  name: string;
}

interface ThermometerSidebarProps {
  hoursPerDay: number;
  setHoursPerDay: (val: number) => void;
  daysPerWeek: number;
  setDaysPerWeek: (val: number) => void;
  numPrinters: number;
  setNumPrinters: (val: number) => void;
  printers: PrinterItem[];
  setPrinters: (printers: PrinterItem[]) => void;
  formCategory: string;
  setFormCategory: (val: string) => void;
  formName: string;
  setFormName: (val: string) => void;
  formCost: number | '';
  setFormCost: (val: number | '') => void;
  formTimeStr: string;
  setFormTimeStr: (val: string) => void;
  formSellPrice: number | '';
  setFormSellPrice: (val: number | '') => void;
  formQty: number | '';
  setFormQty: (val: number | '') => void;
  formPrinter: string;
  setFormPrinter: (val: string) => void;
  onAddModel: (e: React.FormEvent) => void;
}

export const ThermometerSidebar: React.FC<ThermometerSidebarProps> = ({
  hoursPerDay,
  setHoursPerDay,
  daysPerWeek,
  setDaysPerWeek,
  numPrinters,
  setNumPrinters,
  printers,
  setPrinters,
  formCategory,
  setFormCategory,
  formName,
  setFormName,
  formCost,
  setFormCost,
  formTimeStr,
  setFormTimeStr,
  formSellPrice,
  setFormSellPrice,
  formQty,
  setFormQty,
  formPrinter,
  setFormPrinter,
  onAddModel
}) => {
  return (
    <div className="w-full lg:w-72 bg-[#11141A] border-b lg:border-b-0 lg:border-r border-[#222733] flex flex-col h-full overflow-y-auto">
      {/* Jornada de Trabalho */}
      <div className="p-5 border-b border-[#222733]">
        <h3 className="font-mono text-slate-400 text-xs uppercase mb-4 tracking-wider font-bold">
          Jornada de Trabalho
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">Horas por dia</span>
              <span className="text-[#FFB800] font-bold">{hoursPerDay}h</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="24" 
              value={hoursPerDay} 
              onChange={e => setHoursPerDay(Number(e.target.value))} 
              className="w-full h-1.5 bg-[#222733] rounded-lg appearance-none cursor-pointer accent-[#FFB800]" 
            />
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">Dias por semana</span>
              <span className="text-[#FFB800] font-bold">{daysPerWeek}d</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="7" 
              value={daysPerWeek} 
              onChange={e => setDaysPerWeek(Number(e.target.value))} 
              className="w-full h-1.5 bg-[#222733] rounded-lg appearance-none cursor-pointer accent-[#FFB800]" 
            />
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">Número de Impressoras</span>
              <span className="text-[#FFB800] font-bold">{numPrinters}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={numPrinters} 
              onChange={e => setNumPrinters(Number(e.target.value))} 
              className="w-full h-1.5 bg-[#222733] rounded-lg appearance-none cursor-pointer accent-[#FFB800]" 
            />
          </div>
        </div>
      </div>

      {/* Impressoras */}
      <div className="p-5 border-b border-[#222733]">
        <h3 className="font-mono text-slate-400 text-xs uppercase mb-4 tracking-wider font-bold">
          Impressoras
        </h3>
        <div className="space-y-2">
          {printers.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-2.5">
              <span className="text-[#FFB800] text-xs font-bold w-4">{idx + 1}</span>
              <input 
                type="text" 
                value={p.name}
                onChange={(e) => {
                  const np = [...printers];
                  np[idx].name = e.target.value;
                  setPrinters(np);
                }}
                className="bg-[#14171E] border border-[#2B303E] text-xs text-slate-200 px-3 py-1.5 rounded-xl w-full outline-none focus:border-[#FFB800]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Adicionar Modelo */}
      <div className="p-5">
        <h3 className="font-mono text-slate-400 text-xs uppercase mb-4 tracking-wider font-bold">
          Adicionar Modelo
        </h3>
        <form onSubmit={onAddModel} className="bg-[#14171E] p-4 rounded-xl border border-[#222733] space-y-3.5">
          <div>
            <label className="text-[10px] text-slate-400 uppercase block mb-1 font-bold">Categoria</label>
            <input 
              type="text" 
              value={formCategory} 
              onChange={e => setFormCategory(e.target.value)} 
              className="w-full bg-[#11141A] border border-[#2B303E] rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-[#FFB800]" 
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase block mb-1 font-bold">Nome do Modelo</label>
            <input 
              type="text" 
              placeholder="ex: Suporte Headset" 
              value={formName} 
              onChange={e => setFormName(e.target.value)} 
              className="w-full bg-[#11141A] border border-[#2B303E] rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-[#FFB800]" 
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1 font-bold">Custo (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                value={formCost} 
                onChange={e => setFormCost(e.target.value === '' ? '' : Number(e.target.value))} 
                className="w-full bg-[#11141A] border border-[#2B303E] rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-[#FFB800]" 
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1 font-bold">Tempo (HH:MM)</label>
              <input 
                type="text" 
                placeholder="01:30" 
                value={formTimeStr} 
                onChange={e => setFormTimeStr(e.target.value)} 
                className="w-full bg-[#11141A] border border-[#2B303E] rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-[#FFB800]" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1 font-bold">Venda (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                value={formSellPrice} 
                onChange={e => setFormSellPrice(e.target.value === '' ? '' : Number(e.target.value))} 
                className="w-full bg-[#11141A] border border-[#2B303E] rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-[#FFB800]" 
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1 font-bold">Qtd / Mesa</label>
              <input 
                type="number" 
                min="1" 
                value={formQty} 
                onChange={e => setFormQty(e.target.value === '' ? '' : Number(e.target.value))} 
                className="w-full bg-[#11141A] border border-[#2B303E] rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-[#FFB800]" 
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase block mb-1 font-bold">Impressora</label>
            <select 
              value={formPrinter} 
              onChange={e => setFormPrinter(e.target.value)} 
              className="w-full bg-[#11141A] border border-[#2B303E] rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-[#FFB800]"
            >
              {printers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-[#FFB800] hover:bg-[#e6a600] text-[#0F1115] text-xs font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 transition-all mt-2 cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Adicionar Modelo
          </button>
        </form>
      </div>
    </div>
  );
};
