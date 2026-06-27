import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabase';

export default function WidgetCalendario({ currentUser, isAdmin }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventColor, setNewEventColor] = useState('bg-orange-500');

  useEffect(() => {
    fetchEvents();
    const subscription = supabase
      .channel('calendar_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events' }, fetchEvents)
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('calendar_events').select('*');
    if (data && !error) {
      setEvents(data);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEventDate || !newEventTitle) return;
    
    const [year, month, day] = newEventDate.split('-');
    
    await supabase.from('calendar_events').insert({
      day: parseInt(day),
      month: parseInt(month) - 1,
      year: parseInt(year),
      title: newEventTitle,
      color: newEventColor
    });
    
    setNewEventTitle('');
    setNewEventDate('');
    setShowAddForm(false);
  };
  
  const handleDeleteEvent = async (id) => {
    await supabase.from('calendar_events').delete().eq('id', id);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getEventsForDay = (day) => {
    return events.filter(e => e.day === day && e.month === currentDate.getMonth() && e.year === currentDate.getFullYear());
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  // Pega apenas eventos deste mes para a lista embaixo
  const eventsThisMonth = events
    .filter(e => e.month === currentDate.getMonth() && e.year === currentDate.getFullYear())
    .sort((a, b) => a.day - b.day);

  return (
    <div className="glass-card p-5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Calendar size={16} className="text-orange-400" />
          Calendário Escolar
        </h3>
        {isAdmin && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="text-orange-400 hover:text-orange-300 p-1 bg-slate-800/50 rounded-md transition-colors">
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
          </button>
        )}
      </div>

      <div className="relative z-10">
        <AnimatePresence>
          {showAddForm && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddEvent} 
              className="mb-4 space-y-2 overflow-hidden bg-slate-800/50 p-3 rounded-xl border border-slate-700/50"
            >
              <input type="date" required value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="w-full text-xs p-2 rounded-lg glass-input text-slate-200" />
              <input type="text" required placeholder="Título do Evento" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} className="w-full text-xs p-2 rounded-lg glass-input text-slate-200" />
              <div className="flex gap-2">
                {['bg-red-500', 'bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-purple-500'].map(color => (
                  <button key={color} type="button" onClick={() => setNewEventColor(color)} className={`w-6 h-6 rounded-full ${color} ${newEventColor === color ? 'ring-2 ring-slate-800 ring-offset-1' : ''}`} />
                ))}
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold py-2 rounded-lg transition-colors">Adicionar</button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-4 bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
          <button onClick={prevMonth} className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-bold text-slate-200">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-slate-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const todayClass = isToday(day) ? 'bg-orange-500 text-white font-bold ring-2 ring-orange-400/50' : 'text-slate-300 hover:bg-slate-700/50';
            
            return (
              <div 
                key={day} 
                className={`relative flex items-center justify-center p-2 rounded-lg text-xs cursor-pointer transition-colors ${todayClass}`}
              >
                <span className="relative z-10">{day}</span>
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayEvents.map((evt, idx) => (
                      <div key={idx} className={`w-1 h-1 rounded-full ${evt.color}`} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Lista de eventos próximos */}
        <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2 max-h-32 overflow-y-auto pr-1">
          {eventsThisMonth.length === 0 ? (
            <p className="text-xs text-slate-500 text-center">Nenhum evento neste mês.</p>
          ) : (
            eventsThisMonth.map((evt) => (
              <div key={evt.id} className="flex items-center gap-2 text-xs group/event">
                <div className={`w-2 h-2 rounded-full ${evt.color}`} />
                <span className="text-slate-300 flex-1">{evt.title}</span>
                <span className="text-slate-500 font-medium">Dia {evt.day}</span>
                {isAdmin && (
                  <button onClick={() => handleDeleteEvent(evt.id)} className="opacity-0 group-hover/event:opacity-100 text-red-500 hover:text-red-700 p-1 transition-opacity">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
