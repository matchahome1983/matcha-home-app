'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ReviewForm({ bookingId, proId }: { bookingId: string; proId: string }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function submit() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('reviews').insert({
      booking_id: bookingId,
      pro_id: proId,
      reviewer_id: user.id,
      rating,
      comment,
    })

    setLoading(false)
    if (error) {
      alert('Failed to submit review: ' + error.message)
    } else {
      setSubmitted(true)
      router.refresh()
    }
  }

  if (submitted) {
    return (
      <div className="bg-[#f0f7ed] rounded-xl p-5 text-center">
        <p className="font-medium text-[#5c7d4e] mb-1">Thank you for your review!</p>
        <p className="text-sm text-gray-600 mb-4">Your feedback is live and helps other families.</p>
        <button
          onClick={() => router.push('/dashboard/search')}
          className="bg-[#5c7d4e] text-white px-5 py-2.5 rounded-xl text-sm font-medium"
        >
          Book another Pro
        </button>
      </div>
    )
  }

  return (
    <div>
      <p className="font-medium mb-3">How was your experience?</p>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            className={`text-2xl ${n <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share a few details (optional)"
        className="w-full border border-[#f0ebe3] rounded-xl p-3 text-sm mb-3"
        rows={3}
      />
      <button
        onClick={submit}
        disabled={loading}
        className="bg-[#5c7d4e] text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Submitting…' : 'Submit review'}
      </button>
    </div>
  )
}