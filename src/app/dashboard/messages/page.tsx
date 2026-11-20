export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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

  const conversations: Record<string, any> = {}
  messages?.forEach((m: any) => {
    const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id
    const otherName = m.sender_id === user.id ? m.receiver?.full_name : m.sender?.full_name
    if (!conversations[otherId]) {
      conversations[otherId] = { id: otherId, name: otherName, lastMessage: m.content, lastAt: m.created_at }
    }
  })

  const list = Object.values(conversations)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-6">Messages</h1>
      {list.length > 0 ? (
        <div className="space-y-2">
          {list.map((c: any) => (
            <Link key={c.id} href={`/dashboard/messages/${c.id}`} className="block bg-white rounded-xl p-4 shadow-sm border border-[#f0ebe3] hover:shadow-md">
              <div className="flex justify-between">
                <span className="font-medium">{c.name || 'Unknown'}</span>
                <span className="text-xs text-gray-400">{new Date(c.lastAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 truncate">{c.lastMessage}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No messages yet.</p>
      )}
    </div>
  )
}