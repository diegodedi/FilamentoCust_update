# 🗺️ Filamento Cust — Project Map

## Stack
- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4, Lucide React
- Desktop: Electron 44, Electron Builder
- Sync/Storage: LocalStorage, Google Sheets API (GAS / Direct API), Firebase Auth
- Background Service: Printer Bridge (Express, OctoPrint/Moonraker API)

## Folder Structure
src/
  components/           → UI views (Sales, Customers, Finance, Products, Inventory, etc.)
  context/              → DbContext (data persistence & sync), PrinterContext
  data/                 → Initial/demo data (initialData.ts)
  services/             → Printer integration and communication services
  utils/                → Google Sheets sync, GAS code generator, math helpers
  types.ts              → TypeScript domain interfaces and types
printer-bridge/         → Local node service for 3D printer communication

## Routes / Views
Painel Central          → Central dashboard & operational metrics
Produção                → 3D Printer queue and live status
Termômetro 3D           → Printer temperature and state monitor
Produtos                → Product catalog management
Pesquisa de Produtos    → Market research and product price checker
Controle de Estoque     → Inventory control and movements
Filamentos              → Spool inventory and material management
Insumos                 → Additional supplies & components
Calculadora de Custos   → Pricing and production cost calculator
Vendas e Faturamento    → Sales registry, orders and profit analysis
Clientes e CRM          → Customer contacts, CRM categories (Bronze/Prata/Ouro)
Financeiro              → Cash flow, revenue and expense ledger
Configurações           → System settings and Google Sheets sync

## Key Files
src/context/DbContext.tsx → Central data context, CRUD methods and LocalStorage/Sheets sync
src/types.ts              → Types for Product, Sale, Customer, FinancialLog, etc.
package.json              → Dependencies and Electron build scripts

## Storage Keys (LocalStorage)
forge_products · forge_inventory · forge_materials · forge_customers · forge_sales · forge_financial · forge_config · 3derp_printers · 3derp_printJobs

## Last updated: 2026-10-21
