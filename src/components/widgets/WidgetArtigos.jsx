import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WidgetArtigos({ isAdmin }) {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error: fetchErr } = await supabase
        .from('articles')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (fetchErr) throw fetchErr;
      if (data) {
        setArticles(data);
        setError(false);
      }
    } catch (err) {
      setError(true);
    }
  };

  if (error) {
    if (!isAdmin) return null;
    return (
      <div className="glass-card p-5 border border-red-500/30">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-orange-400" /> Últimos Artigos
        </h3>
        <div className="bg-red-500/10 p-3 rounded-xl">
          <p className="text-xs text-red-400 font-bold mb-2">Configure o Banco (Admin)</p>
          <code className="block text-[9px] bg-slate-900 p-2 rounded text-slate-400 font-mono whitespace-pre-wrap">
            create table articles (id uuid default gen_random_uuid() primary key, title text, content text, created_at timestamp default now());
            alter table articles enable row level security;
            create policy "all" on articles for select using (true);
          </code>
        </div>
      </div>
    );
  }

  if (articles.length === 0) return null; // Não mostra se não houver artigos

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <BookOpen size={16} className="text-orange-400" />
          Últimos Artigos
        </h3>
        <Link to="/blog" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
          Ver todos
        </Link>
      </div>

      <div className="space-y-3">
        {articles.map(article => (
          <Link 
            key={article.id} 
            to="/blog"
            className="block group p-3 rounded-lg bg-slate-800/30 hover:bg-orange-500/10 border border-slate-700/50 hover:border-orange-500/30 transition-all"
          >
            <h4 className="text-sm font-medium text-slate-200 group-hover:text-orange-300 transition-colors line-clamp-2 leading-tight mb-1">
              {article.title}
            </h4>
            <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
              Leia mais <ChevronRight size={10} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
