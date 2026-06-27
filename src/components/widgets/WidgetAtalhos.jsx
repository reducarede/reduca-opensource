import React from 'react';
import { motion } from 'framer-motion';
import { Zap, FileText, Video, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WidgetAtalhos() {
  const navigate = useNavigate();

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-5 relative overflow-hidden">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Zap size={16} className="text-yellow-400" /> Atalhos Rápidos
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => navigate('/blog')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition text-xs text-slate-300 gap-2">
          <FileText size={18} className="text-blue-400" /> Artigo
        </button>
        <button onClick={() => alert('Plataforma de Aulas em breve!')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition text-xs text-slate-300 gap-2">
          <Video size={18} className="text-red-400" /> Aula
        </button>
        <button onClick={() => navigate('/groups')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition text-xs text-slate-300 gap-2 col-span-2">
          <Users size={18} className="text-green-400" /> Nova Turma
        </button>
      </div>
    </motion.div>
  );
}
