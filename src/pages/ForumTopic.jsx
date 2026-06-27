import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { ArrowLeft, MessageSquare, Send, Hash, Trash2 } from 'lucide-react';

export default function ForumTopic({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    fetchTopicDetails();
  }, [id]);

  const fetchTopicDetails = async () => {
    const { data: topicData } = await supabase.from('forum_topics').select('*, author:profiles(id, name, avatar, role)').eq('id', id).single();
    if (topicData) {
      setTopic(topicData);
      const { data: repliesData } = await supabase.from('forum_replies').select('*, author:profiles(id, name, avatar, role)').eq('topic_id', id).order('created_at', { ascending: true });
      if (repliesData) setReplies(repliesData);
    } else {
      navigate('/forum');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    const { data } = await supabase.from('forum_replies').insert({
      topic_id: id,
      content: newReply,
      author_id: user.id
    }).select('*, author:profiles(id, name, avatar, role)').single();

    if (data) {
      setReplies([...replies, data]);
      setNewReply('');
    }
  };

  const handleDeleteTopic = async () => {
    if (window.confirm('Tem certeza que deseja apagar este tópico?')) {
      await supabase.from('forum_topics').delete().eq('id', id);
      navigate('/forum');
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (window.confirm('Apagar esta resposta?')) {
      await supabase.from('forum_replies').delete().eq('id', replyId);
      setReplies(replies.filter(r => r.id !== replyId));
    }
  };

  if (!topic) return <div className="min-h-screen flex items-center justify-center text-slate-400">Carregando tópico...</div>;

  const isAdminOrAuthor = user.id === topic.author_id; // Simulating delete rights for author

  return (
    <div className="min-h-screen pb-32 pt-20 px-4 md:px-12 max-w-4xl mx-auto relative">
      <button onClick={() => navigate('/forum')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition glass px-4 py-2 rounded-full w-fit">
        <ArrowLeft size={18} /> Voltar pro Fórum
      </button>

      {/* Main Topic Post */}
      <div className="glass-card p-6 md:p-8 mb-8 border border-orange-500/30 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-purple-500 rounded-t-2xl"></div>
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <Link to={`/profile/${topic.author_id}`}>
              <img src={topic.author?.avatar} alt={topic.author?.name} className="w-14 h-14 rounded-full border-2 border-orange-500 object-cover" />
            </Link>
            <div>
              <Link to={`/profile/${topic.author_id}`} className="font-bold text-slate-200 hover:text-orange-400 transition-colors text-lg block">
                {topic.author?.name}
              </Link>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1 uppercase font-bold">
                  <Hash size={10} /> {topic.category}
                </span>
                <span>• {new Date(topic.created_at).toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>
          
          {isAdminOrAuthor && (
            <button onClick={handleDeleteTopic} className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition" title="Apagar Tópico">
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-slate-100 mb-4">{topic.title}</h1>
        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">
          {topic.content}
        </div>
      </div>

      {/* Replies Section */}
      <h3 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-2">
        <MessageSquare className="text-orange-500" size={20} />
        {replies.length} {replies.length === 1 ? 'Resposta' : 'Respostas'}
      </h3>

      <div className="space-y-4 mb-8">
        {replies.map(reply => (
          <div key={reply.id} className="glass-card p-5 border border-slate-700/50 flex gap-4">
            <Link to={`/profile/${reply.author_id}`} className="shrink-0">
              <img src={reply.author?.avatar} alt={reply.author?.name} className="w-10 h-10 rounded-full border border-slate-600 object-cover" />
            </Link>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <Link to={`/profile/${reply.author_id}`} className="font-bold text-slate-300 hover:text-white transition-colors text-sm">
                    {reply.author?.name}
                  </Link>
                  <span className="text-xs text-slate-500 ml-2">
                    {new Date(reply.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                {(user.id === reply.author_id) && (
                  <button onClick={() => handleDeleteReply(reply.id)} className="text-slate-600 hover:text-red-400 p-1">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">{reply.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Input Fixed at bottom */}
      <div className="fixed bottom-0 left-0 w-full p-4 glass border-t border-slate-700/50 z-40 md:bg-slate-950/80">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleReply} className="flex gap-2">
            <input 
              type="text" 
              value={newReply} 
              onChange={e => setNewReply(e.target.value)} 
              placeholder="Escreva sua resposta..." 
              className="flex-1 glass-input py-3 px-4 rounded-full"
            />
            <button 
              type="submit" 
              disabled={!newReply.trim()} 
              className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-600 text-white p-3 rounded-full shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center aspect-square"
            >
              <Send size={20} className="-ml-0.5 mt-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
