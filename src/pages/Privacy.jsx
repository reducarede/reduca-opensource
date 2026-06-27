import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFDF2] text-black pb-20 pt-10 px-4 md:px-12 max-w-4xl mx-auto relative">
      <div className="flex items-center gap-4 mb-8 border-b border-black/10 pb-6">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-black transition-colors glass p-2 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold font-serif">Política de Privacidade</h1>
          <p className="text-slate-500">Última atualização: Junho de 2026</p>
        </div>
      </div>

      <div className="space-y-6 text-black leading-relaxed font-light">
        <section>
          <h2 className="text-xl font-bold mb-3">1. Coleta de Dados</h2>
          <p>
            Coletamos as informações que você nos fornece diretamente, como seu nome, endereço de e-mail 
            e o conteúdo que você cria ou compartilha (posts, comentários, widgets) ao utilizar a Reduca.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. Uso das Informações</h2>
          <p>Utilizamos suas informações para:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Fornecer, manter e melhorar nossos serviços.</li>
            <li>Autenticar seu acesso à plataforma.</li>
            <li>Personalizar sua experiência e os widgets exibidos.</li>
            <li>Comunicar atualizações importantes e avisos de segurança.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. Compartilhamento de Dados</h2>
          <p>
            Seu perfil básico (nome e avatar) e o conteúdo público que você posta são visíveis para outros 
            usuários da plataforma. Não vendemos suas informações pessoais para anunciantes ou terceiros.
            As informações de banco de dados são armazenadas com segurança através da infraestrutura Supabase.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. Segurança</h2>
          <p>
            Implementamos medidas técnicas para proteger suas informações contra acesso não autorizado.
            No entanto, nenhum sistema de transmissão de dados pela internet é 100% seguro, e não 
            podemos garantir a segurança absoluta das suas informações.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. Seus Direitos</h2>
          <p>
            Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento.
            Pode realizar essas ações diretamente pelas configurações do seu perfil na plataforma.
          </p>
        </section>
      </div>
    </div>
  );
}
