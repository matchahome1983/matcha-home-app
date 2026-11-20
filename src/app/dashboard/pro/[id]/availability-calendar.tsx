'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const shortDays: Record<string, string> = {
  Sunday: 'Sun', Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
  Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat',
}

export default function AvailabilityCalendar({ proId, availability }: { proId: string; availability: any[] }) {
  const [selectedDate, setSelectedDate] = useState('')
  const [customTime, setCustomTime] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const grouped: Record<string, any[]> = {}
  dayOrder.forEach(d => { grouped[d] = [] })
  availability.forEach(slot => {
    if (grouped[slot.day_of_week]) grouped[slot.day_of_week].push(slot)
  })

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
      <h2 className="font-semibold text-[#2c2c2c] mb-4">Availability</h2>

      <div className="space-y-3 mb-6">
        {dayOrder.map(day => (
          <div key={day} className="flex items-start gap-3">
            <div className="w-10 text-sm font-medium text-gray-500 pt-1.5">{shortDays[day]}</div>
            <div className="flex-1 flex flex-wrap gap-2">
              {grouped[day].length > 0 ? (
                grouped[day].map((slot, i) => (
                  <span key={i} className="bg-[#f0f7ed] text-[#5c7d4e] text-sm px-3 py-1.5 rounded-lg">
                    {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400 py-1.5">Unavailable</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#f0ebe3] pt-5">
        <p className="text-sm font-medium mb-3">Book a time</p>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-[#f0ebe3] rounded-xl px-3 py-2.5 text-sm w-full mb-4"
        />

        {selectedDate && (
          <>
            <p className="text-xs text-gray-500 mb-2">Quick 3-hour blocks</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
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

            <p className="text-xs text-gray-500 mb-2">Or pick a custom time</p>
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
                className="bg-[#5c7d4e] text-white px-4 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                Book
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}