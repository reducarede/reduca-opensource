import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { LayoutTemplate, Edit3, X, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WidgetAudiobook({ currentUser, isAdmin }) {
  const [embedUrl, setEmbedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editInput, setEditInput] = useState('');

  const parseAudioInput = (input) => {
    if (!input) return null;
    
    // Se o usuário colou todo o código <iframe> do Castbox ou outro site
    const srcMatch = input.match(/src="([^"]+)"/);
    if (srcMatch) {
      return srcMatch[1]; // Retorna apenas o link
    }
    
    // Se colou apenas o link direto
    if (input.startsWith('http')) {
      return input;
    }
    
    return null;
  };

  useEffect(() => {
    fetchFeaturedAudiobook();

    const channel = supabase.channel('realtime-audiobook')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
        if (payload.new && payload.new.content && payload.new.content.includes('#audiolivro')) {
          fetchFeaturedAudiobook();
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchFeaturedAudiobook = async () => {
    setLoading(true);
    try {
      const { data: admins } = await supabase.from('profiles').select('id').eq('is_admin', true);
      if (!admins || admins.length === 0) { setLoading(false); return; }
      
      const adminIds = admins.map(a => a.id);
      
      const { data: posts } = await supabase
        .from('posts')
        .select('content')
        .in('user_id', adminIds)
        .ilike('content', '%#audiolivro%')
        .order('created_at', { ascending: false })
        .limit(1);

      if (posts && posts.length > 0) {
        const content = posts[0].content;
        const urlMatch = content.match(/#audiolivro\s+(.+)/);
        if (urlMatch) {
          setEmbedUrl(urlMatch[1].trim());
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleUpdateAudiobook = async (e) => {
    e.preventDefault();
    if (!editInput) return;
    
    const parsedUrl = parseAudioInput(editInput);
    if (!parsedUrl) {
      alert("Entrada inválida. Cole o código <iframe...> ou o link direto.");
      return;
    }

    try {
      await supabase.from('posts').insert({
        user_id: currentUser.id,
        content: `#audiolivro ${parsedUrl}`
      });
      
      setEmbedUrl(parsedUrl);
      setIsEditing(false);
      setEditInput('');
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar o audiolivro.');
    }
  };

  if (loading) return null;
  
  if (!embedUrl && !isAdmin) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-2 md:p-4 relative group"
    >
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        {isAdmin && !isEditing && embedUrl && (
          <button 
            onClick={() => { setEditInput(embedUrl); setIsEditing(true); }}
            className="p-1.5 bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-white rounded-lg border border-slate-700 shadow-xl transition-colors"
            title="Trocar Audiolivro"
          >
            <Edit3 size={16} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleUpdateAudiobook} 
            className="mb-2"
          >
            <div className="flex items-center gap-2 mb-3">
              <LayoutTemplate size={18} className="text-orange-500" />
              <h3 className="text-sm font-bold text-slate-200">Editar Conteúdo</h3>
            </div>
            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                placeholder="Cole o código <iframe...>..." 
                value={editInput} 
                onChange={e => setEditInput(e.target.value)}
                className="glass-input w-full border-slate-700 focus:border-orange-500 text-xs py-2 px-3"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors flex items-center justify-center font-medium shadow-lg shadow-orange-500/20 text-xs">
                  <Check size={14} className="mr-1" /> Salvar
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center justify-center font-medium">
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {embedUrl ? (
              <>
                <h3 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <LayoutTemplate size={18} className="text-orange-500" />
                  Conteúdo em Destaque
                </h3>
                <div className="rounded-xl overflow-hidden shadow-lg border border-slate-700/50 bg-black/20 w-full relative">
                  <iframe 
                    className="w-full h-[500px]"
                    src={embedUrl} 
                    title="Audio player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen>
                  </iframe>
                </div>
              </>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-900/30">
                <LayoutTemplate size={32} className="mx-auto mb-3 text-slate-600" />
                <h3 className="text-slate-300 font-semibold mb-1 text-sm">Nenhum Conteúdo</h3>
                <p className="text-xs text-slate-500 mb-4">Adicione qualquer código embed (iframe) para os alunos.</p>
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-2">
                  <Plus size={14} /> Adicionar Link
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
