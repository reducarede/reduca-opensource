import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function WidgetForum() {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    supabase.from('forum_topics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => setTopics(data || []));
  }, []);

  if (topics.length === 0) return null;

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
          <MessageCircle size={16} className="text-orange-500" /> Fórum
        </h3>
        <Link to="/forum" className="text-xs text-orange-500 hover:text-orange-400 font-bold transition">Ver Todos</Link>
      </div>
      
      <div className="space-y-4">
        {topics.map(topic => (
          <Link to={`/forum/${topic.id}`} key={topic.id} className="flex items-center gap-3 group">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-orange-400 transition-colors">
                {topic.title}
              </h4>
              <p className="text-xs text-slate-500 truncate">
                {topic.content || '...'}
              </p>
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
