import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Plus, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import AppDrawer from '../components/AppDrawer';
import Sidebar from '../components/Sidebar';
import CoverPicker from '../components/CoverPicker';

export default function Groups({ user }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', cover_image: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('groups').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setGroups(data);
    }
    setLoading(false);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.name.trim()) return;

    const { data, error } = await supabase.from('groups').insert([{
      name: newGroup.name,
      description: newGroup.description,
      cover_image: newGroup.cover_image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000',
      created_by: user.id
    }]).select();

    if (!error && data && data.length > 0) {
      // Create member logic (the creator is a member)
      await supabase.from('group_members').insert([{
        group_id: data[0].id,
        user_id: user.id,
        role: 'admin'
      }]);

      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', cover_image: '' });
      fetchGroups();
    } else {
      alert("Erro ao criar o grupo. Verifique se a tabela groups existe no Supabase.");
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-20">
      <nav className="fixed top-0 w-full glass z-50 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-orange-500 hover:opacity-80 transition">Reduca</Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-slate-300 hover:text-orange-400 transition-colors"><ArrowLeft size={24} /></Link>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-700">
              <ThemeToggle />
              <div className="ml-2 pl-4 border-l border-slate-700/50 flex items-center">
                <AppDrawer />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[minmax(0,600px)_320px] lg:grid-cols-[minmax(0,700px)_320px] justify-center gap-6">
        
        <div className="space-y-6">
          <div className="md:hidden flex justify-between items-center mb-6 glass-card p-4">
             <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition text-slate-300">
                <ArrowLeft size={24} /> Voltar
             </Link>
             <div className="flex gap-2 items-center">
               <div className="pr-1"><AppDrawer /></div>
               <ThemeToggle />
             </div>
          </div>

          <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-xl backdrop-blur-md">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                <Users className="text-orange-500" /> Grupos de Interesse
              </h1>
              <p className="text-slate-400 text-sm mt-1">Participe de comunidades sobre temas específicos.</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-orange-500/30 transition flex items-center gap-2"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Criar Grupo</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center text-orange-500 font-bold py-10">Carregando grupos...</div>
          ) : groups.length === 0 ? (
            <div className="text-center text-slate-500 py-10 glass-card">
              Nenhum grupo encontrado. Seja o primeiro a criar!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groups.map(group => (
                <div 
                  key={group.id} 
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] hover:border-orange-500/50 transition-all cursor-pointer group"
                >
                  <div className="h-32 bg-slate-800 relative overflow-hidden">
                    {group.cover_image && (
                      <img src={group.cover_image} alt={group.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-slate-200 group-hover:text-orange-400 transition-colors">{group.name}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mt-1">{group.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Sidebar currentUser={user} className="hidden lg:block lg:h-fit lg:sticky lg:bottom-4" />
      </main>

      {/* Modal Criar Grupo */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card max-w-md w-full p-6 shadow-2xl border border-slate-700/50">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="text-orange-500" /> Criar Novo Grupo
            </h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Nome do Grupo</label>
                <input 
                  type="text" 
                  value={newGroup.name}
                  onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                  className="glass-input w-full rounded-xl px-4 py-2.5"
                  placeholder="Ex: Professores de História"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Descrição</label>
                <textarea 
                  value={newGroup.description}
                  onChange={e => setNewGroup({...newGroup, description: e.target.value})}
                  className="glass-input w-full rounded-xl px-4 py-2.5"
                  placeholder="Sobre o que é este grupo?"
                  rows={3}
                />
              </div>
              <div className="pb-2">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Capa do Grupo</label>
                <CoverPicker 
                  currentCover={newGroup.cover_image}
                  onSelectCover={(url) => setNewGroup({...newGroup, cover_image: url})}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 rounded-xl transition font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition"
                >
                  Criar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
