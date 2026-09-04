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
  ChevronDown,
  TrendingUp
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  return (
    <DbProvider>
      <PrinterProvider>
      <div className="min-h-screen bg-[#121418] flex">
        {/* Sidebar Navigation */}
        <aside 
          className={`bg-[#121418] text-white w-64 fixed top-0 bottom-0 left-0 z-40 transition-transform duration-300 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } flex flex-col justify-between border-r border-slate-800 shadow-xl`}
        >
          {/* Top Logo Brand */}
          <div>
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#0084FF] rounded-lg shadow-inner text-white">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-headline-sm text-sm text-white font-extrabold tracking-tight leading-none">Filamento Cust</h1>
                  <span className="text-[10px] text-slate-400 font-medium">Controle Industrial 3D</span>
                </div>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links list */}
            <nav className="p-4 space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      // Close sidebar on mobile after clicking
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-[#0084FF] text-white shadow-md font-bold' 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Filament Silhouette Footer */}
          <div className="p-5 border-t border-slate-800/80 bg-slate-900/40 flex flex-col items-center justify-center gap-2">
            <div className="relative group p-1 bg-slate-800/40 rounded-xl border border-slate-800/60 shadow-inner flex items-center justify-center">
              <svg 
                viewBox="0 0 100 100" 
                className="w-12 h-12 text-slate-400 group-hover:text-slate-200 transition-colors duration-300"
                fill="none" 
                stroke="currentColor" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Spool center cutout */}
                <circle cx="50" cy="50" r="8" className="fill-slate-900 stroke-slate-700" strokeWidth="2" />
                
                {/* Spool inner ring */}
                <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                
                {/* Coiled filament representation (concentric circles) */}
                <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
                <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="2" />
                
                {/* Spool outer structural rim */}
                <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                
                {/* Filament thread unspooling from the top-right and winding down in an elegant curve */}
                <path 
                  d="M 82 40 C 95 35, 92 65, 80 75 C 65 88, 35 85, 25 70 C 15 55, 12 30, 30 15 C 40 7, 58 10, 70 5" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  className="text-[#0084FF]"
                />
              </svg>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono font-bold">Filamento Cust</span>
            <span className="text-[10px] text-slate-500 font-mono">v{packageJson.version}</span>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
          {/* Top Header Navbar */}
          <header className="bg-[#1C1F24] border-b border-[#2B2F36] h-16 px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg border border-[#2B2F36] hover:bg-[#121418] text-slate-300"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="font-headline-sm text-white text-sm font-bold capitalize">
                {menuItems.find(item => item.id === activeView)?.label || 'Filamento Cust'}
              </h1>
            </div>

            {/* Indicators Ribbon */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#2B2F36] rounded text-[10px] font-mono text-slate-400 font-bold">
                <span className="w-2 h-2 bg-[#22C55E] rounded-full"></span>
                SISTEMA OPERACIONAL
              </div>
            </div>
          </header>

          {/* Page body view canvas */}
          <main className="p-6 md:p-8 max-w-7xl w-full mx-auto flex-1">
            {renderView()}
          </main>
        </div>
      </div>
    </PrinterProvider>
    </DbProvider>
  );
}
