import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star } from 'lucide-react';

export default function WidgetConquistas({ currentUser }) {
  const availableBadges = [
    { id: 'vibe_coder', name: 'Vibe Coder', icon: <Star size={24} />, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30' },
    { id: 'top_mentor', name: 'Top Mentor', icon: <Award size={24} />, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30' },
    { id: 'professor', name: 'Professor', icon: <Award size={24} />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30' },
    { id: 'aluno_destaque', name: 'Aluno Destaque', icon: <Star size={24} />, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30' },
    { id: 'gestor', name: 'Gestor', icon: <Star size={24} />, color: 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30' }
  ];

  const userBadges = currentUser?.badges || [];

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-5 relative overflow-hidden">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Award size={16} className="text-purple-500" /> Seus Selos
      </h3>
      <div className="flex flex-wrap gap-3">
        {userBadges.length > 0 ? (
          userBadges.map(bId => {
            const badge = availableBadges.find(b => b.id === bId);
            if (!badge) return null;
            return (
              <div key={bId} className={`p-3 rounded-xl flex items-center justify-center border transition cursor-pointer ${badge.color}`} title={badge.name}>
                {badge.icon}
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate-500">Nenhum selo conquistado ainda.</p>
        )}
      </div>
    </motion.div>
  );
}
