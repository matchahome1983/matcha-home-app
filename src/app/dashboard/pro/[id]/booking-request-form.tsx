'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BookingRequestForm({ proId }: { proId: string }) {
  const [date, setDate] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (start >= end) {
      setMessage('End time must be after start time')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('booking_requests').insert({
      client_id: user.id,
      pro_id: proId,
      requested_date: date,
      start_time: start,
      end_time: end,
      notes: notes || null
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Request sent!')
      setDate('')
      setStart('')
      setEnd('')
      setNotes('')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="font-semibold mb-4">Request Booking</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full border rounded-lg px-3 py-2" />
        <div className="grid grid-cols-2 gap-3">
          <input type="time" value={start} onChange={e => setStart(e.target.value)} required className="border rounded-lg px-3 py-2" />
          <input type="time" value={end} onChange={e => setEnd(e.target.value)} required className="border rounded-lg px-3 py-2" />
        </div>
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          rows={3}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#7a9e6a] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#5c7d4e] disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </form>
      {message && <p className="text-sm mt-3 text-gray-700">{message}</p>}
      <p className="text-xs text-gray-500 mt-3">
        By sending this request you understand the Pro is an independent contractor. Payment is arranged directly with them.
      </p>
    </div>
  )
}