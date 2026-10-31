import React from 'react';
import { Material, Seller } from '../../types';
import { Edit, Trash2, Plus, Calendar } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

interface MaterialCardProps {
  material: Material;
  sellers: Seller[];
  onEdit: (mat: Material) => void;
  onDelete: (id: string) => void;
  onAddUnit: (mat: Material) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  sellers,
  onEdit,
  onDelete,
  onAddUnit
}) => {
  const remainingPercent = Math.min(100, Math.round((material.currentWeight / material.initialWeight) * 100));
  const isLow = material.currentWeight <= 250;

  const seller = material.sellerId ? sellers.find(s => s.id === material.sellerId) : null;

  return (
    <div className="bg-[#14171E] border border-[#222733] rounded-2xl overflow-hidden hover:border-amber-500/40 hover:shadow-xl transition-all group flex flex-col justify-between">
      {/* Spool Image Frame */}
      <div className="h-36 relative overflow-hidden bg-[#11141A] border-b border-[#222733] flex-shrink-0 group">
        <div 
          className="w-full h-full absolute inset-0 z-10" 
          style={{ backgroundColor: material.colorHex || '#CBD5E1' }}
        />
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh-HmxukFdfK_Y5oBwjxaEZnoqKshor6ds7B6QVRJzXsbAO_xeuVieouGHcYOh94UK6DFaCplsHh3DlHwLVqNc3ru3zj3BzN1J44wnhTk9ANzTFOyxg4q5xcnl_ErfwdUaZzgM2oIkMktBk4MTaN7CZacVqfa_EDOTwEb7BTwAVxWspZThKDt-wN0ZqK-5vxQE01gpG6kCP4n4NWX7LVWmDoY5W7eBIHpUDyl0jLZ8Lo95X5wry50he3rzAAONBuOhap6mHihpZJo" 
          className="w-full h-full object-cover absolute inset-0 z-20 mix-blend-multiply opacity-70 grayscale group-hover:scale-105 transition-transform duration-500" 
          referrerPolicy="no-referrer"
          alt={material.name} 
        />
        
        <div className="absolute top-3 left-3 z-30 bg-[#11141A]/90 backdrop-blur-sm px-2.5 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider shadow-sm border border-[#222733]">
          {material.name.split(' ')[material.name.split(' ').length - 1]}
        </div>
        <div 
          className="absolute top-3 right-3 z-30 w-5 h-5 rounded-full border-2 border-[#11141A] shadow-md transition-transform hover:scale-110" 
          style={{ backgroundColor: material.colorHex || '#CBD5E1' }}
          title={`Cor: ${material.color}`}
        />
      </div>

      {/* Spool Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-0.5">
            <h3 className="font-bold text-white text-sm truncate leading-tight">
              {material.name}
            </h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => onEdit(material)}
                className="text-slate-400 hover:text-[#FFB800] rounded p-1 transition-colors cursor-pointer"
                title="Editar Rolo"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => onDelete(material.id)}
                className="text-slate-400 hover:text-red-400 rounded p-1 transition-colors cursor-pointer"
                title="Excluir Rolo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium mb-4 flex items-center gap-1 truncate">
            <span>{material.brand}</span>
            {seller && (
              <>
                <span className="text-slate-600">•</span>
                {seller.link ? (
                  <a 
                    href={seller.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-[#FFB800] hover:underline transition-colors truncate"
                  >
                    {seller.name}
                  </a>
                ) : (
                  <span className="truncate">{seller.name}</span>
                )}
              </>
            )}
          </p>

          <div className="space-y-4">
            {/* Progress slider bar */}
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400 uppercase tracking-tight">
                <span>Peso Restante</span>
                <span className="font-bold text-slate-200">{material.currentWeight}g / {material.initialWeight}g</span>
              </div>
              <div className="h-2 w-full bg-[#1A1D25] rounded-full overflow-hidden border border-[#222733]">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-[#FFB800]'}`}
                  style={{ width: `${remainingPercent}%` }}
                />
              </div>
              {isLow && (
                <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                  ⚠️ Baixo Estoque
                </p>
              )}
            </div>
            
            {/* Units availability */}
            <div className="flex items-center justify-between bg-[#0F1115] p-2.5 rounded-xl border border-[#222733]">
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-tight font-mono">Unidades Disp.</p>
                <p className="font-bold text-slate-200 text-xs">
                  {(material.currentWeight / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} 
                  <span className="text-[9px] font-normal text-slate-400"> (1000g/un)</span>
                </p>
              </div>
              <button 
                onClick={() => onAddUnit(material)}
                className="bg-[#1A1D25] border border-[#2B303E] text-[#FFB800] hover:bg-[#FFB800] hover:text-[#0F1115] rounded-lg px-2 py-1 transition-all shadow-sm flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                title="Adicionar 1 Unidade (1000g)"
              >
                <Plus className="w-3 h-3" /> 1 Unid
              </button>
            </div>
          </div>
        </div>

        {/* Technical pricing matrix footer */}
        <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-[#222733] text-xs">
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Valor Rolo</p>
            <p className="font-mono font-bold text-[#FFB800]">R$ {material.spoolPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Custo/g</p>
            <p className="font-mono font-bold text-slate-200">R$ {material.costPerGram.toFixed(4)}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold flex items-center justify-end gap-0.5">
              <Calendar className="w-2.5 h-2.5" /> Data
            </p>
            <p className="font-mono text-slate-300 font-medium text-[11px]">
              {material.purchaseDate.split('-').reverse().slice(0, 2).join('/')}
            </p>
          </div>
        </div>
        
        {/* Price History Chart */}
        {material.priceHistory && material.priceHistory.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#222733]">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-2">
              Histórico de Preço (R$)
            </p>
            <div className="h-14 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={material.priceHistory}>
                  <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#11141A', borderColor: '#222733', fontSize: '10px', borderRadius: '8px', color: '#F8FAFC' }}
                    formatter={(value, _, props) => {
                      const s = sellers.find(sellerItem => sellerItem.id === props.payload.sellerId);
                      const sellerStr = s ? ` (${s.name})` : '';
                      return [`R$ ${Number(value).toFixed(2)}${sellerStr}`, 'Preço'];
                    }}
                    labelFormatter={(label) => {
                      const [, m] = String(label).split('-');
                      return m ? `Mês ${m}` : label;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#FFB800" 
                    strokeWidth={2} 
                    dot={{ r: 2.5, fill: '#FFB800', strokeWidth: 1, stroke: '#11141A' }} 
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
