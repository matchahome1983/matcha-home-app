'use client'

import { useState } from 'react'
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
  availability 
}: { 
  proId: string
  availableNow?: boolean
  availability?: any[]
}) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedBlock, setSelectedBlock] = useState<any>(null)
  const [showCustom, setShowCustom] = useState(false)
  const [customStart, setCustomStart] = useState('09:00')
  const [customDuration, setCustomDuration] = useState('2')
  const [notes, setNotes] = useState('')
  const [instantBook, setInstantBook] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  function getBlocksForDate(dateStr: string) {
    if (!availability || !dateStr) return []
    const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' })
    return availability.filter(a => a.day_of_week === dayName)
  }

  const blocks = getBlocksForDate(selectedDate)

  async function handleBook(block?: any) {
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let start: Date
    let end: Date

    if (block) {
      start = new Date(`${selectedDate}T${block.start_time}`)
      end = new Date(`${selectedDate}T${block.end_time}`)
    } else {
      start = new Date(`${selectedDate}T${customStart}`)
      end = new Date(start.getTime() + parseInt(customDuration) * 60 * 60 * 1000)
    }

    const status = instantBook && availableNow ? 'confirmed' : 'pending'

    const { data: inserted, error } = await supabase.from('bookings').insert({
      client_id: user.id,
      pro_id: proId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      notes,
      status,
    }).select().single()

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      router.push(`/dashboard/bookings/confirm?booking=${inserted.id}`)
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] mt-4">
      <h3 className="font-medium text-[#2c2c2c] mb-4">Request booking</h3>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Select a day</p>
        <div className="flex flex-wrap gap-2">
          {nextDays.map(d => {
            const label = new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            return (
              <button
                key={d}
                type="button"
                onClick={() => { setSelectedDate(d); setSelectedBlock(null); setShowCustom(false) }}
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  selectedDate === d 
                    ? 'bg-[#5c7d4e] text-white border-[#5c7d4e]' 
                    : 'border-[#f0ebe3] hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Available times</p>
          {blocks.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {blocks.map((b, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setSelectedBlock(b); setShowCustom(false) }}
                  className={`px-3 py-1.5 rounded-xl text-sm border ${
                    selectedBlock === b 
                      ? 'bg-[#5c7d4e] text-white border-[#5c7d4e]' 
                      : 'border-[#f0ebe3] hover:bg-gray-50'
                  }`}
                >
                  {formatTime(b.start_time)} – {formatTime(b.end_time)}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No set availability for this day.</p>
          )}

          <button
            type="button"
            onClick={() => { setShowCustom(true); setSelectedBlock(null) }}
            className="mt-3 text-sm text-[#5c7d4e] hover:underline"
          >
            Other time
          </button>
        </div>
      )}

      {showCustom && (
        <div className="space-y-3 mb-4">
          <input
            type="time"
            value={customStart}
            onChange={e => setCustomStart(e.target.value)}
            className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
          />
          <select
            value={customDuration}
            onChange={e => setCustomDuration(e.target.value)}
            className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
          >
            <option value="1">1 hour</option>
            <option value="2">2 hours</option>
            <option value="3">3 hours</option>
            <option value="4">4 hours</option>
          </select>
        </div>
      )}

      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={2}
        className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm mb-3"
      />

      {availableNow && (
        <label className="flex items-center gap-2 text-sm mb-3">
          <input
            type="checkbox"
            checked={instantBook}
            onChange={e => setInstantBook(e.target.checked)}
          />
          Book Now (instant confirmation)
        </label>
      )}

      <button
        type="button"
        disabled={loading || (!selectedBlock && !showCustom) || !selectedDate}
        onClick={() => handleBook(selectedBlock)}
        className="w-full bg-[#5c7d4e] text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send request'}
      </button>

      {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
    </div>
  )
}