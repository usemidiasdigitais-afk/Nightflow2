import React from 'react';

export const ErrorScreen = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
    <div className="w-24 h-24 mb-8 flex items-center justify-center rounded-[2rem] bg-red-500/10 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
      <i className="fa-solid fa-triangle-exclamation text-red-500 text-4xl animate-pulse"></i>
    </div>
    <h1 className="text-white font-black italic text-3xl mb-3 uppercase tracking-tighter">
      Falha de <span className="text-red-500">Conexão</span>
    </h1>
    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">SaaS Intelligence Core Offline</p>
    <p className="text-gray-400 text-xs max-w-xs leading-relaxed mb-10 font-medium">
      Não conseguimos estabelecer uma ponte segura com o core do NightFlow. <br/>
      <span className="text-gray-600 mt-2 block font-mono">Erro: {message}</span>
    </p>
    <button 
      onClick={() => window.location.reload()}
      className="bg-white hover:bg-red-500 hover:text-white text-black font-black px-10 py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 flex items-center gap-2"
    >
      <i className="fa-solid fa-arrows-rotate"></i>
      Tentar Reconectar
    </button>
  </div>
);