'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RespondButtons({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function respond(status: 'accepted' | 'declined') {
    setLoading(true)
    await supabase.rpc('respond_to_booking', {
      booking_id: bookingId,
      new_status: status
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={() => respond('accepted')}
        disabled={loading}
        className="bg-[#7a9e6a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5c7d4e] disabled:opacity-50"
      >
        Accept
      </button>
      <button
        onClick={() => respond('declined')}
        disabled={loading}
        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 disabled:opacity-50"
      >
        Decline
      </button>
    </div>
  )
}