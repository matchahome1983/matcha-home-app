'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CompleteButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function markComplete() {
    setLoading(true)
    await supabase.from('bookings').update({ status: 'completed' }).eq('id', bookingId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={markComplete}
      disabled={loading}
      className="text-sm bg-[#5c7d4e] text-white px-4 py-1.5 rounded-xl mt-3 disabled:opacity-50"
    >
      {loading ? 'Saving...' : 'Mark complete'}
    </button>
  )
}