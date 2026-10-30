import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface CostsSummaryProps {
  suggestedPrice: number;
  failureMargin: number;
  materialTotalCost: number;
  machineTotalCost: number;
  laborTotalCost: number;
  energyTotalCost: number;
  extraCosts: number;
  costSum: number;
  estimatedProfit: number;
  profitMargin: number;
  handleCreateProduct: () => void;
}

export const CostsSummary: React.FC<CostsSummaryProps> = ({
  suggestedPrice,
  failureMargin,
  materialTotalCost,
  machineTotalCost,
  laborTotalCost,
  energyTotalCost,
  extraCosts,
  costSum,
  estimatedProfit,
  profitMargin,
  handleCreateProduct
}) => {
  return (
    <div className="space-y-5">
      {/* Card de Resultado */}
      <div className="bg-[#1A1D25] text-white rounded-2xl p-6 sm:p-7 border border-[#2B303E] shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[380px]">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#FFB800]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-4 h-4 text-[#FFB800]" />
            <span className="font-label-md text-[10px] uppercase tracking-wider text-[#FFB800]">
              Resultado da Precificação
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">Preço Sugerido de Venda</span>
            <h3 className="text-4xl sm:text-5xl font-black text-white font-mono leading-none tracking-tight">
              R$ {suggestedPrice.toFixed(2)}
            </h3>
          </div>

          {/* Detalhamento de Custos */}
          <div className="space-y-2 text-xs pt-4 border-t border-[#2B303E]">
            <div className="flex justify-between">
              <span className="text-slate-400">Filamento (c/ Falha {failureMargin}%)</span>
              <span className="font-mono font-medium text-slate-200">R$ {materialTotalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Depreciação & Manutenção</span>
              <span className="font-mono font-medium text-slate-200">R$ {machineTotalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mão de Obra (Setup)</span>
              <span className="font-mono font-medium text-slate-200">R$ {laborTotalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Energia Estimada</span>
              <span className="font-mono font-medium text-slate-200">R$ {energyTotalCost.toFixed(2)}</span>
            </div>
            {extraCosts > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Acessórios / Extras</span>
                <span className="font-mono font-medium text-slate-200">R$ {extraCosts.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-[#FFB800] pt-3 border-t border-[#2B303E]">
              <span>Custo Real da Peça</span>
              <span className="font-mono">R$ {costSum.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Box de Lucro Líquido Real */}
        <div className="relative z-10 bg-[#11141A] p-4 rounded-xl border border-[#2B303E] mt-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-label-md">Lucro Líquido Projetado</p>
            <p className="text-2xl font-mono font-extrabold text-[#10B981]">R$ {estimatedProfit.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-[#10B981]/15 border border-[#10B981]/30 rounded-full text-xs font-mono font-bold text-[#10B981]">
              {profitMargin}% margem
            </span>
          </div>
        </div>
      </div>

      {/* Button de Ação Direta para Salvar no Catálogo */}
      <div className="bg-[#1A1D25] rounded-2xl border border-[#2B303E] p-6 shadow-sm space-y-4">
        <h4 className="font-headline-sm text-sm text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#FFB800]" /> Gravar Viabilidade
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Deseja salvar esse estudo profissional? Ao clicar, a precificação avançada será cadastrada no Catálogo.
        </p>
        <button 
          onClick={handleCreateProduct}
          className="w-full py-3 bg-[#FFB800] hover:bg-[#FFA500] text-[#0F1115] font-black rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          Adicionar ao Catálogo
        </button>
      </div>
    </div>
  );
};

