import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { BookAudio, Play, Pause, ChevronLeft, Loader, Headphones, Volume2, Plus, X, Check, Trash2 } from 'lucide-react';

const LIBRIVOX_BOOKS = [
  { id: '815', title: 'Coleção LibriVox de Contos Brasileiros 001', author: ' Various', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/815' },
  { id: '2483', title: 'Sermões', author: ' Padre Antonio Vieira', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/2483' },
  { id: '2485', title: 'Coleção de Poemas em Português', author: ' Various', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/2485' },
  { id: '2564', title: 'Sonetos - Poemas de Amor', author: ' Luís Vaz de Camões', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/2564' },
  { id: '2941', title: 'Poesias Infantis', author: 'Olavo Bilac', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/2941' },
  { id: '3058', title: 'Alienista', author: 'Joaquim Maria Machado de Assis', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/3058' },
  { id: '3118', title: 'Senhora', author: 'José de Alencar', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/3118' },
  { id: '3313', title: 'Lusíadas', author: ' Luís Vaz de Camões', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/3313' },
  { id: '3604', title: 'Sonetos - Poemas Filosoficos', author: ' Luís Vaz de Camões', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/3604' },
  { id: '3648', title: 'Contos, volume 1', author: 'Artur de Azevedo', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/3648' },
  { id: '3680', title: 'Saudades: Historia de Menina e Moça', author: 'Bernardim Ribeiro', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/3680' },
  { id: '3698', title: 'Contos, volume 2', author: 'Artur de Azevedo', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/3698' },
  { id: '3701', title: 'Contos para Velhos', author: 'Olavo Bilac', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/3701' },
  { id: '3702', title: 'Ateneu', author: 'Raul Pompéia', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/3702' },
  { id: '3743', title: 'Coleção de Autoras em Português', author: ' Various', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/3743' },
  { id: '3758', title: 'Desencantos', author: 'Joaquim Maria Machado de Assis', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/3758' },
  { id: '3765', title: 'Escravos', author: 'Antônio Frederico de Castro Alves', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/3765' },
  { id: '3799', title: 'Cinco Minutos', author: 'José de Alencar', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/3799' },
  { id: '3848', title: 'Contos de Lima Barreto', author: 'Lima Barreto', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/3848' },
  { id: '3899', title: 'Sertões', author: 'Euclides da Cunha', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/3899' },
  { id: '3962', title: 'Broquéis', author: ' João da Cruz e Sousa', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/3962' },
  { id: '4041', title: 'Contos, volume 3', author: 'Artur de Azevedo', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/4041' },
  { id: '4171', title: 'Amor por Anexins', author: 'Artur de Azevedo', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/4171' },
  { id: '4205', title: 'Bíblia  01: Genesis', author: ' Almeida Version', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/4205' },
  { id: '4272', title: 'Club da Má Língua', author: 'Fyodor Dostoyevsky', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/4272' },
  { id: '4572', title: 'Primaveras', author: 'Casimiro José Marques de Abreu', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/4572' },
  { id: '4629', title: 'Eu e Outras Poesias', author: 'Augusto dos Anjos', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/4629' },
  { id: '4739', title: 'Contos Fluminenses e Histórias da Meia-Noite', author: 'Joaquim Maria Machado de Assis', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/4739' },
  { id: '4807', title: 'Triste Fim de Policarpo Quaresma', author: 'Lima Barreto', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/4807' },
  { id: '5054', title: 'Coletânea de Leandro Gomes de Barros', author: 'Leandro Gomes de Barros', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/5054' },
  { id: '5323', title: 'Sonetos Completos', author: ' Antero de Quental', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/5323' },
  { id: '5833', title: 'Noites de insomnia, offerecidas a quem não póde dormir, volume 1', author: 'Camilo Castelo Branco', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/5833' },
  { id: '6141', title: 'Amor de Perdição', author: 'Camilo Castelo Branco', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/6141' },
  { id: '6187', title: 'Viuvinha', author: 'José de Alencar', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/6187' },
  { id: '6361', title: 'Antologia de Discursos em Português', author: ' Various', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/6361' },
  { id: '6390', title: 'Antologia Brasileira, Coletânea em Prosa e Verso de Escritores Nacionais, Volume 1', author: ' Various', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/6390' },
  { id: '7087', title: 'Noites de insomnia, offerecidas a quem não póde dormir, volume 2', author: 'Camilo Castelo Branco', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/7087' },
  { id: '7642', title: 'Relíquia', author: 'José Maria de Eça de Queirós', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/7642' },
  { id: '8363', title: 'Diva', author: 'José de Alencar', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/8363' },
  { id: '8380', title: 'Mão e a Luva', author: 'Joaquim Maria Machado de Assis', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/8380' },
  { id: '8708', title: 'Contos', author: 'José Maria de Eça de Queirós', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/8708' },
  { id: '8729', title: 'À margem da história', author: 'Euclides da Cunha', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/8729' },
  { id: '9018', title: 'Helena', author: 'Joaquim Maria Machado de Assis', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/9018' },
  { id: '9163', title: 'Casa Velha', author: 'Joaquim Maria Machado de Assis', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/9163' },
  { id: '9280', title: 'Esaú e Jacó', author: 'Joaquim Maria Machado de Assis', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/9280' },
  { id: '10229', title: 'Canaã', author: 'José Pereira da Graça Aranha', cover: 'https://archive.org/download//cover.jpg', rss: 'https://librivox.org/rss/10229' },
  { id: '12879', title: 'O Cortiço', author: 'Aluísio Azevedo', cover: 'https://archive.org/download/LibrivoxCdCoverArt30/cortico_1711.jpg', rss: 'https://librivox.org/rss/12879' },
  { id: '13988', title: 'Dom Casmurro', author: 'Machado de Assis', cover: 'https://archive.org/download/dom_casmurro_2102_librivox/domcasmurro_2102.jpg', rss: 'https://librivox.org/rss/13988' },
];

export default function WidgetLibriVox({ currentUser, isAdmin }) {
  const [dynamicBooks, setDynamicBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Admin states
  const [isAdding, setIsAdding] = useState(false);
  const [rssInput, setRssInput] = useState('');
  const [addingLoading, setAddingLoading] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    fetchDynamicBooks();

    const channel = supabase.channel('realtime-brisa')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
        if (payload.new && payload.new.content && payload.new.content.includes('#brisaliteraria')) {
          fetchDynamicBooks();
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, () => {
        fetchDynamicBooks();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchDynamicBooks = async () => {
    try {
      const { data: admins } = await supabase.from('profiles').select('id').eq('is_admin', true);
      if (!admins || admins.length === 0) return;
      const adminIds = admins.map(a => a.id);

      const { data: posts } = await supabase
        .from('posts')
        .select('id, content')
        .in('user_id', adminIds)
        .ilike('content', '%#brisaliteraria%')
        .order('created_at', { ascending: false });

      if (posts) {
        const loadedBooks = [];
        posts.forEach(p => {
          const match = p.content.match(/#brisaliteraria\s+(.+)/);
          if (match) {
            try {
              const bookData = JSON.parse(match[1]);
              bookData.postId = p.id;
              loadedBooks.push(bookData);
            } catch (e) {
              console.error("Erro ao fazer parse do livro:", e);
            }
          }
        });
        setDynamicBooks(loadedBooks);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!rssInput || !rssInput.includes('librivox.org/rss/')) {
      alert("Por favor, cole um link de RSS válido do LibriVox (ex: https://librivox.org/rss/12345)");
      return;
    }

    setAddingLoading(true);
    try {
      // Fetch feed details via rss2json to generate metadata
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssInput)}`);
      const data = await res.json();
      
      if (data.status !== 'ok') {
        throw new Error("Não foi possível ler este feed RSS.");
      }

      // Parse title and author
      const titleParts = data.feed.title.split(' by ');
      const title = titleParts[0].trim();
      const author = titleParts[1] ? titleParts[1].replace(/\(.*?\)/g, '').trim() : 'Autor Desconhecido';
      const cover = data.feed.image || 'https://via.placeholder.com/150x200/1e293b/a5b4fc?text=Audiobook';
      const id = Date.now().toString();

      const newBookObj = {
        id,
        title,
        author,
        cover,
        rss: rssInput.trim()
      };

      await supabase.from('posts').insert({
        user_id: currentUser.id,
        content: `#brisaliteraria ${JSON.stringify(newBookObj)}`
      });

      setRssInput('');
      setIsAdding(false);
      fetchDynamicBooks(); // force refresh
    } catch (err) {
      alert("Erro ao adicionar livro: " + err.message);
    } finally {
      setAddingLoading(false);
    }
  };

  const deleteBook = async (postId, e) => {
    e.stopPropagation();
    if (!confirm("Remover este audiolivro da lista?")) return;
    try {
      await supabase.from('posts').delete().eq('id', postId);
      fetchDynamicBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const openBook = async (book) => {
    setSelectedBook(book);
    setLoading(true);
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(book.rss)}`);
      const data = await res.json();
      if (data.status === 'ok') {
        const validChapters = data.items.filter(item => item.enclosure && item.enclosure.link);
        setChapters(validChapters.reverse());
      }
    } catch (err) {
      console.error("Erro ao carregar audiolivro", err);
    } finally {
      setLoading(false);
    }
  };

  const closeBook = () => {
    setSelectedBook(null);
    setChapters([]);
  };

  const playTrack = (track) => {
    if (currentTrack && currentTrack.guid === track.guid) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play().catch(e => console.log('Autoplay prevent:', e));
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const allBooks = [...LIBRIVOX_BOOKS, ...dynamicBooks];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 relative overflow-hidden mb-4"
    >
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <BookAudio size={18} className="text-indigo-400" />
            Brisa Literária
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">Aberto</span>
            {isAdmin && !selectedBook && !isAdding && (
               <button 
                 onClick={() => setIsAdding(true)} 
                 className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-600"
                 title="Adicionar Livro LibriVox"
               >
                 <Plus size={14} />
               </button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.form 
              key="add-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddBook} 
              className="mb-4 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50"
            >
              <h4 className="text-xs font-bold text-indigo-300 mb-2">Adicionar Novo Audiolivro</h4>
              <p className="text-[10px] text-slate-400 mb-3">Cole o link do RSS do LibriVox (Ex: https://librivox.org/rss/XXXXX).</p>
              <input 
                type="url" 
                placeholder="https://librivox.org/rss/..." 
                value={rssInput} 
                onChange={e => setRssInput(e.target.value)}
                className="glass-input w-full border-slate-700 focus:border-indigo-500 text-xs py-2 px-3 mb-2"
                required
              />
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={addingLoading}
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center justify-center font-medium shadow-lg shadow-indigo-500/20 text-xs"
                >
                  {addingLoading ? <Loader size={14} className="animate-spin" /> : <><Check size={14} className="mr-1" /> Salvar</>}
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center justify-center font-medium">
                  <X size={14} />
                </button>
              </div>
            </motion.form>
          ) : !selectedBook ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700"
            >
              {allBooks.map((book) => (
                <button 
                  key={book.id}
                  onClick={() => openBook(book)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-xl transition-all border border-transparent hover:border-slate-700/50 group text-left relative"
                >
                  <img 
                    src={book.cover} 
                    alt={book.title} 
                    className="w-12 h-16 object-cover rounded-md shadow-md group-hover:scale-105 transition-transform bg-slate-800"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150x200/1e293b/a5b4fc?text=Audiobook' }}
                  />
                  <div className="flex-1 pr-6">
                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1">{book.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{book.author}</p>
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500/10 rounded-full text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Headphones size={14} />
                  </div>
                  {isAdmin && book.postId && (
                    <div 
                      onClick={(e) => deleteBook(book.postId, e)}
                      className="absolute top-1 right-1 p-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-20"
                      title="Excluir"
                    >
                      <Trash2 size={12} />
                    </div>
                  )}
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="book"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-[250px]"
            >
              <button 
                onClick={closeBook}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-3 w-fit"
              >
                <ChevronLeft size={14} /> Voltar
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <img src={selectedBook.cover} alt="Cover" className="w-12 h-16 object-cover rounded-md shadow-sm bg-slate-800" />
                <div>
                  <h4 className="text-sm font-bold text-slate-200 leading-tight line-clamp-2">{selectedBook.title}</h4>
                  <p className="text-xs text-slate-400">{selectedBook.author}</p>
                </div>
              </div>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-indigo-400">
                  <Loader size={24} className="animate-spin mb-2" />
                  <span className="text-xs">Carregando Capítulos...</span>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
                  {chapters.map((chapter, idx) => {
                    const isCurrent = currentTrack?.guid === chapter.guid;
                    const cleanTitle = chapter.title.replace(/^([0-9]+)\s*-\s*/, '');
                    return (
                      <button
                        key={chapter.guid}
                        onClick={() => playTrack(chapter)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${isCurrent ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-slate-800'}`}
                      >
                        <span className={`text-xs truncate pr-2 flex-1 ${isCurrent ? 'text-indigo-300 font-semibold' : 'text-slate-300'}`}>
                           {cleanTitle}
                        </span>
                        {isCurrent ? (
                          isPlaying ? <Volume2 size={12} className="text-indigo-400 shrink-0" /> : <Pause size={12} className="text-indigo-400 shrink-0" />
                        ) : (
                          <Play size={12} className="text-slate-500 shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Global Player */}
        {currentTrack && (
          <div className="mt-4 pt-3 border-t border-slate-700/50">
            <audio 
              ref={audioRef}
              src={currentTrack.enclosure.link}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              controls
              controlsList="nodownload"
              className="w-full h-8 outline-none [&::-webkit-media-controls-panel]:bg-slate-800 [&::-webkit-media-controls-current-time-display]:text-xs [&::-webkit-media-controls-time-remaining-display]:text-xs [&::-webkit-media-controls-play-button]:text-indigo-500"
            />
            <p className="text-[10px] text-center text-slate-400 mt-2 truncate max-w-full px-2" title={currentTrack.title}>
              Tocando: <span className="text-indigo-300 font-medium">{currentTrack.title}</span>
            </p>
          </div>
        )}

      </div>
    </motion.div>
  );
}
