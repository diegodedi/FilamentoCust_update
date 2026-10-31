import React from 'react';
import { Settings, SlidersHorizontal, Trash2 } from 'lucide-react';
import { PrinterItem } from './ThermometerSidebar';

export interface ThermometerModelWithStats {
  id: string;
  category: string;
  name: string;
  cost: number;
  timeHours: number;
  sellPrice: number;
  qtyPerTable: number;
  printerId: string;
  occupancyPercent: number;
  marginPercent: number;
  timeFormatted: string;
  lucroUn: number;
  maxUnMes: number;
  targetUnMes: number;
  lucroMensal: number;
  lucroHora: number;
}

interface ThermometerModelCardProps {
  model: ThermometerModelWithStats;
  printers: PrinterItem[];
  maxHoursPerPrinter: number;
  onUpdatePrinter: (modelId: string, printerId: string) => void;
  onUpdateOccupancy: (modelId: string, occupancy: number) => void;
  onDeleteModel: (modelId: string) => void;
}

export const ThermometerModelCard: React.FC<ThermometerModelCardProps> = ({
  model,
  printers,
  maxHoursPerPrinter,
  onUpdatePrinter,
  onUpdateOccupancy,
  onDeleteModel
}) => {
  const getProfitabilityBadge = (lucroHora: number) => {
    if (lucroHora >= 25) return { label: 'Top', color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' };
    if (lucroHora >= 15) return { label: 'Ótimo', color: 'bg-green-500/15 border-green-500/30 text-green-400' };
    if (lucroHora >= 8) return { label: 'Bom', color: 'bg-lime-500/15 border-lime-500/30 text-lime-400' };
    if (lucroHora >= 4) return { label: 'Regular', color: 'bg-amber-500/15 border-amber-500/30 text-amber-400' };
    if (lucroHora >= 2) return { label: 'Ruim', color: 'bg-orange-500/15 border-orange-500/30 text-orange-400' };
    return { label: 'Péssimo', color: 'bg-red-500/15 border-red-500/30 text-red-400' };
  };

  const badge = getProfitabilityBadge(model.lucroHora);
  const printerName = printers.find(p => p.id === model.printerId)?.name || 'Impressora';
  
  const thermoHeight = `${Math.min(100, Math.max(0, model.occupancyPercent))}%`;
  let thermoColor = 'bg-[#FFB800]';
  if (model.occupancyPercent > 80) thermoColor = 'bg-red-500';
  else if (model.occupancyPercent > 50) thermoColor = 'bg-amber-500';
  else if (model.occupancyPercent < 20) thermoColor = 'bg-sky-400';

  return (
    <div className="bg-[#14171E] border border-[#222733] rounded-2xl p-5 flex flex-col md:flex-row gap-6 relative shadow-sm hover:border-[#2B303E] transition-all">
      {/* Left Data Column */}
      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="text-base font-bold text-white">{model.name}</h4>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${badge.color}`}>
            {badge.label}
          </span>
          <div className="flex items-center gap-1.5 bg-[#1B1E26] border border-[#2B303E] px-2.5 py-1 rounded-xl text-xs text-slate-300">
            <Settings className="w-3.5 h-3.5 text-[#FFB800]" />
            <select 
              className="bg-transparent outline-none cursor-pointer text-slate-200 font-medium text-xs"
              value={model.printerId}
              onChange={(e) => onUpdatePrinter(model.id, e.target.value)}
            >
              {printers.map(p => <option key={p.id} value={p.id} className="bg-[#14171E]">{p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-left">
          <div>
            <span className="block text-[9px] font-mono text-slate-500 font-bold tracking-wider mb-0.5">CUSTO</span>
            <span className="text-xs font-mono font-medium text-slate-300">R$ {model.cost.toFixed(2)}</span>
          </div>
          <div>
            <span className="block text-[9px] font-mono text-slate-500 font-bold tracking-wider mb-0.5">VENDA</span>
            <span className="text-xs font-mono font-bold text-white">R$ {model.sellPrice.toFixed(2)}</span>
          </div>
          <div>
            <span className="block text-[9px] font-mono text-slate-500 font-bold tracking-wider mb-0.5">MARGEM</span>
            <span className="text-xs font-mono font-medium text-amber-300">{model.marginPercent.toFixed(1)}%</span>
          </div>
          <div>
            <span className="block text-[9px] font-mono text-slate-500 font-bold tracking-wider mb-0.5">IMPRESSÃO</span>
            <span className="text-xs font-mono font-medium text-slate-300">{model.timeFormatted}</span>
          </div>
          <div>
            <span className="block text-[9px] font-mono text-slate-500 font-bold tracking-wider mb-0.5">UN/MESA</span>
            <span className="text-xs font-mono font-medium text-slate-300">{model.qtyPerTable}</span>
          </div>
          <div>
            <span className="block text-[9px] font-mono text-slate-500 font-bold tracking-wider mb-0.5">LUCRO/UN</span>
            <span className="text-xs font-mono font-medium text-emerald-400">R$ {model.lucroUn.toFixed(2)}</span>
          </div>
          <div>
            <span className="block text-[9px] font-mono text-slate-500 font-bold tracking-wider mb-0.5">UN/MÊS</span>
            <span className="text-xs font-mono font-bold text-[#FFB800]">{model.targetUnMes}</span>
          </div>
        </div>

        {/* Occupancy Slider */}
        <div className="pt-2">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1.5 uppercase">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FFB800]" /> Ocupação - {printerName}
            </span>
            <span className="text-xs font-bold text-slate-200 ml-auto">{model.occupancyPercent}%</span>
            <span className="text-[10px] font-mono text-slate-400">
              {((maxHoursPerPrinter * model.occupancyPercent) / 100).toFixed(1)}h/mês
            </span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={model.occupancyPercent}
            onChange={(e) => onUpdateOccupancy(model.id, Number(e.target.value))}
            className="w-full h-1.5 bg-[#222733] rounded-lg appearance-none cursor-pointer accent-[#FFB800]"
          />
        </div>
      </div>

      {/* Right Thermometer & Profit Box */}
      <div className="flex items-center md:items-end justify-between md:justify-start gap-5 md:pl-6 md:border-l border-[#222733]">
        {/* Thermometer */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-3.5 h-20 bg-[#11141A] rounded-full border border-[#222733] relative overflow-hidden flex flex-col justify-end p-0.5">
            <div className={`w-full rounded-full transition-all duration-300 ${thermoColor}`} style={{ height: thermoHeight }} />
          </div>
          <span className="font-bold font-mono text-xs text-slate-300">{model.occupancyPercent}%</span>
        </div>

        {/* Profit Box */}
        <div className="bg-[#11141A] border border-[#222733] p-3 rounded-xl min-w-[120px] text-center shadow-sm">
          <span className="block text-[9px] font-mono text-slate-400 font-bold tracking-widest mb-1">LUCRO MENSAL</span>
          <span className="block text-lg font-mono font-black text-emerald-400">
            R$ {(model.lucroMensal >= 1000 ? (model.lucroMensal/1000).toFixed(1) + 'K' : model.lucroMensal.toFixed(2).replace('.', ','))}
          </span>
          <span className="block text-[9px] text-slate-500 mt-0.5">
            {model.targetUnMes} un × R$ {model.lucroUn.toFixed(2)}
          </span>
        </div>

        <button 
          onClick={() => onDeleteModel(model.id)}
          className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-[#1B1E26] transition-colors cursor-pointer"
          title="Excluir Modelo"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

