import React from 'react';
import packageJson from '../../../package.json';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Gauge, 
  Percent, 
  ShoppingCart, 
  Users, 
  CircleDollarSign, 
  Settings as SettingsIcon,
  X,
  Printer,
  TrendingUp,
  BookOpen
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Painel Central', icon: LayoutDashboard },
  { id: 'producao', label: 'Impressoras / Produção', icon: Printer },
  { id: 'termometro', label: 'Termômetro 3D', icon: Gauge },
  { id: 'produtos', label: 'Produtos', icon: Package },
  { id: 'pesquisa-produtos', label: 'Pesquisa de Produtos', icon: TrendingUp },
  { id: 'estoque', label: 'Controle de Estoque', icon: Layers },
  { id: 'materiais', label: 'Filamentos', icon: Layers },
  { id: 'insumos', label: 'Insumos', icon: Package },
  { id: 'custos', label: 'Calculadora de Custos', icon: Percent },
  { id: 'vendas', label: 'Vendas e Faturamento', icon: ShoppingCart },
  { id: 'clientes', label: 'Clientes e CRM', icon: Users },
  { id: 'financeiro', label: 'Financeiro', icon: CircleDollarSign },
  { id: 'configuracoes', label: 'Configurações', icon: SettingsIcon },
];

interface SidebarProps {
  activeView: string;
  setActiveView: (id: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onOpenHelp: () => void;
  hasUnreadVersion: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
  onOpenHelp,
  hasUnreadVersion
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          aria-label="Fechar navegação"
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`bg-[#11141A] text-white w-64 fixed top-0 bottom-0 left-0 z-50 transition-transform duration-300 ease-in-out transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col justify-between border-r border-[#222733] shadow-2xl`}
      >
        {/* Top Logo Brand */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 border-b border-[#222733] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#FFB800] rounded-xl shadow-lg shadow-amber-500/20 text-[#0F1115]">
                <Printer className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-headline-sm text-sm text-white font-extrabold tracking-tight leading-none">
                  Filamento Cust
                </h1>
                <span className="text-[10px] text-[#FFB800] font-mono font-semibold tracking-wider uppercase">
                  Industrial 3D
                </span>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#1A1D25] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links list */}
          <nav className="p-3 space-y-1.5">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 group ${
                    isActive 
                      ? 'bg-[#FFB800] text-[#0F1115] shadow-lg shadow-amber-500/25 font-bold' 
                      : 'text-slate-400 hover:bg-[#1B1E26] hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#0F1115] stroke-[2.5]' : 'text-slate-400 group-hover:text-[#FFB800]'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Help & Changelog action button */}
          <div className="px-3 pt-2 pb-1">
            <button
              onClick={() => {
                onOpenHelp();
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#181D26] hover:bg-[#202633] text-amber-300 border border-amber-500/30 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#FFB800] group-hover:scale-110 transition-transform" />
                <span>Ajuda & Manual</span>
              </div>
              {hasUnreadVersion && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FFB800] text-[#0F1115]">
                  NOVO
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filament Spool Footer */}
        <div className="p-4 border-t border-[#222733] bg-[#0E1014] flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-300 font-mono font-bold">Filamento Cust</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30 font-mono font-bold">
              v{packageJson.version}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

