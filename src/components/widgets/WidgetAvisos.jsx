import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Megaphone, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WidgetAvisos() {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvisos = async () => {
      try {
        // Encontrar os admins
        const { data: admins, error: adminErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('is_admin', true);
          
        if (adminErr || !admins || admins.length === 0) {
           setLoading(false);
           return;
        }
        
        const adminIds = admins.map(a => a.id);
        
        // Buscar os últimos 2 posts dos admins que contêm a hashtag #aviso
        const { data: posts } = await supabase
          .from('posts')
          .select('id, content, created_at, author:profiles(name, avatar)')
          .in('user_id', adminIds)
          .ilike('content', '%#aviso%')
          .order('created_at', { ascending: false })
          .limit(2);
          
        if (posts) {
          setAvisos(posts);
        }
      } catch (error) {
        console.error("Erro ao buscar avisos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvisos();

    // Inscrição em tempo real para novos avisos
    const channel = supabase.channel('realtime-avisos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchAvisos();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (loading) return null;
  // O widget só é renderizado se existir pelo menos um aviso ativo.
  if (avisos.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-5 relative overflow-hidden border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
    >
      {/* Detalhe visual na borda esquerda */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-orange-500"></div>
      
      <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Megaphone size={18} className="text-red-500 animate-pulse" />
        Avisos Oficiais
      </h3>
      
      <div className="space-y-3">
        {avisos.map(aviso => {
          // Limpa a tag #aviso do texto para exibição mais limpa
          const cleanText = aviso.content.replace(/#aviso/gi, '').trim();
          
          return (
            <div key={aviso.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50 text-sm hover:border-slate-600 transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img src={aviso.author?.avatar} alt={aviso.author?.name} className="w-5 h-5 rounded-full object-cover border border-slate-600" />
                  <span className="text-[11px] font-semibold text-slate-300">{aviso.author?.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
                  {new Date(aviso.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed flex items-start gap-2">
                <AlertCircle size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs">{cleanText.length > 100 ? cleanText.substring(0, 100) + '...' : cleanText}</span>
              </p>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-center mt-4 text-slate-500 italic">Enviado em massa pela administração</p>
    </motion.div>
  );
}
