'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MessageForm({ receiverId }: { receiverId: string }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
      })
      setContent('')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 border border-[#f0ebe3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c7d4e]/20"
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="bg-[#5c7d4e] text-white px-5 py-3 rounded-xl text-sm font-medium disabled:opacity-50"
      >
        Send
      </button>
    </form>
  )
}