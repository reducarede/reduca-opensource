import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabase';
import { Send, MessageSquareText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WidgetChat({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [error, setError] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    const fetchMsgs = async () => {
      try {
        const { data, error } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true }).limit(50);
        if (error) throw error;
        if (data) {
          setMessages(data);
          setError(false);
        }
      } catch (err) {
        console.error("Chat fetch error:", err.message);
        setError(true); // Table doesn't exist yet
      }
    };
    
    fetchMsgs();

    if (!error) {
      const channel = supabase.channel('global-chat')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
          setMessages(prev => [...prev, payload.new]);
        })
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
  }, [error]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !currentUser) return;
    
    // Quick get profile name
    const { data: profile } = await supabase.from('profiles').select('name, avatar').eq('id', currentUser.id).single();
    const userName = profile?.name || currentUser.email.split('@')[0];
    const userAvatar = profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`;

    const msgObj = {
      user_id: currentUser.id,
      user_name: userName,
      user_avatar: userAvatar,
      text: newMsg
    };

    setNewMsg('');
    await supabase.from('chat_messages').insert([msgObj]);
  };

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border border-slate-700/50">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <MessageSquareText size={16} className="text-orange-500" /> Sala de Chat
        </h3>
        <p className="text-xs text-slate-500">Serviço temporariamente indisponível.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card flex flex-col h-96 overflow-hidden border border-slate-700/50">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-700/50 p-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <MessageSquareText size={16} className="text-orange-500" /> Chat Global
        </h3>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </div>
      
      {/* Messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/20">
        {messages.length === 0 ? (
          <div className="text-center text-xs text-slate-500 h-full flex items-center justify-center">
            Nenhuma mensagem ainda. Seja o primeiro a dar um "Oi"!
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex gap-2 ${m.user_id === currentUser?.id ? 'flex-row-reverse' : 'flex-row'}`}>
              <img src={m.user_avatar || 'https://placehold.co/100'} alt="" className="w-6 h-6 rounded-full border border-slate-600 object-cover" />
              <div className={`flex flex-col ${m.user_id === currentUser?.id ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <span className="text-[10px] text-slate-500 mb-0.5 px-1">{m.user_name}</span>
                <div className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${m.user_id === currentUser?.id ? 'bg-orange-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm'}`}>
                  {m.text}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white/50 border-t border-black/10 flex gap-2">
        <input 
          type="text" 
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Envie uma mensagem..."
          className="flex-1 min-w-0 bg-transparent border border-black/20 rounded-full px-4 py-2 text-sm text-black placeholder:text-black/50 focus:outline-none focus:border-orange-500 transition-colors"
        />
        <button type="submit" disabled={!newMsg.trim()} className="bg-orange-600 hover:bg-orange-500 disabled:bg-slate-300 disabled:text-white/50 text-white p-2 rounded-full transition-colors flex items-center justify-center shrink-0">
          <Send size={16} />
        </button>
      </form>
    </motion.div>
  );
}
