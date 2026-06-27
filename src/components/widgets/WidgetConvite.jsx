import React from 'react';
import { Share2, MessageCircle } from 'lucide-react';

export default function WidgetConvite() {
  const handleInvite = () => {
    const text = "Ei! Acabei de entrar na Reduca, uma nova plataforma educacional muito massa. Vem participar com a gente! 🚀🎓";
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="glass-card p-5 border border-[#25D366]/30 relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#25D366]/20 rounded-full blur-2xl group-hover:bg-[#25D366]/30 transition-all duration-500"></div>
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="bg-[#25D366]/20 p-2 rounded-lg">
          <Share2 size={20} className="text-[#25D366]" />
        </div>
        <h3 className="text-sm font-bold text-[#25D366]">Convide Amigos</h3>
      </div>

      <div className="relative z-10">
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          O aprendizado fica muito melhor em rede! Chame seus amigos para estudar na Reduca.
        </p>
        
        <button
          onClick={handleInvite}
          className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-sm py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20"
        >
          <MessageCircle size={18} />
          Convidar via WhatsApp
        </button>
      </div>
    </div>
  );
}
