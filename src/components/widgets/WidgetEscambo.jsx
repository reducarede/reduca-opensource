import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { RefreshCcw, HeartHandshake, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function WidgetEscambo() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    supabase.from('barter_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data, error: err }) => {
        if (err) setError(true);
        else setItems(data || []);
      });
  }, []);

  if (error) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className="glass-card p-5 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <RefreshCcw size={16} className="text-green-500" /> Escambo
        </h3>
        <Link to="/escambo" className="text-xs text-green-500 hover:text-green-400 font-bold transition">Ver Todos</Link>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center text-slate-500 py-6 text-sm">
          Nenhum item anunciado no escambo ainda.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <Link to="/escambo" key={item.id} className="flex items-center gap-3 group">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-green-400 transition-colors">
                {item.title}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold flex items-center gap-1">
                {item.type === 'Doação' ? <HeartHandshake size={10} className="text-indigo-400" /> : <RefreshCcw size={10} className="text-green-400" />}
                {item.type}
              </p>
            </div>
            <div className="text-slate-500 group-hover:text-green-500 transition-colors">
              <ChevronRight size={16} />
            </div>
          </Link>
        ))}
      </div>
      )}
    </motion.div>
  );
}
