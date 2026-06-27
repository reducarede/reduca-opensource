import React, { useState } from 'react';
import { supabase } from '../supabase';
import { UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data.user) {
          // Add profile to our profiles table
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: email,
            name: name || email.split('@')[0],
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            birth_date: birthDate || null,
            location: location || null,
            role: role || null
          });
          
          alert("Conta criada com sucesso! 🎉\nVerifique a sua caixa de e-mail para confirmar o cadastro.");
          setIsLogin(true); // Switch to login tab
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname.replace('/login', '')
        }
      });
      if (error) throw error;
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex overflow-hidden">
      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="https://con3ktar.nekoweb.org/23087-333074572comp2.mp4" type="video/mp4" />
      </video>
      
      {/* Dark Overlay for better contrast over the video */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-0"></div>

      <div className="relative z-10 w-full flex flex-col md:flex-row min-h-screen">
        
        {/* Left Side: Branding */}
        <div className="flex-1 flex flex-col justify-center items-start p-8 md:p-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-7xl md:text-9xl font-serif font-black tracking-tighter text-white mb-6 drop-shadow-2xl">
              Reduca
            </h1>
            <p className="text-xl md:text-3xl font-light tracking-wide max-w-lg text-white/90 drop-shadow-lg leading-relaxed">
              Onde a educação e o futuro se conectam.
            </p>
          </motion.div>
        </div>

        {/* Right Side: Login Modal */}
        <div className="w-full md:w-[500px] flex flex-col justify-center p-8 md:p-12 bg-slate-950/80 backdrop-blur-2xl border-l border-slate-700/50 shadow-2xl transition-colors duration-300">
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-sm mx-auto"
          >
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold text-slate-50 mb-2">{isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
              <p className="text-slate-400">{isLogin ? 'Entre para continuar na plataforma' : 'Junte-se à nova geração do ensino'}</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden">
                    <input 
                      type="text" placeholder="Nome Completo / Como devemos te chamar?" value={name} onChange={e => setName(e.target.value)}
                      className="glass-input w-full py-3.5" required={!isLogin}
                    />
                    <div className="relative">
                      <label className="text-xs text-slate-400 mb-1 ml-2 block">Data de Nascimento</label>
                      <input 
                        type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                        className="glass-input w-full py-3.5 text-slate-400" required={!isLogin}
                      />
                    </div>
                    <input 
                      type="text" placeholder="Localidade (Cidade/UF)" value={location} onChange={e => setLocation(e.target.value)}
                      className="glass-input w-full py-3.5" required={!isLogin}
                    />
                    <input 
                      type="text" placeholder="Cargo (Ex: Professor de História)" value={role} onChange={e => setRole(e.target.value)}
                      className="glass-input w-full py-3.5" required={!isLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <input 
                type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)}
                className="glass-input w-full py-3.5" required
              />
              <input 
                type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}
                className="glass-input w-full py-3.5" required minLength="6"
              />

              <button disabled={loading} type="submit" className="w-full bg-slate-50 hover:bg-slate-200 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 mt-8">
                {loading ? 'Processando...' : isLogin ? <><LogIn size={20}/> Entrar agora</> : <><UserPlus size={20}/> Concluir cadastro</>}
              </button>
            </form>

            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-slate-400">Ou continue com</span>
              </div>
            </div>

            <button 
              onClick={handleGoogleLogin} 
              disabled={loading}
              className="mt-6 w-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-50 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-3 backdrop-blur-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>

            <div className="mt-8 text-center md:text-left">
              <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-slate-400 hover:text-slate-50 transition-colors">
                {isLogin ? "Primeira vez aqui? Crie uma conta grátis." : "Já tem uma conta? Faça login."}
              </button>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-700/50 text-xs text-slate-500 flex justify-center md:justify-start gap-4">
              <Link to="/terms" className="hover:text-slate-50 transition-colors">Termos de Uso</Link>
              <Link to="/privacy" className="hover:text-slate-50 transition-colors">Privacidade</Link>
              <span className="ml-auto">&copy; {new Date().getFullYear()} Reduca</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
