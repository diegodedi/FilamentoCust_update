import React, { useState, useEffect } from 'react';
import { Material, Seller } from '../../types';
import { filamentCatalog } from '../../data/filamentCatalog';
import { X } from 'lucide-react';
import { MaterialBrandSelector } from './MaterialBrandSelector';
import { MaterialPricingWeightSection } from './MaterialPricingWeightSection';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMaterial: Material | null;
  sellers: Seller[];
  onSave: (data: Omit<Material, 'id'>, id?: string) => void;
}

export const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  onClose,
  editingMaterial,
  sellers,
  onSave
}) => {
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [initialWeight, setInitialWeight] = useState(1000);
  const [currentWeight, setCurrentWeight] = useState(1000);
  const [spoolPrice, setSpoolPrice] = useState(140.00);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [colorHex, setColorHex] = useState('#FFB800');
  const [selectedSellerId, setSelectedSellerId] = useState('');

  const [customBrand, setCustomBrand] = useState('');
  const [customName, setCustomName] = useState('');
  const [customColor, setCustomColor] = useState('');

  useEffect(() => {
    if (editingMaterial) {
      const brandExists = filamentCatalog.some(b => b.brand === editingMaterial.brand);
      setBrand(brandExists ? editingMaterial.brand : 'Outro');
      if (!brandExists) setCustomBrand(editingMaterial.brand);

      const nameExists = brandExists && filamentCatalog.find(b => b.brand === editingMaterial.brand)?.materials.some(m => m.name === editingMaterial.name);
      setName(nameExists ? editingMaterial.name : 'Outro');
      if (!nameExists) setCustomName(editingMaterial.name);

      const colorExists = nameExists && filamentCatalog.find(b => b.brand === editingMaterial.brand)?.materials.find(m => m.name === editingMaterial.name)?.colors.some(c => c.name === editingMaterial.color);
      setColor(colorExists ? editingMaterial.color : 'Outro');
      if (!colorExists) setCustomColor(editingMaterial.color);

      setInitialWeight(editingMaterial.initialWeight);
      setCurrentWeight(editingMaterial.currentWeight);
      setSpoolPrice(editingMaterial.spoolPrice);
      setPurchaseDate(editingMaterial.purchaseDate);
      setColorHex(editingMaterial.colorHex || '#FFB800');
      setSelectedSellerId(editingMaterial.sellerId || '');
    } else {
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
      setColorHex('#FFB800');
      setSelectedSellerId('');
    }
  }, [editingMaterial, isOpen]);

  if (!isOpen) return null;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBrand = brand === 'Outro' ? customBrand : brand;
    const finalName = name === 'Outro' || brand === 'Outro' ? customName : name;
    const finalColor = color === 'Outro' || name === 'Outro' || brand === 'Outro' ? customColor : color;

    if (!finalName.trim()) return;

    const costPerGram = parseFloat((spoolPrice / initialWeight).toFixed(4));
    let priceHistory = editingMaterial?.priceHistory ? [...editingMaterial.priceHistory] : [];

    const lastEntry = priceHistory[priceHistory.length - 1];
    if (!lastEntry || lastEntry.price !== spoolPrice || lastEntry.date !== purchaseDate || lastEntry.sellerId !== selectedSellerId) {
      priceHistory.push({ date: purchaseDate, price: spoolPrice, sellerId: selectedSellerId || undefined });
      priceHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      if (priceHistory.length > 12) priceHistory = priceHistory.slice(priceHistory.length - 12);
    }

    onSave({
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
    }, editingMaterial?.id);

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#14171E] rounded-2xl border border-[#2B303E] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
        <div className="p-5 border-b border-[#222733] bg-[#11141A] flex justify-between items-center">
          <h3 className="text-base font-bold text-white">
            {editingMaterial ? 'Editar Bobina de Filamento' : 'Registrar Bobina de Filamento'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1A1D25] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <MaterialBrandSelector
            brand={brand}
            name={name}
            color={color}
            colorHex={colorHex}
            customBrand={customBrand}
            customName={customName}
            customColor={customColor}
            onBrandChange={handleBrandChange}
            onNameChange={handleNameChange}
            onColorChange={handleColorChange}
            onColorHexChange={setColorHex}
            setCustomBrand={setCustomBrand}
            setCustomName={setCustomName}
            setCustomColor={setCustomColor}
          />

          <MaterialPricingWeightSection
            sellers={sellers}
            selectedSellerId={selectedSellerId}
            setSelectedSellerId={setSelectedSellerId}
            spoolPrice={spoolPrice}
            setSpoolPrice={setSpoolPrice}
            purchaseDate={purchaseDate}
            setPurchaseDate={setPurchaseDate}
            initialWeight={initialWeight}
            setInitialWeight={setInitialWeight}
            currentWeight={currentWeight}
            setCurrentWeight={setCurrentWeight}
          />

          <div className="flex justify-end gap-2.5 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-[#2B303E] text-slate-400 hover:text-white rounded-xl text-xs font-semibold hover:bg-[#1A1D25] cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-[#FFB800] hover:bg-[#e6a600] text-[#0F1115] font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all"
            >
              {editingMaterial ? 'Salvar Alterações' : 'Confirmar Compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
