'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function approxTravelMinutes(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const miles = R * c
  return Math.round(miles * 2.5) + 15
}

export default function InstantBook({ proId, initialAvailable, proLat, proLng, clientLat, clientLng }: any) {
  const [availableNow, setAvailableNow] = useState(initialAvailable)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const channel = supabase
      .channel('pro-availability')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${proId}` },
        (payload) => {
          setAvailableNow(payload.new.available_now)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [proId])

  if (!availableNow) return null

  const eta = (proLat && clientLat) ? approxTravelMinutes(proLat, proLng, clientLat, clientLng) : 30

  async function bookNow() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('bookings').insert({
      client_id: user.id,
      pro_id: proId,
      status: 'pending',
      start_time: new Date().toISOString(),
      notes: 'Instant Book',
      instant_book: true,
      platform_fee_percent: 10,
    })

    setLoading(false)
    router.push('/dashboard/bookings')
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] mb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold">Instant Book</p>
          <p className="text-sm text-gray-600">Can arrive in approximately {eta} minutes</p>
          <p className="text-xs text-gray-400 mt-1">Includes 10% convenience fee</p>
        </div>
        <button
          onClick={bookNow}
          disabled={loading}
          className="bg-[#5c7d4e] text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? 'Booking...' : 'Book Now'}
        </button>
      </div>
    </div>
  )
}