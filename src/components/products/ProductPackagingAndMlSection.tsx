import React, { useState, useEffect, useMemo } from 'react';
import { Supply } from '../../types';
import { useDb } from '../../context/DbContext';
import { findBestFittingBox } from '../../utils/packagingMatcher';
import { AutoPackagingBoxSelector } from './AutoPackagingBoxSelector';
import { MlChargesBreakdown } from './MlChargesBreakdown';
import { MlPricingBreakdown, MlReputation } from '../../utils/mercadoLivrePricing';

interface ProductPackagingAndMlSectionProps {
  dimensions: string;
  weight: number;
  costPrice: number;
  b2cPrice: number;
  marketplacePlatform: string;
  setMarketplacePlatform: (val: string) => void;
  selectedSupplyId: string;
  setSelectedSupplyId: (id: string) => void;
  packagingCost: number;
  setPackagingCost: (val: number) => void;
  wastePercentage: number;
  setWastePercentage: (val: number) => void;
  taxPercent: number;
  setTaxPercent: (val: number) => void;
  reputation: MlReputation;
  setReputation: (r: MlReputation) => void;
  packageDimensions: string;
  setPackageDimensions: (d: string) => void;
  packageWeight: number;
  setPackageWeight: (w: number) => void;
  breakdown: MlPricingBreakdown;
}

/**
 * Seção unificada de embalagem inteligente e encargos automáticos do Mercado Livre no cadastro de produto.
 */
export const ProductPackagingAndMlSection: React.FC<ProductPackagingAndMlSectionProps> = ({
  dimensions,
  weight,
  costPrice,
  b2cPrice,
  marketplacePlatform,
  setMarketplacePlatform,
  selectedSupplyId,
  setSelectedSupplyId,
  packagingCost,
  setPackagingCost,
  wastePercentage,
  setWastePercentage,
  taxPercent,
  setTaxPercent,
  reputation,
  setReputation,
  packageDimensions,
  setPackageDimensions,
  packageWeight,
  setPackageWeight,
  breakdown
}) => {
  const { supplies } = useDb();
  const [isManuallySelectedBox, setIsManuallySelectedBox] = useState(false);
  const [isManuallySetWeight, setIsManuallySetWeight] = useState(false);

  const boxes = useMemo(() => supplies.filter((s) => s.type === 'Caixa de papelão'), [supplies]);
  const selectedBox = useMemo(() => boxes.find((b) => b.id === selectedSupplyId), [boxes, selectedSupplyId]);

  // Cálculo detalhado do peso estimado: Peça + Caixa (cadastrada ou estimada) + Plástico bolha (25g)
  const estimatedBoxWeight = selectedBox?.unitWeightGrams || (selectedSupplyId === 'NONE' ? 0 : 70);
  const protectionWeight = selectedSupplyId === 'NONE' ? 0 : 25;
  const estimatedTotalWeight = Math.round(weight + estimatedBoxWeight + protectionWeight);

  // 1. Identificação Automática da Caixa
  const autoMatch = useMemo(() => {
    return findBestFittingBox(dimensions, supplies);
  }, [dimensions, supplies]);

  useEffect(() => {
    if (!isManuallySelectedBox && autoMatch?.box) {
      setSelectedSupplyId(autoMatch.box.id);
      setPackagingCost(Number(autoMatch.box.unitPrice) || 0);
      if (autoMatch.boxDims) {
        setPackageDimensions(`${autoMatch.boxDims[2]} x ${autoMatch.boxDims[1]} x ${autoMatch.boxDims[0]} cm`);
      }
    }
  }, [autoMatch, isManuallySelectedBox, setPackageDimensions, setPackagingCost, setSelectedSupplyId]);

  useEffect(() => {
    if (!isManuallySetWeight) {
      setPackageWeight(estimatedTotalWeight);
    }
  }, [estimatedTotalWeight, isManuallySetWeight, setPackageWeight]);

  const handleSelectBox = (id: string) => {
    setIsManuallySelectedBox(true);
    setSelectedSupplyId(id);
    const box = boxes.find((b) => b.id === id);
    if (box) {
      setPackagingCost(Number(box.unitPrice) || 0);
    } else if (id === 'NONE') {
      setPackagingCost(0);
    }
  };

  const handleResetToAuto = () => {
    setIsManuallySelectedBox(false);
    if (autoMatch?.box) {
      setSelectedSupplyId(autoMatch.box.id);
      setPackagingCost(Number(autoMatch.box.unitPrice) || 0);
    }
  };

  return (
    <div className="space-y-4">
      <AutoPackagingBoxSelector
        boxes={boxes}
        selectedSupplyId={selectedSupplyId}
        onSelectBox={handleSelectBox}
        packagingCost={packagingCost}
        onChangePackagingCost={(val) => {
          setIsManuallySelectedBox(true);
          setPackagingCost(val);
        }}
        isAutoMatched={Boolean(autoMatch?.box)}
        isManuallySelected={isManuallySelectedBox}
        autoBoxId={autoMatch?.box?.id}
        onResetToAuto={handleResetToAuto}
        pieceWeight={weight}
        packageWeight={packageWeight}
        onChangePackageWeight={(val) => {
          setIsManuallySetWeight(true);
          setPackageWeight(val);
        }}
        estimatedBoxWeight={estimatedBoxWeight}
        hasBoxWeightRegistered={Boolean(selectedBox?.unitWeightGrams)}
        protectionWeight={protectionWeight}
        estimatedTotalWeight={estimatedTotalWeight}
        isWeightCustomized={isManuallySetWeight}
        onResetWeightToEstimated={() => {
          setIsManuallySetWeight(false);
          setPackageWeight(estimatedTotalWeight);
        }}
      />

      <MlChargesBreakdown
        marketplacePlatform={marketplacePlatform}
        setMarketplacePlatform={setMarketplacePlatform}
        salePrice={b2cPrice}
        breakdown={breakdown}
        packagingCost={packagingCost}
        packageWeight={packageWeight}
        wastePercentage={wastePercentage}
        setWastePercentage={setWastePercentage}
        taxPercent={taxPercent}
        setTaxPercent={setTaxPercent}
        reputation={reputation}
        setReputation={setReputation}
      />
    </div>
  );
};
