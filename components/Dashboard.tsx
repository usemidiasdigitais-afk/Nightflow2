import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { WelcomeGuide } from './WelcomeGuide';
import { supabase } from '../services/supabaseClient';

interface DashboardProps {
  metrics: {
    revenue: number;
    checkins: number;
    pendingTickets: number;
    occupancy: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ metrics }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [loadingCheck, setLoadingCheck] = useState<boolean>(true);

  useEffect(() => {
    const checkUserHistory = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { count, error } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', session.user.id);
          
          if (!error) {
            setIsNewUser(count === 0);
          }
        }
      } catch (err) {
        console.error("Error checking user history:", err);
      } finally {
        setLoadingCheck(false);
      }
    };

    checkUserHistory();
  }, []);

  useEffect(() => {
    if (chartRef.current && !isNewUser) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['TICKET', 'COMBO', 'RESERVATION'],
            datasets: [{
              label: 'Vendas Totais (R$)',
              data: [metrics.revenue * 0.2, metrics.revenue * 0.5, metrics.revenue * 0.3],
              backgroundColor: ['#39FF14', '#00D1FF', '#FF0055'],
              borderWidth: 0,
              borderRadius: 12
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
              legend: { display: false },
              tooltip: {
                backgroundColor: '#000',
                titleColor: '#39FF14',
                bodyColor: '#fff',
                borderColor: '#333',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 12,
                displayColors: false
              }
            },
            scales: { 
              y: { 
                beginAtZero: true, 
                grid: { color: 'rgba(255,255,255,0.05)', drawTicks: false },
                ticks: { 
                  color: '#666', 
                  font: { size: 10, weight: 'bold' as any },
                  callback: (value) => 'R$ ' + value
                }
              },
              x: {
                grid: { display: false },
                ticks: { 
                  color: '#aaa', 
                  font: { size: 10, weight: 'black' as any, family: 'Inter' }
                }
              }
            },
            animation: {
              duration: 1200,
              easing: 'easeOutQuart'
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [metrics.revenue, isNewUser]);

  const metricCardClass = "bg-black p-6 rounded-[2rem] border border-gray-800 shadow-xl relative overflow-hidden group transition-all duration-500 ease-out hover:scale-[1.02] hover:border-[#39FF14] hover:shadow-[0_20px_40px_rgba(57,255,20,0.08)] cursor-default";

  if (loadingCheck) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Validando Perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">Dashboard <span className="text-[#39FF14]">Operacional</span></h1>
          <p className="text-gray-400 text-sm italic">Monitoramento biométrico e financeiro em tempo real.</p>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fluxo NightFlow Ativo</span>
        </div>
      </header>

      {isNewUser && <WelcomeGuide />}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={metricCardClass}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#39FF14]/5 rounded-full -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150 group-hover:bg-[#39FF14]/10"></div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic">Vendas Consolidadas</p>
          <h2 className="text-3xl font-black text-[#39FF14] mt-1 tracking-tighter">R$ {metrics.revenue.toLocaleString('pt-BR')}</h2>
          <p className="text-xs text-green-500 mt-2 flex items-center gap-1 font-bold">
            <i className="fa-solid fa-bolt"></i> +{((metrics.revenue / 10000) * 10).toFixed(1)}% vs meta
          </p>
        </div>
        
        <div className={metricCardClass}>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic">Lotação Mesas</p>
          <h2 className="text-3xl font-black mt-1 tracking-tighter text-white">{metrics.occupancy}/24</h2>
          <div className="w-full bg-gray-900 h-1.5 mt-4 rounded-full overflow-hidden">
            <div className="bg-[#39FF14] h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_#39FF14]" style={{ width: `${(metrics.occupancy / 24) * 100}%` }}></div>
          </div>
        </div>
        
        <div className={metricCardClass}>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic">Público na Casa</p>
          <h2 className="text-3xl font-black text-blue-400 mt-1 tracking-tighter">{metrics.checkins}</h2>
          <p className="text-xs text-gray-500 mt-2 italic font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></span>
            Fluxo Contínuo
          </p>
        </div>
        
        <div className={metricCardClass}>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic">Fila de Espera</p>
          <h2 className="text-3xl font-black text-yellow-500 mt-1 tracking-tighter">{metrics.pendingTickets.toString().padStart(2, '0')}</h2>
          <button className="text-[10px] text-[#39FF14] font-black uppercase tracking-widest underline mt-2 hover:text-white transition-colors">Aprovar Tickets</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Chart Section */}
          <div className="bg-black p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl relative overflow-hidden group">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-black text-lg italic tracking-widest uppercase">Distribuição de Receita</h3>
                <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em] mt-1">Sincronizado com API Gateway</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#39FF14]"></span>
                    <span className="text-[9px] text-gray-500 font-black uppercase">Ticket</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00D1FF]"></span>
                    <span className="text-[9px] text-gray-500 font-black uppercase">Combo</span>
                 </div>
              </div>
            </div>
            <div className="h-64 relative">
              {isNewUser ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
                  <i className="fa-solid fa-chart-line text-5xl mb-4"></i>
                  <p className="text-xs font-black uppercase tracking-widest">Os gráficos aparecerão após as primeiras vendas.</p>
                </div>
              ) : (
                <canvas ref={chartRef}></canvas>
              )}
            </div>
          </div>

          {/* Interactive Heatmap */}
          <div className="bg-black p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg italic tracking-widest uppercase">Mapa Térmico Operacional</h3>
              <span className="text-[10px] bg-red-900/10 text-red-500 px-3 py-1.5 rounded-full border border-red-500/20 flex items-center gap-2 font-black">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                LIVE HEATMAP
              </span>
            </div>
            <div className="grid grid-cols-6 gap-4 h-64 bg-[#0a0a0a] rounded-3xl p-6 border border-gray-800 relative overflow-hidden group">
              {/* Background grid dots */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#39FF14 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedTable(i + 1)}
                  className={`rounded-2xl border flex flex-col items-center justify-center text-[10px] font-black transition-all cursor-pointer relative overflow-hidden z-10
                    ${i === 2 ? 'bg-red-900/40 border-red-500 text-red-500 animate-pulse' : 
                      i === 5 ? 'bg-gray-900/50 border-gray-800 text-gray-600' :
                      'bg-[#39FF14]/5 border-[#39FF14]/20 text-[#39FF14] hover:bg-[#39FF14]/20 hover:scale-105 shadow-inner'}
                  `}
                >
                  <span className="uppercase tracking-widest">M{i + 1}</span>
                  {i < metrics.occupancy && i !== 5 && (
                    <span className="text-[8px] opacity-40 font-bold mt-1">R$ {(Math.random() * 500 + 100).toFixed(0)}</span>
                  )}
                  {selectedTable === i + 1 && (
                    <div className="absolute inset-0 bg-[#39FF14]/10 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in duration-300">
                      <i className="fa-solid fa-circle-nodes text-white"></i>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Detail */}
        <div className="flex flex-col gap-6">
          {selectedTable ? (
            <div className="bg-black p-8 rounded-[2.5rem] border border-[#39FF14] animate-in slide-in-from-right-10 duration-500 shadow-[0_0_40px_rgba(57,255,20,0.1)]">
               <div className="flex justify-between items-start mb-8">
                  <h3 className="font-black italic text-lg uppercase">Status Mesa <span className="text-[#39FF14]">#{selectedTable}</span></h3>
                  <button onClick={() => setSelectedTable(null)} className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
               </div>
               <div className="space-y-6">
                  <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
                     <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Consumo em Tempo Real</p>
                     <p className="text-3xl font-black text-[#39FF14]">R$ {(Math.random() * 2000 + 500).toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-gray-900/50 p-5 rounded-3xl border border-gray-800">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Pax</p>
                        <p className="text-xl font-black">0{Math.floor(Math.random() * 8) + 1}</p>
                     </div>
                     <div className="bg-gray-900/50 p-5 rounded-3xl border border-gray-800">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Atendimento</p>
                        <p className="text-xl font-black">Ciro L.</p>
                     </div>
                  </div>
                  <button className="w-full bg-[#39FF14] text-black font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg">Encerrar e Liberar</button>
               </div>
            </div>
          ) : (
            <div className="bg-black p-8 rounded-[2.5rem] border border-gray-800 flex flex-col shadow-2xl h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#39FF14]/20 to-transparent"></div>
              <h3 className="font-black text-lg mb-8 flex items-center gap-3 italic uppercase tracking-widest">
                <i className="fa-solid fa-wave-square text-[#39FF14] animate-pulse"></i>
                Feed <span className="text-[#39FF14]">Live</span>
              </h3>
              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {isNewUser ? (
                   <div className="h-full flex flex-col items-center justify-center text-gray-700 p-10 opacity-40">
                      <i className="fa-solid fa-bolt-lightning text-4xl mb-4"></i>
                      <p className="text-[9px] font-black uppercase text-center leading-relaxed">Aguardando telemetria inicial da casa.</p>
                   </div>
                ) : (
                  [...Array(8)].map((_, idx) => (
                      <div key={idx} className="flex gap-4 items-start p-4 bg-gray-900/30 rounded-3xl border border-gray-800/50 hover:border-[#39FF14]/30 transition-all group cursor-pointer">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs shadow-inner transition-all group-hover:scale-110 ${
                              idx % 4 === 0 ? 'bg-blue-500/10 text-blue-400' : 
                              idx % 4 === 1 ? 'bg-[#39FF14]/10 text-[#39FF14]' : 
                              idx % 4 === 2 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-purple-500/10 text-purple-400'
                          }`}>
                              <i className={`fa-solid ${idx % 4 === 0 ? 'fa-user-check' : idx % 4 === 1 ? 'fa-cash-register' : idx % 4 === 2 ? 'fa-wine-glass' : 'fa-bell'}`}></i>
                          </div>
                          <div className="flex-1">
                              <p className="text-[11px] font-bold text-gray-100 group-hover:text-white transition-colors">
                                {idx % 4 === 0 ? 'Check-in: Juliana M.' : 
                                idx % 4 === 1 ? 'Venda: Combo Galera' : 
                                idx % 4 === 2 ? 'Solicitação: Mesa #08' : 'Alerta: Estoque Vodka'}
                              </p>
                              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">Há {idx + 1} minutos • Portaria Sul</p>
                          </div>
                      </div>
                  ))
                )}
              </div>
              <div className="mt-8 pt-4 border-t border-gray-900">
                <p className="text-[9px] text-gray-600 font-black uppercase text-center tracking-[0.4em] italic animate-pulse">Scanning infrastructure...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;