import { Product, InventoryItem, Material, Customer, Sale, FinancialLog, CostConfig, Seller, Supply } from '../types';

export const initialSupplies: Supply[] = [
  {
    id: "sup-01",
    type: "Caixa de papelão",
    name: "Caixa Padrão 15x15x15",
    provider: "Klabin",
    link: "https://www.klabin.com.br",
    packageQuantity: 50,
    packagePrice: 75.00,
    unitPrice: 1.50,
    purchaseDate: "2026-08-15",
    image: "file:///C:/Users/diego/.gemini/antigravity-ide/brain/a00f9dfd-34a3-4e43-932e-56ff9cba565a/cardboard_box_1788481782406.jpg"
  },
  {
    id: "sup-02",
    type: "Plástico bolha",
    name: "Rolo Plástico Bolha 100m",
    provider: "Embalagens Brasil",
    link: "https://www.embalagensbrasil.com",
    packageQuantity: 100, // em metros
    packagePrice: 45.00,
    unitPrice: 0.45,
    purchaseDate: "2026-08-20",
    image: "file:///C:/Users/diego/.gemini/antigravity-ide/brain/a00f9dfd-34a3-4e43-932e-56ff9cba565a/bubble_wrap_1788481800877.jpg"
  },
  {
    id: "sup-03",
    type: "Fita adesiva",
    name: "Fita Adesiva Durex Marrom 50m",
    provider: "Kalunga",
    link: "https://www.kalunga.com.br",
    packageQuantity: 10,
    packagePrice: 35.00,
    unitPrice: 3.50,
    purchaseDate: "2026-09-01",
    image: "file:///C:/Users/diego/.gemini/antigravity-ide/brain/a00f9dfd-34a3-4e43-932e-56ff9cba565a/adhesive_tape_1788481810511.jpg"
  }
];

export const initialMaterials: Material[] = [
  {
    id: "mat-01",
    name: "Emerald Green PLA",
    color: "Verde Esmeralda",
    brand: "Polymaker Tech",
    initialWeight: 1000,
    currentWeight: 750,
    spoolPrice: 140.00,
    priceHistory: [{"date":"2026-01-01","price":111.01},{"date":"2026-02-01","price":113.07},{"date":"2026-03-01","price":122.82},{"date":"2026-04-01","price":126.52},{"date":"2026-05-01","price":135.89},{"date":"2026-06-01","price":142.67}],
    costPerGram: 0.14,
    purchaseDate: "2026-04-12",
    colorHex: "#10B981",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAP5JWc6jKAnkc0DdSjSZUbufkKbunvXS1hwbdDmQIevKjoV9eQkG64yI5OHRbbat5zwpK3SwlXHzkgmxWiqKIttNX8Rp_31FfIO-LxJTghaakO3JXjB8Tj2un_88xFHp3112ghubi7IDYtEoV4fD0webxlui2PgK31p1vrDNX0yAMXDjIoJE8h638bHZKobxne1_1A3O-b-H7KXlucpn_jh4M0I475wjAcN0Vbq8pUuY53G0ONExtKkFsF3lntVT2juuwrMaXQMZU"
  },
  {
    id: "mat-02",
    name: "Carbon Fiber PETG",
    color: "Fibra de Carbono Preto",
    brand: "Prusament Industrial",
    initialWeight: 1000,
    currentWeight: 210,
    spoolPrice: 320.00,
    priceHistory: [{"date":"2026-01-01","price":250.42},{"date":"2026-02-01","price":259.73},{"date":"2026-03-01","price":275.16},{"date":"2026-04-01","price":293.75},{"date":"2026-05-01","price":315.01},{"date":"2026-06-01","price":324.03}],
    costPerGram: 0.32,
    purchaseDate: "2026-05-02",
    colorHex: "#222222",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8JJh855nCxgEyT7kVb7hUzh7CBGuk1kNflIUgX5VqC4CJ1fkw1gwddjRVMr9KRhbvPRhDKGAZFOAca6w7NhpTR72pdIAmlQL50bjTPpGjE1Be2g624YS6rJyQxTou20FwyBRJeOGg_wmFXAwa8UwSQ4Y-J-p16jr7bA14arXKNHIKTLEKPu4jnnsCipIIYGgzFkdRhho_xUJze8DTrk4O2Y5MNKsdUjQylSlURkYxShwDBhaosqxoE8SXLfYnt4B_uVcc-XBkz5o"
  },
  {
    id: "mat-03",
    name: "Fire Red ABS",
    color: "Vermelho Fogo",
    brand: "Sunlu Tech",
    initialWeight: 1000,
    currentWeight: 920,
    spoolPrice: 110.00,
    priceHistory: [{"date":"2026-01-01","price":87},{"date":"2026-02-01","price":89.35},{"date":"2026-03-01","price":97.66},{"date":"2026-04-01","price":102.95},{"date":"2026-05-01","price":109.78},{"date":"2026-06-01","price":110.14}],
    costPerGram: 0.11,
    purchaseDate: "2026-06-01",
    colorHex: "#DC2626",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvt5ZcSOqhtMILXovumWX0rswNGdB3aEgEFW7B8WyU6E9UoxOfQL9MrlgMTEE3xpT9L7BWwCrWK6UqhDCLB_H-3k4qUhL_jg37sGYoSw5fLuIi80XIMtsYJUKD091bi_wRle9hvI8bVM4ejMglQjqehyfzaj66T4qqgAhUl0UHmvkg8ZaqXVn18_zi7RDjNPZuAK7lT9ByqSClAvM_KmPzWsIN-ItERmlc8MBDWAL_gFcXL1bkc76ULjYRVPdBHzOeFZNeR_Hgikg"
  },
  {
    id: "mat-04",
    name: "Marble White PLA",
    color: "Mármore Branco",
    brand: "ESun 3D",
    initialWeight: 1000,
    currentWeight: 540,
    spoolPrice: 180.00,
    priceHistory: [{"date":"2026-01-01","price":139.09},{"date":"2026-02-01","price":152.72},{"date":"2026-03-01","price":154.65},{"date":"2026-04-01","price":170.78},{"date":"2026-05-01","price":176.44},{"date":"2026-06-01","price":180.88}],
    costPerGram: 0.18,
    purchaseDate: "2026-05-28",
    colorHex: "#E5E7EB",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBh-HmxukFdfK_Y5oBwjxaEZnoqKshor6ds7B6QVRJzXsbAO_xeuVieouGHcYOh94UK6DFaCplsHh3DlHwLVqNc3ru3zj3BzN1J44wnhTk9ANzTFOyxg4q5xcnl_ErfwdUaZzgM2oIkMktBk4MTaN7CZacVqfa_EDOTwEb7BTwAVxWspZThKDt-wN0ZqK-5vxQE01gpG6kCP4n4NWX7LVWmDoY5W7eBIHpUDyl0jLZ8Lo95X5wry50he3rzAAONBuOhap6mHihpZJo"
  }
];

export const initialProducts: Product[] = [
  {
    id: "prod-01",
    name: "Vortex Case MkII",
    category: "Gabinetes",
    weight: 220,
    printTime: 8.5,
    materialId: "mat-01",
    costPrice: 75.40,
    sellPrice: 149.00,
    profit: 73.60
  },
  {
    id: "prod-02",
    name: "Fan Shroud Pro",
    category: "Peças Técnicas",
    weight: 120,
    printTime: 4.5,
    materialId: "mat-02",
    costPrice: 62.10,
    sellPrice: 120.00,
    profit: 57.90
  },
  {
    id: "prod-03",
    name: "ErgoTrack Shell",
    category: "Acessórios",
    weight: 180,
    printTime: 6.0,
    materialId: "mat-03",
    costPrice: 48.80,
    sellPrice: 99.00,
    profit: 50.20
  },
  {
    id: "prod-04",
    name: "Planetary Gear Set",
    category: "Engrenagens",
    weight: 310,
    printTime: 12.0,
    materialId: "mat-04",
    costPrice: 115.00,
    sellPrice: 220.00,
    profit: 105.00
  }
];

export const initialInventory: InventoryItem[] = [
  {
    id: "prod-01",
    name: "Vortex Case MkII",
    category: "Gabinetes",
    stock: 12,
    minStock: 5,
    costPrice: 75.40,
    totalValue: 904.80,
    status: "NORMAL"
  },
  {
    id: "prod-02",
    name: "Fan Shroud Pro",
    category: "Peças Técnicas",
    stock: 3,
    minStock: 5,
    costPrice: 62.10,
    totalValue: 186.30,
    status: "BAIXO"
  },
  {
    id: "prod-03",
    name: "ErgoTrack Shell",
    category: "Acessórios",
    stock: 1,
    minStock: 4,
    costPrice: 48.80,
    totalValue: 48.80,
    status: "CRITICO"
  },
  {
    id: "prod-04",
    name: "Planetary Gear Set",
    category: "Engrenagens",
    stock: 8,
    minStock: 3,
    costPrice: 115.00,
    totalValue: 920.00,
    status: "NORMAL"
  }
];

export const initialCustomers: Customer[] = [
  {
    id: "cli-01",
    name: "Ricardo Mendes",
    company: "Mendes Prototipagem Ltda",
    document: "12.345.678/0001-90",
    email: "ricardo@mendesproto.com.br",
    phone: "(11) 98765-4321",
    category: "Ouro"
  },
  {
    id: "cli-02",
    name: "Ana Julia Rocha",
    company: "Design & Arte Studio",
    document: "321.654.987-00",
    email: "anajulia@designarte.com",
    phone: "(21) 99888-7766",
    category: "Prata"
  },
  {
    id: "cli-03",
    name: "Bruno Gagliasso",
    company: "BG Soluções de Engenharia",
    document: "98.765.432/0001-10",
    email: "bruno@bgengenharia.com",
    phone: "(31) 98888-2222",
    category: "Bronze"
  },
  {
    id: "cli-04",
    name: "Clara Fonseca",
    company: "Fonseca Tech",
    document: "45.123.890/0001-22",
    email: "clara@fonsecatech.com",
    phone: "(11) 99111-5544",
    category: "Prata"
  }
];

export const initialSales: Sale[] = [
  {
    id: "vend-01",
    date: "2026-06-10",
    clientId: "cli-01",
    clientName: "Ricardo Mendes",
    productId: "prod-01",
    productName: "Vortex Case MkII",
    quantity: 4,
    totalValue: 596.00,
    totalCost: 301.60,
    profit: 294.40
  },
  {
    id: "vend-02",
    date: "2026-06-12",
    clientId: "cli-02",
    clientName: "Ana Julia Rocha",
    productId: "prod-02",
    productName: "Fan Shroud Pro",
    quantity: 6,
    totalValue: 720.00,
    totalCost: 372.60,
    profit: 347.40
  },
  {
    id: "vend-03",
    date: "2026-06-15",
    clientId: "cli-03",
    clientName: "Bruno Gagliasso",
    productId: "prod-03",
    productName: "ErgoTrack Shell",
    quantity: 2,
    totalValue: 198.00,
    totalCost: 97.60,
    profit: 100.40
  },
  {
    id: "vend-04",
    date: "2026-06-20",
    clientId: "cli-04",
    clientName: "Clara Fonseca",
    productId: "prod-04",
    productName: "Planetary Gear Set",
    quantity: 3,
    totalValue: 660.00,
    totalCost: 345.00,
    profit: 315.00
  },
  {
    id: "vend-05",
    date: "2026-06-21",
    clientId: "cli-01",
    clientName: "Ricardo Mendes",
    productId: "prod-04",
    productName: "Planetary Gear Set",
    quantity: 2,
    totalValue: 440.00,
    totalCost: 230.00,
    profit: 210.00
  }
];

export const initialFinancialLogs: FinancialLog[] = [
  {
    id: "fin-01",
    date: "2026-06-10",
    type: "RECEITA",
    description: "Venda - Ricardo Mendes - 4x Vortex Case",
    category: "Vendas",
    value: 596.00
  },
  {
    id: "fin-02",
    date: "2026-06-12",
    type: "RECEITA",
    description: "Venda - Ana Julia Rocha - 6x Fan Shroud Pro",
    category: "Vendas",
    value: 720.00
  },
  {
    id: "fin-03",
    date: "2026-06-13",
    type: "DESPESA",
    description: "Compra de Filamento - Polymaker Green",
    category: "Insumos",
    value: 140.00
  },
  {
    id: "fin-04",
    date: "2026-06-15",
    type: "RECEITA",
    description: "Venda - Bruno Gagliasso - 2x ErgoTrack Shell",
    category: "Vendas",
    value: 198.00
  },
  {
    id: "fin-05",
    date: "2026-06-18",
    type: "DESPESA",
    description: "Manutenção Impressora - Bicos e PTFE",
    category: "Manutenção",
    value: 85.00
  },
  {
    id: "fin-06",
    date: "2026-06-20",
    type: "RECEITA",
    description: "Venda - Clara Fonseca - 3x Planetary Gear Set",
    category: "Vendas",
    value: 660.00
  },
  {
    id: "fin-07",
    date: "2026-06-21",
    type: "RECEITA",
    description: "Venda - Ricardo Mendes - 2x Planetary Gear Set",
    category: "Vendas",
    value: 440.00
  }
];

export const initialCostConfig: CostConfig = {
  kwhPrice: 0.92,
  energyConsumption: 0.35, // 350 Watts typical printer
  hourlyOperationalCost: 5.00, // R$ 5,00 operador por hora máquina
  defaultProfitMargin: 40, // 40% margin
  taxesPercent: 6, // 6% simples nacional
  currency: "R$"
};
