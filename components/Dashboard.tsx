
import React, { useEffect, useRef, useState } from 'react';
// Import Chart from 'chart.js/auto' to avoid registration issues and fix constructor/type errors
import Chart from 'chart.js/auto';

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

  useEffect(() => {
    if (chartRef.current) {
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
              borderRadius: 8
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
                cornerRadius: 8,
                displayColors: false
              }
            },
            scales: { 
              y: { 
                beginAtZero: true, 
                grid: { color: '#1a1a1a', drawTicks: false },
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
              duration: 1000,
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
  }, [metrics.revenue]);

  const metricCardClass = "bg-black p-6 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden group transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-1 hover:border-[#39FF14] hover:shadow-[0_10px_30px_rgba(57,255,20,0.1)] cursor-default";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">Dashboard <span className="text-[#39FF14]">Operacional</span></h1>
          <p className="text-gray-400 text-sm">Visão consolidada do fluxo da noite em tempo real.</p>
        </div>
        <div className="bg-gray-900 px-4 py-2 rounded-2xl border border-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fluxo Ativo</span>
        </div>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={metricCardClass}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#39FF14]/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Vendas Hoje</p>
          <h2 className="text-3xl font-black text-[#39FF14] mt-1 tracking-tighter">R$ {metrics.revenue.toLocaleString('pt-BR')}</h2>
          <p className="text-xs text-green-500 mt-2 flex items-center gap-1 font-bold">
            <i className="fa-solid fa-arrow-up"></i> +{((metrics.revenue / 10000) * 10).toFixed(1)}% vs ontem
          </p>
        </div>
        
        <div className={metricCardClass}>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Ocupação Mesas</p>
          <h2 className="text-3xl font-black mt-1 tracking-tighter text-white">{metrics.occupancy}/24</h2>
          <div className="w-full bg-gray-900 h-2 mt-4 rounded-full overflow-hidden">
            <div className="bg-[#39FF14] h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_#39FF14]" style={{ width: `${(metrics.occupancy / 24) * 100}%` }}></div>
          </div>
        </div>
        
        <div className={metricCardClass}>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Check-ins Realizados</p>
          <h2 className="text-3xl font-black text-blue-400 mt-1 tracking-tighter">{metrics.checkins}</h2>
          <p className="text-xs text-gray-500 mt-2 italic font-medium">Fluxo: Estabilizado</p>
        </div>
        
        <div className={metricCardClass}>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Aguardando Aprovação</p>
          <h2 className="text-3xl font-black text-yellow-500 mt-1 tracking-tighter">{metrics.pendingTickets.toString().padStart(2, '0')}</h2>
          <button className="text-[10px] text-[#39FF14] font-black uppercase tracking-widest underline mt-2 hover:opacity-80 transition-opacity">Aprovar Lote</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Chart Section */}
          <div className="bg-black p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-black text-lg italic tracking-widest uppercase">Repartição de Faturamento</h3>
                <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em] mt-1">Dados processados pelo motor Gemini</p>
              </div>
              <div className="flex gap-2">
                 <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#39FF14]"></span>
                    <span className="text-[9px] text-gray-500 font-black uppercase">Ticket</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00D1FF]"></span>
                    <span className="text-[9px] text-gray-500 font-black uppercase">Combo</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF0055]"></span>
                    <span className="text-[9px] text-gray-500 font-black uppercase">Reserva</span>
                 </div>
              </div>
            </div>
            <div className="h-64 relative">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>

          {/* Interactive Heatmap */}
          <div className="bg-black p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg italic tracking-widest uppercase">Mapa de Calor - Piso Principal</h3>
              <span className="text-[10px] bg-red-900/20 text-red-500 px-3 py-1 rounded-full border border-red-500/30 flex items-center gap-2 font-black">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                SENSORS ACTIVE
              </span>
            </div>
            <div className="grid grid-cols-6 gap-4 h-56 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] rounded-2xl p-6 border border-gray-800 relative">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedTable(i + 1)}
                  className={`rounded-xl border flex flex-col items-center justify-center text-[10px] font-black transition-all cursor-pointer relative overflow-hidden
                    ${i === 2 ? 'bg-red-900/40 border-red-500 text-red-500' : 
                      i === 5 ? 'bg-gray-800 border-gray-700 text-gray-600' :
                      'bg-[#39FF14]/10 border-[#39FF14]/30 text-[#39FF14] hover:bg-[#39FF14]/30 hover:scale-105 shadow-inner'}
                  `}
                >
                  <span>M{i + 1}</span>
                  {i < metrics.occupancy && i !== 5 && (
                    <span className="text-[8px] opacity-60 font-bold mt-1">R$ {(Math.random() * 500 + 100).toFixed(0)}</span>
                  )}
                  {selectedTable === i + 1 && (
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in duration-200">
                      <i className="fa-solid fa-circle-info text-white"></i>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Feed & Detail */}
        <div className="flex flex-col gap-6">
          {selectedTable ? (
            <div className="bg-black p-8 rounded-[2.5rem] border border-[#39FF14] animate-in slide-in-from-right-4 duration-300 shadow-[0_0_30px_rgba(57,255,20,0.1)]">
               <div className="flex justify-between items-start mb-6">
                  <h3 className="font-black italic text-lg uppercase">Mesa <span className="text-[#39FF14]">#{selectedTable}</span></h3>
                  <button onClick={() => setSelectedTable(null)} className="text-gray-600 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
               </div>
               <div className="space-y-4">
                  <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
                     <p className="text-[10px] text-gray-500 uppercase font-black">Consumo Acumulado</p>
                     <p className="text-2xl font-black text-[#39FF14]">R$ 1.250,00</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex-1 bg-gray-900 p-4 rounded-2xl border border-gray-800">
                        <p className="text-[10px] text-gray-500 uppercase font-black">Pax</p>
                        <p className="text-xl font-black">04</p>
                     </div>
                     <div className="flex-1 bg-gray-900 p-4 rounded-2xl border border-gray-800">
                        <p className="text-[10px] text-gray-500 uppercase font-black">Garçom</p>
                        <p className="text-xl font-black">Ciro</p>
                     </div>
                  </div>
                  <button className="w-full bg-[#39FF14] text-black font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Encerrar Conta</button>
               </div>
            </div>
          ) : (
            <div className="bg-black p-8 rounded-[2.5rem] border border-gray-800 flex flex-col shadow-2xl h-full">
              <h3 className="font-black text-lg mb-8 flex items-center gap-3 italic uppercase tracking-widest">
                <i className="fa-solid fa-bolt text-[#39FF14]"></i>
                Live <span className="text-[#39FF14]">Activity</span>
              </h3>
              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex gap-3 items-start p-3 bg-gray-900/20 rounded-2xl border border-gray-800/50">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">
                    <i className="fa-solid fa-user-check"></i>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold">Check-in: Juliana M.</p>
                    <p className="text-[9px] text-gray-500">Há 2 minutos • Entrada VIP</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start p-3 bg-gray-900/20 rounded-2xl border border-gray-800/50">
                  <div className="w-8 h-8 rounded-lg bg-[#39FF14]/20 flex items-center justify-center text-[#39FF14] text-xs">
                    <i className="fa-solid fa-cart-shopping"></i>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold">Venda: Combo Galera</p>
                    <p className="text-[9px] text-gray-500">Há 5 minutos • Mesa #14</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start p-3 bg-gray-900/20 rounded-2xl border border-gray-800/50">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-500 text-xs">
                    <i className="fa-solid fa-bell"></i>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold">Solicitação Garçom</p>
                    <p className="text-[9px] text-gray-500">Há 8 minutos • Mesa #04</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-900">
                <p className="text-[9px] text-gray-600 font-black uppercase text-center tracking-[0.2em]">Monitoring night flow...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
