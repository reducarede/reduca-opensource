import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { BookOpen, CheckCircle, Clock, Plus, X, FileText, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WidgetTarefas({ currentUser, isAdmin }) {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  
  // States for creating a task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');

  // States for submitting a task
  const [submissionContent, setSubmissionContent] = useState('');

  // States for professor viewing submissions
  const [taskSubmissions, setTaskSubmissions] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Load Tasks
      const { data: tasksData, error: err1 } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (tasksData) setTasks(tasksData);
      
      if (err1 && err1.code === '42P01') {
        console.warn("A tabela 'tasks' ainda não foi criada no banco de dados.");
        setLoading(false);
        return;
      }

      // 2. Load Submissions
      if (isAdmin) {
        // Admin loads all submissions to count them
        const { data: subsData } = await supabase.from('task_submissions').select('*');
        if (subsData) setSubmissions(subsData);
      } else {
        // Student loads only their submissions
        const { data: subsData } = await supabase.from('task_submissions').select('*').eq('student_id', currentUser.id);
        if (subsData) setSubmissions(subsData);
      }
    } catch (e) {
      console.error("Erro ao carregar tarefas:", e);
    }
    setLoading(false);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    const { data, error } = await supabase.from('tasks').insert({
      title: newTaskTitle,
      description: newTaskDesc,
      due_date: newTaskDue || null,
      created_by: currentUser.id
    }).select().single();
    
    if (data) {
      setTasks([data, ...tasks]);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDue('');
      setIsModalOpen(false);
      
      // Dispara a notificação push
      supabase.functions.invoke('push-notify', {
        body: { title: "Nova Tarefa: " + newTaskTitle, body: "Prazo final: " + (newTaskDue || "Sem prazo") }
      }).catch(console.error);
    }
    if (error) alert("Erro ao criar tarefa. O banco de dados foi atualizado? " + error.message);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!submissionContent || !activeTask) return;
    
    const { data, error } = await supabase.from('task_submissions').insert({
      task_id: activeTask.id,
      student_id: currentUser.id,
      content: submissionContent
    }).select().single();

    if (data) {
      setSubmissions([...submissions, data]);
      setSubmissionContent('');
      setActiveTask(null);
    }
    if (error) alert("Erro ao enviar tarefa. " + error.message);
  };

  const openTaskSubmissions = async (task) => {
    setActiveTask(task);
    if (isAdmin) {
      const { data } = await supabase.from('task_submissions').select('*, student:profiles(name, avatar)').eq('task_id', task.id);
      if (data) setTaskSubmissions(data);
    }
  };

  if (loading) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-4 relative">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <BookOpen size={18} className="text-blue-400" /> Tarefas de Classe
          </h3>
          {isAdmin && (
            <button onClick={() => { setActiveTask(null); setIsModalOpen(true); }} className="p-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors" title="Criar Nova Tarefa">
              <Plus size={16} />
            </button>
          )}
        </div>

        <div className="space-y-3 relative">
          {tasks.slice(0, 4).map(task => {
            const hasSubmitted = submissions.some(s => s.task_id === task.id && s.student_id === currentUser.id);
            const subsCount = submissions.filter(s => s.task_id === task.id).length;
            const isOverdue = task.due_date && new Date(task.due_date) < new Date();

            return (
              <div 
                key={task.id} 
                onClick={() => { if (!hasSubmitted || isAdmin) openTaskSubmissions(task); }}
                className={`p-3 rounded-xl border ${hasSubmitted && !isAdmin ? 'bg-green-900/10 border-green-500/30 opacity-70' : 'bg-slate-900/50 border-slate-700 hover:border-blue-500/50 cursor-pointer transition-colors shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm font-semibold ${hasSubmitted && !isAdmin ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{task.title}</h4>
                  {!isAdmin && hasSubmitted && <CheckCircle size={14} className="text-green-500 flex-shrink-0" title="Entregue" />}
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-medium">{subsCount} entregas</span>
                      <button onClick={async (e) => {
                        e.stopPropagation();
                        if(window.confirm('Excluir esta tarefa e todas as submissões?')) {
                          await supabase.from('tasks').delete().eq('id', task.id);
                          setTasks(tasks.filter(t => t.id !== task.id));
                        }
                      }} className="text-red-400 hover:text-red-300 transition-colors p-1 bg-red-500/10 rounded-full" title="Excluir">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
                {task.due_date && (
                  <p className={`text-[10px] flex items-center gap-1 ${isOverdue && !hasSubmitted ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                    <Clock size={10} /> {hasSubmitted && !isAdmin ? 'Enviado' : `Entrega: ${new Date(task.due_date).toLocaleDateString('pt-BR')}`}
                  </p>
                )}
              </div>
            );
          })}
          {tasks.length === 0 && (
            <div className="text-center py-6">
               <div className="mx-auto w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center mb-2">
                 <FileText size={18} className="text-slate-500" />
               </div>
               <p className="text-xs text-slate-400">Nenhuma tarefa pendente.</p>
               {isAdmin && <p className="text-[10px] text-blue-400 mt-1">Clique no + para criar uma atividade.</p>}
            </div>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-md p-6 relative z-10 border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)]">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
              <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2"><Plus className="text-blue-400"/> Nova Tarefa de Classe</h2>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-bold uppercase tracking-wide">Título da Atividade</label>
                  <input type="text" required value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="glass-input w-full border-slate-700 focus:border-blue-500" placeholder="Ex: Resenha do Capítulo 1" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-bold uppercase tracking-wide">Descrição / Instruções</label>
                  <textarea rows="3" value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} className="glass-input w-full border-slate-700 focus:border-blue-500" placeholder="O que os alunos devem fazer?"></textarea>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-bold uppercase tracking-wide">Data de Entrega (Opcional)</label>
                  <input type="date" value={newTaskDue} onChange={e => setNewTaskDue(e.target.value)} className="glass-input w-full border-slate-700 focus:border-blue-500" />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors mt-4 shadow-lg shadow-blue-500/20">Publicar Tarefa</button>
              </form>
            </motion.div>
          </div>
        )}

        {activeTask && !isAdmin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveTask(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card w-full max-w-md p-6 relative z-10 border border-blue-500/30">
              <button onClick={() => setActiveTask(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
              <h2 className="text-xl font-bold text-slate-100 mb-2">{activeTask.title}</h2>
              <div className="text-sm text-slate-300 mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 min-h-24 whitespace-pre-wrap">
                 {activeTask.description || <span className="text-slate-500 italic">Sem instruções adicionais do professor.</span>}
              </div>
              
              <form onSubmit={handleSubmitTask} className="space-y-4">
                <div>
                  <label className="block text-xs text-blue-400 mb-2 font-bold uppercase tracking-wide flex items-center gap-1"><FileText size={14}/> Sua Resposta / Link</label>
                  <textarea required rows="4" value={submissionContent} onChange={e => setSubmissionContent(e.target.value)} className="glass-input w-full border-slate-600 focus:border-green-500 transition-colors" placeholder="Cole o link do seu trabalho ou digite a resposta aqui..."></textarea>
                </div>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-lg shadow-green-500/20"><CheckCircle size={18}/> Enviar Atividade</button>
              </form>
            </motion.div>
          </div>
        )}

        {activeTask && isAdmin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveTask(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="glass-card w-full max-w-2xl p-6 relative z-10 max-h-[85vh] flex flex-col border border-blue-500/30">
              <button onClick={() => setActiveTask(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1 rounded-full"><X size={20} /></button>
              <div className="mb-6 border-b border-slate-700 pb-4">
                 <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">Painel de Entregas</h2>
                 <p className="text-sm text-blue-400 font-semibold">{activeTask.title}</p>
                 <p className="text-xs text-slate-400 mt-1">{taskSubmissions.length} alunos já enviaram a resolução.</p>
              </div>
              
              <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {taskSubmissions.map(sub => (
                  <div key={sub.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={sub.student?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.student?.id}`} alt={sub.student?.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">{sub.student?.name}</h4>
                        <p className="text-[10px] text-slate-500">Enviado em: {new Date(sub.submitted_at).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-lg text-sm text-slate-300 whitespace-pre-wrap border border-slate-800 border-l-2 border-l-blue-500">
                      {sub.content}
                    </div>
                  </div>
                ))}
                {taskSubmissions.length === 0 && (
                   <div className="text-center py-12">
                      <BookOpen size={40} className="text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium">Nenhuma submissão até o momento.</p>
                      <p className="text-xs text-slate-500 mt-1">Aguarde os alunos enviarem suas respostas.</p>
                   </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
