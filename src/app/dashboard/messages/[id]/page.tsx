import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import MessageForm from './message-form'

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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-[#2c2c2c] mb-4">{other.full_name}</h1>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#f0ebe3] min-h-[300px]">
        {messages && messages.length > 0 ? (
          messages.map((m: any) => (
            <div key={m.id} className={`mb-3 ${m.sender_id === user.id ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block px-3 py-2 rounded-xl text-sm ${
                m.sender_id === user.id ? 'bg-[#5c7d4e] text-white' : 'bg-gray-100'
              }`}>
                {m.content}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No messages yet. Start the conversation.</p>
        )}
      </div>
      <MessageForm receiverId={id} />
    </div>
  )
}