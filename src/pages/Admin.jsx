import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ShieldAlert, ArrowLeft, Plus, Trash2, Users, LayoutDashboard, Settings, UserCheck, UserX, BadgeCheck, Star, X, Download, Mail } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Admin({ user }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('usuarios'); // usuarios, widgets, configuracoes
  
  // Dados
  const [globalWidgets, setGlobalWidgets] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [ecosystemApps, setEcosystemApps] = useState([]);
  const [leads, setLeads] = useState([]);
  const [showAppModal, setShowAppModal] = useState(false);
  const [newApp, setNewApp] = useState({ name: '', description: '', icon_url: '', link_web: '', link_apk: '', link_desktop: '' });

  // Modal de Widgets
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [newWidget, setNewWidget] = useState({ title: '', description: '', url: '' });

  // Modal de Selos
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBadges, setUserBadges] = useState([]);

  const availableBadges = [
    { id: 'vibe_coder', name: 'Vibe Coder', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { id: 'top_mentor', name: 'Top Mentor', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { id: 'professor', name: 'Professor', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { id: 'aluno_destaque', name: 'Aluno Destaque', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { id: 'gestor', name: 'Gestor', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
  ];

  const fetchGlobalWidgets = async () => {
    const { data } = await supabase.from('custom_widgets').select('*').eq('user_id', user.id);
    if (data) setGlobalWidgets(data);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('name');
    if (data) setUsersList(data);
  };

  const fetchEcosystemApps = async () => {
    const { data } = await supabase.from('ecosystem_apps').select('*').order('created_at', { ascending: true });
    if (data) setEcosystemApps(data);
  };

  const fetchLeads = async () => {
    const { data } = await supabase.from('marketing_leads').select('*').order('created_at', { ascending: false });
    if (data) setLeads(data);
  };

  useEffect(() => {
    // Check if user is admin
    supabase.from('profiles').select('is_admin').eq('id', user.id).single().then(({ data }) => {
      if (data && data.is_admin) {
        setIsAdmin(true);
        fetchGlobalWidgets();
        fetchUsers();
        fetchEcosystemApps();
        fetchLeads();
      }
      setLoading(false);
    });
  }, [user.id]);

  const handleCreateApp = async (e) => {
    e.preventDefault();
    if(!newApp.name || !newApp.icon_url) return;
    
    const { error } = await supabase.from('ecosystem_apps').insert({
      name: newApp.name,
      description: newApp.description,
      icon_url: newApp.icon_url,
      link_web: newApp.link_web,
      link_apk: newApp.link_apk,
      link_desktop: newApp.link_desktop
    });
    if(error) {
      alert("Erro! Verifique se rodou o comando SQL para criar a tabela ecosystem_apps.");
    } else {
      setShowAppModal(false);
      setNewApp({ name: '', description: '', icon_url: '', link_web: '', link_apk: '', link_desktop: '' });
      fetchEcosystemApps();
    }
  };

  const handleDeleteApp = async (appId) => {
    if(window.confirm("Remover este App do ecossistema?")) {
      await supabase.from('ecosystem_apps').delete().eq('id', appId);
      fetchEcosystemApps();
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['FIRSTNAME;EMAIL;WHATSAPP;DATE'];
    const rows = leads.map(l => `${l.name || ''};${l.email || ''};${l.whatsapp || ''};${l.created_at ? new Date(l.created_at).toLocaleDateString() : ''}`);
    const csvContent = headers.concat(rows).join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "reduca_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportUsersCSV = () => {
    if (usersList.length === 0) return;
    const headers = ['FIRSTNAME;EMAIL;STATUS;DATE'];
    const rows = usersList.map(u => `${u.name || ''};${u.email || ''};${u.is_admin ? 'Admin' : 'Membro'};${u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}`);
    const csvContent = headers.concat(rows).join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "reduca_todos_usuarios.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleVerifiedStatus = async (userId, currentStatus) => {
    if(window.confirm(`Deseja ${currentStatus ? 'REMOVER' : 'CONCEDER'} o selo de Verificado para este usuário?`)) {
      const { error } = await supabase.from('profiles').update({ is_verified: !currentStatus }).eq('id', userId);
      
      if(error) {
        alert("Erro ao atualizar! Certifique-se de ter adicionado a coluna 'is_verified' e configurado a Política RLS.");
      } else {
        fetchUsers();
      }
    }
  };

  const openBadgeModal = (u) => {
    setSelectedUser(u);
    setUserBadges(u.badges || []);
    setShowBadgeModal(true);
  };

  const toggleBadge = (badgeId) => {
    if (userBadges.includes(badgeId)) {
      setUserBadges(userBadges.filter(b => b !== badgeId));
    } else {
      setUserBadges([...userBadges, badgeId]);
    }
  };

  const handleSaveBadges = async () => {
    const { error } = await supabase.from('profiles').update({ badges: userBadges }).eq('id', selectedUser.id);
    if(error) {
      alert("Erro ao salvar selos! Você rodou o SQL para adicionar a coluna badges?");
    } else {
      setShowBadgeModal(false);
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === user.id) {
      alert("Ação negada: Você não pode excluir sua própria conta administrativa.");
      return;
    }
    if (window.confirm(`ATENÇÃO: Você tem certeza que deseja EXCLUIR o usuário "${userName}"? \n\nIsso apagará o perfil dele permanentemente. Se houver publicações vinculadas e não houver exclusão em cascata configurada no banco, pode dar erro de restrição (RLS).`)) {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) {
        alert("Erro ao excluir usuário: " + error.message);
      } else {
        fetchUsers();
      }
    }
  };

  const handleCreateWidget = async (e) => {
    e.preventDefault();
    if(!newWidget.title || !newWidget.url) return;
    
    const widgetData = {
      user_id: user.id,
      title: newWidget.title,
      description: newWidget.description,
      url: newWidget.url
    };
    
    const { error } = await supabase.from('custom_widgets').insert(widgetData);
    if(error) {
      alert(error.message);
    } else {
      setShowWidgetModal(false);
      setNewWidget({ title: '', description: '', url: '' });
      fetchGlobalWidgets();
    }
  };

  const handleDeleteWidget = async (widgetId) => {
    if(window.confirm("Remover este widget para todos os usuários?")) {
      await supabase.from('custom_widgets').delete().eq('id', widgetId);
      fetchGlobalWidgets();
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-orange-500 font-bold">Verificando credenciais...</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-4">
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-50 mb-2">Acesso Restrito</h1>
        <p className="text-slate-400 mb-6">Você não tem permissão de Superusuário para acessar esta área.</p>
        <button onClick={() => navigate('/')} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-full font-bold">Voltar ao Início</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 pt-8">
      <main className="max-w-5xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Voltar</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2 text-orange-500 font-bold bg-orange-500/10 px-4 py-2 rounded-lg">
              <ShieldAlert size={20} />
              Área do Administrador
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700/50 mb-8 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('usuarios')} 
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'usuarios' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'}`}
          >
            <Users size={18} /> Gerenciar Usuários
          </button>
          <button 
            onClick={() => setActiveTab('widgets')} 
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'widgets' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'}`}
          >
            <LayoutDashboard size={18} /> Widgets Globais
          </button>
          <button 
            onClick={() => setActiveTab('arsenal')} 
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'arsenal' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'}`}
          >
            <LayoutDashboard size={18} /> Arsenal de Apps
          </button>
          <button 
            onClick={() => setActiveTab('leads')} 
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'leads' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'}`}
          >
            <Mail size={18} /> Contatos (Leads)
          </button>
        </div>

        {/* Tab: Usuários */}
        {activeTab === 'usuarios' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-50">Usuários Cadastrados ({usersList.length})</h2>
              <button 
                onClick={handleExportUsersCSV}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-indigo-600/20"
              >
                <Download size={18} />
                Exportar E-mails CSV
              </button>
            </div>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/50 border-b border-slate-700/50">
                      <th className="p-4 font-medium text-slate-300">Usuário</th>
                      <th className="p-4 font-medium text-slate-300">Email</th>
                      <th className="p-4 font-medium text-slate-300">Cargo</th>
                      <th className="p-4 font-medium text-slate-300 text-center">Status</th>
                      <th className="p-4 font-medium text-slate-300 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar || 'https://placehold.co/100'} alt="" className="w-10 h-10 rounded-full border border-slate-600" />
                            <div>
                              <p className="font-bold text-slate-200">{u.name}</p>
                              <p className="text-xs text-slate-500">ID: {u.id.substring(0,8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-400">{u.email}</td>
                        <td className="p-4 text-sm text-slate-400">{u.role || 'Membro'}</td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {u.is_verified ? (
                              <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full">
                                <BadgeCheck size={14} className="fill-blue-500 text-white" /> Verificado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">
                                <UserCheck size={12} /> Comum
                              </span>
                            )}
                            {u.badges && u.badges.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1 justify-center max-w-[120px]">
                                {u.badges.map(bId => {
                                  const badge = availableBadges.find(b => b.id === bId);
                                  return badge ? (
                                    <span key={bId} className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.color}`}>
                                      {badge.name}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => toggleVerifiedStatus(u.id, u.is_verified)}
                              className={`p-2 rounded-lg transition-colors ${u.is_verified ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'}`}
                              title={u.is_verified ? "Remover Verificado" : "Dar Selo de Verificado"}
                            >
                              {u.is_verified ? <UserX size={18} /> : <BadgeCheck size={18} />}
                            </button>
                            <button 
                              onClick={() => openBadgeModal(u)}
                              className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                              title="Gerenciar Selos Especiais"
                            >
                              <Star size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Excluir Usuário"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Selos */}
        {showBadgeModal && selectedUser && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-md p-6 relative">
              <button onClick={() => setShowBadgeModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
              
              <h2 className="text-xl font-bold text-slate-50 mb-2 flex items-center gap-2">
                <Star size={20} className="text-purple-500" />
                Gerenciar Selos
              </h2>
              <p className="text-sm text-slate-400 mb-6">Selecione os selos para <strong>{selectedUser.name}</strong></p>
              
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {availableBadges.map(badge => {
                  const hasBadge = userBadges.includes(badge.id);
                  return (
                    <div 
                      key={badge.id}
                      onClick={() => toggleBadge(badge.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        hasBadge ? 'bg-slate-800 border-purple-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${badge.color}`}>
                          <Star size={14} />
                        </div>
                        <span className={`font-medium ${hasBadge ? 'text-white' : 'text-slate-400'}`}>{badge.name}</span>
                      </div>
                      {hasBadge && <BadgeCheck size={18} className="text-purple-500" />}
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={handleSaveBadges}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition"
              >
                Salvar Selos
              </button>
            </div>
          </div>
        )}

        {/* Tab: Widgets */}
        {activeTab === 'widgets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-50">Widgets Globais (Personalizados)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {globalWidgets.map(widget => (
                <div key={widget.id} className="glass-card p-5 relative group">
                  <button 
                    onClick={() => handleDeleteWidget(widget.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </button>
                  <h3 className="font-bold text-lg mb-2 text-slate-50">{widget.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{widget.description}</p>
                  <a href={widget.url} target="_blank" rel="noopener noreferrer" className="text-orange-400 text-sm hover:underline">Acessar Link</a>
                </div>
              ))}
              
              <div 
                onClick={() => setShowWidgetModal(true)}
                className="glass-card p-5 flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed border-slate-700 hover:border-orange-500/50 cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 bg-slate-800 group-hover:bg-orange-500/20 rounded-full flex items-center justify-center text-slate-400 group-hover:text-orange-400 mb-2 transition-colors">
                  <Plus size={24} />
                </div>
                <span className="font-medium text-slate-300">Novo Widget HTML</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Novo Widget */}
        {showWidgetModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-slate-50 mb-6 flex items-center gap-2">
                <Plus size={20} className="text-orange-500" />
                Adicionar Novo Widget
              </h2>
              <form onSubmit={handleCreateWidget} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Título</label>
                  <input 
                    type="text" required
                    value={newWidget.title} onChange={e => setNewWidget({...newWidget, title: e.target.value})}
                    className="w-full glass-input"
                    placeholder="Ex: Diário Escolar Oficial"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">URL / Link</label>
                  <input 
                    type="url" required
                    value={newWidget.url} onChange={e => setNewWidget({...newWidget, url: e.target.value})}
                    className="w-full glass-input"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Descrição Curta</label>
                  <input 
                    type="text" 
                    value={newWidget.description} onChange={e => setNewWidget({...newWidget, description: e.target.value})}
                    className="w-full glass-input"
                    placeholder="Link oficial para os professores..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowWidgetModal(false)} className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-50 font-medium rounded-xl transition">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition">
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab: Arsenal de Apps */}
        {activeTab === 'arsenal' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-50">Arsenal de Apps (Menu Google)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ecosystemApps.map(app => (
                <div key={app.id} className="glass-card p-5 relative group flex items-start gap-4">
                  <button 
                    onClick={() => handleDeleteApp(app.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </button>
                  {app.icon_url?.startsWith('http') ? (
                    <img src={app.icon_url} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
                  ) : (
                    <div className="w-16 h-16 min-w-[64px] rounded-2xl flex items-center justify-center bg-slate-800 shadow-lg text-4xl">
                      {app.icon_url}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-slate-50">{app.name}</h3>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{app.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {app.link_web && <a href={app.link_web} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Web</a>}
                      {app.link_apk && <a href={app.link_apk} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded">APK</a>}
                      {app.link_desktop && <a href={app.link_desktop} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Desktop</a>}
                    </div>
                  </div>
                </div>
              ))}
              
              <div 
                onClick={() => setShowAppModal(true)}
                className="glass-card p-5 flex flex-col items-center justify-center min-h-[120px] border-2 border-dashed border-slate-700 hover:border-orange-500/50 cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 bg-slate-800 group-hover:bg-orange-500/20 rounded-full flex items-center justify-center text-slate-400 group-hover:text-orange-400 mb-2 transition-colors">
                  <Plus size={24} />
                </div>
                <span className="font-medium text-slate-300">Novo App no Menu</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Novo App */}
        {showAppModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-slate-50 mb-6 flex items-center gap-2">
                <Plus size={20} className="text-orange-500" />
                Novo App no Ecossistema
              </h2>
              <form onSubmit={handleCreateApp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nome do App *</label>
                  <input type="text" required value={newApp.name} onChange={e => setNewApp({...newApp, name: e.target.value})} className="w-full glass-input !py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Ícone (Emoji ou Link de Imagem) *</label>
                  <input type="text" required value={newApp.icon_url} onChange={e => setNewApp({...newApp, icon_url: e.target.value})} className="w-full glass-input !py-2" placeholder="Ex: 📚 ou https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                  <input type="text" value={newApp.description} onChange={e => setNewApp({...newApp, description: e.target.value})} className="w-full glass-input !py-2" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Link Web</label>
                    <input type="url" value={newApp.link_web} onChange={e => setNewApp({...newApp, link_web: e.target.value})} className="w-full glass-input !rounded-lg !px-2 !py-1 !text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Link APK</label>
                    <input type="url" value={newApp.link_apk} onChange={e => setNewApp({...newApp, link_apk: e.target.value})} className="w-full glass-input !rounded-lg !px-2 !py-1 !text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Link Desktop</label>
                    <input type="url" value={newApp.link_desktop} onChange={e => setNewApp({...newApp, link_desktop: e.target.value})} className="w-full glass-input !rounded-lg !px-2 !py-1 !text-xs" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAppModal(false)} className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-50 font-medium rounded-xl transition">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition">Salvar App</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab: Leads */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-50">Contatos Coletados ({leads.length})</h2>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold transition-colors"
              >
                <Download size={18} />
                Exportar CSV
              </button>
            </div>
            
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/50 border-b border-slate-700/50">
                      <th className="p-4 font-medium text-slate-300">Nome</th>
                      <th className="p-4 font-medium text-slate-300">E-mail</th>
                      <th className="p-4 font-medium text-slate-300">WhatsApp</th>
                      <th className="p-4 font-medium text-slate-300">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr key={lead.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 text-slate-200 font-medium">{lead.name}</td>
                        <td className="p-4 text-sm text-slate-400">{lead.email}</td>
                        <td className="p-4 text-sm text-emerald-400 font-medium">{lead.whatsapp}</td>
                        <td className="p-4 text-sm text-slate-500">{new Date(lead.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-slate-500">Nenhum contato coletado ainda.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
