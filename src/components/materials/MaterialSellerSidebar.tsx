import React from 'react';
import { Material, Seller } from '../../types';
import { Sparkles } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface MaterialSellerSidebarProps {
  materials: Material[];
  sellers: Seller[];
  chartColorFilter: string;
  setChartColorFilter: (color: string) => void;
}

export const MaterialSellerSidebar: React.FC<MaterialSellerSidebarProps> = ({
  materials,
  sellers,
  chartColorFilter,
  setChartColorFilter
}) => {
  const uniqueColors = Array.from(new Set(materials.map(m => m.color)));

  const chartData = sellers.map(s => {
    const mats = materials.filter(m => m.sellerId === s.id && (chartColorFilter === 'Todos' || m.color === chartColorFilter));
    if (mats.length === 0) return null;
    const minPrice = Math.min(...mats.map(m => m.costPerGram));
    return { name: s.name, minPrice };
  }).filter((item): item is { name: string; minPrice: number } => item !== null)
    .sort((a, b) => a.minPrice - b.minPrice);

  return (
    <div className="w-full xl:w-[320px] flex-shrink-0 space-y-6">
      <div className="bg-[#14171E] border border-[#222733] rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FFB800]" /> Melhores Preços de Compra
        </h3>
        <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
          Comparativo de menor custo por grama entre seus vendedores cadastrados.
        </p>

        <div className="mb-4">
          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 block font-mono">
            Filtrar por Cor
          </label>
          <select 
            value={chartColorFilter}
            onChange={(e) => setChartColorFilter(e.target.value)}
            className="w-full px-3 py-2 border border-[#2B303E] rounded-xl text-xs bg-[#11141A] outline-none text-slate-200 focus:border-[#FFB800] transition-colors"
          >
            <option value="Todos">Todas as Cores</option>
            {uniqueColors.map(color => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </div>

        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 5, right: 15, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#222733" horizontal={false} />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  stroke="#222733" 
                  tickFormatter={val => `R$${val.toFixed(2)}`} 
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  stroke="none" 
                  reversed={true} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#11141A', borderColor: '#222733', fontSize: '11px', color: '#f1f5f9', borderRadius: '8px' }}
                  formatter={(val: number) => [`R$ ${Number(val).toFixed(4)}/g`, 'Menor Preço']}
                  cursor={{ fill: '#222733', opacity: 0.4 }}
                />
                <Bar dataKey="minPrice" radius={[0, 4, 4, 0]} barSize={18}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#FFB800'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 text-center px-4">
              Nenhum dado com vendedor cadastrado para a cor selecionada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
