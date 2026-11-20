'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AvailabilityCalendar({ proId }: { proId: string }) {
  const [customDate, setCustomDate] = useState('')
  const [customTime, setCustomTime] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const blocks = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM']

  // Next 4 days
  const upcoming = Array.from({ length: 4 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return d
  })

  async function book(date: Date, time: string) {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [hours, minutes] = time.replace(' AM', '').replace(' PM', '').split(':')
    let h = parseInt(hours)
    if (time.includes('PM') && h !== 12) h += 12
    if (time.includes('AM') && h === 12) h = 0

    const start = new Date(date)
    start.setHours(h, parseInt(minutes), 0, 0)

    await supabase.from('bookings').insert({
      client_id: user.id,
      pro_id: proId,
      status: 'pending',
      start_time: start.toISOString(),
      notes: `Booked for ${date.toLocaleDateString()} at ${time}`,
    })

    setLoading(false)
    router.push('/dashboard/bookings')
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3] mb-6">
      <h2 className="font-semibold text-[#2c2c2c] mb-1">Book a time</h2>
      <p className="text-sm text-gray-500 mb-4">Next available 3-hour blocks</p>

      <div className="space-y-4 mb-6">
        {upcoming.map((date) => (
          <div key={date.toISOString()}>
            <p className="text-sm font-medium text-[#2c2c2c] mb-2">
              {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {blocks.map((time) => (
                <button
                  key={time}
                  onClick={() => book(date, time)}
                  disabled={loading}
                  className="border border-[#f0ebe3] rounded-xl py-2.5 text-sm hover:bg-[#f0f7ed] disabled:opacity-50"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#f0ebe3] pt-5">
        <p className="text-xs text-gray-500 mb-2">Or pick a custom date & time</p>
        <div className="flex gap-2">
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="flex-1 border border-[#f0ebe3] rounded-xl px-3 py-2.5 text-sm"
          />
          <input
            type="time"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            className="flex-1 border border-[#f0ebe3] rounded-xl px-3 py-2.5 text-sm"
          />
          <button
            onClick={() => {
              if (customDate && customTime) {
                const d = new Date(customDate)
                book(d, customTime)
              }
            }}
            disabled={loading || !customDate || !customTime}
            className="bg-[#5c7d4e] text-white px-4 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  )
}