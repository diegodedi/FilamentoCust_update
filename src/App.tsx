import React, { useState } from 'react';
import { DbProvider } from './context/DbContext';
import { PrinterProvider } from './context/PrinterContext';
import { Production } from './components/Production';
import { Dashboard } from './components/Dashboard';
import { Thermometer } from './components/Thermometer';
import { Products } from './components/Products';
import { Inventory } from './components/Inventory';
import { Materials } from './components/Materials';
import { Supplies } from './components/Supplies';
import { Costs } from './components/Costs';
import { Sales } from './components/Sales';
import { Customers } from './components/Customers';
import { Finance } from './components/Finance';
import { Settings } from './components/Settings';
import { ProductSearch } from './components/ProductSearch';
import packageJson from '../package.json';

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
  Menu,
  X,
  Printer,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
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

  // Dynamically render current view
  const renderView = () => {
    switch (activeView) {
      case 'producao':
        return <Production />;
      case 'dashboard':
        return <Dashboard setView={setActiveView} />;
      case 'termometro':
        return <Thermometer />;
      case 'produtos':
        return <Products />;
      case 'pesquisa-produtos':
        return <ProductSearch />;
      case 'estoque':
        return <Inventory />;
      case 'materiais':
        return <Materials />;
      case 'insumos':
        return <Supplies />;
      case 'custos':
        return <Costs />;
      case 'vendas':
        return <Sales />;
      case 'clientes':
        return <Customers />;
      case 'financeiro':
        return <Finance />;
      case 'configuracoes':
        return <Settings />;
      default:
        return <Dashboard setView={setActiveView} />;
    }
  };

  const currentLabel = menuItems.find(item => item.id === activeView)?.label || 'Filamento Cust';

  return (
    <DbProvider>
      <PrinterProvider>
        <div className="min-h-screen bg-[#0F1115] text-[#F8FAFC] flex selection:bg-[#FFB800] selection:text-[#0F1115]">
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
                  className="lg:hidden p-2 rounded-lg hover:bg-[#1A1D25] text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation links list */}
              <nav className="p-3 space-y-1.5">
                {menuItems.map((item) => {
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
            </div>

            {/* Filament Spool Footer */}
            <div className="p-4 border-t border-[#222733] bg-[#0E1014] flex flex-col items-center justify-center gap-2">
              <div className="relative group p-1 bg-[#1A1D25] rounded-xl border border-[#2B303E] flex items-center justify-center">
                <svg 
                  viewBox="0 0 100 100" 
                  className="w-10 h-10 text-slate-500 group-hover:text-amber-400 transition-colors duration-300"
                  fill="none" 
                  stroke="currentColor" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="50" cy="50" r="8" className="fill-[#0F1115] stroke-slate-700" strokeWidth="2" />
                  <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                  <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                  <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
                  <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="2" />
                  <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                  <path 
                    d="M 82 40 C 95 35, 92 65, 80 75 C 65 88, 35 85, 25 70 C 15 55, 12 30, 30 15 C 40 7, 58 10, 70 5" 
                    stroke="#FFB800" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-slate-300 font-mono font-bold">Filamento Cust</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30 font-mono font-bold">
                  v{packageJson.version}
                </span>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full min-w-0">
            {/* Top Header Navbar */}
            <header className="bg-[#14171E] border-b border-[#222733] h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-[#1B1E26] border border-[#2B303E] hover:border-[#FFB800]/50 text-slate-200 transition-colors cursor-pointer"
                  aria-label="Abrir menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 truncate">
                  <h1 className="font-headline-sm text-white text-sm sm:text-base font-bold truncate">
                    {currentLabel}
                  </h1>
                </div>
              </div>

              {/* Status Ribbon & Quick Badges */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#1B1E26] border border-[#2B303E] rounded-full text-[11px] font-mono text-slate-300 font-semibold shadow-inner">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                  </span>
                  <span>ONLINE</span>
                </div>
              </div>
            </header>

            {/* Page body view canvas - Maximizes body and provides fluid responsive layout */}
            <main className="w-full max-w-[1880px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 md:py-8 flex-1 min-w-0">
              {renderView()}
            </main>
          </div>
        </div>
      </PrinterProvider>
    </DbProvider>
  );
}
