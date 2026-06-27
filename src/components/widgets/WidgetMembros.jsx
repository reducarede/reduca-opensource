import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Users, BadgeCheck, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function WidgetMembros() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true });
        
      if (data) {
        setMembers(data);
      }
    };

    fetchMembers();

    // Subscribe to new members
    const channel = supabase.channel('realtime-profiles-widget')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchMembers();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-5 relative"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-orange-500/20 text-orange-500 rounded-lg">
          <Users size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-200">Membros da Rede</h3>
          <p className="text-xs text-slate-400">{members.length} participantes</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        {members.map(member => (
          <Link 
            to={`/profile/${member.id}`} 
            key={member.id}
            className="relative group transition-transform hover:scale-110 hover:z-10"
          >
            <div className="relative">
              <img 
                src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email || member.id}`} 
                alt={member.name} 
                className="w-12 h-12 rounded-full border-2 border-slate-700/50 group-hover:border-orange-500 transition-all object-cover bg-slate-900 shadow-sm" 
              />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#fefce8] dark:border-slate-950 rounded-full"></div>
            </div>
            
            {/* Tooltip Customizado */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-200 text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-slate-700 flex items-center gap-1 font-medium">
              {member.name}
              {member.is_verified && <BadgeCheck size={12} className="fill-blue-500 text-white" />}
            </div>
          </Link>
        ))}
        {members.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-4 w-full">Carregando membros...</p>
        )}
      </div>
    </motion.div>
  );
}
