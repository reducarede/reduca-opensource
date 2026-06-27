import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { ArrowLeft, Edit3, MapPin, Briefcase, Calendar, X, BadgeCheck, Trophy, MessageSquare, Heart, Mail, Home, BookOpen, MessageCircle, RefreshCcw, Users, Gamepad2, Swords, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import Post from '../components/Post';
import CoverPicker from '../components/CoverPicker';

export default function Profile({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const targetId = id || currentUser?.id;
  const isOwnProfile = targetId === currentUser?.id;

  const [profileUser, setProfileUser] = useState(undefined);
  const [userPosts, setUserPosts] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editCover, setEditCover] = useState('default');
  const [editBio, setEditBio] = useState('');
  const [editReducaEmail, setEditReducaEmail] = useState('');
  const [editHideBirthdate, setEditHideBirthdate] = useState(false);
  const [editCellphone, setEditCellphone] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(true);

  const coverThemes = [
    { id: 'default', label: 'Laranja e Roxo', className: 'bg-gradient-to-r from-orange-600 to-purple-600' },
    { id: 'ocean', label: 'Oceano Profundo', className: 'bg-gradient-to-r from-blue-600 to-cyan-500' },
    { id: 'forest', label: 'Floresta Verde', className: 'bg-gradient-to-r from-emerald-600 to-teal-500' },
    { id: 'sunset', label: 'Pôr do Sol', className: 'bg-gradient-to-r from-rose-500 to-amber-500' },
    { id: 'midnight', label: 'Meia-noite', className: 'bg-gradient-to-r from-indigo-900 to-slate-900' },
    { id: 'neon', label: 'Cyberpunk', className: 'bg-gradient-to-r from-pink-600 to-violet-600' },
  ];

  useEffect(() => {
    if (!targetId) return;

    supabase.from('profiles').select('*').eq('id', targetId).single().then(({ data }) => {
      setProfileUser(data || null);
    });

    supabase.from('posts').select('*, author:profiles(id, name, avatar)').eq('user_id', targetId).order('created_at', { ascending: false }).then(({ data }) => {
      setUserPosts(data || []);
    });

    if (currentUser && targetId !== currentUser.id) {
      supabase.from('follows').select('*').eq('follower_id', currentUser.id).eq('following_id', targetId).single().then(({ data }) => {
        setIsFollowing(!!data);
        setFollowLoading(false);
      }).catch(() => {
        setFollowLoading(false);
      });
    } else {
      setFollowLoading(false);
    }
  }, [targetId, currentUser]);

  const handleFollowToggle = async () => {
    if (followLoading || !currentUser) return;
    const newStatus = !isFollowing;
    setIsFollowing(newStatus); // Optimistic UI

    if (newStatus) {
      await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: targetId });
    } else {
      await supabase.from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', targetId);
    }
  };

  const handleEditClick = () => {
    if (profileUser) {
      setEditName(profileUser.name || '');
      setEditAvatar(profileUser.avatar || '');
      setEditBirthDate(profileUser.birth_date || '');
      setEditLocation(profileUser.location || '');
      setEditRole(profileUser.role || '');
      setEditCover(profileUser.cover_image || 'default');
      setEditBio(profileUser.bio || '');
      setEditReducaEmail(profileUser.reduca_email || '');
      setEditHideBirthdate(profileUser.hide_birthdate || false);
      setEditCellphone(profileUser.cellphone || '');
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editAvatar.trim()) return;

    let finalReducaEmail = editReducaEmail.trim().toLowerCase();
    if (finalReducaEmail && !finalReducaEmail.endsWith('@reduca.net')) {
      finalReducaEmail = `${finalReducaEmail.replace(/[^a-z0-9_]/g, '')}@reduca.net`;
    }

    const { error } = await supabase.from('profiles').update({
      name: editName,
      avatar: editAvatar,
      birth_date: editBirthDate || null,
      location: editLocation || null,
      role: editRole || null,
      cover_image: editCover,
      bio: editBio || null,
      reduca_email: finalReducaEmail || null,
      hide_birthdate: editHideBirthdate,
      cellphone: editCellphone || null
    }).eq('id', targetId);

    if (error) {
      if (error.code === '23505') {
        alert('Este E-mail Reduca já está sendo usado por outra pessoa. Escolha outro nome.');
        return;
      }
      alert('Erro ao salvar perfil: ' + error.message);
      return;
    }

    setProfileUser(prev => ({ 
      ...prev, 
      name: editName, 
      avatar: editAvatar, 
      birth_date: editBirthDate, 
      location: editLocation, 
      role: editRole, 
      cover_image: editCover,
      bio: editBio,
      reduca_email: finalReducaEmail || null,
      hide_birthdate: editHideBirthdate,
      cellphone: editCellphone || null
    }));
    setIsEditing(false);
  };

  if (profileUser === undefined) return <div className="min-h-screen flex items-center justify-center text-slate-400">Carregando perfil...</div>;
  if (profileUser === null) return <div className="min-h-screen flex items-center justify-center text-slate-400">Usuário não encontrado.</div>;

  // Gamificação / Engajamento
  const totalPosts = userPosts.length;
  const totalLikes = userPosts.reduce((acc, post) => acc + (post.likes?.length || 0), 0);
  const totalComments = userPosts.reduce((acc, post) => acc + (post.comments?.length || 0), 0);
  const engajamentoScore = (totalPosts * 10) + (totalLikes * 2) + (totalComments * 5);

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 md:px-12 max-w-2xl mx-auto relative">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-black mb-6 transition glass px-4 py-2 rounded-full w-fit">
        <ArrowLeft size={18} /> Voltar
      </button>

      {/* Header Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden mb-8 border border-slate-700/50">
        <div className="h-48 relative overflow-hidden bg-slate-800">
          {profileUser.cover_image && profileUser.cover_image.startsWith('http') ? (
            <img src={profileUser.cover_image} alt="Capa" className="w-full h-full object-cover" />
          ) : (
            <div className={`absolute inset-0 ${coverThemes.find(t => t.id === (profileUser.cover_image || 'default'))?.className || coverThemes[0].className} transition-colors duration-500`} />
          )}
          {isOwnProfile && (
            <button 
              onClick={handleEditClick}
              className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/60 hover:bg-slate-900/90 px-4 py-2 rounded-full text-white transition backdrop-blur-md shadow-lg border border-white/10 text-sm font-semibold" 
              title="Editar Perfil"
            >
              <Edit3 size={16} /> Editar Perfil
            </button>
          )}
          <div className="absolute top-4 left-4">
            <ThemeToggle />
          </div>
        </div>
        <div className="px-6 pb-8 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 mb-4 gap-4">
            <img 
              src={profileUser.avatar} 
              alt={profileUser.name} 
              className="w-32 h-32 rounded-full border-4 border-slate-100 dark:border-slate-900 object-cover bg-slate-200 dark:bg-slate-800 shadow-xl" 
            />
            
            <div className="flex flex-col items-end gap-3 w-full sm:w-auto pb-2 sm:pb-0 mb-2">
              {/* Atalhos Rápidos Simples */}
              <div className="flex items-center gap-3 sm:gap-4 px-2">
                <Link to="/" title="Home" className="text-slate-400 hover:text-orange-500 hover:scale-110 transition-all"><Home size={18} /></Link>
                <Link to="/blog" title="Blog" className="text-slate-400 hover:text-orange-500 hover:scale-110 transition-all"><BookOpen size={18} /></Link>
                <Link to="/forum" title="Fórum" className="text-slate-400 hover:text-orange-500 hover:scale-110 transition-all"><MessageCircle size={18} /></Link>
                <Link to="/escambo" title="Escambo" className="text-slate-400 hover:text-orange-500 hover:scale-110 transition-all"><RefreshCcw size={18} /></Link>
                <Link to="/groups" title="Grupos" className="text-slate-400 hover:text-orange-500 hover:scale-110 transition-all"><Users size={18} /></Link>
                <Link to="/correio" title="Correio" className="text-slate-400 hover:text-orange-500 hover:scale-110 transition-all"><Mail size={18} /></Link>
                <Link to="/jogoforca" title="Forca" className="text-slate-400 hover:text-orange-500 hover:scale-110 transition-all"><Gamepad2 size={18} /></Link>
                <Link to="/males" title="Malês" className="text-slate-400 hover:text-orange-500 hover:scale-110 transition-all"><Swords size={18} /></Link>
                <Link to="/turmas" title="Turmas" className="text-slate-400 hover:text-orange-500 hover:scale-110 transition-all"><GraduationCap size={18} /></Link>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            {profileUser.name}
            {profileUser.is_verified && <BadgeCheck size={28} className="fill-blue-500 text-white" title="Verificado" />}
          </h1>
          <p className="text-slate-400 mb-6 font-medium">@{profileUser.email ? profileUser.email.split('@')[0] : (profileUser.name?.replace(/\s+/g, '').toLowerCase() || 'usuario')}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 bg-slate-900/30 p-4 rounded-xl border border-slate-700/50 w-fit mb-6">
            <span className="flex items-center gap-2"><Briefcase size={16} className="text-orange-500"/> {profileUser.role || 'Professor(a)'}</span>
            <span className="flex items-center gap-2"><MapPin size={16} className="text-orange-500"/> {profileUser.location || 'Brasil'}</span>
            {!profileUser.hide_birthdate && (
              profileUser.birth_date ? (
                <span className="flex items-center gap-2"><Calendar size={16} className="text-orange-500"/> Nasc.: {new Date(profileUser.birth_date + 'T12:00:00Z').toLocaleDateString('pt-BR')}</span>
              ) : (
                <span className="flex items-center gap-2"><Calendar size={16} className="text-orange-500"/> Desde 2026</span>
              )
            )}
            {profileUser.reduca_email && (
              <span className="flex items-center gap-2 font-medium text-orange-400 border border-orange-500/20 bg-orange-500/10 px-2 py-1 rounded-lg">
                <Mail size={16} className="text-orange-500"/> {profileUser.reduca_email}
              </span>
            )}
            {profileUser.cellphone && (
              <span className="flex items-center gap-2 text-slate-300">
                <span className="text-orange-500 font-bold text-xs uppercase tracking-wider">Cel:</span> {profileUser.cellphone}
              </span>
            )}
          </div>

          {/* Gamificação / Score */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-500/20 to-purple-500/20 border border-orange-500/30 px-5 py-3 rounded-2xl flex items-center gap-4 shadow-lg">
              <div className="bg-orange-500 p-2.5 rounded-xl shadow-lg shadow-orange-500/40">
                <Trophy size={24} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] text-orange-300 font-bold uppercase tracking-wider">Score Reduca</p>
                <p className="text-2xl font-black text-slate-50 leading-none mt-1">{engajamentoScore}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-700/50 px-5 py-3 rounded-2xl">
               <div className="text-center">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Posts</p>
                 <p className="text-lg font-bold text-slate-200">{totalPosts}</p>
               </div>
               <div className="w-px h-8 bg-slate-700"></div>
               <div className="text-center">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1 justify-center"><Heart size={10}/> Likes</p>
                 <p className="text-lg font-bold text-slate-200">{totalLikes}</p>
               </div>
               <div className="w-px h-8 bg-slate-700"></div>
               <div className="text-center">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1 justify-center"><MessageSquare size={10}/> Coments</p>
                 <p className="text-lg font-bold text-slate-200">{totalComments}</p>
               </div>
            </div>
          </div>
          
          {!isOwnProfile && (
            <div className="mb-6 max-w-sm">
              <button 
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`w-full px-5 py-3 text-sm rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFollowing 
                    ? 'bg-slate-200 dark:bg-slate-700 hover:bg-red-500 hover:border-red-500 hover:text-white text-slate-800 dark:text-white shadow-none border border-slate-300 dark:border-transparent'
                    : 'bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-500/20 border border-transparent'
                }`}
              >
                {isFollowing ? 'Seguindo' : 'Seguir Perfil'}
              </button>
            </div>
          )}

          
          {profileUser.bio && (
            <div className="text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 leading-relaxed text-sm">
              <p className="whitespace-pre-wrap">{profileUser.bio}</p>
            </div>
          )}
        </div>
      </motion.div>



      {/* User Posts */}
      <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-orange-500 rounded-full block"></span> Publicações
      </h2>
      <div className="space-y-6">
        {userPosts?.map(post => (
          <Post key={post.id} post={post} currentUser={currentUser} />
        ))}
        {userPosts?.length === 0 && (
          <div className="text-center text-slate-500 py-12 glass-card">
            Nenhuma publicação feita por {isOwnProfile ? 'você' : profileUser.name.split(' ')[0]} ainda.
          </div>
        )}
      </div>

      {/* Modal Edit Profile */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-md p-6 relative z-10">
              <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
              <h2 className="text-2xl font-bold text-orange-500 mb-6">Editar Perfil</h2>
              
              <div className="flex justify-center mb-6">
                <img src={editAvatar || 'https://placehold.co/150'} alt="Preview" className="w-24 h-24 rounded-full border-2 border-orange-500 object-cover" />
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase font-bold tracking-wide">Nome de Exibição</label>
                  <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} className="glass-input w-full" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase font-bold tracking-wide">URL da Foto de Perfil</label>
                  <input type="url" required value={editAvatar} onChange={e => setEditAvatar(e.target.value)} className="glass-input w-full" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase font-bold tracking-wide">Data de Nascimento</label>
                  <input type="date" value={editBirthDate} onChange={e => setEditBirthDate(e.target.value)} className="glass-input w-full mb-2" />
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={editHideBirthdate} onChange={e => setEditHideBirthdate(e.target.checked)} className="rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500" />
                    Ocultar data de nascimento no perfil
                  </label>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase font-bold tracking-wide">Localidade (Cidade/Estado)</label>
                  <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="Ex: Salinas da Margarida, BA" className="glass-input w-full" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase font-bold tracking-wide">Celular / WhatsApp</label>
                  <input type="tel" value={editCellphone} onChange={e => setEditCellphone(e.target.value)} placeholder="Ex: (75) 99999-9999" className="glass-input w-full" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase font-bold tracking-wide">Cargo / Título</label>
                  <input type="text" value={editRole} onChange={e => setEditRole(e.target.value)} placeholder="Ex: Professor(a) de História" className="glass-input w-full" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase font-bold tracking-wide">Biografia</label>
                  <textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Conte um pouco sobre você..." className="glass-input w-full min-h-[80px] resize-y" />
                </div>
                
                <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl mt-4 mb-4">
                  <label className="flex items-center gap-2 text-xs text-orange-500 mb-1 uppercase font-bold tracking-wide">
                    <Mail size={14} /> Correio Interno Reduca
                  </label>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    Crie ou edite o seu endereço oficial (ex: prof.joao). Isso permite que você troque mensagens de forma privada com qualquer membro pela página de <b>Correio</b>!
                  </p>
                  <div className="flex items-stretch">
                    <input type="text" value={editReducaEmail ? editReducaEmail.replace('@reduca.net', '') : ''} onChange={e => setEditReducaEmail(e.target.value)} placeholder="seunome" className="glass-input w-full rounded-r-none focus:ring-0 focus:border-orange-500" />
                    <span className="bg-slate-800 border border-l-0 border-white/20 text-slate-400 rounded-r-xl px-4 flex items-center text-sm font-medium">@reduca.net</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-slate-400 mb-2 uppercase font-bold tracking-wide">Capa Profissional</label>
                  <CoverPicker 
                    currentCover={editCover}
                    onSelectCover={(url) => setEditCover(url)}
                  />
                </div>
                
                <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/30 mt-4">
                  Salvar Alterações
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
