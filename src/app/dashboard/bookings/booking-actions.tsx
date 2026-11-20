'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BookingActions({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function updateStatus(status: string) {
    setLoading(true)
    await supabase.from('bookings').update({ status }).eq('id', bookingId)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={() => updateStatus('confirmed')}
        disabled={loading}
        className="text-sm bg-[#5c7d4e] text-white px-4 py-1.5 rounded-xl disabled:opacity-50"
      >
        Accept
      </button>
      <button
        onClick={() => updateStatus('cancelled')}
        disabled={loading}
        className="text-sm border border-red-200 text-red-700 px-4 py-1.5 rounded-xl disabled:opacity-50"
      >
        Decline
      </button>
    </div>
  )
}