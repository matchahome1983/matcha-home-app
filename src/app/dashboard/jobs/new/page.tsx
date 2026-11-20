'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewJobPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [hours, setHours] = useState('2')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('job_posts').insert({
      client_id: user.id,
      title,
      description,
      preferred_date: date,
      preferred_time: time,
      duration_hours: parseFloat(hours),
    })

    router.push('/dashboard/jobs')
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-6">Post a Job</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] space-y-4">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What do you need help with?"
          required
          className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
        />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Details"
          rows={3}
          className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
        />
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
        />
        <select
          value={hours}
          onChange={e => setHours(e.target.value)}
          className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
        >
          <option value="1">1 hour</option>
          <option value="2">2 hours</option>
          <option value="3">3 hours</option>
          <option value="4">4 hours</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#5c7d4e] text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post job'}
        </button>
      </form>
    </div>
  )
}