// src/hooks/useEmails.ts
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabase'



export function useEmails(folder) {
  const [emails, setEmails]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchEmails = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('folder', folder)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setEmails(data ?? [])
    setLoading(false)
  }, [folder])

  useEffect(() => {
    fetchEmails()

    // Realtime: novas mensagens chegam automaticamente
    const channel = supabase
      .channel(`emails:${folder}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emails', filter: `folder=eq.${folder}` },
        async (payload) => {
          fetchEmails()
          // Optional: Adicionar notificação web genérica aqui futuramente
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'emails', filter: `folder=eq.${folder}` },
        () => fetchEmails()
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'emails', filter: `folder=eq.${folder}` },
        () => fetchEmails()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [folder, fetchEmails])

  return { emails, loading, error, refetch: fetchEmails }
}

// ── Actions ────────────────────────────────────────────────

export async function markAsRead(id) {
  return supabase.from('emails').update({ is_read: true }).eq('id', id)
}

export async function moveToTrash(id) {
  return supabase.from('emails').update({ folder: 'trash' }).eq('id', id)
}

export async function toggleStar(id, current) {
  return supabase.from('emails').update({ is_starred: !current }).eq('id', id)
}

export async function sendEmail(payload) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // Get reduca email and name
  const { data: profile } = await supabase.from('profiles').select('name, reduca_email').eq('id', user.id).single()
  const senderName = profile?.name ?? 'Membro Reduca'
  const senderAddr = profile?.reduca_email

  if (!senderAddr) throw new Error('E-mail do Reduca não configurado. Por favor, recarregue a página.')

  // 1. Salva na pasta "enviados" do remetente
  const dbResult = await supabase.from('emails').insert({
    user_id:     user.id,
    folder:      'sent',
    sender_addr: senderAddr,
    sender_name: senderName,
    recipients:  payload.recipients,
    subject:     payload.subject,
    body:        payload.body,
    is_read:     true,
  })

  if (dbResult.error) throw dbResult.error

  return dbResult
}

export async function searchEmails(query) {
  return supabase
    .from('emails')
    .select('*')
    .textSearch('fts', query, { config: 'portuguese' })
    .order('created_at', { ascending: false })
}
