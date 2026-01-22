import React from 'react';

interface Step {
  id: number;
  title: string;
  desc: string;
  icon: string;
  actionLabel: string;
}

export const WelcomeGuide: React.FC = () => {
  const steps: Step[] = [
    { 
      id: 1, 
      title: 'Recrutar Promoters', 
      desc: 'Sua força de vendas externa. Gere links exclusivos e rastreie comissões em tempo real.', 
      icon: 'fa-users-line',
      actionLabel: 'Ir para Promotores'
    },
    { 
      id: 2, 
      title: 'Setup Financeiro', 
      desc: 'Configure seu Split Asaas e defina quanto do ticket médio fica retido como margem de lucro.', 
      icon: 'fa-wallet',
      actionLabel: 'Ver Financeiro'
    },
    { 
      id: 3, 
      title: 'Customização Visual', 
      desc: 'Aplique a identidade visual da sua boate no dashboard e nos links de venda dos promoters.', 
      icon: 'fa-palette',
      actionLabel: 'Personalizar Cores'
    }
  ];

  return (
    <div className="bg-neutral-900 border border-[#39FF14]/20 rounded-[2.5rem] p-8 md:p-12 mb-10 shadow-[0_0_60px_rgba(57,255,20,0.05)] animate-in fade-in zoom-in duration-700 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
      
      <div className="flex flex-col md:flex-row items-center gap-6 mb-12 relative z-10 text-center md:text-left">
        <div className="bg-[#39FF14] text-black w-16 h-16 rounded-[1.5rem] flex items-center justify-center animate-float shadow-[0_10px_30px_rgba(57,255,20,0.3)]">
          <i className="fa-solid fa-rocket text-2xl"></i>
        </div>
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Prepare sua <span className="text-[#39FF14]">Primeira Noite</span></h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Setup inicial do NightFlow Intelligence Engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className="glass-panel p-8 rounded-[2rem] border border-white/5 hover:border-[#39FF14]/40 transition-all duration-500 group cursor-pointer flex flex-col h-full"
          >
            <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-[#39FF14] mb-6 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(57,255,20,0.2)] transition-all">
              <i className={`fa-solid ${step.icon} text-xl`}></i>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-3 italic">{step.title}</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed font-bold uppercase tracking-tight mb-8 flex-1">
              {step.desc}
            </p>
            <div className="flex items-center gap-2 text-[#39FF14] text-[9px] font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
              {step.actionLabel}
              <i className="fa-solid fa-arrow-right-long"></i>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 opacity-50">
        <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em]">Authorized infrastructure v3.2</p>
        <div className="flex gap-4">
            <span className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse"></span>
            <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Aguardando Primeira Transação</span>
        </div>
      </div>
    </div>
  );
};