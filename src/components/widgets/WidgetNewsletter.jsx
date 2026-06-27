import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Mail, Smartphone, CheckCircle, Loader2, Send } from 'lucide-react';

export default function WidgetNewsletter({ currentUser }) {
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      checkSubscription();
    }
  }, [currentUser]);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_leads')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();
        
      if (data) {
        setIsSubscribed(true);
      }
    } catch (error) {
      // Not subscribed or error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!whatsapp.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', currentUser.id).single();
      const userName = profile?.name || currentUser.user_metadata?.name || currentUser.email.split('@')[0];

      const { error } = await supabase.from('marketing_leads').insert({
        user_id: currentUser.id,
        name: userName,
        email: currentUser.email,
        whatsapp: whatsapp.trim()
      });

      if (error) throw error;
      setIsSubscribed(true);
    } catch (error) {
      console.error('Erro ao assinar newsletter:', error);
      alert('Erro: ' + (error.message || 'Verifique se a tabela foi criada no Supabase.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-5 border border-emerald-500/30 flex justify-center items-center h-40">
        <Loader2 className="animate-spin text-emerald-500" size={24} />
      </div>
    );
  }

  return (
    <div className="glass-card p-5 border border-emerald-500/30 relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all duration-500"></div>
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="bg-emerald-500/20 p-2 rounded-lg">
          <Mail size={20} className="text-emerald-400" />
        </div>
        <h3 className="text-sm font-bold text-emerald-400">Fique por Dentro</h3>
      </div>

      {isSubscribed ? (
        <div className="text-center py-4 relative z-10 animate-in fade-in duration-500">
          <div className="bg-emerald-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={24} className="text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-slate-200">Tudo certo!</p>
          <p className="text-xs text-slate-400 mt-1">Você já está recebendo nossas novidades e materiais exclusivos.</p>
        </div>
      ) : (
        <div className="relative z-10">
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Cadastre seu WhatsApp para receber convites VIP, resumos semanais e conteúdos exclusivos da Reduca.
          </p>
          
          <form onSubmit={handleSubscribe} className="space-y-3">
            <div className="relative">
              <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="Seu WhatsApp com DDD..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !whatsapp.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm py-2 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Quero Receber
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-2">
              Seu e-mail cadastrado ({currentUser.email.split('@')[0]}...) será usado automaticamente.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
