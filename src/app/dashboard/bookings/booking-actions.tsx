'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BookingActions({ bookingId, status }: { bookingId: string; status?: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function updateStatus(newStatus: string) {
    setLoading(true)
    await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)
    setLoading(false)
    router.refresh()
  }

  if (status === 'pending') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => updateStatus('confirmed')}
          disabled={loading}
          className="bg-[#5c7d4e] text-white px-3 py-1.5 rounded-lg text-xs disabled:opacity-50"
        >
          Confirm
        </button>
        <button
          onClick={() => updateStatus('cancelled')}
          disabled={loading}
          className="border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    )
  }

  if (status === 'confirmed') {
    return (
      <button
        onClick={() => updateStatus('completed')}
        disabled={loading}
        className="bg-[#5c7d4e] text-white px-3 py-1.5 rounded-lg text-xs disabled:opacity-50"
      >
        Mark complete
      </button>
    )
  }

  return null
}