
import React, { useState } from 'react';
import { SubAccount } from '../types';

const Partners: React.FC = () => {
  const [partners, setPartners] = useState<SubAccount[]>([
    { 
        id: 'SUB-001', 
        name: 'Boate Luxo LTDA', 
        email: 'financeiro@boateluxo.com', 
        cpfCnpj: '00.000.000/0001-00', 
        status: 'ACTIVE', 
        balance: 12450.00,
        splitConfig: { platformFixed: 100.00, partnerPercent: 100 }
    },
    { 
        id: 'SUB-002', 
        name: 'Arena Funk S/A', 
        email: 'contato@arenafunk.br', 
        cpfCnpj: '11.111.111/0001-11', 
        status: 'PENDING', 
        balance: 0,
        splitConfig: { platformFixed: 50.00, partnerPercent: 100 }
    },
    { 
        id: 'SUB-003', 
        name: 'Premium Club Lounge', 
        email: 'owner@premiumclub.com', 
        cpfCnpj: '22.222.222/0001-22', 
        status: 'ACTIVE', 
        balance: 5620.40,
        splitConfig: { platformFixed: 100.00, partnerPercent: 100 }
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(false);
    window.showToast("Nova subconta criada com sucesso!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white italic uppercase">
            Parceiros <span className="text-[#39FF14]">SaaS</span>
          </h1>
          <p className="text-gray-400 text-sm">Controle central de subcontas Asaas e regras de repasse de valores.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-[#39FF14] text-black px-8 py-4 rounded-2xl text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(57,255,20,0.4)] flex items-center gap-2 uppercase tracking-widest"
        >
          <i className="fa-solid fa-plus text-sm"></i>
          Ativar Nova Balada
        </button>
      </header>

      {/* Partners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <div key={partner.id} className="bg-black border border-gray-800 rounded-[2rem] p-8 hover:border-[#39FF14]/50 transition-all group flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-[#39FF14] group-hover:shadow-[0_0_15px_rgba(57,255,20,0.2)] transition-all">
                <i className="fa-solid fa-building-shield text-2xl"></i>
              </div>
              <div className="flex items-center gap-2">
                {partner.status === 'PENDING' && <span className="badge-new-partner"></span>}
                <span className={`text-[10px] px-3 py-1 rounded-full font-black tracking-tighter ${
                  partner.status === 'ACTIVE' ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {partner.status}
                </span>
              </div>
            </div>
            
            <div className="flex-1 relative z-10">
                <h3 className="font-bold text-xl mb-1 group-hover:text-[#39FF14] transition-colors">{partner.name}</h3>
                <p className="text-xs text-gray-500 mb-6 font-medium">{partner.email}</p>
                
                <div className="bg-gray-900/30 rounded-2xl p-5 border border-gray-800/50 mb-6 backdrop-blur-sm">
                    <p className="text-[10px] text-gray-600 uppercase font-black mb-4 border-b border-gray-800 pb-2 tracking-[0.1em]">Split de Pagamento</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Taxa de Conveniência (NF)</span>
                          <span className="text-sm font-black text-blue-400">R$ {partner.splitConfig.platformFixed.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Repasse Mesa (Parceiro)</span>
                          <span className="text-sm font-black text-[#39FF14]">{partner.splitConfig.partnerPercent}% do Resto</span>
                      </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-gray-800/50 relative z-10">
              <div>
                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1">Volume em Aberto</p>
                <p className="text-lg font-black text-white">R$ {partner.balance.toLocaleString('pt-BR')}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1">Status Carteira</p>
                <p className="text-[10px] font-mono text-gray-500 uppercase flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  READY
                </p>
              </div>
            </div>

            <div className="flex gap-3 relative z-10">
              <button 
                onClick={() => window.showToast("Abra as configurações de taxas...")}
                className="flex-1 bg-white/5 hover:bg-[#39FF14] hover:text-black text-white text-[10px] font-black py-4 rounded-xl border border-white/5 transition-all uppercase tracking-widest"
              >
                Gerenciar Taxas
              </button>
              <button 
                onClick={() => window.showToast("Carregando analytics do parceiro...")}
                className="bg-white/5 hover:bg-gray-800 px-4 rounded-xl border border-white/5 transition-colors"
              >
                <i className="fa-solid fa-chart-line text-gray-400"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="max-w-2xl w-full bg-black border border-gray-800 rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
            <button 
              onClick={() => setIsCreating(false)}
              className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-xmark text-2xl"></i>
            </button>

            <h2 className="text-3xl font-black mb-6 text-[#39FF14] italic uppercase tracking-tighter">ATIVAR RECEBIMENTOS</h2>
            <p className="text-gray-400 mb-10 text-sm leading-relaxed max-w-lg">Crie a subconta financeira do parceiro. Os pagamentos das mesas cairão direto na conta bancária via Asaas com split automático (Sua taxa fica retida).</p>
            
            <form id="setup-financeiro" className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Razão Social / Nome Fantasia</label>
                    <input type="text" className="w-full bg-gray-900/50 border border-gray-800 p-4 rounded-2xl focus:border-[#39FF14] text-white outline-none transition-all placeholder:text-gray-700" placeholder="Ex: Boate Luxe LTDA" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">CPF ou CNPJ</label>
                        <input type="text" className="w-full bg-gray-900/50 border border-gray-800 p-4 rounded-2xl focus:border-[#39FF14] text-white outline-none transition-all placeholder:text-gray-700" placeholder="00.000.000/0001-00" required />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Email Financeiro</label>
                        <input type="email" className="w-full bg-gray-900/50 border border-gray-800 p-4 rounded-2xl focus:border-[#39FF14] text-white outline-none transition-all placeholder:text-gray-700" placeholder="financeiro@suabalada.com" required />
                    </div>
                </div>

                <div className="bg-[#39FF14]/5 rounded-3xl p-6 border border-[#39FF14]/10 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <i className="fa-solid fa-arrows-split-up-and-left text-[#39FF14]"></i>
                    <h4 className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest">Configuração de Split (Fixed + Percent)</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[9px] text-gray-500 uppercase font-black">Sua Taxa Fixa (NightFlow)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-600 text-xs">R$</span>
                        <input type="number" defaultValue="100.00" className="w-full bg-black/40 border border-gray-800 p-3 pl-10 rounded-xl text-xs outline-none focus:border-[#39FF14]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] text-gray-500 uppercase font-black">Repasse Mesa (Parceiro %)</label>
                      <div className="relative">
                        <span className="absolute right-4 top-3 text-gray-600 text-xs">%</span>
                        <input type="number" defaultValue="100" className="w-full bg-black/40 border border-gray-800 p-3 rounded-xl text-xs outline-none focus:border-[#39FF14]" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-4 italic">O motor Asaas processará: [Venda Total] - [Taxa Fixa] = [Repasse ao Parceiro].</p>
                </div>

                <button type="submit" className="w-full bg-[#39FF14] text-black font-black py-5 rounded-[1.5rem] shadow-[0_0_30px_rgba(57,255,20,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-sm mt-4">
                    GERAR CARTEIRA DIGITAL
                </button>
                <p className="text-[10px] text-center text-gray-600 uppercase tracking-widest">
                  Compliance Bancário e Segurança Asaas
                </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
