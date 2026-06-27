import { useAppStore } from '../../hooks/useAppStore'
import { useEmails } from '../../hooks/useEmails'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Search, Loader2, Star, User } from 'lucide-react'

export function EmailList() {
  const { activeFolder, selectedEmail, setSelectedEmail, searchQuery, setSearchQuery } = useAppStore()
  const { emails, loading, error } = useEmails(activeFolder)

  // Client-side filtering as fallback or quick filter
  const filteredEmails = emails.filter((email) => 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    email.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.body.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 bg-slate-900 md:bg-transparent">
        <h2 className="text-xl font-bold capitalize mb-4 hidden md:block">
          {activeFolder === 'inbox' ? 'Caixa de Entrada' : activeFolder}
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar e-mails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/50 md:bg-slate-800/50 border border-slate-800 md:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all text-slate-200 placeholder-slate-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 text-red-400 text-sm text-center">Erro: {error}</div>
        ) : filteredEmails.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Nenhum e-mail encontrado.</div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {filteredEmails.map((email) => (
              <button
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`w-full text-left p-4 hover:bg-slate-800/50 transition-colors relative group ${
                  selectedEmail?.id === email.id ? 'bg-indigo-500/10 hover:bg-indigo-500/20' : ''
                }`}
              >
                {!email.is_read && activeFolder === 'inbox' && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
                )}
                
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                      <User className="w-3 h-3 text-slate-400" />
                    </div>
                    <span className={`text-sm truncate ${!email.is_read ? 'font-bold text-slate-100' : 'font-medium text-slate-300'}`}>
                      {email.sender_name}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                    {formatDistanceToNow(new Date(email.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
                
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 overflow-hidden">
                    <h3 className={`text-sm truncate mb-1 ${!email.is_read ? 'font-semibold text-slate-200' : 'text-slate-400'}`}>
                      {email.subject || '(Sem assunto)'}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {email.body.replace(/<[^>]*>?/gm, '')}
                    </p>
                  </div>
                  {email.is_starred && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0 mt-1" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
