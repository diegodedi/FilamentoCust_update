export interface ProductFilament {
  materialId: string;
  weight: number;
}

export interface ProductPart {
  id: string;
  name: string;
  weight: number; // in grams
  printTime: number; // in hours
  materialId: string;
  colorMode?: 'MONO' | 'MULTI';
  filaments?: ProductFilament[];
  quantity: number; // Quantidade de peças necessárias dessa parte para compor 1 produto
  unitsPerPrint?: number; // Duplicidade da peça na mesa (quantas são impressas por vez)
}

export interface Product {
  id: string;
  name: string;
  category: string;
  weight: number; // in grams
  printTime: number; // in hours
  materialId: string;
  colorMode?: 'MONO' | 'MULTI';
  filaments?: ProductFilament[];
  isMultipart?: boolean;
  parts?: ProductPart[];
  accessoryCost?: number; // Optional accessory cost
  costPrice: number; // calculated cost
  b2bPrice?: number; // calculated B2B price
  sellPrice: number;
  profit: number; // calculated profit
  unitsPerPrint?: number;
  image?: string;
}

export interface InventoryItem {
  id: string; // references Product.id
  name: string;
  category: string;
  stock: number;
  minStock: number;
  costPrice: number;
  totalValue: number; // stock * costPrice
  status: 'NORMAL' | 'BAIXO' | 'CRITICO';
  partsStock?: Record<string, number>;
}

export interface Seller {
  id: string;
  name: string;
  link: string;
}

export interface Material {
  id: string;
  name: string;
  color: string;
  brand: string;
  initialWeight: number; // in grams (usually 1000g)
  currentWeight: number; // in grams
  spoolPrice: number; // in R$
  costPerGram: number; // spoolPrice / initialWeight
  purchaseDate: string;
  sellerId?: string;
  image?: string;
  colorHex?: string;
  priceHistory?: { date: string; price: number; sellerId?: string }[];
}

export interface Supply {
  id: string;
  type: 'Caixa de papelão' | 'Plástico bolha' | 'Fita adesiva' | 'Outros';
  name: string; // Nome ou marca do produto
  provider: string; // Nome do fornecedor
  link: string; // Link do fornecedor
  packageQuantity: number; // Quantidade por pacote
  packagePrice: number; // Valor total do pacote (R$)
  unitPrice: number; // Valor unitário calculado (R$)
  image?: string;
  purchaseDate: string;
  notes?: string;
}

export interface CostConfig {
  kwhPrice: number;
  energyConsumption: number; // kWh/h
  hourlyOperationalCost: number; // hourly operator / machine rate
  defaultProfitMargin: number; // in percentage
  taxesPercent: number; // in percentage
  currency: string;
}

export interface Sale {
  id: string;
  date: string;
  clientId: string;
  clientName: string;
  productId: string;
  productName: string;
  quantity: number;
  totalValue: number;
  totalCost: number;
  profit: number;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  document: string; // CPF or CNPJ
  email: string;
  phone: string;
  category: 'Bronze' | 'Prata' | 'Ouro';
}

export interface FinancialLog {
  id: string;
  date: string;
  type: 'RECEITA' | 'DESPESA';
  description: string;
  category: string;
  value: number;
}

export interface SyncConfig {
  mode: 'local' | 'gas' | 'direct';
  gasUrl: string; // Google Apps Script URL
  connected: boolean;
  spreadsheetId?: string;
  spreadsheetName?: string;
  userEmail?: string;
}

export interface Printer {
  id: string;
  name: string;
  model: string;
  ip: string;
  port: number;
  protocol: 'MOONRAKER' | 'WebSocket' | 'GENERIC';
  monitoringEnabled: boolean;
}

export interface PrintJob {
  id: string;
  printerId: string;
  printerName: string;
  fileName: string;
  normalizedFileName: string;
  productId: string | null;
  productName: string | null;
  partId?: string | null;
  partName?: string | null;
  status: 'PRINTING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'ERROR';
  startedAt: string;
  completedAt: string | null;
  duration: number; // in seconds
  progress: number; // 0 to 1
  quantityProduced: number;
  filamentConsumption: PrintJobFilament[];
  inventoryApplied: boolean;
  createdAt: string;
}
