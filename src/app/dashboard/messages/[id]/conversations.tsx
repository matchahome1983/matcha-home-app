'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import MessageForm from './message-form'

export default function Conversation({
  initialMessages,
  otherId,
  otherName,
  currentUserId,
}: {
  initialMessages: any[]
  otherId: string
  otherName: string
  currentUserId: string
}) {
  const [messages, setMessages] = useState(initialMessages)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    async function markRead() {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('receiver_id', currentUserId)
        .eq('sender_id', otherId)
        .is('read_at', null)
    }
    markRead()

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          if (payload.new.sender_id === otherId) {
            setMessages((prev) => [...prev, payload.new])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [otherId, currentUserId])

  function addMessage(msg: any) {
    setMessages((prev) => [...prev, msg])
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-[#2c2c2c] mb-4">{otherName}</h1>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#f0ebe3] min-h-[300px] max-h-[60vh] overflow-y-auto">
        {messages.length > 0 ? (
          messages.map((m: any) => (
            <div key={m.id} className={`mb-3 ${m.sender_id === currentUserId ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block px-3 py-2 rounded-xl text-sm ${
                m.sender_id === currentUserId ? 'bg-[#5c7d4e] text-white' : 'bg-gray-100'
              }`}>
                {m.content}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No messages yet. Start the conversation.</p>
        )}
        <div ref={bottomRef} />
      </div>
      <MessageForm receiverId={otherId} onSent={addMessage} />
    </div>
  )
}