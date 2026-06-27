import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { availableWidgets } from '../components/widgets/registry';
import { ArrowLeft, Power, Plus, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Marketplace({ user }) {
  const navigate = useNavigate();
  const [activeWidgets, setActiveWidgets] = useState(['quem-seguir']);
  const [customWidgets, setCustomWidgets] = useState([]);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.from('profiles').select('role, is_admin').eq('id', user.id).single().then(({ data }) => {
      if (data && (data.is_admin || data.role === 'admin' || data.role === 'professor')) {
        setIsAdmin(true);
        // Only load data if admin
        supabase.from('user_settings').select('active_widgets').eq('user_id', user.id).single().then(({ data: settings }) => {
          if (settings && Array.isArray(settings.active_widgets)) setActiveWidgets(settings.active_widgets);
        });

        supabase.from('custom_widgets').select('*').eq('user_id', user.id).then(({ data: customData }) => {
          if (customData) setCustomWidgets(customData);
        });
      } else {
        navigate('/'); // Redirect non-admins back to feed
      }
    });
  }, [user.id, navigate]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customImage, setCustomImage] = useState('');

  if (!isAdmin) {
    return <div className="min-h-screen pt-20 text-center text-slate-500">Verificando permissões...</div>;
  }

  const openEditModal = (widget) => {
    setEditingWidget(widget);
    setCustomTitle(widget.title);
    setCustomDesc(widget.description);
    setCustomUrl(widget.url);
    setCustomImage(widget.image);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingWidget(null);
    setCustomTitle('');
    setCustomDesc('');
    setCustomUrl('');
    setCustomImage('');
    setIsModalOpen(true);
  };

  const toggleWidget = async (widgetId) => {
    let newActive = [...activeWidgets];
    if (newActive.includes(widgetId)) {
      newActive = newActive.filter(id => id !== widgetId);
    } else {
      newActive.push(widgetId);
    }
    setActiveWidgets(newActive);
    await supabase.from('user_settings').upsert({ user_id: user.id, active_widgets: newActive });
  };

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    if (editingWidget) {
      const updatedWidget = {
        title: customTitle,
        description: customDesc,
        url: customUrl,
        image: customImage || `https://api.dicebear.com/7.x/shapes/svg?seed=${Date.now()}`
      };
      await supabase.from('custom_widgets').update(updatedWidget).eq('id', editingWidget.id);
      setCustomWidgets(customWidgets.map(w => w.id === editingWidget.id ? { ...w, ...updatedWidget } : w));
    } else {
      const newId = `custom-${Date.now()}`;
      const newWidget = {
        id: newId,
        user_id: user.id,
        title: customTitle,
        description: customDesc,
        url: customUrl,
        image: customImage || `https://api.dicebear.com/7.x/shapes/svg?seed=${Date.now()}`
      };

      await supabase.from('custom_widgets').insert(newWidget);
      setCustomWidgets([...customWidgets, newWidget]);
      await toggleWidget(newId);
    }
    
    setIsModalOpen(false);
    setCustomTitle('');
    setCustomDesc('');
    setCustomUrl('');
    setCustomImage('');
    setEditingWidget(null);
  };

  const deleteCustomWidget = async (widgetId) => {
    if (activeWidgets.includes(widgetId)) {
      await toggleWidget(widgetId);
    }
    await supabase.from('custom_widgets').delete().eq('id', widgetId);
    setCustomWidgets(customWidgets.filter(cw => cw.id !== widgetId));
  };

  return (
    <div className="min-h-screen pb-20 pt-10 px-4 md:px-12 max-w-6xl mx-auto relative">
      <div className="flex justify-between items-start mb-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition glass px-4 py-2 rounded-full">
          <ArrowLeft size={18} /> Voltar para o Feed
        </button>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold transition px-5 py-2 rounded-full shadow-lg shadow-orange-500/20">
          <Plus size={18} /> Novo Link Personalizado
        </button>
      </div>

      <div className="mb-10">
        <h1 className="text-4xl font-bold text-orange-500 mb-3 drop-shadow-md">Marketplace de Widgets</h1>
        <p className="text-slate-400 text-lg">Personalize a sua barra lateral ativando extensões ou crie os seus próprios links de ferramentas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* System Widgets */}
        {availableWidgets.map(widget => {
          const isActive = activeWidgets.includes(widget.id);
          return (
            <motion.div layout key={widget.id} className={`glass-card p-6 transition-all border relative overflow-hidden ${isActive ? 'border-orange-500/50 shadow-orange-500/10 shadow-2xl' : 'border-slate-700/50'}`}>
              {isActive && <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full"></div>}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="font-bold text-xl text-slate-200">{widget.name}</h3>
                <button onClick={() => toggleWidget(widget.id)} className={`p-3 rounded-full transition-colors shadow-lg ${isActive ? 'bg-orange-500 text-white' : 'bg-slate-800 border border-slate-700 text-slate-500 hover:text-white'}`}>
                  <Power size={20} />
                </button>
              </div>
              <p className="text-sm text-slate-400 mb-6 relative z-10">{widget.description}</p>
              <div className="flex items-center justify-between mt-auto relative z-10">
                <span className={`text-xs font-bold tracking-wider px-3 py-1 rounded-full ${isActive ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                  {isActive ? 'INSTALADO' : 'DESATIVADO'}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Custom Widgets */}
        {customWidgets?.map(widget => {
          const isActive = activeWidgets.includes(widget.id);
          return (
            <motion.div layout key={widget.id} className={`glass-card p-6 transition-all border relative overflow-hidden ${isActive ? 'border-cyan-500/50 shadow-cyan-500/10 shadow-2xl' : 'border-slate-700/50'}`}>
              {isActive && <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <img src={widget.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-700" />
                  <h3 className="font-bold text-lg text-slate-200">{widget.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditModal(widget)} className="p-2 text-slate-500 hover:text-orange-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button onClick={() => deleteCustomWidget(widget.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                  <button onClick={() => toggleWidget(widget.id)} className={`p-2 rounded-full transition-colors shadow-lg ${isActive ? 'bg-cyan-500 text-white' : 'bg-slate-800 border border-slate-700 text-slate-500 hover:text-white'}`}>
                    <Power size={18} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-6 relative z-10">{widget.description}</p>
              <div className="flex items-center justify-between mt-auto relative z-10">
                <span className={`text-xs font-bold tracking-wider px-3 py-1 rounded-full ${isActive ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                  {isActive ? 'INSTALADO' : 'DESATIVADO'}
                </span>
                <span className="text-xs text-slate-500">Personalizado</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal Criar Widget */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-md p-6 relative z-10">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
              <h2 className="text-2xl font-bold text-orange-500 mb-6">{editingWidget ? 'Editar Link Externo' : 'Novo Link Externo'}</h2>
              <form onSubmit={handleCreateCustom} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase font-bold tracking-wide">Título do App</label>
                  <input type="text" required value={customTitle} onChange={e => setCustomTitle(e.target.value)} placeholder="Ex: Diário de Classe" className="glass-input w-full" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase font-bold tracking-wide">Descrição Breve</label>
                  <input type="text" required value={customDesc} onChange={e => setCustomDesc(e.target.value)} placeholder="Acesse o sistema de notas..." className="glass-input w-full" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase font-bold tracking-wide">URL do App (Link)</label>
                  <input type="url" required value={customUrl} onChange={e => setCustomUrl(e.target.value)} placeholder="https://..." className="glass-input w-full" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase font-bold tracking-wide">URL do Ícone/Imagem (Opcional)</label>
                  <input type="url" value={customImage} onChange={e => setCustomImage(e.target.value)} placeholder="https://.../icone.png" className="glass-input w-full" />
                </div>
                <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/30 mt-4">
                  {editingWidget ? 'Salvar Alterações' : 'Adicionar ao Marketplace'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
