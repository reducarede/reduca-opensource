import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Sparkles, User, X } from 'lucide-react';
import { chatWithAI } from '../../ai';

export default function WidgetIA({ currentUser }) {
  const [messages, setMessages] = useState([
    { role: 'model', text: `Olá, ${currentUser?.name?.split(' ')[0] || 'Professor'}! Sou o Assistente IA da Reduca. Como posso ajudar com suas aulas hoje?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await chatWithAI(userMsg, messages);
      setMessages([...newMessages, { role: 'model', text: response }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'model', text: 'Desculpe, ocorreu um erro na comunicação. Verifique se a chave do Groq está configurada corretamente no .env.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 border border-indigo-700/50 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
      
      <div className="flex justify-between items-center mb-4 relative z-10 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
          <Bot size={18} /> Assistente Reduca IA
        </h3>
        {isOpen ? <X size={16} className="text-slate-400" /> : <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">Chat</span>}
      </div>

      {isOpen ? (
        <div className="flex flex-col h-80 relative z-10 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 mb-3 p-2 bg-slate-900/50 rounded-xl border border-slate-800">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles size={12} className="text-indigo-400" />
                  </div>
                )}
                <div className={`p-2.5 rounded-2xl max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                 <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={12} className="text-indigo-400" />
                  </div>
                  <div className="p-3 bg-slate-800 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte à IA..."
              className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2 rounded-xl transition"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        <p className="text-xs text-slate-400 relative z-10">
          Tire dúvidas, crie planos de aula e receba sugestões diretamente com a nossa IA.
        </p>
      )}
    </div>
  );
}
