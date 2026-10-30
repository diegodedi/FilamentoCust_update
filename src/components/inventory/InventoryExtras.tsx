import React from 'react';
import { AlertCircle, Sparkles, QrCode, X } from 'lucide-react';
import { InventoryItem } from '../../types';

interface InventoryExtrasProps {
  barcodeInput: string;
  setBarcodeInput: (s: string) => void;
  handleBarcodeScan: (e: React.FormEvent) => void;
  scanSuccess: string | null;
  isMovementModalOpen: boolean;
  setIsMovementModalOpen: (b: boolean) => void;
  selectedItemForMovement: InventoryItem | null;
  movementType: 'IN' | 'OUT';
  movementQty: number;
  setMovementQty: (q: number) => void;
  handleMovementSubmit: (e: React.FormEvent) => void;
}

export const InventoryExtras: React.FC<InventoryExtrasProps> = ({
  barcodeInput,
  setBarcodeInput,
  handleBarcodeScan,
  scanSuccess,
  isMovementModalOpen,
  setIsMovementModalOpen,
  selectedItemForMovement,
  movementType,
  movementQty,
  setMovementQty,
  handleMovementSubmit
}) => {
  return (
    <div className="space-y-6">
      {/* Depletion Forecast & Barcode Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Previsão de Ruptura */}
        <div className="lg:col-span-2 bg-[#1A1D25] border border-[#2B303E] p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline-sm text-white">Previsão Dinâmica de Ruptura</h3>
            <AlertCircle className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="space-y-3">
            <div className="p-4 bg-[#11141A] border border-[#FF5E3A]/30 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FF5E3A]/15 text-[#FF5E3A] border border-[#FF5E3A]/30 flex flex-col items-center justify-center rounded-xl font-mono font-bold leading-tight shrink-0">
                  <span className="text-sm font-black">02</span>
                  <span className="text-[8px] uppercase">Dias</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">ErgoTrack Shell (Crítico)</p>
                  <p className="text-[11px] text-slate-400">Consumo acelerado estimado com base em pedidos pendentes.</p>
                </div>
              </div>
              <button 
                onClick={() => alert('Ordem de produção de reabastecimento gerada!')} 
                className="text-xs font-bold text-[#FFB800] hover:underline underline-offset-4 cursor-pointer shrink-0"
              >
                Iniciar Produção
              </button>
            </div>

            <div className="p-4 bg-[#11141A] border border-[#FFB800]/30 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30 flex flex-col items-center justify-center rounded-xl font-mono font-bold leading-tight shrink-0">
                  <span className="text-sm font-black">05</span>
                  <span className="text-[8px] uppercase">Dias</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Fan Shroud Pro (Estoque Baixo)</p>
                  <p className="text-[11px] text-slate-400">Estoque atual (3 un) atingirá nível de emergência em 5 dias.</p>
                </div>
              </div>
              <button 
                onClick={() => alert('Ordem de produção de reabastecimento gerada!')} 
                className="text-xs font-bold text-[#FFB800] hover:underline underline-offset-4 cursor-pointer shrink-0"
              >
                Programar Lote
              </button>
            </div>
          </div>
        </div>

        {/* Quick Barcode Simulator */}
        <div className="bg-[#1A1D25] text-white p-5 sm:p-6 rounded-2xl border border-[#2B303E] shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB800]/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Sparkles className="w-4 h-4 text-[#FFB800]" />
              <span className="font-label-md text-[10px] uppercase tracking-wider text-[#FFB800]">
                Entrada Assistida
              </span>
            </div>
            <h3 className="font-headline-sm mb-1 text-white">Simulador de Coletor</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Digite um código SKU para simular o recebimento físico e adicionar +1 unidade ao estoque.
            </p>

            <form onSubmit={handleBarcodeScan} className="space-y-3">
              <div className="relative">
                <QrCode className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Aguardando SKU / Código..." 
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full bg-[#11141A] border border-[#2B303E] rounded-xl pl-10 pr-3 py-2 text-xs outline-none focus:border-[#FFB800] text-white transition-colors"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-[#FFB800] hover:bg-[#FFA500] text-[#0F1115] font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-amber-500/20 active:scale-[0.98]"
              >
                Simular Leitor de Código
              </button>
            </form>

            {scanSuccess && (
              <div className="mt-3 p-3 bg-[#11141A] border border-[#10B981]/40 rounded-xl text-[11px] text-[#10B981] font-medium leading-relaxed flex items-center gap-2">
                <span className="w-2 h-2 bg-[#10B981] rounded-full shrink-0"></span>
                <span>{scanSuccess}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Movimentação */}
      {isMovementModalOpen && selectedItemForMovement && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1D25] rounded-2xl border border-[#2B303E] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-[#2B303E] bg-[#14171E] flex justify-between items-center">
              <h3 className="font-headline-sm text-white">
                Registrar {movementType === 'IN' ? 'Entrada' : 'Saída'}
              </h3>
              <button 
                onClick={() => setIsMovementModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#252A37] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleMovementSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="text-center pb-2 bg-[#11141A] p-3 rounded-xl border border-[#2B303E]">
                <p className="text-[10px] text-slate-400 uppercase font-label-md">Produto</p>
                <p className="font-bold text-white text-sm truncate">{selectedItemForMovement.name}</p>
                <p className="text-xs text-[#FFB800] font-mono mt-0.5">Saldo: {selectedItemForMovement.stock} un</p>
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-xs uppercase">Quantidade de Itens</label>
                <input 
                  type="number" 
                  min={1}
                  required
                  value={movementQty}
                  onChange={(e) => setMovementQty(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 bg-[#11141A] border border-[#2B303E] rounded-xl text-sm text-center font-mono font-bold text-white outline-none focus:border-[#FFB800]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#2B303E]">
                <button 
                  type="button" 
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 bg-[#11141A] border border-[#2B303E] text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-md ${
                    movementType === 'IN' 
                      ? 'bg-[#FFB800] hover:bg-[#FFA500] text-[#0F1115] shadow-amber-500/20' 
                      : 'bg-[#FF5E3A] hover:bg-[#E54823] text-white shadow-red-500/20'
                  }`}
                >
                  Confirmar {movementType === 'IN' ? 'Entrada' : 'Saída'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

