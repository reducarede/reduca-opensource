# Reduca Open Source 🍎
*Uma plataforma educacional moderna, social e plug-and-play.*

Bem-vindo ao repositório Open Source do **Reduca**! Este projeto é um template completo (boilerplate) para criar plataformas educacionais, redes sociais escolares e ambientes de aprendizagem baseados em metodologias ativas.

Desenvolvido com foco em **UI/UX Premium** (Glassmorphism, Dark Mode) e alta performance.

## 🛠 Tech Stack
- **Front-end:** Vite + React
- **Estilização:** TailwindCSS V4, Framer Motion, Lucide React
- **Backend (BaaS):** Supabase (PostgreSQL, Auth, Realtime)
- **Hospedagem:** Preparado para GitHub Pages (via Actions)

---

## 🚀 Como Instalar e Rodar (Setup Wizard)

O Reduca possui um **Instalador Visual Inteligente**. Você não precisa mexer no código para conectar seu banco de dados na primeira vez!

### Passo 1: O Banco de Dados (Supabase)
1. Crie uma conta gratuita em [Supabase](https://supabase.com).
2. Crie um novo projeto.
3. No painel do Supabase, vá em **SQL Editor** e clique em *New Query*.
4. Abra o arquivo `database-schema.sql` (que está na raiz deste repositório), copie todo o texto, cole no SQL Editor do Supabase e clique em **Run**.
   *(Isso criará automaticamente todas as tabelas e regras de segurança necessárias para o sistema funcionar).*

### Passo 2: Rodando o Projeto
1. Clone este repositório no seu computador:
   ```bash
   git clone https://github.com/SEU_USUARIO/reduca-opensource.git
   cd reduca-opensource
   ```
2. Instale as dependências e rode o projeto:
   ```bash
   npm install
   npm run dev
   ```
3. Abra `http://localhost:5173` no seu navegador.
4. **O Setup Wizard vai aparecer!** Ele pedirá a sua `URL` e `Anon Key` do Supabase. Basta colar lá e o sistema conectará automaticamente salvando no seu navegador.

*(Alternativa para Servidor/Produção: Preencha o arquivo `.env` usando o `.env.example` como base).*

---

## ⚙️ Pós-Instalação: Recursos Avançados

O Reduca vem com super-poderes embutidos. Aqui está como ativá-los:

### 👑 1. Como virar Admin (Gerenciar Widgets e Usuários)
1. Crie uma conta normalmente pelo aplicativo.
2. Acesse o seu painel do **Supabase**.
3. Vá no **Table Editor**, abra a tabela `users` (ou `profiles`).
4. Encontre o seu usuário recém-criado e mude a coluna `role` (ou permissão) para `admin`.
5. Recarregue o app e a rota secreta `/admin` estará liberada para você!

### 🤖 2. Inteligência Artificial (Gemini / Groq)
O módulo de IA roda de forma segura no backend usando **Edge Functions** do Supabase.
1. No seu terminal, rode o comando do Supabase CLI para subir a função:
   `supabase functions deploy ai-proxy`
2. No painel do Supabase, adicione a sua chave de API (Gemini ou Groq) nos **Secrets**:
   `supabase secrets set GEMINI_API_KEY=sua_chave_aqui`
*(Pronto! O chat com IA no app passará a funcionar magicamente).*

### 🖼️ 3. Integrações de Mídia (Giphy, Pexels)
No arquivo `.env`, você encontrará espaços para chaves opcionais (`VITE_GIPHY_API_KEY`). Crie contas gratuitas nessas plataformas, cole as chaves no seu `.env` e as buscas por GIFs e imagens no fórum e no chat serão ativadas.

### 📱 4. Gerar o seu próprio Aplicativo Android (.apk)
O Reduca usa **Capacitor** para virar um app nativo. 
1. Atualize o `capacitor.config.json` com o nome da sua escola/projeto.
2. Rode `npm run release` ou utilize o script local `gerar_apk.sh`.
3. Hospede o arquivo `.apk` gerado no seu Google Drive ou servidor e atualize o link de download no componente `Sidebar.jsx` ou na página inicial.

### 🔑 5. Login com Google (OAuth)
O botão de Login com Google já está codificado no sistema, mas você precisa configurá-lo no Supabase:
1. Crie credenciais (OAuth 2.0 Client ID) no **Google Cloud Console**.
2. No painel do seu Supabase, vá em **Authentication > Providers > Google**.
3. Ative o provedor e cole o seu *Client ID* e *Client Secret* do Google.
4. *(Lembre-se de colocar a URL do seu Supabase como Redirect URI lá no Google Cloud!)*

---

## 🌐 Como Publicar (Deploy no GitHub Pages)

O projeto está configurado para ser publicado facilmente no GitHub Pages.

1. No seu repositório do GitHub, vá em **Settings > Secrets and variables > Actions**.
2. Adicione as seguintes *Repository Secrets* com as chaves do seu Supabase para que o build reconheça o banco:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Se for publicar pelo seu terminal, basta rodar `npm run deploy`.

---
📝 **Créditos e História:** Desenvolvido originalmente pelo Prof. Sérgio como a evolução do *Teach&Learn Modernizado*. Focado em emancipação educacional e soberania digital.
