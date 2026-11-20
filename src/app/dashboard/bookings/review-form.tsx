'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BookingRequestForm({ proId, availableNow }: { proId: string; availableNow?: boolean }) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [duration, setDuration] = useState('2')
  const [notes, setNotes] = useState('')
  const [instantBook, setInstantBook] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const start = new Date(`${date}T${startTime}`)
    const end = new Date(start.getTime() + parseInt(duration) * 60 * 60 * 1000)

    const status = instantBook && availableNow ? 'confirmed' : 'pending'

    const { error } = await supabase.from('bookings').insert({
      client_id: user.id,
      pro_id: proId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      notes,
      status,
    })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      router.push(`/dashboard/bookings?sent=true&instant=${status === 'confirmed'}`)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] mt-4">
      <h3 className="font-medium text-[#2c2c2c] mb-4">Request booking</h3>
      <div className="space-y-3">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
          className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
        />
        <input
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
        />
        <select
          value={duration}
          onChange={e => setDuration(e.target.value)}
          className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
        >
          <option value="1">1 hour</option>
          <option value="2">2 hours</option>
          <option value="3">3 hours</option>
          <option value="4">4 hours</option>
        </select>
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
        />

        {availableNow && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={instantBook}
              onChange={e => setInstantBook(e.target.checked)}
            />
            Book Now (instant confirmation)
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#5c7d4e] text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Sending...' : instantBook ? 'Book Now' : 'Send request'}
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </form>
  )
}