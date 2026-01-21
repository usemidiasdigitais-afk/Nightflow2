import React from 'react';
import { supabase } from '../services/supabaseClient';

export type TabType = 'dashboard' | 'chat' | 'finance' | 'partners' | 'entrance' | 'promoters';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  role: 'admin' | 'staff' | 'promoter';
}

interface MenuItem {
  id: TabType;
  icon: string;
  label: string;
  roles: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, role }) => {
  const menuItems: MenuItem[] = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard', roles: ['admin'] },
    { id: 'entrance', icon: 'fa-qr-code', label: 'Portaria', roles: ['admin', 'staff'] },
    { id: 'promoters', icon: 'fa-users-line', label: 'Promotores', roles: ['admin'] },
    { id: 'chat', icon: 'fa-robot', label: 'IA Engine', roles: ['admin', 'staff'] },
    { id: 'finance', icon: 'fa-wallet', label: 'Financeiro', roles: ['admin'] },
    { id: 'partners', icon: 'fa-handshake', label: 'Parceiros', roles: ['admin'] },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      if (window.showToast) window.showToast('Erro ao sair: ' + error.message);
      else console.error('Erro ao sair:', error.message);
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-black border-r border-gray-800 h-screen fixed left-0 top-0 pt-20 z-50">
      <nav className="flex-1 px-4 space-y-2">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Menu Principal</p>
          <p className="text-[8px] font-bold text-[#39FF14] uppercase tracking-widest mt-1 opacity-60">Acesso: {role.toUpperCase()}</p>
        </div>
        
        {menuItems
          .filter(item => item.roles.includes(role))
          .map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20 shadow-[0_0_15px_rgba(57,255,20,0.1)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <div className="w-5 text-center">
                <i className={`fa-solid ${item.icon}`}></i>
              </div>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
      </nav>
      
      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-4 border border-gray-800">
          <p className="text-[10px] text-gray-500 uppercase font-black mb-2 tracking-widest">SaaS Status</p>
          <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
            <div className="bg-[#39FF14] h-full w-[88%] shadow-[0_0_10px_#39FF14]"></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Uptime 99.9%</p>
            <span className="text-[8px] text-[#39FF14] font-black">ACTIVE</span>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-800/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all group border border-transparent hover:border-red-500/20"
          >
            <i className="fa-solid fa-right-from-bracket group-hover:translate-x-1 transition-transform"></i>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Encerrar Sessão</span>
          </button>
        </div>

        <div className="bg-[#39FF14] rounded-xl p-3 flex items-center justify-between shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:scale-[1.02] transition-transform cursor-pointer">
          <div>
            <p className="text-[9px] text-black font-black uppercase">Plano</p>
            <p className="text-xs font-bold text-black tracking-tighter">NIGHTFLOW PRO</p>
          </div>
          <i className="fa-solid fa-crown text-black/40 text-lg"></i>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;