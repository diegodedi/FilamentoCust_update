import React, { useState, useRef, useEffect } from 'react';
import { useDb } from '../context/DbContext';
import { X, Image as ImageIcon, Upload, Plus, Trash2 } from 'lucide-react';
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
  const { addProduct, updateProduct, materials } = useDb();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Instrumento');
  const [accessoryCost, setAccessoryCost] = useState(0);
  const [image, setImage] = useState(DEFAULT_IMAGES[0]);
  const [parts, setParts] = useState<ProductPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingProduct && editingProduct.isMultipart) {
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setAccessoryCost(editingProduct.accessoryCost || 0);
      setImage(editingProduct.image || DEFAULT_IMAGES[0]);
      setParts(editingProduct.parts || []);
    } else {
      setName('');
      setCategory('Instrumento');
      setAccessoryCost(0);
      setImage(DEFAULT_IMAGES[0]);
      setParts([createEmptyPart()]);
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

    const currentB2B = currentCost * 4;
    const currentB2C = currentB2B * 2;

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
      b2bPrice: parseFloat(currentB2B.toFixed(2)),
      sellPrice: parseFloat(currentB2C.toFixed(2)),
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
  const currentB2B = currentCost * 4;
  const currentB2C = currentB2B * 2;

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
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#141518] border border-[#2B2F36] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0084FF]"
                  >
                    <option>Instrumento</option>
                    <option>Action Figure</option>
                    <option>Utilitário</option>
                    <option>Decoração</option>
                    <option>Outros</option>
                  </select>
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
