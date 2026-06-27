import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Send, Trash2 } from 'lucide-react';
import { supabase } from '../../supabase';

export default function WidgetDuvidas({ currentUser, isAdmin }) {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchQuestions();
    
    if (!error) {
      const channel = supabase.channel('questions_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, fetchQuestions)
        .subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, [error]);

  const fetchQuestions = async () => {
    try {
      const { data, error: fetchErr } = await supabase.from('questions').select('*').order('created_at', { ascending: false }).limit(5);
      if (fetchErr) throw fetchErr;
      if (data) {
        setQuestions(data);
        setError(false);
      }
    } catch (err) {
      setError(true);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !currentUser) return;
    
    const { data: profile } = await supabase.from('profiles').select('name').eq('id', currentUser.id).single();
    const userName = profile?.name || currentUser.email.split('@')[0];

    const { error: insertError } = await supabase.from('questions').insert([{
      user_id: currentUser.id,
      user_name: userName,
      text: newQuestion
    }]);
    
    if (!insertError) {
      // Dispara a notificação push APENAS para os professores/admins
      supabase.functions.invoke('push-notify', {
        body: { 
          title: "Mural de Dúvidas 🙋‍♂️", 
          body: `O aluno ${userName} acabou de enviar uma dúvida.`,
          target: "admins"
        }
      }).catch(console.error);
    }
    
    setNewQuestion('');
  };

  if (error) {
    return (
      <motion.div layout className="glass-card p-5 relative overflow-hidden border border-red-500/30">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <HelpCircle size={16} className="text-blue-500" /> Mural de Dúvidas
        </h3>
        <p className="text-xs text-slate-500 text-center">Em manutenção...</p>
      </motion.div>
    );
  }

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-5 relative overflow-hidden">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <HelpCircle size={16} className="text-blue-500" /> Mural de Dúvidas
      </h3>
      
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
        {questions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-2">Nenhuma dúvida ainda. Pergunte algo!</p>
        ) : (
          questions.map(q => (
            <div key={q.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors">
              <div className="flex justify-between items-start">
                <p className="text-sm text-slate-200 font-medium mb-2 leading-tight flex-1">"{q.text}"</p>
                {isAdmin && (
                  <button onClick={async () => {
                    if(window.confirm('Excluir esta dúvida?')) {
                      await supabase.from('questions').delete().eq('id', q.id);
                      setQuestions(questions.filter(question => question.id !== q.id));
                    }
                  }} className="text-red-400 hover:text-red-300 ml-2 p-1" title="Excluir">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-blue-500 block"></span> {q.user_name}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input 
          type="text" 
          value={newQuestion}
          onChange={e => setNewQuestion(e.target.value)}
          placeholder="Qual a sua dúvida?"
          className="flex-1 min-w-0 glass-input !py-2 !px-3 text-xs"
        />
        <button type="submit" disabled={!newQuestion.trim()} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2 rounded-xl transition-colors shrink-0">
          <Send size={14} />
        </button>
      </form>
    </motion.div>
  );
}
