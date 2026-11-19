'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AddToCircleButton({ proId }: { proId: string }) {
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleAdd() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase.from('circles').insert({
        client_id: user.id,
        pro_id: proId,
      })

      if (!error) setAdded(true)
      else console.error(error)
    }
    setLoading(false)
  }

  if (added) {
    return <span className="text-sm text-[#5c7d4e]">Added to Circle</span>
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="border border-[#5c7d4e] text-[#5c7d4e] px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#f0f7ed] disabled:opacity-50"
    >
      {loading ? 'Adding...' : 'Add to Circle'}
    </button>
  )
}