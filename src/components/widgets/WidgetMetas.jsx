import React from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export default function WidgetMetas() {
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-5 relative overflow-hidden">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Target size={16} className="text-green-500" /> Meta Diária
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Interações hoje</span>
          <span>3 / 5</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: '60%' }}></div>
        </div>
        <p className="text-xs text-slate-500 mt-2">Só mais 2 para o combo!</p>
      </div>
    </motion.div>
  );
}
