import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { Material } from '../types';
import { Search, Plus, Trash2, Calendar, FileDown, MoreVertical, X, Sparkles, Scale, Edit } from 'lucide-react';
import { filamentCatalog } from '../data/filamentCatalog';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, XAxis, BarChart, Bar, CartesianGrid, Cell } from 'recharts';

export const Materials: React.FC = () => {
  const { materials, addMaterial, deleteMaterial, updateMaterial, sellers, addSeller } = useDb();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  
  // Seller Form States
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerLink, setNewSellerLink] = useState('');
  
  // Chart filter state
  const [chartColorFilter, setChartColorFilter] = useState('Todos');

  // Form states
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [initialWeight, setInitialWeight] = useState(1000);
  const [currentWeight, setCurrentWeight] = useState(1000);
  const [spoolPrice, setSpoolPrice] = useState(140.00);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [colorHex, setColorHex] = useState('#0084FF');
  const [selectedSellerId, setSelectedSellerId] = useState('');

  // Custom states for 'Outro' selections
  const [customBrand, setCustomBrand] = useState('');
  const [customName, setCustomName] = useState('');
  const [customColor, setCustomColor] = useState('');

  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    const brandData = filamentCatalog.find(b => b.brand === newBrand);
    if (brandData && brandData.materials.length > 0) {
      setName(brandData.materials[0].name);
      if (brandData.materials[0].colors.length > 0) {
        setColor(brandData.materials[0].colors[0].name);
        setColorHex(brandData.materials[0].colors[0].hex);
      } else {
        setColor('Outro');
      }
    } else {
      setName('Outro');
      setColor('Outro');
    }
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    const brandData = filamentCatalog.find(b => b.brand === brand);
    if (brandData) {
      const matData = brandData.materials.find(m => m.name === newName);
      if (matData && matData.colors.length > 0) {
        setColor(matData.colors[0].name);
        setColorHex(matData.colors[0].hex);
      } else {
        setColor('Outro');
      }
    }
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    const brandData = filamentCatalog.find(b => b.brand === brand);
    if (brandData) {
      const matData = brandData.materials.find(m => m.name === name);
      if (matData) {
        const colorData = matData.colors.find(c => c.name === newColor);
        if (colorData) {
          setColorHex(colorData.hex);
        }
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setBrand('');
    setName('');
    setColor('');
    setCustomBrand('');
    setCustomName('');
    setCustomColor('');
    setInitialWeight(1000);
    setCurrentWeight(1000);
    setSpoolPrice(140.00);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setColorHex('#0084FF');
    setSelectedSellerId('');
    setIsModalOpen(true);
  };

  const handleEdit = (mat: Material) => {
    setEditingId(mat.id);
    
    // Check if the brand exists in the catalog
    const brandExists = filamentCatalog.some(b => b.brand === mat.brand);
    setBrand(brandExists ? mat.brand : 'Outro');
    if (!brandExists) setCustomBrand(mat.brand);

    // Check if the name exists in that brand
    const nameExists = brandExists && filamentCatalog.find(b => b.brand === mat.brand)?.materials.some(m => m.name === mat.name);
    setName(nameExists ? mat.name : 'Outro');
    if (!nameExists) setCustomName(mat.name);

    // Check if the color exists in that material
    const colorExists = nameExists && filamentCatalog.find(b => b.brand === mat.brand)?.materials.find(m => m.name === mat.name)?.colors.some(c => c.name === mat.color);
    setColor(colorExists ? mat.color : 'Outro');
    if (!colorExists) setCustomColor(mat.color);

    setInitialWeight(mat.initialWeight);
    setCurrentWeight(mat.currentWeight);
    setSpoolPrice(mat.spoolPrice);
    setPurchaseDate(mat.purchaseDate);
    setColorHex(mat.colorHex || '#0084FF');
    setSelectedSellerId(mat.sellerId || '');
    setIsModalOpen(true);
  };

  const handleSellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSellerName.trim()) return;
    addSeller({
      name: newSellerName,
      link: newSellerLink
    });
    setNewSellerName('');
    setNewSellerLink('');
    setIsSellerModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalBrand = brand === 'Outro' ? customBrand : brand;
    const finalName = name === 'Outro' || brand === 'Outro' ? customName : name;
    const finalColor = color === 'Outro' || name === 'Outro' || brand === 'Outro' ? customColor : color;

    if (!finalName.trim()) return;

    const costPerGram = parseFloat((Number(String(spoolPrice).replace(',', '.')) / Number(String(initialWeight).replace(',', '.'))).toFixed(4));
    
    let priceHistory: { date: string; price: number; sellerId?: string }[] = [];

    if (editingId) {
      const existingMat = materials.find(m => m.id === editingId);
      priceHistory = existingMat?.priceHistory ? [...existingMat.priceHistory] : [];
      
      const lastEntry = priceHistory[priceHistory.length - 1];
      if (!lastEntry || lastEntry.price !== spoolPrice || lastEntry.date !== purchaseDate || lastEntry.sellerId !== selectedSellerId) {
        priceHistory.push({ date: purchaseDate, price: spoolPrice, sellerId: selectedSellerId || undefined });
        priceHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (priceHistory.length > 12) priceHistory = priceHistory.slice(priceHistory.length - 12);
      }
    } else {
      priceHistory = [{ date: purchaseDate, price: spoolPrice, sellerId: selectedSellerId || undefined }];
    }

    const data = {
      name: finalName,
      color: finalColor,
      brand: finalBrand,
      initialWeight,
      currentWeight,
      spoolPrice,
      costPerGram,
      purchaseDate,
      colorHex,
      sellerId: selectedSellerId || undefined,
      priceHistory,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvt5ZcSOqhtMILXovumWX0rswNGdB3aEgEFW7B8WyU6E9UoxOfQL9MrlgMTEE3xpT9L7BWwCrWK6UqhDCLB_H-3k4qUhL_jg37sGYoSw5fLuIi80XIMtsYJUKD091bi_wRle9hvI8bVM4ejMglQjqehyfzaj66T4qqgAhUl0UHmvkg8ZaqXVn18_zi7RDjNPZuAK7lT9ByqSClAvM_KmPzWsIN-ItERmlc8MBDWAL_gFcXL1bkc76ULjYRVPdBHzOeFZNeR_Hgikg"
    };

    if (editingId) {
      updateMaterial(editingId, { ...data, id: editingId });
    } else {
      addMaterial(data);
    }

    setIsModalOpen(false);
  };

  // Filter spools
  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-white mb-1">Controle de Insumos e Materiais</h2>
          <p className="text-slate-400 font-body-md">Gerencie os filamentos, cores disponíveis e custos de aquisição por grama.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => alert('Relatório de compras e consumo exportado como CSV!')}
            className="px-4 py-2 bg-[#1C1F24] border border-[#2B2F36] text-slate-300 rounded-lg font-label-md text-xs hover:bg-[#121418] flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileDown className="w-4 h-4" /> Exportar CSV
          </button>
          <button 
            onClick={() => setIsSellerModalOpen(true)}
            className="px-4 py-2 bg-[#1C1F24] border border-[#2B2F36] text-[#0084FF] rounded-lg font-label-md text-xs hover:bg-[#121418] flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Registrar Vendedor
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#0084FF] text-white rounded-lg font-label-md text-xs hover:bg-[#0084FF]/90 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Registrar Rolo
          </button>
        </div>
      </div>

      {/* Busca e Barra de Ferramentas */}
      <div className="bg-[#1C1F24] border border-[#2B2F36] p-4 rounded-xl shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, cor ou marca do filamento..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#2B2F36] rounded-lg text-slate-200 bg-[#121418] outline-none focus:ring-2 focus:ring-[#0084FF]/50 text-xs"
          />
        </div>
      </div>

      {/* Container Layout com Sidebar */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {/* Grid de Filamentos / Bobinas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((mat) => {
          const remainingPercent = Math.min(100, Math.round((mat.currentWeight / mat.initialWeight) * 100));
          const isLow = mat.currentWeight <= 250;

          return (
            <div key={mat.id} className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between">
              {/* Spool Image Frame */}
              <div className="h-36 relative overflow-hidden bg-[#1C1F24] border-b border-[#2B2F36] flex-shrink-0 group">
                <div 
                  className="w-full h-full absolute inset-0 z-10" 
                  style={{ backgroundColor: mat.colorHex || '#CBD5E1' }}
                />
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh-HmxukFdfK_Y5oBwjxaEZnoqKshor6ds7B6QVRJzXsbAO_xeuVieouGHcYOh94UK6DFaCplsHh3DlHwLVqNc3ru3zj3BzN1J44wnhTk9ANzTFOyxg4q5xcnl_ErfwdUaZzgM2oIkMktBk4MTaN7CZacVqfa_EDOTwEb7BTwAVxWspZThKDt-wN0ZqK-5vxQE01gpG6kCP4n4NWX7LVWmDoY5W7eBIHpUDyl0jLZ8Lo95X5wry50he3rzAAONBuOhap6mHihpZJo" 
                  className="w-full h-full object-cover absolute inset-0 z-20 mix-blend-multiply opacity-70 grayscale group-hover:scale-105 transition-transform duration-500" 
                  referrerPolicy="no-referrer"
                  alt={mat.name} 
                />
                
                <div className="absolute top-3 left-3 z-30 bg-[#1C1F24]/90 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider shadow-sm">
                  {mat.name.split(' ')[mat.name.split(' ').length - 1]}
                </div>
                {/* Real physical color indicator */}
                <div 
                  className="absolute top-3 right-3 z-30 w-4.5 h-4.5 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110" 
                  style={{ backgroundColor: mat.colorHex || '#CBD5E1' }}
                  title={`Cor: ${mat.color}`}
                ></div>
              </div>

              {/* Spool Content Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-bold text-white text-sm truncate leading-tight">{mat.name}</h3>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEdit(mat)}
                        className="text-slate-400 hover:text-[#0084FF] rounded p-0.5 transition-colors"
                        title="Editar Rolo"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteMaterial(mat.id)}
                        className="text-slate-400 hover:text-red-500 rounded p-0.5 transition-colors"
                        title="Excluir Rolo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mb-4 flex items-center gap-1">
                    <span>{mat.brand}</span>
                    {mat.sellerId && (() => {
                      const seller = sellers.find(s => s.id === mat.sellerId);
                      if (!seller) return <span>• Vendedor Desconhecido</span>;
                      return (
                        <>
                          <span className="text-slate-500">•</span>
                          {seller.link ? (
                            <a 
                              href={seller.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="hover:text-[#0084FF] hover:underline transition-colors cursor-pointer"
                              title={`Visitar site de ${seller.name}`}
                            >
                              {seller.name}
                            </a>
                          ) : (
                            <span>{seller.name}</span>
                          )}
                        </>
                      );
                    })()}
                  </p>

                  <div className="space-y-4">
                    {/* Progress slider bar */}
                    <div>
                      <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400 uppercase tracking-tight">
                        <span>Peso Restante</span>
                        <span className="font-bold">{mat.currentWeight}g / {mat.initialWeight}g</span>
                      </div>
                      <div className="h-2 w-full bg-[#2B2F36] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-[#22C55E]'}`}
                          style={{ width: `${remainingPercent}%` }}
                        ></div>
                      </div>
                      {isLow && (
                        <p className="text-red-600 text-[9px] font-bold uppercase tracking-wider mt-1 flex items-center gap-0.5">
                          ⚠️ Baixo Estoque
                        </p>
                      )}
                    </div>
                    
                    {/* Unidades */}
                    <div className="flex items-center justify-between bg-[#121418] p-2 rounded-lg border border-[#2B2F36]">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-tight font-mono">Unidades Disp.</p>
                        <p className="font-bold text-slate-200 text-xs">{(mat.currentWeight / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} <span className="text-[9px] font-normal text-slate-400">(1000g/un)</span></p>
                      </div>
                      <button 
                        onClick={() => updateMaterial(mat.id, { ...mat, currentWeight: mat.currentWeight + 1000 })}
                        className="bg-[#1C1F24] border border-[#2B2F36] text-[#0084FF] hover:bg-[#0084FF] hover:text-white rounded p-1.5 transition-colors shadow-sm flex items-center gap-1 text-[10px] font-bold"
                        title="Adicionar 1 Unidade (1000g)"
                      >
                        <Plus className="w-3 h-3" /> 1 Unid
                      </button>
                    </div>
                  </div>
                </div>

                {/* Technical pricing matrix footer */}
                <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-[#2B2F36] text-xs">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider font-label-md" title="Valor de Compra">Valor Rolo</p>
                    <p className="font-mono font-bold text-[#0084FF]">R$ {mat.spoolPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider font-label-md">Custo/g</p>
                    <p className="font-mono font-bold text-slate-200">R$ {mat.costPerGram.toFixed(4)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider font-label-md flex items-center justify-end gap-0.5">
                      <Calendar className="w-2.5 h-2.5" /> Data
                    </p>
                    <p className="font-mono text-slate-200 font-medium text-[11px]">{mat.purchaseDate.split('-').reverse().slice(0, 2).join('/')}</p>
                  </div>
                </div>
                
                {/* Price History Chart */}
                {mat.priceHistory && mat.priceHistory.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#2B2F36]">
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider font-label-md mb-2 flex justify-between">
                      <span>Histórico Mensal (R$)</span>
                    </p>
                    <div className="h-16 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mat.priceHistory}>
                          <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                          <Tooltip 
                            contentStyle={{ fontSize: '10px', padding: '4px', borderRadius: '4px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                            formatter={(value, name, props) => {
                              const seller = sellers.find(s => s.id === props.payload.sellerId);
                              const sellerStr = seller ? ` (${seller.name})` : '';
                              return [`R$ ${Number(value).toFixed(2)}${sellerStr}`, 'Preço'];
                            }}
                            labelFormatter={(label) => {
                              const [, m] = String(label).split('-');
                              return m ? `Mês ${m}` : label;
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#0084FF" 
                            strokeWidth={2} 
                            dot={{ r: 2.5, fill: '#0084FF', strokeWidth: 1, stroke: '#fff' }} 
                            activeDot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Register New spool bento placeholder */}
        <button 
          onClick={handleOpenAddModal}
          className="bg-[#121418] border-2 border-dashed border-[#2B2F36] rounded-xl flex flex-col items-center justify-center p-8 hover:border-[#0084FF] hover:bg-[#2B2F36]/40 transition-all group min-h-[300px] cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full border border-[#3A3F47] flex items-center justify-center text-slate-400 group-hover:border-[#0084FF] group-hover:text-[#0084FF] transition-colors mb-4 bg-[#1C1F24] shadow-sm">
            <Plus className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-200 text-sm group-hover:text-[#0084FF] transition-colors">Comprar Nova Bobina</p>
          <p className="text-xs text-slate-400 text-center mt-2 max-w-[170px] leading-relaxed">
            Adicione novos filamentos para expandir as opções e cores do catálogo 3D.
          </p>
        </button>
      </div>
      </div>

      {/* Sidebar de Analytics de Vendedores */}
      <div className="w-full xl:w-[320px] flex-shrink-0 space-y-6">
        <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-5 shadow-sm">
          <h3 className="font-headline-sm text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0084FF]" /> Melhores Preços
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">
            Comparativo de custo por grama entre vendedores.
          </p>

          <div className="mb-4">
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Filtrar por Cor</label>
            <select 
              value={chartColorFilter}
              onChange={(e) => setChartColorFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#2B2F36] rounded-lg text-xs bg-[#121418] outline-none text-slate-300 focus:border-[#0084FF]"
            >
              <option value="Todos">Todas as Cores</option>
              {Array.from(new Set(materials.map(m => m.color))).map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {(() => {
                const chartData = sellers.map(s => {
                  const mats = materials.filter(m => m.sellerId === s.id && (chartColorFilter === 'Todos' || m.color === chartColorFilter));
                  if (mats.length === 0) return null;
                  const minPrice = Math.min(...mats.map(m => m.costPerGram));
                  return { name: s.name, minPrice };
                }).filter(Boolean).sort((a: any, b: any) => a.minPrice - b.minPrice);

                return (
                  <BarChart
                    layout="vertical"
                    data={chartData}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2B2F36" horizontal={false} />
                    <XAxis type="number" tick={{fontSize: 10, fill: '#64748b'}} stroke="#2B2F36" tickFormatter={val => `R$${val.toFixed(2)}`} />
                    <YAxis dataKey="name" type="category" tick={{fontSize: 10, fill: '#94a3b8'}} stroke="none" reversed={true} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1C1F24', borderColor: '#2B2F36', fontSize: '11px', color: '#f1f5f9' }}
                      formatter={(val: number) => [`R$ ${val.toFixed(4)}/g`, 'Menor Preço']}
                      cursor={{fill: '#2B2F36', opacity: 0.4}}
                    />
                    <Bar dataKey="minPrice" radius={[0, 4, 4, 0]} barSize={20}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#22C55E' : '#0084FF'} />
                      ))}
                    </Bar>
                  </BarChart>
                );
              })()}
            </ResponsiveContainer>
          </div>
          
        </div>
      </div>
    </div>

      {/* Modal para adicionar material */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1F24] rounded-xl border border-[#2B2F36] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-[#2B2F36] bg-[#121418] flex justify-between items-center">
              <h3 className="font-headline-sm text-white">
                {editingId ? 'Editar Bobina de Filamento' : 'Registrar Bobina de Filamento'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-300 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Marca / Fabricante</label>
                  <select 
                    required
                    value={brand}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
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
                      onChange={(e) => setCustomBrand(e.target.value)}
                      className="w-full px-4 py-2 mt-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                    />
                  )}
                </div>
                
                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Nome do Material</label>
                  {filamentCatalog.some(b => b.brand === brand) ? (
                    <select
                      required
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
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
                      onChange={(e) => brand === 'Outro' ? setCustomName(e.target.value) : setName(e.target.value)}
                      className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                    />
                  )}
                  {name === 'Outro' && filamentCatalog.some(b => b.brand === brand) && (
                    <input 
                      type="text" 
                      required
                      placeholder="Digite o nome"
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-4 py-2 mt-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Cor por Extenso</label>
                  {filamentCatalog.some(b => b.brand === brand) && filamentCatalog.find(b => b.brand === brand)?.materials.some(m => m.name === name) ? (
                    <select
                      required
                      value={color}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
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
                      placeholder="Ex: Azul Esmeralda"
                      value={brand === 'Outro' || name === 'Outro' ? customColor : color}
                      onChange={(e) => brand === 'Outro' || name === 'Outro' ? setCustomColor(e.target.value) : setColor(e.target.value)}
                      className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                    />
                  )}
                  {color === 'Outro' && filamentCatalog.some(b => b.brand === brand) && filamentCatalog.find(b => b.brand === brand)?.materials.some(m => m.name === name) && (
                    <input 
                      type="text" 
                      required
                      placeholder="Digite a cor"
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-full px-4 py-2 mt-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                    />
                  )}
                </div>
              </div>

                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Vendedor</label>
                  <select
                    value={selectedSellerId}
                    onChange={(e) => setSelectedSellerId(e.target.value)}
                    className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                  >
                    <option value="">Selecione um vendedor (Opcional)</option>
                    {sellers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Seletor de Cor Hex</label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="w-11 h-9 p-0.5 border border-[#2B2F36] rounded-lg bg-[#1C1F24] outline-none cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="w-full px-3 py-2 border border-[#2B2F36] rounded-lg text-xs font-mono outline-none focus:border-[#0084FF]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Valor Pago no Rolo (R$)</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    min="1"
                    value={spoolPrice}
                    onChange={(e) => setSpoolPrice(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Peso Inicial (Unidades / g)</label>
                  <div className="flex gap-2">
                    <div className="relative w-1/2">
                      <input 
                        type="number" 
                        step="0.1"
                        min="0.1"
                        value={initialWeight / 1000}
                        onChange={(e) => setInitialWeight(Math.max(1, Math.round((parseFloat(e.target.value) || 0) * 1000)))}
                        className="w-full pl-3 pr-8 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                        title="Em unidades (1 un = 1000g)"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none uppercase">un</span>
                    </div>
                    <div className="relative w-1/2">
                      <input 
                        type="number" 
                        required
                        min={1}
                        value={initialWeight}
                        onChange={(e) => setInitialWeight(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full pl-3 pr-6 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                        title="Em gramas"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none uppercase">g</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Peso Atual (Unidades / g)</label>
                  <div className="flex gap-2">
                    <div className="relative w-1/2">
                      <input 
                        type="number" 
                        step="0.1"
                        value={currentWeight / 1000}
                        onChange={(e) => setCurrentWeight(Math.max(0, Math.round((parseFloat(e.target.value) || 0) * 1000)))}
                        className="w-full pl-3 pr-8 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                        title="Em unidades (1 un = 1000g)"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none uppercase">un</span>
                    </div>
                    <div className="relative w-1/2">
                      <input 
                        type="number" 
                        required
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full pl-3 pr-6 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                        title="Em gramas"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none uppercase">g</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-xs uppercase">Data de Aquisição</label>
                <input 
                  type="date" 
                  required
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                />
              </div>

              <div className="p-4 bg-[#121418] rounded-lg border border-dashed border-[#2B2F36] text-xs flex justify-between font-medium">
                <span className="text-slate-400 flex items-center gap-1"><Scale className="w-4 h-4 text-slate-400" /> Custo Unitário Projetado:</span>
                <span className="font-mono font-bold text-slate-200">
                  R$ {(spoolPrice / initialWeight).toFixed(4)} por grama
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#2B2F36] text-slate-400 rounded-lg text-xs font-label-md hover:bg-[#121418] cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#0084FF] hover:bg-[#0084FF]/90 text-white rounded-lg text-xs font-label-md cursor-pointer"
                >
                  {editingId ? 'Salvar Alterações' : 'Confirmar Compra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Adicionar Vendedor */}
      {isSellerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setIsSellerModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-headline-sm text-white mb-6">Registrar Novo Vendedor</h3>
            
            <form onSubmit={handleSellerSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-xs uppercase">Nome do Vendedor/Loja</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: 3D Lab, Mercado Livre"
                  value={newSellerName}
                  onChange={(e) => setNewSellerName(e.target.value)}
                  className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-xs uppercase">Link do Site (Opcional)</label>
                <input 
                  type="url" 
                  placeholder="Ex: https://www.loja3d.com.br"
                  value={newSellerLink}
                  onChange={(e) => setNewSellerLink(e.target.value)}
                  className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsSellerModalOpen(false)}
                  className="px-4 py-2 border border-[#2B2F36] text-slate-400 rounded-lg text-xs font-label-md hover:bg-[#121418] cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#0084FF] hover:bg-[#0084FF]/90 text-white rounded-lg text-xs font-label-md cursor-pointer"
                >
                  Salvar Vendedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
