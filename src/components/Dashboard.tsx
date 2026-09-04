import React from 'react';
import { useDb } from '../context/DbContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Package, TrendingUp, DollarSign, Activity, AlertTriangle, Play, Award, ChevronRight } from 'lucide-react';

interface DashboardProps {
  setView: (v: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { products, inventory, sales, financialLogs, materials, syncConfig } = useDb();

  // 1. Calculate statistics
  const totalProductsCount = products.length;
  const totalSpoolsCount = materials.length;
  
  const totalInventoryStock = inventory.reduce((acc, curr) => acc + curr.stock, 0);
  const totalInventoryValue = inventory.reduce((acc, curr) => acc + (curr.stock * curr.costPrice), 0);

  // Month-to-date calculation (dynamic)
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const currentMonthSales = sales.filter(s => s.date.includes(currentMonthStr));
  const currentMonthRevenue = currentMonthSales.reduce((acc, curr) => acc + curr.totalValue, 0);
  const currentMonthCost = currentMonthSales.reduce((acc, curr) => acc + curr.totalCost, 0);
  const currentMonthProfit = currentMonthSales.reduce((acc, curr) => acc + curr.profit, 0);

  // Low stock products
  const lowStockItems = inventory.filter(item => item.status === 'BAIXO' || item.status === 'CRITICO');

  // 2. Prepare charts data
  // Monthly Revenue vs Costs data representation from financial logs
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
    
    const dateObj = new Date(`${month}-02`); // -02 to avoid timezone issues
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
      color: m.colorHex || '#0084FF'
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

  const COLORS = ['#0084FF', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

  // Top products from sales
  const productSalesMap: { [key: string]: { qty: number; total: number; name: string } } = {};
  sales.forEach(sale => {
    if (!productSalesMap[sale.productId]) {
      productSalesMap[sale.productId] = { qty: 0, total: 0, name: sale.productName };
    }
    productSalesMap[sale.productId].qty += sale.quantity;
    productSalesMap[sale.productId].total += sale.totalValue;
  });

  // Link products with beautiful demo icons or images from users
  const topProductsList = Object.keys(productSalesMap)
    .map(id => ({
      id,
      ...productSalesMap[id],
      image: products.find(p => p.id === id)?.id === 'prod-01'
        ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ__gz3QJjyjrPnI1g9T6IztqtlqsNpbT_S5YvEZRt9JIiaisRXUriiWpoE0unTZEXH4Eu-LZY6O1sydiT8_h7a_wauElNo3McD17X7UPXjluR4yOPwxeR3KwTaxSYg-8dE6PLJjbryoz4dEtHntQziqnNnon-Pm0gC86Ev7GJ668a_K3enllX2Cd4Gn58-69ZWxwynwBLRXSQz1jjP-8e4FL2io7OzzAvk6qxSJBFncjWX_y1KpmkwhcwnCws_bQuIVIXyJIjVBU"
        : products.find(p => p.id === id)?.id === 'prod-02'
        ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCO5sVtPLJJkqxTMsB459JPQMBVG9auVS4rOXckYHnGxKLrT_BPLq0VsJDAYPQfzd9rKWlNxiF_nBJizjY3oQd0Is0VTa35RK6JOWtTpQqH7cnivhEn-Ceg9_LFfB-dg7xuOJNEzJ6NzIf6lfTlskGZvPDb406mbkTTrw8g-Nrtg0gH92IQEUlggwzT-EkwVWaz0cSl5ESfNyHc37HPhbPJZk0vjkI1QZT0T324zaQaLNRKPOCN-RGhXiyTA08UE77Ae3ab5fTPR0o"
        : products.find(p => p.id === id)?.id === 'prod-03'
        ? "https://lh3.googleusercontent.com/aida-public/AB6AXuBW0WR2QCQfk1nx0v43m2pC1LuagOpre3Mf67YTYacuX5DJlQCdZhoUuWOk6aaxpg0ORs7187aOywS2gHY_e6O42emrhWvAkFUGnsHtucwYEjs1B7SChEGb5LjRPJG0CSeRanPguMBNPzGvlN94SwQUG4c67RGAqyFdnhBuudVcdGOlpq99J7GezfI0UgVwSUPzznLIfiNjIbI76JRl4ckbjBQaWzp9OyhR6kaIxaq0Iccncg9TI1kcsZE6HFBm7lXmxKkBLfNjd8E"
        : "https://lh3.googleusercontent.com/aida-public/AB6AXuD2FqtXYI8aeI5N3Rdxez8NJC6p3XcmfOQQkvwePU-NdCtdYtJdFZBsRdSVZAcdRXihno_CSs9tU59gyQY3HuzdlMi67x84u1FWkROqLHozdM2X9wl482GMTv8ceWnP0NcEg8R4gGNW0u2nKSbABnjiwM2vOka025fsiZYFjWGPlkj0MEYui872SNvQEN1BpH8k0bskOcL5OlqgkGzg_6smuJZm3gUY29jVJ9fZiUfsMabkCNxjmnJzUKn-yzt74uAv60j3VctzDtY"
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Welcome Ribbon */}
      <div className="bg-[#1C1F24] rounded-xl border border-[#2B2F36] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-white mb-1">Painel Operacional e Governança</h2>
          <p className="text-slate-400 font-body-md">Métricas unificadas de produção de hardware e logística 3D.</p>
        </div>
        <div className="flex gap-2">
          {syncConfig.connected ? (
            <div className="flex items-center gap-2 bg-[#0084FF]/10 text-[#1D4ED8] px-4 py-2 rounded-lg font-label-md">
              <span className="w-2.5 h-2.5 bg-[#0084FF] rounded-full animate-pulse"></span>
              Planilha Google Conectada
            </div>
          ) : (
            <div className="text-slate-400 bg-[#2B2F36] px-4 py-2 rounded-lg font-label-md">
              Modo de Banco de Dados Local
            </div>
          )}
        </div>
      </div>

      {/* Grid Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-[#1C1F24] p-6 rounded-xl border border-[#2B2F36] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-label-md text-slate-400 uppercase tracking-wider text-[11px] mb-1">Total de Produtos</p>
              <h3 className="font-headline-md text-white">{totalProductsCount} Itens</h3>
            </div>
            <div className="p-2.5 bg-[#121418] border border-[#2B2F36] rounded-lg">
              <Package className="w-5 h-5 text-slate-300" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#22C55E] font-bold text-xs flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +12%
            </span>
            <span className="text-slate-400 text-xs">vs mês anterior</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#1C1F24] p-6 rounded-xl border border-[#2B2F36] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-label-md text-slate-400 uppercase tracking-wider text-[11px] mb-1">Valor do Estoque</p>
              <h3 className="font-headline-md text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInventoryValue)}
              </h3>
            </div>
            <div className="p-2.5 bg-[#121418] border border-[#2B2F36] rounded-lg">
              <DollarSign className="w-5 h-5 text-slate-300" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#22C55E] font-bold text-xs flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +5.2%
            </span>
            <span className="text-slate-400 text-xs">itens ativos</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#1C1F24] p-6 rounded-xl border border-[#2B2F36] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-label-md text-slate-400 uppercase tracking-wider text-[11px] mb-1">Faturamento Mensal</p>
              <h3 className="font-headline-md text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentMonthRevenue)}
              </h3>
            </div>
            <div className="p-2.5 bg-[#121418] border border-[#2B2F36] rounded-lg">
              <DollarSign className="w-5 h-5 text-[#0084FF]" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#22C55E] font-bold text-xs flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +18%
            </span>
            <span className="text-slate-400 text-xs">meta jun/26</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#1C1F24] p-6 rounded-xl border border-[#2B2F36] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-label-md text-slate-400 uppercase tracking-wider text-[11px] mb-1">Lucro Mensal Líquido</p>
              <h3 className="font-headline-md text-[#0084FF]">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentMonthProfit)}
              </h3>
            </div>
            <div className="p-2.5 bg-[#121418] border border-[#2B2F36] rounded-lg">
              <Activity className="w-5 h-5 text-slate-300" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#22C55E] font-bold text-xs flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +8.4%
            </span>
            <span className="text-slate-400 text-xs">margem ~{currentMonthRevenue ? Math.round((currentMonthProfit / currentMonthRevenue) * 100) : 40}%</span>
          </div>
        </div>
      </div>

      {/* Grid Gráficos Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Faturamento vs Custos */}
        <div className="lg:col-span-2 bg-[#1C1F24] p-6 rounded-xl border border-[#2B2F36] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-headline-sm text-white">Evolução do Faturamento vs Custos</h4>
              <p className="text-xs text-slate-400">Comparativo histórico de desempenho operacional</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0084FF]"></span>
                <span className="font-label-md text-xs text-slate-400">Receita</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                <span className="font-label-md text-xs text-slate-400">Custos</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueVsCostsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0084FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0084FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCustos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2B2F36" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C1F24', borderColor: '#2B2F36', borderRadius: '8px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#FFFFFF' }}
                />
                <Area type="monotone" dataKey="receita" stroke="#0084FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReceita)" name="Receita" />
                <Area type="monotone" dataKey="custos" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorCustos)" name="Custos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consumo de Filamento */}
        <div className="bg-[#1C1F24] p-6 rounded-xl border border-[#2B2F36] shadow-sm flex flex-col">
          <div className="mb-6">
            <h4 className="font-headline-sm text-white">Consumo de Filamento</h4>
            <p className="text-xs text-slate-400">Porcentagem gasta do rolo padrão atual</p>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-5">
            {filamentConsumption.map((mat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">{mat.name}</span>
                  <span className="font-mono text-slate-400 font-medium">{mat.percentage}%</span>
                </div>
                <div className="w-full bg-[#2B2F36] h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${mat.percentage}%`,
                      backgroundColor: mat.percentage > 75 ? '#DC2626' : mat.color 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por categoria */}
        <div className="bg-[#1C1F24] p-6 rounded-xl border border-[#2B2F36] shadow-sm flex flex-col">
          <div className="mb-4">
            <h4 className="font-headline-sm text-white">Vendas por Categoria</h4>
            <p className="text-xs text-slate-400">Distribuição financeira das encomendas</p>
          </div>
          {categoryChartData.length > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Total']}
                      contentStyle={{ borderRadius: '8px', borderColor: '#2B2F36' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
                  <span className="text-sm font-bold text-white">R$ {currentMonthRevenue.toFixed(0)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full text-xs">
                {categoryChartData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="text-slate-300 truncate max-w-[100px]">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">
              Nenhuma venda registrada
            </div>
          )}
        </div>

        {/* Estoque Baixo / Alertas Críticos */}
        <div className="bg-[#1C1F24] rounded-xl border border-[#2B2F36] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#2B2F36] bg-[#121418] flex justify-between items-center">
            <h4 className="font-headline-sm text-sm text-white">Alertas de Reposição</h4>
            <button onClick={() => setView('estoque')} className="text-[#0084FF] font-label-md text-xs hover:underline flex items-center">
              Ver Todos <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[220px] divide-y divide-slate-100">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center gap-3.5 hover:bg-[#121418]/40 transition-colors">
                  <div className={`p-2 rounded-lg ${item.status === 'CRITICO' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Disponível: {item.stock} un | Mínimo: {item.minStock} un</p>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      item.status === 'CRITICO' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 italic flex flex-col items-center justify-center h-full">
                <Award className="w-8 h-8 text-[#22C55E] mb-2" />
                Estoque 100% regulado!
              </div>
            )}
          </div>
        </div>

        {/* Mais Vendidos */}
        <div className="bg-[#1C1F24] rounded-xl border border-[#2B2F36] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#2B2F36] bg-[#121418] flex justify-between items-center">
            <h4 className="font-headline-sm text-sm text-white">Mais Vendidos</h4>
            <span className="text-xs font-label-md text-slate-400">Performance de Caixa</span>
          </div>
          <div className="flex-1 p-4 grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto">
            {topProductsList.length > 0 ? (
              topProductsList.map((prod, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 border border-[#2B2F36] rounded-lg bg-[#121418] hover:border-[#0084FF] transition-all">
                  <img src={prod.image} className="w-10 h-10 rounded object-cover border border-[#2B2F36]" referrerPolicy="no-referrer" alt={prod.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate leading-tight">{prod.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{prod.qty} vendas</p>
                    <p className="text-[10px] text-[#0084FF] font-bold">R$ {prod.total}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-xs text-slate-400 italic py-10 h-full flex items-center justify-center">
                Sem registros de vendas
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
