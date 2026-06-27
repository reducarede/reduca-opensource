import React from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Inbox, Send, FileText, Trash2, AlertOctagon, PenSquare } from 'lucide-react';

export function CorreioSidebar() {
  const { activeFolder, setActiveFolder, setComposeOpen } = useAppStore();

  const folders = [
    { id: 'inbox', label: 'Caixa de Entrada', icon: Inbox },
    { id: 'sent', label: 'Enviados', icon: Send },
    { id: 'drafts', label: 'Rascunhos', icon: FileText },
    { id: 'trash', label: 'Lixeira', icon: Trash2 },
    { id: 'spam', label: 'Spam', icon: AlertOctagon },
  ];

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => setComposeOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-orange-600/20"
      >
        <PenSquare className="w-5 h-5" />
        Nova Mensagem
      </button>

      <nav className="space-y-1">
        {folders.map((folder) => {
          const Icon = folder.icon;
          const isActive = activeFolder === folder.id;
          return (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(folder.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-orange-500/10 text-orange-500'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-slate-500'}`} />
              {folder.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
