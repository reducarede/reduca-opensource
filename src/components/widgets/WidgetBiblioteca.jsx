import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Library, Plus, Trash2, Settings2, ExternalLink, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WidgetBiblioteca({ isAdmin }) {
  const [materials, setMaterials] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const { data } = await supabase.from('library_materials').select('*').order('created_at', { ascending: true });
    if (data) setMaterials(data);
  };

  const addMaterial = async () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    const urlFixed = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    
    // Auto-detect type
    let type = 'link';
    if (urlFixed.toLowerCase().endsWith('.pdf')) type = 'pdf';
    else if (urlFixed.toLowerCase().includes('drive.google.com')) type = 'drive';

    const { data } = await supabase.from('library_materials').insert({
      title: newTitle,
      url: urlFixed,
      type
    }).select().single();

    if (data) {
      setMaterials([...materials, data]);
      setNewTitle('');
      setNewUrl('');
    }
  };

  const removeMaterial = async (id) => {
    await supabase.from('library_materials').delete().eq('id', id);
    setMaterials(materials.filter(m => m.id !== id));
  };

  return (
    <div className="glass-card p-5 relative overflow-hidden group border border-slate-700/50">
      <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all duration-500"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-sky-500/20 p-2 rounded-lg">
            <Library size={20} className="text-sky-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">Biblioteca Virtual</h3>
        </div>

        {isAdmin && (
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className={`text-slate-500 hover:text-sky-400 transition-colors ${isEditing ? 'text-sky-400' : ''}`}
            title="Gerenciar Biblioteca"
          >
            {isEditing ? <X size={16} /> : <Settings2 size={16} />}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div 
            key="edit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3 relative z-10 mt-2"
          >
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Título do Material" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="glass-input w-full py-2 text-sm"
              />
              <input 
                type="text" 
                placeholder="URL (PDF, Doc, Drive...)" 
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                className="glass-input w-full py-2 text-sm"
              />
              <button 
                onClick={addMaterial}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white rounded-lg py-2 text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
              >
                <Plus size={16} /> Adicionar Material
              </button>
            </div>

            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
              {materials.map(material => (
                <div key={material.id} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText size={14} className="text-sky-400 shrink-0" />
                    <span className="text-xs text-slate-300 truncate">{material.title}</span>
                  </div>
                  <button onClick={() => removeMaterial(material.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1 shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-2 relative z-10 mt-2"
          >
            {materials.length > 0 ? (
              materials.map((material) => (
                <a 
                  key={material.id} 
                  href={material.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group/link flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-sky-900/20 border border-slate-700/50 hover:border-sky-500/30 transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-slate-900 p-1.5 rounded-md group-hover/link:bg-sky-900/50 transition-colors shrink-0">
                      <FileText size={16} className="text-sky-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-300 group-hover/link:text-sky-300 transition-colors truncate">{material.title}</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-500 group-hover/link:text-sky-400 transition-colors shrink-0 ml-2" />
                </a>
              ))
            ) : (
              <div className="text-center py-6 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                <Library size={24} className="mx-auto text-slate-600 mb-2" />
                <p className="text-xs text-slate-500">Nenhum material na biblioteca.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
