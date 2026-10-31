import React, { useState, useEffect } from 'react';
import { useDb } from '../../context/DbContext';
import { X } from 'lucide-react';
import { Product, ProductFilament } from '../../types';
import { SingleProductFieldsSection } from './SingleProductFieldsSection';
import { useProductPricingState, ProductPricingBlock } from './ProductPricingController';

interface SingleProductModalProps {
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
 * Modal para criação e edição de Produto Único (Mono ou Multicolor) com precificação B2C/B2B integrada.
 */
export const SingleProductModal: React.FC<SingleProductModalProps> = ({
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
  const [printHours, setPrintHours] = useState(5);
  const [printMinutes, setPrintMinutes] = useState(0);
  const [accessoryCost, setAccessoryCost] = useState(0);
  const [unitsPerPrint, setUnitsPerPrint] = useState(1);
  const [image, setImage] = useState(DEFAULT_IMAGES[0]);

  const [colorMode, setColorMode] = useState<'MONO' | 'MULTI'>('MONO');
  const [monoMaterialId, setMonoMaterialId] = useState('');
  const [monoWeight, setMonoWeight] = useState(30);
  const [multiFilaments, setMultiFilaments] = useState<ProductFilament[]>([{ materialId: '', weight: 10 }]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...products.map(p => p.category).filter(Boolean)]));

  const getTotalWeight = () => {
    if (colorMode === 'MONO') return Number(monoWeight) || 0;
    return multiFilaments.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0);
  };

  const getFilamentCost = () => {
    const parseNum = (val: any) => {
      if (val === undefined || val === null) return 0;
      const n = parseFloat(String(val).replace(',', '.'));
      return isNaN(n) ? 0 : n;
    };

    const getUnitCost = (matId: string) => {
      const mat = materials.find(m => String(m.id).trim() === String(matId).trim());
      if (!mat) return 0.14;
      let c = parseNum(mat.costPerGram);
      if (c <= 0) {
        const p = parseNum(mat.spoolPrice);
        const w = parseNum(mat.initialWeight);
        c = (w > 0 && p > 0) ? p / w : 0.14;
      }
      return c;
    };

    if (colorMode === 'MONO') {
      return (Number(monoWeight) || 0) * getUnitCost(monoMaterialId);
    }
    return multiFilaments.reduce((acc, curr) => acc + ((Number(curr.weight) || 0) * getUnitCost(curr.materialId)), 0);
  };

  const totalPrintTime = (Number(printHours) || 0) + ((Number(printMinutes) || 0) / 60);
  const rawCost = getFilamentCost();
  const safeCost = typeof rawCost === 'number' && !isNaN(rawCost) ? rawCost : 0;
  const productionCost = safeCost + (totalPrintTime * 0.01) + (Number(accessoryCost) || 0);

  const totalWeight = getTotalWeight();
  const pricing = useProductPricingState(productionCost, totalWeight);

  useEffect(() => {
    if (editingProduct && !editingProduct.isMultipart) {
      setName(editingProduct.name);
      setDimensions(editingProduct.dimensions || '');
      setCategory(editingProduct.category);
      setMaterialType(editingProduct.materialType || 'PLA');
      setPrintHours(Math.floor(editingProduct.printTime));
      setPrintMinutes(Math.round((editingProduct.printTime % 1) * 60));
      setAccessoryCost(editingProduct.accessoryCost || 0);
      setUnitsPerPrint(editingProduct.unitsPerPrint || 1);
      setImage(editingProduct.image || DEFAULT_IMAGES[0]);

      if (editingProduct.colorMode === 'MULTI' && editingProduct.filaments && editingProduct.filaments.length > 0) {
        setColorMode('MULTI');
        setMultiFilaments(editingProduct.filaments);
      } else {
        setColorMode('MONO');
        setMonoMaterialId(editingProduct.filaments?.[0]?.materialId || editingProduct.materialId);
        setMonoWeight(editingProduct.filaments?.[0]?.weight || editingProduct.weight);
      }

      setIsCustomCategory(false);
      pricing.loadFromProduct(editingProduct);
    } else {
      setName('');
      setDimensions('');
      setCategory('Instrumento');
      setMaterialType('PLA');
      setPrintHours(5);
      setPrintMinutes(0);
      setAccessoryCost(0);
      setImage(DEFAULT_IMAGES[0]);
      setColorMode('MONO');
      setMonoMaterialId(materials.length > 0 ? materials[0].id : '');
      setMonoWeight(30);
      setMultiFilaments([{ materialId: materials.length > 0 ? materials[0].id : '', weight: 10 }]);
      setUnitsPerPrint(1);
      setIsCustomCategory(false);
      pricing.resetPricing();
    }
  }, [isOpen, editingProduct]);

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
    if (!name.trim()) return;

    let finalFilaments: ProductFilament[] = [];
    if (colorMode === 'MONO') {
      if (!monoMaterialId) { alert("Selecione um filamento."); return; }
      finalFilaments = [{ materialId: monoMaterialId, weight: monoWeight }];
    } else {
      if (multiFilaments.some(f => !f.materialId || f.weight <= 0)) {
        alert("Preencha todos os filamentos corretamente."); return;
      }
      finalFilaments = multiFilaments;
    }

    const data: Omit<Product, 'id'> = {
      name,
      dimensions: dimensions.trim() || undefined,
      category,
      printTime: totalPrintTime,
      weight: totalWeight,
      accessoryCost,
      unitsPerPrint,
      colorMode,
      filaments: finalFilaments,
      ...pricing.getPricingPayload(),
      materialId: finalFilaments[0]?.materialId || '',
      materialType,
      image
    };

    if (editingProduct) updateProduct(editingProduct.id, { ...data, id: editingProduct.id });
    else addProduct(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1C1F24] rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col border border-[#2B2F36]">
        <div className="p-6 border-b border-[#2B2F36] flex justify-between items-center bg-[#121418] sticky top-0 z-10">
          <h2 className="font-headline-md text-white m-0">
            {editingProduct ? 'Editar Produto' : 'Cadastrar Produto'}
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-300 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <SingleProductFieldsSection
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
              unitsPerPrint={unitsPerPrint}
              onChangeUnitsPerPrint={(val) => { setUnitsPerPrint(val); pricing.clearPriceOverrides(); }}
              printHours={printHours}
              onChangePrintHours={(val) => { setPrintHours(val); pricing.clearPriceOverrides(); }}
              printMinutes={printMinutes}
              onChangePrintMinutes={(val) => { setPrintMinutes(val); pricing.clearPriceOverrides(); }}
              image={image}
              setImage={setImage}
              defaultImages={DEFAULT_IMAGES}
              onImageUpload={handleImageUpload}
              colorMode={colorMode}
              onChangeColorMode={(val) => { setColorMode(val); pricing.clearPriceOverrides(); }}
              monoMaterialId={monoMaterialId}
              onChangeMonoMaterialId={(val) => { setMonoMaterialId(val); pricing.clearPriceOverrides(); }}
              monoWeight={monoWeight}
              onChangeMonoWeight={(val) => { setMonoWeight(val); pricing.clearPriceOverrides(); }}
              multiFilaments={multiFilaments}
              onChangeMultiFilaments={(val) => { setMultiFilaments(val); pricing.clearPriceOverrides(); }}
              materials={materials}
              totalWeight={totalWeight}
              filamentCost={safeCost}
            />

            <ProductPricingBlock
              dimensions={dimensions}
              weight={totalWeight}
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
    </div>
  );
};

