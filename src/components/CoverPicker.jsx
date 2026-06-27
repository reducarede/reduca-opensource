import React, { useState, useEffect } from 'react';
import { Search, X, Image as ImageIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PEXELS_API_KEY = "yre4KVjRJ3cgE5iavlbnHowKODQ9VtrsRQfeOx7Clu4TFae5ziAe0663";

export default function CoverPicker({ currentCover, onSelectCover }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  useEffect(() => {
    if (isOpen && images.length === 0) {
      searchPexels('background abstrato');
    }
  }, [isOpen]);

  const searchPexels = async (searchQuery) => {
    setLoading(true);
    setError(false);
    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&orientation=landscape&per_page=21&locale=pt-BR`;
      const res = await fetch(url, {
        headers: {
          Authorization: PEXELS_API_KEY
        }
      });
      const data = await res.json();
      if (data.photos) {
        setImages(data.photos);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (query.trim()) {
      searchPexels(query.trim());
    }
  };

  return (
    <div className="w-full">
      {!isOpen && (
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-2">
          {currentCover && currentCover.startsWith('http') && (
            <div className="h-16 w-32 rounded-lg overflow-hidden border-2 border-slate-700 shrink-0">
              <img src={currentCover} className="w-full h-full object-cover" alt="Capa" />
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg w-full"
          >
            <ImageIcon size={20} className="text-orange-500" />
            <span className="font-bold">Pesquisar Capa Profissional</span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl relative mt-2 mb-4">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-full transition z-10"
              >
                <X size={18} />
              </button>
              
              <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                <Search className="text-emerald-500" size={20} />
                Banco de Imagens Pexels
              </h3>

              <div className="flex gap-2 mb-4 pr-8">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch(e);
                    }
                  }}
                  placeholder="Ex: tecnologia, natureza, universo..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-orange-500 transition"
                />
                <button 
                  type="button"
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                >
                  Buscar
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                  <Loader2 className="animate-spin mb-2 text-orange-500" size={32} />
                  <p>Buscando imagens incríveis...</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-48 text-red-400 text-sm">
                  Erro ao conectar com Pexels.
                </div>
              ) : images.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                  Nenhuma imagem encontrada. Tente outros termos.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  {images.map((img) => (
                    <div 
                      key={img.id}
                      onClick={() => {
                        onSelectCover(img.src.landscape);
                        setIsOpen(false);
                      }}
                      className={`relative h-24 rounded-lg overflow-hidden cursor-pointer group border-2 transition-all ${
                        currentCover === img.src.landscape ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'border-transparent hover:border-slate-500'
                      }`}
                    >
                      <img src={img.src.tiny} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" loading="lazy" alt={img.alt} />
                      {currentCover === img.src.landscape && (
                        <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                          <CheckCircle2 className="text-white drop-shadow-md" size={32} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500 text-center flex items-center justify-center gap-1">
                Imagens fornecidas por <a href="https://pexels.com/" target="_blank" rel="noreferrer" className="font-bold text-slate-400 hover:text-white transition">Pexels</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
