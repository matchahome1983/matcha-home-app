'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BookingRequestForm({ proId }: { proId: string }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(2)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [availability, setAvailability] = useState<any[]>([])
  const [availableNow, setAvailableNow] = useState(false)
  const [proName, setProName] = useState('')
  const [hourlyRate, setHourlyRate] = useState(0)
  const [conflict, setConflict] = useState(false)
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
        .select('available_now, full_name, hourly_rate')
        .eq('id', proId)
        .single()
      setAvailableNow(pro?.available_now || false)
      setProName(pro?.full_name || 'Pro')
      setHourlyRate(pro?.hourly_rate || 0)

      if (avail && avail.length > 0) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const availableDayNames = [...new Set(avail.map((a: any) => a.day_of_week))]
        const today = new Date()
        for (let i = 1; i <= 7; i++) {
          const check = new Date(today)
          check.setDate(today.getDate() + i)
          const dayName = days[check.getDay()]
          if (availableDayNames.includes(dayName)) {
            setDate(check.toISOString().split('T')[0])
            break
          }
        }
      }
    }
    load()
  }, [proId])

  const availableDays = [...new Set(availability.map((a) => a.day_of_week))]
  const estimatedTotal = hourlyRate * duration
  const commonTimes = ['09:00', '12:00', '15:00', '17:00']

  async function checkConflict(selectedDate: string, selectedTime: string) {
    if (!selectedDate || !selectedTime) {
      setConflict(false)
      return
    }
    const start = new Date(`${selectedDate}T${selectedTime}`)
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000)

    const { data } = await supabase
      .from('bookings')
      .select('id')
      .eq('pro_id', proId)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', start.toISOString())
      .lt('start_time', end.toISOString())

    setConflict(!!(data && data.length > 0))
  }

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
      notes: `${notes}\n\nDuration: ${duration} hours`.trim(),
      status: availableNow ? 'confirmed' : 'pending',
    })

    if (!error) {
      // Send confirmation email
      await supabase.functions.invoke('send-booking-email', {
        body: {
          to: user.email,
          subject: availableNow ? 'Booking Confirmed – Matcha Home' : 'Booking Request Sent – Matcha Home',
          html: `
            <div style="font-family: sans-serif; max-width: 500px;">
              <h2>${availableNow ? 'You’re booked!' : 'Request sent'}</h2>
              <p><strong>Pro:</strong> ${proName}</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${time}</p>
              <p><strong>Duration:</strong> ${duration} hours</p>
              ${estimatedTotal > 0 ? `<p><strong>Estimated total:</strong> $${estimatedTotal}</p>` : ''}
              <p style="margin-top: 20px; color: #666;">
                ${availableNow 
                  ? 'Your booking is confirmed. You can message the Pro in the app to coordinate details.' 
                  : 'The Pro will review your request. Check My Bookings for updates.'}
              </p>
            </div>
          `,
        },
      })
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-sm">
        <p className="font-semibold text-green-800 text-base mb-3">
          {availableNow ? 'You’re booked!' : 'Request sent'}
        </p>

        <div className="text-green-700 space-y-1 mb-4">
          <p><span className="font-medium">Pro:</span> {proName}</p>
          <p><span className="font-medium">Date:</span> {date ? new Date(date).toLocaleDateString() : ''}</p>
          <p><span className="font-medium">Time:</span> {time}</p>
          <p><span className="font-medium">Duration:</span> {duration} hours</p>
          {estimatedTotal > 0 && <p><span className="font-medium">Estimated total:</span> ${estimatedTotal}</p>}
        </div>

        <div className="bg-white/60 rounded-lg p-3 text-green-800 mb-4">
          {availableNow ? (
            <p>Your booking is confirmed. You can message the Pro anytime to coordinate details.</p>
          ) : (
            <p>The Pro will review your request. You’ll see the status update in My Bookings.</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/dashboard/bookings')}
            className="bg-[#5c7d4e] text-white px-4 py-3 rounded-xl text-sm font-medium"
          >
            View Bookings
          </button>
          <button
            onClick={() => router.push(`/dashboard/messages/${proId}`)}
            className="border border-[#5c7d4e] text-[#5c7d4e] px-4 py-3 rounded-xl text-sm font-medium"
          >
            Message Pro
          </button>
        </div>
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
                    isAvailable ? 'bg-[#f0f7ed] text-[#5c7d4e]' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {day.slice(0, 3)}
                </span>
              )
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              checkConflict(e.target.value, time)
            }}
            required
            className="flex-1 border border-[#f0ebe3] rounded-xl px-4 py-3 text-base"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value)
              checkConflict(date, e.target.value)
            }}
            required
            className="flex-1 border border-[#f0ebe3] rounded-xl px-4 py-3 text-base"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-[#2c2c2c] mb-2">Quick times</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {commonTimes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTime(t)
                  checkConflict(date, t)
                }}
                className={`py-3 rounded-xl text-base font-medium ${
                  time === t ? 'bg-[#5c7d4e] text-white' : 'border border-[#f0ebe3] text-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[#2c2c2c] block mb-2">Duration</label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((hrs) => (
            <button
              key={hrs}
              type="button"
              onClick={() => setDuration(hrs)}
              className={`py-3 rounded-xl text-base ${
                duration === hrs ? 'bg-[#5c7d4e] text-white' : 'border border-[#f0ebe3] text-gray-600'
              }`}
            >
              {hrs} hr{hrs > 1 ? 's' : ''}
            </button>
          ))}
        </div>
        {estimatedTotal > 0 && (
          <p className="text-sm text-gray-500 mt-2">Estimated total: ${estimatedTotal}</p>
        )}
      </div>

      {conflict && (
        <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-xl">
          This Pro may already have a booking around this time. You can still request it.
        </div>
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="What do you need help with?"
        rows={2}
        className="w-full border border-[#f0ebe3] rounded-xl px-4 py-3 text-base"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#5c7d4e] text-white py-3.5 rounded-xl text-base font-medium disabled:opacity-50"
      >
        {loading ? 'Sending...' : availableNow ? 'Book Now' : 'Request Booking'}
      </button>
    </form>
  )
}