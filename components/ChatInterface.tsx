
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
      content: 'Olá! Sou o motor de IA do NightFlow. Como posso ajudar com os pedidos hoje?',
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
      content: '✅ Pedido confirmado e enviado para o caixa!',
      timestamp: new Date()
    }]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col bg-black rounded-3xl border border-gray-800 overflow-hidden shadow-2xl relative">
      {/* Quick Test Actions */}
      <div className="absolute top-20 right-6 flex flex-col gap-2 z-10 no-print">
        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-right mb-1">Simular Cenários</p>
        <button onClick={() => handleSend("Quero 1 ingresso")} className="bg-gray-900/80 backdrop-blur-md border border-gray-700 text-white text-[9px] font-black px-3 py-2 rounded-lg hover:border-[#39FF14] transition-all uppercase tracking-tighter">1 Ingresso (Upsell)</button>
        <button onClick={() => handleSend("Quero 4 ingressos")} className="bg-gray-900/80 backdrop-blur-md border border-gray-700 text-white text-[9px] font-black px-3 py-2 rounded-lg hover:border-[#39FF14] transition-all uppercase tracking-tighter">4 Ingressos (Combo)</button>
        <button onClick={() => handleSend("Qual o valor do camarote?")} className="bg-gray-900/80 backdrop-blur-md border border-gray-700 text-white text-[9px] font-black px-3 py-2 rounded-lg hover:border-[#39FF14] transition-all uppercase tracking-tighter">VIP / Camarote</button>
      </div>

      {/* Chat Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#39FF14]/20 flex items-center justify-center text-[#39FF14] border border-[#39FF14]/30 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
            <i className="fa-solid fa-brain"></i>
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">NightFlow <span className="text-[#39FF14]">Upsell Engine</span></h3>
            <p className="text-[10px] text-green-500 uppercase font-black tracking-widest">IA Operacional Ativa</p>
          </div>
        </div>
        <div className="flex gap-2">
            <span className="text-[10px] bg-gray-800 px-3 py-1.5 rounded-lg text-gray-400 font-mono">NODE: NF-GEMINI-3</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[75%] rounded-[1.5rem] p-5 shadow-xl ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-[#39FF14] to-[#2ecc71] text-black font-bold' 
                : 'bg-neutral-900 border border-gray-800 text-gray-100'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              
              {/* Metadata / Upsell Card */}
              {msg.metadata?.sugestao_upsell && (
                <div className="mt-4 pt-4 border-t border-gray-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-[#39FF14]/10 text-[#39FF14] text-[9px] px-2 py-1 rounded-full border border-[#39FF14]/20 font-black tracking-widest">
                      UPSELL DISPONÍVEL
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">{msg.metadata.item_sugerido}</span>
                  </div>
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-black">Total Estimado</p>
                      <p className="text-xl font-black text-white">
                        R$ {msg.metadata.valor_total.toFixed(2)}
                      </p>
                    </div>
                    <button 
                      onClick={() => finalizeOrder(msg.metadata!.valor_total)}
                      className="bg-[#39FF14] text-black text-[10px] font-black px-4 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                      FINALIZAR PEDIDO
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-3 opacity-40">
                <span className="text-[9px] font-bold uppercase tracking-widest">{msg.role === 'assistant' ? 'System' : 'Client'}</span>
                <p className="text-[10px]">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-neutral-900 border border-gray-800 rounded-[1.5rem] p-4 px-6 flex gap-2 items-center">
              <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={(e) => handleSend('', e)} className="p-6 border-t border-gray-800 bg-black/50 backdrop-blur-md">
        <div className="relative flex items-center max-w-2xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite o pedido do cliente..."
            className="w-full bg-neutral-900 border border-gray-700 rounded-2xl py-4 pl-6 pr-16 text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/20 transition-all placeholder:text-gray-600 shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bg-[#39FF14] text-black w-12 h-12 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 shadow-lg"
          >
            <i className="fa-solid fa-paper-plane text-lg"></i>
          </button>
        </div>
        <div className="mt-4 flex justify-center items-center gap-6 opacity-40">
            <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-bolt text-[10px]"></i>
                <span className="text-[8px] font-black uppercase tracking-widest italic">Fast Response</span>
            </div>
            <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-shield-halved text-[10px]"></i>
                <span className="text-[8px] font-black uppercase tracking-widest italic">Encrypted Feed</span>
            </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
