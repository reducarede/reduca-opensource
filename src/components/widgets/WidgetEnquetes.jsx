import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, CheckCircle2, RefreshCw, Settings2, X, Plus, Trash2 } from 'lucide-react';

export default function WidgetEnquetes({ isAdmin }) {
  const [votedId, setVotedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [question, setQuestion] = useState('Qual a melhor ferramenta para engajamento?');
  const [options, setOptions] = useState([
    { id: 1, text: 'Kahoot', votes: 42 },
    { id: 2, text: 'Mentimeter', votes: 28 },
    { id: 3, text: 'Quizizz', votes: 15 }
  ]);

  // Edit states
  const [editQuestion, setEditQuestion] = useState('');
  const [editOptions, setEditOptions] = useState([]);

  useEffect(() => {
    const savedVote = localStorage.getItem('reduc_enquete_voto');
    if (savedVote) setVotedId(Number(savedVote));

    const savedPoll = localStorage.getItem('reduc_enquete_data');
    if (savedPoll) {
      try {
        const data = JSON.parse(savedPoll);
        if(data.question && data.options) {
          setQuestion(data.question);
          setOptions(data.options);
        }
      } catch(e) { }
    }
  }, []);

  const handleVote = (id) => {
    if (votedId) return;
    setVotedId(id);
    localStorage.setItem('reduc_enquete_voto', id);
    
    setOptions(prev => {
      const updated = prev.map(opt => opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt);
      localStorage.setItem('reduc_enquete_data', JSON.stringify({ question, options: updated }));
      return updated;
    });
  };

  const handleReset = () => {
    if (!votedId) return;
    localStorage.removeItem('reduc_enquete_voto');
    setOptions(prev => {
      const updated = prev.map(opt => opt.id === votedId && opt.votes > 0 ? { ...opt, votes: opt.votes - 1 } : opt);
      localStorage.setItem('reduc_enquete_data', JSON.stringify({ question, options: updated }));
      return updated;
    });
    setVotedId(null);
  };

  const startEditing = () => {
    setEditQuestion(question);
    setEditOptions(options.map(o => ({...o})));
    setIsEditing(true);
  };

  const updateEditOption = (id, text) => {
    setEditOptions(prev => prev.map(o => o.id === id ? { ...o, text } : o));
  };

  const removeEditOption = (id) => {
    setEditOptions(prev => prev.filter(o => o.id !== id));
  };

  const addEditOption = () => {
    const newId = editOptions.length > 0 ? Math.max(...editOptions.map(o => o.id)) + 1 : 1;
    setEditOptions(prev => [...prev, { id: newId, text: '', votes: 0 }]);
  };

  const handleSavePoll = () => {
    const newOptions = editOptions.filter(o => o.text.trim() !== '').map((o, idx) => ({ id: idx + 1, text: o.text, votes: 0 }));
    if(newOptions.length < 2) return;

    setQuestion(editQuestion);
    setOptions(newOptions);
    setVotedId(null);
    localStorage.removeItem('reduc_enquete_voto');
    
    localStorage.setItem('reduc_enquete_data', JSON.stringify({
      question: editQuestion,
      options: newOptions
    }));
    
    setIsEditing(false);
  };

  const totalVotes = options.reduce((acc, curr) => acc + curr.votes, 0);

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-5 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div key="view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <PieChart size={16} className="text-indigo-400" /> Enquete do Dia
              </h3>
              <div className="flex items-center gap-2">
                {votedId && (
                  <button onClick={handleReset} className="text-slate-500 hover:text-indigo-400 transition-colors" title="Zerar meu voto">
                    <RefreshCw size={14} />
                  </button>
                )}
                {isAdmin && (
                  <button onClick={startEditing} className="text-slate-500 hover:text-orange-400 transition-colors" title="Criar nova enquete">
                    <Settings2 size={14} />
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-sm text-slate-200 mb-3 font-medium">{question}</p>
            
            <div className="space-y-2">
              {options.map(option => {
                const isVoted = votedId === option.id;
                const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
                
                return (
                  <div key={option.id} className="relative overflow-hidden rounded-lg">
                    {votedId && (
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${percentage}%` }} 
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-full bg-indigo-500/20 z-0" 
                      />
                    )}
                    
                    <button 
                      onClick={() => handleVote(option.id)}
                      disabled={votedId !== null}
                      className={`w-full relative z-10 flex items-center justify-between text-left px-3 py-2 text-xs font-medium border transition-all ${
                        isVoted 
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' 
                          : votedId 
                            ? 'border-slate-700/50 bg-transparent text-slate-400' 
                            : 'bg-slate-800 hover:bg-indigo-500/20 hover:text-indigo-300 border-slate-700 hover:border-indigo-500/50'
                      } rounded-lg`}
                    >
                      <span className="flex items-center gap-2">
                        {option.text}
                        {isVoted && <CheckCircle2 size={14} className="text-indigo-400" />}
                      </span>
                      {votedId && <span className="font-bold">{percentage}%</span>}
                    </button>
                  </div>
                );
              })}
            </div>
            {votedId && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-slate-500 mt-3 text-center">
                {totalVotes} votos • Obrigado por participar!
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div key="edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider">Criar Enquete</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block uppercase font-bold">Pergunta</label>
                <input 
                  type="text" 
                  value={editQuestion} 
                  onChange={e => setEditQuestion(e.target.value)} 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
                  placeholder="Ex: Qual sua cor favorita?"
                />
              </div>
              
              <div>
                <label className="text-xs text-slate-400 mb-1 block uppercase font-bold">Opções</label>
                <div className="space-y-2">
                  {editOptions.map((opt, index) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={opt.text} 
                        onChange={e => updateEditOption(opt.id, e.target.value)} 
                        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-orange-500 outline-none"
                        placeholder={`Opção ${index + 1}`}
                      />
                      <button onClick={() => removeEditOption(opt.id)} className="text-slate-500 hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                {editOptions.length < 5 && (
                  <button onClick={addEditOption} className="mt-2 text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium">
                    <Plus size={12} /> Adicionar Opção
                  </button>
                )}
              </div>
              
              <button 
                onClick={handleSavePoll} 
                disabled={editOptions.filter(o => o.text.trim() !== '').length < 2 || !editQuestion.trim()}
                className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-2 rounded-lg mt-4 transition-colors"
              >
                Publicar Nova Enquete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
