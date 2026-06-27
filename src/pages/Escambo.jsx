import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import { RefreshCcw, Home as HomeIcon, MessageCircle, Users, Bell, BadgeCheck, BookOpen, PackageOpen, LayoutGrid, Plus, HeartHandshake, Box, ImagePlus, X, Loader2, Check, Trash2, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import AppDrawer from '../components/AppDrawer';
import { motion, AnimatePresence } from 'framer-motion';

export default function Escambo({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', type: 'Troca' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setUserData(data));
    fetchItems();
  }, [user.id]);

  const fetchItems = async () => {
    setLoading(true);
    // Use select com error handling simplificado para fallback se a tabela não existir
    try {
      const { data, error } = await supabase
        .from('barter_items')
        .select('*, author:profiles(id, name, avatar, email, is_verified)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setItems(data || []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
    setIsSubmitting(true);
    try {
      await supabase.from('barter_items').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: 'Disponível'
      });
      setShowModal(false);
      setFormData({ title: '', description: '', type: 'Troca' });
      fetchItems();
    } catch (e) {
      alert("Erro ao criar item. O banco de dados pode não estar configurado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este anúncio?")) {
      await supabase.from('barter_items').delete().eq('id', id);
      fetchItems();
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-20">
      <nav className="fixed top-0 w-full glass z-50 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-orange-500 hover:opacity-80 transition">Reduca</Link>
          
          <div className="flex items-center gap-6">
            <Link to="/" className="text-slate-300 hover:text-orange-400 transition-colors" title="Feed"><HomeIcon size={24} /></Link>
            <Link to="/blog" className="text-slate-300 hover:text-orange-400 transition-colors" title="Brisa Literária"><BookOpen size={24} /></Link>
            <Link to="/escambo" className="text-orange-500 transition-colors" title="Escambo Solidário"><RefreshCcw size={24} /></Link>
            <Link to="/forum" className="text-slate-300 hover:text-orange-400 transition-colors" title="Fórum"><MessageCircle size={24} /></Link>
            <Link to="/groups" className="text-slate-300 hover:text-orange-400 transition-colors" title="Grupos"><Users size={24} /></Link>
            
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-700">
              <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition group">
                <span className="font-medium group-hover:text-orange-400 flex items-center gap-1 text-[var(--text-primary)]">
                  {userData?.name}
                  {userData?.is_verified && <BadgeCheck size={14} className="fill-blue-500 text-white" />}
                </span>
                {userData?.avatar && <img src={userData.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />}
              </Link>
              <ThemeToggle />
              <div className="ml-2 pl-4 border-l border-slate-700/50"><AppDrawer /></div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6 glass-card p-4">
           <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition text-[var(--text-primary)] font-bold">
              <ArrowLeft size={20} className="text-orange-500" /> Voltar para o Feed
           </Link>
           <div className="md:hidden flex gap-2 items-center">
             <div className="pr-1"><AppDrawer /></div>
             <ThemeToggle />
           </div>
        </div>

        <div className="glass-card p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2 flex items-center gap-3">
                <RefreshCcw className="text-green-500" size={32} /> Escambo Solidário
              </h1>
              <p className="text-slate-500 max-w-2xl text-lg">
                Troque ou doe materiais escolares, livros e equipamentos. Fortaleça a comunidade escolar sem envolver dinheiro.
              </p>
            </div>
            <button onClick={() => setShowModal(true)} className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition shadow-lg shadow-green-500/20 whitespace-nowrap">
              <Plus size={20} /> Anunciar Item
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-500" size={40} /></div>
        ) : items.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <PackageOpen size={64} className="mx-auto text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold text-slate-300 mb-2">Nenhum item anunciado ainda</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6">Seja o primeiro a anunciar um livro, uniforme ou material para troca ou doação!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="glass-card overflow-hidden group border border-slate-700/50 hover:border-green-500/50 transition-all">
                <div className="relative h-32 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700/50">
                  <div className="w-full h-full flex items-center justify-center">
                    <Box size={40} className="text-slate-600/50" />
                  </div>
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md ${item.type === 'Doação' ? 'bg-indigo-500/80 text-white' : 'bg-green-500/80 text-white'}`}>
                      {item.type === 'Doação' ? <HeartHandshake size={12} className="inline mr-1" /> : <RefreshCcw size={12} className="inline mr-1" />}
                      {item.type}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 line-clamp-1">{item.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px]">{item.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <img src={item.author?.avatar} alt={item.author?.name} className="w-8 h-8 rounded-full border border-slate-600 object-cover" />
                      <div className="text-xs">
                        <p className="text-[var(--text-primary)] font-medium">{item.author?.name}</p>
                        <p className="text-slate-500">{(new Date(item.created_at)).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(user.id === item.user_id || userData?.is_admin || userData?.role === 'admin') && (
                        <button 
                          onClick={() => handleDelete(item.id)}
                          title="Excluir item" 
                          className="text-red-400 hover:text-white hover:bg-red-500 p-2.5 rounded-full transition flex items-center justify-center border border-transparent hover:border-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      <a href={`mailto:${item.author?.email || ''}?subject=Interesse no item: ${item.title}`} title="Entrar em contato" className="text-white bg-green-600 hover:bg-green-500 p-2.5 rounded-full shadow-lg hover:scale-110 transition flex items-center justify-center">
                        <MessageCircle size={18} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-lg p-6 relative">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <PackageOpen className="text-green-500" /> Anunciar Item
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Tipo de Anúncio</label>
                  <div className="flex gap-4">
                    <label className="flex-1">
                      <input type="radio" name="type" value="Troca" checked={formData.type === 'Troca'} onChange={e => setFormData({...formData, type: e.target.value})} className="hidden peer" />
                      <div className="glass-input text-center py-3 rounded-xl cursor-pointer peer-checked:bg-green-500 peer-checked:text-white peer-checked:border-green-500 transition font-bold shadow-sm">
                        Troca
                      </div>
                    </label>
                    <label className="flex-1">
                      <input type="radio" name="type" value="Doação" checked={formData.type === 'Doação'} onChange={e => setFormData({...formData, type: e.target.value})} className="hidden peer" />
                      <div className="glass-input text-center py-3 rounded-xl cursor-pointer peer-checked:bg-indigo-500 peer-checked:text-white peer-checked:border-indigo-500 transition font-bold shadow-sm">
                        Doação
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1 mt-4">Título do Item</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="glass-input w-full rounded-xl px-4 py-3 text-[var(--text-primary)] font-medium" placeholder="Ex: Livro de Matemática 8º Ano" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Descrição</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="glass-input w-full rounded-xl px-4 py-3 text-[var(--text-primary)] h-24 resize-none" placeholder="Descreva o estado do item, o que você aceita em troca, etc." />
                </div>



                <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition flex justify-center items-center gap-2 mt-6">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />} Publicar Anúncio
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
