import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Hash } from 'lucide-react';

export default function WidgetTrending() {
  const topics = ['Didática', 'BNCC', 'Gamificação', 'Matemática', 'IAnaEducação'];
  
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-5 relative overflow-hidden">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <TrendingUp size={16} className="text-orange-500" /> Em Alta
      </h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic, i) => (
          <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:border-orange-500 hover:text-orange-400 cursor-pointer transition-colors flex items-center gap-1">
            <Hash size={12} /> {topic}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
