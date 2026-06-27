import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { PlayCircle, Edit3, X, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WidgetVideoDestaque({ currentUser, isAdmin }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState('');

  const parseVideoUrl = (url) => {
    if (!url) return null;
    if (url.match(/\.mp4(\?|$)/i)) {
      return { type: 'mp4', url };
    }
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? { type: 'youtube', id: match[1] } : null;
  };

  useEffect(() => {
    fetchFeaturedVideo();

    // Listen for new videos
    const channel = supabase.channel('realtime-video')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
        if (payload.new && payload.new.content && payload.new.content.includes('#videodestaque')) {
          fetchFeaturedVideo();
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchFeaturedVideo = async () => {
    setLoading(true);
    try {
      // Find admins
      const { data: admins } = await supabase.from('profiles').select('id').eq('is_admin', true);
      if (!admins || admins.length === 0) { setLoading(false); return; }
      
      const adminIds = admins.map(a => a.id);
      
      // Get the latest post with #videodestaque
      const { data: posts } = await supabase
        .from('posts')
        .select('content')
        .in('user_id', adminIds)
        .ilike('content', '%#videodestaque%')
        .order('created_at', { ascending: false })
        .limit(1);

      if (posts && posts.length > 0) {
        const content = posts[0].content;
        const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          const url = urlMatch[0];
          setVideoUrl(url);
          setVideoData(parseVideoUrl(url));
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleUpdateVideo = async (e) => {
    e.preventDefault();
    if (!editUrl) return;

    try {
      // Create a hidden post that serves as the video storage
      await supabase.from('posts').insert({
        user_id: currentUser.id,
        content: `#videodestaque ${editUrl}`
      });
      
      setVideoUrl(editUrl);
      setVideoData(parseVideoUrl(editUrl));
      setIsEditing(false);
      setEditUrl('');
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar o vídeo.');
    }
  };

  if (loading) return null;
  
  // Se não tem vídeo e não é admin, não mostra nada
  if (!videoData && !isAdmin) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-1 md:p-2 mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)] relative group"
    >
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        {isAdmin && !isEditing && (
          <button 
            onClick={() => { setEditUrl(videoUrl); setIsEditing(true); }}
            className="p-2 bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-white rounded-lg border border-slate-700 shadow-xl transition-colors"
            title="Trocar Vídeo em Destaque"
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
            onSubmit={handleUpdateVideo} 
            className="p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <PlayCircle size={20} className="text-red-500" />
              <h3 className="text-sm font-bold text-slate-200">Atualizar Vídeo em Destaque</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="url" 
                placeholder="Cole o link do YouTube aqui..." 
                value={editUrl} 
                onChange={e => setEditUrl(e.target.value)}
                className="glass-input flex-1 border-slate-700 focus:border-red-500"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors flex items-center justify-center font-medium shadow-lg shadow-red-500/20 whitespace-nowrap">
                  <Check size={18} className="mr-1" /> Salvar
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors flex items-center justify-center font-medium">
                  <X size={18} />
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
            {videoData ? (
              <div className="relative aspect-video w-full rounded-lg md:rounded-xl overflow-hidden shadow-inner bg-black">
                {videoData.type === 'youtube' ? (
                  <iframe 
                    src={`https://www.youtube-nocookie.com/embed/${videoData.id}?rel=0&modestbranding=1`}
                    title="Vídeo em Destaque"
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video 
                    src={videoData.url}
                    controls
                    className="absolute top-0 left-0 w-full h-full object-contain"
                  />
                )}
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-slate-700/50 rounded-xl m-2 bg-slate-900/30">
                <PlayCircle size={32} className="mx-auto mb-3 text-slate-600" />
                <h3 className="text-slate-300 font-semibold mb-1">Nenhum Vídeo em Destaque</h3>
                <p className="text-xs text-slate-500 mb-4">Apenas administradores podem adicionar um vídeo aqui.</p>
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-2">
                  <Plus size={14} /> Adicionar Vídeo
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
