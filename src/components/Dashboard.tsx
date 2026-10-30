import React from 'react';
import { useDb } from '../context/DbContext';
import { DashboardMetrics } from './dashboard/DashboardMetrics';
import { DashboardCharts } from './dashboard/DashboardCharts';
import { DashboardAlertsAndTop } from './dashboard/DashboardAlertsAndTop';

interface DashboardProps {
  setView: (v: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { products, inventory, sales, financialLogs, materials, syncConfig } = useDb();

  // 1. Calculate statistics
  const totalProductsCount = products.length;
  const totalInventoryValue = inventory.reduce((acc, curr) => acc + (curr.stock * curr.costPrice), 0);

  // Month-to-date calculation (dynamic)
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const currentMonthSales = sales.filter(s => s.date.includes(currentMonthStr));
  const currentMonthRevenue = currentMonthSales.reduce((acc, curr) => acc + curr.totalValue, 0);
  const currentMonthProfit = currentMonthSales.reduce((acc, curr) => acc + curr.profit, 0);

  // Low stock products
  const lowStockItems = inventory.filter(item => item.status === 'BAIXO' || item.status === 'CRITICO');

  // 2. Prepare charts data
  const getLastMonths = (count: number) => {
    const months = [];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toISOString().substring(0, 7));
    }
    return months;
  };

  const revenueVsCostsData = getLastMonths(7).map(month => {
    const monthLogs = financialLogs.filter(log => log.date.startsWith(month));
    const receita = monthLogs.filter(l => l.type === 'RECEITA').reduce((sum, l) => sum + l.value, 0);
    const custos = monthLogs.filter(l => l.type === 'DESPESA').reduce((sum, l) => sum + l.value, 0);
    
    const dateObj = new Date(`${month}-02`);
    const name = dateObj.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
    
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      receita,
      custos
    };
  });

  // Filament usage levels
  const filamentConsumption = materials.map(m => {
    const consumedPercent = m.initialWeight > 0 
      ? Math.round(((m.initialWeight - m.currentWeight) / m.initialWeight) * 100)
      : 0;
    
    const finalPercent = Math.min(Math.max(consumedPercent, 0), 100);
    
    return {
      name: m.name,
      percentage: finalPercent,
      color: m.colorHex || '#FFB800'
    };
  });

  // Category sales distribution
  const salesByCategoryMap: { [key: string]: number } = {};
  sales.forEach(sale => {
    const prod = products.find(p => p.id === sale.productId);
    const category = prod ? prod.category : 'Outros';
    salesByCategoryMap[category] = (salesByCategoryMap[category] || 0) + sale.totalValue;
  });

  const categoryChartData = Object.keys(salesByCategoryMap).map(cat => ({
    name: cat,
    value: salesByCategoryMap[cat]
  }));

  // Top products from sales
  const productSalesMap: { [key: string]: { qty: number; total: number; name: string } } = {};
  sales.forEach(sale => {
    if (!productSalesMap[sale.productId]) {
      productSalesMap[sale.productId] = { qty: 0, total: 0, name: sale.productName };
    }
    productSalesMap[sale.productId].qty += sale.quantity;
    productSalesMap[sale.productId].total += sale.totalValue;
  });

  const topProductsList = Object.keys(productSalesMap)
    .map(id => ({
      id,
      ...productSalesMap[id],
      image: products.find(p => p.id === id)?.image || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=150&q=80"
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Welcome Ribbon */}
      <div className="bg-[#1A1D25] rounded-2xl border border-[#2B303E] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-white mb-1">Painel Operacional & Indicadores</h2>
          <p className="text-slate-400 font-body-md text-xs sm:text-sm">
            Métricas de produção 3D, rentabilidade de matéria-prima e fluxo em tempo real.
          </p>
        </div>
        <div className="flex gap-2">
          {syncConfig.connected ? (
            <div className="flex items-center gap-2 bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30 px-3.5 py-1.5 rounded-full font-label-md text-xs">
              <span className="w-2 h-2 bg-[#FFB800] rounded-full animate-pulse"></span>
              Planilha Google Sincronizada
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300 bg-[#11141A] border border-[#2B303E] px-3.5 py-1.5 rounded-full font-label-md text-xs">
              <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
              Banco Local Ativo
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <DashboardMetrics
        totalProductsCount={totalProductsCount}
        totalInventoryValue={totalInventoryValue}
        currentMonthRevenue={currentMonthRevenue}
        currentMonthProfit={currentMonthProfit}
      />

      {/* Evolution Area Chart & Filament Usage */}
      <DashboardCharts
        revenueVsCostsData={revenueVsCostsData}
        filamentConsumption={filamentConsumption}
      />

      {/* Categories Donut, Low Stock Alerts, Top Sellers */}
      <DashboardAlertsAndTop
        categoryChartData={categoryChartData}
        currentMonthRevenue={currentMonthRevenue}
        lowStockItems={lowStockItems}
        topProductsList={topProductsList}
        setView={setView}
      />
    </div>
  );
};
