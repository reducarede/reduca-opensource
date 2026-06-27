import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAppStore } from '../hooks/useAppStore';
import { Compose } from '../components/Compose/Compose';
import { CorreioSidebar } from '../components/CorreioSidebar';
import { EmailList } from '../components/EmailList/EmailList';
import { EmailDetail } from '../components/EmailDetail/EmailDetail';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Correio({ user }) {
  const { isComposeOpen, selectedEmail } = useAppStore();
  const [reducaEmail, setReducaEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aliasInput, setAliasInput] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.from('profiles').select('reduca_email').eq('id', user.id).single();
      if (data?.reduca_email) {
        setReducaEmail(data.reduca_email);
      }
      setLoading(false);
    }
    loadProfile();
  }, [user.id]);

  const handleCreateEmail = async (e) => {
    e.preventDefault();
    if (!aliasInput || aliasInput.length < 3) return alert('O e-mail deve ter pelo menos 3 letras.');
    
    const fullEmail = `${aliasInput.toLowerCase().replace(/[^a-z0-9_]/g, '')}@reduca.net`;
    
    // Check if taken
    const { data: existing } = await supabase.from('profiles').select('id').eq('reduca_email', fullEmail).maybeSingle();
    if (existing) {
      return alert('Este e-mail já está sendo usado por outro membro!');
    }

    const { error } = await supabase.from('profiles').update({ reduca_email: fullEmail }).eq('id', user.id);
    if (error) {
      alert('Erro ao criar e-mail: ' + error.message);
    } else {
      setReducaEmail(fullEmail);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando correio...</div>;

  if (!reducaEmail) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="w-16 h-16 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-2">Seu E-mail Reduca</h2>
          <p className="text-slate-400 text-center mb-6">
            Crie seu endereço oficial para trocar mensagens seguras com outros membros da rede.
          </p>

          <form onSubmit={handleCreateEmail} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300">Escolha seu nome de usuário</label>
              <div className="flex items-center mt-1">
                <input
                  type="text"
                  required
                  value={aliasInput}
                  onChange={e => setAliasInput(e.target.value)}
                  placeholder="joao.silva"
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-l-xl px-4 py-3 outline-none focus:border-orange-500"
                />
                <span className="bg-slate-800 border border-l-0 border-slate-800 text-slate-400 rounded-r-xl px-4 py-3 font-medium">
                  @reduca.net
                </span>
              </div>
            </div>
            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors">
              Ativar E-mail
            </button>
            <div className="text-center mt-4">
              <Link to="/" className="text-sm text-slate-500 hover:text-slate-300">Voltar para Início</Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden text-slate-200 font-sans">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 z-10">
        <Link to="/" className="text-slate-400 flex items-center gap-2 text-sm"><ArrowLeft className="w-4 h-4"/> Reduca</Link>
        <span className="font-medium text-sm text-orange-500">{reducaEmail}</span>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4">
        <Link to="/" className="text-slate-400 flex items-center gap-2 text-sm mb-6 hover:text-white"><ArrowLeft className="w-4 h-4"/> Voltar ao Reduca</Link>
        <CorreioSidebar />
      </div>

      <main className="flex-1 flex flex-col md:flex-row min-w-0 bg-slate-950">
        <div className={`flex-1 border-r border-slate-800 overflow-hidden ${selectedEmail ? 'hidden md:flex' : 'flex'}`}>
          <EmailList />
        </div>
        
        <div className={`flex-1 bg-slate-900 overflow-hidden ${!selectedEmail ? 'hidden md:flex md:flex-[1.5]' : 'flex'}`}>
          <EmailDetail />
        </div>
      </main>

      {/* Mobile navigation bar */}
      <div className="md:hidden w-full border-t border-slate-800 bg-slate-900 overflow-x-auto">
        <div className="flex p-2 gap-2 min-w-max">
           <CorreioSidebar />
        </div>
      </div>

      {isComposeOpen && <Compose />}
    </div>
  );
}
