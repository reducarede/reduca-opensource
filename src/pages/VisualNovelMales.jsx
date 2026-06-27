import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Volume2, VolumeX, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// STORY DATA - Revolta dos Malês (1835)
const STORY = {
  "start": {
    background: "/images/males_rua_noite.png",
    character: "Narrador",
    text: "Salvador, Bahia. Noite de 24 de Janeiro de 1835. O mês sagrado do Ramadã está chegando ao fim.",
    choices: [
      { text: "Continuar caminhando...", next: "scene_1" }
    ]
  },
  "scene_1": {
    background: "/images/males_rua_noite.png",
    character: "Pensamento",
    text: "As ruas da Cidade Baixa estão abafadas. Sou um jovem de ganho aos olhos deles, mas secretamente sei ler e escrever em árabe. No meu bolso, levo os planos para o levante...",
    choices: [
      { text: "Ler o bilhete de novo", next: "read_note" },
      { text: "Apressar o passo", next: "guards_appear" }
    ]
  },
  "read_note": {
    background: "/images/males_rua_noite.png",
    character: "Bilhete (em árabe)",
    text: "\"Amanhã, nas primeiras horas da manhã, nos levantaremos por nossa liberdade. Juntem-se a nós em nome de Alá.\" ...A revolta vai libertar nosso líder Pacífico Licutan.",
    choices: [
      { text: "Guardar o bilhete e seguir", next: "guards_appear" }
    ]
  },
  "guards_appear": {
    background: "/images/males_guarda.png",
    character: "Guarda Imperial",
    text: "Ei, você aí! Pare! Aonde pensa que vai a essa hora da noite? O que está escondendo nas mãos?",
    choices: [
      { text: "Tentar subornar o guarda", next: "bribe_guard" },
      { text: "Engolir o bilhete rapidamente", next: "swallow_note" },
      { text: "Correr para a viela escura", next: "run_away" }
    ]
  },
  "bribe_guard": {
    background: "/images/males_guarda.png",
    character: "Guarda Imperial",
    text: "(Ele pega as moedas do seu ganho, olha para os lados e guarda). \"Suma daqui antes que eu mude de ideia. E não quero ver sua cara nas ruas!\"",
    choices: [
      { text: "Fugir para o esconderijo", next: "basement_meeting" }
    ]
  },
  "swallow_note": {
    background: "/images/males_guarda.png",
    character: "Fim da Linha",
    text: "O guarda te revista brutalmente, mas não encontra provas. Ele te manda de volta para a senzala. Você sobreviveu, mas a revolta perdeu comunicação vital.",
    isEnd: true,
    success: false
  },
  "run_away": {
    background: "/images/males_rua_noite.png",
    character: "Narrador",
    text: "Você corre com os pés descalços batendo nas pedras. O guarda grita, mas desiste de entrar nos becos escuros do Pelourinho.",
    choices: [
      { text: "Ir para a reunião secreta", next: "basement_meeting" }
    ]
  },
  "basement_meeting": {
    background: "/images/males_porao_reuniao.png",
    character: "Líder Malê",
    text: "Ainda bem que chegou! Vista seu abadá branco. O plano é atacar de manhã... mas espere. Ouvimos passos lá fora!",
    choices: [
      { text: "Olhar pela fresta da porta", next: "betrayal" }
    ]
  },
  "betrayal": {
    background: "/images/males_porao_reuniao.png",
    character: "Ahuna",
    text: "Fomos denunciados! Uma patrulha de soldados chegou à nossa casa aqui na Ladeira da Praça. Eles estão forçando a porta para entrar!",
    choices: [
      { text: "Pegar uma espada e surpreendê-los", next: "fight_patrol" },
      { text: "Fugir pela janela dos fundos", next: "coward_end" }
    ]
  },
  "coward_end": {
    background: "/images/males_rua_noite.png",
    character: "Fim da Linha",
    text: "Você foge no escuro, abandonando seus irmãos. O levante acontece sem você. Sua vida continua nas sombras do medo.",
    isEnd: true,
    success: false
  },
  "fight_patrol": {
    background: "/images/males_batalha_praca.png",
    character: "Narrador",
    text: "Sessenta guerreiros africanos saem de repente, surpreendendo os soldados! Uma pequena batalha acontece na ladeira da Praça.",
    choices: [
      { text: "Marchar para a Câmara Municipal", next: "camara_attack" }
    ]
  },
  "camara_attack": {
    background: "/images/males_camara.png",
    character: "Narrador",
    text: "Vocês chegam à Câmara Municipal para resgatar Pacífico Licutan (Bilal), preso no subsolo por dívidas de seu senhor. Mas somos recebidos por fogo cruzado!",
    choices: [
      { text: "Tentar invadir a prisão sob os tiros", next: "camara_fail" }
    ]
  },
  "camara_fail": {
    background: "/images/males_camara.png",
    character: "Ahuna",
    text: "O ataque falhou! A guarda do palácio do governo reforçou os carcereiros. Precisamos acordar a cidade e juntar forças!",
    choices: [
      { text: "Correr pelas ruas chamando os escravos", next: "rally_slaves" }
    ]
  },
  "rally_slaves": {
    background: "/images/males_batalha_praca.png",
    character: "Narrador",
    text: "Aos gritos de liberdade, vocês correm pela Vitória, Campo Grande e enfrentam fogo cerrado em frente ao Forte de São Pedro, recuando pelas Mercês.",
    choices: [
      { text: "Lutar no Terreiro de Jesus", next: "cidade_baixa" }
    ]
  },
  "cidade_baixa": {
    background: "/images/males_rua_noite.png",
    character: "Guerreiro Nagô",
    text: "Descemos o Pelourinho e o Taboão! Estamos na Cidade Baixa. Precisamos seguir para o Cabrito para encontrar os escravos de engenho!",
    choices: [
      { text: "Avançar para Água de Meninos", next: "agua_de_meninos" }
    ]
  },
  "agua_de_meninos": {
    background: "/images/males_agua_meninos.png",
    character: "Narrador",
    text: "No amanhecer perto do mar, a cavalaria imperial bloqueia o caminho no quartel de Água de Meninos. É a batalha final. Muitos tentam fugir a nado...",
    choices: [
      { text: "Lutar até o fim pela liberdade", next: "final_historical" }
    ]
  },
  "final_historical": {
    background: "/images/males_agua_meninos.png",
    character: "O Legado",
    text: "Mais de 70 rebeldes caíram e a revolta foi vencida nas ruas. Mas o medo de um novo levante se instalou no Império, marcando para sempre a força da resistência negra no Brasil.",
    isEnd: true,
    success: true
  }
};

const TypewriterText = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    setDisplayText('');
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayText(text.slice(0, i + 1));
      i++;
      if (i > text.length) clearInterval(intervalId);
    }, 30);
    return () => clearInterval(intervalId);
  }, [text]);

  return <p className="text-lg md:text-xl text-slate-100 font-medium leading-relaxed">{displayText}</p>;
};

export default function VisualNovelMales() {
  const navigate = useNavigate();
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [history, setHistory] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const currentNode = STORY[currentNodeId];

  const handleChoice = (nextNodeId) => {
    setHistory([...history, currentNodeId]);
    setCurrentNodeId(nextNodeId);
  };

  const restartGame = () => {
    setCurrentNodeId('start');
    setHistory([]);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex flex-col overflow-hidden select-none">
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentNode.background}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${currentNode.background})` }}
        >
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90"></div>
        </motion.div>
      </AnimatePresence>

      {/* Top Navbar */}
      <nav className="absolute top-0 w-full z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-300 hover:text-white transition">
            <ArrowLeft size={24} className="text-orange-500" />
            <span className="font-bold hidden sm:inline text-sm uppercase tracking-wider">Sair do Jogo</span>
          </button>
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-orange-500" />
            <h1 className="text-base sm:text-lg font-bold text-slate-100 uppercase tracking-widest drop-shadow-lg">Malês: A História Esquecida</h1>
          </div>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-slate-300 hover:text-white transition">
            {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </div>
      </nav>

      {/* Main Game Interface */}
      <div className="relative z-10 flex-1 flex flex-col justify-end pb-8 px-4 sm:px-8 max-w-5xl mx-auto w-full">
        
        {/* Dialogue Box */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentNodeId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full glass-card border border-slate-600/50 rounded-2xl p-6 sm:p-8 backdrop-blur-xl bg-black/60 shadow-2xl mb-6 relative"
          >
            {/* Character Name Badge */}
            <div className="absolute -top-5 left-6 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold px-6 py-2 rounded-full text-sm sm:text-base shadow-lg shadow-orange-500/20 border border-orange-400/50 uppercase tracking-wider">
              {currentNode.character}
            </div>

            <div className="min-h-[100px] mt-4">
              {currentNode.isEnd ? (
                <p className="text-lg md:text-xl text-slate-100 font-medium leading-relaxed">{currentNode.text}</p>
              ) : (
                <TypewriterText text={currentNode.text} />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Choices / Actions */}
        <div className="w-full flex flex-col gap-3">
          {currentNode.isEnd ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 w-full">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                onClick={restartGame}
                className={`flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white transition-all transform hover:scale-105 shadow-xl border ${currentNode.success ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 shadow-emerald-500/30' : 'bg-red-600 hover:bg-red-500 border-red-400 shadow-red-500/30'}`}
              >
                {currentNode.success ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
                Jogar Novamente
              </motion.button>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-slate-100 bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 border border-slate-600 shadow-xl transition-all transform hover:scale-105"
              >
                <ArrowLeft size={24} />
                Voltar ao Reduca
              </motion.button>
            </div>
          ) : (
            <AnimatePresence>
              {currentNode.choices.map((choice, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (index * 0.1) }}
                  onClick={() => handleChoice(choice.next)}
                  className="w-full text-left bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-orange-500 text-slate-200 hover:text-orange-400 px-6 py-4 rounded-xl transition-all duration-300 font-medium text-lg hover:pl-8 group shadow-lg flex items-center justify-between"
                >
                  <span>{choice.text}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
