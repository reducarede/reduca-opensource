import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, BookOpen, GraduationCap, Users, X, ChevronRight, ChevronLeft } from 'lucide-react';

const slides = [
  {
    id: 'welcome',
    icon: <Rocket className="w-12 h-12 text-orange-500 mb-4" />,
    title: 'Bem-vindo ao Reduca!',
    description: 'A sua nova comunidade educacional. Um ecossistema vivo onde o aprendizado acontece de forma fluida, interativa e segura.',
    color: 'from-orange-500/20 to-orange-600/5'
  },
  {
    id: 'teachers',
    icon: <BookOpen className="w-12 h-12 text-blue-500 mb-4" />,
    title: 'Para Professores',
    description: 'Seu centro de comando! Crie turmas, compartilhe conteúdos, adicione vídeos e audiobooks através dos widgets e poste notícias no feed.',
    color: 'from-blue-500/20 to-blue-600/5'
  },
  {
    id: 'students',
    icon: <GraduationCap className="w-12 h-12 text-emerald-500 mb-4" />,
    title: 'Para Estudantes',
    description: 'Conhecimento na palma da mão! Acompanhe o feed da sua turma, ouça audiobooks, participe dos grupos sociais de estudo e tire dúvidas no Mural.',
    color: 'from-emerald-500/20 to-emerald-600/5'
  },
  {
    id: 'community',
    icon: <Users className="w-12 h-12 text-purple-500 mb-4" />,
    title: 'Para a Comunidade',
    description: 'Acompanhe as novidades da escola! Fique por dentro de eventos e projetos através do blog de Notícias e interaja no Mural.',
    color: 'from-purple-500/20 to-purple-600/5'
  }
];

export default function OnboardingModal({ session }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    // Check if user is logged in and hasn't seen the onboarding yet
    if (session) {
      const hasSeen = localStorage.getItem('reduca_onboarding_seen');
      if (!hasSeen) {
        setIsVisible(true);
      }
    }
  }, [session]);

  if (!isVisible || !session) return null;

  const dismiss = () => {
    localStorage.setItem('reduca_onboarding_seen', 'true');
    setIsVisible(false);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    } else {
      dismiss();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  };

  const variants = {
    enter: (direction) => {
      return {
        x: direction > 0 ? 100 : -100,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 100 : -100,
        opacity: 0
      };
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg glass-card rounded-3xl overflow-hidden relative flex flex-col"
      >
        {/* Close button */}
        <button 
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-slate-50 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="relative h-64 sm:h-72 w-full overflow-hidden flex items-center justify-center p-8">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
            >
              {/* Background gradient blob for aesthetic */}
              <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].color} opacity-30`} />
              
              <div className="relative z-10 flex flex-col items-center">
                <motion.div 
                  initial={{ scale: 0, rotate: -10 }} 
                  animate={{ scale: 1, rotate: 0 }} 
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  {slides[currentSlide].icon}
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-50 mb-3">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
                  {slides[currentSlide].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Controls */}
        <div className="p-6 bg-slate-900/30 border-t border-white/10 flex items-center justify-between">
          
          {/* Dots Indicator */}
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 bg-orange-500' : 'w-2 bg-slate-600'}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {currentSlide > 0 && (
              <button 
                onClick={prevSlide}
                className="p-3 rounded-xl font-semibold text-slate-400 bg-slate-800/50 hover:bg-slate-700/50 hover:text-slate-50 transition-colors flex items-center"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <button 
              onClick={nextSlide}
              className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2"
            >
              {currentSlide === slides.length - 1 ? 'Começar' : 'Próximo'}
              {currentSlide !== slides.length - 1 && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
