import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabase';
import { ImagePlus, Send, SmilePlus, BarChart2, X, Plus, Trash2, Loader2, Sparkles, Bot, Search, Video, Image as ImageIcon, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePostFromTopic } from '../ai';

const COMMON_EMOJIS = ['👍','😂','❤️','😍','😊','🔥','💡','🚀','🙌','🤔','👏','🎉','💯','👀','📚','✏️'];

export default function CreatePost({ user, groupId = null }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  
  // Emoji State
  const [showEmojis, setShowEmojis] = useState(false);
  
  // Poll State
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // AI State
  const [showAI, setShowAI] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [showPixabay, setShowPixabay] = useState(false);
  const [pixabayQuery, setPixabayQuery] = useState('');
  const [pixabayResults, setPixabayResults] = useState([]);
  const [pixabayType, setPixabayType] = useState('image');
  const [isSearchingMedia, setIsSearchingMedia] = useState(false);
  const PEXELS_API_KEY = "yre4KVjRJ3cgE5iavlbnHowKODQ9VtrsRQfeOx7Clu4TFae5ziAe0663";

  // Giphy State
  const [showGiphy, setShowGiphy] = useState(false);
  const [giphyQuery, setGiphyQuery] = useState('');
  const [giphyResults, setGiphyResults] = useState([]);
  const [isSearchingGiphy, setIsSearchingGiphy] = useState(false);
  const GIPHY_API_KEY = "tjrfigQsvMciYmIhgk4bJ8STRCponzE5";


  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const addEmoji = (emoji) => {
    setContent(prev => prev + emoji);
    setShowEmojis(false);
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    try {
      const generatedText = await generatePostFromTopic(aiTopic);
      setContent(prev => prev + (prev ? '\n\n' : '') + generatedText);
      setShowAI(false);
      setAiTopic('');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePixabaySearch = async () => {
    if (!pixabayQuery.trim()) return;
    setIsSearchingMedia(true);
    try {
      let url = '';
      if (pixabayType === 'video') {
        url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(pixabayQuery)}&per_page=12&locale=pt-BR`;
      } else {
        url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(pixabayQuery)}&per_page=12&locale=pt-BR`;
      }
      const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
      const data = await res.json();
      setPixabayResults(pixabayType === 'video' ? data.videos || [] : data.photos || []);
    } catch (err) {
      console.error(err);
      alert('Erro ao buscar mídia no Pexels.');
    }
    setIsSearchingMedia(false);
  };

  const handleGiphySearch = async () => {
    if (!giphyQuery.trim()) return;
    setIsSearchingGiphy(true);
    try {
      const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(giphyQuery)}&limit=12&lang=pt`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.data) {
        setGiphyResults(data.data);
      } else {
        alert("Erro na API do Giphy. Verifique sua API Key.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao buscar GIFs.");
    }
    setIsSearchingGiphy(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validPollOptions = pollOptions.filter(opt => opt.trim() !== '');
    const hasValidPoll = showPoll && pollQuestion.trim() !== '' && validPollOptions.length >= 2;
    
    if (!content.trim() && !image && !hasValidPoll) return;

    let pollData = null;
    if (hasValidPoll) {
      pollData = {
        question: pollQuestion,
        options: validPollOptions.map((opt, idx) => ({ id: idx + 1, text: opt, votes: 0 })),
        voted_users: [] // to track who voted in this specific post
      };
    }

    await supabase.from('posts').insert({
      user_id: user.id,
      content,
      image,
      poll_data: pollData,
      group_id: groupId
    });

    setContent('');
    setImage(null);
    setShowPoll(false);
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  return (
    <div className="glass-card p-4 relative">
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          placeholder={`O que você quer compartilhar, ${user.name.split(' ')[0]}?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-transparent resize-none focus:outline-none text-slate-100 placeholder-slate-500 min-h-[80px] overflow-hidden"
        />
        
        {image && (
          <div className="relative mb-4">
            {image.includes('.mp4') ? (
              <video src={image} controls autoPlay muted loop playsInline className="rounded-xl max-h-64 object-cover w-full bg-black border border-slate-700/50" />
            ) : (
              <img src={image} alt="Preview" className="rounded-xl max-h-64 object-cover w-full border border-slate-700/50" />
            )}
            <button
              type="button"
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 bg-slate-900/80 p-2 rounded-full hover:bg-red-500/80 transition text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <AnimatePresence>
          {showPoll && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-orange-400">Criar Enquete</h4>
                <button type="button" onClick={() => setShowPoll(false)} className="text-slate-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <input 
                type="text" 
                placeholder="Qual é a pergunta da enquete?" 
                value={pollQuestion}
                onChange={e => setPollQuestion(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-orange-500"
              />
              <div className="space-y-2">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder={`Opção ${idx + 1}`} 
                      value={opt}
                      onChange={e => updatePollOption(idx, e.target.value)}
                      className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500"
                    />
                    {pollOptions.length > 2 && (
                      <button type="button" onClick={() => removePollOption(idx)} className="text-slate-500 hover:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 5 && (
                <button type="button" onClick={addPollOption} className="mt-3 text-xs text-orange-400 font-medium flex items-center gap-1 hover:text-orange-300">
                  <Plus size={14} /> Adicionar Opção
                </button>
              )}
            </motion.div>
          )}

          {showAI && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 bg-indigo-900/20 p-4 rounded-xl border border-indigo-700/50 overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-2"><Bot size={16} /> Assistente de Postagem IA</h4>
                <button type="button" onClick={() => setShowAI(false)} className="text-slate-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-3">Diga sobre o que você quer falar e a IA escreverá um rascunho para você.</p>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Ex: Dicas para a prova do ENEM..." 
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleGenerateAI())}
                  disabled={isGenerating}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />
                <button 
                  type="button" 
                  onClick={handleGenerateAI} 
                  disabled={isGenerating || !aiTopic.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Gerar
                </button>
              </div>
            </motion.div>
          )}

          {showPixabay && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 bg-slate-900/80 p-4 rounded-xl border border-slate-700/50 overflow-hidden shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-emerald-500 flex items-center gap-2"><Search size={16} /> Buscar Mídia (Pexels)</h4>
                <button type="button" onClick={() => setShowPixabay(false)} className="text-slate-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <button type="button" onClick={() => {setPixabayType('image'); setPixabayResults([]);}} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${pixabayType === 'image' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  <ImageIcon size={14} /> Imagens
                </button>
                <button type="button" onClick={() => {setPixabayType('video'); setPixabayResults([]);}} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${pixabayType === 'video' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  <Video size={14} /> Vídeos
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <input 
                  type="text" 
                  placeholder={pixabayType === 'image' ? "Ex: tecnologia, abstrato..." : "Ex: natureza, universo..."} 
                  value={pixabayQuery}
                  onChange={e => setPixabayQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handlePixabaySearch(); } }}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
                />
                <button 
                  type="button" 
                  onClick={handlePixabaySearch} 
                  disabled={isSearchingMedia || !pixabayQuery.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center min-w-[80px]"
                >
                  {isSearchingMedia ? <Loader2 size={16} className="animate-spin" /> : 'Buscar'}
                </button>
              </div>

              {pixabayResults.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {pixabayResults.map(res => (
                    <div 
                      key={res.id} 
                      onClick={() => {
                        if (pixabayType === 'video') {
                          // Pexels video files array
                          const videoUrl = res.video_files?.find(v => v.quality === 'sd' || v.quality === 'hd')?.link || res.video_files?.[0]?.link;
                          if (videoUrl) setImage(videoUrl);
                        } else {
                          // Pexels photos
                          if (res.src?.large) setImage(res.src.large);
                        }
                        setShowPixabay(false);
                      }}
                      className="relative h-20 bg-slate-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500 transition group"
                    >
                      <img 
                        src={pixabayType === 'video' ? res.image : res.src?.tiny} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                        alt="preview"
                      />
                      {pixabayType === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><Video size={20} className="text-white drop-shadow-md" /></div>}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {showGiphy && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 bg-slate-900/80 p-4 rounded-xl border border-slate-700/50 overflow-hidden shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-pink-400 flex items-center gap-2"><Film size={16} /> Buscar GIF (Giphy)</h4>
                <button type="button" onClick={() => setShowGiphy(false)} className="text-slate-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <input 
                  type="text" 
                  placeholder="Ex: feliz, parabéns, estudando..." 
                  value={giphyQuery}
                  onChange={e => setGiphyQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleGiphySearch(); } }}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500 text-slate-200"
                />
                <button 
                  type="button" 
                  onClick={handleGiphySearch} 
                  disabled={isSearchingGiphy || !giphyQuery.trim()}
                  className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center min-w-[80px]"
                >
                  {isSearchingGiphy ? <Loader2 size={16} className="animate-spin" /> : 'Buscar'}
                </button>
              </div>

              {giphyResults.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {giphyResults.map(gif => (
                    <div 
                      key={gif.id} 
                      onClick={() => {
                        setImage(gif.images.original.url);
                        setShowGiphy(false);
                      }}
                      className="relative h-20 bg-slate-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-pink-500 transition group"
                    >
                      <img 
                        src={gif.images.fixed_height_small.url} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                        alt={gif.title}
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap items-center justify-between gap-y-3 pt-3 border-t border-slate-700/50 relative z-10">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 flex-1">
            <button type="button" onClick={() => setShowPixabay(!showPixabay)} className={`text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-800/50 ${showPixabay ? 'bg-slate-800/50' : ''}`} title="Buscar Mídia (Pexels)">
              <Search size={20} />
              <span className="text-sm font-medium hidden lg:inline">Pexels</span>
            </button>

            <button type="button" onClick={() => setShowGiphy(!showGiphy)} className={`text-pink-400 hover:text-pink-300 transition flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-800/50 ${showGiphy ? 'bg-slate-800/50' : ''}`} title="Buscar GIF (Giphy)">
              <Film size={20} />
              <span className="text-sm font-medium hidden lg:inline">GIF</span>
            </button>

            <button type="button" onClick={() => setShowPoll(!showPoll)} className={`text-orange-400 hover:text-orange-300 transition flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-800/50 ${showPoll ? 'bg-slate-800/50' : ''}`}>
              <BarChart2 size={20} />
              <span className="text-sm font-medium hidden lg:inline">Enquete</span>
            </button>

            <button type="button" onClick={() => setShowAI(!showAI)} className={`text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-800/50 ${showAI ? 'bg-slate-800/50' : ''}`} title="Gerar com IA">
              <Sparkles size={20} />
              <span className="text-sm font-medium hidden lg:inline">IA</span>
            </button>

            <div className="relative">
              <button type="button" onClick={() => setShowEmojis(!showEmojis)} className="text-orange-400 hover:text-orange-300 transition flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg hover:bg-slate-800/50">
                <SmilePlus size={20} />
                <span className="text-sm font-medium hidden lg:inline">Emoji</span>
              </button>
              
              <AnimatePresence>
                {showEmojis && (
                  <motion.div initial={{ opacity: 0, y: 10, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 10, x: '-50%' }} className="absolute bottom-full left-1/2 mb-2 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl w-[280px] z-50 grid grid-cols-4 gap-2">
                    {COMMON_EMOJIS.map((emoji, idx) => (
                      <button key={idx} type="button" onClick={() => addEmoji(emoji)} className="text-2xl hover:bg-slate-800 rounded-lg p-1 transition transform hover:scale-110">
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            type="submit"
            title="Publicar"
            disabled={(!content.trim() && !image && !showPoll) || (showPoll && (pollQuestion.trim() === '' || pollOptions.filter(o => o.trim() !== '').length < 2))}
            className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3.5 rounded-full font-medium transition flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0 ml-auto"
          >
            <Send size={18} className="-ml-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
