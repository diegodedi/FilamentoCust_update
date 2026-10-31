import React, { useState, useMemo } from 'react';
import { Layers, Clock, Plus, Check, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';
import { useDb } from '../../context/DbContext';
import {
  KitSimulationRow,
  simulateProductKits,
  calculateLeadTimeCapacity
} from '../../utils/mercadoLivrePricing';

interface MlKitsAndLeadTimeTabProps {
  product: Product;
  onProductUpdated: (updated: Product) => void;
}

/**
 * Aba de simulação/criação de Kits (Multi-pack) e cálculo de Disponibilidade de Estoque (Lead Time ML).
 */
export const MlKitsAndLeadTimeTab: React.FC<MlKitsAndLeadTimeTabProps> = ({
  product,
  onProductUpdated
}) => {
  const { addProduct, updateProduct, printers } = useDb();

  const [kitMarkupPercent, setKitMarkupPercent] = useState<number>(product.b2cMargin || 60);
  const [createdKitMult, setCreatedKitMult] = useState<number | null>(null);

  const [activePrinters, setActivePrinters] = useState<number>(Math.max(1, printers.length || 1));
  const [hoursPerDay, setHoursPerDay] = useState<number>(16);
  const [expectedDailyOrders, setExpectedDailyOrders] = useState<number>(2);
  const [savedLeadTime, setSavedLeadTime] = useState(false);

  const baseInput = useMemo(
    () => ({
      salePrice: product.marketplacePrice || product.sellPrice,
      baseProductionCost: product.costPrice,
      wastePercentage: product.wastePercentage ?? 5,
      packagingCost: product.packagingCost ?? 2.5,
      packageWeightGrams: product.packageWeight || Math.round(product.weight + 80),
      listingType: product.mlListingType || 'CLASSICO',
      taxPercent: product.mlTaxPercent ?? 4,
      reputation: product.mlReputation || 'VERDE'
    }),
    [product]
  );

  const kitRows = useMemo(
    () => simulateProductKits(baseInput, kitMarkupPercent),
    [baseInput, kitMarkupPercent]
  );

  const leadTimeResult = useMemo(
    () =>
      calculateLeadTimeCapacity({
        unitPrintTimeHours: product.printTime || 1,
        unitsPerOrder: expectedDailyOrders,
        activePrinters,
        hoursPerDay
      }),
    [product.printTime, expectedDailyOrders, activePrinters, hoursPerDay]
  );

  const handleCreateKitInCatalog = (row: KitSimulationRow) => {
    const kitProduct: Omit<Product, 'id'> = {
      ...product,
      name: `Kit ${row.multiplier}x ${product.name}`,
      weight: Math.round(product.weight * row.multiplier),
      printTime: parseFloat((product.printTime * row.multiplier).toFixed(2)),
      costPrice: row.productionCost,
      packagingCost: row.packagingCost,
      packageWeight: row.totalWeightGrams,
      sellPrice: row.suggestedPrice,
      b2cPrice: row.suggestedPrice,
      marketplacePlatform:
        baseInput.listingType === 'CLASSICO'
          ? 'Mercado Livre Clássico (11.5% + R$6)'
          : 'Mercado Livre Premium (16.5% + R$6)',
      marketplacePrice: row.suggestedPrice,
      marketplacePriceOverride: row.suggestedPrice,
      profit: row.netProfit,
      mlNetProfit: row.netProfit,
      isKit: true,
      kitMultiplier: row.multiplier
    };

    addProduct(kitProduct);
    setCreatedKitMult(row.multiplier);
    setTimeout(() => setCreatedKitMult(null), 2500);
  };

  const handleSaveLeadTime = () => {
    const updated: Product = {
      ...product,
      leadTimeDays: leadTimeResult.recommendedMlDays
    };
    updateProduct(product.id, updated);
    onProductUpdated(updated);
    setSavedLeadTime(true);
    setTimeout(() => setSavedLeadTime(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Seção 1: Simulador e Gerador de Kits (Multi-pack) */}
      <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-[#FFB800] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              1. Simulador de Kits & Combos (Diluir Taxa Fixa de R$ 6,50)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Vender em Kit no Mercado Livre dilui a taxa fixa e multiplica seu lucro por envio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-400 font-bold">Markup Alvo (%):</label>
            <input
              type="number"
              min="10"
              max="300"
              value={kitMarkupPercent}
              onChange={(e) => setKitMarkupPercent(Math.max(10, Number(e.target.value)))}
              className="w-16 bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-2 py-1 text-xs text-white font-mono text-center outline-none focus:border-[#FFB800]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2B2F36] text-[10px] text-slate-400 uppercase">
                <th className="py-2 pr-2">Formato</th>
                <th className="py-2 px-2">Custo Prod+Emb</th>
                <th className="py-2 px-2">Preço ML Sugerido</th>
                <th className="py-2 px-2">Regra ML</th>
                <th className="py-2 px-2">Lucro Líquido</th>
                <th className="py-2 pl-2 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B2F36]/60 font-mono">
              {kitRows.map((row) => (
                <tr key={row.multiplier} className="hover:bg-[#1C1F24]/60">
                  <td className="py-2.5 pr-2 font-sans font-bold text-white">{row.label}</td>
                  <td className="py-2.5 px-2 text-slate-300">
                    R$ {(row.productionCost + row.packagingCost).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-2 text-[#FFE600] font-bold">
                    R$ {row.suggestedPrice.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-2 font-sans text-[10px]">
                    {row.isFreeShipping ? (
                      <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                        Frete Grátis (R$ {row.shippingOrFixedFee.toFixed(2)})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-700/50 text-slate-300">
                        Taxa Fixa R$ {row.shippingOrFixedFee.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-emerald-400 font-extrabold">
                    R$ {row.netProfit.toFixed(2)} ({row.netMarginPercent}%)
                  </td>
                  <td className="py-2.5 pl-2 text-right font-sans">
                    {row.multiplier > 1 && (
                      <button
                        type="button"
                        onClick={() => handleCreateKitInCatalog(row)}
                        className="px-2.5 py-1 bg-[#252A37] hover:bg-[#FFE600] text-slate-200 hover:text-slate-950 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        {createdKitMult === row.multiplier ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> Criado!
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" /> Criar no Catálogo
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção 2: Planejador de Disponibilidade de Estoque (Lead Time ML) */}
      <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#FFE600]" />
            2. Calculadora de "Disponibilidade de Estoque" (Proteger Reputação Verde)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Tempo unitário: {product.printTime}h
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Impressoras Dedicadas
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={activePrinters}
              onChange={(e) => setActivePrinters(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-[#FFE600]"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Horas Rodando / Dia
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Math.max(1, Math.min(24, Number(e.target.value))))}
              className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-[#FFE600]"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Meta Pedidos Simultâneos
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={expectedDailyOrders}
              onChange={(e) => setExpectedDailyOrders(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#1C1F24] border border-[#2B2F36] rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-[#FFE600]"
            />
          </div>
        </div>

        <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">{leadTimeResult.recommendationLabel}</div>
              <div className="text-[11px] text-slate-400">
                Capacidade fabril: <strong>{leadTimeResult.unitsPerDayCapacity} peças/dia</strong> ({leadTimeResult.totalHoursNeeded}h para {expectedDailyOrders} pedido(s))
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveLeadTime}
            className="px-3.5 py-1.5 bg-[#FFE600] hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-extrabold cursor-pointer"
          >
            {savedLeadTime ? 'Prazo Salvo!' : `Salvar Prazo (${leadTimeResult.recommendedMlDays}d)`}
          </button>
        </div>
      </div>
    </div>
  );
};

