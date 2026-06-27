import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalMailNotifier({ user }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('emails')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('folder', 'inbox')
        .eq('is_read', false);
      
      setUnreadCount(count || 0);
    };

    fetchUnread();

    // Subscribe to new emails
    const channel = supabase.channel('user_emails_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'emails', 
        filter: `user_id=eq.${user.id}` 
      }, () => {
        fetchUnread(); // Recalculate on any change to user's emails
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Don't show the floating badge if the user is already on the correio page!
  if (location.pathname.startsWith('/correio') || unreadCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ scale: 0, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: 50 }}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[100]"
      >
        <Link to="/correio" className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-full shadow-2xl shadow-orange-500/40 text-white hover:scale-105 transition-transform group border-2 border-slate-900/50">
          <Mail size={24} className="group-hover:animate-bounce" />
          
          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full border border-slate-900 shadow-md">
            {unreadCount > 99 ? '99+' : unreadCount}
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
          </div>

          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-900 text-slate-100 text-xs font-bold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-slate-700/50">
            {unreadCount} {unreadCount === 1 ? 'nova mensagem' : 'novas mensagens'}
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 border-r border-t border-slate-700/50 rotate-45"></div>
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
