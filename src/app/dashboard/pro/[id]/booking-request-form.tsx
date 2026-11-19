'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BookingRequestForm({ proId }: { proId: string }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()

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
      status: 'pending',
    })

    if (!error) {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/bookings'), 1500)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-green-50 text-green-800 text-sm p-4 rounded-xl">
        Request sent. Redirecting to your bookings...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
        {loading ? 'Sending...' : 'Request Booking'}
      </button>
    </form>
  )
}