import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { availableWidgets } from './widgets/registry';
import WidgetCustom from './widgets/WidgetCustom';
import WidgetCalendario from './widgets/WidgetCalendario';
import WidgetAvisos from './widgets/WidgetAvisos';
import WidgetTarefas from './widgets/WidgetTarefas';
import WidgetNoticias from './widgets/WidgetNoticias';
import WidgetLibriVox from './widgets/WidgetLibriVox';
import { AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, Download } from 'lucide-react';

export default function Sidebar({ currentUser, className = 'hidden md:block' }) {
  const navigate = useNavigate();
  const [activeWidgets, setActiveWidgets] = useState(['quem-seguir']);
  const [customWidgets, setCustomWidgets] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState(currentUser);

  useEffect(() => {
    if (!currentUser) return;
    
    // Fetch full profile (including badges, role, is_admin)
    supabase.from('profiles').select('*').eq('id', currentUser.id).single().then(({ data }) => {
      if (data) {
        setUserProfile({ ...currentUser, ...data });
        if (data.is_admin) setIsAdmin(true);
      }
    });

    // Tenta buscar o admin
    supabase.from('profiles').select('id').eq('is_admin', true).limit(1).single().then(({ data: adminData, error: adminErr }) => {
      
      if (adminErr) {
        console.error("Erro ao buscar admin (possível bloqueio RLS):", adminErr);
        // Fallback: se o RLS bloqueou a busca por admin, vamos tentar buscar na marra a primeira configuração salva no banco de dados
        // (Assumindo que apenas o admin teve acesso ao marketplace recentemente)
        supabase.from('custom_widgets').select('user_id').limit(1).single().then(({ data: customData }) => {
           const fallbackUserId = customData ? customData.user_id : currentUser.id;
           loadWidgetsForUser(fallbackUserId);
        });
      } else {
        const configUserId = adminData ? adminData.id : currentUser.id;
        loadWidgetsForUser(configUserId);
      }
    });

    function loadWidgetsForUser(userId) {
      supabase.from('user_settings').select('active_widgets').eq('user_id', userId).single().then(({ data }) => {
        if (data && Array.isArray(data.active_widgets)) setActiveWidgets(data.active_widgets);
      });

      supabase.from('custom_widgets').select('*').eq('user_id', userId).then(({ data }) => {
        if (data) setCustomWidgets(data);
      });
    }

  }, [currentUser]);

  return (
    <aside className={`space-y-4 pb-24 md:pb-6 ${className}`}>
      <WidgetCalendario currentUser={userProfile} isAdmin={isAdmin} />
      <WidgetNoticias currentUser={userProfile} isAdmin={isAdmin} />
      <WidgetLibriVox currentUser={userProfile} isAdmin={isAdmin} />
      <WidgetAvisos />
      <WidgetTarefas currentUser={userProfile} isAdmin={isAdmin} />
      <AnimatePresence>
        {activeWidgets.filter(id => !['quem-seguir', 'aniversarios', 'calendario', 'noticias', 'avisos', 'tarefas', 'artigos'].includes(id)).map(widgetId => {
          const WidgetDefinition = availableWidgets.find(w => w.id === widgetId);
          if (WidgetDefinition) {
            const WidgetComponent = WidgetDefinition.component;
            return <WidgetComponent key={widgetId} currentUser={userProfile} isAdmin={isAdmin} />;
          }
          
          const customWidget = customWidgets?.find(cw => cw.id === widgetId);
          if (customWidget) {
            return <WidgetCustom key={widgetId} widgetData={customWidget} />;
          }
          
          return null;
        })}
      </AnimatePresence>

      {/* App Download Banner */}
      <div className="glass-card p-5 border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/5 relative overflow-hidden group mb-4">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl group-hover:bg-orange-500/30 transition-all duration-500"></div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg shadow-orange-500/20 text-white shrink-0">
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-50 mb-1">Baixe o Aplicativo</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Tenha o Reduca no seu celular Android para notificações e acesso rápido.
            </p>
            <a 
              href="https://reduca.zonaeducacional.org/reduca-latest.apk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-50 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors border border-slate-700/50"
            >
              <Download size={14} className="text-orange-500" />
              Baixar APK
            </a>
          </div>
        </div>
      </div>

      <div className="glass-card p-5 border border-slate-700/50">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Marketplace</h3>
        <p className="text-xs text-slate-400 mb-4">Adicione ou remova widgets do seu painel lateral.</p>
        {isAdmin && (
          <>
            <button onClick={() => navigate('/marketplace')} className="w-full bg-slate-800/80 hover:bg-slate-700 text-center text-slate-300 hover:text-slate-50 px-4 py-2 rounded-xl transition block border border-slate-600/50 shadow-lg mb-3">
              Gerenciar Widgets
            </button>
            <button onClick={() => navigate('/admin')} className="w-full bg-red-900/20 hover:bg-red-900/40 text-center text-red-400 hover:text-red-300 px-4 py-2 rounded-xl transition block border border-red-900/50 shadow-lg">
              Área do Admin
            </button>
          </>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-slate-500 space-y-2 pb-6">
        <div className="flex justify-center gap-4">
          <Link to="/terms" className="hover:text-slate-800 transition-colors">Termos de Uso</Link>
          <Link to="/privacy" className="hover:text-slate-800 transition-colors">Política de Privacidade</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Reduca</p>
      </div>
    </aside>
  );
}
