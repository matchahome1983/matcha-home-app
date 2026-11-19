'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import MessageForm from './message-form'

export default function Chat({ 
  initialMessages, 
  currentUserId, 
  otherUserId 
}: { 
  initialMessages: any[]
  currentUserId: string
  otherUserId: string
}) {
  const [messages, setMessages] = useState(initialMessages)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId}))`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, otherUserId])

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#f0ebe3] p-4 space-y-3">
        {messages.length > 0 ? (
          messages.map((msg: any) => {
            const isMine = msg.sender_id === currentUserId
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
    </>
  )
}