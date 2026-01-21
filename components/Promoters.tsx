
import React, { useState } from 'react';
import { Promoter, PromoterSale } from '../types';

const Promoters: React.FC = () => {
  const [promoters] = useState<Promoter[]>([
    {
      id: 'P-001',
      name: 'Pedro Alcântara',
      level: 'Gold',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
      totalSales: 8400.00,
      totalCommission: 840.00,
      refCode: 'nightflow.com/vips?ref=pedro01',
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
      refCode: 'nightflow.com/vips?ref=juh_night',
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
      refCode: 'nightflow.com/vips?ref=carlinhos_reserva',
      recentSales: []
    }
  ]);

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    window.showToast('Link de vendas copiado!');
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
          <p className="text-gray-400 text-sm">Gerencie sua força de vendas externa e comissionamento automático.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {promoters.map((promoter) => (
          <div key={promoter.id} className="bg-black border border-gray-800 rounded-[2.5rem] p-8 hover:border-[#39FF14]/40 transition-all group flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#39FF14]/10 transition-colors"></div>
            
            {/* Header / Avatar */}
            <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="relative">
                    <img src={promoter.avatar} alt={promoter.name} className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 object-cover" />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-black flex items-center justify-center text-[8px] font-black ${
                        promoter.level === 'Diamond' ? 'bg-blue-400 text-white' : 
                        promoter.level === 'Gold' ? 'bg-yellow-500 text-black' : 'bg-gray-400 text-black'
                    }`}>
                        {promoter.level[0]}
                    </div>
                </div>
                <div>
                    <h2 className="font-bold text-lg group-hover:text-[#39FF14] transition-colors">{promoter.name}</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Promoter Oficial • Nível {promoter.level}</p>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                <div className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-800 group-hover:border-gray-700 transition-colors">
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Vendas Totais</p>
                    <p className="text-xl font-black text-white">R$ {promoter.totalSales.toLocaleString('pt-BR')}</p>
                </div>
                <div className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-800 group-hover:border-gray-700 transition-colors">
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Comissão</p>
                    <p className="text-xl font-black text-[#39FF14]">R$ {promoter.totalCommission.toLocaleString('pt-BR')}</p>
                </div>
            </div>

            {/* Link Section */}
            <div className="mb-8 relative z-10">
                <label className="text-[9px] text-gray-600 uppercase font-black mb-3 block tracking-widest text-center">Referral Link Unique</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        readOnly 
                        value={promoter.refCode} 
                        className="flex-1 bg-black/40 border border-gray-800 p-3 rounded-xl text-[10px] font-mono text-gray-400 outline-none"
                    />
                    <button 
                        onClick={() => copyLink(promoter.refCode)}
                        className="bg-white text-black px-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
                    >
                        COPY
                    </button>
                </div>
            </div>

            {/* Recent Sales List */}
            <div className="flex-1 relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Vendas Recentes</h3>
                    <span className="text-[9px] text-gray-600 font-bold uppercase">{promoter.recentSales.length} Pedidos</span>
                </div>
                <div className="space-y-3">
                    {promoter.recentSales.length > 0 ? (
                        promoter.recentSales.map((sale) => (
                            <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-900/30 rounded-xl border border-gray-800/50 hover:bg-gray-800/50 transition-colors group/sale">
                                <div className="space-y-0.5">
                                    <div className="group/detail relative">
                                        <span className="text-xs font-bold text-gray-300 block cursor-help border-b border-dotted border-gray-500 w-fit">{sale.description}</span>
                                        
                                        {/* Sale Detail Popover */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/detail:block w-48 bg-white text-black p-3 rounded-xl text-[10px] shadow-2xl z-20">
                                            <p className="font-bold border-b border-gray-200 mb-2 pb-1 uppercase tracking-tighter">Detalhes da Venda</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Valor Bruto:</span> 
                                                    <span className="font-bold">R$ {sale.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-green-600 uppercase">
                                                    <span>Sua parte (10%):</span> 
                                                    <span>R$ {sale.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                            {/* Arrow */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] text-gray-500 font-black uppercase tracking-tighter">{sale.date}</span>
                                      <button 
                                        onClick={() => shareVipDetails(sale)}
                                        className="text-[10px] text-gray-600 hover:text-[#39FF14] transition-colors p-1"
                                        title="Compartilhar detalhes"
                                      >
                                        <i className="fa-solid fa-share-nodes"></i>
                                      </button>
                                    </div>
                                </div>
                                <span className="text-[10px] bg-[#39FF14]/10 text-[#39FF14] px-2 py-1 rounded-full font-black border border-[#39FF14]/10">
                                    + R$ {sale.commission.toFixed(2)}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 border border-dashed border-gray-800 rounded-2xl">
                            <p className="text-[10px] text-gray-600 uppercase font-bold">Sem atividade recente</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Button */}
            <button className="mt-8 w-full bg-gray-900 hover:bg-white hover:text-black text-white text-[10px] font-black py-4 rounded-2xl transition-all uppercase tracking-[0.2em] border border-gray-800">
                Ver Histórico Completo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Promoters;
