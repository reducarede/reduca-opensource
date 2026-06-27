import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

export default function WidgetCustom({ widgetData }) {
  if (!widgetData) return null;

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-5 relative overflow-hidden">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <ExternalLink size={16} className="text-cyan-400" /> Externo
      </h3>
      <a href={widgetData.url} target="_blank" rel="noopener noreferrer" className="block group">
        <div className="flex items-center gap-3 bg-slate-800/50 hover:bg-cyan-500/10 border border-slate-700 hover:border-cyan-500/50 p-3 rounded-xl transition-colors">
          <img 
            src={widgetData.image || 'https://placehold.co/100x100/1e293b/fff?text=App'} 
            alt={widgetData.title} 
            className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-700" 
          />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">{widgetData.title}</h4>
            <p className="text-xs text-slate-400 line-clamp-2 mt-1">{widgetData.description}</p>
          </div>
        </div>
      </a>
    </motion.div>
  );
}
