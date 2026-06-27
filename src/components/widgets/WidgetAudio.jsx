import React, { useState, useEffect } from 'react';
import { Headphones, Edit3, Check } from 'lucide-react';
import { supabase } from '../../supabase';

export default function WidgetAudio({ isAdmin, currentUser }) {
  const [audioUrl, setAudioUrl] = useState('');
  const [title, setTitle] = useState('Áudio em Destaque');
  const [isEditing, setIsEditing] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [tempTitle, setTempTitle] = useState('');

  useEffect(() => {
    fetchAudio();
  }, []);

  const fetchAudio = async () => {
    // Busca a configuração global do áudio
    const { data } = await supabase.from('custom_widgets').select('*').eq('id', 'global-audio').single();
    if (data) {
      setAudioUrl(data.url || '');
      setTitle(data.title || 'Áudio em Destaque');
      setTempUrl(data.url || '');
      setTempTitle(data.title || 'Áudio em Destaque');
    }
  };

  const handleSave = async () => {
    const { data: existing } = await supabase.from('custom_widgets').select('id').eq('id', 'global-audio').single();
    
    if (existing) {
      await supabase.from('custom_widgets').update({
        title: tempTitle,
        url: tempUrl,
        description: 'audio-widget'
      }).eq('id', 'global-audio');
    } else {
      await supabase.from('custom_widgets').insert({
        id: 'global-audio',
        user_id: currentUser?.id,
        title: tempTitle,
        url: tempUrl,
        description: 'audio-widget'
      });
    }

    setAudioUrl(tempUrl);
    setTitle(tempTitle);
    setIsEditing(false);
  };

  if (!audioUrl && !isAdmin) return null; // Não exibe para alunos se não tiver áudio

  return (
    <div className="glass-card p-5 relative overflow-hidden group border border-slate-700/50">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-purple-500/20 p-2 rounded-lg">
            <Headphones size={20} className="text-purple-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">{title}</h3>
        </div>

        {isAdmin && (
          <button onClick={() => setIsEditing(!isEditing)} className="text-slate-400 hover:text-white transition">
            <Edit3 size={16} />
          </button>
        )}
      </div>

      <div className="relative z-10">
        {isEditing ? (
          <div className="space-y-3 mt-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Título do Áudio</label>
              <input 
                type="text" 
                value={tempTitle} 
                onChange={(e) => setTempTitle(e.target.value)} 
                className="glass-input w-full py-1.5 text-sm" 
                placeholder="Ex: Podcast da Semana"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Link do Áudio (MP3)</label>
              <input 
                type="url" 
                value={tempUrl} 
                onChange={(e) => setTempUrl(e.target.value)} 
                className="glass-input w-full py-1.5 text-sm" 
                placeholder="https://exemplo.com/audio.mp3"
              />
            </div>
            <button onClick={handleSave} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-2">
              <Check size={14} /> Salvar Áudio
            </button>
          </div>
        ) : audioUrl ? (
          <div className="mt-4">
            <audio controls src={audioUrl} className="w-full h-10 rounded-full outline-none">
              Seu navegador não suporta o elemento de áudio.
            </audio>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">Configure um link de áudio clicando no lápis acima.</p>
        )}
      </div>
    </div>
  );
}
