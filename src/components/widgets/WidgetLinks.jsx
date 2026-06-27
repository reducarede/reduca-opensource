import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Link2, Plus, Trash2, Settings2, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WidgetLinks({ isAdmin }) {
  const [links, setLinks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    // Para simplificar, estamos usando o localStorage enquanto a tabela não é criada no Supabase.
    // Se quiser migrar para o Supabase, basta usar: supabase.from('useful_links').select('*')
    const saved = localStorage.getItem('reduc_useful_links');
    if (saved) {
      setLinks(JSON.parse(saved));
    } else {
      setLinks([
        { id: '1', title: 'Portal do MEC', url: 'http://portal.mec.gov.br/' },
        { id: '2', title: 'BNCC Consultas', url: 'http://basenacionalcomum.mec.gov.br/' },
        { id: '3', title: 'Nova Escola', url: 'https://novaescola.org.br/' }
      ]);
    }
  };

  const saveLinks = (newLinks) => {
    setLinks(newLinks);
    localStorage.setItem('reduc_useful_links', JSON.stringify(newLinks));
  };

  const addLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    const urlFixed = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    const newLinks = [...links, { id: Date.now().toString(), title: newTitle, url: urlFixed }];
    saveLinks(newLinks);
    setNewTitle('');
    setNewUrl('');
  };

  const removeLink = (id) => {
    const newLinks = links.filter(l => l.id !== id);
    saveLinks(newLinks);
  };

  return (
    <div className="glass-card p-5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Link2 size={16} className="text-blue-400" />
          Links Úteis
        </h3>
        {isAdmin && (
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className={`text-slate-500 hover:text-blue-400 transition-colors ${isEditing ? 'text-blue-400' : ''}`}
            title="Gerenciar Links"
          >
            {isEditing ? <X size={14} /> : <Settings2 size={14} />}
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
            className="space-y-3 relative z-10"
          >
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Título do Link" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-200"
              />
              <input 
                type="text" 
                placeholder="URL (ex: site.com)" 
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-200"
              />
              <button 
                onClick={addLink}
                className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Adicionar Link
              </button>
            </div>

            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
              {links.map(link => (
                <div key={link.id} className="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                  <span className="text-sm text-slate-300 truncate pr-2">{link.title}</span>
                  <button onClick={() => removeLink(link.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1">
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
            className="space-y-2 relative z-10"
          >
            {links.length > 0 ? (
              links.map((link, idx) => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group/link flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-blue-900/20 border border-slate-700/50 hover:border-blue-500/30 transition-all"
                >
                  <span className="text-sm font-medium text-slate-300 group-hover/link:text-blue-300 transition-colors">{link.title}</span>
                  <ExternalLink size={14} className="text-slate-500 group-hover/link:text-blue-400 transition-colors" />
                </a>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">Nenhum link adicionado ainda.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
