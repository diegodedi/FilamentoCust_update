import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Plus, Edit, Trash2, SlidersHorizontal, AlertTriangle, Save, FolderOpen, Trash } from 'lucide-react';

interface ThermometerModel {
  id: string;
  category: string;
  name: string;
  cost: number;
  timeHours: number; // in hours
  sellPrice: number;
  qtyPerTable: number;
  printerId: string;
  occupancyPercent: number; // 0 to 100
}

export const Thermometer: React.FC = () => {
  // Global settings
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [daysPerWeek, setDaysPerWeek] = useState(7);
  const [numPrinters, setNumPrinters] = useState(1);
  const [printers, setPrinters] = useState([{ id: 'p1', name: 'Cibele Impressora 1' }]);
  const [targetIncome, setTargetIncome] = useState(4000);

  // Models list
  const [models, setModels] = useState<ThermometerModel[]>([
    {
      id: 'm1',
      category: 'Articulados',
      name: 'Triceratops b2ca',
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
      name: 'Triceratops',
      cost: 1.21,
      timeHours: 1,
      sellPrice: 5.00,
      qtyPerTable: 1,
      printerId: 'p1',
      occupancyPercent: 33
    }
  ]);

  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
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
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when state changes
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

  // Update printers when numPrinters changes
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

  const maxHoursPerPrinter = Math.round(hoursPerDay * daysPerWeek * 4.333); // approx month
  const totalPrinterHoursAvailable = maxHoursPerPrinter * numPrinters;

  const getProfitabilityBadge = (lucroHora: number) => {
    if (lucroHora >= 25) return { label: 'Top', color: 'bg-emerald-100 border-emerald-200 text-emerald-700' };
    if (lucroHora >= 15) return { label: 'Ótimo', color: 'bg-green-100 border-green-200 text-green-700' };
    if (lucroHora >= 8) return { label: 'Bom', color: 'bg-lime-100 border-lime-200 text-lime-700' };
    if (lucroHora >= 4) return { label: 'Regular', color: 'bg-yellow-100 border-yellow-200 text-yellow-700' };
    if (lucroHora >= 2) return { label: 'Ruim', color: 'bg-orange-100 border-orange-200 text-orange-700' };
    return { label: 'Péssimo', color: 'bg-red-100 border-red-200 text-red-700' };
  };

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    // parse HH:MM
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
      name: formName,
      cost: Number(formCost) || 0,
      timeHours,
      sellPrice: Number(formSellPrice) || 0,
      qtyPerTable: Number(formQty) || 1,
      printerId: formPrinter,
      occupancyPercent: 10 // default 10%
    };

    setModels([...models, newModel]);
    setActiveTab(formCategory);
    
    // Reset basic form
    setFormName('');
    setFormTimeStr('01:30');
  };

  // Group by category
  const categories = Array.from(new Set(models.map(m => m.category)));
  const [activeTab, setActiveTab] = useState(categories[0] || 'Articulados');

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeTab)) {
      setActiveTab(categories[0]);
    }
  }, [categories, activeTab]);

  // Compute stats
  let totalMonthlyProfit = 0;
  
  const modelsWithStats = models.map(m => {
    const marginPercent = ((m.sellPrice - m.cost) / m.sellPrice) * 100;
    const timeFormatted = `${Math.floor(m.timeHours).toString().padStart(2, '0')}:${Math.round((m.timeHours % 1) * 60).toString().padStart(2, '0')}`;
    const lucroUn = m.sellPrice - m.cost;
    const maxUnMes = Math.floor(maxHoursPerPrinter / m.timeHours) * m.qtyPerTable;
    
    const targetUnMes = Math.floor(maxUnMes * (m.occupancyPercent / 100));
    const lucroMensal = targetUnMes * lucroUn;
    const lucroHora = lucroUn / (m.timeHours / m.qtyPerTable);
    
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

  const percentOfTarget = (totalMonthlyProfit / targetIncome) * 100;
  const printersNeeded = Math.ceil(targetIncome / (totalMonthlyProfit / numPrinters || 1));

  return (
    <div className="flex h-[calc(100vh-120px)] bg-[#1C1F24] rounded-xl overflow-hidden shadow-sm border border-[#2B2F36] font-sans text-slate-200">
      {/* LEFT SIDEBAR */}
      <div className="w-72 bg-[#121418] border-r border-[#2B2F36] flex flex-col h-full overflow-y-auto">
        
        {/* JORNADA DE TRABALHO */}
        <div className="p-5 border-b border-[#2B2F36]">
          <h3 className="font-label-md text-slate-400 text-xs uppercase mb-4 tracking-wider">Jornada de Trabalho</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400 font-medium">Horas por dia</span>
                <span className="text-[#0084FF] font-bold">{hoursPerDay}h</span>
              </div>
              <input type="range" min="1" max="24" value={hoursPerDay} onChange={e => setHoursPerDay(Number(e.target.value))} className="w-full h-1.5 bg-[#3A3F47] rounded-lg appearance-none cursor-pointer accent-[#0084FF]" />
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400 font-medium">Dias por semana</span>
                <span className="text-[#0084FF] font-bold">{daysPerWeek}d</span>
              </div>
              <input type="range" min="1" max="7" value={daysPerWeek} onChange={e => setDaysPerWeek(Number(e.target.value))} className="w-full h-1.5 bg-[#3A3F47] rounded-lg appearance-none cursor-pointer accent-[#0084FF]" />
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400 font-medium">Número de Impressoras</span>
                <span className="text-[#0084FF] font-bold">{numPrinters}</span>
              </div>
              <input type="range" min="1" max="10" value={numPrinters} onChange={e => setNumPrinters(Number(e.target.value))} className="w-full h-1.5 bg-[#3A3F47] rounded-lg appearance-none cursor-pointer accent-[#0084FF]" />
            </div>
          </div>
        </div>

        {/* IMPRESSORAS */}
        <div className="p-5 border-b border-[#2B2F36]">
          <h3 className="font-label-md text-slate-400 text-xs uppercase mb-4 tracking-wider">Impressoras</h3>
          <div className="space-y-2">
            {printers.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-[#0084FF] text-xs font-bold w-4">{idx + 1}</span>
                <input 
                  type="text" 
                  value={p.name}
                  onChange={(e) => {
                    const np = [...printers];
                    np[idx].name = e.target.value;
                    setPrinters(np);
                  }}
                  className="bg-[#1C1F24] border border-[#2B2F36] text-sm text-slate-200 px-3 py-1.5 rounded w-full outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ADICIONAR MODELO */}
        <div className="p-5">
          <h3 className="font-label-md text-slate-400 text-xs uppercase mb-4 tracking-wider">Adicionar Modelo</h3>
          <form onSubmit={handleAddModel} className="bg-[#1C1F24] p-4 rounded-xl border border-[#2B2F36] shadow-sm space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1 font-bold">Categoria</label>
              <input type="text" value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full bg-[#121418] border border-[#2B2F36] rounded p-2 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1 font-bold">Nome do Modelo</label>
              <input type="text" placeholder="ex: Capivara Porta-Retrato" value={formName} onChange={e => setFormName(e.target.value)} className="w-full bg-[#121418] border border-[#2B2F36] rounded p-2 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1 font-bold">Custo (R$)</label>
                <input type="number" step="0.01" value={formCost} onChange={e => setFormCost(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-[#121418] border border-[#2B2F36] rounded p-2 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1 font-bold">Tempo (HH:MM)</label>
                <input type="text" placeholder="01:30" value={formTimeStr} onChange={e => setFormTimeStr(e.target.value)} className="w-full bg-[#121418] border border-[#2B2F36] rounded p-2 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1 font-bold">Venda (R$)</label>
                <input type="number" step="0.01" value={formSellPrice} onChange={e => setFormSellPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-[#121418] border border-[#2B2F36] rounded p-2 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1 font-bold">Qtd / Mesa</label>
                <input type="number" min="1" value={formQty} onChange={e => setFormQty(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-[#121418] border border-[#2B2F36] rounded p-2 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1 font-bold">Impressora</label>
              <select value={formPrinter} onChange={e => setFormPrinter(e.target.value)} className="w-full bg-[#121418] border border-[#2B2F36] rounded p-2 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]">
                {printers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <button type="submit" className="w-full bg-[#0084FF] hover:bg-[#0084FF]/90 text-white text-xs font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-colors mt-2 shadow-sm">
              <Plus className="w-4 h-4" /> ADICIONAR MODELO
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT MAIN AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-[#1C1F24]">
        {/* Top bar with tabs */}
        <div className="flex items-center justify-between px-6 pt-4 border-b border-[#2B2F36]">
          <div className="flex gap-6 overflow-x-auto">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveTab(cat)}
                className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === cat 
                    ? 'text-[#0084FF] border-[#2563EB]' 
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                {cat} <span className="bg-[#2B2F36] text-slate-300 px-1.5 py-0.5 rounded ml-2">{models.filter(m => m.category === cat).length}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pb-3">
            <button className="bg-[#1C1F24] border border-[#2B2F36] hover:bg-[#121418] text-slate-300 text-[10px] uppercase px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
              <Save className="w-3.5 h-3.5" /> Gravar
            </button>
            <button className="bg-[#1C1F24] border border-[#2B2F36] hover:bg-[#121418] text-slate-300 text-[10px] uppercase px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
              <FolderOpen className="w-3.5 h-3.5" /> Abrir
            </button>
            <button onClick={() => setModels([])} className="bg-[#1C1F24] border border-[#2B2F36] hover:bg-red-50 text-slate-300 hover:text-red-600 text-[10px] uppercase px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
              <Trash className="w-3.5 h-3.5" /> Apagar Tudo
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 py-4 flex gap-3 overflow-x-auto border-b border-[#2B2F36] bg-[#121418]">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Top</div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-200 text-green-700 text-xs font-bold"><span className="w-2 h-2 rounded-full bg-green-500"></span> Ótimo</div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-lime-100 border border-lime-200 text-lime-700 text-xs font-bold"><span className="w-2 h-2 rounded-full bg-lime-500"></span> Bom</div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-700 text-xs font-bold"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Regular</div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Ruim</div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 border border-red-200 text-red-700 text-xs font-bold"><span className="w-2 h-2 rounded-full bg-red-500"></span> Péssimo</div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#121418]">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-black tracking-tight uppercase text-white">{activeTab}</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">{models.filter(m => m.category === activeTab).length} modelos</span>
          </div>

          <div className="space-y-4">
            {modelsWithStats.filter(m => m.category === activeTab).map((m, i) => {
              const badge = getProfitabilityBadge(m.lucroHora);
              const printerName = printers.find(p => p.id === m.printerId)?.name || 'Impressora';
              
              // Calculate thermometer height (0 to 100%)
              const thermoHeight = `${Math.min(100, Math.max(0, m.occupancyPercent))}%`;
              let thermoColor = 'bg-yellow-400';
              if (m.occupancyPercent > 80) thermoColor = 'bg-red-500';
              else if (m.occupancyPercent > 50) thermoColor = 'bg-orange-400';
              else if (m.occupancyPercent < 20) thermoColor = 'bg-blue-400';

              return (
                <div key={m.id} className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-5 flex gap-6 relative shadow-sm hover:shadow-md transition-shadow">
                  {/* Left Side (Data) */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-bold text-white">{m.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <div className="flex items-center gap-1.5 bg-[#2B2F36] border border-[#2B2F36] px-2 py-1 rounded text-xs text-slate-300">
                        <Settings className="w-3.5 h-3.5" />
                        <select 
                          className="bg-transparent outline-none cursor-pointer text-slate-200 font-medium"
                          value={m.printerId}
                          onChange={(e) => {
                            const newM = [...models];
                            const idx = newM.findIndex(model => model.id === m.id);
                            newM[idx].printerId = e.target.value;
                            setModels(newM);
                          }}
                        >
                          {printers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-4 text-left">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold tracking-wider mb-1">CUSTO</span>
                        <span className="text-sm font-mono font-medium text-slate-200">R$ {m.cost.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold tracking-wider mb-1">VENDA</span>
                        <span className="text-sm font-mono font-bold text-white">R$ {m.sellPrice.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold tracking-wider mb-1">MARGEM</span>
                        <span className="text-sm font-mono font-medium text-slate-200">{m.marginPercent.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold tracking-wider mb-1">IMPRESSÃO</span>
                        <span className="text-sm font-mono font-medium text-slate-200">{m.timeFormatted}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold tracking-wider mb-1">UN/MESA</span>
                        <span className="text-sm font-mono font-medium text-slate-200">{m.qtyPerTable}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold tracking-wider mb-1">LUCRO/UN</span>
                        <span className="text-sm font-mono font-medium text-slate-200">R$ {m.lucroUn.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold tracking-wider mb-1">UN/MÊS</span>
                        <span className="text-sm font-mono font-bold text-[#0084FF]">{m.targetUnMes}</span>
                      </div>
                    </div>

                    {/* Ocupação Slider */}
                    <div className="pt-2">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5"><SlidersHorizontal className="w-3.5 h-3.5" /> OCUPAÇÃO - {printerName}</span>
                        <span className="text-xs font-bold text-slate-200 ml-auto">{m.occupancyPercent}%</span>
                        <span className="text-[10px] text-slate-400">{((maxHoursPerPrinter * m.occupancyPercent) / 100).toFixed(1)}h/mês</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={m.occupancyPercent}
                        onChange={(e) => {
                          const newM = [...models];
                          const idx = newM.findIndex(model => model.id === m.id);
                          newM[idx].occupancyPercent = Number(e.target.value);
                          setModels(newM);
                        }}
                        className="w-full h-1.5 bg-[#3A3F47] rounded-lg appearance-none cursor-pointer accent-[#0084FF]"
                      />
                    </div>
                  </div>

                  {/* Right Side (Thermometer & Profit Box) */}
                  <div className="flex items-end gap-6 pl-6 border-l border-[#2B2F36]">
                    
                    {/* Visual Thermometer */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-4 h-24 bg-[#2B2F36] rounded-full border border-[#2B2F36] relative overflow-hidden flex flex-col justify-end p-0.5">
                        <div className={`w-full rounded-full transition-all duration-300 ${thermoColor}`} style={{ height: thermoHeight }}></div>
                      </div>
                      <span className="font-bold font-mono text-sm text-slate-200">{m.occupancyPercent}%</span>
                    </div>

                    {/* Lucro Mensal Box */}
                    <div className="bg-[#121418] border border-[#2B2F36] p-3 rounded-xl min-w-[120px] text-center shadow-sm">
                      <span className="block text-[10px] text-slate-400 font-bold tracking-widest mb-1">LUCRO MENSAL</span>
                      <span className="block text-xl font-mono font-black text-emerald-600">R$ {(m.lucroMensal >= 1000 ? (m.lucroMensal/1000).toFixed(1) + 'K' : m.lucroMensal.toFixed(2).replace('.', ','))}</span>
                      <span className="block text-[9px] text-slate-400 mt-1">{m.targetUnMes} un × R$ {m.lucroUn.toFixed(2)}</span>
                    </div>

                    {/* Delete button absolute */}
                    <button 
                      onClick={() => {
                        setModels(models.filter(mod => mod.id !== m.id));
                      }}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM BAR (Totals & Alerts) */}
        <div className="min-h-20 bg-[#1C1F24] border-t border-[#2B2F36] flex flex-wrap items-center px-6 py-4 gap-4 md:gap-8 shrink-0">
          <div className="flex flex-col">
            <span className="block text-[10px] text-slate-400 font-bold tracking-wider mb-1 uppercase">Lucro Total / Mês</span>
            <span className="text-xl font-mono font-black text-emerald-600">R$ {totalMonthlyProfit >= 1000 ? (totalMonthlyProfit/1000).toFixed(1).replace('.', ',') + 'K' : totalMonthlyProfit.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-[#3A3F47] shrink-0"></div>
          <div className="flex flex-col">
            <span className="block text-[10px] text-slate-400 font-bold tracking-wider mb-1 uppercase">Renda Alvo</span>
            <div className="flex items-center text-xl font-mono font-black text-white">
              R$ 
              <input 
                type="number" 
                value={targetIncome || ''} 
                onChange={e => setTargetIncome(Number(e.target.value))}
                className="bg-[#2B2F36] border border-[#2B2F36] rounded px-2 py-0.5 w-24 outline-none text-white ml-2 font-black focus:border-[#0084FF] focus:bg-[#1C1F24]"
              />
            </div>
          </div>
          <div className="hidden md:block w-px h-8 bg-[#3A3F47] shrink-0"></div>
          <div className="flex flex-col">
            <span className="block text-[10px] text-slate-400 font-bold tracking-wider mb-1 uppercase">% Da Meta</span>
            <span className="text-xl font-mono font-black text-[#0084FF]">{percentOfTarget.toFixed(1)}%</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-[#3A3F47] shrink-0"></div>
          <div className="flex flex-col">
            <span className="block text-[10px] text-slate-400 font-bold tracking-wider mb-1 uppercase">Impressoras</span>
            <span className="text-xl font-mono font-black text-[#0084FF]">{numPrinters}</span>
          </div>

          {totalMonthlyProfit > 0 && totalMonthlyProfit < targetIncome && (
            <div className="ml-auto bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-center gap-3 shrink-0 max-w-[320px]">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-xs text-red-700 leading-tight">
                <strong className="text-red-600 font-bold">Faltam {Math.max(1, printersNeeded - numPrinters)} impressoras</strong> para atingir a meta.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
