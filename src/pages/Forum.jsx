import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, ArrowLeft, Search, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Forum({ user }) {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [categories] = useState(['Geral', 'Tira-Dúvidas', 'Projetos', 'Avisos', 'Off-Topic']);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Geral');

  useEffect(() => {
    fetchTopics();
  }, [activeCategory]);

  const fetchTopics = async () => {
    let query = supabase.from('forum_topics').select('*, author:profiles(id, name, avatar), replies:forum_replies(id)').order('created_at', { ascending: false });
    
    if (activeCategory !== 'Todos') {
      query = query.eq('category', activeCategory);
    }

    const { data } = await query;
    if (data) setTopics(data);
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const { data } = await supabase.from('forum_topics').insert({
      title: newTitle,
      content: newContent,
      category: newCategory,
      author_id: user.id
    }).select().single();

    if (data) {
      setIsCreating(false);
      setNewTitle('');
      setNewContent('');
      navigate(`/forum/${data.id}`);
    }
  };

  return (
    <div className="min-h-screen pb-20 pt-20 px-4 md:px-12 max-w-5xl mx-auto relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition glass px-4 py-2 rounded-full w-fit">
            <ArrowLeft size={18} /> Voltar ao Feed
          </button>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
            <MessageSquare className="text-orange-500" size={32} /> Fórum de Discussão
          </h1>
          <p className="text-slate-400 mt-2">Debata ideias, tire dúvidas e conecte-se com a comunidade.</p>
        </div>

        <button 
          onClick={() => setIsCreating(true)}
          className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition flex items-center gap-2"
        >
          <Plus size={20} /> Novo Tópico
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
        <button 
          onClick={() => setActiveCategory('Todos')}
          className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === 'Todos' ? 'bg-orange-500 text-white' : 'glass text-slate-400 hover:text-slate-200'}`}
        >
          Todos os Tópicos
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === cat ? 'bg-orange-500 text-white' : 'glass text-slate-400 hover:text-slate-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {topics.map(topic => (
          <Link to={`/forum/${topic.id}`} key={topic.id} className="block group">
            <div className="glass-card p-5 hover:border-orange-500/50 transition-colors border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase">
                    <Hash size={10} /> {topic.category}
                  </span>
                  <span className="text-xs text-slate-500">
                    por <span className="text-slate-300">{topic.author?.name}</span> • {new Date(topic.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-200 group-hover:text-orange-400 transition-colors">{topic.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-1 mt-1">{topic.content}</p>
              </div>
              
              <div className="flex items-center gap-4 text-slate-500">
                <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                  <MessageSquare size={16} />
                  <span className="font-bold text-slate-300">{topic.replies?.[0]?.count || topic.replies?.length || 0}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {topics.length === 0 && (
          <div className="text-center py-16 glass-card border border-slate-700/50">
            <MessageSquare size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">Nenhum tópico encontrado</h3>
            <p className="text-slate-500">Seja o primeiro a iniciar uma discussão nesta categoria.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreating(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-2xl p-6 md:p-8 relative z-10 border border-slate-700">
              <h2 className="text-2xl font-bold text-orange-500 mb-6">Criar Novo Tópico</h2>
              
              <form onSubmit={handleCreateTopic} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase font-bold tracking-wide">Categoria</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="glass-input w-full p-3 rounded-xl appearance-none">
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900 text-slate-200">{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase font-bold tracking-wide">Título do Tópico</label>
                  <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="glass-input w-full p-3 rounded-xl" placeholder="Ex: Como resolver a equação de 2º grau?" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase font-bold tracking-wide">Conteúdo da Discussão</label>
                  <textarea required value={newContent} onChange={e => setNewContent(e.target.value)} className="glass-input w-full p-3 rounded-xl min-h-[150px] resize-y" placeholder="Descreva sua dúvida, ideia ou debate aqui..."></textarea>
                </div>
                
                <div className="flex gap-3 justify-end pt-4">
                  <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition">Cancelar</button>
                  <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition">Publicar Tópico</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
