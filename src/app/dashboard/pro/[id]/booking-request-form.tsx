'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function formatTime(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function BookingRequestForm({
  proId,
  availableNow,
  availability,
}: {
  proId: string
  availableNow: boolean
  availability: any[]
}) {
  const [selectedDay, setSelectedDay] = useState('')
  const [customDate, setCustomDate] = useState('')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [notes, setNotes] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookedSlots, setBookedSlots] = useState<any[]>([])
  const supabase = createClient()
  const router = useRouter()

  const upcomingDays = [...new Set(availability.map(a => a.day_of_week))].slice(0, 7)

  useEffect(() => {
    loadBooked()
  }, [])

  async function loadBooked() {
    const { data } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('pro_id', proId)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', new Date().toISOString())
    setBookedSlots(data || [])
  }

  function isBooked(date: string, start: string, end: string) {
    if (!date || !start || !end) return false
    const startDt = new Date(`${date}T${start}`)
    const endDt = new Date(`${date}T${end}`)
    return bookedSlots.some(b => {
      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)
      return startDt < bEnd && endDt > bStart
    })
  }

  async function submit() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let startTime: string
    let endTime: string

    if (customDate && customStart && customEnd) {
      if (isBooked(customDate, customStart, customEnd)) {
        alert('That time is already booked.')
        setLoading(false)
        return
      }
      startTime = new Date(`${customDate}T${customStart}`).toISOString()
      endTime = new Date(`${customDate}T${customEnd}`).toISOString()
    } else if (selectedDay) {
      const slot = availability.find(a => a.day_of_week === selectedDay)
      if (!slot) return
      const today = new Date()
      const dayIndex = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(selectedDay)
      const next = new Date(today)
      next.setDate(today.getDate() + ((dayIndex + 7 - today.getDay()) % 7 || 7))
      const dateStr = next.toISOString().split('T')[0]
      startTime = new Date(`${dateStr}T${slot.start_time}`).toISOString()
      endTime = new Date(`${dateStr}T${slot.end_time}`).toISOString()
    } else {
      setLoading(false)
      return
    }

    const { error } = await supabase.from('bookings').insert({
      client_id: user.id,
      pro_id: proId,
      start_time: startTime,
      end_time: endTime,
      notes,
      is_recurring: isRecurring,
      status: 'pending',
    })

    if (!error) {
      router.push('/dashboard/bookings?sent=true')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3]">
      <h2 className="font-semibold mb-4">Request booking</h2>

      {availability.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Available times</p>
          <div className="space-y-1 text-sm text-gray-500">
            {availability.slice(0, 6).map((slot, i) => (
              <p key={i}>
                {slot.day_of_week}: {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Or pick a quick day</p>
        <div className="flex flex-wrap gap-2">
          {upcomingDays.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => { setSelectedDay(day); setCustomDate(''); setCustomStart(''); setCustomEnd('') }}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                selectedDay === day
                  ? 'bg-[#5c7d4e] text-white border-[#5c7d4e]'
                  : 'border-[#f0ebe3] text-gray-700 hover:bg-gray-50'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 pt-2 border-t border-[#f0ebe3]">
        <p className="text-sm text-gray-600 mb-2">Or choose a custom date and time</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="date"
            value={customDate}
            onChange={e => { setCustomDate(e.target.value); setSelectedDay('') }}
            className="border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
          />
          <input
            type="time"
            value={customStart}
            onChange={e => setCustomStart(e.target.value)}
            className="border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
          />
          <input
            type="time"
            value={customEnd}
            onChange={e => setCustomEnd(e.target.value)}
            className="border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
          />
        </div>
        {customDate && customStart && customEnd && isBooked(customDate, customStart, customEnd) && (
          <p className="text-xs text-red-600 mt-2">This time is already booked.</p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm mb-3">
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={e => setIsRecurring(e.target.checked)}
        />
        Make this weekly
      </label>

      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={2}
        className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm mb-4"
      />

      <button
        onClick={submit}
        disabled={loading || (!selectedDay && !(customDate && customStart && customEnd)) || (customDate && isBooked(customDate, customStart, customEnd))}
        className="w-full bg-[#5c7d4e] text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send request'}
      </button>
    </div>
  )
}