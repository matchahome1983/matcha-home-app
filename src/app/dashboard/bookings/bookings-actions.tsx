'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BookingActions({ bookingId, status }: { bookingId: string; status: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function cancel() {
    if (!confirm('Cancel this booking?')) return
    setLoading(true)
    const { data } = await supabase.rpc('cancel_booking', { booking_id: bookingId })
    setLoading(false)
    alert(data ? `Cancelled. Fee: $${data}` : 'Cancelled')
    router.refresh()
  }

  async function complete() {
    setLoading(true)
    await supabase.rpc('mark_booking_completed', { booking_id: bookingId })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-2 mt-4">
      {status === 'accepted' && (
        <button
          onClick={complete}
          disabled={loading}
          className="bg-[#7a9e6a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5c7d4e] disabled:opacity-50"
        >
          Mark Completed
        </button>
      )}
      <button
        onClick={cancel}
        disabled={loading}
        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  )
}