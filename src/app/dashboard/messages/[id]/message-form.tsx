'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MessageForm({
  receiverId,
  onSent,
}: {
  receiverId: string
  onSent?: (msg: any) => void
}) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: content.trim(),
    }).select().single()

    if (!error && data) {
      setContent('')
      onSent?.(data)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSend} className="flex gap-2 mt-4">
      <input
        type="text"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 border border-[#f0ebe3] rounded-xl px-4 py-2.5 text-sm"
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="bg-[#5c7d4e] text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
      >
        Send
      </button>
    </form>
  )
}