'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AddToCircleButton({ proId }: { proId: string }) {
  const [status, setStatus] = useState('')
  const supabase = createClient()

  async function handleAdd() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('circle').insert({
      client_id: user.id,
      pro_id: proId
    })

    if (error?.code === '23505') {
      setStatus('Already in your Circle')
    } else if (error) {
      setStatus('Error adding')
    } else {
      setStatus('Added to Your Circle')
    }
  }

  return (
    <div>
      <button
        onClick={handleAdd}
        className="bg-[#7a9e6a] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#5c7d4e]"
      >
        Add to Circle
      </button>
      {status && <p className="text-sm mt-2 text-gray-600">{status}</p>}
    </div>
  )
}