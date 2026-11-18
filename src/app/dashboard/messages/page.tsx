'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [recipientId, setRecipientId] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function loadMessages() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(50)

    setMessages(data || [])
  }

  useEffect(() => {
    loadMessages()

    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        loadMessages()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || !recipientId.trim()) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: canSend } = await supabase.rpc('can_send_message', { sender: user.id })
    if (!canSend) {
      alert('Message limit reached')
      setLoading(false)
      return
    }

    await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: recipientId.trim(),
      content: content.trim()
    })

    setContent('')
    setLoading(false)
    loadMessages()
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-[#5c7d4e] mb-6">Messages</h1>

      <form onSubmit={sendMessage} className="bg-white rounded-xl p-5 shadow-sm mb-8">
        <input
          type="text"
          placeholder="Recipient user ID"
          value={recipientId}
          onChange={e => setRecipientId(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-3"
        />
        <textarea
          placeholder="Message"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-3"
          rows={3}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#7a9e6a] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#5c7d4e] disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>

      <div className="space-y-3">
        {messages.map(m => (
          <div key={m.id} className="bg-white rounded-xl p-4 shadow-sm border border-[#e8e0d5]">
            <p className="text-sm text-gray-500 mb-1">
              {new Date(m.created_at).toLocaleString()}
            </p>
            <p>{m.content}</p>
          </div>
        ))}
        {messages.length === 0 && <p className="text-gray-500">No messages yet.</p>}
      </div>
    </div>
  )
}