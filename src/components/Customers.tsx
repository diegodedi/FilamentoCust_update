import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { Customer } from '../types';
import { Search, Plus, Edit, Trash2, Mail, Phone, Building2, ShieldAlert, X } from 'lucide-react';

export const Customers: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useDb();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'Bronze' | 'Prata' | 'Ouro'>('Bronze');

  const categories = ['Todas', 'Bronze', 'Prata', 'Ouro'];

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setCompany('');
    setDocument('');
    setEmail('');
    setPhone('');
    setCategory('Bronze');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setCompany(c.company);
    setDocument(c.document);
    setEmail(c.email);
    setPhone(c.phone);
    setCategory(c.category);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = { name, company, document, email, phone, category };

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, { ...editingCustomer, ...payload });
    } else {
      addCustomer(payload);
    }
    setIsModalOpen(false);
  };

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-white mb-1">Painel CRM e Clientes</h2>
          <p className="text-slate-400 font-body-md">Gerencie a carteira de contatos comerciais, classificações de fidelidade e faturamentos corporativos.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-[#0084FF] text-white px-5 py-2.5 rounded-lg font-label-md hover:bg-[#0084FF]/90 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, empresa ou e-mail..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#2B2F36] rounded-lg text-slate-200 bg-[#121418] outline-none focus:ring-2 focus:ring-[#0084FF]/50 text-xs"
          />
        </div>
        
        <div className="flex gap-2">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-medium border cursor-pointer whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-slate-900 border-slate-900 text-white font-bold' 
                  : 'bg-[#1C1F24] border-[#2B2F36] text-slate-400 hover:bg-[#121418]'
              }`}
            >
              {cat === 'Todas' ? 'Categoria: Todas' : `Categoria: ${cat}`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Contatos / Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCustomers.map((cust) => {
          const badgeColor = cust.category === 'Ouro' 
            ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
            : cust.category === 'Prata' 
            ? 'bg-[#2B2F36] text-white border-[#2B2F36]' 
            : 'bg-amber-100 text-amber-900 border-amber-200';

          return (
            <div key={cust.id} className="bg-[#1C1F24] border border-[#2B2F36] rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm truncate leading-tight">{cust.name}</h3>
                    {cust.company && (
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3" /> {cust.company}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${badgeColor}`}>
                    {cust.category}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-medium text-slate-400 pt-3 border-t border-[#2B2F36]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{cust.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cust.phone}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    CNPJ/CPF: {cust.document}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-[#2B2F36]">
                <button 
                  onClick={() => handleOpenEditModal(cust)}
                  className="p-1.5 hover:bg-[#2B2F36] text-slate-400 hover:text-white rounded transition-colors"
                  title="Editar cadastro"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteCustomer(cust.id)}
                  className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                  title="Excluir cadastro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Registrar/Editar Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1F24] rounded-xl border border-[#2B2F36] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-[#2B2F36] bg-[#121418] flex justify-between items-center">
              <h3 className="font-headline-sm text-white">
                {editingCustomer ? 'Editar Ficha do Cliente' : 'Cadastrar Novo Cliente'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-300 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-xs uppercase">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: João da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Empresa / Razão Social</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Silva Peças ME"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">CPF ou CNPJ</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: 00.000.000/0001-00"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">E-mail de Contato</label>
                  <input 
                    type="email" 
                    required
                    placeholder="Ex: joao@silva.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-slate-400 text-xs uppercase">Telefone / WhatsApp</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: (11) 98888-7777"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-[#2B2F36] rounded-lg text-sm bg-[#121418] outline-none focus:border-[#0084FF]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-slate-400 text-xs uppercase">Categoria Comercial</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-[#2B2F36] rounded-lg text-sm bg-[#1C1F24] outline-none"
                >
                  <option value="Bronze">Bronze (Clientes Eventuais)</option>
                  <option value="Prata">Prata (Clientes Recorrentes)</option>
                  <option value="Ouro">Ouro (Parceiros Industriais Premium)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#2B2F36] text-slate-400 rounded-lg text-xs font-label-md hover:bg-[#121418] cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#0084FF] hover:bg-[#0084FF]/90 text-white rounded-lg text-xs font-label-md cursor-pointer"
                >
                  {editingCustomer ? 'Salvar Ficha' : 'Criar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
