import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFDF2] text-black pb-20 pt-10 px-4 md:px-12 max-w-4xl mx-auto relative">
      <div className="flex items-center gap-4 mb-8 border-b border-black/10 pb-6">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-black transition-colors glass p-2 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold font-serif">Termos de Uso</h1>
          <p className="text-slate-500">Última atualização: Junho de 2026</p>
        </div>
      </div>

      <div className="space-y-6 text-black leading-relaxed font-light">
        <section>
          <h2 className="text-xl font-bold mb-3">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar a plataforma Reduca, você concorda em cumprir e estar vinculado a estes Termos de Uso.
            Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. Uso Aceitável</h2>
          <p>Você concorda em usar a plataforma apenas para fins educacionais, colaborativos e legais. É estritamente proibido:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Publicar conteúdo ofensivo, difamatório ou ilegal.</li>
            <li>Assediar, ameaçar ou intimidar outros usuários.</li>
            <li>Violar direitos de propriedade intelectual de terceiros.</li>
            <li>Tentar contornar as medidas de segurança da plataforma.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. Conteúdo do Usuário</h2>
          <p>
            Você mantém todos os direitos sobre o conteúdo que publica na Reduca. No entanto, ao postar, 
            você nos concede uma licença não exclusiva para hospedar, exibir e distribuir seu conteúdo dentro da plataforma.
            A moderação da plataforma reserva-se o direito de remover qualquer conteúdo que viole nossas diretrizes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. Moderação e Contas</h2>
          <p>
            Podemos suspender ou encerrar sua conta a qualquer momento se determinarmos que você violou 
            estes Termos de Uso. Os administradores globais ("Superusuários") têm autoridade final sobre 
            disputas e remoção de conteúdo.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. Limitação de Responsabilidade</h2>
          <p>
            A Reduca é fornecida "como está", sem garantias de qualquer tipo. Não nos responsabilizamos por 
            perdas de dados, interrupções de serviço ou ações de terceiros dentro da rede.
          </p>
        </section>
      </div>
    </div>
  );
}
