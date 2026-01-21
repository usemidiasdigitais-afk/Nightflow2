
import React from 'react';

export type TabType = 'dashboard' | 'chat' | 'finance' | 'partners' | 'entrance' | 'promoters';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems: { id: TabType; icon: string; label: string }[] = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'entrance', icon: 'fa-ticket', label: 'Portaria' },
    { id: 'promoters', icon: 'fa-users-line', label: 'Promotores' },
    { id: 'chat', icon: 'fa-robot', label: 'IA Engine' },
    { id: 'finance', icon: 'fa-wallet', label: 'Financeiro' },
    { id: 'partners', icon: 'fa-handshake', label: 'Parceiros' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-black border-r border-gray-800 h-screen fixed left-0 top-0 pt-20">
      <nav className="flex-1 px-4 space-y-2">
        <p className="px-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Menu Principal</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === item.id 
                ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20 shadow-[0_0_15px_rgba(57,255,20,0.1)]' 
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-4 border border-gray-800">
          <p className="text-[10px] text-gray-500 uppercase font-black mb-2">API Usage</p>
          <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
            <div className="bg-[#39FF14] h-full w-[42%] shadow-[0_0_10px_#39FF14]"></div>
          </div>
          <p className="text-[9px] text-gray-400 mt-2">4,200 / 10,000 reqs</p>
        </div>
        
        <div className="bg-[#39FF14] rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-black font-black uppercase">Plano Atual</p>
            <p className="text-xs font-bold text-black">NIGHTFLOW PRO</p>
          </div>
          <i className="fa-solid fa-crown text-black/40 text-lg"></i>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
