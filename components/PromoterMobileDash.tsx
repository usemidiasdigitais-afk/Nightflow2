import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface PromoterStats {
  clicks: number;
  sales: number;
  balance: number;
}

const PromoterMobileDash: React.FC<{ promoterCode: string; onLogout: () => void }> = ({ promoterCode, onLogout }) => {
  const [stats, setStats] = useState<PromoterStats>({ clicks: 124, sales: 12, balance: 350.00 });
  const [loading, setLoading] = useState(false);

  // Simulated fetch for promoter stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      // In a real app, we'd query the 'transactions' table for this refCode
      // For now, we simulate a small delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setLoading(false);
    };
    fetchStats();
  }, [promoterCode]);

  const handleCopyLink = () => {
    const link = `https://nightflow.com/reserva?ref=${promoterCode}`;
    navigator.clipboard.writeText(link);
    if (window.showToast) window.showToast("Link copiado para o Insta!");
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#050505] min-h-screen text-white font-sans max-w-md mx-auto relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-20%] w-64 h-64 bg-[#39FF14]/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[20%] right-[-20%] w-64 h-64 bg-blue-500/5 rounded-full blur-[100px]"></div>

      {/* Header */}
      <header className="flex justify-between items-center py-4 relative z-10">
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#39FF14] rounded-full shadow-[0_0_10px_#39FF14]"></div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter">
            NIGHTFLOW <span className="text-[#39FF14]">PARTNER</span>
            </h2>
        </div>
        <button 
          onClick={onLogout}
          className="w-10 h-10 rounded-2xl bg-gray-900 border border-white/5 flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <i className="fa-solid fa-power-off text-sm"></i>
        </button>
      </header>

      {/* Saldo Principal */}
      <div className="bg-gradient-to-br from-neutral-900 to-black p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#39FF14]/10 rounded-full blur-3xl group-hover:bg-[#39FF14]/20 transition-all duration-700"></div>
        <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] mb-3 italic">Saldo Disponível para Saque</p>
        <div className="flex items-baseline gap-1">
          <span className="text-[#39FF14] text-2xl font-bold italic">R$</span>
          <h1 className="text-6xl font-black text-white italic tracking-tighter">
            {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h1>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
            <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest italic">Status: Verificado</span>
            <button className="text-[9px] bg-white text-black font-black px-4 py-2 rounded-full uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Saque Rápido</button>
        </div>
      </div>

      {/* Performance Grid */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="bg-neutral-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 group hover:border-white/10 transition-all">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
            <i className="fa-solid fa-mouse-pointer text-xs"></i>
          </div>
          <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1 italic">Cliques no Link</p>
          <p className="text-3xl font-black">{stats.clicks}</p>
        </div>
        <div className="bg-neutral-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 group hover:border-[#39FF14]/20 transition-all">
          <div className="w-8 h-8 rounded-xl bg-[#39FF14]/10 flex items-center justify-center mb-4 text-[#39FF14]">
            <i className="fa-solid fa-fire text-xs"></i>
          </div>
          <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1 italic">Vendas Diretas</p>
          <p className="text-3xl font-black text-[#39FF14]">{stats.sales}</p>
        </div>
      </div>

      {/* Feed de Vendas */}
      <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar relative z-10 pb-20">
        <h3 className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] italic px-2">Histórico de Atividade</h3>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-neutral-900/20 p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-neutral-900/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black border border-gray-800 flex items-center justify-center text-[10px] font-black text-gray-600">
                0{i+1}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-200 uppercase tracking-tight italic">Comissão Combo Galera</p>
                <p className="text-[9px] text-gray-600 font-black uppercase">Ref: NF-{Math.floor(Math.random() * 9000) + 1000}</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-[#39FF14] bg-[#39FF14]/10 px-3 py-1.5 rounded-full border border-[#39FF14]/20">
              + R$ 25,00
            </span>
          </div>
        ))}
      </div>

      {/* Floating Share Link */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/95 to-transparent z-30">
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleCopyLink}
            className="w-full bg-[#39FF14] hover:bg-white text-black font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(57,255,20,0.4)] active:scale-[0.97] transition-all group"
          >
            <i className="fa-solid fa-copy text-sm group-hover:rotate-12 transition-transform"></i>
            <span className="text-xs uppercase tracking-[0.2em]">COPIAR LINK DE DIVULGAÇÃO</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoterMobileDash;
