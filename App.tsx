
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar, { TabType } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import Finance from './components/Finance';
import Partners from './components/Partners';
import Entrance from './components/Entrance';
import Promoters from './components/Promoters';
import { Auth } from './components/Auth';
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';

declare global {
  interface Window {
    showToast: (message: string) => void;
  }
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [metrics, setMetrics] = useState({
    revenue: 0,
    checkins: 42,
    pendingTickets: 7,
    occupancy: 18
  });

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  useEffect(() => {
    window.showToast = showToast;
  }, [showToast]);

  // Gestão de Sessão Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Busca inicial de faturamento real (apenas se logado)
  useEffect(() => {
    if (!session) return;

    const fetchInitialMetrics = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('tenant_id', session.user.id);
      
      if (data && !error) {
        const total = data.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
        setMetrics(prev => ({ ...prev, revenue: total }));
      } else if (error) {
        console.error("Erro ao sincronizar faturamento inicial:", error.message);
      }
    };

    fetchInitialMetrics();
  }, [session]);

  // Integração Supabase Realtime (apenas se logado) com Filtro de Segurança
  useEffect(() => {
    if (!session) return;

    const salesChannel = supabase
      .channel('public:transactions')
      .on('postgres_changes' as any, 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'transactions',
          filter: `tenant_id=eq.${session.user.id}`
        }, 
        (payload: any) => {
          showToast(`Nova venda detectada: R$ ${payload.new.amount} via ${payload.new.type}`);
          setMetrics(prev => ({
              ...prev,
              revenue: prev.revenue + payload.new.amount,
              pendingTickets: prev.pendingTickets + 1
          }));
        }
      )
      .subscribe();

    return () => {
        supabase.removeChannel(salesChannel);
    };
  }, [showToast, session]);

  const handleAddSale = async (amount: number) => {
    if (!session) return;

    const { error } = await supabase
      .from('transactions')
      .insert({ 
         amount, 
         type: 'UPSELL', 
         tenant_id: session.user.id // Vincula a venda à boate logada
      });
      
    if (error) {
      showToast("Erro ao registrar no banco: " + error.message);
    } else {
      // O faturamento (revenue) e pendingTickets são atualizados via realtime listener.
      // Atualizamos apenas métricas de fluxo local se necessário (ex: checkins).
      setMetrics(prev => ({
        ...prev,
        checkins: prev.checkins + 1
      }));
      showToast("Venda registrada no banco!");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showToast("Sessão encerrada.");
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard metrics={metrics} />;
      case 'entrance':
        return <Entrance />;
      case 'promoters':
        return <Promoters />;
      case 'chat':
        return (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <header className="mb-6 max-w-4xl mx-auto">
              <h1 className="text-2xl font-black tracking-tight uppercase italic">AI <span className="text-[#39FF14]">Revenue Simulator</span></h1>
              <p className="text-gray-400 text-sm tracking-tight italic">Valide o motor de Upsell. Pedidos confirmados refletem no Dashboard.</p>
            </header>
            <ChatInterface onConfirmSale={handleAddSale} />
          </div>
        );
      case 'finance':
        return <Finance totalRevenue={metrics.revenue} />;
      case 'partners':
        return <Partners />;
      default:
        return <Dashboard metrics={metrics} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/5 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin absolute top-0 shadow-[0_0_20px_rgba(57,255,20,0.4)]"></div>
        </div>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] animate-pulse">Sincronizando NightFlow...</p>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex selection:bg-[#39FF14] selection:text-black">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-black border-b border-gray-800 p-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#39FF14] rounded-full shadow-[0_0_10px_#39FF14]"></div>
            <span className="font-black text-xs tracking-tighter uppercase">NightFlow Live</span>
        </div>
        <button className="text-gray-400" onClick={handleLogout}>
            <i className="fa-solid fa-power-off text-lg text-red-500"></i>
        </button>
      </div>

      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Desktop Custom Navbar */}
        <nav className="hidden md:flex border-b border-gray-800 p-4 justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-40 px-8 h-20">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#39FF14] rounded-full shadow-[0_0_15px_#39FF14]"></div>
                <span className="text-xl font-black tracking-tighter uppercase italic">BOATE <span className="text-[#39FF14]">PREMIUM</span></span>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-[#39FF14] flex items-center gap-2 font-black uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-pulse"></span>
                        GATEWAY CONECTADO
                    </span>
                    <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest italic">{session.user.email}</span>
                </div>
                <div className="h-10 w-px bg-gray-800"></div>
                <div onClick={handleLogout} className="flex items-center gap-3 bg-gray-900 rounded-full pl-3 pr-1 py-1 border border-gray-800 group cursor-pointer hover:border-red-500/40 transition-all">
                    <div className="flex flex-col items-end mr-1">
                      <span className="text-[10px] font-black text-gray-300 group-hover:text-red-500">Sair</span>
                      <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Logout</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 group-hover:border-red-500 flex items-center justify-center text-xs transition-colors overflow-hidden">
                        <i className="fa-solid fa-power-off text-gray-400 group-hover:text-red-500"></i>
                    </div>
                </div>
            </div>
        </nav>

        {/* Dynamic Contextual Content */}
        <main className="p-4 md:p-8 pt-24 md:pt-8 flex-1 min-h-screen">
          {renderContent()}
        </main>

        <footer className="p-8 border-t border-gray-900 text-[10px] text-gray-600 flex flex-col md:flex-row justify-between items-center gap-4 mt-12 no-print">
            <div className="flex items-center gap-4">
              <span className="font-black tracking-widest text-gray-500 uppercase">NIGHTFLOW SAAS ENGINE v3.1</span>
              <span className="h-4 w-px bg-gray-800"></span>
              <p>© 2024 NIGHTFLOW TECHNOLOGIES. ALL RIGHTS RESERVED.</p>
            </div>
            <div className="flex gap-6 font-bold uppercase tracking-widest">
                <a href="#" className="hover:text-[#39FF14] transition-colors">Compliance</a>
                <a href="#" className="hover:text-[#39FF14] transition-colors">Api Status</a>
                <a href="#" className="hover:text-[#39FF14] transition-colors">Help Center</a>
            </div>
        </footer>
      </div>

      {/* Mini-toast no canto superior direito */}
      {toast.visible && (
        <div className="fixed top-24 right-8 bg-[#39FF14] text-black font-black px-6 py-4 rounded-2xl 
                       shadow-[0_15px_40px_rgba(57,255,20,0.4)] z-[100] flex items-center gap-4 animate-in slide-in-from-right-10 duration-500">
          <div className="w-2 h-2 bg-black rounded-full animate-ping"></div>
          <span className="text-[11px] uppercase tracking-tighter italic">{toast.message}</span>
          <button onClick={() => setToast(prev => ({ ...prev, visible: false }))} className="text-black/50 hover:text-black">
              <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
