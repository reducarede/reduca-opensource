import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Newspaper, CheckCircle, Eye, FileText, X, Plus, Users, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WidgetNoticias({ currentUser, isAdmin }) {
  const [newsList, setNewsList] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [activeNews, setActiveNews] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewingReceipts, setViewingReceipts] = useState(false);
  const [readersList, setReadersList] = useState([]);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch news
      const { data: nData, error: nErr } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(5);
      if (nData) setNewsList(nData);
      
      if (nErr && nErr.code === '42P01') {
        console.warn("Tabela 'news' não existe.");
        setLoading(false);
        return;
      }

      // Fetch my receipts or all if admin
      if (isAdmin) {
        const { data: rData } = await supabase.from('news_receipts').select('news_id');
        if (rData) setReceipts(rData);
      } else {
        const { data: rData } = await supabase.from('news_receipts').select('news_id').eq('user_id', currentUser.id);
        if (rData) setReceipts(rData);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreateNews = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    
    const { data, error } = await supabase.from('news').insert({
      title,
      content,
      created_by: currentUser.id
    }).select().single();

    if (data) {
      setNewsList([data, ...newsList]);
      setTitle('');
      setContent('');
      setIsCreating(false);
      
      // Dispara a notificação push
      supabase.functions.invoke('push-notify', {
        body: { title: "Aviso: " + title, body: "Nova notícia publicada. Verifique o mural." }
      }).catch(console.error);
    }
    if (error) alert("Erro ao publicar: " + error.message);
  };

  const handleAcknowledge = async (newsId) => {
    const { data, error } = await supabase.from('news_receipts').insert({
      news_id: newsId,
      user_id: currentUser.id
    }).select().single();

    if (data) {
      setReceipts([...receipts, data]);
      setActiveNews(null); // Fecha o modal
    }
  };

  const loadReaders = async (newsId) => {
    const { data } = await supabase.from('news_receipts').select('*, user:profiles(name, avatar)').eq('news_id', newsId);
    if (data) {
      setReadersList(data);
      setViewingReceipts(true);
    }
  };

  if (loading) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-4 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Newspaper size={18} className="text-emerald-400" /> Notícias
          </h3>
          {isAdmin && (
            <button onClick={() => setIsCreating(true)} className="p-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors" title="Publicar Notícia">
              <Plus size={16} />
            </button>
          )}
        </div>

        <div className="space-y-3">
          {newsList.map(news => {
            const hasRead = isAdmin ? false : receipts.some(r => r.news_id === news.id);
            const readCount = isAdmin ? receipts.filter(r => r.news_id === news.id).length : 0;

            return (
              <div 
                key={news.id} 
                className={`p-3 rounded-xl border cursor-pointer transition-all ${hasRead ? 'bg-slate-900/30 border-slate-700/50 opacity-70' : 'bg-slate-800/60 border-emerald-500/30 hover:border-emerald-500'}`}
                onClick={() => setActiveNews(news)}
              >
                <h4 className="text-sm font-bold text-slate-200 leading-tight mb-2">{news.title}</h4>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">{new Date(news.created_at).toLocaleDateString()}</span>
                  
                  {isAdmin ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full hover:bg-emerald-500/40 transition" onClick={(e) => { e.stopPropagation(); loadReaders(news.id); }}>
                        <Eye size={12} /> {readCount} leram
                      </span>
                      <button onClick={async (e) => {
                        e.stopPropagation();
                        if(window.confirm('Excluir esta notícia?')) {
                          await supabase.from('news').delete().eq('id', news.id);
                          setNewsList(newsList.filter(n => n.id !== news.id));
                        }
                      }} className="text-red-400 hover:text-red-300 transition-colors p-1 bg-red-500/10 rounded-full" title="Excluir">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ) : (
                    hasRead ? (
                      <span className="text-[10px] flex items-center gap-1 text-emerald-500"><CheckCircle size={12} /> Ciente</span>
                    ) : (
                      <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">NOVA</span>
                    )
                  )}
                </div>
              </div>
            );
          })}
          {newsList.length === 0 && <p className="text-xs text-slate-500 text-center py-4">Nenhuma notícia publicada.</p>}
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreating(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-lg p-6 relative z-10 border border-emerald-500/30">
              <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
              <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2"><Newspaper className="text-emerald-400"/> Criar Notícia Oficial</h2>
              <form onSubmit={handleCreateNews} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">Título</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="glass-input w-full border-slate-700" placeholder="Ex: Feriado Escolar - Comunicado" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">Conteúdo Completo</label>
                  <textarea rows="6" required value={content} onChange={e => setContent(e.target.value)} className="glass-input w-full border-slate-700" placeholder="Detalhes do informe..."></textarea>
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors mt-2 shadow-lg shadow-emerald-500/20">Publicar e Exigir Leitura</button>
              </form>
            </motion.div>
          </div>
        )}

        {activeNews && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveNews(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="glass-card w-full max-w-2xl p-6 relative z-10 max-h-[90vh] flex flex-col border border-emerald-500/30">
              <button onClick={() => setActiveNews(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1 rounded-full"><X size={20} /></button>
              
              <div className="mb-6 overflow-y-auto custom-scrollbar pr-2 flex-1 pt-4">
                <h2 className="text-2xl font-black text-slate-100 mb-2 leading-tight">{activeNews.title}</h2>
                <p className="text-xs text-slate-500 mb-6 flex items-center gap-2">
                  <FileText size={14}/> Publicado em {new Date(activeNews.created_at).toLocaleDateString('pt-BR')}
                </p>
                <div className="text-base text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                  {activeNews.content}
                </div>
              </div>
              
              {!isAdmin && !receipts.some(r => r.news_id === activeNews.id) && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <button 
                    onClick={() => handleAcknowledge(activeNews.id)} 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-xl shadow-emerald-500/20 text-lg uppercase tracking-wide"
                  >
                    <CheckCircle size={24}/> Li e estou ciente
                  </button>
                  <p className="text-center text-[10px] text-slate-500 mt-2">Isso enviará um recibo de leitura para a escola.</p>
                </div>
              )}
              
              {!isAdmin && receipts.some(r => r.news_id === activeNews.id) && (
                <div className="mt-4 pt-4 border-t border-slate-700 text-center">
                  <p className="text-emerald-500 font-bold flex justify-center items-center gap-2"><CheckCircle size={20}/> Você já confirmou a leitura.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {viewingReceipts && isAdmin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingReceipts(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-md p-6 relative z-10 max-h-[80vh] flex flex-col border border-emerald-500/30">
              <button onClick={() => setViewingReceipts(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
              <h2 className="text-xl font-bold text-slate-100 mb-2 flex items-center gap-2"><Users className="text-emerald-400"/> Recibos de Leitura</h2>
              <p className="text-sm text-slate-400 mb-4">{readersList.length} pessoas leram esta notícia.</p>
              
              <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
                {readersList.map(receipt => (
                  <div key={receipt.id} className="bg-slate-800/50 p-2 rounded-lg flex items-center justify-between border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <img src={receipt.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${receipt.user?.id}`} alt={receipt.user?.name} className="w-8 h-8 rounded-full border border-emerald-500/50" />
                      <span className="text-sm font-semibold text-slate-200">{receipt.user?.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded">
                      {new Date(receipt.read_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
                {readersList.length === 0 && <p className="text-center text-slate-500 py-6">Ninguém leu ainda.</p>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
