import React, { useState } from 'react';
import { Product } from '../../types';
import { ProductPackagingAndMlSection } from './ProductPackagingAndMlSection';
import { ProductFinalPricingCards } from './ProductFinalPricingCards';
import {
  MlListingType,
  MlPricingInput,
  ML_SAFE_UNDER_THRESHOLD_PRICE,
  calculateSuggestedMlPrice,
  calculateSuggestedB2bPrice,
  calculateMercadoLivreBreakdown
} from '../../utils/mercadoLivrePricing';

/**
 * Hook compartilhado para gerenciar estados e cálculos de precificação B2C/B2B e Mercado Livre
 * tanto no cadastro de Produto Único quanto no Produto Multipartes (DRY).
 */
export function useProductPricingState(productionCost: number, totalWeight: number) {
  const [b2cMargin, setB2cMargin] = useState(50);
  const [b2cPriceOverride, setB2cPriceOverride] = useState<number | null>(null);
  const [b2bMargin, setB2bMargin] = useState(30);
  const [b2bPriceOverride, setB2bPriceOverride] = useState<number | null>(null);
  const [b2bMinQty, setB2bMinQty] = useState(10);

  const [marketplacePlatform, setMarketplacePlatform] = useState('Mercado Livre Clássico (11.5% + R$6)');
  const [selectedSupplyId, setSelectedSupplyId] = useState('');
  const [packagingCost, setPackagingCost] = useState(0);
  const [wastePercentage, setWastePercentage] = useState(5);
  const [taxPercent, setTaxPercent] = useState(4);
  const [reputation, setReputation] = useState<'VERDE' | 'AMARELA' | 'SEM_REPUTACAO'>('VERDE');
  const [packageDimensions, setPackageDimensions] = useState('');
  const [packageWeight, setPackageWeight] = useState(0);

  const clearPriceOverrides = () => {
    setB2cPriceOverride(null);
    setB2bPriceOverride(null);
  };

  const resetPricing = (defaultPlatform = 'Mercado Livre Clássico (11.5% + R$6)') => {
    setB2cMargin(50);
    setB2cPriceOverride(null);
    setB2bMargin(30);
    setB2bPriceOverride(null);
    setB2bMinQty(10);
    setMarketplacePlatform(defaultPlatform);
    setSelectedSupplyId('');
    setPackagingCost(0);
    setWastePercentage(5);
    setTaxPercent(4);
    setReputation('VERDE');
    setPackageDimensions('');
    setPackageWeight(0);
  };

  const loadFromProduct = (p: Product) => {
    setB2cMargin(p.b2cMargin ?? 50);
    setB2cPriceOverride(p.b2cPriceOverride ?? null);
    setB2bMargin(p.b2bMargin ?? 30);
    setB2bPriceOverride(p.b2bPriceOverride ?? null);
    setB2bMinQty(p.b2bMinQty ?? 10);
    setMarketplacePlatform(p.marketplacePlatform ?? 'Mercado Livre Clássico (11.5% + R$6)');
    setSelectedSupplyId(p.packagingItems?.[0]?.supplyId || '');
    setPackagingCost(p.packagingCost ?? 0);
    setWastePercentage(p.wastePercentage ?? 5);
    setTaxPercent(p.mlTaxPercent ?? 4);
    setReputation(p.mlReputation || 'VERDE');
    setPackageDimensions(p.packageDimensions || '');
    setPackageWeight(p.packageWeight || Math.round(p.weight + 70));
  };

  const baseCost = productionCost + (Number(packagingCost) || 0);
  const listingType: MlListingType = marketplacePlatform.includes('Premium') ? 'PREMIUM' : 'CLASSICO';
  const effectivePackageWeight = packageWeight || Math.round(totalWeight + 70);

  const pricingInput: MlPricingInput = {
    salePrice: 0,
    baseProductionCost: productionCost,
    wastePercentage,
    packagingCost,
    packageWeightGrams: effectivePackageWeight,
    listingType,
    taxPercent,
    reputation
  };

  const prodCostWithWaste = productionCost * (1 + wastePercentage / 100);
  const directUnitCost = prodCostWithWaste + packagingCost;
  const targetProfitB2C = directUnitCost * (b2cMargin / 100);

  const suggestedB2C = calculateSuggestedMlPrice(pricingInput, targetProfitB2C);
  const currentB2C = b2cPriceOverride !== null ? b2cPriceOverride : suggestedB2C;

  const b2bCalc = calculateSuggestedB2bPrice(pricingInput, b2bMinQty, b2bMargin);
  const suggestedB2B = b2bCalc.unitPrice;
  const currentB2B = b2bPriceOverride !== null ? b2bPriceOverride : suggestedB2B;

  const b2cBreakdown = calculateMercadoLivreBreakdown({ ...pricingInput, salePrice: currentB2C });
  const b2bUnitProfit = b2bPriceOverride !== null ? Math.max(0, currentB2B - directUnitCost) : b2bCalc.unitProfit;
  const b2bBatchProfit = parseFloat((b2bUnitProfit * b2bMinQty).toFixed(2));

  const getPricingPayload = () => ({
    costPrice: parseFloat(baseCost.toFixed(2)),
    b2bMargin,
    b2bMinQty,
    b2bPrice: parseFloat(currentB2B.toFixed(2)),
    b2bPriceOverride: b2bPriceOverride !== null ? b2bPriceOverride : null,
    sellPrice: parseFloat(currentB2C.toFixed(2)),
    b2cMargin,
    b2cPrice: parseFloat(currentB2C.toFixed(2)),
    b2cPriceOverride: b2cPriceOverride !== null ? b2cPriceOverride : null,
    marketplacePlatform,
    marketplacePrice: parseFloat(currentB2C.toFixed(2)),
    marketplacePriceOverride: b2cPriceOverride !== null ? b2cPriceOverride : null,
    packagingCost: parseFloat(packagingCost.toFixed(2)),
    packagingItems: selectedSupplyId && selectedSupplyId !== 'NONE' ? [{ supplyId: selectedSupplyId, quantity: 1 }] : [],
    wastePercentage,
    mlTaxPercent: taxPercent,
    mlReputation: reputation,
    packageDimensions: packageDimensions.trim() || undefined,
    packageWeight: effectivePackageWeight,
    profit: parseFloat(b2cBreakdown.netProfit.toFixed(2))
  });

  return {
    b2cMargin, setB2cMargin,
    b2cPriceOverride, setB2cPriceOverride,
    b2bMargin, setB2bMargin,
    b2bPriceOverride, setB2bPriceOverride,
    b2bMinQty, setB2bMinQty,
    marketplacePlatform, setMarketplacePlatform,
    selectedSupplyId, setSelectedSupplyId,
    packagingCost, setPackagingCost,
    wastePercentage, setWastePercentage,
    taxPercent, setTaxPercent,
    reputation, setReputation,
    packageDimensions, setPackageDimensions,
    packageWeight, setPackageWeight,
    baseCost,
    productionCost,
    currentB2C,
    suggestedB2C,
    currentB2B,
    suggestedB2B,
    b2cBreakdown,
    b2bUnitProfit,
    b2bBatchProfit,
    clearPriceOverrides,
    resetPricing,
    loadFromProduct,
    getPricingPayload
  };
}

export type ProductPricingState = ReturnType<typeof useProductPricingState>;

interface ProductPricingBlockProps {
  dimensions: string;
  weight: number;
  productionCost: number;
  pricing: ProductPricingState;
}

/**
 * Bloco visual completo de Custos & Precificação (Embalagem + Mercado Livre + Cards B2C/B2B).
 */
export const ProductPricingBlock: React.FC<ProductPricingBlockProps> = ({
  dimensions,
  weight,
  productionCost,
  pricing
}) => {
  return (
    <div className="border border-[#2563EB]/20 bg-[#0084FF]/5 p-5 rounded-xl space-y-6">
      <h3 className="text-sm font-bold text-[#0084FF] uppercase tracking-wider">
        Custos & Precificação do Produto
      </h3>

      <ProductPackagingAndMlSection
        dimensions={dimensions}
        weight={weight}
        costPrice={productionCost}
        b2cPrice={pricing.currentB2C}
        marketplacePlatform={pricing.marketplacePlatform}
        setMarketplacePlatform={pricing.setMarketplacePlatform}
        selectedSupplyId={pricing.selectedSupplyId}
        setSelectedSupplyId={pricing.setSelectedSupplyId}
        packagingCost={pricing.packagingCost}
        setPackagingCost={pricing.setPackagingCost}
        wastePercentage={pricing.wastePercentage}
        setWastePercentage={pricing.setWastePercentage}
        taxPercent={pricing.taxPercent}
        setTaxPercent={pricing.setTaxPercent}
        reputation={pricing.reputation}
        setReputation={pricing.setReputation}
        packageDimensions={pricing.packageDimensions}
        setPackageDimensions={pricing.setPackageDimensions}
        packageWeight={pricing.packageWeight}
        setPackageWeight={pricing.setPackageWeight}
        breakdown={pricing.b2cBreakdown}
      />

      <ProductFinalPricingCards
        baseCost={pricing.baseCost}
        productionCost={productionCost}
        packagingCost={pricing.packagingCost}
        b2cMargin={pricing.b2cMargin}
        setB2cMargin={pricing.setB2cMargin}
        b2cPriceOverride={pricing.b2cPriceOverride}
        setB2cPriceOverride={pricing.setB2cPriceOverride}
        currentB2C={pricing.currentB2C}
        suggestedB2C={pricing.suggestedB2C}
        b2cProfit={pricing.b2cBreakdown.netProfit}
        b2cNetMarginPercent={pricing.b2cBreakdown.netMarginPercent}
        b2bMargin={pricing.b2bMargin}
        setB2bMargin={pricing.setB2bMargin}
        b2bMinQty={pricing.b2bMinQty}
        setB2bMinQty={pricing.setB2bMinQty}
        b2bPriceOverride={pricing.b2bPriceOverride}
        setB2bPriceOverride={pricing.setB2bPriceOverride}
        currentB2B={pricing.currentB2B}
        suggestedB2B={pricing.suggestedB2B}
        b2bUnitProfit={pricing.b2bUnitProfit}
        b2bBatchProfit={pricing.b2bBatchProfit}
        isInTrapZone={pricing.b2cBreakdown.isInTrapZone}
        profitAt78_90={pricing.b2cBreakdown.profitAt78_90}
        breakEvenAbove79Price={pricing.b2cBreakdown.breakEvenAbove79Price}
        shippingCost={pricing.b2cBreakdown.shippingCost}
        onFixPriceAt78_90={() => pricing.setB2cPriceOverride(ML_SAFE_UNDER_THRESHOLD_PRICE)}
        onBumpPriceAbove79={() => pricing.setB2cPriceOverride(pricing.b2cBreakdown.breakEvenAbove79Price)}
      />

      <div className="flex flex-wrap justify-between items-center text-xs text-slate-400 font-mono mt-4 pt-3 border-t border-[#2563EB]/10 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span>Peça: <strong className="text-white">R$ {productionCost.toFixed(2)}</strong></span>
          <span>+</span>
          <span>Embalagem: <strong className="text-emerald-400">R$ {pricing.packagingCost.toFixed(2)}</strong></span>
          <span>=</span>
          <span>Custo Base: <strong className="text-[#FFB800]">R$ {pricing.baseCost.toFixed(2)}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span>Venda B2C: <strong className="text-[#22C55E]">R$ {pricing.currentB2C.toFixed(2)}</strong></span>
          <span>Venda B2B: <strong className="text-[#0084FF]">R$ {pricing.currentB2B.toFixed(2)}</strong></span>
        </div>
      </div>
    </div>
  );
};

