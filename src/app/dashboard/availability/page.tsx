'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<any[]>([])
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadAvailability()
  }, [])

  async function loadAvailability() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('availability')
      .select('*')
      .eq('pro_id', user.id)
      .order('day_of_week')

    setSlots(data || [])
  }

  function toggleDay(day: string) {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  async function addSlots() {
    if (selectedDays.length === 0) {
      setMessage('Select at least one day')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newSlots = selectedDays.map(day => ({
      pro_id: user.id,
      day_of_week: day,
      start_time: startTime,
      end_time: endTime,
    }))

    const { error } = await supabase.from('availability').insert(newSlots)

    if (error) {
      setMessage('Error adding availability')
    } else {
      setMessage('Availability added')
      setSelectedDays([])
      loadAvailability()
    }
    setLoading(false)
  }

  async function deleteSlot(id: string) {
    await supabase.from('availability').delete().eq('id', id)
    loadAvailability()
  }

  async function clearAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('availability').delete().eq('pro_id', user.id)
    setSlots([])
    setMessage('All availability cleared')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-6">Availability</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] mb-6">
        <h2 className="font-medium text-[#2c2c2c] mb-4">Add multiple days</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {days.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`px-4 py-2 rounded-full text-sm ${
                selectedDays.includes(day)
                  ? 'bg-[#5c7d4e] text-white'
                  : 'border border-[#f0ebe3]'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="text-sm text-gray-600 block mb-1">Start</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-gray-600 block mb-1">End</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          onClick={addSlots}
          disabled={loading}
          className="bg-[#5c7d4e] text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add selected days'}
        </button>

        {message && <p className="text-sm text-gray-600 mt-3">{message}</p>}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-[#2c2c2c]">Current availability</h2>
          {slots.length > 0 && (
            <button onClick={clearAll} className="text-sm text-red-600 hover:underline">
              Clear all
            </button>
          )}
        </div>

        {slots.length > 0 ? (
          <div className="space-y-2">
            {slots.map(slot => (
              <div key={slot.id} className="flex items-center justify-between py-2 border-b border-[#f0ebe3] last:border-0">
                <span className="text-sm">
                  {slot.day_of_week} · {slot.start_time} – {slot.end_time}
                </span>
                <button
                  onClick={() => deleteSlot(slot.id)}
                  className="text-xs text-gray-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No availability set yet.</p>
        )}
      </div>
    </div>
  )
}