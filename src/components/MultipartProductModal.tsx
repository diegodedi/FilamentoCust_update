import React, { useState, useEffect } from 'react';
import { useDb } from '../context/DbContext';
import { X } from 'lucide-react';
import { ProductPart, Product } from '../types';
import { MultipartPartsEditor } from './products/MultipartPartsEditor';
import { useProductPricingState, ProductPricingBlock } from './products/ProductPricingController';

interface MultipartProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct?: Product | null;
  onOpenMercadoLivre?: (product: Product) => void;
}

const DEFAULT_IMAGES = [
  "https://upload.wikimedia.org/wikipedia/commons/7/7b/3DBenchy_created_using_color_mixing_on_an_FDM_printer.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/b/be/3D_Printed_RFB_cell_frame_printed_on_Prusa_i3.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/b/b6/Assembled_Prusa_Mendel.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/4/46/Bobina_PLA.jpg"
];

const DEFAULT_CATEGORIES = [
  "Instrumento", "Decoração", "Geek/Nerd", "Utilidades",
  "Brinquedos", "Action Figures", "Acessórios", "Personalizados"
];

/**
 * Modal de criação e edição de Produtos Multipartes com precificação B2C/B2B integrada.
 */
export const MultipartProductModal: React.FC<MultipartProductModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
  onOpenMercadoLivre
}) => {
  const { addProduct, updateProduct, materials, products } = useDb();

  const [name, setName] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [category, setCategory] = useState('Instrumento');
  const [materialType, setMaterialType] = useState('PLA');
  const [accessoryCost, setAccessoryCost] = useState(0);
  const [image, setImage] = useState(DEFAULT_IMAGES[0]);
  const [parts, setParts] = useState<ProductPart[]>([]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...products.map(p => p.category).filter(Boolean)]));

  const calculatePartCost = (part: ProductPart) => {
    let cost = 0;
    const getMatCost = (matId: string) => {
      const mat = materials.find(m => m.id === matId);
      if (!mat) return 0;
      let c = parseFloat(String(mat.costPerGram).replace(',', '.'));
      if (isNaN(c) || c <= 0) c = parseFloat(String(mat.spoolPrice).replace(',', '.')) / parseFloat(String(mat.initialWeight).replace(',', '.'));
      return isNaN(c) ? 0.14 : c;
    };
    if (part.colorMode === 'MONO') {
      cost += (part.weight || 0) * getMatCost(part.materialId);
    } else if (part.filaments) {
      part.filaments.forEach(f => { cost += (f.weight || 0) * getMatCost(f.materialId); });
    }
    return cost + (part.printTime || 0) * 0.01;
  };

  let renderWeight = 0;
  let renderTime = 0;
  let currentCost = accessoryCost || 0;
  parts.forEach(p => {
    const qty = p.quantity || 1;
    const weightPerPart = p.colorMode === 'MONO'
      ? (Number(p.weight) || 0)
      : (p.filaments?.reduce((sum, f) => sum + (Number(f.weight) || 0), 0) || 0);
    renderWeight += weightPerPart * qty;
    renderTime += (Number(p.printTime) || 0) * qty;
    currentCost += calculatePartCost(p) * qty;
  });

  const productionCost = currentCost;
  const pricing = useProductPricingState(productionCost, renderWeight);

  const createEmptyPart = (): ProductPart => ({
    id: 'part-' + Date.now() + Math.random(),
    name: '',
    quantity: 1,
    weight: 30,
    printTime: 1,
    materialId: materials[0]?.id || '',
    colorMode: 'MONO',
    filaments: [{ materialId: materials[0]?.id || '', weight: 30 }]
  });

  useEffect(() => {
    if (editingProduct && editingProduct.isMultipart) {
      setName(editingProduct.name);
      setDimensions(editingProduct.dimensions || '');
      setCategory(editingProduct.category);
      setMaterialType(editingProduct.materialType || 'PLA');
      setAccessoryCost(editingProduct.accessoryCost || 0);
      setImage(editingProduct.image || DEFAULT_IMAGES[0]);
      setParts(editingProduct.parts || []);
      setIsCustomCategory(false);
      pricing.loadFromProduct(editingProduct);
    } else {
      setName('');
      setDimensions('');
      setCategory('Instrumento');
      setMaterialType('PLA');
      setAccessoryCost(0);
      setImage(DEFAULT_IMAGES[0]);
      setParts([createEmptyPart()]);
      setIsCustomCategory(false);
      pricing.resetPricing();
    }
  }, [isOpen, editingProduct]);

  const addPart = () => { setParts([...parts, createEmptyPart()]); pricing.clearPriceOverrides(); };
  const removePart = (id: string) => { setParts(parts.filter(p => p.id !== id)); pricing.clearPriceOverrides(); };
  const updatePart = (id: string, updates: Partial<ProductPart>) => {
    setParts(parts.map(p => p.id === id ? { ...p, ...updates } : p));
    pricing.clearPriceOverrides();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || parts.length === 0) return;

    for (const p of parts) {
      if (!p.name.trim()) { alert('Todas as partes precisam de um nome.'); return; }
      if (p.colorMode === 'MONO' && !p.materialId) { alert(`Selecione o material para a parte: ${p.name}`); return; }
      if (p.colorMode === 'MULTI' && (!p.filaments || p.filaments.some(f => !f.materialId || f.weight <= 0))) {
        alert(`Preencha todos os filamentos corretamente para a parte: ${p.name}`); return;
      }
    }

    const data: Omit<Product, 'id'> = {
      name,
      dimensions: dimensions.trim() || undefined,
      category,
      printTime: renderTime,
      weight: renderWeight,
      accessoryCost,
      unitsPerPrint: 1,
      colorMode: 'MULTI',
      filaments: [],
      ...pricing.getPricingPayload(),
      materialId: parts[0]?.materialId || '',
      materialType,
      image,
      isMultipart: true,
      parts
    };

    if (editingProduct) updateProduct(editingProduct.id, { ...data, id: editingProduct.id });
    else addProduct(data);
    onClose();
  };

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
          <MultipartPartsEditor
            name={name}
            setName={setName}
            dimensions={dimensions}
            setDimensions={setDimensions}
            category={category}
            setCategory={setCategory}
            isCustomCategory={isCustomCategory}
            setIsCustomCategory={setIsCustomCategory}
            allCategories={allCategories}
            defaultCategories={DEFAULT_CATEGORIES}
            materialType={materialType}
            setMaterialType={setMaterialType}
            accessoryCost={accessoryCost}
            onChangeAccessoryCost={(val) => { setAccessoryCost(val); pricing.clearPriceOverrides(); }}
            image={image}
            setImage={setImage}
            defaultImages={DEFAULT_IMAGES}
            onImageUpload={handleImageUpload}
            parts={parts}
            onAddPart={addPart}
            onRemovePart={removePart}
            onUpdatePart={updatePart}
            materials={materials}
            renderTime={renderTime}
            renderWeight={renderWeight}
            productionCost={productionCost}
          />

          <ProductPricingBlock
            dimensions={dimensions}
            weight={renderWeight}
            productionCost={productionCost}
            pricing={pricing}
          />

          <div className="pt-6 border-t border-[#2B2F36] flex justify-end items-center gap-3">
            {editingProduct && onOpenMercadoLivre && (
              <button
                type="button"
                onClick={() => onOpenMercadoLivre(editingProduct)}
                className="bg-[#FFE600]/15 hover:bg-[#FFE600]/25 text-[#FFE600] border border-[#FFE600]/30 font-bold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2 mr-auto cursor-pointer"
                title="Abrir Central Mercado Livre (Taxas, Frete R$79, Embalagem, Kits e Anúncio)"
              >
                <span className="w-4 h-4 rounded bg-[#FFE600] text-slate-950 flex items-center justify-center font-black text-[9px]">ML</span>
                <span>Central Mercado Livre & Taxas</span>
              </button>
            )}
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
