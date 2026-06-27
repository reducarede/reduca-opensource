import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Gamepad2, RotateCcw, Trophy, Frown, Lightbulb } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const WORDS = [
  { word: "PEDAGOGIA", tip: "Ciência ou disciplina que trata da educação." },
  { word: "DIDATICA", tip: "Arte de transmitir conhecimentos; técnica de ensinar." },
  { word: "APRENDIZADO", tip: "Ato ou efeito de adquirir conhecimento." },
  { word: "CONHECIMENTO", tip: "Informação e saber acumulados através da experiência." },
  { word: "LEITURA", tip: "Ação de decifrar e interpretar signos escritos." },
  { word: "PROFESSOR", tip: "Aquele que professa uma ciência ou arte; docente." },
  { word: "ALUNO", tip: "Pessoa que recebe instrução ou educação." },
  { word: "DISCIPLINA", tip: "Regime de ordem imposta ou consentida; matéria de estudo." },
  { word: "AVALIACAO", tip: "Ato de estimar o valor ou aprendizado." },
  { word: "METODOLOGIA", tip: "Conjunto de métodos e técnicas aplicados." },
  { word: "INCLUSAO", tip: "Ato de inserir todos no processo educacional." },
  { word: "CIDADANIA", tip: "Exercício dos direitos e deveres civis." },
  { word: "CURRICULO", tip: "Plano de estudos de uma escola ou curso." },
  { word: "HISTORIA", tip: "Ciência que estuda eventos passados da humanidade." },
  { word: "CIENCIA", tip: "Conjunto de conhecimentos baseados em observação e experimentação." }
];

const MAX_MISTAKES = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

export default function JogoForca() {
  const navigate = useNavigate();
  const [currentWordObj, setCurrentWordObj] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [status, setStatus] = useState('playing'); // playing, won, lost
  const [showTip, setShowTip] = useState(false);

  const startNewGame = () => {
    const randomObj = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWordObj(randomObj);
    setGuessedLetters([]);
    setMistakes(0);
    setStatus('playing');
    setShowTip(false);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const handleGuess = (letter) => {
    if (status !== 'playing' || guessedLetters.includes(letter)) return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (!currentWordObj.word.includes(letter)) {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= MAX_MISTAKES) {
        setStatus('lost');
      }
    } else {
      const isWon = currentWordObj.word.split('').every(char => newGuessedLetters.includes(char));
      if (isWon) {
        setStatus('won');
      }
    }
  };

  if (!currentWordObj) return null;

  const currentWord = currentWordObj.word;

  return (
    <div className="min-h-screen bg-[var(--bg-color)] pb-20 overflow-x-hidden flex flex-col items-center">
      <nav className="w-full sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition">
            <ArrowLeft size={24} className="text-orange-500" />
            <span className="font-bold hidden sm:inline">Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            <Gamepad2 size={24} className="text-orange-500" />
            <h1 className="text-xl font-bold text-slate-200">Palavra Secreta</h1>
          </div>
          <div className="w-8 sm:w-24"></div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-4xl px-4 py-8 flex flex-col items-center">
        {/* Header / Info */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600 mb-2">
            Desafio Educacional
          </h2>
          <p className="text-slate-400 text-sm md:text-base">Descubra a palavra relacionada ao mundo da educação.</p>
        </div>

        {/* Tip Section */}
        <div className="mb-6 w-full max-w-lg min-h-[60px] flex justify-center">
          {!showTip ? (
            <button 
              onClick={() => setShowTip(true)}
              className="mx-auto flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20 h-fit"
            >
              <Lightbulb size={16} /> Revelar Dica
            </button>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 glass-card border border-amber-500/30 text-center rounded-xl relative overflow-hidden w-full shadow-lg"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
              <p className="text-sm md:text-base text-slate-200 font-medium italic">"{currentWordObj.tip}"</p>
            </motion.div>
          )}
        </div>

        {/* Status Area */}
        <div className="mb-8 flex justify-center w-full">
          <div className="relative w-full max-w-xs p-6 glass-card border-slate-700/50 flex flex-col items-center justify-center rounded-2xl bg-slate-900/50">
            <div className="absolute top-3 right-4 font-mono font-bold text-lg text-slate-500">
              {mistakes}/{MAX_MISTAKES}
            </div>
            {status === 'playing' ? (
              <div className="text-center w-full">
                <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-bold">Tentativas Restantes</p>
                <div className="flex gap-2 justify-center">
                  {[...Array(MAX_MISTAKES)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${i < mistakes ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]' : 'bg-slate-700/50'}`}></div>
                  ))}
                </div>
              </div>
            ) : status === 'won' ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500 flex flex-col items-center">
                <Trophy size={48} className="mb-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <span className="font-bold uppercase text-lg">Você Venceu!</span>
              </motion.div>
            ) : (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-500 flex flex-col items-center">
                <Frown size={48} className="mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                <span className="font-bold uppercase text-lg">Fim de Jogo!</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* The Word */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12 w-full max-w-2xl">
          <AnimatePresence>
            {currentWord.split('').map((letter, index) => {
              const isRevealed = guessedLetters.includes(letter) || status === 'lost';
              const isMissed = status === 'lost' && !guessedLetters.includes(letter);
              
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    w-10 h-12 md:w-14 md:h-16 flex items-center justify-center text-2xl md:text-3xl font-bold rounded-lg border-b-4 
                    ${isRevealed ? 'bg-slate-800/80 border-orange-500 text-white shadow-lg' : 'bg-slate-900/40 border-slate-700 text-transparent'}
                    ${isMissed ? 'text-red-500 opacity-60' : ''}
                    transition-all duration-300
                  `}
                >
                  {isRevealed ? letter : ''}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Keyboard */}
        <div className="w-full max-w-2xl glass-card p-4 md:p-6 rounded-3xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-md">
          <div className="flex flex-wrap justify-center gap-2">
            {ALPHABET.map(letter => {
              const isGuessed = guessedLetters.includes(letter);
              const isCorrect = isGuessed && currentWord.includes(letter);
              const isWrong = isGuessed && !currentWord.includes(letter);

              let btnClass = "w-10 h-10 md:w-12 md:h-12 rounded-xl font-bold text-lg md:text-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 ";
              
              if (!isGuessed) {
                btnClass += "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:-translate-y-1 shadow-md border border-slate-700/50";
              } else if (isCorrect) {
                btnClass += "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
              } else if (isWrong) {
                btnClass += "bg-red-500/10 text-red-500/50 border border-red-500/20 opacity-50";
              }

              return (
                <button
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={isGuessed || status !== 'playing'}
                  className={btnClass}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <AnimatePresence>
          {status !== 'playing' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <button 
                onClick={startNewGame}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:scale-105"
              >
                <RotateCcw size={20} />
                Jogar Novamente
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
