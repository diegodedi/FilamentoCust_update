import React, { useState, useEffect } from 'react';
import { useDb } from '../context/DbContext';
import { CostsParameters } from './costs/CostsParameters';
import { CostsSummary } from './costs/CostsSummary';

export const Costs: React.FC = () => {
  const { materials, costConfig, addProduct } = useDb();

  // Local calculation states
  const [calcName, setCalcName] = useState('Novo Modelo 3D');
  const [selectedFilaments, setSelectedFilaments] = useState<{id: string, weight: number, time: number}[]>([
    { id: materials[0]?.id || 'mat-01', weight: 150, time: 6.0 }
  ]);
  const [extraCosts, setExtraCosts] = useState(0.0);
  const [profitMargin, setProfitMargin] = useState(costConfig.defaultProfitMargin);

  // Advanced Variables
  const [failureMargin, setFailureMargin] = useState(10);
  const [prepTime, setPrepTime] = useState(0.5);
  const [operatorWage, setOperatorWage] = useState(15.0);
  
  // Machine Depreciation Variables
  const [machineValue, setMachineValue] = useState(2500);
  const [machineLifespan, setMachineLifespan] = useState(4000);
  const [machineMaintenance, setMachineMaintenance] = useState(2.0);

  // Local overrides of global parameters
  const [localKwhPrice, setLocalKwhPrice] = useState(costConfig.kwhPrice);
  const [localConsumption, setLocalConsumption] = useState(costConfig.energyConsumption);
  const [localTaxes, setLocalTaxes] = useState(costConfig.taxesPercent);

  useEffect(() => {
    setLocalKwhPrice(costConfig.kwhPrice);
    setLocalConsumption(costConfig.energyConsumption);
    setLocalTaxes(costConfig.taxesPercent);
  }, [costConfig]);

  const weight = selectedFilaments.reduce((acc, f) => acc + f.weight, 0);
  const time = selectedFilaments.reduce((acc, f) => acc + (f.time || 0), 0);

  const rawMaterialCost = selectedFilaments.reduce((acc, f) => {
    const mat = materials.find(m => m.id === f.id);
    const costPerGram = mat ? mat.costPerGram : 0.15;
    return acc + (f.weight * costPerGram);
  }, 0);
  
  const materialTotalCost = rawMaterialCost * (1 + (failureMargin / 100));
  const energyTotalCost = time * localConsumption * localKwhPrice;
  const laborTotalCost = prepTime * operatorWage;
  const depreciationPerHour = machineLifespan > 0 ? machineValue / machineLifespan : 0;
  const machineTotalCost = time * (depreciationPerHour + machineMaintenance);

  const costSum = materialTotalCost + energyTotalCost + laborTotalCost + machineTotalCost + extraCosts;
  
  const marginTaxesRatio = (profitMargin + localTaxes) / 100;
  const suggestedPrice = marginTaxesRatio < 1 ? costSum / (1 - marginTaxesRatio) : costSum * (1 + marginTaxesRatio);
  const estimatedProfit = suggestedPrice - costSum;

  const handleCreateProduct = () => {
    if (!calcName.trim()) {
      alert('Por favor, informe um nome para o produto antes de salvar.');
      return;
    }
    
    const isMulti = selectedFilaments.length > 1;
    const selectedMat = materials.find(m => m.id === selectedFilaments[0]?.id);

    addProduct({
      name: calcName,
      category: 'Prototipagem',
      materialType: selectedMat?.type || 'PLA',
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
      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] shadow-sm">
        <h2 className="font-headline-md text-white mb-1">Cálculo Profissional de Custos</h2>
        <p className="text-slate-400 font-body-md text-xs sm:text-sm">
          Descubra quanto realmente rende sua impressora 3D com cálculos técnicos de depreciação, falhas e mão de obra.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Parâmetros de Entrada (Painel Esquerdo) */}
        <div className="lg:col-span-7 xl:col-span-7">
          <CostsParameters
            calcName={calcName}
            setCalcName={setCalcName}
            selectedFilaments={selectedFilaments}
            setSelectedFilaments={setSelectedFilaments}
            materials={materials}
            weight={weight}
            time={time}
            failureMargin={failureMargin}
            setFailureMargin={setFailureMargin}
            prepTime={prepTime}
            setPrepTime={setPrepTime}
            operatorWage={operatorWage}
            setOperatorWage={setOperatorWage}
            machineValue={machineValue}
            setMachineValue={setMachineValue}
            machineLifespan={machineLifespan}
            setMachineLifespan={setMachineLifespan}
            machineMaintenance={machineMaintenance}
            setMachineMaintenance={setMachineMaintenance}
            profitMargin={profitMargin}
            setProfitMargin={setProfitMargin}
            extraCosts={extraCosts}
            setExtraCosts={setExtraCosts}
          />
        </div>

        {/* Viabilidade e Margem de Preço (Painel Direito) */}
        <div className="lg:col-span-5 xl:col-span-5">
          <CostsSummary
            suggestedPrice={suggestedPrice}
            failureMargin={failureMargin}
            materialTotalCost={materialTotalCost}
            machineTotalCost={machineTotalCost}
            laborTotalCost={laborTotalCost}
            energyTotalCost={energyTotalCost}
            extraCosts={extraCosts}
            costSum={costSum}
            estimatedProfit={estimatedProfit}
            profitMargin={profitMargin}
            handleCreateProduct={handleCreateProduct}
          />
        </div>
      </div>
    </div>
  );
};
