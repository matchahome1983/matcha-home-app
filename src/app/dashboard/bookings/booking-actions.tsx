'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BookingActions({ bookingId, status }: { bookingId: string; status: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function updateStatus(newStatus: string) {
    setLoading(true)
    await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId)
    setLoading(false)
    router.refresh()
  }

  if (status === 'pending') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => updateStatus('confirmed')}
          disabled={loading}
          className="bg-[#5c7d4e] text-white text-sm px-4 py-2 rounded-xl disabled:opacity-50"
        >
          Accept
        </button>
        <button
          onClick={() => updateStatus('cancelled')}
          disabled={loading}
          className="border border-gray-300 text-sm px-4 py-2 rounded-xl disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    )
  }

  if (status === 'confirmed') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => updateStatus('completed')}
          disabled={loading}
          className="bg-[#5c7d4e] text-white text-sm px-4 py-2 rounded-xl disabled:opacity-50"
        >
          Mark Complete
        </button>
        <button
          onClick={() => updateStatus('cancelled')}
          disabled={loading}
          className="border border-gray-300 text-sm px-4 py-2 rounded-xl disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    )
  }

  return null
}