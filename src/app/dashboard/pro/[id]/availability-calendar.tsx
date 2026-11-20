'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AvailabilityCalendar({ proId }: { proId: string }) {
  const [selectedDate, setSelectedDate] = useState('')
  const [customTime, setCustomTime] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const blocks = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM']

  async function book(time: string) {
    if (!selectedDate || !time) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const start = new Date(`${selectedDate} ${time}`)
    await supabase.from('bookings').insert({
      client_id: user.id,
      pro_id: proId,
      status: 'pending',
      start_time: start.toISOString(),
      notes: `Booked for ${selectedDate} at ${time}`,
    })

    setLoading(false)
    router.push('/dashboard/bookings')
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3] mb-6">
      <h2 className="font-semibold text-[#2c2c2c] mb-1">Book a time</h2>
      <p className="text-sm text-gray-500 mb-4">Select a date, then choose a time</p>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="border border-[#f0ebe3] rounded-xl px-3 py-2.5 text-sm w-full mb-4"
      />

      {selectedDate && (
        <>
          <p className="text-xs text-gray-500 mb-2">Quick 3-hour blocks</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {blocks.map((time) => (
              <button
                key={time}
                onClick={() => book(time)}
                disabled={loading}
                className="border border-[#f0ebe3] rounded-xl py-3 text-sm hover:bg-[#f0f7ed] disabled:opacity-50"
              >
                {time}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 mb-2">Custom time</p>
          <div className="flex gap-2">
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="flex-1 border border-[#f0ebe3] rounded-xl px-3 py-2.5 text-sm"
            />
            <button
              onClick={() => book(customTime)}
              disabled={loading || !customTime}
              className="bg-[#5c7d4e] text-white px-5 rounded-xl text-sm font-medium disabled:opacity-50"
            >
              Book
            </button>
          </div>
        </>
      )}
    </div>
  )
}