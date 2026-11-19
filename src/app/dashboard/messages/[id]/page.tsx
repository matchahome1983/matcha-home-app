import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import MessageForm from './message-form'

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

      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#f0ebe3] p-4 space-y-3">
        {messages && messages.length > 0 ? (
          messages.map((msg: any) => {
            const isMine = msg.sender_id === user.id
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-[#5c7d4e] text-white'
                      : 'bg-[#f0f7ed] text-[#2c2c2c]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-center text-gray-400 text-sm py-8">No messages yet. Say hello.</p>
        )}
      </div>

      <div className="mt-4">
        <MessageForm receiverId={otherUserId} />
      </div>
    </div>
  )
}