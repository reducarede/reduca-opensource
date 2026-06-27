import WidgetQuemSeguir from './WidgetQuemSeguir';
import WidgetTrending from './WidgetTrending';
import WidgetAniversarios from './WidgetAniversarios';
import WidgetDuvidas from './WidgetDuvidas';
import WidgetRanking from './WidgetRanking';
import WidgetConquistas from './WidgetConquistas';
import WidgetMetas from './WidgetMetas';
import WidgetAtalhos from './WidgetAtalhos';
import WidgetEnquetes from './WidgetEnquetes';
import WidgetChat from './WidgetChat';
import WidgetLinks from './WidgetLinks';
import WidgetArtigos from './WidgetArtigos';
import WidgetCalendario from './WidgetCalendario';
import WidgetAvisos from './WidgetAvisos';
import WidgetTarefas from './WidgetTarefas';
import WidgetNoticias from './WidgetNoticias';
import WidgetIA from './WidgetIA';
import WidgetNewsletter from './WidgetNewsletter';
import WidgetConvite from './WidgetConvite';
import WidgetAudio from './WidgetAudio';
import WidgetBiblioteca from './WidgetBiblioteca';

export const availableWidgets = [
  { id: 'noticias', name: 'Notícias da Escola', description: 'Publique avisos longos e solicite recibos de leitura dos alunos.', component: WidgetNoticias },
  { id: 'tarefas', name: 'Tarefas de Classe', description: 'Crie atividades para os alunos e gerencie as entregas num AVA simples.', component: WidgetTarefas },
  { id: 'avisos', name: 'Mural de Avisos', description: 'Transmite notificações em massa de administradores.', component: WidgetAvisos },
  { id: 'chat', name: 'Chat Global', description: 'Sala de bate-papo em tempo real com todos da plataforma.', component: WidgetChat },
  { id: 'quem-seguir', name: 'Sugestões de Amizade', description: 'Usuários sugeridos para seguir baseados na sua rede.', component: WidgetQuemSeguir },
  { id: 'trending', name: 'Tópicos em Alta', description: 'As disciplinas e hashtags mais discutidas no momento.', component: WidgetTrending },
  { id: 'aniversarios', name: 'Aniversariantes', description: 'Veja quais colegas estão apagando as velinhas hoje.', component: WidgetAniversarios },
  { id: 'duvidas', name: 'Mural de Dúvidas', description: 'Perguntas de alunos e colegas esperando por uma resposta.', component: WidgetDuvidas },
  { id: 'ranking', name: 'Ranking de Vibe', description: 'Placar de líderes com os professores mais ativos da semana.', component: WidgetRanking },
  { id: 'conquistas', name: 'Seus Selos', description: 'Quadro das suas conquistas e medalhas pedagógicas.', component: WidgetConquistas },
  { id: 'metas', name: 'Meta Diária', description: 'Barra de progresso das suas interações para criar hábitos.', component: WidgetMetas },
  { id: 'atalhos', name: 'Atalhos Rápidos', description: 'Botões de ação rápida para criar conteúdos e turmas.', component: WidgetAtalhos },
  { id: 'enquetes', name: 'Enquetes Rápidas', description: 'Participe da pesquisa rápida do dia da comunidade.', component: WidgetEnquetes },
  { id: 'links', name: 'Links Úteis', description: 'Repositório de links úteis da escola ou disciplina.', component: WidgetLinks },
  { id: 'artigos', name: 'Últimos Artigos', description: 'Mostra os textos e publicações longas mais recentes do Blog.', component: WidgetArtigos },
  { id: 'calendario', name: 'Calendário Escolar', description: 'Fique de olho nas próximas datas importantes.', component: WidgetCalendario },
  { id: 'assistente-ia', name: 'Assistente IA (Reduca)', description: 'Chatbot inteligente com IA para tirar dúvidas e planejar aulas.', component: WidgetIA },
  { id: 'newsletter', name: 'Coleta de Contatos', description: 'Formulário para coletar WhatsApp de usuários para mala direta e newsletter.', component: WidgetNewsletter },
  { id: 'convite-whatsapp', name: 'Convite via WhatsApp', description: 'Botão para enviar o link da Reduca para os amigos via WhatsApp.', component: WidgetConvite },
  { id: 'audio-player', name: 'Player de Áudio / Podcast', description: 'Permite ao Admin adicionar um link MP3 para tocar direto no painel.', component: WidgetAudio },
  { id: 'biblioteca', name: 'Biblioteca Virtual', description: 'Espaço para o Admin disponibilizar links de PDFs, Documentos e Pastas do Drive.', component: WidgetBiblioteca },
];
