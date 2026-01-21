import React, { useState } from 'react';
import { Promoter, PromoterSale } from '../types';

const PromoterRanking = ({ promoters }: { promoters: Promoter[] }) => {
  const sorted = [...promoters].sort((a, b) => b.totalSales - a.totalSales);

  return (
    <div className="bg-black border border-gray-800 rounded-3xl p-6 mb-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"></div>
      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2 italic">
        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
        Ranking de Performance Mensal
      </h3>
      <div className="space-y-3">
        {sorted.map((p, index) => (
          <div key={p.id} className="flex items-center gap-4 group">
            <span className={`font-black italic text-xl w-8 ${index === 0 ? 'text-yellow-500' : 'text-gray-700'}`}>
              #{index + 1}
            </span>
            <div className="flex-1 bg-neutral-900/30 p-4 rounded-2xl border border-gray-800 group-hover:border-[#39FF14]/30 transition-all flex justify-between items-center backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-lg bg-black border border-gray-800" />
                <span className="text-sm font-bold text-gray-200">{p.name}</span>
              </div>
              <span className="text-[10px] font-black bg-[#39FF14]/10 px-3 py-1 rounded-full text-[#39FF14] border border-[#39FF14]/10">
                R$ {p.totalSales.toLocaleString('pt-BR')} VENDIDOS
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Promoters: React.FC = () => {
  const [promoters] = useState<Promoter[]>([
    {
      id: 'P-001',
      name: 'Pedro Alcântara',
      level: 'Gold',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
      totalSales: 8400.00,
      totalCommission: 840.00,
      refCode: 'pedro01',
      recentSales: [
        { id: 'S-1', description: 'Mesa 04 - João M.', amount: 500, commission: 50, date: 'Hoje' },
        { id: 'S-2', description: 'Camarote 01 - Luiza K.', amount: 1500, commission: 150, date: 'Hoje' },
      ]
    },
    {
      id: 'P-002',
      name: 'Juliana Silva',
      level: 'Diamond',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juliana',
      totalSales: 15600.00,
      totalCommission: 1872.00,
      refCode: 'juh_night',
      recentSales: [
        { id: 'S-3', description: 'Vip individual - Marcos', amount: 85, commission: 8.5, date: 'Ontem' },
      ]
    },
    {
      id: 'P-003',
      name: 'Carlos Mendes',
      level: 'Silver',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      totalSales: 2100.00,
      totalCommission: 168.00,
      refCode: 'carlinhos_reserva',
      recentSales: []
    }
  ]);

  const generateReferralLink = (referralCode: string) => {
    const baseUrl = window.location.origin; 
    return `${baseUrl}/reserva?ref=${referralCode}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    if (window.showToast) {
        window.showToast("Link de Promoter copiado!");
    }
  };

  const shareVipDetails = async (sale: PromoterSale) => {
    const shareData = {
      title: `Reserva VIP Confirmada`,
      text: `Resumo da Reserva:\n${sale.description}\nValor: R$ ${sale.amount.toFixed(2)}\nData: ${sale.date}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
        window.showToast("Detalhes copiados para a área de transferência!");
      }
    } catch (err) {
      console.error("Erro ao compartilhar", err);
      window.showToast("Erro ao compartilhar detalhes.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white italic uppercase">
            Rede de <span className="text-[#39FF14]">Promoters</span>
          </h1>
          <p className="text-gray-400 text-sm italic">Gerencie sua força de vendas externa e comissionamento automático.</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-xs font-black border border-gray-800 uppercase tracking-widest hover:bg-gray-800 transition-all">
                Configurar Comissões
            </button>
            <button className="bg-[#39FF14] text-black px-6 py-3 rounded-2xl text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] uppercase tracking-widest">
                Novo Promoter
            </button>
        </div>
      </header>

      <PromoterRanking promoters={promoters} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {promoters.map((p) => (
          <div key={p.id} className="bg-neutral-900 border border-gray-800 p-8 rounded-[2.5rem] group relative overflow-hidden transition-all hover:border-[#39FF14]/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#39FF14]/10 transition-colors"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-xl bg-black border border-gray-800" />
                <div>
                  <h4 className="font-black text-white uppercase italic text-lg">{p.name}</h4>
                  <span className="text-[10px] text-[#39FF14] font-black tracking-widest bg-[#39FF14]/5 px-2 py-0.5 rounded border border-[#39FF14]/10 uppercase">
                    CÓDIGO: {p.refCode}
                  </span>
                </div>
              </div>
              <div className="bg-black/40 px-3 py-1 rounded-full border border-gray-800">
                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Share Rate: 84%</span>
              </div>
            </div>

            {/* Input de Link com Botão de Cópia */}
            <div className="relative mb-8">
              <label className="text-[9px] text-gray-600 uppercase font-black mb-2 block tracking-widest">Link de Vendas Exclusivo</label>
              <div className="relative">
                <input 
                    readOnly 
                    value={generateReferralLink(p.refCode)}
                    className="w-full bg-black border border-gray-800 p-4 rounded-2xl text-[11px] text-gray-400 font-mono pr-12 focus:border-[#39FF14] outline-none transition-all"
                />
                <button 
                    onClick={() => copyToClipboard(generateReferralLink(p.refCode))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#39FF14] transition-all p-2 bg-gray-900/50 rounded-lg"
                >
                    <i className="fa-solid fa-copy"></i>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-black/20 p-4 rounded-2xl border border-gray-800/50">
                  <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Comissão Acumulada</p>
                  <p className="text-lg font-black text-[#39FF14]">R$ {p.totalCommission.toFixed(2)}</p>
               </div>
               <div className="bg-black/20 p-4 rounded-2xl border border-gray-800/50 text-right">
                  <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Taxa por Venda</p>
                  <p className="text-lg font-black text-white">10%</p>
               </div>
            </div>

            <div className="pt-6 border-t border-gray-800/50">
               <div className="flex justify-between items-center mb-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Vendas Recentes</h5>
                  <span className="text-[9px] text-gray-600 font-bold">{p.recentSales.length} Pedidos</span>
               </div>
               <div className="space-y-2">
                  {p.recentSales.slice(0, 2).map(sale => (
                    <div key={sale.id} className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-gray-800/30 text-[10px]">
                      <span className="font-bold text-gray-400">{sale.description}</span>
                      <span className="font-black text-[#39FF14]">+ R$ {sale.commission.toFixed(2)}</span>
                    </div>
                  ))}
                  {p.recentSales.length === 0 && (
                    <div className="text-center py-4 border border-dashed border-gray-800 rounded-xl">
                      <p className="text-[9px] text-gray-600 uppercase font-bold">Sem vendas hoje</p>
                    </div>
                  )}
               </div>
            </div>

            <button className="w-full mt-6 bg-gray-900 hover:bg-white hover:text-black text-white text-[10px] font-black py-4 rounded-2xl transition-all uppercase tracking-widest border border-gray-800">
                Extrato Detalhado
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Promoters;