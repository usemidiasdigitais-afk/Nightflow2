import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        if (window.showToast) window.showToast(error.message);
        else console.error(error.message);
      } else {
        if (window.showToast) window.showToast("Bem-vindo ao NightFlow!");
      }
    } catch (err) {
      console.error("Auth Exception:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 relative overflow-hidden">
      {/* Dynamic Background flourishes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#39FF14]/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md relative animate-bounce-in">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#39FF14] rounded-2xl shadow-[0_0_35px_rgba(57,255,20,0.4)] flex items-center justify-center mb-6 animate-float">
            <i className="fa-solid fa-bolt text-black text-3xl"></i>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
            NIGHT<span className="text-[#39FF14]">FLOW</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">SaaS Intelligence Core</p>
        </div>

        <form 
          onSubmit={handleLogin} 
          className="glass-panel p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6 relative group"
        >
          {/* Subtle hover effect on card */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#39FF14]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[2.5rem]"></div>

          <div className="space-y-2 relative z-10">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Acesso do Operador</label>
            <div className="relative group/input">
              <i className="fa-solid fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-[#39FF14] transition-colors"></i>
              <input 
                type="email" 
                placeholder="admin@nightflow.com" 
                className="w-full bg-black/40 border border-gray-800 p-4 pl-14 rounded-2xl text-white outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/20 transition-all placeholder:text-gray-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <div className="flex justify-between items-center px-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Chave de Segurança</label>
              <button type="button" className="text-[9px] font-black text-[#39FF14] uppercase hover:underline opacity-60">Esqueceu?</button>
            </div>
            <div className="relative group/input">
              <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-[#39FF14] transition-colors"></i>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-black/40 border border-gray-800 p-4 pl-14 rounded-2xl text-white outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/20 transition-all placeholder:text-gray-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#39FF14] text-black font-black py-5 rounded-2xl shadow-[0_15px_30px_rgba(57,255,20,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 relative z-10"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket mr-1"></i>
                Entrar no Sistema
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-10 text-[9px] text-gray-600 font-bold uppercase tracking-[0.4em] italic opacity-50">
          Authorized personnel only • Secure Gateway v3.2
        </p>
      </div>
    </div>
  );
};