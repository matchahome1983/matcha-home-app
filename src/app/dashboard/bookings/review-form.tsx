'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ReviewForm({ bookingId, proId }: { bookingId: string; proId: string }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function submit() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('reviews').insert({
      booking_id: bookingId,
      client_id: user.id,
      pro_id: proId,
      rating,
      comment,
    })

    if (!error) {
      setSubmitted(true)
      router.refresh()
    }
    setLoading(false)
  }

  if (submitted) return <p className="text-sm text-green-700 mt-3">Review submitted. Thank you!</p>

  return (
    <div className="mt-3 space-y-2">
      <select
        value={rating}
        onChange={e => setRating(parseInt(e.target.value))}
        className="border border-[#f0ebe3] rounded-xl px-3 py-1.5 text-sm"
      >
        <option value={5}>5 — Excellent</option>
        <option value={4}>4 — Good</option>
        <option value={3}>3 — Okay</option>
        <option value={2}>2 — Poor</option>
        <option value={1}>1 — Bad</option>
      </select>
      <textarea
        placeholder="Optional comment"
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={2}
        className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
      />
      <button
        onClick={submit}
        disabled={loading}
        className="text-sm bg-[#5c7d4e] text-white px-4 py-1.5 rounded-xl disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Submit review'}
      </button>
    </div>
  )
}