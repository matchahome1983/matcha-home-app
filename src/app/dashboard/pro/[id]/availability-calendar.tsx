'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AvailabilityCalendar({ proId }: { proId: string }) {
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState<{ date: Date; time: string } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadAvailability()
  }, [proId])

  async function loadAvailability() {
    const { data } = await supabase
      .from('availability')
      .select('*')
      .eq('pro_id', proId)
      .order('day_of_week')

    if (data) {
      // Expand recurring slots into the next 14 days
      const upcoming: any[] = []
      const today = new Date()
      for (let i = 0; i < 14; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' })
        const matching = data.filter((s: any) => s.day_of_week === dayName)
        matching.forEach((s: any) => {
          upcoming.push({
            date: new Date(d),
            time: s.start_time,
            end: s.end_time,
          })
        })
      }
      setSlots(upcoming)
    }
  }

  async function confirmBook() {
    if (!confirm) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Not logged in')
      setLoading(false)
      return
    }

    const { date, time } = confirm
    const [hours, minutes] = time.split(':')
    let h = parseInt(hours)
    const start = new Date(date)
    start.setHours(h, parseInt(minutes), 0, 0)

    const { error } = await supabase.from('bookings').insert({
      client_id: user.id,
      pro_id: proId,
      status: 'pending',
      start_time: start.toISOString(),
      notes: `Booked for ${date.toLocaleDateString()} at ${time}`,
    })

    if (error) {
      alert('Booking failed: ' + error.message)
    } else {
      router.push('/dashboard/bookings')
    }

    setLoading(false)
    setConfirm(null)
  }

  // Group slots by date
  const grouped = slots.reduce((acc: any, slot) => {
    const key = slot.date.toDateString()
    if (!acc[key]) acc[key] = []
    acc[key].push(slot)
    return acc
  }, {})

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3] mb-6">
      <h2 className="font-semibold text-[#2c2c2c] mb-1">Book a time</h2>
      <p className="text-sm text-gray-500 mb-4">Based on this Pro’s availability</p>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-gray-500">No availability set yet.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([dateStr, daySlots]: any) => (
            <div key={dateStr}>
              <p className="text-sm font-medium text-[#2c2c2c] mb-2">
                {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {daySlots.map((slot: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setConfirm({ date: slot.date, time: slot.time })}
                    disabled={loading}
                    className="border border-[#f0ebe3] rounded-xl py-2.5 text-sm hover:bg-[#f0f7ed] disabled:opacity-50"
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Confirm booking</h3>
            <p className="text-sm text-gray-600 mb-5">
              Book for {confirm.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {confirm.time}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 border border-[#f0ebe3] rounded-xl py-2.5 text-sm"
              >
                Cancel
              </button>
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