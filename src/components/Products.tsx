import React, { useState, useRef } from 'react';
import { useDb } from '../context/DbContext';
import { Trash2, X, Plus, Edit, Image as ImageIcon, Upload } from 'lucide-react';
import { ProductFilament, Product } from '../types';
import { MultipartProductModal } from './MultipartProductModal';

const DEFAULT_IMAGES = [
  "https://upload.wikimedia.org/wikipedia/commons/7/7b/3DBenchy_created_using_color_mixing_on_an_FDM_printer.jpg", // 3D Benchy
  "https://upload.wikimedia.org/wikipedia/commons/b/be/3D_Printed_RFB_cell_frame_printed_on_Prusa_i3.jpg", // 3D Printed Part
  "https://upload.wikimedia.org/wikipedia/commons/b/b6/Assembled_Prusa_Mendel.jpg", // 3D Printer
  "https://upload.wikimedia.org/wikipedia/commons/4/46/Bobina_PLA.jpg"  // Filament Spool
];

export const Products: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, materials } = useDb();

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMultipartModalOpen, setIsMultipartModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingMultipartProduct, setEditingMultipartProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Instrumento');
  const [printHours, setPrintHours] = useState(5);
  const [printMinutes, setPrintMinutes] = useState(0);
  const [accessoryCost, setAccessoryCost] = useState(0);
  const [image, setImage] = useState(DEFAULT_IMAGES[0]);

  const [colorMode, setColorMode] = useState<'MONO' | 'MULTI'>('MONO');
  const [monoMaterialId, setMonoMaterialId] = useState('');
  const [monoWeight, setMonoWeight] = useState(30);
  const [multiFilaments, setMultiFilaments] = useState<ProductFilament[]>([{ materialId: '', weight: 10 }]);
  const [unitsPerPrint, setUnitsPerPrint] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculations
  const getTotalWeight = () => {
    if (colorMode === 'MONO') return monoWeight;
    return multiFilaments.reduce((acc, curr) => acc + curr.weight, 0);
  };

  const getFilamentCost = () => {
    try {
      if (colorMode === 'MONO') {
        const mat = materials.find(m => String(m.id).trim() === String(monoMaterialId).trim());
        if (!mat) return 0;
        
        // Handle comma replacements for all numbers before converting
        const parseNum = (val: any) => {
            if (val === undefined || val === null) return 0;
            const strVal = String(val).replace(',', '.');
            return parseFloat(strVal);
        };
        
        let c = parseNum(mat.costPerGram);
        if (isNaN(c) || c <= 0) {
           const p = parseNum(mat.spoolPrice);
           const w = parseNum(mat.initialWeight);
           
           if (!isNaN(p) && !isNaN(w) && w > 0 && p > 0) {
               c = p / w;
           } else {
               c = 0.14;
           }
        }
        
        const mw = parseNum(monoWeight);
        return (isNaN(mw) ? 0 : mw) * c;
      }
      
      return multiFilaments.reduce((acc, curr) => {
        const mat = materials.find(m => String(m.id).trim() === String(curr.materialId).trim());
        if (!mat) return acc;
        
        const parseNum = (val: any) => {
            if (val === undefined || val === null) return 0;
            const strVal = String(val).replace(',', '.');
            return parseFloat(strVal);
        };
        
        let c = parseNum(mat.costPerGram);
        if (isNaN(c) || c <= 0) {
           const p = parseNum(mat.spoolPrice);
           const w = parseNum(mat.initialWeight);
           
           if (!isNaN(p) && !isNaN(w) && w > 0 && p > 0) {
               c = p / w;
           } else {
               c = 0.14;
           }
        }
        
        const cw = parseNum(curr.weight);
        return acc + ((isNaN(cw) ? 0 : cw) * c);
      }, 0);
    } catch (e) {
      console.error(e);
      return 0;
    }
  };

  const totalPrintTime = (Number(printHours) || 0) + ((Number(printMinutes) || 0) / 60);
  const rawCost = getFilamentCost();
  const safeCost = typeof rawCost === 'number' && !isNaN(rawCost) ? rawCost : 0;
  const currentCost = safeCost + (totalPrintTime * 0.01) + (Number(accessoryCost) || 0);
  const currentB2B = currentCost * 4;
  const currentB2C = currentB2B * 2;

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setCategory('Instrumento');
    setPrintHours(5);
    setPrintMinutes(0);
    setAccessoryCost(0);
    setImage(DEFAULT_IMAGES[0]);
    setColorMode('MONO');
    setMonoMaterialId('');
    setMonoWeight(30);
    setMultiFilaments([{ materialId: '', weight: 10 }]);
    setUnitsPerPrint(1);
    setIsModalOpen(true);
  };

  const handleEdit = (p: Product) => {
    if (p.isMultipart) {
      setEditingMultipartProduct(p);
      setIsMultipartModalOpen(true);
      return;
    }
    
    setEditingId(p.id);
    setName(p.name);
    setCategory(p.category);
    setPrintHours(Math.floor(p.printTime));
    setPrintMinutes(Math.round((p.printTime % 1) * 60));
    setAccessoryCost(p.accessoryCost || 0);
    setUnitsPerPrint(p.unitsPerPrint || 1);
    setImage(p.image || DEFAULT_IMAGES[0]);

    if (p.colorMode === 'MULTI' && p.filaments && p.filaments.length > 0) {
      setColorMode('MULTI');
      setMultiFilaments(p.filaments);
    } else {
      setColorMode('MONO');
      setMonoMaterialId(p.filaments?.[0]?.materialId || p.materialId);
      setMonoWeight(p.filaments?.[0]?.weight || p.weight);
    }
    setIsModalOpen(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalFilaments: ProductFilament[] = [];
    if (colorMode === 'MONO') {
      if (!monoMaterialId) {
        alert("Selecione um filamento.");
        return;
      }
      finalFilaments = [{ materialId: monoMaterialId, weight: monoWeight }];
    } else {
      if (multiFilaments.some(f => !f.materialId || f.weight <= 0)) {
        alert("Preencha todos os filamentos corretamente.");
        return;
      }
      finalFilaments = multiFilaments;
    }

    const data = {
      name,
      category,
      printTime: totalPrintTime,
      weight: getTotalWeight(),
      accessoryCost,
      unitsPerPrint,
      colorMode,
      filaments: finalFilaments,
      costPrice: parseFloat(currentCost.toFixed(2)),
      b2bPrice: parseFloat(currentB2B.toFixed(2)),
      sellPrice: parseFloat(currentB2C.toFixed(2)),
      profit: parseFloat((currentB2C - currentCost).toFixed(2)),
      materialId: finalFilaments[0]?.materialId || '', // fallback
      image
    };

    if (editingId) {
      updateProduct(editingId, { ...data, id: editingId });
    } else {
      addProduct(data);
    }

    cancelEdit();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#1C1F24] p-6 rounded-xl border border-[#2B2F36] shadow-sm">
        <div>
          <h2 className="font-headline-md text-white">Catálogo de Produtos</h2>
          <p className="text-sm text-slate-400 mt-1">Gerencie seu portfólio de impressões 3D</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenAddModal}
            className="bg-[#0084FF] hover:bg-[#0084FF]/90 text-white font-bold py-2.5 px-5 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Novo Produto
          </button>
          <button
            onClick={() => {
              setEditingMultipartProduct(null);
              setIsMultipartModalOpen(true);
            }}
            className="bg-[#6B46C1] hover:bg-[#553C9A] text-white font-bold py-2.5 px-5 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Novo Produto Multpartes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-[#1C1F24] rounded-xl border border-[#2B2F36] shadow-sm overflow-hidden flex flex-col group relative transition-all hover:shadow-md hover:border-[#0084FF]/30">
            {/* Image Header */}
            <div className="aspect-[4/3] bg-[#2B2F36] relative overflow-hidden">
              {p.image ? (
                <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-12 h-12 opacity-20" />
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 bg-[#1C1F24]/90 backdrop-blur-sm text-slate-200 rounded-full text-[10px] font-bold shadow-sm border border-[#2B2F36]/50">
                  {p.category}
                </span>
              </div>
              
              {/* Floating Actions on Hover */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(p)}
                  className="p-2 bg-[#1C1F24]/90 hover:bg-[#1C1F24] text-slate-300 rounded-full shadow-sm transition-colors"
                  title="Editar"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => deleteProduct(p.id)}
                  className="p-2 bg-[#1C1F24]/90 hover:bg-red-50 text-red-500 rounded-full shadow-sm transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-white text-lg leading-tight mb-4">{p.name}</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#121418] p-2.5 rounded-lg border border-[#2B2F36]">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Tempo</span>
                  <span className="font-mono text-xs text-slate-200 font-medium">
                    {Math.floor(p.printTime)}h {Math.round((p.printTime % 1) * 60) > 0 ? `${Math.round((p.printTime % 1) * 60)}m` : ''}
                  </span>
                </div>
                <div className="bg-[#121418] p-2.5 rounded-lg border border-[#2B2F36]">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Peso</span>
                  <span className="font-mono text-xs text-slate-200 font-medium">{p.weight}g</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-[#2B2F36] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Custo Total:</span>
                  <span className="font-mono font-medium text-slate-200">R$ {p.costPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Preço B2B:</span>
                  <span className="font-mono font-bold text-[#0084FF]">R$ {(p.b2bPrice || (p.costPrice * 4)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-200 font-medium">Preço Final:</span>
                  <span className="font-mono font-bold text-[#22C55E]">R$ {p.sellPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-[#1C1F24] border border-[#2B2F36] border-dashed rounded-xl">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium text-slate-300">Nenhum produto cadastrado.</p>
            <p className="text-xs mt-1">Clique em "Novo Produto" para começar a montar seu catálogo.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1F24] rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-[#2B2F36] flex justify-between items-center bg-[#121418] sticky top-0 z-10">
              <h2 className="font-headline-md text-white m-0">
                {editingId ? 'Editar Produto' : 'Cadastrar Produto'}
              </h2>
              <button onClick={cancelEdit} className="p-1 text-slate-400 hover:text-slate-300 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Imagem do Produto */}
                <div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase mb-4">Imagem do Produto</h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-48 h-48 bg-[#2B2F36] rounded-xl border-2 border-dashed border-[#2B2F36] flex items-center justify-center overflow-hidden relative group">
                      {image ? (
                        <>
                          <img src={image} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full flex items-center gap-1">
                              <Upload className="w-3 h-3" /> Trocar
                            </button>
                          </div>
                        </>
                      ) : (
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-slate-400 flex flex-col items-center gap-2 hover:text-[#0084FF] transition-colors">
                          <Upload className="w-6 h-6" />
                          <span className="text-xs font-medium">Fazer Upload</span>
                        </button>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase">Ou escolha uma imagem padrão</label>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {DEFAULT_IMAGES.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setImage(img)}
                            className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${image === img ? 'border-[#2563EB] shadow-md scale-105' : 'border-transparent hover:border-[#3A3F47]'}`}
                          >
                            <img src={img} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={`Preset ${i+1}`} />
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">Dica: Adicione uma foto real da peça impressa para deixar seu catálogo mais profissional para envio a clientes no futuro.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#2B2F36]"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2 lg:col-span-2">
                    <label className="font-label-md text-slate-400 text-xs uppercase block">Nome</label>
                    <input 
                      type="text" 
                      placeholder="ex: Tubo de baixo"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-label-md text-slate-400 text-xs uppercase block">Categoria</label>
                    <input 
                      type="text" 
                      placeholder="ex: Instrumento"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-label-md text-slate-400 text-xs uppercase block">Acessório (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={accessoryCost}
                      onChange={e => setAccessoryCost(Number(e.target.value))}
                      className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]"
                    />
                  </div>
                  
                  <div className="space-y-2 lg:col-span-1">
                    <label className="font-label-md text-slate-400 text-xs uppercase block">Unidades por Impressão</label>
                    <input 
                      type="number" 
                      min="1"
                      step="1"
                      value={unitsPerPrint}
                      onChange={e => setUnitsPerPrint(Number(e.target.value))}
                      className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]"
                    />
                  </div>
                  
                  <div className="space-y-2 lg:col-span-1">
                    <label className="font-label-md text-slate-400 text-xs uppercase block">Tempo de Impressão</label>
                    <div className="flex gap-2">
                      <div className="relative w-full">
                        <input 
                          type="number" 
                          min="0"
                          value={printHours}
                          onChange={e => setPrintHours(Number(e.target.value.replace(",", ".")))}
                          className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 pr-8 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">H</span>
                      </div>
                      <div className="relative w-full">
                        <input 
                          type="number" 
                          min="0"
                          max="59"
                          value={printMinutes}
                          onChange={e => setPrintMinutes(Number(e.target.value.replace(",", ".")))}
                          className="w-full bg-[#121418] border border-[#2B2F36] rounded-lg px-4 py-2.5 pr-8 text-sm text-slate-200 outline-none focus:border-[#0084FF] focus:ring-1 focus:ring-[#0084FF]"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">M</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-[#121418] border border-[#2B2F36] rounded-xl space-y-5">
                  <div className="flex gap-4 items-center mb-2">
                    <label className="font-label-md text-slate-200 text-sm font-bold uppercase">Material</label>
                    <select
                      value={colorMode}
                      onChange={e => setColorMode(e.target.value as 'MONO' | 'MULTI')}
                      className="bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#0084FF]"
                    >
                      <option value="MONO">Mono Cor</option>
                      <option value="MULTI">Multicolor</option>
                    </select>
                  </div>

                  {colorMode === 'MONO' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 uppercase">Filamento</label>
                        <select
                          required
                          value={monoMaterialId || ""}
                          onChange={e => setMonoMaterialId(e.target.value)}
                          className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0084FF]"
                        >
                          <option value="" disabled>Selecione um filamento</option>
                          {materials.map(m => (
                            <option key={m.id} value={m.id}>{m.brand} - {m.name} ({m.color})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 uppercase">Peso Usado (G)</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={monoWeight}
                          onChange={e => setMonoWeight(Number(e.target.value.replace(",", ".")))}
                          className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0084FF]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {multiFilaments.map((f, index) => (
                        <div key={index} className="flex gap-4 items-end">
                          <div className="flex-1 space-y-2">
                            <label className="text-xs text-slate-400 uppercase">Cor {index + 1}</label>
                            <select
                              required
                              value={f.materialId}
                              onChange={e => {
                                const newFils = [...multiFilaments];
                                newFils[index].materialId = e.target.value;
                                setMultiFilaments(newFils);
                              }}
                              className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0084FF]"
                            >
                              <option value="" disabled>Selecione um filamento</option>
                              {materials.map(m => (
                                <option key={m.id} value={m.id}>{m.brand} - {m.name} ({m.color})</option>
                              ))}
                            </select>
                          </div>
                          <div className="w-32 space-y-2">
                            <label className="text-xs text-slate-400 uppercase">Peso (G)</label>
                            <input
                              type="number"
                              min="1"
                              required
                              value={f.weight}
                              onChange={e => {
                                const newFils = [...multiFilaments];
                                newFils[index].weight = Number(e.target.value.replace(",", "."));
                                setMultiFilaments(newFils);
                              }}
                              className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0084FF]"
                            />
                          </div>
                          {multiFilaments.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newFils = [...multiFilaments];
                                newFils.splice(index, 1);
                                setMultiFilaments(newFils);
                              }}
                              className="mb-1 p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setMultiFilaments([...multiFilaments, { materialId: '', weight: 10 }])}
                        className="text-xs font-bold text-[#0084FF] hover:text-[#1d4ed8] flex items-center gap-1 mt-2"
                      >
                        <Plus className="w-3 h-3" /> ADICIONAR COR
                      </button>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-[#2B2F36] flex justify-between items-center text-sm">
                    <span className="text-slate-400">Peso Total: <strong className="text-white">{getTotalWeight()}g</strong></span>
                    <span className="text-slate-400">Custo Material: <strong className="text-white">R$ {safeCost.toFixed(2)}</strong></span>
                  </div>
                </div>

                <div className="border border-[#2563EB]/20 bg-[#0084FF]/5 p-5 rounded-xl">
                  <h3 className="text-xs font-bold text-[#0084FF] uppercase mb-4 tracking-wider">Cálculos Finais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 uppercase block">Custo de Produção</label>
                      <div className="text-lg text-white font-bold font-mono">
                        R$ {currentCost.toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 uppercase block">Venda B2B (Lojistas)</label>
                      <div className="text-lg text-[#0084FF] font-bold font-mono">
                        R$ {currentB2B.toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 uppercase block">Venda B2C (Cliente Final)</label>
                      <div className="text-lg text-[#22C55E] font-bold font-mono">
                        R$ {currentB2C.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-4 pt-3 border-t border-[#2563EB]/10">
                    Custo = Filamento(s) + (Tempo de Impressão × 0,01) + Acessório
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-[#2B2F36]">
                  <button 
                    type="button"
                    onClick={cancelEdit}
                    className="bg-[#1C1F24] border border-[#2B2F36] text-slate-300 hover:bg-[#121418] font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="bg-[#0084FF] hover:bg-[#0084FF]/90 text-white font-bold py-2.5 px-8 rounded-lg text-sm transition-colors shadow-sm"
                  >
                    {editingId ? 'Salvar Alterações' : 'Concluir Cadastro'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <MultipartProductModal 
        isOpen={isMultipartModalOpen} 
        onClose={() => {
          setIsMultipartModalOpen(false);
          setEditingMultipartProduct(null);
        }}
        editingProduct={editingMultipartProduct}
      />
    </div>
  );
};
