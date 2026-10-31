import React, { useState, useEffect } from 'react';
import { X, Sparkles, FileText, Calculator, Layers, Box } from 'lucide-react';
import { Product } from '../types';
import { MlListingTab } from './mercadolivre/MlListingTab';
import { MlPricingAndSuppliesTab } from './mercadolivre/MlPricingAndSuppliesTab';
import { MlKitsAndLeadTimeTab } from './mercadolivre/MlKitsAndLeadTimeTab';
import { MlShippingAndFlyerTab } from './mercadolivre/MlShippingAndFlyerTab';

interface MercadoLivreModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

type MlTabKey = 'LISTING' | 'PRICING' | 'KITS' | 'SHIPPING';

/**
 * Central Completa de Preparação e Precificação para o Mercado Livre.
 */
export const MercadoLivreModal: React.FC<MercadoLivreModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const [activeTab, setActiveTab] = useState<MlTabKey>('LISTING');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(product);

  useEffect(() => {
    setCurrentProduct(product);
    if (product) setActiveTab('LISTING');
  }, [product]);

  if (!isOpen || !currentProduct) return null;

  const tabs: { key: MlTabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'LISTING', label: '1. Anúncio & SEO', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'PRICING', label: '2. Taxas, Frete R$79 & Embalagem', icon: <Calculator className="w-3.5 h-3.5" /> },
    { key: 'KITS', label: '3. Kits & Prazo (Lead Time)', icon: <Layers className="w-3.5 h-3.5" /> },
    { key: 'SHIPPING', label: '4. Envio & Cartão Pós-Venda', icon: <Box className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-2xl shadow-2xl w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Mercado Livre */}
        <div className="px-6 py-4 bg-[#FFE600] text-[#121418] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#121418] text-[#FFE600] flex items-center justify-center font-black text-lg shadow-sm">
              ML
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight text-slate-900 flex items-center gap-1.5">
                Central Mercado Livre & E-Commerce 3D
                <Sparkles className="w-4 h-4 text-amber-700" />
              </h2>
              <p className="text-xs text-slate-800 font-medium">
                {currentProduct.name} • {currentProduct.materialType || 'PLA'} • {currentProduct.weight}g
                {currentProduct.leadTimeDays ? ` • Prazo: ${currentProduct.leadTimeDays}d` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-800 hover:bg-black/10 rounded-full transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Abas */}
        <div className="px-4 sm:px-6 pt-3 bg-[#14171D] border-b border-[#2B2F36] flex gap-1.5 overflow-x-auto shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1C1F24] text-[#FFE600] border-[#FFE600]'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-[#1C1F24]/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Corpo da Aba Ativa */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'LISTING' && <MlListingTab product={currentProduct} />}
          {activeTab === 'PRICING' && (
            <MlPricingAndSuppliesTab product={currentProduct} onProductUpdated={setCurrentProduct} />
          )}
          {activeTab === 'KITS' && (
            <MlKitsAndLeadTimeTab product={currentProduct} onProductUpdated={setCurrentProduct} />
          )}
          {activeTab === 'SHIPPING' && (
            <MlShippingAndFlyerTab product={currentProduct} onProductUpdated={setCurrentProduct} />
          )}
        </div>

        {/* Rodapé de Resumo Rápido */}
        <div className="px-6 py-3 bg-[#121418] border-t border-[#2B2F36] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span>
              Custo Peça: <strong className="text-slate-200 font-mono">R$ {currentProduct.costPrice.toFixed(2)}</strong>
            </span>
            {currentProduct.packagingCost !== undefined && currentProduct.packagingCost > 0 && (
              <span>
                Embalagem: <strong className="text-amber-400 font-mono">R$ {currentProduct.packagingCost.toFixed(2)}</strong>
              </span>
            )}
            <span>
              Preço ML:{' '}
              <strong className="text-[#FFE600] font-mono">
                R$ {(currentProduct.marketplacePrice || currentProduct.b2cPrice || currentProduct.sellPrice).toFixed(2)}
              </strong>
            </span>
            {currentProduct.mlNetProfit !== undefined && (
              <span>
                Lucro Líquido ML:{' '}
                <strong className="text-emerald-400 font-mono">R$ {currentProduct.mlNetProfit.toFixed(2)}</strong>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#252A37] hover:bg-[#2B303E] text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
          >
            Fechar Central
          </button>
        </div>
      </div>
    </div>
  );
};
