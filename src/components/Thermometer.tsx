import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash } from 'lucide-react';
import { ThermometerSidebar, PrinterItem } from './thermometer/ThermometerSidebar';
import { ThermometerBottomMetrics } from './thermometer/ThermometerBottomMetrics';
import { ThermometerModelCard, ThermometerModelWithStats } from './thermometer/ThermometerModelCard';

interface ThermometerModel {
  id: string;
  category: string;
  name: string;
  cost: number;
  timeHours: number;
  sellPrice: number;
  qtyPerTable: number;
  printerId: string;
  occupancyPercent: number;
}

export const Thermometer: React.FC = () => {
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [daysPerWeek, setDaysPerWeek] = useState(7);
  const [numPrinters, setNumPrinters] = useState(1);
  const [printers, setPrinters] = useState<PrinterItem[]>([{ id: 'p1', name: 'Impressora Principal 1' }]);
  const [targetIncome, setTargetIncome] = useState(4000);

  const [models, setModels] = useState<ThermometerModel[]>([
    {
      id: 'm1',
      category: 'Articulados',
      name: 'Triceratops Articulado',
      cost: 1.21,
      timeHours: 1,
      sellPrice: 10.00,
      qtyPerTable: 1,
      printerId: 'p1',
      occupancyPercent: 67
    },
    {
      id: 'm2',
      category: 'Articulados',
      name: 'Dragão Flexível',
      cost: 1.21,
      timeHours: 1,
      sellPrice: 5.00,
      qtyPerTable: 1,
      printerId: 'p1',
      occupancyPercent: 33
    }
  ]);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('@filamento/thermometer');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.hoursPerDay) setHoursPerDay(data.hoursPerDay);
        if (data.daysPerWeek) setDaysPerWeek(data.daysPerWeek);
        if (data.numPrinters) setNumPrinters(data.numPrinters);
        if (data.printers) setPrinters(data.printers);
        if (data.targetIncome) setTargetIncome(data.targetIncome);
        if (data.models) setModels(data.models);
      } catch {
        // safely handled
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('@filamento/thermometer', JSON.stringify({
      hoursPerDay,
      daysPerWeek,
      numPrinters,
      printers,
      targetIncome,
      models
    }));
  }, [isLoaded, hoursPerDay, daysPerWeek, numPrinters, printers, targetIncome, models]);

  // Form states
  const [formCategory, setFormCategory] = useState('Articulados');
  const [formName, setFormName] = useState('');
  const [formCost, setFormCost] = useState<number | ''>(0);
  const [formTimeStr, setFormTimeStr] = useState('01:30');
  const [formSellPrice, setFormSellPrice] = useState<number | ''>(0);
  const [formQty, setFormQty] = useState<number | ''>(1);
  const [formPrinter, setFormPrinter] = useState('p1');

  useEffect(() => {
    if (printers.length > 0 && !printers.find(p => p.id === formPrinter)) {
      setFormPrinter(printers[0].id);
    }
  }, [printers, formPrinter]);

  useEffect(() => {
    if (numPrinters > printers.length) {
      const newPrinters = [...printers];
      for (let i = printers.length + 1; i <= numPrinters; i++) {
        newPrinters.push({ id: `p${i}`, name: `Impressora ${i}` });
      }
      setPrinters(newPrinters);
    } else if (numPrinters < printers.length) {
      setPrinters(printers.slice(0, numPrinters));
    }
  }, [numPrinters]);

  const maxHoursPerPrinter = Math.round(hoursPerDay * daysPerWeek * 4.333);
  const categories = Array.from(new Set(models.map(m => m.category)));
  const [activeTab, setActiveTab] = useState(categories[0] || 'Articulados');

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeTab)) {
      setActiveTab(categories[0]);
    }
  }, [categories, activeTab]);

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let timeStr = formTimeStr.replace(',', '.');
    if (!timeStr.includes(':')) {
      const num = Number(timeStr);
      if (!isNaN(num)) {
        const h = Math.floor(num);
        const m = Math.round((num - h) * 60);
        timeStr = `${h}:${m}`;
      } else {
        timeStr = '0:00';
      }
    }

    const [hh, mm] = timeStr.split(':').map(Number);
    const timeHours = (hh || 0) + ((mm || 0) / 60);

    const newModel: ThermometerModel = {
      id: `m${Date.now()}`,
      category: formCategory,
      name: formName.trim(),
      cost: Number(formCost) || 0,
      timeHours,
      sellPrice: Number(formSellPrice) || 0,
      qtyPerTable: Number(formQty) || 1,
      printerId: formPrinter,
      occupancyPercent: 10
    };

    setModels([...models, newModel]);
    setActiveTab(formCategory);
    setFormName('');
    setFormTimeStr('01:30');
  };

  let totalMonthlyProfit = 0;
  const modelsWithStats: ThermometerModelWithStats[] = models.map(m => {
    const marginPercent = ((m.sellPrice - m.cost) / (m.sellPrice || 1)) * 100;
    const timeFormatted = `${Math.floor(m.timeHours).toString().padStart(2, '0')}:${Math.round((m.timeHours % 1) * 60).toString().padStart(2, '0')}`;
    const lucroUn = m.sellPrice - m.cost;
    const maxUnMes = Math.floor(maxHoursPerPrinter / (m.timeHours || 1)) * m.qtyPerTable;
    const targetUnMes = Math.floor(maxUnMes * (m.occupancyPercent / 100));
    const lucroMensal = targetUnMes * lucroUn;
    const lucroHora = lucroUn / ((m.timeHours / m.qtyPerTable) || 1);
    
    totalMonthlyProfit += lucroMensal;

    return {
      ...m,
      marginPercent,
      timeFormatted,
      lucroUn,
      maxUnMes,
      targetUnMes,
      lucroMensal,
      lucroHora
    };
  });

  const percentOfTarget = targetIncome > 0 ? (totalMonthlyProfit / targetIncome) * 100 : 0;
  const printersNeeded = Math.ceil(targetIncome / ((totalMonthlyProfit / numPrinters) || 1));

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-140px)] bg-[#14171E] rounded-2xl overflow-hidden shadow-sm border border-[#222733] font-sans text-slate-200">
      <ThermometerSidebar
        hoursPerDay={hoursPerDay}
        setHoursPerDay={setHoursPerDay}
        daysPerWeek={daysPerWeek}
        setDaysPerWeek={setDaysPerWeek}
        numPrinters={numPrinters}
        setNumPrinters={setNumPrinters}
        printers={printers}
        setPrinters={setPrinters}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        formName={formName}
        setFormName={setFormName}
        formCost={formCost}
        setFormCost={setFormCost}
        formTimeStr={formTimeStr}
        setFormTimeStr={setFormTimeStr}
        formSellPrice={formSellPrice}
        setFormSellPrice={setFormSellPrice}
        formQty={formQty}
        setFormQty={setFormQty}
        formPrinter={formPrinter}
        setFormPrinter={setFormPrinter}
        onAddModel={handleAddModel}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative bg-[#0F1115]">
        {/* Top category tabs */}
        <div className="flex items-center justify-between px-6 pt-4 border-b border-[#222733] bg-[#14171E]">
          <div className="flex gap-6 overflow-x-auto scrollbar-none">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveTab(cat)}
                className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === cat 
                    ? 'text-[#FFB800] border-[#FFB800]' 
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                {cat} 
                <span className="bg-[#1B1E26] text-amber-300 text-[10px] px-1.5 py-0.5 rounded ml-2 border border-[#2B303E]">
                  {models.filter(m => m.category === cat).length}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pb-3">
            <button 
              onClick={() => alert('Configurações do termômetro salvas com sucesso!')}
              className="bg-[#1B1E26] border border-[#2B303E] hover:bg-[#252A36] text-slate-300 text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#FFB800]" /> Gravar
            </button>
            <button 
              onClick={() => setModels([])} 
              className="bg-[#1B1E26] border border-[#2B303E] hover:bg-red-950/40 text-slate-400 hover:text-red-400 text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash className="w-3.5 h-3.5" /> Limpar
            </button>
          </div>
        </div>

        {/* Models List */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0F1115] space-y-4">
          {modelsWithStats.filter(m => m.category === activeTab).map((m) => (
            <ThermometerModelCard
              key={m.id}
              model={m}
              printers={printers}
              maxHoursPerPrinter={maxHoursPerPrinter}
              onUpdatePrinter={(id, pid) => {
                setModels(models.map(mod => mod.id === id ? { ...mod, printerId: pid } : mod));
              }}
              onUpdateOccupancy={(id, occ) => {
                setModels(models.map(mod => mod.id === id ? { ...mod, occupancyPercent: occ } : mod));
              }}
              onDeleteModel={(id) => {
                setModels(models.filter(mod => mod.id !== id));
              }}
            />
          ))}

          {models.filter(m => m.category === activeTab).length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              Nenhum modelo cadastrado nesta categoria. Utilize o formulário ao lado para adicionar.
            </div>
          )}
        </div>

        {/* Bottom Totals */}
        <ThermometerBottomMetrics
          totalMonthlyProfit={totalMonthlyProfit}
          targetIncome={targetIncome}
          setTargetIncome={setTargetIncome}
          percentOfTarget={percentOfTarget}
          numPrinters={numPrinters}
          printersNeeded={printersNeeded}
        />
      </div>
    </div>
  );
};
