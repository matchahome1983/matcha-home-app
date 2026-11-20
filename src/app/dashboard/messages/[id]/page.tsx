import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Conversation from './conversation'

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: other } = await supabase.from('profiles').select('full_name').eq('id', id).single()
  if (!other) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true })

  return (
    <Conversation
      initialMessages={messages || []}
      otherId={id}
      otherName={other.full_name}
      currentUserId={user.id}
    />
  )
}