import React, { useState, useEffect } from 'react';
import { useDb } from '../context/DbContext';
import { Sparkles, Scale, Clock, Zap, Percent, ShieldCheck, HelpCircle, AlertTriangle, User, MonitorSpeaker, Settings2, Plus, X } from 'lucide-react';

export const Costs: React.FC = () => {
  const { materials, costConfig, addProduct } = useDb();

  // Local calculation states
  const [calcName, setCalcName] = useState('Novo Modelo 3D');
  const [selectedFilaments, setSelectedFilaments] = useState<{id: string, weight: number, time: number}[]>([
    { id: materials[0]?.id || 'mat-01', weight: 150, time: 6.0 }
  ]);
  const [extraCosts, setExtraCosts] = useState(0.0); // R$ (e.g. screws, magnets, packaging)
  const [profitMargin, setProfitMargin] = useState(costConfig.defaultProfitMargin); // %

  // Advanced Variables (Inspired by "Quanto Rende uma Impressora 3D" ROI)
  const [failureMargin, setFailureMargin] = useState(10); // % de falhas esperadas
  const [prepTime, setPrepTime] = useState(0.5); // tempo preparando (horas)
  const [operatorWage, setOperatorWage] = useState(15.0); // R$/hora do operador
  
  // Machine Depreciation Variables
  const [machineValue, setMachineValue] = useState(2500); // R$
  const [machineLifespan, setMachineLifespan] = useState(4000); // Horas de vida útil estimadas
  const [machineMaintenance, setMachineMaintenance] = useState(2.0); // R$/hora manutenção

  // Local overrides of global parameters
  const [localKwhPrice, setLocalKwhPrice] = useState(costConfig.kwhPrice);
  const [localConsumption, setLocalConsumption] = useState(costConfig.energyConsumption);
  const [localTaxes, setLocalTaxes] = useState(costConfig.taxesPercent);

  // Synchronize local states with global state when it loads
  useEffect(() => {
    setLocalKwhPrice(costConfig.kwhPrice);
    setLocalConsumption(costConfig.energyConsumption);
    setLocalTaxes(costConfig.taxesPercent);
  }, [costConfig]);

  // Selected materials & weight & time
  const weight = selectedFilaments.reduce((acc, f) => acc + f.weight, 0);
  const time = selectedFilaments.reduce((acc, f) => acc + (f.time || 0), 0);

  // Calculo de Custos Avançados Detalhados
  const rawMaterialCost = selectedFilaments.reduce((acc, f) => {
    const mat = materials.find(m => m.id === f.id);
    const costPerGram = mat ? mat.costPerGram : 0.15;
    return acc + (f.weight * costPerGram);
  }, 0);
  
  // Failure margin increases material cost expectations (if you fail 10%, you effectively spend 10% more material over time per successful part)
  const materialTotalCost = rawMaterialCost * (1 + (failureMargin / 100));
  
  // Energy Cost
  const energyTotalCost = time * localConsumption * localKwhPrice;
  
  // Labor (Preparation / Slicing / Post-processing)
  const laborTotalCost = prepTime * operatorWage;

  // Machine Depreciation & Maintenance (Depreciation per hour + maintenance per hour)
  const depreciationPerHour = machineLifespan > 0 ? machineValue / machineLifespan : 0;
  const machineTotalCost = time * (depreciationPerHour + machineMaintenance);

  const costSum = materialTotalCost + energyTotalCost + laborTotalCost + machineTotalCost + extraCosts;
  
  // Preço de venda sugerido (incluindo margem de lucro e impostos)
  const marginTaxesRatio = (profitMargin + localTaxes) / 100;
  const suggestedPrice = marginTaxesRatio < 1 ? costSum / (1 - marginTaxesRatio) : costSum * (1 + marginTaxesRatio);
  
  const estimatedProfit = suggestedPrice - costSum;

  const handleCreateProduct = () => {
    if (!calcName.trim()) {
      alert('Por favor, informe um nome para o produto antes de salvar.');
      return;
    }
    
    const isMulti = selectedFilaments.length > 1;

    addProduct({
      name: calcName,
      category: 'Prototipagem',
      weight,
      printTime: time,
      materialId: selectedFilaments[0]?.id || '',
      colorMode: isMulti ? 'MULTI' : 'MONO',
      filaments: selectedFilaments.map(f => ({ materialId: f.id, weight: f.weight })),
      costPrice: parseFloat(costSum.toFixed(2)),
      sellPrice: parseFloat(suggestedPrice.toFixed(2)),
      profit: parseFloat(estimatedProfit.toFixed(2))
    });

    alert(`Produto "${calcName}" criado com sucesso e adicionado ao Catálogo!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline-md text-white mb-1">Calculo de Custos</h2>
        <p className="text-slate-400 font-body-md">Descubra quanto realmente rende sua impressora 3D com cálculos profissionais de depreciação, falhas e mão de obra.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Parâmetros de Entrada (Painel Esquerdo) */}
        <div className="lg:col-span-7 bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-6 shadow-sm space-y-8">
          
          {/* Seção 1: Básico */}
          <div className="space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-[#2B2F36]">
              <h3 className="font-headline-sm text-white text-sm flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-slate-400" /> Parâmetros da Peça
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-xs uppercase">Nome do Protótipo</label>
                <input 
                  type="text"
                  value={calcName}
                  onChange={(e) => setCalcName(e.target.value)}
                  className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF] font-medium"
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
                      className="flex-1 min-w-0 truncate px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#1C1F24] outline-none"
                    >
                      {materials.map(m => (
                        <option key={m.id} value={m.id}>{m.name} {m.color} {m.brand} - R$ {m.costPerGram.toFixed(2)}/g</option>
                      ))}
                    </select>
                    
                    <div className="flex gap-2 w-[160px] flex-shrink-0">
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
                          className="w-full pl-2 pr-5 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#1C1F24] outline-none focus:border-[#0084FF]"
                          title="Peso (g)"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none uppercase">g</span>
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
                          className="w-full pl-2 pr-5 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#1C1F24] outline-none focus:border-[#0084FF]"
                          title="Tempo (h)"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none uppercase">h</span>
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
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
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
                  className="text-xs text-[#0084FF] hover:text-[#0084FF]/80 flex items-center gap-1 mt-1 font-bold w-fit"
                >
                  <Plus className="w-3 h-3" /> ADICIONAR COR
                </button>
              </div>
            </div>

            {/* Sliders Básico */}
            <div className="space-y-2">
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs items-center p-3 bg-[#121418] border border-[#2B2F36] rounded-lg">
                  <span className="font-bold text-slate-400 flex items-center gap-1">
                    <Scale className="w-4 h-4" /> Peso Total Projetado
                  </span>
                  <span className="font-mono font-bold text-[#0084FF] text-sm">{weight}g</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs items-center p-3 bg-[#121418] border border-[#2B2F36] rounded-lg">
                  <span className="font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Tempo Total Projetado
                  </span>
                  <span className="font-mono font-bold text-[#0084FF] text-sm">{time.toFixed(1)}h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Avançado (Falhas e Operador) */}
          <div className="space-y-5 pt-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#2B2F36]">
              <h3 className="font-headline-sm text-white text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> Falhas & Mão de Obra
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-xs uppercase flex items-center gap-1">
                  Taxa Falha <AlertTriangle className="w-3 h-3 text-amber-500" />
                </label>
                <div className="relative">
                  <input type="number" min="0" max="100" value={failureMargin} onChange={(e) => setFailureMargin(parseInt(e.target.value) || 0)} className="w-full px-3 py-1.5 border border-[#2B2F36] rounded text-sm bg-amber-50/30 outline-none pr-6 font-mono" />
                  <span className="absolute right-3 top-1.5 text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-[10px] uppercase">Tempo Setup (h)</label>
                <input type="number" step="0.1" value={prepTime} onChange={(e) => setPrepTime(parseFloat(e.target.value) || 0)} className="w-full px-3 py-1.5 border border-[#2B2F36] rounded text-sm outline-none font-mono" />
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-[10px] uppercase">Valor Hora Operador (R$)</label>
                <input type="number" step="1" value={operatorWage} onChange={(e) => setOperatorWage(parseFloat(e.target.value) || 0)} className="w-full px-3 py-1.5 border border-[#2B2F36] rounded text-sm outline-none font-mono" />
              </div>
            </div>
          </div>

          {/* Seção 3: Depreciação da Máquina */}
          <div className="space-y-5 pt-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#2B2F36]">
              <h3 className="font-headline-sm text-white text-sm flex items-center gap-2">
                <MonitorSpeaker className="w-4 h-4 text-slate-400" /> Depreciação & Máquina
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-[10px] uppercase">Valor Máquina (R$)</label>
                <input type="number" step="100" value={machineValue} onChange={(e) => setMachineValue(parseFloat(e.target.value) || 0)} className="w-full px-3 py-1.5 border border-[#2B2F36] rounded text-sm outline-none font-mono" />
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-[10px] uppercase">Vida Útil (Horas)</label>
                <input type="number" step="100" value={machineLifespan} onChange={(e) => setMachineLifespan(parseFloat(e.target.value) || 0)} className="w-full px-3 py-1.5 border border-[#2B2F36] rounded text-sm outline-none font-mono" />
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-[10px] uppercase">Manutenção/h (R$)</label>
                <input type="number" step="0.5" value={machineMaintenance} onChange={(e) => setMachineMaintenance(parseFloat(e.target.value) || 0)} className="w-full px-3 py-1.5 border border-[#2B2F36] rounded text-sm outline-none font-mono" />
              </div>
            </div>
          </div>

          {/* Seção 4: Margem e Impostos */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2B2F36]">
            <div className="space-y-1">
              <label className="font-label-md text-slate-400 text-xs uppercase">Margem de Lucro (%)</label>
              <input type="number" min="1" value={profitMargin} onChange={(e) => setProfitMargin(parseInt(e.target.value) || 0)} className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none font-mono font-bold" />
            </div>
            <div className="space-y-1">
              <label className="font-label-md text-slate-400 text-xs uppercase flex items-center gap-1">Extras (R$) <HelpCircle className="w-3 h-3 text-slate-300" /></label>
              <input type="number" min="0" step="1" value={extraCosts} onChange={(e) => setExtraCosts(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm outline-none font-mono" />
            </div>
          </div>

        </div>

        {/* Viabilidade e Margem de Preço (Painel Direito) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card de Resultado */}
          <div className="bg-[#121418] text-white rounded-xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[380px]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#0084FF]/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Sparkles className="w-4 h-4 text-[#0084FF]" />
                <span className="font-label-md text-[10px] uppercase tracking-wider">Resultado da Precificação</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Preço Sugerido de Venda</span>
                <h3 className="text-4xl font-extrabold text-white font-mono leading-none">
                  R$ {suggestedPrice.toFixed(2)}
                </h3>
              </div>

              {/* Detalhamento de Custos */}
              <div className="space-y-2 text-xs pt-4 border-t border-slate-700/60">
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1">Filamento (c/ Falha {failureMargin}%)</span>
                  <span className="font-mono font-medium text-slate-200">R$ {materialTotalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1">Depreciação & Manutenção</span>
                  <span className="font-mono font-medium text-slate-200">R$ {machineTotalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1">Mão de Obra (Setup)</span>
                  <span className="font-mono font-medium text-slate-200">R$ {laborTotalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1">Energia Estimada</span>
                  <span className="font-mono font-medium text-slate-200">R$ {energyTotalCost.toFixed(2)}</span>
                </div>
                {extraCosts > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Acessórios / Extras</span>
                    <span className="font-mono font-medium text-slate-200">R$ {extraCosts.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-[#22C55E] pt-3 border-t border-slate-700/40">
                  <span>Custo Real da Peça</span>
                  <span className="font-mono">R$ {costSum.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Dashboard Box de Lucro Líquido Real */}
            <div className="relative z-10 bg-slate-850 p-4 rounded-lg border border-slate-700/50 mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-label-md">Lucro Líquido Projetado</p>
                <p className="text-xl font-mono font-extrabold text-[#22C55E]">R$ {estimatedProfit.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-[#22C55E]/20 border border-[#22C55E]/40 rounded text-[11px] font-mono font-bold text-[#22C55E]">
                  {profitMargin}% margem
                </span>
              </div>
            </div>
          </div>

          {/* Button de Ação Direta para Salvar no Catálogo */}
          <div className="bg-[#1C1F24] rounded-xl border border-[#2B2F36] p-6 shadow-sm space-y-4">
            <h4 className="font-headline-sm text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-[#0084FF]" /> Gravar Viabilidade
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deseja salvar esse estudo profissional? Ao clicar, a precificação avançada será cadastrada no Catálogo.
            </p>
            <button 
              onClick={handleCreateProduct}
              className="w-full py-2.5 bg-[#0084FF] hover:bg-[#1D4ED8] text-white font-bold rounded-lg text-sm transition-colors shadow-sm"
            >
              Adicionar ao Catálogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
