'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function FeeButton({ bookingId, collected }: { bookingId: string; collected: boolean }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    await supabase.from('bookings').update({ fee_collected: !collected }).eq('id', bookingId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="text-xs border border-[#f0ebe3] text-gray-700 px-3 py-1 rounded-xl mt-1 hover:bg-gray-50 disabled:opacity-50"
    >
      {collected ? 'Mark unpaid' : 'Mark fee collected'}
    </button>
  )
}