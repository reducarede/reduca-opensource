import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { BookOpen, FileText, Send, X, Clock, User, Trash2, ArrowLeft, Share2, Heart, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import CoverPicker from '../components/CoverPicker';
import { generateContent } from '../ai';

export default function Blog({ user }) {
  const [articles, setArticles] = useState([]);
  const [isComposing, setIsComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [readingArticle, setReadingArticle] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [userData, setUserData] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchArticles();
  }, []);

  const fetchUserData = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      if (data.favorite_articles) setFavorites(data.favorite_articles);
      setUserData(data);
    }
  };

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*, author:author_id(name, avatar)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setArticles(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await supabase.from('articles').insert({
      author_id: user.id,
      title,
      content,
      cover_image: coverImage
    });

    setTitle('');
    setContent('');
    setCoverImage('');
    setIsComposing(false);
    fetchArticles(); // refresh
  };

  const handleDelete = async (id) => {
    if(window.confirm("Tem certeza que deseja excluir este artigo?")) {
      await supabase.from('articles').delete().eq('id', id);
      setReadingArticle(null);
      setAiSummary(null);
      setIsSummarizing(false);
      fetchArticles();
    }
  };

  const handleShareToFeed = async () => {
    const content = `Acabei de ler um artigo incrível no Blog da Reduca!\n\n📑 **${readingArticle.title}**\n\nCorre lá na aba de Artigos para conferir completo! 🚀`;
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content: content
    });
    
    if (!error) {
      alert("Artigo compartilhado no seu Feed com sucesso!");
    } else {
      alert("Erro ao compartilhar artigo.");
    }
  };

  const handleSummarize = async () => {
    if (!readingArticle || isSummarizing) return;
    setIsSummarizing(true);
    try {
      const prompt = `Você é um assistente educacional da plataforma Reduca. Resuma o seguinte artigo de forma clara e em tópicos. Mantenha o tom profissional, direto e em português do Brasil. O resumo deve extrair as ideias principais de forma rápida e engajadora:\n\nTítulo: ${readingArticle.title}\n\nTexto:\n${readingArticle.content}`;
      const summary = await generateContent(prompt);
      setAiSummary(summary);
    } catch (err) {
      alert("Erro ao gerar resumo da IA.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const toggleFavorite = async (articleId) => {
    const isFav = favorites.includes(articleId);
    const newFavs = isFav ? favorites.filter(id => id !== articleId) : [...favorites, articleId];
    
    setFavorites(newFavs);
    const { error } = await supabase.from('profiles').update({ favorite_articles: newFavs }).eq('id', user.id);
    if(error) {
      alert("Erro ao favoritar! Você rodou o comando SQL para criar a coluna favorite_articles?");
      setFavorites(favorites); // revert on error
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 pt-8">
      
      <main className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Voltar para o Feed</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="text-orange-500" size={32} />
            <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
              Blog / Artigos
            </span>
          </h1>
          
          {!isComposing && !readingArticle && (
            <button 
              onClick={() => setIsComposing(true)}
              className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-full font-medium transition flex items-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <FileText size={18} />
              <span className="hidden sm:inline">Escrever Artigo</span>
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isComposing ? (
            <motion.div 
              key="compose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-6"
            >
              <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
                <h2 className="text-xl font-bold text-slate-100">Novo Artigo</h2>
                <button onClick={() => setIsComposing(false)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Título do seu artigo..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-lg font-medium text-slate-100 focus:outline-none focus:border-orange-500 transition"
                  required
                />
                
                <div className="pb-2">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Capa do Artigo (Opcional)</label>
                  <CoverPicker 
                    currentCover={coverImage}
                    onSelectCover={(url) => setCoverImage(url)}
                  />
                </div>
                
                <textarea
                  placeholder="Escreva seu texto longo aqui..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-base text-slate-200 focus:outline-none focus:border-orange-500 transition min-h-[300px] resize-y"
                  required
                />

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={!title.trim() || !content.trim()}
                    className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition flex items-center gap-2 shadow-lg shadow-orange-500/20"
                  >
                    <span>Publicar Artigo</span>
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          ) : readingArticle ? (
            <motion.div 
              key="read"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-8 md:p-12 relative"
            >
              <button 
                onClick={() => { setReadingArticle(null); setAiSummary(null); setIsSummarizing(false); }} 
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition"
              >
                <X size={20} />
              </button>

              {readingArticle.cover_image && (
                <div className="w-full h-64 md:h-80 mb-8 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 relative">
                  <img src={readingArticle.cover_image} alt={readingArticle.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                </div>
              )}

              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-50 mb-6 leading-tight pr-12">
                {readingArticle.title}
              </h1>
              
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-700/50">
                <img 
                  src={readingArticle.author?.avatar || 'https://placehold.co/100'} 
                  alt={readingArticle.author?.name} 
                  className="w-12 h-12 rounded-full border border-slate-600"
                />
                <div>
                  <h3 className="font-bold text-slate-200">{readingArticle.author?.name || 'Desconhecido'}</h3>
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <Clock size={14} /> 
                    {new Date(readingArticle.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                
                
                <div className="ml-auto flex items-center gap-2">
                  {(user.id === readingArticle.author_id || userData?.is_admin || userData?.role === 'admin') && (
                    <button 
                      onClick={() => handleDelete(readingArticle.id)}
                      className="text-red-500 hover:text-red-400 flex items-center gap-1 text-sm bg-red-500/10 px-3 py-1.5 rounded-lg transition"
                    >
                      <Trash2 size={16} /> Excluir
                    </button>
                  )}
                </div>
              </div>

              {/* AI Summary Section */}
              <div className="mb-10">
                {!aiSummary && !isSummarizing && (
                  <button 
                    onClick={handleSummarize}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white transition shadow-lg shadow-purple-500/20 w-max"
                  >
                    <Sparkles size={18} />
                    Resumir com IA
                  </button>
                )}
                
                {isSummarizing && (
                  <div className="glass-card p-6 flex items-center gap-4 border-purple-500/30 bg-purple-500/5">
                    <Loader2 className="animate-spin text-purple-400" size={24} />
                    <span className="text-purple-300 font-medium">A Inteligência Artificial está lendo e resumindo o artigo para você...</span>
                  </div>
                )}

                {aiSummary && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 border-purple-500/30 bg-purple-500/5 relative overflow-hidden shadow-2xl shadow-purple-900/20"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sparkles size={64} className="text-purple-500" />
                    </div>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-purple-400 mb-4">
                      <Sparkles size={20} /> Resumo Inteligente
                    </h3>
                    <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-sm sm:text-base">
                      <div className="whitespace-pre-wrap font-medium">{aiSummary}</div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="prose prose-invert prose-orange max-w-none text-lg text-slate-300 leading-relaxed whitespace-pre-wrap mb-12">
                {readingArticle.content}
              </div>

              {/* Rodapé de Ações do Artigo */}
              <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleFavorite(readingArticle.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition shadow-lg ${
                      favorites.includes(readingArticle.id) 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30' 
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Heart size={20} className={favorites.includes(readingArticle.id) ? "fill-rose-400" : ""} />
                    {favorites.includes(readingArticle.id) ? 'Favoritado' : 'Favoritar'}
                  </button>
                  
                  <button 
                    onClick={handleShareToFeed}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-orange-600 hover:bg-orange-500 text-white transition shadow-lg shadow-orange-500/20"
                  >
                    <Share2 size={20} />
                    Compartilhar no Feed
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {articles.length > 0 ? articles.map(article => (
                <div 
                  key={article.id} 
                  onClick={() => setReadingArticle(article)}
                  className="glass-card cursor-pointer hover:border-orange-500/50 transition-all group flex flex-col h-full overflow-hidden"
                >
                  {article.cover_image && (
                    <div className="h-32 w-full bg-slate-800 overflow-hidden">
                      <img src={article.cover_image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-orange-400 transition-colors line-clamp-2 flex items-start justify-between gap-2">
                    {article.title}
                    {favorites.includes(article.id) && (
                      <Heart size={16} className="text-rose-400 fill-rose-400 shrink-0 mt-1" />
                    )}
                  </h2>
                  <p className="text-slate-400 mb-6 line-clamp-3 flex-1">
                    {article.content}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <img 
                        src={article.author?.avatar || 'https://placehold.co/100'} 
                        className="w-6 h-6 rounded-full border border-slate-700"
                        alt=""
                      />
                      <span className="text-xs text-slate-300">{article.author?.name?.split(' ')[0] || 'User'}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(article.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 text-slate-500 mb-4">
                    <BookOpen size={32} />
                  </div>
                  <h3 className="text-xl font-medium text-slate-300 mb-2">Nenhum artigo publicado</h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Seja o primeiro a compartilhar um texto longo, reflexão ou material didático com a comunidade!
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
