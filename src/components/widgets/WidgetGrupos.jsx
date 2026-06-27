import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Users, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function WidgetGrupos() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    supabase.from('groups')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => setGroups(data || []));
  }, []);

  if (groups.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className="glass-card p-5 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Users size={16} className="text-orange-500" /> Grupos
        </h3>
        <Link to="/groups" className="text-xs text-orange-500 hover:text-orange-400 font-bold transition">Ver Todos</Link>
      </div>
      
      <div className="space-y-4">
        {groups.map(group => (
          <Link to={`/groups/${group.id}`} key={group.id} className="flex items-center gap-3 group">
            {group.cover_image ? (
              <img src={group.cover_image} alt={group.name} className="w-10 h-10 rounded-lg object-cover border border-slate-700/50 group-hover:border-orange-500 transition-colors" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700/50 group-hover:border-orange-500 transition-colors">
                <Users size={18} className="text-slate-500 group-hover:text-orange-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-orange-400 transition-colors">
                {group.name}
              </h4>
            </div>
            <div className="text-slate-500 group-hover:text-orange-500 transition-colors">
              <ChevronRight size={16} />
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
