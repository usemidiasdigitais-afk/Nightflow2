
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Transaction } from '../types';
// Import Chart from 'chart.js/auto' to avoid registration issues and fix constructor/type errors
import Chart from 'chart.js/auto';

interface FinanceProps {
  totalRevenue?: number;
}

const Finance: React.FC<FinanceProps> = ({ totalRevenue = 12450 }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('Todos');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Lógica de geração de dados mock conforme snippet solicitado
  const allTransactions: Transaction[] = useMemo(() => {
    const types = ['TICKET', 'COMBO', 'RESERVATION'] as const;
    const statuses = ['CONFIRMED', 'PENDING', 'REFUNDED'] as const;
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
    const baseDate = new Date();
    
    return Array.from({ length: 100 }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const status = Math.random() > 0.2 ? 'CONFIRMED' : statuses[Math.floor(Math.random() * 3)];
      const value = Math.floor(Math.random() * 1500) + 50;
      const dayIndex = Math.floor(Math.random() * days.length);
      
      const date = new Date(baseDate);
      // Simulação de distribuição pelos dias da semana informados no mock
      date.setDate(date.getDate() - (baseDate.getDay() - dayIndex + 7) % 7);

      return {
        id: `TX-${1000 + i}`,
        date: date.toISOString(),
        customer: `Cliente #${i + 1}`,
        type: type,
        status: status as any,
        amount: value,
        platformFee: value * 0.05 // 5% plataforma conforme regra
      };
    });
  }, []);

  // Estatísticas agregadas baseadas no mock de 100 itens
  const stats = useMemo(() => {
    const confirmed = allTransactions.filter(t => t.status === 'CONFIRMED');
    const total = confirmed.reduce((acc, t) => acc + t.amount, 0);
    const fees = confirmed.reduce((acc, t) => acc + t.platformFee, 0);
    const partnerPayouts = total * 0.10; // 10% para parceiros/promoters conforme snippet anterior
    return { total, fees, net: total - fees, partnerPayouts };
  }, [allTransactions]);

  // Função getChartData solicitada
  const getChartData = (data: Transaction[]) => {
    const summary = { TICKET: 0, COMBO: 0, RESERVATION: 0 };
    data.filter(t => t.status === 'CONFIRMED').forEach(t => {
        summary[t.type] += t.amount;
    });
    return Object.values(summary); // [TotalTicket, TotalCombo, TotalReserva]
  };

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        const chartData = getChartData(allTransactions);

        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['TICKET', 'COMBO', 'RESERVATION'],
            datasets: [{
              label: 'Volume por Categoria (R$)',
              data: chartData,
              backgroundColor: ['#39FF14', '#00D1FF', '#FF0055'],
              borderRadius: 12
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
              legend: { display: false },
              tooltip: { backgroundColor: '#000', titleColor: '#39FF14', cornerRadius: 12 }
            },
            scales: { 
              y: { grid: { color: '#1a1a1a' }, ticks: { color: '#666', font: { size: 10 } } },
              // Fixed: Added 'as any' to font weight 'black' to satisfy Chart.js type restrictions
              x: { grid: { display: false }, ticks: { color: '#666', font: { size: 10, weight: 'black' as any } } }
            }
          }
        });
      }
    }
    return () => chartInstance.current?.destroy();
  }, [allTransactions]);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      txDate.setHours(0, 0, 0, 0);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (txDate < start) return false;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        if (txDate > end) return false;
      }

      if (filterType !== 'Todos' && tx.type !== filterType.toUpperCase()) return false;
      if (filterStatus !== 'Todos' && tx.status !== filterStatus.toUpperCase()) return false;

      return true;
    });
  }, [startDate, endDate, filterType, filterStatus, allTransactions]);

  const generateMonthlyReport = () => {
    const report = {
        totalSales: stats.total,
        platformFees: stats.fees,
        partnerPayouts: stats.partnerPayouts,
        netRevenue: stats.total - stats.fees - stats.partnerPayouts
    };
    
    console.log("Monthly Report Data:", report);
    window.showToast("Compilando Relatório PDF...");
    window.print(); 
  };

  const exportToCSV = () => {
    const headers = ["Data", "Cliente", "Tipo", "Valor Bruto", "Taxa NF", "Liquido"];
    const rows = filteredTransactions.map(t => {
      const date = new Date(t.date).toLocaleString('pt-BR');
      return `${date}, ${t.customer}, ${t.type}, ${t.amount.toFixed(2)}, ${t.platformFee.toFixed(2)}, ${(t.amount - t.platformFee).toFixed(2)}`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(",")].concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financeiro_nightflow_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase italic">Financeiro <span className="text-[#39FF14]">Nflow</span></h1>
          <p className="text-gray-400 text-sm italic tracking-tight">Conciliação de gateway e faturamento dinâmico.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={generateMonthlyReport} className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-black border border-gray-800 transition-all uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-file-invoice text-[#39FF14]"></i>
            Relatório Mensal
          </button>
          <button onClick={() => window.showToast("Saque indisponível no momento.")} className="bg-[#39FF14] text-black px-6 py-2 rounded-xl text-xs font-black hover:shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all uppercase tracking-widest">
            Solicitar Saque
          </button>
        </div>
      </header>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black p-8 rounded-[2rem] border border-gray-800 relative overflow-hidden group hover:border-[#39FF14]/50 transition-all shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><i className="fas fa-percentage text-6xl text-[#39FF14]"></i></div>
              <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-black italic">Taxas da Plataforma (NF Fee)</h4>
              <p className="text-4xl font-black text-white tracking-tighter">R$ {stats.fees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-[10px] text-gray-500 mt-2 font-bold">5% DE CONVENIÊNCIA SOBRE O VOLUME BRUTO</p>
          </div>
          <div className="bg-black p-8 rounded-[2rem] border border-gray-800 group hover:border-[#39FF14]/30 transition-all shadow-xl">
              <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-4 font-black italic">Distribuição de Parceiros</h4>
              <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300 font-medium tracking-tight">Comissões Promoters (10%)</span> 
                    <span className="text-[#39FF14] font-black">R$ {stats.partnerPayouts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium tracking-tight">Djs / Logística (Est.)</span> 
                    <span className="text-blue-400 font-black">R$ {(stats.total * 0.05).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <hr className="border-gray-800" />
                  <div className="flex justify-between font-black text-xl">
                    <span className="text-gray-500 text-[10px] uppercase self-center tracking-widest font-black">Total de Saídas</span> 
                    <span className="text-white tracking-tighter">R$ {(stats.partnerPayouts + (stats.total * 0.05)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Grade de Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-neutral-900 p-4 rounded-3xl border border-gray-800 backdrop-blur-sm no-print shadow-2xl">
          <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Início do Período</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-black border border-gray-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14] transition-all" />
          </div>
          <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Fim do Período</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-black border border-gray-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#39FF14] transition-all" />
          </div>
          <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Tipo</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-black border border-gray-700 rounded-xl p-2.5 text-xs text-white font-black h-full outline-none focus:border-[#39FF14]">
                  <option>Todos</option>
                  <option>Ticket</option>
                  <option>Combo</option>
                  <option>Reservation</option>
              </select>
          </div>
          <div className="flex items-end">
              <button onClick={() => {setStartDate(''); setEndDate(''); setFilterType('Todos');}} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 text-[10px] font-black uppercase py-3 rounded-xl border border-gray-700 transition-all tracking-widest">Resetar</button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-black border border-gray-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
             <div className="flex justify-between items-center mb-10">
                <h3 className="font-black text-lg italic tracking-widest uppercase">Repartição Financeira</h3>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#39FF14]"></span><span className="text-[9px] text-gray-500 font-black uppercase">Ticket</span></span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00D1FF]"></span><span className="text-[9px] text-gray-500 font-black uppercase">Combo</span></span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FF0055]"></span><span className="text-[9px] text-gray-500 font-black uppercase">Reserva</span></span>
                </div>
             </div>
             <div className="h-72 relative"><canvas ref={chartRef}></canvas></div>
          </div>

          <div className="bg-black border border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/10 no-print">
              <h3 className="font-bold text-lg uppercase italic tracking-tighter">Fluxo Detalhado <span className="text-xs text-gray-600 lowercase ml-2">({filteredTransactions.length} transações)</span></h3>
              <button onClick={exportToCSV} className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                <i className="fa-solid fa-file-export"></i> Exportar CSV
              </button>
            </div>
            <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
              <table className="w-full text-left">
                <thead className="text-gray-500 text-[10px] uppercase font-black border-b border-gray-800/50 sticky top-0 bg-black z-10">
                  <tr>
                    <th className="px-8 py-5">Data/Evento</th>
                    <th className="px-8 py-5">ID/Tipo</th>
                    <th className="px-8 py-5">Volume Bruto</th>
                    <th className="px-8 py-5">NF Fee</th>
                    <th className="px-8 py-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-800/30 hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-5 text-[11px] text-gray-400 font-medium">{new Date(tx.date).toLocaleDateString('pt-BR')}</td>
                      <td className="px-8 py-5">
                          <span className="text-[10px] font-mono text-gray-500 group-hover:text-gray-300 transition-colors uppercase">{tx.id}</span>
                          <br/>
                          <span className="text-blue-400 uppercase font-black text-[9px] tracking-widest">{tx.type}</span>
                      </td>
                      <td className="px-8 py-5 font-bold text-gray-100">R$ {tx.amount.toFixed(2)}</td>
                      <td className="px-8 py-5 text-blue-400 font-black tracking-tighter">R$ {tx.platformFee.toFixed(2)}</td>
                      <td className="px-8 py-5 text-right">
                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                            tx.status === 'CONFIRMED' ? 'bg-[#39FF14]/10 text-[#39FF14]' : 
                            tx.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-900/40 border border-gray-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#39FF14]/5 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-[#39FF14]/10 transition-colors"></div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-8 border-b border-gray-800 pb-3 italic">Liquidez Consolidada</p>
            <div className="space-y-10 relative z-10">
              <div>
                <p className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-tight">Total Confirmado</p>
                <h2 className="text-5xl font-black text-white tracking-tighter">R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-tight text-[#39FF14]">Disponível para Repasse</p>
                <h2 className="text-5xl font-black text-[#39FF14] tracking-tighter">R$ {stats.net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
              </div>
            </div>
            <div className="mt-12 p-5 bg-black/50 rounded-2xl border border-gray-800 no-print">
                <div className="flex items-center gap-2 mb-3">
                    <i className="fa-solid fa-bolt text-[#39FF14] text-xs"></i>
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Gateway v3 Active</p>
                </div>
                <p className="text-[11px] text-gray-500 italic leading-relaxed">Faturamento real processado através de 100 registros de conciliação hoje.</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/10 to-black border border-indigo-500/20 rounded-[2rem] p-8 shadow-xl no-print">
            <h4 className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-4">Segurança Financeira</h4>
            <p className="text-xs text-gray-400 leading-relaxed italic">
              O Split Asaas garante que sua margem de <span className="text-[#39FF14] font-bold">5%</span> seja retida automaticamente antes do repasse final ao clube.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .bg-black, .bg-gray-900, .bg-neutral-900 { background: transparent !important; border: 1px solid #eee !important; color: black !important; }
          .text-[#39FF14], .text-blue-400, .text-gray-400, .text-gray-500, .text-white { color: black !important; text-shadow: none !important; }
          .border { border: 1px solid #ddd !important; }
          canvas { max-width: 100% !important; height: 350px !important; }
          .custom-scrollbar { overflow: visible !important; max-height: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Finance;
