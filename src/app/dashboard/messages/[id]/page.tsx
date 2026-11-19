import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Chat from './chat'

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: otherUserId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: otherUser } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', otherUserId)
    .single()

  if (!otherUser) notFound()

  // Mark messages as read
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('receiver_id', user.id)
    .eq('sender_id', otherUserId)
    .is('read_at', null)

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
      <div className="mb-4">
        <Link href="/dashboard/messages" className="text-sm text-[#5c7d4e] hover:underline">
          ← Back to messages
        </Link>
        <h1 className="text-xl font-semibold text-[#2c2c2c] mt-2">{otherUser.full_name}</h1>
      </div>

      <Chat 
        initialMessages={messages || []} 
        currentUserId={user.id} 
        otherUserId={otherUserId} 
      />
    </div>
  )
}