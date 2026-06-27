import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Apps() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    const { data, error } = await supabase.from('ecosystem_apps').select('*').order('created_at', { ascending: true });
    if (data) setApps(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] pb-20">
      <nav className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition">
            <ArrowLeft size={24} className="text-orange-500" />
            <span className="font-bold">Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            <LayoutGrid size={24} className="text-orange-500" />
            <h1 className="text-xl font-bold text-slate-200">Arsenal de Apps</h1>
          </div>
          <div className="w-20"></div> {/* Spacer for center alignment */}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-orange-500 mb-4">Todos os Aplicativos</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Explore todas as ferramentas educacionais e aplicativos parceiros da rede Reduca.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-20">Carregando aplicativos...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {apps.map(app => (
              <a 
                key={app.id} 
                href={app.link_web || app.link_apk || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="glass-card flex flex-col items-center p-6 rounded-2xl hover:bg-slate-800/80 transition group text-center border border-slate-700/50 hover:border-orange-500/50"
              >
                {app.icon_url?.startsWith('http') ? (
                  <img 
                    src={app.icon_url} 
                    alt={app.name} 
                    className="w-20 h-20 rounded-2xl mb-4 object-cover shadow-lg group-hover:scale-110 transition-transform duration-300" 
                    onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=App' }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl mb-4 bg-slate-800 flex items-center justify-center text-5xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {app.icon_url}
                  </div>
                )}
                <h3 className="font-bold text-slate-200 group-hover:text-orange-400 transition-colors mb-2">
                  {app.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3">
                  {app.description}
                </p>
              </a>
            ))}
            
            {apps.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-12">
                Nenhum aplicativo cadastrado.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
