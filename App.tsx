import React, { useState, useEffect, useCallback } from 'react';
import Sidebar, { TabType } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import Finance from './components/Finance';
import Partners from './components/Partners';
import Entrance from './components/Entrance';
import Promoters from './components/Promoters';
import PromoterMobileDash from './components/PromoterMobileDash';
import { Auth } from './components/Auth';
import { supabase } from './services/supabaseClient';
import { useTenant } from './hooks/useTenant';
import { Session } from '@supabase/supabase-js';

declare global {
  interface Window {
    showToast: (message: string) => void;
  }
}

type UserRole = 'admin' | 'staff' | 'promoter';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('staff');
  
  const tenant = useTenant();
  const [brandColor, setBrandColor] = useState('#39FF14'); // Default Neon

  const [metrics, setMetrics] = useState({
    revenue: 0,
    checkins: 0,
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

  // Branding Logic
  useEffect(() => {
    const fetchBranding = async () => {
      if (tenant && tenant !== 'admin') {
        // Fetch custom branding based on tenant slug
        const { data, error } = await supabase
          .from('profiles') 
          .select('primary_color')
          .eq('slug', tenant)
          .single();
        
        if (data?.primary_color) {
          setBrandColor(data.primary_color);
          // Applies the color dynamically to the CSS variables
          document.documentElement.style.setProperty('--primary-color', data.primary_color);
          // Also set secondary glows if needed
          document.documentElement.style.setProperty('--primary-neon', data.primary_color);
        }
      }
    };
    fetchBranding();
  }, [tenant]);

  // Fetch Role from Profiles
  useEffect(() => {
    const getUserRole = async () => {
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (data && data.role) {
            setUserRole(data.role as UserRole);
            
            // Auto-redirect if restricted
            if (data.role === 'staff') setActiveTab('entrance');
            if (data.role === 'promoter') setActiveTab('promoters');
          } else if (error) {
            // Fallback to domain-based role if table or record doesn't exist
            const fallbackRole = session.user.email?.endsWith('@promoter.com') ? 'promoter' : 'admin';
            setUserRole(fallbackRole as UserRole);
          }
        } catch (err) {
          console.error("Error fetching profile role:", err);
        }
      }
    };
    if (session) getUserRole();
  }, [session]);

  const promoterCode = session?.user?.email?.split('@')[0] || 'default_ref';

  // Referral Tracking Logic
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const refCode = queryParams.get('ref');
    
    if (refCode) {
      localStorage.setItem('nightflow_referral', refCode);
      console.log(`[NightFlow Engine] Promoter tracked via URL: ${refCode}`);
      showToast(`Link de promoter ativo: ${refCode}`);
    }
  }, [showToast]);

  const fetchMetrics = useCallback(async (userId: string) => {
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('tenant_id', userId);

    const { count: checkinCount, error: resError } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', userId)
      .eq('status', 'CHECKED_IN');

    if (!txError && transactions) {
      const totalRevenue = transactions.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
      setMetrics(prev => ({
        ...prev,
        revenue: totalRevenue,
        checkins: checkinCount || 0
      }));
    }
  }, []);

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

  useEffect(() => {
    if (session?.user && userRole === 'admin') {
      fetchMetrics(session.user.id);
    }
  }, [session, fetchMetrics, userRole]);

  useEffect(() => {
    if (!session || userRole !== 'admin') return;

    const salesChannel = supabase
      .channel('public:transactions_realtime')
      .on('postgres_changes' as any, 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'transactions',
          filter: `tenant_id=eq.${session.user.id}`
        }, 
        (payload: any) => {
          showToast(`Nova venda detectada: R$ ${payload.new.amount}`);
          setMetrics(prev => ({
              ...prev,
              revenue: prev.revenue + payload.new.amount,
              pendingTickets: prev.pendingTickets + 1
          }));
        }
      )
      .subscribe();

    const reservationChannel = supabase
      .channel('public:reservations_realtime')
      .on('postgres_changes' as any, 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'reservations',
          filter: `tenant_id=eq.${session.user.id}`
        }, 
        (payload: any) => {
          if (payload.new.status === 'CHECKED_IN' && payload.old.status !== 'CHECKED_IN') {
            setMetrics(prev => ({ ...prev, checkins: prev.checkins + 1 }));
          }
        }
      )
      .subscribe();

    return () => {
        supabase.removeChannel(salesChannel);
        supabase.removeChannel(reservationChannel);
    };
  }, [showToast, session, userRole]);

  const handleAddSale = async (amount: number) => {
    const refCode = localStorage.getItem('nightflow_referral');
    const { error } = await supabase
      .from('transactions')
      .insert({ 
         amount, 
         type: 'UPSELL', 
         tenant_id: session?.user?.id,
         description: refCode ? `REF:${refCode}` : 'VENDA_DIRETA' 
      });
      
    if (error) {
      showToast("Erro ao registrar no banco: " + error.message);
    } else {
      showToast(`Venda Registrada! ${refCode ? 'Comissão enviada.' : ''}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showToast("Sessão encerrada.");
  };

  const renderContent = () => {
    if (userRole === 'promoter') {
      return <PromoterMobileDash promoterCode={promoterCode} onLogout={handleLogout} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return userRole === 'admin' ? <Dashboard metrics={metrics} /> : <Entrance session={session} />;
      case 'entrance':
        return <Entrance session={session} />;
      case 'promoters':
        return <Promoters />;
      case 'chat':
        return (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <header className="mb-6 max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-black tracking-tight uppercase italic">AI <span style={{ color: brandColor }}>Revenue Simulator</span></h1>
              <p className="text-gray-400 text-sm tracking-tight italic">Teste o motor de Upsell. Vendas são atribuídas ao promoter ativo no rastro (REF).</p>
            </header>
            <ChatInterface onConfirmSale={handleAddSale} />
          </div>
        );
      case 'finance':
        return userRole === 'admin' ? <Finance totalRevenue={metrics.revenue} /> : <Entrance session={session} />;
      case 'partners':
        return userRole === 'admin' ? <Partners /> : <Entrance session={session} />;
      default:
        return <Dashboard metrics={metrics} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/5 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin absolute top-0 shadow-[0_0_20px_rgba(57,255,20,0.4)]"></div>
        </div>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] animate-pulse">Sincronizando NightFlow...</p>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  // If promoter role, return full screen mobile-first dash
  if (userRole === 'promoter') {
    return (
        <div className="min-h-screen bg-[#050505]">
            {renderContent()}
            {toast.visible && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-[var(--primary-color)] text-black font-black px-6 py-4 rounded-2xl 
                            shadow-[0_15px_40px_rgba(57,255,20,0.4)] z-[100] flex items-center gap-4 animate-in slide-in-from-top-10 duration-500 w-[90%] max-w-md">
                    <span className="text-[11px] uppercase tracking-tighter italic">{toast.message}</span>
                </div>
            )}
        </div>
    );
  }

  // Admin & Staff View
  return (
    <div className="min-h-screen bg-[#050505] text-white flex selection:bg-[var(--primary-color)] selection:text-black">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={userRole} />

      <div className="md:hidden fixed top-0 w-full bg-black border-b border-gray-800 p-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[var(--primary-color)] rounded-full shadow-[0_0_10px_#39FF14]"></div>
            <span className="font-black text-xs tracking-tighter uppercase">NightFlow Live</span>
        </div>
        <button className="text-gray-400" onClick={handleLogout}>
            <i className="fa-solid fa-power-off text-lg text-red-500"></i>
        </button>
      </div>

      <div className="flex-1 md:ml-64 flex flex-col">
        <nav className="hidden md:flex border-b border-gray-800 p-4 justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-40 px-8 h-20">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--primary-color)] rounded-full shadow-[0_0_15px_#39FF14]"></div>
                <span className="text-xl font-black tracking-tighter uppercase italic">BOATE <span className="text-[var(--primary-color)]">PREMIUM</span></span>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end mr-1 text-right">
                    <span className="text-[10px] font-black text-gray-300">
                      USUÁRIO: {session?.user?.email?.split('@')[0].toUpperCase()}
                    </span>
                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">
                      ID: {session?.user?.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="h-10 w-px bg-gray-800 mx-2"></div>
                  <div onClick={handleLogout} className="flex items-center gap-3 bg-gray-900 rounded-full pl-3 pr-1 py-1 border border-gray-800 group cursor-pointer hover:border-red-500/40 transition-all">
                      <div className="flex flex-col items-end mr-1">
                        <span className="text-[10px] font-black text-gray-300 group-hover:text-red-500 transition-colors">Sair</span>
                        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Logout</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 group-hover:border-red-500 flex items-center justify-center text-xs transition-all overflow-hidden">
                          <i className="fa-solid fa-power-off text-gray-400 group-hover:text-red-500 group-hover:scale-110"></i>
                      </div>
                  </div>
                </div>
            </div>
        </nav>

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
                <a href="#" className="hover:text-[var(--primary-color)] transition-colors">Compliance</a>
                <a href="#" className="hover:text-[var(--primary-color)] transition-colors">Api Status</a>
                <a href="#" className="hover:text-[var(--primary-color)] transition-colors">Help Center</a>
            </div>
        </footer>
      </div>

      {toast.visible && (
        <div className="fixed top-24 right-8 bg-[var(--primary-color)] text-black font-black px-6 py-4 rounded-2xl 
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
