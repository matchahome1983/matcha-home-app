'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const shortDays: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
  Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
}

type Slot = {
  day_of_week: string
  start_time: string
  end_time: string
}

interface Props {
  proId: string
  availability: Slot[]
  availableNow?: boolean
  city?: string
}

function parseTime(t: string) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

function formatTime(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function AvailabilityCalendar({ proId, availability, availableNow, city }: Props) {
  const [selectedDate, setSelectedDate] = useState('')
  const [customTime, setCustomTime] = useState('')
  const router = useRouter()

  const grouped = useMemo(() => {
    const g: Record<string, Slot[]> = {}
    dayOrder.forEach(d => { g[d] = [] })
    availability?.forEach(slot => {
      const day = slot.day_of_week
      if (g[day]) g[day].push(slot)
    })
    return g
  }, [availability])

  const hasAnyAvailability = Object.values(grouped).some(slots => slots.length > 0)

  const nextBlocks = useMemo(() => {
    const blocks: { label: string; date: string; time: string }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 21 && blocks.length < 6; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const dayName = dayOrder[(d.getDay() + 6) % 7]
      const slots = grouped[dayName] || []

      slots.forEach(slot => {
        const start = parseTime(slot.start_time)
        const end = parseTime(slot.end_time)
        for (let t = start; t + 180 <= end && blocks.length < 6; t += 60) {
          const dateStr = d.toISOString().slice(0, 10)
          const timeStr = formatTime(t)
          if (!blocks.some(b => b.date === dateStr && b.time === timeStr)) {
            blocks.push({
              label: `${shortDays[dayName]} ${d.getDate()} · ${timeStr}`,
              date: dateStr,
              time: timeStr,
            })
          }
        }
      })
    }
    return blocks
  }, [grouped])

  function goToBooking(date: string, time: string, isNow = false) {
    const params = new URLSearchParams({
      proId,
      date,
      time,
      ...(isNow ? { now: '1' } : {}),
    })
    router.push(`/dashboard/book?${params.toString()}`)
  }

  const approxEta = city ? `~20–40 min in ${city}` : '~20–40 min'

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3] mb-6">
      <h2 className="font-semibold text-[#2c2c2c] mb-4">Availability</h2>

      {!hasAnyAvailability && (
        <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-50 rounded-xl">
          No availability set yet.
        </div>
      )}

      <div className="space-y-3 mb-6">
        {dayOrder.map(day => (
          <div key={day} className="flex items-start gap-3">
            <div className="w-10 text-sm font-medium text-gray-500 pt-1.5">{shortDays[day]}</div>
            <div className="flex-1 flex flex-wrap gap-2">
              {grouped[day].length > 0 ? (
                grouped[day].map((slot, i) => (
                  <span key={i} className="bg-[#f0f7ed] text-[#5c7d4e] text-sm px-3 py-1.5 rounded-lg">
                    {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400 py-1.5">Unavailable</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {availableNow && (
        <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-800">Available now</p>
              <p className="text-sm text-green-700">Approx arrival {approxEta}</p>
            </div>
            <button
              onClick={() => {
                const now = new Date()
                const time = formatTime(now.getHours() * 60 + now.getMinutes() + 30)
                goToBooking(now.toISOString().slice(0, 10), time, true)
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              Book now
            </button>
          </div>
        </div>
      )}

      {nextBlocks.length > 0 && (
        <div className="mb-5">
          <p className="text-sm font-medium mb-2">Next available 3-hour blocks</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {nextBlocks.map((b, i) => (
              <button
                key={i}
                onClick={() => goToBooking(b.date, b.time)}
                className="text-left border border-[#f0ebe3] rounded-xl px-3 py-2.5 text-sm hover:bg-[#f0f7ed]"
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-[#f0ebe3] pt-5">
        <p className="text-sm font-medium mb-3">Or choose a custom time</p>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          className="border border-[#f0ebe3] rounded-xl px-3 py-2.5 text-sm w-full mb-3"
        />
        {selectedDate && (
          <div className="flex gap-2">
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="flex-1 border border-[#f0ebe3] rounded-xl px-3 py-2.5 text-sm"
            />
            <button
              onClick={() => customTime && goToBooking(selectedDate, customTime)}
              disabled={!customTime}
              className="bg-[#5c7d4e] text-white px-5 rounded-xl text-sm font-medium disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}