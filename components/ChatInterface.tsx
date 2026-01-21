import React, { useState, useRef, useEffect } from 'react';
import { processChatMessage } from '../services/geminiService';
import { ChatMessage, AIResponse } from '../types';

interface ChatInterfaceProps {
  onConfirmSale: (amount: number) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onConfirmSale }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o motor de IA do NightFlow. Estou pronto para otimizar o faturamento da noite. Como posso ajudar com os pedidos?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (msgText: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const textToSend = msgText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const result = await processChatMessage(textToSend);
    
    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: result.mensagem_chat,
      timestamp: new Date(),
      metadata: result
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  const finalizeOrder = (amount: number) => {
    onConfirmSale(amount);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: '✅ Pedido processado e registrado com sucesso no banco de dados. O faturamento no Dashboard foi sincronizado.',
      timestamp: new Date()
    }]);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-220px)] flex flex-col bg-black rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl relative group">
      {/* Decorative Blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#39FF14]/40 to-transparent"></div>

      {/* Quick Actions - Sidebar Tool */}
      <div className="absolute top-24 right-8 flex flex-col gap-3 z-30 no-print opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden lg:flex">
        <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] text-right mb-1 italic">Stress Test Engine</p>
        <button onClick={() => handleSend("Quero comprar 1 ingresso individual")} className="bg-neutral-900/80 backdrop-blur-md border border-gray-800 text-white text-[10px] font-black px-5 py-3.5 rounded-2xl hover:border-[#39FF14] hover:bg-black transition-all uppercase tracking-tighter shadow-2xl flex items-center justify-between gap-4">
          <span>1 Ingresso</span>
          <i className="fa-solid fa-user text-[#39FF14]/40"></i>
        </button>
        <button onClick={() => handleSend("Vou querer 4 ingressos para mim e meus amigos")} className="bg-neutral-900/80 backdrop-blur-md border border-gray-800 text-white text-[10px] font-black px-5 py-3.5 rounded-2xl hover:border-[#39FF14] hover:bg-black transition-all uppercase tracking-tighter shadow-2xl flex items-center justify-between gap-4">
          <span>4 Ingressos</span>
          <i className="fa-solid fa-users text-[#39FF14]/40"></i>
        </button>
        <button onClick={() => handleSend("Quero saber mais sobre o camarote premium")} className="bg-neutral-900/80 backdrop-blur-md border border-gray-800 text-white text-[10px] font-black px-5 py-3.5 rounded-2xl hover:border-[#39FF14] hover:bg-black transition-all uppercase tracking-tighter shadow-2xl flex items-center justify-between gap-4">
          <span>VIP Access</span>
          <i className="fa-solid fa-crown text-[#39FF14]/40"></i>
        </button>
      </div>

      {/* Chat Header */}
      <div className="px-8 py-5 border-b border-gray-800 bg-gray-900/30 flex justify-between items-center z-20 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#39FF14]/10 flex items-center justify-center text-[#39FF14] border border-[#39FF14]/20 shadow-[0_0_20px_rgba(57,255,20,0.1)]">
            <i className="fa-solid fa-microchip text-xl"></i>
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight uppercase italic">NightFlow <span className="text-[#39FF14]">Upsell Simulator</span></h3>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-pulse"></span>
                SaaS Engine v3.1 Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <span className="hidden md:inline text-[9px] text-gray-600 font-mono border border-gray-800 px-3 py-1.5 rounded-full uppercase">ID: NF-THINKING-CORE</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-10 scroll-smooth custom-scrollbar bg-[#020202]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
            <div className={`max-w-[75%] rounded-[2rem] p-6 shadow-2xl relative ${
              msg.role === 'user' 
                ? 'bg-[#39FF14] text-black font-bold' 
                : 'bg-neutral-900/40 border border-white/5 backdrop-blur-xl text-gray-100'
            }`}>
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              
              {/* Special Upsell Result Card */}
              {msg.metadata?.sugestao_upsell && (
                <div className="mt-6 p-6 bg-black/60 rounded-[2rem] border border-[#39FF14]/30 animate-in zoom-in-95 duration-500 shadow-[0_0_30px_rgba(57,255,20,0.1)]">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-wand-magic-sparkles text-[#39FF14] text-xs"></i>
                        <span className="text-[#39FF14] text-[10px] font-black tracking-[0.2em] uppercase">Vantagem Operacional</span>
                    </div>
                    <span className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-gray-400 font-bold uppercase tracking-tight italic border border-white/5">{msg.metadata.item_sugerido}</span>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 italic">Venda Projetada</p>
                      <p className="text-4xl font-black text-white tracking-tighter">
                        R$ {msg.metadata.valor_total.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <button 
                      onClick={() => finalizeOrder(msg.metadata!.valor_total)}
                      className="bg-[#39FF14] hover:bg-white text-black text-[11px] font-black px-7 py-4 rounded-2xl hover:scale-[1.05] active:scale-[0.98] transition-all shadow-[0_15px_35px_rgba(57,255,20,0.3)] uppercase tracking-widest"
                    >
                      <i className="fa-solid fa-check-double mr-2"></i>
                      Fechar Pedido
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-4 opacity-30 border-t border-white/5 pt-3">
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{msg.role === 'assistant' ? 'AI Agent' : 'Operador'}</span>
                <p className="text-[9px] font-bold">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-neutral-900/40 border border-white/5 backdrop-blur-xl rounded-3xl p-5 px-8 flex gap-3 items-center">
              <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-bounce"></div>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] ml-4">Analizando Pedido...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={(e) => handleSend('', e)} className="p-8 border-t border-gray-800 bg-black/90 backdrop-blur-2xl">
        <div className="relative flex items-center max-w-3xl mx-auto">
          <div className="absolute left-6 text-gray-600">
            <i className="fa-solid fa-terminal text-sm"></i>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Comando operacional ou conversa com cliente..."
            className="w-full bg-neutral-900/50 border border-gray-700 rounded-3xl py-6 pl-14 pr-20 text-[15px] focus:outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/10 transition-all placeholder:text-gray-700 text-white"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 bg-[#39FF14] text-black w-14 h-14 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:scale-100 shadow-[0_0_20px_rgba(57,255,20,0.3)]"
          >
            <i className="fa-solid fa-chevron-right text-xl"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;