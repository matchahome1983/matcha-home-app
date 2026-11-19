'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ReviewForm({ bookingId, proId }: { bookingId: string; proId: string }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('reviews').insert({
        booking_id: bookingId,
        pro_id: proId,
        client_id: user.id,
        rating,
        comment: comment.trim() || null,
      })
      setSubmitted(true)
      router.refresh()
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <p className="text-sm text-green-700">Thanks for your review.</p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-medium text-[#2c2c2c]">Leave a review</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How did it go? (optional)"
        rows={2}
        className="w-full border border-[#f0ebe3] rounded-xl px-4 py-2.5 text-sm"
      />
      <button
        type="submit"
        disabled={loading || rating === 0}
        className="bg-[#5c7d4e] text-white text-sm px-4 py-2 rounded-xl disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}