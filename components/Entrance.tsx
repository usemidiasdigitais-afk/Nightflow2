
import React, { useEffect, useState, useRef } from 'react';
import { Reservation } from '../types';
import { supabase } from '../services/supabaseClient';
import { Session } from '@supabase/supabase-js';

declare const Html5QrcodeScanner: any;

interface EntranceProps {
  session: Session | null;
}

const Entrance: React.FC<EntranceProps> = ({ session }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReserva, setSelectedReserva] = useState<Reservation | null>(null);
  const scannerRef = useRef<any>(null);

  const fetchReservations = async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('tenant_id', session.user.id) // Security filter added
        .order('customerName', { ascending: true });

      if (error) throw error;
      if (data) setReservations(data);
    } catch (err: any) {
      console.error("Supabase Error:", err);
      setErrorMsg(err.message || "Erro de conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();

    if (typeof Html5QrcodeScanner !== 'undefined' && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader", 
        { fps: 15, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        false
      );
      
      scannerRef.current.render(async (decodedText: string) => {
        const found = reservations.find(r => r.id === decodedText);
        if (found) {
          setSelectedReserva(found);
        } else {
          window.showToast("QR Code inválido ou não encontrado.");
        }
      }, (error: any) => {});
    }

    const subscription = supabase
      .channel('reservations_realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reservations',
        filter: session?.user?.id ? `tenant_id=eq.${session.user.id}` : undefined 
      }, () => {
        fetchReservations();
      })
      .subscribe();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      supabase.removeChannel(subscription);
    };
  }, [session]);

  const confirmCheckIn = async () => {
    if (!selectedReserva) return;
    
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'CHECKED_IN' })
        .eq('id', selectedReserva.id);

      if (error) {
        window.showToast('Erro no check-in: ' + error.message);
      } else {
        setReservations(prev => prev.map(res => 
          res.id === selectedReserva.id ? { ...res, status: 'CHECKED_IN' as const } : res
        ));
        window.showToast(`Entrada liberada: ${selectedReserva.customerName}`);
        setSelectedReserva(null);
      }
    } catch (err) {
      window.showToast('Falha na comunicação com o servidor.');
    }
  };

  const filteredReservations = reservations.filter(res => 
    (res.customerName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (res.id?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#39FF14] italic uppercase">Portaria <span className="text-white">Live</span></h1>
          <p className="text-gray-400 text-sm italic">Sincronização em tempo real via Supabase Gateway.</p>
        </div>
        <div className="bg-gray-900 px-4 py-2 rounded-2xl border border-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conexão Estável</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-black border-2 border-dashed border-gray-800 rounded-[2.5rem] p-6 overflow-hidden relative group min-h-[300px] flex flex-col items-center justify-center">
            <div id="qr-reader" className="w-full !border-none"></div>
            <div className="mt-4 flex flex-col items-center gap-2">
              <i className="fa-solid fa-camera text-gray-700"></i>
              <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em]">Aguardando Captura</p>
            </div>
          </div>

          <div className="relative group">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-4 text-gray-500 group-focus-within:text-[#39FF14] transition-colors"></i>
            <input 
              type="text" 
              placeholder="Buscar Nome, ID ou Mesa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-800 p-4 pl-12 rounded-2xl outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/20 transition-all text-sm"
            />
          </div>
        </div>

        <div className="bg-black border border-gray-800 rounded-[2.5rem] overflow-hidden flex flex-col h-[600px] shadow-2xl relative">
          <div className="p-6 border-b border-gray-800 bg-gray-900/20 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
            <h3 className="font-bold text-lg uppercase italic tracking-tighter">Lista de Acesso <span className="text-gray-500 text-sm">({reservations.length})</span></h3>
            <button 
              onClick={fetchReservations} 
              className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-lg text-[#39FF14] font-black uppercase tracking-widest transition-all active:scale-95"
            >
              <i className="fa-solid fa-rotate mr-2"></i>Sync
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="w-12 h-12 border-2 border-gray-800 rounded-full"></div>
                    <div className="w-12 h-12 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin absolute top-0 shadow-[0_0_20px_rgba(57,255,20,0.4)]"></div>
                  </div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest animate-pulse">Autenticando no Supabase...</p>
                </div>
            ) : errorMsg ? (
                <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-6">
                  <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center border border-red-500/30">
                    <i className="fa-solid fa-database text-red-500 text-2xl"></i>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 font-medium">Tabela 'reservations' não encontrada ou erro de acesso.</p>
                  </div>
                </div>
            ) : filteredReservations.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                    <div className="w-20 h-20 bg-gray-900/50 rounded-full flex items-center justify-center border border-gray-800 border-dashed">
                        <i className="fa-solid fa-ghost text-2xl opacity-20"></i>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Nenhum registro no DB</p>
                </div>
            ) : (
                filteredReservations.map((res) => (
                  <div key={res.id} className="bg-neutral-900/30 border border-gray-800/50 p-5 rounded-[1.5rem] flex justify-between items-center hover:bg-neutral-900 transition-all group hover:border-[#39FF14]/30">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-100 group-hover:text-white">{res.customerName || 'Sem Nome'}</p>
                        <span className="text-[8px] font-mono text-gray-600 uppercase bg-black px-1 rounded">{res.id?.slice(0,8)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-[11px] text-[#39FF14] font-black uppercase tracking-tighter">{res.type || 'Standard'}</p>
                        <span className="w-1 h-1 bg-gray-800 rounded-full"></span>
                        <p className="text-[11px] text-gray-500 font-bold">{res.peopleCount || 1} {res.peopleCount > 1 ? 'Pessoas' : 'Pessoa'}</p>
                      </div>
                    </div>
                    
                    {res.status === 'CHECKED_IN' ? (
                      <div className="flex items-center gap-2 bg-[#39FF14]/10 border border-[#39FF14]/20 px-4 py-2 rounded-xl text-[#39FF14] text-[10px] font-black uppercase tracking-widest">
                        <i className="fa-solid fa-circle-check"></i>
                        Confirmado
                      </div>
                    ) : (
                      <button 
                        onClick={() => setSelectedReserva(res)}
                        className="bg-[#39FF14] hover:bg-white text-black font-black px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(57,255,20,0.15)]"
                      >
                        Check-in
                      </button>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedReserva && (
        <div id="checkinModal" className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-6 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-neutral-900 border border-[#39FF14] p-10 rounded-[2.5rem] max-w-sm w-full shadow-[0_0_50px_rgba(57,255,20,0.2)]">
            <h3 className="text-[#39FF14] font-black italic text-2xl mb-6 uppercase tracking-tighter">Confirmar Entrada</h3>
            <div className="space-y-4 mb-10 border-l-2 border-[#39FF14]/30 pl-4">
              <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Cliente</p>
              <p className="text-lg font-bold text-white -mt-3">{selectedReserva.customerName}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Tipo</p>
                    <p className="text-sm font-bold text-[#39FF14]">{selectedReserva.type}</p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Pessoas</p>
                    <p className="text-sm font-bold text-white">{selectedReserva.peopleCount}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setSelectedReserva(null)} className="flex-1 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">CANCELAR</button>
              <button 
                onClick={confirmCheckIn} 
                className="flex-1 bg-[#39FF14] hover:bg-white text-black font-black py-4 rounded-2xl uppercase text-[10px] tracking-[0.2em] transition-all shadow-lg active:scale-95"
              >
                LIBERAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Entrance;
