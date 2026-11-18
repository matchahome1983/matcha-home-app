'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ReviewForm({ bookingId, proId }: { bookingId: string; proId: string }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('ratings').insert({
      booking_id: bookingId,
      rater_id: user.id,
      ratee_id: proId,
      rating,
      comment: comment || null
    })

    if (error) {
      setMessage(error.message)
    } else {
      setSubmitted(true)
      setMessage('Review submitted')
    }
  }

  if (submitted) return <p className="text-sm text-green-700 mt-3">{message}</p>

  return (
    <form onSubmit={submit} className="mt-4 pt-4 border-t">
      <p className="text-sm font-medium mb-2">Leave a review</p>
      <select value={rating} onChange={e => setRating(Number(e.target.value))} className="border rounded px-2 py-1 text-sm mb-2">
        {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} stars</option>)}
      </select>
      <textarea
        placeholder="Comment (optional)"
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm mb-2"
        rows={2}
      />
      <button type="submit" className="bg-[#7a9e6a] text-white px-4 py-1.5 rounded text-sm hover:bg-[#5c7d4e]">
        Submit Review
      </button>
      {message && <p className="text-sm mt-1 text-gray-600">{message}</p>}
    </form>
  )
}