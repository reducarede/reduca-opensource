import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, BarChart2, SmilePlus, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const COMMON_EMOJIS = ['👍','😂','❤️','😍','😊','🔥','💡','🚀','🙌','🤔','👏','🎉','💯','👀','📚','✏️'];

export default function Post({ post, currentUser }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir esta publicação?")) {
      await supabase.from('posts').delete().eq('id', post.id);
      setShowMenu(false);
    }
  };

  const author = post.author || { name: 'Desconhecido', avatar: 'https://placehold.co/100', id: post.user_id };

  const date = new Date(post.created_at).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  const likes = post.likes || [];
  const comments = post.comments || [];
  const isLiked = currentUser ? likes.includes(currentUser.id) : false;

  const handleLike = async () => {
    if (!currentUser) return;
    let newLikes = [...likes];
    if (isLiked) {
      newLikes = newLikes.filter(id => id !== currentUser.id);
    } else {
      newLikes.push(currentUser.id);
    }
    await supabase.from('posts').update({ likes: newLikes }).eq('id', post.id);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    
    const { data: cUser } = await supabase.from('profiles').select('name, avatar').eq('id', currentUser.id).single();
    
    const commentObj = {
      id: Date.now(),
      userId: currentUser.id,
      userName: cUser?.name || 'User',
      userAvatar: cUser?.avatar,
      text: newComment,
      timestamp: Date.now()
    };
    
    const newComments = [...comments, commentObj];
    await supabase.from('posts').update({ comments: newComments }).eq('id', post.id);
    setNewComment('');
  };

  const handleShare = async () => {
    try {
      const shareUrl = `https://reduca.zonaeducacional.org/profile/${author.id}`;
      if (navigator.share) {
        await navigator.share({
          title: `Post de ${author.name}`,
          text: post.content,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copiado para a área de transferência!');
      }
    } catch (err) {
      console.log('Error sharing', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Link to={`/profile/${author.id}`} className="flex items-center gap-3 group">
            <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full border border-slate-600 group-hover:border-orange-500 transition-colors object-cover" />
            <div>
              <h3 className="font-semibold text-slate-100 group-hover:text-orange-400 transition-colors flex items-center gap-1">
                {author.name}
                {author.is_verified && <BadgeCheck size={16} className="fill-blue-500 text-white" title="Verificado" />}
              </h3>
              <p className="text-xs text-slate-400">{date}</p>
            </div>
          </Link>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="text-slate-500 hover:text-slate-800 transition"
            >
              <MoreHorizontal size={20} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-black/10 shadow-xl rounded-xl overflow-hidden z-20">
                {currentUser?.id === post.user_id ? (
                  <button 
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                  >
                    Excluir publicação
                  </button>
                ) : (
                  <button 
                    onClick={() => { alert('Denúncia enviada aos moderadores.'); setShowMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Denunciar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {post.content && (
          <p className="text-slate-200 mb-4 whitespace-pre-wrap break-words">{post.content}</p>
        )}
      </div>

      {post.image && (
        post.image.includes('.mp4') ? (
          <video src={post.image} controls autoPlay muted loop playsInline className="w-full max-h-[500px] object-cover bg-black border-y border-slate-700/50" />
        ) : (
          <img src={post.image} alt="Post content" className="w-full max-h-[500px] object-cover border-y border-slate-700/50" />
        )
      )}

      {post.poll_data && (
        <div className="px-4 pb-4">
          <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4">
            <h4 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
              <BarChart2 size={16} className="text-orange-400" />
              {post.poll_data.question}
            </h4>
            <div className="space-y-2">
              {post.poll_data.options.map(option => {
                const hasVoted = currentUser && post.poll_data.voted_users?.includes(currentUser.id);
                const totalVotes = post.poll_data.options.reduce((acc, curr) => acc + curr.votes, 0);
                const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);

                return (
                  <div key={option.id} className="relative overflow-hidden rounded-lg">
                    {hasVoted && (
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${percentage}%` }} 
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-full bg-orange-500/20 z-0" 
                      />
                    )}
                    <button 
                      disabled={hasVoted || !currentUser}
                      onClick={async () => {
                        if (hasVoted || !currentUser) return;
                        const newPollData = { ...post.poll_data };
                        newPollData.voted_users = [...(newPollData.voted_users || []), currentUser.id];
                        newPollData.options = newPollData.options.map(opt => 
                          opt.id === option.id ? { ...opt, votes: opt.votes + 1 } : opt
                        );
                        await supabase.from('posts').update({ poll_data: newPollData }).eq('id', post.id);
                      }}
                      className={`w-full relative z-10 flex items-center justify-between text-left px-3 py-2 text-sm font-medium border transition-all ${
                        hasVoted 
                          ? 'border-slate-700/50 bg-transparent text-slate-300' 
                          : 'bg-slate-800 hover:bg-orange-500/10 hover:text-orange-300 border-slate-700 hover:border-orange-500/50 text-slate-300'
                      } rounded-lg`}
                    >
                      <span>{option.text}</span>
                      {hasVoted && <span className="font-bold text-xs">{percentage}%</span>}
                    </button>
                  </div>
                );
              })}
            </div>
            {post.poll_data.voted_users?.includes(currentUser?.id) && (
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                {post.poll_data.options.reduce((acc, curr) => acc + curr.votes, 0)} votos no total
              </p>
            )}
          </div>
        </div>
      )}

      {/* Interaction Bar */}
      <div className="px-4 py-3 flex items-center gap-6 border-t border-slate-700/50 bg-slate-900/20">
        <button 
          onClick={handleLike} 
          className={`flex items-center gap-2 transition ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
        >
          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} /> 
          <span className="text-sm">{likes.length > 0 ? likes.length : 'Curtir'}</span>
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)} 
          className={`flex items-center gap-2 transition ${showComments ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}
        >
          <MessageCircle size={20} /> 
          <span className="text-sm">{comments.length > 0 ? comments.length : 'Comentar'}</span>
        </button>
        
        <button onClick={handleShare} className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition ml-auto">
          <Share2 size={20} />
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-700/50 bg-slate-950/50"
          >
            <div className="p-4 space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <img src={comment.userAvatar} alt="" className="w-8 h-8 rounded-full border border-slate-700 object-cover" />
                  <div className="flex-1 bg-slate-800/80 p-3 rounded-2xl rounded-tl-sm border border-slate-700/50">
                    <h4 className="text-xs font-bold text-slate-300 mb-1">{comment.userName}</h4>
                    <p className="text-sm text-slate-200">{comment.text}</p>
                  </div>
                </div>
              ))}
              
              <form onSubmit={handleComment} className="flex items-center gap-2 mt-4 relative">
                <input 
                  type="text" 
                  placeholder="Escreva um comentário..." 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-full py-2.5 pl-4 pr-24 text-sm text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
                />
                
                <div className="absolute right-12 flex items-center">
                  <button 
                    type="button" 
                    onClick={() => setShowEmojis(!showEmojis)} 
                    className="p-1.5 text-slate-400 hover:text-orange-400 transition-colors"
                  >
                    <SmilePlus size={20} />
                  </button>
                  
                  <AnimatePresence>
                    {showEmojis && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl w-64 z-50 grid grid-cols-4 gap-2">
                        {COMMON_EMOJIS.map((emoji, idx) => (
                          <button key={idx} type="button" onClick={() => { setNewComment(prev => prev + emoji); setShowEmojis(false); }} className="text-2xl hover:bg-slate-800 rounded-lg p-1 transition transform hover:scale-110">
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  type="submit" 
                  disabled={!newComment.trim()}
                  className="absolute right-2 p-1.5 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 text-white rounded-full transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
