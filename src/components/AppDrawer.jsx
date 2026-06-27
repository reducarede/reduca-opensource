import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid } from 'lucide-react';
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function AppDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [apps, setApps] = useState([]);
  const drawerRef = useRef(null);

  useEffect(() => {
    fetchApps();

    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchApps = async () => {
    const { data } = await supabase.from('ecosystem_apps').select('*').order('created_at', { ascending: true });
    if (data) setApps(data);
  };

  return (
    <div className="relative" ref={drawerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="text-slate-300 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800/50"
        title="Reduca Apps"
      >
        <LayoutGrid size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-4 right-0 md:-right-[70px] w-[320px] bg-[var(--bg-color)] p-4 shadow-2xl z-50 border border-slate-700/50 rounded-2xl transition-colors duration-300 origin-top-right"
          >
            <h3 className="text-sm font-bold text-slate-300 mb-4 px-2">Apps da Reduca</h3>
            
            {apps.length === 0 ? (
              <div className="text-center text-slate-500 text-sm py-6">
                Nenhum app cadastrado ainda.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-[320px] overflow-y-auto no-scrollbar pb-2">
                {apps.map(app => (
                  <a 
                    key={app.id} 
                    href={app.link_web || app.link_apk || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-3 rounded-xl hover:bg-slate-800/60 transition group text-center"
                    title={app.description}
                  >
                    {app.icon_url?.startsWith('http') ? (
                      <img 
                        src={app.icon_url} 
                        alt={app.name} 
                        className="w-12 h-12 rounded-2xl mb-2 object-cover shadow-lg group-hover:scale-110 transition-transform duration-300" 
                        onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=App' }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl mb-2 bg-slate-800 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {app.icon_url}
                      </div>
                    )}
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white truncate w-full">
                      {app.name}
                    </span>
                  </a>
                ))}
              </div>
            )}
            
            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <Link to="/apps" className="text-xs text-orange-500 hover:text-orange-400 font-bold">
                Explorar mais ferramentas
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
