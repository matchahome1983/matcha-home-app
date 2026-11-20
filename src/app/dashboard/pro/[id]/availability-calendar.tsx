'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AvailabilityCalendar({
  proId,
  availability,
}: {
  proId: string
  availability: { day_of_week: string; start_time: string }[]
}) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState<{ date: Date; time: string } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  // Build upcoming slots from the server-provided availability
  const slots: { date: Date; time: string }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' })

    availability
      .filter((s) => s.day_of_week === dayName)
      .forEach((s) => {
        slots.push({
          date: new Date(d),
          time: s.start_time.slice(0, 5),
        })
      })
  }

  const grouped = slots.reduce((acc: any, s) => {
    const key = s.date.toDateString()
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  async function confirmBook() {
    if (!confirm) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [h, m] = confirm.time.split(':').map(Number)
    const start = new Date(confirm.date)
    start.setHours(h, m, 0, 0)

    const { error } = await supabase.from('bookings').insert({
      client_id: user.id,
      pro_id: proId,
      status: 'pending',
      start_time: start.toISOString(),
    })

    if (error) alert(error.message)
    else router.push('/dashboard/bookings')

    setLoading(false)
    setConfirm(null)
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3] mb-6">
      <h2 className="font-semibold mb-1">Book a time</h2>
      <p className="text-sm text-gray-500 mb-4">Based on this Pro’s availability</p>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-gray-500">No availability set yet.</p>
      ) : (
        Object.entries(grouped).map(([dateStr, daySlots]: any) => (
          <div key={dateStr} className="mb-4">
            <p className="text-sm font-medium mb-2">
              {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {daySlots.map((slot: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setConfirm({ date: slot.date, time: slot.time })}
                  className="border border-[#f0ebe3] rounded-xl py-2.5 text-sm hover:bg-[#f0f7ed]"
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        ))
      )}

      {confirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold mb-2">Confirm booking</h3>
            <p className="text-sm text-gray-600 mb-5">
              {confirm.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {confirm.time}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 border rounded-xl py-2.5 text-sm">Cancel</button>
              <button
                onClick={confirmBook}
                disabled={loading}
                className="flex-1 bg-[#5c7d4e] text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Booking…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}