'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BookingRequestForm({ proId }: { proId: string }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [availability, setAvailability] = useState<any[]>([])
  const [availableNow, setAvailableNow] = useState(false)
  const [proName, setProName] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: avail } = await supabase
        .from('availability')
        .select('*')
        .eq('pro_id', proId)
      setAvailability(avail || [])

      const { data: pro } = await supabase
        .from('profiles')
        .select('available_now, full_name')
        .eq('id', proId)
        .single()
      setAvailableNow(pro?.available_now || false)
      setProName(pro?.full_name || 'Pro')
    }
    load()
  }, [proId])

  const availableDays = [...new Set(availability.map((a) => a.day_of_week))]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const startTime = new Date(`${date}T${time}`).toISOString()

    const { error } = await supabase.from('bookings').insert({
      client_id: user.id,
      pro_id: proId,
      start_time: startTime,
      notes,
      status: availableNow ? 'confirmed' : 'pending',
    })

    if (!error) {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
        <p className="font-medium text-green-800 mb-2">
          {availableNow ? 'Booking confirmed!' : 'Request sent!'}
        </p>
        <div className="text-green-700 space-y-1">
          <p><span className="font-medium">Pro:</span> {proName}</p>
          <p><span className="font-medium">Date:</span> {new Date(`${date}T${time}`).toLocaleDateString()}</p>
          <p><span className="font-medium">Time:</span> {time}</p>
          {notes && <p><span className="font-medium">Notes:</span> {notes}</p>}
        </div>
        <button
          onClick={() => router.push('/dashboard/bookings')}
          className="mt-3 text-[#5c7d4e] font-medium hover:underline"
        >
          View your bookings →
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {availableNow && (
        <div className="bg-green-50 text-green-800 text-sm p-3 rounded-xl">
          This Pro is Available Now — your booking will be confirmed instantly.
        </div>
      )}

      {availableDays.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[#2c2c2c] mb-2">Available days</p>
          <div className="flex flex-wrap gap-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
              const isAvailable = availableDays.includes(day)
              return (
                <span
                  key={day}
                  className={`text-xs px-3 py-1.5 rounded-full ${
                    isAvailable
                      ? 'bg-[#f0f7ed] text-[#5c7d4e]'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {day.slice(0, 3)}
                </span>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="flex-1 border border-[#f0ebe3] rounded-xl px-4 py-2.5 text-sm"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className="flex-1 border border-[#f0ebe3] rounded-xl px-4 py-2.5 text-sm"
        />
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="What do you need help with?"
        rows={2}
        className="w-full border border-[#f0ebe3] rounded-xl px-4 py-2.5 text-sm"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-[#5c7d4e] text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Sending...' : availableNow ? 'Book Now' : 'Request Booking'}
      </button>
    </form>
  )
}