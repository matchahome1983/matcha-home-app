import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get unique conversations (people the user has messaged)
  const { data: messages } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      sender_id,
      receiver_id,
      sender:profiles!messages_sender_id_fkey(full_name),
      receiver:profiles!messages_receiver_id_fkey(full_name)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // Group into conversations
  const conversations = new Map()

  messages?.forEach((msg: any) => {
    const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
    const otherName = msg.sender_id === user.id ? msg.receiver?.full_name : msg.sender?.full_name

    if (!conversations.has(otherId)) {
      conversations.set(otherId, {
        id: otherId,
        name: otherName || 'User',
        lastMessage: msg.content,
        lastMessageAt: msg.created_at,
      })
    }
  })

  const conversationList = Array.from(conversations.values())

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#2c2c2c]">Messages</h1>
        <p className="text-gray-500 mt-1">Your conversations with Pros and clients</p>
      </div>

      {conversationList.length > 0 ? (
        <div className="space-y-3">
          {conversationList.map((convo) => (
            <Link
              key={convo.id}
              href={`/dashboard/messages/${convo.id}`}
              className="block bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3] hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f0f7ed] flex items-center justify-center text-sm font-medium text-[#5c7d4e]">
                    {convo.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-[#2c2c2c]">{convo.name}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs mt-0.5">
                      {convo.lastMessage}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(convo.lastMessageAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#f0ebe3]">
          <p className="text-gray-500">No messages yet.</p>
          <p className="text-sm text-gray-400 mt-1">Start a conversation from a Pro’s profile.</p>
        </div>
      )}
    </div>
  )
}