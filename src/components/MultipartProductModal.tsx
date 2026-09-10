import React, { useState, useRef, useEffect } from 'react';
import { useDb } from '../context/DbContext';
import { X, Plus, Trash2, Upload, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { ProductPart, ProductFilament, Product } from '../types';

interface MultipartProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct?: Product | null;
}

const DEFAULT_IMAGES = [
  "https://upload.wikimedia.org/wikipedia/commons/7/7b/3DBenchy_created_using_color_mixing_on_an_FDM_printer.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/b/be/3D_Printed_RFB_cell_frame_printed_on_Prusa_i3.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/b/b6/Assembled_Prusa_Mendel.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/4/46/Bobina_PLA.jpg"
];

export const MultipartProductModal: React.FC<MultipartProductModalProps> = ({ isOpen, onClose, editingProduct }) => {
  const { addProduct, updateProduct, materials, products } = useDb();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Instrumento');
  const [accessoryCost, setAccessoryCost] = useState(0);
  const [image, setImage] = useState(DEFAULT_IMAGES[0]);
  const [parts, setParts] = useState<ProductPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Pricing States
  const [b2cMargin, setB2cMargin] = useState(50);
  const [b2cPriceOverride, setB2cPriceOverride] = useState<number | null>(null);
  
  const [b2bMargin, setB2bMargin] = useState(30);
  const [b2bPriceOverride, setB2bPriceOverride] = useState<number | null>(null);
  const [b2bMinQty, setB2bMinQty] = useState(10);
  
  const [marketplacePlatform, setMarketplacePlatform] = useState('Nenhum');
  const [marketplacePriceOverride, setMarketplacePriceOverride] = useState<number | null>(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const DEFAULT_CATEGORIES = [
    "Instrumento",
    "Decoração",
    "Geek/Nerd",
    "Utilidades",
    "Brinquedos",
    "Action Figures",
    "Acessórios",
    "Personalizados"
  ];
  
  const allCategories = Array.from(new Set([
    ...DEFAULT_CATEGORIES,
    ...products.map(p => p.category).filter(Boolean)
  ]));

  useEffect(() => {
    if (editingProduct && editingProduct.isMultipart) {
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setAccessoryCost(editingProduct.accessoryCost || 0);
      setImage(editingProduct.image || DEFAULT_IMAGES[0]);
      setParts(editingProduct.parts || []);
      
      setB2cMargin(editingProduct.b2cMargin ?? 50);
      setB2cPriceOverride(editingProduct.b2cPriceOverride ?? null);
      setB2bMargin(editingProduct.b2bMargin ?? 30);
      setB2bPriceOverride(editingProduct.b2bPriceOverride ?? null);
      setB2bMinQty(editingProduct.b2bMinQty ?? 10);
      setMarketplacePlatform(editingProduct.marketplacePlatform ?? 'Nenhum');
      setMarketplacePriceOverride(editingProduct.marketplacePriceOverride ?? null);
      setIsCustomCategory(false);
    } else {
      setName('');
      setCategory('Instrumento');
      setAccessoryCost(0);
      setImage(DEFAULT_IMAGES[0]);
      setParts([createEmptyPart()]);
      
      setB2cMargin(50);
      setB2cPriceOverride(null);
      setB2bMargin(30);
      setB2bPriceOverride(null);
      setB2bMinQty(10);
      setMarketplacePlatform('Nenhum');
      setMarketplacePriceOverride(null);
      setIsCustomCategory(false);
    }
  }, [isOpen, editingProduct]);

  const createEmptyPart = (): ProductPart => ({
    id: 'part-' + Date.now() + Math.random(),
    name: '',
    quantity: 1,
    weight: 30,
    printTime: 1, // 1 hour
    materialId: materials[0]?.id || '',
    colorMode: 'MONO',
    filaments: [{ materialId: materials[0]?.id || '', weight: 30 }]
  });

  const addPart = () => {
    setParts([...parts, createEmptyPart()]);
  };

  const removePart = (id: string) => {
    setParts(parts.filter(p => p.id !== id));
  };

  const updatePart = (id: string, updates: Partial<ProductPart>) => {
    setParts(parts.map(p => p.id === id ? { ...p, ...updates } : p));
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

  const calculatePartCost = (part: ProductPart) => {
    let cost = 0;
    if (part.colorMode === 'MONO') {
      const mat = materials.find(m => m.id === part.materialId);
      if (mat) {
         let c = parseFloat(String(mat.costPerGram).replace(',','.'));
         if (isNaN(c) || c <= 0) c = parseFloat(String(mat.spoolPrice).replace(',','.')) / parseFloat(String(mat.initialWeight).replace(',','.'));
         cost += (part.weight || 0) * (isNaN(c) ? 0.14 : c);
      }
    } else if (part.filaments) {
      part.filaments.forEach(f => {
         const mat = materials.find(m => m.id === f.materialId);
         if (mat) {
             let c = parseFloat(String(mat.costPerGram).replace(',','.'));
             if (isNaN(c) || c <= 0) c = parseFloat(String(mat.spoolPrice).replace(',','.')) / parseFloat(String(mat.initialWeight).replace(',','.'));
             cost += (f.weight || 0) * (isNaN(c) ? 0.14 : c);
         }
      });
    }
    // Add print time cost for the part
    cost += (part.printTime || 0) * 0.01;
    return cost;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || parts.length === 0) return;

    // Validate parts
    for (const p of parts) {
      if (!p.name.trim()) {
        alert('Todas as partes precisam de um nome.');
        return;
      }
      if (p.colorMode === 'MONO' && !p.materialId) {
        alert(`Selecione o material para a parte: ${p.name}`);
        return;
      }
      if (p.colorMode === 'MULTI' && (!p.filaments || p.filaments.some(f => !f.materialId || f.weight <= 0))) {
        alert(`Preencha todos os filamentos corretamente para a parte: ${p.name}`);
        return;
      }
    }

    // Perform calculations on every render so the UI stays up-to-date
    let totalWeight = 0;
    let totalTime = 0;
    let currentCost = accessoryCost || 0;

    parts.forEach(p => {
      const qty = p.quantity || 1;
      const weightPerPart = p.colorMode === 'MONO' ? p.weight : (p.filaments?.reduce((sum, f) => sum + f.weight, 0) || 0);
      
      totalWeight += weightPerPart * qty;
      totalTime += (p.printTime || 0) * qty;
      currentCost += calculatePartCost(p) * qty;
    });

    const suggestedB2C = currentCost * (1 + (b2cMargin / 100));
    const currentB2C = b2cPriceOverride !== null ? b2cPriceOverride : suggestedB2C;

    const suggestedB2B = currentCost * (1 + (b2bMargin / 100));
    const currentB2B = b2bPriceOverride !== null ? b2bPriceOverride : suggestedB2B;

    let calculatedMarketplacePrice = currentB2C;
    if (marketplacePlatform === 'Mercado Livre Clássico (11.5% + R$6)') {
      calculatedMarketplacePrice = (currentB2C + 6) / (1 - 0.115);
    } else if (marketplacePlatform === 'Mercado Livre Premium (16.5% + R$6)') {
      calculatedMarketplacePrice = (currentB2C + 6) / (1 - 0.165);
    } else if (marketplacePlatform === 'Shopee (20%)') {
      calculatedMarketplacePrice = currentB2C / (1 - 0.20);
    } else if (marketplacePlatform === 'Amazon (15%)') {
      calculatedMarketplacePrice = currentB2C / (1 - 0.15);
    } else if (marketplacePlatform === 'AliExpress (10%)') {
      calculatedMarketplacePrice = currentB2C / (1 - 0.10);
    }
    const finalMarketplacePrice = marketplacePriceOverride !== null ? marketplacePriceOverride : calculatedMarketplacePrice;

    const data: Omit<Product, 'id'> = {
      name,
      category,
      printTime: totalTime,
      weight: totalWeight,
      accessoryCost,
      unitsPerPrint: 1, // Full product is assembled as 1
      colorMode: 'MULTI',
      filaments: [], // We rely on parts now
      costPrice: parseFloat(currentCost.toFixed(2)),
      b2bMargin,
      b2bMinQty,
      b2bPrice: parseFloat(currentB2B.toFixed(2)),
      b2bPriceOverride: b2bPriceOverride !== null ? b2bPriceOverride : null,
      sellPrice: parseFloat(currentB2C.toFixed(2)), // Maps to Suggested Price
      b2cMargin,
      b2cPrice: parseFloat(currentB2C.toFixed(2)),
      b2cPriceOverride: b2cPriceOverride !== null ? b2cPriceOverride : null,
      marketplacePlatform,
      marketplacePrice: parseFloat(finalMarketplacePrice.toFixed(2)),
      marketplacePriceOverride: marketplacePriceOverride !== null ? marketplacePriceOverride : null,
      profit: parseFloat((currentB2C - currentCost).toFixed(2)),
      materialId: parts[0]?.materialId || '',
      image,
      isMultipart: true,
      parts
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, { ...data, id: editingProduct.id });
    } else {
      addProduct(data);
    }
    onClose();
  };

  // Perform calculations for UI rendering
  let currentCost = accessoryCost || 0;
  parts.forEach(p => {
    const qty = p.quantity || 1;
    currentCost += calculatePartCost(p) * qty;
  });

  const suggestedB2C = currentCost * (1 + (b2cMargin / 100));
  const currentB2C = b2cPriceOverride !== null ? b2cPriceOverride : suggestedB2C;

  const suggestedB2B = currentCost * (1 + (b2bMargin / 100));
  const currentB2B = b2bPriceOverride !== null ? b2bPriceOverride : suggestedB2B;

  let calculatedMarketplacePrice = currentB2C;
  if (marketplacePlatform === 'Mercado Livre Clássico (11.5% + R$6)') {
    calculatedMarketplacePrice = (currentB2C + 6) / (1 - 0.115);
  } else if (marketplacePlatform === 'Mercado Livre Premium (16.5% + R$6)') {
    calculatedMarketplacePrice = (currentB2C + 6) / (1 - 0.165);
  } else if (marketplacePlatform === 'Shopee (20%)') {
    calculatedMarketplacePrice = currentB2C / (1 - 0.20);
  } else if (marketplacePlatform === 'Amazon (15%)') {
    calculatedMarketplacePrice = currentB2C / (1 - 0.15);
  } else if (marketplacePlatform === 'AliExpress (10%)') {
    calculatedMarketplacePrice = currentB2C / (1 - 0.10);
  }
  const finalMarketplacePrice = marketplacePriceOverride !== null ? marketplacePriceOverride : calculatedMarketplacePrice;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1C1F24] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#2B2F36] shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-[#2B2F36] sticky top-0 bg-[#1C1F24] z-10">
          <h2 className="font-headline-md text-white">
            {editingProduct ? 'Editar Produto Multpartes' : 'Novo Produto Multpartes'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Produto Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#141518] border border-[#2B2F36] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0084FF]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Categoria *</label>
                  {isCustomCategory ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Digite a nova categoria..."
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full bg-[#141518] border border-[#2B2F36] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0084FF]"
                        required
                        autoFocus
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(false);
                          setCategory(DEFAULT_CATEGORIES[0]);
                        }}
                        className="px-3 bg-[#2B2F36] hover:bg-[#3f444e] rounded-lg text-slate-300 text-sm font-bold transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <select
                      value={category}
                      onChange={e => {
                        if (e.target.value === 'NEW') {
                          setIsCustomCategory(true);
                          setCategory('');
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full bg-[#141518] border border-[#2B2F36] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0084FF]"
                    >
                      {allCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="NEW">+ Nova Categoria...</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Custo de Acessórios (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={accessoryCost}
                    onChange={e => setAccessoryCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141518] border border-[#2B2F36] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0084FF]"
                  />
                </div>
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Imagem do Produto</label>
              <div className="flex gap-4 items-start">
                <div className="w-32 h-32 rounded-lg bg-[#141518] border border-[#2B2F36] overflow-hidden shrink-0">
                  {image ? (
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-xs">Sem foto</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 bg-[#2B2F36] hover:bg-[#3f444e] text-white py-2 rounded-lg transition-colors text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Enviar Foto
                  </button>
                  <div className="text-xs text-slate-400">
                    <p>Ou selecione uma padrão:</p>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {DEFAULT_IMAGES.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setImage(img)}
                          className={`aspect-square rounded overflow-hidden border ${image === img ? 'border-[#0084FF]' : 'border-transparent'}`}
                        >
                          <img src={img} alt="Default" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#2B2F36] pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-sm text-white">Partes do Produto</h3>
              <button
                type="button"
                onClick={addPart}
                className="text-sm bg-[#2B2F36] hover:bg-[#3f444e] text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Adicionar Parte
              </button>
            </div>

            <div className="space-y-6">
              {parts.map((part, index) => (
                <div key={part.id} className="bg-[#141518] p-4 rounded-lg border border-[#2B2F36]">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-white text-sm">Parte {index + 1}</h4>
                    {parts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePart(part.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nome da Parte (Igual ao G-Code)</label>
                      <input
                        type="text"
                        required
                        value={part.name}
                        onChange={e => updatePart(part.id, { name: e.target.value })}
                        className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-3 py-1.5 text-white text-sm focus:border-[#0084FF] outline-none"
                        placeholder="Ex: base_v1.gcode"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1" title="Quantas destas partes formam 1 produto completo">Qtd p/ Produto</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={part.quantity}
                          onChange={e => updatePart(part.id, { quantity: parseInt(e.target.value) || 1 })}
                          className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-3 py-1.5 text-white text-sm focus:border-[#0084FF] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Tempo de Impressão</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <input
                            type="number"
                            min="0"
                            value={Math.floor(part.printTime)}
                            onChange={e => updatePart(part.id, { printTime: parseInt(e.target.value || '0') + ((part.printTime % 1)) })}
                            className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-3 py-1.5 text-white text-sm focus:border-[#0084FF] outline-none"
                            placeholder="Horas"
                          />
                        </div>
                        <span className="text-slate-400 text-sm">h</span>
                        <div className="flex-1">
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={Math.round((part.printTime % 1) * 60)}
                            onChange={e => updatePart(part.id, { printTime: Math.floor(part.printTime) + (parseInt(e.target.value || '0') / 60) })}
                            className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-3 py-1.5 text-white text-sm focus:border-[#0084FF] outline-none"
                            placeholder="Min"
                          />
                        </div>
                        <span className="text-slate-400 text-sm">m</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Filamento Principal</label>
                      <select
                        value={part.materialId}
                        onChange={e => updatePart(part.id, { materialId: e.target.value })}
                        className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-3 py-1.5 text-white text-sm focus:border-[#0084FF] outline-none"
                      >
                        <option value="">Selecione um filamento...</option>
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>{m.name} - {m.color}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs text-slate-400 mb-1">Peso Gasto (g)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      required
                      value={part.weight}
                      onChange={e => updatePart(part.id, { weight: parseFloat(e.target.value) || 0 })}
                      className="w-full md:w-1/2 bg-[#1C1F24] border border-[#2B2F36] rounded px-3 py-1.5 text-white text-sm focus:border-[#0084FF] outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#2563EB]/20 bg-[#0084FF]/5 p-5 rounded-xl space-y-6">
            <h3 className="text-sm font-bold text-[#0084FF] uppercase tracking-wider">Precificação do Produto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* B2C Pricing */}
              <div className="bg-[#121418] border border-[#2B2F36] rounded-lg p-4 space-y-4">
                <h4 className="text-xs font-bold text-[#22C55E] uppercase mb-2">B2C - Consumidor Final</h4>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Margem de Lucro (%)</label>
                  <input
                    type="number"
                    min="0"
                    value={b2cMargin}
                    onChange={e => {
                      setB2cMargin(Number(e.target.value));
                      setB2cPriceOverride(null);
                    }}
                    className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-3 py-2 text-sm text-white focus:border-[#22C55E] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Preço B2C (Editável)</label>
                  <div className="relative w-full">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={b2cPriceOverride !== null ? b2cPriceOverride : parseFloat(suggestedB2C.toFixed(2))}
                      onChange={e => setB2cPriceOverride(e.target.value === '' ? null : Number(e.target.value))}
                      className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-3 py-2 text-sm text-[#22C55E] font-bold focus:border-[#22C55E] outline-none pr-10"
                    />
                    {b2cPriceOverride !== null && (
                      <button
                        type="button"
                        onClick={() => setB2cPriceOverride(null)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#22C55E] transition-colors"
                        title="Restaurar padrão sugerido"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* B2B Pricing */}
              <div className="bg-[#121418] border border-[#2B2F36] rounded-lg p-4 space-y-4">
                <h4 className="text-xs font-bold text-[#0084FF] uppercase mb-2">B2B - Para Empresas</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Margem (%)</label>
                    <input
                      type="number"
                      min="0"
                      value={b2bMargin}
                      onChange={e => {
                        setB2bMargin(Number(e.target.value));
                        setB2bPriceOverride(null);
                      }}
                      className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-3 py-2 text-sm text-white focus:border-[#0084FF] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Qtd Mínima</label>
                    <input
                      type="number"
                      min="1"
                      value={b2bMinQty}
                      onChange={e => setB2bMinQty(Number(e.target.value))}
                      className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-3 py-2 text-sm text-white focus:border-[#0084FF] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Preço B2B (Editável)</label>
                  <div className="relative w-full">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={b2bPriceOverride !== null ? b2bPriceOverride : parseFloat(suggestedB2B.toFixed(2))}
                      onChange={e => setB2bPriceOverride(e.target.value === '' ? null : Number(e.target.value))}
                      className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-3 py-2 text-sm text-[#0084FF] font-bold focus:border-[#0084FF] outline-none pr-10"
                    />
                    {b2bPriceOverride !== null && (
                      <button
                        type="button"
                        onClick={() => setB2bPriceOverride(null)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#0084FF] transition-colors"
                        title="Restaurar padrão sugerido"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Marketplaces */}
            <div className="bg-[#121418] border border-[#2B2F36] rounded-lg p-4">
              <h4 className="text-xs font-bold text-[#F59E0B] uppercase mb-4">Markup Inverso para Marketplaces</h4>
              <p className="text-[10px] text-slate-400 mb-3">Selecione uma plataforma para saber por quanto você deve anunciar o produto nela, para que após as taxas, você ainda receba exatamente o valor definido no B2C acima (R$ {currentB2C.toFixed(2)}).</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Plataforma</label>
                  <select
                    value={marketplacePlatform}
                    onChange={e => {
                      setMarketplacePlatform(e.target.value);
                      setMarketplacePriceOverride(null);
                    }}
                    className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded px-3 py-2 text-sm text-white focus:border-[#F59E0B] outline-none"
                  >
                    <option value="Nenhum">Nenhum</option>
                    <option value="Mercado Livre Clássico (11.5% + R$6)">Mercado Livre Clássico (11.5% + R$6)</option>
                    <option value="Mercado Livre Premium (16.5% + R$6)">Mercado Livre Premium (16.5% + R$6)</option>
                    <option value="Shopee (20%)">Shopee (20%)</option>
                    <option value="Amazon (15%)">Amazon (15%)</option>
                    <option value="AliExpress (10%)">AliExpress (10%)</option>
                  </select>
                </div>
                {marketplacePlatform !== 'Nenhum' && (
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Preço Plataforma (Editável)</label>
                    <div className="relative w-full">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={marketplacePriceOverride !== null ? marketplacePriceOverride : parseFloat(calculatedMarketplacePrice.toFixed(2))}
                        onChange={e => setMarketplacePriceOverride(e.target.value === '' ? null : Number(e.target.value))}
                        className="w-full bg-[#1C1F24] border border-[#F59E0B]/50 rounded px-3 py-2 text-lg text-[#F59E0B] font-bold focus:border-[#F59E0B] outline-none pr-10"
                      />
                      {marketplacePriceOverride !== null && (
                        <button
                          type="button"
                          onClick={() => setMarketplacePriceOverride(null)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#F59E0B] transition-colors"
                          title="Restaurar padrão sugerido"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 font-mono mt-4 pt-3 border-t border-[#2563EB]/10">
              <span>Custo Total de Produção: <strong className="text-white">R$ {currentCost.toFixed(2)}</strong></span>
            </div>
          </div>

          <div className="pt-6 border-t border-[#2B2F36] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#1C1F24] border border-[#2B2F36] text-slate-300 hover:bg-[#121418] font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#0084FF] hover:bg-[#0084FF]/90 text-white font-bold py-2.5 px-8 rounded-lg text-sm transition-colors shadow-sm"
            >
              Salvar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
