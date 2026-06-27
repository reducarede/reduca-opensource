import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { UserPlus, UserCheck, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';

function FollowUser({ user, currentUser }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const checkFollow = async () => {
      const { data } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUser.id)
        .eq('following_id', user.id)
        .single();
      if (data) setIsFollowing(true);
      setLoading(false);
    };
    checkFollow();
  }, [currentUser, user.id]);

  const handleFollowToggle = async () => {
    if (loading || !currentUser) return;
    const newStatus = !isFollowing;
    setIsFollowing(newStatus); // Optimistic UI

    if (newStatus) {
      await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: user.id });
    } else {
      await supabase.from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', user.id);
    }
  };

  return (
    <div className="flex items-center gap-3 group">
      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-slate-700 group-hover:border-orange-500 transition-colors object-cover" />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-200 truncate flex items-center gap-1">
          {user.name}
          {user.is_verified && <BadgeCheck size={14} className="fill-blue-500 text-white flex-shrink-0" title="Verificado" />}
        </h4>
        <p className="text-xs text-slate-500 truncate">Sugerido para você</p>
      </div>
      <button 
        onClick={handleFollowToggle}
        disabled={loading}
        className={`p-1.5 rounded-full transition-all ${
          isFollowing 
            ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-orange-500 border border-slate-700 hover:border-orange-500'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isFollowing ? 'Seguindo' : 'Seguir'}
      >
        {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
      </button>
    </div>
  );
}

export default function WidgetQuemSeguir({ currentUser }) {
  const [otherUsers, setOtherUsers] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    supabase.from('profiles').select('*').neq('id', currentUser.id).limit(4).then(({ data }) => setOtherUsers(data || []));
  }, [currentUser]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className="glass-card p-5 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-5 flex items-center gap-2">
        Quem Seguir
      </h3>
      
      <div className="space-y-4">
        {otherUsers.map(user => (
          <FollowUser key={user.id} user={user} currentUser={currentUser} />
        ))}
        {otherUsers.length === 0 && (
          <p className="text-xs text-slate-500">Nenhuma sugestão no momento.</p>
        )}

      </div>
    </motion.div>
  );
}
