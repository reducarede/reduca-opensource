import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { supabase } from '../../supabase';

export default function WidgetAniversarios() {
  const [birthdays, setBirthdays] = useState([]);

  useEffect(() => {
    async function fetchBirthdays() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar, birth_date')
        .not('birth_date', 'is', null);

      if (data) {
        const today = new Date();
        const todayMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const todaysBirthdays = data.filter(user => {
          if (!user.birth_date) return false;
          // user.birth_date format is expected to be YYYY-MM-DD
          const userMonthDay = user.birth_date.substring(5, 10);
          return userMonthDay === todayMonthDay;
        });
        
        setBirthdays(todaysBirthdays);
      }
    }
    fetchBirthdays();
  }, []);

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-5 relative overflow-hidden">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Gift size={16} className="text-pink-500" /> Aniversariantes
      </h3>
      
      {birthdays.length === 0 ? (
        <p className="text-sm text-slate-500 italic">Nenhum aniversariante hoje.</p>
      ) : (
        <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
          {birthdays.map(user => (
            <div key={user.id} className="flex items-center gap-3 bg-pink-500/10 border border-pink-500/20 p-3 rounded-xl cursor-pointer hover:bg-pink-500/20 transition">
              <img src={user.avatar || 'https://placehold.co/150'} alt={user.name} className="w-10 h-10 rounded-full border-2 border-pink-500 object-cover" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-200">{user.name}</h4>
                <p className="text-xs text-pink-400">Fazendo aniversário hoje!</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
