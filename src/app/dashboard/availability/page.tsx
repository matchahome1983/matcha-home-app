'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AvailabilityPage() {
  const [availableNow, setAvailableNow] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  async function toggleAvailableNow() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const on = !availableNow
    await supabase.from('profiles').update({
      available_now: on,
      available_now_until: on ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() : null
    }).eq('id', user.id)

    setAvailableNow(on)
    setMessage(on ? 'You are Available Now for 2 hours' : 'Available Now turned off')
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-[#5c7d4e] mb-6">Availability</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm max-w-md">
        <button
          onClick={toggleAvailableNow}
          className={`px-5 py-3 rounded-lg font-medium ${availableNow ? 'bg-red-100 text-red-800' : 'bg-[#7a9e6a] text-white'}`}
        >
          {availableNow ? 'Turn Off Available Now' : 'Set Available Now (2 hrs)'}
        </button>
        {message && <p className="text-sm mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  )
}