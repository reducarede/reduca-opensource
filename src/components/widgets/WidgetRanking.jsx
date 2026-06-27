import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

export default function WidgetRanking() {
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-5 relative overflow-hidden">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Trophy size={16} className="text-yellow-500" /> Top Colaboradores
      </h3>
      <div className="space-y-3">
        {['Sérgio (Você)', 'Mariana', 'Roberto'].map((name, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className={`font-bold w-5 text-center ${i===0 ? 'text-yellow-500' : i===1 ? 'text-slate-300' : 'text-orange-700'}`}>{i+1}º</span>
            <div className="flex-1 text-sm text-slate-200">{name}</div>
            <div className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">{100 - i*15} pts</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
