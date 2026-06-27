import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Key, Server, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    // Salvar no localStorage
    localStorage.setItem('supabaseUrl', url);
    localStorage.setItem('supabaseAnonKey', key);
    
    // Simular um tempinho para efeito dramático/vibe
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="text-center mb-10 relative z-10">
          <motion.div 
            initial={{ rotate: -10 }} 
            animate={{ rotate: 0 }} 
            className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <Database className="text-white" size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo ao Reduca</h1>
          <p className="text-slate-400">Vamos configurar o seu banco de dados para começar.</p>
        </div>

        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 relative z-10"
          >
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Server size={20} className="text-orange-400" /> 
                1. Crie seu projeto no Supabase
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                O Reduca utiliza o Supabase como Backend as a Service. É gratuito e muito fácil de usar.
              </p>
              <a 
                href="https://supabase.com" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                Acessar Supabase <ArrowRight size={16} />
              </a>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              Já tenho meu projeto <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.form 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSave}
            className="space-y-5 relative z-10"
          >
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 pl-1">
                Project URL
              </label>
              <div className="relative">
                <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 pl-1 flex items-center justify-between">
                <span>Project API Key (anon / public)</span>
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  required
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !url || !key}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-400 hover:to-orange-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Database size={20} />
                  </motion.div>
                ) : (
                  <>
                    Conectar ao Banco <CheckCircle2 size={20} />
                  </>
                )}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Voltar
              </button>
            </div>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}
