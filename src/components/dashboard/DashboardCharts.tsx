import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ChartItem {
  name: string;
  receita: number;
  custos: number;
}

interface FilamentItem {
  name: string;
  percentage: number;
  color: string;
}

interface DashboardChartsProps {
  revenueVsCostsData: ChartItem[];
  filamentConsumption: FilamentItem[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  revenueVsCostsData,
  filamentConsumption
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
      {/* Gráfico 1: Faturamento vs Custos */}
      <div className="lg:col-span-2 bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B303E] shadow-sm flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h4 className="font-headline-sm text-white">Evolução de Faturamento & Custos</h4>
            <p className="text-xs text-slate-400">Comparativo histórico de desempenho operacional</p>
          </div>
          <div className="flex items-center gap-4 bg-[#11141A] px-3.5 py-1.5 rounded-full border border-[#2B303E]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800] shadow-[0_0_8px_rgba(255,184,0,0.6)]"></span>
              <span className="font-label-md text-xs text-slate-300">Receita</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E3A]"></span>
              <span className="font-label-md text-xs text-slate-300">Custos</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueVsCostsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB800" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#FFB800" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorCustos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5E3A" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#FF5E3A" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#252A37" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8892A6' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8892A6' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#161922', 
                  borderColor: '#2B303E', 
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  color: '#FFFFFF'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#FFB800', marginBottom: '4px' }}
                formatter={(val: any) => [`R$ ${Number(val).toFixed(2)}`, '']}
              />
              <Area 
                type="monotone" 
                dataKey="receita" 
                stroke="#FFB800" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorReceita)" 
                name="Receita" 
              />
              <Area 
                type="monotone" 
                dataKey="custos" 
                stroke="#FF5E3A" 
                strokeWidth={2} 
                strokeDasharray="4 4" 
                fillOpacity={1} 
                fill="url(#colorCustos)" 
                name="Custos" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 2: Consumo de Filamento */}
      <div className="bg-[#1A1D25] p-5 sm:p-6 rounded-2xl border border-[#2B2F36] shadow-sm flex flex-col justify-between">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h4 className="font-headline-sm text-white">Nível de Filamento</h4>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30">
              CONSUMO %
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Porcentagem gasta do rolo padrão atual</p>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-4 sm:gap-5 overflow-y-auto max-h-[260px] pr-1">
          {filamentConsumption.length > 0 ? (
            filamentConsumption.slice(0, 5).map((mat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200 truncate max-w-[170px]" title={mat.name}>
                    {mat.name}
                  </span>
                  <span className="font-mono text-slate-300 font-bold">{mat.percentage}%</span>
                </div>
                <div className="w-full bg-[#11141A] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#2B303E]">
                  <div 
                    className="h-full rounded-full transition-all duration-500 shadow-sm" 
                    style={{ 
                      width: `${mat.percentage}%`,
                      backgroundColor: mat.percentage > 80 ? '#FF5E3A' : '#FFB800'
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-slate-500 italic py-8">
              Nenhum filamento cadastrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

