import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import WidgetMembros from '../components/widgets/WidgetMembros';
import WidgetQuemSeguir from '../components/widgets/WidgetQuemSeguir';
import WidgetAniversarios from '../components/widgets/WidgetAniversarios';
import WidgetGrupos from '../components/widgets/WidgetGrupos';
import WidgetForum from '../components/widgets/WidgetForum';
import WidgetArtigos from '../components/widgets/WidgetArtigos';
import WidgetEscambo from '../components/widgets/WidgetEscambo';
import WidgetVideoDestaque from '../components/widgets/WidgetVideoDestaque';
import WidgetAudiobook from '../components/widgets/WidgetAudiobook';
import { LogOut, Home as HomeIcon, Bell, MessageCircle, BookOpen, BadgeCheck, Users, CalendarDays, RefreshCcw, Mail, Gamepad2, Swords, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppDrawer from '../components/AppDrawer';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Download } from 'lucide-react';

export default function Home({ user }) {
  const [userData, setUserData] = useState(null);
  const [showMsg, setShowMsg] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [mobileTab, setMobileTab] = useState('feed');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadProfile = async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setUserData(data);
      } else {
        const fallbackProfile = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
        };
        await supabase.from('profiles').insert(fallbackProfile);
        setUserData(fallbackProfile);
      }
    };
    
    loadProfile();
    
    const fetchPosts = () => {
      supabase.from('posts').select('*, author:profiles(id, name, avatar, is_verified)')
        .is('group_id', null)
        .order('created_at', { ascending: false })
        .limit(50)
        .then(({ data }) => setPosts(data || []));
    };
    
    fetchPosts();

    const channel = supabase.channel('realtime-posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, async payload => {
        if (payload.eventType === 'INSERT') {
          const { data: newPost } = await supabase.from('posts')
            .select('*, author:profiles(id, name, avatar, is_verified)')
            .eq('id', payload.new.id)
            .single();
          if (newPost && !newPost.group_id) {
            setPosts(current => [newPost, ...current]);
          }
        } else if (payload.eventType === 'UPDATE') {
          setPosts(current => current.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
        } else if (payload.eventType === 'DELETE') {
          setPosts(current => current.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const handleManualUpdateCheck = async () => {
    if (!Capacitor.isNativePlatform()) {
      alert("Atualização automática apenas no aplicativo móvel.");
      return;
    }
    try {
      const info = await App.getInfo();
      const currentBuild = parseInt(info.build || '1', 10);
      const response = await fetch('https://reduca.zonaeducacional.org/version.json?t=' + new Date().getTime());
      const data = await response.json();
      const latestBuild = parseInt(data.build || '1', 10);

      if (latestBuild > currentBuild) {
        if(window.confirm(`Nova versão ${data.version} disponível!\n${data.releaseNotes}\nDeseja baixar agora?`)) {
          window.open(data.url, '_system');
        }
      } else {
        alert("Aplicativo atualizado! Você já está na versão mais recente.");
      }
    } catch (e) {
      alert("Erro ao verificar atualização. Verifique sua internet.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!userData) return null;

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-20">
      {/* Navbar Desktop */}
      <nav className="fixed top-0 w-full glass z-50 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-orange-500 hover:opacity-80 transition">Reduca</Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-orange-500 hover:text-orange-400 transition-colors" title="Feed"><HomeIcon size={24} /></Link>
            <Link to="/blog" className="text-slate-300 hover:text-orange-400 transition-colors" title="Blog"><BookOpen size={24} /></Link>
            <Link to="/forum" className="text-slate-300 hover:text-orange-400 transition-colors" title="Fórum">
              <MessageCircle size={24} />
            </Link>
            <Link to="/escambo" className="text-slate-300 hover:text-orange-400 transition-colors" title="Escambo Solidário">
              <RefreshCcw size={24} />
            </Link>
            <Link to="/groups" className={`transition-colors ${window.location.pathname.startsWith('/groups') ? 'text-orange-500' : 'text-slate-300 hover:text-orange-400'}`} title="Grupos"><Users size={24} /></Link>
            <Link to="/correio" className={`transition-colors ${window.location.pathname.startsWith('/correio') ? 'text-orange-500' : 'text-slate-300 hover:text-orange-400'}`} title="Correio Interno"><Mail size={24} /></Link>
            <Link to="/jogoforca" className={`transition-colors ${window.location.pathname.startsWith('/jogoforca') ? 'text-orange-500' : 'text-slate-300 hover:text-orange-400'}`} title="Palavra Secreta"><Gamepad2 size={24} /></Link>
            <Link to="/males" className={`transition-colors ${window.location.pathname.startsWith('/males') ? 'text-orange-500' : 'text-slate-300 hover:text-orange-400'}`} title="Malês - VN"><Swords size={24} /></Link>
            <Link to="/turmas" className={`transition-colors ${window.location.pathname.startsWith('/turmas') ? 'text-orange-500' : 'text-slate-300 hover:text-orange-400'}`} title="Turmas"><GraduationCap size={24} /></Link>
            
            <div className="relative">
              <button onClick={() => {setShowNotif(!showNotif); setShowMsg(false)}} className="text-slate-300 hover:text-white transition-colors"><Bell size={24} /></button>
              {showNotif && <div className="absolute top-10 right-0 w-48 p-3 glass-card text-sm text-slate-300 text-center z-50">Sem notificações no momento</div>}
            </div>

            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-700">
              <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition group">
                <span className="font-medium group-hover:text-orange-400 flex items-center gap-1">
                  {userData.name}
                  {userData.is_verified && <BadgeCheck size={14} className="fill-blue-500 text-white" title="Verificado" />}
                </span>
                <img src={userData.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-orange-500/50 group-hover:border-orange-500" />
              </Link>
              <ThemeToggle />
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 ml-2" title="Sair">
                <LogOut size={20} />
              </button>
              <div className="ml-2 pl-4 border-l border-slate-700/50 flex items-center">
                <AppDrawer />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[minmax(0,600px)_320px] lg:grid-cols-[280px_minmax(0,600px)_320px] justify-center gap-6">
        {/* Left Sidebar (Desktop & Mobile "pessoas" tab) */}
        <aside className={`lg:block space-y-4 pb-6 lg:h-fit lg:sticky lg:bottom-4 ${mobileTab === 'pessoas' ? 'block' : 'hidden'}`}>
          <WidgetAudiobook currentUser={userData} isAdmin={userData?.is_admin} />
          <WidgetMembros />
          <WidgetEscambo />
          <WidgetGrupos />
          <WidgetForum />
          <WidgetArtigos isAdmin={userData?.is_admin} />
          <WidgetQuemSeguir currentUser={userData} isAdmin={userData?.is_admin} />
          <WidgetAniversarios currentUser={userData} isAdmin={userData?.is_admin} />
        </aside>

        <div className={`space-y-6 ${mobileTab === 'feed' ? 'block' : 'hidden'} md:block`}>
          <div className="md:hidden flex justify-between items-center mb-6 glass-card p-3 sm:p-4 relative z-[60]">
             <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition min-w-0 pr-2">
                <img src={userData.avatar} alt="Avatar" className="w-9 h-9 rounded-full border-2 border-orange-500 shrink-0" />
                <div className="min-w-0">
                  <h2 className="font-bold flex items-center gap-1 text-sm sm:text-base truncate">
                    <span className="truncate">{userData.name}</span>
                    {userData.is_verified && <BadgeCheck size={14} className="fill-blue-500 text-white shrink-0" title="Verificado" />}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-400 truncate">{userData.email}</p>
                </div>
             </Link>
              <div className="flex gap-1 items-center shrink-0">
               <Link to="/forum" className="text-orange-500 p-1.5 glass rounded-full" title="Fórum">
                 <MessageCircle size={18} />
               </Link>
               <Link to="/groups" className="text-orange-500 p-1.5 glass rounded-full" title="Grupos">
                 <Users size={18} />
               </Link>
               <Link to="/correio" className="text-orange-500 p-1.5 glass rounded-full" title="Correio Interno">
                 <Mail size={18} />
               </Link>
               <Link to="/jogoforca" className="text-orange-500 p-1.5 glass rounded-full" title="Palavra Secreta">
                 <Gamepad2 size={18} />
               </Link>
               <Link to="/males" className="text-orange-500 p-1.5 glass rounded-full" title="Malês: A História Esquecida">
                 <Swords size={18} />
               </Link>
               <div className="px-0.5"><AppDrawer /></div>
               <ThemeToggle />
               <button onClick={handleLogout} className="text-red-400 p-1.5 glass rounded-full" title="Sair">
                  <LogOut size={18} />
               </button>
             </div>
          </div>
          
          <WidgetVideoDestaque currentUser={userData} isAdmin={userData?.is_admin} />
          <CreatePost user={userData} />

          <div className="space-y-6">
            {posts?.map(post => (
              <Post key={post.id} post={post} currentUser={user} />
            ))}
            {posts?.length === 0 && (
              <div className="text-center text-slate-500 py-10 glass-card">
                Nenhuma publicação ainda. Seja o primeiro!
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar currentUser={user} className={`md:block md:h-fit md:sticky md:bottom-4 ${mobileTab === 'estudos' ? 'block' : 'hidden'}`} />
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="fixed bottom-0 w-full glass z-50 md:hidden pb-safe border-t border-slate-800/50">
        <div className="flex items-center justify-around h-16 relative px-2">
          <button onClick={() => setMobileTab('feed')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${mobileTab === 'feed' ? 'text-orange-500' : 'text-slate-400 hover:text-slate-300'}`}>
            <HomeIcon size={22} className={mobileTab === 'feed' ? 'drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : ''} />
            <span className="text-[10px] mt-1 font-medium">Feed</span>
          </button>

          <button onClick={() => setMobileTab('pessoas')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${mobileTab === 'pessoas' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-300'}`}>
            <Users size={22} className={mobileTab === 'pessoas' ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''} />
            <span className="text-[10px] mt-1 font-medium">Rede</span>
          </button>

          <button onClick={() => setMobileTab('estudos')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${mobileTab === 'estudos' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-300'}`}>
            <CalendarDays size={22} className={mobileTab === 'estudos' ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''} />
            <span className="text-[10px] mt-1 font-medium">Escola</span>
          </button>
          
          <button onClick={() => {setShowNotif(!showNotif); setShowMsg(false)}} className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-slate-300 relative transition-colors">
            <Bell size={22} />
            <span className="text-[10px] mt-1 font-medium">Notific.</span>
          </button>
          
          {Capacitor.isNativePlatform() && (
            <button onClick={handleManualUpdateCheck} className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-orange-500 relative transition-colors">
              <Download size={22} />
              <span className="text-[10px] mt-1 font-medium">Atualizar</span>
            </button>
          )}

          {showNotif && <div className="absolute bottom-16 right-4 w-48 p-3 glass-card text-sm text-slate-300 text-center shadow-xl">Sem notificações no momento</div>}
        </div>
      </nav>
    </div>
  );
}
