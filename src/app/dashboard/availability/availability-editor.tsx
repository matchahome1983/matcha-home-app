'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function AvailabilityEditor({ existing, proId }: { existing: any[]; proId: string }) {
  const [slots, setSlots] = useState(existing)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  function addSlot(day: string) {
    setSlots([...slots, { day_of_week: day, start_time: '09:00', end_time: '17:00', pro_id: proId }])
  }

  function updateSlot(index: number, field: string, value: string) {
    const updated = [...slots]
    updated[index][field] = value
    setSlots(updated)
  }

  function removeSlot(index: number) {
    setSlots(slots.filter((_, i) => i !== index))
  }

  async function save() {
    setLoading(true)
    await supabase.from('availability').delete().eq('pro_id', proId)
    if (slots.length > 0) {
      await supabase.from('availability').insert(slots)
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3]">
      {days.map((day) => (
        <div key={day} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-[#2c2c2c]">{day}</h3>
            <button
              onClick={() => addSlot(day)}
              className="text-sm text-[#5c7d4e] hover:underline"
            >
              + Add hours
            </button>
          </div>

          {slots
            .map((slot, i) => ({ slot, i }))
            .filter(({ slot }) => slot.day_of_week === day)
            .map(({ slot, i }) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  type="time"
                  value={slot.start_time}
                  onChange={(e) => updateSlot(i, 'start_time', e.target.value)}
                  className="border border-[#f0ebe3] rounded-lg px-3 py-2 text-sm"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="time"
                  value={slot.end_time}
                  onChange={(e) => updateSlot(i, 'end_time', e.target.value)}
                  className="border border-[#f0ebe3] rounded-lg px-3 py-2 text-sm"
                />
                <button onClick={() => removeSlot(i)} className="text-red-500 text-sm ml-2">
                  Remove
                </button>
              </div>
            ))}
        </div>
      ))}

      <button
        onClick={save}
        disabled={loading}
        className="mt-4 bg-[#5c7d4e] text-white px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Availability'}
      </button>
    </div>
  )
}